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
  rateios: number;
  trailers: number;
  desconhecidos: number;
}

@Component({
  selector: 'app-bradesco-retorno400-validador',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './bradesco-retorno400-validador.component.html',
  styleUrls: ['./bradesco-retorno400-validador.component.css']
})
export class BradescoRetorno400ValidadorComponent implements OnDestroy {
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
  editorPos: { top: number; left: number } | null = null;
  editorCarregando: boolean = false;
  aplicadoFeedback: boolean = false;
  totalEdicoes: number = 0;

  // Totais
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

  readonly codigosOcorrencia: { codigo: string; descricao: string }[] = [
    { codigo: '02', descricao: 'Entrada Confirmada' },
    { codigo: '03', descricao: 'Entrada Rejeitada' },
    { codigo: '06', descricao: 'Liquidação Normal' },
    { codigo: '07', descricao: 'Liquidação Parcial' },
    { codigo: '09', descricao: 'Baixa por Comando do Cliente' },
    { codigo: '10', descricao: 'Baixado Conforme Instruções da Agência' },
    { codigo: '11', descricao: 'Em Ser (Títulos em Aberto)' },
    { codigo: '12', descricao: 'Abatimento Concedido' },
    { codigo: '13', descricao: 'Abatimento Cancelado' },
    { codigo: '14', descricao: 'Vencimento Alterado' },
    { codigo: '17', descricao: 'Liquidação após Baixa' },
    { codigo: '19', descricao: 'Confirmação de Instrução de Protesto' },
    { codigo: '20', descricao: 'Confirmação de Sustação de Protesto' },
    { codigo: '21', descricao: 'Remessa a Cartório' },
    { codigo: '22', descricao: 'Instrução Rejeitada' },
    { codigo: '25', descricao: 'Confirmação de Negativação' },
    { codigo: '26', descricao: 'Confirmação de Sustação de Negativação' },
    { codigo: '28', descricao: 'Débito de Custas de Protesto' },
  ];

  get campoEhOcorrencia(): boolean {
    const nome = this.campoAtivo?.nome.toLowerCase() ?? '';
    return nome.includes('ocorr') || nome.includes('ocorrência');
  }

  get descricaoOcorrencia(): string {
    const cod = this.valorCampoAtivo?.trim();
    return this.codigosOcorrencia.find(o => o.codigo === cod)?.descricao ?? '';
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
    if (tipo === '0' && ident === '2') return this.camposHeaderRetorno;
    if (tipo === '1') return this.camposDetalheRetorno;
    if (tipo === '3') return this.camposRateioRetorno;
    if (tipo === '9' && ident === '2') return this.camposTrailerRetorno;
    return [];
  }

  // ========================================
  // LAYOUT HEADER RETORNO (TIPO 0 com ident '2')
  // ========================================
  camposHeaderRetorno: CampoLayout[] = [
    { nome: 'Tipo Registro', ini: 0, fim: 1, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['0'], cor: '#f8bbd0', descricao: 'Identificação do Registro Header' },
    { nome: 'Ident. Arquivo', ini: 1, fim: 2, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['2'], cor: '#ffe082', descricao: 'Identificação do Arquivo-Retorno (2=Retorno)' },
    { nome: 'Literal Retorno', ini: 2, fim: 9, tamanho: 7, tipo: 'A', obrigatorio: true, valores: ['RETORNO'], cor: '#b2dfdb', descricao: 'Literal RETORNO' },
    { nome: 'Cód. Serviço', ini: 9, fim: 11, tamanho: 2, tipo: 'N', obrigatorio: true, valores: ['01'], cor: '#c5cae9', descricao: 'Código de Serviço (01=Cobrança)' },
    { nome: 'Literal Serviço', ini: 11, fim: 26, tamanho: 15, tipo: 'A', obrigatorio: true, valores: ['COBRANCA'], cor: '#e1bee7', descricao: 'Literal COBRANCA (15 posições)' },
    { nome: 'Cód. Empresa', ini: 26, fim: 46, tamanho: 20, tipo: 'N', obrigatorio: true, cor: '#b3e5fc', descricao: 'Código da Empresa fornecido pelo Bradesco (20 posições)' },
    { nome: 'Nome Empresa', ini: 46, fim: 76, tamanho: 30, tipo: 'A', obrigatorio: true, cor: '#ffecb3', descricao: 'Razão Social da Empresa (30 posições)' },
    { nome: 'Cód. Banco', ini: 76, fim: 79, tamanho: 3, tipo: 'N', obrigatorio: true, valores: ['237'], cor: '#ffccbc', descricao: 'Número do Bradesco na Compensação (237)' },
    { nome: 'Nome Banco', ini: 79, fim: 94, tamanho: 15, tipo: 'A', obrigatorio: true, valores: ['BRADESCO'], cor: '#dcedc8', descricao: 'Nome do Banco por Extenso (15 posições)' },
    { nome: 'Data Gravação', ini: 94, fim: 100, tamanho: 6, tipo: 'N', obrigatorio: true, formato: 'DDMMAA', cor: '#fff9c4', descricao: 'Data da Gravação do Arquivo (DDMMAA)' },
    { nome: 'Densidade', ini: 100, fim: 108, tamanho: 8, tipo: 'N', obrigatorio: false, cor: '#f5f5f5', descricao: 'Densidade de Gravação (01600000)' },
    { nome: 'Nº Aviso Banc.', ini: 108, fim: 113, tamanho: 5, tipo: 'N', obrigatorio: false, cor: '#b2ebf2', descricao: 'Número Aviso Bancário' },
    { nome: 'Brancos', ini: 113, fim: 379, tamanho: 266, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Espaços em branco (266 posições)' },
    { nome: 'Data Crédito', ini: 379, fim: 385, tamanho: 6, tipo: 'N', obrigatorio: false, formato: 'DDMMAA', cor: '#c5e1a5', descricao: 'Data de Crédito (DDMMAA)' },
    { nome: 'Brancos', ini: 385, fim: 394, tamanho: 9, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Espaços em branco (9 posições)' },
    { nome: 'Seq. Registro', ini: 394, fim: 400, tamanho: 6, tipo: 'N', obrigatorio: true, valores: ['000001'], cor: '#b2ebf2', descricao: 'Número Sequencial do Registro (deve ser 000001)' },
  ];

  // ========================================
  // LAYOUT DETALHE RETORNO (TIPO 1)
  // ========================================
  camposDetalheRetorno: CampoLayout[] = [
    { nome: 'Tipo Registro', ini: 0, fim: 1, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['1'], cor: '#f8bbd0', descricao: 'Identificação do Registro Detalhe' },
    { nome: 'Tipo Inscrição', ini: 1, fim: 3, tamanho: 2, tipo: 'N', obrigatorio: true, valores: ['01', '02'], cor: '#ffe082', descricao: '01=CPF, 02=CNPJ' },
    { nome: 'CPF/CNPJ Empresa', ini: 3, fim: 17, tamanho: 14, tipo: 'N', obrigatorio: true, cor: '#ffcc80', descricao: 'CPF/CNPJ da Empresa (14 posições)' },
    { nome: 'Zeros', ini: 17, fim: 20, tamanho: 3, tipo: 'N', obrigatorio: false, cor: '#f5f5f5', descricao: 'Zeros (3 posições)' },
    { nome: 'Ident. Empresa', ini: 20, fim: 37, tamanho: 17, tipo: 'A', obrigatorio: true, cor: '#e1bee7', descricao: 'Identificação da Empresa no Banco (17 posições)' },
    { nome: 'Nº Controle', ini: 37, fim: 62, tamanho: 25, tipo: 'A', obrigatorio: false, cor: '#d1c4e9', descricao: 'Número de Controle do Participante (25 posições)' },
    { nome: 'Zeros', ini: 62, fim: 70, tamanho: 8, tipo: 'N', obrigatorio: false, cor: '#f5f5f5', descricao: 'Zeros (8 posições)' },
    { nome: 'Nosso Número', ini: 70, fim: 82, tamanho: 12, tipo: 'N', obrigatorio: true, cor: '#ffccbc', descricao: 'Identificação do Título no Banco (12 posições)' },
    { nome: 'Uso Banco', ini: 82, fim: 92, tamanho: 10, tipo: 'N', obrigatorio: false, cor: '#f5f5f5', descricao: 'Uso do Banco - Zeros (10 posições)' },
    { nome: 'Uso Banco 2', ini: 92, fim: 104, tamanho: 12, tipo: 'N', obrigatorio: false, cor: '#f5f5f5', descricao: 'Uso do Banco - Zeros (12 posições)' },
    { nome: 'Rateio Crédito', ini: 104, fim: 105, tamanho: 1, tipo: 'A', obrigatorio: false, valores: ['R', ' '], cor: '#c8e6c9', descricao: 'Indicador de Rateio Crédito (R ou branco)' },
    { nome: 'Pgto Parcial', ini: 105, fim: 107, tamanho: 2, tipo: 'N', obrigatorio: false, cor: '#a5d6a7', descricao: 'Pagamento Parcial (00=Não informado)' },
    { nome: 'Carteira', ini: 107, fim: 108, tamanho: 1, tipo: 'N', obrigatorio: true, cor: '#b3e5fc', descricao: 'Carteira' },
    { nome: 'Cód. Ocorrência', ini: 108, fim: 110, tamanho: 2, tipo: 'N', obrigatorio: true, cor: '#4db6ac', descricao: 'Código da Ocorrência (02, 06, 09, 10, etc.)' },
    { nome: 'Data Ocorrência', ini: 110, fim: 116, tamanho: 6, tipo: 'N', obrigatorio: true, formato: 'DDMMAA', cor: '#fff9c4', descricao: 'Data da Ocorrência no Banco (DDMMAA)' },
    { nome: 'Nº Documento', ini: 116, fim: 126, tamanho: 10, tipo: 'A', obrigatorio: true, cor: '#dcedc8', descricao: 'Número do Documento (10 posições)' },
    { nome: 'Nosso Nº Conf.', ini: 126, fim: 146, tamanho: 20, tipo: 'N', obrigatorio: false, cor: '#ffccbc', descricao: 'Confirmação Nosso Número (20 posições)' },
    { nome: 'Vencimento', ini: 146, fim: 152, tamanho: 6, tipo: 'N', obrigatorio: true, formato: 'DDMMAA', cor: '#fff59d', descricao: 'Data de Vencimento (DDMMAA)' },
    { nome: 'Valor Título', ini: 152, fim: 165, tamanho: 13, tipo: 'N', obrigatorio: true, cor: '#ffcdd2', descricao: 'Valor do Título (13 posições - centavos)' },
    { nome: 'Banco Cobrador', ini: 165, fim: 168, tamanho: 3, tipo: 'N', obrigatorio: false, cor: '#b3e5fc', descricao: 'Código do Banco Cobrador (3 posições)' },
    { nome: 'Agência Cobradora', ini: 168, fim: 173, tamanho: 5, tipo: 'N', obrigatorio: false, cor: '#81d4fa', descricao: 'Agência Cobradora (5 posições)' },
    { nome: 'Espécie', ini: 173, fim: 175, tamanho: 2, tipo: 'N', obrigatorio: true, cor: '#29b6f6', descricao: 'Espécie do Título' },
    { nome: 'Desp. Cobrança', ini: 175, fim: 188, tamanho: 13, tipo: 'N', obrigatorio: false, cor: '#b2dfdb', descricao: 'Despesas de Cobrança (13 posições - centavos)' },
    { nome: 'Outras Despesas', ini: 188, fim: 201, tamanho: 13, tipo: 'N', obrigatorio: false, cor: '#80cbc4', descricao: 'Outras Despesas/Custas Protesto (13 posições)' },
    { nome: 'Juros Atraso', ini: 201, fim: 214, tamanho: 13, tipo: 'N', obrigatorio: false, cor: '#4db6ac', descricao: 'Juros Operação em Atraso (13 posições)' },
    { nome: 'Valor IOF', ini: 214, fim: 227, tamanho: 13, tipo: 'N', obrigatorio: false, cor: '#26a69a', descricao: 'Valor IOF (13 posições - centavos)' },
    { nome: 'Valor Abatimento', ini: 227, fim: 240, tamanho: 13, tipo: 'N', obrigatorio: false, cor: '#009688', descricao: 'Valor do Abatimento (13 posições - centavos)' },
    { nome: 'Valor Desconto', ini: 240, fim: 253, tamanho: 13, tipo: 'N', obrigatorio: false, cor: '#00897b', descricao: 'Valor do Desconto (13 posições - centavos)' },
    { nome: 'Valor Pago', ini: 253, fim: 266, tamanho: 13, tipo: 'N', obrigatorio: true, cor: '#00695c', descricao: 'Valor Pago (13 posições - centavos)' },
    { nome: 'Juros Mora', ini: 266, fim: 279, tamanho: 13, tipo: 'N', obrigatorio: false, cor: '#e0f7fa', descricao: 'Juros de Mora (13 posições - centavos)' },
    { nome: 'Outros Créditos', ini: 279, fim: 292, tamanho: 13, tipo: 'N', obrigatorio: false, cor: '#b2ebf2', descricao: 'Outros Créditos (13 posições)' },
    { nome: 'Brancos', ini: 292, fim: 294, tamanho: 2, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos (2 posições)' },
    { nome: 'Motivo Cód. Oc.', ini: 294, fim: 295, tamanho: 1, tipo: 'A', obrigatorio: false, valores: ['A', 'D', ' '], cor: '#80deea', descricao: 'Motivo Código Ocorrência 19/25 (A=Aceito, D=Desprezado)' },
    { nome: 'Data Crédito', ini: 295, fim: 301, tamanho: 6, tipo: 'N', obrigatorio: false, formato: 'DDMMAA', cor: '#c5e1a5', descricao: 'Data do Crédito (DDMMAA)' },
    { nome: 'Origem Pgto', ini: 301, fim: 304, tamanho: 3, tipo: 'N', obrigatorio: false, cor: '#4dd0e1', descricao: 'Origem do Pagamento (3 posições)' },
    { nome: 'Brancos', ini: 304, fim: 314, tamanho: 10, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos (10 posições)' },
    { nome: 'Banco Cheque', ini: 314, fim: 318, tamanho: 4, tipo: 'N', obrigatorio: false, valores: ['0237', '0000'], cor: '#26c6da', descricao: 'Quando Cheque Bradesco informe 0237 (4 posições)' },
    { nome: 'Motivos Rejeição', ini: 318, fim: 328, tamanho: 10, tipo: 'A', obrigatorio: false, cor: '#ef9a9a', descricao: 'Motivos das Rejeições (10 posições)' },
    { nome: 'Brancos', ini: 328, fim: 368, tamanho: 40, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos (40 posições)' },
    { nome: 'Nº Cartório', ini: 368, fim: 370, tamanho: 2, tipo: 'N', obrigatorio: false, cor: '#bcaaa4', descricao: 'Número do Cartório (2 posições)' },
    { nome: 'Nº Protocolo', ini: 370, fim: 380, tamanho: 10, tipo: 'N', obrigatorio: false, cor: '#a1887f', descricao: 'Número do Protocolo (10 posições)' },
    { nome: 'Brancos', ini: 380, fim: 394, tamanho: 14, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos (14 posições)' },
    { nome: 'Seq. Registro', ini: 394, fim: 400, tamanho: 6, tipo: 'N', obrigatorio: true, cor: '#b2ebf2', descricao: 'Número Sequencial do Registro' },
  ];

  // ========================================
  // LAYOUT RATEIO DE CRÉDITO (TIPO 3)
  // ========================================
  camposRateioRetorno: CampoLayout[] = [
    { nome: 'Tipo Registro', ini: 0, fim: 1, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['3'], cor: '#f8bbd0', descricao: 'Identificação do Registro Rateio' },
    { nome: 'Ident. Empresa', ini: 1, fim: 17, tamanho: 16, tipo: 'A', obrigatorio: true, cor: '#e1bee7', descricao: 'Identificação da Empresa no Banco (16 posições)' },
    { nome: 'Nosso Número', ini: 17, fim: 29, tamanho: 12, tipo: 'N', obrigatorio: true, cor: '#ffccbc', descricao: 'Identificação Título no Banco (12 posições)' },
    { nome: 'Cód. Cálc. Rateio', ini: 29, fim: 30, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['1', '2', '3'], cor: '#ffe082', descricao: '1=Valor Cobrado, 2=Valor Registro, 3=Menor Valor' },
    { nome: 'Tipo Valor Info', ini: 30, fim: 31, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['1', '2'], cor: '#fff9c4', descricao: '1=Percentual, 2=Valor' },
    { nome: 'Brancos', ini: 31, fim: 43, tamanho: 12, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Filler - Brancos (12 posições)' },
    { nome: 'Banco 1º Benef.', ini: 43, fim: 46, tamanho: 3, tipo: 'N', obrigatorio: true, valores: ['237'], cor: '#b3e5fc', descricao: 'Código Banco 1º Beneficiário (237)' },
    { nome: 'Agência 1º Benef.', ini: 46, fim: 51, tamanho: 5, tipo: 'N', obrigatorio: true, cor: '#81d4fa', descricao: 'Agência 1º Beneficiário (5 posições)' },
    { nome: 'Dig. Ag. 1º Benef.', ini: 51, fim: 52, tamanho: 1, tipo: 'A', obrigatorio: true, cor: '#4fc3f7', descricao: 'Dígito Agência 1º Beneficiário' },
    { nome: 'Conta 1º Benef.', ini: 52, fim: 64, tamanho: 12, tipo: 'N', obrigatorio: true, cor: '#29b6f6', descricao: 'Conta-Corrente 1º Beneficiário (12 posições)' },
    { nome: 'Dig. Conta 1º Benef.', ini: 64, fim: 65, tamanho: 1, tipo: 'A', obrigatorio: true, cor: '#039be5', descricao: 'Dígito Conta 1º Beneficiário' },
    { nome: 'Valor Rateio 1º', ini: 65, fim: 80, tamanho: 15, tipo: 'N', obrigatorio: true, cor: '#ffcdd2', descricao: 'Valor Efetivo Rateio 1º Benef. (15 posições)' },
    { nome: 'Nome 1º Benef.', ini: 80, fim: 120, tamanho: 40, tipo: 'A', obrigatorio: true, cor: '#ffecb3', descricao: 'Nome do 1º Beneficiário (40 posições)' },
    { nome: 'Brancos', ini: 120, fim: 141, tamanho: 21, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Filler - Brancos (21 posições)' },
    { nome: 'Parcela 1º', ini: 141, fim: 147, tamanho: 6, tipo: 'N', obrigatorio: false, cor: '#c8e6c9', descricao: 'Identificação da Parcela 1º Benef. (6 posições)' },
    { nome: 'Floating 1º', ini: 147, fim: 150, tamanho: 3, tipo: 'N', obrigatorio: false, cor: '#a5d6a7', descricao: 'Floating 1º Beneficiário (3 posições - dias)' },
    { nome: 'Data Créd. 1º', ini: 150, fim: 158, tamanho: 8, tipo: 'N', obrigatorio: false, formato: 'DDMMAAAA', cor: '#fff59d', descricao: 'Data Crédito 1º Benef. (DDMMAAAA)' },
    { nome: 'Status 1º', ini: 158, fim: 160, tamanho: 2, tipo: 'N', obrigatorio: false, cor: '#ef9a9a', descricao: 'Status/Motivo Ocorrência Rateio 1º (2 posições)' },
    { nome: 'Banco 2º Benef.', ini: 160, fim: 163, tamanho: 3, tipo: 'N', obrigatorio: false, valores: ['237', '000'], cor: '#b3e5fc', descricao: 'Código Banco 2º Beneficiário' },
    { nome: 'Agência 2º Benef.', ini: 163, fim: 168, tamanho: 5, tipo: 'N', obrigatorio: false, cor: '#81d4fa', descricao: 'Agência 2º Beneficiário (5 posições)' },
    { nome: 'Dig. Ag. 2º Benef.', ini: 168, fim: 169, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#4fc3f7', descricao: 'Dígito Agência 2º Beneficiário' },
    { nome: 'Conta 2º Benef.', ini: 169, fim: 181, tamanho: 12, tipo: 'N', obrigatorio: false, cor: '#29b6f6', descricao: 'Conta-Corrente 2º Beneficiário (12 posições)' },
    { nome: 'Dig. Conta 2º Benef.', ini: 181, fim: 182, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#039be5', descricao: 'Dígito Conta 2º Beneficiário' },
    { nome: 'Valor Rateio 2º', ini: 182, fim: 197, tamanho: 15, tipo: 'N', obrigatorio: false, cor: '#ffcdd2', descricao: 'Valor Efetivo Rateio 2º Benef. (15 posições)' },
    { nome: 'Nome 2º Benef.', ini: 197, fim: 237, tamanho: 40, tipo: 'A', obrigatorio: false, cor: '#ffecb3', descricao: 'Nome do 2º Beneficiário (40 posições)' },
    { nome: 'Brancos', ini: 237, fim: 258, tamanho: 21, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Filler - Brancos (21 posições)' },
    { nome: 'Parcela 2º', ini: 258, fim: 264, tamanho: 6, tipo: 'N', obrigatorio: false, cor: '#c8e6c9', descricao: 'Identificação da Parcela 2º Benef. (6 posições)' },
    { nome: 'Floating 2º', ini: 264, fim: 267, tamanho: 3, tipo: 'N', obrigatorio: false, cor: '#a5d6a7', descricao: 'Floating 2º Beneficiário (3 posições - dias)' },
    { nome: 'Data Créd. 2º', ini: 267, fim: 275, tamanho: 8, tipo: 'N', obrigatorio: false, formato: 'DDMMAAAA', cor: '#fff59d', descricao: 'Data Crédito 2º Benef. (DDMMAAAA)' },
    { nome: 'Status 2º', ini: 275, fim: 277, tamanho: 2, tipo: 'N', obrigatorio: false, cor: '#ef9a9a', descricao: 'Status/Motivo Ocorrência Rateio 2º (2 posições)' },
    { nome: 'Banco 3º Benef.', ini: 277, fim: 280, tamanho: 3, tipo: 'N', obrigatorio: false, valores: ['237', '000'], cor: '#b3e5fc', descricao: 'Código Banco 3º Beneficiário' },
    { nome: 'Agência 3º Benef.', ini: 280, fim: 285, tamanho: 5, tipo: 'N', obrigatorio: false, cor: '#81d4fa', descricao: 'Agência 3º Beneficiário (5 posições)' },
    { nome: 'Dig. Ag. 3º Benef.', ini: 285, fim: 286, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#4fc3f7', descricao: 'Dígito Agência 3º Beneficiário' },
    { nome: 'Conta 3º Benef.', ini: 286, fim: 298, tamanho: 12, tipo: 'N', obrigatorio: false, cor: '#29b6f6', descricao: 'Conta-Corrente 3º Beneficiário (12 posições)' },
    { nome: 'Dig. Conta 3º Benef.', ini: 298, fim: 299, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#039be5', descricao: 'Dígito Conta 3º Beneficiário' },
    { nome: 'Valor Rateio 3º', ini: 299, fim: 314, tamanho: 15, tipo: 'N', obrigatorio: false, cor: '#ffcdd2', descricao: 'Valor Efetivo Rateio 3º Benef. (15 posições)' },
    { nome: 'Nome 3º Benef.', ini: 314, fim: 354, tamanho: 40, tipo: 'A', obrigatorio: false, cor: '#ffecb3', descricao: 'Nome do 3º Beneficiário (40 posições)' },
    { nome: 'Brancos', ini: 354, fim: 375, tamanho: 21, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Filler - Brancos (21 posições)' },
    { nome: 'Parcela 3º', ini: 375, fim: 381, tamanho: 6, tipo: 'N', obrigatorio: false, cor: '#c8e6c9', descricao: 'Identificação da Parcela 3º Benef. (6 posições)' },
    { nome: 'Floating 3º', ini: 381, fim: 384, tamanho: 3, tipo: 'N', obrigatorio: false, cor: '#a5d6a7', descricao: 'Floating 3º Beneficiário (3 posições - dias)' },
    { nome: 'Data Créd. 3º', ini: 384, fim: 392, tamanho: 8, tipo: 'N', obrigatorio: false, formato: 'DDMMAAAA', cor: '#fff59d', descricao: 'Data Crédito 3º Benef. (DDMMAAAA)' },
    { nome: 'Status 3º', ini: 392, fim: 394, tamanho: 2, tipo: 'N', obrigatorio: false, cor: '#ef9a9a', descricao: 'Status/Motivo Ocorrência Rateio 3º (2 posições)' },
    { nome: 'Seq. Registro', ini: 394, fim: 400, tamanho: 6, tipo: 'N', obrigatorio: true, cor: '#b2ebf2', descricao: 'Número Sequencial do Registro' },
  ];

  // ========================================
  // LAYOUT TRAILER RETORNO (TIPO 9 com ident '2')
  // ========================================
  camposTrailerRetorno: CampoLayout[] = [
    { nome: 'Tipo Registro', ini: 0, fim: 1, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['9'], cor: '#f8bbd0', descricao: 'Identificação do Registro Trailer' },
    { nome: 'Retorno', ini: 1, fim: 2, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['2'], cor: '#ffe082', descricao: 'Identificação Retorno (2)' },
    { nome: 'Tipo Serviço', ini: 2, fim: 4, tamanho: 2, tipo: 'N', obrigatorio: true, valores: ['01'], cor: '#b2dfdb', descricao: 'Tipo de Serviço (01=Cobrança)' },
    { nome: 'Cód. Banco', ini: 4, fim: 7, tamanho: 3, tipo: 'N', obrigatorio: true, valores: ['237'], cor: '#c5cae9', descricao: 'Código do Banco (237)' },
    { nome: 'Brancos', ini: 7, fim: 17, tamanho: 10, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos (10 posições)' },
    { nome: 'Qtd. Títulos Cobr.', ini: 17, fim: 25, tamanho: 8, tipo: 'N', obrigatorio: false, cor: '#e1bee7', descricao: 'Quantidade de Títulos em Cobrança (8 posições)' },
    { nome: 'Valor Total Cobr.', ini: 25, fim: 39, tamanho: 14, tipo: 'N', obrigatorio: false, cor: '#ffcdd2', descricao: 'Valor Total em Cobrança (14 posições)' },
    { nome: 'Aviso Bancário', ini: 39, fim: 47, tamanho: 8, tipo: 'N', obrigatorio: false, cor: '#b3e5fc', descricao: 'Número do Aviso Bancário (8 posições)' },
    { nome: 'Brancos', ini: 47, fim: 57, tamanho: 10, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos (10 posições)' },
    { nome: 'Qtd. Reg. Oc. 02', ini: 57, fim: 62, tamanho: 5, tipo: 'N', obrigatorio: false, cor: '#fff9c4', descricao: 'Qtd Registros Ocorrência 02 - Entradas (5 posições)' },
    { nome: 'Valor Reg. Oc. 02', ini: 62, fim: 74, tamanho: 12, tipo: 'N', obrigatorio: false, cor: '#fff59d', descricao: 'Valor Registros Ocorrência 02 (12 posições)' },
    { nome: 'Valor Reg. Oc. 06', ini: 74, fim: 86, tamanho: 12, tipo: 'N', obrigatorio: false, cor: '#dcedc8', descricao: 'Valor Registros Ocorrência 06 - Liquidação (12 posições)' },
    { nome: 'Qtd. Reg. Oc. 06', ini: 86, fim: 91, tamanho: 5, tipo: 'N', obrigatorio: false, cor: '#c5e1a5', descricao: 'Qtd Registros Ocorrência 06 - Liquidação (5 posições)' },
    { nome: 'Valor Reg. Oc. 06b', ini: 91, fim: 103, tamanho: 12, tipo: 'N', obrigatorio: false, cor: '#aed581', descricao: 'Valor Registros Ocorrência 06 (12 posições)' },
    { nome: 'Qtd. Reg. Oc. 09/10', ini: 103, fim: 108, tamanho: 5, tipo: 'N', obrigatorio: false, cor: '#81c784', descricao: 'Qtd Registros Ocorrência 09/10 - Baixados (5 posições)' },
    { nome: 'Valor Reg. Oc. 09/10', ini: 108, fim: 120, tamanho: 12, tipo: 'N', obrigatorio: false, cor: '#66bb6a', descricao: 'Valor Registros Ocorrência 09/10 - Baixados (12 posições)' },
    { nome: 'Qtd. Reg. Oc. 13', ini: 120, fim: 125, tamanho: 5, tipo: 'N', obrigatorio: false, cor: '#ffb74d', descricao: 'Qtd Registros Ocorrência 13 - Abat. Cancelado (5 posições)' },
    { nome: 'Valor Reg. Oc. 13', ini: 125, fim: 137, tamanho: 12, tipo: 'N', obrigatorio: false, cor: '#ff9800', descricao: 'Valor Registros Ocorrência 13 - Abat. Cancelado (12 posições)' },
    { nome: 'Qtd. Reg. Oc. 14', ini: 137, fim: 142, tamanho: 5, tipo: 'N', obrigatorio: false, cor: '#90caf9', descricao: 'Qtd Registros Ocorrência 14 - Venc. Alterado (5 posições)' },
    { nome: 'Valor Reg. Oc. 14', ini: 142, fim: 154, tamanho: 12, tipo: 'N', obrigatorio: false, cor: '#64b5f6', descricao: 'Valor Registros Ocorrência 14 - Venc. Alterado (12 posições)' },
    { nome: 'Qtd. Reg. Oc. 12', ini: 154, fim: 159, tamanho: 5, tipo: 'N', obrigatorio: false, cor: '#ce93d8', descricao: 'Qtd Registros Ocorrência 12 - Abat. Concedido (5 posições)' },
    { nome: 'Valor Reg. Oc. 12', ini: 159, fim: 171, tamanho: 12, tipo: 'N', obrigatorio: false, cor: '#ba68c8', descricao: 'Valor Registros Ocorrência 12 - Abat. Concedido (12 posições)' },
    { nome: 'Qtd. Reg. Oc. 19', ini: 171, fim: 176, tamanho: 5, tipo: 'N', obrigatorio: false, cor: '#ef9a9a', descricao: 'Qtd Registros Ocorrência 19 - Conf. Protesto (5 posições)' },
    { nome: 'Valor Reg. Oc. 19', ini: 176, fim: 188, tamanho: 12, tipo: 'N', obrigatorio: false, cor: '#e57373', descricao: 'Valor Registros Ocorrência 19 - Conf. Protesto (12 posições)' },
    { nome: 'Brancos', ini: 188, fim: 362, tamanho: 174, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos (174 posições)' },
    { nome: 'Valor Total Rateios', ini: 362, fim: 377, tamanho: 15, tipo: 'N', obrigatorio: false, cor: '#ffcc80', descricao: 'Valor Total dos Rateios Efetuados (15 posições)' },
    { nome: 'Qtd. Total Rateios', ini: 377, fim: 385, tamanho: 8, tipo: 'N', obrigatorio: false, cor: '#ffb74d', descricao: 'Quantidade Total dos Rateios Efetuados (8 posições)' },
    { nome: 'Brancos', ini: 385, fim: 394, tamanho: 9, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos (9 posições)' },
    { nome: 'Seq. Registro', ini: 394, fim: 400, tamanho: 6, tipo: 'N', obrigatorio: true, cor: '#b2ebf2', descricao: 'Número Sequencial do Registro' },
  ];

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
        this.error = 'Erro ao processar o arquivo. Verifique se é um arquivo de Retorno CNAB 400 válido.';
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
    this.calcularTotaisRetorno();
  }

  calcularTotaisRetorno(): void {
    const detalhes = this.linhasEditadas.filter(l => l[0] === '1');
    if (detalhes.length === 0) { this.totaisRetorno = null; return; }

    let liquidacoes = 0, valorTotalPago = 0, entradasConfirmadas = 0, baixas = 0, rejeitadas = 0;

    for (const l of detalhes) {
      const ocor = l.substring(108, 110);
      if (ocor === '06' || ocor === '07') {
        liquidacoes++;
        valorTotalPago += parseInt(l.substring(253, 266) || '0', 10);
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

  gerarRetorno(): void {
    const conteudo = this.linhasEditadas.join('\r\n');
    const bytes = new Uint8Array(conteudo.length);
    for (let i = 0; i < conteudo.length; i++) {
      bytes[i] = conteudo.charCodeAt(i) & 0xff;
    }
    const blob = new Blob([bytes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'retorno_bradesco_editado.RET';
    a.click();
    URL.revokeObjectURL(url);
  }

  validarEHighlight(content: string): string {
    const lines = content.split(/\r?\n/).filter(l => l.length > 0);
    if (lines.length === 0) {
      this.error = 'Arquivo vazio ou sem linhas válidas.';
      return '';
    }

    this.estatisticas = { totalLinhas: lines.length, headers: 0, detalhes: 0, rateios: 0, trailers: 0, desconhecidos: 0 };
    let sequenciaEsperada = 1;

    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];
      const tipo = line[0];
      const ident = line.length > 1 ? line[1] : '';
      let campos: CampoLayout[];

      if (tipo === '0' && ident === '2') {
        campos = this.camposHeaderRetorno;
        this.estatisticas.headers++;
      } else if (tipo === '1') {
        campos = this.camposDetalheRetorno;
        this.estatisticas.detalhes++;
      } else if (tipo === '3') {
        campos = this.camposRateioRetorno;
        this.estatisticas.rateios++;
      } else if (tipo === '9' && ident === '2') {
        campos = this.camposTrailerRetorno;
        this.estatisticas.trailers++;
      } else {
        campos = [];
        this.estatisticas.desconhecidos++;
        this.erros.push({
          linha: idx + 1, campo: 'Tipo Registro', posicao: '1-2', valor: tipo + ident,
          mensagem: `Tipo desconhecido: "${tipo}${ident}". Esperado: 02 (Header), 1 (Detalhe), 3 (Rateio), 92 (Trailer)`,
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

      const seqCampo = campos.find(c => c.nome === 'Seq. Registro');
      if (seqCampo && line.length >= 400) {
        const valorSeq = line.slice(seqCampo.ini, seqCampo.fim).trim();
        const sequenciaAtual = parseInt(valorSeq, 10);
        if (!isNaN(sequenciaAtual) && sequenciaAtual !== sequenciaEsperada) {
          this.erros.push({
            linha: idx + 1, campo: 'Seq. Registro',
            posicao: `${seqCampo.ini + 1}-${seqCampo.fim}`, valor: valorSeq,
            mensagem: `Sequência incorreta. Esperado: ${String(sequenciaEsperada).padStart(6, '0')}, Encontrado: ${valorSeq}`,
            severidade: 'erro'
          });
        }
        sequenciaEsperada++;
      }
    }

    this.validarEstrutura();

    const todosCampos = [...this.camposHeaderRetorno, ...this.camposDetalheRetorno, ...this.camposRateioRetorno, ...this.camposTrailerRetorno];
    this.legendaCampos = todosCampos.filter(
      (campo, index, self) => self.findIndex(c => c.nome === campo.nome) === index
    );

    return `<div class="cnab-mw">${lines.map((line, idx) => this.lineToMatrix(line, idx)).join('')}</div>`;
  }

  validarEstrutura(): void {
    if (!this.estatisticas) return;
    if (this.estatisticas.headers === 0) {
      this.erros.push({ linha: 0, campo: 'Estrutura', posicao: '-', valor: '-', mensagem: 'Arquivo deve conter pelo menos um Header de Retorno (Tipo 02)', severidade: 'erro' });
    }
    if (this.estatisticas.trailers === 0) {
      this.erros.push({ linha: 0, campo: 'Estrutura', posicao: '-', valor: '-', mensagem: 'Arquivo deve conter pelo menos um Trailer de Retorno (Tipo 92)', severidade: 'erro' });
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

    if (campo.valores && valorTrim !== '') {
      if (!campo.valores.includes(valorTrim)) {
        this.erros.push({ linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor, mensagem: `Valor inválido. Valores permitidos: ${campo.valores.join(', ')}`, severidade: 'erro' });
      }
    }

    if (campo.formato === 'DDMMAA' && valorTrim !== '' && valorTrim !== '000000') {
      if (valor.length === 6 && /^\d{6}$/.test(valor)) {
        const dia = parseInt(valor.slice(0, 2), 10);
        const mes = parseInt(valor.slice(2, 4), 10);
        if (dia < 1 || dia > 31) {
          this.erros.push({ linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor, mensagem: `Dia inválido: ${dia} (deve estar entre 01 e 31)`, severidade: 'erro' });
        }
        if (mes < 1 || mes > 12) {
          this.erros.push({ linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor, mensagem: `Mês inválido: ${mes} (deve estar entre 01 e 12)`, severidade: 'erro' });
        }
      }
    }
  }

  lineToMatrix(line: string, lineIdx: number): string {
    const tipo = line[0];
    const ident = line.length > 1 ? line[1] : '';
    let campos: CampoLayout[];
    let tipoNome = '';
    let tipoColor = '';

    if (tipo === '0' && ident === '2') {
      campos = this.camposHeaderRetorno;
      tipoNome = 'Header Retorno';
      tipoColor = '#7b1fa2';
    } else if (tipo === '1') {
      campos = this.camposDetalheRetorno;
      tipoNome = 'Detalhe Retorno';
      tipoColor = '#388e3c';
    } else if (tipo === '3') {
      campos = this.camposRateioRetorno;
      tipoNome = 'Rateio Retorno';
      tipoColor = '#f57c00';
    } else if (tipo === '9' && ident === '2') {
      campos = this.camposTrailerRetorno;
      tipoNome = 'Trailer Retorno';
      tipoColor = '#c2185b';
    } else {
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
