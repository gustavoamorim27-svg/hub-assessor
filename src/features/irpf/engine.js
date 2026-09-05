// Migrated from Hub v1. Review domain assumptions separately from interface changes.

(function () {
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
    n = Number(n) || 0;
    return n.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  function fq(n) {
    n = Number(n) || 0;
    return n.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
  }
  function el(id) {
    return document.getElementById(id);
  }
  var ST = {
    conta: "",
    comp: "",
    acoes: [],
    fiis: [],
    aliqA: 15,
    aliqF: 20,
    isen: 20000,
    prejA: 0,
    prejF: 0,
  };
  window.__IRST = ST;
  function idxOf(arr, names) {
    for (var i = 0; i < arr.length; i++) {
      for (var j = 0; j < names.length; j++) {
        if (arr[i] === names[j]) return i;
      }
    }
    return -1;
  }
  function defComp() {
    var d = new Date();
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2);
  }
  function lastBizDayNextMonth(comp) {
    // Estimated date: excludes weekends, but not bank holidays. Confirm in Sicalc/ReVar.
    var venc = window.hubFinance.lastWeekdayOfNextMonth(comp);
    return (
      ("0" + venc.getDate()).slice(-2) +
      "/" +
      ("0" + (venc.getMonth() + 1)).slice(-2) +
      "/" +
      venc.getFullYear()
    );
  }
  function parseWB(wb) {
    var ws = wb.Sheets[wb.SheetNames[0]];
    var rows = XLSX.utils.sheet_to_json(ws, {
      header: 1,
      raw: false,
      defval: null,
    });
    var conta = "",
      tipo = null,
      cmap = null,
      acoes = [],
      fiis = [];
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i] || [];
      var c0 = (r[0] == null ? "" : String(r[0])).trim();
      if (!conta) {
        for (var k = 0; k < r.length; k++) {
          var cc = r[k] == null ? "" : String(r[k]);
          var mm = cc.match(/conta[:\s]*([0-9]{4,})/i);
          if (mm) {
            conta = mm[1];
            break;
          }
        }
      }
      var m = c0.match(/^\s*[\d.,]+%\|(.+)/);
      if (m) {
        var nm = m[1].trim().toLowerCase();
        if (
          nm.indexOf("ações") >= 0 ||
          nm.indexOf("acoes") >= 0 ||
          nm === "ações"
        )
          tipo = "acao";
        else if (nm.indexOf("imobili") >= 0 || nm.indexOf("fii") >= 0)
          tipo = "fii";
        else tipo = null;
        cmap = null;
        continue;
      }
      var low = r.map(function (x) {
        return (x == null ? "" : String(x)).trim().toLowerCase();
      });
      if (
        low.indexOf("ativo") >= 0 &&
        (low.indexOf("preço médio") >= 0 || low.indexOf("preco medio") >= 0)
      ) {
        cmap = {
          qtd: idxOf(low, ["qtd. total", "qtd total"]),
          pm: idxOf(low, ["preço médio", "preco medio"]),
          cot: idxOf(low, ["última cotação", "ultima cotacao"]),
          pos: idxOf(low, ["posição", "posicao"]),
        };
        continue;
      }
      if (
        tipo &&
        cmap &&
        c0 &&
        c0.toLowerCase() !== "ativo" &&
        c0.indexOf("%|") < 0
      ) {
        var qtd = pn(r[cmap.qtd]),
          pm = pn(r[cmap.pm]),
          cot = pn(r[cmap.cot]);
        if (qtd > 0) {
          (tipo === "acao" ? acoes : fiis).push({
            tk: c0,
            qtd: qtd,
            pm: pm,
            cot: cot,
            vq: qtd,
            vp: cot,
          });
        }
      }
    }
    return { conta: conta, acoes: acoes, fiis: fiis };
  }
  function rowsHTML(list, tipo) {
    if (!list.length)
      return '<tr><td colspan="6" style="text-align:center;color:var(--mu)">Nenhum ativo nesta classe.</td></tr>';
    return list
      .map(function (o, ix) {
        var g = (o.vp - o.pm) * o.vq;
        var gc = g >= 0 ? "ir-g-pos" : "ir-g-neg";
        return (
          "<tr>" +
          '<td class="tk">' +
          o.tk +
          "</td>" +
          "<td>" +
          fq(o.qtd) +
          "</td>" +
          '<td><input data-t="' +
          tipo +
          '" data-i="' +
          ix +
          '" data-f="pm" value="' +
          fmt(o.pm) +
          '"></td>' +
          '<td><input data-t="' +
          tipo +
          '" data-i="' +
          ix +
          '" data-f="vq" value="' +
          fq(o.vq) +
          '"></td>' +
          '<td><input data-t="' +
          tipo +
          '" data-i="' +
          ix +
          '" data-f="vp" value="' +
          fmt(o.vp) +
          '"></td>' +
          '<td class="' +
          gc +
          '">' +
          fmt(g) +
          "</td>" +
          "</tr>"
        );
      })
      .join("");
  }
  function tableHTML(list, tipo, titulo, cor) {
    return (
      '<div class="ir-sec"><span class="ir-dot" style="background:' +
      cor +
      '"></span>' +
      titulo +
      "</div>" +
      '<table class="ir-tbl"><thead><tr><th>Ativo</th><th>Qtd</th><th>Preco medio</th><th>Vender qtd</th><th>Preco venda</th><th>Ganho (R$)</th></tr></thead>' +
      "<tbody>" +
      rowsHTML(list, tipo) +
      "</tbody></table>"
    );
  }
  function calc() {
    function agg(list) {
      var vendas = 0,
        ganho = 0;
      list.forEach(function (o) {
        var g = (o.vp - o.pm) * o.vq;
        ganho += g;
        vendas += o.vp * o.vq;
      });
      return { vendas: vendas, ganho: ganho };
    }
    var A = agg(ST.acoes),
      F = agg(ST.fiis);
    var isentoA = A.vendas > 0 && A.vendas <= ST.isen;
    function bucket(ganho, prej) {
      var base, carry;
      if (ganho >= 0) {
        var u = Math.min(prej, ganho);
        base = ganho - u;
        carry = prej - u;
      } else {
        base = 0;
        carry = prej + -ganho;
      }
      return { base: base, carry: carry };
    }
    var bA = isentoA ? { base: 0, carry: ST.prejA } : bucket(A.ganho, ST.prejA);
    var bF = bucket(F.ganho, ST.prejF);
    var irA = (bA.base * ST.aliqA) / 100,
      irF = (bF.base * ST.aliqF) / 100;
    var darf = irA + irF;
    return {
      A: A,
      F: F,
      isentoA: isentoA,
      bA: bA,
      bF: bF,
      irA: irA,
      irF: irF,
      darf: darf,
    };
  }
  function render() {
    var c = calc();
    var isen = c.isentoA
      ? '<span class="ir-isento">ISENTO (vendas &le; ' +
        fmt(ST.isen) +
        ")</span>"
      : "";
    var minNote =
      c.darf > 0 && c.darf < 10
        ? '<div class="ir-note">DARF abaixo do minimo de R$ 10,00 - nao recolhido neste mes.</div>'
        : "";
    var venc = ST.comp ? lastBizDayNextMonth(ST.comp) : "-";
    var h = "";
    h +=
      '<div class="ir-params">' +
      fld("Cliente / Conta", "conta", "text", ST.conta) +
      fld("Competencia (mes da venda)", "comp", "month", ST.comp) +
      fld("Aliquota acoes (%)", "aliqA", "num", ST.aliqA) +
      fld("Aliquota FIIs (%)", "aliqF", "num", ST.aliqF) +
      fld("Limite isencao acoes (R$)", "isen", "num", ST.isen) +
      fld("Prejuizo acum. acoes (R$)", "prejA", "num", ST.prejA) +
      fld("Prejuizo acum. FIIs (R$)", "prejF", "num", ST.prejF) +
      "</div>";
    h += tableHTML(
      ST.acoes,
      "acao",
      "Acoes (mercado a vista)" + isen,
      "#5B8DEF",
    );
    h += tableHTML(ST.fiis, "fii", "FIIs (Fundos Imobiliarios)", "#F26522");
    h +=
      '<div class="ir-cards">' +
      card("Vendas de acoes no mes", "R$ " + fmt(c.A.vendas)) +
      card("Ganho liquido acoes", "R$ " + fmt(c.A.ganho)) +
      card(
        "IR acoes (" + ST.aliqA + "%)",
        c.isentoA ? "Isento" : "R$ " + fmt(c.irA),
      ) +
      card("Ganho liquido FIIs", "R$ " + fmt(c.F.ganho)) +
      card("IR FIIs (" + ST.aliqF + "%)", "R$ " + fmt(c.irF)) +
      cardDarf(
        "DARF total (cod. 6015)",
        "R$ " + fmt(c.darf),
        "Vencimento estimado " + venc + " (confira feriados)",
      ) +
      "</div>" +
      minNote +
      '<div class="ir-note">Prejuizo a compensar no proximo mes: acoes R$ ' +
      fmt(c.bA.carry) +
      " - FIIs R$ " +
      fmt(c.bF.carry) +
      ".</div>";
    el("irBody").innerHTML = h;
    el("irBody").style.display = "block";
    el("irDisc").style.display = "block";
    el("irPng").style.display = "";
    bind();
  }
  function fld(lbl, f, type, val) {
    var t = type === "month" ? "month" : type === "text" ? "text" : "text";
    return (
      '<div class="ir-fld"><label>' +
      lbl +
      '</label><input data-p="' +
      f +
      '" type="' +
      t +
      '" value="' +
      (val === "" ? "" : val) +
      '"></div>'
    );
  }
  function card(k, v) {
    return (
      '<div class="ir-card"><div class="k">' +
      k +
      '</div><div class="v">' +
      v +
      "</div></div>"
    );
  }
  function cardDarf(k, v, sub) {
    return (
      '<div class="ir-card darf"><div class="k">' +
      k +
      '</div><div class="v">' +
      v +
      '</div><div class="ir-note">' +
      sub +
      "</div></div>"
    );
  }
  function bind() {
    Array.prototype.forEach.call(
      document.querySelectorAll("#irBody .ir-fld input"),
      function (inp) {
        inp.oninput = function () {
          var f = inp.getAttribute("data-p");
          if (f === "conta") {
            ST.conta = inp.value;
          } else if (f === "comp") {
            ST.comp = inp.value;
            reSummary();
          } else {
            ST[f] = pn(inp.value);
            reSummary();
          }
        };
      },
    );
    Array.prototype.forEach.call(
      document.querySelectorAll("#irBody .ir-tbl input"),
      function (inp) {
        inp.oninput = function () {
          var t = inp.getAttribute("data-t"),
            i = +inp.getAttribute("data-i"),
            f = inp.getAttribute("data-f");
          var arr = t === "acao" ? ST.acoes : ST.fiis;
          arr[i][f] = pn(inp.value);
          reRow(inp, arr[i]);
          reSummary();
        };
      },
    );
  }
  function reRow(inp, o) {
    var tr = inp.closest("tr");
    var g = (o.vp - o.pm) * o.vq;
    var td = tr.lastElementChild;
    td.textContent = fmt(g);
    td.className = g >= 0 ? "ir-g-pos" : "ir-g-neg";
  }
  function reSummary() {
    render();
  }
  function genPng() {
    var c = calc();
    var venc = ST.comp ? lastBizDayNextMonth(ST.comp) : "-";
    function secRows(list) {
      return list
        .filter(function (o) {
          return o.vq > 0;
        })
        .map(function (o) {
          var g = (o.vp - o.pm) * o.vq;
          return (
            "<tr><td>" +
            o.tk +
            '</td><td style="text-align:right">' +
            fq(o.vq) +
            '</td><td style="text-align:right">' +
            fmt(o.pm) +
            '</td><td style="text-align:right">' +
            fmt(o.vp) +
            '</td><td style="text-align:right;color:' +
            (g >= 0 ? "#0a7a45" : "#c0392b") +
            '">' +
            fmt(g) +
            "</td></tr>"
          );
        })
        .join("");
    }
    var compTxt = ST.comp
      ? ST.comp.split("-")[1] + "/" + ST.comp.split("-")[0]
      : "-";
    var html =
      '<!doctype html><html><head><meta charset="utf-8"><title>Apuracao IR - ' +
      (ST.conta || "cliente") +
      "</title><style>" +
      "body{font-family:Arial,Helvetica,sans-serif;color:#12162a;margin:0;padding:34px 40px;background:#fff;}" +
      "h1{font-family:Georgia,serif;color:#F26522;margin:0;font-size:24px;}" +
      ".sub{color:#5b6485;font-size:12px;margin:3px 0 18px;}" +
      ".bar{background:#f2f4f8;border:1px solid #e3e7f0;border-radius:10px;padding:10px 14px;font-size:13px;margin-bottom:16px;}" +
      "h2{font-size:14px;margin:18px 0 8px;color:#0b1033;}" +
      "table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:8px;}" +
      "th{background:#0b1033;color:#fff;font-size:10px;text-transform:uppercase;padding:7px 8px;text-align:right;}" +
      "th:first-child{text-align:left;} td{padding:6px 8px;border-bottom:1px solid #eee;} td:first-child{font-weight:bold;}" +
      ".cards{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0;}" +
      ".cd{flex:1;min-width:150px;background:#f2f4f8;border:1px solid #e3e7f0;border-radius:10px;padding:12px 14px;}" +
      ".cd .k{font-size:10px;text-transform:uppercase;color:#5b6485;font-weight:bold;} .cd .v{font-size:20px;font-weight:bold;color:#0b1033;margin-top:4px;}" +
      ".darf{border-color:#F26522;} .darf .v{color:#F26522;}" +
      ".disc{font-size:10px;color:#7a82a6;line-height:1.5;margin-top:16px;border-top:1px solid #eee;padding-top:10px;}" +
      "</style></head><body>" +
      '<h1>rico</h1><div class="sub">Apuracao de IR - Renda Variavel - Competencia ' +
      compTxt +
      " - Conta " +
      (ST.conta || "-") +
      "</div>" +
      '<div class="bar"><b>Resumo:</b> ' +
      (c.isentoA
        ? "Vendas de acoes isentas (&le; R$ " + fmt(ST.isen) + " no mes). "
        : "") +
      "DARF total <b>R$ " +
      fmt(c.darf) +
      "</b> (codigo 6015), vencimento " +
      venc +
      ".</div>" +
      (ST.acoes.length
        ? "<h2>Acoes</h2><table><tr><th>Ativo</th><th>Qtd vendida</th><th>Preco medio</th><th>Preco venda</th><th>Ganho</th></tr>" +
          secRows(ST.acoes) +
          "</table>"
        : "") +
      (ST.fiis.length
        ? "<h2>FIIs</h2><table><tr><th>Ativo</th><th>Qtd vendida</th><th>Preco medio</th><th>Preco venda</th><th>Ganho</th></tr>" +
          secRows(ST.fiis) +
          "</table>"
        : "") +
      '<div class="cards">' +
      '<div class="cd"><div class="k">Ganho acoes</div><div class="v">R$ ' +
      fmt(c.A.ganho) +
      "</div></div>" +
      '<div class="cd"><div class="k">IR acoes</div><div class="v">' +
      (c.isentoA ? "Isento" : "R$ " + fmt(c.irA)) +
      "</div></div>" +
      '<div class="cd"><div class="k">Ganho FIIs</div><div class="v">R$ ' +
      fmt(c.F.ganho) +
      "</div></div>" +
      '<div class="cd"><div class="k">IR FIIs</div><div class="v">R$ ' +
      fmt(c.irF) +
      "</div></div>" +
      '<div class="cd darf"><div class="k">DARF total (6015)</div><div class="v">R$ ' +
      fmt(c.darf) +
      "</div></div>" +
      "</div>" +
      '<div class="disc">Material de apoio comercial - estimativa sobre venda das posicoes informadas. Acoes a vista: isencao se vendas do mes &le; limite; senao ' +
      ST.aliqA +
      "% sobre o ganho liquido. FIIs: " +
      ST.aliqF +
      "% sem isencao. Compensacao de prejuizo por balde. Vencimento: ultimo dia util do mes seguinte (sem feriados). Nao inclui day trade, custos operacionais nem eventos societarios. Nao constitui recomendacao. Sujeito a alteracoes na legislacao.</div>" +
      "<scr" +
      "ipt>setTimeout(function(){window.print();},350);</scr" +
      "ipt></body></html>";
    var w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
  }
  function onFile(f) {
    var st = el("irStatus");
    st.className = "ir-status";
    st.textContent = "Lendo arquivo...";
    var rd = new FileReader();
    rd.onload = function (e) {
      try {
        var data = new Uint8Array(e.target.result);
        var wb = XLSX.read(data, { type: "array" });
        var r = parseWB(wb);
        if (!r.acoes.length && !r.fiis.length) {
          st.className = "ir-status err";
          st.textContent =
            "Nao encontrei Acoes nem FIIs com preco medio/quantidade neste arquivo.";
          return;
        }
        ST.conta = r.conta || ST.conta;
        ST.acoes = r.acoes;
        ST.fiis = r.fiis;
        if (!ST.comp) ST.comp = defComp();
        st.className = "ir-status ok";
        st.textContent =
          "Importado: " +
          r.acoes.length +
          " acao(oes) e " +
          r.fiis.length +
          " FII(s).";
        render();
      } catch (err) {
        console.error(err);
        st.className = "ir-status err";
        st.textContent =
          "Erro ao ler o arquivo. Confira se e a Posicao Consolidada (.xlsx).";
      }
    };
    rd.readAsArrayBuffer(f);
  }
  function irBind() {
    var drop = el("irDrop"),
      file = el("irFile"),
      pick = el("irPick");
    if (!drop || drop.__bound) return;
    drop.__bound = true;
    pick.onclick = function () {
      file.click();
    };
    file.onchange = function () {
      if (file.files[0]) onFile(file.files[0]);
    };
    drop.ondragover = function (e) {
      e.preventDefault();
      drop.classList.add("drag");
    };
    drop.ondragleave = function () {
      drop.classList.remove("drag");
    };
    drop.ondrop = function (e) {
      e.preventDefault();
      drop.classList.remove("drag");
      if (e.dataTransfer.files && e.dataTransfer.files[0])
        onFile(e.dataTransfer.files[0]);
    };
    el("irPng").onclick = genPng;
  }
  if (document.readyState === "loading") {
    queueMicrotask(irBind);
  } else {
    irBind();
  }
  window._toolInit = window._toolInit || {};
  window._toolInit["irpf"] = irBind;
})();
