import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NoticiasService } from '../../service/noticias.service';
import { Noticia } from '../../models/noticia.model';

@Component({
  selector: 'app-noticias-editar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
    private router: Router
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
          imagemCapa: [noticia.imagemCapa],
          fonteNome: [noticia.fonteNome],
          fonteUrl: [noticia.fonteUrl],
          fontePublicadaEm: [noticia.fontePublicadaEm],
          fonteAutor: [noticia.fonteAutor]
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
    this.noticiasService.updateNoticia(this.noticiaId, this.noticiaForm.value).subscribe({
      next: () => this.router.navigate(['/noticias-admin']),
      error: () => {
        this.errorMsg = 'Erro ao atualizar notícia.';
        this.loading = false;
      }
    });
  }
}
