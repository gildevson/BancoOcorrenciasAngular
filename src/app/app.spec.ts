import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: HomeComponent },

      // por enquanto redireciona (até criar as páginas)
      { path: 'consultar-ocorrencia', redirectTo: '', pathMatch: 'full' },
      { path: 'validadores', redirectTo: '', pathMatch: 'full' },
      { path: 'ocorrencias', redirectTo: '', pathMatch: 'full' },
      { path: 'motivos', redirectTo: '', pathMatch: 'full' },
      { path: 'noticias', redirectTo: '', pathMatch: 'full' },
      { path: 'informacoes', redirectTo: '', pathMatch: 'full' },
      { path: 'login', redirectTo: '', pathMatch: 'full' },
    ]
  },

  { path: '**', redirectTo: '' }
];
