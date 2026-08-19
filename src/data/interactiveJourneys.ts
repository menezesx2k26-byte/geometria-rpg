import type { DiagnosticTag, MasteryDimension } from '../types/domain';

export interface JourneyOption {
  id: string;
  label: string;
  feedback: string;
}

export interface JourneyStage {
  id: string;
  phase: string;
  prompt: string;
  context: string;
  options: JourneyOption[];
  correctOptionId: string;
  successMessage: string;
  workspaceEntry: string;
  hint: string;
  diagnosticTag: DiagnosticTag;
  skillIds: string[];
  masteryDimensions: MasteryDimension[];
}

const option = (id: string, label: string, feedback: string): JourneyOption => ({ id, label, feedback });

export const lineForgeStages: JourneyStage[] = [
  {
    id: 'midpoint-bc', phase: '01 · PONTO MÉDIO',
    prompt: 'B=(0,−1) e C=(−3,2). Qual ponto divide BC em duas partes iguais?',
    context: 'Comece pelos objetos dados. Ainda não há reta nem coeficiente angular.',
    options: [
      option('m-correct', 'M=(−3/2, 1/2)', 'Correto: cada coordenada é a média das coordenadas correspondentes.'),
      option('m-sum', 'M=(−3,1)', 'Você somou as coordenadas, mas não dividiu por 2.'),
      option('m-swap', 'M=(3/2,−1/2)', 'Os sinais foram invertidos; releia as coordenadas de B e C.'),
    ],
    correctOptionId: 'm-correct', successMessage: 'Ponto auxiliar construído antes da reta.', workspaceEntry: 'M_BC=(−3/2, 1/2)',
    hint: 'Use ((x_B+x_C)/2, (y_B+y_C)/2).', diagnosticTag: 'midpoint-formula-error', skillIds: ['coordinate-midpoint'], masteryDimensions: ['application'],
  },
  {
    id: 'collinearity', phase: '02 · COLINEARIDADE',
    prompt: 'A=(0,0), B=(1,3) e D=(2,6). O que o determinante 3×3 revela?',
    context: 'A colinearidade é decidida por uma relação algébrica entre três pontos.',
    options: [
      option('det-zero', 'det=0; A, B e D são colineares', 'Correto: determinante nulo confirma que os três pontos pertencem à mesma reta.'),
      option('det-six', 'det=6; formam um triângulo', 'Recalcule usando as linhas (x,y,1); os termos se cancelam.'),
      option('slope-only', 'Só o coeficiente angular pode decidir', 'O determinante é a rota canônica desta etapa e também trata a colinearidade.'),
    ],
    correctOptionId: 'det-zero', successMessage: 'Colinearidade estabelecida sem depender do desenho.', workspaceEntry: 'det(A,B,D)=0 ⇒ A,B,D colineares',
    hint: 'Expanda det[[0,0,1],[1,3,1],[2,6,1]].', diagnosticTag: 'collinearity-determinant', skillIds: ['coordinate-collinearity'], masteryDimensions: ['application', 'justification'],
  },
  {
    id: 'generic-point-line', phase: '03 · RETA POR DOIS PONTOS',
    prompt: 'Um ponto genérico P=(x,y) está alinhado com B=(0,−1) e C=(−3,2). Qual equação resulta?',
    context: 'Coloque P no mesmo teste de alinhamento; a equação nasce da condição geométrica.',
    options: [
      option('line-correct', 'x+y+1=0', 'Correto: B, C e todo P da reta satisfazem essa equação.'),
      option('line-wrong-c', 'x+y−1=0', 'O termo constante não satisfaz B=(0,−1). Faça o teste de pertencimento.'),
      option('line-slope', 'y=x−1', 'Essa reta passa por B, mas não por C.'),
    ],
    correctOptionId: 'line-correct', successMessage: 'A equação geral foi derivada da colinearidade.', workspaceEntry: 'r: x+y+1=0',
    hint: 'Uma boa equação deve zerar quando B ou C é substituído.', diagnosticTag: 'general-line-equation', skillIds: ['general-line-equation'], masteryDimensions: ['application', 'reproduction'],
  },
  {
    id: 'interpret-equation', phase: '04 · REPRESENTAÇÃO GRÁFICA',
    prompt: 'Para esboçar x+y+1=0, qual par de pontos é uma escolha válida?',
    context: 'A reta é o conjunto de todas as soluções; dois pontos distintos bastam para o esboço.',
    options: [
      option('points-correct', '(−1,0) e (0,−1)', 'Correto: ambos zeram x+y+1 e são distintos.'),
      option('points-same', '(−1,0) e (−1,0)', 'Um único ponto repetido não determina a direção da reta.'),
      option('points-false', '(1,0) e (0,1)', 'Esses pontos produzem 2, não 0, na expressão x+y+1.'),
    ],
    correctOptionId: 'points-correct', successMessage: 'Equação convertida em representação gráfica.', workspaceEntry: '(−1,0),(0,−1) ∈ r',
    hint: 'Substitua cada par em x+y+1.', diagnosticTag: 'line-representation-fluency', skillIds: ['line-solution-set'], masteryDimensions: ['application'],
  },
  {
    id: 'special-lines', phase: '05 · CASOS ESPECIAIS',
    prompt: 'Como interpretar x=3 e y=1 sem recorrer a slope?',
    context: 'Essas equações já dizem qual coordenada permanece constante.',
    options: [
      option('special-correct', 'x=3 é vertical; y=1 é horizontal', 'Correto: x constante fixa uma coluna; y constante fixa uma altura.'),
      option('special-swapped', 'x=3 é horizontal; y=1 é vertical', 'As orientações foram trocadas. Observe qual eixo mede cada coordenada.'),
      option('special-points', 'Cada equação representa apenas um ponto', 'A outra coordenada é livre; portanto há infinitos pontos em cada reta.'),
    ],
    correctOptionId: 'special-correct', successMessage: 'Casos vertical e horizontal reconhecidos diretamente.', workspaceEntry: 'x=3 vertical · y=1 horizontal',
    hint: 'Em x=3, y pode assumir qualquer valor.', diagnosticTag: 'vertical-horizontal-confusion', skillIds: ['vertical-horizontal-lines'], masteryDimensions: ['recognition'],
  },
  {
    id: 'supporting-lines', phase: '06 · RETAS SUPORTE',
    prompt: 'A=(0,0), B=(1,3), C=(4,0). Quais são as retas suporte de AB e AC?',
    context: 'O segmento é limitado; sua reta suporte continua indefinidamente e recebe uma equação.',
    options: [
      option('support-correct', 'AB: 3x−y=0 · AC: y=0', 'Correto: cada equação contém as duas extremidades do respectivo segmento.'),
      option('support-swapped', 'AB: y=0 · AC: 3x−y=0', 'As equações válidas foram associadas aos segmentos errados.'),
      option('support-segment', 'AB e AC não podem ter equações', 'A equação descreve a reta suporte, não apenas o trecho desenhado.'),
    ],
    correctOptionId: 'support-correct', successMessage: 'Figura traduzida em duas retas suporte.', workspaceEntry: '↔AB: 3x−y=0 · ↔AC: y=0',
    hint: 'Teste as extremidades em cada equação.', diagnosticTag: 'supporting-line-vs-segment', skillIds: ['supporting-line'], masteryDimensions: ['application', 'justification'],
  },
  {
    id: 'solution-set', phase: '07 · CONJUNTO SOLUÇÃO',
    prompt: 'Qual definição descreve corretamente r: 3x−y=0?',
    context: 'A equação não é apenas uma instrução de cálculo: ela seleciona pontos do plano.',
    options: [
      option('set-correct', 'r={(x,y)∈ℝ² : 3x−y=0}', 'Correto: pertencimento à reta significa satisfazer a equação.'),
      option('set-one', 'r={(3,0)}', 'Uma reta contém infinitos pontos; (3,0) nem satisfaz a equação.'),
      option('set-values', 'r={3,−1,0}', 'Coeficientes não são os elementos do conjunto geométrico.'),
    ],
    correctOptionId: 'set-correct', successMessage: 'Reta interpretada como conjunto de pontos.', workspaceEntry: 'P∈r ⇔ 3x_P−y_P=0',
    hint: 'Os elementos de r devem ser pares ordenados.', diagnosticTag: 'line-representation-fluency', skillIds: ['line-solution-set'], masteryDimensions: ['reproduction'],
  },
  {
    id: 'system-spd', phase: '08 · SISTEMA SPD',
    prompt: 'x+y=4 e x−y=2 têm solução P=(3,1). Qual cadeia interpreta o resultado?',
    context: 'Primeiro sistema; depois solução; então interseção e posição relativa.',
    options: [
      option('spd-correct', 'uma solução → r∩s={(3,1)} → concorrentes', 'Correto: a solução comum é exatamente o ponto de interseção.'),
      option('spd-parallel', 'uma solução → paralelas distintas', 'Paralelas distintas não compartilham ponto algum.'),
      option('spd-infinite', 'uma solução → coincidentes', 'Retas coincidentes produzem infinitas soluções.'),
    ],
    correctOptionId: 'spd-correct', successMessage: 'SPD conectado à geometria das retas.', workspaceEntry: 'SPD → {(3,1)} → concorrentes',
    hint: 'Pergunte quantos pontos pertencem simultaneamente às duas retas.', diagnosticTag: 'system-vs-intersection', skillIds: ['linear-system-classification', 'system-intersection-interpretation'], masteryDimensions: ['application', 'transfer'],
  },
  {
    id: 'system-si', phase: '09 · SISTEMA SI',
    prompt: 'x+y=3 e x+y=5. Qual classificação preserva a interpretação geométrica?',
    context: 'Os mesmos coeficientes impõem duas constantes incompatíveis.',
    options: [
      option('si-correct', 'SI → r∩s=∅ → paralelas distintas', 'Correto: nenhuma solução significa nenhum ponto comum.'),
      option('si-spi', 'SPI → r=s', 'Os termos constantes não são proporcionais; as retas não coincidem.'),
      option('si-spd', 'SPD → um ponto', 'Subtrair as equações produz 0=−2, uma incompatibilidade.'),
    ],
    correctOptionId: 'si-correct', successMessage: 'Incompatibilidade algébrica traduzida em paralelismo.', workspaceEntry: 'SI → ∅ → paralelas distintas',
    hint: 'Subtraia uma equação da outra.', diagnosticTag: 'system-classification-confusion', skillIds: ['linear-system-classification'], masteryDimensions: ['application'],
  },
  {
    id: 'system-spi', phase: '10 · SISTEMA SPI',
    prompt: 'x+2y−3=0 e 2x+4y−6=0. O que ocorre?',
    context: 'Equações visualmente diferentes podem representar a mesma reta.',
    options: [
      option('spi-correct', 'SPI → infinitas soluções → retas coincidentes', 'Correto: a segunda equação é duas vezes a primeira.'),
      option('spi-si', 'SI → nenhuma solução', 'Todos os coeficientes, inclusive o termo constante, são proporcionais.'),
      option('spi-two', 'Duas equações → duas retas distintas', 'A quantidade de escritas não determina a quantidade de objetos geométricos.'),
    ],
    correctOptionId: 'spi-correct', successMessage: 'Equivalência de retas reconhecida sem comparar strings.', workspaceEntry: 'SPI → r=s → coincidentes',
    hint: 'Multiplique a primeira equação por 2.', diagnosticTag: 'same-line-different-equation', skillIds: ['linear-system-classification'], masteryDimensions: ['justification', 'transfer'],
  },
  {
    id: 'median-boss', phase: 'CHEFE · MEDIANA ANALÍTICA',
    prompt: 'A=(2,−1) e M_BC=(−3/2,1/2). Qual é a equação da mediana por A?',
    context: 'A construção euclidiana “vértice → ponto médio” agora precisa virar uma reta.',
    options: [
      option('median-correct', '3x+7y+1=0', 'Correto: A e M satisfazem a equação, que representa a mediana inteira.'),
      option('median-midpoint', 'x+y+1=0', 'Essa é a reta BC; a mediana precisa passar por A e pelo ponto médio de BC.'),
      option('median-horizontal', 'y=−1', 'Essa reta passa por A, mas não pelo ponto médio M.'),
    ],
    correctOptionId: 'median-correct', successMessage: 'Mediana construída por modelagem, não por fórmula pronta.', workspaceEntry: 'mediana por A: 3x+7y+1=0',
    hint: 'A equação deve zerar em A=(2,−1) e em M=(−3/2,1/2).', diagnosticTag: 'wrong-line-equation', skillIds: ['coordinate-median', 'general-line-equation'], masteryDimensions: ['reproduction', 'transfer'],
  },
];

export const exercise48Stages: JourneyStage[] = [
  {
    id: 'read-points', phase: '01 · LER A FIGURA', prompt: 'Quais coordenadas estão dadas diretamente?', context: 'Não derive nada ainda: separe dados de consequências.',
    options: [option('given-correct', 'O=(0,0), B=(0,2), C=(2,0)', 'Correto: são os três pontos explicitamente dados.'), option('given-with-midpoints', 'O, B, C, M e N já estão dados', 'M e N são definidos geometricamente e ainda precisam ser derivados.'), option('given-intersection', 'Apenas P=(2/3,2/3)', 'P é o objetivo intermediário, não um dado inicial.')],
    correctOptionId: 'given-correct', successMessage: 'Dados separados das construções.', workspaceEntry: 'DADOS: O=(0,0), B=(0,2), C=(2,0)', hint: 'Procure somente os pares escritos no enunciado.', diagnosticTag: 'wrong-point-read-from-axis', skillIds: ['cartesian-coordinates'], masteryDimensions: ['recognition'],
  },
  {
    id: 'derive-midpoints', phase: '02 · PONTOS AUXILIARES', prompt: 'M e N são pontos médios de OB e OC. Quais coordenadas devem ser construídas?', context: 'Agora aplique a relação geométrica de ponto médio.',
    options: [option('midpoints-correct', 'M=(0,1) e N=(1,0)', 'Correto: cada ponto fica no eixo do respectivo segmento e na metade do caminho.'), option('midpoints-swap', 'M=(1,0) e N=(0,1)', 'As coordenadas corretas foram associadas aos segmentos errados.'), option('midpoints-end', 'M=(0,2) e N=(2,0)', 'Esses são B e C, não os pontos médios.')],
    correctOptionId: 'midpoints-correct', successMessage: 'Pontos auxiliares derivados.', workspaceEntry: 'M=(0,1) · N=(1,0)', hint: 'M está em OB; N está em OC.', diagnosticTag: 'midpoint-formula-error', skillIds: ['coordinate-midpoint'], masteryDimensions: ['application'],
  },
  {
    id: 'choose-lines', phase: '03 · ESCOLHER RETAS', prompt: 'Quais retas da figura determinam P?', context: 'P é o cruzamento dos dois segmentos internos, portanto pertence às suas retas suporte.',
    options: [option('lines-correct', 'r=↔BN e s=↔MC', 'Correto: são as duas retas que contêm o cruzamento P.'), option('lines-axes', 'r=↔OB e s=↔OC', 'Essas são as retas dos eixos e se cruzam em O, não em P.'), option('lines-sides', 'r=↔BC e s=↔ON', 'Essas escolhas não correspondem aos dois traços internos da figura.')],
    correctOptionId: 'lines-correct', successMessage: 'Retas relevantes escolhidas antes da álgebra.', workspaceEntry: 'P∈↔BN e P∈↔MC', hint: 'Siga visualmente os dois traços que atravessam P.', diagnosticTag: 'chooses-wrong-line', skillIds: ['figure-to-equation', 'supporting-line'], masteryDimensions: ['application'],
  },
  {
    id: 'build-lines', phase: '04 · CONSTRUIR EQUAÇÕES', prompt: 'Quais equações representam as retas escolhidas?', context: 'Use B,N para r e M,C para s; teste os pontos ao terminar.',
    options: [option('equations-correct', 'r: 2x+y−2=0 · s: x+2y−2=0', 'Correto: cada par de pontos satisfaz sua própria equação.'), option('equations-axes', 'r: x=0 · s: y=0', 'Essas são as retas OB e OC, não BN e MC.'), option('equations-swap-c', 'r: 2x+y=0 · s: x+2y=0', 'Os termos constantes foram omitidos; B e C deixam de pertencer às retas.')],
    correctOptionId: 'equations-correct', successMessage: 'Geometria traduzida em duas equações gerais.', workspaceEntry: 'r:2x+y−2=0 · s:x+2y−2=0', hint: 'Substitua B=(0,2) em r e C=(2,0) em s.', diagnosticTag: 'wrong-line-equation', skillIds: ['general-line-equation'], masteryDimensions: ['application', 'justification'],
  },
  {
    id: 'build-system', phase: '05 · MONTAR SISTEMA', prompt: 'Qual sistema expressa que P pertence simultaneamente a r e s?', context: 'Interseção significa solução comum; nenhuma outra reta deve entrar.',
    options: [option('system-correct', '{ 2x+y−2=0 ; x+2y−2=0 }', 'Correto: o sistema reúne exatamente as duas condições de pertencimento.'), option('system-one', '{ 2x+y−2=0 }', 'Uma única reta não determina o ponto de interseção.'), option('system-distance', '{ d(P,B)=2d(P,N) }', 'Essa é a tese métrica final, não o sistema que localiza P.')],
    correctOptionId: 'system-correct', successMessage: 'Sistema construído a partir da figura.', workspaceEntry: 'P=r∩s ⇔ sistema(r,s)', hint: 'Use as duas equações estabelecidas na fase anterior.', diagnosticTag: 'fails-to-build-system', skillIds: ['system-intersection-interpretation'], masteryDimensions: ['reproduction'],
  },
  {
    id: 'solve-system', phase: '06 · RESOLVER E INTERPRETAR', prompt: 'Qual resultado completa sistema → solução → interseção?', context: 'A resolução algébrica só termina quando volta à geometria.',
    options: [option('p-correct', 'x=y=2/3; P=(2/3,2/3)=r∩s', 'Correto: a solução comum localiza o ponto geométrico.'), option('p-one-third', 'P=(1/3,1/3)', 'Substitua: 2(1/3)+1/3−2=−1, então o ponto não pertence às retas.'), option('p-system-only', 'O sistema é SPD, então basta parar', 'SPD informa a quantidade; ainda é preciso registrar a solução e interpretá-la como P.')],
    correctOptionId: 'p-correct', successMessage: 'Solução algébrica devolvida à figura.', workspaceEntry: 'SPD → P=(2/3,2/3) → r e s concorrentes', hint: 'Subtraia as equações para obter x=y.', diagnosticTag: 'solves-system-but-cannot-interpret', skillIds: ['linear-system-classification', 'system-intersection-interpretation'], masteryDimensions: ['application', 'transfer'],
  },
  {
    id: 'choose-distances', phase: '07 · ESCOLHER DISTÂNCIAS', prompt: 'A tese pede d(P,B)=2d(P,N). Quais segmentos devem ser medidos?', context: 'Não calcule todas as distâncias da figura: selecione as que aparecem na afirmação.',
    options: [option('distance-pairs', 'PB e PN', 'Correto: são exatamente as duas grandezas comparadas pela tese.'), option('distance-sides', 'OB e OC', 'Esses lados são dados e iguais, mas não provam a relação pedida.'), option('distance-all', 'Todas as dez distâncias entre os cinco pontos', 'Isso é válido, porém não conecta de modo eficiente as hipóteses ao objetivo.')],
    correctOptionId: 'distance-pairs', successMessage: 'Cálculo focado no objetivo métrico.', workspaceEntry: 'ALVO MÉTRICO: comparar PB e PN', hint: 'Leia literalmente os dois argumentos de d(·,·).', diagnosticTag: 'metric-proof-gap', skillIds: ['exact-distance-proof'], masteryDimensions: ['application'],
  },
  {
    id: 'exact-radicals', phase: '08 · CALCULAR EXATAMENTE', prompt: 'Quais valores exatos resultam da fórmula da distância?', context: 'Mantenha os radicais; decimais esconderiam a razão exata.',
    options: [option('radicals-correct', 'd(P,B)=2√5/3 · d(P,N)=√5/3', 'Correto: os dois radicais têm a mesma parte irracional e coeficientes em razão 2:1.'), option('radicals-decimal', 'd(P,B)≈1,49 · d(P,N)≈0,75', 'As aproximações sugerem a razão, mas não constituem uma prova exata.'), option('radicals-swapped', 'd(P,B)=√5/3 · d(P,N)=2√5/3', 'As distâncias foram associadas aos segmentos errados.')],
    correctOptionId: 'radicals-correct', successMessage: 'Distâncias simplificadas sem perder exatidão.', workspaceEntry: 'PB=2√5/3 · PN=√5/3', hint: 'PB²=20/9 e PN²=5/9.', diagnosticTag: 'radical-simplification', skillIds: ['distance-formula-skill', 'exact-distance-proof'], masteryDimensions: ['application', 'reproduction'],
  },
  {
    id: 'metric-conclusion', phase: '09 · CONCLUIR A PROVA', prompt: 'Qual conclusão fecha a cadeia sem salto lógico?', context: 'Use os valores exatos já estabelecidos e volte à tese.',
    options: [option('proof-correct', 'Como 2√5/3=2·(√5/3), então d(P,B)=2d(P,N)', 'Correto: a igualdade decorre diretamente das duas medidas exatas.'), option('proof-picture', 'Parece que PB é o dobro de PN no desenho', 'A aparência da figura não prova uma relação métrica exata.'), option('proof-decimal', '1,49 é mais ou menos 2·0,75', 'Uma aproximação não sustenta a igualdade exata solicitada.')],
    correctOptionId: 'proof-correct', successMessage: 'Cadeia completa: figura → modelagem → sistema → prova métrica.', workspaceEntry: '∴ d(P,B)=2d(P,N)', hint: 'Fatore 2 no valor de d(P,B).', diagnosticTag: 'exact-vs-decimal', skillIds: ['coordinate-proof', 'exact-distance-proof'], masteryDimensions: ['justification', 'transfer'],
  },
];

export const parallelismStages: JourneyStage[] = [
  {
    id: 'alternate-interior', phase: '01 · FAMÍLIA ANGULAR', prompt: 'Em r∥s cortadas por t, α e β ficam entre r e s, em lados opostos de t. Qual relação usar?', context: 'A posição dos ângulos vem antes de qualquer equação.',
    options: [option('alternate', 'Alternos internos: α≅β', 'Correto: internos e em lados opostos da transversal.'), option('corresponding', 'Correspondentes', 'Correspondentes ocupam a mesma posição relativa em cada cruzamento.'), option('collateral', 'Colaterais internos: α+β=180°', 'Colaterais internos ficam no mesmo lado da transversal.')],
    correctOptionId: 'alternate', successMessage: 'Família angular reconhecida pela posição.', workspaceEntry: 'r∥s ⇒ α≅β (alternos internos)', hint: 'Use duas perguntas: estão dentro ou fora? mesmo lado ou lados opostos?', diagnosticTag: 'parallel-angle-family', skillIds: ['parallel-angle-families'], masteryDimensions: ['recognition', 'justification'],
  },
  {
    id: 'solve-angle-x', phase: '02 · DETERMINAR x', prompt: 'Se α=3x+10° e β=5x−20° são alternos internos, qual valor de x?', context: 'A equação só existe porque o paralelismo justificou α=β.',
    options: [option('x15', 'x=15', 'Correto: 3x+10=5x−20, então 2x=30.'), option('x5', 'x=5', 'Você operou os termos constantes sem preservar os dois lados.'), option('x95', 'x=95', '95° é o valor dos ângulos quando x=15, não o valor de x.')],
    correctOptionId: 'x15', successMessage: 'Relação geométrica traduzida em equação.', workspaceEntry: '3x+10=5x−20 ⇒ x=15 ⇒ α=β=55°', hint: 'Iguale as expressões antes de resolver.', diagnosticTag: 'algebra-linear', skillIds: ['parallel-angle-families'], masteryDimensions: ['application'],
  },
  {
    id: 'parallel-converse', phase: '03 · PROVAR PARALELISMO', prompt: 'Sem assumir r∥s, você mede um par de alternos internos congruentes. O que pode concluir?', context: 'Agora a igualdade angular é hipótese e o paralelismo é conclusão.',
    options: [option('converse-correct', 'Pela conversa: r∥s', 'Correto: a conversa transforma a congruência do par adequado em paralelismo.'), option('direct-wrong', 'Como r∥s, os ângulos são iguais', 'Isso usa como hipótese exatamente o que ainda precisa ser provado.'), option('perpendicular', 'r⊥s', 'Congruência de alternos internos não caracteriza perpendicularidade.')],
    correctOptionId: 'converse-correct', successMessage: 'Conversa aplicada sem circularidade.', workspaceEntry: 'alternos internos congruentes ⇒ r∥s', hint: 'Troque hipótese e conclusão do teorema direto.', diagnosticTag: 'parallel-converse', skillIds: ['parallel-converse-skill'], masteryDimensions: ['justification', 'reproduction'],
  },
  {
    id: 'parallelogram-boss', phase: 'CHEFE · DIAGONAIS', prompt: 'Em ABCD, as diagonais AC e BD se cruzam em M com AM=MC e BM=MD. Qual construção inicia a prova de que ABCD é paralelogramo?', context: 'Os pontos médios já produzem pares de lados em triângulos opostos; é preciso conectá-los.',
    options: [option('diagonal-proof', 'Comparar △AMB e △CMD, depois △AMD e △CMB por LAL', 'Correto: OPV fornece o ângulo compreendido e os meios fornecem os pares de lados.'), option('assume-parallel', 'Declarar AB∥CD e AD∥BC', 'Essas são as conclusões; assumi-las tornaria a prova circular.'), option('measure-drawing', 'Medir os lados no desenho', 'A aparência não substitui as hipóteses de ponto médio e OPV.')],
    correctOptionId: 'diagonal-proof', successMessage: 'A caracterização do paralelogramo nasceu das diagonais.', workspaceEntry: 'diagonais se bissetam ⇒ pares LAL ⇒ lados opostos paralelos', hint: 'Em M há ângulos opostos pelo vértice.', diagnosticTag: 'parallelogram-characterization', skillIds: ['parallelogram-characterization'], masteryDimensions: ['application', 'justification', 'transfer'],
  },
];

export const crossoverStages: JourneyStage[] = [
  {
    id: 'median-two-languages', phase: '01 · MEDIANA', prompt: 'Qual par descreve a mesma mediana nas duas linguagens?', context: 'Procure a estrutura preservada, não palavras idênticas.',
    options: [option('median-match', 'Sintética: vértice→ponto médio · Analítica: midpoint + reta por dois pontos', 'Correto: a construção é a mesma; apenas a codificação muda.'), option('median-height', 'Sintética: perpendicular · Analítica: x=k', 'Isso descreve um caso de altura, não toda mediana.'), option('median-distance', 'Sintética: lados iguais · Analítica: distância', 'Equidistância não é a definição de mediana.')],
    correctOptionId: 'median-match', successMessage: 'Mediana transferida entre duas representações.', workspaceEntry: 'mediana ↔ ponto médio + reta', hint: 'Qual objeto a mediana precisa atingir no lado oposto?', diagnosticTag: 'midpoint-formula-error', skillIds: ['median', 'coordinate-median'], masteryDimensions: ['transfer'],
  },
  {
    id: 'intersection-two-languages', phase: '02 · INTERSEÇÃO', prompt: 'Qual tradução analítica corresponde ao ponto comum de duas retas?', context: 'A geometria vê um encontro; a álgebra vê condições simultâneas.',
    options: [option('intersection-match', 'Solução comum do sistema formado pelas duas equações', 'Correto: o par deve satisfazer as duas equações ao mesmo tempo.'), option('intersection-union', 'União de todos os pontos das duas retas', 'A união inclui pontos que pertencem a apenas uma reta.'), option('intersection-slope', 'Produto dos coeficientes angulares', 'Coeficientes podem estudar direção, mas não localizam sozinhos o ponto comum.')],
    correctOptionId: 'intersection-match', successMessage: 'Interseção reconhecida como solução comum.', workspaceEntry: 'r∩s ↔ soluções comuns do sistema', hint: 'Traduza “pertence a r e pertence a s”.', diagnosticTag: 'system-vs-intersection', skillIds: ['system-intersection-interpretation'], masteryDimensions: ['transfer'],
  },
  {
    id: 'perpendicular-bisector-two-languages', phase: '03 · MEDIATRIZ', prompt: 'Como construir a mediatriz de AB analiticamente sem perder sua definição sintética?', context: 'Mediatriz combina duas relações: ponto médio e perpendicularidade.',
    options: [option('bisector-match', 'Calcular M_AB e obter a reta por M perpendicular à reta AB', 'Correto: as duas condições definidoras permanecem explícitas.'), option('bisector-midpoint-only', 'Calcular apenas M_AB', 'O ponto médio sozinho não determina uma reta.'), option('bisector-equal-line', 'Usar a mesma equação de AB', 'A mediatriz deve ser perpendicular a AB, não coincidente com ela.')],
    correctOptionId: 'bisector-match', successMessage: 'Definição sintética preservada na modelagem analítica.', workspaceEntry: 'mediatriz ↔ ponto médio + perpendicular', hint: 'Liste as duas palavras que compõem a definição de mediatriz.', diagnosticTag: 'perpendicularity', skillIds: ['perpendicular-bisector', 'figure-to-equation'], masteryDimensions: ['transfer', 'reproduction'],
  },
];
