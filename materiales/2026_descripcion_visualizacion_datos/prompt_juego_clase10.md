# Prompt para la sesión de Claude Code abierta en `ml2-master-game`

Copiar y pegar tal cual.

---

Vamos a armar el juego de la **clase 10 de Descripción y Visualización de Datos**
(`dataviz_2026`), lunes 19 de octubre de 2026. Nombre de la sesión:
`clase_10_tres_variables_y_titular`.

## Lo primero que tienes que saber

1. **Es un juego corto: dos rondas, unos 9 minutos de pared.** Cierra la clase después de
   las exposiciones del ejercicio de redacción, y la clase no tiene más tiempo.
2. **La clase 9 no tuvo juego.** El último juego fue `clase_08_primeros_graficos_ggplot`
   (las tres piezas, `geom_bar()`/`geom_col()`, `labs()`, el histograma). Nada de eso se
   repite.
3. Lo nuevo de hoy es **la tercera variable**: `color =` dentro de `aes()` y
   `facet_wrap()`. Todo lo demás de ggplot ya lo conocen.

## El material de la clase 10

La única fuente es el deck de la clase, «Tres variables y un titular»:
`https://docs.google.com/presentation/d/1X_bbqeZNGv47HHRwE-UOKH6_lFvz_wsk8W0yTC3vQYc/edit`.
Las láminas de código son figuras generadas por este script, que evalúa exactamente el
código que se proyecta:

```
C:\Users\naim.bro.k\naimbro.github.io\materiales\2026_descripcion_visualizacion_datos\figuras\clase10\generar_figuras_clase10.R
```

Los datos: `cep_problemas_por_anio.csv` (columnas `anio`, `problema`, `porcentaje`), la
serie que conocen desde la clase 6. En el código se llama `problemas`.

```
C:\Users\naim.bro.k\naimbro.github.io\materiales\2026_descripcion_visualizacion_datos\datos\cep_problemas_por_anio.csv
```

## Lo que se proyectó, lámina por lámina

| Lámina | Qué muestra |
|---|---|
| 3 · Dos variables | `delinc <- problemas %>% filter(problema == "Delincuencia, asaltos y robos")` y `ggplot(delinc, aes(x = anio, y = porcentaje)) + geom_line(color = "#C4878C") + geom_point(color = "#C4878C") + labs(...)`. Título: «La delincuencia, de 19% a 31%» |
| 4 · `color =` | `cuatro <- problemas %>% filter(problema %in% c("Delincuencia, asaltos y robos", "Salud", "Pobreza", "Empleo"))` y `ggplot(cuatro, aes(x = anio, y = porcentaje, color = problema)) + geom_line() + labs(...)`. Título: «La pobreza bajó; la delincuencia subió». Bajada: «Para comparar pocos grupos: ¿quién va arriba?» |
| 5 · `facet_wrap()` | `ocho` = ocho problemas (Delincuencia, Salud, Pobreza, Empleo, Educación, Sueldos, Corrupción, Vivienda); `ggplot(ocho, aes(x = anio, y = porcentaje)) + geom_line(color = "#C4878C") + facet_wrap(~ problema, ncol = 2) + labs(...)`. Título: «Sólo la delincuencia subió con fuerza». Bajada: «Para muchos grupos, o cuando importa la forma de cada uno» |
| 6 · Color o facetas | «**color =**: dos a cuatro grupos que se comparan en el mismo eje. Se ve quién va arriba y dónde se cruzan.» · «**facet_wrap()**: muchos grupos, o cuando importa la forma de cada uno. Todos los paneles comparten el eje.» · «**La prueba**: si para leer el gráfico hay que ir y volver a la leyenda, pasen a facetas.» |
| 7 · Lexis | Pantallazo del gráfico de *The Economist* (17-jun-2026): año en x, edad en y, cambio en la mortalidad en el color. Naim lo abrió en vivo |
| 8 · Del gráfico al titular | Las cuatro líneas en gris y, encima, pobreza en negro y delincuencia en rosa con `geom_line(data = ...)`. Título: «En 1994 empataban; hoy, 31% contra 3%» |
| 9–13 · Ejercicio | Redacción, segunda edición: cada grupo hace un gráfico con tres variables de su propio proyecto, con titular, y lo defiende dos minutos |

## Anclas verificadas (R 4.3.3, ggplot2 3.5.2, 19 de octubre)

| Hecho | Valor |
|---|---|
| `cuatro` | 128 filas: 32 años por cada uno de los 4 problemas (1994–2026, sin 2020) |
| `aes(x = anio, y = porcentaje, color = problema)` + `geom_line()` | **4 líneas, 4 colores**, con leyenda automática |
| Sin `color` (`aes(x = anio, y = porcentaje)` + `geom_line()`) | **corre y contesta mal**: una sola línea que salta entre los cuatro problemas de cada año (1 grupo) |
| `aes(..., color = "problema")`, con comillas | **corre y contesta mal**: igual, una sola línea en zigzag, un color (1 grupo) |
| `geom_line(color = problema)`, fuera de `aes()` | **no corre**: *objeto 'problema' no encontrado* |
| `%>%` en vez de `+` | **no corre**: *`mapping` must be created by `aes()`. Did you use `%>%` or `\|>` instead of `+`?* |
| `facet_wrap(problema)`, sin `~` | **no corre**: *objeto 'problema' no encontrado* |
| 1994 | Delincuencia 19,00 · Pobreza 18,80 · Salud 13,44 · Empleo 10,90 |
| 2026 | Delincuencia 31,45 · Salud 13,17 · Empleo 4,71 · Pobreza 3,27 |

**No entran:** `ifelse()` (nunca se pasó en clase), `facet_grid()` (se dejó para otra
clase), `scale_color_manual()`, `theme()`, `fill =`, y cualquier dato del artículo de
*The Economist* que no esté en la lámina 7. Regla dura de siempre: **toda pregunta sale del
deck.** No agregues un hecho que no esté ahí, ni siquiera en un distractor.

## Las dos rondas (ya elegidas por Naim, en este orden)

**R1 · La tercera variable** (código, 150 s, `answerFormat: "code"`). La tabla `cuatro` ya
está hecha. Escribe el gráfico con **una línea por problema**, cada una de un color.
Respuesta: `ggplot(cuatro, aes(x = anio, y = porcentaje, color = problema)) + geom_line()`.
Caza, con las anclas de arriba: sin `color` (corre y contesta mal: una línea en zigzag);
`"problema"` con comillas (corre y contesta mal); `color = problema` dentro de
`geom_line()` (no corre); `%>%` entre piezas (no corre). Vale 100 con o sin `labs()`, con
`geom_point()` agregado, o con `colour =`.

**R2 · Color o facetas** (castellano, 120 s). Para cada caso, ¿`color =` o `facet_wrap()`?,
y por qué en una línea: **(1)** comparar la delincuencia y la pobreza en el mismo eje: ¿quién
va arriba y dónde se cruzan?; **(2)** ver cómo se movió cada uno de ocho problemas.
Respuesta: (1) color, porque son dos grupos en el mismo eje y se ve el cruce; (2) facetas,
porque son muchos grupos y con ocho colores hay que ir y volver a la leyenda. Anclada en la
lámina 6. Caza: elegir bien sin decir por qué (techo de completitud); invertir las dos;
«facetas porque se ve más bonito» (sin el criterio de la lámina).

## Formato y rúbrica

Las dos son abiertas, compiten y pasan por los jueces. R2 numera (1) y (2). La rúbrica hereda
la de la clase 8 (`exactitud` 0,60 · `completitud` 0,25 · `claridad` 0,15, con sus techos:
entrega incompleta, código que corre y contesta mal, código que no corre).

## Contexto del día para los jueces

Es su **tercera clase con ggplot2** y la primera con una tercera variable. El lente es
**«¿corre y dibuja lo que se pidió?»** en R1, y **«¿usa el criterio de la clase?»** en R2:
pocos grupos que se comparan en el mismo eje → color; muchos grupos o la forma de cada uno →
facetas. Escriben desde un teléfono: no se cobra indentación, comillas tipográficas, saltos
de línea ni un paréntesis de cierre cuando la intención es inequívoca.

Cuando tengas la sesión escrita, corre `scripts/verify-session-prompt.cjs` y dame el resumen
de rondas, relojes y minutos totales.
