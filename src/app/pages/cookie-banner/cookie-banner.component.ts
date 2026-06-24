import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CookieConsentService } from '../../service/cookie-consent.service';

@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="cookie-banner" *ngIf="visible">
      <div class="cookie-content">
        <span class="material-icons cookie-icon">cookie</span>
        <div class="cookie-text">
          <strong>Usamos cookies</strong>
          <p>
            Utilizamos cookies para melhorar sua experiência e exibir anúncios relevantes.
            Ao aceitar, você concorda com nossa
            <a routerLink="/privacidade">Política de Privacidade</a>.
          </p>
        </div>
        <div class="cookie-actions">
          <button class="btn-rejeitar" (click)="rejeitar()">Rejeitar</button>
          <button class="btn-aceitar" (click)="aceitar()">Aceitar cookies</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cookie-banner {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      background: #001f33;
      border-top: 3px solid #4a55ff;
      padding: 16px 24px;
      box-shadow: 0 -4px 24px rgba(0,0,0,0.3);
    }

    .cookie-content {
      max-width: 1100px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .cookie-icon {
      color: #4a55ff;
      font-size: 32px;
      flex-shrink: 0;
    }

    .cookie-text {
      flex: 1;
      min-width: 200px;
    }

    .cookie-text strong {
      display: block;
      color: #fff;
      font-size: 0.95rem;
      margin-bottom: 4px;
    }

    .cookie-text p {
      color: #aac4d8;
      font-size: 0.825rem;
      margin: 0;
      line-height: 1.5;
    }

    .cookie-text a {
      color: #4a9eff;
      text-decoration: underline;
    }

    .cookie-actions {
      display: flex;
      gap: 10px;
      flex-shrink: 0;
    }

    .btn-rejeitar {
      padding: 8px 20px;
      border: 1px solid #4a7a9b;
      background: transparent;
      color: #aac4d8;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .btn-rejeitar:hover {
      border-color: #fff;
      color: #fff;
    }

    .btn-aceitar {
      padding: 8px 20px;
      background: #4a55ff;
      border: none;
      color: #fff;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 600;
      transition: background 0.2s;
    }

    .btn-aceitar:hover {
      background: #3a45ef;
    }
  `]
})
export class CookieBannerComponent implements OnInit {
  visible = false;

  constructor(private consent: CookieConsentService) {}

  ngOnInit(): void {
    this.visible = this.consent.hasConsented() === null;
  }

  aceitar(): void {
    this.consent.accept();
    this.visible = false;
  }

  rejeitar(): void {
    this.consent.reject();
    this.visible = false;
  }
}
