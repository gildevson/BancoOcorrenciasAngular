// layouts.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BancoLayout, LAYOUTS_BANCO, TipoLayout } from '../../data/layouts.data';

@Component({
  selector: 'app-layouts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './layouts.component.html',
  styleUrls: ['./layouts.component.css'],
})
export class LayoutsComponent {
  private router = inject(Router);

  layouts: BancoLayout[] = LAYOUTS_BANCO;

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

  verDetalhes(layout: BancoLayout): void {
    this.router.navigate(['/layouts', layout.id]);
  }

  baixarPdf(layout: BancoLayout): void {
    if (!layout.pdfUrl) return;

    const a = document.createElement('a');
    a.href = layout.pdfUrl;
    a.download = `${layout.bancoNumero}-${layout.tipoLayout}${layout.versao ? '-v' + layout.versao : ''}.pdf`;
    a.target = '_blank';
    a.rel = 'noopener';
    a.click();
  }

  // ✅ Classe pro badge do tipo (CNAB240/CNAB400/Febraban/Outro)
tipoClass(tipo: string) {
  const t = (tipo || '').toLowerCase();
  if (t.includes('240')) return 'tipo-pill t-240';
  if (t.includes('400')) return 'tipo-pill t-400';
  if (t.includes('febraban')) return 'tipo-pill t-febraban';
  return 'tipo-pill t-outro';
}

  // ✅ Fallback quando a logo quebra
  onLogoError(ev: Event) {
    const img = ev.target as HTMLImageElement;
    img.style.display = 'none'; // some com o <img>
    img.parentElement?.classList.add('no-logo'); // ativa fallback (número)
  }

  get temFiltrosAtivos(): boolean {
    return this.q.trim() !== '' || this.tipo !== 'Todos';
  }
}
