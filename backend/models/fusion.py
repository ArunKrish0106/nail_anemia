import torch
import torch.nn as nn
from .cnn_branch import CNNBranch
from .vit_branch import ViTBranch

class AttentionModule(nn.Module):
    def __init__(self, dim):
        super().__init__()
        self.attn = nn.Sequential(
            nn.Linear(dim, dim // 4),
            nn.ReLU(),
            nn.Linear(dim // 4, dim),
            nn.Sigmoid()
        )
    def forward(self, x):
        return x * self.attn(x)

class CrossAttention(nn.Module):
    def __init__(self, dim, num_heads=8, qkv_bias=True, attn_drop=0.1, proj_drop=0.1):
        super().__init__()
        self.num_heads = num_heads
        head_dim = dim // num_heads
        self.scale = head_dim ** -0.5

        self.q = nn.Linear(dim, dim, bias=qkv_bias)
        self.k = nn.Linear(dim, dim, bias=qkv_bias)
        self.v = nn.Linear(dim, dim, bias=qkv_bias)
        self.attn_drop = nn.Dropout(attn_drop)
        self.proj = nn.Linear(dim, dim)
        self.proj_drop = nn.Dropout(proj_drop)

    def forward(self, x_q, x_kv):
        B, N, C = x_q.shape
        _, M, _ = x_kv.shape
        q = self.q(x_q).reshape(B, N, self.num_heads, C // self.num_heads).permute(0, 2, 1, 3)
        k = self.k(x_kv).reshape(B, M, self.num_heads, C // self.num_heads).permute(0, 2, 1, 3)
        v = self.v(x_kv).reshape(B, M, self.num_heads, C // self.num_heads).permute(0, 2, 1, 3)

        attn = (q @ k.transpose(-2, -1)) * self.scale
        attn = attn.softmax(dim=-1)
        attn = self.attn_drop(attn)

        x = (attn @ v).transpose(1, 2).reshape(B, N, C)
        x = self.proj(x)
        x = self.proj_drop(x)
        return x

class AdvancedFusionModel(nn.Module):
    def __init__(self, num_classes=2, dropout=0.3):
        super(AdvancedFusionModel, self).__init__()
        self.cnn_branch = CNNBranch()
        self.vit_branch = ViTBranch()
        
        fusion_dim = 512
        self.cnn_proj = nn.Sequential(
            nn.AdaptiveAvgPool2d((1, 1)),
            nn.Flatten(),
            nn.Linear(self.cnn_branch.num_features, fusion_dim),
            nn.LayerNorm(fusion_dim),
            nn.ReLU(),
            nn.Dropout(dropout)
        )
        self.vit_proj = nn.Sequential(
            nn.Linear(self.vit_branch.num_features, fusion_dim),
            nn.LayerNorm(fusion_dim),
            nn.ReLU(),
            nn.Dropout(dropout)
        )
        
        # Cross-Attention Fusion Blocks
        self.cv_attn = CrossAttention(dim=fusion_dim)
        self.vc_attn = CrossAttention(dim=fusion_dim)
        
        # SE Attention after fusion
        self.se_module = AttentionModule(fusion_dim * 2)
        
        # Classification Head
        self.classifier = nn.Sequential(
            nn.Linear(fusion_dim * 2, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, num_classes)
        )

    def forward(self, x):
        cnn_feat = self.cnn_branch(x) # [B, C, H, W]
        vit_feat = self.vit_branch(x) # [B, D]
        
        c = self.cnn_proj(cnn_feat) 
        v = self.vit_proj(vit_feat)
        
        # Dual-branch Cross Attention
        c_q, v_q = c.unsqueeze(1), v.unsqueeze(1)
        
        f1 = self.cv_attn(c_q, v_q).squeeze(1)
        f2 = self.vc_attn(v_q, c_q).squeeze(1)
        
        # Fusion
        fused = torch.cat([f1, f2], dim=1)
        fused = self.se_module(fused)
        
        return self.classifier(fused)
