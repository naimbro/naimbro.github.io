# Figuras del deck de la clase 13 de DVD 2026: "Al aire" (video-podcast).
#
# Mismo molde que las clases 10 y 12: código a la izquierda, gráfico a la
# derecha, y el gráfico se obtiene evaluando el texto que se proyecta. La idea
# nueva es guardar el gráfico en un objeto (p <-) y sumarle una capa por etapa,
# como se arma en pantalla durante el video. Acompañan scale_y_continuous(limits),
# geom_hline() y annotate(). Cada etapa se guarda con ggsave(): una etapa, un PNG,
# una lámina del video.
#
# Las cuatro láminas de código son acumulativas: cada una muestra el código de
# la anterior más una línea nueva, destacada en rosa. Las líneas de ggsave() se
# muestran pero no se evalúan.
#
# theme_minimal() y el estilo de la lámina se suman por fuera del código
# proyectado, como en las clases 10 y 12.
#
# Al final, la hoja de ruta de las cuatro últimas clases, con hoy destacado.
#
# Lienzo fijo de 1920x1080 sin recorte, como pide el template de Slides.
# Correr desde la raíz del repo:
#   Rscript materiales/2026_descripcion_visualizacion_datos/figuras/clase13/generar_figuras_clase13.R

suppressMessages({
  library(dplyr)
  library(ggplot2)
  library(grid)
})

BASE <- "materiales/2026_descripcion_visualizacion_datos"
OUT  <- file.path(BASE, "figuras", "clase13")

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
  plot.title    = element_text(family = BOLD, size = 16, margin = margin(b = 6)),
  plot.subtitle = element_text(colour = MUTED, size = 12, margin = margin(b = 10)),
  plot.caption  = element_text(colour = MUTED, size = 10, margin = margin(t = 10)),
  plot.title.position   = "plot",
  plot.caption.position = "plot",
  plot.background  = element_rect(fill = BG, colour = NA),
  panel.grid.minor = element_blank()
)

# El código de cada etapa. Se proyecta acumulado; se evalúa sin los ggsave().
ETAPA <- list(
'delinc <- problemas %>%
  filter(problema == "Delincuencia, asaltos y robos")

p <- ggplot(delinc, aes(x = anio, y = porcentaje)) +
  scale_y_continuous(limits = c(0, 40))
p
ggsave("etapa1.png", p, width = 8, height = 5)',

'p <- p + geom_line()
p
ggsave("etapa2.png", p, width = 8, height = 5)',

'p <- p + geom_hline(yintercept = 19, linetype = "dashed")
p
ggsave("etapa3.png", p, width = 8, height = 5)',

'p <- p + annotate("text", x = 2019, y = 10,
                  label = "2019: 14%")
p
ggsave("etapa4.png", p, width = 8, height = 5)'
)

FIGURAS <- list(
  list(file = "f1_marco.png", kicker = "ETAPA 1 · p <-",
       titulo = "p <- : el gráfico se guarda con nombre",
       sub = "El marco primero: los ejes, de 0 a 40, quietos en todas las etapas.",
       geom = "scale_y_continuous(limits = c(0, 40))"),
  list(file = "f2_linea.png", kicker = "ETAPA 2 · p + capa",
       titulo = "p + geom_line(): la primera capa",
       sub = "Se le suma una capa al gráfico guardado y se guarda de nuevo en p.",
       geom = "p <- p + geom_line()"),
  list(file = "f3_referencia.png", kicker = "ETAPA 3 · geom_hline()",
       titulo = "geom_hline(): la línea de referencia",
       sub = "Una línea horizontal en el punto de partida: 19% en 1994.",
       geom = "+ geom_hline(yintercept = 19)"),
  list(file = "f4_anotacion.png", kicker = "ETAPA 4 · annotate()",
       titulo = "annotate(): el dato que el conductor dice",
       sub = "Un texto en un punto del gráfico: x, y y lo que dice.",
       geom = 'annotate("text", x, y, label)')
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

# Código acumulado: las etapas anteriores en gris, la nueva en tinta, y su línea
# protagonista en rosa.
code_panel <- function(previas, nueva, geom) {
  prev_lines <- if (length(previas)) unlist(strsplit(paste(previas, collapse = "\n\n"), "\n")) else character(0)
  new_lines  <- strsplit(nueva, "\n")[[1]]
  lines <- c(prev_lines, if (length(prev_lines)) "" else NULL, new_lines)
  cols  <- c(rep(MUTED, length(prev_lines)), if (length(prev_lines)) MUTED else NULL,
             rep(INK, length(new_lines)))
  fs <- if (length(lines) > 22) 10 else if (length(lines) > 17) 11 else 12
  pushViewport(viewport(x = 0.035, y = 0.11, width = 0.40, height = 0.63,
                        just = c("left", "bottom")))
  grid.roundrect(r = unit(6, "pt"), gp = gpar(fill = PANEL, col = NA))
  grid.text(lines, x = unit(14, "pt"),
            y = unit(1, "npc") - unit(14, "pt") - unit((seq_along(lines) - 1) * fs * 1.22, "pt"),
            just = c("left", "top"),
            gp = gpar(fontfamily = MONO, fontsize = fs, col = cols))
  grid.text(geom, x = unit(14, "pt"), y = unit(14, "pt"), just = c("left", "bottom"),
            gp = gpar(fontfamily = MONO, fontsize = 13, fontface = "bold", col = ROSE))
  popViewport()
}

sin_ggsave <- function(code) {
  lines <- strsplit(code, "\n")[[1]]
  paste(lines[!grepl("^ggsave", lines)], collapse = "\n")
}

env <- new.env()
assign("problemas", problemas, envir = env)
for (i in seq_along(FIGURAS)) {
  f <- FIGURAS[[i]]
  p <- suppressMessages(eval(parse(text = sin_ggsave(ETAPA[[i]])), envir = env))
  p <- p + theme_minimal() + slide_theme
  path <- file.path(OUT, f$file)
  open_canvas(path)
  header(f$kicker, f$titulo, f$sub)
  code_panel(ETAPA[seq_len(i - 1)], ETAPA[[i]], f$geom)
  suppressWarnings(suppressMessages(
    print(p, vp = viewport(x = 0.46, y = 0.19, width = 0.50, height = 0.64,
                           just = c("left", "bottom")))))
  grid.text(sprintf("→ etapa%d.png: la lámina %d del video", i, i),
            x = 0.47, y = 0.15, just = c("left", "center"),
            gp = gpar(fontfamily = MONO, fontsize = 12, col = MUTED))
  invisible(dev.off())
  cat("  ", path, "\n")
}

# ── Las cuatro etapas, en fila: así se ven las láminas del video ──
etapas <- list()
e2 <- new.env()
assign("problemas", problemas, envir = e2)
for (i in seq_along(ETAPA)) {
  etapas[[i]] <- suppressMessages(eval(parse(text = sin_ggsave(ETAPA[[i]])), envir = e2)) +
    theme_minimal() + slide_theme + theme(axis.text = element_text(size = 9))
}
path <- file.path(OUT, "f5_cuatro_laminas.png")
open_canvas(path)
header("EN EL VIDEO", "Cuatro PNG, cuatro láminas",
       "Pasan de una a otra mientras hablan: el eje no se mueve, el gráfico crece.")
xs <- c(0.035, 0.275, 0.515, 0.755)
for (i in 1:4) {
  pushViewport(viewport(x = xs[i], y = 0.30, width = 0.215, height = 0.40,
                        just = c("left", "bottom")))
  grid.rect(gp = gpar(fill = BG, col = PANEL, lwd = 2))
  suppressWarnings(suppressMessages(print(etapas[[i]], newpage = FALSE)))
  popViewport()
  grid.text(sprintf("etapa%d.png", i), x = xs[i], y = 0.25, just = c("left", "center"),
            gp = gpar(fontfamily = MONO, fontsize = 13, col = ROSE))
  grid.text(c("el marco", "la línea", "el punto de partida", "el dato")[i],
            x = xs[i], y = 0.205, just = c("left", "center"),
            gp = gpar(fontfamily = SANS, fontsize = 14, col = INK))
}
invisible(dev.off())
cat("  ", path, "\n")

# ── Hoja de ruta: los tres desafíos y el demo day, hoy el video ──
hitos <- data.frame(
  fecha  = c("Lunes 2 de noviembre", "Lunes 9 de noviembre",
             "Lunes 16 de noviembre", "Lunes 23 de noviembre"),
  nombre = c("Observatorio", "Video-podcast", "Carrusel", "Demo day"),
  verbo  = c("estructurar", "narrar", "sintetizar", "su formato, publicado"),
  r      = c("ggsave() · facet_grid()", "p + capas · annotate()",
             "geom_text() · slice_max()", "el Google Site del grupo")
)

path <- file.path(OUT, "hoja_de_ruta_clase13.png")
open_canvas(path)
header("LA RUTA AL DEMO DAY", "Tres desafíos, un formato elegido",
       "Mismos hallazgos, tres envases. El 16 de noviembre cada grupo elige el suyo.")
xs <- c(0.035, 0.27, 0.505, 0.74)
w  <- 0.215
for (i in 1:4) {
  hoy <- i == 2
  final <- i == 4
  hecho <- i == 1
  pushViewport(viewport(x = xs[i], y = 0.22, width = w, height = 0.46,
                        just = c("left", "bottom")))
  grid.roundrect(r = unit(8, "pt"),
                 gp = gpar(fill = if (hoy) ROSE else if (final) INK else PANEL, col = NA))
  tinta <- if (hoy || final) BG else if (hecho) MUTED else INK
  grid.text(hitos$fecha[i], x = 0.08, y = 0.86, just = c("left", "center"),
            gp = gpar(fontfamily = SANS, fontsize = 13, col = tinta))
  grid.text(hitos$nombre[i], x = 0.08, y = 0.66, just = c("left", "center"),
            gp = gpar(fontfamily = BOLD, fontsize = 24, col = tinta))
  grid.text(hitos$verbo[i], x = 0.08, y = 0.48, just = c("left", "center"),
            gp = gpar(fontfamily = SANS, fontsize = 16, col = tinta))
  grid.text(hitos$r[i], x = 0.08, y = 0.16, just = c("left", "center"),
            gp = gpar(fontfamily = if (final) SANS else MONO, fontsize = 12, col = tinta))
  popViewport()
}
grid.text("HECHO", x = xs[1] + 0.01, y = 0.715, just = c("left", "center"),
          gp = gpar(fontfamily = BOLD, fontsize = 13, col = MUTED))
grid.text("HOY", x = xs[2] + 0.01, y = 0.715, just = c("left", "center"),
          gp = gpar(fontfamily = BOLD, fontsize = 13, col = ROSE))
grid.text("Cada desafío tiene un ganador: el podio suma una décima al Sprint 4.",
          x = 0.035, y = 0.12, just = c("left", "center"),
          gp = gpar(fontfamily = SANS, fontsize = 14, col = MUTED))
invisible(dev.off())
cat("  ", path, "\n")
