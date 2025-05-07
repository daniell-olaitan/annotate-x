from os import getenv

import cloudinary

cloudinary.config(
  cloud_name=getenv('CLOUDINARY_NAME'),
  api_key=getenv('CLOUDINARY_API_KEY'),
  api_secret=getenv('CLOUDINARY_API_SECRET')
)


class Config:
    SECRET_KEY = getenv('SECRET_KEY')
    SQLALCHEMY_TRACK_MODIFICATIONS = False


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = "mysql://{}:{}@localhost/{}".format(
        getenv('DATABASE_USERNAME'),
        getenv('DATABASE_PASSWORD'),
        getenv('DATABASE')
    )


class TestingConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'


class DeploymentConfig(Config):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = "mysql://{}:{}@localhost/{}".format(
        getenv('DATABASE_USERNAME'),
        getenv('DATABASE_PASSWORD'),
        getenv('DATABASE')
    )


config = {
    'default': DevelopmentConfig,
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'deployment': DeploymentConfig
}
