from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Politifolio Backend"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = "sqlite:///./politifolio.db" # Default to SQLite for local dev
    
    # XRP Ledger
    XRPL_NODE_URL: str = "wss://s.altnet.rippletest.net:51233" # Using Testnet by default
    GEO_PULSE_ISSUER_SEED: str = "" # Set in env var or auto-generate
    GEO_PULSE_CURRENCY_CODE: str = "GEO"
    
    # AI / External APIs
    DEDALUS_API_KEY: str = ""
    OPENAI_API_KEY: str = "" # Optional: Use for real analysis
    
    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/0" # Local redis default
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"

    class Config:
        env_file = ".env"

settings = Settings()
