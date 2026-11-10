/* Pruebas del motor de La burbuja. Corre con: node --test burbuja/pruebas/
   Simula partidas completas con alumnos de mentira y comprueba que la partida
   tenga la forma que se busca: revienta dentro de la ventana, deja atrapada a
   una parte de la sala (ni a todos ni a nadie) y nadie termina con plata negativa. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// La carpeta no tiene package.json: los .js son módulos sólo para el navegador.
// Se cargan aquí como texto, con contenido.js incrustado dentro de motor.js.
const aqui = dirname(fileURLToPath(import.meta.url));
const comoModulo = (src) => "data:text/javascript;charset=utf-8," + encodeURIComponent(src);
const contenidoSrc = readFileSync(join(aqui, "..", "contenido.js"), "utf8");
const C = await import(comoModulo(contenidoSrc));
const motorSrc = readFileSync(join(aqui, "..", "motor.js"), "utf8")
  .replace('"./contenido.js"', JSON.stringify(comoModulo(contenidoSrc)));
const M = await import(comoModulo(motorSrc));
const { P } = M;

function azar(semilla) {          // mulberry32: partidas repetibles
  let a = semilla >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function partida(semilla, n = 25) {
  const rand = azar(semilla);
  const e = M.nuevaPartida("r" + semilla);
  const bots = M.crearBots(n, rand);
  M.tick(e, bots, rand);
  e.fase = "burbuja";
  let tPop = null, ratioPop = null, guarda = 0;
  while (e.fase !== "podio" && guarda++ < 400) {
    M.moverBots(bots, e, rand);
    const antes = e.precio / e.valor;
    const ev = M.tick(e, bots, rand);
    if (ev.includes("reventon")) { tPop = e.t; ratioPop = antes; }
  }
  return { e, tPop, ratioPop, bots };
}

test("contenido: cada voz tiene dos personas distintas que existen", () => {
  assert.ok(C.VOCES.length >= 7);
  C.VOCES.forEach((v, i) => {
    assert.ok(C.PERSONAS[v.quien], `voz ${i}: quien`);
    assert.ok(C.PERSONAS[v.senuelo], `voz ${i}: senuelo`);
    assert.notEqual(v.quien, v.senuelo);
    assert.ok(v.dir === 1 || v.dir === -1);
    assert.ok(v.frase.length <= 120, `voz ${i}: demasiado larga para leerla en 7 s`);
    const o = C.opciones(i);
    assert.equal(o.length, 2);
    assert.ok(o.includes(v.quien) && o.includes(v.senuelo));
  });
});

test("contenido: la respuesta correcta no cae siempre en el mismo botón", () => {
  const arriba = C.VOCES.filter((v) => v.primero === "quien").length;
  assert.ok(arriba >= 4 && arriba <= C.VOCES.length - 4, `arriba=${arriba}`);
});

test("las voces caben antes del tope del reventón, y la séptima se revela antes de popDesde", () => {
  const ultimaAbre = P.vozPrimera + (C.VOCES.length - 1) * P.vozCada;
  assert.ok(ultimaAbre + P.vozVentana + 1 <= P.popMax);
  assert.ok(P.vozPrimera + 6 * P.vozCada + P.vozVentana + 1 <= P.popDesde);
});

test("vozEn: abierta 7 s, revelada hasta la siguiente", () => {
  assert.equal(M.vozEn(0), null);
  assert.deepEqual(M.vozEn(5), { i: 0, estado: "abierta" });
  assert.deepEqual(M.vozEn(11), { i: 0, estado: "abierta" });
  assert.deepEqual(M.vozEn(12), { i: 0, estado: "revelada" });
  assert.deepEqual(M.vozEn(20), { i: 1, estado: "abierta" });
});

test("riesgo: cero bajo el umbral, creciente, con tope", () => {
  assert.equal(M.riesgo(1.0), 0);
  assert.equal(M.riesgo(1.4), 0);
  assert.ok(M.riesgo(2.5) > 0 && M.riesgo(3.5) > M.riesgo(2.5));
  assert.equal(M.riesgo(50), P.hazTope);
});

test("acertar una voz paga el bono una sola vez; fallar no paga", () => {
  const e = M.nuevaPartida("x");
  const J = { a: { nombre: "A", dentro: false, resp: { 0: true } }, b: { nombre: "B", dentro: false, resp: { 0: false } } };
  M.tick(e, J); e.fase = "burbuja";
  const fijo = () => 0.5;
  for (let k = 0; k < 40; k++) M.tick(e, J, fijo);
  assert.equal(e.riqueza.a, P.inicio + P.bono);
  assert.equal(e.riqueza.b, P.inicio);
  assert.equal(e.pct[0], 50);
  assert.equal(e.aciertos.a, 1);
});

test("quien está fuera no gana ni pierde con el precio; quien está dentro lo sigue", () => {
  const e = M.nuevaPartida("x");
  const J = { a: { nombre: "A", dentro: true, resp: {} }, b: { nombre: "B", dentro: false, resp: {} } };
  M.tick(e, J); e.fase = "burbuja";
  const fijo = () => 0.5;
  for (let k = 0; k < 60; k++) M.tick(e, J, fijo);
  assert.equal(e.riqueza.b, P.inicio);
  assert.ok(Math.abs(e.riqueza.a - e.precio) < 1e-6, `${e.riqueza.a} vs ${e.precio}`);
  assert.ok(e.precio > P.inicio);
});

test("el reventón le quita 80% a los de dentro y nada a los de fuera", () => {
  const e = M.nuevaPartida("x");
  const J = { a: { nombre: "A", dentro: true, resp: {} }, b: { nombre: "B", dentro: true, resp: {} }, c: { nombre: "C", dentro: false, resp: {} } };
  M.tick(e, J); e.fase = "burbuja";
  let guarda = 0, antes = 0;
  while (e.fase === "burbuja" && guarda++ < 300) {
    if (e.t === 60) J.b.dentro = false;
    antes = e.riqueza.a;
    M.tick(e, J, () => 0.5);
  }
  assert.equal(e.fase, "reventon");
  assert.equal(e.t, P.popMax, "con rand fijo en 0,5 sólo revienta en el tope");
  assert.deepEqual(e.atrapados, ["a"]);
  assert.ok(e.riqueza.a < antes * 0.25);
  assert.equal(e.riqueza.c, P.inicio);
  assert.ok(e.riqueza.b > P.inicio);
  assert.equal(e.st.b.sale, 61);
});

test("sala que no se atreve: sin burbuja no hay reventón, se va directo al podio", () => {
  const e = M.nuevaPartida("x");
  const J = { a: { nombre: "A", dentro: false, resp: {} } };
  M.tick(e, J); e.fase = "burbuja";
  let guarda = 0;
  while (e.fase === "burbuja" && guarda++ < 300) M.tick(e, J, () => 0.5);
  assert.equal(e.fase, "podio");
  assert.equal(e.suave, true);
  assert.deepEqual(e.premios.noJugar, ["a"]);
});

test("epílogo: los que vuelven siguen al precio; el otro mundo queda calculado", () => {
  for (const [r, mundo] of [[0.1, "aghion"], [0.9, "acemoglu"]]) {
    const e = M.nuevaPartida("x");
    const J = { a: { nombre: "A", dentro: true, vuelve: false, resp: {} }, b: { nombre: "B", dentro: false, vuelve: false, resp: {} } };
    M.tick(e, J); e.fase = "burbuja";
    let guarda = 0;
    while (e.fase === "burbuja" && guarda++ < 300) M.tick(e, J, () => 0.5);
    const a0 = e.riqueza.a, b0 = e.riqueza.b;
    J.a.vuelve = true;
    while (e.fase !== "podio" && guarda++ < 400) M.tick(e, J, () => r);
    assert.equal(e.mundo, mundo);
    assert.equal(e.riqueza.b, Math.round(b0));
    assert.ok(Math.abs(e.riqueza.a - a0 * P.mundo[mundo]) <= 1, `${e.riqueza.a} vs ${a0 * P.mundo[mundo]}`);
    const otro = mundo === "aghion" ? "acemoglu" : "aghion";
    assert.ok(Math.abs(e.otro.a - a0 * P.mundo[otro]) <= 1);
    assert.equal(e.otro.b, e.riqueza.b);
    assert.equal(e.rank.length, 2);
  }
});

test("300 partidas simuladas con 25 alumnos: la partida tiene la forma buscada", () => {
  const N = 300;
  let pops = 0, suaves = 0, sumaT = 0, sumaRatio = 0, sumaAtr = 0, sumaGana = 0, tMin = 1e9, tMax = 0;
  const mundos = { aghion: 0, acemoglu: 0 };
  for (let s = 1; s <= N; s++) {
    const { e, tPop, ratioPop } = partida(s);
    assert.equal(e.fase, "podio");
    for (const u in e.riqueza) assert.ok(e.riqueza[u] >= 0 && Number.isFinite(e.riqueza[u]));
    assert.equal(e.rank.length, 25);
    if (e.suave) { suaves++; continue; }
    pops++; sumaT += tPop; sumaRatio += ratioPop; sumaAtr += e.atrapados.length / 25;
    sumaGana += e.riqueza[e.rank[0]];
    tMin = Math.min(tMin, tPop); tMax = Math.max(tMax, tPop);
    mundos[e.mundo]++;
    assert.ok(tPop >= P.popDesde && tPop <= P.popMax, `t=${tPop}`);
  }
  const prom = { t: sumaT / pops, ratio: sumaRatio / pops, atrapados: sumaAtr / pops, ganador: sumaGana / pops };
  console.log("simulación:", { pops, suaves, tMin, tMax, ...prom, mundos });
  assert.ok(suaves <= N * 0.05, "casi siempre hay burbuja");
  assert.ok(prom.t >= 110 && prom.t <= 160, `revienta en promedio en t=${prom.t}`);
  assert.ok(prom.ratio >= 2 && prom.ratio <= 5, `precio/valor al reventar=${prom.ratio}`);
  assert.ok(prom.atrapados >= 0.15 && prom.atrapados <= 0.7, `atrapados=${prom.atrapados}`);
  assert.ok(prom.ganador >= 200, `ganador promedio=${prom.ganador}`);
  assert.ok(mundos.aghion > N * 0.35 && mundos.acemoglu > N * 0.35, "los dos mundos salen");
});
