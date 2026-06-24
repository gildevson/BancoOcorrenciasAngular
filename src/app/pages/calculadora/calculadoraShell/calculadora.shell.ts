import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationStart, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

const CALC_INFO: Record<string, { label: string; icon: string }> = {
  desagio:       { label: 'Deságio',      icon: 'percent' },
  iof:           { label: 'IOF',          icon: 'receipt_long' },
  'iof-variado': { label: 'IOF Variado',  icon: 'tune' },
  mora:          { label: 'Mora',         icon: 'schedule' },
  juros:         { label: 'Juros',        icon: 'trending_up' },
  multa:         { label: 'Multa',        icon: 'gavel' },
};

@Component({
  selector: 'app-calculadora-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="calc-overlay" [class.visible]="loading">
      <div class="calc-overlay-card">
        <div class="calc-overlay-icon">
          <span class="material-icons">{{ currentCalc.icon }}</span>
        </div>
        <p class="calc-overlay-label">{{ currentCalc.label }}</p>
        <div class="calc-overlay-bar">
          <div class="calc-overlay-progress" [class.animate]="loading"></div>
        </div>
      </div>
    </div>

    <section class="calc-shell" [class.entering]="entering">
      <router-outlet (activate)="onActivate()"></router-outlet>
    </section>
  `,
  styles: [`
    .calc-shell {
      padding: 0;
      opacity: 1;
      transform: translateY(0);
      transition: opacity 340ms ease, transform 340ms cubic-bezier(.35,0,.25,1);
    }

    .calc-shell.entering {
      opacity: 0;
      transform: translateY(20px);
    }

    .calc-overlay {
      position: fixed;
      inset: 0;
      z-index: 2000;
      background: rgba(0, 27, 50, 0.92);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 180ms ease;
    }

    .calc-overlay.visible {
      opacity: 1;
      pointer-events: all;
    }

    .calc-overlay-card {
      text-align: center;
      color: #eaf3ff;
    }

    .calc-overlay-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 16px;
      border-radius: 22px;
      background: linear-gradient(135deg, #0b3a55, #4a55ff);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 20px 50px rgba(74, 85, 255, 0.35);
      animation: pulse 1s ease-in-out infinite alternate;
    }

    .calc-overlay-icon .material-icons {
      font-size: 38px;
      color: #fff;
    }

    .calc-overlay-label {
      font-size: 1.3rem;
      font-weight: 700;
      margin-bottom: 20px;
      opacity: 0.9;
    }

    .calc-overlay-bar {
      width: 160px;
      height: 4px;
      background: rgba(255,255,255,0.15);
      border-radius: 4px;
      overflow: hidden;
      margin: 0 auto;
    }

    .calc-overlay-progress {
      height: 100%;
      width: 0%;
      border-radius: 4px;
      background: linear-gradient(90deg, #4a55ff, #00d0ff);
    }

    .calc-overlay-progress.animate {
      animation: progress 500ms cubic-bezier(.4,0,.2,1) forwards;
    }

    @keyframes pulse {
      from { transform: scale(1);    box-shadow: 0 20px 50px rgba(74,85,255,.35); }
      to   { transform: scale(1.06); box-shadow: 0 24px 60px rgba(74,85,255,.50); }
    }

    @keyframes progress {
      from { width: 0%; }
      to   { width: 100%; }
    }
  `]
})
export class CalculadoraShellComponent implements OnInit, OnDestroy {
  loading = false;
  entering = false;
  currentCalc = { label: 'Calculadora', icon: 'calculate' };

  private sub!: Subscription;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.sub = this.router.events.pipe(
      filter(e => e instanceof NavigationStart || e instanceof NavigationEnd)
    ).subscribe(e => {
      if (e instanceof NavigationStart) {
        const seg = e.url.split('/').pop() ?? '';
        this.currentCalc = CALC_INFO[seg] ?? { label: 'Calculadora', icon: 'calculate' };
        this.loading = true;
        this.entering = true;
      }
      if (e instanceof NavigationEnd) {
        setTimeout(() => {
          this.loading = false;
          this.entering = false;
        }, 520);
      }
    });
  }

  onActivate(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
