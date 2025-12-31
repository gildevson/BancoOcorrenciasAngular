// edicoesocorrencias.editar.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  OcorrenciasApi,
  ApiOcorrenciaMotivo,
  UpdateOcorrenciaMotivoRequest
} from '../../service/ocorrencias.api';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edicoesocorrencias.editar.component.html',
  styleUrls: ['./edicoesocorrencias.editar.component.css']
})
export class EdicoesOcorrenciasEditarComponent implements OnInit {
  bancoId = '';
  ocorrencia = '';
  motivo = '';

  model: Partial<ApiOcorrenciaMotivo> = {
    descricao: '',
    observacao: ''
  };

  erro = '';
  loading = false;
  salvando = false;
  sucessoMsg = ''; // ✅ NOVO

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: OcorrenciasApi
  ) {}

  ngOnInit(): void {
    this.bancoId = this.route.snapshot.paramMap.get('bancoId') || '';
    this.ocorrencia = this.route.snapshot.paramMap.get('ocorrencia') || '';
    this.motivo = this.route.snapshot.paramMap.get('motivo') || '';

    if (!this.bancoId || !this.ocorrencia || !this.motivo) {
      this.erro = 'Parâmetros inválidos.';
      return;
    }

    this.carregarDetalhe();
  }

  private carregarDetalhe(): void {
    this.loading = true;
    this.erro = '';

    this.api.getDetalhe(this.bancoId, this.ocorrencia, this.motivo).subscribe({
      next: (res) => {
        this.model = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar detalhe:', err);
        this.erro = 'Não foi possível carregar o detalhe.';
        this.loading = false;
      }
    });
  }

  salvar(): void {
    this.erro = '';
    this.sucessoMsg = ''; // ✅ Limpa mensagem anterior

    if (!this.model.descricao?.trim()) {
      this.erro = 'A descrição é obrigatória.';
      return;
    }

    this.salvando = true;

    const body: UpdateOcorrenciaMotivoRequest = {
      descricao: this.model.descricao.trim(),
      observacao: this.model.observacao?.trim() || null
    };

    this.api.atualizarMotivo(this.bancoId, this.ocorrencia, this.motivo, body).subscribe({
      next: () => {
        this.salvando = false;
        this.sucessoMsg = 'Motivo atualizado com sucesso!'; // ✅ Mostra sucesso

        // ✅ Aguarda 2 segundos e redireciona
        setTimeout(() => {
          this.router.navigate(['/edicoes-ocorrencias/pesquisar']);
        }, 2000);
      },
      error: (err) => {
        console.error('Erro ao atualizar motivo:', err);
        this.salvando = false;

        if (err.error?.message) {
          this.erro = err.error.message;
        } else {
          this.erro = 'Erro ao atualizar motivo. Tente novamente.';
        }
      }
    });
  }

  voltar(): void {
    this.router.navigate(['/edicoes-ocorrencias/pesquisar']);
  }
}
