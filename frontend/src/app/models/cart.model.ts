export interface CartItem {
  productId: number;
  productName: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
}

export interface CartCalculateResponse {
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  tvaRate: number;
  items: CartItemDetail[];
}

export interface CartItemDetail {
  productId: number;
  productName: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}
