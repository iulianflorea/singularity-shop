import { Component, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService, AdminStats } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, DecimalPipe],
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
            <div class="stat-label">Venituri confirmate</div>
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

      <div class="quick-links">
        <a routerLink="/admin/products" class="quick-link">Gestionează produse</a>
        <a routerLink="/admin/discounts" class="quick-link">Gestionează discounturi</a>
        <a routerLink="/admin/orders" class="quick-link">Vezi comenzile</a>
      </div>
    </div>
  `,
  styles: [`
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .stat-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; padding: 1.5rem; text-align: center; }
    .stat-value { font-size: 2rem; font-weight: 700; color: var(--color-primary); }
    .stat-label { color: var(--color-text-secondary); margin-top: 0.25rem; font-size: 0.9rem; }
    .quick-links { display: flex; gap: 1rem; flex-wrap: wrap; }
    .quick-link { padding: 0.75rem 1.5rem; background: var(--color-primary); color: white; border-radius: 8px; text-decoration: none; font-weight: 500; }
    .quick-link:hover { opacity: 0.9; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  stats = signal<AdminStats | null>(null);

  ngOnInit() {
    this.adminService.getStats().subscribe(s => this.stats.set(s));
  }
}
