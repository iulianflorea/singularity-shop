import { Component, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ToastService } from '../../../services/toast.service';
import { PurchaseOrder } from '../../../models/purchase-order.model';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-admin-stock-orders',
  imports: [ReactiveFormsModule, DecimalPipe],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h1 class="admin-title">Comenzi stoc</h1>
        <button class="btn-primary" (click)="toggleForm()">
          {{ showForm() ? 'Închide' : '+ Comandă nouă' }}
        </button>
      </div>

      @if (showForm()) {
        <div class="form-card">
          <h2>Comandă stoc nouă</h2>
          <form [formGroup]="form" (ngSubmit)="save()">
            <div class="form-top-row">
              <div class="field">
                <label>Data comenzii *</label>
                <input formControlName="orderDate" type="date" />
              </div>
              <div class="field flex-grow">
                <label>Note</label>
                <input formControlName="notes" placeholder="ex: Furnizor X, factura #123" />
              </div>
            </div>

            <div class="items-section" formArrayName="items">
              <div class="items-header">
                <span class="items-title">Produse comandate</span>
                <button type="button" class="btn-add-item" (click)="addItem()">+ Adaugă produs</button>
              </div>

              @if (itemsArray.length === 0) {
                <div class="empty-items">Apasă "+ Adaugă produs" pentru a adăuga produse.</div>
              }

              @for (item of itemsArray.controls; track $index) {
                <div [formGroupName]="$index" class="item-row">
                  <div class="field">
                    <label>Produs *</label>
                    <select formControlName="productId" (change)="onProductChange($index)">
                      <option value="">— Selectează —</option>
                      @for (p of products(); track p.id) {
                        <option [value]="p.id">{{ p.name }}{{ p.productCode ? ' (' + p.productCode + ')' : '' }}</option>
                      }
                    </select>
                  </div>
                  <div class="field">
                    <label>Cantitate *</label>
                    <input formControlName="quantity" type="number" min="1" placeholder="1" />
                  </div>
                  <div class="field">
                    <label>Preț cumpărare/buc (RON) *</label>
                    <input formControlName="unitPurchasePrice" type="number" step="0.01" placeholder="0.00" />
                  </div>
                  <div class="field line-total-field">
                    <label>Total linie</label>
                    <span class="line-total-value">{{ lineTotal($index) | number:'1.2-2' }} RON</span>
                  </div>
                  <button type="button" class="btn-remove-item" (click)="removeItem($index)">✕</button>
                </div>
              }
            </div>

            @if (itemsArray.length > 0) {
              <div class="order-total">
                Total comandă: <strong>{{ orderTotal() | number:'1.2-2' }} RON</strong>
              </div>
            }

            <div class="form-actions">
              <button type="button" class="btn-secondary" (click)="toggleForm()">Anulează</button>
              <button type="submit" class="btn-primary" [disabled]="form.invalid || itemsArray.length === 0 || saving()">
                {{ saving() ? 'Se salvează...' : 'Salvează comanda' }}
              </button>
            </div>
          </form>
        </div>
      }

      <div class="orders-list">
        @for (po of purchaseOrders(); track po.id) {
          <div class="po-card">
            <div class="po-header">
              <div class="po-meta">
                <span class="po-id">#{{ po.id }}</span>
                <span class="po-date">{{ po.orderDate }}</span>
                @if (po.notes) { <span class="po-notes">{{ po.notes }}</span> }
              </div>
              <div class="po-right">
                <span class="po-total">{{ po.totalAmount | number:'1.2-2' }} RON</span>
                <button class="btn-delete" (click)="delete(po.id)">Șterge</button>
              </div>
            </div>
            <table class="po-items">
              <thead>
                <tr>
                  <th>Produs</th>
                  <th>Cantitate</th>
                  <th>Preț/buc</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                @for (item of po.items; track item.id) {
                  <tr>
                    <td>{{ item.productName }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>{{ item.unitPurchasePrice | number:'1.2-2' }} RON</td>
                    <td>{{ item.lineTotal | number:'1.2-2' }} RON</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
        @empty {
          <div class="empty-state">Nicio comandă de stoc înregistrată</div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .form-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; }
    .form-card h2 { margin: 0 0 1.25rem; font-size: 1.1rem; }
    .form-top-row { display: flex; gap: 1rem; align-items: flex-end; margin-bottom: 1.25rem; }
    .field { display: flex; flex-direction: column; gap: 0.4rem; }
    .field.flex-grow { flex: 1; }
    .field label { font-size: 0.85rem; font-weight: 500; color: var(--color-text-secondary); }
    .field input, .field select { padding: 0.6rem 0.8rem; border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-bg); color: var(--color-text); font-size: 0.95rem; }
    .field.line-total-field span { padding: 0.5rem 0; font-weight: 600; color: var(--color-primary); font-size: 0.95rem; }
    .items-section { border-top: 1px solid var(--color-border); padding-top: 1rem; }
    .items-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
    .items-title { font-weight: 600; font-size: 0.95rem; }
    .btn-add-item { padding: 0.4rem 0.9rem; background: var(--color-surface); border: 1px solid var(--color-primary); color: var(--color-primary); border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
    .empty-items { padding: 1rem; text-align: center; color: var(--color-text-secondary); font-size: 0.9rem; border: 1px dashed var(--color-border); border-radius: 8px; margin-bottom: 0.5rem; }
    .item-row { display: grid; grid-template-columns: 2fr 1fr 1.2fr 1fr auto; gap: 0.75rem; align-items: end; padding: 0.75rem; background: var(--color-bg); border-radius: 8px; margin-bottom: 0.5rem; }
    .btn-remove-item { padding: 0.5rem 0.6rem; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
    .order-total { text-align: right; padding: 0.75rem 0; font-size: 1rem; border-top: 1px solid var(--color-border); margin-top: 0.25rem; }
    .form-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem; }

    .orders-list { display: flex; flex-direction: column; gap: 1rem; }
    .po-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; padding: 1.25rem; }
    .po-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem; }
    .po-meta { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }
    .po-id { font-weight: 700; }
    .po-date { color: var(--color-text-secondary); font-size: 0.9rem; }
    .po-notes { font-style: italic; color: var(--color-text-secondary); font-size: 0.85rem; }
    .po-right { display: flex; align-items: center; gap: 1rem; }
    .po-total { font-weight: 700; color: var(--color-primary); font-size: 1.05rem; }
    .po-items { width: 100%; border-collapse: collapse; }
    .po-items th, .po-items td { padding: 0.5rem 0.75rem; text-align: left; border-bottom: 1px solid var(--color-border); font-size: 0.88rem; vertical-align: middle; }
    .po-items th { color: var(--color-text-secondary); font-weight: 600; }
    .empty-state { text-align: center; color: var(--color-text-secondary); padding: 3rem; }

    .btn-primary { padding: 0.6rem 1.2rem; background: var(--color-primary); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary { padding: 0.6rem 1.2rem; background: transparent; color: var(--color-text); border: 1px solid var(--color-border); border-radius: 8px; cursor: pointer; }
    .btn-delete { padding: 0.35rem 0.8rem; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
  `]
})
export class AdminStockOrdersComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private toast = inject(ToastService);

  purchaseOrders = signal<PurchaseOrder[]>([]);
  products = signal<Product[]>([]);
  showForm = signal(false);
  saving = signal(false);

  form = this.fb.group({
    orderDate: [this.todayIso(), Validators.required],
    notes: [''],
    items: this.fb.array([])
  });

  get itemsArray() { return this.form.get('items') as FormArray; }

  ngOnInit() {
    this.load();
    this.adminService.getAllProducts().subscribe(p => this.products.set(p));
  }

  load() {
    this.adminService.getPurchaseOrders().subscribe(o => this.purchaseOrders.set(o));
  }

  toggleForm() {
    this.showForm.update(v => !v);
    if (!this.showForm()) {
      this.form.patchValue({ orderDate: this.todayIso(), notes: '' });
      while (this.itemsArray.length) this.itemsArray.removeAt(0);
    }
  }

  addItem() {
    this.itemsArray.push(this.fb.group({
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPurchasePrice: [null, [Validators.required, Validators.min(0.01)]]
    }));
  }

  removeItem(i: number) { this.itemsArray.removeAt(i); }

  onProductChange(i: number) {
    const ctrl = this.itemsArray.at(i);
    const productId = Number(ctrl.get('productId')!.value);
    const product = this.products().find(p => p.id === productId);
    if (product && product.purchasePrice != null) {
      ctrl.get('unitPurchasePrice')!.setValue(product.purchasePrice);
    }
  }

  lineTotal(i: number): number {
    const ctrl = this.itemsArray.at(i);
    const qty = Number(ctrl.get('quantity')?.value) || 0;
    const price = Number(ctrl.get('unitPurchasePrice')?.value) || 0;
    return qty * price;
  }

  orderTotal(): number {
    let total = 0;
    for (let i = 0; i < this.itemsArray.length; i++) total += this.lineTotal(i);
    return total;
  }

  save() {
    if (this.form.invalid || this.itemsArray.length === 0) return;
    this.saving.set(true);
    const val = this.form.value;
    this.adminService.createPurchaseOrder({
      orderDate: val.orderDate || this.todayIso(),
      notes: val.notes || undefined,
      items: (val.items as any[]).map(i => ({
        productId: Number(i.productId),
        quantity: Number(i.quantity),
        unitPurchasePrice: Number(i.unitPurchasePrice)
      }))
    }).subscribe({
      next: () => { this.toast.success('Comandă salvată!'); this.toggleForm(); this.load(); this.saving.set(false); },
      error: () => { this.toast.error('Eroare la salvare'); this.saving.set(false); }
    });
  }

  delete(id: number) {
    if (!confirm('Ștergi această comandă de stoc?')) return;
    this.adminService.deletePurchaseOrder(id).subscribe({
      next: () => { this.toast.success('Comandă ștearsă'); this.load(); },
      error: () => this.toast.error('Eroare la ștergere')
    });
  }

  private todayIso(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
