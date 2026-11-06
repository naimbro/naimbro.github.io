# Figuras del deck de la clase 14 de DVD 2026: "Community manager" (carrusel).
#
# Mismo molde que las clases 10 y 12: código a la izquierda, gráfico a la
# derecha, y el gráfico se obtiene evaluando el texto que se proyecta. La
# función nueva protagonista es slice_max(); la acompaña geom_text(aes(label = )).
# Se reutilizan reorder() (clase 9), scale_fill_manual() (clase 9), paste0() y
# round() (clase 2) y ggsave() (clase 12), ahora con width = 4, height = 4.
#
# Para destacar una barra se usa mutate(destacado = problema == "...") y
# scale_fill_manual(..., guide = "none"): sin ifelse() ni theme(), que no se han
# visto o son ruido en la lámina. theme_minimal() y el estilo de la lámina se
# suman por fuera del código proyectado, como en las clases 10 y 12.
#
# En f4 el gráfico se dibuja en un recuadro de exactamente 4 × 4 pulgadas a la
# misma resolución, así que se ve como el PNG que sale de ggsave(). La línea de
# ggsave() se muestra pero no se evalúa.
#
# Al final: un ejemplo de carrusel de seis láminas con la CEP y la hoja de ruta.
#
# Lienzo fijo de 1920x1080 sin recorte, como pide el template de Slides.
# Correr desde la raíz del repo:
#   Rscript materiales/2026_descripcion_visualizacion_datos/figuras/clase14/generar_figuras_clase14.R

suppressMessages({
  library(dplyr)
  library(ggplot2)
  library(grid)
})

BASE <- "materiales/2026_descripcion_visualizacion_datos"
OUT  <- file.path(BASE, "figuras", "clase14")
dir.create(OUT, showWarnings = FALSE, recursive = TRUE)

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
  panel.grid.minor = element_blank(),
  panel.grid.major.y = element_blank()
)

# Lo que sigue se evalúa antes de las figuras que lo necesitan (f2 a f4).
TOP5 <- '
top5 <- problemas %>%
  filter(anio == 2026) %>%
  slice_max(porcentaje, n = 5)'

FIGURAS <- list(
  list(
    file = "f1_slice_max.png", kicker = "FUNCIÓN NUEVA · 1",
    titulo = "slice_max(): quedarse con los primeros",
    sub = "Las cinco filas con el porcentaje más alto. Antes: arrange(desc()) + head().",
    geom = "slice_max(variable, n = 5)",
    code = '
top5 <- problemas %>%
  filter(anio == 2026) %>%
  slice_max(porcentaje, n = 5)

ggplot(top5, aes(x = porcentaje,
                 y = reorder(problema, porcentaje))) +
  geom_col()'),

  list(
    file = "f2_geom_text.png", kicker = "FUNCIÓN NUEVA · 2",
    titulo = "geom_text(): el número sobre la barra",
    sub = "En tres segundos nadie lee un eje: el número va en la barra.",
    geom = "+ geom_text(aes(label = ...))",
    code = '
ggplot(top5, aes(x = porcentaje,
                 y = reorder(problema, porcentaje))) +
  geom_col() +
  geom_text(aes(label = paste0(round(porcentaje), "%")),
            nudge_x = 2)'),

  list(
    file = "f3_destacado.png", kicker = "YA LO CONOCEN",
    titulo = "Una barra en rosa: el hallazgo",
    sub = "mutate() marca el hallazgo; scale_fill_manual() le da su color.",
    geom = "scale_fill_manual(values = c(...))",
    code = '
top5 <- top5 %>%
  mutate(destacado = problema ==
           "Delincuencia, asaltos y robos")

ggplot(top5, aes(x = porcentaje,
                 y = reorder(problema, porcentaje),
                 fill = destacado)) +
  geom_col() +
  geom_text(aes(label = paste0(round(porcentaje), "%")),
            nudge_x = 2) +
  scale_fill_manual(values = c("grey75", "#C4878C"),
                    guide = "none")'),

  list(
    file = "f4_cuadrado.png", kicker = "LA LÁMINA DEL CARRUSEL",
    titulo = "ggsave() cuadrado: 4 × 4",
    sub = "Una idea por lámina, el hallazgo en el título y la letra grande.",
    geom = 'ggsave("lamina2.png", width = 4, height = 4)',
    cuadrado = TRUE,
    code = '
ggplot(top5, aes(x = porcentaje,
                 y = reorder(problema, porcentaje),
                 fill = destacado)) +
  geom_col() +
  geom_text(aes(label = paste0(round(porcentaje), "%")),
            nudge_x = 4) +
  scale_fill_manual(values = c("grey75", "#C4878C"),
                    guide = "none") +
  scale_x_continuous(limits = c(0, 40)) +
  labs(title = "1 de cada 3: la delincuencia",
       x = NULL, y = NULL,
       caption = "Fuente: CEP 2026")

ggsave("lamina2.png", width = 4, height = 4)',
    eval = '
ggplot(top5, aes(x = porcentaje,
                 y = reorder(problema, porcentaje),
                 fill = destacado)) +
  geom_col() +
  geom_text(aes(label = paste0(round(porcentaje), "%")),
            nudge_x = 4) +
  scale_fill_manual(values = c("grey75", "#C4878C"),
                    guide = "none") +
  scale_x_continuous(limits = c(0, 40)) +
  labs(title = "1 de cada 3: la delincuencia",
       x = NULL, y = NULL,
       caption = "Fuente: CEP 2026")')
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
  fs <- if (length(lines) > 16) 11 else 12
  pushViewport(viewport(x = 0.035, y = 0.11, width = 0.43, height = 0.63,
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

# El top 5 existe para todas las figuras; f3 agrega la columna destacado.
eval(parse(text = TOP5))
for (f in FIGURAS) {
  src <- if (is.null(f$eval)) f$code else f$eval
  p <- suppressMessages(eval(parse(text = src))) + theme_minimal() + slide_theme
  path <- file.path(OUT, f$file)
  open_canvas(path)
  header(f$kicker, f$titulo, f$sub)
  code_panel(f$code, f$geom)
  if (isTRUE(f$cuadrado)) {
    # 4 × 4 pulgadas a 144 dpi: lo mismo que deja ggsave(width = 4, height = 4).
    grid.rect(x = 0.73, y = 0.43, width = unit(4, "inches"), height = unit(4, "inches"),
              gp = gpar(fill = NA, col = "#D9D2CA", lwd = 2))
    suppressMessages(print(p, vp = viewport(x = 0.73, y = 0.43,
                                            width = unit(4, "inches"),
                                            height = unit(4, "inches"))))
    grid.text("→ lamina2.png, cuadrada", x = 0.73, y = 0.115, just = c("center", "center"),
              gp = gpar(fontfamily = MONO, fontsize = 12, col = MUTED))
  } else {
    # El gráfico deja libre la esquina inferior derecha, donde va el logo.
    suppressMessages(print(p, vp = viewport(x = 0.49, y = 0.13, width = 0.47, height = 0.70,
                                            just = c("left", "bottom"))))
  }
  invisible(dev.off())
  cat("  ", path, "\n")
}

# ── Un carrusel de ejemplo: seis láminas con la CEP ───────────
delinc <- problemas %>% filter(problema == "Delincuencia, asaltos y robos")
lamina_tema <- theme_minimal() + slide_theme +
  theme(plot.title = element_text(family = BOLD, size = 11, margin = margin(b = 3)),
        plot.caption = element_text(colour = MUTED, size = 7),
        axis.text = element_text(size = 7, colour = INK),
        plot.margin = margin(8, 10, 6, 8))

barras <- ggplot(top5, aes(x = porcentaje, y = reorder(problema, porcentaje),
                           fill = destacado)) +
  geom_col() +
  geom_text(aes(label = paste0(round(porcentaje), "%")), nudge_x = 7,
            family = BOLD, size = 2.6) +
  scale_fill_manual(values = c("grey75", ROSE), guide = "none") +
  scale_x_continuous(limits = c(0, 45)) +
  labs(title = "Ninguna otra pasa del 15%", x = NULL, y = NULL) +
  lamina_tema + theme(panel.grid = element_blank(), axis.text.x = element_blank())

linea <- ggplot(delinc, aes(x = anio, y = porcentaje)) +
  geom_line(colour = ROSE, linewidth = 0.9) +
  labs(title = "En 1994 era 1 de cada 5", x = NULL, y = NULL) +
  lamina_tema

tarjeta <- function(texto, sub = NULL, fondo = BG, tinta = INK, tam = 17) {
  grid.rect(gp = gpar(fill = fondo, col = NA))
  grid.text(texto, x = 0.09, y = 0.62, just = c("left", "center"),
            gp = gpar(fontfamily = BOLD, fontsize = tam, col = tinta, lineheight = 1.05))
  if (!is.null(sub))
    grid.text(sub, x = 0.09, y = 0.2, just = c("left", "center"),
              gp = gpar(fontfamily = SANS, fontsize = 9, col = tinta, lineheight = 1.1))
}

path <- file.path(OUT, "f5_carrusel_ejemplo.png")
open_canvas(path)
header("UN EJEMPLO CON LA CEP", "Un carrusel: seis láminas, tres segundos cada una",
       "La portada engancha; cada lámina siguiente dice una sola cosa.")
lado <- 0.305  # alto relativo de cada lámina cuadrada
ancho <- lado * 1080 / 1920
xs <- 0.035 + (0:2) * (ancho + 0.025)
ys <- c(0.415, 0.08)
laminas <- list(
  function() tarjeta("1 de cada 3\nchilenos dice:\nla delincuencia", "desliza →",
                     fondo = ROSE, tinta = BG, tam = 19),
  function() print(barras, newpage = FALSE),
  function() print(linea, newpage = FALSE),
  function() tarjeta("La salud,\nsegunda:\n13%", "a 18 puntos de la primera"),
  function() tarjeta("El campo ya\nalcanzó a\nla ciudad", "32% y 31% en 2026"),
  function() tarjeta("Qué no dice:\npor qué", "Fuente: Encuesta CEP 1994–2026,\nsin 2020",
                     fondo = INK, tinta = BG)
)
for (i in seq_along(laminas)) {
  fila <- (i - 1) %/% 3 + 1
  col  <- (i - 1) %% 3 + 1
  pushViewport(viewport(x = xs[col], y = ys[fila], width = ancho, height = lado,
                        just = c("left", "bottom")))
  grid.rect(gp = gpar(fill = BG, col = "#D9D2CA", lwd = 1.5))
  suppressMessages(laminas[[i]]())
  grid.text(i, x = 0.95, y = 0.93, just = c("right", "top"),
            gp = gpar(fontfamily = BOLD, fontsize = 9, col = MUTED))
  popViewport()
}
# Las reglas, a la derecha de las láminas.
reglas <- c("1 · La portada es el gancho",
            "2 a 5 · Sus cinco candidatos,\nuno por lámina",
            "6 · Qué no dicen los datos\ny la fuente")
for (i in seq_along(reglas))
  grid.text(reglas[i], x = 0.70, y = 0.68 - (i - 1) * 0.16, just = c("left", "top"),
            gp = gpar(fontfamily = SANS, fontsize = 15, col = INK, lineheight = 1.1))
invisible(dev.off())
cat("  ", path, "\n")

# ── Hoja de ruta: los tres desafíos y el demo day ─────────────
hitos <- data.frame(
  fecha  = c("Lunes 2 de noviembre", "Lunes 9 de noviembre",
             "Lunes 16 de noviembre", "Lunes 23 de noviembre"),
  nombre = c("Observatorio", "Video-podcast", "Carrusel", "Demo day"),
  verbo  = c("estructurar", "narrar", "sintetizar", "su formato, publicado"),
  r      = c("ggsave() · facet_grid()", "p + capas · annotate()",
             "geom_text() · slice_max()", "el Google Site del grupo")
)

path <- file.path(OUT, "hoja_de_ruta_clase14.png")
open_canvas(path)
header("LA RUTA AL DEMO DAY", "Último desafío: hoy eligen su formato",
       "Mismos hallazgos, tres envases. Al cierre de hoy, cada grupo anota el suyo.")
xs <- c(0.035, 0.27, 0.505, 0.74)
w  <- 0.215
for (i in 1:4) {
  hoy <- i == 3
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
grid.text("HOY", x = xs[3] + 0.01, y = 0.715, just = c("left", "center"),
          gp = gpar(fontfamily = BOLD, fontsize = 13, col = ROSE))
grid.text("Cada desafío tiene un ganador: el podio suma una décima al Sprint 4.",
          x = 0.035, y = 0.12, just = c("left", "center"),
          gp = gpar(fontfamily = SANS, fontsize = 14, col = MUTED))
invisible(dev.off())
cat("  ", path, "\n")
