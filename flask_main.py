import os
from dotenv import load_dotenv

load_dotenv()

import json
import cloudinary.uploader

from flask_app import create_app
from json import JSONDecodeError
# from flask_cors import CORS
from flask.typing import ResponseReturnValue
from flask import render_template, request, jsonify, abort

from domain.model import User, Image, Project, Annotation, Category
from storage import (
    db,
    user_repo,
    project_repo,
    annotation_repo,
    image_repo,
    category_repo,
    get_db_session
)


app = create_app(os.getenv('CONFIG', 'default'))


# @login_manager.user_loader
# def load_user(id: str) -> User:
#     user_repo = SQLAlchemyUserRepsitory(db.session)
#     return user_repo.get_by_id(id)

image1 = [
    {'url': '/static/imgs/test-image1.jpg', 'annotations': []}
]

image2 = [
    {'url': '/static/imgs/test-image2.png', 'annotations': []}
]

classes = {
  'Dog': {'color': 'yellow'},
  'Cat': {'color': 'orange'},
  'Cow': {'color': 'brown'},
  'Rabbit': {'color': 'green'},
  'Goat': {'color': 'blue'},
}

project1 = {
    'images': image1,
    'classes': classes,
    'name': 'test project1'
}

project2 = {
    'images': image2,
    'classes': classes,
    'name': 'test project2'
}

@app.route('/', methods=['GET'])
def index():
    user_id = '' ##
    user = user_repo.get_by_id(user_id)
    if not user:
        abort(400)

    return render_template('pages/home.html', username='0xD4N13LL')


@app.route('/annotations', methods=['PUT'])
def create_annotation() -> ResponseReturnValue:
    data = request.get_json()
    return jsonify({'status': 'success', 'data': 'done'})


@app.route('/export/<string:id>', methods=['GET'])
def export_project(id: str) -> ResponseReturnValue:
    return jsonify({'status': 'fail', 'error': 'invalid project'}), 400


@app.route('/projects', methods=['POST'])
def create_project() -> ResponseReturnValue:
    user_id = 'id' ##
    user = user_repo.get_by_id(user_id)
    if not user:
        abort(400)

    try:
        project = Project(request.form['name'])
        project_id = project_repo.add(project, user_id)

        categories = json.loads(request.form['classes'])
        for c in categories:
            category = Category(name=c.keys()[0], color=c.values()[0])
            _ = category_repo.add(category, project_id)

        ## Handle Image

        get_db_session().commit()
    except (KeyError, JSONDecodeError):
        raise #ValidationError

    return jsonify({
        'status': 'success',
        'data': {'id': 'test1'}
    }), 200


@app.route('/projects/<string:id>', methods=['GET'])
def read_project(id: str) -> ResponseReturnValue:
    if id == 'test':
        project = project1
    else:
        project = project2

    return jsonify({'status': 'success', 'data': project})

@app.route('/project/<string:id>', methods=['GET'])
def fetch_project_id(id: str) -> ResponseReturnValue:
    if id == 'test' or id == 'test1':
        return render_template(
            'pages/project.html',
            username='0xD4N13LL',
            project_id=id
        )

    abort(404)


@app.route('/projects', methods=['GET'])
def read_projects() -> ResponseReturnValue:
    return jsonify({
        'status': 'success',
        'data': {'test project': 'test'}
    }), 200


@app.route('/projects', methods=['DELETE'])
def delete_project() -> ResponseReturnValue:
    return jsonify({}), 200


@app.route('/projects', methods=['PATCH'])
def update_project() -> ResponseReturnValue:
    return jsonify({}), 200


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
