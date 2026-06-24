# Retorno CNAB 400 - BMP Money Plus (274)

**Banco:** BMP Money Plus  
**Codigo:** 274  
**Formato:** CNAB 400  
**Encoding:** ISO-8859-1  
**Tamanho por linha:** 400 caracteres  

---

## Estrutura do Arquivo

| Tipo | Identificador | Descricao | Quantidade |
|------|---------------|-----------|------------|
| 0 | Posicao 1 = `0` | Header | 1 (obrigatorio) |
| 1 | Posicao 1 = `1` | Detalhe (titulo) | 1 por titulo |
| 9 | Posicao 1 = `9` | Trailer | 1 (obrigatorio) |

---

## Header (Tipo 0) - 400 bytes

| # | Campo | Posicao | Tamanho | Tipo | Valor / Descricao |
|---|-------|---------|---------|------|-------------------|
| 1 | Identificacao do registro | 1 | 1 | N | `0` |
| 2 | Retorno | 2 | 1 | N | `2` |
| 3 | Literal retorno | 3-9 | 7 | A | `RETORNO` |
| 4 | Codigo do servico | 10-11 | 2 | N | `01` |
| 5 | Literal servico | 12-26 | 15 | A | `COBRANCA` |
| 6 | Codigo da empresa | 27-46 | 20 | A | CNPJ/CPF da empresa |
| 7 | Nome da empresa | 47-76 | 30 | A | Razao social |
| 8 | Numero do banco | 77-79 | 3 | N | `274` |
| 9 | Nome do banco | 80-94 | 15 | A | `BMP MONEY PLUS` |
| 10 | Data de geracao | 95-100 | 6 | N | DDMMAA |
| 11 | Brancos | 101-394 | 294 | A | |
| 12 | Numero sequencial do registro | 395-400 | 6 | N | `000001` |

---

## Detalhe (Tipo 1) - 400 bytes

| # | Campo | Posicao | Tamanho | Tipo | Valor / Descricao |
|---|-------|---------|---------|------|-------------------|
| 1 | Identificacao do registro | 1 | 1 | N | `1` |
| 2 | Tipo de inscricao da empresa | 2-3 | 2 | N | `01`=CPF, `02`=CNPJ |
| 3 | CNPJ/CPF da empresa | 4-17 | 14 | N | |
| 4 | Agencia | 18-21 | 4 | N | |
| 5 | Digito da agencia | 22 | 1 | A | |
| 6 | Conta corrente | 23-30 | 8 | N | |
| 7 | Digito da conta | 31 | 1 | A | |
| 8 | Nosso numero | 39-49 | 11 | N | 10 digitos + 1 digito verificador |
| 9 | Numero do documento | 73-92 | 20 | A | Numero do titulo na empresa |
| 10 | Data de vencimento | 93-98 | 6 | N | DDMMAA |
| 11 | Valor do titulo | 99-111 | 13 | N | Valor em centavos |
| 12 | Banco cobrador | 112-114 | 3 | N | |
| 13 | Agencia cobradora | 115-119 | 5 | N | |
| 14 | Especie do titulo | 120-121 | 2 | N | |
| 15 | Identificacao de ocorrencia | 109-110 | 2 | N | Ver tabela de ocorrencias |
| 16 | Data de ocorrencia | 111-116 | 6 | N | DDMMAA |
| 17 | Valor pago | 152-164 | 13 | N | Valor em centavos |
| 18 | Juros de mora | 165-177 | 13 | N | Valor em centavos |
| 19 | Desconto concedido | 178-190 | 13 | N | Valor em centavos |
| 20 | Valor abatimento | 191-203 | 13 | N | Valor em centavos |
| 21 | IOF | 204-216 | 13 | N | Valor em centavos |
| 22 | Valor liquido | 217-229 | 13 | N | Valor creditado em centavos |
| 23 | Despesas de cobranca | 230-242 | 13 | N | Valor em centavos |
| 24 | Data do credito | 296-301 | 6 | N | DDMMAA |
| 25 | Tipo de inscricao do pagador | 315-316 | 2 | N | `01`=CPF, `02`=CNPJ |
| 26 | CNPJ/CPF do pagador | 317-330 | 14 | N | |
| 27 | Nome do pagador | 331-360 | 30 | A | |
| 28 | Numero sequencial do registro | 395-400 | 6 | N | |

> **Atencao:** As posicoes acima sao indicativas. Confirme com o manual oficial do BMP CNAB 400 Retorno.

---

## Trailer (Tipo 9) - 400 bytes

| # | Campo | Posicao | Tamanho | Tipo | Valor / Descricao |
|---|-------|---------|---------|------|-------------------|
| 1 | Identificacao do registro | 1 | 1 | N | `9` |
| 2 | Quantidade de titulos | 18-25 | 8 | N | Total de registros tipo 1 |
| 3 | Valor total | 26-38 | 13 | N | Soma dos valores em centavos |
| 4 | Brancos | 39-394 | 356 | A | |
| 5 | Numero sequencial do registro | 395-400 | 6 | N | Ultimo sequencial |

---

## Codigos de Ocorrencia no Retorno

| Codigo | Descricao |
|--------|-----------|
| 02 | Entrada confirmada |
| 03 | Entrada rejeitada |
| 06 | Liquidacao normal |
| 07 | Liquidacao parcial |
| 08 | Liquidacao em cartorio |
| 09 | Baixa automatica |
| 10 | Baixa solicitada |
| 11 | Titulo em ser |
| 12 | Abatimento concedido |
| 13 | Abatimento cancelado |
| 14 | Vencimento alterado |
| 15 | Liquidacao em desconto |
| 17 | Liquidacao apos baixa |
| 19 | Confirmacao de instrucao de protesto |
| 20 | Confirmacao de sustacao de protesto |
| 23 | Remessa a cartorio (aponte) |
| 24 | Retirada de cartorio (sustacao) |
| 25 | Protestado e baixado |
| 28 | Debito de custas antecipadas |
| 32 | Instrucao rejeitada |
| 42 | Desconto concedido |
| 43 | Desconto cancelado |
| 70 | Vencimento alterado (2a opcao) |

---

## Motivos de Rejeicao (Ocorrencia 03)

| Codigo | Descricao |
|--------|-----------|
| 01 | CEP invalido |
| 02 | Agencia/conta invalida |
| 03 | Nosso numero invalido |
| ... | *(completar conforme documentacao oficial)* |

---

## Notas

- **Encoding:** ISO-8859-1
- **Quebra de linha:** CRLF (`\r\n`)
- **Campos numericos:** zeros a esquerda, sem espacos
- **Campos alfanumericos:** espacos a direita, maiusculas
- **Sequencial:** inicia em `000001` e incrementa em todas as linhas
- As posicoes dos campos no retorno podem diferir da remessa — sempre validar com o manual oficial
