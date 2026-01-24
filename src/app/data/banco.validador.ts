export interface Validador {
  nome: string;
  routerLink: string;
}

export interface BancoData {
  nome: string;
  codigo: string;
  logo: string;
  validadores?: Validador[];
}

export const BANCOS_DATA: BancoData[] = [
  {
    nome: 'Bradesco',
    codigo: '237',
    logo: 'assets/logos/bradesco.png',
    validadores: [
      { nome: 'CNAB 240', routerLink: '/validador/bradesco/cnab240' },
      { nome: 'CNAB 400', routerLink: '/validador/bradesco/cnab400' }
    ]
  },
  {
    nome: 'Banco do Brasil',
    codigo: '001',
    logo: 'assets/logos/bb.png',
    validadores: [] // Em breve
  },
  {
    nome: 'Itaú',
    codigo: '341',
    logo: 'assets/logos/itau.png',
    validadores: [] // Em breve
  },
  {
    nome: 'Santander',
    codigo: '033',
    logo: 'assets/logos/santander.png',
    validadores: [] // Em breve
  },
  {
    nome: 'Caixa Econômica',
    codigo: '104',
    logo: 'assets/logos/caixa.png',
    validadores: [] // Em breve
  },
  {
    nome: 'Sicoob',
    codigo: '756',
    logo: 'assets/logos/sicoob.png',
    validadores: [] // Em breve
  },
  {
    nome: 'Banrisul',
    codigo: '041',
    logo: 'assets/logos/banrisul.png',
    validadores: [] // Em breve
  },
  {
    nome: 'Sicredi',
    codigo: '748',
    logo: 'assets/logos/sicredi.png',
    validadores: [] // Em breve
  }
];
