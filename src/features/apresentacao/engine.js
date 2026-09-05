// Migrated from Hub v1. Review domain assumptions separately from interface changes.

(function () {
  window._toolInit = window._toolInit || {};
  window._toolInit["apresentacao"] = function () {
    var f = document.getElementById("apresentacaoFrame");
    if (f && !f.src) f.src = "apresentacao.html";
  };
})();
