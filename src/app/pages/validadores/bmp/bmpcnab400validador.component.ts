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
  tipo1: number;
  tipo2: number;
  trailers: number;
  desconhecidos: number;
}

@Component({
  selector: 'app-bmp-cnab400-validador',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './bmpcnab400validador.component.html',
  styleUrls: ['./bmpcnab400validador.component.css']
})
export class BmpCnab400ValidadorComponent implements OnDestroy {
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
  // LAYOUT HEADER (TIPO 0) - Posições 001-400
  // Seguindo documentação oficial BMP CNAB 400
  // ========================================
  camposHeader: CampoLayout[] = [
    { nome: 'Identificação do Registro', ini: 0, fim: 1, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['0'], cor: '#f8bbd0', descricao: 'Tipo 0 - Header' },
    { nome: 'Identificação do Arquivo Remessa', ini: 1, fim: 2, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['1'], cor: '#ffe082', descricao: 'Remessa = 1' },
    { nome: 'Literal Remessa', ini: 2, fim: 9, tamanho: 7, tipo: 'A', obrigatorio: true, valores: ['REMESSA'], cor: '#b2dfdb', descricao: 'Literal REMESSA (7 pos)' },
    { nome: 'Código de Serviço', ini: 9, fim: 11, tamanho: 2, tipo: 'N', obrigatorio: true, valores: ['01'], cor: '#c5cae9', descricao: '01 = Cobrança' },
    { nome: 'Literal Serviço', ini: 11, fim: 26, tamanho: 15, tipo: 'A', obrigatorio: true, valores: ['COBRANCA'], cor: '#e1bee7', descricao: 'COBRANÇA (15 pos)' },
    { nome: 'Código da Empresa', ini: 26, fim: 46, tamanho: 20, tipo: 'N', obrigatorio: true, cor: '#b3e5fc', descricao: 'Código fornecido pelo BMP (20 pos)' },
    { nome: 'Nome da Empresa', ini: 46, fim: 76, tamanho: 30, tipo: 'A', obrigatorio: true, cor: '#ffecb3', descricao: 'Razão Social (30 pos)' },
    { nome: 'Número do BMP na Câmara', ini: 76, fim: 79, tamanho: 3, tipo: 'N', obrigatorio: true, valores: ['274'], cor: '#ffccbc', descricao: 'Número BMP = 274' },
    { nome: 'Nome do Banco por Extenso', ini: 79, fim: 94, tamanho: 15, tipo: 'A', obrigatorio: true, cor: '#dcedc8', descricao: 'BMP Money Plus (15 pos)' },
    { nome: 'Data da Gravação do Arquivo', ini: 94, fim: 100, tamanho: 6, tipo: 'N', obrigatorio: true, formato: 'DDMMAA', cor: '#fff9c4', descricao: 'Data Gravação DDMMAA' },
    { nome: 'Branco', ini: 100, fim: 108, tamanho: 8, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Branco (8 pos)' },
    { nome: 'Identificação do sistema', ini: 108, fim: 110, tamanho: 2, tipo: 'A', obrigatorio: false, valores: ['MX'], cor: '#b2ebf2', descricao: 'Sistema MX (2 pos)' },
    { nome: 'Nº Sequencial de Remessa', ini: 110, fim: 117, tamanho: 7, tipo: 'N', obrigatorio: true, cor: '#ffcdd2', descricao: 'Sequencial (7 pos)' },
    { nome: 'Branco', ini: 117, fim: 394, tamanho: 277, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Branco (277 pos)' },
    { nome: 'Nº Sequencial do Registro no arquivo', ini: 394, fim: 400, tamanho: 6, tipo: 'N', obrigatorio: true, valores: ['000001'], cor: '#b2ebf2', descricao: 'Sequencial 000001' },
  ];

  // ========================================
  // LAYOUT DETALHE (TIPO 1) - Posições 001-400
  // Seguindo documentação oficial BMP CNAB 400
  // ========================================
  camposDetalhe: CampoLayout[] = [
    { nome: 'Identificação do Registro', ini: 0, fim: 1, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['1'], cor: '#f8bbd0', descricao: 'Tipo 1 - Detalhe' },
    { nome: 'Agência de Débito', ini: 1, fim: 6, tamanho: 5, tipo: 'N', obrigatorio: false, cor: '#ffe082', descricao: 'Agência Débito (opcional)' },
    { nome: 'Dígito da Agência de Débito', ini: 6, fim: 7, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#ffd54f', descricao: 'Branco' },
    { nome: 'Razão da Conta Corrente', ini: 7, fim: 12, tamanho: 5, tipo: 'N', obrigatorio: false, cor: '#b2dfdb', descricao: 'Razão CC (opcional)' },
    { nome: 'Conta Corrente', ini: 12, fim: 19, tamanho: 7, tipo: 'N', obrigatorio: false, cor: '#80cbc4', descricao: 'Conta (opcional)' },
    { nome: 'Dígito da Conta Corrente', ini: 19, fim: 20, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#4db6ac', descricao: 'Branco' },
    { nome: 'Identificação da Empresa Beneficiária no Banco', ini: 20, fim: 37, tamanho: 17, tipo: 'A', obrigatorio: true, cor: '#c5cae9', descricao: 'Detalhes página 11 (17 pos)' },
    { nome: 'Nº Controle do Participante', ini: 37, fim: 52, tamanho: 15, tipo: 'A', obrigatorio: false, cor: '#b3e5fc', descricao: 'Uso da Empresa (15 pos)' },
    { nome: 'Brancos (Uso Futuro)', ini: 52, fim: 62, tamanho: 10, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos (10 pos)' },
    { nome: 'Código do Banco a ser debitado na Câmara', ini: 62, fim: 65, tamanho: 3, tipo: 'N', obrigatorio: true, valores: ['000'], cor: '#e1bee7', descricao: 'Código Banco Câmara = 000' },
    { nome: 'Campo de Multa', ini: 65, fim: 66, tamanho: 1, tipo: 'N', obrigatorio: false, valores: ['0', '2'], cor: '#ce93d8', descricao: '0=sem multa, 2=com multa' },
    { nome: 'Percentual de multa', ini: 66, fim: 70, tamanho: 4, tipo: 'N', obrigatorio: false, cor: '#ba68c8', descricao: 'Percentual (4 pos, 2 dec)' },
    { nome: 'Identificação do Título no Banco (Nosso Número)', ini: 70, fim: 81, tamanho: 11, tipo: 'N', obrigatorio: true, cor: '#ffccbc', descricao: 'Nosso Número (11 pos)' },
    { nome: 'Dígito de Auto Conferência do Número Bancário', ini: 81, fim: 82, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#ffab91', descricao: 'Dígito N/N' },
    { nome: 'Desconto Bonificação por dia', ini: 82, fim: 92, tamanho: 10, tipo: 'N', obrigatorio: false, cor: '#a5d6a7', descricao: 'Valor desconto bonif./dia (10 pos)' },
    { nome: 'Condição para Emissão da Papeleta de Cobrança', ini: 92, fim: 93, tamanho: 1, tipo: 'N', obrigatorio: false, valores: ['2'], cor: '#81c784', descricao: '2 = Cliente emite' },
    { nome: 'Ident. se emite Boleto para Débito Automático', ini: 93, fim: 94, tamanho: 1, tipo: 'A', obrigatorio: false, valores: ['N'], cor: '#66bb6a', descricao: 'N = Não emite' },
    { nome: 'Identificação da Operação do Banco', ini: 94, fim: 104, tamanho: 10, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos (10 pos)' },
    { nome: 'Indicador Rateio Crédito', ini: 104, fim: 105, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#c8e6c9', descricao: 'Branco (opcional)' },
    { nome: 'Endereçamento para Aviso do Débito Automático', ini: 105, fim: 106, tamanho: 1, tipo: 'N', obrigatorio: false, valores: ['0'], cor: '#aed581', descricao: '0 (opcional)' },
    { nome: 'Quantidade de pagamentos', ini: 106, fim: 108, tamanho: 2, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Branco (2 pos)' },
    { nome: 'Identificação da ocorrência', ini: 108, fim: 110, tamanho: 2, tipo: 'N', obrigatorio: true, cor: '#80deea', descricao: 'Códigos de ocorrência (página 15)' },
    { nome: 'Nº do Documento', ini: 110, fim: 120, tamanho: 10, tipo: 'A', obrigatorio: true, cor: '#c5e1a5', descricao: 'Documento (10 pos)' },
    { nome: 'Data do Vencimento do Título', ini: 120, fim: 126, tamanho: 6, tipo: 'N', obrigatorio: true, formato: 'DDMMAA', cor: '#fff9c4', descricao: 'Vencimento DDMMAA' },
    { nome: 'Valor do Título', ini: 126, fim: 139, tamanho: 13, tipo: 'N', obrigatorio: true, cor: '#ef9a9a', descricao: 'Valor (13 pos, 2 dec)' },
    { nome: 'Banco Encarregado da Cobrança', ini: 139, fim: 142, tamanho: 3, tipo: 'N', obrigatorio: false, valores: ['000'], cor: '#b3e5fc', descricao: 'Banco = 000' },
    { nome: 'Agência Depositária', ini: 142, fim: 147, tamanho: 5, tipo: 'N', obrigatorio: false, valores: ['00000'], cor: '#81d4fa', descricao: 'Agência = 00000' },
    { nome: 'Espécie de Título', ini: 147, fim: 149, tamanho: 2, tipo: 'N', obrigatorio: false, cor: '#bcaaa4', descricao: 'Códigos Espécie (página 15)' },
    { nome: 'Identificação', ini: 149, fim: 150, tamanho: 1, tipo: 'A', obrigatorio: false, valores: ['N'], cor: '#d7ccc8', descricao: 'N = Novo título' },
    { nome: 'Data da emissão do Título', ini: 150, fim: 156, tamanho: 6, tipo: 'N', obrigatorio: true, formato: 'DDMMAA', cor: '#b2ebf2', descricao: 'Emissão DDMMAA' },
    { nome: '1ª instrução', ini: 156, fim: 158, tamanho: 2, tipo: 'N', obrigatorio: false, valores: ['00'], cor: '#b0bec5', descricao: '00' },
    { nome: '2ª instrução', ini: 158, fim: 160, tamanho: 2, tipo: 'N', obrigatorio: false, valores: ['00'], cor: '#90a4ae', descricao: '00' },
    { nome: 'Valor a ser cobrado por Dia de Atraso', ini: 160, fim: 173, tamanho: 13, tipo: 'N', obrigatorio: false, cor: '#ffab91', descricao: 'Mora/Dia (13 pos, 2 dec)' },
    { nome: 'Data Limite P/Concessão de Desconto', ini: 173, fim: 179, tamanho: 6, tipo: 'N', obrigatorio: false, formato: 'DDMMAA', cor: '#fff59d', descricao: 'Data Desconto DDMMAA' },
    { nome: 'Valor do Desconto', ini: 179, fim: 192, tamanho: 13, tipo: 'N', obrigatorio: false, cor: '#80cbc4', descricao: 'Desconto (13 pos, 2 dec)' },
    { nome: 'Valor do IOF', ini: 192, fim: 205, tamanho: 13, tipo: 'N', obrigatorio: false, valores: ['0000000000000'], cor: '#4db6ac', descricao: 'IOF = zeros' },
    { nome: 'Valor do Abatimento a ser concedido ou cancelado', ini: 205, fim: 218, tamanho: 13, tipo: 'N', obrigatorio: false, cor: '#a5d6a7', descricao: 'Abatimento (13 pos, 2 dec)' },
    { nome: 'Identificação do Tipo de Inscrição do Pagador', ini: 218, fim: 220, tamanho: 2, tipo: 'N', obrigatorio: true, valores: ['01', '02'], cor: '#e0f7fa', descricao: '01=CPF, 02=CNPJ' },
    { nome: 'Nº Inscrição do Pagador', ini: 220, fim: 234, tamanho: 14, tipo: 'N', obrigatorio: true, cor: '#90caf9', descricao: 'CNPJ/CPF (14 pos)' },
    { nome: 'Nome do Pagador', ini: 234, fim: 274, tamanho: 40, tipo: 'A', obrigatorio: true, cor: '#ffcc80', descricao: 'Nome Pagador (40 pos)' },
    { nome: 'Endereço Completo', ini: 274, fim: 314, tamanho: 40, tipo: 'A', obrigatorio: true, cor: '#ffe0b2', descricao: 'Endereço Pagador (40 pos)' },
    { nome: '1ª Mensagem', ini: 314, fim: 326, tamanho: 12, tipo: 'A', obrigatorio: false, cor: '#ce93d8', descricao: 'Mensagem (12 pos)' },
    { nome: 'CEP', ini: 326, fim: 331, tamanho: 5, tipo: 'N', obrigatorio: true, cor: '#c8e6c9', descricao: 'CEP Pagador (5 pos)' },
    { nome: 'Sufixo do CEP', ini: 331, fim: 334, tamanho: 3, tipo: 'N', obrigatorio: true, cor: '#a5d6a7', descricao: 'Sufixo CEP (3 pos)' },
    { nome: 'Cidade do Pagador', ini: 334, fim: 349, tamanho: 15, tipo: 'A', obrigatorio: false, cor: '#9ccc65', descricao: 'Cidade Pagador (15 pos)' },
    { nome: 'UF do Pagador', ini: 349, fim: 351, tamanho: 2, tipo: 'A', obrigatorio: false, cor: '#8bc34a', descricao: 'UF Pagador (2 pos)' },
    { nome: 'Tipo Sacador Avalista', ini: 351, fim: 352, tamanho: 1, tipo: 'N', obrigatorio: false, cor: '#aed581', descricao: 'Obs. página 16' },
    { nome: 'Identificador Sacador Avalista', ini: 352, fim: 367, tamanho: 15, tipo: 'A', obrigatorio: false, cor: '#c5e1a5', descricao: 'Obs. página 16 (15 pos)' },
    { nome: 'Nome/Razão Social Sacador Avalista', ini: 367, fim: 394, tamanho: 27, tipo: 'A', obrigatorio: false, cor: '#dcedc8', descricao: 'Nome Sacador (27 pos)' },
    { nome: 'Nº Sequencial do Registro', ini: 394, fim: 400, tamanho: 6, tipo: 'N', obrigatorio: true, cor: '#b2ebf2', descricao: 'Sequencial Registro' },
  ];

  // ========================================
  // LAYOUT TIPO 2 (Registro Opcional) - Posições 001-400
  // Seguindo documentação oficial BMP CNAB 400
  // ========================================
  camposTipo2: CampoLayout[] = [
    { nome: 'Tipo Registro', ini: 0, fim: 1, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['2'], cor: '#f8bbd0', descricao: 'Tipo 2 - Mensagens' },
    { nome: 'Mensagem 1', ini: 1, fim: 81, tamanho: 80, tipo: 'A', obrigatorio: false, cor: '#ffe082', descricao: 'Mensagem (80 pos)' },
    { nome: 'Mensagem 2', ini: 81, fim: 161, tamanho: 80, tipo: 'A', obrigatorio: false, cor: '#ffcc80', descricao: 'Mensagem (80 pos)' },
    { nome: 'Mensagem 3', ini: 161, fim: 241, tamanho: 80, tipo: 'A', obrigatorio: false, cor: '#ffab91', descricao: 'Mensagem (80 pos)' },
    { nome: 'Mensagem 4', ini: 241, fim: 321, tamanho: 80, tipo: 'A', obrigatorio: false, cor: '#ff8a65', descricao: 'Mensagem (80 pos)' },
    { nome: 'Número Pagador', ini: 321, fim: 327, tamanho: 6, tipo: 'A', obrigatorio: false, cor: '#b3e5fc', descricao: 'Numeração do endereço na rua' },
    { nome: 'Bairro Pagador', ini: 327, fim: 347, tamanho: 20, tipo: 'A', obrigatorio: false, cor: '#81d4fa', descricao: 'Bairro do Pagador (20 pos)' },
    { nome: 'UF Pagador', ini: 347, fim: 349, tamanho: 2, tipo: 'A', obrigatorio: false, cor: '#4fc3f7', descricao: 'Unidade Federativa (2 pos)' },
    { nome: 'Cidade Pagador', ini: 349, fim: 379, tamanho: 30, tipo: 'A', obrigatorio: false, cor: '#29b6f6', descricao: 'Cidade do Pagador (30 pos)' },
    { nome: 'Branco', ini: 379, fim: 394, tamanho: 15, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Branco (15 pos)' },
    { nome: 'Nº Sequencial de Registro', ini: 394, fim: 400, tamanho: 6, tipo: 'N', obrigatorio: true, cor: '#b2ebf2', descricao: 'Sequencial Registro' },
  ];

  // ========================================
  // LAYOUT TRAILER (TIPO 9) - Posições 001-400
  // Seguindo documentação oficial BMP CNAB 400
  // ========================================
  camposTrailer: CampoLayout[] = [
    { nome: 'Identificação Registro', ini: 0, fim: 1, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['9'], cor: '#f8bbd0', descricao: 'Tipo 9 - Trailer' },
    { nome: 'Branco', ini: 1, fim: 394, tamanho: 393, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Branco (393 pos)' },
    { nome: 'Número Sequencial de Registro', ini: 394, fim: 400, tamanho: 6, tipo: 'N', obrigatorio: true, cor: '#b2ebf2', descricao: 'Nº Sequencial do Último Registro' },
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

  readonly codigosInstrucao: { codigo: string; descricao: string }[] = [
    { codigo: '00', descricao: 'Sem instrução' },
    { codigo: '02', descricao: 'Devolver após X dias corridos do vencimento (não protestar)' },
    { codigo: '06', descricao: 'Protestar após X dias corridos do vencimento' },
    { codigo: '07', descricao: 'Negativar — encaminhar ao serviço de negativação' },
    { codigo: '09', descricao: 'Cancelar instrução de protesto / negativação' },
    { codigo: '18', descricao: 'Sustar protesto e dar baixa no título' },
    { codigo: '19', descricao: 'Sustar protesto e manter título em carteira' },
    { codigo: '20', descricao: 'Devolver o título ao cedente' },
    { codigo: '23', descricao: 'Não cobrar juros de mora' },
    { codigo: '24', descricao: 'Cobrar juros de mora (conforme instrução de mora)' },
    { codigo: '43', descricao: 'Dispensar prazo para protesto' },
    { codigo: '45', descricao: 'Cobrar multa conforme instrução' },
    { codigo: '48', descricao: 'Dispensar cobrança de multa' },
  ];

  get campoEhInstrucao(): boolean {
    return !!this.campoAtivo?.nome.toLowerCase().includes('instrução') ||
           !!this.campoAtivo?.nome.toLowerCase().includes('instrucao');
  }

  selecionarInstrucao(codigo: string): void {
    this.valorCampoAtivo = codigo;
  }

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

    // 1. Mostra o editor imediatamente na posição do clique
    const rect = el.getBoundingClientRect();
    const editorW = 420;
    const left = Math.min(rect.left, window.innerWidth - editorW - 12);
    this.editorPos = { top: rect.bottom + 6 + window.scrollY, left: Math.max(left, 8) };
    this.editorCarregando = true;
    this.aplicadoFeedback = false;

    // 2. Resolve campo e highlight no próximo frame (não bloqueia o render do editor)
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
    // Mantém o campo destacado após re-render
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
    a.download = 'remessa_editada.REM';
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
      tipo1: 0,
      tipo2: 0,
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
        case '2':
          campos = this.camposTipo2;
          this.estatisticas.tipo2++;
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
            mensagem: `Tipo de registro desconhecido: "${tipo}". Tipos válidos: 0 (Header), 1 (Detalhe), 2 (Mensagens), 9 (Trailer)`,
            severidade: 'erro'
          });
      }

      // Validação: espera exatamente 400 caracteres
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

      // Validar sequência
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

    const todosCampos = [...this.camposHeader, ...this.camposDetalhe, ...this.camposTipo2, ...this.camposTrailer];
    this.legendaCampos = todosCampos.filter(
      (campo, index, self) => self.findIndex(c => c.nome === campo.nome) === index
    );

    return `<div class="cnab-mw">${lines.map((line, idx) => this.lineToMatrix(line, idx)).join('')}</div>`;
  }

  validarEstrutura(): void {
    if (!this.estatisticas) return;

    if (this.estatisticas.headers === 0) {
      this.erros.push({
        linha: 0,
        campo: 'Estrutura',
        posicao: '-',
        valor: '-',
        mensagem: 'Arquivo deve conter pelo menos um registro Header (Tipo 0)',
        severidade: 'erro'
      });
    }

    if (this.estatisticas.trailers === 0) {
      this.erros.push({
        linha: 0,
        campo: 'Estrutura',
        posicao: '-',
        valor: '-',
        mensagem: 'Arquivo deve conter pelo menos um registro Trailer (Tipo 9)',
        severidade: 'erro'
      });
    }

    if (this.estatisticas.tipo1 === 0) {
      this.erros.push({
        linha: 0,
        campo: 'Estrutura',
        posicao: '-',
        valor: '-',
        mensagem: 'Aviso: Arquivo não contém registros de Detalhe (Tipo 1)',
        severidade: 'aviso'
      });
    }

    if (this.estatisticas.headers > 1) {
      this.erros.push({
        linha: 0,
        campo: 'Estrutura',
        posicao: '-',
        valor: '-',
        mensagem: `Aviso: Arquivo contém ${this.estatisticas.headers} Headers (normalmente 1)`,
        severidade: 'aviso'
      });
    }
  }

  validarCampo(linha: number, campo: CampoLayout, valor: string): void {
    const valorTrim = valor.trim();

    if (campo.obrigatorio && valorTrim === '') {
      this.erros.push({
        linha,
        campo: campo.nome,
        posicao: `${campo.ini + 1}-${campo.fim}`,
        valor: valor,
        mensagem: 'Campo obrigatório está vazio',
        severidade: 'erro'
      });
      return;
    }

    if (!campo.obrigatorio && valorTrim === '') return;

    // Validação: campos numéricos NÃO devem ter espaços
    if (campo.tipo === 'N' && valorTrim !== '') {
      if (valor.includes(' ')) {
        this.erros.push({
          linha,
          campo: campo.nome,
          posicao: `${campo.ini + 1}-${campo.fim}`,
          valor: valor,
          mensagem: 'Campo numérico contém espaços. Deve ser preenchido com zeros à esquerda.',
          severidade: 'erro'
        });
      }

      if (!/^\d+$/.test(valor)) {
        this.erros.push({
          linha,
          campo: campo.nome,
          posicao: `${campo.ini + 1}-${campo.fim}`,
          valor: valor,
          mensagem: 'Deve conter apenas números (0-9)',
          severidade: 'erro'
        });
      }
    }

    if (campo.valores && valorTrim !== '') {
      if (!campo.valores.includes(valorTrim)) {
        this.erros.push({
          linha,
          campo: campo.nome,
          posicao: `${campo.ini + 1}-${campo.fim}`,
          valor: valor,
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
            linha,
            campo: campo.nome,
            posicao: `${campo.ini + 1}-${campo.fim}`,
            valor: valor,
            mensagem: `Dia inválido: ${dia} (deve estar entre 01 e 31)`,
            severidade: 'erro'
          });
        }

        if (mes < 1 || mes > 12) {
          this.erros.push({
            linha,
            campo: campo.nome,
            posicao: `${campo.ini + 1}-${campo.fim}`,
            valor: valor,
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
        tipoNome = 'Tipo 2 (Mensagens)';
        tipoColor = '#f57c00';
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
    html += `<span style="min-width:80px;font-size:12px;font-weight:600;color:${tipoColor};">Linha ${lineIdx+1}</span>`;
    html += `<span style="padding:3px 10px;background:${tipoColor};color:#fff;border-radius:4px;font-size:11px;font-weight:600;text-transform:uppercase;">${tipoNome}</span>`;
    html += `<span style="padding:3px 8px;background:#757575;color:#fff;border-radius:4px;font-size:10px;font-weight:500;">${line.length} chars</span>`;

    const errosLinha = this.erros.filter(e => e.linha === lineIdx + 1 && e.severidade === 'erro');
    if (errosLinha.length > 0) {
      html += `<span style="padding:3px 10px;background:#d32f2f;color:#fff;border-radius:4px;font-size:11px;margin-left:auto;font-weight:600;">⚠️ ${errosLinha.length} erro(s)</span>`;
    }

    html += `</div>`;

    // Matriz com fonte monoespaçada
    html += `<div style="font-family:'Courier New',Courier,monospace;font-size:11px;line-height:1;white-space:nowrap;background:#fff;padding:6px;border-radius:4px;border:1px solid #e0e0e0;">`;

    // Renderizar 400 caracteres
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
      const title = `${nomeCampo} - Pos ${i+1}${campo?.descricao ? '\n' + campo.descricao : ''}`;

      html += `<span class="${cls}" data-li="${lineIdx}" data-ci="${i}" style="display:inline-block;width:13px;height:18px;line-height:18px;text-align:center;vertical-align:top;background:${cor};${bordaErro}font-size:11px;font-family:monospace;cursor:pointer;user-select:none;" title="${this.escapeHtml(title)}">${char === ' ' ? '&nbsp;' : this.escapeHtml(char)}</span>`;
    }

    html += '</div></div>';
    return html;
  }

  renderizarArquivo(content: string): string {
    const lines = content.split(/\r?\n/).filter(l => l.length > 0);
    return `<div class="cnab-mw">${lines.map((line, idx) => this.lineToMatrix(line, idx)).join('')}</div>`;
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
