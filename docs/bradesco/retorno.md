# Retorno CNAB 400 - Bradesco (237)

**Banco:** Bradesco  
**Codigo:** 237  
**Formato:** CNAB 400  
**Encoding:** ISO-8859-1  
**Tamanho por linha:** 400 caracteres  

---

## Estrutura do Arquivo

| Tipo | Identificador | Descricao | Quantidade |
|------|---------------|-----------|------------|
| 02 | Pos 1 = `0`, Pos 2 = `2` | Header Retorno | 1 (obrigatorio) |
| 1 | Posicao 1 = `1` | Detalhe (titulo) | 1 por titulo |
| 3 | Posicao 1 = `3` | Rateio de credito | Opcional |
| 92 | Pos 1 = `9`, Pos 2 = `2` | Trailer Retorno | 1 (obrigatorio) |

---

## Header (Tipo 02) - 400 bytes

| # | Campo | Posicao | Tamanho | Tipo | Valor / Descricao |
|---|-------|---------|---------|------|-------------------|
| 1 | Tipo Registro | 1 | 1 | N | `0` |
| 2 | Ident. Retorno | 2 | 1 | N | `2` (retorno) |
| 3 | Literal Retorno | 3-9 | 7 | A | `RETORNO` |
| 4 | Cod. Servico | 10-11 | 2 | N | `01` |
| 5 | Literal Servico | 12-26 | 15 | A | `COBRANCA` |
| 6 | Cod. Empresa | 27-46 | 20 | N | CNPJ/CPF da empresa |
| 7 | Nome Empresa | 47-76 | 30 | A | Razao social |
| 8 | Cod. Banco | 77-79 | 3 | N | `237` |
| 9 | Nome Banco | 80-94 | 15 | A | `BRADESCO` |
| 10 | Data Geracao | 95-100 | 6 | N | DDMMAA |
| 11 | Densidade | 101-108 | 8 | N | Densidade de gravacao |
| 12 | No Aviso | 109-113 | 5 | N | Numero do aviso bancario |
| 13 | Brancos | 114-379 | 266 | A | Espacos em branco |
| 14 | Data Credito | 380-385 | 6 | N | DDMMAA data de credito |
| 15 | Brancos | 386-394 | 9 | A | Espacos em branco |
| 16 | Seq. Registro | 395-400 | 6 | N | `000001` |

---

## Detalhe (Tipo 1) - 400 bytes

| # | Campo | Posicao | Tamanho | Tipo | Valor / Descricao |
|---|-------|---------|---------|------|-------------------|
| 1 | Tipo Registro | 1 | 1 | N | `1` |
| 2 | Agencia Cedente | 2-6 | 5 | N | Agencia do cedente |
| 3 | Digito Ag. | 7 | 1 | A | Digito verificador da agencia |
| 4 | Razao C/C | 8-12 | 5 | N | Razao da conta corrente |
| 5 | Conta Corrente | 13-19 | 7 | N | Numero da conta |
| 6 | Digito C/C | 20 | 1 | A | Digito verificador da conta |
| 7 | Ident. Empresa | 21-37 | 17 | A | Identificacao da empresa no banco |
| 8 | No Controle | 38-62 | 25 | A | Numero de controle da empresa |
| 9 | Nosso Numero | 71-81 | 11 | N | Nosso numero original da remessa |
| 10 | Brancos | 82-107 | 26 | A | Espacos em branco |
| 11 | Cod. Ocorrencia | 109-110 | 2 | N | Codigo da ocorrencia (ver tabela) |
| 12 | Data Ocorrencia | 111-116 | 6 | N | DDMMAA |
| 13 | No Documento | 117-126 | 10 | A | Numero do documento |
| 14 | Confirmacao N/N | 127-138 | 12 | N | Confirmacao do Nosso Numero |
| 15 | Brancos | 139-146 | 8 | A | Espacos em branco |
| 16 | Carteira | 147-149 | 3 | N | Codigo da carteira |
| 17 | Especie | 150-151 | 2 | N | Especie do titulo |
| 18 | Data Vencimento | 152-157 | 6 | N | DDMMAA |
| 19 | Valor Titulo | 158-170 | 13 | N | Valor do titulo em centavos |
| 20 | Banco Cobrador | 171-173 | 3 | N | Codigo do banco cobrador |
| 21 | Agencia Cobr. | 174-178 | 5 | N | Agencia cobradora |
| 22 | Digito Ag. Cobr. | 179 | 1 | A | Digito da agencia cobradora |
| 23 | Data Credito | 180-185 | 6 | N | DDMMAA data de credito |
| 24 | No Instrucao | 186-187 | 2 | N | Numero da instrucao rejeitada |
| 25 | Mora Aplicada | 188-200 | 13 | N | Valor da mora em centavos |
| 26 | Data Outro Credito | 201-206 | 6 | N | DDMMAA |
| 27 | Desconto | 207-219 | 13 | N | Valor do desconto em centavos |
| 28 | Desconto Bonif. | 220-232 | 13 | N | Valor do desconto bonificacao |
| 29 | Abatimento | 233-245 | 13 | N | Valor do abatimento em centavos |
| 30 | IOF | 246-258 | 13 | N | Valor do IOF em centavos |
| 31 | Valor Pago | 259-271 | 13 | N | Valor efetivamente pago em centavos |
| 32 | Despesas | 272-284 | 13 | N | Despesas de cobranca em centavos |
| 33 | Outros Creditos | 285-297 | 13 | N | Outros creditos em centavos |
| 34 | Brancos | 298-317 | 20 | A | Espacos em branco |
| 35 | Motivos Rejeicao | 319-328 | 10 | A | Codigos de motivo de rejeicao |
| 36 | No Cartorio | 369-370 | 2 | N | Numero do cartorio |
| 37 | No Protocolo | 371-380 | 10 | N | Numero do protocolo |
| 38 | Brancos | 381-394 | 14 | A | Espacos em branco |
| 39 | Seq. Registro | 395-400 | 6 | N | Sequencial do registro |

---

## Trailer (Tipo 92) - 400 bytes

| # | Campo | Posicao | Tamanho | Tipo | Valor / Descricao |
|---|-------|---------|---------|------|-------------------|
| 1 | Tipo Registro | 1 | 1 | N | `9` |
| 2 | Ident. Retorno | 2 | 1 | N | `2` |
| 3 | Cod. Banco | 3-5 | 3 | N | `237` |
| 4 | Cod. Empresa | 6-17 | 12 | N | CNPJ/CPF da empresa |
| 5 | Brancos | 18-24 | 7 | A | Espacos em branco |
| 6 | Qtd. Titulos | 18-25 | 8 | N | Total de registros tipo 1 |
| 7 | Valor Total | 26-39 | 14 | N | Soma dos valores em centavos |
| 8 | Aviso Bancario | 40-47 | 8 | N | Numero do aviso bancario |
| 9 | Brancos | 48-56 | 9 | A | Espacos em branco |
| 10 | Qtd. Oc. 02 | 58-62 | 5 | N | Quantidade de registros ocorrencia 02 |
| 11 | Valor Oc. 02 | 63-74 | 12 | N | Valor total ocorrencia 02 em centavos |
| 12 | Brancos | 75-394 | 320 | A | Espacos em branco |
| 13 | Seq. Registro | 395-400 | 6 | N | Ultimo sequencial |

---

## Codigos de Ocorrencia no Retorno

| Codigo | Descricao |
|--------|-----------|
| 02 | Entrada Confirmada |
| 03 | Entrada Rejeitada |
| 06 | Liquidacao Normal |
| 07 | Liquidacao Parcial |
| 09 | Baixa por Comando do Cliente |
| 10 | Baixado Conforme Instrucoes da Agencia |
| 11 | Em Ser (Titulos em Aberto) |
| 12 | Abatimento Concedido |
| 13 | Abatimento Cancelado |
| 14 | Vencimento Alterado |
| 17 | Liquidacao apos Baixa |
| 19 | Confirmacao de Instrucao de Protesto |
| 20 | Confirmacao de Sustacao de Protesto |
| 21 | Remessa a Cartorio |
| 22 | Instrucao Rejeitada |
| 25 | Confirmacao de Negativacao |
| 26 | Confirmacao de Sustacao de Negativacao |
| 28 | Debito de Custas de Protesto |

---

## Motivos de Rejeicao (Ocorrencia 03)

| Codigo | Descricao |
|--------|-----------|
| 01 | Codigo do banco invalido |
| 02 | Codigo do registro detalhe invalido |
| 03 | Cod. do segmento invalido |
| 04 | Codigo do movimento nao permitido p/ carteira |
| 05 | Codigo do movimento invalido |
| 06 | Tipo/Num. inscricao do beneficiario invalidos |
| 07 | Agencia/conta/digito invalidos |
| 08 | Nosso numero invalido |
| 09 | Nosso numero duplicado |
| 10 | Carteira invalida |
| 11 | Forma de cadastramento do titulo invalida |
| 12 | Tipo de documento invalido |
| 13 | Identificacao da emissao do boleto invalida |
| 14 | Identificacao da distribuicao invalida |
| 15 | Caracteristicas da cobranca incompativeis |
| 16 | Data de vencimento invalida |
| 17 | Data de vencimento anterior a data de emissao |
| 18 | Vencimento fora do prazo operacional |
| 19 | Titulo a cargo de bancos correspondentes com vencimento inferior a XX dias |
| 20 | Valor do titulo invalido |
| 21 | Especie do titulo invalida |
| 22 | Especie nao permitida para a carteira |
| 24 | Data de emissao invalida |

---

## Notas

- **Encoding:** ISO-8859-1
- **Quebra de linha:** CRLF (`\r\n`)
- **Campos numericos:** zeros a esquerda, sem espacos
- **Campos alfanumericos:** espacos a direita, maiusculas
- **Sequencial:** inicia em `000001` no header e incrementa em cada linha
- Header: posicao 2 = `2` (identifica retorno; remessa tem `1`)
- Trailer: posicao 2 = `2` (mesma identificacao do header)
- O Valor Pago (posicao 259-271) contem zeros quando nao houve pagamento
- Para liquidacoes parciais (ocorrencia 07), o Valor Pago pode ser menor que o Valor do Titulo
- Sempre confirmar posicoes exatas com o manual oficial Bradesco CNAB 400
