"""
08_analyze_results.py — Congreso de avatares.

Compares each student's own survey answers ("human") against the answers
produced by their trained LLM "avatar", and computes per-student and aggregate
representativeness metrics.

Inputs (via common.py path constants):
  - C.HUMAN_RAW         : wide CSV, one row per student key, columns Q01..Q17.
  - C.AVATAR_RESPONSES  : JSONL, one record per (key, question_id).
  - survey questions    : C.load_survey_questions().

Outputs:
  - C.ANALYSIS_PRIVATE   (CSV)  : one row per student key, scalar metrics.
  - C.PER_STUDENT_PRIVATE (JSON): dict keyed by student key, with per-question
                                  detail and a short Spanish summary.
  - C.ANALYSIS_PUBLIC    (JSON) : aggregate object for the dashboard. Contains
                                  NO individual human answers — only aggregates
                                  plus key->score lists (scores only).
  - C.MATCHED_PRIVATE    (CSV)  : long format (key, question_id, ...) for debug.

Privacy: only the public aggregate is safe to publish. It never includes any
individual human answer or free text — just aggregate stats and pseudonymous
key->score pairs (students recognize their own key).

Standard library only (no numpy/pandas).
"""

import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common as C  # noqa: E402


# ── Small stdlib stats helpers ─────────────────────────────────

def _mean(values):
    """Mean of a list of numbers, ignoring None. None if empty."""
    nums = [v for v in values if v is not None]
    if not nums:
        return None
    return sum(nums) / len(nums)


def _round(value, ndigits=3):
    if value is None:
        return None
    return round(value, ndigits)


def _to_int(value):
    """Coerce a likert cell to int 1..5, or None if not parseable/in range."""
    if value is None:
        return None
    s = str(value).strip()
    if s == "":
        return None
    try:
        n = int(float(s))
    except (ValueError, TypeError):
        return None
    if 1 <= n <= 5:
        return n
    return None


def _ab(value):
    """Coerce a forced-choice cell to 'A'/'B', or None."""
    if value is None:
        return None
    s = str(value).strip().upper()
    if s in ("A", "B"):
        return s
    return None


def _likert_sign(n):
    """Map a likert int to a directional sign label."""
    if n is None:
        return None
    if n <= 2:
        return "disagree"
    if n == 3:
        return "neutral"
    return "agree"


def _pearson_r2(xs, ys):
    """
    R^2 = r^2 of Pearson correlation between paired lists.
    Returns None if <2 points or zero variance in either list.
    """
    pairs = [(x, y) for x, y in zip(xs, ys) if x is not None and y is not None]
    n = len(pairs)
    if n < 2:
        return None
    xv = [p[0] for p in pairs]
    yv = [p[1] for p in pairs]
    mx = sum(xv) / n
    my = sum(yv) / n
    sxx = sum((x - mx) ** 2 for x in xv)
    syy = sum((y - my) ** 2 for y in yv)
    sxy = sum((x - mx) * (y - my) for x, y in zip(xv, yv))
    if sxx <= 0 or syy <= 0:
        return None
    r = sxy / math.sqrt(sxx * syy)
    return r * r


# ── Loading & matching ─────────────────────────────────────────

def _load_questions():
    """
    Returns (scored_questions, q_by_id).
    scored_questions: list of question dicts with compare_as in ordinal/nominal,
    in YAML order. Skips free_text/none (Q17).
    """
    questions = C.load_survey_questions()
    scored = [q for q in questions if q.get("compare_as") in ("ordinal", "nominal")]
    q_by_id = {q["id"]: q for q in questions}
    return scored, q_by_id


def _avatar_lookup(avatar_rows):
    """
    Build {key: {question_id: record}} from the avatar responses JSONL.
    Ignores malformed records (logs a warning).
    """
    by_key = {}
    bad = 0
    for rec in avatar_rows:
        try:
            key = rec.get("key")
            qid = rec.get("question_id")
            if not key or not qid:
                bad += 1
                continue
            by_key.setdefault(key, {})[qid] = rec
        except Exception as e:  # noqa: BLE001
            bad += 1
            C.log(f"AVISO: registro de avatar inválido omitido ({e}).")
    if bad:
        C.log(f"AVISO: {bad} registros de avatar inválidos omitidos.")
    return by_key


# ── Per-question value extraction ──────────────────────────────

def _human_value(question, row):
    """Extract typed human value for a question from a wide CSV row."""
    raw = row.get(question["id"])
    if question["type"] == "likert_1_5":
        return _to_int(raw)
    if question["type"] == "forced_choice":
        return _ab(raw)
    return None


def _avatar_value(question, rec):
    """Extract typed avatar value from an avatar record."""
    if rec is None:
        return None, None
    val = rec.get("answer_value")
    conf = rec.get("confidence")
    try:
        conf = float(conf) if conf is not None else None
    except (ValueError, TypeError):
        conf = None
    if question["type"] == "likert_1_5":
        return _to_int(val), conf
    if question["type"] == "forced_choice":
        return _ab(val), conf
    return None, conf


# ── Per-student analysis ───────────────────────────────────────

def _summary_text(score, dir_agree, likert_mae):
    """
    Spanish 1-2 sentence summary built from the numbers (no LLM call).
    """
    if score is None:
        return "No hubo suficientes respuestas comparables para evaluar tu avatar."
    pct = round(score * 100)
    if score >= 0.8:
        quality = "representó muy bien tus posiciones"
    elif score >= 0.6:
        quality = "representó razonablemente bien tus posiciones"
    elif score >= 0.4:
        quality = "representó parcialmente tus posiciones"
    else:
        quality = "se distanció bastante de tus posiciones"
    parts = [f"Tu avatar {quality} (puntaje de representatividad {pct}%)."]
    if dir_agree is not None:
        da = round(dir_agree * 100)
        parts.append(f"Coincidió en la dirección de tu respuesta en {da}% de las preguntas")
        if likert_mae is not None:
            parts.append(f", con un error promedio de {round(likert_mae, 2)} puntos en las escalas Likert.")
        else:
            parts.append(".")
    return "".join(parts)


def analyze_student(key, human_row, avatar_q, scored_questions):
    """
    Compute all per-student metrics for one matched key.
    Returns (scalar_row, per_student_obj, matched_long_rows).
    """
    fc_exact = []          # forced-choice exact matches (bool)
    likert_abs_err = []    # |human - avatar| per likert
    likert_sq_err = []     # squared error per likert
    dir_agrees = []        # directional agreement per scored question
    confidences = []       # avatar confidence per answered scored question
    human_likert = []      # human likert ints (answered both)
    avatar_likert = []     # avatar likert ints (answered both)
    tech_h, tech_a = [], []
    proreg_h, proreg_a = [], []

    per_q = []
    long_rows = []
    n_compared = 0

    for q in scored_questions:
        qid = q["id"]
        rec = avatar_q.get(qid)
        hv = _human_value(q, human_row)
        av, conf = _avatar_value(q, rec)

        if hv is None or av is None:
            # one side missing: skip this question for this student
            continue

        n_compared += 1
        if conf is not None:
            confidences.append(conf)

        if q["type"] == "forced_choice":
            agree = (hv == av)
            fc_exact.append(agree)
            dir_agrees.append(agree)
        else:  # likert_1_5
            err = abs(hv - av)
            likert_abs_err.append(err)
            likert_sq_err.append(err * err)
            human_likert.append(hv)
            avatar_likert.append(av)
            agree = (_likert_sign(hv) == _likert_sign(av))
            dir_agrees.append(agree)
            idx = q.get("indices") or []
            if "technocratic" in idx:
                tech_h.append(hv)
                tech_a.append(av)
            if "pro_regulation" in idx:
                proreg_h.append(hv)
                proreg_a.append(av)

        per_q.append({
            "question_id": qid,
            "theme": q.get("theme"),
            "text": q.get("text"),
            "type": q["type"],
            "human": hv,
            "avatar": av,
            "agree": bool(agree),
            "confidence": conf,
        })
        long_rows.append({
            "key": key,
            "question_id": qid,
            "type": q["type"],
            "human": hv,
            "avatar": av,
            "agree": bool(agree),
            "confidence": "" if conf is None else conf,
        })

    exact_match_rate = _mean(fc_exact)
    likert_mae = _mean(likert_abs_err)
    likert_rmse = math.sqrt(_mean(likert_sq_err)) if likert_sq_err else None
    directional_agreement = _mean(dir_agrees)
    avatar_confidence_mean = _mean(confidences)

    # representativeness_score: composite in [0,1].
    #   0.6 * directional_agreement + 0.4 * (1 - (likert_mae or 0)/4)
    # The likert MAE term is normalized by 4 (max possible error on a 1..5 scale)
    # and inverted so that lower error -> higher score. If no likert answered,
    # likert_mae is treated as 0 (the MAE term contributes its full 0.4).
    rep_score = None
    if directional_agreement is not None:
        mae_term = 1 - (likert_mae if likert_mae is not None else 0) / 4
        rep_score = round(0.6 * directional_agreement + 0.4 * mae_term, 3)

    # moderation_bias: mean(|human-3|) - mean(|avatar-3|) over likert.
    # Positive => avatar more moderate (closer to 3) than human.
    moderation_bias = None
    if human_likert:
        mb_h = _mean([abs(v - 3) for v in human_likert])
        mb_a = _mean([abs(v - 3) for v in avatar_likert])
        moderation_bias = mb_h - mb_a

    scalar_row = {
        "key": key,
        "n_questions_compared": n_compared,
        "exact_match_rate": _round(exact_match_rate),
        "likert_mae": _round(likert_mae),
        "likert_rmse": _round(likert_rmse),
        "directional_agreement": _round(directional_agreement),
        "avatar_confidence_mean": _round(avatar_confidence_mean),
        "representativeness_score": rep_score,
        "moderation_bias": _round(moderation_bias),
        "technocratic_human": _round(_mean(tech_h)),
        "technocratic_avatar": _round(_mean(tech_a)),
        "pro_regulation_human": _round(_mean(proreg_h)),
        "pro_regulation_avatar": _round(_mean(proreg_a)),
    }

    per_student_obj = {
        "score": rep_score,
        "exact_match_rate": _round(exact_match_rate),
        "likert_mae": _round(likert_mae),
        "directional_agreement": _round(directional_agreement),
        "avatar_confidence_mean": _round(avatar_confidence_mean),
        "summary": _summary_text(rep_score, directional_agreement, likert_mae),
        "per_question": per_q,
    }

    return scalar_row, per_student_obj, long_rows, {
        "tech_h": tech_h, "tech_a": tech_a,
        "proreg_h": proreg_h, "proreg_a": proreg_a,
        "moderation_bias": moderation_bias,
    }


# ── Aggregate analysis ─────────────────────────────────────────

def build_aggregate(scored_questions, scalar_rows, matched, avatar_lookup,
                    human_by_key):
    """
    Build the public aggregate object. Uses only per-question pooled stats and
    per-student scalars — no individual answers leak into the output.
    """
    n_students = len(scalar_rows)
    n_scored = len(scored_questions)

    overall = {
        "mean_exact_match_rate": _round(_mean([r["exact_match_rate"] for r in scalar_rows])),
        "mean_likert_mae": _round(_mean([r["likert_mae"] for r in scalar_rows])),
        "mean_likert_rmse": _round(_mean([r["likert_rmse"] for r in scalar_rows])),
        "mean_directional_agreement": _round(_mean([r["directional_agreement"] for r in scalar_rows])),
        "mean_representativeness_score": _round(_mean([r["representativeness_score"] for r in scalar_rows])),
    }

    # Per-question pooled stats across all matched students.
    per_question = []
    scatter_likert = []
    forced_support = []
    for q in scored_questions:
        qid = q["id"]
        humans, avatars = [], []
        exact_hits = []
        dir_hits = []
        for key in matched:
            hv = _human_value(q, human_by_key[key])
            av, _ = _avatar_value(q, avatar_lookup.get(key, {}).get(qid))
            if hv is None or av is None:
                continue
            humans.append(hv)
            avatars.append(av)
            exact_hits.append(hv == av)
            if q["type"] == "forced_choice":
                dir_hits.append(hv == av)
            else:
                dir_hits.append(_likert_sign(hv) == _likert_sign(av))

        n = len(humans)
        entry = {
            "question_id": qid,
            "theme": q.get("theme"),
            "text": q.get("text"),
            "type": q["type"],
            "match_rate": _round(_mean(exact_hits)),
            "directional_agreement": _round(_mean(dir_hits)),
            "n": n,
        }
        if q["type"] == "likert_1_5":
            h_mean = _mean(humans)
            a_mean = _mean(avatars)
            entry["human_mean"] = _round(h_mean)
            entry["avatar_mean"] = _round(a_mean)
            entry["mae"] = _round(_mean([abs(h - a) for h, a in zip(humans, avatars)]))
            scatter_likert.append({
                "question_id": qid,
                "human_mean": _round(h_mean),
                "avatar_mean": _round(a_mean),
            })
        else:  # forced_choice
            h_support = _mean([1.0 if v == "A" else 0.0 for v in humans])
            a_support = _mean([1.0 if v == "A" else 0.0 for v in avatars])
            entry["human_support_A"] = _round(h_support)
            entry["avatar_support_A"] = _round(a_support)
            forced_support.append({
                "question_id": qid,
                "human_support_A": _round(h_support),
                "avatar_support_A": _round(a_support),
            })
        per_question.append(entry)

    # most / least represented question by directional_agreement.
    rated = [e for e in per_question if e["directional_agreement"] is not None]
    most_rep = least_rep = None
    if rated:
        best = max(rated, key=lambda e: e["directional_agreement"])
        worst = min(rated, key=lambda e: e["directional_agreement"])
        most_rep = {"question_id": best["question_id"], "text": best["text"],
                    "directional_agreement": best["directional_agreement"]}
        least_rep = {"question_id": worst["question_id"], "text": worst["text"],
                     "directional_agreement": worst["directional_agreement"]}

    # R^2 of avatar per-question mean predicting human per-question mean (likert).
    r2_likert = _pearson_r2(
        [s["avatar_mean"] for s in scatter_likert],
        [s["human_mean"] for s in scatter_likert],
    )
    # R^2 for forced-choice support.
    r2_forced = _pearson_r2(
        [s["avatar_support_A"] for s in forced_support],
        [s["human_support_A"] for s in forced_support],
    )

    # Biases averaged across students.
    biases = {
        "moderation_bias_mean": _round(_mean([r["moderation_bias"] for r in scalar_rows])),
        "technocratic": {
            "human": _round(_mean([r["technocratic_human"] for r in scalar_rows])),
            "avatar": _round(_mean([r["technocratic_avatar"] for r in scalar_rows])),
        },
        "pro_regulation": {
            "human": _round(_mean([r["pro_regulation_human"] for r in scalar_rows])),
            "avatar": _round(_mean([r["pro_regulation_avatar"] for r in scalar_rows])),
        },
    }

    # confidence_vs_accuracy: bucket every scored avatar answer by confidence,
    # report accuracy per bucket. Accuracy = exact match (integer for likert,
    # A/B for forced). This checks calibration: are confident answers righter?
    #
    # F1 note: for forced-choice we deliberately use accuracy, not F1. With two
    # mutually exclusive, jointly exhaustive binary categories (A vs B), the
    # positive and negative classes are perfectly coupled, so macro/micro F1
    # collapses to accuracy (cf. Gudiño et al. reasoning on coupled binary
    # categories). Accuracy is the honest, interpretable scalar here.
    buckets = {
        "low": {"n": 0, "hits": 0},
        "mid": {"n": 0, "hits": 0},
        "high": {"n": 0, "hits": 0},
    }
    for key in matched:
        for q in scored_questions:
            qid = q["id"]
            rec = avatar_lookup.get(key, {}).get(qid)
            hv = _human_value(q, human_by_key[key])
            av, conf = _avatar_value(q, rec)
            if hv is None or av is None or conf is None:
                continue
            if conf < 0.5:
                b = "low"
            elif conf <= 0.8:
                b = "mid"
            else:
                b = "high"
            buckets[b]["n"] += 1
            if hv == av:  # exact match (integer for likert, A/B for forced)
                buckets[b]["hits"] += 1
    confidence_vs_accuracy = {}
    for name, d in buckets.items():
        acc = (d["hits"] / d["n"]) if d["n"] else None
        confidence_vs_accuracy[name] = {"n": d["n"], "accuracy": _round(acc)}

    # key -> score lists (scores only; pseudonymous keys are OK to publish).
    scored_keys = [{"key": r["key"], "score": r["representativeness_score"]}
                   for r in scalar_rows if r["representativeness_score"] is not None]
    scored_keys_sorted = sorted(scored_keys, key=lambda x: x["score"], reverse=True)
    top_keys = scored_keys_sorted[:5]
    least_keys = sorted(scored_keys, key=lambda x: x["score"])[:5]

    agg = {
        "n_students_matched": n_students,
        "n_questions_scored": n_scored,
        "overall": overall,
        "per_question": per_question,
        "most_represented_question": most_rep,
        "least_represented_question": least_rep,
        "scatter_likert": scatter_likert,
        "aggregate_r2_likert": _round(r2_likert),
        "forced_support": forced_support,
        "aggregate_r2_forced": _round(r2_forced),
        "biases": biases,
        "confidence_vs_accuracy": confidence_vs_accuracy,
        "top_representative_keys": top_keys,
        "least_representative_keys": least_keys,
        "updated_at": C.now_iso(),
    }
    return agg


# ── Empty / placeholder output ─────────────────────────────────

def write_empty_outputs(scored_questions):
    """Write valid placeholder outputs when there is no matched data."""
    n_scored = len(scored_questions)
    agg = {
        "n_students_matched": 0,
        "n_questions_scored": n_scored,
        "overall": {
            "mean_exact_match_rate": None,
            "mean_likert_mae": None,
            "mean_likert_rmse": None,
            "mean_directional_agreement": None,
            "mean_representativeness_score": None,
        },
        "per_question": [],
        "most_represented_question": None,
        "least_represented_question": None,
        "scatter_likert": [],
        "aggregate_r2_likert": None,
        "forced_support": [],
        "aggregate_r2_forced": None,
        "biases": {
            "moderation_bias_mean": None,
            "technocratic": {"human": None, "avatar": None},
            "pro_regulation": {"human": None, "avatar": None},
        },
        "confidence_vs_accuracy": {
            "low": {"n": 0, "accuracy": None},
            "mid": {"n": 0, "accuracy": None},
            "high": {"n": 0, "accuracy": None},
        },
        "top_representative_keys": [],
        "least_representative_keys": [],
        "updated_at": C.now_iso(),
    }
    fieldnames = [
        "key", "n_questions_compared", "exact_match_rate", "likert_mae",
        "likert_rmse", "directional_agreement", "avatar_confidence_mean",
        "representativeness_score", "moderation_bias", "technocratic_human",
        "technocratic_avatar", "pro_regulation_human", "pro_regulation_avatar",
    ]
    C.write_csv(C.ANALYSIS_PRIVATE, [], fieldnames)
    C.write_json(C.PER_STUDENT_PRIVATE, {})
    C.write_json(C.ANALYSIS_PUBLIC, agg)
    C.write_csv(C.MATCHED_PRIVATE, [],
                ["key", "question_id", "type", "human", "avatar", "agree", "confidence"])
    C.update_progress(matches_complete=0)


# ── Main ───────────────────────────────────────────────────────

def main():
    C.ensure_dirs()
    scored_questions, _q_by_id = _load_questions()
    C.log(f"Preguntas evaluables (scored): {len(scored_questions)}")

    human_rows = C.read_csv(C.HUMAN_RAW)
    avatar_rows = C.read_jsonl(C.AVATAR_RESPONSES)
    C.log(f"Filas humanas: {len(human_rows)} | registros de avatar: {len(avatar_rows)}")

    # Index human rows by key (last write wins on duplicate keys).
    human_by_key = {}
    for row in human_rows:
        key = (row.get("key") or "").strip()
        if not key:
            C.log("AVISO: fila humana sin 'key' omitida.")
            continue
        human_by_key[key] = row

    avatar_lookup = _avatar_lookup(avatar_rows)

    # Matched = keys present in BOTH human and avatar data.
    matched_keys = sorted(set(human_by_key) & set(avatar_lookup))
    C.log(f"Estudiantes con datos en ambos lados (matched): {len(matched_keys)}")

    if not matched_keys:
        C.log("No hay datos emparejados (humano + avatar). Escribiendo salidas vacías.")
        write_empty_outputs(scored_questions)
        C.log("Listo (sin datos). Salida exitosa.")
        return

    scalar_rows = []
    per_student = {}
    long_rows = []
    # `matched` mirrors matched_keys but as a dict so build_aggregate can iterate.
    matched = {}

    for key in matched_keys:
        try:
            scalar, obj, longs, _extra = analyze_student(
                key, human_by_key[key], avatar_lookup.get(key, {}), scored_questions)
        except Exception as e:  # noqa: BLE001
            C.log(f"AVISO: fallo al analizar a {key} ({e}); se omite.")
            continue
        scalar_rows.append(scalar)
        per_student[key] = obj
        long_rows.extend(longs)
        matched[key] = True

    if not scalar_rows:
        C.log("Ningún estudiante produjo métricas válidas. Escribiendo salidas vacías.")
        write_empty_outputs(scored_questions)
        return

    agg = build_aggregate(scored_questions, scalar_rows, matched,
                          avatar_lookup, human_by_key)

    # ── Write outputs ──
    fieldnames = [
        "key", "n_questions_compared", "exact_match_rate", "likert_mae",
        "likert_rmse", "directional_agreement", "avatar_confidence_mean",
        "representativeness_score", "moderation_bias", "technocratic_human",
        "technocratic_avatar", "pro_regulation_human", "pro_regulation_avatar",
    ]
    C.write_csv(C.ANALYSIS_PRIVATE, scalar_rows, fieldnames)
    C.write_json(C.PER_STUDENT_PRIVATE, per_student)
    C.write_json(C.ANALYSIS_PUBLIC, agg)
    C.write_csv(C.MATCHED_PRIVATE, long_rows,
                ["key", "question_id", "type", "human", "avatar", "agree", "confidence"])
    C.update_progress(matches_complete=len(scalar_rows))

    # ── Human-readable summary (aggregates only; no individual answers) ──
    o = agg["overall"]
    C.log("── Resumen agregado ──")
    C.log(f"Estudiantes emparejados: {agg['n_students_matched']}")
    C.log(f"Preguntas evaluadas: {agg['n_questions_scored']}")
    C.log(f"Representatividad media: {o['mean_representativeness_score']}")
    C.log(f"Acuerdo direccional medio: {o['mean_directional_agreement']}")
    C.log(f"MAE Likert medio: {o['mean_likert_mae']} | RMSE: {o['mean_likert_rmse']}")
    C.log(f"R² Likert (avatar->humano): {agg['aggregate_r2_likert']} | "
          f"R² forced: {agg['aggregate_r2_forced']}")
    if agg["most_represented_question"]:
        C.log(f"Pregunta mejor representada: {agg['most_represented_question']['question_id']}")
    if agg["least_represented_question"]:
        C.log(f"Pregunta con mayor distancia: {agg['least_represented_question']['question_id']}")
    C.log("Listo.")


if __name__ == "__main__":
    main()
