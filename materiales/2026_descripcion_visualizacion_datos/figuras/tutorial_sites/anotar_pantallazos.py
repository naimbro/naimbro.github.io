"""
Marca en rosa, sobre cada pantallazo del tutorial de Google Sites, dónde hay que
hacer clic. Lee NN_*.jpg de esta carpeta y escribe anotadas/NN.png, que es lo
que sube create_slides_dvd_tutorial_sites.py.

Las cajas están en píxeles del pantallazo original (800 px de ancho).

    python anotar_pantallazos.py
"""

import glob
import os

from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "anotadas")
ROSE = (196, 135, 140)
BORDER = (217, 212, 206)
SCALE = 2          # se dibuja al doble para que el trazo salga limpio
PAD = 5

MARCAS = {
    "01": [(415, 170, 653, 206)],
    "02": [(136, 93, 252, 205)],
    "03": [(607, 52, 796, 84), (679, 9, 746, 39)],
    "04": [(159, 107, 441, 379)],
    "05": [(42, 8, 140, 40), (52, 72, 146, 98)],
    "06": [(748, 52, 793, 84)],
    "07": [(619, 369, 781, 532)],
    "08": [(612, 95, 696, 147), (85, 405, 515, 461)],
    "09": [(706, 95, 790, 147), (86, 358, 222, 464)],
    "10": [(86, 358, 514, 610)],
    "11": [(125, 322, 155, 348), (90, 357, 372, 380)],
    "12": [(684, 52, 729, 84), (620, 160, 732, 182), (683, 566, 724, 607)],
    "13": [(116, 122, 684, 190), (605, 526, 684, 553)],
    "14": [(666, 9, 747, 39)],
    "15": [(604, 8, 756, 44)],
    "16": [],
    "17": [(225, 190, 575, 228), (225, 345, 582, 432)],
}

# Datos personales que no van a un deck público: el correo del dueño en 17.
DIFUMINAR = {
    "17": [(256, 285, 352, 300)],
}


def anotar(path):
    paso = os.path.basename(path)[:2]
    im = Image.open(path).convert("RGB")
    for box in DIFUMINAR.get(paso, []):
        region = im.crop(box).filter(ImageFilter.GaussianBlur(6))
        im.paste(region, box[:2])
    im = im.resize((im.width * SCALE, im.height * SCALE), Image.LANCZOS)
    draw = ImageDraw.Draw(im)
    for x0, y0, x1, y1 in MARCAS[paso]:
        draw.rounded_rectangle(
            [(x0 - PAD) * SCALE, (y0 - PAD) * SCALE, (x1 + PAD) * SCALE, (y1 + PAD) * SCALE],
            radius=6 * SCALE, outline=ROSE, width=3 * SCALE)
    draw.rectangle([0, 0, im.width - 1, im.height - 1], outline=BORDER, width=SCALE)
    im.save(os.path.join(OUT, f"{paso}.png"))
    return paso


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    pasos = [anotar(p) for p in sorted(glob.glob(os.path.join(HERE, "[0-9][0-9]_*.jpg")))]
    print(f"{len(pasos)} pantallazos anotados en {OUT}")
