import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NoticiasService } from '../../service/noticias.service';
import { Noticia } from '../../models/noticia.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-noticia-detalhe',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './noticiadetalhe.component.html',
  styleUrls: ['./noticiadetalhe.component.css']
})
export class NoticiaDetalheComponent implements OnInit {
  noticia?: Noticia;
  loading = true;
  erro = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private noticiasService: NoticiasService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.carregarNoticia(slug);
    } else {
      this.erro = 'Slug da notícia não encontrado.';
      this.loading = false;
    }
  }

  carregarNoticia(slug: string): void {
    this.loading = true;
    this.erro = '';

    this.noticiasService.getBySlug(slug).subscribe({
      next: (data) => {
        this.noticia = data;
        this.loading = false;

        // ✅ Registra visualização
        this.noticiasService.registrarVisualizacao(data.id).subscribe();
      },
      error: (err) => {
        console.error('Erro ao carregar notícia:', err);
        this.erro = err.status === 404
          ? 'Notícia não encontrada.'
          : 'Erro ao carregar notícia. Tente novamente.';
        this.loading = false;
      }
    });
  }

  // Sanitiza HTML do conteúdo
  getConteudoSeguro(): SafeHtml {
    return this.sanitizer.sanitize(1, this.noticia?.conteudo || '') || '';
  }

  // Formata data
  formatarData(data: string | null): string {
    if (!data) return 'Data não disponível';

    const date = new Date(data);
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  // Tempo de leitura
  calcularTempoLeitura(): number {
    if (!this.noticia) return 0;
    const palavras = this.noticia.conteudo.split(/\s+/).length;
    return Math.ceil(palavras / 250);
  }

  // Fallback imagem
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=1400&q=80';
  }

  // Voltar
  voltar(): void {
    this.router.navigate(['/noticias']);
  }
}
