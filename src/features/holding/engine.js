// Migrated from Hub v1. Review domain assumptions separately from interface changes.

(function () {
  "use strict";
  /* ===== Whole Life: crescimento e regua de resgate ======================
     Premio nivelado 10-pay, ancorado no XP Toda Vida (3,70% do capital aos
     36 anos, com fator por idade). A reserva acumula os premios a IPCA+3.
     O resgate e a reserva menos o desagio: indisponivel ate o 3o ano, com
     desagio decrescente do 3o ao 10o, e integral do 10o em diante. A curva
     de desagio muda por produto -- por isso o valor do 3o ano e um campo,
     nao um numero cravado no codigo. ===================================== */
  var IDADE = [
    [36, 1.0],
    [40, 1.15],
    [45, 1.4],
    [50, 1.7],
    [55, 2.1],
    [60, 2.6],
    [65, 3.2],
    [70, 4.0],
    [75, 4.8],
  ];
  function fatorIdade(a) {
    for (var i = 0; i < IDADE.length; i++) {
      if (a <= IDADE[i][0]) return IDADE[i][1];
    }
    return 5.5;
  }
  var ANO_MIN = 3,
    ANO_PLENO = 10;

  var ST = {
    cob: 1000000,
    idade: 45,
    parc: null,
    ipca: 4.5,
    des3: 40,
    hor: 20,
    tgPagos: true,
    tgMarcos: true,
    tgCmp: false,
  };
  var CH = null;
  function el(id) {
    return document.getElementById(id);
  }
  function brl(n) {
    return "R$ " + Math.round(n || 0).toLocaleString("pt-BR");
  }
  function brlK(n) {
    n = n || 0;
    if (Math.abs(n) >= 1e6)
      return "R$ " + (n / 1e6).toFixed(1).replace(".", ",") + " mi";
    if (Math.abs(n) >= 1000) return "R$ " + Math.round(n / 1000) + "k";
    return "R$ " + Math.round(n);
  }
  function pct(n) {
    return (Math.round((n || 0) * 10) / 10).toString().replace(".", ",") + "%";
  }

  /* desagio do ano n, em % da reserva */
  function desagio(n) {
    if (n < ANO_MIN) return null; /* sem resgate disponivel */
    if (n >= ANO_PLENO) return 0;
    return (ST.des3 * (ANO_PLENO - n)) / (ANO_PLENO - ANO_MIN);
  }

  function calc() {
    var ipca = ST.ipca / 100,
      RES_R = (1 + ipca) * 1.03 - 1;
    var premioAuto = ST.cob * 0.037 * fatorIdade(ST.idade);
    var premio = ST.parc != null && ST.parc > 0 ? ST.parc : premioAuto;
    var anos = [],
      cap = [],
      res = [],
      pagos = [],
      resg = [],
      tbl = [];
    var bal = 0,
      equilibrio = null;
    for (var n = 0; n <= ST.hor; n++) {
      if (n > 0) {
        if (n <= 10) bal += premio;
        bal *= 1 + RES_R;
      }
      var c = ST.cob * Math.pow(1 + ipca, n);
      var pg = premio * Math.min(n, 10);
      var d = desagio(n);
      var r = d == null ? 0 : bal * (1 - d / 100);
      anos.push(n);
      cap.push(c);
      res.push(bal);
      pagos.push(pg);
      resg.push(r);
      if (equilibrio == null && d != null && pg > 0 && r >= pg) equilibrio = n;
      tbl.push({
        n: n,
        c: c,
        pg: pg,
        rv: bal,
        d: d,
        r: r,
        ratio: pg > 0 ? (r / pg) * 100 : 0,
      });
    }
    var i10 = Math.min(10, ST.hor),
      i3 = Math.min(3, ST.hor);
    return {
      anos: anos,
      cap: cap,
      res: res,
      pagos: pagos,
      resg: resg,
      tbl: tbl,
      premio: premio,
      pagosTot: premio * 10,
      r3: resg[i3],
      r10: resg[i10],
      rFim: resg[resg.length - 1],
      pg3: pagos[i3],
      pg10: pagos[i10],
      capFim: cap[cap.length - 1],
      equilibrio: equilibrio,
      desFim: desagio(ST.hor),
    };
  }

  /* marcadores verticais nos anos 3 e 10 */
  var marcosPlugin = {
    id: "wlMarcos",
    afterDatasetsDraw: function (ch) {
      var ms = ch.$marcos;
      if (!ms || !ms.length) return;
      var sx = ch.scales.x,
        ctx = ch.ctx,
        ca = ch.chartArea;
      ms.forEach(function (m) {
        if (m.x == null || m.x > sx.max) return;
        var x = sx.getPixelForValue(m.x);
        ctx.save();
        ctx.strokeStyle = m.cor;
        ctx.setLineDash([6, 4]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, ca.top);
        ctx.lineTo(x, ca.bottom);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = m.cor;
        ctx.font = "700 10.5px Manrope,sans-serif";
        ctx.fillText(m.txt, Math.min(x + 5, ca.right - 124), ca.top + m.y);
        ctx.restore();
      });
    },
  };

  function grafico(d) {
    var cv = el("wlChart");
    if (!cv || typeof Chart === "undefined") return;
    if (CH) {
      CH.destroy();
      CH = null;
    }
    var ds = [
      {
        label: "Capital segurado (o que o beneficiário recebe)",
        data: d.cap,
        borderColor: "#F26522",
        backgroundColor: "rgba(242,101,34,.14)",
        fill: true,
        tension: 0.25,
        pointRadius: 0,
        borderWidth: 3,
      },
      {
        label: "Valor de resgate (o que você tira em vida)",
        data: d.resg,
        borderColor: "#2BD9A6",
        backgroundColor: "rgba(43,217,166,.12)",
        fill: true,
        tension: 0.25,
        pointRadius: 0,
        borderWidth: 2.5,
      },
    ];
    if (ST.tgPagos)
      ds.push({
        label: "Prêmios pagos",
        data: d.pagos,
        borderColor: "#F5B942",
        backgroundColor: "transparent",
        borderDash: [6, 4],
        tension: 0.2,
        pointRadius: 0,
        borderWidth: 2,
      });
    CH = new Chart(cv.getContext("2d"), {
      type: "line",
      data: { labels: d.anos, datasets: ds },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            labels: {
              color: "#C2CBF0",
              font: { family: "Manrope", size: 11 },
              boxWidth: 14,
            },
          },
          tooltip: {
            callbacks: {
              label: function (c) {
                return c.dataset.label + ": " + brl(c.parsed.y);
              },
            },
          },
        },
        scales: {
          x: {
            title: { display: true, text: "Anos", color: "#AFC1F7" },
            ticks: { color: "#AFC1F7" },
            grid: { color: "rgba(120,130,210,.14)" },
          },
          y: {
            ticks: {
              color: "#AFC1F7",
              callback: function (v) {
                return brlK(v);
              },
            },
            grid: { color: "rgba(120,130,210,.14)" },
          },
        },
      },
      plugins: [marcosPlugin],
    });
    CH.$marcos = ST.tgMarcos
      ? [
          { x: ANO_MIN, cor: "#F5B942", txt: "3º ano · com deságio", y: 14 },
          { x: ANO_PLENO, cor: "#2BD9A6", txt: "10º ano · integral", y: 30 },
        ]
      : [];
    CH.update();
  }

  /* ===== Comparativo: Whole Life x Holding ================================
     Mesmo objetivo (passar o patrimonio adiante), comparado pelo desembolso
     da familia. Holding: constituicao + cartorio + ITBI + ITCMD da doacao das
     cotas (hoje) + contabilidade ano a ano (IPCA). Whole Life: premios 10-pay;
     na sucessao o capital segurado paga ITCMD + honorarios + custas do
     inventario no horizonte -- se faltar, o que faltar entra como custo.
     Alugueis (opcional) creditam a holding pela diferenca PJ (11,33%) x PF
     (27,5%). Tabela de ITCMD por UF conferida em ago/2026; 'c' e o grau de
     confianca da fonte. ==================================================== */
  var INF = Infinity;
  var ITCMD = {
    AC: {
      f: [
        [50000, 0],
        [1500000, 4],
        [2500000, 5],
        [3500000, 6],
        [INF, 7],
      ],
      c: "ok",
      n: "LC 373/2020. Colaterais: 8%.",
    },
    AL: {
      f: [[INF, 4]],
      c: "ok",
      n: "Alíquota fixa (Lei 5.077/1989). Progressividade prevista para 2027.",
    },
    AP: {
      f: [[INF, 4]],
      c: "conf",
      n: "Não confirmado. Base histórica 4% fixa; há notícia de progressividade 2–6% (Lei 3.149/2024) sem fonte primária.",
    },
    AM: {
      f: [
        [400000, 0],
        [2000000, 2],
        [6000000, 3],
        [INF, 4],
      ],
      c: "ok",
      n: "LC 269/2024. Herança isenta até R$ 400 mil.",
    },
    BA: {
      f: [
        [100000, 0],
        [200000, 4],
        [300000, 6],
        [INF, 8],
      ],
      c: "ok",
      n: "Lei 14.802/2024.",
    },
    CE: {
      f: [
        [29000, 2],
        [87000, 4],
        [174000, 6],
        [INF, 8],
      ],
      c: "media",
      t: 1,
      n: "Faixas em UFIRCE (2026 = R$ 6,29872). No CE a alíquota incide sobre o TOTAL, não por faixa.",
    },
    DF: {
      f: [
        [1000000, 4],
        [2000000, 5],
        [INF, 6],
      ],
      c: "ok",
      n: "Lei 3.804/2006 c/ Lei 5.549/2015.",
    },
    ES: { f: [[INF, 4]], c: "ok", n: "Alíquota fixa (Lei 10.011/2013)." },
    GO: {
      f: [
        [25000, 2],
        [200000, 4],
        [600000, 6],
        [INF, 8],
      ],
      c: "ok",
      n: "Lei 11.651/1991.",
    },
    MA: {
      f: [
        [300000, 3],
        [600000, 4],
        [900000, 5],
        [1200000, 6],
        [INF, 7],
      ],
      c: "media",
      n: "Lei 7.799/2002. Faixas aproximadas — reconferir na SEFAZ.",
    },
    MT: {
      f: [
        [395670, 0],
        [1055120, 2],
        [2110240, 4],
        [4220480, 6],
        [INF, 8],
      ],
      c: "ok",
      n: "Faixas em UPF/MT (ago-2026 = R$ 263,78). Isento até 1.500 UPF.",
    },
    MS: {
      f: [
        [100000, 0],
        [INF, 6],
      ],
      c: "ok",
      n: "Alíquota fixa 6% (Lei 1.810/1997). Isento até R$ 100 mil.",
    },
    MG: {
      f: [[INF, 5]],
      c: "ok",
      n: "Alíquota fixa 5% (Lei 14.941/2003). PL 2.881/2024 (3/5/8%) em tramitação.",
    },
    PA: {
      f: [[INF, 4]],
      c: "conf",
      n: "Progressiva 2–6% em UPF-PA (Lei 5.529/1989), valor da UPF-PA 2026 não confirmado. Usando 4% como referência.",
    },
    PB: {
      f: [
        [125000, 2],
        [400000, 4],
        [1000000, 6],
        [INF, 8],
      ],
      c: "ok",
      n: "Lei 5.123/1989, red. Lei 12.585/2023.",
    },
    PR: { f: [[INF, 4]], c: "ok", n: "Alíquota fixa (Lei 18.573/2015)." },
    PE: {
      f: [
        [80000, 0],
        [350000, 2],
        [550000, 4],
        [750000, 6],
        [INF, 8],
      ],
      c: "ok",
      n: "LC 563/2025, vigente desde 01/01/2026.",
    },
    PI: {
      f: [[INF, 4]],
      c: "conf",
      n: "Progressiva 2–6% (Lei 4.261/1989), faixas não confirmadas. Usando 4% como referência.",
    },
    RJ: {
      f: [
        [347228, 4],
        [496040, 4.5],
        [992080, 5],
        [1488120, 6],
        [1984160, 7],
        [INF, 8],
      ],
      c: "ok",
      n: "Faixas em UFIR-RJ (2026 = R$ 4,9604). Lei 7.174/2015.",
    },
    RN: {
      f: [[INF, 3]],
      c: "conf",
      n: "Base confirmada: 3% única (Lei 5.887/1989). Alteração para 3–6% não confirmada.",
    },
    RS: {
      f: [
        [56653, 0],
        [283264, 3],
        [849792, 4],
        [1416320, 5],
        [INF, 6],
      ],
      c: "ok",
      n: "Faixas em UPF-RS (2026 = R$ 28,3264). Isento até 2.000 UPF.",
    },
    RO: {
      f: [
        [155575, 2],
        [767918, 3],
        [INF, 4],
      ],
      c: "media",
      n: "Faixas em UPF/RO (2026 = R$ 124,46). Lei 959/2000.",
    },
    RR: { f: [[INF, 4]], c: "media", n: "Alíquota fixa 4% (Lei 59/1993)." },
    SC: {
      f: [
        [20000, 1],
        [50000, 3],
        [150000, 5],
        [INF, 7],
      ],
      c: "ok",
      n: "Lei 19.053/2024 revogou a faixa de 8%.",
    },
    SP: {
      f: [[INF, 4]],
      c: "ok",
      n: "Alíquota fixa 4% (Lei 10.705/2000). PLs de progressividade só valeriam a partir de 2027.",
    },
    SE: {
      f: [
        [41240, 0],
        [199354, 3],
        [996853, 6],
        [INF, 8],
      ],
      c: "ok",
      n: "Faixas em UFP/SE (mai-2026 = R$ 82,48, reajuste mensal).",
    },
    TO: {
      f: [
        [25000, 2],
        [100000, 4],
        [500000, 6],
        [INF, 8],
      ],
      c: "media",
      n: "Lei 1.287/2001. Faixas aproximadas — fontes divergentes.",
    },
  };
  var UFS = Object.keys(ITCMD).sort();
  function itcmd(base, uf) {
    var t = ITCMD[uf];
    if (!t || base <= 0) return { v: 0, ef: 0 };
    if (t.t) {
      var a = t.f[t.f.length - 1][1];
      for (var q = 0; q < t.f.length; q++) {
        if (base <= t.f[q][0]) {
          a = t.f[q][1];
          break;
        }
      }
      return { v: (base * a) / 100, ef: a };
    }
    var v = 0,
      ant = 0;
    for (var i = 0; i < t.f.length; i++) {
      var lim = t.f[i][0],
        al = t.f[i][1];
      if (base > ant) {
        v += ((Math.min(base, lim) - ant) * al) / 100;
      }
      ant = lim;
      if (base <= lim) break;
    }
    return { v: v, ef: base > 0 ? (v / base) * 100 : 0 };
  }
  function faixaTxt(uf) {
    var t = ITCMD[uf];
    if (!t) return "";
    if (t.f.length === 1) return String(t.f[0][1]).replace(".", ",") + "% fixo";
    var r = t.f
      .map(function (x) {
        return x[1];
      })
      .filter(function (a) {
        return a > 0;
      });
    var mn = Math.min.apply(null, r),
      mx = Math.max.apply(null, r);
    var isento = t.f[0][1] === 0 ? " · isento até " + brlK(t.f[0][0]) : "";
    if (mn === mx) return String(mn).replace(".", ",") + "% fixo" + isento;
    return (
      String(mn).replace(".", ",") +
      "% a " +
      String(mx).replace(".", ",") +
      "% (progressivo)" +
      isento
    );
  }
  /* honorarios (h) e custas/cartorio (c) em % do monte-mor; OAB-SP: piso de 6% */
  var INV = {
    extra: { h: 6, c: 0.8, r: "extrajudicial" },
    jud: { h: 8, c: 1.5, r: "judicial consensual" },
    lit: { h: 10, c: 2.5, r: "judicial litigioso" },
  };
  window.__ITCMD_UF = { tab: ITCMD, calc: itcmd, faixa: faixaTxt, ufs: UFS };
  var CART_IMOVEL = 4500,
    PJ_ALUG = 11.33,
    PF_ALUG = 27.5;

  var C = {
    patr: 3000000,
    pctImov: 60,
    uf: "SP",
    mod: "extra",
    constit: 20000,
    nImov: 3,
    itbi: 3,
    contMes: 1000,
    alug: 0,
  };
  var CHB = null,
    CHA = null;

  function calcCmp(d) {
    var ipca = ST.ipca / 100,
      N = ST.hor;
    var P = C.patr,
      imov = (P * C.pctImov) / 100;
    var itHoje = itcmd(P, C.uf);
    var constit = C.constit + C.nImov * CART_IMOVEL;
    var itbi = (imov * C.itbi) / 100;
    var dia1 = constit + itbi + itHoje.v;
    var contTot = 0,
      econTot = 0,
      holdAcc = [dia1],
      wlAcc = [0];
    for (var n = 1; n <= N; n++) {
      var f = Math.pow(1 + ipca, n);
      var cont = C.contMes * 12 * f,
        econ = C.alug > 0 ? (C.alug * 12 * f * (PF_ALUG - PJ_ALUG)) / 100 : 0;
      contTot += cont;
      econTot += econ;
      holdAcc.push(dia1 + contTot - econTot);
      wlAcc.push(d.premio * Math.min(n, 10));
    }
    var holdTot = dia1 + contTot - econTot;
    var PN = P * Math.pow(1 + ipca, N),
      inv = INV[C.mod],
      itN = itcmd(PN, C.uf);
    var hon = (PN * inv.h) / 100,
      cus = (PN * inv.c) / 100,
      custosInv = itN.v + hon + cus;
    var capN = d.capFim;
    var falta = Math.max(0, custosInv - capN),
      sobra = Math.max(0, capN - custosInv);
    var wlTot = d.pagosTot + falta;
    if (falta > 0) wlAcc[N] += falta;
    return {
      P: P,
      PN: PN,
      N: N,
      itHoje: itHoje,
      constit: constit,
      itbi: itbi,
      contTot: contTot,
      econTot: econTot,
      dia1: dia1,
      holdTot: holdTot,
      itN: itN,
      hon: hon,
      cus: cus,
      custosInv: custosInv,
      capN: capN,
      falta: falta,
      sobra: sobra,
      wlTot: wlTot,
      inv: inv,
      holdAcc: holdAcc,
      wlAcc: wlAcc,
      famH: PN - holdTot,
      famW: PN - d.pagosTot - custosInv + capN,
    };
  }

  function renderCmp(d) {
    var box = el("wlCmp");
    if (!box) return;
    box.hidden = !ST.tgCmp;
    if (!ST.tgCmp) {
      return;
    }
    var c = calcCmp(d);
    el("cmpPatrO").textContent = brl(C.patr);
    el("cmpImovO").textContent = C.pctImov + "%";
    el("cmpNImovO").textContent = String(C.nImov);
    el("cmpItbiO").textContent = pct(C.itbi);
    el("cmpUfO").textContent = C.uf;
    el("cmpUfNota").textContent =
      faixaTxt(C.uf) + (ITCMD[C.uf].c === "conf" ? " · não confirmado" : "");
    el("cmpHorH").textContent = String(c.N);
    el("cmpHorW").textContent = String(c.N);

    el("cmpHoldTot").textContent = brl(c.holdTot);
    var lh =
      "<li>Constituição + cartório (" +
      C.nImov +
      " matrícula" +
      (C.nImov === 1 ? "" : "s") +
      ")<b>" +
      brl(c.constit) +
      "</b></li>" +
      "<li>ITBI sobre " +
      brlK((c.P * C.pctImov) / 100) +
      " em imóveis (" +
      pct(C.itbi) +
      ")<b>" +
      brl(c.itbi) +
      "</b></li>" +
      "<li>ITCMD na doação das cotas · " +
      C.uf +
      " (" +
      pct(c.itHoje.ef) +
      " efetivo)<b>" +
      brl(c.itHoje.v) +
      "</b></li>" +
      "<li>Contabilidade por " +
      c.N +
      " anos (IPCA)<b>" +
      brl(c.contTot) +
      "</b></li>";
    if (c.econTot > 0)
      lh +=
        '<li class="neg">Economia de IR sobre aluguéis (PJ x PF)<b>− ' +
        brl(c.econTot) +
        "</b></li>";
    lh += '<li class="tot">Desembolso total<b>' + brl(c.holdTot) + "</b></li>";
    el("cmpHoldList").innerHTML = lh;

    el("cmpWlTot").textContent = brl(c.wlTot);
    var lw =
      "<li>Prêmios · " +
      brl(d.premio) +
      " por 10 anos<b>" +
      brl(d.pagosTot) +
      "</b></li>" +
      '<li style="opacity:.75">Inventário no ' +
      c.N +
      "º ano: ITCMD " +
      brlK(c.itN.v) +
      " + honorários " +
      brlK(c.hon) +
      " + custas " +
      brlK(c.cus) +
      "<b>" +
      brl(c.custosInv) +
      "</b></li>" +
      '<li class="neg">Pago pelo capital segurado (' +
      brlK(c.capN) +
      ")<b>− " +
      brl(Math.min(c.capN, c.custosInv)) +
      "</b></li>";
    if (c.falta > 0)
      lw += "<li>Complemento dos herdeiros<b>" + brl(c.falta) + "</b></li>";
    lw += '<li class="tot">Desembolso total<b>' + brl(c.wlTot) + "</b></li>";
    el("cmpWlList").innerHTML = lw;

    var dif = c.holdTot - c.wlTot,
      difE = el("cmpDif");
    difE.textContent = (dif >= 0 ? "− " : "+ ") + brlK(Math.abs(dif));
    difE.className = "dif" + (dif >= 0 ? "" : " neg");
    el("cmpDifL").innerHTML =
      dif >= 0
        ? "o Whole Life custa <b>" +
          pct(c.holdTot > 0 ? (dif / c.holdTot) * 100 : 0) +
          " menos</b> que a holding neste cenário"
        : "a holding custa <b>" +
          pct(c.wlTot > 0 ? (-dif / c.wlTot) * 100 : 0) +
          " menos</b> que o seguro neste cenário";

    el("cmpInv").textContent = brl(c.custosInv);
    el("cmpInvS").textContent =
      "sobre " +
      brlK(c.PN) +
      " no " +
      c.N +
      "º ano · ITCMD " +
      pct(c.itN.ef) +
      " + " +
      pct(c.inv.h + c.inv.c) +
      " de honorários e custas (" +
      c.inv.r +
      ")";
    var cob = c.custosInv > 0 ? (c.capN / c.custosInv) * 100 : 0;
    el("cmpCob").textContent = pct(cob);
    el("cmpCobS").textContent =
      c.falta > 0
        ? "capital de " +
          brlK(c.capN) +
          " não cobre tudo — faltam " +
          brlK(c.falta) +
          "; ajuste o capital segurado acima"
        : "capital de " +
          brlK(c.capN) +
          " paga tudo e ainda sobram " +
          brlK(c.sobra) +
          " para os herdeiros";
    el("cmpVivo").textContent = brl(d.rFim);
    el("cmpVivoS").textContent =
      "resgate disponível no " +
      c.N +
      "º ano, isento de IR · na holding, o que foi gasto não volta";
    el("cmpFamH").textContent = brl(c.famH);
    el("cmpFamHS").textContent =
      "patrimônio de " +
      brlK(c.PN) +
      " menos " +
      brlK(c.holdTot) +
      " gastos no caminho";
    el("cmpFamW").textContent = brl(c.famW);
    el("cmpFamWS").textContent =
      "patrimônio inteiro" +
      (c.sobra > 0 ? " + " + brlK(c.sobra) + " que sobra do capital" : "") +
      " menos " +
      brlK(d.pagosTot) +
      " de prêmios";

    graficoCmp(c, d);
  }

  function graficoCmp(c, d) {
    if (typeof Chart === "undefined") return;
    var cb = el("cmpChartBar"),
      ca = el("cmpChartAcc");
    if (!cb || !ca) return;
    if (CHB) {
      CHB.destroy();
      CHB = null;
    }
    if (CHA) {
      CHA.destroy();
      CHA = null;
    }
    var leg = {
      labels: {
        color: "#C2CBF0",
        font: { family: "Manrope", size: 10.5 },
        boxWidth: 12,
      },
    };
    var grid = { color: "rgba(120,130,210,.14)" };
    var ds = [
      {
        label: "Constituição + cartório",
        data: [c.constit, 0],
        backgroundColor: "#5B8DEF",
      },
      { label: "ITBI", data: [c.itbi, 0], backgroundColor: "#8a93d8" },
      {
        label: "ITCMD na doação",
        data: [c.itHoje.v, 0],
        backgroundColor: "#F5B942",
      },
      {
        label: "Contabilidade " + c.N + " anos",
        data: [c.contTot, 0],
        backgroundColor: "#AFC1F7",
      },
      {
        label: "Prêmios (10 anos)",
        data: [0, d.pagosTot],
        backgroundColor: "#F26522",
      },
    ];
    if (c.falta > 0)
      ds.push({
        label: "Complemento dos herdeiros",
        data: [0, c.falta],
        backgroundColor: "#ff5566",
      });
    if (c.econTot > 0)
      ds.push({
        label: "Economia IR aluguéis",
        data: [-c.econTot, 0],
        backgroundColor: "#2BD9A6",
      });
    CHB = new Chart(cb.getContext("2d"), {
      type: "bar",
      data: { labels: ["Holding", "Whole Life"], datasets: ds },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: leg,
          title: {
            display: true,
            text: "De onde vem o custo de cada rota",
            color: "#fff",
            font: { family: "Sora", size: 12, weight: "800" },
            padding: { bottom: 8 },
          },
          tooltip: {
            callbacks: {
              label: function (x) {
                return x.dataset.label + ": " + brl(Math.abs(x.parsed.x));
              },
            },
          },
        },
        scales: {
          x: {
            stacked: true,
            ticks: {
              color: "#AFC1F7",
              callback: function (v) {
                return brlK(v);
              },
            },
            grid: grid,
          },
          y: {
            stacked: true,
            ticks: {
              color: "#fff",
              font: { family: "Sora", weight: "800", size: 12 },
            },
            grid: { display: false },
          },
        },
      },
    });
    var anos = [];
    for (var n = 0; n <= c.N; n++) anos.push(n);
    CHA = new Chart(ca.getContext("2d"), {
      type: "line",
      data: {
        labels: anos,
        datasets: [
          {
            label: "Holding · desembolso acumulado",
            data: c.holdAcc,
            borderColor: "#5B8DEF",
            backgroundColor: "rgba(91,141,239,.14)",
            fill: true,
            stepped: false,
            tension: 0.15,
            pointRadius: 0,
            borderWidth: 2.5,
          },
          {
            label: "Whole Life · desembolso acumulado",
            data: c.wlAcc,
            borderColor: "#F26522",
            backgroundColor: "rgba(242,101,34,.14)",
            fill: true,
            tension: 0.15,
            pointRadius: 0,
            borderWidth: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: leg,
          title: {
            display: true,
            text: "Quando o dinheiro sai do bolso",
            color: "#fff",
            font: { family: "Sora", size: 12, weight: "800" },
            padding: { bottom: 8 },
          },
          tooltip: {
            callbacks: {
              label: function (x) {
                return x.dataset.label + ": " + brl(x.parsed.y);
              },
            },
          },
        },
        scales: {
          x: {
            title: { display: true, text: "Anos", color: "#AFC1F7" },
            ticks: { color: "#AFC1F7" },
            grid: grid,
          },
          y: {
            ticks: {
              color: "#AFC1F7",
              callback: function (v) {
                return brlK(v);
              },
            },
            grid: grid,
          },
        },
      },
    });
  }

  function render() {
    var d = calc();
    el("wlCobO").textContent = brl(ST.cob);
    el("wlIdadeO").textContent = ST.idade + " anos";
    el("wlIpcaO").textContent = pct(ST.ipca) + " a.a.";
    el("wlDesO").textContent = pct(ST.des3);
    if (ST.parc == null)
      el("wlParc").placeholder = Math.round(d.premio).toLocaleString("pt-BR");

    var ratio10 = d.pg10 > 0 ? (d.r10 / d.pg10) * 100 : 0;
    el("wlHeroV").textContent = brl(d.r10);
    el("wlHeroBar").style.width = Math.min(100, ratio10) + "%";
    el("wlHeroS").innerHTML =
      "Sem deságio e isento de IR, sobre " +
      brl(d.pg10) +
      " de prêmios pagos — " +
      (ratio10 >= 100
        ? '<b style="color:#2BD9A6">' + pct(ratio10) + " do que entrou</b>."
        : pct(ratio10) + " do que entrou.");

    el("wlKCap").textContent = brl(ST.cob);
    el("wlKCapSub").innerHTML =
      "Corrigido por IPCA · " + brl(d.capFim) + " no " + ST.hor + "º ano";

    el("wlK1").textContent = brl(d.premio);
    el("wlK2").textContent = brl(d.pagosTot);
    el("wlK3").textContent = brl(d.r3);
    el("wlK3s").innerHTML =
      "deságio de " +
      pct(ST.des3) +
      " · " +
      pct(d.pg3 > 0 ? (d.r3 / d.pg3) * 100 : 0) +
      " do pago";
    el("wlK4").textContent = brl(d.r10);
    el("wlK4s").innerHTML = "sem deságio · isento de IR";
    el("wlK5").textContent = brl(d.rFim);
    el("wlK5s").innerHTML =
      ST.hor +
      "º ano · " +
      pct(d.pagosTot > 0 ? (d.rFim / d.pagosTot) * 100 : 0) +
      " do pago";
    el("wlK6").textContent =
      d.equilibrio != null ? d.equilibrio + "º ano" : "—";
    el("wlK6s").innerHTML =
      d.equilibrio != null
        ? "a partir daí o resgate supera os prêmios"
        : "no horizonte escolhido o resgate não alcança os prêmios";

    el("wlSegP").textContent = pct(ratio10);
    el("wlSegB").style.width = Math.min(100, ratio10) + "%";
    el("wlSegL").textContent =
      ratio10 >= 100
        ? "No 10º ano o resgate já devolve mais do que entrou"
        : "No 10º ano ainda falta " +
          brl(Math.max(0, d.pg10 - d.r10)) +
          " para empatar";
    var cobRatio = d.pagosTot > 0 ? (ST.cob / d.pagosTot) * 100 : 0;
    el("wlCovP").textContent = pct(cobRatio);
    el("wlCovB").style.width = Math.min(100, cobRatio / 5) + "%";
    el("wlCovL").textContent =
      "Cada R$ 1 de prêmio compra R$ " +
      (d.pagosTot > 0
        ? (ST.cob / d.pagosTot).toFixed(1).replace(".", ",")
        : "—") +
      " de capital segurado";

    el("wlRec").innerHTML =
      "<b>O ponto da conversa.</b> São " +
      brl(d.premio) +
      " por ano durante 10 anos. " +
      "Em troca, o cliente tem <b>" +
      brl(ST.cob) +
      "</b> de proteção desde o primeiro dia, " +
      "liquidez a partir do 3º ano e, do 10º em diante, <b>" +
      brl(d.r10) +
      "</b> disponíveis sem deságio e sem IR — " +
      (ratio10 >= 100
        ? "mais do que os " + brl(d.pg10) + " que ele colocou."
        : "contra " + brl(d.pg10) + " aportados.");

    el("wlPb1").innerHTML =
      "Resgate antecipado devolve menos que a reserva. Antes do <b>3º ano</b> não há resgate. " +
      "Do 3º ao 10º o deságio cai de forma linear — aqui você começou em " +
      pct(ST.des3) +
      " e ele zera no 10º. " +
      "Confirme a curva na tabela oficial do produto antes de usar com o cliente.";
    el("wlPb2").innerHTML =
      "No <b>10º ano</b> os prêmios estão quitados e o resgate passa a ser <b>integral</b>: " +
      brl(d.r10) +
      " sobre " +
      brl(d.pg10) +
      " pagos. Sem deságio e <b>isento de IR</b> — e o capital segurado de " +
      brl(ST.cob) +
      " continua de pé para o beneficiário.";

    var tb = el("wlTbody"),
      h = "",
      passo = ST.hor > 20 ? 5 : ST.hor > 10 ? 2 : 1;
    d.tbl.forEach(function (r) {
      if (
        r.n === 0 ||
        r.n === 3 ||
        r.n === 10 ||
        r.n % passo === 0 ||
        r.n === ST.hor
      ) {
        var marco =
          r.n === 3 || r.n === 10
            ? ' style="background:rgba(255,255,255,.05)"'
            : "";
        h +=
          "<tr" +
          marco +
          "><td>" +
          r.n +
          "</td><td>" +
          brl(r.c) +
          "</td><td>" +
          brl(r.pg) +
          "</td><td>" +
          brl(r.rv) +
          "</td><td>" +
          (r.d == null
            ? '<span style="opacity:.55">sem resgate</span>'
            : pct(r.d)) +
          "</td><td>" +
          (r.d == null ? "—" : brl(r.r)) +
          "</td><td>" +
          (r.d == null || r.pg <= 0 ? "—" : pct(r.ratio)) +
          "</td></tr>";
      }
    });
    tb.innerHTML = h;

    var pr = el("wlPrem");
    if (pr)
      pr.innerHTML =
        "<i>Capital segurado <b>" +
        brl(ST.cob) +
        "</b></i>" +
        "<i>Idade <b>" +
        ST.idade +
        " anos</b></i>" +
        "<i>Pr&ecirc;mio anual <b>" +
        brl(d.premio) +
        "</b> (10 anos)</i>" +
        "<i>IPCA <b>" +
        pct(ST.ipca) +
        " a.a.</b></i>" +
        "<i>Des&aacute;gio no 3&ordm; ano <b>" +
        pct(ST.des3) +
        "</b></i>" +
        "<i>Horizonte <b>" +
        ST.hor +
        " anos</b></i>" +
        (ST.tgCmp
          ? "<i>Patrim&ocirc;nio <b>" +
            brl(C.patr) +
            "</b> · " +
            C.pctImov +
            "% im&oacute;veis</i>" +
            "<i>ITCMD <b>" +
            C.uf +
            "</b></i>" +
            "<i>Holding: constitui&ccedil;&atilde;o <b>" +
            brl(C.constit + C.nImov * CART_IMOVEL) +
            "</b> · ITBI <b>" +
            pct(C.itbi) +
            "</b> · contabilidade <b>" +
            brl(C.contMes) +
            "/m&ecirc;s</b></i>" +
            "<i>Invent&aacute;rio <b>" +
            INV[C.mod].r +
            "</b></i>" +
            (C.alug > 0
              ? "<i>Alugu&eacute;is <b>" + brl(C.alug) + "/m&ecirc;s</b></i>"
              : "")
          : "");

    grafico(d);
    renderCmp(d);
  }

  function bind() {
    var raiz = el("wlCob");
    if (!raiz) return;
    if (raiz.__wired) {
      render();
      return;
    }
    raiz.__wired = true;
    function on(id, ev, fn) {
      var e = el(id);
      if (e) e.addEventListener(ev, fn);
    }
    on("wlCob", "input", function () {
      ST.cob = +this.value;
      render();
    });
    on("wlIdade", "input", function () {
      ST.idade = +this.value;
      render();
    });
    on("wlIpca", "input", function () {
      ST.ipca = +this.value;
      render();
    });
    on("wlDes", "input", function () {
      ST.des3 = +this.value;
      render();
    });
    on("wlHor", "change", function () {
      ST.hor = +this.value;
      render();
    });
    on("wlParc", "input", function () {
      var v = parseFloat(this.value);
      ST.parc = isNaN(v) || v <= 0 ? null : v;
      render();
    });
    on("wlParcAuto", "click", function () {
      ST.parc = null;
      el("wlParc").value = "";
      render();
    });
    on("wlTgPagos", "change", function () {
      ST.tgPagos = this.checked;
      render();
    });
    on("wlTgMarcos", "change", function () {
      ST.tgMarcos = this.checked;
      render();
    });
    on("wlTgCmp", "change", function () {
      ST.tgCmp = this.checked;
      render();
      if (this.checked) {
        var b = el("wlCmp");
        if (b && b.scrollIntoView)
          setTimeout(function () {
            b.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 60);
      }
    });
    /* comparativo com holding */
    var selUf = el("cmpUf");
    if (selUf && !selUf.options.length) {
      UFS.forEach(function (u) {
        var o = document.createElement("option");
        o.value = u;
        o.textContent = u + " — " + faixaTxt(u);
        if (u === C.uf) o.selected = true;
        selUf.appendChild(o);
      });
    }
    on("cmpPatr", "input", function () {
      C.patr = +this.value;
      render();
    });
    on("cmpImov", "input", function () {
      C.pctImov = +this.value;
      render();
    });
    on("cmpUf", "change", function () {
      C.uf = this.value;
      render();
    });
    on("cmpMod", "change", function () {
      C.mod = this.value;
      render();
    });
    on("cmpConst", "input", function () {
      C.constit = Math.max(0, +this.value || 0);
      render();
    });
    on("cmpNImov", "input", function () {
      C.nImov = +this.value;
      render();
    });
    on("cmpItbi", "input", function () {
      C.itbi = +this.value;
      render();
    });
    on("cmpCont", "input", function () {
      C.contMes = Math.max(0, +this.value || 0);
      render();
    });
    on("cmpAlug", "input", function () {
      C.alug = Math.max(0, +this.value || 0);
      render();
    });
    on("wlPngBtn", "click", function () {
      var alvo = document.querySelector("#p-holding .hc-sec");
      if (!alvo) return;
      var painel = document.getElementById("p-holding");
      var btn = this,
        txt = btn.textContent;
      btn.textContent = "Gerando...";
      function limpa() {
        painel.classList.remove("wl-print");
        btn.textContent = txt;
      }
      function go(h2c) {
        /* modo impressao: some com sliders, toggles e botoes e mostra a
           faixa de premissas -- a imagem que vai pro cliente fica limpa */
        painel.classList.add("wl-print");
        h2c(alvo, { backgroundColor: "#0A0E3F", scale: 2, useCORS: true })
          .then(function (cv) {
            limpa();
            /* mesmo modal das outras abas: a imagem aparece na tela, com
             copiar e baixar -- em vez de disparar download direto */
            if (window.mostrarPngModal)
              window.mostrarPngModal(
                cv.toDataURL("image/png"),
                "sucessao-wholelife.png",
                { accent: "#F26522", wide: true },
              );
            else {
              var a = document.createElement("a");
              a.download = "sucessao-wholelife.png";
              a.href = cv.toDataURL("image/png");
              a.click();
            }
          })
          .catch(function () {
            limpa();
          });
      }
      if (window.html2canvas) return go(window.html2canvas);
      var sc = document.createElement("script");
      sc.src = "./vendor/html2canvas-1.4.1.min.js";
      sc.onload = function () {
        go(window.html2canvas);
      };
      sc.onerror = function () {
        btn.textContent = txt;
      };
      document.head.appendChild(sc);
    });
    render();
  }

  if (document.readyState === "loading") {
    queueMicrotask(bind);
  } else {
    bind();
  }
  window._toolInit = window._toolInit || {};
  window._toolInit["holding"] = function () {
    try {
      bind();
    } catch (e) {}
  };
})();
