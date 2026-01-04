
import React, { useState, useEffect } from 'react';
import { X, Check, Send, Sparkles, BrainCircuit, Activity } from 'lucide-react';
import { Incident, Platform, Category, Status } from '../types';
import { dataService } from '../services/dataService';
import { GoogleGenAI, Type } from "@google/genai";

interface SmartImportModalProps {
  onClose: () => void;
  onImport: (data: Incident[]) => void;
}

const SmartImportModal: React.FC<SmartImportModalProps> = ({ onClose, onImport }) => {
  const [rawText, setRawText] = useState('');
  const [parsedData, setParsedData] = useState<Incident[]>([]);
  const [step, setStep] = useState<1 | 2>(1);
  const [scriptUrl, setScriptUrl] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  useEffect(() => {
    setScriptUrl(dataService.getScriptUrl());
  }, []);

  const extractWithGeminiPro = async (url: string): Promise<Partial<Incident>> => {
    try {
      setProcessingStatus(`Đang quét: ${url.substring(0, 20)}...`);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const categories = Object.values(Category).join(', ');
      
      const prompt = `
        LINK MẠNG XÃ HỘI: ${url}
        PHÂN TÍCH: Social Listening cho Dr. Papie.
        1. Sử dụng Google Search đọc nội dung. 2. Tóm tắt nội dung chính tiêu cực. 
        3. Phân loại: [${categories}]. 4. Chấm severity 1-5. 
        5. Đếm interactions. 6. Viết 1 câu phân tích tác động tiếng Việt.
        YÊU CẦU: JSON format.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
            tools: [{googleSearch: {}}],
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    author: { type: Type.STRING },
                    snippet: { type: Type.STRING },
                    analysis: { type: Type.STRING },
                    category: { type: Type.STRING },
                    severity: { type: Type.NUMBER },
                    comments: { type: Type.NUMBER },
                    shares: { type: Type.NUMBER }
                },
                required: ["snippet", "analysis", "category", "severity"]
            }
        }
      });

      const data = JSON.parse(response.text || "{}");
      return {
        timestamp: new Date().toISOString(),
        author: data.author || "Unknown User",
        snippet: data.snippet,
        analysis: data.analysis,
        category: data.category as Category,
        severity: (data.severity || 3) as 1|2|3|4|5,
        comments: data.comments || 0,
        shares: data.shares || 0
      };
    } catch (e) {
      return { snippet: "Cần kiểm tra thủ công.", severity: 3 };
    }
  };

  const handleAnalyze = async () => {
    if (!rawText.trim()) return;
    setIsAiProcessing(true);
    const lines = rawText.trim().split(/\r?\n/).filter(l => l.trim());
    const result: Incident[] = [];

    for (let i = 0; i < lines.length; i++) {
        const url = lines[i].trim();
        const aiData = await extractWithGeminiPro(url);
        const lowerUrl = url.toLowerCase();
        let platform = Platform.WEB;
        if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.com')) platform = Platform.FACEBOOK;
        else if (lowerUrl.includes('tiktok.com')) platform = Platform.TIKTOK;
        else if (lowerUrl.includes('youtube.com')) platform = Platform.YOUTUBE;

        result.push({
            id: `pro-${Date.now()}-${i}`,
            timestamp: new Date().toISOString(),
            platform: platform,
            url: url,
            author: aiData.author || "Đang quét",
            snippet: aiData.snippet || "Đang phân tích",
            analysis: aiData.analysis || "Chờ xử lý",
            category: aiData.category || Category.OTHER,
            severity: aiData.severity || 3,
            status: Status.PENDING,
            comments: aiData.comments || 0,
            shares: aiData.shares || 0
        });
    }

    setParsedData(result);
    setStep(2);
    setIsAiProcessing(false);
  };

  const handleUpdateItem = (index: number, field: keyof Incident, value: any) => {
    const newData = [...parsedData];
    newData[index] = { ...newData[index], [field]: value };
    setParsedData(newData);
  };

  const handleSendToSheet = async () => {
    if (!scriptUrl) return;
    setIsSending(true);
    let okCount = 0;
    for (const item of parsedData) {
        if (await dataService.submitIncidentToSheet(item)) okCount++;
    }
    setIsSending(false);
    if (okCount === parsedData.length) {
        setSendSuccess(true);
        onImport(parsedData);
        setTimeout(onClose, 800);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center md:p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in">
      <div className="bg-white md:rounded-[2.5rem] shadow-2xl w-full max-w-6xl h-full md:h-[85vh] flex flex-col overflow-hidden">
        <div className="p-6 md:p-8 border-b flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <BrainCircuit className="text-blue-600 hidden sm:block" size={32} />
            <div>
              <h2 className="text-lg md:text-2xl font-black text-slate-900 uppercase tracking-tight">Nhập liệu Thông minh</h2>
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Lõi Gemini 3 Pro</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 p-2 bg-white rounded-full border border-slate-100"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-auto p-6 md:p-10 no-scrollbar">
            {step === 1 ? (
                <div className="h-full flex flex-col gap-6">
                    <div className="bg-slate-900 p-6 md:p-8 rounded-[2rem] text-white shadow-2xl flex flex-col sm:flex-row gap-6 items-center text-center sm:text-left">
                        <Sparkles size={40} className="text-blue-400 shrink-0" />
                        <div>
                            <p className="text-lg font-black uppercase tracking-widest">Nhập liên kết mục tiêu</p>
                            <p className="text-xs opacity-60 font-medium leading-relaxed">AI sẽ quét nội dung, đo lường tương tác và dự báo tác động từ các liên kết của bạn.</p>
                        </div>
                    </div>
                    <textarea 
                        className="flex-1 w-full p-6 md:p-8 border-2 border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-mono text-sm bg-slate-50/50 transition-all outline-none resize-none"
                        placeholder="Dán liên kết (mỗi dòng một link)..."
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                    />
                </div>
            ) : (
                <div className="space-y-6">
                    {parsedData.map((row, i) => (
                        <div key={i} className="bg-slate-50 p-6 md:p-8 rounded-[2rem] border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
                            <div className="space-y-4">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Metadata hệ thống</label>
                                <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
                                    <div className="px-4 py-3 bg-white rounded-xl border border-slate-200 text-[10px] font-black text-slate-600 uppercase text-center">{row.platform}</div>
                                    <select 
                                        value={row.category}
                                        onChange={(e) => handleUpdateItem(i, 'category', e.target.value)}
                                        className="w-full text-[10px] p-3 border border-slate-200 rounded-xl bg-white font-black text-blue-600 outline-none"
                                    >
                                        {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="md:col-span-3 space-y-4">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Báo cáo phân tích AI</label>
                                <textarea 
                                    value={row.analysis}
                                    onChange={(e) => handleUpdateItem(i, 'analysis', e.target.value)}
                                    className="w-full h-32 p-5 text-xs md:text-sm border-2 border-slate-100 rounded-2xl bg-white leading-relaxed focus:border-blue-500 transition-all outline-none font-medium text-slate-700 italic"
                                />
                                <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">
                                    <div className="flex gap-4">
                                       <span>Bình luận: {row.comments}</span>
                                       <span>Tác giả: {row.author}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                       <span>Cấp độ:</span>
                                       <input type="number" min="1" max="5" value={row.severity} onChange={e => handleUpdateItem(i, 'severity', parseInt(e.target.value))} className="w-8 text-center bg-transparent text-red-600 font-black outline-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <div className="p-6 md:p-8 border-t bg-slate-50/50 flex flex-col md:flex-row justify-end gap-4 items-center">
            {isAiProcessing && (
                <div className="w-full md:mr-auto flex items-center justify-center md:justify-start gap-3">
                    <Activity className="text-blue-600 animate-spin" size={16} />
                    <span className="text-[10px] text-blue-600 font-black uppercase tracking-widest">{processingStatus}</span>
                </div>
            )}

            <div className="flex w-full md:w-auto gap-3">
                {step === 1 ? (
                    <button 
                        onClick={handleAnalyze}
                        disabled={!rawText.trim() || isAiProcessing}
                        className="w-full md:w-auto px-10 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 shadow-2xl shadow-blue-600/20 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                    >
                        <Sparkles size={18} /> Kích hoạt Gemini 3 Pro
                    </button>
                ) : (
                    <>
                        <button onClick={() => setStep(1)} className="flex-1 md:flex-none px-6 py-4 text-slate-400 font-black uppercase tracking-widest text-xs">Quay lại</button>
                        <button 
                            onClick={handleSendToSheet}
                            disabled={isSending}
                            className="flex-1 md:flex-none px-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 shadow-xl disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                        >
                            {sendSuccess ? 'ĐÃ LƯU' : 'LƯU DỮ LIỆU'}
                        </button>
                    </>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default SmartImportModal;
