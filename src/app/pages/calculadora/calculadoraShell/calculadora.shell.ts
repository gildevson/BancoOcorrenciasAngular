import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationStart, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-calculadora-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="progress-bar" [class.active]="loading">
      <div class="progress-fill"></div>
    </div>

    <section class="calc-shell" [class.entering]="entering">
      <router-outlet (activate)="onActivate()"></router-outlet>
    </section>
  `,
  styles: [`
    .progress-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      z-index: 2000;
      overflow: hidden;
      opacity: 0;
      transition: opacity 100ms ease;
    }

    .progress-bar.active {
      opacity: 1;
    }

    .progress-fill {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #4a55ff, #00d0ff);
      border-radius: 0 2px 2px 0;
    }

    .progress-bar.active .progress-fill {
      animation: progress 250ms cubic-bezier(.4,0,.2,1) forwards;
    }

    .calc-shell {
      padding: 0;
      opacity: 1;
      transform: translateY(0);
      transition: opacity 200ms ease, transform 200ms ease;
    }

    .calc-shell.entering {
      opacity: 0;
      transform: translateY(12px);
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

  private sub!: Subscription;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.sub = this.router.events.pipe(
      filter(e => e instanceof NavigationStart || e instanceof NavigationEnd)
    ).subscribe(e => {
      if (e instanceof NavigationStart) {
        this.loading = true;
        this.entering = true;
      }
      if (e instanceof NavigationEnd) {
        setTimeout(() => {
          this.loading = false;
          this.entering = false;
        }, 250);
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
