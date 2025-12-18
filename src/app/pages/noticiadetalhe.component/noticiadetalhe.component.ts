import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NOTICIAS, Noticia } from '../../data/noticias.data';

@Component({
  selector: 'app-noticia-detalhe',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './noticiadetalhe.component.html',
  styleUrls: ['./noticiadetalhe.component.css'],
})
export class NoticiaDetalheComponent {
  noticia?: Noticia;

  constructor(private route: ActivatedRoute) {
    const slug = this.route.snapshot.paramMap.get('slug');
    this.noticia = NOTICIAS.find(n => n.slug === slug);
  }
}
