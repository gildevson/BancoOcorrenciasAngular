# Layout Remessa — Singulare CTVM — CCB CNAB 444

**Banco:** Singulare CTVM — Código **363**  
**Formato:** CNAB 444 (444 caracteres por linha, ISO-8859-1)  
**Documento:** Cédula de Crédito Bancário — Espécie **70**  
**Arquivo de referência:** `CB03056076.txt`

---

## Estrutura do Arquivo

| Tipo | Posição 1 | Descrição | Qtd. |
|------|-----------|-----------|------|
| `0`  | Header    | Abertura do arquivo — 1 linha obrigatória | 1 |
| `1`  | Detalhe   | 1 linha por CCB registrada | N |
| `9`  | Trailer   | Encerramento — 1 linha obrigatória | 1 |

> **Nota:** O Sequencial de Registro (`Seq. Registro`) é o campo nos **últimos 6 caracteres** (pos 439–444) em **todos** os tipos de registro.

---

## Registro Header (Tipo `0`)

| Campo | Posição (1-based) | Tam | Tipo | Valor / Descrição |
|-------|-------------------|-----|------|-------------------|
| Tipo Registro | 1 | 1 | N | `0` — fixo |
| Ident. Arquivo | 2 | 1 | N | `1` — Remessa |
| Literal Remessa | 3–9 | 7 | A | `REMESSA` |
| Cód. Serviço | 10–11 | 2 | N | `01` — Cobrança |
| Literal Serviço | 12–26 | 15 | A | `COBRANCA` + brancos |
| Cód. Originador | 27–46 | 20 | N | Código fornecido pelo banco |
| **Nome Originador** | **47–75** | **29** | A | Razão social do originador (29 pos) |
| **Sigla Banco** | **76** | **1** | A | `S` — Singulare |
| **Nº Banco** | **77–79** | **3** | N | `363` — fixo |
| Nome Banco | 80–94 | 15 | A | `SINGULARE` + brancos |
| Data Gravação | 95–100 | 6 | N | `DDMMAA` |
| Branco | 101–108 | 8 | A | Brancos |
| Ident. Sistema | 109–110 | 2 | A | `MX` — fixo |
| Nº Seq. Arquivo | 111–117 | 7 | N | Sequencial do arquivo (ex: `0006076`) |
| Branco | 118–438 | 321 | A | Brancos |
| **Seq. Registro** | **439–444** | **6** | N | `000001` — sempre |

### Diferença em relação ao Paulista (banco 611)

| Campo | Paulista (611) | Singulare (363) |
|-------|---------------|-----------------|
| Nome Originador | pos 47–76 (30 chars) | pos 47–75 (29 chars) |
| Sigla Banco | *(não existe)* | pos 76 = `S` |
| Nº Banco | pos 77–79 = `611` | pos 77–79 = `363` |
| Seq. Registro | pos 395–400 | **pos 439–444** |

---

## Registro Detalhe (Tipo `1`)

| Campo | Posição (1-based) | Tam | Tipo | Valor / Descrição |
|-------|-------------------|-----|------|-------------------|
| Tipo Registro | 1 | 1 | N | `1` — fixo |
| Déb. Auto — Banco | 2–4 | 3 | N | Banco do tomador (Débito Auto) / Branco |
| Déb. Auto — Agência | 5–9 | 5 | N | Agência do tomador / Branco |
| Déb. Auto — Conta C/C | 10–19 | 10 | N | Conta corrente / Branco |
| Déb. Auto — Dígito | 20 | 1 | N | Dígito C/C / Branco |
| Coobrigação | 21–22 | 2 | N | `01`=Com / `02`=Sem Coobrigação |
| Caract. Especial | 23–24 | 2 | N | Anexo 8 SRC3040 (`00`=Padrão, `01`–`05`) |
| Modal. Operação | 25–28 | 4 | N | Modalidade — Anexo 3 SRC3040 |
| Nat. Operação | 29–30 | 2 | N | Natureza — Anexo 2 SRC3040 |
| Origem Recurso | 31–34 | 4 | N | Origem — Anexo 4 SRC3040 |
| Classe Risco | 35–36 | 2 | A | `AA`, `A `, `B `…`H ` (Res. CMN 2.682/99) |
| Zeros | 37 | 1 | N | Separador fixo — sempre `0` |
| Nº Controle | 38–62 | 25 | A | Identificação da CCB no sistema do cedente |
| Nº Banco | 63–65 | 3 | N | Banco cobrador (ou `000`) |
| Zeros | 66–70 | 5 | N | Zeros (`00000`) |
| Ident. Título | 71–81 | 11 | N | ID banco — zeros na remessa |
| Dígito N/N | 82 | 1 | A | Dígito Nosso Número / Branco |
| Valor Pago | 83–92 | 10 | N | Valor pago (2 decimais) — zeros na remessa |
| Cond. Papeleta | 93 | 1 | N | `1`=Banco emite/envia `2`=Emite/não envia `3`=Cedente |
| Ident. Papeleta | 94 | 1 | A | Papeleta Débito Auto: `S`/`N` |
| Data Liquidação | 95–100 | 6 | N | `DDMMAA` — zeros na remessa |
| Ident. Operação | 101–104 | 4 | A | Código interno da operação / Branco |
| Indic. Rateio | 105 | 1 | A | Indicador rateio / Branco |
| Endereço Aviso | 106 | 1 | N | `1`=Correio `2`=Eletrônico `3`=Não enviar |
| Branco | 107–108 | 2 | A | Brancos |
| **Cód. Ocorrência** | **109–110** | **2** | N | `01`=Remessa, `80`=Esp., ver tabela abaixo |
| Nº Documento | 111–120 | 10 | A | Número da CCB no sistema do cedente |
| **Vencimento** | **121–126** | **6** | N | `DDMMAA` — data de vencimento da parcela |
| **Valor Título** | **127–139** | **13** | N | Valor da CCB (2 decimais, sem ponto) |
| Banco Cobrança | 140–142 | 3 | N | Banco encarregado ou `000` |
| Ag. Depositária | 143–147 | 5 | N | Agência depositária ou `00000` |
| **Espécie Título** | **148–149** | **2** | N | **`70`** = CCB / `01`=Dup. `02`=NP `51`=Cheque |
| Aceite | 150 | 1 | A | `A`=Aceite `N`=Não aceite / Branco |
| **Data Emissão** | **151–156** | **6** | N | `DDMMAA` — data de emissão da CCB |
| 1ª Instrução | 157–158 | 2 | N | `00`=Sem `02`=Devolver `06`=Protestar `07`=Não prot. |
| 2ª Instrução | 159 | 1 | N | Instrução complementar |
| Insc. Est. Tomador | 160–173 | 14 | A | Inscrição Estadual do Tomador |
| Nº Termo Cessão | 174–192 | 19 | A | Nº do Termo de Cessão (FIDC) |
| **Valor Presente** | **193–205** | **13** | N | Valor presente da parcela (2 decimais) |
| Valor Abatimento | 206–218 | 13 | N | Valor abatimento (2 decimais) |
| **Tipo Insc. Tomador** | **219–220** | **2** | N | `01`=CPF `02`=CNPJ |
| **CPF/CNPJ Tomador** | **221–234** | **14** | N | CPF (14 dígitos, zeros à esq.) ou CNPJ |
| **Nome do Tomador** | **235–274** | **40** | A | Razão social ou nome do tomador da CCB |
| Endereço Tomador | 275–314 | 40 | A | Endereço completo do tomador |
| Nº Doc. Referência | 315–323 | 9 | A | Número de documento de referência |
| Compl. Referência | 324–326 | 3 | A | Complemento do documento de referência |
| CEP | 327–334 | 8 | N | CEP do tomador (sem hífen) |
| Nome Cedente | 335–380 | 46 | A | Razão social do cedente |
| CNPJ Cedente | 381–394 | 14 | N | CNPJ do cedente (sem pontuação) |
| Branco | 395–438 | 44 | A | Brancos |
| **Seq. Registro** | **439–444** | **6** | N | Sequencial do registro no arquivo |

### Tabela de Ocorrências (pos 109–110)

| Código | Descrição |
|--------|-----------|
| `01` | Remessa — entrada de CCB no banco |
| `04` | Abatimento — redução de valor (mediante justificativa) |
| `06` | Alteração de vencimento |
| `14` | Pagamento Parcial |
| `71` | Baixa por Recompra (liquidação consultoria) |
| `72` | Recompra Parcial sem Adiantamento |
| `73` | Recompra Parcial com Adiantamento |
| `74` | Baixa por Recompra (liquidação cedente) |
| `75` | Baixa por Depósito Cedente |
| `76` | Baixa por Depósito Consultoria |
| `77` | Baixa por Depósito Tomador |
| `80` | Remessa Singulare (liquidação consultoria) |
| `81` | Entrada por Recompra — troca de títulos |
| `84` | Entrada por Recompra (liquidação cedente) |
| `87` | Reativação de título |

### Tabela de Espécie (pos 148–149)

| Código | Descrição |
|--------|-----------|
| **`70`** | **Cédula de Crédito Bancário (CCB)** — padrão Singulare |
| `01` | Duplicata Mercantil |
| `02` | Nota Promissória |
| `51` | Cheque |

---

## Registro Trailer (Tipo `9`)

| Campo | Posição (1-based) | Tam | Tipo | Valor / Descrição |
|-------|-------------------|-----|------|-------------------|
| Tipo Registro | 1 | 1 | N | `9` — fixo |
| Branco | 2–438 | 437 | A | Brancos |
| **Seq. Registro** | **439–444** | **6** | N | Sequencial do último registro do arquivo |

---

## Exemplo de Arquivo (`CB03056076.txt`)

```
Linha 01 — Header   : pos 1='0', banco 363, originador FIDC BLUE SKY, data 03/05/24
Linhas 02–13 — Det. : 12 CCBs, espécie '70', Tomador CNPJ 63.837.917/0001-65
Linha 14 — Trailer  : seq. 000014
```

### Valores do arquivo de exemplo

| Campo | Valor |
|-------|-------|
| Banco | 363 — SINGULARE |
| Originador | FIDC BLUE SKY |
| Data Gravação | 03/05/2024 |
| Nº Seq. Arquivo | 0006076 |
| Total de CCBs | 12 |
| Espécie | 70 (CCB) |
| Ocorrência | 01 (Remessa) |
| Cedente | MOVA SOCIEDADE DE EMPRESTIMO ENTRE PESSOAS S/A |
| CNPJ Cedente | 33.959.738/0001-30 |
| Tomador | Nome do Tomador |
| CNPJ Tomador | 63.837.917/0001-65 |
| CEP Tomador | 88804-570 |
| Seq. Registro Header | 000001 |
| Seq. Registro Trailer | 000014 |

---

## Regras de Validação

1. **Tamanho da linha:** exatamente **444 caracteres** por linha (ISO-8859-1).
2. **Sequência:** o campo `Seq. Registro` deve ser sequencial a partir de `000001`.
3. **Seq. Registro sempre ao final:** posição 439–444 em **todos** os tipos (0, 1, 9).
4. **Espécie obrigatória:** campo pos 148–149 deve ser `70` para CCBs.
5. **Banco obrigatório:** campo `Nº Banco` no header deve ser `363`.
6. **Sigla Banco:** posição 76 do header deve conter `S`.
7. **Campos numéricos:** preenchidos com zeros à esquerda, sem espaços.
8. **Datas:** formato `DDMMAA`; dia 01–31, mês 01–12.
9. **Estrutura:** 1 Header + N Detalhes + 1 Trailer (nessa ordem).

---

## Diferenças-chave: Singulare CCB vs Paulista Remessa

| Característica | Paulista (611) | Singulare CCB (363) |
|---------------|---------------|---------------------|
| Tamanho aceito | 400 ou 444 | **Somente 444** |
| Nome Originador | 30 chars (pos 47–76) | **29 chars (pos 47–75)** |
| Sigla Banco | *(não existe)* | **pos 76 = `S`** |
| Nº Banco | `611` | **`363`** |
| Espécie principal | `01` Duplicata | **`70` CCB** |
| Sacado/Tomador | "Sacado" | **"Tomador"** (terminologia CCB) |
| Seq. Registro detalhe | pos 395–400 | **pos 439–444** |
| Chave NFe (pos 401–444) | 44 chars | **Substituído por Branco** |

---

*Documento gerado com base no arquivo `CB03056076.txt` e no validador `/validadores/singulare/ccb444`.*
