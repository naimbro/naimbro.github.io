# Figuras del deck de la clase 12 de DVD 2026: "La licitación".
#
# Mismo molde que las clases 9 y 10: código a la izquierda, gráfico a la
# derecha, y el gráfico se obtiene evaluando el texto que se proyecta. Las
# funciones nuevas son ggsave() y facet_grid(); la tercera lámina repasa labs()
# con la regla de la portada: el título es el hallazgo.
#
# theme_minimal() y el estilo de la lámina se suman por fuera del código
# proyectado, como en la clase 10. En f1, la línea de ggsave() se muestra pero
# no se evalúa: aquí sólo interesa el gráfico.
#
# Al final, la hoja de ruta de las cuatro últimas clases (en R y no en Python,
# para no depender de matplotlib).
#
# Lienzo fijo de 1920x1080 sin recorte, como pide el template de Slides.
# Correr desde la raíz del repo:
#   Rscript materiales/2026_descripcion_visualizacion_datos/figuras/clase12/generar_figuras_clase12.R

suppressMessages({
  library(dplyr)
  library(ggplot2)
  library(grid)
})

BASE <- "materiales/2026_descripcion_visualizacion_datos"
OUT  <- file.path(BASE, "figuras", "clase12")

BG    <- "#F9F7F4"
INK   <- "#2C2C2C"
ROSE  <- "#C4878C"
MUTED <- "#8C8C8C"
PANEL <- "#EFEAE4"
SANS  <- "Franklin Gothic Book"
BOLD  <- "Franklin Gothic Demi"
MONO  <- "Consolas"

problemas <- read.csv(file.path(BASE, "datos", "cep_problemas_por_anio.csv"))
cep <- read.csv(file.path(BASE, "datos", "cep_consolidada_1994_2026.csv"))

slide_theme <- theme(
  text          = element_text(family = SANS, colour = INK, size = 13),
  axis.text     = element_text(colour = INK, size = 11),
  plot.title    = element_text(family = BOLD, size = 16, margin = margin(b = 6)),
  plot.subtitle = element_text(colour = MUTED, size = 12, margin = margin(b = 10)),
  plot.caption  = element_text(colour = MUTED, size = 10, margin = margin(t = 10)),
  strip.text    = element_text(family = BOLD, size = 11, hjust = 0),
  plot.title.position   = "plot",
  plot.caption.position = "plot",
  plot.background  = element_rect(fill = BG, colour = NA),
  panel.grid.minor = element_blank()
)

FIGURAS <- list(
  list(
    file = "f1_ggsave.png", kicker = "FUNCIÓN NUEVA · 1",
    titulo = "ggsave(): el gráfico sale de Colab",
    sub = "Guarda el último gráfico como PNG, del tamaño que le pidan.",
    geom = 'ggsave("archivo.png", width, height)',
    nota = "→ delincuencia.png, de 8 × 5 pulgadas, en el panel de archivos",
    code = '
delinc <- problemas %>%
  filter(problema == "Delincuencia, asaltos y robos")

ggplot(delinc, aes(x = anio, y = porcentaje)) +
  geom_line()

ggsave("delincuencia.png", width = 8, height = 5)',
    eval = '
delinc <- problemas %>%
  filter(problema == "Delincuencia, asaltos y robos")

ggplot(delinc, aes(x = anio, y = porcentaje)) +
  geom_line()'),

  list(
    file = "f2_facet_grid.png", kicker = "FUNCIÓN NUEVA · 2",
    titulo = "facet_grid(): cruzar dos variables",
    sub = "filas ~ columnas: la zona en las filas, el sexo en las columnas.",
    geom = "+ facet_grid(filas ~ columnas)",
    code = '
delinc_grupos <- cep %>%
  mutate(delinc = problema_1 ==
           "Delincuencia, asaltos y robos") %>%
  group_by(anio, sexo, zona) %>%
  summarise(pct = mean(delinc) * 100)

ggplot(delinc_grupos, aes(x = anio, y = pct)) +
  geom_line() +
  facet_grid(zona ~ sexo)'),

  list(
    file = "f3_titular.png", kicker = "LA REGLA DE LA PORTADA",
    titulo = "El título es el hallazgo",
    sub = "Título: lo que encontraron. Subtítulo: qué se mide. Caption: la fuente.",
    geom = "labs(title, subtitle, caption)",
    code = '
ggplot(delinc_grupos, aes(x = anio, y = pct)) +
  geom_line() +
  facet_grid(zona ~ sexo) +
  labs(
    title = "Campo: de 13% a 32%. Ciudad: de 20% a 31%",
    subtitle = "% que nombra la delincuencia primero",
    x = NULL, y = NULL,
    caption = "Fuente: CEP 1994-2026, sin 2020")')
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
  src <- if (is.null(f$eval)) f$code else f$eval
  p <- suppressMessages(eval(parse(text = src))) + theme_minimal() + slide_theme
  path <- file.path(OUT, f$file)
  open_canvas(path)
  header(f$kicker, f$titulo, f$sub)
  code_panel(f$code, f$geom)
  # El gráfico deja libre la esquina inferior derecha, donde va el logo.
  alto <- if (is.null(f$nota)) 0.70 else 0.64
  base <- if (is.null(f$nota)) 0.13 else 0.19
  suppressMessages(print(p, vp = viewport(x = 0.46, y = base, width = 0.50, height = alto,
                                          just = c("left", "bottom"))))
  if (!is.null(f$nota))
    grid.text(f$nota, x = 0.47, y = 0.15, just = c("left", "center"),
              gp = gpar(fontfamily = MONO, fontsize = 12, col = MUTED))
  invisible(dev.off())
  cat("  ", path, "\n")
}

# ── Hoja de ruta: los tres desafíos y el demo day ─────────────
hitos <- data.frame(
  fecha  = c("Lunes 2 de noviembre", "Lunes 9 de noviembre",
             "Lunes 16 de noviembre", "Lunes 23 de noviembre"),
  nombre = c("Observatorio", "Video-podcast", "Carrusel", "Demo day"),
  verbo  = c("estructurar", "narrar", "sintetizar", "su formato, publicado"),
  r      = c("ggsave() · facet_grid()", "p + capas · annotate()",
             "geom_text() · slice_max()", "el Google Site del grupo")
)

path <- file.path(OUT, "hoja_de_ruta_clase12.png")
open_canvas(path)
header("LA RUTA AL DEMO DAY", "Tres desafíos, un formato elegido",
       "Mismos hallazgos, tres envases. El 16 de noviembre cada grupo elige el suyo.")
xs <- c(0.035, 0.27, 0.505, 0.74)
w  <- 0.215
for (i in 1:4) {
  hoy <- i == 1
  final <- i == 4
  pushViewport(viewport(x = xs[i], y = 0.22, width = w, height = 0.46,
                        just = c("left", "bottom")))
  grid.roundrect(r = unit(8, "pt"),
                 gp = gpar(fill = if (hoy) ROSE else if (final) INK else PANEL, col = NA))
  tinta <- if (hoy || final) BG else INK
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
grid.text("HOY", x = xs[1] + 0.01, y = 0.715, just = c("left", "center"),
          gp = gpar(fontfamily = BOLD, fontsize = 13, col = ROSE))
grid.text("Cada desafío tiene un ganador: el podio suma una décima al Sprint 4.",
          x = 0.035, y = 0.12, just = c("left", "center"),
          gp = gpar(fontfamily = SANS, fontsize = 14, col = MUTED))
invisible(dev.off())
cat("  ", path, "\n")
