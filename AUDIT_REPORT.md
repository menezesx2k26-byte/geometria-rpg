# Auditoria estrutural, lógica, geométrica e visual — V5

Data: 2026-08-18
Branch de trabalho: `agent/full-audit-v5`
Alvo de integração: `codex/v2-gamified-path`

## Escopo

A auditoria cobre arquitetura de navegação, integridade de conteúdo, estado persistido e migração, motor adaptativo, progressão da campanha, semântica dos exercícios, correção geométrica dos diagramas, responsividade, acessibilidade e pipeline de publicação.

## Correções estruturais e lógicas

- Rotas desconhecidas agora exibem uma tela de recuperação em vez de redirecionar silenciosamente.
- Erros inesperados de renderização são contidos por um Error Boundary sem apagar o progresso local.
- O estado persistido V4 é normalizado defensivamente: números não finitos, IDs obsoletos, missões inexistentes, agendas de revisão inválidas e tentativas malformadas deixam de contaminar o progresso.
- Migrações preservam a origem anterior e reconstroem o progresso compatível com o catálogo atual.
- XP, nível, estrelas, streak e recompensas foram normalizados para impedir valores inventados ou incoerentes.
- Respostas erradas passam a reduzir corretamente a estimativa de domínio em modelos legados 0–100.
- Conclusões adaptativas fora da campanha não gravam mais rotas inexistentes em `lastPosition`.
- O catálogo de campanha valida IDs, ordens, pré-requisitos, ciclos, recompensas, ownership de questões e cobertura das listas.
- A validação de conteúdo verifica referências cruzadas, relações alcançáveis, objetos, justificativas, steps e regras de conclusão.

## Motor adaptativo

- Evidências foram vinculadas ao passo realmente executado, evitando atribuir todas as competências de um desafio a cada ação do aluno.
- Scores, confiança, cobertura e contadores passam por normalização finita e limites válidos.
- Bindings de competências hard/soft/pré-requisitos e dimensões avaliadas são validados estruturalmente.

## Correções geométricas

### Correspondência ordenada

- Separação C/E ampliada para mobile.
- Marcas de lados foram diferenciadas para representar pares correspondentes sem sugerir falsamente que o triângulo é isósceles.

### Encruzilhada OPV/LAL

- As marcas antigas contradiziam as hipóteses `AF ≅ FH` e `BF ≅ FR`.
- Os pares foram corrigidos com estilos distintos de congruência.

### Questão oficial 15

- O desenho anterior não mantinha A–C–E colineares, invalidando visualmente o uso de OPV.
- O novo modelo usa simetria central exata em C: B–C–D e A–C–E são colineares, BC=CD e os ângulos dados são coerentes.
- As marcações de congruência e arcos foram reposicionadas geometricamente sobre as retas corretas.

### Forjador de Retas

- Os diagramas foram reconstruídos por etapa para obedecer às próprias equações e coordenadas: colinearidade, retas vertical/horizontal, sistema possível determinado, impossível, possível indeterminado e mediana final.

### Paralelismo

- Marcas nos meios das diagonais agora distinguem `AM=MC` de `BM=MD`, eliminando a falsa leitura de que os quatro segmentos seriam congruentes.

## Visual, mobile e acessibilidade

- SVGs responsivos preservam proporções, usam strokes estáveis e rótulos com halo de contraste.
- Layouts estreitos foram revistos para 360, 390 e 412 px.
- Cabeçalho, navegação inferior, cards, paletas e áreas de trabalho respeitam safe areas e touch targets.
- Títulos e textos quebram de forma segura, evitando truncamento e overflow horizontal.
- SVGs interativos têm nomes acessíveis e suporte de teclado quando selecionáveis.
- Estados selecionados usam `aria-pressed`/`aria-selected` conforme o componente.
- Animações e scroll suave respeitam `prefers-reduced-motion`.
- Reset de progresso exige confirmação explícita.
- Terminologia visível foi uniformizada em português.

## QA obrigatório antes da integração

A branch só deve ser integrada após:

1. `npm ci`
2. `npm run lint`
3. `npm test`
4. `npm run build`
5. instalação do Chromium do Playwright
6. `npm run test:e2e`

Os E2E cobrem os fluxos matemáticos principais, persistência/migração, ausência de overflow em mobile, separação dos rótulos C/E, refresh de rotas diretas, carregamento de assets e violações sérias/críticas de acessibilidade.

## Deploy

O projeto é publicado como Cloudflare Worker com Static Assets e fallback SPA. O deploy deve ocorrer somente após todos os gates acima passarem.
