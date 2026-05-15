import os
import cv2
import numpy as np
import torch
from torch.utils.data import Dataset, DataLoader
from albumentations import (
    Compose, HorizontalFlip, VerticalFlip, Rotate, RandomBrightnessContrast,
    RandomResizedCrop, Normalize, GaussianBlur, ElasticTransform, ShiftScaleRotate
)
from albumentations.pytorch import ToTensorV2

def get_train_augmentations(img_size=224):
    return Compose([
        RandomResizedCrop(img_size, img_size),
        HorizontalFlip(p=0.5),
        VerticalFlip(p=0.5),
        Rotate(limit=30, p=0.5),
        ShiftScaleRotate(shift_limit=0.1, scale_limit=0.1, rotate_limit=30, p=0.5),
        RandomBrightnessContrast(p=0.5),
        GaussianBlur(p=0.2),
        ElasticTransform(p=0.2),
        Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ToTensorV2()
    ])

def get_val_augmentations(img_size=224):
    return Compose([
        RandomResizedCrop(img_size, img_size),
        Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ToTensorV2()
    ])

class NailAnemiaDataset(Dataset):
    def __init__(self, image_paths, labels, transform=None):
        self.image_paths = image_paths
        self.labels = labels
        self.transform = transform

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        img_path = self.image_paths[idx]
        image = cv2.imread(img_path)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Clinical preprocessing: CLAHE
        image_lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(image_lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        cl = clahe.apply(l)
        image_lab = cv2.merge((cl, a, b))
        image = cv2.cvtColor(image_lab, cv2.COLOR_LAB2RGB)

        if self.transform:
            image = self.transform(image=image)["image"]
        
        label = torch.tensor(self.labels[idx], dtype=torch.long)
        return image, label
