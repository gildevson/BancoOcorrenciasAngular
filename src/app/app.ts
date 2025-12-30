import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

import { HeaderComponent } from './pages/header/header.component';
import { FooterComponent } from './pages/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class AppComponent {
  private router = inject(Router);

  // ✅ Renomeado para isModalOpen (detecta qualquer modal)
  isModalOpen = signal(false);

  constructor() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        // ✅ Detecta qualquer rota dentro do outlet modal
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
