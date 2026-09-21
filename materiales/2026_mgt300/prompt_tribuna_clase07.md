# Prompt para la sesión de Claude Code abierta en `C:\Users\naim.bro.k\claude_projects\games\tribuna`

Copiar y pegar tal cual.

---

Arma una **sesión nueva de Tribuna** para la **clase 7 de MGT300 2026** (Sociedad,
Cultura y Política, Ingeniería Comercial UAI), martes 22 de septiembre, 11:30-14:10.
El juego no hay que tocarlo: es sólo contenido, un archivo nuevo en `contenido/` más
su línea en `contenido/sesiones.js`.

## Lo primero: leer antes de escribir

1. `README.md` completo, y con especial cuidado las secciones «Cambiar de semana»,
   «La clase en rotación», «La brújula corta» y las dos invariantes de la audiencia.
2. `contenido/semana7.js` entero. Es el molde: misma estructura, mismo esqueleto de
   bloques (`SESION`, `RONDAS`, `RUBRICA`, `CONCEPTOS`, `FUENTES`, `AUDIENCIA`,
   `EVENTOS`, `EQUIPOS`, `EJEMPLOS_SESION`, `PREGUNTAS`, `BRUJULA`).
3. `contenido/sesiones.js`, `pruebas/contenido.test.js` y `pruebas/brujula.test.js`.
4. Corré `node --test pruebas/` antes de escribir nada y anotá el resultado. Tiene que
   quedar igual o mejor al final.

**No toques `semana5.js` ni `semana7.js`.** Y no toques `app.js`, `clase.js`,
`rotacion.js`, `brujula.js`, `jueces.js` ni `moderacion.js`. Si un campo de contenido
que necesitás no existe en el esqueleto, parás y me preguntás.

## La clase, para que calibres el juego

Los alumnos son de pregrado de Ingeniería Comercial, no del Minor en IA. **No
leyeron** el paper de Acemoglu, Gitmez y Shadmehr ni el mapa del NYT, así que nada de
lo que está en `semana7.js` sobre esos textos se puede exigir. Lo que sí tienen en la
cabeza cuando empieza el juego es esto, y sólo esto:

- **El artículo de La Tercera, leído en sala quince minutos antes, impreso:**
  A. Chernin y N. Yáñez, «Entre Thiel y el Papa: la disputa ideológica por regular la
  IA», 20 de septiembre de 2026.
  https://www.latercera.com/politica/noticia/entre-thiel-y-el-papa-la-disputa-ideologica-por-regular-la-ia/
  Es la fuente principal y casi única. Bajalo con WebFetch; si no entra, decímelo y te
  pego el texto.
- **Veinticinco minutos de exposición mía con tres ideas:** (1) los cuatro campos del
  mapa del NYT como grilla (frenar por ley, frenar desde adentro, guardarraíles sin
  freno, ni freno ni ley); (2) una sola lámina de Acemoglu, Gitmez y Shadmehr: *el
  instrumento que tiene el Estado determina lo que hace* («impuestos u horcas»); (3) el
  marco chileno según el propio artículo: proyecto de 2024 con enfoque de riesgos al
  estilo europeo, indicaciones sustitutivas del gobierno de Kast, la comisión de
  Ciencia de la Cámara como escenario.
- **Lectura asignada, que muchos no habrán hecho:** Schneier y Sanders, *Rewiring
  Democracy*, caps. 33 y 40-42. Puede sumar puntos en `evidencia`, no puede ser
  requisito de ninguna moción.

Regla que ya conocés de mis otros cursos: **sólo se juzga lo leído y lo proyectado.**
Un concepto del knowledge base que no esté anclado en un párrafo del artículo o en una
de las tres ideas de la exposición no va.

Registro: español chileno, sin jerga académica, mociones que un alumno de veinte años
pueda defender con el artículo en la mano. Los jueces y la moderadora tienen que
premiar que citen a un diputado por nombre y digan qué instrumento pide.

## Cómo se juega ese día

Modo **clase en rotación con brújula encendida**, unos 55 minutos de juego: brújula en
el teléfono (10 min), después tres o cuatro debates de apertura + réplica + votación +
jueces. Sala de unos 30 alumnos: pensá en seis grupos de cinco.

Las rondas y la rúbrica se quedan como están en el molde. Lo que cambia es todo lo que
habla del tema.

## Qué reciclar tal cual y qué reescribir

**Tal cual:** `RONDAS`, `RUBRICA`, la estructura de `EQUIPOS`, y las seis personas de
`AUDIENCIA` (ya no están en el juego, pero `pruebas/simular.js` y `escala.js` las
usan; conservá nombre, oficio, registro y `no_mueve`, y reasigná el mapa `mueve` a los
ids nuevos de `CONCEPTOS` respetando las dos invariantes del README: sala 5-7 con 15
indecisos, y al menos un bloque grande con `peso_rigor` bajo).

**Reescribir entero:**

- `SESION`: `curso` nuevo para MGT300 (ver abajo), `tema`, y una **moción** chilena.
  Mi propuesta de partida, mejorala si podés: *«Chile debe aprobar la ley de IA con
  obligaciones vinculantes antes de que llegue la inversión, no después.»* A FAVOR y
  EN CONTRA con lemas nuevos.
- `CONCEPTOS`: entre 12 y 16, **cada uno anclado a un actor o pasaje del artículo o a
  una de las tres ideas**. Mínimo que espero ver: el giro de 180 grados (proyecto
  Boric con clasificación de riesgos vs. indicaciones de Kast, más de veinte artículos
  sustituidos); Kaiser y los derechos ciudadanos frente a un Estado de supervigilancia;
  Ross y Schalper, regular sin prohibir, el ejemplo de la ley de *deepfakes*; los
  centros de datos como inversión; Winter, «¿de quién es el futuro?», organizar
  trabajadores, impuesto global a la IA e institucionalidad sudamericana; Girardi,
  la previsión financiada con impuestos al trabajo y la uberización; Yeomans y
  Manouchehri, reconversión, cuotas de empleo y reparto de la productividad; Serrano
  y el representante legal de las plataformas frente a los permisos del carrito de
  sopaipillas; Montalva y el eje Thiel vs. encíclica *Magnifica Humanitas*; los seis
  incidentes de agentes fuera de control que reportó OpenAI; y de la exposición, los
  cuatro campos y «el instrumento determina el resultado». Verificá cada uno contra
  el texto del artículo: **ninguna cifra ni cita que no esté ahí.** `lado` según la
  moción que quede.
- `FUENTES`: apellidos de todos los actores del artículo, «la tercera», «encíclica»,
  «magnifica humanitas», «thiel», «schneier», «sanders», «acemoglu».
- `EVENTOS`: cinco shocks sacados del artículo, con `titular` en presente y efectos
  sobre los seis bloques. Candidatos: se publica la encíclica; OpenAI reporta los seis
  incidentes; el gobierno ingresa las indicaciones sustitutivas; Serrano presenta la
  moción del representante legal; Winter publica su ensayo.
- `BRUJULA`: cinco preguntas, cada una construida sobre una escena del artículo, con
  cuatro opciones que sean las posturas reales de los actores sin marcar ninguna como
  «la correcta». Ejes que quiero: **x = velocidad** (regular antes de que llegue la
  inversión … abrir primero y corregir después); **y = de qué trata la regulación**
  (del trabajo y el reparto de ganancias … de los derechos individuales y los límites
  al Estado). Cuatro campos reconocibles sin nombre propio: el de la encíclica, el de
  Winter, el de Schalper y el de Kaiser. Cada campo con su `afirma` en una frase que
  un grupo pueda defender.
- `PREGUNTAS`: tres o cuatro mociones escritas por mí como semilla para la moderadora,
  una por cada par de campos que más probablemente se enfrente.
- `EJEMPLOS_SESION`: aperturas, refutaciones y cierres nuevos. Recordá la regla del
  README: las refutaciones contestan a *esas* aperturas. Una bancada abre con arenga
  (rigor bajo) y la otra con manual (rigor alto), para que los dos marcadores se
  separen al pulsar «rellenar con ejemplo».

## El manifiesto y el panel

`sesiones.js` agrupa por `curso` y el selector usa `semana`. Hoy sólo hay CSC00155 con
las semanas 5 y 7. Necesito que MGT300 aparezca como curso aparte en `admin.html` y que
`index.html?semana=…` no choque con las sesiones existentes. **Proponeme el esquema**
(un número que no colisione, o lo que el código ya soporte) antes de escribir; si
requiere tocar código fuera de `contenido/`, parás y me lo decís.

## Lo que quiero decidir yo, antes de que escribas archivos

Traeme en un solo mensaje:

1. **La tabla de anclas:** cada concepto candidato, con el párrafo o actor del artículo
   (o la idea de la exposición) del que sale, y qué tipo de moción permite.
2. **La moción principal y las cuatro `afirma` de los campos**, en borrador.
3. **Las cinco preguntas de la brújula**, en borrador, con sus valores de eje.
4. **El esquema de `semana`/`curso`** para el manifiesto.

> **Adenda (20 de septiembre, noche).** Después de enviado este prompt se decidió
> agregar a la lectura en sala el mapa del NYT (18 fichas) y la brújula volvió a los
> ejes de la semana 7 (velocidad; quién pone la regla). El prompt de seguimiento que
> incorpora eso, y que responde las preguntas de la instancia sobre `semana 307`,
> `rotulo`, `JUECES` y el test, se pegó directamente en la sesión de Tribuna. La
> guía impresa con los dos materiales está en
> `teaching/2026_mgt300_clase7_guia_lectura.html`.

Esperá mi visto bueno. Después escribís el archivo, corrés `node --test pruebas/`,
levantás `servidor.py`, abrís la sesión nueva, pulsás **✎ rellenar con ejemplo** y me
mostrás que los dos marcadores se separan. Cerrá con una lista de verificación para
el ensayo del lunes con los ayudantes desde sus teléfonos: entrada con Google, código de
sala, brújula, formar grupos, un debate completo con jurado LLM (Cloud Function) y qué
pasa si el motor cae al heurístico.
