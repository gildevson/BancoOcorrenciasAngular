import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type FxQuoteItem = {
  symbol: string;
  shortName?: string;
  longName?: string;
  regularMarketPrice?: number;
  regularMarketChangePercent?: number;
};

export type HistoryPoint = {
  date: string | number;
  close: number;
};

export type HistoryResponse = {
  results?: Array<{ historicalDataPrice?: HistoryPoint[] }>;
};

export type ConversionResponse = {
  from: string;
  to: string;
  amount: number;
  rate: number;
  converted: number;
  timestamp: number;
};

@Injectable({ providedIn: 'root' })
export class MarketMoedasService {
  private base = `${environment.apiUrl}/market/currency`;

  constructor(private http: HttpClient) {}

  quotesMoedas() {
    return this.http.get<any>(`${this.base}/quotes`);
  }

  quoteHistory(pair: string, days: number = 30): Observable<HistoryResponse> {
    const params = new HttpParams().set('days', days.toString());
    const cleanPair = pair.replace('-', '');
    return this.http.get<HistoryResponse>(`${this.base}/history/${cleanPair}`, { params });
  }

  // ✅ NOVO: Método de conversão
  convertCurrency(from: string, to: string, amount: number): Observable<ConversionResponse> {
    const params = new HttpParams()
      .set('from', from.toUpperCase())
      .set('to', to.toUpperCase())
      .set('amount', amount.toString());

    return this.http.get<ConversionResponse>(`${this.base}/convert`, { params });
  }
}
