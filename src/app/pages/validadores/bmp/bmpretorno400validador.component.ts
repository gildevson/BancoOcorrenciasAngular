import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  trailers: number;
  desconhecidos: number;
}

@Component({
  selector: 'app-bmp-cnab400-retorno-validador',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cnab-validador">
      <h2 class="titulo">🏦 Validador Retorno Banco BMP CNAB 400</h2>

      <div class="upload-area">
        <label class="upload-label">📁 Selecione o arquivo de retorno (.RET ou .TXT)</label>
        <input type="file" accept=".ret,.txt,.RET,.TXT" (change)="onFileChange($event)" />
      </div>

      <div *ngIf="error" class="erro-container">
        ❌ {{ error }}
      </div>

      <!-- Estatísticas -->
      <div *ngIf="estatisticas && validado" class="estatisticas-grid">
        <div class="stat-card stat-total">
          <div class="stat-valor">{{ estatisticas.totalLinhas }}</div>
          <div class="stat-label">Total Linhas</div>
        </div>
        <div class="stat-card stat-header">
          <div class="stat-valor">{{ estatisticas.headers }}</div>
          <div class="stat-label">Headers (0)</div>
        </div>
        <div class="stat-card stat-detalhe">
          <div class="stat-valor">{{ estatisticas.detalhes }}</div>
          <div class="stat-label">Detalhes (1)</div>
        </div>
        <div class="stat-card stat-trailer">
          <div class="stat-valor">{{ estatisticas.trailers }}</div>
          <div class="stat-label">Trailers (9)</div>
        </div>
      </div>

      <!-- Erros Críticos -->
      <div *ngIf="getErrosPorSeveridade('erro').length > 0" class="erros-container erros-criticos">
        <strong>🚫 {{ getErrosPorSeveridade('erro').length }} erro(s) crítico(s):</strong>
        <ul>
          <li *ngFor="let e of getErrosPorSeveridade('erro')">
            <strong class="erro-linha">Linha {{ e.linha }}</strong> -
            <span class="erro-campo">{{ e.campo }}</span>
            <span class="erro-posicao">[{{ e.posicao }}]</span>:
            <code class="erro-valor">{{ e.valor }}</code>
            → <span class="erro-msg">{{ e.mensagem }}</span>
          </li>
        </ul>
      </div>

      <!-- Avisos -->
      <div *ngIf="getErrosPorSeveridade('aviso').length > 0" class="erros-container erros-avisos">
        <strong>⚠️ {{ getErrosPorSeveridade('aviso').length }} aviso(s):</strong>
        <ul>
          <li *ngFor="let e of getErrosPorSeveridade('aviso')">
            <strong>Linha {{ e.linha }}</strong> - {{ e.campo }}: {{ e.mensagem }}
          </li>
        </ul>
      </div>

      <!-- Sucesso -->
      <div *ngIf="validado && getErrosPorSeveridade('erro').length === 0" class="sucesso-container">
        <strong>✅ Arquivo válido!</strong>
        <span *ngIf="getErrosPorSeveridade('aviso').length > 0" class="avisos-count">
          ({{ getErrosPorSeveridade('aviso').length }} aviso(s))
        </span>
      </div>

      <!-- Legenda -->
      <div *ngIf="legendaCampos.length > 0" class="legenda-container">
        <strong>📌 Clique em um campo para destacar:</strong>
        <div class="legenda-campos">
          <span *ngFor="let campo of legendaCampos"
                (click)="selecionarCampo(campo.nome)"
                class="legenda-item"
                [class.selecionado]="campoSelecionado === campo.nome"
                [style.background]="campo.cor"
                [title]="campo.descricao || 'Clique para destacar'">
            {{ campo.nome }} <span class="legenda-pos">[{{ campo.ini + 1 }}-{{ campo.fim }}]</span>
          </span>
        </div>
        <div *ngIf="campoSelecionado" class="campo-selecionado-info">
          <strong>Campo selecionado:</strong> {{ campoSelecionado }}
          <button (click)="selecionarCampo(campoSelecionado!)">Limpar seleção</button>
        </div>
      </div>

      <!-- Visualização da Matriz -->
      <div *ngIf="visualHtml" class="matriz-container" [innerHTML]="visualHtml"></div>

      <!-- Placeholder -->
      <div *ngIf="!visualHtml && !error" class="placeholder">
        <div class="placeholder-icon">📄</div>
        <div class="placeholder-text">Nenhum arquivo carregado</div>
        <div class="placeholder-hint">Selecione um arquivo .RET (Retorno CNAB 400 - Banco BMP) para iniciar a validação</div>
      </div>
    </div>
  `,
  styleUrls: ['./bmpcnab400retornovalidador.component.css']
})
export class BmpCnab400RetornoValidadorComponent {
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
  // LAYOUT HEADER RETORNO (TIPO 0) - Posições 1-400
  // ========================================
  camposHeaderRetorno: CampoLayout[] = [
    { nome: 'Tipo Registro', ini: 0, fim: 1, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['0'], cor: '#f8bbd0', descricao: 'Identificação Registro Header (0)' },
    { nome: 'Ident. Arquivo Retorno', ini: 1, fim: 2, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['2'], cor: '#ffe082', descricao: 'Identificação Arquivo Retorno (2)' },
    { nome: 'Literal Retorno', ini: 2, fim: 9, tamanho: 7, tipo: 'A', obrigatorio: true, valores: ['RETORNO'], cor: '#b2dfdb', descricao: 'Literal RETORNO' },
    { nome: 'Código do Serviço', ini: 9, fim: 11, tamanho: 2, tipo: 'N', obrigatorio: true, valores: ['01'], cor: '#c5cae9', descricao: 'Código Serviço - 01=Cobrança' },
    { nome: 'Literal Serviço', ini: 11, fim: 26, tamanho: 15, tipo: 'A', obrigatorio: true, valores: ['COBRANCA'], cor: '#e1bee7', descricao: 'Literal COBRANCA' },
    { nome: 'Código da Empresa', ini: 26, fim: 46, tamanho: 20, tipo: 'N', obrigatorio: true, cor: '#b3e5fc', descricao: 'Nº Empresa fornecido pelo BMP' },
    { nome: 'Nome da Empresa', ini: 46, fim: 76, tamanho: 30, tipo: 'A', obrigatorio: true, cor: '#ffecb3', descricao: 'Razão Social' },
    { nome: 'Nº BMP', ini: 76, fim: 79, tamanho: 3, tipo: 'N', obrigatorio: true, valores: ['274'], cor: '#ffccbc', descricao: 'Nº BMP na Câmara - 274' },
    { nome: 'Nome do Banco', ini: 79, fim: 94, tamanho: 15, tipo: 'A', obrigatorio: true, cor: '#dcedc8', descricao: 'BMP Money Plus' },
    { nome: 'Data da Gravação', ini: 94, fim: 100, tamanho: 6, tipo: 'N', obrigatorio: true, formato: 'DDMMAA', cor: '#fff9c4', descricao: 'Data Gravação - DDMMAA' },
    { nome: 'Densidade Gravação', ini: 100, fim: 108, tamanho: 8, tipo: 'N', obrigatorio: true, valores: ['01600000'], cor: '#b2ebf2', descricao: 'Densidade - 01600000' },
    { nome: 'Nº Aviso Bancário', ini: 108, fim: 113, tamanho: 5, tipo: 'N', obrigatorio: false, cor: '#ffcdd2', descricao: 'Nº Aviso' },
    { nome: 'Branco 1', ini: 113, fim: 379, tamanho: 266, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Branco (266 pos)' },
    { nome: 'Data do Crédito', ini: 379, fim: 385, tamanho: 6, tipo: 'N', obrigatorio: false, formato: 'DDMMAA', cor: '#c8e6c9', descricao: 'Data Crédito - DDMMAA' },
    { nome: 'Branco 2', ini: 385, fim: 394, tamanho: 9, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Branco (9 pos)' },
    { nome: 'Nº Sequencial', ini: 394, fim: 400, tamanho: 6, tipo: 'N', obrigatorio: true, valores: ['000001'], cor: '#b2ebf2', descricao: 'Sequencial - 000001' },
  ];

  // ========================================
  // LAYOUT DETALHE RETORNO (TIPO 1) - Posições 1-400
  // ========================================
  camposDetalheRetorno: CampoLayout[] = [
    { nome: 'Tipo Registro', ini: 0, fim: 1, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['1'], cor: '#f8bbd0', descricao: 'Identificação Registro (1)' },
    { nome: 'Tipo Inscrição Empresa', ini: 1, fim: 3, tamanho: 2, tipo: 'N', obrigatorio: true, valores: ['01', '02'], cor: '#ffe082', descricao: '01=CPF, 02=CNPJ' },
    { nome: 'Nº Inscrição Empresa', ini: 3, fim: 17, tamanho: 14, tipo: 'N', obrigatorio: true, cor: '#b2dfdb', descricao: 'CPF/CNPJ Empresa' },
    { nome: 'Zeros 1', ini: 17, fim: 20, tamanho: 3, tipo: 'N', obrigatorio: true, valores: ['000'], cor: '#f5f5f5', descricao: 'Zeros (3 pos)' },
    { nome: 'Ident. Empresa Beneficiária', ini: 20, fim: 37, tamanho: 17, tipo: 'A', obrigatorio: true, cor: '#c5cae9', descricao: 'Zero+Carteira+Agência+Conta' },
    { nome: 'Nº Controle Participante', ini: 37, fim: 52, tamanho: 15, tipo: 'A', obrigatorio: false, cor: '#b3e5fc', descricao: 'Uso da Empresa' },
    { nome: 'Uso do Banco 1', ini: 52, fim: 62, tamanho: 10, tipo: 'A', obrigatorio: false, cor: '#e0e0e0', descricao: 'Branco' },
    { nome: 'Zeros 2', ini: 62, fim: 70, tamanho: 8, tipo: 'N', obrigatorio: false, valores: ['00000000'], cor: '#f5f5f5', descricao: 'Zeros (8 pos)' },
    { nome: 'Nosso Número 1', ini: 70, fim: 82, tamanho: 12, tipo: 'N', obrigatorio: true, cor: '#ffccbc', descricao: 'Nº Banco (12 pos)' },
    { nome: 'Uso do Banco 2', ini: 82, fim: 92, tamanho: 10, tipo: 'N', obrigatorio: false, valores: ['0000000000'], cor: '#e0e0e0', descricao: 'Zeros' },
    { nome: 'Uso do Banco 3', ini: 92, fim: 104, tamanho: 12, tipo: 'A', obrigatorio: false, cor: '#e0e0e0', descricao: 'Branco' },
    { nome: 'Uso do Banco 4', ini: 104, fim: 105, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#e0e0e0', descricao: 'Branco' },
    { nome: 'Uso do Banco 5', ini: 105, fim: 107, tamanho: 2, tipo: 'N', obrigatorio: false, valores: ['00'], cor: '#e0e0e0', descricao: 'Zeros' },
    { nome: 'Uso do Banco 6', ini: 107, fim: 108, tamanho: 1, tipo: 'N', obrigatorio: false, valores: ['0'], cor: '#e0e0e0', descricao: 'Zero' },
    { nome: 'Ident. Ocorrência', ini: 108, fim: 110, tamanho: 2, tipo: 'N', obrigatorio: true, cor: '#80deea', descricao: '02,03,06,09,10,11,12,13,17,18,21,22,24,27,28,29,32,40' },
    { nome: 'Data Ocorrência', ini: 110, fim: 116, tamanho: 6, tipo: 'N', obrigatorio: true, formato: 'DDMMAA', cor: '#fff9c4', descricao: 'Data Ocorrência - DDMMAA' },
    { nome: 'Número Documento', ini: 116, fim: 126, tamanho: 10, tipo: 'A', obrigatorio: false, cor: '#c5e1a5', descricao: 'Nº do Documento' },
    { nome: 'Nosso Número 2', ini: 126, fim: 146, tamanho: 20, tipo: 'N', obrigatorio: true, cor: '#ffab91', descricao: 'Nº Banco (20 pos)' },
    { nome: 'Data Vencimento', ini: 146, fim: 152, tamanho: 6, tipo: 'N', obrigatorio: false, formato: 'DDMMAA', cor: '#fff59d', descricao: 'Data Vencimento - DDMMAA' },
    { nome: 'Valor do Título', ini: 152, fim: 165, tamanho: 13, tipo: 'N', obrigatorio: false, cor: '#ef9a9a', descricao: 'Valor Título (13 pos, 2 dec)' },
    { nome: 'Banco Cobrador', ini: 165, fim: 168, tamanho: 3, tipo: 'N', obrigatorio: false, cor: '#b3e5fc', descricao: 'Código Banco - CIP' },
    { nome: 'Agência Cobradora', ini: 168, fim: 173, tamanho: 5, tipo: 'N', obrigatorio: false, cor: '#81d4fa', descricao: 'Código Agência - CIP' },
    { nome: 'Espécie Título', ini: 173, fim: 175, tamanho: 2, tipo: 'A', obrigatorio: false, cor: '#bcaaa4', descricao: 'Branco' },
    { nome: 'Despesas Cobrança', ini: 175, fim: 188, tamanho: 13, tipo: 'N', obrigatorio: false, cor: '#ffb74d', descricao: 'Despesas (ocor. 02 e 28)' },
    { nome: 'Outras Despesas', ini: 188, fim: 201, tamanho: 13, tipo: 'N', obrigatorio: false, cor: '#ff9800', descricao: 'Outras despesas (zeros)' },
    { nome: 'Juros Operação Atraso', ini: 201, fim: 214, tamanho: 13, tipo: 'N', obrigatorio: false, cor: '#ff8a65', descricao: 'Juros (zeros)' },
    { nome: 'Brancos 1', ini: 214, fim: 227, tamanho: 13, tipo: 'N', obrigatorio: false, cor: '#f5f5f5', descricao: 'Zeros' },
    { nome: 'Abatimento Concedido', ini: 227, fim: 240, tamanho: 13, tipo: 'N', obrigatorio: false, cor: '#a5d6a7', descricao: 'Valor Abatimento' },
    { nome: 'Desconto Concedido', ini: 240, fim: 253, tamanho: 13, tipo: 'N', obrigatorio: false, cor: '#80cbc4', descricao: 'Valor Desconto' },
    { nome: 'Valor Pago', ini: 253, fim: 266, tamanho: 13, tipo: 'N', obrigatorio: false, cor: '#66bb6a', descricao: 'Valor Pago (13 pos, 2 dec)' },
    { nome: 'Juros de Mora', ini: 266, fim: 279, tamanho: 13, tipo: 'N', obrigatorio: false, cor: '#ffab91', descricao: 'Juros Mora' },
    { nome: 'Outros Créditos', ini: 279, fim: 292, tamanho: 13, tipo: 'N', obrigatorio: false, valores: ['0000000000000'], cor: '#4db6ac', descricao: 'Zeros' },
    { nome: 'Brancos 2', ini: 292, fim: 294, tamanho: 2, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos' },
    { nome: 'Brancos 3', ini: 294, fim: 295, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Branco' },
    { nome: 'Data do Crédito', ini: 295, fim: 301, tamanho: 6, tipo: 'N', obrigatorio: false, formato: 'DDMMAA', cor: '#c8e6c9', descricao: 'Data Crédito - DDMMAA' },
    { nome: 'Origem Pagamento', ini: 301, fim: 304, tamanho: 3, tipo: 'N', obrigatorio: false, valores: ['006'], cor: '#aed581', descricao: 'Origem - 006' },
    { nome: 'Brancos 4', ini: 304, fim: 314, tamanho: 10, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos' },
    { nome: 'Brancos 5', ini: 314, fim: 318, tamanho: 4, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos' },
    { nome: 'Motivos Rejeições', ini: 318, fim: 328, tamanho: 10, tipo: 'N', obrigatorio: false, cor: '#e57373', descricao: 'Motivos (até 5 códigos)' },
    { nome: 'Brancos 6', ini: 328, fim: 394, tamanho: 66, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos' },
    { nome: 'Nº Sequencial', ini: 394, fim: 400, tamanho: 6, tipo: 'N', obrigatorio: true, cor: '#b2ebf2', descricao: 'Sequencial do Registro' },
  ];

  // ========================================
  // LAYOUT TRAILER RETORNO (TIPO 9) - Posições 1-400
  // ========================================
  camposTrailerRetorno: CampoLayout[] = [
    { nome: 'Tipo Registro', ini: 0, fim: 1, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['9'], cor: '#f8bbd0', descricao: 'Identificação Registro (9)' },
    { nome: 'Ident. Retorno', ini: 1, fim: 2, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['2'], cor: '#ffe082', descricao: 'Identificação Retorno (2)' },
    { nome: 'Ident. Tipo Registro', ini: 2, fim: 4, tamanho: 2, tipo: 'N', obrigatorio: true, valores: ['01'], cor: '#b2dfdb', descricao: 'Tipo Registro - 01' },
    { nome: 'Código do Banco', ini: 4, fim: 7, tamanho: 3, tipo: 'N', obrigatorio: true, valores: ['274'], cor: '#c5cae9', descricao: 'Código Banco - 274' },
    { nome: 'Brancos 1', ini: 7, fim: 17, tamanho: 10, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos' },
    { nome: 'Qtd Títulos Cobrança', ini: 17, fim: 25, tamanho: 8, tipo: 'N', obrigatorio: false, cor: '#e1bee7', descricao: 'Quantidade Títulos' },
    { nome: 'Valor Total Cobrança', ini: 25, fim: 39, tamanho: 14, tipo: 'N', obrigatorio: false, cor: '#ce93d8', descricao: 'Valor Total (14 pos, 2 dec)' },
    { nome: 'Brancos 2', ini: 39, fim: 57, tamanho: 18, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos' },
    { nome: 'Qtd Reg Ocor. 02', ini: 57, fim: 62, tamanho: 5, tipo: 'N', obrigatorio: false, cor: '#b3e5fc', descricao: 'Qtd Entradas Confirmadas' },
    { nome: 'Valor Reg Ocor. 02', ini: 62, fim: 74, tamanho: 12, tipo: 'N', obrigatorio: false, cor: '#81d4fa', descricao: 'Valor Entradas (12 pos, 2 dec)' },
    { nome: 'Valor Reg Ocor. 06 (1)', ini: 74, fim: 86, tamanho: 12, tipo: 'N', obrigatorio: false, cor: '#80cbc4', descricao: 'Valor Liquidação (12 pos, 2 dec)' },
    { nome: 'Qtd Reg Ocor. 06', ini: 86, fim: 91, tamanho: 5, tipo: 'N', obrigatorio: false, cor: '#4db6ac', descricao: 'Qtd Liquidação' },
    { nome: 'Valor Reg Ocor. 06 (2)', ini: 91, fim: 103, tamanho: 12, tipo: 'N', obrigatorio: false, cor: '#26a69a', descricao: 'Valor Liquidação (12 pos, 2 dec)' },
    { nome: 'Qtd Reg Ocor. 09/10', ini: 103, fim: 108, tamanho: 5, tipo: 'N', obrigatorio: false, cor: '#ffab91', descricao: 'Qtd Títulos Baixados' },
    { nome: 'Valor Reg Ocor. 09/10', ini: 108, fim: 120, tamanho: 12, tipo: 'N', obrigatorio: false, cor: '#ff8a65', descricao: 'Valor Baixados (12 pos, 2 dec)' },
    { nome: 'Qtd Reg Ocor. 13', ini: 120, fim: 125, tamanho: 5, tipo: 'N', obrigatorio: false, cor: '#a5d6a7', descricao: 'Qtd Abatimento Cancelado' },
    { nome: 'Valor Reg Ocor. 13', ini: 125, fim: 137, tamanho: 12, tipo: 'N', obrigatorio: false, cor: '#81c784', descricao: 'Valor Abat.Cancelado (12 pos, 2 dec)' },
    { nome: 'Qtd Reg Ocor. 14', ini: 137, fim: 142, tamanho: 5, tipo: 'N', obrigatorio: false, cor: '#c5e1a5', descricao: 'Qtd Vencimento Alterado' },
    { nome: 'Valor Reg Ocor. 14', ini: 142, fim: 154, tamanho: 12, tipo: 'N', obrigatorio: false, cor: '#aed581', descricao: 'Valor Venc.Alterado (12 pos, 2 dec)' },
    { nome: 'Qtd Reg Ocor. 12', ini: 154, fim: 159, tamanho: 5, tipo: 'N', obrigatorio: false, cor: '#fff59d', descricao: 'Qtd Abatimento Concedido' },
    { nome: 'Brancos 3', ini: 159, fim: 394, tamanho: 235, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos' },
    { nome: 'Nº Sequencial', ini: 394, fim: 400, tamanho: 6, tipo: 'N', obrigatorio: true, cor: '#b2ebf2', descricao: 'Sequencial do Registro' },
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
        this.error = 'Erro ao processar o arquivo. Verifique se é um arquivo CNAB 400 de Retorno válido.';
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
      const identArquivo = line.length > 1 ? line[1] : '';
      let campos: CampoLayout[];

      // Para Retorno, verificar se é tipo 0 ou 9 pela segunda posição (deve ser '2')
      if (tipo === '0' && identArquivo === '2') {
        campos = this.camposHeaderRetorno;
        this.estatisticas.headers++;
      } else if (tipo === '1') {
        campos = this.camposDetalheRetorno;
        this.estatisticas.detalhes++;
      } else if (tipo === '9' && identArquivo === '2') {
        campos = this.camposTrailerRetorno;
        this.estatisticas.trailers++;
      } else {
        campos = [];
        this.estatisticas.desconhecidos++;
        this.erros.push({
          linha: idx + 1,
          campo: 'Tipo Registro',
          posicao: '1-2',
          valor: tipo + identArquivo,
          mensagem: `Tipo de registro desconhecido: "${tipo}${identArquivo}". Para Retorno espera-se: 02 (Header), 1 (Detalhe), 92 (Trailer)`,
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
      const seqCampo = campos.find(c => c.nome === 'Nº Sequencial');
      if (seqCampo && line.length >= 400) {
        const valorSeq = line.slice(seqCampo.ini, seqCampo.fim).trim();
        const sequenciaAtual = parseInt(valorSeq, 10);

        if (!isNaN(sequenciaAtual) && sequenciaAtual !== sequenciaEsperada) {
          this.erros.push({
            linha: idx + 1,
            campo: 'Nº Sequencial',
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

    const todosCampos = [...this.camposHeaderRetorno, ...this.camposDetalheRetorno, ...this.camposTrailerRetorno];
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
        mensagem: 'Arquivo deve conter pelo menos um registro Header de Retorno (Tipo 02)',
        severidade: 'erro'
      });
    }

    if (this.estatisticas.trailers === 0) {
      this.erros.push({
        linha: 0,
        campo: 'Estrutura',
        posicao: '-',
        valor: '-',
        mensagem: 'Arquivo deve conter pelo menos um registro Trailer de Retorno (Tipo 92)',
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

    // Validação: campos numéricos NÃO devem ter espaços (exceto brancos preenchidos com zeros)
    if (campo.tipo === 'N' && valorTrim !== '' && !campo.nome.includes('Branco')) {
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
    const identArquivo = line.length > 1 ? line[1] : '';
    let campos: CampoLayout[];
    let tipoNome = '';
    let tipoColor = '';

    if (tipo === '0' && identArquivo === '2') {
      campos = this.camposHeaderRetorno;
      tipoNome = 'Header Retorno';
      tipoColor = '#7b1fa2';
    } else if (tipo === '1') {
      campos = this.camposDetalheRetorno;
      tipoNome = 'Detalhe Retorno';
      tipoColor = '#388e3c';
    } else if (tipo === '9' && identArquivo === '2') {
      campos = this.camposTrailerRetorno;
      tipoNome = 'Trailer Retorno';
      tipoColor = '#c2185b';
    } else {
      campos = [];
      tipoNome = 'Desconhecido';
      tipoColor = '#d32f2f';
    }

    // Linha simples apenas com as células - sem labels para manter alinhamento
    let html = `<div style="display:flex;flex-wrap:nowrap;gap:0;height:22px;margin-bottom:2px;">`;

    // Renderizar 400 caracteres
    for (let i = 0; i < Math.min(line.length, 400); i++) {
      const char = line[i] || ' ';
      const campo = campos.find(c => i >= c.ini && i < c.fim);
      const cor = campo ? campo.cor : '#f5f5f5';
      const nomeCampo = campo ? campo.nome : 'N/D';
      const temErro = campo ? this.erros.some(e => e.linha === lineIdx + 1 && e.campo === campo.nome && e.severidade === 'erro') : false;
      const bordaErro = temErro ? 'border:2px solid #d32f2f;box-shadow:0 0 4px rgba(211,47,47,0.5);' : 'border:1px solid rgba(0,0,0,0.1);';

      const estaSelecionado = this.campoSelecionado && campo && campo.nome === this.campoSelecionado;
      const estiloDestaque = estaSelecionado
        ? 'box-shadow:0 0 0 2px #1976d2;z-index:10;position:relative;transform:scale(1.3);'
        : '';
      const opacidade = this.campoSelecionado && !estaSelecionado ? 'opacity:0.3;' : '';

      const title = `${nomeCampo} - Posição ${i+1}${campo?.descricao ? '\n' + campo.descricao : ''}`;

      html += `<span style="display:inline-block;width:14px;height:20px;line-height:20px;text-align:center;background:${cor};${bordaErro}font-size:11px;font-family:'Courier New',monospace;${estiloDestaque}${opacidade}transition:all 0.2s;" title="${this.escapeHtml(title)}">${char === ' ' ? '&nbsp;' : this.escapeHtml(char)}</span>`;
    }

    html += '</div>';
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
