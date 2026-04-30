import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { CartCalculateResponse } from '../../models/cart.model';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, CurrencyPipe, EmptyStateComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {
  cart = inject(CartService);

  summary = signal<CartCalculateResponse | null>(null);
  loading = signal(false);

  ngOnInit(): void {
    if (this.cart.items().length > 0) {
      this.loadSummary();
    }
  }

  loadSummary(): void {
    this.loading.set(true);
    this.cart.calculate().subscribe({
      next: s => {
        this.summary.set(s);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  updateQty(productId: number, qty: number): void {
    this.cart.updateQuantity(productId, qty);
    this.loadSummary();
  }

  remove(productId: number): void {
    this.cart.removeItem(productId);
    if (this.cart.items().length > 0) {
      this.loadSummary();
    } else {
      this.summary.set(null);
    }
  }
}
