# Copilot Instructions for RemessaSeguraPortal

## Project Overview
- **Framework:** Angular (CLI v20.3.9)
- **Structure:** Follows standard Angular modular architecture. Key directories:
  - `src/app/pages/`: Feature modules and UI components (e.g., bancos, calculadora, edicoesocorrencias)
  - `src/app/service/`: API and business logic services
  - `src/app/models/`: TypeScript interfaces and models for domain entities
  - `src/app/data/`: Static data and configuration files
  - `src/app/guards/`: Route guards for authentication and roles
  - `src/environments/`: Environment configuration

## Developer Workflows
- **Start Dev Server:**
  - Use `ng serve` or `npm start` (see tasks.json)
  - Default port: `http://localhost:4200/`
- **Build:**
  - `ng build` outputs to `dist/`
- **Unit Tests:**
  - `ng test` (Karma runner)
- **E2E Tests:**
  - `ng e2e` (framework not preconfigured)

## Key Patterns & Conventions
- **Component Organization:**
  - Each feature in `pages/` has its own folder with `.component.ts`, `.component.html`, `.component.css`
  - Shell components aggregate feature logic (e.g., `edicoesocorrencias.shell.component.ts`)
- **Service Usage:**
  - API calls and business logic are centralized in `service/` (e.g., `auth.service.ts`, `bancos.service.ts`)
  - Use Angular dependency injection for service access
- **Guards:**
  - Route protection via `auth.guard.ts` and `role.guard.ts`
- **Data Flow:**
  - Static data in `data/` (e.g., `bancos.data.ts`, `noticias.data.ts`)
  - Models in `models/` define shape for API and UI data
- **Assets:**
  - Images, PDFs, and layouts in `assets/` and `public/`

## Integration Points
- **External APIs:**
  - API endpoints managed via services in `service/`
- **Environment Config:**
  - Use `environments/environment.ts` for environment-specific settings

## Project-Specific Notes
- **Scripts:**
  - Custom scripts in `src/scripts/` (e.g., `gerar-layouts-data.mjs` for data generation)
- **Testing:**
  - Unit tests colocated with components/services as `.spec.ts` files
- **Routing:**
  - Centralized in `app.routes.ts`

## Example: Adding a Feature
1. Generate a new component: `ng generate component pages/newfeature/newfeature`
2. Add business logic in `service/` if needed
3. Update routing in `app.routes.ts`
4. Add models to `models/` if new data types are required

## References
- See [README.md](../../README.md) for CLI commands and more details
- Key files: `src/app/app.ts`, `src/app/app.routes.ts`, `src/app/service/`, `src/app/pages/`

---
*Update this file as project conventions evolve. Focus on actionable, project-specific guidance for AI agents.*
