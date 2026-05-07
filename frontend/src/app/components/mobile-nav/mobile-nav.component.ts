import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-mobile-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './mobile-nav.component.html',
  styleUrl: './mobile-nav.component.scss'
})
export class MobileNavComponent {
  cart = inject(CartService);
  auth = inject(AuthService);
  ts = inject(TranslationService);
}
