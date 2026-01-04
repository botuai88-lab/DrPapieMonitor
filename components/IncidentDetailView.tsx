
import React from 'react';
import { Incident, Status, Category } from '../types';
import { X, ExternalLink, Calendar, User, ShieldAlert, MessageSquare, Check, AlertTriangle, Share2, BarChart2 } from 'lucide-react';

interface IncidentDetailViewProps {
  incident: Incident;
  onClose: () => void;
  onUpdateStatus: (id: string, status: Status) => void;
}

const IncidentDetailView: React.FC<IncidentDetailViewProps> = ({ incident, onClose, onUpdateStatus }) => {
  const [currentStatus, setCurrentStatus] = React.useState(incident.status);
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleStatusChange = async (newStatus: Status) => {
    setIsUpdating(true);
    setCurrentStatus(newStatus);
    await onUpdateStatus(incident.id, newStatus);
    setIsUpdating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center md:p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white md:rounded-[2rem] shadow-2xl w-full max-w-2xl h-full md:h-auto md:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">NHẬT KÝ #{incident.id}</span>
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${incident.severity >= 4 ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-slate-200 text-slate-700'}`}>
                    CẤP {incident.severity}
                </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
              {incident.category}
              {incident.severity === 5 && <AlertTriangle className="text-red-500 w-6 h-6 animate-pulse" />}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 p-2 bg-white rounded-full shadow-sm border border-slate-100 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6 md:space-y-8 no-scrollbar">
            
            {/* Snippet Card */}
            <div className="bg-slate-900 p-6 md:p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <ShieldAlert size={120} />
                </div>
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-4">Nội dung gốc</p>
                <p className="text-base md:text-lg font-medium leading-relaxed italic relative z-10">
                    "{incident.snippet}"
                </p>
                <div className="mt-6 flex gap-4 relative z-10">
                     <a href={incident.url} target="_blank" rel="noopener noreferrer" 
                        className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-white transition-colors">
                        <ExternalLink size={14} className="mr-2" /> Link gốc
                     </a>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl flex items-center gap-4">
                    <div className="bg-white p-3 rounded-xl text-blue-600 shadow-sm"><MessageSquare size={20} /></div>
                    <div>
                        <p className="text-[8px] text-blue-400 uppercase font-black tracking-widest">Bình luận</p>
                        <p className="text-xl font-black text-blue-900 leading-none">{incident.comments || 0}</p>
                    </div>
                </div>
                <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-2xl flex items-center gap-4">
                    <div className="bg-white p-3 rounded-xl text-purple-600 shadow-sm"><Share2 size={20} /></div>
                    <div>
                        <p className="text-[8px] text-purple-400 uppercase font-black tracking-widest">Chia sẻ</p>
                        <p className="text-xl font-black text-purple-900 leading-none">{incident.shares || 0}</p>
                    </div>
                </div>
            </div>

            {/* Metadata Grid - Optimized for Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/30">
                    <Calendar size={18} className="text-slate-400" />
                    <div>
                        <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Thời gian ghi nhận</p>
                        <p className="text-[11px] font-bold text-slate-700">{new Date(incident.timestamp).toLocaleString('vi-VN')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/30">
                    <User size={18} className="text-slate-400" />
                    <div>
                        <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Tác giả</p>
                        <p className="text-[11px] font-bold text-slate-700">{incident.author}</p>
                    </div>
                </div>
            </div>

            {/* Status Section */}
            <div className="pt-6 border-t border-slate-100">
                <h3 className="text-[10px] font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">Cập nhật trạng thái</h3>
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                    {Object.values(Status).map((status) => {
                        const isActive = currentStatus === status;
                        let colorClass = "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-400";
                        if (isActive) {
                             if (status === Status.RESOLVED) colorClass = "bg-green-600 text-white border-green-600 shadow-lg shadow-green-600/20";
                             else if (status === Status.PENDING) colorClass = "bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/20";
                             else colorClass = "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20";
                        }

                        return (
                            <button
                                key={status}
                                onClick={() => handleStatusChange(status)}
                                disabled={isUpdating}
                                className={`px-4 py-3 md:py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 flex items-center justify-center gap-2 ${colorClass}`}
                            >
                                {isActive && <Check size={14} />}
                                {status}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 md:p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end">
            <button 
                onClick={onClose}
                className="w-full md:w-auto px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
            >
                Xác nhận & Thoát
            </button>
        </div>
      </div>
    </div>
  );
};

export default IncidentDetailView;
