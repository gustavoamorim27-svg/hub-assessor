// Migrated from Hub v1. Review domain assumptions separately from interface changes.

(function () {
  var PROFILES = {
    Conservadora: {
      "Renda Fixa": 90,
      Previdência: 0,
      Multimercados: 2.5,
      "Renda Variável": 0,
      "Fundos Listados": 2.5,
      Alternativos: 0,
      Internacional: 5,
    },
    Moderada: {
      "Renda Fixa": 68,
      Previdência: 0,
      Multimercados: 13,
      "Renda Variável": 5,
      "Fundos Listados": 4,
      Alternativos: 3,
      Internacional: 7,
    },
    Sofisticada: {
      "Renda Fixa": 51,
      Previdência: 0,
      Multimercados: 8,
      "Renda Variável": 15,
      "Fundos Listados": 9.5,
      Alternativos: 7,
      Internacional: 9.5,
    },
  };
  var ORDER = [
    "Renda Fixa",
    "Previdência",
    "Multimercados",
    "Fundo Aberto",
    "Renda Variável",
    "Fundos Listados",
    "Alternativos",
    "Internacional",
  ];
  var COL = {
    "Renda Fixa": "#3DD68C",
    Previdência: "#E8709B",
    Multimercados: "#7C8CFF",
    "Fundo Aberto": "#5AC8A8",
    "Renda Variável": "#F26522",
    "Fundos Listados": "#FFB020",
    Alternativos: "#C77DFF",
    Internacional: "#36C5F0",
  };
  var prof = "Moderada",
    lastComp = null,
    lastInfo = null;
  function fp(n) {
    var v = Math.round(n * 10) / 10;
    return (Number.isInteger(v) ? v.toFixed(0) : v.toFixed(1)).replace(
      ".",
      ",",
    );
  }
  function byId(i) {
    return document.getElementById(i);
  }
  function openM() {
    var m = byId("aderModal");
    if (m) {
      m.style.display = "block";
      document.body.style.overflow = "hidden";
    }
  }
  function closeM() {
    var m = byId("aderModal");
    if (m) {
      m.style.display = "none";
      document.body.style.overflow = "";
    }
  }
  function setProf(p) {
    prof = p;
    var box = byId("aderProfiles");
    if (box)
      box.querySelectorAll("[data-prof]").forEach(function (b) {
        b.classList.toggle("on", b.getAttribute("data-prof") === p);
      });
    if (lastComp) renderResult();
  }
  function renderResult() {
    var res = byId("aderResult");
    if (!res || !lastComp) return;
    var rec = PROFILES[prof];
    var soma = 0;
    ORDER.forEach(function (c) {
      soma += Math.abs((lastComp[c] || 0) - (rec[c] || 0));
    });
    var ader = Math.max(0, 100 - soma / 2);
    var col = ader >= 85 ? "#2BD9A6" : ader >= 65 ? "#FFB020" : "#FF6B6B";
    var faltam = [],
      sobram = [];
    ORDER.forEach(function (c) {
      var d = (rec[c] || 0) - (lastComp[c] || 0);
      if (d >= 0.5) faltam.push({ c: c, v: d });
      else if (d <= -0.5) sobram.push({ c: c, v: -d });
    });
    faltam.sort(function (a, b) {
      return b.v - a.v;
    });
    sobram.sort(function (a, b) {
      return b.v - a.v;
    });
    var h = "";
    h +=
      '<div style="display:flex;align-items:center;gap:16px;background:linear-gradient(150deg,rgba(28,36,112,.45),rgba(12,17,66,.65));border:1px solid rgba(120,130,210,.2);border-radius:16px;padding:18px;margin-bottom:18px;flex-wrap:wrap;">' +
      "<div style=\"font-family:'Sora',sans-serif;font-weight:800;font-size:42px;color:" +
      col +
      ';line-height:1;">' +
      fp(ader) +
      "%</div>" +
      '<div><div style="font-weight:700;color:#fff;font-size:15px;">de aderencia ao perfil ' +
      prof +
      '</div><div style="font-size:12.5px;color:#9AA2D0;margin-top:3px;">' +
      (lastInfo && lastInfo.conta
        ? "Conta " + lastInfo.conta + " \u00b7 "
        : "") +
      "Sobreposicao entre a carteira do cliente e a recomendada.</div></div></div>";
    h +=
      '<div style="background:linear-gradient(160deg,rgba(28,36,112,.4),rgba(12,17,66,.6));border:1px solid rgba(120,130,210,.18);border-radius:16px;padding:18px;margin-bottom:18px;">';
    h +=
      '<div style="font-weight:700;color:#cfd4ef;font-size:13px;margin-bottom:14px;">Atual (cliente) &times; Recomendada (' +
      prof +
      ")</div>";
    ORDER.forEach(function (c) {
      var a = lastComp[c] || 0,
        r = rec[c] || 0;
      if (a < 0.05 && r < 0.05) return;
      var cc = COL[c];
      h +=
        '<div style="margin-bottom:13px;"><div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:5px;"><span style="font-weight:700;color:#eef0fb;">' +
        (window.__hubClassLabel ? window.__hubClassLabel(c) : c) +
        '</span><span style="color:' +
        cc +
        ';font-weight:700;">' +
        fp(a) +
        "% &rarr; " +
        fp(r) +
        "%</span></div>" +
        '<div style="height:7px;background:rgba(255,255,255,.06);border-radius:5px;overflow:hidden;"><div style="height:100%;width:' +
        Math.min(100, a) +
        "%;background:" +
        cc +
        '88;border-radius:5px;"></div></div>' +
        '<div style="height:7px;background:rgba(255,255,255,.06);border-radius:5px;overflow:hidden;margin-top:3px;"><div style="height:100%;width:' +
        Math.min(100, r) +
        "%;background:" +
        cc +
        ';border-radius:5px;"></div></div></div>';
    });
    h +=
      '<div style="font-size:10.5px;color:#6F77A8;margin-top:6px;">Barra clara = atual do cliente &middot; barra cheia = recomendada.</div></div>';
    function listBox(title, arr, sign, color) {
      var b =
        '<div style="flex:1;min-width:240px;background:rgba(0,0,0,.22);border:1px solid rgba(120,130,210,.18);border-radius:14px;padding:16px;">';
      b +=
        '<div style="font-weight:800;font-size:13.5px;color:' +
        color +
        ';margin-bottom:11px;">' +
        title +
        "</div>";
      if (!arr.length) {
        b +=
          '<div style="font-size:12.5px;color:#6F77A8;">Nada relevante &mdash; bem alinhado.</div>';
      }
      arr.forEach(function (x) {
        b +=
          '<div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:8px;"><span style="color:#eef0fb;">' +
          x.c +
          '</span><span style="font-weight:800;color:' +
          color +
          ';">' +
          sign +
          fp(x.v) +
          " p.p.</span></div>";
      });
      return b + "</div>";
    }
    h +=
      '<div style="display:flex;gap:16px;flex-wrap:wrap;">' +
      listBox("Esta faltando (aumentar)", faltam, "+", "#2BD9A6") +
      listBox("Esta sobrando (reduzir)", sobram, "\u2212", "#FF6B6B") +
      "</div>";
    res.innerHTML = h;
  }
  function onFile(file) {
    var st = byId("aderStatus");
    if (st) {
      st.style.color = "#9AA2D0";
      st.textContent = "Lendo " + file.name + "...";
    }
    if (typeof window.RICO_importPosicaoFile !== "function") {
      try {
        if (window._toolInit && window._toolInit["aderencia"])
          window._toolInit["aderencia"]();
      } catch (e) {}
    }
    if (typeof window.RICO_importPosicaoFile !== "function") {
      if (st) {
        st.style.color = "#FF6B6B";
        st.textContent =
          "Importador indisponivel \u2014 recarregue a pagina e tente de novo.";
      }
      return;
    }
    window.RICO_importPosicaoFile(file, function (parsed) {
      if (!parsed || !parsed.comp) {
        if (st) {
          st.style.color = "#FF6B6B";
          st.textContent =
            "Nao consegui ler as classes do arquivo. Use a Posicao Consolidada do Hub XP.";
        }
        return;
      }
      lastComp = parsed.comp;
      lastInfo = { conta: parsed.conta };
      if (st) {
        st.style.color = "#2BD9A6";
        st.textContent =
          "Posicao carregada \u00b7 Conta " + (parsed.conta || "\u2014");
      }
      renderResult();
    });
  }
  function init() {
    var btn = byId("btnCtorAder");
    if (btn) btn.addEventListener("click", openM);
    var close = byId("aderClose");
    if (close) close.addEventListener("click", closeM);
    var pick = byId("aderPick"),
      file = byId("aderFile");
    if (pick && file) {
      pick.addEventListener("click", function () {
        file.click();
      });
      file.addEventListener("change", function (e) {
        if (e.target.files && e.target.files[0]) {
          onFile(e.target.files[0]);
          try {
            e.target.value = "";
          } catch (_) {}
        }
      });
    }
    var box = byId("aderProfiles");
    if (box)
      box.querySelectorAll("[data-prof]").forEach(function (b) {
        b.addEventListener("click", function () {
          setProf(b.getAttribute("data-prof"));
        });
      });
  }
  if (document.readyState === "loading") queueMicrotask(init);
  else init();
})();
