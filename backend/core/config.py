from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "SENTINEL-EXAM API"
    VERSION: str = "1.0.0"
    
    # Supabase Configuration
    SUPABASE_URL: str
    SUPABASE_KEY: str
    
    # DeepSeek Configuration for LLM (OpenAI-compatible API)
    # Primary: DEEP_SEEK_API_KEY. Legacy GROQ_API_KEY kept as fallback
    # so a stale secret name on the HF Space doesn't crash startup.
    DEEP_SEEK_API_KEY: str = ""
    GROQ_API_KEY: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
