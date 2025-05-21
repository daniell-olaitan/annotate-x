import uuid

from os import getenv
from sqlalchemy import event
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import class_mapper, ColumnProperty, RelationshipProperty

db = SQLAlchemy()


class BaseORM:
    id = db.Column(db.String(60), primary_key=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    def __init__(self, *args: tuple, **kwargs: dict) -> None:
        super().__init__(*args, **kwargs)

    def to_dict(self) -> dict:
        orm_dict = {}
        items_to_ignore = [
            '_sa_instance_state',
            'updated_at',
            'created_at'
        ]

        for k, v in vars(self).copy().items():
            if not (k in items_to_ignore or k.endswith('_id')):
                orm_dict[k] = v

        return orm_dict


        # result = {}

        # # Add column attributes
        # for attr in class_mapper(self.__class__).iterate_properties:
        #     if (
        #         isinstance(attr, ColumnProperty)
        #         and not attr.key.endswith('_id')
        #         and attr.key not in ['created_at', 'updated_at']
        #     ):
        #         result[attr.key] = getattr(self, attr.key)

        # # # Add relationships if depth > 0
        # # if depth > 0:
        # #     for attr in class_mapper(self.__class__).iterate_properties:
        # #         if (
        # #             isinstance(attr, RelationshipProperty)
        # #             and not attr.key.endswith('_id')
        # #             and attr.key not in ['created_at', 'updated_at']
        # #         ):
        # #             value = getattr(self, attr.key)
        # #             if value is None:
        # #                 result[attr.key] = None
        # #             elif isinstance(value, list):  # One-to-many / many-to-many
        # #                 result[attr.key] = [self.orm_to_dict(i, depth=depth-1) for i in value]
        # #             else:  # Many-to-one / one-to-one
        # #                 result[attr.key] = self.orm_to_dict(value, depth=depth-1)

        # return result

class AnnotationORM(BaseORM, db.Model):
    __tablename__ = 'annotations'
    image_id = db.Column(db.String(60), db.ForeignKey('images.id'), nullable=False)
    category_id = db.Column(db.String(60), db.ForeignKey('categories.id'), nullable=False)
    x = db.Column(db.Float, nullable=False)
    y = db.Column(db.Float, nullable=False)
    width = db.Column(db.Float, nullable=False)
    height = db.Column(db.Float, nullable=False)


class ImageORM(BaseORM, db.Model):
    __tablename__ = 'images'
    project_id = db.Column(db.String(60), db.ForeignKey('projects.id'), nullable=False)
    url = db.Column(db.String(256), nullable=False)
    filename = db.Column(db.String(32), nullable=False)
    width = db.Column(db.Float, nullable=False)
    height = db.Column(db.Float, nullable=False)
    annotations = db.relationship('AnnotationORM', backref='image', cascade='all')


class CategoryORM(BaseORM, db.Model):
    __tablename__ = 'categories'
    project_id = db.Column(db.String(60), db.ForeignKey('projects.id'), nullable=False)
    name = db.Column(db.String(64), nullable=False)
    color = db.Column(db.String(16), nullable=False)
    annotations = db.relationship('AnnotationORM', backref='category', cascade='all')


class ProjectORM(BaseORM, db.Model):
    __tablename__ = 'projects'
    name = db.Column(db.String(256), nullable=False, unique=True)
    user_id = db.Column(db.String(60), db.ForeignKey('users.id'), nullable=False)
    categories = db.relationship('CategoryORM', backref='project', cascade='all')
    images = db.relationship('ImageORM', backref='project', cascade='all')


class UserORM(BaseORM, db.Model):
    __tablename__ = 'users'
    username = db.Column(db.String(60), nullable=False, unique=True)
    password = db.Column(db.String(60), nullable=False)
    projects = db.relationship('ProjectORM', backref='user', cascade='all')
