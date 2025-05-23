import uuid

from flask_app.auth_bp import auth
from flask import request, render_template, redirect, url_for, g, session, jsonify
from storage import user_repo, get_db_session
from flask_app import bcrypt
from flask_app.services import require_login
from domain.model import User
from werkzeug.exceptions import BadRequest, NotFound


@auth.route('/demo-signin', methods=['GET'])
def demo_signin():
    if not session.get('demo'):
        session['user_id'] = str(uuid.uuid4())
        session['demo'] = True

    return redirect(url_for('index'))

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

    return jsonify({
        'status': 'success',
        'data': {}
    }), 200
