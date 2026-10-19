# Figuras del deck de la clase 10 de DVD 2026: "Tres variables y un titular".
#
# Mismo molde que la clase 9: código a la izquierda, gráfico a la derecha, y el
# gráfico se obtiene evaluando exactamente el texto que se proyecta. La serie
# es cep_problemas_por_anio.csv, que conocen desde la clase 6.
#
# A diferencia de la clase 9, theme_minimal() y la leyenda abajo se suman por
# fuera del código proyectado: Naim pidió sacar de la lámina las líneas de theme,
# que son ruido para lo que se enseña. El gráfico de la lámina tiene fondo blanco;
# el que les sale a ellos, el gris por defecto de ggplot.
#
# Lienzo fijo de 1920x1080 sin recorte, como pide el template de Slides.
# Correr desde la raíz del repo:
#   Rscript materiales/2026_descripcion_visualizacion_datos/figuras/clase10/generar_figuras_clase10.R

suppressMessages({
  library(dplyr)
  library(ggplot2)
  library(grid)
})

BASE <- "materiales/2026_descripcion_visualizacion_datos"
OUT  <- file.path(BASE, "figuras", "clase10")

BG    <- "#F9F7F4"
INK   <- "#2C2C2C"
ROSE  <- "#C4878C"
MUTED <- "#8C8C8C"
PANEL <- "#EFEAE4"
SANS  <- "Franklin Gothic Book"
BOLD  <- "Franklin Gothic Demi"
MONO  <- "Consolas"

problemas <- read.csv(file.path(BASE, "datos", "cep_problemas_por_anio.csv"))

slide_theme <- theme(
  text          = element_text(family = SANS, colour = INK, size = 13),
  axis.text     = element_text(colour = INK, size = 11),
  plot.title    = element_text(family = BOLD, size = 17, margin = margin(b = 10)),
  plot.caption  = element_text(colour = MUTED, size = 10, margin = margin(t = 10)),
  strip.text    = element_text(family = BOLD, size = 11, hjust = 0),
  plot.title.position   = "plot",
  plot.caption.position = "plot",
  plot.background  = element_rect(fill = BG, colour = NA),
  panel.grid.minor = element_blank(),
  legend.text      = element_text(size = 11),
  legend.position  = "bottom"
)

FIGURAS <- list(
  list(
    file = "f1_dos_variables.png", kicker = "LO QUE YA SABEN",
    titulo = "Dos variables: año y porcentaje",
    sub = "Una serie, un eje x, un eje y.",
    geom = "aes(x, y) + geom_line()",
    code = '
delinc <- problemas %>%
  filter(problema == "Delincuencia, asaltos y robos")

ggplot(delinc, aes(x = anio, y = porcentaje)) +
  geom_line(color = "#C4878C") +
  geom_point(color = "#C4878C") +
  labs(
    title = "La delincuencia, de 19% a 31%",
    x = NULL,
    y = "% que la nombra primer problema",
    caption = "Fuente: CEP 1994-2026, sin 2020")'),

  list(
    file = "f2_color.png", kicker = "TERCERA VARIABLE · 1",
    titulo = "color = : todos en el mismo plano",
    sub = "Para comparar pocos grupos: ¿quién va arriba?",
    geom = "aes(..., color = problema)",
    code = '
cuatro <- problemas %>%
  filter(problema %in% c(
    "Delincuencia, asaltos y robos",
    "Salud", "Pobreza", "Empleo"))

ggplot(cuatro, aes(x = anio, y = porcentaje,
                   color = problema)) +
  geom_line() +
  labs(
    title = "La pobreza bajó; la delincuencia subió",
    x = NULL, y = "% primer problema",
    caption = "Fuente: CEP 1994-2026, sin 2020")'),

  list(
    file = "f3_facetas.png", kicker = "TERCERA VARIABLE · 2",
    titulo = "facet_wrap(): un panel por grupo",
    sub = "Para muchos grupos, o cuando importa la forma de cada uno.",
    geom = "+ facet_wrap(~ problema)",
    code = '
ocho <- problemas %>%
  filter(problema %in% c(
    "Delincuencia, asaltos y robos",
    "Salud", "Pobreza", "Empleo",
    "Educación", "Sueldos",
    "Corrupción", "Vivienda"))

ggplot(ocho, aes(x = anio, y = porcentaje)) +
  geom_line(color = "#C4878C") +
  facet_wrap(~ problema, ncol = 2) +
  labs(
    title = "Sólo la delincuencia subió con fuerza",
    x = NULL, y = "% primer problema",
    caption = "Fuente: CEP 1994-2026, sin 2020")'),

  list(
    file = "f4_titular.png", kicker = "DEL GRÁFICO AL TITULAR",
    titulo = "El color dice el titular; el resto, en gris",
    sub = "Primero la frase; después, el gráfico que la muestra.",
    geom = "geom_line(data = ...)",
    code = '
delinc <- cuatro %>%
  filter(problema == "Delincuencia, asaltos y robos")
pobreza <- cuatro %>%
  filter(problema == "Pobreza")

ggplot(cuatro, aes(x = anio, y = porcentaje,
                   group = problema)) +
  geom_line(color = "#B5B0AA") +
  geom_line(data = pobreza,
            color = "#2C2C2C", linewidth = 1) +
  geom_line(data = delinc,
            color = "#C4878C", linewidth = 1) +
  labs(
    title = "En 1994 empataban; hoy, 31% contra 3%",
    x = NULL, y = "% primer problema",
    caption = "Rosa: delincuencia · negro: pobreza")')
)

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
  fs <- if (length(lines) > 20) 11 else 12
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

for (f in FIGURAS) {
  p <- eval(parse(text = f$code)) + theme_minimal() + slide_theme
  path <- file.path(OUT, f$file)
  open_canvas(path)
  header(f$kicker, f$titulo, f$sub)
  code_panel(f$code, f$geom)
  # El gráfico deja libre la esquina inferior derecha, donde va el logo.
  print(p, vp = viewport(x = 0.46, y = 0.13, width = 0.50, height = 0.70,
                         just = c("left", "bottom")))
  invisible(dev.off())
  cat("  ", path, "\n")
}

# ── Una pista por sección (ejercicio de redacción) ────────────
# Sale de lo que cada grupo entregó en el Sprint 2 y de la tabla de la clase 9.
# Es una pista, no una receta: la tercera variable la deciden ellos.
pistas <- data.frame(
  grupo = sprintf("G%02d", 1:9),
  tema  = c("Gini y Palma en cuatro países", "Fondeporte: Chile e Irlanda",
            "Música chilena en las radios", "Suicidio: hombres y mujeres",
            "Presupuesto por ministerio", "Deserción escolar por comuna",
            "Alfabetización juvenil", "Matrícula en carreras tecnológicas",
            "Centralización en la salud"),
  pista = c("color = país", "x = país, fill = deporte",
            "x = año, fill = origen", "color = continente",
            "facet_wrap(~ ministerio)", "facet_wrap(~ año)",
            "facet_wrap(~ país)", "facet_wrap(~ año)",
            "facet_wrap(~ año)"),
  ojo   = c("Gini y Palma: un gráfico cada uno", "Sólo porcentajes, nunca pesos y euros",
            "Porcentajes por año, no totales", "Un año con buena cobertura",
            "Sin las filas «Total»", "Comunas con pocos alumnos, fuera",
            "Las ocho líneas enredadas, separadas", "Revisar el corte en 1.048.575 filas",
            "Tasas por habitante, no totales")
)

path <- file.path(OUT, "f5_pistas.png")
open_canvas(path)
header("UNA PISTA POR SECCIÓN", "La tercera variable de cada grupo")
cols <- c(0.035, 0.105, 0.40, 0.66)
heads <- c("Grupo", "Su proyecto", "Para empezar", "Ojo con")
yh <- 0.74
for (j in 1:4)
  grid.text(heads[j], x = cols[j], y = yh, just = c("left", "center"),
            gp = gpar(fontfamily = BOLD, fontsize = 13, col = MUTED))
grid.lines(x = c(0.035, 0.965), y = yh - 0.035, gp = gpar(col = ROSE, lwd = 1.5))
step <- 0.066
fams <- c(BOLD, SANS, MONO, SANS)
inks <- c(INK, INK, ROSE, INK)
for (i in seq_len(nrow(pistas))) {
  y <- yh - 0.035 - (i - 0.5) * step
  for (j in 1:4)
    grid.text(pistas[i, j], x = cols[j], y = y, just = c("left", "center"),
              gp = gpar(fontfamily = fams[j], fontsize = 13.5, col = inks[j]))
  if (i < nrow(pistas))
    grid.lines(x = c(0.035, 0.965), y = y - step / 2, gp = gpar(col = "#E2DDD6", lwd = 1))
}
grid.text("Una pista, no una receta: si otra tercera variable cuenta mejor su titular, úsenla.",
          x = 0.035, y = 0.06, just = c("left", "center"),
          gp = gpar(fontfamily = SANS, fontsize = 13, col = MUTED))
invisible(dev.off())
cat("  ", path, "\n")
