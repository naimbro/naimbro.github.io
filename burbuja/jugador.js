/* LA BURBUJA — el teléfono del alumno.
   Lee el estado de la sala (lo escribe el navegador del profesor, un tic por
   segundo) y escribe un solo documento propio: dentro/fuera, si vuelve a entrar
   en el epílogo y si acertó cada voz. */
import { conectar, salaRef, jugadorRef, setDoc, onSnapshot } from "./fb.js";
import { VOCES, PERSONAS, MUNDOS, opciones } from "./contenido.js";
import { P, zona } from "./motor.js";

const $ = (id) => document.getElementById(id);
const q = new URLSearchParams(location.search);
const limpiar = (s) => (s || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
let sala = limpiar(q.get("s"));
const APP = "jugador" + (q.get("p") || "");
const plata = (x) => Math.round(x).toLocaleString("es-CL");

let db = null, uid = null, e = null;
let yo = { nombre: "", ronda: "", dentro: false, vuelve: false, resp: {} };
let elegidas = {};          // voz → persona que tocó (sólo para mostrarla)
let faseVista = null, claveVoz = null;

/* ---------- memoria local: recargar la página no saca a nadie del juego ---------- */
const llave = () => `burbuja:${sala}:${APP}`;
function recordar() {
  try { localStorage.setItem(llave(), JSON.stringify({ yo, elegidas })); localStorage.setItem("burbuja:nombre", yo.nombre); } catch (_) {}
}
function recuperar() {
  try {
    const g = JSON.parse(localStorage.getItem(llave()) || "null");
    if (g && g.yo && g.yo.nombre) { yo = g.yo; elegidas = g.elegidas || {}; return true; }
  } catch (_) {}
  return false;
}

/* ---------- escribir mi documento, de a una escritura a la vez ---------- */
let escribiendo = false, pendiente = false;
async function guardar() {
  recordar();
  if (!db || !e || !yo.ronda) return;
  if (escribiendo) { pendiente = true; return; }
  escribiendo = true;
  try {
    await setDoc(jugadorRef(db, sala, uid), { nombre: yo.nombre, ronda: yo.ronda, dentro: yo.dentro, vuelve: yo.vuelve, resp: yo.resp });
    aviso("");
  } catch (err) {
    console.error(err);
    aviso("No se pudo guardar. Revisa tu conexión.");
  }
  escribiendo = false;
  if (pendiente) { pendiente = false; guardar(); }
}
function aviso(t) { $("aviso").textContent = t; $("aviso").style.display = t ? "block" : "none"; }

/* ---------- entrar ---------- */
function mostrar(id) {
  for (const s of document.querySelectorAll("section")) s.classList.toggle("activa", s.id === id);
}
if (!sala) $("codigo").style.display = "block";
try { $("nombre").value = localStorage.getItem("burbuja:nombre") || ""; } catch (_) {}

async function entrar() {
  if (!sala) sala = limpiar($("codigo").value);
  const nombre = $("nombre").value.trim().slice(0, 24);
  if (!sala) { $("codigo").focus(); return; }
  if (!nombre) { $("nombre").focus(); return; }
  yo.nombre = nombre;
  $("entrar").disabled = true; $("entrar").textContent = "Entrando…";
  await empezar();
}
$("entrar").addEventListener("click", entrar);
$("nombre").addEventListener("keydown", (ev) => { if (ev.key === "Enter") entrar(); });

async function empezar() {
  try {
    ({ db, uid } = await conectar(APP));
  } catch (err) {
    console.error(err);
    $("entrar").disabled = false; $("entrar").textContent = "ENTRAR";
    aviso("No se pudo conectar. Revisa tu conexión y vuelve a intentar.");
    return;
  }
  $("saludo").textContent = "Listo, " + yo.nombre + ".";
  mostrar("s-espera");
  onSnapshot(salaRef(db, sala), (snap) => {
    e = snap.exists() ? snap.data() : null;
    if (e && e.ronda !== yo.ronda) {
      // partida nueva en la misma sala: parto de cero
      yo = { nombre: yo.nombre, ronda: e.ronda, dentro: false, vuelve: false, resp: {} };
      elegidas = {}; claveVoz = null;
      guardar();
    }
    pintar();
  }, (err) => { console.error(err); aviso("Se perdió la conexión con la sala."); });
}

// Si ya estaba jugando en esta sala (recarga), entra directo.
if (sala && recuperar()) empezar();

/* ---------- acciones ---------- */
$("palanca").addEventListener("click", () => {
  if (!e || e.fase !== "burbuja") return;
  yo.dentro = !yo.dentro;
  if (navigator.vibrate) navigator.vibrate(15);
  pintarPalanca();
  guardar();
});

function responder(i, persona) {
  if (!e || e.fase !== "burbuja" || !e.voz || e.voz.i !== i || e.voz.estado !== "abierta") return;
  if (yo.resp[i] !== undefined) return;
  yo.resp[i] = persona === VOCES[i].quien;
  elegidas[i] = persona;
  if (navigator.vibrate) navigator.vibrate(10);
  pintarVoz();
  guardar();
}

function decidir(vuelve) {
  if (!e || e.fase !== "decision") return;
  yo.vuelve = vuelve;
  yo._decidio = true;
  pintarDecision();
  guardar();
}
$("d-si").addEventListener("click", () => decidir(true));
$("d-no").addEventListener("click", () => decidir(false));

/* ---------- pintar ---------- */
function pintar() {
  if (!e) { $("esperando").textContent = "Esperando que el profesor abra la sala " + sala + "…"; mostrar("s-espera"); return; }
  const cambio = e.fase !== faseVista;
  faseVista = e.fase;
  const mia = e.riqueza && e.riqueza[uid] !== undefined ? e.riqueza[uid] : P.inicio;

  if (e.fase === "lobby") {
    $("esperando").textContent = "Mira el proyector. Parte en un momento.";
    mostrar("s-espera");
  } else if (e.fase === "burbuja") {
    if (cambio) mostrar("s-juego");
    $("j-nombre").textContent = yo.nombre;
    $("j-plata").textContent = plata(mia);
    $("j-precio").textContent = plata(e.precio);
    $("j-dentro").textContent = (e.dentroN || 0) + " de " + (e.n || 0);
    pintarPalanca(); pintarMedidor(); pintarVoz();
    chispa($("chispa"), e.hist, yo.dentro ? "#22c55e" : "#8a97ad");
  } else if (e.fase === "reventon") {
    if (cambio) {
      const quemado = (e.atrapados || []).includes(uid);
      yo.dentro = false; document.body.classList.remove("dentro");
      $("s-reventon").className = "centro " + (quemado ? "quemado" : "salvado");
      $("r-texto").textContent = quemado ? "Estabas dentro: perdiste 80%." : "Estabas fuera: te salvaste.";
      $("r-plata").textContent = "$" + plata(mia);
      mostrar("s-reventon");
      if (navigator.vibrate) navigator.vibrate(quemado ? [300, 100, 300, 100, 500] : 60);
    }
  } else if (e.fase === "decision") {
    if (cambio) {
      for (const m of ["aghion", "acemoglu"]) {
        const M = MUNDOS[m], per = PERSONAS[M.persona];
        $("d-" + m).style.borderLeftColor = per.color;
        $("d-" + m).innerHTML = `<b style="color:${per.color}">${per.nombre.toUpperCase()}</b>«${M.cita}»<br><span class="tenue">Si tiene razón, lo que metas se multiplica por ${String(P.mundo[m]).replace(".", ",")}.</span>`;
      }
      mostrar("s-decision");
    }
    $("d-plata").textContent = "$" + plata(mia);
    $("d-cuenta").textContent = Math.max(0, P.decisionSeg - (e.tf || 0));
    pintarDecision();
  } else if (e.fase === "futuro") {
    if (cambio) mostrar("s-futuro");
    const volvi = (e.vuelven || []).includes(uid);
    $("f-texto").textContent = volvi ? "Volviste a entrar. Tu plata sigue al precio." : "Te quedaste fuera. Tu plata no se mueve.";
    $("f-plata").textContent = "$" + plata(mia);
    chispa($("chispa2"), e.hist, volvi ? "#22c55e" : "#8a97ad");
  } else if (e.fase === "podio") {
    if (cambio) pintarPodio(mia);
  }
}

function pintarPalanca() {
  document.body.classList.toggle("dentro", yo.dentro);
  $("j-estado").textContent = yo.dentro ? "DENTRO" : "FUERA";
  $("palanca").innerHTML = yo.dentro
    ? "SALIR<small>te llevas lo que tienes</small>"
    : "ENTRAR<small>tu plata sube con el precio</small>";
}

function pintarMedidor() {
  const v = e.voz, m = $("medidor");
  const ultima = v ? (v.estado === "revelada" ? v.i : v.i - 1) : -1;
  if (ultima >= 0 && yo.resp[ultima] === true) {
    const ratio = e.precio / e.valor, z = zona(ratio);
    const txt = z === "verde" ? "Riesgo bajo" : z === "amarilla" ? "Riesgo medio" : "RIESGO ALTO";
    m.className = "medidor " + z;
    m.innerHTML = `<b>${txt}</b> · el precio es ${ratio.toFixed(1).replace(".", ",")} veces lo que vale<div class="barra"><i style="width:${Math.min(100, Math.max(4, ((ratio - 1) / 3) * 100))}%"></i></div>`;
  } else {
    m.className = "medidor cerrado";
    m.innerHTML = "🔒 Acierta la próxima voz para ver el riesgo";
  }
}

function pintarVoz() {
  const v = e.voz, caja = $("voz");
  if (!v) {
    if (claveVoz !== "nada") { claveVoz = "nada"; caja.innerHTML = `<div class="pregunta">ATENTO</div><div class="frase">Ya puedes entrar. En unos segundos habla la primera voz.</div>`; }
    return;
  }
  const clave = v.i + ":" + v.estado + ":" + yo.resp[v.i];
  if (clave === claveVoz) return;
  claveVoz = clave;
  const V = VOCES[v.i], per = PERSONAS[V.quien];
  if (v.estado === "abierta" && yo.resp[v.i] === undefined) {
    const quedan = Math.max(1, P.vozPrimera + v.i * P.vozCada + P.vozVentana - e.t);
    const [a, b] = opciones(v.i);
    caja.innerHTML = `<div class="pregunta">¿DE QUIÉN ES?</div><div class="frase">«${V.frase}»</div>
      <div class="reloj"><i style="animation-duration:${quedan}s"></i></div>
      <div class="opciones"><button data-p="${a}">${PERSONAS[a].nombre}</button><button data-p="${b}">${PERSONAS[b].nombre}</button></div>`;
    for (const btn of caja.querySelectorAll("button")) btn.addEventListener("click", () => responder(v.i, btn.dataset.p));
  } else if (v.estado === "abierta") {
    caja.innerHTML = `<div class="pregunta">¿DE QUIÉN ES?</div><div class="frase">«${V.frase}»</div>
      <div class="veredicto nada">Elegiste a ${PERSONAS[elegidas[v.i]] ? PERSONAS[elegidas[v.i]].nombre : "…"}. Ya se revela.</div>`;
  } else {
    const r = yo.resp[v.i];
    const ver = r === true ? `<div class="veredicto ok">✓ Acertaste: +$${P.bono} y ves el riesgo</div>`
      : r === false ? `<div class="veredicto mal">✗ No era ${PERSONAS[elegidas[v.i]] ? PERSONAS[elegidas[v.i]].nombre : "esa persona"}</div>`
      : `<div class="veredicto nada">No alcanzaste a responder</div>`;
    caja.innerHTML = `<div class="pregunta" style="color:${per.color}">${V.dir > 0 ? "▲ EMPUJA EL PRECIO" : "▼ FRENA EL PRECIO"}</div>
      <div class="frase">«${V.frase}»</div>
      <div class="autor" style="color:${per.color}">${per.nombre}<small>${per.rol}</small></div>${ver}`;
  }
}

function pintarDecision() {
  $("d-si").classList.toggle("elegido", yo._decidio === true && yo.vuelve === true);
  $("d-no").classList.toggle("elegido", yo._decidio === true && yo.vuelve === false);
}

function pintarPodio(mia) {
  const lugar = (e.rank || []).indexOf(uid) + 1, total = (e.rank || []).length;
  if (e.suave) {
    $("p-mundo").textContent = "No hubo burbuja";
    $("p-desenlace").textContent = "La sala no se atrevió a inflarla: el precio nunca se alejó del valor.";
    $("p-otro").textContent = "";
  } else {
    const M = MUNDOS[e.mundo], otro = MUNDOS[e.mundo === "aghion" ? "acemoglu" : "aghion"];
    $("p-mundo").textContent = "Salió e" + M.titulo.slice(1);
    $("p-mundo").style.color = PERSONAS[M.persona].color;
    $("p-desenlace").textContent = M.desenlace + " En la realidad, nadie lo sabe todavía.";
    const o = e.otro && e.otro[uid] !== undefined ? e.otro[uid] : mia;
    $("p-otro").textContent = (e.vuelven || []).includes(uid)
      ? `En e${otro.titulo.slice(1)} habrías terminado con $${plata(o)}.`
      : "Te quedaste fuera: habrías terminado igual en los dos mundos.";
  }
  $("p-plata").textContent = "$" + plata(mia);
  $("p-lugar").textContent = lugar ? `Lugar ${lugar} de ${total}` : "";
  const vistas = Math.min(VOCES.length, (e.puntuada ?? -1) + 1);
  let ok = 0, html = "";
  for (let i = 0; i < vistas; i++) {
    const V = VOCES[i], per = PERSONAS[V.quien], r = yo.resp[i];
    if (r === true) ok++;
    html += `<div class="${r === true ? "ok" : r === false ? "mal" : ""}">«${V.frase}»<b style="color:${per.color}">${r === true ? "✓" : r === false ? "✗" : "·"} ${per.nombre}, ${per.rol}</b></div>`;
  }
  // la otra competencia: mi lugar entre los que reconocieron más voces
  const ac = e.aciertos || {}, mios = ac[uid] || 0;
  const lugarVoces = 1 + Object.keys(ac).filter((u) => ac[u] > mios).length;
  $("p-voces").textContent = vistas ? `Reconociste ${ok} de ${vistas} voces · lugar ${lugarVoces} en voces` : "";
  $("p-repaso").innerHTML = html;
  mostrar("s-podio");
  window.scrollTo(0, 0);
}

function chispa(cv, hist, color) {
  if (!hist || hist.length < 2) return;
  const c = cv.getContext("2d"), W = cv.width, H = cv.height;
  c.clearRect(0, 0, W, H);
  const max = Math.max(...hist) * 1.05, min = Math.min(...hist) * 0.9;
  c.beginPath();
  hist.forEach((p, k) => {
    const x = (k / (hist.length - 1)) * (W - 8) + 4, y = H - 6 - ((p - min) / (max - min || 1)) * (H - 12);
    k ? c.lineTo(x, y) : c.moveTo(x, y);
  });
  c.strokeStyle = color; c.lineWidth = 4; c.lineJoin = "round"; c.stroke();
}
