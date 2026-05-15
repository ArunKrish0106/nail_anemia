from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import torch
import cv2
import numpy as np
import io
import base64
from PIL import Image
from sqlalchemy.orm import Session
from ..models.fusion import AdvancedFusionModel
from ..xai.explainers import GradCAM, GradCAMPlusPlus, LimeExplainer, ShapExplainer, overlay_heatmap
from ..database.db import SessionLocal, PredictionRecord, engine, Base
from ..config import settings
from albumentations.pytorch import ToTensorV2
import albumentations as A
import logging
import datetime

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Load Model
device = torch.device(settings.DEVICE)
logger.info(f"Using device: {device}")

model = AdvancedFusionModel(num_classes=2)
# model.load_state_dict(torch.load("checkpoints/best_model.pth", map_location=device))
model.to(device)
model.eval()

# Setup XAI
try:
    # Target the last CNN block for Grad-CAM
    target_layer = list(model.cnn_branch.base.children())[-2]
    explainers = {
        "Grad-CAM": GradCAM(model, target_layer),
        "Grad-CAM++": GradCAMPlusPlus(model, target_layer),
        "LIME": LimeExplainer(),
        "SHAP": ShapExplainer()
    }
except Exception as e:
    logger.error(f"XAI Layer Hook failed: {e}")
    explainers = {}

def preprocess_image(image_bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    transform = A.Compose([
        A.Resize(224, 224),
        A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ToTensorV2()
    ])
    
    transformed = transform(image=img)["image"].unsqueeze(0).to(device)
    return transformed, img

@app.get("/health")
def health():
    gpu_available = torch.cuda.is_available()
    return {
        "status": "ok", 
        "device": str(device),
        "gpu": {
            "available": gpu_available,
            "name": torch.cuda.get_device_name(0) if gpu_available else "N/A",
            "count": torch.cuda.device_count() if gpu_available else 0
        },
        "version": settings.VERSION
    }

@app.get("/predict_history")
def get_predict_history(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    try:
        records = db.query(PredictionRecord).order_by(PredictionRecord.timestamp.desc()).offset(skip).limit(limit).all()
        return [
            {
                "id": r.id,
                "patient_id": r.patient_id,
                "prediction": r.prediction,
                "confidence": r.confidence,
                "timestamp": r.timestamp.isoformat(),
                "image_data": r.image_data,
                "heatmap_data": r.heatmap_data
            } for r in records
        ]
    except Exception as e:
        logger.error(f"Database query error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.post("/predict")
async def predict(file: UploadFile = File(...), xai_method: str = "Grad-CAM", db: Session = Depends(get_db)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    try:
        contents = await file.read()
        input_tensor, original_img = preprocess_image(contents)
        
        with torch.no_grad():
            outputs = model(input_tensor)
            probs = torch.softmax(outputs, dim=1)
            confidence, pred_class = torch.max(probs, dim=1)
            
        class_names = ["Normal", "Anemic"]
        result = {
            "prediction": class_names[pred_class.item()],
            "confidence": float(confidence.item()),
            "probability_normal": float(probs[0, 0].item()),
            "probability_anemic": float(probs[0, 1].item()),
            "device": str(device)
        }
        
        # Generate XAI heatmap
        heatmap_base64 = None
        explainer = explainers.get(xai_method)
        if explainer:
            try:
                if isinstance(explainer, (GradCAM, GradCAMPlusPlus)):
                    heatmap = explainer.generate(input_tensor, class_idx=pred_class.item())
                elif isinstance(explainer, LimeExplainer):
                    heatmap = explainer.generate(original_img, None)
                else: # SHAP
                    heatmap = explainer.generate(input_tensor, model)
                    
                overlay = overlay_heatmap(original_img, heatmap)
                is_success, buffer = cv2.imencode(".png", cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR))
                if is_success:
                    heatmap_base64 = f"data:image/png;base64,{base64.b64encode(buffer).decode('utf-8')}"
                    result["heatmap"] = heatmap_base64
            except Exception as e:
                logger.warning(f"XAI Generation Error ({xai_method}): {e}")
                
        # Save to Database
        try:
            _, original_buffer = cv2.imencode(".jpg", cv2.cvtColor(original_img, cv2.COLOR_RGB2BGR), [int(cv2.IMWRITE_JPEG_QUALITY), 80])
            original_base64 = f"data:image/jpeg;base64,{base64.b64encode(original_buffer).decode('utf-8')}"
            
            record = PredictionRecord(
                prediction=result["prediction"],
                confidence=result["confidence"],
                probability_normal=result["probability_normal"],
                probability_anemic=result["probability_anemic"],
                xai_method=xai_method,
                device=str(device),
                image_data=original_base64,
                heatmap_data=heatmap_base64
            )
            db.add(record)
            db.commit()
        except Exception as e:
            logger.error(f"Database Save Error: {e}")
            db.rollback()

        return result
    except Exception as e:
        logger.error(f"Prediction Pipeline Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
