# Geometria RPG

Uma experiência mobile-first de Geometria Euclidiana em que teoremas são habilidades, exercícios são encounters e provas são desafios de raciocínio. O progresso representa dependências matemáticas reais e permanece no dispositivo via `localStorage`.

## Desenvolvimento

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

O projeto é uma SPA React + TypeScript + Vite. O bundle estático é gerado em `dist/` e não depende de servidor Node ou backend.

## Qualidade

```bash
npm run test       # Vitest: regras puras e integridade do conteúdo
npm run test:e2e   # Playwright: aplicação real em Chromium
npm run qa         # lint + unitários + build + E2E
```

O relatório reproduzível de aceite está em [`QA_REPORT.md`](./QA_REPORT.md).

## Deploy

Pipeline oficial: GitHub → Cloudflare Pages.

- Repositório: https://github.com/menezesx2k26-byte/geometria-rpg
- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`

O arquivo `public/_redirects` aplica o fallback da SPA. Isso permite abrir e recarregar diretamente rotas como `/map`, `/encounter/:id` e `/codex/:id`.

## Arquitetura

- `src/data`: conteúdo declarativo, sem hardcode nas páginas;
- `src/engine`: regras puras dos encounters e provas;
- `src/state`: progresso persistido localmente;
- `src/components`: interfaces reutilizáveis de geometria, gameplay, prova e navegação;
- `src/pages`: mapa, campanhas, encounters, Proof Engine, laboratório, Codex, treino e revisão;
- `src/types`: modelo do domínio matemático e pedagógico.
