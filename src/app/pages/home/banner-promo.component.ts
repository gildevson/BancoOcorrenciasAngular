import { Component } from '@angular/core';

@Component({
  selector: 'app-banner-promo',
  standalone: true,
  template: `
    <div class="sponsor-wrap">
      <div class="sponsor-inner">

        <div class="sponsor-label">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
          </svg>
          Patrocinado
        </div>

        <div class="sponsor-card">

          <!-- Imagem / hero do patrocinador -->
          <div class="sponsor-img">
            <div class="sponsor-img-overlay">
              <span class="sponsor-brand">FinanBlue</span>
            </div>
          </div>

          <!-- Conteúdo -->
          <div class="sponsor-content">
            <div class="sponsor-tag">Finanças Pessoais</div>
            <h3 class="sponsor-title">
              Organize suas finanças e invista com inteligência em 2026
            </h3>
            <p class="sponsor-desc">
              Controle seus gastos, acompanhe investimentos e receba alertas de mercado em tempo real.
              Experimente grátis por 30 dias.
            </p>
            <div class="sponsor-cta-row">
              <a href="#" class="sponsor-cta" target="_blank" rel="noopener noreferrer">
                Saiba mais
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
              <span class="sponsor-site">finanblue.com.br</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  `,
  styles: [`
    .sponsor-wrap {
      background: #f8fafc;
      border-bottom: 1px solid #e0e7ef;
      padding: 12px 0;
    }
    .sponsor-inner {
      max-width: 1250px;
      margin: 0 auto;
      padding: 0 24px;
    }

    /* Label "Patrocinado" */
    .sponsor-label {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.6rem;
      font-weight: 700;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 8px;
    }

    /* Card */
    .sponsor-card {
      display: flex;
      align-items: stretch;
      border: 1px solid #e0e7ef;
      border-radius: 10px;
      overflow: hidden;
      background: #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      transition: box-shadow 0.2s;
    }
    .sponsor-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }

    /* Imagem lateral */
    .sponsor-img {
      width: 220px;
      flex-shrink: 0;
      background: linear-gradient(135deg, #1E3B65 0%, #0b2440 100%);
      position: relative;
      display: flex;
      align-items: flex-end;
    }
    .sponsor-img-overlay {
      padding: 14px;
      width: 100%;
    }
    .sponsor-brand {
      font-size: 1.1rem;
      font-weight: 900;
      color: #fff;
      letter-spacing: 1px;
    }

    /* Conteúdo */
    .sponsor-content {
      flex: 1;
      padding: 18px 22px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 6px;
    }
    .sponsor-tag {
      font-size: 0.62rem;
      font-weight: 800;
      color: #1E3B65;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    .sponsor-title {
      font-size: 1rem;
      font-weight: 700;
      color: #0b1a2d;
      line-height: 1.35;
      margin: 0;
    }
    .sponsor-desc {
      font-size: 0.78rem;
      color: #6b7280;
      line-height: 1.5;
      margin: 0;
      max-width: 600px;
    }
    .sponsor-cta-row {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-top: 4px;
    }
    .sponsor-cta {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #1E3B65;
      color: #fff;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 8px 18px;
      border-radius: 6px;
      text-decoration: none;
      transition: background 0.15s;
    }
    .sponsor-cta:hover { background: #162d4e; }
    .sponsor-site {
      font-size: 0.65rem;
      color: #9ca3af;
    }

    /* Responsivo */
    @media (max-width: 700px) {
      .sponsor-img { display: none; }
      .sponsor-inner { padding: 0 12px; }
    }
  `]
})
export class BannerPromoComponent {}
