/**
 * Dados dos layouts de bancos brasileiros
 * Arquivo: src/app/data/layouts.data.ts
 */

// ================================
// TIPOS E INTERFACES
// ================================

/**
 * Status possíveis de um layout
 */
export type StatusLayout = 'Ativo' | 'Em revisão' | 'Descontinuado';

/**
 * Tipos de layout disponíveis
 */
export type TipoLayout = 'CNAB240' | 'CNAB400' | 'Febraban' | 'Outro';

/**
 * Interface representando um layout de banco
 */
export interface BancoLayout {
  /** Código do banco (ex: "001", "237", "341") */
  bancoNumero: string;

  /** Nome completo do banco */
  bancoNome: string;

  /** Tipo do layout */
  tipoLayout: TipoLayout;

  /** Versão do layout (opcional) */
  versao?: string;

  /** Status atual do layout */
  status?: StatusLayout;

  /** Descrição do layout (opcional) */
  descricao?: string;

  /** Data da última atualização (formato DD/MM/YYYY) */
  atualizadoEm?: string;

  /** URL para documentação oficial (opcional) */
  documentacaoUrl?: string;

  /** Observações adicionais (opcional) */
  observacoes?: string;
}

// ================================
// DADOS DOS LAYOUTS
// ================================

export const LAYOUTS_BANCO: BancoLayout[] = [
  // Banco do Brasil
  {
    bancoNumero: '001',
    bancoNome: 'Banco do Brasil',
    tipoLayout: 'CNAB240',
    versao: '10.7',
    status: 'Ativo',
    descricao: 'Layout padrão CNAB240 para remessa e retorno de cobrança registrada. Inclui suporte a PIX e boletos com QR Code.',
    atualizadoEm: '15/11/2024',
    documentacaoUrl: 'https://www.bb.com.br/docs/pub/emp/mpe/dwn/Doc5175Bloqueto.pdf',
  },
  {
    bancoNumero: '001',
    bancoNome: 'Banco do Brasil',
    tipoLayout: 'CNAB400',
    versao: '9.3',
    status: 'Ativo',
    descricao: 'Layout CNAB400 legado para cobrança simples. Recomenda-se migração para CNAB240.',
    atualizadoEm: '10/08/2024',
  },

  // Santander
  {
    bancoNumero: '033',
    bancoNome: 'Banco Santander',
    tipoLayout: 'CNAB240',
    versao: '08.2',
    status: 'Ativo',
    descricao: 'Arquivo de remessa CNAB240 para cobrança simples, caucionada e descontada. Compatível com cobrança híbrida.',
    atualizadoEm: '02/12/2024',
    documentacaoUrl: 'https://www.santander.com.br/document/layout-cnab240.pdf',
  },
  {
    bancoNumero: '033',
    bancoNome: 'Banco Santander',
    tipoLayout: 'CNAB400',
    versao: '07.5',
    status: 'Ativo',
    descricao: 'Layout CNAB400 para cobrança escritural. Suporta boletos com e sem registro.',
    atualizadoEm: '18/09/2024',
  },

  // Caixa Econômica Federal
  {
    bancoNumero: '104',
    bancoNome: 'Caixa Econômica Federal',
    tipoLayout: 'CNAB240',
    versao: '05.0',
    status: 'Ativo',
    descricao: 'Layout SIGCB - Sistema de Gestão de Cobrança Bancária. Padrão unificado para todos os produtos de cobrança da Caixa.',
    atualizadoEm: '28/10/2024',
    documentacaoUrl: 'https://www.caixa.gov.br/download/manual-sigcb-cnab240.pdf',
  },

  // Bradesco
  {
    bancoNumero: '237',
    bancoNome: 'Banco Bradesco',
    tipoLayout: 'CNAB240',
    versao: '2024.1',
    status: 'Ativo',
    descricao: 'Cobrança registrada CNAB240. Suporta múltiplas carteiras e modalidades de cobrança.',
    atualizadoEm: '10/12/2024',
    documentacaoUrl: 'https://banco.bradesco/assets/layouts/cnab240-cobranca.pdf',
  },
  {
    bancoNumero: '237',
    bancoNome: 'Banco Bradesco',
    tipoLayout: 'CNAB400',
    versao: '2024.1',
    status: 'Ativo',
    descricao: 'Cobrança escritural - arquivo de remessa CNAB400. Layout em processo de descontinuação.',
    atualizadoEm: '10/12/2024',
    observacoes: 'Será descontinuado em 2025. Migrar para CNAB240.',
  },

  // Itaú
  {
    bancoNumero: '341',
    bancoNome: 'Banco Itaú',
    tipoLayout: 'CNAB240',
    versao: '12.3',
    status: 'Ativo',
    descricao: 'Layout padrão Febraban com especificações Itaú Unibanco. Inclui campos customizados para emissão de boletos e PIX.',
    atualizadoEm: '05/11/2024',
    documentacaoUrl: 'https://www.itau.com.br/empresas/assets/pdf/layout-cobranca-cnab240.pdf',
  },
  {
    bancoNumero: '341',
    bancoNome: 'Banco Itaú',
    tipoLayout: 'CNAB400',
    versao: '11.8',
    status: 'Ativo',
    descricao: 'Layout CNAB400 para cobrança. Suporta carteiras 109, 112, 115, 188 e 147.',
    atualizadoEm: '22/09/2024',
  },

  // Banco Inter
  {
    bancoNumero: '077',
    bancoNome: 'Banco Inter',
    tipoLayout: 'CNAB240',
    versao: '3.1',
    status: 'Ativo',
    descricao: 'Arquivo de remessa digital para cobrança bancária. 100% integrado com o sistema digital do Inter.',
    atualizadoEm: '20/11/2024',
    documentacaoUrl: 'https://developers.bancointer.com.br/docs/cnab240',
  },

  // Banco Original
  {
    bancoNumero: '212',
    bancoNome: 'Banco Original',
    tipoLayout: 'CNAB240',
    versao: '2.0',
    status: 'Em revisão',
    descricao: 'Layout em atualização conforme novas diretrizes Febraban 2024. Aguardar liberação da versão 2.1.',
    atualizadoEm: '01/10/2024',
    observacoes: 'Versão 2.1 prevista para janeiro/2025.',
  },

  // Nubank
  {
    bancoNumero: '260',
    bancoNome: 'Nu Pagamentos (Nubank)',
    tipoLayout: 'CNAB240',
    versao: '1.5',
    status: 'Ativo',
    descricao: 'Remessa de cobrança via arquivo CNAB240 padrão Febraban. Suporta boletos e cobranças recorrentes.',
    atualizadoEm: '18/12/2024',
    documentacaoUrl: 'https://nubank.com.br/dev/docs/api/cnab',
  },

  // Banco Safra
  {
    bancoNumero: '422',
    bancoNome: 'Banco Safra',
    tipoLayout: 'CNAB240',
    versao: '4.2',
    status: 'Ativo',
    descricao: 'Cobrança registrada - layout padrão CNAB240. Suporta todas as modalidades de cobrança.',
    atualizadoEm: '25/11/2024',
  },

  // Sicredi
  {
    bancoNumero: '748',
    bancoNome: 'Banco Sicredi',
    tipoLayout: 'CNAB240',
    versao: '6.0',
    status: 'Ativo',
    descricao: 'Layout unificado para cooperativas do Sistema Sicredi. Compatível com todas as cooperativas da rede.',
    atualizadoEm: '08/12/2024',
    documentacaoUrl: 'https://www.sicredi.com.br/site/arquivos/layout-cnab-240.pdf',
  },

  // Sicoob
  {
    bancoNumero: '756',
    bancoNome: 'Banco Sicoob',
    tipoLayout: 'CNAB240',
    versao: '5.2',
    status: 'Ativo',
    descricao: 'Layout padrão para cooperativas Sicoob. Suporta cobrança registrada e híbrida.',
    atualizadoEm: '15/11/2024',
  },
  {
    bancoNumero: '756',
    bancoNome: 'Banco Sicoob',
    tipoLayout: 'CNAB400',
    versao: '2023.2',
    status: 'Descontinuado',
    descricao: 'Layout CNAB400 descontinuado em dezembro/2023. Migrar urgentemente para CNAB240.',
    atualizadoEm: '15/06/2023',
    observacoes: 'Descontinuado. Usar apenas CNAB240.',
  },

  // Banrisul
  {
    bancoNumero: '041',
    bancoNome: 'Banco do Estado do Rio Grande do Sul (Banrisul)',
    tipoLayout: 'CNAB240',
    versao: '3.5',
    status: 'Ativo',
    descricao: 'Layout CNAB240 para cobrança. Específico para operações no Rio Grande do Sul.',
    atualizadoEm: '30/10/2024',
  },

  // BRB
  {
    bancoNumero: '070',
    bancoNome: 'Banco de Brasília (BRB)',
    tipoLayout: 'CNAB240',
    versao: '2.8',
    status: 'Ativo',
    descricao: 'Layout padrão CNAB240. Atende empresas e órgãos públicos do Distrito Federal.',
    atualizadoEm: '12/11/2024',
  },

  // Ailos
  {
    bancoNumero: '085',
    bancoNome: 'Cooperativa Central de Crédito Ailos',
    tipoLayout: 'CNAB240',
    versao: '1.9',
    status: 'Ativo',
    descricao: 'Layout unificado para cooperativas filiadas ao sistema Ailos.',
    atualizadoEm: '05/12/2024',
  },

  // PagSeguro
  {
    bancoNumero: '290',
    bancoNome: 'Pagseguro Internet (PagBank)',
    tipoLayout: 'CNAB240',
    versao: '2.3',
    status: 'Ativo',
    descricao: 'Layout digital para cobrança via boleto. Integração total com plataforma PagBank.',
    atualizadoEm: '01/12/2024',
    documentacaoUrl: 'https://dev.pagbank.com.br/docs/cnab-240',
  },

  // Mercado Pago
  {
    bancoNumero: '323',
    bancoNome: 'Mercado Pago',
    tipoLayout: 'CNAB240',
    versao: '1.2',
    status: 'Ativo',
    descricao: 'Layout para conciliação e cobrança via CNAB240. Compatível com API do Mercado Pago.',
    atualizadoEm: '10/11/2024',
    documentacaoUrl: 'https://www.mercadopago.com.br/developers/pt/docs/cnab',
  },

  // C6 Bank
  {
    bancoNumero: '336',
    bancoNome: 'Banco C6',
    tipoLayout: 'CNAB240',
    versao: '1.0',
    status: 'Ativo',
    descricao: 'Layout digital CNAB240 para cobrança. Suporta boletos e PIX integrados.',
    atualizadoEm: '25/11/2024',
  },

  // BTG Pactual
  {
    bancoNumero: '208',
    bancoNome: 'Banco BTG Pactual',
    tipoLayout: 'CNAB240',
    versao: '4.1',
    status: 'Ativo',
    descricao: 'Layout CNAB240 para corporate banking. Voltado para grandes empresas.',
    atualizadoEm: '20/10/2024',
  },

  // Banco Pan
  {
    bancoNumero: '623',
    bancoNome: 'Banco Pan',
    tipoLayout: 'CNAB240',
    versao: '2.5',
    status: 'Ativo',
    descricao: 'Layout padrão para cobrança registrada e não registrada.',
    atualizadoEm: '15/11/2024',
  },

  // Banco Votorantim
  {
    bancoNumero: '655',
    bancoNome: 'Banco Votorantim',
    tipoLayout: 'CNAB240',
    versao: '3.0',
    status: 'Em revisão',
    descricao: 'Layout em atualização para suportar novos tipos de operação.',
    atualizadoEm: '05/09/2024',
    observacoes: 'Aguardar liberação da versão 3.1.',
  },

  // Banco Daycoval
  {
    bancoNumero: '707',
    bancoNome: 'Banco Daycoval',
    tipoLayout: 'CNAB240',
    versao: '1.8',
    status: 'Ativo',
    descricao: 'Layout padrão CNAB240 para cobrança bancária.',
    atualizadoEm: '28/11/2024',
  },

  // Exemplos de layouts Febraban genéricos
  {
    bancoNumero: '000',
    bancoNome: 'Padrão Febraban',
    tipoLayout: 'Febraban',
    versao: '2024',
    status: 'Ativo',
    descricao: 'Layout padrão Febraban 2024. Base para todos os layouts CNAB240 dos bancos brasileiros.',
    atualizadoEm: '01/01/2024',
    documentacaoUrl: 'https://www.febraban.org.br/pagina/3053/33/pt-br/layout-240',
  },
];

// ================================
// FUNÇÕES AUXILIARES
// ================================

/**
 * Busca um layout específico por número do banco e tipo
 */
export function buscarLayout(
  bancoNumero: string,
  tipo: TipoLayout
): BancoLayout | undefined {
  return LAYOUTS_BANCO.find(
    layout => layout.bancoNumero === bancoNumero && layout.tipoLayout === tipo
  );
}

/**
 * Retorna todos os layouts de um banco específico
 */
export function buscarLayoutsPorBanco(bancoNumero: string): BancoLayout[] {
  return LAYOUTS_BANCO.filter(layout => layout.bancoNumero === bancoNumero);
}

/**
 * Retorna todos os layouts de um tipo específico
 */
export function buscarLayoutsPorTipo(tipo: TipoLayout): BancoLayout[] {
  return LAYOUTS_BANCO.filter(layout => layout.tipoLayout === tipo);
}

/**
 * Retorna todos os layouts ativos
 */
export function buscarLayoutsAtivos(): BancoLayout[] {
  return LAYOUTS_BANCO.filter(
    layout => !layout.status || layout.status === 'Ativo'
  );
}

/**
 * Retorna estatísticas dos layouts
 */
export function obterEstatisticas() {
  return {
    total: LAYOUTS_BANCO.length,
    ativos: LAYOUTS_BANCO.filter(l => !l.status || l.status === 'Ativo').length,
    emRevisao: LAYOUTS_BANCO.filter(l => l.status === 'Em revisão').length,
    descontinuados: LAYOUTS_BANCO.filter(l => l.status === 'Descontinuado').length,
    cnab240: LAYOUTS_BANCO.filter(l => l.tipoLayout === 'CNAB240').length,
    cnab400: LAYOUTS_BANCO.filter(l => l.tipoLayout === 'CNAB400').length,
    bancosUnicos: new Set(LAYOUTS_BANCO.map(l => l.bancoNumero)).size,
  };
}
