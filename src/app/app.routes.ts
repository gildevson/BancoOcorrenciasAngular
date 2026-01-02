import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  // HOME
  { path: '', component: HomeComponent },

  // PÁGINAS PÚBLICAS
  {
    path: 'financas',
    loadComponent: () =>
      import('./pages/financehighlights/financehighlights.component')
        .then(m => m.FinanceHighlightsComponent),
  },
  {
    path: 'noticias',
    loadComponent: () =>
      import('./pages/noticias/noticias.component')
        .then(m => m.NoticiasComponent),
  },
  {
    path: 'noticia/:slug',
    loadComponent: () =>
      import('./pages/noticiadetalhe.component/noticiadetalhe.component')
        .then(m => m.NoticiaDetalheComponent),
  },
  {
    path: 'layouts',
    loadComponent: () =>
      import('./pages/layouts/layouts.component')
        .then(m => m.LayoutsComponent),
  },
  {
    path: 'ocorrencia',
    loadComponent: () =>
      import('./pages/ocorrencia/ocorrencia.component')
        .then(m => m.ConsultarOcorrenciaComponent),
  },
  {
    path: 'bancos',
    loadComponent: () =>
      import('./pages/bancos/bancos.component')
        .then(m => m.BancosComponent),
  },

  // ===============================
  // CALCULADORA (Shell + Filhas)
  // ===============================
 {
  path: 'calculadora',
  loadComponent: () =>
    import('./pages/calculadora/calculadoraShell/calculadora.shell')
      .then(m => m.CalculadoraShellComponent),
  children: [
    {
      path: '',
      pathMatch: 'full',
      loadComponent: () =>
        import('./pages/calculadora/calculadoraLista/listacalculadora.component')
          .then(m => m.ListaCalculadoraComponent),
    },
    {
      path: 'desagio',
      loadComponent: () =>
        import('./pages/calculadora/calculadoraDesagio/calculadoraDesagio.component')
          .then(m => m.CalculadoraDesagioComponent),
    },
    {
      path: 'mora',
      loadComponent: () =>
        import('./pages/calculadora/calculadoraMora/calculadoraMora.component')
          .then(m => m.CalculadoraMoraComponent),
    },
    {
      path: 'juros',
      loadComponent: () =>
        import('./pages/calculadora/calculadoraJuros/calculadoraJuros.component')
          .then(m => m.CalculadoraJurosComponent),
    },
    {
      path: 'multa',
      loadComponent: () =>
        import('./pages/calculadora/calculadoraMulta/calculadoraMulta.component')
          .then(m => m.CalculadoraMultaComponent),
    },
  ],
},


  // MODAIS
  {
    path: 'login',
    outlet: 'modal',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'forgot-password',
    outlet: 'modal',
    loadComponent: () =>
      import('./pages/forgotpassword/forgot.password.component')
        .then(m => m.ForgotPasswordComponent),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/resetpasswordcomponent/resetpassword.component')
        .then(m => m.ResetPasswordComponent),
  },

  // ADMIN
  {
    path: 'edicoes-ocorrencias',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'SUPERVISOR'] },
    loadComponent: () =>
      import('./pages/edicoesocorrencias/editarocorrencias.shell.component')
        .then(m => m.EdicoesOcorrenciasShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'pesquisar' },
      {
        path: 'pesquisar',
        loadComponent: () =>
          import('./pages/edicoesocorrencias/edicoesocorrencias.pesquisar.component')
            .then(m => m.EdicoesOcorrenciasPesquisarComponent),
      },
      {
        path: 'novo',
        loadComponent: () =>
          import('./pages/edicoesocorrencias/edicoesocorrencias.novo.component')
            .then(m => m.EdicoesOcorrenciasNovoComponent),
      },
      {
        path: 'editar/:bancoId/:ocorrencia/:motivo',
        loadComponent: () =>
          import('./pages/edicoesocorrencias/edicoesocorrencias.editar.component')
            .then(m => m.EdicoesOcorrenciasEditarComponent),
      },
    ],
  },

  // fallback
  { path: '**', redirectTo: '' },
];
