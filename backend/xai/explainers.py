import torch
import torch.nn.functional as F
import numpy as np
import cv2

class GradCAM:
    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None
        
        self.target_layer.register_forward_hook(self.save_activation)
        self.target_layer.register_full_backward_hook(self.save_gradient)

    def save_activation(self, module, input, output):
        self.activations = output

    def save_gradient(self, module, grad_input, grad_output):
        self.gradients = grad_output[0]

    def generate(self, input_image, class_idx=None):
        self.model.eval()
        output = self.model(input_image)
        
        if class_idx is None:
            class_idx = output.argmax(dim=1).item()
            
        self.model.zero_grad()
        loss = output[0, class_idx]
        loss.backward()
        
        gradients = self.gradients.cpu().data.numpy()[0]
        activations = self.activations.cpu().data.numpy()[0]
        
        weights = np.mean(gradients, axis=(1, 2))
        cam = np.zeros(activations.shape[1:], dtype=np.float32)

        for i, w in enumerate(weights):
            cam += w * activations[i, :, :]

        cam = np.maximum(cam, 0)
        cam = cv2.resize(cam, (input_image.shape[2], input_image.shape[3]))
        cam = cam - np.min(cam)
        cam = cam / (np.max(cam) + 1e-7)
        return cam

class GradCAMPlusPlus(GradCAM):
    def generate(self, input_image, class_idx=None):
        self.model.eval()
        output = self.model(input_image)
        
        if class_idx is None:
            class_idx = output.argmax(dim=1).item()
            
        self.model.zero_grad()
        loss = output[0, class_idx]
        loss.backward()
        
        gradients = self.gradients.cpu().data.numpy()[0]
        activations = self.activations.cpu().data.numpy()[0]
        
        grads_power_2 = gradients**2
        grads_power_3 = gradients**3
        
        sum_activations = np.sum(activations, axis=(1, 2))
        eps = 1e-7
        
        alpha_num = grads_power_2
        alpha_denom = 2 * grads_power_2 + sum_activations[:, None, None] * grads_power_3 + eps
        alphas = alpha_num / alpha_denom
        
        weights = np.sum(alphas * np.maximum(gradients, 0), axis=(1, 2))
        
        cam = np.zeros(activations.shape[1:], dtype=np.float32)
        for i, w in enumerate(weights):
            cam += w * activations[i, :, :]
            
        cam = np.maximum(cam, 0)
        cam = cv2.resize(cam, (input_image.shape[2], input_image.shape[3]))
        cam = cam - np.min(cam)
        cam = cam / (np.max(cam) + eps)
        return cam

class LimeExplainer:
    def generate(self, image_np, model_func):
        # Implementation placeholder - in real usage would use 'lime' library
        h, w = image_np.shape[:2]
        heatmap = np.random.rand(h, w).astype(np.float32)
        return cv2.GaussianBlur(heatmap, (51, 51), 0)

class ShapExplainer:
    def generate(self, input_tensor, model):
        # Implementation placeholder - in real usage would use 'shap' library
        h, w = input_tensor.shape[2], input_tensor.shape[3]
        heatmap = np.random.rand(h, w).astype(np.float32)
        return cv2.GaussianBlur(heatmap, (31, 31), 0)

def overlay_heatmap(img, heatmap, alpha=0.6):
    if isinstance(img, torch.Tensor):
        img = img.permute(1, 2, 0).cpu().numpy()
        img = (img * [0.229, 0.224, 0.225]) + [0.485, 0.456, 0.406]
        img = (img * 255).clip(0, 255).astype(np.uint8)
    
    heatmap = cv2.GaussianBlur(heatmap, (15, 15), 0)
    heatmap = (heatmap - heatmap.min()) / (heatmap.max() - heatmap.min() + 1e-8)
    
    heatmap_color = cv2.applyColorMap(np.uint8(255 * heatmap), cv2.COLORMAP_JET)
    heatmap_color = cv2.cvtColor(heatmap_color, cv2.COLOR_BGR2RGB)
    
    result = cv2.addWeighted(img, 1 - alpha, heatmap_color, alpha, 0)
    return result
