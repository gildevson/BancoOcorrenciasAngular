import { Component, inject, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables, ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { MarketBancosService } from '../../service/marketbancos.service';

import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { distinctUntilChanged, switchMap, tap, takeUntil, finalize } from 'rxjs/operators';

Chart.register(...registerables);

type PeriodKey = '1D' | '1M' | '1A' | 'Todos';
type ListTab = 'negociados' | 'altas' | 'baixas';

@Component({
  selector: 'app-bancos',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './bancos.component.html',
  styleUrls: ['./bancos.component.css']
})
export class BancosComponent implements OnInit, OnDestroy {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  private api = inject(MarketBancosService);

  // listas
  bancosAll: any[] = [];
  bancosAltas: any[] = [];
  bancosBaixas: any[] = [];
  bancosNegociados: any[] = [];

  activeTab: ListTab = 'altas';

  // UI
  selectedTicker = 'ITUB4';
  activePeriod: PeriodKey = '1D';

  // estados do gráfico
  chartLoading = false;
  chartError = '';

  // ✅ o que vai pra API (pode ser diferente do que aparece no UI)
  private tickerQuery = this.selectedTicker;

  // ✅ Observables
  private ticker$ = new BehaviorSubject<string>(this.tickerQuery);
  private period$ = new BehaviorSubject<PeriodKey>(this.activePeriod);
  private destroy$ = new Subject<void>();

  trackBySymbol = (_: number, item: any) => item?.symbol;

  private periodMap: Record<PeriodKey, { range: string; interval: string }> = {
  '1D':   { range: '5d',  interval: '15m' }, // ✅ mais pontos e menos bloqueio
  '1M':   { range: '3mo', interval: '1d'  },
  '1A':   { range: '5y',  interval: '1wk' },
  'Todos':{ range: 'max', interval: '1mo' }
};

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    elements: { line: { tension: 0.4 }, point: { radius: 0 } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#d1d4dc', maxTicksLimit: 8 } },
      y: { position: 'right', grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#d1d4dc' } }
    },
    plugins: { legend: { display: false } }
  };

  public lineChartType: ChartType = 'line';

  public lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      data: [],
      label: this.selectedTicker,
      fill: true
    }]
  };

  ngOnInit() {
    this.carregarBancos();

    combineLatest([this.ticker$, this.period$]).pipe(
      distinctUntilChanged(([t1, p1], [t2, p2]) => t1 === t2 && p1 === p2),

      // ✅ quando clicar / trocar período: limpa + loading
      tap(() => {
        this.chartLoading = true;
        this.chartError = '';
        this.clearChart();
      }),

      switchMap(([ticker, period]) => {
        const { range, interval } = this.periodMap[period];
        return this.api.quoteHistory(ticker, range, interval).pipe(
          finalize(() => (this.chartLoading = false))
        );
      }),

      takeUntil(this.destroy$)
    ).subscribe({
      next: (r: any) => this.atualizarGraficoComResposta(r),
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

  // =========================
  // LISTAS
  // =========================
  carregarBancos() {
  // ✅ 1) sempre tenta a watchlist primeiro
  this.api.quotesBancos().subscribe({
    next: (r) => {
      const results = (r?.results ?? r?.stocks ?? []) as any[];
      if (results.length) {
        this.normalizarListas(results);
        return;
      }
      // ✅ 2) se falhar, cai no list
      this.api.financeList('desc', 80).subscribe({
        next: (rr: any) => this.normalizarListas(rr?.stocks ?? []),
      });
    },
    error: () => {
      this.api.financeList('desc', 80).subscribe({
        next: (rr: any) => this.normalizarListas(rr?.stocks ?? []),
      });
    }
  });
}

  private carregarBancosViaFinanceList() {
    const bancos = new Set(['ITUB4', 'BBDC4', 'BBAS3', 'SANB11', 'BPAC11', 'ABCB4', 'BRSR6', 'PINE4', 'BMGB4']);

    this.api.financeList('desc', 80).subscribe({
      next: (r: any) => {
        const list = (r?.stocks ?? []) as any[];
        const apenasBancos = list.filter(x => bancos.has((x.stock ?? '').toUpperCase()));

        const results = apenasBancos.map(x => ({
          symbol: x.stock,
          shortName: x.name,
          longName: x.name,
          regularMarketPrice: x.close ?? x.price ?? null,
          regularMarketChangePercent: x.change ?? 0,
          regularMarketVolume: x.volume ?? 0
        }));

        this.normalizarListas(results);
      }
    });
  }

  private mapToUiModel(x: any) {
    const symbol = (x?.symbol ?? x?.stock ?? x?.ticker ?? '')
      .toString()
      .toUpperCase()
      .trim();

    const name = (x?.shortName ?? x?.longName ?? x?.name ?? x?.companyName ?? '')
      .toString()
      .trim();

    const price =
      x?.regularMarketPrice ?? x?.close ?? x?.price ?? x?.lastPrice ?? null;

    const changePct =
      x?.regularMarketChangePercent ?? x?.change ?? x?.changePercent ?? 0;

    const volume =
      x?.regularMarketVolume ?? x?.volume ?? x?.totalVolume ?? 0;

    return {
      symbol,
      shortName: name,
      longName: name,
      regularMarketPrice: price,
      regularMarketChangePercent: Number(changePct) || 0,
      regularMarketVolume: Number(volume) || 0
    };
  }

  private normalizarListas(results: any[]) {
    const list = (results ?? [])
      .map(x => this.mapToUiModel(x))
      .filter(x => !!x.symbol);

    this.bancosAll = list;

    const pct = (x: any) => Number(x?.regularMarketChangePercent ?? 0);
    const vol = (x: any) => Number(x?.regularMarketVolume ?? 0);

    this.bancosAltas = [...list].sort((a, b) => pct(b) - pct(a));
    this.bancosBaixas = [...list].sort((a, b) => pct(a) - pct(b));
    this.bancosNegociados = [...list].sort((a, b) => vol(b) - vol(a));
  }

  // =========================
  // UI AÇÕES
  // =========================
  setTab(t: ListTab) {
    this.activeTab = t;
  }

  setPeriod(p: PeriodKey) {
    if (p === this.activePeriod) return;
    this.activePeriod = p;
    this.period$.next(this.activePeriod);
  }

  // ✅ agora troca UI e consulta (remove F se vier)
  setTicker(ticker: string) {
    const display = (ticker ?? '').trim().toUpperCase();
    if (!display) return;

    const query = this.normalizeTickerForHistory(display);

    if (display === this.selectedTicker && query === this.tickerQuery) return;

    this.selectedTicker = display; // UI
    this.tickerQuery = query;      // API

    this.ticker$.next(this.tickerQuery);
  }

  get listaAtual(): any[] {
    if (this.activeTab === 'negociados') return this.bancosNegociados;
    if (this.activeTab === 'baixas') return this.bancosBaixas;
    return this.bancosAltas;
  }

  // =========================
  // HELPERS
  // =========================
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

  isPos(item: any) {
    return Number(item?.regularMarketChangePercent ?? 0) >= 0;
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

  private clearChart() {
    this.lineChartData = {
      labels: [],
      datasets: [{
        data: [],
        label: this.selectedTicker,
        borderColor: '#00d084',
        borderWidth: 3,
        pointRadius: 0,
        fill: true,
        backgroundColor: (ctx: any) => {
          const chart = ctx.chart;
          const { ctx: canvasCtx, chartArea } = chart;
          if (!chartArea) return 'rgba(0, 208, 132, 0.10)';
          const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(0, 208, 132, 0.35)');
          gradient.addColorStop(1, 'rgba(0, 208, 132, 0)');
          return gradient;
        }
      }]
    };
    setTimeout(() => this.chart?.update(), 0);
  }

  // =========================
  // MONTA O GRÁFICO
  // =========================
  private atualizarGraficoComResposta(r: any) {
    const stock = r?.results?.[0];
    const raw = stock?.historicalDataPrice;

    if (!Array.isArray(raw) || raw.length === 0) {
      this.chartError = 'Sem histórico disponível para esse ativo no período selecionado.';
      this.clearChart();
      return;
    }

    let hist = raw
  .map((p: any) => {
    const dateMs = this.parseDateMs(p.date);
    const close = Number(p.close);
    return { dateMs, close };
  })
  .filter((p: any) => Number.isFinite(p.dateMs) && Number.isFinite(p.close))
  .sort((a: any, b: any) => a.dateMs - b.dateMs);

if (!hist.length) {
  this.chartError = 'Sem pontos válidos para montar o gráfico.';
  this.clearChart();
  return;
}

// ✅ se estiver no 1D, mostra apenas o último dia (mesmo tendo buscado 5d)
if (this.activePeriod === '1D') {
  const lastYmd = new Date(hist[hist.length - 1].dateMs).toISOString().slice(0, 10);
  const onlyLastDay = hist.filter(p => new Date(p.dateMs).toISOString().slice(0, 10) === lastYmd);

  // se tiver pontos suficientes, usa só o último dia
  if (onlyLastDay.length >= 10) hist = onlyLastDay;
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
        label: this.selectedTicker,
        borderColor: '#00d084',
        borderWidth: 3,
        pointRadius: 0,
        fill: true,
        backgroundColor: (ctx: any) => {
          const chart = ctx.chart;
          const { ctx: canvasCtx, chartArea } = chart;
          if (!chartArea) return 'rgba(0, 208, 132, 0.10)';
          const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(0, 208, 132, 0.35)');
          gradient.addColorStop(1, 'rgba(0, 208, 132, 0)');
          return gradient;
        }
      }]
    };

    setTimeout(() => this.chart?.update(), 0);
  }
}
