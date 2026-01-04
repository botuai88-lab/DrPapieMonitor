
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, List, Settings, Menu, Shield, Bell, PlusCircle, Database, RefreshCw, AlertCircle, X } from 'lucide-react';
import DashboardView from './components/DashboardView';
import IncidentListView from './components/IncidentListView';
import IncidentDetailView from './components/IncidentDetailView';
import SmartImportModal from './components/SmartImportModal';
import ConfigModal from './components/ConfigModal';
import { Incident, DashboardMetrics, Status } from './types';
import { dataService } from './services/dataService';

type View = 'dashboard' | 'incidents';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Modals
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dataService.fetchIncidents();
      setIncidents(data);
      setMetrics(dataService.getMetrics(data));
    } catch (err: any) {
      console.error("Failed to load data", err);
      setError(err.message || "Không thể kết nối đến Trung tâm dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDatabase = () => {
      window.open(dataService.getEditUrl(), '_blank');
  };

  const handleUpdateStatus = async (id: string, newStatus: Status) => {
    await dataService.updateStatus(id, newStatus);
    const updatedIncidents = incidents.map(i => i.id === id ? { ...i, status: newStatus } : i);
    setIncidents(updatedIncidents);
    setMetrics(dataService.getMetrics(updatedIncidents));
    if (selectedIncident && selectedIncident.id === id) {
        setSelectedIncident({ ...selectedIncident, status: newStatus });
    }
  };

  const handleImportData = async (newItems: Incident[]) => {
      setLoading(true);
      const updatedList = await dataService.addIncidents(incidents, newItems);
      setIncidents(updatedList);
      setMetrics(dataService.getMetrics(updatedList));
      setLoading(false);
      setCurrentView('incidents');
  };

  const navClass = (view: View) => 
    `w-full flex items-center gap-4 px-6 py-4 text-xs font-black uppercase tracking-widest transition-all rounded-2xl ${
      currentView === view 
        ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/40' 
        : 'text-slate-500 hover:bg-slate-900 hover:text-white'
    }`;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-slate-950 flex flex-col transition-transform duration-500 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 border-r border-slate-900
      `}>
        <div className="p-8 flex items-center justify-between text-white border-b border-slate-900">
            <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-600/20">
                    <Shield size={24} />
                </div>
                <div>
                    <h1 className="font-black text-xl leading-tight tracking-tight uppercase">Dr Papie</h1>
                    <p className="text-[9px] text-blue-500 font-black uppercase tracking-[0.3em]">Trung tâm Giám sát</p>
                </div>
            </div>
            <button className="md:hidden p-2 text-slate-500" onClick={() => setIsSidebarOpen(false)}>
                <X size={20} />
            </button>
        </div>

        <nav className="flex-1 px-4 py-10 space-y-4">
          <button onClick={() => { setCurrentView('dashboard'); setIsSidebarOpen(false); }} className={navClass('dashboard')}>
            <LayoutDashboard size={20} />
            Giám sát
          </button>
          <button onClick={() => { setCurrentView('incidents'); setIsSidebarOpen(false); }} className={navClass('incidents')}>
            <List size={20} />
            Dữ liệu
          </button>
        </nav>

        <div className="p-6 border-t border-slate-900 space-y-4">
          <button 
            onClick={() => { setIsImportModalOpen(true); setIsSidebarOpen(false); }}
            className="w-full flex items-center justify-center gap-3 px-6 py-5 text-[11px] font-black uppercase tracking-widest bg-blue-600 text-white rounded-2xl hover:bg-blue-500 transition-all shadow-2xl shadow-blue-600/20"
          >
            <PlusCircle size={18} />
            Nhập liệu Thông minh
          </button>

          <button 
            onClick={() => { setIsConfigModalOpen(true); setIsSidebarOpen(false); }}
            className="w-full flex items-center gap-4 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all bg-slate-900/50 rounded-2xl border border-slate-900"
          >
            <Settings size={20} />
            Cấu hình Hệ thống
          </button>
          
          <div className="px-6 py-4 bg-slate-900/80 rounded-2xl flex items-center justify-between border border-slate-900">
             <div>
                <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1">Trạng thái</p>
                <p className={`text-[10px] font-mono font-bold ${error ? 'text-red-500' : 'text-green-500'}`}>
                   {error ? 'MẤT KẾT NỐI' : 'SẴN SÀNG'}
                </p>
             </div>
             <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500 animate-pulse' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'}`}></div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 md:px-10 z-30">
          <button className="md:hidden p-3 bg-slate-100 rounded-xl text-slate-600" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-4 md:gap-8 ml-auto">
             <button 
                onClick={loadData}
                disabled={loading}
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
             >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                Làm mới
             </button>

             <div className="relative group cursor-pointer p-2 md:p-0">
                <Bell size={22} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
                {metrics && metrics.criticalCount > 0 && (
                    <span className="absolute top-1 right-1 md:-top-1 md:-right-1 w-4 h-4 bg-red-600 text-white text-[8px] font-black flex items-center justify-center rounded-full shadow-lg border-2 border-white">
                        {metrics.criticalCount}
                    </span>
                )}
             </div>
             <div className="w-10 h-10 rounded-2xl bg-slate-950 flex items-center justify-center text-white text-xs font-black border-2 border-slate-800 shadow-xl">
                OP
             </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-10 no-scrollbar custom-scrollbar">
          <div className="max-w-7xl mx-auto h-full">
            {error ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-fade-in p-6">
                    <div className="bg-red-50 p-8 rounded-full border-4 border-red-100">
                        <AlertCircle size={64} className="text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Truy cập bị từ chối</h2>
                        <p className="text-slate-500 max-w-sm mt-3 font-medium text-sm">{error}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <button onClick={loadData} className="px-10 py-4 bg-red-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-red-700 shadow-2xl shadow-red-600/20">
                            Thử lại
                        </button>
                        <button onClick={() => setIsConfigModalOpen(true)} className="px-10 py-4 bg-white border-2 border-slate-200 text-slate-700 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-50">
                            Sửa cấu hình
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {currentView === 'dashboard' && metrics && (
                    <DashboardView metrics={metrics} isLoading={loading} />
                    )}
                    {currentView === 'incidents' && (
                    <IncidentListView incidents={incidents} onSelectIncident={setSelectedIncident} isLoading={loading} />
                    )}
                </>
            )}
          </div>
        </div>
      </main>

      {/* Detail Overlay */}
      {selectedIncident && (
        <IncidentDetailView 
            incident={selectedIncident} 
            onClose={() => setSelectedIncident(null)}
            onUpdateStatus={handleUpdateStatus}
        />
      )}
      
      {/* Modal Overlays */}
      {isImportModalOpen && (
          <SmartImportModal onClose={() => setIsImportModalOpen(false)} onImport={handleImportData} />
      )}

      {isConfigModalOpen && (
          <ConfigModal onClose={() => setIsConfigModalOpen(false)} onSave={() => loadData()} />
      )}
    </div>
  );
};

export default App;
