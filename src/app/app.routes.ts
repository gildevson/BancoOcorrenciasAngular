import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';


export const routes: Routes = [
  { path: '', component: HomeComponent },

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



  { path: '**', redirectTo: '' },
];


