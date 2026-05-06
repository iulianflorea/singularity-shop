import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ProductService } from '../../../services/product.service';
import { ToastService } from '../../../services/toast.service';
import { Product } from '../../../models/product.model';
import { Category } from '../../../models/category.model';

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

            <div class="type-selector">
              <label class="type-option" [class.selected]="form.get('productType')?.value === 'PHYSICAL'">
                <input type="radio" formControlName="productType" value="PHYSICAL" />
                <span class="type-icon">📦</span>
                <span>Echipament IT</span>
              </label>
              <label class="type-option" [class.selected]="form.get('productType')?.value === 'SOFTWARE'">
                <input type="radio" formControlName="productType" value="SOFTWARE" />
                <span class="type-icon">💿</span>
                <span>Produs software</span>
              </label>
            </div>

            <div class="form-grid">
              <div class="field">
                <label>Nume *</label>
                <input formControlName="name" placeholder="Nume produs" />
              </div>
              <div class="field">
                <label>Cod produs</label>
                <input formControlName="productCode" placeholder="ex: SKU-001" />
              </div>
              <div class="field">
                <label>Categorie *</label>
                <select formControlName="category">
                  <option value="">-- Alege categoria --</option>
                  @for (cat of categories(); track cat.id) {
                    <option [value]="cat.name">{{ cat.name }}</option>
                  }
                </select>
              </div>
              <div class="field">
                <label>Preț vânzare cu TVA (RON) *</label>
                <input formControlName="price" type="number" step="0.01" placeholder="0.00" (input)="updatePriceSignal()" />
                @if (currentPrice() > 0) {
                  <div class="tva-breakdown">
                    <span>Fără TVA: <strong>{{ priceWithoutTva() | number:'1.2-2' }} RON</strong></span>
                    <span>TVA {{ adminService.tvaRate() }}%: <strong>{{ tvaPart() | number:'1.2-2' }} RON</strong></span>
                  </div>
                }
              </div>
              <div class="field">
                <label>Preț cumpărare (RON)</label>
                <input formControlName="purchasePrice" type="number" step="0.01" placeholder="0.00" />
              </div>
              @if (form.get('productType')?.value === 'PHYSICAL') {
                <div class="field">
                  <label>Stoc</label>
                  <input formControlName="stock" type="number" placeholder="0" />
                </div>
              }
              <div class="field full">
                <label>Imagine produs</label>
                <div class="image-upload-area">
                  @if (imagePreview()) {
                    <div class="image-preview-wrap">
                      <img [src]="imagePreview()!" class="image-preview" alt="preview" />
                      <button type="button" class="btn-remove-img" (click)="removeImage()">✕</button>
                    </div>
                  }
                  @if (!imagePreview()) {
                    <label class="upload-dropzone" [class.uploading]="uploading()">
                      <input type="file" accept="image/*" (change)="onFileSelected($event)" hidden />
                      @if (uploading()) {
                        <span>Se încarcă...</span>
                      } @else {
                        <span>Apasă pentru a alege imaginea</span>
                        <small>JPG, PNG, WEBP — max 5MB</small>
                      }
                    </label>
                  }
                </div>
              </div>
              <div class="field">
                <label class="checkbox-label">
                  <input type="checkbox" formControlName="active" />
                  Activ (vizibil în magazin)
                </label>
              </div>
            </div>

            <div class="tabs-section">
              <div class="tab-buttons">
                <button type="button" class="tab-btn" [class.active]="formTab() === 'description'" (click)="formTab.set('description')">Descriere</button>
                <button type="button" class="tab-btn" [class.active]="formTab() === 'specs'" (click)="formTab.set('specs')">Specificații</button>
              </div>

              @if (formTab() === 'description') {
                <div class="tab-panel">
                  <div class="field">
                    <label>Descriere</label>
                    <textarea formControlName="description" rows="5" placeholder="Descriere produs"></textarea>
                  </div>
                  <div class="field">
                    <label>Imagini descriere</label>
                    <div class="desc-images">
                      @for (url of descriptionImages(); track url; let i = $index) {
                        <div class="desc-img-wrap">
                          <img [src]="url" class="desc-thumb" alt="desc img" />
                          <button type="button" class="btn-remove-img" (click)="removeDescImage(i)">✕</button>
                        </div>
                      }
                      <label class="upload-dropzone small" [class.uploading]="uploadingDesc()">
                        <input type="file" accept="image/*" (change)="onDescFileSelected($event)" hidden />
                        @if (uploadingDesc()) {
                          <span>Se încarcă...</span>
                        } @else {
                          <span>+ Adaugă imagine</span>
                        }
                      </label>
                    </div>
                  </div>
                </div>
              }

              @if (formTab() === 'specs') {
                <div class="tab-panel">
                  <div formArrayName="specifications" class="specs-list">
                    @for (spec of specs.controls; track $index; let i = $index) {
                      <div class="spec-row" [formGroupName]="i">
                        <input formControlName="name" placeholder="Denumire (ex: Procesor)" class="spec-input" />
                        <input formControlName="value" placeholder="Valoare (ex: Intel i7)" class="spec-input spec-value" />
                        <button type="button" class="btn-remove-spec" (click)="removeSpec(i)">✕</button>
                      </div>
                    }
                  </div>
                  <button type="button" class="btn-add-spec" (click)="addSpec()">+ Adaugă specificație</button>
                </div>
              }
            </div>

            <div class="form-actions">
              <button type="button" class="btn-secondary" (click)="closeForm()">Anulează</button>
              <button type="submit" class="btn-primary" [disabled]="form.invalid || saving() || uploading()">
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
              <th>Cod</th>
              <th>Nume</th>
              <th>Tip</th>
              <th>Categorie</th>
              <th>Preț vânzare</th>
              <th>Preț cumpărare</th>
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
                <td>{{ p.productCode || '—' }}</td>
                <td>{{ p.name }}</td>
                <td><span [class]="'type-badge ' + (p.productType === 'SOFTWARE' ? 'software' : 'physical')">{{ p.productType === 'SOFTWARE' ? 'Software' : 'Echipament IT' }}</span></td>
                <td>{{ p.category }}</td>
                <td>{{ p.price | number:'1.2-2' }} RON</td>
                <td>{{ p.purchasePrice != null ? (p.purchasePrice | number:'1.2-2') + ' RON' : '—' }}</td>
                <td>{{ p.productType === 'SOFTWARE' ? '∞' : p.stock }}</td>
                <td><span [class]="p.active ? 'badge active' : 'badge inactive'">{{ p.active ? 'Activ' : 'Inactiv' }}</span></td>
                <td>
                  <div class="actions">
                    <button class="btn-edit" (click)="edit(p)">Editează</button>
                    <button class="btn-delete" (click)="delete(p.id)">Șterge</button>
                  </div>
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

    .type-selector { display: flex; gap: 1rem; margin-bottom: 1.25rem; }
    .type-option { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.2rem; border: 1px solid var(--color-border); border-radius: 8px; cursor: pointer; font-size: 0.9rem; transition: all 0.15s; }
    .type-option input[type=radio] { display: none; }
    .type-option.selected { border-color: var(--color-primary); background: color-mix(in srgb, var(--color-primary) 10%, transparent); color: var(--color-primary); font-weight: 500; }
    .type-icon { font-size: 1.1rem; }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .field { display: flex; flex-direction: column; gap: 0.4rem; }
    .field.full { grid-column: 1 / -1; }
    .tva-breakdown { display: flex; gap: 1rem; font-size: 0.78rem; color: var(--color-text-secondary); margin-top: 0.15rem; }
    .field label { font-size: 0.85rem; font-weight: 500; color: var(--color-text-secondary); }
    .field input, .field textarea, .field select { padding: 0.6rem 0.8rem; border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-bg); color: var(--color-text); font-size: 0.95rem; }
    .checkbox-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.85rem; font-weight: 500; color: var(--color-text-secondary); }

    .image-upload-area { display: flex; gap: 1rem; align-items: flex-start; flex-wrap: wrap; }
    .upload-dropzone { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.3rem; width: 100%; min-height: 100px; border: 2px dashed var(--color-border); border-radius: 8px; cursor: pointer; padding: 1rem; color: var(--color-text-secondary); font-size: 0.9rem; transition: border-color 0.2s; }
    .upload-dropzone:hover { border-color: var(--color-primary); }
    .upload-dropzone.uploading { opacity: 0.6; cursor: wait; }
    .upload-dropzone small { font-size: 0.75rem; opacity: 0.7; }
    .upload-dropzone.small { min-height: 80px; width: 100px; font-size: 0.8rem; }
    .image-preview-wrap { position: relative; display: inline-block; }
    .image-preview { width: 120px; height: 120px; object-fit: cover; border-radius: 8px; border: 1px solid var(--color-border); display: block; }
    .btn-remove-img { position: absolute; top: -8px; right: -8px; width: 22px; height: 22px; border-radius: 50%; background: #ef4444; color: white; border: none; cursor: pointer; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; padding: 0; }

    .desc-images { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: flex-start; margin-top: 0.5rem; }
    .desc-img-wrap { position: relative; display: inline-block; }
    .desc-thumb { width: 100px; height: 100px; object-fit: cover; border-radius: 8px; border: 1px solid var(--color-border); display: block; }

    .tabs-section { margin-top: 1.5rem; border: 1px solid var(--color-border); border-radius: 10px; overflow: hidden; }
    .tab-buttons { display: flex; border-bottom: 1px solid var(--color-border); }
    .tab-btn { flex: 1; padding: 0.65rem 1rem; background: var(--color-bg); border: none; cursor: pointer; font-size: 0.9rem; color: var(--color-text-secondary); transition: all 0.15s; }
    .tab-btn.active { background: var(--color-surface); color: var(--color-primary); font-weight: 600; border-bottom: 2px solid var(--color-primary); }
    .tab-panel { padding: 1rem; display: flex; flex-direction: column; gap: 1rem; }
    .tab-panel .field input, .tab-panel .field textarea { background: var(--color-bg); }

    .specs-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .spec-row { display: flex; gap: 0.5rem; align-items: center; }
    .spec-input { flex: 1; padding: 0.5rem 0.7rem; border: 1px solid var(--color-border); border-radius: 7px; background: var(--color-bg); color: var(--color-text); font-size: 0.9rem; }
    .spec-value { flex: 2; }
    .btn-remove-spec { width: 28px; height: 28px; border-radius: 50%; background: #ef4444; color: white; border: none; cursor: pointer; font-size: 0.75rem; flex-shrink: 0; }
    .btn-add-spec { margin-top: 0.25rem; padding: 0.45rem 1rem; background: transparent; border: 1px dashed var(--color-border); border-radius: 7px; cursor: pointer; color: var(--color-text-secondary); font-size: 0.85rem; text-align: left; transition: border-color 0.2s; }
    .btn-add-spec:hover { border-color: var(--color-primary); color: var(--color-primary); }

    .form-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.25rem; }
    .table-wrapper { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid var(--color-border); font-size: 0.9rem; vertical-align: middle; }
    th { color: var(--color-text-secondary); font-weight: 600; }
    .thumb { width: 48px; height: 48px; object-fit: cover; border-radius: 6px; display: block; }
    .no-img { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; color: var(--color-text-secondary); }
    .badge { padding: 0.25rem 0.6rem; border-radius: 20px; font-size: 0.8rem; font-weight: 500; }
    .badge.active { background: #d1fae5; color: #065f46; }
    .badge.inactive { background: #fee2e2; color: #991b1b; }
    .type-badge { padding: 0.2rem 0.55rem; border-radius: 20px; font-size: 0.78rem; font-weight: 500; }
    .type-badge.physical { background: #e0f2fe; color: #0369a1; }
    .type-badge.software { background: #f3e8ff; color: #7e22ce; }
    .actions { display: flex; gap: 0.5rem; align-items: center; }
    .btn-primary { padding: 0.6rem 1.2rem; background: var(--color-primary); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary { padding: 0.6rem 1.2rem; background: transparent; color: var(--color-text); border: 1px solid var(--color-border); border-radius: 8px; cursor: pointer; }
    .btn-edit { padding: 0.35rem 0.8rem; background: var(--color-primary); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; white-space: nowrap; }
    .btn-delete { padding: 0.35rem 0.8rem; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; white-space: nowrap; }
  `]
})
export class AdminProductsComponent implements OnInit {
  private fb = inject(FormBuilder);
  protected adminService = inject(AdminService);
  private productService = inject(ProductService);
  private toast = inject(ToastService);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  saving = signal(false);
  uploading = signal(false);
  uploadingDesc = signal(false);
  imagePreview = signal<string | null>(null);
  currentPrice = signal<number>(0);
  formTab = signal<'description' | 'specs'>('description');
  descriptionImages = signal<string[]>([]);

  priceWithoutTva = computed(() => {
    const rate = this.adminService.tvaRate();
    return this.currentPrice() / (1 + rate / 100);
  });

  tvaPart = computed(() => this.currentPrice() - this.priceWithoutTva());

  form = this.fb.group({
    name: ['', Validators.required],
    productCode: [''],
    description: [''],
    price: [null as number | null, [Validators.required, Validators.min(0.01)]],
    purchasePrice: [null as number | null, Validators.min(0)],
    stock: [null as number | null, Validators.min(0)],
    category: ['', Validators.required],
    imageUrl: [''],
    productType: ['PHYSICAL', Validators.required],
    active: [true],
    specifications: this.fb.array([])
  });

  get specs(): FormArray { return this.form.get('specifications') as FormArray; }

  ngOnInit() {
    this.load();
    this.adminService.getSettings().subscribe();
    this.adminService.getCategories().subscribe(c => this.categories.set(c));
  }

  load() {
    this.productService.getProducts(0, 200).subscribe(p => this.products.set(p.content));
  }

  updatePriceSignal() {
    this.currentPrice.set(Number(this.form.get('price')?.value) || 0);
  }

  addSpec() {
    this.specs.push(this.fb.group({ name: [''], value: [''] }));
  }

  removeSpec(i: number) {
    this.specs.removeAt(i);
  }

  openForm() {
    this.form.reset({ active: true, productType: 'PHYSICAL' });
    while (this.specs.length) this.specs.removeAt(0);
    this.editingId.set(null);
    this.imagePreview.set(null);
    this.descriptionImages.set([]);
    this.currentPrice.set(0);
    this.formTab.set('description');
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.editingId.set(null);
    this.imagePreview.set(null);
    this.descriptionImages.set([]);
  }

  edit(p: Product) {
    this.editingId.set(p.id);
    this.form.patchValue({
      name: p.name, productCode: p.productCode, description: p.description,
      price: p.price, purchasePrice: p.purchasePrice, stock: p.stock,
      category: p.category, imageUrl: p.imageUrl, productType: p.productType || 'PHYSICAL', active: p.active
    });
    this.currentPrice.set(p.price || 0);
    this.imagePreview.set(p.imageUrl || null);
    this.descriptionImages.set(p.descriptionImages ? [...p.descriptionImages] : []);
    while (this.specs.length) this.specs.removeAt(0);
    (p.specifications || []).forEach(s => this.specs.push(this.fb.group({ name: [s.name], value: [s.value] })));
    this.formTab.set('description');
    this.showForm.set(true);
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploading.set(true);
    this.adminService.uploadImage(file).subscribe({
      next: ({ url }) => {
        this.form.patchValue({ imageUrl: url });
        this.imagePreview.set(url);
        this.uploading.set(false);
      },
      error: () => { this.toast.error('Eroare la încărcarea imaginii'); this.uploading.set(false); }
    });
  }

  onDescFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingDesc.set(true);
    this.adminService.uploadImage(file).subscribe({
      next: ({ url }) => {
        this.descriptionImages.update(imgs => [...imgs, url]);
        this.uploadingDesc.set(false);
        (event.target as HTMLInputElement).value = '';
      },
      error: () => { this.toast.error('Eroare la încărcarea imaginii'); this.uploadingDesc.set(false); }
    });
  }

  removeImage() {
    this.form.patchValue({ imageUrl: '' });
    this.imagePreview.set(null);
  }

  removeDescImage(i: number) {
    this.descriptionImages.update(imgs => imgs.filter((_, idx) => idx !== i));
  }

  save() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.value;
    const req = {
      name: v.name!,
      productCode: v.productCode || undefined,
      description: v.description || undefined,
      price: v.price!,
      purchasePrice: v.purchasePrice,
      stock: v.productType === 'SOFTWARE' ? 0 : (v.stock ?? 0),
      category: v.category!,
      imageUrl: v.imageUrl || undefined,
      productType: v.productType!,
      active: v.active ?? true,
      specifications: (this.specs.value as { name: string; value: string }[]).filter(s => s.name?.trim()),
      descriptionImages: this.descriptionImages()
    };

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
