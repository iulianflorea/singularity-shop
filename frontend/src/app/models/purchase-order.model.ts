export interface PurchaseOrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPurchasePrice: number;
  lineTotal: number;
}

export interface PurchaseOrder {
  id: number;
  createdAt: string;
  orderDate: string;
  notes: string;
  totalAmount: number;
  items: PurchaseOrderItem[];
}

export interface ReportSoldProduct {
  productId: number;
  productName: string;
  totalQuantity: number;
  grossRevenue: number;
}

export interface Report {
  from: string;
  to: string;
  orderCount: number;
  grossRevenue: number;
  tvaAmount: number;
  revenueWithoutTva: number;
  stripeFees: number;
  netRevenue: number;
  purchaseCosts: number;
  netProfit: number;
  tvaRate: number;
  soldProducts: ReportSoldProduct[];
  purchaseOrders: PurchaseOrder[];
}
