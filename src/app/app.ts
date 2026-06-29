import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

import { HeaderComponent } from './pages/header/header.component';
import { FooterComponent } from './pages/footer/footer.component';
import { CookieBannerComponent } from './pages/cookie-banner/cookie-banner.component';
import { TickerComponent } from './pages/home/ticker.component';
import { LoadingBarComponent } from './pages/loading-bar/loading-bar.component';
import { CookieConsentService } from './service/cookie-consent.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent, CookieBannerComponent, TickerComponent, LoadingBarComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  private consent = inject(CookieConsentService);

  isModalOpen = signal(false);

  ngOnInit(): void {
    this.consent.initOnStartup();
  }

  constructor() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.isModalOpen.set(this.router.url.includes('(modal:'));
      });
  }

  openLogin(): void {
    this.router.navigate([{ outlets: { modal: ['login'] } }]);
  }

  closeModal(): void {
    this.router.navigate([{ outlets: { modal: null } }]);
  }

  // ✅ Manter compatibilidade com código antigo
  closeLogin(): void {
    this.closeModal();
  }
}
