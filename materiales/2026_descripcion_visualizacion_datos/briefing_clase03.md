# Briefing — Clase 3 · Descripción y Visualización de Datos (UAI, 2026)

Documento de contexto para generar contenido pedagógico (juego, escenarios, preguntas)
basado **exclusivamente** en lo que se enseña en esta clase.

---

## 1. Contexto del curso

- **Curso:** Descripción y Visualización de Datos.
- **Programa:** doble título Sociología – Ingeniería Comercial, Universidad Adolfo Ibáñez.
- **Sesión:** clase 3 de 15, lunes 17-08-2026, 10:00–12:40 (bloque de 2h40).
- **Título en el syllabus:** *Dominios, preguntas y fuentes de datos*.
- **Syllabus completo:** https://naimbro.github.io/teaching/2026_descripcion_visualizacion_datos.html
- **Hito:** esta clase **inicia el Sprint 1** (propuesta de dominio, pregunta, fuentes y audiencia),
  que se entrega el lunes 31-08-2026.

### Perfil de la audiencia — actualizado tras la clase 2

- **Primer año.** Antes de la clase 2 ninguno había programado nunca.
- **Llevan exactamente una clase de R.** Vieron Colab, objetos, tipos, `data frame`, medidas de
  tendencia central, `table()`, limpieza de una columna sucia y cuatro gráficos de R base.
- Ya se toparon con datos sucios de verdad (la encuesta UAI de 458 respuestas: estaturas en metros
  mezcladas con centímetros, un `"Ñuñoa"` en una pregunta de kilómetros).
- Son estudiantes de **ciencias sociales y negocios**. El gancho es interpretativo, no algorítmico.

**Implicancia para el juego:** el peso conceptual está en el Bloque B (fuentes y preguntas); el
Bloque A es entrenamiento de dedos con **una sola función**, `count()`. Lo evaluable es **el
criterio de fuentes y preguntas**: si una pregunta se puede responder con los datos que existen, qué
mide realmente una fuente, quién decidió qué se mide, y qué queda fuera. **Ningún escenario debe
requerir escribir código**; a lo más, leer una salida de `count()` y decir qué muestra y qué no.

---

## 2. El dato que organiza la clase: qué eligieron ellos

En la encuesta de la clase 2 (pregunta 14, *"¿Sobre qué dominio te gustaría que tratara tu proyecto
del semestre?"*), hubo **33 respuestas**, que una vez
limpiadas quedan así:

| Dominio | Alumnos |
|---|---|
| Deporte | 7 |
| Salud | 7 |
| Inteligencia artificial | 6 |
| Educación | 4 |
| Cultura | 4 |
| Vivienda | 2 |
| Medio ambiente | 1 |
| Política | 1 |
| Transporte | 1 |

**Ojo: esa tabla no sale sola de `count()`.** La columna cruda tiene 10 categorías, no 9, y hay que
tomar tres decisiones para llegar a la tabla de arriba: alguien escribió `politica` en minúscula y
sin tilde (R lo cuenta aparte de `Política`), alguien escribió `Medioambiente` en una palabra, y
alguien no eligió del menú y escribió `tecnologia y salud`, que acá se contó como Salud. **Son
decisiones, y hay que documentarlas** — es exactamente la lección de la clase 2 aplicada a la
variable que decide los grupos de su propio proyecto.

Esta tabla no es decoración: es **el eje de la clase**. Los tres dominios más votados
(deporte, IA y cultura, **17 de 33 alumnos**) son exactamente aquellos donde la estadística pública
chilena es más débil, y son los tres que la fuente más prestigiosa del país **no mide**.

---

## 3. Estructura de la clase: tres bloques

| # | Bloque | Duración | Qué cubre |
|---|---|---|---|
| 0 | Administrativo | ~10 min | Lista de organizaciones para la visita de vinculación profesional |
| A | Colab: contar con dplyr | ~55 min | `count()` repetido sobre la encuesta del curso |
| B | Taller de dominios, preguntas y fuentes | ~65 min | La CEP proyectada + catálogo + formulación de la pregunta |
| C | Juego ML2 | ~20 min | Repaso y discusión |

### Bloque A — "Contar con dplyr" (cuaderno de Colab, en R)

Los alumnos trabajan sobre **sus propias respuestas** a la encuesta del curso, ya completa.

**El bloque enseña UNA sola cosa y la repite hasta que salga sin pensar: contar cuántos hay de cada
tipo.** Son estudiantes que llevan una clase programando en su vida; el objetivo es fluidez, no
cobertura.

1. **`library(dplyr)`** — qué es un paquete y por qué hay que abrirlo.
2. **`read.csv()`** desde una URL, sobre una versión de la encuesta con los nombres de columna ya
   limpios, para que cargar la base sean dos líneas.
3. **`glimpse()`** para ver la base de un vistazo.
4. **`count(curso, columna)`** — la función del día, repetida en **siete ejercicios** de la misma
   forma: sistema operativo, transporte, experiencia, hermanos, café, horas de sueño, dominio.
   Después `sort = TRUE`, después dos columnas a la vez, y `select()` al final.
5. **La observación, no el muro:** al contar aparecen categorías con **`n = 1`** — una persona. Un
   "100%" sobre una persona no describe a nadie. De ahí sale, sin dramatismo, que 33 casos no
   alcanzan para el proyecto y hay que salir a buscar datos de otro. Ahí empieza el Bloque B.
6. **Cierre-puente:** `count()` de la pregunta 14 (los dominios elegidos) y de la pregunta 17
   (*"Los datos públicos en Chile son fáciles de encontrar"*), que queda anotada como **el
   pronóstico del curso**, a contrastar al final de la clase.

**Datos reales de la encuesta del curso, útiles para el cuaderno y para el juego** (33 respuestas,
verificados sobre la planilla):

- **Medio de transporte:** micro o bus 15, auto 12, metro 6.
- **Sistema operativo del celular:** iOS 27, Android 5, Otro 1.
- **Experiencia previa programando:** "sé usar Excel o Sheets" 16, "ninguna, primera vez" 9,
  "he programado un poco" 7, "bastante experiencia" 1.
- **Categorías de una sola persona.** En sistema operativo, `Otro` tiene **n = 1**. En dominio,
  `Medioambiente`, `politica`, `Transporte` y `tecnologia y salud` tienen **n = 1** cada una.
  Cualquier "100%" sobre una de esas categorías **es una sola persona**. Éste es el hecho que
  sostiene la lección de que 33 casos no alcanzan.
- **Datos sucios que el cuaderno hace VER pero no arreglar.** Al contar las horas de sueño aparecen
  `3` y `3 horas` como **dos categorías distintas**, porque una persona escribió la palabra. Al
  contar la comuna aparecen `Las condes` y `las condes` como **dos comunas distintas**, igual que
  `Ñuñoa` y `ñuñoa`. El cuaderno dice explícitamente que **arreglar eso es tema de las próximas
  clases**: hoy sólo se nota. *(No preguntar en el juego CÓMO se arregla — no se enseñó.)*
- **La columna de dominio tiene 10 categorías pero el curso no eligió 10 temas:** alguien escribió
  `politica` en minúscula y sin tilde, alguien `Medioambiente` en una palabra, y alguien no eligió
  del menú y escribió `tecnologia y salud`. **Eso no lo resuelve R sola: es una decisión, y se
  documenta.**
- **La pregunta 17 es el gancho de toda la clase:** ante *"Los datos públicos en Chile son fáciles
  de encontrar"*, **21 de 33 respondieron "De acuerdo" o "Muy de acuerdo"** (20 + 1), 10 quedaron
  neutros y sólo 2 en desacuerdo. **Casi dos tercios del curso cree que va a ser fácil.** El
  Bloque B se encarga de mostrarles el Ministerio del Deporte publicando sólo PDF, la CASEN sin
  CSV, los enlaces rotos del Servel y a Chile con cero modelos de IA. **Conviene volver a esa
  cifra al cerrar la clase.**

### Bloque B — Taller de dominios, preguntas y fuentes

**B1. La CEP, proyectada (el profesor maneja el código; los alumnos sólo miran).**
Caso común de cómo se lee e interroga una fuente. Ver sección 4.

**B2. El catálogo de fuentes.** Cada grupo recibe las fuentes de su dominio. Ver sección 5.

**B3. Ficha de fuente y formulación.** Cada grupo evalúa una fuente en cuatro ejes —**cobertura,
granularidad, periodicidad, sesgos y límites**— formula **3 preguntas descriptivas candidatas** y
se queda con **1**. Ese es el arranque del Sprint 1.

**Criterio de una buena pregunta descriptiva en este curso:**
se responde con datos que existen; nombra la unidad de observación, el período y el territorio;
no pregunta por causas; y se puede contestar con una tabla o un gráfico.

### Bloque C — Juego ML2 (~20 min)

---

## 4. La CEP: la fuente estrella (material del bloque B1)

**Qué es:** la Encuesta CEP (Centro de Estudios Públicos) es la encuesta de opinión pública más
antigua y citada de Chile. Su **base consolidada** junta todas las encuestas en un solo archivo, con
nombres de variables y escalas armonizadas para poder comparar a través del tiempo.

**Cifras exactas de la base que usaremos** (todas verificadas sobre el archivo real):

- Cubre desde la **encuesta N°29 (noviembre-diciembre 1994)** hasta la **N°96 (abril-mayo 2026)**.
- **96.122 personas encuestadas** en total.
- El archivo original del CEP tiene **más de 4.600 columnas**. La versión del curso tiene **25**.
- **32 años**, pero **falta 2020**: ese año no se hizo la encuesta (pandemia). *Tener periodicidad
  declarada no garantiza que el dato exista todos los años.*
- El tamaño de la muestra **cambia todos los años**: desde **1.402 casos (2018)** hasta
  **4.560 (2012)**. Comparar conteos absolutos entre años engaña; hay que usar porcentajes.
- Sólo entrevista a **personas de 18 años o más** (edades de 18 a 99 en la base). Los menores de
  edad **no existen** en esta fuente.
- **Ñuble aparece recién desde 2018**, porque la región no existía antes. La geografía de una base
  de datos tiene fecha de nacimiento.

**La variable central — `problema_1`:**

> *"A continuación le mostraré una serie de problemas que tiene nuestro país. ¿Cuáles son los tres
> problemas a los que debería dedicar mayor esfuerzo en solucionar?"*

Está en **las 32 encuestas**. Sus **29 categorías** (27 problemas más "No sabe" y "No contesta")
son: Pensiones, Corrupción, Delincuencia, Derechos humanos, Educación, Empleo, Pobreza, Protección
del medio ambiente, Narcotráfico, Salud, Sueldos, Transporte público, Vivienda, Inmigración,
Reformas constitucionales, Desigualdad, Alzas de precios, Protestas y desórdenes callejeros,
Terrorismo, Infraestructura, Sistema judicial, Sistema electoral binominal, Energía, Violencia con
fines políticos, Pandemia por Covid-19, Violencia, La Constitución.

**Series reales para mostrar en pantalla** (% de menciones como primer problema, por año):

| Año | Delincuencia | Educación | Empleo | Salud | Vivienda |
|---|---|---|---|---|---|
| 1994 | 19,0 | 7,8 | 10,9 | 13,4 | 4,8 |
| 2001 | 12,6 | 6,3 | **26,5** | 9,8 | 4,4 |
| 2011 | 23,2 | **16,5** | 6,4 | 11,1 | 4,1 |
| 2019 | 14,0 | 7,8 | 3,8 | 10,8 | **1,5** |
| 2024 | 30,9 | 6,3 | **2,2** | 7,7 | 2,3 |
| 2026 | **31,4** | 7,9 | 4,7 | 13,2 | 2,9 |

Tres historias que los datos recuerdan solos:

- **Educación salta de 10,0% (2010) a 16,5% (2011)**: el movimiento estudiantil quedó grabado en la
  serie. Para 2023 había caído a 4,8%.
- **Empleo se desploma de 26,5% (2001) a 2,2% (2024)**.
- **Delincuencia sube de 19,0% (1994) a 31,8% (2025)**, su máximo histórico.

### El hallazgo que es la lección de la clase

En las 29 categorías de `problema_1` **no existe deporte, no existe cultura, y no existe
inteligencia artificial**.

El Estado y el CEP llevan **32 años** preguntándole a los chilenos cuáles son los problemas del
país, y esos tres nunca entraron en la lista de alternativas. Alguien decidió, alrededor de 1994,
qué contaba como "problema del país", y esa decisión sigue mandando en 2026.

Esto deja fuera de la CEP a **17 de los 33 alumnos del curso**. Y ése es justamente el punto:

> **Que tu tema no esté en la fuente más famosa del país no es una falla tuya. Es un dato sobre la
> fuente.** Toda base de datos es el resultado de que alguien decidió qué valía la pena contar. Lo
> que no se mide, no aparece; y lo que no aparece, tiende a no discutirse.

---

## 5. El catálogo de fuentes (material del bloque B2)

Todas verificadas: se comprobó que el enlace responde y que el archivo existe.

### Cubren bien

| Fuente | Dominio | Qué trae | Formato |
|---|---|---|---|
| **CEP, base consolidada** | salud, educación, vivienda, transporte, medio ambiente, política | Opinión pública 1994–2026, 96.122 casos | CSV listo para el curso |
| **Mineduc, Datos Abiertos** | educación | Matrícula, rendimiento, asistencia, docentes, establecimientos | CSV |
| **CASEN 2024** | vivienda, salud, pobreza, ingresos | Encuesta socioeconómica nacional | Stata, R, SPSS (sin CSV) |
| **ENPCCL 2024** | cultura | Participación cultural y comportamiento lector, 15 años y más, zonas urbanas | `.RData`, `.dta`, `.sav` |
| **Epoch AI** | inteligencia artificial | Modelos de machine learning desde 1950: cómputo, parámetros, país, año. `notable_ai_models.csv` trae **1.046 modelos** y 47 columnas; `all_ai_models.csv`, **3.574** y 57 | CSV directo por URL |
| **footballcsv / internationals** | deporte | Todos los partidos internacionales de fútbol, 1872 a hoy, un CSV por año | CSV directo por URL |
| **SINCA (Medio Ambiente)** | medio ambiente | Calidad del aire: MP10, MP2.5, ozono, NO2, SO2, CO, 16 regiones, horario | portal web |
| **Servel** | política | Resultados electorales | CSV / XLSX |
| **DEIS (Minsal)** | salud | Defunciones, egresos hospitalarios | CSV |

### Advertencias que hay que decirles explícitamente

- **Deporte (7 alumnos) e IA (6 alumnos) son los dominios peor cubiertos por la estadística pública
  chilena.** El Ministerio del Deporte publica la Encuesta Nacional de Actividad Física y Deporte
  **sólo como informe en PDF**, sin base de datos descargable. La actividad física con microdato
  está en la Encuesta Nacional de Salud de Minsal, pero el último microdato disponible es
  **2016-2017**. Para IA, el **ILIA** de CENIA (índice de 19 países latinoamericanos) resulta ser
  **sólo PDF más un visualizador**, sin datos crudos. Esos grupos van a tener que apoyarse en
  fuentes internacionales o construir su propio dato — y conviene que lo sepan **hoy**, no en
  octubre.
- **La trampa del `CHI.csv`:** en el sitio football-data.co.uk existe un archivo llamado `CHI.csv`.
  **Es China, no Chile.** Chile no está en ese sitio. Es exactamente el tipo de error que se comete
  al bajar un archivo por su nombre sin abrirlo y mirar qué trae adentro.
- **Formato no es lo mismo que disponibilidad:** CASEN y ENPCCL sólo publican en formatos de
  software estadístico (`.dta`, `.sav`, `.RData`), no en CSV. El dato es público, pero para leerlo
  hay que saber cómo.
- **Chile no existe en la base de Epoch AI.** De los 1.046 modelos de `notable_ai_models.csv`,
  **cero** están atribuidos a Chile (Estados Unidos tiene 442, China 113, Reino Unido 55). Es el
  mismo fenómeno que la ausencia de deporte en la CEP, visto desde el otro lado: acá el país que
  falta es el nuestro. Un grupo de IA que quiera hablar de Chile va a tener que explicar por qué su
  país no aparece — y eso **es** un hallazgo, no un fracaso.
- **La base de Epoch viene sucia:** 78 de los 1.046 registros tienen el país escrito dos veces en la
  misma celda (`"United States of America,United States of America"`). Si cuentan modelos por país
  sin mirar la columna, les van a salir dos Estados Unidos distintos.

---

## 6. Las ideas grandes de la clase

Éstas son las que vale la pena evaluar en el juego.

1. **Toda base de datos es el resultado de una decisión sobre qué valía la pena contar.** Lo que no
   se mide, no aparece; y lo que no aparece, tiende a no discutirse.
2. **Que tu tema no esté en una fuente no es tu culpa: es un dato sobre esa fuente**, y merece ser
   dicho en voz alta en la plataforma.
3. **Una pregunta sólo es investigable si existen datos que puedan responderla.** Formular la
   pregunta y buscar la fuente no son dos pasos: son el mismo paso, hecho de ida y vuelta.
4. **Un tema no es una pregunta.** "Vivienda" es un tema; "cómo cambió la proporción de chilenos
   que menciona la vivienda como principal problema del país entre 1994 y 2026" es una pregunta.
5. **Las cuatro preguntas que se le hacen a una fuente antes de usarla:**
   **cobertura** (¿a quiénes incluye y a quiénes deja fuera?), **granularidad** (¿persona, comuna,
   región, país?), **periodicidad** (¿cada cuánto, y falta algún año?) y **sesgos y límites**
   (¿quién la produce y para qué?).
6. **Periodicidad declarada no es lo mismo que dato existente**: la CEP dice ser periódica y aun
   así no hay 2020.
7. **Si el tamaño de la muestra cambia entre años o grupos, los conteos absolutos engañan.**
   Se comparan porcentajes.
8. **Un cruce de dos variables sobre una base chica deja celdas de 1 o 2 casos.** Ningún porcentaje
   calculado sobre 2 personas describe a nadie.
9. **La geografía de una base tiene fecha de nacimiento**: Ñuble no aparece antes de 2018 porque la
   región no existía.
10. **Quién no está en la base importa tanto como quién está**: la CEP no entrevista a menores de
    18 años, así que ninguna pregunta sobre adolescentes se puede responder con ella.
11. **Nunca uses un archivo por su nombre sin abrirlo**: `CHI.csv` es China.
12. **Definir la audiencia es parte de definir la pregunta.** Una pregunta sin destinatario no
    tiene con qué medir si la respuesta sirvió.

### Las tres preguntas del curso, aplicadas a una fuente externa

1. ¿De dónde vienen estos datos y **quién quedó fuera**?
2. ¿Qué mide **realmente** cada variable?
3. ¿Qué tuve que **decidir** para poder calcular algo?

---

## 7. Alcance: qué SÍ y qué NO

**Sintaxis de R que se puede asumir conocida** (todo viene de la clase 2; esta clase no agrega
funciones nuevas): `<-`, `c()`, `read.csv()`, `head()`, `str()`, `names()`, `nrow()`, `dim()`, `$`,
`class()`, `mean()`, `median()`, `sd()`, `summary()`, `round()`, `table()`, `prop.table()`,
`sort()`, `which.max()`, `which()`, `gsub()`, `as.numeric()`, `is.na()`, `na.rm = TRUE`,
`factor(levels = )`, `tapply()`, corchetes `[ ]`, `~` como "según", `hist()`, `barplot()`,
`plot()`, `boxplot()`, y `NA`.

**ESTA CLASE INTRODUCE `dplyr`, antes de lo que decía el programa original.** Lo nuevo es, en
total, cinco cosas: `library(dplyr)`, `glimpse()`, `count()`, el argumento `sort = TRUE` y
`select()`. Nada más.

`count()` **reemplaza** a `table()` como la forma de contar en este curso. Los alumnos vieron
`table()` la clase 2 y ahora ven la versión de dplyr, que devuelve una tabla con una fila por
categoría y una columna `n`.

**No se usó** `prop.table()`, ni `tapply()`, ni porcentajes calculados, ni gráficos, ni limpieza de
datos con `gsub()`/`tolower()`/`trimws()`. Los datos sucios **se observan** (que `3` y `3 horas`
sean categorías distintas; que `Las condes` y `las condes` también) pero **no se arreglan**: el
cuaderno dice explícitamente que eso es tema de las próximas clases.

**NO usar, porque todavía no lo han visto:**
- Del resto de `dplyr`: el pipe (`%>%`), `filter()`, `mutate()`, `group_by()` y `summarise()` →
  clases 5 y 6. **Sólo se vieron `count()` y `select()`.**
- `ggplot2` → clase 8.
- Inferencia estadística, tests de hipótesis, valores-p, intervalos de confianza, regresión,
  márgenes de error, representatividad muestral formal, ponderadores → **fuera del curso**. El
  curso es descriptivo. *(La base CEP incluye una columna `ponderador`; se menciona que existe y
  para qué sirve, pero no se usa ni se evalúa.)*
- Joins, funciones propias, loops, APIs, scraping.
- `install.packages()`: todo con R base.

---

## 8. Recursos

**Datos del curso (cargables por URL desde Colab):**
- CEP consolidada, versión del curso — 96.122 filas × 25 columnas, con etiquetas de texto:
  https://raw.githubusercontent.com/naimbro/naimbro.github.io/main/materiales/2026_descripcion_visualizacion_datos/datos/cep_consolidada_1994_2026.csv
- CEP, problemas del país por año (agregado, 16 KB, listo para graficar):
  https://raw.githubusercontent.com/naimbro/naimbro.github.io/main/materiales/2026_descripcion_visualizacion_datos/datos/cep_problemas_por_anio.csv

**Fuentes externas verificadas:**
- CEP, página oficial de la base consolidada: https://www.cepchile.cl/opinion-publica/encuesta-cep/
- Epoch AI, modelos de IA: https://epoch.ai/data/notable_ai_models.csv
- footballcsv, partidos internacionales: https://github.com/footballcsv/cache.internationals
- ENPCCL 2024 (cultura): https://observatorio.cultura.gob.cl/index.php/encuestas-de-participacion-cultural/
- Mineduc, Datos Abiertos: https://datosabiertos.mineduc.cl/
- CASEN 2024: https://observatorio.ministeriodesarrollosocial.gob.cl/encuesta-casen-2024
- SINCA, calidad del aire: https://sinca.mma.gob.cl/

**Otros:**
- Syllabus: https://naimbro.github.io/teaching/2026_descripcion_visualizacion_datos.html
- Briefing de la clase 2 (contexto previo): `briefing_clase02.md` en la misma carpeta.

---

## 9. Semillas de escenarios

Ideas ancladas en el material real. Son puntos de partida, no las preguntas finales.

1. Tu grupo eligió **deporte**. Descubres que la CEP lleva 32 años preguntando por los problemas
   del país y **deporte nunca fue una alternativa**. ¿Qué concluyes sobre tu tema, y qué concluyes
   sobre la CEP?
2. Un compañero muestra que las menciones a **Empleo** cayeron de 26,5% en 2001 a 2,2% en 2024, y
   titula: *"a los chilenos dejó de importarles el trabajo"*. ¿Qué le dices?
3. Quieres estudiar qué opinan los **adolescentes** sobre la educación y planeas usar la CEP.
   ¿Puedes? ¿Por qué?
4. Comparas cuántas personas mencionaron Salud en 2012 (4.560 encuestados) y en 2018 (1.402), y en
   2012 hay muchas más menciones. ¿Qué está mal en esa comparación?
5. Tu grupo quiere comparar la región de **Ñuble** entre 2010 y 2026. ¿Qué problema te vas a
   encontrar, y no es culpa de los datos?
6. Encontraste un archivo llamado **`CHI.csv`** con resultados de fútbol y lo cargaste pensando que
   era Chile. Era China. ¿Qué paso te saltaste?
7. Tu pregunta de proyecto es *"¿por qué aumentó la delincuencia en Chile?"*. Tu profesor dice que
   no sirve para este curso. ¿Por qué, y cómo la reformulas?
8. Las menciones a **Educación** saltan de 10,0% en 2010 a 16,5% en 2011 y después bajan. ¿Qué
   dirías que muestra ese salto, y qué **no** puedes afirmar con este solo dato?
9. En la base CEP no existe el año **2020**. Tu gráfico de línea lo une como si nada. ¿Qué haces y
   qué le explicas al lector?
10. El Ministerio del Deporte publica su encuesta sólo como **informe en PDF**, sin base de datos.
    Tu grupo necesita el dato. ¿Qué opciones honestas tienes, y cuál descartas?
11. Tu grupo dice que su audiencia son "las personas interesadas en el tema". ¿Por qué eso no
    sirve, y qué pones en su lugar?
12. Al cruzar dos variables en la encuesta del curso, te sale que el **50% de quienes vienen en
    bicicleta** duerme menos de 6 horas. Son **dos personas**. ¿Publicas ese dato?
13. Tu grupo eligió **inteligencia artificial** y quiere hablar de Chile. En la base de Epoch AI,
    de 1.046 modelos, los atribuidos a Chile son **cero**. ¿Es el fin de tu proyecto o es tu primer
    hallazgo? Defiende tu respuesta.
14. Cuentas modelos de IA por país y te salen **dos Estados Unidos** en la misma tabla, con cifras
    distintas. ¿Qué pasó, y qué te dice eso sobre confiar en una columna sin mirarla?
15. Dos grupos eligieron el mismo dominio y llegaron a la misma fuente, pero uno pregunta por
    personas y el otro por comunas. ¿Pueden ambos responder con la misma base? ¿De qué depende?

---

## 10. Criterios sugeridos para los jueces

Alineados con los criterios transversales del curso:

- **Criterio de fuentes:** ¿evalúa cobertura, granularidad, periodicidad y límites, o acepta la
  fuente porque existe y es oficial?
- **Rigor descriptivo:** ¿distingue lo que la fuente muestra de lo que le gustaría concluir?
  ¿reconoce cuándo una pregunta no se puede responder con los datos disponibles?
- **Honestidad sobre lo ausente:** ¿nombra a quién deja fuera la fuente, y trata esa ausencia como
  información en vez de esconderla?
- **Comunicación:** ¿podría entenderlo alguien fuera del curso?

Penalizar: respuestas que tratan "oficial" como sinónimo de "bueno"; que proponen preguntas
causales o de opinión disfrazadas de descriptivas; que resuelven la falta de datos inventándolos o
suponiendo que "debe existir en alguna parte"; que citan nombres de funciones sin criterio; o que
invocan tests estadísticos, márgenes de error o representatividad formal (fuera de alcance).
