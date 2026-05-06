import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Discount, DiscountRequest } from '../models/discount.model';
import { Product } from '../models/product.model';
import { PurchaseOrder, Report } from '../models/purchase-order.model';
import { Category } from '../models/category.model';

export interface AdminStats {
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenue: number;
}

export interface SpecRequest {
  name: string;
  value: string;
}

export interface ProductRequest {
  name: string;
  description?: string;
  price: number;
  stock?: number | null;
  category: string;
  imageUrl?: string;
  productCode?: string;
  purchasePrice?: number | null;
  productType?: string;
  active: boolean;
  specifications?: SpecRequest[];
  descriptionImages?: string[];
}

export interface PurchaseOrderItemRequest {
  productId: number;
  quantity: number;
  unitPurchasePrice: number;
}

export interface PurchaseOrderRequest {
  orderDate?: string;
  notes?: string;
  items: PurchaseOrderItemRequest[];
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = environment.apiUrl;
  tvaRate = signal<number>(19);

  constructor(private http: HttpClient) {}

  getSettings(): Observable<{ tvaRate: number }> {
    return this.http.get<{ tvaRate: number }>(`${this.base}/admin/settings`)
      .pipe(tap(s => this.tvaRate.set(s.tvaRate)));
  }

  updateSettings(tvaRate: number): Observable<{ tvaRate: number }> {
    return this.http.put<{ tvaRate: number }>(`${this.base}/admin/settings`, { tvaRate })
      .pipe(tap(s => this.tvaRate.set(s.tvaRate)));
  }

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.base}/admin/stats`);
  }

  getAllOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/admin/orders`);
  }

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.base}/admin/products`);
  }

  getReport(from: string, to: string): Observable<Report> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<Report>(`${this.base}/admin/report`, { params });
  }

  // Upload
  uploadImage(file: File): Observable<{ url: string }> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<{ url: string }>(`${this.base}/upload/image`, fd);
  }

  // Products
  createProduct(req: ProductRequest): Observable<Product> {
    return this.http.post<Product>(`${this.base}/products`, req);
  }

  updateProduct(id: number, req: ProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.base}/products/${id}`, req);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/products/${id}`);
  }

  // Purchase Orders
  getPurchaseOrders(): Observable<PurchaseOrder[]> {
    return this.http.get<PurchaseOrder[]>(`${this.base}/purchase-orders`);
  }

  createPurchaseOrder(req: PurchaseOrderRequest): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(`${this.base}/purchase-orders`, req);
  }

  deletePurchaseOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/purchase-orders/${id}`);
  }

  // Categories
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.base}/admin/categories`);
  }

  createCategory(name: string): Observable<Category> {
    return this.http.post<Category>(`${this.base}/admin/categories`, { name });
  }

  createCategoryWithParent(name: string, parentId: number): Observable<Category> {
    return this.http.post<Category>(`${this.base}/admin/categories`, { name, parentId });
  }

  updateCategory(id: number, name: string): Observable<Category> {
    return this.http.put<Category>(`${this.base}/admin/categories/${id}`, { name });
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/admin/categories/${id}`);
  }

  // Discounts
  getDiscounts(): Observable<Discount[]> {
    return this.http.get<Discount[]>(`${this.base}/discounts`);
  }

  createDiscount(req: DiscountRequest): Observable<Discount> {
    return this.http.post<Discount>(`${this.base}/discounts`, req);
  }

  updateDiscount(id: number, req: DiscountRequest): Observable<Discount> {
    return this.http.put<Discount>(`${this.base}/discounts/${id}`, req);
  }

  deleteDiscount(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/discounts/${id}`);
  }
}
