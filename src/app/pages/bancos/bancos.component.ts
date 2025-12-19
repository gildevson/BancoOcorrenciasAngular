import { Component, inject, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables, ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { MarketBancosService } from '../../Service/marketbancos.service';

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

  // listas (apenas bancos)
  bancosAll: any[] = [];
  bancosAltas: any[] = [];
  bancosBaixas: any[] = [];
  bancosNegociados: any[] = [];

  activeTab: ListTab = 'altas';

  selectedTicker = 'ITUB4';
  activePeriod: PeriodKey = '1D';

  chartLoading = false;

  private ticker$ = new BehaviorSubject<string>(this.selectedTicker);
  private period$ = new BehaviorSubject<PeriodKey>(this.activePeriod);
  private destroy$ = new Subject<void>();

  private periodMap: Record<PeriodKey, { range: string; interval: string }> = {
    '1D': { range: '1d', interval: '5m' },
    '1M': { range: '1mo', interval: '1d' },
    '1A': { range: '1y', interval: '1wk' },
    'Todos': { range: 'max', interval: '1mo' }
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
    datasets: [{ data: [], fill: true }]
  };

  ngOnInit() {
    this.carregarBancos();

    combineLatest([this.ticker$, this.period$]).pipe(
      distinctUntilChanged(([t1, p1], [t2, p2]) => t1 === t2 && p1 === p2),
      tap(() => (this.chartLoading = true)),
      switchMap(([ticker, period]) => {
        const { range, interval } = this.periodMap[period];
        return this.api.quoteHistory(ticker, range, interval).pipe(
          finalize(() => (this.chartLoading = false))
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe({
  next: (r: any) => this.atualizarGraficoComResposta(r),
  error: () => (this.chartLoading = false)
});
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // =========================
  // LISTAS (BANCOS)
  // =========================
  carregarBancos() {
    this.api.quotesBancos().subscribe({
      next: (r) => {
        const results = (r?.results ?? r?.stocks ?? []) as any[];
        if (!results.length) {
          this.carregarBancosViaFinanceList();
          return;
        }
        this.normalizarListas(results);
      },
      error: () => this.carregarBancosViaFinanceList()
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
        regularMarketChange: null,
        regularMarketVolume: 0
      }));

      this.normalizarListas(results);
    },
    error: () => {
      // se quiser, trate o erro
    }
  });
}

  private normalizarListas(results: any[]) {
    this.bancosAll = results;

    const pct = (x: any) => Number(x?.regularMarketChangePercent ?? x?.change ?? 0);
    const vol = (x: any) => Number(x?.regularMarketVolume ?? 0);

    this.bancosAltas = [...results].sort((a, b) => pct(b) - pct(a));
    this.bancosBaixas = [...results].sort((a, b) => pct(a) - pct(b));
    this.bancosNegociados = [...results].sort((a, b) => vol(b) - vol(a));
  }

  // =========================
  // AÇÕES UI
  // =========================
  setTab(t: ListTab) {
    this.activeTab = t;
  }

  setPeriod(p: PeriodKey) {
    if (p === this.activePeriod) return;
    this.activePeriod = p;
    this.period$.next(this.activePeriod);
  }

  setTicker(ticker: string) {
    const t = (ticker ?? '').trim().toUpperCase();
    if (!t || t === this.selectedTicker) return;

    this.selectedTicker = t;
    this.ticker$.next(this.selectedTicker);
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

  fmtSigned(v: any) {
    const n = Number(v);
    if (!isFinite(n)) return '';
    const s = n >= 0 ? '+' : '';
    return `${s}${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

  // =========================
  // MONTA O GRÁFICO
  // =========================
  private atualizarGraficoComResposta(r: any) {
  const stock = r?.results?.[0];
  const raw = stock?.historicalDataPrice;

  if (!Array.isArray(raw) || raw.length === 0) return;

  const hist = raw
    .map((p: any) => {
      const ts = Number(p.date);
      const close = Number(p.close);

      // ✅ BRAPI pode vir em segundos ou ms
      const dateMs = ts > 1_000_000_000_000 ? ts : ts * 1000;

      return { dateMs, close };
    })
    .filter((p: any) => Number.isFinite(p.dateMs) && Number.isFinite(p.close))
    .sort((a: any, b: any) => a.dateMs - b.dateMs);

  if (!hist.length) return;

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

  // ✅ força redesenho (às vezes precisa “um tick”)
  setTimeout(() => this.chart?.update(), 0);
}
}
