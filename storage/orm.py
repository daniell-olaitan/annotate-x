import uuid
from os import getenv
from storage import db
from sqlalchemy import event
from datetime import datetime


class BaseORM:
    id = db.Column(db.String(60), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)


class ProjectORM(BaseORM, db.Model):
    __tablename__ = 'projects'
    name = db.Column(db.String(256), nullable=False)
    user_id = db.Column(db.String(60), db.ForeignKey('users.id'), nullable=False)
    categories = db.relationship('Category', backref='project', cascade='all')
    images = db.relationship('Image', backref='project', cascade='all')


class CategoryORM(BaseORM, db.Model):
    __tablename__ = 'categories'
    project_id = db.Column(db.String(60), db.ForeignKey('projects.id'), nullable=False)
    name = db.Column(db.String(64), nullable=False)
    color = db.Column(db.String(16), nullable=False)
    annotations = db.relationship('Annotation', backref='category', cascade='all')


class ImageORM(BaseORM, db.Model):
    __tablename__ = 'images'
    project_id = db.Column(db.String(60), db.ForeignKey('projects.id'), nullable=False)
    url = db.Column(db.String(256), nullable=False)
    annotations = db.relationship('Annotation', backref='image', cascade='all')


class AnnotationORM(BaseORM, db.Model):
    __tablename__ = 'annotations'
    image_id = db.Column(db.String(60), db.ForeignKey('images.id'), nullable=False)
    category_id = db.Column(db.String(60), db.ForeignKey('categories.id'), nullable=False)
    x = db.Column(db.Float, nullable=False)
    y = db.Column(db.Float, nullable=False)
    width = db.Column(db.Float, nullable=False)
    height = db.Column(db.Float, nullable=False)


class UserORM(BaseORM, db.Model):
    __tablename__ = 'users'
    username = db.Column(db.String(60), nullable=False, unique=True)
    password = db.Column(db.String(60), nullable=False)
    projects = db.relationship('Project', backref='user', cascade='all')


# def delete_file(mapper, connection, target):
#     import os
#     from labelbox_clone import app

#     if target.url:
#         path = os.path.join(app.root_path, os.getenv('UPLOAD_DIR'), target.url)
#         if os.path.exists(path):
#             os.remove(path)

# event.listen(ImageORM, 'after_delete', delete_file)