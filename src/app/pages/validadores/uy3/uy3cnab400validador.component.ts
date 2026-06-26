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
  tipo7: number;
  tipo8: number;
  trailers: number;
  desconhecidos: number;
}

@Component({
  selector: 'app-uy3-cnab400-validador',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './uy3cnab400validador.component.html',
  styleUrls: ['./uy3cnab400validador.component.css']
})
export class Uy3Cnab400ValidadorComponent implements OnDestroy {
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
    comMulta: number;
    semMulta: number;
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
  // LAYOUT HEADER (TIPO 0) - UY3 CNAB 400
  // ========================================
  camposHeader: CampoLayout[] = [
    { nome: 'Identificação do Registro', ini: 0, fim: 1, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['0'], cor: '#f8bbd0', descricao: 'Tipo 0 — Header' },
    { nome: 'Identificação do Arquivo-Remessa', ini: 1, fim: 2, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['1'], cor: '#ffe082', descricao: 'Remessa = 1' },
    { nome: 'Literal Remessa', ini: 2, fim: 9, tamanho: 7, tipo: 'A', obrigatorio: true, valores: ['REMESSA'], cor: '#b2dfdb', descricao: 'Literal REMESSA (7 pos)' },
    { nome: 'Código de Serviço', ini: 9, fim: 11, tamanho: 2, tipo: 'N', obrigatorio: true, valores: ['01'], cor: '#c5cae9', descricao: '01 = Cobrança' },
    { nome: 'Literal Serviço', ini: 11, fim: 26, tamanho: 15, tipo: 'A', obrigatorio: true, valores: ['COBRANCA'], cor: '#e1bee7', descricao: 'COBRANCA (15 pos)' },
    { nome: 'Código do Convênio', ini: 26, fim: 46, tamanho: 20, tipo: 'N', obrigatorio: true, cor: '#b3e5fc', descricao: 'Código fornecido pela UY3 (20 pos)' },
    { nome: 'Nome da Empresa', ini: 46, fim: 76, tamanho: 30, tipo: 'A', obrigatorio: true, cor: '#ffecb3', descricao: 'Razão Social (30 pos)' },
    { nome: 'Número UY3 na Câmara', ini: 76, fim: 79, tamanho: 3, tipo: 'N', obrigatorio: true, valores: ['457'], cor: '#ffccbc', descricao: 'Código UY3 = 457' },
    { nome: 'Nome do Banco', ini: 79, fim: 94, tamanho: 15, tipo: 'A', obrigatorio: true, cor: '#dcedc8', descricao: 'UY3 (15 pos)' },
    { nome: 'Data do Arquivo', ini: 94, fim: 100, tamanho: 6, tipo: 'N', obrigatorio: true, formato: 'DDMMAA', cor: '#fff9c4', descricao: 'Data Gravação DDMMAA' },
    { nome: 'Branco', ini: 100, fim: 108, tamanho: 8, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Branco (8 pos)' },
    { nome: 'Identificação do Sistema', ini: 108, fim: 110, tamanho: 2, tipo: 'A', obrigatorio: true, valores: ['MX'], cor: '#b2ebf2', descricao: 'Sistema MX (2 pos)' },
    { nome: 'Nº Sequencial de Remessa', ini: 110, fim: 117, tamanho: 7, tipo: 'N', obrigatorio: true, cor: '#ffcdd2', descricao: 'Sequencial crescente (7 pos)' },
    { nome: 'Branco', ini: 117, fim: 394, tamanho: 277, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Branco (277 pos)' },
    { nome: 'Nº Sequencial do Registro', ini: 394, fim: 400, tamanho: 6, tipo: 'N', obrigatorio: true, valores: ['000001'], cor: '#b2ebf2', descricao: 'Sempre 000001 no Header' },
  ];

  // ========================================
  // LAYOUT DETALHE (TIPO 1) - UY3 CNAB 400
  // ========================================
  camposDetalhe: CampoLayout[] = [
    { nome: 'Identificação do Registro', ini: 0, fim: 1, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['1'], cor: '#f8bbd0', descricao: 'Tipo 1 — Detalhe' },
    { nome: 'Branco', ini: 1, fim: 20, tamanho: 19, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Branco (19 pos)' },
    { nome: 'Zero', ini: 20, fim: 21, tamanho: 1, tipo: 'A', obrigatorio: true, valores: ['0'], cor: '#e0e0e0', descricao: 'Zero fixo (1 pos)' },
    { nome: 'Código da Carteira', ini: 21, fim: 24, tamanho: 3, tipo: 'N', obrigatorio: true, cor: '#c5cae9', descricao: 'Número da carteira (3 pos)' },
    { nome: 'Código da Agência', ini: 24, fim: 29, tamanho: 5, tipo: 'N', obrigatorio: true, cor: '#ffe082', descricao: 'Agência sem dígito (5 pos)' },
    { nome: 'Conta Corrente do Beneficiário', ini: 29, fim: 36, tamanho: 7, tipo: 'N', obrigatorio: true, cor: '#b2dfdb', descricao: 'Número da conta (7 pos)' },
    { nome: 'Dígito da Conta do Beneficiário', ini: 36, fim: 37, tamanho: 1, tipo: 'N', obrigatorio: true, cor: '#80cbc4', descricao: 'Dígito da conta (1 pos)' },
    { nome: 'Nº do Controle do Participante', ini: 37, fim: 62, tamanho: 25, tipo: 'A', obrigatorio: false, cor: '#b3e5fc', descricao: 'Código do cliente — devolvido no retorno (25 pos)' },
    { nome: 'Código do Banco a ser Debitado', ini: 62, fim: 65, tamanho: 3, tipo: 'N', obrigatorio: false, valores: ['457'], cor: '#ffccbc', descricao: 'Banco UY3 = 457 (3 pos)' },
    { nome: 'Campo de Multa', ini: 65, fim: 66, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['0', '2'],
      valoresDescricao: { '0': 'Sem multa', '2': 'Com multa (percentual)' },
      cor: '#ce93d8', descricao: '0=Sem multa · 2=Com multa (%)' },
    { nome: 'Percentual de Multa', ini: 66, fim: 70, tamanho: 4, tipo: 'N', obrigatorio: false, cor: '#ba68c8', descricao: 'Percentual com 2 casas decimais (4 pos)' },
    { nome: 'Nosso Número', ini: 70, fim: 81, tamanho: 11, tipo: 'N', obrigatorio: true, cor: '#ffccbc', descricao: 'Número bancário para cobrança com registro (11 pos)' },
    { nome: 'Dígito do Nosso Número', ini: 81, fim: 82, tamanho: 1, tipo: 'A', obrigatorio: true, cor: '#ffab91', descricao: 'DAC Módulo 11 base 7' },
    { nome: 'Desconto Bonificação por Dia', ini: 82, fim: 92, tamanho: 10, tipo: 'N', obrigatorio: false, cor: '#a5d6a7', descricao: 'Valor desconto bonif./dia (10 pos)' },
    { nome: 'Condição Emissão Papeleta', ini: 92, fim: 93, tamanho: 1, tipo: 'N', obrigatorio: true,
      valoresDescricao: { '1': 'Banco emite e processa', '2': 'Cliente (cedente) emite' },
      cor: '#81c784', descricao: '1=Banco emite · 2=Cliente emite' },
    { nome: 'Branco', ini: 93, fim: 108, tamanho: 15, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Branco (15 pos)' },
    { nome: 'Identificação da Ocorrência', ini: 108, fim: 110, tamanho: 2, tipo: 'N', obrigatorio: true, cor: '#80deea', descricao: 'Vide tabela de ocorrências remessa (2 pos)' },
    { nome: 'Nº de Documento', ini: 110, fim: 120, tamanho: 10, tipo: 'A', obrigatorio: true, cor: '#c5e1a5', descricao: 'Número do documento (10 pos)' },
    { nome: 'Data do Vencimento', ini: 120, fim: 126, tamanho: 6, tipo: 'N', obrigatorio: true, formato: 'DDMMAA', cor: '#fff9c4', descricao: 'Vencimento DDMMAA' },
    { nome: 'Valor do Título', ini: 126, fim: 139, tamanho: 13, tipo: 'N', obrigatorio: true, cor: '#ef9a9a', descricao: 'Sem ponto/vírgula, 2 decimais implícitos (13 pos)' },
    { nome: 'Branco', ini: 139, fim: 147, tamanho: 8, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Branco (8 pos)' },
    { nome: 'Espécie do Título', ini: 147, fim: 149, tamanho: 2, tipo: 'N', obrigatorio: true, cor: '#bcaaa4', descricao: 'Código da espécie — clique para selecionar',
      valoresDescricao: {
        '01': 'Duplicata Mercantil',
        '02': 'Nota Promissória',
        '03': 'Nota de Seguro',
        '05': 'Recibo',
        '10': 'Letras de Câmbio',
        '11': 'Nota de Débito',
        '12': 'Duplicata de Serviços',
        '31': 'Carta de Crédito',
        '32': 'Boleto de Proposta',
        '33': 'Depósito e Aporte',
        '99': 'Outros',
      }
    },
    { nome: 'Identificação', ini: 149, fim: 150, tamanho: 1, tipo: 'A', obrigatorio: true, valores: ['N'], cor: '#d7ccc8', descricao: 'Sempre N' },
    { nome: 'Data da Emissão do Título', ini: 150, fim: 156, tamanho: 6, tipo: 'N', obrigatorio: true, formato: 'DDMMAA', cor: '#b2ebf2', descricao: 'Emissão DDMMAA' },
    { nome: '1ª Instrução', ini: 156, fim: 158, tamanho: 2, tipo: 'N', obrigatorio: true,
      valoresDescricao: { '06': 'Protestar após 2ª Instrução dias', '00': 'Sem protesto' },
      cor: '#b0bec5', descricao: '06=Protestar · 00=Sem protesto' },
    { nome: '2ª Instrução', ini: 158, fim: 160, tamanho: 2, tipo: 'N', obrigatorio: true, cor: '#90a4ae', descricao: 'Nº de dias para protestar (mín. 3 dias úteis após venc.)' },
    { nome: 'Valor a ser Cobrado por Dia de Atraso', ini: 160, fim: 173, tamanho: 13, tipo: 'N', obrigatorio: false, cor: '#ffab91', descricao: 'Mora/Dia — zeros à esquerda (13 pos, 2 dec)' },
    { nome: 'Data Limite P/Concessão de Desconto', ini: 173, fim: 179, tamanho: 6, tipo: 'N', obrigatorio: false, formato: 'DDMMAA', cor: '#fff59d', descricao: 'Data Desconto DDMMAA' },
    { nome: 'Valor do Desconto', ini: 179, fim: 192, tamanho: 13, tipo: 'N', obrigatorio: false, cor: '#80cbc4', descricao: 'Desconto (13 pos, 2 dec)' },
    { nome: 'Branco', ini: 192, fim: 205, tamanho: 13, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Branco (13 pos)' },
    { nome: 'Valor do Abatimento', ini: 205, fim: 218, tamanho: 13, tipo: 'N', obrigatorio: false, cor: '#a5d6a7', descricao: 'Abatimento (13 pos, 2 dec)' },
    { nome: 'Tipo Inscrição do Pagador', ini: 218, fim: 220, tamanho: 2, tipo: 'N', obrigatorio: true,
      valoresDescricao: { '01': 'CPF — Pessoa Física', '02': 'CNPJ — Pessoa Jurídica' },
      cor: '#e0f7fa', descricao: '01=CPF · 02=CNPJ' },
    { nome: 'Nº Inscrição do Pagador', ini: 220, fim: 234, tamanho: 14, tipo: 'N', obrigatorio: true, cor: '#90caf9', descricao: 'CNPJ (14 pos) ou CPF (11 pos, zeros à esquerda)' },
    { nome: 'Nome do Pagador', ini: 234, fim: 274, tamanho: 40, tipo: 'A', obrigatorio: true, cor: '#ffcc80', descricao: 'Razão Social do Pagador (40 pos)' },
    { nome: 'Endereço do Pagador', ini: 274, fim: 314, tamanho: 40, tipo: 'A', obrigatorio: true, cor: '#ffe0b2', descricao: 'Endereço completo (40 pos)' },
    { nome: '1ª Mensagem', ini: 314, fim: 326, tamanho: 12, tipo: 'A', obrigatorio: false, cor: '#ce93d8', descricao: 'Campo livre (12 pos) — CEP inicia na pos 327' },
    { nome: 'CEP Pagador', ini: 326, fim: 334, tamanho: 8, tipo: 'N', obrigatorio: false, cor: '#c8e6c9', descricao: 'CEP apenas números (8 pos ex: 27410130)' },
    { nome: 'Beneficiário Final / 2ª Mensagem', ini: 334, fim: 394, tamanho: 60, tipo: 'A', obrigatorio: false, cor: '#e1bee7', descricao: 'Beneficiário final ou 2ª mensagem (60 pos)' },
    { nome: 'Nº Sequencial do Registro', ini: 394, fim: 400, tamanho: 6, tipo: 'N', obrigatorio: true, cor: '#b2ebf2', descricao: 'Sequencial do registro' },
  ];

  // ========================================
  // LAYOUT TIPO 7 — Novo Beneficiário
  // Usado com ocorrência 23 (Transferência entre Carteiras)
  // ========================================
  camposTipo7: CampoLayout[] = [
    { nome: 'Identificação do Registro', ini: 0, fim: 1, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['7'], cor: '#f8bbd0', descricao: 'Tipo 7 — Novo Beneficiário' },
    { nome: 'Endereço Beneficiário Final', ini: 1, fim: 46, tamanho: 45, tipo: 'A', obrigatorio: true, cor: '#ffe082', descricao: 'Logradouro, Bairro, Número, Complemento — sep. vírgula (45 pos)' },
    { nome: 'CEP Beneficiário Final', ini: 46, fim: 54, tamanho: 8, tipo: 'N', obrigatorio: true, cor: '#b2dfdb', descricao: 'CEP apenas números (8 pos)' },
    { nome: 'Cidade Beneficiário Final', ini: 54, fim: 74, tamanho: 20, tipo: 'A', obrigatorio: true, cor: '#80cbc4', descricao: 'Cidade (20 pos)' },
    { nome: 'UF Beneficiário Final', ini: 74, fim: 76, tamanho: 2, tipo: 'A', obrigatorio: true, cor: '#4db6ac', descricao: 'Sigla do estado (2 pos)' },
    { nome: 'Branco', ini: 76, fim: 366, tamanho: 290, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Branco (290 pos)' },
    { nome: 'Carteira', ini: 366, fim: 369, tamanho: 3, tipo: 'N', obrigatorio: true, cor: '#c5cae9', descricao: 'Número da carteira (3 pos)' },
    { nome: 'Agência Beneficiário Final', ini: 369, fim: 374, tamanho: 5, tipo: 'N', obrigatorio: true, cor: '#ffccbc', descricao: 'Agência (5 pos)' },
    { nome: 'Conta-corrente Beneficiário Final', ini: 374, fim: 381, tamanho: 7, tipo: 'A', obrigatorio: false, cor: '#dcedc8', descricao: 'Conta-corrente (7 pos)' },
    { nome: 'Dígito C/C Beneficiário Final', ini: 381, fim: 382, tamanho: 1, tipo: 'N', obrigatorio: false, cor: '#c5e1a5', descricao: 'Dígito C/C (1 pos)' },
    { nome: 'Nosso Número (Tipo 7)', ini: 382, fim: 393, tamanho: 11, tipo: 'N', obrigatorio: true, cor: '#ef9a9a', descricao: 'Número bancário (11 pos)' },
    { nome: 'Dígito Nosso Número (Tipo 7)', ini: 393, fim: 394, tamanho: 1, tipo: 'N', obrigatorio: true, cor: '#ffab91', descricao: 'DAC do nosso número' },
    { nome: 'Nº Sequencial do Registro', ini: 394, fim: 400, tamanho: 6, tipo: 'N', obrigatorio: true, cor: '#b2ebf2', descricao: 'Sequencial do registro' },
  ];

  // ========================================
  // LAYOUT TIPO 8 — Dados Pagador
  // Quando preenchido com e-mail, boleto é enviado automaticamente
  // ========================================
  camposTipo8: CampoLayout[] = [
    { nome: 'Identificação do Registro', ini: 0, fim: 1, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['8'], cor: '#f8bbd0', descricao: 'Tipo 8 — Dados do Pagador' },
    { nome: 'Endereço Pagador (T8)', ini: 1, fim: 46, tamanho: 45, tipo: 'A', obrigatorio: false, cor: '#ffe082', descricao: 'Rua, nº, cj — separados por vírgula (45 pos)' },
    { nome: 'CEP do Pagador (T8)', ini: 46, fim: 54, tamanho: 8, tipo: 'N', obrigatorio: false, cor: '#b2dfdb', descricao: 'CEP apenas números (8 pos)' },
    { nome: 'Cidade do Pagador (T8)', ini: 54, fim: 74, tamanho: 20, tipo: 'A', obrigatorio: false, cor: '#80cbc4', descricao: 'Nome da cidade (20 pos)' },
    { nome: 'UF do Pagador (T8)', ini: 74, fim: 76, tamanho: 2, tipo: 'A', obrigatorio: false, cor: '#4db6ac', descricao: 'Sigla do estado (2 pos)' },
    { nome: 'E-mail do Pagador', ini: 76, fim: 156, tamanho: 80, tipo: 'A', obrigatorio: false, cor: '#c5e1a5', descricao: 'email@pagador.com.br — dispara envio do boleto PDF (80 pos)' },
    { nome: 'Reservado', ini: 156, fim: 394, tamanho: 238, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Reservado para uso futuro (238 pos)' },
    { nome: 'Nº Sequencial do Registro', ini: 394, fim: 400, tamanho: 6, tipo: 'N', obrigatorio: true, cor: '#b2ebf2', descricao: 'Sequencial do registro' },
  ];

  // ========================================
  // LAYOUT TRAILER (TIPO 9) - UY3 CNAB 400
  // ========================================
  camposTrailer: CampoLayout[] = [
    { nome: 'Identificação do Registro', ini: 0, fim: 1, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['9'], cor: '#f8bbd0', descricao: 'Tipo 9 — Trailer' },
    { nome: 'Branco', ini: 1, fim: 394, tamanho: 393, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Branco (393 pos)' },
    { nome: 'Nº Sequencial do Registro', ini: 394, fim: 400, tamanho: 6, tipo: 'N', obrigatorio: true, cor: '#b2ebf2', descricao: 'Nº Sequencial do Último Registro' },
  ];

  readonly codigosOcorrencia: { codigo: string; descricao: string }[] = [
    { codigo: '01', descricao: 'Remessa — Entrada de Título' },
    { codigo: '02', descricao: 'Pedido de Baixa' },
    { codigo: '03', descricao: 'Pedido de Protesto Falimentar' },
    { codigo: '04', descricao: 'Concessão de Abatimento' },
    { codigo: '05', descricao: 'Cancelamento de Abatimento Concedido' },
    { codigo: '06', descricao: 'Alteração de Vencimento' },
    { codigo: '07', descricao: 'Alteração do Controle do Participante' },
    { codigo: '08', descricao: 'Alteração de seu Número' },
    { codigo: '09', descricao: 'Pedido de Protesto' },
    { codigo: '12', descricao: 'Ped. Exc. de Cadastro Pagador Débito' },
    { codigo: '13', descricao: 'Inclusão de Cadastro Pagador' },
    { codigo: '14', descricao: 'Alteração Cadastro Pagador' },
    { codigo: '18', descricao: 'Sustar Protesto e Baixar Título' },
    { codigo: '19', descricao: 'Sustar Protesto e Manter em Carteira' },
    { codigo: '20', descricao: 'Alteração de Valor' },
    { codigo: '21', descricao: 'Alteração de Valor com Emissão de Boleto (banco emite)*' },
    { codigo: '22', descricao: 'Transferência Cessão Crédito ID. Prod.10' },
    { codigo: '23', descricao: 'Transferência entre Carteiras' },
    { codigo: '24', descricao: 'Dev. Transferência entre Carteiras' },
    { codigo: '31', descricao: 'Alteração de Outros Dados' },
  ];

  get campoEhOcorrencia(): boolean {
    const nome = this.campoAtivo?.nome.toLowerCase() ?? '';
    return nome.includes('ocorr');
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
    if (tipo === '7') return this.camposTipo7;
    if (tipo === '8') return this.camposTipo8;
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
    if (linhaAntes !== linhaDepois) {
      this.totalEdicoes++;
    }
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
    for (let i = 0; i < conteudo.length; i++) {
      bytes[i] = conteudo.charCodeAt(i) & 0xff;
    }
    const blob = new Blob([bytes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'remessa_uy3.REM';
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

    reader.onerror = () => {
      this.error = 'Erro ao ler o arquivo. Tente novamente.';
    };

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
    let comMulta = 0, semMulta = 0;

    for (const l of detalhes) {
      valorFace      += parseInt(l.substring(126, 139) || '0', 10);
      valorDesconto  += parseInt(l.substring(179, 192) || '0', 10);
      valorAbatimento+= parseInt(l.substring(205, 218) || '0', 10);
      l[65] === '2' ? comMulta++ : semMulta++;
    }

    this.totaisRemessa = {
      totalBoletos: detalhes.length,
      valorFace, valorDesconto, valorAbatimento,
      comMulta, semMulta
    };
  }

  formatarReais(centavos: number): string {
    return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  validarEHighlight(content: string): string {
    const lines = content.split(/\r?\n/).filter(l => l.length > 0);
    if (lines.length === 0) {
      this.error = 'Arquivo vazio ou sem linhas válidas.';
      return '';
    }

    this.estatisticas = {
      totalLinhas: lines.length,
      headers: 0,
      tipo1: 0,
      tipo7: 0,
      tipo8: 0,
      trailers: 0,
      desconhecidos: 0
    };

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
          this.estatisticas.tipo1++;
          break;
        case '7':
          campos = this.camposTipo7;
          this.estatisticas.tipo7++;
          break;
        case '8':
          campos = this.camposTipo8;
          this.estatisticas.tipo8++;
          break;
        case '9':
          campos = this.camposTrailer;
          this.estatisticas.trailers++;
          break;
        default:
          campos = [];
          this.estatisticas.desconhecidos++;
          this.erros.push({
            linha: idx + 1,
            campo: 'Tipo Registro',
            posicao: '1',
            valor: tipo,
            mensagem: `Tipo de registro desconhecido: "${tipo}". Tipos válidos: 0 (Header), 1 (Detalhe), 7 (Novo Beneficiário), 8 (Dados Pagador), 9 (Trailer)`,
            severidade: 'erro'
          });
      }

      if (line.length !== 400) {
        this.erros.push({
          linha: idx + 1,
          campo: 'Linha',
          posicao: `1-${line.length}`,
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
        const valorSeq = line.slice(seqCampo.ini, seqCampo.fim).trim();
        const sequenciaAtual = parseInt(valorSeq, 10);

        if (!isNaN(sequenciaAtual) && sequenciaAtual !== sequenciaEsperada) {
          this.erros.push({
            linha: idx + 1,
            campo: 'Seq. Registro',
            posicao: `${seqCampo.ini + 1}-${seqCampo.fim}`,
            valor: valorSeq,
            mensagem: `Sequência incorreta. Esperado: ${String(sequenciaEsperada).padStart(6, '0')}, Encontrado: ${valorSeq}`,
            severidade: 'erro'
          });
        }
        sequenciaEsperada++;
      }
    }

    this.validarEstrutura();

    const todosCampos = [
      ...this.camposHeader,
      ...this.camposDetalhe,
      ...this.camposTipo7,
      ...this.camposTipo8,
      ...this.camposTrailer
    ];
    this.legendaCampos = todosCampos.filter(
      (campo, index, self) => self.findIndex(c => c.nome === campo.nome) === index
    );

    return `<div class="cnab-mw">${lines.map((line, idx) => this.lineToMatrix(line, idx)).join('')}</div>`;
  }

  validarEstrutura(): void {
    if (!this.estatisticas) return;

    if (this.estatisticas.headers === 0) {
      this.erros.push({ linha: 0, campo: 'Estrutura', posicao: '-', valor: '-',
        mensagem: 'Arquivo deve conter pelo menos um registro Header (Tipo 0)', severidade: 'erro' });
    }

    if (this.estatisticas.trailers === 0) {
      this.erros.push({ linha: 0, campo: 'Estrutura', posicao: '-', valor: '-',
        mensagem: 'Arquivo deve conter pelo menos um registro Trailer (Tipo 9)', severidade: 'erro' });
    }

    if (this.estatisticas.tipo1 === 0) {
      this.erros.push({ linha: 0, campo: 'Estrutura', posicao: '-', valor: '-',
        mensagem: 'Aviso: Arquivo não contém registros de Detalhe (Tipo 1)', severidade: 'aviso' });
    }

    if (this.estatisticas.headers > 1) {
      this.erros.push({ linha: 0, campo: 'Estrutura', posicao: '-', valor: '-',
        mensagem: `Aviso: Arquivo contém ${this.estatisticas.headers} Headers (normalmente 1)`, severidade: 'aviso' });
    }
  }

  validarCampo(linha: number, campo: CampoLayout, valor: string): void {
    const valorTrim = valor.trim();

    if (campo.obrigatorio && valorTrim === '') {
      this.erros.push({
        linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`,
        valor, mensagem: 'Campo obrigatório está vazio', severidade: 'erro'
      });
      return;
    }

    if (!campo.obrigatorio && valorTrim === '') return;

    if (campo.tipo === 'N' && valorTrim !== '') {
      if (valor.includes(' ')) {
        this.erros.push({
          linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`,
          valor, mensagem: 'Campo numérico contém espaços. Deve ser preenchido com zeros à esquerda.',
          severidade: 'erro'
        });
      }
      if (!/^\d+$/.test(valor)) {
        this.erros.push({
          linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`,
          valor, mensagem: 'Deve conter apenas números (0-9)', severidade: 'erro'
        });
      }
    }

    if (campo.valores && valorTrim !== '') {
      if (!campo.valores.includes(valorTrim)) {
        this.erros.push({
          linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`,
          valor, mensagem: `Valor inválido. Valores permitidos: ${campo.valores.join(', ')}`,
          severidade: 'erro'
        });
      }
    }

    if (campo.formato === 'DDMMAA' && valorTrim !== '' && valorTrim !== '000000') {
      if (valor.length === 6 && /^\d{6}$/.test(valor)) {
        const dia = parseInt(valor.slice(0, 2), 10);
        const mes = parseInt(valor.slice(2, 4), 10);
        if (dia < 1 || dia > 31) {
          this.erros.push({
            linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`,
            valor, mensagem: `Dia inválido: ${dia} (deve estar entre 01 e 31)`, severidade: 'erro'
          });
        }
        if (mes < 1 || mes > 12) {
          this.erros.push({
            linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`,
            valor, mensagem: `Mês inválido: ${mes} (deve estar entre 01 e 12)`, severidade: 'erro'
          });
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
      case '0':
        campos = this.camposHeader;
        tipoNome = 'Header';
        tipoColor = '#7b1fa2';
        break;
      case '1':
        campos = this.camposDetalhe;
        tipoNome = 'Detalhe';
        tipoColor = '#388e3c';
        break;
      case '7':
        campos = this.camposTipo7;
        tipoNome = 'Tipo 7 (Novo Beneficiário)';
        tipoColor = '#e65100';
        break;
      case '8':
        campos = this.camposTipo8;
        tipoNome = 'Tipo 8 (Dados Pagador)';
        tipoColor = '#0277bd';
        break;
      case '9':
        campos = this.camposTrailer;
        tipoNome = 'Trailer';
        tipoColor = '#c2185b';
        break;
      default:
        campos = [];
        tipoNome = 'Desconhecido';
        tipoColor = '#d32f2f';
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

      let cor = '#f5f5f5';
      let nomeCampo = 'N/D';

      if (campo) {
        cor = campo.cor;
        nomeCampo = campo.nome;
      }

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
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
