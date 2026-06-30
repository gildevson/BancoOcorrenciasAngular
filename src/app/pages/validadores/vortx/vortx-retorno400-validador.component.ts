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
  selector: 'app-vortx-retorno400-validador',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './vortx-retorno400-validador.component.html',
  styleUrls: ['./vortx-retorno400-validador.component.css']
})
export class VortxRetorno400ValidadorComponent implements OnDestroy {
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

  // ── HEADER RETORNO (Tipo 02) ───────────────────────────────────────────────
  camposHeaderRetorno: CampoLayout[] = [
    { nome: 'Tipo Registro',          ini: 0,   fim: 1,   tamanho: 1,   tipo: 'N', obrigatorio: true,  valores: ['0'],        cor: '#f8bbd0', descricao: 'Identificação Registro Header (0)' },
    { nome: 'Ident. Arquivo Retorno', ini: 1,   fim: 2,   tamanho: 1,   tipo: 'N', obrigatorio: true,  valores: ['2'],        cor: '#ffe082', valoresDescricao: { '2': 'Retorno — arquivo de retorno bancário' }, descricao: 'Identificação Arquivo Retorno (2)' },
    { nome: 'Literal Retorno',        ini: 2,   fim: 9,   tamanho: 7,   tipo: 'A', obrigatorio: true,  valores: ['RETORNO'], cor: '#b2dfdb', descricao: 'Literal RETORNO' },
    { nome: 'Código do Serviço',      ini: 9,   fim: 11,  tamanho: 2,   tipo: 'N', obrigatorio: true,  valores: ['01'],       cor: '#c5cae9', valoresDescricao: { '01': 'Cobrança' }, descricao: '01 = Cobrança' },
    { nome: 'Literal Serviço',        ini: 11,  fim: 26,  tamanho: 15,  tipo: 'A', obrigatorio: true,  valores: ['COBRANCA'], cor: '#e1bee7', descricao: 'Literal COBRANCA' },
    { nome: 'Código da Empresa',      ini: 26,  fim: 46,  tamanho: 20,  tipo: 'N', obrigatorio: true,                        cor: '#b3e5fc', descricao: 'Código Empresa no VORTX' },
    { nome: 'Nome da Empresa',        ini: 46,  fim: 76,  tamanho: 30,  tipo: 'A', obrigatorio: true,                        cor: '#ffecb3', descricao: 'Razão Social' },
    { nome: 'Número do Banco',        ini: 76,  fim: 79,  tamanho: 3,   tipo: 'N', obrigatorio: true,  valores: ['310'],      cor: '#ffccbc', descricao: 'Número VORTX = 310' },
    { nome: 'Nome do Banco',          ini: 79,  fim: 94,  tamanho: 15,  tipo: 'A', obrigatorio: true,                        cor: '#dcedc8', descricao: 'VORTX (15 pos)' },
    { nome: 'Data de Gravação',       ini: 94,  fim: 100, tamanho: 6,   tipo: 'N', obrigatorio: true,  formato: 'DDMMAA',     cor: '#fff9c4', descricao: 'Data Gravação DDMMAA' },
    { nome: 'Branco',                 ini: 100, fim: 394, tamanho: 294, tipo: 'A', obrigatorio: false,                       cor: '#f5f5f5', descricao: 'Branco (294 pos)' },
    { nome: 'Nº Sequencial',          ini: 394, fim: 400, tamanho: 6,   tipo: 'N', obrigatorio: true,  valores: ['000001'],   cor: '#b2ebf2', descricao: 'Sequencial 000001' },
  ];

  // ── DETALHE RETORNO (Tipo 1) ───────────────────────────────────────────────
  camposDetalheRetorno: CampoLayout[] = [
    { nome: 'Tipo Registro',                   ini: 0,   fim: 1,   tamanho: 1,   tipo: 'N', obrigatorio: true,  valores: ['1'],          cor: '#f8bbd0', descricao: 'Identificação Registro (1)' },
    { nome: 'Tipo Inscrição Empresa',           ini: 1,   fim: 3,   tamanho: 2,   tipo: 'N', obrigatorio: true,  valores: ['01', '02'],   cor: '#ffe082', valoresDescricao: { '01': 'CPF — Pessoa Física', '02': 'CNPJ — Pessoa Jurídica' }, descricao: '01=CPF · 02=CNPJ' },
    { nome: 'CNPJ/CPF Empresa',                ini: 3,   fim: 17,  tamanho: 14,  tipo: 'N', obrigatorio: true,                           cor: '#b2dfdb', descricao: 'CPF/CNPJ Empresa (14 pos)' },
    { nome: 'Identificação Empresa no Banco',  ini: 17,  fim: 37,  tamanho: 20,  tipo: 'A', obrigatorio: true,                           cor: '#c5cae9', descricao: 'Código empresa no VORTX (20 pos)' },
    { nome: 'Uso do Banco',                    ini: 37,  fim: 56,  tamanho: 19,  tipo: 'A', obrigatorio: false,                          cor: '#e0e0e0', descricao: 'Uso interno banco (19 pos — zeros)' },
    { nome: 'Nosso Número',                    ini: 56,  fim: 62,  tamanho: 6,   tipo: 'N', obrigatorio: true,                           cor: '#ffccbc', descricao: 'Nosso Número retornado pelo banco (6 pos)' },
    { nome: 'Uso do Banco',                    ini: 62,  fim: 70,  tamanho: 8,   tipo: 'A', obrigatorio: false,                          cor: '#e8e8e8', descricao: 'Uso interno banco (8 pos — zeros)' },
    { nome: 'Valor do Título',                 ini: 70,  fim: 83,  tamanho: 13,  tipo: 'N', obrigatorio: false,                          cor: '#ef9a9a', descricao: 'Valor de face do título (13 pos, 2 dec)' },
    { nome: 'Uso do Banco',                    ini: 83,  fim: 108, tamanho: 25,  tipo: 'A', obrigatorio: false,                          cor: '#eeeeee', descricao: 'Uso interno banco (25 pos — zeros)' },
    { nome: 'Ident. Ocorrência',               ini: 108, fim: 110, tamanho: 2,   tipo: 'N', obrigatorio: true,                           cor: '#80deea', descricao: '02=Entrada, 06=Liquidação, 09/10=Baixa…' },
    { nome: 'Data Ocorrência',                 ini: 110, fim: 116, tamanho: 6,   tipo: 'N', obrigatorio: true,  formato: 'DDMMAA',        cor: '#fff9c4', descricao: 'Data Ocorrência DDMMAA' },
    { nome: 'Número Documento',                ini: 116, fim: 136, tamanho: 20,  tipo: 'A', obrigatorio: false,                          cor: '#c5e1a5', descricao: 'Número do Documento (20 pos)' },
    { nome: 'Data Vencimento',                 ini: 136, fim: 142, tamanho: 6,   tipo: 'N', obrigatorio: false, formato: 'DDMMAA',        cor: '#fff59d', descricao: 'Data Vencimento DDMMAA' },
    { nome: 'Uso do Banco / Encargos',         ini: 142, fim: 252, tamanho: 110, tipo: 'A', obrigatorio: false,                          cor: '#f5f5f5', descricao: 'Área de encargos e uso banco (110 pos — banco/agência/juros/multa)' },
    { nome: 'Valor Pago',                      ini: 252, fim: 265, tamanho: 13,  tipo: 'N', obrigatorio: false,                          cor: '#66bb6a', descricao: 'Valor efetivamente pago (13 pos, 2 dec)' },
    { nome: 'Uso do Banco',                    ini: 265, fim: 295, tamanho: 30,  tipo: 'A', obrigatorio: false,                          cor: '#f0f0f0', descricao: 'Uso banco / complemento (30 pos)' },
    { nome: 'Data do Crédito',                 ini: 295, fim: 301, tamanho: 6,   tipo: 'N', obrigatorio: false, formato: 'DDMMAA',        cor: '#c8e6c9', descricao: 'Data Crédito DDMMAA' },
    { nome: 'Branco',                          ini: 301, fim: 394, tamanho: 93,  tipo: 'A', obrigatorio: false,                          cor: '#f5f5f5', descricao: 'Branco (93 pos)' },
    { nome: 'Nº Sequencial',                   ini: 394, fim: 400, tamanho: 6,   tipo: 'N', obrigatorio: true,                           cor: '#b2ebf2', descricao: 'Sequencial do Registro' },
  ];

  // ── TRAILER RETORNO (Tipo 92) ──────────────────────────────────────────────
  camposTrailerRetorno: CampoLayout[] = [
    { nome: 'Tipo Registro',          ini: 0,   fim: 1,   tamanho: 1,   tipo: 'N', obrigatorio: true, valores: ['9'], cor: '#f8bbd0', descricao: 'Identificação Registro (9)' },
    { nome: 'Ident. Retorno',         ini: 1,   fim: 2,   tamanho: 1,   tipo: 'N', obrigatorio: true, valores: ['2'], cor: '#ffe082', descricao: 'Identificação Retorno (2)' },
    { nome: 'Qtd. Títulos',           ini: 2,   fim: 10,  tamanho: 8,   tipo: 'N', obrigatorio: false,               cor: '#e1bee7', descricao: 'Quantidade de Títulos (8 pos)' },
    { nome: 'Valor Total',            ini: 10,  fim: 24,  tamanho: 14,  tipo: 'N', obrigatorio: false,               cor: '#ce93d8', descricao: 'Valor Total (14 pos, 2 dec)' },
    { nome: 'Branco',                 ini: 24,  fim: 394, tamanho: 370, tipo: 'A', obrigatorio: false,               cor: '#f5f5f5', descricao: 'Branco (370 pos)' },
    { nome: 'Nº Sequencial',          ini: 394, fim: 400, tamanho: 6,   tipo: 'N', obrigatorio: true,                cor: '#b2ebf2', descricao: 'Sequencial do Registro' },
  ];

  readonly codigosOcorrencia: { codigo: string; descricao: string }[] = [
    { codigo: '02', descricao: 'Entrada Confirmada' },
    { codigo: '03', descricao: 'Entrada Rejeitada' },
    { codigo: '06', descricao: 'Liquidação Normal' },
    { codigo: '07', descricao: 'Liquidação Parcial' },
    { codigo: '08', descricao: 'Liquidação em Cartório' },
    { codigo: '09', descricao: 'Baixa por Comando do Cliente' },
    { codigo: '10', descricao: 'Baixado Conforme Instruções da Agência' },
    { codigo: '11', descricao: 'Em Ser (Títulos em Aberto)' },
    { codigo: '12', descricao: 'Abatimento Concedido' },
    { codigo: '13', descricao: 'Abatimento Cancelado' },
    { codigo: '14', descricao: 'Vencimento Alterado' },
    { codigo: '15', descricao: 'Liquidação em Desconto' },
    { codigo: '17', descricao: 'Liquidação após Baixa' },
    { codigo: '19', descricao: 'Confirmação de Instrução para Protestar' },
    { codigo: '20', descricao: 'Confirmação de Sustação de Protesto' },
    { codigo: '23', descricao: 'Remessa a Cartório (Aponte)' },
    { codigo: '24', descricao: 'Retirada de Cartório (Sustação)' },
    { codigo: '25', descricao: 'Protestado e Baixado' },
    { codigo: '28', descricao: 'Débito de Custas Antecipadas' },
    { codigo: '32', descricao: 'Instrução Rejeitada' },
    { codigo: '42', descricao: 'Desconto Concedido' },
    { codigo: '43', descricao: 'Desconto Cancelado' },
  ];

  get campoEhOcorrencia(): boolean {
    return this.campoAtivo?.nome.toLowerCase().includes('ocorr') ?? false;
  }

  get descricaoOcorrencia(): string {
    return this.codigosOcorrencia.find(o => o.codigo === this.valorCampoAtivo.trim())?.descricao ?? '';
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
    const line = this.linhasEditadas[li];
    if (!line) return [];
    const tipo = line[0];
    const ident = line.length > 1 ? line[1] : '';
    if (tipo === '0' && ident === '2') return this.camposHeaderRetorno;
    if (tipo === '1') return this.camposDetalheRetorno;
    if (tipo === '9' && ident === '2') return this.camposTrailerRetorno;
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
    a.download = 'vortx_retorno_editado.RET';
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
      if (['06','07','08','15','17'].includes(ocor)) { liquidacoes++; valorTotalPago += parseInt(l.substring(252, 265) || '0', 10); }
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
      const ident = line.length > 1 ? line[1] : '';
      let campos: CampoLayout[];

      if (tipo === '0' && ident === '2') {
        campos = this.camposHeaderRetorno;
        this.estatisticas.headers++;
      } else if (tipo === '1') {
        campos = this.camposDetalheRetorno;
        this.estatisticas.detalhes++;
      } else if (tipo === '9' && ident === '2') {
        campos = this.camposTrailerRetorno;
        this.estatisticas.trailers++;
      } else {
        campos = [];
        this.estatisticas.desconhecidos++;
        this.erros.push({ linha: idx + 1, campo: 'Tipo Registro', posicao: '1-2', valor: tipo + ident, mensagem: `Tipo desconhecido: "${tipo}${ident}". Esperado: 02 (Header), 1 (Detalhe), 92 (Trailer)`, severidade: 'erro' });
      }

      if (line.length !== 400) {
        this.erros.push({ linha: idx + 1, campo: 'Linha', posicao: `1-${line.length}`, valor: `${line.length} caracteres`, mensagem: `Tamanho inválido. Esperado: 400, Encontrado: ${line.length}`, severidade: 'erro' });
      }

      for (const campo of campos) this.validarCampo(idx + 1, campo, line.slice(campo.ini, campo.fim));

      const seqCampo = campos.find(c => c.nome === 'Nº Sequencial');
      if (seqCampo && line.length >= 400) {
        const valorSeq = line.slice(seqCampo.ini, seqCampo.fim).trim();
        const sequenciaAtual = parseInt(valorSeq, 10);
        if (!isNaN(sequenciaAtual) && sequenciaAtual !== sequenciaEsperada) {
          this.erros.push({ linha: idx + 1, campo: 'Nº Sequencial', posicao: `${seqCampo.ini + 1}-${seqCampo.fim}`, valor: valorSeq, mensagem: `Sequência incorreta. Esperado: ${String(sequenciaEsperada).padStart(6, '0')}, Encontrado: ${valorSeq}`, severidade: 'erro' });
        }
        sequenciaEsperada++;
      }
    }

    this.validarEstrutura();
    const todosCampos = [...this.camposHeaderRetorno, ...this.camposDetalheRetorno, ...this.camposTrailerRetorno];
    this.legendaCampos = todosCampos.filter((c, i, self) => self.findIndex(x => x.nome === c.nome) === i);
    return `<div class="cnab-mw">${lines.map((line, idx) => this.lineToMatrix(line, idx)).join('')}</div>`;
  }

  validarEstrutura(): void {
    if (!this.estatisticas) return;
    if (this.estatisticas.headers === 0) this.erros.push({ linha: 0, campo: 'Estrutura', posicao: '-', valor: '-', mensagem: 'Arquivo deve conter pelo menos um Header de Retorno (Tipo 02)', severidade: 'erro' });
    if (this.estatisticas.trailers === 0) this.erros.push({ linha: 0, campo: 'Estrutura', posicao: '-', valor: '-', mensagem: 'Arquivo deve conter pelo menos um Trailer de Retorno (Tipo 92)', severidade: 'erro' });
    if (this.estatisticas.detalhes === 0) this.erros.push({ linha: 0, campo: 'Estrutura', posicao: '-', valor: '-', mensagem: 'Aviso: Arquivo não contém registros de Detalhe (Tipo 1)', severidade: 'aviso' });
    if (this.estatisticas.headers > 1) this.erros.push({ linha: 0, campo: 'Estrutura', posicao: '-', valor: '-', mensagem: `Aviso: Arquivo contém ${this.estatisticas.headers} Headers (normalmente 1)`, severidade: 'aviso' });
  }

  validarCampo(linha: number, campo: CampoLayout, valor: string): void {
    const valorTrim = valor.trim();
    if (campo.obrigatorio && valorTrim === '') {
      this.erros.push({ linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor, mensagem: 'Campo obrigatório está vazio', severidade: 'erro' });
      return;
    }
    if (!campo.obrigatorio && valorTrim === '') return;
    if (campo.tipo === 'N' && valorTrim !== '' && !campo.nome.includes('Branco') && !campo.nome.startsWith('Zeros')) {
      if (valor.includes(' ')) this.erros.push({ linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor, mensagem: 'Campo numérico contém espaços. Deve ser preenchido com zeros à esquerda.', severidade: 'erro' });
      if (!/^\d+$/.test(valor)) this.erros.push({ linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor, mensagem: 'Deve conter apenas números (0-9)', severidade: 'erro' });
    }
    if (campo.valores && valorTrim !== '' && !campo.valores.includes(valorTrim)) {
      this.erros.push({ linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor, mensagem: `Valor inválido. Valores permitidos: ${campo.valores.join(', ')}`, severidade: 'erro' });
    }
    if (campo.formato === 'DDMMAA' && valorTrim !== '' && valorTrim !== '000000' && valor.length === 6 && /^\d{6}$/.test(valor)) {
      const dia = parseInt(valor.slice(0, 2), 10);
      const mes = parseInt(valor.slice(2, 4), 10);
      if (dia < 1 || dia > 31) this.erros.push({ linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor, mensagem: `Dia inválido: ${dia}`, severidade: 'erro' });
      if (mes < 1 || mes > 12) this.erros.push({ linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor, mensagem: `Mês inválido: ${mes}`, severidade: 'erro' });
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
    if (errosLinha.length > 0) html += `<span style="padding:3px 10px;background:#d32f2f;color:#fff;border-radius:4px;font-size:11px;margin-left:auto;font-weight:600;">⚠️ ${errosLinha.length} erro(s)</span>`;
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
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }
}
