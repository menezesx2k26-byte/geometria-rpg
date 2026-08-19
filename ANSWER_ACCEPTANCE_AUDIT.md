# Auditoria de aceitação de respostas matematicamente equivalentes

## Diagnóstico
O aplicativo misturava validação semântica e validação por forma canônica. O laboratório cartesiano já aceitava qualquer ponto que satisfizesse a propriedade pedida, mas outros fluxos comparavam IDs ou sequências exatas.

## Falsos negativos encontrados
- correspondência ordenada exigia uma sequência exata de cliques, mesmo quando os pares corretos eram registrados em outra ordem ou orientação;
- uma opção do Exercício 48 era descrita pelo próprio feedback como matematicamente válida, porém era registrada como erro por não ser a estratégia canônica;
- DF/FD e DE/ED podiam ser tratados como respostas diferentes apesar de nomearem o mesmo segmento;
- a Questão 15 mostrava apenas uma notação de congruência embora permutações sincronizadas preservem a mesma correspondência;
- em prova guiada, a justificativa genérica “Definição” podia ser recusada mesmo quando era a mesma definição específica disponível no passo.

## Política aplicada
Uma forma canônica pode continuar sendo preferida e explicada, mas uma resposta é reprovada apenas quando a relação matemática está errada. Estratégias válidas porém menos eficientes são aceitas com feedback pedagógico, sem gerar diagnóstico de erro.

## Limite atual
O produto ainda é majoritariamente de alternativas clicáveis. Não existe um parser geral de entrada algébrica livre. Quando entrada textual for adicionada, equações, frações, radicais e provas deverão ser avaliados por equivalência semântica (por exemplo, usando `equivalentLines` para retas), nunca por comparação de strings.
