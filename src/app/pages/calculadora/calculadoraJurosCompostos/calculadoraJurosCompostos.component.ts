import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface LinhaEvolucao {
  mes: number;
  aporte: number;
  juros: number;
  saldo: number;
  totalInvestido: number;
}

interface Resultado {
  montante: number;
  totalInvestido: number;
  totalJuros: number;
  taxaMensal: number;
  periodoMeses: number;
  evolucao: LinhaEvolucao[];
}

@Component({
  selector: 'app-calculadora-juros-compostos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './calculadoraJurosCompostos.component.html',
  styleUrls: ['./calculadoraJurosCompostos.component.css']
})
export class CalculadoraJurosCompostosComponent {
  valorInicial = 0;
  aporteMensal = 0;
  taxa = 8;
  periodoTaxa: 'mensal' | 'anual' = 'anual';
  periodo = 1;
  periodoPeriodo: 'meses' | 'anos' = 'anos';

  mostrarTabela = false;
  resultado: Resultado | null = null;

  calcular(): void {
    const taxaMensal = this.periodoTaxa === 'anual'
      ? Math.pow(1 + this.taxa / 100, 1 / 12) - 1
      : this.taxa / 100;

    const meses = this.periodoPeriodo === 'anos'
      ? this.periodo * 12
      : this.periodo;

    const evolucao: LinhaEvolucao[] = [];
    let saldo = this.valorInicial;
    let totalInvestidoAcumulado = this.valorInicial;

    for (let m = 1; m <= meses; m++) {
      const juros = saldo * taxaMensal;
      saldo = saldo + juros + this.aporteMensal;
      totalInvestidoAcumulado += this.aporteMensal;
      evolucao.push({
        mes: m,
        aporte: m === 1 ? this.valorInicial + this.aporteMensal : this.aporteMensal,
        juros,
        saldo,
        totalInvestido: totalInvestidoAcumulado
      });
    }

    const totalInvestido = this.valorInicial + this.aporteMensal * meses;
    const montante = saldo;
    const totalJuros = montante - totalInvestido;

    this.resultado = { montante, totalInvestido, totalJuros, taxaMensal, periodoMeses: meses, evolucao };
    this.mostrarTabela = false;
  }

  limpar(): void {
    this.valorInicial = 0;
    this.aporteMensal = 0;
    this.taxa = 8;
    this.periodoTaxa = 'anual';
    this.periodo = 1;
    this.periodoPeriodo = 'anos';
    this.resultado = null;
    this.mostrarTabela = false;
  }

  formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatarPct(valor: number): string {
    return (valor * 100).toFixed(4) + '%';
  }
}
