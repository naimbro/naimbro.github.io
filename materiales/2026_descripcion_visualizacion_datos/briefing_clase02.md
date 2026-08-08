# Briefing — Clase 2 · Descripción y Visualización de Datos (UAI, 2026)

Documento de contexto para generar contenido pedagógico (juego, escenarios, preguntas)
basado **exclusivamente** en lo que se enseña en esta clase.

---

## 1. Contexto del curso

- **Curso:** Descripción y Visualización de Datos.
- **Programa:** doble título Sociología – Ingeniería Comercial, Universidad Adolfo Ibáñez.
- **Sesión:** clase 2 de 15, lunes 10-08-2026, 10:00–12:40 (bloque de 2h40).
- **Syllabus completo:** https://naimbro.github.io/teaching/2026_descripcion_visualizacion_datos.html
- **Proyecto del semestre:** cada grupo construye una plataforma web de datos sobre un dominio
  (vivienda, educación, salud, seguridad, empleo, transporte, cultura, deporte, medioambiente, IA).
  El curso avanza por sprints: propuesta → prototipo de datos → prototipo visual → plataforma final.

### Perfil de la audiencia — **esto es lo más importante**

- **Primer año. Nunca han programado.** Ninguno. No saben qué es una variable, una función ni un
  archivo `.csv`.
- **No conocían Google Colab** antes de esta clase.
- Vienen de una clase 1 conceptual (cadena de valor de los datos, qué es un observatorio) y de
  medidas de tendencia central y dispersión vistas a nivel de fórmula, no de código.
- Son estudiantes de **ciencias sociales y negocios**, no de ingeniería: el gancho es
  interpretativo y comunicacional, no algorítmico.

**Implicancia para el juego:** ningún escenario debe requerir escribir código de memoria ni
recordar sintaxis exacta. Lo evaluable es **el criterio**: qué preguntar a unos datos, qué
decisión tomar frente a un dato sucio, qué se puede y qué no se puede concluir, y cómo
comunicarlo. La sintaxis es el vehículo, no el contenido.

---

## 2. Estructura de la clase: tres cuadernos de Colab en R

| # | Cuaderno | Duración | Qué cubre |
|---|---|---|---|
| 1 | Conociendo Google Colab | ~20 min | La herramienta, sin datos |
| 2 | Nuestra primera encuesta | ~50 min | R básico sobre datos del propio curso |
| 3 | Una encuesta de verdad | ~60 min | 458 respuestas reales, datos sucios |

### Cuaderno 1 — Conociendo Google Colab

Celdas de texto vs. celdas de código; ejecutar (▶ / Shift+Enter / Ctrl+Enter); crear, mover y
borrar celdas; editar markdown; **dónde se cambia de R a Python** (Entorno de ejecución → Cambiar
tipo de entorno de ejecución); qué es el entorno de ejecución, que tiene memoria, que el orden de
ejecución importa, y que "Reiniciar y ejecutar todo" arregla casi todo. Guardar copia en Drive.

### Cuaderno 2 — Nuestra primera encuesta

Los alumnos responden un Google Form al inicio de la clase y analizan **sus propias respuestas**.

Conceptos, en orden: R como calculadora → objetos y `<-` → tipos (`numeric`, `character`,
`logical`) y `class()` → `read.csv()` desde una URL → data frame → `names()` para renombrar
columnas → el operador `$` → `str()` → `mean()`, `median()`, `sd()`, `summary()`, `round()` →
`table()`, `prop.table()`, `sort()` → la moda vía `names(which.max(table(x)))` → primera limpieza
de datos (estatura) → `hist()`, `barplot()`, `plot()`, `boxplot()`.

Variables de la encuesta: edad, estatura, hermanos, comuna, minutos de viaje, medio de transporte,
horas de sueño, horas de redes sociales, sistema operativo del celular, tazas de café, experiencia
previa programando, dominio de interés para el proyecto, y cuatro afirmaciones tipo Likert.

### Cuaderno 3 — Una encuesta de verdad

**458 respuestas reales** de estudiantes UAI (campus Santiago y Viña, 2022–2023).

Variables: campus, sección, edad, estatura, estilo alimenticio, distancia a la universidad,
sistema operativo, duchas por semana, contagio de COVID-19, postura frente al deporte obligatorio
(escala 1–5), religión, y seis temas de opinión (aborto libre, eutanasia, matrimonio igualitario,
cannabis, educación gratuita, nueva Constitución).

Añade: tablas de contingencia y `prop.table(..., margin = 1)`, limpieza de datos con `gsub()` y
`as.numeric()`, `which()`, `na.rm = TRUE`, `factor()` con `levels` para ordenar escalas, `tapply()`
para promedios por grupo.

---

## 3. Los datos sucios (materia prima para escenarios)

Esto es el corazón de la clase y la fuente más rica de dilemas reales.

**Estatura declarada** (458 respuestas):
- 122 personas contestaron en **metros** (`1,72`) y el resto en **centímetros** (`172`).
- Formatos mezclados: `1,78 cm`, `163cm`, `179 cm`, `177cm`, y un `178?`.
- Un `15800` (un `158` con dos ceros de más) y un `58`.
- 4 respuestas en blanco.
- Promedio "crudo": **161,5 cm** — un número que no describe a nadie, porque mezcla unidades.
- Tras limpiar: mínimo 150, máximo 198, promedio **173 cm**, 452 casos válidos, 6 `NA`.
- La decisión documentada fue: quitar letras y símbolos → coma decimal a punto → valores < 3 se
  interpretan como metros y se multiplican por 100 → valores fuera de 120–220 cm se marcan como
  faltantes.

**Distancia a la universidad en km:**
- Respuestas como `10 km`, `22.5 KM`, `11km aprox`, `13 kilómetros`, `2 o 1`.
- Alguien respondió **"Ñuñoa"** — una comuna, no una distancia.
- 12 valores quedan como `NA` tras la limpieza, y **R lo hace en silencio**, sin errores ni
  advertencias.
- `2 o 1` se convierte en `21`: un número plausible y completamente falso. Ninguna limpieza
  automática es perfecta.

**Otras trampas presentes en la base:**
- `duchas_semana` **parece** numérica pero contiene `"8 o más"` y `"Prefiero no responder"`.
- `seccion` es un número pero **no es una cantidad**: "la sección promedio es 5,4" no significa nada.
- Campus Santiago tiene 344 respuestas y Viña 114 → comparar conteos absolutos entre ambos engaña.
- Religión: `Islam` tiene 2 casos y `Judía` 5 → un "100%" sobre 2 personas no dice nada de esa
  población.
- 4 personas dejaron en blanco las preguntas de opinión y desaparecen de los gráficos sin aviso.

---

## 4. Las ideas grandes de la clase

Estas son las que vale la pena evaluar. Están enunciadas en los cuadernos casi textualmente.

1. **Que el código corra no significa que el resultado sirva.** `mean()` sobre texto no da error:
   devuelve `NA` con una advertencia. Un promedio absurdo pasa tan silencioso como uno bueno.
2. **Antes de reportar un promedio, mira el mínimo, el máximo y la cantidad de `NA`.**
3. **Limpiar datos es tomar decisiones, y las decisiones se documentan.** Trazabilidad: cualquiera
   debería poder repetir lo que hiciste y llegar al mismo número.
4. **Nunca borres el dato original**: la variable limpia va en una columna nueva.
5. **Lo que no se puede interpretar se marca como faltante, no se inventa.**
6. **No compares conteos entre grupos de distinto tamaño**: normaliza por el tamaño del grupo.
7. **Un porcentaje sin su `n` puede mentir**, y es una de las formas más difíciles de detectar.
8. **Correlación no es causalidad.** El curso es descriptivo: se muestran patrones con honestidad y
   se explicitan los límites de lo que se puede afirmar.
9. **Un gráfico debe poder leerse solo**: título, ejes con nombre, unidades. El color codifica
   información, no decora.
10. **El tipo de variable define qué preguntas tiene sentido hacerle.** Promedio para numéricas,
    frecuencia para categóricas.
11. **La limpieza no es el paso previo al análisis: es la mayor parte del trabajo.**
12. **Uso de IA**: legítimo para *entender* errores y pedir explicaciones; ilegítimo entregar código
    que no puedes explicar. Los alumnos deben registrar en su bitácora cuándo usaron IA y qué
    aprendieron.

### Las tres preguntas que el curso enseña a hacerle a cualquier base

1. ¿De dónde vienen estos datos y **quién quedó fuera**?
2. ¿Qué mide **realmente** cada variable? (aquí: estatura *declarada*, no medida)
3. ¿Qué tuve que **decidir** para poder calcular algo?

---

## 5. Alcance: qué SÍ y qué NO

**Sí se puede asumir conocido al final de la clase 2:**
`<-`, `c()`, `read.csv()`, `head()`, `str()`, `names()`, `nrow()`, `ncol()`, `dim()`, `$`,
`class()`, `mean()`, `median()`, `sd()`, `min()`, `max()`, `summary()`, `round()`, `table()`,
`prop.table()`, `sort()`, `which.max()`, `which()`, `gsub()`, `as.numeric()`, `is.na()`,
`na.rm = TRUE`, `factor(levels = )`, `tapply()`, corchetes `[ ]` para filtrar, `~` como "según",
`hist()`, `barplot()`, `plot()`, `boxplot()`, y `NA` como dato faltante.

**NO usar, porque todavía no lo han visto:**
- `dplyr` y el pipe (`%>%`, `filter()`, `select()`, `mutate()`, `group_by()`, `summarise()`) →
  clases 5 y 6.
- `ggplot2` → clase 8.
- Inferencia estadística, tests de hipótesis, valores-p, intervalos de confianza, regresión → **no
  son parte de este curso en ningún momento**. El curso es descriptivo.
- Joins, funciones propias, loops, expresiones regulares más allá de la receta `[^0-9.,]`.
- Instalación de paquetes (`install.packages()`): todo se hace con R base.

---

## 6. Recursos (todos accesibles públicamente)

**Cuadernos de Colab** (configurados para R; se abren en el navegador):
- Cuaderno 1: https://colab.research.google.com/github/naimbro/naimbro.github.io/blob/main/materiales/2026_descripcion_visualizacion_datos/clase02_1_conociendo_colab.ipynb
- Cuaderno 2: https://colab.research.google.com/github/naimbro/naimbro.github.io/blob/main/materiales/2026_descripcion_visualizacion_datos/clase02_2_nuestra_encuesta.ipynb
- Cuaderno 3: https://colab.research.google.com/github/naimbro/naimbro.github.io/blob/main/materiales/2026_descripcion_visualizacion_datos/clase02_3_encuesta_uai.ipynb

**Fuente de los cuadernos** (JSON legible, para inspeccionar el texto completo):
- https://raw.githubusercontent.com/naimbro/naimbro.github.io/main/materiales/2026_descripcion_visualizacion_datos/clase02_1_conociendo_colab.ipynb
- https://raw.githubusercontent.com/naimbro/naimbro.github.io/main/materiales/2026_descripcion_visualizacion_datos/clase02_2_nuestra_encuesta.ipynb
- https://raw.githubusercontent.com/naimbro/naimbro.github.io/main/materiales/2026_descripcion_visualizacion_datos/clase02_3_encuesta_uai.ipynb

**Datos:**
- Encuesta UAI 2022-2023, 458 respuestas (la base del cuaderno 3):
  https://raw.githubusercontent.com/naimbro/naimbro.github.io/main/materiales/2026_descripcion_visualizacion_datos/encuesta_uai.csv
- Respuestas de ejemplo con la estructura del formulario del curso:
  https://raw.githubusercontent.com/naimbro/naimbro.github.io/main/materiales/2026_descripcion_visualizacion_datos/respuestas_ejemplo.csv

**Otros:**
- Syllabus: https://naimbro.github.io/teaching/2026_descripcion_visualizacion_datos.html
- Carpeta completa de materiales: https://github.com/naimbro/naimbro.github.io/tree/main/materiales/2026_descripcion_visualizacion_datos

---

## 7. Semillas de escenarios

Ideas ancladas en el material real. No son las preguntas finales: son puntos de partida.

1. Un compañero te muestra que la estatura promedio del curso es **161,5 cm** y concluye que el
   curso es más bajo que el promedio nacional. El código corrió sin errores. ¿Qué le dices?
2. Tu grupo va a reportar que **el 100% de los estudiantes musulmanes** está de acuerdo con el
   aborto libre. ¿Publicas ese dato? Justifica.
3. Alguien respondió **"Ñuñoa"** en la pregunta de a cuántos kilómetros vive. ¿Qué haces con esa
   respuesta, y qué dejas escrito?
4. Tu limpieza automática convirtió la respuesta **"2 o 1"** en el número **21**. Nadie lo notó
   hasta ahora. ¿Qué implica esto para el resto de tu base?
5. Tienes un gráfico de barras que compara cuántos estudiantes usan iPhone en Santiago (344
   respuestas) y en Viña (114). Tu compañera dice que en Santiago hay "muchos más iPhone".
   ¿Tiene razón?
6. Encontraste que quienes pasan más horas en redes sociales duermen menos. Tu grupo quiere titular
   la plataforma con "Las redes sociales te quitan el sueño". ¿Qué respondes?
7. Vas a calcular el promedio de duchas semanales, pero la variable trae `"8 o más"` y
   `"Prefiero no responder"`. Propón una decisión y defiéndela.
8. Tu gráfico quedó con el título `Histogram of respuestas$estatura_cm` y el eje X dice
   `respuestas$estatura_cm`. Funciona perfecto. ¿Está listo para publicarse?
9. Le pediste a una IA que limpiara tu base y te devolvió código que funciona. No entiendes dos
   líneas. ¿Qué haces antes de usarlo en tu proyecto?
10. Tu base tiene una columna `seccion` con números del 1 al 13. ¿Tiene sentido reportar la sección
    promedio?

## 8. Criterios sugeridos para los jueces

Alineados con los criterios transversales del curso:

- **Rigor descriptivo:** ¿detecta el problema real, o responde con una fórmula genérica?
- **Trazabilidad:** ¿su respuesta deja registro de qué decidió y por qué, de modo que otra persona
  pueda repetirlo?
- **Honestidad interpretativa:** ¿distingue lo que los datos muestran de lo que le gustaría
  concluir? ¿nombra los límites?
- **Comunicación:** ¿podría entenderlo alguien fuera del curso?

Penalizar: respuestas que citan sintaxis de memoria sin criterio, que invocan tests estadísticos
(fuera de alcance), que "arreglan" datos inventando valores, o que concluyen causalidad.
