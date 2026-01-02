import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-calculadora-multa',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './calculadoraMulta.component.html',
  styleUrls: ['./calculadoraMulta.component.css']
})
export class CalculadoraMultaComponent {
  valorFace = 0;
  percentual = 0;

  resultado: { multa: number; total: number } | null = null;

  calcular(): void {
    const multa = this.valorFace * (this.percentual / 100);
    const total = this.valorFace + multa;
    this.resultado = { multa, total };
  }

  limpar(): void {
    this.valorFace = 0;
    this.percentual = 0;
    this.resultado = null;
  }

  formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
