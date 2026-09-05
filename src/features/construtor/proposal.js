// Migrated from Hub v1. Review domain assumptions separately from interface changes.

(function () {
  var CATS = [
    "Renda Fixa",
    "Previdencia",
    "Multimercados",
    "Fundo Aberto",
    "Renda Variavel",
    "Fundos Listados",
    "Alternativos",
    "Internacional",
  ];
  var CANON = {
    "Renda Fixa": "Renda Fixa",
    Previdência: "Previdencia",
    Previdencia: "Previdencia",
    Multimercados: "Multimercados",
    "Renda Variável": "Renda Variavel",
    "Renda Variavel": "Renda Variavel",
    "Fundo Aberto": "Fundo Aberto",
    "Fundos Listados": "Fundos Listados",
    Alternativos: "Alternativos",
    Internacional: "Internacional",
  };
  var COLORS = {
    "Renda Fixa": "#3DD68C",
    Previdencia: "#E8709B",
    Multimercados: "#7C8CFF",
    "Fundo Aberto": "#5AC8A8",
    "Renda Variavel": "#F26522",
    "Fundos Listados": "#FFB020",
    Alternativos: "#C77DFF",
    Internacional: "#36C5F0",
  };
  var PROFILES = {
    Conservadora: {
      "Renda Fixa": 90,
      Previdencia: 0,
      Multimercados: 2.5,
      "Renda Variavel": 0,
      "Fundos Listados": 2.5,
      Alternativos: 0,
      Internacional: 5,
    },
    Moderada: {
      "Renda Fixa": 68,
      Previdencia: 0,
      Multimercados: 14,
      "Renda Variavel": 5,
      "Fundos Listados": 4,
      Alternativos: 3,
      Internacional: 6,
    },
    Sofisticada: {
      "Renda Fixa": 51,
      Previdencia: 0,
      Multimercados: 10,
      "Renda Variavel": 15,
      "Fundos Listados": 9.5,
      Alternativos: 7,
      Internacional: 7.5,
    },
  };
  function el(id) {
    return document.getElementById(id);
  }
  function pn(v) {
    if (v == null) return 0;
    var s = String(v)
      .replace(/r\$/gi, "")
      .replace(/\s/g, "")
      .replace(/\./g, "")
      .replace(",", ".");
    var n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  }
  function fmt(n) {
    n = Number(n);
    if (!isFinite(n)) n = 0;
    return n.toLocaleString("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }
  function fp(n) {
    n = Number(n);
    if (!isFinite(n)) n = 0;
    return (Math.round(n * 10) / 10).toLocaleString("pt-BR", {
      maximumFractionDigits: 1,
    });
  }
  function esc2(t) {
    return String(t == null ? "" : t)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;");
  }
  function tagClass(t) {
    t = String(t || "").toLowerCase();
    if (t.indexOf("isento") >= 0) return "tag-isento";
    if (t.indexOf("fgc") >= 0) return "tag-fgc";
    if (t.indexOf("resgate") >= 0) return "tag-resgate";
    if (t.indexOf("liquidez") >= 0) return "tag-liq";
    if (t.indexOf("cetip") >= 0) return "tag-cetip";
    if (t.indexOf("tesouro") >= 0) return "tag-tesouro";
    if (t.indexOf("global") >= 0) return "tag-global";
    if (t.indexOf("prote") >= 0) return "tag-protecao";
    if (t.indexOf("cupom") >= 0) return "tag-cupom";
    return "tag-cetip";
  }
  function normCat(x) {
    return String(x || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .trim();
  }
  function canonCat(x) {
    var n = normCat(x);
    for (var i = 0; i < CATS.length; i++) {
      if (normCat(CATS[i]) === n) return CATS[i];
    }
    return null;
  }
  function nkey(n) {
    return String(n == null ? "" : n)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }
  function isXP(n) {
    return /^\s*xp/i.test(String(n || ""));
  }
  function isProtected(n, cat) {
    if (!isXP(n)) return false;
    var c = normCat(cat);
    return c === "renda fixa" || c === "renda variavel";
  }
  /* Carrego ate o vencimento: nao pode ser resgatado sem perda -> nunca sugerido para SAI */
  /* Liquidez vinda da biblioteca: o RICO_BRIDGE nao carrega o campo liq,
     entao recuperamos a liquidez do ativo pelo nome/classe na biblioteca. */
  function libLiqFor(nome, cat) {
    try {
      var LD =
        typeof window.__hubLibData === "function"
          ? window.__hubLibData()
          : window.__LIBDATA || [];
      if (!LD || !LD.length) return "";
      var k = nkey(nome);
      for (var i = 0; i < LD.length; i++) {
        var x = LD[i];
        if (!x) continue;
        if (
          nkey(x.nome) === k &&
          (!cat || !x.classe || normCat(x.classe) === normCat(cat))
        )
          return String(x.liq || "");
      }
      for (var j = 0; j < LD.length; j++) {
        var y = LD[j];
        if (y && nkey(y.nome) === k) return String(y.liq || "");
      }
    } catch (e) {}
    return "";
  }
  function isTravado(nome, detalhe, liq) {
    var l = String(liq || "").toLowerCase();
    if (l.indexOf("vencimento") >= 0) return true;
    var s = String(nome || "") + " " + String(detalhe || "");
    if (/letra de cr[eé]dito/i.test(s)) return true;
    return (
      /(^|[^A-Za-z])(CDB|RDB|LCI|LCA|LCD|LIG|LC|LF|CRI|CRA)([^A-Za-z]|$)/i.test(
        s,
      ) ||
      /deb[êe]nture/i.test(s) ||
      /debenture/i.test(s)
    );
  }
  function metaFromLib(it) {
    var det = String(it.detalhe || ""),
      nome = String(it.nome || ""),
      cl = it.classe || "",
      liq = it.liq || "";
    var low = (nome + " " + det).toLowerCase();
    var tags = [];
    if (/collar|prote..o total/.test(low)) tags.push("Proteção total");
    else if (/fence|prote..o parcial/.test(low)) tags.push("Proteção parcial");
    if (/cupom/.test(low)) tags.push("Cupom");
    if (normCat(cl) === "fundos listados") tags.push("CETIPADO");
    if (liq) tags.push("Liquidez · " + liq);
    var isento = /isent/.test(low) || /\b(lci|lca|lcd)\b/.test(low);
    if (isento) tags.push("Isento de IR");
    if (/\b(lci|lca|lcd|cdb|rdb)\b/.test(low)) tags.push("FGC");
    if (/tesouro|ntn|ltn/.test(low)) tags.push("Tesouro Direto");
    if (normCat(cl) === "internacional" || /\bglobal\b/.test(low))
      tags.push("Global");
    var retCat = "mercado",
      retVal = 0,
      retIsento = isento;
    if (/ipca|ntn-b|inflaç/.test(low)) {
      retCat = "inflacao";
      var mi = low.match(/ipca\s*\+\s*([\d.,]+)/);
      retVal = mi ? parseFloat(mi[1].replace(",", ".")) || 6 : 6;
    } else {
      var mc = low.match(/([\d.,]+)\s*%?\s*(?:a\s*)?(?:do\s*)?cdi/);
      if (mc) {
        retCat = "pos";
        retVal = parseFloat(mc[1].replace(",", ".")) || 100;
      } else {
        var mp = low.match(/([\d.,]+)\s*%\s*a\.?\s*a/);
        if (mp) {
          retCat = "pre";
          retVal = parseFloat(mp[1].replace(",", ".")) || 14;
        }
      }
    }
    return { tags: tags, retCat: retCat, retVal: retVal, retIsento: retIsento };
  }
  function retLabelOf(a) {
    var v = Number(a.retVal) || 0;
    if (a.retCat === "pos")
      return fp(v) + "% do CDI" + (a.retIsento ? " · isento" : "");
    if (a.retCat === "pre")
      return fp(v) + "% a.a." + (a.retIsento ? " · isento" : "");
    if (a.retCat === "inflacao")
      return "IPCA + " + fp(v) + "% a.a." + (a.retIsento ? " · isento" : "");
    if (a.retCat === "mercado" && v > 0) return fp(v) + "% a.a. · informado";
    return "A mercado";
  }
  function prClassLabel(c) {
    return window.__hubClassLabel ? window.__hubClassLabel(c) : c;
  }

  /* ===================== ESTADO ===================== */
  var PR = {
    cliente: "",
    patrim: 0,
    atualAssets: [],
    board: { sai: [], mantem: [], entra: [] },
    picker: false,
    pickerCat: "Renda Fixa",
    perfil: null,
    seq: 1,
  };
  window.__PR_BOARD_DEBUG = PR;

  function mkItem(o) {
    o = o || {};
    var cat = canonCat(o.cat || o.classe) || "Renda Fixa";
    var nome = String(o.nome || ""),
      det = String(o.detalhe || ""),
      liq = String(o.liq || "");
    if (!liq) {
      liq = libLiqFor(nome, cat);
    }
    var meta = metaFromLib({ classe: cat, nome: nome, detalhe: det, liq: liq });
    var pct = Number(o.pct);
    if (!isFinite(pct)) pct = 0;
    var po = Number(o.pctOrig);
    if (!isFinite(po)) po = 0;
    return {
      id: "pr" + PR.seq++,
      nome: nome,
      cat: cat,
      pct: pct,
      pctOrig: po,
      detalhe: det,
      liq: liq,
      origem: o.origem === "atual" ? "atual" : "novo",
      travado: o.travado != null ? !!o.travado : isTravado(nome, det, liq),
      retCat: o.retCat || meta.retCat,
      retVal: o.retVal != null ? Number(o.retVal) || 0 : meta.retVal,
      retIsento: o.retIsento != null ? !!o.retIsento : !!meta.retIsento,
      protegido: o.protegido != null ? !!o.protegido : isProtected(nome, cat),
      tags: o.tags && o.tags.length ? o.tags.slice() : meta.tags,
      fonte: o.fonte || "manual",
    };
  }
  function cols() {
    return ["sai", "mantem", "entra"];
  }
  /* INVARIANTE: um ativo existe em EXATAMENTE uma coluna. */
  function findAny(nome) {
    var k = nkey(nome);
    if (!k) return null;
    var r = null;
    cols().forEach(function (col) {
      PR.board[col].forEach(function (it) {
        if (!r && nkey(it.nome) === k) r = { col: col, item: it };
      });
    });
    return r;
  }
  function findById(id) {
    var r = null;
    cols().forEach(function (col) {
      PR.board[col].forEach(function (it, ix) {
        if (!r && it.id === id) r = { col: col, item: it, ix: ix };
      });
    });
    return r;
  }
  /* Insere respeitando a invariante: se ja existe (por nkey), NAO duplica. */
  function boardAdd(col, item) {
    if (!item) return null;
    if (cols().indexOf(col) < 0) col = "entra";
    var ex = item.nome ? findAny(item.nome) : null;
    if (ex) {
      return null;
    }
    PR.board[col].push(item);
    return item;
  }
  function boardMove(id, to) {
    var f = findById(id);
    if (!f) return;
    if (cols().indexOf(to) < 0) return;
    var it = f.item;
    if (to === "sai" && it.protegido)
      return; /* ativo XP do cliente: nao pode ser vendido */
    PR.board[f.col].splice(f.ix, 1);
    if (to === "mantem") {
      var p = Number(it.pct) || 0;
      if (p <= 0) it.pct = Number(it.pctOrig) || 0;
    }
    PR.board[to].push(it);
  }
  function boardRemove(id) {
    var f = findById(id);
    if (!f) return;
    PR.board[f.col].splice(f.ix, 1);
  }
  function propostaItems() {
    return PR.board.mantem.concat(PR.board.entra);
  }

  /* ===================== METRICAS ===================== */
  function metrics() {
    var P = Number(PR.patrim);
    if (!isFinite(P) || P < 0) P = 0;
    var vender = 0,
      comprar = 0,
      totM = 0,
      totE = 0,
      totSai = 0;
    PR.board.sai.forEach(function (i) {
      var o = Number(i.pctOrig) || 0;
      totSai += o;
      vender += (P * o) / 100;
    });
    PR.board.mantem.forEach(function (i) {
      var o = Number(i.pctOrig) || 0,
        p = Number(i.pct) || 0;
      totM += p;
      if (o > p) vender += (P * (o - p)) / 100;
      else if (p > o) comprar += (P * (p - o)) / 100;
    });
    PR.board.entra.forEach(function (i) {
      var p = Number(i.pct) || 0;
      totE += p;
      comprar += (P * p) / 100;
    });
    var giro = P > 0 ? (comprar / P) * 100 : 0;
    return {
      patrim: P,
      vender: vender,
      comprar: comprar,
      giro: giro,
      saldo: comprar - vender,
      totM: totM,
      totE: totE,
      tot: totM + totE,
      totSai: totSai,
      rsSai: (P * totSai) / 100,
    };
  }
  function classSummary() {
    var m = {},
      P = Number(PR.patrim) || 0;
    propostaItems().forEach(function (i) {
      var c = i.cat || "Renda Fixa";
      m[c] = (m[c] || 0) + (Number(i.pct) || 0);
    });
    var out = [];
    CATS.forEach(function (c) {
      var p = m[c] || 0;
      if (p > 0.049) out.push({ cat: c, pct: p, rs: (P * p) / 100 });
    });
    return out;
  }

  /* ===================== IMPORTADORES ===================== */
  function setStatus(t, c) {
    var s = el("pmStatus");
    if (!s) return;
    s.className = "pm-status" + (c ? " " + c : "");
    s.textContent = t;
  }
  function setActive(id) {
    ["pmSrcSim", "pmSrcXls"].forEach(function (x) {
      var e = el(x);
      if (e) e.classList.toggle("on", x === id);
    });
  }
  /* Carrega a carteira atual: TODOS os ativos vao para MANTEM. Nada e colocado em SAI automaticamente. */
  function loadAtual(list) {
    PR.atualAssets = (list || []).filter(function (a) {
      return a && a.cat;
    });
    PR.board.sai = [];
    PR.board.mantem = [];
    var seen = {};
    PR.atualAssets.forEach(function (a) {
      var k = nkey(a.nome);
      if (!k || seen[k]) return;
      seen[k] = 1;
      var it = mkItem({
        nome: a.nome,
        cat: a.cat,
        pct: Number(a.pct) || 0,
        pctOrig: Number(a.pct) || 0,
        detalhe: a.detalhe || "",
        liq: a.liq || "",
        origem: "atual",
        fonte: "atual",
      });
      PR.board.mantem.push(it);
    });
    /* ENTRA nao pode conter nada que o cliente ja tem */
    PR.board.entra = PR.board.entra.filter(function (it) {
      return !seen[nkey(it.nome)];
    });
  }
  function seedSim() {
    try {
      var b = window.RICO_BRIDGE && window.RICO_BRIDGE.carteira;
      if (!b || !b.itens || !b.itens.length) {
        setStatus(
          "Nenhuma carteira no Simulador. Monte uma ou importe o Excel.",
          "err",
        );
        return;
      }
      PR.patrim = Number(b.patrimonio) || 0;
      PR.cliente = b.cliente || PR.cliente || "";
      loadAtual(
        (b.itens || []).map(function (it) {
          return {
            nome: it.nome,
            cat: CANON[it.classe] || canonCat(it.classe),
            pct: Number(it.pct) || 0,
            detalhe: it.detalhe || "",
            liq: it.liquidez || "",
          };
        }),
      );
      setStatus(
        "Carteira do Simulador carregada em MANTÉM. Marque o que sai.",
        "ok",
      );
      render();
    } catch (e) {
      setStatus("Erro ao ler a carteira do Simulador.", "err");
    }
  }
  function seedXls(file) {
    setStatus("Lendo arquivo...", "");
    if (typeof window.RICO_importPosicaoFile !== "function") {
      setStatus(
        "Importador indisponivel; abra a aba de Aderencia uma vez.",
        "err",
      );
      return;
    }
    window.RICO_importPosicaoFile(file, function (parsed) {
      try {
        PR.patrim = Number(parsed.patrimonio) || 0;
        PR.cliente = parsed.conta ? "Conta " + parsed.conta : PR.cliente || "";
        loadAtual(
          (parsed.ativos || []).map(function (z) {
            return {
              nome: z.name,
              cat: CANON[z.categoria] || canonCat(z.categoria),
              pct: Number(z.pct) || 0,
              detalhe: "",
              liq: "",
            };
          }),
        );
        setStatus(
          "Posição do cliente importada em MANTÉM. Marque o que sai.",
          "ok",
        );
        render();
      } catch (e) {
        setStatus("Erro ao interpretar o arquivo.", "err");
      }
    });
  }
  /* Traz a carteira montada no Simulador como PROPOSTA (coluna ENTRA) */
  function importSimProposta() {
    var b = window.RICO_BRIDGE && window.RICO_BRIDGE.carteira;
    if (!b || !b.itens || !b.itens.length) {
      setStatus("Monte uma carteira no Simulador primeiro.", "err");
      return;
    }
    PR.board.entra = PR.board.entra.filter(function (it) {
      return it.fonte !== "perfil" && it.fonte !== "sim";
    });
    var skipped = 0;
    b.itens.forEach(function (it) {
      var c = canonCat(it.classe);
      if (!c) return;
      var novo = mkItem({
        nome: it.nome,
        cat: c,
        pct: Number(it.pct) || 0,
        pctOrig: 0,
        detalhe: it.detalhe || "",
        liq: it.liquidez || "",
        origem: "novo",
        fonte: "sim",
        tags: it.tags && it.tags.length ? it.tags : null,
      });
      if (!boardAdd("entra", novo)) skipped++;
    });
    if (!PR.patrim) PR.patrim = Number(b.patrimonio) || 0;
    if (!PR.cliente) PR.cliente = b.cliente || "";
    setStatus(
      "Carteira do Simulador importada como proposta." +
        (skipped
          ? " " + skipped + " ativo(s) o cliente já tem — mantidos."
          : ""),
      "ok",
    );
    render();
  }

  /* ===================== PERFIS (semeiam a coluna ENTRA) ===================== */
  var PR_TEMPLATES = {
    Conservadora: [
      ["Renda Fixa", "LCD", 72.5, "93% a 94% CDI · 1–5 anos", "No vencimento"],
      ["Renda Fixa", "NTN-B", 12.5, "IPCA + 7,8% a.a. · Tesouro Direto", "D+1"],
      ["Renda Fixa", "LTN", 5, "14% a.a. · Tesouro Direto", "No vencimento"],
      [
        "Multimercados",
        "ACE Multicenários",
        2.5,
        "Rentabilizou ~230% do CDI nos últimos anos",
        "D+17",
      ],
      [
        "Fundos Listados",
        "JHSF Capital Malls",
        2.5,
        "Shoppings premium da JHSF · trophy assets de alta renda",
        "",
      ],
      [
        "Internacional",
        "Renda Fixa Global",
        2.5,
        "Crédito global em dólar · Certificate of Deposit",
        "No vencimento",
      ],
      [
        "Internacional",
        "XP Global Ações",
        2.5,
        "Ações globais — EUA, Europa e Reino Unido",
        "~D+5",
      ],
    ],
    Moderada: [
      ["Renda Fixa", "LCD", 35.5, "93/94% CDI · 1–5 anos", "No vencimento"],
      ["Renda Fixa", "NTN-B", 22.5, "IPCA + 7,8% a.a. · Tesouro Direto", "D+1"],
      ["Renda Fixa", "LTN", 10, "14% a.a. · Tesouro Direto", "No vencimento"],
      [
        "Multimercados",
        "XP Forças Armadas",
        7,
        "Defesa dos EUA (Palantir e afins) · 5 anos",
        "No vencimento",
      ],
      [
        "Multimercados",
        "ACE Multicenários",
        7,
        "Rentabilizou ~230% do CDI nos últimos anos",
        "D+17",
      ],
      [
        "Renda Variável",
        "BOVA11 Protegida",
        5,
        "Proteção total de capital · participa da alta até 28% (15% acima) · Collar UI de 2 anos",
        "No vencimento",
      ],
      [
        "Fundos Listados",
        "JHSF Capital Malls",
        4,
        "Shoppings premium · trophy assets de alta renda",
        "",
      ],
      [
        "Alternativos",
        "Ouro — Retorno Otimizado",
        3,
        "Exposição a ouro com estrutura otimizada · 3 a 5 anos",
        "No vencimento",
      ],
      [
        "Internacional",
        "Wellington Global Quality",
        3.5,
        "100% ações dos EUA, Europa e Reino Unido · +75% em 3 anos",
        "D+5",
      ],
      [
        "Internacional",
        "CD de 1 ano",
        2.5,
        "Certificate of Deposit · 1 ano pré-fixado em dólar",
        "No vencimento",
      ],
    ],
    Sofisticada: [
      ["Renda Fixa", "LCD", 16, "93/94% do CDI", "No vencimento"],
      ["Renda Fixa", "NTN-B", 27.5, "IPCA + 7,8% a.a. · Tesouro Direto", "D+1"],
      ["Renda Fixa", "LTN", 7.5, "14% a.a. · Tesouro Direto", "No vencimento"],
      [
        "Multimercados",
        "ACE Multicenários",
        7,
        "Rentabilizou ~230% do CDI nos últimos anos",
        "D+17",
      ],
      [
        "Multimercados",
        "XP Terras Raras",
        3,
        "Terras raras e minerais críticos · eletrificação, defesa e disputa EUA–China",
        "No vencimento",
      ],
      [
        "Renda Variável",
        "BOVA11",
        3,
        "ETF do Ibovespa · Collar UI de 2 anos, proteção total com alta limitada",
        "No vencimento",
      ],
      [
        "Renda Variável",
        "BPAC11",
        3,
        "BTG Pactual · SmartCupom, cupom de 8% em 8 meses",
        "No vencimento",
      ],
      [
        "Renda Variável",
        "ITUB",
        3,
        "Itaú Unibanco · Fence de 1 ano, proteção parcial com alta limitada",
        "No vencimento",
      ],
      [
        "Renda Variável",
        "Microsoft",
        3,
        "Software e nuvem (Azure), líder em IA · Collar UI de 2 anos",
        "No vencimento",
      ],
      [
        "Renda Variável",
        "AXIA3",
        3,
        "Axia Energia (ex-Eletrobras) · Collar UI de 1 ano e meio",
        "No vencimento",
      ],
      [
        "Fundos Listados",
        "JHSF Capital Malls",
        3.5,
        "Shoppings premium da JHSF · trophy assets, DY de dois dígitos",
        "",
      ],
      [
        "Fundos Listados",
        "XP Logístico Prime",
        2,
        "Galpões logísticos de alto padrão · estruturado em balcão",
        "",
      ],
      [
        "Fundos Listados",
        "XPAG",
        2,
        "XP Crédito Agro (Fiagro) · renda mensal isenta de IR",
        "",
      ],
      [
        "Fundos Listados",
        "XP Habitat 2",
        2,
        "FII de papel · CRIs pulverizados de incorporação residencial",
        "",
      ],
      [
        "Alternativos",
        "XP Tecnologia",
        3,
        "QQQ protegido de 1 ano",
        "No vencimento",
      ],
      [
        "Alternativos",
        "Ouro Retorno Otimizado",
        4,
        "Exposição a ouro com estrutura otimizada",
        "No vencimento",
      ],
      [
        "Internacional",
        "Wellington Global Quality",
        5,
        "100% ações dos EUA, Europa e Reino Unido · +75% em 3 anos",
        "D+5",
      ],
      [
        "Internacional",
        "Renda Fixa Global",
        2.5,
        "Crédito global em dólar · Certificate of Deposit",
        "No vencimento",
      ],
    ],
  };
  function profileItems(name) {
    var _T = window.RICO_TEMPLATES;
    /* construtor ja e pre-inicializado no clique de btnPropor; nao reinicializar daqui (re-entrancia travava o renderer) */
    if (_T && typeof _T[name] === "function") {
      var items = [];
      try {
        items = _T[name]() || [];
      } catch (e) {
        items = [];
      }
      if (items.length) {
        return items
          .map(function (it) {
            return {
              nome: it.nome,
              cat: canonCat(it.classe),
              pct: Number(it.pct) || 0,
              detalhe: it.detalhe || "",
              liq: it.liquidez || "",
              tags: it.tags && it.tags.length ? it.tags.slice() : null,
              retCat: it.retCat,
              retVal: it.retVal,
              retIsento: it.retIsento,
            };
          })
          .filter(function (x) {
            return x.cat;
          });
      }
    }
    var tpl = PR_TEMPLATES[name] || [];
    return tpl
      .map(function (r) {
        return {
          nome: r[1],
          cat: canonCat(r[0]),
          pct: Number(r[2]) || 0,
          detalhe: r[3] || "",
          liq: r[4] || "",
        };
      })
      .filter(function (x) {
        return x.cat;
      });
  }
  /* Perfil substitui apenas os itens semeados por perfil; mantem os adicionados a mao.
     Nada que o cliente ja tem (MANTEM/SAI) e duplicado em ENTRA. */
  function applyProfile(name) {
    PR.perfil = name;
    var items = profileItems(name);
    if (!items.length) {
      setStatus("Perfil sem ativos configurados.", "err");
      return;
    }
    PR.board.entra = PR.board.entra.filter(function (it) {
      return it.fonte !== "perfil";
    });
    var ja = 0;
    items.forEach(function (x) {
      var novo = mkItem({
        nome: x.nome,
        cat: x.cat,
        pct: x.pct,
        pctOrig: 0,
        detalhe: x.detalhe,
        liq: x.liq,
        origem: "novo",
        fonte: "perfil",
        tags: x.tags,
        retCat: x.retCat,
        retVal: x.retVal,
        retIsento: x.retIsento,
      });
      if (!boardAdd("entra", novo)) ja++;
    });
    fitEntraTo100();
    setStatus(
      "Perfil " +
        name +
        " aplicado — ENTRA ajustado para fechar 100%." +
        (ja
          ? " " + ja + " ativo(s) o cliente já possui — permanecem em MANTÉM."
          : ""),
      "ok",
    );
    render();
  }
  /* Escala apenas a coluna ENTRA para que MANTÉM + ENTRA feche 100% (preserva os pesos dos mantidos). */
  function fitEntraTo100() {
    var totM = 0;
    PR.board.mantem.forEach(function (i) {
      totM += Number(i.pct) || 0;
    });
    var entra = PR.board.entra;
    if (!entra.length) return;
    var rem = Math.round((100 - totM) * 10) / 10;
    if (rem <= 0) {
      ajustarPropor(false);
      return;
    }
    var sumE = 0;
    entra.forEach(function (i) {
      sumE += Number(i.pct) || 0;
    });
    if (sumE <= 0) {
      var each = rem / entra.length;
      entra.forEach(function (i) {
        i.pct = Math.round(each * 10) / 10;
      });
    } else {
      var fct = rem / sumE;
      entra.forEach(function (i) {
        i.pct = Math.round((Number(i.pct) || 0) * fct * 10) / 10;
      });
    }
    var newE = 0;
    entra.forEach(function (i) {
      newE += Number(i.pct) || 0;
    });
    var diff = Math.round((rem - newE) * 10) / 10;
    if (diff !== 0) {
      var big = entra[0];
      entra.forEach(function (i) {
        if ((Number(i.pct) || 0) > (Number(big.pct) || 0)) big = i;
      });
      big.pct = Math.round(((Number(big.pct) || 0) + diff) * 10) / 10;
    }
  }
  /* Escala MANTEM+ENTRA para somar exatamente 100,0 (ou distribui igualmente) */
  function ajustarPropor(equal) {
    var flat = propostaItems();
    if (!flat.length) return;
    var target = 100;
    var sum = 0;
    flat.forEach(function (a) {
      sum += Number(a.pct) || 0;
    });
    if (equal || sum <= 0) {
      var each = target / flat.length;
      flat.forEach(function (a) {
        a.pct = Math.round(each * 10) / 10;
      });
    } else {
      var f = target / sum;
      flat.forEach(function (a) {
        a.pct = Math.round((Number(a.pct) || 0) * f * 10) / 10;
      });
    }
    var newSum = 0;
    flat.forEach(function (a) {
      newSum += Number(a.pct) || 0;
    });
    var rem = Math.round((target - newSum) * 10) / 10;
    if (rem !== 0) {
      var big = flat[0];
      flat.forEach(function (a) {
        if ((Number(a.pct) || 0) > (Number(big.pct) || 0)) big = a;
      });
      big.pct = Math.round(((Number(big.pct) || 0) + rem) * 10) / 10;
      if (big.pct < 0) big.pct = 0;
    }
    render();
  }
  function clearAll() {
    PR.cliente = "";
    PR.patrim = 0;
    PR.atualAssets = [];
    PR.board = { sai: [], mantem: [], entra: [] };
    PR.picker = false;
    PR.perfil = null;
    try {
      setStatus("", "");
    } catch (e) {}
    try {
      setActive("");
    } catch (e) {}
    render();
  }

  /* ===================== RENDER ===================== */
  function badgeHTML(it) {
    var h = '<div class="pm-badges">';
    h +=
      it.origem === "atual"
        ? '<span class="pm-bdg tem">Já tem</span>'
        : '<span class="pm-bdg novo">Novo</span>';
    if (it.protegido)
      h += '<span class="pm-bdg prot">🔒 XP · não vendável</span>';
    h += "</div>";
    return h;
  }
  function retHTML(it) {
    return (
      '<div class="pm-cret"><span class="pm-acretlbl">Retorno</span>' +
      '<select class="pm-arcat" data-arcat="' +
      it.id +
      '"><option value="pos"' +
      (it.retCat === "pos" ? " selected" : "") +
      '>Pós Fixado</option><option value="pre"' +
      (it.retCat === "pre" ? " selected" : "") +
      '>Pré Fixado</option><option value="inflacao"' +
      (it.retCat === "inflacao" ? " selected" : "") +
      '>Inflação</option><option value="mercado"' +
      (!it.retCat || it.retCat === "mercado" ? " selected" : "") +
      ">A mercado</option></select>" +
      '<input class="pm-arval" type="text" inputmode="decimal" value="' +
      fp(it.retVal || 0) +
      '" data-arval="' +
      it.id +
      '"><span class="pm-arunit">' +
      (it.retCat === "pos"
        ? "% do CDI"
        : it.retCat === "inflacao"
          ? "IPCA + %"
          : "% a.a.") +
      "</span>" +
      '<button type="button" class="pm-arisento' +
      (it.retIsento ? " on" : "") +
      '" data-arisento="' +
      it.id +
      '">Isento IR</button></div>'
    );
  }
  function cardHTML(it, col) {
    var P = Number(PR.patrim) || 0,
      col2 = COLORS[it.cat] || "#7C8CFF";
    var h =
      '<div class="pm-card' +
      (col === "sai" ? " out" : "") +
      '" style="border-left-color:' +
      col2 +
      '">';
    h +=
      '<div class="pm-ctop"><div class="pm-cname">' +
      (col === "sai"
        ? esc2(it.nome || "(sem nome)")
        : '<input class="pm-cnin" type="text" placeholder="Nome do ativo" value="' +
          esc2(it.nome) +
          '" data-nm="' +
          it.id +
          '">') +
      "</div></div>";
    h +=
      '<div class="pm-cclass"><span class="pm-dot" style="background:' +
      col2 +
      '"></span>' +
      esc2(prClassLabel(it.cat)) +
      "</div>";
    h += badgeHTML(it);
    if (it.detalhe) h += '<div class="pm-acdet">' + esc2(it.detalhe) + "</div>";
    if (col === "sai") {
      h +=
        '<div class="pm-crow"><span class="pm-orig">Sai com ' +
        fp(it.pctOrig || 0) +
        "% &middot; R$ " +
        fmt((P * (Number(it.pctOrig) || 0)) / 100) +
        "</span></div>";
      h +=
        '<div class="pm-mv"><button class="pm-mvb keep" data-mv="mantem" data-id="' +
        it.id +
        '">← Manter</button></div>';
    } else {
      h +=
        '<div class="pm-crow">' +
        '<div class="pm-pct"><input type="text" inputmode="decimal" value="' +
        fp(it.pct || 0) +
        '" data-pct="' +
        it.id +
        '"><span class="pm-lbl">%</span></div>' +
        '<input class="pm-rsin" type="text" inputmode="decimal" value="' +
        fmt((P * (Number(it.pct) || 0)) / 100) +
        '" data-rs="' +
        it.id +
        '" title="Valor em R$ — a % é calculada">' +
        (it.origem === "atual"
          ? '<span class="pm-orig">tinha ' + fp(it.pctOrig || 0) + "%</span>"
          : "") +
        "</div>";
      h += '<div class="pm-mv">';
      if (col === "mantem") {
        if (!it.protegido)
          h +=
            '<button class="pm-mvb sai" data-mv="sai" data-id="' +
            it.id +
            '">→ Sai</button>';
        if (it.origem === "novo")
          h +=
            '<button class="pm-mvb del" data-rm="' +
            it.id +
            '">✕ Remover</button>';
      } else {
        h +=
          '<button class="pm-mvb del" data-rm="' +
          it.id +
          '">✕ Remover</button>';
      }
      h += "</div>";
      h += retHTML(it);
    }
    if (it.tags && it.tags.length)
      h +=
        '<div class="pm-actags">' +
        it.tags
          .map(function (t) {
            return (
              '<span class="pm-tag ' + tagClass(t) + '">' + esc2(t) + "</span>"
            );
          })
          .join("") +
        "</div>";
    h += "</div>";
    return h;
  }
  function pickerHTML() {
    if (!PR.picker) return "";
    var _LD =
      typeof window.__hubLibData === "function"
        ? window.__hubLibData()
        : window.__LIBDATA || [];
    if (!_LD || !_LD.length) {
      /* sem re-init aqui: o construtor ja foi pre-inicializado ao abrir o Propor */
      _LD =
        typeof window.__hubLibData === "function"
          ? window.__hubLibData()
          : window.__LIBDATA || [];
    }
    var c = PR.pickerCat;
    var libItems = (_LD || []).filter(function (x) {
      return normCat(x.classe) === normCat(c);
    });
    var sel =
      '<select class="pm-arcat" id="pmPickCat">' +
      CATS.map(function (x) {
        return (
          '<option value="' +
          esc2(x) +
          '"' +
          (x === c ? " selected" : "") +
          ">" +
          esc2(prClassLabel(x)) +
          "</option>"
        );
      }).join("") +
      "</select>";
    return (
      '<div class="pm-picker">' +
      '<div class="pm-gavtop"><span class="pm-gavtit">📁 Biblioteca</span>' +
      sel +
      '<button class="pm-pnew" id="pmPickNew">+ Novo ativo</button></div>' +
      '<input class="pm-psearch" type="text" placeholder="Buscar ativo..." id="pmPickSearch">' +
      '<div class="pm-plist">' +
      (libItems.length
        ? libItems
            .map(function (it, pi) {
              return (
                '<div class="pm-pitem" data-pick="' +
                pi +
                '" style="border-left:3px solid ' +
                (COLORS[c] || "#9AA2D0") +
                '">' +
                '<div class="pm-pitop"><div class="pm-piname">' +
                esc2(it.nome) +
                '</div><span class="pm-piadd">+ Add</span></div>' +
                (it.detalhe
                  ? '<div class="pm-pidesc">' + esc2(it.detalhe) + "</div>"
                  : "") +
                (it.liq
                  ? '<div class="pm-piliq">Liquidez: ' + esc2(it.liq) + "</div>"
                  : "") +
                "</div>"
              );
            })
            .join("")
        : '<div class="pm-pidesc" style="padding:8px">Nenhum ativo desta classe na biblioteca.</div>') +
      '</div><button class="pm-pmanual" id="pmPickManual">+ Adicionar manualmente (sem salvar na biblioteca)</button>' +
      '<button class="pm-pmanual" id="pmPickClose" style="margin-top:6px">Fechar biblioteca</button></div>'
    );
  }
  function chip(k, v, col) {
    return (
      '<div class="pm-chip"><div class="k">' +
      k +
      '</div><div class="v" style="color:' +
      col +
      '">' +
      v +
      "</div></div>"
    );
  }
  function render() {
    var m = metrics(),
      P = m.patrim;
    if (el("pmCli")) el("pmCli").value = PR.cliente || "";
    if (el("pmPat")) el("pmPat").value = fmt(P);

    /* colunas */
    var hs = PR.board.sai
      .map(function (it) {
        return cardHTML(it, "sai");
      })
      .join("");
    if (!PR.board.sai.length)
      hs =
        '<div class="pm-empty">Nada sai da carteira. Use "→ Sai" nos ativos mantidos para retirar um ativo. Ativos de carrego (CDB/LCI/LCA/CRI/CRA/debênture) não são sugeridos aqui.</div>';
    el("pmColSai").innerHTML = hs;
    var hm = PR.board.mantem
      .map(function (it) {
        return cardHTML(it, "mantem");
      })
      .join("");
    if (!PR.board.mantem.length)
      hm =
        '<div class="pm-empty">Importe a carteira atual do cliente (Carteira do Simulador ou Excel). Todos os ativos entram aqui e você decide o que sai.</div>';
    el("pmColMantem").innerHTML = hm;
    var he = PR.board.entra
      .map(function (it) {
        return cardHTML(it, "entra");
      })
      .join("");
    if (!PR.board.entra.length)
      he =
        '<div class="pm-empty">Nenhum ativo novo. Escolha um perfil (Conservadora / Moderada / Sofisticada) ou use "+ Adicionar da biblioteca".</div>';
    el("pmColEntra").innerHTML = he;
    el("pmPicker").innerHTML = pickerHTML();

    el("pmSaiTot").innerHTML =
      '<span style="color:#FF6B6B">' +
      fp(m.totSai) +
      "% · R$ " +
      fmt(m.rsSai) +
      "</span>";
    el("pmManterTot").innerHTML =
      '<span style="color:#9AA2D0">' +
      fp(m.totM) +
      "% · R$ " +
      fmt((P * m.totM) / 100) +
      "</span>";
    el("pmEntraTot").innerHTML =
      '<span style="color:#3DD68C">' +
      fp(m.totE) +
      "% · R$ " +
      fmt((P * m.totE) / 100) +
      "</span>";

    /* total + barra 100% */
    var tot = m.tot,
      ok = Math.abs(100 - tot) < 0.1,
      over = tot > 100.0001;
    var barCol = ok ? "#3DD68C" : over ? "#FF6B6B" : "#FFB020",
      barW = Math.max(0, Math.min(100, tot));
    var falta = 100 - tot;
    el("pmTot").innerHTML =
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap"><span>Total alocado (mantém + entra): <b class="' +
      (ok ? "ok" : "warn") +
      '" style="color:' +
      barCol +
      '">' +
      fp(tot) +
      "%</b>" +
      (ok
        ? ""
        : ' <span class="pm-lbl">(' +
          (over ? "acima de 100%" : "ajuste para 100%") +
          ")</span>") +
      '</span><span class="pm-lbl">Mantém ' +
      fp(m.totM) +
      "% · Entra " +
      fp(m.totE) +
      "%</span></div>" +
      '<div style="height:8px;background:rgba(255,255,255,.08);border-radius:6px;margin-top:8px;overflow:hidden"><div style="width:' +
      barW +
      "%;height:100%;background:" +
      barCol +
      ';transition:width .15s"></div></div>' +
      (ok
        ? ""
        : '<div style="margin-top:6px;font-size:12px;color:#9AA2D0;font-weight:600">' +
          (falta > 0
            ? 'Falta alocar <b style="color:#FFB020">' +
              fp(falta) +
              "</b>% &middot; R$ " +
              fmt((P * falta) / 100)
            : 'Passou <b style="color:#FF6B6B">' +
              fp(-falta) +
              "</b>% &middot; R$ " +
              fmt((P * -falta) / 100)) +
          "</div>");

    el("pmChips").innerHTML =
      chip("Patrimonio", "R$ " + fmt(P), "var(--wh)") +
      chip("A vender", "R$ " + fmt(m.vender), "#FF6B6B") +
      chip("A comprar", "R$ " + fmt(m.comprar), "#3DD68C") +
      chip("Giro", fp(m.giro) + "%", "#FFB020") +
      chip(
        m.saldo >= 0 ? "Aporte" : "Resgate",
        "R$ " + fmt(Math.abs(m.saldo)),
        m.saldo >= 0 ? "#3DD68C" : "#FF6B6B",
      );

    /* alocacao por classe (esconde classes zeradas) */
    var cs = classSummary();
    var ha = '<div class="pm-alloct">Alocação da carteira proposta</div>';
    if (!cs.length) {
      ha += '<div class="pm-empty">Sem ativos na proposta ainda.</div>';
    } else {
      cs.forEach(function (r) {
        ha +=
          '<div class="pm-allocrow"><span class="pm-allocnm"><span class="pm-dot" style="background:' +
          (COLORS[r.cat] || "#888") +
          '"></span>' +
          esc2(prClassLabel(r.cat)) +
          '</span><span class="pm-allocv">' +
          fp(r.pct) +
          "% &middot; R$ " +
          fmt(r.rs) +
          "</span></div>";
      });
    }
    el("pmAllocBox").innerHTML = ha;
    bindBoard();
  }
  function bindBoard() {
    var root = el("proporModal");
    if (!root) return;
    Array.prototype.forEach.call(
      root.querySelectorAll("[data-mv]"),
      function (b) {
        b.onclick = function () {
          var id = b.getAttribute("data-id"),
            to = b.getAttribute("data-mv");
          var f = findById(id);
          if (!f) return;
          boardMove(id, to);
          render();
        };
      },
    );
    Array.prototype.forEach.call(
      root.querySelectorAll("[data-rm]"),
      function (b) {
        b.onclick = function () {
          boardRemove(b.getAttribute("data-rm"));
          render();
        };
      },
    );
    Array.prototype.forEach.call(
      root.querySelectorAll("[data-pct]"),
      function (i) {
        i.onchange = function () {
          var f = findById(i.getAttribute("data-pct"));
          if (!f) return;
          var v = pn(i.value);
          if (!isFinite(v) || v < 0) v = 0;
          f.item.pct = v;
          render();
        };
      },
    );
    Array.prototype.forEach.call(
      root.querySelectorAll("[data-rs]"),
      function (i) {
        i.onchange = function () {
          var f = findById(i.getAttribute("data-rs"));
          if (!f) return;
          var v = pn(i.value),
            P = Number(PR.patrim) || 0;
          var p = P > 0 ? (v / P) * 100 : 0;
          f.item.pct = Math.round(p * 100) / 100;
          render();
        };
      },
    );
    Array.prototype.forEach.call(
      root.querySelectorAll("[data-nm]"),
      function (i) {
        i.onchange = function () {
          var f = findById(i.getAttribute("data-nm"));
          if (!f) return;
          var nn = String(i.value || "");
          var ex = findAny(nn);
          if (ex && ex.item !== f.item) {
            setStatus("Já existe um ativo com esse nome no quadro.", "err");
            render();
            return;
          }
          f.item.nome = nn;
          f.item.travado = isTravado(nn, f.item.detalhe, f.item.liq);
          f.item.protegido =
            isProtected(nn, f.item.cat) && f.item.origem === "atual";
          render();
        };
      },
    );
    Array.prototype.forEach.call(
      root.querySelectorAll("[data-arcat]"),
      function (x) {
        x.onchange = function () {
          var f = findById(x.getAttribute("data-arcat"));
          if (f) {
            f.item.retCat = x.value;
            render();
          }
        };
      },
    );
    Array.prototype.forEach.call(
      root.querySelectorAll("[data-arval]"),
      function (x) {
        x.onchange = function () {
          var f = findById(x.getAttribute("data-arval"));
          if (f) {
            f.item.retVal = pn(x.value);
            render();
          }
        };
      },
    );
    Array.prototype.forEach.call(
      root.querySelectorAll("[data-arisento]"),
      function (x) {
        x.onclick = function () {
          var f = findById(x.getAttribute("data-arisento"));
          if (f) {
            f.item.retIsento = !f.item.retIsento;
            render();
          }
        };
      },
    );
    /* picker */
    var pc = el("pmPickCat");
    if (pc)
      pc.onchange = function () {
        PR.pickerCat = pc.value;
        render();
      };
    var ps = el("pmPickSearch");
    if (ps) {
      ps.oninput = function () {
        var q = String(ps.value || "").toLowerCase();
        Array.prototype.forEach.call(
          root.querySelectorAll(".pm-pitem"),
          function (it) {
            it.style.display =
              it.textContent.toLowerCase().indexOf(q) >= 0 ? "" : "none";
          },
        );
      };
    }
    var pcl = el("pmPickClose");
    if (pcl)
      pcl.onclick = function () {
        PR.picker = false;
        render();
      };
    Array.prototype.forEach.call(
      root.querySelectorAll("[data-pick]"),
      function (x) {
        x.onclick = function () {
          var c = PR.pickerCat;
          var _LD =
            typeof window.__hubLibData === "function"
              ? window.__hubLibData()
              : window.__LIBDATA || [];
          var it = (_LD || []).filter(function (y) {
            return normCat(y.classe) === normCat(c);
          })[+x.getAttribute("data-pick")];
          if (!it) return;
          var novo = mkItem({
            nome: it.nome,
            cat: c,
            pct: 0,
            pctOrig: 0,
            detalhe: it.detalhe || "",
            liq: it.liq || "",
            origem: "novo",
            fonte: "manual",
          });
          if (!boardAdd("entra", novo)) {
            setStatus(
              'O cliente já tem "' + it.nome + '" — ele está em MANTÉM/SAI.',
              "err",
            );
          } else setStatus("", "");
          render();
        };
      },
    );
    var pn2 = el("pmPickNew");
    if (pn2)
      pn2.onclick = function () {
        var c = PR.pickerCat;
        var nome = prompt("Nome do novo ativo (" + c + "):");
        if (!nome || !nome.trim()) return;
        var det =
          prompt("Detalhe / rentabilidade (ex.: 93% do CDI - isento):", "") ||
          "";
        var liq = prompt("Liquidez (ex.: D+1, No vencimento):", "") || "";
        /* sem re-init aqui: o construtor ja foi pre-inicializado ao abrir o Propor */
        var novo =
          typeof window.__hubLibAdd === "function"
            ? window.__hubLibAdd({
                classe: c,
                nome: nome,
                detalhe: det,
                liq: liq,
              })
            : null;
        var base = novo || { nome: nome.trim(), detalhe: det, liq: liq };
        var item = mkItem({
          nome: base.nome,
          cat: c,
          pct: 0,
          pctOrig: 0,
          detalhe: base.detalhe || "",
          liq: base.liq || "",
          origem: "novo",
          fonte: "manual",
        });
        if (!boardAdd("entra", item))
          setStatus("Esse ativo já está no quadro.", "err");
        render();
      };
    var pm = el("pmPickManual");
    if (pm)
      pm.onclick = function () {
        var nome = prompt("Nome do ativo (" + PR.pickerCat + "):");
        if (!nome || !nome.trim()) return;
        var item = mkItem({
          nome: nome.trim(),
          cat: PR.pickerCat,
          pct: 0,
          pctOrig: 0,
          origem: "novo",
          fonte: "manual",
        });
        if (!boardAdd("entra", item))
          setStatus("Esse ativo já está no quadro.", "err");
        render();
      };
    var f100 = el("pmFit100");
    if (f100)
      f100.onclick = function () {
        ajustarPropor(false);
      };
    var feq = el("pmEqual");
    if (feq)
      feq.onclick = function () {
        ajustarPropor(true);
      };
  }

  /* ===================== PDFs ===================== */
  function prSan(name) {
    var s = String(name == null ? "" : name)
      .replace(/[\\/:*?"<>|\r\n]+/g, "")
      .replace(/\s+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "");
    return s.slice(0, 60) || "cliente";
  }
  function prDocDate() {
    var n = new Date();
    return (
      ("0" + n.getDate()).slice(-2) +
      "/" +
      ("0" + (n.getMonth() + 1)).slice(-2) +
      "/" +
      n.getFullYear()
    );
  }
  function prBaseCSS() {
    return (
      "<style>" +
      ".ppdoc{font-family:Arial,Helvetica,sans-serif;color:#12162a;width:794px;margin:0 auto;background:#fff}" +
      ".ppdoc *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}" +
      ".ppdoc .hdr{background:#0b1033;color:#fff;padding:26px 40px 20px}" +
      ".ppdoc .hdr .brand{font-family:Georgia,serif;font-size:30px;font-weight:700;color:#F26522;line-height:1}" +
      ".ppdoc .hdr .doct{font-size:16px;font-weight:800;margin-top:3px;letter-spacing:.3px}" +
      ".ppdoc .hdr .meta{font-size:11.5px;color:#c4c9e6;margin-top:13px;display:flex;gap:26px;flex-wrap:wrap}" +
      ".ppdoc .hdr .meta b{color:#fff;font-weight:700}" +
      ".ppdoc .accent{height:5px;background:#F26522}" +
      ".ppdoc .body{padding:22px 40px 28px}" +
      ".ppdoc .sect-t{font-size:11.5px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:#0b1033;margin:20px 0 9px;padding-bottom:6px;border-bottom:2px solid #eceef5}" +
      ".ppdoc .sect-t.first{margin-top:0}" +
      ".ppdoc table{width:100%;border-collapse:collapse;font-size:12.5px}" +
      ".ppdoc th{background:#0b1033;color:#fff;font-size:10px;text-transform:uppercase;letter-spacing:.4px;padding:9px 10px;text-align:right}" +
      ".ppdoc th:first-child{text-align:left}" +
      ".ppdoc td{padding:8px 10px;border-bottom:1px solid #eee}" +
      ".ppdoc td.cl{font-weight:700}" +
      ".ppdoc .dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:7px;vertical-align:middle}" +
      ".ppdoc .cards{display:flex;gap:10px;margin:12px 0 4px}" +
      ".ppdoc .cd{flex:1;background:#f6f7fb;border:1px solid #e6e9f2;border-radius:10px;padding:12px 14px}" +
      ".ppdoc .cd .k{font-size:9.5px;text-transform:uppercase;letter-spacing:.4px;color:#6b7392;font-weight:700}" +
      ".ppdoc .cd .v{font-size:18px;font-weight:800;margin-top:5px}" +
      ".ppdoc .allocbar{display:flex;height:24px;border-radius:6px;overflow:hidden;margin:4px 0;border:1px solid #e6e9f2}" +
      ".ppdoc .allocbar .seg{height:100%}" +
      ".ppdoc .leg{display:flex;flex-wrap:wrap;gap:7px 16px;margin-top:9px;font-size:10.5px;color:#4a5170}" +
      ".ppdoc .leg .li{display:flex;align-items:center;gap:5px}" +
      ".ppdoc .box{border-radius:10px;padding:2px 16px 12px;margin-top:2px}" +
      ".ppdoc .box.sai{border:1px solid #f2d0d0;background:#fdf5f5}" +
      ".ppdoc .box.keep{border:1px solid #dfe3ee;background:#f8f9fc}" +
      ".ppdoc .box.in{border:1px solid #cdeadd;background:#f4fbf7}" +
      ".ppdoc .box .row{display:flex;justify-content:space-between;align-items:flex-start;padding:7px 0;border-bottom:1px solid rgba(0,0,0,.05);font-size:12px}" +
      ".ppdoc .box .row:last-child{border-bottom:none}" +
      ".ppdoc .box .rows.twocol{column-count:2;column-gap:30px}" +
      ".ppdoc .box .rows.twocol .row{break-inside:avoid;-webkit-column-break-inside:avoid}" +
      ".ppdoc .box .nm{font-weight:700}" +
      ".ppdoc .box.sai .nm{color:#8a2a2a}" +
      ".ppdoc .box.in .nm{color:#0a6b45}" +
      ".ppdoc .box .cls{font-size:9.5px;color:#828aaa;font-weight:600;text-transform:uppercase;letter-spacing:.3px;margin-top:2px}" +
      ".ppdoc .box .warn{font-size:9.5px;color:#a3701a;font-weight:700;margin-top:2px}" +
      ".ppdoc .box .val{white-space:nowrap;padding-left:12px;text-align:right;font-weight:700}" +
      ".ppdoc .box.sai .val{color:#c0392b}" +
      ".ppdoc .box.in .val{color:#0a7a45}" +
      ".ppdoc .box .tot{margin-top:9px;text-align:right;font-size:12.5px;font-weight:800}" +
      ".ppdoc .box.sai .tot{color:#c0392b}" +
      ".ppdoc .box.in .tot{color:#0a7a45}" +
      ".ppdoc .note{font-size:11px;color:#828aaa;padding:8px 2px}" +
      ".ppdoc .disc{font-size:9.5px;color:#8a90ad;line-height:1.5;margin-top:20px;border-top:1px solid #ececec;padding-top:10px}" +
      "</style>"
    );
  }
  function prShellOpen(docTitle, metaHTML) {
    return (
      prBaseCSS() +
      '<div class="ppdoc"><div class="hdr"><div class="brand">rico</div><div class="doct">' +
      docTitle +
      '</div><div class="meta">' +
      metaHTML +
      '</div></div><div class="accent"></div><div class="body">'
    );
  }
  function prShellClose(discHTML) {
    return '<div class="disc">' + discHTML + "</div></div></div>";
  }
  function prMeta() {
    return (
      "<span>Cliente: <b>" +
      esc2(PR.cliente || "cliente") +
      "</b></span><span>Patrimônio: <b>R$ " +
      fmt(PR.patrim) +
      "</b></span><span>Data: <b>" +
      prDocDate() +
      "</b></span>"
    );
  }
  function prCardsHTML(m) {
    return (
      '<div class="cards"><div class="cd"><div class="k">A vender</div><div class="v" style="color:#c0392b">R$ ' +
      fmt(m.vender) +
      "</div></div>" +
      '<div class="cd"><div class="k">A comprar</div><div class="v" style="color:#0a7a45">R$ ' +
      fmt(m.comprar) +
      "</div></div>" +
      '<div class="cd"><div class="k">Giro</div><div class="v">' +
      fp(m.giro) +
      "%</div></div>" +
      '<div class="cd"><div class="k">' +
      (m.saldo >= 0 ? "Aporte" : "Resgate") +
      '</div><div class="v" style="color:' +
      (m.saldo >= 0 ? "#0a7a45" : "#c0392b") +
      '">R$ ' +
      fmt(Math.abs(m.saldo)) +
      "</div></div></div>"
    );
  }
  function prSaiSection(m) {
    var arr = PR.board.sai;
    if (!arr.length) return "";
    var P = m.patrim,
      h =
        '<div class="sect-t">Saindo da carteira</div><div class="box sai"><div class="rows' +
        (arr.length > 6 ? " twocol" : "") +
        '">';
    arr.forEach(function (i) {
      var o = Number(i.pctOrig) || 0;
      h +=
        '<div class="row"><div><div class="nm">' +
        esc2(i.nome || "-") +
        '</div><div class="cls"><span class="dot" style="background:' +
        (COLORS[i.cat] || "#888") +
        '"></span>' +
        esc2(prClassLabel(i.cat)) +
        "</div>" +
        "</div>" +
        '<div class="val">' +
        fp(o) +
        "% · R$ " +
        fmt((P * o) / 100) +
        "</div></div>";
    });
    h +=
      '</div><div class="tot">Total saindo: ' +
      fp(m.totSai) +
      "% · R$ " +
      fmt(m.rsSai) +
      "</div></div>";
    return h;
  }
  function prMantemSection(m) {
    var arr = PR.board.mantem;
    if (!arr.length) return "";
    var P = m.patrim,
      h =
        '<div class="sect-t">Mantidos na carteira</div><div class="box keep"><div class="rows' +
        (arr.length > 6 ? " twocol" : "") +
        '">';
    arr.forEach(function (i) {
      var o = Number(i.pctOrig) || 0,
        p = Number(i.pct) || 0;
      h +=
        '<div class="row"><div><div class="nm">' +
        esc2(i.nome || "-") +
        (i.protegido ? " 🔒" : "") +
        '</div><div class="cls"><span class="dot" style="background:' +
        (COLORS[i.cat] || "#888") +
        '"></span>' +
        esc2(prClassLabel(i.cat)) +
        "</div>" +
        (i.travado
          ? '<div class="warn">Carrego até o vencimento — permanece na carteira</div>'
          : "") +
        "</div>" +
        '<div class="val" style="color:#12162a">' +
        fp(o) +
        "% → " +
        fp(p) +
        "% · R$ " +
        fmt((P * p) / 100) +
        "</div></div>";
    });
    h +=
      '</div><div class="tot" style="color:#12162a">Total mantido: ' +
      fp(m.totM) +
      "% · R$ " +
      fmt((P * m.totM) / 100) +
      "</div></div>";
    return h;
  }
  function prEntraSection(m) {
    var arr = PR.board.entra;
    if (!arr.length) return "";
    var P = m.patrim,
      h =
        '<div class="sect-t">Entrando na carteira</div><div class="box in"><div class="rows' +
        (arr.length > 6 ? " twocol" : "") +
        '">';
    arr.forEach(function (i) {
      var p = Number(i.pct) || 0;
      h +=
        '<div class="row"><div><div class="nm">' +
        esc2(i.nome || "-") +
        '</div><div class="cls"><span class="dot" style="background:' +
        (COLORS[i.cat] || "#888") +
        '"></span>' +
        esc2(prClassLabel(i.cat)) +
        "</div>" +
        (i.detalhe
          ? '<div class="cls" style="text-transform:none;letter-spacing:0">' +
            esc2(i.detalhe) +
            "</div>"
          : "") +
        "</div>" +
        '<div class="val">' +
        fp(p) +
        "% · R$ " +
        fmt((P * p) / 100) +
        "</div></div>";
    });
    h +=
      '</div><div class="tot">Total entrando: ' +
      fp(m.totE) +
      "% · R$ " +
      fmt((P * m.totE) / 100) +
      "</div></div>";
    return h;
  }
  function prAllocSection() {
    var cs = classSummary();
    if (!cs.length) return "";
    var tot = 0;
    cs.forEach(function (r) {
      tot += r.pct;
    });
    if (tot <= 0) tot = 100;
    var segs = "",
      leg = "",
      rows = "";
    cs.forEach(function (r) {
      segs +=
        '<div class="seg" style="width:' +
        (r.pct / tot) * 100 +
        "%;background:" +
        (COLORS[r.cat] || "#888") +
        '"></div>';
      leg +=
        '<div class="li"><span class="dot" style="background:' +
        (COLORS[r.cat] || "#888") +
        '"></span>' +
        esc2(prClassLabel(r.cat)) +
        " " +
        fp(r.pct) +
        "%</div>";
      rows +=
        '<tr><td class="cl"><span class="dot" style="background:' +
        (COLORS[r.cat] || "#888") +
        '"></span>' +
        esc2(prClassLabel(r.cat)) +
        '</td><td style="text-align:right;font-weight:bold">' +
        fp(r.pct) +
        '%</td><td style="text-align:right">R$ ' +
        fmt(r.rs) +
        "</td></tr>";
    });
    return (
      '<div class="sect-t">Alocação da carteira proposta</div><div class="allocbar">' +
      segs +
      '</div><div class="leg">' +
      leg +
      "</div>" +
      '<table style="margin-top:12px"><tr><th>Classe</th><th>% proposta</th><th>Valor</th></tr>' +
      rows +
      "</table>"
    );
  }
  function proporPrintFallback(fullHtml) {
    try {
      var w = window.open("", "_blank");
      if (!w) return;
      w.document.open();
      w.document.write(fullHtml);
      w.document.close();
    } catch (_) {}
  }
  function proporMakePDF(innerHTML, filename, opts) {
    opts = opts || {};
    var fullHtml =
      '<!doctype html><html><head><meta charset="utf-8"><title>' +
      (opts.title || "Documento") +
      '</title></head><body style="margin:0;background:#fff">' +
      innerHTML +
      "<scr" +
      "ipt>setTimeout(function(){window.print();},350);</scr" +
      "ipt></body></html>";
    function fallback() {
      proporPrintFallback(fullHtml);
      try {
        if (typeof showToast === "function")
          showToast("Gerando via impressão (PDF direto indisponível)");
      } catch (_) {}
    }
    try {
      var JsPDF =
        window.jspdf && window.jspdf.jsPDF ? window.jspdf.jsPDF : null;
      var launched = false;
      function go(h2c) {
        if (launched) return;
        launched = true;
        var cont = null;
        try {
          if (!JsPDF || !h2c) {
            fallback();
            return;
          }
          cont = document.createElement("div");
          cont.style.cssText =
            "position:fixed;left:-10000px;top:0;width:794px;background:#fff;padding:0;z-index:-1";
          cont.innerHTML = innerHTML;
          document.body.appendChild(cont);
          setTimeout(function () {
            try {
              h2c(cont, {
                scale: 2,
                backgroundColor: "#fff",
                useCORS: true,
                logging: false,
                windowWidth: 794,
                width: 794,
              })
                .then(function (canvas) {
                  try {
                    var doc = new JsPDF({ unit: "pt", format: "a4" });
                    var pw = doc.internal.pageSize.getWidth(),
                      ph = doc.internal.pageSize.getHeight();
                    var imgW = pw,
                      imgH = (canvas.height * imgW) / canvas.width;
                    var img = canvas.toDataURL("image/png");
                    if (imgH <= ph) {
                      doc.addImage(img, "PNG", 0, 0, imgW, imgH);
                    } else {
                      var pos = 0,
                        remaining = imgH;
                      doc.addImage(img, "PNG", 0, pos, imgW, imgH);
                      remaining -= ph;
                      while (remaining > 0.5) {
                        pos -= ph;
                        doc.addPage();
                        doc.addImage(img, "PNG", 0, pos, imgW, imgH);
                        remaining -= ph;
                      }
                    }
                    doc.save(filename);
                  } catch (e) {
                    fallback();
                  } finally {
                    try {
                      document.body.removeChild(cont);
                    } catch (_) {}
                  }
                })
                .catch(function () {
                  try {
                    document.body.removeChild(cont);
                  } catch (_) {}
                  fallback();
                });
            } catch (e) {
              try {
                document.body.removeChild(cont);
              } catch (_) {}
              fallback();
            }
          }, 60);
        } catch (e) {
          try {
            if (cont) document.body.removeChild(cont);
          } catch (_) {}
          fallback();
        }
      }
      if (typeof ensureHtml2Canvas === "function") {
        ensureHtml2Canvas(function (h2c) {
          go(h2c || window.html2canvas);
        });
      } else {
        go(window.html2canvas);
      }
    } catch (e) {
      fallback();
    }
  }
  function prEnsureH2C(cb) {
    if (window.html2canvas) {
      cb(window.html2canvas);
      return;
    }
    if (window.__prH2CQ) {
      window.__prH2CQ.push(cb);
      return;
    }
    window.__prH2CQ = [cb];
    var sc = document.createElement("script");
    sc.src = "./vendor/html2canvas-1.4.1.min.js";
    sc.onload = function () {
      var q = window.__prH2CQ || [];
      window.__prH2CQ = null;
      q.forEach(function (fn) {
        try {
          fn(window.html2canvas);
        } catch (_) {}
      });
    };
    sc.onerror = function () {
      var q = window.__prH2CQ || [];
      window.__prH2CQ = null;
      q.forEach(function (fn) {
        try {
          fn(null);
        } catch (_) {}
      });
    };
    document.head.appendChild(sc);
  }
  function prShowCanvas(canvas, filename, title, innerHTML) {
    var old = document.getElementById("prPngModal");
    if (old) {
      try {
        old.remove();
      } catch (_) {}
    }
    var m = document.createElement("div");
    m.id = "prPngModal";
    m.style.cssText =
      "position:fixed;inset:0;z-index:5000;background:rgba(5,8,31,.85);display:flex;align-items:center;justify-content:center;padding:22px;";
    var box = document.createElement("div");
    box.style.cssText =
      "background:#0B1033;border:1px solid rgba(120,130,210,.3);border-radius:16px;padding:14px;max-width:94vw;max-height:94vh;display:flex;flex-direction:column;gap:11px;";
    var head = document.createElement("div");
    head.style.cssText =
      "display:flex;align-items:center;justify-content:space-between;gap:14px;color:#fff;font-family:Sora,sans-serif;font-weight:800;font-size:15px;";
    var t = document.createElement("span");
    t.textContent = title || "Documento";
    head.appendChild(t);
    var btns = document.createElement("div");
    btns.style.cssText = "display:flex;gap:8px;flex-wrap:wrap;";
    function mkb(txt, primary) {
      var b = document.createElement("button");
      b.textContent = txt;
      b.style.cssText =
        "font-family:inherit;font-weight:700;font-size:13px;border-radius:9px;padding:10px 14px;cursor:pointer;" +
        (primary
          ? "background:#F26522;border:none;color:#fff;"
          : "background:transparent;border:1px solid rgba(120,130,210,.42);color:#cfd4ef;");
      return b;
    }
    var bCopy = mkb("Copiar imagem", true),
      bPdf = mkb("Baixar PDF", false),
      bDl = mkb("Baixar PNG", false),
      bX = mkb("Fechar", false);
    btns.appendChild(bCopy);
    btns.appendChild(bPdf);
    btns.appendChild(bDl);
    btns.appendChild(bX);
    head.appendChild(btns);
    var scroll = document.createElement("div");
    scroll.style.cssText = "overflow:auto;border-radius:10px;background:#fff;";
    canvas.style.cssText = "display:block;max-width:100%;height:auto;";
    scroll.appendChild(canvas);
    box.appendChild(head);
    box.appendChild(scroll);
    m.appendChild(box);
    document.body.appendChild(m);
    function closeM() {
      try {
        m.remove();
      } catch (_) {}
    }
    bX.onclick = closeM;
    m.onclick = function (e) {
      if (e.target === m) closeM();
    };
    bPdf.onclick = function () {
      try {
        proporMakePDF(innerHTML, (filename || "proposta") + ".pdf", {
          title: title,
        });
      } catch (_) {}
    };
    bDl.onclick = function () {
      try {
        var a = document.createElement("a");
        a.download = (filename || "proposta") + ".png";
        a.href = canvas.toDataURL("image/png");
        a.click();
      } catch (_) {}
    };
    bCopy.onclick = function () {
      try {
        canvas.toBlob(function (blob) {
          if (blob && navigator.clipboard && window.ClipboardItem) {
            navigator.clipboard
              .write([new ClipboardItem({ "image/png": blob })])
              .then(function () {
                bCopy.textContent = "Copiado!";
                setTimeout(function () {
                  bCopy.textContent = "Copiar imagem";
                }, 1600);
              })
              .catch(function () {
                bCopy.textContent = "Use Baixar PNG";
                setTimeout(function () {
                  bCopy.textContent = "Copiar imagem";
                }, 2200);
              });
          } else {
            bCopy.textContent = "Use Baixar PNG";
            setTimeout(function () {
              bCopy.textContent = "Copiar imagem";
            }, 2200);
          }
        }, "image/png");
      } catch (_) {}
    };
  }
  function proporPreviewPNG(innerHTML, filename, opts) {
    opts = opts || {};
    function fallbackP() {
      proporPrintFallback(
        '<!doctype html><html><head><meta charset="utf-8"><title>' +
          (opts.title || "Documento") +
          '</title></head><body style="margin:0;background:#fff">' +
          innerHTML +
          "</body></html>",
      );
    }
    var launched = false;
    function goP(h2c) {
      if (launched) return;
      launched = true;
      if (!h2c) {
        fallbackP();
        return;
      }
      var cont = null;
      try {
        cont = document.createElement("div");
        cont.style.cssText =
          "position:fixed;left:-10000px;top:0;width:794px;background:#fff;z-index:-1";
        cont.innerHTML = innerHTML;
        document.body.appendChild(cont);
        setTimeout(function () {
          try {
            h2c(cont, {
              scale: 2,
              backgroundColor: "#fff",
              useCORS: true,
              logging: false,
              windowWidth: 794,
              width: 794,
            })
              .then(function (canvas) {
                try {
                  document.body.removeChild(cont);
                } catch (_) {}
                prShowCanvas(canvas, filename, opts.title, innerHTML);
              })
              .catch(function () {
                try {
                  document.body.removeChild(cont);
                } catch (_) {}
                fallbackP();
              });
          } catch (e) {
            try {
              document.body.removeChild(cont);
            } catch (_) {}
            fallbackP();
          }
        }, 60);
      } catch (e) {
        try {
          if (cont) document.body.removeChild(cont);
        } catch (_) {}
        fallbackP();
      }
    }
    prEnsureH2C(function (h2c) {
      goP(h2c || window.html2canvas);
    });
  }
  /* PROPOSTA */
  function genPng() {
    try {
      var m = metrics();
      var inner =
        prShellOpen("Proposta de Carteira", prMeta()) +
        '<div class="sect-t first">Resumo financeiro</div>' +
        prCardsHTML(m) +
        prSaiSection(m) +
        prMantemSection(m) +
        prEntraSection(m) +
        prAllocSection() +
        prShellClose(
          "Material de apoio comercial · carteira proposta = ativos mantidos + ativos que entram. Ativos de carrego até o vencimento (CDB, LCI, LCA, CRI, CRA, debêntures) permanecem na carteira. Não constitui recomendação ou oferta; sujeito a suitability e às condições de cada produto.",
        );
      proporPreviewPNG(inner, "Proposta_" + prSan(PR.cliente), {
        title: "Proposta de carteira",
      });
    } catch (e) {
      try {
        if (typeof showToast === "function")
          showToast("Não foi possível gerar a proposta.");
      } catch (_) {}
    }
  }
  /* PLANO DE AJUSTE */
  function genPlano() {
    try {
      var m = metrics(),
        P = m.patrim;
      var red = [],
        up = [],
        keep = [];
      PR.board.sai.forEach(function (i) {
        var o = Number(i.pctOrig) || 0;
        red.push({
          nome: i.nome,
          cat: i.cat,
          sub:
            "Sair da posição · " +
            fp(o) +
            "% → 0%" +
            (i.travado ? " · carrego até o vencimento" : ""),
          d: (-P * o) / 100,
        });
      });
      PR.board.mantem.forEach(function (i) {
        var o = Number(i.pctOrig) || 0,
          p = Number(i.pct) || 0,
          d = (P * (p - o)) / 100;
        if (d > 1)
          up.push({
            nome: i.nome,
            cat: i.cat,
            sub: "Aumentar · " + fp(o) + "% → " + fp(p) + "%",
            d: d,
          });
        else if (d < -1)
          red.push({
            nome: i.nome,
            cat: i.cat,
            sub: "Reduzir · " + fp(o) + "% → " + fp(p) + "%",
            d: d,
          });
        else
          keep.push({
            nome: i.nome,
            cat: i.cat,
            sub:
              "Manter · " +
              fp(p) +
              "%" +
              (i.travado ? " · carrego até o vencimento" : ""),
            d: 0,
          });
      });
      PR.board.entra.forEach(function (i) {
        var p = Number(i.pct) || 0;
        up.push({
          nome: i.nome,
          cat: i.cat,
          sub: "Entrar · 0% → " + fp(p) + "%",
          d: (P * p) / 100,
        });
      });
      function sec(title, color, arr) {
        var body = arr.length
          ? arr
              .map(function (it) {
                var amt =
                  Math.abs(it.d) < 1
                    ? "—"
                    : (it.d >= 0 ? "+" : "-") + "R$ " + fmt(Math.abs(it.d));
                var col = it.d >= 0 ? "#28aa6e" : "#d64a4a";
                return (
                  '<div class="prow"><div><div class="nm"><span class="dot" style="background:' +
                  (COLORS[it.cat] || "#888") +
                  '"></span>' +
                  esc2(it.nome || "-") +
                  '</div><div class="cl">' +
                  esc2(prClassLabel(it.cat)) +
                  " · " +
                  esc2(it.sub) +
                  '</div></div><div class="amt" style="color:' +
                  col +
                  '">' +
                  amt +
                  "</div></div>"
                );
              })
              .join("")
          : '<div class="pempty">Nenhum ativo.</div>';
        return (
          '<div class="psec"><div class="psh" style="border-color:' +
          color +
          ";color:" +
          color +
          '">' +
          title +
          "</div>" +
          body +
          "</div>"
        );
      }
      var extraCSS =
        "<style>.ppdoc .psec{margin-bottom:18px}.ppdoc .psh{font-size:12.5px;font-weight:800;border-bottom:2px solid;padding-bottom:5px;margin-bottom:9px}.ppdoc .prow{display:flex;justify-content:space-between;align-items:flex-start;padding:7px 0;border-bottom:1px solid #eef0f6}.ppdoc .prow .nm{font-size:11.5px;font-weight:700}.ppdoc .prow .cl{font-size:9.5px;color:#828aaa;margin-top:2px;font-weight:400}.ppdoc .prow .amt{font-size:11.5px;white-space:nowrap;padding-left:12px;text-align:right;font-weight:700}.ppdoc .pempty{color:#828aaa;font-size:11px;padding:6px 0}</style>";
      var inner =
        prShellOpen("Plano de Ajuste de Carteira", prMeta()) +
        extraCSS +
        '<div class="cards"><div class="cd"><div class="k">Patrimônio</div><div class="v">R$ ' +
        fmt(P) +
        "</div></div>" +
        '<div class="cd"><div class="k">A vender</div><div class="v" style="color:#d64a4a">R$ ' +
        fmt(m.vender) +
        "</div></div>" +
        '<div class="cd"><div class="k">A comprar</div><div class="v" style="color:#28aa6e">R$ ' +
        fmt(m.comprar) +
        "</div></div>" +
        '<div class="cd"><div class="k">Giro</div><div class="v" style="color:#F26522">' +
        fp(m.giro) +
        "%</div></div></div>" +
        '<div class="sect-t first">Movimentações por ativo</div>' +
        sec("REDUZIR / SAIR", "#d64a4a", red) +
        sec("AUMENTAR / ENTRAR", "#28aa6e", up) +
        sec("MANTER", "#828aaa", keep) +
        prShellClose(
          "Material de apoio interno · não constitui recomendação ou oferta · gerado pelo Hub do Assessor.",
        );
      proporMakePDF(inner, "Plano_de_Ajuste_" + prSan(PR.cliente) + ".pdf", {
        title: "Plano de Ajuste de Carteira",
      });
    } catch (e) {
      try {
        if (typeof showToast === "function")
          showToast("Não foi possível gerar o plano.");
      } catch (_) {}
    }
  }
  /* PROJECAO DA CARTEIRA PROPOSTA (MANTEM + ENTRA) */
  function genProj() {
    try {
      var CDI = 14.25,
        IPCA = 4.5,
        MERC = 12;
      function retAA(a) {
        var v = Number(a.retVal) || 0;
        if (a.retCat === "pos") return (CDI * v) / 100;
        if (a.retCat === "pre") return v;
        if (a.retCat === "inflacao") return IPCA + v;
        return MERC;
      }
      var items = propostaItems(),
        totPct = 0;
      items.forEach(function (a) {
        totPct += Number(a.pct) || 0;
      });
      var r = 0;
      if (totPct > 0) {
        items.forEach(function (a) {
          r += ((Number(a.pct) || 0) / totPct) * retAA(a);
        });
      }
      var pat = Number(PR.patrim) || 0,
        years = (function () {
          try {
            return S && Number(S.projAnos) > 0
              ? Math.max(1, Math.min(60, Math.round(Number(S.projAnos))))
              : 10;
          } catch (e) {
            return 10;
          }
        })(),
        vals = [],
        y;
      for (y = 0; y <= years; y++) {
        vals.push(pat * Math.pow(1 + r / 100, y));
      }
      var maxV = vals[years] || 1;
      if (!isFinite(maxV) || maxV <= 0) maxV = 1;
      var _stepB = years <= 12 ? 1 : Math.ceil(years / 10);
      var _byrs = [];
      for (y = 0; y <= years; y += _stepB) _byrs.push(y);
      if (_byrs[_byrs.length - 1] !== years) _byrs.push(years);
      var bars = "";
      _byrs.forEach(function (yy) {
        var hh = Math.max(4, Math.round((vals[yy] / maxV) * 150));
        bars +=
          '<div class="bcol"><div class="bval">R$ ' +
          fmt(vals[yy]) +
          '</div><div class="bar" style="height:' +
          hh +
          'px"></div><div class="byr">' +
          (yy === 0 ? "Hoje" : "Ano " + yy) +
          "</div></div>";
      });
      var trows = "";
      _byrs
        .filter(function (yy) {
          return yy > 0;
        })
        .forEach(function (yy) {
          trows +=
            '<tr><td class="cl">Ano ' +
            yy +
            '</td><td style="text-align:right">R$ ' +
            fmt(vals[yy]) +
            '</td><td style="text-align:right;color:#0a7a45">+R$ ' +
            fmt(vals[yy] - pat) +
            "</td></tr>";
        });
      var extraCSS =
        "<style>.ppdoc .chart{display:flex;align-items:flex-end;gap:16px;height:200px;border-bottom:2px solid #e3e7f0;padding:10px 6px 0;margin:4px 0 6px}.ppdoc .bcol{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%}.ppdoc .bar{width:64%;background:linear-gradient(180deg,#FF8A3D,#F26522);border-radius:6px 6px 0 0}.ppdoc .bval{font-size:10px;font-weight:700;margin-bottom:5px;white-space:nowrap}.ppdoc .byr{font-size:10.5px;color:#5b6485;font-weight:700;margin-top:6px}</style>";
      var inner =
        prShellOpen("Projeção da Carteira", prMeta()) +
        extraCSS +
        '<div class="cards"><div class="cd"><div class="k">Patrimônio inicial</div><div class="v">R$ ' +
        fmt(pat) +
        "</div></div>" +
        '<div class="cd"><div class="k">Retorno estimado</div><div class="v" style="color:#0a7a45">' +
        fp(r) +
        "% a.a.</div></div>" +
        '<div class="cd"><div class="k">Projeção em ' +
        years +
        ' anos</div><div class="v">R$ ' +
        fmt(vals[years]) +
        "</div></div></div>" +
        '<div class="sect-t">Evolução projetada</div><div class="chart">' +
        bars +
        "</div>" +
        "<table><tr><th>Período</th><th>Valor projetado</th><th>Ganho acumulado</th></tr>" +
        trows +
        "</table>" +
        prAllocSection() +
        prShellClose(
          "Projeção ilustrativa (juros compostos) da carteira proposta (mantidos + entrando) — premissas: CDI " +
            fp(CDI) +
            "%, IPCA " +
            fp(IPCA) +
            "%, mercado " +
            fp(MERC) +
            "% a.a. Não considera impostos, custos, aportes nem volatilidade. Rentabilidade estimada não garante resultados futuros. Material de apoio comercial — não constitui recomendação ou oferta.",
        );
      proporMakePDF(inner, "Projecao_" + prSan(PR.cliente) + ".pdf", {
        title: "Projeção da carteira",
      });
    } catch (e) {
      try {
        if (typeof showToast === "function")
          showToast("Não foi possível gerar a projeção.");
      } catch (_) {}
    }
  }

  /* ===================== ABRIR / FECHAR / BIND ===================== */
  function open() {
    var m = el("proporModal");
    m.classList.add("on");
    var _nv = document.querySelector(".g-nav");
    if (_nv) {
      m.style.top = _nv.offsetHeight + "px";
      m.style.height = "auto";
    }
    document.body.style.overflow = "hidden";
    if (
      !PR.board.mantem.length &&
      !PR.board.sai.length &&
      !PR.board.entra.length
    ) {
      seedSim();
    }
    render();
  }
  function close() {
    el("proporModal").classList.remove("on");
    document.body.style.overflow = "";
  }
  function bind() {
    var b = el("btnPropor");
    if (!b || b.__b) return;
    b.__b = 1;
    b.onclick = function () {
      try {
        var rv = document.getElementById("construtorRv");
        if (
          rv &&
          rv.offsetParent !== null &&
          typeof window.__rvProporProposal === "function"
        ) {
          window.__rvProporProposal();
          return;
        }
      } catch (_) {}
      try {
        if (
          !window.RICO_TEMPLATES &&
          window._toolInit &&
          window._toolInit["construtor"]
        )
          window._toolInit["construtor"]();
      } catch (_) {}
      open();
    };
    Array.prototype.forEach.call(
      document.querySelectorAll(".g-nav .g-tab, .g-nav .g-logo"),
      function (t) {
        if (!t.__pmClose) {
          t.__pmClose = 1;
          t.addEventListener("click", close);
        }
      },
    );
    el("pmClose").onclick = close;
    var _cl = el("pmClear");
    if (_cl) _cl.onclick = clearAll;
    el("pmSrcSim").onclick = function () {
      setActive("pmSrcSim");
      seedSim();
    };
    el("pmSrcXls").onclick = function () {
      setActive("pmSrcXls");
      el("pmFile").click();
    };
    el("pmFile").onchange = function () {
      if (el("pmFile").files[0]) seedXls(el("pmFile").files[0]);
    };
    Array.prototype.forEach.call(
      document.querySelectorAll("#proporModal [data-prof]"),
      function (x) {
        x.onclick = function () {
          applyProfile(x.getAttribute("data-prof"));
        };
      },
    );
    var _al = el("pmAddLib");
    if (_al)
      _al.onclick = function () {
        PR.picker = !PR.picker;
        render();
      };
    el("pmCli").oninput = function () {
      PR.cliente = el("pmCli").value;
    };
    el("pmPat").onchange = function () {
      PR.patrim = pn(el("pmPat").value);
      render();
    };
    el("pmPng").onclick = genPng;
    el("pmPlano").onclick = genPlano;
    var _pj = el("pmProj");
    if (_pj) _pj.onclick = genProj;
    var _ip = el("pmImpProp");
    if (_ip) _ip.onclick = importSimProposta;
    window.__PR_IMPORT_SIM_PROPOSTA = importSimProposta;
  }
  if (document.readyState === "loading") {
    queueMicrotask(bind);
  } else {
    bind();
  }
})();
