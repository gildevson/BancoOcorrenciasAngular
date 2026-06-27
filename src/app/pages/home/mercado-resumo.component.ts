import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { Subject, timer } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import { MarketMoedasService, FxQuoteItem } from '../../service/marketmoedas.service';

Chart.register(...registerables);

type PeriodKey = '1D' | '1M' | '1A';

const NOMES: Record<string, string> = { USDBRL: 'Dólar', EURBRL: 'Euro', GBPBRL: 'Libra' };
const MOEDAS_PRINCIPAIS = ['USDBRL', 'EURBRL', 'GBPBRL'];
const DAYS: Record<PeriodKey, number> = { '1D': 2, '1M': 30, '1A': 365 };

@Component({
  selector: 'app-mercado-resumo',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  template: `
    <div class="mr-wrap">
      <div class="mr-inner">

        <!-- Header -->
        <div class="mr-head">
          <span class="mr-title">Câmbio em tempo real</span>
          @if (!loading) {
            <span class="mr-update">
              Atualizado às {{ horaAtual }}
              <span class="dot-live"></span>
            </span>
          }
        </div>

        <!-- Loading -->
        @if (loading) {
          <div class="mr-loading">
            <div class="mini-spinner"></div>
            <span>Carregando cotações...</span>
          </div>
        }

        <!-- Grid InfoMoney -->
        @if (!loading) {
          <div class="mr-grid">

            <!-- ── LEFT: chart ── -->
            <div class="mr-left">

              <!-- Search box -->
              <div class="mr-search-box">
                <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24"
                     fill="none" stroke="#9ca3af" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input type="text" [(ngModel)]="buscaTerm" placeholder="Ativo ou índice"
                       (focus)="dropdownVisible = true"
                       (blur)="agendarFecharDropdown()">
                @if (dropdownVisible && pairsFiltered.length) {
                  <div class="busca-drop">
                    @for (q of pairsFiltered; track q.symbol) {
                      <div class="drop-item" (mousedown)="selecionarAtivo(q)">
                        <span class="drop-sym">{{ q.symbol }}</span>
                        <span class="drop-name">{{ q.shortName ?? '' }}</span>
                        <span class="drop-price">{{ formatBRL(q.regularMarketPrice) }}</span>
                      </div>
                    }
                  </div>
                }
              </div>

              <!-- Ativo info -->
              @if (ativoAtivo) {
                <div class="mr-ativo-block">
                  <div class="mr-ativo-row">
                    <span class="mr-ativo-price">{{ formatBRL(ativoAtivo.regularMarketPrice) }}</span>
                    <span [class]="'mr-ativo-pct ' + getPctClass(ativoAtivo.regularMarketChangePercent)">
                      {{ formatPct(ativoAtivo.regularMarketChangePercent) }}
                    </span>
                  </div>
                  <div class="mr-ativo-name">
                    {{ ativoAtivo.longName ?? ativoAtivo.shortName ?? ativoAtivo.symbol }}
                  </div>
                </div>
              }

              <!-- Chart (sempre no DOM) -->
              <div class="mr-chart-area">
                @if (chartLoading) {
                  <div class="chart-spinner"><div class="spinner"></div></div>
                }
                <canvas #chartCanvas></canvas>
              </div>

              <!-- Period + delay -->
              <div class="mr-chart-footer">
                <div class="mr-periods">
                  @for (p of periodos; track p) {
                    <button [class.ativo]="periodoAtivo === p" (click)="mudarPeriodo(p)">{{ p }}</button>
                  }
                </div>
                <span class="mr-delay">⊙ {{ horaAtual }} &bull; Delay 15 min</span>
              </div>

            </div>

            <!-- ── CENTER: altas/baixas ── -->
            <div class="mr-center">

              <div>
                <div class="sec-head alta-head">
                  <span class="badge-alta">▲</span> Maiores Altas
                </div>
                <table class="rank-tbl">
                  <tbody>
                    @for (q of altas; track q.symbol) {
                      <tr class="rank-row" (click)="selecionarAtivo(q)">
                        <td class="rk-sym">{{ q.symbol.replace('BRL','') }}</td>
                        <td class="rk-pct alta">{{ formatPct(q.regularMarketChangePercent) }}</td>
                        <td class="rk-price">R$ {{ formatNum(q.regularMarketPrice) }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <div class="sep"></div>

              <div>
                <div class="sec-head baixa-head">
                  <span class="badge-baixa">▼</span> Maiores Baixas
                </div>
                <table class="rank-tbl">
                  <tbody>
                    @for (q of baixas; track q.symbol) {
                      <tr class="rank-row" (click)="selecionarAtivo(q)">
                        <td class="rk-sym">{{ q.symbol.replace('BRL','') }}</td>
                        <td class="rk-pct baixa">{{ formatPct(q.regularMarketChangePercent) }}</td>
                        <td class="rk-price">R$ {{ formatNum(q.regularMarketPrice) }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

            </div>

            <!-- ── RIGHT: moedas + conversor ── -->
            <div class="mr-right">
              <div class="sec-head">Moedas</div>
              <table class="moedas-tbl">
                <thead>
                  <tr>
                    <th>Moeda</th>
                    <th>Compra</th>
                    <th>Venda</th>
                  </tr>
                </thead>
                <tbody>
                  @for (m of moedasPrincipais; track m.symbol) {
                    <tr class="moeda-row" (click)="selecionarAtivo(m)">
                      <td class="moeda-nome">{{ getNome(m) }}</td>
                      <td class="moeda-val">R$ {{ formatNum(getCompra(m)) }}</td>
                      <td class="moeda-val">R$ {{ formatNum(getVenda(m)) }}</td>
                    </tr>
                  }
                </tbody>
              </table>

              <!-- Conversor -->
              <div class="conv-sep"></div>
              <div class="sec-head">Conversor</div>
              <div class="conv-box">
                <div class="conv-sels">
                  <select [(ngModel)]="convFrom" (ngModelChange)="calcularConversao()" class="conv-sel">
                    @for (c of convCurrencies; track c.code) {
                      <option [value]="c.code">{{ c.code }} – {{ c.nome }}</option>
                    }
                  </select>
                  <button class="conv-swap" (click)="swapConversao()" title="Inverter">⇄</button>
                  <select [(ngModel)]="convTo" (ngModelChange)="calcularConversao()" class="conv-sel">
                    @for (c of convCurrencies; track c.code) {
                      <option [value]="c.code">{{ c.code }} – {{ c.nome }}</option>
                    }
                  </select>
                </div>
                <div class="conv-vals">
                  <input class="conv-input" type="number" [(ngModel)]="convAmount"
                         (ngModelChange)="calcularConversao()" min="0" step="0.01" placeholder="0,00">
                  <div class="conv-result">
                    <span class="conv-result-num">{{ convResultado | number:'1.2-4' }}</span>
                    <span class="conv-result-cur">{{ convTo }}</span>
                  </div>
                </div>
                @if (taxaConvHint) {
                  <div class="conv-hint">{{ taxaConvHint }}</div>
                }
              </div>
            </div>

          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    .mr-wrap { background: #fff; border-bottom: 1px solid #e8ecf0; }
    .mr-inner { max-width: 1250px; margin: 0 auto; padding: 14px 24px 18px; }

    /* Header */
    .mr-head { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
    .mr-title {
      font-size: 0.72rem; font-weight: 800; color: #1E3B65;
      text-transform: uppercase; letter-spacing: 1px;
      padding-left: 8px; border-left: 3px solid #1E3B65;
    }
    .mr-update { font-size: 0.68rem; color: #9ca3af; font-weight: 600; display: flex; align-items: center; gap: 5px; }
    .dot-live { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; animation: pulse 1.8s infinite; }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .4; } }

    /* Grid */
    .mr-grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr 0.8fr;
      border: 1px solid #e0e7ef;
      border-radius: 10px;
      overflow: hidden;
    }

    /* ── LEFT ── */
    .mr-left { padding: 14px 18px; border-right: 1px solid #e0e7ef; display: flex; flex-direction: column; gap: 10px; }

    /* Search */
    .mr-search-box { position: relative; }
    .search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); pointer-events: none; }
    .mr-search-box input {
      width: 100%; box-sizing: border-box;
      padding: 8px 10px 8px 30px;
      border: 1px solid #e0e7ef; border-radius: 8px;
      font-size: 0.78rem; color: #374151; background: #f8fafc;
      transition: border-color 0.15s;
    }
    .mr-search-box input:focus { outline: none; border-color: #1E3B65; background: #fff; }
    .mr-search-box input::placeholder { color: #9ca3af; }

    .busca-drop {
      position: absolute; top: calc(100% + 4px); left: 0; right: 0;
      background: #fff; border: 1px solid #e0e7ef; border-radius: 8px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.1); z-index: 100; max-height: 220px; overflow-y: auto;
    }
    .drop-item { display: flex; align-items: center; gap: 8px; padding: 7px 12px; cursor: pointer; transition: background 0.12s; }
    .drop-item:hover { background: #f0f7ff; }
    .drop-sym { font-weight: 700; color: #1E3B65; font-size: 0.76rem; min-width: 70px; }
    .drop-name { flex: 1; font-size: 0.68rem; color: #9ca3af; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .drop-price { font-weight: 600; font-size: 0.76rem; color: #374151; }

    /* Ativo */
    .mr-ativo-block { display: flex; flex-direction: column; gap: 2px; }
    .mr-ativo-row { display: flex; align-items: baseline; gap: 8px; }
    .mr-ativo-price { font-size: 1.45rem; font-weight: 800; color: #0b1a2d; }
    .mr-ativo-pct { font-size: 0.78rem; font-weight: 700; padding: 2px 7px; border-radius: 4px; }
    .mr-ativo-pct.alta  { color: #15803d; background: #dcfce7; }
    .mr-ativo-pct.baixa { color: #dc2626; background: #fee2e2; }
    .mr-ativo-name { font-size: 0.68rem; color: #9ca3af; }

    /* Chart */
    .mr-chart-area { position: relative; height: 160px; }
    .mr-chart-area canvas { width: 100% !important; height: 100% !important; display: block; }
    .chart-spinner {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
      background: rgba(255,255,255,.8); z-index: 2;
    }
    .spinner { width: 20px; height: 20px; border: 2px solid #e5e7eb; border-top-color: #1E3B65; border-radius: 50%; animation: spin .7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Period bar */
    .mr-chart-footer { display: flex; align-items: center; justify-content: space-between; }
    .mr-periods { display: flex; gap: 4px; }
    .mr-periods button {
      padding: 3px 8px; border: 1px solid #e0e7ef; border-radius: 4px;
      background: transparent; color: #6b7280; font-size: 0.66rem; font-weight: 700;
      cursor: pointer; transition: all 0.15s;
    }
    .mr-periods button:hover { background: #f0f7ff; border-color: #1E3B65; color: #1E3B65; }
    .mr-periods button.ativo { background: #1E3B65; color: #fff; border-color: #1E3B65; }
    .mr-delay { font-size: 0.6rem; color: #9ca3af; }

    /* ── CENTER ── */
    .mr-center { padding: 14px 16px; border-right: 1px solid #e0e7ef; display: flex; flex-direction: column; gap: 4px; }
    .sec-head { font-size: 0.68rem; font-weight: 800; color: #374151; display: flex; align-items: center; gap: 4px; margin-bottom: 6px; }
    .alta-head  { color: #15803d; }
    .baixa-head { color: #dc2626; }
    .badge-alta  { font-size: 9px; color: #15803d; }
    .badge-baixa { font-size: 9px; color: #dc2626; }

    .rank-tbl { width: 100%; border-collapse: collapse; }
    .rank-row { cursor: pointer; transition: background 0.12s; }
    .rank-row:hover td { background: #f0f7ff; }
    .rank-tbl td { padding: 5px 3px; border-bottom: 1px solid #f3f4f6; font-size: 0.74rem; }
    .rank-tbl tr:last-child td { border-bottom: none; }
    .rk-sym   { color: #1E3B65; font-weight: 700; }
    .rk-pct   { font-weight: 700; }
    .rk-pct.alta  { color: #15803d; }
    .rk-pct.baixa { color: #dc2626; }
    .rk-price { color: #374151; text-align: right; font-weight: 600; }

    .sep { height: 1px; background: #e0e7ef; margin: 6px 0; }

    /* ── RIGHT ── */
    .mr-right { padding: 14px 16px; }
    .moedas-tbl { width: 100%; border-collapse: collapse; }
    .moedas-tbl th {
      text-align: left; font-size: 0.6rem; color: #9ca3af;
      font-weight: 700; text-transform: uppercase; letter-spacing: .5px;
      padding: 0 4px 8px;
    }
    .moedas-tbl th:not(:first-child) { text-align: right; }
    .moeda-row { cursor: pointer; transition: background 0.12s; }
    .moeda-row:hover td { background: #f0f7ff; }
    .moedas-tbl td { padding: 6px 4px; border-bottom: 1px solid #f3f4f6; font-size: 0.75rem; }
    .moedas-tbl tr:last-child td { border-bottom: none; }
    .moeda-nome { color: #1E3B65; font-weight: 700; }
    .moeda-val  { text-align: right; color: #374151; font-weight: 600; }

    /* ── Conversor ── */
    .conv-sep { height: 1px; background: #e0e7ef; margin: 12px 0 10px; }
    .conv-box { display: flex; flex-direction: column; gap: 8px; }
    .conv-sels {
      display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 4px;
    }
    .conv-sel {
      width: 100%; padding: 5px 4px; border: 1px solid #e0e7ef; border-radius: 6px;
      font-size: 0.65rem; color: #374151; background: #f8fafc; cursor: pointer;
    }
    .conv-sel:focus { outline: none; border-color: #1E3B65; }
    .conv-swap {
      background: #1E3B65; color: #fff; border: none; border-radius: 5px;
      width: 26px; height: 26px; cursor: pointer; font-size: 0.85rem;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.15s; flex-shrink: 0;
    }
    .conv-swap:hover { background: #162d4e; }
    .conv-vals { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; align-items: center; }
    .conv-input {
      width: 100%; box-sizing: border-box; padding: 7px 8px;
      border: 1px solid #e0e7ef; border-radius: 6px;
      font-size: 0.78rem; color: #374151; background: #fff;
    }
    .conv-input:focus { outline: none; border-color: #1E3B65; }
    .conv-result {
      background: #f0f7ff; border: 1px solid #dbeafe; border-radius: 6px;
      padding: 7px 8px; display: flex; align-items: baseline; gap: 4px; min-width: 0;
    }
    .conv-result-num { font-size: 0.82rem; font-weight: 700; color: #1E3B65; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .conv-result-cur { font-size: 0.62rem; color: #6b7280; font-weight: 600; flex-shrink: 0; }
    .conv-hint { font-size: 0.6rem; color: #9ca3af; text-align: right; }

    /* Loading */
    .mr-loading { display: flex; align-items: center; gap: 10px; padding: 16px 0; color: #9ca3af; font-size: 0.78rem; }
    .mini-spinner { width: 18px; height: 18px; border: 2px solid #e5e7eb; border-top-color: #1E3B65; border-radius: 50%; animation: spin .7s linear infinite; }

    /* Responsivo */
    @media (max-width: 900px) {
      .mr-grid { grid-template-columns: 1fr 1fr; }
      .mr-right { grid-column: 1/-1; border-top: 1px solid #e0e7ef; }
    }
    @media (max-width: 600px) {
      .mr-grid { grid-template-columns: 1fr; }
      .mr-left, .mr-center { border-right: none; border-bottom: 1px solid #e0e7ef; }
      .mr-inner { padding: 12px 14px; }
    }
  `]
})
export class MercadoResumoComponent implements OnInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private destroy$ = new Subject<void>();

  allPairs:        FxQuoteItem[] = [];
  moedasPrincipais: FxQuoteItem[] = [];
  altas:           FxQuoteItem[] = [];
  baixas:          FxQuoteItem[] = [];
  loading  = true;
  horaAtual = '';

  ativoAtivo:   FxQuoteItem | null = null;
  periodoAtivo: PeriodKey = '1D';
  periodos:     PeriodKey[] = ['1D', '1M', '1A'];
  chartLoading  = false;
  private chart: Chart | null = null;

  buscaTerm        = '';
  dropdownVisible  = false;

  // Conversor
  ratesMap = new Map<string, number>();
  convCurrencies = [
    { code: 'BRL', nome: 'Real' },
    { code: 'USD', nome: 'Dólar' },
    { code: 'EUR', nome: 'Euro' },
    { code: 'GBP', nome: 'Libra' },
    { code: 'ARS', nome: 'Peso' },
  ];
  convFrom     = 'BRL';
  convTo       = 'USD';
  convAmount   = 1;
  convResultado = 0;
  taxaConvHint  = '';

  constructor(private api: MarketMoedasService) {}

  ngOnInit() {
    timer(0, 60000).pipe(takeUntil(this.destroy$)).subscribe(() => this.carregar());
  }
  ngOnDestroy() { this.chart?.destroy(); this.destroy$.next(); this.destroy$.complete(); }

  get pairsFiltered(): FxQuoteItem[] {
    const t = this.buscaTerm.toLowerCase().trim();
    const src = t
      ? this.allPairs.filter(q =>
          q.symbol.toLowerCase().includes(t) ||
          (q.shortName ?? '').toLowerCase().includes(t) ||
          (q.longName  ?? '').toLowerCase().includes(t))
      : this.allPairs;
    return src.slice(0, 8);
  }

  private carregar() {
    this.api.quotesMoedas().pipe(
      catchError(() => of(null)),
      takeUntil(this.destroy$)
    ).subscribe((data: any) => {
      if (!data) { this.loading = false; return; }
      const all: FxQuoteItem[] = data?.results ?? (Array.isArray(data) ? data : []);
      const comVar = all.filter(q => q.regularMarketChangePercent != null && q.regularMarketPrice != null);

      this.allPairs        = comVar;
      this.moedasPrincipais = MOEDAS_PRINCIPAIS.map(s => all.find(q => q.symbol === s)).filter((q): q is FxQuoteItem => !!q);
      this.altas           = [...comVar].sort((a, b) => (b.regularMarketChangePercent ?? 0) - (a.regularMarketChangePercent ?? 0)).slice(0, 5);
      this.baixas          = [...comVar].sort((a, b) => (a.regularMarketChangePercent ?? 0) - (b.regularMarketChangePercent ?? 0)).slice(0, 5);
      this.horaAtual       = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      this.ratesMap.clear();
      this.ratesMap.set('BRL', 1);
      for (const q of all) {
        if (q.regularMarketPrice != null && q.symbol.endsWith('BRL')) {
          this.ratesMap.set(q.symbol.replace('BRL', ''), q.regularMarketPrice);
        }
      }
      this.calcularConversao();

      const firstLoad = !this.ativoAtivo;
      if (!this.ativoAtivo) {
        this.ativoAtivo = all.find(q => q.symbol === 'USDBRL') ?? all[0] ?? null;
      } else {
        const fresh = all.find(q => q.symbol === this.ativoAtivo!.symbol);
        if (fresh) this.ativoAtivo = fresh;
      }

      this.loading = false;
      if (firstLoad && this.ativoAtivo) setTimeout(() => this.carregarGrafico(), 0);
    });
  }

  selecionarAtivo(q: FxQuoteItem) {
    this.ativoAtivo     = q;
    this.buscaTerm      = '';
    this.dropdownVisible = false;
    this.carregarGrafico();
  }

  agendarFecharDropdown() { setTimeout(() => this.dropdownVisible = false, 200); }

  mudarPeriodo(p: PeriodKey) { this.periodoAtivo = p; this.carregarGrafico(); }

  private carregarGrafico() {
    if (!this.ativoAtivo || !this.chartCanvas?.nativeElement) return;
    this.chartLoading = true;

    this.api.quoteHistory(this.ativoAtivo.symbol, DAYS[this.periodoAtivo]).pipe(
      catchError(() => of(null)),
      takeUntil(this.destroy$)
    ).subscribe((res: any) => {
      this.chartLoading = false;
      if (!res) return;

      const pontos: { date: string | number; close: number }[] =
        res?.results?.[0]?.historicalDataPrice ?? [];

      const labels = pontos.map(p => {
        const d = new Date(typeof p.date === 'number' ? p.date * 1000 : p.date);
        return this.periodoAtivo === '1D'
          ? d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      });
      const valores = pontos.map(p => p.close);

      this.chart?.destroy();
      const ctx      = this.chartCanvas.nativeElement.getContext('2d')!;
      const gradient = ctx.createLinearGradient(0, 0, 0, 150);
      gradient.addColorStop(0, 'rgba(30,59,101,0.18)');
      gradient.addColorStop(1, 'rgba(30,59,101,0)');

      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            data: valores,
            borderColor: '#1E3B65',
            borderWidth: 1.8,
            pointRadius: 0,
            fill: true,
            backgroundColor: gradient,
            tension: 0.35,
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false, animation: { duration: 400 },
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: c => ' R$ ' + (c.parsed.y ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 4 })
              }
            }
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#9ca3af', maxTicksLimit: 6, font: { size: 10 } } },
            y: {
              position: 'right',
              grid: { color: '#f3f4f6' },
              ticks: { color: '#9ca3af', font: { size: 10 }, callback: v => 'R$ ' + Number(v).toFixed(2) }
            }
          }
        }
      });
    });
  }

  calcularConversao() {
    const rateFrom = this.ratesMap.get(this.convFrom) ?? 0;
    const rateTo   = this.ratesMap.get(this.convTo) ?? 0;
    if (!rateFrom || !rateTo) { this.convResultado = 0; this.taxaConvHint = ''; return; }
    const inBRL = this.convAmount * rateFrom;
    this.convResultado = inBRL / rateTo;
    const rate1 = rateFrom / rateTo;
    this.taxaConvHint = `1 ${this.convFrom} = ${rate1.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ${this.convTo}`;
  }

  swapConversao() {
    const tmp = this.convFrom;
    this.convFrom = this.convTo;
    this.convTo = tmp;
    this.calcularConversao();
  }

  getNome(q: FxQuoteItem): string { return NOMES[q.symbol] ?? q.shortName ?? q.symbol; }
  getCompra(q: FxQuoteItem): number { return (q.regularMarketPrice ?? 0) * 0.9980; }
  getVenda(q: FxQuoteItem):  number { return (q.regularMarketPrice ?? 0) * 1.0020; }
  getPctClass(pct: number | undefined): string { return !pct ? '' : pct >= 0 ? 'alta' : 'baixa'; }

  formatBRL(n: number | undefined): string {
    return n == null ? '--' : n.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  }
  formatNum(n: number | undefined): string {
    return n == null ? '--' : n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 3 });
  }
  formatPct(pct: number | undefined): string {
    return pct == null ? '--' : (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%';
  }
}
