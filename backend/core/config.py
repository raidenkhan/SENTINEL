from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "SENTINEL-EXAM API"
    VERSION: str = "1.0.0"
    
    # Supabase Configuration
    SUPABASE_URL: str
    SUPABASE_KEY: str
    
    # DeepSeek Configuration for LLM (OpenAI-compatible API).
    # DeepSeek is the sole LLM provider for both parsing and the chatbot.
    DEEP_SEEK_API_KEY: str

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
