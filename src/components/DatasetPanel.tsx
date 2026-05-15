import React from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  Grid2X2, 
  List,
  Eye,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';

const mockImages = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  url: `https://images.unsplash.com/photo-${1576091160550 + i * 10}?w=400&auto=format&fit=crop&q=60`,
  label: Math.random() > 0.4 ? 'Normal' : 'Anemic',
  quality: 0.95 - Math.random() * 0.1
}));

export const DatasetPanel: React.FC = () => {
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dataset Explorer</h2>
          <p className="text-[#6C757D] text-sm">Curated clinical dataset for iron deficiency research.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-[#E9ECEF] self-start md:self-center">
          <button 
            onClick={() => setViewMode('grid')}
            className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-blue-50 text-blue-600 shadow-sm" : "text-[#ADB5BD]")}
          >
            <Grid2X2 size={18} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-blue-50 text-blue-600 shadow-sm" : "text-[#ADB5BD]")}
          >
            <List size={18} />
          </button>
        </div>
      </header>

      <div className="bg-amber-50 p-6 rounded-[32px] border border-amber-100 flex gap-4 items-start">
        <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={24} />
        <div>
          <h4 className="text-sm font-bold text-amber-900 mb-1">Class Imbalance Detected</h4>
          <p className="text-xs text-amber-700 leading-relaxed">
            The current training subset contains 72.4% 'Normal' cases. The model uses WeightedCrossEntropy with alpha=1.5 for the minority 'Anemic' class to ensure robust sensitivity in clinical settings.
          </p>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ADB5BD]" />
          <input 
            type="text" 
            placeholder="Search tags or IDs..." 
            className="w-full pl-10 pr-4 py-3 bg-white border border-[#E9ECEF] rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all font-medium"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white border border-[#E9ECEF] rounded-2xl text-sm font-bold hover:bg-[#F8F9FA] transition-all">
          <Filter size={16} /> Filters
        </button>
      </div>

      <div className={cn(
        "grid gap-6",
        viewMode === 'grid' ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6" : "grid-cols-1"
      )}>
        {mockImages.map((img) => (
          <div key={img.id} className="bg-white rounded-3xl overflow-hidden border border-[#E9ECEF] group hover:border-blue-400 hover:shadow-xl hover:shadow-blue-50/50 transition-all cursor-pointer">
            <div className="aspect-square relative overflow-hidden">
              <img src={img.url} alt="Nail sample" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg text-[8px] font-black uppercase text-white tracking-widest">
                Q: {(img.quality * 100).toFixed(0)}%
              </div>
            </div>
            <div className="p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                 <span className={cn(
                  "text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-widest",
                  img.label === 'Normal' ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                 )}>
                   {img.label}
                 </span>
                 <span className="text-[10px] font-bold text-[#ADB5BD]">IMG-{img.id.toString().padStart(3, '0')}</span>
              </div>
              <button className="w-full flex items-center justify-center gap-2 py-2 bg-[#F8F9FA] rounded-xl text-[10px] font-bold text-[#6C757D] hover:bg-blue-600 hover:text-white transition-all">
                <Eye size={12} /> Inspect Metadata
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
