import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OcorrenciaMotivo {
  id?: string;
  bancoId: string;
  ocorrencia: string; // "02"
  motivo: string;    // "00"
  descricao: string;
  observacao?: string;
}

@Injectable({ providedIn: 'root' })
export class OcorrenciasMotivosService {
  private readonly API = 'https://localhost:7041/api';

  constructor(private http: HttpClient) {}

  getDetalhe(bancoId: string, ocorrencia: string, motivo: string): Observable<OcorrenciaMotivo> {
    return this.http.get<OcorrenciaMotivo>(
      `${this.API}/bancos/${bancoId}/ocorrencias/${ocorrencia}/motivos/${motivo}`
    );
  }

  criar(payload: OcorrenciaMotivo): Observable<any> {
    return this.http.post(`${this.API}/ocorrencias-motivos`, payload);
  }

  atualizar(bancoId: string, ocorrencia: string, motivo: string, payload: Partial<OcorrenciaMotivo>): Observable<any> {
    return this.http.put(
      `${this.API}/bancos/${bancoId}/ocorrencias/${ocorrencia}/motivos/${motivo}`,
      payload
    );
  }
}
