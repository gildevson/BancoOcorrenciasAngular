export interface Noticia {
  id?: string;
  titulo: string;
  slug: string;
  resumo: string;
  conteudo: string;
  publicado?: boolean;
  data_publicacao?: string;
}
