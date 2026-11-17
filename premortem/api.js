/* PRE-MORTEM 2031 — lo común a las tres pantallas: dónde vive el servidor y cómo se le habla.
   En local (node functions/local.js) el servidor es el mismo origen; publicado, la Cloud Function.
   Se manda text/plain para que el navegador no haga preflight de CORS en cada llamada. */
const LOCAL = ["localhost", "127.0.0.1"].includes(location.hostname);
export const API = LOCAL ? "/api" : "https://us-central1-tribuna-csc00155.cloudfunctions.net/premortem";

export async function pedir(a, datos = {}) {
  let r;
  try {
    r = await fetch(API, { method: "POST", headers: { "content-type": "text/plain;charset=UTF-8" }, body: JSON.stringify({ a, ...datos }) });
  } catch { throw new Error("Sin conexión. Intenta de nuevo."); }
  let j;
  try { j = await r.json(); } catch { throw new Error("El servidor no respondió bien. Intenta de nuevo."); }
  if (!j.ok) { const e = new Error(j.error || "Algo falló."); e.status = j.status; throw e; }
  return j;
}

export const q = new URLSearchParams(location.search);
export const $ = (id) => document.getElementById(id);
export const VIAS = { 1: "La IA se sale de control", 2: "Gente mala la usa", 3: "Nadie lo quiere, pero pasa" };
export const CASILLAS = [
  ["titular", "Titular"], ["disparador", "Disparador"], ["cadena", "Cadena"],
  ["reparto", "Quién pagó y ganó"], ["senal", "Señal temprana"], ["evidencia", "Evidencia"],
];

/** Crea un elemento: h("div", {class: "x", onclick: f}, "texto", otroNodo…). El texto nunca pasa por innerHTML. */
export function h(tag, attrs = {}, ...hijos) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (k === "class") el.className = v;
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const c of hijos.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
  return el;
}

export const codigoDeSala = () => (q.get("s") || "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4);
export const urlJugar = (codigo) => new URL(`jugar.html?s=${codigo}`, location.href).href;
export const mmss = (ms) => { const s = Math.max(0, Math.round(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
