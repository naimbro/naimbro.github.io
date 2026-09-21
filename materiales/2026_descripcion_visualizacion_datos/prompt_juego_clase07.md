# Prompt para la sesión de Claude Code abierta en `ml2-master-game`

Copiar y pegar tal cual.

---

Vamos a armar el juego de la **clase 7 de Descripción y Visualización de Datos**
(`dataviz_2026`), lunes 21 de septiembre de 2026. Nombre de la sesión:
`clase_07_mutate_agrupar_resumir`.

## Lo primero que tienes que saber

1. **La clase 6 (7 de septiembre) no jugó.** El segundo bloque fueron las exposiciones
   del caso «la sala es una redacción» y ocuparon el lugar del juego. Así que todo el
   material de la clase 6 —`group_by()`, `summarise()`, `n()`, `arrange()`, los tres
   controles, el segmento E con nueve personas— **está sin quemar**: ninguna pregunta
   sobre eso se ha hecho nunca en el juego.
2. **Revisa si la sesión `clase_05_arreglar_y_crear` llegó a jugarse** (mírala en la
   tabla del curso o pregúntame). Si no se jugó, sus cuatro rondas tampoco están
   quemadas y puedes reciclar la R3 (diez, y eran catorce) como semilla; si se jugó,
   ni una pregunta de ésas se repite.
3. Esta clase tuvo un bloque largo de práctica en Colab (50 minutos) y después una
   presentación de 20 minutos sobre el Sprint 2. El juego arranca cerca de las
   **12:10** y cierra la clase.

## El material de la clase 7

Léelo completo antes de escribir preguntas. El cuaderno tiene una Parte A que yo corro
en pantalla (demo) y una Parte B–D que ellos resuelven en sala:

```
C:\Users\naim.bro.k\naimbro.github.io\materiales\2026_descripcion_visualizacion_datos\clase07_mutate_agrupar_resumir.ipynb
```

Material anterior que también cuenta como visto (y que hoy se repasó de nuevo):

```
C:\Users\naim.bro.k\naimbro.github.io\materiales\2026_descripcion_visualizacion_datos\clase06_agrupar_y_resumir.ipynb
C:\Users\naim.bro.k\naimbro.github.io\materiales\2026_descripcion_visualizacion_datos\clase06_encargo_redaccion.ipynb
C:\Users\naim.bro.k\naimbro.github.io\materiales\2026_descripcion_visualizacion_datos\clase05_mutate_limpiar_y_crear.ipynb
```

Los datos son la CEP consolidada (96.122 filas, 1994–2026, `cep`) y la encuesta del
propio curso (33 filas, `curso`):

```
C:\Users\naim.bro.k\naimbro.github.io\materiales\2026_descripcion_visualizacion_datos\datos\cep_consolidada_1994_2026.csv
C:\Users\naim.bro.k\naimbro.github.io\materiales\2026_descripcion_visualizacion_datos\datos\encuesta_curso.csv
```

## Anclas verificadas (recalculadas contra los CSV el 20 de septiembre)

Todas salen del cuaderno de la clase 7 salvo donde se indica.

| Hecho | Valor |
|---|---|
| `cep %>% mutate(mayor_60 = edad >= 60) %>% count(mayor_60)` | FALSE 67.457 · TRUE 24.103 · **NA 4.562** (personas sin edad) |
| `mutate(econ_mala = sit_econ_pais == "Mala" \| sit_econ_pais == "Muy mala") %>% count(econ_mala)` | FALSE 55.824 · TRUE 40.298 · sin fila NA |
| `summarise(personas = n(), edad_promedio = mean(edad, na.rm = TRUE), pct_econ_mala = mean(econ_mala) * 100)` | **96.122 · 46,7 · 41,9** |
| `mean(edad)` sin `na.rm = TRUE` | devuelve `NA` (hay 4.562 edades vacías) |
| `group_by(sexo)` con lo anterior | Hombre 39.527 · 46,1 · **36,9%** — Mujer 56.595 · 47,1 · **45,5%** |
| `group_by(mayor_60)` con lo anterior (un solo `mutate()` crea `econ_mala` y `mayor_60`) | FALSE 67.457 · 38,3 · 41,0% — TRUE 24.103 · 70,2 · 45,4% — **NA 4.562 · NaN · 37,0%** |
| Receta completa: `pct_econ_mala` por `anio`, `arrange(desc())` | **1999 63,4%** · 2022 63,3% · 2023 61,7% · 2001 60,1% · … · mínimo 2010 27,1% |
| Ej. 1: primeras seis filas de `edad` | 75, 63, 76, 38, 69, 38 → `joven` da seis `FALSE` |
| Ej. 2: `mutate(media_completa = anios_escolaridad >= 12) %>% count(media_completa)` | FALSE 38.759 · TRUE 39.436 · NA 17.927 |
| Ej. 3: `mutate(mujer = sexo == "Mujer") %>% summarise(personas = n(), pct = mean(mujer) * 100)` | 96.122 · **58,9%** |
| Ej. 4: `pct_mujeres` por año | máximo **2026 63,4%** (1.466 personas) · mínimo **1995 51,7%** (3.006) |
| Ej. 5: `group_by(gse)` con `n()` y `mean(edad, na.rm = TRUE)` | fila sin nombre (`""`) **5 personas** 40,0 · ABC1 3.515 45,4 · C2 10.028 46,6 · C3 38.998 46,7 · D 39.902 46,8 · E 3.674 47,2 |
| Ej. 6: `chile_hoy == "Progresando"` por año, `arrange()` ascendente | **2005 0,0%** — trampa: ese año la columna está vacía (`filter(anio == 2005) %>% count(chile_hoy)` → 4.515 vacíos). Mejor año real: 2004 52,8% |
| Ej. 7: `problema_1 == "Salud"`, `filter(anio >= 2022)`, por región, desc | **Ñuble 17,3% con 434 personas** · Araucanía 16,4% (721) · Los Ríos 15,7% (395) · Metropolitana 10,6% (5.966) · última Tarapacá 9,7% (309) |
| Ej. 8: `sum(!is.na(anios_escolaridad))` por año | **0 desde 2021** (2021–2026, todos los años); 1995 sólo 1.473 de 3.006 |
| Ej. 9 (`curso`): `mutate(minutos_num = as.numeric(minutos_viaje)) %>% group_by(transporte) %>% summarise(personas = n(), minutos_promedio = mean(minutos_num, na.rm = TRUE))` | Auto 12 · **40,5** — Metro 6 · **83,3** — Micro o bus 15 · **77,0** |
| Ej. 9 sin `na.rm = TRUE` | el grupo **Auto** sale `NA` (ahí está el `"10 min"`) |
| Ej. 10: `pct_largo = mean(minutos_num > 60, na.rm = TRUE) * 100` por transporte | Auto 9,1% · Metro 50,0% · Micro o bus 66,7% |
| Clase 6, control 3: `gse` sólo en 2026 | **E tiene 9 personas** (22,2%); C2 321 (35,5%); C3 791 (31,6%). Serie completa: E 3.674 personas, 13,2% |
| Clase 6: `cep %>% count(anio)` | de 2019 salta a 2021: **no hay 2020** |
| Clase 6: `sum(posicion_politica != "")` por año | vacía desde 2021 |
| Clase 6: `count()` vs. `summarise()` | `count()` tiene `sort = TRUE`; `summarise()` no, se ordena aparte con `arrange(desc())` |

**`ifelse()` no se ha enseñado y no entra**, ni en una pregunta ni en un distractor,
aunque aparezca en el cuaderno de la clase 5: en clase no se pasó.

Regla dura de siempre: **toda pregunta sale de estos cuadernos.** No agregues un hecho
que no esté ahí, ni siquiera en un distractor. Si un hecho falta, cambia la pregunta,
no agregues el hecho.

## Formato que quiero esta vez

**Sólo preguntas abiertas. Ninguna de alternativas.** Principalmente de código, y
todas **cortas**: una o dos líneas de R, o una línea de castellano más una de R. Nada
de párrafos.

- **25 a 30 minutos de pared**, porque la clase pasada no jugamos y hoy el bloque
  está reservado. Con la medida de la clase 5 (reloj de la ronda + ~2 minutos de
  overhead por ronda abierta entre jueces, duelos y revelaciones), eso son **seis
  rondas** de 120–180 s. Haz tú la aritmética con el motor y dime cuánto da.
- Toda ronda que pida escribir R lleva `answerFormat: "code"`.
- Sigue la forma de la clase 5: cada enunciado numera lo que pide, **(1)** y **(2)**,
  y la rúbrica cobra media respuesta con techo de 40 en exactitud. Hereda la rúbrica
  de la clase 5 (`exactitud` 0,60 · `completitud` 0,25 · `claridad` 0,15) con sus
  tres techos: entrega incompleta, código que corre y contesta mal, código que no
  corre.
- Las seis compiten y las seis pasan por los jueces.

## Semillas (ocho para seis lugares: elige y proponme el orden)

Una semilla por línea de la receta, más las trampas que la clase 7 repasó. Los
valores exactos están en la tabla de arriba.

1. **La columna que no venía** (código, 120 s). Escribe la línea de `mutate()` que
   crea `mujer`, `TRUE` cuando `sexo` es `"Mujer"`. Caza: `=` en vez de `==`,
   `"mujer"` en minúscula, `Sexo` con mayúscula.
2. **Un número para toda la base** (código, 150 s). Con `mujer` ya creada, escribe el
   `summarise()` que devuelve `personas` y `pct_mujeres`. Caza: `n` sin paréntesis,
   `mean(sexo)`, olvidar el `* 100` (menor). Vale cualquier escritura que dé 96.122 y
   58,9.
3. **La receta completa** (código, 180 s). Las cuatro líneas después de `cep` que dan
   el porcentaje que ve la economía «Mala» o «Muy mala» por año, de mayor a menor.
   Caza: `&` en vez de `|`; `group_by()` después del `summarise()`; sin `n()`;
   `sort = TRUE` adentro de `summarise()`. La ronda grande de la sesión.
4. **El promedio que salió NA** (castellano + código, 120 s). `cep %>%
   summarise(edad_promedio = mean(edad))` devuelve `NA`. (1) Por qué, en una línea.
   (2) La misma línea, arreglada. Caza: decir que la columna es texto (no lo es:
   es `NA`, no `"character"`), o «hay que borrar los NA» sin escribir el arreglo.
5. **`group_by()` no hace nada solo** (castellano + código, 150 s). Un compañero corre
   `cep %>% group_by(sexo)` y le sale la tabla entera, 96.122 filas. (1) Por qué.
   (2) La línea que falta para tener `personas` por sexo. Caza: creer que `group_by()`
   resume, o escribir `count()` (funciona, pero no es lo que se pidió: vale menos, no
   cero).
6. **Nueve personas** (castellano, 150 s). La tabla de `gse` de 2026: E tiene 9
   personas y 22,2%; C2 tiene 321 y 35,5%. Un compañero quiere titular «el segmento E
   es el que menos teme a la delincuencia». (1) Por qué no se publica. (2) Qué harías
   en vez de eso (usar la serie completa, donde E tiene 3.674). Anclada en el
   cuaderno 6 y en el encargo 2 de la redacción.
7. **El año que dio cero** (castellano, 120 s). El porcentaje que dice «Progresando»
   por año da **0,0% en 2005**. (1) ¿Se publica? Por qué no. (2) Qué línea corres para
   comprobarlo. Caza: creer el cero; decir que en 2005 nadie contestó eso sin mirar
   la columna.
8. **Limpiar y comparar en la misma cadena** (código, 180 s). Sobre `curso`: las tres
   líneas que dan los minutos promedio de viaje por `transporte`. Caza: sin
   `as.numeric()` (no corre: `mean()` de texto); sin `na.rm = TRUE` (corre y deja a
   Auto en `NA`, que es «código que corre y contesta mal»); `filter()` por la columna
   nueva antes de crearla.

Mi sugerencia de seis, en este orden: **1 → 4 → 3 → 5 → 7 → 8**, con la 3 al medio por
la misma razón que en la clase 5 (si el bloque se estira, lo que se cae es la última,
no la ronda que importa). La 2 y la 6 son buenas de repuesto: la 2 si quieres otra de
código puro, la 6 si prefieres una de diagnóstico. Dime qué opinas antes de escribir los archivos.

## Contexto del día para los jueces

Llevan seis clases programando y el cuaderno de hoy fue puro repaso. El lente de los
jueces tiene que ser **«¿corre y contesta bien?»**, no elegancia: cualquier escritura
que produzca el número correcto vale 100 aunque no sea la del cuaderno (`|>` en vez
de `%>%`, sobrescribir la columna, objetos intermedios, `count()` donde cabe). Lo que
sí se cobra: el orden (`mutate()` antes de `group_by()`, `group_by()` antes de
`summarise()`), los nombres de columna y valores escritos tal cual están en los
datos (`"Mujer"`, `sit_econ_pais`, `"Muy mala"`), el `n()` con paréntesis, y el
`na.rm = TRUE` donde la columna tiene `NA`. Escriben desde un teléfono: no se cobra
indentación, comillas, saltos de línea ni un paréntesis de cierre cuando la
intención es inequívoca.

Cuando tengas la sesión escrita, corre `scripts/verify-session-prompt.cjs` y dame el
resumen de rondas, relojes y minutos totales.
