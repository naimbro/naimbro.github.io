"""
Figuras de la clase 4 de Descripción y Visualización de Datos (UAI 2026):
"¿La IA nos está haciendo peores?".

Cinco gráficos que se insertan en el deck de Google Slides. El estilo replica
el del template del curso: fondo hueso, texto gris oscuro, acento rosa GobLab,
sin cajas ni rejillas de más.

Toda cifra que aparece acá está en un paper publicado. Donde el paper no da un
número (por ejemplo, la magnitud de la pérdida dentro de cada subgrupo chino),
el gráfico muestra participaciones, no magnitudes inventadas.

Fuentes:
  - Otis, Clarke, Delecourt, Holtz y Koning (Management Science, 2026),
    "The Uneven Impact of Generative AI on Entrepreneurial Performance:
    Evidence from a Field Experiment in Kenya".
  - Strömberg, Lei y Wu (CEPR DP21577, 2026), "The Generative AI Learning
    Penalty: Evidence from Chinese Secondary Education".
  - Bastani et al. (PNAS, 2025), "Generative AI without guardrails can harm
    learning: Evidence from high school mathematics".

    python generar_figuras.py            # escribe los .png en esta carpeta
"""

import os

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager

HERE = os.path.dirname(os.path.abspath(__file__))

# ── Paleta del curso ───────────────────────────────────────────
PAPER = "#F9F7F4"
INK = "#2C2C2C"
ROSE = "#C4878C"
MUTED = "#8C8681"
GOOD = "#6E8F7D"
BAD = "#B4565E"
LINE = "#DAD5CE"

_installed = {f.name for f in font_manager.fontManager.ttflist}
for candidate in ("Libre Franklin", "Segoe UI", "Helvetica Neue", "Arial"):
    if candidate in _installed:
        FONT = candidate
        break
else:
    FONT = "DejaVu Sans"

plt.rcParams.update({
    "font.family": FONT,
    "figure.facecolor": PAPER,
    "axes.facecolor": PAPER,
    "savefig.facecolor": PAPER,
    "text.color": INK,
    "axes.labelcolor": INK,
    "xtick.color": MUTED,
    "ytick.color": INK,
    "axes.edgecolor": LINE,
    "savefig.dpi": 200,
    "savefig.bbox": "tight",
    "savefig.pad_inches": 0.28,
})


def _frame(ax):
    """Deja solo lo indispensable: sin marco, sin ticks, con línea de cero."""
    for side in ("top", "right", "left", "bottom"):
        ax.spines[side].set_visible(False)
    ax.tick_params(length=0)
    ax.set_xticks([])


def _titles(ax, title, subtitle):
    ax.set_title(title, fontsize=19, fontweight="bold", loc="left", pad=26, color=INK)
    ax.text(0, 1.045, subtitle, transform=ax.transAxes, fontsize=11.5,
            color=MUTED, ha="left", va="bottom")


def _source(fig, text):
    fig.text(0.01, -0.02, text, fontsize=9, color=MUTED, ha="left", va="top")


def _save(fig, name):
    path = os.path.join(HERE, name)
    fig.savefig(path)
    plt.close(fig)
    print("  escrito:", name)


# ── 1. Kenia: la brecha que se abre ────────────────────────────
def kenia_brecha():
    fig, ax = plt.subplots(figsize=(10, 4.4))
    labels = ["Ya les iba mal\nantes del experimento",
              "Promedio\nde los 640",
              "Ya les iba bien\nantes del experimento"]
    values = [-8, 0, 15]
    colors = [BAD, MUTED, GOOD]

    bars = ax.barh(labels, values, height=0.62, color=colors)
    ax.axvline(0, color=INK, lw=1.4)

    for bar, v in zip(bars, values):
        off = 1.1 if v >= 0 else -1.1
        ax.text(v + off, bar.get_y() + bar.get_height() / 2,
                (("+" if v > 0 else "−") + f"{abs(v)}%") if v else "0%",
                va="center", ha="left" if v >= 0 else "right",
                fontsize=20, fontweight="bold",
                color=GOOD if v > 0 else (BAD if v < 0 else MUTED))

    ax.text(4.6, 1, "sin efecto en promedio", fontsize=11.5, color=MUTED,
            style="italic", va="center")

    ax.set_xlim(-16, 24)
    ax.tick_params(axis="y", labelsize=12)
    _frame(ax)
    _titles(ax, "Kenia: la misma herramienta, efectos opuestos",
            "Efecto del acceso a un asistente GPT-4 por WhatsApp sobre las utilidades del negocio · "
            "640 emprendedores · 2,5 meses")
    _source(fig, "Otis, Clarke, Delecourt, Holtz y Koning (Management Science, 2026)")
    _save(fig, "kenia_brecha.png")


# ── 2. China: lo que se ve y lo que se pierde ──────────────────
def china_tres():
    fig, ax = plt.subplots(figsize=(10, 4.6))
    labels = ["Prueba mensual\nde libro cerrado",
              "Tiempo que tardan\nen hacer la tarea",
              "Nota de las tareas"]
    values = [-20, -30, 18]
    colors = [BAD, ROSE, ROSE]

    bars = ax.barh(labels, values, height=0.62, color=colors)
    ax.axvline(0, color=INK, lw=1.4)

    for bar, v, c in zip(bars, values, colors):
        off = 1.6 if v >= 0 else -1.6
        ax.text(v + off, bar.get_y() + bar.get_height() / 2,
                ("+" if v > 0 else "−") + f"{abs(v)}%",
                va="center", ha="left" if v >= 0 else "right",
                fontsize=21, fontweight="bold", color=c)

    ax.text(-45, 1.52, "lo que ve\nel profesor", fontsize=11.5, color=ROSE,
            style="italic", ha="left", va="center")
    ax.text(-45, 0.0, "lo que\nse pierde", fontsize=11.5, color=BAD,
            style="italic", ha="left", va="center")

    ax.set_xlim(-46, 32)
    ax.tick_params(axis="y", labelsize=12.5)
    _frame(ax)
    _titles(ax, "China: las tareas mejoran, el aprendizaje no",
            "Efecto de adoptar IA generativa, a seis meses · 26.811 estudiantes de 7° a 12° · "
            "30 meses de panel")
    _source(fig, "Strömberg, Lei y Wu (CEPR DP21577, 2026). Diseño de diferencias en diferencias "
                 "con adopción escalonada.")
    _save(fig, "china_tres.png")


# ── 3. China: la pendiente que se separa ───────────────────────
def china_pendiente():
    fig, ax = plt.subplots(figsize=(10, 5.2))

    series = [("Nota de las tareas", 18, GOOD),
              ("Prueba de libro cerrado", -20, BAD)]
    for name, end, color in series:
        ax.plot([0, 1], [0, end], color=color, lw=3.4, solid_capstyle="round",
                marker="o", markersize=9, markerfacecolor=color, markeredgecolor=PAPER,
                markeredgewidth=2)
        etiqueta = ("+" if end > 0 else "−") + f"{abs(end)}%"
        ax.text(1.04, end, f"{etiqueta}   {name}",
                fontsize=13.5, color=color, va="center", fontweight="bold")

    ax.axhline(0, color=LINE, lw=1.4, zorder=0)
    ax.text(-0.03, 0, "antes de\nadoptar IA", fontsize=11, color=MUTED,
            ha="right", va="center")

    ax.annotate("", xy=(1.0, 18), xytext=(1.0, -20),
                arrowprops=dict(arrowstyle="<->", color=MUTED, lw=1.2))
    ax.text(0.985, -1, "38 puntos\nporcentuales\nde distancia", fontsize=10.5,
            color=MUTED, ha="right", va="center", style="italic")

    ax.set_xlim(-0.30, 1.42)
    ax.set_ylim(-30, 28)
    ax.set_xticks([0, 1])
    ax.set_xticklabels(["línea base", "seis meses después"], fontsize=11.5, color=MUTED)
    ax.tick_params(axis="x", length=0, pad=10)
    ax.set_yticks([])
    for side in ("top", "right", "left", "bottom"):
        ax.spines[side].set_visible(False)
    _titles(ax, "La tarea sube justo mientras la prueba baja",
            "Misma persona, mismos meses, dos medidas de desempeño")
    _source(fig, "Strömberg, Lei y Wu (CEPR DP21577, 2026). En los exámenes de admisión la caída "
                 "llega a 18% y 24%, y aparece recién a los dos años.")
    _save(fig, "china_pendiente.png")


# ── 4. Quién paga la cuenta: el patrón de tercerización ────────
def china_outsourcing():
    fig, ax = plt.subplots(figsize=(10, 3.4))

    ax.barh([0], [80], height=0.55, color=BAD)
    ax.barh([0], [20], left=[80], height=0.55, color=GOOD)

    ax.text(40, 0, "80%", ha="center", va="center", fontsize=26,
            fontweight="bold", color=PAPER)
    ax.text(90, 0, "20%", ha="center", va="center", fontsize=20,
            fontweight="bold", color=PAPER)

    ax.text(40, -0.52, "Terceriza la tarea: puntaje altísimo\nen tiempo brevísimo",
            ha="center", va="top", fontsize=12.5, color=BAD)
    ax.text(90, -0.52, "Mantiene el tiempo\nde estudio", ha="center", va="top",
            fontsize=12.5, color=GOOD)

    ax.text(40, 0.5, "acá se concentra toda la pérdida", ha="center", va="bottom",
            fontsize=11.5, color=MUTED, style="italic")
    ax.text(90, 0.5, "pérdida pequeña", ha="center", va="bottom",
            fontsize=11.5, color=MUTED, style="italic")

    ax.set_xlim(0, 100)
    ax.set_ylim(-1.25, 1.0)
    ax.set_yticks([])
    _frame(ax)
    _titles(ax, "No es la IA: es cómo se usa",
            "Cómo se reparten los usuarios de IA de la muestra china")
    _source(fig, "Strömberg, Lei y Wu (CEPR DP21577, 2026)")
    _save(fig, "china_outsourcing.png")


# ── 5. Turquía: el mismo modelo, con y sin barandas ────────────
def turquia_barandas():
    fig, ax = plt.subplots(figsize=(10, 5.2))

    grupos = ["GPT-4 sin barandas\n(responde directo)", "GPT-4 con barandas\n(tutor que no da la respuesta)"]
    practica = [48, 127]
    prueba = [-17, 0]

    y = [0.9, 0]
    h = 0.32
    ax.barh([v + h / 1.7 for v in y], practica, height=h, color=ROSE,
            label="Mientras practican, con la IA al lado")
    ax.barh([v - h / 1.7 for v in y], prueba, height=h, color=BAD,
            label="En la prueba, sin la IA")

    ax.axvline(0, color=INK, lw=1.4)

    for yy, v in zip([y[0] + h / 1.7, y[1] + h / 1.7], practica):
        ax.text(v + 3, yy, f"+{v}%", va="center", fontsize=17,
                fontweight="bold", color=ROSE)
    for yy, v in zip([y[0] - h / 1.7, y[1] - h / 1.7], prueba):
        txt = ("−" + f"{abs(v)}%") if v else "sin daño"
        ax.text(v - 3 if v else 4, yy, txt, va="center",
                ha="right" if v else "left", fontsize=17,
                fontweight="bold", color=BAD if v else GOOD)

    ax.set_yticks(y)
    ax.set_yticklabels(grupos, fontsize=12)
    ax.set_xlim(-40, 155)
    _frame(ax)
    ax.legend(loc="lower right", frameon=False, fontsize=11.5, labelcolor=INK)
    _titles(ax, "El daño no viene del modelo: viene del diseño",
            "Efecto sobre matemáticas de educación media · ~1.000 estudiantes · Turquía")
    _source(fig, "Bastani, Bastani, Sungu, Ge, Kabakcı y Mariman (PNAS, 2025)")
    _save(fig, "turquia_barandas.png")


if __name__ == "__main__":
    print("Generando figuras en", HERE)
    kenia_brecha()
    china_tres()
    china_pendiente()
    china_outsourcing()
    turquia_barandas()
    print("Listo.")
