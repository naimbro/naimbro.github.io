"""
00 · Chequeo de entorno antes de la clase.

Verifica: config, .env (API keys), service account, acceso a Forms/Drive,
librerías y (opcional) una llamada mínima al LLM elegido.

Uso:
  python avatar_congress/scripts/00_check_environment.py [--probe-llm]

--probe-llm hace UNA llamada minúscula al modelo configurado (costo ~0).
"""

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common as C

OK = "✓"
NO = "✗"


def check(label, ok, detail=""):
    mark = OK if ok else NO
    print(f"  {mark} {label}" + (f" — {detail}" if detail else ""))
    return ok


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--probe-llm", action="store_true", help="hacer una llamada mínima al LLM")
    args = ap.parse_args()

    all_ok = True
    print("\n=== Chequeo de entorno: Congreso de avatares ===\n")

    # 1. Librerías
    print("Librerías:")
    libs = {}
    for name in ("yaml", "dotenv", "googleapiclient", "google.oauth2", "openai", "anthropic", "flask"):
        try:
            __import__(name)
            libs[name] = True
        except ImportError:
            libs[name] = False
            all_ok = False
        check(name, libs[name], "" if libs[name] else "falta — pip install -r requirements.txt")

    # 2. Config
    print("\nConfig:")
    cfg = C.load_config()
    using_local = cfg["_config_path"].endswith("config.local.yaml")
    check("config.local.yaml presente", using_local,
          "" if using_local else "se está usando config.example.yaml (créalo antes de clase)")
    model = cfg.get("llm", {})
    print(f"    proveedor LLM: {model.get('provider')} · modelo: {model.get('model')} · modo: {cfg.get('run',{}).get('mode')}")

    # 3. .env / API keys
    print("\nAPI keys (.env):")
    env = C.load_dotenv_keys(cfg)
    check(".env existe", env["exists"], env["dotenv_path"])
    provider = model.get("provider", "openai")
    if provider == "openai":
        ok = env["OPENAI_API_KEY"]; all_ok &= ok
        check("OPENAI_API_KEY", ok)
    else:
        ok = env["ANTHROPIC_API_KEY"]; all_ok &= ok
        check("ANTHROPIC_API_KEY", ok)
    # también informar la otra
    check("OPENAI_API_KEY (presente)", env["OPENAI_API_KEY"])
    check("ANTHROPIC_API_KEY (presente)", env["ANTHROPIC_API_KEY"])

    # 4. Service account + Google APIs
    print("\nGoogle APIs:")
    sa = C.REPO_ROOT / cfg.get("credentials", {}).get("service_account_file", "drive_credentials.json")
    sa_ok = sa.exists()
    all_ok &= check("drive_credentials.json", sa_ok, str(sa))
    if sa_ok:
        try:
            forms = C.forms_service(cfg)
            f = forms.forms().create(body={"info": {"title": "ac env-check (delete)"}}).execute()
            fid = f["formId"]
            check("Forms API: crear", True, fid[:12] + "…")
            forms.forms().responses().list(formId=fid).execute()
            check("Forms API: leer respuestas", True)
            C.drive_service(cfg).files().delete(fileId=fid).execute()
            check("Drive API: borrar", True)
        except Exception as e:  # noqa
            all_ok = False
            check("Forms/Drive API", False, str(e)[:160])

    # 5. Estado de datos
    print("\nDatos:")
    keys = C.read_csv(C.KEYS_MASTER)
    check("llaves generadas", bool(keys), f"{len(keys)} llaves" if keys else "corre 01_generate_keys.py")

    # 6. Probe LLM opcional
    if args.probe_llm:
        print("\nProbe LLM (1 llamada mínima):")
        try:
            llm = C.LLMClient(cfg)
            parsed, raw = llm.complete_json(
                "Responde solo JSON.",
                'Devuelve {"ok": true} y nada más.')
            ok = bool(parsed and parsed.get("ok") is True)
            check(f"{llm.provider}/{llm.model}", ok, "" if ok else f"respuesta inesperada: {str(raw)[:80]}")
            all_ok &= ok
        except Exception as e:  # noqa
            all_ok = False
            check("llamada LLM", False, str(e)[:160])

    print("\n" + ("TODO OK ✓ — listo para la clase." if all_ok else
                  "HAY PROBLEMAS ✗ — revisa los ítems marcados arriba."))
    sys.exit(0 if all_ok else 1)


if __name__ == "__main__":
    main()
