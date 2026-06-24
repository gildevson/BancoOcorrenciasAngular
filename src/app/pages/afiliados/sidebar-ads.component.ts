import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar-ads',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="sidebar sidebar-left">
      @for (p of esquerda; track p.link) {
        <a [href]="p.link" target="_blank" rel="noopener sponsored" class="ad-card">
          <span class="ad-label">Parceiro</span>
          <div class="ad-img">
            @if (p.imagem) {
              <img [src]="p.imagem" [alt]="p.nome" loading="lazy">
            } @else {
              <span class="material-icons">{{ p.icon }}</span>
            }
          </div>
          <p class="ad-nome">{{ p.nome }}</p>
          <div class="ad-btn">Ver oferta</div>
        </a>
      }
    </aside>

    <aside class="sidebar sidebar-right">
      @for (p of direita; track p.link) {
        <a [href]="p.link" target="_blank" rel="noopener sponsored" class="ad-card">
          <span class="ad-label">Parceiro</span>
          <div class="ad-img">
            @if (p.imagem) {
              <img [src]="p.imagem" [alt]="p.nome" loading="lazy">
            } @else {
              <span class="material-icons">{{ p.icon }}</span>
            }
          </div>
          <p class="ad-nome">{{ p.nome }}</p>
          <div class="ad-btn">Ver oferta</div>
        </a>
      }
    </aside>
  `,
  styles: [`
    :host {
      display: contents;
    }

    .sidebar {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 8px 4px;
      align-self: start;
      position: sticky;
      top: 68px;
    }

    .sidebar-left  { grid-column: 1; }
    .sidebar-right { grid-column: 3; }

    @media (max-width: 1620px) {
      .sidebar { display: none; }
    }

    .ad-card {
      background: #fff;
      border: 2px solid transparent;
      border-radius: 14px;
      overflow: hidden;
      text-decoration: none;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 14px rgba(0,0,0,0.12);
      transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
      position: relative;
    }

    .ad-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 28px rgba(255,80,0,0.18);
      border-color: #ff5000;
    }

    .ad-label {
      position: absolute;
      top: 7px;
      right: 7px;
      background: linear-gradient(135deg, #ff5000, #ff8c00);
      color: #fff;
      font-size: 0.6rem;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 2px 6px rgba(255,80,0,0.4);
    }

    .ad-img {
      width: 100%;
      height: 110px;
      background: linear-gradient(135deg, #f0f4ff, #e8f0fe);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ad-img img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 8px;
    }

    .ad-img .material-icons {
      font-size: 40px;
      color: #002B49;
      opacity: 0.35;
    }

    .ad-nome {
      font-size: 0.72rem;
      color: #111;
      font-weight: 700;
      padding: 8px 8px 4px;
      margin: 0;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .ad-btn {
      margin: 4px 8px 8px;
      background: linear-gradient(135deg, #ff5000, #ff8c00);
      color: #fff;
      font-size: 0.72rem;
      font-weight: 800;
      text-align: center;
      padding: 7px;
      border-radius: 8px;
      transition: opacity 0.2s;
      box-shadow: 0 3px 10px rgba(255,80,0,0.35);
      letter-spacing: 0.3px;
    }

    .ad-card:hover .ad-btn {
      opacity: 0.88;
    }
  `]
})
export class SidebarAdsComponent {
  esquerda = [
    {
      nome: 'Aquecedor Doméstico Quartzo 800w',
      link: 'https://meli.la/13aQZdD',
      icon: 'fireplace',
      imagem: 'https://http2.mlstatic.com/D_NQ_NP_2X_794742-MLB110800884863_042026-F.webp'
    },
    {
      nome: 'Controle Sem Fio 8BitDo Ultimate V2',
      link: 'https://meli.la/13aQZdD',
      icon: 'sports_esports',
      imagem: 'https://http2.mlstatic.com/D_Q_NP_635211-MLA99875592941_112025-R.webp'
    }
  ];

  direita = [
    {
      nome: 'Creatina 250g Growth Supplements',
      link: 'https://meli.la/1zTwCX3',
      icon: 'fitness_center',
      imagem: ''
    },
    {
      nome: 'Controle 8BitDo Ultimate V2 Violeta',
      link: 'https://meli.la/13aQZdD',
      icon: 'sports_esports',
      imagem: 'https://http2.mlstatic.com/D_Q_NP_661186-MLA91562670042_092025-R.webp'
    }
  ];
}
