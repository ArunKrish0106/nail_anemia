import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "NailAnemiaAI"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/diag-api"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./nail_anemia.db")
    
    # Model Config
    CNN_MODEL: str = "efficientnetv2_rw_s"
    VIT_MODEL: str = "swin_tiny_patch4_window7_224"
    FUSION_DIM: int = 512
    
    # Training Config
    BATCH_SIZE: int = 16
    LEARNING_RATE: float = 1e-4
    EPOCHS: int = 50
    
    # GPU / CPU
    DEVICE: str = "cuda" if os.getenv("USE_GPU", "true").lower() == "true" else "cpu"

    class Config:
        env_file = ".env"

settings = Settings()
