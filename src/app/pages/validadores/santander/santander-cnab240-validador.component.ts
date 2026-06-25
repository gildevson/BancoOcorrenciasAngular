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
  headersArquivo: number;
  headersLote: number;
  segmentosP: number;
  segmentosQ: number;
  segmentosR: number;
  trailersLote: number;
  trailersArquivo: number;
  desconhecidos: number;
}

@Component({
  selector: 'app-santander-cnab240-validador',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './santander-cnab240-validador.component.html',
  styleUrls: ['./santander-cnab240-validador.component.css']
})
export class SantanderCnab240ValidadorComponent implements OnDestroy {
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
  editorPos: { top: number; left: number } | null = null;
  editorCarregando: boolean = false;
  aplicadoFeedback: boolean = false;
  totalEdicoes: number = 0;

  totaisRemessa: {
    totalTitulos: number;
    valorTotal: number;
    comDesconto: number;
    semDesconto: number;
  } | null = null;

  private _hlStyle: HTMLStyleElement | null = null;

  // ================================================
  // HEADER DE ARQUIVO (Tipo 0) — 240 bytes
  // ================================================
  camposHeaderArquivo: CampoLayout[] = [
    { nome: 'Código do Banco', ini: 0, fim: 3, tamanho: 3, tipo: 'N', obrigatorio: true, valores: ['033'], cor: '#ef9a9a', descricao: 'Santander = 033' },
    { nome: 'Lote de Serviço', ini: 3, fim: 7, tamanho: 4, tipo: 'N', obrigatorio: true, valores: ['0000'], cor: '#ffe082', descricao: '0000 no header de arquivo' },
    { nome: 'Tipo de Registro', ini: 7, fim: 8, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['0'], cor: '#f8bbd0', descricao: 'Tipo 0 — Header de Arquivo' },
    { nome: 'Uso FEBRABAN', ini: 8, fim: 17, tamanho: 9, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos (9 pos)' },
    { nome: 'Tipo de Inscrição', ini: 17, fim: 18, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['1', '2'], valoresDescricao: { '1': 'CPF — Pessoa Física', '2': 'CNPJ — Pessoa Jurídica' }, cor: '#ffe082', descricao: '1=CPF · 2=CNPJ' },
    { nome: 'Número de Inscrição (CNPJ/CPF)', ini: 18, fim: 32, tamanho: 14, tipo: 'N', obrigatorio: true, cor: '#b2dfdb', descricao: 'CNPJ ou CPF (14 pos)' },
    { nome: 'Código do Convênio', ini: 32, fim: 52, tamanho: 20, tipo: 'A', obrigatorio: true, cor: '#c5cae9', descricao: 'Código do cedente no Santander (20 pos)' },
    { nome: 'Agência', ini: 52, fim: 57, tamanho: 5, tipo: 'N', obrigatorio: true, cor: '#b3e5fc', descricao: 'Agência com dígito (5 pos)' },
    { nome: 'Dígito Verificador da Agência', ini: 57, fim: 58, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#81d4fa', descricao: 'Dígito verificador' },
    { nome: 'Conta Corrente', ini: 58, fim: 70, tamanho: 12, tipo: 'N', obrigatorio: true, cor: '#a5d6a7', descricao: 'Conta sem dígito (12 pos)' },
    { nome: 'Dígito Verificador da Conta', ini: 70, fim: 71, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#81c784', descricao: 'Dígito verificador' },
    { nome: 'Dígito Ag/Conta', ini: 71, fim: 72, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#66bb6a', descricao: 'Dígito combinado ag/conta' },
    { nome: 'Nome da Empresa', ini: 72, fim: 102, tamanho: 30, tipo: 'A', obrigatorio: true, cor: '#ffccbc', descricao: 'Razão social (30 pos)' },
    { nome: 'Nome do Banco', ini: 102, fim: 132, tamanho: 30, tipo: 'A', obrigatorio: true, cor: '#ffab91', descricao: 'SANTANDER + brancos (30 pos)' },
    { nome: 'Uso FEBRABAN', ini: 132, fim: 142, tamanho: 10, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos (10 pos)' },
    { nome: 'Código Remessa/Retorno', ini: 142, fim: 143, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['1'], valoresDescricao: { '1': 'Remessa', '2': 'Retorno' }, cor: '#80deea', descricao: '1 = Remessa' },
    { nome: 'Data de Geração', ini: 143, fim: 151, tamanho: 8, tipo: 'N', obrigatorio: true, formato: 'DDMMAAAA', cor: '#fff9c4', descricao: 'DDMMAAAA' },
    { nome: 'Hora de Geração', ini: 151, fim: 157, tamanho: 6, tipo: 'N', obrigatorio: true, cor: '#fff59d', descricao: 'HHMMSS' },
    { nome: 'Nº Sequencial do Arquivo', ini: 157, fim: 163, tamanho: 6, tipo: 'N', obrigatorio: true, cor: '#ce93d8', descricao: 'Sequencial crescente' },
    { nome: 'Versão do Layout', ini: 163, fim: 166, tamanho: 3, tipo: 'N', obrigatorio: true, valores: ['089'], cor: '#f48fb1', descricao: '089 = FEBRABAN versão atual' },
    { nome: 'Densidade de Gravação', ini: 166, fim: 171, tamanho: 5, tipo: 'N', obrigatorio: false, cor: '#e0e0e0', descricao: '01600 ou 06250' },
    { nome: 'Uso Banco Reservado', ini: 171, fim: 191, tamanho: 20, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos (20 pos)' },
    { nome: 'Uso Empresa Reservado', ini: 191, fim: 211, tamanho: 20, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos (20 pos)' },
    { nome: 'Uso FEBRABAN', ini: 211, fim: 240, tamanho: 29, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos (29 pos)' },
  ];

  // ================================================
  // HEADER DE LOTE (Tipo 1) — 240 bytes
  // ================================================
  camposHeaderLote: CampoLayout[] = [
    { nome: 'Código do Banco', ini: 0, fim: 3, tamanho: 3, tipo: 'N', obrigatorio: true, valores: ['033'], cor: '#ef9a9a', descricao: 'Santander = 033' },
    { nome: 'Lote de Serviço', ini: 3, fim: 7, tamanho: 4, tipo: 'N', obrigatorio: true, cor: '#ffe082', descricao: 'Número do lote (0001, 0002…)' },
    { nome: 'Tipo de Registro', ini: 7, fim: 8, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['1'], cor: '#f8bbd0', descricao: 'Tipo 1 — Header de Lote' },
    { nome: 'Tipo de Operação', ini: 8, fim: 9, tamanho: 1, tipo: 'A', obrigatorio: true, valores: ['R'], valoresDescricao: { 'R': 'Remessa', 'T': 'Retorno' }, cor: '#80deea', descricao: 'R = Remessa' },
    { nome: 'Tipo de Serviço', ini: 9, fim: 11, tamanho: 2, tipo: 'N', obrigatorio: true, valores: ['01'], valoresDescricao: { '01': 'Cobrança' }, cor: '#c5cae9', descricao: '01 = Cobrança' },
    { nome: 'Forma de Lançamento', ini: 11, fim: 13, tamanho: 2, tipo: 'N', obrigatorio: true, cor: '#e1bee7', descricao: '01 = Crédito em C/C' },
    { nome: 'Versão do Layout do Lote', ini: 13, fim: 16, tamanho: 3, tipo: 'N', obrigatorio: true, valores: ['040'], cor: '#f48fb1', descricao: '040' },
    { nome: 'Uso Banco', ini: 16, fim: 17, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Branco' },
    { nome: 'Tipo de Inscrição', ini: 17, fim: 18, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['1', '2'], valoresDescricao: { '1': 'CPF — Pessoa Física', '2': 'CNPJ — Pessoa Jurídica' }, cor: '#ffe082', descricao: '1=CPF · 2=CNPJ' },
    { nome: 'Número de Inscrição (CNPJ/CPF)', ini: 18, fim: 32, tamanho: 14, tipo: 'N', obrigatorio: true, cor: '#b2dfdb', descricao: 'CNPJ ou CPF' },
    { nome: 'Código do Convênio', ini: 32, fim: 52, tamanho: 20, tipo: 'A', obrigatorio: true, cor: '#c5cae9', descricao: 'Código do cedente (20 pos)' },
    { nome: 'Agência', ini: 52, fim: 57, tamanho: 5, tipo: 'N', obrigatorio: true, cor: '#b3e5fc', descricao: 'Agência (5 pos)' },
    { nome: 'Dígito Agência', ini: 57, fim: 58, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#81d4fa', descricao: 'Dígito' },
    { nome: 'Conta Corrente', ini: 58, fim: 70, tamanho: 12, tipo: 'N', obrigatorio: true, cor: '#a5d6a7', descricao: 'Conta (12 pos)' },
    { nome: 'Dígito Conta', ini: 70, fim: 71, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#81c784', descricao: 'Dígito' },
    { nome: 'Dígito Ag/Conta', ini: 71, fim: 72, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#66bb6a', descricao: 'Dígito combinado' },
    { nome: 'Nome da Empresa', ini: 72, fim: 102, tamanho: 30, tipo: 'A', obrigatorio: true, cor: '#ffccbc', descricao: 'Razão social (30 pos)' },
    { nome: 'Informação 1', ini: 102, fim: 142, tamanho: 40, tipo: 'A', obrigatorio: false, cor: '#e3f2fd', descricao: 'Mensagem livre (40 pos)' },
    { nome: 'Informação 2', ini: 142, fim: 182, tamanho: 40, tipo: 'A', obrigatorio: false, cor: '#e8eaf6', descricao: 'Mensagem livre (40 pos)' },
    { nome: 'Nº da Remessa', ini: 182, fim: 192, tamanho: 10, tipo: 'N', obrigatorio: false, cor: '#ce93d8', descricao: 'Sequencial da remessa (10 pos)' },
    { nome: 'Data de Gravação', ini: 192, fim: 200, tamanho: 8, tipo: 'N', obrigatorio: false, formato: 'DDMMAAAA', cor: '#fff9c4', descricao: 'DDMMAAAA' },
    { nome: 'Data do Crédito', ini: 200, fim: 208, tamanho: 8, tipo: 'N', obrigatorio: false, formato: 'DDMMAAAA', cor: '#fff59d', descricao: 'DDMMAAAA' },
    { nome: 'Uso Banco', ini: 208, fim: 240, tamanho: 32, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos (32 pos)' },
  ];

  // ================================================
  // SEGMENTO P (Tipo 3) — Dados do Título — 240 bytes
  // ================================================
  camposSegP: CampoLayout[] = [
    { nome: 'Código do Banco', ini: 0, fim: 3, tamanho: 3, tipo: 'N', obrigatorio: true, valores: ['033'], cor: '#ef9a9a', descricao: 'Santander = 033' },
    { nome: 'Lote de Serviço', ini: 3, fim: 7, tamanho: 4, tipo: 'N', obrigatorio: true, cor: '#ffe082', descricao: 'Número do lote' },
    { nome: 'Tipo de Registro', ini: 7, fim: 8, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['3'], cor: '#f8bbd0', descricao: 'Tipo 3 — Detalhe' },
    { nome: 'Nº Seq. Reg. no Lote', ini: 8, fim: 13, tamanho: 5, tipo: 'N', obrigatorio: true, cor: '#ffe082', descricao: 'Sequencial dentro do lote' },
    { nome: 'Segmento', ini: 13, fim: 14, tamanho: 1, tipo: 'A', obrigatorio: true, valores: ['P'], cor: '#1565c0', descricao: 'P — Dados do Título' },
    { nome: 'Uso Banco', ini: 14, fim: 15, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Branco' },
    { nome: 'Código do Movimento', ini: 15, fim: 17, tamanho: 2, tipo: 'N', obrigatorio: true, cor: '#80deea', descricao: '01=Entrada · 02=Baixa · 06=Alt.Venc. · etc.' },
    { nome: 'Agência', ini: 17, fim: 22, tamanho: 5, tipo: 'N', obrigatorio: true, cor: '#b3e5fc', descricao: 'Agência do cedente' },
    { nome: 'Dígito Agência', ini: 22, fim: 23, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#81d4fa', descricao: 'Dígito verificador' },
    { nome: 'Conta Corrente', ini: 23, fim: 35, tamanho: 12, tipo: 'N', obrigatorio: true, cor: '#a5d6a7', descricao: 'Conta do cedente (12 pos)' },
    { nome: 'Dígito Conta', ini: 35, fim: 36, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#81c784', descricao: 'Dígito verificador' },
    { nome: 'Dígito Ag/Conta', ini: 36, fim: 37, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#66bb6a', descricao: 'Dígito combinado' },
    { nome: 'Nosso Número', ini: 37, fim: 57, tamanho: 20, tipo: 'N', obrigatorio: true, cor: '#ffccbc', descricao: 'Nosso número completo (20 pos)' },
    { nome: 'Código da Carteira', ini: 57, fim: 58, tamanho: 1, tipo: 'N', obrigatorio: true, cor: '#ce93d8', descricao: 'Carteira de cobrança' },
    { nome: 'Forma de Cadastro do Título', ini: 58, fim: 59, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['1', '2'], valoresDescricao: { '1': 'Com registro no banco', '2': 'Sem registro (sem boleto)' }, cor: '#ba68c8', descricao: '1=Com registro · 2=Sem registro' },
    { nome: 'Tipo de Documento', ini: 59, fim: 60, tamanho: 1, tipo: 'N', obrigatorio: false, valores: ['1', '2'], valoresDescricao: { '1': 'Tradicional', '2': 'Escritural' }, cor: '#9c27b0', descricao: '1=Tradicional · 2=Escritural' },
    { nome: 'Emissão do Bloqueto', ini: 60, fim: 61, tamanho: 1, tipo: 'N', obrigatorio: false, valores: ['1', '2'], valoresDescricao: { '1': 'Banco emite o boleto', '2': 'Empresa emite o boleto' }, cor: '#e1bee7', descricao: '1=Banco emite · 2=Empresa emite' },
    { nome: 'Distribuição do Bloqueto', ini: 61, fim: 62, tamanho: 1, tipo: 'N', obrigatorio: false, valores: ['1', '2'], valoresDescricao: { '1': 'Banco distribui', '2': 'Empresa distribui' }, cor: '#d1c4e9', descricao: '1=Banco distribui · 2=Empresa distribui' },
    { nome: 'Número do Documento', ini: 62, fim: 77, tamanho: 15, tipo: 'A', obrigatorio: false, cor: '#e1bee7', descricao: 'Seu Número / Nº do documento (15 pos)' },
    { nome: 'Data de Vencimento', ini: 77, fim: 85, tamanho: 8, tipo: 'N', obrigatorio: true, formato: 'DDMMAAAA', cor: '#fff9c4', descricao: 'DDMMAAAA' },
    { nome: 'Valor Nominal do Título', ini: 85, fim: 100, tamanho: 15, tipo: 'N', obrigatorio: true, cor: '#ef9a9a', descricao: 'Centavos (sem vírgula, 15 pos)' },
    { nome: 'Agência Cobradora', ini: 100, fim: 105, tamanho: 5, tipo: 'N', obrigatorio: false, cor: '#ffcdd2', descricao: '00033 = Santander' },
    { nome: 'Dígito Agência Cobradora', ini: 105, fim: 106, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Branco' },
    { nome: 'Espécie do Título', ini: 106, fim: 108, tamanho: 2, tipo: 'N', obrigatorio: false, cor: '#bcaaa4', descricao: '01=DM, 02=NP, 05=RC, 09=DS, 99=Outros' },
    { nome: 'Aceite', ini: 108, fim: 109, tamanho: 1, tipo: 'A', obrigatorio: false, valores: ['A', 'N'], valoresDescricao: { 'A': 'Aceite', 'N': 'Não aceite' }, cor: '#d7ccc8', descricao: 'A=Aceite · N=Não aceite' },
    { nome: 'Data de Emissão', ini: 109, fim: 117, tamanho: 8, tipo: 'N', obrigatorio: true, formato: 'DDMMAAAA', cor: '#fff59d', descricao: 'DDMMAAAA' },
    { nome: 'Código 1ª Instrução', ini: 117, fim: 119, tamanho: 2, tipo: 'N', obrigatorio: false, cor: '#a5d6a7', descricao: '00=Sem instrução · 43=Protestar · 46=Devolver · etc.' },
    { nome: 'Código 2ª Instrução', ini: 119, fim: 121, tamanho: 2, tipo: 'N', obrigatorio: false, cor: '#80cbc4', descricao: 'Complemento da 1ª instrução' },
    { nome: 'Valor de Mora/Juros', ini: 121, fim: 134, tamanho: 13, tipo: 'N', obrigatorio: false, cor: '#ffab91', descricao: 'Centavos por dia de atraso (13 pos)' },
    { nome: 'Data Limite para Desconto', ini: 134, fim: 142, tamanho: 8, tipo: 'N', obrigatorio: false, formato: 'DDMMAAAA', cor: '#c8e6c9', descricao: 'DDMMAAAA (00000000 = sem desconto)' },
    { nome: 'Valor do Desconto 1', ini: 142, fim: 157, tamanho: 15, tipo: 'N', obrigatorio: false, cor: '#a5d6a7', descricao: 'Centavos (15 pos)' },
    { nome: 'Valor do IOF', ini: 157, fim: 172, tamanho: 15, tipo: 'N', obrigatorio: false, cor: '#4db6ac', descricao: 'Centavos (15 pos)' },
    { nome: 'Valor do Abatimento', ini: 172, fim: 187, tamanho: 15, tipo: 'N', obrigatorio: false, cor: '#80cbc4', descricao: 'Centavos (15 pos)' },
    { nome: 'ID do Título na Empresa', ini: 187, fim: 202, tamanho: 15, tipo: 'A', obrigatorio: false, cor: '#b2ebf2', descricao: 'Identificação opcional na empresa (15 pos)' },
    { nome: 'Código para Protesto', ini: 202, fim: 203, tamanho: 1, tipo: 'N', obrigatorio: false, valores: ['1', '2', '3'], valoresDescricao: { '1': 'Protestar', '2': 'Devolver', '3': 'Não protestar' }, cor: '#ffcdd2', descricao: '1=Protestar · 2=Devolver · 3=Não protestar' },
    { nome: 'Prazo para Protesto', ini: 203, fim: 205, tamanho: 2, tipo: 'N', obrigatorio: false, cor: '#ffb3b3', descricao: 'Nº de dias para protesto' },
    { nome: 'Código Baixa/Devolução', ini: 205, fim: 206, tamanho: 1, tipo: 'N', obrigatorio: false, valores: ['1', '2'], valoresDescricao: { '1': 'Baixar automaticamente', '2': 'Devolver' }, cor: '#f48fb1', descricao: '1=Baixar · 2=Devolver' },
    { nome: 'Prazo para Baixa', ini: 206, fim: 209, tamanho: 3, tipo: 'N', obrigatorio: false, cor: '#f8bbd0', descricao: 'Nº de dias para baixa' },
    { nome: 'Código da Moeda', ini: 209, fim: 212, tamanho: 3, tipo: 'N', obrigatorio: true, valores: ['009'], valoresDescricao: { '009': 'Real (BRL)' }, cor: '#b0bec5', descricao: '009 = Real' },
    { nome: 'Número do Contrato', ini: 212, fim: 222, tamanho: 10, tipo: 'N', obrigatorio: false, cor: '#e0e0e0', descricao: 'Nº contrato (opcional, 10 pos)' },
    { nome: 'Uso Banco', ini: 222, fim: 223, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Branco' },
    { nome: 'Uso Banco', ini: 223, fim: 240, tamanho: 17, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos (17 pos)' },
  ];

  // ================================================
  // SEGMENTO Q (Tipo 3) — Dados do Pagador — 240 bytes
  // ================================================
  camposSegQ: CampoLayout[] = [
    { nome: 'Código do Banco', ini: 0, fim: 3, tamanho: 3, tipo: 'N', obrigatorio: true, valores: ['033'], cor: '#ef9a9a', descricao: 'Santander = 033' },
    { nome: 'Lote de Serviço', ini: 3, fim: 7, tamanho: 4, tipo: 'N', obrigatorio: true, cor: '#ffe082', descricao: 'Número do lote' },
    { nome: 'Tipo de Registro', ini: 7, fim: 8, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['3'], cor: '#f8bbd0', descricao: 'Tipo 3 — Detalhe' },
    { nome: 'Nº Seq. Reg. no Lote', ini: 8, fim: 13, tamanho: 5, tipo: 'N', obrigatorio: true, cor: '#ffe082', descricao: 'Sequencial' },
    { nome: 'Segmento', ini: 13, fim: 14, tamanho: 1, tipo: 'A', obrigatorio: true, valores: ['Q'], cor: '#2e7d32', descricao: 'Q — Dados do Pagador' },
    { nome: 'Uso Banco', ini: 14, fim: 15, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Branco' },
    { nome: 'Código do Movimento', ini: 15, fim: 17, tamanho: 2, tipo: 'N', obrigatorio: true, cor: '#80deea', descricao: 'Mesmo código do Segmento P' },
    { nome: 'Tipo de Inscrição Pagador', ini: 17, fim: 18, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['1', '2'], valoresDescricao: { '1': 'CPF — Pessoa Física', '2': 'CNPJ — Pessoa Jurídica' }, cor: '#ffe082', descricao: '1=CPF · 2=CNPJ' },
    { nome: 'CNPJ/CPF do Pagador', ini: 18, fim: 32, tamanho: 14, tipo: 'N', obrigatorio: true, cor: '#b2dfdb', descricao: 'CNPJ ou CPF (14 pos)' },
    { nome: 'Nome do Pagador', ini: 32, fim: 72, tamanho: 40, tipo: 'A', obrigatorio: true, cor: '#ffccbc', descricao: 'Razão social ou nome (40 pos)' },
    { nome: 'Endereço do Pagador', ini: 72, fim: 112, tamanho: 40, tipo: 'A', obrigatorio: false, cor: '#ffe0b2', descricao: 'Logradouro e número (40 pos)' },
    { nome: 'Bairro do Pagador', ini: 112, fim: 127, tamanho: 15, tipo: 'A', obrigatorio: false, cor: '#e1bee7', descricao: 'Bairro (15 pos)' },
    { nome: 'CEP do Pagador', ini: 127, fim: 132, tamanho: 5, tipo: 'N', obrigatorio: false, cor: '#c8e6c9', descricao: 'Parte inicial do CEP' },
    { nome: 'Sufixo CEP', ini: 132, fim: 135, tamanho: 3, tipo: 'N', obrigatorio: false, cor: '#a5d6a7', descricao: 'Complemento do CEP' },
    { nome: 'Cidade do Pagador', ini: 135, fim: 150, tamanho: 15, tipo: 'A', obrigatorio: false, cor: '#dcedc8', descricao: 'Cidade (15 pos)' },
    { nome: 'UF do Pagador', ini: 150, fim: 152, tamanho: 2, tipo: 'A', obrigatorio: false, cor: '#c5e1a5', descricao: 'Sigla do estado' },
    { nome: 'Tipo Inscrição Sacador', ini: 152, fim: 153, tamanho: 1, tipo: 'N', obrigatorio: false, valores: ['0', '1', '2'], valoresDescricao: { '0': 'Isento / Não informado', '1': 'CPF', '2': 'CNPJ' }, cor: '#fff9c4', descricao: '0=Isento · 1=CPF · 2=CNPJ' },
    { nome: 'CNPJ/CPF do Sacador', ini: 153, fim: 167, tamanho: 14, tipo: 'N', obrigatorio: false, cor: '#ffe082', descricao: 'Sacador/avalista (14 pos)' },
    { nome: 'Nome do Sacador/Avalista', ini: 167, fim: 207, tamanho: 40, tipo: 'A', obrigatorio: false, cor: '#fff3e0', descricao: 'Nome sacador (40 pos)' },
    { nome: 'Banco Correspondente', ini: 207, fim: 210, tamanho: 3, tipo: 'N', obrigatorio: false, cor: '#e0e0e0', descricao: 'Banco correspondente (se houver)' },
    { nome: 'Nosso Nº Banco Correspondente', ini: 210, fim: 232, tamanho: 22, tipo: 'A', obrigatorio: false, cor: '#eeeeee', descricao: 'Nosso número no banco corr. (22 pos)' },
    { nome: 'Uso FEBRABAN', ini: 232, fim: 240, tamanho: 8, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos (8 pos)' },
  ];

  // ================================================
  // SEGMENTO R (Tipo 3) — Informações Complementares — 240 bytes
  // ================================================
  camposSegR: CampoLayout[] = [
    { nome: 'Código do Banco', ini: 0, fim: 3, tamanho: 3, tipo: 'N', obrigatorio: true, valores: ['033'], cor: '#ef9a9a', descricao: 'Santander = 033' },
    { nome: 'Lote de Serviço', ini: 3, fim: 7, tamanho: 4, tipo: 'N', obrigatorio: true, cor: '#ffe082', descricao: 'Número do lote' },
    { nome: 'Tipo de Registro', ini: 7, fim: 8, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['3'], cor: '#f8bbd0', descricao: 'Tipo 3 — Detalhe' },
    { nome: 'Nº Seq. Reg. no Lote', ini: 8, fim: 13, tamanho: 5, tipo: 'N', obrigatorio: true, cor: '#ffe082', descricao: 'Sequencial' },
    { nome: 'Segmento', ini: 13, fim: 14, tamanho: 1, tipo: 'A', obrigatorio: true, valores: ['R'], cor: '#bf360c', descricao: 'R — Informações Complementares' },
    { nome: 'Uso Banco', ini: 14, fim: 15, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Branco' },
    { nome: 'Código do Movimento', ini: 15, fim: 17, tamanho: 2, tipo: 'N', obrigatorio: true, cor: '#80deea', descricao: 'Mesmo do Seg. P' },
    { nome: 'Código do Desconto 2', ini: 17, fim: 18, tamanho: 1, tipo: 'N', obrigatorio: false, valores: ['0', '1', '2'], valoresDescricao: { '0': 'Sem desconto', '1': 'Valor fixo', '2': 'Percentual' }, cor: '#b2dfdb', descricao: '0=Sem · 1=Valor fixo · 2=Percentual' },
    { nome: 'Data do Desconto 2', ini: 18, fim: 26, tamanho: 8, tipo: 'N', obrigatorio: false, formato: 'DDMMAAAA', cor: '#fff9c4', descricao: 'DDMMAAAA' },
    { nome: 'Valor do Desconto 2', ini: 26, fim: 41, tamanho: 15, tipo: 'N', obrigatorio: false, cor: '#a5d6a7', descricao: 'Centavos (15 pos)' },
    { nome: 'Código do Desconto 3', ini: 41, fim: 42, tamanho: 1, tipo: 'N', obrigatorio: false, valores: ['0', '1', '2'], valoresDescricao: { '0': 'Sem desconto', '1': 'Valor fixo', '2': 'Percentual' }, cor: '#80cbc4', descricao: '0=Sem · 1=Valor fixo · 2=Percentual' },
    { nome: 'Data do Desconto 3', ini: 42, fim: 50, tamanho: 8, tipo: 'N', obrigatorio: false, formato: 'DDMMAAAA', cor: '#fff59d', descricao: 'DDMMAAAA' },
    { nome: 'Valor do Desconto 3', ini: 50, fim: 65, tamanho: 15, tipo: 'N', obrigatorio: false, cor: '#4db6ac', descricao: 'Centavos (15 pos)' },
    { nome: 'Código da Multa', ini: 65, fim: 66, tamanho: 1, tipo: 'N', obrigatorio: false, valores: ['0', '1', '2'], valoresDescricao: { '0': 'Sem multa', '1': 'Valor fixo em reais', '2': 'Percentual' }, cor: '#ffab91', descricao: '0=Sem multa · 1=Valor fixo · 2=Percentual' },
    { nome: 'Data da Multa', ini: 66, fim: 74, tamanho: 8, tipo: 'N', obrigatorio: false, formato: 'DDMMAAAA', cor: '#ffe0b2', descricao: 'DDMMAAAA' },
    { nome: 'Valor da Multa', ini: 74, fim: 89, tamanho: 15, tipo: 'N', obrigatorio: false, cor: '#ffccbc', descricao: 'Centavos ou percentual (15 pos)' },
    { nome: 'Informação ao Pagador 1', ini: 89, fim: 99, tamanho: 10, tipo: 'A', obrigatorio: false, cor: '#e3f2fd', descricao: 'Mensagem livre (10 pos)' },
    { nome: 'Informação ao Pagador 2', ini: 99, fim: 139, tamanho: 40, tipo: 'A', obrigatorio: false, cor: '#e8eaf6', descricao: 'Mensagem livre (40 pos)' },
    { nome: 'Informação ao Pagador 3', ini: 139, fim: 179, tamanho: 40, tipo: 'A', obrigatorio: false, cor: '#ede7f6', descricao: 'Mensagem livre (40 pos)' },
    { nome: 'Uso Banco', ini: 179, fim: 199, tamanho: 20, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos (20 pos)' },
    { nome: 'Cód. Ocorrência Pagador', ini: 199, fim: 207, tamanho: 8, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Uso banco (8 pos)' },
    { nome: 'Banco para Débito', ini: 207, fim: 210, tamanho: 3, tipo: 'N', obrigatorio: false, cor: '#e0e0e0', descricao: 'Banco débito automático' },
    { nome: 'Agência para Débito', ini: 210, fim: 215, tamanho: 5, tipo: 'N', obrigatorio: false, cor: '#eeeeee', descricao: 'Agência débito automático' },
    { nome: 'Dígito Agência Débito', ini: 215, fim: 216, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Dígito' },
    { nome: 'Conta para Débito', ini: 216, fim: 228, tamanho: 12, tipo: 'N', obrigatorio: false, cor: '#e8f5e9', descricao: 'Conta débito automático (12 pos)' },
    { nome: 'Dígito Conta Débito', ini: 228, fim: 229, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#c8e6c9', descricao: 'Dígito' },
    { nome: 'Dígito Ag/Conta Débito', ini: 229, fim: 230, tamanho: 1, tipo: 'A', obrigatorio: false, cor: '#a5d6a7', descricao: 'Dígito combinado' },
    { nome: 'Aviso ao Debitado', ini: 230, fim: 231, tamanho: 1, tipo: 'N', obrigatorio: false, valores: ['0', '1'], valoresDescricao: { '0': 'Sem aviso', '1': 'Enviar aviso por carta' }, cor: '#dcedc8', descricao: '0=Sem aviso · 1=Enviar aviso' },
    { nome: 'Uso FEBRABAN', ini: 231, fim: 240, tamanho: 9, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos (9 pos)' },
  ];

  // ================================================
  // TRAILER DE LOTE (Tipo 5) — 240 bytes
  // ================================================
  camposTrailerLote: CampoLayout[] = [
    { nome: 'Código do Banco', ini: 0, fim: 3, tamanho: 3, tipo: 'N', obrigatorio: true, valores: ['033'], cor: '#ef9a9a', descricao: 'Santander = 033' },
    { nome: 'Lote de Serviço', ini: 3, fim: 7, tamanho: 4, tipo: 'N', obrigatorio: true, cor: '#ffe082', descricao: 'Número do lote' },
    { nome: 'Tipo de Registro', ini: 7, fim: 8, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['5'], cor: '#f8bbd0', descricao: 'Tipo 5 — Trailer de Lote' },
    { nome: 'Uso Banco', ini: 8, fim: 17, tamanho: 9, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos' },
    { nome: 'Qtd. Registros do Lote', ini: 17, fim: 23, tamanho: 6, tipo: 'N', obrigatorio: true, cor: '#b2dfdb', descricao: 'Total de reg. tipo 3 + 2' },
    { nome: 'Qtd. Títulos do Lote', ini: 23, fim: 29, tamanho: 6, tipo: 'N', obrigatorio: false, cor: '#a5d6a7', descricao: 'Total de boletos no lote' },
    { nome: 'Valor Total dos Títulos', ini: 29, fim: 47, tamanho: 18, tipo: 'N', obrigatorio: false, cor: '#ef9a9a', descricao: 'Soma dos valores em centavos (18 pos)' },
    { nome: 'Qtd. Moeda', ini: 47, fim: 65, tamanho: 18, tipo: 'N', obrigatorio: false, cor: '#f5f5f5', descricao: 'Zeros (18 pos)' },
    { nome: 'Nº Aviso de Lançamento', ini: 65, fim: 77, tamanho: 12, tipo: 'N', obrigatorio: false, cor: '#f5f5f5', descricao: 'Zeros (12 pos)' },
    { nome: 'Uso FEBRABAN', ini: 77, fim: 230, tamanho: 153, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos (153 pos)' },
    { nome: 'Ocorrências', ini: 230, fim: 240, tamanho: 10, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos (10 pos)' },
  ];

  // ================================================
  // TRAILER DE ARQUIVO (Tipo 9) — 240 bytes
  // ================================================
  camposTrailerArquivo: CampoLayout[] = [
    { nome: 'Código do Banco', ini: 0, fim: 3, tamanho: 3, tipo: 'N', obrigatorio: true, valores: ['033'], cor: '#ef9a9a', descricao: 'Santander = 033' },
    { nome: 'Lote de Serviço', ini: 3, fim: 7, tamanho: 4, tipo: 'N', obrigatorio: true, valores: ['9999'], cor: '#ffe082', descricao: '9999 no trailer de arquivo' },
    { nome: 'Tipo de Registro', ini: 7, fim: 8, tamanho: 1, tipo: 'N', obrigatorio: true, valores: ['9'], cor: '#f8bbd0', descricao: 'Tipo 9 — Trailer de Arquivo' },
    { nome: 'Uso FEBRABAN', ini: 8, fim: 17, tamanho: 9, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos' },
    { nome: 'Qtd. de Lotes', ini: 17, fim: 23, tamanho: 6, tipo: 'N', obrigatorio: true, cor: '#b2dfdb', descricao: 'Total de lotes do arquivo' },
    { nome: 'Qtd. de Registros', ini: 23, fim: 29, tamanho: 6, tipo: 'N', obrigatorio: true, cor: '#a5d6a7', descricao: 'Total de registros do arquivo' },
    { nome: 'Qtd. de Contas Concil.', ini: 29, fim: 35, tamanho: 6, tipo: 'N', obrigatorio: false, cor: '#e0e0e0', descricao: 'Zeros' },
    { nome: 'Uso FEBRABAN', ini: 35, fim: 240, tamanho: 205, tipo: 'A', obrigatorio: false, cor: '#f5f5f5', descricao: 'Brancos (205 pos)' },
  ];

  readonly codigosMovimento: { codigo: string; descricao: string }[] = [
    { codigo: '01', descricao: 'Remessa — Entrada de Título' },
    { codigo: '02', descricao: 'Pedido de Baixa' },
    { codigo: '03', descricao: 'Pedido de Débito em Conta' },
    { codigo: '04', descricao: 'Concessão de Abatimento' },
    { codigo: '05', descricao: 'Cancelamento de Abatimento' },
    { codigo: '06', descricao: 'Alteração de Vencimento' },
    { codigo: '07', descricao: 'Concessão de Desconto' },
    { codigo: '08', descricao: 'Cancelamento de Desconto' },
    { codigo: '09', descricao: 'Protestar' },
    { codigo: '10', descricao: 'Sustação / Cancelamento de Protesto' },
    { codigo: '11', descricao: 'Devolver / Não Protestar' },
    { codigo: '12', descricao: 'Alteração de Juros de Mora' },
    { codigo: '13', descricao: 'Cancelamento de Juros de Mora' },
    { codigo: '14', descricao: 'Alteração do Valor Nominal' },
    { codigo: '15', descricao: 'Pedido de Negativação' },
    { codigo: '16', descricao: 'Exclusão de Negativação Pendente' },
    { codigo: '17', descricao: 'Alteração de Outros Dados' },
    { codigo: '40', descricao: 'Alteração de Carteira' },
  ];

  constructor(private sanitizer: DomSanitizer) {
    this._inicializarLegenda();
  }

  private _inicializarLegenda(): void {
    const todos = [
      ...this.camposHeaderArquivo, ...this.camposHeaderLote,
      ...this.camposSegP, ...this.camposSegQ, ...this.camposSegR,
      ...this.camposTrailerLote, ...this.camposTrailerArquivo,
    ];
    this.legendaCampos = todos.filter((c, i, self) => self.findIndex(x => x.nome === c.nome) === i);
  }

  ngOnDestroy() { this._hlStyle?.remove(); }

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
      .cnab-mw .cnab-mc.${cls} { opacity: 1 !important; outline: 2px solid #c82333 !important; outline-offset: -1px; }
    `;
    document.head.appendChild(this._hlStyle);
  }

  get campoTemLookup(): boolean {
    return !!(this.campoAtivo?.valoresDescricao) && !this.campoEhMovimento;
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

  get campoEhMovimento(): boolean {
    const nome = this.campoAtivo?.nome.toLowerCase() ?? '';
    return nome.includes('código do movimento') || nome.includes('código de movimento');
  }

  get descricaoMovimentoAtivo(): string {
    return this.codigosMovimento.find(m => m.codigo === this.valorCampoAtivo.trim())?.descricao ?? '';
  }

  selecionarMovimento(codigo: string): void {
    if (!this.campoAtivo) return;
    const tam = this.campoAtivo.fim - this.campoAtivo.ini;
    this.valorCampoAtivo = codigo.padStart(tam, '0').substring(0, tam);
  }

  fecharEditor(): void {
    this.campoAtivo = null;
    this.editorPos = null;
    this.statusBar = '';
    this._hlStyle?.remove();
    this._hlStyle = null;
    this.campoSelecionado = null;
  }

  private camposParaLinha(li: number): CampoLayout[] {
    const line = this.linhasEditadas[li];
    if (!line) return [];
    const tipo = line[7] ?? '';
    const seg  = line[13] ?? '';
    if (tipo === '0') return this.camposHeaderArquivo;
    if (tipo === '1') return this.camposHeaderLote;
    if (tipo === '3' && seg === 'P') return this.camposSegP;
    if (tipo === '3' && seg === 'Q') return this.camposSegQ;
    if (tipo === '3' && seg === 'R') return this.camposSegR;
    if (tipo === '5') return this.camposTrailerLote;
    if (tipo === '9') return this.camposTrailerArquivo;
    return [];
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
      }
    });
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
    val = campo.tipo === 'N' ? val.replace(/\D/g, '').padStart(tam, '0').substring(0, tam) : val.padEnd(tam, ' ').substring(0, tam);
    const antes = this.linhasEditadas[this.linhaAtiva];
    const depois = antes.substring(0, campo.ini) + val + antes.substring(campo.fim);
    if (antes !== depois) this.totalEdicoes++;
    this.linhasEditadas[this.linhaAtiva] = depois;
    this.valorCampoAtivo = val;
    this.aplicadoFeedback = true;
    setTimeout(() => { this.aplicadoFeedback = false; }, 1800);
    this.rerenderizar();
    setTimeout(() => { if (campo) this.selecionarCampo(campo.nome); }, 0);
  }

  onFileChange(event: Event) {
    this.error = null; this.visualHtml = null; this.erros = []; this.validado = false;
    this.campoSelecionado = null; this.conteudoArquivo = ''; this.estatisticas = null;
    this.statusBar = ''; this.campoAtivo = null; this.linhaAtiva = -1;
    this.editorPos = null; this.totaisRemessa = null;

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
      } catch {
        this.error = 'Erro ao processar o arquivo.';
      }
    };
    reader.onerror = () => { this.error = 'Erro ao ler o arquivo.'; };
    reader.readAsText(file, 'ISO-8859-1');
  }

  rerenderizar(): void {
    this.erros = []; this.estatisticas = null;
    const html = this.validarEHighlight(this.linhasEditadas.join('\r\n'));
    this.visualHtml = this.sanitizer.bypassSecurityTrustHtml(html);
    this.validado = true;
    this.calcularTotais();
  }

  calcularTotais(): void {
    const segP = this.linhasEditadas.filter(l => l[7] === '3' && l[13] === 'P');
    if (segP.length === 0) { this.totaisRemessa = null; return; }
    let valorTotal = 0, comDesconto = 0;
    for (const l of segP) {
      valorTotal += parseInt(l.substring(85, 100) || '0', 10);
      const desconto = parseInt(l.substring(142, 157) || '0', 10);
      if (desconto > 0) comDesconto++;
    }
    this.totaisRemessa = { totalTitulos: segP.length, valorTotal, comDesconto, semDesconto: segP.length - comDesconto };
  }

  formatarReais(centavos: number): string {
    return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  gerarRemessa(): void {
    const conteudo = this.linhasEditadas.join('\r\n');
    const bytes = new Uint8Array(conteudo.length);
    for (let i = 0; i < conteudo.length; i++) bytes[i] = conteudo.charCodeAt(i) & 0xff;
    const blob = new Blob([bytes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'remessa_santander240_editada.REM'; a.click();
    URL.revokeObjectURL(url);
  }

  validarEHighlight(content: string): string {
    const lines = content.split(/\r?\n/).filter(l => l.length > 0);
    if (lines.length === 0) { this.error = 'Arquivo vazio ou sem linhas válidas.'; return ''; }

    this.estatisticas = { totalLinhas: lines.length, headersArquivo: 0, headersLote: 0, segmentosP: 0, segmentosQ: 0, segmentosR: 0, trailersLote: 0, trailersArquivo: 0, desconhecidos: 0 };

    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];
      const tipo = line[7] ?? '';
      const seg  = line[13] ?? '';
      let campos: CampoLayout[];

      switch (tipo) {
        case '0': campos = this.camposHeaderArquivo;  this.estatisticas.headersArquivo++;  break;
        case '1': campos = this.camposHeaderLote;     this.estatisticas.headersLote++;     break;
        case '3':
          if (seg === 'P') { campos = this.camposSegP; this.estatisticas.segmentosP++; }
          else if (seg === 'Q') { campos = this.camposSegQ; this.estatisticas.segmentosQ++; }
          else if (seg === 'R') { campos = this.camposSegR; this.estatisticas.segmentosR++; }
          else {
            campos = [];
            this.estatisticas.desconhecidos++;
            this.erros.push({ linha: idx + 1, campo: 'Segmento', posicao: '14', valor: seg, mensagem: `Segmento desconhecido: "${seg}"`, severidade: 'aviso' });
          }
          break;
        case '5': campos = this.camposTrailerLote;    this.estatisticas.trailersLote++;    break;
        case '9': campos = this.camposTrailerArquivo; this.estatisticas.trailersArquivo++; break;
        default:
          campos = [];
          this.estatisticas.desconhecidos++;
          this.erros.push({ linha: idx + 1, campo: 'Tipo de Registro', posicao: '8', valor: tipo, mensagem: `Tipo desconhecido: "${tipo}"`, severidade: 'erro' });
      }

      if (line.length !== 240) {
        this.erros.push({ linha: idx + 1, campo: 'Linha', posicao: `1-${line.length}`, valor: `${line.length} chars`, mensagem: `Tamanho inválido. Esperado: 240, Encontrado: ${line.length}`, severidade: 'erro' });
      }

      for (const campo of campos) {
        this.validarCampo(idx + 1, campo, line.slice(campo.ini, campo.fim));
      }
    }

    this.validarEstrutura();

    const todosCampos = [
      ...this.camposHeaderArquivo, ...this.camposHeaderLote,
      ...this.camposSegP, ...this.camposSegQ, ...this.camposSegR,
      ...this.camposTrailerLote, ...this.camposTrailerArquivo,
    ];
    this.legendaCampos = todosCampos.filter((c, i, self) => self.findIndex(x => x.nome === c.nome) === i);

    return `<div class="cnab-mw">${lines.map((line, idx) => this.lineToMatrix(line, idx)).join('')}</div>`;
  }

  validarEstrutura(): void {
    if (!this.estatisticas) return;
    if (this.estatisticas.headersArquivo === 0) this.erros.push({ linha: 0, campo: 'Estrutura', posicao: '-', valor: '-', mensagem: 'Arquivo deve ter Header de Arquivo (Tipo 0)', severidade: 'erro' });
    if (this.estatisticas.trailersArquivo === 0) this.erros.push({ linha: 0, campo: 'Estrutura', posicao: '-', valor: '-', mensagem: 'Arquivo deve ter Trailer de Arquivo (Tipo 9)', severidade: 'erro' });
    if (this.estatisticas.headersLote !== this.estatisticas.trailersLote) this.erros.push({ linha: 0, campo: 'Estrutura', posicao: '-', valor: '-', mensagem: `Qtd. Headers de Lote (${this.estatisticas.headersLote}) ≠ Trailers de Lote (${this.estatisticas.trailersLote})`, severidade: 'erro' });
    if (this.estatisticas.segmentosP !== this.estatisticas.segmentosQ) this.erros.push({ linha: 0, campo: 'Estrutura', posicao: '-', valor: '-', mensagem: `Qtd. Segmentos P (${this.estatisticas.segmentosP}) ≠ Segmentos Q (${this.estatisticas.segmentosQ})`, severidade: 'aviso' });
  }

  validarCampo(linha: number, campo: CampoLayout, valor: string): void {
    const vt = valor.trim();
    if (campo.obrigatorio && vt === '') {
      this.erros.push({ linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor, mensagem: 'Campo obrigatório vazio', severidade: 'erro' });
      return;
    }
    if (!campo.obrigatorio && vt === '') return;
    if (campo.tipo === 'N' && !/^\d+$/.test(valor)) {
      this.erros.push({ linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor, mensagem: 'Deve conter apenas dígitos (0–9)', severidade: 'erro' });
    }
    if (campo.valores && vt !== '' && !campo.valores.includes(vt)) {
      this.erros.push({ linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor, mensagem: `Valor inválido. Permitidos: ${campo.valores.join(', ')}`, severidade: 'erro' });
    }
    if (campo.formato === 'DDMMAAAA' && /^\d{8}$/.test(valor) && valor !== '00000000') {
      const dia = parseInt(valor.slice(0, 2), 10);
      const mes = parseInt(valor.slice(2, 4), 10);
      if (dia < 1 || dia > 31) this.erros.push({ linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor, mensagem: `Dia inválido: ${dia}`, severidade: 'erro' });
      if (mes < 1 || mes > 12) this.erros.push({ linha, campo: campo.nome, posicao: `${campo.ini + 1}-${campo.fim}`, valor, mensagem: `Mês inválido: ${mes}`, severidade: 'erro' });
    }
  }

  lineToMatrix(line: string, lineIdx: number): string {
    const tipo = line[7] ?? '';
    const seg  = line[13] ?? '';
    let campos: CampoLayout[];
    let tipoNome = '';
    let tipoColor = '';

    switch (tipo) {
      case '0': campos = this.camposHeaderArquivo;  tipoNome = 'Header Arquivo';    tipoColor = '#880e4f'; break;
      case '1': campos = this.camposHeaderLote;     tipoNome = 'Header Lote';       tipoColor = '#4a148c'; break;
      case '3':
        if (seg === 'P') { campos = this.camposSegP; tipoNome = 'Seg. P — Título';    tipoColor = '#1565c0'; }
        else if (seg === 'Q') { campos = this.camposSegQ; tipoNome = 'Seg. Q — Pagador';  tipoColor = '#2e7d32'; }
        else if (seg === 'R') { campos = this.camposSegR; tipoNome = 'Seg. R — Compl.';   tipoColor = '#bf360c'; }
        else { campos = []; tipoNome = `Seg. ${seg} — Desconhecido`; tipoColor = '#757575'; }
        break;
      case '5': campos = this.camposTrailerLote;    tipoNome = 'Trailer Lote';      tipoColor = '#827717'; break;
      case '9': campos = this.camposTrailerArquivo; tipoNome = 'Trailer Arquivo';   tipoColor = '#4a1010'; break;
      default:  campos = []; tipoNome = 'Desconhecido'; tipoColor = '#d32f2f';
    }

    let html = `<div style="margin-bottom:10px;padding:8px;background:#fafafa;border-radius:4px;border:1px solid #e0e0e0;width:max-content;min-width:100%;">`;
    html += `<div style="display:flex;align-items:center;margin-bottom:6px;gap:8px;flex-wrap:wrap;">`;
    html += `<span style="min-width:72px;font-size:12px;font-weight:600;color:${tipoColor};">Linha ${lineIdx + 1}</span>`;
    html += `<span style="padding:3px 10px;background:${tipoColor};color:#fff;border-radius:4px;font-size:11px;font-weight:600;">${tipoNome}</span>`;
    html += `<span style="padding:3px 8px;background:#757575;color:#fff;border-radius:4px;font-size:10px;">${line.length} chars</span>`;

    if (tipo === '3' && (seg === 'P' || seg === 'Q')) {
      const mov = line.substring(15, 17).trim();
      const descMov = this.codigosMovimento.find(m => m.codigo === mov)?.descricao;
      if (descMov) {
        html += `<span style="padding:3px 10px;background:#455a64;color:#fff;border-radius:4px;font-size:11px;margin-left:4px;">${mov} — ${descMov}</span>`;
      }
    }

    const errosLinha = this.erros.filter(e => e.linha === lineIdx + 1 && e.severidade === 'erro');
    if (errosLinha.length > 0) {
      html += `<span style="padding:3px 10px;background:#d32f2f;color:#fff;border-radius:4px;font-size:11px;margin-left:auto;font-weight:600;">⚠️ ${errosLinha.length} erro(s)</span>`;
    }
    html += `</div>`;

    html += `<div style="font-family:'Courier New',Courier,monospace;font-size:11px;line-height:1;white-space:nowrap;background:#fff;padding:6px;border-radius:4px;border:1px solid #e0e0e0;">`;
    for (let i = 0; i < 240; i++) {
      const char = i < line.length ? line[i] : ' ';
      const campo = campos.find(c => i >= c.ini && i < c.fim);
      const cor = campo ? campo.cor : '#f5f5f5';
      const nomeCampo = campo ? campo.nome : 'N/D';
      const temErro = campo ? this.erros.some(e => e.linha === lineIdx + 1 && e.campo === campo.nome && e.severidade === 'erro') : false;
      const borda = temErro ? 'border:2px solid #d32f2f;' : 'border:1px solid rgba(0,0,0,0.08);';
      const cls = campo ? `cnab-mc ${this.campoClass(campo.nome)}` : 'cnab-mc';
      const title = `${nomeCampo} - Pos ${i + 1}${campo?.descricao ? '\n' + campo.descricao : ''}`;
      html += `<span class="${cls}" data-li="${lineIdx}" data-ci="${i}" style="display:inline-block;width:13px;height:18px;line-height:18px;text-align:center;vertical-align:top;background:${cor};${borda}font-size:11px;font-family:monospace;cursor:pointer;user-select:none;" title="${this.escapeHtml(title)}">${char === ' ' ? '&nbsp;' : this.escapeHtml(char)}</span>`;
    }
    html += '</div></div>';
    return html;
  }

  escapeHtml(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }
}
