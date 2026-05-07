import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { ToastComponent } from './components/toast/toast.component';
import { MobileNavComponent } from './components/mobile-nav/mobile-nav.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastComponent, MobileNavComponent],
  template: `
    <app-navbar />
    <main class="page-wrapper">
      <router-outlet />
    </main>
    <app-footer />
    <app-mobile-nav />
    <app-toast />
  `,
  styleUrl: './app.scss'
})
export class App {}
