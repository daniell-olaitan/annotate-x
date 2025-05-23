from os import getenv


class Config:
    SECRET_KEY = getenv('SECRET_KEY')
    SQLALCHEMY_TRACK_MODIFICATIONS = False


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = "postgresql://{}:{}@db/{}".format(
        getenv('DATABASE_USERNAME'),
        getenv('DATABASE_PASSWORD'),
        getenv('DATABASE')
    )


class TestingConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'


class DeploymentConfig(Config):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = "postgresql://{}:{}@localhost/{}".format(
        getenv('DATABASE_USERNAME'),
        getenv('DATABASE_PASSWORD'),
        getenv('DATABASE')
    )


config = {
    'default': DevelopmentConfig,
    'development': DevelopmentConfig,
    'test': TestingConfig,
    'production': DeploymentConfig
}
