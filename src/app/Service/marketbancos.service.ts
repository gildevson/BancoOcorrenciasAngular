import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MarketBancosService {

  private base = environment.apiUrl + '/market';

  constructor(private http: HttpClient) {}

  // 🔹 Lista de bancos (Finance)
  financeList(sortOrder: string = 'desc', limit: number = 80): Observable<any> {
    return this.http.get(`${this.base}/list`, {
      params: {
        sector: 'Finance',
        sortBy: 'change',
        sortOrder,
        limit
      }
    });
  }

  // 🔹 Histórico do ativo
  quoteHistory(ticker: string, range: string, interval: string): Observable<any> {
    return this.http.get(`${this.base}/history/${ticker}`, {
      params: { range, interval }
    });
  }

  // 🔹 (opcional) quote direto
  quotesBancos(): Observable<any> {
    return this.http.get(`${this.base}/list`);
  }
}
