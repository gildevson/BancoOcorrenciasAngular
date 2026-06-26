# UY3 DTVM — CNAB 400 Cobrança — Retorno
> Manual de Procedimentos — Versão Julho/2024

---

## Informações Gerais

| Item | Valor |
|------|-------|
| Banco | UY3 |
| Código na Câmara de Compensação | **457** |
| Identificação do Sistema | **MX** |
| Formato | CNAB 400 (400 chars por linha, ISO-8859-1) |
| Extensão Retorno | `.RET` |
| Transmissão | sFTP → pasta `/Retorno/` |

---

## Estrutura do Arquivo de Retorno

| Tipo | Identificador | Descrição |
|------|---------------|-----------|
| `0` | Header | Abertura do arquivo |
| `1` | Detalhe / Transação | Um registro por ocorrência |
| `9` | Trailer | Encerramento — contém totalizadores |

---

## Retorno Header Label — Tipo 0

| Campo | Descrição | Pos Ini | Tam | Pos Fim | Tipo |
|-------|-----------|---------|-----|---------|------|
| Identificação do Registro | `0` | 1 | 1 | 1 | N |
| Identificação do Arquivo-Retorno | `1` | 2 | 1 | 2 | N |
| Literal Retorno | `RETORNO` | 3 | 7 | 9 | A |
| Código de Serviço | `01` | 10 | 2 | 11 | N |
| Literal Serviço | `COBRANÇA` | 12 | 15 | 26 | A |
| Código do Convênio | Código fornecido pela UY3 | 27 | 20 | 46 | N |
| Nome da Empresa | Razão Social | 47 | 30 | 76 | A |
| Número UY3 na Câmara de Compensação | `457` | 77 | 3 | 79 | N |
| Nome do Banco | `UY3` | 80 | 15 | 94 | A |
| Data do Arquivo | DDMMAA | 95 | 6 | 100 | N |
| Densidade de Gravação | `01600000` (fixo) | 101 | 8 | 108 | N |
| Nº Sequencial do Retorno | Sequencial retorno | 109 | 5 | 113 | N |
| Branco | Branco | 114 | 266 | 379 | A |
| Data do Crédito | DDMMAA | 380 | 6 | 385 | N |
| Branco | Branco | 386 | 9 | 394 | A |
| Nº Sequencial do Registro | `000001` | 395 | 6 | 400 | N |

---

## Retorno Transação — Tipo 1

| Campo | Descrição | Pos Ini | Tam | Pos Fim | Tipo |
|-------|-----------|---------|-----|---------|------|
| Identificação do Registro | `1` | 1 | 1 | 1 | N |
| Tipo Inscrição da Empresa | `01`=CPF, `02`=CNPJ | 2 | 1 | 3 | N |
| Identificação da Empresa (CPF/CNPJ) | CNPJ/CPF do Cedente | 4 | 14 | 17 | N |
| Branco | Branco | 18 | 3 | 20 | A |
| Ident. Empresa Beneficiária no Banco | Zero + Carteira + Agência + Conta | 21 | 17 | 37 | A |
| Nº do Controle do Participante | Conforme enviado na remessa (pos 38, 25 chars) | 38 | 25 | 62 | A |
| Zero | `00000000` | 63 | 8 | 70 | N |
| Identificação do Nosso Número | Confirmação do nosso número (12 chars) | 71 | 12 | 82 | A |
| Uso do Banco | Uso interno | 83 | 22 | 105 | N |
| Branco | Branco | 106 | 2 | 107 | A |
| Carteira | Carteira | 108 | 1 | 108 | N |
| Identificação de Ocorrência | Vide tabela ocorrências retorno | 109 | 2 | 110 | N |
| Data da Ocorrência no Banco | DDMMAA | 111 | 6 | 116 | N |
| Número do Documento | Conforme enviado na remessa (pos 111) | 117 | 10 | 126 | A |
| Nosso Número | Mesmo das posições 71–82 da remessa | 127 | 14 | 140 | N |
| Vencimento | DDMMAA | 147 | 6 | 152 | N |
| Valor | Valor do título | 153 | 13 | 165 | N |
| Banco Cobrador | `457` | 166 | 3 | 168 | N |
| Agência Cobradora | Código da agência cobradora | 169 | 5 | 173 | N |
| Branco | Branco | 174 | 2 | 175 | A |
| Tarifas de Cobrança | Para ocorrências 02 e 28 | 176 | 13 | 188 | N |
| Despesas | Outras despesas / Custas de Protesto | 189 | 13 | 201 | N |
| Zero | Zero | 202 | 26 | 227 | N |
| Abatimento Concedido | Valor de abatimento | 228 | 13 | 240 | N |
| Desconto Concedido | Valor de desconto | 241 | 13 | 253 | N |
| Valor Pago | Valor pago | 254 | 13 | 266 | N |
| Juros de Mora | Juros de mora | 267 | 13 | 279 | N |
| Outros Créditos | Outros créditos | 280 | 13 | 292 | N |
| Branco | Branco | 293 | 2 | 294 | A |
| Instrução de Protesto | `A`=Aceito, `D`=Desprezado | 295 | 1 | 295 | A |
| Data do Crédito | DDMMAA | 296 | 6 | 301 | N |
| Branco | Branco | 302 | 17 | 318 | A |
| Motivo Rejeição | Vide tabela motivos retorno | 319 | 10 | 328 | N |
| Branco | Branco | 329 | 40 | 368 | A |
| Número do Cartório | Nº Cartório | 369 | 2 | 370 | N |
| Número do Protocolo | Protocolo do Cartório | 371 | 10 | 380 | A |
| Branco | Branco | 381 | 14 | 394 | A |
| Nº Sequencial de Registro | Sequencial | 395 | 6 | 400 | N |

---

## Retorno Trailer — Tipo 9

| Campo | Descrição | Pos Ini | Tam | Pos Fim | Tipo |
|-------|-----------|---------|-----|---------|------|
| Identificação do Registro | `9` | 1 | 1 | 1 | N |
| Identificação do Retorno | `20` | 2 | 2 | 3 | A |
| Identificação Tipo de Registro | `1` | 4 | 1 | 4 | N |
| Código do Banco | `457` | 5 | 3 | 7 | N |
| Brancos | Brancos | 8 | 32 | 39 | A |
| Sequencial Arquivo Retorno | Sequencial | 40 | 8 | 47 | N |
| Brancos | Brancos | 48 | 10 | 57 | A |
| Qtd. Registros — Ocorrência 02 (Entradas Confirmadas) | Quantidade | 58 | 5 | 62 | N |
| Valor Registros — Ocorrência 02 | Valor total | 63 | 12 | 74 | N |
| Valor Registros — Ocorrência 06 (Liquidação) | Valor total | 75 | 12 | 86 | N |
| Qtd. Registros — Ocorrência 06 | Quantidade | 87 | 5 | 91 | N |
| Zero | Zero | 92 | 12 | 103 | N |
| Qtd. Registros — Ocorrências 09 e 10 (Baixados) | Quantidade | 104 | 5 | 108 | N |
| Valor Registros — Ocorrências 09 e 10 | Valor total | 109 | 12 | 120 | N |
| Zero | Zero | 121 | 17 | 137 | N |
| Qtd. Registros — Ocorrência 14 (Vencimento Alterado) | Quantidade | 138 | 5 | 142 | N |
| Valor Registros — Ocorrência 14 | Valor total | 143 | 12 | 154 | N |
| Qtd. Registros — Ocorrência 12 (Abatimento Concedido) | Quantidade | 155 | 5 | 159 | N |
| Valor Registros — Ocorrência 12 | Valor total | 160 | 12 | 171 | N |
| Qtd. Registros — Ocorrência 19 (Conf. Instrução Protesto) | Quantidade | 172 | 5 | 176 | N |
| Valor Registros — Ocorrência 19 | Valor total | 177 | 12 | 188 | N |
| Brancos | Brancos | 189 | 206 | 394 | A |
| Nº Sequencial do Registro | Sequencial | 395 | 6 | 400 | N |

---

## Ocorrências — Retorno (pos 109–110)

| Código | Descrição | Observação |
|--------|-----------|------------|
| `02` | Entrada Confirmada | Verificar motivo pos 319–328 |
| `03` | Entrada Rejeitada | Verificar motivo pos 319–328 — vide Motivos |
| `06` | Liquidação Normal | Sem motivo |
| `09` | Baixado Automaticamente via Arquivo | Verificar motivo pos 319–328 |
| `10` | Baixado conforme Instruções da Agência | Verificar motivo pos 319–328 |
| `12` | Abatimento Concedido | — |
| `13` | Abatimento Cancelado | — |
| `14` | Vencimento Alterado | — |
| `15` | Liquidação em Cartório | Sem motivo |
| `16` | Título Pago em Cheque - Vinculado | — |
| `19` | Confirmação Receb. Inst. de Protesto | Verificar motivo pos 295 |
| `20` | Confirmação Recebimento Instrução Sustação de Protesto | — |
| `21` | Acerto Controle Participante | — |
| `23` | Entrada do Título em Cartório | — |
| `24` | Entrada Rejeitada por CEP Irregular | Verificar motivo pos 319–328 |
| `27` | Baixa Rejeitada | — |
| `28` | Débito de Tarifas/Custas | Verificar motivo pos 319–328 |
| `32` | Instrução Rejeitada | Verificar motivo pos 319–328 |
| `33` | Confirmação Pedido Alteração Outros Dados | — |
| `34` | Retirado de Cartório e Manutenção Carteira | — |
| `55` | Sustado Judicial | — |

---

## Motivos de Rejeição / Retorno

### Ocorrência 03 — Entrada Rejeitada

| Código | Motivo |
|--------|--------|
| `00` | Ocorrência Aceita |
| `02` | Código do Registro Detalhe Inválido |
| `03` | Código da Ocorrência Inválida |
| `04` | Código de Ocorrência não Permitida para a Carteira |
| `05` | Código de Ocorrência não Numérico |
| `08` | Nosso Número Inválido |
| `09` | Nosso Número Duplicado |
| `10` | Carteira Inválida |
| `13` | Identificação da Emissão do Bloqueto Inválida |
| `16` | Data de Vencimento Inválida |
| `17` | Valor do Título Inválido |
| `18` | Espécie do Título Inválida |
| `19` | Espécie não Permitida para a Carteira |
| `23` | Tipo Pagamento não Contratado |
| `24` | Data de Emissão Inválida |
| `27` | Valor/Taxa de Juros Mora Inválido |
| `28` | Código do Desconto Inválido |
| `29` | Valor Desconto ≥ Valor Título |
| `32` | Valor do IOF Inválido |
| `34` | Valor do Abatimento ≥ Valor do Título |
| `38` | Prazo para Protesto/Negativação Inválido |
| `39` | Pedido de Protesto/Negativação não Permitida para o Título |
| `41` | Envio de sustação para título não protestado |
| `42` | Envio de sustação para título sem instrução de protesto |
| `46` | Código da Moeda Inválido |
| `47` | Nome do Pagador não Informado |
| `48` | Tipo/Número de Inscrição do Pagador Inválidos |
| `49` | Endereço do Pagador não Informado |
| `50` | CEP Inválido |
| `51` | CEP sem Praça de Cobrança |
| `52` | CEP Irregular - Banco Correspondente |
| `53` | Tipo/Número de Inscrição do Beneficiário Final Inválido |
| `54` | Sacador/Avalista (Beneficiário Final) não Informado |
| `59` | Valor/Percentual da Multa Inválido |
| `63` | Entrada para Título já Cadastrado |
| `66` | Número Autorização Inexistente |
| `97` | Título Baixado |

### Ocorrência 09 — Baixado Automaticamente via Arquivo

| Código | Motivo |
|--------|--------|
| `00` | Ocorrência Aceita |
| `10` | Baixa Comandada pelo Cliente |

### Ocorrência 10 — Baixado pelo Banco

| Código | Motivo |
|--------|--------|
| `00` | Baixado Conforme Instruções da Agência |
| `14` | Título Protestado |
| `16` | Título Baixado pelo Banco por Decurso Prazo |
| `20` | Título Baixado e Transferido para Desconto |

### Ocorrência 24 — Entrada Rejeitada por CEP Irregular

| Código | Motivo |
|--------|--------|
| `00` | Ocorrência Aceita |
| `48` | CEP Inválido |
| `49` | CEP sem Praça de Cobrança |

### Ocorrência 28 — Débito de Tarifas/Custas

| Código | Motivo |
|--------|--------|
| `08` | Custas de Protesto |

### Ocorrência 32 — Instrução Rejeitada

| Código | Motivo |
|--------|--------|
| `42` | Pedido de Sustação/Excl p/ Título Protestado/Negativado |
| `88` | Título irregular no cartório |

---

## Estrutura sFTP

```
/Retorno/             ← arquivos .RET de retorno
/Boletos/             ← PDFs dos boletos emitidos e registrados
/PosicaoCarteira/     ← relatório CSV — posição atual (últimos 90 dias ou em aberto)
```
