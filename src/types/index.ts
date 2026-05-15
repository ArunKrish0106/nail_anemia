export type PredictionResult = {
  prediction: string;
  confidence: number;
  probability_normal: number;
  probability_anemic: number;
  heatmap?: string;
  isFallback?: boolean;
  device?: string;
  reasoning?: string;
};

export type HistoryRecord = {
  id: number;
  patient_id?: string;
  prediction: string;
  confidence: number;
  timestamp: string;
  image_data: string;
  heatmap_data?: string;
};

export type HealthInfo = {
  status: string;
  device: string;
  gpu: {
    available: boolean;
    name: string;
    count: number;
  };
};

export type DashboardTab = 'home' | 'prediction' | 'xai' | 'analytics' | 'dataset' | 'reports';
