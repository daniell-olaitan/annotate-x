# from uuid import uuid4
# from storage import db
from typing import Any
from domain.model import User, Project, Image, Annotation, Category
from storage.orm import UserORM, ProjectORM, ImageORM, AnnotationORM, CategoryORM
from sqlalchemy.orm import Session
from abc import ABC, abstractmethod

NOT_IMPLEMENTED_ERROR = NotImplementedError('Method must be implemented')


## Abstract Model Repositories
class UserRepository(ABC):
    @abstractmethod
    def add(self, user: User) -> None:
        raise NOT_IMPLEMENTED_ERROR

    @abstractmethod
    def get(self, username: str) -> User | None:
        raise NOT_IMPLEMENTED_ERROR


class ProjectRepository(ABC):
    @abstractmethod
    def add(self, project: Project) -> None:
        raise NOT_IMPLEMENTED_ERROR


class AnnotationRepository(ABC):
    @abstractmethod
    def add(self, annotation: Annotation) -> None:
        raise NOT_IMPLEMENTED_ERROR


class CategoryRepository(ABC):
    @abstractmethod
    def add(self, category: Category) -> None:
        raise NOT_IMPLEMENTED_ERROR


class ImageRepository(ABC):
    @abstractmethod
    def add(self, image: Image) -> None:
        raise NOT_IMPLEMENTED_ERROR


## Implementations of the Model Repositories
class BaseSQLAlchemyRepository:
    def __init__(self, session: Session, Model: Any, Orm: Any) -> None:
        self.Model = Model
        self.Orm = Orm
        self._session = session

        super().__init__()

    def get_by_id(self, id: str) -> Any:
        model_orm = self._session.query(self.Orm).filter_by(id=id).first()
        if model_orm:
            return self.Model(**model_orm)

        return None

    def list(self) -> list:
        return [
            self.Model(**model_orm)
            for model_orm in self._session.query(self.Orm).all()
        ]

    def remove(self, id: str) -> None:
        model_orm = self._session.query(self.Orm).filter_by(id=id).first()
        self._session.delete(model_orm)

    def update(self, id: str, **kwargs) -> None:
        model_orm = self._session.query(self.Orm).filter_by(id=id).first()
        for k, v in kwargs.items():
            setattr(model_orm, k, v)


class SQLAlchemyUserRepsitory(BaseSQLAlchemyRepository, UserRepository):
    def add(self, user: User) -> str:
        user_orm = UserORM(username=user.username, password=user.password)
        self._session.add(user_orm)

        return user_orm.id

    def get(self, username: str) -> User | None:
        user_orm = self._session.query(UserORM).filter_by(username=username).first()
        if user_orm:
            return User(username=user_orm.username, password=user_orm.password)

        return None


class SQLAlchemyProjectRepository(BaseSQLAlchemyRepository, ProjectRepository):
    def add(self, project: Project, user_id: str) -> str:
        project_orm = ProjectORM(name=project.name, user_id=user_id)
        self._session.add(project_orm)

        return project_orm.id


class SQLAlchemyImageRepository(BaseSQLAlchemyRepository, ImageRepository):
    def add(self, image: Image, project_id: str) -> str:
        image_orm = ImageORM(url=image.url, project_id=project_id)
        self._session.add(image_orm)

        return image_orm.id


class SQLAlchemyAnnotationRepository(AnnotationRepository, BaseSQLAlchemyRepository):
    pass


class SQLAlchemyCategoryRepository(CategoryRepository, BaseSQLAlchemyRepository):
    def add(self, category: Category, project_id: str) -> str:
        category_orm = CategoryORM(name=category.name, color=category.color, project_id=project_id)
        self._session.add(category_orm)

        return category_orm.id
