import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Parcela {
  id: number;
  numDocumento: string;
  dataVencimento: string;   // YYYY-MM-DD
  valorTitulo: number;
  valorPresente: number;
}

@Component({
  selector: 'app-singulare-gerador-ccb444',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './singulare-gerador-ccb444.component.html',
  styleUrls: ['./singulare-gerador-ccb444.component.css']
})
export class SingulareGeradorCcb444Component {

  // ============================================================
  // DADOS DO ARQUIVO (HEADER)
  // ============================================================
  arquivo = {
    codOriginador: '00000000000000002026',
    nomeOriginador: 'FIDC BLUE SKY',
    dataGravacao: new Date().toISOString().slice(0, 10),
    numSeqArquivo: '0006077',
  };

  // ============================================================
  // CEDENTE
  // ============================================================
  cedente = {
    nome: 'MOVA SOCIEDADE DE EMPRESTIMO ENTRE PESSOAS S/A',
    cnpj: '33959738000130',
  };

  // ============================================================
  // TOMADOR
  // ============================================================
  tomador = {
    tipoInsc: '02',
    cpfCnpj: '63837917000165',
    nome: 'Nome do Tomador',
    endereco: 'Rua Felix de Lucca, 279, sala, Milanese',
    cep: '88804570',
    inscEst: '20000000000049',
  };

  // ============================================================
  // CONFIGURAÇÕES DA OPERAÇÃO
  // ============================================================
  operacao = {
    ocorrencia: '01',
    coobrigacao: '02',
    caractEspecial: '00',
    modalidade: '0000',
    natureza: '00',
    origem: '0000',
    classeRisco: 'A',
    dataEmissao: new Date().toISOString().slice(0, 10),
    prefixoControle: 'C749668I695444S',
    numTermoCessao: '668I695444S72397100',
  };

  // ============================================================
  // GERADOR DE SÉRIE MENSAL
  // ============================================================
  serie = {
    baseDocumento: '723971',
    inicioSeq: 13,
    dataVencimento: '',
    valor: 903.60,
    qtdParcelas: 12,
  };

  // ============================================================
  // PARCELAS
  // ============================================================
  parcelas: Parcela[] = [];
  nextId = 1;

  // ============================================================
  // OUTPUT / PREVIEW
  // ============================================================
  conteudoGerado = '';
  mostrarPreview = false;
  errosGeracao: string[] = [];

  get totalParcelas(): number { return this.parcelas.length; }
  get valorTotal(): number { return this.parcelas.reduce((s, p) => s + (p.valorPresente || 0), 0); }

  // ============================================================
  // OCORRÊNCIAS (para dropdown)
  // ============================================================
  ocorrencias = [
    { codigo: '01', descricao: 'Remessa — entrada de CCB' },
    { codigo: '04', descricao: 'Abatimento' },
    { codigo: '06', descricao: 'Alteração de Vencimento' },
    { codigo: '80', descricao: 'Remessa Singulare (liq. consultoria)' },
  ];

  // ============================================================
  // PARCELAS — CRUD
  // ============================================================
  adicionarParcela(): void {
    const seqAtual = this.parcelas.length + 1;
    this.parcelas.push({
      id: this.nextId++,
      numDocumento: `${this.serie.baseDocumento}/${String(seqAtual).padStart(3, '0')}`.substring(0, 10),
      dataVencimento: '',
      valorTitulo: this.serie.valor,
      valorPresente: this.serie.valor,
    });
  }

  removerParcela(id: number): void {
    this.parcelas = this.parcelas.filter(p => p.id !== id);
  }

  sincronizarValores(p: Parcela): void {
    p.valorPresente = p.valorTitulo;
  }

  // ============================================================
  // GERADOR DE SÉRIE MENSAL
  // ============================================================
  gerarBaseAleatoria(): void {
    const base = Math.floor(100000 + Math.random() * 900000).toString();
    this.serie.baseDocumento = base;
  }

  gerarSerie(): void {
    if (!this.serie.dataVencimento) { alert('Informe a data do 1º vencimento.'); return; }
    if (this.serie.qtdParcelas < 1 || this.serie.qtdParcelas > 360) { alert('Qtd. de parcelas inválida (1–360).'); return; }
    if (!this.serie.baseDocumento.trim()) { alert('Informe o número base do documento.'); return; }

    this.parcelas = [];
    this.nextId = 1;

    const [y, m, d] = this.serie.dataVencimento.split('-').map(Number);

    for (let i = 0; i < this.serie.qtdParcelas; i++) {
      const seq = this.serie.inicioSeq + i;
      const numDoc = `${this.serie.baseDocumento}/${String(seq).padStart(3, '0')}`.substring(0, 10);

      const venc = new Date(y, m - 1 + i, d);
      const vencISO = `${venc.getFullYear()}-${String(venc.getMonth() + 1).padStart(2, '0')}-${String(venc.getDate()).padStart(2, '0')}`;

      this.parcelas.push({
        id: this.nextId++,
        numDocumento: numDoc,
        dataVencimento: vencISO,
        valorTitulo: this.serie.valor,
        valorPresente: this.serie.valor,
      });
    }
  }

  // ============================================================
  // HELPERS CNAB
  // ============================================================
  private padA(val: string, len: number): string {
    return (val || '').padEnd(len, ' ').substring(0, len);
  }

  private padN(val: string | number, len: number): string {
    return String(val || '').replace(/\D/g, '').padStart(len, '0').substring(0, len);
  }

  private ddmmaa(iso: string): string {
    if (!iso || iso.length < 10) return '000000';
    const [y, m, d] = iso.split('-');
    return `${d}${m}${y.slice(-2)}`;
  }

  private centavos(val: number, len: number): string {
    return Math.round((val || 0) * 100).toString().padStart(len, '0').substring(0, len);
  }

  // ============================================================
  // GERAÇÃO DAS LINHAS CNAB 444
  // ============================================================
  private gerarHeader(seq: number): string {
    let l = '';
    l += '0';
    l += '1';
    l += 'REMESSA';
    l += '01';
    l += this.padA('COBRANCA', 15);
    l += this.padN(this.arquivo.codOriginador, 20);
    l += this.padA(this.arquivo.nomeOriginador, 29);
    l += 'S';
    l += '363';
    l += this.padA('SINGULARE', 15);
    l += this.ddmmaa(this.arquivo.dataGravacao);
    l += this.padA('', 8);
    l += 'MX';
    l += this.padN(this.arquivo.numSeqArquivo, 7);
    l += this.padA('', 321);
    l += this.padN(String(seq), 6);
    return l; // 444 chars
  }

  private gerarDetalhe(p: Parcela, seq: number): string {
    const o = this.operacao;
    const t = this.tomador;
    const c = this.cedente;

    const numDoc = this.padA(p.numDocumento, 10);
    const prefixo = this.padA(o.prefixoControle, 15);
    const numControle = this.padA(prefixo + numDoc, 25);
    const classeRiscoPad = this.padA(o.classeRisco.trim().length === 1 ? o.classeRisco.trim() + ' ' : o.classeRisco, 2);

    let l = '';
    l += '1';                                         // pos 0    — Tipo Registro
    l += this.padA('', 3);                            // pos 1-3  — Déb. Auto Banco
    l += this.padA('', 5);                            // pos 4-8  — Déb. Auto Agência
    l += this.padA('', 10);                           // pos 9-18 — Déb. Auto Conta
    l += ' ';                                         // pos 19   — Déb. Auto Dígito
    l += this.padN(o.coobrigacao, 2);                 // pos 20-21
    l += this.padN(o.caractEspecial, 2);              // pos 22-23
    l += this.padN(o.modalidade, 4);                  // pos 24-27
    l += this.padN(o.natureza, 2);                    // pos 28-29
    l += this.padN(o.origem, 4);                      // pos 30-33
    l += classeRiscoPad;                              // pos 34-35
    l += '0';                                         // pos 36   — Zeros
    l += numControle;                                 // pos 37-61 — Nº Controle (25)
    l += this.padN('', 3);                            // pos 62-64 — Nº Banco cobrador
    l += this.padN('', 5);                            // pos 65-69 — Zeros
    l += this.padN('', 11);                           // pos 70-80 — Ident. Título
    l += ' ';                                         // pos 81   — Dígito N/N
    l += this.padN('', 10);                           // pos 82-91 — Valor Pago
    l += ' ';                                         // pos 92   — Cond. Papeleta
    l += ' ';                                         // pos 93   — Ident. Papeleta
    l += this.padN('', 6);                            // pos 94-99 — Data Liquidação
    l += this.padA('', 4);                            // pos 100-103 — Ident. Operação
    l += ' ';                                         // pos 104  — Indic. Rateio
    l += ' ';                                         // pos 105  — Endereço Aviso
    l += this.padA('', 2);                            // pos 106-107 — Branco
    l += this.padN(o.ocorrencia, 2);                  // pos 108-109 — Cód. Ocorrência
    l += numDoc;                                      // pos 110-119 — Nº Documento (10)
    l += this.ddmmaa(p.dataVencimento);               // pos 120-125 — Vencimento
    l += this.centavos(p.valorTitulo, 13);            // pos 126-138 — Valor Título
    l += this.padN('', 3);                            // pos 139-141 — Banco Cobrança
    l += this.padN('', 5);                            // pos 142-146 — Ag. Depositária
    l += '70';                                        // pos 147-148 — Espécie (CCB)
    l += ' ';                                         // pos 149  — Aceite
    l += this.ddmmaa(o.dataEmissao);                  // pos 150-155 — Data Emissão
    l += this.padN('', 2);                            // pos 156-157 — 1ª Instrução
    l += '0';                                         // pos 158  — 2ª Instrução
    l += this.padA(t.inscEst, 14);                    // pos 159-172 — Insc. Est. Tomador
    l += this.padA(o.numTermoCessao, 19);             // pos 173-191 — Nº Termo Cessão
    l += this.centavos(p.valorPresente, 13);          // pos 192-204 — Valor Presente
    l += this.padN('', 13);                           // pos 205-217 — Valor Abatimento
    l += this.padN(t.tipoInsc, 2);                   // pos 218-219 — Tipo Insc. Tomador
    l += this.padN(t.cpfCnpj, 14);                   // pos 220-233 — CPF/CNPJ Tomador
    l += this.padA(t.nome, 40);                       // pos 234-273 — Nome do Tomador
    l += this.padA(t.endereco, 40);                   // pos 274-313 — Endereço Tomador
    l += this.padA('', 9);                            // pos 314-322 — Nº Doc. Referência
    l += this.padA('', 3);                            // pos 323-325 — Compl. Referência
    l += this.padN(t.cep, 8);                         // pos 326-333 — CEP
    l += this.padA(c.nome, 46);                       // pos 334-379 — Nome Cedente
    l += this.padN(c.cnpj, 14);                       // pos 380-393 — CNPJ Cedente
    l += this.padA('', 44);                           // pos 394-437 — Branco
    l += this.padN(String(seq), 6);                   // pos 438-443 — Seq. Registro

    return l; // 444 chars
  }

  private gerarTrailer(seq: number): string {
    let l = '';
    l += '9';
    l += this.padA('', 437);
    l += this.padN(String(seq), 6);
    return l; // 444 chars
  }

  // ============================================================
  // GERAR ARQUIVO
  // ============================================================
  gerarArquivo(): void {
    this.errosGeracao = [];
    this.conteudoGerado = '';
    this.mostrarPreview = false;

    if (this.parcelas.length === 0) {
      this.errosGeracao.push('Adicione pelo menos uma parcela antes de gerar.');
      return;
    }

    for (let i = 0; i < this.parcelas.length; i++) {
      const p = this.parcelas[i];
      if (!p.numDocumento.trim()) {
        this.errosGeracao.push(`Parcela ${i + 1}: Nº Documento é obrigatório.`);
      }
      if (!p.dataVencimento) {
        this.errosGeracao.push(`Parcela ${i + 1}: Data de Vencimento é obrigatória.`);
      }
      if (!p.valorTitulo || p.valorTitulo <= 0) {
        this.errosGeracao.push(`Parcela ${i + 1}: Valor deve ser maior que zero.`);
      }
      if (p.dataVencimento && this.operacao.dataEmissao && p.dataVencimento <= this.operacao.dataEmissao) {
        this.errosGeracao.push(`Parcela ${i + 1}: Vencimento (${p.dataVencimento}) deve ser POSTERIOR à Data da Operação (${this.operacao.dataEmissao}).`);
      }
    }

    if (this.errosGeracao.length > 0) return;

    const linhas: string[] = [];
    let seq = 1;

    const header = this.gerarHeader(seq++);
    if (header.length !== 444) this.errosGeracao.push(`Header com ${header.length} chars (esperado 444).`);
    linhas.push(header);

    for (const p of this.parcelas) {
      const det = this.gerarDetalhe(p, seq++);
      if (det.length !== 444) this.errosGeracao.push(`Detalhe "${p.numDocumento}" com ${det.length} chars (esperado 444).`);
      linhas.push(det);
    }

    const trailer = this.gerarTrailer(seq - 1);
    if (trailer.length !== 444) this.errosGeracao.push(`Trailer com ${trailer.length} chars (esperado 444).`);
    linhas.push(trailer);

    if (this.errosGeracao.length > 0) return;

    this.conteudoGerado = linhas.join('\r\n');
    this.mostrarPreview = true;
  }

  baixarArquivo(): void {
    if (!this.conteudoGerado) return;
    const bytes = new Uint8Array(this.conteudoGerado.length);
    for (let i = 0; i < this.conteudoGerado.length; i++) {
      bytes[i] = this.conteudoGerado.charCodeAt(i) & 0xff;
    }
    const blob = new Blob([bytes], { type: 'text/plain;charset=iso-8859-1' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dataStr = this.arquivo.dataGravacao.replace(/-/g, '');
    a.download = `remessa_singulare_ccb_${dataStr}_seq${this.arquivo.numSeqArquivo}.rem`;
    a.click();
    URL.revokeObjectURL(url);
  }

  copiarPreview(): void {
    navigator.clipboard.writeText(this.conteudoGerado).then(() => {
      this._copiado = true;
      setTimeout(() => { this._copiado = false; }, 2000);
    });
  }

  _copiado = false;

  formatarReais(val: number): string {
    return (val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  hoje(): void {
    this.arquivo.dataGravacao = new Date().toISOString().slice(0, 10);
    this.operacao.dataEmissao = new Date().toISOString().slice(0, 10);
  }
}
