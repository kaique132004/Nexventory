// Global type definitions

// Auth types
export interface UserData {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SUPERVISOR' | 'USER' | 'GUEST' | 'SUPPLY_MANAGER' | "MASTER";
  active: boolean;
  regionCode: Array<string | { regionCode: string, regionName?: string }>;
}

export interface LoginResponse {
  token: string;
  data: UserData;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ResetPasswordRequest {
  token?: string;
  email?: string;
  password?: string;
}

// Region types
export interface RegionData {
  id: string;
  regionCode: string;
  regionName: string;
  city: string;
  country: string;
  active: boolean;
  created?: string;
}

export interface RegionRequest {
  regionCode: string;
  regionName: string;
  city: string;
  country: string;
  active: boolean;
}

// Supply types
export interface RegionalPrice {
  regionCode: string;
  price: string | number;
  currency: string;
  supplier?: string;
  quantity: string | number;
}

export interface SupplyData {
  id?: string;
  supplyName: string;
  description?: string;
  isActive: boolean | string;
  regionalPrices: RegionalPrice[];
  supplyImages?: string[];
}

export interface SupplyRequest {
  supplyId?: string;
  supplyName: string;
  supplyDescription: string;
  active: string;
  regionalPrices: RegionalPrice[];
  supplyImages: string[];
}

// Transaction types
export interface TransactionData {
  id?: string;
  supplyId: string;
  supplyName?: string;
  regionCode: string;
  typeEntry: 'IN' | 'OUT';
  quantity: number;
  priceUnit?: number;
  created: string;
  timestamp?: string;
  userId?: string;
  userName?: string;
}

export interface TransactionRequest {
  supplyId: string;
  regionCode: string;
  typeEntry: 'IN' | 'OUT';
  quantity: number;
  created: string;
  userId: string;
  timestamp: string;
}

export interface TransactionFilterRequest {
  startDate?: string;
  endDate?: string;
  regionCode?: string;
  supplyId?: string;
  typeEntry?: 'IN' | 'OUT';
}

// Asset types (preview feature)
export interface AssetCategory {
  name: string;
  count: number;
  value: number;
}

export interface AssetStats {
  totalAssets: number;
  totalValue: number;
  categories: AssetCategory[];
}

