import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { StripeService } from '../../services/stripe.service';
import { ToastService } from '../../services/toast.service';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  cart = inject(CartService);
  private orderService = inject(OrderService);
  private auth = inject(AuthService);
  private stripeService = inject(StripeService);
  private toast = inject(ToastService);

  processing = signal(false);
  errorMsg = signal('');
  cartTotal = signal(0);

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    address: ['', Validators.required],
    city: ['', Validators.required],
    zip: ['', Validators.required],
  });

  ngOnInit(): void {
    if (this.cart.items().length === 0) {
      this.router.navigate(['/cart']);
      return;
    }

    const customer = this.auth.currentCustomer();
    if (customer) {
      this.form.patchValue({ name: customer.name, email: customer.email, address: customer.address });
    }

    this.cart.calculate().subscribe(s => this.cartTotal.set(s.total));

    setTimeout(() => this.stripeService.mountCard('#card-element'), 200);
  }

  ngOnDestroy(): void {
    this.stripeService.destroyCard();
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const customer = this.auth.currentCustomer();
    if (!customer) return;

    this.processing.set(true);
    this.errorMsg.set('');

    const shippingAddress = `${this.form.value.address}, ${this.form.value.city}, ${this.form.value.zip}`;
    const items = this.cart.items().map(i => ({ productId: i.productId, quantity: i.quantity }));

    this.orderService.createOrder({
      customerId: customer.id,
      items,
      shippingAddress
    }).subscribe({
      next: async orderResp => {
        try {
          const result = await this.stripeService.confirmPayment(orderResp.clientSecret);
          if (result.error) {
            this.errorMsg.set(result.error.message || 'Plata a eșuat');
            this.processing.set(false);
            return;
          }

          this.orderService.confirmOrder(orderResp.orderId).subscribe({
            next: () => {
              this.cart.clear();
              this.router.navigate(['/order-confirmation', orderResp.orderId]);
            },
            error: () => {
              this.toast.error('Eroare la confirmarea comenzii');
              this.processing.set(false);
            }
          });
        } catch (e) {
          this.errorMsg.set('Eroare neașteptată la plată');
          this.processing.set(false);
        }
      },
      error: () => {
        this.errorMsg.set('Eroare la crearea comenzii');
        this.processing.set(false);
      }
    });
  }

  field(name: string) {
    return this.form.get(name);
  }
}
