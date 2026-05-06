import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService, AdminStats } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, DecimalPipe, FormsModule],
  template: `
    <div class="admin-page">
      <h1 class="admin-title">Dashboard</h1>

      @if (stats()) {
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ stats()!.totalOrders }}</div>
            <div class="stat-label">Comenzi totale</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats()!.revenue | number:'1.2-2' }} RON</div>
            <div class="stat-label">Venituri confirmate (cu TVA)</div>
            <div class="stat-detail">
              Fără TVA: {{ revenueWithoutTva() | number:'1.2-2' }} RON
              <span class="fee-note">TVA {{ adminService.tvaRate() }}%: {{ tvaAmount() | number:'1.2-2' }} RON</span>
            </div>
          </div>
          <div class="stat-card stripe">
            <div class="stat-value">{{ netRevenue() | number:'1.2-2' }} RON</div>
            <div class="stat-label">Venituri nete (după Stripe)</div>
            <div class="stat-detail">
              Taxe Stripe: {{ stripeFees() | number:'1.2-2' }} RON
              <span class="fee-note">1.4% + 1 RON/tranzacție</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats()!.totalProducts }}</div>
            <div class="stat-label">Produse</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats()!.totalCustomers }}</div>
            <div class="stat-label">Clienți</div>
          </div>
        </div>
      }

      <div class="settings-card">
        <div class="settings-title">Setări fiscale</div>
        <div class="setting-row">
          <span class="setting-label">Cotă TVA (%)</span>
          @if (editingTva()) {
            <div class="tva-edit">
              <input type="number" [(ngModel)]="tvaInput" min="0" max="100" step="1" class="tva-input" />
              <button class="btn-save-tva" (click)="saveTva()" [disabled]="savingTva()">
                {{ savingTva() ? '...' : 'Salvează' }}
              </button>
              <button class="btn-cancel-tva" (click)="cancelTva()">Anulează</button>
            </div>
          } @else {
            <div class="tva-display">
              <span class="tva-value">{{ adminService.tvaRate() }}%</span>
              <button class="btn-edit-tva" (click)="startEditTva()">Modifică</button>
            </div>
          }
        </div>
        <p class="setting-hint">
          Prețurile produselor sunt introduse cu TVA inclus. TVA-ul este calculat cu formula:
          TVA = preț × cotă / (100 + cotă)
        </p>
      </div>

      <div class="quick-links">
        <a routerLink="/admin/products" class="quick-link">Gestionează produse</a>
        <a routerLink="/admin/discounts" class="quick-link">Gestionează discounturi</a>
        <a routerLink="/admin/orders" class="quick-link">Vezi comenzile</a>
      </div>
    </div>
  `,
  styles: [`
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .stat-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; padding: 1.5rem; text-align: center; }
    .stat-card.stripe { border-color: #635bff44; background: color-mix(in srgb, var(--color-surface) 95%, #635bff); }
    .stat-value { font-size: 2rem; font-weight: 700; color: var(--color-primary); }
    .stat-label { color: var(--color-text-secondary); margin-top: 0.25rem; font-size: 0.9rem; }
    .stat-detail { margin-top: 0.5rem; font-size: 0.78rem; color: var(--color-text-secondary); display: flex; flex-direction: column; gap: 0.15rem; }
    .fee-note { font-size: 0.72rem; opacity: 0.7; }

    .settings-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; padding: 1.25rem 1.5rem; margin-bottom: 2rem; }
    .settings-title { font-weight: 600; font-size: 0.95rem; margin-bottom: 1rem; }
    .setting-row { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 0.75rem; }
    .setting-label { font-size: 0.9rem; color: var(--color-text-secondary); min-width: 120px; }
    .tva-display { display: flex; align-items: center; gap: 0.75rem; }
    .tva-value { font-size: 1.3rem; font-weight: 700; color: var(--color-primary); }
    .btn-edit-tva { padding: 0.3rem 0.75rem; background: transparent; border: 1px solid var(--color-border); border-radius: 6px; cursor: pointer; font-size: 0.82rem; color: var(--color-text); }
    .btn-edit-tva:hover { border-color: var(--color-primary); color: var(--color-primary); }
    .tva-edit { display: flex; align-items: center; gap: 0.5rem; }
    .tva-input { width: 80px; padding: 0.4rem 0.6rem; border: 1px solid var(--color-primary); border-radius: 6px; background: var(--color-bg); color: var(--color-text); font-size: 0.95rem; text-align: center; }
    .btn-save-tva { padding: 0.4rem 0.9rem; background: var(--color-primary); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
    .btn-save-tva:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-cancel-tva { padding: 0.4rem 0.9rem; background: transparent; border: 1px solid var(--color-border); border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
    .setting-hint { font-size: 0.78rem; color: var(--color-text-secondary); opacity: 0.7; margin: 0; }

    .quick-links { display: flex; gap: 1rem; flex-wrap: wrap; }
    .quick-link { padding: 0.75rem 1.5rem; background: var(--color-primary); color: white; border-radius: 8px; text-decoration: none; font-weight: 500; }
    .quick-link:hover { opacity: 0.9; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  protected adminService = inject(AdminService);
  stats = signal<AdminStats | null>(null);
  editingTva = signal(false);
  savingTva = signal(false);
  tvaInput = 19;

  stripeFees = computed(() => {
    const s = this.stats();
    if (!s) return 0;
    return s.revenue * 0.014 + s.totalOrders * 1.0;
  });

  netRevenue = computed(() => {
    const s = this.stats();
    if (!s) return 0;
    return s.revenue - this.stripeFees();
  });

  tvaAmount = computed(() => {
    const s = this.stats();
    if (!s) return 0;
    const rate = this.adminService.tvaRate();
    return s.revenue * rate / (100 + rate);
  });

  revenueWithoutTva = computed(() => {
    const s = this.stats();
    if (!s) return 0;
    return s.revenue - this.tvaAmount();
  });

  ngOnInit() {
    this.adminService.getStats().subscribe(s => this.stats.set(s));
    this.adminService.getSettings().subscribe();
  }

  startEditTva() {
    this.tvaInput = this.adminService.tvaRate();
    this.editingTva.set(true);
  }

  cancelTva() { this.editingTva.set(false); }

  saveTva() {
    if (this.tvaInput <= 0 || this.tvaInput > 100) return;
    this.savingTva.set(true);
    this.adminService.updateSettings(this.tvaInput).subscribe({
      next: () => { this.editingTva.set(false); this.savingTva.set(false); },
      error: () => this.savingTva.set(false)
    });
  }
}
