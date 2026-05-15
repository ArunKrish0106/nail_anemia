from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime
from ..config import settings

engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class PredictionRecord(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, default="ANON-001")
    prediction = Column(String)
    confidence = Column(Float)
    probability_normal = Column(Float)
    probability_anemic = Column(Float)
    xai_method = Column(String)
    device = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    image_data = Column(Text) # Store base64 encoded image
    heatmap_data = Column(Text, nullable=True) # Store base64 encoded heatmap

Base.metadata.create_all(bind=engine)
