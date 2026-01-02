import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-calculadora-juros',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './calculadoraJuros.component.html',
  styleUrls: ['./calculadoraJuros.component.css']
})
export class CalculadoraJurosComponent {
  valorFace = 0;
  percentual = 0;
  diasAtraso = 0;

  resultado: {
    juros: number;
    total: number;
  } | null = null;

  calcular(): void {
    const juros = (this.percentual / 30) * this.diasAtraso * this.valorFace / 100;
    const total = this.valorFace + juros;
    this.resultado = { juros, total };
  }

  limpar(): void {
    this.valorFace = 0;
    this.percentual = 0;
    this.diasAtraso = 0;
    this.resultado = null;
  }

  formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
