import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type QuoteItem = {
  symbol?: string;
  stock?: string;
  ticker?: string;

  shortName?: string;
  longName?: string;
  name?: string;
  companyName?: string;

  regularMarketPrice?: number;
  price?: number;
  lastPrice?: number;
  close?: number;

  regularMarketChangePercent?: number;
  changePercent?: number;
  change?: number;

  regularMarketVolume?: number;
  volume?: number;
  totalVolume?: number;
};

export type HistoryPoint = {
  date: string | number;   // BRAPI pode vir em string ISO ou timestamp
  close: number;
};

export type HistoryResult = {
  historicalDataPrice?: HistoryPoint[];
};

export type HistoryResponse = {
  results?: HistoryResult[];
  stocks?: any[];
};

@Injectable({ providedIn: 'root' })
export class MarketBancosService {
  private base = `${environment.apiUrl}/market`;

  constructor(private http: HttpClient) {}

  financeList(order: 'asc' | 'desc' = 'desc', limit = 50, page = 1) {
    const params = new HttpParams()
      .set('sector', 'Finance')
      .set('sortBy', 'change')
      .set('sortOrder', order)
      .set('limit', limit)
      .set('page', page);

    return this.http.get<any>(`${this.base}/list`, { params });
  }

  quotesBancos() {
    return this.http.get<any>(`${this.base}/quote`, {
      params: { symbols: 'ITUB4,BBDC4,BBAS3,SANB11,BPAC11,ABCB4,BRSR6,PINE4,BMGB4' }
    });
  }

  quoteHistory(ticker: string, range: string, interval: string) {
    const params = new HttpParams().set('range', range).set('interval', interval);
    return this.http.get<HistoryResponse>(`${this.base}/history/${ticker}`, { params });
  }
}
