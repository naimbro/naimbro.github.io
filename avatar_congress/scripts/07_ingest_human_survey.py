"""
07 · Ingerir respuestas de la ENCUESTA HUMANA.

Lee respuestas vía Forms API, valida llaves, deduplica, normaliza las
forced-choice a "A"/"B" y las Likert a entero, y guarda
data_private/human_survey_raw.csv.

Uso:
  python avatar_congress/scripts/07_ingest_human_survey.py
"""

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common as C


def normalize_answer(qid, value, qtype):
    """Map a raw form value to the canonical stored value."""
    v = (value or "").strip()
    if qtype == "likert_1_5":
        m = re.search(r"[1-5]", v)
        return m.group(0) if m else ""
    if qtype == "forced_choice":
        # las opciones se crearon como "A) ..." / "B) ..."
        if v.upper().startswith("A"):
            return "A"
        if v.upper().startswith("B"):
            return "B"
        return ""
    return v  # free_text


def main():
    C.ensure_dirs()
    cfg = C.load_config()
    form_id = cfg.get("google", {}).get("human_survey_form_id")
    if not form_id:
        C.die("No hay human_survey_form_id en config.local.yaml. Corre 05_create_human_survey_form.py primero.")
    field_map = C.read_json(C.HUMAN_FORM_MAP)
    if not field_map:
        C.die(f"Falta {C.HUMAN_FORM_MAP}. Corre 05_create_human_survey_form.py primero.")

    questions = C.load_survey_questions()
    qtype = {q["id"]: q["type"] for q in questions}

    raw = C.pull_form_responses(cfg, form_id, field_map)
    C.log(f"Respuestas crudas recibidas: {len(raw)}")

    valid_keys = {r["key"] for r in C.read_csv(C.KEYS_MASTER)} if C.KEYS_MASTER.exists() else set()
    trained = {r["key"] for r in C.read_csv(C.TRAINING_RAW)} if C.TRAINING_RAW.exists() else set()

    bad_format, unknown_key = [], []
    cleaned = []
    for r in raw:
        k = C.normalize_key(r.get("key", ""))
        if not C.valid_key(k):
            bad_format.append(k or "(vacía)")
            continue
        if valid_keys and k not in valid_keys:
            unknown_key.append(k)
        r["key"] = k
        cleaned.append(r)

    deduped, n_dups = C.dedupe_latest(cleaned, "key")

    qids = [q["id"] for q in questions]
    rows = []
    for r in deduped:
        row = {"key": r["key"], "timestamp": r.get("_submitted_at", "")}
        for qid in qids:
            row[qid] = normalize_answer(qid, r.get(qid, ""), qtype[qid])
        rows.append(row)
    C.write_csv(C.HUMAN_RAW, rows, ["key", "timestamp"] + qids)

    # Cruces de completitud
    human_keys = {r["key"] for r in deduped}
    trained_no_human = sorted(trained - human_keys)
    human_no_trained = sorted(human_keys - trained)

    C.update_progress(human_received=len(deduped))

    print("\n=== Reporte de ingesta (encuesta humana) ===")
    print(f"  respuestas válidas (llaves únicas): {len(deduped)}")
    print(f"  duplicados resueltos: {n_dups}")
    print(f"  formato de llave inválido: {len(bad_format)}" + (f" -> {bad_format}" if bad_format else ""))
    print(f"  llaves no en keys_master: {len(unknown_key)}" + (f" -> {unknown_key}" if unknown_key else ""))
    print(f"  entrenamiento SIN encuesta humana: {len(trained_no_human)}" + (f" -> {trained_no_human}" if trained_no_human else ""))
    print(f"  encuesta humana SIN entrenamiento: {len(human_no_trained)}" + (f" -> {human_no_trained}" if human_no_trained else ""))
    print(f"\n  guardado en {C.HUMAN_RAW}")


if __name__ == "__main__":
    main()
