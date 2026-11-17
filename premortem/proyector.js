/* PRE-MORTEM 2031 — proyector.
   index.html?s=ABCD → muestra la sala ABCD: QR y avance mientras se entrevista (sin texto de
   nadie), y después la visualización, en la sección que el profesor elija desde profe.html.
   Si este navegador ya tiene la clave del profesor, las flechas ← → también cambian de sección. */
import { pedir, $, h, VIAS, codigoDeSala, urlJugar, mmss } from "./api.js";
import { dibujar, SECCIONES } from "./viz.js";

const sala = codigoDeSala();
const lienzo = $("lienzo");
let ultimo = null, llaveViz = "", qrHecho = false;

/* la secuencia completa de pantallas, para navegar con flechas */
export const PASOS = [{ seccion: "lobby", paso: 0, titulo: "Sala" }];
for (const s of SECCIONES) for (let p = 0; p < s.pasos; p++) PASOS.push({ seccion: s.id, paso: p, titulo: s.titulo });

function sinSala() {
  const campo = h("input", { maxlength: 4, placeholder: "ABCD", autofocus: true });
  campo.addEventListener("keydown", (e) => { if (e.key === "Enter") location.search = "?s=" + campo.value; });
  lienzo.replaceChildren(h("div", { class: "grande" },
    h("h1", {}, "¿Qué sala se proyecta?"), campo,
    h("p", {}, "Escribe el código y Enter. La sala se abre desde la página del profesor (profe.html).")));
}

function pintarSala(e) {
  let raiz = lienzo.querySelector(".sala");
  if (!raiz) {
    lienzo.replaceChildren(h("div", { class: "sala" },
      h("div", { class: "izq" },
        h("h2", {}, "Entra con tu teléfono"),
        h("div", { id: "qr" }),
        h("div", { class: "url", id: "url" }),
        h("div", { class: "formato" }, "Escribe tu grupo y tu nombre: «G3 Ana»")),
      h("div", { class: "der", id: "der" })));
    raiz = lienzo.querySelector(".sala");
    qrHecho = false;
  }
  if (!qrHecho) {
    const url = urlJugar(sala);
    if (window.QRCode) new window.QRCode($("qr"), { text: url, width: 640, height: 640, correctLevel: window.QRCode.CorrectLevel.M });
    else $("qr").textContent = url;
    const corta = url.replace(/^https?:\/\//, "").replace(/\?s=.*/, "");
    $("url").replaceChildren(corta + "  ·  código ", h("b", {}, sala));
    qrHecho = true;
  }
  const als = e.alumnos;
  const total = als.length * 6, hechas = als.reduce((s, a) => s + Math.min(6, a.llenas || 0), 0);
  const listos = als.filter((a) => a.estado === "listo").length;
  const cierre = als.filter((a) => a.estado === "resumen" || a.estado === "deslizadores").length;
  const filas = [1, 2, 3].map((v) => {
    const xs = als.filter((a) => a.via === v);
    return h("div", { class: `via-fila via${v}` },
      h("div", { class: "via-n" }, xs.length),
      h("div", {},
        h("div", { class: "via-nombre" }, `Vía ${v} · ${VIAS[v]}`),
        h("div", { class: "pastillas" }, xs.map((a) => h("span", { class: `pastilla${a.estado === "listo" ? " listo" : ""}` }, h("i", { style: `width:${Math.round((Math.min(6, a.llenas || 0) / 6) * 100)}%` }))))));
  });
  const cerrada = e.sala.fase !== "abierta";
  $("der").replaceChildren(
    h("h1", {}, "Es 2031 y la IA causó un desastre en Chile. ¿Qué pasó?"),
    ...filas,
    h("div", { class: "avance" },
      h("div", { class: "rotulo" }, h("span", {}, "Avance de la sala"), h("span", {}, total ? `${hechas} de ${total} casillas` : "esperando a la sala")),
      h("div", { class: "riel" }, h("i", { style: `width:${total ? Math.round((hechas / total) * 100) : 0}%` }))),
    h("div", { class: `estado-linea${e.sala.agregando ? " pulso" : ""}` },
      e.sala.agregando ? "Ordenando las entrevistas de la sala…"
        : cerrada ? `Sala cerrada · ${als.length} entrevistas`
        : als.length ? `${als.length - listos - cierre} conversando · ${cierre} en el cierre · ${listos} listos` : "Cada pastilla es una persona; se llena con las seis casillas de su escenario."));
}

function pintar(e) {
  ultimo = e;
  const v = e.sala.vista || { seccion: "lobby", paso: 0 };
  const ag = e.agregado;
  $("cab-codigo").textContent = sala;
  $("cab-n").textContent = `${e.alumnos.length} en la sala`;
  $("cab-reloj").textContent = e.sala.inicio && e.sala.fase === "abierta" ? mmss(e.sala.ahora - e.sala.inicio) : "";
  $("cinta").classList.toggle("oculto", !(e.sala.aviso && e.sala.fase === "abierta"));
  if (v.seccion === "lobby" || !ag) {
    llaveViz = "";
    $("cab-seccion").textContent = "";
    lienzo.querySelector(".sala") || lienzo.replaceChildren();
    return pintarSala(e);
  }
  const seccion = ag.estado === "sin_ia" ? "sinia" : v.seccion;
  const llave = JSON.stringify([seccion, v.paso, ag.generado, ag.estado, (ag.provocaciones || []).length, seccion === "votacion" ? e.votacion : 0]);
  if (llave === llaveViz) return;
  llaveViz = llave;
  const i = PASOS.findIndex((p) => p.seccion === v.seccion && p.paso === v.paso);
  $("cab-seccion").textContent = i > 0 ? `${i} / ${PASOS.length - 1}` : "";
  dibujar(lienzo, seccion, v.paso, ag, e.votacion);
}

async function refrescar() {
  try { pintar(await pedir("estado", { sala })); }
  catch (e) {
    if (e.status === 404) lienzo.replaceChildren(h("div", { class: "grande" }, h("h1", {}, `No existe la sala ${sala}`), h("p", {}, "Ábrela desde la página del profesor.")));
    else console.error("[proyector]", e);   // sin conexión o un error al pintar: se reintenta en el próximo sondeo
  }
}

// flechas: solo si este navegador guarda la clave del profesor
addEventListener("keydown", async (ev) => {
  if (!ultimo || !["ArrowRight", "ArrowLeft", "PageDown", "PageUp"].includes(ev.key)) return;
  let clave = "";
  try { clave = localStorage.getItem("premortem:clave") || ""; } catch { /* */ }
  if (!clave || !ultimo.agregado) return;
  const v = ultimo.sala.vista || { seccion: "lobby", paso: 0 };
  const i = Math.max(0, PASOS.findIndex((p) => p.seccion === v.seccion && p.paso === v.paso));
  const j = Math.min(PASOS.length - 1, Math.max(0, i + (ev.key === "ArrowRight" || ev.key === "PageDown" ? 1 : -1)));
  if (j === i) return;
  try { await pedir("vista", { sala, clave, seccion: PASOS[j].seccion, paso: PASOS[j].paso }); refrescar(); } catch { /* sin clave válida: nada */ }
});

if (!sala) sinSala();
else { refrescar(); setInterval(refrescar, 2500); }
