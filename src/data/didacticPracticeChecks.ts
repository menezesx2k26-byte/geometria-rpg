import type { DidacticCheck, DidacticLesson } from './didacticLessons';

export interface TaggedDidacticCheck extends DidacticCheck {
  skillIds: string[];
}

const baseCheckSkills: Record<string, Record<string, string[]>> = {
  'congruence-foundations': {
    'congruence-order': ['triangle-congruence'],
  },
  'opv-lal-foundations': {
    'opv-recognition': ['opv'],
    'sas-order': ['sas'],
  },
  'proof-tools': {
    'bisector-effect': ['angle-bisector'],
  },
  'ala-foundations': {
    'ala-condition': ['asa'],
  },
  'cevian-foundations': {
    'median-definition': ['median'],
  },
  'parallelism-foundations': {
    'parallel-converse': ['parallel-converse-skill'],
  },
  'cartesian-foundations': {
    quadrant: ['quadrants-signs'],
  },
  'coordinate-bridge': {
    midpoint: ['coordinate-midpoint'],
  },
  'line-system-foundations': {
    'system-meaning': ['linear-system-classification', 'system-intersection-interpretation'],
  },
  'distance-modeling-foundations': {
    distance: ['distance-formula-skill'],
  },
};

const supplementalChecks: Record<string, TaggedDidacticCheck[]> = {
  'opv-lal-foundations': [
    {
      id: 'cpctc-consequence',
      prompt: 'Depois de provar △ABC≅△DEF, qual conclusão usa corretamente partes correspondentes?',
      options: [
        { id: 'correct', label: 'BC≅EF, se B↔E e C↔F', feedback: 'Correto: a congruência já foi provada; agora transportamos a medida pelas partes correspondentes.' },
        { id: 'criterion', label: 'BC≅EF é o próprio critério LAL', feedback: 'LAL prova a congruência dos triângulos; a igualdade de partes correspondentes vem depois.' },
        { id: 'visual', label: 'BC≅EF porque parecem ter o mesmo tamanho', feedback: 'A aparência do desenho não é justificativa métrica.' },
      ],
      correctOptionId: 'correct',
      skillIds: ['cpctc'],
    },
  ],
  'proof-tools': [
    {
      id: 'reflexivity-effect',
      prompt: 'Dois triângulos compartilham o segmento AD. Qual relação pode entrar diretamente na prova?',
      options: [
        { id: 'correct', label: 'AD≅AD por reflexividade', feedback: 'Correto: é o mesmo segmento nos dois triângulos.' },
        { id: 'double', label: 'AD=2AD', feedback: 'Compartilhar um segmento não duplica seu comprimento.' },
        { id: 'unknown', label: 'Nenhuma relação pode ser usada', feedback: 'A reflexividade permite usar o lado comum.' },
      ],
      correctOptionId: 'correct',
      skillIds: ['reflexivity'],
    },
    {
      id: 'isosceles-target',
      prompt: 'Em △ABC, AB≅AC. Qual é a conclusão do teorema do triângulo isósceles que a próxima prova vai reconstruir?',
      options: [
        { id: 'correct', label: '∠ABC≅∠BCA', feedback: 'Correto: os ângulos opostos aos lados congruentes são congruentes.' },
        { id: 'all', label: 'Todos os três ângulos são congruentes', feedback: 'Isso exigiria um triângulo equilátero, não apenas isósceles.' },
        { id: 'perp', label: 'A base é perpendicular a AB', feedback: 'Essa perpendicularidade não segue da definição de isósceles.' },
      ],
      correctOptionId: 'correct',
      skillIds: ['isosceles-theorem'],
    },
  ],
  'ala-foundations': [
    {
      id: 'perimeter-consequence',
      prompt: 'Se △ABC≅△DEF, o que podemos afirmar sobre seus perímetros?',
      options: [
        { id: 'correct', label: 'São iguais, pois os três pares de lados correspondentes têm as mesmas medidas', feedback: 'Correto: o perímetro é a soma das medidas dos lados correspondentes.' },
        { id: 'area-only', label: 'Nada; congruência só informa os ângulos', feedback: 'Congruência preserva comprimentos e ângulos.' },
        { id: 'double', label: 'Um perímetro é o dobro do outro', feedback: 'Triângulos congruentes têm exatamente as mesmas medidas correspondentes.' },
      ],
      correctOptionId: 'correct',
      skillIds: ['triangle-perimeter'],
    },
  ],
  'cevian-foundations': [
    {
      id: 'midpoint-definition',
      prompt: 'Qual conjunto de informações é suficiente para dizer que D é ponto médio de BC?',
      options: [
        { id: 'correct', label: 'D∈BC e BD≅DC', feedback: 'Correto: incidência no segmento e divisão em duas partes congruentes.' },
        { id: 'equal-only', label: 'Apenas BD≅DC', feedback: 'Sem D pertencer a BC, a igualdade de distâncias não define ponto médio.' },
        { id: 'inside-only', label: 'Apenas D∈BC', feedback: 'Pertencer ao segmento não garante que D o divida ao meio.' },
      ],
      correctOptionId: 'correct',
      skillIds: ['midpoint'],
    },
    {
      id: 'altitude-definition',
      prompt: 'A partir de A, um segmento AD encontra a reta BC formando 90°. Como AD é classificado em △ABC?',
      options: [
        { id: 'correct', label: 'Altura relativa a BC', feedback: 'Correto: parte do vértice e é perpendicular à reta do lado oposto.' },
        { id: 'median', label: 'Mediana necessariamente', feedback: 'Ser mediana exigiria D ser ponto médio de BC.' },
        { id: 'bisector', label: 'Bissetriz necessariamente', feedback: 'Ser bissetriz exigiria dividir o ângulo A em duas partes congruentes.' },
      ],
      correctOptionId: 'correct',
      skillIds: ['altitude'],
    },
    {
      id: 'bisector-vs-cevians',
      prompt: 'Se AD apenas divide ∠BAC em dois ângulos congruentes, qual classificação está garantida?',
      options: [
        { id: 'correct', label: 'Bissetriz', feedback: 'Correto: mediana e altura exigiriam propriedades adicionais.' },
        { id: 'all', label: 'Bissetriz, mediana e altura sempre', feedback: 'A coincidência das três cevianas ocorre apenas em configurações especiais e precisa ser provada.' },
        { id: 'median', label: 'Mediana', feedback: 'Nada foi informado ainda sobre ponto médio de BC.' },
      ],
      correctOptionId: 'correct',
      skillIds: ['angle-bisector'],
    },
  ],
  'parallelism-foundations': [
    {
      id: 'parallel-family',
      prompt: 'Dois ângulos estão entre r e s e em lados opostos da transversal t. Qual família descreve essa posição?',
      options: [
        { id: 'correct', label: 'Alternos internos', feedback: 'Correto: internos e em lados opostos da transversal.' },
        { id: 'collateral', label: 'Colaterais internos', feedback: 'Colaterais internos ficam do mesmo lado da transversal.' },
        { id: 'opv', label: 'Opostos pelo vértice', feedback: 'OPV surgem no mesmo ponto de interseção, não entre duas interseções distintas.' },
      ],
      correctOptionId: 'correct',
      skillIds: ['parallel-angle-families'],
    },
    {
      id: 'parallelogram-diagonals',
      prompt: 'Em ABCD, AC e BD se cruzam em M com AM=MC e BM=MD. Qual caracterização pode ser usada?',
      options: [
        { id: 'correct', label: 'As diagonais se bissetam; isso caracteriza um paralelogramo', feedback: 'Correto: cada diagonal é dividida em duas partes iguais no ponto de interseção.' },
        { id: 'rectangle', label: 'Isso sozinho prova que ABCD é retângulo', feedback: 'Bissecção das diagonais caracteriza paralelogramo, não garante ângulos retos.' },
        { id: 'none', label: 'A informação sobre diagonais não ajuda', feedback: 'Ela fornece exatamente uma caracterização suficiente de paralelogramo.' },
      ],
      correctOptionId: 'correct',
      skillIds: ['parallelogram-characterization'],
    },
  ],
  'cartesian-foundations': [
    {
      id: 'ordered-pair',
      prompt: 'No ponto P=(2,−3), o que significam as coordenadas?',
      options: [
        { id: 'correct', label: 'x=2 é horizontal e y=−3 é vertical', feedback: 'Correto: a ordem do par é (x,y).' },
        { id: 'swapped', label: 'x=−3 e y=2', feedback: 'Isso troca a ordem das coordenadas e produz outro ponto.' },
        { id: 'distance', label: '2 e −3 são comprimentos sem direção', feedback: 'Coordenadas registram posição orientada nos eixos.' },
      ],
      correctOptionId: 'correct',
      skillIds: ['cartesian-coordinates'],
    },
  ],
  'coordinate-bridge': [
    {
      id: 'collinearity-meaning',
      prompt: 'O determinante construído com três pontos vale zero. O que esse zero está testando geometricamente?',
      options: [
        { id: 'correct', label: 'Os três pontos são colineares', feedback: 'Correto: o determinante nulo é uma forma algébrica de testar pertencimento à mesma reta.' },
        { id: 'midpoint', label: 'O segundo ponto é automaticamente ponto médio', feedback: 'Colinearidade não determina as distâncias entre os pontos.' },
        { id: 'perp', label: 'As retas envolvidas são perpendiculares', feedback: 'O teste de colinearidade não é um teste de perpendicularidade.' },
      ],
      correctOptionId: 'correct',
      skillIds: ['coordinate-collinearity'],
    },
  ],
  'line-system-foundations': [
    {
      id: 'line-equation-solution-set',
      prompt: 'Qual leitura conecta corretamente x+y+1=0 à geometria?',
      options: [
        { id: 'correct', label: 'É uma reta formada por todos os pares (x,y) que satisfazem a equação', feedback: 'Correto: a equação define o conjunto solução que é a reta.' },
        { id: 'single', label: 'É apenas um ponto porque existe um sinal de igual', feedback: 'Há infinitos pares que podem satisfazer uma equação linear de duas variáveis.' },
        { id: 'numbers', label: 'A reta é o conjunto {1,1,1}', feedback: 'Os coeficientes não são os pontos da reta.' },
      ],
      correctOptionId: 'correct',
      skillIds: ['general-line-equation', 'line-solution-set'],
    },
    {
      id: 'special-lines',
      prompt: 'Como interpretar x=3 e y=1?',
      options: [
        { id: 'correct', label: 'x=3 é vertical e y=1 é horizontal', feedback: 'Correto: uma coordenada fica constante enquanto a outra é livre.' },
        { id: 'swapped', label: 'x=3 é horizontal e y=1 é vertical', feedback: 'As orientações foram trocadas.' },
        { id: 'points', label: 'Cada uma representa um único ponto', feedback: 'A coordenada não fixada pode variar livremente.' },
      ],
      correctOptionId: 'correct',
      skillIds: ['vertical-horizontal-lines'],
    },
    {
      id: 'supporting-line',
      prompt: 'A=(0,0) e B=(4,0). Qual é uma reta suporte de AB?',
      options: [
        { id: 'correct', label: 'y=0', feedback: 'Correto: contém A e B e continua indefinidamente além do segmento.' },
        { id: 'vertical', label: 'x=0', feedback: 'Essa reta contém A, mas não B.' },
        { id: 'none', label: 'Segmentos não possuem reta suporte', feedback: 'Todo segmento está contido em uma única reta suporte.' },
      ],
      correctOptionId: 'correct',
      skillIds: ['supporting-line'],
    },
    {
      id: 'coordinate-median',
      prompt: 'Como construir analiticamente a mediana que parte de A em △ABC?',
      options: [
        { id: 'correct', label: 'Calcular o ponto médio M de BC e construir a reta AM', feedback: 'Correto: é a tradução coordenada da definição de mediana.' },
        { id: 'perp', label: 'Construir qualquer reta perpendicular a BC', feedback: 'Isso descreve uma condição de altura, não de mediana.' },
        { id: 'bisect', label: 'Dividir apenas o ângulo A ao meio', feedback: 'Isso constrói uma bissetriz, não necessariamente uma mediana.' },
      ],
      correctOptionId: 'correct',
      skillIds: ['coordinate-median'],
    },
  ],
  'distance-modeling-foundations': [
    {
      id: 'modeling-order',
      prompt: 'Qual ordem evita escrever equações sem saber o que elas representam?',
      options: [
        { id: 'correct', label: 'dados → pontos auxiliares → retas/sistemas → grandeza da tese', feedback: 'Correto: a álgebra nasce das relações geométricas identificadas.' },
        { id: 'formula-first', label: 'escolher uma fórmula qualquer → ajustar o desenho depois', feedback: 'Isso inverte a modelagem e pode produzir relações sem justificativa geométrica.' },
        { id: 'decimal-first', label: 'aproximar tudo primeiro → procurar uma relação visual', feedback: 'Aproximações precoces podem esconder a estrutura exata que precisa ser provada.' },
      ],
      correctOptionId: 'correct',
      skillIds: ['figure-to-equation'],
    },
    {
      id: 'exactness',
      prompt: 'Você encontrou PB=2√5/3 e PN=√5/3. Qual forma fecha uma prova exata de PB=2PN?',
      options: [
        { id: 'correct', label: '2√5/3 = 2·(√5/3), portanto PB=2PN', feedback: 'Correto: a igualdade é preservada sem arredondamento.' },
        { id: 'decimal', label: '1,49 é mais ou menos o dobro de 0,75', feedback: 'Isso apenas aproxima; não prova uma igualdade exata.' },
        { id: 'picture', label: 'No desenho PB parece maior', feedback: 'A aparência não estabelece a razão métrica pedida.' },
      ],
      correctOptionId: 'correct',
      skillIds: ['exact-distance-proof'],
    },
  ],
};

export function checksForDidacticLesson(lesson: DidacticLesson): TaggedDidacticCheck[] {
  const tags = baseCheckSkills[lesson.id] ?? {};
  const base = lesson.checks.map((check) => ({
    ...check,
    skillIds: tags[check.id] ?? [],
  }));
  return [...base, ...(supplementalChecks[lesson.id] ?? [])];
}
