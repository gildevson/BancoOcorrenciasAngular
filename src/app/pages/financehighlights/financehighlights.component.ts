import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

type Tip = {
  icon: string;
  title: string;
  text: string;
  link?: string;      // rota
  disabled?: boolean; // opcional
};

@Component({
  selector: 'app-finance-highlights',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './financehighlights.component.html',
  styleUrls: ['./financehighlights.component.css'],
})
export class FinanceHighlightsComponent {
  tips: Tip[] = [
    {
      icon: 'savings',
      title: 'Cálculo de Deságio',
      text: 'Calcule o desconto para pagamento antecipado.',
      link: '/calculadora/desagio',
    },
    {
      icon: 'schedule',
      title: 'Cálculo de Mora',
      text: 'Encargos por atraso no pagamento.',
      link: '/calculadora/mora',
    },
    {
      icon: 'trending_up',
      title: 'Cálculo de Juros',
      text: 'Juros de mora sobre o valor.',
      link: '/calculadora/juros',
    },
    {
      icon: 'gavel',
      title: 'Cálculo de Multa',
      text: 'Multa por inadimplência.',
      link: '/calculadora/multa',
      // se ainda não quer liberar:
      // disabled: true,
    },
  ];
}
