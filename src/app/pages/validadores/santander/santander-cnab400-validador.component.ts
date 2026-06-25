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
  trailers: number;
  desconhecidos: number;
}

@Component({
  selector: 'app-santander-cnab400-validador',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './santander-cnab400-validador.component.html',
  styleUrls: ['./santander-cnab400-validador.component.css']
})
export class SantanderCnab400ValidadorComponent implements OnDestroy {
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
    comDesconto: number;
    semDesconto: number;
  } | null = null;

  private _hlStyle: HTMLStyleElement | null = null;

  constructor(private sanitizer: DomSanitizer) {
    this._inicializarLegenda();
  }

  private _inicializarLegenda(): void {
    const todos = [...this.camposHeader, ...this.camposDetalhe, ...this.camposTrailer];
    this.legendaCampos = todos.filter((c, i, self) => self.findIndex(x => x.nome === c.nome) === i);
  }

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
      .cnab-mw .cnab-mc.${cls} { opacity: 1 !important; outline: 2px solid #c82333 !important; outline-offset: -1px; }
    `;
    document.head.appendChild(this._hlStyle);
  }

  // ================================================
  // HEADER (TIPO 0) — Santander CNAB 400 Remessa
  // ================================================
  camposHeader: CampoLayout[] = [
    { nome: 'Identificação do Registro', ini: 0, fim: 1, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['0'], cor: '#f8bbd0', descricao: 'Tipo 0 — Header' },
    { nome: 'Identificação do Arquivo Remessa', ini: 1, fim: 2, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['1'], cor: '#ffe082', descricao: '1 = Remessa' },
    { nome: 'Literal REMESSA', ini: 2, fim: 9, tamanho: 7, tipo: 'A', obrigatorio: true, valores: ['REMESSA'], cor: '#b2dfdb', descricao: 'Literal REMESSA (7 pos)' },
    { nome: 'Código de Serviço', ini: 9, fim: 11, tamanho: 2, tipo: 'N', obrigatorio: true, valores: ['01'], cor: '#c5cae9', descricao: '01 = Cobrança' },
    { nome: 'Literal COBRANCA', ini: 11, fim: 19, tamanho: 8, tipo: 'A', obrigatorio: true, valores: ['COBRANCA'], cor: '#e1bee7', descricao: 'Literal COBRANCA (8 pos)' },
    { nome: 'Branco', ini: 19, fim: 26, tamanho: 7, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Branco (7 pos)' },
    { nome: 'Agência Cedente', ini: 26, fim: 30, tamanho: 4, tipo: 'N', obrigatorio: true, cor: '#b3e5fc', descricao: 'Agência do cedente (4 pos)' },
    { nome: 'Dígito da Agência', ini: 30, fim: 31, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#81d4fa', descricao: 'Dígito verificador da agência' },
    { nome: 'Conta Corrente', ini: 31, fim: 37, tamanho: 6, tipo: 'N', obrigatorio: true, cor: '#a5d6a7', descricao: 'Conta corrente do cedente (6 pos)' },
    { nome: 'Dígito da Conta', ini: 37, fim: 38, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#81c784', descricao: 'Dígito verificador da conta' },
    { nome: 'Branco', ini: 38, fim: 39, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Branco (1 pos)' },
    { nome: 'Código do Cedente', ini: 39, fim: 46, tamanho: 7, tipo: 'N', obrigatorio: true, cor: '#ffccbc', descricao: 'Código do cedente no banco (7 pos)' },
    { nome: 'Nome da Empresa', ini: 46, fim: 76, tamanho: 30, tipo: 'A', obrigatorio: true, cor: '#ffecb3', descricao: 'Razão social do cedente (30 pos)' },
    { nome: 'Código do Banco na Câmara', ini: 76, fim: 79, tamanho: 3, tipo: 'N', obrigatorio: true, valores: ['033'], cor: '#ef9a9a', descricao: 'Santander = 033' },
    { nome: 'Nome do Banco', ini: 79, fim: 94, tamanho: 15, tipo: 'A', obrigatorio: true, cor: '#f48fb1', descricao: 'SANTANDER (15 pos)' },
    { nome: 'Data de Geração do Arquivo', ini: 94, fim: 100, tamanho: 6, tipo: 'N', obrigatorio: true, formato: 'DDMMAA', cor: '#fff9c4', descricao: 'Data gravação DDMMAA' },
    { nome: 'Nº Sequencial de Remessa', ini: 100, fim: 107, tamanho: 7, tipo: 'N', obrigatorio: false, cor: '#b2ebf2', descricao: 'Sequencial do arquivo (7 pos)' },
    { nome: 'Branco', ini: 107, fim: 394, tamanho: 287, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Branco (287 pos)' },
    { nome: 'Nº Sequencial do Registro', ini: 394, fim: 400, tamanho: 6, tipo: 'N', obrigatorio: true, valores: ['000001'], cor: '#ce93d8', descricao: 'Deve ser 000001 no header' },
  ];

  // ================================================
  // DETALHE (TIPO 1) — Santander CNAB 400 Remessa
  // ================================================
  camposDetalhe: CampoLayout[] = [
    { nome: 'Identificação do Registro', ini: 0, fim: 1, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['1'], cor: '#f8bbd0', descricao: 'Tipo 1 — Detalhe' },
    { nome: 'Tipo de Inscrição da Empresa', ini: 1, fim: 3, tamanho: 2, tipo: 'N', obrigatorio: true, valores: ['01', '02'], valoresDescricao: { '01': 'CPF — Pessoa Física', '02': 'CNPJ — Pessoa Jurídica' }, cor: '#ffe082', descricao: '01=CPF, 02=CNPJ' },
    { nome: 'Nº de Inscrição da Empresa (CNPJ/CPF)', ini: 3, fim: 17, tamanho: 14, tipo: 'N', obrigatorio: true, cor: '#b2dfdb', descricao: 'CNPJ (14 pos) ou CPF zerado à esquerda' },
    { nome: 'Agência', ini: 17, fim: 21, tamanho: 4, tipo: 'N', obrigatorio: true, cor: '#b3e5fc', descricao: 'Agência do cedente (4 pos)' },
    { nome: 'Dígito da Agência', ini: 21, fim: 22, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#81d4fa', descricao: 'Dígito verificador da agência' },
    { nome: 'Conta Corrente', ini: 22, fim: 28, tamanho: 6, tipo: 'N', obrigatorio: true, cor: '#a5d6a7', descricao: 'Conta corrente (6 pos)' },
    { nome: 'Dígito da Conta', ini: 28, fim: 29, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#81c784', descricao: 'Dígito verificador da conta' },
    { nome: 'Branco', ini: 29, fim: 31, tamanho: 2, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Branco (2 pos)' },
    { nome: 'Nosso Número', ini: 31, fim: 38, tamanho: 7, tipo: 'N', obrigatorio: true, cor: '#ffccbc', descricao: 'Nosso número sem dígito (7 pos)' },
    { nome: 'Dígito do Nosso Número', ini: 38, fim: 39, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#ffab91', descricao: 'Dígito verificador do nosso número' },
    { nome: 'Branco', ini: 39, fim: 40, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Branco (1 pos)' },
    { nome: 'Carteira', ini: 40, fim: 41, tamanho: 1, tipo: 'A', obrigatorio: true, cor: '#c5cae9', descricao: 'Código da carteira' },
    { nome: 'Variação da Carteira', ini: 41, fim: 45, tamanho: 4, tipo: 'N', obrigatorio: false, cor: '#9fa8da', descricao: 'Variação da carteira (4 pos)' },
    { nome: 'Número do Documento (Empresa)', ini: 45, fim: 62, tamanho: 17, tipo: 'A', obrigatorio: false, cor: '#e1bee7', descricao: 'Nº documento da empresa (17 pos)' },
    { nome: 'Condição de Emissão da Papeleta', ini: 62, fim: 63, tamanho: 1, tipo: 'N', obrigatorio: false, valores: ['1', '2', '4'], valoresDescricao: { '1': 'Banco emite o boleto', '2': 'Cliente (cedente) emite o boleto', '4': 'Banco emite o boleto pré-datado' }, cor: '#ce93d8', descricao: '1 = banco emite · 2 = cliente emite · 4 = banco emite pré-datado' },
    { nome: 'Ident. se Emite Boleto p/ Débito Automático', ini: 63, fim: 64, tamanho: 1, tipo: 'N', obrigatorio: false, valores: ['1', '2'], valoresDescricao: { '1': 'Emite boleto para débito automático', '2': 'Não emite boleto para débito automático' }, cor: '#ba68c8', descricao: '1 = emite boleto p/ débito automático · 2 = não emite' },
    { nome: 'Uso do Banco', ini: 64, fim: 72, tamanho: 8, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Branco / uso interno do banco (8 pos)' },
    { nome: 'Nº do Documento (Complemento)', ini: 72, fim: 92, tamanho: 20, tipo: 'A', obrigatorio: false, cor: '#dcedc8', descricao: 'Número do documento complementar (20 pos)' },
    { nome: 'Data de Vencimento do Título', ini: 92, fim: 98, tamanho: 6, tipo: 'N', obrigatorio: true, formato: 'DDMMAA', cor: '#fff9c4', descricao: 'Vencimento DDMMAA' },
    { nome: 'Valor do Título', ini: 98, fim: 111, tamanho: 13, tipo: 'N', obrigatorio: true, cor: '#ef9a9a', descricao: 'Valor em centavos (13 pos)' },
    { nome: 'Banco Cobrador', ini: 111, fim: 114, tamanho: 3, tipo: 'N', obrigatorio: false, valores: ['033', '000'], cor: '#ef9a9a', descricao: '033 = Santander' },
    { nome: 'Agência Cobradora', ini: 114, fim: 119, tamanho: 5, tipo: 'N', obrigatorio: false, cor: '#ffcdd2', descricao: 'Agência encarregada da cobrança (5 pos)' },
    { nome: 'Espécie do Título', ini: 119, fim: 121, tamanho: 2, tipo: 'N', obrigatorio: false, cor: '#bcaaa4', descricao: '01=Duplicata, 02=NP, 08=Letra de Câmbio, etc.' },
    { nome: 'Identificação', ini: 121, fim: 122, tamanho: 1, tipo: 'A', obrigatorio: false, valores: ['N', 'R'], valoresDescricao: { 'N': 'Novo título', 'R': 'Renovação / alteração' }, cor: '#d7ccc8', descricao: 'N=novo título, R=renovação' },
    { nome: 'Data de Emissão do Título', ini: 122, fim: 128, tamanho: 6, tipo: 'N', obrigatorio: true, formato: 'DDMMAA', cor: '#b2ebf2', descricao: 'Emissão DDMMAA' },
    { nome: '1ª Instrução', ini: 128, fim: 130, tamanho: 2, tipo: 'N', obrigatorio: false, cor: '#b0bec5', descricao: 'Código instrução (ver tabela Santander)' },
    { nome: '2ª Instrução', ini: 130, fim: 132, tamanho: 2, tipo: 'N', obrigatorio: false, cor: '#90a4ae', descricao: 'Código instrução (ver tabela Santander)' },
    { nome: 'Valor de Mora por Dia', ini: 132, fim: 139, tamanho: 7, tipo: 'N', obrigatorio: false, cor: '#ffab91', descricao: 'Mora em centavos por dia (7 pos)' },
    { nome: 'Data Limite para Concessão de Desconto', ini: 139, fim: 145, tamanho: 6, tipo: 'N', obrigatorio: false, formato: 'DDMMAA', cor: '#fff59d', descricao: 'Data limite desconto DDMMAA (0=sem desconto)' },
    { nome: 'Valor do Desconto', ini: 145, fim: 152, tamanho: 7, tipo: 'N', obrigatorio: false, cor: '#80cbc4', descricao: 'Desconto em centavos (7 pos)' },
    { nome: 'Valor do IOF', ini: 152, fim: 165, tamanho: 13, tipo: 'N', obrigatorio: false, cor: '#4db6ac', descricao: 'IOF em centavos — zeros se não houver (13 pos)' },
    { nome: 'Valor do Abatimento', ini: 165, fim: 178, tamanho: 13, tipo: 'N', obrigatorio: false, cor: '#a5d6a7', descricao: 'Abatimento em centavos (13 pos)' },
    { nome: 'Tipo de Inscrição do Pagador', ini: 178, fim: 180, tamanho: 2, tipo: 'N', obrigatorio: true, valores: ['01', '02'], valoresDescricao: { '01': 'CPF — Pessoa Física', '02': 'CNPJ — Pessoa Jurídica' }, cor: '#e0f7fa', descricao: '01=CPF, 02=CNPJ' },
    { nome: 'Nº de Inscrição do Pagador (CNPJ/CPF)', ini: 180, fim: 194, tamanho: 14, tipo: 'N', obrigatorio: true, cor: '#90caf9', descricao: 'CNPJ ou CPF do pagador (14 pos)' },
    { nome: 'Nome do Pagador', ini: 194, fim: 234, tamanho: 40, tipo: 'A', obrigatorio: true, cor: '#ffcc80', descricao: 'Nome do pagador (40 pos)' },
    { nome: 'Endereço do Pagador', ini: 234, fim: 274, tamanho: 40, tipo: 'A', obrigatorio: true, cor: '#ffe0b2', descricao: 'Logradouro do pagador (40 pos)' },
    { nome: 'Bairro do Pagador', ini: 274, fim: 284, tamanho: 10, tipo: 'A', obrigatorio: false, cor: '#e1bee7', descricao: 'Bairro do pagador (10 pos)' },
    { nome: 'CEP', ini: 284, fim: 289, tamanho: 5, tipo: 'N', obrigatorio: true, cor: '#c8e6c9', descricao: 'CEP sem hífen — parte inicial (5 pos)' },
    { nome: 'Sufixo do CEP', ini: 289, fim: 292, tamanho: 3, tipo: 'N', obrigatorio: true, cor: '#a5d6a7', descricao: 'CEP — sufixo (3 pos)' },
    { nome: 'Cidade do Pagador', ini: 292, fim: 302, tamanho: 10, tipo: 'A', obrigatorio: false, cor: '#9ccc65', descricao: 'Cidade do pagador (10 pos)' },
    { nome: 'UF do Pagador', ini: 302, fim: 304, tamanho: 2, tipo: 'A', obrigatorio: false, cor: '#8bc34a', descricao: 'Estado (UF) do pagador (2 pos)' },
    { nome: 'Sacador/Avalista ou Uso do Banco', ini: 304, fim: 394, tamanho: 90, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Sacador/Avalista ou brancos (90 pos)' },
    { nome: 'Nº Sequencial do Registro', ini: 394, fim: 400, tamanho: 6, tipo: 'N', obrigatorio: true, cor: '#ce93d8', descricao: 'Número sequencial do registro' },
  ];

  // ================================================
  // TRAILER (TIPO 9) — Santander CNAB 400 Remessa
  // ================================================
  camposTrailer: CampoLayout[] = [
    { nome: 'Identificação do Registro', ini: 0, fim: 1, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['9'], cor: '#f8bbd0', descricao: 'Tipo 9 — Trailer' },
    { nome: 'Quantidade de Registros de Detalhe', ini: 1, fim: 7, tamanho: 6, tipo: 'N', obrigatorio: false, cor: '#ffe082', descricao: 'Total de registros tipo 1 (6 pos)' },
    { nome: 'Valor Total dos Títulos', ini: 7, fim: 20, tamanho: 13, tipo: 'N', obrigatorio: false, cor: '#b2dfdb', descricao: 'Soma dos valores em centavos (13 pos)' },
    { nome: 'Branco', ini: 20, fim: 394, tamanho: 374, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Branco (374 pos)' },
    { nome: 'Nº Sequencial do Registro', ini: 394, fim: 400, tamanho: 6, tipo: 'N', obrigatorio: true, cor: '#ce93d8', descricao: 'Número sequencial do último registro' },
  ];

  readonly codigosInstrucao: { codigo: string; descricao: string }[] = [
    { codigo: '00', descricao: 'Sem instrução' },
    { codigo: '01', descricao: 'Protestar após X dias corridos do vencimento' },
    { codigo: '02', descricao: 'Devolver após X dias corridos do vencimento' },
    { codigo: '04', descricao: 'Não protestar' },
    { codigo: '07', descricao: 'Protestar após X dias úteis do vencimento' },
    { codigo: '08', descricao: 'Negativar' },
    { codigo: '09', descricao: 'Não negativar' },
    { codigo: '12', descricao: 'Alteração de vencimento' },
    { codigo: '18', descricao: 'Sustar protesto e dar baixa' },
    { codigo: '19', descricao: 'Sustar protesto e manter em carteira' },
    { codigo: '23', descricao: 'Não cobrar juros de mora' },
    { codigo: '25', descricao: 'Dispensar prazo limite de protesto' },
    { codigo: '38', descricao: 'Protestar título vencido (Santander)' },
  ];

  readonly codigosOcorrencia: { codigo: string; descricao: string }[] = [
    { codigo: '01', descricao: 'Remessa — Entrada de Título' },
    { codigo: '02', descricao: 'Pedido de Baixa' },
    { codigo: '04', descricao: 'Concessão de Abatimento' },
    { codigo: '05', descricao: 'Cancelamento de Abatimento' },
    { codigo: '06', descricao: 'Alteração de Vencimento' },
    { codigo: '07', descricao: 'Alteração de Dados' },
    { codigo: '09', descricao: 'Protestar' },
    { codigo: '10', descricao: 'Sustar Protesto e Baixar' },
    { codigo: '11', descricao: 'Sustar Protesto e Manter em Carteira' },
    { codigo: '12', descricao: 'Alteração de Juros de Mora' },
    { codigo: '31', descricao: 'Alteração de Outros Dados' },
    { codigo: '38', descricao: 'Cobrar Multa' },
    { codigo: '48', descricao: 'Dispensar Cobrança de Multa' },
  ];

  get campoTemLookup(): boolean {
    return !!(this.campoAtivo?.valoresDescricao) && !this.campoEhInstrucao && !this.campoEhOcorrencia;
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

  get campoEhInstrucao(): boolean {
    return !!this.campoAtivo?.nome.toLowerCase().includes('instrução') ||
           !!this.campoAtivo?.nome.toLowerCase().includes('instrucao');
  }

  get campoEhOcorrencia(): boolean {
    const nome = this.campoAtivo?.nome.toLowerCase() ?? '';
    return nome.includes('código') && nome.includes('ocorr');
  }

  get descricaoOcorrencia(): string {
    return this.codigosOcorrencia.find(o => o.codigo === this.valorCampoAtivo.trim())?.descricao ?? '';
  }

  selecionarInstrucao(codigo: string): void { this.valorCampoAtivo = codigo; }
  selecionarOcorrencia(codigo: string): void { this.valorCampoAtivo = codigo; }

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

    let valorFace = 0, valorDesconto = 0, valorAbatimento = 0;
    let comDesconto = 0, semDesconto = 0;

    for (const l of detalhes) {
      valorFace      += parseInt(l.substring(98, 111)  || '0', 10);
      valorDesconto  += parseInt(l.substring(145, 152) || '0', 10);
      valorAbatimento+= parseInt(l.substring(165, 178) || '0', 10);
      const descVal = parseInt(l.substring(145, 152) || '0', 10);
      descVal > 0 ? comDesconto++ : semDesconto++;
    }

    this.totaisRemessa = {
      totalBoletos: detalhes.length,
      valorFace, valorDesconto, valorAbatimento,
      comDesconto, semDesconto
    };
  }

  formatarReais(centavos: number): string {
    return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  fecharEditor(): void {
    this.campoAtivo = null;
    this.editorPos = null;
    this.statusBar = '';
    this._hlStyle?.remove();
    this._hlStyle = null;
    this.campoSelecionado = null;
  }

  private camposParaLinha(li: number): CampoLayout[] {
    const tipo = this.linhasEditadas[li]?.[0];
    if (tipo === '0') return this.camposHeader;
    if (tipo === '1') return this.camposDetalhe;
    if (tipo === '9') return this.camposTrailer;
    return [];
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
    a.download = 'remessa_santander_editada.REM';
    a.click();
    URL.revokeObjectURL(url);
  }

  validarEHighlight(content: string): string {
    const lines = content.split(/\r?\n/).filter(l => l.length > 0);
    if (lines.length === 0) { this.error = 'Arquivo vazio ou sem linhas válidas.'; return ''; }

    this.estatisticas = { totalLinhas: lines.length, headers: 0, tipo1: 0, trailers: 0, desconhecidos: 0 };
    let sequenciaEsperada = 1;

    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];
      const tipo = line[0];
      let campos: CampoLayout[];

      switch (tipo) {
        case '0': campos = this.camposHeader;  this.estatisticas.headers++; break;
        case '1': campos = this.camposDetalhe; this.estatisticas.tipo1++;   break;
        case '9': campos = this.camposTrailer; this.estatisticas.trailers++; break;
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
          linha: idx + 1, campo: 'Linha', posicao: `1-${line.length}`,
          valor: `${line.length} caracteres`,
          mensagem: `Tamanho inválido. Esperado: 400, Encontrado: ${line.length}`,
          severidade: 'erro'
        });
      }

      for (const campo of campos) {
        const valor = line.slice(campo.ini, campo.fim);
        this.validarCampo(idx + 1, campo, valor);
      }

      const seqCampo = campos.find(c => c.ini === 394 && c.fim === 400);
      if (seqCampo && line.length >= 400) {
        const valorSeq = line.slice(394, 400).trim();
        const sequenciaAtual = parseInt(valorSeq, 10);
        if (!isNaN(sequenciaAtual) && sequenciaAtual !== sequenciaEsperada) {
          this.erros.push({
            linha: idx + 1, campo: 'Seq. Registro', posicao: '395-400', valor: valorSeq,
            mensagem: `Sequência incorreta. Esperado: ${String(sequenciaEsperada).padStart(6, '0')}, Encontrado: ${valorSeq}`,
            severidade: 'aviso'
          });
        }
        sequenciaEsperada++;
      }
    }

    this.validarEstrutura();

    const todosCampos = [...this.camposHeader, ...this.camposDetalhe, ...this.camposTrailer];
    this.legendaCampos = todosCampos.filter(
      (c, i, self) => self.findIndex(x => x.nome === c.nome) === i
    );

    return `<div class="cnab-mw">${lines.map((line, idx) => this.lineToMatrix(line, idx)).join('')}</div>`;
  }

  validarEstrutura(): void {
    if (!this.estatisticas) return;
    if (this.estatisticas.headers === 0) {
      this.erros.push({ linha: 0, campo: 'Estrutura', posicao: '-', valor: '-', mensagem: 'Arquivo deve ter pelo menos um Header (Tipo 0)', severidade: 'erro' });
    }
    if (this.estatisticas.trailers === 0) {
      this.erros.push({ linha: 0, campo: 'Estrutura', posicao: '-', valor: '-', mensagem: 'Arquivo deve ter pelo menos um Trailer (Tipo 9)', severidade: 'erro' });
    }
    if (this.estatisticas.tipo1 === 0) {
      this.erros.push({ linha: 0, campo: 'Estrutura', posicao: '-', valor: '-', mensagem: 'Aviso: Arquivo não contém registros de Detalhe (Tipo 1)', severidade: 'aviso' });
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
        this.erros.push({ linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor, mensagem: 'Campo numérico contém espaços. Preencher com zeros à esquerda.', severidade: 'erro' });
      }
      if (!/^\d+$/.test(valor)) {
        this.erros.push({ linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor, mensagem: 'Deve conter apenas dígitos (0-9)', severidade: 'erro' });
      }
    }

    if (campo.valores && valorTrim !== '') {
      if (!campo.valores.includes(valorTrim)) {
        this.erros.push({
          linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor,
          mensagem: `Valor inválido. Permitidos: ${campo.valores.join(', ')}`,
          severidade: 'erro'
        });
      }
    }

    if (campo.formato === 'DDMMAA' && valorTrim !== '' && valorTrim !== '000000') {
      if (/^\d{6}$/.test(valor)) {
        const dia = parseInt(valor.slice(0, 2), 10);
        const mes = parseInt(valor.slice(2, 4), 10);
        if (dia < 1 || dia > 31) {
          this.erros.push({ linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor, mensagem: `Dia inválido: ${dia}`, severidade: 'erro' });
        }
        if (mes < 1 || mes > 12) {
          this.erros.push({ linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor, mensagem: `Mês inválido: ${mes}`, severidade: 'erro' });
        }
      }
    }
  }

  lineToMatrix(line: string, lineIdx: number): string {
    const tipo = line[0];
    let campos: CampoLayout[];
    let tipoNome = '';
    let tipoColor = '';

    switch (tipo) {
      case '0': campos = this.camposHeader;  tipoNome = 'Header';  tipoColor = '#c2185b'; break;
      case '1': campos = this.camposDetalhe; tipoNome = 'Detalhe'; tipoColor = '#e53935'; break;
      case '9': campos = this.camposTrailer; tipoNome = 'Trailer'; tipoColor = '#6a1c1c'; break;
      default:  campos = []; tipoNome = 'Desconhecido'; tipoColor = '#d32f2f';
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
