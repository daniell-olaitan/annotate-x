import copy


class BaseModel:
    def to_dict(self):
        model_dict = copy.deepcopy(vars(self))
        if 'password' in model_dict:
            del model_dict['password']

        return model_dict


class User(BaseModel):
    def __init__(self, username: str, password: str) -> None:
        self.username = username
        self.password = password


class Project(BaseModel):
    def __init__(self, name: str) -> None:
        self.name = name


class Annotation(BaseModel):
    def __init__(self, x: float, y: float, width: float, height: float) -> None:
        self.x = x
        self.y = y
        self.width = width
        self.height = height


class Image(BaseModel):
    def __init__(self, url: str) -> None:
        self.url = url


class Category(BaseModel):
    def __init__(self, name: str, color: str) -> None:
        self.name = name
        self.color = color
