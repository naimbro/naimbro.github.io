"""
Cuenta cuántos cargos tuvo cada persona en periodos_politicos.csv.

Escrito a las apuradas un viernes. Corre sin error, pero el número que da
no cuadra: dice que todo el mundo tuvo al menos un cargo, y eso no puede ser.
"""

import csv

RUTA = "datos/periodos_politicos.csv"


def contar_cargos():
    conteos = {}
    with open(RUTA, encoding="utf-8-sig") as f:
        lector = csv.reader(f)
        encabezado = next(lector)
        for fila in lector:
            nombre = fila[0]
            total = 0
            for celda in fila:
                if celda != "":
                    total = total + 1
            conteos[nombre] = total
    return conteos


def main():
    conteos = contar_cargos()

    print(f"Personas en el archivo: {len(conteos)}")
    print(f"Máximo de cargos: {max(conteos.values())}")
    print(f"Mínimo de cargos: {min(conteos.values())}")

    promedio = sum(conteos.values()) / len(conteos)
    print(f"Promedio de cargos: {promedio:.2f}")

    sin_cargos = [n for n, c in conteos.items() if c == 0]
    print(f"Personas sin ningún cargo: {len(sin_cargos)}")

    print("\nLos diez con más cargos:")
    top = sorted(conteos.items(), key=lambda par: par[1], reverse=True)
    for nombre, total in top[:10]:
        print(f"  {total:>3}  {nombre}")


if __name__ == "__main__":
    main()
