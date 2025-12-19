import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NOTICIAS } from '../../data/noticias.data';
import { FinanceHighlightsComponent } from '../financehighlights/financehighlights.component';
import { BancosComponent } from "../bancos/bancos.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FinanceHighlightsComponent, BancosComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  noticias = NOTICIAS.slice(0, 3);
}
