import React from 'react';
import { 
  Clock, 
  History as HistoryIcon,
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';
import { HistoryRecord, PredictionResult } from '../types';
import { cn } from '../lib/utils';

interface HistoryPanelProps {
  history: HistoryRecord[];
  hasMoreHistory: boolean;
  fetchHistory: (reset?: boolean) => void;
  setResult: (result: PredictionResult | null) => void;
  setPreviewUrl: (url: string | null) => void;
  setActiveTab: (tab: any) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  hasMoreHistory,
  fetchHistory,
  setResult,
  setPreviewUrl,
  setActiveTab
}) => {
  return (
    <div className="space-y-6">
       <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Diagnosis History</h2>
          <p className="text-[#6C757D] text-sm">Review past diagnostic records and system outputs.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ADB5BD]" />
            <input 
              type="text" 
              placeholder="Search patient ID..." 
              className="pl-9 pr-4 py-2 bg-white border border-[#E9ECEF] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E9ECEF] rounded-xl text-sm font-bold hover:bg-[#F8F9FA] transition-all">
            <Filter size={16} /> Filter
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {history.length > 0 ? (
          <>
            {history.map((record) => (
              <div 
                key={record.id}
                className="bg-white p-5 rounded-[24px] border border-[#E9ECEF] group hover:border-blue-400 hover:shadow-xl hover:shadow-blue-50 transition-all cursor-pointer flex flex-col"
                onClick={() => {
                  setResult({
                    prediction: record.prediction,
                    confidence: record.confidence,
                    probability_anemic: record.prediction === 'Anemic' ? record.confidence : 1 - record.confidence,
                    probability_normal: record.prediction === 'Normal' ? record.confidence : 1 - record.confidence,
                  });
                  setPreviewUrl(record.image_data);
                  setActiveTab('prediction');
                }}
              >
                <div className="aspect-square bg-[#F8F9FA] rounded-xl overflow-hidden mb-4 relative">
                  <img src={record.image_data} alt="Diagnosis" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className={cn(
                    "absolute top-3 right-3 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm",
                    record.prediction === 'Anemic' ? "bg-orange-600 text-white" : "bg-emerald-600 text-white"
                  )}>
                    {record.prediction}
                  </div>
                </div>
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#6C757D]">
                      ID: {record.patient_id || 'ANON-001'}
                    </span>
                    <span className="text-[10px] font-bold text-blue-600">
                      {(record.confidence * 100).toFixed(1)}% Conf.
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-[#F1F3F5]">
                    <div className="flex items-center gap-1.5 text-[#ADB5BD]">
                      <Clock size={12} />
                      <span className="text-[10px] font-medium">{new Date(record.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {hasMoreHistory && (
              <button 
                onClick={() => fetchHistory(false)}
                className="col-span-full py-6 flex flex-col items-center justify-center gap-2 bg-white rounded-[24px] border-2 border-dashed border-[#E9ECEF] text-[#ADB5BD] hover:text-blue-600 hover:border-blue-200 transition-all font-bold text-sm"
              >
                <div className="w-10 h-10 bg-[#F8F9FA] rounded-full flex items-center justify-center">
                  <HistoryIcon size={20} />
                </div>
                Load More Diagnostic Records
              </button>
            )}
          </>
        ) : (
          <div className="col-span-full py-24 text-center">
            <div className="w-20 h-20 bg-[#F8F9FA] rounded-full flex items-center justify-center mx-auto mb-6 text-[#DEE2E6]">
              <HistoryIcon size={40} />
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">No Records Found</h3>
            <p className="text-[#6C757D] text-sm">You haven't performed any diagnostics yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
