export interface Discount {
  id: number;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minOrderAmount?: number;
  maxUses?: number;
  usedCount: number;
  active: boolean;
  validFrom?: string;
  validTo?: string;
  createdAt: string;
}

export interface DiscountRequest {
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minOrderAmount?: number;
  maxUses?: number;
  active: boolean;
  validFrom?: string;
  validTo?: string;
}
