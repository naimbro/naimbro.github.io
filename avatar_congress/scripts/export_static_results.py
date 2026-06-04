"""
Exportar una página ESTÁTICA de resultados para GitHub Pages.

Genera un único archivo autocontenido (datos embebidos, sin servidor):
  avatar_congress/resultados/index.html

Cada alumno escribe su llave y ve sus respuestas vs. las de su avatar
(3 versiones); además muestra la comparación de versiones y la distribución
por pregunta. Los datos son seudónimos (solo llaves, sin nombre/correo).

Uso:
  python avatar_congress/scripts/export_static_results.py
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common as C

OUT_DIR = C.PKG_DIR / "resultados"

TEMPLATE = r"""<!DOCTYPE html>
<html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Congreso de avatares — Resultados</title>
<style>
:root{--accent:#e8485f;--accent-soft:#fde8eb;--accent-dark:#c4283f;--ink:#1b1d21;--ink2:#4a4f57;--ink3:#8a9099;--line:#e7e9ee;}
*{box-sizing:border-box}body{margin:0;font-family:-apple-system,"Segoe UI",Roboto,sans-serif;color:var(--ink);background:#fff;font-size:17px;line-height:1.45}
header{padding:22px 28px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:14px;flex-wrap:wrap}
header h1{font-size:1.3rem;margin:0}
.tabs{display:flex;gap:6px;flex-wrap:wrap;margin-left:auto}
.tab{border:none;background:transparent;font:inherit;font-weight:600;color:var(--ink3);cursor:pointer;padding:8px 16px;border-radius:999px}
.tab.on{color:var(--accent);background:var(--accent-soft)}
main{max-width:1100px;margin:0 auto;padding:26px 28px 60px}
.panel{display:none}.panel.on{display:block}
.card{border:1px solid var(--line);border-radius:16px;padding:22px;box-shadow:0 8px 24px rgba(20,22,28,.05);margin-bottom:22px}
.section-title{font-weight:700;color:var(--ink2);margin-bottom:14px}
.sub{color:var(--ink3);font-size:.92rem;margin:.2em 0 1em}
.row{display:flex;gap:10px;flex-wrap:wrap}
input[type=text]{flex:1;min-width:200px;font:inherit;padding:11px 14px;border:1px solid var(--line);border-radius:10px}
button.go{font:inherit;font-weight:700;background:var(--accent);color:#fff;border:none;border-radius:10px;padding:11px 22px;cursor:pointer}
.vgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.vbox{position:relative;text-align:center;border:1px solid var(--line);border-radius:14px;padding:20px 12px}
.vbox.best{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent-soft)}
.crown{position:absolute;top:-10px;left:50%;transform:translateX(-50%);background:var(--accent);color:#fff;font-size:.7rem;font-weight:700;padding:2px 10px;border-radius:999px}
.vname{font-weight:700;color:var(--ink2);margin-bottom:6px}.vnum{font-size:2.2rem;font-weight:900;color:var(--accent)}
.vlbl{font-size:.78rem;color:var(--ink3)}.vextra{font-size:.8rem;color:var(--ink3);margin-top:6px}
.verdict{margin-top:16px;text-align:center;font-weight:600;color:var(--ink2)}
.vscores{display:flex;gap:12px;flex-wrap:wrap;margin:10px 0 14px}
.vsc{flex:1;min-width:110px;text-align:center;border:1px solid var(--line);border-radius:12px;padding:12px}
.vsc.best{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent-soft)}
.vsc .n{font-size:1.7rem;font-weight:900;color:var(--accent)}.vsc .l{font-size:.8rem;color:var(--ink2)}
.toggle{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
.tg{border:1px solid var(--line);background:#fff;color:var(--ink2);padding:6px 13px;border-radius:999px;cursor:pointer;font-size:.88rem}
.tg.on{background:var(--accent);color:#fff;border-color:var(--accent)}
table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:9px 8px;border-bottom:1px solid var(--line);font-size:.92rem;vertical-align:top}
th{color:var(--ink3);font-weight:600}.yes{color:#1f9d6b;font-weight:700}.no{color:var(--accent-dark);font-weight:700}
.dist-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:18px}
.dist-item{border:1px solid var(--line);border-radius:12px;padding:10px 12px}
.dhead{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:4px}
.dtitle{font-weight:700;color:var(--ink2);font-size:.9rem}
.badge{font-weight:800;font-size:.85rem;padding:2px 9px;border-radius:999px}
.badge.ok{background:#e3f3ea;color:#1f9d6b}.badge.mid{background:#fde7d6;color:#b3691a}.badge.low{background:#fde8eb;color:#c4283f}
.dist-item svg{width:100%;height:auto;display:block}
.scale{font-size:.8rem;color:var(--ink3);display:flex;flex-wrap:wrap;gap:4px 6px;align-items:center;margin:4px 0 16px}
.seg{display:inline-block;width:12px;height:12px;border-radius:3px;vertical-align:middle;margin-left:6px}
.muted{color:var(--ink3)}
</style></head>
<body>
<header>
  <h1>Congreso de avatares — Resultados</h1>
  <nav class="tabs">
    <button class="tab on" data-p="mine">Tu resultado</button>
    <button class="tab" data-p="variants">¿Qué versión representa mejor?</button>
    <button class="tab" data-p="dist">Pregunta por pregunta</button>
  </nav>
</header>
<main>
  <section id="mine" class="panel on">
    <div class="card">
      <div class="section-title">Escribe tu llave para ver tus resultados</div>
      <div class="row">
        <input id="key" type="text" placeholder="CONDOR-47" autocomplete="off" spellcheck="false">
        <button class="go" id="go">Ver</button>
      </div>
      <p id="msg" class="sub" hidden></p>
    </div>
    <div id="result" hidden>
      <div class="card">
        <div id="rkey" class="section-title"></div>
        <div class="sub">Representatividad de tu avatar por versión</div>
        <div id="rscores" class="vscores"></div>
        <p id="rsummary" class="muted"></p>
      </div>
      <div class="card">
        <div class="toggle" id="rtoggle"></div>
        <table><thead><tr><th>Pregunta</th><th>Tú</th><th>Tu avatar</th><th>¿=?</th><th>Conf.</th></tr></thead>
        <tbody id="rtbody"></tbody></table>
      </div>
    </div>
  </section>

  <section id="variants" class="panel">
    <div class="card">
      <div class="section-title">¿Qué versión del avatar representa mejor?</div>
      <p class="sub">Cerrado (cuanti) vs. abierto (cuali) vs. ambos. Réplica en miniatura de Park et al. (2024).</p>
      <div id="vgrid" class="vgrid"></div>
      <div id="verdict" class="verdict"></div>
    </div>
  </section>

  <section id="dist" class="panel">
    <div class="card">
      <div class="section-title">Distribución por pregunta: humanos vs. avatares</div>
      <div class="scale"><b>Likert:</b>
        <span class="seg" style="background:#d1495b"></span>1 muy en desacuerdo
        <span class="seg" style="background:#ea9085"></span>2
        <span class="seg" style="background:#cfd4db"></span>3
        <span class="seg" style="background:#7fb89a"></span>4
        <span class="seg" style="background:#1f9d6b"></span>5 muy de acuerdo
        <b style="margin-left:14px">A/B:</b>
        <span class="seg" style="background:#e8485f"></span>A
        <span class="seg" style="background:#5b8def"></span>B
      </div>
      <div id="dgrid" class="dist-grid"></div>
    </div>
  </section>
</main>
<script>
const DATA = /*DATA*/;
const A = DATA.analysis || {}, PS = DATA.per_student || {};
const VL={cerrado:"Cerrado (cuanti)",abierto:"Abierto (cuali)",ambos:"Ambos"};
const LC={"1":"#d1495b","2":"#ea9085","3":"#cfd4db","4":"#7fb89a","5":"#1f9d6b"},FC={"A":"#e8485f","B":"#5b8def"};
const $=s=>document.querySelector(s), $$=s=>[].slice.call(document.querySelectorAll(s));
const isN=v=>typeof v==="number"&&isFinite(v), num=(v,d)=>isN(v)?v:(d||0);
const pct=v=>isN(v)?Math.round(v*100)+"%":"–", fmt=(v,n)=>isN(v)?v.toFixed(n):"–";
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

$$(".tab").forEach(b=>b.addEventListener("click",()=>{
  $$(".tab").forEach(x=>x.classList.toggle("on",x===b));
  $$(".panel").forEach(p=>p.classList.toggle("on",p.id===b.dataset.p));
}));

// --- Tu resultado ---
$("#go").addEventListener("click",lookup);
$("#key").addEventListener("keydown",e=>{if(e.key==="Enter")lookup();});
function lookup(){
  const k=($("#key").value||"").trim().toUpperCase();
  const msg=$("#msg"),res=$("#result");
  if(!k){msg.hidden=false;msg.textContent="Escribe tu llave (ej. CONDOR-47).";res.hidden=true;return;}
  const d=PS[k];
  if(!d){msg.hidden=false;msg.textContent="No encontramos la llave \""+k+"\". Revisa que sea la misma que usaste.";res.hidden=true;return;}
  msg.hidden=true;res.hidden=false;
  $("#rkey").textContent=k;
  const vars=d.variants||{},order=["cerrado","abierto","ambos"].filter(v=>vars[v]);
  const best=d.best_variant&&vars[d.best_variant]?d.best_variant:(order[0]||null);
  $("#rscores").innerHTML=order.map(v=>{const s=vars[v];return '<div class="vsc'+(v===best?' best':'')+'"><div class="n">'+pct(s.score)+'</div><div class="l">'+esc(VL[v]||v)+(v===best?" ★":"")+'</div></div>';}).join("");
  $("#rtoggle").innerHTML=order.map(v=>'<button class="tg" data-v="'+v+'">'+esc(VL[v]||v)+'</button>').join("");
  $$("#rtoggle .tg").forEach(b=>b.addEventListener("click",()=>showVar(vars,b.dataset.v)));
  if(best)showVar(vars,best);
}
function showVar(vars,v){
  const s=vars[v];
  $$("#rtoggle .tg").forEach(b=>b.classList.toggle("on",b.dataset.v===v));
  $("#rsummary").textContent=s.summary||"";
  const rows=s.per_question||[];
  $("#rtbody").innerHTML=rows.length?rows.map(q=>"<tr><td>"+esc(q.text||q.question_id)+"</td><td>"+esc(q.human)+"</td><td>"+esc(q.avatar)+"</td><td>"+(q.agree?'<span class="yes">✓</span>':'<span class="no">✗</span>')+"</td><td>"+pct(q.confidence)+"</td></tr>").join(""):'<tr><td colspan="5" class="muted">Sin detalle.</td></tr>';
}

// --- Variantes ---
(function(){
  const vc=A.variant_comparison||{},best=A.best_variant_overall;
  $("#vgrid").innerHTML=["cerrado","abierto","ambos"].map(v=>{const d=vc[v]||{};const b=v===best;
    return '<div class="vbox'+(b?' best':'')+'">'+(b?'<div class="crown">mejor</div>':'')+'<div class="vname">'+esc(VL[v]||v)+'</div><div class="vnum">'+pct(d.mean_representativeness_score)+'</div><div class="vlbl">representatividad</div><div class="vextra">acuerdo '+pct(d.mean_directional_agreement)+' · MAE '+fmt(d.mean_likert_mae,2)+' · n='+num(d.n,0)+'</div></div>';}).join("");
  $("#verdict").textContent=best&&VL[best]?'La versión "'+VL[best]+'" representa mejor a los estudiantes en promedio.':"";
})();

// --- Pregunta por pregunta ---
(function(){
  const dists=A.per_question_distributions||[];const agree={};(A.per_question||[]).forEach(q=>agree[q.question_id]=q.directional_agreement);
  $("#dgrid").innerHTML=dists.length?dists.map(d=>dchart(d,agree)).join(""):'<span class="muted">Sin datos.</span>';
})();
function dchart(d,agree){
  const vals=d.values||[],lik=d.type==="likert_1_5",col=lik?LC:FC;
  const rows=[["Humanos",d.human||{}],["Avatares",d.avatar||{}]];
  const W=360,rh=30,gap=12,top=4,lw=74,pr=10,bw=W-lw-pr,H=top+rows.length*(rh+gap);
  let svg='<svg viewBox="0 0 '+W+' '+H+'">';
  rows.forEach((r,i)=>{const c=r[1].counts||{},nn=r[1].n||0,y=top+i*(rh+gap);
    svg+='<text x="0" y="'+(y+rh/2+4)+'" font-size="12" fill="#4a4f57">'+r[0]+'</text>';
    if(!nn){svg+='<rect x="'+lw+'" y="'+y+'" width="'+bw+'" height="'+rh+'" rx="5" fill="#f1f3f6"/>';return;}
    let x=lw;vals.forEach(v=>{const p=num(c[v],0)/nn,w=p*bw;if(w<=0.5)return;
      svg+='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+rh+'" fill="'+(col[v]||"#ccc")+'"><title>'+r[0]+' '+esc(v)+': '+Math.round(p*100)+'%</title></rect>';
      if(p>=0.13)svg+='<text x="'+(x+w/2)+'" y="'+(y+rh/2+4)+'" text-anchor="middle" font-size="11" fill="#23262b">'+esc(v)+'</text>';
      x+=w;});
    svg+='<rect x="'+lw+'" y="'+y+'" width="'+bw+'" height="'+rh+'" rx="5" fill="none" stroke="#e7e9ee"/>';});
  svg+='</svg>';
  const av=isN(agree[d.question_id])?agree[d.question_id]:null;
  const badge=av==null?"":'<span class="badge '+(av>=0.7?"ok":av>=0.45?"mid":"low")+'">'+pct(av)+'</span>';
  return '<div class="dist-item"><div class="dhead"><div class="dtitle">'+esc(d.question_id)+' · '+esc(d.theme||"")+'</div>'+badge+'</div>'+svg+'</div>';
}
</script>
</body></html>
"""


def main():
    ps = C.read_json(C.PER_STUDENT_PRIVATE) or {}
    agg = C.read_json(C.ANALYSIS_PUBLIC) or {}
    if not ps or not agg:
        C.die("Faltan resultados. Corre 08_analyze_results.py primero.")
    data = {"analysis": agg, "per_student": ps}
    html = TEMPLATE.replace("/*DATA*/", json.dumps(data, ensure_ascii=False))
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "index.html").write_text(html, encoding="utf-8")
    C.log(f"Página estática escrita: {OUT_DIR / 'index.html'}")
    C.log(f"  {len(ps)} alumnos · {agg.get('n_students_matched')} emparejados")
    print("\n  Tras commit + push, quedará en:")
    print("  https://naimbro.github.io/avatar_congress/resultados/")


if __name__ == "__main__":
    main()
