import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-calculadora-desagio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './calculadoraDesagio.component.html',
  styleUrls: ['./calculadoraDesagio.component.css']
})
export class CalculadoraDesagioComponent {
  // Dados do formulário
  desagioValorFace = 0;
  desagioFator = 0;
  desagioPrazo = 0;

  // Resultado
  resultadoDesagio: {
    valorFace: number;
    fator: number;
    prazo: number;
    desagio: number;
    valorLiquido: number;
  } | null = null;

  calcularDesagio(): void {
    const desagio = (this.desagioFator / 30) * this.desagioPrazo / 100 * this.desagioValorFace;
    const valorLiquido = this.desagioValorFace - desagio;

    this.resultadoDesagio = {
      valorFace: this.desagioValorFace,
      fator: this.desagioFator,
      prazo: this.desagioPrazo,
      desagio,
      valorLiquido
    };
  }

  limparDesagio(): void {
    this.desagioValorFace = 0;
    this.desagioFator = 0;
    this.desagioPrazo = 0;
    this.resultadoDesagio = null;
  }

  formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }
}
