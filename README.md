# 🏦 Remessa Segura Portal

Portal Angular para validação de arquivos CNAB bancários e calculadoras financeiras.

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Funcionalidades](#funcionalidades)
- [Comandos](#comandos)
- [Deploy na Hostinger](#deploy-na-hostinger)

---

## 📖 Sobre o Projeto

O **Remessa Segura Portal** é uma aplicação Angular para:
- Validação de arquivos de remessa bancária (CNAB 240/400)
- Calculadoras financeiras (Juros, Mora, Multa, IOF, Deságio)
- Gestão de ocorrências bancárias
- Visualização de layouts CNAB

---

## 🛠️ Tecnologias

- **Angular 18+** (Standalone Components)
- **TypeScript**
- **RxJS**
- **Angular Router** (Lazy Loading)

---

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── app.ts                    # Componente principal
│   ├── app.routes.ts             # Rotas da aplicação
│   ├── app.config.ts             # Configuração do Angular
│   │
│   ├── data/                     # Dados estáticos
│   │   ├── bancos.data.ts        # Lista de bancos
│   │   ├── banco.validador.ts    # Mapeamento banco → validador
│   │   ├── layouts.data.ts       # Dados dos layouts CNAB
│   │   ├── noticias.data.ts      # Dados de notícias
│   │   └── data.roles.ts         # Roles de usuários
│   │
│   ├── guards/                   # Guards de rota
│   │   ├── auth.guard.ts         # Proteção de autenticação
│   │   └── role.guard.ts         # Proteção por role
│   │
│   ├── models/                   # Interfaces TypeScript
│   │   ├── auth.models.ts        # Modelos de autenticação
│   │   ├── Banco.models.ts       # Modelo de banco
│   │   ├── noticia.model.ts      # Modelo de notícia
│   │   └── ocorrencias.models.ts # Modelo de ocorrências
│   │
│   ├── service/                  # Serviços
│   │   ├── auth.service.ts       # Autenticação
│   │   ├── auth.interceptor.ts   # Interceptor HTTP
│   │   ├── bancos.service.ts     # API de bancos
│   │   ├── noticias.service.ts   # API de notícias
│   │   ├── ocorrencias.api.ts    # API de ocorrências
│   │   └── marketmoedas.service.ts # Cotação de moedas
│   │
│   ├── pages/                    # Páginas/Componentes
│   │   ├── home/                 # Página inicial
│   │   ├── login/                # Login
│   │   ├── header/               # Header
│   │   ├── footer/               # Footer
│   │   │
│   │   ├── calculadora/          # 📊 Calculadoras
│   │   │   ├── calculadoraLista/     # Lista de calculadoras
│   │   │   ├── calculadoraJuros/     # Calculadora de Juros
│   │   │   ├── calculadoraMora/      # Calculadora de Mora
│   │   │   ├── calculadoraMulta/     # Calculadora de Multa
│   │   │   ├── calculadoraIof/       # Calculadora de IOF
│   │   │   ├── calculadoraIofVariado/# IOF com alíquotas editáveis
│   │   │   └── calculadoraDesagio/   # Calculadora de Deságio
│   │   │
│   │   ├── validadores/          # ✅ Validadores CNAB
│   │   │   ├── listaValidadores.component.ts  # Lista de validadores
│   │   │   ├── bradesco/         # Validadores Bradesco
│   │   │   │   ├── cnab400/      # Remessa CNAB 400
│   │   │   │   ├── retorno400/   # Retorno CNAB 400
│   │   │   │   └── retorno240/   # Retorno CNAB 240
│   │   │   ├── bmp/              # Validadores BMP
│   │   │   │   ├── cnab400/      # Remessa CNAB 400
│   │   │   │   └── retorno400/   # Retorno CNAB 400
│   │   │   └── paulista/         # Validadores Paulista
│   │   │       └── cnab400/      # Remessa CNAB 400
│   │   │
│   │   ├── layouts/              # 📄 Visualização de layouts
│   │   ├── ocorrencia/           # 📝 Gestão de ocorrências
│   │   ├── noticias/             # 📰 Listagem de notícias
│   │   ├── noticiadetalhe/       # Detalhe da notícia
│   │   ├── noticiacadastrar/     # Cadastrar notícia (admin)
│   │   └── noticiaseditar/       # Editar notícia (admin)
│   │
│   └── remessas/                 # Componentes de remessa
│       └── remessabradesco400/   # Remessa Bradesco 400
│
├── assets/                       # Arquivos estáticos
│   ├── logo/                     # Logos
│   └── pdfs/layouts/             # PDFs dos layouts
│
└── environments/                 # Configurações de ambiente
    └── environment.ts
```

---

## ⚙️ Funcionalidades

### 📊 Calculadoras
| Calculadora | Descrição |
|-------------|-----------|
| **Juros** | Calcula juros proporcionais por dias de atraso |
| **Mora** | Calcula mora sobre valor em atraso |
| **Multa** | Calcula multa percentual |
| **IOF** | IOF fixo (0,38%) + diário (0,0041%) |
| **IOF Variado** | IOF com alíquotas personalizáveis |
| **Deságio** | Desconto para pagamento antecipado |

### ✅ Validadores CNAB
| Banco | Remessa 400 | Retorno 400 | Retorno 240 |
|-------|-------------|-------------|-------------|
| **Bradesco** | ✅ | ✅ | ✅ |
| **BMP** | ✅ | ✅ | ❌ |
| **Paulista** | ✅ | ❌ | ❌ |

---

## 🚀 Comandos

### Desenvolvimento
```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
ng serve
# ou
npm start

# Acesse: http://localhost:4200
```

### Build
```bash
# Build de produção
ng build --configuration production

# Arquivos gerados em: dist/remessa-segura-portal/browser/
```

### Testes
```bash
# Executar testes unitários
ng test
```

---

## 🌐 Deploy na Hostinger

### Passo a Passo

1. **Gerar o build de produção:**
   ```bash
   ng build --configuration production
   ```

2. **Localizar os arquivos:**
   ```
   dist/
   └── remessa-segura-portal/
       └── browser/
           ├── index.html
           ├── main-XXXXX.js
           ├── polyfills-XXXXX.js
           ├── styles-XXXXX.css
           └── assets/
               ├── logo/
               └── pdfs/
   ```

3. **Fazer upload na Hostinger:**
   - Acesse o **Gerenciador de Arquivos** da Hostinger
   - Navegue até a pasta `public_html`
   - Faça upload de **TODOS os arquivos** da pasta `browser/`
   - Mantenha a estrutura de pastas (assets, etc.)

4. **Configurar .htaccess** (para rotas do Angular):
   Crie um arquivo `.htaccess` na pasta `public_html`:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

5. **Testar o site:**
   - Acesse seu domínio e verifique se todas as rotas funcionam

---

## 📝 Notas

- O projeto usa **Standalone Components** (Angular 18+)
- Rotas são carregadas com **Lazy Loading** para melhor performance
- A cor principal do tema é `#00253F`

---

## 👨‍💻 Autor

Desenvolvido para gestão de remessas bancárias e cálculos financeiros.

