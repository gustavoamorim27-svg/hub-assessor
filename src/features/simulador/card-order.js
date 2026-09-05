// Migrated from Hub v1. Review domain assumptions separately from interface changes.

(function () {
  function cardKey(c) {
    var l = c.querySelector("label,h3,.k,.ph h3");
    return ((l ? l.textContent : c.textContent) || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 40);
  }
  var LS = "rico-fp-order-v1";
  function load() {
    try {
      return JSON.parse(window.hubStorage.getItem(LS)) || {};
    } catch (e) {
      return {};
    }
  }
  function save(o) {
    try {
      window.hubStorage.setItem(LS, JSON.stringify(o));
    } catch (e) {}
  }
  function cards(cont) {
    return Array.prototype.filter.call(cont.children, function (c) {
      return c.classList && c.classList.contains("card");
    });
  }
  function saveOrder(cont, id) {
    var all = load();
    all[id] = cards(cont).map(cardKey);
    save(all);
  }
  function applyOrder(cont, id) {
    var ord = load()[id];
    if (!ord) return;
    var map = {};
    cards(cont).forEach(function (c) {
      map[cardKey(c)] = c;
    });
    ord.forEach(function (k) {
      if (map[k]) cont.appendChild(map[k]);
    });
  }
  function getAfter(cont, xp) {
    var els = cards(cont).filter(function (c) {
      return !c.classList.contains("dragging");
    });
    var best = { d: -Infinity, el: null };
    els.forEach(function (c) {
      var b = c.getBoundingClientRect();
      var off = xp - (b.left + b.width / 2);
      if (off < 0 && off > best.d) {
        best = { d: off, el: c };
      }
    });
    return best.el;
  }
  function initCont(cont, id) {
    cards(cont).forEach(function (card) {
      if (card.querySelector(".fp-drag")) return;
      card.style.position = "relative";
      var h = document.createElement("span");
      h.className = "fp-drag";
      h.textContent = "⠿";
      h.title = "Arraste para reordenar";
      h.setAttribute("draggable", "true");
      h.addEventListener("dragstart", function (e) {
        card.classList.add("dragging");
        try {
          e.dataTransfer.setData("text/plain", "x");
          e.dataTransfer.effectAllowed = "move";
        } catch (_) {}
      });
      h.addEventListener("dragend", function () {
        card.classList.remove("dragging");
        saveOrder(cont, id);
      });
      card.appendChild(h);
    });
    if (!cont.__sortBound) {
      cont.__sortBound = true;
      cont.addEventListener("dragover", function (e) {
        e.preventDefault();
        var dr = cont.querySelector(".dragging");
        if (!dr) return;
        var after = getAfter(cont, e.clientX);
        if (after == null) {
          cont.appendChild(dr);
        } else {
          cont.insertBefore(dr, after);
        }
      });
    }
    applyOrder(cont, id);
  }
  function init() {
    var c1 = document.querySelector('[data-tool="simulador"] .controls');
    if (c1) initCont(c1, "controls");
    var c2 = document.querySelector('[data-tool="simulador"] .goal-grid');
    if (c2) initCont(c2, "goal");
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(init, 150);
    });
  } else {
    setTimeout(init, 150);
  }
})();
