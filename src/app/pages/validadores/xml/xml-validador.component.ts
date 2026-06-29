import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface TagInfo {
  caminho: string;
  tag: string;
  valor: string;
  caracteres: number;
  temFilhos: boolean;
  filhos: number;
  alerta: string | null;
}

interface Alerta {
  tag: string;
  valor: string;
  caracteres: number;
  limite: number;
  mensagem: string;
}

interface ResumoXml {
  totalTags: number;
  totalTagsFolha: number;
  totalCaracteres: number;
  tagMaior: TagInfo | null;
  tagMenor: TagInfo | null;
}

interface TagCteValidada {
  tag: string;
  descricao: string;
  dica: string;
  presente: boolean;
  caminhoEncontrado?: string;
  valorEncontrado?: string;
}

interface SecaoCte {
  nome: string;
  icone: string;
  tags: TagCteValidada[];
  totalObrigatorias: number;
  totalPresentes: number;
  expandida: boolean;
}

interface ArquivoXml {
  nome: string;
  tags: TagInfo[];
  resumo: ResumoXml;
  alertas: Alerta[];
  filtro: string;
  apenasComValor: boolean;
  erro: string | null;
  tipoDoc: 'CTe' | 'NFe' | 'XML';
  versaoDoc: string | null;
  secoesCte: SecaoCte[];
}

// ─── Regras de alerta de tamanho ────────────────────────────────────────────
const REGRAS_ALERTA: { tags: string[]; limite: number; mensagem: string }[] = [
  { tags: ['chave', 'chNFe', 'chCTe'], limite: 44, mensagem: 'Chave não deve ultrapassar 44 caracteres' },
  { tags: ['nDup'],                     limite: 10, mensagem: 'nDup não deve ultrapassar 10 caracteres' },
  { tags: ['CNPJ'],                     limite: 14, mensagem: 'CNPJ deve ter 14 dígitos' },
  { tags: ['CEP'],                      limite: 8,  mensagem: 'CEP deve ter 8 dígitos' },
];

// ─── Schema CTe 4.00 por seções ──────────────────────────────────────────────
interface TagSchema {
  tag: string;
  pathContem?: string;
  descricao: string;
  dica: string;
  alternativa?: string;
  altPathContem?: string;
}

const CTE_SCHEMA: { nome: string; icone: string; tags: TagSchema[] }[] = [
  {
    nome: 'Identificação (ide)',
    icone: '🪪',
    tags: [
      { tag: 'cUF',       descricao: 'Código UF emitente',                 dica: 'ide > cUF' },
      { tag: 'cCT',       descricao: 'Código numérico do CT-e',             dica: 'ide > cCT' },
      { tag: 'CFOP',      descricao: 'CFOP',                                dica: 'ide > CFOP' },
      { tag: 'natOp',     descricao: 'Natureza da operação',                dica: 'ide > natOp' },
      { tag: 'mod',       descricao: 'Modelo do documento (57)',             dica: 'ide > mod' },
      { tag: 'serie',     descricao: 'Série do CT-e',                       dica: 'ide > serie' },
      { tag: 'nCT',       descricao: 'Número do CT-e',                      dica: 'ide > nCT' },
      { tag: 'dhEmi',     descricao: 'Data e hora de emissão',              dica: 'ide > dhEmi' },
      { tag: 'tpImp',     descricao: 'Tipo de impressão do DACTE',          dica: 'ide > tpImp' },
      { tag: 'tpEmis',    descricao: 'Tipo de emissão',                     dica: 'ide > tpEmis' },
      { tag: 'cDV',       descricao: 'Dígito verificador da chave',         dica: 'ide > cDV' },
      { tag: 'tpAmb',     descricao: 'Tipo de ambiente (1=Prod / 2=Homol)', dica: 'ide > tpAmb' },
      { tag: 'tpCTe',     descricao: 'Tipo do CT-e',                        dica: 'ide > tpCTe' },
      { tag: 'procEmi',   descricao: 'Processo de emissão',                 dica: 'ide > procEmi' },
      { tag: 'verProc',   descricao: 'Versão do processo de emissão',       dica: 'ide > verProc' },
      { tag: 'cMunEnv',   descricao: 'Cód. município de envio',             dica: 'ide > cMunEnv' },
      { tag: 'xMunEnv',   descricao: 'Nome município de envio',             dica: 'ide > xMunEnv' },
      { tag: 'UFEnv',     descricao: 'UF de envio',                         dica: 'ide > UFEnv' },
      { tag: 'modal',     descricao: 'Modal (01=Rodov, 02=Aéreo…)',         dica: 'ide > modal' },
      { tag: 'tpServ',    descricao: 'Tipo de serviço',                     dica: 'ide > tpServ' },
      { tag: 'cMunIni',   descricao: 'Cód. município início',               dica: 'ide > cMunIni' },
      { tag: 'xMunIni',   descricao: 'Nome município início',               dica: 'ide > xMunIni' },
      { tag: 'UFIni',     descricao: 'UF início do serviço',                dica: 'ide > UFIni' },
      { tag: 'cMunFim',   descricao: 'Cód. município fim',                  dica: 'ide > cMunFim' },
      { tag: 'xMunFim',   descricao: 'Nome município fim',                  dica: 'ide > xMunFim' },
      { tag: 'UFFim',     descricao: 'UF fim do serviço',                   dica: 'ide > UFFim' },
      { tag: 'retira',    descricao: 'Indicador de retira',                 dica: 'ide > retira' },
      { tag: 'indIEToma', descricao: 'Indicador IE do tomador',             dica: 'ide > indIEToma' },
    ]
  },
  {
    nome: 'Emitente (emit)',
    icone: '🏢',
    tags: [
      { tag: 'CNPJ',    pathContem: '> emit >',    descricao: 'CNPJ do emitente',        dica: 'emit > CNPJ' },
      { tag: 'xNome',   pathContem: '> emit >',    descricao: 'Razão social emitente',    dica: 'emit > xNome' },
      { tag: 'CRT',                                 descricao: 'Código Regime Tributário', dica: 'emit > CRT' },
      { tag: 'xLgr',    pathContem: 'enderEmit',   descricao: 'Logradouro emitente',      dica: 'emit > enderEmit > xLgr' },
      { tag: 'nro',     pathContem: 'enderEmit',   descricao: 'Número emitente',          dica: 'emit > enderEmit > nro' },
      { tag: 'xBairro', pathContem: 'enderEmit',   descricao: 'Bairro emitente',          dica: 'emit > enderEmit > xBairro' },
      { tag: 'cMun',    pathContem: 'enderEmit',   descricao: 'Cód. município emitente',  dica: 'emit > enderEmit > cMun' },
      { tag: 'xMun',    pathContem: 'enderEmit',   descricao: 'Município emitente',       dica: 'emit > enderEmit > xMun' },
      { tag: 'CEP',     pathContem: 'enderEmit',   descricao: 'CEP emitente',             dica: 'emit > enderEmit > CEP' },
      { tag: 'UF',      pathContem: 'enderEmit',   descricao: 'UF emitente',              dica: 'emit > enderEmit > UF' },
    ]
  },
  {
    nome: 'Remetente (rem)',
    icone: '📦',
    tags: [
      { tag: 'CNPJ',    pathContem: '> rem >',   alternativa: 'CPF', altPathContem: '> rem >', descricao: 'CNPJ/CPF remetente', dica: 'rem > CNPJ ou CPF' },
      { tag: 'xNome',   pathContem: '> rem >',   descricao: 'Razão social remetente',    dica: 'rem > xNome' },
      { tag: 'xLgr',    pathContem: 'enderReme', descricao: 'Logradouro remetente',      dica: 'rem > enderReme > xLgr' },
      { tag: 'nro',     pathContem: 'enderReme', descricao: 'Número remetente',          dica: 'rem > enderReme > nro' },
      { tag: 'xBairro', pathContem: 'enderReme', descricao: 'Bairro remetente',          dica: 'rem > enderReme > xBairro' },
      { tag: 'cMun',    pathContem: 'enderReme', descricao: 'Cód. município remetente',  dica: 'rem > enderReme > cMun' },
      { tag: 'xMun',    pathContem: 'enderReme', descricao: 'Município remetente',       dica: 'rem > enderReme > xMun' },
      { tag: 'CEP',     pathContem: 'enderReme', descricao: 'CEP remetente',             dica: 'rem > enderReme > CEP' },
      { tag: 'UF',      pathContem: 'enderReme', descricao: 'UF remetente',              dica: 'rem > enderReme > UF' },
    ]
  },
  {
    nome: 'Destinatário (dest)',
    icone: '🏠',
    tags: [
      { tag: 'CNPJ',    pathContem: '> dest >', alternativa: 'CPF', altPathContem: '> dest >', descricao: 'CNPJ/CPF destinatário', dica: 'dest > CNPJ ou CPF' },
      { tag: 'xNome',   pathContem: '> dest >', descricao: 'Razão social destinatário',   dica: 'dest > xNome' },
      { tag: 'xLgr',    pathContem: 'enderDest', descricao: 'Logradouro destinatário',    dica: 'dest > enderDest > xLgr' },
      { tag: 'nro',     pathContem: 'enderDest', descricao: 'Número destinatário',        dica: 'dest > enderDest > nro' },
      { tag: 'xBairro', pathContem: 'enderDest', descricao: 'Bairro destinatário',        dica: 'dest > enderDest > xBairro' },
      { tag: 'cMun',    pathContem: 'enderDest', descricao: 'Cód. município destinatário',dica: 'dest > enderDest > cMun' },
      { tag: 'xMun',    pathContem: 'enderDest', descricao: 'Município destinatário',     dica: 'dest > enderDest > xMun' },
      { tag: 'CEP',     pathContem: 'enderDest', descricao: 'CEP destinatário',           dica: 'dest > enderDest > CEP' },
      { tag: 'UF',      pathContem: 'enderDest', descricao: 'UF destinatário',            dica: 'dest > enderDest > UF' },
    ]
  },
  {
    nome: 'Valores da Prestação (vPrest)',
    icone: '💰',
    tags: [
      { tag: 'vTPrest', descricao: 'Valor total da prestação',      dica: 'vPrest > vTPrest' },
      { tag: 'vRec',    descricao: 'Valor a receber',               dica: 'vPrest > vRec' },
      { tag: 'Comp',    descricao: 'Componente do valor (≥1)',       dica: 'vPrest > Comp' },
      { tag: 'xNome',   pathContem: 'Comp', descricao: 'Nome do componente', dica: 'vPrest > Comp > xNome' },
      { tag: 'vComp',   descricao: 'Valor do componente',           dica: 'vPrest > Comp > vComp' },
    ]
  },
  {
    nome: 'Impostos (imp)',
    icone: '📋',
    tags: [
      { tag: 'ICMS',     descricao: 'Grupo de ICMS',                dica: 'imp > ICMS' },
      { tag: 'vTotTrib', descricao: 'Valor total de tributos',      dica: 'imp > vTotTrib' },
    ]
  },
  {
    nome: 'Carga (infCarga)',
    icone: '🚛',
    tags: [
      { tag: 'vCarga',  descricao: 'Valor total da carga',         dica: 'infCarga > vCarga' },
      { tag: 'proPred', descricao: 'Produto predominante',          dica: 'infCarga > proPred' },
      { tag: 'infQ',    descricao: 'Inf. de quantidade (≥1)',       dica: 'infCarga > infQ' },
      { tag: 'cUnid',   descricao: 'Código da unidade de medida',  dica: 'infQ > cUnid' },
      { tag: 'tpMed',   descricao: 'Tipo de medida',               dica: 'infQ > tpMed' },
      { tag: 'qCarga',  descricao: 'Quantidade',                   dica: 'infQ > qCarga' },
    ]
  },
  {
    nome: 'Modal (infModal)',
    icone: '🚗',
    tags: [
      { tag: 'infModal', descricao: 'Grupo de informações do modal', dica: 'infCTeNorm > infModal' },
    ]
  },
  {
    nome: 'Cobrança (cobr)',
    icone: '🧾',
    tags: [
      { tag: 'nFat', descricao: 'Número da fatura',    dica: 'cobr > fat > nFat' },
      { tag: 'nDup', descricao: 'Número da duplicata', dica: 'cobr > dup > nDup' },
    ]
  },
  {
    nome: 'Protocolo de Autorização (protCTe)',
    icone: '✅',
    tags: [
      { tag: 'protCTe',  descricao: 'Grupo do protocolo',           dica: 'cteProc > protCTe' },
      { tag: 'infProt',  descricao: 'Informações do protocolo',     dica: 'protCTe > infProt' },
      { tag: 'chCTe',    descricao: 'Chave de acesso do CT-e',      dica: 'infProt > chCTe' },
      { tag: 'dhRecbto', descricao: 'Data/hora de recebimento',     dica: 'infProt > dhRecbto' },
      { tag: 'nProt',    descricao: 'Número do protocolo SEFAZ',    dica: 'infProt > nProt' },
      { tag: 'cStat',    descricao: 'Código status da resposta',    dica: 'infProt > cStat' },
      { tag: 'xMotivo',  descricao: 'Descrição do status',          dica: 'infProt > xMotivo' },
    ]
  },
];

@Component({
  selector: 'app-xml-validador',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div style="max-width:1400px;margin:0 auto;padding:20px;">
      <a routerLink="/validadores"
         style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:#e8f4fc;border:1px solid #cce0eb;border-radius:8px;color:#00253F;font-size:13px;font-weight:700;text-decoration:none;margin-bottom:20px;">
        ← Voltar
      </a>

      <h2 style="color:#1976d2;margin-bottom:6px;">🗂️ Validador / Leitor de XML (CT-e · NF-e)</h2>
      <p style="color:#666;margin-bottom:20px;font-size:14px;">
        Carregue um ou mais XMLs fiscais para validar a presença das tags obrigatórias conforme o schema padrão.
      </p>

      <!-- Upload -->
      <div style="margin-bottom:20px;padding:20px;background:#f5f9ff;border:2px dashed #90caf9;border-radius:10px;text-align:center;">
        <input type="file" accept=".xml" multiple (change)="onFileChange($event)"
               style="padding:10px;border:2px solid #1976d2;border-radius:6px;cursor:pointer;font-size:14px;" />
        <p style="margin:10px 0 0 0;color:#888;font-size:12px;">
          CT-e, NF-e ou qualquer XML — use Ctrl+clique para múltiplos arquivos
        </p>
        @if (arquivos.length > 0) {
          <button (click)="limparTudo()"
                  style="margin-top:12px;padding:6px 16px;background:#ffebee;border:1px solid #ef9a9a;border-radius:6px;color:#c62828;cursor:pointer;font-size:12px;font-weight:600;">
            🗑️ Limpar tudo
          </button>
        }
      </div>

      <!-- Resumo geral multi-arquivo -->
      @if (arquivos.length > 1) {
        <div style="margin-bottom:20px;padding:16px;background:#e8eaf6;border-radius:10px;border:1px solid #9fa8da;">
          <strong style="color:#283593;font-size:14px;">📊 Resumo — {{ arquivos.length }} arquivos</strong>
          <div style="display:flex;gap:24px;margin-top:10px;flex-wrap:wrap;">
            <span style="font-size:13px;color:#333;">Tags totais: <strong>{{ totalGeralTags }}</strong></span>
            <span style="font-size:13px;color:#333;">Com valor: <strong>{{ totalGeralFolhas }}</strong></span>
            <span style="font-size:13px;color:#333;">Caracteres: <strong>{{ totalGeralCaracteres }}</strong></span>
          </div>
        </div>
      }

      <!-- Tabela de status rápido por arquivo -->
      @if (arquivos.length > 0) {
        <div style="margin-bottom:20px;border-radius:10px;overflow:hidden;border:1px solid #e0e0e0;">
          <div style="padding:12px 16px;background:#37474f;display:flex;align-items:center;gap:8px;">
            <span style="font-size:16px;">🔍</span>
            <strong style="color:#fff;font-size:13px;">Status por arquivo</strong>
            @if (arquivosComFalha.length > 0) {
              <span style="margin-left:auto;background:#ff9800;color:#fff;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;">
                {{ arquivosComFalha.length }} arquivo(s) com tags ausentes
              </span>
            } @else {
              <span style="margin-left:auto;background:#43a047;color:#fff;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;">
                ✓ Todos OK
              </span>
            }
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:13px;background:#fff;">
            <thead>
              <tr style="background:#f5f5f5;border-bottom:2px solid #e0e0e0;">
                <th style="padding:9px 14px;text-align:left;color:#555;">Arquivo</th>
                <th style="padding:9px 14px;text-align:center;color:#555;">Tipo</th>
                <th style="padding:9px 14px;text-align:center;color:#555;">Validação</th>
                <th style="padding:9px 14px;text-align:center;color:#555;">Alertas</th>
                <th style="padding:9px 14px;text-align:center;color:#555;">Ação</th>
              </tr>
            </thead>
            <tbody>
              @for (arq of arquivos; track arq.nome; let i = $index) {
                <tr [style.background]="temTagsAusentes(arq) ? '#fff8e1' : '#fff'"
                    style="border-bottom:1px solid #f0f0f0;">
                  <td style="padding:9px 14px;font-weight:600;color:#333;">{{ arq.nome }}</td>
                  <td style="padding:9px 14px;text-align:center;">
                    <span [style.background]="arq.tipoDoc === 'CTe' ? '#e3f2fd' : arq.tipoDoc === 'NFe' ? '#e8f5e9' : '#f5f5f5'"
                          [style.color]="arq.tipoDoc === 'CTe' ? '#1565c0' : arq.tipoDoc === 'NFe' ? '#2e7d32' : '#666'"
                          style="padding:3px 10px;border-radius:12px;font-size:11px;font-weight:700;">
                      {{ arq.tipoDoc }}{{ arq.versaoDoc ? ' ' + arq.versaoDoc : '' }}
                    </span>
                  </td>
                  <td style="padding:9px 14px;text-align:center;">
                    @if (arq.tipoDoc === 'CTe') {
                      @if (totalAusentes(arq) === 0) {
                        <span style="background:#e8f5e9;color:#2e7d32;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:700;">
                          ✓ {{ totalTagsCte(arq) }} tags OK
                        </span>
                      } @else {
                        <span style="background:#fff3e0;color:#e65100;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:700;border:1px solid #ffcc80;">
                          ✕ {{ totalAusentes(arq) }} ausente(s)
                        </span>
                      }
                    } @else {
                      <span style="color:#999;font-size:12px;">—</span>
                    }
                  </td>
                  <td style="padding:9px 14px;text-align:center;">
                    @if (arq.alertas.length > 0) {
                      <span style="background:#ffcdd2;color:#c62828;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:700;">
                        ⚠️ {{ arq.alertas.length }}
                      </span>
                    } @else {
                      <span style="color:#43a047;font-size:12px;font-weight:600;">✓ OK</span>
                    }
                  </td>
                  <td style="padding:9px 14px;text-align:center;">
                    <button (click)="abaAtiva = i"
                            style="padding:4px 12px;background:#1976d2;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;">
                      Ver
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Abas dos arquivos -->
      @if (arquivos.length > 0) {
        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:0;border-bottom:2px solid #1976d2;">
          @for (arq of arquivos; track arq.nome; let i = $index) {
            <button (click)="abaAtiva = i"
                    [style.background]="abaAtiva === i ? '#1976d2' : '#e3f2fd'"
                    [style.color]="abaAtiva === i ? '#fff' : '#1565c0'"
                    [style.border]="abaAtiva === i ? '2px solid #1976d2' : '2px solid #90caf9'"
                    style="padding:8px 16px;border-bottom:none;border-radius:6px 6px 0 0;cursor:pointer;font-size:12px;font-weight:600;max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"
                    [title]="arq.nome">
              📄 {{ arq.nome }}
              @if (arq.alertas.length > 0) {
                <span style="margin-left:4px;background:#f44336;color:#fff;border-radius:10px;padding:1px 5px;font-size:10px;">{{ arq.alertas.length }}</span>
              }
              @if (totalAusentes(arq) > 0) {
                <span style="margin-left:4px;background:#ff9800;color:#fff;border-radius:10px;padding:1px 5px;font-size:10px;">{{ totalAusentes(arq) }}✕</span>
              }
              <span (click)="$event.stopPropagation(); removerArquivo(i)"
                    style="margin-left:6px;opacity:0.7;font-size:11px;" title="Remover">✕</span>
            </button>
          }
        </div>

        <!-- Conteúdo da aba ativa -->
        @if (arquivoAtivo) {
          <div style="padding:20px;border:2px solid #1976d2;border-top:none;border-radius:0 0 10px 10px;background:#fff;">

            @if (arquivoAtivo.erro) {
              <div style="color:#b71c1c;background:#ffebee;padding:12px;border-radius:6px;border:1px solid #ef5350;margin-bottom:18px;">
                ❌ {{ arquivoAtivo.erro }}
              </div>
            }

            <!-- Badge tipo de documento -->
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px;flex-wrap:wrap;">
              <span [style.background]="arquivoAtivo.tipoDoc === 'CTe' ? '#1976d2' : arquivoAtivo.tipoDoc === 'NFe' ? '#388e3c' : '#607d8b'"
                    style="color:#fff;padding:6px 14px;border-radius:20px;font-size:13px;font-weight:700;">
                {{ arquivoAtivo.tipoDoc === 'CTe' ? '📄 CT-e' : arquivoAtivo.tipoDoc === 'NFe' ? '🧾 NF-e' : '🗂️ XML' }}
                {{ arquivoAtivo.versaoDoc ? 'v' + arquivoAtivo.versaoDoc : '' }}
              </span>
              <span style="font-size:13px;color:#555;">
                {{ arquivoAtivo.resumo.totalTags }} tags · {{ arquivoAtivo.resumo.totalTagsFolha }} com valor · {{ arquivoAtivo.resumo.totalCaracteres }} caracteres
              </span>
            </div>

            <!-- ════ VALIDAÇÃO CTe ════ -->
            @if (arquivoAtivo.tipoDoc === 'CTe' && arquivoAtivo.secoesCte.length > 0) {
              <div style="margin-bottom:24px;">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap;">
                  <h3 style="margin:0;font-size:15px;color:#1976d2;">Validação CT-e 4.00 — Tags Obrigatórias</h3>
                  @if (totalAusentes(arquivoAtivo) === 0) {
                    <span style="background:#43a047;color:#fff;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;">
                      ✓ {{ totalTagsCte(arquivoAtivo) }}/{{ totalTagsCte(arquivoAtivo) }} tags presentes
                    </span>
                  } @else {
                    <span style="background:#e53935;color:#fff;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;">
                      ✕ {{ totalAusentes(arquivoAtivo) }} tag(s) ausente(s)
                    </span>
                    <span style="background:#43a047;color:#fff;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;">
                      ✓ {{ totalTagsCte(arquivoAtivo) - totalAusentes(arquivoAtivo) }}/{{ totalTagsCte(arquivoAtivo) }} presentes
                    </span>
                  }
                  <button (click)="expandirTodas(arquivoAtivo, true)"
                          style="margin-left:auto;padding:4px 10px;background:#e3f2fd;border:1px solid #90caf9;border-radius:6px;font-size:11px;cursor:pointer;color:#1565c0;font-weight:600;">
                    Expandir tudo
                  </button>
                  <button (click)="expandirTodas(arquivoAtivo, false)"
                          style="padding:4px 10px;background:#f5f5f5;border:1px solid #ddd;border-radius:6px;font-size:11px;cursor:pointer;color:#555;font-weight:600;">
                    Recolher tudo
                  </button>
                </div>

                @for (secao of arquivoAtivo.secoesCte; track secao.nome) {
                  <div style="margin-bottom:6px;border-radius:8px;overflow:hidden;border:1px solid #e0e0e0;">
                    <!-- Cabeçalho da seção -->
                    <button (click)="secao.expandida = !secao.expandida"
                            [style.background]="secao.totalPresentes === secao.totalObrigatorias ? '#e8f5e9' : '#fff3e0'"
                            style="width:100%;display:flex;align-items:center;gap:10px;padding:10px 14px;border:none;cursor:pointer;text-align:left;">
                      <span style="font-size:16px;">{{ secao.icone }}</span>
                      <span style="font-weight:700;font-size:13px;color:#333;flex:1;">{{ secao.nome }}</span>
                      @if (secao.totalPresentes === secao.totalObrigatorias) {
                        <span style="background:#43a047;color:#fff;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:700;">
                          ✓ {{ secao.totalPresentes }}/{{ secao.totalObrigatorias }}
                        </span>
                      } @else {
                        <span style="background:#e53935;color:#fff;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:700;">
                          ✕ {{ secao.totalPresentes }}/{{ secao.totalObrigatorias }}
                        </span>
                      }
                      <span style="font-size:11px;color:#999;">{{ secao.expandida ? '▲' : '▼' }}</span>
                    </button>

                    <!-- Tags da seção -->
                    @if (secao.expandida) {
                      <table style="width:100%;border-collapse:collapse;font-size:12px;background:#fff;">
                        <thead>
                          <tr style="background:#f5f5f5;border-bottom:1px solid #e0e0e0;">
                            <th style="padding:7px 12px;text-align:left;color:#666;font-weight:600;width:28px;"></th>
                            <th style="padding:7px 12px;text-align:left;color:#666;font-weight:600;">Tag</th>
                            <th style="padding:7px 12px;text-align:left;color:#666;font-weight:600;">Descrição</th>
                            <th style="padding:7px 12px;text-align:left;color:#666;font-weight:600;">Caminho esperado</th>
                            <th style="padding:7px 12px;text-align:left;color:#666;font-weight:600;">Valor encontrado</th>
                          </tr>
                        </thead>
                        <tbody>
                          @for (tv of secao.tags; track tv.tag + tv.dica) {
                            <tr [style.background]="tv.presente ? '#fafff8' : '#fff8f0'"
                                style="border-bottom:1px solid #f5f5f5;">
                              <td style="padding:7px 12px;text-align:center;">
                                @if (tv.presente) {
                                  <span style="color:#43a047;font-weight:700;font-size:14px;">✓</span>
                                } @else {
                                  <span style="color:#e53935;font-weight:700;font-size:14px;">✕</span>
                                }
                              </td>
                              <td style="padding:7px 12px;">
                                <code [style.background]="tv.presente ? '#e8f5e9' : '#ffebee'"
                                      [style.color]="tv.presente ? '#1b5e20' : '#b71c1c'"
                                      style="padding:2px 7px;border-radius:3px;font-size:11px;font-weight:700;">
                                  &lt;{{ tv.tag }}&gt;
                                </code>
                              </td>
                              <td style="padding:7px 12px;color:#555;">{{ tv.descricao }}</td>
                              <td style="padding:7px 12px;">
                                <code style="background:#f5f5f5;color:#666;padding:1px 6px;border-radius:3px;font-size:10px;">
                                  {{ tv.dica }}
                                </code>
                              </td>
                              <td style="padding:7px 12px;max-width:220px;">
                                @if (tv.presente && tv.valorEncontrado) {
                                  <span style="color:#333;font-size:11px;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"
                                        [title]="tv.valorEncontrado">
                                    {{ tv.valorEncontrado.length > 50 ? (tv.valorEncontrado | slice:0:50) + '…' : tv.valorEncontrado }}
                                  </span>
                                } @else if (tv.presente) {
                                  <span style="color:#43a047;font-size:11px;">presente</span>
                                } @else {
                                  <span style="color:#e53935;font-size:11px;font-style:italic;">— ausente —</span>
                                }
                              </td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    }
                  </div>
                }
              </div>
            }

            <!-- Alertas de tamanho -->
            @if (arquivoAtivo.alertas.length > 0) {
              <div style="margin-bottom:20px;padding:16px;background:#fff8e1;border:2px solid #ffc107;border-radius:8px;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
                  <span style="font-size:20px;">⚠️</span>
                  <strong style="color:#e65100;font-size:15px;">{{ arquivoAtivo.alertas.length }} alerta(s) de tamanho</strong>
                </div>
                @for (alerta of arquivoAtivo.alertas; track alerta.tag + alerta.valor) {
                  <div style="display:flex;align-items:flex-start;gap:10px;padding:10px 12px;background:#fff;border-left:4px solid #f44336;border-radius:4px;margin-bottom:8px;">
                    <div style="flex:1;">
                      <div style="font-size:13px;font-weight:700;color:#c62828;margin-bottom:4px;">
                        &lt;{{ alerta.tag }}&gt; — {{ alerta.mensagem }}
                      </div>
                      <div style="font-size:12px;color:#555;display:flex;gap:16px;flex-wrap:wrap;">
                        <span>Valor: <code style="background:#fce4ec;padding:1px 5px;border-radius:3px;color:#880e4f;font-size:11px;">{{ alerta.valor | slice:0:60 }}{{ alerta.valor.length > 60 ? '…' : '' }}</code></span>
                        <span>Encontrado: <strong style="color:#c62828;">{{ alerta.caracteres }}</strong></span>
                        <span>Limite: <strong style="color:#388e3c;">{{ alerta.limite }}</strong></span>
                        <span>Excesso: <strong style="color:#f44336;">+{{ alerta.caracteres - alerta.limite }}</strong></span>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }

            <!-- Cards de resumo -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:20px;">
              <div style="background:#e3f2fd;padding:14px;border-radius:8px;border:1px solid #90caf9;text-align:center;">
                <div style="font-size:26px;font-weight:bold;color:#1565c0;">{{ arquivoAtivo.resumo.totalTags }}</div>
                <div style="font-size:12px;color:#555;margin-top:4px;">Total de Tags</div>
              </div>
              <div style="background:#e8f5e9;padding:14px;border-radius:8px;border:1px solid #a5d6a7;text-align:center;">
                <div style="font-size:26px;font-weight:bold;color:#2e7d32;">{{ arquivoAtivo.resumo.totalTagsFolha }}</div>
                <div style="font-size:12px;color:#555;margin-top:4px;">Tags com Valor</div>
              </div>
              <div style="background:#fff3e0;padding:14px;border-radius:8px;border:1px solid #ffcc80;text-align:center;">
                <div style="font-size:26px;font-weight:bold;color:#e65100;">{{ arquivoAtivo.resumo.totalCaracteres }}</div>
                <div style="font-size:12px;color:#555;margin-top:4px;">Total Caracteres</div>
              </div>
              @if (arquivoAtivo.resumo.tagMaior) {
                <div style="background:#f3e5f5;padding:14px;border-radius:8px;border:1px solid #ce93d8;text-align:center;">
                  <div style="font-size:22px;font-weight:bold;color:#6a1b9a;">{{ arquivoAtivo.resumo.tagMaior.caracteres }}</div>
                  <div style="font-size:11px;color:#555;margin-top:4px;">Maior valor<br><strong style="color:#6a1b9a;">&lt;{{ arquivoAtivo.resumo.tagMaior.tag }}&gt;</strong></div>
                </div>
              }
            </div>

            <!-- Filtro e tabela de tags -->
            <div style="margin-bottom:14px;display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
              <input type="text" [(ngModel)]="arquivoAtivo.filtro" placeholder="Filtrar por tag ou valor..."
                     style="padding:8px 12px;border:1px solid #90caf9;border-radius:6px;font-size:13px;min-width:220px;" />
              <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;">
                <input type="checkbox" [(ngModel)]="arquivoAtivo.apenasComValor" style="cursor:pointer;" />
                Apenas tags com valor
              </label>
              <span style="margin-left:auto;font-size:12px;color:#888;">
                {{ getTagsFiltradas(arquivoAtivo).length }} tag(s)
              </span>
            </div>

            <div style="overflow-x:auto;border-radius:8px;border:1px solid #e0e0e0;">
              <table style="width:100%;border-collapse:collapse;font-size:13px;">
                <thead>
                  <tr style="background:#1976d2;color:#fff;">
                    <th style="padding:10px 14px;text-align:left;">#</th>
                    <th style="padding:10px 14px;text-align:left;">Tag</th>
                    <th style="padding:10px 14px;text-align:left;">Caminho</th>
                    <th style="padding:10px 14px;text-align:left;">Valor</th>
                    <th style="padding:10px 14px;text-align:center;">Chars</th>
                    <th style="padding:10px 14px;text-align:center;">Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  @for (tag of getTagsFiltradas(arquivoAtivo); track tag.caminho + tag.valor; let i = $index) {
                    <tr [style.background]="tag.alerta ? '#fff8e1' : (i % 2 === 0 ? '#fafafa' : '#fff')"
                        [style.border-left]="tag.alerta ? '4px solid #f44336' : 'none'"
                        style="border-bottom:1px solid #f0f0f0;">
                      <td style="padding:7px 14px;color:#999;font-size:12px;">{{ i + 1 }}</td>
                      <td style="padding:7px 14px;">
                        <code style="background:#e3f2fd;color:#1565c0;padding:2px 6px;border-radius:3px;font-size:12px;font-weight:600;">
                          &lt;{{ tag.tag }}&gt;
                        </code>
                      </td>
                      <td style="padding:7px 14px;color:#666;font-size:11px;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"
                          [title]="tag.caminho">
                        {{ tag.caminho }}
                      </td>
                      <td style="padding:7px 14px;max-width:320px;">
                        @if (!tag.temFilhos) {
                          <span style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#333;" [title]="tag.valor">
                            {{ tag.valor || '(vazio)' }}
                          </span>
                        } @else {
                          <span style="color:#999;font-style:italic;font-size:12px;">{{ tag.filhos }} sub-elemento(s)</span>
                        }
                      </td>
                      <td style="padding:7px 14px;text-align:center;">
                        <span [style.background]="tag.alerta ? '#ffcdd2' : getCorContagem(tag.caracteres)"
                              style="display:inline-block;padding:3px 10px;border-radius:12px;font-weight:700;font-size:12px;color:#333;min-width:34px;">
                          {{ tag.caracteres }}
                        </span>
                        @if (tag.alerta) {
                          <span style="display:block;font-size:10px;color:#c62828;margin-top:2px;">⚠️ limite</span>
                        }
                      </td>
                      <td style="padding:7px 14px;text-align:center;">
                        @if (!tag.temFilhos) {
                          <span style="background:#e8f5e9;color:#2e7d32;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;">FOLHA</span>
                        } @else {
                          <span style="background:#e3f2fd;color:#1565c0;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;">PAI</span>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

          </div>
        }
      }

      <!-- Estado inicial -->
      @if (arquivos.length === 0) {
        <div style="margin-top:24px;padding:50px;text-align:center;color:#aaa;background:#fafafa;border-radius:10px;border:2px dashed #e0e0e0;">
          <div style="font-size:48px;margin-bottom:12px;">📄</div>
          <p style="margin:0;font-size:15px;">Anexe um ou mais arquivos XML para validar e visualizar as tags</p>
        </div>
      }
    </div>
  `
})
export class XmlValidadorComponent {
  arquivos: ArquivoXml[] = [];
  abaAtiva = 0;

  get arquivoAtivo(): ArquivoXml | null {
    return this.arquivos[this.abaAtiva] ?? null;
  }

  get totalGeralTags(): number    { return this.arquivos.reduce((s, a) => s + a.resumo.totalTags, 0); }
  get totalGeralFolhas(): number  { return this.arquivos.reduce((s, a) => s + a.resumo.totalTagsFolha, 0); }
  get totalGeralCaracteres(): number { return this.arquivos.reduce((s, a) => s + a.resumo.totalCaracteres, 0); }

  get arquivosComFalha(): ArquivoXml[] {
    return this.arquivos.filter(a => this.totalAusentes(a) > 0 || a.alertas.length > 0);
  }

  totalAusentes(arq: ArquivoXml): number {
    return arq.secoesCte.reduce((s, sec) => s + (sec.totalObrigatorias - sec.totalPresentes), 0);
  }

  totalTagsCte(arq: ArquivoXml): number {
    return arq.secoesCte.reduce((s, sec) => s + sec.totalObrigatorias, 0);
  }

  temTagsAusentes(arq: ArquivoXml): boolean {
    return this.totalAusentes(arq) > 0;
  }

  expandirTodas(arq: ArquivoXml, expandida: boolean): void {
    arq.secoesCte.forEach(s => s.expandida = expandida);
  }

  getTagsFiltradas(arq: ArquivoXml): TagInfo[] {
    return arq.tags.filter(t => {
      if (arq.apenasComValor && (t.temFilhos || t.caracteres === 0)) return false;
      if (!arq.filtro) return true;
      const f = arq.filtro.toLowerCase();
      return t.tag.toLowerCase().includes(f) || t.valor.toLowerCase().includes(f) || t.caminho.toLowerCase().includes(f);
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const novos = Array.from(input.files).filter(f => f.name.toLowerCase().endsWith('.xml'));
    for (const file of novos) {
      if (this.arquivos.some(a => a.nome === file.name)) continue;
      const reader = new FileReader();
      reader.onload = () => {
        const arq = this.processarXml(file.name, reader.result as string);
        this.arquivos = [...this.arquivos, arq];
        this.abaAtiva = this.arquivos.length - 1;
      };
      reader.onerror = () => {
        this.arquivos = [...this.arquivos, this.erroArquivo(file.name, 'Erro ao ler o arquivo.')];
      };
      reader.readAsText(file, 'UTF-8');
    }
    input.value = '';
  }

  removerArquivo(index: number): void {
    this.arquivos = this.arquivos.filter((_, i) => i !== index);
    if (this.abaAtiva >= this.arquivos.length) this.abaAtiva = Math.max(0, this.arquivos.length - 1);
  }

  limparTudo(): void { this.arquivos = []; this.abaAtiva = 0; }

  private erroArquivo(nome: string, erro: string): ArquivoXml {
    return {
      nome, tags: [], alertas: [], secoesCte: [],
      resumo: { totalTags: 0, totalTagsFolha: 0, totalCaracteres: 0, tagMaior: null, tagMenor: null },
      filtro: '', apenasComValor: false, erro, tipoDoc: 'XML', versaoDoc: null
    };
  }

  private processarXml(nome: string, conteudo: string): ArquivoXml {
    const parser = new DOMParser();
    const doc = parser.parseFromString(conteudo, 'text/xml');
    const parseError = doc.querySelector('parsererror');
    if (parseError) return this.erroArquivo(nome, 'XML inválido: ' + (parseError.textContent || 'Erro de parse'));

    const tags: TagInfo[] = [];
    this.percorrerElemento(doc.documentElement, '', tags);

    // Alertas de tamanho
    const alertas: Alerta[] = [];
    for (const tag of tags) {
      if (tag.temFilhos) continue;
      for (const regra of REGRAS_ALERTA) {
        if (regra.tags.includes(tag.tag) && tag.caracteres > regra.limite) {
          tag.alerta = regra.mensagem;
          alertas.push({ tag: tag.tag, valor: tag.valor, caracteres: tag.caracteres, limite: regra.limite, mensagem: regra.mensagem });
        }
      }
    }

    const folhas = tags.filter(t => !t.temFilhos && t.caracteres > 0);
    const totalCaracteres = folhas.reduce((s, t) => s + t.caracteres, 0);
    const tagMaior = folhas.length ? folhas.reduce((a, b) => a.caracteres >= b.caracteres ? a : b) : null;
    const tagMenor = folhas.length ? folhas.reduce((a, b) => a.caracteres <= b.caracteres ? a : b) : null;

    // Detecta tipo
    const { tipo: tipoDoc, versao: versaoDoc } = this.detectarTipo(tags);

    // Validação CTe
    const secoesCte = tipoDoc === 'CTe' ? this.validarCte(tags) : [];

    return {
      nome, tags, alertas, secoesCte,
      resumo: { totalTags: tags.length, totalTagsFolha: folhas.length, totalCaracteres, tagMaior, tagMenor },
      filtro: '', apenasComValor: false, erro: null, tipoDoc, versaoDoc
    };
  }

  private percorrerElemento(el: Element, caminhoAtual: string, tags: TagInfo[]): void {
    const tagLocal = el.localName;
    const caminho = caminhoAtual ? `${caminhoAtual} > ${tagLocal}` : tagLocal;
    const filhos = Array.from(el.children);
    const temFilhos = filhos.length > 0;
    const textoDireto = temFilhos ? '' : (el.textContent || '').trim();
    tags.push({ caminho, tag: tagLocal, valor: textoDireto, caracteres: textoDireto.length, temFilhos, filhos: filhos.length, alerta: null });
    for (const filho of filhos) this.percorrerElemento(filho, caminho, tags);
  }

  private detectarTipo(tags: TagInfo[]): { tipo: 'CTe' | 'NFe' | 'XML'; versao: string | null } {
    const nomes = new Set(tags.map(t => t.tag));
    if (nomes.has('infCte') || nomes.has('cteProc')) {
      const v = tags.find(t => t.tag === 'infCte' || t.tag === 'cteProc');
      return { tipo: 'CTe', versao: '4.00' };
    }
    if (nomes.has('infNFe') || nomes.has('nfeProc')) return { tipo: 'NFe', versao: '4.00' };
    return { tipo: 'XML', versao: null };
  }

  private validarCte(tags: TagInfo[]): SecaoCte[] {
    return CTE_SCHEMA.map(secao => {
      const tagsValidadas: TagCteValidada[] = secao.tags.map(schema => {
        const found = this.buscarTag(tags, schema.tag, schema.pathContem);
        let presente = !!found;
        let caminhoEncontrado = found?.caminho;
        let valorEncontrado = found?.valor;

        if (!presente && schema.alternativa) {
          const alt = this.buscarTag(tags, schema.alternativa, schema.altPathContem);
          if (alt) { presente = true; caminhoEncontrado = alt.caminho; valorEncontrado = alt.valor; }
        }

        return { tag: schema.tag, descricao: schema.descricao, dica: schema.dica, presente, caminhoEncontrado, valorEncontrado };
      });

      const totalPresentes = tagsValidadas.filter(t => t.presente).length;
      return {
        nome: secao.nome,
        icone: secao.icone,
        tags: tagsValidadas,
        totalObrigatorias: tagsValidadas.length,
        totalPresentes,
        expandida: totalPresentes < tagsValidadas.length
      };
    });
  }

  private buscarTag(tags: TagInfo[], tagNome: string, pathContem?: string): TagInfo | undefined {
    return tags.find(t =>
      t.tag === tagNome &&
      (!pathContem || t.caminho.toLowerCase().includes(pathContem.toLowerCase()))
    );
  }

  getCorContagem(n: number): string {
    if (n === 0)  return '#f5f5f5';
    if (n <= 5)   return '#e8f5e9';
    if (n <= 20)  return '#fff9c4';
    if (n <= 50)  return '#ffe0b2';
    return '#ffcdd2';
  }
}
