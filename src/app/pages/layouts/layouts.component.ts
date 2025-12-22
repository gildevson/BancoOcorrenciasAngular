import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BancoLayout, LAYOUTS_BANCO, TipoLayout } from '../../data/layouts.data';

@Component({
  selector: 'app-layouts',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './layouts.component.html',
  styleUrls: ['./layouts.component.css'],
})
export class LayoutsComponent {

  private router = inject(Router); // ✅ NOVO

  // Dados dos layouts
  layouts: BancoLayout[] = LAYOUTS_BANCO;

  // Filtros
  q = '';
  tipo: TipoLayout | 'Todos' = 'Todos';

  get filtrados(): BancoLayout[] {
    const query = this.q.trim().toLowerCase();

    return this.layouts.filter(layout => {
      if (this.tipo !== 'Todos' && layout.tipoLayout !== this.tipo) return false;
      if (!query) return true;

      return (
        layout.bancoNome.toLowerCase().includes(query) ||
        layout.bancoNumero.toLowerCase().includes(query) ||
        layout.tipoLayout.toLowerCase().includes(query) ||
        (layout.versao ?? '').toLowerCase().includes(query) ||
        (layout.descricao ?? '').toLowerCase().includes(query)
      );
    });
  }

  limpar(): void {
    this.q = '';
    this.tipo = 'Todos';
  }

  // ✅ AGORA "Detalhes" VAI PRA ROTA /layouts/:id
  verDetalhes(layout: BancoLayout): void {
    this.router.navigate(['/layouts', layout.id]);
  }

  // ✅ OPCIONAL: download via TS (se quiser usar botão (click))
  baixarPdf(layout: BancoLayout): void {
    if (!layout.pdfUrl) return;

    const a = document.createElement('a');
    a.href = layout.pdfUrl;
    a.download = `${layout.bancoNumero}-${layout.tipoLayout}${layout.versao ? '-v' + layout.versao : ''}.pdf`;
    a.target = '_blank';
    a.rel = 'noopener';
    a.click();
  }

  get totalFiltrados(): number {
    return this.filtrados.length;
  }

  get totalLayouts(): number {
    return this.layouts.length;
  }

  get temFiltrosAtivos(): boolean {
    return this.q.trim() !== '' || this.tipo !== 'Todos';
  }

  exportarJSON(): void {
    const dados = JSON.stringify(this.filtrados, null, 2);
    const blob = new Blob([dados], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `layouts-banco-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  exportarCSV(): void {
    const headers = ['Banco', 'Número', 'Tipo', 'Versão', 'Status', 'Descrição', 'Atualizado Em'];
    const rows = this.filtrados.map(l => [
      l.bancoNome,
      l.bancoNumero,
      l.tipoLayout,
      l.versao || '',
      l.status || 'Ativo',
      (l.descricao || '').replace(/,/g, ';'),
      l.atualizadoEm || ''
    ]);

    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `layouts-banco-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  get sugestoesBusca(): string[] {
    if (!this.q || this.q.length < 2) return [];

    const query = this.q.toLowerCase();
    const sugestoes = new Set<string>();

    this.layouts.forEach(layout => {
      if (layout.bancoNome.toLowerCase().includes(query)) sugestoes.add(layout.bancoNome);
      if (layout.bancoNumero.toLowerCase().includes(query)) sugestoes.add(`${layout.bancoNumero} - ${layout.bancoNome}`);
      if (layout.tipoLayout.toLowerCase().includes(query)) sugestoes.add(layout.tipoLayout);
    });

    return Array.from(sugestoes).slice(0, 5);
  }
}
