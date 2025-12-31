// edicoesocorrencias.novo.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  OcorrenciasApi,
  ApiOcorrenciaMotivo,
  ApiBanco,
  CreateOcorrenciaMotivoRequest
} from '../../service/ocorrencias.api';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
    templateUrl: './edicoesocorrencias.novo.component.html',
  styleUrls: ['./edicoesocorrencias.novo.component.css']
})
export class EdicoesOcorrenciasNovoComponent implements OnInit {
  bancos: ApiBanco[] = [];

  form = {
    bancoId: '',
    ocorrencia: '',
    motivo: '',
    descricao: '',
    observacao: ''
  };

  erro = '';
  loading = false;
  loadingBancos = false;

  constructor(
    private api: OcorrenciasApi,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarBancos();
  }

  private carregarBancos(): void {
    this.loadingBancos = true;
    this.erro = '';

    this.api.getBancos().subscribe({
      next: (res) => {
        this.bancos = res;
        this.loadingBancos = false;
      },
      error: (err) => {
        console.error('Erro ao carregar bancos:', err);
        this.erro = 'Não foi possível carregar a lista de bancos.';
        this.loadingBancos = false;
      }
    });
  }

  salvar(): void {
    this.erro = '';

    // Validações
    if (!this.form.bancoId) {
      this.erro = 'Selecione um banco.';
      return;
    }

    if (!this.form.ocorrencia?.trim()) {
      this.erro = 'Informe a ocorrência.';
      return;
    }

    if (!this.form.motivo?.trim()) {
      this.erro = 'Informe o motivo.';
      return;
    }

    if (!this.form.descricao?.trim()) {
      this.erro = 'Informe a descrição.';
      return;
    }

    this.loading = true;

    // ✅ Body completo conforme a API espera
    const body: CreateOcorrenciaMotivoRequest = {
      bancoId: this.form.bancoId,
      ocorrencia: this.form.ocorrencia.trim(),
      motivo: this.form.motivo.trim(),
      descricao: this.form.descricao.trim(),
      observacao: this.form.observacao?.trim() || null
    };

    this.api.criarMotivo(body).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/edicoes-ocorrencias/pesquisar']);
      },
      error: (err) => {
        console.error('Erro ao criar motivo:', err);
        this.loading = false;

        if (err.status === 409) {
          this.erro = 'Já existe esse motivo para esse banco/ocorrência.';
        } else if (err.error?.message) {
          this.erro = err.error.message;
        } else {
          this.erro = 'Erro ao criar motivo. Tente novamente.';
        }
      }
    });
  }

  voltar(): void {
    this.router.navigate(['/edicoes-ocorrencias/pesquisar']);
  }

  pad4(n: string): string {
    return (n || '').padStart(4, '0');
  }
}
