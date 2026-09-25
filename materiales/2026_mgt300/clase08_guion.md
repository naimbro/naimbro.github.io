# Clase 8 — Guion

**Martes 29-09-2026** · Automatización y represión; seis personajes, tres duelos
**Sala esperada: 25 a 30.** Son 45 inscritos, pero en la clase 7 jugaron 24 y en la 5, 27.

| Bloque | Horario | Lógica |
|---|---|---|
| **1 · Modelo y preparación** | 11:30–12:40 | Acemoglu y el caso de los radiólogos en 30 minutos; inscripción; dossier y hoja de duelo |
| Recreo | 12:40–13:00 | La sala de Tribuna queda abierta en portada |
| **2 · Presentaciones y duelos** | 13:00–14:10 | Presentaciones orales primero, porque se evalúan; después los tres duelos, que pueden achicarse |

Materiales: [deck](../../teaching/2026_mgt300_clase8_presentacion.html) ·
[dossiers](../../teaching/2026_mgt300_clase8_dossiers.html) ·
[prompt de Tribuna](prompt_tribuna_clase08.md) ·
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

---

# Bloque 1 · Modelo y preparación (11:30–12:40)

## 11:30–11:44 · Acemoglu (láminas 1–9, 14 min)

Tu ruta corta de IA y Democracia, comprimida a nueve láminas para que quepa el caso de los
radiólogos. Salieron la pregunta de la clase 7, la portada del paper, el doble efecto, la
complementariedad, la vigilancia y los dos supuestos: el caso de los radiólogos es el test
empírico del primer supuesto.

| Láminas | Min | Qué tiene que quedar |
|---|---|---|
| 1–3 | 3 | «Impuestos u horcas» y la tesis entera antes de desarmarla |
| 4–5 | 4 | Automatizar es mover una tarea al capital; la revuelta depende de la razón capital/trabajo |
| 6–7 | 4 | **Detente en la 6, la externalidad, y en la 7, el instrumento**: vuelven en la 21 |
| 8–9 | 3 | El cruce y el golpe. La paradoja de la democracia fiscalmente fuerte |

La lámina 6 es la bisagra de toda la clase:
> «Cada empresa automatiza mirando su costo. Ninguna descuenta el riesgo que agrega al conjunto.
> Guarden esa frase: en media hora la van a oír en boca de Dario Amodei.»

## 11:44–11:59 · El caso de los radiólogos (láminas 10–19, 15 min)

La lámina a lámina está en la [guía del caso](clase08_radiologos_guia.md). Tres videos embebidos
(1:24, 1:32 y 1:36); si la red falla, «sin conexión: mostrar QR» en cada lámina. **Recoge los
exit tickets en la inscripción**, no antes.

Huang es personaje del duelo 1, y el caso le da material a quien lo interprete. No se pisa con la
moción, que es sobre Hugging Face y no sobre empleo, pero si alguien lo cita en el duelo, vale:
es la misma entrevista de su dossier.

## 12:00–12:05 · Encuadre de los duelos (láminas 20–24, 5 min)

- **Lámina 21, el puente.** Una frase por fila, no más. Es la única conexión explícita entre
  Acemoglu y los personajes; el resto lo tienen que encontrar ellos.
- **Lámina 22, la torta.** **No ubiques a nadie en una capa.** Es la primera pregunta de la hoja
  de duelo y la respuesta no es obvia: Musk está en varias a la vez (centros de datos, Grok, robots); Hawley y
  Sanders, en ninguna.
- **Lámina 24**, que queda proyectada durante la inscripción.

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
- **Para cerrar:** *«Huang dice que nadie los presiona. La lámina 6 dice que cada empresa ignora
  el riesgo que agrega al conjunto. ¿Cuál de los dos describe mejor a un laboratorio que compite
  con otros cuatro?»*

**Duelo 2 · Hawley contra Altman.** Hawley tiene el ejemplo más fácil de entender, el auto de
juguete, y el más duro, el arbitraje de cien dólares. El punto débil de Altman es su propia
audiencia de 2023, y está en el dossier de Hawley.
- **Para cerrar:** *«Demandas después del daño o reglas antes de lanzar. La lámina 7 dice que el
  instrumento determina lo que hace el Estado. ¿Qué conducta produce cada uno en una empresa?»*

**Duelo 3 · Sanders contra Musk.** Es el que más directamente es Acemoglu.
- **Para cerrar:** *«Los cheques que promete Musk son la curva de "redistribuir" del gráfico del
  cruce. ¿Qué la sostiene cuando al dueño de los robots le sale más barato no pagar?»* Y el dato
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
