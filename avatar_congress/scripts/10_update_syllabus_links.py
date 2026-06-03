"""
10 · Inyectar los links de los formularios y el dashboard en el syllabus.

Busca en teaching/2026_temas_emergentes.html los anclas con id:
  ac-training-form, ac-human-form, ac-dashboard
y reemplaza su atributo href con las URLs de config.local.yaml.

Idempotente: puede correrse varias veces. Si una URL no existe todavía,
deja el placeholder ("#") y avisa.

Uso:
  python avatar_congress/scripts/10_update_syllabus_links.py
"""

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common as C


def set_href(html, anchor_id, url):
    """Replace href in the <a id="anchor_id" ...> tag. Returns (html, changed)."""
    # Captura la etiqueta <a ...> que contiene id="anchor_id"
    pattern = re.compile(r'(<a\b[^>]*\bid=["\']' + re.escape(anchor_id) + r'["\'][^>]*>)')
    m = pattern.search(html)
    if not m:
        return html, False
    tag = m.group(1)
    if 'href=' in tag:
        new_tag = re.sub(r'href=["\'][^"\']*["\']', f'href="{url}"', tag, count=1)
    else:
        new_tag = tag[:2] + f' href="{url}"' + tag[2:]
    return html[:m.start(1)] + new_tag + html[m.end(1):], True


def main():
    cfg = C.load_config()
    g = cfg.get("google", {})
    syl_cfg = cfg.get("syllabus", {})
    syllabus = C.REPO_ROOT / syl_cfg.get("file", "teaching/2026_temas_emergentes.html")
    if not syllabus.exists():
        C.die(f"No se encontró el syllabus: {syllabus}")

    links = {
        "ac-training-form": g.get("training_form_url", ""),
        "ac-human-form": g.get("human_survey_form_url", ""),
        "ac-dashboard": syl_cfg.get("dashboard_url", ""),
    }

    html = syllabus.read_text(encoding="utf-8")
    changed_any = False
    for anchor_id, url in links.items():
        if not url:
            C.log(f"AVISO: sin URL para {anchor_id} (déjalo y vuelve a correr cuando exista).")
            continue
        html, changed = set_href(html, anchor_id, url)
        if changed:
            C.log(f"  {anchor_id} -> {url}")
            changed_any = True
        else:
            C.log(f"AVISO: no se encontró el ancla id='{anchor_id}' en el syllabus.")

    if changed_any:
        syllabus.write_text(html, encoding="utf-8")
        C.log(f"Syllabus actualizado: {syllabus}")
    else:
        C.log("Sin cambios en el syllabus.")


if __name__ == "__main__":
    main()
