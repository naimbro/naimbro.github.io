/* =====================================================================
   LA BURBUJA — motor del juego. Lógica pura: sin DOM y sin Firebase.
   Lo usa el navegador del profesor (anfitrion.js), que es quien hace
   avanzar la partida un tic por segundo, y lo prueban
   pruebas/motor.test.mjs con cientos de partidas simuladas.

   Una partida:
     lobby     → los alumnos entran con el QR
     burbuja   → el precio lo hace la sala; cada 15 s habla una voz
     reventon  → los que estaban dentro pierden 80%
     decision  → diez años después: ¿vuelves a entrar?
     futuro    → se sortea el mundo (Aghion o Acemoglu) y se ve el precio
     podio
   ===================================================================== */

import { VOCES } from "./contenido.js";

export const P = {
  inicio: 100,          // plata con que parte cada alumno, y precio inicial
  // voces
  vozPrimera: 5,        // segundo en que se abre la primera voz
  vozCada: 15,          // una voz cada 15 s
  vozVentana: 7,        // segundos para responder
  bono: 20,             // plata por acertar de quién es la frase: once voces pesan tanto como la burbuja
  sacudida: 0.05,       // salto del precio cuando se revela una voz
  // precio
  base: 0.002,          // crecimiento por segundo con la sala vacía
  porDentro: 0.014,     // crecimiento extra por segundo con toda la sala dentro
  porFlujo: 0.20,       // efecto de los que entran o salen en ese segundo
  ruido: 0.006,
  valorCrece: 0.0018,   // crecimiento del valor «de verdad» por segundo
  // reventón
  popDesde: 104,        // no revienta antes de que se revele la séptima voz
  popMax: 172,          // ni después de la última
  hazUmbral: 1.4,       // con precio/valor bajo este umbral no hay riesgo
  hazK: 0.012,
  hazTope: 0.15,
  suave: 1.5,           // si al final precio/valor no llega a esto, no hubo burbuja
  caida: 0.8,           // lo que pierde quien estaba dentro (Cisco cayó cerca de 80%)
  // epílogo
  reventonSeg: 9,
  decisionSeg: 20,
  decisionGracia: 2,    // segundos extra, con la cuenta ya en cero, para que llegue el último toque
  futuroSeg: 12,
  mundo: { aghion: 2.2, acemoglu: 0.6 }
};

export function nuevaPartida(ronda) {
  return {
    fase: "lobby", ronda, t: 0, tf: 0,
    precio: P.inicio, valor: P.inicio, pico: P.inicio, suelo: null,
    hist: [P.inicio], fracPrev: 0, n: 0, dentroN: 0, vuelveN: 0,
    voz: null, puntuada: -1, pct: [],
    riqueza: {}, nombres: {}, aciertos: {}, st: {},
    atrapados: [], vuelven: [], mundo: null, suave: false,
    otro: {}, rank: [], premios: null
  };
}

/* Qué voz está en pantalla en el segundo t: { i, estado: "abierta" | "revelada" } o null. */
export function vozEn(t) {
  if (t < P.vozPrimera) return null;
  const i = Math.floor((t - P.vozPrimera) / P.vozCada);
  if (i >= VOCES.length) return { i: VOCES.length - 1, estado: "revelada" };
  const dt = (t - P.vozPrimera) % P.vozCada;
  return { i, estado: dt < P.vozVentana ? "abierta" : "revelada" };
}

/* Probabilidad de que reviente en un segundo, según cuánto se alejó el precio del valor. */
export function riesgo(ratio) {
  if (ratio <= P.hazUmbral) return 0;
  return Math.min(P.hazTope, P.hazK * (ratio - P.hazUmbral) ** 2);
}

/* El medidor del teléfono: zona según precio/valor. */
export function zona(ratio) {
  if (ratio < 1.4) return "verde";
  if (ratio < 2.4) return "amarilla";
  return "roja";
}

const redondo = (x) => Math.round(x * 100) / 100;

/* Un tic (un segundo). J = { uid: { nombre, dentro, vuelve, resp } } con los alumnos
   presentes. Muta `e` y devuelve la lista de sucesos de ese segundo, para el sonido y
   las animaciones del proyector. */
export function tick(e, J, rand = Math.random) {
  const ev = [];
  for (const u in J) {
    if (!(u in e.riqueza)) {
      e.riqueza[u] = P.inicio; e.aciertos[u] = 0;
      e.st[u] = { entro: false, d: false, sale: -1, antes: 0 };
    }
    e.nombres[u] = J[u].nombre;
  }
  const uids = Object.keys(e.riqueza).filter((u) => u in J);
  e.n = uids.length;

  if (e.fase === "burbuja") {
    e.t++;
    const dentro = uids.filter((u) => J[u].dentro === true);
    const frac = e.n ? dentro.length / e.n : 0;

    // --- voces -----------------------------------------------------------
    const v = vozEn(e.t);
    if (v && v.estado === "abierta" && (!e.voz || e.voz.i !== v.i)) ev.push("voz_abre");
    if (v && v.estado === "revelada" && e.voz && e.voz.i === v.i && e.voz.estado === "abierta") ev.push("voz_revela");
    e.voz = v;
    // Se puntúa un segundo después de cerrar, para que alcance a llegar el último toque.
    let dir = 0;
    const cierre = e.t - P.vozPrimera - P.vozVentana - 1;
    if (cierre >= 0 && cierre % P.vozCada === 0) {
      const i = cierre / P.vozCada;
      if (i < VOCES.length && e.puntuada < i) {
        let ok = 0, tot = 0;
        for (const u of uids) {
          const r = J[u].resp ? J[u].resp[i] : undefined;
          if (r === true || r === false) {
            tot++;
            if (r) { ok++; e.riqueza[u] += P.bono; e.aciertos[u]++; }
          }
        }
        e.pct[i] = tot ? Math.round((100 * ok) / tot) : -1;
        e.puntuada = i;
        dir = VOCES[i].dir;
      }
    }

    // --- precio ----------------------------------------------------------
    const flujo = frac - e.fracPrev;
    e.fracPrev = frac;
    let g = P.base + P.porDentro * frac + P.porFlujo * flujo + (rand() - 0.5) * P.ruido + dir * P.sacudida;
    g = Math.max(-0.15, Math.min(0.09, g));
    e.precio *= 1 + g;
    e.valor *= 1 + P.valorCrece;
    for (const u of dentro) { e.riqueza[u] *= 1 + g; e.st[u].entro = true; }
    for (const u of uids) {
      const d = J[u].dentro === true;
      if (e.st[u].d && !d) e.st[u].sale = e.t;
      e.st[u].d = d;
    }
    e.pico = Math.max(e.pico, e.precio);
    e.dentroN = dentro.length;
    e.hist.push(redondo(e.precio));

    // --- ¿revienta? -------------------------------------------------------
    const ratio = e.precio / e.valor;
    const pop = e.t >= P.popMax || (e.t >= P.popDesde && rand() < riesgo(ratio));
    if (pop) {
      if (ratio < P.suave) {
        e.suave = true;
        cerrar(e, uids);
        ev.push("suave", "podio");
      } else {
        e.atrapados = dentro.slice();
        for (const u of dentro) { e.st[u].antes = e.riqueza[u]; e.riqueza[u] *= 1 - P.caida; }
        e.pico = e.precio;
        e.precio *= 1 - P.caida;
        e.suelo = e.precio;
        e.hist.push(redondo(e.precio));
        e.dentroN = 0;
        e.fase = "reventon"; e.tf = 0;
        ev.push("reventon");
      }
    }
  } else if (e.fase === "reventon") {
    e.tf++;
    if (e.tf >= P.reventonSeg) { e.fase = "decision"; e.tf = 0; ev.push("decision"); }
  } else if (e.fase === "decision") {
    e.tf++;
    const vuelven = uids.filter((u) => J[u].vuelve === true);
    e.vuelveN = vuelven.length;
    if (e.tf >= P.decisionSeg + P.decisionGracia) {
      e.vuelven = vuelven;
      e.mundo = rand() < 0.5 ? "aghion" : "acemoglu";
      e.fase = "futuro"; e.tf = 0;
      ev.push("futuro");
    }
  } else if (e.fase === "futuro") {
    e.tf++;
    const antes = e.precio;
    e.precio = e.suelo * camino(e.tf / P.futuroSeg, P.mundo[e.mundo], rand);
    const f = e.precio / antes;
    for (const u of e.vuelven) if (u in e.riqueza) e.riqueza[u] *= f;
    e.hist.push(redondo(e.precio));
    if (e.tf >= P.futuroSeg) {
      // deja el precio exactamente en el múltiplo del mundo, sin el ruido del camino
      const fin = (e.suelo * P.mundo[e.mundo]) / e.precio;
      for (const u of e.vuelven) if (u in e.riqueza) e.riqueza[u] *= fin;
      e.precio *= fin;
      const m = P.mundo[e.mundo], mo = P.mundo[e.mundo === "aghion" ? "acemoglu" : "aghion"];
      for (const u of Object.keys(e.riqueza)) {
        e.otro[u] = e.vuelven.includes(u) ? (e.riqueza[u] / m) * mo : e.riqueza[u];
      }
      cerrar(e, uids);
      ev.push("podio");
    }
  }
  return ev;
}

/* El precio del epílogo como múltiplo del suelo: los primeros segundos los dos mundos
   se ven iguales (suspenso), y después se separan. */
export function camino(x, m, rand = Math.random) {
  const tiembla = 1 + (rand() - 0.5) * 0.05;
  if (x <= 0.3) return tiembla;
  const y = (x - 0.3) / 0.7;
  const suave = y * y * (3 - 2 * y);
  return (1 + (m - 1) * suave) * (x >= 1 ? 1 : tiembla);
}

/* «Terminar aquí»: el profesor corta la partida y pasa al podio con lo que hay. */
export function terminar(e) {
  if (e.fase !== "podio") cerrar(e);
  return e;
}

function cerrar(e) {
  e.fase = "podio"; e.tf = 0;
  for (const u of Object.keys(e.riqueza)) e.riqueza[u] = Math.round(e.riqueza[u]);
  for (const u of Object.keys(e.otro)) e.otro[u] = Math.round(e.otro[u]);
  const todos = Object.keys(e.riqueza);
  e.rank = todos.slice().sort((a, b) => e.riqueza[b] - e.riqueza[a]);
  e.premios = premios(e, todos);
}

/* Los premios del cierre. Cada uno es un uid (o una lista) o null si nadie lo ganó. */
export function premios(e, uids) {
  // Casandra: entró, salió antes que nadie y no lo pilló el reventón.
  const libres = uids.filter((u) => e.st[u].entro && e.st[u].sale > 0 && !e.atrapados.includes(u));
  libres.sort((a, b) => e.st[a].sale - e.st[b].sale);
  // Cisco: el que más plata tenía dentro cuando reventó.
  const quemados = e.atrapados.slice().sort((a, b) => e.st[b].antes - e.st[a].antes);
  // «La única jugada ganadora es no jugar»: nunca entraron a la burbuja.
  const fuera = uids.filter((u) => !e.st[u].entro);
  // La otra competencia: quién reconoció más voces (si empatan, el que terminó con más plata).
  const oido = uids.slice().sort((a, b) => e.aciertos[b] - e.aciertos[a] || e.riqueza[b] - e.riqueza[a]);
  return {
    voces: oido.filter((u) => e.aciertos[u] > 0).slice(0, 3).map((u) => ({ uid: u, n: e.aciertos[u] })),
    casandra: libres.length ? { uid: libres[0], seg: e.st[libres[0]].sale } : null,
    cisco: quemados.length ? { uid: quemados[0], perdio: Math.round(e.st[quemados[0]].antes * P.caida) } : null,
    noJugar: fuera,
    oido: oido.length && e.aciertos[oido[0]] > 0 ? { uid: oido[0], n: e.aciertos[oido[0]] } : null
  };
}

/* ---------------------------------------------------------------------
   Alumnos simulados. Sirven para ensayar solo (index.html?bots=20) y para
   las pruebas. No escriben en Firestore: viven en el navegador del profesor.
   --------------------------------------------------------------------- */
const NOMBRES_BOT = ["Ana", "Benja", "Cata", "Diego", "Emi", "Fran", "Gabo", "Isi", "Javi", "Kari", "Lucas", "Maca",
  "Nico", "Oli", "Pau", "Rafa", "Sofi", "Tomás", "Vale", "Seba", "Anto", "Cris", "Dani", "Feña", "Guille", "Trini",
  "Mati", "Jose", "Coni", "Vicho"];

export function crearBots(n, rand = Math.random) {
  const tipos = ["fiel", "fiel", "prudente", "prudente", "prudente", "manada", "manada", "reloj", "reloj", "miedoso"];
  const bots = {};
  for (let k = 0; k < n; k++) {
    bots["bot" + k] = {
      nombre: NOMBRES_BOT[k % NOMBRES_BOT.length] + (k >= NOMBRES_BOT.length ? " " + (k + 1) : ""),
      dentro: false, vuelve: false, resp: {},
      _tipo: tipos[Math.floor(rand() * tipos.length)],
      _entra: 2 + Math.floor(rand() * 25),
      _sale: 70 + Math.floor(rand() * 90),
      _umbral: 1.8 + rand() * 2.2,
      _sabe: 0.45 + rand() * 0.5,
      _salio: false
    };
  }
  return bots;
}

export function moverBots(bots, e, rand = Math.random) {
  for (const u in bots) {
    const b = bots[u];
    if (e.fase === "burbuja") {
      const v = e.voz;
      if (v && v.estado === "abierta" && b.resp[v.i] === undefined && rand() < 0.35) b.resp[v.i] = rand() < b._sabe;
      const ultima = v ? (v.estado === "revelada" ? v.i : v.i - 1) : -1;
      const veMedidor = ultima >= 0 && b.resp[ultima] === true;
      const ratio = e.precio / e.valor;
      const h = e.hist, sube = h.length > 4 && h[h.length - 1] > h[h.length - 4];
      if (b._tipo === "fiel") b.dentro = e.t >= b._entra;
      else if (b._tipo === "miedoso") b.dentro = false;
      else if (b._tipo === "reloj") b.dentro = e.t >= b._entra && e.t < b._sale;
      else if (b._tipo === "prudente") {
        if (veMedidor && ratio > b._umbral) b._salio = true;
        if (e.t > b._sale + 30) b._salio = true;
        b.dentro = e.t >= b._entra && !b._salio;
      } else if (b._tipo === "manada") {
        if (!b.dentro && sube && e.t >= b._entra && rand() < 0.3) b.dentro = true;
        else if (b.dentro && !sube && rand() < 0.5) b.dentro = false;
      }
    } else if (e.fase === "reventon") {
      b.dentro = false;
    } else if (e.fase === "decision") {
      if (e.tf === 3 + (b._entra % 10)) b.vuelve = rand() < (e.atrapados.includes(u) ? 0.35 : 0.6);
    }
  }
  return bots;
}
