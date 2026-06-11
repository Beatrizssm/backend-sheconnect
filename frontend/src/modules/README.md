# Frontend modules (espelha o backend)

Estrutura alinhada a `backend/src/modules/{feature}/`:

```
modules/
├── app-shell/          # layout autenticado, menu, abas
│   ├── application/    # use-app-controller.tsx (estado + efeitos)
│   └── presentation/   # AppShellPage, AppTabContent
├── auth/               # home, login, cadastro, recuperar senha
├── dashboard/          # dashboard da empreendedora
├── analytics/          # painel admin — métricas
├── users/              # painel admin — usuários
├── startups/
├── mentorships/
├── events/
├── networking/         # conexões
├── chat/
└── notifications/      # avisos
```

Cada módulo segue:

- `domain/` — tipos e constantes do domínio
- `application/` — hooks de caso de uso (ex.: `use-startups.ts`)
- `infrastructure/api/` — chamadas HTTP
- `presentation/pages/` — telas (`*-page.tsx`)
- `presentation/components/` — componentes locais (quando existirem)

Compartilhado em `src/shared/` (utilitários, UI genérica, constantes de marketing, `infrastructure/api/client`, realtime).

Cada módulo também expõe API HTTP em `infrastructure/api/*.api.ts` e tipos em `domain/*.types.ts`.
Barrel: `modules/{feature}/index.ts`.

Ponto de entrada da UI: `src/pages/AppPage.tsx` (roteador fino).

`src/services/*.ts` permanecem apenas como re-export legado (deprecated).
