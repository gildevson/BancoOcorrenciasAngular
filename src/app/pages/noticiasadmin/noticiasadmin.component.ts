import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoticiasService } from '../../service/noticias.service';
import { Noticia } from '../../models/noticia.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-noticias-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './noticiasadmin.component.html',
  styleUrls: ['./noticiasadmin.component.css']
})
export class NoticiasAdminComponent implements OnInit {
    onImageError(event: Event): void {
      const img = event.target as HTMLImageElement;
      img.src = 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=80&q=40';
    }
  noticias: Noticia[] = [];
  loading = true;
  erro = '';
  excluindoId: string | null = null;

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
      error: (err) => {
        this.erro = 'Erro ao carregar notícias.';
        this.loading = false;
      }
    });
  }

  confirmarExcluir(noticia: Noticia) {
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
