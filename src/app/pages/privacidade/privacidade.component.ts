import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacidade',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacidade.component.html',
  styleUrls: ['./privacidade.component.css']
})
export class PrivacidadeComponent {
  dataAtualizacao = '23 de junho de 2026';
}
