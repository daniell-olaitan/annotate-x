import cloudinary
import cloudinary.uploader
import cloudinary.api
import os
import logging
import string
import random

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


def generate_image_name(str_list: list[str], str_len: int = 5) -> str:
    random_string = 'image-' + ''.join(random.choices(string.ascii_lowercase, k=str_len))
    while random_string in str_list:
        random_string = 'image-' + ''.join(random.choices(string.ascii_lowercase, k=str_len))

    return random_string


class ImageUtil:
    def __init__(self, retries: int = 1) -> None:
        self.retries = retries

    def upload_image(self, file: FileStorage, folder: str) -> str:
        """
        Upload an image to Cloudinary to a specific folder with retry and error handling.

        Args:
            file (FileStorage): The image file to be uploaded
            folder (str): The folder where the image should be uploaded.

        Returns:
            str: public_id and secure_url of the image from Cloudinary on successful upload.
        """
        attempt = 0
        while attempt < self.retries:
            try:
                logger.info(f"Uploading image to folder: {folder}")
                response = cloudinary.uploader.upload(file, folder=folder, public_id=file.filename)

                logger.info(f"Image uploaded successfully: {response['public_id']}")
                return {
                    'url': response['secure_url'],
                    'filename': file.filename,
                    'width': response['width'],
                    'height': response['height']
                }

            except Exception as e:
                attempt += 1
                logger.warning(f"Upload attempt {attempt} failed: {e}")
                if not (attempt < self.retries):
                    logger.error(f"Failed to upload image after {self.retries} attempts.")
                    raise

    def delete_image(self, image: Image) -> None:
        """
        Delete a single image from Cloudinary by public ID with retry and error handling.

        Args:
            image (Image): The image to delete.
        """
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
        """
        Deletes all images in a specified Cloudinary folder using pagination, with logging and retry on failure.

        Args:
            folder (str): The folder containing images to delete.
        """
        attempt = 0
        while attempt < self.retries:
            try:
                logger.info(f"Deleting images")
                response = cloudinary.api.delete_resources_by_prefix(folder + "/")
                if response.get("deleted"):
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
