import { Component, OnInit, OnDestroy, inject, signal, computed, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
import { Product } from '../../models/product.model';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-product-detail',
  imports: [CurrencyPipe],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cart = inject(CartService);
  private toast = inject(ToastService);
  ts = inject(TranslationService);

  product = signal<Product | null>(null);
  loading = signal(true);
  quantity = signal(1);
  activeTab = signal<'description' | 'specs'>('description');

  lightboxOpen = signal(false);
  lightboxIndex = signal(0);

  readonly allImages = computed(() => {
    const p = this.product();
    if (!p) return [];
    const imgs: string[] = [];
    if (p.imageUrl) imgs.push(p.imageUrl);
    if (p.descriptionImages?.length) imgs.push(...p.descriptionImages);
    return imgs;
  });

  openLightbox(index: number): void {
    this.lightboxIndex.set(index);
    this.lightboxOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeLightbox(): void {
    this.lightboxOpen.set(false);
    document.body.style.overflow = '';
  }

  lightboxNavigate(delta: number): void {
    const total = this.allImages().length;
    this.lightboxIndex.set((this.lightboxIndex() + delta + total) % total);
  }

  descImageIndex(loopIndex: number): number {
    return this.product()?.imageUrl ? loopIndex + 1 : loopIndex;
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    if (!this.lightboxOpen()) return;
    if (e.key === 'Escape') this.closeLightbox();
    if (e.key === 'ArrowRight') this.lightboxNavigate(1);
    if (e.key === 'ArrowLeft') this.lightboxNavigate(-1);
  }

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
    this.toast.success(`"${p.name}" ${this.ts.t('product.addedToCart')}`);
  }

  changeQuantity(delta: number): void {
    const p = this.product();
    const max = p?.productType === 'SOFTWARE' ? 99 : (p?.stock ?? 99);
    const next = this.quantity() + delta;
    if (next >= 1 && next <= max) this.quantity.set(next);
  }
}
