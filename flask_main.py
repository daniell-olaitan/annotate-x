import os
from dotenv import load_dotenv

load_dotenv()

import json
import requests
import zipfile

from io import BytesIO
from utils import ImageUtil, generate_unique_name
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError
from flask_app import create_app
from flask_app.services import require_login, fetch_project
from json import JSONDecodeError
from flask.typing import ResponseReturnValue
from flask import render_template, request, jsonify, session, g, redirect, url_for, send_file
from domain.model import Image, Project, Annotation, Category
from storage import (
    user_repo,
    project_repo,
    annotation_repo,
    image_repo,
    category_repo,
    get_db_session
)

app = create_app(os.getenv('CONFIG', 'default'))
img_util = ImageUtil()


@app.before_request
def load_logged_in_user():
    user_id = session.get('user_id')
    if user_id is None:
        g.user = None
    else:
        g.user = user_repo.get_by_id(user_id)


@app.route('/', methods=['GET'])
def index():
    if g.user is None:
        return redirect(url_for('auth.signin'))

    return render_template(
        'pages/project.html',
        username=g.user.username,
        project_id=None
    )


@app.route('/project/<string:id>', methods=['GET'])
@require_login
def fetch_project_id(id: str) -> ResponseReturnValue:
    if g.user is None:
        return redirect(url_for('auth.signin'))

    project = fetch_project(id)
    return render_template(
        'pages/project.html',
        username=g.user.username,
        project_id=project.id
    )


@app.route('/projects', methods=['POST'])
@require_login
def create_project() -> ResponseReturnValue:
    try:
        project_name = request.form['name'].upper()
        project = project_repo.get(project_name)
        if project:
            raise BadRequest('Project name already exist')

        project = Project(name=project_name)
        project_id = project_repo.add(project, g.user.id)

        ## Handle Categories (classes)
        # Make category names unique
        categories = {
            k.lower(): v
            for k, v in json.loads(request.form['classes']).items()
        }

        for name, color in categories.items():
            category = Category(name=name, color=color)
            _ = category_repo.add(category, project_id)

        # Upload Images
        image_names = []
        files = []

        for img in request.files.values():
            image_name = generate_unique_name(image_names, 'image')
            img.filename = image_name
            image_names.append(image_name)
            files.append((
                img.filename,
                img.stream,
                img.mimetype
            ))

        try:
            img_util.delete_all(project_name)
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


@app.route('/projects/<string:id>', methods=['GET'])
@require_login
def read_project(id: str) -> ResponseReturnValue:
    project = project_repo.get_with_relationships(id)
    if not project:
        raise NotFound('Project not found')

    return jsonify({
        'status': 'success',
        'data': project.to_dict()
    }), 200


@app.route('/projects', methods=['GET'])
@require_login
def read_projects() -> ResponseReturnValue:
    projects = [project.to_dict() for project in project_repo.list(g.user.id)]

    return jsonify({
        'status': 'success',
        'data': projects
    }), 200


@app.route('/projects/<string:id>', methods=['DELETE'])
@require_login
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


@app.route('/projects/<string:p_id>/images/<string:id>/annotations', methods=['POST'])
@require_login
def create_annotation(p_id: str, id: str) -> ResponseReturnValue:
    _ = fetch_project(p_id)
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
            category_name = a['category']['name'].lower()
            category = category_repo.get(category_name)
            if category:
                category_id = category.id
            else:
                category = Category(category_name, a['category']['color'])
                category_id = category_repo.add(category, p_id)

            _ = annotation_repo.add(annotation, image.id, category_id)
        get_db_session().commit()
    except KeyError:
        raise BadRequest('Invalid input')

    return jsonify({'status': 'success', 'data': {}}), 200


@app.route('/projects/<string:id>/images', methods=['POST'])
@require_login
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
        files.append((
            img.filename,
            img.stream,
            img.mimetype
        ))

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


@app.route('/images/<string:id>', methods=['DELETE'])
@require_login
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


@app.route('/export/<string:id>', methods=['GET'])
@require_login
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


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
