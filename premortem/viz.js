/* PRE-MORTEM 2031 — visualización del proyector.
   dibujar(el, seccion, paso, agregado, votacion) vacía `el` y pinta una sección a pantalla
   completa. Sin dependencias. Todo texto que viene de los datos entra por textContent.
   Nunca lanza: si falta algo, muestra «Sin datos todavía». */

export const VIAS = {
  1: "La IA se sale de control",
  2: "Gente mala la usa",
  3: "Nadie lo quiere, pero pasa",
};

/* Orden en que el profesor recorre la visualización. `pasos` = cuántos pasos tiene la sección
   (paso va de 0 a pasos-1). 'sinia' no está en la lista: se pinta cuando agregado.estado === 'sin_ia'. */
export const SECCIONES = [
  { id: "mapa", titulo: "Mapa de escenarios", pasos: 4 },
  { id: "cadenas", titulo: "Las cadenas", pasos: 1 },
  { id: "reparto", titulo: "Ganadores y perdedores", pasos: 1 },
  { id: "senales", titulo: "Señales tempranas", pasos: 1 },
  { id: "evidencia", titulo: "La evidencia de la sala", pasos: 1 },
  { id: "dispersion", titulo: "Probabilidad contra gravedad", pasos: 1 },
  { id: "provocaciones", titulo: "Tres provocaciones", pasos: 3 },
  { id: "votacion", titulo: "Votación", pasos: 1 },
];
export const SECCION_SIN_IA = { id: "sinia", titulo: "Lo que escribió la sala", pasos: 1 };

const NS = "http://www.w3.org/2000/svg";
const COLOR = { 1: "var(--via1)", 2: "var(--via2)", 3: "var(--via3)" };

/* ---------- utilidades ---------- */
function h(tag, cls, texto) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (texto != null) e.textContent = String(texto);
  return e;
}
function s(tag, attrs, texto) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs || {}) e.setAttribute(k, attrs[k]);
  if (texto != null) e.textContent = String(texto);
  return e;
}
const arr = (x) => (Array.isArray(x) ? x : []);
const obj = (x) => (x && typeof x === "object" && !Array.isArray(x) ? x : {});
const num = (x, d = 0) => (x != null && x !== "" && Number.isFinite(+x) ? +x : d);
const txt = (x) => (x == null ? "" : String(x));
const viaDe = (v) => { const n = parseInt(v, 10); return n >= 1 && n <= 3 ? n : 0; };
const colorVia = (v) => COLOR[viaDe(v)] || "var(--gris)";
const plural = (n, uno, muchos) => `${n} ${n === 1 ? uno : muchos}`;

function cabecera(root, titulo, sub, via) {
  const c = h("header", "viz-cab" + (via ? " via" + via : ""));
  c.append(h("h2", "viz-titulo", titulo));
  if (sub) c.append(h("p", "viz-sub", sub));
  root.append(c);
  return c;
}
function cuerpo(root, cls) {
  const b = h("div", "viz-cuerpo" + (cls ? " " + cls : ""));
  root.append(b);
  return b;
}
function vacio(root, msg) {
  root.append(h("div", "viz-vacio", msg || "Sin datos todavía"));
}
function resumenSala(ag) {
  const n = num(ag.n);
  const d = num(ag.descartadas);
  const c = num(ag.cortas);
  if (!n && !d && !c) return "";
  return plural(n, "entrevista", "entrevistas") + (d ? ` · descartadas: ${d}` : "") + (c ? ` · casi vacías: ${c}` : "");
}
/* corta un texto en líneas de a lo más `maxc` caracteres y `maxl` líneas (para SVG) */
function partir(texto, maxc, maxl) {
  const pal = txt(texto).split(/\s+/).filter(Boolean);
  const out = [];
  let l = "";
  for (const p of pal) {
    if (l && (l + " " + p).length > maxc) { out.push(l); l = p; } else l = l ? l + " " + p : p;
  }
  if (l) out.push(l);
  if (out.length > maxl) {
    const r = out.slice(0, Math.max(1, maxl));
    r[r.length - 1] = r[r.length - 1].slice(0, Math.max(3, maxc - 1)).replace(/[\s,.;:]+$/, "") + "…";
    return r;
  }
  return out.map((x) => (x.length > maxc + 4 ? x.slice(0, maxc + 3) + "…" : x));
}
function gruposDe(ag) {
  const out = [];
  const vias = obj(ag.vias);
  for (const v of [1, 2, 3]) {
    const via = obj(vias[v] || vias[String(v)]);
    for (const g of arr(via.grupos)) if (g) out.push({ ...g, via: v });
  }
  return out;
}

/* ---------- barras horizontales (reparto, votación) ---------- */
function barras(cont, items, opts) {
  const o = opts || {};
  const its = arr(items).filter((x) => x && txt(x.nombre)).slice(0, o.max || 6);
  if (!its.length) { cont.append(h("p", "viz-nada", "Sin datos todavía")); return; }
  const max = Math.max(1, ...its.map((i) => num(i.n)));
  const lista = h("div", "barras");
  for (const it of its) {
    const fila = h("div", "barra-fila");
    const et = h("div", "barra-et");
    if (it.via) {
      const p = h("span", "punto");
      p.style.background = colorVia(it.via);
      et.append(p);
    }
    et.append(h("span", "barra-nombre", txt(it.nombre)));
    const pista = h("div", "barra-pista");
    const rel = h("div", "barra-rel");
    rel.style.width = Math.max(num(it.n) > 0 ? 3 : 0, (num(it.n) / max) * 100) + "%";
    rel.style.background = it.via ? colorVia(it.via) : o.color || "var(--rosa)";
    pista.append(rel);
    fila.append(et, pista, h("div", "barra-n", num(it.n)));
    lista.append(fila);
  }
  cont.append(lista);
}

/* ---------- mapa ---------- */
function mapaVia(root, ag, v) {
  const vias = obj(ag.vias);
  const via = obj(vias[v] || vias[String(v)]);
  const grupos = arr(via.grupos).filter(Boolean).slice().sort((a, b) => num(b.n) - num(a.n));
  const total = num(via.n, grupos.reduce((t, g) => t + num(g.n), 0));
  cabecera(root, `Vía ${v} · ${VIAS[v]}`,
    grupos.length ? `${plural(total, "escenario", "escenarios")} en ${plural(grupos.length, "grupo", "grupos")}` : "", v);
  if (!grupos.length) return vacio(root);
  const denso = grupos.length > 3;
  const b = cuerpo(root, "mapa-via via" + v + (denso ? " denso" : ""));
  const max = Math.max(1, ...grupos.map((g) => num(g.n, 1)));
  const base = denso ? (grupos.length > 4 ? 14 : 17) : 21; // diámetro máximo, en vh
  for (const g of grupos.slice(0, 6)) {
    const card = h("article", "grupo");
    const d = Math.max(0.42, Math.sqrt(num(g.n, 1) / max)) * base;
    const hueco = h("div", "bola-hueco");
    hueco.style.width = base + "vh";
    const bola = h("div", "bola", num(g.n));
    bola.style.width = bola.style.height = d + "vh";
    bola.style.fontSize = Math.max(3, d * 0.42) + "vh";
    hueco.append(bola);
    const tx = h("div", "grupo-tx");
    tx.append(h("h3", "grupo-nombre", txt(g.nombre) || "Grupo sin nombre"));
    if (g.desc) tx.append(h("p", "grupo-desc", txt(g.desc)));
    if (g.cita) tx.append(h("blockquote", "grupo-cita", "«" + txt(g.cita) + "»"));
    card.append(hueco, tx);
    b.append(card);
  }
}
function mapaSala(root, ag) {
  const vias = obj(ag.vias);
  const todos = gruposDe(ag);
  cabecera(root, "Toda la sala", resumenSala(ag) || (todos.length ? plural(todos.length, "grupo", "grupos") : ""));
  if (!todos.length) return vacio(root);
  const b = cuerpo(root, "mapa-sala");
  const max = Math.max(1, ...todos.map((g) => num(g.n, 1)));
  const masLargo = Math.max(1, ...[1, 2, 3].map((v) => todos.filter((g) => g.via === v).length));
  const base = Math.min(15, 62 / masLargo); // vh
  for (const v of [1, 2, 3]) {
    const via = obj(vias[v] || vias[String(v)]);
    const grupos = arr(via.grupos).filter(Boolean).slice().sort((a, b2) => num(b2.n) - num(a.n));
    const col = h("section", "sala-col via" + v);
    const cab = h("div", "sala-cab");
    cab.append(h("span", "sala-via", "Vía " + v), h("span", "sala-nombre", VIAS[v]),
      h("span", "sala-n", num(via.n, grupos.reduce((t, g) => t + num(g.n), 0))));
    col.append(cab);
    if (!grupos.length) col.append(h("p", "viz-nada", "Sin escenarios"));
    for (const g of grupos.slice(0, 6)) {
      const fila = h("div", "sala-fila");
      const d = Math.max(0.45, Math.sqrt(num(g.n, 1) / max)) * base;
      const hueco = h("div", "bola-hueco");
      hueco.style.width = base + "vh";
      const bola = h("div", "bola", num(g.n));
      bola.style.width = bola.style.height = d + "vh";
      bola.style.fontSize = Math.max(2.6, d * 0.45) + "vh";
      hueco.append(bola);
      fila.append(hueco, h("div", "sala-grupo", txt(g.nombre)));
      col.append(fila);
    }
    b.append(col);
  }
}

/* ---------- cadenas (Sankey de tres columnas) ---------- */
function cadenas(root, ag) {
  const c = obj(ag.cadenas);
  const columnas = arr(c.columnas).length === 3 ? c.columnas : ["Disparador", "Mecanismo", "Quién paga"];
  const claves = ["d", "m", "p"];
  const rutas = arr(c.rutas).filter(Boolean);
  cabecera(root, "Las cadenas: por dónde pasan más escenarios",
    rutas.length ? `${plural(rutas.length, "escenario", "escenarios")} · cada cinta lleva el color de su vía` : "");
  const nodosIn = arr(c.nodos);
  // conteo por nodo: desde las rutas si las hay; si no, el n que venga
  const cols = [0, 1, 2].map((i) => {
    const lista = arr(nodosIn[i]).filter((n) => n && n.id != null).map((n) => ({
      id: txt(n.id), nombre: txt(n.nombre) || txt(n.id),
      n: rutas.length ? rutas.filter((r) => txt(r[claves[i]]) === txt(n.id)).length : num(n.n),
    }));
    return lista.filter((n) => n.n > 0).sort((a, b) => b.n - a.n).slice(0, 7);
  });
  if (!cols.some((x) => x.length)) return vacio(root);

  const W = 1600, H = 760, Y0 = 70, Y1 = 745, NW = 26, GAP = 22;
  const X = [330, 800, 1250];
  const b = cuerpo(root, "cadenas");
  const svg = s("svg", { viewBox: `0 0 ${W} ${H}`, class: "cadenas-svg", preserveAspectRatio: "xMidYMid meet", role: "img" });
  b.append(svg);

  const tot = cols.map((col) => col.reduce((t, n) => t + n.n, 0));
  const unidad = Math.min(...cols.map((col, i) =>
    col.length ? (Y1 - Y0 - GAP * (col.length - 1)) / Math.max(1, tot[i]) : Infinity));
  const u = Number.isFinite(unidad) ? unidad : 10;
  const idx = cols.map((col) => {
    const m = new Map();
    let y = Y0;
    const alto = col.reduce((t, n) => t + n.n * u, 0) + GAP * Math.max(0, col.length - 1);
    y += Math.max(0, (Y1 - Y0 - alto) / 2);
    col.forEach((n, i) => { n.y = y; n.h = n.n * u; n.i = i; n.sal = y; n.ent = y; m.set(n.id, n); y += n.h + GAP; });
    return m;
  });

  // títulos de columna
  columnas.forEach((t, i) => {
    svg.append(s("text", { x: X[i] + NW / 2, y: 34, "text-anchor": i === 0 ? "end" : i === 2 ? "start" : "middle", class: "cad-col" }, txt(t)));
  });

  // cintas: agregadas por (origen, destino, vía)
  const gCintas = s("g", { class: "cad-cintas" });
  svg.append(gCintas);
  for (const [ia, ib] of [[0, 1], [1, 2]]) {
    const ka = claves[ia], kb = claves[ib];
    const mapa = new Map();
    for (const r of rutas) {
      const a = idx[ia].get(txt(r[ka])), z = idx[ib].get(txt(r[kb]));
      if (!a || !z) continue;
      const v = viaDe(r.via);
      const k = a.id + "|" + z.id + "|" + v;
      if (!mapa.has(k)) mapa.set(k, { a, z, v, n: 0 });
      mapa.get(k).n++;
    }
    const enlaces = [...mapa.values()];
    // posición vertical de cada cinta en su origen y en su destino
    enlaces.slice().sort((p, q) => p.a.i - q.a.i || p.z.i - q.z.i || p.v - q.v)
      .forEach((e) => { e.y0 = e.a.sal; e.a.sal += e.n * u; });
    enlaces.slice().sort((p, q) => p.z.i - q.z.i || p.a.i - q.a.i || p.v - q.v)
      .forEach((e) => { e.y1 = e.z.ent; e.z.ent += e.n * u; });
    for (const e of enlaces) {
      const t = e.n * u, x0 = X[ia] + NW, x1 = X[ib], mx = (x0 + x1) / 2;
      const p = s("path", {
        d: `M${x0},${e.y0} C${mx},${e.y0} ${mx},${e.y1} ${x1},${e.y1} L${x1},${e.y1 + t} C${mx},${e.y1 + t} ${mx},${e.y0 + t} ${x0},${e.y0 + t} Z`,
        class: "cad-cinta",
      });
      p.style.fill = colorVia(e.v);
      gCintas.append(p);
    }
  }

  // nodos y etiquetas
  cols.forEach((col, i) => {
    for (const n of col) {
      svg.append(s("rect", { x: X[i], y: n.y, width: NW, height: Math.max(2, n.h), rx: 4, class: "cad-nodo" }));
      const LH = 30;
      const maxl = Math.max(1, Math.min(3, Math.floor((n.h + GAP) / LH)));
      const lineas = partir(n.nombre, i === 0 ? 19 : 21, maxl);
      const tx = s("text", {
        x: i === 0 ? X[i] - 12 : X[i] + NW + 12,
        y: n.y + n.h / 2 - ((lineas.length - 1) * LH) / 2,
        "text-anchor": i === 0 ? "end" : "start", class: "cad-et", "dominant-baseline": "middle",
      });
      lineas.forEach((l, k) => {
        const ts = s("tspan", { x: tx.getAttribute("x"), dy: k === 0 ? 0 : LH });
        if (k === 0) {
          const nn = s("tspan", { class: "cad-n" }, n.n + " ");
          ts.append(nn);
          ts.append(document.createTextNode(l));
        } else ts.textContent = l;
        tx.append(ts);
      });
      svg.append(tx);
    }
  });

  // leyenda de vías
  const ley = h("div", "leyenda");
  for (const v of [1, 2, 3]) {
    const it = h("span", "ley-it");
    const p = h("span", "punto");
    p.style.background = COLOR[v];
    it.append(p, h("span", "", `Vía ${v} · ${VIAS[v]}`));
    ley.append(it);
  }
  b.append(ley);
}

/* ---------- ganadores y perdedores ---------- */
function reparto(root, ag) {
  const r = obj(ag.reparto);
  const pagan = arr(r.pagan), ganan = arr(r.ganan);
  cabecera(root, "Quién paga y quién gana", resumenSala(ag));
  if (!pagan.length && !ganan.length && !r.bumeran && !r.negocio) return vacio(root);
  const b = cuerpo(root, "reparto");
  const izq = h("section", "rep-col");
  izq.append(h("h3", "rep-tit paga", "Quién paga"));
  barras(izq, pagan.slice().sort((a, c) => num(c.n) - num(a.n)), { color: "var(--alerta, #B5533C)" });
  const der = h("section", "rep-col");
  der.append(h("h3", "rep-tit gana", "Quién gana"));
  barras(der, ganan.slice().sort((a, c) => num(c.n) - num(a.n)), { color: "var(--ok, #5E8C6A)" });
  const marcas = h("section", "rep-marcas");
  for (const [k, nombre, def] of [
    ["bumeran", "Bumerán", "el riesgo vuelve a quien lo creó"],
    ["negocio", "Negocio", "alguien vende la protección"],
  ]) {
    const m = obj(r[k]);
    const caja = h("div", "marca" + (num(m.n) ? "" : " apagada"));
    const cab = h("div", "marca-cab");
    cab.append(h("span", "marca-n", num(m.n)), h("span", "marca-nombre", nombre));
    caja.append(cab, h("p", "marca-def", def));
    if (m.ejemplo) caja.append(h("p", "marca-ej", "«" + txt(m.ejemplo) + "»"));
    marcas.append(caja);
  }
  b.append(izq, der, marcas);
}

/* ---------- señales tempranas ---------- */
function senales(root, ag) {
  const sn = obj(ag.senales);
  const rep = arr(sn.repetidas).filter((x) => x && txt(x.texto));
  const ori = arr(sn.originales).filter((x) => x && txt(x.texto));
  cabecera(root, "Señales tempranas: qué se podría haber visto antes", resumenSala(ag));
  if (!rep.length && !ori.length) return vacio(root);
  const b = cuerpo(root, "senales");
  const izq = h("section", "sen-col");
  izq.append(h("h3", "sen-tit", "Las más repetidas"));
  const l1 = h("ul", "sen-lista");
  for (const x of rep.slice().sort((a, c) => num(c.n) - num(a.n)).slice(0, 6)) {
    const li = h("li", "sen-it");
    li.append(h("span", "sen-n", num(x.n)), h("span", "sen-tx", txt(x.texto)));
    l1.append(li);
  }
  if (!rep.length) izq.append(h("p", "viz-nada", "Ninguna se repitió"));
  izq.append(l1);
  const der = h("section", "sen-col");
  der.append(h("h3", "sen-tit", "Las más originales"));
  const l2 = h("ul", "sen-lista");
  for (const x of ori.slice(0, 6)) {
    const li = h("li", "sen-it orig");
    li.append(h("span", "sen-n", "✦"), h("span", "sen-tx", txt(x.texto)));
    l2.append(li);
  }
  if (!ori.length) der.append(h("p", "viz-nada", "Sin datos todavía"));
  der.append(l2);
  b.append(izq, der);
}

/* ---------- evidencia ---------- */
function evidencia(root, ag) {
  const e = obj(ag.evidencia);
  const temas = arr(e.temas).filter(Boolean), graves = arr(e.graves).filter(Boolean), sin = arr(e.sin).filter(Boolean);
  const nSin = num(e.nSin, sin.length), nCon = num(e.nCon);
  cabecera(root, "La evidencia de la sala",
    nSin + nCon ? `${plural(nCon, "escenario", "escenarios")} con una fuente real · ${nSin} sin evidencia` : "");
  if (!temas.length && !graves.length && !sin.length && !(nSin + nCon)) return vacio(root);
  const b = cuerpo(root, "evidencia");

  const c1 = h("section", "evi-col temas");
  c1.append(h("h3", "evi-tit", "Fuentes por tema"));
  if (!temas.length) c1.append(h("p", "viz-nada", "Nadie pegó una fuente"));
  for (const t of temas.slice().sort((a, c) => num(c.n) - num(a.n)).slice(0, 4)) {
    const caja = h("div", "tema");
    const cab = h("div", "tema-cab");
    cab.append(h("span", "tema-n", num(t.n)), h("span", "tema-nombre", txt(t.tema)));
    caja.append(cab);
    for (const f of arr(t.fuentes).filter(Boolean).slice(0, 3)) {
      const li = h("div", "fuente");
      li.append(h("span", "fuente-tx", txt(f.titulo) || txt(f.url)));
      if (num(f.n) > 1) li.append(h("span", "fuente-n", "×" + num(f.n)));
      caja.append(li);
    }
    const resto = arr(t.fuentes).length - 3;
    if (resto > 0) caja.append(h("div", "fuente mas", `+ ${resto} más`));
    c1.append(caja);
  }

  const c2 = h("section", "evi-col graves");
  c2.append(h("h3", "evi-tit", "Sostienen los escenarios más graves"));
  if (!graves.length) c2.append(h("p", "viz-nada", "Sin datos todavía"));
  for (const g of graves.slice(0, 4)) {
    const caja = h("div", "grave");
    const cab = h("div", "grave-cab");
    cab.append(h("span", "grave-n", "G" + num(g.gravedad)), h("span", "grave-tit", txt(g.titular)));
    caja.append(cab);
    caja.append(h("div", "grave-fuente" + (g.fuente ? "" : " sin"), g.fuente ? txt(g.fuente) : "sin evidencia"));
    c2.append(caja);
  }

  const c3 = h("section", "evi-col sin");
  const tot = nSin + nCon;
  const big = h("div", "sin-num");
  big.append(h("span", "sin-n", nSin), h("span", "sin-de", tot ? `de ${tot}` : ""));
  c3.append(h("h3", "evi-tit", "Sin evidencia"), big);
  const ul = h("ul", "sin-lista");
  for (const x of sin.slice(0, 6)) {
    const li = h("li", "sin-it");
    const p = h("span", "punto");
    p.style.background = colorVia(x.via);
    li.append(p, h("span", "", txt(x.titular)));
    ul.append(li);
  }
  if (sin.length > 6) ul.append(h("li", "sin-it mas", `+ ${sin.length - 6} más`));
  c3.append(ul);
  b.append(c1, c2, c3);
}

/* ---------- dispersión ---------- */
function dispersion(root, ag) {
  const pts = arr(ag.puntos).filter((p) => p && p.prob != null && p.grav != null);
  cabecera(root, "Probabilidad contra gravedad",
    pts.length ? `Un punto por estudiante: lo que cada uno le asignó a su propio escenario (${pts.length})` : "");
  if (!pts.length) return vacio(root);
  const b = cuerpo(root, "dispersion");
  const W = 1600, H = 760, L = 120, R = 1220, T = 30, B = 650;
  const svg = s("svg", { viewBox: `0 0 ${W} ${H}`, class: "disp-svg", preserveAspectRatio: "xMidYMid meet", role: "img" });
  const x = (p) => L + (Math.max(0, Math.min(100, p)) / 100) * (R - L);
  const y = (g) => B - ((Math.max(0.5, Math.min(5.5, g)) - 0.5) / 5) * (B - T);
  svg.append(s("rect", { x: L, y: T, width: R - L, height: B - T, class: "disp-fondo" }));
  // cuadrante «probable y grave»
  svg.append(s("rect", { x: x(50), y: T, width: R - x(50), height: y(3) - T, class: "disp-zona" }));
  svg.append(s("text", { x: R - 14, y: T + 34, "text-anchor": "end", class: "disp-zona-tx" }, "probable y grave"));
  for (let g = 1; g <= 5; g++) {
    svg.append(s("line", { x1: L, x2: R, y1: y(g), y2: y(g), class: "disp-grilla" }));
    svg.append(s("text", { x: L - 16, y: y(g), "text-anchor": "end", "dominant-baseline": "middle", class: "disp-eje" }, g));
  }
  for (let p = 0; p <= 100; p += 25) {
    svg.append(s("line", { x1: x(p), x2: x(p), y1: T, y2: B, class: "disp-grilla" }));
    svg.append(s("text", { x: x(p), y: B + 38, "text-anchor": "middle", class: "disp-eje" }, p + " %"));
  }
  svg.append(s("text", { x: (L + R) / 2, y: B + 92, "text-anchor": "middle", class: "disp-rot" }, "Probabilidad"));
  const ry = s("text", { x: 38, y: (T + B) / 2, "text-anchor": "middle", class: "disp-rot", transform: `rotate(-90 38 ${(T + B) / 2})` }, "Gravedad");
  svg.append(ry);
  // puntos con jitter determinista (según el orden), para que no se tapen
  pts.forEach((p, i) => {
    const a = Math.sin(i * 12.9898 + 4.1) * 43758.5453, c = Math.sin(i * 78.233 + 1.7) * 12543.853;
    const jx = ((a - Math.floor(a)) - 0.5) * 3.2, jy = ((c - Math.floor(c)) - 0.5) * 0.56;
    const ci = s("circle", { cx: x(num(p.prob) + jx), cy: y(num(p.grav) + jy), r: 15, class: "disp-pt" });
    ci.style.fill = colorVia(p.via);
    svg.append(ci);
  });
  // leyenda con promedios por vía
  let ly = T + 30;
  for (const v of [1, 2, 3]) {
    const mios = pts.filter((p) => viaDe(p.via) === v);
    const ci = s("circle", { cx: R + 50, cy: ly, r: 15, class: "disp-pt" });
    ci.style.fill = COLOR[v];
    svg.append(ci);
    svg.append(s("text", { x: R + 78, y: ly, "dominant-baseline": "middle", class: "disp-ley" }, "Vía " + v));
    partir(VIAS[v], 22, 2).forEach((l, k) =>
      svg.append(s("text", { x: R + 78, y: ly + 36 + k * 30, class: "disp-ley2" }, l)));
    if (mios.length) {
      const mp = mios.reduce((t, p) => t + num(p.prob), 0) / mios.length;
      const mg = mios.reduce((t, p) => t + num(p.grav), 0) / mios.length;
      svg.append(s("text", { x: R + 78, y: ly + 106, class: "disp-ley3" },
        `${mios.length} · prob. ${Math.round(mp)} % · grav. ${mg.toFixed(1).replace(".", ",")}`));
    } else svg.append(s("text", { x: R + 78, y: ly + 106, class: "disp-ley3" }, "sin puntos"));
    ly += 205;
  }
  b.append(svg);
}

/* ---------- provocaciones ---------- */
function provocaciones(root, ag, paso) {
  cabecera(root, "Para discutir", "");
  const pr = ag.provocaciones;
  if (pr == null) return vacio(root, "Redactando las provocaciones…");
  const lista = arr(pr).map(txt).filter(Boolean);
  if (!lista.length) return vacio(root);
  const ver = lista.slice(0, Math.max(1, Math.min(lista.length, num(paso) + 1)));
  const largo = ver.reduce((t, x) => t + x.length, 0);
  const b = cuerpo(root, "provocaciones" + (largo > 520 ? " chico" : largo > 360 ? " medio" : ""));
  ver.forEach((t, i) => {
    const it = h("div", "prov" + (i === ver.length - 1 ? " nueva" : ""));
    it.append(h("span", "prov-n", i + 1), h("p", "prov-tx", t));
    b.append(it);
  });
}

/* ---------- votación ---------- */
function votacionVista(root, ag, vot) {
  const v = obj(vot);
  const grupos = gruposDe(ag);
  const nV = num(v.nVotos);
  cabecera(root, "Votación", vot ? (v.abierta ? "Abierta · " : "Cerrada · ") + plural(nV, "voto", "votos") : "");
  if (!vot) return vacio(root, "La votación todavía no se abre");
  if (!grupos.length) return vacio(root);
  const b = cuerpo(root, "votacion");
  for (const [k, preg] of [["probable", "¿Cuál es el más probable?"], ["serio", "¿Cuál nos estamos tomando menos en serio?"]]) {
    const cuenta = obj(v[k]);
    const col = h("section", "vot-col");
    col.append(h("h3", "vot-tit", preg));
    const items = grupos.map((g) => ({ nombre: txt(g.nombre), via: g.via, n: num(cuenta[g.id]) }))
      .sort((a, c) => c.n - a.n);
    barras(col, items, { max: 7 });
    b.append(col);
  }
}

/* ---------- salida sin IA ---------- */
function sinIA(root, ag) {
  const tit = arr(ag.titulares).filter((t) => t && txt(t.texto));
  const pv = obj(ag.porVia);
  cabecera(root, "Lo que escribió la sala", resumenSala(ag) || (tit.length ? plural(tit.length, "titular", "titulares") : ""));
  if (!tit.length && !Object.keys(pv).length) return vacio(root);
  const b = cuerpo(root, "sinia");
  for (const v of [1, 2, 3]) {
    const mios = tit.filter((t) => viaDe(t.via) === v);
    const col = h("section", "sinia-col via" + v);
    const cab = h("div", "sala-cab");
    cab.append(h("span", "sala-via", "Vía " + v), h("span", "sala-nombre", VIAS[v]),
      h("span", "sala-n", num(pv[v] ?? pv[String(v)], mios.length)));
    col.append(cab);
    const ul = h("ul", "sinia-lista");
    for (const t of mios.slice(0, 8)) ul.append(h("li", "", txt(t.texto)));
    if (mios.length > 8) ul.append(h("li", "mas", `+ ${mios.length - 8} más`));
    if (!mios.length) ul.append(h("li", "mas", "Sin titulares"));
    col.append(ul);
    b.append(col);
  }
}

/* ---------- entrada ---------- */
export function dibujar(el, seccion, paso, agregado, votacion) {
  if (!el) return;
  el.textContent = "";
  const root = h("div", "viz viz-" + txt(seccion));
  el.append(root);
  const ag = obj(agregado);
  const p = Math.max(0, parseInt(paso, 10) || 0);
  try {
    if (seccion === "mapa") { if (p >= 3) mapaSala(root, ag); else mapaVia(root, ag, p + 1); }
    else if (seccion === "cadenas") cadenas(root, ag);
    else if (seccion === "reparto") reparto(root, ag);
    else if (seccion === "senales") senales(root, ag);
    else if (seccion === "evidencia") evidencia(root, ag);
    else if (seccion === "dispersion") dispersion(root, ag);
    else if (seccion === "provocaciones") provocaciones(root, ag, p);
    else if (seccion === "votacion") votacionVista(root, ag, votacion);
    else if (seccion === "sinia") sinIA(root, ag);
    else vacio(root);
  } catch (err) {
    console.error("[viz] no se pudo pintar", seccion, err);
    root.textContent = "";
    vacio(root);
  }
}
