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

  isLoginOpen = signal(false);

  constructor() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.isLoginOpen.set(this.router.url.includes('(modal:login)'));
      });
  }

  openLogin(): void {
    this.router.navigate([{ outlets: { modal: ['login'] } }]);
  }

  closeLogin(): void {
    this.router.navigate([{ outlets: { modal: null } }]);
  }
}
