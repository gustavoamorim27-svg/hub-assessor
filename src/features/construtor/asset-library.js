// Migrated from Hub v1. Review domain assumptions separately from interface changes.

(function () {
  var LIB = [
    {
      classe: "Renda Fixa",
      nome: "LCA",
      detalhe: "93/94% do CDI · 1–5 anos · isento de IR",
      liq: "No vencimento",
    },
    {
      classe: "Renda Fixa",
      nome: "LCD",
      detalhe: "93/94% do CDI · 1–5 anos · isento de IR",
      liq: "No vencimento",
    },
    {
      classe: "Renda Fixa",
      nome: "LCI",
      detalhe: "IPCA + 6% a.a. · 1 a 3 anos · isento",
      liq: "",
    },
    {
      classe: "Renda Fixa",
      nome: "CDB",
      detalhe: "14,7% a.a. · 3 a 5 anos",
      liq: "No vencimento",
    },
    {
      classe: "Renda Fixa",
      nome: "XP Brasil",
      detalhe: "15% a.a. · 5 anos",
      liq: "No vencimento",
    },
    {
      classe: "Renda Fixa",
      nome: "XP Brasil IPCA+",
      detalhe: "IPCA + 8,2% a.a.",
      liq: "No vencimento",
    },
    {
      classe: "Renda Fixa",
      nome: "Tesouro Selic",
      detalhe: "Pós-fixado · liquidez diária",
      liq: "D+0",
    },
    {
      classe: "Renda Fixa",
      nome: "NTN-B",
      detalhe: "IPCA + juro real · longo prazo",
      liq: "D+1",
    },
    {
      classe: "Multimercados",
      nome: "ACE Multicenários",
      detalhe: "Multimercado global · ~230% do CDI",
      liq: "D+17",
    },
    {
      classe: "Multimercados",
      nome: "XP Forças Armadas",
      detalhe: "Defesa EUA (Palantir e afins) · 5 anos",
      liq: "No vencimento",
    },
    {
      classe: "Multimercados",
      nome: "XP NTN-B Longa",
      detalhe: "NTN-B longa com marcação a mercado · 1 ano",
      liq: "Marcação a mercado",
    },
    {
      classe: "Renda Variável",
      nome: "BOVA11 Protegida",
      detalhe:
        "Proteção total de capital · participa da alta até 28% (15% acima) · Collar UI 2 anos",
      liq: "No vencimento",
      bova: true,
    },
    {
      classe: "Fundos Listados",
      nome: "JHSF Capital Malls",
      detalhe: "Shoppings premium · trophy assets",
      liq: "",
    },
    {
      classe: "Fundos Listados",
      nome: "XPAG (Fiagro)",
      detalhe: "Crédito do agro · renda mensal isenta",
      liq: "",
    },
    {
      classe: "Fundos Listados",
      nome: "XP Logístico Prime",
      detalhe: "Galpões logísticos AAA",
      liq: "",
    },
    {
      classe: "Alternativos",
      nome: "Ouro — Retorno Otimizado",
      detalhe: "Ouro com estrutura otimizada · 3–5 anos",
      liq: "No vencimento",
    },
    {
      classe: "Alternativos",
      nome: "XP Tecnologia (QQQ)",
      detalhe: "Tecnologia EUA com proteção · 1 ano",
      liq: "No vencimento",
    },
    {
      classe: "Internacional",
      nome: "Wellington Global Quality",
      detalhe: "Ações EUA/Europa/RU · +75% em 3 anos",
      liq: "D+5",
    },
    {
      classe: "Internacional",
      nome: "CD de 1 ano (dólar)",
      detalhe: "Certificate of Deposit · pré em dólar",
      liq: "No vencimento",
    },
    {
      classe: "Renda Fixa",
      nome: "LTN",
      detalhe: "Prefixado · juro travado na largada",
      liq: "No vencimento",
    },
    {
      classe: "Renda Fixa",
      nome: "Debênture Pré (Infra)",
      detalhe: "Crédito privado prefixado · isenta de IR",
      liq: "No vencimento",
    },
    {
      classe: "Renda Variável",
      nome: "BPAC11 — SmartCupom",
      detalhe: "BTG · cupom pré ~8% em 8 meses",
      liq: "No vencimento",
    },
    {
      classe: "Renda Variável",
      nome: "ITUB — Fence",
      detalhe: "Itaú · proteção parcial, alta limitada · 1 ano",
      liq: "No vencimento",
    },
    {
      classe: "Renda Variável",
      nome: "Microsoft — Collar",
      detalhe: "Collar UI 2 anos · proteção total",
      liq: "No vencimento",
    },
    {
      classe: "Renda Variável",
      nome: "AXIA3 — Collar",
      detalhe: "Axia Energia · Collar UI 1,5 ano",
      liq: "No vencimento",
    },
    {
      classe: "Renda Variável",
      nome: "PETR4 — Collar",
      detalhe: "Petrobras · proteção total, alta limitada",
      liq: "No vencimento",
    },
    {
      classe: "Renda Variável",
      nome: "VALE3 — Fence",
      detalhe: "Vale · proteção parcial · 1 ano",
      liq: "No vencimento",
    },
  ];
  var CUSTOMLIB = [];
  try {
    CUSTOMLIB =
      JSON.parse(window.hubStorage.getItem("hubCustomLib") || "[]") || [];
  } catch (_) {
    CUSTOMLIB = [];
  }
  function persist() {
    try {
      window.hubStorage.setItem("hubCustomLib", JSON.stringify(CUSTOMLIB));
    } catch (_) {}
  }
  function allItems() {
    return LIB.concat(CUSTOMLIB);
  }
  /* Fonte unica da biblioteca de ativos. Recarrega do window.hubStorage a cada chamada,
           que e onde o HubCloud (Firebase) grava os ativos vindos de outros usuarios. */
  /* Cria um ativo na biblioteca compartilhada (mesma do construtor) e sincroniza na nuvem. */
  try {
    window.__hubLibAdd = function (it) {
      try {
        if (!it || !it.nome) return null;
        try {
          CUSTOMLIB =
            JSON.parse(window.hubStorage.getItem("hubCustomLib") || "[]") || [];
        } catch (_) {}
        var nid = "u" + Date.now() + Math.floor(Math.random() * 1000);
        var novo = {
          id: nid,
          classe: it.classe || "Renda Fixa",
          nome: String(it.nome).trim(),
          detalhe: it.detalhe || "",
          liq: it.liq || "",
          custom: true,
        };
        CUSTOMLIB.push(novo);
        try {
          persist();
        } catch (_) {}
        try {
          window.__LIBDATA = allItems();
        } catch (_) {}
        try {
          if (window.HubCloud && window.HubCloud.push)
            window.HubCloud.push("construtor", nid, novo, novo.nome);
        } catch (_) {}
        return novo;
      } catch (e) {
        return null;
      }
    };
  } catch (_) {}
  try {
    window.__hubLibData = function () {
      try {
        CUSTOMLIB =
          JSON.parse(window.hubStorage.getItem("hubCustomLib") || "[]") || [];
      } catch (_) {}
      try {
        window.__LIBDATA = allItems();
      } catch (_) {}
      return window.__LIBDATA || [];
    };
  } catch (_) {}
  var libSeq = 0;
  CUSTOMLIB.forEach(function (x) {
    var n = parseInt(String(x.id || "").replace("u", ""), 10);
    if (!isNaN(n) && n > libSeq) libSeq = n;
  });
  window.__LIBDATA = allItems();
  var COL = {
    "Renda Fixa": "#2BD9A6",
    Multimercados: "#7C8CFF",
    "Renda Variável": "#FF8B52",
    "Fundo Aberto": "#5AC8A8",
    "Fundos Listados": "#FFB020",
    Alternativos: "#C77DFF",
    Internacional: "#36C5F0",
  };
  var ORDER = [
    "Renda Fixa",
    "Multimercados",
    "Fundo Aberto",
    "Renda Variável",
    "Fundos Listados",
    "Alternativos",
    "Internacional",
  ];
  function esc(t) {
    return ("" + t)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function libNorm(t) {
    return (t == null ? "" : String(t))
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }
  function libFilter() {
    var box = document.getElementById("libChips");
    if (!box) return;
    var inp = document.getElementById("libSearch");
    var nq = libNorm(inp ? inp.value : "");
    var cards = box.querySelectorAll(".lib-card");
    cards.forEach(function (card) {
      var hay = libNorm(card.getAttribute("data-libfind") || card.textContent);
      card.style.display = !nq || hay.indexOf(nq) >= 0 ? "" : "none";
    });
    // esconde cabecalhos de secao (lib-sec) sem cards visiveis
    box.querySelectorAll(".lib-sec").forEach(function (sec) {
      var anyVis = false,
        n = sec.nextElementSibling;
      while (n && !(n.classList && n.classList.contains("lib-sec"))) {
        if (
          n.classList &&
          n.classList.contains("lib-card") &&
          n.style.display !== "none"
        ) {
          anyVis = true;
          break;
        }
        n = n.nextElementSibling;
      }
      sec.style.display = anyVis ? "" : "none";
    });
    // mensagem "nenhum ativo encontrado"
    var emp = box.querySelector(".lib-nomatch");
    var anyCardVis = Array.prototype.some.call(cards, function (c) {
      return c.style.display !== "none";
    });
    if (nq && cards.length && !anyCardVis) {
      if (!emp) {
        emp = document.createElement("div");
        emp.className = "lib-nomatch";
        emp.textContent = "Nenhum ativo encontrado.";
        box.appendChild(emp);
      }
      emp.style.display = "";
    } else if (emp) {
      emp.style.display = "none";
    }
  }
  function render() {
    var box = document.getElementById("libChips");
    if (!box) return;
    try {
      CUSTOMLIB =
        JSON.parse(window.hubStorage.getItem("hubCustomLib") || "[]") || [];
    } catch (_) {}
    var h = "";
    var ALL = allItems();
    window.__LIBDATA = ALL;
    ORDER.forEach(function (cl) {
      var items = ALL.map(function (a, i) {
        return { a: a, i: i };
      }).filter(function (o) {
        return o.a.classe === cl;
      });
      if (!items.length) return;
      var c = COL[cl] || "#9AA2D0";
      h +=
        '<div class="lib-sec" style="color:' +
        c +
        '">' +
        ({
          "Renda Fixa": "🏦 ",
          Previdência: "🕰️ ",
          Multimercados: "🌐 ",
          "Fundo Aberto": "📂 ",
          "Renda Variável": "📈 ",
          "Fundos Listados": "🏢 ",
          Alternativos: "🪙 ",
          Internacional: "🌎 ",
        }[cl] || "") +
        esc(window.__hubClassLabel ? window.__hubClassLabel(cl) : cl) +
        "</div>";
      items.forEach(function (o) {
        var a = o.a;
        var isC = !!a.custom;
        h +=
          '<div class="lib-card" draggable="true" data-libcard="' +
          o.i +
          '" data-libfind="' +
          esc(
            (a.nome || "") +
              " " +
              (a.detalhe || "") +
              " " +
              (a.classe || "") +
              " " +
              (a.liq || ""),
          ) +
          '" title="Arraste para a carteira ou clique em + Add" style="border-left:3px solid ' +
          c +
          '">' +
          '<div class="lib-card-top"><div class="lib-card-name"><span style="color:' +
          c +
          '">●</span> ' +
          esc(a.nome) +
          '</div><button class="lib-add" data-libadd="' +
          o.i +
          '">+ Add</button></div>' +
          (a.detalhe
            ? '<div class="lib-card-desc">' + esc(a.detalhe) + "</div>"
            : "") +
          (a.liq
            ? '<div class="lib-card-liq">Liquidez: ' + esc(a.liq) + "</div>"
            : "") +
          (isC
            ? '<div style="display:flex;gap:8px;margin-top:8px"><button class="lib-mini" data-libedit="' +
              esc(a.id) +
              '">Editar</button><button class="lib-mini del" data-libdel="' +
              esc(a.id) +
              '">Excluir</button></div>'
            : "") +
          "</div>";
      });
    });
    box.innerHTML = h;
    box.querySelectorAll(".lib-card").forEach(function (card) {
      var idx = +card.getAttribute("data-libcard");
      card.addEventListener("dragstart", function (e) {
        window.__libDrag = idx;
        try {
          e.dataTransfer.setData("text/plain", "lib");
          e.dataTransfer.effectAllowed = "copy";
        } catch (_) {}
      });
      card.addEventListener("dragend", function () {
        setTimeout(function () {
          window.__libDrag = null;
        }, 50);
      });
    });
    box.querySelectorAll(".lib-add").forEach(function (b) {
      var idx = +b.getAttribute("data-libadd");
      b.onclick = function (e) {
        e.stopPropagation();
        var a = allItems()[idx];
        var add = window.__drawerAdd || window.__ctorAddAtivo;
        if (add && a) {
          var op = a.bova ? window.__BOVA_OP : null;
          add(a.classe, a.nome, a.detalhe, a.liq, !!op, op);
        }
      };
    });
    box.querySelectorAll("[data-libedit]").forEach(function (b) {
      b.onclick = function (e) {
        e.stopPropagation();
        openLibForm(b.getAttribute("data-libedit"));
      };
    });
    box.querySelectorAll("[data-libdel]").forEach(function (b) {
      b.onclick = function (e) {
        e.stopPropagation();
        var id = b.getAttribute("data-libdel");
        try {
          CUSTOMLIB =
            JSON.parse(window.hubStorage.getItem("hubCustomLib") || "[]") || [];
        } catch (_) {}
        CUSTOMLIB = CUSTOMLIB.filter(function (x) {
          return x.id !== id;
        });
        persist();
        try {
          if (window.__HubCloud) window.__HubCloud.remove(id);
        } catch (_) {}
        render();
      };
    });
    libFilter();
  }
  function openLibForm(id) {
    var o = id
      ? CUSTOMLIB.filter(function (x) {
          return x.id === id;
        })[0]
      : { id: null, classe: "Renda Fixa", nome: "", detalhe: "", liq: "" };
    if (!o) return;
    var editing = !!id;
    var box = document.getElementById("libForm");
    if (!box) return;
    var opts = ORDER.map(function (cl) {
      return (
        '<option value="' +
        esc(cl) +
        '"' +
        (o.classe === cl ? " selected" : "") +
        ">" +
        esc(window.__hubClassLabel ? window.__hubClassLabel(cl) : cl) +
        "</option>"
      );
    }).join("");
    box.innerHTML =
      '<div class="lib-form">' +
      '<label>Classe<select id="lfClasse">' +
      opts +
      "</select></label>" +
      '<label>Nome do ativo<input id="lfNome" value="' +
      esc(o.nome) +
      '" placeholder="Ex.: CDB Banco X 110% CDI"></label>' +
      '<label>Detalhe<input id="lfDet" value="' +
      esc(o.detalhe) +
      '" placeholder="Ex.: 110% do CDI · 2 anos"></label>' +
      '<label>Liquidez<input id="lfLiq" value="' +
      esc(o.liq) +
      '" placeholder="Ex.: No vencimento / D+0"></label>' +
      '<div class="lib-form-acts"><button class="lf-save" id="lfSave">Salvar</button><button class="lf-cancel" id="lfCancel">Cancelar</button></div></div>';
    document.getElementById("lfSave").onclick = function () {
      var nome = document.getElementById("lfNome").value.trim();
      if (!nome) {
        document.getElementById("lfNome").focus();
        return;
      }
      var data = {
        classe: document.getElementById("lfClasse").value,
        nome: nome,
        detalhe: document.getElementById("lfDet").value.trim(),
        liq: document.getElementById("lfLiq").value.trim(),
        custom: true,
      };
      try {
        CUSTOMLIB =
          JSON.parse(window.hubStorage.getItem("hubCustomLib") || "[]") || [];
      } catch (_) {}
      libSeq = 0;
      CUSTOMLIB.forEach(function (x) {
        var n = parseInt(String(x.id || "").replace("u", ""), 10);
        if (!isNaN(n) && n > libSeq) libSeq = n;
      });
      if (editing) {
        data.id = o.id;
        CUSTOMLIB = CUSTOMLIB.map(function (x) {
          return x.id === o.id ? data : x;
        });
      } else {
        data.id = "u" + ++libSeq;
        CUSTOMLIB.push(data);
      }
      persist();
      try {
        if (window.__HubCloud)
          window.__HubCloud.push("construtor", data.id, data, data.nome);
      } catch (_) {}
      document.getElementById("libForm").innerHTML = "";
      render();
    };
    document.getElementById("lfCancel").onclick = function () {
      document.getElementById("libForm").innerHTML = "";
    };
    document.getElementById("lfNome").focus();
  }
  function open() {
    var d = document.getElementById("libDrawer"),
      bd = document.getElementById("libBackdrop");
    if (d) d.classList.add("open");
    if (bd) bd.classList.add("open");
  }
  function close() {
    var d = document.getElementById("libDrawer"),
      bd = document.getElementById("libBackdrop");
    if (d) d.classList.remove("open");
    if (bd) bd.classList.remove("open");
  }
  function init() {
    var t = document.getElementById("libTab");
    if (!t) return;
    t.addEventListener("click", function () {
      var d = document.getElementById("libDrawer");
      if (d && d.classList.contains("open")) {
        close();
      } else {
        open();
      }
    });
    var c = document.getElementById("libClose");
    if (c) c.addEventListener("click", close);
    var bd = document.getElementById("libBackdrop");
    if (bd) bd.addEventListener("click", close);
    var nb = document.getElementById("libNew");
    if (nb)
      nb.addEventListener("click", function () {
        openLibForm(null);
      });
    var sb = document.getElementById("libSearch");
    if (sb) sb.addEventListener("input", libFilter);
    render();
  }
  window.__cloudLibReload = function () {
    try {
      CUSTOMLIB =
        JSON.parse(window.hubStorage.getItem("hubCustomLib") || "[]") || [];
    } catch (_) {}
    try {
      libSeq = 0;
      CUSTOMLIB.forEach(function (x) {
        var n = parseInt(String(x.id || "").replace("u", ""), 10);
        if (!isNaN(n) && n > libSeq) libSeq = n;
      });
    } catch (_) {}
    try {
      window.__LIBDATA = allItems();
    } catch (_) {}
    try {
      if (document.getElementById("libChips")) render();
    } catch (_) {}
  };
  if (document.readyState === "loading") {
    queueMicrotask(init);
  } else {
    init();
  }
})();
