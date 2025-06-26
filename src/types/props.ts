import { 
  UserData, 
  RegionData, 
  SupplyData, 
  TransactionData,
  RegionalPrice
} from './index.d';

// Layout component props
export interface LayoutProps {
  children?: React.ReactNode;
}

export interface HeaderProps {
  title?: string;
}

export interface SidebarProps {
  collapsed?: boolean;
  toggleSidebar?: () => void;
}

// User management props
export interface UserFormProps {
  userId?: string;
  isEditMode?: boolean;
}

export interface UserCardProps {
  user: UserData;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

// Region management props
export interface RegionFormProps {
  regionId?: string;
  isEditMode?: boolean;
}

export interface RegionCardProps {
  region: RegionData;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

// Supply management props
export interface SupplyFormProps {
  supplyId?: string;
  isEditMode?: boolean;
}

export interface SupplyCardProps {
  supply: SupplyData;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onTransaction: (id: string, name: string) => void;
}

export interface RegionalPriceFieldProps {
  index: number;
  remove: (index: number) => void;
  regions: RegionData[];
  selectedRegions: string[];
  disabled?: boolean;
}

// Transaction management props
export interface TransactionFormProps {
  preSelectedSupplyId?: string;
  preSelectedSupplyName?: string;
}

export interface TransactionFilterProps {
  onFilter: (filters: any) => void;
  regions: RegionData[];
  supplies: SupplyData[];
  initialValues?: any;
}

export interface TransactionTableProps {
  transactions: TransactionData[];
  loading: boolean;
}

// Dashboard props
export interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'primary' | 'success' | 'info' | 'warning' | 'danger';
  loading?: boolean;
}

export interface RecentTransactionsProps {
  transactions: TransactionData[];
  loading: boolean;
}

// Auth props
export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export interface LoginFormProps {
  onLogin: (username: string, password: string) => Promise<any>;
}

export interface ResetPasswordFormProps {
  token?: string;
  onReset: (email: string, token?: string, password?: string) => Promise<any>;
}

