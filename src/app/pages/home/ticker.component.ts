import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, timer } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { MarketMoedasService, FxQuoteItem } from '../../service/marketmoedas.service';

interface TickerItem { nome: string; price: string; pct: string; cls: string; }

const NOMES: Record<string, string> = {
  USDBRL: 'Dólar', EURBRL: 'Euro', GBPBRL: 'Libra',
  ARSBRL: 'Peso', JPYBRL: 'Iene', CADBRL: 'CAD', CHFBRL: 'Franco',
};

@Component({
  selector: 'app-ticker',
  standalone: true,
  imports: [],
  template: `
    @if (doubled.length) {
      <div class="ticker-bar">
        <span class="ticker-badge">CÂMBIO AO VIVO</span>
        <div class="ticker-track">
          <div class="ticker-inner">
            @for (it of doubled; track $index) {
              <span class="ticker-item">
                <span class="ti-nome">{{ it.nome }}</span>
                <span class="ti-price">{{ it.price }}</span>
                <span [class]="'ti-pct ' + it.cls">{{ it.pct }}</span>
              </span>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .ticker-bar {
      background: #0b1929;
      display: flex;
      align-items: center;
      height: 32px;
      overflow: hidden;
      border-bottom: 2px solid #1e3a5f;
    }
    .ticker-badge {
      flex-shrink: 0;
      background: #1E3B65;
      color: #00c9a7;
      font-size: 0.56rem;
      font-weight: 900;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      padding: 0 14px;
      height: 100%;
      display: flex;
      align-items: center;
      border-right: 1px solid #1e3a5f;
      white-space: nowrap;
    }
    .ticker-track { flex: 1; overflow: hidden; }
    .ticker-inner {
      display: flex;
      align-items: center;
      width: max-content;
      animation: scrollTicker 35s linear infinite;
    }
    @keyframes scrollTicker {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .ticker-item {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 0 18px;
      border-right: 1px solid #1e3a5f;
      font-size: 0.67rem;
      white-space: nowrap;
    }
    .ti-nome  { color: #64748b; font-weight: 700; }
    .ti-price { color: #e2e8f0; font-weight: 700; }
    .ti-pct   { font-weight: 700; color: #64748b; }
    .ti-pct.alta  { color: #22c55e; }
    .ti-pct.baixa { color: #ef4444; }
  `]
})
export class TickerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  doubled: TickerItem[] = [];

  constructor(private api: MarketMoedasService) {}

  ngOnInit() {
    timer(0, 60000).pipe(takeUntil(this.destroy$)).subscribe(() => this.carregar());
  }
  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  private carregar() {
    this.api.quotesMoedas().pipe(
      catchError(() => of(null)),
      takeUntil(this.destroy$)
    ).subscribe((data: any) => {
      if (!data) return;
      const all: FxQuoteItem[] = data?.results ?? (Array.isArray(data) ? data : []);
      const items: TickerItem[] = all
        .filter(q => q.regularMarketPrice != null)
        .map(q => ({
          nome:  NOMES[q.symbol] ?? q.symbol,
          price: 'R$ ' + (q.regularMarketPrice ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 }),
          pct:   ((q.regularMarketChangePercent ?? 0) >= 0 ? '+' : '') + (q.regularMarketChangePercent ?? 0).toFixed(2) + '%',
          cls:   !q.regularMarketChangePercent ? '' : q.regularMarketChangePercent >= 0 ? 'alta' : 'baixa',
        }));
      this.doubled = [...items, ...items];
    });
  }
}
