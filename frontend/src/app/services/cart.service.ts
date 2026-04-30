import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CartItem, CartCalculateResponse } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly STORAGE_KEY = 'cart_items';

  items = signal<CartItem[]>(this.load());
  itemCount = computed(() => this.items().reduce((sum, i) => sum + i.quantity, 0));

  constructor(private http: HttpClient) {}

  addItem(item: Omit<CartItem, 'quantity'>, quantity = 1): void {
    const current = this.items();
    const existing = current.find(i => i.productId === item.productId);
    if (existing) {
      this.items.set(current.map(i =>
        i.productId === item.productId ? { ...i, quantity: i.quantity + quantity } : i
      ));
    } else {
      this.items.set([...current, { ...item, quantity }]);
    }
    this.save();
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }
    this.items.set(this.items().map(i => i.productId === productId ? { ...i, quantity } : i));
    this.save();
  }

  removeItem(productId: number): void {
    this.items.set(this.items().filter(i => i.productId !== productId));
    this.save();
  }

  clear(): void {
    this.items.set([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  calculate(): Observable<CartCalculateResponse> {
    const items = this.items().map(i => ({ productId: i.productId, quantity: i.quantity }));
    return this.http.post<CartCalculateResponse>(`${environment.apiUrl}/cart/calculate`, { items });
  }

  private save(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items()));
  }

  private load(): CartItem[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }
}
