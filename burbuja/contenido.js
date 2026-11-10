/* =====================================================================
   LA BURBUJA — contenido de la partida.
   MGT300 · Sociedad, Cultura y Política · Clase 12 (10 de noviembre de 2026).

   Cada voz es una frase o una cifra que el curso ya vio proyectada
   (exposición «¿Revolución o burbuja?», láminas 7, 13 y 15) o que está en
   los dossiers de personaje de la clase
   (teaching/2026_mgt300_clase12_dossiers.html). Nada de este archivo sale
   de otra parte: si una frase no está en esos dos materiales, no entra.

   quien   = de quién es (la respuesta correcta)
   senuelo = la otra opción que se ofrece
   dir     = +1 si la voz empuja el precio hacia arriba, −1 hacia abajo
   primero = "quien" o "senuelo": cuál botón va arriba (fijo, para que
             proyector y teléfonos muestren lo mismo)
   ===================================================================== */

export const PERSONAS = {
  goldman:  { nombre: "Goldman Sachs",   rol: "banco de inversión",            color: "#38bdf8" },
  aghion:   { nombre: "Philippe Aghion", rol: "economista, Nobel 2025",        color: "#34d399" },
  acemoglu: { nombre: "Daron Acemoglu",  rol: "economista del MIT, Nobel 2024", color: "#fb923c" },
  huang:    { nombre: "Jensen Huang",    rol: "director ejecutivo de Nvidia",  color: "#f59e0b" },
  burry:    { nombre: "Michael Burry",   rol: "inversionista, The Big Short",  color: "#f43f5e" },
  solow:    { nombre: "Robert Solow",    rol: "economista, Nobel 1987",        color: "#a3a3a3" },
  thiel:    { nombre: "Peter Thiel",     rol: "inversionista, Palantir",       color: "#60a5fa" },
  khan:     { nombre: "Lina Khan",       rol: "expresidenta de la FTC",        color: "#a78bfa" }
};

export const VOCES = [
  { frase: "La IA sumará 1,5 puntos de productividad al año en EE. UU. durante diez años.",
    quien: "goldman", senuelo: "acemoglu", dir: +1, primero: "senuelo",
    fuente: "Goldman Sachs (2023), lámina 13" },
  { frase: "La IA debería aumentar la productividad entre 0,8 y 1,3 puntos por año durante la próxima década.",
    quien: "aghion", senuelo: "acemoglu", dir: +1, primero: "quien",
    fuente: "Aghion y Bunel, junio de 2024" },
  { frase: "Se ha hablado mucho de una burbuja de IA. Desde nuestro punto de observación, vemos algo muy distinto.",
    quien: "huang", senuelo: "burry", dir: +1, primero: "senuelo",
    fuente: "Llamada de resultados de Nvidia, 19 de noviembre de 2025" },
  { frase: "Se ve la era de los computadores en todas partes, menos en las estadísticas de productividad.",
    quien: "solow", senuelo: "acemoglu", dir: -1, primero: "quien",
    fuente: "Solow (1987), lámina 7" },
  { frase: "Los efectos de la IA son no triviales pero modestos: no más de un 0,66% de productividad en diez años.",
    quien: "acemoglu", senuelo: "aghion", dir: -1, primero: "senuelo",
    fuente: "«The Simple Macroeconomics of AI», 2024" },
  { frase: "Ahora, el cómputo es ingreso.",
    quien: "huang", senuelo: "thiel", dir: +1, primero: "quien",
    fuente: "Comunicado de resultados de Nvidia, 26 de agosto de 2026" },
  { frase: "Una vez más hay un Cisco en el centro de todo. Su nombre es Nvidia.",
    quien: "burry", senuelo: "acemoglu", dir: -1, primero: "senuelo",
    fuente: "Cassandra Unchained, 24 de noviembre de 2025" },
  { frase: "Se va a desperdiciar mucho dinero.",
    quien: "acemoglu", senuelo: "burry", dir: -1, primero: "quien",
    fuente: "Bloomberg, octubre de 2024" },
  { frase: "Cuando concentras la producción, concentras el riesgo.",
    quien: "khan", senuelo: "burry", dir: -1, primero: "senuelo",
    fuente: "Discurso en la FTC, 25 de enero de 2024" },
  { frase: "Salvo por la IA, estamos en un estancamiento casi total.",
    quien: "thiel", senuelo: "huang", dir: +1, primero: "quien",
    fuente: "Entrevista en The New York Times, 26 de junio de 2025" },
  { frase: "A veces, la única jugada ganadora es no jugar.",
    quien: "burry", senuelo: "thiel", dir: -1, primero: "senuelo",
    fuente: "X, 31 de octubre de 2025" }
];

/* Las dos opciones de una voz, en el orden en que se muestran. */
export function opciones(i) {
  const v = VOCES[i];
  return v.primero === "quien" ? [v.quien, v.senuelo] : [v.senuelo, v.quien];
}

/* Epílogo: los dos mundos, con las cifras de los dossiers de Aghion y Acemoglu. */
export const MUNDOS = {
  aghion: {
    persona: "aghion", titulo: "El mundo de Aghion",
    cita: "Entre 0,8 y 1,3 puntos de productividad por año. Y es un piso.",
    pista: "La productividad de EE. UU. creció 3,6% anualizado en el tercer trimestre de 2026.",
    desenlace: "La productividad llegó, como con la electricidad: el desfase se cumplió."
  },
  acemoglu: {
    persona: "acemoglu", titulo: "El mundo de Acemoglu",
    cita: "No más de un 0,66% de productividad en diez años.",
    pista: "En el último año la productividad creció 2,1% y el salario real, 1,0%.",
    desenlace: "Los efectos fueron modestos: la productividad casi no se movió."
  }
};
