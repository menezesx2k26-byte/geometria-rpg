import type {
  CompetencyDefinition,
  ConfidenceLabel,
  HardCompetencyId,
  MasteryBand,
  PrerequisiteId,
  SoftCompetencyId,
} from '../types/competency';

const source = { document: 'Competências e motor adaptativo para o RPG do Codex', section: 'Taxonomia canônica' };

export const hardCompetencies: CompetencyDefinition[] = [
  { id: 'H1', kind: 'hard', name: 'Leitura e visualização geométrica', rpgName: 'Percepção Geométrica', description: 'Ler objetos, marcas, incidências e orientação sem pressupor relações pelo desenho.', observableEvidence: ['identifica vértices e incidências', 'lê marcas e orientação'], source },
  { id: 'H2', kind: 'hard', name: 'Álgebra elementar aplicada', rpgName: 'Álgebra Rúnica', description: 'Traduzir relações geométricas em equações e operar com incógnitas.', observableEvidence: ['constrói equações', 'isola incógnitas preservando equivalência'], source },
  { id: 'H3', kind: 'hard', name: 'Relações angulares', rpgName: 'Mestre dos Ângulos', description: 'Usar OPV, adjacência, complemento, suplemento, bissetriz e somas.', observableEvidence: ['classifica famílias angulares', 'justifica igualdades e somas'], source },
  { id: 'H4', kind: 'hard', name: 'Teoria elementar de triângulos', rpgName: 'Guardião dos Triângulos', description: 'Usar soma interna, ângulo externo, classes, perímetro e propriedades.', observableEvidence: ['reconhece classes de triângulo', 'aplica propriedades triangulares'], source },
  { id: 'H5', kind: 'hard', name: 'Congruência de triângulos', rpgName: 'Escudo da Congruência', description: 'Escolher critérios de congruência e transportar propriedades correspondentes.', observableEvidence: ['escolhe critério válido', 'preserva a ordem de correspondência'], source },
  { id: 'H6', kind: 'hard', name: 'Demonstração euclidiana', rpgName: 'Lógica Probatória', description: 'Organizar hipóteses, tese, definições, teoremas e inferências válidas.', observableEvidence: ['constrói cadeia sem circularidade', 'identifica o primeiro salto lógico'], source },
  { id: 'H7', kind: 'hard', name: 'Desigualdades e raciocínio métrico', rpgName: 'Balança das Desigualdades', description: 'Comparar medidas e usar desigualdade triangular e relações métricas.', observableEvidence: ['seleciona grandezas relevantes', 'sustenta comparação exata'], source },
  { id: 'H8', kind: 'hard', name: 'Elementos notáveis', rpgName: 'Cartógrafo dos Pontos Notáveis', description: 'Usar ponto médio, mediana, altura, bissetriz e mediatriz.', observableEvidence: ['distingue elementos notáveis', 'constrói o objeto pela definição'], source },
  { id: 'H9', kind: 'hard', name: 'Otimização geométrica', rpgName: 'Passo do Espelho', description: 'Transformar problemas de caminho por reflexão ou translação.', observableEvidence: ['propõe transformação útil', 'justifica minimalidade'], source },
  { id: 'H10', kind: 'hard', name: 'Paralelismo e perpendicularismo', rpgName: 'Cartógrafo dos Paralelos', description: 'Usar transversais, famílias angulares e critérios de paralelismo.', observableEvidence: ['aplica teorema e conversa na direção correta', 'estabelece paralelismo ou perpendicularidade'], source },
  { id: 'H11', kind: 'hard', name: 'Quadriláteros notáveis', rpgName: 'Arquiteto de Quadriláteros', description: 'Reconhecer e usar propriedades e caracterizações de quadriláteros.', observableEvidence: ['seleciona caracterização suficiente', 'deduz propriedades do quadrilátero'], source },
  { id: 'H12', kind: 'hard', name: 'Polígonos e contagem geométrica', rpgName: 'Forjador de Polígonos', description: 'Triangular, somar ângulos e contar diagonais.', observableEvidence: ['decompõe polígonos', 'generaliza contagens'], source },
  { id: 'H13', kind: 'hard', name: 'Construções auxiliares', rpgName: 'Linha Auxiliar', description: 'Introduzir diagonal, prolongamento, paralela, reflexão ou segmento útil.', observableEvidence: ['propõe construção pertinente', 'explica como a construção conecta hipótese e tese'], source },
  { id: 'H14', kind: 'hard', name: 'Generalização simbólica', rpgName: 'Generalizador', description: 'Passar de casos particulares a relações paramétricas ou em n.', observableEvidence: ['representa conjuntos e parâmetros', 'preserva a estrutura ao simbolizar'], source },
  { id: 'H15', kind: 'hard', name: 'Comunicação matemática formal', rpgName: 'Orador Euclidiano', description: 'Registrar notação, correspondências e justificativas sem ambiguidade.', observableEvidence: ['nomeia objetos de modo consistente', 'explicita a razão de cada passagem'], source },
];

const softDefinitions: readonly [SoftCompetencyId, string, string, string][] = [
  ['S1', 'Precisão e atenção', 'Olho de Águia', 'Lê corretamente marcas, sinais, unidades e correspondências.'],
  ['S2', 'Persistência produtiva', 'Fôlego de Prova', 'Tenta novamente ou muda a estratégia após um impasse.'],
  ['S3', 'Metacognição e verificação', 'Olho Crítico', 'Revê a resposta, detecta inconsistência ou explica um erro.'],
  ['S4', 'Flexibilidade estratégica', 'Mudança de Postura', 'Abandona de forma documentada uma abordagem improdutiva.'],
  ['S5', 'Argumentação e clareza', 'Voz do Geômetra', 'Explica por que cada passo é válido.'],
  ['S6', 'Criatividade e conjectura', 'Faísca de Conjectura', 'Propõe uma construção ou transformação relevante.'],
  ['S7', 'Autonomia', 'Autonomia do Explorador', 'Resolve com uso proporcional de ferramentas e ajuda.'],
];

export const softCompetencies: CompetencyDefinition[] = softDefinitions.map(([id, name, rpgName, description]) => ({
  id,
  kind: 'soft' as const,
  name,
  rpgName,
  description,
  observableEvidence: [description],
  source,
}));

const prerequisiteDefinitions: readonly [PrerequisiteId, string][] = [
  ['P1', 'Aritmética, frações simples e equações lineares'],
  ['P2', 'Ponto, reta, semirreta, segmento, ângulo e notação geométrica'],
  ['P3', 'Definições básicas de triângulos e soma angular'],
  ['P4', 'Critérios básicos de congruência'],
  ['P5', 'Hipótese, tese, definição, teorema e demonstração'],
  ['P6', 'Relações angulares em paralelas e transversal'],
  ['P7', 'Definições e propriedades básicas de quadriláteros'],
  ['P8', 'Desigualdade triangular'],
  ['P9', 'Ponto médio, mediana, altura, bissetriz e mediatriz'],
  ['P10', 'Contagem elementar, padrões e raciocínio com n'],
];

export const prerequisites: CompetencyDefinition[] = prerequisiteDefinitions.map(([id, description]) => ({
  id,
  kind: 'prerequisite' as const,
  name: description,
  description,
  observableEvidence: [],
  source,
}));

export const competencyCatalog = [...hardCompetencies, ...softCompetencies, ...prerequisites];

export const hardCompetencyIds = hardCompetencies.map((item) => item.id as HardCompetencyId);

export function findHardCompetency(id: HardCompetencyId) {
  return hardCompetencies.find((item) => item.id === id);
}

export function masteryBand(mastery: number): MasteryBand {
  if (mastery < 0.45) return 'remediation';
  if (mastery < 0.70) return 'practice';
  if (mastery < 0.85) return 'transfer';
  return 'proof';
}

export function confidenceLabel(evidenceCount: number, confidence: number): ConfidenceLabel {
  if (evidenceCount === 0) return 'insuficiente';
  if (confidence < 0.35) return 'baixa';
  if (confidence < 0.70) return 'moderada';
  return 'alta';
}
