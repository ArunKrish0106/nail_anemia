import React from 'react';
import { 
  Activity, 
  Users, 
  TrendingUp, 
  ShieldCheck,
  Cpu,
  Zap
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { HealthInfo } from '../types';

interface DashboardHomeProps {
  healthInfo: HealthInfo | null;
}

const mockTrendData = [
  { name: 'Mon', value: 85 },
  { name: 'Tue', value: 88 },
  { name: 'Wed', value: 82 },
  { name: 'Thu', value: 91 },
  { name: 'Fri', value: 89 },
  { name: 'Sat', value: 94 },
  { name: 'Sun', value: 92 },
];

const mockDistributionData = [
  { name: 'Normal', value: 65 },
  { name: 'Anemic', value: 35 },
];

const COLORS = ['#10B981', '#F59E0B'];

export const DashboardHome: React.FC<DashboardHomeProps> = ({ healthInfo }) => {
  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">System Overview</h2>
        <p className="text-[#6C757D] text-sm">Real-time diagnostics and model health monitoring.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Analyses', value: '1,284', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Avg. Confidence', value: '94.2%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Clinical Validation', value: '98.1%', icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Total Patients', value: '412', icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-[#E9ECEF] shadow-sm">
            <div className={stat.bg + " w-12 h-12 rounded-2xl flex items-center justify-center " + stat.color + " mb-4"}>
              <stat.icon size={24} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#6C757D] mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Confidence Trends */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-[#E9ECEF] shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#6C757D] mb-6">Confidence Trends</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockTrendData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#ADB5BD'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#ADB5BD'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white p-8 rounded-3xl border border-[#E9ECEF] shadow-sm flex flex-col">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#6C757D] mb-6">System Health</h3>
          <div className="space-y-6 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <Zap size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold">API Status</p>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase">Operational</p>
                </div>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <Cpu size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold">Compute Mode</p>
                  <p className="text-[10px] text-[#6C757D] font-bold uppercase">
                    {healthInfo?.gpu?.available ? `GPU: ${healthInfo.gpu.name}` : 'CPU Acceleration'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#E9ECEF]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#6C757D] mb-4">Class Distribution</p>
              <div className="h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockDistributionData}
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {mockDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {mockDistributionData.map((entry, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-[9px] font-bold text-[#495057]">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
