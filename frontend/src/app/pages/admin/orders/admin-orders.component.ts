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
              <th>Produse</th>
              <th>Total</th>
              <th>Net (după Stripe)</th>
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
                    <span>{{ o.customerName || ('Client #' + o.customerId) }}<br><small>{{ o.customerEmail }}</small></span>
                  }
                </td>
                <td>
                  <ul class="items-list">
                    @for (item of o.items; track item.id) {
                      <li>
                        <span class="item-qty">×{{ item.quantity }}</span>
                        <span class="item-name">{{ item.productName }}</span>
                        @if (item.productCode) {
                          <span class="item-code">{{ item.productCode }}</span>
                        }
                      </li>
                    }
                  </ul>
                </td>
                <td>{{ o.totalAmount | number:'1.2-2' }} {{ o.currency }}</td>
                <td>
                  <span class="net-amount">{{ netAmount(o.totalAmount) | number:'1.2-2' }} {{ o.currency }}</span>
                  <br><small class="fee-detail">– {{ stripeFee(o.totalAmount) | number:'1.2-2' }} taxă</small>
                </td>
                <td><span [class]="'badge ' + o.status.toLowerCase()">{{ o.status }}</span></td>
                <td>{{ o.shippingAddress }}</td>
                <td>{{ o.createdAt | slice:0:10 }}</td>
              </tr>
            }
            @empty {
              <tr><td colspan="8" style="text-align:center;color:var(--color-text-secondary);padding:2rem">Nicio comandă</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .table-wrapper { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid var(--color-border); font-size: 0.9rem; vertical-align: middle; }
    th { color: var(--color-text-secondary); font-weight: 600; }
    small { color: var(--color-text-secondary); font-size: 0.8rem; }
    .items-list { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 0.3rem; }
    .items-list li { display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; }
    .item-qty { background: var(--color-border); border-radius: 4px; padding: 0.1rem 0.35rem; font-size: 0.75rem; font-weight: 600; white-space: nowrap; }
    .item-name { color: var(--color-text); }
    .item-code { color: var(--color-text-secondary); font-size: 0.75rem; background: var(--color-bg); border: 1px solid var(--color-border); border-radius: 4px; padding: 0.1rem 0.3rem; white-space: nowrap; }
    .net-amount { font-weight: 600; color: var(--color-primary); }
    .fee-detail { color: #ef4444; font-size: 0.75rem; }
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

  stripeFee(amount: number): number {
    return amount * 0.014 + 1.0;
  }

  netAmount(amount: number): number {
    return amount - this.stripeFee(amount);
  }
}
