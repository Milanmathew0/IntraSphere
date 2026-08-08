from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str
    APP_VERSION: str

    MONGODB_URL: str
    DATABASE_NAME: str

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()