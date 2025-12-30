import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';

export type Role = 'ADMIN' | 'PORTAL' | 'SUPERVISOR';

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginUser {
  id: string;
  nome: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  user: LoginUser;
  roles: Role[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private readonly API_BASE = 'https://localhost:7041/api';

  private tokenSig = signal<string | null>(this.readToken());
  private userSig = signal<LoginUser | null>(this.readUser());
  private rolesSig = signal<Role[]>(this.readRoles());

  token = computed(() => this.tokenSig());
  user = computed(() => this.userSig());
  roles = computed(() => this.rolesSig());
  isLoggedIn = computed(() => !!this.tokenSig());

  login(req: LoginRequest, lembrar: boolean): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_BASE}/auth/login`, req).pipe(
      tap(res => this.persistSession(res, lembrar)),
      catchError(err => throwError(() => err))
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_roles');

    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_roles');

    this.tokenSig.set(null);
    this.userSig.set(null);
    this.rolesSig.set([]);
  }

  hasRole(role: Role): boolean {
    return this.rolesSig().includes(role);
  }

  getToken(): string | null {
    return this.tokenSig();
  }

  getErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) return 'Não foi possível conectar na API (HTTPS/CORS).';
      if (err.status === 401) return 'E-mail ou senha inválidos.';
      if (typeof err.error === 'string') return err.error;
      if (err.error?.message) return err.error.message;
      return `Erro ${err.status}`;
    }
    return 'Erro inesperado.';
  }

  private persistSession(res: LoginResponse, lembrar: boolean) {
    const storage = lembrar ? localStorage : sessionStorage;

    storage.setItem('auth_token', res.token);
    storage.setItem('auth_user', JSON.stringify(res.user));
    storage.setItem('auth_roles', JSON.stringify(res.roles ?? []));

    const other = lembrar ? sessionStorage : localStorage;
    other.removeItem('auth_token');
    other.removeItem('auth_user');
    other.removeItem('auth_roles');

    this.tokenSig.set(res.token);
    this.userSig.set(res.user);
    this.rolesSig.set(res.roles ?? []);
  }

  private readToken(): string | null {
    return localStorage.getItem('auth_token') ?? sessionStorage.getItem('auth_token');
  }

  private readUser(): LoginUser | null {
    const raw = localStorage.getItem('auth_user') ?? sessionStorage.getItem('auth_user');
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  private readRoles(): Role[] {
    const raw = localStorage.getItem('auth_roles') ?? sessionStorage.getItem('auth_roles');
    if (!raw) return [];
    try { return JSON.parse(raw); } catch { return []; }
  }
}
