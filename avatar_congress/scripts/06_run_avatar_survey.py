"""
06 · Ejecutar la encuesta de los avatares (llamadas al LLM).

Cada avatar (system prompt) responde las 16 preguntas evaluables. Escribe:
  data_private/avatar_responses_raw.jsonl   (1 línea por respuesta)
  data_runtime/live_events.jsonl            (stream para el dashboard)
  data_runtime/progress.json                (contadores)

Modos:
  --mode batch         (default) 1 request por estudiante (barato y rápido)
  --mode per-question  1 request por estudiante-pregunta

Uso:
  python avatar_congress/scripts/06_run_avatar_survey.py --mode batch
"""

import argparse
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common as C

# Serializa las escrituras a disco (respuestas, eventos, progreso) cuando
# los avatares corren en paralelo.
_WRITE_LOCK = threading.Lock()


def scored_questions(questions):
    return [q for q in questions if q.get("compare_as") in ("ordinal", "nominal")]


def allowed_for(q):
    """Return (allowed_values, label_map) for a scored question."""
    if q["type"] == "likert_1_5":
        return [1, 2, 3, 4, 5], {i: q["scale"][i] for i in range(1, 6)}
    if q["type"] == "forced_choice":
        return ["A", "B"], {"A": q["options"]["A"], "B": q["options"]["B"]}
    return [], {}


def questions_block(questions):
    lines = []
    for q in questions:
        if q["type"] == "likert_1_5":
            opts = "; ".join(f"{i}={q['scale'][i]}" for i in range(1, 6))
            lines.append(f"{q['id']} (escala 1-5): {q['text']}\n   Opciones: {opts}")
        else:
            lines.append(f"{q['id']} (elige A o B): {q['text']}\n   A) {q['options']['A']}\n   B) {q['options']['B']}")
    return "\n".join(lines)


BATCH_INSTR = (
    "Responde la siguiente encuesta COMO el avatar de esta persona. Devuelve "
    "JSON válido (sin markdown) con esta forma exacta:\n"
    '{{"key": "{key}", "answers": [{{"question_id": "Q01", "answer_value": <1-5 o "A"/"B">, '
    '"confidence": <0.0-1.0>, "rationale_short": "<máx 15 palabras>"}}, ...]}}\n\n'
    "Reglas: responde TODAS las preguntas Q01..Q{last}. Para preguntas de escala usa un "
    "entero 1-5. Para preguntas A/B usa exactamente \"A\" o \"B\". confidence refleja qué "
    "tan seguro estás de representar a la persona en esa pregunta.\n\n"
    "ENCUESTA:\n{block}"
)

PERQ_INSTR = (
    "Responde esta única pregunta COMO el avatar de la persona. Devuelve JSON válido "
    '(sin markdown): {{"answer_value": <1-5 o "A"/"B">, "confidence": <0.0-1.0>, '
    '"rationale_short": "<máx 15 palabras>"}}\n\n{q}'
)

FIX_SUFFIX = "\n\nIMPORTANTE: tu respuesta anterior no fue JSON válido o faltaron preguntas. Devuelve SOLO el JSON pedido, completo."


def coerce_value(q, raw):
    """Validate/coerce a model answer value to the allowed canonical value, or None."""
    allowed, _ = allowed_for(q)
    if q["type"] == "likert_1_5":
        try:
            v = int(round(float(raw)))
        except (TypeError, ValueError):
            return None
        return v if v in allowed else None
    else:
        s = str(raw).strip().upper()[:1]
        return s if s in allowed else None


def clamp_conf(c):
    try:
        c = float(c)
    except (TypeError, ValueError):
        return 0.5
    return max(0.0, min(1.0, c))


def record_answer(key, variant, q, value, confidence, rationale, model, delay):
    _, label_map = allowed_for(q)
    rec = {
        "key": key,
        "variant": variant,
        "question_id": q["id"],
        "question_text": q["text"],
        "answer_value": value,
        "answer_label": label_map.get(value, str(value)),
        "confidence": round(clamp_conf(confidence), 3),
        "rationale_short": (rationale or "")[:200],
        "model": model,
        "timestamp": C.now_iso(),
    }
    C.append_jsonl(C.AVATAR_RESPONSES, rec)
    C.emit_event({"type": "avatar_answer", "key": key, "variant": variant,
                  "question_id": q["id"], "question_text": q["text"],
                  "answer_value": value, "answer_label": rec["answer_label"],
                  "confidence": rec["confidence"]})
    if delay:
        time.sleep(delay)
    return rec


def run_batch(llm, avatars, questions, delay, retries):
    last_id = questions[-1]["id"].lstrip("Q")
    block = questions_block(questions)
    qmap = {q["id"]: q for q in questions}
    total_answers = 0
    for av in avatars:
        key, variant = av["key"], av.get("variant", "ambos")
        tag = f"{key}·{variant}"
        C.emit_event({"type": "avatar_start", "key": key, "variant": variant})
        user = BATCH_INSTR.format(key=key, last=last_id, block=block)
        answers = None
        for attempt in range(retries + 1):
            try:
                parsed, raw = llm.complete_json(av["system_prompt"],
                                                user + (FIX_SUFFIX if attempt else ""))
            except Exception as e:  # noqa
                C.log(f"  {tag}: error de transporte ({str(e)[:80]}), reintento…")
                time.sleep(2)
                continue
            if parsed and isinstance(parsed.get("answers"), list):
                got = {a.get("question_id"): a for a in parsed["answers"] if isinstance(a, dict)}
                if all(qid in got for qid in qmap):
                    answers = got
                    break
            C.log(f"  {tag}: respuesta inválida o incompleta (intento {attempt+1})")
        if not answers:
            C.log(f"  {tag}: SALTADO tras reintentos (se registra error).")
            C.emit_event({"type": "avatar_error", "key": key, "variant": variant})
            continue
        n_ok = 0
        for qid, q in qmap.items():
            a = answers.get(qid, {})
            val = coerce_value(q, a.get("answer_value"))
            if val is None:
                # valor inválido: marcar neutral/baja confianza para no romper el flujo
                val = 3 if q["type"] == "likert_1_5" else "A"
                a["confidence"] = min(clamp_conf(a.get("confidence", 0.3)), 0.3)
            record_answer(key, variant, q, val, a.get("confidence", 0.5),
                          a.get("rationale_short", ""), llm.model, delay)
            n_ok += 1
            total_answers += 1
        C.emit_event({"type": "avatar_done", "key": key, "variant": variant})
        C.update_progress(avatar_responses_received=total_answers)
        C.log(f"  {tag}: {n_ok} respuestas")
    return total_answers


def run_per_question(llm, avatars, questions, retries, concurrency=1):
    """Streaming real: una llamada al LLM por pregunta. Los avatares se
    procesan en paralelo (concurrency) para que sea rápido; dentro de cada
    avatar las preguntas van en orden. Las escrituras van bajo lock."""
    counter = {"n": 0}

    def answer_one(av, q):
        key, variant = av["key"], av.get("variant", "ambos")
        if q["type"] == "likert_1_5":
            qtext = (f"{q['text']}\nEscala 1-5: " +
                     "; ".join(f"{i}={q['scale'][i]}" for i in range(1, 6)))
        else:
            qtext = f"{q['text']}\nA) {q['options']['A']}\nB) {q['options']['B']}"
        user = PERQ_INSTR.format(q=qtext)
        val, conf, rat = None, 0.5, ""
        for attempt in range(retries + 1):
            try:  # la llamada al LLM va FUERA del lock (corre en paralelo)
                parsed, raw = llm.complete_json(av["system_prompt"],
                                                user + (FIX_SUFFIX if attempt else ""))
            except Exception as e:  # noqa
                time.sleep(2); continue
            if parsed:
                val = coerce_value(q, parsed.get("answer_value"))
                conf, rat = parsed.get("confidence", 0.5), parsed.get("rationale_short", "")
                if val is not None:
                    break
        if val is None:
            val = 3 if q["type"] == "likert_1_5" else "A"
            conf = min(clamp_conf(conf), 0.3)
        with _WRITE_LOCK:
            record_answer(key, variant, q, val, conf, rat, llm.model, 0)
            counter["n"] += 1
            C.update_progress(avatar_responses_received=counter["n"])

    def worker(av):
        key, variant = av["key"], av.get("variant", "ambos")
        with _WRITE_LOCK:
            C.emit_event({"type": "avatar_start", "key": key, "variant": variant})
        for q in questions:
            answer_one(av, q)
        with _WRITE_LOCK:
            C.emit_event({"type": "avatar_done", "key": key, "variant": variant})
        C.log(f"  {key}·{variant}: listo ({counter['n']} respuestas acumuladas)")

    if concurrency <= 1:
        for av in avatars:
            worker(av)
    else:
        with ThreadPoolExecutor(max_workers=concurrency) as ex:
            list(ex.map(worker, avatars))
    return counter["n"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--mode", choices=["batch", "per-question"], default=None)
    ap.add_argument("--limit", type=int, default=None, help="procesar solo N avatares (pruebas)")
    args = ap.parse_args()

    C.ensure_dirs()
    cfg = C.load_config()
    C.load_dotenv_keys(cfg)  # poblar os.environ con las API keys
    mode = args.mode or cfg.get("run", {}).get("mode", "batch")
    delay = float(cfg.get("llm", {}).get("event_delay_s", 0.35))
    retries = int(cfg.get("llm", {}).get("retries", 1))
    concurrency = int(cfg.get("llm", {}).get("concurrency", 5))

    avatars = C.read_jsonl(C.AVATAR_PROMPTS)
    if not avatars:
        C.die(f"No hay avatares en {C.AVATAR_PROMPTS}. Corre 04_build_avatar_prompts.py primero.")
    if args.limit:
        # Limita por alumno (llave), conservando sus 3 variantes.
        keep = []
        seen = []
        for av in avatars:
            if av["key"] not in seen:
                if len(seen) >= args.limit:
                    continue
                seen.append(av["key"])
            keep.append(av)
        avatars = keep
    questions = scored_questions(C.load_survey_questions())
    n_keys = len({av["key"] for av in avatars})

    # Reset runtime para un stream limpio
    C.reset_runtime()
    if C.AVATAR_RESPONSES.exists():
        C.AVATAR_RESPONSES.unlink()
    total_expected = len(avatars) * len(questions)   # incluye las 3 variantes
    C.update_progress(avatar_responses_received=0,
                      avatar_responses_total=total_expected,
                      avatars_built=n_keys,
                      totals={"students": cfg.get("class", {}).get("n_students", 23),
                              "questions": len(questions)})

    llm = C.LLMClient(cfg)
    conc_note = f" · concurrencia {concurrency}" if mode == "per-question" else ""
    C.log(f"Modo: {mode} · proveedor: {llm.provider} · modelo: {llm.model}{conc_note} · "
          f"{n_keys} alumnos × 3 variantes × {len(questions)} preguntas = {total_expected} respuestas")

    t0 = time.time()
    if mode == "batch":
        total = run_batch(llm, avatars, questions, delay, retries)
    else:
        total = run_per_question(llm, avatars, questions, retries, concurrency=concurrency)

    C.emit_event({"type": "complete"})
    C.update_progress(avatar_responses_received=total)
    C.log(f"Completado: {total}/{total_expected} respuestas en {time.time()-t0:.1f}s "
          f"-> {C.AVATAR_RESPONSES}")


if __name__ == "__main__":
    main()
