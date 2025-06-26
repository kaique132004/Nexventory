import { UserData, RegionData, SupplyData, TransactionData } from '../types/index.d';

/**
 * Type guard to check if a value is a UserData object
 */
export function isUserData(value: any): value is UserData {
  return (
    value &&
    typeof value === 'object' &&
    'username' in value &&
    'role' in value &&
    Array.isArray(value.regionCode)
  );
}

/**
 * Type guard to check if a value is a RegionData object
 */
export function isRegionData(value: any): value is RegionData {
  return (
    value &&
    typeof value === 'object' &&
    'regionCode' in value &&
    'regionName' in value &&
    'city' in value &&
    'country' in value
  );
}

/**
 * Type guard to check if a value is a SupplyData object
 */
export function isSupplyData(value: any): value is SupplyData {
  return (
    value &&
    typeof value === 'object' &&
    'supplyName' in value &&
    Array.isArray(value.regionalPrices)
  );
}

/**
 * Type guard to check if a value is a TransactionData object
 */
export function isTransactionData(value: any): value is TransactionData {
  return (
    value &&
    typeof value === 'object' &&
    'supplyId' in value &&
    'regionCode' in value &&
    'typeEntry' in value &&
    'quantity' in value
  );
}

/**
 * Type guard to check if an array is of UserData type
 */
export function isUserDataArray(value: any[]): value is UserData[] {
  return Array.isArray(value) && value.every(item => isUserData(item));
}

/**
 * Type guard to check if an array is of RegionData type
 */
export function isRegionDataArray(value: any[]): value is RegionData[] {
  return Array.isArray(value) && value.every(item => isRegionData(item));
}

/**
 * Type guard to check if an array is of SupplyData type
 */
export function isSupplyDataArray(value: any[]): value is SupplyData[] {
  return Array.isArray(value) && value.every(item => isSupplyData(item));
}

/**
 * Type guard to check if an array is of TransactionData type
 */
export function isTransactionDataArray(value: any[]): value is TransactionData[] {
  return Array.isArray(value) && value.every(item => isTransactionData(item));
}

/**
 * Safely parse JSON with type checking
 */
export function safeJsonParse<T>(json: string, typeGuard: (value: any) => value is T): T | null {
  try {
    const parsed = JSON.parse(json);
    return typeGuard(parsed) ? parsed : null;
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return null;
  }
}

