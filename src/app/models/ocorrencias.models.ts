// src/app/models/ocorrencias.models.ts
export interface ApiBanco {
  id: string;
  numeroBanco: string;
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
  descricao?: string | null;
  observacao?: string | null;
}
