import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MarketBancosService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // 🔹 Lista setor Finance
  financeList(order: 'asc' | 'desc' = 'desc', limit = 50, page = 1) {
    const params = new HttpParams()
      .set('sector', 'Finance')
      .set('sortBy', 'change')
      .set('sortOrder', order)
      .set('limit', limit)
      .set('page', page);

    return this.http.get<any>(`${this.api}/market/list`, { params });
  }

  // 🔹 Cotações específicas
  quotesBancos() {
    return this.http.get<any>(
      `${this.api}/market/quote`,
      { params: { symbols: 'ITUB4,BBDC4,BBAS3,SANB11,BPAC11,ABCB4,BRSR6,PINE4,BMGB4' } }
    );
  }

  // 🔹 Histórico
  quoteHistory(ticker: string, range: string, interval: string) {
    const params = new HttpParams()
      .set('range', range)
      .set('interval', interval);

    return this.http.get<any>(`${this.api}/market/history/${ticker}`, { params });
  }
}
