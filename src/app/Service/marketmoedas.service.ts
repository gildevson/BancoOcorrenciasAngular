import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type FxQuoteItem = {
  symbol: string;
  shortName?: string;
  longName?: string;
  regularMarketPrice?: number;
  regularMarketChangePercent?: number;
};

export type HistoryPoint = { date: string | number; close: number; };
export type HistoryResponse = { results?: Array<{ historicalDataPrice?: HistoryPoint[] }>; };

@Injectable({ providedIn: 'root' })
export class MarketMoedasService {
  private base = `${environment.apiUrl}/market/currency`; // ✅ SEM /api

  constructor(private http: HttpClient) {}

  quotesMoedas() {
    return this.http.get<any>(`${this.base}/quotes`);
  }

  quoteHistory(pair: string, days: number = 30) {
    const params = new HttpParams().set('days', days.toString());
    const cleanPair = pair.replace('-', '');
    return this.http.get<HistoryResponse>(`${this.base}/history/${cleanPair}`, { params });
  }
}
