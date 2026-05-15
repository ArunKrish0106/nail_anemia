import torch
import torch.nn as nn
import torch.optim as optim
from torch.cuda.amp import GradScaler, autocast
from tqdm import tqdm
import numpy as np
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score

class ProTrainer:
    def __init__(self, model, train_loader, val_loader, config):
        self.model = model.to(config['device'])
        self.train_loader = train_loader
        self.val_loader = val_loader
        self.config = config
        
        self.criterion = nn.CrossEntropyLoss()
        self.optimizer = optim.AdamW(model.parameters(), lr=config['lr'], weight_decay=1e-4)
        self.scheduler = optim.lr_scheduler.CosineAnnealingLR(self.optimizer, T_max=config['epochs'])
        self.scaler = GradScaler()
        
        self.best_val_f1 = 0.0

    def train_epoch(self):
        self.model.train()
        train_loss = 0
        all_preds = []
        all_labels = []
        
        pbar = tqdm(self.train_loader, desc="Training")
        for images, labels in pbar:
            images, labels = images.to(self.config['device']), labels.to(self.config['device'])
            
            self.optimizer.zero_grad()
            
            with autocast():
                outputs = self.model(images)
                loss = self.criterion(outputs, labels)
            
            self.scaler.scale(loss).backward()
            self.scaler.step(self.optimizer)
            self.scaler.update()
            
            train_loss += loss.item()
            preds = torch.argmax(outputs, dim=1).cpu().numpy()
            all_preds.extend(preds)
            all_labels.extend(labels.cpu().numpy())
            
        avg_loss = train_loss / len(self.train_loader)
        f1 = f1_score(all_labels, all_preds, average='weighted')
        return avg_loss, f1

    def validate(self):
        self.model.eval()
        val_loss = 0
        all_preds = []
        all_probs = []
        all_labels = []
        
        with torch.no_grad():
            for images, labels in self.val_loader:
                images, labels = images.to(self.config['device']), labels.to(self.config['device'])
                outputs = self.model(images)
                loss = self.criterion(outputs, labels)
                
                val_loss += loss.item()
                probs = torch.softmax(outputs, dim=1).cpu().numpy()
                preds = torch.argmax(outputs, dim=1).cpu().numpy()
                
                all_preds.extend(preds)
                all_probs.extend(probs[:, 1]) # Binary focus
                all_labels.extend(labels.cpu().numpy())
                
        avg_loss = val_loss / len(self.val_loader)
        f1 = f1_score(all_labels, all_preds, average='weighted')
        auc = roc_auc_score(all_labels, all_probs)
        return avg_loss, f1, auc

    def fit(self):
        for epoch in range(self.config['epochs']):
            train_loss, train_f1 = self.train_epoch()
            val_loss, val_f1, val_auc = self.validate()
            self.scheduler.step()
            
            print(f"Epoch {epoch+1}/{self.config['epochs']} | "
                  f"Train Loss: {train_loss:.4f} F1: {train_f1:.4f} | "
                  f"Val Loss: {val_loss:.4f} F1: {val_f1:.4f} AUC: {val_auc:.4f}")
            
            if val_f1 > self.best_val_f1:
                self.best_val_f1 = val_f1
                torch.save(self.model.state_dict(), self.config['save_path'])
                print("Model checkpoint saved.")
