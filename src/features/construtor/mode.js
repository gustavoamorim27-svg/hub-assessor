// Migrated from Hub v1. Review domain assumptions separately from interface changes.

(function () {
  function relocate() {
    var host = document.getElementById("p-construtor");
    if (!host) return;
    var wrap = host.querySelector(".wrap") || host;
    var hdr = wrap.querySelector(".header");
    var anchor = hdr ? hdr.nextSibling : wrap.firstChild;
    ["simGavRail", "libDrawer", "opcat", "libBackdrop", "catBackdrop"].forEach(
      function (id) {
        var el = document.getElementById(id);
        if (el && el.parentElement !== wrap) wrap.insertBefore(el, anchor);
      },
    );
    /* sincroniza estado on/seta das pílulas com a abertura das gavetas */
    try {
      var lib = document.getElementById("libDrawer"),
        oc = document.getElementById("opcat"),
        lt = document.getElementById("libTab"),
        ct = document.getElementById("catTab");
      function sync() {
        if (lt && lib)
          lt.classList.toggle("on", lib.classList.contains("open"));
        if (ct && oc) ct.classList.toggle("on", oc.classList.contains("open"));
      }
      if (!window.__simGavObs) {
        var mo = new MutationObserver(sync);
        if (lib)
          mo.observe(lib, { attributes: true, attributeFilter: ["class"] });
        if (oc)
          mo.observe(oc, { attributes: true, attributeFilter: ["class"] });
        window.__simGavObs = mo;
        sync();
      }
    } catch (_) {}
  }
  function rvActive() {
    var rv = document.getElementById("construtorRv");
    return rv && getComputedStyle(rv).display !== "none";
  }
  window.__drawerAdd = function (classe, nome, detalhe, liq, protFlag, op) {
    if (rvActive() && typeof window.__rvAddFromDrawer === "function") {
      return window.__rvAddFromDrawer(classe, nome, detalhe, liq, protFlag, op);
    }
    if (typeof window.__ctorAddAtivo === "function") {
      return window.__ctorAddAtivo(classe, nome, detalhe, liq, protFlag, op);
    }
    return false;
  };
  if (document.readyState === "loading") queueMicrotask(relocate);
  else relocate();
})();
