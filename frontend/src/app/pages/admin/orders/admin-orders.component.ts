import { DecimalPipe, SlicePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-orders',
  imports: [DecimalPipe, SlicePipe],
  template: `
    <div class="admin-page">
      <h1 class="admin-title">Comenzi</h1>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Client</th>
              <th>Total</th>
              <th>Status</th>
              <th>Adresă livrare</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            @for (o of orders(); track o.id) {
              <tr>
                <td>#{{ o.id }}</td>
                <td>
                  @if (o.guestName) {
                    <span>{{ o.guestName }}<br><small>{{ o.guestEmail }}</small></span>
                  } @else {
                    <span>Client #{{ o.customerId }}</span>
                  }
                </td>
                <td>{{ o.totalAmount | number:'1.2-2' }} {{ o.currency }}</td>
                <td><span [class]="'badge ' + o.status.toLowerCase()">{{ o.status }}</span></td>
                <td>{{ o.shippingAddress }}</td>
                <td>{{ o.createdAt | slice:0:10 }}</td>
              </tr>
            }
            @empty {
              <tr><td colspan="6" style="text-align:center;color:var(--color-text-secondary);padding:2rem">Nicio comandă</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .table-wrapper { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid var(--color-border); font-size: 0.9rem; }
    th { color: var(--color-text-secondary); font-weight: 600; }
    small { color: var(--color-text-secondary); font-size: 0.8rem; }
    .badge { padding: 0.25rem 0.6rem; border-radius: 20px; font-size: 0.8rem; font-weight: 500; }
    .badge.pending { background: #fef9c3; color: #854d0e; }
    .badge.confirmed { background: #d1fae5; color: #065f46; }
    .badge.cancelled { background: #fee2e2; color: #991b1b; }
  `]
})
export class AdminOrdersComponent implements OnInit {
  private adminService = inject(AdminService);
  orders = signal<any[]>([]);

  ngOnInit() { this.adminService.getAllOrders().subscribe(o => this.orders.set(o)); }
}
