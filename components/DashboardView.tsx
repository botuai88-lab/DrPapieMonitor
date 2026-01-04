
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area, PieChart, Pie, Legend
} from 'recharts';
import { 
  Globe, PieChart as PieIcon, Share2, BarChart3, Activity
} from 'lucide-react';
import { Incident, DashboardMetrics } from '../types';

interface DashboardViewProps {
  metrics: DashboardMetrics;
  isLoading: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Chất lượng': '#ef4444',
  'Dịch vụ CSKH': '#f97316',
  'Giá cả': '#eab308',
  'Tin giả': '#8b5cf6',
  'Đối thủ chơi xấu': '#ec4899',
  'Khác': '#64748b'
};

const PLATFORM_COLORS: Record<string, string> = {
  'Facebook': '#1877F2',     // Blue
  'TikTok': '#000000',       // Black
  'YouTube': '#FF0000',      // Red
  'Website/Forum': '#10B981', // Emerald Green (Distinct from FB Blue)
  'Instagram': '#E1306C'     // Pink
};

const DashboardView: React.FC<DashboardViewProps> = ({ metrics, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col h-64 items-center justify-center text-slate-400 gap-4">
        <Activity className="animate-spin text-blue-500" size={32} />
        <span className="font-bold tracking-widest text-[10px] uppercase text-center px-4">Đang kết nối hệ thống dữ liệu...</span>
      </div>
    );
  }

  const isMobile = window.innerWidth < 768;

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in pb-12 font-sans px-1 md:px-0">
      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-1">Tổng lượng thảo luận</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl md:text-4xl font-black text-slate-900">{metrics.totalActive}</h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Lượt nhắc</span>
            </div>
          </div>
          <div className="p-3 md:p-4 bg-blue-50 rounded-xl md:rounded-2xl text-blue-600">
             <Share2 size={isMobile ? 24 : 32} />
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-1">Kênh dẫn đầu</p>
            <h3 className="text-2xl md:text-3xl font-black text-slate-800 truncate max-w-[150px] md:max-w-none">
               {metrics.platformBreakdown[0]?.name || 'N/A'}
            </h3>
            <p className="text-[10px] text-indigo-500 mt-1 font-black uppercase tracking-widest">Nguồn hoạt động chính</p>
          </div>
          <div className="p-3 md:p-4 bg-indigo-50 rounded-xl md:rounded-2xl text-indigo-600">
             <Globe size={isMobile ? 24 : 32} />
          </div>
        </div>
      </div>

      {/* Row 1: Source & Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Source Breakdown */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="mb-6 md:mb-8 text-center md:text-left">
            <h4 className="text-base md:text-lg font-black text-slate-800 flex items-center justify-center md:justify-start gap-2 uppercase tracking-tight">
               <PieIcon size={20} className="text-blue-500" />
               Tỷ trọng nguồn
            </h4>
            <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">Phân bổ theo nền tảng</p>
          </div>
          <div className="flex-1 min-h-[220px] md:min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.platformBreakdown}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {metrics.platformBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PLATFORM_COLORS[entry.name] || '#94a3b8'} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 14-Day Volume Trend */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <div>
              <h4 className="text-base md:text-lg font-black text-slate-800 uppercase tracking-tight">Xu hướng thảo luận</h4>
              <p className="text-[10px] md:text-xs text-slate-400 uppercase font-bold tracking-wider">Diễn biến (14 ngày qua)</p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Thời gian thực</span>
            </div>
          </div>
          <div className="h-56 md:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.recentTrend}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 800}}
                />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Issues Breakdown (Full Width) */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm w-full">
        <h4 className="text-base md:text-lg font-black text-slate-800 mb-1 uppercase tracking-tight flex items-center gap-2">
           <BarChart3 size={20} className="text-purple-500" />
           Vấn đề nổi bật
        </h4>
        <p className="text-[10px] md:text-xs text-slate-400 uppercase font-bold tracking-wider mb-6 md:mb-8">Chủ đề thảo luận chính</p>
        <div className="h-64 md:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={metrics.categoryBreakdown}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 9, fontWeight: 800}} width={isMobile ? 80 : 110} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', fontSize: '10px'}} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                {metrics.categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
