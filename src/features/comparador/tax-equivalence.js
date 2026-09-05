// Migrated from Hub v1. Review domain assumptions separately from interface changes.

(function () {
  var PERIODS = [
    { t: "Ate 6 meses", d: "ate 180 dias", ir: 0.225 },
    { t: "De 6 meses a 1 ano", d: "181 a 360 dias", ir: 0.2 },
    { t: "De 1 a 2 anos", d: "361 a 720 dias", ir: 0.175 },
    { t: "Acima de 2 anos", d: "acima de 720 dias", ir: 0.15 },
  ];
  function num(v) {
    v = ("" + v).replace(/[^0-9.,]/g, "").replace(",", ".");
    var n = parseFloat(v);
    return isFinite(n) ? n : 0;
  }
  function fmt(n) {
    return (
      n.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + "%"
    );
  }
  function pp(n) {
    return n.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  function render() {
    var lcaEl = document.getElementById("qcLca"),
      cdbEl = document.getElementById("qcCdb"),
      grid = document.getElementById("qcGrid");
    if (!grid) return;
    var lca = num(lcaEl.value),
      cdb = num(cdbEl.value);
    grid.innerHTML = PERIODS.map(function (p) {
      var cdbNet = cdb * (1 - p.ir);
      var lcaWin = lca > cdbNet + 1e-9,
        cdbWin = cdbNet > lca + 1e-9;
      var diff = Math.abs(lca - cdbNet);
      var foot = lcaWin
        ? '<span style="color:var(--orange)">LCI/LCA rende mais &middot; +' +
          pp(diff) +
          " p.p.</span>"
        : cdbWin
          ? '<span style="color:var(--green)">CDB rende mais &middot; +' +
            pp(diff) +
            " p.p.</span>"
          : '<span class="muted">Empate</span>';
      return (
        '<div class="qc-card">' +
        '<div class="qc-card-t">' +
        p.t +
        "</div>" +
        '<div class="qc-card-d">' +
        p.d +
        " &middot; IR " +
        pp(p.ir * 100) +
        "%</div>" +
        '<div class="qc-card-b">' +
        '<div class="qc-col"><div class="qc-lbl">LCI/LCA</div><div class="qc-val ' +
        (lcaWin ? "win" : cdbWin ? "lose" : "") +
        '">' +
        fmt(lca) +
        "</div></div>" +
        '<div class="qc-col"><div class="qc-lbl">CDB</div><div class="qc-val ' +
        (cdbWin ? "win" : lcaWin ? "lose" : "") +
        '">' +
        fmt(cdbNet) +
        "</div></div>" +
        "</div>" +
        '<div class="qc-foot">' +
        foot +
        "</div>" +
        "</div>"
      );
    }).join("");
  }
  function init() {
    var lcaEl = document.getElementById("qcLca"),
      cdbEl = document.getElementById("qcCdb");
    if (!lcaEl || !cdbEl) {
      return;
    }
    lcaEl.addEventListener("change", render);
    cdbEl.addEventListener("change", render);
    render();
  }
  if (document.readyState === "loading") {
    queueMicrotask(init);
  } else {
    init();
  }
})();
