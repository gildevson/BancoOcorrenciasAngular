import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },

  {
    path: 'noticias',
    loadComponent: () =>
      import('./pages/noticias/noticias.component').then(m => m.NoticiasComponent),
  },

  {
    path: 'noticia/:slug',
    loadComponent: () =>
      import('./pages/noticiadetalhe.component/noticiadetalhe.component')
        .then(m => m.NoticiaDetalheComponent),
  },

  { path: '**', redirectTo: '' },
];
