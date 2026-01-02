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
  linkCopiado = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private noticiasService: NoticiasService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) this.carregarNoticia(slug);
    else {
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

        // registra visualização (sem travar a tela se falhar)
        this.noticiasService.registrarVisualizacao(data.id).subscribe({
          error: () => {}
        });
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

  // ✅ HTML seguro no template
  getConteudoSeguro(): SafeHtml {
    const html = this.noticia?.conteudo || '';
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  formatarData(data: string | null): string {
    if (!data) return 'Data não disponível';
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  // ✅ tempo de leitura sem contar tags HTML
  calcularTempoLeitura(): number {
    if (!this.noticia?.conteudo) return 0;

    const texto = this.noticia.conteudo
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const palavras = texto ? texto.split(' ').length : 0;
    return Math.max(1, Math.ceil(palavras / 250));
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=1400&q=80';
  }

  voltar(): void {
    this.router.navigate(['/noticias']);
  }

  // ✅ Compartilhamento nas redes sociais
  compartilhar(rede: string): void {
    if (!this.noticia) return;

    const url = encodeURIComponent(window.location.href);
    const titulo = encodeURIComponent(this.noticia.titulo);
    const resumo = encodeURIComponent(this.noticia.resumo || '');

    let shareUrl = '';

    switch (rede) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${titulo}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${titulo}%20${url}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${url}&text=${titulo}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${titulo}&body=${resumo}%0A%0A${url}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  }

  // ✅ Copiar link para área de transferência
  copiarLink(): void {
    navigator.clipboard.writeText(window.location.href).then(() => {
      this.linkCopiado = true;
      setTimeout(() => {
        this.linkCopiado = false;
      }, 2000);
    }).catch(err => {
      console.error('Erro ao copiar link:', err);
    });
  }
}
