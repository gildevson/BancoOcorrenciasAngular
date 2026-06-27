import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NoticiasService } from '../../service/noticias.service';
import { Noticia } from '../../models/noticia.model';

@Component({
  selector: 'app-noticias-editar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './noticiaseditar.component.html',
  styleUrls: ['./noticiaseditar.component.css']
})
export class NoticiasEditarComponent implements OnInit {
  noticiaForm!: FormGroup;
  loading = true;
  errorMsg = '';
  noticiaId!: string;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private noticiasService: NoticiasService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.noticiaId = this.route.snapshot.params['id'];
    this.noticiasService.getById(this.noticiaId).subscribe({
      next: noticia => {
        this.noticiaForm = this.fb.group({
          titulo: [noticia.titulo, Validators.required],
          slug: [noticia.slug, Validators.required],
          resumo: [noticia.resumo, Validators.required],
          conteudo: [noticia.conteudo, Validators.required],
          categoria: [noticia.categoria, Validators.required],
          status: [noticia.status, Validators.required],
          publicado: [noticia.publicado],
          dataPublicacao: [noticia.dataPublicacao, Validators.required],
          autorNome: [noticia.autorNome, Validators.required],
          destaque: [noticia.destaque],
          visualizacoes: [noticia.visualizacoes],
          metaDescription: [noticia.metaDescription],
          imagemUrl: [noticia.imagemCapa],
          fonteNome: [noticia.fonteNome],
          fonteUrl: [noticia.fonteUrl],
          fontePublicadaEm: [noticia.fontePublicadaEm],
          fonteAutor: [noticia.fonteAutor],
          videoUrl: [noticia.videoUrl ?? '']
        });
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Erro ao carregar notícia.';
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (this.noticiaForm.invalid) return;
    this.loading = true;
    this.errorMsg = '';
    const raw = this.noticiaForm.value;
    const payload = { ...raw, videoUrl: raw.videoUrl?.trim() || null };
    this.noticiasService.updateNoticia(this.noticiaId, payload).subscribe({
      next: () => this.router.navigate(['/noticias-admin']),
      error: () => {
        this.errorMsg = 'Erro ao atualizar notícia.';
        this.loading = false;
      }
    });
  }

  getYouTubeId(url: string | null | undefined): string | null {
    if (!url) return null;
    const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
  }

  getYouTubeEmbed(id: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${id}`);
  }
}
