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

## Deploy

Pipeline oficial: GitHub → Cloudflare Pages.

- Repositório: https://github.com/menezesx2k26-byte/geometria-rpg
- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`

O Cloudflare Pages aplica fallback de SPA quando não existe um `404.html` de nível superior. Isso permite abrir e recarregar diretamente rotas como `/map`, `/encounter/:id` e `/codex/:id`.

## Arquitetura

- `src/data`: conteúdo declarativo, sem hardcode nas páginas;
- `src/engine`: regras puras dos encounters e provas;
- `src/state`: progresso persistido localmente;
- `src/components`: interfaces reutilizáveis de geometria, gameplay, prova e navegação;
- `src/pages`: mapa, encounters, Codex, treino e revisão;
- `src/types`: modelo do domínio matemático e pedagógico.
