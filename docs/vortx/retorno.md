# Retorno CNAB 400 - VORTX DTVM (310)

**Banco:** VORTX Distribuidora de Títulos e Valores Mobiliários Ltda  
**Codigo:** 310  
**Formato:** CNAB 400  
**Encoding:** ISO-8859-1  
**Tamanho por linha:** 400 caracteres  

---

## Estrutura do Arquivo

| Tipo | Identificador | Descricao | Quantidade |
|------|---------------|-----------|------------|
| 02 | Posicao 1-2 = `02` | Header Retorno | 1 (obrigatorio) |
| 1  | Posicao 1 = `1` | Detalhe | 1 por ocorrencia |
| 92 | Posicao 1-2 = `92` | Trailer Retorno | 1 (obrigatorio) |

---

## Header Retorno (Tipo 02) - 400 bytes

| # | Campo | Posicao | Tamanho | Tipo | Valor / Descricao |
|---|-------|---------|---------|------|-------------------|
| 1 | Identificacao do Registro | 1 | 1 | N | `0` |
| 2 | Ident. Arquivo Retorno | 2 | 1 | N | `2` |
| 3 | Literal Retorno | 3-9 | 7 | A | `RETORNO` |
| 4 | Codigo do Servico | 10-11 | 2 | N | `01` — Cobranca |
| 5 | Literal Servico | 12-26 | 15 | A | `COBRANCA` |
| 6 | Codigo da Empresa | 27-46 | 20 | N | Codigo empresa no VORTX |
| 7 | Nome da Empresa | 47-76 | 30 | A | Razao Social |
| 8 | Numero do Banco | 77-79 | 3 | N | `310` |
| 9 | Nome do Banco | 80-94 | 15 | A | `VORTX` |
| 10 | Data de Gravacao | 95-100 | 6 | N | DDMMAA |
| 11 | Branco | 101-394 | 294 | A | |
| 12 | Nº Sequencial | 395-400 | 6 | N | `000001` |

---

## Detalhe (Tipo 1) - 400 bytes

| # | Campo | Posicao | Tamanho | Tipo | Valor / Descricao |
|---|-------|---------|---------|------|-------------------|
| 1 | Identificacao do Registro | 1 | 1 | N | `1` |
| 2 | Tipo Inscricao Empresa | 2-3 | 2 | N | `01`=CPF, `02`=CNPJ |
| 3 | CNPJ/CPF Empresa | 4-17 | 14 | N | |
| 4 | Identificacao Empresa no Banco | 18-37 | 20 | A | Codigo empresa no VORTX |
| 5 | Nosso Numero | 38-47 | 10 | N | Nosso numero |
| 6 | Digito Nosso Numero | 48 | 1 | A | |
| 7 | Uso do Banco | 49-62 | 14 | A | |
| 8 | Ident. Ocorrencia | 63-64 | 2 | N | Codigo de ocorrencia retorno |
| 9 | Data Ocorrencia | 65-70 | 6 | N | DDMMAA |
| 10 | Numero Documento | 71-90 | 20 | A | Numero do documento |
| 11 | Data Vencimento | 91-96 | 6 | N | DDMMAA |
| 12 | Valor do Titulo | 97-109 | 13 | N | Valor em centavos |
| 13 | Banco Cobrador | 110-112 | 3 | N | |
| 14 | Agencia Cobradora | 113-117 | 5 | N | |
| 15 | Desconto Concedido | 118-130 | 13 | N | Valor em centavos |
| 16 | Abatimento Concedido | 131-143 | 13 | N | Valor em centavos |
| 17 | Valor Pago | 144-156 | 13 | N | Valor creditado em centavos |
| 18 | Juros de Mora | 157-169 | 13 | N | Valor em centavos |
| 19 | Outras Deducoes | 170-182 | 13 | N | Valor em centavos |
| 20 | Data do Credito | 183-188 | 6 | N | DDMMAA |
| 21 | Motivos de Rejeicao | 189-198 | 10 | N | Ate 5 codigos de 2 digitos |
| 22 | Branco | 199-394 | 196 | A | |
| 23 | Nº Sequencial | 395-400 | 6 | N | |

---

## Trailer Retorno (Tipo 92) - 400 bytes

| # | Campo | Posicao | Tamanho | Tipo | Valor / Descricao |
|---|-------|---------|---------|------|-------------------|
| 1 | Identificacao do Registro | 1 | 1 | N | `9` |
| 2 | Ident. Retorno | 2 | 1 | N | `2` |
| 3 | Qtd. Titulos | 3-10 | 8 | N | Total de registros tipo 1 |
| 4 | Valor Total | 11-24 | 14 | N | Soma dos valores em centavos |
| 5 | Branco | 25-394 | 370 | A | |
| 6 | Nº Sequencial | 395-400 | 6 | N | Ultimo sequencial |

---

## Codigos de Ocorrencia no Retorno

| Codigo | Descricao |
|--------|-----------|
| 02 | Entrada Confirmada |
| 03 | Entrada Rejeitada |
| 06 | Liquidacao Normal |
| 07 | Liquidacao Parcial |
| 08 | Liquidacao em Cartorio |
| 09 | Baixa por Comando do Cliente |
| 10 | Baixado Conforme Instrucoes da Agencia |
| 11 | Em Ser (Titulos em Aberto) |
| 12 | Abatimento Concedido |
| 13 | Abatimento Cancelado |
| 14 | Vencimento Alterado |
| 15 | Liquidacao em Desconto |
| 17 | Liquidacao apos Baixa |
| 19 | Confirmacao de Instrucao para Protestar |
| 20 | Confirmacao de Sustacao de Protesto |
| 23 | Remessa a Cartorio (Aponte) |
| 24 | Retirada de Cartorio (Sustacao) |
| 25 | Protestado e Baixado |
| 28 | Debito de Custas Antecipadas |
| 32 | Instrucao Rejeitada |
| 42 | Desconto Concedido |
| 43 | Desconto Cancelado |

---

## Notas

- **Encoding:** ISO-8859-1
- **Quebra de linha:** CRLF (`\r\n`)
- **Campos numericos:** zeros a esquerda, sem espacos
- **Campos alfanumericos:** espacos a direita, maiusculas
- **Sequencial:** inicia em `000001` e incrementa em todas as linhas
- As posicoes dos campos no retorno podem diferir — sempre validar com o manual oficial VORTX CNAB 400 Retorno
