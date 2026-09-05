// Migrated from Hub v1. Review domain assumptions separately from interface changes.

(function () {
  var _done = false;
  window._toolInit["comparador"] = function () {
    if (_done) return;
    _done = true;
    (function () {
      /* ===================== Identidade ===================== */
      var RICO_SVG = "rico";
      var LINE_COLORS = [
        "#F26522",
        "#34D399",
        "#38BDF8",
        "#FBBF24",
        "#A78BFA",
        "#F472B6",
      ];
      var HORIZONS = [
        0.5, 1, 2, 3, 5, 10,
      ]; /* anos (fracionário): 6m/1a/2a/3a/5a/10a — alcança todas as faixas de IR */
      function hzLabel(x) {
        if (x < 1) return Math.round(x * 12) + " meses";
        return x === 1 ? "1 ano" : x + " anos";
      }
      var PRESETS = [
        {
          label: "CDB 100% CDI",
          g: "rf",
          nome: "CDB 100% CDI",
          indexador: "cdi",
          taxa: 100,
          tributacao: "tributado",
        },
        {
          label: "LCI/LCA 90% CDI",
          g: "rf",
          nome: "LCA 90% CDI",
          indexador: "cdi",
          taxa: 90,
          tributacao: "isento",
        },
        {
          label: "Caixinha Nubank",
          g: "rf",
          nome: "Caixinha Nubank",
          indexador: "cdi",
          taxa: 100,
          tributacao: "tributado",
        },
        {
          label: "Tesouro Selic",
          g: "rf",
          nome: "Tesouro Selic",
          indexador: "cdi",
          taxa: 100,
          tributacao: "tributado",
        },
        {
          label: "Prefixado",
          g: "rf",
          nome: "CDB Prefixado",
          indexador: "pre",
          taxa: 14.2,
          tributacao: "tributado",
        },
        {
          label: "IPCA+",
          g: "rf",
          nome: "Tesouro IPCA+",
          indexador: "ipca",
          taxa: 6.5,
          tributacao: "tributado",
        },
        /* Indices de mercado — media historica NOMINAL (a.a.). Valores editaveis: confira antes de usar com cliente. */
        {
          label: "Ibovespa (hist.)",
          g: "rv",
          nome: "Ibovespa · hist. ~10% a.a. nominal",
          indexador: "pre",
          taxa: 10,
          tributacao: "tributado",
        },
        {
          label: "S&P 500 (hist.)",
          g: "rv",
          nome: "S&P 500 · 11,85% a.a. (50 anos, div. reinvestidos, US$)",
          indexador: "pre",
          taxa: 11.85,
          tributacao: "tributado",
        },
        {
          label: "IFIX (hist.)",
          g: "rv",
          nome: "IFIX · hist. ~10,5% a.a. (retorno total)",
          indexador: "pre",
          taxa: 10.5,
          tributacao: "isento",
        },
        /* Carteiras do proprio Hub — usa o % do CDI estimado de cada perfil */
        {
          label: "Carteira Conservadora",
          g: "cart",
          nome: "Carteira Conservadora",
          indexador: "cdi",
          taxa: 108,
          tributacao: "isento",
        },
        {
          label: "Carteira Moderada",
          g: "cart",
          nome: "Carteira Moderada",
          indexador: "cdi",
          taxa: 113,
          tributacao: "isento",
        },
        {
          label: "Carteira Sofisticada",
          g: "cart",
          nome: "Carteira Sofisticada",
          indexador: "cdi",
          taxa: 120,
          tributacao: "isento",
        },
        {
          label: "Poupança",
          g: "rf",
          nome: "Poupança",
          indexador: "poupanca",
          taxa: 0,
          tributacao: "isento",
        },
      ];

      /* ===================== Estado ===================== */
      var state = {
        cdi: 14.25,
        ipca: 4.9,
        aporte: 10000,
        horizon: 5,
        showReal: false,
        mode: "editar",
        titulo: "Comparativo de rentabilidade",
        assets: [
          {
            id: 1,
            nome: "CDB 100% CDI",
            indexador: "cdi",
            taxa: 100,
            tributacao: "tributado",
          },
          {
            id: 2,
            nome: "LCA 90% CDI",
            indexador: "cdi",
            taxa: 90,
            tributacao: "isento",
          },
        ],
        nextId: 3,
      };

      /* ===================== Helpers ===================== */
      function brl0(v) {
        return (v || 0).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
          maximumFractionDigits: 0,
        });
      }
      function pct(v, d) {
        d = d == null ? 2 : d;
        return (
          (v * 100).toLocaleString("pt-BR", {
            minimumFractionDigits: d,
            maximumFractionDigits: d,
          }) + "%"
        );
      }
      function n(v) {
        var x = Number(String(v).replace(",", "."));
        return isFinite(x) ? x : 0;
      }
      function esc(s) {
        return String(s)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");
      }

      function irRate(days) {
        if (days <= 180) return 0.225;
        if (days <= 360) return 0.2;
        if (days <= 720) return 0.175;
        return 0.15;
      }
      function grossAnnual(a, cdi, ipca) {
        if (a.indexador === "cdi") return (cdi / 100) * (a.taxa / 100);
        if (a.indexador === "cdimais") return cdi / 100 + a.taxa / 100;
        if (a.indexador === "pre") return a.taxa / 100;
        if (a.indexador === "ipca")
          return (1 + ipca / 100) * (1 + a.taxa / 100) - 1;
        if (a.indexador === "poupanca")
          return cdi > 8.5 ? Math.pow(1.005, 12) - 1 : 0.7 * (cdi / 100);
        return 0;
      }
      function isIsento(a) {
        return a.indexador === "poupanca" || a.tributacao === "isento";
      }
      function netFV(a, t, aporte, cdi, ipca) {
        var g = grossAnnual(a, cdi, ipca);
        var fv = aporte * Math.pow(1 + g, t);
        var ir = isIsento(a) ? 0 : irRate(t * 360);
        return aporte + (fv - aporte) * (1 - ir);
      }
      function taxaLabel(a) {
        if (a.indexador === "cdi")
          return n(a.taxa).toLocaleString("pt-BR") + "% do CDI";
        if (a.indexador === "cdimais")
          return "CDI + " + n(a.taxa).toLocaleString("pt-BR") + "%";
        if (a.indexador === "pre")
          return n(a.taxa).toLocaleString("pt-BR") + "% pré a.a.";
        if (a.indexador === "ipca")
          return "IPCA + " + n(a.taxa).toLocaleString("pt-BR") + "%";
        if (a.indexador === "poupanca") return "Poupança";
        return "";
      }

      /* ===================== Cálculo ===================== */
      function compute() {
        var s = state;
        var results = s.assets.map(function (a, i) {
          var g = grossAnnual(a, s.cdi, s.ipca);
          var fv = netFV(a, s.horizon, s.aporte, s.cdi, s.ipca);
          var netAnnual = Math.pow(fv / s.aporte, 1 / s.horizon) - 1;
          var real = fv / Math.pow(1 + s.ipca / 100, s.horizon);
          var equivCDI = (netAnnual / (s.cdi / 100)) * 100;
          return Object.assign({}, a, {
            color: LINE_COLORS[i % LINE_COLORS.length],
            grossA: g,
            netFV: fv,
            netAnnual: netAnnual,
            real: real,
            equivCDI: equivCDI,
            isento: isIsento(a),
          });
        });
        var ranked = results.slice().sort(function (a, b) {
          return b.netFV - a.netFV;
        });
        return {
          results: results,
          ranked: ranked,
          best: ranked[0],
          worst: ranked[ranked.length - 1],
        };
      }
      function equivInsight(results) {
        var isento = results.filter(function (r) {
          return r.isento;
        })[0];
        var trib = results.filter(function (r) {
          return !r.isento;
        })[0];
        if (!isento || !trib) return null;
        var ir = irRate(state.horizon * 360);
        var grossNeeded = isento.netAnnual / (1 - ir);
        return {
          isento: isento,
          ir: ir,
          equivPctCDI: (grossNeeded / (state.cdi / 100)) * 100,
        };
      }
      function milestoneVal(a, t) {
        var v = netFV(a, t, state.aporte, state.cdi, state.ipca);
        return state.showReal ? v / Math.pow(1 + state.ipca / 100, t) : v;
      }

      /* ===================== Gráfico SVG ===================== */
      var VB_W = 820,
        VB_H = 300,
        padL = 56,
        padR = 16,
        padT = 14,
        padB = 26;
      var plotW = VB_W - padL - padR,
        plotH = VB_H - padT - padB;
      var chartCache = null;

      function buildSeries() {
        var s = state,
          c = compute(),
          months = s.horizon * 12;
        var series = c.results.map(function (a) {
          return { id: a.id, nome: a.nome, color: a.color, vals: [] };
        });
        var infl = { vals: [] };
        for (var m = 0; m <= months; m++) {
          var t = m / 12;
          c.results.forEach(function (a, idx) {
            var v = t === 0 ? s.aporte : netFV(a, t, s.aporte, s.cdi, s.ipca);
            series[idx].vals.push(
              s.showReal ? v / Math.pow(1 + s.ipca / 100, t) : v,
            );
          });
          infl.vals.push(
            s.showReal ? s.aporte : s.aporte * Math.pow(1 + s.ipca / 100, t),
          );
        }
        return { series: series, infl: infl, months: months };
      }
      function xAt(t) {
        return padL + plotW * (t / state.horizon);
      }
      function chartSVG() {
        var data = buildSeries();
        chartCache = data;
        var all = [];
        data.series.forEach(function (sr) {
          all = all.concat(sr.vals);
        });
        all = all.concat(data.infl.vals);
        var maxV = Math.max.apply(null, all) * 1.08;
        var minV = Math.min.apply(null, all) * 0.98;
        if (minV === maxV) maxV = minV + 1;
        chartCache.maxV = maxV;
        chartCache.minV = minV;
        function yAt(v) {
          return padT + plotH * (1 - (v - minV) / (maxV - minV));
        }
        chartCache.yAt = yAt;
        function path(vals) {
          var d = "";
          for (var m = 0; m < vals.length; m++) {
            d +=
              (m ? "L" : "M") +
              xAt(m / 12).toFixed(1) +
              "," +
              yAt(vals[m]).toFixed(1) +
              " ";
          }
          return d.trim();
        }

        var svg =
          '<svg viewBox="0 0 ' +
          VB_W +
          " " +
          VB_H +
          '" width="100%" style="display:block">';
        // grid horizontal + labels Y
        for (var i = 0; i <= 4; i++) {
          var vy = minV + (i / 4) * (maxV - minV),
            yy = yAt(vy);
          svg +=
            '<line x1="' +
            padL +
            '" y1="' +
            yy.toFixed(1) +
            '" x2="' +
            (VB_W - padR) +
            '" y2="' +
            yy.toFixed(1) +
            '" stroke="rgba(255,255,255,.06)"/>';
          svg +=
            '<text x="' +
            (padL - 8) +
            '" y="' +
            (yy + 4).toFixed(1) +
            '" fill="#9AA2D0" font-size="11" text-anchor="end">R$ ' +
            Math.round(vy / 1000) +
            "k</text>";
        }
        // ticks X (adaptativo: meses quando prazo < 1 ano, senão anos)
        if (state.horizon < 1) {
          var totM = Math.round(state.horizon * 12),
            stp = Math.max(1, Math.round(totM / 6));
          for (var k = 0; k <= totM; k += stp) {
            var xxm = xAt(k / 12);
            svg +=
              '<text x="' +
              xxm.toFixed(1) +
              '" y="' +
              (VB_H - 8) +
              '" fill="#9AA2D0" font-size="11" text-anchor="middle">' +
              k +
              "m</text>";
          }
        } else {
          for (var k = 0; k <= state.horizon; k++) {
            var xx = xAt(k);
            svg +=
              '<text x="' +
              xx.toFixed(1) +
              '" y="' +
              (VB_H - 8) +
              '" fill="#9AA2D0" font-size="11" text-anchor="middle">' +
              k +
              "a</text>";
          }
        }
        // inflação tracejada
        svg +=
          '<path d="' +
          path(data.infl.vals) +
          '" fill="none" stroke="#8A92C0" stroke-width="1.6" stroke-dasharray="5 5"/>';
        // ativos
        data.series.forEach(function (sr) {
          svg +=
            '<path d="' +
            path(sr.vals) +
            '" fill="none" stroke="' +
            sr.color +
            '" stroke-width="' +
            (sr.color === "#F26522" ? 3 : 2.2) +
            '" stroke-linejoin="round"/>';
        });
        // guia hover
        svg +=
          '<line id="guide" x1="0" y1="' +
          padT +
          '" x2="0" y2="' +
          (padT + plotH) +
          '" stroke="rgba(255,255,255,.25)" style="display:none"/>';
        svg += '<g id="guideDots"></g>';
        svg += "</svg>";
        return svg;
      }
      function legendHTML() {
        var c = compute(),
          out = '<div class="legend">';
        c.results.forEach(function (a) {
          out +=
            '<span><span style="width:12px;height:3px;border-radius:2px;background:' +
            a.color +
            ';display:inline-block"></span>' +
            esc(a.nome) +
            "</span>";
        });
        out +=
          '<span><span style="width:13px;height:0;border-top:2px dashed #8A92C0;display:inline-block"></span>Inflação (IPCA)</span>';
        out += "</div>";
        return out;
      }
      function attachHover() {
        var wrap = document.getElementById("chartWrap");
        if (!wrap) return;
        var svg = wrap.querySelector("svg"),
          tip = document.getElementById("chartTip");
        var guide = svg.querySelector("#guide"),
          dots = svg.querySelector("#guideDots");
        function move(e) {
          var rect = svg.getBoundingClientRect();
          var px = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
          var py = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
          var vbx = (px / rect.width) * VB_W;
          var t = ((vbx - padL) / plotW) * state.horizon;
          t = Math.max(0, Math.min(state.horizon, t));
          var mi = Math.round(t * 12);
          var gx = xAt(mi / 12);
          guide.setAttribute("x1", gx);
          guide.setAttribute("x2", gx);
          guide.style.display = "block";
          var dd = "",
            rows = "";
          chartCache.series.forEach(function (sr) {
            var v = sr.vals[mi],
              y = chartCache.yAt(v);
            dd +=
              '<circle cx="' +
              gx.toFixed(1) +
              '" cy="' +
              y.toFixed(1) +
              '" r="3.5" fill="' +
              sr.color +
              '"/>';
            rows +=
              '<div style="display:flex;align-items:center;gap:6px"><span style="width:8px;height:8px;border-radius:8px;background:' +
              sr.color +
              '"></span><span class="muted">' +
              esc(sr.nome) +
              ":</span> <b>" +
              brl0(v) +
              "</b></div>";
          });
          var iv = chartCache.infl.vals[mi];
          dd +=
            '<circle cx="' +
            gx.toFixed(1) +
            '" cy="' +
            chartCache.yAt(iv).toFixed(1) +
            '" r="3" fill="#8A92C0"/>';
          rows +=
            '<div style="display:flex;align-items:center;gap:6px"><span style="width:8px;height:0;border-top:2px dashed #8A92C0"></span><span class="muted">Inflação:</span> <b>' +
            brl0(iv) +
            "</b></div>";
          dots.innerHTML = dd;
          tip.innerHTML =
            '<div style="font-weight:700;margin-bottom:4px">Ano ' +
            (mi / 12).toFixed(mi % 12 ? 1 : 0) +
            "</div>" +
            rows;
          tip.style.display = "block";
          var tw = tip.offsetWidth;
          var left = px + 14;
          if (left + tw > rect.width) left = px - tw - 14;
          if (left < 0) left = 4;
          tip.style.left = left + "px";
          tip.style.top = Math.max(0, py - 10) + "px";
        }
        function leave() {
          tip.style.display = "none";
          guide.style.display = "none";
          dots.innerHTML = "";
        }
        svg.addEventListener("mousemove", move);
        svg.addEventListener("mouseleave", leave);
        svg.addEventListener("touchstart", move);
        svg.addEventListener(
          "touchmove",
          function (e) {
            e.preventDefault();
            move(e);
          },
          { passive: false },
        );
      }

      /* ===================== Render ===================== */
      function el(id) {
        return document.getElementById(id);
      }

      function horizonteHTML() {
        var h =
          '<div class="row" style="flex-wrap:wrap"><span class="eyebrow">Prazo</span>';
        HORIZONS.forEach(function (x) {
          h +=
            '<button class="pill' +
            (state.horizon === x ? " on" : "") +
            '" data-h="' +
            x +
            '">' +
            hzLabel(x) +
            "</button>";
        });
        return h + "</div>";
      }
      function chartCardHTML() {
        return (
          '<div class="card"><div class="between" style="margin-bottom:8px">' +
          '<div class="ttl" style="margin:0">' +
          (state.showReal
            ? "Poder de compra projetado"
            : "Patrimônio projetado (líquido)") +
          "</div>" +
          legendHTML() +
          "</div>" +
          '<div class="chartwrap" id="chartWrap">' +
          chartSVG() +
          '<div id="chartTip"></div></div></div>'
        );
      }
      function tableHTML() {
        var c = compute();
        var rows = c.results
          .map(function (a) {
            var win = a.id === c.best.id;
            return (
              '<tr style="background:' +
              (win ? "rgba(242,101,34,.07)" : "transparent") +
              '">' +
              '<td><div class="row"><span class="dot" style="background:' +
              a.color +
              '"></span><div>' +
              '<div style="font-weight:700;display:flex;align-items:center;gap:8px">' +
              esc(a.nome) +
              (win ? '<span class="badge">MELHOR</span>' : "") +
              "</div>" +
              '<div class="muted" style="font-size:12px">' +
              taxaLabel(a) +
              ' · <span style="color:' +
              (a.isento ? "#34D399" : "#9AA2D0") +
              '">' +
              (a.isento ? "isento" : "tributado") +
              "</span></div>" +
              "</div></div></td>" +
              '<td style="text-align:right;font-weight:600">' +
              pct(a.netAnnual) +
              "</td>" +
              '<td style="text-align:right;font-weight:700;color:#F26522">' +
              a.equivCDI.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) +
              "%</td>" +
              '<td style="text-align:right;font-weight:700">' +
              brl0(state.showReal ? a.real : a.netFV) +
              "</td></tr>"
            );
          })
          .join("");
        return (
          '<div class="card" style="padding:0;overflow:hidden"><div style="overflow-x:auto"><table>' +
          '<thead><tr><th style="text-align:left">Ativo</th><th style="text-align:right">Líq. a.a.</th>' +
          '<th style="text-align:right">Equiv. CDI líq.</th><th style="text-align:right">Em ' +
          hzLabel(state.horizon) +
          "</th></tr></thead>" +
          "<tbody>" +
          rows +
          "</tbody></table></div></div>"
        );
      }
      function insightHTML() {
        var c = compute(),
          ins = equivInsight(c.results);
        if (!ins) return "";
        return (
          '<div class="card" style="background:rgba(52,211,153,.08);border-color:rgba(52,211,153,.25)">' +
          '<div class="eyebrow green" style="margin-bottom:4px">Equivalência (gross-up)</div>' +
          '<div style="line-height:1.6">Por ser <b>isento de IR</b>, o ativo <b>' +
          esc(ins.isento.nome) +
          "</b> (" +
          taxaLabel(ins.isento) +
          ') rende como um título tributado de aproximadamente <b class="orange">' +
          ins.equivPctCDI.toLocaleString("pt-BR", {
            maximumFractionDigits: 1,
          }) +
          "% do CDI</b> num resgate em " +
          hzLabel(state.horizon) +
          " (IR de " +
          pct(ins.ir, 1) +
          ").</div></div>"
        );
      }

      function outEditHTML() {
        return horizonteHTML() + chartCardHTML() + tableHTML() + insightHTML();
      }
      function outClientHTML() {
        var c = compute(),
          best = c.best,
          worst = c.worst,
          ins = equivInsight(c.results);
        var diff =
          best && worst && best.id !== worst.id ? best.netFV - worst.netFV : 0;
        var mileRows = c.ranked
          .map(function (a) {
            var cells = HORIZONS.map(function (h) {
              var win = a.id === best.id;
              return (
                '<td style="text-align:right;color:' +
                (win ? "#F26522" : "#fff") +
                ";font-weight:" +
                (win ? 700 : 400) +
                '">' +
                brl0(milestoneVal(a, h)) +
                "</td>"
              );
            }).join("");
            return (
              '<tr><td><span class="row" style="font-weight:600"><span class="dot" style="background:' +
              a.color +
              '"></span>' +
              esc(a.nome) +
              "</span></td>" +
              cells +
              "</tr>"
            );
          })
          .join("");
        var insBox = ins
          ? '<div class="card" style="background:var(--navy3)"><div class="eyebrow green" style="margin-bottom:4px">Por que o isento ganha</div>' +
            '<div style="line-height:1.6">' +
            esc(ins.isento.nome) +
            ' rende como ~<b class="orange">' +
            ins.equivPctCDI.toLocaleString("pt-BR", {
              maximumFractionDigits: 1,
            }) +
            "% do CDI</b> tributado, pois não paga IR.</div></div>"
          : "";
        return (
          horizonteHTML() +
          '<div class="gridR" style="margin-top:16px">' +
          "<div>" +
          chartCardHTML() +
          "</div>" +
          '<div class="col">' +
          '<div class="card" style="background:var(--orange)">' +
          '<div class="eyebrow" style="color:rgba(255,255,255,.85);margin-bottom:4px">Melhor retorno em ' +
          hzLabel(state.horizon) +
          "</div>" +
          '<div style="font-size:24px;font-weight:800">' +
          esc(best.nome) +
          "</div>" +
          '<div style="color:rgba(255,255,255,.92)">' +
          brl0(state.showReal ? best.real : best.netFV) +
          " · " +
          pct(best.netAnnual) +
          " a.a. líq.</div>" +
          (diff > 0
            ? '<div style="font-size:12px;margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,.25);color:rgba(255,255,255,.92)">+' +
              brl0(diff) +
              " a mais que " +
              esc(worst.nome) +
              "</div>"
            : "") +
          "</div>" +
          insBox +
          "</div>" +
          "</div>" +
          '<div class="card" style="padding:0;overflow:hidden;background:var(--navy3);margin-top:16px"><div style="overflow-x:auto"><table>' +
          '<thead><tr><th style="text-align:left">Ativo</th>' +
          HORIZONS.map(function (h) {
            return '<th style="text-align:right">' + hzLabel(h) + "</th>";
          }).join("") +
          "</tr></thead>" +
          "<tbody>" +
          mileRows +
          "</tbody></table></div></div>"
        );
      }

      function discHTML() {
        return (
          '<div class="disc">Material de caráter informativo, não constitui recomendação, oferta ou garantia de rentabilidade. ' +
          "Simulação baseada em premissas editáveis (CDI " +
          pct(state.cdi / 100) +
          " e IPCA " +
          pct(state.ipca / 100) +
          "); projeções consideram a taxa contratada constante e IR regressivo conforme o prazo de resgate, sem IOF/come-cotas. " +
          "Rentabilidade passada não representa garantia de resultados futuros. Confirme as taxas vigentes antes de apresentar ao cliente. Rico — Grupo XP.</div>"
        );
      }

      function headerHTML() {
        return (
          '<div class="between" style="margin-bottom:20px">' +
          '<div class="row"><span class="logo">' +
          RICO_SVG +
          '</span><span class="vline" style="display:none"></span>' +
          '<span class="eyebrow">Projeções e Comparações</span></div>' +
          '<div class="row">' +
          '<button class="btn btn-ghost" id="btnReal" style="font-size:12px;color:' +
          (state.showReal ? "#F26522" : "#9AA2D0") +
          ";background:" +
          (state.showReal ? "var(--orangeSoft)" : "var(--navy2)") +
          '">' +
          (state.showReal ? "● " : "○ ") +
          "Valor real (descontando IPCA)</button>" +
          '<button class="btn ' +
          (state.mode === "cliente" ? "btn-ghost" : "btn-o") +
          '" id="btnMode">' +
          (state.mode === "cliente"
            ? "← Editar"
            : "Gerar projeção p/ cliente") +
          "</button>" +
          "</div></div>"
        );
      }

      function assetsHTML() {
        var h =
          '<div class="card"><div class="between" style="margin-bottom:12px"><div class="ttl" style="margin:0">Ativos comparados</div>' +
          '<button class="chip" id="addAsset" style="background:var(--orangeSoft);color:var(--orange);border:none;font-weight:700">+ Ativo</button></div>' +
          '<div class="col">';
        state.assets.forEach(function (a, i) {
          var col = LINE_COLORS[i % LINE_COLORS.length];
          h +=
            '<div class="assetcard" style="border-left:3px solid ' +
            col +
            '">' +
            '<div class="row" style="margin-bottom:8px"><input data-id="' +
            a.id +
            '" data-k="nome" value="' +
            esc(a.nome) +
            '" style="font-weight:700;padding:6px 9px" placeholder="Nome do ativo (ex.: Caixinha Nubank)"/>' +
            '<button class="x" data-del="' +
            a.id +
            '">✕</button></div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
            '<select data-id="' +
            a.id +
            '" data-k="indexador">' +
            opt("cdi", "% do CDI", a.indexador) +
            opt("cdimais", "CDI + x%", a.indexador) +
            opt("pre", "Prefixado", a.indexador) +
            opt("ipca", "IPCA +", a.indexador) +
            opt("poupanca", "Poupança", a.indexador) +
            "</select>";
          if (a.indexador !== "poupanca") {
            var suf =
              a.indexador === "cdi"
                ? "% CDI"
                : a.indexador === "cdimais"
                  ? "% + CDI"
                  : a.indexador === "pre"
                    ? "% a.a."
                    : "% real";
            h +=
              '<div style="display:flex;align-items:center;gap:6px;background:var(--input);border:1px solid var(--border);border-radius:10px;padding:0 9px">' +
              '<input data-id="' +
              a.id +
              '" data-k="taxa" value="' +
              a.taxa +
              '" style="background:transparent;border:none;padding:9px 0" inputmode="decimal"/>' +
              '<span class="muted" style="font-size:12px;white-space:nowrap">' +
              suf +
              "</span></div>";
          } else {
            h +=
              '<div class="muted" style="background:var(--input);border:1px solid var(--border);border-radius:10px;padding:9px 11px;display:flex;align-items:center">0,5% a.m.</div>';
          }
          h += "</div>";
          if (a.indexador !== "poupanca") {
            h +=
              '<div class="row" style="margin-top:8px;gap:8px">' +
              seg(a.id, "tributado", "Tributado (IR)", a.tributacao) +
              seg(a.id, "isento", "Isento de IR", a.tributacao) +
              "</div>";
          }
          h += "</div>";
        });
        h +=
          '</div><div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">' +
          '<div class="eyebrow" style="margin-bottom:10px">Adicionar rápido</div>';
        var GRUPOS = [
          { k: "rf", t: "Renda Fixa", c: "#3DD68C" },
          { k: "rv", t: "Renda Variável · Índices", c: "#FF8B52" },
          { k: "cart", t: "Carteiras Rico", c: "#7C8CFF" },
        ];
        GRUPOS.forEach(function (G) {
          var tem = PRESETS.some(function (p) {
            return (p.g || "rf") === G.k;
          });
          if (!tem) return;
          h +=
            '<div style="margin-bottom:11px">' +
            '<div style="display:flex;align-items:center;gap:7px;font-size:10px;font-weight:800;letter-spacing:.7px;text-transform:uppercase;color:' +
            G.c +
            ';margin-bottom:7px">' +
            '<span style="width:8px;height:8px;border-radius:2px;background:' +
            G.c +
            '"></span>' +
            G.t +
            "</div>" +
            '<div class="row" style="flex-wrap:wrap;gap:7px">';
          PRESETS.forEach(function (p, idx) {
            if ((p.g || "rf") !== G.k) return;
            h +=
              '<button class="chip" data-preset="' +
              idx +
              '" style="border-color:' +
              G.c +
              "66;color:" +
              G.c +
              '">+ ' +
              p.label +
              "</button>";
          });
          h += "</div></div>";
        });
        h += "</div></div>";
        return h;
      }
      function opt(v, l, cur) {
        return (
          '<option value="' +
          v +
          '"' +
          (cur === v ? " selected" : "") +
          ">" +
          l +
          "</option>"
        );
      }
      function seg(id, val, label, cur) {
        var on = cur === val;
        var bg = on
          ? val === "isento"
            ? "rgba(52,211,153,.15)"
            : "var(--orangeSoft)"
          : "var(--navy3)";
        var col = on ? (val === "isento" ? "#34D399" : "#F26522") : "#9AA2D0";
        return (
          '<button class="seg" data-seg="' +
          id +
          '" data-val="' +
          val +
          '" style="background:' +
          bg +
          ";color:" +
          col +
          ";border-color:" +
          (on ? "transparent" : "var(--border)") +
          '">' +
          label +
          "</button>"
        );
      }

      function premissasHTML() {
        return (
          '<div class="card"><div class="ttl">Premissas</div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">' +
          '<label class="f"><span>Valor (R$)</span><input id="pAporte" value="' +
          state.aporte +
          '" inputmode="numeric"/></label>' +
          '<label class="f"><span>CDI % a.a.</span><input id="pCdi" value="' +
          state.cdi +
          '" inputmode="decimal"/></label>' +
          '<label class="f"><span>IPCA % a.a.</span><input id="pIpca" value="' +
          state.ipca +
          '" inputmode="decimal"/></label>' +
          "</div></div>"
        );
      }

      function render() {
        var root = el("root");
        if (state.mode === "editar") {
          root.innerHTML =
            headerHTML() +
            '<div class="grid2"><div class="col">' +
            premissasHTML() +
            assetsHTML() +
            "</div>" +
            '<div class="col" id="out">' +
            outEditHTML() +
            "</div></div>" +
            discHTML();
        } else {
          root.innerHTML =
            headerHTML() +
            '<div class="card" style="padding:0;overflow:hidden"><div class="topbar" style="height:5px"></div>' +
            '<div style="padding:24px">' +
            '<div class="between" style="margin-bottom:16px"><span class="logo" style="font-size:26px">' +
            RICO_SVG +
            "</span>" +
            '<span class="muted" style="font-size:12px">CDI ' +
            pct(state.cdi / 100) +
            " · IPCA " +
            pct(state.ipca / 100) +
            " · aporte " +
            brl0(state.aporte) +
            "</span></div>" +
            '<input id="cTitulo" value="' +
            esc(state.titulo) +
            '" style="font-size:28px;font-weight:800;background:transparent;border:none;padding:0;margin-bottom:6px"/>' +
            '<div class="muted" style="margin-bottom:16px">Projeção ' +
            (state.showReal
              ? "em poder de compra (descontando inflação)"
              : "líquida") +
            ", considerando resgate ao fim de cada período.</div>" +
            '<div id="clientOut">' +
            outClientHTML() +
            "</div>" +
            discHTML() +
            "</div></div>";
        }
        bind();
        attachHover();
      }

      function updateOutputs() {
        if (state.mode === "editar") {
          el("out").innerHTML = outEditHTML();
        } else {
          el("clientOut").innerHTML = outClientHTML();
        }
        bindOutputs();
        attachHover();
      }

      /* ===================== Eventos ===================== */
      function bindOutputs() {
        document.querySelectorAll("[data-h]").forEach(function (b) {
          b.onclick = function () {
            state.horizon = Number(b.getAttribute("data-h"));
            render();
          };
        });
      }
      function bind() {
        // header
        el("btnReal").onclick = function () {
          state.showReal = !state.showReal;
          render();
        };
        el("btnMode").onclick = function () {
          state.mode = state.mode === "editar" ? "cliente" : "editar";
          render();
        };

        if (state.mode === "editar") {
          el("pAporte").oninput = function (e) {
            state.aporte = n(e.target.value);
            updateOutputs();
          };
          el("pCdi").oninput = function (e) {
            state.cdi = n(e.target.value);
            updateOutputs();
          };
          el("pIpca").oninput = function (e) {
            state.ipca = n(e.target.value);
            updateOutputs();
          };

          document
            .querySelectorAll('input[data-k="nome"]')
            .forEach(function (inp) {
              inp.oninput = function () {
                var id = Number(inp.getAttribute("data-id"));
                setAsset(id, "nome", inp.value);
                updateOutputs();
              };
            });
          document
            .querySelectorAll('input[data-k="taxa"]')
            .forEach(function (inp) {
              inp.oninput = function () {
                var id = Number(inp.getAttribute("data-id"));
                setAsset(id, "taxa", n(inp.value));
                autoRename(id);
                updateOutputs();
              };
            });
          document
            .querySelectorAll('select[data-k="indexador"]')
            .forEach(function (sel) {
              sel.onchange = function () {
                var id = Number(sel.getAttribute("data-id"));
                setAsset(id, "indexador", sel.value);
                render();
              };
            });
          document.querySelectorAll("[data-seg]").forEach(function (b) {
            b.onclick = function () {
              var id = Number(b.getAttribute("data-seg"));
              setAsset(id, "tributacao", b.getAttribute("data-val"));
              render();
            };
          });
          document.querySelectorAll("[data-del]").forEach(function (b) {
            b.onclick = function () {
              var id = Number(b.getAttribute("data-del"));
              state.assets = state.assets.filter(function (x) {
                return x.id !== id;
              });
              render();
            };
          });
          el("addAsset").onclick = function () {
            addAsset(null);
            render();
          };
          document.querySelectorAll("[data-preset]").forEach(function (b) {
            b.onclick = function () {
              addAsset(PRESETS[Number(b.getAttribute("data-preset"))]);
              render();
            };
          });
        } else {
          var t = el("cTitulo");
          if (t)
            t.oninput = function () {
              state.titulo = t.value;
            };
        }
        bindOutputs();
      }
      function setAsset(id, k, v) {
        state.assets = state.assets.map(function (x) {
          return x.id === id
            ? Object.assign(
                {},
                x,
                (function (o) {
                  o[k] = v;
                  return o;
                })({}),
              )
            : x;
        });
      }
      function autoRename(id) {
        var a = null;
        state.assets.forEach(function (x) {
          if (x.id === id) a = x;
        });
        if (!a || !/\d+(?:[.,]\d+)?\s*%/.test(a.nome)) return;
        var nn = n(a.taxa).toLocaleString("pt-BR");
        var nm = a.nome.replace(/\d+(?:[.,]\d+)?(\s*%)/, nn + "$1");
        setAsset(id, "nome", nm);
        var inpN = document.querySelector(
          'input[data-k="nome"][data-id="' + id + '"]',
        );
        if (inpN) inpN.value = nm;
      }
      function addAsset(p) {
        state.assets.push({
          id: state.nextId,
          nome: p ? p.nome : "Novo ativo",
          indexador: p ? p.indexador : "cdi",
          taxa: p ? p.taxa : 100,
          tributacao: p ? p.tributacao : "tributado",
        });
        state.nextId++;
      }

      render();
    })();
  };
})();
