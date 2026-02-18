import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoticiasService } from '../../service/noticias.service';
import { Noticia } from '../../models/noticia.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-noticias-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './noticiasadmin.component.html',
  styleUrls: ['./noticiasadmin.component.css']
})
export class NoticiasAdminComponent implements OnInit {
  noticias: Noticia[] = [];
  loading = true;
  erro = '';
  excluindoId: string | null = null;
  termoBusca = '';

  constructor(private noticiasService: NoticiasService) {}

  ngOnInit(): void {
    this.carregarNoticias();
  }

  carregarNoticias(): void {
    this.loading = true;
    this.erro = '';
    this.noticiasService.getAll().subscribe({
      next: (data) => {
        this.noticias = data;
        this.loading = false;
      },
      error: () => {
        this.erro = 'Erro ao carregar notícias.';
        this.loading = false;
      }
    });
  }

  get noticiasFiltradas(): Noticia[] {
    const termo = this.termoBusca.trim().toLowerCase();
    if (!termo) return this.noticias;
    return this.noticias.filter(n =>
      n.titulo.toLowerCase().includes(termo) ||
      (n.categoria ?? '').toLowerCase().includes(termo)
    );
  }

  get totalNoticias(): number {
    return this.noticias.length;
  }

  get noticiasPublicadas(): number {
    return this.noticias.filter(n => n.publicado).length;
  }

  get noticiasRascunho(): number {
    return this.noticias.filter(n => !n.publicado).length;
  }

  get noticiasDestaque(): number {
    return this.noticias.filter(n => n.destaque).length;
  }

  getStatusClass(status: string | null): string {
    if (!status) return 'badge-muted';
    const s = status.toLowerCase();
    if (s === 'publicado') return 'badge-success';
    if (s === 'rascunho') return 'badge-warning';
    if (s === 'arquivado') return 'badge-neutral';
    return 'badge-neutral';
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=80&q=40';
  }

  confirmarExcluir(noticia: Noticia): void {
    if (!confirm(`Tem certeza que deseja excluir a notícia "${noticia.titulo}"?`)) return;
    this.excluindoId = noticia.id;
    this.noticiasService.deleteNoticia(noticia.id).subscribe({
      next: () => {
        this.noticias = this.noticias.filter(n => n.id !== noticia.id);
        this.excluindoId = null;
      },
      error: () => {
        alert('Erro ao excluir notícia.');
        this.excluindoId = null;
      }
    });
  }
}
