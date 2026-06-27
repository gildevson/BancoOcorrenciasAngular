import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface CampoLayout {
  nome: string;
  ini: number;
  fim: number;
  tamanho: number;
  tipo: 'A' | 'N';
  obrigatorio: boolean;
  valores?: string[];
  valoresDescricao?: { [key: string]: string };
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
  selector: 'app-uy3-retorno400-validador',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './uy3-retorno400-validador.component.html',
  styleUrls: ['./uy3cnab400validador.component.css']
})
export class Uy3Retorno400ValidadorComponent implements OnDestroy {
  visualHtml: SafeHtml | null = null;
  error: string | null = null;
  erros: Erro[] = [];
  validado = false;
  campoSelecionado: string | null = null;
  conteudoArquivo: string = '';
  legendaCampos: CampoLayout[] = [];
  estatisticas: EstatisticasArquivo | null = null;

  linhasEditadas: string[] = [];
  linhasOriginais: string[] = [];
  statusBar: string = '';
  campoAtivo: CampoLayout | null = null;
  valorCampoAtivo: string = '';
  linhaAtiva: number = -1;
  aplicadoFeedback: boolean = false;
  totalEdicoes: number = 0;
  editorPos: { top: number; left: number } | null = null;
  editorCarregando: boolean = false;

  totaisRetorno: {
    totalDetalhes: number;
    liquidacoes: number;
    valorTotalPago: number;
    entradasConfirmadas: number;
    baixas: number;
    rejeitadas: number;
  } | null = null;

  private _hlStyle: HTMLStyleElement | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnDestroy() {
    this._hlStyle?.remove();
  }

  private campoClass(nome: string): string {
    return 'cmp-' + nome
      .toLowerCase()
      .replace(/[áàãâä]/g, 'a').replace(/[éèêë]/g, 'e')
      .replace(/[íìîï]/g, 'i').replace(/[óòõôö]/g, 'o')
      .replace(/[úùûü]/g, 'u').replace(/ç/g, 'c').replace(/ñ/g, 'n')
      .replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      .substring(0, 50);
  }

  getErrosPorSeveridade(severidade: 'erro' | 'aviso'): Erro[] {
    return this.erros.filter(e => e.severidade === severidade);
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

  // ========================================
  // LAYOUT HEADER RETORNO (TIPO 0) - UY3 CNAB 400
  // ========================================
  camposHeader: CampoLayout[] = [
    { nome: 'Identificação do Registro',      ini: 0,   fim: 1,   tamanho: 1,   tipo: 'N', obrigatorio: true,  valores: ['0'],        cor: '#f8bbd0', descricao: 'Tipo 0 — Header Retorno' },
    { nome: 'Ident. Arquivo Retorno',         ini: 1,   fim: 2,   tamanho: 1,   tipo: 'N', obrigatorio: true,  valores: ['1'],        cor: '#ffe082', descricao: 'Retorno = 1' },
    { nome: 'Literal Retorno',                ini: 2,   fim: 9,   tamanho: 7,   tipo: 'A', obrigatorio: true,  valores: ['RETORNO'],  cor: '#b2dfdb', descricao: 'Literal RETORNO (7 pos)' },
    { nome: 'Código de Serviço',              ini: 9,   fim: 11,  tamanho: 2,   tipo: 'N', obrigatorio: true,  valores: ['01'],       cor: '#c5cae9', descricao: '01 = Cobrança' },
    { nome: 'Literal Serviço',                ini: 11,  fim: 26,  tamanho: 15,  tipo: 'A', obrigatorio: true,                        cor: '#e1bee7', descricao: 'COBRANÇA (15 pos)' },
    { nome: 'Código do Convênio',             ini: 26,  fim: 46,  tamanho: 20,  tipo: 'N', obrigatorio: true,                        cor: '#b3e5fc', descricao: 'Código fornecido pela UY3 (20 pos)' },
    { nome: 'Nome da Empresa',                ini: 46,  fim: 76,  tamanho: 30,  tipo: 'A', obrigatorio: true,                        cor: '#ffecb3', descricao: 'Razão Social (30 pos)' },
    { nome: 'Número UY3 na Câmara',           ini: 76,  fim: 79,  tamanho: 3,   tipo: 'N', obrigatorio: true,  valores: ['457'],      cor: '#ffccbc', descricao: 'Código UY3 = 457' },
    { nome: 'Nome do Banco',                  ini: 79,  fim: 94,  tamanho: 15,  tipo: 'A', obrigatorio: true,                        cor: '#dcedc8', descricao: 'UY3 (15 pos)' },
    { nome: 'Data do Arquivo',                ini: 94,  fim: 100, tamanho: 6,   tipo: 'N', obrigatorio: true,  formato: 'DDMMAA',     cor: '#fff9c4', descricao: 'Data Gravação DDMMAA' },
    { nome: 'Densidade de Gravação',          ini: 100, fim: 108, tamanho: 8,   tipo: 'N', obrigatorio: true,  valores: ['01600000'], cor: '#e0e0e0', descricao: 'Fixo 01600000 (8 pos)' },
    { nome: 'Nº Sequencial do Retorno',       ini: 108, fim: 113, tamanho: 5,   tipo: 'N', obrigatorio: true,                        cor: '#ffcdd2', descricao: 'Sequencial do retorno (5 pos)' },
    { nome: 'Branco',                         ini: 113, fim: 379, tamanho: 266, tipo: 'A', obrigatorio: false,                       cor: '#f5f5f5', descricao: 'Branco (266 pos)' },
    { nome: 'Data do Crédito',                ini: 379, fim: 385, tamanho: 6,   tipo: 'N', obrigatorio: false, formato: 'DDMMAA',     cor: '#c8e6c9', descricao: 'Data Crédito DDMMAA (pos 380–385)' },
    { nome: 'Branco (fin header)',            ini: 385, fim: 394, tamanho: 9,   tipo: 'A', obrigatorio: false,                       cor: '#f5f5f5', descricao: 'Branco (9 pos)' },
    { nome: 'Nº Sequencial do Registro',      ini: 394, fim: 400, tamanho: 6,   tipo: 'N', obrigatorio: true,  valores: ['000001'],   cor: '#b2ebf2', descricao: 'Sempre 000001 no Header' },
  ];

  // ========================================
  // LAYOUT DETALHE RETORNO (TIPO 1) - UY3 CNAB 400
  // ========================================
  camposDetalhe: CampoLayout[] = [
    { nome: 'Identificação do Registro',         ini: 0,   fim: 1,   tamanho: 1,  tipo: 'N', obrigatorio: true,  valores: ['1'],          cor: '#f8bbd0', descricao: 'Tipo 1 — Detalhe Retorno' },
    { nome: 'Tipo Inscrição da Empresa',          ini: 1,   fim: 3,   tamanho: 2,  tipo: 'N', obrigatorio: true,  valores: ['01', '02'],
      valoresDescricao: { '01': 'CPF — Pessoa Física', '02': 'CNPJ — Pessoa Jurídica' },
      cor: '#ffe082',  descricao: '01=CPF · 02=CNPJ (pos 2–3)' },
    { nome: 'CNPJ/CPF da Empresa',               ini: 3,   fim: 17,  tamanho: 14, tipo: 'N', obrigatorio: true,                           cor: '#b2dfdb', descricao: 'CNPJ (14 pos) ou CPF (11 pos, zeros à esq.) — pos 4–17' },
    { nome: 'Branco',                             ini: 17,  fim: 20,  tamanho: 3,  tipo: 'A', obrigatorio: false,                          cor: '#f5f5f5', descricao: 'Branco (3 pos)' },
    { nome: 'Ident. Empresa Beneficiária',        ini: 20,  fim: 37,  tamanho: 17, tipo: 'A', obrigatorio: true,                           cor: '#c5cae9', descricao: 'Zero + Carteira + Agência + Conta (17 pos)' },
    { nome: 'Nº do Controle do Participante',     ini: 37,  fim: 62,  tamanho: 25, tipo: 'A', obrigatorio: false,                          cor: '#b3e5fc', descricao: 'Conforme enviado na remessa (25 pos)' },
    { nome: 'Zero',                               ini: 62,  fim: 70,  tamanho: 8,  tipo: 'N', obrigatorio: false, valores: ['00000000'],    cor: '#e0e0e0', descricao: 'Zeros (8 pos)' },
    { nome: 'Identificação do Nosso Número',      ini: 70,  fim: 82,  tamanho: 12, tipo: 'A', obrigatorio: true,                           cor: '#ffccbc', descricao: 'Nosso Número (12 pos)' },
    { nome: 'Uso do Banco',                       ini: 82,  fim: 105, tamanho: 23, tipo: 'N', obrigatorio: false,                          cor: '#e8eaf6', descricao: 'Uso interno (23 pos)' },
    { nome: 'Branco',                             ini: 105, fim: 107, tamanho: 2,  tipo: 'A', obrigatorio: false,                          cor: '#f5f5f5', descricao: 'Branco (2 pos)' },
    { nome: 'Carteira',                           ini: 107, fim: 108, tamanho: 1,  tipo: 'N', obrigatorio: true,
      valoresDescricao: { '1': 'Cobrança Simples (mais comum)', '2': 'Cobrança Vinculada / Caucionada', '3': 'Cobrança Descontada', '4': 'Cobrança Vendor', '5': 'Cobrança Compror' },
      cor: '#ce93d8', descricao: 'Carteira contratada junto à UY3 DTVM (1 pos)' },
    { nome: 'Identificação de Ocorrência',        ini: 108, fim: 110, tamanho: 2,  tipo: 'N', obrigatorio: true,                           cor: '#80deea', descricao: 'Código de ocorrência retorno (pos 109–110)' },
    { nome: 'Data da Ocorrência',                 ini: 110, fim: 116, tamanho: 6,  tipo: 'N', obrigatorio: true,  formato: 'DDMMAA',        cor: '#fff9c4', descricao: 'Data da ocorrência DDMMAA' },
    { nome: 'Número do Documento',                ini: 116, fim: 126, tamanho: 10, tipo: 'A', obrigatorio: false,                          cor: '#c5e1a5', descricao: 'Nº do documento (10 pos)' },
    { nome: 'Nosso Número',                       ini: 126, fim: 140, tamanho: 14, tipo: 'N', obrigatorio: true,                           cor: '#ef9a9a', descricao: 'Nosso número (14 pos)' },
    { nome: 'Branco',                             ini: 140, fim: 146, tamanho: 6,  tipo: 'A', obrigatorio: false,                          cor: '#f5f5f5', descricao: 'Branco (6 pos)' },
    { nome: 'Vencimento',                         ini: 146, fim: 152, tamanho: 6,  tipo: 'N', obrigatorio: false, formato: 'DDMMAA',        cor: '#fff59d', descricao: 'Data de vencimento DDMMAA' },
    { nome: 'Valor do Título',                    ini: 152, fim: 165, tamanho: 13, tipo: 'N', obrigatorio: false,                          cor: '#ffab91', descricao: 'Valor do título (13 pos, 2 dec)' },
    { nome: 'Banco Cobrador',                     ini: 165, fim: 168, tamanho: 3,  tipo: 'N', obrigatorio: false, valores: ['457'],         cor: '#b3e5fc', descricao: 'Banco cobrador = 457 (3 pos)' },
    { nome: 'Agência Cobradora',                  ini: 168, fim: 173, tamanho: 5,  tipo: 'N', obrigatorio: false,                          cor: '#81d4fa', descricao: 'Agência cobradora (5 pos)' },
    { nome: 'Branco',                             ini: 173, fim: 175, tamanho: 2,  tipo: 'A', obrigatorio: false,                          cor: '#f5f5f5', descricao: 'Branco (2 pos)' },
    { nome: 'Tarifas de Cobrança',                ini: 175, fim: 188, tamanho: 13, tipo: 'N', obrigatorio: false,                          cor: '#ffe0b2', descricao: 'Para ocorrências 02 e 28 (13 pos, 2 dec)' },
    { nome: 'Despesas',                           ini: 188, fim: 201, tamanho: 13, tipo: 'N', obrigatorio: false,                          cor: '#fce4ec', descricao: 'Outras despesas / Custas de protesto (13 pos)' },
    { nome: 'Zero',                               ini: 201, fim: 227, tamanho: 26, tipo: 'N', obrigatorio: false,                          cor: '#e0e0e0', descricao: 'Zeros (26 pos)' },
    { nome: 'Abatimento Concedido',               ini: 227, fim: 240, tamanho: 13, tipo: 'N', obrigatorio: false,                          cor: '#a5d6a7', descricao: 'Valor de abatimento (13 pos, 2 dec)' },
    { nome: 'Desconto Concedido',                 ini: 240, fim: 253, tamanho: 13, tipo: 'N', obrigatorio: false,                          cor: '#80cbc4', descricao: 'Valor de desconto (13 pos, 2 dec)' },
    { nome: 'Valor Pago',                         ini: 253, fim: 266, tamanho: 13, tipo: 'N', obrigatorio: false,                          cor: '#66bb6a', descricao: 'Valor pago (13 pos, 2 dec)' },
    { nome: 'Juros de Mora',                      ini: 266, fim: 279, tamanho: 13, tipo: 'N', obrigatorio: false,                          cor: '#ffab91', descricao: 'Juros de mora (13 pos, 2 dec)' },
    { nome: 'Outros Créditos',                    ini: 279, fim: 292, tamanho: 13, tipo: 'N', obrigatorio: false,                          cor: '#ff8a65', descricao: 'Outros créditos (13 pos, 2 dec)' },
    { nome: 'Branco',                             ini: 292, fim: 294, tamanho: 2,  tipo: 'A', obrigatorio: false,                          cor: '#f5f5f5', descricao: 'Branco (2 pos)' },
    { nome: 'Instrução de Protesto',              ini: 294, fim: 295, tamanho: 1,  tipo: 'A', obrigatorio: false,
      valoresDescricao: { 'A': 'Aceito', 'D': 'Desprezado' },
      cor: '#b0bec5', descricao: 'A=Aceito · D=Desprezado (pos 295)' },
    { nome: 'Data do Crédito',                    ini: 295, fim: 301, tamanho: 6,  tipo: 'N', obrigatorio: false, formato: 'DDMMAA',        cor: '#c8e6c9', descricao: 'Data do crédito DDMMAA' },
    { nome: 'Branco',                             ini: 301, fim: 318, tamanho: 17, tipo: 'A', obrigatorio: false,                          cor: '#f5f5f5', descricao: 'Branco (17 pos)' },
    { nome: 'Motivo de Rejeição',                 ini: 318, fim: 328, tamanho: 10, tipo: 'N', obrigatorio: false,                          cor: '#ef9a9a', descricao: 'Até 5 códigos de 2 dígitos (pos 319–328)' },
    { nome: 'Branco',                             ini: 328, fim: 368, tamanho: 40, tipo: 'A', obrigatorio: false,                          cor: '#f5f5f5', descricao: 'Branco (40 pos)' },
    { nome: 'Número do Cartório',                 ini: 368, fim: 370, tamanho: 2,  tipo: 'N', obrigatorio: false,                          cor: '#bcaaa4', descricao: 'Nº Cartório (2 pos)' },
    { nome: 'Número do Protocolo',                ini: 370, fim: 380, tamanho: 10, tipo: 'A', obrigatorio: false,                          cor: '#d7ccc8', descricao: 'Protocolo do Cartório (10 pos)' },
    { nome: 'Branco',                             ini: 380, fim: 394, tamanho: 14, tipo: 'A', obrigatorio: false,                          cor: '#f5f5f5', descricao: 'Branco (14 pos)' },
    { nome: 'Nº Sequencial do Registro',          ini: 394, fim: 400, tamanho: 6,  tipo: 'N', obrigatorio: true,                           cor: '#b2ebf2', descricao: 'Sequencial do registro' },
  ];

  // ========================================
  // LAYOUT TRAILER RETORNO (TIPO 9) - UY3 CNAB 400
  // ========================================
  camposTrailer: CampoLayout[] = [
    { nome: 'Identificação do Registro',           ini: 0,   fim: 1,   tamanho: 1,   tipo: 'N', obrigatorio: true,  valores: ['9'],   cor: '#f8bbd0', descricao: 'Tipo 9 — Trailer Retorno' },
    { nome: 'Identificação do Retorno',            ini: 1,   fim: 3,   tamanho: 2,   tipo: 'A', obrigatorio: true,  valores: ['20'],
      valoresDescricao: { '20': 'Arquivo de Retorno (valor fixo obrigatório)' },
      cor: '#ffe082', descricao: 'Identificação = 20 (2 pos)' },
    { nome: 'Ident. Tipo de Registro',             ini: 3,   fim: 4,   tamanho: 1,   tipo: 'N', obrigatorio: true,  valores: ['1'],   cor: '#b2dfdb', descricao: 'Tipo de Registro = 1' },
    { nome: 'Código do Banco',                     ini: 4,   fim: 7,   tamanho: 3,   tipo: 'N', obrigatorio: true,  valores: ['457'], cor: '#ffccbc', descricao: 'UY3 = 457' },
    { nome: 'Brancos',                             ini: 7,   fim: 39,  tamanho: 32,  tipo: 'A', obrigatorio: false,                  cor: '#f5f5f5', descricao: 'Brancos (32 pos)' },
    { nome: 'Sequencial Arquivo Retorno',          ini: 39,  fim: 47,  tamanho: 8,   tipo: 'N', obrigatorio: false,                  cor: '#ffcdd2', descricao: 'Sequencial do arquivo de retorno (8 pos)' },
    { nome: 'Brancos',                             ini: 47,  fim: 57,  tamanho: 10,  tipo: 'A', obrigatorio: false,                  cor: '#f5f5f5', descricao: 'Brancos (10 pos)' },
    { nome: 'Qtd. Ocorrência 02 (Entradas)',       ini: 57,  fim: 62,  tamanho: 5,   tipo: 'N', obrigatorio: false,                  cor: '#c5cae9', descricao: 'Qtd. registros ocorrência 02 (5 pos)' },
    { nome: 'Valor Ocorrência 02',                 ini: 62,  fim: 74,  tamanho: 12,  tipo: 'N', obrigatorio: false,                  cor: '#9fa8da', descricao: 'Valor total ocorrência 02 (12 pos, 2 dec)' },
    { nome: 'Valor Ocorrência 06 (Liquidação)',    ini: 74,  fim: 86,  tamanho: 12,  tipo: 'N', obrigatorio: false,                  cor: '#66bb6a', descricao: 'Valor total ocorrência 06 — liquidações (12 pos, 2 dec)' },
    { nome: 'Qtd. Ocorrência 06',                  ini: 86,  fim: 91,  tamanho: 5,   tipo: 'N', obrigatorio: false,                  cor: '#a5d6a7', descricao: 'Qtd. registros ocorrência 06 (5 pos)' },
    { nome: 'Zero',                                ini: 91,  fim: 103, tamanho: 12,  tipo: 'N', obrigatorio: false,                  cor: '#e0e0e0', descricao: 'Zeros (12 pos)' },
    { nome: 'Qtd. Ocorrências 09 e 10 (Baixas)',  ini: 103, fim: 108, tamanho: 5,   tipo: 'N', obrigatorio: false,                  cor: '#ffab91', descricao: 'Qtd. registros ocorrências 09 e 10 — baixados (5 pos)' },
    { nome: 'Valor Ocorrências 09 e 10',           ini: 108, fim: 120, tamanho: 12,  tipo: 'N', obrigatorio: false,                  cor: '#ff8a65', descricao: 'Valor total ocorrências 09 e 10 (12 pos, 2 dec)' },
    { nome: 'Zero',                                ini: 120, fim: 137, tamanho: 17,  tipo: 'N', obrigatorio: false,                  cor: '#e0e0e0', descricao: 'Zeros (17 pos)' },
    { nome: 'Qtd. Ocorrência 14 (Venc. Alterado)', ini: 137, fim: 142, tamanho: 5,  tipo: 'N', obrigatorio: false,                  cor: '#fff59d', descricao: 'Qtd. ocorrência 14 (5 pos)' },
    { nome: 'Valor Ocorrência 14',                 ini: 142, fim: 154, tamanho: 12,  tipo: 'N', obrigatorio: false,                  cor: '#fff176', descricao: 'Valor total ocorrência 14 (12 pos, 2 dec)' },
    { nome: 'Qtd. Ocorrência 12 (Abatimento)',     ini: 154, fim: 159, tamanho: 5,   tipo: 'N', obrigatorio: false,                  cor: '#80cbc4', descricao: 'Qtd. ocorrência 12 (5 pos)' },
    { nome: 'Valor Ocorrência 12',                 ini: 159, fim: 171, tamanho: 12,  tipo: 'N', obrigatorio: false,                  cor: '#4db6ac', descricao: 'Valor total ocorrência 12 (12 pos, 2 dec)' },
    { nome: 'Qtd. Ocorrência 19 (Protesto)',       ini: 171, fim: 176, tamanho: 5,   tipo: 'N', obrigatorio: false,                  cor: '#bcaaa4', descricao: 'Qtd. ocorrência 19 (5 pos)' },
    { nome: 'Valor Ocorrência 19',                 ini: 176, fim: 188, tamanho: 12,  tipo: 'N', obrigatorio: false,                  cor: '#a1887f', descricao: 'Valor total ocorrência 19 (12 pos, 2 dec)' },
    { nome: 'Brancos',                             ini: 188, fim: 394, tamanho: 206, tipo: 'A', obrigatorio: false,                  cor: '#f5f5f5', descricao: 'Brancos (206 pos)' },
    { nome: 'Nº Sequencial do Registro',           ini: 394, fim: 400, tamanho: 6,   tipo: 'N', obrigatorio: true,                   cor: '#b2ebf2', descricao: 'Sequencial do último registro' },
  ];

  // ========================================
  // TABELA DE OCORRÊNCIAS RETORNO
  // ========================================
  readonly codigosOcorrencia: { codigo: string; descricao: string }[] = [
    { codigo: '02', descricao: 'Entrada Confirmada' },
    { codigo: '03', descricao: 'Entrada Rejeitada — verificar motivo pos 319–328' },
    { codigo: '06', descricao: 'Liquidação Normal' },
    { codigo: '09', descricao: 'Baixado Automaticamente via Arquivo' },
    { codigo: '10', descricao: 'Baixado conforme Instruções da Agência' },
    { codigo: '12', descricao: 'Abatimento Concedido' },
    { codigo: '13', descricao: 'Abatimento Cancelado' },
    { codigo: '14', descricao: 'Vencimento Alterado' },
    { codigo: '15', descricao: 'Liquidação em Cartório' },
    { codigo: '16', descricao: 'Título Pago em Cheque - Vinculado' },
    { codigo: '19', descricao: 'Confirmação Receb. Inst. de Protesto — verificar pos 295' },
    { codigo: '20', descricao: 'Confirmação Recebimento Instrução Sustação de Protesto' },
    { codigo: '21', descricao: 'Acerto Controle Participante' },
    { codigo: '23', descricao: 'Entrada do Título em Cartório' },
    { codigo: '24', descricao: 'Entrada Rejeitada por CEP Irregular' },
    { codigo: '27', descricao: 'Baixa Rejeitada' },
    { codigo: '28', descricao: 'Débito de Tarifas/Custas — verificar motivo pos 319–328' },
    { codigo: '32', descricao: 'Instrução Rejeitada — verificar motivo pos 319–328' },
    { codigo: '33', descricao: 'Confirmação Pedido Alteração Outros Dados' },
    { codigo: '34', descricao: 'Retirado de Cartório e Manutenção Carteira' },
    { codigo: '55', descricao: 'Sustado Judicial' },
  ];

  // ========================================
  // TABELA DE MOTIVOS DE REJEIÇÃO — UY3 RETORNO
  // Usado no campo "Motivo de Rejeição" (pos 319–328)
  // O campo contém até 5 códigos de 2 dígitos concatenados.
  // ========================================
  readonly motivosRejeicao: { codigo: string; descricao: string; ocorrencias: string }[] = [
    { codigo: '00', descricao: 'Ocorrência Aceita',                                              ocorrencias: '03 · 09 · 24' },
    { codigo: '02', descricao: 'Código do Registro Detalhe Inválido',                            ocorrencias: '03' },
    { codigo: '03', descricao: 'Código da Ocorrência Inválida',                                  ocorrencias: '03' },
    { codigo: '04', descricao: 'Código de Ocorrência não Permitida para a Carteira',             ocorrencias: '03' },
    { codigo: '05', descricao: 'Código de Ocorrência não Numérico',                              ocorrencias: '03' },
    { codigo: '08', descricao: 'Nosso Número Inválido / Custas de Protesto',                     ocorrencias: '03 · 28' },
    { codigo: '09', descricao: 'Nosso Número Duplicado',                                         ocorrencias: '03' },
    { codigo: '10', descricao: 'Carteira Inválida / Baixa Comandada pelo Cliente',               ocorrencias: '03 · 09 · 10' },
    { codigo: '13', descricao: 'Identificação da Emissão do Bloqueto Inválida',                  ocorrencias: '03' },
    { codigo: '14', descricao: 'Título Protestado',                                              ocorrencias: '10' },
    { codigo: '16', descricao: 'Data de Vencimento Inválida / Título Baixado por Decurso Prazo', ocorrencias: '03 · 10' },
    { codigo: '17', descricao: 'Valor do Título Inválido',                                       ocorrencias: '03' },
    { codigo: '18', descricao: 'Espécie do Título Inválida',                                     ocorrencias: '03' },
    { codigo: '19', descricao: 'Espécie não Permitida para a Carteira',                          ocorrencias: '03' },
    { codigo: '20', descricao: 'Título Baixado e Transferido para Desconto',                     ocorrencias: '10' },
    { codigo: '23', descricao: 'Tipo Pagamento não Contratado',                                  ocorrencias: '03' },
    { codigo: '24', descricao: 'Data de Emissão Inválida',                                       ocorrencias: '03' },
    { codigo: '27', descricao: 'Valor/Taxa de Juros Mora Inválido',                              ocorrencias: '03' },
    { codigo: '28', descricao: 'Código do Desconto Inválido',                                    ocorrencias: '03' },
    { codigo: '29', descricao: 'Valor Desconto ≥ Valor Título',                                  ocorrencias: '03' },
    { codigo: '32', descricao: 'Valor do IOF Inválido',                                          ocorrencias: '03' },
    { codigo: '34', descricao: 'Valor do Abatimento ≥ Valor do Título',                          ocorrencias: '03' },
    { codigo: '38', descricao: 'Prazo para Protesto/Negativação Inválido',                       ocorrencias: '03' },
    { codigo: '39', descricao: 'Pedido de Protesto/Negativação não Permitida para o Título',     ocorrencias: '03' },
    { codigo: '41', descricao: 'Envio de sustação para título não protestado',                   ocorrencias: '03' },
    { codigo: '42', descricao: 'Envio de sustação para título sem instrução de protesto / Ped. Sustação p/ Título Protestado', ocorrencias: '03 · 32' },
    { codigo: '46', descricao: 'Código da Moeda Inválido',                                       ocorrencias: '03' },
    { codigo: '47', descricao: 'Nome do Pagador não Informado',                                  ocorrencias: '03' },
    { codigo: '48', descricao: 'Tipo/Número de Inscrição do Pagador Inválidos / CEP Inválido',   ocorrencias: '03 · 24' },
    { codigo: '49', descricao: 'Endereço do Pagador não Informado / CEP sem Praça de Cobrança',  ocorrencias: '03 · 24' },
    { codigo: '50', descricao: 'CEP Inválido',                                                   ocorrencias: '03' },
    { codigo: '51', descricao: 'CEP sem Praça de Cobrança',                                      ocorrencias: '03' },
    { codigo: '52', descricao: 'CEP Irregular - Banco Correspondente',                           ocorrencias: '03' },
    { codigo: '53', descricao: 'Tipo/Número de Inscrição do Beneficiário Final Inválido',        ocorrencias: '03' },
    { codigo: '54', descricao: 'Sacador/Avalista (Beneficiário Final) não Informado',            ocorrencias: '03' },
    { codigo: '59', descricao: 'Valor/Percentual da Multa Inválido',                             ocorrencias: '03' },
    { codigo: '63', descricao: 'Entrada para Título já Cadastrado',                              ocorrencias: '03' },
    { codigo: '66', descricao: 'Número Autorização Inexistente',                                 ocorrencias: '03' },
    { codigo: '88', descricao: 'Título irregular no cartório',                                   ocorrencias: '32' },
    { codigo: '97', descricao: 'Título Baixado',                                                 ocorrencias: '03' },
  ];

  get campoEhOcorrencia(): boolean {
    return this.campoAtivo?.nome.toLowerCase().includes('ocorr') ?? false;
  }

  get campoEhMotivo(): boolean {
    return this.campoAtivo?.nome.toLowerCase().includes('motivo') ?? false;
  }

  get campoEhCartorio(): boolean {
    return this.campoAtivo?.nome.toLowerCase().includes('cartório') || this.campoAtivo?.nome.toLowerCase().includes('cartorio') || false;
  }

  get descricaoOcorrencia(): string {
    return this.codigosOcorrencia.find(o => o.codigo === this.valorCampoAtivo.trim())?.descricao ?? '';
  }

  get motivosAtivos(): { codigo: string; descricao: string; ocorrencias: string }[] {
    const val = this.valorCampoAtivo.replace(/\s/g, '');
    if (!val || val === '0000000000') return [];
    const codigos: string[] = [];
    for (let i = 0; i + 2 <= val.length; i += 2) {
      const cod = val.substring(i, i + 2);
      if (cod !== '00') codigos.push(cod);
    }
    return codigos
      .map(c => this.motivosRejeicao.find(m => m.codigo === c))
      .filter((m): m is { codigo: string; descricao: string; ocorrencias: string } => !!m);
  }

  get campoTemLookup(): boolean {
    return !!(this.campoAtivo?.valoresDescricao) && !this.campoEhOcorrencia && !this.campoEhMotivo;
  }

  get descricaoValorLookupAtivo(): string {
    const vd = this.campoAtivo?.valoresDescricao;
    if (!vd) return '';
    return vd[this.valorCampoAtivo.trim()] ?? '';
  }

  get valoresLookup(): { valor: string; descricao: string }[] {
    const vd = this.campoAtivo?.valoresDescricao;
    if (!vd) return [];
    return Object.keys(vd).map(k => ({ valor: k, descricao: vd[k] }));
  }

  selecionarValorLookup(v: string): void {
    if (!this.campoAtivo) return;
    const tam = this.campoAtivo.fim - this.campoAtivo.ini;
    this.valorCampoAtivo = this.campoAtivo.tipo === 'N'
      ? v.padStart(tam, '0').substring(0, tam)
      : v.padEnd(tam, ' ').substring(0, tam);
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
    const tipo = this.linhasEditadas[li]?.[0];
    if (tipo === '0') return this.camposHeader;
    if (tipo === '1') return this.camposDetalhe;
    if (tipo === '9') return this.camposTrailer;
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
    this.aplicadoFeedback = false;
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

  aplicarEdicao(): void {
    if (!this.campoAtivo || this.linhaAtiva < 0) return;
    const campo = this.campoAtivo;
    const tam = campo.fim - campo.ini;
    let val = this.valorCampoAtivo;
    if (campo.tipo === 'N') {
      val = val.replace(/\D/g, '').padStart(tam, '0').substring(0, tam);
    } else {
      val = val.padEnd(tam, ' ').substring(0, tam);
    }
    const linhaAntes = this.linhasEditadas[this.linhaAtiva];
    const linhaDepois = linhaAntes.substring(0, campo.ini) + val + linhaAntes.substring(campo.fim);
    if (linhaAntes !== linhaDepois) this.totalEdicoes++;
    this.linhasEditadas[this.linhaAtiva] = linhaDepois;
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
    a.download = 'retorno_uy3.RET';
    a.click();
    URL.revokeObjectURL(url);
  }

  onFileChange(event: Event): void {
    this.error = null;
    this.visualHtml = null;
    this.erros = [];
    this.validado = false;
    this.campoSelecionado = null;
    this.conteudoArquivo = '';
    this.estatisticas = null;
    this.statusBar = '';
    this.campoAtivo = null;
    this.linhaAtiva = -1;
    this.editorPos = null;
    this.totaisRetorno = null;
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const content = reader.result as string;
        this.conteudoArquivo = content;
        this.linhasEditadas = content.split(/\r?\n/).filter(l => l.length > 0);
        this.linhasOriginais = [...this.linhasEditadas];
        this.totalEdicoes = 0;
        this.rerenderizar();
      } catch (e) {
        this.error = 'Erro ao processar o arquivo. Verifique se é um arquivo CNAB 400 de Retorno válido.';
        console.error(e);
      }
    };
    reader.onerror = () => { this.error = 'Erro ao ler o arquivo. Tente novamente.'; };
    reader.readAsText(file, 'ISO-8859-1');
  }

  rerenderizar(): void {
    this.erros = [];
    this.estatisticas = null;
    const content = this.linhasEditadas.join('\r\n');
    const html = this.validarEHighlight(content);
    this.visualHtml = this.sanitizer.bypassSecurityTrustHtml(html);
    this.validado = true;
    this.calcularTotaisRetorno();
  }

  calcularTotaisRetorno(): void {
    const detalhes = this.linhasEditadas.filter(l => l[0] === '1');
    if (detalhes.length === 0) { this.totaisRetorno = null; return; }
    let liquidacoes = 0, valorTotalPago = 0, entradasConfirmadas = 0, baixas = 0, rejeitadas = 0;
    for (const l of detalhes) {
      const ocor = l.substring(108, 110);
      if (ocor === '06') { liquidacoes++; valorTotalPago += parseInt(l.substring(253, 266) || '0', 10); }
      if (ocor === '02') entradasConfirmadas++;
      if (ocor === '09' || ocor === '10') baixas++;
      if (ocor === '03') rejeitadas++;
    }
    this.totaisRetorno = { totalDetalhes: detalhes.length, liquidacoes, valorTotalPago, entradasConfirmadas, baixas, rejeitadas };
  }

  formatarReais(centavos: number): string {
    return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  validarEHighlight(content: string): string {
    const lines = content.split(/\r?\n/).filter(l => l.length > 0);
    if (lines.length === 0) { this.error = 'Arquivo vazio ou sem linhas válidas.'; return ''; }
    this.estatisticas = { totalLinhas: lines.length, headers: 0, detalhes: 0, trailers: 0, desconhecidos: 0 };
    let sequenciaEsperada = 1;

    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];
      const tipo = line[0];
      let campos: CampoLayout[];

      switch (tipo) {
        case '0':
          campos = this.camposHeader;
          this.estatisticas.headers++;
          break;
        case '1':
          campos = this.camposDetalhe;
          this.estatisticas.detalhes++;
          break;
        case '9':
          campos = this.camposTrailer;
          this.estatisticas.trailers++;
          break;
        default:
          campos = [];
          this.estatisticas.desconhecidos++;
          this.erros.push({
            linha: idx + 1, campo: 'Tipo Registro', posicao: '1', valor: tipo,
            mensagem: `Tipo de registro desconhecido: "${tipo}". Tipos válidos: 0 (Header), 1 (Detalhe), 9 (Trailer)`,
            severidade: 'erro'
          });
      }

      if (line.length !== 400) {
        this.erros.push({
          linha: idx + 1, campo: 'Linha', posicao: `1-${line.length}`, valor: `${line.length} caracteres`,
          mensagem: `Tamanho inválido. Esperado: 400, Encontrado: ${line.length}`,
          severidade: 'erro'
        });
      }

      for (const campo of campos) {
        this.validarCampo(idx + 1, campo, line.slice(campo.ini, campo.fim));
      }

      const seqCampo = campos.find(c => c.ini === 394 && c.fim === 400);
      if (seqCampo && line.length >= 400) {
        const valorSeq = line.slice(seqCampo.ini, seqCampo.fim).trim();
        const sequenciaAtual = parseInt(valorSeq, 10);
        if (!isNaN(sequenciaAtual) && sequenciaAtual !== sequenciaEsperada) {
          this.erros.push({
            linha: idx + 1, campo: 'Nº Sequencial do Registro',
            posicao: `${seqCampo.ini + 1}-${seqCampo.fim}`, valor: valorSeq,
            mensagem: `Sequência incorreta. Esperado: ${String(sequenciaEsperada).padStart(6, '0')}, Encontrado: ${valorSeq}`,
            severidade: 'erro'
          });
        }
        sequenciaEsperada++;
      }
    }

    this.validarEstrutura();
    const todosCampos = [...this.camposHeader, ...this.camposDetalhe, ...this.camposTrailer];
    this.legendaCampos = todosCampos.filter((c, i, self) => self.findIndex(x => x.nome === c.nome) === i);
    return `<div class="cnab-mw">${lines.map((line, idx) => this.lineToMatrix(line, idx)).join('')}</div>`;
  }

  validarEstrutura(): void {
    if (!this.estatisticas) return;
    if (this.estatisticas.headers === 0) {
      this.erros.push({ linha: 0, campo: 'Estrutura', posicao: '-', valor: '-', mensagem: 'Arquivo deve conter pelo menos um Header (Tipo 0)', severidade: 'erro' });
    }
    if (this.estatisticas.trailers === 0) {
      this.erros.push({ linha: 0, campo: 'Estrutura', posicao: '-', valor: '-', mensagem: 'Arquivo deve conter pelo menos um Trailer (Tipo 9)', severidade: 'erro' });
    }
    if (this.estatisticas.detalhes === 0) {
      this.erros.push({ linha: 0, campo: 'Estrutura', posicao: '-', valor: '-', mensagem: 'Aviso: Arquivo não contém registros de Detalhe (Tipo 1)', severidade: 'aviso' });
    }
    if (this.estatisticas.headers > 1) {
      this.erros.push({ linha: 0, campo: 'Estrutura', posicao: '-', valor: '-', mensagem: `Aviso: Arquivo contém ${this.estatisticas.headers} Headers (normalmente 1)`, severidade: 'aviso' });
    }
  }

  validarCampo(linha: number, campo: CampoLayout, valor: string): void {
    const valorTrim = valor.trim();
    if (campo.obrigatorio && valorTrim === '') {
      this.erros.push({ linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor, mensagem: 'Campo obrigatório está vazio', severidade: 'erro' });
      return;
    }
    if (!campo.obrigatorio && valorTrim === '') return;
    if (campo.tipo === 'N' && valorTrim !== '') {
      if (valor.includes(' ')) {
        this.erros.push({ linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor, mensagem: 'Campo numérico contém espaços. Deve ser preenchido com zeros à esquerda.', severidade: 'erro' });
      }
      if (!/^\d+$/.test(valor)) {
        this.erros.push({ linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor, mensagem: 'Deve conter apenas números (0-9)', severidade: 'erro' });
      }
    }
    if (campo.valores && valorTrim !== '' && !campo.valores.includes(valorTrim)) {
      this.erros.push({ linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor, mensagem: `Valor inválido. Valores permitidos: ${campo.valores.join(', ')}`, severidade: 'erro' });
    }
    if (campo.formato === 'DDMMAA' && valorTrim !== '' && valorTrim !== '000000' && valor.length === 6 && /^\d{6}$/.test(valor)) {
      const dia = parseInt(valor.slice(0, 2), 10);
      const mes = parseInt(valor.slice(2, 4), 10);
      if (dia < 1 || dia > 31) this.erros.push({ linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor, mensagem: `Dia inválido: ${dia} (deve estar entre 01 e 31)`, severidade: 'erro' });
      if (mes < 1 || mes > 12) this.erros.push({ linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor, mensagem: `Mês inválido: ${mes} (deve estar entre 01 e 12)`, severidade: 'erro' });
    }
  }

  lineToMatrix(line: string, lineIdx: number): string {
    const tipo = line[0];
    let campos: CampoLayout[];
    let tipoNome = '';
    let tipoColor = '';

    switch (tipo) {
      case '0': campos = this.camposHeader;  tipoNome = 'Header Retorno';  tipoColor = '#7b1fa2'; break;
      case '1': campos = this.camposDetalhe; tipoNome = 'Detalhe Retorno'; tipoColor = '#388e3c'; break;
      case '9': campos = this.camposTrailer; tipoNome = 'Trailer Retorno'; tipoColor = '#c2185b'; break;
      default:  campos = [];                 tipoNome = 'Desconhecido';    tipoColor = '#d32f2f';
    }

    let html = `<div style="margin-bottom:12px;padding:8px;background:#fafafa;border-radius:4px;border:1px solid #e0e0e0;width:max-content;min-width:100%;">`;
    html += `<div style="display:flex;align-items:center;margin-bottom:6px;gap:10px;flex-wrap:wrap;">`;
    html += `<span style="min-width:80px;font-size:12px;font-weight:600;color:${tipoColor};">Linha ${lineIdx + 1}</span>`;
    html += `<span style="padding:3px 10px;background:${tipoColor};color:#fff;border-radius:4px;font-size:11px;font-weight:600;text-transform:uppercase;">${tipoNome}</span>`;
    html += `<span style="padding:3px 8px;background:#757575;color:#fff;border-radius:4px;font-size:10px;font-weight:500;">${line.length} chars</span>`;
    const errosLinha = this.erros.filter(e => e.linha === lineIdx + 1 && e.severidade === 'erro');
    if (errosLinha.length > 0) {
      html += `<span style="padding:3px 10px;background:#d32f2f;color:#fff;border-radius:4px;font-size:11px;margin-left:auto;font-weight:600;">⚠️ ${errosLinha.length} erro(s)</span>`;
    }
    html += `</div>`;
    html += `<div style="font-family:'Courier New',Courier,monospace;font-size:11px;line-height:1;white-space:nowrap;background:#fff;padding:6px;border-radius:4px;border:1px solid #e0e0e0;">`;

    for (let i = 0; i < 400; i++) {
      const char = i < line.length ? line[i] : ' ';
      const campo = campos.find(c => i >= c.ini && i < c.fim);
      const cor = campo ? campo.cor : '#f5f5f5';
      const nomeCampo = campo ? campo.nome : 'N/D';
      const temErro = campo ? this.erros.some(e => e.linha === lineIdx + 1 && e.campo === campo.nome && e.severidade === 'erro') : false;
      const bordaErro = temErro ? 'border:2px solid #d32f2f;' : 'border:1px solid rgba(0,0,0,0.08);';
      const cls = campo ? `cnab-mc ${this.campoClass(campo.nome)}` : 'cnab-mc';
      const title = `${nomeCampo} - Pos ${i + 1}${campo?.descricao ? '\n' + campo.descricao : ''}`;
      html += `<span class="${cls}" data-li="${lineIdx}" data-ci="${i}" style="display:inline-block;width:13px;height:18px;line-height:18px;text-align:center;vertical-align:top;background:${cor};${bordaErro}font-size:11px;font-family:monospace;cursor:pointer;user-select:none;" title="${this.escapeHtml(title)}">${char === ' ' ? '&nbsp;' : this.escapeHtml(char)}</span>`;
    }
    html += '</div></div>';
    return html;
  }

  escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }
}
