import { Component, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface CampoLayout {
  nome: string;
  ini: number;
  fim: number;
  tamanho: number;
  tipo: 'A' | 'N';
  obrigatorio: boolean;
  valores?: string[];
  valoresDescricao?: Record<string, string>;
  formato?: string;
  cor: string;
  descricao?: string;
}

interface Erro {
  linha: number;
  campo: string;
  posicao: string;
  valor: string;
  mensagem: string;
  severidade: 'erro' | 'aviso';
}

interface EstatisticasArquivo {
  totalLinhas: number;
  headers: number;
  detalhes: number;
  trailers: number;
  desconhecidos: number;
}

@Component({
  selector: 'app-paulista-retorno400-validador',
  standalone: true,
  imports: [RouterModule, FormsModule],
  templateUrl: './paulista-retorno400-validador.component.html',
  styleUrls: ['./paulista-retorno400-validador.component.css']
})
export class PaulistaRetorno400ValidadorComponent implements OnDestroy {
  visualHtml: SafeHtml | null = null;
  error: string | null = null;
  erros: Erro[] = [];
  validado = false;
  campoSelecionado: string | null = null;
  legendaCampos: CampoLayout[] = [];
  estatisticas: EstatisticasArquivo | null = null;
  statusBar: string = '';

  linhasEditadas: string[] = [];
  linhasOriginais: string[] = [];
  campoAtivo: CampoLayout | null = null;
  valorCampoAtivo: string = '';
  linhaAtiva: number = -1;
  editorPos: { top: number; left: number } | null = null;
  editorCarregando = false;
  aplicadoFeedback = false;
  totalEdicoes = 0;

  totaisRetorno: {
    totalDetalhes: number;
    liquidacoes: number;
    valorTotalPago: number;
    entradasConfirmadas: number;
    baixas: number;
    rejeitadas: number;
    recompras: number;
  } | null = null;

  private _hlStyle: HTMLStyleElement | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnDestroy() { this._hlStyle?.remove(); }

  private campoClass(nome: string): string {
    return 'cmp-' + nome.toLowerCase()
      .replace(/[áàãâä]/g, 'a').replace(/[éèêë]/g, 'e')
      .replace(/[íìîï]/g, 'i').replace(/[óòõôö]/g, 'o')
      .replace(/[úùûü]/g, 'u').replace(/ç/g, 'c').replace(/ñ/g, 'n')
      .replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      .substring(0, 50);
  }

  getErrosPorSeveridade(severidade: 'erro' | 'aviso'): Erro[] {
    return this.erros.filter(e => e.severidade === severidade);
  }

  // ========================================
  // LAYOUT HEADER RETORNO (TIPO 0)
  // Header Retorno: pos[0]='0', pos[1]='2'
  // ========================================
  camposHeader: CampoLayout[] = [
    { nome: 'Tipo Registro',       ini: 0,   fim: 1,   tamanho: 1,   tipo: 'N', obrigatorio: true,  valores: ['0'],        cor: '#f8bbd0', descricao: 'Tipo 0 — Header Retorno' },
    { nome: 'Ident. Retorno',      ini: 1,   fim: 2,   tamanho: 1,   tipo: 'N', obrigatorio: true,  valores: ['2'],
      valoresDescricao: { '2': 'Arquivo de Retorno (valor fixo)' },
      cor: '#ffe082', descricao: 'Identificação Arquivo Retorno = 2' },
    { nome: 'Literal Retorno',     ini: 2,   fim: 9,   tamanho: 7,   tipo: 'A', obrigatorio: true,  valores: ['RETORNO'], cor: '#b2dfdb', descricao: 'Literal RETORNO (7 pos)' },
    { nome: 'Cód. Serviço',        ini: 9,   fim: 11,  tamanho: 2,   tipo: 'N', obrigatorio: true,  valores: ['01'],       cor: '#c5cae9', descricao: '01 = Cobrança' },
    { nome: 'Literal Serviço',     ini: 11,  fim: 26,  tamanho: 15,  tipo: 'A', obrigatorio: true,                        cor: '#e1bee7', descricao: 'COBRANCA (15 pos)' },
    { nome: 'Cód. Originador',     ini: 26,  fim: 46,  tamanho: 20,  tipo: 'N', obrigatorio: true,                        cor: '#b3e5fc', descricao: 'Código Originador fornecido pelo banco (20 pos)' },
    { nome: 'Nome Originador',     ini: 46,  fim: 76,  tamanho: 30,  tipo: 'A', obrigatorio: true,                        cor: '#ffecb3', descricao: 'Razão Social do Originador (30 pos)' },
    { nome: 'Nº Banco',            ini: 76,  fim: 79,  tamanho: 3,   tipo: 'N', obrigatorio: true,  valores: ['611'],      cor: '#ffccbc', descricao: 'Banco Paulista = 611' },
    { nome: 'Nome Banco',          ini: 79,  fim: 94,  tamanho: 15,  tipo: 'A', obrigatorio: true,                        cor: '#dcedc8', descricao: 'Nome do Banco (15 pos)' },
    { nome: 'Data Gravação',       ini: 94,  fim: 100, tamanho: 6,   tipo: 'N', obrigatorio: true,  formato: 'DDMMAA',    cor: '#fff9c4', descricao: 'Data de Gravação DDMMAA' },
    { nome: 'Densidade Gravação',  ini: 100, fim: 108, tamanho: 8,   tipo: 'N', obrigatorio: true,  valores: ['01600000'],cor: '#e0e0e0', descricao: 'Fixo 01600000' },
    { nome: 'Nº Aviso',            ini: 108, fim: 113, tamanho: 5,   tipo: 'N', obrigatorio: false,                       cor: '#ffcdd2', descricao: 'Nº Aviso Bancário (5 pos)' },
    { nome: 'Branco',              ini: 113, fim: 379, tamanho: 266, tipo: 'A', obrigatorio: false,                       cor: '#f5f5f5', descricao: 'Branco (266 pos)' },
    { nome: 'Data do Crédito',     ini: 379, fim: 385, tamanho: 6,   tipo: 'N', obrigatorio: false, formato: 'DDMMAA',    cor: '#c8e6c9', descricao: 'Data Crédito DDMMAA' },
    { nome: 'Branco (fin)',        ini: 385, fim: 394, tamanho: 9,   tipo: 'A', obrigatorio: false,                       cor: '#f5f5f5', descricao: 'Branco (9 pos)' },
    { nome: 'Nº Sequencial',       ini: 394, fim: 400, tamanho: 6,   tipo: 'N', obrigatorio: true,  valores: ['000001'],  cor: '#b2ebf2', descricao: 'Sempre 000001 no Header' },
  ];

  // ========================================
  // LAYOUT DETALHE RETORNO (TIPO 1)
  // ========================================
  camposDetalhe: CampoLayout[] = [
    { nome: 'Tipo Registro',            ini: 0,   fim: 1,   tamanho: 1,  tipo: 'N', obrigatorio: true,  valores: ['1'],
      valoresDescricao: { '1': 'Detalhe / Transação — 1 linha por título' },
      cor: '#f8bbd0', descricao: 'Tipo 1 — Detalhe Retorno' },
    { nome: 'Tipo Inscrição Empresa',   ini: 1,   fim: 3,   tamanho: 2,  tipo: 'N', obrigatorio: true,  valores: ['01','02'],
      valoresDescricao: { '01': 'CPF — Pessoa Física', '02': 'CNPJ — Pessoa Jurídica' },
      cor: '#ffe082', descricao: '01=CPF · 02=CNPJ (pos 2–3)' },
    { nome: 'CNPJ/CPF da Empresa',      ini: 3,   fim: 17,  tamanho: 14, tipo: 'N', obrigatorio: true,                        cor: '#b2dfdb', descricao: 'CNPJ (14) ou CPF (11, zeros à esq.) — pos 4–17' },
    { nome: 'Zeros',                    ini: 17,  fim: 20,  tamanho: 3,  tipo: 'N', obrigatorio: false, valores: ['000'],      cor: '#f5f5f5', descricao: 'Zeros (3 pos)' },
    { nome: 'Ident. Empresa Banco',     ini: 20,  fim: 37,  tamanho: 17, tipo: 'A', obrigatorio: true,                        cor: '#c5cae9', descricao: 'Carteira + Agência + Conta Cedente (17 pos)' },
    { nome: 'Nº Controle Participante', ini: 37,  fim: 62,  tamanho: 25, tipo: 'A', obrigatorio: false,                       cor: '#b3e5fc', descricao: 'Nº Controle enviado na remessa (25 pos)' },
    { nome: 'Zeros',                    ini: 62,  fim: 70,  tamanho: 8,  tipo: 'N', obrigatorio: false, valores: ['00000000'], cor: '#f5f5f5', descricao: 'Zeros (8 pos)' },
    { nome: 'Ident. Título no Banco',   ini: 70,  fim: 82,  tamanho: 12, tipo: 'N', obrigatorio: false,                       cor: '#ffccbc', descricao: 'Nosso Número / Ident. Título (12 pos)' },
    { nome: 'Uso do Banco',             ini: 82,  fim: 107, tamanho: 25, tipo: 'A', obrigatorio: false,                       cor: '#e8eaf6', descricao: 'Uso interno do banco (25 pos)' },
    { nome: 'Carteira',                 ini: 107, fim: 108, tamanho: 1,  tipo: 'N', obrigatorio: false,
      valoresDescricao: { '1': 'Cobrança Simples', '2': 'Cobrança Vinculada', '3': 'Cobrança Descontada' },
      cor: '#ce93d8', descricao: 'Carteira (1 pos)' },
    { nome: 'Identificação de Ocorrência', ini: 108, fim: 110, tamanho: 2, tipo: 'N', obrigatorio: true, cor: '#80deea', descricao: 'Código de ocorrência retorno (pos 109–110)' },
    { nome: 'Data da Ocorrência',       ini: 110, fim: 116, tamanho: 6,  tipo: 'N', obrigatorio: true,  formato: 'DDMMAA',    cor: '#fff9c4', descricao: 'Data da ocorrência DDMMAA' },
    { nome: 'Número do Documento',      ini: 116, fim: 126, tamanho: 10, tipo: 'A', obrigatorio: false,                       cor: '#c5e1a5', descricao: 'Nº do Documento (10 pos)' },
    { nome: 'Nosso Número',             ini: 126, fim: 140, tamanho: 14, tipo: 'N', obrigatorio: true,                        cor: '#ef9a9a', descricao: 'Nosso Número completo (14 pos)' },
    { nome: 'Branco',                   ini: 140, fim: 146, tamanho: 6,  tipo: 'A', obrigatorio: false,                       cor: '#f5f5f5', descricao: 'Branco (6 pos)' },
    { nome: 'Vencimento',               ini: 146, fim: 152, tamanho: 6,  tipo: 'N', obrigatorio: false, formato: 'DDMMAA',    cor: '#fff59d', descricao: 'Data de Vencimento DDMMAA' },
    { nome: 'Valor do Título',          ini: 152, fim: 165, tamanho: 13, tipo: 'N', obrigatorio: false,                       cor: '#ffab91', descricao: 'Valor do Título (13 pos, 2 dec)' },
    { nome: 'Banco Cobrador',           ini: 165, fim: 168, tamanho: 3,  tipo: 'N', obrigatorio: false,                       cor: '#b3e5fc', descricao: 'Banco Cobrador (3 pos)' },
    { nome: 'Agência Cobradora',        ini: 168, fim: 173, tamanho: 5,  tipo: 'N', obrigatorio: false,                       cor: '#81d4fa', descricao: 'Agência Cobradora (5 pos)' },
    { nome: 'Espécie / Branco',         ini: 173, fim: 175, tamanho: 2,  tipo: 'A', obrigatorio: false,                       cor: '#bcaaa4', descricao: 'Espécie do Título ou Branco (2 pos)' },
    { nome: 'Tarifas de Cobrança',      ini: 175, fim: 188, tamanho: 13, tipo: 'N', obrigatorio: false,                       cor: '#ffe0b2', descricao: 'Tarifas / Custas (13 pos, 2 dec)' },
    { nome: 'Outras Despesas',          ini: 188, fim: 201, tamanho: 13, tipo: 'N', obrigatorio: false,                       cor: '#fce4ec', descricao: 'Outras Despesas (13 pos, 2 dec)' },
    { nome: 'Zeros / Juros Op.',        ini: 201, fim: 227, tamanho: 26, tipo: 'N', obrigatorio: false,                       cor: '#e0e0e0', descricao: 'Zeros / Juros Operação (26 pos)' },
    { nome: 'Abatimento Concedido',     ini: 227, fim: 240, tamanho: 13, tipo: 'N', obrigatorio: false,                       cor: '#a5d6a7', descricao: 'Valor de Abatimento (13 pos, 2 dec)' },
    { nome: 'Desconto Concedido',       ini: 240, fim: 253, tamanho: 13, tipo: 'N', obrigatorio: false,                       cor: '#80cbc4', descricao: 'Valor de Desconto (13 pos, 2 dec)' },
    { nome: 'Valor Pago',               ini: 253, fim: 266, tamanho: 13, tipo: 'N', obrigatorio: false,                       cor: '#66bb6a', descricao: 'Valor Pago / Liquidado (13 pos, 2 dec)' },
    { nome: 'Juros de Mora',            ini: 266, fim: 279, tamanho: 13, tipo: 'N', obrigatorio: false,                       cor: '#ffab91', descricao: 'Juros de Mora cobrados (13 pos, 2 dec)' },
    { nome: 'Outros Créditos',          ini: 279, fim: 292, tamanho: 13, tipo: 'N', obrigatorio: false,                       cor: '#4db6ac', descricao: 'Outros Créditos (13 pos, 2 dec)' },
    { nome: 'Branco',                   ini: 292, fim: 295, tamanho: 3,  tipo: 'A', obrigatorio: false,                       cor: '#f5f5f5', descricao: 'Branco (3 pos)' },
    { nome: 'Data do Crédito',          ini: 295, fim: 301, tamanho: 6,  tipo: 'N', obrigatorio: false, formato: 'DDMMAA',    cor: '#c8e6c9', descricao: 'Data do Crédito DDMMAA' },
    { nome: 'Origem Pagamento',         ini: 301, fim: 304, tamanho: 3,  tipo: 'N', obrigatorio: false,
      valoresDescricao: { '000': 'Não informado', '006': 'Liquidado via compensação bancária' },
      cor: '#aed581', descricao: 'Origem Pagamento (3 pos)' },
    { nome: 'Branco',                   ini: 304, fim: 318, tamanho: 14, tipo: 'A', obrigatorio: false,                       cor: '#f5f5f5', descricao: 'Branco (14 pos)' },
    { nome: 'Motivos de Rejeição',      ini: 318, fim: 328, tamanho: 10, tipo: 'N', obrigatorio: false,                       cor: '#ef9a9a', descricao: 'Até 5 códigos de 2 dígitos (pos 319–328)' },
    { nome: 'Branco',                   ini: 328, fim: 368, tamanho: 40, tipo: 'A', obrigatorio: false,                       cor: '#f5f5f5', descricao: 'Branco (40 pos)' },
    { nome: 'Número do Cartório',       ini: 368, fim: 370, tamanho: 2,  tipo: 'N', obrigatorio: false,                       cor: '#bcaaa4', descricao: 'Nº Cartório (2 pos)' },
    { nome: 'Número do Protocolo',      ini: 370, fim: 380, tamanho: 10, tipo: 'A', obrigatorio: false,                       cor: '#d7ccc8', descricao: 'Protocolo do Cartório (10 pos)' },
    { nome: 'Branco',                   ini: 380, fim: 394, tamanho: 14, tipo: 'A', obrigatorio: false,                       cor: '#f5f5f5', descricao: 'Branco (14 pos)' },
    { nome: 'Nº Sequencial',            ini: 394, fim: 400, tamanho: 6,  tipo: 'N', obrigatorio: true,                        cor: '#b2ebf2', descricao: 'Sequencial do Registro' },
  ];

  // ========================================
  // LAYOUT TRAILER RETORNO (TIPO 9)
  // Trailer Retorno: pos[0]='9', pos[1]='2'
  // ========================================
  camposTrailer: CampoLayout[] = [
    { nome: 'Tipo Registro',        ini: 0,   fim: 1,   tamanho: 1,  tipo: 'N', obrigatorio: true,  valores: ['9'],   cor: '#f8bbd0', descricao: 'Tipo 9 — Trailer Retorno' },
    { nome: 'Ident. Retorno',       ini: 1,   fim: 2,   tamanho: 1,  tipo: 'N', obrigatorio: true,  valores: ['2'],
      valoresDescricao: { '2': 'Trailer de Retorno (valor fixo)' },
      cor: '#ffe082', descricao: 'Identificação Retorno = 2' },
    { nome: 'Ident. Tipo Registro', ini: 2,   fim: 4,   tamanho: 2,  tipo: 'N', obrigatorio: true,  valores: ['01'], cor: '#b2dfdb', descricao: 'Tipo Registro = 01' },
    { nome: 'Código do Banco',      ini: 4,   fim: 7,   tamanho: 3,  tipo: 'N', obrigatorio: true,  valores: ['611'],cor: '#ffccbc', descricao: 'Banco Paulista = 611' },
    { nome: 'Branco',               ini: 7,   fim: 17,  tamanho: 10, tipo: 'A', obrigatorio: false,                  cor: '#f5f5f5', descricao: 'Branco (10 pos)' },
    { nome: 'Qtd. Títulos',         ini: 17,  fim: 25,  tamanho: 8,  tipo: 'N', obrigatorio: false,                  cor: '#e1bee7', descricao: 'Quantidade Total de Títulos (8 pos)' },
    { nome: 'Valor Total',          ini: 25,  fim: 39,  tamanho: 14, tipo: 'N', obrigatorio: false,                  cor: '#ce93d8', descricao: 'Valor Total Cobrança (14 pos, 2 dec)' },
    { nome: 'Branco',               ini: 39,  fim: 57,  tamanho: 18, tipo: 'A', obrigatorio: false,                  cor: '#f5f5f5', descricao: 'Branco (18 pos)' },
    { nome: 'Qtd. Ocor. 02',        ini: 57,  fim: 62,  tamanho: 5,  tipo: 'N', obrigatorio: false,                  cor: '#c5cae9', descricao: 'Qtd. Entradas Confirmadas (5 pos)' },
    { nome: 'Valor Ocor. 02',       ini: 62,  fim: 74,  tamanho: 12, tipo: 'N', obrigatorio: false,                  cor: '#9fa8da', descricao: 'Valor Entradas (12 pos, 2 dec)' },
    { nome: 'Valor Ocor. 06',       ini: 74,  fim: 86,  tamanho: 12, tipo: 'N', obrigatorio: false,                  cor: '#66bb6a', descricao: 'Valor Liquidações (12 pos, 2 dec)' },
    { nome: 'Qtd. Ocor. 06',        ini: 86,  fim: 91,  tamanho: 5,  tipo: 'N', obrigatorio: false,                  cor: '#a5d6a7', descricao: 'Qtd. Liquidações (5 pos)' },
    { nome: 'Valor Ocor. 06 (2)',   ini: 91,  fim: 103, tamanho: 12, tipo: 'N', obrigatorio: false,                  cor: '#26a69a', descricao: 'Valor Liquidações Total (12 pos)' },
    { nome: 'Qtd. Ocor. 09/10',     ini: 103, fim: 108, tamanho: 5,  tipo: 'N', obrigatorio: false,                  cor: '#ffab91', descricao: 'Qtd. Baixas (5 pos)' },
    { nome: 'Valor Ocor. 09/10',    ini: 108, fim: 120, tamanho: 12, tipo: 'N', obrigatorio: false,                  cor: '#ff8a65', descricao: 'Valor Baixas (12 pos, 2 dec)' },
    { nome: 'Qtd. Ocor. 03',        ini: 120, fim: 125, tamanho: 5,  tipo: 'N', obrigatorio: false,                  cor: '#e57373', descricao: 'Qtd. Entradas Rejeitadas (5 pos)' },
    { nome: 'Qtd. Ocor. 14',        ini: 125, fim: 130, tamanho: 5,  tipo: 'N', obrigatorio: false,                  cor: '#fff59d', descricao: 'Qtd. Vencimentos Alterados (5 pos)' },
    { nome: 'Valor Ocor. 14',       ini: 130, fim: 142, tamanho: 12, tipo: 'N', obrigatorio: false,                  cor: '#fff176', descricao: 'Valor Venc. Alterados (12 pos, 2 dec)' },
    { nome: 'Branco',               ini: 142, fim: 394, tamanho: 252,tipo: 'A', obrigatorio: false,                  cor: '#f5f5f5', descricao: 'Branco (252 pos)' },
    { nome: 'Nº Sequencial',        ini: 394, fim: 400, tamanho: 6,  tipo: 'N', obrigatorio: true,                   cor: '#b2ebf2', descricao: 'Sequencial do Último Registro' },
  ];

  // ========================================
  // OCORRÊNCIAS RETORNO — PAULISTA / FIDC
  // ========================================
  readonly codigosOcorrencia: { codigo: string; descricao: string }[] = [
    { codigo: '02', descricao: 'Entrada Confirmada' },
    { codigo: '03', descricao: 'Entrada Rejeitada — verificar Motivo de Rejeição' },
    { codigo: '06', descricao: 'Liquidação Normal' },
    { codigo: '09', descricao: 'Baixado Automaticamente via Arquivo' },
    { codigo: '10', descricao: 'Baixado conforme Instruções da Agência' },
    { codigo: '12', descricao: 'Abatimento Concedido' },
    { codigo: '13', descricao: 'Abatimento Cancelado' },
    { codigo: '14', descricao: 'Vencimento Alterado' },
    { codigo: '15', descricao: 'Liquidação em Cartório' },
    { codigo: '17', descricao: 'Liquidação após Baixa' },
    { codigo: '28', descricao: 'Débito de Tarifas / Custas' },
    { codigo: '71', descricao: 'Recompra — com Liquidação Consultoria (Paulista)' },
    { codigo: '72', descricao: 'Recompra Parcial sem Adiantamento Confirmada (Paulista)' },
    { codigo: '73', descricao: 'Recompra Parcial com Adiantamento Confirmada (Paulista)' },
    { codigo: '74', descricao: 'Recompra — com Liquidação Cedente Confirmada (Paulista)' },
    { codigo: '75', descricao: 'Baixa por Depósito Cedente (Paulista)' },
    { codigo: '76', descricao: 'Baixa por Depósito Consultoria (Paulista)' },
    { codigo: '77', descricao: 'Baixa por Depósito Sacado (Paulista)' },
    { codigo: '80', descricao: 'Entrada Confirmada — com Liquidação Consultoria (Paulista)' },
    { codigo: '81', descricao: 'Entrada por Recompra Confirmada (Paulista)' },
    { codigo: '84', descricao: 'Entrada por Recompra — com Liquidação Cedente (Paulista)' },
    { codigo: '87', descricao: 'Reativação de Título Confirmada (Paulista)' },
  ];

  // ========================================
  // MOTIVOS DE REJEIÇÃO — CNAB 400 Retorno
  // ========================================
  readonly motivosRejeicao: { codigo: string; descricao: string }[] = [
    { codigo: '00', descricao: 'Ocorrência Aceita / Sem rejeição' },
    { codigo: '02', descricao: 'Código do Registro Detalhe Inválido' },
    { codigo: '03', descricao: 'Código da Ocorrência Inválido' },
    { codigo: '04', descricao: 'Código de Ocorrência não Permitido para a Carteira' },
    { codigo: '05', descricao: 'Código de Ocorrência não Numérico' },
    { codigo: '08', descricao: 'Nosso Número Inválido' },
    { codigo: '09', descricao: 'Nosso Número Duplicado' },
    { codigo: '10', descricao: 'Carteira / Modalidade Inválida' },
    { codigo: '13', descricao: 'Identificação da Emissão Inválida' },
    { codigo: '16', descricao: 'Data de Vencimento Inválida' },
    { codigo: '17', descricao: 'Valor do Título Inválido' },
    { codigo: '18', descricao: 'Espécie do Título Inválida' },
    { codigo: '19', descricao: 'Espécie não Permitida para a Carteira / Modalidade' },
    { codigo: '21', descricao: 'Espécie / Modalidade não Compatível com Tipo de Cobrança' },
    { codigo: '24', descricao: 'Data de Emissão Inválida' },
    { codigo: '27', descricao: 'Valor / Taxa de Juros Mora Inválido' },
    { codigo: '28', descricao: 'Código do Desconto Inválido' },
    { codigo: '29', descricao: 'Valor do Desconto Maior ou Igual ao Valor do Título' },
    { codigo: '30', descricao: 'Desconto Fora do Prazo' },
    { codigo: '34', descricao: 'Valor do Abatimento Maior ou Igual ao Valor do Título' },
    { codigo: '38', descricao: 'Prazo para Protesto Inválido' },
    { codigo: '39', descricao: 'Pedido de Protesto não Permitido para o Título' },
    { codigo: '44', descricao: 'Agência Cobradora / Código Banco Inválido' },
    { codigo: '46', descricao: 'Código da Moeda Inválido' },
    { codigo: '47', descricao: 'Nome do Pagador não Informado' },
    { codigo: '48', descricao: 'Tipo / Número de Inscrição do Pagador Inválido' },
    { codigo: '50', descricao: 'CEP do Pagador Inválido' },
    { codigo: '54', descricao: 'Número de Nota Fiscal / Duplicata não Informado' },
    { codigo: '55', descricao: 'Número do Termo de Cessão não Informado' },
    { codigo: '56', descricao: 'Inscrição Estadual do Sacado não Informada' },
    { codigo: '99', descricao: 'Outros Motivos — consultar o banco' },
  ];

  // ========================================
  // GETTERS / LÓGICA DO EDITOR
  // ========================================
  get campoEhOcorrencia(): boolean {
    return this.campoAtivo?.nome.toLowerCase().includes('ocorr') ?? false;
  }

  get campoEhMotivo(): boolean {
    return this.campoAtivo?.nome.toLowerCase().includes('motivo') ?? false;
  }

  get campoEhCartorio(): boolean {
    const n = this.campoAtivo?.nome.toLowerCase() ?? '';
    return n.includes('cartório') || n.includes('cartorio');
  }

  get campoTemLookup(): boolean {
    return !!(this.campoAtivo?.valoresDescricao) && !this.campoEhOcorrencia && !this.campoEhMotivo && !this.campoEhCartorio;
  }

  get descricaoOcorrencia(): string {
    return this.codigosOcorrencia.find(o => o.codigo === this.valorCampoAtivo.trim())?.descricao ?? '';
  }

  get descricaoValorLookupAtivo(): string {
    const vd = this.campoAtivo?.valoresDescricao;
    return vd ? (vd[this.valorCampoAtivo.trim()] ?? '') : '';
  }

  get valoresLookup(): { valor: string; descricao: string }[] {
    const vd = this.campoAtivo?.valoresDescricao;
    return vd ? Object.keys(vd).map(k => ({ valor: k, descricao: vd[k] })) : [];
  }

  get motivosAtivos(): { codigo: string; descricao: string }[] {
    const val = this.valorCampoAtivo.replace(/\s/g, '');
    if (!val || val === '0000000000') return [];
    const codigos: string[] = [];
    for (let i = 0; i + 2 <= val.length; i += 2) {
      const cod = val.substring(i, i + 2);
      if (cod !== '00') codigos.push(cod);
    }
    return codigos
      .map(c => this.motivosRejeicao.find(m => m.codigo === c))
      .filter((m): m is { codigo: string; descricao: string } => !!m);
  }

  selecionarValorLookup(v: string): void {
    if (!this.campoAtivo) return;
    const tam = this.campoAtivo.fim - this.campoAtivo.ini;
    this.valorCampoAtivo = this.campoAtivo.tipo === 'N'
      ? v.padStart(tam, '0').substring(0, tam)
      : v.padEnd(tam, ' ').substring(0, tam);
  }

  selecionarCampo(nomeCampo: string): void {
    this.campoSelecionado = this.campoSelecionado === nomeCampo ? null : nomeCampo;
    this._hlStyle?.remove();
    this._hlStyle = null;
    if (!this.campoSelecionado) return;
    const cls = this.campoClass(this.campoSelecionado);
    this._hlStyle = document.createElement('style');
    this._hlStyle.textContent = `
      .cnab-mw .cnab-mc { opacity: 0.18 !important; }
      .cnab-mw .cnab-mc.${cls} { opacity: 1 !important; outline: 2px solid #1565c0 !important; outline-offset: -1px; }
    `;
    document.head.appendChild(this._hlStyle);
  }

  fecharEditor(): void {
    this.campoAtivo = null;
    this.editorPos = null;
    this.statusBar = '';
    this._hlStyle?.remove();
    this._hlStyle = null;
    this.campoSelecionado = null;
  }

  editarErro(erro: Erro, event?: MouseEvent): void {
    const li = erro.linha - 1;
    if (li < 0 || li >= this.linhasEditadas.length) return;
    const campos = this.camposParaLinha(li);
    const campo = campos.find(c => c.nome === erro.campo) ?? null;
    const clickEl = event?.currentTarget as HTMLElement;
    const rect = clickEl?.getBoundingClientRect();
    const editorW = 420;
    const top = rect ? rect.bottom + 6 + window.scrollY : window.scrollY + 200;
    const left = rect ? Math.max(8, Math.min(rect.left, window.innerWidth - editorW - 12)) : 100;
    this.editorPos = { top, left };
    this.editorCarregando = true;
    this.aplicadoFeedback = false;
    requestAnimationFrame(() => {
      this.linhaAtiva = li;
      this.campoAtivo = campo;
      this.editorCarregando = false;
      if (campo) {
        this.valorCampoAtivo = this.linhasEditadas[li].substring(campo.ini, campo.fim);
        this.statusBar = `Ln ${li + 1}    Col ${campo.ini + 1}    |    ${campo.nome}    [${campo.ini + 1}–${campo.fim}]    Tipo: ${campo.tipo}    Tam: ${campo.tamanho}`;
        setTimeout(() => this.selecionarCampo(campo.nome), 0);
      } else {
        this.valorCampoAtivo = '';
        this.statusBar = `Ln ${li + 1}    |    (campo não mapeado)`;
      }
      setTimeout(() => {
        const cell = document.querySelector(`[data-li="${li}"]`);
        if (cell) cell.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    });
  }

  private camposParaLinha(li: number): CampoLayout[] {
    const line = this.linhasEditadas[li];
    if (!line) return [];
    const tipo = line[0];
    const ident = line.length > 1 ? line[1] : '';
    if (tipo === '0' && ident === '2') return this.camposHeader;
    if (tipo === '1') return this.camposDetalhe;
    if (tipo === '9' && ident === '2') return this.camposTrailer;
    return [];
  }

  onMatrizClick(event: MouseEvent): void {
    const el = event.target as HTMLElement;
    const liStr = el.dataset['li'];
    const ciStr = el.dataset['ci'];
    if (liStr === undefined || ciStr === undefined) return;
    const li = parseInt(liStr);
    const ci = parseInt(ciStr);
    const rect = el.getBoundingClientRect();
    const editorW = 420;
    const left = Math.min(rect.left, window.innerWidth - editorW - 12);
    this.editorPos = { top: rect.bottom + 6 + window.scrollY, left: Math.max(left, 8) };
    this.editorCarregando = true;
    requestAnimationFrame(() => {
      const campos = this.camposParaLinha(li);
      const campo = campos.find(c => ci >= c.ini && ci < c.fim) ?? null;
      this.linhaAtiva = li;
      this.campoAtivo = campo;
      this.editorCarregando = false;
      if (campo) {
        this.valorCampoAtivo = this.linhasEditadas[li].substring(campo.ini, campo.fim);
        this.statusBar = `Ln ${li + 1}    Col ${ci + 1}    |    ${campo.nome}    [${campo.ini + 1}–${campo.fim}]    Tipo: ${campo.tipo}    Tam: ${campo.tamanho}`;
        this.selecionarCampo(campo.nome);
      } else {
        this.valorCampoAtivo = '';
        this.statusBar = `Ln ${li + 1}    Col ${ci + 1}    |    (campo não mapeado)`;
      }
    });
  }

  onFileChange(event: Event): void {
    this.error = null;
    this.visualHtml = null;
    this.erros = [];
    this.validado = false;
    this.campoSelecionado = null;
    this.estatisticas = null;
    this.statusBar = '';
    this.campoAtivo = null;
    this.linhaAtiva = -1;
    this.editorPos = null;
    this.totaisRetorno = null;

    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const content = reader.result as string;
        this.linhasEditadas = content.split(/\r?\n/).filter(l => l.length > 0);
        this.linhasOriginais = [...this.linhasEditadas];
        this.totalEdicoes = 0;
        this.rerenderizar();
      } catch (e) {
        this.error = 'Erro ao processar o arquivo. Verifique se é um arquivo CNAB 400 de Retorno válido.';
      }
    };
    reader.onerror = () => { this.error = 'Erro ao ler o arquivo. Tente novamente.'; };
    reader.readAsText(file, 'ISO-8859-1');
  }

  rerenderizar(): void {
    this.erros = [];
    this.estatisticas = null;
    const html = this.validarEHighlight(this.linhasEditadas.join('\r\n'));
    this.visualHtml = this.sanitizer.bypassSecurityTrustHtml(html);
    this.validado = true;
    this.calcularTotais();
  }

  aplicarEdicao(): void {
    if (!this.campoAtivo || this.linhaAtiva < 0) return;
    const campo = this.campoAtivo;
    const tam = campo.fim - campo.ini;
    let val = this.valorCampoAtivo;
    val = campo.tipo === 'N'
      ? val.replace(/\D/g, '').padStart(tam, '0').substring(0, tam)
      : val.padEnd(tam, ' ').substring(0, tam);
    const antes = this.linhasEditadas[this.linhaAtiva];
    const depois = antes.substring(0, campo.ini) + val + antes.substring(campo.fim);
    if (antes !== depois) this.totalEdicoes++;
    this.linhasEditadas[this.linhaAtiva] = depois;
    this.valorCampoAtivo = val;
    this.aplicadoFeedback = true;
    setTimeout(() => { this.aplicadoFeedback = false; }, 1800);
    this.rerenderizar();
    setTimeout(() => { if (campo) this.selecionarCampo(campo.nome); }, 0);
  }

  gerarRetorno(): void {
    const conteudo = this.linhasEditadas.join('\r\n');
    const bytes = new Uint8Array(conteudo.length);
    for (let i = 0; i < conteudo.length; i++) bytes[i] = conteudo.charCodeAt(i) & 0xff;
    const blob = new Blob([bytes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'paulista_retorno_editado.RET';
    a.click();
    URL.revokeObjectURL(url);
  }

  calcularTotais(): void {
    const detalhes = this.linhasEditadas.filter(l => l[0] === '1');
    if (!detalhes.length) { this.totaisRetorno = null; return; }
    let liquidacoes = 0, valorTotalPago = 0, entradasConfirmadas = 0, baixas = 0, rejeitadas = 0, recompras = 0;
    for (const l of detalhes) {
      const ocor = l.substring(108, 110);
      if (ocor === '06' || ocor === '15' || ocor === '17') {
        liquidacoes++;
        valorTotalPago += parseInt(l.substring(253, 266) || '0', 10);
      }
      if (ocor === '02' || ocor === '80') entradasConfirmadas++;
      if (['09','10','75','76','77'].includes(ocor)) baixas++;
      if (ocor === '03') rejeitadas++;
      if (['71','72','73','74','81','84'].includes(ocor)) recompras++;
    }
    this.totaisRetorno = { totalDetalhes: detalhes.length, liquidacoes, valorTotalPago, entradasConfirmadas, baixas, rejeitadas, recompras };
  }

  formatarReais(centavos: number): string {
    return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  validarEHighlight(content: string): string {
    const lines = content.split(/\r?\n/).filter(l => l.length > 0);
    if (!lines.length) { this.error = 'Arquivo vazio.'; return ''; }

    this.estatisticas = { totalLinhas: lines.length, headers: 0, detalhes: 0, trailers: 0, desconhecidos: 0 };
    let seq = 1;

    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];
      const tipo = line[0];
      const ident = line.length > 1 ? line[1] : '';
      let campos: CampoLayout[];

      if (tipo === '0' && ident === '2') {
        campos = this.camposHeader; this.estatisticas.headers++;
      } else if (tipo === '1') {
        campos = this.camposDetalhe; this.estatisticas.detalhes++;
      } else if (tipo === '9' && ident === '2') {
        campos = this.camposTrailer; this.estatisticas.trailers++;
      } else {
        campos = []; this.estatisticas.desconhecidos++;
        this.erros.push({ linha: idx + 1, campo: 'Tipo Registro', posicao: '1-2', valor: tipo + ident,
          mensagem: `Tipo desconhecido: "${tipo}${ident}". Esperado: 02=Header, 1=Detalhe, 92=Trailer`, severidade: 'erro' });
      }

      if (line.length !== 400) {
        this.erros.push({ linha: idx + 1, campo: 'Linha', posicao: `1-${line.length}`, valor: `${line.length} chars`,
          mensagem: `Tamanho inválido. Esperado 400, encontrado ${line.length}`, severidade: 'erro' });
      }

      for (const campo of campos) this.validarCampo(idx + 1, campo, line.slice(campo.ini, campo.fim));

      const seqCampo = campos.find(c => c.nome === 'Nº Sequencial');
      if (seqCampo && line.length >= 400) {
        const valorSeq = parseInt(line.slice(seqCampo.ini, seqCampo.fim).trim(), 10);
        if (!isNaN(valorSeq) && valorSeq !== seq) {
          this.erros.push({ linha: idx + 1, campo: 'Nº Sequencial', posicao: `${seqCampo.ini + 1}-${seqCampo.fim}`,
            valor: String(valorSeq), mensagem: `Sequência incorreta. Esperado ${String(seq).padStart(6,'0')}`, severidade: 'erro' });
        }
        seq++;
      }
    }

    this.validarEstrutura();

    const todos = [...this.camposHeader, ...this.camposDetalhe, ...this.camposTrailer];
    this.legendaCampos = todos.filter((c, i, arr) => arr.findIndex(x => x.nome === c.nome) === i);

    return `<div class="cnab-mw">${lines.map((line, idx) => this.lineToMatrix(line, idx)).join('')}</div>`;
  }

  validarEstrutura(): void {
    if (!this.estatisticas) return;
    if (!this.estatisticas.headers)
      this.erros.push({ linha: 0, campo: 'Estrutura', posicao: '-', valor: '-', mensagem: 'Header de Retorno (Tipo 02) não encontrado', severidade: 'erro' });
    if (!this.estatisticas.trailers)
      this.erros.push({ linha: 0, campo: 'Estrutura', posicao: '-', valor: '-', mensagem: 'Trailer de Retorno (Tipo 92) não encontrado', severidade: 'erro' });
    if (!this.estatisticas.detalhes)
      this.erros.push({ linha: 0, campo: 'Estrutura', posicao: '-', valor: '-', mensagem: 'Arquivo sem registros Detalhe (Tipo 1)', severidade: 'aviso' });
  }

  validarCampo(linha: number, campo: CampoLayout, valor: string): void {
    const t = valor.trim();
    if (campo.obrigatorio && t === '') {
      this.erros.push({ linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor, mensagem: 'Campo obrigatório vazio', severidade: 'erro' }); return;
    }
    if (!campo.obrigatorio && t === '') return;
    if (campo.tipo === 'N' && t && !campo.nome.includes('Branco') && !campo.nome.startsWith('Zeros')) {
      if (valor.includes(' '))
        this.erros.push({ linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor, mensagem: 'Campo numérico com espaços. Use zeros à esquerda.', severidade: 'erro' });
      else if (!/^\d+$/.test(valor))
        this.erros.push({ linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor, mensagem: 'Deve conter apenas números (0-9)', severidade: 'erro' });
    }
    if (campo.valores && t && !campo.valores.includes(t))
      this.erros.push({ linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor, mensagem: `Valor inválido. Permitidos: ${campo.valores.join(', ')}`, severidade: 'erro' });
    if (campo.formato === 'DDMMAA' && t && t !== '000000' && /^\d{6}$/.test(valor)) {
      const dia = parseInt(valor.slice(0, 2), 10);
      const mes = parseInt(valor.slice(2, 4), 10);
      const ano = parseInt(valor.slice(4, 6), 10) + 2000;
      if (mes < 1 || mes > 12 || dia < 1 || dia > 31 || isNaN(new Date(ano, mes - 1, dia).getTime()))
        this.erros.push({ linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor, mensagem: 'Data inválida (DDMMAA)', severidade: 'aviso' });
    }
  }

  private lineToMatrix(line: string, li: number): string {
    const tipo = line[0];
    const ident = line.length > 1 ? line[1] : '';
    let campos: CampoLayout[];
    let rowClass: string;
    if (tipo === '0' && ident === '2') { campos = this.camposHeader; rowClass = 'cnab-row-header'; }
    else if (tipo === '1') { campos = this.camposDetalhe; rowClass = 'cnab-row-detalhe'; }
    else if (tipo === '9' && ident === '2') { campos = this.camposTrailer; rowClass = 'cnab-row-trailer'; }
    else { campos = []; rowClass = 'cnab-row-unknown'; }

    const cells: string[] = [];
    let pos = 0;
    for (const campo of campos) {
      if (campo.ini > pos) {
        const txt = line.slice(pos, campo.ini);
        cells.push(`<span class="cnab-mc cnab-mc-unmapped" data-li="${li}" data-ci="${pos}">${this.escHtml(txt)}</span>`);
      }
      const txt = line.slice(campo.ini, campo.fim);
      const cls = this.campoClass(campo.nome);
      const hasErr = this.erros.some(e => e.linha === li + 1 && e.campo === campo.nome);
      cells.push(`<span class="cnab-mc ${cls}${hasErr ? ' cnab-mc-err' : ''}" data-li="${li}" data-ci="${campo.ini}" style="background:${campo.cor}" title="${campo.nome} [${campo.ini + 1}–${campo.fim}]">${this.escHtml(txt)}</span>`);
      pos = campo.fim;
    }
    if (pos < line.length) {
      cells.push(`<span class="cnab-mc cnab-mc-unmapped" data-li="${li}" data-ci="${pos}">${this.escHtml(line.slice(pos))}</span>`);
    }
    return `<div class="cnab-row ${rowClass}" data-li="${li}">${cells.join('')}</div>`;
  }

  private escHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
