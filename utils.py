import cloudinary
import cloudinary.uploader
import cloudinary.api
import os
import logging
import string
import random
import asyncio
import hashlib
import time
import httpx

from werkzeug.datastructures import FileStorage
from domain.model import Image

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Cloudinary configuration
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)


def generate_unique_name(str_list: list[str], affix: str) -> str:
    str_len = 5
    random_name = affix + '-' + ''.join(random.choices(string.ascii_lowercase, k=str_len))
    while random_name in str_list:
        random_name = affix + '-' + ''.join(random.choices(string.ascii_lowercase, k=str_len))

    return random_name


class ImageUtil:
    def __init__(self, retries: int = 1) -> None:
        self.retries = retries

    async def async_upload_images(self, files: list[tuple], folder: str) -> list[dict]:
        async def upload(client: httpx.AsyncClient, file: tuple):
            cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
            api_key = os.getenv("CLOUDINARY_API_KEY")
            api_secret = os.getenv("CLOUDINARY_API_SECRET")
            timestamp = str(int(time.time()))

            # Build signature string
            params_to_sign = f"folder={folder}&public_id={file[0]}&timestamp={timestamp}{api_secret}"
            signature = hashlib.sha1(params_to_sign.encode("utf-8")).hexdigest()

            upload_url = f"https://api.cloudinary.com/v1_1/{cloud_name}/image/upload"
            data = {
                "api_key": api_key,
                "timestamp": timestamp,
                "public_id": file[0],
                "folder": folder,
                "signature": signature,
            }

            response = await client.post(upload_url, data=data, files={"file": file})
            response.raise_for_status()

            return response.json()

        attempt = 0
        while attempt < self.retries:
            try:
                logger.info(f"Uploading image to folder: {folder}")

                async with httpx.AsyncClient(timeout=httpx.Timeout(30.0)) as client:
                    tasks = [upload(client, file) for file in files]
                    responses = await asyncio.gather(*tasks)

                logger.info("Images uploaded successfully")

                return [
                    {
                        'url': response['secure_url'],
                        'filename': file[0],
                        'width': response['width'],
                        'height': response['height']
                    }
                    for file, response in zip(files, responses)
                ]
            except Exception as e:
                attempt += 1
                logger.warning(f"Upload attempt {attempt} failed: {e}")
                if not (attempt < self.retries):
                    logger.error(f"Failed to upload image after {self.retries} attempts.")
                    raise

    def upload_images(self, files: list[FileStorage], folder: str) -> list[dict]:
        return asyncio.run(self.async_upload_images(files, folder))

    async def async_fetch_images(self, urls: list[str]) -> list[httpx.Response]:
        async def fetch(client: httpx.AsyncClient, url: str) -> httpx.Response:
            response = await client.get(url)
            response.raise_for_status()

            return response

        attempt = 0
        while attempt < self.retries:
            try:
                logger.info(f"Fetching images")

                async with httpx.AsyncClient(timeout=httpx.Timeout(30.0)) as client:
                    tasks = [fetch(client, url) for url in urls]
                    responses = await asyncio.gather(*tasks)

                logger.info("Images uploaded successfully")

                return responses
            except Exception as e:
                attempt += 1
                logger.warning(f"Fetch attempt {attempt} failed: {e}")
                if not (attempt < self.retries):
                    logger.error(f"Failed to download images after {self.retries} attempts.")
                    raise

    def fetch_images(self, urls: str) -> list[httpx.Response]:
        return asyncio.run(self.async_fetch_images(urls))

    def delete_image(self, image: Image) -> None:
        attempt = 0
        while attempt < self.retries:
            try:
                public_id = image.url.rsplit('/', 2)[1:]
                public_id = public_id[0] + '/' + public_id[1].rsplit('.', 1)[0]

                logger.info(f"Deleting image: {public_id}")
                response = cloudinary.uploader.destroy(public_id)
                if response.get("result") == "ok":
                    logger.info(f"Image deleted successfully: {public_id}")
                    break
                else:
                    logger.warning(f"Unexpected response for {public_id}: {response}")
                    raise Exception('Unexpected response')
            except Exception as e:
                attempt += 1
                logger.warning(f"Attempt {attempt} failed for {public_id}: {e}")
                if not (attempt < self.retries):
                    logger.error(f"Failed to delete image {public_id} after {self.retries} attempts.")
                    raise

    def delete_all(self, folder: str) -> None:
        attempt = 0
        while attempt < self.retries:
            try:
                logger.info(f"Deleting images")
                response = cloudinary.api.delete_resources_by_prefix(folder + "/")
                print(response)
                if "deleted" in response:
                    logger.info("Images deleted successfully")
                    break
                else:
                    logger.warning("Unexpected response")
                    raise Exception('Unexpected response')
            except Exception as e:
                attempt += 1
                logger.warning(f"Attempt {attempt} failed")
                if not (attempt < self.retries):
                    logger.error(f"Failed to delete images after attempts.")
                    raise
