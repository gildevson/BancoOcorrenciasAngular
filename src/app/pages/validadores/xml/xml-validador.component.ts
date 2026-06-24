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

interface ArquivoXml {
  nome: string;
  tags: TagInfo[];
  resumo: ResumoXml;
  alertas: Alerta[];
  filtro: string;
  apenasComValor: boolean;
  erro: string | null;
}

const REGRAS_ALERTA: { tags: string[]; limite: number; mensagem: string }[] = [
  {
    tags: ['chave', 'chNFe', 'chCTe'],
    limite: 44,
    mensagem: 'Chave da nota fiscal não deve ultrapassar 44 caracteres'
  },
  {
    tags: ['nDup'],
    limite: 10,
    mensagem: 'Número da duplicata (nDup) não deve ultrapassar 10 caracteres'
  }
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

      <h2 style="color:#1976d2;margin-bottom:6px;">🗂️ Validador / Leitor de XML</h2>
      <p style="color:#666;margin-bottom:20px;font-size:14px;">
        Anexe um ou mais arquivos XML para visualizar todas as tags, seus valores e a contagem de caracteres.
      </p>

      <!-- Upload -->
      <div style="margin-bottom:20px;padding:20px;background:#f5f9ff;border:2px dashed #90caf9;border-radius:10px;text-align:center;">
        <input
          type="file"
          accept=".xml"
          multiple
          (change)="onFileChange($event)"
          style="padding:10px;border:2px solid #1976d2;border-radius:6px;cursor:pointer;font-size:14px;" />
        <p style="margin:10px 0 0 0;color:#888;font-size:12px;">
          Selecione um ou mais arquivos .xml (CT-e, NF-e, etc.) — use Ctrl+clique para múltiplos
        </p>
        @if (arquivos.length > 0) {
          <button
            (click)="limparTudo()"
            style="margin-top:12px;padding:6px 16px;background:#ffebee;border:1px solid #ef9a9a;border-radius:6px;color:#c62828;cursor:pointer;font-size:12px;font-weight:600;">
            🗑️ Limpar tudo
          </button>
        }
      </div>

      <!-- Resumo geral (quando há mais de 1 arquivo) -->
      @if (arquivos.length > 1) {
        <div style="margin-bottom:20px;padding:16px;background:#e8eaf6;border-radius:10px;border:1px solid #9fa8da;">
          <strong style="color:#283593;font-size:14px;">📊 Resumo Geral — {{ arquivos.length }} arquivos carregados</strong>
          <div style="display:flex;gap:24px;margin-top:10px;flex-wrap:wrap;">
            <span style="font-size:13px;color:#333;">
              Tags totais: <strong>{{ totalGeralTags }}</strong>
            </span>
            <span style="font-size:13px;color:#333;">
              Tags com valor: <strong>{{ totalGeralFolhas }}</strong>
            </span>
            <span style="font-size:13px;color:#333;">
              Caracteres totais: <strong>{{ totalGeralCaracteres }}</strong>
            </span>
          </div>
        </div>
      }

      <!-- Abas dos arquivos -->
      @if (arquivos.length > 0) {
        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:0;border-bottom:2px solid #1976d2;">
          @for (arq of arquivos; track arq.nome; let i = $index) {
            <button
              (click)="abaAtiva = i"
              [style.background]="abaAtiva === i ? '#1976d2' : '#e3f2fd'"
              [style.color]="abaAtiva === i ? '#fff' : '#1565c0'"
              [style.border]="abaAtiva === i ? '2px solid #1976d2' : '2px solid #90caf9'"
              style="padding:8px 16px;border-bottom:none;border-radius:6px 6px 0 0;cursor:pointer;font-size:12px;font-weight:600;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"
              [title]="arq.nome">
              📄 {{ arq.nome }}
              @if (arq.alertas.length > 0) {
                <span style="margin-left:6px;background:#f44336;color:#fff;border-radius:10px;padding:1px 6px;font-size:10px;font-weight:700;"
                      title="{{ arq.alertas.length }} alerta(s)">
                  {{ arq.alertas.length }}
                </span>
              }
              <span
                (click)="$event.stopPropagation(); removerArquivo(i)"
                style="margin-left:8px;opacity:0.7;font-size:11px;"
                title="Remover">✕</span>
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

            <!-- Alertas de validação -->
            @if (arquivoAtivo.alertas.length > 0) {
              <div style="margin-bottom:20px;padding:16px;background:#fff8e1;border:2px solid #ffc107;border-radius:8px;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
                  <span style="font-size:20px;">⚠️</span>
                  <strong style="color:#e65100;font-size:15px;">
                    {{ arquivoAtivo.alertas.length }} alerta(s) encontrado(s)
                  </strong>
                </div>
                @for (alerta of arquivoAtivo.alertas; track alerta.tag + alerta.valor) {
                  <div style="display:flex;align-items:flex-start;gap:10px;padding:10px 12px;background:#fff;border-left:4px solid #f44336;border-radius:4px;margin-bottom:8px;">
                    <span style="font-size:16px;margin-top:1px;">🔴</span>
                    <div style="flex:1;">
                      <div style="font-size:13px;font-weight:700;color:#c62828;margin-bottom:4px;">
                        &lt;{{ alerta.tag }}&gt; — {{ alerta.mensagem }}
                      </div>
                      <div style="font-size:12px;color:#555;display:flex;gap:16px;flex-wrap:wrap;">
                        <span>
                          Valor:
                          <code style="background:#fce4ec;padding:1px 6px;border-radius:3px;color:#880e4f;font-size:11px;">
                            {{ alerta.valor.length > 60 ? (alerta.valor | slice:0:60) + '...' : alerta.valor }}
                          </code>
                        </span>
                        <span>
                          Encontrado:
                          <strong style="color:#c62828;">{{ alerta.caracteres }} chars</strong>
                        </span>
                        <span>
                          Limite:
                          <strong style="color:#388e3c;">{{ alerta.limite }} chars</strong>
                        </span>
                        <span>
                          Excesso:
                          <strong style="color:#f44336;">+{{ alerta.caracteres - alerta.limite }} chars</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }

            <!-- Cards de resumo -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:20px;">
              <div style="background:#e3f2fd;padding:14px;border-radius:8px;border:1px solid #90caf9;text-align:center;">
                <div style="font-size:28px;font-weight:bold;color:#1565c0;">{{ arquivoAtivo.resumo.totalTags }}</div>
                <div style="font-size:12px;color:#555;margin-top:4px;">Total de Tags</div>
              </div>
              <div style="background:#e8f5e9;padding:14px;border-radius:8px;border:1px solid #a5d6a7;text-align:center;">
                <div style="font-size:28px;font-weight:bold;color:#2e7d32;">{{ arquivoAtivo.resumo.totalTagsFolha }}</div>
                <div style="font-size:12px;color:#555;margin-top:4px;">Tags com Valor</div>
              </div>
              <div style="background:#fff3e0;padding:14px;border-radius:8px;border:1px solid #ffcc80;text-align:center;">
                <div style="font-size:28px;font-weight:bold;color:#e65100;">{{ arquivoAtivo.resumo.totalCaracteres }}</div>
                <div style="font-size:12px;color:#555;margin-top:4px;">Total de Caracteres</div>
              </div>
              @if (arquivoAtivo.resumo.tagMaior) {
                <div style="background:#f3e5f5;padding:14px;border-radius:8px;border:1px solid #ce93d8;text-align:center;">
                  <div style="font-size:22px;font-weight:bold;color:#6a1b9a;">{{ arquivoAtivo.resumo.tagMaior.caracteres }}</div>
                  <div style="font-size:11px;color:#555;margin-top:4px;">
                    Maior valor<br>
                    <strong style="color:#6a1b9a;">&lt;{{ arquivoAtivo.resumo.tagMaior.tag }}&gt;</strong>
                  </div>
                </div>
              }
              @if (arquivoAtivo.resumo.tagMenor) {
                <div style="background:#fce4ec;padding:14px;border-radius:8px;border:1px solid #f48fb1;text-align:center;">
                  <div style="font-size:22px;font-weight:bold;color:#880e4f;">{{ arquivoAtivo.resumo.tagMenor.caracteres }}</div>
                  <div style="font-size:11px;color:#555;margin-top:4px;">
                    Menor valor<br>
                    <strong style="color:#880e4f;">&lt;{{ arquivoAtivo.resumo.tagMenor.tag }}&gt;</strong>
                  </div>
                </div>
              }
            </div>

            <!-- Filtro -->
            <div style="margin-bottom:14px;display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
              <input
                type="text"
                [(ngModel)]="arquivoAtivo.filtro"
                placeholder="Filtrar por tag ou valor..."
                style="padding:8px 12px;border:1px solid #90caf9;border-radius:6px;font-size:13px;min-width:220px;" />
              <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;">
                <input type="checkbox" [(ngModel)]="arquivoAtivo.apenasComValor" style="cursor:pointer;" />
                Apenas tags com valor
              </label>
              <span style="margin-left:auto;font-size:12px;color:#888;">
                {{ getTagsFiltradas(arquivoAtivo).length }} tag(s) exibida(s)
              </span>
            </div>

            <!-- Tabela -->
            <div style="overflow-x:auto;border-radius:8px;border:1px solid #e0e0e0;">
              <table style="width:100%;border-collapse:collapse;font-size:13px;">
                <thead>
                  <tr style="background:#1976d2;color:#fff;">
                    <th style="padding:10px 14px;text-align:left;font-weight:600;">#</th>
                    <th style="padding:10px 14px;text-align:left;font-weight:600;">Tag</th>
                    <th style="padding:10px 14px;text-align:left;font-weight:600;">Caminho</th>
                    <th style="padding:10px 14px;text-align:left;font-weight:600;">Valor</th>
                    <th style="padding:10px 14px;text-align:center;font-weight:600;">Caracteres</th>
                    <th style="padding:10px 14px;text-align:center;font-weight:600;">Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  @for (tag of getTagsFiltradas(arquivoAtivo); track tag.caminho + tag.valor; let i = $index) {
                    <tr [style.background]="tag.alerta ? '#fff8e1' : (i % 2 === 0 ? '#fafafa' : '#fff')"
                        [style.border-left]="tag.alerta ? '4px solid #f44336' : 'none'"
                        style="border-bottom:1px solid #f0f0f0;">
                      <td style="padding:8px 14px;color:#999;font-size:12px;">{{ i + 1 }}</td>
                      <td style="padding:8px 14px;">
                        <code style="background:#e3f2fd;color:#1565c0;padding:2px 6px;border-radius:3px;font-size:12px;font-weight:600;">
                          &lt;{{ tag.tag }}&gt;
                        </code>
                      </td>
                      <td style="padding:8px 14px;color:#666;font-size:11px;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"
                          [title]="tag.caminho">
                        {{ tag.caminho }}
                      </td>
                      <td style="padding:8px 14px;max-width:320px;">
                        @if (!tag.temFilhos) {
                          <span style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#333;"
                                [title]="tag.valor">
                            {{ tag.valor || '(vazio)' }}
                          </span>
                        } @else {
                          <span style="color:#999;font-style:italic;font-size:12px;">
                            {{ tag.filhos }} sub-elemento(s)
                          </span>
                        }
                      </td>
                      <td style="padding:8px 14px;text-align:center;">
                        <span [style.background]="tag.alerta ? '#ffcdd2' : getCorContagem(tag.caracteres)"
                              style="display:inline-block;padding:3px 10px;border-radius:12px;font-weight:700;font-size:12px;color:#333;min-width:36px;">
                          {{ tag.caracteres }}
                        </span>
                        @if (tag.alerta) {
                          <span style="display:block;font-size:10px;color:#c62828;margin-top:2px;" [title]="tag.alerta">⚠️ limite excedido</span>
                        }
                      </td>
                      <td style="padding:8px 14px;text-align:center;">
                        @if (!tag.temFilhos) {
                          <span style="background:#e8f5e9;color:#2e7d32;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;">
                            FOLHA
                          </span>
                        } @else {
                          <span style="background:#e3f2fd;color:#1565c0;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;">
                            PAI
                          </span>
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
          <p style="margin:0;font-size:15px;">Anexe um ou mais arquivos .XML para visualizar as tags e a contagem de caracteres</p>
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

  get totalGeralTags(): number {
    return this.arquivos.reduce((s, a) => s + a.resumo.totalTags, 0);
  }

  get totalGeralFolhas(): number {
    return this.arquivos.reduce((s, a) => s + a.resumo.totalTagsFolha, 0);
  }

  get totalGeralCaracteres(): number {
    return this.arquivos.reduce((s, a) => s + a.resumo.totalCaracteres, 0);
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
    if (!input.files || input.files.length === 0) return;

    const novosArquivos = Array.from(input.files).filter(f => f.name.toLowerCase().endsWith('.xml'));

    for (const file of novosArquivos) {
      // Evita duplicatas pelo nome
      if (this.arquivos.some(a => a.nome === file.name)) continue;

      const reader = new FileReader();
      reader.onload = () => {
        const conteudo = reader.result as string;
        const arq = this.processarXml(file.name, conteudo);
        this.arquivos = [...this.arquivos, arq];
        this.abaAtiva = this.arquivos.length - 1;
      };
      reader.onerror = () => {
        this.arquivos = [...this.arquivos, {
          nome: file.name,
          tags: [],
          resumo: { totalTags: 0, totalTagsFolha: 0, totalCaracteres: 0, tagMaior: null, tagMenor: null },
          alertas: [],
          filtro: '',
          apenasComValor: false,
          erro: 'Erro ao ler o arquivo.'
        }];
      };
      reader.readAsText(file, 'UTF-8');
    }

    // Limpa o input para permitir re-seleção do mesmo arquivo
    input.value = '';
  }

  removerArquivo(index: number): void {
    this.arquivos = this.arquivos.filter((_, i) => i !== index);
    if (this.abaAtiva >= this.arquivos.length) {
      this.abaAtiva = Math.max(0, this.arquivos.length - 1);
    }
  }

  limparTudo(): void {
    this.arquivos = [];
    this.abaAtiva = 0;
  }

  private processarXml(nome: string, conteudo: string): ArquivoXml {
    const parser = new DOMParser();
    const doc = parser.parseFromString(conteudo, 'text/xml');

    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      return {
        nome,
        tags: [],
        alertas: [],
        resumo: { totalTags: 0, totalTagsFolha: 0, totalCaracteres: 0, tagMaior: null, tagMenor: null },
        filtro: '',
        apenasComValor: false,
        erro: 'XML inválido: ' + (parseError.textContent || 'Erro de parse')
      };
    }

    const tags: TagInfo[] = [];
    this.percorrerElemento(doc.documentElement, '', tags);

    // Gera alertas com base nas regras definidas
    const alertas: Alerta[] = [];
    for (const tag of tags) {
      if (tag.temFilhos) continue;
      for (const regra of REGRAS_ALERTA) {
        if (regra.tags.includes(tag.tag) && tag.caracteres > regra.limite) {
          tag.alerta = regra.mensagem;
          alertas.push({
            tag: tag.tag,
            valor: tag.valor,
            caracteres: tag.caracteres,
            limite: regra.limite,
            mensagem: regra.mensagem
          });
        }
      }
    }

    const folhas = tags.filter(t => !t.temFilhos && t.caracteres > 0);
    const totalCaracteres = folhas.reduce((s, t) => s + t.caracteres, 0);
    const tagMaior = folhas.length ? folhas.reduce((a, b) => a.caracteres >= b.caracteres ? a : b) : null;
    const tagMenor = folhas.length ? folhas.reduce((a, b) => a.caracteres <= b.caracteres ? a : b) : null;

    return {
      nome,
      tags,
      alertas,
      resumo: { totalTags: tags.length, totalTagsFolha: folhas.length, totalCaracteres, tagMaior, tagMenor },
      filtro: '',
      apenasComValor: false,
      erro: null
    };
  }

  private percorrerElemento(el: Element, caminhoAtual: string, tags: TagInfo[]): void {
    const tagLocal = el.localName;
    const caminho = caminhoAtual ? `${caminhoAtual} > ${tagLocal}` : tagLocal;

    const filhosElementos = Array.from(el.children);
    const temFilhos = filhosElementos.length > 0;
    const textoDireto = temFilhos ? '' : (el.textContent || '').trim();

    tags.push({ caminho, tag: tagLocal, valor: textoDireto, caracteres: textoDireto.length, temFilhos, filhos: filhosElementos.length, alerta: null });

    for (const filho of filhosElementos) {
      this.percorrerElemento(filho, caminho, tags);
    }
  }

  getCorContagem(n: number): string {
    if (n === 0)  return '#f5f5f5';
    if (n <= 5)   return '#e8f5e9';
    if (n <= 20)  return '#fff9c4';
    if (n <= 50)  return '#ffe0b2';
    return '#ffcdd2';
  }
}
