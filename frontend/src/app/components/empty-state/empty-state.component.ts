import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  imports: [RouterLink],
  template: `
    <div class="empty-state">
      <div class="empty-icon">{{ icon }}</div>
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      @if (actionLabel && actionLink) {
        <a [routerLink]="actionLink" class="btn-primary">{{ actionLabel }}</a>
      }
    </div>
  `,
  styles: [`
    .empty-state {
      text-align: center;
      padding: 80px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    .empty-icon {
      font-size: 64px;
      line-height: 1;
    }
    h3 {
      font-size: 24px;
      font-weight: 600;
      color: var(--color-text-primary);
    }
    p {
      font-size: 16px;
      color: var(--color-text-secondary);
      max-width: 360px;
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon = '📦';
  @Input() title = 'Nimic de afișat';
  @Input() message = '';
  @Input() actionLabel = '';
  @Input() actionLink = '';
}
