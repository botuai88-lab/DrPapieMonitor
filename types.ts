
export enum Platform {
  FACEBOOK = 'Facebook',
  TIKTOK = 'TikTok',
  YOUTUBE = 'YouTube',
  WEB = 'Website/Forum',
  INSTAGRAM = 'Instagram'
}

export enum Status {
  PENDING = 'Chờ xử lý',
  PROCESSING = 'Đang xử lý',
  REPORTED = 'Đã báo cáo',
  CONTACTED = 'Đã liên hệ',
  RESOLVED = 'Đã xong'
}

export enum Category {
  PRODUCT_QUALITY = 'Chất lượng',
  SERVICE = 'Dịch vụ CSKH',
  PRICE = 'Giá cả',
  FAKE_NEWS = 'Tin giả',
  COMPETITOR = 'Đối thủ chơi xấu',
  OTHER = 'Khác'
}

export interface Incident {
  id: string;
  timestamp: string; // ISO String
  platform: Platform;
  url: string;
  author: string;
  snippet: string;
  analysis?: string; // New: AI generated analysis/description of content
  category: Category;
  severity: 1 | 2 | 3 | 4 | 5; // 1 (Low) to 5 (Critical)
  status: Status;
  notes?: string; 
  comments?: number;
  shares?: number;
}

export interface DashboardMetrics {
  totalActive: number;
  topCategory: string;
  categoryBreakdown: { name: string; value: number }[];
  platformBreakdown: { name: string; value: number }[];
  recentTrend: { time: string; count: number }[];
  recentCritical: Incident[];
  criticalCount: number;
}
