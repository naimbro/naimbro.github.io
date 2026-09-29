# Clase 8 — Guion

**Martes 29-09-2026** · Automatización y represión; seis personajes, tres duelos
**Sala esperada: 25 a 30.** Son 45 inscritos, pero en la clase 7 jugaron 24 y en la 5, 27.

| Bloque | Horario | Lógica |
|---|---|---|
| **1 · Modelo y preparación** | 11:30–12:40 | Amodei, Acemoglu y los radiólogos en unos 32 minutos; inscripción; dossier y hoja de duelo |
| Recreo | 12:40–13:00 | La sala de Tribuna queda abierta en portada |
| **2 · Presentaciones y duelos** | 13:00–14:10 | Presentaciones orales primero, porque se evalúan; después los tres duelos, que pueden achicarse |

Materiales: [deck](../../teaching/2026_mgt300_clase8_presentacion.html) ·
[dossiers](../../teaching/2026_mgt300_clase8_dossiers.html) ·
[prompt de Tribuna](prompt_tribuna_clase08.md) y [su actualización del 29-09](prompt_tribuna_clase08_actualizacion.md) ·
[guía del caso radiólogos](clase08_radiologos_guia.md) ·
[fuentes y timestamps](clase08_radiologos_fuentes.md).

---

## Antes de que lleguen

1. **Tribuna, semana 308**, probada en el ensayo del lunes con los ayudantes. Si el lunes el
   cupo por orden de llegada no funcionó, vas directo al **plan B** del final; no lo pruebes en
   vivo.
2. **Dossiers impresos, doble faz: seis copias por personaje, 36 hojas.** Seis pilas, cada una
   con el nombre del personaje encima.

   | Páginas del PDF | Personaje | Duelo |
   |---|---|---|
   | 1–2 | Huang | 1, a favor |
   | 3–4 | Amodei | 1, en contra |
   | 5–6 | Hawley | 2, a favor |
   | 7–8 | Altman | 2, en contra |
   | 9–10 | Sanders | 3, a favor |
   | 11–12 | Musk | 3, en contra |

3. **Crea la sala** en `index.html?semana=308` y deja el código listo para proyectar
   (⛶ MOSTRAR CÓDIGO). No abras la inscripción todavía.
4. **El deck en la lámina 1**, en otra pestaña del mismo navegador. Si la pestaña de Tribuna se
   cierra, `index.html?sala=CODIGO` la recupera, pero sólo desde ese navegador.
5. **Los jueces de Tribuna, al día con el deck.** El deck cambió la mañana del 29-09: salieron
   Hanauer, la Proposición 3 y el golpe con capacidad fiscal, y entraron Amodei, el cruce
   recalculado, las tortas y la IA que abarata la represión. Si la
   [actualización de `semana308.js`](prompt_tribuna_clase08_actualizacion.md) no alcanzó a
   publicarse, los jueces premian ideas que nadie vio: avísalo en voz alta antes del duelo 1 y
   haz tú de árbitro de lo proyectado.

---

# Bloque 1 · Modelo y preparación (11:30–12:40)

## 11:30–11:46 · Amodei y Acemoglu (láminas 1–11, 16 min)

Casi cada lámina es una imagen o un gráfico, con poco texto: lo que falta lo dices tú.

| Láminas | Min | Qué tiene que quedar |
|---|---|---|
| 1–3 | 3 | Amodei propone una renta básica pagada con impuestos a la IA, para evitar «rabia difusa y violencia», y cree que la IA puede dar más libertad que nunca. Remate de la 3: *«Hoy: un modelo económico que predice lo contrario.»* |
| 4–5 | 2 | La portada del paper y la tesis: redistribuir cuesta una fracción que crece; reprimir, una fija. En democracia, llega un punto en que derrocarla sale más barato que pagar impuestos |
| 6–7 | 3 | Automatizar es mover una tarea al capital. **Detente en la 7**, el dilema: automatizar conviene hagan lo que hagan las demás, y si todas lo hacen, pierden todas. Vuelve en los duelos 1 y 2 |
| 8 | 3 | **La lámina ancla.** Es la Figura 3 del paper recalculada con sus parámetros. Lee los ejes antes que las curvas: costo como % de lo que el capital ganaría sin amenaza de revuelta. A la izquierda del umbral el Estado redistribuye; a la derecha, reprime; no hay vuelta |
| 9 | 2 | La objeción de Amodei: si la torta crece tanto, alcanza. Sí alcanza, pero el precio de la paz sube de 42% a 48% de una torta cuatro veces más grande |
| 10–11 | 3 | El supuesto que la IA rompe: en el modelo reprimir cuesta una fracción fija; si baja de 60% a 50%, el umbral llega con menos de la mitad del capital. Qué abarata: nadie tiene que aceptar disparar, y la protesta se ve antes de coordinarse |

La 9 es la respuesta a quien piense que el hipercrecimiento lo resuelve todo. Si alguien la
discute, el supuesto de fondo es que la revuelta responde a la desigualdad relativa, no a la
pobreza: *¿se rebela alguien que vive mejor que nunca, si otros viven infinitamente mejor?*

## 11:46–11:59 · El caso de los radiólogos (láminas 12–18, 13 min)

La lámina a lámina está en la [guía del caso](clase08_radiologos_guia.md). Quedan dos videos: Hinton
en la 13 (1:24) y Huang sobre Hinton en la 17 (1:36). Si la red falla, «sin conexión: mostrar QR».
**El exit ticket está en la 18**, junto al debate; lo recoges durante la inscripción.

## 11:59–12:05 · Encuadre de los duelos (láminas 19–23, 6 min)

- **Lámina 20, el puente.** Una frase por fila. Los duelos 1 y 2 salen de la misma lámina 7:
  el problema (cada empresa por su cuenta) y la salida (alguien que obligue a todas). El 3 sale
  del cruce y las tortas.
- **Lámina 21, la torta.** **No ubiques a nadie en una capa.** Es la primera pregunta de la hoja de
  duelo y la respuesta no es obvia: Musk está en varias a la vez (centros de datos, Grok, robots); Hawley y
  Sanders, en ninguna.
- **Lámina 23**, que queda proyectada durante la inscripción.

## 12:05–12:10 · Inscripción (5 min)

1. **Cuenta a los presentes** y fija el cupo: presentes divididos por seis, redondeando hacia
   arriba (24 → 4; 27 → 5; 31 → 6).
2. Proyecta el código y abre la inscripción.
3. Mira los contadores. Si un personaje queda vacío a los tres minutos, dilo en voz alta: *«A
   Hawley no lo quiere nadie. Senador republicano, se pelea con Altman: es el mejor papel del
   día.»*
4. Cada uno retira el dossier **del personaje que le quedó en el teléfono**, no del que quería.

## 12:10–12:30 · Lectura en silencio (20 min)

Celulares guardados. El dossier se lee entero, con lápiz. Cada uno trae la ficha del NYT, entre
seis y ocho extractos con fuente, lo que va a decir el rival, y la hoja de duelo al final.

## 12:30–12:40 · Hoja de duelo (10 min)

En grupo, sobre una sola hoja. Recorre los grupos con una sola pregunta, la quinta de la hoja:
*«¿Qué dijo tu personaje que le calza demasiado bien a su negocio?»* Es la que más cuesta. Sin
decirles la respuesta, las tres que están en los dossiers son estas:

- Nvidia comprometió hasta 10 mil millones de dólares en Anthropic. Huang discute con una empresa
  en la que invirtió.
- Anthropic le paga a SpaceX hasta 1.250 millones de dólares al mes. Musk escribió «Dario tiene
  razón» cuando Anthropic ya era su cliente.
- En 2023, frente a Hawley, Altman propuso una agencia que diera licencias a los modelos. Hoy le
  toca defender que no hacen falta leyes nuevas.

**Antes del recreo:** *«La hoja vuelve con ustedes. Al que no esté a las 13:00 la sala lo cuenta
igual, y su parte de la barra queda vacía.»*

---

# Bloque 2 · Presentaciones y duelos (13:00–14:10)

## 13:00–13:25 · Presentaciones orales (25 min)

Fuera del juego. La sala de Tribuna sigue abierta en la otra pestaña.

## 13:25–14:05 · Tres duelos (unos 13 minutos cada uno)

En la clase 7 un debate completo tomó unos 15 minutos. Van los tres en orden; si el tiempo no da,
el tercero abre la clase 9. Al cerrar cada duelo, antes de pasar al siguiente, **una pregunta
tuya en voz alta**, en especial si el jurado y el público eligieron a lados distintos.

**Duelo 1 · Huang contra Amodei.** Huang va a ganar al público con «si no está listo, no lo
lances»: suena a sentido común. Amodei tiene la carta más fuerte en su propio dossier y es fácil
que no la juegue: *incidentes parecidos han pasado en toda la industria, incluida Anthropic*.
- **Para cerrar:** *«Huang dice que nadie los presiona. El dilema de la lámina 7 dice que a cada
  empresa le conviene seguir, haga lo que haga el resto. ¿Cuál de los dos describe mejor a un
  laboratorio que compite con otros cuatro?»*

**Duelo 2 · Hawley contra Altman.** Hawley tiene el ejemplo más fácil de entender, el auto de
juguete, y el más duro, el arbitraje de cien dólares. El punto débil de Altman es su propia
audiencia de 2023, y está en el dossier de Hawley.
- **Para cerrar:** *«La lámina 7 dice que la salida es alguien que obligue a todas a la vez.
  Hawley quiere que obligue una ley; Altman, que la industria se ordene sola. ¿Cuál obliga a
  todas a la vez de verdad?»*

**Duelo 3 · Sanders contra Musk.** Es el que más directamente es Acemoglu.
- **Para cerrar:** *«Los cheques que promete Musk son la curva de "redistribuir" de la lámina 8.
  La 9 dice que alcanza, pero que reprimir sale más barato. ¿Qué sostiene esos cheques cuando al
  dueño de los robots le conviene no pagar?»* Y el dato
  que lo remata, del dossier: Musk controla más del 80% de los votos de SpaceX.

## 14:05–14:10 · Cierre

🏁 TERMINAR CLASE: los teléfonos piden feedback y se revela el ranking. Una sola frase de cierre, la
que conecta con la clase 9 (¿puede la IA representar a una persona?): *«Hoy ustedes
representaron a alguien que no son, con sus palabras, y los jueces midieron cuán fiel fue la
copia. La próxima clase le toca a un modelo hacer lo mismo con ustedes.»*

---

## Plan B · si Tribuna no está lista

Mismo guion, sin teléfonos:

- **Inscripción en papel:** una hoja con seis columnas y el cupo marcado en cada una. Se anotan en
  orden de llegada.
- **Duelos en voz alta**, 12 minutos cada uno: dos minutos de apertura por lado, seis de cruce
  libre en que tú moderas, y un minuto de cierre por lado.
- **Voto del resto a mano alzada:** «¿quién argumentó mejor, aunque no pienses como él?». Tú haces
  de jurado de fidelidad. Si alguien cita algo que no está en su dossier, pídele la página.

## Si la sala es muy distinta de lo esperado

- **Menos de 18 presentes:** se mantienen los seis personajes con tres integrantes cada uno. Un
  duelo de dos contra dos todavía funciona; uno de uno contra uno, no.
- **Más de 36:** sube el cupo a siete. Con grupos de siete la barra de participación se llena más
  lento; avísales que en cada duelo tienen que escribir todos.
