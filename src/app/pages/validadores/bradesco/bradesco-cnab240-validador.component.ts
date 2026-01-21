import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bradesco-cnab240-validador',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Validador Bradesco CNAB 240</h2>
    <input type="file" accept=".rem,.txt" (change)="onFileChange($event)" />
    <div *ngIf="error" style="color:#b71c1c; margin-top:18px;">{{ error }}</div>
    <div *ngIf="visualHtml" [innerHTML]="visualHtml" style="margin-top:24px;"></div>
    <div *ngIf="!visualHtml && !error" style="margin-top:24px; color:#888;">Anexe um arquivo CNAB240 para simular a leitura e validação.</div>
  `
})
export class BradescoCnab240ValidadorComponent {
  visualHtml: string | null = null;
  error: string | null = null;

  // Exemplo de campos do detalhe CNAB240 (ajuste conforme layout real)
  campos = [
    { nome: 'Tipo', ini: 0, fim: 1, cor: '#f8bbd0' },
    { nome: 'Agência', ini: 17, fim: 21, cor: '#ffe082' },
    { nome: 'Conta', ini: 23, fim: 32, cor: '#b2dfdb' },
    { nome: 'Nosso Número', ini: 37, fim: 56, cor: '#c5cae9' },
    { nome: 'Vencimento', ini: 73, fim: 81, cor: '#fff9c4' },
    { nome: 'Valor', ini: 81, fim: 96, cor: '#ffcdd2' },
    { nome: 'Nome do Sacado', ini: 143, fim: 183, cor: '#ffecb3' },
    { nome: 'CPF/CNPJ', ini: 133, fim: 147, cor: '#b3e5fc' },
    { nome: 'Seu Número', ini: 105, fim: 120, cor: '#dcedc8' },
    // ...adicione mais campos conforme o layout desejado
  ];

  onFileChange(event: Event) {
    this.error = null;
    this.visualHtml = null;
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const content = reader.result as string;
        this.visualHtml = this.highlightCnab240(content);
      } catch (e) {
        this.error = 'Erro ao processar o arquivo.';
      }
    };
    reader.onerror = () => {
      this.error = 'Erro ao ler o arquivo.';
    };
    reader.readAsText(file);
  }

  highlightCnab240(content: string): string {
    const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length === 0) return '';
    // Cabeçalho das colunas
    let header = '<div style="display:flex;gap:2px;margin-bottom:2px;">';
    for (const campo of this.campos) {
      const colSpan = campo.fim - campo.ini;
      header += `<span style="display:inline-block;width:${colSpan*18}px;text-align:center;font-size:12px;font-weight:bold;color:#333;background:${campo.cor};border-radius:3px;">${campo.nome}</span>`;
    }
    header += '</div>';
    // Linhas do arquivo
    let html = lines.map(line => this.lineToMatrix(line)).join('');
    return header + html;
  }

  lineToMatrix(line: string): string {
    let html = '<div style="display:flex;gap:2px;margin-bottom:4px;">';
    for (const campo of this.campos) {
      const val = line.slice(campo.ini, campo.fim);
      html += `<span style="display:inline-block;width:${(campo.fim-campo.ini)*18}px;height:18px;line-height:18px;text-align:center;background:${campo.cor};border:1px solid #fff;font-size:13px;" title="${campo.nome} [${campo.ini+1}-${campo.fim}]">${val.replace(/ /g,'&nbsp;')}</span>`;
    }
    html += '</div>';
    return html;
  }
}
