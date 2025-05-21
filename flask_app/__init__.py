from flask import Flask
from storage.orm import db
from flask_app.config import config
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from werkzeug.exceptions import BadRequest, NotFound, Unauthorized, InternalServerError
from flask_app.error_handlers import (
    handle_bad_request,
    handle_not_found,
    handle_unauthorized,
    handle_internal_server_error
)

bcrypt = Bcrypt()


def create_app(config_type: str) -> Flask:
    app = Flask(__name__, static_folder='static', template_folder='templates')
    app.url_map.strict_slashes = False
    app.config.from_object(config[config_type])

    app.register_error_handler(BadRequest, handle_bad_request)
    app.register_error_handler(NotFound, handle_not_found)
    app.register_error_handler(Unauthorized, handle_unauthorized)
    app.register_error_handler(InternalServerError, handle_internal_server_error)

    bcrypt.init_app(app)
    db.init_app(app)
    Migrate(app, db)

    from flask_app.auth_bp import auth
    app.register_blueprint(auth)

    with app.app_context():
        db.create_all()

    return app
