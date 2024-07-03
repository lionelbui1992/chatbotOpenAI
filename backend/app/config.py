import os
from dotenv import load_dotenv

class Config:
    # Get config from .env file
    load_dotenv()
    SECRET_KEY = os.getenv('SECRET_KEY')
    DATABASE_TYPE = os.getenv('DATABASE_TYPE')
    DB_NAME = os.getenv('DB_NAME')
    MONGO_URI = os.getenv('MONGO_URI')
    MONGO_COLLECTION = os.getenv('MONGO_COLLECTION')
    MYSQL_USER = os.getenv('MYSQL_USER')
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD')
    MYSQL_DB = os.getenv('MYSQL_DB')
    MYSQL_HOST = os.getenv('MYSQL_HOST')
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    OPENAI_MODEL = os.getenv('OPENAI_MODEL')
    EMBEDDING_MODEL = os.getenv('EMBEDDING_MODEL')
