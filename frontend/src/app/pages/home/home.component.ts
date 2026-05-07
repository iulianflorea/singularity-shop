import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { SkeletonComponent } from '../../components/skeleton/skeleton.component';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ProductCardComponent, SkeletonComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  ts = inject(TranslationService);

  featuredProducts = signal<Product[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.productService.getProducts(0, 8).subscribe({
      next: page => {
        this.featuredProducts.set(page.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
