import type { Exercise, Question } from "../types/geometry";

const f = String.raw;

export const questions: Question[] = [
  { id: "q-median", skillId: "median-bisector-altitude", kind: "hypothesis", prompt: "Qual hipótese caracteriza AD como mediana relativa a A?", options: ["AD ⟂ BC", "BD ≅ DC", "∠BAD ≅ ∠DAC"], correctIndex: 1, explanation: "Mediana liga um vértice ao ponto médio do lado oposto; portanto D deve dividir BC em segmentos congruentes." },
  { id: "q-lal", skillId: "lal", kind: "criterion", prompt: "Você conhece dois lados e o ângulo ENTRE eles. Qual critério pode usar?", options: ["ALA", "LAL", "LLL"], correctIndex: 1, explanation: "O ângulo compreendido entre os dois lados é exatamente a configuração LAL." },
  { id: "q-correspondence", skillId: "congruence", kind: "correspondence", prompt: "Se △ABC ≅ △DEF, qual lado corresponde a AC?", options: ["DE", "EF", "DF"], correctIndex: 2, explanation: "A ↔ D e C ↔ F; logo AC ↔ DF." },
  { id: "q-isosceles", skillId: "isosceles", kind: "conclusion", prompt: "Em △ABC, AB ≅ AC. Qual resultado já pode ser usado?", options: ["∠A ≅ ∠B", "∠B ≅ ∠C", "BC ≅ AC"], correctIndex: 1, explanation: "Os ângulos opostos aos lados AB e AC são, respectivamente, ∠C e ∠B." },
  { id: "q-segment", skillId: "fundamentals", kind: "logical-error", prompt: "Qual escrita distingue corretamente objeto geométrico e medida?", options: ["‾AB = 2 cm", "AB = 2 cm", "A = B = 2 cm"], correctIndex: 1, explanation: "Neste curso, AB denota a medida; ‾AB denota o segmento como objeto." },
  { id: "q-bisector", skillId: "median-bisector-altitude", kind: "true-false", prompt: "AD é bissetriz. Então BD ≅ DC, em qualquer triângulo.", options: ["Verdadeiro", "Falso"], correctIndex: 1, explanation: "Bissetriz divide o ângulo. Ela só coincide com a mediana em configurações especiais, como a ceviana principal do isósceles." },
  { id: "q-altitude", skillId: "median-bisector-altitude", kind: "true-false", prompt: "Uma altura pode ficar fora do triângulo.", options: ["Verdadeiro", "Falso"], correctIndex: 0, explanation: "Em triângulos obtusângulos, as alturas relativas a vértices agudos encontram a reta suporte fora do lado." },
  { id: "q-opv", skillId: "segments-angles", kind: "calculation", prompt: "Dois ângulos opostos pelo vértice medem (3x + 5)° e 80°. Quanto vale x?", options: ["15", "20", "25"], correctIndex: 2, explanation: "OPV são congruentes: 3x + 5 = 80, então 3x = 75 e x = 25." },
  { id: "q-congruence-similarity", skillId: "congruence", kind: "comparison", prompt: "Qual afirmação distingue congruência de semelhança?", options: ["Congruência preserva tamanho; semelhança pode mudar a escala.", "Semelhança preserva tamanho; congruência não.", "São sinônimos."], correctIndex: 0, explanation: "Triângulos congruentes têm lados correspondentes com a mesma medida; semelhantes podem ter fator de escala diferente de 1." },
  { id: "q-drawing", skillId: "fundamentals", kind: "logical-error", prompt: "Um lado parece maior no desenho. Isso basta para concluir que sua medida é maior?", options: ["Sim, se a figura estiver colorida.", "Sim, sempre.", "Não; marcas e hipóteses justificam."], correctIndex: 2, explanation: "O desenho auxilia; as marcas e hipóteses justificam." },
];

export const exercises: Exercise[] = [
  {
    id: "board-ala",
    title: "O encontro das duas lâminas",
    subtitle: "Exercício da lousa · ALA",
    skillId: "ala",
    difficulty: "Quest",
    introduction: "Nos triângulos CBA e CDE, as retas se cruzam em C. Avance identificando cada justificativa antes de calcular x e y.",
    steps: [
      { id: "ala-ex-1", prompt: "Que relação existe entre ∠BCA e ∠DCE?", options: ["São complementares", "São opostos pelo vértice e congruentes", "São ângulos da base"], correctIndex: 1, explanation: "As duas retas se cruzam em C; os ângulos estão em regiões opostas pelo vértice." },
      { id: "ala-ex-2", prompt: "Com ∠CBA ≅ ∠CDE, ∠BCA ≅ ∠DCE e BC ≅ CD, qual critério se aplica?", options: ["LAL", "LLL", "ALA"], correctIndex: 2, explanation: "O lado BC/CD está entre os dois ângulos conhecidos." },
      { id: "ala-ex-3", prompt: "Na congruência △CBA ≅ △CDE, qual correspondência está correta?", options: ["C ↔ C, B ↔ D, A ↔ E", "C ↔ D, B ↔ C, A ↔ E", "C ↔ E, B ↔ D, A ↔ C"], correctIndex: 0, explanation: "A ordem dos nomes registra C ↔ C, B ↔ D e A ↔ E." },
      { id: "ala-ex-4", prompt: "CA ↔ CE. Se CA = 2x − 6 e CE = 22, quanto vale x?", formula: f`2x-6=22`, options: ["8", "14", "16"], correctIndex: 1, explanation: "2x = 28, portanto x = 14." },
      { id: "ala-ex-5", prompt: "BA ↔ DE. Se BA = 35 e DE = 3y + 5, quanto vale y?", formula: f`3y+5=35`, options: ["10", "12", "15"], correctIndex: 0, explanation: "3y = 30, portanto y = 10." },
      { id: "ala-ex-6", prompt: "Qual é a razão P₁/P₂ entre os perímetros dos triângulos congruentes?", options: ["1/2", "1", "2"], correctIndex: 1, explanation: "Triângulos congruentes têm todos os lados correspondentes com a mesma medida; seus perímetros são iguais." },
    ],
    finalAnswer: "x = 14, y = 10 e P₁/P₂ = 1.",
  },
  {
    id: "board-lal",
    title: "O selo do vértice F",
    subtitle: "Exercício da lousa · LAL",
    skillId: "lal",
    difficulty: "Boss Proof",
    introduction: "Compare △AFB e △HFR. As retas se cruzam em F e dois pares de lados já estão marcados.",
    steps: [
      { id: "lal-ex-1", prompt: "Qual par de ângulos pode ser justificado sem medir?", options: ["∠FAB ≅ ∠FHR", "∠AFB ≅ ∠HFR", "∠ABF ≅ ∠HRF"], correctIndex: 1, explanation: "∠AFB e ∠HFR são opostos pelo vértice." },
      { id: "lal-ex-2", prompt: "AF ≅ FH, BF ≅ FR e ∠AFB ≅ ∠HFR. Qual critério conclui a congruência?", options: ["ALA", "LAL", "LLL"], correctIndex: 1, explanation: "O ângulo em F está entre os dois lados conhecidos de cada triângulo." },
      { id: "lal-ex-3", prompt: "Qual ordem registra corretamente a congruência?", options: ["△AFB ≅ △HFR", "△ABF ≅ △HFR", "△FAB ≅ △HFR"], correctIndex: 0, explanation: "A ↔ H, F ↔ F e B ↔ R." },
      { id: "lal-ex-4", prompt: "Qual consequência segue da correspondência?", options: ["AB ≅ HR", "AB ≅ FH", "AF ≅ HR"], correctIndex: 0, explanation: "O lado entre A e B corresponde ao lado entre H e R." },
      { id: "lal-ex-5", prompt: "Que par de ângulos também é correspondente?", options: ["∠FAB ≅ ∠FHR", "∠FAB ≅ ∠HRF", "∠AFB ≅ ∠HRF"], correctIndex: 0, explanation: "A ↔ H, então os ângulos nesses vértices são correspondentes." },
    ],
    finalAnswer: "△AFB ≅ △HFR por LAL; AB ≅ HR, ∠FAB ≅ ∠FHR e ∠ABF ≅ ∠HRF.",
  },
];
