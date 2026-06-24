import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Produto {
  nome: string;
  descricao: string;
  link: string;
  icon: string;
  badge?: string;
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
            <div class="produto-icon">
              <span class="material-icons">{{ p.icon }}</span>
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
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 20px;
      margin-bottom: 16px;
    }

    .produto-card {
      position: relative;
      background: #fff;
      border: 1px solid #dde6f0;
      border-radius: 14px;
      padding: 24px 20px 20px;
      text-decoration: none;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .produto-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,43,73,0.12);
      border-color: #002B49;
    }

    .afiliado-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: #fff3cd;
      color: #856404;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 20px;
      border: 1px solid #ffc107;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .produto-icon {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #002B49, #1a5276);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .produto-icon .material-icons {
      font-size: 28px;
      color: #fff;
    }

    .produto-info h3 {
      font-size: 0.95rem;
      color: #002B49;
      font-weight: 600;
      margin: 0 0 6px;
      line-height: 1.4;
    }

    .produto-info p {
      font-size: 0.825rem;
      color: #666;
      margin: 0;
      line-height: 1.5;
    }

    .ver-oferta {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #002B49;
      font-size: 0.875rem;
      font-weight: 700;
      margin-top: auto;
      padding-top: 8px;
      border-top: 1px solid #f0f4f8;
    }

    .ver-oferta .material-icons {
      font-size: 16px;
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
      nome: 'Creatina Monohidratada 250g Growth',
      descricao: 'Suplemento em pó sem sabor, ideal para ganho de força e massa muscular.',
      link: 'https://meli.la/157qc6t',
      icon: 'fitness_center',
      badge: 'Parceiro'
    },
    {
      nome: 'Aquecedor Doméstico Quartzo 800w',
      descricao: 'Proteção contra superaquecimento, ideal para ambientes residenciais.',
      link: 'https://meli.la/13aQZdD',
      icon: 'fireplace',
      badge: 'Parceiro'
    },
    {
      nome: 'Creatina Monohidratada 250g Growth Supplements',
      descricao: 'Sem sabor em pó. Aumenta força, resistência e performance nos treinos.',
      link: 'https://meli.la/1zTwCX3',
      icon: 'fitness_center',
      badge: 'Parceiro'
    }
  ];
}
