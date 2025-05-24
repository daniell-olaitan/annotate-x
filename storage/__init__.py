from storage.orm import db

from storage.repository import (
    SQLAlchemyUserRepsitory,
    SQLAlchemyImageRepository,
    SQLAlchemyAnnotationRepository,
    SQLAlchemyProjectRepository,
    SQLAlchemyCategoryRepository,
    SQLAlchemyDemoRepository
)


user_repo = SQLAlchemyUserRepsitory(db.session)
project_repo = SQLAlchemyProjectRepository(db.session)
image_repo = SQLAlchemyImageRepository(db.session)
annotation_repo = SQLAlchemyAnnotationRepository(db.session)
category_repo = SQLAlchemyCategoryRepository(db.session)
demo_repo = SQLAlchemyDemoRepository(db.session)


def get_db_session():
    return db.session
