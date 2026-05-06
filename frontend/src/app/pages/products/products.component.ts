import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { SkeletonComponent } from '../../components/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';

@Component({
  selector: 'app-products',
  imports: [FormsModule, ProductCardComponent, SkeletonComponent, EmptyStateComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  private productService = inject(ProductService);

  products = signal<Product[]>([]);
  loading = signal(true);
  totalPages = signal(0);
  currentPage = signal(0);

  search = '';
  selectedType = '';
  selectedCategory = '';

  /** Grupuri cu copii, din /categories/grouped */
  groups = signal<Category[]>([]);
  /** Numele categoriilor care au produse pentru tipul selectat */
  availableCategoryNames = signal<string[]>([]);

  /** Grupuri filtrate: păstrează doar subcat. cu produse; ascunde grupul dacă e gol */
  visibleGroups = () =>
    this.groups()
      .map(g => ({ ...g, children: (g.children ?? []).filter(c => this.availableCategoryNames().includes(c.name)) }))
      .filter(g => g.children!.length > 0);

  /** Categorii fără părinte care au produse */
  visibleOrphans = () =>
    this.groups()
      .filter(g => !g.parentId && !(g.children?.length))  // grupuri fără copii = tratate ca leaf
      .filter(g => this.availableCategoryNames().includes(g.name));

  readonly typeFilters = [
    { label: 'Toate', value: '' },
    { label: 'Software', value: 'SOFTWARE' },
    { label: 'Echipamente IT', value: 'PHYSICAL' },
  ];

  ngOnInit(): void {
    this.productService.getCategories().subscribe(g => this.groups.set(g));
    this.loadAvailableCategories();
    this.load();
  }

  loadAvailableCategories(): void {
    this.productService.getAvailableCategories(this.selectedType || undefined)
      .subscribe(names => this.availableCategoryNames.set(names));
  }

  load(): void {
    this.loading.set(true);
    this.productService.getProducts(
      this.currentPage(), 12,
      this.search || undefined,
      this.selectedCategory || undefined,
      this.selectedType || undefined
    ).subscribe({
      next: page => {
        this.products.set(page.content);
        this.totalPages.set(page.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSearch(): void { this.currentPage.set(0); this.load(); }

  selectType(value: string): void {
    this.selectedType = value;
    this.selectedCategory = '';
    this.currentPage.set(0);
    this.loadAvailableCategories();
    this.load();
  }

  selectCategory(name: string): void {
    this.selectedCategory = this.selectedCategory === name ? '' : name;
    this.currentPage.set(0);
    this.load();
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get pages(): number[] {
    return Array(this.totalPages()).fill(0).map((_, i) => i);
  }
}
