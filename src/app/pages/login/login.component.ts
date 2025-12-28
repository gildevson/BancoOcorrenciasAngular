import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../Service/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthService);
  private destroy$ = new Subject<void>();

  loading = signal(false);
  errorMsg = signal<string | null>(null);
  showPassword = signal(false);

  private readonly REDIRECT_DELAY = 800;

  form = this.fb.group({
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    senha: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(4)]),
    lembrar: this.fb.nonNullable.control(true),
  });

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  hasError(field: 'email' | 'senha'): boolean {
    const c = this.form.get(field);
    return !!(c && c.touched && c.invalid);
  }

  submit(): void {
    this.errorMsg.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, senha, lembrar } = this.form.getRawValue();

    this.loading.set(true);

    this.auth.login({ email, senha }, lembrar)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loading.set(false);
          setTimeout(() => this.close(), this.REDIRECT_DELAY);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMsg.set(this.auth.getErrorMessage(err));
        }
      });
  }

  close(): void {
    // seu modal outlet
    this.router.navigate([{ outlets: { modal: null } }]);
  }

  goForgot(): void {
    this.router.navigate(['/recuperar-senha']);
  }

  loginWithGoogle(): void {
    alert('Login com Google ainda não implementado.');
  }
}
