
import React, { useState, useMemo } from 'react';
import { Incident, Platform, Status, Category } from '../types';
import { Filter, Search, ExternalLink, ChevronDown, CheckCircle, Clock, User, MessageSquare, Share2 } from 'lucide-react';

interface IncidentListViewProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  isLoading: boolean;
}

const IncidentListView: React.FC<IncidentListViewProps> = ({ incidents, onSelectIncident, isLoading }) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    return incidents.filter(item => {
      const matchSeverity = filterSeverity === 'all' || item.severity.toString() === filterSeverity;
      const matchPlatform = filterPlatform === 'all' || item.platform === filterPlatform;
      const matchStatus = filterStatus === 'all' || item.status === filterStatus;
      const matchSearch = item.snippet.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.author.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchSeverity && matchPlatform && matchStatus && matchSearch;
    });
  }, [incidents, filterSeverity, filterPlatform, filterStatus, searchTerm]);

  const getSeverityBadge = (level: number) => {
    const base = "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border";
    switch (level) {
      case 5: return <span className={`${base} bg-red-50 text-red-600 border-red-200`}>L5 NGUY CẤP</span>;
      case 4: return <span className={`${base} bg-orange-50 text-orange-600 border-orange-200`}>L4 CAO</span>;
      case 3: return <span className={`${base} bg-yellow-50 text-yellow-600 border-yellow-200`}>L3 TB</span>;
      default: return <span className={`${base} bg-slate-50 text-slate-600 border-slate-200`}>L{level} THẤP</span>;
    }
  };

  const getStatusColor = (status: Status) => {
    switch(status) {
        case Status.RESOLVED: return 'bg-green-50 text-green-700 border-green-200';
        case Status.PENDING: return 'bg-red-50 text-red-700 border-red-200';
        default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  if (isLoading) return <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Đang tải dữ liệu...</div>;

  return (
    <div className="space-y-4 h-full flex flex-col px-1 md:px-0">
      {/* Filters Toolbar - Responsive Wrap */}
      <div className="bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-3 md:flex-row md:items-center md:justify-between sticky top-0 z-10">
        <div className="flex gap-2 w-full overflow-x-auto pb-1 md:pb-0 hide-scrollbar no-scrollbar">
          <div className="relative shrink-0">
            <select 
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-[10px] md:text-xs font-black bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase tracking-widest text-slate-600 cursor-pointer"
            >
              <option value="all">Mức độ: Tất cả</option>
              <option value="5">Nguy cấp (5)</option>
              <option value="4">Cao (4)</option>
              <option value="3">Trung bình (3)</option>
            </select>
            <ChevronDown className="absolute right-2 top-2.5 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative shrink-0">
             <select 
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-[10px] md:text-xs font-black bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase tracking-widest text-slate-600 cursor-pointer"
            >
              <option value="all">Nền tảng: Tất cả</option>
              {Object.values(Platform).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-2.5 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>

           <div className="relative shrink-0">
             <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-[10px] md:text-xs font-black bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase tracking-widest text-slate-600 cursor-pointer"
            >
              <option value="all">Trạng thái: Tất cả</option>
              {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-2.5 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="relative w-full md:w-64 shrink-0">
          <input 
            type="text" 
            placeholder="Tìm kiếm dữ liệu..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-[10px] md:text-xs font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Card View for Mobile / Tablet */}
      <div className="md:hidden grid grid-cols-1 gap-3 overflow-auto pb-8">
          {filteredData.map((item) => (
              <div 
                key={item.id} 
                onClick={() => onSelectIncident(item)}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm active:scale-95 transition-transform"
              >
                  <div className="flex justify-between items-start mb-3">
                      {getSeverityBadge(item.severity)}
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                  </div>
                  <h3 className="text-xs font-black text-slate-900 mb-1 truncate">{item.author} <span className="text-slate-400 font-medium">trên {item.platform}</span></h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 italic mb-3">"{item.snippet}"</p>
                  
                  <div className="flex justify-between items-center border-t border-slate-50 pt-3">
                      <div className="flex gap-3">
                          <span className="flex items-center text-[9px] font-black text-slate-400 uppercase gap-1">
                              <MessageSquare size={10} className="text-blue-500"/> {item.comments || 0}
                          </span>
                          <span className="flex items-center text-[9px] font-black text-slate-400 uppercase gap-1">
                              <Share2 size={10} className="text-purple-500"/> {item.shares || 0}
                          </span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-400">{new Date(item.timestamp).toLocaleDateString('vi-VN')}</span>
                  </div>
              </div>
          ))}
          {filteredData.length === 0 && <div className="p-12 text-center text-slate-400 text-xs font-bold uppercase">Không tìm thấy dữ liệu</div>}
      </div>

      {/* Desktop Table View - Hidden on mobile */}
      <div className="hidden md:block flex-1 overflow-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">Mức độ</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">Ngữ cảnh</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 w-1/3">Nội dung & Tác động</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">Trạng thái</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.map((item) => (
              <tr 
                key={item.id} 
                onClick={() => onSelectIncident(item)}
                className="hover:bg-slate-50 cursor-pointer transition-colors group"
              >
                <td className="p-4 align-top">
                  {getSeverityBadge(item.severity)}
                </td>
                <td className="p-4 align-top">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-black text-slate-900">{item.platform}</span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono uppercase">
                        <Clock size={12} /> {new Date(item.timestamp).toLocaleDateString('vi-VN')}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 truncate max-w-[120px] font-bold" title={item.author}>
                        <User size={12} /> {item.author}
                    </span>
                  </div>
                </td>
                <td className="p-4 align-top">
                    <div className="mb-2">
                        <span className="text-[9px] uppercase font-black text-blue-600 tracking-widest bg-blue-50 px-2 py-0.5 rounded-full">{item.category}</span>
                    </div>
                  <p className="text-xs text-slate-800 line-clamp-2 mb-3 leading-relaxed">"{item.snippet}"</p>
                  
                  <div className="flex gap-4">
                      <div className="flex items-center text-[9px] font-black text-slate-400">
                          <MessageSquare size={12} className="mr-1 text-blue-500"/>
                          {item.comments || 0}
                      </div>
                      <div className="flex items-center text-[9px] font-black text-slate-400">
                          <Share2 size={12} className="mr-1 text-purple-500"/>
                          {item.shares || 0}
                      </div>
                  </div>
                </td>
                <td className="p-4 align-top">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-4 align-top text-right">
                  <button className="text-slate-400 hover:text-blue-600 transition-colors p-2 bg-slate-50 rounded-xl">
                    <ExternalLink size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-[10px] font-black text-slate-400 text-right px-2 uppercase tracking-widest pb-4 md:pb-0">
        Đồng bộ: {filteredData.length} bản ghi
      </div>
    </div>
  );
};

export default IncidentListView;
