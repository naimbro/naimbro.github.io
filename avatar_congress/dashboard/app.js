/* Congreso de avatares — live classroom dashboard
   Pure vanilla JS. No frameworks, no libraries. */
(function () {
  "use strict";

  // ---------------------------------------------------------------
  // State & constants
  // ---------------------------------------------------------------
  const PUBLIC_MODE_DEFAULT = false;
  let PUBLIC_MODE = PUBLIC_MODE_DEFAULT;

  const POLL_MS = 1000;
  const REDUCED_MOTION = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const state = {
    eventsCursor: 0,
    activeKeys: new Set(),
    totals: { students: 0, questions: 0 },
    celebrated: false,
    analysisLoaded: false,
    currentTab: "live",
  };

  // Audio
  let audioCtx = null;
  let soundEnabled = false;
  let muted = false;

  // ---------------------------------------------------------------
  // Tiny DOM helpers
  // ---------------------------------------------------------------
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.prototype.slice.call(document.querySelectorAll(sel));

  function setText(sel, val) {
    const el = $(sel);
    if (el) el.textContent = val;
  }
  function num(v, d) { return (typeof v === "number" && isFinite(v)) ? v : (d === undefined ? 0 : d); }
  function pct(v) { return Math.round(num(v) * 100) + "%"; }
  function fmt(v, digits) {
    if (typeof v !== "number" || !isFinite(v)) return "–";
    return v.toFixed(digits === undefined ? 2 : digits);
  }
  function escapeHTML(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // ---------------------------------------------------------------
  // Fetch helper (defensive)
  // ---------------------------------------------------------------
  async function getJSON(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  }

  function showReconnecting(on) {
    const el = $("#reconnecting");
    if (el) el.hidden = !on;
  }

  // ---------------------------------------------------------------
  // Tabs
  // ---------------------------------------------------------------
  function initTabs() {
    $$(".tab").forEach((btn) => {
      btn.addEventListener("click", () => switchTab(btn.getAttribute("data-tab")));
    });
  }
  function switchTab(name) {
    state.currentTab = name;
    $$(".tab").forEach((b) => {
      const on = b.getAttribute("data-tab") === name;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    $$(".tabpanel").forEach((p) => {
      p.classList.toggle("is-active", p.id === "tab-" + name);
    });
    if (name === "analysis") loadAnalysis();
    if (name === "explore") refreshExploreMode();
  }

  // ---------------------------------------------------------------
  // Audio (Web Audio API)
  // ---------------------------------------------------------------
  function initAudio() {
    const enableBtn = $("#enable-sound");
    const muteBtn = $("#mute-toggle");
    if (enableBtn) {
      enableBtn.addEventListener("click", () => {
        try {
          audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
          if (audioCtx.state === "suspended") audioCtx.resume();
          soundEnabled = true;
          muted = false;
          enableBtn.hidden = true;
          if (muteBtn) { muteBtn.hidden = false; muteBtn.textContent = "Silenciar"; }
          beep();
        } catch (e) { /* ignore */ }
      });
    }
    if (muteBtn) {
      muteBtn.addEventListener("click", () => {
        muted = !muted;
        muteBtn.textContent = muted ? "Activar" : "Silenciar";
      });
    }
  }
  function beep() {
    if (!soundEnabled || muted || !audioCtx) return;
    try {
      const t = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(740, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.07, t + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.09);
    } catch (e) { /* ignore */ }
  }

  // ---------------------------------------------------------------
  // Config
  // ---------------------------------------------------------------
  async function loadConfig() {
    try {
      const cfg = await getJSON("/api/config");
      PUBLIC_MODE = !!(cfg && cfg.public_mode);
      if (cfg && cfg.totals) {
        state.totals.students = num(cfg.totals.students, 0);
        state.totals.questions = num(cfg.totals.questions, 0);
        updateStudentTotals();
      }
    } catch (e) {
      PUBLIC_MODE = PUBLIC_MODE_DEFAULT;
    }
    refreshExploreMode();
  }
  function updateStudentTotals() {
    $$(".c-students").forEach((el) => { el.textContent = state.totals.students; });
  }

  // ---------------------------------------------------------------
  // Progress
  // ---------------------------------------------------------------
  function applyProgress(p) {
    if (!p || typeof p !== "object") return;
    if (p.totals) {
      state.totals.students = num(p.totals.students, state.totals.students);
      state.totals.questions = num(p.totals.questions, state.totals.questions);
      updateStudentTotals();
    }
    const recv = num(p.avatar_responses_received, 0);
    const total = num(p.avatar_responses_total, 0);
    setText("#ar-recv", recv);
    setText("#ar-total", total);
    const fill = $("#ar-bar");
    if (fill) fill.style.width = (total > 0 ? Math.min(100, (recv / total) * 100) : 0) + "%";

    setText("#c-training", num(p.training_received, 0));
    setText("#c-built", num(p.avatars_built, 0));
    setText("#c-human", num(p.human_received, 0));

    if (total > 0 && recv >= total) maybeCelebrate(p);
  }

  // ---------------------------------------------------------------
  // Events stream
  // ---------------------------------------------------------------
  function applyEvents(payload) {
    if (!payload || !Array.isArray(payload.events)) {
      if (payload && typeof payload.next === "number") state.eventsCursor = payload.next;
      return;
    }
    payload.events.forEach(handleEvent);
    if (typeof payload.next === "number") state.eventsCursor = payload.next;
    else state.eventsCursor += payload.events.length;
  }

  function handleEvent(ev) {
    if (!ev || typeof ev !== "object") return;
    switch (ev.type) {
      case "avatar_start":
        if (ev.key) { state.activeKeys.add(ev.key); renderActiveKeys(); }
        break;
      case "avatar_done":
        if (ev.key) { state.activeKeys.delete(ev.key); renderActiveKeys(); }
        break;
      case "avatar_answer":
        addFeedCard(ev);
        beep();
        break;
      case "complete":
        maybeCelebrate(null);
        break;
      default:
        break;
    }
  }

  function renderActiveKeys() {
    const box = $("#active-keys");
    if (!box) return;
    if (state.activeKeys.size === 0) {
      box.innerHTML = '<span class="empty-hint">Esperando avatares…</span>';
      return;
    }
    const keys = Array.from(state.activeKeys);
    box.innerHTML = keys.map((k) => '<span class="keychip">' + escapeHTML(k) + "</span>").join("");
  }

  const MAX_FEED = 60;
  function addFeedCard(ev) {
    const feed = $("#feed");
    if (!feed) return;
    const empty = feed.querySelector(".feed-empty");
    if (empty) empty.remove();

    const key = ev.key || "?";
    const qid = ev.question_id || "";
    const label = ev.answer_label != null ? ev.answer_label
      : (ev.answer_value != null ? String(ev.answer_value) : "");
    const conf = (typeof ev.confidence === "number") ? ev.confidence : null;

    const card = document.createElement("div");
    card.className = "feed-card flash";
    let html =
      '<div class="fc-key">' + escapeHTML(key) + "</div>" +
      '<div class="fc-ans"><span class="qid">' + escapeHTML(qid) + "</span>" +
      '<span class="arrow">→</span>' + escapeHTML(label) + "</div>";
    if (conf != null) {
      const cp = Math.max(0, Math.min(100, Math.round(conf * 100)));
      html +=
        '<div class="fc-conf">' +
        '<span class="fc-conf-label">confianza ' + cp + "%</span>" +
        '<div class="fc-conf-bar"><div class="fc-conf-fill" style="width:' + cp + '%"></div></div>' +
        "</div>";
    }
    card.innerHTML = html;
    feed.insertBefore(card, feed.firstChild);

    // settle the flash
    if (!REDUCED_MOTION) {
      requestAnimationFrame(() => {
        setTimeout(() => card.classList.remove("flash"), 450);
      });
    } else {
      card.classList.remove("flash");
    }

    // trim
    while (feed.children.length > MAX_FEED) {
      feed.removeChild(feed.lastChild);
    }
  }

  // ---------------------------------------------------------------
  // Celebration
  // ---------------------------------------------------------------
  function maybeCelebrate(progress) {
    if (state.celebrated) return;
    state.celebrated = true;
    const el = $("#celebration");
    if (!el) return;
    const humans = progress ? num(progress.human_received, state.totals.students) : state.totals.students;
    const avatars = progress ? num(progress.avatars_built, state.totals.students) : state.totals.students;
    const sub = humans + " humanos + " + avatars + " avatares listos para comparar";
    setText("#celebration-sub", sub);
    el.hidden = false;
    if (!REDUCED_MOTION) startConfetti();
    // auto-dismiss on click
    el.addEventListener("click", () => { el.hidden = true; stopConfetti(); }, { once: true });
  }

  let confettiRAF = null;
  function startConfetti() {
    const canvas = $("#confetti");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const colors = ["#e8485f", "#c4283f", "#fde8eb", "#1f9d6b", "#ffd166", "#118ab2"];
    const N = 140;
    const parts = [];
    for (let i = 0; i < N; i++) {
      parts.push({
        x: Math.random() * canvas.width,
        y: -Math.random() * canvas.height,
        r: 4 + Math.random() * 7,
        c: colors[(Math.random() * colors.length) | 0],
        vy: 1.4 + Math.random() * 3,
        vx: -1 + Math.random() * 2,
        rot: Math.random() * Math.PI,
        vr: -0.1 + Math.random() * 0.2,
      });
    }
    const start = Date.now();
    function frame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      parts.forEach((p) => {
        p.y += p.vy; p.x += p.vx; p.rot += p.vr;
        if (p.y > canvas.height + 20) { p.y = -20; p.x = Math.random() * canvas.width; }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
        ctx.restore();
      });
      // fade out after 6s
      if (Date.now() - start < 9000) {
        confettiRAF = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    frame();
  }
  function stopConfetti() {
    if (confettiRAF) cancelAnimationFrame(confettiRAF);
    confettiRAF = null;
  }

  // ---------------------------------------------------------------
  // Polling loop
  // ---------------------------------------------------------------
  async function tick() {
    let ok = true;
    try {
      const p = await getJSON("/api/progress");
      applyProgress(p);
    } catch (e) { ok = false; }
    try {
      const ev = await getJSON("/api/events?since=" + state.eventsCursor);
      applyEvents(ev);
    } catch (e) { ok = false; }
    showReconnecting(!ok);
  }
  function startPolling() {
    tick();
    setInterval(tick, POLL_MS);
  }

  // ---------------------------------------------------------------
  // Analysis tab
  // ---------------------------------------------------------------
  async function loadAnalysis() {
    let a;
    try {
      a = await getJSON("/api/analysis");
    } catch (e) {
      a = null;
    }
    const emptyEl = $("#analysis-empty");
    const contentEl = $("#analysis-content");
    const ready = a && typeof a === "object" && num(a.n_students_matched, 0) > 0;
    if (!ready) {
      if (emptyEl) emptyEl.hidden = false;
      if (contentEl) contentEl.hidden = true;
      return;
    }
    if (emptyEl) emptyEl.hidden = true;
    if (contentEl) contentEl.hidden = false;
    state.analysisLoaded = true;
    renderAnalysis(a);
  }

  function renderAnalysis(a) {
    const o = a.overall || {};
    setText("#m-agree", isNum(o.mean_directional_agreement) ? pct(o.mean_directional_agreement) : "–");
    setText("#m-mae", isNum(o.mean_likert_mae) ? fmt(o.mean_likert_mae, 2) : "–");
    setText("#m-repr", isNum(o.mean_representativeness_score) ? pct(o.mean_representativeness_score) : "–");
    setText("#m-r2", isNum(a.aggregate_r2_likert) ? fmt(a.aggregate_r2_likert, 2) : "–");

    renderBarChart(Array.isArray(a.per_question) ? a.per_question : []);
    renderScatter(Array.isArray(a.scatter_likert) ? a.scatter_likert : []);

    fillCallout("#callout-best-text", "#callout-best-val", a.most_represented_question);
    fillCallout("#callout-worst-text", "#callout-worst-val", a.least_represented_question);

    renderKeyList("#list-top", a.top_representative_keys);
    renderKeyList("#list-least", a.least_representative_keys);
  }

  function isNum(v) { return typeof v === "number" && isFinite(v); }

  function fillCallout(textSel, valSel, q) {
    if (!q || typeof q !== "object") {
      setText(textSel, "–"); setText(valSel, "");
      return;
    }
    const t = q.text || q.question_id || "–";
    setText(textSel, (q.question_id ? q.question_id + " · " : "") + t);
    if (isNum(q.directional_agreement)) {
      setText(valSel, "Acuerdo direccional: " + pct(q.directional_agreement));
    } else {
      setText(valSel, "");
    }
  }

  function renderKeyList(sel, arr) {
    const el = $(sel);
    if (!el) return;
    if (!Array.isArray(arr) || arr.length === 0) {
      el.innerHTML = '<li><span class="empty-hint">Sin datos.</span></li>';
      return;
    }
    el.innerHTML = arr.map((item) => {
      const k = escapeHTML(item && item.key ? item.key : "?");
      const s = (item && isNum(item.score)) ? pct(item.score) : "–";
      return '<li><span class="kl-key">' + k + '</span><span class="kl-score">' + s + "</span></li>";
    }).join("");
  }

  // ---- SVG bar chart: directional_agreement per question ----
  function renderBarChart(perQ) {
    const wrap = $("#chart-bars");
    if (!wrap) return;
    if (!perQ.length) { wrap.innerHTML = '<span class="empty-hint">Sin datos.</span>'; return; }

    const data = perQ.slice().sort((x, y) =>
      String(x.question_id).localeCompare(String(y.question_id)));

    const W = Math.max(640, data.length * 64);
    const H = 360;
    const padL = 48, padR = 16, padT = 16, padB = 70;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const n = data.length;
    const gap = 0.28;
    const bw = plotW / n * (1 - gap);
    const step = plotW / n;

    let svg = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Acuerdo direccional por pregunta">';
    // gridlines + y labels (0..100%)
    for (let g = 0; g <= 4; g++) {
      const val = g / 4;
      const y = padT + plotH - val * plotH;
      svg += '<line x1="' + padL + '" y1="' + y + '" x2="' + (W - padR) + '" y2="' + y +
        '" stroke="#eef0f3" stroke-width="1"/>';
      svg += '<text x="' + (padL - 8) + '" y="' + (y + 4) + '" text-anchor="end" font-size="11" fill="#8a9099">' +
        Math.round(val * 100) + "%</text>";
    }
    data.forEach((d, i) => {
      const v = isNum(d.directional_agreement) ? Math.max(0, Math.min(1, d.directional_agreement)) : 0;
      const bh = v * plotH;
      const x = padL + i * step + (step - bw) / 2;
      const y = padT + plotH - bh;
      const color = agreementColor(v);
      svg += '<rect x="' + x + '" y="' + y + '" width="' + bw + '" height="' + bh +
        '" rx="4" fill="' + color + '"><title>' + escapeHTML(d.question_id) + ": " +
        Math.round(v * 100) + "%</title></rect>";
      svg += '<text x="' + (x + bw / 2) + '" y="' + (y - 6) + '" text-anchor="middle" font-size="11" fill="#4a4f57">' +
        Math.round(v * 100) + "%</text>";
      svg += '<text x="' + (x + bw / 2) + '" y="' + (H - padB + 22) +
        '" text-anchor="end" font-size="12" fill="#4a4f57" transform="rotate(-45 ' +
        (x + bw / 2) + " " + (H - padB + 22) + ')">' + escapeHTML(d.question_id) + "</text>";
    });
    svg += '<line x1="' + padL + '" y1="' + (padT + plotH) + '" x2="' + (W - padR) +
      '" y2="' + (padT + plotH) + '" stroke="#d5d9df" stroke-width="1.5"/>';
    svg += "</svg>";
    wrap.innerHTML = svg;
  }

  function agreementColor(v) {
    // 0 -> accent red, 1 -> green
    const a = { r: 0xe8, g: 0x48, b: 0x5f };
    const g = { r: 0x1f, g: 0x9d, b: 0x6b };
    const r = Math.round(a.r + (g.r - a.r) * v);
    const gg = Math.round(a.g + (g.g - a.g) * v);
    const b = Math.round(a.b + (g.b - a.b) * v);
    return "rgb(" + r + "," + gg + "," + b + ")";
  }

  // ---- SVG scatter: human_mean vs avatar_mean ----
  function renderScatter(pts) {
    const wrap = $("#chart-scatter");
    if (!wrap) return;
    if (!pts.length) { wrap.innerHTML = '<span class="empty-hint">Sin datos.</span>'; return; }

    const W = 560, H = 520;
    const pad = 56;
    const plotW = W - pad * 2;
    const plotH = H - pad * 2;
    const lo = 1, hi = 5;
    const sx = (v) => pad + ((v - lo) / (hi - lo)) * plotW;
    const sy = (v) => (H - pad) - ((v - lo) / (hi - lo)) * plotH;

    let svg = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Likert humano vs avatar">';
    // grid
    for (let t = lo; t <= hi; t++) {
      svg += '<line x1="' + sx(t) + '" y1="' + sy(lo) + '" x2="' + sx(t) + '" y2="' + sy(hi) +
        '" stroke="#f1f3f6" stroke-width="1"/>';
      svg += '<line x1="' + sx(lo) + '" y1="' + sy(t) + '" x2="' + sx(hi) + '" y2="' + sy(t) +
        '" stroke="#f1f3f6" stroke-width="1"/>';
      svg += '<text x="' + sx(t) + '" y="' + (H - pad + 22) + '" text-anchor="middle" font-size="12" fill="#8a9099">' + t + "</text>";
      svg += '<text x="' + (pad - 12) + '" y="' + (sy(t) + 4) + '" text-anchor="end" font-size="12" fill="#8a9099">' + t + "</text>";
    }
    // diagonal y = x
    svg += '<line x1="' + sx(lo) + '" y1="' + sy(lo) + '" x2="' + sx(hi) + '" y2="' + sy(hi) +
      '" stroke="#c9ced6" stroke-width="1.5" stroke-dasharray="6 6"/>';
    // axes
    svg += '<line x1="' + sx(lo) + '" y1="' + sy(lo) + '" x2="' + sx(hi) + '" y2="' + sy(lo) + '" stroke="#d5d9df" stroke-width="1.5"/>';
    svg += '<line x1="' + sx(lo) + '" y1="' + sy(lo) + '" x2="' + sx(lo) + '" y2="' + sy(hi) + '" stroke="#d5d9df" stroke-width="1.5"/>';
    // axis labels
    svg += '<text x="' + (pad + plotW / 2) + '" y="' + (H - 10) + '" text-anchor="middle" font-size="13" fill="#4a4f57">Media humana</text>';
    svg += '<text x="16" y="' + (pad + plotH / 2) + '" text-anchor="middle" font-size="13" fill="#4a4f57" transform="rotate(-90 16 ' + (pad + plotH / 2) + ')">Media avatar</text>';

    // points
    pts.forEach((p) => {
      if (!isNum(p.human_mean) || !isNum(p.avatar_mean)) return;
      const x = sx(p.human_mean), y = sy(p.avatar_mean);
      svg += '<circle cx="' + x + '" cy="' + y + '" r="7" fill="#e8485f" fill-opacity="0.78" stroke="#c4283f" stroke-width="1">' +
        '<title>' + escapeHTML(p.question_id) + ": humano " + fmt(p.human_mean, 2) +
        ", avatar " + fmt(p.avatar_mean, 2) + "</title></circle>";
      svg += '<text x="' + (x + 9) + '" y="' + (y - 8) + '" font-size="11" fill="#4a4f57">' + escapeHTML(p.question_id) + "</text>";
    });
    svg += "</svg>";
    wrap.innerHTML = svg;
  }

  // ---------------------------------------------------------------
  // Explore tab
  // ---------------------------------------------------------------
  function refreshExploreMode() {
    const pubEl = $("#explore-public");
    const privEl = $("#explore-private");
    if (pubEl) pubEl.hidden = !PUBLIC_MODE;
    if (privEl) privEl.hidden = PUBLIC_MODE;
  }

  function initExplore() {
    const btn = $("#key-go");
    const input = $("#key-input");
    if (btn) btn.addEventListener("click", doLookup);
    if (input) {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") doLookup();
      });
    }
  }

  async function doLookup() {
    if (PUBLIC_MODE) return;
    const input = $("#key-input");
    const msg = $("#student-msg");
    const result = $("#student-result");
    if (!input) return;
    const key = String(input.value || "").trim().toUpperCase();
    if (!key) {
      showStudentMsg("Ingresa una llave para buscar.");
      return;
    }
    showStudentMsg("Buscando…");
    if (result) result.hidden = true;

    let data;
    try {
      data = await getJSON("/api/student/" + encodeURIComponent(key));
    } catch (e) {
      showStudentMsg("No se pudo conectar con el servidor. Intenta de nuevo.");
      return;
    }
    if (data && data.public_mode) {
      PUBLIC_MODE = true;
      refreshExploreMode();
      return;
    }
    if (!data || !data.found) {
      showStudentMsg("No encontramos la llave \"" + key + "\". Revisa el formato (ej. CONDOR-47).");
      return;
    }
    if (msg) msg.hidden = true;
    renderStudent(data);
  }

  function showStudentMsg(text) {
    const msg = $("#student-msg");
    const result = $("#student-result");
    if (result) result.hidden = true;
    if (msg) { msg.hidden = false; msg.textContent = text; }
  }

  function renderStudent(d) {
    const result = $("#student-result");
    setText("#s-score", isNum(d.score) ? pct(d.score) : "–");
    setText("#s-key", d.key || "");
    setText("#s-summary", d.summary || "");
    setText("#s-exact", isNum(d.exact_match_rate) ? pct(d.exact_match_rate) : "–");
    setText("#s-mae", isNum(d.likert_mae) ? fmt(d.likert_mae, 2) : "–");
    setText("#s-dir", isNum(d.directional_agreement) ? pct(d.directional_agreement) : "–");
    setText("#s-conf", isNum(d.avatar_confidence_mean) ? pct(d.avatar_confidence_mean) : "–");

    const tbody = $("#s-tbody");
    if (tbody) {
      const rows = Array.isArray(d.per_question) ? d.per_question : [];
      if (!rows.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="qt-text empty-hint">Sin detalle por pregunta.</td></tr>';
      } else {
        tbody.innerHTML = rows.map((q) => {
          const text = escapeHTML(q.text || q.question_id || "");
          const human = q.human != null ? escapeHTML(q.human) : "–";
          const avatar = q.avatar != null ? escapeHTML(q.avatar) : "–";
          const agree = q.agree
            ? '<span class="agree-yes">✓</span>'
            : '<span class="agree-no">✗</span>';
          const conf = isNum(q.confidence) ? pct(q.confidence) : "–";
          return "<tr>" +
            '<td class="qt-text">' + text + "</td>" +
            "<td>" + human + "</td>" +
            "<td>" + avatar + "</td>" +
            "<td>" + agree + "</td>" +
            "<td>" + conf + "</td>" +
            "</tr>";
        }).join("");
      }
    }
    if (result) result.hidden = false;
  }

  // ---------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------
  function boot() {
    initTabs();
    initAudio();
    initExplore();
    loadConfig();
    startPolling();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
