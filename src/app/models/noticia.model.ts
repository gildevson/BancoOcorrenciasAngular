export interface Noticia {
  id: string;
  titulo: string;
  slug: string;
  resumo: string;
  conteudo: string;
  imagemCapa: string | null;
  categoria: string | null;
  status: string | null;
  dataPublicacao: string | null;
  createdAt: string;
  updatedAt: string | null;
  publicado: boolean;
  autorId: string | null;
  autorNome: string | null;
  visualizacoes: number;
  destaque: boolean;
  metaDescription: string | null;
  ordemDestaque: number | null;
}
