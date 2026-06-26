# UY3 DTVM — CNAB 400 Cobrança
> Manual de Procedimentos — Versão Julho/2024

---

## Informações Gerais

| Item | Valor |
|------|-------|
| Banco | UY3 |
| Código na Câmara de Compensação | **457** |
| Identificação do Sistema | **MX** |
| Formato | CNAB 400 (400 chars por linha, ISO-8859-1) |
| Extensão Remessa | `.REM` |
| Extensão Retorno | `.RET` |
| Transmissão | sFTP |

---

## Estrutura do Arquivo

| Tipo | Identificador | Descrição |
|------|---------------|-----------|
| `0` | Header | Abertura do arquivo — uma linha obrigatória |
| `1` | Detalhe / Transação | Um registro por título |
| `7` | Novo Beneficiário | Opcional — transferência entre carteiras |
| `8` | Dados Pagador | Opcional — endereço e e-mail do pagador |
| `9` | Trailer | Encerramento — uma linha obrigatória |

---

## Registro Header Label — Tipo 0 (Remessa)

| Campo | Descrição | Pos Ini | Tam | Pos Fim | Tipo | Obrigatório |
|-------|-----------|---------|-----|---------|------|-------------|
| Identificação do Registro | `0` | 1 | 1 | 1 | N | Sim |
| Identificação do Arquivo-Remessa | `1` | 2 | 1 | 2 | N | Sim |
| Literal Remessa | `REMESSA` | 3 | 7 | 9 | A | Sim |
| Código de Serviço | `01` | 10 | 2 | 11 | N | Sim |
| Literal Serviços | `COBRANCA` | 12 | 15 | 26 | A | Sim |
| Código do Convênio | Código fornecido pela UY3 | 27 | 20 | 46 | N | Sim |
| Nome da Empresa | Razão Social | 47 | 30 | 76 | A | Sim |
| Número UY3 na Câmara de Compensação | `457` | 77 | 3 | 79 | N | Sim |
| Nome do Banco | `UY3` | 80 | 15 | 94 | A | Sim |
| Data do Arquivo | DDMMAA | 95 | 6 | 100 | N | Sim |
| Branco | Branco | 101 | 8 | 108 | A | Sim |
| Identificação do Sistema | `MX` | 109 | 2 | 110 | A | Sim |
| Nº Sequencial de Remessa | Sequencial crescente | 111 | 7 | 117 | N | Sim |
| Branco | Branco | 118 | 277 | 394 | A | Sim |
| Nº Sequencial do Registro | `000001` | 395 | 6 | 400 | N | Sim |

---

## Registro de Transação — Tipo 1 (Remessa)

| Campo | Descrição | Pos Ini | Tam | Pos Fim | Tipo | Obrigatório |
|-------|-----------|---------|-----|---------|------|-------------|
| Identificação do Registro | `1` | 1 | 1 | 1 | N | Sim |
| Branco | Branco | 2 | 19 | 20 | N | Sim |
| Zero | `0` | 21 | 1 | 21 | A | Sim |
| Código da Carteira do Beneficiário | Número da carteira | 22 | 3 | 24 | N | Sim |
| Código da Agência do Beneficiário | Agência sem o dígito | 25 | 5 | 29 | N | Sim |
| Conta Corrente do Beneficiário | Número da conta | 30 | 7 | 36 | N | Sim |
| Dígito da Conta do Beneficiário | Dígito da conta | 37 | 1 | 37 | N | Sim |
| Nº do Controle do Participante | Código do cliente — devolvido no retorno | 38 | 25 | 62 | A | Não |
| Código do Banco a ser Debitado | `457` | 63 | 3 | 65 | N | Não |
| Campo de Multa | `0`=Sem multa, `2`=Com multa (%) | 66 | 1 | 66 | N | Sim |
| Percentual de Multa | Percentual com 2 decimais | 67 | 4 | 70 | N | Sim |
| Identificação do Nosso Número | Número bancário para cobrança com registro | 71 | 11 | 81 | N | Sim |
| Dígito do Nosso Número | DAC do nosso número | 82 | 1 | 82 | A | Sim |
| Desconto Bonificação por Dia | Valor do desconto bonif./dia | 83 | 10 | 92 | N | Sim |
| Condição Emissão Papeleta | `1`=Banco emite e processa, `2`=Cliente emite | 93 | 1 | 93 | N | Sim |
| Branco | Branco | 94 | 15 | 108 | A | Sim |
| Identificação da Ocorrência | Vide tabela de ocorrências | 109 | 2 | 110 | N | Sim |
| Nº de Documento | Número do documento | 111 | 10 | 120 | A | Sim |
| Data do Vencimento do Título | DDMMAA | 121 | 6 | 126 | N | Sim |
| Valor do Título | Sem ponto e sem vírgula | 127 | 13 | 139 | N | Sim |
| Branco | Branco | 140 | 8 | 147 | N | Sim |
| Espécie do Título | Vide tabela de espécies | 148 | 2 | 149 | N | Sim |
| Identificação | `N` | 150 | 1 | 150 | A | Sim |
| Data da Emissão do Título | DDMMAA | 151 | 6 | 156 | N | Sim |
| 1ª Instrução | `06`=Protestar, `00`=Sem protesto | 157 | 2 | 158 | N | Sim |
| 2ª Instrução | Nº de dias para protestar (mín. 3 dias úteis) | 159 | 2 | 160 | N | Sim |
| Valor a ser Cobrado por Dia de Atraso | Zeros à esquerda | 161 | 13 | 173 | N | Sim |
| Data Limite P/Concessão de Desconto | DDMMAA | 174 | 6 | 179 | N | Sim |
| Valor do Desconto | Valor do desconto | 180 | 13 | 192 | N | Não |
| Branco | Branco | 193 | 13 | 205 | N | Não |
| Valor do Abatimento | Valor a conceder ou cancelar | 206 | 13 | 218 | N | Sim |
| Tipo Inscrição do Pagador | `01`=CPF, `02`=CNPJ | 219 | 1 | 220 | N | Sim |
| Nº Inscrição do Pagador | CPF ou CNPJ | 221 | 14 | 234 | N | Sim |
| Nome do Pagador | Razão Social | 235 | 40 | 274 | A | Sim |
| Endereço do Pagador | Endereço completo | 275 | 40 | 314 | A | Sim |
| 1ª Mensagem | Campo livre para uso da empresa | 315 | 40 | 354 | A | Não |
| CEP Pagador | CEP (dentro do espaço da 1ª Mensagem) | 327 | 6 | 334 | N | Não |
| Beneficiário Final ou 2ª Mensagem | Opcional | 335 | 60 | 394 | A | Não |
| Nº Sequencial do Registro | Sequencial | 395 | 6 | 400 | N | Sim |

---

## Ocorrências — Remessa (pos 109–110)

| Código | Descrição |
|--------|-----------|
| `01` | Remessa — entrada de título |
| `02` | Pedido de Baixa |
| `03` | Pedido de Protesto Falimentar |
| `04` | Concessão de Abatimento |
| `05` | Cancelamento de Abatimento Concedido |
| `06` | Alteração de Vencimento |
| `07` | Alteração do Controle do Participante |
| `08` | Alteração de seu Número |
| `09` | Pedido de Protesto |
| `12` | Ped. Exc. de Cadastro Pagador Débito |
| `13` | Inclusão de Cadastro Pagador |
| `14` | Alteração Cadastro Pagador |
| `18` | Sustar Protesto e Baixar Título |
| `19` | Sustar Protesto e Manter em Carteira |
| `20` | Alteração de Valor |
| `21` | Alteração de Valor com Emissão de Boleto (banco emite)* |
| `22` | Transferência Cessão Crédito ID. Prod.10 |
| `23` | Transferência entre Carteiras |
| `24` | Dev. Transferência entre Carteiras |
| `31` | Alteração de Outros Dados |

---

## Espécies do Título (pos 148–149)

| Código | Descrição |
|--------|-----------|
| `01` | Duplicata |
| `02` | Nota Promissória |
| `03` | Nota de Seguro |
| `05` | Recibo |
| `10` | Letras de Câmbio |
| `11` | Nota de Débito |
| `12` | Duplicata de Serviços |
| `31` | Carta de Crédito |
| `32` | Boleto de Proposta |
| `33` | Depósito e Aporte |
| `99` | Outros |

---

## Novo Beneficiário — Tipo 7

> Usado junto com ocorrência `23` para transferência entre carteiras.

| Campo | Descrição | Pos Ini | Tam | Pos Fim | Tipo | Obrigatório |
|-------|-----------|---------|-----|---------|------|-------------|
| Identificação do Registro | `7` | 1 | 1 | 1 | N | Sim |
| Endereço Beneficiário Final | LOGRADOURO, BAIRRO, NÚMERO, COMPLEMENTO | 2 | 45 | 46 | A | Sim |
| CEP Beneficiário Final | CEP | 47 | 8 | 54 | N | Sim |
| Cidade Beneficiário Final | Cidade | 55 | 20 | 74 | A | Sim |
| UF Beneficiário Final | UF | 75 | 2 | 76 | A | Sim |
| Branco | Branco | 77 | 290 | 366 | A | Sim |
| Carteira | Carteira | 367 | 3 | 369 | N | Sim |
| Agência Beneficiário Final | Agência | 370 | 5 | 374 | N | Sim |
| Conta-corrente Beneficiário Final | Conta-corrente | 375 | 7 | 381 | A | Não |
| Dígito C/C Beneficiário Final | Dígito C/C | 382 | 1 | 382 | N | Não |
| Nosso Número | Número bancário para cobrança com registro | 383 | 11 | 393 | N | Sim |
| Dígito Nosso Número | DAC do nosso número | 394 | 1 | 394 | N | Sim |
| Nº Sequencial do Registro | Sequencial | 395 | 6 | 400 | N | Sim |

---

## Dados Pagador — Tipo 8

> Quando preenchido com e-mail, o boleto PDF é enviado automaticamente ao pagador.

| Campo | Descrição | Pos Ini | Tam | Pos Fim | Tipo | Obrigatório |
|-------|-----------|---------|-----|---------|------|-------------|
| Identificação do Registro | `8` | 1 | 1 | 1 | N | Sim |
| Endereço Pagador | Rua X, nº 99, cj.1 | 2 | 45 | 46 | A | Não |
| CEP do Pagador | Apenas números | 47 | 8 | 54 | N | Não |
| Cidade do Pagador | Nome da Cidade | 55 | 20 | 74 | A | Não |
| UF do Pagador | Sigla do Estado | 75 | 2 | 76 | A | Não |
| E-mail do Pagador | email@pagador.com.br | 77 | 80 | 156 | A | Não |
| Reservado | Reservado para uso futuro | 157 | 238 | 394 | A | Não |
| Número Sequencial Registro | Sequencial | 395 | 6 | 400 | N | Sim |

---

## Linha Trailer — Encerramento (Tipo 9, Remessa)

| Campo | Descrição | Pos Ini | Tam | Pos Fim | Tipo | Obrigatório |
|-------|-----------|---------|-----|---------|------|-------------|
| Identificação | `9` | 1 | 1 | 1 | N | Sim |
| Branco | Branco | 2 | 393 | 394 | A | Sim |
| Nº Sequencial do Registro | Sequencial | 395 | 6 | 400 | N | Sim |

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
| Branco | Branco | 18 | 3 | 20 | N |
| Ident. Empresa Beneficiária no Banco | Zero + Carteira + Agência + Conta | 21 | 17 | 37 | A |
| Nº do Controle do Participante | Conforme enviado na remessa (pos 38, 25 chars) | 38 | 25 | 62 | A |
| Zero | `00000000` | 63 | 8 | 70 | N |
| Identificação do Nosso Número | Confirmação do nosso número (12 chars) | 71 | 12 | 82 | A |
| Uso do Banco | Uso interno | 83 | 22 | 105 | N |
| Branco | Branco | 106 | 2 | 107 | N |
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
| Branco | Branco | 302 | 17 | 318 | N |
| Motivo Rejeição | Vide tabela motivos retorno | 319 | 10 | 328 | N |
| Branco | Branco | 329 | 40 | 368 | N |
| Número do Cartório | Nº Cartório | 369 | 2 | 370 | N |
| Número do Protocolo | Protocolo do Cartório | 371 | 10 | 380 | A |
| Branco | Branco | 381 | 14 | 394 | N |
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

## Motivos de Retorno

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

## Montagem do Código de Barras

| Posição | Tam | Conteúdo |
|---------|-----|----------|
| 01–03 | 3 | `457` (código do banco) |
| 04 | 1 | Código da Moeda (`9`=Real, `0`=Outras) |
| 05 | 1 | Dígito Verificador do Código de Barras (Módulo 11, base 9) |
| 06–09 | 4 | Fator Vencimento |
| 10–19 | 10 | Valor |
| 20–23 | 4 | Agência Beneficiária (sem dígito, zeros à esquerda) |
| 24–25 | 2 | Carteira |
| 26–36 | 11 | Nosso Número (sem dígito verificador) |
| 37–43 | 7 | Conta do Beneficiário (zeros à esquerda) |
| 44 | 1 | Zero |

---

## Cálculo DAC — Nosso Número

- Método: **Módulo 11**, base de cálculo **7**
- Formato: `CC` (2 dígitos carteira) + `NNNNNNNNNNN` (11 dígitos nosso número)
- Multiplicador: `2765432765432` (direita para esquerda)
- Se RESTO = 1 → dígito = `P`
- Se RESTO = 0 → dígito = `0`
- Caso contrário → dígito = `11 - RESTO`

**Exemplo:** Carteira `19` + Nosso Número `00000000016`
- Soma multiplicações = 80 → RESTO = 80 % 11 = 3 → DAC = 11 - 3 = **8**

---

## Cálculo DAC — Código de Barras

- Método: **Módulo 11**, base **9** (sentido direita para esquerda, multiplicadores 2 a 9)
- Acumular resultados e dividir por 11
- Se resultado (11 - resto) = 0, 1 ou > 9 → dígito = **1**
- Caso contrário → dígito = `11 - resto`
- Lançado na **5ª posição** do código de barras

---

## Fator de Vencimento

- Data-base: **07/10/1997**
- Fórmula: `Data Vencimento - Data-Base = Nº dias`
- A partir de **22/02/2025**: fator retorna a **1000** e cresce 1 por dia

| Data | Fator |
|------|-------|
| 22/02/2025 | 1000 |
| 23/02/2025 | 1001 |
| 03/07/2000 | 1000 |
| 01/05/2002 | 1667 |
| 17/11/2010 | 4789 |

---

## Estrutura sFTP

```
/Remessa/             ← enviar arquivos .REM aqui
/Remessa/Processado/  ← remessas processadas com sucesso
/Remessa/Erro/        ← remessas com erros estruturais
/Retorno/             ← arquivos .RET de retorno
/Boletos/             ← PDFs dos boletos emitidos e registrados
/PosicaoCarteira/     ← relatório CSV — posição atual (últimos 90 dias ou em aberto)
```

---

## Informações Importantes

- Remessas devem ter **sequencial crescente** — remessas com sequencial menor que anteriores são ignoradas
- Extensão obrigatória: **`.REM`** — outras extensões são ignoradas pelo sFTP
- Envio com Nosso Número pré-definido é permitido — atentar para o DAC
- Prazo mínimo para protesto: **3 dias úteis** após o vencimento
- Informando e-mail na linha **Tipo 8**, o boleto PDF é enviado automaticamente ao pagador
- Componentes do endereço (Logradouro, Número, Complemento) devem ser separados por **vírgula (,)**
- Transferência entre carteiras: usar ocorrência `23` + linha Tipo 7 com dados do novo beneficiário
