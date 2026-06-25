# Remessa CNAB 400 — Santander (033)

**Banco:** Santander Brasil  
**Código COMPE:** 033  
**Formato:** CNAB 400  
**Encoding:** ISO-8859-1  
**Tamanho por linha:** 400 caracteres (fixo)  
**Terminador de linha:** CRLF (`\r\n`)  
**Referência:** Layout de Cobrança CNAB 400 — Santander (jul/2025)

---

## Estrutura do Arquivo

| Tipo | Identificador | Descrição | Quantidade |
|------|--------------|-----------|------------|
| 0 | Posição 1 = `0` | Header | 1 (obrigatório) |
| 1 | Posição 1 = `1` | Detalhe (título) | 1 por boleto |
| 9 | Posição 1 = `9` | Trailer | 1 (obrigatório) |

> O Santander CNAB 400 **não utiliza** registro Tipo 2 (mensagens) nesta versão.

---

## Header (Tipo 0) — 400 bytes

| # | Campo | Posição | Tam | Tipo | Valor / Descrição |
|---|-------|---------|-----|------|-------------------|
| 1 | Tipo Registro | 1 | 1 | N | `0` |
| 2 | Ident. Arquivo Remessa | 2 | 1 | N | `1` (remessa) |
| 3 | Literal Remessa | 3–9 | 7 | A | `REMESSA` |
| 4 | Código de Serviço | 10–11 | 2 | N | `01` |
| 5 | Literal Serviço | 12–19 | 8 | A | `COBRANCA` |
| 6 | Branco | 20–26 | 7 | A | Espaços em branco |
| 7 | Agência Cedente | 27–30 | 4 | N | Número da agência (sem dígito) |
| 8 | Dígito da Agência | 31 | 1 | A | Dígito verificador da agência |
| 9 | Conta Corrente | 32–37 | 6 | N | Número da conta (sem dígito) |
| 10 | Dígito da Conta | 38 | 1 | A | Dígito verificador da conta |
| 11 | Branco | 39 | 1 | A | Espaço em branco |
| 12 | Código do Cedente | 40–46 | 7 | N | Código fornecido pelo Santander |
| 13 | Nome da Empresa | 47–76 | 30 | A | Razão social do cedente |
| 14 | Código do Banco | 77–79 | 3 | N | `033` |
| 15 | Nome do Banco | 80–94 | 15 | A | `SANTANDER` + espaços |
| 16 | Data de Geração | 95–100 | 6 | N | DDMMAA |
| 17 | Nº Sequencial de Remessa | 101–107 | 7 | N | Sequencial do arquivo (incrementa a cada remessa) |
| 18 | Branco | 108–394 | 287 | A | Espaços em branco |
| 19 | Nº Sequencial do Registro | 395–400 | 6 | N | `000001` (fixo no header) |

---

## Detalhe (Tipo 1) — 400 bytes

| # | Campo | Posição | Tam | Tipo | Valor / Descrição |
|---|-------|---------|-----|------|-------------------|
| 1 | Tipo Registro | 1 | 1 | N | `1` |
| 2 | Tipo Inscrição Empresa | 2–3 | 2 | N | `01`=CPF · `02`=CNPJ |
| 3 | Nº Inscrição Empresa (CNPJ/CPF) | 4–17 | 14 | N | CNPJ (14 dígitos) ou CPF zerado à esq. |
| 4 | Agência | 18–21 | 4 | N | Agência do cedente |
| 5 | Dígito da Agência | 22 | 1 | A | Dígito verificador |
| 6 | Conta Corrente | 23–28 | 6 | N | Conta do cedente |
| 7 | Dígito da Conta | 29 | 1 | A | Dígito verificador |
| 8 | Branco | 30–31 | 2 | A | Espaços em branco |
| 9 | Nosso Número | 32–38 | 7 | N | Nosso número sem dígito |
| 10 | Dígito do Nosso Número | 39 | 1 | A | Dígito verificador do nosso número |
| 11 | Branco | 40 | 1 | A | Espaço em branco |
| 12 | Carteira | 41 | 1 | A | Código da carteira de cobrança |
| 13 | Variação da Carteira | 42–45 | 4 | N | Variação (quando aplicável) |
| 14 | Nº do Documento (Empresa) | 46–62 | 17 | A | Número do documento do cedente |
| 15 | Cond. Emissão Papeleta | 63 | 1 | N | `1`=banco emite · `2`=cliente emite · `4`=banco emite pré-datado |
| 16 | Ident. Emissão Bloqueto p/ Débito Automático | 64 | 1 | N | `1`=emite · `2`=não emite |
| 17 | Uso do Banco | 65–72 | 8 | A | Branco / uso interno |
| 18 | Nº do Documento (Complemento) | 73–92 | 20 | A | Nº complementar do documento |
| 19 | Data de Vencimento | 93–98 | 6 | N | DDMMAA |
| 20 | Valor do Título | 99–111 | 13 | N | Valor em centavos (sem vírgula) |
| 21 | Banco Cobrador | 112–114 | 3 | N | `033` = Santander |
| 22 | Agência Cobradora | 115–119 | 5 | N | Agência responsável pela cobrança |
| 23 | Espécie do Título | 120–121 | 2 | N | Ver tabela de espécies abaixo |
| 24 | Identificação | 122 | 1 | A | `N`=novo · `R`=renovação |
| 25 | Data de Emissão | 123–128 | 6 | N | DDMMAA |
| 26 | 1ª Instrução | 129–130 | 2 | N | Ver tabela de instruções abaixo |
| 27 | 2ª Instrução | 131–132 | 2 | N | Ver tabela de instruções abaixo |
| 28 | Valor de Mora por Dia | 133–139 | 7 | N | Centavos por dia de atraso |
| 29 | Data Limite para Desconto | 140–145 | 6 | N | DDMMAA (`000000` = sem desconto) |
| 30 | Valor do Desconto | 146–152 | 7 | N | Centavos (`0000000` = sem desconto) |
| 31 | Valor do IOF | 153–165 | 13 | N | Centavos (`0000000000000` = sem IOF) |
| 32 | Valor do Abatimento | 166–178 | 13 | N | Centavos (`0000000000000` = sem abatimento) |
| 33 | Tipo Inscrição Pagador | 179–180 | 2 | N | `01`=CPF · `02`=CNPJ |
| 34 | Nº Inscrição Pagador (CNPJ/CPF) | 181–194 | 14 | N | CNPJ ou CPF do pagador |
| 35 | Nome do Pagador | 195–234 | 40 | A | Nome / Razão social |
| 36 | Endereço do Pagador | 235–274 | 40 | A | Logradouro completo |
| 37 | Bairro do Pagador | 275–284 | 10 | A | Bairro |
| 38 | CEP | 285–289 | 5 | N | Parte inicial do CEP |
| 39 | Sufixo do CEP | 290–292 | 3 | N | Complemento do CEP |
| 40 | Cidade do Pagador | 293–302 | 10 | A | Cidade |
| 41 | UF do Pagador | 303–304 | 2 | A | Estado (sigla) |
| 42 | Sacador/Avalista ou Uso do Banco | 305–394 | 90 | A | Nome do sacador/avalista ou brancos |
| 43 | Nº Sequencial do Registro | 395–400 | 6 | N | Sequencial crescente (000002 em diante) |

---

## Trailer (Tipo 9) — 400 bytes

| # | Campo | Posição | Tam | Tipo | Valor / Descrição |
|---|-------|---------|-----|------|-------------------|
| 1 | Tipo Registro | 1 | 1 | N | `9` |
| 2 | Qtd. Registros de Detalhe | 2–7 | 6 | N | Total de registros tipo 1 |
| 3 | Valor Total dos Títulos | 8–20 | 13 | N | Soma dos valores em centavos |
| 4 | Branco | 21–394 | 374 | A | Espaços em branco |
| 5 | Nº Sequencial do Registro | 395–400 | 6 | N | Sequencial do último registro |

---

## Tabela de Espécies do Título

| Código | Descrição |
|--------|-----------|
| 01 | Duplicata Mercantil |
| 02 | Nota Promissória |
| 03 | Nota de Seguro |
| 04 | Mensalidade Escolar |
| 05 | Recibo |
| 06 | Contrato |
| 07 | Cosseguro |
| 08 | Duplicata de Serviços |
| 09 | Letra de Câmbio |
| 13 | Nota de Débito |
| 15 | Documento de Dívida |
| 16 | Encargos Condominiais |
| 17 | Conta de Prestação de Serviços |
| 19 | Boleto de Proposta |
| 20 | Apólice de Seguros |
| 99 | Outros |

---

## Tabela de Instruções (1ª e 2ª Instrução)

| Código | Descrição |
|--------|-----------|
| 00 | Sem instrução |
| 01 | Protestar após N dias corridos do vencimento |
| 02 | Devolver após N dias corridos do vencimento |
| 04 | Não protestar |
| 07 | Protestar após N dias úteis do vencimento |
| 08 | Negativar |
| 09 | Não negativar |
| 12 | Alteração de vencimento |
| 18 | Sustar protesto e dar baixa |
| 19 | Sustar protesto e manter em carteira |
| 23 | Não cobrar juros de mora |
| 25 | Dispensar prazo limite de protesto |
| 38 | Protestar título vencido |

> **Nota:** Quando a 1ª instrução for `01` (protestar), o campo **2ª instrução** deve conter o número de dias para o protesto.

---

## Observações

- Campos alfanuméricos (A): alinhados à **esquerda**, completados com **espaços** à direita.
- Campos numéricos (N): alinhados à **direita**, completados com **zeros** à esquerda.
- O campo **Nosso Número** é atribuído pelo cedente e deve ser único por convênio.
- O **Código do Cedente** (posições 40–46) é fornecido pelo Santander no momento do credenciamento.
- Para títulos sem desconto, preencher **Data Limite** com `000000` e **Valor do Desconto** com `0000000`.
- Arquivos devem ser gerados em encoding **ISO-8859-1** (Latin-1), não UTF-8.

---

## Exemplo de Header

```
0REMESSA01COBRANCA       0001 123456 7654321EMPRESA TESTE SA         033SANTANDER    2507250000001                                                                                                                                                                                                                                   000001
```

*(posições comprimidas para ilustração — em produção são exatamente 400 caracteres)*
