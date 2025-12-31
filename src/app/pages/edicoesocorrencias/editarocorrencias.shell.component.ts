import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-edicoes-ocorrencias-shell',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
  <section class="wrap">
    <header class="top">
      <h2>Edições de Ocorrências</h2>

      <nav class="tabs">
        <a routerLink="pesquisar" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
          Pesquisar
        </a>
        <a routerLink="novo" routerLinkActive="active">
          Nova Ocorrência/Motivo
        </a>
      </nav>
    </header>

    <router-outlet></router-outlet>
  </section>
  `,
  styles: [`
    .wrap{ padding:16px; }
    .top{ display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;}
    .tabs{ display:flex; gap:10px; }
    .tabs a{ padding:10px 12px; border-radius:999px; text-decoration:none; }
    .tabs a.active{ font-weight:700; }
  `]
})
export class EdicoesOcorrenciasShellComponent {}
