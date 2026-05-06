import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
import { Product } from '../../models/product.model';


@Component({
  selector: 'app-product-detail',
  imports: [CurrencyPipe],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cart = inject(CartService);
  private toast = inject(ToastService);

  product = signal<Product | null>(null);
  loading = signal(true);
  quantity = signal(1);
  activeTab = signal<'description' | 'specs'>('description');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getProduct(id).subscribe({
      next: p => {
        this.product.set(p);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  addToCart(): void {
    const p = this.product();
    if (!p) return;
    this.cart.addItem({
      productId: p.id,
      productName: p.name,
      imageUrl: p.imageUrl,
      unitPrice: p.price
    }, this.quantity());
    this.toast.success(`"${p.name}" adăugat în coș`);
  }

  changeQuantity(delta: number): void {
    const p = this.product();
    const max = p?.productType === 'SOFTWARE' ? 99 : (p?.stock ?? 99);
    const next = this.quantity() + delta;
    if (next >= 1 && next <= max) this.quantity.set(next);
  }
}
