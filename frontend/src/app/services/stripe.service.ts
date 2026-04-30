import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

declare var Stripe: any;

@Injectable({ providedIn: 'root' })
export class StripeService {
  private stripe: any;
  private elements: any;
  private cardElement: any;

  init(): void {
    this.stripe = Stripe(environment.stripePublishableKey);
  }

  mountCard(selector: string): void {
    if (!this.stripe) this.init();
    this.elements = this.stripe.elements();
    this.cardElement = this.elements.create('card', {
      style: {
        base: {
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
          fontSize: '16px',
          color: '#1d1d1f',
          '::placeholder': { color: '#6e6e73' }
        },
        invalid: { color: '#ff3b30' }
      }
    });
    this.cardElement.mount(selector);
  }

  async confirmPayment(clientSecret: string): Promise<{ error?: any; paymentIntent?: any }> {
    if (!this.stripe || !this.cardElement) throw new Error('Stripe not initialized');
    return this.stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: this.cardElement }
    });
  }

  destroyCard(): void {
    if (this.cardElement) {
      this.cardElement.destroy();
      this.cardElement = null;
    }
  }
}
