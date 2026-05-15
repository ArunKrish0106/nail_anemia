/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { GoogleGenAI } from "@google/genai";
import { Sidebar } from './components/Sidebar';
import { DashboardHome } from './components/DashboardHome';
import { PredictionPanel } from './components/PredictionPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { DatasetPanel } from './components/DatasetPanel';
import { ReportsPanel } from './components/ReportsPanel';
import { 
  PredictionResult, 
  HistoryRecord, 
  HealthInfo, 
  DashboardTab 
} from './types';
import { cn } from './lib/utils';
import { 
  Bell, 
  Search, 
  Moon, 
  Sun,
  User
} from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('home');
  const [darkMode, setDarkMode] = useState(false);
  
  // Analysis State
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [xaiMethod, setXaiMethod] = useState<string>("Grad-CAM");
  const [showOverlay, setShowOverlay] = useState(true);
  
  // History State
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [historyPage, setHistoryPage] = useState(0);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const HISTORY_PAGE_SIZE = 12;

  // Health State
  const [healthInfo, setHealthInfo] = useState<HealthInfo | null>(null);

  useEffect(() => {
    fetchHealth();
    fetchHistory(true);
  }, []);

  const fetchHealth = async () => {
    try {
      const response = await axios.get('/diag-api/health');
      setHealthInfo(response.data);
    } catch (err) {
      console.error("Health check failed", err);
    }
  };

  const fetchHistory = async (reset = false) => {
    try {
      const skip = reset ? 0 : historyPage * HISTORY_PAGE_SIZE;
      const response = await axios.get(`/diag-api/predict_history?skip=${skip}&limit=${HISTORY_PAGE_SIZE}`);
      
      if (Array.isArray(response.data)) {
        if (reset) {
          setHistory(response.data);
          setHistoryPage(1);
          setHasMoreHistory(response.data.length === HISTORY_PAGE_SIZE);
        } else {
          setHistory(prev => [...prev, ...response.data]);
          setHistoryPage(prev => prev + 1);
          setHasMoreHistory(response.data.length === HISTORY_PAGE_SIZE);
        }
      } else {
        console.error("Invalid history data received:", response.data);
        setError("Could not load history. Please ensure the backend is running.");
      }
    } catch (err: any) {
      console.error("Failed to fetch history", err);
      if (err.response?.status === 401) {
        setError("Unauthorized access to history. Please refresh the page.");
      } else {
        setError("Failed to connect to diagnostic backend.");
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
      setActiveTab('prediction');
    }
  };

  const analyzeWithGemini = async (file: File): Promise<PredictionResult> => {
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve) => {
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
    const base64 = await base64Promise;
    
    const prompt = `Analyze this fingernail for signs of Anemia. Respond in JSON with keys: prediction ("Anemic" or "Normal"), confidence (float), probability_normal (float), probability_anemic (float), reasoning (string).`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: file.type, data: base64 } }] }],
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '{}');
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedImage);

    try {
      const response = await axios.post(`/diag-api/predict?xai_method=${xaiMethod}`, formData);
      setResult(response.data);
      fetchHistory(true);
    } catch (err) {
      console.warn("Local backend failed, using Gemini AI.", err);
      try {
        const geminiResult = await analyzeWithGemini(selectedImage);
        setResult({ ...geminiResult, isFallback: true });
      } catch (geminiErr) {
        setError("Analysis failed. Please check network.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <DashboardHome healthInfo={healthInfo} />;
      case 'prediction':
        return (
          <PredictionPanel 
            selectedImage={selectedImage}
            previewUrl={previewUrl}
            isAnalyzing={isAnalyzing}
            result={result}
            error={error}
            xaiMethod={xaiMethod}
            setXaiMethod={setXaiMethod}
            showOverlay={showOverlay}
            setShowOverlay={setShowOverlay}
            handleImageUpload={handleImageUpload}
            analyzeImage={analyzeImage}
          />
        );
      case 'xai':
        return (
          <div className="bg-white p-8 rounded-[40px] border border-[#E9ECEF] h-[600px] flex flex-col items-center justify-center text-center">
             <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-blue-600">
                <Search size={40} />
             </div>
             <h3 className="text-xl font-bold mb-2">Advanced XAI Explorer</h3>
             <p className="text-[#6C757D] max-w-sm">Deep inspection mode for feature attribution. Select a processed record from history to explore heatmaps.</p>
             <button 
              onClick={() => setActiveTab('reports')}
              className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100"
             >
               View Comparison Reports
             </button>
          </div>
        );
      case 'analytics':
        return <AnalyticsPanel />;
      case 'dataset':
        return <DatasetPanel />;
      case 'reports':
        return <ReportsPanel />;
      default:
        return <DashboardHome healthInfo={healthInfo} />;
    }
  };

  return (
    <div className={cn("min-h-screen font-sans", darkMode ? "bg-[#0B0E14] text-white" : "bg-[#F8F9FA] text-[#1A1A1A]")}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="pl-64 min-h-screen flex flex-col">
        {/* Top Navbar */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#E9ECEF] sticky top-0 z-40 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ADB5BD] group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Quick search commands..." 
                className="pl-10 pr-4 py-2 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all w-80"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-[#6C757D] hover:bg-[#F8F9FA] transition-all border border-[#E9ECEF]"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="w-10 h-10 rounded-xl flex items-center justify-center text-[#6C757D] hover:bg-[#F8F9FA] transition-all border border-[#E9ECEF] relative">
              <Bell size={20} />
              <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-10 w-[1px] bg-[#E9ECEF] mx-2" />
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right">
                <p className="text-sm font-bold leading-none">Diagnostic Center</p>
                <p className="text-[10px] text-[#6C757D] font-bold uppercase tracking-widest mt-1">Admin Access</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-8 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Global Floating History Button (Mobile/Tablet accessibility) */}
        {activeTab !== 'home' && (
          <HistoryPanel 
            history={history}
            hasMoreHistory={hasMoreHistory}
            fetchHistory={fetchHistory}
            setResult={setResult}
            setPreviewUrl={setPreviewUrl}
            setActiveTab={setActiveTab}
          />
        )}
      </main>
    </div>
  );
}
