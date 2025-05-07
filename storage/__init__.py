from flask_sqlalchemy import SQLAlchemy

from storage.orm import (
    UserORM,
    ProjectORM,
    CategoryORM,
    ImageORM,
    AnnotationORM
)

from domain.model import (
    User,
    Category,
    Project,
    Annotation,
    Image
)

from storage.repository import (
    SQLAlchemyUserRepsitory,
    SQLAlchemyImageRepository,
    SQLAlchemyAnnotationRepository,
    SQLAlchemyProjectRepository,
    SQLAlchemyCategoryRepository
)

db = SQLAlchemy()

user_repo = SQLAlchemyUserRepsitory(db.session, User, UserORM)
project_repo = SQLAlchemyProjectRepository(db.session, Project, ProjectORM)
image_repo = SQLAlchemyImageRepository(db.session, Image, ImageORM)
annotation_repo = SQLAlchemyAnnotationRepository(db.session, Annotation, AnnotationORM)
category_repo = SQLAlchemyCategoryRepository(db.session, Category, CategoryORM)


def get_db_session():
    return db.session
