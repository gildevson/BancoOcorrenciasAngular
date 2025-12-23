import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApiOcorrenciaMotivo {
  id: string;
  bancoId: string;
  ocorrencia: string;   // "02"
  motivo: string;       // "00"
  descricao: string;
  observacao: string;
}

@Injectable({ providedIn: 'root' })
export class OcorrenciasApi {
  private readonly baseUrl = 'https://localhost:7041/api';

  constructor(private http: HttpClient) {}

  getDetalhe(bancoId: string, ocorrencia: string, motivo: string): Observable<ApiOcorrenciaMotivo> {
    const bId = encodeURIComponent(bancoId);
    const oc = encodeURIComponent(ocorrencia);
    const mv = encodeURIComponent(motivo);

    return this.http.get<ApiOcorrenciaMotivo>(
      `${this.baseUrl}/bancos/${bId}/ocorrencias/${oc}/motivos/${mv}`
    );
  }

  getMotivos(bancoId: string, ocorrencia: string): Observable<ApiOcorrenciaMotivo[]> {
    const bId = encodeURIComponent(bancoId);
    const oc = encodeURIComponent(ocorrencia);

    return this.http.get<ApiOcorrenciaMotivo[]>(
      `${this.baseUrl}/bancos/${bId}/ocorrencias/${oc}/motivos`
    );
  }
}
