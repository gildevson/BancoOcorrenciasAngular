import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { FinanceHighlightsComponent } from '../financehighlights/financehighlights.component';
import { MercadoResumoComponent } from './mercado-resumo.component';
import { BannerPromoComponent } from './banner-promo.component';
import { NoticiasService } from '../../service/noticias.service';
import { Noticia } from '../../models/noticia.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FinanceHighlightsComponent, MercadoResumoComponent, BannerPromoComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  readonly DEFAULT_IMG = 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=800&q=80';
  noticias: Noticia[] = [];
  loading = false;
  erro = '';

  constructor(private noticiasService: NoticiasService) {}

  ngOnInit(): void {
    this.carregarNoticias();
  }

  carregarNoticias(): void {
    this.loading = true;
    this.erro = '';

    this.noticiasService.getPublicadas().subscribe({
      next: (data: Noticia[]) => {
        const noticiasOrdenadas = data.sort((a: Noticia, b: Noticia) => {
          const dataA = a.dataPublicacao ? new Date(a.dataPublicacao).getTime() : 0;
          const dataB = b.dataPublicacao ? new Date(b.dataPublicacao).getTime() : 0;
          return dataB - dataA;
        });

        this.noticias = noticiasOrdenadas;
        this.loading = false;
      },
      error: (err: unknown) => {
        console.error('Erro ao carregar notícias:', err);
        this.erro = 'Erro ao carregar notícias. Tente novamente.';
        this.loading = false;
      }
    });
  }

  formatarData(data: string | null): string {
    if (!data) return 'Data indisponível';
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  calcularTempoLeitura(conteudo: string): number {
    if (!conteudo) return 1;
    const textoLimpo = conteudo
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const palavras = textoLimpo.split(/\s+/).length;
    return Math.max(1, Math.ceil(palavras / 250));
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=400&q=80';
  }

  get gruposPorCategoria(): { categoria: string; noticias: Noticia[] }[] {
    const map = new Map<string, Noticia[]>();
    for (const n of this.noticias.slice(4)) {
      const cat = n.categoria || 'Geral';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(n);
    }
    return Array.from(map.entries()).map(([categoria, noticias]) => ({ categoria, noticias }));
  }

  recarregar(): void {
    this.carregarNoticias();
  }
}
