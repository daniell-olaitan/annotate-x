import os
from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(__file__),'..', '.env')
load_dotenv(dotenv_path=dotenv_path)

from os import getenv
from flask import Flask
from flask_cors import CORS
from flask import render_template
from config import config


def create_app(config_type: str) -> Flask:
    app = Flask(__name__, static_folder='static', template_folder='templates')
    app.url_map.strict_slashes = False
    app.config.from_object(config[config_type])

    CORS(app, supports_credentials=True)

    # with app.app_context():
    #     db.create_all()

    return app


app = create_app(getenv('CONFIG', 'default'))


# @login_manager.user_loader
# def load_user(id: str) -> User:
#     user_repo = SQLAlchemyUserRepsitory(db.session)
#     return user_repo.get_by_id(id)


@app.route('/', methods=['GET'])
def index():
    return render_template('pages/main/index.html')


if __name__ == '__main__':
    port = int(getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
