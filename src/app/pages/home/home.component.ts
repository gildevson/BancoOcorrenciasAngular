import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FinanceHighlightsComponent } from '../financehighlights/financehighlights.component';
import { BancosComponent } from "../bancos/bancos.component";
import { NoticiasService } from '../../service/noticias.service';
import { Noticia } from '../../models/noticia.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FinanceHighlightsComponent, BancosComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
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
      next: (data) => {
        // ✅ Ordena por data de publicação (mais recente primeiro)
        const noticiasOrdenadas = data.sort((a, b) => {
          const dataA = a.dataPublicacao ? new Date(a.dataPublicacao).getTime() : 0;
          const dataB = b.dataPublicacao ? new Date(b.dataPublicacao).getTime() : 0;
          return dataB - dataA; // Decrescente (mais recente primeiro)
        });

        // ✅ Pega exatamente as 6 primeiras
        this.noticias = noticiasOrdenadas.slice(0, 6);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar notícias:', err);
        this.erro = 'Erro ao carregar notícias. Tente novamente.';
        this.loading = false;
      }
    });
  }

  // ✅ Formata data
  formatarData(data: string | null): string {
    if (!data) return 'Data indisponível';

    const date = new Date(data);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  // ✅ Calcula tempo de leitura (remove HTML)
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

  // ✅ Fallback de imagem
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=400&q=80';
  }

  // ✅ Método para recarregar em caso de erro
  recarregar(): void {
    this.carregarNoticias();
  }
}
