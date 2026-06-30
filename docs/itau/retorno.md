# Retorno CNAB 400 - Banco Itaú S.A. (341)

**Banco:** Itaú Unibanco S.A.
**Codigo:** 341
**Formato:** CNAB 400
**Encoding:** ISO-8859-1
**Tamanho por linha:** 400 caracteres

---

## Estrutura do Arquivo

| Tipo | Identificador | Descricao | Quantidade |
|------|---------------|-----------|------------|
| 0 | Posicao 1 = `0` | Header Retorno | 1 (obrigatorio) |
| 1 | Posicao 1 = `1` | Detalhe | 1 por ocorrencia |
| 9 | Posicao 1 = `9` | Trailer Retorno | 1 (obrigatorio) |

---

## Header Retorno (Tipo 0) - 400 bytes

| # | Campo | Pos Ini | Tam | Pos Fim | Tipo | Valor / Descricao |
|---|-------|---------|-----|---------|------|-------------------|
| 1 | Identificacao do Registro | 1 | 1 | 1 | N | `0` |
| 2 | Tipo de Operacao | 2 | 1 | 2 | N | `1` — Retorno |
| 3 | Literal Retorno | 3 | 7 | 9 | A | `RETORNO` |
| 4 | Codigo do Servico | 10 | 2 | 11 | N | `01` — Cobranca |
| 5 | Literal Servico | 12 | 15 | 26 | A | `COBRANCA       ` |
| 6 | Codigo da Empresa no Banco | 27 | 20 | 46 | N | Codigo empresa no Itau |
| 7 | Nome da Empresa | 47 | 30 | 76 | A | Razao Social |
| 8 | Codigo do Banco | 77 | 3 | 79 | N | `341` |
| 9 | Nome do Banco | 80 | 15 | 94 | A | `BANCO ITAU SA  ` |
| 10 | Data de Gravacao | 95 | 6 | 100 | N | DDMMAA |
| 11 | Densidade de Gravacao | 101 | 8 | 108 | N | `01600000` |
| 12 | Sequencial do Retorno | 109 | 5 | 113 | N | Numero do retorno |
| 13 | Branco | 114 | 281 | 394 | A | Brancos |
| 14 | Sequencial do Registro | 395 | 6 | 400 | N | `000001` |

---

## Detalhe Retorno (Tipo 1) - 400 bytes

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
| 9 | Nosso Numero (com Carteira) | 38 | 25 | 62 | A | Carteira + Nosso numero + DAC |
| 10 | Uso do Banco (zeros) | 63 | 8 | 70 | N | Zeros |
| 11 | Numero do Documento | 71 | 12 | 82 | A | Seu numero conforme remessa |
| 12 | Uso do Banco | 83 | 10 | 92 | A | Uso interno |
| 13 | Vencimento Original | 93 | 6 | 98 | N | DDMMAA |
| 14 | Valor Original do Titulo | 99 | 13 | 111 | N | Valor em centavos |
| 15 | Banco Cobrador | 112 | 3 | 114 | N | Banco responsavel cobranca |
| 16 | Agencia Cobradora | 115 | 5 | 119 | N | Agencia cobradora |
| 17 | Uso do Banco | 120 | 2 | 121 | A | Uso interno |
| 18 | Carteira | 122 | 1 | 122 | N | Carteira do titulo |
| 19 | Codigo de Ocorrencia | 123 | 2 | 124 | N | Vide tabela de ocorrencias |
| 20 | Data da Ocorrencia | 125 | 6 | 130 | N | DDMMAA |
| 21 | Numero do Documento (retorno) | 131 | 12 | 142 | A | |
| 22 | Branco | 143 | 5 | 147 | A | Brancos |
| 23 | Uso do Banco | 148 | 3 | 150 | A | Uso interno |
| 24 | Vencimento (bloqueto) | 151 | 6 | 156 | N | DDMMAA — data vencimento boleto |
| 25 | Valor do Titulo | 157 | 13 | 169 | N | Valor em centavos |
| 26 | Banco Cobrador (retorno) | 170 | 3 | 172 | N | |
| 27 | Agencia Cobradora (retorno) | 173 | 5 | 177 | N | |
| 28 | Tarifa de Cobranca | 178 | 13 | 190 | N | Valor em centavos |
| 29 | Outras Despesas | 191 | 13 | 203 | N | Custas de protesto etc. |
| 30 | Juros de Mora por Dia | 204 | 13 | 216 | N | Valor diario em centavos |
| 31 | IOF Descontado | 217 | 13 | 229 | N | Valor em centavos |
| 32 | Abatimento Concedido | 230 | 13 | 242 | N | Valor em centavos |
| 33 | Desconto Concedido | 243 | 13 | 255 | N | Valor em centavos |
| 34 | Valor Pago | 256 | 13 | 268 | N | Valor efetivamente creditado |
| 35 | Juros de Mora Recebidos | 269 | 13 | 281 | N | Valor em centavos |
| 36 | Outros Creditos | 282 | 13 | 294 | N | Valor em centavos |
| 37 | Branco | 295 | 1 | 295 | A | Branco |
| 38 | Data do Credito | 296 | 6 | 301 | N | DDMMAA |
| 39 | Motivos de Rejeicao | 302 | 10 | 311 | N | Ate 5 codigos de 2 digitos |
| 40 | Branco | 312 | 57 | 368 | A | Brancos |
| 41 | Uso do Banco | 369 | 17 | 385 | A | Uso interno |
| 42 | Branco | 386 | 9 | 394 | A | Brancos |
| 43 | Sequencial do Registro | 395 | 6 | 400 | N | |

---

## Trailer Retorno (Tipo 9) - 400 bytes

| # | Campo | Pos Ini | Tam | Pos Fim | Tipo | Valor / Descricao |
|---|-------|---------|-----|---------|------|-------------------|
| 1 | Identificacao do Registro | 1 | 1 | 1 | N | `9` |
| 2 | Tipo Retorno | 2 | 1 | 2 | N | `2` |
| 3 | Uso do Banco | 3 | 7 | 9 | A | Uso interno |
| 4 | Qtd. Titulos Cobrados | 10 | 8 | 17 | N | Total de registros tipo 1 |
| 5 | Valor Total | 18 | 13 | 30 | N | Soma dos valores em centavos |
| 6 | Uso do Banco | 31 | 13 | 43 | A | Uso interno |
| 7 | Valor Total Credito | 44 | 13 | 56 | N | Soma dos valores creditados |
| 8 | Branco | 57 | 338 | 394 | A | Brancos |
| 9 | Sequencial do Registro | 395 | 6 | 400 | N | Ultimo sequencial |

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
| 11 | Em Ser — Titulo em Carteira |
| 12 | Abatimento Concedido |
| 13 | Abatimento Cancelado |
| 14 | Vencimento Alterado |
| 15 | Liquidacao em Desconto |
| 16 | Titulo Pago em Cheque |
| 17 | Liquidacao apos Baixa ou Liquidacao em Cartorio |
| 18 | Acerto de Deposito |
| 19 | Confirmacao Recebimento de Instrucao de Protesto |
| 20 | Confirmacao Sustacao de Protesto |
| 21 | Acerto do Controle do Participante |
| 22 | Titulo com Pagamento Cancelado |
| 23 | Entrada do Titulo em Cartorio |
| 24 | Entrada Rejeitada por CEP Irregular |
| 25 | Confirmacao Recebimento Instrucao de Sustacao de Protesto |
| 27 | Baixa Rejeitada |
| 28 | Debito de Tarifas / Custas |
| 29 | Ocorrencia do Pagador |
| 30 | Alteracao de Outros Dados Rejeitada |
| 32 | Instrucao Rejeitada |
| 33 | Confirmacao Pedido de Alteracao de Outros Dados |
| 34 | Retirado de Cartorio e Manutenção em Carteira |
| 35 | Desagendamento do Debito Automatico |
| 40 | Liquidacao Transferencia para Desconto |
| 55 | Sustado Judicial |
| 98 | Pagamento Cancelado |

---

## Motivos de Rejeicao (Campo 39, posicoes 302-311)

> O campo contem ate 5 codigos de 2 digitos concatenados.
> Preenchido quando ocorrencia = `03` (entrada rejeitada) ou `32` (instrucao rejeitada).

| Codigo | Descricao |
|--------|-----------|
| 03 | Agencia/Conta Cedente Invalida |
| 04 | Codigo de Ocorrencia Invalido |
| 05 | Data de Vencimento Invalida |
| 06 | Valor do Titulo Invalido |
| 07 | CEP do Pagador Invalido |
| 08 | Nome do Pagador Nao Informado |
| 09 | CNPJ/CPF do Pagador Invalido |
| 10 | Logradouro Nao Informado |
| 11 | CEP sem Praca de Cobranca |
| 12 | Abatimento Invalido |
| 13 | Desconto Invalido |
| 14 | Especie do Titulo Invalida |
| 15 | Nosso Numero Invalido |
| 16 | Numero do Documento Invalido |
| 22 | Carteira Invalida |
| 23 | Agencia Cobradora Invalida |
| 24 | Instrucao Invalida |
| 25 | Titulo ja Cobrado pelo Banco |
| 27 | Data do Credito Invalida |
| 28 | Codigo da Mora Invalido |
| 29 | Valor da Mora Invalido |
| 30 | Tipo de Desconto Invalido |
| 31 | Tipo de Multa Invalida |
| 38 | Prazo para Protesto Invalido |
| 40 | CNPJ/CPF do Pagador Invalido |
| 41 | CEP do Pagador Invalido |
| 42 | CNPJ/CPF Invalido — Pessoa Fisica/Juridica |
| 60 | Movimento para Titulo Nao Cadastrado |
| 77 | Transferencia para Desconto — Carteira Invalida |

---

## Notas

- **Encoding:** ISO-8859-1
- **Quebra de linha:** CRLF (`\r\n`)
- **Campos numericos:** zeros a esquerda, sem espacos
- **Campos alfanumericos:** espacos a direita, maiusculas
- **Sequencial:** inicia em `000001` e incrementa em todas as linhas
- **Valor Pago (pos 256-268):** preenchido para ocorrencias de liquidacao (06, 07, 08, 15, 17)
- **Data do Credito (pos 296-301):** data que o valor foi creditado na conta do cedente
- Validar sempre com o manual oficial Itau CNAB 400 vigente para sua carteira
