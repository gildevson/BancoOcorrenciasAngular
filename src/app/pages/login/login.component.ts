import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth.service'; // Ajuste o caminho conforme necessário

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  errorMsg = signal<string | null>(null);
  showPassword = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(4)]],
    lembrar: [false]
  });

  hasError(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMsg.set(null);

    const { email, senha, lembrar } = this.form.value;

    this.auth.login(
      { email: email!, senha: senha! },
      lembrar ?? false
    ).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/']); // ou redirecione para onde preferir
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(this.auth.getErrorMessage(err));
      }
    });
  }

  loginWithGoogle(): void {
    // Implementar login com Google
    console.log('Login com Google');
  }

  goForgot(): void {
    // Implementar "Esqueci minha senha"
    console.log('Esqueci minha senha');
  }

  close(): void {
    this.router.navigate([{ outlets: { modal: null } }]);
  }
}
