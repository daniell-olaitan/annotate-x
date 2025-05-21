from flask import Blueprint

auth = Blueprint('auth', __name__)

from flask_app.auth_bp.auth_views import *
