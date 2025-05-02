from flask_sqlalchemy import SQLAlchemy

from storage.repository import (
    SQLAlchemyUserRepsitory,
    SQLAlchemyImageRepository,
    SQLAlchemyAnnotationRepository,
    SQLAlchemyProjectRepository
)

db = SQLAlchemy()

user_repo = SQLAlchemyUserRepsitory(db.session)
project_repo = SQLAlchemyProjectRepository(db.session)
image_repo = SQLAlchemyImageRepository(db.session)
annotation_repo = SQLAlchemyAnnotationRepository(db.session)
