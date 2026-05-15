import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  Legend
} from 'recharts';
import { 
  BarChart3, 
  Award, 
  Target, 
  Zap,
  Download,
  Share2
} from 'lucide-react';

const mockMetricData = [
  { epoch: 1, train_acc: 0.65, val_acc: 0.62, loss: 0.85 },
  { epoch: 5, train_acc: 0.72, val_acc: 0.68, loss: 0.65 },
  { epoch: 10, train_acc: 0.78, val_acc: 0.75, loss: 0.45 },
  { epoch: 15, train_acc: 0.84, val_acc: 0.79, loss: 0.35 },
  { epoch: 20, train_acc: 0.89, val_acc: 0.84, loss: 0.28 },
  { epoch: 25, train_acc: 0.92, val_acc: 0.88, loss: 0.22 },
  { epoch: 30, train_acc: 0.95, val_acc: 0.92, loss: 0.18 },
  { epoch: 35, train_acc: 0.97, val_acc: 0.94, loss: 0.15 },
  { epoch: 40, train_acc: 0.98, val_acc: 0.95, loss: 0.12 },
  { epoch: 50, train_acc: 0.99, val_acc: 0.97, loss: 0.08 },
];

const mockScatterData = Array.from({ length: 50 }, (_, i) => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  z: Math.random() * 10,
  type: Math.random() > 0.5 ? 'Normal' : 'Anemic'
}));

export const AnalyticsPanel: React.FC = () => {
  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">Training Analytics</h2>
          <p className="text-[#6C757D] text-sm font-medium">Model performance evaluation and convergence logs.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E9ECEF] rounded-xl text-xs font-bold hover:bg-[#F8F9FA] transition-all">
            <Download size={14} /> Export Logs
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
            <Share2 size={14} /> Share Report
          </button>
        </div>
      </header>

      {/* Hero Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'mAP @.50', value: '0.974', icon: Award, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Precision-Recall', value: '0.958', icon: Target, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'F1 Harmonic', value: '0.966', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((m, i) => (
          <div key={i} className="bg-white p-7 rounded-[32px] border border-[#E9ECEF] flex items-center justify-between shadow-sm group hover:border-blue-200 transition-all">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#6C757D] mb-1">{m.label}</p>
              <h3 className="text-3xl font-black">{m.value}</h3>
            </div>
            <div className={m.bg + " w-14 h-14 rounded-2xl flex items-center justify-center " + m.color + " group-hover:scale-110 transition-transform"}>
              <m.icon size={28} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Learning Curves */}
        <div className="bg-white p-8 rounded-[40px] border border-[#E9ECEF] shadow-sm">
          <h4 className="text-sm font-bold uppercase tracking-widest text-[#6C757D] mb-8">Learning Dynamics</h4>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockMetricData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis dataKey="epoch" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#ADB5BD'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#ADB5BD'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="train_acc" name="Train Accuracy" stroke="#3B82F6" strokeWidth={4} dot={false} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="val_acc" name="Val Accuracy" stroke="#10B981" strokeWidth={4} dot={false} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feature Distribution */}
        <div className="bg-white p-8 rounded-[40px] border border-[#E9ECEF] shadow-sm">
          <h4 className="text-sm font-bold uppercase tracking-widest text-[#6C757D] mb-8">Latent Space (t-SNE)</h4>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" />
                <XAxis type="number" dataKey="x" hide />
                <YAxis type="number" dataKey="y" hide />
                <ZAxis type="number" dataKey="z" range={[50, 400]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Normal" data={mockScatterData.filter(d => d.type === 'Normal')} fill="#10B981" fillOpacity={0.6} />
                <Scatter name="Anemic" data={mockScatterData.filter(d => d.type === 'Anemic')} fill="#EF4444" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-center gap-6">
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                <span className="text-xs font-bold">Class: Healthy</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <span className="text-xs font-bold">Class: Iron Deficient</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
