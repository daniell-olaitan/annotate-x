import copy


class BaseModel:
    def to_dict(self):
        user_dict = copy.deepcopy(vars(self))
        if 'password' in user_dict:
            del user_dict['password']

        return user_dict


class User(BaseModel):
    def __init__(self, username: str, password: str) -> None:
        self.username = username
        self.password = password


class Project(BaseModel):
    def __init__(self, name: str) -> None:
        self.name = name


class Annotation(BaseModel):
    def __init__(
        self,
        start_point: dict[str, float],
        dimension: dict[str, float],
        category: dict[str, dict[str, str]]
    ) -> None:
        self.start_point = start_point
        self.dimension = dimension
        self.category = category


class Image(BaseModel):
    def __init__(self, url: str) -> None:
        self.url = url
