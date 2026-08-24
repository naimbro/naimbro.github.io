# Briefing — Clase 4 · Descripción y Visualización de Datos (UAI, 2026)

Documento de contexto para generar el juego de cierre (Aula Maestra / ML2) basado
**exclusivamente** en lo que esta clase efectivamente proyecta.

---

## 0. Lo que Naim pidió para este juego

| Parámetro | Valor |
|---|---|
| Duración total | **máximo 20 minutos** |
| Rondas de alternativas | **3** |
| Rondas abiertas | **2** |
| Total de rondas | **5** |

Aritmética de referencia (la clase 3 hizo 7 rondas en ~18 min con
`roundDurationSeconds: 150` y `bufferSeconds: 45`): 3 alternativas de 40–50 s
más 2 abiertas de 150 s son ~7,5 min de respuesta; con reveals, ranking y la
ronda de duelos queda en 13–15 min. **Hay holgura**: se pueden subir las abiertas
a 180 s sin pasarse de 20.

---

## 1. Contexto del curso

- **Curso:** Descripción y Visualización de Datos.
- **Programa:** doble título Sociología – Ingeniería Comercial, Universidad Adolfo Ibáñez.
- **Sesión:** clase 4 de 15, lunes 24-08-2026, 10:00–12:40 (bloque de 2h40).
- **Título en el syllabus:** *Introducción a dplyr (1): el pipe, `filter()`, `select()` y `mutate()`*.
- **Syllabus:** https://naimbro.github.io/teaching/2026_descripcion_visualizacion_datos.html
- **Hito del día:** el profesor hace en sala el **demo del Sprint 1** (Pecha Kucha
  de 4 minutos). El Sprint 1 se entrega el **31 de agosto**.

### ⚠️ El syllabus cambió el mismo 24 de agosto

Hasta esta mañana la clase 4 se llamaba *"Introducción a R para análisis de
datos"* y cubría tipos de variables (`character`, `numeric`, `integer`,
`logical`), el `data frame` como contenedor e importar `.csv`. **Naim descartó
ese contenido por redundante con la clase 2 y adelantó dplyr una semana entera.**
La secuencia corrió así:

| Clase | Fecha | Antes | Ahora |
|---|---|---|---|
| 4 | 24-08 | Introducción a R (tipos, data frame) | **dplyr (1): pipe, filter, select, mutate** |
| 5 | 31-08 | dplyr (1) | dplyr (2): variables derivadas e indicadores |
| 6 | 07-09 | dplyr (2) | dplyr (3): agrupar, resumir y comparar |

**Consecuencia dura para el juego: `class()`, los cuatro tipos de variable y "qué
es un data frame" NO son tema de esta clase.** Existió un cuaderno sobre eso que
se escribió y se descartó el mismo día (commit `d624ec7` de `naimbro.github.io`);
no está enlazado en ninguna parte y los alumnos nunca lo vieron. No usarlo.

### Perfil de la audiencia — actualizado tras la clase 3

- **Primer año, 33 alumnos.** Antes de la clase 2 ninguno había programado nunca.
- Hoy es su **tercera sesión escribiendo R**. Lo que ya vieron:

| Clase | Funciones que quedaron en sus manos |
|---|---|
| 2 | `read.csv()`, `names()`, `ncol()`, `nrow()`, `dim()`, `head()`, `str()`, `summary()`, `mean()`, `median()`, `sd()`, `table()`, `sort()`, `c()`, `class()`, `as.numeric()`, `hist()`, `barplot()`, `boxplot()` |
| 3 | `library(dplyr)`, `read.csv()`, `count()` (repetido siete veces), `count(..., sort = TRUE)`, `count()` de dos columnas, `select()`, `head()`, `nrow()` |

- Ya se toparon con datos sucios de verdad: `3` y `3 horas` como categorías
  distintas, `Las condes` y `las condes` como comunas distintas, estaturas
  mezclando metros con centímetros.
- Son estudiantes de **ciencias sociales y negocios**. El gancho es
  interpretativo, no algorítmico.

### 🚫 Dos vetos de vocabulario

1. **`glimpse()` no se puede usar** — ni en enunciado, ni en respuesta correcta,
   ni en distractor. Figura en el cuaderno de la clase 3 pero **no se alcanzó a
   ver en sala**, y Naim lo excluyó explícitamente. El cuaderno de hoy lo
   reemplazó por `ncol()` + `names()`.
2. **`metro` es un nombre de objeto ocupado.** El cuaderno de hoy crea
   `metro <- filter(curso, transporte == "Metro")` en la Parte 2. Si un distractor
   quiere mostrar el error de "olvidar las comillas", **no escribir
   `transporte == metro`**: en el entorno real de ellos ese objeto existe y el
   error que sale es otro. Usar otra palabra.

---

## 2. Estructura de la clase: tres bloques

| # | Bloque | Duración aprox. | Qué cubre |
|---|---|---|---|
| A | Cuaderno de Colab: *Filtrar, elegir y crear* | ~60 min | `filter()`, `select()`, `%>%`, `mutate()` sobre la encuesta del curso |
| B | ¿La IA nos está haciendo peores? + demo del Sprint 1 | ~55 min | Evidencia experimental sobre IA y aprendizaje, más el Pecha Kucha de 4 min |
| C | **Juego ML2** | ~20 min | Este juego |

El bloque A es de lejos la fuente más segura de anclas: **el cuaderno está escrito
celda por celda y verificado contra los datos reales.** El bloque B tiene un deck
de Google Slides que este briefing no leyó (ver §4).

---

## 3. Bloque A — el cuaderno "Filtrar, elegir y crear"

**Archivo:** `materiales/2026_descripcion_visualizacion_datos/clase04_pipe_filter_select_mutate.ipynb`
**Enlace de clase:** https://colab.research.google.com/github/naimbro/naimbro.github.io/blob/main/materiales/2026_descripcion_visualizacion_datos/clase04_pipe_filter_select_mutate.ipynb

57 celdas, **15 en blanco** para resolver en sala. Trabaja sobre
`datos/encuesta_curso.csv` — las 33 respuestas de ellos mismos — y cierra con la
CEP.

### La tabla que abre el cuaderno (portada, textual)

| | Qué hace |
|---|---|
| `filter()` | se queda con algunas **filas** |
| `select()` | se queda con algunas **columnas** |
| `mutate()` | **agrega** una columna nueva |

Y el `%>%` presentado como *"una cuarta cosa, que no es una función sino un
pegamento"*.

### Parte por parte, con las salidas exactas

| Parte | Qué enseña | Celda de ejemplo | Salida verificada |
|---|---|---|---|
| 1 · Punto de partida | Cargar y reconocer | `nrow(curso)` · `ncol(curso)` · `names(curso)` | 33 filas, 16 columnas |
| 2 · `filter()` | Filas que cumplen una condición | `filter(curso, transporte == "Metro")` | **6 personas** |
| 2 | Que `filter()` no modifica el original | `metro <- filter(...)` → `nrow(metro)` / `nrow(curso)` | 6 y 33 |
| 3 · `select()` | Columnas por nombre, sin comillas | `select(curso, edad, comuna, dominio)` | — |
| 3 | Quitar una columna | `head(select(curso, -estatura))` | — |
| 4 · `%>%` | Encadenar sin nombres intermedios | `curso %>% filter(transporte == "Metro") %>% select(comuna, minutos_viaje)` | 6 filas, 2 columnas |
| 5 · `mutate()` | Columna nueva aritmética | `mutate(tazas_semana = tazas_cafe * 7)` | — |
| 5 | Columna nueva **lógica** | `mutate(es_apple = sistema_operativo == "iOS (Apple)") %>% count(es_apple)` | **TRUE 27, FALSE 6** |
| 6 · La receta | Las tres encadenadas | `mutate(personas_casa = hermanos + 1) %>% filter(personas_casa >= 4) %>% select(...)` | 10 personas |
| — · **La trampa** | Un filtro que miente | `filter(curso, minutos_viaje > 60) %>% count(minutos_viaje)` | **10 personas — y está mal** |
| 7 · Escala real | Lo mismo en 96.122 filas | CEP: `filter(anio == 2026) %>% count(problema_1, sort = TRUE)` | ver §3.4 |

### 3.1 Las frases que el cuaderno dice textualmente (anclas fuertes)

Estas son citas literales del cuaderno; sirven como ancla directa de pregunta:

- Sobre `==`: **«`==` son DOS iguales. Uno solo (`=`) significa "guarda esto acá".
  Dos significan "¿es igual a?".»** El cuaderno la marca como *"el detalle que más
  errores causa en todo el curso"*.
- Sobre las comillas: *«`"Metro"` con mayúscula funciona, `"metro"` no.»*
- Sobre el pipe, la regla en una línea: **«`%>%` agarra lo que hay a su izquierda y
  se lo entrega como primer argumento a la función de su derecha. Por eso adentro
  de `filter()` ya no escribes `curso`: el pipe se lo pasó.»**
- Cómo leerlo: *«toma `curso`, **y luego** quédate con los que van en metro, **y
  luego** muéstrame comuna y minutos de viaje.»*
- Dos reglas prácticas del pipe: **va al final de la línea, nunca al principio de
  la siguiente**; y el atajo de teclado es **`Ctrl` + `Shift` + `M`**.
- Sobre `mutate()`: *«a la izquierda del `=` el nombre que tú eliges (uno solo, sin
  comillas, sin espacios); a la derecha, el cálculo. La columna nueva queda al
  final de la tabla.»*
- Sobre `mutate()` + `count()`: **«`mutate()` para definir el grupo, `count()` para
  medirlo»** — el cuaderno lo llama *"el par que más van a usar en el proyecto"*.
- Sobre guardar: *«todo lo que has hecho hasta acá se mostró en pantalla y se
  perdió»*; para conservar hay que escribir `curso <- curso %>% mutate(...)`.
- Cierre de la receta: **«toma, agrega, filtra, muestra»**.

### 3.2 La trampa — el mejor material de la clase

El cuaderno plantea la pregunta *"¿cuántas personas se demoran más de una hora en
llegar?"* y corre:

```r
curso %>%
  filter(minutos_viaje > 60) %>%
  count(minutos_viaje)
```

**Devuelve 10 personas: 70 (×4), 80 (×1), 85 (×1), 90 (×4).** Y está mal: en el
curso hay **14** personas que se demoran más de una hora. Las que faltan son
justo **las que más viajan: 100, 130, 150 y 180 minutos.**

La explicación del cuaderno, textual: *«alguien escribió `10 min` en esa columna,
así que `minutos_viaje` no es un número, es texto. Y R, al comparar texto, no
mide: **deletrea**. Compara `"130"` con `"60"` letra por letra, ve que `1` viene
antes que `6`, y concluye que 130 es menor que 60.»*

Y el remate, que es la idea que Naim quiere que se lleven:

> **«Lo peligroso no es el resultado: es que no hubo ningún error ni ninguna
> advertencia. La respuesta salió limpia, con cara de correcta.»**

### 3.3 Números verificados sobre `encuesta_curso.csv` (33 filas, 16 columnas)

Todo esto está recalculado contra el CSV real. **Cualquier cifra que el juego
afirme tiene que salir de esta tabla.**

| Variable / filtro | Resultado |
|---|---|
| Columnas | `edad`, `estatura`, `hermanos`, `comuna`, `minutos_viaje`, `transporte`, `horas_sueno`, `horas_redes`, `sistema_operativo`, `tazas_cafe`, `experiencia`, `dominio`, `op_grafico_miente`, `op_interes_programar`, `op_datos_chile`, `op_hablar_publico` |
| `transporte` | Micro o bus 15 · Auto 12 · **Metro 6** |
| `sistema_operativo` | iOS (Apple) 27 · Android 5 · Otro 1 |
| `dominio` (crudo, 10 categorías) | Deporte 7 · Inteligencia artificial 6 · Salud 6 · Educación 4 · Cultura 4 · Vivienda 2 · Medioambiente 1 · politica 1 · Transporte 1 · tecnologia y salud 1 |
| `edad > 19` | 8 personas |
| `hermanos > 1` | 18 personas |
| `tazas_cafe >= 2` | 7 personas |
| `hermanos + 1 >= 4` | 10 personas |
| `es_apple` (TRUE/FALSE) | 27 / 6 |
| `minutos_viaje > 60` — lo que R devuelve | **10** (70×4, 80×1, 85×1, 90×4) |
| `minutos_viaje > 60` — el número correcto | **14** |
| Excluidos por el bug | 100, 130, 150, 180 (y el `10 min`) |
| Columnas que parecen número y son texto | `estatura` (`1,60`), `minutos_viaje` (`10 min`), `horas_sueno` (`3 horas`), `horas_redes` (`5 horas`) |
| Columnas realmente numéricas | `edad`, `hermanos`, `tazas_cafe` |

### 3.4 La CEP al cierre del cuaderno

`datos/cep_consolidada_1994_2026.csv` — **96.122 filas, 25 columnas, 1994–2026.**
El cuaderno la carga y hace dos consultas simétricas:

| Año | n del año | Principal problema del país (`problema_1`) |
|---|---|---|
| 1994 | 1.495 | Delincuencia **284** · Pobreza **281** · Salud 201 · Empleo 163 |
| 2026 | 1.466 | Delincuencia **461** · Salud 193 · Narcotráfico 142 · Pensiones 117 |

Frase de cierre del cuaderno: *«En 1994 la delincuencia y la pobreza iban
empatadas... En 2026 la delincuencia se menciona 461 veces y la pobreza casi
desapareció de la lista. Esa comparación son dos líneas de código y treinta y dos
años de historia de Chile.»*

> **Ojo con solaparse con el juego de la clase 3**, que ya usó la CEP como fuente
> (rondas sobre cobertura, opinión-no-es-hecho y el gráfico de Empleo). Acá la CEP
> es sólo la prueba de que **el mismo código escala**; no es el tema.

### 3.5 Inventario de funciones — el techo del juego

| Nuevas hoy | Ya las tenían |
|---|---|
| `filter()`, `mutate()`, `%>%` | `read.csv()`, `library()`, `nrow()`, `ncol()`, `names()`, `head()`, `count()`, `select()` |

**Tres cosas nuevas en toda la clase.** `select()` aparece marcado explícitamente
en el cuaderno como repaso de la clase 3.

---

## 4. Bloque B — la evidencia sobre IA, y el demo del Sprint 1

### 4.1 El deck de la clase — ⚠️ NO LEÍDO POR ESTE BRIEFING

**«¿La IA nos está haciendo peores? Evidencia experimental sobre IA y
aprendizaje»**, Google Slides:
`17yl3FLp7oUI0828TEwADXsi5CdFhopI4il0EadDemuE`

Este briefing **no** abrió ese deck. Si el juego va a usarlo, hay que leerlo con
`read_file_content` del conector de Drive y **verificar `modifiedTime`** — Naim
suele ajustar decks el mismo día. Lo que el syllabus dice que contiene:

- El experimento de Kenia con 640 emprendedores (Otis, Clarke, Delecourt, Holtz y
  Koning, *Management Science* 2026).
- El panel chino de 26.811 estudiantes que publicó *The Economist* el 18 de agosto
  (Strömberg, Lei y Wu 2026).
- Figuras reproducibles: `materiales/2026_descripcion_visualizacion_datos/figuras/`
  (`kenia_brecha.png`, `china_pendiente.png`, `china_tres.png`,
  `china_outsourcing.png`, `turquia_barandas.png`, más `generar_figuras.py`).

### 4.2 El demo del Sprint 1 — 12 láminas, ancladas

**Archivo:** `teaching/2026_dvd_demo_sprint1.html`
**En línea:** https://naimbro.github.io/teaching/2026_dvd_demo_sprint1.html

Pecha Kucha de 4:00 exactos, 12 láminas × 20 s, sin control remoto. Título:
**«¿La IA nivela o separa?»**. Contenido lámina por lámina (extraído del HTML, es
literal):

| # | Lámina | Contenido anclado |
|---|---|---|
| 01 | El tema | *"Nos prometieron un igualador"*. Consultores BCG con GPT-4 (n = 758): los que **iban peor +43%**, los que **iban mejor +17%**. La brecha se cierra. |
| 02 | El contraejemplo | Kenia: 640 emprendedores, asistente GPT-4 por WhatsApp, 2 meses y medio. **Efecto promedio cero**, y el promedio escondía **+15% a los que ya iban bien y −8% a los que iban mal**. *"Lo que cambió fue cuál consejo cada uno decidió aplicar."* |
| 03 | Decisión 1 · La pregunta | *"«IA y desigualdad» es un tema. Esto es una pregunta"*: entre 2023 y 2026, **¿en qué proporción** de los experimentos la brecha se cierra y en qué proporción se abre? *"Se responde contando filas."* |
| 04 | Decisión 1 · desarmada | Los **cuatro requisitos**: unidad de observación (**el experimento, no la persona**), período (2023–2026), territorio (global), y **el verbo prohibido** (*"no pregunto por qué separa; pregunto en cuántos casos separa"*). *"Si su pregunta no pasa estos cuatro chequeos, todavía es un tema."* |
| 05 | Decisión 2 · La audiencia | **«Tiene que tener puerta.»** *"«Las personas interesadas en el tema» no es una audiencia."* La suya: la **Comisión de uso de IA en el pregrado UAI** — quiénes, dónde (campus Peñalolén) y cuándo (la norma se discute este semestre). |
| 06 | Decisión 2 · Para qué le sirve | Hoy escriben la norma con **anécdotas**; con esta tabla la escriben con un **denominador**. Y la regla: *"si esa comisión no entendería uno de mis gráficos, ese gráfico está mal, aunque sea correcto."* |
| 07 | Decisión 3 · La fuente | **«No existía. La construí.»** `experimentos_ia_desempeno.csv`: 7 experimentos, 13 columnas, **una fila por estudio**. Granularidad: el estudio, *"no tengo microdatos de ninguna persona"*. Quién la produce: *"yo, a mano, leyendo los papers — eso es un dato sobre la fuente"*. |
| 08 | Decisión 3 · Los límites | **Sin periodicidad** (corte al 21-08-2026) · **n = 7** y *"los resultados nulos casi no se publican"* · **no son comparables** (uno mide utilidades, otro notas). *"Puedo contar direcciones; no puedo promediar magnitudes. Por eso mi pregunta dice «en qué proporción» y no «cuánto». **La pregunta se ajustó a la fuente, no al revés.**"* |
| 09 | Decisión 4 · Los datos | **Cuatro líneas**: `library(dplyr)`, `read.csv(...)`, y `exp %>% count(ambito, efecto_promedio_signo, sort = TRUE)`. *"Todo esto salió de la clase 3."* Salida: trabajo/positivo 3 · aprendizaje/negativo 2 · aprendizaje/positivo 1 · trabajo/nulo 1. |
| 10 | Lo que ya se ve | En el trabajo sube, en el aprendizaje baja. BCG +40% · Escritura +18% · Soporte +14% · Kenia 0% · Turquía −17% · China −20% · Física Harvard fuera de escala. |
| 11 | El giro | China, 26.811 estudiantes, 30 meses: **tareas +18%, tiempo −30%, prueba de libro cerrado −20%**. La pérdida es **mayor entre los de alto rendimiento**, concentrada en el 80% que terceriza (*"puntaje altísimo en tiempo brevísimo"*). *"Quien usó la IA y se demoró lo mismo que antes, casi no perdió nada."* |
| 12 | Cierre | **«La IA no separa a los buenos de los malos. Separa a los que la usan como andamio de los que la usan como muleta.»** |

**Nota:** la lámina 09 usa `%>%` con `count()`. Es el mismo pipe del cuaderno,
proyectado en el demo — un puente natural entre los bloques A y B.

### 4.3 El CSV del demo

`datos/experimentos_ia_desempeno.csv` — 7 filas, 13 columnas, **35.035 personas en
total** sumando la columna `n`. Columnas: `estudio`, `autores`, `anio`, `ambito`,
`pais`, `n`, `medida`, `efecto_promedio_pct`, `efecto_promedio_signo`,
`heterogeneidad`, `con_barandas`, `url`, `notas`.

---

## 5. Las ideas grandes de la clase

1. **Recortar es la operación básica.** Casi nunca se quiere la tabla entera: se
   quieren algunas filas, algunas columnas, y a veces una columna que todavía no
   existe.
2. **El pipe se lee como una receta.** `%>%` es simplemente *"y luego"*. Si la
   cadena no se puede leer en voz alta, está mal armada.
3. **`mutate()` + `count()` es el par que resuelve el proyecto:** definir el grupo
   y medirlo.
4. **Un filtro puede mentir sin avisar.** El error que no da error es más
   peligroso que el que sí. (Ésta es la idea que Naim más quiere que quede.)
5. **La pregunta se ajusta a la fuente, no al revés** (demo, lámina 08).
6. **La IA no separa buenos de malos: separa andamio de muleta** (demo, lámina 12).

---

## 6. Alcance: qué SÍ y qué NO

### Sí entra

- `filter()` con `==`, `!=`, `>`, `<`, `>=`, `<=`.
- `select()` por nombre y con signo menos.
- `mutate()` aritmético y lógico.
- `%>%` encadenando 2–4 pasos.
- `count()`, `nrow()`, `ncol()`, `names()`, `head()` (todos ya vistos).
- Lectura e interpretación de la trampa de `minutos_viaje`.
- Las cuatro decisiones del Sprint 1 y los límites de una fuente (demo).
- La evidencia sobre IA y aprendizaje **sólo si se lee el deck primero**.

### No entra

| Fuera | Por qué |
|---|---|
| `group_by()` / `summarise()` | Clase 6 (07-09) |
| `ggplot2` | Clase 8 (28-09) |
| `arrange()` / `desc()` | No se enseñó en ninguna clase |
| `if_else()` / `case_when()` / `ifelse()` | Clase 5 (31-08) |
| `as.numeric()` como **solución** a la trampa | Clase 5. Hoy la trampa sólo se **diagnostica**. (`as.numeric()` sí se vio en la clase 2, pero aplicado a estaturas, no acá.) |
| `class()`, los 4 tipos, "qué es un data frame" **como tema** | Se sacó del syllabus hoy (§1). Sí se puede decir *"la columna es texto"* como hecho dentro de la trampa. |
| `glimpse()` | Veto explícito (§1) |
| `%>%` con `.` o placeholder, `\|>` | Nunca se mostró |

### Regla de arbitraje

Si un alumno responde con algo correcto que no se enseñó (por ejemplo `subset()`,
`require()`, o `curso[curso$transporte == "Metro", ]`), **vale igual**. El
precedente está escrito en el `sessionLens` del juez `generic_specialist` de la
clase 3: *"no confundas 'no está en el cuaderno' con 'está mal'"*.

---

## 7. Recursos y rutas

| Qué | Dónde |
|---|---|
| Syllabus | `C:\Users\naim.bro.k\naimbro.github.io\teaching\2026_descripcion_visualizacion_datos.html` (bloque de la clase 4, ~línea 221) |
| **Cuaderno de hoy** | `C:\Users\naim.bro.k\naimbro.github.io\materiales\2026_descripcion_visualizacion_datos\clase04_pipe_filter_select_mutate.ipynb` |
| Cuaderno de la clase 3 | `...\clase03_contar_con_dplyr.ipynb` |
| Briefing de la clase 3 | `...\briefing_clase03.md` |
| Demo Sprint 1 | `C:\Users\naim.bro.k\naimbro.github.io\teaching\2026_dvd_demo_sprint1.html` |
| Datos del curso | `...\datos\encuesta_curso.csv` (33 × 16) |
| Datos del demo | `...\datos\experimentos_ia_desempeno.csv` (7 × 13) |
| CEP | `...\datos\cep_consolidada_1994_2026.csv` (96.122 × 25) |
| Deck de IA y aprendizaje | Google Slides `17yl3FLp7oUI0828TEwADXsi5CdFhopI4il0EadDemuE` — **leer con el conector de Drive** |
| Sesión precedente del juego | `content/sessions/dataviz_2026/clase_03_dominios_preguntas_fuentes/` |

---

## 8. Semillas de escenarios

**Siete candidatas para cinco cupos** (3 alternativas + 2 abiertas). La elección
final es de Naim.

### Alternativas (elegir 3)

| # | Idea | Ancla | Nota |
|---|---|---|---|
| A1 | **`==` vs `=`.** Cuál de cuatro líneas devuelve a los que llegan en metro. Distractores: `transporte = "Metro"` (error real de dplyr: *"We detected a named input"*), `"transporte" == "Metro"`, y una con la columna mal escrita. | Cuaderno, Parte 2 | El cuaderno lo llama *"el detalle que más errores causa en todo el curso"*. **Fuerte candidata.** |
| A2 | **Qué hace el pipe.** Dada `curso %>% filter(transporte == "Metro")`, ¿por qué adentro de `filter()` ya no se escribe `curso`? | Cuaderno, Parte 4, la regla textual | Conceptual, no de dedos. |
| A3 | **Cuál de las tres.** "Quiero quedarme sólo con las columnas `comuna` y `edad`" → `filter`, `select` o `mutate`. | Cuaderno, tabla de portada | La más fácil; sirve de ronda 1 para calentar. |
| A4 | **La trampa.** `filter(curso, minutos_viaje > 60)` devuelve 10, pero hay 14 que se demoran más de una hora. ¿Por qué? | Cuaderno, sección "Una trampa" | **La mejor del set.** Distractores plausibles: "hay 4 NA", "el filtro necesita `>=`", "R sólo lee las primeras 30 filas". |
| A5 | **Audiencia con puerta.** Cuál de cuatro es una audiencia y no un tema. | Demo, lámina 05 | Útil de cara al Sprint 1 del 31-08. |
| A6 | **"En qué proporción" y no "cuánto".** Por qué el profesor eligió esa forma. | Demo, lámina 08 | La respuesta es *"las magnitudes no son comparables entre estudios"*. Exige haber escuchado el demo. |

### Abiertas (elegir 2) — con `answerFormat: "code"` las de código

| # | Idea | Ancla | Nota |
|---|---|---|---|
| O1 | **Una cadena de tres pasos.** *"Escribe UNA sola cadena con `%>%` que, sobre `curso`, se quede con quienes eligieron `"Deporte"` y muestre `comuna` y `edad`."* | Cuaderno, Partes 2–4 y ejercicio 6 | `answerFormat: "code"`. Precedente directo: las rondas R4 y R5 de la clase 3. |
| O2 | **`mutate()` + `count()`.** *"Crea una columna que marque a quienes toman 2 o más tazas de café al día, y cuéntala. Dos pasos, una sola cadena."* | Cuaderno, ejercicio 10 (respuesta: 7 TRUE / 26 FALSE) | `answerFormat: "code"`. Es *el par* que el cuaderno destaca. |
| O3 | **La trampa, explicada.** Se muestra la salida real (10 personas: 70, 80, 85, 90) y se dice que en el curso hay 14 que se demoran más de una hora. *"Explica por qué el filtro devolvió mal, y qué es lo peligroso de este error en particular."* | Cuaderno, sección "Una trampa" | **La joya del set.** Dos partes que calificar: (a) la columna es texto y R deletrea en vez de medir; (b) **no hubo error ni advertencia**. Ojo: la respuesta parcial típica va a ser sólo (a). |

**Combinación recomendada:** A1 + A4 + A5 · O1 + O3.
Mezcla dedos (A1, O1), concepto peligroso (A4, O3) y proyecto (A5), y sólo una de
las cinco depende de material que este briefing no leyó.

---

## 9. Criterios sugeridos para los jueces

Partir del `config.json` de la clase 3 y ajustar, no escribir de cero.

- **Dimensiones:** `exactitud / completitud / claridad` funcionó bien en la clase
  3 y sigue calzando: hay una ronda de código y una de interpretación.
- **`answerFormat: "code"`** en toda ronda que pida escribir R. Sin eso el teclado
  del teléfono manda `Filter(Curso, Transporte == "Metro")` a los jueces.
- **Indulgencia deliberada** con espacios, comillas, indentación y paréntesis que
  faltan. **Estrictez** con el nombre de la columna, que es lo que la clase enseñó
  a mirar.
- Es la **cuarta** clase del semestre y llevan **tres** sesiones programando. No
  exigir elegancia; exigir que corra.
- En O3, la `completitud` es la dimensión que separa: casi todos van a explicar
  que la columna es texto, y muy pocos van a nombrar que **el error fue
  silencioso**. Que el peso lo refleje.
- **Nunca penalizar que un alumno objete el enunciado.** Si dice "esa premisa
  suena rara, ¿de dónde salió?", el problema es el enunciado.
