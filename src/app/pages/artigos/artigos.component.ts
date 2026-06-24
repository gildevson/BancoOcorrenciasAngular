import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-artigos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './artigos.component.html',
  styleUrls: ['./artigos.component.css']
})
export class ArtigosComponent {
  artigos = [
    {
      slug: 'cnab-240',
      titulo: 'O que é CNAB 240? Guia Completo',
      resumo: 'Entenda o padrão FEBRABAN de 240 posições utilizado por bancos brasileiros para remessa e retorno de cobranças.',
      categoria: 'CNAB',
      tempo: 8,
      data: '2026-06-01',
      icone: 'description'
    },
    {
      slug: 'cnab-400',
      titulo: 'O que é CNAB 400? Guia Completo',
      resumo: 'Conheça o padrão de 400 posições, um dos mais utilizados no mercado financeiro brasileiro para arquivos de cobrança bancária.',
      categoria: 'CNAB',
      tempo: 7,
      data: '2026-06-05',
      icone: 'article'
    },
  ];

  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
