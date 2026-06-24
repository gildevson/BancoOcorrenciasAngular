# Remessa CNAB 400 - BMP Money Plus (274)

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
| 2 | Posicao 1 = `2` | Mensagens / Endereco | Opcional |
| 3 | Posicao 1 = `3` | Descontos multiplos | Opcional |
| 9 | Posicao 1 = `9` | Trailer | 1 (obrigatorio) |

---

## Header (Tipo 0) - 400 bytes

| # | Campo | Posicao | Tamanho | Tipo | Valor / Descricao |
|---|-------|---------|---------|------|-------------------|
| 1 | Identificacao do registro | 1 | 1 | N | `0` |
| 2 | Identificacao do arquivo remessa | 2 | 1 | A | `1` |
| 3 | Literal remessa | 3-9 | 7 | A | `REMESSA` |
| 4 | Codigo do servico | 10-11 | 2 | N | `01` |
| 5 | Literal servico | 12-26 | 15 | A | `COBRANCA` |
| 6 | Codigo da empresa | 27-46 | 20 | A | CNPJ/CPF da empresa |
| 7 | Nome da empresa | 47-76 | 30 | A | Razao social |
| 8 | Numero do banco | 77-79 | 3 | N | `274` |
| 9 | Nome do banco | 80-94 | 15 | A | `BMP MONEY PLUS` |
| 10 | Data de geracao | 95-100 | 6 | N | DDMMAA |
| 11 | Identificacao do sistema | 109-110 | 2 | A | `MX` |
| 12 | Numero sequencial do arquivo | 111-117 | 7 | N | Numero da remessa |
| 13 | Brancos | 118-394 | 277 | A | Espacos em branco |
| 14 | Numero sequencial do registro | 395-400 | 6 | N | `000001` |

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
| 8 | Identificacao da empresa no banco | 32-38 | 7 | A | |
| 9 | Nosso numero | 39-49 | 11 | N | 10 digitos + 1 digito verificador |
| 10 | Carteira | 50-52 | 3 | A | |
| 11 | Data de desconto | 53-58 | 6 | N | DDMMAA (zeros = sem desconto) |
| 12 | Valor do desconto | 59-65 | 7 | N | Valor em centavos |
| 13 | Campo de multa | 66 | 1 | N | `0`=sem multa, `2`=com multa |
| 14 | Percentual de multa | 67-72 | 6 | N | 4 inteiros + 2 decimais |
| 15 | Numero do documento | 73-92 | 20 | A | Numero do titulo na empresa |
| 16 | Data de vencimento | 93-98 | 6 | N | DDMMAA |
| 17 | Valor do titulo | 99-111 | 13 | N | Valor em centavos |
| 18 | Codigo do banco cobrador | 112-114 | 3 | N | `000` |
| 19 | Agencia cobradora | 115-119 | 5 | N | `00000` |
| 20 | Especie do titulo | 120-121 | 2 | N | `01`-`32`, `99` |
| 21 | Identificacao | 122 | 1 | A | `N`=Novo titulo |
| 22 | Data de emissao | 123-128 | 6 | N | DDMMAA |
| 23 | Instrucao 1 | 129-130 | 2 | N | Codigo de instrucao |
| 24 | Instrucao 2 | 131-132 | 2 | N | Codigo de instrucao |
| 25 | Mora por dia | 133-145 | 13 | N | Valor em centavos |
| 26 | Data limite desconto | 146-151 | 6 | N | DDMMAA |
| 27 | Valor abatimento | 152-164 | 13 | N | Valor em centavos |
| 28 | Tipo de inscricao do pagador | 165-166 | 2 | N | `01`=CPF, `02`=CNPJ |
| 29 | CNPJ/CPF do pagador | 167-180 | 14 | N | |
| 30 | Nome do pagador | 181-210 | 30 | A | |
| 31 | Endereco do pagador | 211-240 | 30 | A | |
| 32 | Bairro do pagador | 241-250 | 10 | A | |
| 33 | CEP do pagador | 251-258 | 8 | N | |
| 34 | Cidade do pagador | 259-270 | 12 | A | |
| 35 | UF do pagador | 271-272 | 2 | A | |
| 36 | Tipo sacador avalista | 273 | 1 | N | `0`-`9` |
| 37 | Nome sacador avalista | 274-313 | 40 | A | |
| 38 | Condicao de emissao | 314 | 1 | N | `2`=Cliente emite boleto |
| 39 | Identificacao de ocorrencia | 315-316 | 2 | N | `01`,`02`,`06`,`07`,`20` |
| 40 | Brancos | 317-391 | 75 | A | |
| 41 | Tipo de deducao | 392 | 1 | N | |
| 42 | Valor de deducao | 393-400 | 8 | N | |
| ... | *(completar conforme documentacao oficial)* | | | | |
| 44 | Numero sequencial do registro | 395-400 | 6 | N | |

---

## Tipo 2 - Mensagens / Endereco (Opcional)

| # | Campo | Posicao | Tamanho | Tipo | Valor / Descricao |
|---|-------|---------|---------|------|-------------------|
| 1 | Identificacao do registro | 1 | 1 | N | `2` |
| 2 | Mensagem 1 | 2-81 | 80 | A | Texto livre |
| 3 | Mensagem 2 | 82-161 | 80 | A | Texto livre |
| 4 | Mensagem 3 | 162-241 | 80 | A | Texto livre |
| 5 | Mensagem 4 | 242-321 | 80 | A | Texto livre |
| 6 | Numero complementar | 322-326 | 5 | A | Numero do endereco |
| 7 | Bairro complementar | 327-341 | 15 | A | |
| 8 | UF complementar | 342-343 | 2 | A | |
| 9 | Cidade complementar | 344-358 | 15 | A | |
| 10 | Brancos | 359-394 | 36 | A | |
| 11 | Numero sequencial do registro | 395-400 | 6 | N | Segue sequencial do tipo 1 |

---

## Tipo 3 - Descontos Multiplos (Opcional)

| # | Campo | Posicao | Tamanho | Tipo | Valor / Descricao |
|---|-------|---------|---------|------|-------------------|
| 1 | Identificacao do registro | 1 | 1 | N | `3` |
| 2 | Tipo de desconto | 2 | 1 | N | `1`=Fixo, `2`=Percentual, `3`=Antec.Dia, `5`=%Antec. |
| 3 | Data desconto 1 | 3-8 | 6 | N | DDMMAA |
| 4 | Valor desconto 1 | 9-20 | 12 | N | |
| 5 | Data desconto 2 | 21-26 | 6 | N | DDMMAA |
| 6 | Valor desconto 2 | 27-38 | 12 | N | |
| 7 | Data desconto 3 | 39-44 | 6 | N | DDMMAA |
| 8 | Valor desconto 3 | 45-56 | 12 | N | |
| 9 | Brancos | 57-394 | 338 | A | |
| 10 | Numero sequencial do registro | 395-400 | 6 | N | Segue sequencial do tipo 2 |

---

## Trailer (Tipo 9) - 400 bytes

| # | Campo | Posicao | Tamanho | Tipo | Valor / Descricao |
|---|-------|---------|---------|------|-------------------|
| 1 | Identificacao do registro | 1 | 1 | N | `9` |
| 2 | Brancos | 2-394 | 393 | A | |
| 3 | Numero sequencial do registro | 395-400 | 6 | N | Ultimo sequencial |

---

## Codigos de Ocorrencia (Campo 39 do Detalhe)

| Codigo | Descricao |
|--------|-----------|
| 01 | Entrada de titulo |
| 02 | Pedido de baixa |
| 06 | Concessao de abatimento |
| 07 | Cancelamento de abatimento |
| 20 | Alteracao de vencimento |

---

## Especies de Titulo (Campo 20 do Detalhe)

| Codigo | Descricao |
|--------|-----------|
| 01 | Duplicata mercantil |
| 02 | Nota promissoria |
| 03 | Nota de seguro |
| 08 | Letra de cambio |
| 09 | Warrant |
| 13 | Cheque |
| 15 | Recibo |
| 16 | Triplicata mercantil |
| 17 | Duplicata de servico |
| 99 | Outros |

---

## Notas

- **Encoding:** ISO-8859-1
- **Quebra de linha:** CRLF (`\r\n`)
- **Campos numericos:** zeros a esquerda, sem espacos
- **Campos alfanumericos:** espacos a direita, maiusculas
- **Sequencial:** inicia em `000001` e incrementa em todas as linhas
- **Nosso numero:** digito verificador calculado com modulo 11 base 7 (incluindo carteira)
