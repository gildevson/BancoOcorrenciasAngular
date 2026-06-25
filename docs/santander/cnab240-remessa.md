# Remessa CNAB 240 — Santander (033)

**Banco:** Santander Brasil  
**Código COMPE:** 033  
**Formato:** CNAB 240  
**Encoding:** ISO-8859-1  
**Tamanho por linha:** 240 caracteres (fixo)  
**Terminador de linha:** CRLF (`\r\n`)  
**Versão do Layout:** 089 (FEBRABAN)

---

## Estrutura do Arquivo

| Tipo | Segmento | Descrição | Obrigatório |
|------|----------|-----------|-------------|
| 0 | — | Header de Arquivo | Sim (1 por arquivo) |
| 1 | — | Header de Lote | Sim (1 por lote) |
| 3 | P | Detalhe — Dados do Título | Sim (1 por boleto) |
| 3 | Q | Detalhe — Dados do Pagador | Sim (1 por boleto) |
| 3 | R | Detalhe — Informações Complementares | Opcional |
| 5 | — | Trailer de Lote | Sim (1 por lote) |
| 9 | — | Trailer de Arquivo | Sim (1 por arquivo) |

---

## Header de Arquivo (Tipo 0) — 240 bytes

| # | Campo | Posição | Tam | Tipo | Valor / Descrição |
|---|-------|---------|-----|------|-------------------|
| 1 | Código do Banco | 1–3 | 3 | N | `033` |
| 2 | Lote de Serviço | 4–7 | 4 | N | `0000` (header) |
| 3 | Tipo de Registro | 8 | 1 | N | `0` |
| 4 | Uso FEBRABAN | 9–17 | 9 | A | Brancos |
| 5 | Tipo de Inscrição | 18 | 1 | N | `1`=CPF · `2`=CNPJ |
| 6 | Número de Inscrição | 19–32 | 14 | N | CNPJ ou CPF |
| 7 | Código do Convênio | 33–52 | 20 | A | Código do cedente no Santander |
| 8 | Agência | 53–57 | 5 | N | Agência com dígito |
| 9 | Dígito Verificador Agência | 58 | 1 | A | Dígito |
| 10 | Conta Corrente | 59–70 | 12 | N | Conta sem dígito |
| 11 | Dígito Verificador Conta | 71 | 1 | A | Dígito |
| 12 | Dígito Ag/Conta | 72 | 1 | A | Dígito combinado |
| 13 | Nome da Empresa | 73–102 | 30 | A | Razão social do cedente |
| 14 | Nome do Banco | 103–132 | 30 | A | `SANTANDER` + brancos |
| 15 | Uso FEBRABAN | 133–142 | 10 | A | Brancos |
| 16 | Código Remessa/Retorno | 143 | 1 | N | `1` = Remessa |
| 17 | Data de Geração | 144–151 | 8 | N | DDMMAAAA |
| 18 | Hora de Geração | 152–157 | 6 | N | HHMMSS |
| 19 | Nº Sequencial do Arquivo | 158–163 | 6 | N | Sequencial crescente |
| 20 | Versão do Layout | 164–166 | 3 | N | `089` |
| 21 | Densidade de Gravação | 167–171 | 5 | N | `01600` ou `06250` |
| 22 | Uso Reservado do Banco | 172–191 | 20 | A | Brancos |
| 23 | Uso Reservado da Empresa | 192–211 | 20 | A | Brancos |
| 24 | Uso FEBRABAN | 212–240 | 29 | A | Brancos |

---

## Header de Lote (Tipo 1) — 240 bytes

| # | Campo | Posição | Tam | Tipo | Valor / Descrição |
|---|-------|---------|-----|------|-------------------|
| 1 | Código do Banco | 1–3 | 3 | N | `033` |
| 2 | Lote de Serviço | 4–7 | 4 | N | Número do lote (0001, 0002…) |
| 3 | Tipo de Registro | 8 | 1 | N | `1` |
| 4 | Tipo de Operação | 9 | 1 | A | `R` = Remessa |
| 5 | Tipo de Serviço | 10–11 | 2 | N | `01` = Cobrança |
| 6 | Forma de Lançamento | 12–13 | 2 | N | `01` = Crédito em C/C |
| 7 | Versão do Layout do Lote | 14–16 | 3 | N | `040` |
| 8 | Uso Banco | 17 | 1 | A | Branco |
| 9 | Tipo de Inscrição | 18 | 1 | N | `1`=CPF · `2`=CNPJ |
| 10 | Número de Inscrição | 19–32 | 14 | N | CNPJ ou CPF |
| 11 | Código do Convênio | 33–52 | 20 | A | Código do cedente |
| 12 | Agência | 53–57 | 5 | N | Agência |
| 13 | Dígito Agência | 58 | 1 | A | Dígito verificador |
| 14 | Conta Corrente | 59–70 | 12 | N | Conta |
| 15 | Dígito Conta | 71 | 1 | A | Dígito verificador |
| 16 | Dígito Ag/Conta | 72 | 1 | A | Dígito combinado |
| 17 | Nome da Empresa | 73–102 | 30 | A | Razão social |
| 18 | Informação 1 | 103–142 | 40 | A | Mensagem/informação livre |
| 19 | Informação 2 | 143–182 | 40 | A | Mensagem/informação livre |
| 20 | Nº da Remessa | 183–192 | 10 | N | Sequencial da remessa |
| 21 | Data de Gravação | 193–200 | 8 | N | DDMMAAAA |
| 22 | Data do Crédito | 201–208 | 8 | N | DDMMAAAA |
| 23 | Uso Banco | 209–240 | 32 | A | Brancos |

---

## Segmento P (Tipo 3) — Dados do Título — 240 bytes

| # | Campo | Posição | Tam | Tipo | Valor / Descrição |
|---|-------|---------|-----|------|-------------------|
| 1 | Código do Banco | 1–3 | 3 | N | `033` |
| 2 | Lote de Serviço | 4–7 | 4 | N | Número do lote |
| 3 | Tipo de Registro | 8 | 1 | N | `3` |
| 4 | Nº Seq. Reg. no Lote | 9–13 | 5 | N | Sequencial dentro do lote |
| 5 | Segmento | 14 | 1 | A | `P` |
| 6 | Uso Banco | 15 | 1 | A | Branco |
| 7 | Código do Movimento | 16–17 | 2 | N | `01`=Entrada, `02`=Baixa, `06`=Alt. Venc., etc. |
| 8 | Agência | 18–22 | 5 | N | Agência do cedente |
| 9 | Dígito Agência | 23 | 1 | A | Dígito verificador |
| 10 | Conta Corrente | 24–35 | 12 | N | Conta do cedente |
| 11 | Dígito Conta | 36 | 1 | A | Dígito verificador |
| 12 | Dígito Ag/Conta | 37 | 1 | A | Dígito combinado |
| 13 | Nosso Número | 38–57 | 20 | N | Nosso número completo |
| 14 | Código da Carteira | 58 | 1 | N | Carteira de cobrança |
| 15 | Forma de Cadastro do Título | 59 | 1 | N | `1`=Com registro · `2`=Sem registro |
| 16 | Tipo de Documento | 60 | 1 | N | `1`=Tradicional · `2`=Escritural |
| 17 | Emissão do Bloqueto | 61 | 1 | N | `1`=Banco emite · `2`=Empresa emite |
| 18 | Distribuição do Bloqueto | 62 | 1 | N | `1`=Banco distribui · `2`=Empresa distribui |
| 19 | Número do Documento | 63–77 | 15 | A | Número do documento (Seu Número) |
| 20 | Data de Vencimento | 78–85 | 8 | N | DDMMAAAA |
| 21 | Valor Nominal do Título | 86–100 | 15 | N | Centavos (sem vírgula) |
| 22 | Agência Cobradora | 101–105 | 5 | N | `00033` = Santander |
| 23 | Dígito Agência Cobradora | 106 | 1 | A | Branco |
| 24 | Espécie do Título | 107–108 | 2 | N | Ver tabela de espécies |
| 25 | Aceite | 109 | 1 | A | `A`=Aceite · `N`=Não aceite |
| 26 | Data de Emissão | 110–117 | 8 | N | DDMMAAAA |
| 27 | Código 1ª Instrução | 118–119 | 2 | N | Ver tabela de instruções |
| 28 | Código 2ª Instrução | 120–121 | 2 | N | Ver tabela de instruções |
| 29 | Valor de Mora/Juros | 122–134 | 13 | N | Centavos por dia |
| 30 | Data Limite para Desconto | 135–142 | 8 | N | DDMMAAAA (`00000000` = sem desconto) |
| 31 | Valor do Desconto 1 | 143–157 | 15 | N | Centavos |
| 32 | Valor do IOF | 158–172 | 15 | N | Centavos |
| 33 | Valor do Abatimento | 173–187 | 15 | N | Centavos |
| 34 | ID do Título na Empresa | 188–202 | 15 | A | Identificação opcional |
| 35 | Código para Protesto | 203 | 1 | N | `1`=Protestar, `2`=Devolver, `3`=Não protestar |
| 36 | Prazo para Protesto | 204–205 | 2 | N | Nº de dias |
| 37 | Código Baixa/Devolução | 206 | 1 | N | `1`=Baixar, `2`=Devolver |
| 38 | Prazo para Baixa | 207–209 | 3 | N | Nº de dias |
| 39 | Código da Moeda | 210–212 | 3 | N | `009` = Real |
| 40 | Número do Contrato | 213–222 | 10 | N | Nº do contrato (opcional) |
| 41 | Uso Banco | 223 | 1 | A | Branco |
| 42 | Uso Banco | 224–240 | 17 | A | Brancos |

---

## Segmento Q (Tipo 3) — Dados do Pagador — 240 bytes

| # | Campo | Posição | Tam | Tipo | Valor / Descrição |
|---|-------|---------|-----|------|-------------------|
| 1 | Código do Banco | 1–3 | 3 | N | `033` |
| 2 | Lote de Serviço | 4–7 | 4 | N | Número do lote |
| 3 | Tipo de Registro | 8 | 1 | N | `3` |
| 4 | Nº Seq. Reg. no Lote | 9–13 | 5 | N | Sequencial no lote |
| 5 | Segmento | 14 | 1 | A | `Q` |
| 6 | Uso Banco | 15 | 1 | A | Branco |
| 7 | Código do Movimento | 16–17 | 2 | N | Mesmo do Seg. P |
| 8 | Tipo de Inscrição Pagador | 18 | 1 | N | `1`=CPF · `2`=CNPJ |
| 9 | CNPJ/CPF do Pagador | 19–32 | 14 | N | CNPJ ou CPF |
| 10 | Nome do Pagador | 33–72 | 40 | A | Nome / Razão social |
| 11 | Endereço do Pagador | 73–112 | 40 | A | Logradouro e número |
| 12 | Bairro do Pagador | 113–127 | 15 | A | Bairro |
| 13 | CEP do Pagador | 128–132 | 5 | N | Parte inicial do CEP |
| 14 | Sufixo CEP | 133–135 | 3 | N | Complemento do CEP |
| 15 | Cidade do Pagador | 136–150 | 15 | A | Cidade |
| 16 | UF do Pagador | 151–152 | 2 | A | Sigla do estado |
| 17 | Tipo de Inscrição Sacador | 153 | 1 | N | `0`=Isento · `1`=CPF · `2`=CNPJ |
| 18 | CNPJ/CPF do Sacador | 154–167 | 14 | N | Se houver sacador/avalista |
| 19 | Nome do Sacador/Avalista | 168–207 | 40 | A | Nome do sacador (se houver) |
| 20 | Cód. Banco Correspondente | 208–210 | 3 | N | Banco correspondente (se houver) |
| 21 | Nosso Nº Banco Correspondente | 211–232 | 22 | A | Nosso número no banco corr. |
| 22 | Uso FEBRABAN | 233–240 | 8 | A | Brancos |

---

## Segmento R (Tipo 3) — Informações Complementares — 240 bytes

| # | Campo | Posição | Tam | Tipo | Valor / Descrição |
|---|-------|---------|-----|------|-------------------|
| 1 | Código do Banco | 1–3 | 3 | N | `033` |
| 2 | Lote | 4–7 | 4 | N | Número do lote |
| 3 | Tipo de Registro | 8 | 1 | N | `3` |
| 4 | Nº Seq. Reg. no Lote | 9–13 | 5 | N | Sequencial |
| 5 | Segmento | 14 | 1 | A | `R` |
| 6 | Uso Banco | 15 | 1 | A | Branco |
| 7 | Código do Movimento | 16–17 | 2 | N | Mesmo do Seg. P |
| 8 | Código do Desconto 2 | 18 | 1 | N | `0`=Sem · `1`=Valor fixo · `2`=Percentual |
| 9 | Data do Desconto 2 | 19–26 | 8 | N | DDMMAAAA |
| 10 | Valor do Desconto 2 | 27–41 | 15 | N | Centavos |
| 11 | Código do Desconto 3 | 42 | 1 | N | `0`=Sem · `1`=Valor fixo · `2`=Percentual |
| 12 | Data do Desconto 3 | 43–50 | 8 | N | DDMMAAAA |
| 13 | Valor do Desconto 3 | 51–65 | 15 | N | Centavos |
| 14 | Código da Multa | 66 | 1 | N | `0`=Sem multa · `1`=Valor fixo · `2`=Percentual |
| 15 | Data da Multa | 67–74 | 8 | N | DDMMAAAA |
| 16 | Valor da Multa | 75–89 | 15 | N | Centavos ou percentual |
| 17 | Informação ao Pagador | 90–99 | 10 | A | Mensagem livre |
| 18 | Informação ao Pagador 2 | 100–139 | 40 | A | Mensagem livre |
| 19 | Informação ao Pagador 3 | 140–179 | 40 | A | Mensagem livre |
| 20 | Uso Banco | 180–199 | 20 | A | Brancos |
| 21 | Cód. Ocorrência do Pagador | 200–207 | 8 | A | Uso banco |
| 22 | Banco para Débito | 208–210 | 3 | N | Banco para débito automático |
| 23 | Agência para Débito | 211–215 | 5 | N | Agência débito automático |
| 24 | Dígito Agência Débito | 216 | 1 | A | Dígito |
| 25 | Conta para Débito | 217–228 | 12 | N | Conta para débito automático |
| 26 | Dígito Conta Débito | 229 | 1 | A | Dígito |
| 27 | Dígito Ag/Conta Débito | 230 | 1 | A | Dígito |
| 28 | Aviso ao Debitado | 231 | 1 | N | `0`=Sem aviso |
| 29 | Uso FEBRABAN | 232–240 | 9 | A | Brancos |

---

## Trailer de Lote (Tipo 5) — 240 bytes

| # | Campo | Posição | Tam | Tipo | Valor / Descrição |
|---|-------|---------|-----|------|-------------------|
| 1 | Código do Banco | 1–3 | 3 | N | `033` |
| 2 | Lote de Serviço | 4–7 | 4 | N | Número do lote |
| 3 | Tipo de Registro | 8 | 1 | N | `5` |
| 4 | Uso Banco | 9–17 | 9 | A | Brancos |
| 5 | Qtd. Registros do Lote | 18–23 | 6 | N | Total de registros tipo 3 + 2 (header + trailer) |
| 6 | Qtd. Títulos Cobrança | 24–29 | 6 | N | Total de títulos |
| 7 | Valor Total dos Títulos | 30–47 | 18 | N | Soma dos valores em centavos |
| 8 | Qtd. Moeda | 48–65 | 18 | N | Zero |
| 9 | Nº do Aviso de Lançamento | 66–77 | 12 | N | Zero |
| 10 | Uso FEBRABAN | 78–230 | 153 | A | Brancos |
| 11 | Ocorrências | 231–240 | 10 | A | Brancos |

---

## Trailer de Arquivo (Tipo 9) — 240 bytes

| # | Campo | Posição | Tam | Tipo | Valor / Descrição |
|---|-------|---------|-----|------|-------------------|
| 1 | Código do Banco | 1–3 | 3 | N | `033` |
| 2 | Lote de Serviço | 4–7 | 4 | N | `9999` |
| 3 | Tipo de Registro | 8 | 1 | N | `9` |
| 4 | Uso FEBRABAN | 9–17 | 9 | A | Brancos |
| 5 | Qtd. de Lotes | 18–23 | 6 | N | Total de lotes |
| 6 | Qtd. de Registros | 24–29 | 6 | N | Total de registros do arquivo |
| 7 | Qtd. de Contas | 30–35 | 6 | N | Zero |
| 8 | Uso FEBRABAN | 36–240 | 205 | A | Brancos |

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
| 07 | Letra de Câmbio |
| 08 | Nota de Débito |
| 09 | Duplicata de Serviço |
| 13 | Nota de Débito |
| 14 | Triplicata Mercantil |
| 15 | Triplicata de Serviço |
| 16 | Nota de Parcelamento |
| 17 | Fatura |
| 18 | Nota Fiscal |
| 19 | Boleto de Proposta |
| 31 | Cartão de Crédito |
| 32 | Boleto de Seguro |
| 33 | Boleto de Assinatura |
| 99 | Outros |

---

## Tabela de Códigos de Movimento (Instrução Remessa)

| Código | Descrição |
|--------|-----------|
| 01 | Remessa (Entrada) |
| 02 | Pedido de Baixa |
| 03 | Pedido de Débito em Conta |
| 04 | Concessão de Abatimento |
| 05 | Cancelamento de Abatimento |
| 06 | Alteração de Vencimento |
| 07 | Concessão de Desconto |
| 08 | Cancelamento de Desconto |
| 09 | Protestar |
| 10 | Sustação / Cancelamento de Protesto |
| 11 | Devolver / Não Protestar |
| 12 | Alteração de Juros de Mora |
| 13 | Cancelamento de Juros de Mora |
| 14 | Alteração do Valor Nominal do Título |
| 15 | Pedido de Negativação |
| 16 | Exclusão de Negativação Pendente |
| 17 | Alteração de Outros Dados |
| 19 | Confirmar Recebimento de Instrução de Não Protestar |
| 23 | Transferência de Carteira/Modalidade |
| 31 | Averbação do Penhor Rural / Animais |
| 40 | Alteração de Carteira |
| 41 | Cancelamento de Negativação |
| 68 | Acerto dos Dados do Rateio de Crédito |
| 69 | Cancelamento dos Dados do Rateio de Crédito |

---

## Tabela de Instruções (Campos Código 1ª e 2ª Instrução)

| Código | Descrição |
|--------|-----------|
| 00 | Sem Instrução |
| 02 | Lançar Mora Diária de R$ |
| 04 | Cobrar Mora: % ao Mês |
| 06 | Não Cobrar Juros de Mora |
| 07 | Não Aceitar o Título Vencido |
| 08 | Negativar Automaticamente (Nº Dias) |
| 09 | Não Negativar |
| 23 | Não Cobrar Multa |
| 24 | Cobrar Multa de % |
| 25 | Cobrar Multa de R$ |
| 43 | Protestar Após N Dias Corridos do Vencimento |
| 44 | Protestar Após N Dias Úteis do Vencimento |
| 45 | Não Protestar |
| 46 | Devolver Após N Dias Corridos do Vencimento |
| 47 | Devolver Após N Dias Úteis do Vencimento |

---

## Observações

- Campos alfanuméricos (A): alinhados à **esquerda**, completados com **espaços** à direita.
- Campos numéricos (N): alinhados à **direita**, completados com **zeros** à esquerda.
- A ordem dos segmentos dentro do lote deve ser sempre P → Q → R (R é opcional).
- O **Nosso Número** no Segmento P deve ter 20 posições; o Santander utiliza o formato: `000` + carteira (3) + nosso número sequencial (7) + dígito (1) + brancos.
- Arquivos devem ser gerados em **ISO-8859-1** (Latin-1), nunca UTF-8.
- O campo **Versão do Layout** deve ser `089` para CNAB 240 FEBRABAN versão atual.
