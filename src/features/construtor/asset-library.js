// Migrated from Hub v1. Review domain assumptions separately from interface changes.

(function () {
  var LIB = [
    {
      classe: "Renda Fixa",
      nome: "LCA",
      detalhe: "91% do CDI · referência XP · isento de IR",
      liq: "No vencimento",
      retCat: "pos",
      retVal: 91,
      retIsento: true,
    },
    {
      classe: "Renda Fixa",
      nome: "LCD",
      detalhe: "90% do CDI · referência indicativa · isento de IR",
      liq: "No vencimento",
      retCat: "pos",
      retVal: 90,
      retIsento: true,
    },
    {
      classe: "Renda Fixa",
      nome: "LCI",
      detalhe: "86% do CDI · referência XP Set/26 · isento de IR",
      liq: "No vencimento",
      retCat: "pos",
      retVal: 86,
      retIsento: true,
    },
    {
      classe: "Renda Fixa",
      nome: "CDB Pós-fixado",
      detalhe: "106% do CDI · referência XP Set/26 · 2 anos",
      liq: "No vencimento",
      retCat: "pos",
      retVal: 106,
    },
    {
      classe: "Renda Fixa",
      nome: "CDB Prefixado",
      detalhe: "14,78% a.a. · referência XP Set/26 · 3 anos",
      liq: "No vencimento",
      retCat: "pre",
      retVal: 14.78,
    },
    {
      classe: "Renda Fixa",
      nome: "CDB IPCA+",
      detalhe: "IPCA + 8,41% a.a. · referência XP Mai/26",
      liq: "No vencimento",
      retCat: "inflacao",
      retVal: 8.41,
    },
    {
      classe: "Renda Fixa",
      nome: "Tesouro Selic",
      detalhe: "Selic + 0,0% · referência XP Set/26 · liquidez diária",
      liq: "D+0",
      retCat: "pos",
      retVal: 100,
    },
    {
      classe: "Renda Fixa",
      nome: "NTN-B",
      detalhe: "IPCA + 7,39% a.a. · referência XP Set/26 · 2032",
      liq: "D+1",
      retCat: "inflacao",
      retVal: 7.39,
    },
    {
      classe: "Multimercados",
      nome: "ACE Multicenários",
      detalhe: "Multimercado global · ~230% do CDI",
      liq: "D+17",
    },
    {
      classe: "Multimercados",
      nome: "Selection Multimercado FIC FIM",
      detalhe: "Multiestratégia · risco 13 · referência XP Set/26",
      liq: "D+10",
      retCat: "mercado",
    },
    {
      classe: "Multimercados",
      nome: "XP Macro Institucional FIC FIM RL",
      detalhe: "Macro baixa volatilidade · objetivo CDI + 2,5% a.a. · risco 13",
      liq: "D+1",
      retCat: "mercado",
    },
    {
      classe: "Multimercados",
      nome: "eTrend Ativos Reais FIC FIM",
      detalhe: "Paridade de risco global · ativos reais · risco 30",
      liq: "D+9",
      retCat: "mercado",
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
      classe: "Fundos Cetipados",
      nome: "TG Real Estate FII (TGRE11)",
      detalhe: "FII híbrido · balcão CETIP · DY 10,9% a.a. · Radar XP 2T26",
      liq: "Mercado de balcão",
      retCat: "mercadoDiv",
      retDiv: 10.9,
    },
    {
      classe: "Fundos Cetipados",
      nome: "NAVI Hedge Fund FII (IMOV11)",
      detalhe: "FII hedge fund · balcão CETIP · DY 12,8% a.a. · Radar XP 2T26",
      liq: "Mercado de balcão",
      retCat: "mercadoDiv",
      retDiv: 12.8,
    },
    {
      classe: "Fundos Cetipados",
      nome: "XP Hedge Fund FII (XPHF11)",
      detalhe: "FII hedge fund · balcão CETIP · DY 12,6% a.a. · Radar XP 2T26",
      liq: "Mercado de balcão",
      retCat: "mercadoDiv",
      retDiv: 12.6,
    },
    {
      classe: "Fundos Cetipados",
      nome: "Valora Gestão de Patrimônio FII (VGPR11)",
      detalhe: "FII hedge fund · balcão CETIP · DY 11,1% a.a. · Radar XP 2T26",
      liq: "Mercado de balcão",
      retCat: "mercadoDiv",
      retDiv: 11.1,
    },
    {
      classe: "Fundos Cetipados",
      nome: "Riza Distressed FII (RZDS11)",
      detalhe: "FII hedge fund · balcão CETIP · DY 13,2% a.a. · Radar XP 2T26",
      liq: "Mercado de balcão",
      retCat: "mercadoDiv",
      retDiv: 13.2,
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
      detalhe: "Fundo global · ISIN LU1084869962 · risco 40 · disponível na XP",
      liq: "D+5",
    },
    {
      classe: "Internacional",
      nome: "Western Asset US Index 500 FIF MM RL",
      detalhe: "S&P 500 hedgeado · risco 14 · disponível na XP",
      liq: "D+1",
      retCat: "mercado",
    },
    {
      classe: "Internacional",
      nome: "Selection Multimercado Internacional FIC FIM IE",
      detalhe: "Multimercado internacional · investidor qualificado · risco 26",
      liq: "D+10",
      retCat: "mercado",
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
      detalhe: "13,38% a.a. · Tesouro Prefixado · referência XP Set/26",
      liq: "No vencimento",
      retCat: "pre",
      retVal: 13.38,
    },
    {
      classe: "Renda Fixa",
      nome: "Debênture Pré (Infra)",
      detalhe: "13,50% a.a. · referência XP Set/26 · isenta de IR",
      liq: "No vencimento",
      retCat: "pre",
      retVal: 13.5,
      retIsento: true,
    },
    {
      classe: "Renda Fixa",
      nome: "CRI Allos 2031",
      detalhe: "92% do CDI · referência XP Set/26 · isento · investidor qualificado",
      liq: "A mercado",
      retCat: "pos",
      retVal: 92,
      retIsento: true,
    },
    {
      classe: "Renda Fixa",
      nome: "Debênture Ecoraposo (CERT11)",
      detalhe: "IPCA + 7,40% a.a. · referência XP Set/26 · isenta · IQ",
      liq: "A mercado",
      retCat: "inflacao",
      retVal: 7.4,
      retIsento: true,
    },
    {
      classe: "Renda Fixa",
      nome: "Debênture Axia Energia (AXIA18)",
      detalhe: "IPCA + 7,00% a.a. · referência XP Set/26 · isenta · IQ",
      liq: "A mercado",
      retCat: "inflacao",
      retVal: 7,
      retIsento: true,
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

  /* Ativos cadastrados a mao na gaveta do Hub v1 (armazenamento do assessor +
     colecao hubShared do Firestore), trazidos para o v2 com os mesmos ids.
     Entram como "semente": aparecem em todo navegador, sem depender da
     nuvem, e continuam editaveis e excluiveis como qualquer ativo manual.
     Editar grava uma copia com o mesmo id em hubCustomLib (que passa a valer
     no lugar da semente); excluir guarda o id em hubLibSementesOcultas. */
  var SEMENTES_V1 = [
    { id: "u1", classe: "Renda Fixa", nome: "CDB BMG",
      detalhe: "IPCA + 8% de 3 a 5 anos", liq: "No vencimento" },
    { id: "u8", classe: "Fundos Listados", nome: "Wings Cota Sênior",
      detalhe: "Taxa objetiva de IPCA + 10,5% com proteção de cota sênior", liq: "A mercado" },
    { id: "u9", classe: "Renda Variável", nome: "XP Dividendos FIA",
      detalhe: "Fundo de Renda Variável com foco em dividendos, rentabilidade histórica de 400,81% (215% IBOV)", liq: "D+3" },
    { id: "u10", classe: "Renda Variável", nome: "AZ Quest Bayes LB Sistemático",
      detalhe: "Renda Variável Long Biased, rentabilidade histórica de 122,89% (130% IBOV)", liq: "D+16" },
    { id: "u11", classe: "Internacional", nome: "WHG Casa Hedge",
      detalhe: "Internacional Ações Hedgeado, retorno de 48,46% histórico (34,81% no último ano)", liq: "D+32" },
    { id: "u1784047485073356", classe: "Fundos Listados", nome: "HSI Renda CDI",
      detalhe: "Foco exclusivo em CRIs indexados ao CDI, originados e estruturados pela própria gestora. Retorno objetivo de CDI + 2,2% a.a. líquido (equivalente a CDI + 4,5% no gross-up)", liq: "A mercado" },
    { id: "u1784047485073357", classe: "Renda Fixa", nome: "XP Debêntures Incentivadas IMAB",
      detalhe: "111,40% do CDI", liq: "D+30" },
    { id: "u1784047485073358", classe: "Renda Fixa", nome: "XP IMAB5 Debêntures Incentivadas RL",
      detalhe: "171% IMA-B D+90", liq: "D+90" },
    { id: "u1784047485073359", classe: "Fundos Listados", nome: "Valora Agro Pré I Fiagro RL",
      detalhe: "15%", liq: "D+0" },
    { id: "u1784047485073360", classe: "Renda Fixa", nome: "XP Office",
      detalhe: "Fundo da XP com ágio imediato de 15% e DY de 14% no primeiro ano", liq: "A mercado" },
    { id: "u1784047485073361", classe: "Fundos Listados", nome: "XP Office Prime com Ágio de 15%",
      detalhe: "XP Asset focado em lajes corporativas A+ em regiões nobres de São Paulo, com estratégia de aquisição oportunística", liq: "A mercado" },
    { id: "u1784047485073362", classe: "Internacional", nome: "XP Global Strategies Moderate (E)",
      detalhe: "8,15% últimos 12 meses", liq: "D+5" },
    { id: "u1784047485073363", classe: "Alternativos", nome: "WholeLife IPCA+3%",
      detalhe: "Ativo com foco em construção de reserva e gestão de riscos, visão de longo prazo para 10 anos+", liq: "3 anos" },
    { id: "u1784047485073364", classe: "Fundos Listados", nome: "PAAG11 - Pátria Crédito Agrícola FiAgro",
      detalhe: "Rendimento a mercado", liq: "A mercado" },
    { id: "u1784047485073365", classe: "Renda Fixa", nome: "XP Brasil Soberano",
      detalhe: "IPCA + 9,8%", liq: "No vencimento" },
    { id: "u1784047485073366", classe: "Renda Fixa", nome: "XP Bradesco 2030",
      detalhe: "14,29%", liq: "No vencimento" },
    { id: "u1784047485073367", classe: "Internacional", nome: "BlackRock Global Funds World Technology",
      detalhe: "23,75% nos últimos 12 meses", liq: "D+4" },
  ];
  var K_SEMENTES_OCULTAS = "hubLibSementesOcultas";
  function sementesOcultas() {
    try {
      var v = JSON.parse(window.hubStorage.getItem(K_SEMENTES_OCULTAS) || "[]");
      return Array.isArray(v) ? v : [];
    } catch (_) {
      return [];
    }
  }
  function ocultarSemente(id) {
    var oc = sementesOcultas();
    if (oc.indexOf(id) < 0) oc.push(id);
    try {
      window.hubStorage.setItem(K_SEMENTES_OCULTAS, JSON.stringify(oc));
    } catch (_) {}
  }
  function ehSemente(id) {
    return SEMENTES_V1.some(function (s) { return s.id === id; });
  }
  function libChave(a) {
    return libNorm(a && a.classe) + "|" + libNorm(a && a.nome);
  }
  /* sementes que ainda valem: nao ocultas, sem copia editada em hubCustomLib
     e sem outro ativo de mesmo nome e classe (ex.: recadastrado a mao no v2) */
  function sementes() {
    var oc = sementesOcultas(), ids = {}, chaves = {};
    CUSTOMLIB.forEach(function (x) {
      if (!x) return;
      if (x.id != null) ids[x.id] = 1;
      chaves[libChave(x)] = 1;
    });
    LIB.forEach(function (x) { chaves[libChave(x)] = 1; });
    return SEMENTES_V1.filter(function (s) {
      return oc.indexOf(s.id) < 0 && !ids[s.id] && !chaves[libChave(s)];
    }).map(function (s) {
      return { id: s.id, classe: s.classe, nome: s.nome, detalhe: s.detalhe,
               liq: s.liq, custom: true, semente: true };
    });
  }

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
    return LIB.concat(CUSTOMLIB, sementes());
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
  /* proximo id manual: acima de tudo que ja existe, sementes do v1 inclusive,
     para um ativo novo nunca "engolir" uma semente de mesmo id */
  function calcSeq() {
    var m = 0;
    CUSTOMLIB.concat(SEMENTES_V1).forEach(function (x) {
      var n = parseInt(String((x && x.id) || "").replace("u", ""), 10);
      if (!isNaN(n) && n > m) m = n;
    });
    return m;
  }
  var libSeq = calcSeq();
  window.__LIBDATA = allItems();
  var COL = {
    "Renda Fixa": "#2BD9A6",
    Multimercados: "#7C8CFF",
    "Renda Variável": "#FF8B52",
    "Fundo Aberto": "#5AC8A8",
    "Fundos Cetipados": "#F7A94A",
    "Fundos Listados": "#FFB020",
    Alternativos: "#C77DFF",
    Internacional: "#36C5F0",
  };
  var ORDER = [
    "Renda Fixa",
    "Multimercados",
    "Fundo Aberto",
    "Fundos Cetipados",
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
          "Fundos Cetipados": "🏢 ",
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
          (window.__xpAssetLink ? window.__xpAssetLink(a) : '') +
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
        /* semente do v1 (editada ou nao): some daqui em diante */
        if (ehSemente(id)) ocultarSemente(id);
        try {
          if (window.__HubCloud) window.__HubCloud.remove(id);
        } catch (_) {}
        render();
      };
    });
    libFilter();
  }
  function openLibForm(id) {
    /* procura em tudo que tem id: manuais e sementes do v1 */
    var o = id
      ? allItems().filter(function (x) {
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
      libSeq = calcSeq();
      if (editing) {
        data.id = o.id;
        var achou = false;
        CUSTOMLIB = CUSTOMLIB.map(function (x) {
          if (x.id !== o.id) return x;
          achou = true;
          return data;
        });
        /* semente do v1 editada: a copia entra em hubCustomLib com o mesmo
           id e passa a valer no lugar dela */
        if (!achou) CUSTOMLIB.push(data);
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
      libSeq = calcSeq();
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
