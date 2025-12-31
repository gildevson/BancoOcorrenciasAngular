import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Resultado {
  desagio: number;
  mora: number;
  juro: number;
  multa: number;
  total: number;
}

@Component({
  selector: 'app-calculadora',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calculadora.component.html',
  styleUrls: ['./calculadora.component.css']
})
export class CalculadoraComponent {
  // Inputs
  valorFace = 0;
  fatorDesagio = 0;
  prazoDesagio = 0;
  percentualMora = 0;
  diasAtraso = 0;
  percentualJuro = 0;
  percentualMulta = 0;
  primeiraParcela = true;

  // Resultado
  resultado: Resultado | null = null;
  mostrarResultado = false;

  calcular(): void {
    // ✅ Deságio: fator/30 * prazo / 100 * valor de face
    const desagio = (this.fatorDesagio / 30) * this.prazoDesagio / 100 * this.valorFace;

    // ✅ Mora: (percentual/30 * dias de atraso corridos) * valor de face / 100
    const mora = (this.percentualMora / 30 * this.diasAtraso) * this.valorFace / 100;

    // ✅ Juro: percento / 30 * dias de atraso * valor de face / 100
    const juro = this.percentualJuro / 30 * this.diasAtraso * this.valorFace / 100;

    // ✅ Multa: é o percentual/valor cheio sob o face, mesmo que atrasou um dia
    // Multa cobra só uma vez (caso ocorra pagamento parcial, só acontece na 1ª parcela)
    const multa = this.primeiraParcela && this.diasAtraso > 0
      ? (this.percentualMulta / 100) * this.valorFace
      : 0;

    // ✅ Total
    const total = this.valorFace - desagio + mora + juro + multa;

    this.resultado = {
      desagio,
      mora,
      juro,
      multa,
      total
    };

    this.mostrarResultado = true;
  }

  limpar(): void {
    this.valorFace = 0;
    this.fatorDesagio = 0;
    this.prazoDesagio = 0;
    this.percentualMora = 0;
    this.diasAtraso = 0;
    this.percentualJuro = 0;
    this.percentualMulta = 0;
    this.primeiraParcela = true;
    this.resultado = null;
    this.mostrarResultado = false;
  }

  formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }
}
