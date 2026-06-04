"""
Servidor local del dashboard del Congreso de avatares.

Sirve los archivos estáticos del dashboard y una pequeña API JSON que lee
los archivos de data_runtime/ y exports_private/. El runner (06) escribe
eventos a data_runtime/live_events.jsonl; el frontend hace polling.

Modos:
  (default)   modo clase local: /api/student/<key> habilitado
  --public    modo público: oculta datos individuales (solo agregados)

Uso:
  python avatar_congress/scripts/serve_dashboard.py [--port 8000] [--public]
"""

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common as C

from flask import Flask, jsonify, request, send_from_directory

app = Flask(__name__, static_folder=None)
PUBLIC_MODE = False
SHARED_MODE = False  # como local (permite ver por llave) pero SIN listar las llaves


@app.after_request
def no_cache(resp):
    # Evita que el navegador sirva versiones viejas del dashboard o datos en caché.
    resp.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    resp.headers["Pragma"] = "no-cache"
    return resp


@app.route("/")
def index():
    return send_from_directory(str(C.DASHBOARD_DIR), "index.html")


@app.route("/<path:fname>")
def static_files(fname):
    # Solo servir archivos del dashboard (evita exponer otras rutas)
    if fname in ("styles.css", "app.js", "index.html"):
        return send_from_directory(str(C.DASHBOARD_DIR), fname)
    return ("Not found", 404)


@app.route("/api/config")
def api_config():
    cfg = C.load_config()
    cls = cfg.get("class", {})
    prog = C.read_json(C.PROGRESS, default={}) or {}
    totals = prog.get("totals") or {"students": cls.get("n_students", 23), "questions": 16}
    return jsonify({"public_mode": PUBLIC_MODE, "totals": totals})


@app.route("/api/progress")
def api_progress():
    return jsonify(C.read_json(C.PROGRESS, default={}) or {})


@app.route("/api/events")
def api_events():
    try:
        since = int(request.args.get("since", 0))
    except ValueError:
        since = 0
    events = C.read_jsonl(C.LIVE_EVENTS)
    return jsonify({"events": events[since:], "next": len(events)})


@app.route("/api/analysis")
def api_analysis():
    return jsonify(C.read_json(C.ANALYSIS_PUBLIC, default={}) or {})


@app.route("/api/keys")
def api_keys():
    # Lista de llaves para el autocompletado de "Explorar".
    # En modo público o compartido NO se listan (cada alumno escribe su propia llave).
    if PUBLIC_MODE:
        return jsonify({"keys": [], "public_mode": True})
    if SHARED_MODE:
        return jsonify({"keys": []})
    # Preferimos las llaves con resultados; si no hay análisis aún, usamos keys_master.
    per_student = C.read_json(C.PER_STUDENT_PRIVATE, default={}) or {}
    keys = sorted(per_student.keys())
    if not keys:
        keys = sorted(r["key"] for r in C.read_csv(C.KEYS_MASTER) if r.get("key"))
    return jsonify({"keys": keys})


@app.route("/api/student/<key>")
def api_student(key):
    if PUBLIC_MODE:
        return jsonify({"found": False, "public_mode": True})
    data = C.read_json(C.PER_STUDENT_PRIVATE, default={}) or {}
    k = C.normalize_key(key)
    entry = data.get(k)
    if not entry:
        return jsonify({"found": False, "key": k})
    return jsonify({"found": True, "key": k, **entry})


def main():
    global PUBLIC_MODE, SHARED_MODE
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=8000)
    ap.add_argument("--public", action="store_true", help="modo público (oculta datos individuales)")
    ap.add_argument("--shared", action="store_true",
                    help="modo compartido: por-llave sí, pero sin listar las llaves (cada alumno escribe la suya)")
    ap.add_argument("--host", default="127.0.0.1", help="usa 0.0.0.0 para exponer vía túnel")
    args = ap.parse_args()
    PUBLIC_MODE = args.public
    SHARED_MODE = args.shared

    C.ensure_dirs()
    if not C.PROGRESS.exists():
        C.update_progress(avatar_responses_received=0, avatar_responses_total=0)

    mode = ("PÚBLICO (solo agregados)" if PUBLIC_MODE
            else "COMPARTIDO (por-llave, sin listar)" if SHARED_MODE
            else "CLASE LOCAL (incluye por-llave)")
    print(f"\n  Dashboard: http://localhost:{args.port}   [modo {mode}]")
    print("  Ctrl+C para detener.\n")
    app.run(host=args.host, port=args.port, debug=False, threaded=True)


if __name__ == "__main__":
    main()
