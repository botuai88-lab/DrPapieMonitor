import React, { useState, useEffect } from 'react';
import { X, Save, Database, ExternalLink, HelpCircle, FileSpreadsheet, Copy, AlertCircle, CheckCircle2, Code, Lock, Key } from 'lucide-react';
import { dataService, convertToCsvUrl } from '../services/dataService';

interface ConfigModalProps {
  onClose: () => void;
  onSave: () => void;
}

const ConfigModal: React.FC<ConfigModalProps> = ({ onClose, onSave }) => {
  const [url, setUrl] = useState('');
  const [scriptUrl, setScriptUrl] = useState('');
  const [apifyToken, setApifyToken] = useState('');
  const [error, setError] = useState('');
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const saved = dataService.getDatabaseUrl();
    const savedScript = dataService.getScriptUrl();
    const savedApify = dataService.getApifyToken();
    const locked = dataService.isHardcoded();
    
    if (saved) setUrl(saved);
    if (savedScript) setScriptUrl(savedScript);
    if (savedApify) setApifyToken(savedApify);
    setIsLocked(locked);
  }, []);

  const handleSave = () => {
    dataService.setApifyToken(apifyToken.trim());

    if (isLocked) {
        onSave(); // Still save the apify token
        onClose();
        return;
    }

    let finalUrl = url.trim();
    
    // Auto-convert standard edit links
    if (finalUrl.includes('/edit') || !finalUrl.includes('output=csv')) {
        finalUrl = convertToCsvUrl(finalUrl);
    }

    if (finalUrl && !finalUrl.includes('docs.google.com')) {
      setError('Link Sheet không hợp lệ.');
      return;
    }
    
    dataService.setDatabaseUrl(finalUrl);
    dataService.setScriptUrl(scriptUrl.trim());
    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isLocked ? 'bg-slate-200 text-slate-600' : 'bg-blue-100 text-blue-700'}`}>
                {isLocked ? <Lock size={24} /> : <Database size={24} />}
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-800">Cấu hình Hệ thống</h2>
                <p className="text-xs text-slate-500">Database & API Integration</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
            
            {/* Apify Token */}
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <Key size={18} className="text-orange-600"/>
                    Apify API Token (Optional)
                </h3>
                <p className="text-xs text-slate-600 mb-2">
                    Nhập API Token để sử dụng tính năng cào dữ liệu Facebook chính xác (số comment, share thực tế) thay vì dùng Gemini.
                </p>
                <div className="relative">
                    <input 
                        type="password" 
                        value={apifyToken}
                        onChange={(e) => setApifyToken(e.target.value)}
                        placeholder="apify_api_..."
                        className="w-full pl-3 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white border-slate-300 focus:ring-orange-500 text-sm font-mono"
                    />
                </div>
                 <div className="mt-2 text-[10px] text-right">
                    <a href="https://console.apify.com/account/integrations" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                        Lấy API Token tại đây &rarr;
                    </a>
                </div>
            </div>

            <hr className="border-slate-100" />

            {isLocked && (
                <div className="bg-slate-100 border border-slate-200 text-slate-600 p-4 rounded-lg flex items-start gap-3 text-sm">
                    <CheckCircle2 className="shrink-0 mt-0.5" size={18} />
                    <div>
                        <strong>Database (Google Sheet) đã được kết nối cứng.</strong>
                        <p className="opacity-80 mt-1">Hệ thống đang sử dụng link cố định trong source code. Bạn không cần thay đổi phần này.</p>
                    </div>
                </div>
            )}

            {/* Read Config */}
            <div>
                <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <FileSpreadsheet size={18} className="text-green-600"/>
                    Nguồn Dữ liệu (Google Sheet Link)
                </h3>
                <div className="relative">
                    <input 
                        type="text" 
                        value={url}
                        onChange={(e) => { setUrl(e.target.value); setError(''); }}
                        readOnly={isLocked}
                        placeholder="Link Google Sheet (Anyone with link view)"
                        className={`w-full pl-3 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm ${isLocked ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' : 'bg-white border-slate-300 focus:ring-blue-500'}`}
                    />
                </div>
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>

            {/* Write Config */}
            <div className={`p-4 rounded-lg border ${isLocked ? 'bg-slate-50 border-slate-200' : 'bg-slate-50 border-slate-200'}`}>
                <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <Code size={18} className="text-purple-600"/>
                    API Apps Script (Ghi dữ liệu)
                </h3>
                <div className="relative">
                    <input 
                        type="text" 
                        value={scriptUrl}
                        onChange={(e) => setScriptUrl(e.target.value)}
                        readOnly={isLocked}
                        placeholder="https://script.google.com/macros/s/..."
                        className={`w-full pl-3 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm font-mono ${isLocked ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' : 'bg-white border-slate-300 focus:ring-purple-500'}`}
                    />
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
             <button onClick={onClose} className="px-6 py-2 bg-white border border-slate-300 rounded-lg font-medium hover:bg-slate-50">
                Đóng
             </button>
            <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                <Save size={18} /> Lưu Cấu Hình
            </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigModal;