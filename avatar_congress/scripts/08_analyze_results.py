"""
08_analyze_results.py — Congreso de avatares.

Compares each student's own survey answers ("human") against the answers
produced by their trained LLM "avatar". The pipeline now builds THREE avatar
variants per student:
  - cerrado : trained on the closed/quantitative training answers only.
  - abierto : trained on the open/qualitative training answers only.
  - ambos   : trained on both.
Each variant answers the SAME 16-question survey. We compare each variant
against the single ("human") answer set for that key to see which
representation is most faithful — replicating Park et al. (2024), which found
that qualitative interviews predict people better than closed surveys.

There is exactly ONE human answer set per key, compared against ALL THREE
variants.

Inputs (via common.py path constants):
  - C.HUMAN_RAW         : wide CSV, one row per student key, columns Q01..Q17.
  - C.AVATAR_RESPONSES  : JSONL, one record per (key, variant, question_id).
                          Each record carries a "variant" field.
  - survey questions    : C.load_survey_questions().

Outputs:
  - C.ANALYSIS_PRIVATE    (CSV) : one row per (key, variant), scalar metrics.
  - C.PER_STUDENT_PRIVATE (JSON): dict keyed by student key, with each variant's
                                  per-question detail and a short Spanish
                                  summary, plus the best_variant for that key.
  - C.ANALYSIS_PUBLIC     (JSON): aggregate object for the dashboard. Contains
                                  NO individual human answers — only aggregates,
                                  the headline variant_comparison, and key->score
                                  lists (scores only). Detailed charts are
                                  computed on a single REFERENCE variant.
  - C.MATCHED_PRIVATE     (CSV) : long format (key, variant, question_id, ...).

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


# Avatar variants, in display order. "ambos" is the default reference variant
# used for the detailed (per-question / scatter / bias) charts.
VARIANTS = ["cerrado", "abierto", "ambos"]
REFERENCE_VARIANT = "ambos"


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
    Build {key: {variant: {question_id: record}}} from the avatar responses JSONL.
    Records carry a "variant" field; unknown/missing variants are skipped.
    Ignores malformed records (logs a warning).
    """
    by_key = {}
    bad = 0
    for rec in avatar_rows:
        try:
            key = rec.get("key")
            variant = rec.get("variant")
            qid = rec.get("question_id")
            if not key or not qid or variant not in VARIANTS:
                bad += 1
                continue
            by_key.setdefault(key, {}).setdefault(variant, {})[qid] = rec
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


# ── Per-(student, variant) analysis ────────────────────────────

# Spanish labels for each variant (for the summary template).
_VARIANT_LABEL = {
    "cerrado": "entrenado solo con tus respuestas cerradas (cuantitativas)",
    "abierto": "entrenado solo con tus respuestas abiertas (cualitativas)",
    "ambos": "entrenado con tus respuestas cerradas y abiertas",
}


def _summary_text(variant, score, dir_agree, likert_mae):
    """
    Spanish 1-2 sentence summary built from the numbers (no LLM call).
    Mentions which variant this is.
    """
    label = _VARIANT_LABEL.get(variant, f"variante {variant}")
    if score is None:
        return (f"El avatar {label} no tuvo suficientes respuestas comparables "
                f"para evaluarlo.")
    pct = round(score * 100)
    if score >= 0.8:
        quality = "representó muy bien tus posiciones"
    elif score >= 0.6:
        quality = "representó razonablemente bien tus posiciones"
    elif score >= 0.4:
        quality = "representó parcialmente tus posiciones"
    else:
        quality = "se distanció bastante de tus posiciones"
    parts = [f"El avatar {label} {quality} "
             f"(puntaje de representatividad {pct}%)."]
    if dir_agree is not None:
        da = round(dir_agree * 100)
        parts.append(f" Coincidió en la dirección de tu respuesta en {da}% de las preguntas")
        if likert_mae is not None:
            parts.append(f", con un error promedio de {round(likert_mae, 2)} puntos en las escalas Likert.")
        else:
            parts.append(".")
    return "".join(parts)


def analyze_variant(key, variant, human_row, avatar_q, scored_questions):
    """
    Compute all metrics for one (key, variant) pair.
    `avatar_q` is {question_id: record} for THIS variant.
    Returns (scalar_row, variant_obj, long_rows, extra) or None if the variant
    has no comparable answers at all.
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
            # one side missing: skip this question for this (key, variant)
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
            "variant": variant,
            "question_id": qid,
            "type": q["type"],
            "human": hv,
            "avatar": av,
            "agree": bool(agree),
            "confidence": "" if conf is None else conf,
        })

    if n_compared == 0:
        # No comparable answers for this variant: skip gracefully.
        return None

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
        "variant": variant,
        "n_questions_compared": n_compared,
        "exact_match_rate": _round(exact_match_rate),
        "likert_mae": _round(likert_mae),
        "likert_rmse": _round(likert_rmse),
        "directional_agreement": _round(directional_agreement),
        "avatar_confidence_mean": _round(avatar_confidence_mean),
        "representativeness_score": rep_score,
    }

    variant_obj = {
        "score": rep_score,
        "exact_match_rate": _round(exact_match_rate),
        "likert_mae": _round(likert_mae),
        "directional_agreement": _round(directional_agreement),
        "avatar_confidence_mean": _round(avatar_confidence_mean),
        "summary": _summary_text(variant, rep_score, directional_agreement, likert_mae),
        "per_question": per_q,
    }

    extra = {
        "tech_h": tech_h, "tech_a": tech_a,
        "proreg_h": proreg_h, "proreg_a": proreg_a,
        "moderation_bias": moderation_bias,
    }

    return scalar_row, variant_obj, long_rows, extra


# ── Aggregate analysis ─────────────────────────────────────────

def _variant_comparison(scalar_rows):
    """
    Headline experiment result: for each variant, mean of the key scalars over
    the students that have that variant (nulls ignored). This is what tells us
    which representation (cerrado / abierto / ambos) predicts people best.
    """
    out = {}
    for variant in VARIANTS:
        rows = [r for r in scalar_rows if r["variant"] == variant]
        out[variant] = {
            "n": len(rows),
            "mean_directional_agreement":
                _round(_mean([r["directional_agreement"] for r in rows])),
            "mean_likert_mae":
                _round(_mean([r["likert_mae"] for r in rows])),
            "mean_representativeness_score":
                _round(_mean([r["representativeness_score"] for r in rows])),
            "mean_exact_match_rate":
                _round(_mean([r["exact_match_rate"] for r in rows])),
        }
    return out


def _best_variant_overall(variant_comparison):
    """Variant with the highest mean_representativeness_score (None-safe)."""
    best = None
    best_score = None
    for variant in VARIANTS:
        s = variant_comparison.get(variant, {}).get("mean_representativeness_score")
        if s is None:
            continue
        if best_score is None or s > best_score:
            best_score = s
            best = variant
    return best


def build_aggregate(scored_questions, scalar_rows, ref_variant, ref_keys,
                    avatar_lookup, human_by_key, n_students_matched):
    """
    Build the public aggregate object. Uses only per-question pooled stats and
    per-(key,variant) scalars — no individual answers leak into the output.

    Detailed per-question / scatter / bias / confidence charts are computed on a
    single REFERENCE variant (`ref_variant`, over `ref_keys`) so the dashboard
    has one coherent set of figures. The headline variant_comparison covers all
    three variants.
    """
    n_scored = len(scored_questions)

    variant_comparison = _variant_comparison(scalar_rows)
    best_variant = _best_variant_overall(variant_comparison)

    # Scalars restricted to the reference variant (for "overall" and key lists).
    ref_scalars = [r for r in scalar_rows if r["variant"] == ref_variant]

    overall = {
        "mean_exact_match_rate": _round(_mean([r["exact_match_rate"] for r in ref_scalars])),
        "mean_likert_mae": _round(_mean([r["likert_mae"] for r in ref_scalars])),
        "mean_likert_rmse": _round(_mean([r["likert_rmse"] for r in ref_scalars])),
        "mean_directional_agreement": _round(_mean([r["directional_agreement"] for r in ref_scalars])),
        "mean_representativeness_score": _round(_mean([r["representativeness_score"] for r in ref_scalars])),
    }

    def _ref_rec(key, qid):
        return avatar_lookup.get(key, {}).get(ref_variant, {}).get(qid)

    # Per-question pooled stats across reference-variant students.
    per_question = []
    scatter_likert = []
    forced_support = []
    for q in scored_questions:
        qid = q["id"]
        humans, avatars = [], []
        exact_hits = []
        dir_hits = []
        for key in ref_keys:
            hv = _human_value(q, human_by_key[key])
            av, _ = _avatar_value(q, _ref_rec(key, qid))
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

    # Biases averaged across reference-variant students. Recomputed per-student
    # from the reference variant's answers (technocratic / pro_regulation indices
    # and moderation bias).
    mod_biases, tech_h_means, tech_a_means = [], [], []
    proreg_h_means, proreg_a_means = [], []
    for key in ref_keys:
        h_lik, a_lik = [], []
        th, ta, ph, pa = [], [], [], []
        for q in scored_questions:
            if q["type"] != "likert_1_5":
                continue
            qid = q["id"]
            hv = _human_value(q, human_by_key[key])
            av, _ = _avatar_value(q, _ref_rec(key, qid))
            if hv is None or av is None:
                continue
            h_lik.append(hv)
            a_lik.append(av)
            idx = q.get("indices") or []
            if "technocratic" in idx:
                th.append(hv)
                ta.append(av)
            if "pro_regulation" in idx:
                ph.append(hv)
                pa.append(av)
        if h_lik:
            mb_h = _mean([abs(v - 3) for v in h_lik])
            mb_a = _mean([abs(v - 3) for v in a_lik])
            mod_biases.append(mb_h - mb_a)
        tech_h_means.append(_mean(th))
        tech_a_means.append(_mean(ta))
        proreg_h_means.append(_mean(ph))
        proreg_a_means.append(_mean(pa))

    biases = {
        "moderation_bias_mean": _round(_mean(mod_biases)),
        "technocratic": {
            "human": _round(_mean(tech_h_means)),
            "avatar": _round(_mean(tech_a_means)),
        },
        "pro_regulation": {
            "human": _round(_mean(proreg_h_means)),
            "avatar": _round(_mean(proreg_a_means)),
        },
    }

    # confidence_vs_accuracy: bucket every scored reference-variant avatar answer
    # by confidence, report accuracy per bucket. Accuracy = exact match (integer
    # for likert, A/B for forced). This checks calibration: are confident answers
    # righter?
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
    for key in ref_keys:
        for q in scored_questions:
            qid = q["id"]
            rec = _ref_rec(key, qid)
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

    # key -> score lists (reference variant; scores only; pseudonymous keys OK).
    scored_keys = [{"key": r["key"], "score": r["representativeness_score"]}
                   for r in ref_scalars if r["representativeness_score"] is not None]
    scored_keys_sorted = sorted(scored_keys, key=lambda x: x["score"], reverse=True)
    top_keys = scored_keys_sorted[:5]
    least_keys = sorted(scored_keys, key=lambda x: x["score"])[:5]

    agg = {
        "n_students_matched": n_students_matched,
        "n_questions_scored": n_scored,
        "reference_variant": ref_variant,
        "variant_comparison": variant_comparison,
        "best_variant_overall": best_variant,
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


# ── Output field definitions ───────────────────────────────────

ANALYSIS_PRIVATE_FIELDS = [
    "key", "variant", "n_questions_compared", "exact_match_rate", "likert_mae",
    "likert_rmse", "directional_agreement", "avatar_confidence_mean",
    "representativeness_score",
]

MATCHED_PRIVATE_FIELDS = [
    "key", "variant", "question_id", "type", "human", "avatar", "agree",
    "confidence",
]


def _empty_variant_comparison():
    return {v: {
        "n": 0,
        "mean_directional_agreement": None,
        "mean_likert_mae": None,
        "mean_representativeness_score": None,
        "mean_exact_match_rate": None,
    } for v in VARIANTS}


# ── Empty / placeholder output ─────────────────────────────────

def write_empty_outputs(scored_questions):
    """Write valid placeholder outputs when there is no matched data."""
    n_scored = len(scored_questions)
    agg = {
        "n_students_matched": 0,
        "n_questions_scored": n_scored,
        "reference_variant": REFERENCE_VARIANT,
        "variant_comparison": _empty_variant_comparison(),
        "best_variant_overall": None,
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
    C.write_csv(C.ANALYSIS_PRIVATE, [], ANALYSIS_PRIVATE_FIELDS)
    C.write_json(C.PER_STUDENT_PRIVATE, {})
    C.write_json(C.ANALYSIS_PUBLIC, agg)
    C.write_csv(C.MATCHED_PRIVATE, [], MATCHED_PRIVATE_FIELDS)
    C.update_progress(matches_complete=0)


# ── Main ───────────────────────────────────────────────────────

def main():
    C.ensure_dirs()
    scored_questions, _q_by_id = _load_questions()
    C.log(f"Preguntas evaluables (scored): {len(scored_questions)}")
    C.log(f"Variantes de avatar: {', '.join(VARIANTS)}")

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

    # {key: {variant: {qid: record}}}
    avatar_lookup = _avatar_lookup(avatar_rows)

    # Matched keys = present in human data AND with at least one avatar variant.
    matched_keys = sorted(set(human_by_key) & set(avatar_lookup))
    C.log(f"Estudiantes con datos humanos + al menos una variante: {len(matched_keys)}")

    if not matched_keys:
        C.log("No hay datos emparejados (humano + avatar). Escribiendo salidas vacías.")
        write_empty_outputs(scored_questions)
        C.log("Listo (sin datos). Salida exitosa.")
        return

    scalar_rows = []        # one per (key, variant) with valid metrics
    per_student = {}        # key -> {best_variant, variants:{...}}
    long_rows = []
    matched_keys_with_data = set()  # keys that produced >=1 valid variant

    for key in matched_keys:
        human_row = human_by_key[key]
        variant_objs = {}
        variant_scores = {}
        for variant in VARIANTS:
            avatar_q = avatar_lookup.get(key, {}).get(variant)
            if not avatar_q:
                # This variant has no data for this key: skip gracefully.
                continue
            try:
                result = analyze_variant(
                    key, variant, human_row, avatar_q, scored_questions)
            except Exception as e:  # noqa: BLE001
                C.log(f"AVISO: fallo al analizar {key}/{variant} ({e}); se omite.")
                continue
            if result is None:
                # No comparable answers for this variant.
                continue
            scalar, vobj, longs, _extra = result
            scalar_rows.append(scalar)
            long_rows.extend(longs)
            variant_objs[variant] = vobj
            variant_scores[variant] = scalar["representativeness_score"]

        if not variant_objs:
            # No variant produced valid metrics for this key.
            continue

        matched_keys_with_data.add(key)

        # best_variant: highest representativeness_score among variants that have
        # a non-null score; fall back to first available variant if all null.
        scored_variants = {v: s for v, s in variant_scores.items() if s is not None}
        if scored_variants:
            best_variant = max(scored_variants, key=scored_variants.get)
        else:
            best_variant = next(iter(variant_objs))
        per_student[key] = {
            "best_variant": best_variant,
            "variants": variant_objs,
        }

    n_students_matched = len(matched_keys_with_data)

    if not scalar_rows:
        C.log("Ningún (estudiante, variante) produjo métricas válidas. "
              "Escribiendo salidas vacías.")
        write_empty_outputs(scored_questions)
        return

    # Reference variant for the detailed charts: prefer REFERENCE_VARIANT
    # ("ambos"); fall back to whichever variant actually has data.
    ref_variant = REFERENCE_VARIANT
    ref_keys = sorted(k for k in matched_keys_with_data
                      if ref_variant in avatar_lookup.get(k, {})
                      and any(r["key"] == k and r["variant"] == ref_variant
                              for r in scalar_rows))
    if not ref_keys:
        # Fall back to the variant with the most students.
        counts = {}
        for r in scalar_rows:
            counts[r["variant"]] = counts.get(r["variant"], 0) + 1
        ref_variant = max(counts, key=counts.get)
        ref_keys = sorted(r["key"] for r in scalar_rows if r["variant"] == ref_variant)
        C.log(f"AVISO: '{REFERENCE_VARIANT}' sin datos; usando variante de "
              f"referencia '{ref_variant}'.")

    agg = build_aggregate(scored_questions, scalar_rows, ref_variant, ref_keys,
                          avatar_lookup, human_by_key, n_students_matched)

    # ── Write outputs ──
    C.write_csv(C.ANALYSIS_PRIVATE, scalar_rows, ANALYSIS_PRIVATE_FIELDS)
    C.write_json(C.PER_STUDENT_PRIVATE, per_student)
    C.write_json(C.ANALYSIS_PUBLIC, agg)
    C.write_csv(C.MATCHED_PRIVATE, long_rows, MATCHED_PRIVATE_FIELDS)
    C.update_progress(matches_complete=n_students_matched)

    # ── Human-readable summary (aggregates only; no individual answers) ──
    vc = agg["variant_comparison"]
    C.log("── Resumen agregado ──")
    C.log(f"Estudiantes emparejados: {agg['n_students_matched']}")
    C.log(f"Preguntas evaluadas: {agg['n_questions_scored']}")
    C.log(f"Variante de referencia (gráficos): {agg['reference_variant']}")
    C.log("Comparación de variantes (representatividad media | acuerdo "
          "direccional | MAE Likert | exact-match | n):")
    for variant in VARIANTS:
        d = vc[variant]
        C.log(f"  {variant:8s}: rep={d['mean_representativeness_score']} | "
              f"dir={d['mean_directional_agreement']} | "
              f"mae={d['mean_likert_mae']} | "
              f"exact={d['mean_exact_match_rate']} | n={d['n']}")
    C.log(f"Mejor variante (representatividad media): {agg['best_variant_overall']}")
    o = agg["overall"]
    C.log(f"[ref={ref_variant}] R² Likert: {agg['aggregate_r2_likert']} | "
          f"R² forced: {agg['aggregate_r2_forced']} | "
          f"rep media: {o['mean_representativeness_score']}")
    C.log("Listo.")


if __name__ == "__main__":
    main()
