import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NoticiasService } from '../../service/noticias.service';
import { Noticia } from '../../models/noticia.model';

@Component({
  selector: 'app-noticias',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './noticias.component.html',
  styleUrls: ['./noticias.component.css']
})
export class NoticiasComponent implements OnInit {
  noticias: Noticia[] = [];
  loading = true;
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
        this.noticias = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar notícias:', err);
        this.erro = 'Não foi possível carregar as notícias. Tente novamente.';
        this.loading = false;
      }
    });
  }

  formatarData(data: string | null): string {
    if (!data) return 'Data não disponível';

    const date = new Date(data);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  calcularTempoLeitura(conteudo: string): number {
    const palavras = conteudo.split(/\s+/).length;
    const minutos = Math.ceil(palavras / 250);
    return minutos;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=400&q=80';
  }
}
