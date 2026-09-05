// Migrated from Hub v1. Review domain assumptions separately from interface changes.

(function () {
  function esc(t) {
    return ("" + (t == null ? "" : t))
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function fmtPct(n) {
    var v = Math.round(n * 10) / 10;
    return (Number.isInteger(v) ? v.toFixed(0) : v.toFixed(1)).replace(
      ".",
      ",",
    );
  }
  function fmtMult(n) {
    return n.toFixed(2).replace(".", ",");
  }
  function fmtTaxa(n) {
    return n.toFixed(2).replace(".", ",");
  }
  function r1(n) {
    return Math.round(n * 10) / 10;
  }
  function _qnum(v, def) {
    if (typeof v === "number") return isNaN(v) ? def : v;
    var s = String(v == null ? "" : v)
      .trim()
      .replace(",", ".");
    var n = parseFloat(s);
    return isNaN(n) ? def : n;
  }

  function protCen(protegeAte, teto, tetoBarreira) {
    var cen = [];
    if (protegeAte <= -100) {
      cen = [
        [-30, 0],
        [-15, 0],
        [-5, 0],
        [0, 0],
        [
          Math.round((teto / 2) * 100) / 100,
          Math.round((teto / 2) * 100) / 100,
        ],
        [teto, teto],
        [teto + 0.01, tetoBarreira],
        [teto + 10, tetoBarreira],
      ];
    } else {
      var pp = Math.abs(protegeAte);
      cen = [
        [-(pp + 20), protegeAte],
        [-(pp + 10), Math.round((protegeAte / 2) * 10) / 10],
        [protegeAte, 0],
        [Math.round(protegeAte / 2), 0],
        [0, 0],
        [
          Math.round((teto / 2) * 100) / 100,
          Math.round((teto / 2) * 100) / 100,
        ],
        [teto, teto],
        [teto + 0.01, tetoBarreira],
        [teto + 10, tetoBarreira],
      ];
    }
    return cen;
  }
  function cupomCen(taxa, barreira) {
    var b = barreira,
      mid = Math.round(b / 2);
    if (mid === b) mid = b + 1;
    var up = Math.max(Math.round(Math.abs(b)), Math.round(taxa)) + 15;
    return [
      [b - 15, b - 15],
      [b, b],
      [mid, taxa],
      [0, taxa],
      [up, taxa],
    ];
  }
  function buildQuanto(o) {
    var isP1 = o.payoff === 1;
    // taxa/mult podem vir como string com virgula (op custom) -> coage p/ numero.
    var mult = _qnum(o.mult, 1),
      taxa = _qnum(o.taxa, 0);
    var nome =
      o.ativo +
      " · " +
      (isP1 ? fmtMult(mult) + "x" : fmtTaxa(taxa) + "%") +
      " · " +
      o.fixing;
    var tipo = isP1
      ? "Capital protegido · alta ilimitada"
      : "Taxa fixa ou alta ilimitada";
    var cen;
    if (isP1) {
      cen = [
        [-30, 0],
        [-10, 0],
        [0, 0],
        [20, r1(20 * mult)],
        [40, r1(40 * mult)],
      ];
    } else {
      var t = taxa,
        tr = Math.round(t);
      cen = [
        [-25, t],
        [-10, t],
        [0, t],
        [tr + 15, tr + 15],
        [tr + 35, tr + 35],
      ];
    }
    return {
      id: o.id,
      payoff: o.payoff,
      ativo: o.ativo,
      fixing: o.fixing,
      mult: mult,
      taxa: taxa,
      setor: o.setor || "Internacional",
      nome: nome,
      tipo: tipo,
      cen: cen,
      quanto: true,
    };
  }
  function keyScenarios(op) {
    if (op.quanto || op.cupom)
      return op.cen.slice().sort(function (a, b) {
        return a[0] - b[0];
      });
    var pts = op.cen.slice().sort(function (a, b) {
      return a[0] - b[0];
    });
    var lo = pts[0],
      hi = pts[pts.length - 1];
    var zero = pts.filter(function (p) {
      return p[0] === 0;
    })[0];
    if (!zero)
      zero = pts.reduce(function (a, b) {
        return Math.abs(b[0]) < Math.abs(a[0]) ? b : a;
      });
    var edge = pts
      .filter(function (p) {
        return p[1] === 0;
      })
      .reduce(function (a, b) {
        return a == null ? b : b[0] < a[0] ? b : a;
      }, null);
    var cap = pts.reduce(function (a, b) {
      return b[1] > a[1] ? b : a;
    });
    var out = [];
    function push(p) {
      if (
        p &&
        !out.some(function (s) {
          return s[0] === p[0];
        })
      )
        out.push(p);
    }
    push(lo);
    push(edge);
    push(zero);
    push(cap);
    push(hi);
    return out.sort(function (a, b) {
      return a[0] - b[0];
    });
  }
  function payoffAt(op, v) {
    var pa = Number(op.protegeAte),
      teto = Number(op.teto),
      tetoB = Number(op.tetoBarreira);
    var barr = Number(op.barreira) > 100 ? Number(op.barreira) - 100 : teto;
    if (v > barr) return tetoB;
    if (v > teto) return teto;
    if (v >= 0) return v;
    if (v >= pa) return 0;
    return v - pa;
  }
  function payoffSeries(op) {
    var pa = Number(op.protegeAte),
      teto = Number(op.teto);
    var barr =
      Number(op.barreira) > 100 ? Number(op.barreira) - 100 : Math.round(teto);
    var vars = [Math.round(barr + Math.max(10, teto * 0.25)), Math.round(teto)];
    var step = teto <= 22 ? 5 : teto <= 75 ? 10 : teto <= 150 ? 20 : 25;
    for (
      var v = Math.floor((Math.round(teto) - 1) / step) * step;
      v > 0.01;
      v -= step
    ) {
      vars.push(Math.round(v * 10) / 10);
    }
    vars.push(0);
    if (pa > -100) {
      vars.push(Math.round(pa / 2));
      vars.push(pa);
      vars.push(pa - 20);
    } else {
      vars.push(-10);
      vars.push(-25);
      vars.push(-40);
    }
    var seen = {},
      out = [];
    vars.forEach(function (x) {
      var k = Math.round(x * 10) / 10;
      if (!(k in seen)) {
        seen[k] = 1;
        out.push(k);
      }
    });
    out.sort(function (a, b) {
      return b - a;
    });
    return out.map(function (x) {
      return [x, Math.round(payoffAt(op, x) * 100) / 100];
    });
  }
  function isProt(op) {
    return (
      op && op.protegeAte != null && op.teto != null && !op.quanto && !op.cupom
    );
  }
  function payoffTable(op, big) {
    var ativoNome = op.ativo || "o ativo";
    var scen = (isProt(op) ? payoffSeries(op) : keyScenarios(op).slice()).sort(
      function (a, b) {
        return b[0] - a[0];
      },
    );
    function fmtSigned(v) {
      if (v === 0) return "0%";
      return (v > 0 ? "+" : "−") + fmtPct(Math.abs(v)) + "%";
    }
    function valCol(v) {
      return v > 0 ? "#2BD9A6" : v < 0 ? "#FF5566" : "#F5B63E";
    }
    function dot(v) {
      return (
        '<span class="cen-dot" style="background:' + valCol(v) + '"></span>'
      );
    }
    var h =
      '<div class="cen-table' +
      (big ? " big" : "") +
      '"><div class="cen-head"><span>Variação % de ' +
      esc(ativoNome) +
      "</span><span>Variação % da estratégia</span></div>";
    scen.forEach(function (pr, i) {
      h +=
        '<div class="cen-row' +
        (i % 2 ? " alt" : "") +
        '">' +
        '<span class="cen-cell">' +
        dot(pr[0]) +
        '<b style="color:' +
        valCol(pr[0]) +
        '">' +
        fmtSigned(pr[0]) +
        "</b></span>" +
        '<span class="cen-cell">' +
        dot(pr[1]) +
        '<b style="color:' +
        valCol(pr[1]) +
        '">' +
        fmtSigned(pr[1]) +
        "</b></span></div>";
    });
    return h + "</div>";
  }
  window.__opPayoffHTML = function (op) {
    if (!op || !op.cen) return "";
    return (
      '<div class="opcat-payoff" style="margin-top:4px">' +
      payoffTable(op, true) +
      '</div><div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:8px;font-size:11px;color:#cfd4ef"><span style="display:inline-flex;align-items:center;gap:6px"><span style="width:10px;height:10px;border-radius:3px;background:#2BD9A6"></span>Ganho</span><span style="display:inline-flex;align-items:center;gap:6px"><span style="width:10px;height:10px;border-radius:3px;background:#F5B63E"></span>Estável</span><span style="display:inline-flex;align-items:center;gap:6px"><span style="width:10px;height:10px;border-radius:3px;background:#FF5566"></span>Perda</span></div>'
    );
  };
  window.__BOVA_OP = {
    ativo: "BOVA11",
    nome: "BOVA11 Protegida · Collar UI",
    tipo: "Proteção total",
    setor: "Índice / ETF",
    protegeAte: -100,
    teto: 28,
    tetoBarreira: 15,
    barreira: 128,
    cen: protCen(-100, 28, 15),
  };
  function opDetalhe(op) {
    var prot =
      op.protegeAte <= -100
        ? "Capital protegido (0% de perda no vencimento)"
        : "Proteção parcial até " + fmtPct(op.protegeAte) + "% de queda";
    return (
      prot +
      " · participa 1:1 na alta até " +
      fmtPct(op.teto) +
      "% (ou " +
      fmtPct(op.tetoBarreira) +
      "% se a barreira de " +
      fmtPct(op.barreira) +
      "% for atingida)"
    );
  }
  function opDetalheQuanto(op) {
    if (op.payoff === 1)
      return (
        "Capital protegido — devolve 100% do capital se o " +
        op.ativo +
        " cair. Na alta, paga a variação × " +
        fmtMult(op.mult) +
        " (sem teto). Quanto: moeda local, sem risco cambial. Prazo de " +
        op.fixing +
        "."
      );
    return (
      "Recebe o maior entre a taxa fixa de " +
      fmtTaxa(op.taxa) +
      "% e a alta do " +
      op.ativo +
      " (1:1, ilimitada). Quanto: moeda local, sem risco cambial. Prazo de " +
      op.fixing +
      "."
    );
  }
  function cupomDetalhe(op) {
    return (
      "SmartCupom · cupom pré-fixado de " +
      fmtPct(op.taxa) +
      "% · barreira de desarme " +
      fmtPct(op.barreira) +
      "%" +
      (op.cdi != null ? " · ≈ " + fmtPct(op.cdi) + "% do CDI" : "")
    );
  }

  var OPERACOES = [
    {
      id: "op-petr4-fence",
      ativo: "PETR4",
      nome: "PETR4 · Fence 35%",
      setor: "Petróleo & Gás",
      tipo: "Proteção parcial",
      protegeAte: -20,
      teto: 34.99,
      tetoBarreira: 15.7,
      barreira: 135,
      cen: [
        [-40, -20],
        [-30, -10],
        [-25, -5],
        [-20, 0],
        [-10, 0],
        [0, 0],
        [7.85, 7.85],
        [15.7, 15.7],
        [34.99, 34.99],
        [35, 15.7],
        [45, 15.7],
      ],
    },
    {
      id: "op-eqtl3-60",
      ativo: "EQTL3",
      nome: "EQTL3 · Fence 60%",
      setor: "Energia Elétrica",
      tipo: "Proteção parcial",
      protegeAte: -20,
      teto: 59.99,
      tetoBarreira: 35,
      barreira: 160,
      cen: [
        [-40, -20],
        [-30, -10],
        [-25, -5],
        [-20, 0],
        [-10, 0],
        [0, 0],
        [17.5, 17.5],
        [35, 35],
        [59.99, 59.99],
        [60, 35],
        [70, 35],
      ],
    },
    {
      id: "op-smal11-cp",
      ativo: "SMAL11",
      nome: "SMAL11 · Collar UI",
      setor: "Índice / ETF",
      tipo: "Proteção total",
      protegeAte: -100,
      teto: 114.99,
      tetoBarreira: 56,
      barreira: 215,
      cen: [
        [-30, 0],
        [-25, 0],
        [-10, 0],
        [-5, 0],
        [0, 0],
        [28.75, 28.75],
        [57.5, 57.5],
        [114.99, 114.99],
        [115, 56],
        [125, 56],
      ],
    },
    {
      id: "op-nasd11-cp",
      ativo: "NASD11",
      nome: "NASD11 · Collar UI",
      setor: "Internacional",
      tipo: "Proteção total",
      protegeAte: -100,
      teto: 49.99,
      tetoBarreira: 35,
      barreira: 150,
      cen: [
        [-30, 0],
        [-25, 0],
        [-10, 0],
        [-5, 0],
        [0, 0],
        [12.5, 12.5],
        [25, 25],
        [49.99, 49.99],
        [50, 35],
        [60, 35],
      ],
    },
    {
      id: "op-bpac11-80",
      ativo: "BPAC11",
      nome: "BPAC11 · Fence 80%",
      setor: "Bancos",
      tipo: "Proteção parcial",
      protegeAte: -25,
      teto: 79.99,
      tetoBarreira: 35,
      barreira: 180,
      cen: [
        [-45, -20],
        [-35, -10],
        [-30, -5],
        [-25, 0],
        [-12.5, 0],
        [0, 0],
        [17.5, 17.5],
        [35, 35],
        [79.98, 79.98],
        [80, 35],
        [90, 35],
      ],
    },
    {
      id: "op-wege3-58",
      ativo: "WEGE3",
      nome: "WEGE3 · Fence 58%",
      setor: "Industrial",
      tipo: "Proteção parcial",
      protegeAte: -22,
      teto: 57.99,
      tetoBarreira: 35,
      barreira: 158,
      cen: [
        [-42, -20],
        [-32, -10],
        [-27, -5],
        [-22, 0],
        [-11, 0],
        [0, 0],
        [17.5, 17.5],
        [35, 35],
        [57.99, 57.99],
        [58, 35],
        [68, 35],
      ],
    },
    {
      id: "op-sapr11-62",
      ativo: "SAPR11",
      nome: "SAPR11 · Fence 62%",
      setor: "Saneamento",
      tipo: "Proteção parcial",
      protegeAte: -20,
      teto: 61.99,
      tetoBarreira: 35,
      barreira: 162,
      cen: [
        [-40, -20],
        [-30, -10],
        [-25, -5],
        [-20, 0],
        [-10, 0],
        [0, 0],
        [17.5, 17.5],
        [35, 35],
        [61.99, 61.99],
        [62, 35],
        [72, 35],
      ],
    },
    {
      id: "op-axia3-20",
      ativo: "AXIA3",
      nome: "AXIA3 · Fence 20%",
      setor: "Energia Elétrica",
      tipo: "Proteção parcial",
      protegeAte: -15,
      teto: 19.99,
      tetoBarreira: 6.5,
      barreira: 120,
      cen: [
        [-35, -20],
        [-25, -10],
        [-20, -5],
        [-15, 0],
        [-7.5, 0],
        [0, 0],
        [3.25, 3.25],
        [6.5, 6.5],
        [19.98, 19.98],
        [20, 6.5],
        [30, 6.5],
      ],
    },
    {
      id: "op-eqtl3-53",
      ativo: "EQTL3",
      nome: "EQTL3 · Fence 53%",
      setor: "Energia Elétrica",
      tipo: "Proteção parcial",
      protegeAte: -20,
      teto: 52.99,
      tetoBarreira: 35,
      barreira: 153,
      cen: [
        [-40, -20],
        [-30, -10],
        [-25, -5],
        [-20, 0],
        [-10, 0],
        [0, 0],
        [17.5, 17.5],
        [35, 35],
        [52.99, 52.99],
        [53, 35],
        [63, 35],
      ],
    },
    {
      id: "op-smal11-80",
      ativo: "SMAL11",
      nome: "SMAL11 · Fence 80%",
      setor: "Índice / ETF",
      tipo: "Proteção parcial",
      protegeAte: -25,
      teto: 79.99,
      tetoBarreira: 35,
      barreira: 180,
      cen: [
        [-45, -20],
        [-35, -10],
        [-30, -5],
        [-25, 0],
        [-12.5, 0],
        [0, 0],
        [17.5, 17.5],
        [35, 35],
        [79.98, 79.98],
        [80, 35],
        [90, 35],
      ],
    },
    {
      id: "op-itub4-35",
      ativo: "ITUB4",
      nome: "ITUB4 · Fence 35%",
      setor: "Bancos",
      tipo: "Proteção parcial",
      protegeAte: -15,
      teto: 34.99,
      tetoBarreira: 16.2,
      barreira: 135,
      cen: [
        [-35, -20],
        [-25, -10],
        [-20, -5],
        [-15, 0],
        [-7.5, 0],
        [0, 0],
        [8.1, 8.1],
        [16.2, 16.2],
        [34.99, 34.99],
        [35, 16.2],
        [45, 16.2],
      ],
    },
  ];
  var RUBI_RAW = [
    {
      id: "r-bbas3",
      ativo: "BBAS3",
      setor: "Bancos",
      taxa: 21.5,
      barreira: -20,
      cdi: 147.71,
    },
    {
      id: "r-petr4",
      ativo: "PETR4",
      setor: "Petróleo & Gás",
      taxa: 18.0,
      barreira: -25,
      cdi: null,
    },
    {
      id: "r-vale3",
      ativo: "VALE3",
      setor: "Mineração & Siderurgia",
      taxa: 16.5,
      barreira: -20,
      cdi: null,
    },
    {
      id: "r-itub4",
      ativo: "ITUB4",
      setor: "Bancos",
      taxa: 15.0,
      barreira: -15,
      cdi: null,
    },
    {
      id: "r-bpac11",
      ativo: "BPAC11",
      setor: "Bancos",
      taxa: 19.0,
      barreira: -20,
      cdi: null,
    },
    {
      id: "r-sbsp3",
      ativo: "SBSP3",
      setor: "Saneamento",
      taxa: 14.0,
      barreira: -15,
      cdi: null,
    },
  ];
  var CUPOM = RUBI_RAW.map(function (r) {
    return {
      id: r.id,
      ativo: r.ativo,
      setor: r.setor,
      taxa: r.taxa,
      barreira: r.barreira,
      cdi: r.cdi,
      nome: r.ativo + " · SmartCupom " + fmtTaxa(r.taxa) + "%",
      tipo: "Cupom pré-fixado",
      cupom: true,
      cen: cupomCen(r.taxa, r.barreira),
    };
  });
  var QUANTO = [
    { id: "q-sp-1", payoff: 1, ativo: "S&P 500", fixing: "1 ano", mult: 1.04 },
    { id: "q-sp-2", payoff: 1, ativo: "S&P 500", fixing: "2 anos", mult: 1.2 },
    { id: "q-sp-3", payoff: 1, ativo: "S&P 500", fixing: "3 anos", mult: 1.41 },
    { id: "q-nq-1", payoff: 1, ativo: "Nasdaq", fixing: "1 ano", mult: 1.0 },
    { id: "q-nq-2", payoff: 1, ativo: "Nasdaq", fixing: "2 anos", mult: 1.0 },
    { id: "q-nq-3", payoff: 1, ativo: "Nasdaq", fixing: "3 anos", mult: 1.17 },
    { id: "q-sp-fx1", payoff: 2, ativo: "S&P 500", fixing: "1 ano", taxa: 6.3 },
    {
      id: "q-sp-fx2",
      payoff: 2,
      ativo: "S&P 500",
      fixing: "2 anos",
      taxa: 11.97,
    },
    {
      id: "q-sp-fx3",
      payoff: 2,
      ativo: "S&P 500",
      fixing: "3 anos",
      taxa: 26.44,
    },
    { id: "q-nq-fx2", payoff: 2, ativo: "Nasdaq", fixing: "2 anos", taxa: 9.0 },
    {
      id: "q-nq-fx3",
      payoff: 2,
      ativo: "Nasdaq",
      fixing: "3 anos",
      taxa: 14.33,
    },
  ].map(buildQuanto);

  /* Exporta o catálogo RV e a tabela de payoff para reuso no Propor Carteira */
  try {
    window.__rvSyncCatalog = function () {
      var cust = [];
      try {
        cust =
          JSON.parse(window.hubStorage.getItem("hubRvCustomOps") || "[]") || [];
      } catch (_) {
        cust = [];
      }
      var cProt = cust.filter(function (x) {
        return (x.kind || "protecao") === "protecao";
      });
      var cCup = cust.filter(function (x) {
        return x.kind === "cupom";
      });
      var cQnt = cust.filter(function (x) {
        return x.kind === "quanto";
      });
      var hid = [];
      try {
        hid =
          JSON.parse(window.hubStorage.getItem("hubRvHiddenOps") || "[]") || [];
      } catch (_) {}
      function _vh(a) {
        return a.filter(function (o) {
          return hid.indexOf(o.id) < 0;
        });
      }
      window.__rvCatalog = {
        ops: _vh(OPERACOES.concat(cProt)),
        cupom: _vh(CUPOM.concat(cCup)),
        quanto: _vh(QUANTO.concat(cQnt)),
        custom: cust,
        opDetalhe: opDetalhe,
        cupomDetalhe: cupomDetalhe,
        opDetalheQuanto: opDetalheQuanto,
      };
    };
    window.__rvSyncCatalog();
    window.__payoffTable = function (op, big) {
      try {
        return payoffTable(op, !!big);
      } catch (e) {
        return "";
      }
    };
  } catch (e) {}

  var customSeq = 0;
  var REG = {};
  var RV_CUSTOM_KEY = "hubRvCustomOps";
  var CUSTOM = [];
  try {
    CUSTOM = JSON.parse(window.hubStorage.getItem(RV_CUSTOM_KEY) || "[]") || [];
  } catch (_) {
    CUSTOM = [];
  }
  CUSTOM.forEach(function (x) {
    var n = parseInt(String(x.id || "").replace("cust", ""), 10);
    if (!isNaN(n) && n > customSeq) customSeq = n;
  });
  function persistRvOps() {
    try {
      window.hubStorage.setItem(RV_CUSTOM_KEY, JSON.stringify(CUSTOM));
    } catch (_) {}
    if (window.__rvSyncCatalog)
      try {
        window.__rvSyncCatalog();
      } catch (_) {}
  }
  var RV_HIDDEN_KEY = "hubRvHiddenOps";
  var HIDDEN = [];
  try {
    HIDDEN = JSON.parse(window.hubStorage.getItem(RV_HIDDEN_KEY) || "[]") || [];
  } catch (_) {
    HIDDEN = [];
  }
  function persistHidden() {
    try {
      window.hubStorage.setItem(RV_HIDDEN_KEY, JSON.stringify(HIDDEN));
    } catch (_) {}
  }
  var currentTab = "todos",
    editingId = null;

  function matches(op, term) {
    if (!term) return true;
    return (
      (
        (op.nome || "") +
        " " +
        (op.ativo || "") +
        " " +
        (op.setor || "") +
        " " +
        (op.tipo || "")
      )
        .toLowerCase()
        .indexOf(term) >= 0
    );
  }

  function card(op, cat) {
    var effCat = cat === "custom" ? op.kind || "protecao" : cat;
    var key = cat + ":" + op.id;
    REG[key] = { op: op, cat: effCat };
    var badge;
    if (effCat === "quanto")
      badge =
        '<span class="ocbadge">' +
        (op.payoff === 1
          ? "Multiplicador " + fmtMult(op.mult) + "x"
          : "Taxa fixa " + fmtTaxa(op.taxa) + "%") +
        "</span>";
    else if (effCat === "cupom")
      badge =
        '<span class="ocbadge cup">Cupom ' +
        fmtPct(op.taxa) +
        "%</span>" +
        (op.cdi != null
          ? ' <span class="ocbadge">≈ ' + fmtPct(op.cdi) + "% CDI</span>"
          : "");
    else
      badge =
        '<span class="ocbadge prot">' + esc(op.tipo || "Proteção") + "</span>";
    var meta;
    if (effCat === "quanto") meta = "Prazo " + esc(op.fixing);
    else meta = esc(op.ativo) + (op.setor ? " · " + esc(op.setor) : "");
    var h =
      '<div class="opcard"><div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start">' +
      '<div><div style="font-weight:800;font-size:14.5px;color:#fff">' +
      esc(op.nome) +
      "</div>" +
      '<div style="font-size:11.5px;color:#9AA2D0;margin-top:2px">' +
      meta +
      "</div>" +
      '<div style="margin-top:6px">' +
      badge +
      "</div></div>" +
      '<button class="minibtn" data-add="' +
      key +
      '">+ Add</button></div>' +
      '<div style="margin-top:9px">' +
      payoffTable(op) +
      "</div>";
    if (op && op.id)
      h +=
        '<div style="display:flex;gap:8px;margin-top:9px"><button class="oc-btn" data-edit="' +
        op.id +
        '">Editar</button><button class="oc-btn del" data-del="' +
        op.id +
        '">Excluir</button></div>';
    return h + "</div>";
  }
  function section(title, desc, ops, cat, term) {
    var list = ops.filter(function (o) {
      return matches(o, term);
    });
    if (!list.length) return "";
    return (
      '<div class="oc-sec"><div class="oc-sec-h"><span class="oc-sec-t">' +
      title +
      "</span></div>" +
      (desc ? '<div class="oc-sec-d">' + desc + "</div>" : "") +
      '<div class="opgrid">' +
      list
        .map(function (o) {
          return card(o, cat);
        })
        .join("") +
      "</div></div>"
    );
  }
  function quantoSection(term, extra) {
    var list = QUANTO.concat(extra || []).filter(function (o) {
      return matches(o, term);
    });
    if (!list.length) return "";
    var h =
      '<div class="oc-sec"><div class="oc-sec-h"><span class="oc-sec-t">Derivativos Quanto · Internacional</span></div>' +
      '<div class="oc-sec-d">S&amp;P 500 e Nasdaq em moeda local (sem risco cambial). Payoff 2 (taxa fixa) modelado como piso garantido + alta 1:1 ilimitada — confirme as condições na lâmina.</div>';
    [1, 2].forEach(function (pf) {
      var g = list.filter(function (o) {
        return o.payoff === pf;
      });
      if (!g.length) return;
      h +=
        '<div class="oc-payoffhdr"><span class="pf">PAYOFF ' +
        pf +
        '</span><span class="pft">' +
        (pf === 1
          ? "Capital Protegido + Alta Ilimitada"
          : "Taxa Fixa ou Alta Ilimitada") +
        "</span></div>";
      h +=
        '<div class="opgrid">' +
        g
          .map(function (o) {
            return card(o, "quanto");
          })
          .join("") +
        "</div>";
    });
    return h + "</div>";
  }
  function render() {
    REG = {};
    try {
      CUSTOM =
        JSON.parse(window.hubStorage.getItem(RV_CUSTOM_KEY) || "[]") || [];
    } catch (_) {}
    var term = (document.getElementById("ocSearch").value || "")
      .toLowerCase()
      .trim();
    var body = document.getElementById("ocBody");
    var cProt = CUSTOM.filter(function (x) {
      return (x.kind || "protecao") === "protecao";
    });
    var cCup = CUSTOM.filter(function (x) {
      return x.kind === "cupom";
    });
    var cQnt = CUSTOM.filter(function (x) {
      return x.kind === "quanto";
    });
    try {
      HIDDEN =
        JSON.parse(window.hubStorage.getItem(RV_HIDDEN_KEY) || "[]") || [];
    } catch (_) {}
    function vis(arr) {
      return arr.filter(function (o) {
        return HIDDEN.indexOf(o.id) < 0;
      });
    }
    var html = "";
    if (HIDDEN.length)
      html +=
        '<div style="margin-bottom:12px"><button class="oc-btn" id="ocRestore" style="color:#FF8B52;border-color:rgba(255,139,82,.45)">↺ Restaurar ' +
        HIDDEN.length +
        " operação(ões) padrão oculta(s)</button></div>";
    if (currentTab === "todos" || currentTab === "protecao")
      html += section(
        "Catálogo de proteção XP",
        "Operações de proteção (Collar e Fence) sobre ações e índices.",
        vis(OPERACOES.concat(cProt)),
        "protecao",
        term,
      );
    if (currentTab === "todos" || currentTab === "cupom")
      html += section(
        "Operação Cupom · pré-fixado",
        "Cupom pré-fixado condicionado a uma barreira de desarme.",
        vis(CUPOM.concat(cCup)),
        "cupom",
        term,
      );
    if (currentTab === "todos" || currentTab === "quanto")
      html += quantoSection(term, cQnt);
    if (!html)
      html =
        '<div class="oc-empty">Nenhuma operação encontrada para a busca.</div>';
    body.innerHTML = html;
    var rb = document.getElementById("ocRestore");
    if (rb)
      rb.onclick = function () {
        HIDDEN = [];
        persistHidden();
        if (window.__rvSyncCatalog)
          try {
            window.__rvSyncCatalog();
          } catch (_) {}
        render();
      };
    body.querySelectorAll("[data-add]").forEach(function (b) {
      b.onclick = function () {
        addToCarteira(b.getAttribute("data-add"));
      };
    });
    body.querySelectorAll("[data-edit]").forEach(function (b) {
      b.onclick = function () {
        openForm(b.getAttribute("data-edit"));
      };
    });
    body.querySelectorAll("[data-del]").forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute("data-del");
        if (id.indexOf("cust") === 0) {
          try {
            CUSTOM =
              JSON.parse(window.hubStorage.getItem(RV_CUSTOM_KEY) || "[]") ||
              [];
          } catch (_) {}
          CUSTOM = CUSTOM.filter(function (x) {
            return x.id !== id;
          });
          persistRvOps();
          try {
            if (window.__HubCloud) window.__HubCloud.remove(id);
          } catch (_) {}
        } else {
          try {
            HIDDEN =
              JSON.parse(window.hubStorage.getItem(RV_HIDDEN_KEY) || "[]") ||
              [];
          } catch (_) {}
          if (HIDDEN.indexOf(id) < 0) HIDDEN.push(id);
          persistHidden();
          if (window.__rvSyncCatalog)
            try {
              window.__rvSyncCatalog();
            } catch (_) {}
        }
        render();
      };
    });
  }
  function addToCarteira(key) {
    var e = REG[key];
    if (!e) return;
    var op = e.op;
    var add = window.__drawerAdd || window.__ctorAddAtivo;
    if (!add) return;
    if (e.cat === "quanto")
      add(
        "Internacional",
        op.nome,
        opDetalheQuanto(op),
        "Vencimento em " + op.fixing,
        true,
        op,
      );
    else if (e.cat === "cupom")
      add(
        "Renda Variável",
        op.nome,
        cupomDetalhe(op),
        "No vencimento",
        false,
        op,
      );
    else
      add(
        "Renda Variável",
        op.nome,
        op.descricao || opDetalhe(op),
        "No vencimento",
        true,
        op,
      );
  }
  function tabs() {
    var box = document.getElementById("ocTabs");
    var defs = [
      ["todos", "Todos"],
      ["protecao", "Proteção XP"],
      ["cupom", "Cupom"],
      ["quanto", "Quanto Internacional"],
    ];
    box.innerHTML = defs
      .map(function (d) {
        return (
          '<button class="oc-tab' +
          (currentTab === d[0] ? " on" : "") +
          '" data-tab="' +
          d[0] +
          '">' +
          d[1] +
          "</button>"
        );
      })
      .join("");
    box.querySelectorAll("[data-tab]").forEach(function (b) {
      b.onclick = function () {
        currentTab = b.getAttribute("data-tab");
        tabs();
        render();
      };
    });
  }
  function ocVal(id) {
    var e = document.getElementById(id);
    return e ? String(e.value).trim() : "";
  }
  function ocNum(id, def) {
    var e = document.getElementById(id);
    if (!e || e.value === "") return def;
    var n = Number(e.value);
    return isNaN(n) ? def : n;
  }
  function fieldProt(o) {
    return (
      '<div class="oc-row"><label>Tipo<select id="ocfTipo"><option' +
      (o.tipo === "Proteção parcial" ? " selected" : "") +
      ">Proteção parcial</option><option" +
      (o.tipo === "Proteção total" ? " selected" : "") +
      ">Proteção total</option></select></label>" +
      '<label>Protege até (% queda, -100 = total)<input id="ocfProt" type="number" value="' +
      (o.protegeAte != null ? o.protegeAte : -20) +
      '"></label></div>' +
      '<div class="oc-row"><label>Teto de alta (%)<input id="ocfTeto" type="number" value="' +
      (o.teto != null ? o.teto : 35) +
      '"></label>' +
      '<label>Teto se tocar barreira (%)<input id="ocfTetoB" type="number" value="' +
      (o.tetoBarreira != null ? o.tetoBarreira : 16) +
      '"></label></div>' +
      '<div class="oc-row"><label>Barreira de alta (%)<input id="ocfBarr" type="number" value="' +
      (o.barreira != null ? o.barreira : 135) +
      '"></label><label></label></div>'
    );
  }
  function fieldCupom(o) {
    return (
      '<div class="oc-row"><label>Cupom pré-fixado (% a.a.)<input id="ocfTaxa" type="number" value="' +
      (o.taxa != null ? o.taxa : 15) +
      '"></label>' +
      '<label>Barreira de desarme (% queda)<input id="ocfCupBarr" type="number" value="' +
      (o.cupBarreira != null ? o.cupBarreira : -20) +
      '"></label></div>' +
      '<div class="oc-row"><label>% do CDI (opcional)<input id="ocfCdi" type="number" value="' +
      (o.cdi != null ? o.cdi : "") +
      '" placeholder="Ex.: 147"></label><label></label></div>'
    );
  }
  function fieldQuanto(o) {
    return (
      '<div class="oc-row"><label>Tipo de payoff<select id="ocfPayoff"><option value="1"' +
      (o.payoff === 1 ? " selected" : "") +
      '>1 · Capital protegido + alta × mult</option><option value="2"' +
      (o.payoff === 2 ? " selected" : "") +
      ">2 · Taxa fixa ou alta 1:1</option></select></label>" +
      '<label>Prazo<input id="ocfFixing" value="' +
      esc(o.fixing || "") +
      '" placeholder="Ex.: 3 anos"></label></div>' +
      '<div class="oc-row"><label>Multiplicador da alta (payoff 1)<input id="ocfMult" type="number" step="0.01" value="' +
      (o.mult != null ? o.mult : 1.1) +
      '"></label>' +
      '<label>Taxa fixa % (payoff 2)<input id="ocfTaxa" type="number" value="' +
      (o.taxa != null ? o.taxa : 10) +
      '"></label></div>'
    );
  }
  function readForm(o) {
    o.nome = ocVal("ocfNome");
    o.ativo = ocVal("ocfAtivo");
    o.setor = ocVal("ocfSetor");
    o.descricao = ocVal("ocfDesc");
    if (document.getElementById("ocfTipo")) {
      o.tipo = ocVal("ocfTipo");
      o.protegeAte = ocNum("ocfProt", -20);
      o.teto = ocNum("ocfTeto", 35);
      o.tetoBarreira = ocNum("ocfTetoB", Math.round((o.teto || 35) * 0.45));
      o.barreira = ocNum("ocfBarr", 135);
    } else if (document.getElementById("ocfCupBarr")) {
      o.taxa = ocNum("ocfTaxa", 15);
      o.cupBarreira = ocNum("ocfCupBarr", -20);
      var cd = document.getElementById("ocfCdi");
      o.cdi = cd && cd.value !== "" ? ocNum("ocfCdi", null) : null;
    } else if (document.getElementById("ocfPayoff")) {
      o.payoff = Number(ocVal("ocfPayoff")) || 1;
      o.mult = ocNum("ocfMult", 1.1);
      o.fixing = ocVal("ocfFixing");
      o.taxa = ocNum("ocfTaxa", 10);
    }
    return o;
  }
  function renderForm(o) {
    var box = document.getElementById("ocForm");
    var specific =
      o.kind === "cupom"
        ? fieldCupom(o)
        : o.kind === "quanto"
          ? fieldQuanto(o)
          : fieldProt(o);
    box.innerHTML =
      '<div class="oc-form">' +
      '<div class="oc-row"><label>Nome da operação<input id="ocfNome" value="' +
      esc(o.nome) +
      '" placeholder="' +
      (o.kind === "cupom"
        ? "Opcional · gerado do ativo e taxa"
        : "Ex.: VALE3 · Fence 40%") +
      '"></label>' +
      '<label>Ativo<input id="ocfAtivo" value="' +
      esc(o.ativo) +
      '" placeholder="' +
      (o.kind === "quanto" ? "Ex.: S&amp;P 500" : "Ex.: VALE3") +
      '"></label></div>' +
      '<div class="oc-row"><label>Categoria<select id="ocfKind"><option value="protecao"' +
      (o.kind === "protecao" ? " selected" : "") +
      '>Proteção (Collar / Fence)</option><option value="cupom"' +
      (o.kind === "cupom" ? " selected" : "") +
      '>Cupom pré-fixado</option><option value="quanto"' +
      (o.kind === "quanto" ? " selected" : "") +
      ">Quanto Internacional</option></select></label>" +
      '<label>Setor<input id="ocfSetor" value="' +
      esc(o.setor) +
      '" placeholder="Ex.: Mineração"></label></div>' +
      specific +
      '<label style="margin-bottom:12px">Descrição (opcional)<textarea id="ocfDesc" placeholder="Observações da operação...">' +
      esc(o.descricao || "") +
      "</textarea></label>" +
      '<div class="oc-formacts"><button class="oc-save" id="ocSave">Salvar</button><button class="oc-cancel" id="ocCancel">Cancelar</button></div></div>';
    document.getElementById("ocfKind").onchange = function () {
      readForm(o);
      o.kind = document.getElementById("ocfKind").value;
      renderForm(o);
    };
    document.getElementById("ocSave").onclick = function () {
      saveForm(o);
    };
    document.getElementById("ocCancel").onclick = function () {
      editingId = null;
      document.getElementById("ocForm").innerHTML = "";
    };
    var nm = document.getElementById("ocfNome");
    if (nm) nm.focus();
  }
  function findAnyOp(id) {
    var f = CUSTOM.filter(function (x) {
      return x.id === id;
    })[0];
    if (f) return f;
    f = OPERACOES.filter(function (x) {
      return x.id === id;
    })[0];
    if (f) return f;
    f = CUPOM.filter(function (x) {
      return x.id === id;
    })[0];
    if (f) return f;
    f = QUANTO.filter(function (x) {
      return x.id === id;
    })[0];
    return f || null;
  }
  function opToForm(op, base) {
    var o = Object.assign({}, base);
    if (op.cupom || op.kind === "cupom") {
      o.kind = "cupom";
      o.ativo = op.ativo || "";
      o.setor = op.setor || "";
      o.taxa = op.taxa != null ? op.taxa : 15;
      o.cupBarreira =
        op.cupBarreira != null
          ? op.cupBarreira
          : op.barreira != null
            ? op.barreira
            : -20;
      o.cdi = op.cdi != null ? op.cdi : null;
      o.nome = op.nome || "";
    } else if (op.quanto || op.kind === "quanto") {
      o.kind = "quanto";
      o.ativo = op.ativo || "";
      o.setor = op.setor || "";
      o.payoff = op.payoff || 1;
      o.mult = op.mult != null ? op.mult : 1.1;
      o.taxa = op.taxa != null ? op.taxa : 10;
      o.fixing = op.fixing || "";
      o.nome = op.nome || "";
    } else {
      o.kind = "protecao";
      o.nome = op.nome || "";
      o.ativo = op.ativo || "";
      o.tipo = op.tipo || "Proteção parcial";
      o.setor = op.setor || "";
      o.protegeAte = op.protegeAte != null ? op.protegeAte : -20;
      o.teto = op.teto != null ? op.teto : 35;
      o.tetoBarreira = op.tetoBarreira != null ? op.tetoBarreira : 16;
      o.barreira = op.barreira != null ? op.barreira : 135;
      o.descricao = op.descricao || "";
    }
    return o;
  }
  function openForm(id) {
    editingId = id || null;
    var base = {
      kind: "protecao",
      nome: "",
      ativo: "",
      tipo: "Proteção parcial",
      setor: "",
      protegeAte: -20,
      teto: 35,
      tetoBarreira: 16,
      barreira: 135,
      taxa: 15,
      cupBarreira: -20,
      cdi: null,
      payoff: 1,
      mult: 1.1,
      fixing: "",
      descricao: "",
    };
    var o = base;
    if (id) {
      var found = findAnyOp(id);
      o = found ? opToForm(found, base) : base;
    }
    if (!o.kind) o.kind = "protecao";
    renderForm(o);
  }
  function saveForm(o) {
    readForm(o);
    var data;
    if (o.kind === "quanto") {
      if (!o.ativo) {
        document.getElementById("ocfAtivo").focus();
        return;
      }
      var built = buildQuanto({
        id: editingId || "cust" + (customSeq + 1),
        payoff: o.payoff,
        ativo: o.ativo,
        fixing: o.fixing || "—",
        mult: o.mult,
        taxa: o.taxa,
        setor: o.setor || "Internacional",
      });
      data = Object.assign({}, built, {
        kind: "quanto",
        setor: o.setor || "Internacional",
        descricao: o.descricao,
      });
      if (o.nome) data.nome = o.nome;
    } else if (o.kind === "cupom") {
      if (!o.ativo) {
        document.getElementById("ocfAtivo").focus();
        return;
      }
      data = {
        kind: "cupom",
        ativo: o.ativo,
        setor: o.setor,
        taxa: o.taxa,
        barreira: o.cupBarreira,
        cdi: o.cdi,
        cupom: true,
        tipo: "Cupom pré-fixado",
        descricao: o.descricao,
        cen: cupomCen(o.taxa, o.cupBarreira),
      };
      data.nome = o.nome || o.ativo + " · SmartCupom " + fmtTaxa(o.taxa) + "%";
    } else {
      if (!o.nome) {
        document.getElementById("ocfNome").focus();
        return;
      }
      data = {
        kind: "protecao",
        nome: o.nome,
        ativo: o.ativo,
        tipo: o.tipo || "Proteção parcial",
        setor: o.setor,
        protegeAte: o.protegeAte,
        teto: o.teto,
        tetoBarreira: o.tetoBarreira,
        barreira: o.barreira,
        descricao: o.descricao,
        cen: protCen(o.protegeAte, o.teto, o.tetoBarreira),
      };
    }
    try {
      CUSTOM =
        JSON.parse(window.hubStorage.getItem(RV_CUSTOM_KEY) || "[]") || [];
    } catch (_) {}
    customSeq = 0;
    CUSTOM.forEach(function (x) {
      var n = parseInt(String(x.id || "").replace("cust", ""), 10);
      if (!isNaN(n) && n > customSeq) customSeq = n;
    });
    if (editingId && editingId.indexOf("cust") === 0) {
      data.id = editingId;
      CUSTOM = CUSTOM.map(function (x) {
        return x.id === editingId ? data : x;
      });
    } else {
      if (editingId) {
        try {
          HIDDEN =
            JSON.parse(window.hubStorage.getItem(RV_HIDDEN_KEY) || "[]") || [];
        } catch (_) {}
        if (HIDDEN.indexOf(editingId) < 0) HIDDEN.push(editingId);
        persistHidden();
      }
      data.id = "cust" + ++customSeq;
      CUSTOM.unshift(data);
    }
    persistRvOps();
    try {
      if (window.__HubCloud)
        window.__HubCloud.push("rv", data.id, data, data.nome);
    } catch (_) {}
    editingId = null;
    document.getElementById("ocForm").innerHTML = "";
    tabs();
    render();
  }
  function init() {
    var sb = document.getElementById("ocSearch");
    if (!sb) return;
    tabs();
    sb.addEventListener("input", render);
    document.getElementById("ocNew").addEventListener("click", function () {
      openForm(null);
    });
    render();
  }
  window.__cloudRvReload = function () {
    try {
      CUSTOM =
        JSON.parse(window.hubStorage.getItem(RV_CUSTOM_KEY) || "[]") || [];
    } catch (_) {}
    try {
      customSeq = 0;
      CUSTOM.forEach(function (x) {
        var n = parseInt(String(x.id || "").replace("cust", ""), 10);
        if (!isNaN(n) && n > customSeq) customSeq = n;
      });
    } catch (_) {}
    try {
      if (window.__rvSyncCatalog) window.__rvSyncCatalog();
    } catch (_) {}
    try {
      if (document.getElementById("ocSearch")) render();
    } catch (_) {}
  };
  if (document.readyState === "loading") {
    queueMicrotask(init);
  } else {
    init();
  }
})();
