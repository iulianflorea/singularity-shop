import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  template: `
    <div class="skeleton-grid">
      @for (i of items; track i) {
        <div class="skeleton-card">
          <div class="skeleton skeleton-img"></div>
          <div class="skeleton-info">
            <div class="skeleton skeleton-line short"></div>
            <div class="skeleton skeleton-line"></div>
            <div class="skeleton skeleton-line medium"></div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 24px;
    }
    .skeleton-card {
      border-radius: 16px;
      overflow: hidden;
      background: var(--color-bg-secondary);
    }
    .skeleton-img {
      aspect-ratio: 1;
      width: 100%;
    }
    .skeleton-info {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .skeleton-line {
      height: 14px;
      width: 100%;
      &.short { width: 40%; height: 12px; }
      &.medium { width: 60%; }
    }
  `]
})
export class SkeletonComponent {
  @Input() count = 8;
  get items() { return Array(this.count).fill(0); }
}
