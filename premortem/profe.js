/* PRE-MORTEM 2031 — página del profesor (no se proyecta).
   profe.html            → pide la clave y abre o retoma una sala
   profe.html?s=ABCD     → controla la sala ABCD
   profe.html?bots=20    → abre una sala y suma 20 estudiantes simulados, para ensayar solo
   (agrega &rapido=1 para que los bots respondan sin pausas) */
import { pedir, q, $, h, VIAS, CASILLAS, codigoDeSala, urlJugar, mmss } from "./api.js";
import { SECCIONES } from "./viz.js";

const PASOS = [{ seccion: "lobby", paso: 0, rotulo: "Sala y QR" }];
for (const s of SECCIONES) for (let p = 0; p < s.pasos; p++) PASOS.push({ seccion: s.id, paso: p, rotulo: s.pasos > 1 ? `${s.titulo} ${p + 1}` : s.titulo });

const guarda = {
  leer: (k) => { try { return localStorage.getItem(k) || ""; } catch { return ""; } },
  poner: (k, v) => { try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch { /* */ } },
};
let clave = guarda.leer("premortem:clave");
let sala = codigoDeSala() || guarda.leer("premortem:ultima");
let datos = null;
let bots = [];
let botsVivos = 0;
const RAPIDO = q.has("rapido");
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

function avisar(texto, tipo = "") { const m = $("msg"); m.textContent = texto; m.className = tipo; }

async function accion(a, extra = {}, ok = "") {
  try {
    const r = await pedir(a, { sala, clave, ...extra });
    if (ok) avisar(ok, "bien");
    await refrescar();
    return r;
  } catch (e) { avisar(e.message, "mal"); return null; }
}

/* ---------- clave y sala ---------- */

function pedirClave() { $("panel").classList.add("oculto"); $("entrada-clave").classList.remove("oculto"); $("clave").focus(); }
$("guardar-clave").addEventListener("click", () => { clave = $("clave").value.trim(); guarda.poner("premortem:clave", clave); arrancar(); });
$("clave").addEventListener("keydown", (e) => { if (e.key === "Enter") $("guardar-clave").click(); });

async function abrirSala() {
  try {
    const r = await pedir("abrir", { clave });
    sala = r.sala;
    guarda.poner("premortem:ultima", sala);
    history.replaceState(null, "", `?s=${sala}`);
    bots = [];
    avisar(`Sala ${sala} abierta.`, "bien");
    await refrescar();
    return true;
  } catch (e) {
    if (e.status === 403) { clave = ""; guarda.poner("premortem:clave", ""); pedirClave(); }
    else avisar(e.message, "mal");
    return false;
  }
}
$("nueva").addEventListener("click", () => { if (!datos || confirm("¿Abrir una sala nueva? La actual queda como está.")) abrirSala(); });

/* ---------- pintar ---------- */

function pintar() {
  const s = datos.sala, als = datos.alumnos;
  $("codigo").textContent = s.codigo;
  $("abrir-proyector").href = `index.html?s=${s.codigo}`;
  const fase = s.fase === "abierta" ? "abierta" : "cerrada";
  $("resumen-sala").textContent = `${fase}${s.inicio && s.fase === "abierta" ? ` · ${mmss(s.ahora - s.inicio)}` : ""}${s.avisoEn ? " · aviso enviado" : ""}${s.anonima ? " · sin nombres" : ""}`;
  $("via-grupo").classList.toggle("activo", s.modoVia === "grupo");
  $("via-elige").classList.toggle("activo", s.modoVia === "elige");
  if (document.activeElement !== $("duracion")) $("duracion").value = s.duracionMin;
  $("fijo").textContent = `Preguntas fijas: ${s.modoFijo ? "SÍ" : "no"}`;
  $("fijo").classList.toggle("activo", !!s.modoFijo);
  $("aviso").textContent = s.avisoEn ? "Quitar aviso de 2 minutos" : "Aviso: quedan 2 minutos";
  $("cerrar").textContent = s.fase === "abierta" ? "Cerrar sala" : "Reabrir sala";
  $("cerrar").classList.toggle("peligro", s.fase === "abierta");

  // agregación
  const ea = $("estado-agregado");
  if (s.agregando) ea.textContent = s.hayAgregado && s.estadoAgregado === "parcial"
    ? "Mapa y gráficos listos: ya puedes revelar. Redactando las provocaciones…"
    : "Agregando… (unos 30 segundos)";
  else if (!s.hayAgregado) ea.textContent = "Todavía no se agrega.";
  else ea.textContent = { listo: "Agregado listo.", parcial: "Agregado parcial: faltó algo; puedes reintentar.", sin_ia: "Salida sin IA en pantalla.", error: "La agregación falló." }[s.estadoAgregado] + (s.descartadas != null ? ` Descartadas: ${s.descartadas}.` : "");
  $("agregar").textContent = s.hayAgregado ? "Reintentar agregación" : "Agregar con IA";
  $("agregar").disabled = !!s.agregando;

  // proyector
  const v = s.vista || { seccion: "lobby", paso: 0 };
  const i = Math.max(0, PASOS.findIndex((p) => p.seccion === v.seccion && p.paso === v.paso));
  $("donde").textContent = `${PASOS[i].rotulo}${s.hayAgregado ? "" : " (la visualización aparece después de agregar)"}`;
  $("pasos").replaceChildren(...PASOS.map((p, j) => h("button", { class: `btn sec${j === i ? " activo" : ""}`, onclick: () => irA(j) }, p.rotulo)));
  $("votacion").textContent = s.votacion ? "Cerrar votación" : "Abrir votación";
  $("votacion").classList.toggle("activo", !!s.votacion);
  $("n-votos").textContent = `${als.filter((a) => a.votos).length} votos`;

  // costo
  const g = s.gasto || {};
  const linea = (k, n) => (g[k] ? `${n}: ${g[k].n} llamadas · ${Math.round(((g[k].in || 0) + (g[k].cr || 0) + (g[k].cw || 0)) / 1000)}k entrada (${Math.round((g[k].cr || 0) / 1000)}k de caché) · ${Math.round((g[k].out || 0) / 1000)}k salida` : null);
  $("gasto").replaceChildren(...[
    h("div", { style: "font-size:22px;font-weight:800;color:var(--texto)" }, `US$ ${(g.usd || 0).toFixed(2)} de ${s.tope}`),
    ...[linea("sonnet", "Sonnet 5.5"), linea("haiku", "Haiku 5.5"), linea("opus", "Opus 5.5")].filter(Boolean).map((t) => h("div", {}, t)),
    (g.usd || 0) >= s.tope ? h("div", { style: "color:var(--alerta);font-weight:700" }, "Tope alcanzado: el entrevistador pasó a preguntas fijas.") : null,
  ].filter(Boolean));

  // tabla
  $("n-entrevistas").textContent = als.length ? `· ${als.length} (${als.filter((a) => a.estado === "listo").length} listas)` : "";
  $("vacio").classList.toggle("oculto", als.length > 0);
  const ESTADO = { chat: "conversando", resumen: "revisa resumen", deslizadores: "deslizadores", listo: "listo" };
  $("tabla").replaceChildren(...als.map((a) => h("tr", { class: `via${a.via}`, onclick: () => detalle(a.id) },
    h("td", {}, h("b", {}, a.nombre), a.bot ? h("span", { class: "suave" }, " bot") : null),
    h("td", {}, h("span", { class: "chip" }, a.via)),
    h("td", {}, h("span", { class: "cas" }, CASILLAS.map(([k, n]) => h("i", { class: a.ok[k] ? "ok" : "", title: n })))),
    h("td", {}, `${a.turnos}${a.respaldos ? ` (${a.respaldos} fijas)` : ""}`),
    h("td", {}, ESTADO[a.estado] || a.estado),
    h("td", {}, a.prob != null ? `${a.prob} % / ${a.grav}` : "—"),
    h("td", {}, h("div", { class: "tit" }, a.casillas.titular || "")))));
}

function detalle(id) {
  const a = datos.alumnos.find((x) => x.id === id);
  if (!a) return;
  const c = a.casillas;
  const kv = [
    ["Titular", c.titular], ["Actor", c.disparador_actor], ["Lugar", c.disparador_lugar], ["Momento", c.disparador_momento],
    ...(c.cadena || []).map((e, i) => [`Eslabón ${i + 1}`, `${e.paso}${e.porque ? ` — porque ${e.porque}` : ""}`]),
    ["Quién pagó", c.pagaron], ["Quién ganó", c.ganaron], ["Señal temprana", c.senal],
    ["Fuente", c.evidencia_no_encontro ? "(dijo que no encontró)" : c.evidencia_fuente], ["Qué muestra", c.evidencia_muestra],
    ["Probabilidad", a.prob != null ? `${a.prob} %` : ""], ["Gravedad", a.grav != null ? `${a.grav} de 5` : ""],
  ];
  $("dlg-cuerpo").replaceChildren(
    h("div", { class: "fila" }, h("h2", {}, a.nombre), h("span", { class: `chip via${a.via}` }, `Vía ${a.via} · ${VIAS[a.via]}`),
      h("button", { class: "btn sec mini", style: "margin-left:auto", onclick: () => $("dlg").close() }, "Cerrar")),
    h("h4", {}, "Casillas"),
    h("div", { class: "kv" }, kv.flatMap(([k, val]) => [h("b", {}, k), h("span", {}, val || "—")])),
    a.enlaces.length ? h("h4", {}, "Enlaces que abrió el servidor") : null,
    ...a.enlaces.map((e) => h("div", {}, h("a", { href: e.url, target: "_blank", rel: "noopener noreferrer" }, e.url), ` → ${e.ok ? e.titulo : "no se pudo abrir"}`)),
    h("h4", {}, "Conversación"),
    ...a.mensajes.filter((m) => !m.sis).map((m) => h("div", { class: `m ${m.r}` }, m.r === "a" && m.c ? h("small", {}, m.c) : null, m.t)));
  if (!$("dlg").open) $("dlg").showModal();
}
$("dlg").addEventListener("click", (e) => { if (e.target === $("dlg")) $("dlg").close(); });

/* ---------- controles ---------- */

$("via-grupo").addEventListener("click", () => accion("config", { modoVia: "grupo" }));
$("via-elige").addEventListener("click", () => accion("config", { modoVia: "elige" }));
$("duracion").addEventListener("change", (e) => accion("config", { duracionMin: +e.target.value }));
$("fijo").addEventListener("click", () => accion("config", { modoFijo: !datos.sala.modoFijo }));
$("aviso").addEventListener("click", () => accion("aviso", { quitar: !!datos.sala.avisoEn }, datos.sala.avisoEn ? "Aviso quitado." : "Aviso enviado a todos los teléfonos."));
$("cerrar").addEventListener("click", () => accion("cerrar", { reabrir: datos.sala.fase !== "abierta" }));
$("copiar-url").addEventListener("click", async () => {
  const u = urlJugar(sala);
  try { await navigator.clipboard.writeText(u); avisar(`Copiado: ${u}`, "bien"); } catch { avisar(u); }
});

async function agregar(sinIA) {
  if (!datos.alumnos.length) return avisar("No hay entrevistas que agregar.", "mal");
  if (datos.sala.fase === "abierta" && !confirm("Esto cierra la sala y agrega lo que haya. ¿Seguir?")) return;
  avisar(sinIA ? "Armando la salida sin IA…" : "Agregando: unos 30 segundos…");
  $("agregar").disabled = true;
  const t = Date.now();
  const r = await accion("agregar", { sinIA });
  $("agregar").disabled = false;
  if (r) avisar(`${r.estado === "listo" ? "Agregado listo" : r.estado === "sin_ia" ? "Salida sin IA lista" : "Agregado parcial"} en ${Math.round((Date.now() - t) / 1000)} s. ${r.aviso || "Usa «Siguiente →» para revelar las secciones."}`, r.estado === "parcial" ? "mal" : "bien");
}
$("agregar").addEventListener("click", () => agregar(false));
$("sin-ia").addEventListener("click", () => agregar(true));

function irA(j) { const p = PASOS[Math.min(PASOS.length - 1, Math.max(0, j))]; return accion("vista", { seccion: p.seccion, paso: p.paso }); }
function mover(d) {
  const v = datos.sala.vista || { seccion: "lobby", paso: 0 };
  irA(Math.max(0, PASOS.findIndex((p) => p.seccion === v.seccion && p.paso === v.paso)) + d);
}
$("ant").addEventListener("click", () => mover(-1));
$("sig").addEventListener("click", () => mover(1));
addEventListener("keydown", (e) => {
  if (!datos || $("dlg").open || ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
  if (e.key === "ArrowRight") mover(1);
  if (e.key === "ArrowLeft") mover(-1);
});

$("votacion").addEventListener("click", async () => {
  const abrir = !datos.sala.votacion;
  if (abrir && !datos.sala.hayAgregado) return avisar("Primero hay que agregar: se vota sobre los grupos que arma la IA.", "mal");
  await accion("votacion", { abierta: abrir }, abrir ? "Votación abierta en los teléfonos." : "Votación cerrada.");
  if (abrir) { await accion("vista", { seccion: "votacion", paso: 0 }); bots.forEach((b) => correrBot(b, true)); }
});

/* ---------- bots ---------- */

async function correrBot(b, soloVoto = false) {
  botsVivos++;
  $("estado-bots").textContent = `${botsVivos} bots conversando…`;
  try {
    for (let i = 0; i < 45; i++) {
      if (!RAPIDO && !soloVoto) await espera(700 + Math.random() * 2600);
      const r = await pedir("botPaso", { sala, clave, id: b.id, token: b.token });
      if (r.fin || (r.estado === "listo" && !soloVoto)) break;
    }
  } catch (e) { console.warn("bot", e.message); }
  finally { botsVivos--; $("estado-bots").textContent = botsVivos ? `${botsVivos} bots conversando…` : `${bots.length} bots terminaron.`; }
}
async function sumarBots(n) {
  const r = await accion("botCrear", { n }, `${n} bots sumados.`);
  if (!r) return;
  bots.push(...r.bots);
  try { sessionStorage.setItem(`premortem:${sala}:bots`, JSON.stringify(bots)); } catch { /* */ }
  r.bots.forEach((b) => correrBot(b));
}
$("bots").addEventListener("click", () => sumarBots(+$("n-bots").value || 5));

/* ---------- después de la clase ---------- */

$("descargar").addEventListener("click", async () => {
  let agregado = null;
  try { agregado = (await pedir("estado", { sala })).agregado; } catch { /* */ }
  const anon = datos.alumnos.map((a, i) => ({
    codigo: `E${String(i + 1).padStart(2, "0")}`, via: a.via, bot: !!a.bot, casillas: a.casillas, enlaces: a.enlaces,
    probabilidad: a.prob, gravedad: a.grav, votos: a.votos || null, turnos: a.turnos,
    conversacion: a.mensajes.filter((m) => !m.sis).map((m) => ({ quien: m.r === "a" ? "entrevistador" : "estudiante", texto: m.t })),
  }));
  const blob = new Blob([JSON.stringify({ sala, fecha: new Date().toISOString().slice(0, 10), gasto: datos.sala.gasto, entrevistas: anon, agregado }, null, 1)], { type: "application/json" });
  const a = h("a", { href: URL.createObjectURL(blob), download: `premortem-${sala}-anonimo.json` });
  document.body.append(a); a.click(); a.remove();
});
$("anonimizar").addEventListener("click", () => {
  if (confirm("Se borran los nombres de esta sala en el servidor y los teléfonos pierden el acceso. No se puede deshacer. ¿Seguir?"))
    accion("anonimizar", {}, "Nombres borrados: quedan solo las respuestas anónimas.");
});

/* ---------- arranque ---------- */

async function refrescar() {
  if (!sala || !clave) return;
  try {
    datos = await pedir("profe", { sala, clave });
    $("entrada-clave").classList.add("oculto");
    $("panel").classList.remove("oculto");
    pintar();
  } catch (e) {
    if (e.status === 403) { clave = ""; guarda.poner("premortem:clave", ""); pedirClave(); }
    else if (e.status === 404) { $("panel").classList.remove("oculto"); avisar(`No existe la sala ${sala}. Abre una nueva.`, "mal"); sala = ""; }
    else avisar(e.message, "mal");
  }
}

async function arrancar() {
  if (!clave) return pedirClave();
  $("entrada-clave").classList.add("oculto");
  $("panel").classList.remove("oculto");
  const nBots = Math.min(40, Math.max(0, parseInt(q.get("bots") || "0", 10) || 0));
  if (!sala || (nBots && !codigoDeSala())) { if (!(await abrirSala())) return; }
  else {
    guarda.poner("premortem:ultima", sala);
    try { bots = JSON.parse(sessionStorage.getItem(`premortem:${sala}:bots`) || "[]"); } catch { bots = []; }
    await refrescar();
  }
  if (nBots && datos && !datos.alumnos.length) { $("n-bots").value = nBots; sumarBots(nBots); }
}
arrancar();
setInterval(() => { if (!document.hidden) refrescar(); }, 3000);
