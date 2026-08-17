import os
from pydantic_settings import BaseSettings, SettingsConfigDict

_env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env")


class Settings(BaseSettings):
    APP_NAME: str = "IntraSphere API"
    APP_VERSION: str = "1.0.0"

    MONGODB_URL: str
    DATABASE_NAME: str = "IntraSphereDB"

    model_config = SettingsConfigDict(env_file=(_env_path, ".env"), extra="ignore")


settings = Settings()