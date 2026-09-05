// Migrated from Hub v1. Review domain assumptions separately from interface changes.

(function () {
  function apply(hide) {
    document.documentElement.classList.toggle("hide-drawers", hide);
    if (hide) {
      ["libDrawer", "libBackdrop", "opcat", "catBackdrop"].forEach(
        function (id) {
          var e = document.getElementById(id);
          if (e) e.classList.remove("open");
        },
      );
    }
  }
  function init() {
    var cb = document.getElementById("drawerToggle");
    if (!cb) return;
    var hide = false;
    try {
      hide = window.hubStorage.getItem("hubHideDrawers") === "1";
    } catch (_) {}
    cb.checked = !hide;
    apply(hide);
    cb.addEventListener("change", function () {
      var h = !cb.checked;
      apply(h);
      try {
        window.hubStorage.setItem("hubHideDrawers", h ? "1" : "0");
      } catch (_) {}
    });
  }
  if (document.readyState === "loading") queueMicrotask(init);
  else init();
})();
