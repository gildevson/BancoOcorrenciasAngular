import { Component, inject, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import {
  Chart,
  registerables,
  ChartConfiguration,
  ChartData,
  TooltipItem
} from 'chart.js';

import { BehaviorSubject, combineLatest, Subject, timer, of } from 'rxjs';
import { distinctUntilChanged, switchMap, tap, takeUntil, catchError, finalize, map, shareReplay } from 'rxjs/operators';

import { MarketBancosService, QuoteItem, HistoryResponse } from '../../service/marketbancos.service';

Chart.register(...registerables);

type PeriodKey = '1D' | '1M' | '1A' | 'Todos';
type ListTab = 'negociados' | 'altas' | 'baixas';

@Component({
  selector: 'app-bancos',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, FormsModule],
  templateUrl: './bancos.component.html',
  styleUrls: ['./bancos.component.css']
})
export class BancosComponent implements OnInit, OnDestroy {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
public lineChartType: 'line' = 'line';

  private api = inject(MarketBancosService);
  private destroy$ = new Subject<void>();

  // ✅ usado no HTML (evita string[])
  periodKeys: PeriodKey[] = ['1D', '1M', '1A', 'Todos'];

  bancosAll: any[] = [];
  bancosAltas: any[] = [];
  bancosBaixas: any[] = [];
  bancosNegociados: any[] = [];

  activeTab: ListTab = 'altas';
  searchTerm = '';

  selectedTicker: string = 'ITUB4';
  activePeriod: PeriodKey = '1D';

  chartLoading = true;
  chartError = '';

  private tickerQuery = this.normalizeTickerForHistory(this.selectedTicker);
  private ticker$ = new BehaviorSubject<string>(this.tickerQuery);
  private period$ = new BehaviorSubject<PeriodKey>(this.activePeriod);

  trackBySymbol = (_: number, item: any) => item?.symbol;

  private periodMap: Record<PeriodKey, { range: string; interval: string }> = {
    '1D': { range: '1d', interval: '5m' },
    '1M': { range: '1mo', interval: '1d' },
    '1A': { range: '1y', interval: '1wk' },
    'Todos': { range: 'max', interval: '1mo' }
  };

  public lineChartOptions: ChartConfiguration['options'] = {
  responsive: true,
  maintainAspectRatio: false,
  elements: { line: { tension: 0.35 }, point: { radius: 0, hitRadius: 12 } },
  interaction: { mode: 'index', intersect: false },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#d1d4dc', maxTicksLimit: 8 }
    },
    y: {
      position: 'right',
      grid: { color: 'rgba(255,255,255,0.06)' }, // ✅ sem borderDash
      ticks: {
        color: '#d1d4dc',
        callback: (value) => this.formatBRL(value) // ok
      }
    }
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => ` ${this.formatBRL(ctx.parsed?.y ?? 0)}`
      }
    }
  }
};


  public lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      data: [],
      label: this.selectedTicker,
      borderColor: '#22d3ee',
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
      }
    }]
  };

  ngOnInit() {
    // 🔄 atualiza lista a cada 30s (sem setInterval)
    timer(0, 30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.carregarBancos());

    // 📈 histórico reage a ticker + período
    combineLatest([this.ticker$, this.period$]).pipe(
      distinctUntilChanged(([t1, p1], [t2, p2]) => t1 === t2 && p1 === p2),
      tap(() => {
        this.chartLoading = true;
        this.chartError = '';
        this.clearChart();
      }),
      switchMap(([ticker, period]) =>
        this.loadHistoryWithFallback$(ticker, period).pipe(
          finalize(() => (this.chartLoading = false))
        )
      ),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res) => this.atualizarGraficoComResposta(res),
      error: (err) => {
        console.error('Erro ao carregar histórico:', err);
        this.chartLoading = false;
        this.chartError = 'Não foi possível carregar o histórico desse ativo.';
        this.clearChart();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =======================
  // LISTA
  // =======================
  carregarBancos() {
    this.api.quotesBancos().pipe(
      catchError(() => of({} as any)),
      switchMap((r: any) => {
        const results = (r?.results ?? r?.stocks ?? []) as QuoteItem[];
        if (results?.length) return of(results);

        return this.api.financeList('desc', 80).pipe(
          map((rr: any) => (rr?.stocks ?? []) as QuoteItem[]),
          catchError(() => of([] as QuoteItem[]))
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe(list => this.normalizarListas(list as any[]));
  }

  private mapToUiModel(x: any) {
    const symbol = (x?.symbol ?? x?.stock ?? x?.ticker ?? '').toString().toUpperCase().trim();
    const name = (x?.shortName ?? x?.longName ?? x?.name ?? x?.companyName ?? '').toString().trim();
    const price = x?.regularMarketPrice ?? x?.close ?? x?.price ?? x?.lastPrice ?? null;
    const changePct = x?.regularMarketChangePercent ?? x?.change ?? x?.changePercent ?? 0;
    const volume = x?.regularMarketVolume ?? x?.volume ?? x?.totalVolume ?? 0;

    return {
      symbol,
      shortName: name,
      longName: name,
      regularMarketPrice: Number(price),
      regularMarketChangePercent: Number(changePct) || 0,
      regularMarketVolume: Number(volume) || 0
    };
  }

  private normalizarListas(results: any[]) {
    const list = (results ?? []).map(x => this.mapToUiModel(x)).filter(x => !!x.symbol);
    this.bancosAll = list;

    const pct = (x: any) => Number(x?.regularMarketChangePercent ?? 0);
    const vol = (x: any) => Number(x?.regularMarketVolume ?? 0);

    this.bancosAltas = [...list].sort((a, b) => pct(b) - pct(a));
    this.bancosBaixas = [...list].sort((a, b) => pct(a) - pct(b));
    this.bancosNegociados = [...list].sort((a, b) => vol(b) - vol(a));
  }

  // =======================
  // AÇÕES
  // =======================
  setTab(t: ListTab) {
    this.activeTab = t;
  }

  setPeriod(p: PeriodKey) {
    if (p === this.activePeriod) return;
    this.activePeriod = p;
    this.period$.next(p);
  }

  setTicker(ticker: string) {
    const display = (ticker ?? '').trim().toUpperCase();
    if (!display) return;

    const query = this.normalizeTickerForHistory(display);
    if (display === this.selectedTicker && query === this.tickerQuery) return;

    this.selectedTicker = display;
    this.tickerQuery = query;
    this.ticker$.next(query);

    // label coerente
    this.lineChartData.datasets[0].label = display;
  }

  clearSearch() {
    this.searchTerm = '';
  }

  get listaAtual(): any[] {
    let list: any[] = [];

    if (this.activeTab === 'negociados') list = this.bancosNegociados;
    else if (this.activeTab === 'baixas') list = this.bancosBaixas;
    else list = this.bancosAltas;

    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return list;

    return list.filter(item =>
      (item.symbol || '').toLowerCase().includes(term) ||
      (item.shortName || '').toLowerCase().includes(term) ||
      (item.longName || '').toLowerCase().includes(term)
    );
  }

  // =======================
  // HELPERS
  // =======================
  logoUrl(symbol: string) {
    const s = (symbol ?? '').trim();
    return `https://s3-symbol-logo.tradingview.com/${s.substring(0, 4)}--big.svg`;
  }

  onLogoError(ev: Event) {
    (ev.target as HTMLImageElement).src = 'https://brapi.dev/favicon.ico';
  }

  fmtPrice(v: any) {
    const n = Number(v);
    if (!isFinite(n)) return '-';
    return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  fmtPct(v: any) {
    const n = Number(v);
    if (!isFinite(n)) return '';
    const s = n >= 0 ? '+' : '';
    return `${s}${n.toFixed(2)}%`;
  }

  fmtVolume(v: any): string {
    const n = Number(v);
    if (!isFinite(n) || n === 0) return '-';
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n.toString();
  }

  isPos(item: any) {
    return Number(item?.regularMarketChangePercent ?? 0) >= 0;
  }

  // ✅ resolve ticks (string|number) e tooltip (null)
  private formatBRL(value: number | string | null | undefined) {
    const n = typeof value === 'string' ? Number(value) : Number(value ?? NaN);
    if (!isFinite(n)) return '';
    return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  private normalizeTickerForHistory(symbol: string) {
    const s = (symbol ?? '').trim().toUpperCase();
    return s.endsWith('F') ? s.slice(0, -1) : s;
  }

  private parseDateMs(value: any): number {
    if (typeof value === 'string') {
      const ms = Date.parse(value);
      return Number.isFinite(ms) ? ms : NaN;
    }
    const ts = Number(value);
    if (!Number.isFinite(ts)) return NaN;
    return ts > 1_000_000_000_000 ? ts : ts * 1000;
  }

  // =======================
  // CHART
  // =======================
  private clearChart() {
    this.lineChartData = {
      labels: [],
      datasets: [{
        data: [],
        label: this.selectedTicker,
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
        }
      }]
    };

    queueMicrotask(() => this.chart?.update());
  }

  private loadHistoryWithFallback$(ticker: string, period: PeriodKey) {
    const { range, interval } = this.periodMap[period];

    return this.api.quoteHistory(ticker, range, interval).pipe(
      catchError(() => of({} as HistoryResponse)),
      switchMap((res) => {
        const raw = res?.results?.[0]?.historicalDataPrice;
        const ok = Array.isArray(raw) && raw.length >= 2;

        // ✅ fallback do 1D -> 1M se intraday não vier
        if (period === '1D' && !ok) {
          const fb = this.periodMap['1M'];
          return this.api.quoteHistory(ticker, fb.range, fb.interval).pipe(
            catchError(() => of({} as HistoryResponse))
          );
        }
        return of(res);
      }),
      shareReplay(1)
    );
  }

  private atualizarGraficoComResposta(r: any) {
    const raw = r?.results?.[0]?.historicalDataPrice;

    if (!Array.isArray(raw) || raw.length === 0) {
      this.chartError = 'Dados históricos indisponíveis na API para este ativo.';
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

    // intradiário: filtra para o último dia disponível
    if (this.activePeriod === '1D') {
      const lastDate = new Date(hist[hist.length - 1].dateMs).toISOString().split('T')[0];
      const filtered = hist.filter(p => new Date(p.dateMs).toISOString().split('T')[0] === lastDate);
      if (filtered.length >= 2) hist = filtered;
    }

    this.renderizarDadosNoGrafico(hist);
  }

  private renderizarDadosNoGrafico(hist: Array<{ dateMs: number; close: number }>) {
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
        label: this.selectedTicker,
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
        }
      }]
    };

    queueMicrotask(() => this.chart?.update());
  }
}
