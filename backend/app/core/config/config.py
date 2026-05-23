import os
from dotenv import load_dotenv
from typing import Optional 
from pydantic_settings import BaseSettings


load_dotenv()

class Settings(BaseSettings):

    GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY") 
    MONGO_URI: str | None = os.getenv("MONGO_URI")


settings = Settings()