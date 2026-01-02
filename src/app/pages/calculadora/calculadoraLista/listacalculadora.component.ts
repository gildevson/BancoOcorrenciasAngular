import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-lista-calculadora',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './listacalculadora.component.html',
  styleUrls: ['./listacalculadora.component.css']
})
export class ListaCalculadoraComponent {}
