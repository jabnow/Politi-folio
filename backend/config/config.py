from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", extra="ignore")

    PROJECT_NAME: str = "Politifolio Backend"
    API_V1_STR: str = "/api/v1"

    # Database
    DATABASE_URL: str = "sqlite:///./politifolio.db"

    # XRP Ledger
    XRPL_NODE_URL: str = "wss://s.altnet.rippletest.net:51233"
    GEO_PULSE_ISSUER_SEED: str = ""
    GEO_PULSE_CURRENCY_CODE: str = "GEO"

    # AI / External APIs
    DEDALUS_API_KEY: str = ""
    DEDALUS_PROJECT: str = "geopulse-staging"
    ALPHA_VANTAGE_API_KEY: str = ""
    WORLD_NEWS_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""

    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"


settings = Settings()
