// src/app/data/bancos.data.ts

export interface BancoData {
  id: string;        // GUID (se existir no backend)
  codigo: string;    // "237"
  nome: string;      // "Bradesco"
  logo: string;      // URL externa ou assets/...
  ativo?: boolean;   // opcional - indica se está disponível
}

export const BANCOS_DATA: BancoData[] = [
  {
    id: '8163f1b3-4b31-4d2c-9ae0-ef3095902730',
    codigo: '237',
    nome: 'Bradesco',
    logo: 'https://img.icons8.com/?size=100&id=IQoGuxn2kFxM&format=png&color=000000',
    ativo: true,
  },
  {
    id: 'd44d850e-b5da-4e28-a1ec-1bf69696ed71',
    codigo: '001',
    nome: 'Banco do Brasil',
    logo: 'https://logopng.com.br/logos/banco-do-brasil-5.png',
    ativo: true,
  },
  {
    id: '0f3f2581-b572-4e7e-8b89-2068b1641190',
    codigo: '341',
    nome: 'Itaú Unibanco',
    logo: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Ita%C3%BA%20Unibanco%20S.A/itau-fundo-azul.svg',
    ativo: true,
  },
  {
    id: 'ae2a0308-abe3-4aa1-a9cb-9cf9b597636e',
    codigo: '104',
    nome: 'Caixa Econômica Federal',
    logo: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Caixa%20Econ%C3%B4mica%20Federal/caixa-economica-federal-1.svg',
    ativo: true,
  },
  {
    id: 'b0118017-5e0b-41ba-97aa-7c9d0af94221',
    codigo: '033',
    nome: 'Santander',
    logo: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Banco%20Santander%20Brasil%20S.A/banco-santander-logo.svg',
    ativo: true,
    /*INSERT INTO ocorrencias_motivos(id, banco_id, ocorrencia, motivo, descricao)VALUES(gen_random_uuid(),'ae2a0308-abe3-4aa1-a9cb-9cf9b597636e'::uuid,*/
  },
  {
    id: '4aad7f3d-f26a-4cad-ab71-7fe86115a995',
    codigo: '041',
    nome: 'Banrisul',
    logo: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Banrisul/banrisul-logo-2023.svg',
    ativo: true, // Em breve
  },
  {
    id: '38a11456-ee76-4861-8b8b-d86bc94038de',
    codigo: '274',
    nome: 'Banco Grafeno',
    logo: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Grafeno/grafeno.svg',
    ativo: true,
    /*INSERT INTO ocorrencias_motivos(id, banco_id, ocorrencia, motivo, descricao)VALUES(gen_random_uuid(),'ae2a0308-abe3-4aa1-a9cb-9cf9b597636e'::uuid,*/
  },
  {
    id: '8253727a-1b36-41e6-b16f-b3e19caf0804',
    codigo: '422',
    nome: 'Banco Safra',
    logo: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Banco%20Safra%20S.A/logo-safra-nome.svg',
    ativo: false, // Em breve
  },
  {
    id: 'de7768cf-1c21-4af3-996a-650396ef412b',
    codigo: '756',
    nome: 'Banco Sicoob',
    logo: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Sicoob/sicoob-vector-logo.svg',
    ativo: true,
  },
  {
    id: 'e76f9df1-36e1-440a-be0b-6ba095321152',
    codigo: '756',
    nome: 'Banco LiveBank',
    logo: 'https://livework.com.vc/assets/app/media/img/gestor/logo-finanblue-livework.svg',
    ativo: true,
  },
   {
    id: 'bc09c7e7-a68f-4f78-ba69-8e0bd37bdd66',
    codigo: '320',
    nome: 'Bic banco',
    logo: 'https://images.seeklogo.com/logo-png/27/1/banco-bic-logo-png_seeklogo-277058.png',
    ativo: true,
  },
  {
    id: '37e09f1e-8d29-4827-baee-505079de5839',
    codigo: '213',
    nome: 'Banco arbi',
    logo: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Banco%20Arbi/Banco_Arbi%20.svg',
    ativo: true,
  },
   {
    id: '572a4b74-d565-4046-94cc-cd944364acdf',
    codigo: '748',
    nome: 'Banco Sicredi',
    logo: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Sicredi/logo-svg2.svg',
    ativo: true,
  },
  {
    id: '',
    codigo: '077',
    nome: 'Banco Inter',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Banco_Inter_logo.svg/512px-Banco_Inter_logo.svg.png',
    ativo: false,
  },
  {
    id: '',
    codigo: '260',
    nome: 'Nu Pagamentos',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Nubank_logo_2021.svg/512px-Nubank_logo_2021.svg.png',
    ativo: false,
  },
  {
    id: '',
    codigo: '212',
    nome: 'Banco Original',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Banco_Original_logo.svg/512px-Banco_Original_logo.svg.png',
    ativo: false, // Em breve
  },
  {
    id: '',
    codigo: '070',
    nome: 'BRB - Banco de Brasília',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/BRB_logo.svg/512px-BRB_logo.svg.png',
    ativo: false, // Em breve
  },
  {
    id: '',
    codigo: '208',
    nome: 'Banco BTG',
    logo: 'https://images.seeklogo.com/logo-png/27/1/banco-bic-logo-png_seeklogo-277058.png',
    ativo: false,
  },
];
