// Migrated from Hub v1. Review domain assumptions separately from interface changes.

(function () {
  function fmtBRL(n) {
    return "R$ " + Math.round(n || 0).toLocaleString("pt-BR");
  }
  function fmtK(n) {
    n = Math.round(n || 0);
    return n >= 1000
      ? "R$ " + (n / 1000).toFixed(n % 1000 ? 1 : 0).replace(".", ",") + "k"
      : "R$ " + n;
  }
  function fmtPct(n) {
    var v = Math.round((n || 0) * 10) / 10;
    return (
      (Number.isInteger(v) ? v.toFixed(0) : v.toFixed(1)).replace(".", ",") +
      "%"
    );
  }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function pcNorm(t) {
    return (t == null ? "" : String(t))
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }
  var PC_SEARCH_IC =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
  function pcFilterGav() {
    var root = document.getElementById("ajRoot");
    if (!root) return;
    var aside = root.querySelector(".pc-gav");
    if (!aside) return;
    var nq = pcNorm(state.gavQuery);
    // filtra cada card (ativos gerais e RV estruturada)
    aside.querySelectorAll("[data-gavfind]").forEach(function (card) {
      var hay = pcNorm(card.getAttribute("data-gavfind"));
      card.style.display = !nq || hay.indexOf(nq) >= 0 ? "" : "none";
    });
    // esconde cabeçalhos de categoria que ficaram sem cards visíveis
    aside.querySelectorAll(".pc-gavcat").forEach(function (cat) {
      var anyVis = false,
        n = cat.nextElementSibling;
      while (n && !n.classList.contains("pc-gavcat")) {
        if (
          n.matches &&
          n.matches("[data-gavfind]") &&
          n.style.display !== "none"
        ) {
          anyVis = true;
          break;
        }
        n = n.nextElementSibling;
      }
      cat.style.display = anyVis ? "" : "none";
    });
    // mensagem "nenhum ativo encontrado" por lista
    aside.querySelectorAll(".pc-gavlist").forEach(function (list) {
      var cards = list.querySelectorAll("[data-gavfind]");
      if (!cards.length) return;
      var anyVis = Array.prototype.some.call(cards, function (c) {
        return c.style.display !== "none";
      });
      var emp = list.querySelector(".pc-gavnomatch");
      if (nq && !anyVis) {
        if (!emp) {
          emp = document.createElement("div");
          emp.className = "pc-gavnomatch";
          emp.textContent = "Nenhum ativo encontrado.";
          list.appendChild(emp);
        }
        emp.style.display = "";
      } else if (emp) {
        emp.style.display = "none";
      }
    });
  }
  var CATCOL = {
    "Renda Fixa": "#3DD68C",
    Previdência: "#E8709B",
    Multimercados: "#7C8CFF",
    "Fundo Aberto": "#5AC8A8",
    "Renda Variável": "#F26522",
    "Fundos Listados": "#FFB020",
    Alternativos: "#C77DFF",
    Internacional: "#36C5F0",
  };
  var ORDER = [
    "Renda Fixa",
    "Previdência",
    "Multimercados",
    "Renda Variável",
    "Fundos Listados",
    "Alternativos",
    "Internacional",
  ];
  var LIB = [
    {
      classe: "Renda Fixa",
      nome: "LCD",
      detalhe: "93/94% do CDI · 1–5 anos · isento de IR",
    },
    {
      classe: "Renda Fixa",
      nome: "LCI",
      detalhe: "IPCA + 6% a.a. · 1 a 3 anos · isento",
    },
    { classe: "Renda Fixa", nome: "CDB", detalhe: "14,7% a.a. · 3 a 5 anos" },
    { classe: "Renda Fixa", nome: "XP Brasil", detalhe: "15% a.a. · 5 anos" },
    {
      classe: "Renda Fixa",
      nome: "XP Brasil IPCA+",
      detalhe: "IPCA + 8,2% a.a.",
    },
    {
      classe: "Renda Fixa",
      nome: "Tesouro Selic",
      detalhe: "Pós-fixado · liquidez diária",
    },
    {
      classe: "Renda Fixa",
      nome: "NTN-B",
      detalhe: "IPCA + juro real · longo prazo",
    },
    {
      classe: "Renda Fixa",
      nome: "LTN",
      detalhe: "Prefixado · juro travado na largada",
    },
    {
      classe: "Renda Fixa",
      nome: "Debênture Pré (Infra)",
      detalhe: "Crédito privado prefixado · isenta",
    },
    {
      classe: "Multimercados",
      nome: "ACE Multicenários",
      detalhe: "Multimercado global · ~230% do CDI",
    },
    {
      classe: "Multimercados",
      nome: "XP Forças Armadas",
      detalhe: "Defesa EUA (Palantir e afins) · 5 anos",
    },
    {
      classe: "Multimercados",
      nome: "XP NTN-B Longa",
      detalhe: "NTN-B longa marcada a mercado · 1 ano",
    },
    {
      classe: "Renda Variável",
      nome: "BOVA11 Protegida",
      detalhe: "Proteção total · participa da alta · Collar UI 2 anos",
    },
    {
      classe: "Renda Variável",
      nome: "BPAC11 — SmartCupom",
      detalhe: "BTG · cupom pré ~8% em 8 meses",
    },
    {
      classe: "Renda Variável",
      nome: "ITUB — Fence",
      detalhe: "Itaú · proteção parcial, alta limitada · 1 ano",
    },
    {
      classe: "Renda Variável",
      nome: "Microsoft — Collar",
      detalhe: "Collar UI 2 anos · proteção total",
    },
    {
      classe: "Renda Variável",
      nome: "AXIA3 — Collar",
      detalhe: "Axia Energia · Collar UI 1,5 ano",
    },
    {
      classe: "Renda Variável",
      nome: "PETR4 — Collar",
      detalhe: "Petrobras · proteção total, alta limitada",
    },
    {
      classe: "Renda Variável",
      nome: "VALE3 — Fence",
      detalhe: "Vale · proteção parcial · 1 ano",
    },
    {
      classe: "Fundos Listados",
      nome: "JHSF Capital Malls",
      detalhe: "Shoppings premium · trophy assets",
    },
    {
      classe: "Fundos Listados",
      nome: "XPAG (Fiagro)",
      detalhe: "Crédito do agro · renda mensal isenta",
    },
    {
      classe: "Fundos Listados",
      nome: "XP Logístico Prime",
      detalhe: "Galpões logísticos AAA",
    },
    {
      classe: "Alternativos",
      nome: "Ouro — Retorno Otimizado",
      detalhe: "Ouro com estrutura otimizada · 3–5 anos",
    },
    {
      classe: "Alternativos",
      nome: "XP Tecnologia (QQQ)",
      detalhe: "Tecnologia EUA com proteção · 1 ano",
    },
    {
      classe: "Internacional",
      nome: "Wellington Global Quality",
      detalhe: "Ações EUA/Europa/RU · +75% em 3 anos",
    },
    {
      classe: "Internacional",
      nome: "CD de 1 ano (dólar)",
      detalhe: "Certificate of Deposit · pré em dólar",
    },
  ];
  function customLib() {
    try {
      return (
        JSON.parse(window.hubStorage.getItem("hubCustomLib") || "[]") || []
      );
    } catch (e) {
      return [];
    }
  }
  function gavetas() {
    return LIB.concat(
      customLib().map(function (x) {
        return { classe: x.classe, nome: x.nome, detalhe: x.detalhe || "" };
      }),
    );
  }

  var state = {
    origem: "import",
    cliente: "",
    atual: null,
    atualRaw: null,
    prev: [],
    vals: {},
    removed: {},
    added: [],
    libOpen: true,
    totalOverride: null,
    appliedModel: null,
    gavOpen: { geral: true, rv: false },
    gavQuery: "",
  };
  var seq = 0;
  function uid() {
    return "e" + ++seq;
  }
  var drag = null;
  var rvReg = {};

  function srcObj() {
    return state.origem === "sim"
      ? window.RICO_BRIDGE && window.RICO_BRIDGE.carteira
      : window.RICO_BRIDGE && window.RICO_BRIDGE.posicaoAtual;
  }
  function srcSig() {
    var pp = srcObj();
    if (!pp) return null;
    var arr = state.origem === "sim" ? pp.itens : pp.ativos;
    if (!arr || !arr.length) return null;
    return (
      state.origem +
      "|" +
      (pp.conta || pp.cliente || "") +
      "|" +
      arr.length +
      "|" +
      (pp.atualizadoEm || pp.template || "")
    );
  }
  function ensureLoaded() {
    var sig = srcSig();
    if (sig === state.sig && (state.atual || sig === null)) return;
    state.sig = sig;
    load();
  }
  function load() {
    var src = null;
    if (state.origem === "sim") {
      var c = window.RICO_BRIDGE && window.RICO_BRIDGE.carteira;
      if (c && c.itens && c.itens.length) {
        var b = c.patrimonio || 0;
        src = {
          conta: "",
          cliente: c.cliente || "",
          ativos: c.itens.map(function (it) {
            return {
              name: it.nome,
              categoria: it.classe,
              valor: ((Number(it.pct) || 0) / 100) * b,
              subcat: "",
              detalhe: it.detalhe || "",
            };
          }),
        };
      }
    } else {
      var p = window.RICO_BRIDGE && window.RICO_BRIDGE.posicaoAtual;
      if (p && p.ativos && p.ativos.length) {
        src = {
          conta: p.conta || "",
          cliente: "",
          ativos: p.ativos.map(function (a) {
            return {
              name: a.name,
              categoria: a.categoria || "Multimercados",
              valor: a.valor || 0,
              subcat: a.subcat || "",
              detalhe: a.detalhe || "",
            };
          }),
        };
      }
    }
    if (!src) {
      state.atual = null;
      return;
    }
    state.atualRaw = src.ativos
      .filter(function (a) {
        return a.categoria !== "Previdência";
      })
      .map(function (a) {
        return {
          name: a.name,
          categoria: a.categoria,
          valor: a.valor,
          subcat: a.subcat || "",
          detalhe: a.detalhe || "",
        };
      });
    state.prev = src.ativos.filter(function (a) {
      return a.categoria === "Previdência";
    });
    if (!state.cliente)
      state.cliente = src.cliente || (src.conta ? "Conta " + src.conta : "");
    state.conta = src.conta;
    state.totalOverride = null;
    rebuildScaled();
  }
  function rebuildScaled() {
    var raw = state.atualRaw || [];
    var rawSum = raw.reduce(function (s, a) {
      return s + a.valor;
    }, 0);
    var f =
      state.totalOverride > 0 && rawSum > 0 ? state.totalOverride / rawSum : 1;
    state.atual = raw.map(function (a, i) {
      return {
        name: a.name,
        categoria: a.categoria,
        valor: Math.round(a.valor * f),
        subcat: a.subcat,
        detalhe: a.detalhe,
        aid: "c" + i,
      };
    });
    state.vals = {};
    state.removed = {};
    state.added = [];
    state.atual.forEach(function (a) {
      state.vals[a.aid] = a.valor;
    });
  }

  function curVal(a) {
    return state.vals[a.aid] != null ? state.vals[a.aid] : a.valor;
  }
  function liquidAtual() {
    return state.atual
      ? state.atual.reduce(function (s, a) {
          return s + a.valor;
        }, 0)
      : 0;
  }
  function prevTotal() {
    return state.prev.reduce(function (s, a) {
      return s + a.valor;
    }, 0);
  }

  // classify into board columns
  function board() {
    var sair = [],
      manter = [],
      entrar = [];
    state.prev.forEach(function (a) {
      manter.push({
        k: "prev",
        grp: "Previdência",
        name: a.name,
        categoria: "Previdência",
        orig: a.valor,
        val: a.valor,
        mov: 0,
        acao: "Manter",
      });
    });
    state.atual.forEach(function (a) {
      var g = grpOf(a.categoria, a.name, a.detalhe, a.subcat);
      if (state.removed[a.aid]) {
        sair.push({
          k: "cur",
          aid: a.aid,
          grp: g,
          name: a.name,
          categoria: a.categoria,
          orig: a.valor,
          val: 0,
          mov: -a.valor,
          acao: "Sair",
        });
        return;
      }
      var v = curVal(a),
        d = v - a.valor;
      if (d < -0.5)
        sair.push({
          k: "cur",
          aid: a.aid,
          grp: g,
          name: a.name,
          categoria: a.categoria,
          orig: a.valor,
          val: v,
          mov: d,
          acao: "Reduzir",
        });
      else if (d > 0.5)
        entrar.push({
          k: "cur",
          aid: a.aid,
          grp: g,
          name: a.name,
          categoria: a.categoria,
          orig: a.valor,
          val: v,
          mov: d,
          acao: "Aumentar",
        });
      else
        manter.push({
          k: "cur",
          aid: a.aid,
          grp: g,
          name: a.name,
          categoria: a.categoria,
          orig: a.valor,
          val: v,
          mov: 0,
          acao: "Manter",
        });
    });
    state.added.forEach(function (x) {
      var g = grpOf(x.classe, x.nome, x.detalhe, "");
      entrar.push({
        k: "add",
        id: x.id,
        grp: g,
        name: x.nome,
        categoria: x.classe,
        orig: 0,
        val: x.valor || 0,
        mov: x.valor || 0,
        acao: "Entrar",
      });
    });
    return { sair: sair, manter: manter, entrar: entrar };
  }
  function totals(b) {
    var vender = -b.sair.reduce(function (s, x) {
      return s + x.mov;
    }, 0);
    var comprar = b.entrar.reduce(function (s, x) {
      return s + x.mov;
    }, 0);
    var lb = liquidAtual();
    return {
      vender: vender,
      comprar: comprar,
      liquid: lb,
      prev: prevTotal(),
      patrim: lb,
      giro: lb > 0 ? (comprar / lb) * 100 : 0,
      saldo: comprar - vender,
    };
  }
  function compAtual() {
    var m = {},
      t = 0;
    state.atual.forEach(function (a) {
      var g = grpOf(a.categoria, a.name, a.detalhe, a.subcat);
      m[g] = (m[g] || 0) + a.valor;
      t += a.valor;
    });
    state.prev.forEach(function (a) {
      m["Previdência"] = (m["Previdência"] || 0) + a.valor;
      t += a.valor;
    });
    return { m: m, t: t };
  }
  function compProp() {
    var m = {},
      t = 0;
    state.atual.forEach(function (a) {
      if (state.removed[a.aid]) return;
      var v = curVal(a);
      var g = grpOf(a.categoria, a.name, a.detalhe, a.subcat);
      m[g] = (m[g] || 0) + v;
      t += v;
    });
    state.added.forEach(function (x) {
      var g = grpOf(x.classe, x.nome, x.detalhe, "");
      m[g] = (m[g] || 0) + (x.valor || 0);
      t += x.valor || 0;
    });
    state.prev.forEach(function (a) {
      m["Previdência"] = (m["Previdência"] || 0) + a.valor;
      t += a.valor;
    });
    return { m: m, t: t };
  }

  function rfSub(name, detalhe, subcat) {
    var s = (subcat || "").toLowerCase();
    if (s) {
      if (/infla/.test(s)) return "Inflação";
      if (/pr[eé]|prefix/.test(s)) return "Pré-fixado";
      if (/p[óo]s|cdi|selic/.test(s)) return "Pós-fixado";
    }
    var b = ((name || "") + " " + (detalhe || "")).toLowerCase();
    if (/ipca|ntn-?b|infla/.test(b)) return "Inflação";
    if (/\blcd\b/.test(b)) return "Pós-fixado";
    if (
      /pr[eé]\b|prefix|\bltn\b/.test(b) ||
      (/\d+\s*%\s*a\.?\s*a/.test(b) && !/cdi/.test(b))
    )
      return "Pré-fixado";
    if (/cdi|selic|p[óo]s/.test(b)) return "Pós-fixado";
    return "Outros";
  }
  var RFGROUPS = ["Pós-fixado", "Pré-fixado", "Inflação", "Outros"];
  var RFCOL = {
    "Pós-fixado": "#3DD68C",
    "Pré-fixado": "#5AC8FA",
    Inflação: "#FFC857",
    Outros: "#9AA2D0",
  };
  function grpOf(cat, name, detalhe, subcat) {
    return cat === "Renda Fixa"
      ? "Renda Fixa · " + rfSub(name, detalhe, subcat)
      : cat;
  }
  function colorOf(grp) {
    if (grp.indexOf("Renda Fixa · ") === 0) {
      return RFCOL[grp.slice("Renda Fixa · ".length)] || "#3DD68C";
    }
    return CATCOL[grp] || "#9AA2D0";
  }
  function orderedGroups() {
    var arr = [];
    ORDER.forEach(function (cat) {
      if (cat === "Renda Fixa") {
        RFGROUPS.forEach(function (s) {
          arr.push("Renda Fixa · " + s);
        });
      } else {
        arr.push(cat);
      }
    });
    return arr;
  }
  function groupByGrp(items) {
    var g = {};
    items.forEach(function (x) {
      var k = x.grp || x.categoria;
      (g[k] = g[k] || []).push(x);
    });
    return g;
  }
  function rfBreak() {
    var m = {},
      t = 0;
    state.atual.forEach(function (a) {
      if (a.categoria !== "Renda Fixa") return;
      var s = rfSub(a.name, a.detalhe, a.subcat);
      m[s] = (m[s] || 0) + a.valor;
      t += a.valor;
    });
    return { m: m, t: t };
  }

  function colHTML(title, color, items, colKey) {
    var h =
      '<div class="pc-col" data-col="' +
      colKey +
      '"><div class="pc-coltitle" style="color:' +
      color +
      '">' +
      title +
      "</div>";
    if (colKey === "sair")
      h +=
        '<div class="pc-trash" data-col="sair">🗑️ Arraste aqui o que vai sair</div>';
    if (!items.length && colKey !== "sair")
      h += '<div class="pc-empty">—</div>';
    var g = groupByGrp(items);
    orderedGroups().forEach(function (grp) {
      var arr = g[grp];
      if (!arr || !arr.length) return;
      var c = colorOf(grp);
      var tv = arr.reduce(function (s, x) {
        return s + (colKey === "sair" ? Math.abs(x.mov || 0) : x.val || 0);
      }, 0);
      h +=
        '<div class="pc-cat" style="border-left-color:' +
        c +
        '"><span style="color:' +
        c +
        '">' +
        grp +
        '</span><span class="pc-catsub">' +
        fmtBRL(tv) +
        "</span></div>";
      arr.forEach(function (x) {
        var mv =
          x.mov > 0
            ? "+" + fmtBRL(x.mov)
            : x.mov < 0
              ? "−" + fmtBRL(-x.mov)
              : "manter";
        var mc = x.mov > 0 ? "#3DD68C" : x.mov < 0 ? "#FF6B6B" : "#9AA2D0";
        var draggable =
          colKey === "manter" && x.k === "cur"
            ? ' draggable="true" data-drag="cur:' + x.aid + '"'
            : "";
        h +=
          '<div class="pc-card"' +
          draggable +
          ">" +
          '<div class="pc-cardtop"><span class="pc-name">' +
          (x.k === "prev" ? "🔒 " : "") +
          esc(x.name) +
          "</span>";
        // controls
        if (colKey === "sair")
          h +=
            '<button class="pc-x undo" data-undo="' +
            x.aid +
            '" title="Voltar">↩</button>';
        else if (x.k === "add")
          h +=
            '<button class="pc-x" data-rmadd="' +
            x.id +
            '" title="Remover">✕</button>';
        else if (x.k === "cur")
          h +=
            '<button class="pc-x sell" data-sell="' +
            x.aid +
            '" title="Vender (mover p/ Sair)">✕</button>';
        h += "</div>";
        // value row
        if (x.k === "prev") {
          h +=
            '<div class="pc-cardbot"><span class="pc-mut">' +
            fmtBRL(x.val) +
            '</span><span class="pc-mut">mantida</span></div>';
        } else if (colKey === "sair" && x.acao === "Sair") {
          h +=
            '<div class="pc-cardbot"><span class="pc-mut">' +
            fmtBRL(x.orig) +
            '</span><span style="color:' +
            mc +
            ';font-weight:700">' +
            mv +
            "</span></div>";
        } else {
          var inpId = x.k === "add" ? "add:" + x.id : "cur:" + x.aid;
          h +=
            '<div class="pc-cardbot"><span class="pc-mut">R$</span><input class="pc-val" data-val="' +
            inpId +
            '" type="number" step="1000" min="0" value="' +
            Math.round(x.val) +
            '">' +
            '<span style="color:' +
            mc +
            ';font-weight:700;margin-left:auto">' +
            mv +
            "</span></div>";
        }
        h += "</div>";
      });
    });
    h += "</div>";
    return h;
  }

  function render() {
    var root = document.getElementById("ajRoot");
    if (!root) return;
    ensureLoaded();
    var simExists = !!(
      window.RICO_BRIDGE &&
      window.RICO_BRIDGE.carteira &&
      window.RICO_BRIDGE.carteira.itens &&
      window.RICO_BRIDGE.carteira.itens.length
    );
    var h = "";
    h +=
      '<div class="pc-head"><div class="logo">rico</div><div class="pc-sub">Propor Carteira · arraste o que sai, adicione das gavetas o que entra, e gere a proposta</div></div>';

    h +=
      '<div class="pc-controls"><span class="pc-lbl">Carteira do cliente:</span>' +
      '<button data-org="import" class="ajbtn' +
      (state.origem === "import" ? " on" : "") +
      '">Posição importada</button>' +
      '<button data-org="sim" class="ajbtn' +
      (state.origem === "sim" ? " on" : "") +
      '">Carteira do Simulador</button>' +
      '<button data-ajimport class="ajbtn">Importar Excel…</button></div>';

    if (!state.atual) {
      h +=
        '<div class="pc-prompt">' +
        (state.origem === "sim"
          ? "Monte uma carteira no <b>Montar a Carteira</b> para usá-la aqui."
          : 'Importe a <b>Posição Consolidada</b> (.xlsx) do cliente.<div style="margin-top:16px"><button data-ajimport class="ajbtn primary">Importar Excel…</button></div>') +
        "</div>";
      root.innerHTML = h;
      bind();
      return;
    }
    var b = board(),
      t = totals(b);
    h += '<div class="pc-setup">';
    h +=
      '<div class="pc-id"><div><label class="pc-flbl">Cliente</label><input id="ajCliente" class="pc-input" type="text" value="' +
      esc(state.cliente) +
      '" placeholder="Nome do cliente"></div>' +
      '<div><label class="pc-flbl">Valor total da carteira</label><div class="pc-basewrap"><span>R$</span><input id="ajBase" class="pc-input pc-baseinp" type="number" step="1000" min="0" value="' +
      Math.round(liquidAtual()) +
      '"></div></div>' +
      '<div class="pc-chips">' +
      chip("Patrimônio", fmtBRL(t.patrim), "#cfd4ef") +
      chip("A vender", fmtBRL(t.vender), "#FF6B6B") +
      chip("A comprar", fmtBRL(t.comprar), "#3DD68C") +
      chip("Giro", fmtPct(t.giro), "#FFB020") +
      chip(
        t.saldo >= 0 ? "Aporte" : "Resgate",
        fmtBRL(Math.abs(t.saldo)),
        t.saldo >= 0 ? "#3DD68C" : "#FF6B6B",
      ) +
      "</div></div>";
    var rfb = rfBreak();
    if (rfb.t > 0) {
      h +=
        '<div class="pc-rfsum"><span class="pc-rfsum-lbl">Renda Fixa por indexador (atual):</span>';
      RFGROUPS.forEach(function (s) {
        if ((rfb.m[s] || 0) > 0.5) {
          var col = RFCOL[s];
          h +=
            '<span class="pc-rfpill" style="border-color:' +
            col +
            "66;color:" +
            col +
            '">' +
            s +
            " " +
            fmtPct((rfb.m[s] / rfb.t) * 100) +
            "</span>";
        }
      });
      h += "</div>";
    }

    h +=
      '<div class="pc-models"><span class="pc-lbl">Propor modelo sobre a atual:</span><button data-model="Conservadora" class="ajbtn">Conservadora</button><button data-model="Moderada" class="ajbtn">Moderada</button><button data-model="Sofisticada" class="ajbtn">Sofisticada</button><button data-model="__simulador" class="ajbtn">Carteira do Simulador</button><button data-model="__reset" class="ajbtn">Limpar proposta</button><button id="ajDistribuir" class="ajbtn" title="Distribui o patrimonio igualmente entre os ativos da proposta">Distribuir</button></div>';
    h += "</div>";
    h += '<div class="pc-main' + (state.gavOpen.rv ? " rvwide" : "") + '">';
    h += gavetaHTML();
    h += '<div class="pc-board pc-board4">';
    h += colHTML("Manter", "#9AA2D0", b.manter, "manter");
    h += colHTML("Sair / Reduzir", "#FF6B6B", b.sair, "sair");
    h += colHTML("Entrar / Aumentar", "#3DD68C", b.entrar, "entrar");
    h += previewCol();
    h += "</div></div>";

    h +=
      '<div class="pc-actions"><button id="ajPNG" class="ajbtn primary">Gerar proposta (PNG antes/depois)</button><button id="ajPlano" class="ajbtn">Plano de Ajuste (PDF)</button><button id="ajXLS" class="ajbtn">Baixar Excel (execução)</button></div>';
    h +=
      '<div class="pc-disc">Arraste um ativo de "Manter" para "Sair" para vendê-lo, ou use ✕. Edite o R$ de cada ativo para ajustar. Abra as gavetas na lateral esquerda (Ativos gerais / RV estruturada) e use + para adicionar à coluna Entrar. Previdência é mantida sem movimentação. Material de apoio interno — não constitui recomendação ou oferta.</div>';

    root.innerHTML = h;
    bind();
  }
  function gavetaHTML() {
    var G = gavetas();
    rvReg = {};
    var groups = [
      {
        key: "geral",
        icon: "📁",
        label: "Ativos gerais",
        color: "#FF8B52",
        classes: [
          "Renda Fixa",
          "Multimercados",
          "Fundo Aberto",
          "Fundos Listados",
          "Alternativos",
          "Internacional",
        ],
      },
      {
        key: "rv",
        icon: "🧰",
        label: "RV estruturada",
        color: "#5B8DEF",
        classes: ["Renda Variável"],
      },
    ];
    var nq = pcNorm(state.gavQuery);
    var h =
      '<aside class="pc-gav' +
      (state.gavOpen.rv ? " rvopen" : "") +
      '"><div class="pc-gavtitle">Gavetas de ativos</div>';
    h +=
      '<div class="pc-gavsearch"><span class="pc-gavsearch-ic">' +
      PC_SEARCH_IC +
      '</span><input id="pcGavSearch" class="pc-gavsearch-inp" type="text" placeholder="Pesquisar ativo na gaveta..." value="' +
      esc(state.gavQuery) +
      '"></div>';
    groups.forEach(function (grp) {
      var open = !!state.gavOpen[grp.key];
      if (nq) open = true; // com busca ativa, mantém as gavetas abertas para mostrar resultados
      h +=
        '<button class="pc-gavpill' +
        (open ? " on" : "") +
        '" data-gav="' +
        grp.key +
        '" style="border-color:' +
        grp.color +
        "66;color:" +
        grp.color +
        '"><span class="pc-gavico">' +
        grp.icon +
        '</span><span class="pc-gavlbl">' +
        grp.label +
        '</span><span class="pc-gavarrow">' +
        (open ? "▴" : "▾") +
        "</span></button>";
      if (!open) return;
      if (grp.key === "rv") {
        h += rvGavList();
        return;
      }
      h += '<div class="pc-gavlist">';
      grp.classes.forEach(function (cl) {
        var items = G.map(function (a, i) {
          return { a: a, i: i };
        }).filter(function (o) {
          return o.a.classe === cl;
        });
        if (!items.length) return;
        var c = CATCOL[cl] || "#9AA2D0";
        h +=
          '<div class="pc-gavcat" style="color:' +
          c +
          '"><span style="background:' +
          c +
          '"></span>' +
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
          (window.__hubClassLabel ? window.__hubClassLabel(cl) : cl) +
          "</div>";
        items.forEach(function (o) {
          h +=
            '<div class="pc-gavcard" draggable="true" data-dragidx="' +
            o.i +
            '" data-gavfind="' +
            esc(
              (o.a.nome || "") +
                " " +
                (o.a.detalhe || "") +
                " " +
                (o.a.classe || ""),
            ) +
            '"><div class="pc-gavinfo"><div class="pc-gavname">' +
            esc(o.a.nome) +
            '</div><div class="pc-gavdet">' +
            esc(o.a.detalhe || "") +
            '</div></div><button class="pc-add" data-addidx="' +
            o.i +
            '" title="Adicionar a Entrar">+</button></div>';
        });
      });
      h += "</div>";
    });
    h += "</aside>";
    return h;
  }
  function rvGavList() {
    var RC = window.__rvCatalog;
    if (!RC) {
      try {
        if (window._toolInit && window._toolInit["construtor"])
          window._toolInit["construtor"]();
      } catch (e) {}
      RC = window.__rvCatalog;
    }
    if (!RC)
      return '<div class="pc-gavlist"><div class="pc-gavrv-empty">Catálogo indisponível — abra a aba <b>Renda Variável</b> uma vez e volte.</div></div>';
    var h = '<div class="pc-gavlist pc-gavrv">';
    function sub(title, color, ops, kind) {
      if (!ops || !ops.length) return;
      h +=
        '<div class="pc-gavcat" style="color:' +
        color +
        '"><span style="background:' +
        color +
        '"></span>' +
        title +
        "</div>";
      ops.forEach(function (op) {
        var key = kind + ":" + op.id;
        rvReg[key] = { op: op, kind: kind };
        var meta =
          kind === "quanto"
            ? "Prazo " + esc(op.fixing)
            : esc(op.ativo) + (op.setor ? " · " + esc(op.setor) : "");
        var pay = window.__payoffTable ? window.__payoffTable(op, false) : "";
        h +=
          '<div class="pc-rvcard" data-gavfind="' +
          esc(
            (op.nome || "") +
              " " +
              (op.ativo || "") +
              " " +
              (op.setor || "") +
              " " +
              (op.fixing || "") +
              " " +
              title,
          ) +
          '"><div class="pc-rvtop"><div><div class="pc-rvname">' +
          esc(op.nome) +
          '</div><div class="pc-rvmeta">' +
          meta +
          '</div></div><button class="pc-add" data-addop="' +
          key +
          '" title="Adicionar a Entrar">+</button></div>' +
          (pay ? '<div class="pc-rvpay">' + pay + "</div>" : "") +
          "</div>";
      });
    }
    sub("Proteção (Collar / Fence)", "#FF8B52", RC.ops, "protecao");
    sub("Cupom pré-fixado", "#E0457B", RC.cupom, "cupom");
    sub("Quanto Internacional", "#36C5F0", RC.quanto, "quanto");
    h += "</div>";
    return h;
  }
  function addOp(key) {
    var e = rvReg[key];
    if (!e) return;
    var op = e.op,
      kind = e.kind;
    var RC = window.__rvCatalog || {};
    var classe = kind === "quanto" ? "Internacional" : "Renda Variável";
    var det =
      kind === "quanto"
        ? RC.opDetalheQuanto
          ? RC.opDetalheQuanto(op)
          : ""
        : kind === "cupom"
          ? RC.cupomDetalhe
            ? RC.cupomDetalhe(op)
            : ""
          : RC.opDetalhe
            ? RC.opDetalhe(op)
            : "";
    var def = Math.round((liquidAtual() * 0.05) / 1000) * 1000;
    state.added.push({
      id: uid(),
      nome: op.nome,
      classe: classe,
      valor: def || 1000,
      detalhe: det,
    });
    render();
  }
  function chip(l, v, c) {
    return (
      '<div class="pc-chip"><div class="pc-chiplbl">' +
      esc(l) +
      '</div><div class="pc-chipval" style="color:' +
      c +
      '">' +
      esc(v) +
      "</div></div>"
    );
  }

  function bind() {
    var root = document.getElementById("ajRoot");
    if (!root) return;
    root.querySelectorAll("[data-org]").forEach(function (b) {
      b.onclick = function () {
        state.origem = b.getAttribute("data-org");
        state.cliente = "";
        state.added = [];
        state.sig = null;
        render();
      };
    });
    var cli = document.getElementById("ajCliente");
    if (cli)
      cli.oninput = function () {
        state.cliente = cli.value;
      };
    var bs = document.getElementById("ajBase");
    if (bs)
      bs.onchange = function () {
        var v = Number(bs.value) || 0;
        state.totalOverride = v > 0 ? v : null;
        rebuildScaled();
        render();
      };
    root.querySelectorAll("[data-model]").forEach(function (b) {
      b.onclick = function () {
        applyModel(b.getAttribute("data-model"));
      };
    });
    var lt = root.querySelector("[data-libtoggle]");
    if (lt)
      lt.onclick = function () {
        state.libOpen = !state.libOpen;
        render();
      };
    root.querySelectorAll("[data-gav]").forEach(function (b) {
      b.onclick = function () {
        var k = b.getAttribute("data-gav");
        state.gavOpen[k] = !state.gavOpen[k];
        render();
      };
    });
    var gs = document.getElementById("pcGavSearch");
    if (gs) {
      gs.oninput = function () {
        var was = pcNorm(state.gavQuery),
          now = pcNorm(gs.value);
        state.gavQuery = gs.value;
        // só re-renderiza quando o estado vazio<->não-vazio muda (abre/fecha as gavetas); senão filtra ao vivo
        if (!was !== !now) {
          var pos = gs.selectionStart;
          render();
          var el2 = document.getElementById("pcGavSearch");
          if (el2) {
            el2.focus();
            try {
              el2.setSelectionRange(pos, pos);
            } catch (_) {}
          }
        } else {
          pcFilterGav();
        }
      };
    }
    pcFilterGav();
    root.querySelectorAll("[data-addidx]").forEach(function (b) {
      b.onclick = function () {
        addLib(+b.getAttribute("data-addidx"));
      };
    });
    root.querySelectorAll("[data-addop]").forEach(function (b) {
      b.onclick = function () {
        addOp(b.getAttribute("data-addop"));
      };
    });
    root.querySelectorAll("[data-dragidx]").forEach(function (e2) {
      e2.addEventListener("dragstart", function (ev) {
        drag = "lib:" + e2.getAttribute("data-dragidx");
        try {
          ev.dataTransfer.effectAllowed = "copy";
        } catch (_) {}
      });
      e2.addEventListener("dragend", function () {
        drag = null;
      });
    });
    root.querySelectorAll("[data-sell]").forEach(function (b) {
      b.onclick = function () {
        state.removed[b.getAttribute("data-sell")] = true;
        render();
      };
    });
    root.querySelectorAll("[data-undo]").forEach(function (b) {
      b.onclick = function () {
        var n = b.getAttribute("data-undo");
        delete state.removed[n];
        state.vals[n] = findOrig(n);
        render();
      };
    });
    root.querySelectorAll("[data-rmadd]").forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute("data-rmadd");
        state.added = state.added.filter(function (x) {
          return x.id !== id;
        });
        render();
      };
    });
    root.querySelectorAll("[data-libadd]").forEach(function (b) {
      b.onclick = function () {
        addLib(+b.getAttribute("data-libadd"));
      };
    });
    root.querySelectorAll(".pc-val").forEach(function (inp) {
      inp.onchange = function () {
        var key = inp.getAttribute("data-val"),
          v = Number(inp.value) || 0;
        if (key.indexOf("add:") === 0) {
          var id = key.slice(4);
          var it = state.added.filter(function (x) {
            return x.id === id;
          })[0];
          if (it) it.valor = v;
        } else {
          var nm = key.slice(4);
          state.vals[nm] = v;
        }
        render();
      };
    });
    var dist = document.getElementById("ajDistribuir");
    if (dist) dist.onclick = distribuirPropor;
    var png = document.getElementById("ajPNG");
    if (png) png.onclick = genPNG;
    var plano = document.getElementById("ajPlano");
    if (plano) plano.onclick = genPlanoPDF;
    var xls = document.getElementById("ajXLS");
    if (xls) xls.onclick = exportXLS;
    // importar excel
    var fi = document.getElementById("ajFile");
    root.querySelectorAll("[data-ajimport]").forEach(function (b) {
      b.onclick = function () {
        if (typeof window.RICO_importPosicaoFile !== "function") {
          try {
            if (window._toolInit && window._toolInit["aderencia"])
              window._toolInit["aderencia"]();
          } catch (e) {}
        }
        if (fi) fi.click();
      };
    });
    if (fi)
      fi.onchange = function () {
        var f = fi.files && fi.files[0];
        if (!f) return;
        if (typeof window.RICO_importPosicaoFile !== "function") {
          alert("Importador indisponível — abra a aba Aderência uma vez.");
          return;
        }
        root.querySelectorAll("[data-ajimport]").forEach(function (b) {
          b.textContent = "Importando…";
        });
        window.RICO_importPosicaoFile(f, function () {
          state.origem = "import";
          state.cliente = "";
          state.added = [];
          try {
            fi.value = "";
          } catch (e) {}
          render();
        });
      };
    // drag and drop
    root.querySelectorAll("[data-drag]").forEach(function (el) {
      el.addEventListener("dragstart", function (e) {
        drag = el.getAttribute("data-drag");
        try {
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", drag);
        } catch (_) {}
      });
      el.addEventListener("dragend", function () {
        drag = null;
        root.querySelectorAll(".pc-col,.pc-trash").forEach(function (c) {
          c.classList.remove("drop");
        });
      });
    });
    root.querySelectorAll("[data-col]").forEach(function (col) {
      col.addEventListener("dragover", function (e) {
        if (!drag) return;
        var ck = col.getAttribute("data-col");
        if (
          (ck === "sair" && drag.indexOf("cur:") === 0) ||
          (ck === "entrar" && drag.indexOf("lib:") === 0)
        ) {
          e.preventDefault();
          col.classList.add("drop");
        }
      });
      col.addEventListener("dragleave", function () {
        col.classList.remove("drop");
      });
      col.addEventListener("drop", function (e) {
        if (!drag) return;
        e.preventDefault();
        var ck = col.getAttribute("data-col");
        if (ck === "sair" && drag.indexOf("cur:") === 0) {
          state.removed[drag.slice(4)] = true;
          render();
        } else if (ck === "entrar" && drag.indexOf("lib:") === 0) {
          addLib(+drag.slice(4));
        }
        drag = null;
      });
    });
  }
  function findOrig(n) {
    var a = state.atual.filter(function (x) {
      return x.aid === n;
    })[0];
    return a ? a.valor : 0;
  }
  // Distribui o patrimonio IGUALMENTE entre os ativos que permanecem na proposta
  // (atuais nao-vendidos + adicionados). Soma EXATA = patrimonio (ultimo absorve o resto),
  // entao Patrimonio/A vender/A comprar/Giro permanecem coerentes.
  function distribuirPropor() {
    try {
      if (!state.atual) {
        return;
      }
      var keep = [];
      state.atual.forEach(function (a) {
        if (!state.removed[a.aid]) keep.push({ t: "cur", aid: a.aid });
      });
      (state.added || []).forEach(function (x) {
        keep.push({ t: "add", id: x.id });
      });
      var n = keep.length;
      if (n === 0) {
        alert(
          "Nao ha ativos para distribuir. Adicione ativos das gavetas ou nao remova todos.",
        );
        return;
      }
      var patrim = liquidAtual();
      if (!(patrim > 0)) {
        return;
      }
      var base = Math.round(patrim / n);
      var acc = 0;
      keep.forEach(function (k, idx) {
        var v = idx === n - 1 ? Math.round(patrim - acc) : base;
        acc += v;
        if (k.t === "cur") {
          state.vals[k.aid] = v;
        } else {
          var it = (state.added || []).filter(function (x) {
            return x.id === k.id;
          })[0];
          if (it) it.valor = v;
        }
      });
      state.appliedModel = null;
      render();
    } catch (e) {
      try {
        console.error(e);
      } catch (_) {}
    }
  }
  function applyModel(name) {
    if (name === "__reset") {
      state.appliedModel = null;
      state.vals = {};
      state.removed = {};
      state.added = [];
      state.atual.forEach(function (a) {
        state.vals[a.aid] = a.valor;
      });
      render();
      return;
    }
    var items;
    if (name === "__simulador") {
      var sc = (window.__getSimCarteira ? window.__getSimCarteira() : []) || [];
      if (!sc.length) {
        alert(
          "Monte uma carteira no Montar a Carteira primeiro (com as alocações) e tente de novo.",
        );
        return;
      }
      items = sc;
      state.appliedModel = name;
    } else {
      var T = window.RICO_TEMPLATES;
      if (!T) {
        try {
          if (window._toolInit && window._toolInit["construtor"])
            window._toolInit["construtor"]();
        } catch (e) {}
        T = window.RICO_TEMPLATES;
      }
      if (!T || typeof T[name] !== "function") {
        alert("Modelo indisponível.");
        return;
      }
      state.appliedModel = name;
      items = T[name]();
    }
    var base = liquidAtual();
    var tgt = {},
      modByGrp = {};
    items.forEach(function (it) {
      var g = grpOf(it.classe, it.nome, it.detalhe, "");
      var val = ((Number(it.pct) || 0) / 100) * base;
      tgt[g] = (tgt[g] || 0) + val;
      (modByGrp[g] = modByGrp[g] || []).push({
        nome: it.nome,
        classe: it.classe,
        detalhe: it.detalhe || "",
        pct: Number(it.pct) || 0,
      });
    });
    var curByGrp = {},
      curAssetsByGrp = {};
    state.atual.forEach(function (a) {
      var g = grpOf(a.categoria, a.name, a.detalhe, a.subcat);
      curByGrp[g] = (curByGrp[g] || 0) + a.valor;
      (curAssetsByGrp[g] = curAssetsByGrp[g] || []).push(a);
    });
    state.vals = {};
    state.removed = {};
    state.added = [];
    state.atual.forEach(function (a) {
      state.vals[a.aid] = a.valor;
    });
    var grps = {};
    Object.keys(tgt).forEach(function (g) {
      grps[g] = 1;
    });
    Object.keys(curByGrp).forEach(function (g) {
      grps[g] = 1;
    });
    Object.keys(grps).forEach(function (g) {
      var cur = curByGrp[g] || 0,
        t = tgt[g] || 0,
        assets = curAssetsByGrp[g] || [];
      if (t <= 0.5 && cur > 0) {
        assets.forEach(function (a) {
          state.removed[a.aid] = true;
        });
        return;
      }
      if (t >= cur - 0.5) {
        var gap = t - cur;
        if (gap > 0.5) {
          var sum =
            (modByGrp[g] || []).reduce(function (s, m) {
              return s + m.pct;
            }, 0) || 1;
          (modByGrp[g] || []).forEach(function (m) {
            var add = gap * (m.pct / sum);
            if (add > 0.5)
              state.added.push({
                id: uid(),
                nome: m.nome,
                classe: m.classe,
                detalhe: m.detalhe,
                valor: Math.round(add),
              });
          });
        }
      } else {
        var f = t / cur;
        assets.forEach(function (a) {
          state.vals[a.aid] = Math.round(a.valor * f);
        });
      }
    });
    render();
  }
  function previewCol() {
    var cp = compProp();
    var tot = cp.t || 0;
    var h =
      '<div class="pc-col pc-preview"><div class="pc-coltitle" style="color:#FFB020">Prévia da carteira</div>';
    var any = false;
    orderedGroups().forEach(function (g) {
      var v = cp.m[g] || 0;
      if (v < 0.5) return;
      any = true;
      var pct = tot > 0 ? (v / tot) * 100 : 0;
      var c = colorOf(g);
      h +=
        '<div class="pc-pvrow"><div class="pc-pvtop"><span style="color:' +
        c +
        '">' +
        g +
        '</span><span class="pc-pvpct" style="color:' +
        c +
        '">' +
        fmtPct(pct) +
        '</span></div><div class="pc-pvbar"><div style="width:' +
        Math.min(100, pct).toFixed(1) +
        "%;background:" +
        c +
        '"></div></div><div class="pc-pvval">' +
        fmtBRL(v) +
        "</div></div>";
    });
    if (!any) h += '<div class="pc-empty">—</div>';
    h += '<div class="pc-pvtot">Total proposto: ' + fmtBRL(tot) + "</div>";
    return h;
  }
  function addLib(i) {
    var a = gavetas()[i];
    if (!a) return;
    var def = Math.round((liquidAtual() * 0.05) / 1000) * 1000;
    state.added.push({
      id: uid(),
      nome: a.nome,
      classe: a.classe,
      valor: def || 1000,
      detalhe: a.detalhe || "",
    });
    render();
  }

  // ===== EXCEL =====
  function rows() {
    var b = board(),
      r = [];
    b.sair.forEach(function (x) {
      r.push(x);
    });
    b.entrar.forEach(function (x) {
      r.push(x);
    });
    b.manter.forEach(function (x) {
      r.push(x);
    });
    return r;
  }
  function exportXLS() {
    if (typeof XLSX === "undefined") {
      alert("Biblioteca de planilha carregando.");
      return;
    }
    var b = board(),
      t = totals(b);
    var aoa = [
      ["Ação", "Ativo", "Classe", "R$ atual", "R$ proposto", "R$ movimento"],
    ];
    rows().forEach(function (x) {
      aoa.push([
        x.acao,
        x.name,
        x.categoria,
        Math.round(x.orig),
        Math.round(x.val),
        Math.round(x.mov),
      ]);
    });
    aoa.push([]);
    aoa.push(["Patrimônio", "", "", "", Math.round(t.patrim), ""]);
    aoa.push(["A vender", "", "", "", "", -Math.round(t.vender)]);
    aoa.push(["A comprar", "", "", "", "", Math.round(t.comprar)]);
    var ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = [
      { wch: 11 },
      { wch: 40 },
      { wch: 16 },
      { wch: 13 },
      { wch: 13 },
      { wch: 14 },
    ];
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Proposta");
    XLSX.writeFile(wb, "Proposta de Carteira.xlsx");
  }

  // ===== PNG antes/depois =====
  function proposedHoldings() {
    var out = [];
    state.atual.forEach(function (a) {
      if (state.removed[a.aid]) return;
      var v = curVal(a);
      if (v > 0.5)
        out.push({
          nome: a.name,
          classe: a.categoria,
          valor: v,
          detalhe: a.detalhe || "",
        });
    });
    state.added.forEach(function (x) {
      if ((x.valor || 0) > 0.5)
        out.push({
          nome: x.nome,
          classe: x.classe,
          valor: x.valor,
          detalhe: x.detalhe || "",
        });
    });
    state.prev.forEach(function (a) {
      out.push({
        nome: a.name,
        classe: "Previdência",
        valor: a.valor,
        detalhe: "Previdência (mantida)",
      });
    });
    return out;
  }
  // ===================== PLANO DE AJUSTE DE CARTEIRA (PDF) =====================
  function planoContaLabel() {
    var c = (state.conta || "").trim();
    var nome = (state.cliente || "").trim();
    if (c && nome) return c + " · " + nome;
    if (c) return c;
    if (nome) return nome;
    return "Cliente";
  }
  function planoFileSafe(s) {
    return (
      String(s || "Cliente")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^A-Za-z0-9._-]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 60) || "Cliente"
    );
  }
  function planoData() {
    var b = board(),
      t = totals(b);
    function rowsFrom(items) {
      var out = [];
      items.forEach(function (x) {
        var v = x.mov != null ? x.mov : x.val || 0;
        out.push({ nome: x.name, classe: x.categoria || "", valor: v });
      });
      return out;
    }
    return {
      conta: planoContaLabel(),
      data: new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      patrim: t.patrim,
      vender: t.vender,
      comprar: t.comprar,
      giro: t.giro,
      sair: rowsFrom(b.sair),
      entrar: rowsFrom(b.entrar),
      manter: b.manter.map(function (x) {
        return { nome: x.name, classe: x.categoria || "", valor: x.val || 0 };
      }),
    };
  }
  function ensureJsPDF(cb) {
    if (window.jspdf && window.jspdf.jsPDF) {
      cb(window.jspdf.jsPDF);
      return;
    }
    if (window.__planoJsPDFLoading) {
      window.__planoJsPDFLoading.push(cb);
      return;
    }
    window.__planoJsPDFLoading = [cb];
    var done = false;
    function finish(ok) {
      if (done) return;
      done = true;
      var q = window.__planoJsPDFLoading || [];
      window.__planoJsPDFLoading = null;
      q.forEach(function (f) {
        try {
          f(ok && window.jspdf ? window.jspdf.jsPDF : null);
        } catch (_) {}
      });
    }
    var to = setTimeout(function () {
      finish(false);
    }, 7000);
    var s = document.createElement("script");
    s.src =
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload = function () {
      clearTimeout(to);
      finish(true);
    };
    s.onerror = function () {
      clearTimeout(to);
      finish(false);
    };
    document.head.appendChild(s);
  }
  function genPlanoPDF() {
    try {
      if (!state.atual) {
        showToast("Monte a proposta do cliente primeiro.");
        return;
      }
      var d = planoData();
      var hasMov = d.sair.length || d.entrar.length;
      if (!hasMov) {
        showToast(
          "Monte a proposta (algo a vender ou comprar) antes de gerar o plano.",
        );
        return;
      }
      var btn = document.getElementById("ajPlano");
      var orig = btn ? btn.textContent : "";
      if (btn) {
        btn.textContent = "Gerando…";
      }
      ensureJsPDF(function (JsPDF) {
        try {
          if (JsPDF) {
            planoBuildPDF(JsPDF, d);
          } else {
            planoPrintFallback(d);
          }
        } catch (e) {
          try {
            planoPrintFallback(d);
          } catch (_) {
            showToast("Não foi possível gerar o plano.");
          }
        } finally {
          if (btn) {
            btn.textContent = orig;
          }
        }
      });
    } catch (e) {
      showToast("Não foi possível gerar o plano.");
    }
  }
  function planoTrunc(doc, txt, maxW) {
    txt = String(txt || "");
    if (doc.getTextWidth(txt) <= maxW) return txt;
    while (txt.length > 1 && doc.getTextWidth(txt + "…") > maxW) {
      txt = txt.slice(0, -1);
    }
    return txt + "…";
  }
  function planoBuildPDF(JsPDF, d) {
    var doc = new JsPDF({ unit: "pt", format: "a4" });
    var W = doc.internal.pageSize.getWidth();
    var H = doc.internal.pageSize.getHeight();
    var M = 44,
      y = 0;
    var OR = [242, 101, 34],
      INK = [18, 22, 42],
      MUT = [130, 138, 170],
      RED = [214, 74, 74],
      GRN = [40, 170, 110],
      LINE = [222, 226, 238];
    function fillRect(x, yy, w, h, c) {
      doc.setFillColor(c[0], c[1], c[2]);
      doc.rect(x, yy, w, h, "F");
    }
    function setF(weight, size, c) {
      doc.setFont("helvetica", weight);
      doc.setFontSize(size);
      if (c) doc.setTextColor(c[0], c[1], c[2]);
    }
    function ensure(space) {
      if (y + space > H - 58) {
        doc.addPage();
        y = M;
      }
    }
    fillRect(0, 0, W, 5, OR);
    y = M + 14;
    setF("bold", 26, OR);
    doc.text("rico", M, y);
    setF("bold", 20, INK);
    doc.text("Plano de Ajuste de Carteira", M + 72, y);
    y += 20;
    setF("normal", 10.5, MUT);
    doc.text("Conta " + d.conta + " · " + d.data, M, y);
    y += 14;
    doc.setDrawColor(LINE[0], LINE[1], LINE[2]);
    doc.setLineWidth(1);
    doc.line(M, y, W - M, y);
    y += 24;
    var metrics = [
      { l: "Patrimônio", v: fmtBRL(d.patrim), c: INK },
      { l: "A vender", v: fmtBRL(d.vender), c: RED },
      { l: "A comprar", v: fmtBRL(d.comprar), c: GRN },
      { l: "Giro", v: fmtPct(d.giro), c: OR },
    ];
    var gap = 12,
      cw = (W - 2 * M - 3 * gap) / 4,
      ch = 58;
    metrics.forEach(function (m, i) {
      var x = M + i * (cw + gap);
      doc.setFillColor(247, 248, 252);
      doc.roundedRect(x, y, cw, ch, 8, 8, "F");
      setF("bold", 8.5, MUT);
      doc.text(m.l.toUpperCase(), x + 12, y + 20);
      setF("bold", 15, m.c);
      doc.text(m.v, x + 12, y + 42);
    });
    y += ch + 26;
    function section(title, color, rows, signMode) {
      ensure(40);
      setF("bold", 12.5, color);
      doc.text(title, M, y);
      y += 6;
      doc.setDrawColor(color[0], color[1], color[2]);
      doc.setLineWidth(1.4);
      doc.line(M, y, W - M, y);
      y += 16;
      if (!rows.length) {
        setF("normal", 10, MUT);
        doc.text("—", M, y);
        y += 20;
        return;
      }
      rows.forEach(function (r) {
        ensure(22);
        var amount;
        if (signMode === "neg") {
          amount = "-" + fmtBRL(Math.abs(r.valor));
        } else if (signMode === "pos") {
          amount = "+" + fmtBRL(Math.abs(r.valor));
        } else {
          amount = "manter";
        }
        setF("bold", 10.5, INK);
        doc.text(planoTrunc(doc, r.nome, W - 2 * M - 150), M, y);
        setF("normal", 9, MUT);
        doc.text(r.classe || "", M, y + 13);
        setF(
          "bold",
          10.5,
          signMode === "neg" ? RED : signMode === "pos" ? GRN : MUT,
        );
        doc.text(amount, W - M, y, { align: "right" });
        y += 24;
        doc.setDrawColor(LINE[0], LINE[1], LINE[2]);
        doc.setLineWidth(0.5);
        doc.line(M, y - 7, W - M, y - 7);
      });
      y += 12;
    }
    section("SAIR / REDUZIR", RED, d.sair, "neg");
    section("ENTRAR / AUMENTAR", GRN, d.entrar, "pos");
    section("MANTER", MUT, d.manter, "keep");
    var pages = doc.internal.getNumberOfPages();
    for (var p = 1; p <= pages; p++) {
      doc.setPage(p);
      doc.setDrawColor(LINE[0], LINE[1], LINE[2]);
      doc.setLineWidth(0.5);
      doc.line(M, H - 40, W - M, H - 40);
      setF("normal", 8, MUT);
      doc.text(
        "Material de apoio interno · não constitui recomendação ou oferta · gerado pelo Hub do Assessor",
        W / 2,
        H - 26,
        { align: "center" },
      );
    }
    doc.save(
      "Plano_de_Ajuste_" + planoFileSafe(state.conta || state.cliente) + ".pdf",
    );
  }
  function planoPrintFallback(d) {
    function rowHTML(r, sign) {
      var amt =
        sign === "neg"
          ? '<span style="color:#d64a4a;font-weight:700">-' +
            fmtBRL(Math.abs(r.valor)) +
            "</span>"
          : sign === "pos"
            ? '<span style="color:#28aa6e;font-weight:700">+' +
              fmtBRL(Math.abs(r.valor)) +
              "</span>"
            : '<span style="color:#828aaa;font-weight:600">manter</span>';
      return (
        '<div class="row"><div class="rn"><div class="nm">' +
        esc(r.nome) +
        '</div><div class="cl">' +
        esc(r.classe || "") +
        '</div></div><div class="amt">' +
        amt +
        "</div></div>"
      );
    }
    function sectionHTML(title, color, rows, sign) {
      var body = rows.length
        ? rows
            .map(function (r) {
              return rowHTML(r, sign);
            })
            .join("")
        : '<div class="empty">—</div>';
      return (
        '<div class="sec"><div class="sh" style="color:' +
        color +
        ";border-color:" +
        color +
        '">' +
        title +
        "</div>" +
        body +
        "</div>"
      );
    }
    var html =
      '<!doctype html><html><head><meta charset="utf-8"><title>Plano de Ajuste de Carteira</title>' +
      "<style>" +
      "*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}" +
      "body{font-family:Arial,Helvetica,sans-serif;color:#12162a;margin:0;padding:38px 44px;}" +
      ".bar{height:5px;background:#f26522;margin:-38px -44px 22px;}" +
      ".hd{display:flex;align-items:baseline;gap:14px;}" +
      ".logo{font-size:26px;font-weight:800;color:#f26522;}" +
      ".ttl{font-size:20px;font-weight:800;}" +
      ".sub{color:#828aaa;font-size:12px;margin:8px 0 16px;}" +
      "hr{border:none;border-top:1px solid #dee2ee;margin:0 0 18px;}" +
      ".mets{display:flex;gap:12px;margin-bottom:24px;}" +
      ".met{flex:1;background:#f7f8fc;border-radius:8px;padding:12px 14px;}" +
      ".ml{font-size:9px;font-weight:700;color:#828aaa;letter-spacing:.5px;}" +
      ".mv{font-size:16px;font-weight:800;margin-top:5px;}" +
      ".sec{margin-bottom:22px;}" +
      ".sh{font-size:13px;font-weight:800;border-bottom:2px solid;padding-bottom:5px;margin-bottom:10px;}" +
      ".row{display:flex;justify-content:space-between;align-items:flex-start;padding:7px 0;border-bottom:1px solid #eef0f6;}" +
      ".nm{font-size:11px;font-weight:700;}" +
      ".cl{font-size:9.5px;color:#828aaa;margin-top:2px;}" +
      ".amt{font-size:11px;white-space:nowrap;padding-left:12px;text-align:right;}" +
      ".empty{color:#828aaa;font-size:11px;padding:6px 0;}" +
      ".ft{margin-top:26px;border-top:1px solid #dee2ee;padding-top:10px;color:#828aaa;font-size:9px;text-align:center;}" +
      "@media print{.noprint{display:none}}" +
      "</style></head><body>" +
      '<div class="bar"></div>' +
      '<div class="hd"><div class="logo">rico</div><div class="ttl">Plano de Ajuste de Carteira</div></div>' +
      '<div class="sub">Conta ' +
      esc(d.conta) +
      " · " +
      esc(d.data) +
      "</div><hr>" +
      '<div class="mets">' +
      '<div class="met"><div class="ml">PATRIMÔNIO</div><div class="mv">' +
      esc(fmtBRL(d.patrim)) +
      "</div></div>" +
      '<div class="met"><div class="ml">A VENDER</div><div class="mv" style="color:#d64a4a">' +
      esc(fmtBRL(d.vender)) +
      "</div></div>" +
      '<div class="met"><div class="ml">A COMPRAR</div><div class="mv" style="color:#28aa6e">' +
      esc(fmtBRL(d.comprar)) +
      "</div></div>" +
      '<div class="met"><div class="ml">GIRO</div><div class="mv" style="color:#f26522">' +
      esc(fmtPct(d.giro)) +
      "</div></div>" +
      "</div>" +
      sectionHTML("SAIR / REDUZIR", "#d64a4a", d.sair, "neg") +
      sectionHTML("ENTRAR / AUMENTAR", "#28aa6e", d.entrar, "pos") +
      sectionHTML("MANTER", "#828aaa", d.manter, "keep") +
      '<div class="ft">Material de apoio interno · não constitui recomendação ou oferta · gerado pelo Hub do Assessor</div>' +
      "<script>window.onload=function(){setTimeout(function(){window.print();},250);};<\/script>" +
      "</body></html>";
    var w = window.open("", "_blank");
    if (!w) {
      showToast("Permita pop-ups para gerar o plano em PDF.");
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  function genPNG() {
    var ORDER2 = [
      "Renda Fixa",
      "Multimercados",
      "Renda Variável",
      "Fundos Listados",
      "Alternativos",
      "Internacional",
      "Previdência",
    ];
    var ph = proposedHoldings();
    var propTotal =
      ph.reduce(function (s, x) {
        return s + x.valor;
      }, 0) || 1;
    var b = board(),
      t = totals(b);
    var byCls = {};
    ph.forEach(function (x) {
      (byCls[x.classe] = byCls[x.classe] || []).push(x);
    });
    var sections = [];
    ORDER2.forEach(function (c) {
      var its = byCls[c];
      if (!its || !its.length) return;
      its.sort(function (a, b) {
        return b.valor - a.valor;
      });
      var sum = its.reduce(function (s, i) {
        return s + i.valor;
      }, 0);
      sections.push({
        classe: c,
        items: its,
        sum: sum,
        pct: (sum / propTotal) * 100,
      });
    });
    function classComp(list) {
      var mm = {};
      list.forEach(function (x) {
        mm[x.classe] = (mm[x.classe] || 0) + x.valor;
      });
      return mm;
    }
    var depois = classComp(ph),
      depTot = propTotal;
    var antesList = [];
    state.atual.forEach(function (a) {
      antesList.push({ classe: a.categoria, valor: a.valor });
    });
    state.prev.forEach(function (a) {
      antesList.push({ classe: "Previdência", valor: a.valor });
    });
    var antes = classComp(antesList);
    var antesTot =
      Object.keys(antes).reduce(function (s, k) {
        return s + antes[k];
      }, 0) || 1;

    var W = 1080,
      M = 46;
    var H = 300;
    sections.forEach(function (s) {
      H += 34 + s.items.length * 48;
    });
    H += 96 + 56;
    var sc = 2;
    var cv = document.createElement("canvas");
    cv.width = W * sc;
    cv.height = H * sc;
    var x = cv.getContext("2d");
    x.scale(sc, sc);
    function R(a, bb, w, hh, r) {
      r = Math.min(r, hh / 2, w / 2);
      x.beginPath();
      x.moveTo(a + r, bb);
      x.arcTo(a + w, bb, a + w, bb + hh, r);
      x.arcTo(a + w, bb + hh, a, bb + hh, r);
      x.arcTo(a, bb + hh, a, bb, r);
      x.arcTo(a, bb, a + w, bb, r);
      x.closePath();
    }
    function T(tt, px, py, size, col, weight, align) {
      var fam =
        weight === "800" || weight === "700"
          ? "Sora,sans-serif"
          : "Manrope,sans-serif";
      x.font = (weight || "600") + " " + size + "px " + fam;
      x.fillStyle = col;
      x.textAlign = align || "left";
      x.fillText(tt, px, py);
      x.textAlign = "left";
    }
    function donut(cx, cy, r, comp, tot, lw) {
      var a0 = -Math.PI / 2;
      ORDER2.forEach(function (c) {
        var v = comp[c] || 0;
        if (v <= 0) return;
        var ang = (v / tot) * Math.PI * 2;
        x.beginPath();
        x.lineWidth = lw;
        x.lineCap = "butt";
        x.strokeStyle = CATCOL[c] || "#9AA2D0";
        x.arc(cx, cy, r, a0, a0 + ang);
        x.stroke();
        a0 += ang;
      });
    }

    x.fillStyle = "#0A0E2A";
    x.fillRect(0, 0, W, H);
    x.fillStyle = "#F26522";
    x.fillRect(0, 0, W, 5);
    T("rico", M, 66, 34, "#F26522", "800");
    T("PROPOSTA DE CARTEIRA", W - M, 46, 15, "#F26522", "700", "right");
    if (state.appliedModel) {
      T(
        "Perfil " + state.appliedModel,
        W - M,
        68,
        13,
        "#cfd4ef",
        "600",
        "right",
      );
    }
    T(
      new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      W - M,
      88,
      12,
      "#9AA2D0",
      "600",
      "right",
    );
    x.strokeStyle = "rgba(120,130,210,.22)";
    x.lineWidth = 1;
    x.beginPath();
    x.moveTo(M, 108);
    x.lineTo(W - M, 108);
    x.stroke();
    T("CARTEIRA PREPARADA PARA", M, 144, 12, "#9AA2D0", "700");
    T(state.cliente || "Cliente", M, 184, 30, "#fff", "800");
    T("Patrimônio total", M, 224, 12, "#9AA2D0", "600");
    T(fmtBRL(t.patrim), M, 252, 24, "#F26522", "800");
    // donuts antes/depois (top right)
    var dyc = 192;
    donut(W - M - 70, dyc, 58, depois, depTot, 16);
    T("100%", W - M - 70, dyc + 5, 18, "#fff", "800", "center");
    T("PROPOSTA", W - M - 70, dyc + 86, 11, "#3DD68C", "700", "center");
    donut(W - M - 208, dyc, 44, antes, antesTot, 12);
    T("ATUAL", W - M - 208, dyc + 72, 10, "#9AA2D0", "700", "center");
    T("→", W - M - 140, dyc + 6, 22, "#6F77A8", "700", "center");
    // sections
    var y = 300;
    sections.forEach(function (s) {
      var col = CATCOL[s.classe] || "#9AA2D0";
      x.fillStyle = col;
      R(M, y, 5, 18, 2);
      x.fill();
      T(s.classe, M + 16, y + 15, 17, "#fff", "800");
      T(fmtPct(s.pct), W - M, y + 15, 16, col, "800", "right");
      var ap = antes[s.classe] ? (antes[s.classe] / antesTot) * 100 : 0;
      T(
        "antes " + fmtPct(ap),
        W - M - 78,
        y + 15,
        11,
        "#8A93C8",
        "600",
        "right",
      );
      y += 34;
      s.items.forEach(function (it) {
        var pct = (it.valor / propTotal) * 100;
        T(fmtPct(pct), M + 8, y + 17, 14, col, "800");
        T(String(it.nome).slice(0, 46), M + 82, y + 14, 14.5, "#fff", "700");
        T(
          String(it.detalhe || "").slice(0, 74),
          M + 82,
          y + 32,
          11.5,
          "#9AA2D0",
          "500",
        );
        T(fmtBRL(it.valor), W - M, y + 18, 14.5, "#fff", "700", "right");
        x.strokeStyle = "rgba(120,130,210,.10)";
        x.lineWidth = 1;
        x.beginPath();
        x.moveTo(M, y + 44);
        x.lineTo(W - M, y + 44);
        x.stroke();
        y += 48;
      });
      y += 6;
    });
    // movimentos
    y += 8;
    x.fillStyle = "rgba(255,255,255,.04)";
    R(M, y, W - 2 * M, 58, 12);
    x.fill();
    var cw = (W - 2 * M) / 3;
    T("A VENDER", M + 18, y + 23, 9.5, "#9AA2D0", "700");
    T(fmtBRL(t.vender), M + 18, y + 44, 16, "#FF6B6B", "800");
    T("A COMPRAR", M + 18 + cw, y + 23, 9.5, "#9AA2D0", "700");
    T(fmtBRL(t.comprar), M + 18 + cw, y + 44, 16, "#3DD68C", "800");
    T("GIRO DA CARTEIRA", M + 18 + 2 * cw, y + 23, 9.5, "#9AA2D0", "700");
    T(fmtPct(t.giro), M + 18 + 2 * cw, y + 44, 16, "#FFB020", "800");
    // footer
    T(
      "Material de apoio comercial · valores e liquidez ilustrativos (estimativa bruta, sem IR) · não constitui recomendação ou oferta.",
      M,
      H - 28,
      9.5,
      "#6F77A8",
      "500",
    );
    T("rico", W - M, H - 28, 13, "#F26522", "800", "right");
    var url = cv.toDataURL("image/png");
    if (typeof window.mostrarPngModal === "function")
      window.mostrarPngModal(url, "Proposta de Carteira.png", {
        accent: "#F26522",
        hint: "Baixe ou copie a imagem para enviar ao cliente pelo WhatsApp.",
      });
    else {
      var ael = document.createElement("a");
      ael.href = url;
      ael.download = "Proposta de Carteira.png";
      ael.click();
    }
  }

  var PC_CSS =
    "#pcLibTab,#pcRvTab{position:fixed;left:0;z-index:1500;color:#fff;font-family:Sora,sans-serif;font-weight:800;font-size:12.5px;letter-spacing:1px;writing-mode:vertical-rl;text-orientation:mixed;padding:16px 9px;border-radius:0 12px 12px 0;cursor:pointer;box-shadow:0 6px 22px rgba(0,0,0,.45);user-select:none;display:none;align-items:center;}#pcLibTab{top:40%;transform:translateY(-50%);background:linear-gradient(180deg,#FF6B2C,#F26522);}#pcRvTab{top:63%;transform:translateY(-50%);background:linear-gradient(180deg,#7C5CFF,#4A36C8);}#pcLibTab .pctabico,#pcRvTab .pctabico{font-size:17px;margin-bottom:7px;writing-mode:horizontal-tb;}#pcBackdrop{position:fixed;inset:0;background:rgba(3,5,18,.55);z-index:1501;opacity:0;pointer-events:none;transition:opacity .2s;}#pcBackdrop.show{opacity:1;pointer-events:auto;}#pcDrawer{position:fixed;left:-480px;top:59px;bottom:0;width:min(420px,92vw);z-index:1502;background:linear-gradient(160deg,#0A0F38,#070B2E 70%,#05081F);border-right:1px solid rgba(120,130,210,.25);box-shadow:8px 0 44px rgba(0,0,0,.55);transition:left .25s ease;overflow:auto;padding:18px;}#pcDrawer.open{left:0;}#pcDrawer .pcdr-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;}#pcDrawer .pcdr-title{font-family:Sora,sans-serif;font-weight:800;font-size:18px;color:#fff;}#pcDrClose{background:none;border:none;color:#9AA2D0;font-size:22px;cursor:pointer;line-height:1;}#pcDrawer .pcdr-sub{font-size:12px;color:#9AA2D0;line-height:1.5;margin-bottom:12px;}#pcDrawer .pcdr-cat{display:flex;align-items:center;gap:7px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.6px;margin:12px 0 7px;}#pcDrawer .pcdr-cat span{width:9px;height:9px;border-radius:3px;}#pcDrawer .pcdr-card{display:flex;align-items:center;gap:10px;background:rgba(0,0,0,.24);border:1px solid rgba(120,130,210,.18);border-radius:12px;padding:11px 12px;margin-bottom:8px;cursor:grab;}#pcDrawer .pcdr-info{flex:1;min-width:0;}#pcDrawer .pcdr-name{font-weight:800;font-size:13px;color:#fff;}#pcDrawer .pcdr-det{font-size:11px;color:#9AA2D0;margin-top:4px;line-height:1.35;}#pcDrawer .pcdr-add{flex-shrink:0;background:rgba(61,214,140,.16);border:1px solid rgba(61,214,140,.45);color:#3DD68C;border-radius:9px;width:30px;height:30px;font-weight:800;font-size:16px;cursor:pointer;}";
  function elx(tag, id, html) {
    var e = document.createElement(tag);
    e.id = id;
    e.innerHTML = html;
    return e;
  }
  function ensureEdge() {
    if (document.getElementById("pcDrawer")) {
      renderDrawer();
      return;
    }
    if (!document.getElementById("pc-drawer-css")) {
      var st = document.createElement("style");
      st.id = "pc-drawer-css";
      st.textContent = PC_CSS;
      document.head.appendChild(st);
    }
    var lt = elx(
      "div",
      "pcLibTab",
      '<span class="pctabico">📁</span>Ativos gerais',
    );
    var rt = elx(
      "div",
      "pcRvTab",
      '<span class="pctabico">🧰</span>RV estruturada',
    );
    var bd = elx("div", "pcBackdrop", "");
    var dr = elx(
      "div",
      "pcDrawer",
      '<div class="pcdr-head"><div class="pcdr-title" id="pcDrTitle"></div><button id="pcDrClose">×</button></div><div class="pcdr-sub">Clique no + para adicionar à coluna Entrar, ou arraste o card para a coluna Entrar.</div><div id="pcDrBody"></div>',
    );
    document.body.appendChild(lt);
    document.body.appendChild(rt);
    document.body.appendChild(bd);
    document.body.appendChild(dr);
    lt.onclick = function () {
      openDrawer("geral");
    };
    rt.onclick = function () {
      openDrawer("rv");
    };
    bd.onclick = closeDrawer;
    document.getElementById("pcDrClose").onclick = closeDrawer;
    if (!window.__pcPatched) {
      window.__pcPatched = true;
      var o = window.showPanel;
      window.showPanel = function (id) {
        o.apply(this, arguments);
        pcEdgeVisible(id === "ajustes");
      };
    }
    renderDrawer();
  }
  function pcEdgeVisible(on) {
    ["pcLibTab", "pcRvTab"].forEach(function (i) {
      var e = document.getElementById(i);
      if (e) e.style.display = on ? "flex" : "none";
    });
    if (!on) closeDrawer();
  }
  function openDrawer(cat) {
    state.drawerCat = cat;
    renderDrawer();
    var d = document.getElementById("pcDrawer");
    if (d) d.classList.add("open");
    var b = document.getElementById("pcBackdrop");
    if (b) b.classList.add("show");
  }
  function closeDrawer() {
    var d = document.getElementById("pcDrawer");
    if (d) d.classList.remove("open");
    var b = document.getElementById("pcBackdrop");
    if (b) b.classList.remove("show");
  }
  function renderDrawer() {
    var body = document.getElementById("pcDrBody");
    if (!body) return;
    var cat = state.drawerCat || "geral";
    var ti = document.getElementById("pcDrTitle");
    if (ti)
      ti.textContent = cat === "rv" ? "🧰 RV estruturada" : "📁 Ativos gerais";
    var G = gavetas();
    var h = "";
    var cats =
      cat === "rv"
        ? ["Renda Variável"]
        : [
            "Renda Fixa",
            "Multimercados",
            "Fundos Listados",
            "Alternativos",
            "Internacional",
          ];
    cats.forEach(function (cl) {
      var items = G.map(function (a, i) {
        return { a: a, i: i };
      }).filter(function (o) {
        return o.a.classe === cl;
      });
      if (!items.length) return;
      var c = CATCOL[cl] || "#9AA2D0";
      h +=
        '<div class="pcdr-cat" style="color:' +
        c +
        '"><span style="background:' +
        c +
        '"></span>' +
        (window.__hubClassLabel ? window.__hubClassLabel(cl) : cl) +
        "</div>";
      items.forEach(function (o) {
        h +=
          '<div class="pcdr-card" draggable="true" data-dragidx="' +
          o.i +
          '"><div class="pcdr-info"><div class="pcdr-name">' +
          esc(o.a.nome) +
          '</div><div class="pcdr-det">' +
          esc(o.a.detalhe || "") +
          '</div></div><button class="pcdr-add" data-addidx="' +
          o.i +
          '" title="Adicionar a Entrar">+</button></div>';
      });
    });
    body.innerHTML = h;
    body.querySelectorAll("[data-addidx]").forEach(function (b) {
      b.onclick = function () {
        addLib(+b.getAttribute("data-addidx"));
      };
    });
    body.querySelectorAll("[data-dragidx]").forEach(function (e2) {
      e2.addEventListener("dragstart", function (ev) {
        drag = "lib:" + e2.getAttribute("data-dragidx");
        try {
          ev.dataTransfer.effectAllowed = "copy";
        } catch (_) {}
      });
      e2.addEventListener("dragend", function () {
        drag = null;
      });
    });
  }
  window._ajRender = render;
  window._toolInit = window._toolInit || {};
  window._toolInit["ajustes"] = function () {
    render();
  };
})();
