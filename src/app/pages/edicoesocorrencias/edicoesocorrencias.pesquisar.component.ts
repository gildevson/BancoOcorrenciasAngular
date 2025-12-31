import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OcorrenciasApi, ApiBanco, ApiOcorrenciaMotivo } from '../../service/ocorrencias.api';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edicoesocorrencias.pesquisar.component.html',
  styleUrls: ['./edicoesocorrencias.pesquisar.component.css']
})
export class EdicoesOcorrenciasPesquisarComponent implements OnInit {
  bancos: ApiBanco[] = [];
  bancoId = '';
  ocorrencia = '';
  motivo = '';  // ✅ NOVO CAMPO
  erro = '';
  motivos: ApiOcorrenciaMotivo[] = [];
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
        console.error('❌ Erro ao carregar bancos:', err);
        this.erro = 'Não foi possível carregar a lista de bancos.';
        this.loadingBancos = false;
      }
    });
  }

  buscar(): void {
    this.erro = '';
    this.motivos = [];

    if (!this.bancoId) {
      this.erro = 'Selecione um banco.';
      return;
    }

    if (!this.ocorrencia?.trim()) {
      this.erro = 'Informe a ocorrência.';
      return;
    }

    this.loading = true;

    // ✅ Se motivo for informado, busca apenas esse motivo específico
    if (this.motivo?.trim()) {
      this.buscarMotivoEspecifico();
    } else {
      // ✅ Se não, lista todos os motivos da ocorrência
      this.buscarTodosMotivos();
    }
  }

  private buscarMotivoEspecifico(): void {
    this.api.getDetalhe(this.bancoId, this.ocorrencia.trim(), this.motivo.trim()).subscribe({
      next: (res) => {
        this.motivos = [res]; // Coloca em array para exibir na tabela
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Erro ao buscar motivo:', err);
        this.erro = 'Motivo não encontrado.';
        this.loading = false;
      }
    });
  }

  private buscarTodosMotivos(): void {
    this.api.getMotivos(this.bancoId, this.ocorrencia.trim()).subscribe({
      next: (res) => {
        this.motivos = res;
        this.loading = false;

        if (res.length === 0) {
          this.erro = 'Nenhum motivo encontrado para esta ocorrência.';
        }
      },
      error: (err) => {
        console.error('❌ Erro ao buscar motivos:', err);
        this.erro = 'Erro ao buscar motivos.';
        this.loading = false;
      }
    });
  }

  limpar(): void {
    this.bancoId = '';
    this.ocorrencia = '';
    this.motivo = '';
    this.motivos = [];
    this.erro = '';
  }

  editar(m: ApiOcorrenciaMotivo): void {
    this.router.navigate([
      '/edicoes-ocorrencias/editar',
      m.bancoId,
      m.ocorrencia,
      m.motivo
    ]);
  }

  novoCadastro(): void {
    this.router.navigate(['/edicoes-ocorrencias/novo']);
  }

  pad(n: string): string {
    return (n || '').padStart(4, '0');
  }
}
