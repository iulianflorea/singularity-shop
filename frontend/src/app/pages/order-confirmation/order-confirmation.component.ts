import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-order-confirmation',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './order-confirmation.component.html',
  styleUrl: './order-confirmation.component.scss'
})
export class OrderConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  ts = inject(TranslationService);

  order = signal<Order | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.orderService.getOrder(id).subscribe({
      next: o => {
        this.order.set(o);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
