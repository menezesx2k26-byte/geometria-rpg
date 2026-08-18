# Motor adaptativo V4

## Invariantes

- A campanha permanece linear, com 11 missões em 3 capítulos.
- `getNextCampaignNode` é a única fonte do CTA principal “Continuar jornada”.
- Revisão, remediação e transferência aparecem como cards secundários.
- XP, nível, estrelas, streak, quests e conquistas não entram em domínio ou confiança.
- O motor é determinístico, local-first e não gera enunciados, figuras, gabaritos ou soluções.

## Fluxo

1. Cada decisão chama `recordAttempt` com conceitos atuais, dimensões observadas e pistas usadas.
2. `assessmentEngine` produz C/J/I/V em 0–1. Componentes não observados permanecem `null`.
3. `challengeProfiles` vincula a tarefa, e não o conceito global, a H1–H15.
4. `evidenceEngine` aplica a média móvel com alfa base 0,25 e peso relativo da competência.
5. A confiança combina volume, variedade de desafios e cobertura observada.
6. `adaptiveSelector` escolhe uma rota pronta e explica a recomendação.

## Persistência

- Chave atual: `geometria-rpg:progress:v4`.
- Origem preservada: `geometria-rpg:progress:v3`.
- V1/V2/V3 são aceitas por `migrateProgress`.
- Tentativas V3 reconstroem somente correção e independência quando o uso de pista é conhecido. Justificação e verificação permanecem `null`.
- Uma gravação V4 inválida tenta recuperar a origem legada sem removê-la.

## Conteúdo e proveniência

As atividades autorais já existentes estão registradas como `standard_example`, `synthetic: true` e `sourceItem: null`. Isso permite avaliar o motor sem atribuí-las indevidamente às listas originais. Itens futuros das listas precisam de fonte, versão, ID canônico e validação antes de receber status `ready`.

## UX

- O mapa não expõe códigos H1–H15; usa nomes narrativos.
- A Ficha do Geômetra mostra domínio, quantidade de evidências e confiança.
- Autoconfiança é opcional e não altera o domínio.
- Pistas registram tier; o tier altera somente independência.
- Debriefs separam recompensa de atividade e evidência matemática.

## Testes canônicos

- pesos de rubrica somam 1;
- catálogo completo H/S/P;
- componentes ausentes não são tratados como erro;
- fórmula 0,75/0,25;
- competência marcada como `context` não recebe evidência;
- H10 forte com H6/H15 fracas seleciona prova focada;
- revisão vencida não substitui o CTA principal;
- migração mantém a chave V3.
