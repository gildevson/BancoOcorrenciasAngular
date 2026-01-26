import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-calculadora-iof',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './calculadoraiof.component.html',
  styleUrl: './calculadoraiof.component.css'
})
export class CalculadoraIofComponent {
  iofForm: FormGroup;
  resultado: {
    iofFixo: number;
    iofDiario: number;
    iofTotal: number;
    valorBase: number;
    dias: number;
  } | null = null;

  // Constantes das alíquotas
  readonly ALIQUOTA_FIXA = 0.0038; // 0,38%
  readonly ALIQUOTA_DIARIA = 0.000041; // 0,0041%
  readonly LIMITE_DIAS = 365;

  constructor(private fb: FormBuilder) {
    this.iofForm = this.fb.group({
      valor: [null, [Validators.required, Validators.min(0.01)]],
      dias: [1, [Validators.required, Validators.min(1), Validators.max(this.LIMITE_DIAS)]]
    });
  }

  calcularIOF() {
    if (this.iofForm.invalid) return;

    const valor = Number(this.iofForm.value.valor);
    const dias = Number(this.iofForm.value.dias);

    // IOF Fixo (Adicional): 0,38%
    const iofFixo = valor * this.ALIQUOTA_FIXA;

    // IOF Diário (Variável): 0,0041% ao dia
    const iofDiario = valor * this.ALIQUOTA_DIARIA * dias;

    // IOF Total
    const iofTotal = iofFixo + iofDiario;

    this.resultado = {
      iofFixo: Number(iofFixo.toFixed(2)),
      iofDiario: Number(iofDiario.toFixed(2)),
      iofTotal: Number(iofTotal.toFixed(2)),
      valorBase: valor,
      dias: dias
    };
  }

  limparCalculo() {
    this.resultado = null;
    this.iofForm.reset({
      valor: null,
      dias: 1
    });
  }

  formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }
}
