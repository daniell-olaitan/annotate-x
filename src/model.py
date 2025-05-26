import copy
import uuid


class BaseModel:
    def __init__(self, id: str | None = None):
        if id is None:
            id = str(uuid.uuid4())

        self.id = id

    def to_dict(self):
        model_dict = copy.deepcopy(vars(self))
        if 'password' in model_dict:
            del model_dict['password']

        for k, v in model_dict.items():
            if isinstance(v, BaseModel):
                model_dict[k] = v.to_dict()

            if isinstance(v, list):
                lst = []
                for model in v:
                    if isinstance(model, BaseModel):
                        model = model.to_dict()

                    lst.append(model)

                model_dict[k] = lst

        return model_dict


class User(BaseModel):
    def __init__(self, username: str, password: str, id: str | None = None) -> None:
        super().__init__(id=id)
        self.username = username
        self.password = password


class Project(BaseModel):
    def __init__(self, name: str, id: str | None = None) -> None:
        super().__init__(id=id)
        self.name = name


class Demo(BaseModel):
    def __init__(self, url: str, id: str | None = None) -> None:
        super().__init__(id=id)
        self.url = url


class Annotation(BaseModel):
    def __init__(
        self,
        x: float,
        y: float,
        width: float,
        height: float,
        id: str | None = None
    ) -> None:
        super().__init__(id=id)
        self.x = x
        self.y = y
        self.width = width
        self.height = height


class Image(BaseModel):
    def __init__(
        self,
        url: str,
        width: float,
        height: float,
        filename: str,
        id: str | None = None
    ) -> None:
        super().__init__(id=id)
        self.url = url
        self.width = width
        self.height = height
        self.filename = filename

    def convert_to_coco_bbox(self) -> dict:
        image_dict = self.to_dict()
        del image_dict['url']

        return image_dict


class Category(BaseModel):
    def __init__(self, name: str, color: str, id: str | None = None) -> None:
        super().__init__(id=id)
        self.name = name
        self.color = color
