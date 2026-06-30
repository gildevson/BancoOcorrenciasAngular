import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface ResultadoAmortizacao {
  numero: number;
  valor: number;
  prazo: number;
  fatorAntecipado: number;
  desagioAntecipado: number;
  difAdtoProp: number;
  saldoDevedor: number;
}

interface Resultado {
  valorAntecipacao: number;
  fator: number;
  prazo: number;
  taxaEfetiva: number;
  mora: number;
  desagio: number;
  valorBruto: number;
  conferencia: number;
  amortizacoes: ResultadoAmortizacao[];
}

@Component({
  selector: 'app-calculadora-antecipacao',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './calculadoraAntecipacao.component.html',
  styleUrls: ['./calculadoraAntecipacao.component.css']
})
export class CalculadoraAntecipacaoComponent {
  valorAntecipacao = 0;
  fator = 0;
  dataAntecipacao = '';
  dataVencimento = '';
  mora = 0;

  amortizacoes: Array<{ valor: number; data: string }> = [];

  resultado: Resultado | null = null;
  erro = '';

  get prazoCalculado(): number {
    if (!this.dataAntecipacao || !this.dataVencimento) return 0;
    const d1 = new Date(this.dataAntecipacao);
    const d2 = new Date(this.dataVencimento);
    const dias = Math.round((d2.getTime() - d1.getTime()) / 86400000);
    return dias > 0 ? dias : 0;
  }

  calcular(): void {
    this.erro = '';
    const prazo = this.prazoCalculado;

    if (!this.dataAntecipacao || !this.dataVencimento) {
      this.erro = 'Informe as datas de antecipação e vencimento.';
      return;
    }
    if (prazo <= 0) {
      this.erro = 'A data de vencimento deve ser posterior à data de antecipação.';
      return;
    }
    if (this.valorAntecipacao <= 0) {
      this.erro = 'Informe o valor de antecipação.';
      return;
    }
    if (this.fator <= 0) {
      this.erro = 'Informe o fator (taxa mensal).';
      return;
    }

    // Transformamos a taxa nominal em taxa efetiva no prazo (método composto)
    const taxaMensal = this.fator / 100;
    const taxaEfetiva = Math.pow(1 + taxaMensal, prazo / 30) - 1;
    const desagio = this.valorAntecipacao * taxaEfetiva;
    const valorBruto = this.valorAntecipacao + desagio + this.mora;

    // Conferência: taxa nominal direta sobre o valor calculado (método linear)
    const conferencia = valorBruto * (this.fator / 30) * prazo / 100;

    // Cálculo das amortizações
    const amortizacoesResult: ResultadoAmortizacao[] = [];
    let saldoDevedor = this.valorAntecipacao;

    for (let i = 0; i < this.amortizacoes.length; i++) {
      const amort = this.amortizacoes[i];
      if (!amort.valor || !amort.data) continue;

      const dAntecip = new Date(this.dataAntecipacao);
      const dAmort = new Date(amort.data);
      const prazoAmort = Math.round((dAmort.getTime() - dAntecip.getTime()) / 86400000);

      if (prazoAmort <= 0 || prazoAmort >= prazo) continue;

      // FATOR Antecipado: taxa efetiva do adiantamento até a data de amortização
      const fatorAntecipado = Math.pow(1 + taxaMensal, prazoAmort / 30) - 1;

      // Deságio antecipado: deságio acumulado sobre o valor amortizado até essa data
      const desagioAntecipado = amort.valor * fatorAntecipado;

      // Dif. Adto prop.: diferença entre o deságio total proporcional e o antecipado
      // (deságio que não será mais cobrado no período restante)
      const difAdtoProp = amort.valor * (taxaEfetiva - fatorAntecipado);

      saldoDevedor -= amort.valor;

      amortizacoesResult.push({
        numero: i + 1,
        valor: amort.valor,
        prazo: prazoAmort,
        fatorAntecipado: fatorAntecipado * 100,
        desagioAntecipado,
        difAdtoProp,
        saldoDevedor
      });
    }

    this.resultado = {
      valorAntecipacao: this.valorAntecipacao,
      fator: this.fator,
      prazo,
      taxaEfetiva: taxaEfetiva * 100,
      mora: this.mora,
      desagio,
      valorBruto,
      conferencia,
      amortizacoes: amortizacoesResult
    };
  }

  adicionarAmortizacao(): void {
    if (this.amortizacoes.length < 5) {
      this.amortizacoes.push({ valor: 0, data: '' });
    }
  }

  removerAmortizacao(index: number): void {
    this.amortizacoes.splice(index, 1);
    if (this.resultado) this.calcular();
  }

  limpar(): void {
    this.valorAntecipacao = 0;
    this.fator = 0;
    this.dataAntecipacao = '';
    this.dataVencimento = '';
    this.mora = 0;
    this.amortizacoes = [];
    this.resultado = null;
    this.erro = '';
  }

  formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatarPct(valor: number): string {
    return valor.toFixed(6) + '%';
  }
}
