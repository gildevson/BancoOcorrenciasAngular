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
// DADOS DOS LAYOUTS
// ================================

export const LAYOUTS_BANCO: BancoLayout[] = [

  {
    id: '001-cnab400-1f93f9',
    bancoNumero: '001',
    bancoNome: 'Banco Brasil CNAB400',
    tipoLayout: 'CNAB400',
    imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Banco%20do%20Brasil%20S.A/banco-do-brasil-com-fundo.svg',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: Banco Brasil_CNAB400_convenio7.pdf`,
    atualizadoEm: '23/02/2010',
    pdfUrl: 'assets/pdfs/layouts/Banco Brasil_CNAB400_convenio7.pdf',
  },
  {
    id: '422-cnab400-737489',
    bancoNumero: '422',
    bancoNome: 'Banco safra CNAB400',
    tipoLayout: 'CNAB400',
    imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Banco%20Safra%20S.A/logo-safra.svg',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: Banco_safra_CNAB400_cobranca2007.pdf`,
    atualizadoEm: '15/09/2011',
    pdfUrl: 'assets/pdfs/layouts/Banco_safra_CNAB400_cobranca2007.pdf',
  },
  {
    id: '041-febraban-237674',
    bancoNumero: '041',
    bancoNome: 'Banrisul',
    tipoLayout: 'CNAB240',
    imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Banrisul/banrisul-logo-nome-2023.svg',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: Banrisul_layout_pdr_Febraban240.pdf`,
    atualizadoEm: '03/12/2009',
    pdfUrl: 'assets/pdfs/layouts/Banrisul_layout_pdr_Febraban240.pdf',
  },
  {
    id: '041-febraban-7d540a',
    bancoNumero: '041',
    bancoNome: 'Banrisul',
    tipoLayout: 'CNAB400',
   imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Banrisul/banrisul-logo-nome-2023.svg',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: Banrisul_layout_pdr_Febraban400_.pdf`,
    atualizadoEm: '03/12/2009',
    pdfUrl: 'assets/pdfs/layouts/Banrisul_layout_pdr_Febraban400_.pdf',
  },
  {
    id: '001-outro-0f173c',
    bancoNumero: '001',
    bancoNome: 'Banco do Brasil',
    tipoLayout: 'CNAB240',
    imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Banco%20do%20Brasil%20S.A/banco-do-brasil-com-fundo.svg',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: BB_240.pdf`,
    atualizadoEm: '30/09/2013',
    pdfUrl: 'assets/pdfs/layouts/BB_240.pdf',
  },
  {
    id: '274-cnab400-622b82',
    bancoNumero: '274',
    bancoNome: 'BMP CNAB400 V.006',
    tipoLayout: 'CNAB400',
    imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Banco%20BMP/logo_bmp.svg',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: BMP_CNAB400_V.006.pdf`,
    atualizadoEm: '12/05/2021',
    pdfUrl: 'assets/pdfs/layouts/BMP_CNAB400_V.006.pdf',
  },
  {
    id: 'Boa Vista-outro-9dc54e',
    bancoNumero: '???',
    bancoNome: 'Boa Vista',
    tipoLayout: 'Outro',
    imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Banco%20BMP/logo_bmp.svg',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: BoaVista.pdf`,
    atualizadoEm: '08/12/2017',
    pdfUrl: 'assets/pdfs/layouts/BoaVista.pdf',
  },
  {
    id: '237-cnab400-4f00f2',
    bancoNumero: '237',
    bancoNome: 'Bradesco',
    tipoLayout: 'CNAB400',
    imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Bradesco%20S.A/bradesco%20com%20nome.svg',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: Bradesco CNAB 400 atualizado 2022.pdf`,
    atualizadoEm: '04/10/2022',
    pdfUrl: 'assets/pdfs/layouts/Bradesco CNAB 400 atualizado 2022.pdf',
  },
  {
    id: '237-cnab400-ec4091',
    bancoNumero: '237',
    bancoNome: 'Bradesco',
    tipoLayout: 'CNAB400',
    imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Bradesco%20S.A/bradesco%20com%20nome.svg',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: Bradesco_CNAB400.pdf`,
    atualizadoEm: '05/07/2019',
    pdfUrl: 'assets/pdfs/layouts/Bradesco_CNAB400.pdf',
  },
  {
    id: '237-cnab400-60fe7a',
    bancoNumero: '237',
    bancoNome: 'Bradesco',
    tipoLayout: 'CNAB400',
    imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Bradesco%20S.A/bradesco%20com%20nome.svg',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: Bradesco_layout_CNAB400.pdf`,
    atualizadoEm: '19/06/2019',
    pdfUrl: 'assets/pdfs/layouts/Bradesco_layout_CNAB400.pdf',
  },
  {
    id: '104-outro-359552',
    bancoNumero: '104',
    bancoNome: 'Caixa Econômica Federal',
    tipoLayout: 'CNAB240',
    imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Caixa%20Econ%C3%B4mica%20Federal/caixa-economica-federal-X.svg',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: CNAB_240_caixa_ (1).pdf`,
    atualizadoEm: '03/12/2013',
    pdfUrl: 'assets/pdfs/layouts/CNAB_240_caixa_ (1).pdf',
  },
  {
    id: '077-outro-273881',
    bancoNumero: '077',
    bancoNome: 'Banco Inter',
    tipoLayout: 'CNAB400',
    imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Banco%20Inter%20S.A/inter.svg',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: CNAB_400_Banco_Inter.pdf`,
    atualizadoEm: '22/07/2021',
    pdfUrl: 'assets/pdfs/layouts/CNAB_400_Banco_Inter.pdf',
  },
  {
    id: '274-outro-979979',
    bancoNumero: '274',
    bancoNome: 'CNAB 400 V9',
    tipoLayout: 'CNAB400',
    imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Banco%20Inter%20S.A/inter.svg',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: CNAB_400_V9_bmp.pdf`,
    atualizadoEm: '22/12/2021',
    pdfUrl: 'assets/pdfs/layouts/CNAB_400_V9_bmp.pdf',
  },
  {
    id: '399-outro-1012c4',
    bancoNumero: '399',
    bancoNome: 'HSBC',
    tipoLayout: 'CNAB240',
    imagemURL: 'https://i.pinimg.com/564x/3d/28/fa/3d28fad44ed6dfc81dfd8ff03f1bf495.jpg',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: cob240HSBC.pdf`,
    atualizadoEm: '15/06/2011',
    pdfUrl: 'assets/pdfs/layouts/cob240HSBC.pdf',
  },
  {
    id: '041-febraban-3646cb',
    bancoNumero: '041',
    bancoNome: 'Banrisul',
    tipoLayout: 'CNAB400',
    imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Banrisul/banrisul-logo-2023.svg',
    versao: '26052010',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: CobrancaEletronicaBanrisul_layout_pdr_Febraban400_vrs26052010_ed02.pdf`,
    atualizadoEm: '26/05/2010',
    pdfUrl: 'assets/pdfs/layouts/CobrancaEletronicaBanrisul_layout_pdr_Febraban400_vrs26052010_ed02.pdf',
  },
  {
    id: '041-outro-e2865d',
    bancoNumero: '041',
    bancoNome: 'Banrisul',
    tipoLayout: 'CNAB400',
    imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Banrisul/banrisul-logo-2023.svg',
    versao: '15072015',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: CobrancaEletronicaBanrisul_pdr400_vrs15072015_ed06.pdf`,
    atualizadoEm: '15/07/2015',
    pdfUrl: 'assets/pdfs/layouts/CobrancaEletronicaBanrisul_pdr400_vrs15072015_ed06.pdf',
  },
  {
    id: '341-cnab240-72e649',
    bancoNumero: '341',
    bancoNome: 'Itaú',
    tipoLayout: 'CNAB240',
    imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Ita%C3%BA%20Unibanco%20S.A/itau-2-laranja.svg',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: cobrancaItau_cnab240.pdf`,
    atualizadoEm: '03/09/2012',
    pdfUrl: 'assets/pdfs/layouts/cobrancaItau_cnab240.pdf',
  },
  {
    id: '237-outro-e15df3',
    bancoNumero: '237',
    bancoNome: 'conciliacao bancaria 240',
    tipoLayout: 'Outro',
    imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Ita%C3%BA%20Unibanco%20S.A/itau-2-laranja.svg',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: conciliacao_bancaria_240_posicoes_V_5.pdf.pdf`,
    atualizadoEm: '29/06/2018',
    pdfUrl: 'assets/pdfs/layouts/conciliacao_bancaria_240_posicoes_V_5.pdf.pdf',
  },
  {
    id: '341-outro-4b2e7e',
    bancoNumero: '341',
    bancoNome: 'Itaú',
    tipoLayout: 'Outro',
    imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Ita%C3%BA%20Unibanco%20S.A/itau-2-laranja.svg',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: Convenio Cheques ITAU.pdf`,
    atualizadoEm: '21/10/2014',
    pdfUrl: 'assets/pdfs/layouts/Convenio Cheques ITAU.pdf',
  },
  {
    id: '???-outro-03aed7',
    bancoNumero: '001',
    bancoNome: 'Doc2627CBR641Pos7 1 nova',
    tipoLayout: 'CNAB240',
    imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Banco%20do%20Brasil%20S.A/banco-do-brasil-com-fundo.svg',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: Doc2627CBR641Pos7_1__nova_cobran__a_BB.pdf`,
    atualizadoEm: '22/07/2019',
    pdfUrl: 'assets/pdfs/layouts/Doc2627CBR641Pos7_1__nova_cobran__a_BB.pdf',
  },
  {
    id: '041-outro-0c8b5d',
    bancoNumero: '041',
    bancoNome: 'Banrisul',
    tipoLayout: 'Outro',
    imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Banrisul/banrisul-logo-2023.svg',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: Layout_arquivo_Custódia_Eletrônica_de_Cheques_Banrisul.pdf`,
    atualizadoEm: '23/11/2012',
    pdfUrl: 'assets/pdfs/layouts/Layout_arquivo_Custódia_Eletrônica_de_Cheques_Banrisul.pdf',
  },
  {
    id: '???-outro-fb8d1c',
    bancoNumero: '274',
    bancoNome: 'Layout CNAB 400',
    tipoLayout: 'CNAB400',
    imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Banco%20BMP/logo_bmp.svg',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: Layout_CNAB_400-10_bmp.pdf`,
    atualizadoEm: '19/08/2024',
    pdfUrl: 'assets/pdfs/layouts/Layout_CNAB_400-10_bmp.pdf',
  },
  {
    id: '???-cnab240-11ece5',
    bancoNumero: '???',
    bancoNome: 'Layout FEBRABAN CNAB240',
    tipoLayout: 'CNAB240',
    imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Banco%20BMP/logo_bmp.svg',
    versao: '10.06',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: Layout_FEBRABAN_CNAB240_ V_10_06.pdf`,
    atualizadoEm: '13/02/2025',
    pdfUrl: 'assets/pdfs/layouts/Layout_FEBRABAN_CNAB240_ V_10_06.pdf',
  },
  {
    id: '???-outro-f9bf1d',
    bancoNumero: '???',
    bancoNome: 'Layout SPC BRASIL',
    tipoLayout: 'Outro',
    imagemURL: 'https://www.spcbrasil.com.br/_next/image?url=https%3A%2F%2Fwww.spcbrasil.com.br%2Fuploads%2Flogo_b770a0e7b5.png&w=1200&q=75',
    versao: '7.1',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: Layout_SPC_BRASIL_registro_e_cancelamento_v7-1.pdf`,
    atualizadoEm: '02/07/2012',
    pdfUrl: 'assets/pdfs/layouts/Layout_SPC_BRASIL_registro_e_cancelamento_v7-1.pdf',
  },
  {
    id: '???-outro-ce7ff9',
    bancoNumero: '???',
    bancoNome: 'LayoutCobrancaABCBrasil MAIO2020',
    tipoLayout: 'CNAB240',
    imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/ABC%20Brasil/logoabc-negativada.svg',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: LayoutCobrancaABCBrasil_MAIO2020.pdf`,
    atualizadoEm: '19/07/2021',
    pdfUrl: 'assets/pdfs/layouts/LayoutCobrancaABCBrasil_MAIO2020.pdf',
  },
  {
    id: '???-outro-959be0',
    bancoNumero: '???',
    bancoNome: 'Layouts Cust dia',
    tipoLayout: 'Outro',
    imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/ABC%20Brasil/logoabc-negativada.svg',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: Layouts_Cust__dia_de_Cheques_Remessa_Retorno.pdf`,
    atualizadoEm: '01/08/2012',
    pdfUrl: 'assets/pdfs/layouts/Layouts_Cust__dia_de_Cheques_Remessa_Retorno.pdf',
  },
  {
    id: '041-febraban-5418ee',
    bancoNumero: '041',
    bancoNome: 'Banrisul',
    tipoLayout: 'CNAB240',
    imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Banrisul/banrisul-logo-2023.svg',
    versao: '103.230',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: LeiauteBanrisulFebraban_pdr240_v103_23062023.pdf`,
    atualizadoEm: '03/23/0620',
    pdfUrl: 'assets/pdfs/layouts/LeiauteBanrisulFebraban_pdr240_v103_23062023.pdf',
  },
  {
    id: '???-cnab400-b79fe9',
    bancoNumero: '???',
    bancoNome: 'Manual CNAB 400',
    tipoLayout: 'CNAB400',
    imagemURL: 'https://www.idbanco.com.br/bancodigital/web/images/logo.png',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: Manual CNAB 400 - ID BANCO 439 - FEV.24 (1).pdf`,
    atualizadoEm: '13/12/2024',
    pdfUrl: 'assets/pdfs/layouts/Manual CNAB 400 - ID BANCO 439 - FEV.24 (1).pdf',
  },
  {
    id: '???-cnab400-3323cc',
    bancoNumero: '???',
    bancoNome: 'Manual de cobranca',
    tipoLayout: 'CNAB400',
    imagemURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQD9Lkqq-J5ivrXeZjWJFhgOSaXcmlyqUQxnA&s',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: Manual de cobranca CNAB400 - Kanastra (1).pdf`,
    atualizadoEm: '28/04/2025',
    pdfUrl: 'assets/pdfs/layouts/Manual de cobranca CNAB400 - Kanastra (1).pdf',
  },
  {
    id: '???-outro-18e504',
    bancoNumero: '???',
    bancoNome: 'Manual de Implantacao',
    tipoLayout: 'Outro',
    imagemURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQD9Lkqq-J5ivrXeZjWJFhgOSaXcmlyqUQxnA&s',
    versao: '2.2.1',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: Manual de Implantacao v2.2.1.pdf`,
    atualizadoEm: '13/02/2025',
    pdfUrl: 'assets/pdfs/layouts/Manual de Implantacao v2.2.1.pdf',
  },
  {
    id: '???-outro-d900a9',
    bancoNumero: '???',
    bancoNome: 'Manual Simplificado ',
    tipoLayout: 'Outro',
    imagemURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQD9Lkqq-J5ivrXeZjWJFhgOSaXcmlyqUQxnA&s',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: Manual Simplificado - Relato para Factorings v01.pdf`,
    atualizadoEm: '16/09/2005',
    pdfUrl: 'assets/pdfs/layouts/Manual Simplificado - Relato para Factorings v01.pdf',
  },
  {
    id: '???-outro-56160f',
    bancoNumero: '???',
    bancoNome: 'MANUAL BOLETOS BANCO',
    tipoLayout: 'Outro',
    imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/ABC%20Brasil/logoabc-negativada.svg',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: MANUAL_BOLETOS_BANCO_ABC_2021.pdf`,
    atualizadoEm: '19/07/2021',
    pdfUrl: 'assets/pdfs/layouts/MANUAL_BOLETOS_BANCO_ABC_2021.pdf',
  },
  {
    id: '???-cnab240-9fec94',
    bancoNumero: '???',
    bancoNome: 'Manual Leiaute CNAB240',
    tipoLayout: 'CNAB240',
    imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Sicoob/sicoob-vector-logo.svg',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: Manual_Leiaute_CNAB240_SIGCB.pdf`,
    atualizadoEm: '25/11/2016',
    pdfUrl: 'assets/pdfs/layouts/Manual_Leiaute_CNAB240_SIGCB.pdf',
  },
  {
    id: '208-outro-8c77fc',
    bancoNumero: '208',
    bancoNome: 'BTG Pactual',
    tipoLayout: 'Outro',
    imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Banco%20BTG%20Pacutal/btg-pactual.svg',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: Mascara boleto BTG PACTUAL.pdf`,
    atualizadoEm: '13/02/2025',
    pdfUrl: 'assets/pdfs/layouts/Mascara boleto BTG PACTUAL.pdf',
  },
  {
    id: '001-cnab240-41e829',
    bancoNumero: '001',
    bancoNome: 'Banco do Brasil',
    tipoLayout: 'CNAB240',
    imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Banco%20BTG%20Pacutal/btg-pactual.svg',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: MI - CBB - Manual CNAB 240.pdf`,
    atualizadoEm: '30/06/2020',
    pdfUrl: 'assets/pdfs/layouts/MI - CBB - Manual CNAB 240.pdf',
  },
  {
    id: '???-outro-f44504',
    bancoNumero: '???',
    bancoNome: 'bANCO BVA',
    tipoLayout: 'Outro',
    imagemURL: 'https://media.licdn.com/dms/image/v2/C4E0BAQHQNzT3SXsNuA/company-logo_200_200/company-logo_200_200/0/1635337472047/aulios_gmbh_logo?e=2147483647&v=beta&t=9bQz8Y5TL8JpUA2st32bfUOmqkWHN6w8HYCjQPdIYFg',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: Microsoft Word - novo lay-out banco bva versão 06-2008.pdf`,
    atualizadoEm: '21/07/2010',
    pdfUrl: 'assets/pdfs/layouts/Microsoft Word - novo lay-out banco bva versão 06-2008.pdf',
  },
  {
    id: '???-outro-6153ec',
    bancoNumero: '???',
    bancoNome: 'Microsoft Word ',
    tipoLayout: 'Outro',
    imagemURL: '',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: Microsoft Word - novo lay-out banco bva.pdf`,
    atualizadoEm: '21/12/2007',
    pdfUrl: 'assets/pdfs/layouts/Microsoft Word - novo lay-out banco bva.pdf',
  },
  {
    id: '237-outro-a6e92c',
    bancoNumero: '237',
    bancoNome: 'Bradesco',
    tipoLayout: 'Outro',
    imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Bradesco%20S.A/bradesco.svg',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: Multipag_Bradesco_v3prot.pdf`,
    atualizadoEm: '01/11/2024',
    pdfUrl: 'assets/pdfs/layouts/Multipag_Bradesco_v3prot.pdf',
  },
  {
    id: '???-outro-22e581',
    bancoNumero: '???',
    bancoNome: 'Novo Layout de',
    tipoLayout: 'Outro',
    imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Bradesco%20S.A/bradesco.svg',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: Novo Layout de Remessa Banco Paulista 2013.pdf`,
    atualizadoEm: '11/12/2013',
    pdfUrl: 'assets/pdfs/layouts/Novo Layout de Remessa Banco Paulista 2013.pdf',
  },
  {
    id: '???-febraban-8f6a8d',
    bancoNumero: '???',
    bancoNome: 'Padrão Febraban 240',
    tipoLayout: 'Febraban',
    imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Bradesco%20S.A/bradesco.svg',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: Padrão Febraban 240 bytes (pdf - 183Kb).pdf`,
    atualizadoEm: '21/12/2009',
    pdfUrl: 'assets/pdfs/layouts/Padrão Febraban 240 bytes (pdf - 183Kb).pdf',
  },
  {
    id: '???-outro-8a2f68',
    bancoNumero: '???',
    bancoNome: 'REAL COBRANCA 400',
    tipoLayout: 'Outro',
    imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Bradesco%20S.A/bradesco.svg',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: REAL_COBRANCA_400_POSICOES REAL.pdf`,
    atualizadoEm: '05/10/2005',
    pdfUrl: 'assets/pdfs/layouts/REAL_COBRANCA_400_POSICOES REAL.pdf',
  },
  {
    id: '033-cnab400-a38469',
    bancoNumero: '033',
    bancoNome: 'Santander', /**/
    tipoLayout: 'CNAB240',
    imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Banco%20Santander%20Brasil%20S.A/santander-fundo-vermelho.svg',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: SANTANDER_Layout CNAB 400 posições Out de 2009.pdf`,
    atualizadoEm: '11/06/2012',
    pdfUrl: 'assets/pdfs/layouts/SANTANDER_Layout CNAB 400 posições Out de 2009.pdf',
  },
  {
    id: '033-outro-8fff57',
    bancoNumero: '033',
    bancoNome: 'Santander',
    tipoLayout: 'CNAB240',
    imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Banco%20Santander%20Brasil%20S.A/santander-fundo-vermelho.svg',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: SANTANDER_Layout Cobrança 240 - 092009.pdf`,
    atualizadoEm: '11/06/2012',
    pdfUrl: 'assets/pdfs/layouts/SANTANDER_Layout Cobrança 240 - 092009.pdf',
  },
  {
    id: '001-outro-8ab3a3',
    bancoNumero: '001',
    bancoNome: 'Banco do Brasil',
    tipoLayout: 'CNAB240',
    imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Bradesco%20S.A/bradesco.svg',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: Sicoob_BB_240.pdf`,
    atualizadoEm: '15/07/2013',
    pdfUrl: 'assets/pdfs/layouts/Sicoob_BB_240.pdf',
  },
  {
    id: '748-cnab400-17e7b3',
    bancoNumero: '748',
    bancoNome: 'Sicredi',
    tipoLayout: 'CNAB400',
    imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Bradesco%20S.A/bradesco.svg',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: Sicredi manual cnab 400.pdf`,
    atualizadoEm: '21/07/2010',
    pdfUrl: 'assets/pdfs/layouts/Sicredi manual cnab 400.pdf',
  }, /**https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Sicredi/logo-svg2.svg */
  {
    id: '748-outro-f95417',
    bancoNumero: '748',
    bancoNome: 'Sicredi',
    tipoLayout: 'CNAB400',
    imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Sicredi/logo-svg2.svg',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: SICREDI_CED_240.pdf`,
    atualizadoEm: '03/12/2009',
    pdfUrl: 'assets/pdfs/layouts/SICREDI_CED_240.pdf',
  },
  {
    id: '748-outro-288a22',
    bancoNumero: '748',
    bancoNome: 'Sicredi',
    tipoLayout: 'CNAB400',
    imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Sicredi/logo-svg2.svg',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: SICREDI_CED_400.pdf`,
    atualizadoEm: '03/12/2009',
    pdfUrl: 'assets/pdfs/layouts/SICREDI_CED_400.pdf',
  },
  {
    id: '748-outro-3e5695',
    bancoNumero: '748',
    bancoNome: 'Sicredi',
    tipoLayout: 'CNAB400',
    imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Sicredi/logo-svg2.svg',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: SICREDI_MANUAL_CNAB_400.pdf`,
    atualizadoEm: '20/07/2021',
    pdfUrl: 'assets/pdfs/layouts/SICREDI_MANUAL_CNAB_400.pdf',
  },
  {
    id: '???-outro-e8c537',
    bancoNumero: '???',
    bancoNome: 'sofisa NOVO CNAB444',
    tipoLayout: 'Outro',
    imagemURL: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Banco%20Sofisa/logo-banco-sofisa.svg',
    status: 'Ativo',
    descricao: `PDF importado automaticamente: sofisa_NOVO_CNAB444.pdf`,
    atualizadoEm: '02/09/2019',
    pdfUrl: 'assets/pdfs/layouts/sofisa_NOVO_CNAB444.pdf',
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
