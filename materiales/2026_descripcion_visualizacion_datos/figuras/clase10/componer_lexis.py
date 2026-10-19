"""
Lámina del caso Lexis (clase 10): el pantallazo del gráfico de The Economist
sobre un lienzo 16:9 con título. El link va como texto en el deck, no aquí.

El pantallazo (lexis_economist_captura.png) es material con derechos: está en
.gitignore y no se sube al repo público; sólo vive en el deck.

    python componer_lexis.py      # escribe lexis_economist.png aquí
"""

import os

import matplotlib
matplotlib.use("Agg")
import matplotlib.image as mpimg
import matplotlib.pyplot as plt
from matplotlib import font_manager

HERE = os.path.dirname(os.path.abspath(__file__))

PAPER = "#F9F7F4"
INK = "#2C2C2C"
MUTED = "#8C8681"

_installed = {f.name for f in font_manager.fontManager.ttflist}
FONT = next((c for c in ("Libre Franklin", "Segoe UI", "Arial") if c in _installed),
            "DejaVu Sans")
plt.rcParams.update({"font.family": FONT, "figure.facecolor": PAPER,
                     "savefig.facecolor": PAPER, "savefig.dpi": 150})


def main():
    img = mpimg.imread(os.path.join(HERE, "lexis_economist_captura.png"))
    img = img[:, :480]                      # fuera el cursor del borde derecho
    h, w = img.shape[:2]

    fig = plt.figure(figsize=(12.8, 7.2))
    fig.text(0.055, 0.885, "Caso: el gráfico de Lexis", fontsize=31,
             fontweight="bold", color=INK, va="bottom")
    fig.text(0.055, 0.845, "The Economist, 17 de junio de 2026", fontsize=15,
             color=MUTED, va="bottom")

    alto = 0.66                             # fracción de la altura del lienzo
    ancho = alto * (w / h) * (7.2 / 12.8)
    ax = fig.add_axes(((1 - ancho) / 2, 0.15, ancho, alto))
    ax.imshow(img)
    ax.axis("off")

    path = os.path.join(HERE, "lexis_economist.png")
    fig.savefig(path)
    plt.close(fig)
    print("  escrito:", path)


if __name__ == "__main__":
    main()
