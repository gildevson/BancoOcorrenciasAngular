import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Noticia } from '../models/noticia.model';

@Injectable({
  providedIn: 'root'
})
export class NoticiasService {
  private apiUrl = `${environment.apiUrl}/noticias`;

  constructor(private http: HttpClient) {}

  // GET /api/noticias - Lista notícias publicadas
  getPublicadas(): Observable<Noticia[]> {
    return this.http.get<Noticia[]>(this.apiUrl);
  }

  // GET /api/noticias/slug/{slug} - Busca por slug
  getBySlug(slug: string): Observable<Noticia> {
    return this.http.get<Noticia>(`${this.apiUrl}/slug/${slug}`);
  }

  // GET /api/noticias/categoria/{categoria} - Filtra por categoria
  getByCategoria(categoria: string): Observable<Noticia[]> {
    return this.http.get<Noticia[]>(`${this.apiUrl}/categoria/${categoria}`);
  }

  // GET /api/noticias/destaques - Notícias em destaque
  getDestaques(limit: number = 5): Observable<Noticia[]> {
    return this.http.get<Noticia[]>(`${this.apiUrl}/destaques?limit=${limit}`);
  }

  // GET /api/noticias/mais-lidas - Mais visualizadas
  getMaisLidas(limit: number = 10): Observable<Noticia[]> {
    return this.http.get<Noticia[]>(`${this.apiUrl}/mais-lidas?limit=${limit}`);
  }

  // POST /api/noticias/{id}/visualizar - Incrementa visualizações
  registrarVisualizacao(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/visualizar`, {});
  }
}
