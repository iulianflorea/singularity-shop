export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: number;
  customerId: number;
  status: string;
  totalAmount: number;
  currency: string;
  paymentIntentId: string;
  transactionId: string;
  shippingAddress: string;
  createdAt: string;
  items: OrderItem[];
}

export interface CreateOrderRequest {
  customerId: number;
  items: { productId: number; quantity: number }[];
  shippingAddress: string;
}

export interface CreateOrderResponse {
  orderId: number;
  clientSecret: string;
  totalAmount: number;
  currency: string;
}
