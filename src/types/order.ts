export interface TaxBreakdown {
  state_rate: number;
  county_rate: number;
  city_rate: number;
  special_rate: number;
}

export interface BackendOrder {
  id: number;
  latitude: number;
  longitude: number;
  composite_tax_rate: number;
  tax_amount: number;
  total_amount: number;
  breakdown: TaxBreakdown;
  jurisdictions: string[];
  status: string;
  reporting_code: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  latitude: number;
  longitude: number;
  composite_tax_rate: number;
  tax_amount: number;
  total_amount: number;
  breakdown: TaxBreakdown;
  jurisdictions: string[];
  status: string;
  reporting_code: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderPayload {
  latitude: number;
  longitude: number;
  subtotal: number;
  timestamp?: string;
}

export interface OrderFilters {
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  status?: string;
  reportingCode?: string;
}

export interface PaginatedMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}
