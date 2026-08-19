export interface DidacticCheckOption {
  id: string;
  label: string;
  feedback: string;
}

export interface DidacticCheck {
  id: string;
  prompt: string;
  options: DidacticCheckOption[];
  correctOptionId: string;
}

export interface DidacticSection {
  title: string;
  body: string;
  example: string;
}

export interface DidacticLesson {
  id: string;
  completionId: string;
  title: string;
  subtitle: string;
  goal: string;
  introduces: string[];
  guidedPractice: string[];
  sections: DidacticSection[];
  checks: DidacticCheck[];
}

const option = (id: string, label: string, feedback: string): DidacticCheckOption => ({ id, label, feedback });

export const didacticLessons: DidacticLesson[] = [
  {
    id: 'congruence-foundations',
    completionId: 'lesson:congruence-foundations',
    title: 'Antes da Congruência',
    subtitle: 'Correspondência vem antes do critério',
    goal: 'Entender o que significa dois triângulos serem congruentes e como a ordem dos vértices codifica a correspondência.',
    introduces: ['triangle-congruence'],
    guidedPractice: ['triangle-congruence'],
    sections: [
      {
        title: 'Congruência não é “parecer igual”',
        body: 'Dois triângulos são congruentes quando existe uma correspondência entre seus vértices que preserva comprimentos e ângulos. O desenho pode estar girado, refletido ou em outra posição.',
        example: '△ABC ≅ △DEF significa A↔D, B↔E e C↔F.',
      },
      {
        title: 'A ordem carrega informação',
        body: 'Ao escrever uma congruência, a posição de cada letra determina quais lados e ângulos correspondem. Não se escolhe a correspondência olhando apenas para a orientação do desenho.',
        example: 'De △ABC ≅ △DEF seguem AB≅DE, BC≅EF, AC≅DF e ∠B≅∠E.',
      },
    ],
    checks: [
      {
        id: 'congruence-order',
        prompt: 'Se △ABC ≅ △DEF, qual correspondência está correta?',
        options: [
          option('correct', 'A↔D, B↔E, C↔F', 'Isso: a posição das letras determina a correspondência.'),
          option('swap', 'A↔E, B↔D, C↔F', 'Essa troca quebra a ordem escrita na congruência.'),
          option('visual', 'Depende de como os triângulos estão desenhados', 'A orientação visual não altera a correspondência registrada na notação.'),
        ],
        correctOptionId: 'correct',
      },
    ],
  },
  {
    id: 'opv-lal-foundations',
    completionId: 'lesson:opv-lal-foundations',
    title: 'OPV, LAL e Consequência',
    subtitle: 'Monte a cadeia antes do duelo',
    goal: 'Construir a sequência hipótese → OPV → LAL → partes correspondentes antes de cobrá-la em um encontro.',
    introduces: ['opv', 'sas', 'cpctc'],
    guidedPractice: ['opv', 'sas', 'cpctc'],
    sections: [
      {
        title: 'Opostos pelo vértice',
        body: 'Quando duas retas se cruzam, os ângulos que ficam frente a frente são opostos pelo vértice e são congruentes. Não basta compartilharem o mesmo vértice: precisam ser o par oposto.',
        example: 'Se duas retas se cruzam em F, um par de ângulos opostos em F tem a mesma medida.',
      },
      {
        title: 'LAL usa o ângulo compreendido',
        body: 'No caso Lado–Ângulo–Lado, o ângulo conhecido precisa estar entre os dois lados usados. Dois lados e um ângulo qualquer não bastam.',
        example: 'AB≅DE, AC≅DF e ∠BAC≅∠EDF ⇒ △ABC≅△DEF por LAL.',
      },
      {
        title: 'Depois da congruência',
        body: 'Uma vez provados congruentes os triângulos, lados e ângulos correspondentes também são congruentes. Essa consequência não substitui o critério: ela vem depois dele.',
        example: '△ABC≅△DEF ⇒ BC≅EF por partes correspondentes.',
      },
      {
        title: 'Forma de uma prova curta',
        body: 'Separe sempre o que foi dado, a relação que você deduz, o critério usado e a conclusão. Isso evita circularidade e impede usar como hipótese aquilo que ainda precisa ser provado.',
        example: 'dados de lados → OPV → LAL → congruência → consequência correspondente.',
      },
    ],
    checks: [
      {
        id: 'opv-recognition',
        prompt: 'Duas retas se cruzam em F. Qual descrição identifica OPV?',
        options: [
          option('correct', 'Dois ângulos frente a frente formados pelas mesmas duas retas', 'Correto: são os ângulos opostos pelo vértice.'),
          option('adjacent', 'Dois ângulos lado a lado que compartilham um lado', 'Esses são adjacentes, não opostos pelo vértice.'),
          option('any', 'Quaisquer dois ângulos com vértice F', 'Ter o mesmo vértice não é suficiente.'),
        ],
        correctOptionId: 'correct',
      },
      {
        id: 'sas-order',
        prompt: 'Para aplicar LAL, o ângulo conhecido deve ser…',
        options: [
          option('correct', 'o ângulo compreendido entre os dois lados usados', 'Exatamente. Essa posição é parte do critério.'),
          option('largest', 'o maior ângulo do triângulo', 'O tamanho do ângulo não é a condição do LAL.'),
          option('any', 'qualquer ângulo do triângulo', 'Dois lados mais um ângulo não compreendido podem não determinar congruência.'),
        ],
        correctOptionId: 'correct',
      },
    ],
  },
  {
    id: 'proof-tools',
    completionId: 'lesson:proof-tools',
    title: 'Ferramentas do Espelho',
    subtitle: 'Bissetriz, reflexividade e teorema-alvo',
    goal: 'Conhecer as ferramentas que aparecerão na reconstrução do teorema do triângulo isósceles antes de ser avaliado pela prova.',
    introduces: ['angle-bisector', 'reflexivity', 'isosceles-theorem'],
    guidedPractice: ['angle-bisector', 'reflexivity', 'isosceles-theorem'],
    sections: [
      {
        title: 'Bissetriz',
        body: 'A bissetriz de um ângulo é a semirreta interna que divide esse ângulo em dois ângulos congruentes. Se AD bisseta ∠BAC, então ∠BAD≅∠DAC.',
        example: 'A informação “AD é bissetriz” pode ser convertida em uma igualdade angular.',
      },
      {
        title: 'Reflexividade',
        body: 'Um segmento é congruente a si mesmo. Quando dois triângulos compartilham AD, podemos usar AD≅AD como um dos pares de lados.',
        example: 'AD aparece nos dois triângulos menores ⇒ AD≅AD.',
      },
      {
        title: 'O teorema que será reconstruído',
        body: 'Em um triângulo isósceles, os ângulos opostos aos lados congruentes são congruentes. A próxima atividade não exige decorar uma prova: ela fará você reconstruí-la com as ferramentas anteriores.',
        example: 'AB≅AC ⇒ ∠ABC≅∠BCA.',
      },
    ],
    checks: [
      {
        id: 'bisector-effect',
        prompt: 'Se AD é bissetriz de ∠BAC, o que você pode escrever imediatamente?',
        options: [
          option('correct', '∠BAD≅∠DAC', 'Correto: isso é exatamente a definição de bissetriz.'),
          option('side', 'AB≅AC', 'Isso caracterizaria um isósceles, mas não decorre da bissetriz.'),
          option('perp', 'AD⊥BC', 'Uma bissetriz não é necessariamente altura.'),
        ],
        correctOptionId: 'correct',
      },
    ],
  },
  {
    id: 'ala-foundations',
    completionId: 'lesson:ala-foundations',
    title: 'A Ponte para ALA',
    subtitle: 'Dois ângulos, o lado compreendido e consequências',
    goal: 'Apresentar ALA e a leitura de perímetros antes da aplicação oficial que combina congruência e álgebra.',
    introduces: ['asa', 'triangle-perimeter'],
    guidedPractice: ['asa', 'triangle-perimeter'],
    sections: [
      {
        title: 'Ângulo–Lado–Ângulo',
        body: 'No caso ALA, dois pares de ângulos correspondentes e o lado compreendido entre eles determinam a congruência dos triângulos.',
        example: '∠A≅∠D, AB≅DE e ∠B≅∠E ⇒ △ABC≅△DEF.',
      },
      {
        title: 'Congruência transporta medidas',
        body: 'Depois de provar congruência, você pode transportar comprimentos correspondentes e montar equações. A álgebra só entra depois de a relação geométrica estar justificada.',
        example: 'Se BC e EF correspondem e BC=2x+1, EF=11, então 2x+1=11.',
      },
      {
        title: 'Perímetro',
        body: 'O perímetro de um triângulo é a soma das medidas dos três lados. Triângulos congruentes têm perímetros iguais porque seus três lados correspondentes têm as mesmas medidas.',
        example: '△ABC≅△DEF ⇒ P(ABC)=P(DEF).',
      },
    ],
    checks: [
      {
        id: 'ala-condition',
        prompt: 'Qual conjunto de dados caracteriza diretamente ALA?',
        options: [
          option('correct', 'dois ângulos correspondentes e o lado compreendido', 'Correto: essa é a estrutura do ALA.'),
          option('sas', 'dois lados e o ângulo compreendido', 'Esse é o LAL.'),
          option('sss', 'três lados correspondentes', 'Esse é o LLL.'),
        ],
        correctOptionId: 'correct',
      },
    ],
  },
  {
    id: 'cevian-foundations',
    completionId: 'lesson:cevian-foundations',
    title: 'Cevianas sem Mistério',
    subtitle: 'Ponto médio, mediana e altura antes do chefe',
    goal: 'Distinguir as definições que o chefe das cevianas combina, para que o desafio avalie integração e não vocabulário inédito.',
    introduces: ['midpoint', 'median', 'altitude'],
    guidedPractice: ['midpoint', 'median', 'altitude', 'angle-bisector'],
    sections: [
      {
        title: 'Ponto médio',
        body: 'M é ponto médio de AB somente quando M pertence a AB e AM≅MB. Igualdade de comprimentos sozinha, sem incidência no segmento, não basta.',
        example: 'M∈AB e AM≅MB ⇒ M é ponto médio de AB.',
      },
      {
        title: 'Mediana',
        body: 'A mediana de um triângulo liga um vértice ao ponto médio do lado oposto. A propriedade definidora é chegar ao ponto médio.',
        example: 'Se D é ponto médio de BC, então AD é mediana de △ABC.',
      },
      {
        title: 'Altura',
        body: 'A altura parte de um vértice e é perpendicular à reta que contém o lado oposto. Ela não precisa coincidir com mediana ou bissetriz em um triângulo qualquer.',
        example: 'AD⊥BC ⇒ AD é uma altura relativa a BC, se A é o vértice oposto.',
      },
      {
        title: 'Quando elas coincidem',
        body: 'Em configurações especiais, uma mesma ceviana pode ser bissetriz, mediana e altura. Isso precisa ser provado a partir das hipóteses; nunca deve ser assumido pela aparência do desenho.',
        example: 'No isósceles adequado, a bissetriz do vértice pode ser provada também mediana e altura.',
      },
    ],
    checks: [
      {
        id: 'median-definition',
        prompt: 'AD liga A ao ponto médio D de BC. Como AD é classificado?',
        options: [
          option('correct', 'Mediana', 'Correto: vértice ligado ao ponto médio do lado oposto.'),
          option('altitude', 'Altura', 'Ser altura exigiria perpendicularidade a BC.'),
          option('bisector', 'Bissetriz', 'Ser bissetriz exigiria dividir o ângulo em duas partes congruentes.'),
        ],
        correctOptionId: 'correct',
      },
    ],
  },
  {
    id: 'parallelism-foundations',
    completionId: 'lesson:parallelism-foundations',
    title: 'Gramática das Paralelas',
    subtitle: 'Famílias angulares, teorema e conversa',
    goal: 'Construir as relações de uma transversal antes de pedir que o aluno prove paralelismo e caracterize um paralelogramo.',
    introduces: ['parallel-angle-families', 'parallel-converse-skill', 'parallelogram-characterization'],
    guidedPractice: ['parallel-angle-families', 'parallel-converse-skill', 'parallelogram-characterization'],
    sections: [
      {
        title: 'Primeiro: posição',
        body: 'Com duas retas cortadas por uma transversal, classifique os ângulos pela posição antes de usar qualquer igualdade: correspondentes, alternos ou colaterais; internos ou externos.',
        example: 'Alternos internos ficam entre as duas retas e em lados opostos da transversal.',
      },
      {
        title: 'Teorema direto',
        body: 'Se as retas são paralelas, pares correspondentes e alternos adequados são congruentes, enquanto pares colaterais internos são suplementares.',
        example: 'r∥s ⇒ alternos internos congruentes.',
      },
      {
        title: 'Conversa',
        body: 'A conversa inverte o papel lógico: se um par angular adequado satisfaz a relação característica, então podemos concluir que as retas são paralelas. Não se pode assumir o paralelismo para prová-lo.',
        example: 'alternos internos congruentes ⇒ r∥s.',
      },
      {
        title: 'Diagonais de um paralelogramo',
        body: 'Um quadrilátero é paralelogramo se suas diagonais se cortam nos respectivos pontos médios. Em prova, os pontos médios geram pares de lados em triângulos opostos, e OPV fornece ângulos compreendidos.',
        example: 'AM=MC e BM=MD, com diagonais cruzando em M, permitem construir pares LAL.',
      },
    ],
    checks: [
      {
        id: 'parallel-converse',
        prompt: 'Sem assumir r∥s, você sabe que um par de alternos internos é congruente. Qual conclusão é legítima?',
        options: [
          option('correct', 'Pela conversa, r∥s', 'Correto: agora a igualdade angular é hipótese e o paralelismo é conclusão.'),
          option('circle', 'Como r∥s, os ângulos são congruentes', 'Isso seria circular: você usaria como hipótese o que quer provar.'),
          option('perp', 'r⊥s', 'Essa relação angular caracteriza paralelismo, não perpendicularidade.'),
        ],
        correctOptionId: 'correct',
      },
    ],
  },
  {
    id: 'cartesian-foundations',
    completionId: 'lesson:cartesian-foundations',
    title: 'Antes do Plano',
    subtitle: 'Coordenadas, eixos e sinais sem adivinhação',
    goal: 'Apresentar a leitura de pares ordenados e sinais antes de transformar o laboratório cartesiano em avaliação.',
    introduces: ['cartesian-coordinates', 'quadrants-signs'],
    guidedPractice: ['cartesian-coordinates', 'quadrants-signs'],
    sections: [
      {
        title: 'Par ordenado',
        body: 'Em P=(x,y), a primeira coordenada mede deslocamento horizontal e a segunda, vertical. Trocar a ordem geralmente produz outro ponto.',
        example: '(2,−3) e (−3,2) são pontos diferentes.',
      },
      {
        title: 'Sinais e quadrantes',
        body: 'Os sinais de x e y localizam o quadrante: (+,+), (−,+), (−,−), (+,−). Pontos com x=0 ou y=0 ficam sobre os eixos e não pertencem a nenhum quadrante.',
        example: 'x<0 e y>0 ⇒ segundo quadrante.',
      },
      {
        title: 'Diagonais simples',
        body: 'Na reta y=x, as coordenadas são iguais. Na reta y=−x, são opostas. Essas são relações algébricas, não apenas linhas desenhadas em diagonal.',
        example: '(3,3) satisfaz y=x; (3,−3) satisfaz y=−x.',
      },
    ],
    checks: [
      {
        id: 'quadrant',
        prompt: 'Um ponto com x<0 e y>0 está onde?',
        options: [
          option('correct', 'No segundo quadrante', 'Correto: horizontal negativo, vertical positivo.'),
          option('first', 'No primeiro quadrante', 'No primeiro quadrante as duas coordenadas são positivas.'),
          option('axis', 'Sobre um eixo', 'Estaria no eixo apenas se uma coordenada fosse zero.'),
        ],
        correctOptionId: 'correct',
      },
    ],
  },
  {
    id: 'coordinate-bridge',
    completionId: 'lesson:coordinate-bridge',
    title: 'Pontos que Viram Relações',
    subtitle: 'Ponto médio e colinearidade antes da reta',
    goal: 'Construir ponto médio e colinearidade por coordenadas antes de a Forja das Retas cobrar essas ferramentas.',
    introduces: ['coordinate-midpoint', 'coordinate-collinearity'],
    guidedPractice: ['coordinate-midpoint', 'coordinate-collinearity'],
    sections: [
      {
        title: 'Ponto médio por coordenadas',
        body: 'O ponto médio recebe a média das coordenadas correspondentes dos extremos. A fórmula é apenas a tradução analítica de dividir o segmento em duas partes iguais.',
        example: 'A=(0,0), B=(4,2) ⇒ M=((0+4)/2,(0+2)/2)=(2,1).',
      },
      {
        title: 'Colinearidade',
        body: 'Três pontos são colineares quando pertencem à mesma reta. Em coordenadas, isso pode ser verificado por uma mesma relação linear; determinante nulo é uma forma equivalente de testar essa condição.',
        example: '(0,0), (1,3), (2,6) satisfazem y=3x, portanto são colineares.',
      },
      {
        title: 'Determinante como teste, não magia',
        body: 'O determinante 3×3 com linhas (x,y,1) vale zero exatamente quando os três pontos são colineares. Antes de calcular, saiba qual propriedade o resultado zero representa.',
        example: 'det[[x₁,y₁,1],[x₂,y₂,1],[x₃,y₃,1]]=0 ⇔ colinearidade.',
      },
    ],
    checks: [
      {
        id: 'midpoint',
        prompt: 'A=(0,0) e B=(4,2). Qual é o ponto médio?',
        options: [
          option('correct', '(2,1)', 'Correto: média coordenada a coordenada.'),
          option('sum', '(4,2)', 'Isso repete B; faltou dividir as somas por 2.'),
          option('swap', '(1,2)', 'As coordenadas não devem ser trocadas.'),
        ],
        correctOptionId: 'correct',
      },
    ],
  },
  {
    id: 'line-system-foundations',
    completionId: 'lesson:line-system-foundations',
    title: 'Reta e Sistema em Duas Línguas',
    subtitle: 'Equação, conjunto solução e interseção',
    goal: 'Apresentar a linguagem que a Forja usa para que a oficina possa cobrar modelagem, e não vocabulário novo.',
    introduces: ['general-line-equation', 'line-solution-set', 'vertical-horizontal-lines', 'supporting-line', 'linear-system-classification', 'system-intersection-interpretation', 'coordinate-median'],
    guidedPractice: ['general-line-equation', 'line-solution-set', 'vertical-horizontal-lines', 'supporting-line', 'linear-system-classification', 'system-intersection-interpretation', 'coordinate-median'],
    sections: [
      {
        title: 'Equação de uma reta',
        body: 'Uma reta pode ser escrita como ax+by+c=0, com a e b não simultaneamente nulos. Multiplicar toda a equação por uma constante não nula não muda a reta.',
        example: 'x+y+1=0 e 2x+2y+2=0 representam a mesma reta.',
      },
      {
        title: 'Reta como conjunto solução',
        body: 'A equação não representa um único resultado: representa todos os pares (x,y) que a satisfazem. Dois pontos distintos desse conjunto determinam o esboço da reta.',
        example: 'Em x+y+1=0, (−1,0) e (0,−1) pertencem à reta.',
      },
      {
        title: 'Verticais, horizontais e reta suporte',
        body: 'x=k é vertical e y=k é horizontal. Um segmento é limitado, mas sua reta suporte continua indefinidamente e pode ser descrita por uma equação.',
        example: 'O segmento entre (0,0) e (4,0) está contido na reta suporte y=0.',
      },
      {
        title: 'Sistemas são interseções',
        body: 'Resolver duas equações simultaneamente é procurar pontos comuns às duas retas. Uma solução significa retas concorrentes; nenhuma, paralelas distintas; infinitas, retas coincidentes.',
        example: 'SPD ↔ um ponto comum; SI ↔ nenhum; SPI ↔ infinitos.',
      },
      {
        title: 'Mediana analítica',
        body: 'A definição euclidiana não muda: a mediana liga vértice e ponto médio. No plano cartesiano, depois de calcular o ponto médio, basta construir a reta que passa por ele e pelo vértice.',
        example: 'vértice A + ponto médio M de BC ⇒ reta AM é a mediana.',
      },
    ],
    checks: [
      {
        id: 'system-meaning',
        prompt: 'Duas retas têm exatamente um ponto em comum. O sistema formado por suas equações é…',
        options: [
          option('correct', 'SPD: uma solução', 'Correto: a solução comum é o ponto de interseção.'),
          option('si', 'SI: nenhuma solução', 'SI representa retas sem ponto comum.'),
          option('spi', 'SPI: infinitas soluções', 'SPI representa a mesma reta escrita de formas equivalentes.'),
        ],
        correctOptionId: 'correct',
      },
    ],
  },
  {
    id: 'distance-modeling-foundations',
    completionId: 'lesson:distance-modeling-foundations',
    title: 'Distância antes da Prova Métrica',
    subtitle: 'Pitágoras, exatidão e figura → equação',
    goal: 'Apresentar fórmula da distância e modelagem métrica antes do chefe analítico.',
    introduces: ['distance-formula-skill', 'figure-to-equation', 'exact-distance-proof'],
    guidedPractice: ['distance-formula-skill', 'figure-to-equation', 'exact-distance-proof'],
    sections: [
      {
        title: 'Distância é Pitágoras no plano',
        body: 'A distância entre A=(x₁,y₁) e B=(x₂,y₂) vem dos catetos |x₂−x₁| e |y₂−y₁|. Por isso d(A,B)=√((x₂−x₁)²+(y₂−y₁)²).',
        example: 'A=(0,0), B=(3,4) ⇒ d(A,B)=5.',
      },
      {
        title: 'Mantenha exato quando a tese é exata',
        body: 'Se o objetivo é provar uma igualdade, arredondar cedo pode destruir a justificativa. Radicais e frações devem ser preservados até a conclusão.',
        example: '2√5/3 é exatamente o dobro de √5/3; 1,49 e 0,75 apenas aproximam essa relação.',
      },
      {
        title: 'Figura → dados → pontos auxiliares → equações',
        body: 'Modelar não é escrever fórmulas aleatórias. Primeiro separe dados, depois construa pontos definidos geometricamente, então escolha as retas e sistemas necessários e só depois calcule a grandeza da tese.',
        example: 'dados → pontos médios → retas → interseção → distâncias → igualdade final.',
      },
    ],
    checks: [
      {
        id: 'distance',
        prompt: 'Qual é a distância entre (0,0) e (3,4)?',
        options: [
          option('correct', '5', 'Correto: √(3²+4²)=5.'),
          option('seven', '7', 'Somar os deslocamentos não fornece a distância euclidiana.'),
          option('root7', '√7', 'Os deslocamentos precisam ser elevados ao quadrado antes da soma.'),
        ],
        correctOptionId: 'correct',
      },
    ],
  },
];

export function findDidacticLesson(id: string) {
  return didacticLessons.find((lesson) => lesson.id === id);
}
