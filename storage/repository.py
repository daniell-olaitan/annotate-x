# from uuid import uuid4
# from storage import db
from typing import List
from domain.model import User, Project, Image, Annotation
from storage.orm import UserORM, ProjectORM, ImageORM, AnnotationORM
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

    @abstractmethod
    def get_by_id(self, id: str) -> User | None:
        raise NOT_IMPLEMENTED_ERROR

    @abstractmethod
    def commit(self) -> None:
        raise NOT_IMPLEMENTED_ERROR


class ProjectRepository(ABC):
    @abstractmethod
    def add(self, project: Project) -> None:
        raise NOT_IMPLEMENTED_ERROR

    @abstractmethod
    def get_by_id(self, id: str) -> Project | None:
        raise NOT_IMPLEMENTED_ERROR

    @abstractmethod
    def list(self) -> list[Project]:
        raise NOT_IMPLEMENTED_ERROR

    @abstractmethod
    def remove(self, id: str) -> None:
        raise NOT_IMPLEMENTED_ERROR

    @abstractmethod
    def update(self, **kwargs) -> None:
        raise NOT_IMPLEMENTED_ERROR

    @abstractmethod
    def commit(self) -> None:
        raise NOT_IMPLEMENTED_ERROR


class AnnotationRepository(ABC):
    @abstractmethod
    def add(self, annotation: Annotation) -> None:
        raise NOT_IMPLEMENTED_ERROR

    @abstractmethod
    def get_by_id(self, id: str) -> Annotation | None:
        raise NOT_IMPLEMENTED_ERROR

    @abstractmethod
    def list(self) -> list[Annotation]:
        raise NOT_IMPLEMENTED_ERROR

    @abstractmethod
    def remove(self, id: str) -> None:
        raise NOT_IMPLEMENTED_ERROR

    @abstractmethod
    def update(self, **kwargs) -> None:
        raise NOT_IMPLEMENTED_ERROR

    @abstractmethod
    def commit(self) -> None:
        raise NOT_IMPLEMENTED_ERROR


class ImageRepository(ABC):
    @abstractmethod
    def add(self, image: Image) -> None:
        raise NOT_IMPLEMENTED_ERROR

    @abstractmethod
    def get_by_id(self, id: str) -> Image | None:
        raise NOT_IMPLEMENTED_ERROR

    @abstractmethod
    def list(self) -> list[Image]:
        raise NOT_IMPLEMENTED_ERROR

    @abstractmethod
    def remove(self, id: str) -> None:
        raise NOT_IMPLEMENTED_ERROR

    @abstractmethod
    def commit(self) -> None:
        raise NOT_IMPLEMENTED_ERROR


## Implementations of the Model Repositories
class BaseSQLAlchemyRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def commit(self) -> None:
        self.session.commit()


class SQLAlchemyUserRepsitory(UserRepository, BaseSQLAlchemyRepository):
    def add(self, user: User) -> None:
        user_orm = UserORM(username=user.username, password=user.password)
        self.session.add(user_orm)

    def get(self, username: str) -> User | None:
        user_orm = self.session.query(UserORM).filter_by(username=username).first()
        if user_orm:
            return User(username=user_orm.username, password=user_orm.password)

        return None

    def get_by_id(self, id: str) -> User | None:
        user_orm = self.session.query(UserORM).filter_by(id=id).first()
        if user_orm:
            return User(username=user_orm.username, password=user_orm.password)

        return None


class SQLAlchemyProjectRepository(ProjectRepository, BaseSQLAlchemyRepository):
    def add(self, project: Project) -> None:
        project_orm = ProjectORM(name=project.name)
        self.session.add(project_orm)

    def get_by_id(self, id: str) -> Project | None:
        project_orm = self.session.query(ProjectORM).filter_by(id=id).first()
        if project_orm:
            return Project(name=project_orm.name)

        return None

    def list(self) -> list[Project]:
        return [
            Project(name=project_orm.name)
            for project_orm in self.session.query(ProjectORM).all()
        ]

    def remove(self, id: str) -> None:
        project_orm = self.session.query(ProjectORM).filter_by(id=id).first()
        self.session.delete(project_orm)

    def update(self, id: str, **kwargs) -> None:
        project_orm = self.session.query(ProjectORM).filter_by(id=id).first()
        for k, v in kwargs.items():
            setattr(project_orm, k, v)


class SQLAlchemyImageRepository(ImageRepository, BaseSQLAlchemyRepository):
    def add(self, image: Image) -> None:
        image_orm = ImageORM(url=image.url)
        self.session.add(image_orm)

    def get_by_id(self, id: str) -> Image | None:
        image_orm = self.session.query(ImageORM).filter_by(id=id).first()
        if image_orm:
            return Image(url=image_orm.url)

        return None

    def list(self) -> list[Image]:
        return [
            Image(url=image_orm.url)
            for image_orm in self.session.query(ImageORM).all()
        ]

    def remove(self, id: str) -> None:
        image_orm = self.session.query(ImageORM).filter_by(id=id).first()
        self.session.delete(image_orm)

    def update(self, id: str, **kwargs) -> None:
        image_orm = self.session.query(ImageORM).filter_by(id=id).first()
        for k, v in kwargs.items():
            setattr(image_orm, k, v)


class SQLAlchemyAnnotationRepository(AnnotationRepository, BaseSQLAlchemyRepository):
    pass