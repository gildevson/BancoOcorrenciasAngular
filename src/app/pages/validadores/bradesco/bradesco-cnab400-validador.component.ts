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
  tipo2: number;
  rateios: number;
  tipo6: number;
  tipo7: number;
  trailers: number;
  desconhecidos: number;
}

@Component({
  selector: 'app-bradesco-cnab400-validador',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './bradesco-cnab400-validador.component.html',
  styleUrls: ['./bradesco-cnab400-validador.component.css']
})
export class BradescoCnab400ValidadorComponent implements OnDestroy {
  visualHtml: SafeHtml | null = null;
  error: string | null = null;
  erros: Erro[] = [];
  validado = false;
  campoSelecionado: string | null = null;
  conteudoArquivo: string = '';
  legendaCampos: CampoLayout[] = [];
  estatisticas: EstatisticasArquivo | null = null;

  // Edição
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

  // Totais
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
  // LAYOUT HEADER (TIPO 0)
  // ========================================
  camposHeader: CampoLayout[] = [
    { nome: 'Tipo Registro', ini: 0, fim: 1, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['0'], cor: '#f8bbd0', descricao: 'Identificação do Registro Header' },
    { nome: 'Ident. Arquivo', ini: 1, fim: 2, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['1'], cor: '#ffe082', descricao: 'Identificação do Arquivo-Remessa' },
    { nome: 'Literal Remessa', ini: 2, fim: 9, tamanho: 7, tipo: 'A', obrigatorio: true, valores: ['REMESSA'], cor: '#b2dfdb', descricao: 'Literal REMESSA' },
    { nome: 'Cód. Serviço', ini: 9, fim: 11, tamanho: 2, tipo: 'N', obrigatorio: true, valores: ['01'], cor: '#c5cae9', descricao: 'Código de Serviço (01=Cobrança)' },
    { nome: 'Literal Serviço', ini: 11, fim: 26, tamanho: 15, tipo: 'A', obrigatorio: true, valores: ['COBRANCA'], cor: '#e1bee7', descricao: 'Literal COBRANCA' },
    { nome: 'Cód. Empresa', ini: 26, fim: 46, tamanho: 20, tipo: 'N', obrigatorio: true, cor: '#b3e5fc', descricao: 'Código da Empresa fornecido pelo Bradesco' },
    { nome: 'Nome Empresa', ini: 46, fim: 76, tamanho: 30, tipo: 'A', obrigatorio: true, cor: '#ffecb3', descricao: 'Razão Social da Empresa' },
    { nome: 'Cód. Banco', ini: 76, fim: 79, tamanho: 3, tipo: 'N', obrigatorio: true, valores: ['237'], cor: '#ffccbc', descricao: 'Número do Bradesco na Compensação' },
    { nome: 'Nome Banco', ini: 79, fim: 94, tamanho: 15, tipo: 'A', obrigatorio: true, valores: ['BRADESCO'], cor: '#dcedc8', descricao: 'Nome do Banco por Extenso' },
    { nome: 'Data Gravação', ini: 94, fim: 100, tamanho: 6, tipo: 'N', obrigatorio: true, formato: 'DDMMAA', cor: '#fff9c4', descricao: 'Data da Gravação do Arquivo (DDMMAA)' },
    { nome: 'Brancos', ini: 100, fim: 108, tamanho: 8, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Espaços em branco' },
    { nome: 'Ident. Sistema', ini: 108, fim: 110, tamanho: 2, tipo: 'A', obrigatorio: true, valores: ['MX'], cor: '#b2ebf2', descricao: 'Identificação do Sistema (MX)' },
    { nome: 'Seq. Remessa', ini: 110, fim: 117, tamanho: 7, tipo: 'N', obrigatorio: true, cor: '#ffcdd2', descricao: 'Número Sequencial de Remessa' },
    { nome: 'Brancos', ini: 117, fim: 394, tamanho: 277, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Espaços em branco' },
    { nome: 'Seq. Registro', ini: 394, fim: 400, tamanho: 6, tipo: 'N', obrigatorio: true, valores: ['000001'], cor: '#b2ebf2', descricao: 'Número Sequencial do Registro (sempre 000001 no header)' },
  ];

  // ========================================
  // LAYOUT DETALHE (TIPO 1)
  // ========================================
  camposDetalhe: CampoLayout[] = [
    { nome: 'Tipo Registro', ini: 0, fim: 1, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['1'], cor: '#f8bbd0', descricao: 'Identificação do Registro Detalhe' },
    { nome: 'Agência Débito', ini: 1, fim: 6, tamanho: 5, tipo: 'N', obrigatorio: false, cor: '#ffe082', descricao: 'Agência de Débito' },
    { nome: 'Dígito Ag.', ini: 6, fim: 7, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#ffcc80', descricao: 'Dígito da Agência de Débito' },
    { nome: 'Razão C/C', ini: 7, fim: 12, tamanho: 5, tipo: 'N', obrigatorio: false, cor: '#c5cae9', descricao: 'Razão da Conta Corrente' },
    { nome: 'Conta Corrente', ini: 12, fim: 19, tamanho: 7, tipo: 'N', obrigatorio: false, cor: '#b2dfdb', descricao: 'Conta Corrente' },
    { nome: 'Dígito C/C', ini: 19, fim: 20, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#80cbc4', descricao: 'Dígito da Conta Corrente' },
    { nome: 'Ident. Empresa', ini: 20, fim: 37, tamanho: 17, tipo: 'A', obrigatorio: true, cor: '#e1bee7', descricao: 'Identificação da Empresa no Banco' },
    { nome: 'Nº Controle', ini: 37, fim: 62, tamanho: 25, tipo: 'A', obrigatorio: false, cor: '#d1c4e9', descricao: 'Número de Controle do Participante' },
    { nome: 'Cód. Banco', ini: 62, fim: 65, tamanho: 3, tipo: 'N', obrigatorio: false, valores: ['237'], cor: '#b3e5fc', descricao: 'Código do Banco (237)' },
    { nome: 'Multa', ini: 65, fim: 66, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['0', '2'], cor: '#ffcdd2', descricao: '0=sem multa, 2=com multa' },
    { nome: '% Multa', ini: 66, fim: 70, tamanho: 4, tipo: 'N', obrigatorio: false, cor: '#ef9a9a', descricao: 'Percentual de Multa' },
    { nome: 'Nosso Número', ini: 70, fim: 81, tamanho: 11, tipo: 'N', obrigatorio: true, cor: '#ffccbc', descricao: 'Nosso Número (11 pos)' },
    { nome: 'Dígito N/N', ini: 81, fim: 82, tamanho: 1, tipo: 'A', obrigatorio: true, cor: '#ffab91', descricao: 'Dígito Nosso Número' },
    { nome: 'Desc. Bonif.', ini: 82, fim: 92, tamanho: 10, tipo: 'N', obrigatorio: false, cor: '#ffe0b2', descricao: 'Desconto Bonificação por Dia' },
    { nome: 'Cond. Emissão', ini: 92, fim: 93, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['1', '2'], cor: '#fff9c4', descricao: '1=Banco emite, 2=Cliente emite' },
    { nome: 'Déb. Autom.', ini: 93, fim: 94, tamanho: 1, tipo: 'A', obrigatorio: true, valores: ['N', 'S'], cor: '#fff59d', descricao: 'N=Não, S=Sim' },
    { nome: 'Brancos', ini: 94, fim: 104, tamanho: 10, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos' },
    { nome: 'Ind. Rateio', ini: 104, fim: 105, tamanho: 1, tipo: 'A', obrigatorio: false, valores: ['R'], cor: '#c8e6c9', descricao: 'Indicador de Rateio Crédito (R)' },
    { nome: 'Endereçam.', ini: 105, fim: 106, tamanho: 1, tipo: 'N', obrigatorio: false, cor: '#a5d6a7', descricao: 'Endereçamento' },
    { nome: 'Qtd. Pag.', ini: 106, fim: 108, tamanho: 2, tipo: 'A', obrigatorio: false, cor: '#81c784', descricao: 'Quantidade de Pagamentos' },
    { nome: 'Ocorrência', ini: 108, fim: 110, tamanho: 2, tipo: 'N', obrigatorio: true, cor: '#4db6ac', descricao: 'Código de Ocorrência' },
    { nome: 'Nº Documento', ini: 110, fim: 120, tamanho: 10, tipo: 'A', obrigatorio: true, cor: '#dcedc8', descricao: 'Número do Documento' },
    { nome: 'Vencimento', ini: 120, fim: 126, tamanho: 6, tipo: 'N', obrigatorio: true, formato: 'DDMMAA', cor: '#fff9c4', descricao: 'Data de Vencimento (DDMMAA)' },
    { nome: 'Valor Título', ini: 126, fim: 139, tamanho: 13, tipo: 'N', obrigatorio: true, cor: '#ffcdd2', descricao: 'Valor do Título (centavos)' },
    { nome: 'Banco Cobr.', ini: 139, fim: 142, tamanho: 3, tipo: 'N', obrigatorio: true, cor: '#b3e5fc', descricao: 'Banco Encarregado da Cobrança (237 ou 000)' },
    { nome: 'Agência Dep.', ini: 142, fim: 147, tamanho: 5, tipo: 'N', obrigatorio: true, cor: '#81d4fa', descricao: 'Agência Depositária' },
    { nome: 'Espécie', ini: 147, fim: 149, tamanho: 2, tipo: 'N', obrigatorio: true, cor: '#4fc3f7', descricao: 'Espécie do Título' },
    { nome: 'Aceite', ini: 149, fim: 150, tamanho: 1, tipo: 'A', obrigatorio: true, valores: ['N'], cor: '#29b6f6', descricao: 'N = Não Aceite' },
    { nome: 'Data Emissão', ini: 150, fim: 156, tamanho: 6, tipo: 'N', obrigatorio: true, formato: 'DDMMAA', cor: '#b2ebf2', descricao: 'Data de Emissão (DDMMAA)' },
    { nome: '1ª Instrução', ini: 156, fim: 158, tamanho: 2, tipo: 'N', obrigatorio: false, cor: '#80deea', descricao: 'Primeira Instrução' },
    { nome: '2ª Instrução', ini: 158, fim: 160, tamanho: 2, tipo: 'N', obrigatorio: false, cor: '#4dd0e1', descricao: 'Segunda Instrução' },
    { nome: 'Mora/Dia', ini: 160, fim: 173, tamanho: 13, tipo: 'N', obrigatorio: false, cor: '#b2dfdb', descricao: 'Mora por Dia (centavos)' },
    { nome: 'Data Desc.', ini: 173, fim: 179, tamanho: 6, tipo: 'N', obrigatorio: false, formato: 'DDMMAA', cor: '#80cbc4', descricao: 'Data Limite Desconto (DDMMAA)' },
    { nome: 'Valor Desc.', ini: 179, fim: 192, tamanho: 13, tipo: 'N', obrigatorio: false, cor: '#4db6ac', descricao: 'Valor do Desconto (centavos)' },
    { nome: 'Valor IOF', ini: 192, fim: 205, tamanho: 13, tipo: 'N', obrigatorio: false, cor: '#26a69a', descricao: 'Valor do IOF (centavos)' },
    { nome: 'Abatimento', ini: 205, fim: 218, tamanho: 13, tipo: 'N', obrigatorio: false, cor: '#009688', descricao: 'Valor do Abatimento (centavos)' },
    { nome: 'Tipo Inscr.', ini: 218, fim: 220, tamanho: 2, tipo: 'N', obrigatorio: true, valores: ['01', '02'], cor: '#e0f7fa', descricao: '01=CPF, 02=CNPJ' },
    { nome: 'CPF/CNPJ', ini: 220, fim: 234, tamanho: 14, tipo: 'N', obrigatorio: true, cor: '#b3e5fc', descricao: 'CPF/CNPJ do Sacado' },
    { nome: 'Nome Sacado', ini: 234, fim: 274, tamanho: 40, tipo: 'A', obrigatorio: true, cor: '#ffecb3', descricao: 'Nome do Sacado' },
    { nome: 'Endereço', ini: 274, fim: 314, tamanho: 40, tipo: 'A', obrigatorio: true, cor: '#ffe082', descricao: 'Endereço do Sacado' },
    { nome: '1ª Mensagem', ini: 314, fim: 326, tamanho: 12, tipo: 'A', obrigatorio: false, cor: '#ffcc80', descricao: 'Primeira Mensagem' },
    { nome: 'CEP', ini: 326, fim: 331, tamanho: 5, tipo: 'N', obrigatorio: true, cor: '#dcedc8', descricao: 'CEP do Sacado' },
    { nome: 'Sufixo CEP', ini: 331, fim: 334, tamanho: 3, tipo: 'N', obrigatorio: true, cor: '#c5e1a5', descricao: 'Sufixo do CEP' },
    { nome: 'Benef. Final', ini: 334, fim: 394, tamanho: 60, tipo: 'A', obrigatorio: false, cor: '#aed581', descricao: 'Beneficiário Final' },
    { nome: 'Seq. Registro', ini: 394, fim: 400, tamanho: 6, tipo: 'N', obrigatorio: true, cor: '#b2ebf2', descricao: 'Número Sequencial do Registro' },
  ];

  // ========================================
  // LAYOUT TIPO 2 (Mensagens adicionais)
  // ========================================
  camposTipo2: CampoLayout[] = [
    { nome: 'Tipo Registro', ini: 0, fim: 1, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['2'], cor: '#f8bbd0', descricao: 'Tipo 2 - Mensagens' },
    { nome: 'Mensagem 1', ini: 1, fim: 81, tamanho: 80, tipo: 'A', obrigatorio: false, cor: '#ffe082', descricao: 'Mensagem 1 (80 pos)' },
    { nome: 'Mensagem 2', ini: 81, fim: 161, tamanho: 80, tipo: 'A', obrigatorio: false, cor: '#b2dfdb', descricao: 'Mensagem 2 (80 pos)' },
    { nome: 'Mensagem 3', ini: 161, fim: 241, tamanho: 80, tipo: 'A', obrigatorio: false, cor: '#c5cae9', descricao: 'Mensagem 3 (80 pos)' },
    { nome: 'Mensagem 4', ini: 241, fim: 321, tamanho: 80, tipo: 'A', obrigatorio: false, cor: '#e1bee7', descricao: 'Mensagem 4 (80 pos)' },
    { nome: 'Data Desc. 2', ini: 321, fim: 327, tamanho: 6, tipo: 'N', obrigatorio: false, formato: 'DDMMAA', cor: '#fff9c4', descricao: 'Data Desconto 2 (DDMMAA)' },
    { nome: 'Valor Desc. 2', ini: 327, fim: 340, tamanho: 13, tipo: 'N', obrigatorio: false, cor: '#ffcdd2', descricao: 'Valor Desconto 2 (centavos)' },
    { nome: 'Data Desc. 3', ini: 340, fim: 346, tamanho: 6, tipo: 'N', obrigatorio: false, formato: 'DDMMAA', cor: '#fff59d', descricao: 'Data Desconto 3 (DDMMAA)' },
    { nome: 'Valor Desc. 3', ini: 346, fim: 359, tamanho: 13, tipo: 'N', obrigatorio: false, cor: '#ef9a9a', descricao: 'Valor Desconto 3 (centavos)' },
    { nome: 'Reserva', ini: 359, fim: 366, tamanho: 7, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Reserva' },
    { nome: 'Carteira', ini: 366, fim: 369, tamanho: 3, tipo: 'N', obrigatorio: true, cor: '#b3e5fc', descricao: 'Carteira' },
    { nome: 'Agência', ini: 369, fim: 374, tamanho: 5, tipo: 'N', obrigatorio: true, cor: '#ffccbc', descricao: 'Agência' },
    { nome: 'Conta Corrente', ini: 374, fim: 381, tamanho: 7, tipo: 'N', obrigatorio: true, cor: '#dcedc8', descricao: 'Conta Corrente' },
    { nome: 'Dígito C/C', ini: 381, fim: 382, tamanho: 1, tipo: 'A', obrigatorio: true, cor: '#c5e1a5', descricao: 'Dígito Conta Corrente' },
    { nome: 'Nosso Número', ini: 382, fim: 393, tamanho: 11, tipo: 'N', obrigatorio: true, cor: '#4db6ac', descricao: 'Nosso Número' },
    { nome: 'DAC Nosso Núm.', ini: 393, fim: 394, tamanho: 1, tipo: 'A', obrigatorio: true, cor: '#26a69a', descricao: 'DAC do Nosso Número' },
    { nome: 'Seq. Registro', ini: 394, fim: 400, tamanho: 6, tipo: 'N', obrigatorio: true, cor: '#b2ebf2', descricao: 'Número Sequencial do Registro' },
  ];

  // ========================================
  // LAYOUT RATEIO (TIPO 3)
  // ========================================
  camposRateio: CampoLayout[] = [
    { nome: 'Tipo Registro', ini: 0, fim: 1, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['3'], cor: '#f8bbd0', descricao: 'Tipo 3 - Rateio' },
    { nome: 'Ident. Empresa', ini: 1, fim: 17, tamanho: 16, tipo: 'A', obrigatorio: true, cor: '#ffe082', descricao: 'Identificação da Empresa no Banco' },
    { nome: 'Ident. Título', ini: 17, fim: 29, tamanho: 12, tipo: 'A', obrigatorio: true, cor: '#b2dfdb', descricao: 'Identificação do Título' },
    { nome: 'Cód. Cálculo', ini: 29, fim: 30, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['1', '2', '3'], cor: '#c5cae9', descricao: '1=Valor Cobrado, 2=Valor Registro, 3=Menor Valor' },
    { nome: 'Tipo Valor', ini: 30, fim: 31, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['1', '2'], cor: '#e1bee7', descricao: '1=Percentual, 2=Valor' },
    { nome: 'Filler', ini: 31, fim: 43, tamanho: 12, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Filler' },
    { nome: 'Banco 1º', ini: 43, fim: 46, tamanho: 3, tipo: 'N', obrigatorio: true, valores: ['237'], cor: '#ffccbc', descricao: 'Banco 1º Beneficiário' },
    { nome: 'Agência 1º', ini: 46, fim: 51, tamanho: 5, tipo: 'N', obrigatorio: true, cor: '#b3e5fc', descricao: 'Agência 1º Beneficiário' },
    { nome: 'Dígito Ag. 1º', ini: 51, fim: 52, tamanho: 1, tipo: 'A', obrigatorio: true, cor: '#81d4fa', descricao: 'Dígito Agência 1º' },
    { nome: 'C/C 1º', ini: 52, fim: 64, tamanho: 12, tipo: 'N', obrigatorio: true, cor: '#4fc3f7', descricao: 'Conta Corrente 1º Beneficiário' },
    { nome: 'Dígito C/C 1º', ini: 64, fim: 65, tamanho: 1, tipo: 'A', obrigatorio: true, cor: '#29b6f6', descricao: 'Dígito C/C 1º' },
    { nome: 'Valor/% 1º', ini: 65, fim: 80, tamanho: 15, tipo: 'N', obrigatorio: true, cor: '#ffcdd2', descricao: 'Valor/% 1º Beneficiário' },
    { nome: 'Nome 1º', ini: 80, fim: 120, tamanho: 40, tipo: 'A', obrigatorio: true, cor: '#ffecb3', descricao: 'Nome 1º Beneficiário' },
    { nome: 'Filler', ini: 120, fim: 151, tamanho: 31, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Filler' },
    { nome: 'Parcela 1º', ini: 151, fim: 157, tamanho: 6, tipo: 'A', obrigatorio: false, cor: '#dcedc8', descricao: 'Parcela 1º' },
    { nome: 'Floating 1º', ini: 157, fim: 160, tamanho: 3, tipo: 'N', obrigatorio: false, cor: '#c5e1a5', descricao: 'Floating 1º' },
    { nome: 'Banco 2º', ini: 160, fim: 163, tamanho: 3, tipo: 'N', obrigatorio: false, valores: ['237'], cor: '#ffccbc', descricao: 'Banco 2º Beneficiário' },
    { nome: 'Agência 2º', ini: 163, fim: 168, tamanho: 5, tipo: 'N', obrigatorio: false, cor: '#b3e5fc', descricao: 'Agência 2º Beneficiário' },
    { nome: 'Dígito Ag. 2º', ini: 168, fim: 169, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#81d4fa', descricao: 'Dígito Agência 2º' },
    { nome: 'C/C 2º', ini: 169, fim: 181, tamanho: 12, tipo: 'N', obrigatorio: false, cor: '#4fc3f7', descricao: 'Conta Corrente 2º Beneficiário' },
    { nome: 'Dígito C/C 2º', ini: 181, fim: 182, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#29b6f6', descricao: 'Dígito C/C 2º' },
    { nome: 'Valor/% 2º', ini: 182, fim: 197, tamanho: 15, tipo: 'N', obrigatorio: false, cor: '#ffcdd2', descricao: 'Valor/% 2º Beneficiário' },
    { nome: 'Nome 2º', ini: 197, fim: 237, tamanho: 40, tipo: 'A', obrigatorio: false, cor: '#ffecb3', descricao: 'Nome 2º Beneficiário' },
    { nome: 'Filler', ini: 237, fim: 268, tamanho: 31, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Filler' },
    { nome: 'Parcela 2º', ini: 268, fim: 274, tamanho: 6, tipo: 'A', obrigatorio: false, cor: '#dcedc8', descricao: 'Parcela 2º' },
    { nome: 'Floating 2º', ini: 274, fim: 277, tamanho: 3, tipo: 'N', obrigatorio: false, cor: '#c5e1a5', descricao: 'Floating 2º' },
    { nome: 'Banco 3º', ini: 277, fim: 280, tamanho: 3, tipo: 'N', obrigatorio: false, valores: ['237'], cor: '#ffccbc', descricao: 'Banco 3º Beneficiário' },
    { nome: 'Agência 3º', ini: 280, fim: 285, tamanho: 5, tipo: 'N', obrigatorio: false, cor: '#b3e5fc', descricao: 'Agência 3º Beneficiário' },
    { nome: 'Dígito Ag. 3º', ini: 285, fim: 286, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#81d4fa', descricao: 'Dígito Agência 3º' },
    { nome: 'C/C 3º', ini: 286, fim: 298, tamanho: 12, tipo: 'N', obrigatorio: false, cor: '#4fc3f7', descricao: 'Conta Corrente 3º Beneficiário' },
    { nome: 'Dígito C/C 3º', ini: 298, fim: 299, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#29b6f6', descricao: 'Dígito C/C 3º' },
    { nome: 'Valor/% 3º', ini: 299, fim: 314, tamanho: 15, tipo: 'N', obrigatorio: false, cor: '#ffcdd2', descricao: 'Valor/% 3º Beneficiário' },
    { nome: 'Nome 3º', ini: 314, fim: 354, tamanho: 40, tipo: 'A', obrigatorio: false, cor: '#ffecb3', descricao: 'Nome 3º Beneficiário' },
    { nome: 'Filler', ini: 354, fim: 385, tamanho: 31, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Filler' },
    { nome: 'Parcela 3º', ini: 385, fim: 391, tamanho: 6, tipo: 'A', obrigatorio: false, cor: '#dcedc8', descricao: 'Parcela 3º' },
    { nome: 'Floating 3º', ini: 391, fim: 394, tamanho: 3, tipo: 'N', obrigatorio: false, cor: '#c5e1a5', descricao: 'Floating 3º' },
    { nome: 'Seq. Registro', ini: 394, fim: 400, tamanho: 6, tipo: 'N', obrigatorio: true, cor: '#b2ebf2', descricao: 'Número Sequencial do Registro' },
  ];

  // ========================================
  // LAYOUT TIPO 6 (Débito Automático)
  // ========================================
  camposTipo6: CampoLayout[] = [
    { nome: 'Tipo Registro', ini: 0, fim: 1, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['6'], cor: '#f8bbd0', descricao: 'Tipo 6 - Débito Automático' },
    { nome: 'Carteira', ini: 1, fim: 4, tamanho: 3, tipo: 'N', obrigatorio: true, cor: '#ffe082', descricao: 'Carteira' },
    { nome: 'Agência', ini: 4, fim: 9, tamanho: 5, tipo: 'N', obrigatorio: true, cor: '#b2dfdb', descricao: 'Agência' },
    { nome: 'Conta-Corrente', ini: 9, fim: 16, tamanho: 7, tipo: 'N', obrigatorio: true, cor: '#c5cae9', descricao: 'Conta Corrente' },
    { nome: 'Nosso Número', ini: 16, fim: 27, tamanho: 11, tipo: 'N', obrigatorio: true, cor: '#e1bee7', descricao: 'Nosso Número' },
    { nome: 'Dígito N/N', ini: 27, fim: 28, tamanho: 1, tipo: 'A', obrigatorio: true, cor: '#b3e5fc', descricao: 'Dígito Nosso Número' },
    { nome: 'Tipo Operação', ini: 28, fim: 29, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['1', '2', '3'], cor: '#ffccbc', descricao: 'Tipo de Operação' },
    { nome: 'Cheque Esp.', ini: 29, fim: 30, tamanho: 1, tipo: 'A', obrigatorio: true, valores: ['S', 'N'], cor: '#dcedc8', descricao: 'Cheque Especial' },
    { nome: 'Cons. Saldo', ini: 30, fim: 31, tamanho: 1, tipo: 'A', obrigatorio: true, valores: ['S', 'N'], cor: '#c5e1a5', descricao: 'Consulta Saldo' },
    { nome: 'Nº Contrato', ini: 31, fim: 56, tamanho: 25, tipo: 'A', obrigatorio: true, cor: '#81c784', descricao: 'Número do Contrato' },
    { nome: 'Prazo Validade', ini: 56, fim: 64, tamanho: 8, tipo: 'N', obrigatorio: true, cor: '#4db6ac', descricao: 'Prazo de Validade' },
    { nome: 'Brancos', ini: 64, fim: 394, tamanho: 330, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos' },
    { nome: 'Seq. Registro', ini: 394, fim: 400, tamanho: 6, tipo: 'N', obrigatorio: true, cor: '#b2ebf2', descricao: 'Número Sequencial do Registro' },
  ];

  // ========================================
  // LAYOUT TIPO 7 (Beneficiário Final)
  // ========================================
  camposTipo7: CampoLayout[] = [
    { nome: 'Tipo Registro', ini: 0, fim: 1, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['7'], cor: '#f8bbd0', descricao: 'Tipo 7 - Beneficiário Final' },
    { nome: 'Endereço Benef.', ini: 1, fim: 46, tamanho: 45, tipo: 'A', obrigatorio: false, cor: '#ffe082', descricao: 'Endereço do Beneficiário Final' },
    { nome: 'CEP', ini: 46, fim: 51, tamanho: 5, tipo: 'N', obrigatorio: false, cor: '#b2dfdb', descricao: 'CEP' },
    { nome: 'Sufixo CEP', ini: 51, fim: 54, tamanho: 3, tipo: 'N', obrigatorio: false, cor: '#c5cae9', descricao: 'Sufixo CEP' },
    { nome: 'Cidade', ini: 54, fim: 74, tamanho: 20, tipo: 'A', obrigatorio: false, cor: '#e1bee7', descricao: 'Cidade' },
    { nome: 'UF', ini: 74, fim: 76, tamanho: 2, tipo: 'A', obrigatorio: false, cor: '#b3e5fc', descricao: 'Unidade Federativa' },
    { nome: 'Reserva', ini: 76, fim: 366, tamanho: 290, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Reserva' },
    { nome: 'Carteira', ini: 366, fim: 369, tamanho: 3, tipo: 'N', obrigatorio: true, cor: '#ffccbc', descricao: 'Carteira' },
    { nome: 'Agência', ini: 369, fim: 374, tamanho: 5, tipo: 'N', obrigatorio: true, cor: '#dcedc8', descricao: 'Agência' },
    { nome: 'Conta Corrente', ini: 374, fim: 381, tamanho: 7, tipo: 'N', obrigatorio: true, cor: '#c5e1a5', descricao: 'Conta Corrente' },
    { nome: 'Dígito C/C', ini: 381, fim: 382, tamanho: 1, tipo: 'A', obrigatorio: true, cor: '#81c784', descricao: 'Dígito Conta Corrente' },
    { nome: 'Nosso Número', ini: 382, fim: 393, tamanho: 11, tipo: 'N', obrigatorio: true, cor: '#4db6ac', descricao: 'Nosso Número' },
    { nome: 'DAC Nosso Núm.', ini: 393, fim: 394, tamanho: 1, tipo: 'A', obrigatorio: true, cor: '#26a69a', descricao: 'DAC do Nosso Número' },
    { nome: 'Seq. Registro', ini: 394, fim: 400, tamanho: 6, tipo: 'N', obrigatorio: true, cor: '#b2ebf2', descricao: 'Número Sequencial do Registro' },
  ];

  // ========================================
  // LAYOUT TRAILER (TIPO 9)
  // ========================================
  camposTrailer: CampoLayout[] = [
    { nome: 'Tipo Registro', ini: 0, fim: 1, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['9'], cor: '#f8bbd0', descricao: 'Tipo 9 - Trailer' },
    { nome: 'Brancos', ini: 1, fim: 394, tamanho: 393, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos' },
    { nome: 'Seq. Registro', ini: 394, fim: 400, tamanho: 6, tipo: 'N', obrigatorio: true, cor: '#b2ebf2', descricao: 'Número Sequencial do Último Registro' },
  ];

  readonly codigosInstrucao: { codigo: string; descricao: string }[] = [
    { codigo: '01', descricao: 'Remessa' },
    { codigo: '02', descricao: 'Pedido de Baixa' },
    { codigo: '04', descricao: 'Concessão de Abatimento' },
    { codigo: '05', descricao: 'Cancelamento de Abatimento' },
    { codigo: '06', descricao: 'Prorrogação de Vencimento' },
    { codigo: '09', descricao: 'Protestar' },
    { codigo: '10', descricao: 'Sustar Protesto e Baixar' },
    { codigo: '11', descricao: 'Sustar Protesto e Manter em Carteira' },
    { codigo: '12', descricao: 'Alteração de Juros de Mora' },
    { codigo: '13', descricao: 'Cancelamento de Instrução de Protesto/Negativação' },
    { codigo: '19', descricao: 'Prazo Limite de Recebimento - Alterar' },
    { codigo: '26', descricao: 'Protesto Automático' },
    { codigo: '29', descricao: 'Negativação Automática' },
    { codigo: '31', descricao: 'Alteração de Outros Dados' },
  ];

  get campoEhInstrucao(): boolean {
    return !!this.campoAtivo?.nome.toLowerCase().includes('instrução') ||
           !!this.campoAtivo?.nome.toLowerCase().includes('instrucao') ||
           !!this.campoAtivo?.nome.toLowerCase().includes('ocorrência') ||
           !!this.campoAtivo?.nome.toLowerCase().includes('ocorrencia');
  }

  get descricaoInstrucaoAtual(): string {
    return this.codigosInstrucao.find(i => i.codigo === this.valorCampoAtivo.trim())?.descricao ?? '';
  }

  selecionarInstrucao(codigo: string): void {
    this.valorCampoAtivo = codigo;
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
    if (tipo === '2') return this.camposTipo2;
    if (tipo === '3') return this.camposRateio;
    if (tipo === '6') return this.camposTipo6;
    if (tipo === '7') return this.camposTipo7;
    if (tipo === '9') return this.camposTrailer;
    return [];
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
    a.download = 'remessa_bradesco_editada.REM';
    a.click();
    URL.revokeObjectURL(url);
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
      detalhes: 0,
      tipo2: 0,
      rateios: 0,
      tipo6: 0,
      tipo7: 0,
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
          this.estatisticas.detalhes++;
          break;
        case '2':
          campos = this.camposTipo2;
          this.estatisticas.tipo2++;
          break;
        case '3':
          campos = this.camposRateio;
          this.estatisticas.rateios++;
          break;
        case '6':
          campos = this.camposTipo6;
          this.estatisticas.tipo6++;
          break;
        case '7':
          campos = this.camposTipo7;
          this.estatisticas.tipo7++;
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
            mensagem: `Tipo de registro desconhecido: "${tipo}". Tipos válidos: 0 (Header), 1 (Detalhe), 2 (Mensagens), 3 (Rateio), 6 (Déb.Auto.), 7 (Benef.Final), 9 (Trailer)`,
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
      ...this.camposHeader, ...this.camposDetalhe, ...this.camposTipo2,
      ...this.camposRateio, ...this.camposTipo6, ...this.camposTipo7, ...this.camposTrailer
    ];
    this.legendaCampos = todosCampos.filter(
      (campo, index, self) => self.findIndex(c => c.nome === campo.nome) === index
    );

    return `<div class="cnab-mw">${lines.map((line, idx) => this.lineToMatrix(line, idx)).join('')}</div>`;
  }

  validarEstrutura(): void {
    if (!this.estatisticas) return;

    if (this.estatisticas.headers === 0) {
      this.erros.push({
        linha: 0, campo: 'Estrutura', posicao: '-', valor: '-',
        mensagem: 'Arquivo deve conter pelo menos um registro Header (Tipo 0)',
        severidade: 'erro'
      });
    }

    if (this.estatisticas.trailers === 0) {
      this.erros.push({
        linha: 0, campo: 'Estrutura', posicao: '-', valor: '-',
        mensagem: 'Arquivo deve conter pelo menos um registro Trailer (Tipo 9)',
        severidade: 'erro'
      });
    }

    if (this.estatisticas.detalhes === 0) {
      this.erros.push({
        linha: 0, campo: 'Estrutura', posicao: '-', valor: '-',
        mensagem: 'Aviso: Arquivo não contém registros de Detalhe (Tipo 1)',
        severidade: 'aviso'
      });
    }

    if (this.estatisticas.headers > 1) {
      this.erros.push({
        linha: 0, campo: 'Estrutura', posicao: '-', valor: '-',
        mensagem: `Aviso: Arquivo contém ${this.estatisticas.headers} Headers (normalmente 1)`,
        severidade: 'aviso'
      });
    }
  }

  validarCampo(linha: number, campo: CampoLayout, valor: string): void {
    const valorTrim = valor.trim();

    if (campo.obrigatorio && valorTrim === '') {
      this.erros.push({
        linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor,
        mensagem: 'Campo obrigatório está vazio',
        severidade: 'erro'
      });
      return;
    }

    if (!campo.obrigatorio && valorTrim === '') return;

    if (campo.tipo === 'N' && valorTrim !== '') {
      if (valor.includes(' ')) {
        this.erros.push({
          linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor,
          mensagem: 'Campo numérico contém espaços. Deve ser preenchido com zeros à esquerda.',
          severidade: 'erro'
        });
      }

      if (!/^\d+$/.test(valor)) {
        this.erros.push({
          linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor,
          mensagem: 'Deve conter apenas números (0-9)',
          severidade: 'erro'
        });
      }
    }

    if (campo.valores && valorTrim !== '') {
      if (!campo.valores.includes(valorTrim)) {
        this.erros.push({
          linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor,
          mensagem: `Valor inválido. Valores permitidos: ${campo.valores.join(', ')}`,
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
            linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor,
            mensagem: `Dia inválido: ${dia} (deve estar entre 01 e 31)`,
            severidade: 'erro'
          });
        }

        if (mes < 1 || mes > 12) {
          this.erros.push({
            linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor,
            mensagem: `Mês inválido: ${mes} (deve estar entre 01 e 12)`,
            severidade: 'erro'
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
      case '2':
        campos = this.camposTipo2;
        tipoNome = 'Mensagens';
        tipoColor = '#0288d1';
        break;
      case '3':
        campos = this.camposRateio;
        tipoNome = 'Rateio';
        tipoColor = '#f57c00';
        break;
      case '6':
        campos = this.camposTipo6;
        tipoNome = 'Déb.Automático';
        tipoColor = '#00796b';
        break;
      case '7':
        campos = this.camposTipo7;
        tipoNome = 'Benef.Final';
        tipoColor = '#5d4037';
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
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
