# NailAnemia AI: CNN-ViT Fusion Framework

An Explainable CNN–Vision Transformer Fusion Framework for Non-Invasive Iron Deficiency Anemia Detection Using Fingernail Images.

## Overview
This project implements a hybrid deep learning architecture that combines:
1. **CNN (EfficientNetV2)**: Specialized in local texture and chromatic micro-pattern extraction from fingernails.
2. **Vision Transformer (Swin)**: Specialized in global context and long-range dependencies within the image.
3. **Cross-Attention Fusion**: An advanced mechanism to fuse features from both branches dynamically.

## Key Features
- **Explainable AI (XAI)**: Integrated Grad-CAM visualization to show areas of diagnostic importance.
- **Research-Grade Preprocessing**: CLAHE enhancement and RGB+LAB color space analysis.
- **FastAPI Backend**: Production-ready asynchronous API for high-throughput inference.
- **Modern React Dashboard**: Real-time diagnostic interface with confidence analytics.

## Project Structure
- `backend/`: Python source code for modeling, XAI, and API.
- `src/`: React frontend source code.
- `server.ts`: Express bridge serving the frontend and proxying ML requests.

## Installation & Setup

### 1. Python Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn api.app:app --host 0.0.0.0 --port 8000
```

### 2. Web Frontend
```bash
npm install
npm run dev
```

## Dataset Requirements
The model expects high-resolution images of single fingernails.
- Standard input size: 224x224
- Training requires a dataset split: `dataset/train/`, `dataset/val/` with subfolders for `Normal` and `Anemic`.

## Citation
If you use this framework in your research, please cite the corresponding paper title:
*“An Explainable CNN–Vision Transformer Fusion Framework for Non-Invasive Iron Deficiency Anemia Detection Using Fingernail Images”*
