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
    id: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
    codigo: '756',
    nome: 'Bancoob',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Sicoob_logo.svg/512px-Sicoob_logo.svg.png',
    ativo: true,
  },
  {
    id: 'a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6',
    codigo: '077',
    nome: 'Banco Inter',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Banco_Inter_logo.svg/512px-Banco_Inter_logo.svg.png',
    ativo: true,
  },
  {
    id: 'f6e5d4c3-b2a1-0f9e-8d7c-6b5a4f3e2d1c',
    codigo: '260',
    nome: 'Nu Pagamentos',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Nubank_logo_2021.svg/512px-Nubank_logo_2021.svg.png',
    ativo: true,
  },
  {
    id: '4aad7f3d-f26a-4cad-ab71-7fe86115a995',
    codigo: '041',
    nome: 'Banrisul',
    logo: 'https://raw.githubusercontent.com/Tgentil/Bancos-em-SVG/73d82e89efe74b80154053f560f50e16d981c351/Banrisul/banrisul-logo-2023.svg',
    ativo: true, // Em breve
  },
  {
    id: '',
    codigo: '422',
    nome: 'Banco Safra',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Banco_Safra_logo.svg/512px-Banco_Safra_logo.svg.png',
    ativo: false, // Em breve
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
];
