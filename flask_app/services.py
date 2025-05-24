import json
import requests
import zipfile

from functools import wraps
from typing import Callable, Any
from io import BytesIO
from utils import ImageUtil, generate_unique_name
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError, Unauthorized
from json import JSONDecodeError
from flask.typing import ResponseReturnValue
from flask import render_template, request, jsonify, g, redirect, url_for, send_file
from domain.model import Image, Project, Annotation, Category
from storage import (
    project_repo,
    annotation_repo,
    image_repo,
    category_repo,
    get_db_session
)

img_util = ImageUtil()


def require_login(f: Callable[..., Any]) -> Callable[..., Any]:
    @wraps(f)
    def decorated_function(*args: tuple, **kwargs: dict) -> Any:
        if g.user is None:
            raise Unauthorized('user is not signed in')

        return f(*args, **kwargs)

    return decorated_function


def fetch_project(id: str) -> Project:
    project = project_repo.get_by_id(id)
    if not project:
        raise NotFound('Invalid project id')

    return project


def index():
    if g.user is None:
        return redirect(url_for('auth.signin'))

    return render_template(
        'pages/project.html',
        username=g.user.username,
        project_id=None
    )


def fetch_project_id(id: str) -> ResponseReturnValue:
    if g.user is None:
        return redirect(url_for('auth.signin'))

    project = fetch_project(id)
    return render_template(
        'pages/project.html',
        username=g.user.username,
        project_id=project.id
    )


def create_project() -> ResponseReturnValue:
    try:
        project_name = request.form['name'].upper()
        project = project_repo.get(project_name)
        if project:
            raise BadRequest('Project name already exist')

        project = Project(name=project_name)
        project_id = project_repo.add(project, g.user.id)

        # Handle Categories (classes)
        categories = json.loads(request.form['classes'])
        for c in categories:
            category = Category(name=list(c.keys())[0], color=list(c.values())[0])
            _ = category_repo.add(category, project_id)

        # Upload Images
        image_names = []
        files = []

        for img in request.files.values():
            image_name = generate_unique_name(image_names, 'image')
            img.filename = image_name
            image_names.append(image_name)
            files.append(img)

        try:
            uploaded_imgs = img_util.upload_images(files, project_name)
        except Exception:
            raise InternalServerError('Network Error')

        for uploaded_img in uploaded_imgs:
            image = Image(**uploaded_img)
            _ = image_repo.add(image, project_id)

        get_db_session().commit()
    except (KeyError, JSONDecodeError):
        raise BadRequest('Invalid form input')

    project = project_repo.get_by_id(project_id)

    return jsonify({
        'status': 'success',
        'data': project.to_dict()
    }), 201


def read_project(id: str) -> ResponseReturnValue:
    project = project_repo.get_with_relationships(id)
    if not project:
        raise NotFound('Project not found')

    return jsonify({
        'status': 'success',
        'data': project.to_dict()
    }), 200


def read_projects() -> ResponseReturnValue:
    projects = [project.to_dict() for project in project_repo.list()]

    return jsonify({
        'status': 'success',
        'data': projects
    }), 200


def delete_project(id: str) -> ResponseReturnValue:
    project = fetch_project(id)
    if project is None:
        raise BadRequest('Project does not exist')

    try:
        img_util.delete_all(project.name)
    except Exception:
        raise InternalServerError('Network Error')

    project_repo.remove(project.id)
    get_db_session().commit()

    return jsonify({}), 200


def create_annotation(id: str) -> ResponseReturnValue:
    annotations = request.get_json()
    if annotations is None:
        raise BadRequest('Invalid input')

    image = image_repo.get_by_id(id)
    if not image:
        raise NotFound('Image not found')

    image_repo.remove_image_annotations(image.id)


    ## Handle Annotations
    try:
        for a in annotations:
            annotation = Annotation(a['x'], a['y'], a['width'], a['height'])
            category = category_repo.get(a['category']['name'])
            if not category:
                raise BadRequest('Invalid Input')

            _ = annotation_repo.add(annotation, image.id, category.id)
        get_db_session().commit()
    except KeyError:
        raise BadRequest('Invalid input')

    return jsonify({'status': 'success', 'data': {}}), 200


def add_project_images(id: str) -> ResponseReturnValue:
    project = fetch_project(id)

    # Upload Images
    images = []
    files = []
    image_names = project_repo.get_project_image_names(project.id)

    for img in request.files.values():
        image_name = generate_unique_name(image_names, 'image')
        img.filename = image_name
        image_names.append(image_name)
        files.append(img)

    try:
        uploaded_imgs = img_util.upload_images(files, project.name)
    except Exception:
        raise InternalServerError('Network Error')

    for uploaded_img in uploaded_imgs:
        image = Image(**uploaded_img)
        _ = image_repo.add(image, project.id)

        img = image.to_dict()
        img['annotations'] = []
        images.append(img)

    get_db_session().commit()

    return jsonify({
        'status': 'success',
        'data': images
    }), 201


def delete_image(id: str) -> ResponseReturnValue:
    image = image_repo.get_by_id(id)
    if not image:
        raise NotFound('Image not found')

    try:
        img_util.delete_image(image)
    except Exception:
        raise InternalServerError('Network Error')

    image_repo.remove(image.id)
    get_db_session().commit()

    return jsonify({'status': 'success', 'data': {}}), 200


def export_project(id: str) -> ResponseReturnValue:
    project = project_repo.export_project_data(id)
    if not project:
        raise NotFound('Project does not exist')

    project_name = project.pop('name')
    image_urls = project.pop('image_urls')

    try:
        responses = img_util.fetch_images(image_urls)
    except requests.RequestException:
        raise InternalServerError('Network Error')

    zip_buffer = BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', compression=zipfile.ZIP_DEFLATED) as zip_file:
        for img, response in zip(project['images'], responses):
            zip_file.writestr(f"images/{img['filename']}", response.content)

        project_str = json.dumps(project, indent=2)
        zip_file.writestr("annotations.json", project_str)

    zip_buffer.seek(0)

    return send_file(
        zip_buffer,
        mimetype='application/zip',
        as_attachment=True,
        download_name=f"{project_name}_annotations.zip"
    )
