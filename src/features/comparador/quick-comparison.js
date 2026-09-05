// Migrated from Hub v1. Review domain assumptions separately from interface changes.

(function () {
  function num(v) {
    v = ("" + v).replace(/[^0-9.,-]/g, "").replace(",", ".");
    var n = parseFloat(v);
    return isFinite(n) ? n : 0;
  }
  function pp(n) {
    return n.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  var mode = "nom";
  function applyMode() {
    var inf = document.getElementById("jrInf");
    if (!inf) return;
    var card = inf.closest(".card");
    if (!card) return;
    card.querySelectorAll("[data-jrmode]").forEach(function (b) {
      b.classList.toggle("on", b.getAttribute("data-jrmode") === mode);
    });
    card.querySelectorAll("[data-jrf]").forEach(function (f) {
      f.style.display = f.getAttribute("data-jrf") === mode ? "" : "none";
    });
  }
  function render() {
    var grid = document.getElementById("jrGrid");
    if (!grid) return;
    var inf = num((document.getElementById("jrInf") || {}).value);
    var nom,
      extra = "";
    if (mode === "cdi") {
      var cdi = num((document.getElementById("jrCdi") || {}).value),
        pct = num((document.getElementById("jrPct") || {}).value);
      nom = (cdi * pct) / 100;
      extra =
        '<div style="font-size:11.5px;color:var(--muted);text-align:center;margin-top:8px">' +
        pp(pct) +
        "% do CDI (" +
        pp(cdi) +
        "% a.a.) = taxa nominal de " +
        pp(nom) +
        "% a.a.</div>";
    } else {
      nom = num((document.getElementById("jrNom") || {}).value);
    }
    var real = ((1 + nom / 100) / (1 + inf / 100) - 1) * 100;
    var aprox = nom - inf;
    var col = real >= 0 ? "var(--orange)" : "var(--green)";
    grid.innerHTML =
      '<div class="qc-card">' +
      '<div class="qc-card-t" style="color:' +
      col +
      '">Juro real: ' +
      pp(real) +
      "% a.a.</div>" +
      '<div class="qc-card-d">acima da inflacao (Fisher)</div>' +
      '<div class="qc-card-b">' +
      '<div class="qc-col"><div class="qc-lbl">Nominal</div><div class="qc-val">' +
      pp(nom) +
      "%</div></div>" +
      '<div class="qc-col"><div class="qc-lbl">Inflacao</div><div class="qc-val lose">' +
      pp(inf) +
      "%</div></div>" +
      "</div>" +
      '<div class="qc-foot"><span class="muted">Aproximacao simples (nominal - inflacao): ' +
      pp(aprox) +
      " p.p.</span></div>" +
      extra +
      "</div>";
  }
  function init() {
    var inf = document.getElementById("jrInf");
    if (!inf) return;
    ["jrNom", "jrInf", "jrCdi", "jrPct"].forEach(function (id) {
      var e = document.getElementById(id);
      if (e) e.addEventListener("change", render);
    });
    var card = inf.closest(".card");
    if (card)
      card.querySelectorAll("[data-jrmode]").forEach(function (b) {
        b.addEventListener("click", function () {
          mode = b.getAttribute("data-jrmode");
          applyMode();
          render();
        });
      });
    applyMode();
    render();
  }
  if (document.readyState === "loading") {
    queueMicrotask(init);
  } else {
    init();
  }
})();
