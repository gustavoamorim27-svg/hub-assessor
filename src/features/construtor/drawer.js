// Migrated from Hub v1. Review domain assumptions separately from interface changes.

(function () {
  function byId(i) {
    return document.getElementById(i);
  }
  function openCat() {
    var d = byId("opcat"),
      b = byId("catBackdrop");
    if (d) d.classList.add("open");
    if (b) b.classList.add("open");
    var ld = byId("libDrawer"),
      lb = byId("libBackdrop");
    if (ld) ld.classList.remove("open");
    if (lb) lb.classList.remove("open");
  }
  function closeCat() {
    var d = byId("opcat"),
      b = byId("catBackdrop");
    if (d) d.classList.remove("open");
    if (b) b.classList.remove("open");
  }
  function init() {
    var t = byId("catTab");
    if (t)
      t.addEventListener("click", function () {
        var d = byId("opcat");
        if (d && d.classList.contains("open")) {
          closeCat();
        } else {
          openCat();
        }
      });
    var c = byId("ocClose");
    if (c) c.addEventListener("click", closeCat);
    var b = byId("catBackdrop");
    if (b) b.addEventListener("click", closeCat);
    var lt = byId("libTab");
    if (lt) lt.addEventListener("click", closeCat);
    var oc = byId("opcat");
    if (oc)
      oc.addEventListener("click", function (e) {
        if (e.target.closest && e.target.closest(".minibtn"))
          setTimeout(closeCat, 120);
      });
  }
  if (document.readyState === "loading") queueMicrotask(init);
  else init();
  window.__closeCatDrawer = closeCat;
})();
