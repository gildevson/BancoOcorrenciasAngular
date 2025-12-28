import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export type LoginPayload = { email: string; senha: string };
export type LoginResponse = { token: string };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  // ✅ base da API (sem /login no final)
  private readonly baseUrl = 'https://localhost:7041/api/auth';

  login(payload: LoginPayload, lembrar: boolean): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/login`, payload)
      .pipe(
        tap((res) => {
          if (res?.token) this.saveToken(res.token, lembrar);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
  }

  getToken(): string | null {
    return localStorage.getItem('token') ?? sessionStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private saveToken(token: string, lembrar: boolean): void {
    if (lembrar) localStorage.setItem('token', token);
    else sessionStorage.setItem('token', token);
  }

  getErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 401) return 'E-mail ou senha incorretos.';
      if (err.status === 403) return 'Acesso negado.';
      if (err.status === 404) return 'Serviço não encontrado (rota/API).';
      if (err.status === 0) return 'Erro de conexão. Verifique se a API está rodando.';
      if (typeof (err.error as any)?.message === 'string') return (err.error as any).message;
      return 'Falha ao autenticar. Tente novamente.';
    }
    return 'Erro inesperado.';
  }
}
