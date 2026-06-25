# Retorno CNAB 240 — Santander (033)

**Banco:** Santander Brasil  
**Código COMPE:** 033  
**Formato:** CNAB 240  
**Encoding:** ISO-8859-1  
**Tamanho por linha:** 240 caracteres (fixo)  
**Terminador de linha:** CRLF (`\r\n`)  
**Versão do Layout:** 089 (FEBRABAN)

---

## Estrutura do Arquivo de Retorno

| Tipo | Segmento | Descrição |
|------|----------|-----------|
| 0 | — | Header de Arquivo (pos. 143 = `2` = Retorno) |
| 1 | — | Header de Lote |
| 3 | T | Detalhe — Dados do Título Retornado |
| 3 | U | Detalhe — Informações Financeiras |
| 5 | — | Trailer de Lote |
| 9 | — | Trailer de Arquivo |

---

## Header de Arquivo (Tipo 0) — 240 bytes

Idêntico ao Header de Remessa, exceto:

| Campo | Posição | Valor |
|-------|---------|-------|
| Código Remessa/Retorno | 143 | `2` = Retorno |

> Os demais campos são iguais ao Header da Remessa.

---

## Header de Lote (Tipo 1) — 240 bytes

| # | Campo | Posição | Tam | Tipo | Valor / Descrição |
|---|-------|---------|-----|------|-------------------|
| 1 | Código do Banco | 1–3 | 3 | N | `033` |
| 2 | Lote de Serviço | 4–7 | 4 | N | Número do lote |
| 3 | Tipo de Registro | 8 | 1 | N | `1` |
| 4 | Tipo de Operação | 9 | 1 | A | `T` = Retorno |
| 5 | Tipo de Serviço | 10–11 | 2 | N | `01` = Cobrança |
| 6 | Forma de Lançamento | 12–13 | 2 | N | `01` |
| 7 | Versão Layout do Lote | 14–16 | 3 | N | `040` |
| 8 | Uso Banco | 17 | 1 | A | Branco |
| 9 | Tipo de Inscrição | 18 | 1 | N | `1`=CPF · `2`=CNPJ |
| 10 | Número de Inscrição | 19–32 | 14 | N | CNPJ ou CPF |
| 11 | Código do Convênio | 33–52 | 20 | A | Código do cedente |
| 12 | Agência | 53–57 | 5 | N | Agência |
| 13 | Dígito Agência | 58 | 1 | A | Dígito |
| 14 | Conta Corrente | 59–70 | 12 | N | Conta |
| 15 | Dígito Conta | 71 | 1 | A | Dígito |
| 16 | Dígito Ag/Conta | 72 | 1 | A | Dígito |
| 17 | Nome da Empresa | 73–102 | 30 | A | Razão social |
| 18 | Informação 1 | 103–142 | 40 | A | Mensagem |
| 19 | Informação 2 | 143–182 | 40 | A | Mensagem |
| 20 | Nº do Retorno | 183–192 | 10 | N | Sequencial do retorno |
| 21 | Data de Gravação | 193–200 | 8 | N | DDMMAAAA |
| 22 | Data do Crédito | 201–208 | 8 | N | DDMMAAAA |
| 23 | Uso Banco | 209–240 | 32 | A | Brancos |

---

## Segmento T (Tipo 3) — Dados do Título Retornado — 240 bytes

| # | Campo | Posição | Tam | Tipo | Valor / Descrição |
|---|-------|---------|-----|------|-------------------|
| 1 | Código do Banco | 1–3 | 3 | N | `033` |
| 2 | Lote de Serviço | 4–7 | 4 | N | Número do lote |
| 3 | Tipo de Registro | 8 | 1 | N | `3` |
| 4 | Nº Seq. Reg. no Lote | 9–13 | 5 | N | Sequencial |
| 5 | Segmento | 14 | 1 | A | `T` |
| 6 | Uso Banco | 15 | 1 | A | Branco |
| 7 | **Código de Ocorrência** | 16–17 | 2 | N | **Principal campo do retorno** — ver tabela |
| 8 | Agência | 18–22 | 5 | N | Agência do cedente |
| 9 | Dígito Agência | 23 | 1 | A | Dígito |
| 10 | Conta Corrente | 24–35 | 12 | N | Conta do cedente |
| 11 | Dígito Conta | 36 | 1 | A | Dígito |
| 12 | Dígito Ag/Conta | 37 | 1 | A | Dígito |
| 13 | Nosso Número | 38–57 | 20 | N | Nosso número |
| 14 | Código da Carteira | 58 | 1 | N | Carteira |
| 15 | Número do Documento | 59–73 | 15 | A | Seu número |
| 16 | Data de Vencimento | 74–81 | 8 | N | DDMMAAAA |
| 17 | Valor Nominal do Título | 82–96 | 15 | N | Centavos |
| 18 | Banco Cobrador | 97–101 | 5 | N | `00033` |
| 19 | Dígito Ag. Cobradora | 102 | 1 | A | Dígito |
| 20 | Seu Número (Empresa) | 103–117 | 15 | A | Referência da empresa |
| 21 | Data Crédito | 118–125 | 8 | N | DDMMAAAA |
| 22 | Valor do Pagamento | 126–139 | 14 | N | Valor efetivo em centavos |
| 23 | Outras Deduções | 140–153 | 14 | N | Centavos |
| 24 | Mora / Multa | 154–167 | 14 | N | Centavos |
| 25 | Outros Acréscimos | 168–181 | 14 | N | Centavos |
| 26 | Valor do Abatimento | 182–195 | 14 | N | Centavos |
| 27 | Valor do IOF | 196–209 | 14 | N | Centavos |
| 28 | Valor Líquido | 210–223 | 14 | N | Valor creditado em conta |
| 29 | Código Ocorrência Pagador | 224–225 | 2 | N | Ocorrência do pagador |
| 30 | Data da Ocorrência | 226–233 | 8 | N | DDMMAAAA |
| 31 | Uso Banco | 234–240 | 7 | A | Brancos |

---

## Segmento U (Tipo 3) — Informações Financeiras Retorno — 240 bytes

| # | Campo | Posição | Tam | Tipo | Valor / Descrição |
|---|-------|---------|-----|------|-------------------|
| 1 | Código do Banco | 1–3 | 3 | N | `033` |
| 2 | Lote | 4–7 | 4 | N | Número do lote |
| 3 | Tipo de Registro | 8 | 1 | N | `3` |
| 4 | Nº Seq. Reg. no Lote | 9–13 | 5 | N | Sequencial |
| 5 | Segmento | 14 | 1 | A | `U` |
| 6 | Uso Banco | 15 | 1 | A | Branco |
| 7 | Código de Ocorrência | 16–17 | 2 | N | Mesmo do Segmento T |
| 8 | Juros / Mora | 18–31 | 14 | N | Centavos |
| 9 | Desconto | 32–45 | 14 | N | Centavos |
| 10 | Abatimento | 46–59 | 14 | N | Centavos |
| 11 | IOF | 60–73 | 14 | N | Centavos |
| 12 | Valor Pago | 74–87 | 14 | N | Centavos |
| 13 | Valor Líquido | 88–101 | 14 | N | Centavos |
| 14 | Outras Deduções | 102–115 | 14 | N | Centavos |
| 15 | Outros Acréscimos | 116–129 | 14 | N | Centavos |
| 16 | Data Vencimento | 130–137 | 8 | N | DDMMAAAA |
| 17 | Data Pagamento | 138–145 | 8 | N | DDMMAAAA |
| 18 | Data Crédito | 146–153 | 8 | N | DDMMAAAA |
| 19 | Data Débito | 154–161 | 8 | N | DDMMAAAA |
| 20 | Uso Banco | 162–209 | 48 | A | Brancos |
| 21 | Código das Ocorrências | 210–219 | 10 | A | 5 códigos de 2 chars cada |
| 22 | Uso FEBRABAN | 220–240 | 21 | A | Brancos |

---

## Trailer de Lote (Tipo 5) — 240 bytes

Idêntico ao da remessa. Campo **Valor Total** acumula o total creditado.

---

## Trailer de Arquivo (Tipo 9) — 240 bytes

Idêntico ao da remessa.

---

## Tabela de Códigos de Ocorrência (Posições 16–17 do Segmento T)

### Entradas e Confirmações

| Código | Descrição | Ação |
|--------|-----------|------|
| `02` | Entrada Confirmada | Marcar título como registrado |
| `03` | Entrada Rejeitada | Verificar código de rejeição |
| `26` | Instrução Rejeitada | Instrução não aceita pelo banco |
| `28` | Débito de Tarifas/Custas | Tarifa debitada da conta |
| `30` | Alteração de Dados Rejeitada | Corrigir dados e reenviar |

### Liquidações (Pagamentos)

| Código | Descrição | Ação |
|--------|-----------|------|
| `06` | Liquidação Normal | Usar **Valor Pago** (Seg. U pos. 74–87) |
| `07` | Liquidação Parcial | Tratar saldo remanescente |
| `08` | Liquidação em Cartório | Pago após protesto |
| `15` | Liquidação em Cartório após Baixa | Pagamento tardio |
| `17` | Liquidação após Baixa | Recebido após baixa |
| `40` | Estorno de Pagamento | Reabrir título |

### Baixas

| Código | Descrição | Ação |
|--------|-----------|------|
| `09` | Baixa por Instrução do Cedente | Confirmar baixa |
| `10` | Baixa por Devolução | Título devolvido |
| `12` | Baixa por Protesto | Protestado e baixado |
| `25` | Baixa após Protesto | Baixa após lavratura |
| `60` | Baixa por Devolução / Cancelamento | Cancelamento administrativo |

### Protestos

| Código | Descrição | Ação |
|--------|-----------|------|
| `19` | Confirmação de Envio a Protesto | Encaminhado ao cartório |
| `20` | Sustação de Protesto | Protesto sustado |
| `23` | Remessa a Cartório | Enviado ao cartório |
| `24` | Retirada de Cartório | Retirado antes da lavratura |

### Alterações Confirmadas

| Código | Descrição | Ação |
|--------|-----------|------|
| `04` | Concessão de Abatimento | Abatimento aplicado |
| `05` | Cancelamento de Abatimento | Abatimento revertido |
| `11` | Abatimento Concedido em Cartório | Aplicado no cartório |
| `13` | Confirmação de Desconto | Desconto confirmado |
| `14` | Vencimento Alterado | Novo vencimento ativo |
| `27` | Confirmação de Alteração de Dados | Alteração aceita |

---

## Fluxo de Processamento Recomendado

```
Receber arquivo .RET do Santander
         │
         ▼
  Ler Header (Tipo 0)
  → Confirmar banco = 033
  → Confirmar pos. 143 = '2' (retorno)
         │
         ▼
  Para cada par Seg. T + Seg. U:
  ┌───────────────────────────────────────────┐
  │ Seg T pos. 38–57  → Nosso Número          │
  │ Seg T pos. 16–17  → Código de Ocorrência  │
  │ Seg U pos. 74–87  → Valor Pago            │
  │ Seg U pos. 146–153→ Data do Crédito       │
  └───────────────────────────────────────────┘
         │
  ┌──────┴──────────────────────────────────────┐
  │ 02 → Confirmar registro do título           │
  │ 06 → Baixar título — usar Valor Pago        │
  │ 03 → Rejeição — corrigir e reenviar         │
  │ 09 → Baixa confirmada                       │
  │ 40 → Estorno — reabrir título               │
  └─────────────────────────────────────────────┘
         │
         ▼
  Ler Trailer de Lote (Tipo 5)
  → Verificar qtd. e total
         │
         ▼
  Ler Trailer de Arquivo (Tipo 9)
  → Verificar qtd. total de registros
```

---

## Observações Importantes

- O retorno CNAB 240 sempre vem em **pares de segmentos**: T seguido de U para o mesmo título.
- O **Código de Ocorrência** no Segmento T (pos. 16–17) é o campo mais importante — define o que aconteceu com o título.
- Para liquidações (ocorrência `06`), usar o **Valor Pago** no Segmento U (pos. 74–87), não o valor nominal.
- O campo **Data Crédito** no Segmento U (pos. 146–153) indica quando o dinheiro entrou na conta.
- **Tarifas** (ocorrência `28`): são debitadas automaticamente — verificar o valor no Segmento U.
- Arquivos processados diariamente; processar antes de gerar nova remessa.
