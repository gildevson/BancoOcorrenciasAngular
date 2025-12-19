/**
 * Dados de Ocorrências Bancárias (CNAB)
 * Arquivo: src/app/data/ocorrencias.data.ts
 */

// ================================
// TIPOS E INTERFACES
// ================================

/**
 * Tipo de arquivo CNAB
 */
export type TipoCNAB = 'CNAB240' | 'CNAB400' | 'Ambos';

/**
 * Categoria da ocorrência
 */
export type CategoriaOcorrencia =
  | 'Confirmação'
  | 'Rejeição'
  | 'Baixa'
  | 'Liquidação'
  | 'Alteração'
  | 'Protesto'
  | 'Devolução'
  | 'Outros';

/**
 * Interface representando uma ocorrência bancária
 */
export interface OcorrenciaBancaria {
  /** Código da ocorrência (ex: "02", "03", "06") */
  codigo: string;

  /** Código do motivo/rejeição (ex: "00", "01", "AA") - opcional */
  motivo?: string;

  /** Descrição da ocorrência */
  descricao: string;

  /** Observações e detalhes técnicos */
  observacoes: string;

  /** Categoria da ocorrência */
  categoria: CategoriaOcorrencia;

  /** Tipo de CNAB onde esta ocorrência é usada */
  tipoCNAB: TipoCNAB;

  /** Indica se requer ação do usuário */
  requerAcao?: boolean;

  /** Ações sugeridas (opcional) */
  acoesSugeridas?: string[];

  /** Códigos de banco específicos (opcional) */
  bancosEspecificos?: string[];
}

// ================================
// DADOS DAS OCORRÊNCIAS
// ================================

export const OCORRENCIAS_BANCARIAS: OcorrenciaBancaria[] = [
  // ==================
  // CONFIRMAÇÕES (02)
  // ==================
  {
    codigo: '02',
    motivo: '00',
    descricao: 'Entrada Confirmada',
    observacoes: 'Título foi registrado com sucesso no banco. O boleto está disponível para pagamento e pode ser consultado pelo sacado.',
    categoria: 'Confirmação',
    tipoCNAB: 'Ambos',
    requerAcao: false,
  },
  {
    codigo: '02',
    motivo: '01',
    descricao: 'Entrada Confirmada com Rateio de Crédito',
    observacoes: 'Título registrado com configuração de rateio de crédito entre múltiplas contas. Verifique a configuração do rateio.',
    categoria: 'Confirmação',
    tipoCNAB: 'CNAB240',
    requerAcao: false,
  },

  // ==================
  // REJEIÇÕES (03)
  // ==================
  {
    codigo: '03',
    motivo: '01',
    descricao: 'Código do Banco Inválido',
    observacoes: 'O código do banco informado no arquivo de remessa não é válido ou não corresponde ao banco receptor. Verifique o código do banco no header do arquivo.',
    categoria: 'Rejeição',
    tipoCNAB: 'Ambos',
    requerAcao: true,
    acoesSugeridas: [
      'Verificar o código do banco no header do arquivo',
      'Confirmar se está enviando para o banco correto',
      'Consultar a tabela de códigos de bancos do BACEN'
    ],
  },
  {
    codigo: '03',
    motivo: '02',
    descricao: 'Código do Registro Inválido',
    observacoes: 'O tipo de registro informado não é reconhecido pelo banco. Registros válidos: 0=Header, 1=Detalhe, 9=Trailer.',
    categoria: 'Rejeição',
    tipoCNAB: 'CNAB400',
    requerAcao: true,
    acoesSugeridas: [
      'Revisar a estrutura do arquivo CNAB',
      'Verificar os tipos de registro utilizados',
      'Consultar o manual do layout do banco'
    ],
  },
  {
    codigo: '03',
    motivo: '03',
    descricao: 'Código da Ocorrência Inválido',
    observacoes: 'O código de ocorrência informado no registro não existe ou não é aceito pelo banco. Consulte a tabela de ocorrências válidas.',
    categoria: 'Rejeição',
    tipoCNAB: 'Ambos',
    requerAcao: true,
    acoesSugeridas: [
      'Verificar os códigos de ocorrência válidos para o banco',
      'Consultar o manual do layout CNAB',
      'Revisar o campo de ocorrência no arquivo'
    ],
  },
  {
    codigo: '03',
    motivo: '04',
    descricao: 'Nosso Número Inválido',
    observacoes: 'O nosso número informado não está no formato correto ou já existe no sistema do banco. Cada banco tem regras específicas para geração do nosso número.',
    categoria: 'Rejeição',
    tipoCNAB: 'Ambos',
    requerAcao: true,
    acoesSugeridas: [
      'Verificar o formato do nosso número conforme o banco',
      'Confirmar se o nosso número não está duplicado',
      'Verificar a carteira de cobrança utilizada'
    ],
  },
  {
    codigo: '03',
    motivo: '05',
    descricao: 'Número do Documento Inválido',
    observacoes: 'O número do documento informado é inválido, está duplicado ou ultrapassa o tamanho máximo permitido pelo banco.',
    categoria: 'Rejeição',
    tipoCNAB: 'Ambos',
    requerAcao: true,
    acoesSugeridas: [
      'Verificar duplicidade do número do documento',
      'Confirmar o tamanho máximo permitido (geralmente 10-15 caracteres)',
      'Remover caracteres especiais se houver'
    ],
  },
  {
    codigo: '03',
    motivo: '06',
    descricao: 'Data de Vencimento Inválida',
    observacoes: 'A data de vencimento está em formato incorreto, é anterior à data atual ou excede o prazo máximo permitido pelo banco (geralmente 5 anos).',
    categoria: 'Rejeição',
    tipoCNAB: 'Ambos',
    requerAcao: true,
    acoesSugeridas: [
      'Verificar se a data está no formato correto (DDMMAAAA)',
      'Confirmar que a data não é retroativa',
      'Verificar se não excede 5 anos (prazo máximo típico)'
    ],
  },
  {
    codigo: '03',
    motivo: '07',
    descricao: 'Valor do Título Inválido',
    observacoes: 'O valor do título está zerado, negativo ou ultrapassa o limite máximo permitido pelo banco para a modalidade de cobrança.',
    categoria: 'Rejeição',
    tipoCNAB: 'Ambos',
    requerAcao: true,
    acoesSugeridas: [
      'Verificar se o valor do título está maior que zero',
      'Confirmar os limites de valor do banco',
      'Revisar o formato do campo de valor (sem vírgulas ou pontos)'
    ],
  },
  {
    codigo: '03',
    motivo: '08',
    descricao: 'Espécie do Documento Inválida',
    observacoes: 'A espécie do documento informada não é aceita pelo banco. Espécies comuns: DM (Duplicata Mercantil), DS (Duplicata Serviço), NP (Nota Promissória).',
    categoria: 'Rejeição',
    tipoCNAB: 'Ambos',
    requerAcao: true,
    acoesSugeridas: [
      'Consultar as espécies de documento aceitas pelo banco',
      'Verificar o código da espécie (DM, DS, NP, etc)',
      'Conferir se a espécie está homologada na conta'
    ],
  },
  {
    codigo: '03',
    motivo: '09',
    descricao: 'CPF/CNPJ do Pagador Inválido',
    observacoes: 'O CPF ou CNPJ do pagador está em formato incorreto, com dígito verificador inválido ou não foi informado quando obrigatório.',
    categoria: 'Rejeição',
    tipoCNAB: 'Ambos',
    requerAcao: true,
    acoesSugeridas: [
      'Validar o CPF/CNPJ usando algoritmo de validação',
      'Remover pontos, traços e barras',
      'Confirmar se o documento tem 11 (CPF) ou 14 (CNPJ) dígitos'
    ],
  },
  {
    codigo: '03',
    motivo: '10',
    descricao: 'Carteira Inválida',
    observacoes: 'O código da carteira de cobrança não está cadastrado ou não está ativo para a conta corrente informada.',
    categoria: 'Rejeição',
    tipoCNAB: 'Ambos',
    requerAcao: true,
    acoesSugeridas: [
      'Verificar as carteiras habilitadas na conta',
      'Confirmar o código da carteira com o gerente',
      'Consultar o contrato de cobrança'
    ],
  },

  // ==================
  // LIQUIDAÇÃO (06)
  // ==================
  {
    codigo: '06',
    motivo: '00',
    descricao: 'Liquidação Normal',
    observacoes: 'Título foi pago pelo sacado no valor total, sem descontos adicionais. O crédito será disponibilizado conforme prazo contratado.',
    categoria: 'Liquidação',
    tipoCNAB: 'Ambos',
    requerAcao: false,
  },
  {
    codigo: '06',
    motivo: '01',
    descricao: 'Liquidação Parcial',
    observacoes: 'Título foi pago parcialmente. Verificar se há saldo remanescente e se será emitido novo boleto para o restante.',
    categoria: 'Liquidação',
    tipoCNAB: 'Ambos',
    requerAcao: true,
    acoesSugeridas: [
      'Verificar o valor pago e o saldo remanescente',
      'Decidir se emitirá novo boleto para o saldo',
      'Avaliar se aceita pagamento parcial ou devolve'
    ],
  },
  {
    codigo: '06',
    motivo: '02',
    descricao: 'Liquidação com Desconto',
    observacoes: 'Título pago com desconto concedido (por antecipação ou acordo comercial). Verificar se o desconto está dentro do esperado.',
    categoria: 'Liquidação',
    tipoCNAB: 'Ambos',
    requerAcao: false,
  },
  {
    codigo: '06',
    motivo: '03',
    descricao: 'Liquidação por Conta',
    observacoes: 'Título pago através de débito em conta corrente do sacado (débito automático). Pagamento processado automaticamente.',
    categoria: 'Liquidação',
    tipoCNAB: 'CNAB240',
    requerAcao: false,
  },

  // ==================
  // BAIXA (09)
  // ==================
  {
    codigo: '09',
    motivo: '00',
    descricao: 'Baixa por Solicitação',
    observacoes: 'Título foi baixado por solicitação do cedente (você). O boleto não estará mais disponível para pagamento.',
    categoria: 'Baixa',
    tipoCNAB: 'Ambos',
    requerAcao: false,
  },
  {
    codigo: '09',
    motivo: '10',
    descricao: 'Baixa por Protesto',
    observacoes: 'Título foi baixado após ser protestado. O protesto permanece registrado nos órgãos de proteção ao crédito.',
    categoria: 'Baixa',
    tipoCNAB: 'Ambos',
    requerAcao: false,
  },
  {
    codigo: '09',
    motivo: '15',
    descricao: 'Baixa por Decurso de Prazo',
    observacoes: 'Título baixado automaticamente após X dias do vencimento sem pagamento (prazo configurado no contrato).',
    categoria: 'Baixa',
    tipoCNAB: 'Ambos',
    requerAcao: true,
    acoesSugeridas: [
      'Verificar se deseja reapresentar o título',
      'Avaliar cobrança extrajudicial',
      'Considerar negociação com o devedor'
    ],
  },

  // ==================
  // ALTERAÇÃO (10)
  // ==================
  {
    codigo: '10',
    motivo: '00',
    descricao: 'Alteração de Dados Confirmada',
    observacoes: 'As alterações solicitadas no título foram processadas com sucesso pelo banco.',
    categoria: 'Alteração',
    tipoCNAB: 'Ambos',
    requerAcao: false,
  },
  {
    codigo: '10',
    motivo: '01',
    descricao: 'Alteração de Vencimento',
    observacoes: 'Data de vencimento do título foi alterada conforme solicitado. Verifique se a nova data está correta.',
    categoria: 'Alteração',
    tipoCNAB: 'Ambos',
    requerAcao: false,
  },

  // ==================
  // PROTESTO (23)
  // ==================
  {
    codigo: '23',
    motivo: '00',
    descricao: 'Encaminhado para Protesto',
    observacoes: 'Título foi encaminhado ao cartório de protesto. O protesto será efetivado em aproximadamente 3-5 dias úteis se não houver pagamento.',
    categoria: 'Protesto',
    tipoCNAB: 'Ambos',
    requerAcao: false,
  },
  {
    codigo: '23',
    motivo: '20',
    descricao: 'Protesto Sustado',
    observacoes: 'Solicitação de protesto foi cancelada antes da efetivação. O título retorna ao status anterior.',
    categoria: 'Protesto',
    tipoCNAB: 'Ambos',
    requerAcao: false,
  },

  // ==================
  // DEVOLUÇÃO (15)
  // ==================
  {
    codigo: '15',
    motivo: '10',
    descricao: 'Devolução - Pagador não Encontrado',
    observacoes: 'O pagador não foi localizado no endereço informado. Verifique e atualize o endereço do sacado.',
    categoria: 'Devolução',
    tipoCNAB: 'Ambos',
    requerAcao: true,
    acoesSugeridas: [
      'Atualizar o endereço do sacado',
      'Verificar os dados cadastrais',
      'Tentar contato por telefone/email'
    ],
  },
  {
    codigo: '15',
    motivo: '16',
    descricao: 'Devolução - CEP Inválido',
    observacoes: 'O CEP informado está incorreto ou não existe. Correios não conseguiu entregar a correspondência.',
    categoria: 'Devolução',
    tipoCNAB: 'Ambos',
    requerAcao: true,
    acoesSugeridas: [
      'Validar o CEP em site dos Correios',
      'Solicitar endereço atualizado ao cliente',
      'Corrigir e reenviar o boleto'
    ],
  },

  // ==================
  // ABATIMENTO (27)
  // ==================
  {
    codigo: '27',
    motivo: '00',
    descricao: 'Confirmação de Abatimento',
    observacoes: 'Abatimento concedido ao título foi confirmado pelo banco. O valor do boleto será reduzido automaticamente.',
    categoria: 'Alteração',
    tipoCNAB: 'Ambos',
    requerAcao: false,
  },

  // ==================
  // JUROS/MULTA (28)
  // ==================
  {
    codigo: '28',
    motivo: '00',
    descricao: 'Confirmação de Juros/Multa',
    observacoes: 'Configuração de juros e/ou multa foi aceita pelo banco. Será aplicada automaticamente após o vencimento.',
    categoria: 'Alteração',
    tipoCNAB: 'Ambos',
    requerAcao: false,
  },

  // Adicione mais ocorrências conforme necessário...
];

// ================================
// FUNÇÕES AUXILIARES
// ================================

/**
 * Busca uma ocorrência específica por código e motivo
 */
export function buscarOcorrencia(
  codigo: string,
  motivo?: string
): OcorrenciaBancaria | undefined {
  return OCORRENCIAS_BANCARIAS.find(
    o => o.codigo === codigo && (!motivo || o.motivo === motivo)
  );
}

/**
 * Busca todas as ocorrências de um código
 */
export function buscarOcorrenciasPorCodigo(codigo: string): OcorrenciaBancaria[] {
  return OCORRENCIAS_BANCARIAS.filter(o => o.codigo === codigo);
}

/**
 * Busca ocorrências por categoria
 */
export function buscarOcorrenciasPorCategoria(
  categoria: CategoriaOcorrencia
): OcorrenciaBancaria[] {
  return OCORRENCIAS_BANCARIAS.filter(o => o.categoria === categoria);
}

/**
 * Busca ocorrências que requerem ação
 */
export function buscarOcorrenciasQueRequeremAcao(): OcorrenciaBancaria[] {
  return OCORRENCIAS_BANCARIAS.filter(o => o.requerAcao === true);
}

/**
 * Retorna estatísticas das ocorrências
 */
export function obterEstatisticasOcorrencias() {
  const categorias = OCORRENCIAS_BANCARIAS.reduce((acc, o) => {
    acc[o.categoria] = (acc[o.categoria] || 0) + 1;
    return acc;
  }, {} as Record<CategoriaOcorrencia, number>);

  return {
    total: OCORRENCIAS_BANCARIAS.length,
    requeremAcao: OCORRENCIAS_BANCARIAS.filter(o => o.requerAcao).length,
    porCategoria: categorias,
    codigosUnicos: new Set(OCORRENCIAS_BANCARIAS.map(o => o.codigo)).size,
  };
}
