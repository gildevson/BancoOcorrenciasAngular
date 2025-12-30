import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot.password.component.html',
  styleUrls: ['./forgot.password.component.css']
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  successMsg = signal<string | null>(null);
  errorMsg = signal<string | null>(null);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  hasError(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMsg.set(null);
    this.successMsg.set(null);

    const { email } = this.form.value;

    this.auth.forgotPassword(email!).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.successMsg.set(response.message);
        this.form.reset();
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(this.auth.getErrorMessage(err));
      }
    });
  }

  goToLogin(): void {
    // ✅ Volta para o modal de login
    this.router.navigate([{ outlets: { modal: 'login' } }]);
  }

  close(): void {
    // ✅ Fecha o modal
    this.router.navigate([{ outlets: { modal: null } }]);
  }
}
