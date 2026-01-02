import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-calculadora-mora',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './calculadoraMora.component.html',
  styleUrls: ['./calculadoraMora.component.css']
})
export class CalculadoraMoraComponent {
  valorFace = 0;
  percentual = 0; // % ao mês (ou conforme sua regra)
  diasAtraso = 0;

  resultado: {
    valorFace: number;
    percentual: number;
    diasAtraso: number;
    mora: number;
    valorTotal: number;
  } | null = null;

  calcular(): void {
    const mora = (this.percentual / 30) * this.diasAtraso * this.valorFace / 100;
    const valorTotal = this.valorFace + mora;

    this.resultado = {
      valorFace: this.valorFace,
      percentual: this.percentual,
      diasAtraso: this.diasAtraso,
      mora,
      valorTotal
    };
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
