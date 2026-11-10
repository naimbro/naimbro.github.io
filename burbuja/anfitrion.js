/* LA BURBUJA — la pantalla del proyector, que además es el motor de la partida.
   Este navegador hace avanzar el juego un tic por segundo (motor.js), escribe el
   estado en Firestore para los teléfonos y dibuja la burbuja. Si se recarga la
   página, retoma la partida donde iba.

   index.html            → abre una sala con código al azar
   index.html?s=MGT12    → abre (o retoma) la sala MGT12
   index.html?bots=20    → suma 20 alumnos simulados, para ensayar solo */
import { conectar, salaRef, jugadoresRef, getDoc, setDoc, onSnapshot } from "./fb.js";
import { VOCES, PERSONAS, MUNDOS, opciones } from "./contenido.js";
import { P, nuevaPartida, tick, terminar, crearBots, moverBots } from "./motor.js";

const $ = (id) => document.getElementById(id);
const q = new URLSearchParams(location.search);
const limpiar = (s) => (s || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
const codigoAlAzar = () => Array.from({ length: 4 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.floor(Math.random() * 24)]).join("");
const rid = () => Math.random().toString(36).slice(2, 10);
const plata = (x) => Math.round(x).toLocaleString("es-CL");
const acota = (x, a, b) => Math.max(a, Math.min(b, x));

let sala = limpiar(q.get("s"));
if (!sala) { sala = codigoAlAzar(); q.set("s", sala); history.replaceState(null, "", "?" + q.toString()); }
const N_BOTS = acota(parseInt(q.get("bots") || "0", 10) || 0, 0, 60);

let db = null, uid = null, ref = null;
let e = null;               // el estado de la partida (motor.js)
let todos = {};             // documentos de alumnos, de cualquier partida de esta sala
let bots = {};
let ultimo = 0, sonido = true, seccion = null, claveVoz = null;

function presentes() {
  const J = {};
  for (const u in todos) if (todos[u].ronda === e.ronda) J[u] = todos[u];
  for (const u in bots) J[u] = bots[u];
  return J;
}

/* Una sola escritura en vuelo a la vez. Si la red va lenta, los tics que quedan en el
   medio se saltan y se manda sólo el estado más reciente: los teléfonos nunca quedan
   más atrasados que lo que demora una escritura. */
let fallas = 0, enVuelo = false, hayNuevo = false;
function escribir() {
  if (enVuelo) { hayNuevo = true; return Promise.resolve(); }
  enVuelo = true;
  return setDoc(ref, JSON.parse(JSON.stringify(e)))
    .then(() => { fallas = 0; avisar(""); })
    .catch((err) => {
      console.error("No se pudo escribir el estado", err);
      window.burbujaError = String(err && err.message || err);
      if (++fallas >= 3) avisar("Sin conexión con los teléfonos. Revisa la red.");
    })
    .finally(() => { enVuelo = false; if (hayNuevo) { hayNuevo = false; escribir(); } });
}
function avisar(t) {
  let a = $("aviso");
  if (!a) {
    a = document.createElement("div"); a.id = "aviso";
    a.style.cssText = "position:fixed;left:50%;bottom:2vh;transform:translateX(-50%);background:#7f1d1d;color:#fff;padding:1vh 2vw;border-radius:1vh;font-size:2.4vh;z-index:9;display:none";
    document.body.appendChild(a);
  }
  a.textContent = t; a.style.display = t ? "block" : "none";
}
window.burbuja = { get estado() { return e; }, get presentes() { return e ? presentes() : {}; } };   // para depurar desde la consola

/* ---------------- arranque ---------------- */
async function iniciar() {
  ({ db, uid } = await conectar("anfitrion"));
  ref = salaRef(db, sala);
  const snap = await getDoc(ref);
  if (snap.exists() && snap.data().hostUid !== uid) {
    $("ocupada-codigo").textContent = sala;
    mostrar("ocupada");
    return;
  }
  e = snap.exists() ? snap.data() : nuevaPartida(rid());
  e.hostUid = uid; e.codigo = sala;
  if (!snap.exists()) await escribir();
  if (N_BOTS) bots = crearBots(N_BOTS);

  onSnapshot(jugadoresRef(db, sala), (s) => {
    s.docChanges().forEach((c) => { todos[c.doc.id] = c.doc.data(); });
    if (e.fase === "lobby") pintarLobby();
  });

  const url = new URL("jugar.html?s=" + sala, location.href).href;
  $("url-codigo").textContent = sala;
  if (window.QRCode) new window.QRCode($("qr"), { text: url, width: 512, height: 512, correctLevel: window.QRCode.CorrectLevel.M });
  else $("qr").textContent = url;

  ultimo = performance.now();
  setInterval(latidoMotor, 200);
  requestAnimationFrame(cuadro);
  programarLatido();
  pintar();
}
$("otra-sala").addEventListener("click", () => { location.search = "?s=" + codigoAlAzar(); });

/* ---------------- el motor: un tic por segundo ---------------- */
function latidoMotor() {
  if (!e || e.fase === "lobby" || e.fase === "podio") { ultimo = performance.now(); return; }
  const ahora = performance.now();
  let n = Math.floor((ahora - ultimo) / 1000);
  if (n < 1) return;
  if (n > 3) { n = 3; ultimo = ahora; } else ultimo += n * 1000;   // pestaña dormida: no recupera más de 3 s
  for (let k = 0; k < n; k++) paso();
}

function paso() {
  moverBots(bots, e);
  const ev = tick(e, presentes());
  escribir();
  sucesos(ev);
  pintar();
}

function empezar() {
  if (!e || e.fase !== "lobby") return;
  audio();
  tick(e, presentes());
  e.fase = "burbuja";
  ultimo = performance.now();
  escribir();
  pintar();
}
$("empezar").addEventListener("click", empezar);
document.addEventListener("keydown", (ev) => {
  if ((ev.code === "Space" || ev.code === "Enter") && e && e.fase === "lobby") { ev.preventDefault(); empezar(); }
});

$("saltar").addEventListener("click", () => {
  if (!e || e.fase === "podio" || e.fase === "lobby") return;
  tick(e, presentes()); terminar(e); escribir(); pintar();
});
$("nueva").addEventListener("click", () => {
  e = nuevaPartida(rid()); e.hostUid = uid; e.codigo = sala;
  bots = N_BOTS ? crearBots(N_BOTS) : {};
  for (const u in part) delete part[u];
  Rv = 0; estallido = null; claveVoz = null;
  escribir(); pintar();
});
$("sonido").addEventListener("click", () => {
  sonido = !sonido; $("sonido").textContent = sonido ? "🔊 Sonido" : "🔇 Sin sonido"; if (sonido) audio();
});

/* ---------------- pintar ---------------- */
function mostrar(id) {
  if (seccion === id) return false;
  seccion = id;
  for (const s of document.querySelectorAll("section")) s.classList.toggle("activa", s.id === id);
  return true;
}

function pintar() {
  if (!e) return;
  if (e.fase === "lobby") { mostrar("lobby"); pintarLobby(); }
  else if (e.fase === "burbuja" || e.fase === "reventon") { if (mostrar("juego")) ajustar(); pintarJuego(); }
  else if (e.fase === "decision" || e.fase === "futuro") { mostrar("epilogo"); pintarEpilogo(); }
  else if (e.fase === "podio") { if (mostrar("podio")) pintarPodio(); }
}

function pintarLobby() {
  const J = presentes(), nombres = Object.values(J).map((j) => j.nombre);
  $("sala-cuenta").textContent = nombres.length ? `${nombres.length} en la sala` : "Escanea el código para entrar";
  $("sala-nombres").innerHTML = nombres.map((n) => `<span class="chip">${esc(n)}</span>`).join("");
}
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function pintarJuego() {
  $("precio").textContent = plata(e.precio);
  $("cuantos").innerHTML = `<b>${e.dentroN}</b> dentro · ${e.n - e.dentroN} fuera`;
  const revento = e.fase === "reventon";
  $("cartel").classList.toggle("visible", revento);
  if (revento) {
    $("cartel-texto").textContent = e.atrapados.length
      ? `${e.atrapados.length} de ${e.n} estaban dentro y perdieron 80%: lo que cayó Cisco después de 2000.`
      : "No había nadie dentro. El precio cayó 80%: lo que cayó Cisco después de 2000.";
  }
  pintarVoz();
  linea($("grafico"), e.hist, "#38bdf8");
}

function pintarVoz() {
  const v = e.voz, caja = $("voz");
  const clave = v ? `${v.i}:${v.estado}:${e.pct[v.i]}` : "nada";
  if (clave === claveVoz) return;
  claveVoz = clave;
  if (!v) {
    caja.innerHTML = `<div class="pregunta">ATENTOS</div><div class="frase">Ya pueden entrar. En unos segundos habla la primera voz.</div>
      <div class="pie" style="margin-top:auto">Quien sepa de quién es, verá el riesgo en su teléfono.</div>`;
  } else {
    const V = VOCES[v.i], per = PERSONAS[V.quien];
    if (v.estado === "abierta") {
      const quedan = Math.max(1, P.vozPrimera + v.i * P.vozCada + P.vozVentana - e.t);
      const [a, b] = opciones(v.i);
      caja.innerHTML = `<div class="pregunta">¿DE QUIÉN ES? · RESPONDE EN TU TELÉFONO</div><div class="frase">«${V.frase}»</div>
        <div class="reloj"><i style="animation-duration:${quedan}s"></i></div>
        <div class="ops"><span>${PERSONAS[a].nombre}</span><span>${PERSONAS[b].nombre}</span></div>`;
    } else {
      const pct = e.pct[v.i];
      caja.innerHTML = `<div class="pregunta" style="color:${per.color}">${V.dir > 0 ? "▲ EMPUJA EL PRECIO" : "▼ FRENA EL PRECIO"}</div>
        <div class="frase">«${V.frase}»</div>
        <div class="autor" style="color:${per.color}">${per.nombre}<small>${per.rol} · ${V.fuente}</small></div>
        <div class="pie">${pct >= 0 ? pct + "% de la sala acertó" : "&nbsp;"}</div>`;
    }
  }
  // historial: las voces ya reveladas, la más reciente arriba
  const hasta = v ? (v.estado === "revelada" ? v.i - 1 : v.i - 1) : -1;
  let html = "";
  for (let i = hasta; i >= 0 && i > hasta - 5; i--) {
    const V = VOCES[i], per = PERSONAS[V.quien];
    html += `<div style="border-color:${per.color}"><b style="color:${per.color}">${per.nombre}</b> «${V.frase}»</div>`;
  }
  $("historial").innerHTML = html;
}

function pintarEpilogo() {
  for (const m of ["aghion", "acemoglu"]) {
    const M = MUNDOS[m], per = PERSONAS[M.persona], caja = $("m-" + m);
    if (!caja.dataset.listo) {
      caja.dataset.listo = "1";
      caja.style.borderTopColor = per.color;
      caja.innerHTML = `<div class="quien" style="color:${per.color}">${per.nombre}</div><div class="cita">«${M.cita}»</div>
        <div class="pista">${M.pista}</div><div class="mult">Si tiene razón: lo que metas se multiplica por ${String(P.mundo[m]).replace(".", ",")}</div>`;
    }
    const revelado = e.fase === "futuro" && e.tf >= P.futuroSeg * 0.6;
    caja.classList.toggle("gano", revelado && e.mundo === m);
    caja.classList.toggle("apagado", revelado && e.mundo !== m);
  }
  if (e.fase === "decision") {
    $("ep-titulo").textContent = "DIEZ AÑOS DESPUÉS";
    $("ep-sub").textContent = "El precio quedó en el suelo. Nadie sabe en cuál de los dos mundos estamos. ¿Vuelves a entrar?";
    $("cuenta").textContent = Math.max(0, P.decisionSeg - e.tf);
    $("vuelven").textContent = `${e.vuelveN} de ${e.n} vuelven a entrar`;
  } else {
    $("ep-titulo").textContent = "DIEZ AÑOS EN DOCE SEGUNDOS";
    $("ep-sub").textContent = `El mercado cerró: ${e.vuelven.length} de ${e.n} volvieron a entrar.`;
    $("cuenta").textContent = plata(e.precio);
    $("vuelven").textContent = "precio";
  }
  linea($("futuro-lienzo"), e.hist, e.fase === "futuro" ? "#f59e0b" : "#38bdf8");
}

function pintarPodio() {
  const nom = (u) => esc(e.nombres[u] || "—");
  if (e.suave) {
    $("po-mundo").textContent = "No hubo burbuja";
    $("po-mundo").style.color = "";
    $("desenlace").textContent = "La sala no se atrevió a inflarla: el precio nunca se alejó del valor.";
  } else if (e.mundo) {
    const M = MUNDOS[e.mundo];
    $("po-mundo").textContent = "Salió e" + M.titulo.slice(1);
    $("po-mundo").style.color = PERSONAS[M.persona].color;
    $("desenlace").textContent = M.desenlace + " En la realidad, nadie lo sabe todavía.";
  } else {
    $("po-mundo").textContent = "Partida terminada";
    $("po-mundo").style.color = "";
    $("desenlace").textContent = "";
  }
  $("po-lugares").innerHTML = e.rank.slice(0, 5).map((u, k) =>
    `<div class="lugar"><span class="n">${k + 1}</span><span>${nom(u)}</span><span class="p">$${plata(e.riqueza[u])}</span></div>`).join("");
  const pr = e.premios || {}, cajas = [];
  if (pr.casandra) cajas.push(`<div class="premio"><b>PREMIO CASANDRA</b>${nom(pr.casandra.uid)} fue quien salió primero, en el segundo ${pr.casandra.seg}. «Me equivoqué al decir vende», escribió Burry en 2023.</div>`);
  if (pr.cisco) cajas.push(`<div class="premio"><b>PREMIO CISCO</b>${nom(pr.cisco.uid)} perdió $${plata(pr.cisco.perdio)} en un segundo.</div>`);
  if (pr.noJugar && pr.noJugar.length) {
    const lista = pr.noJugar.slice(0, 4).map(nom).join(", ") + (pr.noJugar.length > 4 ? ` y ${pr.noJugar.length - 4} más` : "");
    cajas.push(`<div class="premio"><b>«LA ÚNICA JUGADA GANADORA ES NO JUGAR»</b>${lista}: nunca ${pr.noJugar.length > 1 ? "entraron" : "entró"}.</div>`);
  }
  if (pr.oido) cajas.push(`<div class="premio"><b>OÍDO FINO</b>${nom(pr.oido.uid)} reconoció ${pr.oido.n} ${pr.oido.n === 1 ? "voz" : "voces"}.</div>`);
  $("po-premios").innerHTML = cajas.join("");
  const vistas = Math.min(VOCES.length, (e.puntuada ?? -1) + 1);
  let html = "";
  for (let i = 0; i < vistas; i++) {
    const V = VOCES[i], per = PERSONAS[V.quien], pct = e.pct[i];
    html += `<div><span class="pc" style="color:${pct >= 70 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#ef4444"}">${pct >= 0 ? pct + "%" : "—"}</span>
      <span class="fr">«${V.frase}»<b style="color:${per.color}">${per.nombre}, ${per.rol}</b></span></div>`;
  }
  $("tabla").innerHTML = html || `<div><span class="fr">No alcanzó a hablar ninguna voz.</span></div>`;
}

function linea(cv, hist, color) {
  const r = cv.getBoundingClientRect();
  if (!r.width || !hist || hist.length < 2) return;
  const d = window.devicePixelRatio || 1;
  if (cv.width !== Math.round(r.width * d)) { cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d); }
  const c = cv.getContext("2d"), W = cv.width, H = cv.height, m = 10 * d;
  c.clearRect(0, 0, W, H);
  const max = Math.max(...hist) * 1.05, min = Math.min(...hist, P.inicio) * 0.9;
  c.beginPath();
  hist.forEach((p, k) => {
    const x = m + (k / (hist.length - 1)) * (W - 2 * m), y = H - m - ((p - min) / (max - min || 1)) * (H - 2 * m);
    k ? c.lineTo(x, y) : c.moveTo(x, y);
  });
  c.strokeStyle = color; c.lineWidth = 3 * d; c.lineJoin = "round"; c.stroke();
}

/* ---------------- la burbuja (canvas) ---------------- */
const cv = $("lienzo"), c = cv.getContext("2d");
let W = 0, H = 0, Rv = 0, estallido = null;
const part = {};     // uid → { x, y, a, r, va } posición de cada nombre

function ajustar() {
  const r = cv.getBoundingClientRect(), d = window.devicePixelRatio || 1;
  W = r.width; H = r.height;
  cv.width = Math.round(W * d); cv.height = Math.round(H * d);
  c.setTransform(d, 0, 0, d, 0, 0);
}
window.addEventListener("resize", () => { if (seccion === "juego") ajustar(); });

function cuadro(ts) {
  requestAnimationFrame(cuadro);
  if (!e || seccion !== "juego") return;
  if (!W || cv.clientWidth !== W) ajustar();
  if (!W) return;
  c.clearRect(0, 0, W, H);
  const cx = W * 0.5, cy = H * 0.47;
  const inflando = e.fase === "burbuja";
  const ratio = e.precio / e.valor;
  const Rt = inflando ? Math.min(H * 0.4, H * 0.17 * Math.pow(e.precio / 100, 0.38)) : 0;
  Rv += (Rt - Rv) * 0.06;
  const pulso = 1 + 0.018 * Math.sin((ts / periodoLatido()) * Math.PI * 2);
  const tiembla = inflando ? acota((ratio - 1.8) * 1.6, 0, 7) : 0;
  const bx = cx + (Math.random() - 0.5) * tiembla, by = cy + (Math.random() - 0.5) * tiembla;
  const R = Rv * pulso;
  const tono = 200 + acota((ratio - 1) / 2.5, 0, 1) * 150;

  if (inflando && R > 4) {
    const g = c.createRadialGradient(bx - R * 0.3, by - R * 0.35, R * 0.1, bx, by, R);
    g.addColorStop(0, `hsla(${tono},95%,80%,0.16)`);
    g.addColorStop(0.8, `hsla(${tono},90%,60%,0.13)`);
    g.addColorStop(1, `hsla(${tono},95%,65%,0.42)`);
    c.beginPath(); c.arc(bx, by, R, 0, Math.PI * 2); c.fillStyle = g; c.fill();
    c.lineWidth = 3; c.strokeStyle = `hsla(${tono},95%,72%,0.95)`; c.stroke();
    c.beginPath(); c.arc(bx, by, R * 0.86, Math.PI * 1.12, Math.PI * 1.42);
    c.lineWidth = R * 0.035; c.lineCap = "round"; c.strokeStyle = "rgba(255,255,255,0.35)"; c.stroke();
  }

  if (estallido) {
    const p = (ts - estallido.t0) / 1400;
    if (p >= 1) estallido = null;
    else {
      c.save();
      c.globalAlpha = 1 - p;
      c.strokeStyle = `hsl(${estallido.tono},95%,70%)`; c.lineWidth = 6 * (1 - p);
      c.beginPath(); c.arc(cx, cy, estallido.R * (1 + p * 1.6), 0, Math.PI * 2); c.stroke();
      for (const s of estallido.trozos) {
        const d0 = estallido.R * (1 + p * s.v), d1 = d0 + estallido.R * 0.12;
        c.beginPath(); c.moveTo(cx + Math.cos(s.a) * d0, cy + Math.sin(s.a) * d0);
        c.lineTo(cx + Math.cos(s.a) * d1, cy + Math.sin(s.a) * d1); c.lineWidth = 4 * (1 - p); c.stroke();
      }
      c.globalAlpha = Math.max(0, 0.9 - p * 4);
      c.fillStyle = "#fff"; c.fillRect(0, 0, W, H);
      c.restore();
    }
  }

  // nombres: dentro flotan en la burbuja, fuera esperan abajo
  const J = presentes(), uids = Object.keys(J).sort((a, b) => J[a].nombre.localeCompare(J[b].nombre));
  const fs = acota(H * 0.024, 12, 26), colW = Math.max(W / 9, fs * 7), cols = Math.max(1, Math.floor(W / colW));
  let k = 0;
  c.font = `700 ${fs}px system-ui, sans-serif`; c.textAlign = "center"; c.textBaseline = "middle";
  for (const u of uids) {
    const dentro = inflando && J[u].dentro === true;
    let p = part[u];
    if (!p) p = part[u] = { x: cx, y: H + 30, a: Math.random() * 6.28, r: Math.sqrt(Math.random()), va: (Math.random() - 0.5) * 0.006 };
    let tx, ty;
    if (dentro) {
      p.a += p.va;
      tx = bx + Math.cos(p.a) * p.r * R * 0.8; ty = by + Math.sin(p.a) * p.r * R * 0.8;
    } else {
      tx = (W - cols * colW) / 2 + ((k % cols) + 0.5) * colW; ty = H - fs * 1.1 - Math.floor(k / cols) * fs * 1.9; k++;
    }
    p.x += (tx - p.x) * 0.09; p.y += (ty - p.y) * 0.09;
    const quemado = !inflando && e.atrapados.includes(u);
    const texto = J[u].nombre.length > 14 ? J[u].nombre.slice(0, 13) + "…" : J[u].nombre;
    const w = c.measureText(texto).width + fs * 1.1, h = fs * 1.55;
    c.beginPath(); c.roundRect(p.x - w / 2, p.y - h / 2, w, h, h / 2);
    c.fillStyle = dentro ? "rgba(34,197,94,0.28)" : quemado ? "rgba(239,68,68,0.3)" : "#17223a"; c.fill();
    c.lineWidth = 1.5; c.strokeStyle = dentro ? "#22c55e" : quemado ? "#ef4444" : "#2c3d5e"; c.stroke();
    c.fillStyle = dentro ? "#eafff1" : quemado ? "#fecaca" : "#aab6c9"; c.fillText(texto, p.x, p.y + 1);
  }
}

/* ---------------- sonido ---------------- */
let ac = null;
function audio() {
  if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) { ac = null; } }
  if (ac && ac.state === "suspended") ac.resume();
  return ac;
}
function tono(f0, f1, dur, vol, tipo = "sine", cuando = 0) {
  if (!sonido || !ac || ac.state !== "running") return;
  const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + cuando;
  o.type = tipo; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + 0.03);
}
function estruendo() {
  if (!sonido || !ac || ac.state !== "running") return;
  const n = ac.sampleRate * 1.1, buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.5);
  const s = ac.createBufferSource(), g = ac.createGain();
  s.buffer = buf; g.gain.value = 0.8; s.connect(g).connect(ac.destination); s.start();
  tono(220, 28, 1.0, 0.6, "sawtooth");
}
function periodoLatido() {
  if (!e || e.fase !== "burbuja") return 1200;
  return acota(1150 - (e.precio / e.valor - 1) * 330, 260, 1150);
}
function programarLatido() {
  if (e && e.fase === "burbuja") { tono(72, 40, 0.12, 0.55); tono(62, 36, 0.14, 0.38, "sine", 0.17); }
  setTimeout(programarLatido, periodoLatido());
}

function sucesos(ev) {
  for (const s of ev) {
    if (s === "voz_abre") tono(520, 520, 0.09, 0.18, "triangle");
    else if (s === "voz_revela") {
      const dir = VOCES[e.voz.i].dir;
      tono(dir > 0 ? 600 : 480, dir > 0 ? 900 : 300, 0.22, 0.22, "triangle");
    } else if (s === "reventon") {
      estallido = { t0: performance.now(), R: Math.max(Rv, 60), tono: 350, trozos: Array.from({ length: 46 }, () => ({ a: Math.random() * 6.28, v: 0.6 + Math.random() * 2.4 })) };
      Rv = 0;
      estruendo();
    } else if (s === "decision") tono(300, 300, 0.4, 0.2, "triangle");
    else if (s === "podio") { tono(523, 523, 0.15, 0.2, "triangle"); tono(659, 659, 0.15, 0.2, "triangle", 0.16); tono(784, 784, 0.35, 0.22, "triangle", 0.32); }
  }
}

iniciar().catch((err) => {
  console.error(err);
  document.querySelector("#cargando h1").textContent = "No se pudo conectar. Recarga la página.";
});
