import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Produto {
  nome: string;
  descricao: string;
  link: string;
  icon: string;
  imagem?: string;
}

@Component({
  selector: 'app-afiliados',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="afiliados-section">
      <div class="afiliados-inner">
        <div class="afiliados-header">
          <span class="material-icons">storefront</span>
          <div>
            <h2>Produtos Recomendados</h2>
            <p>Selecionamos produtos úteis para você</p>
          </div>
        </div>

        <div class="produtos-grid">
          <a
            *ngFor="let p of produtos"
            [href]="p.link"
            target="_blank"
            rel="noopener sponsored"
            class="produto-card"
          >
            <span class="afiliado-badge">Parceiro</span>

            <div class="produto-img">
              @if (p.imagem) {
                <img [src]="p.imagem" [alt]="p.nome" loading="lazy">
              } @else {
                <span class="material-icons fallback-icon">{{ p.icon }}</span>
              }
            </div>

            <div class="produto-info">
              <h3>{{ p.nome }}</h3>
              <p>{{ p.descricao }}</p>
            </div>

            <div class="ver-oferta">
              <span>Ver oferta</span>
              <span class="material-icons">open_in_new</span>
            </div>
          </a>
        </div>

        <p class="disclosure">
          <span class="material-icons">info</span>
          Links de afiliado: podemos receber comissão por compras feitas através destes links, sem custo extra para você.
        </p>
      </div>
    </section>
  `,
  styles: [`
    .afiliados-section {
      background: #f0f4f8;
      padding: 48px 24px;
      border-top: 1px solid #e0e8f0;
    }

    .afiliados-inner {
      max-width: 1100px;
      margin: 0 auto;
    }

    .afiliados-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 28px;
    }

    .afiliados-header .material-icons {
      font-size: 36px;
      color: #002B49;
    }

    .afiliados-header h2 {
      font-size: 1.3rem;
      color: #002B49;
      margin: 0 0 2px;
    }

    .afiliados-header p {
      font-size: 0.875rem;
      color: #666;
      margin: 0;
    }

    .produtos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 20px;
      margin-bottom: 16px;
    }

    .produto-card {
      position: relative;
      background: #fff;
      border: 1px solid #dde6f0;
      border-radius: 14px;
      padding: 0 0 16px;
      text-decoration: none;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      overflow: hidden;
    }

    .produto-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,43,73,0.12);
      border-color: #002B49;
    }

    .afiliado-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      background: #fff3cd;
      color: #856404;
      font-size: 0.68rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 20px;
      border: 1px solid #ffc107;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      z-index: 1;
    }

    .produto-img {
      width: 100%;
      height: 180px;
      background: #f8f9fa;
      display: flex;
      align-items: center;
      justify-content: center;
      border-bottom: 1px solid #f0f4f8;
      overflow: hidden;
    }

    .produto-img img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 12px;
    }

    .fallback-icon {
      font-size: 52px;
      color: #002B49;
      opacity: 0.4;
    }

    .produto-info {
      padding: 0 16px;
      flex: 1;
    }

    .produto-info h3 {
      font-size: 0.9rem;
      color: #002B49;
      font-weight: 600;
      margin: 0 0 6px;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .produto-info p {
      font-size: 0.8rem;
      color: #666;
      margin: 0;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .ver-oferta {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #fff;
      background: #002B49;
      font-size: 0.85rem;
      font-weight: 700;
      margin: 4px 16px 0;
      padding: 8px 14px;
      border-radius: 8px;
      justify-content: center;
      transition: background 0.2s;
    }

    .produto-card:hover .ver-oferta {
      background: #003d6b;
    }

    .ver-oferta .material-icons {
      font-size: 15px;
    }

    .disclosure {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      font-size: 0.775rem;
      color: #999;
      margin: 0;
    }

    .disclosure .material-icons {
      font-size: 15px;
      flex-shrink: 0;
      margin-top: 1px;
    }
  `]
})
export class AfiliadosComponent {
  produtos: Produto[] = [
    {
      nome: 'Creatina Monohidratada 250g Growth Supplements',
      descricao: 'Sem sabor em pó. Aumenta força, resistência e performance nos treinos.',
      link: 'https://meli.la/157qc6t',
      icon: 'fitness_center'
    },
    {
      nome: 'Aquecedor Doméstico Quartzo 800w',
      descricao: 'Proteção contra superaquecimento, ideal para ambientes residenciais.',
      link: 'https://meli.la/13aQZdD',
      icon: 'fireplace'
    },
    {
      nome: 'Creatina Monohidratada 250g Growth Supplements',
      descricao: 'Sem sabor em pó. Aumenta força, resistência e performance nos treinos.',
      link: 'https://meli.la/1zTwCX3',
      icon: 'fitness_center'
    },
    {
      nome: 'Controle Sem Fio 8BitDo Ultimate V2',
      descricao: 'Android e Windows, cor Violeta. Alta precisão para jogos mobile e PC.',
      link: 'https://meli.la/13aQZdD',
      icon: 'sports_esports',
      imagem: 'https://http2.mlstatic.com/D_Q_NP_661186-MLA91562670042_092025-R.webp'
    }
  ];
}
