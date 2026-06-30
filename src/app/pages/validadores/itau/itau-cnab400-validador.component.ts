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
  tipo1: number;
  tipo5: number;
  trailers: number;
  desconhecidos: number;
}

@Component({
  selector: 'app-itau-cnab400-validador',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './itau-cnab400-validador.component.html',
  styleUrls: ['./itau-cnab400-validador.component.css']
})
export class ItauCnab400ValidadorComponent implements OnDestroy {
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

  totaisRemessa: {
    totalBoletos: number;
    valorFace: number;
    valorDesconto: number;
    valorAbatimento: number;
    valorIOF: number;
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
  // LAYOUT HEADER (TIPO 0) - ITAÚ CNAB 400
  // ========================================
  camposHeader: CampoLayout[] = [
    { nome: 'Identificação do Registro',    ini: 0,   fim: 1,   tamanho: 1,   tipo: 'N', obrigatorio: true,  valores: ['0'],        cor: '#f8bbd0', descricao: 'Tipo 0 — Header Remessa' },
    { nome: 'Tipo de Operação',             ini: 1,   fim: 2,   tamanho: 1,   tipo: 'N', obrigatorio: true,  valores: ['1'],        cor: '#ffe082', descricao: '1 = Remessa' },
    { nome: 'Literal Remessa',              ini: 2,   fim: 9,   tamanho: 7,   tipo: 'A', obrigatorio: true,  valores: ['REMESSA'],  cor: '#b2dfdb', descricao: 'Literal REMESSA (7 pos)' },
    { nome: 'Código de Serviço',            ini: 9,   fim: 11,  tamanho: 2,   tipo: 'N', obrigatorio: true,  valores: ['01'],       cor: '#c5cae9', descricao: '01 = Cobrança' },
    { nome: 'Literal Serviço',              ini: 11,  fim: 26,  tamanho: 15,  tipo: 'A', obrigatorio: true,                        cor: '#e1bee7', descricao: 'COBRANCA (15 pos, com espaços à direita)' },
    { nome: 'Agência do Cedente',           ini: 26,  fim: 30,  tamanho: 4,   tipo: 'N', obrigatorio: true,                        cor: '#b3e5fc', descricao: 'Agência sem dígito (4 pos)' },
    { nome: 'Zero',                         ini: 30,  fim: 31,  tamanho: 1,   tipo: 'A', obrigatorio: true,  valores: ['0'],        cor: '#e0e0e0', descricao: 'Zero fixo (1 pos)' },
    { nome: 'Conta do Cedente',             ini: 31,  fim: 38,  tamanho: 7,   tipo: 'N', obrigatorio: true,                        cor: '#ffccbc', descricao: 'Conta com dígito verificador (7 pos: ex. 0365514)' },
    { nome: 'Complemento do Cedente',       ini: 38,  fim: 46,  tamanho: 8,   tipo: 'A', obrigatorio: false,                       cor: '#e0e0e0', descricao: 'Uso banco / brancos (8 pos)' },
    { nome: 'Nome da Empresa',              ini: 46,  fim: 76,  tamanho: 30,  tipo: 'A', obrigatorio: true,                        cor: '#ffecb3', descricao: 'Razão Social (30 pos)' },
    { nome: 'Código do Banco',              ini: 76,  fim: 79,  tamanho: 3,   tipo: 'N', obrigatorio: true,  valores: ['341'],      cor: '#dcedc8', descricao: 'Itaú = 341' },
    { nome: 'Nome do Banco',                ini: 79,  fim: 94,  tamanho: 15,  tipo: 'A', obrigatorio: true,                        cor: '#c5e1a5', descricao: 'BANCO ITAU SA (15 pos)' },
    { nome: 'Data de Gravação',             ini: 94,  fim: 100, tamanho: 6,   tipo: 'N', obrigatorio: true,  formato: 'DDMMAA',    cor: '#fff9c4', descricao: 'Data geração arquivo DDMMAA' },
    { nome: 'Branco',                       ini: 100, fim: 394, tamanho: 294, tipo: 'A', obrigatorio: false,                       cor: '#f5f5f5', descricao: 'Branco (294 pos)' },
    { nome: 'Sequencial do Registro',       ini: 394, fim: 400, tamanho: 6,   tipo: 'N', obrigatorio: true,  valores: ['000001'],   cor: '#b2ebf2', descricao: 'Sempre 000001 no Header' },
  ];

  // ========================================
  // LAYOUT DETALHE (TIPO 1) - ITAÚ CNAB 400
  // Cobrança Escritural (carteiras 109, 112, 174, 175, 196, 198)
  // ========================================
  camposDetalhe: CampoLayout[] = [
    { nome: 'Identificação do Registro',       ini: 0,   fim: 1,   tamanho: 1,  tipo: 'N', obrigatorio: true,  valores: ['1'],       cor: '#f8bbd0', descricao: 'Tipo 1 — Detalhe Remessa' },
    { nome: 'Tipo Inscrição da Empresa',       ini: 1,   fim: 3,   tamanho: 2,  tipo: 'N', obrigatorio: true,
      valoresDescricao: { '01': 'CPF — Pessoa Física', '02': 'CNPJ — Pessoa Jurídica' },
      cor: '#ffe082', descricao: '01=CPF · 02=CNPJ (pos 2–3)' },
    { nome: 'CNPJ/CPF da Empresa',             ini: 3,   fim: 17,  tamanho: 14, tipo: 'N', obrigatorio: true,                       cor: '#b2dfdb', descricao: 'CNPJ (14 pos) ou CPF (11, zeros à esq.)' },
    { nome: 'Agência do Cedente',              ini: 17,  fim: 21,  tamanho: 4,  tipo: 'N', obrigatorio: true,                       cor: '#b3e5fc', descricao: 'Agência sem dígito (4 pos)' },
    { nome: 'Zero',                            ini: 21,  fim: 22,  tamanho: 1,  tipo: 'A', obrigatorio: true,  valores: ['0'],       cor: '#e0e0e0', descricao: 'Zero fixo (1 pos)' },
    { nome: 'Conta do Cedente',                ini: 22,  fim: 30,  tamanho: 8,  tipo: 'N', obrigatorio: true,                       cor: '#ffccbc', descricao: 'Conta sem dígito (8 pos)' },
    { nome: 'Dígito da Conta',                 ini: 30,  fim: 31,  tamanho: 1,  tipo: 'A', obrigatorio: true,                       cor: '#ff8a65', descricao: 'Dígito verificador (1 pos)' },
    { nome: 'Uso da Empresa',                  ini: 31,  fim: 37,  tamanho: 6,  tipo: 'A', obrigatorio: false,                      cor: '#e8eaf6', descricao: 'Número do documento / controle (6 pos) — retornado no retorno' },
    { nome: 'Carteira',                        ini: 37,  fim: 38,  tamanho: 1,  tipo: 'N', obrigatorio: true,
      valoresDescricao: { '1': 'Carteira 1 (simples / escritural)', '2': 'Carteira 2 (vinculada)', '3': 'Carteira 3 (caucionada)', '4': 'Carteira 4 (descontada)', '5': 'Carteira 5 (vendor)', '6': 'Carteira 6 (compror)' },
      cor: '#ce93d8', descricao: 'Código da carteira Itaú contratada (pos 38)' },
    { nome: 'Nosso Número',                    ini: 38,  fim: 48,  tamanho: 10, tipo: 'N', obrigatorio: true,                       cor: '#ef9a9a', descricao: 'Número bancário para cobrança (10 pos)' },
    { nome: 'DAC Nosso Número',                ini: 48,  fim: 49,  tamanho: 1,  tipo: 'A', obrigatorio: true,                       cor: '#ffab91', descricao: 'Dígito verificador — Módulo 10 (1 pos)' },
    { nome: 'Uso do Banco',                    ini: 49,  fim: 62,  tamanho: 13, tipo: 'A', obrigatorio: false,                      cor: '#e8eaf6', descricao: 'Uso interno do banco (13 pos)' },
    { nome: 'Uso do Banco (zeros)',            ini: 62,  fim: 70,  tamanho: 8,  tipo: 'N', obrigatorio: false,                      cor: '#e0e0e0', descricao: 'Zeros (8 pos)' },
    { nome: 'Número do Documento',             ini: 70,  fim: 82,  tamanho: 12, tipo: 'A', obrigatorio: false,                      cor: '#c5e1a5', descricao: 'Seu número — identificador da empresa (12 pos)' },
    { nome: 'Uso do Banco',                    ini: 82,  fim: 92,  tamanho: 10, tipo: 'A', obrigatorio: false,                      cor: '#f5f5f5', descricao: 'Uso interno banco (10 pos)' },
    { nome: 'Instrução / Uso do Banco',        ini: 92,  fim: 120, tamanho: 28, tipo: 'A', obrigatorio: false,                      cor: '#eceff1', descricao: 'Instrução livre / referência do banco (28 pos) — ex: I015043/U' },
    { nome: 'Data de Vencimento',              ini: 120, fim: 126, tamanho: 6,  tipo: 'N', obrigatorio: true,  formato: 'DDMMAA',   cor: '#fff9c4', descricao: 'Vencimento DDMMAA' },
    { nome: 'Valor do Título',                 ini: 126, fim: 139, tamanho: 13, tipo: 'N', obrigatorio: true,                       cor: '#ffab91', descricao: 'Valor em centavos (13 pos, 2 dec. implícitos)' },
    { nome: 'Banco Cobrador',                  ini: 139, fim: 142, tamanho: 3,  tipo: 'N', obrigatorio: false, valores: ['341','000'], cor: '#b3e5fc', descricao: '341 ou 000 (3 pos)' },
    { nome: 'Agência Cobradora',               ini: 142, fim: 147, tamanho: 5,  tipo: 'N', obrigatorio: false,                      cor: '#81d4fa', descricao: 'Agência cobradora (5 pos), 00000 se sem cobradora' },
    { nome: 'Espécie do Título',               ini: 147, fim: 149, tamanho: 2,  tipo: 'N', obrigatorio: true,
      valoresDescricao: { '01': 'Duplicata Mercantil', '02': 'Nota Promissória', '03': 'Nota de Seguro', '05': 'Recibo', '06': 'Letra de Câmbio', '07': 'Warrant', '08': 'Cheque', '09': 'Duplicata de Serviço', '10': 'Nota de Débito', '13': 'Nota de Caixa', '15': 'Boleto de Proposta', '99': 'Outros' },
      cor: '#bcaaa4', descricao: 'Código da espécie (2 pos)' },
    { nome: 'Identificação',                   ini: 149, fim: 150, tamanho: 1,  tipo: 'A', obrigatorio: true,  valores: ['N'],       cor: '#d7ccc8', descricao: 'N = Novo título (sempre N na entrada)' },
    { nome: 'Data de Emissão',                 ini: 150, fim: 156, tamanho: 6,  tipo: 'N', obrigatorio: true,  formato: 'DDMMAA',   cor: '#b2ebf2', descricao: 'Data emissão do título DDMMAA' },
    { nome: '1ª Instrução',                    ini: 156, fim: 158, tamanho: 2,  tipo: 'N', obrigatorio: true,
      valoresDescricao: { '00': 'Sem instrução', '06': 'Protestar após 2ª instrução dias', '07': 'Negativar', '09': 'Cancelar protesto/negativação', '17': 'Devolver após 2ª instrução dias', '18': 'Sustar protesto e baixar', '19': 'Sustar protesto e manter em carteira' },
      cor: '#b0bec5', descricao: '00=Sem instrução · 06=Protestar · 07=Negativar · 17=Devolver' },
    { nome: '2ª Instrução',                    ini: 158, fim: 160, tamanho: 2,  tipo: 'N', obrigatorio: true,                       cor: '#90a4ae', descricao: 'Número de dias para instrução (mín. 3 dias úteis após venc.)' },
    { nome: 'Mora por Dia',                    ini: 160, fim: 173, tamanho: 13, tipo: 'N', obrigatorio: false,                      cor: '#ffab91', descricao: 'Valor mora/dia em centavos (13 pos, 2 dec)' },
    { nome: 'Data Limite para Desconto',       ini: 173, fim: 179, tamanho: 6,  tipo: 'N', obrigatorio: false, formato: 'DDMMAA',   cor: '#fff59d', descricao: 'Data limite para desconto DDMMAA (zeros = sem desconto)' },
    { nome: 'Valor do Desconto',               ini: 179, fim: 192, tamanho: 13, tipo: 'N', obrigatorio: false,                      cor: '#80cbc4', descricao: 'Desconto em centavos (13 pos, 2 dec)' },
    { nome: 'Valor do IOF',                    ini: 192, fim: 205, tamanho: 13, tipo: 'N', obrigatorio: false,                      cor: '#a5d6a7', descricao: 'IOF em centavos (13 pos, 2 dec)' },
    { nome: 'Valor do Abatimento',             ini: 205, fim: 218, tamanho: 13, tipo: 'N', obrigatorio: false,                      cor: '#80deea', descricao: 'Abatimento em centavos (13 pos, 2 dec)' },
    { nome: 'Tipo Inscrição do Pagador',       ini: 218, fim: 220, tamanho: 2,  tipo: 'N', obrigatorio: true,
      valoresDescricao: { '01': 'CPF — Pessoa Física', '02': 'CNPJ — Pessoa Jurídica' },
      cor: '#e0f7fa', descricao: '01=CPF · 02=CNPJ (pos 219–220)' },
    { nome: 'CNPJ/CPF do Pagador',             ini: 220, fim: 234, tamanho: 14, tipo: 'N', obrigatorio: true,                       cor: '#90caf9', descricao: 'CNPJ (14) ou CPF (11 pos, zeros à esq.)' },
    { nome: 'Nome do Pagador',                 ini: 234, fim: 274, tamanho: 40, tipo: 'A', obrigatorio: true,                       cor: '#ffcc80', descricao: 'Razão Social ou Nome do Pagador (40 pos)' },
    { nome: 'Endereço do Pagador',             ini: 274, fim: 314, tamanho: 40, tipo: 'A', obrigatorio: true,                       cor: '#ffe0b2', descricao: 'Logradouro e número (40 pos)' },
    { nome: 'Bairro do Pagador',               ini: 314, fim: 326, tamanho: 12, tipo: 'A', obrigatorio: false,                      cor: '#e1bee7', descricao: 'Bairro (12 pos)' },
    { nome: 'CEP do Pagador',                  ini: 326, fim: 334, tamanho: 8,  tipo: 'N', obrigatorio: false,                      cor: '#c8e6c9', descricao: 'CEP apenas números (8 pos, ex: 01310100)' },
    { nome: 'Cidade do Pagador',               ini: 334, fim: 349, tamanho: 15, tipo: 'A', obrigatorio: false,                      cor: '#f8bbd0', descricao: 'Cidade (15 pos)' },
    { nome: 'UF do Pagador',                   ini: 349, fim: 351, tamanho: 2,  tipo: 'A', obrigatorio: false,                      cor: '#f48fb1', descricao: 'Sigla do estado (2 pos)' },
    { nome: 'Sacador / Avalista',              ini: 351, fim: 391, tamanho: 40, tipo: 'A', obrigatorio: false,                      cor: '#ce93d8', descricao: 'Nome do sacador/avalista ou mensagem livre (40 pos)' },
    { nome: 'Branco',                          ini: 391, fim: 394, tamanho: 3,  tipo: 'A', obrigatorio: false,                      cor: '#f5f5f5', descricao: 'Branco (3 pos)' },
    { nome: 'Sequencial do Registro',          ini: 394, fim: 400, tamanho: 6,  tipo: 'N', obrigatorio: true,                       cor: '#b2ebf2', descricao: 'Sequencial do registro' },
  ];

  // ========================================
  // LAYOUT TRAILER (TIPO 9) - ITAÚ CNAB 400
  // ========================================
  camposTrailer: CampoLayout[] = [
    { nome: 'Identificação do Registro', ini: 0,   fim: 1,   tamanho: 1,   tipo: 'N', obrigatorio: true,  valores: ['9'], cor: '#f8bbd0', descricao: 'Tipo 9 — Trailer' },
    { nome: 'Branco',                    ini: 1,   fim: 394, tamanho: 393, tipo: 'A', obrigatorio: false,               cor: '#f5f5f5', descricao: 'Branco (393 pos)' },
    { nome: 'Sequencial do Registro',    ini: 394, fim: 400, tamanho: 6,   tipo: 'N', obrigatorio: true,               cor: '#b2ebf2', descricao: 'Nº Sequencial do Último Registro' },
  ];

  // ===================================================
  // LAYOUT TIPO 5 — Registro Complementar do Sacado
  // Itaú CNAB 400: endereço/CNPJ do sacado/avalista
  // ===================================================
  camposTipo5: CampoLayout[] = [
    { nome: 'Identificação do Registro',    ini: 0,   fim: 1,   tamanho: 1,   tipo: 'N', obrigatorio: true,  valores: ['5'],                                                    cor: '#f8bbd0', descricao: 'Tipo 5 — Registro Complementar do Sacado' },
    { nome: 'Tipo Inscrição do Sacado',     ini: 1,   fim: 2,   tamanho: 1,   tipo: 'N', obrigatorio: false, valoresDescricao: { '1': 'CPF', '2': 'CNPJ', '5': 'Isento/N.Id.' }, cor: '#ffe082', descricao: '1=CPF · 2=CNPJ · 5=Isento/Não identificado' },
    { nome: 'Branco',                       ini: 2,   fim: 121, tamanho: 119, tipo: 'A', obrigatorio: false,                                                                    cor: '#f5f5f5', descricao: 'Branco (119 pos)' },
    { nome: 'Tipo Inscrição Complementar',  ini: 121, fim: 123, tamanho: 2,   tipo: 'N', obrigatorio: false, valoresDescricao: { '00': 'Isento', '01': 'CPF', '02': 'CNPJ', '04': 'Isento/Estrang.' }, cor: '#ffe082', descricao: '01=CPF · 02=CNPJ · 04=Isento/Estrangeiro' },
    { nome: 'CNPJ/CPF do Sacado',           ini: 123, fim: 137, tamanho: 14,  tipo: 'N', obrigatorio: false,                                                                    cor: '#b2dfdb', descricao: 'CNPJ (14 dígitos) ou CPF (11 dígitos, zeros à esq.)' },
    { nome: 'Endereço do Sacado',           ini: 137, fim: 177, tamanho: 40,  tipo: 'A', obrigatorio: false,                                                                    cor: '#ffe0b2', descricao: 'Logradouro e número do sacado/avalista (40 pos)' },
    { nome: 'Bairro do Sacado',             ini: 177, fim: 189, tamanho: 12,  tipo: 'A', obrigatorio: false,                                                                    cor: '#e1bee7', descricao: 'Bairro do sacado/avalista (12 pos)' },
    { nome: 'CEP do Sacado',                ini: 189, fim: 197, tamanho: 8,   tipo: 'N', obrigatorio: false,                                                                    cor: '#c8e6c9', descricao: 'CEP apenas dígitos, sem hífen (8 pos)' },
    { nome: 'Cidade do Sacado',             ini: 197, fim: 212, tamanho: 15,  tipo: 'A', obrigatorio: false,                                                                    cor: '#f8bbd0', descricao: 'Cidade do sacado/avalista (15 pos)' },
    { nome: 'UF do Sacado',                 ini: 212, fim: 214, tamanho: 2,   tipo: 'A', obrigatorio: false,                                                                    cor: '#f48fb1', descricao: 'Sigla do estado (2 pos)' },
    { nome: 'Branco',                       ini: 214, fim: 394, tamanho: 180, tipo: 'A', obrigatorio: false,                                                                    cor: '#f5f5f5', descricao: 'Branco (180 pos)' },
    { nome: 'Sequencial do Registro',       ini: 394, fim: 400, tamanho: 6,   tipo: 'N', obrigatorio: true,                                                                     cor: '#b2ebf2', descricao: 'Nº sequencial do registro' },
  ];

  readonly codigosOcorrencia: { codigo: string; descricao: string }[] = [
    { codigo: '01', descricao: 'Remessa — Entrada de Título' },
    { codigo: '02', descricao: 'Pedido de Baixa' },
    { codigo: '04', descricao: 'Concessão de Abatimento' },
    { codigo: '05', descricao: 'Cancelamento de Abatimento' },
    { codigo: '06', descricao: 'Alteração de Vencimento' },
    { codigo: '07', descricao: 'Alteração do Valor do Título' },
    { codigo: '08', descricao: 'Alteração do Número de Controle' },
    { codigo: '09', descricao: 'Pedido de Protesto' },
    { codigo: '10', descricao: 'Sustação / Cancelamento de Protesto' },
    { codigo: '11', descricao: 'Instrução para Negativar' },
    { codigo: '12', descricao: 'Exclusão da Negativação' },
    { codigo: '31', descricao: 'Alteração de Outros Dados' },
  ];

  get campoEhOcorrencia(): boolean {
    return this.campoAtivo?.nome.toLowerCase().includes('ocorr') ?? false;
  }

  get descricaoOcorrencia(): string {
    return this.codigosOcorrencia.find(o => o.codigo === this.valorCampoAtivo.trim())?.descricao ?? '';
  }

  selecionarOcorrencia(codigo: string): void {
    this.valorCampoAtivo = codigo;
  }

  get campoTemLookup(): boolean {
    return !!(this.campoAtivo?.valoresDescricao) && !this.campoEhOcorrencia;
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
    if (tipo === '5') return this.camposTipo5;
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

  gerarRemessa(): void {
    const conteudo = this.linhasEditadas.join('\r\n');
    const bytes = new Uint8Array(conteudo.length);
    for (let i = 0; i < conteudo.length; i++) bytes[i] = conteudo.charCodeAt(i) & 0xff;
    const blob = new Blob([bytes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'remessa_itau.REM';
    a.click();
    URL.revokeObjectURL(url);
  }

  onFileChange(event: Event) {
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
    this.totaisRemessa = null;
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
        this.error = 'Erro ao processar o arquivo. Verifique se é um arquivo CNAB 400 válido.';
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
    this.calcularTotais();
  }

  calcularTotais(): void {
    const detalhes = this.linhasEditadas.filter(l => l[0] === '1');
    if (detalhes.length === 0) { this.totaisRemessa = null; return; }
    let valorFace = 0, valorDesconto = 0, valorAbatimento = 0, valorIOF = 0;
    for (const l of detalhes) {
      valorFace      += parseInt(l.substring(126, 139) || '0', 10);
      valorDesconto  += parseInt(l.substring(179, 192) || '0', 10);
      valorIOF       += parseInt(l.substring(192, 205) || '0', 10);
      valorAbatimento+= parseInt(l.substring(205, 218) || '0', 10);
    }
    this.totaisRemessa = { totalBoletos: detalhes.length, valorFace, valorDesconto, valorAbatimento, valorIOF };
  }

  formatarReais(centavos: number): string {
    return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  validarEHighlight(content: string): string {
    const lines = content.split(/\r?\n/).filter(l => l.length > 0);
    if (lines.length === 0) { this.error = 'Arquivo vazio ou sem linhas válidas.'; return ''; }
    this.estatisticas = { totalLinhas: lines.length, headers: 0, tipo1: 0, tipo5: 0, trailers: 0, desconhecidos: 0 };
    let sequenciaEsperada = 1;

    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];
      const tipo = line[0];
      let campos: CampoLayout[];

      switch (tipo) {
        case '0': campos = this.camposHeader;  this.estatisticas.headers++; break;
        case '1': campos = this.camposDetalhe; this.estatisticas.tipo1++;   break;
        case '9': campos = this.camposTrailer; this.estatisticas.trailers++; break;
        case '5':
          campos = this.camposTipo5;
          this.estatisticas.tipo5++;
          break;
        default:
          campos = [];
          this.estatisticas.desconhecidos++;
          this.erros.push({
            linha: idx + 1, campo: 'Tipo Registro', posicao: '1', valor: tipo,
            mensagem: `Tipo de registro desconhecido: "${tipo}". Tipos válidos: 0 (Header), 1 (Detalhe), 5 (Compl. Sacado), 9 (Trailer)`,
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
    if (this.estatisticas.tipo1 === 0) {
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
      case '0': campos = this.camposHeader;  tipoNome = 'Header';           tipoColor = '#7b1fa2'; break;
      case '1': campos = this.camposDetalhe; tipoNome = 'Detalhe';          tipoColor = '#388e3c'; break;
      case '5': campos = this.camposTipo5;   tipoNome = 'Compl. Sacado';    tipoColor = '#f57c00'; break;
      case '9': campos = this.camposTrailer; tipoNome = 'Trailer';          tipoColor = '#c2185b'; break;
      default:  campos = [];                 tipoNome = 'Desconhecido'; tipoColor = '#d32f2f';
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
