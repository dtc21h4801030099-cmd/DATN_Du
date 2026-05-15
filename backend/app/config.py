from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_NAME: str = "datn_duta"

    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    GEMINI_API_KEY: str = ""

    @field_validator("GEMINI_API_KEY", mode="before")
    @classmethod
    def strip_api_key(cls, v: str) -> str:
        return v.strip() if isinstance(v, str) else v

    class Config:
        env_file = ".env"


settings = Settings()
