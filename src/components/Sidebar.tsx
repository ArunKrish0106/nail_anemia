import React from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  Eye, 
  BarChart3, 
  Database, 
  FileText, 
  Settings,
  HelpCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { DashboardTab } from '../types';

interface SidebarProps {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'prediction', label: 'Analysis', icon: Activity },
    { id: 'xai', label: 'Explainability', icon: Eye },
    { id: 'analytics', label: 'Training Logs', icon: BarChart3 },
    { id: 'dataset', label: 'Dataset', icon: Database },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <div className="w-64 bg-white border-r border-[#E9ECEF] flex flex-col h-screen fixed left-0 top-0 z-50">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Activity size={24} />
          </div>
          <span className="font-bold text-lg tracking-tight">NailAnemia AI</span>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as DashboardTab)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                activeTab === item.id 
                  ? "bg-blue-50 text-blue-600 shadow-sm" 
                  : "text-[#6C757D] hover:bg-[#F8F9FA] hover:text-[#1A1A1A]"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-1 border-t border-[#E9ECEF]">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#6C757D] hover:bg-[#F8F9FA] hover:text-[#1A1A1A] transition-all">
          <Settings size={18} />
          Settings
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#6C757D] hover:bg-[#F8F9FA] hover:text-[#1A1A1A] transition-all">
          <HelpCircle size={18} />
          Help Center
        </button>
      </div>
    </div>
  );
};
