import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-finance-highlights',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './financehighlights.component.html',
  styleUrls: ['./financehighlights.component.css'],
})
export class FinanceHighlightsComponent {
  tips = [
    { icon: 'savings', title: 'Reserva de emergência', text: 'Tenha 3–6 meses de despesas em algo seguro e com liquidez.' },
    { icon: 'receipt_long', title: 'Controle de gastos', text: 'Defina um teto pro gasto variável e acompanhe por semana.' },
    { icon: 'trending_up', title: 'Aportes consistentes', text: 'A constância tende a bater o “timing perfeito” no longo prazo.' },
    { icon: 'shield', title: 'Evite juros altos', text: 'Priorize quitar dívidas caras (rotativo/cheque especial) primeiro.' },
  ];
}
