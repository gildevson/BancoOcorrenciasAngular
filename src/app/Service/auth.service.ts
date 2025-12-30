import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, throwError } from 'rxjs';
import { LoginRequest, LoginResponse, LoginUser, Role } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY  = 'auth_user';
  private readonly ROLES_KEY = 'auth_roles';

  // ajuste sua URL base
 private readonly API = 'https://localhost:7041/api';


  private userSubject = new BehaviorSubject<LoginUser | null>(this.loadUser());
  user$ = this.userSubject.asObservable();

  private rolesSubject = new BehaviorSubject<Role[]>(this.loadRoles());
  roles$ = this.rolesSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(payload: LoginRequest, lembrar: boolean): Observable<LoginResponse> {
    // se você usa outro endpoint, ajuste aqui
    return this.http.post<LoginResponse>(`${this.API}/auth/login`, payload).pipe(
      tap((res) => {
        this.persistSession(res, lembrar);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.ROLES_KEY);

    this.userSubject.next(null);
    this.rolesSubject.next([]);
  }

  // ✅ resolve seu erro do interceptor
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // útil pra telas/guards
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // (opcional) checagem de papel
  hasRole(role: Role): boolean {
    return this.rolesSubject.value.includes(role);
  }

  // (opcional) mensagem de erro amigável
  getErrorMessage(err: any): string {
    const msg =
      err?.error?.message ||
      err?.error?.erro ||
      err?.message ||
      'Falha ao autenticar. Verifique e-mail e senha.';
    return msg;
  }

  private persistSession(res: LoginResponse, lembrar: boolean): void {
    // ✅ neste exemplo, sempre usa localStorage (pra não complicar)
    // se quiser sessionStorage quando lembrar=false, eu te passo também
    localStorage.setItem(this.TOKEN_KEY, res.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
    localStorage.setItem(this.ROLES_KEY, JSON.stringify(res.roles ?? []));

    this.userSubject.next(res.user);
    this.rolesSubject.next(res.roles ?? []);
  }

  private loadUser(): LoginUser | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as LoginUser; } catch { return null; }
  }

  private loadRoles(): Role[] {
    const raw = localStorage.getItem(this.ROLES_KEY);
    if (!raw) return [];
    try { return JSON.parse(raw) as Role[]; } catch { return []; }
  }
}
