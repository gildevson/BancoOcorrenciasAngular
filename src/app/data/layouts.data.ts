/**
 * Dados dos layouts de bancos brasileiros
 * Arquivo: src/app/data/layouts.data.ts
 */

// ================================
// TIPOS E INTERFACES
// ================================

/** Status possíveis de um layout */
export type StatusLayout = 'Ativo' | 'Em revisão' | 'Descontinuado';

/** Tipos de layout disponíveis */
export type TipoLayout = 'CNAB240' | 'CNAB400' | 'Febraban' | 'Outro';

/** Interface representando um layout de banco */

export interface BancoLayout {
  id: string;
  bancoNumero: string;
  bancoNome: string;
  tipoLayout: TipoLayout;
  imagemURL: string,
  versao?: string;
  status?: StatusLayout;
  descricao?: string;
  atualizadoEm?: string;
  documentacaoUrl?: string;
  observacoes?: string;
  pdfUrl?: string;
}

// ================================
// LOGOS
// ================================

const BB      = 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Banco%20do%20Brasil%20S.A/banco-do-brasil-com-fundo.svg';
const SAFRA   = 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Banco%20Safra%20S.A/logo-safra.svg';
const BANRISUL = 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Banrisul/banrisul-logo-nome-2023.svg';
const BMP     = 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Banco%20BMP/logo_bmp.svg';
const BRAD    = 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Bradesco%20S.A/bradesco%20com%20nome.svg';
const CEF     = 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Caixa%20Econ%C3%B4mica%20Federal/caixa-economica-federal-X.svg';
const INTER   = 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Banco%20Inter%20S.A/inter.svg';
const BTG     = 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Banco%20BTG%20Pacutal/btg-pactual.svg';
const ITAU    = 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Ita%C3%BA%20Unibanco%20S.A/itau-2-laranja.svg';
const SANT    = 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Banco%20Santander%20Brasil%20S.A/santander-fundo-vermelho.svg';
const SICOOB  = 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Sicoob/sicoob-vector-logo.svg';
const SICREDI = 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Sicredi/logo-svg2.svg';
const SOFISA  = 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Banco%20Sofisa/logo-banco-sofisa.svg';
const ABC     = 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/ABC%20Brasil/logoabc-negativada.svg';
const IDBANCO = 'https://www.idbanco.com.br/bancodigital/web/images/logo.png';
const HSBC    = 'https://i.pinimg.com/564x/3d/28/fa/3d28fad44ed6dfc81dfd8ff03f1bf495.jpg';
const SPC     = 'https://www.spcbrasil.com.br/_next/image?url=https%3A%2F%2Fwww.spcbrasil.com.br%2Fuploads%2Flogo_b770a0e7b5.png&w=1200&q=75';

// ================================
// DADOS DOS LAYOUTS
// ================================

export const LAYOUTS_BANCO: BancoLayout[] = [

  // ── 001 · Banco do Brasil ─────────────────────────────────────────────────
  {
    id: '001-outro-0f173c',
    bancoNumero: '001',
    bancoNome: 'Banco do Brasil',
    tipoLayout: 'CNAB240',
    imagemURL: BB,
    status: 'Ativo',
    descricao: 'Layout de cobrança CNAB 240',
    atualizadoEm: '30/09/2013',
    pdfUrl: 'assets/pdfs/layouts/BB_240.pdf',
  },
  {
    id: '001-cnab400-1f93f9',
    bancoNumero: '001',
    bancoNome: 'Banco do Brasil',
    tipoLayout: 'CNAB400',
    imagemURL: BB,
    versao: 'Convênio 7',
    status: 'Ativo',
    descricao: 'Layout de cobrança CNAB 400 — Convênio 7',
    atualizadoEm: '23/02/2010',
    pdfUrl: 'assets/pdfs/layouts/Banco Brasil_CNAB400_convenio7.pdf',
  },
  {
    id: '???-outro-03aed7',
    bancoNumero: '001',
    bancoNome: 'Banco do Brasil — Nova Cobrança',
    tipoLayout: 'CNAB240',
    imagemURL: BB,
    status: 'Ativo',
    descricao: 'Novo layout de cobrança bancária CNAB 240 (CBR641)',
    atualizadoEm: '22/07/2019',
    pdfUrl: 'assets/pdfs/layouts/Doc2627CBR641Pos7_1__nova_cobran__a_BB.pdf',
  },
  {
    id: '001-cnab240-41e829',
    bancoNumero: '001',
    bancoNome: 'Banco do Brasil — Manual CNAB 240',
    tipoLayout: 'CNAB240',
    imagemURL: BB,
    status: 'Ativo',
    descricao: 'Manual CNAB 240 — Cobrança Bancária do Brasil (CBB)',
    atualizadoEm: '30/06/2020',
    pdfUrl: 'assets/pdfs/layouts/MI - CBB - Manual CNAB 240.pdf',
  },

  // ── 033 · Santander ───────────────────────────────────────────────────────
  {
    id: '033-cnab400-jul2025',
    bancoNumero: '033',
    bancoNome: 'Santander',
    tipoLayout: 'CNAB400',
    imagemURL: SANT,
    versao: 'jul/2025',
    status: 'Ativo',
    descricao: 'Layout de cobrança CNAB 400 — 400 posições (julho 2025)',
    atualizadoEm: '01/07/2025',
    pdfUrl: 'assets/pdfs/layouts/Layout-Cobranca-400-posicoes-jul-2025-Portugues.pdf',
  },
  {
    id: '033-cnab400-a38469',
    bancoNumero: '033',
    bancoNome: 'Santander',
    tipoLayout: 'CNAB400',
    imagemURL: SANT,
    status: 'Ativo',
    descricao: 'Layout de cobrança CNAB 400 (outubro 2009)',
    atualizadoEm: '11/10/2009',
    pdfUrl: 'assets/pdfs/layouts/SANTANDER_Layout CNAB 400 posições Out de 2009.pdf',
  },
  {
    id: '033-outro-8fff57',
    bancoNumero: '033',
    bancoNome: 'Santander',
    tipoLayout: 'CNAB240',
    imagemURL: SANT,
    status: 'Ativo',
    descricao: 'Layout de cobrança CNAB 240 (setembro 2009)',
    atualizadoEm: '09/09/2009',
    pdfUrl: 'assets/pdfs/layouts/SANTANDER_Layout Cobrança 240 - 092009.pdf',
  },

  // ── 041 · Banrisul ────────────────────────────────────────────────────────
  {
    id: '041-febraban-237674',
    bancoNumero: '041',
    bancoNome: 'Banrisul',
    tipoLayout: 'CNAB240',
    imagemURL: BANRISUL,
    status: 'Ativo',
    descricao: 'Leiaute padrão FEBRABAN CNAB 240',
    atualizadoEm: '03/12/2009',
    pdfUrl: 'assets/pdfs/layouts/Banrisul_layout_pdr_Febraban240.pdf',
  },
  {
    id: '041-febraban-7d540a',
    bancoNumero: '041',
    bancoNome: 'Banrisul',
    tipoLayout: 'CNAB400',
    imagemURL: BANRISUL,
    status: 'Ativo',
    descricao: 'Leiaute padrão FEBRABAN CNAB 400',
    atualizadoEm: '03/12/2009',
    pdfUrl: 'assets/pdfs/layouts/Banrisul_layout_pdr_Febraban400_.pdf',
  },
  {
    id: '041-febraban-3646cb',
    bancoNumero: '041',
    bancoNome: 'Banrisul',
    tipoLayout: 'CNAB400',
    imagemURL: BANRISUL,
    versao: 'ed02 (26/05/2010)',
    status: 'Ativo',
    descricao: 'Cobrança eletrônica CNAB 400 — padrão FEBRABAN, edição 02',
    atualizadoEm: '26/05/2010',
    pdfUrl: 'assets/pdfs/layouts/CobrancaEletronicaBanrisul_layout_pdr_Febraban400_vrs26052010_ed02.pdf',
  },
  {
    id: '041-outro-e2865d',
    bancoNumero: '041',
    bancoNome: 'Banrisul',
    tipoLayout: 'CNAB400',
    imagemURL: BANRISUL,
    versao: 'ed06 (15/07/2015)',
    status: 'Ativo',
    descricao: 'Cobrança eletrônica CNAB 400 — padrão FEBRABAN, edição 06',
    atualizadoEm: '15/07/2015',
    pdfUrl: 'assets/pdfs/layouts/CobrancaEletronicaBanrisul_pdr400_vrs15072015_ed06.pdf',
  },
  {
    id: '041-outro-0c8b5d',
    bancoNumero: '041',
    bancoNome: 'Banrisul — Custódia de Cheques',
    tipoLayout: 'Outro',
    imagemURL: BANRISUL,
    status: 'Ativo',
    descricao: 'Layout para custódia eletrônica de cheques',
    atualizadoEm: '23/11/2012',
    pdfUrl: 'assets/pdfs/layouts/Layout_arquivo_Custódia_Eletrônica_de_Cheques_Banrisul.pdf',
  },
  {
    id: '041-febraban-5418ee',
    bancoNumero: '041',
    bancoNome: 'Banrisul',
    tipoLayout: 'CNAB240',
    imagemURL: BANRISUL,
    versao: 'v103',
    status: 'Ativo',
    descricao: 'Leiaute FEBRABAN CNAB 240 versão 103 (23/06/2023)',
    atualizadoEm: '23/06/2023',
    pdfUrl: 'assets/pdfs/layouts/LeiauteBanrisulFebraban_pdr240_v103_23062023.pdf',
  },

  // ── 077 · Banco Inter ─────────────────────────────────────────────────────
  {
    id: '077-outro-273881',
    bancoNumero: '077',
    bancoNome: 'Banco Inter',
    tipoLayout: 'CNAB400',
    imagemURL: INTER,
    status: 'Ativo',
    descricao: 'Layout de cobrança CNAB 400',
    atualizadoEm: '22/07/2021',
    pdfUrl: 'assets/pdfs/layouts/CNAB_400_Banco_Inter.pdf',
  },

  // ── 104 · Caixa Econômica Federal ─────────────────────────────────────────
  {
    id: '104-outro-359552',
    bancoNumero: '104',
    bancoNome: 'Caixa Econômica Federal',
    tipoLayout: 'CNAB240',
    imagemURL: CEF,
    status: 'Ativo',
    descricao: 'Layout de cobrança CNAB 240',
    atualizadoEm: '03/12/2013',
    pdfUrl: 'assets/pdfs/layouts/CNAB_240_caixa_ (1).pdf',
  },

  // ── 208 · BTG Pactual ─────────────────────────────────────────────────────
  {
    id: '208-outro-8c77fc',
    bancoNumero: '208',
    bancoNome: 'BTG Pactual',
    tipoLayout: 'Outro',
    imagemURL: BTG,
    status: 'Ativo',
    descricao: 'Máscara de boleto bancário',
    atualizadoEm: '13/02/2025',
    pdfUrl: 'assets/pdfs/layouts/Mascara boleto BTG PACTUAL.pdf',
  },

  // ── 237 · Bradesco ────────────────────────────────────────────────────────
  {
    id: '237-cnab400-4f00f2',
    bancoNumero: '237',
    bancoNome: 'Bradesco',
    tipoLayout: 'CNAB400',
    imagemURL: BRAD,
    status: 'Ativo',
    descricao: 'Layout de cobrança CNAB 400 (atualizado outubro 2022)',
    atualizadoEm: '04/10/2022',
    pdfUrl: 'assets/pdfs/layouts/Bradesco CNAB 400 atualizado 2022.pdf',
  },
  {
    id: '237-cnab400-ec4091',
    bancoNumero: '237',
    bancoNome: 'Bradesco',
    tipoLayout: 'CNAB400',
    imagemURL: BRAD,
    status: 'Ativo',
    descricao: 'Layout de cobrança CNAB 400',
    atualizadoEm: '05/07/2019',
    pdfUrl: 'assets/pdfs/layouts/Bradesco_CNAB400.pdf',
  },
  {
    id: '237-cnab400-60fe7a',
    bancoNumero: '237',
    bancoNome: 'Bradesco',
    tipoLayout: 'CNAB400',
    imagemURL: BRAD,
    status: 'Ativo',
    descricao: 'Layout de cobrança CNAB 400',
    atualizadoEm: '19/06/2019',
    pdfUrl: 'assets/pdfs/layouts/Bradesco_layout_CNAB400.pdf',
  },
  {
    id: '237-cnab240-pagfor1',
    bancoNumero: '237',
    bancoNome: 'Bradesco — PagFor',
    tipoLayout: 'CNAB240',
    imagemURL: BRAD,
    status: 'Ativo',
    descricao: 'Manual CNAB — Pagamento/Folha (PagFor)',
    pdfUrl: 'assets/pdfs/layouts/Manual - CNAB Bradesco 07 6 3 (1)(pagfor).pdf',
  },
  {
    id: '237-outro-a6e92c',
    bancoNumero: '237',
    bancoNome: 'Bradesco — MultiPag',
    tipoLayout: 'Outro',
    imagemURL: BRAD,
    status: 'Ativo',
    descricao: 'Layout de pagamento múltiplo MultiPag',
    atualizadoEm: '01/11/2024',
    pdfUrl: 'assets/pdfs/layouts/Multipag_Bradesco_v3prot.pdf',
  },

  // ── 246 · ABC Brasil ──────────────────────────────────────────────────────
  {
    id: '???-outro-ce7ff9',
    bancoNumero: '246',
    bancoNome: 'ABC Brasil',
    tipoLayout: 'CNAB240',
    imagemURL: ABC,
    status: 'Ativo',
    descricao: 'Layout de cobrança eletrônica (maio 2020)',
    atualizadoEm: '01/05/2020',
    pdfUrl: 'assets/pdfs/layouts/LayoutCobrancaABCBrasil_MAIO2020.pdf',
  },
  {
    id: '???-outro-56160f',
    bancoNumero: '246',
    bancoNome: 'ABC Brasil — Manual de Boletos',
    tipoLayout: 'Outro',
    imagemURL: ABC,
    status: 'Ativo',
    descricao: 'Manual de boletos bancários (2021)',
    atualizadoEm: '19/07/2021',
    pdfUrl: 'assets/pdfs/layouts/MANUAL_BOLETOS_BANCO_ABC_2021.pdf',
  },

  // ── 274 · BMP Money Plus ──────────────────────────────────────────────────
  {
    id: '274-cnab400-622b82',
    bancoNumero: '274',
    bancoNome: 'BMP Money Plus',
    tipoLayout: 'CNAB400',
    imagemURL: BMP,
    versao: '6.0',
    status: 'Ativo',
    descricao: 'Manual de cobrança CNAB 400 versão 6',
    atualizadoEm: '12/05/2021',
    pdfUrl: 'assets/pdfs/layouts/BMP_CNAB400_V.006.pdf',
  },
  {
    id: '274-outro-979979',
    bancoNumero: '274',
    bancoNome: 'BMP Money Plus',
    tipoLayout: 'CNAB400',
    imagemURL: BMP,
    versao: '9.0',
    status: 'Ativo',
    descricao: 'Manual de cobrança CNAB 400 versão 9',
    atualizadoEm: '22/12/2021',
    pdfUrl: 'assets/pdfs/layouts/CNAB_400_V9_bmp.pdf',
  },
  {
    id: '???-outro-fb8d1c',
    bancoNumero: '274',
    bancoNome: 'BMP Money Plus',
    tipoLayout: 'CNAB400',
    imagemURL: BMP,
    versao: '10.0',
    status: 'Ativo',
    descricao: 'Layout de cobrança CNAB 400 versão 10',
    atualizadoEm: '19/08/2024',
    pdfUrl: 'assets/pdfs/layouts/Layout_CNAB_400-10_bmp.pdf',
  },

  // ── 341 · Itaú Unibanco ───────────────────────────────────────────────────
  {
    id: '341-cnab240-72e649',
    bancoNumero: '341',
    bancoNome: 'Itaú Unibanco',
    tipoLayout: 'CNAB240',
    imagemURL: ITAU,
    status: 'Ativo',
    descricao: 'Layout de cobrança CNAB 240',
    atualizadoEm: '03/09/2012',
    pdfUrl: 'assets/pdfs/layouts/cobrancaItau_cnab240.pdf',
  },
  {
    id: '341-outro-4b2e7e',
    bancoNumero: '341',
    bancoNome: 'Itaú Unibanco — Convênio de Cheques',
    tipoLayout: 'Outro',
    imagemURL: ITAU,
    status: 'Ativo',
    descricao: 'Layout de convênio de custódia de cheques',
    atualizadoEm: '21/10/2014',
    pdfUrl: 'assets/pdfs/layouts/Convenio Cheques ITAU.pdf',
  },

  // ── 356 · Banco Real ──────────────────────────────────────────────────────
  {
    id: '???-outro-8a2f68',
    bancoNumero: '356',
    bancoNome: 'Banco Real',
    tipoLayout: 'CNAB400',
    imagemURL: SANT,
    status: 'Descontinuado',
    descricao: 'Layout de cobrança CNAB 400 — 400 posições (banco incorporado pelo Santander)',
    atualizadoEm: '05/10/2005',
    pdfUrl: 'assets/pdfs/layouts/REAL_COBRANCA_400_POSICOES REAL.pdf',
  },

  // ── 399 · HSBC ────────────────────────────────────────────────────────────
  {
    id: '399-outro-1012c4',
    bancoNumero: '399',
    bancoNome: 'HSBC',
    tipoLayout: 'CNAB240',
    imagemURL: HSBC,
    status: 'Descontinuado',
    descricao: 'Layout de cobrança CNAB 240',
    atualizadoEm: '15/06/2011',
    pdfUrl: 'assets/pdfs/layouts/cob240HSBC.pdf',
  },

  // ── 422 · Banco Safra ─────────────────────────────────────────────────────
  {
    id: '422-cnab400-737489',
    bancoNumero: '422',
    bancoNome: 'Banco Safra',
    tipoLayout: 'CNAB400',
    imagemURL: SAFRA,
    status: 'Ativo',
    descricao: 'Layout de cobrança eletrônica CNAB 400',
    atualizadoEm: '15/09/2011',
    pdfUrl: 'assets/pdfs/layouts/Banco_safra_CNAB400_cobranca2007.pdf',
  },

  // ── 439 · ID Banco ────────────────────────────────────────────────────────
  {
    id: '???-cnab400-b79fe9',
    bancoNumero: '439',
    bancoNome: 'ID Banco',
    tipoLayout: 'CNAB400',
    imagemURL: IDBANCO,
    status: 'Ativo',
    descricao: 'Manual de cobrança CNAB 400 (fevereiro 2024)',
    atualizadoEm: '01/02/2024',
    pdfUrl: 'assets/pdfs/layouts/Manual CNAB 400 - ID BANCO 439 - FEV.24 (1).pdf',
  },

  // ── 611 · Banco Paulista ──────────────────────────────────────────────────
  {
    id: '???-outro-22e581',
    bancoNumero: '611',
    bancoNome: 'Banco Paulista',
    tipoLayout: 'CNAB400',
    imagemURL: '',
    status: 'Ativo',
    descricao: 'Novo layout de remessa CNAB 400 (2013)',
    atualizadoEm: '11/12/2013',
    pdfUrl: 'assets/pdfs/layouts/Novo Layout de Remessa Banco Paulista 2013.pdf',
  },

  // ── 637 · Banco Sofisa ────────────────────────────────────────────────────
  {
    id: '???-outro-e8c537',
    bancoNumero: '637',
    bancoNome: 'Banco Sofisa',
    tipoLayout: 'CNAB400',
    imagemURL: SOFISA,
    status: 'Ativo',
    descricao: 'Novo layout CNAB 400 (formato 444 posições)',
    atualizadoEm: '02/09/2019',
    pdfUrl: 'assets/pdfs/layouts/sofisa_NOVO_CNAB444.pdf',
  },

  // ── 748 · Sicredi ─────────────────────────────────────────────────────────
  {
    id: '748-cnab400-17e7b3',
    bancoNumero: '748',
    bancoNome: 'Sicredi',
    tipoLayout: 'CNAB400',
    imagemURL: SICREDI,
    status: 'Ativo',
    descricao: 'Manual CNAB 400',
    atualizadoEm: '21/07/2010',
    pdfUrl: 'assets/pdfs/layouts/Sicredi manual cnab 400.pdf',
  },
  {
    id: '748-outro-f95417',
    bancoNumero: '748',
    bancoNome: 'Sicredi — CED',
    tipoLayout: 'CNAB240',
    imagemURL: SICREDI,
    status: 'Ativo',
    descricao: 'Layout de cobrança e depósito CNAB 240',
    atualizadoEm: '03/12/2009',
    pdfUrl: 'assets/pdfs/layouts/SICREDI_CED_240.pdf',
  },
  {
    id: '748-outro-288a22',
    bancoNumero: '748',
    bancoNome: 'Sicredi — CED',
    tipoLayout: 'CNAB400',
    imagemURL: SICREDI,
    status: 'Ativo',
    descricao: 'Layout de cobrança e depósito CNAB 400',
    atualizadoEm: '03/12/2009',
    pdfUrl: 'assets/pdfs/layouts/SICREDI_CED_400.pdf',
  },
  {
    id: '748-outro-3e5695',
    bancoNumero: '748',
    bancoNome: 'Sicredi',
    tipoLayout: 'CNAB400',
    imagemURL: SICREDI,
    status: 'Ativo',
    descricao: 'Manual CNAB 400',
    atualizadoEm: '20/07/2021',
    pdfUrl: 'assets/pdfs/layouts/SICREDI_MANUAL_CNAB_400.pdf',
  },

  // ── 756 · Sicoob ──────────────────────────────────────────────────────────
  {
    id: '001-outro-8ab3a3',
    bancoNumero: '756',
    bancoNome: 'Sicoob',
    tipoLayout: 'CNAB240',
    imagemURL: SICOOB,
    status: 'Ativo',
    descricao: 'Layout de cobrança CNAB 240 — Sicoob/BB',
    atualizadoEm: '15/07/2013',
    pdfUrl: 'assets/pdfs/layouts/Sicoob_BB_240.pdf',
  },
  {
    id: '???-cnab240-9fec94',
    bancoNumero: '756',
    bancoNome: 'Sicoob — SIGCB',
    tipoLayout: 'CNAB240',
    imagemURL: SICOOB,
    status: 'Ativo',
    descricao: 'Manual do leiaute CNAB 240 — SIGCB (Sistema Integrado de Gestão de Crédito Bancário)',
    atualizadoEm: '25/11/2016',
    pdfUrl: 'assets/pdfs/layouts/Manual_Leiaute_CNAB240_SIGCB.pdf',
  },

  // ── Padrão FEBRABAN (genérico) ────────────────────────────────────────────
  {
    id: '???-cnab240-11ece5',
    bancoNumero: '???',
    bancoNome: 'Padrão FEBRABAN CNAB 240',
    tipoLayout: 'CNAB240',
    imagemURL: '',
    versao: '10.06',
    status: 'Ativo',
    descricao: 'Manual do leiaute padrão FEBRABAN CNAB 240 versão 10.06',
    atualizadoEm: '13/02/2025',
    pdfUrl: 'assets/pdfs/layouts/Layout_FEBRABAN_CNAB240_ V_10_06.pdf',
  },
  {
    id: '???-febraban-8f6a8d',
    bancoNumero: '???',
    bancoNome: 'Padrão FEBRABAN CNAB 240',
    tipoLayout: 'Febraban',
    imagemURL: '',
    status: 'Ativo',
    descricao: 'Leiaute padrão FEBRABAN — 240 bytes',
    atualizadoEm: '21/12/2009',
    pdfUrl: 'assets/pdfs/layouts/Padrão Febraban 240 bytes (pdf - 183Kb).pdf',
  },
  {
    id: '237-outro-e15df3',
    bancoNumero: '???',
    bancoNome: 'Conciliação Bancária CNAB 240',
    tipoLayout: 'CNAB240',
    imagemURL: '',
    status: 'Ativo',
    descricao: 'Layout de conciliação bancária 240 posições versão 5',
    atualizadoEm: '29/06/2018',
    pdfUrl: 'assets/pdfs/layouts/conciliacao_bancaria_240_posicoes_V_5.pdf.pdf',
  },

  // ── Custódia de Cheques (genérico) ────────────────────────────────────────
  {
    id: '???-outro-959be0',
    bancoNumero: '???',
    bancoNome: 'Custódia de Cheques — Remessa/Retorno',
    tipoLayout: 'Outro',
    imagemURL: '',
    status: 'Ativo',
    descricao: 'Layout para custódia de cheques — remessa e retorno',
    atualizadoEm: '01/08/2012',
    pdfUrl: 'assets/pdfs/layouts/Layouts_Cust__dia_de_Cheques_Remessa_Retorno.pdf',
  },

  // ── SPC Brasil ────────────────────────────────────────────────────────────
  {
    id: '???-outro-f9bf1d',
    bancoNumero: '???',
    bancoNome: 'SPC Brasil',
    tipoLayout: 'Outro',
    imagemURL: SPC,
    versao: '7.1',
    status: 'Ativo',
    descricao: 'Layout para registro e cancelamento de inadimplentes versão 7.1',
    atualizadoEm: '02/07/2012',
    pdfUrl: 'assets/pdfs/layouts/Layout_SPC_BRASIL_registro_e_cancelamento_v7-1.pdf',
  },

  // ── Boa Vista SCPC ────────────────────────────────────────────────────────
  {
    id: 'Boa Vista-outro-9dc54e',
    bancoNumero: '???',
    bancoNome: 'Boa Vista SCPC',
    tipoLayout: 'Outro',
    imagemURL: '',
    status: 'Ativo',
    descricao: 'Layout para serviço de proteção ao crédito',
    atualizadoEm: '08/12/2017',
    pdfUrl: 'assets/pdfs/layouts/BoaVista.pdf',
  },

  // ── Banco BVA ─────────────────────────────────────────────────────────────
  {
    id: '???-outro-f44504',
    bancoNumero: '???',
    bancoNome: 'Banco BVA',
    tipoLayout: 'CNAB400',
    imagemURL: '',
    status: 'Descontinuado',
    descricao: 'Layout de cobrança CNAB 400 versão 06/2008',
    atualizadoEm: '01/06/2008',
    pdfUrl: 'assets/pdfs/layouts/Microsoft Word - novo lay-out banco bva versão 06-2008.pdf',
  },
  {
    id: '???-outro-6153ec',
    bancoNumero: '???',
    bancoNome: 'Banco BVA',
    tipoLayout: 'CNAB400',
    imagemURL: '',
    status: 'Descontinuado',
    descricao: 'Layout de cobrança CNAB 400',
    atualizadoEm: '21/12/2007',
    pdfUrl: 'assets/pdfs/layouts/Microsoft Word - novo lay-out banco bva.pdf',
  },

  // ── Kanastra ──────────────────────────────────────────────────────────────
  {
    id: '???-cnab400-3323cc',
    bancoNumero: '???',
    bancoNome: 'Kanastra',
    tipoLayout: 'CNAB400',
    imagemURL: '',
    status: 'Ativo',
    descricao: 'Manual de cobrança CNAB 400',
    atualizadoEm: '28/04/2025',
    pdfUrl: 'assets/pdfs/layouts/Manual de cobranca CNAB400 - Kanastra (1).pdf',
  },

  // ── MPO ───────────────────────────────────────────────────────────────────
  {
    id: '???-cnab400-mpo001',
    bancoNumero: '???',
    bancoNome: 'MPO — Layout CNAB 400',
    tipoLayout: 'CNAB400',
    imagemURL: '',
    status: 'Ativo',
    descricao: 'Layout de arquivos CNAB 400',
    pdfUrl: 'assets/pdfs/layouts/mpo_arquivos_layout_400P.pdf',
  },

  // ── VORTX ─────────────────────────────────────────────────────────────────
  {
    id: '310-cnab400-vortx01',
    bancoNumero: '310',
    bancoNome: 'VORTX',
    tipoLayout: 'CNAB400',
    imagemURL: '',
    status: 'Ativo',
    descricao: 'Layout de remessa CNAB 400',
    pdfUrl: 'assets/pdfs/layouts/VORTX_400_REMESSA 2.pdf',
  },

  // ── Documentos genéricos ──────────────────────────────────────────────────
  {
    id: '???-outro-18e504',
    bancoNumero: '???',
    bancoNome: 'Manual de Implantação',
    tipoLayout: 'Outro',
    imagemURL: '',
    versao: '2.2.1',
    status: 'Ativo',
    descricao: 'Manual de implantação de cobrança eletrônica versão 2.2.1',
    atualizadoEm: '13/02/2025',
    pdfUrl: 'assets/pdfs/layouts/Manual de Implantacao v2.2.1.pdf',
  },
  {
    id: '???-outro-d900a9',
    bancoNumero: '???',
    bancoNome: 'Layout para Factoring',
    tipoLayout: 'Outro',
    imagemURL: '',
    status: 'Ativo',
    descricao: 'Manual simplificado para relato de recebíveis em factoring',
    atualizadoEm: '16/09/2005',
    pdfUrl: 'assets/pdfs/layouts/Manual Simplificado - Relato para Factorings v01.pdf',
  },
];



// ================================
// FUNÇÕES AUXILIARES
// ================================

/** Busca um layout específico por ID */
export function buscarLayoutPorId(id: string): BancoLayout | undefined {
  return LAYOUTS_BANCO.find(l => l.id === id);
}

/** Busca um layout específico por número do banco e tipo */
export function buscarLayout(bancoNumero: string, tipo: TipoLayout): BancoLayout | undefined {
  return LAYOUTS_BANCO.find(l => l.bancoNumero === bancoNumero && l.tipoLayout === tipo);
}

/** Retorna todos os layouts de um banco específico */
export function buscarLayoutsPorBanco(bancoNumero: string): BancoLayout[] {
  return LAYOUTS_BANCO.filter(l => l.bancoNumero === bancoNumero);
}

/** Retorna todos os layouts de um tipo específico */
export function buscarLayoutsPorTipo(tipo: TipoLayout): BancoLayout[] {
  return LAYOUTS_BANCO.filter(l => l.tipoLayout === tipo);
}

/** Retorna todos os layouts ativos */
export function buscarLayoutsAtivos(): BancoLayout[] {
  return LAYOUTS_BANCO.filter(l => !l.status || l.status === 'Ativo');
}

/** Retorna estatísticas dos layouts */
export function obterEstatisticas() {
  return {
    total: LAYOUTS_BANCO.length,
    ativos: LAYOUTS_BANCO.filter(l => !l.status || l.status === 'Ativo').length,
    emRevisao: LAYOUTS_BANCO.filter(l => l.status === 'Em revisão').length,
    descontinuados: LAYOUTS_BANCO.filter(l => l.status === 'Descontinuado').length,
    cnab240: LAYOUTS_BANCO.filter(l => l.tipoLayout === 'CNAB240').length,
    cnab400: LAYOUTS_BANCO.filter(l => l.tipoLayout === 'CNAB400').length,
    bancosUnicos: new Set(LAYOUTS_BANCO.map(l => l.bancoNumero)).size,
  };
}
