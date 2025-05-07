from flask import Flask
from flask_app.config import config


def create_app(config_type: str) -> Flask:
    app = Flask(__name__, static_folder='static', template_folder='templates')
    app.url_map.strict_slashes = False
    app.config.from_object(config[config_type])

    # CORS(app, supports_credentials=True)

    # with app.app_context():
    #     db.create_all()

    return app
