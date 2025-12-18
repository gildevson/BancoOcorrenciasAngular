export type Noticia = {
  slug: string;
  categoria: string;
  titulo: string;
  resumo: string;
  conteudo: string;
  data: string;     // ex: "17 DEZ"
  leituraMin: number;
  imagemUrl: string;
};

export const NOTICIAS: Noticia[] = [
  {
    slug: 'novo-padrao-validacao-por-banco',
    categoria: 'CRIPTOATIVOS',
    titulo: 'Novo padrão de validação por banco',
    resumo: 'Melhorias no fluxo de validação e organização dos retornos.',
    conteudo: `
      <p>Este é o conteúdo completo da notícia. Aqui você pode colocar parágrafos, listas e informações.</p>
      <p>Mais detalhes: regras por banco, melhorias de filtros e organização do portal.</p>
    `,
    data: '17 DEZ',
    leituraMin: 3,
    imagemUrl: 'https://images.unsplash.com/photo-1569025690938-a00729c9e1f9?auto=format&fit=crop&w=1400&q=60',
  },
  {
    slug: 'como-consultar-ocorrencias-com-filtros',
    categoria: 'DERIVATIVOS',
    titulo: 'Como consultar ocorrências com filtros',
    resumo: 'Dicas para encontrar rapidamente ocorrências e motivos relacionados.',
    conteudo: `
      <p>Aqui entra um guia passo a passo da consulta e exemplos de filtros.</p>
      <p>Você pode explicar como pesquisar por banco, código e descrição.</p>
    `,
    data: '17 DEZ',
    leituraMin: 3,
    imagemUrl: 'https://images.unsplash.com/photo-1559526324-593bc073d938?auto=format&fit=crop&w=1400&q=60',
  },
  {
    slug: 'o-que-sao-stablecoins',
    categoria: 'CRIPTOATIVOS',
    titulo: 'O que são stablecoins e por que elas são uma tendência no mercado?',
    resumo: 'Stablecoins têm seu valor atrelado a uma moeda fiduciária, como dólar ou real.',
    conteudo: `
      <p>Conteúdo completo sobre stablecoins (exemplo).</p>
      <p>Explique conceitos, riscos e utilidade.</p>
    `,
    data: '17 DEZ',
    leituraMin: 4,
    imagemUrl: 'https://images.unsplash.com/photo-1621504450181-5d356f61d307?auto=format&fit=crop&w=1400&q=60',
  },
];
