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

// ✅ Adicione isso no seu arquivo auth.models.ts existente

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  novaSenha: string;
}

export interface ResetPasswordResponse {
  message: string;
}
