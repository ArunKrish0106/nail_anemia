import torch
import torch.nn as nn
import timm

class CNNBranch(nn.Module):
    """
    CNN Branch using EfficientNetV2 for feature extraction from fingernail images.
    """
    def __init__(self, model_name="efficientnetv2_rw_s", pretrained=True):
        super(CNNBranch, self).__init__()
        self.base = timm.create_model(model_name, pretrained=pretrained, num_classes=0, global_pool='')
        
        # Determine the number of output channels
        with torch.no_grad():
            dummy = torch.randn(1, 3, 224, 224)
            features = self.base(dummy)
            self.num_features = features.shape[1]

    def forward(self, x):
        return self.base(x) # Output shape: [B, C, H, W]
