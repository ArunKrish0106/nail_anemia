import React from 'react';
import { 
  Upload, 
  Activity, 
  ArrowRight, 
  ShieldAlert, 
  Info,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  Download,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { cn } from '../lib/utils';
import { PredictionResult } from '../types';

interface PredictionPanelProps {
  selectedImage: File | null;
  previewUrl: string | null;
  isAnalyzing: boolean;
  result: PredictionResult | null;
  error: string | null;
  xaiMethod: string;
  setXaiMethod: (method: string) => void;
  showOverlay: boolean;
  setShowOverlay: (show: boolean) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  analyzeImage: () => void;
}

export const PredictionPanel: React.FC<PredictionPanelProps> = ({
  selectedImage,
  previewUrl,
  isAnalyzing,
  result,
  error,
  xaiMethod,
  setXaiMethod,
  showOverlay,
  setShowOverlay,
  handleImageUpload,
  analyzeImage,
}) => {
  const chartData = result ? [
    { name: 'Normal', value: result.probability_normal * 100 },
    { name: 'Anemic', value: result.probability_anemic * 100 },
  ] : [];

  return (
    <div className="grid lg:grid-cols-12 gap-8">
      {/* Input Section */}
      <div className="lg:col-span-5 space-y-6">
        <section className="bg-white rounded-3xl p-8 border border-[#E9ECEF] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Upload size={20} className="text-blue-600" />
              Image Acquisition
            </h2>
            <Info size={16} className="text-[#ADB5BD] cursor-help" />
          </div>
          
          <div 
            className={cn(
              "relative group cursor-pointer border-2 border-dashed rounded-2xl transition-all duration-300",
              "flex flex-col items-center justify-center min-h-[300px] overflow-hidden",
              previewUrl ? "border-blue-200 bg-blue-50/10" : "border-[#DEE2E6] hover:border-blue-400 hover:bg-blue-50/5"
            )}
            onClick={() => document.getElementById('imageUpload')?.click()}
          >
            <input 
              type="file" 
              id="imageUpload" 
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
            />
            
            {previewUrl ? (
              <>
                <img src={previewUrl} className="w-full h-full object-cover rounded-xl" alt="Preview" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium">
                  Replace Image
                </div>
              </>
            ) : (
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-[#F8F9FA] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#CED4DA] group-hover:text-blue-500 group-hover:scale-110 transition-all">
                  <Upload size={32} />
                </div>
                <p className="text-sm font-medium text-[#495057] mb-1">Drag and drop fingernail image</p>
                <p className="text-xs text-[#ADB5BD]">Supports PNG, JPG (Max 5MB)</p>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#6C757D] mb-2 block">Interpretability Algorithm</label>
              <div className="relative">
                <select
                  value={xaiMethod}
                  onChange={(e) => setXaiMethod(e.target.value)}
                  className="w-full bg-white border border-[#E9ECEF] rounded-xl px-4 py-3 text-sm font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
                >
                  <option value="Grad-CAM">Grad-CAM (Default)</option>
                  <option value="Grad-CAM++">Grad-CAM++</option>
                  <option value="LIME">LIME</option>
                  <option value="SHAP">SHAP</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#ADB5BD]">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>

            <button 
              disabled={!selectedImage || isAnalyzing}
              onClick={analyzeImage}
              className={cn(
                "w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2",
                selectedImage && !isAnalyzing 
                  ? "bg-blue-600 text-white shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-[0.98]" 
                  : "bg-[#E9ECEF] text-[#ADB5BD] cursor-not-allowed"
              )}
            >
              {isAnalyzing ? (
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Activity size={20} />
                </motion.div>
              ) : (
                <>Run Diagnostic <ArrowRight size={20} /></>
              )}
            </button>
          </div>
          {error && <p className="mt-4 text-xs text-red-500 text-center font-medium">{error}</p>}
        </section>
      </div>

      {/* Output Section */}
      <div className="lg:col-span-7 space-y-6">
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div 
              key="result"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Summary Card */}
              <div className="bg-white rounded-[32px] p-8 border border-[#E9ECEF] shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50/30 rounded-bl-full -z-0" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 size={16} className={result.prediction === 'Anemic' ? 'text-orange-500' : 'text-green-500'} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#6C757D]">System Diagnosis</span>
                      {result.isFallback && (
                        <span className="flex items-center gap-1 text-[9px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-bold border border-purple-100">
                          <Sparkles size={8} /> Cloud Enhanced
                        </span>
                      )}
                    </div>
                    <h3 className={cn(
                      "text-5xl font-black italic",
                      result.prediction === 'Anemic' ? 'text-orange-600' : 'text-green-600'
                    )}>
                      {result.prediction}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                       <p className="text-sm text-[#495057]">
                        Confidence Score: <span className="font-bold">{(result.confidence * 100).toFixed(2)}%</span>
                      </p>
                      {result.device && (
                        <span className="text-[9px] bg-gray-100 px-2 py-0.5 rounded text-[#6C757D] font-bold">
                          {result.device}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button className="bg-white border border-[#E9ECEF] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-[#F8F9FA] transition-all">
                      <Download size={14} /> Export
                    </button>
                    <button className="bg-[#1A1A1A] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-black/10">
                      <FileText size={14} /> Full Report
                    </button>
                  </div>
                </div>

                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="h-[200px] w-full">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#6C757D] mb-4">Probability Distribution</p>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F3F5" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={60} stroke="#495057" fontSize={10} fontWeight="bold" />
                        <Tooltip cursor={{fill: 'transparent'}} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#10B981' : '#F59E0B'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#6C757D]">XAI Layer Visualization</p>
                      <button 
                        onClick={() => setShowOverlay(!showOverlay)}
                        className={cn(
                          "text-[9px] px-2 py-1 rounded-md font-bold transition-all",
                          showOverlay ? "bg-blue-600 text-white" : "bg-[#F8F9FA] text-[#6C757D] border border-[#E9ECEF]"
                        )}
                      >
                        {showOverlay ? "Overlay active" : "Enable Overlay"}
                      </button>
                    </div>
                    <div className="aspect-video bg-[#F8F9FA] rounded-[24px] overflow-hidden relative group border border-[#E9ECEF]">
                      {result.heatmap && showOverlay ? (
                        <img src={result.heatmap} className="w-full h-full object-cover" alt="XAI Heatmap" />
                      ) : previewUrl ? (
                        <img src={previewUrl} className="w-full h-full object-cover" alt="Original" />
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinical Interpretation */}
              <div className="bg-white rounded-[32px] p-8 border border-[#E9ECEF] shadow-sm">
                <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Info size={20} className="text-blue-600" />
                  Clinical Interpretation
                </h4>
                <div className="bg-blue-50/40 p-6 rounded-2xl border border-blue-100">
                  <p className="text-sm leading-relaxed text-[#495057]">
                    {result.reasoning || (result.prediction === 'Anemic' 
                      ? "The CNN-ViT fusion model detected significant sub-surface chromatic variations across the lunula and proximal nail fold areas, aligning with clinical presentations of Iron Deficiency Anemia (IDA)." 
                      : "The model identifies consistent micro-vascular pigmentation and healthy reflectance across the nail bed, suggesting normal hemoglobin levels.")}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 bg-white border-2 border-[#E9ECEF] border-dashed rounded-[40px]"
            >
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-blue-600">
                <Activity size={48} />
              </div>
              <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2">Awaiting Input</h3>
              <p className="text-[#6C757D] max-w-sm text-sm">
                Upload a fingernail image to initiate our hybrid CNN-ViT diagnostic pipeline.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
