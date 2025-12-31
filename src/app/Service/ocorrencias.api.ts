// src/app/service/ocorrencias.api.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ============= INTERFACES =============
export interface ApiBanco {
  id: string;
  numero_banco: string;  // ✅ snake_case (como a API retorna)
  nome: string;
}

export interface ApiOcorrenciaMotivo {
  id: string;
  bancoId: string;
  ocorrencia: string;
  motivo: string;
  descricao: string;
  observacao?: string | null;
}

export interface CreateOcorrenciaMotivoRequest {
  bancoId: string;
  ocorrencia: string;
  motivo: string;
  descricao: string;
  observacao?: string | null;
}

export interface UpdateOcorrenciaMotivoRequest {
  descricao: string;
  observacao?: string | null;
}

// ============= SERVIÇO =============
@Injectable({ providedIn: 'root' })
export class OcorrenciasApi {
  private readonly API = 'https://localhost:7041/api';

  constructor(private http: HttpClient) {}

  // ========== BANCOS ==========
  getBancos(): Observable<ApiBanco[]> {
    return this.http.get<ApiBanco[]>(`${this.API}/bancos`);
  }

  // ========== MOTIVOS ==========
  getMotivos(bancoId: string, ocorrencia: string): Observable<ApiOcorrenciaMotivo[]> {
    return this.http.get<ApiOcorrenciaMotivo[]>(
      `${this.API}/bancos/${bancoId}/ocorrencias/${ocorrencia}/motivos`
    );
  }

  getDetalhe(bancoId: string, ocorrencia: string, motivo: string): Observable<ApiOcorrenciaMotivo> {
    return this.http.get<ApiOcorrenciaMotivo>(
      `${this.API}/bancos/${bancoId}/ocorrencias/${ocorrencia}/motivos/${motivo}`
    );
  }

  criarMotivo(body: CreateOcorrenciaMotivoRequest): Observable<ApiOcorrenciaMotivo> {
    return this.http.post<ApiOcorrenciaMotivo>(
      `${this.API}/bancos/ocorrencias/motivos`,
      body
    );
  }

  atualizarMotivo(
    bancoId: string,
    ocorrencia: string,
    motivo: string,
    body: UpdateOcorrenciaMotivoRequest
  ): Observable<void> {
    return this.http.put<void>(
      `${this.API}/bancos/${bancoId}/ocorrencias/${ocorrencia}/motivos/${motivo}`,
      body
    );
  }
}
