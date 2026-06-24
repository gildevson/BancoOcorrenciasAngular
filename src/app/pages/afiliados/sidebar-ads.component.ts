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
    .sidebar {
      position: fixed;
      top: 80px;
      width: 160px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      z-index: 100;
    }

    .sidebar-left  { left: 6px; }
    .sidebar-right { right: 6px; }

    @media (max-width: 1620px) {
      .sidebar { display: none; }
    }

    .ad-card {
      background: #fff;
      border: 1px solid #dde6f0;
      border-radius: 12px;
      overflow: hidden;
      text-decoration: none;
      display: flex;
      flex-direction: column;
      box-shadow: 0 2px 8px rgba(0,0,0,0.07);
      transition: transform 0.2s, box-shadow 0.2s;
      position: relative;
    }

    .ad-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(0,43,73,0.13);
      border-color: #002B49;
    }

    .ad-label {
      position: absolute;
      top: 6px;
      right: 6px;
      background: #fff3cd;
      color: #856404;
      font-size: 0.6rem;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 20px;
      border: 1px solid #ffc107;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .ad-img {
      width: 100%;
      height: 130px;
      background: #f8f9fa;
      display: flex;
      align-items: center;
      justify-content: center;
      border-bottom: 1px solid #f0f4f8;
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
      color: #002B49;
      font-weight: 600;
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
      background: #002B49;
      color: #fff;
      font-size: 0.72rem;
      font-weight: 700;
      text-align: center;
      padding: 6px;
      border-radius: 6px;
      transition: background 0.2s;
    }

    .ad-card:hover .ad-btn {
      background: #003d6b;
    }
  `]
})
export class SidebarAdsComponent {
  esquerda = [
    {
      nome: 'Creatina 250g Growth Supplements',
      link: 'https://meli.la/157qc6t',
      icon: 'fitness_center',
      imagem: ''
    },
    {
      nome: 'Aquecedor Quartzo 800w',
      link: 'https://meli.la/13aQZdD',
      icon: 'fireplace',
      imagem: ''
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
