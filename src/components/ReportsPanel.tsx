import React from 'react';
import { 
  FileText, 
  Download, 
  ExternalLink, 
  Clock, 
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { cn } from '../lib/utils';

const mockReports = [
  { id: 'RPT-8231', date: '2026-05-12', status: 'Finalized', patient: 'ANON-0013', accuracy: 0.98 },
  { id: 'RPT-8229', date: '2026-05-11', status: 'Pending Review', patient: 'ANON-0024', accuracy: 0.94 },
  { id: 'RPT-8225', date: '2026-05-10', status: 'Finalized', patient: 'ANON-0102', accuracy: 0.99 },
  { id: 'RPT-8212', date: '2026-05-09', status: 'Finalized', patient: 'ANON-0091', accuracy: 0.95 },
];

export const ReportsPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Clinical Reports</h2>
          <p className="text-[#6C757D] text-sm">Downloadable diagnostic summaries and patient analytics.</p>
        </div>
        <button className="bg-[#1A1A1A] text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-black/10">
          <Download size={18} /> Batch Export (PDF)
        </button>
      </header>

      <div className="bg-white rounded-[40px] border border-[#E9ECEF] overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8F9FA] border-b border-[#E9ECEF]">
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-[#6C757D]">Report ID</th>
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-[#6C757D]">Patient ID</th>
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-[#6C757D]">Generation Date</th>
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-[#6C757D]">Status</th>
              <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-[#6C757D]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockReports.map((row) => (
              <tr key={row.id} className="border-b border-[#F1F3F5] group hover:bg-[#F8F9FA]/50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                      <FileText size={20} />
                    </div>
                    <span className="text-sm font-bold">{row.id}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="text-sm font-medium text-[#495057]">{row.patient}</span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-[#6C757D]">
                    <Clock size={14} />
                    <span className="text-sm font-medium uppercase text-[10px]">{row.date}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                    row.status === 'Finalized' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                  )}>
                    <div className={cn("w-1 h-1 rounded-full", row.status === 'Finalized' ? "bg-emerald-500" : "bg-amber-500")} />
                    {row.status}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <button className="p-2 text-[#ADB5BD] hover:text-blue-600 transition-colors">
                      <Download size={18} />
                    </button>
                    <button className="p-2 text-[#ADB5BD] hover:text-blue-600 transition-colors">
                      <ExternalLink size={18} />
                    </button>
                    <button className="p-2 text-[#ADB5BD] hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="p-8 bg-[#F8F9FA] flex justify-between items-center">
           <p className="text-xs text-[#ADB5BD] font-medium">Showing 4 of 128 reports generated in the current version.</p>
           <div className="flex gap-2">
             <button className="px-4 py-2 bg-white border border-[#E9ECEF] rounded-xl text-xs font-bold disabled:opacity-50" disabled>Previous</button>
             <button className="px-4 py-2 bg-white border border-[#E9ECEF] rounded-xl text-xs font-bold">Next</button>
           </div>
        </div>
      </div>
    </div>
  );
};
