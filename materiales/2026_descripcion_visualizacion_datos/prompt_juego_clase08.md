# Prompt para la sesión de Claude Code abierta en `ml2-master-game`

Copiar y pegar tal cual.

---

Vamos a armar el juego de la **clase 8 de Descripción y Visualización de Datos**
(`dataviz_2026`), lunes 28 de septiembre de 2026. Nombre de la sesión:
`clase_08_primeros_graficos_ggplot`.

## Lo primero que tienes que saber

1. **Es la primera clase de `ggplot2`.** Ninguno de los 33 había visto la librería
   antes de hoy: en las clases 2 a 7 sólo se nombró como "lo que viene en la clase 8".
   Ninguna pregunta anterior del juego es sobre gráficos, así que nada de esto está
   quemado.
2. **Revisa si `clase_07_mutate_agrupar_resumir` llegó a jugarse.** Si se jugó, sus
   rondas no se repiten. Hoy el cuaderno reutiliza una receta de la clase 7 (minutos
   promedio por transporte: Auto 40,5 · Metro 83,3 · Micro o bus 77,0), pero la
   pregunta de hoy es **cómo se dibuja**, no cómo se calcula.
3. El bloque de práctica es con el cuaderno de hoy, y el juego cierra la clase.

## El material de la clase 8

Léelo completo antes de escribir preguntas. **Es la única fuente de hoy:**

```
C:\Users\naim.bro.k\naimbro.github.io\materiales\2026_descripcion_visualizacion_datos\clase08_primeros_graficos_ggplot.ipynb
```

Los datos son la encuesta del propio curso (33 filas, `curso`):

```
C:\Users\naim.bro.k\naimbro.github.io\materiales\2026_descripcion_visualizacion_datos\datos\encuesta_curso.csv
```

En la Parte 0 del cuaderno la base se limpia y se guarda con `curso <-`, creando
`minutos_num`, `sueno_num` y `redes_num` con `as.numeric()`. Esas tres columnas
existen en todas las preguntas.

## Anclas verificadas (corridas en R 4.3.3 con ggplot2 3.5.2, 28 de septiembre)

| Hecho | Valor |
|---|---|
| Las tres piezas | datos (`ggplot(curso, ...)`), `aes()` (qué columna va en cada eje), `geom_...()` (con qué forma). La cuarta, `labs()`, lo termina |
| `ggplot(curso)` | rectángulo gris vacío: sabe los datos, no qué dibujar |
| `ggplot(curso, aes(x = transporte))` | eje con tres categorías y **sin barras** |
| `+ geom_bar()` | Auto **12** · Metro **6** · Micro o bus **15**, los mismos números que `count(transporte)`: "`geom_bar()` hace el `count()` por ti" |
| `%>%` en vez de `+` | error: *`mapping` must be created by `aes()`. Did you use `%>%` or `\|>` instead of `+`?* (el cuaderno cita la segunda frase) |
| Dónde va el `+` | al final de la línea, nunca al comienzo de la siguiente |
| Barras acostadas | cambiar `x` por `y` dentro de `aes()` (ejercicio 2, `experiencia`, etiquetas que se pisan) |
| `geom_histogram(binwidth = 1)` sobre `redes_num` | `binwidth` = ancho de cada tramo (una hora). Casi todos entre 2 y 5 horas, cola hasta 10. Aviso *Removed 1 row containing non-finite...* = el `NA` del `"5 horas"`, no es error |
| Histograma sobre `horas_redes` (la columna original, texto) | **no corre**: *`stat_bin()` requires a continuous x aesthetic*. Un histograma necesita números |
| Tabla `viajes` | `curso %>% group_by(transporte) %>% summarise(minutos = mean(minutos_num, na.rm = TRUE))` → Auto 40,5 · Metro 83,3 · Micro o bus 77,0 |
| `geom_bar()` vs. `geom_col()` | `geom_bar()`: sólo `x`, **cuenta filas**. `geom_col()`: `x` **y** `y`, dibuja la altura que tú calculaste. Con `geom_col()` el primer argumento es `viajes`, no `curso` |
| Ejercicio 6 | sueño promedio por transporte: Auto 6,73 · Metro 6,17 · Micro o bus 6,20 |
| `geom_point()` de `redes_num` contra `sueno_num` | **17 puntos** a la vista para **32 personas** con las dos respuestas: cinco respondieron 4 de redes y 6 de sueño, otras cinco 5 y 6, y cada grupo quedó en un solo punto |
| `geom_count()` | arregla eso: punto más grande donde hay más personas. Tendencia **débil**: los que duermen 8 horas o más están a la izquierda, con pocas horas de redes |
| Color | `aes(x = redes_num, y = sueno_num, color = transporte)`: `aes()` no sólo decide los ejes |
| Gráfico terminado | `labs(title = "En auto se llega en la mitad del tiempo", subtitle = "Minutos de viaje, promedio por medio de transporte", x = "Medio de transporte", y = "Minutos (promedio)", caption = "Fuente: encuesta del curso DVD 2026, 33 estudiantes") + theme_minimal()` |
| `theme_minimal()` | cambia el tema: saca el fondo gris. Opcional |
| El control antes de mostrar | **Título:** ¿dice lo que se ve, con un número o una comparación? (como el titular de la clase 6). **Ejes:** ¿qué mide y en qué unidad? **Fuente:** ¿de dónde vienen los datos y cuántas personas son? |
| Las tres ideas del cierre | (1) todo gráfico son tres piezas, datos + `aes()` + `geom`; (2) la forma depende de la pregunta: categorías → barras, cómo se reparte un número → histograma, un número por grupo → columnas, dos números → puntos; (3) sin título, unidades y fuente no está terminado: quien lo lee no ve tu código |
| Desafío opcional | `reorder(dominio, n)` dentro de `aes()` para ordenar las barras. **Es opcional: no entra en ninguna pregunta** |

**No entran:** `ifelse()` (nunca se pasó en clase), escalas (`scale_...`),
`facet_...`, `geom_jitter()`, `geom_boxplot()`, `geom_line()`, `fill =`. No están
en el cuaderno. Regla dura de siempre: **toda pregunta sale del cuaderno.** No
agregues un hecho que no esté ahí, ni siquiera en un distractor. Si un hecho falta,
cambia la pregunta, no agregues el hecho.

## Formato que quiero

El mismo de la clase 7: **sólo preguntas abiertas y cortas**, una o dos líneas de R
o una línea de castellano más una de R. Toda ronda que pida escribir R lleva
`answerFormat: "code"`. Cada enunciado numera lo que pide, **(1)** y **(2)**, y la
rúbrica hereda la de la clase 7 (`exactitud` 0,60 · `completitud` 0,25 ·
`claridad` 0,15, con sus tres techos: entrega incompleta, código que corre y
contesta mal, código que no corre).

- **Unos 20 minutos de pared: cinco rondas** de 120–180 s. Con la medida de la
  clase 5 (reloj + ~2 min de overhead por ronda abierta), haz tú la aritmética con
  el motor y dime cuánto da.
- Las cinco compiten y las cinco pasan por los jueces.

## Semillas (ocho para cinco lugares: elige y proponme el orden)

1. **Las tres piezas** (código, 120 s). Escribe el gráfico de barras que cuenta
   cuántas personas usan cada `transporte`. Caza: `%>%` en vez de `+` (no corre);
   `geom_bar` sin paréntesis (no corre); `aes(x = "transporte")` con comillas (corre
   y dibuja **una sola barra de 33**: corre y contesta mal).
2. **El `+` que era `%>%`** (castellano + código, 120 s). Un compañero escribe
   `ggplot(curso, aes(x = transporte)) %>% geom_bar()` y le sale error. (1) Por qué,
   en una línea. (2) La línea arreglada. Caza: "falta cargar ggplot2"; "hay que
   usar `count()` primero".
3. **`geom_bar()` o `geom_col()`** (castellano + código, 150 s). Con la tabla
   `viajes` ya hecha: (1) qué geometría usas y por qué la otra no sirve; (2) el
   gráfico. Caza: `ggplot(curso, ...)` en vez de `viajes`; `geom_bar()` con `x` e
   `y` (no corre: *`stat_count()` must only have an x or y aesthetic*); `y` fuera de
   `aes()`.
4. **¿Qué forma?** (castellano, 120 s). Para cada pregunta, la geometría:
   (1) ¿cuántas personas hay de cada `dominio`?; (2) ¿cómo se reparten las horas de
   sueño?; (3) ¿los que viajan más duermen menos? Respuesta: barras, histograma,
   puntos. Anclada en la idea 2 del cierre.
5. **Diecisiete puntos** (castellano + código, 150 s). El gráfico de puntos de redes
   contra sueño muestra 17 puntos y hay 32 personas. (1) Dónde están los otros.
   (2) Qué cambias en el código para verlos. Caza: "R borró filas" (borró una sola,
   el `NA`); "falta `na.rm = TRUE`".
6. **El histograma que no corre** (castellano + código, 120 s).
   `ggplot(curso, aes(x = horas_redes)) + geom_histogram(binwidth = 1)` da error.
   (1) Por qué. (2) La línea que sí corre. Caza: cambiar a `geom_bar()` (corre, pero
   cuenta texto y no es un histograma); no saber que existe `redes_num`. Puente
   directo con la clase 5.
7. **Terminarlo** (código, 180 s). Al gráfico de columnas de `viajes`, súmale el
   `labs()` que lo deja listo: título con un hallazgo, eje y con unidad y fuente.
   Caza: título descriptivo sin hallazgo ("Gráfico de transporte"); eje sin unidad;
   sin `caption`; `labs()` encadenado con `%>%`. La ronda grande de la sesión. Vale
   cualquier título que diga un número o una comparación verdadera de la tabla.
8. **Color por grupo** (código, 120 s). El gráfico de puntos de `minutos_num` contra
   `sueno_num`, coloreado por `transporte` (el ejercicio 7). Caza: `color` fuera de
   `aes()`; `minutos_viaje` en vez de `minutos_num`.

Mi sugerencia de cinco, en este orden: **1 → 6 → 7 → 3 → 5**, con la 7 al medio
por la misma razón de siempre (si el bloque se estira, se cae la última, no la ronda
que importa). La 4 es buena de repuesto si quieres una sin código; la 2 si la 1 te
parece demasiado fácil. Dime qué opinas antes de escribir los archivos.

## Contexto del día para los jueces

Es su **primer día con `ggplot2`** y llevan siete clases programando. El lente de
los jueces es **"¿corre y dibuja lo que se pidió?"**, no elegancia: vale 100
cualquier escritura que produzca el gráfico correcto, aunque no sea la del cuaderno
(`data =` y `mapping =` explícitos, barras acostadas con `aes(y = ...)`, un
`labs()` con más campos, sin `theme_minimal()`). Lo que sí se cobra: el `+` entre
piezas, las columnas dentro de `aes()` sin comillas, la base correcta como primer
argumento (`viajes` para `geom_col()`), la columna limpia (`redes_num`, no
`horas_redes`) y los paréntesis de `geom_...()`. Escriben desde un teléfono: no se
cobra indentación, comillas tipográficas, saltos de línea ni un paréntesis de cierre
cuando la intención es inequívoca.

Cuando tengas la sesión escrita, corre `scripts/verify-session-prompt.cjs` y dame el
resumen de rondas, relojes y minutos totales.
