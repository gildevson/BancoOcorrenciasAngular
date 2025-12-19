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

@Component({
  selector: 'app-consultar-ocorrencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ocorrencia.component.html',
  styleUrls: ['./ocorrencia.component.css'],
})
export class ConsultarOcorrenciaComponent {
  // Dados das ocorrências
  ocorrencias: OcorrenciaBancaria[] = OCORRENCIAS_BANCARIAS;

  // Campos de busca
  codigoOcorrencia = '';
  codigoMotivo = '';

  // Resultado da busca
  resultado: OcorrenciaBancaria | null = null;
  resultadosRelacionados: OcorrenciaBancaria[] = [];

  // Estado
  buscaRealizada = false;
  naoEncontrado = false;

  /**
   * Realiza a busca da ocorrência
   */
  buscar(): void {
    this.buscaRealizada = true;
    this.naoEncontrado = false;
    this.resultado = null;
    this.resultadosRelacionados = [];

    const codigo = this.codigoOcorrencia.trim();
    const motivo = this.codigoMotivo.trim();

    if (!codigo) {
      return;
    }

    // Busca exata (código + motivo)
    if (motivo) {
      const found = buscarOcorrencia(codigo, motivo);
      this.resultado = found || null;
    } else {
      // Busca apenas por código
      const resultados = buscarOcorrenciasPorCodigo(codigo);
      if (resultados.length === 1) {
        this.resultado = resultados[0];
      } else if (resultados.length > 1) {
        this.resultadosRelacionados = resultados;
      }
    }

    // Se não encontrou resultado exato, busca relacionados
    if (!this.resultado && this.resultadosRelacionados.length === 0) {
      this.resultadosRelacionados = buscarOcorrenciasPorCodigo(codigo);
    }

    // Marca como não encontrado se nada foi achado
    if (!this.resultado && this.resultadosRelacionados.length === 0) {
      this.naoEncontrado = true;
    }
  }

  /**
   * Seleciona uma ocorrência dos resultados relacionados
   */
  selecionarOcorrencia(ocorrencia: OcorrenciaBancaria): void {
    this.resultado = ocorrencia;
    this.codigoOcorrencia = ocorrencia.codigo;
    this.codigoMotivo = ocorrencia.motivo || '';
    this.resultadosRelacionados = [];
  }

  /**
   * Limpa a busca
   */
  limpar(): void {
    this.codigoOcorrencia = '';
    this.codigoMotivo = '';
    this.resultado = null;
    this.resultadosRelacionados = [];
    this.buscaRealizada = false;
    this.naoEncontrado = false;
  }

  /**
   * Retorna a classe CSS para a categoria
   */
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

  /**
   * Retorna o ícone para a categoria
   */
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

  /**
   * Copia o código para a área de transferência
   */
  copiarCodigo(): void {
    if (!this.resultado) return;

    const texto = this.resultado.motivo
      ? `${this.resultado.codigo}${this.resultado.motivo}`
      : this.resultado.codigo;

    navigator.clipboard.writeText(texto).then(() => {
      alert('Código copiado!');
    }).catch(err => {
      console.error('Erro ao copiar:', err);
    });
  }

  /**
   * Compartilha a ocorrência
   */
  compartilhar(): void {
    if (!this.resultado) return;

    const texto = `
Ocorrência: ${this.resultado.codigo}${this.resultado.motivo ? '-' + this.resultado.motivo : ''}
Descrição: ${this.resultado.descricao}
Categoria: ${this.resultado.categoria}
    `.trim();

    if (navigator.share) {
      navigator.share({
        title: 'Ocorrência Bancária',
        text: texto,
      }).catch(err => console.error('Erro ao compartilhar:', err));
    } else {
      navigator.clipboard.writeText(texto).then(() => {
        alert('Informações copiadas para a área de transferência!');
      }).catch(err => {
        console.error('Erro ao copiar:', err);
      });
    }
  }

  /**
   * Exporta para PDF (placeholder)
   */
  exportarPDF(): void {
    if (!this.resultado) return;
    alert('Função de exportação PDF será implementada em breve!');
    // TODO: Implementar geração de PDF
  }

  /**
   * Formata o código completo
   */
  get codigoCompleto(): string {
    if (!this.resultado) return '';
    return this.resultado.motivo
      ? `${this.resultado.codigo}-${this.resultado.motivo}`
      : this.resultado.codigo;
  }

  /**
   * Verifica se a busca é válida
   */
  get buscaValida(): boolean {
    return this.codigoOcorrencia.trim().length > 0;
  }
}
