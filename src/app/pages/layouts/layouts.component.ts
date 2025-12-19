import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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
  // Dados dos layouts
  layouts: BancoLayout[] = LAYOUTS_BANCO;

  // Filtros
  q = '';
  tipo: TipoLayout | 'Todos' = 'Todos';

  /**
   * Retorna os layouts filtrados baseado nos critérios de busca
   */
  get filtrados(): BancoLayout[] {
    const query = this.q.trim().toLowerCase();

    return this.layouts
      .filter(layout => {
        // Filtro por tipo
        if (this.tipo !== 'Todos' && layout.tipoLayout !== this.tipo) {
          return false;
        }

        // Filtro por texto
        if (!query) {
          return true;
        }

        return (
          layout.bancoNome.toLowerCase().includes(query) ||
          layout.bancoNumero.toLowerCase().includes(query) ||
          layout.tipoLayout.toLowerCase().includes(query) ||
          (layout.versao ?? '').toLowerCase().includes(query) ||
          (layout.descricao ?? '').toLowerCase().includes(query)
        );
      });
  }

  /**
   * Limpa todos os filtros aplicados
   */
  limpar(): void {
    this.q = '';
    this.tipo = 'Todos';
  }

  /**
   * Exibe os detalhes de um layout específico
   * @param layout Layout a ser visualizado
   */
  verDetalhes(layout: BancoLayout): void {
    console.log('📋 Detalhes do Layout:', layout);

    // Opção 1: Abrir modal com detalhes
    // this.modalService.open(LayoutDetalhesComponent, { data: layout });

    // Opção 2: Navegar para página de detalhes
    // this.router.navigate(['/layouts', layout.bancoNumero, layout.tipoLayout]);

    // Opção 3: Mostrar alert (temporário para testes)
    alert(`
      📋 ${layout.bancoNome}
      🏦 Código: ${layout.bancoNumero}
      📄 Tipo: ${layout.tipoLayout}
      ${layout.versao ? `📌 Versão: ${layout.versao}` : ''}
      ${layout.status ? `📊 Status: ${layout.status}` : ''}
      ${layout.descricao ? `\n${layout.descricao}` : ''}
    `.trim());
  }

  /**
   * Retorna a quantidade de layouts filtrados
   */
  get totalFiltrados(): number {
    return this.filtrados.length;
  }

  /**
   * Retorna a quantidade total de layouts
   */
  get totalLayouts(): number {
    return this.layouts.length;
  }

  /**
   * Verifica se há filtros ativos
   */
  get temFiltrosAtivos(): boolean {
    return this.q.trim() !== '' || this.tipo !== 'Todos';
  }

  /**
   * Exporta os layouts filtrados para JSON
   */
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

  /**
   * Exporta os layouts filtrados para CSV
   */
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

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `layouts-banco-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Retorna sugestões de busca baseado no input do usuário
   */
  get sugestoesBusca(): string[] {
    if (!this.q || this.q.length < 2) {
      return [];
    }

    const query = this.q.toLowerCase();
    const sugestoes = new Set<string>();

    this.layouts.forEach(layout => {
      if (layout.bancoNome.toLowerCase().includes(query)) {
        sugestoes.add(layout.bancoNome);
      }
      if (layout.bancoNumero.toLowerCase().includes(query)) {
        sugestoes.add(`${layout.bancoNumero} - ${layout.bancoNome}`);
      }
      if (layout.tipoLayout.toLowerCase().includes(query)) {
        sugestoes.add(layout.tipoLayout);
      }
    });

    return Array.from(sugestoes).slice(0, 5);
  }
}
