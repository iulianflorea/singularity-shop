import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { Report } from '../../../models/purchase-order.model';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type Preset = 'current-month' | 'last-month' | 'current-year' | 'custom';

@Component({
  selector: 'app-admin-reports',
  imports: [DecimalPipe, FormsModule],
  template: `
    <div class="admin-page">
      <h1 class="admin-title">Rapoarte financiare</h1>

      <div class="filter-card">
        <div class="presets">
          <button [class.active]="preset() === 'current-month'" (click)="applyPreset('current-month')">Luna curentă</button>
          <button [class.active]="preset() === 'last-month'" (click)="applyPreset('last-month')">Luna trecută</button>
          <button [class.active]="preset() === 'current-year'" (click)="applyPreset('current-year')">Anul curent</button>
          <button [class.active]="preset() === 'custom'" (click)="applyPreset('custom')">Perioadă personalizată</button>
        </div>

        @if (preset() === 'custom') {
          <div class="date-range">
            <div class="field">
              <label>De la</label>
              <input type="date" [(ngModel)]="fromDate" />
            </div>
            <div class="field">
              <label>Până la</label>
              <input type="date" [(ngModel)]="toDate" />
            </div>
          </div>
        }

        <div class="filter-actions">
          <button class="btn-primary" (click)="load()" [disabled]="loading()">
            {{ loading() ? 'Se generează...' : 'Generează raport' }}
          </button>
          @if (report()) {
            <button class="btn-pdf" (click)="exportPdf()">
              ↓ Export PDF
            </button>
          }
        </div>
      </div>

      @if (report()) {
        <div class="report-period">
          Raport: <strong>{{ report()!.from }}</strong> — <strong>{{ report()!.to }}</strong>
          &nbsp;({{ report()!.orderCount }} comenzi confirmate)
        </div>

        <div class="summary-grid">
          <div class="summary-card revenue">
            <div class="summary-label">Venituri brute (cu TVA)</div>
            <div class="summary-value">{{ report()!.grossRevenue | number:'1.2-2' }} RON</div>
            <div class="summary-note">
              Fără TVA: {{ report()!.revenueWithoutTva | number:'1.2-2' }} RON<br>
              TVA {{ report()!.tvaRate }}%: {{ report()!.tvaAmount | number:'1.2-2' }} RON
            </div>
          </div>
          <div class="summary-card fees">
            <div class="summary-label">Taxe Stripe</div>
            <div class="summary-value">– {{ report()!.stripeFees | number:'1.2-2' }} RON</div>
            <div class="summary-note">1.4% + 1 RON/tranzacție</div>
          </div>
          <div class="summary-card net-rev">
            <div class="summary-label">Venituri nete (după Stripe)</div>
            <div class="summary-value">{{ report()!.netRevenue | number:'1.2-2' }} RON</div>
          </div>
          <div class="summary-card costs">
            <div class="summary-label">Cheltuieli stoc</div>
            <div class="summary-value">– {{ report()!.purchaseCosts | number:'1.2-2' }} RON</div>
          </div>
          <div class="summary-card profit" [class.negative]="report()!.netProfit < 0">
            <div class="summary-label">Profit net</div>
            <div class="summary-value">{{ report()!.netProfit | number:'1.2-2' }} RON</div>
          </div>
        </div>

        @if (report()!.soldProducts.length > 0) {
          <h2 class="section-title">Produse vândute</h2>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Produs</th>
                  <th>Cantitate</th>
                  <th>Venituri brute</th>
                  <th>Taxe Stripe (est.)</th>
                  <th>Venituri nete (est.)</th>
                </tr>
              </thead>
              <tbody>
                @for (p of report()!.soldProducts; track p.productId) {
                  <tr>
                    <td>{{ p.productName }}</td>
                    <td>{{ p.totalQuantity }}</td>
                    <td>{{ p.grossRevenue | number:'1.2-2' }} RON</td>
                    <td>{{ productFee(p.grossRevenue, p.totalQuantity) | number:'1.2-2' }} RON</td>
                    <td>{{ (p.grossRevenue - productFee(p.grossRevenue, p.totalQuantity)) | number:'1.2-2' }} RON</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        @if (report()!.purchaseOrders.length > 0) {
          <h2 class="section-title">Comenzi stoc în perioadă</h2>
          @for (po of report()!.purchaseOrders; track po.id) {
            <div class="po-row">
              <div class="po-meta">
                <span class="po-id">#{{ po.id }}</span>
                <span class="po-date">{{ po.orderDate }}</span>
                @if (po.notes) { <span class="po-notes">{{ po.notes }}</span> }
              </div>
              <div class="po-items-inline">
                @for (item of po.items; track item.id) {
                  <span>{{ item.productName }} ×{{ item.quantity }}</span>
                }
              </div>
              <span class="po-amount">{{ po.totalAmount | number:'1.2-2' }} RON</span>
            </div>
          }
        }
      } @else if (!loading()) {
        <div class="empty-state">Selectează perioada și apasă "Generează raport"</div>
      }
    </div>
  `,
  styles: [`
    .filter-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; padding: 1.25rem; margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
    .presets { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .presets button { padding: 0.45rem 1rem; border: 1px solid var(--color-border); border-radius: 20px; background: transparent; color: var(--color-text); cursor: pointer; font-size: 0.88rem; }
    .presets button.active { background: var(--color-primary); color: white; border-color: var(--color-primary); }
    .date-range { display: flex; gap: 1rem; flex-wrap: wrap; }
    .field { display: flex; flex-direction: column; gap: 0.3rem; }
    .field label { font-size: 0.82rem; font-weight: 500; color: var(--color-text-secondary); }
    .field input { padding: 0.5rem 0.75rem; border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-bg); color: var(--color-text); font-size: 0.9rem; }
    .filter-actions { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }
    .btn-primary { padding: 0.6rem 1.4rem; background: var(--color-primary); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-pdf { padding: 0.6rem 1.4rem; background: #dc2626; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; }
    .btn-pdf:hover { opacity: 0.9; }

    .report-period { margin-bottom: 1.25rem; color: var(--color-text-secondary); font-size: 0.9rem; }

    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .summary-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; padding: 1.1rem 1.25rem; }
    .summary-card.revenue { border-color: #6366f144; }
    .summary-card.fees { border-color: #f97316aa; }
    .summary-card.net-rev { border-color: #22c55e44; }
    .summary-card.costs { border-color: #ef444444; }
    .summary-card.profit { border-color: #0ea5e9aa; }
    .summary-card.profit.negative { border-color: #ef4444; }
    .summary-label { font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 0.4rem; font-weight: 500; }
    .summary-value { font-size: 1.4rem; font-weight: 700; color: var(--color-text); }
    .summary-card.profit .summary-value { color: #0ea5e9; }
    .summary-card.profit.negative .summary-value { color: #ef4444; }
    .summary-card.fees .summary-value { color: #f97316; }
    .summary-card.costs .summary-value { color: #ef4444; }
    .summary-note { font-size: 0.72rem; color: var(--color-text-secondary); margin-top: 0.2rem; opacity: 0.7; }

    .section-title { font-size: 1rem; font-weight: 600; margin: 1.5rem 0 0.75rem; }
    .table-wrapper { overflow-x: auto; margin-bottom: 2rem; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.65rem 1rem; text-align: left; border-bottom: 1px solid var(--color-border); font-size: 0.88rem; vertical-align: middle; }
    th { color: var(--color-text-secondary); font-weight: 600; }

    .po-row { display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 8px; margin-bottom: 0.5rem; flex-wrap: wrap; }
    .po-meta { display: flex; gap: 0.75rem; align-items: center; min-width: 220px; }
    .po-id { font-weight: 700; }
    .po-date { color: var(--color-text-secondary); font-size: 0.88rem; }
    .po-notes { font-style: italic; color: var(--color-text-secondary); font-size: 0.82rem; }
    .po-items-inline { flex: 1; display: flex; flex-wrap: wrap; gap: 0.4rem; }
    .po-items-inline span { padding: 0.2rem 0.5rem; background: var(--color-bg); border: 1px solid var(--color-border); border-radius: 4px; font-size: 0.8rem; }
    .po-amount { font-weight: 700; color: #ef4444; white-space: nowrap; }

    .empty-state { text-align: center; color: var(--color-text-secondary); padding: 3rem; }
  `]
})
export class AdminReportsComponent {
  private adminService = inject(AdminService);

  report = signal<Report | null>(null);
  loading = signal(false);
  preset = signal<Preset>('current-month');
  fromDate = '';
  toDate = '';

  constructor() { this.applyPreset('current-month'); }

  applyPreset(p: Preset) {
    this.preset.set(p);
    const now = new Date();
    if (p === 'current-month') {
      this.fromDate = this.fmt(new Date(now.getFullYear(), now.getMonth(), 1));
      this.toDate = this.fmt(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    } else if (p === 'last-month') {
      this.fromDate = this.fmt(new Date(now.getFullYear(), now.getMonth() - 1, 1));
      this.toDate = this.fmt(new Date(now.getFullYear(), now.getMonth(), 0));
    } else if (p === 'current-year') {
      this.fromDate = this.fmt(new Date(now.getFullYear(), 0, 1));
      this.toDate = this.fmt(new Date(now.getFullYear(), 11, 31));
    }
  }

  load() {
    if (!this.fromDate || !this.toDate) return;
    this.loading.set(true);
    this.adminService.getReport(this.fromDate, this.toDate).subscribe({
      next: r => { this.report.set(r); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }

  productFee(grossRevenue: number, qty: number): number {
    return grossRevenue * 0.014 + qty * 1.0;
  }

  exportPdf() {
    const r = this.report();
    if (!r) return;

    const doc = new jsPDF();
    const n2 = (v: number) => v.toFixed(2);
    const pageW = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Raport Financiar', pageW / 2, 18, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Perioada: ${r.from} - ${r.to}  |  Comenzi confirmate: ${r.orderCount}`, pageW / 2, 26, { align: 'center' });
    doc.setTextColor(0);

    // Summary table
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Sumar financiar', 14, 38);

    autoTable(doc, {
      startY: 42,
      head: [['Indicator', 'Valoare (RON)']],
      body: [
        ['Venituri brute (cu TVA)', n2(r.grossRevenue)],
        [`TVA ${r.tvaRate}% inclus`, n2(r.tvaAmount)],
        ['Venituri fara TVA', n2(r.revenueWithoutTva)],
        ['Taxe Stripe (1.4% + 1 RON/tranz.)', `- ${n2(r.stripeFees)}`],
        ['Venituri nete (dupa Stripe)', n2(r.netRevenue)],
        ['Cheltuieli stoc', `- ${n2(r.purchaseCosts)}`],
        ['Profit net', n2(r.netProfit)],
      ],
      styles: { fontSize: 10 },
      headStyles: { fillColor: [79, 70, 229] },
      bodyStyles: { halign: 'right' },
      columnStyles: { 0: { halign: 'left' } },
      didParseCell: (data) => {
        if (data.section === 'body' && data.row.index === 6) {
          const color: [number, number, number] = r.netProfit >= 0 ? [22, 163, 74] : [220, 38, 38];
          data.cell.styles.textColor = color;
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    // Sold products
    if (r.soldProducts.length > 0) {
      const afterSummary = (doc as any).lastAutoTable.finalY + 10;
      doc.setFont('helvetica', 'bold');
      doc.text('Produse vandute', 14, afterSummary);

      autoTable(doc, {
        startY: afterSummary + 4,
        head: [['Produs', 'Cantitate', 'Venituri brute (RON)', 'Taxe Stripe (RON)', 'Venituri nete (RON)']],
        body: r.soldProducts.map(p => {
          const fee = this.productFee(p.grossRevenue, p.totalQuantity);
          return [p.productName, String(p.totalQuantity), n2(p.grossRevenue), n2(fee), n2(p.grossRevenue - fee)];
        }),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [79, 70, 229] },
        columnStyles: { 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } },
      });
    }

    // Purchase orders
    if (r.purchaseOrders.length > 0) {
      const afterProducts = (doc as any).lastAutoTable.finalY + 10;
      doc.setFont('helvetica', 'bold');
      doc.text('Comenzi stoc', 14, afterProducts);

      const poRows: string[][] = [];
      r.purchaseOrders.forEach(po => {
        po.items.forEach((item, idx) => {
          poRows.push([
            idx === 0 ? `#${po.id} — ${po.orderDate}${po.notes ? ' (' + po.notes + ')' : ''}` : '',
            item.productName,
            String(item.quantity),
            n2(item.unitPurchasePrice),
            n2(item.lineTotal),
            idx === 0 ? n2(po.totalAmount) : '',
          ]);
        });
      });

      autoTable(doc, {
        startY: afterProducts + 4,
        head: [['Comandă', 'Produs', 'Cant.', 'Pret/buc (RON)', 'Total linie (RON)', 'Total cmd (RON)']],
        body: poRows,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [220, 38, 38] },
        columnStyles: { 2: { halign: 'center' }, 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right', fontStyle: 'bold' } },
      });
    }

    // Footer
    const totalPages = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Pagina ${i} din ${totalPages}  |  Generat: ${new Date().toLocaleString('ro-RO')}`, pageW / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' });
    }

    doc.save(`raport-${r.from}_${r.to}.pdf`);
  }

  private fmt(d: Date): string {
    return d.toISOString().slice(0, 10);
  }
}
