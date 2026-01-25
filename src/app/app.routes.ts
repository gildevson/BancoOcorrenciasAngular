import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  // ===============================
  // HOME
  // ===============================
  {
    path: '',
    component: HomeComponent,
    title: 'Início'
  },

  // ===============================
  // PÁGINAS PÚBLICAS
  // ===============================
  {
    path: 'financas',
    title: 'Finanças em Destaque',
    loadComponent: () =>
      import('./pages/financehighlights/financehighlights.component')
        .then(m => m.FinanceHighlightsComponent),
  },
  {
    path: 'noticias',
    title: 'Notícias',
    loadComponent: () =>
      import('./pages/noticias/noticias.component')
        .then(m => m.NoticiasComponent),
  },
  {
    path: 'noticia/:slug',
    title: 'Detalhes da Notícia',
    loadComponent: () =>
      import('./pages/noticiadetalhe.component/noticiadetalhe.component')
        .then(m => m.NoticiaDetalheComponent),
  },
  {
    path: 'layouts',
    title: 'Layouts',
    loadComponent: () =>
      import('./pages/layouts/layouts.component')
        .then(m => m.LayoutsComponent),
  },
  {
    path: 'ocorrencia',
    title: 'Consultar Ocorrência',
    loadComponent: () =>
      import('./pages/ocorrencia/ocorrencia.component')
        .then(m => m.ConsultarOcorrenciaComponent),
  },
  {
    path: 'validadores',
    title: 'Validadores de Bancos',
    loadComponent: () =>
      import('./pages/validadores/listaValidadores.component')
        .then(m => m.ListaValidadoresComponent),
  },
  {
    path: 'validadores/bradesco/cnab400',
    title: 'Validador Bradesco CNAB 400',
    loadComponent: () =>
      import('./pages/validadores/bradesco/bradesco-cnab400-validador.component')
        .then(m => m.BradescoCnab400ValidadorComponent),
  },
  {
    path: 'validadores/bradesco/cnab240',
    title: 'Validador Bradesco CNAB 240',
    loadComponent: () =>
      import('./pages/validadores/bradesco/bradesco-cnab240-validador.component')
        .then(m => m.BradescoCnab240ValidadorComponent),
  },
  {
    path: 'validadores/bradesco/retorno400',
    title: 'Validador Retorno Bradesco CNAB 400',
    loadComponent: () =>
      import('./pages/validadores/bradesco/bradesco-retorno400-validador.component')
        .then(m => m.BradescoRetorno400ValidadorComponent),
  },
  {
    path: 'validadores/bradesco/retorno240',
    title: 'Validador Retorno Bradesco CNAB 240',
    loadComponent: () =>
      import('./pages/validadores/bradesco/bradesco-retorno240-validador.component')
        .then(m => m.BradescoRetorno240ValidadorComponent),
  },
  {
    path: 'validadores/paulista/cnab400',
    title: 'Validador Banco Paulista/Frontis CNAB 400/444',
    loadComponent: () =>
      import('./pages/validadores/paulista/paulistacnab400-validador.component')
        .then(m => m.PaulistaCnab400ValidadorComponent),
  },

  // ===============================
  // CALCULADORAS (Shell + Rotas Filhas)
  // ===============================
  {
    path: 'calculadora',
    title: 'Calculadoras Financeiras',
    loadComponent: () =>
      import('./pages/calculadora/calculadoraShell/calculadora.shell')
        .then(m => m.CalculadoraShellComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'Lista de Calculadoras',
        loadComponent: () =>
          import('./pages/calculadora/calculadoraLista/listacalculadora.component')
            .then(m => m.ListaCalculadoraComponent),
      },
      {
        path: 'desagio',
        title: 'Calculadora de Deságio',
        loadComponent: () =>
          import('./pages/calculadora/calculadoraDesagio/calculadoraDesagio.component')
            .then(m => m.CalculadoraDesagioComponent),
      },
      {
        path: 'mora',
        title: 'Calculadora de Juros de Mora',
        loadComponent: () =>
          import('./pages/calculadora/calculadoraMora/calculadoraMora.component')
            .then(m => m.CalculadoraMoraComponent),
      },
      {
        path: 'juros',
        title: 'Calculadora de Juros',
        loadComponent: () =>
          import('./pages/calculadora/calculadoraJuros/calculadoraJuros.component')
            .then(m => m.CalculadoraJurosComponent),
      },
      {
        path: 'multa',
        title: 'Calculadora de Multa',
        loadComponent: () =>
          import('./pages/calculadora/calculadoraMulta/calculadoraMulta.component')
            .then(m => m.CalculadoraMultaComponent),
      },
      {
        path: 'iof',
        title: 'Simulador de IOF',
        loadComponent: () =>
          import('./pages/calculadora/calculadoraIof/calculadoraiof.component')
            .then(m => m.CalculadoraIofComponent),
      },
    ],
  },

  // ===============================
  // AUTENTICAÇÃO (Modais e Recuperação)
  // ===============================
  {
    path: 'login',
    outlet: 'modal',
    title: 'Login',
    loadComponent: () =>
      import('./pages/login/login.component')
        .then(m => m.LoginComponent),
  },
  {
    path: 'forgot-password',
    outlet: 'modal',
    title: 'Esqueci a Senha',
    loadComponent: () =>
      import('./pages/forgotpassword/forgot.password.component')
        .then(m => m.ForgotPasswordComponent),
  },
  {
    path: 'reset-password',
    title: 'Redefinir Senha',
    loadComponent: () =>
      import('./pages/resetpasswordcomponent/resetpassword.component')
        .then(m => m.ResetPasswordComponent),
  },

  // ===============================
  // ÁREA ADMINISTRATIVA - NOTÍCIAS
  // ===============================
  {
    path: 'noticias-admin',
    title: 'Gerenciar Notícias',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () =>
      import('./pages/noticiasadmin/noticiasadmin.component')
        .then(m => m.NoticiasAdminComponent),
  },
  {
    path: 'noticias/cadastrar',
    title: 'Cadastrar Notícia',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () =>
      import('./pages/noticiacadastrar/noticia.cadastrar.component')
        .then(m => m.NoticiaCadastrarComponent),
  },
  {
    path: 'noticias/editar/:id',
    title: 'Editar Notícia',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () =>
      import('./pages/noticiaseditar/noticiaseditar.component')
        .then(m => m.NoticiasEditarComponent),
  },

  // ===============================
  // ÁREA ADMINISTRATIVA - OCORRÊNCIAS
  // ===============================
  {
    path: 'edicoes-ocorrencias',
    title: 'Edições de Ocorrências',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'SUPERVISOR'] },
    loadComponent: () =>
      import('./pages/edicoesocorrencias/editarocorrencias.shell.component')
        .then(m => m.EdicoesOcorrenciasShellComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'pesquisar'
      },
      {
        path: 'pesquisar',
        title: 'Pesquisar Ocorrências',
        loadComponent: () =>
          import('./pages/edicoesocorrencias/edicoesocorrencias.pesquisar.component')
            .then(m => m.EdicoesOcorrenciasPesquisarComponent),
      },
      {
        path: 'novo',
        title: 'Nova Ocorrência',
        loadComponent: () =>
          import('./pages/edicoesocorrencias/edicoesocorrencias.novo.component')
            .then(m => m.EdicoesOcorrenciasNovoComponent),
      },
      {
        path: 'editar/:bancoId/:ocorrencia/:motivo',
        title: 'Editar Ocorrência',
        loadComponent: () =>
          import('./pages/edicoesocorrencias/edicoesocorrencias.editar.component')
            .then(m => m.EdicoesOcorrenciasEditarComponent),
      },
    ],
  },

  // ===============================
  // FALLBACK - ROTA NÃO ENCONTRADA
  // ===============================
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  },
];
