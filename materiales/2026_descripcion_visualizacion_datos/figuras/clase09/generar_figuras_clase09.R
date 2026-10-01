# Figuras del deck de la clase 9 de DVD 2026: "¿Cuál es el mejor gráfico?"
#
# Cada lámina de tarea muestra el código a la izquierda y el gráfico a la
# derecha. El gráfico NO se dibuja aparte: se obtiene evaluando exactamente el
# texto del código que se proyecta, así que lo que ven en la lámina es lo que
# les sale si copian el código en el cuaderno de la clase.
#
# Lienzo fijo de 1920x1080 sin recorte, como pide el template de Slides.
# Correr desde la raíz del repo:
#   Rscript materiales/2026_descripcion_visualizacion_datos/figuras/clase09/generar_figuras_clase09.R

suppressMessages({
  library(dplyr)
  library(ggplot2)
  library(grid)
})

BASE <- "materiales/2026_descripcion_visualizacion_datos"
OUT  <- file.path(BASE, "figuras", "clase09")

BG    <- "#F9F7F4"
INK   <- "#2C2C2C"
ROSE  <- "#C4878C"
MUTED <- "#8C8C8C"
PANEL <- "#EFEAE4"
SANS  <- "Franklin Gothic Book"
BOLD  <- "Franklin Gothic Demi"
MONO  <- "Consolas"

# ── Datos: lo mismo que la Parte 0 del cuaderno ───────────────
cep       <- read.csv(file.path(BASE, "datos", "cep_consolidada_1994_2026.csv"))
problemas <- read.csv(file.path(BASE, "datos", "cep_problemas_por_anio.csv"))
curso     <- read.csv(file.path(BASE, "datos", "encuesta_curso.csv"))
curso <- suppressWarnings(curso %>%
  mutate(redes_num = as.numeric(horas_redes),
         sueno_num = as.numeric(horas_sueno)))

# El estilo de la lámina (fuente y fondo) se suma por fuera del código
# proyectado: no cambia nada de lo que el gráfico dice.
slide_theme <- theme(
  text          = element_text(family = SANS, colour = INK, size = 13),
  axis.text     = element_text(colour = INK, size = 11.5),
  plot.title    = element_text(family = BOLD, size = 17, margin = margin(b = 10)),
  plot.caption  = element_text(colour = MUTED, size = 10, margin = margin(t = 10)),
  plot.title.position   = "plot",
  plot.caption.position = "plot",
  plot.background  = element_rect(fill = BG, colour = NA),
  panel.grid.minor = element_blank(),
  legend.text      = element_text(size = 11)
)

# ── Las seis tareas ────────────────────────────────────────────
TAREAS <- list(
  list(
    file = "t1_ranking.png", kicker = "1 · RANKING", pregunta = "¿Cuál es más?",
    aes = "x: el número · y: las categorías, ordenadas",
    geom = "geom_col() + reorder()",
    code = '
top <- problemas %>%
  filter(anio == 2026) %>%
  arrange(desc(porcentaje)) %>%
  head(8)

ggplot(top, aes(x = porcentaje,
                y = reorder(problema, porcentaje))) +
  geom_col(fill = "#C4878C") +
  labs(
    title = "La delincuencia más que dobla a la salud",
    x = "% que lo nombra primer problema",
    y = NULL,
    caption = "Fuente: CEP 2026, n = 1.466") +
  theme_minimal()'),

  list(
    file = "t2_tendencia.png", kicker = "2 · TENDENCIA", pregunta = "¿Cómo cambió?",
    aes = "x: el tiempo · y: el número",
    geom = "geom_line() + geom_point()",
    code = '
delinc <- problemas %>%
  filter(problema == "Delincuencia, asaltos y robos")

ggplot(delinc, aes(x = anio, y = porcentaje)) +
  geom_line(color = "#C4878C") +
  geom_point(color = "#C4878C") +
  labs(
    title = "Los tres últimos años, los más altos",
    x = NULL,
    y = "% que la nombra primer problema",
    caption = "Fuente: CEP 1994-2026, sin 2020") +
  theme_minimal()'),

  list(
    file = "t3_distribucion.png", kicker = "3 · DISTRIBUCIÓN", pregunta = "¿Cómo se reparte?",
    aes = "x: el grupo · y: el número que se reparte",
    geom = "geom_boxplot()  ·  geom_histogram()",
    code = '
apr <- cep %>%
  filter(anio == 2026,
         aprueba_presidente %in%
           c("Aprueba", "Desaprueba"))

ggplot(apr, aes(x = aprueba_presidente, y = edad)) +
  geom_boxplot(fill = "#EBD6D9") +
  labs(
    title = "Los que desaprueban son más jóvenes",
    x = NULL,
    y = "Edad (años)",
    caption = "Fuente: CEP 2026, n = 1.260") +
  theme_minimal()'),

  list(
    file = "t4_composicion.png", kicker = "4 · COMPOSICIÓN", pregunta = "¿De qué está hecho el total?",
    aes = "x: el grupo · fill: las partes",
    geom = 'geom_bar(position = "fill")',
    code = '
apr3 <- cep %>%
  filter(anio == 2026, gse != "E",  # E: sólo 9 casos
         aprueba_presidente %in% c(
           "Aprueba", "Desaprueba",
           "No aprueba ni desaprueba"))

ggplot(apr3, aes(x = gse,
                 fill = aprueba_presidente)) +
  geom_bar(position = "fill") +
  scale_y_continuous(labels = scales::percent) +
  scale_fill_manual(
    values = c("#4F7396", "#B5646B", "#B5B0AA")) +
  labs(
    title = "Un tercio aprueba, en todos los GSE",
    x = "Grupo socioeconómico", y = NULL, fill = NULL,
    caption = "Fuente: CEP 2026, sin el GSE E") +
  theme_minimal() +
  theme(legend.position = "bottom")'),

  list(
    file = "t5_relacion.png", kicker = "5 · RELACIÓN", pregunta = "¿Van juntas?",
    aes = "x: un número · y: otro número",
    geom = "geom_jitter() + geom_smooth()",
    code = '
ggplot(curso, aes(x = redes_num, y = sueno_num)) +
  geom_jitter(width = 0.15, height = 0.15,
              color = "#C4878C", size = 2.5) +
  geom_smooth(method = "lm", se = FALSE,
              color = "#2C2C2C") +
  labs(
    title = "Más redes, algo menos de sueño",
    x = "Horas en redes al día",
    y = "Horas de sueño",
    caption = "Fuente: encuesta del curso, n = 32") +
  theme_minimal()'),

  list(
    file = "t6_lugar.png", kicker = "6 · LUGAR", pregunta = "¿Dónde pasa más?",
    aes = "x: el número · y: los lugares, ordenados",
    geom = "geom_point() + reorder()",
    code = '
reg <- cep %>%
  filter(anio >= 2024) %>%
  mutate(delinc = ifelse(problema_1 ==
           "Delincuencia, asaltos y robos", 1, 0)) %>%
  group_by(region) %>%
  summarise(pct = mean(delinc) * 100, n = n()) %>%
  mutate(region = paste0(region, " (", n, ")"))

ggplot(reg, aes(x = pct, y = reorder(region, pct))) +
  geom_point(size = 3, color = "#C4878C") +
  labs(
    title = "Arica encabeza, pero con sólo 95 casos",
    x = "% que nombra primero la delincuencia",
    y = NULL,
    caption = "CEP 2024-2026; n entre paréntesis") +
  theme_minimal()'),

  list(
    file = "t7_cambio.png", kicker = "7 · CAMBIO", pregunta = "¿Quién se movió más?",
    aes = "Tabla ancha: una columna para antes y otra para después",
    geom = "geom_segment() + geom_point()",
    code = '
cambio <- data.frame(
  problema = c("Delincuencia", "Pobreza", "Salud",
               "Empleo", "Inflación", "Educación",
               "Sueldos"),
  en_1994 = c(19.0, 18.8, 13.4, 10.9, 9.6, 7.8, 6.1),
  en_2026 = c(31.5, 3.3, 13.2, 4.7, 1.4, 7.9, 2.6))

ggplot(cambio, aes(y = reorder(problema, en_2026))) +
  geom_segment(aes(x = en_1994, xend = en_2026,
                   yend = reorder(problema, en_2026)),
               color = "#B5B0AA") +
  geom_point(aes(x = en_1994), size = 3,
             color = "#B5B0AA") +
  geom_point(aes(x = en_2026), size = 3,
             color = "#C4878C") +
  labs(
    title = "Pobreza abajo, delincuencia arriba",
    x = "% primer problema: gris 1994, rosa 2026",
    y = NULL,
    caption = "Fuente: CEP 1994 y 2026") +
  theme_minimal()')
)

# ── Composición de la lámina ───────────────────────────────────
open_canvas <- function(path) {
  ragg::agg_png(path, width = 1920, height = 1080, res = 144, background = BG)
  grid.newpage()
}

header <- function(kicker, headline, sub = NULL) {
  grid.text(kicker, x = 0.035, y = 0.925, just = c("left", "center"),
            gp = gpar(fontfamily = BOLD, fontsize = 13, col = ROSE))
  grid.text(headline, x = 0.035, y = 0.855, just = c("left", "center"),
            gp = gpar(fontfamily = BOLD, fontsize = 28, col = INK))
  if (!is.null(sub))
    grid.text(sub, x = 0.035, y = 0.79, just = c("left", "center"),
              gp = gpar(fontfamily = SANS, fontsize = 14, col = MUTED))
}

code_panel <- function(code, geom) {
  lines <- strsplit(sub("^\n", "", code), "\n")[[1]]
  fs <- if (length(lines) > 20) 11 else 12   # el código largo no pisa el geom
  pushViewport(viewport(x = 0.035, y = 0.11, width = 0.40, height = 0.63,
                        just = c("left", "bottom")))
  grid.roundrect(r = unit(6, "pt"), gp = gpar(fill = PANEL, col = NA))
  grid.text(lines, x = unit(14, "pt"),
            y = unit(1, "npc") - unit(16, "pt") - unit((seq_along(lines) - 1) * fs * 1.22, "pt"),
            just = c("left", "top"),
            gp = gpar(fontfamily = MONO, fontsize = fs, col = INK))
  grid.text(geom, x = unit(14, "pt"), y = unit(16, "pt"), just = c("left", "bottom"),
            gp = gpar(fontfamily = MONO, fontsize = 13, fontface = "bold", col = ROSE))
  popViewport()
}

for (t in TAREAS) {
  set.seed(9)  # geom_jitter: la misma nube en cada corrida
  p <- eval(parse(text = t$code)) + slide_theme
  path <- file.path(OUT, t$file)
  open_canvas(path)
  header(t$kicker, t$pregunta, t$aes)
  code_panel(t$code, t$geom)
  # El gráfico deja libre la esquina inferior derecha, donde va el logo.
  print(p, vp = viewport(x = 0.46, y = 0.13, width = 0.50, height = 0.70,
                         just = c("left", "bottom")))
  invisible(dev.off())
  cat("  ", path, "\n")
}

# ── Láminas que son tablas ─────────────────────────────────────
# Cuatro columnas; la cuarta siempre es código y va en rosa, porque es el geom.
draw_table <- function(path, kicker, headline, rows, heads, cols, footer,
                       step = 0.08, size1 = 16, size2 = 14, size3 = 12.5,
                       fams = c(BOLD, SANS, MONO, MONO)) {
  open_canvas(path)
  header(kicker, headline)
  yh <- 0.72
  for (j in seq_along(heads))
    grid.text(heads[j], x = cols[j], y = yh, just = c("left", "center"),
              gp = gpar(fontfamily = BOLD, fontsize = 13, col = MUTED))
  grid.lines(x = c(0.035, 0.965), y = yh - 0.035, gp = gpar(col = ROSE, lwd = 1.5))
  sizes <- c(size1, size2, ifelse(fams[3] == MONO, size3, size2), size3)
  inks <- c(INK, INK, INK, ROSE)
  for (i in seq_len(nrow(rows))) {
    y <- yh - 0.035 - (i - 0.5) * step
    for (j in 1:4)
      grid.text(rows[i, j], x = cols[j], y = y, just = c("left", "center"),
                gp = gpar(fontfamily = fams[j], fontsize = sizes[j], col = inks[j]))
    if (i < nrow(rows))
      grid.lines(x = c(0.035, 0.965), y = y - step / 2,
                 gp = gpar(col = "#E2DDD6", lwd = 1))
  }
  grid.text(footer, x = 0.035, y = 0.075, just = c("left", "center"),
            gp = gpar(fontfamily = SANS, fontsize = 13, col = MUTED))
  invisible(dev.off())
  cat("  ", path, "\n")
}

bolsillo <- data.frame(
  tarea = c("Ranking", "Tendencia", "Distribución", "Composición", "Relación",
            "Lugar", "Cambio"),
  preg  = c("¿Cuál es más?", "¿Cómo cambió?", "¿Cómo se reparte?",
            "¿De qué está hecho el total?", "¿Van juntas?", "¿Dónde pasa más?",
            "¿Quién se movió más?"),
  aes   = c("x = número, y = categoría", "x = tiempo, y = número",
            "x = número | x = grupo, y = número", "x = grupo, fill = parte",
            "x = número, y = número", "x = número, y = lugar",
            "x = antes, xend = después"),
  geom  = c("geom_col() + reorder()", "geom_line() + geom_point()",
            "geom_histogram() · geom_boxplot()", 'geom_bar(position = "fill")',
            "geom_point() · geom_jitter() · geom_smooth()", "geom_point() + reorder()",
            "geom_segment() + geom_point()")
)
draw_table(file.path(OUT, "t0_bolsillo.png"),
           "PRIMERO LA TAREA, DESPUÉS EL GEOM", "Siete tareas, siete gráficos",
           bolsillo, c("Tarea", "La pregunta", "aes()", "El geom"),
           c(0.035, 0.17, 0.385, 0.645),
           "¿Un conteo de categorías, sin tabla previa? geom_bar() lo hace solo (clase 8).")

# Una pista por grupo, a partir de lo que entregaron en el Sprint 2. Los
# tipos de gráfico se reparten a propósito: nueve grupos, siete tareas.
grupos <- data.frame(
  grupo = sprintf("G%02d", 1:9),
  tema  = c("Gini y Palma en cuatro países", "Fondeporte: Chile e Irlanda",
            "Música chilena en las radios", "Suicidio: hombres y mujeres",
            "Presupuesto por ministerio", "Deserción escolar por comuna",
            "Alfabetización juvenil", "Matrícula en carreras tecnológicas",
            "Centralización en la salud"),
  tarea = c("Tendencia", "Composición", "Composición", "Relación",
            "Ranking de cambios", "Distribución", "Cambio", "Ranking", "Lugar"),
  geom  = c("geom_line(), color = país", 'geom_col(position = "fill")',
            'geom_bar(position = "fill")', "geom_point() + geom_abline()",
            "geom_col() + reorder()", "geom_boxplot(), x = año",
            "geom_segment() + geom_point()", "geom_col() + reorder()",
            "geom_point() + reorder()")
)
draw_table(file.path(OUT, "t9_grupos.png"),
           "SUS DATOS, SUS GRÁFICOS", "Una pista por grupo",
           grupos, c("Grupo", "Su proyecto", "La tarea", "Para empezar"),
           c(0.035, 0.11, 0.42, 0.62),
           "Una pista, no una receta: el panel premia al grupo que defiende bien otra opción.",
           step = 0.064, size1 = 14, size2 = 13.5, size3 = 12,
           fams = c(BOLD, SANS, BOLD, MONO))

# ── El elegido y el descartado ────────────────────────────────
top <- problemas %>% filter(anio == 2026) %>% arrange(desc(porcentaje)) %>% head(8)

torta <- ggplot(top, aes(x = "", y = porcentaje, fill = problema)) +
  geom_col(width = 1, colour = BG) +
  coord_polar(theta = "y") +
  scale_fill_manual(values = c("#C4878C", "#4F7396", "#B5B0AA", "#8A6F9E",
                               "#D9A86C", "#6E9E86", "#9C5B5F", "#7A8A99")) +
  labs(title = "Descartado: la torta", fill = NULL) +
  theme_void() + slide_theme +
  theme(axis.text = element_blank(), panel.grid = element_blank(),
        legend.text = element_text(size = 10.5))

barras <- ggplot(top, aes(x = porcentaje, y = reorder(problema, porcentaje))) +
  geom_col(fill = ROSE) +
  labs(title = "Elegido: barras ordenadas", x = "% que lo nombra primer problema",
       y = NULL) +
  theme_minimal() + slide_theme

path <- file.path(OUT, "t8_elegido_descartado.png")
open_canvas(path)
header("ASÍ SE DEFIENDE UN GRÁFICO", "Mismos datos, dos gráficos: ¿cuál responde?",
       "Tarea: ranking. Pregunta: ¿qué problema preocupa más en 2026?")
print(torta,  vp = viewport(x = 0.035, y = 0.20, width = 0.43, height = 0.53,
                            just = c("left", "bottom")))
print(barras, vp = viewport(x = 0.50,  y = 0.20, width = 0.43, height = 0.53,
                            just = c("left", "bottom")))
grid.text("Ocho tajadas: hay que ir y volver a la leyenda, y la torta reparte el 100% aunque estos ocho problemas suman 83%.",
          x = 0.035, y = 0.145, just = c("left", "center"),
          gp = gpar(fontfamily = SANS, fontsize = 13, col = INK))
grid.text("Las barras se leen de arriba abajo, sin leyenda, y el orden ya es la respuesta.",
          x = 0.035, y = 0.095, just = c("left", "center"),
          gp = gpar(fontfamily = SANS, fontsize = 13, col = INK))
invisible(dev.off())
cat("  ", path, "\n")
