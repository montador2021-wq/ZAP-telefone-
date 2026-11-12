export type LeadStatus = 'waiting' | 'contacted' | 'completed' | 'cancelled';

export interface Category {
  id: string;
  name: string;
  color: string; // Hex color (e.g., #10b981)
  description?: string;
  createdAt: string;
}

export interface CustomerLead {
  id: string;
  name: string;
  phone: string; // Raw or formatted e.g. (11) 98765-4321
  product: string; // What the client wants, e.g. "Mesa 6 cadeiras madeira"
  categoryId: string;
  status: LeadStatus;
  priceEstimate?: string; // Optional target price or budget
  returnDate?: string; // Target follow-up date / arrival date (YYYY-MM-DD)
  notes?: string;
  createdAt: string;
  updatedAt: string;
  lastContactedAt?: string;
  lastContactChannel?: 'whatsapp';
  contactCount: number;
}

export interface MessageTemplate {
  id: string;
  title: string;
  body: string;
}

export interface AppSettings {
  sellerName: string;
  storeName: string;
  countryCode: string; // Default: '55' (Brazil)
}

export type FilterStatus = 'all' | 'waiting' | 'contacted' | 'completed';
