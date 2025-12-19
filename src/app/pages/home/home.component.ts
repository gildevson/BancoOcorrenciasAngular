import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NOTICIAS } from '../../data/noticias.data';
import { FinanceHighlightsComponent } from '../financehighlights/financehighlights.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FinanceHighlightsComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  noticias = NOTICIAS.slice(0, 3);
}
