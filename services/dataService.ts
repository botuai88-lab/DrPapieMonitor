
import { Incident, Platform, Status, Category, DashboardMetrics } from '../types';

const HARDCODED_SHEET_URL = "https://docs.google.com/spreadsheets/d/1n45IKdN1vS6CQ_e7xboQ_oZhivK2QBZUOetQwaCbGFU/edit?gid=0#gid=0"; 
const HARDCODED_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzBzmDwAjeiiigC3IFIrizcwk_NG3zqbCWGxKG9BRFliVQQLy8M1qXRv_h36az-3l-GgQ/exec"; 
const PROXY_URL = "https://api.allorigins.win/raw?url=";

const SHEET_URL_KEY = 'dr_papie_sheet_url';
const SCRIPT_URL_KEY = 'dr_papie_script_url';
const APIFY_TOKEN_KEY = 'dr_papie_apify_token';
const DEFAULT_SHEET_ID = '1n45IKdN1vS6CQ_e7xboQ_oZhivK2QBZUOetQwaCbGFU';

export const convertToCsvUrl = (inputUrl: string): string => {
  if (!inputUrl) return "";
  try {
    const match = inputUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    const id = match ? match[1] : null;
    if (!id) return inputUrl;
    const gidMatch = inputUrl.match(/[?&]gid=([0-9]+)/);
    const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : '&gid=0';
    return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv${gidParam}`;
  } catch (e) {
    return inputUrl;
  }
};

const parseCSV = (csvText: string): Incident[] => {
  const lines = csvText.split(/\r?\n/);
  if (lines.length < 2) return [];
  const result: Incident[] = [];

  const parseLine = (text: string) => {
    const res: string[] = [];
    let entry = "";
    let inQuote = false;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (inQuote) {
            if (char === '"') {
                if (i + 1 < text.length && text[i + 1] === '"') { entry += '"'; i++; }
                else { inQuote = false; }
            } else { entry += char; }
        } else {
            if (char === '"') { inQuote = true; }
            else if (char === ',') { res.push(entry.trim()); entry = ""; }
            else { entry += char; }
        }
    }
    res.push(entry.trim());
    return res;
  };

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const cells = parseLine(line);
    if (cells.length < 3) continue; 
    const getVal = (idx: number) => cells[idx] || '';

    const rawSev = parseInt(getVal(6));
    const severity = (rawSev >= 1 && rawSev <= 5 ? rawSev : 1) as 1|2|3|4|5;
    
    const rawPlat = getVal(1).toLowerCase();
    let platform = Platform.FACEBOOK;
    if (rawPlat.includes('tiktok')) platform = Platform.TIKTOK;
    else if (rawPlat.includes('youtube')) platform = Platform.YOUTUBE;
    else if (rawPlat.includes('web') || rawPlat.includes('forum')) platform = Platform.WEB;
    else if (rawPlat.includes('insta')) platform = Platform.INSTAGRAM;

    const rawStatus = getVal(7).toLowerCase();
    let status = Status.PENDING;
    if (rawStatus.includes('đang')) status = Status.PROCESSING;
    else if (rawStatus.includes('báo cáo')) status = Status.REPORTED;
    else if (rawStatus.includes('liên hệ')) status = Status.CONTACTED;
    else if (rawStatus.includes('xong') || rawStatus.includes('resolved')) status = Status.RESOLVED;

    const rawCat = getVal(5).toLowerCase();
    let category = Category.OTHER;
    if (rawCat.includes('chất lượng')) category = Category.PRODUCT_QUALITY;
    else if (rawCat.includes('dịch vụ')) category = Category.SERVICE;
    else if (rawCat.includes('giá')) category = Category.PRICE;
    else if (rawCat.includes('tin giả')) category = Category.FAKE_NEWS;
    else if (rawCat.includes('đối thủ')) category = Category.COMPETITOR;

    const comments = parseInt(getVal(9).replace(/[^0-9]/g, '')) || 0;
    const shares = parseInt(getVal(10).replace(/[^0-9]/g, '')) || 0;

    let timestamp = new Date().toISOString();
    const dateStr = getVal(0);
    if (dateStr) {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) { timestamp = d.toISOString(); }
    }

    result.push({
      id: `sheet-${i}`,
      timestamp: timestamp,
      platform: platform,
      url: getVal(2) || '#',
      author: getVal(3) || 'Unknown',
      snippet: getVal(4),
      analysis: getVal(11), 
      category: category,
      severity: severity,
      status: status,
      notes: getVal(8),
      comments: comments,
      shares: shares
    });
  }
  return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const dataService = {
  isHardcoded: () => !!HARDCODED_SHEET_URL,
  getDatabaseUrl: (): string => {
    if (HARDCODED_SHEET_URL) return convertToCsvUrl(HARDCODED_SHEET_URL);
    const saved = localStorage.getItem(SHEET_URL_KEY);
    return saved || convertToCsvUrl(DEFAULT_SHEET_ID); 
  },
  getScriptUrl: (): string => HARDCODED_SCRIPT_URL || localStorage.getItem(SCRIPT_URL_KEY) || '',
  getEditUrl: (): string => {
     const currentCsv = dataService.getDatabaseUrl();
     const match = currentCsv.match(/\/d\/([a-zA-Z0-9-_]+)/);
     return match ? `https://docs.google.com/spreadsheets/d/${match[1]}/edit` : currentCsv;
  },
  getApifyToken: (): string => localStorage.getItem(APIFY_TOKEN_KEY) || '',
  setApifyToken: (token: string) => localStorage.setItem(APIFY_TOKEN_KEY, token),
  setDatabaseUrl: (url: string) => localStorage.setItem(SHEET_URL_KEY, url),
  setScriptUrl: (url: string) => localStorage.setItem(SCRIPT_URL_KEY, url),

  fetchIncidents: async (): Promise<Incident[]> => {
    const url = dataService.getDatabaseUrl();
    const proxiedUrl = `${PROXY_URL}${encodeURIComponent(url)}`;
    try {
      const response = await fetch(proxiedUrl, { 
        method: 'GET',
        headers: { 'Accept': 'text/csv' },
        cache: 'no-store' 
      });
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const text = await response.text();
      
      if (text.trim().startsWith('<!DOCTYPE html>')) {
          throw new Error("Dữ liệu trả về là HTML (vui lòng kiểm tra quyền chia sẻ của Sheet).");
      }
      
      return parseCSV(text);
    } catch (error) {
      console.error("Fetch failure:", error);
      throw error;
    }
  },

  addIncidents: async (currentData: Incident[], newIncidents: Incident[]): Promise<Incident[]> => {
    const combined = [...newIncidents, ...currentData];
    return combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  submitIncidentToSheet: async (incident: Incident): Promise<boolean> => {
    const scriptUrl = dataService.getScriptUrl();
    if (!scriptUrl) return false;
    try {
        const payload = {
            timestamp: new Date(incident.timestamp).toLocaleString('vi-VN').replace(/,/, ''),
            platform: incident.platform,
            url: incident.url,
            author: incident.author,
            snippet: incident.snippet,
            analysis: incident.analysis || '',
            category: incident.category,
            severity: incident.severity,
            status: incident.status,
            notes: incident.notes || '',
            comments: incident.comments || 0,
            shares: incident.shares || 0
        };
        await fetch(scriptUrl, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) });
        return true;
    } catch (e) { return false; }
  },

  updateStatus: async (id: string, newStatus: Status): Promise<void> => Promise.resolve(),

  getMetrics: (data: Incident[]): DashboardMetrics => {
    const totalActive = data.length;
    const criticalCount = data.filter(i => i.severity >= 4 && i.status !== Status.RESOLVED).length;

    // Platform Breakdown
    const pCount: Record<string, number> = {};
    Object.values(Platform).forEach(p => pCount[p] = 0);
    data.forEach(i => { if(pCount[i.platform] !== undefined) pCount[i.platform]++; });
    const platformBreakdown = Object.keys(pCount)
      .map(name => ({ name, value: pCount[name] }))
      .sort((a,b) => b.value - a.value);

    // Category Breakdown
    const catCount: Record<string, number> = {};
    Object.values(Category).forEach(c => catCount[c] = 0);
    data.forEach(i => { if(catCount[i.category] !== undefined) catCount[i.category]++; });
    const categoryBreakdown = Object.keys(catCount)
      .map(name => ({ name, value: catCount[name] }))
      .sort((a,b) => b.value - a.value);
    
    const topCategory = categoryBreakdown.length > 0 && categoryBreakdown[0].value > 0 ? categoryBreakdown[0].name : "N/A";

    // 14-day Trend
    const trendMap = new Map<string, number>();
    const now = new Date();
    for(let i=13; i>=0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        trendMap.set(d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }), 0);
    }
    data.forEach(i => {
        const key = new Date(i.timestamp).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        if (trendMap.has(key)) trendMap.set(key, (trendMap.get(key) || 0) + 1);
    });

    return {
      totalActive,
      topCategory,
      categoryBreakdown,
      platformBreakdown,
      recentTrend: Array.from(trendMap, ([time, count]) => ({ time, count })),
      recentCritical: data.filter(i => i.severity >= 4 && i.status !== Status.RESOLVED).slice(0, 10),
      criticalCount
    };
  }
};
