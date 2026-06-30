# Remessa CNAB 400 - Banco Itaú S.A. (341)

**Banco:** Itaú Unibanco S.A.
**Codigo:** 341
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

| # | Campo | Pos Ini | Tam | Pos Fim | Tipo | Valor / Descricao |
|---|-------|---------|-----|---------|------|-------------------|
| 1 | Identificacao do Registro | 1 | 1 | 1 | N | `0` |
| 2 | Tipo de Operacao | 2 | 1 | 2 | N | `1` — Remessa |
| 3 | Literal Remessa | 3 | 7 | 9 | A | `REMESSA` |
| 4 | Codigo do Servico | 10 | 2 | 11 | N | `01` — Cobranca |
| 5 | Literal Servico | 12 | 15 | 26 | A | `COBRANCA       ` |
| 6 | Agencia do Cedente | 27 | 4 | 30 | N | Agencia sem digito |
| 7 | Zero | 31 | 1 | 31 | A | `0` |
| 8 | Conta do Cedente | 32 | 6 | 37 | N | Conta sem digito |
| 9 | Digito da Conta | 38 | 1 | 38 | A | Digito verificador |
| 10 | Nome da Empresa | 39 | 30 | 68 | A | Razao Social |
| 11 | Codigo do Banco | 69 | 3 | 71 | N | `341` |
| 12 | Nome do Banco | 72 | 15 | 86 | A | `BANCO ITAU SA  ` |
| 13 | Data de Gravacao | 87 | 6 | 92 | N | DDMMAA |
| 14 | Branco | 93 | 8 | 100 | A | Brancos |
| 15 | Identificacao do Sistema | 101 | 2 | 102 | A | `MX` |
| 16 | Sequencial de Remessa | 103 | 7 | 109 | N | Numero crescente |
| 17 | Branco | 110 | 285 | 394 | A | Brancos |
| 18 | Sequencial do Registro | 395 | 6 | 400 | N | `000001` |

---

## Detalhe (Tipo 1) - 400 bytes

> Layout para cobranca escritural (carteiras 109, 112, 174, 175, 196, 198)

| # | Campo | Pos Ini | Tam | Pos Fim | Tipo | Valor / Descricao |
|---|-------|---------|-----|---------|------|-------------------|
| 1 | Identificacao do Registro | 1 | 1 | 1 | N | `1` |
| 2 | Tipo de Inscricao da Empresa | 2 | 2 | 3 | N | `01`=CPF, `02`=CNPJ |
| 3 | CNPJ/CPF da Empresa | 4 | 14 | 17 | N | 14 pos, zeros a esq. |
| 4 | Agencia do Cedente | 18 | 4 | 21 | N | Agencia sem digito |
| 5 | Zero | 22 | 1 | 22 | A | `0` (fixo) |
| 6 | Conta do Cedente | 23 | 8 | 30 | N | Conta sem digito |
| 7 | Digito da Conta | 31 | 1 | 31 | A | Digito verificador |
| 8 | Uso da Empresa | 32 | 6 | 37 | A | Numero do documento / controle |
| 9 | Carteira | 38 | 1 | 38 | N | Ex: `1`, `2`, `3`, `4`, `5`, `6` |
| 10 | Nosso Numero | 39 | 10 | 48 | N | Numero bancario para cobranca |
| 11 | DAC Nosso Numero | 49 | 1 | 49 | A | Digito verificador (Modulo 10) |
| 12 | Uso do Banco | 50 | 13 | 62 | A | Brancos ou uso interno |
| 13 | Uso do Banco (zeros) | 63 | 8 | 70 | N | Zeros |
| 14 | Numero do Documento | 71 | 12 | 82 | A | Seu numero (identificador empresa) |
| 15 | Uso do Banco | 83 | 10 | 92 | A | Uso interno banco |
| 16 | Data de Vencimento | 93 | 6 | 98 | N | DDMMAA |
| 17 | Valor do Titulo | 99 | 13 | 111 | N | Valor em centavos |
| 18 | Banco Cobrador | 112 | 3 | 114 | N | `341` ou `000` |
| 19 | Agencia Cobradora | 115 | 5 | 119 | N | `00000` se sem cobradora |
| 20 | Especie do Titulo | 120 | 2 | 121 | N | Vide tabela de especies |
| 21 | Identificacao | 122 | 1 | 122 | A | `N` = Novo titulo |
| 22 | Data de Emissao | 123 | 6 | 128 | N | DDMMAA |
| 23 | 1a Instrucao | 129 | 2 | 130 | N | Codigo de instrucao |
| 24 | 2a Instrucao | 131 | 2 | 132 | N | Codigo de instrucao |
| 25 | Mora por Dia | 133 | 13 | 145 | N | Valor em centavos/dia |
| 26 | Data Limite para Desconto | 146 | 6 | 151 | N | DDMMAA (zeros = sem desconto) |
| 27 | Valor do Desconto | 152 | 13 | 164 | N | Valor em centavos |
| 28 | Valor do IOF | 165 | 13 | 177 | N | Valor do IOF em centavos |
| 29 | Valor do Abatimento | 178 | 13 | 190 | N | Valor em centavos |
| 30 | Tipo de Inscricao do Pagador | 191 | 2 | 192 | N | `01`=CPF, `02`=CNPJ |
| 31 | CNPJ/CPF do Pagador | 193 | 14 | 206 | N | 14 pos, zeros a esq. |
| 32 | Nome do Pagador | 207 | 30 | 236 | A | Razao Social |
| 33 | Endereco do Pagador | 237 | 30 | 266 | A | Logradouro e numero |
| 34 | Bairro do Pagador | 267 | 10 | 276 | A | |
| 35 | CEP do Pagador | 277 | 8 | 284 | N | Apenas numeros |
| 36 | Cidade do Pagador | 285 | 10 | 294 | A | |
| 37 | UF do Pagador | 295 | 2 | 296 | A | Sigla do estado |
| 38 | Sacador / Avalista | 297 | 30 | 326 | A | Nome ou mensagem |
| 39 | Branco | 327 | 68 | 394 | A | Brancos |
| 40 | Sequencial do Registro | 395 | 6 | 400 | N | |

---

## Trailer (Tipo 9) - 400 bytes

| # | Campo | Pos Ini | Tam | Pos Fim | Tipo | Valor / Descricao |
|---|-------|---------|-----|---------|------|-------------------|
| 1 | Identificacao do Registro | 1 | 1 | 1 | N | `9` |
| 2 | Branco | 2 | 393 | 394 | A | Brancos |
| 3 | Sequencial do Registro | 395 | 6 | 400 | N | Ultimo sequencial |

---

## Codigos de Instrucao (1a e 2a instrucao)

| Codigo | Descricao |
|--------|-----------|
| 00 | Sem instrucao |
| 06 | Protestar apos ___ dias corridos do vencimento |
| 07 | Negativar — encaminhar ao servico de negativacao |
| 09 | Cancelar instrucao de protesto / negativacao |
| 17 | Devolver apos ___ dias corridos do vencimento (nao protestar) |
| 18 | Sustar protesto e dar baixa no titulo |
| 19 | Sustar protesto e manter titulo em carteira |

---

## Especies de Titulo

| Codigo | Descricao |
|--------|-----------|
| 01 | Duplicata Mercantil |
| 02 | Nota Promissoria |
| 03 | Nota de Seguro |
| 05 | Recibo |
| 06 | Letra de Cambio |
| 07 | Warrant |
| 08 | Cheque |
| 09 | Duplicata de Servico |
| 10 | Nota de Debito |
| 13 | Nota de Caixa |
| 15 | Boleto de Proposta |
| 99 | Outros |

---

## Calculo do DAC (Digito Nosso Numero)

- Metodo: **Modulo 10**
- Multiplicadores: `2` e `1` alternados da direita para a esquerda
- Soma os algarismos dos produtos
- DAC = `10 - (soma % 10)`, se resultado = 10 entao DAC = `0`

---

## Notas

- **Encoding:** ISO-8859-1
- **Quebra de linha:** CRLF (`\r\n`)
- **Campos numericos:** zeros a esquerda, sem espacos
- **Campos alfanumericos:** espacos a direita, maiusculas
- **Sequencial:** inicia em `000001` e incrementa em todas as linhas
- **Nosso Numero:** digito verificador calculado com Modulo 10
- **Carteiras comuns:** 109 (simples), 112 (caucionada), 174 (cedida), 175 (desconto), 196 (sem registro)
- Validar sempre com o manual oficial Itau CNAB 400 vigente para sua carteira
