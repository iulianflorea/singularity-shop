import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;

  cart = inject(CartService);
  toast = inject(ToastService);
  ts = inject(TranslationService);

  addToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.cart.addItem({
      productId: this.product.id,
      productName: this.product.name,
      imageUrl: this.product.imageUrl,
      unitPrice: this.product.price
    });
    this.toast.success(`"${this.product.name}" ${this.ts.t('product.addedToCart')}`);
  }
}
