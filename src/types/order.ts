export interface TaxBreakdown {
  state_rate: number;
  county_rate: number;
  city_rate: number;
  special_rates: number;
}

export interface Jurisdiction {
  state: string;
  county: string;
  city: string;
  special_districts: string[];
}

export interface Order {
  id: number;
  latitude: number;
  longitude: number;
  subtotal: number;
  composite_tax_rate: number;
  tax_amount: number;
  total_amount: number;
  breakdown: TaxBreakdown;
  jurisdictions: Jurisdiction;
  timestamp: string;
}

export interface CreateOrderPayload {
  latitude: number;
  longitude: number;
  subtotal: number;
  timestamp?: string;
}

export interface OrderFilters {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  sortBy?: keyof Order;
  sortDir?: "asc" | "desc";
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
