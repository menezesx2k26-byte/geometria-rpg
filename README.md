# Geometria RPG

Uma experiência mobile-first de Geometria Euclidiana e Analítica em que teoremas são habilidades, exercícios são encounters e provas são desafios de raciocínio. O progresso representa dependências matemáticas reais e permanece no dispositivo via `localStorage`.

## Rotas jogáveis

- **Fortaleza da Congruência:** correspondência, OPV, LAL, ALA e provas;
- **Passagem das Paralelas:** famílias angulares, conversas e paralelogramo;
- **Forja das Retas:** ponto médio, determinante, equação geral, reta como conjunto solução e SPD/SI/SPI;
- **Modelagem Métrica 48:** figura → pontos auxiliares → retas → sistema → distâncias exatas;
- **Ponte das Duas Linguagens:** transferência entre argumentos sintéticos e analíticos.

As rotas partem de `/vertical-slice`. Nenhuma delas concede domínio por leitura: somente tentativas matemáticas registradas alteram o perfil do estudante.

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

## Deploy público

- Repositório: https://github.com/menezesx2k26-byte/geometria-rpg
- Produção: https://geometria-rpg.pages.dev
- Preview QA: https://qa-preview.geometria-rpg.pages.dev
- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`

O arquivo `public/_redirects` aplica o fallback da SPA. Isso permite abrir e recarregar diretamente rotas como `/map`, `/encounter/:id` e `/codex/:id`.

O release atual foi publicado por Direct Upload com Wrangler e está associado ao hash do commit no histórico do Pages. Novos pushes precisam de novo deploy pelo Wrangler. Pela limitação do Pages, a integração Git nativa exigirá um novo projeto criado no dashboard depois da autorização OAuth do GitHub.

## Arquitetura

- `src/data`: conteúdo declarativo, sem hardcode nas páginas;
- `src/engine`: regras puras dos encounters, provas, retas, sistemas e distâncias exatas;
- `src/state`: progresso persistido localmente;
- `src/components`: interfaces reutilizáveis de geometria, gameplay, prova e navegação;
- `src/pages`: mapa, campanhas, encounters, Proof Engine, laboratórios de modelagem, Codex, treino filtrável e revisão adaptativa;
- `src/types`: modelo do domínio matemático e pedagógico.
