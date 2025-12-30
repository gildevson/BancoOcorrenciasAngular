import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './resetpassword.component.html',
  styleUrls: ['./resetpassword.component.css']
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = signal(false);
  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);
  token = signal<string | null>(null);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  form = this.fb.group({
    novaSenha: ['', [Validators.required, Validators.minLength(6)]],
    confirmarSenha: ['', [Validators.required]]
  }, {
    validators: this.passwordMatchValidator
  });

  ngOnInit(): void {
    // Pegar o token da URL (?token=...)
    this.token.set(this.route.snapshot.queryParamMap.get('token'));

    if (!this.token()) {
      this.errorMsg.set('Token não encontrado na URL.');
    }
  }

  passwordMatchValidator(group: any) {
    const senha = group.get('novaSenha')?.value;
    const confirmar = group.get('confirmarSenha')?.value;
    return senha === confirmar ? null : { passwordMismatch: true };
  }

  hasError(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  hasPasswordMismatch(): boolean {
    return this.form.hasError('passwordMismatch') && this.form.get('confirmarSenha')?.touched || false;
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update(v => !v);
  }

  submit(): void {
    if (this.form.invalid || !this.token()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMsg.set(null);
    this.successMsg.set(null);

    const { novaSenha } = this.form.value;

    this.auth.resetPassword(this.token()!, novaSenha!).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.successMsg.set(response.message);

        // Redirecionar para login após 2 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(this.auth.getErrorMessage(err));
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
