# Remessa CNAB 400 - Banco Paulista / Frontis (611)

**Banco:** Banco Paulista S.A.  
**Sistema:** Frontis FIDC  
**Codigo:** 611  
**Formato:** CNAB 400  
**Encoding:** ISO-8859-1  
**Tamanho por linha:** 400 caracteres (extensao: ate 444)  

---

## Nomenclatura do Arquivo

```
Formato: CBDDMMxx.REM  ou  CBDDMMxx.TXT

Onde:
  CB    Caracteres fixos
  DD    Dia de geracao do arquivo
  MM    Mes de geracao do arquivo
  xx    Variavel alfanumerica (01, AE, E1, etc.)
  .REM  Extensao padrao
  .TXT  Extensao alternativa

Exemplos:
  CB230501.REM
  CB2305AE.REM
  CB2305E1.REM
```

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
| 1 | Tipo Registro | 1 | 1 | N | `0` |
| 2 | Ident. Arquivo | 2 | 1 | N | `1` — Remessa |
| 3 | Literal Remessa | 3-9 | 7 | A | `REMESSA` |
| 4 | Cod. Servico | 10-11 | 2 | N | `01` — Cobranca |
| 5 | Literal Servico | 12-26 | 15 | A | `COBRANCA` (completar com espacos) |
| 6 | Cod. Originador | 27-46 | 20 | N | Codigo fornecido pelo banco |
| 7 | Nome Originador | 47-76 | 30 | A | Razao Social do Originador |
| 8 | No Banco | 77-79 | 3 | N | `611` |
| 9 | Nome Banco | 80-94 | 15 | A | `PAULISTA S.A.` |
| 10 | Data Gravacao | 95-100 | 6 | N | DDMMAA |
| 11 | Branco | 101-108 | 8 | A | Espacos em branco |
| 12 | Ident. Sistema | 109-110 | 2 | A | `MX` |
| 13 | No Seq. Arquivo | 111-117 | 7 | N | Numero sequencial do arquivo |
| 14 | Branco | 118-394 | 277 | A | Espacos em branco |
| 15 | Seq. Registro | 395-400 | 6 | N | `000001` |

---

## Detalhe (Tipo 1) - 400 bytes

| # | Campo | Posicao | Tamanho | Tipo | Valor / Descricao |
|---|-------|---------|---------|------|-------------------|
| 1 | Tipo Registro | 1 | 1 | N | `1` |
| 2 | Deb. Auto C/C | 2-20 | 19 | A | Debito Automatico C/C — Branco |
| 3 | Coobrigacao | 21-22 | 2 | N | `01`=Com Coobrigacao, `02`=Sem Coobrigacao |
| 4 | Caract. Especial | 23-24 | 2 | N | Caracteristica Especial — Anexo 8 SRC3040 |
| 5 | Modal. Operacao | 25-28 | 4 | N | Modalidade Operacao — Anexo 3 SRC3040 |
| 6 | Nat. Operacao | 29-30 | 2 | N | Natureza Operacao — Anexo 2 SRC3040 |
| 7 | Origem Recurso | 31-34 | 4 | N | Origem Recurso — Anexo 4 SRC3040 |
| 8 | Classe Risco | 35-36 | 2 | A | Classe Risco Operacao — Anexo 17 SRC3040 |
| 9 | Zeros | 37 | 1 | N | `0` |
| 10 | No Controle | 38-62 | 25 | A | Numero de Controle — identificacao do titulo |
| 11 | No Banco | 63-65 | 3 | N | Numero Banco (obrigatorio se Especie=Cheque; senao `000`) |
| 12 | Zeros | 66-70 | 5 | N | `00000` |
| 13 | Ident. Titulo | 71-81 | 11 | N | Identificacao Titulo no Banco — Branco |
| 14 | Digito N/N | 82 | 1 | A | Digito Nosso Numero — Branco |
| 15 | Valor Pago | 83-92 | 10 | N | Valor pago na liquidacao/baixa (2 decimais) |
| 16 | Cond. Papeleta | 93 | 1 | N | Condicao Emissao Papeleta — Branco |
| 17 | Ident. Papeleta | 94 | 1 | A | Se emite papeleta debito automatico — Branco |
| 18 | Data Liquidacao | 95-100 | 6 | N | DDMMAA — somente para liquidacao |
| 19 | Ident. Operacao | 101-104 | 4 | A | Identificacao Operacao Banco — Branco |
| 20 | Indic. Rateio | 105 | 1 | A | Indicador Rateio Credito — Branco |
| 21 | Endereco Aviso | 106 | 1 | N | Enderecamento Aviso Debito — Branco |
| 22 | Branco | 107-108 | 2 | A | Espacos em branco |
| 23 | Cod. Ocorrencia | 109-110 | 2 | N | Ver tabela de Codigos de Ocorrencia |
| 24 | No Documento | 111-120 | 10 | A | Numero do Documento |
| 25 | Vencimento | 121-126 | 6 | N | DDMMAA — Data de Vencimento do Titulo |
| 26 | Valor Titulo | 127-139 | 13 | N | Valor do Titulo (2 decimais, sem ponto/virgula) |
| 27 | Banco Cobranca | 140-142 | 3 | N | Banco Encarregado da Cobranca — ou `000` |
| 28 | Ag. Depositaria | 143-147 | 5 | N | Agencia Depositaria — ou `00000` |
| 29 | Especie Titulo | 148-149 | 2 | N | Ver tabela de Especies |
| 30 | Identificacao | 150 | 1 | A | Identificacao — Branco |
| 31 | Data Emissao | 151-156 | 6 | N | DDMMAA — Data de Emissao do Titulo |
| 32 | 1a Instrucao | 157-158 | 2 | N | `00` |
| 33 | 2a Instrucao | 159 | 1 | N | `0` |
| 34 | Insc. Est. Sacado | 160-173 | 14 | A | Inscricao Estadual Sacado — Obrigatorio para Duplicata |
| 35 | No Termo Cessao | 174-192 | 19 | A | Numero Termo Cessao — Obrigatorio para Duplicata |
| 36 | Valor Presente | 193-205 | 13 | N | Valor Presente da Parcela (2 decimais) |
| 37 | Valor Abatimento | 206-218 | 13 | N | Valor Abatimento (2 decimais) |
| 38 | Tipo Insc. Sacado | 219-220 | 2 | N | `01`=CPF, `02`=CNPJ |
| 39 | CPF/CNPJ Sacado | 221-234 | 14 | N | Inscricao do Sacado — alinhado a direita |
| 40 | Nome Sacado | 235-274 | 40 | A | Nome do Sacado |
| 41 | Endereco Sacado | 275-314 | 40 | A | Endereco Completo do Sacado |
| 42 | No NF Duplicata | 315-323 | 9 | A | Numero NF Duplicata — Obrigatorio para Duplicata |
| 43 | Serie NF | 324-326 | 3 | A | Numero Serie NF Duplicata — Obrigatorio para Duplicata |
| 44 | CEP | 327-334 | 8 | N | CEP do Sacado |
| 45 | Nome Cedente | 335-380 | 46 | A | Nome do Cedente |
| 46 | CNPJ Cedente | 381-394 | 14 | N | CNPJ do Cedente |
| 47 | Seq. Registro | 395-400 | 6 | N | Numero Sequencial do Registro |

### Campos obrigatorios para Duplicata (Especie 01)

| Campo | Posicao | Descricao |
|-------|---------|-----------|
| Insc. Est. Sacado | 160-173 | Inscricao Estadual do Sacado |
| No Termo Cessao | 174-192 | Numero do Termo de Cessao |
| No NF Duplicata | 315-323 | Numero da Nota Fiscal |
| Serie NF | 324-326 | Serie da Nota Fiscal |

---

## Trailer (Tipo 9) - 400 bytes

| # | Campo | Posicao | Tamanho | Tipo | Valor / Descricao |
|---|-------|---------|---------|------|-------------------|
| 1 | Tipo Registro | 1 | 1 | N | `9` |
| 2 | Branco | 2-394 | 393 | A | Espacos em branco |
| 3 | Seq. Registro | 395-400 | 6 | N | Numero sequencial do ultimo registro |

---

## Codigos de Ocorrencia

| Codigo | Descricao | Observacao |
|--------|-----------|------------|
| 01 | Remessa | Entrada de titulo |
| 04 | Abatimento | Mediante justificativa |
| 06 | Alteracao de Vencimento | Para conciliacao |
| 14 | Pagamento Parcial | — |
| 71 | Baixa por Recompra Paulista | Com liquidacao consultoria |
| 72 | Recompra Parcial sem Adiantamento | — |
| 73 | Recompra Parcial com Adiantamento | — |
| 74 | Baixa por Recompra | Com liquidacao cedente |
| 75 | Baixa por Deposito Cedente | — |
| 76 | Baixa por Deposito Consultoria | — |
| 77 | Baixa por Deposito Sacado | — |
| 80 | Remessa Paulista | Com liquidacao consultoria |
| 81 | Entrada por Recompra | Troca de titulos |
| 84 | Entrada por Recompra | Com liquidacao cedente |
| 87 | Reativacao | — |

---

## Especies de Titulo

| Codigo | Descricao |
|--------|-----------|
| 01 | Duplicata |
| 02 | Nota Promissoria |
| 51 | Cheque |

---

## Regras Gerais

- **Encoding:** ISO-8859-1
- **Quebra de linha:** CRLF (`\r\n`)
- **Campos numericos:** zeros a esquerda, sem espacos
- **Campos alfanumericos:** espacos a direita, maiusculas, sem acentos, sem caracteres especiais
- **Datas:** formato DDMMAA (6 posicoes)
- **Valores monetarios:** 2 casas decimais implicitas, sem ponto ou virgula
- **Sequencial de registros:** iniciando em `000001` no Header, incrementando em cada linha
- O arquivo aceita 400 caracteres por linha (padrao) ou 444 caracteres (extensao Frontis para campos adicionais)
- Campos apos posicao 400 sao extensoes do layout Frontis (ex.: Numero da Nota Fiscal adicional)

### Exemplo de Valor Monetario

```
Valor R$ 2.470,56
No arquivo: 0000000247056   (13 posicoes)
```

### Exemplo de Campo Alfanumerico

```
Nome: "JOSE DA SILVA" (13 chars) em campo de 40 posicoes
No arquivo: "JOSE DA SILVA                           "
```

---

## Arquivo Modelo

Um arquivo de remessa modelo esta disponivel em [`CB250625AB.REM`](./CB250625AB.REM) com:

| Linha | Tipo | Descricao |
|-------|------|-----------|
| 1 | Header (0) | Empresa Modelo LTDA — Originador 00000000000123456789 |
| 2 | Detalhe (1) | Duplicata NF0001 — Sacado CNPJ 12.345.678/0001-95 — R$ 5.000,00 — Venc 31/07/25 |
| 3 | Detalhe (1) | Nota Promissoria NP0001 — Sacado CPF 123.456.789-00 — R$ 2.500,00 — Venc 15/08/25 |
| 4 | Trailer (9) | Encerramento |

Todas as linhas possuem exatamente **400 caracteres** + CRLF, encoding ISO-8859-1.

---

## Notas

- O sistema Frontis e utilizado por Banco Paulista S.A. para operacoes de FIDC (Fundos de Investimentos de Direitos Creditoios)
- O Codigo Originador (posicoes 27-46) e fornecido pelo Banco Paulista no momento do cadastro
- A identificacao do sistema `MX` (posicoes 109-110) e fixa para todas as remessas Frontis
- Coobrigacao, Modalidade Operacao, Natureza Operacao, Origem Recurso e Classe Risco sao campos especificos do SRC3040 (Banco Central) — consultar anexos do manual oficial
- Sempre confirmar posicoes exatas com o manual oficial Frontis / Banco Paulista CNAB 400
