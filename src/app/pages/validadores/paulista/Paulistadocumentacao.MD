# 🏦 Validador CNAB 400 - Banco Paulista (611)

## 📋 Visão Geral

Validador de arquivos de **Remessa** CNAB 400 para o Banco Paulista S.A. (código 611), especializado em Fundos de Investimentos de Direitos Creditórios (FIDC).

---

## 🎯 Especificações do Arquivo

### Nomenclatura do Arquivo

```
Formato: CBDDMMxx.REM ou CBDDMMxx.TXT

Onde:
- CB    : Caracteres fixos
- DD    : Dia de geração do arquivo
- MM    : Mês de geração do arquivo
- xx    : Variáveis alfanuméricas (01, AE, E1, etc.)
- .REM  : Extensão do arquivo
- .TXT  : Extensão alternativa

Exemplos válidos:
✅ CB230501.REM
✅ CB2305AE.REM
✅ CB2305E1.REM
✅ CB230501.TXT
```

### Serviços Permitidos

O sistema CNAB 400 do Banco Paulista permite:
- ✅ Entrada de títulos
- ✅ Instruções de cobrança

---

## 📊 Estrutura do Arquivo

### Tipos de Registro

| Tipo | Nome | Quantidade | Descrição |
|------|------|------------|-----------|
| **0** | Header | 1 | Identificação do arquivo e origem |
| **1** | Detalhe | 1 ou mais | Dados dos títulos |
| **9** | Trailer | 1 | Encerramento do arquivo |

**Tamanho do registro**: 400 caracteres (fixo)

---

## 🔍 Layout dos Registros

### 📌 Registro Header (Tipo 0)

**15 campos** mapeados conforme especificação oficial:

#### Campos Principais

| Campo | Posições | Tamanho | Tipo | Conteúdo | Obrigatório |
|-------|----------|---------|------|----------|-------------|
| Tipo Registro | 001-001 | 1 | N | `0` | ✅ Sim |
| Ident. Arquivo | 002-002 | 1 | N | `1` (Remessa) | ✅ Sim |
| Literal Remessa | 003-009 | 7 | A | `REMESSA` | ✅ Sim |
| Cód. Serviço | 010-011 | 2 | N | `01` (Cobrança) | ✅ Sim |
| Literal Serviço | 012-026 | 15 | A | `COBRANCA` | ✅ Sim |
| Cód. Originador | 027-046 | 20 | N | Fornecido pelo banco | ✅ Sim |
| Nome Originador | 047-076 | 30 | A | Razão Social | ✅ Sim |
| Nº Banco Paulista | 077-079 | 3 | N | `611` | ✅ Sim |
| Nome Banco | 080-094 | 15 | A | `PAULISTA S.A.` | ✅ Sim |
| Data Gravação | 095-100 | 6 | N | DDMMAA | ✅ Sim |
| Branco | 101-108 | 8 | A | Branco | ✅ Sim |
| Ident. Sistema | 109-110 | 2 | A | `MX` | ✅ Sim |
| Nº Seq. Arquivo | 111-117 | 7 | N | Sequencial | ✅ Sim |
| Branco | 118-394 | 277 | A | Branco | ✅ Sim |
| Seq. Registro | 395-400 | 6 | N | `000001` | ✅ Sim |

**Total**: 400 caracteres

---

### 📌 Registro Detalhe (Tipo 1)

**46 campos** mapeados para transações de títulos:

#### Campos Principais de Identificação

| Campo | Posições | Tamanho | Tipo | Descrição |
|-------|----------|---------|------|-----------|
| Tipo Registro | 001-001 | 1 | N | `1` |
| Nº Controle | 038-062 | 25 | A | Número de identificação do título |
| Cód. Ocorrência | 109-110 | 2 | N | Ver códigos de ocorrência |
| Nº Documento | 111-120 | 10 | A | Número do documento |
| Vencimento | 121-126 | 6 | N | DDMMAA |
| Valor Título | 127-139 | 13 | N | Valor com 2 decimais |

#### Códigos de Ocorrência Suportados

| Código | Descrição | Observação |
|--------|-----------|------------|
| **01** | Remessa | Entrada de título |
| **04** | Abatimento | Mediante justificativa |
| **06** | Alteração de vencimento | Para conciliação |
| **14** | Pagamento Parcial | - |
| **71** | Baixa por Recompra Paulista | Com liquidação consultoria |
| **72** | Recompra Parcial sem Adiantamento | - |
| **73** | Recompra Parcial com Adiantamento | - |
| **74** | Baixa por Recompra | Com liquidação cedente |
| **75** | Baixa por Depósito Cedente | - |
| **76** | Baixa por Depósito Consultoria | - |
| **77** | Baixa por Depósito Sacado | - |
| **80** | Remessa Paulista | Com liquidação consultoria |
| **81** | Entrada por Recompra | Troca de títulos |
| **84** | Entrada por Recompra | Com liquidação cedente |
| **87** | Reativação | - |

#### Espécies de Título

| Código | Descrição |
|--------|-----------|
| **01** | Duplicata |
| **02** | Nota Promissória |
| **51** | Cheque |

#### Campos com Validação Especial

**Dados do Sacado**:
- Tipo Inscrição (219-220): `01` (CPF) ou `02` (CNPJ)
- CPF/CNPJ (221-234): 14 posições, alinhado à direita
- Nome (235-274): 40 posições
- Endereço (275-314): 40 posições
- CEP (327-334): 8 posições

**Campos Obrigatórios para Duplicata**:
- Inscrição Estadual Sacado (160-173)
- Nº Termo Cessão (174-192)
- Nº NF Duplicata (315-323)
- Série NF (324-326)

**Decomposição do Campo Cedente** (335-394):
- Posições 335-380: Nome do Cedente (46 caracteres)
- Posições 381-394: CNPJ do Cedente (14 caracteres)

---

### 📌 Registro Trailer (Tipo 9)

**3 campos** simples:

| Campo | Posições | Tamanho | Conteúdo |
|-------|----------|---------|----------|
| Tipo Registro | 001-001 | 1 | `9` |
| Branco | 002-394 | 393 | Branco |
| Seq. Registro | 395-400 | 6 | Nº sequencial do último registro |

---

## ✅ Regras de Validação

### 1. Estrutura do Arquivo

- ✅ Deve iniciar com registro Header (Tipo 0)
- ✅ Deve conter pelo menos 1 registro Detalhe (Tipo 1)
- ✅ Deve terminar com registro Trailer (Tipo 9)
- ✅ Todas as linhas com exatamente 400 caracteres
- ✅ Sequência numérica contínua (000001, 000002, 000003...)

### 2. Campos Numéricos

**Regra Crítica**: Campos numéricos devem ser alinhados **à direita** com zeros à esquerda.

```
❌ ERRADO: "     12345" (espaços à esquerda)
✅ CORRETO: "0000012345" (zeros à esquerda)
```

**Valores Monetários**: 2 casas decimais

```
Exemplo: Valor R$ 2.470,56
No arquivo: 000000000247056 (13 posições)
```

### 3. Campos Alfanuméricos

- Alinhados **à esquerda**
- Completados com espaços à direita
- Sempre em MAIÚSCULO
- Sem caracteres especiais (Ç, @, etc.)
- Sem acentos (Á, É, Ê, etc.)

```
❌ ERRADO: "José da Silva"
✅ CORRETO: "JOSE DA SILVA                           "
```

### 4. Datas

Formato: **DDMMAA** (6 posições)

```
Exemplo: 23 de maio de 2024
No arquivo: 230524
```

### 5. Valores Fixos Obrigatórios

| Campo | Valor |
|-------|-------|
| Literal Remessa | `REMESSA` |
| Literal Serviço | `COBRANCA` |
| Código do Banco | `611` |
| Nome do Banco | `PAULISTA S.A.` |
| Identificação Sistema | `MX` |

---

## 🧪 Casos de Teste

### ✅ Arquivo Válido Mínimo

```
Estrutura:
Linha 1: Header (Tipo 0) - Seq. 000001
Linha 2: Detalhe (Tipo 1) - Seq. 000002
Linha 3: Trailer (Tipo 9) - Seq. 000003
```

### ❌ Erros Comuns

#### Erro 1: Código do Banco Incorreto
```
Posição 077-079: "237" ← ERRADO (código do Bradesco)
Posição 077-079: "611" ← CORRETO (código do Paulista)
```

#### Erro 2: Literal com Espaços
```
Posição 003-009: "REMESSA " ← ERRADO (7 caracteres, mas com espaço no final)
Posição 003-009: "REMESSA" ← CORRETO (preencher à esquerda)
```

#### Erro 3: Campo Numérico com Espaços
```
Posição 127-139: "     247056  " ← ERRADO
Posição 127-139: "0000000247056" ← CORRETO
```

#### Erro 4: Data Inválida
```
Posição 095-100: "320524" ← ERRADO (dia 32 não existe)
Posição 095-100: "230524" ← CORRETO (23/05/24)
```

#### Erro 5: Sequência Quebrada
```
Linha 1: 000001 (Header)
Linha 2: 000002 (Detalhe)
Linha 3: 000005 (Trailer) ← ERRADO (deveria ser 000003)
```

---

## 📊 Matriz de Validação

| Validação | Tipo | Ação |
|-----------|------|------|
| Tamanho linha ≠ 400 | 🚫 Erro | Bloqueia processamento |
| Tipo registro inválido | 🚫 Erro | Bloqueia processamento |
| Campo obrigatório vazio | 🚫 Erro | Bloqueia processamento |
| Campo numérico com espaços | 🚫 Erro | Bloqueia processamento |
| Valor fixo incorreto | 🚫 Erro | Bloqueia processamento |
| Sequência quebrada | 🚫 Erro | Bloqueia processamento |
| Data inválida | 🚫 Erro | Bloqueia processamento |
| Múltiplos headers | ⚠️ Aviso | Permite processamento |

---

## 🎨 Interface do Validador

### Recursos Visuais

1. **Upload de Arquivo**
   - Área de arrastar e soltar
   - Aceita .REM e .TXT
   - Feedback visual ao hover

2. **Estatísticas do Arquivo**
   - Cards coloridos por tipo de registro
   - Contador total de linhas
   - Identificação visual de tipos

3. **Relatório de Erros**
   - Separação visual: Erros Críticos vs Avisos
   - Lista scrollável com detalhes
   - Indicação de linha e campo com erro

4. **Legenda Interativa**
   - Campos clicáveis
   - Destaque na visualização
   - Tooltips com descrições

5. **Visualização Matriz**
   - Cada caractere em célula individual
   - Cores por tipo de campo
   - Bordas vermelhas para erros

---

## 💡 Dicas de Uso

### Para Desenvolvedores

1. **Geração de Arquivos**
   ```typescript
   // Sempre preencher campos numéricos com zeros à esquerda
   const valorFormatado = valor.toString().padStart(13, '0');

   // Sempre preencher campos alfanuméricos à esquerda
   const nomeFormatado = nome.padEnd(40, ' ').substring(0, 40);

   // Sempre converter para maiúsculas sem acentos
   const textoFormatado = removerAcentos(texto.toUpperCase());
   ```

2. **Validação de Datas**
   ```typescript
   const validarData = (ddmmaa: string): boolean => {
     const dia = parseInt(ddmmaa.substring(0, 2));
     const mes = parseInt(ddmmaa.substring(2, 4));
     return dia >= 1 && dia <= 31 && mes >= 1 && mes <= 12;
   };
   ```

3. **Cálculo de Sequência**
   ```typescript
   let sequencial = 1;
   linhas.forEach(linha => {
     linha.setSequencial(sequencial.toString().padStart(6, '0'));
     sequencial++;
   });
   ```

### Para Usuários

1. **Antes de Enviar**
   - ✅ Validar o arquivo no sistema
   - ✅ Verificar se não há erros críticos
   - ✅ Conferir totais e quantidades
   - ✅ Validar nomenclatura do arquivo

2. **Em Caso de Erro**
   - 📍 Anotar o número da linha com erro
   - 📍 Verificar o campo específico indicado
   - 📍 Corrigir o valor conforme mensagem
   - 📍 Re-validar após correção

---

## 📞 Referências

- **Banco**: Banco Paulista S.A.
- **Código**: 611
- **Sistema**: FIDC (Fundos de Investimentos de Direitos Creditórios)
- **Padrão**: CNAB 400
- **Tipo**: Remessa
- **Website**: www.fromtis.com.br

---

## ✅ Checklist de Conformidade

- [x] Header (Tipo 0): 15 campos mapeados
- [x] Detalhe (Tipo 1): 46 campos mapeados
- [x] Trailer (Tipo 9): 3 campos mapeados
- [x] Validação de campos numéricos rigorosa
- [x] Validação de sequência de registros
- [x] Validação de estrutura do arquivo
- [x] Suporte a datas DDMMAA
- [x] Sistema de severidade (erro/aviso)
- [x] Interface visual moderna
- [x] Encoding ISO-8859-1

---

**Versão**: 1.0
**Data**: 2024-01-24
**Conformidade**: CNAB 400 Banco Paulista (Especificação Oficial)
