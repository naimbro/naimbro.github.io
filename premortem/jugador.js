/* PRE-MORTEM 2031 — teléfono del estudiante.
   jugar.html?s=ABCD   → entra a la sala ABCD
   El estado vive en el servidor: si se recarga la página o se cambia de pestaña para
   investigar, se retoma donde iba (id y token quedan en localStorage; el borrador también). */
import { pedir, q, $, h, VIAS, codigoDeSala } from "./api.js";

const PANTALLAS = ["p-entrada", "p-chat", "p-resumen", "p-desliza", "p-listo"];
const mostrar = (id) => PANTALLAS.forEach((p) => $(p).classList.toggle("oculto", p !== id));

let sala = codigoDeSala();
let cred = null;          // {id, token}
let yo = null;            // última vista del servidor
let enviando = false;
let desfase = 0;          // reloj del servidor − reloj del teléfono
let corrigiendo = false;
let votoLocal = { probable: null, serio: null };

const llave = () => `premortem:${sala}`;
const guardarCred = () => { try { localStorage.setItem(llave(), JSON.stringify(cred)); } catch { /* modo privado */ } };
const leerCred = () => { try { return JSON.parse(localStorage.getItem(llave()) || "null"); } catch { return null; } };
const borrador = {
  leer: () => { try { return localStorage.getItem(llave() + ":borrador") || ""; } catch { return ""; } },
  poner: (t) => { try { localStorage.setItem(llave() + ":borrador", t); } catch { /* */ } },
};

/* ---------- entrada ---------- */

async function entrar(via) {
  const err = $("error-entrada");
  err.textContent = "";
  sala = $("codigo").value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4);
  const nombre = $("nombre").value.trim();
  if (sala.length !== 4) { err.textContent = "El código de la sala tiene 4 letras."; return; }
  if (!nombre) { err.textContent = "Escribe tu grupo y tu nombre, por ejemplo «G3 Ana»."; return; }
  $("entrar").disabled = true;
  try {
    const r = await pedir("entrar", { sala, nombre, via });
    if (r.elegir) { $("vias").classList.remove("oculto"); $("entrar").classList.add("oculto"); return; }
    cred = { id: r.yo.id, token: r.token };
    guardarCred();
    history.replaceState(null, "", `?s=${sala}`);
    pintar(r.yo);
  } catch (e) { err.textContent = e.message; }
  finally { $("entrar").disabled = false; }
}

$("entrar").addEventListener("click", () => entrar());
$("nombre").addEventListener("keydown", (e) => { if (e.key === "Enter") entrar(); });
$("vias").addEventListener("click", (e) => { const b = e.target.closest("button[data-via]"); if (b) entrar(+b.dataset.via); });

/* ---------- pintar según el estado ---------- */

function pintar(v) {
  yo = v;
  desfase = v.ahora - Date.now();
  document.body.className = `via${v.via}`;
  const cerrada = v.sala.fase !== "abierta";
  if (v.estado === "chat" && !cerrada) { mostrar("p-chat"); pintarChat(); }
  else if (v.estado === "resumen" && !cerrada) { mostrar("p-resumen"); pintarResumen(); }
  else if (v.estado !== "listo") { mostrar("p-desliza"); $("cerrada-nota").classList.toggle("oculto", !(cerrada && v.estado === "chat")); }
  else { mostrar("p-listo"); pintarVoto(); }
}

let pintados = 0;
function pintarChat() {
  $("chip-via").textContent = `Vía ${yo.via}`;
  $("chip-via").title = VIAS[yo.via];
  const p = $("puntos");
  p.replaceChildren(...Array.from({ length: 6 }, (_, i) => h("i", { class: i < yo.llenas ? "ok" : "" })));
  const hilo = $("hilo");
  if (yo.mensajes.length < pintados) { hilo.replaceChildren(); pintados = 0; }
  hilo.querySelectorAll(".provisorio").forEach((n) => n.remove());
  for (const m of yo.mensajes.slice(pintados)) hilo.append(h("div", { class: `msg ${m.r}` }, m.t));
  if (yo.mensajes.length !== pintados) { pintados = yo.mensajes.length; hilo.scrollTop = hilo.scrollHeight; }
  $("pegar").classList.toggle("pide", !!yo.pideEnlace);
  pintarAviso();
}

function pintarAviso() {
  if (!yo || yo.estado !== "chat") return;
  const queda = yo.finEn - (Date.now() + desfase);
  const reloj = $("reloj");
  const s = Math.max(0, Math.round(queda / 1000));
  reloj.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  reloj.classList.toggle("poco", queda <= 120000);
  const aviso = yo.sala.aviso || queda <= 120000;
  $("aviso").classList.toggle("oculto", !aviso);
  if (aviso) $("aviso-texto").textContent = queda <= 0 ? "Se acabó el tiempo." : yo.sala.aviso ? "Quedan 2 minutos: después de tu próxima respuesta viene el cierre." : "Quedan menos de 2 minutos.";
}
setInterval(pintarAviso, 1000);

function pintarResumen() {
  $("lineas").replaceChildren(...yo.resumen.map((l) => h("li", {}, l.replace(/^\s*\d\s*[.)]\s*/, "").replace(/^(titular|disparador|cadena|quién pagó y quién ganó|señal temprana y evidencia)\s*:\s*/i, ""))));
  if (!corrigiendo) { $("corregir-caja").classList.add("oculto"); $("corregir").textContent = "Corregir"; $("confirmar").textContent = "Está bien"; }
}

function pintarVoto() {
  const abierta = yo.sala.votacion && yo.sala.grupos.length;
  $("espera").classList.toggle("oculto", !!abierta);
  $("voto").classList.toggle("oculto", !abierta);
  if (!abierta) return;
  if (yo.votos && !votoLocal.probable) votoLocal = { ...yo.votos };
  for (const preg of ["probable", "serio"]) {
    const caja = $(`opc-${preg}`);
    if (caja.childElementCount === yo.sala.grupos.length) {
      caja.querySelectorAll(".opc").forEach((o) => o.classList.toggle("sel", o.dataset.id === votoLocal[preg]));
      continue;
    }
    caja.replaceChildren(...yo.sala.grupos.map((g) => {
      const radio = h("input", { type: "radio", name: preg, value: g.id, checked: votoLocal[preg] === g.id });
      const fila = h("label", { class: `opc via${g.via}${votoLocal[preg] === g.id ? " sel" : ""}`, "data-id": g.id }, radio, h("span", {}, g.nombre));
      radio.addEventListener("change", () => { votoLocal[preg] = g.id; pintarVoto(); $("mandar-voto").textContent = "Votar"; });
      return fila;
    }));
  }
  if (yo.votos && yo.votos.probable === votoLocal.probable && yo.votos.serio === votoLocal.serio) $("mandar-voto").textContent = "Voto enviado ✓ (puedes cambiarlo)";
}

/* ---------- chat ---------- */

const texto = $("texto");
function ajustarAlto() { texto.style.height = "auto"; texto.style.height = Math.min(texto.scrollHeight + 2, window.innerHeight * 0.34) + "px"; }
texto.addEventListener("input", () => { ajustarAlto(); borrador.poner(texto.value); });

async function enviar() {
  const t = texto.value.trim();
  if (!t || enviando || !yo || yo.estado !== "chat") return;
  enviando = true;
  $("enviar").disabled = true;
  $("nota").textContent = "";
  const hilo = $("hilo");
  hilo.append(h("div", { class: "msg u provisorio" }, t), h("div", { class: "msg a espera provisorio" }, "···"));
  hilo.scrollTop = hilo.scrollHeight;
  texto.value = ""; ajustarAlto();
  try {
    const r = await pedir("turno", { sala, ...cred, texto: t });
    borrador.poner("");
    pintar(r.yo);
  } catch (e) {
    hilo.querySelectorAll(".provisorio").forEach((n) => n.remove());
    texto.value = t; ajustarAlto();
    $("nota").textContent = `${e.message} Tu respuesta sigue en el cuadro.`;
  } finally {
    enviando = false;
    $("enviar").disabled = false;
  }
}
$("enviar").addEventListener("click", enviar);

$("pegar").addEventListener("click", async () => {
  try {
    const t = (await navigator.clipboard.readText()).trim();
    if (!t) throw new Error("vacío");
    texto.value = (texto.value ? texto.value.trimEnd() + " " : "") + t;
    borrador.poner(texto.value);
    $("nota").textContent = "Enlace pegado. Agrega qué muestra, o envíalo así.";
  } catch {
    $("nota").textContent = "Mantén presionado el cuadro de texto y elige «Pegar».";
  }
  texto.focus(); ajustarAlto();
});

$("cerrar-ya").addEventListener("click", async () => {
  if (enviando) return;
  enviando = true; $("cerrar-ya").disabled = true;
  $("hilo").append(h("div", { class: "msg a espera provisorio" }, "···"));
  try { pintar((await pedir("cierre", { sala, ...cred })).yo); }
  catch (e) { $("nota").textContent = e.message; }
  finally { enviando = false; $("cerrar-ya").disabled = false; }
});

/* ---------- resumen ---------- */

async function mandarResumen(correccion) {
  const err = $("error-resumen");
  err.textContent = "";
  $("confirmar").disabled = $("corregir").disabled = true;
  try {
    const r = await pedir("resumen", { sala, ...cred, correccion });
    corrigiendo = false; $("correccion").value = "";
    pintar(r.yo);
  } catch (e) { err.textContent = e.message; }
  finally { $("confirmar").disabled = $("corregir").disabled = false; }
}
$("corregir").addEventListener("click", () => {
  if (!corrigiendo) {
    corrigiendo = true;
    $("corregir-caja").classList.remove("oculto");
    $("corregir").textContent = "Cancelar"; $("confirmar").textContent = "Enviar corrección";
    $("correccion").focus();
  } else { corrigiendo = false; pintarResumen(); }
});
$("confirmar").addEventListener("click", () => {
  if (corrigiendo) {
    const c = $("correccion").value.trim();
    if (!c) { $("error-resumen").textContent = "Escribe qué hay que corregir."; return; }
    $("confirmar").textContent = "Reescribiendo…";
    mandarResumen(c);
  } else mandarResumen("");
});

/* ---------- deslizadores y voto ---------- */

$("prob").addEventListener("input", (e) => { $("v-prob").textContent = e.target.value; });
$("grav").addEventListener("input", (e) => { $("v-grav").textContent = e.target.value; });
$("mandar-desliza").addEventListener("click", async () => {
  $("mandar-desliza").disabled = true; $("error-desliza").textContent = "";
  try { pintar((await pedir("deslizadores", { sala, ...cred, prob: +$("prob").value, grav: +$("grav").value })).yo); }
  catch (e) { $("error-desliza").textContent = e.message; }
  finally { $("mandar-desliza").disabled = false; }
});

$("mandar-voto").addEventListener("click", async () => {
  const err = $("error-voto");
  err.textContent = "";
  if (!votoLocal.probable || !votoLocal.serio) { err.textContent = "Elige una opción en cada pregunta."; return; }
  $("mandar-voto").disabled = true;
  try { pintar((await pedir("votar", { sala, ...cred, ...votoLocal })).yo); }
  catch (e) { err.textContent = e.message; }
  finally { $("mandar-voto").disabled = false; }
});

/* ---------- arranque y sondeo ---------- */

async function refrescar() {
  if (!cred || enviando || document.hidden) return;
  try {
    const r = await pedir("mio", { sala, ...cred });
    if (!enviando) pintar(r.yo);
  } catch (e) {
    if (e.status === 403 || e.status === 404) { cred = null; try { localStorage.removeItem(llave()); } catch { /* */ } mostrar("p-entrada"); }
  }
}
setInterval(refrescar, 4000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) refrescar(); });

(async () => {
  $("codigo").value = sala;
  cred = sala ? leerCred() : null;
  if (cred) {
    try {
      const r = await pedir("mio", { sala, ...cred });
      texto.value = borrador.leer();
      pintar(r.yo);
      ajustarAlto();
      $("hilo").scrollTop = $("hilo").scrollHeight;
      return;
    } catch { cred = null; }
  }
  mostrar("p-entrada");
  (sala ? $("nombre") : $("codigo")).focus();
})();
