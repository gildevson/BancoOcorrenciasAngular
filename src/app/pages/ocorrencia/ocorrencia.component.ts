import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  OcorrenciaBancaria,
  OCORRENCIAS_BANCARIAS,
  CategoriaOcorrencia,
  buscarOcorrencia,
  buscarOcorrenciasPorCodigo,
} from '../../data/ocorrenciasdata';

interface Banco {
  codigo: string;
  nome: string;
  logo: string;
}

@Component({
  selector: 'app-consultar-ocorrencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ocorrencia.component.html',
  styleUrls: ['./ocorrencia.component.css'],
})
export class ConsultarOcorrenciaComponent {
  // ✅ Lista de bancos (pode aumentar depois)
  bancos: Banco[] = [
    { codigo: '001', nome: 'Banco do Brasil', logo: 'assets/logos/bb.png' },
    { codigo: '237', nome: 'Bradesco',        logo: 'assets/logos/bradesco.png' },
    { codigo: '341', nome: 'Itaú',            logo: 'assets/logos/itau.png' },
    { codigo: '033', nome: 'Santander',       logo: 'assets/logos/santander.png' },
  ];

  bancoSelecionado: Banco | null = null;

  // ✅ compareWith precisa aceitar null
  compareBanco = (a: Banco | null, b: Banco | null) => a?.codigo === b?.codigo;

  onBancoLogoError(ev: Event): void {
    (ev.target as HTMLImageElement).src = 'assets/logos/default-bank.png';
  }

  // Dados
  ocorrencias: OcorrenciaBancaria[] = OCORRENCIAS_BANCARIAS;

  // Campos de busca
  codigoOcorrencia = '';
  codigoMotivo = '';

  // Resultado
  resultado: OcorrenciaBancaria | null = null;
  resultadosRelacionados: OcorrenciaBancaria[] = [];

  // Estado
  buscaRealizada = false;
  naoEncontrado = false;

  /** ✅ Se o banco foi selecionado, filtra ocorrências:
   * - se a ocorrência NÃO tiver bancosEspecificos => deixa aparecer (genérica)
   * - se tiver => só aparece se bater com o banco selecionado
   */
  private filtrarPorBanco(lista: OcorrenciaBancaria[]): OcorrenciaBancaria[] {
    if (!this.bancoSelecionado) return lista;

    const nome = this.bancoSelecionado.nome.toLowerCase();
    const codigo = this.bancoSelecionado.codigo;

    return (lista ?? []).filter((o: any) => {
      const banks = o?.bancosEspecificos as string[] | undefined;
      if (!banks || banks.length === 0) return true;

      return banks.some((b) => {
        const s = (b ?? '').toString().toLowerCase();
        return s.includes(nome) || s.includes(codigo);
      });
    });
  }

  buscar(): void {
    this.buscaRealizada = true;
    this.naoEncontrado = false;
    this.resultado = null;
    this.resultadosRelacionados = [];

    const codigo = this.codigoOcorrencia.trim();
    const motivo = this.codigoMotivo.trim();

    if (!codigo) return;

    // 1) Busca exata (código + motivo)
    if (motivo) {
      const found = buscarOcorrencia(codigo, motivo);
      const filtrado = this.filtrarPorBanco(found ? [found] : []);
      this.resultado = filtrado[0] ?? null;
    } else {
      // 2) Busca por código (pode vir várias)
      const resultados = buscarOcorrenciasPorCodigo(codigo);
      const filtrados = this.filtrarPorBanco(resultados);

      if (filtrados.length === 1) this.resultado = filtrados[0];
      else if (filtrados.length > 1) this.resultadosRelacionados = filtrados;
    }

    // 3) Se nada encontrado
    if (!this.resultado && this.resultadosRelacionados.length === 0) {
      this.naoEncontrado = true;
    }
  }

  selecionarOcorrencia(ocorrencia: OcorrenciaBancaria): void {
    this.resultado = ocorrencia;
    this.codigoOcorrencia = ocorrencia.codigo;
    this.codigoMotivo = ocorrencia.motivo || '';
    this.resultadosRelacionados = [];
  }

  limpar(): void {
    this.codigoOcorrencia = '';
    this.codigoMotivo = '';
    this.bancoSelecionado = null;
    this.resultado = null;
    this.resultadosRelacionados = [];
    this.buscaRealizada = false;
    this.naoEncontrado = false;
  }

  getClasseCategoria(categoria: CategoriaOcorrencia): string {
    const classes: Record<CategoriaOcorrencia, string> = {
      'Confirmação': 'success',
      'Rejeição': 'error',
      'Baixa': 'warning',
      'Liquidação': 'success',
      'Alteração': 'info',
      'Protesto': 'warning',
      'Devolução': 'error',
      'Outros': 'neutral',
    };
    return classes[categoria] || 'neutral';
  }

  getIconeCategoria(categoria: CategoriaOcorrencia): string {
    const icones: Record<CategoriaOcorrencia, string> = {
      'Confirmação': 'check_circle',
      'Rejeição': 'cancel',
      'Baixa': 'delete',
      'Liquidação': 'paid',
      'Alteração': 'edit',
      'Protesto': 'gavel',
      'Devolução': 'undo',
      'Outros': 'help',
    };
    return icones[categoria] || 'help';
  }

  copiarCodigo(): void {
    if (!this.resultado) return;

    const texto = this.resultado.motivo
      ? `${this.resultado.codigo}-${this.resultado.motivo}`
      : this.resultado.codigo;

    navigator.clipboard.writeText(texto).then(() => alert('Código copiado!'));
  }

  compartilhar(): void {
    if (!this.resultado) return;

    const cod = this.resultado.motivo
      ? `${this.resultado.codigo}-${this.resultado.motivo}`
      : this.resultado.codigo;

    const texto = `Ocorrência: ${cod}\nDescrição: ${this.resultado.descricao}\nCategoria: ${this.resultado.categoria}`;

    if (navigator.share) {
      navigator.share({ title: 'Ocorrência Bancária', text: texto }).catch(() => {});
    } else {
      navigator.clipboard.writeText(texto).then(() => alert('Copiado!'));
    }
  }

  exportarPDF(): void {
    alert('PDF em breve!');
  }

  get buscaValida(): boolean {
    return this.codigoOcorrencia.trim().length > 0;
  }
}
