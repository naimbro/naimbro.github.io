"""
05 · Crear el Google Form de la ENCUESTA HUMANA.

Lee config/survey_questions.yaml (Q01–Q17), construye el formulario con la
Forms API, lo comparte y guarda:
  - google.human_survey_form_id / human_survey_form_url en config.local.yaml
  - data_private/human_form_map.json  (questionId -> Qxx)

Uso:
  python avatar_congress/scripts/05_create_human_survey_form.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common as C
import forms_builder as FB

FORM_TITLE = "Congreso de avatares — Encuesta humana"
FORM_DESC = (
    "Responde como tú mismo/a, no como crees que “debería” responder tu "
    "avatar. Usa la misma llave anónima que usaste en la ficha de "
    "entrenamiento. No se pide nombre, correo ni RUT."
)


def questions_to_items(questions):
    items = []

    # Sección 1: llave
    items.append({"kind": "section", "title": "Tu llave",
                  "description": "Identifícate solo con tu llave anónima."})
    items.append({"kind": "short_text", "field": "key", "required": True,
                  "title": "Llave anónima asignada",
                  "description": "Escribe exactamente la misma llave que usaste en la ficha de entrenamiento (ej: CONDOR-47)."})

    # Sección 2: dilemas
    items.append({"kind": "section", "title": "Dilemas de política pública",
                  "description": "Responde según tu propia opinión."})

    for q in questions:
        qid = q["id"]
        if q["type"] == "likert_1_5":
            scale = q["scale"]
            items.append({
                "kind": "scale", "field": qid, "required": True,
                "title": f"{qid}. {q['text']}",
                "low": 1, "high": 5,
                "low_label": scale[1], "high_label": scale[5],
            })
        elif q["type"] == "forced_choice":
            opts = q["options"]
            # Prefijamos A) / B) para mapear la elección de vuelta a "A"/"B".
            items.append({
                "kind": "choice", "field": qid, "required": True,
                "title": f"{qid}. {q['text']}",
                "options": [f"A) {opts['A']}", f"B) {opts['B']}"],
            })
        elif q["type"] == "free_text":
            items.append({
                "kind": "paragraph", "field": qid, "required": False,
                "title": f"{qid}. {q['text']}",
            })
    return items


def main():
    C.ensure_dirs()
    cfg = C.load_config()

    questions = C.load_survey_questions()
    items = questions_to_items(questions)
    n_q = sum(1 for i in items if i["kind"] != "section")
    C.log(f"Construyendo encuesta humana ({n_q} preguntas)…")

    form_id, url, field_map = FB.create_form(cfg, FORM_TITLE, FORM_DESC, items)

    C.write_json(C.HUMAN_FORM_MAP, field_map)
    C.save_config_google_ids({"human_survey_form_id": form_id, "human_survey_form_url": url})

    C.log(f"Form creado: {form_id}")
    C.log(f"Mapeo guardado en {C.HUMAN_FORM_MAP} ({len(field_map)} campos)")
    print("\n>>> LINK PARA ESTUDIANTES (encuesta humana):")
    print(f"    {url}\n")


if __name__ == "__main__":
    main()
