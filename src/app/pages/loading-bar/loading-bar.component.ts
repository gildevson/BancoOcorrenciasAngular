import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-loading-bar',
  standalone: true,
  template: `<div class="lb" [class.lb-loading]="loading" [class.lb-done]="done"></div>`,
  styles: [`
    .lb {
      position: fixed;
      top: 0;
      left: 0;
      height: 2px;
      width: 0;
      z-index: 99999;
      background: linear-gradient(90deg, #7fd0ff, #00c9a7, #7fd0ff);
      opacity: 0;
      transition: none;
      pointer-events: none;
    }

    /* Navegando: vai de 0 → 75% lentamente, shimmer animado */
    .lb.lb-loading {
      opacity: 1;
      width: 75%;
      transition: width 8s cubic-bezier(0.05, 0.5, 0.1, 1);
      background-size: 200% 100%;
      animation: lb-shine 1.2s linear infinite;
    }

    /* Concluído: snap 100%, depois apaga */
    .lb.lb-done {
      opacity: 0;
      width: 100%;
      transition: width 0.12s ease, opacity 0.35s ease 0.12s;
      animation: none;
    }

    @keyframes lb-shine {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class LoadingBarComponent implements OnInit, OnDestroy {
  loading = false;
  done    = false;
  private destroy$ = new Subject<void>();
  private doneTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe(ev => {
      if (ev instanceof NavigationStart) {
        if (this.doneTimer) clearTimeout(this.doneTimer);
        this.done    = false;
        this.loading = false;
        // micro-tick para o DOM aplicar width:0 antes de iniciar a transição
        setTimeout(() => this.loading = true, 10);
      } else if (
        ev instanceof NavigationEnd ||
        ev instanceof NavigationCancel ||
        ev instanceof NavigationError
      ) {
        this.loading = false;
        this.done    = true;
        this.doneTimer = setTimeout(() => { this.done = false; }, 500);
      }
    });
  }

  ngOnDestroy() {
    if (this.doneTimer) clearTimeout(this.doneTimer);
    this.destroy$.next();
    this.destroy$.complete();
  }
}
