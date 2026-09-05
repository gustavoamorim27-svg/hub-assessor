// Migrated from Hub v1. Review domain assumptions separately from interface changes.

(function () {
  "use strict";
  /* ===== Holding Patrimonial: abertura, ITBI, ITCMD e aluguel ==============
     Tres rotas, medidas pelo desembolso da familia no horizonte:
       1. sem holding: tudo vai a inventario no fim (ITCMD + honorarios +
          custas sobre o patrimonio corrigido);
       2. holding simples: abertura + cartorio + ITBI hoje, contabilidade
          todo ano; as cotas ainda vao a inventario no fim;
       3. holding para sucessao: idem + doacao das cotas hoje (ITCMD sobre o
          valor de hoje); o que entrou na holding nao passa por inventario.
     Investimentos so entram na holding se o toggle estiver ligado; fora
     dela, vao a inventario em todas as rotas. Aluguel credita as duas
     holdings pela diferenca PF x PJ (lucro presumido). ITCMD e ITBI sao
     faixas que o assessor ajusta pelo estado e municipio do cliente. ==== */
  var ST = {
    imov: 3000000,
    nImov: 3,
    inv: 2000000,
    incF: false,
    hor: 20,
    ipca: 4.5,
    uf: "SP",
    itcmd: 4,
    itbi: 3,
    mod: "extra",
    abert: 15000,
    cart: 4500,
    doa: 5000,
    cont: 1000,
    alug: false,
    alugV: 15000,
    pf: 27.5,
  };
  var INV = {
    extra: { h: 6, c: 0.8, r: "extrajudicial" },
    jud: { h: 8, c: 1.5, r: "judicial consensual" },
    lit: { h: 10, c: 2.5, r: "judicial litigioso" },
  };
  var PJ_BASE = 11.33; /* IRPJ 4,8 + CSLL 2,88 + PIS 0,65 + COFINS 3 sobre a receita (presuncao 32%) */
  var CHB = null,
    CHA = null;
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
    return (
      (Math.round((n || 0) * 100) / 100).toString().replace(".", ",") + "%"
    );
  }
  /* adicional de IRPJ (10%) sobre a base presumida acima de R$ 20 mil/mes => aluguel acima de R$ 62,5 mil/mes */
  function pjRate(alugMes) {
    var r = PJ_BASE;
    if (alugMes > 62500) r += ((0.032 * alugMes - 2000) / alugMes) * 100;
    return r;
  }
  function UFAPI() {
    return window.__ITCMD_UF || null;
  }

  function calc() {
    var g = ST.ipca / 100,
      N = ST.hor,
      f = Math.pow(1 + g, N);
    var I = ST.imov,
      F = ST.inv,
      H = I + (ST.incF ? F : 0),
      R = ST.incF ? 0 : F;
    var IN = I * f,
      FN = F * f,
      TN = IN + FN,
      RN = R * f;
    var inv = INV[ST.mod],
      hcPct = (inv.h + inv.c) / 100,
      t = ST.itcmd / 100;
    var abert = ST.abert + ST.nImov * ST.cart,
      itbi = (I * ST.itbi) / 100;
    var pj = pjRate(ST.alugV),
      econAno = ST.alug ? (ST.alugV * 12 * (ST.pf - pj)) / 100 : 0;
    var contTot = 0,
      econTot = 0,
      accInv = [0],
      accSim = [abert + itbi],
      accSuc = [abert + ST.doa + itbi + H * t];
    for (var n = 1; n <= N; n++) {
      var fn = Math.pow(1 + g, n),
        cont = ST.cont * 12 * fn,
        econ = econAno * fn;
      contTot += cont;
      econTot += econ;
      accInv.push(0);
      accSim.push(accSim[0] + contTot - econTot);
      accSuc.push(accSuc[0] + contTot - econTot);
    }
    var r = {
      inv: {
        ab: 0,
        itbi: 0,
        itNow: 0,
        itEnd: TN * t,
        hc: TN * hcPct,
        cont: 0,
        econ: 0,
      },
      sim: {
        ab: abert,
        itbi: itbi,
        itNow: 0,
        itEnd: TN * t,
        hc: TN * hcPct,
        cont: contTot,
        econ: econTot,
      },
      suc: {
        ab: abert + ST.doa,
        itbi: itbi,
        itNow: H * t,
        itEnd: RN * t,
        hc: RN * hcPct,
        cont: contTot,
        econ: econTot,
      },
    };
    ["inv", "sim", "suc"].forEach(function (k) {
      var x = r[k];
      x.tr = x.itNow + x.itEnd + x.hc;
      x.tot = x.ab + x.itbi + x.tr + x.cont - x.econ;
      x.fam = TN - x.tot;
    });
    accInv[N] += r.inv.tr;
    accSim[N] += r.sim.itEnd + r.sim.hc;
    accSuc[N] += r.suc.itEnd + r.suc.hc;
    r.meta = {
      I: I,
      F: F,
      H: H,
      R: R,
      IN: IN,
      FN: FN,
      TN: TN,
      RN: RN,
      N: N,
      t: ST.itcmd,
      inv: inv,
      hcPct: hcPct * 100,
      abert: abert,
      itbi: itbi,
      pj: pj,
      econAno: econAno,
      accInv: accInv,
      accSim: accSim,
      accSuc: accSuc,
    };
    return r;
  }

  function linhas(x, m, tipo) {
    var h = "";
    h +=
      "<li>Abertura" +
      (tipo === "suc" ? " + doação das cotas" : "") +
      "<b>" +
      (x.ab > 0 ? brl(x.ab) : "—") +
      "</b></li>";
    h +=
      "<li>ITBI (" +
      pct(ST.itbi) +
      " sobre " +
      brlK(m.I) +
      ")<b>" +
      (x.itbi > 0 ? brl(x.itbi) : "—") +
      "</b></li>";
    if (tipo === "suc")
      h +=
        "<li>ITCMD hoje · doação (" +
        pct(ST.itcmd) +
        " sobre " +
        brlK(m.H) +
        ")<b>" +
        brl(x.itNow) +
        "</b></li>";
    if (x.itEnd > 0 || tipo !== "suc")
      h +=
        "<li>ITCMD no inventário · " +
        m.N +
        "º ano (" +
        pct(ST.itcmd) +
        " sobre " +
        brlK(tipo === "suc" ? m.RN : m.TN) +
        ")<b>" +
        (x.itEnd > 0 ? brl(x.itEnd) : "—") +
        "</b></li>";
    else h += "<li>ITCMD no inventário<b>—</b></li>";
    h +=
      "<li>Honorários + custas (" +
      pct(m.hcPct) +
      ", " +
      m.inv.r +
      ")<b>" +
      (x.hc > 0 ? brl(x.hc) : "—") +
      "</b></li>";
    h +=
      "<li>Contabilidade · " +
      m.N +
      " anos<b>" +
      (x.cont > 0 ? brl(x.cont) : "—") +
      "</b></li>";
    if (x.econ > 0)
      h +=
        '<li class="neg">Economia de IR sobre aluguéis<b>− ' +
        brl(x.econ) +
        "</b></li>";
    h += '<li class="tot">Desembolso total<b>' + brl(x.tot) + "</b></li>";
    return h;
  }

  function render() {
    if (!el("hkImov")) return;
    var r = calc(),
      m = r.meta;
    el("hkIpcaO").textContent = pct(ST.ipca) + " a.a.";
    el("hkItcmdO").textContent = pct(ST.itcmd);
    el("hkItbiO").textContent = pct(ST.itbi);
    el("hkPfO").textContent = pct(ST.pf);
    el("hkPjO").textContent = pct(m.pj);
    var box = el("hkAlugBox");
    if (box) box.classList.toggle("hk-off", !ST.alug);
    var sw = el("hkAlugSw");
    if (sw) sw.classList.toggle("on", ST.alug);
    var sw2 = el("hkIncFSw");
    if (sw2) sw2.classList.toggle("on", ST.incF);
    el("hkEconAno").textContent = ST.alug ? brl(m.econAno) : "—";
    el("hkEconAnoS").textContent = ST.alug
      ? pct(ST.pf) +
        " na PF contra " +
        pct(m.pj) +
        " na PJ sobre " +
        brl(ST.alugV * 12) +
        "/ano"
      : "ligue o campo acima para calcular";

    el("hkTotInv").textContent = brl(r.inv.tot);
    el("hkTotSim").textContent = brl(r.sim.tot);
    el("hkTotSuc").textContent = brl(r.suc.tot);
    el("hkListInv").innerHTML = linhas(r.inv, m, "inv");
    el("hkListSim").innerHTML = linhas(r.sim, m, "sim");
    el("hkListSuc").innerHTML = linhas(r.suc, m, "suc");
    var best = [
      ["inv", r.inv.tot],
      ["sim", r.sim.tot],
      ["suc", r.suc.tot],
    ].sort(function (a, b) {
      return a[1] - b[1];
    })[0][0];
    [
      ["inv", "hkRInv"],
      ["sim", "hkRSim"],
      ["suc", "hkRSuc"],
    ].forEach(function (p) {
      var card = el(p[1]);
      if (!card) return;
      var old = card.querySelector(".hk-best");
      if (old) old.remove();
      if (p[0] === best) {
        var b = document.createElement("span");
        b.className = "hk-best";
        b.textContent = "menor custo";
        card.appendChild(b);
      }
    });

    el("hkKAb").textContent = brl(m.abert);
    el("hkKAbS").textContent =
      brl(ST.abert) +
      " de abertura + " +
      ST.nImov +
      " × " +
      brl(ST.cart) +
      " de cartório" +
      (ST.doa > 0 ? " · +" + brl(ST.doa) + " na doação" : "");
    el("hkKItbi").textContent = brl(m.itbi);
    el("hkKItbiS").textContent =
      pct(ST.itbi) + " sobre " + brlK(m.I) + " em imóveis";
    el("hkKTrSuc").textContent = brl(r.suc.tr);
    el("hkKTrSucS").textContent =
      "ITCMD de " +
      brlK(r.suc.itNow) +
      " hoje" +
      (r.suc.itEnd + r.suc.hc > 0
        ? " + " +
          brlK(r.suc.itEnd + r.suc.hc) +
          " no inventário do que ficou fora"
        : " · nada no inventário");
    el("hkKTrInv").textContent = brl(r.inv.tr);
    el("hkKTrInvS").textContent =
      "no " +
      m.N +
      "º ano, sobre " +
      brlK(m.TN) +
      " corrigidos: ITCMD " +
      brlK(r.inv.itEnd) +
      " + honorários e custas " +
      brlK(r.inv.hc);
    el("hkKEcon").textContent = ST.alug ? brl(r.sim.econ) : "—";
    el("hkKEconS").textContent = ST.alug
      ? brl(m.econAno) + " por ano, corrigido, em " + m.N + " anos"
      : "sem aluguel informado";
    el("hkKFamInv").textContent = brl(r.inv.fam);
    el("hkKFamInvS").textContent = brlK(m.TN) + " − " + brlK(r.inv.tot);
    el("hkKFamSim").textContent = brl(r.sim.fam);
    el("hkKFamSimS").textContent = brlK(m.TN) + " − " + brlK(r.sim.tot);
    el("hkKFamSuc").textContent = brl(r.suc.fam);
    el("hkKFamSucS").textContent = brlK(m.TN) + " − " + brlK(r.suc.tot);

    var rows = [
      [
        "Abertura (advogado, contador, Junta, cartório)",
        r.inv.ab,
        r.sim.ab - 0,
        r.suc.ab - ST.doa,
      ],
      ["Doação das cotas (escritura e cláusulas)", 0, 0, ST.doa],
      [
        "ITBI na integralização (" + pct(ST.itbi) + ")",
        r.inv.itbi,
        r.sim.itbi,
        r.suc.itbi,
      ],
      ["ITCMD hoje, na doação (" + pct(ST.itcmd) + ")", 0, 0, r.suc.itNow],
      [
        "ITCMD no inventário, " + m.N + "º ano (" + pct(ST.itcmd) + ")",
        r.inv.itEnd,
        r.sim.itEnd,
        r.suc.itEnd,
      ],
      [
        "Honorários + custas do inventário (" + pct(m.hcPct) + ")",
        r.inv.hc,
        r.sim.hc,
        r.suc.hc,
      ],
      ["Contabilidade · " + m.N + " anos", r.inv.cont, r.sim.cont, r.suc.cont],
    ];
    var h = "";
    rows.forEach(function (rw) {
      h +=
        "<tr><td>" +
        rw[0] +
        '</td><td class="r">' +
        (rw[1] > 0 ? brl(rw[1]) : "—") +
        '</td><td class="r">' +
        (rw[2] > 0 ? brl(rw[2]) : "—") +
        '</td><td class="r">' +
        (rw[3] > 0 ? brl(rw[3]) : "—") +
        "</td></tr>";
    });
    if (ST.alug)
      h +=
        "<tr><td>Economia de IR sobre aluguéis · " +
        m.N +
        ' anos</td><td class="r">—</td><td class="r neg">− ' +
        brl(r.sim.econ) +
        '</td><td class="r neg">− ' +
        brl(r.suc.econ) +
        "</td></tr>";
    h +=
      '<tr class="tot"><td>Desembolso total</td><td class="r">' +
      brl(r.inv.tot) +
      '</td><td class="r">' +
      brl(r.sim.tot) +
      '</td><td class="r">' +
      brl(r.suc.tot) +
      "</td></tr>";
    h +=
      "<tr><td>Fica para a família no " +
      m.N +
      'º ano <span class="mini">patrimônio corrigido de ' +
      brl(m.TN) +
      ' menos o desembolso</span></td><td class="r">' +
      brl(r.inv.fam) +
      '</td><td class="r">' +
      brl(r.sim.fam) +
      '</td><td class="r">' +
      brl(r.suc.fam) +
      "</td></tr>";
    el("hkTbody").innerHTML = h;

    var pr = el("hkPrem");
    if (pr)
      pr.innerHTML =
        "<i>Im&oacute;veis <b>" +
        brl(ST.imov) +
        "</b> (" +
        ST.nImov +
        ")</i><i>Investido <b>" +
        brl(ST.inv) +
        "</b>" +
        (ST.incF ? " · na holding" : " · fora da holding") +
        "</i>" +
        "<i>ITCMD <b>" +
        pct(ST.itcmd) +
        "</b> · " +
        ST.uf +
        "</i><i>ITBI <b>" +
        pct(ST.itbi) +
        "</b></i><i>Invent&aacute;rio <b>" +
        m.inv.r +
        "</b></i>" +
        "<i>Abertura <b>" +
        brl(m.abert) +
        "</b> · doa&ccedil;&atilde;o <b>" +
        brl(ST.doa) +
        "</b> · contabilidade <b>" +
        brl(ST.cont) +
        "/m&ecirc;s</b></i>" +
        "<i>Horizonte <b>" +
        m.N +
        " anos</b> · IPCA <b>" +
        pct(ST.ipca) +
        "</b></i>" +
        (ST.alug
          ? "<i>Aluguel <b>" + brl(ST.alugV) + "/m&ecirc;s</b></i>"
          : "");

    grafico(r);
  }

  function grafico(r) {
    if (typeof Chart === "undefined") return;
    var cb = el("hkChartBar"),
      ca = el("hkChartAcc");
    if (!cb || !ca) return;
    if (CHB) {
      CHB.destroy();
      CHB = null;
    }
    if (CHA) {
      CHA.destroy();
      CHA = null;
    }
    var m = r.meta,
      leg = {
        labels: {
          color: "#C2CBF0",
          font: { family: "Manrope", size: 10.5 },
          boxWidth: 12,
        },
      },
      grid = { color: "rgba(120,130,210,.14)" };
    var ds = [
      {
        label: "Abertura + doação",
        data: [r.inv.ab, r.sim.ab, r.suc.ab],
        backgroundColor: "#5B8DEF",
      },
      {
        label: "ITBI",
        data: [r.inv.itbi, r.sim.itbi, r.suc.itbi],
        backgroundColor: "#8a93d8",
      },
      {
        label: "ITCMD hoje (doação)",
        data: [0, 0, r.suc.itNow],
        backgroundColor: "#F26522",
      },
      {
        label: "ITCMD no inventário",
        data: [r.inv.itEnd, r.sim.itEnd, r.suc.itEnd],
        backgroundColor: "#F5B942",
      },
      {
        label: "Honorários + custas",
        data: [r.inv.hc, r.sim.hc, r.suc.hc],
        backgroundColor: "#FF5566",
      },
      {
        label: "Contabilidade",
        data: [0, r.sim.cont, r.suc.cont],
        backgroundColor: "#AFC1F7",
      },
    ];
    if (ST.alug)
      ds.push({
        label: "Economia IR aluguéis",
        data: [0, -r.sim.econ, -r.suc.econ],
        backgroundColor: "#2BD9A6",
      });
    CHB = new Chart(cb.getContext("2d"), {
      type: "bar",
      data: {
        labels: ["Sem holding", "Holding simples", "Holding p/ sucessão"],
        datasets: ds,
      },
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
              font: { family: "Sora", weight: "800", size: 11 },
            },
            grid: { display: false },
          },
        },
      },
    });
    var anos = [];
    for (var n = 0; n <= m.N; n++) anos.push(n);
    CHA = new Chart(ca.getContext("2d"), {
      type: "line",
      data: {
        labels: anos,
        datasets: [
          {
            label: "Sem holding",
            data: m.accInv,
            borderColor: "#F5B942",
            backgroundColor: "rgba(245,185,66,.10)",
            fill: true,
            tension: 0.1,
            pointRadius: 0,
            borderWidth: 2.5,
            borderDash: [6, 4],
          },
          {
            label: "Holding simples",
            data: m.accSim,
            borderColor: "#5B8DEF",
            backgroundColor: "rgba(91,141,239,.12)",
            fill: true,
            tension: 0.1,
            pointRadius: 0,
            borderWidth: 2.5,
          },
          {
            label: "Holding p/ sucessão",
            data: m.accSuc,
            borderColor: "#F26522",
            backgroundColor: "rgba(242,101,34,.12)",
            fill: true,
            tension: 0.1,
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
            text: "Quando o dinheiro sai do bolso (acumulado)",
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

  function aplicaUf() {
    var api = UFAPI();
    var nota = el("hkUfNota");
    if (!api) {
      if (nota)
        nota.textContent =
          "tabela por estado indisponível — ajuste o ITCMD na faixa";
      return;
    }
    var base = ST.imov + ST.inv,
      ef = api.calc(base, ST.uf).ef;
    ST.itcmd = Math.round(ef * 4) / 4;
    var sl = el("hkItcmd");
    if (sl) sl.value = ST.itcmd;
    if (nota)
      nota.textContent =
        ST.uf +
        ": " +
        api.faixa(ST.uf) +
        " · efetivo " +
        pct(ef) +
        " sobre " +
        brlK(base) +
        (api.tab[ST.uf].c === "conf" ? " · não confirmado" : "");
  }

  function bind() {
    var raiz = el("hkImov");
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
    function num(id, k, fn) {
      on(id, "input", function () {
        ST[k] = Math.max(0, parseFloat(this.value) || 0);
        if (fn) fn();
        render();
      });
    }
    var sel = el("hkUf"),
      api = UFAPI();
    if (sel && !sel.options.length && api) {
      api.ufs.forEach(function (u) {
        var o = document.createElement("option");
        o.value = u;
        o.textContent = u + " — " + api.faixa(u);
        if (u === ST.uf) o.selected = true;
        sel.appendChild(o);
      });
    }
    num("hkImov", "imov", aplicaUf);
    num("hkNImov", "nImov");
    num("hkInv", "inv", aplicaUf);
    on("hkIncF", "change", function () {
      ST.incF = this.checked;
      render();
    });
    on("hkHor", "change", function () {
      ST.hor = +this.value;
      render();
    });
    on("hkIpca", "input", function () {
      ST.ipca = +this.value;
      render();
    });
    on("hkUf", "change", function () {
      ST.uf = this.value;
      aplicaUf();
      render();
    });
    on("hkItcmd", "input", function () {
      ST.itcmd = +this.value;
      var n = el("hkUfNota");
      if (n && api)
        n.textContent =
          ST.uf +
          ": " +
          api.faixa(ST.uf) +
          " · ajustado na faixa para " +
          pct(ST.itcmd);
      render();
    });
    on("hkItbi", "input", function () {
      ST.itbi = +this.value;
      render();
    });
    on("hkMod", "change", function () {
      ST.mod = this.value;
      render();
    });
    num("hkAbert", "abert");
    num("hkCart", "cart");
    num("hkDoa", "doa");
    num("hkCont", "cont");
    on("hkAlug", "change", function () {
      ST.alug = this.checked;
      render();
    });
    num("hkAlugV", "alugV");
    on("hkPf", "input", function () {
      ST.pf = +this.value;
      render();
    });
    on("hkPngBtn", "click", function () {
      var alvo = document.querySelector("#p-holdingcalc .hc-sec");
      if (!alvo) return;
      var painel = el("p-holdingcalc"),
        btn = this,
        txt = btn.textContent;
      btn.textContent = "Gerando...";
      function limpa() {
        painel.classList.remove("wl-print");
        btn.textContent = txt;
      }
      function go(h2c) {
        painel.classList.add("wl-print");
        h2c(alvo, { backgroundColor: "#0A0E3F", scale: 2, useCORS: true })
          .then(function (cv) {
            limpa();
            if (window.mostrarPngModal)
              window.mostrarPngModal(
                cv.toDataURL("image/png"),
                "holding-patrimonial.png",
                { accent: "#F26522", wide: true },
              );
            else {
              var a = document.createElement("a");
              a.download = "holding-patrimonial.png";
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
        limpa();
      };
      document.head.appendChild(sc);
    });
    aplicaUf();
    render();
  }
  if (document.readyState === "loading") {
    queueMicrotask(bind);
  } else {
    bind();
  }
  window._toolInit = window._toolInit || {};
  window._toolInit["holdingcalc"] = function () {
    try {
      bind();
    } catch (e) {}
  };
})();
