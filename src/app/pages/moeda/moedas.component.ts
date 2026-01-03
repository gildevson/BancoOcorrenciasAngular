import { Component, ViewChild, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables, ChartConfiguration, ChartData } from 'chart.js';

import { BehaviorSubject, combineLatest, Subject, timer, of } from 'rxjs';
import { catchError, distinctUntilChanged, finalize, map, shareReplay, switchMap, takeUntil, tap } from 'rxjs/operators';

import { MarketMoedasService, FxQuoteItem, HistoryResponse } from '../../service/marketmoedas.service';

Chart.register(...registerables);

type PeriodKey = '1D' | '1M' | '1A' | 'Todos';
type ListTab = 'principais' | 'altas' | 'baixas';

@Component({
  selector: 'app-moedas',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './moedas.component.html',
  styleUrls: ['./moedas.component.css'],
})
export class MoedasComponent implements OnInit, OnDestroy {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  private api = inject(MarketMoedasService);
  private destroy$ = new Subject<void>();

  periodKeys: PeriodKey[] = ['1D', '1M', '1A', 'Todos'];
  activePeriod: PeriodKey = '1D';

  activeTab: ListTab = 'principais';
  searchTerm = '';

  selectedSymbol = 'USDBRL';

  all: FxQuoteItem[] = [];
  altas: FxQuoteItem[] = [];
  baixas: FxQuoteItem[] = [];
  principais: FxQuoteItem[] = [];

  amountBRL = 100;
  amountUSD = 0;

  chartLoading = true;
  chartError = '';

  private symbol$ = new BehaviorSubject<string>(this.selectedSymbol);
  private period$ = new BehaviorSubject<PeriodKey>(this.activePeriod);

  public lineChartType: 'line' = 'line';

  private periodMap: Record<PeriodKey, { days: number }> = {
    '1D': { days: 2 },
    '1M': { days: 30 },
    '1A': { days: 365 },
    'Todos': { days: 2000 },
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    elements: { line: { tension: 0.35 }, point: { radius: 0, hitRadius: 12 } },
    interaction: { mode: 'index', intersect: false },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#d1d4dc', maxTicksLimit: 8 } },
      y: {
        position: 'right',
        grid: { color: 'rgba(255,255,255,0.06)' },
        ticks: {
          color: '#d1d4dc',
          callback: (value) => this.formatBRL(value),
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${this.formatBRL(ctx.parsed?.y ?? 0)}`,
        },
      },
    },
  };

  public lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: this.selectedSymbol,
        borderColor: '#22d3ee',
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
        backgroundColor: (ctx: any) => {
          const chart = ctx.chart;
          const { ctx: canvasCtx, chartArea } = chart;
          if (!chartArea) return 'rgba(34, 211, 238, 0.12)';
          const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(34, 211, 238, 0.28)');
          gradient.addColorStop(1, 'rgba(34, 211, 238, 0)');
          return gradient;
        },
      },
    ],
  };

  ngOnInit(): void {
    // ✅ MUDADO: Timer de 60 segundos
    timer(0, 60000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadQuotes());

    combineLatest([this.symbol$, this.period$]).pipe(
      distinctUntilChanged(([s1, p1], [s2, p2]) => s1 === s2 && p1 === p2),
      tap(() => {
        this.chartLoading = true;
        this.chartError = '';
        this.clearChart();
      }),
      switchMap(([symbol, period]) =>
        this.loadHistoryWithFallback$(symbol, period).pipe(
          finalize(() => (this.chartLoading = false))
        )
      ),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res) => this.updateChartFromResponse(res),
      error: () => {
        this.chartLoading = false;
        this.chartError = 'Não foi possível carregar o histórico da moeda.';
        this.clearChart();
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadQuotes() {
    this.api.quotesMoedas().pipe(
      catchError(() => of({} as any)),
      map((r: any) => (r?.results ?? r?.stocks ?? []) as any[]),
      map((list: any[]) => list.map(x => this.mapToUiModel(x)).filter(x => !!x.symbol)),
      takeUntil(this.destroy$)
    ).subscribe((normalized) => {
      this.all = normalized;

      const order = ['USDBRL', 'EURBRL', 'GBPBRL', 'ARSBRL', 'BTCBRL'];
      this.principais = order.map(sym => normalized.find(x => x.symbol === sym)).filter(Boolean) as FxQuoteItem[];

      const pct = (x: FxQuoteItem) => Number(x?.regularMarketChangePercent ?? 0);
      this.altas = [...normalized].sort((a, b) => pct(b) - pct(a));
      this.baixas = [...normalized].sort((a, b) => pct(a) - pct(b));

      const usd = normalized.find(x => x.symbol === 'USDBRL')?.regularMarketPrice ?? 0;
      this.amountUSD = usd > 0 ? (this.amountBRL / usd) : 0;
    });
  }

  private mapToUiModel(x: any): FxQuoteItem {
    const symbol = (x?.symbol ?? x?.ticker ?? x?.stock ?? '').toString().toUpperCase().trim();
    const name = (x?.shortName ?? x?.longName ?? x?.name ?? '').toString().trim();
    const price = x?.regularMarketPrice ?? x?.close ?? x?.price ?? null;
    const changePct = x?.regularMarketChangePercent ?? x?.changePercent ?? x?.change ?? 0;

    return {
      symbol,
      shortName: name,
      longName: name,
      regularMarketPrice: Number(price),
      regularMarketChangePercent: Number(changePct) || 0,
    };
  }

  setTab(t: ListTab) { this.activeTab = t; }

  setPeriod(p: PeriodKey) {
    if (p === this.activePeriod) return;
    this.activePeriod = p;
    this.period$.next(p);
  }

  setSymbol(symbol: string) {
    const s = (symbol ?? '').trim().toUpperCase();
    if (!s) return;
    this.selectedSymbol = s;
    this.symbol$.next(s);
    this.lineChartData.datasets[0].label = s;
  }

  clearSearch() { this.searchTerm = ''; }

  onChangeBRL() {
    const usd = this.all.find(x => x.symbol === 'USDBRL')?.regularMarketPrice ?? 0;
    this.amountUSD = usd > 0 ? (this.amountBRL / usd) : 0;
  }

  get listaAtual(): FxQuoteItem[] {
    let list: FxQuoteItem[] = [];
    if (this.activeTab === 'principais') list = this.principais;
    else if (this.activeTab === 'baixas') list = this.baixas;
    else list = this.altas;

    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return list;

    return list.filter(item =>
      (item.symbol || '').toLowerCase().includes(term) ||
      (item.shortName || '').toLowerCase().includes(term) ||
      (item.longName || '').toLowerCase().includes(term)
    );
  }

  fmtPrice(v: any) {
    const n = Number(v);
    if (!isFinite(n)) return '-';
    return n.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  }

  fmtPct(v: any) {
    const n = Number(v);
    if (!isFinite(n)) return '';
    const s = n >= 0 ? '+' : '';
    return `${s}${n.toFixed(2)}%`;
  }

  isPos(item: FxQuoteItem) {
    return Number(item?.regularMarketChangePercent ?? 0) >= 0;
  }

  private formatBRL(value: number | string | null | undefined) {
    const n = typeof value === 'string' ? Number(value) : Number(value ?? NaN);
    if (!isFinite(n)) return '';
    return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  private parseDateMs(value: any): number {
    if (typeof value === 'string') {
      const ms = Date.parse(value);
      return Number.isFinite(ms) ? ms : NaN;
    }
    const ts = Number(value);
    if (!Number.isFinite(ts)) return NaN;
    return ts < 10_000_000_000 ? ts * 1000 : ts;
  }

  private clearChart() {
    this.lineChartData = {
      labels: [],
      datasets: [{
        data: [],
        label: this.selectedSymbol,
        borderColor: '#22d3ee',
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
        backgroundColor: (ctx: any) => {
          const chart = ctx.chart;
          const { ctx: canvasCtx, chartArea } = chart;
          if (!chartArea) return 'rgba(34, 211, 238, 0.12)';
          const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(34, 211, 238, 0.28)');
          gradient.addColorStop(1, 'rgba(34, 211, 238, 0)');
          return gradient;
        },
      }],
    };
    queueMicrotask(() => this.chart?.update());
  }

  private loadHistoryWithFallback$(symbol: string, period: PeriodKey) {
    const { days } = this.periodMap[period];

    return this.api.quoteHistory(symbol, days).pipe(
      catchError(() => of({} as HistoryResponse)),
      switchMap((res) => {
        const raw = res?.results?.[0]?.historicalDataPrice;
        const ok = Array.isArray(raw) && raw.length >= 2;

        if (period === '1D' && !ok) {
          const fb = this.periodMap['1M'];
          return this.api.quoteHistory(symbol, fb.days).pipe(
            catchError(() => of({} as HistoryResponse))
          );
        }
        return of(res);
      }),
      shareReplay(1)
    );
  }

  private updateChartFromResponse(r: any) {
    const raw = r?.results?.[0]?.historicalDataPrice;

    if (!Array.isArray(raw) || raw.length === 0) {
      this.chartError = 'Histórico indisponível para esta moeda.';
      this.clearChart();
      return;
    }

    let hist = raw
      .map((p: any) => ({ dateMs: this.parseDateMs(p.date), close: Number(p.close) }))
      .filter((p: any) => p.dateMs > 0 && p.close > 0)
      .sort((a: any, b: any) => a.dateMs - b.dateMs);

    if (hist.length < 2) {
      this.chartError = 'Pontos insuficientes para gerar o gráfico.';
      this.clearChart();
      return;
    }

    if (this.activePeriod === '1D') {
      const lastDate = new Date(hist[hist.length - 1].dateMs).toISOString().split('T')[0];
      const filtered = hist.filter(p => new Date(p.dateMs).toISOString().split('T')[0] === lastDate);
      if (filtered.length >= 2) hist = filtered;
    }

    const fmt = new Intl.DateTimeFormat(
      'pt-BR',
      this.activePeriod === '1D'
        ? { hour: '2-digit', minute: '2-digit' }
        : { day: '2-digit', month: '2-digit' }
    );

    this.lineChartData = {
      labels: hist.map(p => fmt.format(new Date(p.dateMs))),
      datasets: [{
        data: hist.map(p => p.close),
        label: this.selectedSymbol,
        borderColor: '#22d3ee',
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
        backgroundColor: (ctx: any) => {
          const chart = ctx.chart;
          const { ctx: canvasCtx, chartArea } = chart;
          if (!chartArea) return 'rgba(34, 211, 238, 0.12)';
          const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(34, 211, 238, 0.28)');
          gradient.addColorStop(1, 'rgba(34, 211, 238, 0)');
          return gradient;
        },
      }],
    };

    queueMicrotask(() => this.chart?.update());
  }
}
