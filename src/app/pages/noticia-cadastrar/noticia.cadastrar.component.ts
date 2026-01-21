import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NoticiasService } from '../../service/noticias.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-noticia-cadastrar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './noticia.cadastrar.component.html',
  styleUrls: ['./noticia.cadastrar.component.css']
})
export class NoticiaCadastrarComponent {
  noticiaForm: FormGroup;
  isSubmitting = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private noticiasService: NoticiasService,
    private router: Router
  ) {
    this.noticiaForm = this.fb.group({
      titulo: ['', Validators.required],
      slug: ['', Validators.required],
      resumo: ['', Validators.required],
      conteudo: ['', Validators.required],
      categoria: ['', Validators.required],
      status: ['publicado', Validators.required],
      publicado: [true],
      dataPublicacao: ['', Validators.required],
      autorNome: ['', Validators.required],
      destaque: [false],
      visualizacoes: [0],
      metaDescription: [''],
      imagemUrl: [''],
      fonteNome: [''],
      fonteUrl: [''],
      fontePublicadaEm: [''],
      fonteAutor: ['']
    });
  }

  onSubmit() {
    if (this.noticiaForm.invalid) return;
    this.isSubmitting = true;
    this.errorMsg = '';
    this.noticiasService.cadastrarNoticia(this.noticiaForm.value).subscribe({
      next: () => this.router.navigate(['/noticias']),
      error: err => {
        this.errorMsg = 'Erro ao cadastrar notícia.';
        this.isSubmitting = false;
      }
    });
  }
}
