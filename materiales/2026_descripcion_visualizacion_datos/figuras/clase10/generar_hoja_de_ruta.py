"""
Hoja de ruta de Descripción y Visualización de Datos (UAI 2026), vista desde la
clase 10 (lunes 19 de octubre).

Recicla el «mapa de lo visto» de la clase 6 (qué quedó en sus manos en cada
clase) y lo extiende al semestre completo: las quince clases, las tres fases
del proyecto y los cuatro hitos de entrega, con la clase de hoy destacada.

Lienzo fijo de 1920x1080, sin bbox tight, para que Google Slides no lo deforme.

    python generar_hoja_de_ruta.py      # escribe hoja_de_ruta_clase10.png aquí
"""

import os

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager
from matplotlib.patches import FancyBboxPatch

HERE = os.path.dirname(os.path.abspath(__file__))

PAPER = "#F9F7F4"
INK = "#2C2C2C"
ROSE = "#C4878C"
MUTED = "#8C8681"
LINE = "#DAD5CE"

_installed = {f.name for f in font_manager.fontManager.ttflist}
for _candidate in ("Libre Franklin", "Segoe UI", "Helvetica Neue", "Arial"):
    if _candidate in _installed:
        FONT = _candidate
        break
else:
    FONT = "DejaVu Sans"

plt.rcParams.update({
    "font.family": FONT,
    "figure.facecolor": PAPER,
    "savefig.facecolor": PAPER,
    "text.color": INK,
    "savefig.dpi": 150,          # 12.8 x 7.2 pulgadas -> 1920 x 1080
})

HOY = 10

FECHAS = ["03-08", "10-08", "17-08", "24-08", "31-08", "07-09", "21-09", "28-09",
          "05-10", "19-10", "26-10", "02-11", "09-11", "16-11", "23-11"]

# (clase donde se entrega, rótulo, detalle)
HITOS = [
    (5, "Sprint 1", "la pregunta"),
    (8, "Sprint 2", "los datos"),
    (11, "Sprint 3", "los gráficos"),
    (15, "Final", "la plataforma"),
]

# (primera clase, última clase, nombre, lo que queda en sus manos)
FASES = [
    (2, 7, "Datos", ["read.csv() · count()",
                     "filter() · select() · mutate()",
                     "class() · as.numeric()",
                     "group_by() · summarise() · n()"]),
    (8, 10, "Gráficos", ["ggplot() · aes() · geom_*()",
                         "el geom según la tarea",
                         "hoy: color = · facet_wrap()",
                         "y un titular que lo cuente"]),
    (11, 15, "Plataforma", ["estructura y publicación",
                            "prueba con un usuario",
                            "comunicación oral",
                            "demo day"]),
]

X0, X1 = 0.075, 0.935
Y_LINEA = 0.60


def x_de(clase):
    return X0 + (clase - 1) * (X1 - X0) / 14


def main():
    fig = plt.figure(figsize=(12.8, 7.2))
    ax = fig.add_axes((0, 0, 1, 1))
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")

    fig.text(0.055, 0.885, "Dónde estamos: clase 10 de 15", fontsize=31,
             fontweight="bold", color=INK, va="bottom")
    fig.text(0.055, 0.845, "Ya tienen los datos y el gráfico. La próxima semana "
             "presentan el Sprint 3.", fontsize=15, color=MUTED, va="bottom")

    # Fases, como bandas sobre la línea
    for ini, fin, nombre, _ in FASES:
        activa = ini <= HOY <= fin
        xa, xb = x_de(ini) - 0.022, x_de(fin) + 0.022
        ax.plot([xa, xb], [0.735, 0.735], color=ROSE if activa else LINE,
                lw=4, solid_capstyle="round")
        ax.text((xa + xb) / 2, 0.755, nombre, ha="center", va="bottom",
                fontsize=15, fontweight="bold", color=INK if activa else MUTED)

    # La línea y las quince clases
    ax.plot([x_de(1), x_de(15)], [Y_LINEA, Y_LINEA], color=LINE, lw=2, zorder=1)
    ax.plot([x_de(1), x_de(HOY)], [Y_LINEA, Y_LINEA], color=MUTED, lw=2, zorder=1)
    for c in range(1, 16):
        x = x_de(c)
        if c == HOY:
            ax.scatter([x], [Y_LINEA], s=900, color=ROSE, zorder=3)
            ax.text(x, Y_LINEA, str(c), ha="center", va="center", fontsize=15,
                    fontweight="bold", color="white", zorder=4)
            ax.text(x, Y_LINEA + 0.065, "HOY", ha="center", va="bottom",
                    fontsize=13, fontweight="bold", color=ROSE)
        elif c < HOY:
            ax.scatter([x], [Y_LINEA], s=420, color=MUTED, zorder=3)
            ax.text(x, Y_LINEA, str(c), ha="center", va="center", fontsize=11,
                    color="white", zorder=4)
        else:
            ax.scatter([x], [Y_LINEA], s=420, color=PAPER, edgecolors=MUTED,
                       linewidths=1.5, zorder=3)
            ax.text(x, Y_LINEA, str(c), ha="center", va="center", fontsize=11,
                    color=MUTED, zorder=4)
        ax.text(x, Y_LINEA - 0.055, FECHAS[c - 1], ha="center", va="top",
                fontsize=9.5, color=ROSE if c == HOY else MUTED)

    # Hitos de entrega
    for c, rotulo, detalle in HITOS:
        x = x_de(c)
        proximo = c == HOY + 1
        color = ROSE if proximo else (MUTED if c < HOY else INK)
        ax.plot([x, x], [Y_LINEA - 0.095, Y_LINEA - 0.125], color=color, lw=1.5)
        ax.text(x, Y_LINEA - 0.135, rotulo, ha="center", va="top", fontsize=12.5,
                fontweight="bold", color=color)
        ax.text(x, Y_LINEA - 0.175, detalle, ha="center", va="top", fontsize=11,
                color=color)
        if proximo:
            ax.text(x, Y_LINEA - 0.21, "con presentación", ha="center", va="top",
                    fontsize=11, fontweight="bold", color=ROSE)

    # Lo que queda en sus manos en cada fase
    anchos = 0.27
    for i, (ini, fin, nombre, items) in enumerate(FASES):
        activa = ini <= HOY <= fin
        xl = 0.055 + i * (anchos + 0.035)
        yb, h = 0.07, 0.205
        ax.add_patch(FancyBboxPatch((xl, yb), anchos, h,
                                    boxstyle="round,pad=0,rounding_size=0.012",
                                    facecolor="white" if activa else PAPER,
                                    edgecolor=ROSE if activa else LINE, lw=1.5))
        for j, item in enumerate(items):
            es_hoy = item.startswith("hoy") or item.startswith("y un titular")
            ax.text(xl + 0.018, yb + h - 0.035 - j * 0.044, item, ha="left",
                    va="center", fontsize=12.5,
                    fontweight="bold" if es_hoy else "normal",
                    color=ROSE if es_hoy else (INK if ini <= HOY else MUTED))

    path = os.path.join(HERE, "hoja_de_ruta_clase10.png")
    fig.savefig(path)
    plt.close(fig)
    print("  escrito:", path)


if __name__ == "__main__":
    main()
