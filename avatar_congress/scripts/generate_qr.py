"""
Generar códigos QR para los formularios (entrenamiento + encuesta humana).

Lee las URLs desde config.local.yaml y produce, en exports_private/:
  qr_training.png      QR del formulario de entrenamiento
  qr_human.png         QR de la encuesta humana
  qr.html              página lista para PROYECTAR con ambos QR

Requiere: segno (pip install segno). Salidas en exports_private/ (gitignored).

Uso:
  python avatar_congress/scripts/generate_qr.py
"""

import base64
import io
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common as C

try:
    import segno
except ImportError:
    C.die("Falta segno. Instala con: pip install --user segno")


def qr_png_bytes(url, scale=10):
    buf = io.BytesIO()
    segno.make(url, error="m").save(buf, kind="png", scale=scale, border=3)
    return buf.getvalue()


HTML = """<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8">
<title>Congreso de avatares — QR</title>
<style>
  body {{ font-family: -apple-system, "Segoe UI", Roboto, sans-serif; background:#fff; color:#1b1d21;
         margin:0; padding:40px; }}
  h1 {{ text-align:center; font-size:2rem; margin:0 0 8px; }}
  p.sub {{ text-align:center; color:#8a9099; margin:0 0 36px; }}
  .grid {{ display:flex; gap:48px; justify-content:center; flex-wrap:wrap; }}
  .card {{ border:1px solid #e7e9ee; border-radius:18px; padding:28px 32px; text-align:center;
          box-shadow:0 8px 24px rgba(20,22,28,.06); max-width:420px; }}
  .step {{ display:inline-block; background:#fde8eb; color:#c4283f; font-weight:700;
          padding:4px 14px; border-radius:999px; font-size:.95rem; margin-bottom:14px; }}
  .card h2 {{ font-size:1.4rem; margin:0 0 18px; }}
  .card img {{ width:300px; height:300px; image-rendering:pixelated; }}
  .card .hint {{ color:#4a4f57; margin-top:16px; font-size:1rem; }}
</style></head>
<body>
  <h1>Congreso de avatares</h1>
  <p class="sub">Escanea con tu celular. Usa la <b>misma llave</b> en ambos formularios.</p>
  <div class="grid">
    <div class="card">
      <span class="step">1 · Entrenamiento</span>
      <h2>Entrena tu avatar</h2>
      <img alt="QR entrenamiento" src="data:image/png;base64,{train_b64}">
      <div class="hint">Primero completa esta ficha.</div>
    </div>
    <div class="card">
      <span class="step">2 · Encuesta humana</span>
      <h2>Responde tú mismo/a</h2>
      <img alt="QR encuesta humana" src="data:image/png;base64,{human_b64}">
      <div class="hint">Después responde con tu misma llave.</div>
    </div>
  </div>
</body></html>
"""


def main():
    cfg = C.load_config()
    g = cfg.get("google", {})
    train = g.get("training_form_url")
    human = g.get("human_survey_form_url")
    if not train or not human:
        C.die("Faltan URLs de formularios en config.local.yaml. Corre 02 y 05 primero.")
    C.EXPORTS_PRIVATE.mkdir(parents=True, exist_ok=True)

    train_png = qr_png_bytes(train)
    human_png = qr_png_bytes(human)
    (C.EXPORTS_PRIVATE / "qr_training.png").write_bytes(train_png)
    (C.EXPORTS_PRIVATE / "qr_human.png").write_bytes(human_png)

    html = HTML.format(
        train_b64=base64.b64encode(train_png).decode(),
        human_b64=base64.b64encode(human_png).decode(),
    )
    (C.EXPORTS_PRIVATE / "qr.html").write_text(html, encoding="utf-8")

    C.log("QR generados en exports_private/:")
    C.log("  qr_training.png · qr_human.png · qr.html (para proyectar)")
    print(f"\n  Entrenamiento: {train}")
    print(f"  Encuesta:      {human}")
    print(f"\n  Abre para proyectar:  {C.EXPORTS_PRIVATE / 'qr.html'}")


if __name__ == "__main__":
    main()
