import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-calculadora-iof-variado',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './calculadoraiofvariado.component.html',
  styleUrl: './calculadoraiofvariado.component.css'
})
export class CalculadoraIofVariadoComponent {
  iofForm: FormGroup;
  resultado: {
    iofFixo: number;
    iofDiario: number;
    iofTotal: number;
    valorBase: number;
    dias: number;
    aliquotaFixa: number;
    aliquotaDiaria: number;
  } | null = null;

  // Valores padrão das alíquotas (editáveis pelo usuário)
  readonly ALIQUOTA_FIXA_PADRAO = 0.38; // 0,38%
  readonly ALIQUOTA_DIARIA_PADRAO = 0.0041; // 0,0041%
  readonly LIMITE_DIAS = 365;

  constructor(private fb: FormBuilder) {
    this.iofForm = this.fb.group({
      valor: [null, [Validators.required, Validators.min(0.01)]],
      dias: [1, [Validators.required, Validators.min(1), Validators.max(this.LIMITE_DIAS)]],
      aliquotaFixa: [this.ALIQUOTA_FIXA_PADRAO, [Validators.required, Validators.min(0), Validators.max(100)]],
      aliquotaDiaria: [this.ALIQUOTA_DIARIA_PADRAO, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  calcularIOF() {
    if (this.iofForm.invalid) return;

    const valor = Number(this.iofForm.value.valor);
    const dias = Number(this.iofForm.value.dias);
    const aliquotaFixa = Number(this.iofForm.value.aliquotaFixa);
    const aliquotaDiaria = Number(this.iofForm.value.aliquotaDiaria);

    // IOF Fixo (Adicional): alíquota fixa customizada
    const iofFixo = valor * (aliquotaFixa / 100);

    // IOF Diário (Variável): alíquota diária customizada
    const iofDiario = valor * (aliquotaDiaria / 100) * dias;

    // IOF Total
    const iofTotal = iofFixo + iofDiario;

    this.resultado = {
      iofFixo: Number(iofFixo.toFixed(2)),
      iofDiario: Number(iofDiario.toFixed(2)),
      iofTotal: Number(iofTotal.toFixed(2)),
      valorBase: valor,
      dias: dias,
      aliquotaFixa: aliquotaFixa,
      aliquotaDiaria: aliquotaDiaria
    };
  }

  limparCalculo() {
    this.resultado = null;
    this.iofForm.reset({
      valor: null,
      dias: 1,
      aliquotaFixa: this.ALIQUOTA_FIXA_PADRAO,
      aliquotaDiaria: this.ALIQUOTA_DIARIA_PADRAO
    });
  }

  restaurarPadrao() {
    this.iofForm.patchValue({
      aliquotaFixa: this.ALIQUOTA_FIXA_PADRAO,
      aliquotaDiaria: this.ALIQUOTA_DIARIA_PADRAO
    });
  }

  formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  formatarPercentual(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }) + '%';
  }
}
