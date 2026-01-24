import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface CampoLayout {
  nome: string;
  ini: number;   // posição inicial (0-indexed)
  fim: number;   // posição final (0-indexed, exclusivo)
  tipo: 'A' | 'N'; // Alfanumérico ou Numérico
  obrigatorio: boolean;
  valores?: string[]; // valores permitidos (opcional)
  formato?: string;   // ex: 'DDMMAA' ou 'DDMMAAAA' para datas
  cor: string;
  descricao?: string; // descrição adicional do campo
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
  imports: [CommonModule],
  template: `
    <div style="max-width:1600px;margin:0 auto;padding:20px;font-family:system-ui,-apple-system,sans-serif;">
      <h2 style="color:#1976d2;margin-bottom:20px;display:flex;align-items:center;gap:10px;">
        🏦 Validador Retorno Bradesco CNAB 400
        <span style="font-size:14px;font-weight:normal;color:#666;background:#f5f5f5;padding:4px 12px;border-radius:12px;">
          Especificação Oficial
        </span>
      </h2>

      <div style="margin-bottom:20px;">
        <label style="display:block;margin-bottom:8px;font-weight:500;color:#333;">
          📁 Selecione o arquivo de retorno (.RET ou .TXT)
        </label>
        <input type="file" accept=".ret,.txt,.RET,.TXT" (change)="onFileChange($event)"
               style="padding:12px;border:2px solid #1976d2;border-radius:8px;cursor:pointer;width:100%;max-width:400px;
                      background:#fff;transition:all 0.3s;" />
      </div>

      <div *ngIf="error" style="color:#b71c1c;background:#ffebee;padding:14px;border-radius:8px;border-left:4px solid #d32f2f;margin-bottom:20px;
                                 box-shadow:0 2px 4px rgba(0,0,0,0.1);">
        <strong>❌ Erro:</strong> {{ error }}
      </div>

      <!-- Estatísticas do Arquivo -->
      <div *ngIf="estatisticas && validado" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;margin-bottom:20px;">
        <div style="background:linear-gradient(135deg,#e3f2fd 0%,#bbdefb 100%);padding:16px;border-radius:8px;border:1px solid #90caf9;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
          <div style="font-size:28px;font-weight:bold;color:#1565c0;">{{ estatisticas.totalLinhas }}</div>
          <div style="font-size:13px;color:#424242;margin-top:4px;">Total de Linhas</div>
        </div>
        <div style="background:linear-gradient(135deg,#f3e5f5 0%,#e1bee7 100%);padding:16px;border-radius:8px;border:1px solid #ce93d8;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
          <div style="font-size:28px;font-weight:bold;color:#6a1b9a;">{{ estatisticas.headers }}</div>
          <div style="font-size:13px;color:#424242;margin-top:4px;">Headers (Tipo 0)</div>
        </div>
        <div style="background:linear-gradient(135deg,#e8f5e9 0%,#c8e6c9 100%);padding:16px;border-radius:8px;border:1px solid #a5d6a7;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
          <div style="font-size:28px;font-weight:bold;color:#2e7d32;">{{ estatisticas.detalhes }}</div>
          <div style="font-size:13px;color:#424242;margin-top:4px;">Detalhes (Tipo 1)</div>
        </div>
        <div style="background:linear-gradient(135deg,#fff3e0 0%,#ffe0b2 100%);padding:16px;border-radius:8px;border:1px solid #ffcc80;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
          <div style="font-size:28px;font-weight:bold;color:#e65100;">{{ estatisticas.rateios }}</div>
          <div style="font-size:13px;color:#424242;margin-top:4px;">Rateios (Tipo 3)</div>
        </div>
        <div style="background:linear-gradient(135deg,#fce4ec 0%,#f8bbd0 100%);padding:16px;border-radius:8px;border:1px solid #f48fb1;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
          <div style="font-size:28px;font-weight:bold;color:#ad1457;">{{ estatisticas.trailers }}</div>
          <div style="font-size:13px;color:#424242;margin-top:4px;">Trailers (Tipo 9)</div>
        </div>
      </div>

      <!-- Resumo de Erros e Avisos -->
      <div *ngIf="erros.length > 0" style="margin-bottom:20px;">
        <div *ngIf="getErrosPorSeveridade('erro').length > 0"
             style="margin-bottom:12px;padding:16px;background:#ffebee;border-radius:8px;border-left:4px solid #d32f2f;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
          <strong style="color:#c62828;font-size:16px;display:flex;align-items:center;gap:8px;margin-bottom:12px;">
            🚫 {{ getErrosPorSeveridade('erro').length }} erro(s) crítico(s) encontrado(s)
          </strong>
          <div style="max-height:300px;overflow-y:auto;background:#fff;padding:12px;border-radius:6px;">
            <div *ngFor="let e of getErrosPorSeveridade('erro')" style="margin-bottom:10px;padding:10px;background:#ffebee;border-radius:6px;border-left:3px solid #d32f2f;">
              <div style="font-size:13px;line-height:1.6;">
                <strong style="color:#d32f2f;">Linha {{ e.linha }}</strong>
                <span style="color:#1976d2;margin:0 4px;">→</span>
                <span style="color:#424242;font-weight:500;">{{ e.campo }}</span>
                <span style="color:#757575;font-size:12px;margin-left:4px;">[{{ e.posicao }}]</span>
              </div>
              <div style="margin-top:6px;font-size:13px;">
                <span style="color:#757575;">Valor:</span>
                <code style="background:#f5f5f5;padding:3px 8px;border-radius:4px;margin:0 6px;font-size:12px;color:#d32f2f;">{{ e.valor || '(vazio)' }}</code>
              </div>
              <div style="margin-top:6px;font-size:13px;color:#c62828;">
                ⚠️ {{ e.mensagem }}
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="getErrosPorSeveridade('aviso').length > 0"
             style="padding:16px;background:#fff3e0;border-radius:8px;border-left:4px solid #f57c00;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
          <strong style="color:#e65100;font-size:16px;display:flex;align-items:center;gap:8px;margin-bottom:12px;">
            ⚠️ {{ getErrosPorSeveridade('aviso').length }} aviso(s)
          </strong>
          <div style="max-height:200px;overflow-y:auto;background:#fff;padding:12px;border-radius:6px;">
            <div *ngFor="let e of getErrosPorSeveridade('aviso')" style="margin-bottom:8px;padding:8px;background:#fff3e0;border-radius:6px;border-left:3px solid #f57c00;font-size:13px;">
              <strong style="color:#e65100;">Linha {{ e.linha }}</strong> - {{ e.campo }}: {{ e.mensagem }}
            </div>
          </div>
        </div>
      </div>

      <!-- Sucesso -->
      <div *ngIf="validado && getErrosPorSeveridade('erro').length === 0"
           style="margin-bottom:20px;padding:16px;background:#e8f5e9;border-radius:8px;border-left:4px solid #43a047;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
        <strong style="color:#2e7d32;font-size:16px;display:flex;align-items:center;gap:8px;">
          ✅ Arquivo validado com sucesso!
          <span *ngIf="getErrosPorSeveridade('aviso').length > 0" style="font-size:14px;font-weight:normal;color:#f57c00;">
            ({{ getErrosPorSeveridade('aviso').length }} aviso(s))
          </span>
        </strong>
      </div>

      <!-- Legenda clicável -->
      <div *ngIf="legendaCampos.length > 0" style="margin-bottom:20px;padding:16px;background:#fafafa;border-radius:8px;border:1px solid #e0e0e0;box-shadow:0 2px 4px rgba(0,0,0,0.05);">
        <strong style="display:block;margin-bottom:14px;color:#333;font-size:15px;">
          📌 Clique em um campo para destacar na visualização:
        </strong>
        <div style="display:flex;flex-wrap:wrap;gap:10px;">
          <span *ngFor="let campo of legendaCampos"
                (click)="selecionarCampo(campo.nome)"
                [style.background]="campo.cor"
                [style.boxShadow]="campoSelecionado === campo.nome ? '0 0 0 3px #1976d2, 0 4px 8px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)'"
                [style.transform]="campoSelecionado === campo.nome ? 'scale(1.05)' : 'scale(1)'"
                [style.fontWeight]="campoSelecionado === campo.nome ? 'bold' : 'normal'"
                style="display:inline-block;padding:8px 12px;border-radius:6px;font-size:12px;cursor:pointer;
                       transition:all 0.2s;border:1px solid rgba(0,0,0,0.15);user-select:none;"
                [title]="campo.descricao || 'Clique para destacar'">
            {{ campo.nome }}
            <span style="opacity:0.7;font-size:11px;margin-left:4px;">[{{ campo.ini + 1 }}-{{ campo.fim }}]</span>
          </span>
        </div>
        <div *ngIf="campoSelecionado" style="margin-top:12px;padding:10px;background:#e3f2fd;border-radius:6px;font-size:13px;color:#1565c0;">
          <strong>Campo selecionado:</strong> {{ campoSelecionado }}
          <button (click)="selecionarCampo(campoSelecionado!)"
                  style="margin-left:12px;padding:4px 10px;background:#fff;border:1px solid #1976d2;border-radius:4px;cursor:pointer;font-size:12px;">
            Limpar seleção
          </button>
        </div>
      </div>

      <!-- Visualização do arquivo -->
      <div *ngIf="visualHtml"
           [innerHTML]="visualHtml"
           style="overflow-x:auto;background:#fff;padding:14px;border-radius:8px;border:1px solid #e0e0e0;box-shadow:0 2px 6px rgba(0,0,0,0.05);"></div>

      <div *ngIf="!visualHtml && !error"
           style="margin-top:30px;padding:50px;text-align:center;color:#888;background:#fafafa;border-radius:8px;border:2px dashed #ddd;">
        <div style="font-size:48px;margin-bottom:16px;">📄</div>
        <div style="font-size:16px;color:#666;margin-bottom:8px;">Nenhum arquivo carregado</div>
        <div style="font-size:14px;color:#999;">Selecione um arquivo .RET (Retorno CNAB 400) para iniciar a validação</div>
      </div>
    </div>
  `
})
export class BradescoRetorno400ValidadorComponent {
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
    if (this.campoSelecionado === nomeCampo) {
      this.campoSelecionado = null;
    } else {
      this.campoSelecionado = nomeCampo;
    }
    if (this.conteudoArquivo) {
      const html = this.renderizarArquivo(this.conteudoArquivo);
      this.visualHtml = this.sanitizer.bypassSecurityTrustHtml(html);
    }
  }

  // ========================================
  // LAYOUT HEADER RETORNO (TIPO 0)
  // ========================================
  camposHeader: CampoLayout[] = [
    { nome: 'Tipo Registro', ini: 0, fim: 1, tipo: 'N', obrigatorio: true, valores: ['0'], cor: '#f8bbd0', descricao: 'Identificação do Registro Header' },
    { nome: 'Ident. Arquivo', ini: 1, fim: 2, tipo: 'N', obrigatorio: true, valores: ['2'], cor: '#ffe082', descricao: 'Identificação do Arquivo-Retorno (2=Retorno)' },
    { nome: 'Literal Retorno', ini: 2, fim: 9, tipo: 'A', obrigatorio: true, valores: ['RETORNO'], cor: '#b2dfdb', descricao: 'Literal RETORNO' },
    { nome: 'Cód. Serviço', ini: 9, fim: 11, tipo: 'N', obrigatorio: true, valores: ['01'], cor: '#c5cae9', descricao: 'Código de Serviço (01=Cobrança)' },
    { nome: 'Literal Serviço', ini: 11, fim: 26, tipo: 'A', obrigatorio: true, valores: ['COBRANCA'], cor: '#e1bee7', descricao: 'Literal COBRANCA (15 posições)' },
    { nome: 'Cód. Empresa', ini: 26, fim: 46, tipo: 'N', obrigatorio: true, cor: '#b3e5fc', descricao: 'Código da Empresa fornecido pelo Bradesco (20 posições)' },
    { nome: 'Nome Empresa', ini: 46, fim: 76, tipo: 'A', obrigatorio: true, cor: '#ffecb3', descricao: 'Razão Social da Empresa (30 posições)' },
    { nome: 'Cód. Banco', ini: 76, fim: 79, tipo: 'N', obrigatorio: true, valores: ['237'], cor: '#ffccbc', descricao: 'Número do Bradesco na Compensação (237)' },
    { nome: 'Nome Banco', ini: 79, fim: 94, tipo: 'A', obrigatorio: true, valores: ['BRADESCO'], cor: '#dcedc8', descricao: 'Nome do Banco por Extenso (15 posições)' },
    { nome: 'Data Gravação', ini: 94, fim: 100, tipo: 'N', obrigatorio: true, formato: 'DDMMAA', cor: '#fff9c4', descricao: 'Data da Gravação do Arquivo (DDMMAA)' },
    { nome: 'Densidade', ini: 100, fim: 108, tipo: 'N', obrigatorio: false, cor: '#f5f5f5', descricao: 'Densidade de Gravação (01600000)' },
    { nome: 'Nº Aviso Banc.', ini: 108, fim: 113, tipo: 'N', obrigatorio: false, cor: '#b2ebf2', descricao: 'Número Aviso Bancário' },
    { nome: 'Brancos', ini: 113, fim: 379, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Espaços em branco (266 posições)' },
    { nome: 'Data Crédito', ini: 379, fim: 385, tipo: 'N', obrigatorio: false, formato: 'DDMMAA', cor: '#c5e1a5', descricao: 'Data de Crédito (DDMMAA)' },
    { nome: 'Brancos', ini: 385, fim: 394, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Espaços em branco (9 posições)' },
    { nome: 'Seq. Registro', ini: 394, fim: 400, tipo: 'N', obrigatorio: true, valores: ['000001'], cor: '#b2ebf2', descricao: 'Número Sequencial do Registro (deve ser 000001)' },
  ];

  // ========================================
  // LAYOUT DETALHE RETORNO (TIPO 1)
  // ========================================
  camposDetalhe: CampoLayout[] = [
    { nome: 'Tipo Registro', ini: 0, fim: 1, tipo: 'N', obrigatorio: true, valores: ['1'], cor: '#f8bbd0', descricao: 'Identificação do Registro Detalhe' },
    { nome: 'Tipo Inscrição', ini: 1, fim: 3, tipo: 'N', obrigatorio: true, valores: ['01', '02'], cor: '#ffe082', descricao: '01=CPF, 02=CNPJ' },
    { nome: 'CPF/CNPJ Empresa', ini: 3, fim: 17, tipo: 'N', obrigatorio: true, cor: '#ffcc80', descricao: 'CPF/CNPJ da Empresa (14 posições)' },
    { nome: 'Zeros', ini: 17, fim: 20, tipo: 'N', obrigatorio: false, cor: '#f5f5f5', descricao: 'Zeros (3 posições)' },
    { nome: 'Ident. Empresa', ini: 20, fim: 37, tipo: 'A', obrigatorio: true, cor: '#e1bee7', descricao: 'Identificação da Empresa no Banco (Zero+Carteira+Agência+C/C - 17 posições)' },
    { nome: 'Nº Controle', ini: 37, fim: 62, tipo: 'A', obrigatorio: false, cor: '#d1c4e9', descricao: 'Número de Controle do Participante (25 posições)' },
    { nome: 'Zeros', ini: 62, fim: 70, tipo: 'N', obrigatorio: false, cor: '#f5f5f5', descricao: 'Zeros (8 posições)' },
    { nome: 'Nosso Número', ini: 70, fim: 82, tipo: 'N', obrigatorio: true, cor: '#ffccbc', descricao: 'Identificação do Título no Banco (12 posições)' },
    { nome: 'Uso Banco', ini: 82, fim: 92, tipo: 'N', obrigatorio: false, cor: '#f5f5f5', descricao: 'Uso do Banco - Zeros (10 posições)' },
    { nome: 'Uso Banco 2', ini: 92, fim: 104, tipo: 'N', obrigatorio: false, cor: '#f5f5f5', descricao: 'Uso do Banco - Zeros (12 posições)' },
    { nome: 'Rateio Crédito', ini: 104, fim: 105, tipo: 'A', obrigatorio: false, valores: ['R', ' '], cor: '#c8e6c9', descricao: 'Indicador de Rateio Crédito (R ou branco)' },
    { nome: 'Pgto Parcial', ini: 105, fim: 107, tipo: 'N', obrigatorio: false, cor: '#a5d6a7', descricao: 'Pagamento Parcial (00=Não informado)' },
    { nome: 'Carteira', ini: 107, fim: 108, tipo: 'N', obrigatorio: true, cor: '#b3e5fc', descricao: 'Carteira' },
    { nome: 'Cód. Ocorrência', ini: 108, fim: 110, tipo: 'N', obrigatorio: true, cor: '#4db6ac', descricao: 'Código da Ocorrência (02, 06, 09, 10, etc.)' },
    { nome: 'Data Ocorrência', ini: 110, fim: 116, tipo: 'N', obrigatorio: true, formato: 'DDMMAA', cor: '#fff9c4', descricao: 'Data da Ocorrência no Banco (DDMMAA)' },
    { nome: 'Nº Documento', ini: 116, fim: 126, tipo: 'A', obrigatorio: true, cor: '#dcedc8', descricao: 'Número do Documento (10 posições)' },
    { nome: 'Nosso Nº Conf.', ini: 126, fim: 146, tipo: 'N', obrigatorio: false, cor: '#ffccbc', descricao: 'Confirmação Nosso Número (20 posições)' },
    { nome: 'Vencimento', ini: 146, fim: 152, tipo: 'N', obrigatorio: true, formato: 'DDMMAA', cor: '#fff59d', descricao: 'Data de Vencimento (DDMMAA)' },
    { nome: 'Valor Título', ini: 152, fim: 165, tipo: 'N', obrigatorio: true, cor: '#ffcdd2', descricao: 'Valor do Título (13 posições - centavos)' },
    { nome: 'Banco Cobrador', ini: 165, fim: 168, tipo: 'N', obrigatorio: false, cor: '#b3e5fc', descricao: 'Código do Banco Cobrador (3 posições)' },
    { nome: 'Agência Cobradora', ini: 168, fim: 173, tipo: 'N', obrigatorio: false, cor: '#81d4fa', descricao: 'Agência Cobradora (5 posições)' },
    { nome: 'Espécie', ini: 173, fim: 175, tipo: 'N', obrigatorio: true, cor: '#29b6f6', descricao: 'Espécie do Título (02=DM, 04=DS, etc.)' },
    { nome: 'Desp. Cobrança', ini: 175, fim: 188, tipo: 'N', obrigatorio: false, cor: '#b2dfdb', descricao: 'Despesas de Cobrança (13 posições - centavos)' },
    { nome: 'Outras Despesas', ini: 188, fim: 201, tipo: 'N', obrigatorio: false, cor: '#80cbc4', descricao: 'Outras Despesas/Custas Protesto (13 posições)' },
    { nome: 'Juros Atraso', ini: 201, fim: 214, tipo: 'N', obrigatorio: false, cor: '#4db6ac', descricao: 'Juros Operação em Atraso - Zeros (13 posições)' },
    { nome: 'Valor IOF', ini: 214, fim: 227, tipo: 'N', obrigatorio: false, cor: '#26a69a', descricao: 'Valor IOF (13 posições - centavos)' },
    { nome: 'Valor Abatimento', ini: 227, fim: 240, tipo: 'N', obrigatorio: false, cor: '#009688', descricao: 'Valor do Abatimento (13 posições - centavos)' },
    { nome: 'Valor Desconto', ini: 240, fim: 253, tipo: 'N', obrigatorio: false, cor: '#00897b', descricao: 'Valor do Desconto (13 posições - centavos)' },
    { nome: 'Valor Pago', ini: 253, fim: 266, tipo: 'N', obrigatorio: true, cor: '#00695c', descricao: 'Valor Pago (13 posições - centavos)' },
    { nome: 'Juros Mora', ini: 266, fim: 279, tipo: 'N', obrigatorio: false, cor: '#e0f7fa', descricao: 'Juros de Mora (13 posições - centavos)' },
    { nome: 'Outros Créditos', ini: 279, fim: 292, tipo: 'N', obrigatorio: false, cor: '#b2ebf2', descricao: 'Outros Créditos - Zeros (13 posições)' },
    { nome: 'Brancos', ini: 292, fim: 294, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos (2 posições)' },
    { nome: 'Motivo Cód. Oc.', ini: 294, fim: 295, tipo: 'A', obrigatorio: false, valores: ['A', 'D', ' '], cor: '#80deea', descricao: 'Motivo Código Ocorrência 19/25 (A=Aceito, D=Desprezado)' },
    { nome: 'Data Crédito', ini: 295, fim: 301, tipo: 'N', obrigatorio: false, formato: 'DDMMAA', cor: '#c5e1a5', descricao: 'Data do Crédito (DDMMAA)' },
    { nome: 'Origem Pgto', ini: 301, fim: 304, tipo: 'N', obrigatorio: false, cor: '#4dd0e1', descricao: 'Origem do Pagamento (3 posições)' },
    { nome: 'Brancos', ini: 304, fim: 314, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos (10 posições)' },
    { nome: 'Banco Cheque', ini: 314, fim: 318, tipo: 'N', obrigatorio: false, valores: ['0237', '0000'], cor: '#26c6da', descricao: 'Quando Cheque Bradesco informe 0237 (4 posições)' },
    { nome: 'Motivos Rejeição', ini: 318, fim: 328, tipo: 'A', obrigatorio: false, cor: '#ef9a9a', descricao: 'Motivos das Rejeições (10 posições)' },
    { nome: 'Brancos', ini: 328, fim: 368, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos (40 posições)' },
    { nome: 'Nº Cartório', ini: 368, fim: 370, tipo: 'N', obrigatorio: false, cor: '#bcaaa4', descricao: 'Número do Cartório (2 posições)' },
    { nome: 'Nº Protocolo', ini: 370, fim: 380, tipo: 'N', obrigatorio: false, cor: '#a1887f', descricao: 'Número do Protocolo (10 posições)' },
    { nome: 'Brancos', ini: 380, fim: 394, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos (14 posições)' },
    { nome: 'Seq. Registro', ini: 394, fim: 400, tipo: 'N', obrigatorio: true, cor: '#b2ebf2', descricao: 'Número Sequencial do Registro' },
  ];

  // ========================================
  // LAYOUT RATEIO DE CRÉDITO (TIPO 3)
  // ========================================
  camposRateio: CampoLayout[] = [
    { nome: 'Tipo Registro', ini: 0, fim: 1, tipo: 'N', obrigatorio: true, valores: ['3'], cor: '#f8bbd0', descricao: 'Identificação do Registro Rateio' },
    { nome: 'Ident. Empresa', ini: 1, fim: 17, tipo: 'A', obrigatorio: true, cor: '#e1bee7', descricao: 'Identificação da Empresa no Banco (Carteira+Agência+C/C - 16 posições)' },
    { nome: 'Nosso Número', ini: 17, fim: 29, tipo: 'N', obrigatorio: true, cor: '#ffccbc', descricao: 'Identificação Título no Banco (12 posições)' },
    { nome: 'Cód. Cálc. Rateio', ini: 29, fim: 30, tipo: 'N', obrigatorio: true, valores: ['1', '2', '3'], cor: '#ffe082', descricao: '1=Valor Cobrado, 2=Valor Registro, 3=Menor Valor' },
    { nome: 'Tipo Valor Info', ini: 30, fim: 31, tipo: 'N', obrigatorio: true, valores: ['1', '2'], cor: '#fff9c4', descricao: '1=Percentual, 2=Valor' },
    { nome: 'Brancos', ini: 31, fim: 43, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Filler - Brancos (12 posições)' },

    // 1º Beneficiário
    { nome: 'Banco 1º Benef.', ini: 43, fim: 46, tipo: 'N', obrigatorio: true, valores: ['237'], cor: '#b3e5fc', descricao: 'Código Banco 1º Beneficiário (237)' },
    { nome: 'Agência 1º Benef.', ini: 46, fim: 51, tipo: 'N', obrigatorio: true, cor: '#81d4fa', descricao: 'Agência 1º Beneficiário (5 posições)' },
    { nome: 'Dig. Ag. 1º Benef.', ini: 51, fim: 52, tipo: 'A', obrigatorio: true, cor: '#4fc3f7', descricao: 'Dígito Agência 1º Beneficiário' },
    { nome: 'Conta 1º Benef.', ini: 52, fim: 64, tipo: 'N', obrigatorio: true, cor: '#29b6f6', descricao: 'Conta-Corrente 1º Beneficiário (12 posições)' },
    { nome: 'Dig. Conta 1º Benef.', ini: 64, fim: 65, tipo: 'A', obrigatorio: true, cor: '#039be5', descricao: 'Dígito Conta 1º Beneficiário' },
    { nome: 'Valor Rateio 1º', ini: 65, fim: 80, tipo: 'N', obrigatorio: true, cor: '#ffcdd2', descricao: 'Valor Efetivo Rateio 1º Benef. (15 posições)' },
    { nome: 'Nome 1º Benef.', ini: 80, fim: 120, tipo: 'A', obrigatorio: true, cor: '#ffecb3', descricao: 'Nome do 1º Beneficiário (40 posições)' },
    { nome: 'Brancos', ini: 120, fim: 141, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Filler - Brancos (21 posições)' },
    { nome: 'Parcela 1º', ini: 141, fim: 147, tipo: 'N', obrigatorio: false, cor: '#c8e6c9', descricao: 'Identificação da Parcela 1º Benef. (6 posições)' },
    { nome: 'Floating 1º', ini: 147, fim: 150, tipo: 'N', obrigatorio: false, cor: '#a5d6a7', descricao: 'Floating 1º Beneficiário (3 posições - dias)' },
    { nome: 'Data Créd. 1º', ini: 150, fim: 158, tipo: 'N', obrigatorio: false, formato: 'DDMMAAAA', cor: '#fff59d', descricao: 'Data Crédito 1º Benef. (DDMMAAAA)' },
    { nome: 'Status 1º', ini: 158, fim: 160, tipo: 'N', obrigatorio: false, cor: '#ef9a9a', descricao: 'Status/Motivo Ocorrência Rateio 1º (2 posições)' },

    // 2º Beneficiário
    { nome: 'Banco 2º Benef.', ini: 160, fim: 163, tipo: 'N', obrigatorio: false, valores: ['237', '000'], cor: '#b3e5fc', descricao: 'Código Banco 2º Beneficiário (237)' },
    { nome: 'Agência 2º Benef.', ini: 163, fim: 168, tipo: 'N', obrigatorio: false, cor: '#81d4fa', descricao: 'Agência 2º Beneficiário (5 posições)' },
    { nome: 'Dig. Ag. 2º Benef.', ini: 168, fim: 169, tipo: 'A', obrigatorio: false, cor: '#4fc3f7', descricao: 'Dígito Agência 2º Beneficiário' },
    { nome: 'Conta 2º Benef.', ini: 169, fim: 181, tipo: 'N', obrigatorio: false, cor: '#29b6f6', descricao: 'Conta-Corrente 2º Beneficiário (12 posições)' },
    { nome: 'Dig. Conta 2º Benef.', ini: 181, fim: 182, tipo: 'A', obrigatorio: false, cor: '#039be5', descricao: 'Dígito Conta 2º Beneficiário' },
    { nome: 'Valor Rateio 2º', ini: 182, fim: 197, tipo: 'N', obrigatorio: false, cor: '#ffcdd2', descricao: 'Valor Efetivo Rateio 2º Benef. (15 posições)' },
    { nome: 'Nome 2º Benef.', ini: 197, fim: 237, tipo: 'A', obrigatorio: false, cor: '#ffecb3', descricao: 'Nome do 2º Beneficiário (40 posições)' },
    { nome: 'Brancos', ini: 237, fim: 258, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Filler - Brancos (21 posições)' },
    { nome: 'Parcela 2º', ini: 258, fim: 264, tipo: 'N', obrigatorio: false, cor: '#c8e6c9', descricao: 'Identificação da Parcela 2º Benef. (6 posições)' },
    { nome: 'Floating 2º', ini: 264, fim: 267, tipo: 'N', obrigatorio: false, cor: '#a5d6a7', descricao: 'Floating 2º Beneficiário (3 posições - dias)' },
    { nome: 'Data Créd. 2º', ini: 267, fim: 275, tipo: 'N', obrigatorio: false, formato: 'DDMMAAAA', cor: '#fff59d', descricao: 'Data Crédito 2º Benef. (DDMMAAAA)' },
    { nome: 'Status 2º', ini: 275, fim: 277, tipo: 'N', obrigatorio: false, cor: '#ef9a9a', descricao: 'Status/Motivo Ocorrência Rateio 2º (2 posições)' },

    // 3º Beneficiário
    { nome: 'Banco 3º Benef.', ini: 277, fim: 280, tipo: 'N', obrigatorio: false, valores: ['237', '000'], cor: '#b3e5fc', descricao: 'Código Banco 3º Beneficiário (237)' },
    { nome: 'Agência 3º Benef.', ini: 280, fim: 285, tipo: 'N', obrigatorio: false, cor: '#81d4fa', descricao: 'Agência 3º Beneficiário (5 posições)' },
    { nome: 'Dig. Ag. 3º Benef.', ini: 285, fim: 286, tipo: 'A', obrigatorio: false, cor: '#4fc3f7', descricao: 'Dígito Agência 3º Beneficiário' },
    { nome: 'Conta 3º Benef.', ini: 286, fim: 298, tipo: 'N', obrigatorio: false, cor: '#29b6f6', descricao: 'Conta-Corrente 3º Beneficiário (12 posições)' },
    { nome: 'Dig. Conta 3º Benef.', ini: 298, fim: 299, tipo: 'A', obrigatorio: false, cor: '#039be5', descricao: 'Dígito Conta 3º Beneficiário' },
    { nome: 'Valor Rateio 3º', ini: 299, fim: 314, tipo: 'N', obrigatorio: false, cor: '#ffcdd2', descricao: 'Valor Efetivo Rateio 3º Benef. (15 posições)' },
    { nome: 'Nome 3º Benef.', ini: 314, fim: 354, tipo: 'A', obrigatorio: false, cor: '#ffecb3', descricao: 'Nome do 3º Beneficiário (40 posições)' },
    { nome: 'Brancos', ini: 354, fim: 375, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Filler - Brancos (21 posições)' },
    { nome: 'Parcela 3º', ini: 375, fim: 381, tipo: 'N', obrigatorio: false, cor: '#c8e6c9', descricao: 'Identificação da Parcela 3º Benef. (6 posições)' },
    { nome: 'Floating 3º', ini: 381, fim: 384, tipo: 'N', obrigatorio: false, cor: '#a5d6a7', descricao: 'Floating 3º Beneficiário (3 posições - dias)' },
    { nome: 'Data Créd. 3º', ini: 384, fim: 392, tipo: 'N', obrigatorio: false, formato: 'DDMMAAAA', cor: '#fff59d', descricao: 'Data Crédito 3º Benef. (DDMMAAAA)' },
    { nome: 'Status 3º', ini: 392, fim: 394, tipo: 'N', obrigatorio: false, cor: '#ef9a9a', descricao: 'Status/Motivo Ocorrência Rateio 3º (2 posições)' },

    { nome: 'Seq. Registro', ini: 394, fim: 400, tipo: 'N', obrigatorio: true, cor: '#b2ebf2', descricao: 'Número Sequencial do Registro' },
  ];

  // ========================================
  // LAYOUT TRAILER RETORNO (TIPO 9)
  // ========================================
  camposTrailer: CampoLayout[] = [
    { nome: 'Tipo Registro', ini: 0, fim: 1, tipo: 'N', obrigatorio: true, valores: ['9'], cor: '#f8bbd0', descricao: 'Identificação do Registro Trailer' },
    { nome: 'Retorno', ini: 1, fim: 2, tipo: 'N', obrigatorio: true, valores: ['2'], cor: '#ffe082', descricao: 'Identificação Retorno (2)' },
    { nome: 'Tipo Serviço', ini: 2, fim: 4, tipo: 'N', obrigatorio: true, valores: ['01'], cor: '#b2dfdb', descricao: 'Tipo de Serviço (01=Cobrança)' },
    { nome: 'Cód. Banco', ini: 4, fim: 7, tipo: 'N', obrigatorio: true, valores: ['237'], cor: '#c5cae9', descricao: 'Código do Banco (237)' },
    { nome: 'Brancos', ini: 7, fim: 17, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos (10 posições)' },
    { nome: 'Qtd. Títulos Cobr.', ini: 17, fim: 25, tipo: 'N', obrigatorio: false, cor: '#e1bee7', descricao: 'Quantidade de Títulos em Cobrança (8 posições)' },
    { nome: 'Valor Total Cobr.', ini: 25, fim: 39, tipo: 'N', obrigatorio: false, cor: '#ffcdd2', descricao: 'Valor Total em Cobrança (14 posições)' },
    { nome: 'Aviso Bancário', ini: 39, fim: 47, tipo: 'N', obrigatorio: false, cor: '#b3e5fc', descricao: 'Número do Aviso Bancário (8 posições)' },
    { nome: 'Brancos', ini: 47, fim: 57, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos (10 posições)' },
    { nome: 'Qtd. Reg. Oc. 02', ini: 57, fim: 62, tipo: 'N', obrigatorio: false, cor: '#fff9c4', descricao: 'Qtd Registros Ocorrência 02 - Entradas (5 posições)' },
    { nome: 'Valor Reg. Oc. 02', ini: 62, fim: 74, tipo: 'N', obrigatorio: false, cor: '#fff59d', descricao: 'Valor Registros Ocorrência 02 (12 posições)' },
    { nome: 'Valor Reg. Oc. 06', ini: 74, fim: 86, tipo: 'N', obrigatorio: false, cor: '#dcedc8', descricao: 'Valor Registros Ocorrência 06 - Liquidação (12 posições)' },
    { nome: 'Qtd. Reg. Oc. 06', ini: 86, fim: 91, tipo: 'N', obrigatorio: false, cor: '#c5e1a5', descricao: 'Qtd Registros Ocorrência 06 - Liquidação (5 posições)' },
    { nome: 'Valor Reg. Oc. 06b', ini: 91, fim: 103, tipo: 'N', obrigatorio: false, cor: '#aed581', descricao: 'Valor Registros Ocorrência 06 (duplicado - 12 posições)' },
    { nome: 'Qtd. Reg. Oc. 09/10', ini: 103, fim: 108, tipo: 'N', obrigatorio: false, cor: '#81c784', descricao: 'Qtd Registros Ocorrência 09/10 - Baixados (5 posições)' },
    { nome: 'Valor Reg. Oc. 09/10', ini: 108, fim: 120, tipo: 'N', obrigatorio: false, cor: '#66bb6a', descricao: 'Valor Registros Ocorrência 09/10 - Baixados (12 posições)' },
    { nome: 'Qtd. Reg. Oc. 13', ini: 120, fim: 125, tipo: 'N', obrigatorio: false, cor: '#ffb74d', descricao: 'Qtd Registros Ocorrência 13 - Abat. Cancelado (5 posições)' },
    { nome: 'Valor Reg. Oc. 13', ini: 125, fim: 137, tipo: 'N', obrigatorio: false, cor: '#ff9800', descricao: 'Valor Registros Ocorrência 13 - Abat. Cancelado (12 posições)' },
    { nome: 'Qtd. Reg. Oc. 14', ini: 137, fim: 142, tipo: 'N', obrigatorio: false, cor: '#90caf9', descricao: 'Qtd Registros Ocorrência 14 - Venc. Alterado (5 posições)' },
    { nome: 'Valor Reg. Oc. 14', ini: 142, fim: 154, tipo: 'N', obrigatorio: false, cor: '#64b5f6', descricao: 'Valor Registros Ocorrência 14 - Venc. Alterado (12 posições)' },
    { nome: 'Qtd. Reg. Oc. 12', ini: 154, fim: 159, tipo: 'N', obrigatorio: false, cor: '#ce93d8', descricao: 'Qtd Registros Ocorrência 12 - Abat. Concedido (5 posições)' },
    { nome: 'Valor Reg. Oc. 12', ini: 159, fim: 171, tipo: 'N', obrigatorio: false, cor: '#ba68c8', descricao: 'Valor Registros Ocorrência 12 - Abat. Concedido (12 posições)' },
    { nome: 'Qtd. Reg. Oc. 19', ini: 171, fim: 176, tipo: 'N', obrigatorio: false, cor: '#ef9a9a', descricao: 'Qtd Registros Ocorrência 19 - Conf. Protesto (5 posições)' },
    { nome: 'Valor Reg. Oc. 19', ini: 176, fim: 188, tipo: 'N', obrigatorio: false, cor: '#e57373', descricao: 'Valor Registros Ocorrência 19 - Conf. Protesto (12 posições)' },
    { nome: 'Brancos', ini: 188, fim: 362, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos (174 posições)' },
    { nome: 'Valor Total Rateios', ini: 362, fim: 377, tipo: 'N', obrigatorio: false, cor: '#ffcc80', descricao: 'Valor Total dos Rateios Efetuados (15 posições)' },
    { nome: 'Qtd. Total Rateios', ini: 377, fim: 385, tipo: 'N', obrigatorio: false, cor: '#ffb74d', descricao: 'Quantidade Total dos Rateios Efetuados (8 posições)' },
    { nome: 'Brancos', ini: 385, fim: 394, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos (9 posições)' },
    { nome: 'Seq. Registro', ini: 394, fim: 400, tipo: 'N', obrigatorio: true, cor: '#b2ebf2', descricao: 'Número Sequencial do Registro' },
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
        this.error = 'Erro ao processar o arquivo. Verifique se é um arquivo de Retorno CNAB 400 válido.';
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
      rateios: 0,
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
        case '3':
          campos = this.camposRateio;
          this.estatisticas.rateios++;
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
            mensagem: `Tipo de registro desconhecido: "${tipo}". Tipos válidos: 0 (Header), 1 (Detalhe), 3 (Rateio), 9 (Trailer)`,
            severidade: 'erro'
          });
      }

      // Validar tamanho da linha
      if (line.length !== 400) {
        this.erros.push({
          linha: idx + 1,
          campo: 'Linha',
          posicao: '1-400',
          valor: `${line.length} caracteres`,
          mensagem: `Tamanho inválido. Esperado: 400, Encontrado: ${line.length}`,
          severidade: 'erro'
        });
      }

      // Validar campos individuais
      for (const campo of campos) {
        const valor = line.slice(campo.ini, campo.fim);
        this.validarCampo(idx + 1, campo, valor);
      }

      // Validar sequência de registros
      const seqCampo = campos.find(c => c.nome === 'Seq. Registro');
      if (seqCampo && line.length >= 400) {
        const valorSeq = line.slice(seqCampo.ini, seqCampo.fim).trim();
        const sequenciaAtual = parseInt(valorSeq, 10);

        if (!isNaN(sequenciaAtual)) {
          if (sequenciaAtual !== sequenciaEsperada) {
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
    }

    this.validarEstrutura();

    // Criar legenda de campos únicos
    const todosCampos = [
      ...this.camposHeader,
      ...this.camposDetalhe,
      ...this.camposRateio,
      ...this.camposTrailer
    ];
    this.legendaCampos = todosCampos.filter(
      (campo, index, self) => self.findIndex(c => c.nome === campo.nome) === index
    );

    const html = lines.map((line, idx) => this.lineToMatrix(line, idx)).join('');
    return html;
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

    if (this.estatisticas.detalhes === 0 && this.estatisticas.rateios === 0) {
      this.erros.push({
        linha: 0,
        campo: 'Estrutura',
        posicao: '-',
        valor: '-',
        mensagem: 'Aviso: Arquivo não contém registros de Detalhe (Tipo 1) nem Rateio (Tipo 3)',
        severidade: 'aviso'
      });
    }

    if (this.estatisticas.headers > 1) {
      this.erros.push({
        linha: 0,
        campo: 'Estrutura',
        posicao: '-',
        valor: '-',
        mensagem: `Aviso: Arquivo contém ${this.estatisticas.headers} registros Header. Normalmente deve conter apenas 1.`,
        severidade: 'aviso'
      });
    }

    if (this.estatisticas.trailers > 1) {
      this.erros.push({
        linha: 0,
        campo: 'Estrutura',
        posicao: '-',
        valor: '-',
        mensagem: `Aviso: Arquivo contém ${this.estatisticas.trailers} registros Trailer. Normalmente deve conter apenas 1.`,
        severidade: 'aviso'
      });
    }
  }

  renderizarArquivo(content: string): string {
    const lines = content.split(/\r?\n/).filter(l => l.length > 0);
    if (lines.length === 0) return '';

    const html = lines.map((line, idx) => this.lineToMatrix(line, idx)).join('');
    return html;
  }

  validarCampo(linha: number, campo: CampoLayout, valor: string): void {
    const valorTrim = valor.trim();

    // Campo obrigatório vazio
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

    // Campo não obrigatório vazio - sem validação adicional
    if (!campo.obrigatorio && valorTrim === '') {
      return;
    }

    // VALIDAÇÃO RIGOROSA: Campos numéricos NÃO devem conter espaços
    // No CNAB, campos numéricos devem ser preenchidos com zeros à esquerda
    if (campo.tipo === 'N' && valorTrim !== '') {
      // Verifica se há espaços no campo numérico
      if (valor.includes(' ') && valorTrim !== '') {
        this.erros.push({
          linha,
          campo: campo.nome,
          posicao: `${campo.ini + 1}-${campo.fim}`,
          valor: valor,
          mensagem: 'Campo numérico contém espaços. Deve ser preenchido com zeros à esquerda.',
          severidade: 'erro'
        });
      }

      // Verifica se contém apenas dígitos (sem espaços)
      if (!/^\d+$/.test(valor)) {
        this.erros.push({
          linha,
          campo: campo.nome,
          posicao: `${campo.ini + 1}-${campo.fim}`,
          valor: valor,
          mensagem: 'Deve conter apenas números (0-9). Não são permitidos espaços ou outros caracteres.',
          severidade: 'erro'
        });
      }
    }

    // Validação de valores específicos permitidos
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

    // Validação de formato de data DDMMAA (6 posições)
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

    // Validação de formato de data DDMMAAAA (8 posições)
    if (campo.formato === 'DDMMAAAA' && valorTrim !== '' && valorTrim !== '00000000') {
      if (valor.length === 8 && /^\d{8}$/.test(valor)) {
        const dia = parseInt(valor.slice(0, 2), 10);
        const mes = parseInt(valor.slice(2, 4), 10);
        const ano = parseInt(valor.slice(4, 8), 10);

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

        if (ano < 1900 || ano > 2100) {
          this.erros.push({
            linha,
            campo: campo.nome,
            posicao: `${campo.ini + 1}-${campo.fim}`,
            valor: valor,
            mensagem: `Ano inválido: ${ano} (deve estar entre 1900 e 2100)`,
            severidade: 'aviso'
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
      case '3':
        campos = this.camposRateio;
        tipoNome = 'Rateio';
        tipoColor = '#e65100';
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

    let html = `<div style="margin-bottom:14px;padding:10px;background:#fafafa;border-radius:6px;border:1px solid #e0e0e0;">`;
    html += `<div style="display:flex;align-items:center;margin-bottom:6px;gap:10px;">`;
    html += `<span style="min-width:80px;font-size:13px;color:#666;font-weight:500;">Linha ${lineIdx+1}</span>`;
    html += `<span style="padding:4px 12px;background:${tipoColor};color:#fff;border-radius:4px;font-size:12px;font-weight:bold;box-shadow:0 2px 4px rgba(0,0,0,0.2);">${tipoNome}</span>`;

    // Mostrar erros da linha
    const errosLinha = this.erros.filter(e => e.linha === lineIdx + 1 && e.severidade === 'erro');
    if (errosLinha.length > 0) {
      html += `<span style="padding:4px 10px;background:#d32f2f;color:#fff;border-radius:4px;font-size:11px;margin-left:auto;">⚠️ ${errosLinha.length} erro(s)</span>`;
    }

    html += `</div>`;
    html += `<div style="display:flex;flex-wrap:nowrap;gap:1px;overflow-x:auto;padding:4px;background:#fff;border-radius:4px;">`;

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
