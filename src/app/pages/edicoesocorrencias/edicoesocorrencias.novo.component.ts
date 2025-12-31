import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OcorrenciasMotivosService, OcorrenciaMotivo } from '../../service/ocorrenciasmotivos.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="card">
    <h3>Novo Motivo</h3>

    <div class="grid">
      <div><label>BancoId</label><input [(ngModel)]="form.bancoId" /></div>
      <div><label>Ocorrência</label><input [(ngModel)]="form.ocorrencia" placeholder="02" /></div>
      <div><label>Motivo</label><input [(ngModel)]="form.motivo" placeholder="03" /></div>
      <div class="full"><label>Descrição</label><input [(ngModel)]="form.descricao" /></div>
      <div class="full"><label>Observação</label><input [(ngModel)]="form.observacao" /></div>
    </div>

    <p class="err" *ngIf="erro">{{ erro }}</p>
    <p class="ok" *ngIf="ok">{{ ok }}</p>

    <button (click)="salvar()" [disabled]="loading">Salvar</button>
  </div>
  `,
  styles: [`
    .card{ padding:16px; border-radius:16px; border:1px solid rgba(255,255,255,.12); }
    .grid{ display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap:12px; }
    .full{ grid-column: 1 / -1; }
    label{ display:block; font-size:12px; opacity:.8; margin-bottom:6px; }
    input{ width:100%; padding:10px 12px; border-radius:12px; border:1px solid rgba(255,255,255,.12); }
    button{ margin-top:12px; padding:10px 14px; border-radius:12px; }
    .err{ margin-top:10px; color:#ffb4b4; }
    .ok{ margin-top:10px; color:#b7ffcf; }
    @media (max-width: 900px){ .grid{ grid-template-columns: 1fr; } }
  `]
})
export class EdicoesOcorrenciasNovoComponent {
  private svc = inject(OcorrenciasMotivosService);

  loading = false;
  erro = '';
  ok = '';

  form: OcorrenciaMotivo = {
    bancoId: '',
    ocorrencia: '',
    motivo: '',
    descricao: '',
    observacao: ''
  };

  salvar() {
    this.erro = '';
    this.ok = '';

    if (!this.form.bancoId || !this.form.ocorrencia || !this.form.motivo || !this.form.descricao) {
      this.erro = 'Preencha bancoId, ocorrência, motivo e descrição.';
      return;
    }

    this.loading = true;
    this.svc.criar(this.form).subscribe({
      next: () => this.ok = 'Criado com sucesso!',
      error: () => this.erro = 'Falha ao criar.',
      complete: () => this.loading = false
    });
  }
}
