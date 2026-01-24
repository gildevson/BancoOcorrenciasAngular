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
}

interface EstatisticasArquivo {
  totalLinhas: number;
  headerArquivo: number;
  headerLote: number;
  segmentoT: number;
  segmentoU: number;
  trailerLote: number;
  trailerArquivo: number;
  desconhecidos: number;
}

@Component({
  selector: 'app-bradesco-retorno240-validador',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="max-width:1400px;margin:0 auto;padding:20px;">
      <h2 style="color:#1976d2;margin-bottom:20px;">🏦 Validador Retorno Bradesco CNAB 240</h2>

      <div style="margin-bottom:20px;">
        <input type="file" accept=".ret,.txt" (change)="onFileChange($event)"
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
          <div style="font-size:24px;font-weight:bold;color:#7b1fa2;">{{ estatisticas.headerArquivo }}</div>
          <div style="font-size:12px;color:#555;">Header Arquivo</div>
        </div>
        <div style="background:#fff3e0;padding:12px;border-radius:6px;border:1px solid #ffcc80;">
          <div style="font-size:24px;font-weight:bold;color:#f57c00;">{{ estatisticas.headerLote }}</div>
          <div style="font-size:12px;color:#555;">Header Lote</div>
        </div>
        <div style="background:#e8f5e9;padding:12px;border-radius:6px;border:1px solid #a5d6a7;">
          <div style="font-size:24px;font-weight:bold;color:#388e3c;">{{ estatisticas.segmentoT }}</div>
          <div style="font-size:12px;color:#555;">Segmento T</div>
        </div>
        <div style="background:#e0f7fa;padding:12px;border-radius:6px;border:1px solid #80deea;">
          <div style="font-size:24px;font-weight:bold;color:#00796b;">{{ estatisticas.segmentoU }}</div>
          <div style="font-size:12px;color:#555;">Segmento U</div>
        </div>
        <div style="background:#fce4ec;padding:12px;border-radius:6px;border:1px solid #f48fb1;">
          <div style="font-size:24px;font-weight:bold;color:#c2185b;">{{ estatisticas.trailerLote + estatisticas.trailerArquivo }}</div>
          <div style="font-size:12px;color:#555;">Trailers</div>
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
        📄 Anexe um arquivo .RET (Retorno CNAB 240) para iniciar a validação
      </div>
    </div>
  `
})
export class BradescoRetorno240ValidadorComponent {
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

  // Header de Arquivo (Tipo 0)
  camposHeaderArquivo: CampoLayout[] = [
    { nome: 'Cód. Banco', ini: 0, fim: 3, tipo: 'N', obrigatorio: true, valores: ['237'], cor: '#f8bbd0', descricao: 'Código do Banco na Compensação' },
    { nome: 'Lote', ini: 3, fim: 7, tipo: 'N', obrigatorio: true, valores: ['0000'], cor: '#ffe082', descricao: 'Lote de Serviço' },
    { nome: 'Tipo Registro', ini: 7, fim: 8, tipo: 'N', obrigatorio: true, valores: ['0'], cor: '#b2dfdb', descricao: 'Tipo de Registro' },
    { nome: 'Brancos', ini: 8, fim: 17, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Uso Exclusivo FEBRABAN' },
    { nome: 'Tipo Inscrição', ini: 17, fim: 18, tipo: 'N', obrigatorio: true, valores: ['1', '2'], cor: '#c5cae9', descricao: '1=CPF 2=CNPJ' },
    { nome: 'CNPJ/CPF', ini: 18, fim: 32, tipo: 'N', obrigatorio: true, cor: '#e1bee7', descricao: 'CNPJ ou CPF da Empresa' },
    { nome: 'Convênio', ini: 32, fim: 52, tipo: 'A', obrigatorio: true, cor: '#b3e5fc', descricao: 'Código do Convênio no Banco' },
    { nome: 'Agência', ini: 52, fim: 57, tipo: 'N', obrigatorio: true, cor: '#ffccbc', descricao: 'Agência Mantenedora da Conta' },
    { nome: 'Dígito Ag.', ini: 57, fim: 58, tipo: 'A', obrigatorio: true, cor: '#dcedc8', descricao: 'Dígito Verificador da Agência' },
    { nome: 'Conta', ini: 58, fim: 70, tipo: 'N', obrigatorio: true, cor: '#fff9c4', descricao: 'Número da Conta Corrente' },
    { nome: 'Dígito Conta', ini: 70, fim: 71, tipo: 'A', obrigatorio: true, cor: '#ffcdd2', descricao: 'Dígito Verificador da Conta' },
    { nome: 'Dígito Ag/Conta', ini: 71, fim: 72, tipo: 'A', obrigatorio: false, cor: '#b2ebf2', descricao: 'Dígito Verificador da Agência/Conta' },
    { nome: 'Nome Empresa', ini: 72, fim: 102, tipo: 'A', obrigatorio: true, cor: '#ffecb3', descricao: 'Nome da Empresa' },
    { nome: 'Nome Banco', ini: 102, fim: 132, tipo: 'A', obrigatorio: true, cor: '#c5e1a5', descricao: 'Nome do Banco' },
    { nome: 'Brancos', ini: 132, fim: 142, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Uso Exclusivo FEBRABAN' },
    { nome: 'Cód. Arquivo', ini: 142, fim: 143, tipo: 'N', obrigatorio: true, valores: ['2'], cor: '#81c784', descricao: '2=Retorno' },
    { nome: 'Data Geração', ini: 143, fim: 151, tipo: 'N', obrigatorio: true, formato: 'DDMMAAAA', cor: '#4db6ac', descricao: 'Data de Geração do Arquivo' },
    { nome: 'Hora Geração', ini: 151, fim: 157, tipo: 'N', obrigatorio: true, cor: '#26a69a', descricao: 'Hora de Geração do Arquivo' },
    { nome: 'Seq. Arquivo', ini: 157, fim: 163, tipo: 'N', obrigatorio: true, cor: '#009688', descricao: 'Número Sequencial do Arquivo' },
    { nome: 'Layout', ini: 163, fim: 166, tipo: 'N', obrigatorio: true, valores: ['087'], cor: '#e0f7fa', descricao: 'Número da Versão do Layout' },
    { nome: 'Densidade', ini: 166, fim: 171, tipo: 'N', obrigatorio: false, cor: '#b3e5fc', descricao: 'Densidade de Gravação' },
    { nome: 'Reservado Banco', ini: 171, fim: 191, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Reservado para o Banco' },
    { nome: 'Reservado Empresa', ini: 191, fim: 211, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Reservado para a Empresa' },
    { nome: 'Brancos', ini: 211, fim: 240, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Uso Exclusivo FEBRABAN' },
  ];

  // Header de Lote (Tipo 1)
  camposHeaderLote: CampoLayout[] = [
    { nome: 'Cód. Banco', ini: 0, fim: 3, tipo: 'N', obrigatorio: true, valores: ['237'], cor: '#f8bbd0', descricao: 'Código do Banco' },
    { nome: 'Lote', ini: 3, fim: 7, tipo: 'N', obrigatorio: true, cor: '#ffe082', descricao: 'Lote de Serviço' },
    { nome: 'Tipo Registro', ini: 7, fim: 8, tipo: 'N', obrigatorio: true, valores: ['1'], cor: '#b2dfdb', descricao: 'Tipo de Registro' },
    { nome: 'Operação', ini: 8, fim: 9, tipo: 'A', obrigatorio: true, valores: ['T'], cor: '#c5cae9', descricao: 'Tipo de Operação' },
    { nome: 'Tipo Serviço', ini: 9, fim: 11, tipo: 'N', obrigatorio: true, cor: '#e1bee7', descricao: 'Tipo de Serviço' },
    { nome: 'Brancos', ini: 11, fim: 13, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Uso Exclusivo FEBRABAN' },
    { nome: 'Layout Lote', ini: 13, fim: 16, tipo: 'N', obrigatorio: true, cor: '#b3e5fc', descricao: 'Número da Versão do Layout do Lote' },
    { nome: 'Brancos', ini: 16, fim: 17, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Uso Exclusivo FEBRABAN' },
    { nome: 'Tipo Inscrição', ini: 17, fim: 18, tipo: 'N', obrigatorio: true, cor: '#ffccbc', descricao: '1=CPF 2=CNPJ' },
    { nome: 'CNPJ/CPF', ini: 18, fim: 33, tipo: 'N', obrigatorio: true, cor: '#dcedc8', descricao: 'CNPJ ou CPF da Empresa' },
    { nome: 'Convênio', ini: 33, fim: 53, tipo: 'A', obrigatorio: true, cor: '#fff9c4', descricao: 'Código do Convênio' },
    { nome: 'Agência', ini: 53, fim: 58, tipo: 'N', obrigatorio: true, cor: '#ffcdd2', descricao: 'Agência Mantenedora da Conta' },
    { nome: 'Dígito Ag.', ini: 58, fim: 59, tipo: 'A', obrigatorio: true, cor: '#b2ebf2', descricao: 'Dígito Verificador da Agência' },
    { nome: 'Conta', ini: 59, fim: 71, tipo: 'N', obrigatorio: true, cor: '#ffecb3', descricao: 'Número da Conta Corrente' },
    { nome: 'Dígito Conta', ini: 71, fim: 72, tipo: 'A', obrigatorio: true, cor: '#c5e1a5', descricao: 'Dígito Verificador da Conta' },
    { nome: 'Dígito Ag/Conta', ini: 72, fim: 73, tipo: 'A', obrigatorio: false, cor: '#81c784', descricao: 'Dígito Verificador da Agência/Conta' },
    { nome: 'Nome Empresa', ini: 73, fim: 103, tipo: 'A', obrigatorio: true, cor: '#4db6ac', descricao: 'Nome da Empresa' },
    { nome: 'Mensagem 1', ini: 103, fim: 143, tipo: 'A', obrigatorio: false, cor: '#26a69a', descricao: 'Mensagem 1' },
    { nome: 'Mensagem 2', ini: 143, fim: 183, tipo: 'A', obrigatorio: false, cor: '#009688', descricao: 'Mensagem 2' },
    { nome: 'Nº Remessa/Retorno', ini: 183, fim: 191, tipo: 'N', obrigatorio: true, cor: '#e0f7fa', descricao: 'Número Remessa/Retorno' },
    { nome: 'Data Gravação', ini: 191, fim: 199, tipo: 'N', obrigatorio: true, formato: 'DDMMAAAA', cor: '#b3e5fc', descricao: 'Data de Gravação' },
    { nome: 'Data Crédito', ini: 199, fim: 207, tipo: 'N', obrigatorio: false, formato: 'DDMMAAAA', cor: '#80deea', descricao: 'Data do Crédito' },
    { nome: 'Brancos', ini: 207, fim: 240, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Uso Exclusivo FEBRABAN' },
  ];

  // Segmento T (Tipo 3 - Segmento T)
  camposSegmentoT: CampoLayout[] = [
    { nome: 'Cód. Banco', ini: 0, fim: 3, tipo: 'N', obrigatorio: true, valores: ['237'], cor: '#f8bbd0', descricao: 'Código do Banco' },
    { nome: 'Lote', ini: 3, fim: 7, tipo: 'N', obrigatorio: true, cor: '#ffe082', descricao: 'Lote de Serviço' },
    { nome: 'Tipo Registro', ini: 7, fim: 8, tipo: 'N', obrigatorio: true, valores: ['3'], cor: '#b2dfdb', descricao: 'Tipo de Registro' },
    { nome: 'Seq. Registro', ini: 8, fim: 13, tipo: 'N', obrigatorio: true, cor: '#c5cae9', descricao: 'Número Sequencial do Registro' },
    { nome: 'Segmento', ini: 13, fim: 14, tipo: 'A', obrigatorio: true, valores: ['T'], cor: '#e1bee7', descricao: 'Código do Segmento' },
    { nome: 'Brancos', ini: 14, fim: 15, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Uso Exclusivo FEBRABAN' },
    { nome: 'Cód. Movimento', ini: 15, fim: 17, tipo: 'N', obrigatorio: true, cor: '#b3e5fc', descricao: 'Código de Movimento Retorno' },
    { nome: 'Agência', ini: 17, fim: 22, tipo: 'N', obrigatorio: true, cor: '#ffccbc', descricao: 'Agência Mantenedora da Conta' },
    { nome: 'Dígito Ag.', ini: 22, fim: 23, tipo: 'A', obrigatorio: true, cor: '#dcedc8', descricao: 'Dígito Verificador da Agência' },
    { nome: 'Conta', ini: 23, fim: 35, tipo: 'N', obrigatorio: true, cor: '#fff9c4', descricao: 'Número da Conta Corrente' },
    { nome: 'Dígito Conta', ini: 35, fim: 36, tipo: 'A', obrigatorio: true, cor: '#ffcdd2', descricao: 'Dígito Verificador da Conta' },
    { nome: 'Dígito Ag/Conta', ini: 36, fim: 37, tipo: 'A', obrigatorio: false, cor: '#b2ebf2', descricao: 'Dígito Verificador da Agência/Conta' },
    { nome: 'Nosso Número', ini: 37, fim: 57, tipo: 'A', obrigatorio: true, cor: '#ffecb3', descricao: 'Identificação do Título no Banco' },
    { nome: 'Carteira', ini: 57, fim: 58, tipo: 'N', obrigatorio: true, cor: '#c5e1a5', descricao: 'Código da Carteira' },
    { nome: 'Nº Documento', ini: 58, fim: 73, tipo: 'A', obrigatorio: true, cor: '#81c784', descricao: 'Número do Documento' },
    { nome: 'Vencimento', ini: 73, fim: 81, tipo: 'N', obrigatorio: true, formato: 'DDMMAAAA', cor: '#4db6ac', descricao: 'Data de Vencimento' },
    { nome: 'Valor Título', ini: 81, fim: 96, tipo: 'N', obrigatorio: true, cor: '#26a69a', descricao: 'Valor Nominal do Título' },
    { nome: 'Banco Cobr.', ini: 96, fim: 99, tipo: 'N', obrigatorio: false, cor: '#009688', descricao: 'Banco Cobrador' },
    { nome: 'Agência Cob.', ini: 99, fim: 104, tipo: 'N', obrigatorio: false, cor: '#e0f7fa', descricao: 'Agência Cobradora' },
    { nome: 'Dígito Ag. Cob.', ini: 104, fim: 105, tipo: 'A', obrigatorio: false, cor: '#b3e5fc', descricao: 'Dígito da Agência Cobradora' },
    { nome: 'Uso Empresa', ini: 105, fim: 130, tipo: 'A', obrigatorio: false, cor: '#80deea', descricao: 'Identificação do Título na Empresa' },
    { nome: 'Cód. Moeda', ini: 130, fim: 132, tipo: 'N', obrigatorio: true, cor: '#4dd0e1', descricao: 'Código da Moeda' },
    { nome: 'Tipo Inscrição', ini: 132, fim: 133, tipo: 'N', obrigatorio: true, cor: '#00bcd4', descricao: '1=CPF 2=CNPJ' },
    { nome: 'CPF/CNPJ Sacado', ini: 133, fim: 148, tipo: 'N', obrigatorio: true, cor: '#00acc1', descricao: 'CPF/CNPJ do Sacado' },
    { nome: 'Nome Sacado', ini: 148, fim: 188, tipo: 'A', obrigatorio: true, cor: '#0097a7', descricao: 'Nome do Sacado' },
    { nome: 'Brancos', ini: 188, fim: 198, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Uso Exclusivo FEBRABAN' },
    { nome: 'Valor Tarifa', ini: 198, fim: 213, tipo: 'N', obrigatorio: false, cor: '#00838f', descricao: 'Valor da Tarifa' },
    { nome: 'Motivo Ocorrência', ini: 213, fim: 223, tipo: 'A', obrigatorio: false, cor: '#006064', descricao: 'Identificação para Rejeições' },
    { nome: 'Brancos', ini: 223, fim: 240, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Uso Exclusivo FEBRABAN' },
  ];

  // Segmento U (Tipo 3 - Segmento U)
  camposSegmentoU: CampoLayout[] = [
    { nome: 'Cód. Banco', ini: 0, fim: 3, tipo: 'N', obrigatorio: true, valores: ['237'], cor: '#f8bbd0', descricao: 'Código do Banco' },
    { nome: 'Lote', ini: 3, fim: 7, tipo: 'N', obrigatorio: true, cor: '#ffe082', descricao: 'Lote de Serviço' },
    { nome: 'Tipo Registro', ini: 7, fim: 8, tipo: 'N', obrigatorio: true, valores: ['3'], cor: '#b2dfdb', descricao: 'Tipo de Registro' },
    { nome: 'Seq. Registro', ini: 8, fim: 13, tipo: 'N', obrigatorio: true, cor: '#c5cae9', descricao: 'Número Sequencial do Registro' },
    { nome: 'Segmento', ini: 13, fim: 14, tipo: 'A', obrigatorio: true, valores: ['U'], cor: '#e1bee7', descricao: 'Código do Segmento' },
    { nome: 'Brancos', ini: 14, fim: 15, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Uso Exclusivo FEBRABAN' },
    { nome: 'Cód. Movimento', ini: 15, fim: 17, tipo: 'N', obrigatorio: true, cor: '#b3e5fc', descricao: 'Código de Movimento Retorno' },
    { nome: 'Acréscimos', ini: 17, fim: 32, tipo: 'N', obrigatorio: false, cor: '#ffccbc', descricao: 'Juros/Multa/Encargos' },
    { nome: 'Valor Desconto', ini: 32, fim: 47, tipo: 'N', obrigatorio: false, cor: '#dcedc8', descricao: 'Valor do Desconto Concedido' },
    { nome: 'Valor Abatimento', ini: 47, fim: 62, tipo: 'N', obrigatorio: false, cor: '#fff9c4', descricao: 'Valor do Abatimento' },
    { nome: 'Valor IOF', ini: 62, fim: 77, tipo: 'N', obrigatorio: false, cor: '#ffcdd2', descricao: 'Valor do IOF' },
    { nome: 'Valor Pago', ini: 77, fim: 92, tipo: 'N', obrigatorio: true, cor: '#b2ebf2', descricao: 'Valor Pago pelo Sacado' },
    { nome: 'Valor Líquido', ini: 92, fim: 107, tipo: 'N', obrigatorio: true, cor: '#ffecb3', descricao: 'Valor Líquido a ser Creditado' },
    { nome: 'Outras Despesas', ini: 107, fim: 122, tipo: 'N', obrigatorio: false, cor: '#c5e1a5', descricao: 'Outras Despesas' },
    { nome: 'Outros Créditos', ini: 122, fim: 137, tipo: 'N', obrigatorio: false, cor: '#81c784', descricao: 'Outros Créditos' },
    { nome: 'Data Ocorrência', ini: 137, fim: 145, tipo: 'N', obrigatorio: true, formato: 'DDMMAAAA', cor: '#4db6ac', descricao: 'Data da Ocorrência' },
    { nome: 'Data Crédito', ini: 145, fim: 153, tipo: 'N', obrigatorio: false, formato: 'DDMMAAAA', cor: '#26a69a', descricao: 'Data do Crédito' },
    { nome: 'Cód. Ocorrência Sacado', ini: 153, fim: 157, tipo: 'A', obrigatorio: false, cor: '#009688', descricao: 'Código da Ocorrência do Sacado' },
    { nome: 'Data Ocorrência Sacado', ini: 157, fim: 165, tipo: 'N', obrigatorio: false, formato: 'DDMMAAAA', cor: '#e0f7fa', descricao: 'Data da Ocorrência do Sacado' },
    { nome: 'Valor Ocorrência Sacado', ini: 165, fim: 180, tipo: 'N', obrigatorio: false, cor: '#b3e5fc', descricao: 'Valor da Ocorrência do Sacado' },
    { nome: 'Compl. Ocorrência Sacado', ini: 180, fim: 210, tipo: 'A', obrigatorio: false, cor: '#80deea', descricao: 'Complemento da Ocorrência' },
    { nome: 'Cód. Banco Corresp.', ini: 210, fim: 213, tipo: 'N', obrigatorio: false, cor: '#4dd0e1', descricao: 'Código do Banco Correspondente' },
    { nome: 'Nosso Núm. Corresp.', ini: 213, fim: 233, tipo: 'A', obrigatorio: false, cor: '#00bcd4', descricao: 'Nosso Número no Banco Correspondente' },
    { nome: 'Brancos', ini: 233, fim: 240, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Uso Exclusivo FEBRABAN' },
  ];

  // Trailer de Lote (Tipo 5)
  camposTrailerLote: CampoLayout[] = [
    { nome: 'Cód. Banco', ini: 0, fim: 3, tipo: 'N', obrigatorio: true, valores: ['237'], cor: '#f8bbd0', descricao: 'Código do Banco' },
    { nome: 'Lote', ini: 3, fim: 7, tipo: 'N', obrigatorio: true, cor: '#ffe082', descricao: 'Lote de Serviço' },
    { nome: 'Tipo Registro', ini: 7, fim: 8, tipo: 'N', obrigatorio: true, valores: ['5'], cor: '#b2dfdb', descricao: 'Tipo de Registro' },
    { nome: 'Brancos', ini: 8, fim: 17, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Uso Exclusivo FEBRABAN' },
    { nome: 'Qtd. Registros', ini: 17, fim: 23, tipo: 'N', obrigatorio: true, cor: '#c5cae9', descricao: 'Quantidade de Registros no Lote' },
    { nome: 'Qtd. Títulos Cobrança', ini: 23, fim: 29, tipo: 'N', obrigatorio: false, cor: '#e1bee7', descricao: 'Quantidade de Títulos em Cobrança' },
    { nome: 'Valor Total Cobrança', ini: 29, fim: 46, tipo: 'N', obrigatorio: false, cor: '#b3e5fc', descricao: 'Valor Total dos Títulos em Cobrança' },
    { nome: 'Qtd. Títulos Baixados', ini: 46, fim: 52, tipo: 'N', obrigatorio: false, cor: '#ffccbc', descricao: 'Quantidade de Títulos Baixados' },
    { nome: 'Valor Total Baixados', ini: 52, fim: 69, tipo: 'N', obrigatorio: false, cor: '#dcedc8', descricao: 'Valor Total Baixados' },
    { nome: 'Qtd. Títulos Abatimento', ini: 69, fim: 75, tipo: 'N', obrigatorio: false, cor: '#fff9c4', descricao: 'Quantidade de Títulos Abatimento' },
    { nome: 'Valor Total Abatimento', ini: 75, fim: 92, tipo: 'N', obrigatorio: false, cor: '#ffcdd2', descricao: 'Valor Total Abatimento' },
    { nome: 'Qtd. Títulos Confirmados', ini: 92, fim: 98, tipo: 'N', obrigatorio: false, cor: '#b2ebf2', descricao: 'Quantidade de Títulos Confirmados' },
    { nome: 'Valor Total Confirmados', ini: 98, fim: 115, tipo: 'N', obrigatorio: false, cor: '#ffecb3', descricao: 'Valor Total Confirmados' },
    { nome: 'Brancos', ini: 115, fim: 123, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Uso Exclusivo FEBRABAN' },
    { nome: 'Brancos', ini: 123, fim: 240, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Uso Exclusivo FEBRABAN' },
  ];

  // Trailer de Arquivo (Tipo 9)
  camposTrailerArquivo: CampoLayout[] = [
    { nome: 'Cód. Banco', ini: 0, fim: 3, tipo: 'N', obrigatorio: true, valores: ['237'], cor: '#f8bbd0', descricao: 'Código do Banco' },
    { nome: 'Lote', ini: 3, fim: 7, tipo: 'N', obrigatorio: true, valores: ['9999'], cor: '#ffe082', descricao: 'Lote de Serviço' },
    { nome: 'Tipo Registro', ini: 7, fim: 8, tipo: 'N', obrigatorio: true, valores: ['9'], cor: '#b2dfdb', descricao: 'Tipo de Registro' },
    { nome: 'Brancos', ini: 8, fim: 17, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Uso Exclusivo FEBRABAN' },
    { nome: 'Qtd. Lotes', ini: 17, fim: 23, tipo: 'N', obrigatorio: true, cor: '#c5cae9', descricao: 'Quantidade de Lotes do Arquivo' },
    { nome: 'Qtd. Registros', ini: 23, fim: 29, tipo: 'N', obrigatorio: true, cor: '#e1bee7', descricao: 'Quantidade de Registros do Arquivo' },
    { nome: 'Qtd. Contas Concil.', ini: 29, fim: 35, tipo: 'N', obrigatorio: false, cor: '#b3e5fc', descricao: 'Quantidade de Contas para Conciliação' },
    { nome: 'Brancos', ini: 35, fim: 240, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Uso Exclusivo FEBRABAN' },
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
        this.error = 'Erro ao processar o arquivo. Verifique se é um arquivo de Retorno CNAB 240 válido.';
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
      headerArquivo: 0,
      headerLote: 0,
      segmentoT: 0,
      segmentoU: 0,
      trailerLote: 0,
      trailerArquivo: 0,
      desconhecidos: 0
    };

    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];
      const tipoRegistro = line.charAt(7);
      const segmento = line.charAt(13);
      let campos: CampoLayout[];

      if (tipoRegistro === '0') {
        campos = this.camposHeaderArquivo;
        this.estatisticas.headerArquivo++;
      } else if (tipoRegistro === '1') {
        campos = this.camposHeaderLote;
        this.estatisticas.headerLote++;
      } else if (tipoRegistro === '3') {
        if (segmento === 'T') {
          campos = this.camposSegmentoT;
          this.estatisticas.segmentoT++;
        } else if (segmento === 'U') {
          campos = this.camposSegmentoU;
          this.estatisticas.segmentoU++;
        } else {
          campos = [];
          this.estatisticas.desconhecidos++;
        }
      } else if (tipoRegistro === '5') {
        campos = this.camposTrailerLote;
        this.estatisticas.trailerLote++;
      } else if (tipoRegistro === '9') {
        campos = this.camposTrailerArquivo;
        this.estatisticas.trailerArquivo++;
      } else {
        campos = [];
        this.estatisticas.desconhecidos++;
        this.erros.push({
          linha: idx + 1,
          campo: 'Tipo Registro',
          posicao: '8',
          valor: tipoRegistro,
          mensagem: `Tipo de registro desconhecido: "${tipoRegistro}"`
        });
      }

      if (line.length !== 240) {
        this.erros.push({
          linha: idx + 1,
          campo: 'Linha',
          posicao: '1-240',
          valor: `${line.length} caracteres`,
          mensagem: `Tamanho inválido. Esperado: 240, Encontrado: ${line.length}`
        });
      }

      for (const campo of campos) {
        const valor = line.slice(campo.ini, campo.fim);
        this.validarCampo(idx + 1, campo, valor);
      }
    }

    this.validarEstrutura();

    const todosCampos = [
      ...this.camposHeaderArquivo,
      ...this.camposHeaderLote,
      ...this.camposSegmentoT,
      ...this.camposSegmentoU,
      ...this.camposTrailerLote,
      ...this.camposTrailerArquivo
    ];
    this.legendaCampos = todosCampos.filter(
      (campo, index, self) => self.findIndex(c => c.nome === campo.nome) === index
    );

    const html = lines.map((line, idx) => this.lineToMatrix(line, idx)).join('');
    return html;
  }

  validarEstrutura(): void {
    if (!this.estatisticas) return;

    if (this.estatisticas.headerArquivo === 0) {
      this.erros.push({
        linha: 0,
        campo: 'Estrutura',
        posicao: '-',
        valor: '-',
        mensagem: 'Arquivo deve conter pelo menos um Header de Arquivo (Tipo 0)'
      });
    }

    if (this.estatisticas.trailerArquivo === 0) {
      this.erros.push({
        linha: 0,
        campo: 'Estrutura',
        posicao: '-',
        valor: '-',
        mensagem: 'Arquivo deve conter pelo menos um Trailer de Arquivo (Tipo 9)'
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

    if (!campo.obrigatorio && valorTrim === '') {
      return;
    }

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

    if (campo.formato === 'DDMMAAAA' && valorTrim !== '' && valorTrim !== '00000000') {
      if (valor.length === 8) {
        const dia = parseInt(valor.slice(0, 2));
        const mes = parseInt(valor.slice(2, 4));

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
    const tipoRegistro = line.charAt(7);
    const segmento = line.charAt(13);
    let campos: CampoLayout[];
    let tipoNome = '';
    let tipoColor = '';

    if (tipoRegistro === '0') {
      campos = this.camposHeaderArquivo;
      tipoNome = 'Header Arquivo';
      tipoColor = '#7b1fa2';
    } else if (tipoRegistro === '1') {
      campos = this.camposHeaderLote;
      tipoNome = 'Header Lote';
      tipoColor = '#f57c00';
    } else if (tipoRegistro === '3') {
      if (segmento === 'T') {
        campos = this.camposSegmentoT;
        tipoNome = 'Segmento T';
        tipoColor = '#388e3c';
      } else if (segmento === 'U') {
        campos = this.camposSegmentoU;
        tipoNome = 'Segmento U';
        tipoColor = '#00796b';
      } else {
        campos = [];
        tipoNome = 'Segmento ?';
        tipoColor = '#d32f2f';
      }
    } else if (tipoRegistro === '5') {
      campos = this.camposTrailerLote;
      tipoNome = 'Trailer Lote';
      tipoColor = '#5d4037';
    } else if (tipoRegistro === '9') {
      campos = this.camposTrailerArquivo;
      tipoNome = 'Trailer Arquivo';
      tipoColor = '#c2185b';
    } else {
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

    for (let i = 0; i < Math.min(line.length, 240); i++) {
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
