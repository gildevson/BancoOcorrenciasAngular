import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface CampoLayout {
  nome: string;
  ini: number;
  fim: number;
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
  trailers: number;
  desconhecidos: number;
}

@Component({
  selector: 'app-paulista-cnab400-validador',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="max-width:1400px;margin:0 auto;padding:20px;">
      <h2 style="color:#1565c0;margin-bottom:20px;">🏦 Validador Remessa Banco Paulista CNAB 400 (até 444 chars)</h2>

      <div style="margin-bottom:20px;">
        <input type="file" accept=".rem,.txt,.REM,.TXT" (change)="onFileChange($event)"
               style="padding:10px;border:2px solid #1565c0;border-radius:6px;cursor:pointer;" />
      </div>

      <div *ngIf="error" style="color:#b71c1c;background:#ffebee;padding:12px;border-radius:6px;border:1px solid #ef5350;margin-bottom:18px;">
        ❌ {{ error }}
      </div>

      <!-- Estatísticas -->
      <div *ngIf="estatisticas && validado" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:18px;">
        <div style="background:#e3f2fd;padding:12px;border-radius:6px;border:1px solid #90caf9;">
          <div style="font-size:24px;font-weight:bold;color:#1565c0;">{{ estatisticas.totalLinhas }}</div>
          <div style="font-size:12px;color:#555;">Total de Linhas</div>
        </div>
        <div style="background:#f3e5f5;padding:12px;border-radius:6px;border:1px solid #ce93d8;">
          <div style="font-size:24px;font-weight:bold;color:#7b1fa2;">{{ estatisticas.headers }}</div>
          <div style="font-size:12px;color:#555;">Headers (Tipo 0)</div>
        </div>
        <div style="background:#e8f5e9;padding:12px;border-radius:6px;border:1px solid #a5d6a7;">
          <div style="font-size:24px;font-weight:bold;color:#388e3c;">{{ estatisticas.detalhes }}</div>
          <div style="font-size:12px;color:#555;">Detalhes (Tipo 1)</div>
        </div>
        <div style="background:#fce4ec;padding:12px;border-radius:6px;border:1px solid #f48fb1;">
          <div style="font-size:24px;font-weight:bold;color:#c2185b;">{{ estatisticas.trailers }}</div>
          <div style="font-size:12px;color:#555;">Trailers (Tipo 9)</div>
        </div>
      </div>

      <!-- Erros -->
      <div *ngIf="erros.length > 0" style="margin-bottom:18px;">
        <div *ngIf="getErrosPorSeveridade('erro').length > 0" style="padding:14px;background:#ffebee;border-radius:6px;border:1px solid #ef9a9a;margin-bottom:12px;">
          <strong style="color:#c62828;font-size:16px;">🚫 {{ getErrosPorSeveridade('erro').length }} erro(s) crítico(s):</strong>
          <ul style="margin:10px 0 0 0;padding-left:20px;max-height:250px;overflow-y:auto;">
            <li *ngFor="let e of getErrosPorSeveridade('erro')" style="margin-bottom:6px;font-size:13px;">
              <strong style="color:#d32f2f;">Linha {{ e.linha }}</strong> -
              <span style="color:#1565c0;">{{ e.campo }}</span>
              <span style="color:#666;">[{{ e.posicao }}]</span>:
              <code style="background:#f5f5f5;padding:2px 6px;border-radius:3px;">{{ e.valor }}</code>
              → <span style="color:#c62828;">{{ e.mensagem }}</span>
            </li>
          </ul>
        </div>
        <div *ngIf="getErrosPorSeveridade('aviso').length > 0" style="padding:14px;background:#fff3e0;border-radius:6px;border:1px solid #ffb74d;">
          <strong style="color:#e65100;font-size:16px;">⚠️ {{ getErrosPorSeveridade('aviso').length }} aviso(s):</strong>
          <ul style="margin:10px 0 0 0;padding-left:20px;">
            <li *ngFor="let e of getErrosPorSeveridade('aviso')" style="margin-bottom:6px;font-size:13px;">
              <strong>Linha {{ e.linha }}</strong> - {{ e.campo }}: {{ e.mensagem }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Sucesso -->
      <div *ngIf="validado && getErrosPorSeveridade('erro').length === 0" style="margin-bottom:18px;padding:14px;background:#e8f5e9;border-radius:6px;border:1px solid #a5d6a7;">
        <strong style="color:#2e7d32;font-size:16px;">✅ Arquivo válido!</strong>
        <span *ngIf="getErrosPorSeveridade('aviso').length > 0" style="color:#f57c00;margin-left:8px;">
          ({{ getErrosPorSeveridade('aviso').length }} aviso(s))
        </span>
      </div>

      <!-- Legenda -->
      <div *ngIf="legendaCampos.length > 0" style="margin-bottom:18px;padding:14px;background:#fafafa;border-radius:6px;border:1px solid #e0e0e0;">
        <strong style="display:block;margin-bottom:12px;color:#333;">📌 Clique em um campo para destacar:</strong>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          <span *ngFor="let campo of legendaCampos"
                (click)="selecionarCampo(campo.nome)"
                [style.background]="campo.cor"
                [style.boxShadow]="campoSelecionado === campo.nome ? '0 0 0 3px #1565c0' : 'none'"
                [style.transform]="campoSelecionado === campo.nome ? 'scale(1.05)' : 'scale(1)'"
                [style.fontWeight]="campoSelecionado === campo.nome ? 'bold' : 'normal'"
                style="display:inline-block;padding:6px 10px;border-radius:4px;font-size:11px;cursor:pointer;transition:all 0.2s;border:1px solid rgba(0,0,0,0.1);"
                [title]="campo.descricao || 'Clique para destacar'">
            {{ campo.nome }} <span style="opacity:0.7;">[{{ campo.ini + 1 }}-{{ campo.fim }}]</span>
          </span>
        </div>
      </div>

      <!-- Visualização -->
      <div *ngIf="visualHtml" [innerHTML]="visualHtml" style="overflow-x:auto;background:#fff;padding:10px;border-radius:6px;border:1px solid #e0e0e0;"></div>

      <div *ngIf="!visualHtml && !error" style="margin-top:24px;padding:40px;text-align:center;color:#888;background:#fafafa;border-radius:6px;border:2px dashed #ddd;">
        📄 Anexe um arquivo .REM (Remessa CNAB 400 - Banco Paulista) para iniciar a validação
      </div>
    </div>
  `
})
export class PaulistaCnab400ValidadorComponent {
  visualHtml: SafeHtml | null = null;
  error: string | null = null;
  erros: Erro[] = [];
  validado = false;
  campoSelecionado: string | null = null;
  conteudoArquivo: string = '';
  legendaCampos: CampoLayout[] = [];
  estatisticas: EstatisticasArquivo | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  getErrosPorSeveridade(severidade: 'erro' | 'aviso'): Erro[] {
    return this.erros.filter(e => e.severidade === severidade);
  }

  selecionarCampo(nomeCampo: string): void {
    this.campoSelecionado = this.campoSelecionado === nomeCampo ? null : nomeCampo;
    if (this.conteudoArquivo) {
      const html = this.renderizarArquivo(this.conteudoArquivo);
      this.visualHtml = this.sanitizer.bypassSecurityTrustHtml(html);
    }
  }

  // ========================================
  // LAYOUT HEADER (TIPO 0) - CONFORME DOCUMENTAÇÃO OFICIAL
  // ========================================
  camposHeader: CampoLayout[] = [
    { nome: 'Tipo Registro', ini: 0, fim: 1, tipo: 'N', obrigatorio: true, valores: ['0'], cor: '#f8bbd0', descricao: 'Identificação do Registro (0)' },
    { nome: 'Ident. Arquivo', ini: 1, fim: 2, tipo: 'N', obrigatorio: true, valores: ['1'], cor: '#ffe082', descricao: 'Identificação Arquivo Remessa (1)' },
    { nome: 'Literal Remessa', ini: 2, fim: 9, tipo: 'A', obrigatorio: true, valores: ['REMESSA'], cor: '#b2dfdb', descricao: 'Literal REMESSA (7 pos)' },
    { nome: 'Cód. Serviço', ini: 9, fim: 11, tipo: 'N', obrigatorio: true, valores: ['01'], cor: '#c5cae9', descricao: 'Código Serviço - 01=Cobrança' },
    { nome: 'Literal Serviço', ini: 11, fim: 26, tipo: 'A', obrigatorio: true, valores: ['COBRANCA'], cor: '#e1bee7', descricao: 'Literal COBRANCA (15 pos)' },
    { nome: 'Cód. Originador', ini: 26, fim: 46, tipo: 'N', obrigatorio: true, cor: '#b3e5fc', descricao: 'Código Originador fornecido pelo banco (20 pos)' },
    { nome: 'Nome Originador', ini: 46, fim: 76, tipo: 'A', obrigatorio: true, cor: '#ffecb3', descricao: 'Razão Social do Originador (30 pos)' },
    { nome: 'Nº Banco', ini: 76, fim: 79, tipo: 'N', obrigatorio: true, valores: ['611'], cor: '#ffccbc', descricao: 'Número Banco Paulista - 611' },
    { nome: 'Nome Banco', ini: 79, fim: 94, tipo: 'A', obrigatorio: true, valores: ['PAULISTA S.A.'], cor: '#dcedc8', descricao: 'Nome do Banco (15 pos)' },
    { nome: 'Data Gravação', ini: 94, fim: 100, tipo: 'N', obrigatorio: true, formato: 'DDMMAA', cor: '#fff9c4', descricao: 'Data da Gravação - DDMMAA' },
    { nome: 'Branco', ini: 100, fim: 108, tipo: 'A', obrigatorio: true, cor: '#f5f5f5', descricao: 'Branco (8 pos)' },
    { nome: 'Ident. Sistema', ini: 108, fim: 110, tipo: 'A', obrigatorio: true, valores: ['MX'], cor: '#b2ebf2', descricao: 'Identificação Sistema - MX' },
    { nome: 'Nº Seq. Arquivo', ini: 110, fim: 117, tipo: 'N', obrigatorio: true, cor: '#ffcdd2', descricao: 'Número Sequencial Arquivo (7 pos)' },
    { nome: 'Branco', ini: 117, fim: 394, tipo: 'A', obrigatorio: true, cor: '#f5f5f5', descricao: 'Branco (277 pos)' },
    { nome: 'Seq. Registro', ini: 394, fim: 400, tipo: 'N', obrigatorio: true, valores: ['000001'], cor: '#b2ebf2', descricao: 'Sequencial Registro - 000001' },
  ];

  // ========================================
  // LAYOUT DETALHE (TIPO 1) - CONFORME DOCUMENTAÇÃO OFICIAL
  // TODOS OS 46 CAMPOS MAPEADOS CORRETAMENTE
  // ========================================
  camposDetalhe: CampoLayout[] = [
    { nome: 'Tipo Registro', ini: 0, fim: 1, tipo: 'N', obrigatorio: true, valores: ['1'], cor: '#f8bbd0', descricao: 'Identificação Registro (1)' },
    { nome: 'Déb. Auto C/C', ini: 1, fim: 20, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Débito Automático C/C - Branco (19 pos)' },
    { nome: 'Coobrigação', ini: 20, fim: 22, tipo: 'N', obrigatorio: false, valores: ['01', '02'], cor: '#ffe082', descricao: '01=Com, 02=Sem Coobrigação' },
    { nome: 'Caract. Especial', ini: 22, fim: 24, tipo: 'N', obrigatorio: false, cor: '#fff9c4', descricao: 'Característica Especial - Anexo 8 SRC3040' },
    { nome: 'Modal. Operação', ini: 24, fim: 28, tipo: 'N', obrigatorio: false, cor: '#c5cae9', descricao: 'Modalidade Operação - Anexo 3 SRC3040 (4 pos)' },
    { nome: 'Nat. Operação', ini: 28, fim: 30, tipo: 'N', obrigatorio: false, cor: '#e1bee7', descricao: 'Natureza Operação - Anexo 2 SRC3040' },
    { nome: 'Origem Recurso', ini: 30, fim: 34, tipo: 'N', obrigatorio: false, cor: '#d1c4e9', descricao: 'Origem Recurso - Anexo 4 SRC3040 (4 pos)' },
    { nome: 'Classe Risco', ini: 34, fim: 36, tipo: 'A', obrigatorio: false, cor: '#ffcc80', descricao: 'Classe Risco Operação - Anexo 17 SRC3040' },
    { nome: 'Zeros', ini: 36, fim: 37, tipo: 'N', obrigatorio: false, cor: '#f5f5f5', descricao: 'Zeros (1 pos)' },
    { nome: 'Nº Controle', ini: 37, fim: 62, tipo: 'A', obrigatorio: true, cor: '#b3e5fc', descricao: 'Nº Controle Participante - Ident. título (25 pos)' },
    { nome: 'Nº Banco', ini: 62, fim: 65, tipo: 'N', obrigatorio: true, cor: '#81d4fa', descricao: 'Número Banco (obrig. se Espécie=Cheque, senão 000)' },
    { nome: 'Zeros', ini: 65, fim: 70, tipo: 'N', obrigatorio: true, cor: '#f5f5f5', descricao: 'Zeros (5 pos)' },
    { nome: 'Ident. Título', ini: 70, fim: 81, tipo: 'N', obrigatorio: false, cor: '#ffccbc', descricao: 'Identificação Título no Banco - Branco (11 pos)' },
    { nome: 'Dígito N/N', ini: 81, fim: 82, tipo: 'A', obrigatorio: false, cor: '#ffab91', descricao: 'Dígito Nosso Número - Branco' },
    { nome: 'Valor Pago', ini: 82, fim: 92, tipo: 'N', obrigatorio: false, cor: '#4db6ac', descricao: 'Valor pago na liquidação/baixa (10 pos, 2 dec)' },
    { nome: 'Cond. Papeleta', ini: 92, fim: 93, tipo: 'N', obrigatorio: false, cor: '#f5f5f5', descricao: 'Condição Emissão Papeleta - Branco' },
    { nome: 'Ident. Papeleta', ini: 93, fim: 94, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Se emite papeleta Débito Auto - Branco' },
    { nome: 'Data Liquidação', ini: 94, fim: 100, tipo: 'N', obrigatorio: true, formato: 'DDMMAA', cor: '#fff59d', descricao: 'Data Liquidação - DDMMAA (somente p/ liquidação)' },
    { nome: 'Ident. Operação', ini: 100, fim: 104, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Identificação Operação Banco - Branco (4 pos)' },
    { nome: 'Indic. Rateio', ini: 104, fim: 105, tipo: 'A', obrigatorio: false, cor: '#c8e6c9', descricao: 'Indicador Rateio Crédito - Branco' },
    { nome: 'Endereço Aviso', ini: 105, fim: 106, tipo: 'N', obrigatorio: false, cor: '#f5f5f5', descricao: 'Endereçamento Aviso Débito - Branco' },
    { nome: 'Branco', ini: 106, fim: 108, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Branco (2 pos)' },
    { nome: 'Cód. Ocorrência', ini: 108, fim: 110, tipo: 'N', obrigatorio: true, cor: '#80deea', descricao: 'Identificação Ocorrência (01,04,06,14,71-77,80,81,84,87)' },
    { nome: 'Nº Documento', ini: 110, fim: 120, tipo: 'A', obrigatorio: true, cor: '#c5e1a5', descricao: 'Número do Documento (10 pos)' },
    { nome: 'Vencimento', ini: 120, fim: 126, tipo: 'N', obrigatorio: true, formato: 'DDMMAA', cor: '#fff9c4', descricao: 'Data Vencimento Título - DDMMAA' },
    { nome: 'Valor Título', ini: 126, fim: 139, tipo: 'N', obrigatorio: true, cor: '#ef9a9a', descricao: 'Valor do Título (13 pos, 2 dec) - sem ponto/vírgula' },
    { nome: 'Banco Cobrança', ini: 139, fim: 142, tipo: 'N', obrigatorio: false, cor: '#b3e5fc', descricao: 'Banco Encarregado Cobrança - ou 000 (3 pos)' },
    { nome: 'Ag. Depositária', ini: 142, fim: 147, tipo: 'N', obrigatorio: false, cor: '#81d4fa', descricao: 'Agência Depositária - ou 00000 (5 pos)' },
    { nome: 'Espécie Título', ini: 147, fim: 149, tipo: 'N', obrigatorio: true, valores: ['01', '02', '51'], cor: '#bcaaa4', descricao: '01=Duplicata, 02=NP, 51=Cheque' },
    { nome: 'Identificação', ini: 149, fim: 150, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Identificação - Branco' },
    { nome: 'Data Emissão', ini: 150, fim: 156, tipo: 'N', obrigatorio: true, formato: 'DDMMAA', cor: '#b2ebf2', descricao: 'Data Emissão Título - DDMMAA' },
    { nome: '1ª Instrução', ini: 156, fim: 158, tipo: 'N', obrigatorio: false, valores: ['00'], cor: '#b0bec5', descricao: '1ª Instrução - 00 (2 pos)' },
    { nome: '2ª Instrução', ini: 158, fim: 159, tipo: 'N', obrigatorio: false, valores: ['0'], cor: '#90a4ae', descricao: '2ª Instrução - 0 (1 pos)' },
    { nome: 'Insc. Est. Sacado', ini: 159, fim: 173, tipo: 'A', obrigatorio: false, cor: '#ffab91', descricao: 'Inscrição Estadual Sacado (14 pos) - Obrig. p/ Duplicata' },
    { nome: 'Nº Termo Cessão', ini: 173, fim: 192, tipo: 'A', obrigatorio: false, cor: '#ff8a65', descricao: 'Número Termo Cessão (19 pos) - Obrig. p/ Duplicata' },
    { nome: 'Valor Presente', ini: 192, fim: 205, tipo: 'N', obrigatorio: true, cor: '#80cbc4', descricao: 'Valor Presente Parcela (13 pos, 2 dec)' },
    { nome: 'Valor Abatimento', ini: 205, fim: 218, tipo: 'N', obrigatorio: false, cor: '#4db6ac', descricao: 'Valor Abatimento (13 pos, 2 dec)' },
    { nome: 'Tipo Insc. Sacado', ini: 218, fim: 220, tipo: 'N', obrigatorio: true, valores: ['01', '02'], cor: '#e0f7fa', descricao: '01=CPF, 02=CNPJ' },
    { nome: 'CPF/CNPJ Sacado', ini: 220, fim: 234, tipo: 'N', obrigatorio: true, cor: '#90caf9', descricao: 'Nº Inscrição Sacado (14 pos) - alinhado à direita' },
    { nome: 'Nome Sacado', ini: 234, fim: 274, tipo: 'A', obrigatorio: true, cor: '#ffcc80', descricao: 'Nome do Sacado (40 pos)' },
    { nome: 'Endereço Sacado', ini: 274, fim: 314, tipo: 'A', obrigatorio: true, cor: '#ffe0b2', descricao: 'Endereço Completo Sacado (40 pos)' },
    { nome: 'Nº NF Duplicata', ini: 314, fim: 323, tipo: 'A', obrigatorio: false, cor: '#ce93d8', descricao: 'Número NF Duplicata (9 pos) - Obrig. p/ Duplicata' },
    { nome: 'Série NF', ini: 323, fim: 326, tipo: 'A', obrigatorio: false, cor: '#ba68c8', descricao: 'Número Série NF Duplicata (3 pos) - Obrig. p/ Duplicata' },
    { nome: 'CEP', ini: 326, fim: 334, tipo: 'N', obrigatorio: true, cor: '#c8e6c9', descricao: 'CEP do Sacado (8 pos)' },
    { nome: 'Nome Cedente', ini: 334, fim: 380, tipo: 'A', obrigatorio: true, cor: '#aed581', descricao: 'Nome do Cedente (46 pos) - 335 a 380' },
    { nome: 'CNPJ Cedente', ini: 380, fim: 394, tipo: 'N', obrigatorio: true, cor: '#81c784', descricao: 'CNPJ do Cedente (14 pos) - 381 a 394' },
    { nome: 'Seq. Registro', ini: 394, fim: 400, tipo: 'N', obrigatorio: true, cor: '#b2ebf2', descricao: 'Número Sequencial Registro' },
  ];

  // ========================================
  // LAYOUT TRAILER (TIPO 9) - CONFORME DOCUMENTAÇÃO OFICIAL
  // ========================================
  camposTrailer: CampoLayout[] = [
    { nome: 'Tipo Registro', ini: 0, fim: 1, tipo: 'N', obrigatorio: true, valores: ['9'], cor: '#f8bbd0', descricao: 'Identificação Registro Trailer (9)' },
    { nome: 'Branco', ini: 1, fim: 394, tipo: 'A', obrigatorio: true, cor: '#f5f5f5', descricao: 'Branco (393 pos)' },
    { nome: 'Seq. Registro', ini: 394, fim: 400, tipo: 'N', obrigatorio: true, cor: '#b2ebf2', descricao: 'Número Sequencial Último Registro' },
  ];

  onFileChange(event: Event) {
    this.error = null;
    this.visualHtml = null;
    this.erros = [];
    this.validado = false;
    this.campoSelecionado = null;
    this.conteudoArquivo = '';
    this.estatisticas = null;

    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const content = reader.result as string;
        this.conteudoArquivo = content;
        const html = this.validarEHighlight(content);
        this.visualHtml = this.sanitizer.bypassSecurityTrustHtml(html);
        this.validado = true;
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
            mensagem: `Tipo de registro desconhecido: "${tipo}". Tipos válidos: 0 (Header), 1 (Detalhe), 9 (Trailer)`,
            severidade: 'erro'
          });
      }

      // Validação flexível: aceita 400 ou 444 caracteres
      if (line.length !== 400 && line.length !== 444) {
        this.erros.push({
          linha: idx + 1,
          campo: 'Linha',
          posicao: `1-${line.length}`,
          valor: `${line.length} caracteres`,
          mensagem: `Tamanho inválido. Esperado: 400 ou 444, Encontrado: ${line.length}`,
          severidade: 'erro'
        });
      }

      for (const campo of campos) {
        const valor = line.slice(campo.ini, campo.fim);
        this.validarCampo(idx + 1, campo, valor);
      }

      // Validar sequência
      const seqCampo = campos.find(c => c.nome === 'Seq. Registro');
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

    const todosCampos = [...this.camposHeader, ...this.camposDetalhe, ...this.camposTrailer];
    this.legendaCampos = todosCampos.filter(
      (campo, index, self) => self.findIndex(c => c.nome === campo.nome) === index
    );

    return lines.map((line, idx) => this.lineToMatrix(line, idx)).join('');
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

    if (this.estatisticas.detalhes === 0) {
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

  renderizarArquivo(content: string): string {
    const lines = content.split(/\r?\n/).filter(l => l.length > 0);
    return lines.map((line, idx) => this.lineToMatrix(line, idx)).join('');
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

    // Validação RIGOROSA: campos numéricos NÃO devem ter espaços
    if (campo.tipo === 'N' && valorTrim !== '') {
      if (valor.includes(' ')) {
        this.erros.push({
          linha,
          campo: campo.nome,
          posicao: `${campo.ini + 1}-${campo.fim}`,
          valor: valor,
          mensagem: 'Campo numérico contém espaços. Deve ser preenchido com zeros à direita.',
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

    let html = `<div style="margin-bottom:12px;padding:8px;background:#fafafa;border-radius:4px;">`;
    html += `<div style="display:flex;align-items:center;margin-bottom:6px;gap:10px;">`;
    html += `<span style="min-width:80px;font-size:12px;color:${tipoColor};font-weight:600;">Linha ${lineIdx+1}</span>`;
    html += `<span style="padding:3px 10px;background:${tipoColor};color:#fff;border-radius:4px;font-size:11px;font-weight:600;">${tipoNome}</span>`;
    html += `<span style="padding:3px 8px;background:#757575;color:#fff;border-radius:4px;font-size:10px;font-weight:500;">${line.length} chars</span>`;

    const errosLinha = this.erros.filter(e => e.linha === lineIdx + 1 && e.severidade === 'erro');
    if (errosLinha.length > 0) {
      html += `<span style="padding:3px 10px;background:#d32f2f;color:#fff;border-radius:4px;font-size:11px;margin-left:auto;">⚠️ ${errosLinha.length} erro(s)</span>`;
    }

    html += `</div>`;

    // Container com fonte monoespaçada e sem wrap (sem overflow-x para evitar barra por linha)
    html += `<div style="font-family:'Courier New',Courier,monospace;font-size:11px;line-height:1;white-space:nowrap;background:#fff;padding:6px;border-radius:4px;border:1px solid #e0e0e0;">`;

    // Renderizar 444 caracteres (suporta campos extras como Número da Nota Fiscal)
    for (let i = 0; i < 444; i++) {
      const char = i < line.length ? line[i] : ' ';
      const campo = campos.find(c => i >= c.ini && i < c.fim);

      // Campos após posição 400 terão cor de extensão
      let cor = '#f5f5f5';
      let nomeCampo = 'N/D';

      if (campo) {
        cor = campo.cor;
        nomeCampo = campo.nome;
      } else if (i >= 400) {
        cor = '#e8f5e9'; // Verde claro para campos de extensão
        nomeCampo = `Campo Extra (pos ${i + 1})`;
      }

      const temErro = campo ? this.erros.some(e => e.linha === lineIdx + 1 && e.campo === campo.nome && e.severidade === 'erro') : false;

      // Estilo de borda
      let bordaStyle = 'border:1px solid rgba(0,0,0,0.08);';
      if (temErro) {
        bordaStyle = 'border:2px solid #d32f2f;box-shadow:0 0 3px rgba(211,47,47,0.3);';
      }

      // Estilo de seleção
      const estaSelecionado = this.campoSelecionado && campo && campo.nome === this.campoSelecionado;
      let estiloDestaque = '';
      let opacidade = '';

      if (estaSelecionado) {
        estiloDestaque = 'box-shadow:0 0 0 2px #1565c0;z-index:10;position:relative;transform:scale(1.15);';
      } else if (this.campoSelecionado) {
        opacidade = 'opacity:0.3;';
      }

      const title = `${nomeCampo} - Pos ${i+1}${campo?.descricao ? '\n' + campo.descricao : ''}`;

      // Célula com largura fixa para alinhamento perfeito
      html += `<span style="display:inline-block;width:13px;height:18px;line-height:18px;text-align:center;vertical-align:top;background:${cor};${bordaStyle}${estiloDestaque}${opacidade}cursor:default;user-select:none;" title="${this.escapeHtml(title)}">${char === ' ' ? '·' : this.escapeHtml(char)}</span>`;
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
