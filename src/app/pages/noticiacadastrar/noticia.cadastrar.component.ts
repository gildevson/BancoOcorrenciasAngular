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

    // Ajustar payload
    const raw = this.noticiaForm.value;
    const payload = {
      ...raw,
      // Remover espaços extras
      titulo: raw.titulo?.trim(),
      slug: raw.slug?.trim(),
      resumo: raw.resumo?.trim(),
      conteudo: raw.conteudo?.trim(),
      categoria: raw.categoria?.trim(),
      autorNome: raw.autorNome?.trim(),
      metaDescription: raw.metaDescription?.trim(),
      imagemUrl: raw.imagemUrl?.trim(),
      fonteNome: raw.fonteNome?.trim(),
      fonteUrl: raw.fonteUrl?.trim(),
      fonteAutor: raw.fonteAutor?.trim(),
      // Datas no formato ISO completo ou null
      dataPublicacao: raw.dataPublicacao ? this.toIsoWithSeconds(raw.dataPublicacao) : null,
      fontePublicadaEm: raw.fontePublicadaEm ? this.toIsoWithSeconds(raw.fontePublicadaEm) : null,
    };

    this.noticiasService.cadastrarNoticia(payload).subscribe({
      next: () => this.router.navigate(['/noticias']),
      error: err => {
        this.errorMsg = 'Erro ao cadastrar notícia.';
        this.isSubmitting = false;
      }
    });
  }

  // Converte "2026-01-20T23:47" para "2026-01-20T23:47:00"
  private toIsoWithSeconds(dt: string): string {
    if (!dt) return '';
    // Se já tem segundos, retorna
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(dt)) return dt;
    // Se não tem segundos, adiciona
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dt)) return dt + ':00';
    return dt;
  }
}
