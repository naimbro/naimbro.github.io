"""
02 · Crear el Google Form de ENTRENAMIENTO del avatar.

Lee config/training_form_schema.yaml, construye el formulario con la Forms
API, lo comparte con tu cuenta y guarda:
  - google.training_form_id / training_form_url en config.local.yaml
  - data_private/training_form_map.json  (questionId -> field)

Uso:
  python avatar_congress/scripts/02_create_training_form.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common as C
import forms_builder as FB


def schema_to_items(schema):
    """Convierte el schema YAML a la lista de ítems normalizada del builder."""
    items = []
    for it in schema["items"]:
        t = it["type"]
        if t == "section":
            items.append({"kind": "section", "title": it.get("title", ""),
                          "description": it.get("description", "")})
        elif t in ("short_text", "paragraph", "choice", "checkbox", "scale"):
            items.append({**it, "kind": t})
        else:
            C.die(f"Tipo no soportado en el schema: {t}")
    return items


def main():
    C.ensure_dirs()
    cfg = C.load_config()

    schema = C.load_training_schema()
    items = schema_to_items(schema)
    n_questions = sum(1 for i in items if i["kind"] != "section")
    C.log(f"Construyendo form de entrenamiento ({n_questions} preguntas, "
          f"{len(items)} ítems incl. secciones)…")

    form_id, url, field_map = FB.create_form(
        cfg, schema["form_title"], schema.get("form_description", ""), items)

    C.write_json(C.TRAINING_FORM_MAP, field_map)
    C.save_config_google_ids({"training_form_id": form_id, "training_form_url": url})

    C.log(f"Form creado: {form_id}")
    C.log(f"Mapeo de campos guardado en {C.TRAINING_FORM_MAP} ({len(field_map)} campos)")
    print("\n>>> LINK PARA ESTUDIANTES (entrenamiento):")
    print(f"    {url}\n")


if __name__ == "__main__":
    main()
