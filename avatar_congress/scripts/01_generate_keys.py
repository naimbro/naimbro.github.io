"""
01 · Generar llaves anónimas (seudónimas) para el Congreso de avatares.

Genera llaves memorables tipo CONDOR-47 (palabra + número de 2 dígitos).
No contienen nombres de estudiantes y no son secuenciales.

Salidas:
  data_private/keys_master.csv         (key, assigned, notes)
  exports_private/keys_for_class.txt   (lista imprimible para repartir)

Uso:
  python avatar_congress/scripts/01_generate_keys.py [--n 30] [--seed 7] [--force]
"""

import argparse
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common as C

# Palabras memorables (fauna/naturaleza, neutras). En MAYÚSCULAS, sin tildes
# problemáticas salvo Ñ/acentos que la regex de llave permite.
WORDS = [
    "CONDOR", "LIMON", "NUBE", "PUMA", "RIO", "ANDES", "ZORRO", "CACTUS",
    "VOLCAN", "PALTA", "COBRE", "QUELTEHUE", "COPIHUE", "LLAMA", "PUDU",
    "DELFIN", "PINGUINO", "ROBLE", "CANELO", "MAITEN", "JOTE", "TIUQUE",
    "LUNA", "BRISA", "CORAL", "AMBAR", "JADE", "TRUENO", "NIEVE", "DUNA",
    "FARO", "BOSQUE", "PAMPA", "GEISER", "SALAR", "QUILA", "BOLDO", "LITRE",
    "PELICANO", "CHINCHILLA", "GUANACO", "VICUNA", "HUEMUL", "DEGU",
]


def generate_keys(n, seed=None):
    rng = random.Random(seed)
    pairs = set()
    keys = []
    words = WORDS[:]
    rng.shuffle(words)
    attempts = 0
    while len(keys) < n and attempts < n * 200:
        attempts += 1
        word = rng.choice(words)
        num = rng.randint(10, 99)  # 2 dígitos, no empieza en 0
        pair = (word, num)
        if pair in pairs:
            continue
        pairs.add(pair)
        key = f"{word}-{num}"
        if not C.valid_key(key):
            continue
        keys.append(key)
    return keys


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--n", type=int, default=None, help="número de llaves (default: config n_keys o 30)")
    ap.add_argument("--seed", type=int, default=None, help="semilla para reproducibilidad")
    ap.add_argument("--force", action="store_true", help="sobrescribir keys_master.csv existente")
    args = ap.parse_args()

    C.ensure_dirs()
    cfg = C.load_config()
    n = args.n or cfg.get("class", {}).get("n_keys", 30)

    if C.KEYS_MASTER.exists() and not args.force:
        C.die(f"Ya existe {C.KEYS_MASTER}. Usa --force para regenerar "
              f"(¡cuidado! perderías la asignación actual).")

    keys = generate_keys(n, seed=args.seed)
    if len(keys) < n:
        C.log(f"AVISO: solo se pudieron generar {len(keys)} llaves únicas (pedidas: {n}). "
              f"Agrega más palabras a WORDS.")

    rows = [{"key": k, "assigned": "false", "notes": ""} for k in keys]
    C.write_csv(C.KEYS_MASTER, rows, ["key", "assigned", "notes"])
    C.log(f"Escritas {len(keys)} llaves en {C.KEYS_MASTER}")

    # Versión imprimible
    C.EXPORTS_PRIVATE.mkdir(parents=True, exist_ok=True)
    lines = [
        "CONGRESO DE AVATARES — Llaves anónimas para repartir",
        "=" * 52,
        "Cada estudiante recibe UNA llave. Debe usarla EXACTAMENTE igual",
        "en la ficha de entrenamiento y en la encuesta humana.",
        "",
    ]
    for i, k in enumerate(keys, 1):
        lines.append(f"{i:>2}. {k}")
    lines += ["", f"Total: {len(keys)} llaves."]
    C.KEYS_FOR_CLASS.write_text("\n".join(lines), encoding="utf-8")
    C.log(f"Lista imprimible en {C.KEYS_FOR_CLASS}")

    print("\nMuestra de llaves:")
    for k in keys[:6]:
        print(f"  {k}")
    print("  ...")


if __name__ == "__main__":
    main()
