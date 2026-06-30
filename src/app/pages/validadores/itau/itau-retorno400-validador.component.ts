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
  selector: 'app-itau-retorno400-validador',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './itau-retorno400-validador.component.html',
  styleUrls: ['./itau-cnab400-validador.component.css']
})
export class ItauRetorno400ValidadorComponent implements OnDestroy {
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
  // LAYOUT HEADER RETORNO (TIPO 0) - ITAÚ CNAB 400
  // ========================================
  camposHeader: CampoLayout[] = [
    { nome: 'Identificação do Registro',    ini: 0,   fim: 1,   tamanho: 1,   tipo: 'N', obrigatorio: true,  valores: ['0'],         cor: '#f8bbd0', descricao: 'Tipo 0 — Header Retorno' },
    { nome: 'Tipo de Operação',             ini: 1,   fim: 2,   tamanho: 1,   tipo: 'N', obrigatorio: true,  valores: ['1'],         cor: '#ffe082', descricao: '1 = Retorno' },
    { nome: 'Literal Retorno',              ini: 2,   fim: 9,   tamanho: 7,   tipo: 'A', obrigatorio: true,  valores: ['RETORNO'],   cor: '#b2dfdb', descricao: 'Literal RETORNO (7 pos)' },
    { nome: 'Código de Serviço',            ini: 9,   fim: 11,  tamanho: 2,   tipo: 'N', obrigatorio: true,  valores: ['01'],        cor: '#c5cae9', descricao: '01 = Cobrança' },
    { nome: 'Literal Serviço',              ini: 11,  fim: 26,  tamanho: 15,  tipo: 'A', obrigatorio: true,                         cor: '#e1bee7', descricao: 'COBRANCA (15 pos)' },
    { nome: 'Código da Empresa no Banco',   ini: 26,  fim: 46,  tamanho: 20,  tipo: 'N', obrigatorio: true,                         cor: '#b3e5fc', descricao: 'Código da empresa no Itaú (20 pos)' },
    { nome: 'Nome da Empresa',              ini: 46,  fim: 76,  tamanho: 30,  tipo: 'A', obrigatorio: true,                         cor: '#ffecb3', descricao: 'Razão Social (30 pos)' },
    { nome: 'Código do Banco',              ini: 76,  fim: 79,  tamanho: 3,   tipo: 'N', obrigatorio: true,  valores: ['341'],       cor: '#dcedc8', descricao: 'Itaú = 341' },
    { nome: 'Nome do Banco',                ini: 79,  fim: 94,  tamanho: 15,  tipo: 'A', obrigatorio: true,                         cor: '#c5e1a5', descricao: 'BANCO ITAU SA (15 pos)' },
    { nome: 'Data de Gravação',             ini: 94,  fim: 100, tamanho: 6,   tipo: 'N', obrigatorio: true,  formato: 'DDMMAA',     cor: '#fff9c4', descricao: 'Data geração arquivo DDMMAA' },
    { nome: 'Densidade de Gravação',        ini: 100, fim: 108, tamanho: 8,   tipo: 'N', obrigatorio: true,  valores: ['01600000'], cor: '#e0e0e0', descricao: 'Fixo 01600000 (8 pos)' },
    { nome: 'Sequencial do Retorno',        ini: 108, fim: 113, tamanho: 5,   tipo: 'N', obrigatorio: true,                         cor: '#ffcdd2', descricao: 'Número do retorno (5 pos)' },
    { nome: 'Branco',                       ini: 113, fim: 394, tamanho: 281, tipo: 'A', obrigatorio: false,                        cor: '#f5f5f5', descricao: 'Branco (281 pos)' },
    { nome: 'Sequencial do Registro',       ini: 394, fim: 400, tamanho: 6,   tipo: 'N', obrigatorio: true,  valores: ['000001'],   cor: '#b2ebf2', descricao: 'Sempre 000001 no Header' },
  ];

  // ========================================
  // LAYOUT DETALHE RETORNO (TIPO 1) - ITAÚ CNAB 400
  // ========================================
  camposDetalhe: CampoLayout[] = [
    { nome: 'Identificação do Registro',       ini: 0,   fim: 1,   tamanho: 1,  tipo: 'N', obrigatorio: true,  valores: ['1'],          cor: '#f8bbd0', descricao: 'Tipo 1 — Detalhe Retorno' },
    { nome: 'Tipo Inscrição da Empresa',       ini: 1,   fim: 3,   tamanho: 2,  tipo: 'N', obrigatorio: true,
      valoresDescricao: { '01': 'CPF — Pessoa Física', '02': 'CNPJ — Pessoa Jurídica' },
      cor: '#ffe082', descricao: '01=CPF · 02=CNPJ (pos 2–3)' },
    { nome: 'CNPJ/CPF da Empresa',             ini: 3,   fim: 17,  tamanho: 14, tipo: 'N', obrigatorio: true,                           cor: '#b2dfdb', descricao: 'CNPJ (14) ou CPF (11, zeros à esq.) (pos 4–17)' },
    { nome: 'Agência do Cedente',              ini: 17,  fim: 21,  tamanho: 4,  tipo: 'N', obrigatorio: true,                           cor: '#b3e5fc', descricao: 'Agência (4 pos)' },
    { nome: 'Zero',                            ini: 21,  fim: 22,  tamanho: 1,  tipo: 'A', obrigatorio: true,  valores: ['0'],           cor: '#e0e0e0', descricao: 'Zero fixo (1 pos)' },
    { nome: 'Conta do Cedente',                ini: 22,  fim: 30,  tamanho: 8,  tipo: 'N', obrigatorio: true,                           cor: '#ffccbc', descricao: 'Conta (8 pos)' },
    { nome: 'Dígito da Conta',                 ini: 30,  fim: 31,  tamanho: 1,  tipo: 'A', obrigatorio: true,                           cor: '#ff8a65', descricao: 'Dígito verificador (1 pos)' },
    { nome: 'Uso da Empresa',                  ini: 31,  fim: 37,  tamanho: 6,  tipo: 'A', obrigatorio: false,                          cor: '#e8eaf6', descricao: 'Número do documento / controle (6 pos)' },
    { nome: 'Nosso Número (com Carteira)',      ini: 37,  fim: 62,  tamanho: 25, tipo: 'A', obrigatorio: true,                           cor: '#ef9a9a', descricao: 'Carteira + Nosso Número + DAC + Uso banco (25 pos)' },
    { nome: 'Uso do Banco (zeros)',            ini: 62,  fim: 70,  tamanho: 8,  tipo: 'N', obrigatorio: false,                          cor: '#e0e0e0', descricao: 'Zeros (8 pos)' },
    { nome: 'Número do Documento',             ini: 70,  fim: 82,  tamanho: 12, tipo: 'A', obrigatorio: false,                          cor: '#c5e1a5', descricao: 'Seu número conforme remessa (12 pos)' },
    { nome: 'Uso do Banco',                    ini: 82,  fim: 92,  tamanho: 10, tipo: 'A', obrigatorio: false,                          cor: '#f5f5f5', descricao: 'Uso interno banco (10 pos)' },
    { nome: 'Vencimento Original',             ini: 92,  fim: 98,  tamanho: 6,  tipo: 'N', obrigatorio: false, formato: 'DDMMAA',        cor: '#fff59d', descricao: 'Vencimento original DDMMAA' },
    { nome: 'Valor Original do Título',        ini: 98,  fim: 111, tamanho: 13, tipo: 'N', obrigatorio: false,                          cor: '#ffe0b2', descricao: 'Valor original em centavos (13 pos)' },
    { nome: 'Banco Cobrador',                  ini: 111, fim: 114, tamanho: 3,  tipo: 'N', obrigatorio: false,                          cor: '#b3e5fc', descricao: 'Banco cobrador (3 pos)' },
    { nome: 'Agência Cobradora',               ini: 114, fim: 119, tamanho: 5,  tipo: 'N', obrigatorio: false,                          cor: '#81d4fa', descricao: 'Agência cobradora (5 pos)' },
    { nome: 'Uso do Banco',                    ini: 119, fim: 121, tamanho: 2,  tipo: 'A', obrigatorio: false,                          cor: '#f5f5f5', descricao: 'Uso interno (2 pos)' },
    { nome: 'Carteira',                        ini: 121, fim: 122, tamanho: 1,  tipo: 'N', obrigatorio: true,                           cor: '#ce93d8', descricao: 'Carteira do título (1 pos)' },
    { nome: 'Código de Ocorrência',            ini: 122, fim: 124, tamanho: 2,  tipo: 'N', obrigatorio: true,                           cor: '#80deea', descricao: 'Código de ocorrência retorno (pos 123–124)' },
    { nome: 'Data da Ocorrência',              ini: 124, fim: 130, tamanho: 6,  tipo: 'N', obrigatorio: true,  formato: 'DDMMAA',        cor: '#fff9c4', descricao: 'Data da ocorrência DDMMAA' },
    { nome: 'Número do Documento (retorno)',   ini: 130, fim: 142, tamanho: 12, tipo: 'A', obrigatorio: false,                          cor: '#c5e1a5', descricao: 'Número do documento no retorno (12 pos)' },
    { nome: 'Branco',                          ini: 142, fim: 147, tamanho: 5,  tipo: 'A', obrigatorio: false,                          cor: '#f5f5f5', descricao: 'Branco (5 pos)' },
    { nome: 'Uso do Banco',                    ini: 147, fim: 150, tamanho: 3,  tipo: 'A', obrigatorio: false,                          cor: '#f5f5f5', descricao: 'Uso interno (3 pos)' },
    { nome: 'Vencimento (bloqueto)',           ini: 150, fim: 156, tamanho: 6,  tipo: 'N', obrigatorio: false, formato: 'DDMMAA',        cor: '#fff59d', descricao: 'Data vencimento do boleto DDMMAA' },
    { nome: 'Valor do Título',                 ini: 156, fim: 169, tamanho: 13, tipo: 'N', obrigatorio: false,                          cor: '#ffab91', descricao: 'Valor do título em centavos (13 pos)' },
    { nome: 'Banco Cobrador (retorno)',        ini: 169, fim: 172, tamanho: 3,  tipo: 'N', obrigatorio: false,                          cor: '#b3e5fc', descricao: 'Banco cobrador no retorno (3 pos)' },
    { nome: 'Agência Cobradora (retorno)',     ini: 172, fim: 177, tamanho: 5,  tipo: 'N', obrigatorio: false,                          cor: '#81d4fa', descricao: 'Agência cobradora (5 pos)' },
    { nome: 'Tarifa de Cobrança',              ini: 177, fim: 190, tamanho: 13, tipo: 'N', obrigatorio: false,                          cor: '#ffe0b2', descricao: 'Tarifa/encargo cobrado pelo banco (13 pos, 2 dec)' },
    { nome: 'Outras Despesas',                 ini: 190, fim: 203, tamanho: 13, tipo: 'N', obrigatorio: false,                          cor: '#fce4ec', descricao: 'Custas de protesto e outras (13 pos, 2 dec)' },
    { nome: 'Juros de Mora por Dia',           ini: 203, fim: 216, tamanho: 13, tipo: 'N', obrigatorio: false,                          cor: '#ffe082', descricao: 'Mora diária em centavos (13 pos, 2 dec)' },
    { nome: 'IOF Descontado',                  ini: 216, fim: 229, tamanho: 13, tipo: 'N', obrigatorio: false,                          cor: '#e8eaf6', descricao: 'IOF descontado em centavos (13 pos)' },
    { nome: 'Abatimento Concedido',            ini: 229, fim: 242, tamanho: 13, tipo: 'N', obrigatorio: false,                          cor: '#a5d6a7', descricao: 'Valor de abatimento (13 pos, 2 dec)' },
    { nome: 'Desconto Concedido',              ini: 242, fim: 255, tamanho: 13, tipo: 'N', obrigatorio: false,                          cor: '#80cbc4', descricao: 'Valor de desconto (13 pos, 2 dec)' },
    { nome: 'Valor Pago',                      ini: 255, fim: 268, tamanho: 13, tipo: 'N', obrigatorio: false,                          cor: '#66bb6a', descricao: 'Valor efetivamente pago/creditado (13 pos, 2 dec)' },
    { nome: 'Juros de Mora Recebidos',         ini: 268, fim: 281, tamanho: 13, tipo: 'N', obrigatorio: false,                          cor: '#ffab91', descricao: 'Juros mora recebidos (13 pos, 2 dec)' },
    { nome: 'Outros Créditos',                 ini: 281, fim: 294, tamanho: 13, tipo: 'N', obrigatorio: false,                          cor: '#ff8a65', descricao: 'Outros créditos (13 pos, 2 dec)' },
    { nome: 'Branco',                          ini: 294, fim: 295, tamanho: 1,  tipo: 'A', obrigatorio: false,                          cor: '#f5f5f5', descricao: 'Branco (1 pos)' },
    { nome: 'Data do Crédito',                 ini: 295, fim: 301, tamanho: 6,  tipo: 'N', obrigatorio: false, formato: 'DDMMAA',        cor: '#c8e6c9', descricao: 'Data do crédito em conta DDMMAA' },
    { nome: 'Motivos de Rejeição',             ini: 301, fim: 311, tamanho: 10, tipo: 'N', obrigatorio: false,                          cor: '#ef9a9a', descricao: 'Até 5 códigos de 2 dígitos (pos 302–311)' },
    { nome: 'Branco',                          ini: 311, fim: 368, tamanho: 57, tipo: 'A', obrigatorio: false,                          cor: '#f5f5f5', descricao: 'Branco (57 pos)' },
    { nome: 'Uso do Banco',                    ini: 368, fim: 385, tamanho: 17, tipo: 'A', obrigatorio: false,                          cor: '#e8eaf6', descricao: 'Uso interno banco (17 pos)' },
    { nome: 'Branco',                          ini: 385, fim: 394, tamanho: 9,  tipo: 'A', obrigatorio: false,                          cor: '#f5f5f5', descricao: 'Branco (9 pos)' },
    { nome: 'Sequencial do Registro',          ini: 394, fim: 400, tamanho: 6,  tipo: 'N', obrigatorio: true,                           cor: '#b2ebf2', descricao: 'Sequencial do registro' },
  ];

  // ========================================
  // LAYOUT TRAILER RETORNO (TIPO 9) - ITAÚ CNAB 400
  // ========================================
  camposTrailer: CampoLayout[] = [
    { nome: 'Identificação do Registro',    ini: 0,   fim: 1,   tamanho: 1,   tipo: 'N', obrigatorio: true,  valores: ['9'],  cor: '#f8bbd0', descricao: 'Tipo 9 — Trailer Retorno' },
    { nome: 'Tipo Retorno',                 ini: 1,   fim: 2,   tamanho: 1,   tipo: 'N', obrigatorio: true,  valores: ['2'],  cor: '#ffe082', descricao: '2 = Retorno (fixo)' },
    { nome: 'Uso do Banco',                 ini: 2,   fim: 9,   tamanho: 7,   tipo: 'A', obrigatorio: false,                 cor: '#e8eaf6', descricao: 'Uso interno banco (7 pos)' },
    { nome: 'Qtd. Títulos Cobrados',        ini: 9,   fim: 17,  tamanho: 8,   tipo: 'N', obrigatorio: false,                 cor: '#c5cae9', descricao: 'Total de registros tipo 1 (8 pos)' },
    { nome: 'Valor Total',                  ini: 17,  fim: 30,  tamanho: 13,  tipo: 'N', obrigatorio: false,                 cor: '#ffab91', descricao: 'Soma dos valores dos títulos (13 pos, 2 dec)' },
    { nome: 'Uso do Banco',                 ini: 30,  fim: 43,  tamanho: 13,  tipo: 'A', obrigatorio: false,                 cor: '#e8eaf6', descricao: 'Uso interno banco (13 pos)' },
    { nome: 'Valor Total Crédito',          ini: 43,  fim: 56,  tamanho: 13,  tipo: 'N', obrigatorio: false,                 cor: '#66bb6a', descricao: 'Soma dos valores creditados (13 pos, 2 dec)' },
    { nome: 'Branco',                       ini: 56,  fim: 394, tamanho: 338, tipo: 'A', obrigatorio: false,                 cor: '#f5f5f5', descricao: 'Branco (338 pos)' },
    { nome: 'Sequencial do Registro',       ini: 394, fim: 400, tamanho: 6,   tipo: 'N', obrigatorio: true,                  cor: '#b2ebf2', descricao: 'Sequencial do último registro' },
  ];

  // ========================================
  // TABELA DE OCORRÊNCIAS RETORNO - ITAÚ
  // ========================================
  readonly codigosOcorrencia: { codigo: string; descricao: string }[] = [
    { codigo: '02', descricao: 'Entrada Confirmada' },
    { codigo: '03', descricao: 'Entrada Rejeitada — verificar motivos pos 302–311' },
    { codigo: '06', descricao: 'Liquidação Normal' },
    { codigo: '07', descricao: 'Liquidação Parcial' },
    { codigo: '08', descricao: 'Liquidação em Cartório' },
    { codigo: '09', descricao: 'Baixa por Comando do Cliente' },
    { codigo: '10', descricao: 'Baixado Conforme Instruções da Agência' },
    { codigo: '11', descricao: 'Em Ser — Título em Carteira' },
    { codigo: '12', descricao: 'Abatimento Concedido' },
    { codigo: '13', descricao: 'Abatimento Cancelado' },
    { codigo: '14', descricao: 'Vencimento Alterado' },
    { codigo: '15', descricao: 'Liquidação em Desconto' },
    { codigo: '16', descricao: 'Título Pago em Cheque' },
    { codigo: '17', descricao: 'Liquidação após Baixa ou em Cartório' },
    { codigo: '18', descricao: 'Acerto de Depósito' },
    { codigo: '19', descricao: 'Confirmação Recebimento de Instrução de Protesto' },
    { codigo: '20', descricao: 'Confirmação Sustação de Protesto' },
    { codigo: '21', descricao: 'Acerto do Controle do Participante' },
    { codigo: '22', descricao: 'Título com Pagamento Cancelado' },
    { codigo: '23', descricao: 'Entrada do Título em Cartório' },
    { codigo: '24', descricao: 'Entrada Rejeitada por CEP Irregular' },
    { codigo: '25', descricao: 'Confirmação Recebimento Instrução de Sustação de Protesto' },
    { codigo: '27', descricao: 'Baixa Rejeitada' },
    { codigo: '28', descricao: 'Débito de Tarifas / Custas' },
    { codigo: '29', descricao: 'Ocorrência do Pagador' },
    { codigo: '30', descricao: 'Alteração de Outros Dados Rejeitada' },
    { codigo: '32', descricao: 'Instrução Rejeitada' },
    { codigo: '33', descricao: 'Confirmação Pedido de Alteração de Outros Dados' },
    { codigo: '34', descricao: 'Retirado de Cartório e Manutenção em Carteira' },
    { codigo: '35', descricao: 'Desagendamento do Débito Automático' },
    { codigo: '40', descricao: 'Liquidação Transferência para Desconto' },
    { codigo: '55', descricao: 'Sustado Judicial' },
    { codigo: '98', descricao: 'Pagamento Cancelado' },
  ];

  readonly motivosRejeicao: { codigo: string; descricao: string }[] = [
    { codigo: '03', descricao: 'Agência/Conta Cedente Inválida' },
    { codigo: '04', descricao: 'Código de Ocorrência Inválido' },
    { codigo: '05', descricao: 'Data de Vencimento Inválida' },
    { codigo: '06', descricao: 'Valor do Título Inválido' },
    { codigo: '07', descricao: 'CEP do Pagador Inválido' },
    { codigo: '08', descricao: 'Nome do Pagador Não Informado' },
    { codigo: '09', descricao: 'CNPJ/CPF do Pagador Inválido' },
    { codigo: '10', descricao: 'Logradouro Não Informado' },
    { codigo: '11', descricao: 'CEP sem Praça de Cobrança' },
    { codigo: '12', descricao: 'Abatimento Inválido' },
    { codigo: '13', descricao: 'Desconto Inválido' },
    { codigo: '14', descricao: 'Espécie do Título Inválida' },
    { codigo: '15', descricao: 'Nosso Número Inválido' },
    { codigo: '16', descricao: 'Número do Documento Inválido' },
    { codigo: '22', descricao: 'Carteira Inválida' },
    { codigo: '23', descricao: 'Agência Cobradora Inválida' },
    { codigo: '24', descricao: 'Instrução Inválida' },
    { codigo: '25', descricao: 'Título já Cobrado pelo Banco' },
    { codigo: '27', descricao: 'Data do Crédito Inválida' },
    { codigo: '28', descricao: 'Código da Mora Inválido' },
    { codigo: '29', descricao: 'Valor da Mora Inválido' },
    { codigo: '38', descricao: 'Prazo para Protesto Inválido' },
    { codigo: '40', descricao: 'CNPJ/CPF do Pagador Inválido (duplicata)' },
    { codigo: '60', descricao: 'Movimento para Título Não Cadastrado' },
    { codigo: '77', descricao: 'Carteira Inválida para Transferência de Desconto' },
  ];

  get campoEhOcorrencia(): boolean {
    return this.campoAtivo?.nome.toLowerCase().includes('ocorr') ?? false;
  }

  get campoEhMotivo(): boolean {
    return this.campoAtivo?.nome.toLowerCase().includes('motivo') ?? false;
  }

  get descricaoOcorrencia(): string {
    return this.codigosOcorrencia.find(o => o.codigo === this.valorCampoAtivo.trim())?.descricao ?? '';
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
    a.download = 'retorno_itau.RET';
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
      const ocor = l.substring(122, 124);
      if (ocor === '06' || ocor === '07' || ocor === '08' || ocor === '15' || ocor === '17') {
        liquidacoes++;
        valorTotalPago += parseInt(l.substring(255, 268) || '0', 10);
      }
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
        case '0': campos = this.camposHeader;  this.estatisticas.headers++;   break;
        case '1': campos = this.camposDetalhe; this.estatisticas.detalhes++;  break;
        case '9': campos = this.camposTrailer; this.estatisticas.trailers++;  break;
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
            linha: idx + 1, campo: 'Sequencial do Registro',
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
