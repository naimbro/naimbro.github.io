# Producción de la clase 12 de DVD 2026 ("La licitación") — plan

> **Para agentes:** sub-skill requerida: superpowers:executing-plans (o subagent-driven-development). Los pasos usan casillas (`- [ ]`).

**Objetivo:** dejar listos para el lunes 2 de noviembre de 2026, 10:00, todos los materiales de la
clase 12: figuras, cuaderno, cartas, forms, deck, hoja de ayudantes y bloque del syllabus. La guía
del Sprint 4 viene al final y puede salir durante la semana.

**Arquitectura:** se repite el molde de la clase 10. Un script de R genera las figuras de código
(código a la izquierda, gráfico a la derecha, 1920×1080), evaluando el mismo texto que se proyecta.
Un script de Python (gitignorado, con la cuenta de servicio) arma el deck con `SlideTemplate`.
Los forms salen de otro script gitignorado con la API de Forms. El cuaderno es un `.ipynb` de R que
lee la CEP desde GitHub. Las cartas son una página HTML con estilos en línea.

**Herramientas:** R 4.3.3 en Windows (`"/c/Program Files/R/R-4.3.3/bin/Rscript.exe"`), dplyr y
ggplot2 · Python con `google-api-python-client` · `slide_template.py` · `drive_credentials.json`.

**Diseño que implementa:** [diseno_cierre_noviembre.md](diseno_cierre_noviembre.md).

## Restricciones globales

- El repo es público. Nada de notas, juicios sobre grupos, nombres de estudiantes ni datos de la corrección del Sprint 3.
- Funciones nuevas de la clase 12: `ggsave()` y `facet_grid()`. Se reutilizan `labs(title, subtitle, caption)`, `filter()`, `mutate()`, `group_by()`, `summarise()`, `geom_line()`.
- Prohibido en código proyectado o del cuaderno: `ifelse()`, `pivot_longer()`, `theme()`, `theme_minimal()`. El estilo de la lámina va por fuera del código mostrado.
- Láminas: fondo `#F9F7F4`, texto `#2C2C2C`, acento `#C4878C`, Libre Franklin; máximo 3 bullets; títulos de menos de 54 caracteres; siempre `--thumbs` y mirar las miniaturas.
- Logo: subir uno propio para este deck (no reutilizar el de Drive; ver memoria `slides-logo-fetch-failure`).
- Figuras: lienzo fijo de 1920×1080, sin `bbox` tight, a sangre.
- Syllabus: bloque de 100–150 palabras; no tocar la prosa de Naim fuera del bloque del 2 de noviembre; el archivo tiene un cambio sin commit de Naim que hay que conservar.
- Nombres de fundaciones de las cartas: ficticios, y verificados con una búsqueda para que no coincidan con organizaciones reales.
- Commits y push: solo con el OK de Naim. El cuaderno se abre en Colab desde GitHub `main`, así que **sin push no funciona el lunes**.

## Lo que más puede fallar (revisar en cada tarea)

1. **El PNG no sale de Colab.** `ggsave()` escribe en `/content` y el alumno no lo encuentra. Lo cubren la lámina 6 y la Parte 1 del cuaderno.
2. **`facet_grid()` con NA.** Si `problema_1` trae NA, `mean(delinc)` da NA y el panel queda vacío. La Tarea 2 lo verifica.
3. **Votos inválidos.** Votos por el propio grupo o por sitios que no se entendieron. Los cubren las pruebas de la Tarea 5.
4. **Google Sites no publica** con la cuenta de un alumno. Es el pendiente de Naim (sitio de prueba), y la lámina 11 trae un plan B: compartir el enlace de vista previa.
5. **Un tema de grupo cambió después del Sprint 2.** La Tarea 1 lo verifica antes de escribir las cartas.

---

### Tarea 1: Verificar temas de grupo y asignación de ayudantes

**Archivos:** ninguno en el repo. El resultado queda en el scratchpad, en `insumos_clase12.md`.

**Produce:** una tabla `grupo → tema actual → ayudante`, que usan las Tareas 4 y 7.

- [ ] **Paso 1:** leer los encabezados `## grupo N` de `C:\Users\naim.bro.k\Documents\dvd2026_sprint3\comentarios_naim_presentaciones.md` y `correccion\just_rep0.txt`, y anotar el tema de cada grupo en el Sprint 3. Punto de partida (memoria, después del Sprint 2): G01 Gini y Palma en 4 países · G02 Fondeporte RM contra Irlanda · G03 música chilena en radios · G04 suicidio en hombres y mujeres (OWID) · G05 presupuesto por ministerio · G06 deserción por comuna · G07 alfabetización juvenil · G08 matrícula en carreras tecnológicas · G09 centralización de la salud.
- [ ] **Paso 2:** leer la planilla de grupos en Drive (su id está en la memoria del proyecto, no en este repo público) con la cuenta de servicio y sacar qué ayudante tiene cada grupo. Ya se sabe que Martín tiene G01, G06 y G08.
- [ ] **Paso 3, verificación:** nueve grupos, cada uno con tema y ayudante, y cada ayudante con tres grupos. Si algo no cuadra, preguntarle a Naim antes de seguir.

### Tarea 2: Figuras de la clase 12

**Archivos:**
- Crear: `materiales/2026_descripcion_visualizacion_datos/figuras/clase12/generar_figuras_clase12.R`
- Crear (salida): `figuras/clase12/f1_ggsave.png`, `f2_facet_grid.png`, `f3_titular.png`
- Crear: `figuras/clase12/generar_hoja_de_ruta.py`, a partir de `figuras/clase10/generar_hoja_de_ruta.py`
- Crear (salida): `figuras/clase12/hoja_de_ruta_clase12.png`

**Produce:** cuatro PNG de 1920×1080 que consume la Tarea 6.

- [ ] **Paso 1:** copiar el encabezado de `figuras/clase10/generar_figuras_clase10.R`: paleta, fuentes, `slide_theme`, el compositor código-y-gráfico y el `ggsave` a 1920×1080. Cambiar `OUT` a `figuras/clase12`. Cargar además `cep <- read.csv(file.path(BASE, "datos", "cep_consolidada_1994_2026.csv"))`.
- [ ] **Paso 2: comprobar los datos antes de escribir el código proyectado.**

```r
sum(is.na(cep$problema_1)); sum(cep$problema_1 == "", na.rm = TRUE)
problemas %>% filter(problema == "Delincuencia, asaltos y robos", anio %in% c(1994, 2026))
```

Esperado: 19.00 en 1994 y 31.45 en 2026. Si `problema_1` tiene NA, el código de f2 agrega `filter(!is.na(problema_1))` antes del `mutate`, y ese filtro **se muestra** en la lámina.

- [ ] **Paso 3: f1 · `ggsave()`.** Código proyectado, que es exactamente lo que se evalúa:

```r
delinc <- problemas %>%
  filter(problema == "Delincuencia, asaltos y robos")

ggplot(delinc, aes(x = anio, y = porcentaje)) +
  geom_line()

ggsave("delincuencia.png", width = 8, height = 5)
```

A la derecha va el gráfico, y bajo él, en gris, el texto `→ delincuencia.png (8 × 5)`.

- [ ] **Paso 4: f2 · `facet_grid()`.**

```r
delinc_grupos <- cep %>%
  mutate(delinc = problema_1 == "Delincuencia, asaltos y robos") %>%
  group_by(anio, sexo, zona) %>%
  summarise(pct = mean(delinc) * 100)

ggplot(delinc_grupos, aes(x = anio, y = pct)) +
  geom_line() +
  facet_grid(zona ~ sexo)
```

El patrón `mean(delinc) * 100` ya aparece en los cuadernos del curso.

- [ ] **Paso 5: f3 · el titular es el hallazgo.**

```r
ggplot(delinc, aes(x = anio, y = porcentaje)) +
  geom_line() +
  labs(title = "La delincuencia pasó de 19% a 31% como primer problema",
       subtitle = "% que la nombra como el principal problema del país",
       x = NULL, y = NULL,
       caption = "Fuente: Encuesta CEP 1994-2026")
```

- [ ] **Paso 6:** hoja de ruta. Adaptar `generar_hoja_de_ruta.py` de la clase 10 a cuatro hitos: `2 nov · Observatorio · estructurar`, `9 nov · Video-podcast · narrar`, `16 nov · Carrusel · sintetizar`, `23 nov · Demo day`, con el 2 de noviembre destacado en rosa. Usar el venv del scratchpad si hace falta matplotlib (memoria `matplotlib-broken-global-python`).
- [ ] **Paso 7, verificación:** correr `"/c/Program Files/R/R-4.3.3/bin/Rscript.exe" materiales/2026_descripcion_visualizacion_datos/figuras/clase12/generar_figuras_clase12.R` desde la raíz del repo. Esperado: tres PNG de exactamente 1920×1080 (comprobarlo con `python -c "from PIL import Image; print(Image.open(p).size)"`). Abrir cada uno con Read y revisar que el código se lea, que f2 tenga 4 paneles con líneas y que no haya texto cortado.

### Tarea 3: Cuaderno `clase12_ggsave_y_facet_grid.ipynb`

**Archivos:** crear `materiales/2026_descripcion_visualizacion_datos/clase12_ggsave_y_facet_grid.ipynb`, con kernel R, igual que `clase10_color_y_facetas.ipynb`.

**Produce:** la URL de Colab `https://colab.research.google.com/github/naimbro/naimbro.github.io/blob/main/materiales/2026_descripcion_visualizacion_datos/clase12_ggsave_y_facet_grid.ipynb`, que consumen las Tareas 6 y 8.

Estructura, en el estilo de siempre: una función protagonista por parte y celdas `# Tu código acá` para explorar.

| Parte | Markdown | Código |
|---|---|---|
| Encabezado | "Cuaderno 12 — Sacar el gráfico de Colab: `ggsave()` y `facet_grid()`", seguido de una línea de para qué sirve hoy: el sitio del grupo | — |
| 0 · Punto de partida | — | `library(dplyr)`, `library(ggplot2)`, `options(repr.plot.width = 9, repr.plot.height = 5)`, y `problemas` y `cep` leídos con `read.csv()` desde `raw.githubusercontent.com/naimbro/naimbro.github.io/main/materiales/2026_descripcion_visualizacion_datos/datos/...` |
| 1 · `ggsave()` | "Guarda el último gráfico como PNG. Después: panel de archivos (ícono de carpeta, a la izquierda) → clic derecho → Descargar. Si cierras Colab, el archivo se borra." | El código de f1, y después 2 celdas vacías con la prueba: "cambia `width` y `height` a 4 y 4: ¿qué le pasa a la letra?" |
| 2 · `facet_grid()` | "`facet_wrap(~ x)` hace una fila de paneles; `facet_grid(filas ~ columnas)` cruza dos variables." | El código de f2, y 2 celdas vacías con la prueba: "cambia `zona ~ sexo` por `sexo ~ zona`" |
| 3 · El titular es el hallazgo | La regla: título = hallazgo con un número y una comparación; subtítulo = qué se mide; caption = fuente | El código de f3, y una celda vacía |
| 4 · Su portada | "Con la base de su grupo: el gráfico del hallazgo n.º 1, con titular, guardado con `ggsave()`." | 3 celdas vacías |
| Lo que aprendiste hoy | Tabla "Para qué / Cómo se escribe" con `ggsave()`, `facet_grid()` y `labs()` | — |

- [ ] **Paso 1:** escribir el `.ipynb` con un script de Python en el scratchpad que arme el JSON (`nbformat` 4, metadata `kernelspec: ir`, como en el cuaderno de la clase 10).
- [ ] **Paso 2, verificación:** extraer las celdas de código que no son `# Tu código acá`, reemplazar las URLs raw por las rutas locales de `datos/`, y correrlas en orden con Rscript en un directorio temporal. Esperado: sin errores, y `delincuencia.png` creado. Revisar además con grep que no aparezcan `ifelse`, `pivot_longer` ni `theme`.

### Tarea 4: Las nueve cartas de la fundación

**Archivos:** crear `materiales/2026_descripcion_visualizacion_datos/clase12_cartas_fundacion.html`.

**Consume:** la tabla de la Tarea 1. **Produce:** la URL `https://naimbro.github.io/materiales/2026_descripcion_visualizacion_datos/clase12_cartas_fundacion.html`, para las Tareas 6 y 8.

Una tarjeta por grupo con cuatro campos: **Fundación** (ficticia) · **Qué financia** · **Qué quiere saber** (una pregunta descriptiva, sin "por qué") · **A quién le mostrará el sitio**. Al pie, la regla común: "Su portada tiene que responder la pregunta de la fundación en 90 segundos." Estilos en línea; una tarjeta por página al imprimir (`page-break-after`).

Borrador, a ajustar si la Tarea 1 encuentra temas cambiados:

| Grupo | Fundación | Qué financia | Qué quiere saber | A quién se lo muestra |
|---|---|---|---|---|
| G01 | Fundación Mesa Larga | Estudios sobre desigualdad | ¿Es Chile más desigual que los otros tres países, y desde cuándo? | Su directorio |
| G02 | Fundación Cancha Abierta | Deporte comunitario | ¿Cuánto pone el Estado en deporte, comparado con Irlanda? | Clubes deportivos de la RM |
| G03 | Colectivo Dial Propio | Músicos independientes | ¿Cuánta música chilena suena en las radios, y en cuáles? | Músicos y prensa cultural |
| G04 | Fundación Hablemos Claro | Salud mental en liceos | ¿Cuánto difieren hombres y mujeres, y cómo ha cambiado? **Regla de la fundación:** sin detalles de métodos, y la Línea \*4141 en la portada | Profesores jefe |
| G05 | Fundación Peso a Peso | Control ciudadano del gasto | ¿Qué ministerios ganaron presupuesto y cuáles perdieron? | Periodistas |
| G06 | Fundación Pupitre | Tutorías escolares | ¿En qué comunas se deserta más? | Alcaldes |
| G07 | Fundación Letra Viva | Lectura juvenil | ¿Cómo está la alfabetización juvenil, y dónde está peor? | Docentes |
| G08 | Fundación Código Joven | Becas en tecnología | ¿Cuánto creció la matrícula en carreras tecnológicas, y dónde? | Colegios técnicos |
| G09 | Fundación Red Sur | Salud en regiones | ¿Cuánto de la atención de salud se concentra en Santiago? | Gobiernos regionales |

- [ ] **Paso 1:** buscar en la web cada nombre de fundación, junto con "Chile". Cambiar los que coincidan con una organización real.
- [ ] **Paso 2:** verificar que la Línea \*4141 siga siendo la línea de prevención del suicidio del Minsal. Si no, poner la vigente.
- [ ] **Paso 3:** escribir el HTML.
- [ ] **Paso 4, verificación:** abrir el archivo en el browser pane (`file:///…`), revisar las nueve tarjetas y hacer una vista de impresión con `javascript_tool: window.print` o una captura.

### Tarea 5: Forms del corte y de la votación, con conteo

**Archivos:**
- Crear: `create_form_dvd_clase12.py` (raíz del repo, gitignorado)
- Crear: `test_create_form_dvd_clase12.py`, en el scratchpad (no va al repo)
- Modificar: `.gitignore`, para agregar `create_form_dvd_clase12.py` y `create_form_dvd_clase12_state.json`. Ojo: `.gitignore` tiene cambios sin commit de Naim; solo se agregan líneas al final.

**Produce:** dos URLs de respuesta (corte y votación), guardadas en `create_form_dvd_clase12_state.json`, para las Tareas 6 y 7. También el comando `python create_form_dvd_clase12.py --resultados --elegibles G01,G03,...`.

Forms, ambos sin inicio de sesión:
- **Corte, a las 11:20:** "Grupo" (radio, G01–G09) · "Enlace del sitio publicado" (texto corto) · "Titular de la portada" (texto corto).
- **Votación, a las 12:10:** "Tu grupo" (radio, G01–G09) · "¿A qué observatorio le darías los fondos?" (radio, G01–G09), con la descripción "Solo cuentan los sitios que se entendieron. Los votos por el propio grupo no cuentan."

- [ ] **Paso 1: escribir la prueba que falla.**

```python
import unittest
from create_form_dvd_clase12 import contar_votos

class TestContarVotos(unittest.TestCase):
    def test_descarta_propio_grupo_y_no_elegibles(self):
        votos = [("G01", "G02"), ("G03", "G02"), ("G02", "G02"),
                 ("G04", "G05"), ("G05", "G03"), ("G06", "G03")]
        ranking = contar_votos(votos, elegibles={"G02", "G03"})
        self.assertEqual(ranking, [("G02", 2), ("G03", 2)])

    def test_empate_ordena_por_grupo(self):
        self.assertEqual(contar_votos([("G01", "G09"), ("G02", "G04")],
                                      elegibles={"G04", "G09"}),
                         [("G04", 1), ("G09", 1)])

    def test_sin_votos_validos(self):
        self.assertEqual(contar_votos([("G01", "G01")], elegibles={"G01"}), [])

if __name__ == "__main__":
    unittest.main()
```

- [ ] **Paso 2:** correr `python -m unittest test_create_form_dvd_clase12` desde el scratchpad, con `PYTHONPATH` en la raíz del repo. Esperado: FAIL con `ImportError`.
- [ ] **Paso 3: implementar.** Copiar `get_services`, `choice_item`, `text_item`, `save_state`, `load_state` y `report` de `create_voting_form.py`, y agregar:

```python
def contar_votos(votos, elegibles):
    """votos: lista de (grupo_que_vota, grupo_votado). Devuelve [(grupo, votos)]
    de mayor a menor, sin votos por el propio grupo ni por grupos no elegibles."""
    conteo = {}
    for votante, votado in votos:
        if votado == votante or votado not in elegibles:
            continue
        conteo[votado] = conteo.get(votado, 0) + 1
    return sorted(conteo.items(), key=lambda par: (-par[1], par[0]))
```

`--resultados` lee las respuestas con `forms.forms().responses().list(formId=...)`, mapea los `questionId` a los dos campos, arma la lista de tuplas, imprime el ranking y marca el podio (los tres primeros).

- [ ] **Paso 4:** correr la prueba. Esperado: 3 tests OK.
- [ ] **Paso 5:** crear los forms de verdad (`python create_form_dvd_clase12.py`), abrir las dos URLs de respuesta en el browser pane y comprobar que se pueden contestar sin iniciar sesión. **No enviar ninguna respuesta de prueba** sin el OK de Naim.

### Tarea 6: Deck "La licitación"

**Archivos:** crear `create_slides_dvd_clase12_licitacion.py` (raíz del repo, gitignorado por `create_slides*.py`), copiando la estructura de `create_slides_dvd_clase10_tres_variables.py`: `SLIDES`, `ID_PREFIX = "dvd_c12_"`, `build_deck`, `--pres-id`, `--refresh-images`, `--thumbs`, `--force`.

**Consume:** las figuras de la Tarea 2, la URL del cuaderno (Tarea 3), la de las cartas (Tarea 4) y las de los forms (Tarea 5). **Produce:** el id del deck, para la Tarea 8.

Contenido, con títulos de menos de 54 caracteres:

| # | Tipo | Título | Bullets / figura | Nota para Naim |
|---|---|---|---|---|
| 1 | title | La licitación | Descripción y Visualización de Datos 2026 · clase 12 | — |
| 2 | content | De dónde venimos: tres sprints | Sprint 1: una pregunta, una fuente, una audiencia · Sprint 2: una base limpia e indicadores · Sprint 3: gráficos con titular | Un minuto. Es el mapa. |
| 3 | image | — | `hoja_de_ruta_clase12.png` | Tres desafíos; el 16 eligen formato. |
| 4 | content | Sprint 4: un sitio con su historia | Portada: el hallazgo como titular y un gráfico · La historia: en el formato que elijan el 16 · Cómo lo hicimos: fuentes, Colab, los cinco candidatos | La guía completa sale esta semana. |
| 5 | image | — | `f1_ggsave.png` | Correrlo en vivo desde el cuaderno. |
| 6 | content | Del Colab a su computador | Panel de archivos: el ícono de carpeta, a la izquierda · Descargar: clic derecho sobre el PNG · Ojo: al cerrar Colab, el archivo se borra | Mostrarlo en pantalla, que es donde se traban. |
| 7 | image | — | `f2_facet_grid.png` | `facet_wrap` hace una fila de paneles; `facet_grid` cruza dos variables. |
| 8 | image | — | `f3_titular.png` | La regla del editor de la clase 6. |
| 9 | content | Los cinco candidatos | Cinco hallazgos: cada uno con un número y una comparación · Ordénenlos: ¿a quién le importa o le sorprende? · El n.º 1: lo aprueba su ayudante y va a la portada | 20 minutos, con su ayudante. |
| 10 | content | La licitación: una fundación los evalúa | La fundación: financia observatorios de datos · Su carta: quién es y qué quiere saber · El sitio: portada y una sección, a las 11:20 | Link a las cartas en la lámina. |
| 11 | content | Google Sites en tres pasos | Crear y compartir: sites.google.com, sitio en blanco, editores del grupo · Armar: título, el PNG y dos líneas · Publicar: botón Publicar y el enlace al form del corte | Plan B, si no publica: el enlace de vista previa. |
| 12 | content | Las reglas del segundo bloque | Navegación muda: un ayudante que no es el suyo, 90 segundos · Se entendió o no: su frase contra su titular · Votación: compiten solo los que se entendieron | El podio suma una décima al Sprint 4. |
| 13 | content | Para el lunes 9 | El sitio sigue vivo: lo usan hasta el demo day · Próximo desafío: al aire, un video-podcast · Bitácora: semana 8, hasta el domingo 15 | — |
| 14 | closing | Hasta el lunes 9 | naim.bro.k [at] uai.cl | — |

Los links van como `link_box` en las láminas 5 (cuaderno), 10 (cartas), 11 (form del corte) y 12 (form de votación).

- [ ] **Paso 1:** escribir el script.
- [ ] **Paso 2:** `python create_slides_dvd_clase12_licitacion.py` (deck nuevo) y anotar el id que imprime.
- [ ] **Paso 3, verificación:** `python create_slides_dvd_clase12_licitacion.py --thumbs --pres-id <id>`, y abrir cada miniatura con Read. Revisar que el título no choque con la línea, que no haya texto cortado y que el logo esté. Corregir y reconstruir con `--pres-id`. Esto es seguro mientras Naim no haya editado el deck; si lo editó, el script se niega sin `--force`.

### Tarea 7: Hoja de los ayudantes

**Archivos:** crear `materiales/2026_descripcion_visualizacion_datos/clase12_hoja_ayudantes.md`, en el molde de `clase09_hoja_roberto.md`.

**Consume:** la Tarea 1 (sus grupos) y la Tarea 5 (las URLs de los forms).

Contenido, en menos de una página:
1. Horario de la clase, la tabla del diseño, con la columna "qué hace el ayudante".
2. **Cinco candidatos:** cómo aprobar el n.º 1. Tiene un número y una comparación; sale de la base del grupo; a alguien fuera del grupo le importaría.
3. **Rotación de la navegación muda:** Matías navega los grupos de Karina, Karina los de Martín y Martín los de Matías. Navegan en silencio 90 segundos y dicen el hallazgo en una frase.
4. Las URLs de los dos forms y la regla de votación.
5. Plan del Sprint 3 (12:20): qué revisar en la página "Cómo lo hicimos".

- [ ] **Paso 1:** escribir la hoja.
- [ ] **Paso 2, verificación:** que tenga menos de 450 palabras (`wc -w`) y ningún dato de notas.

### Tarea 8: Bloque del 2 de noviembre en el syllabus

**Archivos:** modificar `teaching/2026_descripcion_visualizacion_datos.html`: solo el `<li>` del lunes 02-11-2026 (líneas 394–411 aprox.). El archivo es UTF-8 y tiene un cambio de Naim sin commit, que se conserva.

**Consume:** las URLs de las Tareas 3, 4, 5 y 6.

Bloque nuevo. Se conservan la línea `staff` de la bitácora del ayudante tal como está, y el juego ML2 sale (supuesto del diseño):

```html
        <b>Desafío 1 &mdash; La licitación: un observatorio en Google Sites</b> (lunes 02-11-2026, 10:00-12:40)
        <ul>
          <li>Láminas de la clase: <a href="https://docs.google.com/presentation/d/ID_DEL_DECK/edit?usp=sharing" target="_blank">la licitación</a> &mdash; <code>ggsave()</code>, <code>facet_grid()</code> y el titular como hallazgo.</li>
          <li>Cuaderno de la clase: <a href="URL_COLAB_TAREA_3" target="_blank">sacar el gráfico de Colab</a>.</li>
          <li>Caso: una fundación financia observatorios de datos. Cada grupo recibe <a href="URL_CARTAS_TAREA_4" target="_blank">su carta</a>, escoge su hallazgo entre cinco candidatos y arma en Google Sites una portada y una sección.</li>
          <li>Segundo bloque: un ayudante navega cada sitio en silencio durante 90 segundos y dice qué entendió. El curso vota entre los sitios que se entendieron; el podio suma una décima al Sprint 4.</li>
          <li class="deliverable">Retroalimentación del Sprint 3: en la página «Cómo lo hicimos» del sitio, qué observaciones incorporan, cuáles no y por qué.</li>
          <li class="staff">(línea de la bitácora del ayudante, sin cambios)</li>
        </ul>
```

`ID_DEL_DECK`, `URL_COLAB_TAREA_3` y `URL_CARTAS_TAREA_4` se reemplazan por los valores que producen las tareas; no quedan en el archivo.

- [ ] **Paso 1:** aplicar la edición con la herramienta Edit, reemplazando solo desde `<b>Diseño de plataformas web` hasta la línea del juego ML2 de ese bloque.
- [ ] **Paso 2, verificación:** las palabras del bloque nuevo, sin la línea `staff`, quedan entre 100 y 150. `git diff teaching/2026_descripcion_visualizacion_datos.html` muestra el cambio de Naim intacto y solo el bloque del 2 de noviembre modificado. Abrir la página local en el browser pane y revisar que los cuatro enlaces respondan (el del cuaderno, solo después del push).

### Tarea 9: Guía del Sprint 4 (puede salir durante la semana)

**Archivos:** crear `materiales/2026_descripcion_visualizacion_datos/guia_sprint4.html`, con las mismas siete secciones que `guia_sprint3.html`, y subirla como Google Doc por el mismo camino que la guía del Sprint 3 (ver el commit `1a5a7d1` y el script con que se subió esa guía).

Contenido: la sección "Sprint 4 y demo day" del diseño (las tres páginas del sitio, el demo day de 8 + 4, la rúbrica de cuatro criterios con cuatro niveles cada uno, la regla de la decisión de formato del 16 y las décimas por podio).

- [ ] **Paso 1:** escribir los cuatro niveles de cada criterio, en la forma de la pauta del Sprint 1.
- [ ] **Paso 2:** escribir el HTML y subirlo como Doc.
- [ ] **Paso 3, verificación:** leer el Doc con el conector de Drive y comprobar que tenga las siete secciones y la rúbrica completa, y que los pesos sumen 100%.

### Tarea 10: Cierre

- [ ] Mostrarle a Naim el deck (miniaturas), las cartas y el diff del syllabus.
- [ ] Pedirle el OK para hacer commit y push. Archivos versionados: figuras, cuaderno, cartas, hoja de ayudantes, `diseno_cierre_noviembre.md`, este plan y el syllabus. Los scripts gitignorados no se suben.
- [ ] Después del push, abrir el cuaderno en Colab desde la URL de GitHub y comprobar que carga y que las URLs raw responden.
