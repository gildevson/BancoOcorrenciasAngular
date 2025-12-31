import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OcorrenciasMotivosService, OcorrenciaMotivo } from '../../service/ocorrenciasmotivos.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edicoesocorrencias.editar.component.html'
})
export class EdicoesOcorrenciasEditarComponent implements OnInit {

  bancoId!: string;
  ocorrencia!: string;
  motivo!: string;

  model!: OcorrenciaMotivo;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private api: OcorrenciasMotivosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.bancoId = this.route.snapshot.paramMap.get('bancoId')!;
    this.ocorrencia = this.route.snapshot.paramMap.get('ocorrencia')!;
    this.motivo = this.route.snapshot.paramMap.get('motivo')!;

    this.api.getDetalhe(this.bancoId, this.ocorrencia, this.motivo)
      .subscribe(res => {
        this.model = res;
        this.loading = false;
      });
  }

  salvar(): void {
    this.api.atualizar(
      this.bancoId,
      this.ocorrencia,
      this.motivo,
      {
        descricao: this.model.descricao,
        observacao: this.model.observacao
      }
    ).subscribe(() => {
      alert('Atualizado com sucesso');
      this.router.navigate(['/edicoes-ocorrencias/pesquisar']);
    });
  }
}
