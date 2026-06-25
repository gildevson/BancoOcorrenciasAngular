# Retorno CNAB 400 — Santander (033)

**Banco:** Santander Brasil  
**Código COMPE:** 033  
**Formato:** CNAB 400  
**Encoding:** ISO-8859-1  
**Tamanho por linha:** 400 caracteres (fixo)  
**Terminador de linha:** CRLF (`\r\n`)  
**Referência:** Layout de Cobrança CNAB 400 — Santander (jul/2025)

---

## O que é o arquivo de retorno?

O arquivo de retorno é enviado pelo Santander ao cedente com a confirmação de todas as ocorrências processadas: entradas confirmadas, liquidações, baixas, protestos, rejeições e outros eventos. Deve ser processado **diariamente**.

---

## Estrutura do Arquivo

| Tipo | Identificador | Descrição | Quantidade |
|------|--------------|-----------|------------|
| 0 | Posição 1 = `0` | Header | 1 (obrigatório) |
| 1 | Posição 1 = `1` | Detalhe (ocorrência) | 1 por evento |
| 9 | Posição 1 = `9` | Trailer | 1 (obrigatório) |

---

## Header (Tipo 0) — 400 bytes

| # | Campo | Posição | Tam | Tipo | Valor / Descrição |
|---|-------|---------|-----|------|-------------------|
| 1 | Tipo Registro | 1 | 1 | N | `0` |
| 2 | Ident. Arquivo Retorno | 2 | 1 | N | `2` (retorno) |
| 3 | Literal Retorno | 3–9 | 7 | A | `RETORNO` |
| 4 | Código de Serviço | 10–11 | 2 | N | `01` |
| 5 | Literal Serviço | 12–19 | 8 | A | `COBRANCA` |
| 6 | Branco | 20–26 | 7 | A | Espaços em branco |
| 7 | Agência Cedente | 27–30 | 4 | N | Número da agência |
| 8 | Dígito da Agência | 31 | 1 | A | Dígito verificador |
| 9 | Conta Corrente | 32–37 | 6 | N | Número da conta |
| 10 | Dígito da Conta | 38 | 1 | A | Dígito verificador |
| 11 | Branco | 39 | 1 | A | Espaço em branco |
| 12 | Código do Cedente | 40–46 | 7 | N | Código do cedente no Santander |
| 13 | Nome da Empresa | 47–76 | 30 | A | Razão social do cedente |
| 14 | Código do Banco | 77–79 | 3 | N | `033` |
| 15 | Nome do Banco | 80–94 | 15 | A | `SANTANDER` + espaços |
| 16 | Data de Geração | 95–100 | 6 | N | DDMMAA (data do arquivo) |
| 17 | Nº Sequencial de Retorno | 101–107 | 7 | N | Sequencial do arquivo de retorno |
| 18 | Branco | 108–394 | 287 | A | Espaços em branco |
| 19 | Nº Sequencial do Registro | 395–400 | 6 | N | `000001` (fixo no header) |

---

## Detalhe (Tipo 1) — 400 bytes

| # | Campo | Posição | Tam | Tipo | Valor / Descrição |
|---|-------|---------|-----|------|-------------------|
| 1 | Tipo Registro | 1 | 1 | N | `1` |
| 2 | Tipo Inscrição Empresa | 2–3 | 2 | N | `01`=CPF · `02`=CNPJ |
| 3 | Nº Inscrição Empresa (CNPJ/CPF) | 4–17 | 14 | N | CNPJ ou CPF do cedente |
| 4 | Agência | 18–21 | 4 | N | Agência do cedente |
| 5 | Dígito da Agência | 22 | 1 | A | Dígito verificador |
| 6 | Conta Corrente | 23–28 | 6 | N | Conta do cedente |
| 7 | Dígito da Conta | 29 | 1 | A | Dígito verificador |
| 8 | Branco | 30–31 | 2 | A | Espaços em branco |
| 9 | Nosso Número | 32–38 | 7 | N | Nosso número (mesmo da remessa) |
| 10 | Dígito do Nosso Número | 39 | 1 | A | Dígito verificador |
| 11 | Branco | 40 | 1 | A | Espaço em branco |
| 12 | Carteira | 41 | 1 | A | Código da carteira |
| 13 | Variação da Carteira | 42–45 | 4 | N | Variação da carteira |
| 14 | Nº do Documento (Empresa) | 46–62 | 17 | A | Nº do documento enviado na remessa |
| 15 | **Código de Ocorrência** | 63–64 | 2 | N | **Principal campo do retorno** — ver tabela abaixo |
| 16 | Data da Ocorrência | 65–70 | 6 | N | DDMMAA — data em que ocorreu o evento |
| 17 | Data de Vencimento | 71–76 | 6 | N | DDMMAA — vencimento original do título |
| 18 | Valor do Título | 77–89 | 13 | N | Valor original em centavos |
| 19 | Banco Cobrador | 90–92 | 3 | N | `033` = Santander |
| 20 | Agência Cobradora | 93–97 | 5 | N | Agência responsável pela cobrança |
| 21 | Valor Pago / Creditado | 98–110 | 13 | N | Valor efetivamente recebido (centavos) |
| 22 | Valor de Mora Cobrado | 111–123 | 13 | N | Mora/juros cobrados (centavos) |
| 23 | Valor de Desconto Concedido | 124–136 | 13 | N | Desconto concedido (centavos) |
| 24 | Valor do IOF | 137–149 | 13 | N | IOF debitado (centavos) |
| 25 | Valor do Abatimento Concedido | 150–162 | 13 | N | Abatimento concedido (centavos) |
| 26 | Data do Crédito | 163–168 | 6 | N | DDMMAA — data de crédito na conta |
| 27 | Nº do Banco Cobrador (Documento) | 169–178 | 10 | A | Nº do documento no banco cobrador |
| 28 | Tipo Inscrição Pagador | 179–180 | 2 | N | `01`=CPF · `02`=CNPJ |
| 29 | Nº Inscrição Pagador (CNPJ/CPF) | 181–194 | 14 | N | CNPJ ou CPF do pagador |
| 30 | Nome do Pagador | 195–234 | 40 | A | Nome / Razão social |
| 31 | Endereço do Pagador | 235–264 | 30 | A | Logradouro |
| 32 | Bairro do Pagador | 265–274 | 10 | A | Bairro |
| 33 | Cidade do Pagador | 275–284 | 10 | A | Cidade |
| 34 | UF do Pagador | 285–286 | 2 | A | Estado (sigla) |
| 35 | CEP | 287–291 | 5 | N | Parte inicial do CEP |
| 36 | Sufixo do CEP | 292–294 | 3 | N | Complemento do CEP |
| 37 | Uso do Banco / Motivo de Rejeição | 295–394 | 100 | A | Código de motivo de rejeição (quando ocorrência 03/06) |
| 38 | Nº Sequencial do Registro | 395–400 | 6 | N | Sequencial crescente |

---

## Trailer (Tipo 9) — 400 bytes

| # | Campo | Posição | Tam | Tipo | Valor / Descrição |
|---|-------|---------|-----|------|-------------------|
| 1 | Tipo Registro | 1 | 1 | N | `9` |
| 2 | Qtd. Registros de Detalhe | 2–7 | 6 | N | Total de registros tipo 1 |
| 3 | Valor Total Liquidado | 8–20 | 13 | N | Soma dos valores pagos em centavos |
| 4 | Branco | 21–394 | 374 | A | Espaços em branco |
| 5 | Nº Sequencial do Registro | 395–400 | 6 | N | Sequencial do último registro |

---

## Tabela de Códigos de Ocorrência (Posições 63–64)

### Entradas e Confirmações

| Código | Descrição | Ação recomendada |
|--------|-----------|------------------|
| `02` | Entrada confirmada | Marcar título como "registrado no banco" |
| `03` | Entrada rejeitada | Verificar motivo de rejeição (posições 295–394) e corrigir |
| `26` | Instrução rejeitada | Instrução enviada na remessa foi recusada |
| `30` | Alteração de dados rejeitada | Verificar motivo e reenviar |

### Liquidações (Pagamentos)

| Código | Descrição | Ação recomendada |
|--------|-----------|------------------|
| `06` | Liquidação normal | Marcar como pago — usar **Valor Pago** (pos. 98–110) |
| `07` | Liquidação parcial | Pagamento parcial — verificar valor e tratar saldo |
| `08` | Liquidação em cartório | Pago após protesto — baixar e registrar custo cartório |
| `15` | Liquidação em cartório após baixa | Pago mesmo após baixa administrativa |
| `17` | Liquidação após baixa | Pagamento recebido após título ter sido baixado |
| `40` | Estorno de pagamento | Pagamento revertido — reabrir título |

### Baixas

| Código | Descrição | Ação recomendada |
|--------|-----------|------------------|
| `09` | Baixa por instrução do cedente | Confirmar baixa administrativa |
| `10` | Baixa por devolução ao cedente | Título devolvido sem pagamento |
| `25` | Baixa após protesto | Protestado e baixado por instrução |

### Protestos

| Código | Descrição | Ação recomendada |
|--------|-----------|------------------|
| `19` | Confirmação de envio a protesto | Título encaminhado ao cartório |
| `20` | Confirmação de sustação de protesto | Protesto sustado com sucesso |
| `23` | Remessa a cartório | Enviado ao cartório de protesto |
| `24` | Retirada de cartório | Retirado do cartório antes da lavratura |
| `74` | Confirmação instrução de não protestar | Instrução "não protestar" confirmada |

### Negativação

| Código | Descrição | Ação recomendada |
|--------|-----------|------------------|
| `33` | Confirmação de negativação | Pagador negativado com sucesso |
| `34` | Confirmação de exclusão de negativação | Negativação removida |
| `35` | Negativação rejeitada | Verificar motivo e reprocessar |
| `32` | Instrução de negativação rejeitada | Instrução não aceita |

### Alterações e Outros

| Código | Descrição | Ação recomendada |
|--------|-----------|------------------|
| `12` | Abatimento concedido | Abatimento registrado no banco |
| `13` | Abatimento cancelado | Abatimento estornado |
| `14` | Alteração de vencimento confirmada | Novo vencimento registrado |
| `27` | Confirmação de alteração de outros dados | Alteração aceita |
| `28` | Débito de tarifas/custas | Desconto de tarifa bancária — ver valor (pos. 24) |
| `36` | Acerto do controle de participação | Correção interna do banco |
| `68` / `69` | Acerto de depositária | Ajuste interno — geralmente desconsiderar |
| `72` | Manutenção de título vencido | Título mantido em carteira vencido |

---

## Motivos de Rejeição (posições 295–394 quando ocorrência = `03`)

Os motivos aparecem como **códigos de 2 dígitos** dentro do campo "Uso do Banco":

| Código | Descrição |
|--------|-----------|
| `03` | CEP inválido |
| `04` | Nome/Endereço do pagador inválido |
| `05` | Data de vencimento inválida |
| `07` | Valor do título inválido |
| `08` | Nosso número já existe para o cedente |
| `09` | Nosso número inválido |
| `10` | Carteira inválida |
| `13` | Identificação de emissão inválida |
| `14` | Tipo de moeda inválido |
| `15` | Data de desconto inválida |
| `17` | Espécie inválida |
| `18` | Tipo de inscrição do cedente inválido |
| `21` | CNPJ/CPF do cedente inválido |
| `22` | CNPJ/CPF do pagador inválido |
| `24` | Data de emissão inválida |
| `26` | Código do cedente inválido |
| `27` | Código de instrução inválido |
| `28` | Valor de mora inválido |
| `29` | Valor de desconto inválido |
| `30` | Valor de abatimento inválido |
| `34` | Agência/conta do cedente inválida |
| `37` | Número do documento inválido |
| `40` | Data do arquivo inválida |
| `57` | Data de protesto inválida |
| `85` | Valor do IOF inválido |

---

## Fluxo de Processamento Recomendado

```
Receber arquivo .RET do Santander
          │
          ▼
   Ler Header (Tipo 0)
   → Confirmar banco = 033
   → Conferir data de geração
          │
          ▼
   Para cada Detalhe (Tipo 1):
   ┌─────────────────────────────────┐
   │ Ler Nosso Número (pos. 32–38)   │
   │ Ler Código Ocorrência (63–64)   │
   └─────────────────────────────────┘
          │
   ┌──────┴──────────────────────────────────┐
   │ 02 → Confirmar entrada no banco         │
   │ 06 → Quitar título com valor (98–110)   │
   │ 07 → Liquidação parcial — tratar saldo  │
   │ 03 → Rejeição — corrigir e reenviar     │
   │ 09 → Baixa administrativa confirmada    │
   │ 28 → Debitar tarifa bancária            │
   │ 40 → Estorno — reabrir título           │
   └─────────────────────────────────────────┘
          │
          ▼
   Ler Trailer (Tipo 9)
   → Conferir quantidade de registros
   → Conferir valor total liquidado
```

---

## Observações Importantes

- **Sempre conferir o Trailer:** a quantidade de registros (pos. 2–7) deve bater com o total de detalhes lidos.
- **Ocorrência `06` é a principal:** corresponde a pagamentos normais — usar o **Valor Pago** (pos. 98–110), não o valor do título.
- **Tarifas (ocorrência `28`):** são debitadas da conta do cedente; o valor aparece como negativo no extrato bancário.
- **Arquivos diários:** o Santander disponibiliza o retorno uma vez por dia; processar sempre antes de gerar nova remessa.
- **Encoding obrigatório:** sempre ler com **ISO-8859-1** — caracteres acentuados ficam corrompidos em UTF-8.
- **Rejeições (ocorrência `03`):** corrigir o erro apontado no motivo e reenviar o título na **próxima remessa** (não alterar o nosso número).
