// Migrated from Hub v1. Review domain assumptions separately from interface changes.

(function () {
  function init() {
    var bar = document.querySelector("#p-comparador .cmp-bar");
    if (!bar) return;
    var panels = document.querySelectorAll("#p-comparador .cmp-panel");
    bar.querySelectorAll("[data-cmptab]").forEach(function (b) {
      b.addEventListener("click", function () {
        var t = b.getAttribute("data-cmptab");
        bar.querySelectorAll("[data-cmptab]").forEach(function (x) {
          x.classList.toggle("on", x === b);
        });
        panels.forEach(function (pp) {
          pp.style.display =
            pp.getAttribute("data-cmppanel") === t ? "" : "none";
        });
      });
    });
  }
  if (document.readyState === "loading") {
    queueMicrotask(init);
  } else {
    init();
  }
})();
