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
  formato?: string;   // ex: 'DDMMAA' para datas
  cor: string;
  descricao?: string; // descrição adicional do campo
}

interface Erro {
  linha: number;
  campo: string;
  posicao: string;
  valor: string;
  mensagem: string;
}

interface EstatisticasArquivo {
  totalLinhas: number;
  headers: number;
  detalhes: number;
  rateios: number;
  tipo2: number;
  tipo6: number;
  tipo7: number;
  trailers: number;
  desconhecidos: number;
}

@Component({
  selector: 'app-bradesco-cnab400-validador',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="max-width:1400px;margin:0 auto;padding:20px;">
      <h2 style="color:#1976d2;margin-bottom:20px;">🏦 Validador Bradesco CNAB 400</h2>

      <div style="margin-bottom:20px;">
        <input type="file" accept=".rem,.txt" (change)="onFileChange($event)"
               style="padding:10px;border:2px solid #1976d2;border-radius:6px;cursor:pointer;" />
      </div>

      <div *ngIf="error" style="color:#b71c1c;background:#ffebee;padding:12px;border-radius:6px;border:1px solid #ef5350;margin-bottom:18px;">
        ❌ {{ error }}
      </div>

      <!-- Estatísticas do Arquivo -->
      <div *ngIf="estatisticas && validado" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:18px;">
        <div style="background:#e3f2fd;padding:12px;border-radius:6px;border:1px solid #90caf9;">
          <div style="font-size:24px;font-weight:bold;color:#1976d2;">{{ estatisticas.totalLinhas }}</div>
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
        <div style="background:#fff3e0;padding:12px;border-radius:6px;border:1px solid #ffcc80;">
          <div style="font-size:24px;font-weight:bold;color:#f57c00;">{{ estatisticas.rateios }}</div>
          <div style="font-size:12px;color:#555;">Rateios (Tipo 3)</div>
        </div>
        <div style="background:#fce4ec;padding:12px;border-radius:6px;border:1px solid #f48fb1;">
          <div style="font-size:24px;font-weight:bold;color:#c2185b;">{{ estatisticas.trailers }}</div>
          <div style="font-size:12px;color:#555;">Trailers (Tipo 9)</div>
        </div>
      </div>

      <!-- Resumo de Erros -->
      <div *ngIf="erros.length > 0" style="margin-bottom:18px;padding:14px;background:#ffebee;border-radius:6px;border:1px solid #ef9a9a;">
        <strong style="color:#c62828;font-size:16px;">⚠️ {{ erros.length }} erro(s) encontrado(s):</strong>
        <ul style="margin:10px 0 0 0;padding-left:20px;max-height:250px;overflow-y:auto;">
          <li *ngFor="let e of erros" style="margin-bottom:6px;font-size:13px;">
            <strong style="color:#d32f2f;">Linha {{ e.linha }}</strong> -
            <span style="color:#1976d2;">{{ e.campo }}</span>
            <span style="color:#666;">[{{ e.posicao }}]</span>:
            <code style="background:#f5f5f5;padding:2px 6px;border-radius:3px;">{{ e.valor }}</code>
            → <span style="color:#c62828;">{{ e.mensagem }}</span>
          </li>
        </ul>
      </div>

      <!-- Sucesso -->
      <div *ngIf="validado && erros.length === 0" style="margin-bottom:18px;padding:14px;background:#e8f5e9;border-radius:6px;border:1px solid #a5d6a7;">
        <strong style="color:#2e7d32;font-size:16px;">✅ Arquivo válido! Nenhum erro encontrado.</strong>
      </div>

      <!-- Legenda clicável -->
      <div *ngIf="legendaCampos.length > 0" style="margin-bottom:18px;padding:14px;background:#fafafa;border-radius:6px;border:1px solid #e0e0e0;">
        <strong style="display:block;margin-bottom:12px;color:#333;">📌 Clique em um campo para destacar:</strong>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          <span *ngFor="let campo of legendaCampos"
                (click)="selecionarCampo(campo.nome)"
                [style.background]="campo.cor"
                [style.boxShadow]="campoSelecionado === campo.nome ? '0 0 0 3px #1976d2' : 'none'"
                [style.transform]="campoSelecionado === campo.nome ? 'scale(1.05)' : 'scale(1)'"
                [style.fontWeight]="campoSelecionado === campo.nome ? 'bold' : 'normal'"
                style="display:inline-block;padding:6px 10px;border-radius:4px;font-size:11px;cursor:pointer;transition:all 0.2s;border:1px solid rgba(0,0,0,0.1);"
                [title]="campo.descricao || 'Clique para destacar'">
            {{ campo.nome }} <span style="opacity:0.7;">[{{ campo.ini + 1 }}-{{ campo.fim }}]</span>
          </span>
        </div>
      </div>

      <!-- Visualização do arquivo -->
      <div *ngIf="visualHtml" [innerHTML]="visualHtml" style="overflow-x:auto;background:#fff;padding:10px;border-radius:6px;border:1px solid #e0e0e0;"></div>

      <div *ngIf="!visualHtml && !error" style="margin-top:24px;padding:40px;text-align:center;color:#888;background:#fafafa;border-radius:6px;border:2px dashed #ddd;">
        📄 Anexe um arquivo .REM (CNAB 400) para iniciar a validação
      </div>
    </div>
  `
})
export class BradescoCnab400ValidadorComponent {
  visualHtml: SafeHtml | null = null;
  error: string | null = null;
  erros: Erro[] = [];
  validado = false;
  campoSelecionado: string | null = null;
  conteudoArquivo: string = '';
  legendaCampos: CampoLayout[] = [];
  estatisticas: EstatisticasArquivo | null = null;

  constructor(private sanitizer: DomSanitizer) {}

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

  // Layout Header (Tipo 0)
  camposHeader: CampoLayout[] = [
    { nome: 'Tipo Registro', ini: 0, fim: 1, tipo: 'N', obrigatorio: true, valores: ['0'], cor: '#f8bbd0', descricao: 'Identificação do Registro Header' },
    { nome: 'Ident. Arquivo', ini: 1, fim: 2, tipo: 'N', obrigatorio: true, valores: ['1'], cor: '#ffe082', descricao: 'Identificação do Arquivo-Remessa' },
    { nome: 'Literal Remessa', ini: 2, fim: 9, tipo: 'A', obrigatorio: true, valores: ['REMESSA'], cor: '#b2dfdb', descricao: 'Literal REMESSA' },
    { nome: 'Cód. Serviço', ini: 9, fim: 11, tipo: 'N', obrigatorio: true, valores: ['01'], cor: '#c5cae9', descricao: 'Código de Serviço (01=Cobrança)' },
    { nome: 'Literal Serviço', ini: 11, fim: 26, tipo: 'A', obrigatorio: true, valores: ['COBRANCA'], cor: '#e1bee7', descricao: 'Literal COBRANCA' },
    { nome: 'Cód. Empresa', ini: 26, fim: 46, tipo: 'N', obrigatorio: true, cor: '#b3e5fc', descricao: 'Código da Empresa fornecido pelo Bradesco' },
    { nome: 'Nome Empresa', ini: 46, fim: 76, tipo: 'A', obrigatorio: true, cor: '#ffecb3', descricao: 'Razão Social da Empresa' },
    { nome: 'Cód. Banco', ini: 76, fim: 79, tipo: 'N', obrigatorio: true, valores: ['237'], cor: '#ffccbc', descricao: 'Número do Bradesco na Compensação' },
    { nome: 'Nome Banco', ini: 79, fim: 94, tipo: 'A', obrigatorio: true, valores: ['BRADESCO'], cor: '#dcedc8', descricao: 'Nome do Banco por Extenso' },
    { nome: 'Data Gravação', ini: 94, fim: 100, tipo: 'N', obrigatorio: true, formato: 'DDMMAA', cor: '#fff9c4', descricao: 'Data da Gravação do Arquivo (DDMMAA)' },
    { nome: 'Brancos', ini: 100, fim: 108, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Espaços em branco' },
    { nome: 'Ident. Sistema', ini: 108, fim: 110, tipo: 'A', obrigatorio: true, valores: ['MX'], cor: '#b2ebf2', descricao: 'Identificação do Sistema (MX)' },
    { nome: 'Seq. Remessa', ini: 110, fim: 117, tipo: 'N', obrigatorio: true, cor: '#ffcdd2', descricao: 'Número Sequencial de Remessa' },
    { nome: 'Brancos', ini: 117, fim: 394, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Espaços em branco' },
    { nome: 'Seq. Registro', ini: 394, fim: 400, tipo: 'N', obrigatorio: true, valores: ['000001'], cor: '#b2ebf2', descricao: 'Número Sequencial do Registro (sempre 000001 no header)' },
  ];

  // Layout Detalhe (Tipo 1)
  camposDetalhe: CampoLayout[] = [
    { nome: 'Tipo Registro', ini: 0, fim: 1, tipo: 'N', obrigatorio: true, valores: ['1'], cor: '#f8bbd0' },
    { nome: 'Agência Débito', ini: 1, fim: 6, tipo: 'N', obrigatorio: false, cor: '#ffe082' },
    { nome: 'Dígito Ag.', ini: 6, fim: 7, tipo: 'A', obrigatorio: false, cor: '#ffcc80' },
    { nome: 'Razão C/C', ini: 7, fim: 12, tipo: 'N', obrigatorio: false, cor: '#c5cae9' },
    { nome: 'Conta Corrente', ini: 12, fim: 19, tipo: 'N', obrigatorio: false, cor: '#b2dfdb' },
    { nome: 'Dígito C/C', ini: 19, fim: 20, tipo: 'A', obrigatorio: false, cor: '#80cbc4' },
    { nome: 'Ident. Empresa', ini: 20, fim: 37, tipo: 'A', obrigatorio: true, cor: '#e1bee7' },
    { nome: 'Nº Controle', ini: 37, fim: 62, tipo: 'A', obrigatorio: false, cor: '#d1c4e9' },
    { nome: 'Cód. Banco', ini: 62, fim: 65, tipo: 'N', obrigatorio: false, valores: ['237'], cor: '#b3e5fc' },
    { nome: 'Multa', ini: 65, fim: 66, tipo: 'N', obrigatorio: true, valores: ['0', '2'], cor: '#ffcdd2' },
    { nome: '% Multa', ini: 66, fim: 70, tipo: 'N', obrigatorio: false, cor: '#ef9a9a' },
    { nome: 'Nosso Número', ini: 70, fim: 81, tipo: 'N', obrigatorio: true, cor: '#ffccbc' },
    { nome: 'Dígito N/N', ini: 81, fim: 82, tipo: 'A', obrigatorio: true, cor: '#ffab91' },
    { nome: 'Desc. Bonif.', ini: 82, fim: 92, tipo: 'N', obrigatorio: false, cor: '#ffe0b2' },
    { nome: 'Cond. Emissão', ini: 92, fim: 93, tipo: 'N', obrigatorio: true, valores: ['1', '2'], cor: '#fff9c4' },
    { nome: 'Déb. Autom.', ini: 93, fim: 94, tipo: 'A', obrigatorio: true, valores: ['N', 'S'], cor: '#fff59d' },
    { nome: 'Brancos', ini: 94, fim: 104, tipo: 'A', obrigatorio: false, cor: '#f5f5f5' },
    { nome: 'Ind. Rateio', ini: 104, fim: 105, tipo: 'A', obrigatorio: false, valores: ['R'], cor: '#c8e6c9' },
    { nome: 'Endereçam.', ini: 105, fim: 106, tipo: 'N', obrigatorio: false, cor: '#a5d6a7' },
    { nome: 'Qtd. Pag.', ini: 106, fim: 108, tipo: 'A', obrigatorio: false, cor: '#81c784' },
    { nome: 'Ocorrência', ini: 108, fim: 110, tipo: 'N', obrigatorio: true, cor: '#4db6ac' },
    { nome: 'Nº Documento', ini: 110, fim: 120, tipo: 'A', obrigatorio: true, cor: '#dcedc8' },
    { nome: 'Vencimento', ini: 120, fim: 126, tipo: 'N', obrigatorio: true, formato: 'DDMMAA', cor: '#fff9c4' },
    { nome: 'Valor Título', ini: 126, fim: 139, tipo: 'N', obrigatorio: true, cor: '#ffcdd2' },
    { nome: 'Banco Cobr.', ini: 139, fim: 142, tipo: 'N', obrigatorio: true, cor: '#b3e5fc' },
    { nome: 'Agência Dep.', ini: 142, fim: 147, tipo: 'N', obrigatorio: true, cor: '#81d4fa' },
    { nome: 'Espécie', ini: 147, fim: 149, tipo: 'N', obrigatorio: true, valores: ['01','02','03','05','10','11','12','31','32','33','99'], cor: '#4fc3f7' },
    { nome: 'Aceite', ini: 149, fim: 150, tipo: 'A', obrigatorio: true, valores: ['N'], cor: '#29b6f6' },
    { nome: 'Data Emissão', ini: 150, fim: 156, tipo: 'N', obrigatorio: true, formato: 'DDMMAA', cor: '#b2ebf2' },
    { nome: '1ª Instrução', ini: 156, fim: 158, tipo: 'N', obrigatorio: false, cor: '#80deea' },
    { nome: '2ª Instrução', ini: 158, fim: 160, tipo: 'N', obrigatorio: false, cor: '#4dd0e1' },
    { nome: 'Mora/Dia', ini: 160, fim: 173, tipo: 'N', obrigatorio: false, cor: '#b2dfdb' },
    { nome: 'Data Desc.', ini: 173, fim: 179, tipo: 'N', obrigatorio: false, formato: 'DDMMAA', cor: '#80cbc4' },
    { nome: 'Valor Desc.', ini: 179, fim: 192, tipo: 'N', obrigatorio: false, cor: '#4db6ac' },
    { nome: 'Valor IOF', ini: 192, fim: 205, tipo: 'N', obrigatorio: false, cor: '#26a69a' },
    { nome: 'Abatimento', ini: 205, fim: 218, tipo: 'N', obrigatorio: false, cor: '#009688' },
    { nome: 'Tipo Inscr.', ini: 218, fim: 220, tipo: 'N', obrigatorio: true, valores: ['01', '02'], cor: '#e0f7fa' },
    { nome: 'CPF/CNPJ', ini: 220, fim: 234, tipo: 'N', obrigatorio: true, cor: '#b3e5fc' },
    { nome: 'Nome Sacado', ini: 234, fim: 274, tipo: 'A', obrigatorio: true, cor: '#ffecb3' },
    { nome: 'Endereço', ini: 274, fim: 314, tipo: 'A', obrigatorio: true, cor: '#ffe082' },
    { nome: '1ª Mensagem', ini: 314, fim: 326, tipo: 'A', obrigatorio: false, cor: '#ffcc80' },
    { nome: 'CEP', ini: 326, fim: 331, tipo: 'N', obrigatorio: true, cor: '#dcedc8' },
    { nome: 'Sufixo CEP', ini: 331, fim: 334, tipo: 'N', obrigatorio: true, cor: '#c5e1a5' },
    { nome: 'Benef. Final', ini: 334, fim: 394, tipo: 'A', obrigatorio: false, cor: '#aed581' },
    { nome: 'Seq. Registro', ini: 394, fim: 400, tipo: 'N', obrigatorio: true, cor: '#b2ebf2' },
  ];

  // Layout Tipo 2 (Mensagens adicionais)
  camposTipo2: CampoLayout[] = [
    { nome: 'Tipo Registro', ini: 0, fim: 1, tipo: 'N', obrigatorio: true, valores: ['2'], cor: '#f8bbd0' },
    { nome: 'Mensagem 1', ini: 1, fim: 81, tipo: 'A', obrigatorio: false, cor: '#ffe082' },
    { nome: 'Mensagem 2', ini: 81, fim: 161, tipo: 'A', obrigatorio: false, cor: '#b2dfdb' },
    { nome: 'Mensagem 3', ini: 161, fim: 241, tipo: 'A', obrigatorio: false, cor: '#c5cae9' },
    { nome: 'Mensagem 4', ini: 241, fim: 321, tipo: 'A', obrigatorio: false, cor: '#e1bee7' },
    { nome: 'Data Desc. 2', ini: 321, fim: 327, tipo: 'N', obrigatorio: false, formato: 'DDMMAA', cor: '#fff9c4' },
    { nome: 'Valor Desc. 2', ini: 327, fim: 340, tipo: 'N', obrigatorio: false, cor: '#ffcdd2' },
    { nome: 'Data Desc. 3', ini: 340, fim: 346, tipo: 'N', obrigatorio: false, formato: 'DDMMAA', cor: '#fff59d' },
    { nome: 'Valor Desc. 3', ini: 346, fim: 359, tipo: 'N', obrigatorio: false, cor: '#ef9a9a' },
    { nome: 'Reserva', ini: 359, fim: 366, tipo: 'A', obrigatorio: false, cor: '#f5f5f5' },
    { nome: 'Carteira', ini: 366, fim: 369, tipo: 'N', obrigatorio: true, cor: '#b3e5fc' },
    { nome: 'Agência', ini: 369, fim: 374, tipo: 'N', obrigatorio: true, cor: '#ffccbc' },
    { nome: 'Conta Corrente', ini: 374, fim: 381, tipo: 'N', obrigatorio: true, cor: '#dcedc8' },
    { nome: 'Dígito C/C', ini: 381, fim: 382, tipo: 'A', obrigatorio: true, cor: '#c5e1a5' },
    { nome: 'Nosso Número', ini: 382, fim: 393, tipo: 'N', obrigatorio: true, cor: '#4db6ac' },
    { nome: 'DAC Nosso Núm.', ini: 393, fim: 394, tipo: 'A', obrigatorio: true, cor: '#26a69a' },
    { nome: 'Seq. Registro', ini: 394, fim: 400, tipo: 'N', obrigatorio: true, cor: '#b2ebf2' },
  ];

  // Layout Rateio (Tipo 3)
  camposRateio: CampoLayout[] = [
    { nome: 'Tipo Registro', ini: 0, fim: 1, tipo: 'N', obrigatorio: true, valores: ['3'], cor: '#f8bbd0' },
    { nome: 'Ident. Empresa', ini: 1, fim: 17, tipo: 'A', obrigatorio: true, cor: '#ffe082' },
    { nome: 'Ident. Título', ini: 17, fim: 29, tipo: 'A', obrigatorio: true, cor: '#b2dfdb' },
    { nome: 'Cód. Cálculo', ini: 29, fim: 30, tipo: 'N', obrigatorio: true, valores: ['1', '2', '3'], cor: '#c5cae9' },
    { nome: 'Tipo Valor', ini: 30, fim: 31, tipo: 'N', obrigatorio: true, valores: ['1', '2'], cor: '#e1bee7' },
    { nome: 'Filler', ini: 31, fim: 43, tipo: 'A', obrigatorio: false, cor: '#f5f5f5' },
    { nome: 'Banco 1º', ini: 43, fim: 46, tipo: 'N', obrigatorio: true, valores: ['237'], cor: '#ffccbc' },
    { nome: 'Agência 1º', ini: 46, fim: 51, tipo: 'N', obrigatorio: true, cor: '#b3e5fc' },
    { nome: 'Dígito Ag. 1º', ini: 51, fim: 52, tipo: 'A', obrigatorio: true, cor: '#81d4fa' },
    { nome: 'C/C 1º', ini: 52, fim: 64, tipo: 'N', obrigatorio: true, cor: '#4fc3f7' },
    { nome: 'Dígito C/C 1º', ini: 64, fim: 65, tipo: 'A', obrigatorio: true, cor: '#29b6f6' },
    { nome: 'Valor/% 1º', ini: 65, fim: 80, tipo: 'N', obrigatorio: true, cor: '#ffcdd2' },
    { nome: 'Nome 1º', ini: 80, fim: 120, tipo: 'A', obrigatorio: true, cor: '#ffecb3' },
    { nome: 'Filler', ini: 120, fim: 151, tipo: 'A', obrigatorio: false, cor: '#f5f5f5' },
    { nome: 'Parcela 1º', ini: 151, fim: 157, tipo: 'A', obrigatorio: false, cor: '#dcedc8' },
    { nome: 'Floating 1º', ini: 157, fim: 160, tipo: 'N', obrigatorio: false, cor: '#c5e1a5' },
    { nome: 'Banco 2º', ini: 160, fim: 163, tipo: 'N', obrigatorio: false, valores: ['237'], cor: '#ffccbc' },
    { nome: 'Agência 2º', ini: 163, fim: 168, tipo: 'N', obrigatorio: false, cor: '#b3e5fc' },
    { nome: 'Dígito Ag. 2º', ini: 168, fim: 169, tipo: 'A', obrigatorio: false, cor: '#81d4fa' },
    { nome: 'C/C 2º', ini: 169, fim: 181, tipo: 'N', obrigatorio: false, cor: '#4fc3f7' },
    { nome: 'Dígito C/C 2º', ini: 181, fim: 182, tipo: 'A', obrigatorio: false, cor: '#29b6f6' },
    { nome: 'Valor/% 2º', ini: 182, fim: 197, tipo: 'N', obrigatorio: false, cor: '#ffcdd2' },
    { nome: 'Nome 2º', ini: 197, fim: 237, tipo: 'A', obrigatorio: false, cor: '#ffecb3' },
    { nome: 'Filler', ini: 237, fim: 268, tipo: 'A', obrigatorio: false, cor: '#f5f5f5' },
    { nome: 'Parcela 2º', ini: 268, fim: 274, tipo: 'A', obrigatorio: false, cor: '#dcedc8' },
    { nome: 'Floating 2º', ini: 274, fim: 277, tipo: 'N', obrigatorio: false, cor: '#c5e1a5' },
    { nome: 'Banco 3º', ini: 277, fim: 280, tipo: 'N', obrigatorio: false, valores: ['237'], cor: '#ffccbc' },
    { nome: 'Agência 3º', ini: 280, fim: 285, tipo: 'N', obrigatorio: false, cor: '#b3e5fc' },
    { nome: 'Dígito Ag. 3º', ini: 285, fim: 286, tipo: 'A', obrigatorio: false, cor: '#81d4fa' },
    { nome: 'C/C 3º', ini: 286, fim: 298, tipo: 'N', obrigatorio: false, cor: '#4fc3f7' },
    { nome: 'Dígito C/C 3º', ini: 298, fim: 299, tipo: 'A', obrigatorio: false, cor: '#29b6f6' },
    { nome: 'Valor/% 3º', ini: 299, fim: 314, tipo: 'N', obrigatorio: false, cor: '#ffcdd2' },
    { nome: 'Nome 3º', ini: 314, fim: 354, tipo: 'A', obrigatorio: false, cor: '#ffecb3' },
    { nome: 'Filler', ini: 354, fim: 385, tipo: 'A', obrigatorio: false, cor: '#f5f5f5' },
    { nome: 'Parcela 3º', ini: 385, fim: 391, tipo: 'A', obrigatorio: false, cor: '#dcedc8' },
    { nome: 'Floating 3º', ini: 391, fim: 394, tipo: 'N', obrigatorio: false, cor: '#c5e1a5' },
    { nome: 'Seq. Registro', ini: 394, fim: 400, tipo: 'N', obrigatorio: true, cor: '#b2ebf2' },
  ];

  // Layout Tipo 6 (Débito Automático)
  camposTipo6: CampoLayout[] = [
    { nome: 'Tipo Registro', ini: 0, fim: 1, tipo: 'N', obrigatorio: true, valores: ['6'], cor: '#f8bbd0' },
    { nome: 'Carteira', ini: 1, fim: 4, tipo: 'N', obrigatorio: true, cor: '#ffe082' },
    { nome: 'Agência', ini: 4, fim: 9, tipo: 'N', obrigatorio: true, cor: '#b2dfdb' },
    { nome: 'Conta-Corrente', ini: 9, fim: 16, tipo: 'N', obrigatorio: true, cor: '#c5cae9' },
    { nome: 'Nosso Número', ini: 16, fim: 27, tipo: 'N', obrigatorio: true, cor: '#e1bee7' },
    { nome: 'Dígito N/N', ini: 27, fim: 28, tipo: 'A', obrigatorio: true, cor: '#b3e5fc' },
    { nome: 'Tipo Operação', ini: 28, fim: 29, tipo: 'N', obrigatorio: true, valores: ['1', '2', '3'], cor: '#ffccbc' },
    { nome: 'Cheque Esp.', ini: 29, fim: 30, tipo: 'A', obrigatorio: true, valores: ['S', 'N'], cor: '#dcedc8' },
    { nome: 'Cons. Saldo', ini: 30, fim: 31, tipo: 'A', obrigatorio: true, valores: ['S', 'N'], cor: '#c5e1a5' },
    { nome: 'Nº Contrato', ini: 31, fim: 56, tipo: 'A', obrigatorio: true, cor: '#81c784' },
    { nome: 'Prazo Validade', ini: 56, fim: 64, tipo: 'N', obrigatorio: true, cor: '#4db6ac' },
    { nome: 'Brancos', ini: 64, fim: 394, tipo: 'A', obrigatorio: false, cor: '#f5f5f5' },
    { nome: 'Seq. Registro', ini: 394, fim: 400, tipo: 'N', obrigatorio: true, cor: '#b2ebf2' },
  ];

  // Layout Tipo 7 (Beneficiário Final)
  camposTipo7: CampoLayout[] = [
    { nome: 'Tipo Registro', ini: 0, fim: 1, tipo: 'N', obrigatorio: true, valores: ['7'], cor: '#f8bbd0' },
    { nome: 'Endereço Benef.', ini: 1, fim: 46, tipo: 'A', obrigatorio: false, cor: '#ffe082' },
    { nome: 'CEP', ini: 46, fim: 51, tipo: 'N', obrigatorio: false, cor: '#b2dfdb' },
    { nome: 'Sufixo CEP', ini: 51, fim: 54, tipo: 'N', obrigatorio: false, cor: '#c5cae9' },
    { nome: 'Cidade', ini: 54, fim: 74, tipo: 'A', obrigatorio: false, cor: '#e1bee7' },
    { nome: 'UF', ini: 74, fim: 76, tipo: 'A', obrigatorio: false, cor: '#b3e5fc' },
    { nome: 'Reserva', ini: 76, fim: 366, tipo: 'A', obrigatorio: false, cor: '#f5f5f5' },
    { nome: 'Carteira', ini: 366, fim: 369, tipo: 'N', obrigatorio: true, cor: '#ffccbc' },
    { nome: 'Agência', ini: 369, fim: 374, tipo: 'N', obrigatorio: true, cor: '#dcedc8' },
    { nome: 'Conta Corrente', ini: 374, fim: 381, tipo: 'N', obrigatorio: true, cor: '#c5e1a5' },
    { nome: 'Dígito C/C', ini: 381, fim: 382, tipo: 'A', obrigatorio: true, cor: '#81c784' },
    { nome: 'Nosso Número', ini: 382, fim: 393, tipo: 'N', obrigatorio: true, cor: '#4db6ac' },
    { nome: 'DAC Nosso Núm.', ini: 393, fim: 394, tipo: 'A', obrigatorio: true, cor: '#26a69a' },
    { nome: 'Seq. Registro', ini: 394, fim: 400, tipo: 'N', obrigatorio: true, cor: '#b2ebf2' },
  ];

  // Layout Trailer (Tipo 9)
  camposTrailer: CampoLayout[] = [
    { nome: 'Tipo Registro', ini: 0, fim: 1, tipo: 'N', obrigatorio: true, valores: ['9'], cor: '#f8bbd0' },
    { nome: 'Brancos', ini: 1, fim: 394, tipo: 'A', obrigatorio: false, cor: '#f5f5f5' },
    { nome: 'Seq. Registro', ini: 394, fim: 400, tipo: 'N', obrigatorio: true, cor: '#b2ebf2' },
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

    reader.readAsText(file, 'ISO-8859-1'); // Encoding comum para arquivos CNAB
  }

  validarEHighlight(content: string): string {
    const lines = content.split(/\r?\n/).filter(l => l.length > 0);
    if (lines.length === 0) {
      this.error = 'Arquivo vazio ou sem linhas válidas.';
      return '';
    }

    // Inicializar estatísticas
    this.estatisticas = {
      totalLinhas: lines.length,
      headers: 0,
      detalhes: 0,
      rateios: 0,
      tipo2: 0,
      tipo6: 0,
      tipo7: 0,
      trailers: 0,
      desconhecidos: 0
    };

    // Validar cada linha
    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];
      const tipo = line[0];
      let campos: CampoLayout[];

      // Determinar tipo e campos
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
            mensagem: `Tipo de registro desconhecido: "${tipo}"`
          });
      }

      // Validar tamanho da linha
      if (line.length !== 400) {
        this.erros.push({
          linha: idx + 1,
          campo: 'Linha',
          posicao: '1-400',
          valor: `${line.length} caracteres`,
          mensagem: `Tamanho inválido. Esperado: 400, Encontrado: ${line.length}`
        });
      }

      // Validar campos
      for (const campo of campos) {
        const valor = line.slice(campo.ini, campo.fim);
        this.validarCampo(idx + 1, campo, valor);
      }
    }

    // Validações estruturais
    this.validarEstrutura();

    // Popular legenda (sem duplicatas)
    const todosCampos = [
      ...this.camposHeader,
      ...this.camposDetalhe,
      ...this.camposTipo2,
      ...this.camposRateio,
      ...this.camposTipo6,
      ...this.camposTipo7,
      ...this.camposTrailer
    ];
    this.legendaCampos = todosCampos.filter(
      (campo, index, self) => self.findIndex(c => c.nome === campo.nome) === index
    );

    // Renderizar arquivo
    const html = lines.map((line, idx) => this.lineToMatrix(line, idx)).join('');
    return html;
  }

  validarEstrutura(): void {
    if (!this.estatisticas) return;

    // Deve ter pelo menos 1 header
    if (this.estatisticas.headers === 0) {
      this.erros.push({
        linha: 0,
        campo: 'Estrutura',
        posicao: '-',
        valor: '-',
        mensagem: 'Arquivo deve conter pelo menos um registro Header (Tipo 0)'
      });
    }

    // Deve ter pelo menos 1 trailer
    if (this.estatisticas.trailers === 0) {
      this.erros.push({
        linha: 0,
        campo: 'Estrutura',
        posicao: '-',
        valor: '-',
        mensagem: 'Arquivo deve conter pelo menos um registro Trailer (Tipo 9)'
      });
    }

    // Alertar se não houver detalhes
    if (this.estatisticas.detalhes === 0) {
      this.erros.push({
        linha: 0,
        campo: 'Estrutura',
        posicao: '-',
        valor: '-',
        mensagem: 'Aviso: Arquivo não contém registros de Detalhe (Tipo 1)'
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

    // Validar obrigatoriedade
    if (campo.obrigatorio && valorTrim === '') {
      this.erros.push({
        linha,
        campo: campo.nome,
        posicao: `${campo.ini + 1}-${campo.fim}`,
        valor: valor,
        mensagem: 'Campo obrigatório está vazio'
      });
      return;
    }

    // Não validar campos vazios não obrigatórios
    if (!campo.obrigatorio && valorTrim === '') {
      return;
    }

    // Validar tipo numérico
    if (campo.tipo === 'N' && valorTrim !== '') {
      const valorSemEspacos = valor.replace(/ /g, '');
      if (!/^\d*$/.test(valorSemEspacos)) {
        this.erros.push({
          linha,
          campo: campo.nome,
          posicao: `${campo.ini + 1}-${campo.fim}`,
          valor: valor,
          mensagem: 'Deve conter apenas números'
        });
      }
    }

    // Validar valores permitidos
    if (campo.valores && valorTrim !== '') {
      if (!campo.valores.includes(valorTrim)) {
        this.erros.push({
          linha,
          campo: campo.nome,
          posicao: `${campo.ini + 1}-${campo.fim}`,
          valor: valor,
          mensagem: `Valor inválido. Valores permitidos: ${campo.valores.join(', ')}`
        });
      }
    }

    // Validar formato de data DDMMAA
    if (campo.formato === 'DDMMAA' && valorTrim !== '' && valorTrim !== '000000') {
      if (valor.length === 6) {
        const dia = parseInt(valor.slice(0, 2));
        const mes = parseInt(valor.slice(2, 4));
        const ano = parseInt(valor.slice(4, 6));

        if (dia < 1 || dia > 31) {
          this.erros.push({
            linha,
            campo: campo.nome,
            posicao: `${campo.ini + 1}-${campo.fim}`,
            valor: valor,
            mensagem: `Dia inválido: ${dia} (deve estar entre 01 e 31)`
          });
        }

        if (mes < 1 || mes > 12) {
          this.erros.push({
            linha,
            campo: campo.nome,
            posicao: `${campo.ini + 1}-${campo.fim}`,
            valor: valor,
            mensagem: `Mês inválido: ${mes} (deve estar entre 01 e 12)`
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

    let html = `<div style="margin-bottom:10px;">`;
    html += `<div style="display:flex;align-items:center;margin-bottom:4px;">`;
    html += `<span style="min-width:100px;font-size:13px;color:${tipoColor};font-weight:bold;">Linha ${lineIdx+1}</span>`;
    html += `<span style="padding:2px 8px;background:${tipoColor};color:#fff;border-radius:3px;font-size:11px;font-weight:bold;">${tipoNome}</span>`;
    html += `</div>`;
    html += `<div style="display:flex;flex-wrap:nowrap;gap:1px;">`;

    for (let i = 0; i < Math.min(line.length, 400); i++) {
      const char = line[i] || ' ';
      const campo = campos.find(c => i >= c.ini && i < c.fim);
      const cor = campo ? campo.cor : '#f5f5f5';
      const nomeCampo = campo ? campo.nome : 'N/D';
      const temErro = campo ? this.erros.some(e => e.linha === lineIdx + 1 && e.campo === campo.nome) : false;
      const bordaErro = temErro ? 'border:2px solid #d32f2f;' : 'border:1px solid #e0e0e0;';

      const estaSelecionado = this.campoSelecionado && campo && campo.nome === this.campoSelecionado;
      const estiloDestaque = estaSelecionado
        ? 'box-shadow:0 0 0 2px #1976d2;z-index:10;position:relative;transform:scale(1.3);'
        : '';
      const opacidade = this.campoSelecionado && !estaSelecionado ? 'opacity:0.25;' : '';

      const title = `${nomeCampo} - Pos ${i+1}${campo?.descricao ? '\n' + campo.descricao : ''}`;

      html += `<span style="display:inline-block;width:14px;height:18px;line-height:18px;text-align:center;background:${cor};${bordaErro}font-size:11px;font-family:monospace;${estiloDestaque}${opacidade}" title="${this.escapeHtml(title)}">${char === ' ' ? '&nbsp;' : this.escapeHtml(char)}</span>`;
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
