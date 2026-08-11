import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renderiza a academia de geometria com as seis áreas", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="pt-BR">/i);
  assert.match(html, /<title>Geometria RPG · Academia Euclidiana<\/title>/i);
  assert.match(html, /Construa a teoria/);
  assert.match(html, /Prove os resultados/);
  for (const label of ["Mapa", "Aula", "Treino", "Provas", "Exercícios", "Revisão"]) {
    assert.match(html, new RegExp(`>${label}<`));
  }
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("mantém conteúdo, progresso e componentes fora da página raiz", async () => {
  const [page, app, geometry, progress, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/GeometryApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/content/geometry.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/hooks/useProgress.ts", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /<GeometryApp \/>/);
  assert.doesNotMatch(page, /localStorage|skills\s*=|proofs\s*=/);
  assert.match(app, /BottomNav/);
  assert.match(geometry, /export const skills/);
  assert.match(geometry, /Postulado LAL/);
  assert.match(progress, /localStorage/);
  assert.match(packageJson, /"katex"/);
  assert.match(packageJson, /"lucide-react"/);
  await assert.rejects(access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)));
});
