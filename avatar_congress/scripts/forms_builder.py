"""
Helper para construir Google Forms con la Forms API a partir de una lista
de ítems normalizados, devolviendo el mapeo questionId -> field (clave de
dato) para que la ingesta sea robusta a cambios de título.

Tipos de ítem soportados:
  section     -> PageBreakItem
  short_text  -> TextQuestion (1 línea)
  paragraph   -> TextQuestion (párrafo)
  choice      -> ChoiceQuestion RADIO
  checkbox    -> ChoiceQuestion CHECKBOX
  scale       -> ScaleQuestion (low..high)
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common as C


def _question_item(item):
    """Build the createItem 'item' body for a question item; returns (body, has_field)."""
    kind = item["kind"]
    required = bool(item.get("required", False))

    if kind in ("short_text", "paragraph"):
        question = {"required": required,
                    "textQuestion": {"paragraph": kind == "paragraph"}}
    elif kind in ("choice", "checkbox"):
        qtype = "RADIO" if kind == "choice" else "CHECKBOX"
        question = {"required": required,
                    "choiceQuestion": {"type": qtype,
                                       "options": [{"value": o} for o in item["options"]]}}
    elif kind == "scale":
        question = {"required": required,
                    "scaleQuestion": {"low": int(item.get("low", 1)),
                                      "high": int(item.get("high", 5)),
                                      "lowLabel": item.get("low_label", ""),
                                      "highLabel": item.get("high_label", "")}}
    else:
        raise ValueError(f"tipo de pregunta no soportado: {kind}")

    body = {"title": item["title"], "questionItem": {"question": question}}
    if item.get("description"):
        body["description"] = item["description"]
    return body


def create_form(cfg, title, description, items):
    """
    items: lista de dicts con 'kind' y campos según el tipo. Los ítems de
    pregunta llevan 'field' (clave de dato). Las secciones no.

    Devuelve (form_id, responder_uri, field_map) donde field_map es
    {questionId: field}.
    """
    forms = C.forms_service(cfg)

    # 1. Crear formulario (solo título permitido en create)
    form = forms.forms().create(body={"info": {"title": title}}).execute()
    form_id = form["formId"]

    # 2. Descripción + título visible
    requests = [{
        "updateFormInfo": {
            "info": {"description": description},
            "updateMask": "description",
        }
    }]
    # 3. Ítems en orden
    fields_in_order = []  # field por cada request de pregunta (None para secciones)
    for idx, item in enumerate(items):
        if item["kind"] == "section":
            req = {"createItem": {
                "item": {"title": item.get("title", ""),
                         "description": item.get("description", ""),
                         "pageBreakItem": {}},
                "location": {"index": idx}}}
            fields_in_order.append(None)
        else:
            req = {"createItem": {"item": _question_item(item),
                                  "location": {"index": idx}}}
            fields_in_order.append(item.get("field"))
        requests.append(req)

    resp = forms.forms().batchUpdate(
        formId=form_id, body={"requests": requests}).execute()

    # 4. Mapear questionId -> field desde las replies
    replies = resp.get("replies", [])
    field_map = {}
    # replies[0] corresponde a updateFormInfo (sin createItem)
    create_replies = replies[1:]
    for field, reply in zip(fields_in_order, create_replies):
        ci = reply.get("createItem", {})
        qids = ci.get("questionId", [])
        if field and qids:
            field_map[qids[0]] = field

    # 5. Compartir + recuperar responderUri
    C.share_file(cfg, form_id)
    info = forms.forms().get(formId=form_id).execute()
    responder_uri = info.get("responderUri", "")
    return form_id, responder_uri, field_map
