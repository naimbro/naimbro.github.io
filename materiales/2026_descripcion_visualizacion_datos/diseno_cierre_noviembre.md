# Cierre de DVD 2026: tres desafíos y el demo day

**Fecha del registro:** 31 de octubre de 2026
**Alcance:** clases 12 a 15 (lunes 2, 9, 16 y 23 de noviembre) y el Sprint 4.
**Estatus:** diseño aprobado por Naim; los materiales de la clase 12 se producen a partir de aquí.

---

## La idea en una línea

Cada una de las tres clases antes del demo day es un desafío estilo MAT con un formato distinto
de comunicación pública. Todos los grupos prueban los tres formatos en clase y, al cierre del 16
de noviembre, eligen con cuál se presentan el 23.

| Lunes | Desafío | Formato | Lo que se ejercita |
|---|---|---|---|
| 2 de noviembre (clase 12) | La licitación | Observatorio en Google Sites | Estructurar |
| 9 de noviembre (clase 13) | Al aire | Video-podcast | Narrar |
| 16 de noviembre (clase 14) | Community manager | Carrusel de láminas cuadradas | Sintetizar |
| 23 de noviembre (clase 15) | Demo day | El formato elegido, publicado en el Google Site del grupo | — |

## El objetivo que ordena todo

Que los grupos le pongan estructura a un problema que viene sin estructura, encuentren algo
interesante en su tema, lo comuniquen y enganchen a una audiencia. Esto es explícito en tres
lugares: en cada desafío (el paso de los cinco candidatos), en el Sprint 4 (página "Cómo lo
hicimos") y en la rúbrica (criterio "Hallazgo y enganche", 30%).

Formatos descartados en la exploración, y por qué: diario (ya se usó la redacción dos veces y
desordenaba la sala), feria y tribunal (no convencieron), pitch y concurso (quedaron fuera de la
selección final), explainer (se fusionó con el podcast: el podcast tiene que ser visual).

## Lo común a los tres desafíos

**Mismo contenido, tres envases.** Los tres desafíos reutilizan los 3–4 gráficos del Sprint 3 de
cada grupo. Ninguna clase pide material nuevo: cada una reempaqueta el mismo hallazgo, así que el
grupo que elige un formato ya tiene un borrador.

**Horario fijo.**

| Hora | Bloque |
|---|---|
| 10:00 | Mapa de lo visto y funciones nuevas de R, en vivo |
| 10:10 | Bloque 1: los cinco candidatos (20 min) y la producción |
| 11:20 | Corte duro: el archivo o enlace queda en la planilla o carpeta del curso |
| 11:30 | Bloque 2: exposición, proyectada desde un solo computador |
| hacia 12:20 | Votación y podio |

**Los cinco candidatos.** Con su base del Sprint 3, cada grupo escribe cinco posibles hallazgos,
cada uno con un número y una comparación; los ordena por "¿a quién le importa o le sorprende?"; el
ayudante aprueba el elegido. Cada formato usa la lista de otra manera (ver abajo).

**Igual para todos y adaptado a cada grupo.** El desafío y sus reglas son comunes. Lo que se
adapta es la contraparte: una carta por grupo, escrita según su tema.

**Ayudantes.** Cada uno acompaña a sus tres grupos en el bloque 1 y tiene un papel en el bloque 2
(comité, productor o "algoritmo").

**Competencia y décimas.** Cada desafío tiene un ganador votado o medido en sala. El podio de cada
desafío suma una décima a la nota del Sprint 4, como el juego ML2. Techo 7,0.

**Sin juego ML2** en las tres clases de desafío: la competencia del desafío lo reemplaza.
(Supuesto por confirmar con Naim.)

## Las funciones de R

Una protagonista y dos o tres acompañantes por clase, todas justificadas por lo que el formato
necesita. Se acumulan: al demo day cada grupo tiene el conjunto completo para cualquier formato.

| Clase | Protagonista | Acompañantes | Ya vistas que se reutilizan |
|---|---|---|---|
| 12 · Observatorio | `ggsave()` | `facet_grid()` | `labs(title, subtitle, caption)` con la regla título = hallazgo; `scales::percent` |
| 13 · Video-podcast | `p <-` y `p + capa` | `annotate()`, `geom_hline()`, `scale_y_continuous(limits = )` | `ggsave()` por etapa |
| 14 · Carrusel | `geom_text(aes(label = ))` | `slice_max()` | `mutate(destacado = ...)` con `scale_fill_manual()`, `reorder()`, `ggsave(width = 4, height = 4)` |

Revisado contra los cuadernos de las clases 2 a 10: nunca se han visto `ggsave()`, `annotate()`,
`geom_text()`, `geom_hline()`, `facet_grid()` ni `slice_max()`. `scale_fill_manual()` apareció una
vez, en la clase 9. Nada de `ifelse()`, `pivot_longer()` ni `theme()` en el código proyectado.

## Los tres desafíos

### Clase 12 · La licitación (observatorio)

- **Caso:** una fundación (Naim) va a financiar observatorios de datos. Cada grupo recibe una carta
  con una fundación ficticia de su tema y lo que quiere saber.
- **Producción:** un Google Site con una portada (el hallazgo n.º 1 como titular, un gráfico, dos
  líneas) y una sección (con `facet_grid()` si la base tiene dos variables que cruzar).
- **Bloque 2:** se proyecta cada sitio; un ayudante que no es el del grupo lo navega en silencio
  60–90 segundos y dice en una frase cuál es el hallazgo. Naim compara la frase con el titular y
  declara "se entendió" o "no se entendió".
- **Competencia:** votación por Form, "¿a qué observatorio le darías los fondos?". Solo compiten
  los sitios que se entendieron; no se vota por el propio grupo.

Horario detallado:

| Hora | Qué pasa | Conduce |
|---|---|---|
| 10:00–10:10 | Mapa: Sprints 1 a 3 y la ruta (tres desafíos, demo day, Sprint 4) | Naim |
| 10:10–10:25 | Código en vivo: `ggsave()`, `facet_grid()`, `labs()`, y bajar el PNG desde el panel de archivos de Colab | Naim |
| 10:25–10:45 | Los cinco candidatos; el ayudante aprueba el n.º 1 | Ayudantes |
| 10:45–10:50 | Google Sites en tres pasos: crear y compartir con el grupo; título, imagen y texto; publicar | Naim |
| 10:50–11:20 | Construcción: portada y una sección | Ayudantes |
| 11:20 | Corte: enlace y titular en la planilla del curso | — |
| 11:20–11:30 | Recreo | — |
| 11:30–12:10 | La licitación, unos 4 minutos por grupo | Naim y comité |
| 12:10–12:20 | Votación por Form | Sala |
| 12:20–12:35 | Plan del Sprint 3: en la página "Cómo lo hicimos", qué observaciones incorporan, cuáles no y por qué | Ayudantes |
| 12:35–12:40 | Podio y lo que viene | Naim |

Supuesto: el feedback del Sprint 3 llega por correo antes del lunes. Si no, el bloque de las 12:20
pasa a ser una lectura del feedback con el ayudante.

### Clase 13 · Al aire (video-podcast)

- **Caso:** un medio digital (Naim, el productor) da 3 minutos al aire a cada grupo.
- **Producción:** conductor e invitado experto conversan en cámara mientras el gráfico se arma en
  pantalla por etapas. Se graba en Meet con las láminas compartidas, en una sola toma. El hallazgo
  se dice en los primeros 15 segundos. El invitado se adapta al tema del grupo.
- **Ayudantes:** productores; aprueban un guion de una página antes de grabar.
- **Bloque 2:** se proyectan los 3 minutos y dos de preguntas.
- **Competencia:** el curso vota "¿cuál vería completo?".

### Clase 14 · Community manager (carrusel)

- **Caso:** una ONG (Naim) pide 6 láminas cuadradas, cada una entendible en 3 segundos. La ONG se
  adapta al tema. No se publica en redes.
- **Producción:** los cinco candidatos se vuelven la secuencia del carrusel, con el gancho en la
  portada.
- **Ayudantes:** "el algoritmo"; en el bloque 1 marcan en qué lámina dejarían de mirar.
- **Bloque 2:** prueba del scroll: cada lámina se proyecta 3 segundos y la sala anota qué entendió.
- **Competencia:** porcentaje de la sala que entendió bien cada lámina.
- **Cierre de la clase:** cada grupo anota en una planilla el formato con que se presenta el 23; su
  ayudante lo valida. Después no se cambia.

## Sprint 4 y demo day (clase 15, 23 de noviembre)

**Entrega:** antes de las 10:00, el enlace a un Google Site publicado, con tres páginas.

| Página | Contenido |
|---|---|
| Portada | El hallazgo como titular, un gráfico y dos o tres líneas |
| La historia | Observatorio: 3–4 secciones con titular y gráfico. Video-podcast: episodio de 5–8 minutos incrustado (Drive o YouTube no listado). Carrusel: 8–10 láminas en secuencia |
| Cómo lo hicimos | Fuentes y enlace al Colab; decisiones de limpieza y límites; los cinco candidatos y por qué ganó el elegido; la prueba con un usuario potencial (qué entendió y qué cambiaron); qué observaciones del Sprint 3 incorporaron |

Con el sitio como envase, los resultados de aprendizaje y la línea de evaluación del syllabus
("sitio publicado") siguen valiendo tal como están escritos; solo cambian los bloques de las clases
12 a 15.

**Demo day:** 8 minutos de presentación y 4 de preguntas por grupo (dentro del máximo de 10 + 5 del
syllabus). Orden: el hallazgo como gancho, la pieza, cómo lo hicieron y sus límites, preguntas.
Panel: Naim y los tres ayudantes, más una contraparte invitada si la hay; los ayudantes llenan la
pauta en sala. Premio del público por Form, "¿cuál te enganchó más?", sin nota.

**Rúbrica (20% del curso),** la misma para los tres formatos, con cuatro niveles por criterio:

| Criterio | Peso | Qué mira |
|---|---|---|
| Hallazgo y enganche | 30% | Encontraron algo que importa o sorprende en su tema, lo eligieron entre varios candidatos y lo cuentan de modo que la audiencia quiera seguir mirando |
| Rigor y trazabilidad | 25% | Los indicadores miden lo que dicen medir; Colab y fuentes enlazados; límites declarados |
| Claridad visual | 20% | Gráficos legibles, título con el hallazgo, una idea por gráfico |
| Defensa oral | 25% | Todos explican el proyecto, no sobrerreclaman causalidad y responden preguntas sobre su código |

## Materiales de la clase 12, en orden de prioridad

1. Deck de la clase (plantilla de siempre): mapa, ruta, código, cinco candidatos, Sites en tres
   pasos, reglas de la licitación.
2. Cuaderno `clase12` con la CEP: `ggsave()`, `facet_grid()`, `labs()` como titular, celdas vacías.
3. Las nueve cartas de la fundación.
4. Form del corte (grupo, enlace, titular) y Form de votación. El plan del Sprint 3 no va en el
   form: se escribe en la página "Cómo lo hicimos" del sitio.
5. Hoja para los ayudantes: roles y horario.
6. Bloque de la clase 12 en el syllabus (100–150 palabras).
7. Guía del Sprint 4 (puede publicarse durante la semana).

Pendiente de Naim: crear un Google Site de prueba con una cuenta personal antes del lunes, para
confirmar que publicar no tiene trabas.
