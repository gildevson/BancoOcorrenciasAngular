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
