from flask_app.auth_bp import auth
from flask import request, render_template, redirect, url_for, g, session, jsonify
from storage import user_repo, get_db_session, project_repo, image_repo, category_repo, demo_repo
from flask_app import bcrypt
from flask_app.services import require_login
from src.model import User, Project, Image, Category
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError
from utils import generate_unique_name, ImageUtil

img_util = ImageUtil()


@auth.route('/demo-signin', methods=['GET'])
def demo_signin():
    if not session.get('user_id'):
        usernames = user_repo.get_usernames()
        username = generate_unique_name(usernames, 'demo')

        user = User(username=username, password='demo')
        user_id = user_repo.add(user)

        session['user_id'] = user_id
        session['demo'] = True

        project_name = generate_unique_name([], 'project').upper()
        project = Project(name=project_name)
        project_id = project_repo.add(project, user_id)

        # Handle Categories (classes)
        categories = [
            ('car', 'purple'),
            ('bus', 'brown'),
            ('van', 'blue')
        ]

        for name, color in categories:
            category = Category(name=name, color=color)
            _ = category_repo.add(category, project_id)

        # Upload Images
        demo_images_urls = demo_repo.get_image_urls()
        images = img_util.fetch_images(demo_images_urls)

        files = []
        image_names = []

        for img in images:
            image_name = generate_unique_name(image_names, 'image')
            image_names.append(image_name)
            files.append((
                image_name,
                img.content,
                "application/octet-stream"
            ))

        try:
            uploaded_imgs = img_util.upload_images(files, f"FLASK/{project_name}")
        except Exception:
            raise InternalServerError('Network Error')

        for uploaded_img in uploaded_imgs:
            image = Image(**uploaded_img)
            _ = image_repo.add(image, project_id)

        get_db_session().commit()

    return jsonify({
        'status': 'success',
        'data': {'id': project_id}
    }), 200


@auth.route('/signin', methods=['GET', 'POST'])
def signin():
    if g.user:
        return redirect(url_for('index'))

    if request.method == 'GET':
        return render_template('pages/signin.html')

    else:
        user_data = request.get_json()
        user = user_repo.get(user_data.get('username'))
        if user:
            if bcrypt.check_password_hash(user.password, user_data.get('password')):
                session['user_id'] = user.id

                return redirect(url_for('index'))
            raise BadRequest('Invalid Password')

        raise NotFound('User does not exist')


@auth.route('/signup', methods=['GET', 'POST'])
def signup():
    if g.user:
        return redirect(url_for('index'))

    if request.method == 'GET':
        return render_template('pages/signup.html')

    else:
        user_data = request.get_json()
        user = user_repo.get(user_data.get('username'))
        if user:
            raise BadRequest('User already exist')

        user = User(**user_data)
        user_repo.add(user)

        get_db_session().commit()

        return redirect(url_for('auth.signin'))


@auth.route('/signout', methods=['GET'])
@require_login
def signout():
    _ = session.pop('user_id', None)
    demo = session.pop('demo', None)
    if demo:
        for project in project_repo.list(g.user.id):
            try:
                img_util.delete_all(f"FLASK/{project.name}")
            except Exception:
                raise InternalServerError('Network Error')

        user_repo.remove(g.user.id)
        get_db_session().commit()

    return jsonify({
        'status': 'success',
        'data': {}
    }), 200
