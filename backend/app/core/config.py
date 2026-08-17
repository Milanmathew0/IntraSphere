import os
from pydantic_settings import BaseSettings

_env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env")

class Settings(BaseSettings):
    APP_NAME: str = "IntraSphere API"
    APP_VERSION: str = "1.0.0"
    DATABASE_NAME: str = "IntraSphereDB"
    MONGODB_URL: str

    # SMTP Email Configuration
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "noreply@intrasphere.com"
    SMTP_FROM_NAME: str = "IntraSphere"
    SMTP_TLS: bool = True
    SMTP_SSL: bool = False

    # Frontend URL & Development Mode
    FRONTEND_URL: str = "http://localhost:5173"
    DEV_MODE: bool = True

    class Config:
        env_file = (_env_path, ".env")
        extra = "ignore"


settings = Settings()