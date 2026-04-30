import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Discount, DiscountRequest } from '../models/discount.model';
import { Product } from '../models/product.model';

export interface AdminStats {
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenue: number;
}

export interface ProductRequest {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.base}/admin/stats`);
  }

  getAllOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/admin/orders`);
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
