# Validador CNAB 400 - Banco BMP Money Plus

## 📋 Resumo das Melhorias

Este validador foi completamente revisado para seguir fielmente a documentação oficial do layout CNAB 400 do Banco BMP Money Plus.

## 🎯 Principais Mudanças

### 1. **Layouts Completos e Precisos**

#### Header (Tipo 0) - 400 bytes
- ✅ 15 campos mapeados conforme documentação
- ✅ Validação de literal "REMESSA" (posições 3-9)
- ✅ Validação de literal "COBRANCA" (posições 12-26)
- ✅ Validação do número do banco BMP: 274 (posições 77-79)
- ✅ Validação de identificação do sistema: "MX" (posições 109-110)
- ✅ Sequencial do registro deve ser 000001

#### Detalhe (Tipo 1) - 400 bytes
- ✅ 44 campos mapeados conforme documentação
- ✅ Validação completa de Nosso Número (11 dígitos + dígito verificador)
- ✅ Validação de Campo de Multa (0=sem multa, 2=com multa)
- ✅ Validação de Condição de Emissão: 2=Cliente emite boleto
- ✅ Validação de Identificação de Ocorrência (01, 02, 06, 07, 20)
- ✅ Validação de Espécie de Título (01-32, 99)
- ✅ Validação de Tipo de Inscrição Pagador (01=CPF, 02=CNPJ)
- ✅ Validação de Tipo Sacador Avalista (0-9)

#### Tipo 2 (Registro Opcional) - 400 bytes
- ✅ 11 campos para mensagens complementares
- ✅ 4 campos de mensagens de 80 caracteres cada
- ✅ Campos de endereço complementar (número, bairro, UF, cidade)
- ⚠️ **Nota**: Sequencial deve seguir o tipo 1 anterior

#### Tipo 3 (Registro Opcional) - 400 bytes
- ✅ 10 campos para descontos múltiplos
- ✅ Tipo de desconto (1=Fixo, 2=Percentual, 3=Antecipação Dia, 5=%Antecipação)
- ✅ 3 conjuntos de data + valor de desconto
- ⚠️ **Nota**: Sequencial deve seguir o tipo 2 anterior

#### Trailer (Tipo 9) - 400 bytes
- ✅ 3 campos conforme documentação
- ✅ Sequencial deve ser o último número da sequência

### 2. **Validações Implementadas**

#### Validações de Estrutura:
- ✅ Arquivo deve ter exatamente 400 caracteres por linha
- ✅ Deve conter pelo menos 1 Header (Tipo 0)
- ✅ Deve conter pelo menos 1 Trailer (Tipo 9)
- ⚠️ Aviso se não houver registros Tipo 1 (Detalhe)
- ⚠️ Aviso se houver mais de 1 Header

#### Validações de Campo:
- ✅ Campos obrigatórios não podem estar vazios
- ✅ Campos numéricos devem conter apenas dígitos (0-9)
- ✅ Campos numéricos NÃO podem ter espaços (devem usar zeros à esquerda)
- ✅ Validação de valores permitidos (quando aplicável)
- ✅ Validação de formato de data DDMMAA:
  - Dia entre 01-31
  - Mês entre 01-12
- ✅ Validação de sequência numérica dos registros

### 3. **Estatísticas do Arquivo**

O validador agora exibe estatísticas detalhadas:
- Total de linhas
- Quantidade de Headers (Tipo 0)
- Quantidade de Detalhes (Tipo 1)
- Quantidade de registros Tipo 2 (Mensagens)
- Quantidade de registros Tipo 3 (Descontos)
- Quantidade de Trailers (Tipo 9)
- Quantidade de tipos desconhecidos

### 4. **Visualização Aprimorada**

#### Matriz Visual:
- ✅ Fonte monoespaçada (Courier New) para alinhamento perfeito
- ✅ 400 células por linha
- ✅ Largura fixa de 13px por célula
- ✅ Cores distintas por campo
- ✅ Espaços visualizados como ponto médio (·)
- ✅ Células com erro destacadas em vermelho com animação
- ✅ Sistema de seleção de campo (clique na legenda)
- ✅ Hover effect para inspeção individual

#### Cores por Tipo de Registro:
- **Header (0)**: Roxo (#7b1fa2)
- **Detalhe (1)**: Verde (#388e3c)
- **Tipo 2**: Laranja (#f57c00)
- **Tipo 3**: Verde-água (#00695c)
- **Trailer (9)**: Rosa (#c2185b)

### 5. **Sistema de Erros e Avisos**

#### Erros Críticos (🚫):
- Tipo de registro desconhecido
- Tamanho de linha incorreto
- Campos obrigatórios vazios
- Campos numéricos com espaços ou caracteres inválidos
- Valores fora do conjunto permitido
- Datas inválidas
- Sequência incorreta de registros
- Estrutura de arquivo incorreta

#### Avisos (⚠️):
- Arquivo sem registros de Detalhe
- Múltiplos Headers no arquivo

### 6. **Referências da Documentação**

O código segue precisamente as seguintes seções da documentação:

1. **Registro Header Label** (páginas 7-12):
   - Posições 1-400
   - 15 campos definidos
   - Validações específicas de literais e códigos

2. **Registro de Transação - Tipo 1** (páginas 8-18):
   - Posições 1-400
   - 44 campos definidos
   - Validações de identificação da empresa beneficiária
   - Cálculo do dígito do Nosso Número (módulo 11, base 7)
   - Instruções de cobrança
   - Espécies de título (32 tipos + outros)

3. **Registro de Transação - Tipo 2** (página 11):
   - Registro opcional
   - Mensagens complementares
   - Endereço detalhado do pagador
   - Regras de sequencial

4. **Registro de Transação - Tipo 3** (página 12):
   - Registro opcional
   - Descontos múltiplos
   - Tipos de desconto
   - Regras de sequencial

5. **Registro Trailer** (página 12):
   - Posições 1-400
   - Sequencial final

## 📊 Casos de Uso

### Validação Básica
1. Anexe arquivo .REM ou .TXT
2. O sistema valida automaticamente
3. Veja estatísticas, erros e avisos
4. Inspecione visualmente a matriz colorida

### Inspeção Detalhada
1. Clique em qualquer campo na legenda
2. Todos os campos desse tipo serão destacados
3. Os demais campos ficam esmaecidos
4. Clique novamente para desmarcar

### Identificação de Erros
1. Erros aparecem com borda vermelha na matriz
2. Lista completa de erros com linha, campo e mensagem
3. Contador de erros por linha no cabeçalho

## 🎨 Responsividade

O CSS adapta automaticamente para diferentes tamanhos de tela:

- **Desktop**: Células 13x18px, fonte 11px
- **Tablet** (≤768px): Células 11x16px, fonte 10px
- **Mobile** (≤480px): Células 9x14px, fonte 9px

## 🖨️ Impressão

Estilos especiais para impressão:
- Evita quebra de página no meio de um registro
- Bordas visíveis em escala de cinza
- Erros destacados em rosa claro

## 📝 Notas Importantes

1. **Encoding**: O arquivo é lido com ISO-8859-1 para compatibilidade com sistemas bancários
2. **Tamanho**: Cada linha DEVE ter exatamente 400 caracteres
3. **Sequência**: Os registros devem estar em ordem sequencial crescente (000001, 000002, etc.)
4. **Tipos Opcionais**: Registros Tipo 2 e 3 são opcionais, mas quando presentes devem seguir as regras de sequencial
5. **Nosso Número**: O dígito verificador é calculado com módulo 11, base 7 (incluindo o número da carteira)

## 🔧 Tecnologias

- Angular 17+ (Standalone Component)
- TypeScript
- DomSanitizer para HTML seguro
- CommonModule para diretivas

## 🚀 Próximas Melhorias Sugeridas

- [ ] Exportar relatório de validação em PDF
- [ ] Validação do dígito verificador do Nosso Número
- [ ] Suporte para upload de múltiplos arquivos
- [ ] Comparação entre arquivos (diff)
- [ ] Gerador de arquivo CNAB 400 válido
- [ ] Validação de CPF/CNPJ
- [ ] Validação de código de barras
- [ ] Exportar/importar configurações de validação

## 📄 Licença

Este validador foi desenvolvido com base na documentação oficial do Banco BMP Money Plus para fins educacionais e de conformidade.
