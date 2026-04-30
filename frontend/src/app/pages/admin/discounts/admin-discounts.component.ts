import { Component, inject, OnInit, signal } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ToastService } from '../../../services/toast.service';
import { Discount } from '../../../models/discount.model';

@Component({
  selector: 'app-admin-discounts',
  imports: [ReactiveFormsModule, SlicePipe],
  template: `
    <div class="admin-page">
      <div class="page-header">
        <h1 class="admin-title">Discounturi</h1>
        <button class="btn-primary" (click)="openForm()">+ Discount nou</button>
      </div>

      @if (showForm()) {
        <div class="form-card">
          <h2>{{ editingId() ? 'Editează discount' : 'Discount nou' }}</h2>
          <form [formGroup]="form" (ngSubmit)="save()">
            <div class="form-grid">
              <div class="field">
                <label>Cod *</label>
                <input formControlName="code" placeholder="ex: SUMMER20" style="text-transform:uppercase" />
              </div>
              <div class="field">
                <label>Tip *</label>
                <select formControlName="type">
                  <option value="PERCENTAGE">Procent (%)</option>
                  <option value="FIXED">Sumă fixă (RON)</option>
                </select>
              </div>
              <div class="field">
                <label>Valoare *</label>
                <input formControlName="value" type="number" step="0.01" placeholder="ex: 20" />
              </div>
              <div class="field">
                <label>Sumă minimă comandă (RON)</label>
                <input formControlName="minOrderAmount" type="number" step="0.01" placeholder="opțional" />
              </div>
              <div class="field">
                <label>Număr maxim utilizări</label>
                <input formControlName="maxUses" type="number" placeholder="opțional — nelimitat" />
              </div>
              <div class="field">
                <label>Valabil de la</label>
                <input formControlName="validFrom" type="datetime-local" />
              </div>
              <div class="field">
                <label>Valabil până la</label>
                <input formControlName="validTo" type="datetime-local" />
              </div>
              <div class="field">
                <label class="checkbox-label">
                  <input type="checkbox" formControlName="active" />
                  Activ
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
              <th>Cod</th>
              <th>Tip</th>
              <th>Valoare</th>
              <th>Min. comandă</th>
              <th>Utilizări</th>
              <th>Valabilitate</th>
              <th>Status</th>
              <th>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            @for (d of discounts(); track d.id) {
              <tr>
                <td><strong>{{ d.code }}</strong></td>
                <td>{{ d.type === 'PERCENTAGE' ? 'Procent' : 'Fix' }}</td>
                <td>{{ d.type === 'PERCENTAGE' ? d.value + '%' : d.value + ' RON' }}</td>
                <td>{{ d.minOrderAmount ? d.minOrderAmount + ' RON' : '—' }}</td>
                <td>{{ d.usedCount }}{{ d.maxUses ? ' / ' + d.maxUses : '' }}</td>
                <td class="validity">
                  @if (d.validFrom || d.validTo) {
                    <span>{{ d.validFrom ? (d.validFrom | slice:0:10) : '∞' }} → {{ d.validTo ? (d.validTo | slice:0:10) : '∞' }}</span>
                  } @else {
                    <span>Permanent</span>
                  }
                </td>
                <td><span [class]="d.active ? 'badge active' : 'badge inactive'">{{ d.active ? 'Activ' : 'Inactiv' }}</span></td>
                <td class="actions">
                  <button class="btn-edit" (click)="edit(d)">Editează</button>
                  <button class="btn-delete" (click)="delete(d.id)">Șterge</button>
                </td>
              </tr>
            }
            @empty {
              <tr><td colspan="8" style="text-align:center;color:var(--color-text-secondary);padding:2rem">Niciun discount creat</td></tr>
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
    .field label { font-size: 0.85rem; font-weight: 500; color: var(--color-text-secondary); }
    .field input, .field select { padding: 0.6rem 0.8rem; border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-bg); color: var(--color-text); font-size: 0.95rem; }
    .checkbox-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; margin-top: 0.5rem; }
    .form-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem; }
    .table-wrapper { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid var(--color-border); font-size: 0.9rem; }
    th { color: var(--color-text-secondary); font-weight: 600; }
    .badge { padding: 0.25rem 0.6rem; border-radius: 20px; font-size: 0.8rem; font-weight: 500; }
    .badge.active { background: #d1fae5; color: #065f46; }
    .badge.inactive { background: #fee2e2; color: #991b1b; }
    .actions { display: flex; gap: 0.5rem; }
    .validity { font-size: 0.82rem; color: var(--color-text-secondary); }
    .btn-primary { padding: 0.6rem 1.2rem; background: var(--color-primary); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary { padding: 0.6rem 1.2rem; background: transparent; color: var(--color-text); border: 1px solid var(--color-border); border-radius: 8px; cursor: pointer; }
    .btn-edit { padding: 0.35rem 0.8rem; background: var(--color-primary); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
    .btn-delete { padding: 0.35rem 0.8rem; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
  `]
})
export class AdminDiscountsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private toast = inject(ToastService);

  discounts = signal<Discount[]>([]);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  saving = signal(false);

  form = this.fb.group({
    code: ['', Validators.required],
    type: ['PERCENTAGE', Validators.required],
    value: [null as number | null, [Validators.required, Validators.min(0.01)]],
    minOrderAmount: [null as number | null],
    maxUses: [null as number | null],
    active: [true],
    validFrom: [null as string | null],
    validTo: [null as string | null]
  });

  ngOnInit() { this.load(); }

  load() { this.adminService.getDiscounts().subscribe(d => this.discounts.set(d)); }

  openForm() { this.form.reset({ type: 'PERCENTAGE', active: true }); this.editingId.set(null); this.showForm.set(true); }
  closeForm() { this.showForm.set(false); this.editingId.set(null); }

  edit(d: Discount) {
    this.editingId.set(d.id);
    this.form.patchValue({ code: d.code, type: d.type, value: d.value, minOrderAmount: d.minOrderAmount ?? null, maxUses: d.maxUses ?? null, active: d.active, validFrom: d.validFrom ? d.validFrom.slice(0, 16) : null, validTo: d.validTo ? d.validTo.slice(0, 16) : null });
    this.showForm.set(true);
  }

  save() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const raw = this.form.value as any;
    const req = { ...raw, code: raw.code.toUpperCase(), validFrom: raw.validFrom || null, validTo: raw.validTo || null };
    const obs = this.editingId() ? this.adminService.updateDiscount(this.editingId()!, req) : this.adminService.createDiscount(req);
    obs.subscribe({
      next: () => { this.toast.success('Discount salvat!'); this.closeForm(); this.load(); this.saving.set(false); },
      error: (e) => { this.toast.error(e.error?.message || 'Eroare la salvare'); this.saving.set(false); }
    });
  }

  delete(id: number) {
    if (!confirm('Ștergi acest discount?')) return;
    this.adminService.deleteDiscount(id).subscribe({ next: () => { this.toast.success('Discount șters'); this.load(); }, error: () => this.toast.error('Eroare') });
  }
}
