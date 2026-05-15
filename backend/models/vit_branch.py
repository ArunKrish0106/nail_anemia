import torch
import torch.nn as nn
import timm

class ViTBranch(nn.Module):
    """
    Vision Transformer branch using Swin Transformer for global feature extraction.
    """
    def __init__(self, model_name="swin_tiny_patch4_window7_224", pretrained=True):
        super(ViTBranch, self).__init__()
        self.base = timm.create_model(model_name, pretrained=pretrained, num_classes=0)
        
        # Determine the number of output channels
        with torch.no_grad():
            dummy = torch.randn(1, 3, 224, 224)
            features = self.base(dummy)
            self.num_features = features.shape[1]

    def forward(self, x):
        return self.base(x) # Output shape: [B, D]
