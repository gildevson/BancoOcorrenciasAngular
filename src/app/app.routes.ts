import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },

  { path: 'financas', loadComponent: () => import('./pages/financehighlights/financehighlights.component').then(m => m.FinanceHighlightsComponent) },
  { path: 'noticias', loadComponent: () => import('./pages/noticias/noticias.component').then(m => m.NoticiasComponent) },
  { path: 'noticia/:slug', loadComponent: () => import('./pages/noticiadetalhe.component/noticiadetalhe.component').then(m => m.NoticiaDetalheComponent) },
  { path: 'layouts', loadComponent: () => import('./pages/layouts/layouts.component').then(m => m.LayoutsComponent) },
  { path: 'ocorrencia', loadComponent: () => import('./pages/ocorrencia/ocorrencia.component').then(m => m.ConsultarOcorrenciaComponent) },
  { path: 'bancos', loadComponent: () => import('./pages/bancos/bancos.component').then(m => m.BancosComponent) },

  // modais auth
  { path: 'login', outlet: 'modal', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'forgot-password', outlet: 'modal', loadComponent: () => import('./pages/forgotpassword/forgot.password.component').then(m => m.ForgotPasswordComponent) },
  { path: 'reset-password', loadComponent: () => import('./pages/resetpasswordcomponent/resetpassword.component').then(m => m.ResetPasswordComponent) },

  // ✅ Área de edições
  {
    path: 'financas',
    loadComponent: () => import('./pages/financehighlights/financehighlights.component')
      .then(m => m.FinanceHighlightsComponent)
  },

  {
    path: 'noticias',
    loadComponent: () => import('./pages/noticias/noticias.component')
      .then(m => m.NoticiasComponent)
  },

  {
    path: 'noticia/:slug',
    loadComponent: () => import('./pages/noticiadetalhe.component/noticiadetalhe.component')
      .then(m => m.NoticiaDetalheComponent)
  },

  {
    path: 'layouts',
    loadComponent: () => import('./pages/layouts/layouts.component')
      .then(m => m.LayoutsComponent)
  },

  {
    path: 'ocorrencia',
    loadComponent: () => import('./pages/ocorrencia/ocorrencia.component')
      .then(m => m.ConsultarOcorrenciaComponent)
  },

  {
    path: 'bancos',
    loadComponent: () => import('./pages/bancos/bancos.component')
      .then(m => m.BancosComponent)
  },

  // ===============================================
  // MODAIS DE AUTENTICAÇÃO
  // ===============================================
  {
    path: 'login',
    outlet: 'modal',
    loadComponent: () => import('./pages/login/login.component')
      .then(m => m.LoginComponent)
  },

  {
    path: 'forgot-password',
    outlet: 'modal',
    loadComponent: () => import('./pages/forgotpassword/forgot.password.component')
      .then(m => m.ForgotPasswordComponent)
  },

  {
    path: 'reset-password',
    loadComponent: () => import('./pages/resetpasswordcomponent/resetpassword.component')
      .then(m => m.ResetPasswordComponent)
  },

  {
    path: 'calculadora',
    loadComponent: () => import('./pages/calculadoracomponent/calculadora.component')
      .then(m => m.CalculadoraComponent)
  },

  // ===============================================
  // ÁREA ADMINISTRATIVA - EDIÇÕES DE OCORRÊNCIAS
  // ===============================================
  {
    path: 'edicoes-ocorrencias',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'SUPERVISOR'] },
    loadComponent: () => import('./pages/edicoesocorrencias/editarocorrencias.shell.component')
      .then(m => m.EdicoesOcorrenciasShellComponent),
    children: [
      // Redireciona para pesquisar por padrão
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'pesquisar'
      },

      // Pesquisar ocorrências
      {
        path: 'pesquisar',
        loadComponent: () => import('./pages/edicoesocorrencias/edicoesocorrencias.pesquisar.component')
          .then(m => m.EdicoesOcorrenciasPesquisarComponent)
      },

      // Nova ocorrência/motivo
      {
        path: 'novo',
        loadComponent: () => import('./pages/edicoesocorrencias/edicoesocorrencias.novo.component')
          .then(m => m.EdicoesOcorrenciasNovoComponent)
      },

      // Editar ocorrência/motivo
      {
        path: 'editar/:bancoId/:ocorrencia/:motivo',
        loadComponent: () => import('./pages/edicoesocorrencias/edicoesocorrencias.editar.component')
          .then(m => m.EdicoesOcorrenciasEditarComponent)
      },
      // ✅ ADICIONE ESTA LINHA após as outras rotas


    ]
  },

  // ===============================================
  // FALLBACK - REDIRECIONA PARA HOME
  // ===============================================
  {
    path: '**',
    redirectTo: ''
  }
];
