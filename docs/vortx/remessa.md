# Remessa CNAB 400 - VORTX DTVM (310)

**Banco:** VORTX Distribuidora de Títulos e Valores Mobiliários Ltda  
**Codigo:** 310  
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
| 1 | Identificacao do Registro | 1 | 1 | N | `0` |
| 2 | Identificacao do Arquivo | 2 | 1 | N | `1` — Remessa |
| 3 | Literal Remessa | 3-9 | 7 | A | `REMESSA` |
| 4 | Codigo do Servico | 10-11 | 2 | N | `01` — Cobranca |
| 5 | Literal Servico | 12-26 | 15 | A | `COBRANCA` |
| 6 | Codigo da Empresa | 27-46 | 20 | N | Codigo fornecido pelo VORTX |
| 7 | Nome da Empresa | 47-76 | 30 | A | Razao Social |
| 8 | Numero do Banco | 77-79 | 3 | N | `310` |
| 9 | Nome do Banco | 80-94 | 15 | A | `VORTX` |
| 10 | Data de Gravacao | 95-100 | 6 | N | DDMMAA |
| 11 | Branco | 101-110 | 10 | A | Espacos em branco |
| 12 | Nº Sequencial de Remessa | 111-117 | 7 | N | Numero da remessa |
| 13 | Branco | 118-394 | 277 | A | Espacos em branco |
| 14 | Nº Sequencial do Registro | 395-400 | 6 | N | `000001` |

---

## Detalhe (Tipo 1) - 400 bytes

| # | Campo | Posicao | Tamanho | Tipo | Valor / Descricao |
|---|-------|---------|---------|------|-------------------|
| 1 | Identificacao do Registro | 1 | 1 | N | `1` |
| 2 | Tipo de Inscricao da Empresa | 2-3 | 2 | N | `01`=CPF, `02`=CNPJ |
| 3 | CNPJ/CPF da Empresa | 4-17 | 14 | N | |
| 4 | Identificacao da Empresa no Banco | 18-37 | 20 | A | Codigo empresa no VORTX |
| 5 | Nosso Numero | 38-47 | 10 | N | Numero do titulo no banco |
| 6 | Digito Nosso Numero | 48 | 1 | A | Digito verificador |
| 7 | Branco | 49-62 | 14 | A | |
| 8 | Campo de Multa | 63 | 1 | N | `0`=Sem multa, `2`=Com multa |
| 9 | Percentual de Multa | 64-67 | 4 | N | Percentual (2 dec) |
| 10 | Numero do Documento | 68-87 | 20 | A | Numero do titulo na empresa |
| 11 | Data de Vencimento | 88-93 | 6 | N | DDMMAA |
| 12 | Valor do Titulo | 94-106 | 13 | N | Valor em centavos |
| 13 | Banco Cobrador | 107-109 | 3 | N | `000` |
| 14 | Agencia Cobradora | 110-114 | 5 | N | `00000` |
| 15 | Especie do Titulo | 115-116 | 2 | N | Ver tabela de especies |
| 16 | Identificacao | 117 | 1 | A | `N`=Novo titulo |
| 17 | Data de Emissao | 118-123 | 6 | N | DDMMAA |
| 18 | 1ª Instrucao | 124-125 | 2 | N | Codigo de instrucao |
| 19 | 2ª Instrucao | 126-127 | 2 | N | Codigo de instrucao |
| 20 | Valor Mora por Dia | 128-140 | 13 | N | Valor em centavos |
| 21 | Data Limite de Desconto | 141-146 | 6 | N | DDMMAA (zeros = sem desconto) |
| 22 | Valor do Desconto | 147-159 | 13 | N | Valor em centavos |
| 23 | Valor do IOF | 160-172 | 13 | N | Valor em centavos |
| 24 | Valor do Abatimento | 173-185 | 13 | N | Valor em centavos |
| 25 | Tipo de Inscricao do Pagador | 186-187 | 2 | N | `01`=CPF, `02`=CNPJ |
| 26 | CNPJ/CPF do Pagador | 188-201 | 14 | N | |
| 27 | Nome do Pagador | 202-241 | 40 | A | |
| 28 | Endereco do Pagador | 242-281 | 40 | A | |
| 29 | Bairro do Pagador | 282-296 | 15 | A | |
| 30 | CEP do Pagador | 297-304 | 8 | N | |
| 31 | Cidade do Pagador | 305-319 | 15 | A | |
| 32 | UF do Pagador | 320-321 | 2 | A | |
| 33 | Identificacao da Ocorrencia | 322-323 | 2 | N | Codigo de ocorrencia remessa |
| 34 | Branco | 324-394 | 71 | A | |
| 35 | Nº Sequencial do Registro | 395-400 | 6 | N | |

---

## Trailer (Tipo 9) - 400 bytes

| # | Campo | Posicao | Tamanho | Tipo | Valor / Descricao |
|---|-------|---------|---------|------|-------------------|
| 1 | Identificacao do Registro | 1 | 1 | N | `9` |
| 2 | Branco | 2-394 | 393 | A | |
| 3 | Nº Sequencial do Registro | 395-400 | 6 | N | Ultimo sequencial |

---

## Codigos de Instrucao (1ª e 2ª instrucao)

| Codigo | Descricao |
|--------|-----------|
| 00 | Sem instrucao |
| 02 | Devolver apos X dias corridos do vencimento (nao protestar) |
| 06 | Protestar apos X dias corridos do vencimento |
| 07 | Negativar — encaminhar ao servico de negativacao |
| 09 | Cancelar instrucao de protesto / negativacao |
| 18 | Sustar protesto e dar baixa no titulo |
| 19 | Sustar protesto e manter titulo em carteira |
| 20 | Devolver o titulo ao cedente |
| 23 | Nao cobrar juros de mora |
| 24 | Cobrar juros de mora |
| 43 | Dispensar prazo para protesto |
| 45 | Cobrar multa conforme instrucao |
| 48 | Dispensar cobranca de multa |

---

## Codigos de Ocorrencia Remessa

| Codigo | Descricao |
|--------|-----------|
| 01 | Remessa — Entrada de Titulo |
| 02 | Pedido de Baixa |
| 04 | Concessao de Abatimento |
| 05 | Cancelamento de Abatimento |
| 06 | Alteracao de Vencimento |
| 07 | Alteracao de Dados |
| 09 | Protestar |
| 10 | Sustar Protesto e Baixar |
| 11 | Sustar Protesto e Manter em Carteira |
| 12 | Alteracao de Juros de Mora |
| 31 | Alteracao de Outros Dados |

---

## Especies de Titulo

| Codigo | Descricao |
|--------|-----------|
| 01 | Duplicata Mercantil |
| 02 | Nota Promissoria |
| 03 | Nota de Seguro |
| 08 | Letra de Cambio |
| 09 | Warrant |
| 13 | Cheque |
| 15 | Recibo |
| 16 | Triplicata Mercantil |
| 17 | Duplicata de Servico |
| 99 | Outros |

---

## Notas

- **Encoding:** ISO-8859-1
- **Quebra de linha:** CRLF (`\r\n`)
- **Campos numericos:** zeros a esquerda, sem espacos
- **Campos alfanumericos:** espacos a direita, maiusculas
- **Sequencial:** inicia em `000001` e incrementa em todas as linhas
- Confirmar posicoes com o manual oficial VORTX CNAB 400 Remessa
