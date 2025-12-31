import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OcorrenciasApi, ApiOcorrenciaMotivo } from '../../service/ocorrencias.api';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edicoesocorrencias.pesquisar.component.html'
})
export class EdicoesOcorrenciasPesquisarComponent {

  bancoId = '';
  ocorrencia = '';
  erro = '';
  motivos: ApiOcorrenciaMotivo[] = [];
  loading = false;

  constructor(
    private api: OcorrenciasApi,
    private router: Router
  ) {}

  buscar(): void {
    this.erro = '';
    this.motivos = [];

    if (!this.bancoId || !this.ocorrencia) {
      this.erro = 'Informe bancoId e ocorrência.';
      return;
    }

    this.loading = true;

    this.api.getMotivos(this.bancoId, this.ocorrencia).subscribe({
      next: (res) => {
        this.motivos = res;
        this.loading = false;
      },
      error: () => {
        this.erro = 'Nenhum motivo encontrado.';
        this.loading = false;
      }
    });
  }

  editar(m: ApiOcorrenciaMotivo): void {
    this.router.navigate([
      '/edicoes-ocorrencias/editar',
      m.bancoId,
      m.ocorrencia,
      m.motivo
    ]);
  }
}
