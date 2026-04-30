import { Component, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ProductService } from '../../../services/product.service';
import { ToastService } from '../../../services/toast.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-admin-products',
  imports: [ReactiveFormsModule, DecimalPipe],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h1 class="admin-title">Produse</h1>
        <button class="btn-primary" (click)="openForm()">+ Produs nou</button>
      </div>

      @if (showForm()) {
        <div class="form-card">
          <h2>{{ editingId() ? 'Editează produs' : 'Produs nou' }}</h2>
          <form [formGroup]="form" (ngSubmit)="save()">
            <div class="form-grid">
              <div class="field">
                <label>Nume *</label>
                <input formControlName="name" placeholder="Nume produs" />
              </div>
              <div class="field">
                <label>Categorie *</label>
                <input formControlName="category" placeholder="ex: Electronice" />
              </div>
              <div class="field">
                <label>Preț (RON) *</label>
                <input formControlName="price" type="number" step="0.01" placeholder="0.00" />
              </div>
              <div class="field">
                <label>Stoc *</label>
                <input formControlName="stock" type="number" placeholder="0" />
              </div>
              <div class="field full">
                <label>Descriere</label>
                <textarea formControlName="description" rows="3" placeholder="Descriere produs"></textarea>
              </div>
              <div class="field full">
                <label>URL imagine</label>
                <input formControlName="imageUrl" placeholder="https://..." />
              </div>
              <div class="field">
                <label class="checkbox-label">
                  <input type="checkbox" formControlName="active" />
                  Activ (vizibil în magazin)
                </label>
              </div>
            </div>
            <div class="form-actions">
              <button type="button" class="btn-secondary" (click)="closeForm()">Anulează</button>
              <button type="submit" class="btn-primary" [disabled]="form.invalid || saving()">
                {{ saving() ? 'Se salvează...' : 'Salvează' }}
              </button>
            </div>
          </form>
        </div>
      }

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Imagine</th>
              <th>Nume</th>
              <th>Categorie</th>
              <th>Preț</th>
              <th>Stoc</th>
              <th>Status</th>
              <th>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            @for (p of products(); track p.id) {
              <tr>
                <td>#{{ p.id }}</td>
                <td>
                  @if (p.imageUrl) {
                    <img [src]="p.imageUrl" [alt]="p.name" class="thumb" />
                  } @else {
                    <div class="no-img">—</div>
                  }
                </td>
                <td>{{ p.name }}</td>
                <td>{{ p.category }}</td>
                <td>{{ p.price | number:'1.2-2' }} RON</td>
                <td>{{ p.stock }}</td>
                <td><span [class]="p.active ? 'badge active' : 'badge inactive'">{{ p.active ? 'Activ' : 'Inactiv' }}</span></td>
                <td class="actions">
                  <button class="btn-edit" (click)="edit(p)">Editează</button>
                  <button class="btn-delete" (click)="delete(p.id)">Șterge</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .form-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; }
    .form-card h2 { margin: 0 0 1.25rem; font-size: 1.1rem; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .field { display: flex; flex-direction: column; gap: 0.4rem; }
    .field.full { grid-column: 1 / -1; }
    .field label { font-size: 0.85rem; font-weight: 500; color: var(--color-text-secondary); }
    .field input, .field textarea { padding: 0.6rem 0.8rem; border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-bg); color: var(--color-text); font-size: 0.95rem; }
    .checkbox-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
    .form-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem; }
    .table-wrapper { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid var(--color-border); font-size: 0.9rem; }
    th { color: var(--color-text-secondary); font-weight: 600; }
    .thumb { width: 48px; height: 48px; object-fit: cover; border-radius: 6px; }
    .no-img { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; color: var(--color-text-secondary); }
    .badge { padding: 0.25rem 0.6rem; border-radius: 20px; font-size: 0.8rem; font-weight: 500; }
    .badge.active { background: #d1fae5; color: #065f46; }
    .badge.inactive { background: #fee2e2; color: #991b1b; }
    .actions { display: flex; gap: 0.5rem; }
    .btn-primary { padding: 0.6rem 1.2rem; background: var(--color-primary); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary { padding: 0.6rem 1.2rem; background: transparent; color: var(--color-text); border: 1px solid var(--color-border); border-radius: 8px; cursor: pointer; }
    .btn-edit { padding: 0.35rem 0.8rem; background: var(--color-primary); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
    .btn-delete { padding: 0.35rem 0.8rem; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
  `]
})
export class AdminProductsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private productService = inject(ProductService);
  private toast = inject(ToastService);

  products = signal<Product[]>([]);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  saving = signal(false);

  form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    price: [null as number | null, [Validators.required, Validators.min(0.01)]],
    stock: [null as number | null, [Validators.required, Validators.min(0)]],
    category: ['', Validators.required],
    imageUrl: [''],
    active: [true]
  });

  ngOnInit() { this.load(); }

  load() {
    this.productService.getProducts(0, 200).subscribe(p => this.products.set(p.content));
  }

  openForm() { this.form.reset({ active: true }); this.editingId.set(null); this.showForm.set(true); }
  closeForm() { this.showForm.set(false); this.editingId.set(null); }

  edit(p: Product) {
    this.editingId.set(p.id);
    this.form.patchValue({ name: p.name, description: p.description, price: p.price, stock: p.stock, category: p.category, imageUrl: p.imageUrl, active: p.active });
    this.showForm.set(true);
  }

  save() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const req = this.form.value as any;
    const obs = this.editingId()
      ? this.adminService.updateProduct(this.editingId()!, req)
      : this.adminService.createProduct(req);

    obs.subscribe({
      next: () => { this.toast.success('Produs salvat!'); this.closeForm(); this.load(); this.saving.set(false); },
      error: () => { this.toast.error('Eroare la salvare'); this.saving.set(false); }
    });
  }

  delete(id: number) {
    if (!confirm('Ești sigur că vrei să ștergi acest produs?')) return;
    this.adminService.deleteProduct(id).subscribe({
      next: () => { this.toast.success('Produs șters'); this.load(); },
      error: () => this.toast.error('Eroare la ștergere')
    });
  }
}
