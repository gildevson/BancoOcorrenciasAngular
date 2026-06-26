# UY3 DTVM — CNAB 400 Cobrança — Remessa
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
| Transmissão | sFTP → pasta `/Remessa/` |

---

## Estrutura do Arquivo de Remessa

| Tipo | Identificador | Descrição |
|------|---------------|-----------|
| `0` | Header | Abertura do arquivo — uma linha obrigatória |
| `1` | Detalhe / Transação | Um registro por título |
| `7` | Novo Beneficiário | Opcional — transferência entre carteiras (junto com ocorrência 23) |
| `8` | Dados Pagador | Opcional — endereço e e-mail do pagador |
| `9` | Trailer | Encerramento — uma linha obrigatória |

---

## Registro Header Label — Tipo 0

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

## Registro de Transação — Tipo 1

| Campo | Descrição | Pos Ini | Tam | Pos Fim | Tipo | Obrigatório |
|-------|-----------|---------|-----|---------|------|-------------|
| Identificação do Registro | `1` | 1 | 1 | 1 | N | Sim |
| Branco | Branco | 2 | 19 | 20 | A | Sim |
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
| Dígito do Nosso Número | DAC do nosso número (Módulo 11 base 7) | 82 | 1 | 82 | A | Sim |
| Desconto Bonificação por Dia | Valor do desconto bonif./dia | 83 | 10 | 92 | N | Sim |
| Condição Emissão Papeleta | `1`=Banco emite e processa, `2`=Cliente emite | 93 | 1 | 93 | N | Sim |
| Branco | Branco | 94 | 15 | 108 | A | Sim |
| Identificação da Ocorrência | Vide tabela de ocorrências | 109 | 2 | 110 | N | Sim |
| Nº de Documento | Número do documento | 111 | 10 | 120 | A | Sim |
| Data do Vencimento do Título | DDMMAA | 121 | 6 | 126 | N | Sim |
| Valor do Título | Sem ponto e sem vírgula | 127 | 13 | 139 | N | Sim |
| Branco | Branco | 140 | 8 | 147 | A | Não |
| Espécie do Título | Vide tabela de espécies | 148 | 2 | 149 | N | Sim |
| Identificação | `N` | 150 | 1 | 150 | A | Sim |
| Data da Emissão do Título | DDMMAA | 151 | 6 | 156 | N | Sim |
| 1ª Instrução | `06`=Protestar, `00`=Sem protesto | 157 | 2 | 158 | N | Sim |
| 2ª Instrução | Nº de dias para protestar (mín. 3 dias úteis) | 159 | 2 | 160 | N | Sim |
| Valor a ser Cobrado por Dia de Atraso | Zeros à esquerda | 161 | 13 | 173 | N | Sim |
| Data Limite P/Concessão de Desconto | DDMMAA | 174 | 6 | 179 | N | Não |
| Valor do Desconto | Valor do desconto | 180 | 13 | 192 | N | Não |
| Branco | Branco | 193 | 13 | 205 | A | Não |
| Valor do Abatimento | Valor a conceder ou cancelar | 206 | 13 | 218 | N | Sim |
| Tipo Inscrição do Pagador | `01`=CPF, `02`=CNPJ | 219 | 2 | 220 | N | Sim |
| Nº Inscrição do Pagador | CPF ou CNPJ | 221 | 14 | 234 | N | Sim |
| Nome do Pagador | Razão Social | 235 | 40 | 274 | A | Sim |
| Endereço do Pagador | Endereço completo | 275 | 40 | 314 | A | Sim |
| 1ª Mensagem | Campo livre para uso da empresa | 315 | 12 | 326 | A | Não |
| CEP Pagador | Apenas números | 327 | 8 | 334 | N | Não |
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
| `01` | Duplicata Mercantil |
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

## Linha Trailer — Encerramento (Tipo 9)

| Campo | Descrição | Pos Ini | Tam | Pos Fim | Tipo | Obrigatório |
|-------|-----------|---------|-----|---------|------|-------------|
| Identificação | `9` | 1 | 1 | 1 | N | Sim |
| Branco | Branco | 2 | 393 | 394 | A | Sim |
| Nº Sequencial do Registro | Sequencial | 395 | 6 | 400 | N | Sim |

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

## Montagem do Código de Barras

| Posição | Tam | Conteúdo |
|---------|-----|----------|
| 01–03 | 3 | `457` (código do banco) |
| 04 | 1 | Código da Moeda (`9`=Real, `0`=Outras) |
| 05 | 1 | Dígito Verificador (Módulo 11, base 9) |
| 06–09 | 4 | Fator Vencimento |
| 10–19 | 10 | Valor |
| 20–23 | 4 | Agência Beneficiária (sem dígito, zeros à esquerda) |
| 24–25 | 2 | Carteira |
| 26–36 | 11 | Nosso Número (sem dígito verificador) |
| 37–43 | 7 | Conta do Beneficiário (zeros à esquerda) |
| 44 | 1 | Zero |

---

## Estrutura sFTP

```
/Remessa/             ← enviar arquivos .REM aqui
/Remessa/Processado/  ← remessas processadas com sucesso
/Remessa/Erro/        ← remessas com erros estruturais
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
