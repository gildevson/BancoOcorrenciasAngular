import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface LookupItem {
  codigo: string;
  descricao: string;
}

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
  lookup?: LookupItem[];
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

interface TotaisSingulareCcb {
  totalDetalhes: number;
  valorTotalTitulos: number;
  valorTotalPresente: number;
  valorTotalAbatimento: number;
  ocorrencia01: number;
  ocorrencia80: number;
  ccbs: number;
}

@Component({
  selector: 'app-singulare-ccb444-validador',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './singulare-ccb444-validador.component.html',
  styleUrls: ['./singulare-ccb444-validador.component.css']
})
export class SingulareCcb444ValidadorComponent implements OnDestroy {
  visualHtml: SafeHtml | null = null;
  error: string | null = null;
  erros: Erro[] = [];
  validado = false;
  campoSelecionado: string | null = null;
  conteudoArquivo: string = '';
  legendaCampos: CampoLayout[] = [];
  estatisticas: EstatisticasArquivo | null = null;

  editorPos: { top: number; left: number } | null = null;
  campoAtivo: CampoLayout | null = null;
  linhaAtiva: number = -1;
  valorCampoAtivo: string = '';
  statusBar: string = '';
  editorCarregando = false;
  aplicadoFeedback = false;
  totalEdicoes = 0;
  linhasEditadas: string[] = [];
  linhasOriginais: string[] = [];
  private _hlStyle: HTMLStyleElement | null = null;

  totaisSingulare: TotaisSingulareCcb | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnDestroy() {
    this._hlStyle?.remove();
  }

  // ============================================================
  // HEADER (TIPO 0) — Singulare CCB CNAB 444
  // ============================================================
  camposHeader: CampoLayout[] = [
    { nome: 'Tipo Registro', ini: 0, fim: 1, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['0'], cor: '#f8bbd0', descricao: 'Identificação do Registro (0)' },
    { nome: 'Ident. Arquivo', ini: 1, fim: 2, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['1'], cor: '#ffe082', descricao: 'Identificação Arquivo Remessa (1)' },
    { nome: 'Literal Remessa', ini: 2, fim: 9, tamanho: 7, tipo: 'A', obrigatorio: true, valores: ['REMESSA'], cor: '#b2dfdb', descricao: 'Literal REMESSA (7 pos)' },
    { nome: 'Cód. Serviço', ini: 9, fim: 11, tamanho: 2, tipo: 'N', obrigatorio: true, valores: ['01'], cor: '#c5cae9', descricao: 'Código Serviço — 01=Cobrança' },
    { nome: 'Literal Serviço', ini: 11, fim: 26, tamanho: 15, tipo: 'A', obrigatorio: true, valores: ['COBRANCA'], cor: '#e1bee7', descricao: 'Literal COBRANCA (15 pos)' },
    { nome: 'Cód. Originador', ini: 26, fim: 46, tamanho: 20, tipo: 'N', obrigatorio: true, cor: '#b3e5fc', descricao: 'Código Originador fornecido pelo banco (20 pos)' },
    { nome: 'Nome Originador', ini: 46, fim: 75, tamanho: 29, tipo: 'A', obrigatorio: true, cor: '#ffecb3', descricao: 'Razão Social do Originador (29 pos)' },
    { nome: 'Sigla Banco', ini: 75, fim: 76, tamanho: 1, tipo: 'A', obrigatorio: false, valores: ['S'], cor: '#e0e0e0', descricao: 'Sigla do Banco (1 pos) — S=Singulare' },
    { nome: 'Nº Banco', ini: 76, fim: 79, tamanho: 3, tipo: 'N', obrigatorio: true, valores: ['363'], cor: '#ffccbc', descricao: 'Número Banco Singulare — 363' },
    { nome: 'Nome Banco', ini: 79, fim: 94, tamanho: 15, tipo: 'A', obrigatorio: true, cor: '#dcedc8', descricao: 'Nome do Banco (15 pos)' },
    { nome: 'Data Gravação', ini: 94, fim: 100, tamanho: 6, tipo: 'N', obrigatorio: true, formato: 'DDMMAA', cor: '#fff9c4', descricao: 'Data da Gravação — DDMMAA' },
    { nome: 'Branco', ini: 100, fim: 108, tamanho: 8, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Branco (8 pos)' },
    { nome: 'Ident. Sistema', ini: 108, fim: 110, tamanho: 2, tipo: 'A', obrigatorio: true, valores: ['MX'], cor: '#b2ebf2', descricao: 'Identificação Sistema — MX' },
    { nome: 'Nº Seq. Arquivo', ini: 110, fim: 117, tamanho: 7, tipo: 'N', obrigatorio: true, cor: '#ffcdd2', descricao: 'Número Sequencial Arquivo (7 pos)' },
    { nome: 'Branco', ini: 117, fim: 438, tamanho: 321, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Branco (321 pos)' },
    { nome: 'Seq. Registro', ini: 438, fim: 444, tamanho: 6, tipo: 'N', obrigatorio: true, valores: ['000001'], cor: '#b2ebf2', descricao: 'Sequencial Registro — 000001' },
  ];

  // ============================================================
  // DETALHE (TIPO 1) — Singulare CCB CNAB 444
  // Espécie 70 = Cédula de Crédito Bancário (CCB)
  // Sacado → Tomador (terminologia CCB)
  // Seq. Registro ao final (pos 438-443), não pos 394-399
  // ============================================================
  camposDetalhe: CampoLayout[] = [
    { nome: 'Tipo Registro', ini: 0, fim: 1, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['1'], cor: '#f8bbd0', descricao: 'Identificação Registro (1)',
      lookup: [{ codigo: '1', descricao: 'Detalhe / Transação — 1 linha por CCB registrada' }]
    },
    { nome: 'Déb. Auto — Banco', ini: 1, fim: 4, tamanho: 3, tipo: 'N', obrigatorio: false, cor: '#e3f2fd', descricao: 'Débito Automático: Código do Banco do tomador (3 pos)' },
    { nome: 'Déb. Auto — Agência', ini: 4, fim: 9, tamanho: 5, tipo: 'N', obrigatorio: false, cor: '#e8f5e9', descricao: 'Débito Automático: Agência do tomador (5 pos)' },
    { nome: 'Déb. Auto — Conta C/C', ini: 9, fim: 19, tamanho: 10, tipo: 'N', obrigatorio: false, cor: '#fff8e1', descricao: 'Débito Automático: Conta Corrente do tomador (10 pos)' },
    { nome: 'Déb. Auto — Dígito', ini: 19, fim: 20, tamanho: 1, tipo: 'N', obrigatorio: false, cor: '#fce4ec', descricao: 'Débito Automático: Dígito verificador da conta (1 pos)',
      lookup: [
        { codigo: ' ', descricao: 'Branco — cobrança normal' },
        { codigo: '0–9', descricao: 'Dígito verificador (somente Débito Automático)' },
      ]
    },
    { nome: 'Coobrigação', ini: 20, fim: 22, tamanho: 2, tipo: 'N', obrigatorio: false, valores: ['01', '02'], cor: '#ffe082', descricao: '01=Com, 02=Sem Coobrigação',
      lookup: [
        { codigo: '01', descricao: 'Com Coobrigação' },
        { codigo: '02', descricao: 'Sem Coobrigação' },
      ]
    },
    { nome: 'Caract. Especial', ini: 22, fim: 24, tamanho: 2, tipo: 'N', obrigatorio: false, cor: '#fff9c4', descricao: 'Característica Especial — Anexo 8 SRC3040',
      lookup: [
        { codigo: '00', descricao: 'Sem Característica Especial' },
        { codigo: '01', descricao: 'FIDC — Crédito Comercial' },
        { codigo: '02', descricao: 'FIDC — Crédito Financeiro' },
        { codigo: '05', descricao: 'FIDC — Crédito Pessoal / Consignado' },
      ]
    },
    { nome: 'Modal. Operação', ini: 24, fim: 28, tamanho: 4, tipo: 'N', obrigatorio: false, cor: '#c5cae9', descricao: 'Modalidade Operação — Anexo 3 SRC3040 (4 pos)',
      lookup: [
        { codigo: '0000', descricao: 'Não Classificado / Padrão' },
        { codigo: '0401', descricao: 'Crédito Pessoal não Consignado' },
        { codigo: '0402', descricao: 'Crédito Pessoal Consignado — INSS' },
        { codigo: '0403', descricao: 'Crédito Pessoal Consignado — Setor Privado' },
        { codigo: '0404', descricao: 'Crédito Pessoal Consignado — Setor Público' },
      ]
    },
    { nome: 'Nat. Operação', ini: 28, fim: 30, tamanho: 2, tipo: 'N', obrigatorio: false, cor: '#e1bee7', descricao: 'Natureza Operação — Anexo 2 SRC3040',
      lookup: [
        { codigo: '00', descricao: 'Não Classificado / Padrão' },
        { codigo: '15', descricao: 'Repasse / CDC (Crédito Direto ao Consumidor)' },
        { codigo: '17', descricao: 'Empréstimo / Financiamento Geral' },
      ]
    },
    { nome: 'Origem Recurso', ini: 30, fim: 34, tamanho: 4, tipo: 'N', obrigatorio: false, cor: '#d1c4e9', descricao: 'Origem Recurso — Anexo 4 SRC3040 (4 pos)' },
    { nome: 'Classe Risco', ini: 34, fim: 36, tamanho: 2, tipo: 'A', obrigatorio: false, cor: '#ffcc80', descricao: 'Classificação de risco de crédito (AA=menor, H=maior)',
      lookup: [
        { codigo: 'AA', descricao: 'AA — Risco mínimo' },
        { codigo: 'A ', descricao: 'A  — Risco muito baixo' },
        { codigo: 'B ', descricao: 'B  — Risco baixo' },
        { codigo: 'C ', descricao: 'C  — Risco médio' },
        { codigo: 'D ', descricao: 'D  — Risco médio-alto (provisão 10%)' },
        { codigo: 'E ', descricao: 'E  — Risco alto (provisão 30%)' },
        { codigo: 'F ', descricao: 'F  — Risco muito alto (provisão 50%)' },
        { codigo: 'G ', descricao: 'G  — Risco muito alto (provisão 70%)' },
        { codigo: 'H ', descricao: 'H  — Risco máximo (provisão 100%)' },
      ]
    },
    { nome: 'Zeros', ini: 36, fim: 37, tamanho: 1, tipo: 'N', obrigatorio: false, cor: '#f5f5f5', descricao: 'Separador fixo (1 pos)' },
    { nome: 'Nº Controle', ini: 37, fim: 62, tamanho: 25, tipo: 'A', obrigatorio: true, cor: '#b3e5fc', descricao: 'Nº Controle Participante — Identificação da CCB (25 pos)' },
    { nome: 'Nº Banco', ini: 62, fim: 65, tamanho: 3, tipo: 'N', obrigatorio: true, cor: '#81d4fa', descricao: 'Número Banco (3 pos)' },
    { nome: 'Zeros', ini: 65, fim: 70, tamanho: 5, tipo: 'N', obrigatorio: true, cor: '#f5f5f5', descricao: 'Zeros (5 pos)' },
    { nome: 'Ident. Título', ini: 70, fim: 81, tamanho: 11, tipo: 'N', obrigatorio: false, cor: '#ffccbc', descricao: 'Identificação Título no Banco — Zeros na remessa (11 pos)' },
    { nome: 'Dígito N/N', ini: 81, fim: 82, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#ffab91', descricao: 'Dígito Nosso Número — Branco' },
    { nome: 'Valor Pago', ini: 82, fim: 92, tamanho: 10, tipo: 'N', obrigatorio: false, cor: '#4db6ac', descricao: 'Valor pago na liquidação (10 pos, 2 dec)' },
    { nome: 'Cond. Papeleta', ini: 92, fim: 93, tamanho: 1, tipo: 'N', obrigatorio: false, valores: ['1', '2', '3'], cor: '#e8eaf6', descricao: 'Condição de Emissão da Papeleta (1 pos)',
      lookup: [
        { codigo: '1', descricao: 'Banco emite e envia ao tomador' },
        { codigo: '2', descricao: 'Banco emite mas não envia ao tomador' },
        { codigo: '3', descricao: 'Cedente emite (auto-despacho)' },
      ]
    },
    { nome: 'Ident. Papeleta', ini: 93, fim: 94, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#f3e5f5', descricao: 'Identifica se emite papeleta para Débito Automático' },
    { nome: 'Data Liquidação', ini: 94, fim: 100, tamanho: 6, tipo: 'N', obrigatorio: false, formato: 'DDMMAA', cor: '#fff59d', descricao: 'Data Liquidação — DDMMAA' },
    { nome: 'Ident. Operação', ini: 100, fim: 104, tamanho: 4, tipo: 'A', obrigatorio: false, cor: '#e0f2f1', descricao: 'Nº/código interno da operação no banco (4 pos)' },
    { nome: 'Indic. Rateio', ini: 104, fim: 105, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#c8e6c9', descricao: 'Indicador Rateio Crédito — Branco' },
    { nome: 'Endereço Aviso', ini: 105, fim: 106, tamanho: 1, tipo: 'N', obrigatorio: false, cor: '#fff9c4', descricao: 'Endereçamento do Aviso de Débito (1 pos)',
      lookup: [
        { codigo: '1', descricao: 'Correio' },
        { codigo: '2', descricao: 'Eletrônico' },
        { codigo: '3', descricao: 'Não enviar aviso' },
      ]
    },
    { nome: 'Branco', ini: 106, fim: 108, tamanho: 2, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Branco (2 pos)' },
    { nome: 'Cód. Ocorrência', ini: 108, fim: 110, tamanho: 2, tipo: 'N', obrigatorio: true, valores: ['01', '04', '06', '14', '71', '72', '73', '74', '75', '76', '77', '80', '81', '84', '87'], cor: '#80deea', descricao: 'Código de ocorrência da remessa',
      lookup: [
        { codigo: '01', descricao: 'Remessa — entrada de CCB no banco' },
        { codigo: '04', descricao: 'Abatimento — redução de valor' },
        { codigo: '06', descricao: 'Alteração de vencimento' },
        { codigo: '14', descricao: 'Pagamento Parcial' },
        { codigo: '71', descricao: 'Baixa por Recompra (liq. consultoria)' },
        { codigo: '72', descricao: 'Recompra Parcial sem Adiantamento' },
        { codigo: '73', descricao: 'Recompra Parcial com Adiantamento' },
        { codigo: '74', descricao: 'Baixa por Recompra (liq. cedente)' },
        { codigo: '75', descricao: 'Baixa por Depósito Cedente' },
        { codigo: '76', descricao: 'Baixa por Depósito Consultoria' },
        { codigo: '77', descricao: 'Baixa por Depósito Tomador' },
        { codigo: '80', descricao: 'Remessa Singulare (liq. consultoria)' },
        { codigo: '81', descricao: 'Entrada por Recompra — troca de títulos' },
        { codigo: '84', descricao: 'Entrada por Recompra (liq. cedente)' },
        { codigo: '87', descricao: 'Reativação de título' },
      ]
    },
    { nome: 'Nº Documento', ini: 110, fim: 120, tamanho: 10, tipo: 'A', obrigatorio: true, cor: '#c5e1a5', descricao: 'Número do Documento (10 pos)' },
    { nome: 'Vencimento', ini: 120, fim: 126, tamanho: 6, tipo: 'N', obrigatorio: true, formato: 'DDMMAA', cor: '#fff9c4', descricao: 'Data Vencimento — DDMMAA' },
    { nome: 'Valor Título', ini: 126, fim: 139, tamanho: 13, tipo: 'N', obrigatorio: true, cor: '#ef9a9a', descricao: 'Valor do Título (13 pos, 2 dec)' },
    { nome: 'Banco Cobrança', ini: 139, fim: 142, tamanho: 3, tipo: 'N', obrigatorio: false, cor: '#b3e5fc', descricao: 'Banco Encarregado Cobrança (3 pos)' },
    { nome: 'Ag. Depositária', ini: 142, fim: 147, tamanho: 5, tipo: 'N', obrigatorio: false, cor: '#81d4fa', descricao: 'Agência Depositária (5 pos)' },
    { nome: 'Espécie Título', ini: 147, fim: 149, tamanho: 2, tipo: 'N', obrigatorio: true, valores: ['70', '01', '02', '51'], cor: '#bcaaa4', descricao: '70=CCB, 01=Duplicata, 02=NP, 51=Cheque',
      lookup: [
        { codigo: '70', descricao: 'Cédula de Crédito Bancário (CCB)' },
        { codigo: '01', descricao: 'Duplicata Mercantil' },
        { codigo: '02', descricao: 'Nota Promissória' },
        { codigo: '51', descricao: 'Cheque' },
      ]
    },
    { nome: 'Aceite', ini: 149, fim: 150, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#fce4ec', descricao: 'Aceite do Título (A=Aceite, N=Não aceite)' },
    { nome: 'Data Emissão', ini: 150, fim: 156, tamanho: 6, tipo: 'N', obrigatorio: true, formato: 'DDMMAA', cor: '#b2ebf2', descricao: 'Data Emissão — DDMMAA' },
    { nome: '1ª Instrução', ini: 156, fim: 158, tamanho: 2, tipo: 'N', obrigatorio: false, cor: '#b0bec5', descricao: 'Instrução de cobrança ao banco (2 pos)',
      lookup: [
        { codigo: '00', descricao: 'Sem instrução' },
        { codigo: '02', descricao: 'Devolver após N dias do vencimento' },
        { codigo: '06', descricao: 'Protestar após N dias corridos' },
        { codigo: '07', descricao: 'Não protestar' },
      ]
    },
    { nome: '2ª Instrução', ini: 158, fim: 159, tamanho: 1, tipo: 'N', obrigatorio: false, cor: '#90a4ae', descricao: 'Instrução complementar ao banco (1 pos)' },
    { nome: 'Insc. Est. Tomador', ini: 159, fim: 173, tamanho: 14, tipo: 'A', obrigatorio: false, cor: '#ffab91', descricao: 'Inscrição Estadual do Tomador (14 pos)' },
    { nome: 'Nº Termo Cessão', ini: 173, fim: 192, tamanho: 19, tipo: 'A', obrigatorio: false, cor: '#ff8a65', descricao: 'Número Termo Cessão (19 pos) — identificação da cessão FIDC' },
    { nome: 'Valor Presente', ini: 192, fim: 205, tamanho: 13, tipo: 'N', obrigatorio: true, cor: '#80cbc4', descricao: 'Valor Presente da Parcela (13 pos, 2 dec)' },
    { nome: 'Valor Abatimento', ini: 205, fim: 218, tamanho: 13, tipo: 'N', obrigatorio: false, cor: '#4db6ac', descricao: 'Valor Abatimento (13 pos, 2 dec)' },
    { nome: 'Tipo Insc. Tomador', ini: 218, fim: 220, tamanho: 2, tipo: 'N', obrigatorio: true, valores: ['01', '02'], cor: '#e0f7fa', descricao: '01=CPF, 02=CNPJ',
      lookup: [
        { codigo: '01', descricao: 'CPF (Pessoa Física)' },
        { codigo: '02', descricao: 'CNPJ (Pessoa Jurídica)' },
      ]
    },
    { nome: 'CPF/CNPJ Tomador', ini: 220, fim: 234, tamanho: 14, tipo: 'N', obrigatorio: true, cor: '#90caf9', descricao: 'Nº Inscrição do Tomador (14 pos)' },
    { nome: 'Nome do Tomador', ini: 234, fim: 274, tamanho: 40, tipo: 'A', obrigatorio: true, cor: '#ffcc80', descricao: 'Nome do Tomador da CCB (40 pos)' },
    { nome: 'Endereço Tomador', ini: 274, fim: 314, tamanho: 40, tipo: 'A', obrigatorio: true, cor: '#ffe0b2', descricao: 'Endereço Completo do Tomador (40 pos)' },
    { nome: 'Nº Doc. Referência', ini: 314, fim: 323, tamanho: 9, tipo: 'A', obrigatorio: false, cor: '#ce93d8', descricao: 'Número Documento de Referência (9 pos)' },
    { nome: 'Compl. Referência', ini: 323, fim: 326, tamanho: 3, tipo: 'A', obrigatorio: false, cor: '#ba68c8', descricao: 'Complemento do Documento de Referência (3 pos)' },
    { nome: 'CEP', ini: 326, fim: 334, tamanho: 8, tipo: 'N', obrigatorio: true, cor: '#c8e6c9', descricao: 'CEP do Tomador (8 pos)' },
    { nome: 'Nome Cedente', ini: 334, fim: 380, tamanho: 46, tipo: 'A', obrigatorio: true, cor: '#aed581', descricao: 'Nome do Cedente (46 pos)' },
    { nome: 'CNPJ Cedente', ini: 380, fim: 394, tamanho: 14, tipo: 'N', obrigatorio: true, cor: '#81c784', descricao: 'CNPJ do Cedente (14 pos)' },
    { nome: 'Branco', ini: 394, fim: 438, tamanho: 44, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Branco (44 pos)' },
    { nome: 'Seq. Registro', ini: 438, fim: 444, tamanho: 6, tipo: 'N', obrigatorio: true, cor: '#b2ebf2', descricao: 'Número Sequencial Registro (6 pos)' },
  ];

  // ============================================================
  // TRAILER (TIPO 9) — Singulare CCB CNAB 444
  // ============================================================
  camposTrailer: CampoLayout[] = [
    { nome: 'Tipo Registro', ini: 0, fim: 1, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['9'], cor: '#f8bbd0', descricao: 'Identificação Registro Trailer (9)' },
    { nome: 'Branco', ini: 1, fim: 438, tamanho: 437, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Branco (437 pos)' },
    { nome: 'Seq. Registro', ini: 438, fim: 444, tamanho: 6, tipo: 'N', obrigatorio: true, cor: '#b2ebf2', descricao: 'Número Sequencial Último Registro' },
  ];

  // ============================================================
  // CÓDIGOS DE OCORRÊNCIA
  // ============================================================
  codigosOcorrencia = [
    { codigo: '01', descricao: 'Remessa — Entrada de CCB' },
    { codigo: '04', descricao: 'Abatimento — mediante justificativa' },
    { codigo: '06', descricao: 'Alteração de Vencimento' },
    { codigo: '14', descricao: 'Pagamento Parcial' },
    { codigo: '71', descricao: 'Baixa por Recompra (liq. consultoria)' },
    { codigo: '72', descricao: 'Recompra Parcial sem Adiantamento' },
    { codigo: '73', descricao: 'Recompra Parcial com Adiantamento' },
    { codigo: '74', descricao: 'Baixa por Recompra (liq. cedente)' },
    { codigo: '75', descricao: 'Baixa por Depósito Cedente' },
    { codigo: '76', descricao: 'Baixa por Depósito Consultoria' },
    { codigo: '77', descricao: 'Baixa por Depósito Tomador' },
    { codigo: '80', descricao: 'Remessa Singulare (liq. consultoria)' },
    { codigo: '81', descricao: 'Entrada por Recompra — troca de títulos' },
    { codigo: '84', descricao: 'Entrada por Recompra (liq. cedente)' },
    { codigo: '87', descricao: 'Reativação' },
  ];

  get campoEhOcorrencia(): boolean {
    const nome = this.campoAtivo?.nome?.toLowerCase() ?? '';
    return nome.includes('ocorrência') || nome.includes('ocorrencia') || nome.includes('ocorr');
  }

  get descricaoOcorrencia(): string {
    return this.codigosOcorrencia.find(o => o.codigo === this.valorCampoAtivo.trim())?.descricao ?? '';
  }

  selecionarOcorrencia(codigo: string): void {
    this.valorCampoAtivo = codigo;
  }

  get campoTemLookup(): boolean {
    return !!this.campoAtivo?.lookup?.length && !this.campoEhOcorrencia;
  }

  get descricaoLookupAtual(): string {
    if (!this.campoAtivo?.lookup) return '';
    return this.campoAtivo.lookup.find(l => l.codigo === this.valorCampoAtivo.trim())?.descricao ?? '';
  }

  get lookupAtivo(): LookupItem[] {
    return this.campoAtivo?.lookup ?? [];
  }

  selecionarLookupItem(codigo: string): void {
    this.valorCampoAtivo = codigo;
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
      .cnab-mw .cnab-mc.${cls} { opacity: 1 !important; outline: 2px solid #00695c !important; outline-offset: -1px; }
    `;
    document.head.appendChild(this._hlStyle);
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
    this.totaisSingulare = null;

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
        this.error = 'Erro ao processar o arquivo. Verifique se é um arquivo CNAB 444 válido.';
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
    if (detalhes.length === 0) { this.totaisSingulare = null; return; }

    let valorTotalTitulos = 0;
    let valorTotalPresente = 0;
    let valorTotalAbatimento = 0;
    let ocorrencia01 = 0, ocorrencia80 = 0;
    let ccbs = 0;

    for (const l of detalhes) {
      valorTotalTitulos    += parseInt(l.substring(126, 139) || '0', 10);
      valorTotalPresente   += parseInt(l.substring(192, 205) || '0', 10);
      valorTotalAbatimento += parseInt(l.substring(205, 218) || '0', 10);

      const ocorr = l.substring(108, 110).trim();
      if (ocorr === '01') ocorrencia01++;
      if (ocorr === '80') ocorrencia80++;

      const especie = l.substring(147, 149).trim();
      if (especie === '70') ccbs++;
    }

    this.totaisSingulare = {
      totalDetalhes: detalhes.length,
      valorTotalTitulos,
      valorTotalPresente,
      valorTotalAbatimento,
      ocorrencia01,
      ocorrencia80,
      ccbs,
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
    let linhaAntes = this.linhasEditadas[this.linhaAtiva];
    if (linhaAntes.length < campo.ini) {
      linhaAntes = linhaAntes.padEnd(campo.ini, ' ');
    }
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

  gerarCcb(): void {
    const conteudo = this.linhasEditadas.join('\r\n');
    const bytes = new Uint8Array(conteudo.length);
    for (let i = 0; i < conteudo.length; i++) {
      bytes[i] = conteudo.charCodeAt(i) & 0xff;
    }
    const blob = new Blob([bytes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'remessa_singulare_ccb_editada.TXT';
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

      if (line.length !== 444) {
        this.erros.push({
          linha: idx + 1,
          campo: 'Linha',
          posicao: `1-${line.length}`,
          valor: `${line.length} caracteres`,
          mensagem: `Tamanho inválido. Esperado: 444 (CNAB 444 Singulare), Encontrado: ${line.length}`,
          severidade: 'erro'
        });
      }

      for (const campo of campos) {
        const valor = line.slice(campo.ini, campo.fim);
        this.validarCampo(idx + 1, campo, valor);
      }

      const seqCampo = campos.find(c => c.nome === 'Seq. Registro');
      if (seqCampo && line.length >= 444) {
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
    if (this.estatisticas.detalhes === 0) {
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
      this.erros.push({ linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor,
        mensagem: 'Campo obrigatório está vazio', severidade: 'erro' });
      return;
    }

    if (!campo.obrigatorio && valorTrim === '') return;

    if (campo.tipo === 'N' && valorTrim !== '') {
      if (valor.includes(' ')) {
        this.erros.push({ linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor,
          mensagem: 'Campo numérico contém espaços. Deve ser preenchido com zeros à esquerda.', severidade: 'erro' });
      }
      if (!/^\d+$/.test(valor)) {
        this.erros.push({ linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor,
          mensagem: 'Deve conter apenas números (0-9)', severidade: 'erro' });
      }
    }

    if (campo.valores && valorTrim !== '') {
      if (!campo.valores.includes(valorTrim)) {
        this.erros.push({ linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor,
          mensagem: `Valor inválido. Valores permitidos: ${campo.valores.join(', ')}`, severidade: 'erro' });
      }
    }

    if (campo.formato === 'DDMMAA' && valorTrim !== '' && valorTrim !== '000000') {
      if (valor.length === 6 && /^\d{6}$/.test(valor)) {
        const dia = parseInt(valor.slice(0, 2), 10);
        const mes = parseInt(valor.slice(2, 4), 10);
        if (dia < 1 || dia > 31) {
          this.erros.push({ linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor,
            mensagem: `Dia inválido: ${dia}`, severidade: 'erro' });
        }
        if (mes < 1 || mes > 12) {
          this.erros.push({ linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor,
            mensagem: `Mês inválido: ${mes}`, severidade: 'erro' });
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
      case '0': campos = this.camposHeader;  tipoNome = 'Header';       tipoColor = '#00695c'; break;
      case '1': campos = this.camposDetalhe; tipoNome = 'CCB / Detalhe'; tipoColor = '#0277bd'; break;
      case '9': campos = this.camposTrailer; tipoNome = 'Trailer';      tipoColor = '#4527a0'; break;
      default:  campos = [];                 tipoNome = 'Desconhecido'; tipoColor = '#d32f2f';
    }

    const renderLen = Math.min(Math.max(line.length, 444), 444);

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

    for (let i = 0; i < renderLen; i++) {
      const currentLine = this.linhasEditadas[lineIdx] ?? line;
      const char = i < currentLine.length ? currentLine[i] : ' ';
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
