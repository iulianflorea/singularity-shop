import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="admin-layout">
      <aside class="sidebar">
        <div class="sidebar-brand">Admin Panel</div>
        <nav>
          <a routerLink="/admin/dashboard" routerLinkActive="active">Dashboard</a>
          <a routerLink="/admin/products" routerLinkActive="active">Produse</a>
          <a routerLink="/admin/discounts" routerLinkActive="active">Discounturi</a>
          <a routerLink="/admin/orders" routerLinkActive="active">Comenzi</a>
          <a routerLink="/admin/stock-orders" routerLinkActive="active">Comenzi stoc</a>
          <a routerLink="/admin/reports" routerLinkActive="active">Rapoarte</a>
        </nav>
        <a routerLink="/home" class="back-link">← Înapoi la magazin</a>
      </aside>
      <main class="admin-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .admin-layout { display: flex; min-height: calc(100vh - var(--navbar-height)); }
    .sidebar { width: 220px; background: var(--color-surface); border-right: 1px solid var(--color-border); display: flex; flex-direction: column; padding: 1.5rem 1rem; flex-shrink: 0; position: sticky; top: var(--navbar-height); height: calc(100vh - var(--navbar-height)); }
    .sidebar-brand { font-weight: 700; font-size: 1.1rem; padding: 0.5rem 0.75rem; margin-bottom: 1.5rem; color: var(--color-primary); }
    nav { display: flex; flex-direction: column; gap: 0.25rem; flex: 1; }
    nav a { padding: 0.6rem 0.75rem; border-radius: 8px; text-decoration: none; color: var(--color-text); font-size: 0.95rem; transition: background 0.15s; }
    nav a:hover { background: var(--color-border); }
    nav a.active { background: var(--color-primary); color: white; }
    .back-link { padding: 0.6rem 0.75rem; border-radius: 8px; text-decoration: none; color: var(--color-text-secondary); font-size: 0.85rem; }
    .back-link:hover { color: var(--color-text); }
    .admin-content { flex: 1; padding: 2rem; overflow-y: auto; }
  `]
})
export class AdminLayoutComponent {}
