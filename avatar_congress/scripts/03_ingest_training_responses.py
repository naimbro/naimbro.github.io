"""
03 · Ingerir respuestas del Form de ENTRENAMIENTO.

Lee las respuestas vía Forms API, valida llaves, deduplica (se queda con la
más reciente), y guarda data_private/training_responses_raw.csv.

No imprime respuestas sensibles completas.

Uso:
  python avatar_congress/scripts/03_ingest_training_responses.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common as C

# Campos mínimos para construir un avatar razonable
MIN_FIELDS = ["key", "economy", "state_role", "priorities", "avatar_free_text"]


def main():
    C.ensure_dirs()
    cfg = C.load_config()
    form_id = cfg.get("google", {}).get("training_form_id")
    if not form_id:
        C.die("No hay training_form_id en config.local.yaml. Corre 02_create_training_form.py primero.")
    field_map = C.read_json(C.TRAINING_FORM_MAP)
    if not field_map:
        C.die(f"Falta {C.TRAINING_FORM_MAP}. Corre 02_create_training_form.py primero.")

    raw = C.pull_form_responses(cfg, form_id, field_map)
    C.log(f"Respuestas crudas recibidas: {len(raw)}")

    # Validar llaves
    valid_keys = {r["key"] for r in C.read_csv(C.KEYS_MASTER)} if C.KEYS_MASTER.exists() else set()
    bad_format, unknown_key = [], []
    cleaned = []
    for r in raw:
        k = C.normalize_key(r.get("key", ""))
        if not C.valid_key(k):
            bad_format.append(k or "(vacía)")
            continue
        if valid_keys and k not in valid_keys:
            unknown_key.append(k)  # se acepta igual, pero se reporta
        r["key"] = k
        cleaned.append(r)

    # Deduplicar
    deduped, n_dups = C.dedupe_latest(cleaned, "key")

    # Campos faltantes
    field_order = ["key", "_submitted_at"] + [f for f in field_map.values() if f != "key"]
    missing_report = {}
    for r in deduped:
        miss = [f for f in MIN_FIELDS if not str(r.get(f, "")).strip()]
        if miss:
            missing_report[r["key"]] = miss

    rows = [{f: r.get(f, "") for f in field_order} for r in deduped]
    # renombrar _submitted_at -> timestamp para legibilidad
    for r in rows:
        r["timestamp"] = r.pop("_submitted_at", "")
    out_fields = ["key", "timestamp"] + [f for f in field_order if f not in ("key", "_submitted_at")]
    C.write_csv(C.TRAINING_RAW, rows, out_fields)

    n_scored = sum(1 for q in C.load_survey_questions()
                   if q.get("compare_as") in ("ordinal", "nominal"))
    C.update_progress(training_received=len(deduped),
                      totals={"students": cfg.get("class", {}).get("n_students", 23),
                              "questions": n_scored})

    # Reporte (sin datos sensibles)
    print("\n=== Reporte de ingesta (entrenamiento) ===")
    print(f"  respuestas válidas (llaves únicas): {len(deduped)}")
    print(f"  duplicados resueltos (se usó la última): {n_dups}")
    print(f"  formato de llave inválido: {len(bad_format)}" + (f" -> {bad_format}" if bad_format else ""))
    print(f"  llaves no presentes en keys_master: {len(unknown_key)}" + (f" -> {unknown_key}" if unknown_key else ""))
    if missing_report:
        print(f"  respuestas con campos mínimos faltantes: {len(missing_report)}")
        for k, miss in missing_report.items():
            print(f"     {k}: faltan {miss}")
    else:
        print("  campos mínimos: todas las respuestas OK")
    print(f"\n  guardado en {C.TRAINING_RAW}")


if __name__ == "__main__":
    main()
