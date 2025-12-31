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

  constructor(private noticiasService: NoticiasService) {}

  ngOnInit(): void {
    this.carregarNoticias();
  }

  carregarNoticias(): void {
    this.loading = true;

    this.noticiasService.getPublicadas().subscribe({
      next: (data) => {
        // ✅ Pega apenas as 3 primeiras (ou 6, como preferir)
        this.noticias = data.slice(0, 6);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar notícias:', err);
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

  // ✅ Calcula tempo de leitura
  calcularTempoLeitura(conteudo: string): number {
    const palavras = conteudo.split(/\s+/).length;
    return Math.ceil(palavras / 250);
  }

  // ✅ Fallback de imagem
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=400&q=80';
  }
}
