import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  ts = inject(TranslationService);

  loading = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);

    this.auth.login(this.form.value as any).subscribe({
      next: () => {
        this.toast.success(this.ts.t('auth.welcomeBack'));
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.toast.error(err.error?.message || this.ts.t('auth.loginFailed'));
        this.loading.set(false);
      }
    });
  }

  field(name: string) { return this.form.get(name); }
}
