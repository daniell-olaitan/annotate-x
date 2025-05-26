from functools import wraps
from typing import Callable, Any
from werkzeug.exceptions import NotFound, Unauthorized
from flask import g
from src.model import Project
from storage import project_repo


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
