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
  private refreshInterval?: any;

  // listas
  bancosAll: any[] = [];
  bancosAltas: any[] = [];
  bancosBaixas: any[] = [];
  bancosNegociados: any[] = [];

  activeTab: ListTab = 'altas';
  searchTerm = ''; // ✅ Propriedade para busca

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
    '1D': { range: '5d', interval: '15m' },
    '1M': { range: '3mo', interval: '1d' },
    '1A': { range: '5y', interval: '1wk' },
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
    datasets: [{
      data: [],
      label: this.selectedTicker,
      fill: true
    }]
  };

  ngOnInit() {
    // ✅ Carrega lista inicial
    this.carregarBancos();

    // ✅ Atualiza lista a cada 30 segundos
    this.refreshInterval = setInterval(() => {
      console.log('🔄 Atualizando lista de bancos...');
      this.carregarBancos();
    }, 30000);

    // ✅ Monitora mudanças no ticker e período
    combineLatest([this.ticker$, this.period$]).pipe(
      distinctUntilChanged(([t1, p1], [t2, p2]) => t1 === t2 && p1 === p2),

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

    // ✅ Limpa o intervalo de atualização
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
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
    let list = [];

    if (this.activeTab === 'negociados') list = this.bancosNegociados;
    else if (this.activeTab === 'baixas') list = this.bancosBaixas;
    else list = this.bancosAltas;

    // ✅ Filtra por termo de busca
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      list = list.filter(item =>
        item.symbol.toLowerCase().includes(term) ||
        (item.shortName || '').toLowerCase().includes(term)
      );
    }

    return list;
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
    // ✅ LOG 1: Ver o que a API retornou
    console.log('📊 RESPOSTA COMPLETA DA API:', r);
    console.log('📊 r.results:', r?.results);
    console.log('📊 r.results[0]:', r?.results?.[0]);

    const stock = r?.results?.[0];
    const raw = stock?.historicalDataPrice;

    // ✅ LOG 2: Ver os dados históricos
    console.log('📊 historicalDataPrice:', raw);
    console.log('📊 É array?', Array.isArray(raw));
    console.log('📊 Tamanho:', raw?.length);

    if (!Array.isArray(raw) || raw.length === 0) {
      console.error('❌ SEM DADOS:', { raw, isArray: Array.isArray(raw), length: raw?.length });
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

    // ✅ LOG 3: Ver dados processados
    console.log('📊 Dados processados (primeiros 3):', hist.slice(0, 3));
    console.log('📊 Total de pontos:', hist.length);

    if (!hist.length) {
      console.error('❌ SEM PONTOS VÁLIDOS');
      this.chartError = 'Sem pontos válidos para montar o gráfico.';
      this.clearChart();
      return;
    }

    // ✅ se estiver no 1D, mostra apenas o último dia
    if (this.activePeriod === '1D') {
      const lastYmd = new Date(hist[hist.length - 1].dateMs).toISOString().slice(0, 10);
      const onlyLastDay = hist.filter(p => new Date(p.dateMs).toISOString().slice(0, 10) === lastYmd);

      console.log('📊 Filtrando 1D - Antes:', hist.length, 'Depois:', onlyLastDay.length);

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

    console.log('✅ GRÁFICO MONTADO COM SUCESSO!');
    console.log('📊 Labels (primeiros 5):', this.lineChartData.labels?.slice(0, 5));
    console.log('📊 Data (primeiros 5):', this.lineChartData.datasets[0].data.slice(0, 5));

    setTimeout(() => this.chart?.update(), 0);
  }
}
