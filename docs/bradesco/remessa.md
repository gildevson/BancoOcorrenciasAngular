# Remessa CNAB 400 - Bradesco (237)

**Banco:** Bradesco  
**Codigo:** 237  
**Formato:** CNAB 400  
**Encoding:** ISO-8859-1  
**Tamanho por linha:** 400 caracteres  

---

## Estrutura do Arquivo

| Tipo | Identificador | Descricao | Quantidade |
|------|---------------|-----------|------------|
| 0 | Posicao 1 = `0` | Header | 1 (obrigatorio) |
| 1 | Posicao 1 = `1` | Detalhe (titulo) | 1 por titulo |
| 2 | Posicao 1 = `2` | Mensagens adicionais | Opcional (apos tipo 1) |
| 3 | Posicao 1 = `3` | Rateio de credito | Opcional |
| 6 | Posicao 1 = `6` | Debito automatico | Opcional |
| 7 | Posicao 1 = `7` | Beneficiario final | Opcional |
| 9 | Posicao 1 = `9` | Trailer | 1 (obrigatorio) |

---

## Header (Tipo 0) - 400 bytes

| # | Campo | Posicao | Tamanho | Tipo | Valor / Descricao |
|---|-------|---------|---------|------|-------------------|
| 1 | Tipo Registro | 1 | 1 | N | `0` |
| 2 | Ident. Arquivo | 2 | 1 | N | `1` (remessa) |
| 3 | Literal Remessa | 3-9 | 7 | A | `REMESSA` |
| 4 | Cod. Servico | 10-11 | 2 | N | `01` |
| 5 | Literal Servico | 12-26 | 15 | A | `COBRANCA` |
| 6 | Cod. Empresa | 27-46 | 20 | N | CNPJ/CPF da empresa |
| 7 | Nome Empresa | 47-76 | 30 | A | Razao social |
| 8 | Cod. Banco | 77-79 | 3 | N | `237` |
| 9 | Nome Banco | 80-94 | 15 | A | `BRADESCO` |
| 10 | Data Gravacao | 95-100 | 6 | N | DDMMAA |
| 11 | Brancos | 101-108 | 8 | A | Espacos em branco |
| 12 | Ident. Sistema | 109-110 | 2 | A | `MX` |
| 13 | Seq. Remessa | 111-117 | 7 | N | Numero sequencial da remessa |
| 14 | Brancos | 118-394 | 277 | A | Espacos em branco |
| 15 | Seq. Registro | 395-400 | 6 | N | `000001` |

---

## Detalhe (Tipo 1) - 400 bytes

| # | Campo | Posicao | Tamanho | Tipo | Valor / Descricao |
|---|-------|---------|---------|------|-------------------|
| 1 | Tipo Registro | 1 | 1 | N | `1` |
| 2 | Agencia Debito | 2-6 | 5 | N | Agencia do cedente |
| 3 | Digito Ag. | 7 | 1 | A | Digito verificador da agencia |
| 4 | Razao C/C | 8-12 | 5 | N | Razao da conta corrente |
| 5 | Conta Corrente | 13-19 | 7 | N | Numero da conta |
| 6 | Digito C/C | 20 | 1 | A | Digito verificador da conta |
| 7 | Ident. Empresa | 21-37 | 17 | A | Identificacao da empresa no banco |
| 8 | No Controle | 38-62 | 25 | A | Numero de controle interno |
| 9 | Cod. Banco | 63-65 | 3 | N | `237` |
| 10 | Multa | 66 | 1 | N | `0`=sem multa, `2`=com multa |
| 11 | % Multa | 67-70 | 4 | N | Percentual de multa (2 decimais) |
| 12 | Nosso Numero | 71-81 | 11 | N | Nosso numero (10 dig + 1 verificador) |
| 13 | Digito N/N | 82 | 1 | A | Digito do Nosso Numero |
| 14 | Desc. Bonif. | 83-92 | 10 | N | Desconto de bonificacao |
| 15 | Cond. Emissao | 93 | 1 | N | `1`=Banco emite, `2`=Cliente emite |
| 16 | Deb. Autom. | 94 | 1 | A | `N`=Nao, `S`=Sim |
| 17 | Brancos | 95-104 | 10 | A | Espacos em branco |
| 18 | Ind. Rateio | 105 | 1 | A | `R`=Rateio de credito |
| 19 | Enderecam. | 106 | 1 | N | Enderecamento para aviso |
| 20 | Qtd. Pag. | 107-108 | 2 | A | Quantidade de pagamentos |
| 21 | Ocorrencia | 109-110 | 2 | N | Codigo de ocorrencia/instrucao |
| 22 | No Documento | 111-120 | 10 | A | Numero do documento |
| 23 | Vencimento | 121-126 | 6 | N | DDMMAA |
| 24 | Valor Titulo | 127-139 | 13 | N | Valor em centavos |
| 25 | Banco Cobr. | 140-142 | 3 | N | `237` ou `000` |
| 26 | Agencia Dep. | 143-147 | 5 | N | Agencia depositaria |
| 27 | Especie | 148-149 | 2 | N | Especie do titulo |
| 28 | Aceite | 150 | 1 | A | `N`=Nao aceite |
| 29 | Data Emissao | 151-156 | 6 | N | DDMMAA |
| 30 | 1a Instrucao | 157-158 | 2 | N | Codigo de instrucao (ver tabela) |
| 31 | 2a Instrucao | 159-160 | 2 | N | Codigo de instrucao (ver tabela) |
| 32 | Mora/Dia | 161-173 | 13 | N | Valor de mora por dia em centavos |
| 33 | Data Desc. | 174-179 | 6 | N | DDMMAA (data limite de desconto) |
| 34 | Valor Desc. | 180-192 | 13 | N | Valor do desconto em centavos |
| 35 | Valor IOF | 193-205 | 13 | N | Valor do IOF em centavos |
| 36 | Abatimento | 206-218 | 13 | N | Valor de abatimento em centavos |
| 37 | Tipo Inscr. | 219-220 | 2 | N | `01`=CPF, `02`=CNPJ |
| 38 | CPF/CNPJ | 221-234 | 14 | N | CPF ou CNPJ do sacado |
| 39 | Nome Sacado | 235-274 | 40 | A | Nome do sacado |
| 40 | Endereco | 275-314 | 40 | A | Endereco do sacado |
| 41 | 1a Mensagem | 315-326 | 12 | A | Mensagem adicional |
| 42 | CEP | 327-331 | 5 | N | CEP do sacado |
| 43 | Sufixo CEP | 332-334 | 3 | N | Complemento do CEP |
| 44 | Benef. Final | 335-394 | 60 | A | Beneficiario final |
| 45 | Seq. Registro | 395-400 | 6 | N | Sequencial do registro |

---

## Tipo 2 - Mensagens Adicionais (Opcional)

| # | Campo | Posicao | Tamanho | Tipo | Valor / Descricao |
|---|-------|---------|---------|------|-------------------|
| 1 | Tipo Registro | 1 | 1 | N | `2` |
| 2 | Mensagem 1 | 2-81 | 80 | A | Texto livre |
| 3 | Mensagem 2 | 82-161 | 80 | A | Texto livre |
| 4 | Mensagem 3 | 162-241 | 80 | A | Texto livre |
| 5 | Mensagem 4 | 242-321 | 80 | A | Texto livre |
| 6 | Data Desc. 2 | 322-327 | 6 | N | DDMMAA |
| 7 | Valor Desc. 2 | 328-340 | 13 | N | Valor em centavos |
| 8 | Data Desc. 3 | 341-346 | 6 | N | DDMMAA |
| 9 | Valor Desc. 3 | 347-359 | 13 | N | Valor em centavos |
| 10 | Reserva | 360-366 | 7 | A | Espacos em branco |
| 11 | Carteira | 367-369 | 3 | N | Codigo da carteira |
| 12 | Agencia | 370-374 | 5 | N | Agencia |
| 13 | Conta Corrente | 375-381 | 7 | N | Conta corrente |
| 14 | Digito C/C | 382 | 1 | A | Digito verificador |
| 15 | Nosso Numero | 383-393 | 11 | N | Nosso numero |
| 16 | DAC Nosso Num. | 394 | 1 | A | Digito do Nosso Numero |
| 17 | Seq. Registro | 395-400 | 6 | N | Sequencial do registro |

---

## Tipo 3 - Rateio de Credito (Opcional)

Usado para distribuir o credito entre multiplos beneficiarios.

| # | Campo | Posicao | Tamanho | Tipo | Valor / Descricao |
|---|-------|---------|---------|------|-------------------|
| 1 | Tipo Registro | 1 | 1 | N | `3` |
| 2 | Cod. Banco Benef. 1 | 2-4 | 3 | N | Banco do 1o beneficiario |
| 3 | Agencia Benef. 1 | 5-9 | 5 | N | Agencia do 1o beneficiario |
| 4 | Digito Ag. 1 | 10 | 1 | A | Digito da agencia |
| 5 | Conta Benef. 1 | 11-18 | 8 | N | Conta do 1o beneficiario |
| 6 | Digito Cc. 1 | 19 | 1 | A | Digito da conta |
| 7 | Nom. Benef. 1 | 20-39 | 20 | A | Nome do 1o beneficiario |
| 8 | Valor Benef. 1 | 40-52 | 13 | N | Valor em centavos |
| 9 | Tipo Inscr. Benef. 1 | 53-54 | 2 | N | `01`=CPF, `02`=CNPJ |
| 10 | Inscricao Benef. 1 | 55-68 | 14 | N | CPF/CNPJ do beneficiario |
| ... | (repetir estrutura para 2o e 3o beneficiario) | | | | |
| N | Seq. Registro | 395-400 | 6 | N | Sequencial do registro |

---

## Tipo 6 - Debito Automatico (Opcional)

| # | Campo | Posicao | Tamanho | Tipo | Valor / Descricao |
|---|-------|---------|---------|------|-------------------|
| 1 | Tipo Registro | 1 | 1 | N | `6` |
| 2 | Agencia Debito | 2-6 | 5 | N | Agencia para debito |
| 3 | Conta Debito | 7-14 | 8 | N | Conta para debito |
| 4 | Digito C/C | 15 | 1 | A | Digito verificador |
| 5 | Cod. Banco Debito | 16-18 | 3 | N | Banco para debito |
| ... | (demais campos conforme manual) | | | | |
| N | Seq. Registro | 395-400 | 6 | N | Sequencial do registro |

---

## Tipo 7 - Beneficiario Final (Opcional)

| # | Campo | Posicao | Tamanho | Tipo | Valor / Descricao |
|---|-------|---------|---------|------|-------------------|
| 1 | Tipo Registro | 1 | 1 | N | `7` |
| 2 | Tipo Inscr. | 2-3 | 2 | N | `01`=CPF, `02`=CNPJ |
| 3 | CPF/CNPJ | 4-17 | 14 | N | CPF/CNPJ do beneficiario final |
| 4 | Nome | 18-57 | 40 | A | Nome do beneficiario final |
| ... | (demais campos conforme manual) | | | | |
| N | Seq. Registro | 395-400 | 6 | N | Sequencial do registro |

---

## Trailer (Tipo 9) - 400 bytes

| # | Campo | Posicao | Tamanho | Tipo | Valor / Descricao |
|---|-------|---------|---------|------|-------------------|
| 1 | Tipo Registro | 1 | 1 | N | `9` |
| 2 | Brancos | 2-394 | 393 | A | Espacos em branco |
| 3 | Seq. Registro | 395-400 | 6 | N | Ultimo sequencial |

---

## Codigos de Instrucao (1a e 2a instrucao — campos 157-158 e 159-160)

| Codigo | Descricao |
|--------|-----------|
| 01 | Remessa (envio de titulo) |
| 02 | Pedido de Baixa |
| 04 | Concessao de Abatimento |
| 05 | Cancelamento de Abatimento |
| 06 | Prorrogacao de Vencimento |
| 09 | Protestar |
| 10 | Sustar Protesto e Baixar |
| 11 | Sustar Protesto e Manter em Carteira |
| 12 | Alteracao de Juros de Mora |
| 13 | Cancelamento de Instrucao de Protesto/Negativacao |
| 19 | Prazo Limite de Recebimento — Alterar |
| 26 | Protesto Automatico |
| 29 | Negativacao Automatica |
| 31 | Alteracao de Outros Dados |

---

## Especies de Titulo (Campo 27 do Detalhe)

| Codigo | Descricao |
|--------|-----------|
| 01 | Duplicata Mercantil |
| 02 | Nota Promissoria |
| 03 | Nota de Seguro |
| 05 | Recibo |
| 06 | Letra de Cambio |
| 07 | Conta de Servico |
| 08 | Duplicata de Servico |
| 09 | Nota de Debito |
| 13 | Cheque |
| 17 | Fatura |
| 18 | Triplicata Mercantil |
| 19 | Triplicata de Servico |
| 31 | Boleto de Proposta |
| 99 | Outros |

---

## Notas

- **Encoding:** ISO-8859-1
- **Quebra de linha:** CRLF (`\r\n`)
- **Campos numericos:** zeros a esquerda, sem espacos
- **Campos alfanumericos:** espacos a direita, maiusculas
- **Sequencial:** inicia em `000001` no header e incrementa em cada linha
- **Nosso Numero:** calculado com modulo 11
- O tipo 2 deve imediatamente seguir o tipo 1 correspondente
- O tipo 3 (rateio) requer campo `Ind. Rateio = R` no detalhe correspondente
