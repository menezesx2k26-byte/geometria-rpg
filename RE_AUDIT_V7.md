# Re-auditoria V7

Escopo: falsos negativos residuais na aceitação semântica, regressões E2E, build, deploy e smoke test público.

Correções desta rodada:
- relação angular com prefixos como `OPV:`;
- wrappers positivos como `caso ALA`, `critério ALA`, `é mediana`;
- soluções de sistema em forma `x=...; y=...`;
- múltiplos escalares não nulos de retas escritos com parênteses, como `2(x+y+1)=0`.

A integração só deve ocorrer após lint, unitários, build, Chromium/E2E, deploy Worker e smoke test das rotas públicas passarem.
