"""
Figuras de la clase 4 de Descripción y Visualización de Datos (UAI 2026):
"¿La IA nos está haciendo peores?".

Cinco gráficos que se insertan en el deck de Google Slides. El estilo replica
el del template del curso: fondo hueso, texto gris oscuro, acento rosa GobLab,
sin cajas ni rejillas de más.

Dos decisiones que conviene no deshacer:

1. **Lienzo fijo de 1920x1080.** Los ejes se posicionan a mano en coordenadas
   de figura y `bbox_inches` queda en su valor por defecto. Con `bbox="tight"`
   el PNG sale recortado al contenido, cada figura queda con una razón de
   aspecto distinta, y Google Slides la deforma al insertarla en una caja 16:9.

2. **Ninguna magnitud inventada.** Toda cifra que aparece acá está en un paper
   publicado. Donde el paper no reporta un número por subgrupo (por ejemplo, el
   tamaño de la pérdida dentro de cada mitad de la muestra china), el gráfico
   muestra participaciones y lo dice.

Fuentes:
  - Otis, Clarke, Delecourt, Holtz y Koning (Management Science, 2026),
    "The Uneven Impact of Generative AI on Entrepreneurial Performance:
    Evidence from a Field Experiment in Kenya".
  - Strömberg, Lei y Wu (CEPR DP21577, 2026), "The Generative AI Learning
    Penalty: Evidence from Chinese Secondary Education".
  - Bastani, Bastani, Sungu, Ge, Kabakcı y Mariman (PNAS, 2025), "Generative AI
    without guardrails can harm learning: Evidence from high school mathematics".

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

MINUS = "−"   # signo menos tipográfico, no un guion

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
    "axes.facecolor": PAPER,
    "savefig.facecolor": PAPER,
    "text.color": INK,
    "xtick.color": MUTED,
    "ytick.color": INK,
    "savefig.dpi": 150,          # 12.8 x 7.2 pulgadas -> 1920 x 1080
})


def canvas(title, subtitle, source, rect=(0.055, 0.16, 0.90, 0.60)):
    """Lienzo 16:9 con título, bajada y fuente en posiciones fijas."""
    fig = plt.figure(figsize=(12.8, 7.2))
    fig.text(0.055, 0.885, title, fontsize=31, fontweight="bold", color=INK, va="bottom")
    fig.text(0.055, 0.845, subtitle, fontsize=15, color=MUTED, va="bottom")
    fig.text(0.055, 0.055, source, fontsize=12, color=MUTED, va="center")
    ax = fig.add_axes(rect)
    ax.set_facecolor(PAPER)
    for side in ("top", "right", "left", "bottom"):
        ax.spines[side].set_visible(False)
    ax.tick_params(length=0)
    return fig, ax


def _save(fig, name):
    path = os.path.join(HERE, name)
    fig.savefig(path)
    plt.close(fig)
    print("  escrito:", name)


def _pct(v):
    return ("+" if v > 0 else MINUS) + f"{abs(v)}%"


# ── 1. Kenia: la brecha que se abre ────────────────────────────
def kenia_brecha():
    fig, ax = canvas(
        "Kenia: la misma herramienta, efectos opuestos",
        "Efecto del acceso a un asistente GPT-4 por WhatsApp sobre las utilidades del negocio "
        "· 640 emprendedores · 2,5 meses",
        "Otis, Clarke, Delecourt, Holtz y Koning (Management Science, 2026)",
        rect=(0.20, 0.16, 0.72, 0.62))

    labels = ["Ya les iba mal\nantes del experimento",
              "Promedio\nde los 640",
              "Ya les iba bien\nantes del experimento"]
    values = [-8, 0, 15]
    colors = [BAD, MUTED, GOOD]

    bars = ax.barh(labels, values, height=0.6, color=colors)
    ax.axvline(0, color=INK, lw=1.6)

    for bar, v, c in zip(bars, values, colors):
        y = bar.get_y() + bar.get_height() / 2
        ax.text(v + (1.0 if v >= 0 else -1.0), y, _pct(v) if v else "0%",
                va="center", ha="left" if v >= 0 else "right",
                fontsize=27, fontweight="bold", color=c)

    ax.text(4.4, 1, "sin efecto en promedio", fontsize=15, color=MUTED,
            style="italic", va="center")

    ax.set_xlim(-16, 24)
    ax.set_xticks([])
    ax.tick_params(axis="y", labelsize=15)
    _save(fig, "kenia_brecha.png")


# ── 2. China: lo que se ve y lo que se pierde ──────────────────
def china_tres():
    fig, ax = canvas(
        "China: las tareas mejoran, el aprendizaje no",
        "Efecto de adoptar IA generativa, a seis meses · 26.811 estudiantes de 7° a 12° "
        "· 30 meses de panel",
        "Strömberg, Lei y Wu (CEPR DP21577, 2026). Diferencias en diferencias con adopción "
        "escalonada.",
        rect=(0.22, 0.16, 0.70, 0.62))

    labels = ["Prueba mensual\nde libro cerrado",
              "Tiempo que tardan\nen hacer la tarea",
              "Nota de las tareas"]
    values = [-20, -30, 18]
    colors = [BAD, ROSE, ROSE]

    bars = ax.barh(labels, values, height=0.6, color=colors)
    ax.axvline(0, color=INK, lw=1.6)

    for bar, v, c in zip(bars, values, colors):
        y = bar.get_y() + bar.get_height() / 2
        ax.text(v + (1.5 if v >= 0 else -1.5), y, _pct(v),
                va="center", ha="left" if v >= 0 else "right",
                fontsize=27, fontweight="bold", color=c)

    ax.text(3, 1.5, "lo que ve\nel profesor", fontsize=15, color=ROSE,
            style="italic", ha="left", va="center")
    ax.text(3, 0.0, "lo que\nse pierde", fontsize=15, color=BAD,
            style="italic", ha="left", va="center")

    ax.set_xlim(-46, 32)
    ax.set_xticks([])
    ax.tick_params(axis="y", labelsize=15)
    _save(fig, "china_tres.png")


# ── 3. China: la pendiente que se separa ───────────────────────
def china_pendiente():
    fig, ax = canvas(
        "La tarea sube justo mientras la prueba baja",
        "Misma persona, mismos meses, dos medidas de desempeño",
        "Strömberg, Lei y Wu (CEPR DP21577, 2026). En los exámenes de admisión la caída llega "
        "a 18% y 24%, y aparece recién a los dos años.",
        rect=(0.15, 0.15, 0.50, 0.62))

    for name, end, color in [("Nota de las tareas", 18, GOOD),
                             ("Prueba de libro cerrado", -20, BAD)]:
        ax.plot([0, 1], [0, end], color=color, lw=4.5, solid_capstyle="round",
                marker="o", markersize=12, markerfacecolor=color,
                markeredgecolor=PAPER, markeredgewidth=2.5)
        ax.text(1.06, end, f"{_pct(end)}   {name}", fontsize=17, color=color,
                va="center", fontweight="bold")

    ax.axhline(0, color=LINE, lw=1.6, zorder=0)
    ax.text(-0.05, 0, "antes de\nadoptar IA", fontsize=15, color=MUTED,
            ha="right", va="center")

    ax.annotate("", xy=(1.0, 18), xytext=(1.0, -20),
                arrowprops=dict(arrowstyle="<->", color=MUTED, lw=1.4))
    ax.text(0.975, -1, "38 puntos\nporcentuales\nde distancia", fontsize=14,
            color=MUTED, ha="right", va="center", style="italic")

    ax.set_xlim(-0.32, 1.10)
    ax.set_ylim(-27, 24)
    ax.set_xticks([0, 1])
    ax.set_xticklabels(["línea base", "seis meses después"], fontsize=15, color=MUTED)
    ax.tick_params(axis="x", length=0, pad=14)
    ax.set_yticks([])
    _save(fig, "china_pendiente.png")


# ── 4. Quién paga la cuenta: el patrón de tercerización ────────
def china_outsourcing():
    fig, ax = canvas(
        "No es la IA: es cómo se usa",
        "Cómo se reparten los usuarios de IA de la muestra china",
        "Strömberg, Lei y Wu (CEPR DP21577, 2026)",
        rect=(0.055, 0.22, 0.90, 0.50))

    ax.barh([0], [80], height=0.42, color=BAD)
    ax.barh([0], [20], left=[80], height=0.42, color=GOOD)

    ax.text(40, 0, "80%", ha="center", va="center", fontsize=44,
            fontweight="bold", color=PAPER)
    ax.text(90, 0, "20%", ha="center", va="center", fontsize=30,
            fontweight="bold", color=PAPER)

    ax.text(40, 0.30, "acá se concentra toda la pérdida", ha="center", va="bottom",
            fontsize=16, color=MUTED, style="italic")
    ax.text(90, 0.30, "pérdida pequeña", ha="center", va="bottom",
            fontsize=16, color=MUTED, style="italic")

    ax.text(40, -0.30, "Terceriza la tarea:\npuntaje altísimo en tiempo brevísimo",
            ha="center", va="top", fontsize=17, color=BAD)
    ax.text(90, -0.30, "Mantiene el tiempo\nde estudio", ha="center", va="top",
            fontsize=17, color=GOOD)

    ax.set_xlim(0, 100)
    ax.set_ylim(-1.0, 0.75)
    ax.set_xticks([])
    ax.set_yticks([])
    _save(fig, "china_outsourcing.png")


# ── 5. Turquía: el mismo modelo, con y sin barandas ────────────
def turquia_barandas():
    fig, ax = canvas(
        "El daño no viene del modelo: viene del diseño",
        "Efecto sobre matemáticas de educación media · cerca de 1.000 estudiantes · Turquía",
        "Bastani, Bastani, Sungu, Ge, Kabakcı y Mariman (PNAS, 2025)",
        rect=(0.26, 0.17, 0.66, 0.60))

    grupos = ["GPT-4 sin barandas\n(responde directo)",
              "GPT-4 con barandas\n(tutor que no da la respuesta)"]
    practica = [48, 127]
    prueba = [-17, 0]
    y = [1.0, 0.0]
    h = 0.30

    ax.barh([v + h * 0.62 for v in y], practica, height=h, color=ROSE,
            label="Mientras practican, con la IA al lado")
    ax.barh([v - h * 0.62 for v in y], prueba, height=h, color=BAD,
            label="En la prueba, sin la IA")
    ax.axvline(0, color=INK, lw=1.6)

    for yy, v in zip([y[0] + h * 0.62, y[1] + h * 0.62], practica):
        ax.text(v + 4, yy, _pct(v), va="center", fontsize=24,
                fontweight="bold", color=ROSE)
    for yy, v in zip([y[0] - h * 0.62, y[1] - h * 0.62], prueba):
        if v:
            ax.text(v - 4, yy, _pct(v), va="center", ha="right", fontsize=24,
                    fontweight="bold", color=BAD)
        else:
            ax.text(5, yy, "sin daño", va="center", ha="left", fontsize=24,
                    fontweight="bold", color=GOOD)

    ax.set_yticks(y)
    ax.set_yticklabels(grupos, fontsize=15)
    ax.set_xlim(-42, 160)
    ax.set_ylim(-0.55, 1.55)
    ax.set_xticks([])
    ax.legend(loc="lower right", frameon=False, fontsize=14, labelcolor=INK,
              bbox_to_anchor=(1.02, -0.16))
    _save(fig, "turquia_barandas.png")


if __name__ == "__main__":
    print("Generando figuras en", HERE)
    kenia_brecha()
    china_tres()
    china_pendiente()
    china_outsourcing()
    turquia_barandas()
    print("Listo.")
