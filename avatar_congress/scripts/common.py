"""
Shared helpers for the Congreso de avatares pipeline.

Centralizes: paths, config loading, Google API clients, private IO
(CSV / JSONL / JSON), live-event + progress writers, the LLM client
abstraction (OpenAI / Anthropic), and small privacy-safe logging utils.

Nothing here prints raw individual responses. Keep it that way.
"""

import csv
import json
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

# ── Paths ──────────────────────────────────────────────────────
# scripts/ -> avatar_congress/ -> repo root
SCRIPTS_DIR = Path(__file__).resolve().parent
PKG_DIR = SCRIPTS_DIR.parent
REPO_ROOT = PKG_DIR.parent

CONFIG_DIR = PKG_DIR / "config"
DATA_PRIVATE = PKG_DIR / "data_private"
DATA_RUNTIME = PKG_DIR / "data_runtime"
EXPORTS_PRIVATE = PKG_DIR / "exports_private"
DASHBOARD_DIR = PKG_DIR / "dashboard"

CONFIG_LOCAL = CONFIG_DIR / "config.local.yaml"
CONFIG_EXAMPLE = CONFIG_DIR / "config.example.yaml"
SURVEY_QUESTIONS = CONFIG_DIR / "survey_questions.yaml"
TRAINING_SCHEMA = CONFIG_DIR / "training_form_schema.yaml"

# Private data files
KEYS_MASTER = DATA_PRIVATE / "keys_master.csv"
TRAINING_RAW = DATA_PRIVATE / "training_responses_raw.csv"
TRAINING_FORM_MAP = DATA_PRIVATE / "training_form_map.json"
HUMAN_RAW = DATA_PRIVATE / "human_survey_raw.csv"
HUMAN_FORM_MAP = DATA_PRIVATE / "human_form_map.json"
AVATAR_PROMPTS = DATA_PRIVATE / "avatar_prompts.jsonl"
AVATAR_RESPONSES = DATA_PRIVATE / "avatar_responses_raw.jsonl"
MATCHED_PRIVATE = DATA_PRIVATE / "matched_results_private.csv"

# Runtime files (read by the live dashboard)
LIVE_EVENTS = DATA_RUNTIME / "live_events.jsonl"
PROGRESS = DATA_RUNTIME / "progress.json"
ANALYSIS_PUBLIC = DATA_RUNTIME / "analysis_public_aggregated.json"

# Export files (private)
ANALYSIS_PRIVATE = EXPORTS_PRIVATE / "analysis_private.csv"
PER_STUDENT_PRIVATE = EXPORTS_PRIVATE / "per_student_private.json"
KEYS_FOR_CLASS = EXPORTS_PRIVATE / "keys_for_class.txt"

# ── Google API scopes ──────────────────────────────────────────
SCOPES = [
    "https://www.googleapis.com/auth/forms.body",
    "https://www.googleapis.com/auth/forms.responses.readonly",
    "https://www.googleapis.com/auth/drive",
]

KEY_REGEX = re.compile(r"^[A-ZÁÉÍÓÚÑ]+-[0-9]{2}$")


# ── Small utilities ────────────────────────────────────────────
def now_iso():
    return datetime.now(timezone.utc).isoformat()


def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}", flush=True)


def die(msg, code=1):
    print(f"ERROR: {msg}", file=sys.stderr, flush=True)
    sys.exit(code)


def ensure_dirs():
    for d in (DATA_PRIVATE, DATA_RUNTIME, EXPORTS_PRIVATE):
        d.mkdir(parents=True, exist_ok=True)


def normalize_key(raw):
    """Normalize a user-typed key: strip, uppercase, collapse spaces around dash."""
    if raw is None:
        return ""
    k = str(raw).strip().upper()
    k = re.sub(r"\s*-\s*", "-", k)
    k = re.sub(r"\s+", "", k)
    return k


def valid_key(k):
    return bool(KEY_REGEX.match(k or ""))


# ── Config ─────────────────────────────────────────────────────
def _require_yaml():
    try:
        import yaml  # noqa
        return yaml
    except ImportError:
        die("PyYAML no instalado. Corre: pip install -r avatar_congress/requirements.txt")


def load_config():
    """Load config.local.yaml, falling back to config.example.yaml with a warning."""
    yaml = _require_yaml()
    path = CONFIG_LOCAL if CONFIG_LOCAL.exists() else CONFIG_EXAMPLE
    if path == CONFIG_EXAMPLE:
        log("AVISO: usando config.example.yaml (no existe config.local.yaml). "
            "Crea config.local.yaml antes de la clase.")
    with open(path, encoding="utf-8") as f:
        cfg = yaml.safe_load(f)
    cfg["_config_path"] = str(path)
    return cfg


def save_config_google_ids(updates):
    """Merge keys into the 'google' block of config.local.yaml (create from example if needed)."""
    yaml = _require_yaml()
    if not CONFIG_LOCAL.exists():
        # seed from example
        with open(CONFIG_EXAMPLE, encoding="utf-8") as f:
            cfg = yaml.safe_load(f)
        log("Creando config.local.yaml a partir de config.example.yaml")
    else:
        with open(CONFIG_LOCAL, encoding="utf-8") as f:
            cfg = yaml.safe_load(f)
    cfg.setdefault("google", {})
    cfg["google"].update(updates)
    with open(CONFIG_LOCAL, "w", encoding="utf-8") as f:
        yaml.safe_dump(cfg, f, allow_unicode=True, sort_keys=False)
    log(f"config.local.yaml actualizado: {', '.join(updates.keys())}")


def load_survey_questions():
    yaml = _require_yaml()
    with open(SURVEY_QUESTIONS, encoding="utf-8") as f:
        data = yaml.safe_load(f)
    return data["questions"]


def load_training_schema():
    yaml = _require_yaml()
    with open(TRAINING_SCHEMA, encoding="utf-8") as f:
        return yaml.safe_load(f)


def load_dotenv_keys(cfg=None):
    """Load .env into os.environ. Returns dict with which keys are present."""
    try:
        from dotenv import load_dotenv
    except ImportError:
        die("python-dotenv no instalado. Corre: pip install -r avatar_congress/requirements.txt")
    dotenv_file = REPO_ROOT / ".env"
    if cfg:
        dotenv_file = REPO_ROOT / cfg.get("credentials", {}).get("dotenv_file", ".env")
    load_dotenv(dotenv_file)
    return {
        "dotenv_path": str(dotenv_file),
        "exists": dotenv_file.exists(),
        "OPENAI_API_KEY": bool(os.environ.get("OPENAI_API_KEY")),
        "ANTHROPIC_API_KEY": bool(os.environ.get("ANTHROPIC_API_KEY")),
    }


# ── Google API clients ─────────────────────────────────────────
def google_creds(cfg):
    from google.oauth2 import service_account
    sa_file = REPO_ROOT / cfg.get("credentials", {}).get(
        "service_account_file", "drive_credentials.json")
    if not sa_file.exists():
        die(f"No se encontró el service account: {sa_file}")
    return service_account.Credentials.from_service_account_file(str(sa_file), scopes=SCOPES)


def forms_service(cfg):
    from googleapiclient.discovery import build
    return build("forms", "v1", credentials=google_creds(cfg))


def drive_service(cfg):
    from googleapiclient.discovery import build
    return build("drive", "v3", credentials=google_creds(cfg))


def pull_form_responses(cfg, form_id, field_map):
    """Return list of response rows keyed by field name.

    field_map: {questionId: field}. Multi-value answers (checkbox) are joined
    with ';'. Each row also has '_submitted_at' and '_response_id'.
    Handles pagination.
    """
    forms = forms_service(cfg)
    rows = []
    page_token = None
    while True:
        kwargs = {"formId": form_id}
        if page_token:
            kwargs["pageToken"] = page_token
        resp = forms.forms().responses().list(**kwargs).execute()
        for r in resp.get("responses", []):
            row = {"_response_id": r.get("responseId", ""),
                   "_submitted_at": r.get("lastSubmittedTime", r.get("createTime", ""))}
            answers = r.get("answers", {})
            for qid, ans in answers.items():
                field = field_map.get(qid)
                if not field:
                    continue
                vals = [a.get("value", "") for a in ans.get("textAnswers", {}).get("answers", [])]
                row[field] = ";".join(vals) if len(vals) > 1 else (vals[0] if vals else "")
            rows.append(row)
        page_token = resp.get("nextPageToken")
        if not page_token:
            break
    return rows


def dedupe_latest(rows, key_field="key"):
    """Keep the most recent row per key (by _submitted_at). Returns (rows, n_dups)."""
    best = {}
    dups = 0
    for r in rows:
        k = normalize_key(r.get(key_field, ""))
        if not k:
            continue
        r = dict(r)
        r[key_field] = k
        if k in best:
            dups += 1
            if r.get("_submitted_at", "") >= best[k].get("_submitted_at", ""):
                best[k] = r
        else:
            best[k] = r
    return list(best.values()), dups


def share_file(cfg, file_id):
    """Share a Drive file (form) with the configured email as writer (best effort)."""
    email = cfg.get("credentials", {}).get("share_with_email")
    if not email:
        return
    try:
        drive_service(cfg).permissions().create(
            fileId=file_id,
            body={"type": "user", "role": "writer", "emailAddress": email},
            sendNotificationEmail=False,
        ).execute()
        log(f"Form compartido con {email}")
    except Exception as e:  # noqa
        log(f"AVISO: no se pudo compartir el form ({e}).")


# ── Private IO ─────────────────────────────────────────────────
def write_csv(path, rows, fieldnames):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        for r in rows:
            w.writerow({k: r.get(k, "") for k in fieldnames})


def read_csv(path):
    if not Path(path).exists():
        return []
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def write_jsonl(path, records):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        for r in records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")


def read_jsonl(path):
    if not Path(path).exists():
        return []
    out = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                out.append(json.loads(line))
    return out


def append_jsonl(path, record):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")


def write_json(path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)


def read_json(path, default=None):
    if not Path(path).exists():
        return default
    with open(path, encoding="utf-8") as f:
        return json.load(f)


# ── Live dashboard writers ─────────────────────────────────────
def emit_event(event):
    """Append one live event (dashboard streams these). Adds a timestamp."""
    event = dict(event)
    event.setdefault("ts", now_iso())
    append_jsonl(LIVE_EVENTS, event)


def update_progress(**fields):
    """Merge fields into progress.json (atomic-ish rewrite)."""
    cur = read_json(PROGRESS, default={}) or {}
    cur.update(fields)
    cur["updated_at"] = now_iso()
    write_json(PROGRESS, cur)
    return cur


def reset_runtime():
    """Clear live events + progress (use at the start of a run)."""
    DATA_RUNTIME.mkdir(parents=True, exist_ok=True)
    if LIVE_EVENTS.exists():
        LIVE_EVENTS.unlink()
    LIVE_EVENTS.touch()


# ── LLM client abstraction ─────────────────────────────────────
class LLMClient:
    """Thin wrapper over OpenAI / Anthropic that returns parsed JSON."""

    def __init__(self, cfg):
        llm = cfg.get("llm", {})
        self.provider = llm.get("provider", "openai")
        self.model = llm.get("model", "gpt-4o-mini")
        self.temperature = float(llm.get("temperature", 0.4))
        self.max_tokens = int(llm.get("max_tokens", 1500))
        self.timeout = float(llm.get("request_timeout_s", 60))
        self._client = None
        self._init_client()

    def _init_client(self):
        if self.provider == "openai":
            from openai import OpenAI
            if not os.environ.get("OPENAI_API_KEY"):
                die("Falta OPENAI_API_KEY en .env")
            self._client = OpenAI(timeout=self.timeout)
        elif self.provider == "anthropic":
            import anthropic
            if not os.environ.get("ANTHROPIC_API_KEY"):
                die("Falta ANTHROPIC_API_KEY en .env")
            self._client = anthropic.Anthropic(timeout=self.timeout)
        else:
            die(f"Proveedor LLM desconocido: {self.provider}")

    def complete_json(self, system_prompt, user_prompt):
        """Return (parsed_json_or_None, raw_text). Raises only on transport errors."""
        if self.provider == "openai":
            resp = self._client.chat.completions.create(
                model=self.model,
                temperature=self.temperature,
                max_tokens=self.max_tokens,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
            )
            raw = resp.choices[0].message.content
        else:  # anthropic
            resp = self._client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                system=system_prompt,
                messages=[{"role": "user", "content": user_prompt}],
            )
            raw = "".join(b.text for b in resp.content if getattr(b, "type", "") == "text")
        return parse_json_loose(raw), raw


def parse_json_loose(text):
    """Best-effort JSON parse: direct, then strip code fences, then first {...} block."""
    if not text:
        return None
    try:
        return json.loads(text)
    except Exception:
        pass
    t = text.strip()
    if t.startswith("```"):
        t = re.sub(r"^```[a-zA-Z]*\n", "", t)
        t = re.sub(r"\n```$", "", t).strip()
        try:
            return json.loads(t)
        except Exception:
            pass
    m = re.search(r"\{.*\}", text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(0))
        except Exception:
            return None
    return None
