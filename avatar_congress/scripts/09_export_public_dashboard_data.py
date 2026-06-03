"""
09 · Preparar/auditar los datos públicos del dashboard.

El análisis agregado (data_runtime/analysis_public_aggregated.json, escrito
por 08) es lo único que puede exponerse públicamente. Este script:
  - verifica que exista,
  - audita que NO contenga respuestas individuales (solo agregados + llave→score),
  - imprime un resumen.

Con --static copia el dashboard + el JSON agregado a una carpeta exportable
(exports_private/public_dashboard/, ignorada por Git) por si quieres subirlo
a un hosting estático en modo PUBLIC.

Uso:
  python avatar_congress/scripts/09_export_public_dashboard_data.py [--static]
"""

import argparse
import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common as C

# Claves permitidas en el JSON público (todo lo demás se considera sospechoso)
ALLOWED_TOP = {
    "n_students_matched", "n_questions_scored", "overall", "per_question",
    "most_represented_question", "least_represented_question", "scatter_likert",
    "aggregate_r2_likert", "forced_support", "aggregate_r2_forced", "biases",
    "confidence_vs_accuracy", "top_representative_keys", "least_representative_keys",
    "updated_at",
}


def audit(agg):
    """Return list of privacy warnings (empty = safe)."""
    warns = []
    extra = set(agg.keys()) - ALLOWED_TOP
    if extra:
        warns.append(f"claves inesperadas a nivel raíz: {sorted(extra)}")
    # per_question no debe contener respuestas individuales
    for pq in agg.get("per_question", []):
        bad = set(pq.keys()) - {
            "question_id", "theme", "text", "type", "match_rate",
            "directional_agreement", "n", "human_mean", "avatar_mean", "mae",
            "human_support_A", "avatar_support_A"}
        if bad:
            warns.append(f"{pq.get('question_id')}: campos inesperados {sorted(bad)}")
    # las listas de llaves solo deben tener key + score
    for lst in ("top_representative_keys", "least_representative_keys"):
        for e in agg.get(lst, []):
            if set(e.keys()) - {"key", "score"}:
                warns.append(f"{lst}: una entrada tiene campos además de key/score")
                break
    return warns


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--static", action="store_true", help="copiar dashboard + datos a exports_private/")
    args = ap.parse_args()

    C.ensure_dirs()
    agg = C.read_json(C.ANALYSIS_PUBLIC)
    if not agg:
        C.die(f"No existe {C.ANALYSIS_PUBLIC}. Corre 08_analyze_results.py primero.")

    warns = audit(agg)
    print("\n=== Auditoría de privacidad (JSON público) ===")
    if warns:
        for w in warns:
            print(f"  ⚠ {w}")
        print("\n  NO exportes este archivo hasta resolver lo anterior.")
    else:
        print("  ✓ Solo agregados y llave→score. Seguro para exponer.")

    n = agg.get("n_students_matched", 0)
    ov = agg.get("overall", {})
    print(f"\n  estudiantes con match: {n}")
    if n:
        print(f"  acuerdo direccional promedio: {ov.get('mean_directional_agreement')}")
        print(f"  error Likert promedio (MAE): {ov.get('mean_likert_mae')}")
        print(f"  R² agregado (Likert): {agg.get('aggregate_r2_likert')}")

    if args.static and not warns:
        out = C.EXPORTS_PRIVATE / "public_dashboard"
        out.mkdir(parents=True, exist_ok=True)
        for f in ("index.html", "styles.css", "app.js"):
            shutil.copy(C.DASHBOARD_DIR / f, out / f)
        C.write_json(out / "analysis_public_aggregated.json", agg)
        print(f"\n  bundle estático en {out} (en .gitignore; súbelo manualmente si quieres).")


if __name__ == "__main__":
    main()
