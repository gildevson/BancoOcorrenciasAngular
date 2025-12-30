// src/app/consultar-ocorrencia/ocorrencia.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

// ✅ Importar dados dos bancos
import { BancoData, BANCOS_DATA } from '../../data/bancos.data';

// ✅ Importar serviço de API
import { OcorrenciasApi, ApiOcorrenciaMotivo } from '../../service/ocorrencias.api';

// ================================
// TIPOS E INTERFACES
// ================================

type CategoriaOcorrencia =
  | 'Confirmação'
  | 'Rejeição'
  | 'Baixa'
  | 'Liquidação'
  | 'Alteração'
  | 'Protesto'
  | 'Devolução'
  | 'Outros';

interface OcorrenciaBancaria {
  id: string;
  codigo: string;          // "02"
  motivo?: string;         // "00"
  descricao: string;
  observacoes: string;
  categoria: CategoriaOcorrencia;
  tipoCNAB: string;
  requerAcao?: boolean;
  acoesSugeridas?: string[];
  bancosEspecificos?: string[];
}

// ✅ Usar BancoData do arquivo de dados
interface Banco extends BancoData {}

// ================================
// COMPONENTE
// ================================

@Component({
  selector: 'app-consultar-ocorrencia',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './ocorrencia.component.html',
  styleUrls: ['./ocorrencia.component.css'],
})
export class ConsultarOcorrenciaComponent {

  // ✅ Carregar bancos do arquivo de dados
  bancos: Banco[] = BANCOS_DATA;

  bancoSelecionado: Banco | null = null;

  // ✅ Comparador para o select do Angular
  compareBanco = (a: Banco | null, b: Banco | null) => a?.id === b?.id;

  // ================================
  // CAMPOS DO FORMULÁRIO
  // ================================

  codigoOcorrencia = '';
  codigoMotivo = '';

  // ================================
  // ESTADOS DO COMPONENTE
  // ================================

  resultado: OcorrenciaBancaria | null = null;
  resultadosRelacionados: OcorrenciaBancaria[] = [];

  buscaRealizada = false;
  naoEncontrado = false;
  carregando = false;
  erroBancoObrigatorio = false;

  // ================================
  // CONSTRUTOR
  // ================================

  constructor(private api: OcorrenciasApi) {}

  // ================================
  // MÉTODOS AUXILIARES
  // ================================

  /**
   * Fallback para logo do banco em caso de erro
   */
  onBancoLogoError(ev: Event): void {
    (ev.target as HTMLImageElement).src = 'assets/logos/default-bank.png';
  }

  /**
   * Formata string para 2 dígitos com zero à esquerda
   */
  private pad2(v: string): string {
    const t = (v ?? '').trim();
    if (!t) return '';
    return t.padStart(2, '0').slice(-2);
  }

  /**
   * Converte resposta da API para formato local do componente
   */
  private toLocal(api: ApiOcorrenciaMotivo): OcorrenciaBancaria {
    const codigo = api.ocorrencia;
    const categoria = this.determinarCategoria(codigo);
    const requerAcao = this.determinarRequerAcao(codigo);
    const acoesSugeridas = this.obterAcoesSugeridas(codigo, api.motivo);

    return {
      id: api.id,
      codigo: api.ocorrencia,
      motivo: api.motivo,
      descricao: api.descricao,
      observacoes: api.observacao ?? 'Sem observações adicionais.',
      categoria,
      tipoCNAB: 'CNAB240/CNAB400',
      requerAcao,
      acoesSugeridas,
      bancosEspecificos: [],
    };
  }

  /**
   * Determina a categoria baseada no código da ocorrência
   */
  private determinarCategoria(codigo: string): CategoriaOcorrencia {
    const mapa: Record<string, CategoriaOcorrencia> = {
      '02': 'Confirmação',    // Entrada confirmada
      '03': 'Rejeição',       // Entrada rejeitada
      '04': 'Rejeição',       // Transferência rejeitada
      '05': 'Baixa',          // Transferência de carteira/baixa
      '06': 'Liquidação',     // Liquidação normal
      '07': 'Confirmação',    // Confirmação de desconto
      '08': 'Confirmação',    // Confirmação de abatimento
      '09': 'Baixa',          // Baixa simples
      '10': 'Baixa',          // Baixa por ter sido liquidado
      '11': 'Confirmação',    // Em ser
      '12': 'Alteração',      // Abatimento concedido
      '13': 'Alteração',      // Abatimento cancelado
      '14': 'Alteração',      // Vencimento alterado
      '15': 'Liquidação',     // Liquidação em cartório
      '17': 'Liquidação',     // Liquidação após baixa
      '19': 'Protesto',       // Confirmação de protesto
      '20': 'Protesto',       // Sustação de protesto
      '21': 'Alteração',      // Transferência de beneficiário
      '23': 'Protesto',       // Título enviado a cartório
      '24': 'Rejeição',       // Instrução de protesto rejeitada
      '25': 'Outros',         // Alegações do sacado
      '26': 'Outros',         // Tarifa de aviso
      '27': 'Outros',         // Tarifa de extrato
      '28': 'Outros',         // Débito de tarifas
      '34': 'Confirmação',    // Confirmação de não protestar
    };

    return mapa[codigo] || 'Outros';
  }

  /**
   * Determina se a ocorrência requer ação do usuário
   */
  private determinarRequerAcao(codigo: string): boolean {
    const codigosComAcao = [
      '03', // Entrada rejeitada
      '04', // Transferência rejeitada
      '10', // Baixa solicitada
      '12', // Abatimento
      '15', // Liquidação em cartório
      '17', // Liquidação após baixa
      '19', // Protesto
      '23', // Enviado a cartório
      '24', // Protesto rejeitado
      '28', // Débito de tarifas
    ];

    return codigosComAcao.includes(codigo);
  }

  /**
   * Obtém ações sugeridas baseadas no código e motivo
   */
  private obterAcoesSugeridas(codigo: string, motivo: string): string[] {
    const acoesPorCodigo: Record<string, string[]> = {
      '03': [
        'Verifique os dados do título e corrija as inconsistências apontadas',
        `Consulte o código de motivo ${motivo} no manual CNAB do banco`,
        'Reenvie o título com os dados corrigidos',
        'Entre em contato com o suporte do banco se o erro persistir'
      ],
      '04': [
        'Confirme se a transferência de carteira foi solicitada corretamente',
        'Verifique os dados do novo beneficiário',
        'Entre em contato com o banco para validar a operação'
      ],
      '06': [
        'Atualize o status do título como liquidado no sistema',
        'Verifique se o valor creditado está correto',
        'Concilie o pagamento com suas contas a receber'
      ],
      '09': [
        'Confirme se a baixa foi intencional',
        'Atualize o status do título no sistema financeiro',
        'Verifique se há débitos ou tarifas pendentes'
      ],
      '10': [
        'Verifique o motivo da baixa solicitada',
        'Atualize os registros financeiros',
        'Considere ações de cobrança alternativas se necessário'
      ],
      '15': [
        'Entre em contato com o sacado para regularização urgente',
        'Avalie os custos do protesto',
        'Verifique políticas de cobrança da empresa',
        'Considere acordo de pagamento'
      ],
      '19': [
        'Confirme que o protesto foi autorizado pela empresa',
        'Verifique se todos os dados estão corretos',
        'Acompanhe o andamento do processo junto ao cartório'
      ],
      '23': [
        'Monitore o status do protesto junto ao cartório',
        'Prepare documentação necessária',
        'Avalie possibilidade de acordo antes da efetivação'
      ],
      '24': [
        `Verifique o motivo da rejeição (código ${motivo})`,
        'Corrija os dados conforme orientação do banco',
        'Reenvie a instrução de protesto se necessário'
      ]
    };

    return acoesPorCodigo[codigo] || [];
  }

  // ================================
  // AÇÃO PRINCIPAL: BUSCAR
  // ================================

  buscar(): void {
    this.buscaRealizada = true;
    this.naoEncontrado = false;
    this.resultado = null;
    this.resultadosRelacionados = [];

    // ✅ Validar banco obrigatório
    if (!this.bancoSelecionado?.id) {
      this.erroBancoObrigatorio = true;
      return;
    }
    this.erroBancoObrigatorio = false;

    // ✅ Formatar código e motivo
    const codigo = this.pad2(this.codigoOcorrencia);
    const motivo = this.codigoMotivo.trim() ? this.pad2(this.codigoMotivo) : '';

    if (!codigo) {
      console.warn('Código de ocorrência inválido');
      return;
    }

    const bancoId = this.bancoSelecionado.id;
    this.carregando = true;

    // ✅ Se tem motivo específico, buscar apenas esse
    if (motivo) {
      this.api.getDetalhe(bancoId, codigo, motivo)
        .pipe(finalize(() => (this.carregando = false)))
        .subscribe({
          next: (data) => {
            this.resultado = this.toLocal(data);
            console.log('Resultado encontrado:', this.resultado);
          },
          error: (err) => {
            console.error('Erro ao buscar detalhe:', err);
            this.naoEncontrado = true;
          },
        });
      return;
    }

    // ✅ Sem motivo: buscar todos os motivos da ocorrência
    this.api.getMotivos(bancoId, codigo)
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (lista) => {
          if (!lista || lista.length === 0) {
            this.naoEncontrado = true;
            console.log('Nenhuma ocorrência encontrada');
            return;
          }

          const mapped = lista.map((x) => this.toLocal(x));
          console.log('Ocorrências encontradas:', mapped.length);

          // Se só tem 1 resultado, exibe direto
          if (mapped.length === 1) {
            this.resultado = mapped[0];
          } else {
            // Se tem múltiplos, mostra lista para seleção
            this.resultadosRelacionados = mapped;
          }
        },
        error: (err) => {
          console.error('Erro ao buscar motivos:', err);
          this.naoEncontrado = true;
        },
      });
  }

  // ================================
  // SELEÇÃO DE OCORRÊNCIA RELACIONADA
  // ================================

  selecionarOcorrencia(oc: OcorrenciaBancaria): void {
    this.resultado = oc;
    this.codigoOcorrencia = oc.codigo;
    this.codigoMotivo = oc.motivo || '';
    this.resultadosRelacionados = [];
  }

  // ================================
  // LIMPAR FORMULÁRIO
  // ================================

  limpar(): void {
    this.codigoOcorrencia = '';
    this.codigoMotivo = '';
    this.bancoSelecionado = null;

    this.resultado = null;
    this.resultadosRelacionados = [];
    this.buscaRealizada = false;
    this.naoEncontrado = false;
    this.carregando = false;
    this.erroBancoObrigatorio = false;
  }

  // ================================
  // HELPERS DE UI
  // ================================

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

  // ================================
  // AÇÕES EXTRAS
  // ================================

  copiarCodigo(): void {
    if (!this.resultado) return;

    const texto = this.resultado.motivo
      ? `${this.resultado.codigo}-${this.resultado.motivo}`
      : this.resultado.codigo;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(() => {
        alert('Código copiado: ' + texto);
      }).catch(err => {
        console.error('Erro ao copiar:', err);
        this.copiarFallback(texto);
      });
    } else {
      this.copiarFallback(texto);
    }
  }

  private copiarFallback(texto: string): void {
    const textarea = document.createElement('textarea');
    textarea.value = texto;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand('copy');
      alert('Código copiado: ' + texto);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }

    document.body.removeChild(textarea);
  }

  compartilhar(): void {
    if (!this.resultado) return;

    const cod = this.resultado.motivo
      ? `${this.resultado.codigo}-${this.resultado.motivo}`
      : this.resultado.codigo;

    const texto =
      `Ocorrência Bancária\n` +
      `Código: ${cod}\n` +
      `Descrição: ${this.resultado.descricao}\n` +
      `Categoria: ${this.resultado.categoria}\n` +
      `Banco: ${this.bancoSelecionado?.nome || ''}`;

    if (navigator.share) {
      navigator.share({
        title: 'Ocorrência Bancária',
        text: texto
      }).catch((err) => {
        console.log('Compartilhamento cancelado ou erro:', err);
        this.copiarParaCompartilhar(texto);
      });
    } else {
      this.copiarParaCompartilhar(texto);
    }
  }

  private copiarParaCompartilhar(texto: string): void {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(() => {
        alert('Informações copiadas para compartilhar!');
      });
    }
  }

  exportarPDF(): void {
    alert('Funcionalidade de exportação PDF em desenvolvimento!');
    // TODO: Implementar com jsPDF ou similar
  }

  // ================================
  // VALIDAÇÃO DO FORMULÁRIO
  // ================================

  get buscaValida(): boolean {
    return !!this.bancoSelecionado?.id && this.codigoOcorrencia.trim().length > 0;
  }
}
