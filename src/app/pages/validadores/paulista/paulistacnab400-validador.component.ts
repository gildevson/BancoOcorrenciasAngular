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

interface TotaisPaulista {
  totalDetalhes: number;
  valorTotalTitulos: number;
  valorTotalPresente: number;
  valorTotalAbatimento: number;
  ocorrencia01: number;
  ocorrencia04: number;
  ocorrencia06: number;
  duplicatas: number;
  notasPromissorias: number;
  cheques: number;
}

@Component({
  selector: 'app-paulista-cnab400-validador',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './paulistacnab400-validador.component.html',
  styleUrls: ['./paulistacnab400-validador.component.css']
})
export class PaulistaCnab400ValidadorComponent implements OnDestroy {
  visualHtml: SafeHtml | null = null;
  error: string | null = null;
  erros: Erro[] = [];
  validado = false;
  campoSelecionado: string | null = null;
  conteudoArquivo: string = '';
  legendaCampos: CampoLayout[] = [];
  estatisticas: EstatisticasArquivo | null = null;

  // Edição
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

  // Totais
  totaisPaulista: TotaisPaulista | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnDestroy() {
    this._hlStyle?.remove();
  }

  // ========================================
  // LAYOUT HEADER (TIPO 0) - CONFORME DOCUMENTAÇÃO OFICIAL
  // ========================================
  camposHeader: CampoLayout[] = [
    { nome: 'Tipo Registro', ini: 0, fim: 1, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['0'], cor: '#f8bbd0', descricao: 'Identificação do Registro (0)' },
    { nome: 'Ident. Arquivo', ini: 1, fim: 2, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['1'], cor: '#ffe082', descricao: 'Identificação Arquivo Remessa (1)' },
    { nome: 'Literal Remessa', ini: 2, fim: 9, tamanho: 7, tipo: 'A', obrigatorio: true, valores: ['REMESSA'], cor: '#b2dfdb', descricao: 'Literal REMESSA (7 pos)' },
    { nome: 'Cód. Serviço', ini: 9, fim: 11, tamanho: 2, tipo: 'N', obrigatorio: true, valores: ['01'], cor: '#c5cae9', descricao: 'Código Serviço - 01=Cobrança' },
    { nome: 'Literal Serviço', ini: 11, fim: 26, tamanho: 15, tipo: 'A', obrigatorio: true, valores: ['COBRANCA'], cor: '#e1bee7', descricao: 'Literal COBRANCA (15 pos)' },
    { nome: 'Cód. Originador', ini: 26, fim: 46, tamanho: 20, tipo: 'N', obrigatorio: true, cor: '#b3e5fc', descricao: 'Código Originador fornecido pelo banco (20 pos)' },
    { nome: 'Nome Originador', ini: 46, fim: 76, tamanho: 30, tipo: 'A', obrigatorio: true, cor: '#ffecb3', descricao: 'Razão Social do Originador (30 pos)' },
    { nome: 'Nº Banco', ini: 76, fim: 79, tamanho: 3, tipo: 'N', obrigatorio: true, valores: ['611'], cor: '#ffccbc', descricao: 'Número Banco Paulista - 611' },
    { nome: 'Nome Banco', ini: 79, fim: 94, tamanho: 15, tipo: 'A', obrigatorio: true, valores: ['PAULISTA S.A.'], cor: '#dcedc8', descricao: 'Nome do Banco (15 pos)' },
    { nome: 'Data Gravação', ini: 94, fim: 100, tamanho: 6, tipo: 'N', obrigatorio: true, formato: 'DDMMAA', cor: '#fff9c4', descricao: 'Data da Gravação - DDMMAA' },
    { nome: 'Branco', ini: 100, fim: 108, tamanho: 8, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Branco (8 pos)' },
    { nome: 'Ident. Sistema', ini: 108, fim: 110, tamanho: 2, tipo: 'A', obrigatorio: true, valores: ['MX'], cor: '#b2ebf2', descricao: 'Identificação Sistema - MX' },
    { nome: 'Nº Seq. Arquivo', ini: 110, fim: 117, tamanho: 7, tipo: 'N', obrigatorio: true, cor: '#ffcdd2', descricao: 'Número Sequencial Arquivo (7 pos)' },
    { nome: 'Branco', ini: 117, fim: 394, tamanho: 277, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Branco (277 pos)' },
    { nome: 'Seq. Registro', ini: 394, fim: 400, tamanho: 6, tipo: 'N', obrigatorio: true, valores: ['000001'], cor: '#b2ebf2', descricao: 'Sequencial Registro - 000001' },
  ];

  // ========================================
  // LAYOUT DETALHE (TIPO 1) - CONFORME DOCUMENTAÇÃO OFICIAL
  // TODOS OS 47 CAMPOS MAPEADOS CORRETAMENTE
  // ========================================
  camposDetalhe: CampoLayout[] = [
    { nome: 'Tipo Registro', ini: 0, fim: 1, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['1'], cor: '#f8bbd0', descricao: 'Identificação Registro (1)' },
    { nome: 'Déb. Auto — Banco', ini: 1, fim: 4, tamanho: 3, tipo: 'N', obrigatorio: false, cor: '#e3f2fd', descricao: 'Débito Automático: Código do Banco do sacado (3 pos) — Branco para cobrança normal' },
    { nome: 'Déb. Auto — Agência', ini: 4, fim: 9, tamanho: 5, tipo: 'N', obrigatorio: false, cor: '#e8f5e9', descricao: 'Débito Automático: Agência do sacado (5 pos) — Branco para cobrança normal' },
    { nome: 'Déb. Auto — Conta C/C', ini: 9, fim: 19, tamanho: 10, tipo: 'N', obrigatorio: false, cor: '#fff8e1', descricao: 'Débito Automático: Conta Corrente do sacado (10 pos) — Branco para cobrança normal' },
    { nome: 'Déb. Auto — Dígito', ini: 19, fim: 20, tamanho: 1, tipo: 'N', obrigatorio: false, cor: '#fce4ec', descricao: 'Débito Automático: Dígito verificador da conta (1 pos) — Branco para cobrança normal' },
    { nome: 'Coobrigação', ini: 20, fim: 22, tamanho: 2, tipo: 'N', obrigatorio: false, valores: ['01', '02'], cor: '#ffe082', descricao: '01=Com, 02=Sem Coobrigação',
      lookup: [
        { codigo: '01', descricao: 'Com Coobrigação' },
        { codigo: '02', descricao: 'Sem Coobrigação' },
      ]
    },
    { nome: 'Caract. Especial', ini: 22, fim: 24, tamanho: 2, tipo: 'N', obrigatorio: false, cor: '#fff9c4', descricao: 'Característica Especial - Anexo 8 SRC3040' },
    { nome: 'Modal. Operação', ini: 24, fim: 28, tamanho: 4, tipo: 'N', obrigatorio: false, cor: '#c5cae9', descricao: 'Modalidade Operação - Anexo 3 SRC3040 (4 pos)' },
    { nome: 'Nat. Operação', ini: 28, fim: 30, tamanho: 2, tipo: 'N', obrigatorio: false, cor: '#e1bee7', descricao: 'Natureza Operação - Anexo 2 SRC3040' },
    { nome: 'Origem Recurso', ini: 30, fim: 34, tamanho: 4, tipo: 'N', obrigatorio: false, cor: '#d1c4e9', descricao: 'Origem Recurso - Anexo 4 SRC3040 (4 pos)' },
    { nome: 'Classe Risco', ini: 34, fim: 36, tamanho: 2, tipo: 'A', obrigatorio: false, valores: ['AA','A ','B ','C ','D ','E ','F ','G ','H '], cor: '#ffcc80', descricao: 'Classificação de risco de crédito do título (Resolução CMN 2.682/99 — Anexo 17 SRC3040). AA=menor risco, H=maior risco.',
      lookup: [
        { codigo: 'AA', descricao: 'AA — Risco mínimo (melhor classificação)' },
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
    { nome: 'Zeros', ini: 36, fim: 37, tamanho: 1, tipo: 'N', obrigatorio: false, cor: '#f5f5f5', descricao: 'Separador de alinhamento (1 pos) — byte fixo entre Classe Risco e Nº Controle. Sempre 0, sem significado de negócio.' },
    { nome: 'Nº Controle', ini: 37, fim: 62, tamanho: 25, tipo: 'A', obrigatorio: true, cor: '#b3e5fc', descricao: 'Nº Controle Participante - Ident. título (25 pos)' },
    { nome: 'Nº Banco', ini: 62, fim: 65, tamanho: 3, tipo: 'N', obrigatorio: true, cor: '#81d4fa', descricao: 'Número Banco (obrig. se Espécie=Cheque, senão 000)' },
    { nome: 'Zeros', ini: 65, fim: 70, tamanho: 5, tipo: 'N', obrigatorio: true, cor: '#f5f5f5', descricao: 'Zeros (5 pos)' },
    { nome: 'Ident. Título', ini: 70, fim: 81, tamanho: 11, tipo: 'N', obrigatorio: false, cor: '#ffccbc', descricao: 'Identificação Título no Banco - Branco (11 pos)' },
    { nome: 'Dígito N/N', ini: 81, fim: 82, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#ffab91', descricao: 'Dígito Nosso Número - Branco' },
    { nome: 'Valor Pago', ini: 82, fim: 92, tamanho: 10, tipo: 'N', obrigatorio: false, cor: '#4db6ac', descricao: 'Valor pago na liquidação/baixa (10 pos, 2 dec)' },
    { nome: 'Cond. Papeleta', ini: 92, fim: 93, tamanho: 1, tipo: 'N', obrigatorio: false, valores: ['1', '2', '3'], cor: '#e8eaf6', descricao: 'Condição de Emissão da Papeleta/Boleto (1 pos) — indica quem emite e envia o boleto ao sacado.',
      lookup: [
        { codigo: '1', descricao: 'Banco emite e envia ao sacado' },
        { codigo: '2', descricao: 'Banco emite mas não envia ao sacado' },
        { codigo: '3', descricao: 'Cedente emite (auto-despacho)' },
      ]
    },
    { nome: 'Ident. Papeleta', ini: 93, fim: 94, tamanho: 1, tipo: 'A', obrigatorio: false, valores: ['S', 'N'], cor: '#f3e5f5', descricao: 'Identifica se emite papeleta para títulos com Débito Automático (1 pos).',
      lookup: [
        { codigo: 'S', descricao: 'Sim — emite papeleta para Débito Automático' },
        { codigo: 'N', descricao: 'Não — não emite papeleta' },
      ]
    },
    { nome: 'Data Liquidação', ini: 94, fim: 100, tamanho: 6, tipo: 'N', obrigatorio: false, formato: 'DDMMAA', cor: '#fff59d', descricao: 'Data Liquidação - DDMMAA (somente p/ liquidação)' },
    { nome: 'Ident. Operação', ini: 100, fim: 104, tamanho: 4, tipo: 'A', obrigatorio: false, cor: '#e0f2f1', descricao: 'Número/código interno da operação no banco (4 pos) — identifica o tipo de operação para fins de controle bancário. Branco no Paulista para cobrança padrão.' },
    { nome: 'Indic. Rateio', ini: 104, fim: 105, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#c8e6c9', descricao: 'Indicador Rateio Crédito - Branco' },
    { nome: 'Endereço Aviso', ini: 105, fim: 106, tamanho: 1, tipo: 'N', obrigatorio: false, valores: ['1', '2', '3'], cor: '#fff9c4', descricao: 'Endereçamento do Aviso de Débito ao sacado (1 pos).',
      lookup: [
        { codigo: '1', descricao: 'Correio — aviso enviado pelo banco via correio' },
        { codigo: '2', descricao: 'Eletrônico — aviso enviado via e-mail/EDI' },
        { codigo: '3', descricao: 'Não enviar aviso ao sacado' },
      ]
    },
    { nome: 'Branco', ini: 106, fim: 108, tamanho: 2, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Branco (2 pos)' },
    { nome: 'Cód. Ocorrência', ini: 108, fim: 110, tamanho: 2, tipo: 'N', obrigatorio: true, valores: ['01','04','06','14','71','72','73','74','75','76','77','80','81','84','87'], cor: '#80deea', descricao: 'Código de ocorrência da remessa — instrução que o cedente envia ao banco.',
      lookup: [
        { codigo: '01', descricao: 'Remessa — entrada de título no banco' },
        { codigo: '04', descricao: 'Abatimento — redução de valor (mediante justificativa)' },
        { codigo: '06', descricao: 'Alteração de vencimento — para conciliação' },
        { codigo: '14', descricao: 'Pagamento Parcial' },
        { codigo: '71', descricao: 'Baixa por Recompra Paulista — com liquidação consultoria' },
        { codigo: '72', descricao: 'Recompra Parcial sem Adiantamento' },
        { codigo: '73', descricao: 'Recompra Parcial com Adiantamento' },
        { codigo: '74', descricao: 'Baixa por Recompra — com liquidação cedente' },
        { codigo: '75', descricao: 'Baixa por Depósito Cedente' },
        { codigo: '76', descricao: 'Baixa por Depósito Consultoria' },
        { codigo: '77', descricao: 'Baixa por Depósito Sacado' },
        { codigo: '80', descricao: 'Remessa Paulista — com liquidação consultoria' },
        { codigo: '81', descricao: 'Entrada por Recompra — troca de títulos' },
        { codigo: '84', descricao: 'Entrada por Recompra — com liquidação cedente' },
        { codigo: '87', descricao: 'Reativação de título' },
      ]
    },
    { nome: 'Nº Documento', ini: 110, fim: 120, tamanho: 10, tipo: 'A', obrigatorio: true, cor: '#c5e1a5', descricao: 'Número do Documento (10 pos)' },
    { nome: 'Vencimento', ini: 120, fim: 126, tamanho: 6, tipo: 'N', obrigatorio: true, formato: 'DDMMAA', cor: '#fff9c4', descricao: 'Data Vencimento Título - DDMMAA' },
    { nome: 'Valor Título', ini: 126, fim: 139, tamanho: 13, tipo: 'N', obrigatorio: true, cor: '#ef9a9a', descricao: 'Valor do Título (13 pos, 2 dec) - sem ponto/vírgula' },
    { nome: 'Banco Cobrança', ini: 139, fim: 142, tamanho: 3, tipo: 'N', obrigatorio: false, cor: '#b3e5fc', descricao: 'Banco Encarregado Cobrança - ou 000 (3 pos)' },
    { nome: 'Ag. Depositária', ini: 142, fim: 147, tamanho: 5, tipo: 'N', obrigatorio: false, cor: '#81d4fa', descricao: 'Agência Depositária - ou 00000 (5 pos)' },
    { nome: 'Espécie Título', ini: 147, fim: 149, tamanho: 2, tipo: 'N', obrigatorio: true, valores: ['01', '02', '51'], cor: '#bcaaa4', descricao: '01=Duplicata, 02=NP, 51=Cheque',
      lookup: [
        { codigo: '01', descricao: 'Duplicata Mercantil' },
        { codigo: '02', descricao: 'Nota Promissória' },
        { codigo: '51', descricao: 'Cheque' },
      ]
    },
    { nome: 'Aceite', ini: 149, fim: 150, tamanho: 1, tipo: 'A', obrigatorio: false, valores: ['A', 'N'], cor: '#fce4ec', descricao: 'Aceite do Título (1 pos): A=Sacado aceitou/assinou o título, N=Não aceite. Branco no Paulista (não utilizado).',
      lookup: [
        { codigo: 'A', descricao: 'Aceite — sacado assinou/aceitou o título' },
        { codigo: 'N', descricao: 'Não Aceite — título sem aceite formal do sacado' },
      ]
    },
    { nome: 'Data Emissão', ini: 150, fim: 156, tamanho: 6, tipo: 'N', obrigatorio: true, formato: 'DDMMAA', cor: '#b2ebf2', descricao: 'Data Emissão Título - DDMMAA' },
    { nome: '1ª Instrução', ini: 156, fim: 158, tamanho: 2, tipo: 'N', obrigatorio: false, valores: ['00', '02', '06', '07'], cor: '#b0bec5', descricao: 'Instrução de cobrança ao banco (2 pos) — o que o banco deve fazer caso o título não seja pago.',
      lookup: [
        { codigo: '00', descricao: 'Sem instrução — banco mantém o título em carteira' },
        { codigo: '02', descricao: 'Devolver após N dias do vencimento' },
        { codigo: '06', descricao: 'Protestar após N dias corridos do vencimento' },
        { codigo: '07', descricao: 'Não protestar' },
      ]
    },
    { nome: '2ª Instrução', ini: 158, fim: 159, tamanho: 1, tipo: 'N', obrigatorio: false, valores: ['0', '1', '2', '3'], cor: '#90a4ae', descricao: 'Instrução complementar ao banco (1 pos) — complementa a 1ª Instrução indicando tipo de prazo ou ação adicional.',
      lookup: [
        { codigo: '0', descricao: 'Sem instrução complementar' },
        { codigo: '1', descricao: 'Prazo em dias corridos (complementa instrução com prazo)' },
        { codigo: '2', descricao: 'Prazo em dias úteis (complementa instrução com prazo)' },
        { codigo: '3', descricao: 'Não cobrar mora/multa após vencimento' },
      ]
    },
    { nome: 'Insc. Est. Sacado', ini: 159, fim: 173, tamanho: 14, tipo: 'A', obrigatorio: false, cor: '#ffab91', descricao: 'Inscrição Estadual Sacado (14 pos) - Obrig. p/ Duplicata' },
    { nome: 'Nº Termo Cessão', ini: 173, fim: 192, tamanho: 19, tipo: 'A', obrigatorio: false, cor: '#ff8a65', descricao: 'Número Termo Cessão (19 pos) - Obrig. p/ Duplicata' },
    { nome: 'Valor Presente', ini: 192, fim: 205, tamanho: 13, tipo: 'N', obrigatorio: true, cor: '#80cbc4', descricao: 'Valor Presente Parcela (13 pos, 2 dec)' },
    { nome: 'Valor Abatimento', ini: 205, fim: 218, tamanho: 13, tipo: 'N', obrigatorio: false, cor: '#4db6ac', descricao: 'Valor Abatimento (13 pos, 2 dec)' },
    { nome: 'Tipo Insc. Sacado', ini: 218, fim: 220, tamanho: 2, tipo: 'N', obrigatorio: true, valores: ['01', '02'], cor: '#e0f7fa', descricao: '01=CPF, 02=CNPJ',
      lookup: [
        { codigo: '01', descricao: 'CPF (Pessoa Física)' },
        { codigo: '02', descricao: 'CNPJ (Pessoa Jurídica)' },
      ]
    },
    { nome: 'CPF/CNPJ Sacado', ini: 220, fim: 234, tamanho: 14, tipo: 'N', obrigatorio: true, cor: '#90caf9', descricao: 'Nº Inscrição Sacado (14 pos) - alinhado à direita' },
    { nome: 'Nome Sacado', ini: 234, fim: 274, tamanho: 40, tipo: 'A', obrigatorio: true, cor: '#ffcc80', descricao: 'Nome do Sacado (40 pos)' },
    { nome: 'Endereço Sacado', ini: 274, fim: 314, tamanho: 40, tipo: 'A', obrigatorio: true, cor: '#ffe0b2', descricao: 'Endereço Completo Sacado (40 pos)' },
    { nome: 'Nº NF Duplicata', ini: 314, fim: 323, tamanho: 9, tipo: 'A', obrigatorio: false, cor: '#ce93d8', descricao: 'Número NF Duplicata (9 pos) - Obrig. p/ Duplicata' },
    { nome: 'Série NF', ini: 323, fim: 326, tamanho: 3, tipo: 'A', obrigatorio: false, cor: '#ba68c8', descricao: 'Número Série NF Duplicata (3 pos) - Obrig. p/ Duplicata' },
    { nome: 'CEP', ini: 326, fim: 334, tamanho: 8, tipo: 'N', obrigatorio: true, cor: '#c8e6c9', descricao: 'CEP do Sacado (8 pos)' },
    { nome: 'Nome Cedente', ini: 334, fim: 380, tamanho: 46, tipo: 'A', obrigatorio: true, cor: '#aed581', descricao: 'Nome do Cedente (46 pos) - 335 a 380' },
    { nome: 'CNPJ Cedente', ini: 380, fim: 394, tamanho: 14, tipo: 'N', obrigatorio: true, cor: '#81c784', descricao: 'CNPJ do Cedente (14 pos) - 381 a 394' },
    { nome: 'Seq. Registro', ini: 394, fim: 400, tamanho: 6, tipo: 'N', obrigatorio: true, cor: '#b2ebf2', descricao: 'Número Sequencial Registro' },
    { nome: 'Chave NFe', ini: 400, fim: 444, tamanho: 44, tipo: 'N', obrigatorio: false, cor: '#c8e6c9', descricao: 'Chave de Acesso da NF-e (44 dígitos) — extensão Frontis pos 401-444' },
  ];

  // ========================================
  // LAYOUT TRAILER (TIPO 9) - CONFORME DOCUMENTAÇÃO OFICIAL
  // ========================================
  camposTrailer: CampoLayout[] = [
    { nome: 'Tipo Registro', ini: 0, fim: 1, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['9'], cor: '#f8bbd0', descricao: 'Identificação Registro Trailer (9)' },
    { nome: 'Branco', ini: 1, fim: 394, tamanho: 393, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Branco (393 pos)' },
    { nome: 'Seq. Registro', ini: 394, fim: 400, tamanho: 6, tipo: 'N', obrigatorio: true, cor: '#b2ebf2', descricao: 'Número Sequencial Último Registro' },
  ];

  // ========================================
  // CÓDIGOS DE OCORRÊNCIA
  // ========================================
  codigosOcorrencia = [
    { codigo: '01', descricao: 'Remessa — Entrada de título' },
    { codigo: '04', descricao: 'Abatimento — mediante justificativa' },
    { codigo: '06', descricao: 'Alteração de Vencimento' },
    { codigo: '14', descricao: 'Pagamento Parcial' },
    { codigo: '71', descricao: 'Baixa por Recompra Paulista (liq. consultoria)' },
    { codigo: '72', descricao: 'Recompra Parcial sem Adiantamento' },
    { codigo: '73', descricao: 'Recompra Parcial com Adiantamento' },
    { codigo: '74', descricao: 'Baixa por Recompra (liq. cedente)' },
    { codigo: '75', descricao: 'Baixa por Depósito Cedente' },
    { codigo: '76', descricao: 'Baixa por Depósito Consultoria' },
    { codigo: '77', descricao: 'Baixa por Depósito Sacado' },
    { codigo: '80', descricao: 'Remessa Paulista (liq. consultoria)' },
    { codigo: '81', descricao: 'Entrada por Recompra — troca de títulos' },
    { codigo: '84', descricao: 'Entrada por Recompra (liq. cedente)' },
    { codigo: '87', descricao: 'Reativação' },
  ];

  get campoEhOcorrencia(): boolean {
    const nome = this.campoAtivo?.nome?.toLowerCase() ?? '';
    return nome.includes('ocorrência') || nome.includes('ocorrencia') || nome.includes('ocorr');
  }

  get descricaoOcorrencia(): string {
    const item = this.codigosOcorrencia.find(o => o.codigo === this.valorCampoAtivo.trim());
    return item?.descricao ?? '';
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
      .cnab-mw .cnab-mc.${cls} { opacity: 1 !important; outline: 2px solid #1565c0 !important; outline-offset: -1px; }
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
    this.totaisPaulista = null;

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
    if (detalhes.length === 0) { this.totaisPaulista = null; return; }

    let valorTotalTitulos = 0;
    let valorTotalPresente = 0;
    let valorTotalAbatimento = 0;
    let ocorrencia01 = 0, ocorrencia04 = 0, ocorrencia06 = 0;
    let duplicatas = 0, notasPromissorias = 0, cheques = 0;

    for (const l of detalhes) {
      valorTotalTitulos   += parseInt(l.substring(126, 139) || '0', 10);
      valorTotalPresente  += parseInt(l.substring(192, 205) || '0', 10);
      valorTotalAbatimento += parseInt(l.substring(205, 218) || '0', 10);

      const ocorr = l.substring(108, 110).trim();
      if (ocorr === '01') ocorrencia01++;
      if (ocorr === '04') ocorrencia04++;
      if (ocorr === '06') ocorrencia06++;

      const especie = l.substring(147, 149).trim();
      if (especie === '01') duplicatas++;
      if (especie === '02') notasPromissorias++;
      if (especie === '51') cheques++;
    }

    this.totaisPaulista = {
      totalDetalhes: detalhes.length,
      valorTotalTitulos,
      valorTotalPresente,
      valorTotalAbatimento,
      ocorrencia01,
      ocorrencia04,
      ocorrencia06,
      duplicatas,
      notasPromissorias,
      cheques,
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
    // Garante que a linha tem pelo menos campo.ini chars antes de inserir (extensão 444)
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
    a.download = 'remessa_paulista_editada.REM';
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

      // Aceita 400 ou 444 caracteres (extensão Frontis)
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

    const maxLen = Math.max(line.length, 400);
    const renderLen = Math.min(maxLen, 444);

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

      let cor: string;
      let nomeCampo: string;

      if (campo) {
        cor = campo.cor;
        nomeCampo = campo.nome;
      } else if (i >= 400) {
        cor = '#e8f5e9'; // Verde claro — extensão Frontis
        nomeCampo = `Campo Extra (pos ${i + 1})`;
      } else {
        cor = '#f5f5f5';
        nomeCampo = 'N/D';
      }

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
