// Migrated from Hub v1. Review domain assumptions separately from interface changes.

(function () {
  var _rvDone = false;
  window.__rvProjData = function () {
    try {
      return {
        patrimonio: Number(state.patrimonio) || 0,
        cliente: state.cliente || "",
      };
    } catch (e) {
      return { patrimonio: 0, cliente: "" };
    }
  };
  window.__rvInit = function () {
    if (_rvDone) return;
    _rvDone = true;
    (function () {
      "use strict";
      var ORANGE = "#F26522";
      var RUBI = "#E0457B";

      var CLASS_COLORS = {
        "Renda Variável": "#F26522",
        "Fundos Listados": "#FFB020",
        "Renda Fixa": "#2BD9A6",
        Multimercados: "#7C8CFF",
        Alternativos: "#C77DFF",
        Internacional: "#36C5F0",
      };
      var CLASSES = Object.keys(CLASS_COLORS);

      var SETOR_COLORS = {
        Bancos: "#F26522",
        Financeiro: "#FF8B52",
        Seguros: "#FFB020",
        "Energia Elétrica": "#2BD9A6",
        Saneamento: "#36C5F0",
        "Petróleo & Gás": "#7C8CFF",
        "Mineração & Siderurgia": "#C77DFF",
        "Papel & Celulose": "#9ED36A",
        Tecnologia: "#5BC0EB",
        "Consumo & Varejo": "#FF7AA2",
        "Locação & Logística": "#E8A04B",
        Industrial: "#8A93D8",
        Saúde: "#4FD1C5",
        "Índice / ETF": "#B6BDF0",
        Energia: "#7C8CFF",
        Materiais: "#C77DFF",
        "Cons. Disc.": "#FF7AA2",
        Industriais: "#8A93D8",
        "Tec. Info.": "#5BC0EB",
        Imobiliário: "#E8A04B",
        "Utilidade Pública": "#2BD9A6",
        Comunicações: "#36C5F0",
        Internacional: "#A9B4FF",
        Outros: "#6F77A8",
      };
      var SETORES = Object.keys(SETOR_COLORS);
      function setorCor(s) {
        return SETOR_COLORS[s] || "#6F77A8";
      }

      var STRUCT_COLORS = {
        none: "#8A93D8",
        protecao: "#FF8B52",
        cupom: "#E0457B",
      };
      var STRUCT_LABEL = {
        none: "Avulsa",
        protecao: "Proteção",
        cupom: "Cupom",
      };

      function isIsento(nome) {
        return /(LCI|LCA|LCD)/i.test(nome || "");
      }
      function isFII(it) {
        return it && it.classe === "Fundos Listados";
      }

      function structureTag(it) {
        var kind = it.estrutura;
        if (!kind) {
          var blob = ((it.nome || "") + " " + (it.detalhe || "")).toLowerCase();
          if (/rubi|smart\s?cupom|smartcoupon/.test(blob)) kind = "cupom";
          else if (/collar|fence/.test(blob)) kind = "protecao";
          else kind = "none";
        }
        if (kind === "cupom") return { label: "Cupom", kind: "cupom" };
        if (kind === "protecao") return { label: "Proteção", kind: "protecao" };
        return null;
      }

      var _id = 0;
      function uid() {
        return "a" + ++_id;
      }
      function mk(
        classe,
        nome,
        pct,
        detalhe,
        liquidez,
        estrutura,
        opcoes,
        setor,
      ) {
        detalhe = detalhe || "";
        liquidez = liquidez || "";
        estrutura = estrutura || null;
        opcoes = opcoes || null;
        setor = setor || "Outros";
        var o = {
          id: uid(),
          classe: classe,
          nome: nome,
          pct: pct,
          detalhe: detalhe,
          liquidez: liquidez,
          setor: setor,
        };
        if (estrutura) o.estrutura = estrutura;
        if (opcoes) {
          o.opcoes = opcoes;
          o.escolha = 0;
          o.nome = opcoes[0].nome;
          o.detalhe = opcoes[0].detalhe;
          o.liquidez = opcoes[0].liquidez || "";
        }
        return o;
      }

      var fmtPct = function (n) {
        var v = Math.round(n * 10) / 10;
        return (Number.isInteger(v) ? v.toFixed(0) : v.toFixed(1)).replace(
          ".",
          ",",
        );
      };
      var fmtBRL = function (n) {
        return Math.round(n).toLocaleString("pt-BR", {
          maximumFractionDigits: 0,
        });
      };

      /* ===== Catálogo de operações estruturadas XP ===== */
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
          setor: "Outros",
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

      /* ===== Derivativos Quanto · Internacional ===== */
      function fmtMult(n) {
        return n.toFixed(2).replace(".", ",");
      }
      function fmtTaxa(n) {
        return n.toFixed(2).replace(".", ",");
      }
      function r1(n) {
        return Math.round(n * 10) / 10;
      }
      // coage valor (aceita virgula) para numero; usa default se invalido
      function _qnum(v, def) {
        if (typeof v === "number") return isNaN(v) ? def : v;
        var s = String(v == null ? "" : v)
          .trim()
          .replace(",", ".");
        var n = parseFloat(s);
        return isNaN(n) ? def : n;
      }

      function buildQuanto(o) {
        var isP1 = o.payoff === 1;
        // BUG "Taxa fixa": taxa/mult podem chegar como string com virgula (op custom / import),
        // gerando NaN nos cenarios de payoff 2. Coage para numero aceitando virgula decimal.
        var mult = _qnum(o.mult, 1);
        var taxa = _qnum(o.taxa, 0);
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

      var QUANTO_OPS = [
        {
          id: "q-sp-1",
          payoff: 1,
          ativo: "S&P 500",
          fixing: "1 ano",
          mult: 1.04,
        },
        {
          id: "q-sp-2",
          payoff: 1,
          ativo: "S&P 500",
          fixing: "2 anos",
          mult: 1.2,
        },
        {
          id: "q-sp-3",
          payoff: 1,
          ativo: "S&P 500",
          fixing: "3 anos",
          mult: 1.41,
        },
        {
          id: "q-nq-1",
          payoff: 1,
          ativo: "Nasdaq",
          fixing: "1 ano",
          mult: 1.0,
        },
        {
          id: "q-nq-2",
          payoff: 1,
          ativo: "Nasdaq",
          fixing: "2 anos",
          mult: 1.0,
        },
        {
          id: "q-nq-3",
          payoff: 1,
          ativo: "Nasdaq",
          fixing: "3 anos",
          mult: 1.17,
        },
        {
          id: "q-sp-fx1",
          payoff: 2,
          ativo: "S&P 500",
          fixing: "1 ano",
          taxa: 6.3,
        },
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
        {
          id: "q-nq-fx2",
          payoff: 2,
          ativo: "Nasdaq",
          fixing: "2 anos",
          taxa: 9.0,
        },
        {
          id: "q-nq-fx3",
          payoff: 2,
          ativo: "Nasdaq",
          fixing: "3 anos",
          taxa: 14.33,
        },
      ].map(buildQuanto);

      function opDetalheQuanto(op) {
        if (op.payoff === 1)
          return (
            "Capital protegido — devolve 100% do capital se o " +
            op.ativo +
            " cair. Na alta, paga a variação × " +
            fmtMult(op.mult) +
            " (sem teto). Quanto: resultado em moeda local, sem risco cambial. Prazo de " +
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
      function mkQuanto(id, pct) {
        var op = QUANTO_OPS.filter(function (o) {
          return o.id === id;
        })[0];
        var it = mk(
          "Internacional",
          op.nome,
          pct,
          opDetalheQuanto(op),
          "Vencimento em " + op.fixing,
          "protecao",
          null,
          "Internacional",
        );
        it.op = op;
        return it;
      }

      /* ===== Ações com proteção — persistência de override e cotação (Tarefas 2 e 3) ===== */
      var LS_RV_STRUCT_OV = "hubRvStructOverride";
      var LS_RV_PRECO = "hubRvPrecoAtual";
      function rvLoadStructOv() {
        try {
          return (
            JSON.parse(window.hubStorage.getItem(LS_RV_STRUCT_OV) || "{}") || {}
          );
        } catch (_) {
          return {};
        }
      }
      function rvSaveStructOv(map) {
        try {
          window.hubStorage.setItem(LS_RV_STRUCT_OV, JSON.stringify(map || {}));
        } catch (_) {}
      }
      function rvGetStructOv(ticker) {
        var m = rvLoadStructOv();
        return m[ticker] || null;
      }
      function rvSetStructOv(ticker, obj) {
        var m = rvLoadStructOv();
        m[ticker] = obj;
        rvSaveStructOv(m);
      }
      function rvClearStructOv(ticker) {
        var m = rvLoadStructOv();
        delete m[ticker];
        rvSaveStructOv(m);
      }
      function rvLoadPrecos() {
        try {
          return (
            JSON.parse(window.hubStorage.getItem(LS_RV_PRECO) || "{}") || {}
          );
        } catch (_) {
          return {};
        }
      }
      function rvSavePrecos(map) {
        try {
          window.hubStorage.setItem(LS_RV_PRECO, JSON.stringify(map || {}));
        } catch (_) {}
      }
      function rvGetPreco(ticker) {
        var m = rvLoadPrecos();
        var v = m[ticker];
        return typeof v === "number" && isFinite(v) && v > 0 ? v : null;
      }
      function rvSetPreco(ticker, val) {
        var m = rvLoadPrecos();
        if (val == null || !(Number(val) > 0)) delete m[ticker];
        else m[ticker] = Number(val);
        rvSavePrecos(m);
      }

      /* ===== Feature 1: cotações automáticas por ticker (Yahoo Finance via proxy) =====
   Busca o preço atual na internet por ticker e preenche precoAtual.
   Fonte primária: Yahoo Finance (query1.finance.yahoo.com) via cadeia de
   proxies CORS SEM token — cobre TODOS os tickers da B3 (sufixo .SA).
   brapi.dev fica como fallback final opcional (só se houver token).
   Robusto: na rede RICO (bloqueio de APIs externas) NÃO quebra a UI — o
   input manual continua funcionando como fallback. */
      var LS_BRAPI_TOKEN = "hubBrapiToken";
      function rvGetBrapiToken() {
        try {
          return (window.hubStorage.getItem(LS_BRAPI_TOKEN) || "").trim();
        } catch (_) {
          return "";
        }
      }
      function rvSetBrapiToken(t) {
        try {
          t = String(t == null ? "" : t).trim();
          if (t) window.hubStorage.setItem(LS_BRAPI_TOKEN, t);
          else window.hubStorage.removeItem(LS_BRAPI_TOKEN);
        } catch (_) {}
      }
      var rvLastQuoteTs = "";
      /* Sufixo .SA do Yahoo: acrescenta .SA se ainda não terminar em .SA (units/BDRs incluídos). */
      function rvYahooSym(t) {
        var u = String(t == null ? "" : t)
          .trim()
          .toUpperCase();
        if (!u) return "";
        return /\.SA$/.test(u) ? u : u + ".SA";
      }
      /* Cadeia de proxies CORS (sem token) para acessar o Yahoo Finance. */
      var RV_PROXIES = [
        function (u) {
          return "https://api.allorigins.win/raw?url=" + encodeURIComponent(u);
        },
        function (u) {
          return "https://corsproxy.io/?url=" + encodeURIComponent(u);
        },
        function (u) {
          return (
            "https://api.codetabs.com/v1/proxy/?quest=" + encodeURIComponent(u)
          );
        },
      ];
      /* Busca o preço de UM ticker no Yahoo via cadeia de proxies. Retorna número ou null. */
      async function rvFetchYahooPrice(ticker) {
        var sym = rvYahooSym(ticker);
        if (!sym) return null;
        var yahooUrl =
          "https://query1.finance.yahoo.com/v8/finance/chart/" +
          encodeURIComponent(sym) +
          "?interval=1d&range=1d";
        for (var i = 0; i < RV_PROXIES.length; i++) {
          try {
            var r = await fetch(RV_PROXIES[i](yahooUrl), { cache: "no-store" });
            if (!r || !r.ok) continue;
            var j = await r.json();
            var meta =
              j &&
              j.chart &&
              Array.isArray(j.chart.result) &&
              j.chart.result[0] &&
              j.chart.result[0].meta;
            if (!meta) continue;
            var p = meta.regularMarketPrice;
            if (p == null || isNaN(Number(p)) || !(Number(p) > 0))
              p = meta.chartPreviousClose;
            if (p != null && !isNaN(Number(p)) && Number(p) > 0)
              return Number(p);
          } catch (e) {
            /* tenta próximo proxy */
          }
        }
        return null;
      }
      /* Busca cotações de TODOS os tickers (Yahoo via proxy, em paralelo). brapi = fallback
   final opcional só p/ tickers ainda nulos e apenas se houver token. Retorna mapa
   {TICKER_ORIGINAL: preco|null}. try/catch total — nunca lança. */
      /* Uma requisição via um proxy; retorna Number(preço) ou null. Nunca lança. */
      function rvQuoteVia(proxyUrl) {
        var ctl = new AbortController();
        var to = setTimeout(function () {
          ctl.abort();
        }, 12000);
        return fetch(proxyUrl, { cache: "no-store", signal: ctl.signal })
          .then(function (r) {
            return r.text();
          })
          .then(function (t) {
            clearTimeout(to);
            try {
              var m = JSON.parse(t).chart.result[0].meta;
              var p =
                m.regularMarketPrice != null
                  ? m.regularMarketPrice
                  : m.chartPreviousClose;
              return typeof p === "number" && isFinite(p) ? p : null;
            } catch (e) {
              return null;
            }
          })
          .catch(function () {
            clearTimeout(to);
            return null;
          });
      }
      function rvYahooUrl(sym) {
        return (
          "https://query1.finance.yahoo.com/v8/finance/chart/" +
          sym +
          "?interval=1d&range=1d"
        );
      }
      var RV_PROXY_CORS = function (u) {
        return "https://corsproxy.io/?url=" + encodeURIComponent(u);
      };
      var RV_PROXY_ALLO = function (u) {
        return "https://api.allorigins.win/raw?url=" + encodeURIComponent(u);
      };
      var RV_PROXY_CORSSH = function (u) {
        return "https://proxy.cors.sh/" + u;
      };
      var RV_PROXY_CODETABS = function (u) {
        return (
          "https://api.codetabs.com/v1/proxy/?quest=" + encodeURIComponent(u)
        );
      };
      /* Busca cotações de TODOS os tickers. corsproxy.io = primário (paralelo) + retry;
   allorigins = fallback secundário; brapi.dev = fallback final opcional (só com token).
   Chave = ticker ORIGINAL em maiúsculas (sem .SA). try/catch total — nunca lança. */
      async function rvFetchQuotes(tickers) {
        var uniq = [];
        var seen = {};
        (tickers || []).forEach(function (t) {
          var k = String(t == null ? "" : t)
            .trim()
            .toUpperCase();
          if (k && !seen[k]) {
            seen[k] = 1;
            uniq.push(k);
          }
        });
        var out = {};
        uniq.forEach(function (k) {
          out[k] = null;
        });
        if (!uniq.length) return out;
        function sym(k) {
          return rvYahooSym(k);
        }
        /* uma passada com um proxy sobre os tickers ainda nulos (em paralelo) */
        async function pass(proxyFn) {
          var pend = uniq.filter(function (k) {
            return out[k] == null;
          });
          if (!pend.length) return;
          var prices = await Promise.all(
            pend.map(function (k) {
              return rvQuoteVia(proxyFn(rvYahooUrl(sym(k))));
            }),
          );
          pend.forEach(function (k, i) {
            if (prices[i] != null) out[k] = prices[i];
          });
        }
        /* brapi.dev direto (sem token) — só p/ tickers ainda nulos; costuma passar em redes que bloqueiam proxies */
        async function passBrapiDireto() {
          var pend = uniq.filter(function (k) {
            return out[k] == null;
          });
          if (!pend.length) return;
          var res = await Promise.all(
            pend.map(function (k) {
              var ctl = new AbortController();
              var to = setTimeout(function () {
                ctl.abort();
              }, 9000);
              return fetch(
                "https://brapi.dev/api/quote/" + encodeURIComponent(k),
                { cache: "no-store", signal: ctl.signal },
              )
                .then(function (r) {
                  clearTimeout(to);
                  return r && r.ok ? r.json() : null;
                })
                .then(function (j) {
                  try {
                    var d = j.results[0];
                    var p = d.regularMarketPrice;
                    if (p == null || !(Number(p) > 0))
                      p = d.regularMarketPreviousClose;
                    return p != null && Number(p) > 0 ? Number(p) : null;
                  } catch (e) {
                    return null;
                  }
                })
                .catch(function () {
                  clearTimeout(to);
                  return null;
                });
            }),
          );
          pend.forEach(function (k, i) {
            if (res[i] != null) out[k] = res[i];
          });
        }
        try {
          await pass(RV_PROXY_CORS);
        } catch (e) {} // 1) corsproxy.io (paralelo)
        try {
          await pass(RV_PROXY_CORSSH);
        } catch (e) {} // 2) proxy.cors.sh
        try {
          await passBrapiDireto();
        } catch (e) {} // 3) brapi.dev direto
        try {
          await pass(RV_PROXY_ALLO);
        } catch (e) {} // 4) allorigins
        try {
          await pass(RV_PROXY_CODETABS);
        } catch (e) {} // 5) codetabs
        try {
          await pass(RV_PROXY_CORS);
        } catch (e) {} // 6) retry corsproxy
        /* Fallback final opcional: brapi.dev — só p/ tickers ainda nulos e se houver token. */
        try {
          var tok =
            typeof rvGetBrapiToken === "function" ? rvGetBrapiToken() : "";
          var missing = uniq.filter(function (t) {
            return out[t] == null;
          });
          if (tok && missing.length) {
            var url =
              "https://brapi.dev/api/quote/" +
              encodeURIComponent(missing.join(",")) +
              "?token=" +
              encodeURIComponent(tok);
            var r = await fetch(url, { cache: "no-store" });
            if (r && r.ok) {
              var j = await r.json();
              var results = j && Array.isArray(j.results) ? j.results : [];
              results.forEach(function (d) {
                if (!d) return;
                var s = String(d.symbol == null ? "" : d.symbol)
                  .trim()
                  .toUpperCase();
                if (!s) return;
                var p = d.regularMarketPrice;
                if (p == null || isNaN(Number(p)) || !(Number(p) > 0))
                  p = d.regularMarketPreviousClose;
                if (
                  p != null &&
                  !isNaN(Number(p)) &&
                  Number(p) > 0 &&
                  out[s] == null
                )
                  out[s] = Number(p);
              });
            }
          }
        } catch (_) {
          /* fallback brapi falhou: mantém o que já veio do Yahoo */
        }
        return out;
      }
      /* Aplica cotações a uma lista de itens (state.items). Atualiza DOM + retorno. */
      async function rvApplyQuotes(items, btnEl) {
        items = (items || []).filter(function (it) {
          return it && it.ticker;
        });
        if (!items.length) {
          try {
            showToast("Nenhum ticker para atualizar.");
          } catch (_) {}
          return;
        }
        var oldTxt = null;
        if (btnEl) {
          try {
            oldTxt = btnEl.innerHTML;
            btnEl.disabled = true;
            btnEl.innerHTML = "⏳";
          } catch (_) {}
        }
        var tickers = items.map(function (it) {
          return it.ticker;
        });
        var map = {},
          threw = false;
        try {
          map = await rvFetchQuotes(tickers);
        } catch (e) {
          threw = true;
          map = {};
        }
        if (btnEl) {
          try {
            btnEl.disabled = false;
            btnEl.innerHTML = oldTxt;
          } catch (_) {}
        }
        var n = 0,
          m = 0;
        items.forEach(function (it) {
          m++;
          var p = map[String(it.ticker).toUpperCase()];
          var rowEl = document.querySelector('.row[data-id="' + it.id + '"]');
          var inp = rowEl
            ? rowEl.querySelector('[data-act="precoAtual"]')
            : null;
          if (p != null && Number(p) > 0) {
            it.precoAtual = Number(p);
            try {
              rvSetPreco(it.ticker, Number(p));
            } catch (_) {}
            if (inp) {
              inp.value = fmtPreco(Number(p));
              inp.title = "";
            }
            try {
              softRetUpdate(it.id);
            } catch (_) {}
            n++;
          } else {
            if (inp) inp.title = "não encontrado / rede bloqueada";
          }
        });
        if (n > 0) {
          var dt = new Date();
          var hh = ("0" + dt.getHours()).slice(-2),
            mm = ("0" + dt.getMinutes()).slice(-2);
          rvLastQuoteTs = "cotações de " + hh + ":" + mm;
          try {
            var ts = document.querySelector("[data-rvcotts]");
            if (ts) ts.textContent = rvLastQuoteTs;
          } catch (_) {}
        }
        try {
          if (threw || n === 0) {
            showToast(
              "Não foi possível buscar cotações (rede pode estar bloqueando). Digite manualmente.",
            );
          } else {
            showToast("Cotações atualizadas: " + n + " de " + m);
          }
        } catch (_) {}
        return { n: n, m: m };
      }
      /* Batch: atualiza TODAS as ações (com ticker) da carteira numa única chamada. */
      function rvFetchAllQuotes(btnEl) {
        try {
          var items = (state.items || []).filter(function (it) {
            return it && it.ticker;
          });
          return rvApplyQuotes(items, btnEl);
        } catch (e) {
          try {
            showToast(
              "Não foi possível buscar cotações (rede pode estar bloqueando). Digite manualmente.",
            );
          } catch (_) {}
        }
      }

      /* ===== Persistência dos MODELOS de carteira editáveis (Tarefa A) =====
   hubRvTemplateOverride: objeto { "Top Ações":[linhas], "Top Dividendos":[linhas] }.
   Cada linha é só dado (ticker,nome,setor,pct,precoAlvo,rating) — o objeto de
   estrutura "op" é reconstruído por mkAcao/defaultProt no load (as estruturas
   editadas continuam em hubRvStructOverride, por ticker). */
      var LS_RV_TPL_OV = "hubRvTemplateOverride";
      function rvLoadTplOv() {
        try {
          return (
            JSON.parse(window.hubStorage.getItem(LS_RV_TPL_OV) || "{}") || {}
          );
        } catch (_) {
          return {};
        }
      }
      function rvSaveTplOv(map) {
        try {
          window.hubStorage.setItem(LS_RV_TPL_OV, JSON.stringify(map || {}));
        } catch (_) {}
      }
      function rvGetTplOv(name) {
        var m = rvLoadTplOv();
        return m && Array.isArray(m[name]) ? m[name] : null;
      }
      function rvSetTplOv(name, rows) {
        var m = rvLoadTplOv();
        m[name] = rows;
        rvSaveTplOv(m);
      }
      function rvClearTplOv(name) {
        var m = rvLoadTplOv();
        delete m[name];
        rvSaveTplOv(m);
      }
      /* serializa state.items -> só campos de dados (sem op/catalogOp runtime) */
      function rvSerializeItems(items) {
        return (items || []).map(function (i) {
          if (i.ticker !== undefined) {
            return {
              kind: "acao",
              ticker: i.ticker || "",
              nome: i.nome || "",
              setor: i.setor || "Outros",
              pct: Number(i.pct) || 0,
              precoAlvo:
                i.precoAlvo != null && !isNaN(Number(i.precoAlvo))
                  ? Number(i.precoAlvo)
                  : null,
              rating: i.rating || "",
            };
          }
          var o = { kind: "raw" };
          Object.keys(i).forEach(function (k) {
            if (k === "op" || k === "catalogOp" || k === "id") return;
            var v = i[k];
            var t = typeof v;
            if (t === "function" || t === "object") return;
            o[k] = v;
          });
          return o;
        });
      }
      /* reconstrói holdings a partir das linhas salvas (ações via mkAcao) */
      function rvRebuildItems(rows) {
        var out = [];
        (rows || []).forEach(function (r) {
          if (!r) return;
          if (
            r.kind === "acao" ||
            (r.ticker !== undefined && r.precoAlvo != null)
          ) {
            var it = mkAcao(
              r.ticker || "",
              r.nome || "Ação",
              r.setor || "Outros",
              Number(r.pct) || 0,
              r.precoAlvo != null ? Number(r.precoAlvo) : null,
              r.rating || "",
            );
            out.push(it);
          } else {
            var g = mk(
              r.classe || "Renda Variável",
              r.nome || "Ativo",
              Number(r.pct) || 0,
              r.detalhe || "",
              r.liquidez || "",
              r.estrutura || null,
              null,
              r.setor || "Outros",
            );
            Object.keys(r).forEach(function (k) {
              if (k === "kind" || k === "id") return;
              if (
                g[k] === undefined ||
                k === "pct" ||
                k === "nome" ||
                k === "setor"
              )
                g[k] = r[k];
            });
            out.push(g);
          }
        });
        return out;
      }
      /* resolve os itens de um template: override salvo tem prioridade sobre a fábrica */
      function resolveTemplateItems(t) {
        if (t !== "Montar do zero") {
          var ov = rvGetTplOv(t);
          if (ov && ov.length) {
            try {
              var built = rvRebuildItems(ov);
              if (built && built.length) return built;
            } catch (_) {}
          }
        }
        return TEMPLATES[t] ? TEMPLATES[t]() : [];
      }

      function fmtPreco(n) {
        var v = Number(n);
        if (isNaN(v)) return "0,00";
        return v.toFixed(2).replace(".", ",");
      }

      /* cenários de payoff no MESMO formato dos itens de OPERACOES (Fence/Collar) */
      function _protCen(prot, teto, tetoB) {
        var t = Number(teto),
          tb = Number(tetoB),
          p = Number(prot);
        if (isNaN(t)) t = 34.99;
        if (isNaN(tb)) tb = Math.round(t * 0.45 * 100) / 100;
        if (isNaN(p)) p = -20;
        function r2(x) {
          return Math.round(x * 100) / 100;
        }
        if (p <= -100) {
          return [
            [-30, 0],
            [-25, 0],
            [-10, 0],
            [-5, 0],
            [0, 0],
            [r2(tb / 2), r2(tb / 2)],
            [tb, tb],
            [t, t],
            [r2(t + 0.01), tb],
            [r2(t + 10), tb],
          ];
        }
        return [
          [r2(p - 20), -20],
          [r2(p - 10), -10],
          [r2(p - 5), -5],
          [p, 0],
          [r2(p / 2), 0],
          [0, 0],
          [r2(tb / 2), r2(tb / 2)],
          [tb, tb],
          [t, t],
          [r2(t + 0.01), tb],
          [r2(t + 10), tb],
        ];
      }

      /* Operação de PROTEÇÃO padrão por ticker — mesma forma dos itens de OPERACOES.
   Lê o override salvo em hubRvStructOverride (Tarefa 3) para persistir edições. */
      function defaultProt(ticker, nome, setor) {
        var base = {
          tipo: "Proteção parcial",
          protegeAte: -20,
          teto: 34.99,
          tetoBarreira: 15.75,
          barreira: 135,
        };
        var ov = rvGetStructOv(ticker);
        if (ov && typeof ov === "object") {
          ["protegeAte", "teto", "tetoBarreira", "barreira"].forEach(
            function (k) {
              if (ov[k] != null && !isNaN(Number(ov[k])))
                base[k] = Number(ov[k]);
            },
          );
          if (ov.tipo) base.tipo = ov.tipo;
        }
        var prot = Number(base.protegeAte);
        if (isNaN(prot)) prot = -20;
        var teto = Number(base.teto);
        if (isNaN(teto)) teto = 34.99;
        var tb = Number(base.tetoBarreira);
        if (isNaN(tb)) tb = Math.round(teto * 0.45 * 100) / 100;
        var barreira = Number(base.barreira);
        if (isNaN(barreira)) barreira = 135;
        var tipo =
          prot <= -100 ? "Proteção total" : base.tipo || "Proteção parcial";
        return {
          id: "prot_" + ticker,
          ativo: ticker,
          nome:
            (nome || ticker) +
            " · " +
            (prot <= -100 ? "Collar" : "Fence") +
            " " +
            fmtPct(teto) +
            "%",
          setor: setor || "Outros",
          tipo: tipo,
          protegeAte: prot,
          teto: teto,
          tetoBarreira: tb,
          barreira: barreira,
          cen: _protCen(prot, teto, tb),
        };
      }

      /* Ação da carteira: papel brasileiro com estrutura de proteção obrigatória. */
      function mkAcao(ticker, nome, setor, pct, precoAlvo, rating) {
        var det =
          ticker +
          " · PA R$ " +
          fmtPreco(precoAlvo) +
          (rating ? " · " + rating : "");
        var it = mk(
          "Renda Variável",
          nome,
          pct,
          det,
          "No vencimento",
          "protecao",
          null,
          setor,
        );
        it.ticker = ticker;
        it.precoAlvo = Number(precoAlvo);
        it.rating = rating || "";
        it.precoAtual = rvGetPreco(ticker);
        it.op = defaultProt(ticker, nome, setor);
        return it;
      }

      /* retorno esperado de um ativo (precoAlvo/precoAtual - 1) em % */
      function holdingRet(i) {
        var pa = Number(i.precoAlvo),
          pc = Number(i.precoAtual);
        if (!(pa > 0) || !(pc > 0)) return null;
        return (pa / pc - 1) * 100;
      }

      /* ===== Templates ===== */
      var TEMPLATES = {
        /* Carteiras XP Research — Raio-XP de 1 de setembro de 2026.
     Pesos, ratings e precos-alvo transcritos das laminas oficiais.
     Top Acoes: entram CURY3 e AXIA3, sobe RDOR3, saem LREN3 e ORVR3,
     caem ITUB4 e ROXO34. Top Dividendos: sobem PETR4 e ALOS3, cai ITUB4.
     Top Small Caps: entra DIRR3, sobe SLCE3, caem CEAB3 e CURY3. */
        "Top Ações": function () {
          return [
            mkAcao("PETR4", "Petrobras", "Energia", 10.0, 63.0, "Compra"),
            mkAcao("PRIO3", "PRIO", "Energia", 5.0, 78.0, "Compra"),
            mkAcao("GGBR4", "Gerdau", "Materiais", 10.0, 30.0, "Compra"),
            mkAcao("VALE3", "Vale", "Materiais", 5.0, 85.0, "Neutro"),
            mkAcao("EMBJ3", "Embraer", "Industriais", 10.0, 87.0, "Compra"),
            mkAcao("TOTS3", "TOTVS", "Tec. Info.", 5.0, 50.5, "Compra"),
            mkAcao("IGTI11", "Iguatemi", "Imobiliário", 7.5, 35.0, "Compra"),
            mkAcao("CURY3", "Cury", "Imobiliário", 5.0, 45.0, "Compra"),
            mkAcao("RDOR3", "Rede D'Or", "Saúde", 10.0, 45.0, "Compra"),
            mkAcao(
              "AXIA3",
              "Axia Energia",
              "Utilidade Pública",
              7.5,
              63.32,
              "Compra",
            ),
            mkAcao(
              "SBSP3",
              "Sabesp",
              "Utilidade Pública",
              7.5,
              38.25,
              "Compra",
            ),
            mkAcao("ITUB4", "Itaú Unibanco", "Financeiro", 7.5, 50.0, "Compra"),
            mkAcao("BPAC11", "BTG Pactual", "Financeiro", 5.0, 63.0, "Compra"),
            mkAcao("ROXO34", "Nubank", "Financeiro", 5.0, 18.6, "Compra"),
          ];
        },
        "Top Dividendos": function () {
          return [
            mkAcao("PETR4", "Petrobras", "Energia", 12.5, 63.0, "Compra"),
            mkAcao("PRIO3", "PRIO", "Energia", 5.0, 78.0, "Compra"),
            mkAcao("VALE3", "Vale", "Materiais", 12.5, 85.0, "Neutro"),
            mkAcao(
              "VIVT3",
              "Telefônica Brasil (Vivo)",
              "Comunicações",
              5.0,
              43.0,
              "Compra",
            ),
            mkAcao("ALOS3", "Allos", "Imobiliário", 10.0, 38.0, "Compra"),
            mkAcao(
              "CSMG3",
              "Copasa",
              "Utilidade Pública",
              7.5,
              88.32,
              "Compra",
            ),
            mkAcao(
              "AXIA3",
              "Axia Energia",
              "Utilidade Pública",
              12.5,
              63.32,
              "Compra",
            ),
            mkAcao(
              "CPLE3",
              "Copel",
              "Utilidade Pública",
              10.0,
              19.87,
              "Compra",
            ),
            mkAcao(
              "ITUB4",
              "Itaú Unibanco",
              "Financeiro",
              10.0,
              50.0,
              "Compra",
            ),
            mkAcao("B3SA3", "B3", "Financeiro", 10.0, 16.0, "Neutro"),
            mkAcao(
              "CXSE3",
              "Caixa Seguridade",
              "Financeiro",
              5.0,
              20.0,
              "Compra",
            ),
          ];
        },
        "Top Small Caps": function () {
          return [
            mkAcao("BMOB3", "Bemobi", "Comunicações", 10.0, 31.0, "Compra"),
            mkAcao("VIVA3", "Vivara", "Cons. Disc.", 5.0, 35.0, "Compra"),
            mkAcao("CEAB3", "C&A Modas", "Cons. Disc.", 5.0, 17.0, "Compra"),
            mkAcao("TUPY3", "Tupy", "Industriais", 5.0, 20.0, "Compra"),
            mkAcao("PRNR3", "Priner", "Industriais", 5.0, 31.0, "Compra"),
            mkAcao("ECOR3", "Ecorodovias", "Industriais", 5.0, 13.9, "Compra"),
            mkAcao("LWSA3", "LWSA", "Tec. Info.", 5.0, 5.0, "Compra"),
            mkAcao("CURY3", "Cury", "Imobiliário", 10.0, 45.0, "Compra"),
            mkAcao("DIRR3", "Direcional", "Imobiliário", 5.0, 20.0, "Compra"),
            mkAcao("TTEN3", "3tentos", "Cons. Básico", 5.0, 21.6, "Compra"),
            mkAcao(
              "SLCE3",
              "SLC Agrícola",
              "Cons. Básico",
              7.5,
              17.0,
              "Neutro",
            ),
            mkAcao(
              "ORVR3",
              "Orizon",
              "Utilidade Pública",
              15.0,
              97.48,
              "Compra",
            ),
            mkAcao(
              "ALUP11",
              "Alupar",
              "Utilidade Pública",
              12.5,
              43.49,
              "Compra",
            ),
            mkAcao("BRBI11", "BR Partners", "Financeiro", 5.0, 26.0, "Compra"),
          ];
        },
        "Montar do zero": function () {
          return [];
        },
      };

      /* helper Rubi (cupom pré-fixado) */
      function mkRubi(ativo, setor, taxa, barreira, cdi) {
        var it = mk(
          "Renda Variável",
          ativo,
          0,
          "Cupom pré-fixado · barreira de desarme",
          "No vencimento",
          "cupom",
          null,
          setor || "Outros",
        );
        it.cupomTaxa = taxa;
        it.cupomBarreira = barreira;
        it.cupomCDI = cdi != null ? cdi : "";
        return it;
      }

      /* ===== Catálogo de operações Cupom (Rubi) — presets prontos ===== */
      var RUBI_CATALOG = [
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
      function addRubiCatalogo(id) {
        var r = RUBI_CATALOG.filter(function (o) {
          return o.id === id;
        })[0];
        if (!r) return;
        var it = mkRubi(r.ativo, r.setor, r.taxa, r.barreira, r.cdi);
        state.items.push(it);
        state.abertos[it.id] = true;
        render();
      }

      /* ===== Operação de PROTEÇÃO editável (criada do zero, como a Rubi) ===== */
      function mkProtecao(ativo, setor, protegeAte, teto, barreira) {
        var it = mk(
          "Renda Variável",
          ativo,
          0,
          "Operação estruturada de proteção",
          "No vencimento",
          "protecao",
          null,
          setor || "Outros",
        );
        it.protTeto = teto != null ? teto : 34.99;
        it.protProtege = protegeAte != null ? protegeAte : -20;
        it.protBarreira = barreira != null ? barreira : 135;
        it.protTetoBarreira = Math.round(it.protTeto * 0.45 * 100) / 100;
        return it;
      }
      /* gera a operação efetiva a partir dos parâmetros editáveis da proteção */
      function protOp(it) {
        var teto = Number(it.protTeto);
        if (isNaN(teto)) teto = 34.99;
        var prot = Number(it.protProtege);
        if (isNaN(prot)) prot = -20;
        var barreira = Number(it.protBarreira);
        if (isNaN(barreira)) barreira = 135;
        var tetoB = Number(it.protTetoBarreira);
        if (isNaN(tetoB)) tetoB = Math.round(teto * 0.45 * 100) / 100;
        var cen = protCen(prot, teto, tetoB);
        var tipo = prot <= -100 ? "Proteção total" : "Proteção parcial";
        return {
          ativo: it.nome,
          protegeAte: prot,
          teto: teto,
          tetoBarreira: tetoB,
          barreira: barreira,
          tipo: tipo,
          nome:
            it.nome +
            " · " +
            (prot <= -100 ? "Collar" : "Fence") +
            " " +
            fmtPct(teto) +
            "%",
          cen: cen,
        };
      }
      /* monta cenários de payoff de uma operação de proteção */
      function protCen(protegeAte, teto, tetoBarreira) {
        var cen = [];
        if (protegeAte <= -100) {
          // capital protegido: piso em 0
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
          var p = Math.abs(protegeAte);
          cen = [
            [-(p + 20), protegeAte],
            [-(p + 10), Math.round((protegeAte / 2) * 10) / 10],
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

      var GLOSSARY = {
        rubi: {
          label: "Rubi · Cupom pré-fixado",
          desc: "Operação com opções que paga um cupom pré-fixado no vencimento, desde que o ativo não atinja a barreira de desarme. Se o ativo atingir a barreira (queda igual ou maior), o cupom não é pago e o investidor participa integralmente da queda desde o preço de entrada.",
        },
        collar: {
          match: ["collar"],
          label: "Collar UI",
          desc: "Proteção montada com opções sobre a ação: estabelece um piso, que limita a perda, e um teto, que limita o ganho durante o período da operação.",
        },
        fence: {
          match: ["fence"],
          label: "Fence",
          desc: "Proteção parcial feita com opções sobre a ação: protege parte da queda e mantém a alta limitada por um teto.",
        },
      };
      function detectGlossario(items) {
        var terms = [];
        var blob = items
          .map(function (i) {
            return (i.nome + " " + (i.detalhe || "")).toLowerCase();
          })
          .join(" ");
        var hasRubi = items.some(function (i) {
          var st = structureTag(i);
          return st && st.kind === "cupom";
        });
        if (hasRubi) terms.push("rubi");
        ["collar", "fence"].forEach(function (k) {
          if (
            GLOSSARY[k].match.some(function (m) {
              return blob.indexOf(m) >= 0;
            })
          )
            terms.push(k);
        });
        return terms;
      }

      /* ===== Rubi · cupom pré-fixado com barreira de desarme ===== */
      function cupomCen(taxa, barreira) {
        var b = barreira; // ex.: -20 (barreira de desarme)
        var mid = Math.round(b / 2); // ex.: -10 (queda moderada, acima da barreira)
        if (mid === b) mid = b + 1;
        var up = Math.max(Math.round(Math.abs(b)), Math.round(taxa)) + 15;
        return [
          [b - 15, b - 15], // bem abaixo da barreira → perda integral
          [b, b], // atinge a barreira (desarme) → participa da queda
          [mid, taxa], // queda moderada, acima da barreira → cupom
          [0, taxa], // estável → cupom
          [up, taxa], // alta → cupom (limitado ao cupom)
        ];
      }
      function cupomOp(it) {
        var taxa = Number(it.cupomTaxa);
        if (isNaN(taxa)) taxa = 12;
        var barreira = Number(it.cupomBarreira);
        if (isNaN(barreira)) barreira = -20;
        var cdiRaw = it.cupomCDI;
        var cdi =
          cdiRaw === 0 ||
          (cdiRaw != null && cdiRaw !== "" && !isNaN(Number(cdiRaw)))
            ? Number(cdiRaw)
            : null;
        return {
          ativo: it.nome,
          cupom: true,
          taxa: taxa,
          barreira: barreira,
          cdi: cdi,
          tipo: "Cupom pré-fixado",
          nome: it.nome + " · Cupom " + fmtPct(taxa) + "%",
          cen: cupomCen(taxa, barreira),
        };
      }
      function effectiveOp(it) {
        if (it.op) return it.op;
        var st = structureTag(it);
        if (st && st.kind === "cupom") return cupomOp(it);
        if (st && st.kind === "protecao") return protOp(it);
        return null;
      }

      /* ===== Cenários representativos + barras ===== */
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
      function scenarioLabel(x) {
        return x === 0
          ? "Estável"
          : (x > 0 ? "+" : "−") + fmtPct(Math.abs(x)) + "%";
      }
      function barCor(v) {
        return v > 0 ? "#2BD9A6" : v < 0 ? "#FF5566" : "#F5B63E";
      }
      var GHOST_FILL = "rgba(125,138,180,.32)",
        GHOST_STROKE = "rgba(168,180,222,.55)";

      /* Tabela de cenários no formato do Hub XP: Variação do ativo x Variação da estratégia,
   com bolinha colorida por linha (verde ganho / amarelo neutro / vermelho perda). */
      function payoffBarsSVG(op, compact) {
        var ativoNome = op.ativo || "o ativo";
        // cenários completos, ordenados do maior para o menor (como na tela da XP)
        var scen = (op.cen || []).slice().sort(function (a, b) {
          return b[0] - a[0];
        });
        if (compact) {
          // versão enxuta para os cards do catálogo: usa cenários-chave
          scen = keyScenarios(op)
            .slice()
            .sort(function (a, b) {
              return b[0] - a[0];
            });
        }
        function fmtSigned(v) {
          if (v === 0) return "0%";
          return (v > 0 ? "+" : "−") + fmtPct(Math.abs(v)) + "%";
        }
        function dot(v) {
          var c = v > 0 ? "#2BD9A6" : v < 0 ? "#FF5566" : "#F5B63E";
          return '<span class="cen-dot" style="background:' + c + '"></span>';
        }
        function valCol(v) {
          return v > 0 ? "#2BD9A6" : v < 0 ? "#FF5566" : "#F5B63E";
        }

        var fs = compact ? "11px" : "12.5px";
        var pad = compact ? "5px 8px" : "7px 12px";
        var h = '<div class="cen-table' + (compact ? " compact" : "") + '">';
        h +=
          '<div class="cen-head">' +
          "<span>Variação % de " +
          esc(ativoNome) +
          "</span>" +
          "<span>Variação % da estratégia</span>" +
          "</div>";
        scen.forEach(function (p, i) {
          h +=
            '<div class="cen-row' +
            (i % 2 ? " alt" : "") +
            '">' +
            '<span class="cen-cell">' +
            dot(p[0]) +
            '<b style="color:' +
            valCol(p[0]) +
            '">' +
            fmtSigned(p[0]) +
            "</b></span>" +
            '<span class="cen-cell">' +
            dot(p[1]) +
            '<b style="color:' +
            valCol(p[1]) +
            '">' +
            fmtSigned(p[1]) +
            "</b></span>" +
            "</div>";
        });
        h += "</div>";
        return h;
      }

      /* ===== Estado ===== */
      var state = {
        template: "Top Ações",
        items: resolveTemplateItems("Top Ações"),
        cliente: "",
        patrimonio: 1000000,
        abertos: {},
        showRubi: false,
        showOps: false,
        showQuanto: false,
        rvCatSearch: "",
      };

      function esc(t) {
        return (t == null ? "" : String(t))
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");
      }

      /* ===== Derivados ===== */
      function calc() {
        var items = state.items;
        var total = items.reduce(function (s, i) {
          return s + (Number(i.pct) || 0);
        }, 0);
        var restante = Math.round((100 - total) * 10) / 10;
        var totalOk = Math.abs(total - 100) < 0.05;
        var byClass = {};
        CLASSES.forEach(function (c) {
          byClass[c] = 0;
        });
        items.forEach(function (i) {
          byClass[i.classe] = (byClass[i.classe] || 0) + (Number(i.pct) || 0);
        });
        var bySetor = {};
        items.forEach(function (i) {
          var s = i.setor || "Outros";
          bySetor[s] = (bySetor[s] || 0) + (Number(i.pct) || 0);
        });
        var estruturaBreak = { none: 0, protecao: 0, cupom: 0 };
        items
          .filter(function (i) {
            return i.classe === "Renda Variável";
          })
          .forEach(function (i) {
            var st = structureTag(i);
            var k = st ? st.kind : "none";
            estruturaBreak[k] += Number(i.pct) || 0;
          });
        var pctAcoes = byClass["Renda Variável"] || 0;
        var glossTerms = detectGlossario(items);
        var grouped = {};
        CLASSES.forEach(function (c) {
          grouped[c] = [];
        });
        items.forEach(function (i) {
          if (!grouped[i.classe]) grouped[i.classe] = [];
          grouped[i.classe].push(i);
        });
        var donut = [];
        var acc = 0;
        Object.keys(bySetor)
          .filter(function (s) {
            return bySetor[s] > 0;
          })
          .sort(function (a, b) {
            return bySetor[b] - bySetor[a];
          })
          .forEach(function (s) {
            donut.push({ s: s, v: bySetor[s], start: acc });
            acc += bySetor[s];
          });
        // Retorno esperado ponderado (Tarefa 2): média de (PA/cotação-1) ponderada pelo peso, só sobre ativos precificados
        var retWSum = 0,
          retWRet = 0,
          retN = 0,
          retM = 0;
        items.forEach(function (i) {
          var pa = Number(i.precoAlvo);
          if (!(pa > 0)) return;
          retM++;
          var pc = Number(i.precoAtual);
          if (pc > 0) {
            var r = (pa / pc - 1) * 100;
            var w = Number(i.pct) || 0;
            retWSum += w;
            retWRet += w * r;
            retN++;
          }
        });
        var retEsp = retWSum > 0 ? retWRet / retWSum : null;
        return {
          total: total,
          restante: restante,
          totalOk: totalOk,
          byClass: byClass,
          bySetor: bySetor,
          estruturaBreak: estruturaBreak,
          pctAcoes: pctAcoes,
          glossTerms: glossTerms,
          grouped: grouped,
          donut: donut,
          retEsp: retEsp,
          retEspCobertura: { n: retN, m: retM },
        };
      }

      /* ===== Donut helpers ===== */
      function polar(cx, cy, r, pct) {
        var a = (pct / 100) * 2 * Math.PI - Math.PI / 2;
        return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
      }
      function arc(cx, cy, r, startPct, sweepPct) {
        var p1 = polar(cx, cy, r, startPct),
          p2 = polar(cx, cy, r, startPct + sweepPct);
        var large = sweepPct > 50 ? 1 : 0;
        return (
          "M " +
          p1[0] +
          " " +
          p1[1] +
          " A " +
          r +
          " " +
          r +
          " 0 " +
          large +
          " 1 " +
          p2[0] +
          " " +
          p2[1]
        );
      }

      /* ===== Item row HTML ===== */
      function itemRowHTML(i) {
        var st = structureTag(i);
        var cur = st ? st.kind : "none";
        var html = '<div class="row" data-id="' + i.id + '">';
        html += '<div class="rowtop">';
        html +=
          '<div class="pctwrap"><input class="pctinput" type="text" inputmode="decimal" value="' +
          String(i.pct).replace(".", ",") +
          '" data-act="pct"><span class="pctsym">%</span></div>';
        html +=
          '<input class="nameinput" value="' +
          esc(i.nome) +
          '" data-act="nome">';
        html +=
          '<select class="sel" data-act="classe">' +
          CLASSES.map(function (cl) {
            return (
              "<option" +
              (cl === i.classe ? " selected" : "") +
              ">" +
              cl +
              "</option>"
            );
          }).join("") +
          "</select>";
        var setSel = i.setor || "Outros";
        html +=
          '<select class="sel" data-act="setor" style="color:' +
          setorCor(setSel) +
          ';font-weight:700">' +
          SETORES.map(function (s) {
            return (
              "<option" +
              (s === setSel ? " selected" : "") +
              ' style="color:#cfd4ef">' +
              s +
              "</option>"
            );
          }).join("") +
          "</select>";
        html +=
          '<button class="delbtn" data-act="remove" title="Remover">' +
          ICON_TRASH +
          "</button>";
        html += "</div>";

        if (window.__xpAssetLink) html += window.__xpAssetLink(i);
        if (i.opcoes) {
          html +=
            '<div class="tagsrow"><span class="estlabel">Cliente escolhe:</span>';
          i.opcoes.forEach(function (o, idx) {
            var active = i.escolha === idx;
            html +=
              '<button class="estbtn" data-act="escolha" data-idx="' +
              idx +
              '" style="border-radius:8px;border:1px solid ' +
              (active ? ORANGE : "rgba(120,130,210,.25)") +
              ";background:" +
              (active ? "rgba(242,101,34,.18)" : "rgba(0,0,0,.25)") +
              ";color:" +
              (active ? "#FF8B52" : "#A9B0D6") +
              ';padding:5px 11px">' +
              esc(o.rotulo) +
              "</button>";
          });
          html += "</div>";
        }

        html += '<div class="tagsrow">';
        html +=
          '<span class="tag setor" style="background:' +
          setorCor(setSel) +
          "22;border-color:" +
          setorCor(setSel) +
          "66;color:" +
          setorCor(setSel) +
          '">' +
          esc(setSel) +
          "</span>";
        if (isFII(i)) html += '<span class="tag cetip">CETIPADO</span>';
        if (i.classe === "Renda Variável") {
          html += '<span class="estlabel">Estrutura</span>';
          html += '<div class="esttoggle">';
          ["none", "protecao", "cupom"].forEach(function (k) {
            var active = cur === k;
            var bg = {
              none: "rgba(120,130,210,.22)",
              protecao: "rgba(242,101,34,.22)",
              cupom: "rgba(224,69,123,.22)",
            }[k];
            var pre = k === "protecao" ? ICON_SHIELD : "";
            html +=
              '<button class="estbtn" data-act="estrutura" data-kind="' +
              k +
              '" style="background:' +
              (active ? bg : "transparent") +
              ";color:" +
              (active ? STRUCT_COLORS[k] : "#6F77A8") +
              '">' +
              pre +
              STRUCT_LABEL[k] +
              "</button>";
          });
          html += "</div>";
          if (cur === "cupom") {
            var tx = Number(i.cupomTaxa);
            if (isNaN(tx)) tx = 12;
            var bcur = Number(i.cupomBarreira);
            if (isNaN(bcur)) bcur = -20;
            html += '<span class="tag rubi">Cupom · ' + fmtPct(tx) + "%</span>";
            html +=
              '<span class="tag rubi">Desarme ' + fmtPct(bcur) + "%</span>";
            if (
              i.cupomCDI != null &&
              i.cupomCDI !== "" &&
              !isNaN(Number(i.cupomCDI))
            )
              html +=
                '<span class="tag rubi">≈ ' +
                fmtPct(Number(i.cupomCDI)) +
                "% CDI</span>";
          }
        } else {
          if (i.op && i.op.quanto) {
            html +=
              i.op.payoff === 1
                ? '<span class="tag isento">Capital protegido</span>'
                : '<span class="tag cupom">Taxa fixa garantida</span>';
            html += '<span class="tag protecao">Quanto · moeda local</span>';
          }
          if (st && st.kind === "cupom")
            html += '<span class="tag rubi">' + st.label + "</span>";
          if (st && st.kind === "protecao" && !(i.op && i.op.quanto))
            html += '<span class="tag protecao">' + st.label + "</span>";
        }
        if (i.liquidez)
          html +=
            '<span class="tag liq">Liquidez · ' + esc(i.liquidez) + "</span>";
        if (isIsento(i.nome)) {
          html +=
            '<span class="tag resgate">Resgate trabalhado</span><span class="tag isento">Isento de IR</span>';
        }
        html += "</div>";

        if (
          i.ticker !== undefined ||
          (i.precoAlvo != null && !isNaN(Number(i.precoAlvo)))
        ) {
          var _ret = holdingRet(i);
          var _rc =
            _ret == null ? "#8A93D8" : _ret >= 0 ? "#2BD9A6" : "#FF5566";
          var _rt =
            _ret == null ? "—" : (_ret > 0 ? "+" : "") + fmtPct(_ret) + "%";
          var _inpS =
            "background:rgba(0,0,0,.3);border:1px solid rgba(120,130,210,.2);border-radius:9px;color:#fff;font-weight:700;font-size:14px;padding:7px 10px;text-align:right;outline:none";
          if (i.ticker !== undefined) {
            html +=
              '<div class="tagsrow" style="align-items:center;gap:8px;margin-top:2px">';
            html += '<span class="estlabel">Ticker</span>';
            html +=
              '<input class="cotinput" type="text" value="' +
              esc(i.ticker || "") +
              '" placeholder="TICKER" data-act="ticker" style="width:104px;background:rgba(0,0,0,.3);border:1px solid rgba(255,139,82,.3);border-radius:9px;color:#FF8B52;font-weight:800;font-size:14px;padding:7px 10px;text-align:left;text-transform:uppercase;letter-spacing:.5px;outline:none">';
            html +=
              '<span class="estlabel">Preço-alvo</span><span style="color:#6F77A8;font-weight:800;font-size:13px">R$</span>';
            html +=
              '<input class="cotinput" type="text" inputmode="decimal" value="' +
              (i.precoAlvo != null && !isNaN(Number(i.precoAlvo))
                ? fmtPreco(i.precoAlvo)
                : "") +
              '" placeholder="—" data-act="precoAlvo" style="width:88px;' +
              _inpS +
              '">';
            html += "</div>";
          }
          html +=
            '<div class="tagsrow" style="align-items:center;gap:10px;margin-top:2px">';
          html += '<span class="estlabel">Cotação atual</span>';
          html +=
            '<span style="color:#6F77A8;font-weight:800;font-size:13px">R$</span>';
          html +=
            '<input class="cotinput" type="text" inputmode="decimal" value="' +
            (i.precoAtual != null ? fmtPreco(i.precoAtual) : "") +
            '" placeholder="—" data-act="precoAtual" style="width:88px;' +
            _inpS +
            '">';
          html +=
            '<span class="tag" data-rvrettag style="background:' +
            _rc +
            "22;border-color:" +
            _rc +
            "66;color:" +
            _rc +
            '">Retorno esperado ' +
            _rt +
            "</span>";
          if (i.op) {
            html +=
              '<button class="estbtn" data-act="editstruct" title="Editar parâmetros da proteção" style="margin-left:auto;color:#FF8B52;border:1px solid rgba(255,139,82,.45);border-radius:8px;background:rgba(255,139,82,.12)">' +
              ICON_SHIELD +
              " Editar estrutura</button>";
          }
          html += "</div>";
        }

        if ((i.op && st) || cur === "cupom" || cur === "protecao") {
          var open = !!state.abertos[i.id];
          html +=
            '<button class="howbtn' +
            (open ? " open" : "") +
            '" data-act="toggle"><span class="arr">▾</span> Como funciona a operação</button>';
          if (open) {
            if (cur === "cupom" && !i.op) html += cupomBoxHTML(i);
            else if (cur === "protecao" && !i.op) html += protBoxHTML(i);
            else html += howBoxHTML(i);
          }
        }

        html +=
          '<input class="detinput" value="' +
          esc(i.detalhe) +
          '" placeholder="Detalhe (tese, estrutura, prazo…)" data-act="detalhe">';
        html +=
          '<div class="valhint">≈ R$ ' +
          fmtBRL((state.patrimonio * (Number(i.pct) || 0)) / 100) +
          "</div>";
        html += "</div>";
        return html;
      }

      function howBoxHTML(i) {
        var op = i.op;
        var h = '<div class="howbox">';
        h +=
          '<div style="font-size:11.5px;color:#A9B0D6;font-weight:700;margin-bottom:8px">O que acontece com R$ 100 investidos em cada cenário de ' +
          op.ativo +
          ":</div>";
        h += payoffBarsSVG(op, false);
        h += '<div class="legend">';
        h +=
          '<span class="li"><span class="legbox" style="border:1px solid rgba(168,180,222,.55);background:rgba(125,138,180,.45)"></span>' +
          (op.quanto ? "Índice puro" : "Ação pura") +
          "</span>";
        h +=
          '<span class="li"><span class="legbox" style="background:#2BD9A6"></span>Estrutura · ganho</span>';
        h +=
          '<span class="li"><span class="legbox" style="background:#F5B63E"></span>Estável</span>';
        h +=
          '<span class="li"><span class="legbox" style="background:#FF5566"></span>Perda</span>';
        h += "</div>";
        if (op.quanto) {
          h +=
            '<div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:12px">';
          h += '<span class="chip-orange">' + op.tipo + "</span>";
          if (op.payoff === 1)
            h +=
              '<span class="chip">Multiplicador ' +
              fmtMult(op.mult) +
              'x</span><span class="chip">Capital protegido</span><span class="chip">Sem teto</span>';
          else
            h +=
              '<span class="chip">Taxa fixa ' +
              fmtTaxa(op.taxa) +
              '%</span><span class="chip">Alta 1:1 · sem teto</span>';
          h +=
            '<span class="chip">Prazo ' +
            op.fixing +
            '</span><span class="chip">Quanto · moeda local</span></div>';
        } else {
          h +=
            '<div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:12px">';
          h += '<span class="chip-orange">' + op.tipo + "</span>";
          h +=
            '<span class="chip">Protege até ' +
            (op.protegeAte <= -100
              ? "qualquer queda"
              : fmtPct(op.protegeAte) + "%") +
            "</span>";
          h +=
            '<span class="chip">Teto ' +
            fmtPct(op.teto) +
            '%</span><span class="chip">Teto c/ barreira ' +
            fmtPct(op.tetoBarreira) +
            '%</span><span class="chip">Barreira ' +
            fmtPct(op.barreira) +
            "%</span></div>";
        }
        var cen = op.cen;
        var low = cen.reduce(function (a, b) {
          return b[0] < a[0] ? b : a;
        });
        var high = cen.reduce(function (a, b) {
          return b[0] > a[0] ? b : a;
        });
        function cmp(titulo, av, est) {
          return (
            '<div class="cmpcard"><div style="font-size:11px;color:#A9B0D6;font-weight:700;margin-bottom:6px">' +
            titulo +
            "</div>" +
            '<div style="display:flex;justify-content:space-between;font-size:12.5px"><span style="color:#9aa2cf">Avulso</span><span style="font-weight:800;color:' +
            (av >= 0 ? "#2BD9A6" : "#FF6B2C") +
            '">' +
            (av > 0 ? "+" : "") +
            fmtPct(av) +
            "%</span></div>" +
            '<div style="display:flex;justify-content:space-between;font-size:12.5px;margin-top:3px"><span style="color:#FF8B52">Estruturada</span><span style="font-weight:800;color:' +
            (est >= 0 ? "#2BD9A6" : "#FF6B2C") +
            '">' +
            (est > 0 ? "+" : "") +
            fmtPct(est) +
            "%</span></div>" +
            '<div style="font-size:10.5px;color:#6F77A8;margin-top:5px">diferença ' +
            (est - av >= 0 ? "+" : "") +
            fmtPct(est - av) +
            " p.p.</div></div>"
          );
        }
        h +=
          '<div class="cmpgrid">' +
          cmp(
            "Se " + op.ativo + " cair " + fmtPct(Math.abs(low[0])) + "%",
            low[0],
            low[1],
          ) +
          cmp(
            "Se " + op.ativo + " subir " + fmtPct(high[0]) + "%",
            high[0],
            high[1],
          ) +
          "</div>";
        var nota;
        if (op.quanto) {
          if (op.payoff === 1)
            nota =
              "Cada cenário mostra o " +
              op.ativo +
              " sozinho (barra cinza) e a operação Quanto (barra colorida). Na queda, o capital é devolvido integralmente (retorno 0%). Na alta, você recebe a variação do índice × " +
              fmtMult(op.mult) +
              ", sem teto. Quanto: resultado em moeda local, sem risco cambial. Prazo de " +
              op.fixing +
              ".";
          else
            nota =
              "Cada cenário mostra o " +
              op.ativo +
              " sozinho (barra cinza) e a operação Quanto (barra colorida). Você recebe sempre o maior entre a taxa fixa de " +
              fmtTaxa(op.taxa) +
              "% e a alta do índice (1:1, sem teto). Quanto: moeda local, sem risco cambial. Prazo de " +
              op.fixing +
              ". Confirme as condições de proteção de capital na lâmina antes de apresentar ao cliente.";
        } else {
          nota =
            "Cada cenário tem duas barras: comprar " +
            op.ativo +
            " sozinho (barra cinza) e com a estrutura (barra colorida). Na queda, a estrutura segura a perda; na alta, ela acompanha o ativo até o teto. Se " +
            op.ativo +
            " tocar a barreira de " +
            fmtPct(op.barreira) +
            "%, o teto cai para " +
            fmtPct(op.tetoBarreira) +
            "% (knock-out).";
        }
        h +=
          '<div style="font-size:11px;color:#6F77A8;margin-top:8px;line-height:1.45">' +
          nota +
          "</div>";
        h += "</div>";
        return h;
      }

      function legendHTML(quanto) {
        var h = '<div class="legend">';
        h +=
          '<span class="li"><span class="legbox" style="border:1px solid rgba(168,180,222,.55);background:rgba(125,138,180,.45)"></span>' +
          (quanto ? "Índice puro" : "Ação pura") +
          "</span>";
        h +=
          '<span class="li"><span class="legbox" style="background:#2BD9A6"></span>Estrutura · ganho</span>';
        h +=
          '<span class="li"><span class="legbox" style="background:#F5B63E"></span>Estável</span>';
        h +=
          '<span class="li"><span class="legbox" style="background:#FF5566"></span>Perda</span>';
        h += "</div>";
        return h;
      }

      function cupomBoxHTML(i) {
        var taxa = Number(i.cupomTaxa);
        if (isNaN(taxa)) taxa = 12;
        var barreira = Number(i.cupomBarreira);
        if (isNaN(barreira)) barreira = -20;
        var cdiRaw = i.cupomCDI;
        var cdi =
          cdiRaw === 0 ||
          (cdiRaw != null && cdiRaw !== "" && !isNaN(Number(cdiRaw)))
            ? Number(cdiRaw)
            : null;
        var op = cupomOp(i);
        var h = '<div class="howbox">';
        h +=
          '<div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:14px">';
        h +=
          '<div><div class="estlabel" style="margin-bottom:6px">Cupom pré-fixado (valor prefixado)</div>' +
          '<div style="position:relative;width:120px"><input class="pctinput" type="number" step="0.5" value="' +
          taxa +
          '" data-act="cupomTaxa" style="color:' +
          RUBI +
          '"><span class="pctsym">%</span></div></div>';
        h +=
          '<div><div class="estlabel" style="margin-bottom:6px">Barreira de desarme (cenário de perda)</div>' +
          '<div style="position:relative;width:120px"><input class="pctinput" type="number" step="1" value="' +
          barreira +
          '" data-act="cupomBarreira" style="color:#FF8B52"><span class="pctsym">%</span></div></div>';
        h +=
          '<div><div class="estlabel" style="margin-bottom:6px">Equivalente (% do CDI) · opcional</div>' +
          '<div style="position:relative;width:150px"><input class="pctinput" type="number" step="0.01" value="' +
          (cdi != null ? cdi : "") +
          '" placeholder="ex.: 147,71" data-act="cupomCDI" style="color:#FFB020;font-size:15px"><span class="pctsym">%</span></div></div>';
        h += "</div>";
        h +=
          '<div style="font-size:11.5px;color:#A9B0D6;font-weight:700;margin-bottom:8px">O que acontece com R$ 100 investidos em cada cenário de ' +
          esc(i.nome) +
          ":</div>";
        h +=
          '<div class="cupom-chart" data-id="' +
          i.id +
          '">' +
          payoffBarsSVG(op, false) +
          "</div>";
        h += legendHTML(false);
        h +=
          '<div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:12px">' +
          '<span class="chip-rubi">Cupom pré-fixado</span>' +
          '<span class="chip">Cupom ' +
          fmtPct(taxa) +
          "%</span>" +
          (cdi != null
            ? '<span class="chip">≈ ' + fmtPct(cdi) + "% do CDI</span>"
            : "") +
          '<span class="chip">Barreira de desarme ' +
          fmtPct(barreira) +
          "%</span>" +
          '<span class="chip">Acima da barreira: cupom garantido</span>' +
          '<span class="chip">Atingiu a barreira: participa da queda</span></div>';
        h +=
          '<div style="font-size:11px;color:#6F77A8;margin-top:8px;line-height:1.45">Enquanto ' +
          esc(i.nome) +
          " não atingir a barreira de desarme de " +
          fmtPct(Math.abs(barreira)) +
          "% de queda, você recebe o cupom fixo de " +
          fmtPct(taxa) +
          "%" +
          (cdi != null ? " (≈ " + fmtPct(cdi) + "% do CDI)" : "") +
          " no vencimento — mesmo que o ativo suba (o ganho fica limitado ao cupom). Se " +
          esc(i.nome) +
          " atingir " +
          fmtPct(Math.abs(barreira)) +
          "% de queda ou mais (em relação ao preço de entrada), o cupom não é pago e você passa a participar integralmente da queda desde o preço de entrada.</div>";
        h += "</div>";
        return h;
      }

      function redrawCupomChart(id) {
        var i = state.items.filter(function (x) {
          return x.id === id;
        })[0];
        var cont = document.querySelector('.cupom-chart[data-id="' + id + '"]');
        if (i && cont) cont.innerHTML = payoffBarsSVG(cupomOp(i), false);
      }

      /* ===== Box editável da operação de PROTEÇÃO criada do zero ===== */
      function protBoxHTML(i) {
        var teto = Number(i.protTeto);
        if (isNaN(teto)) teto = 34.99;
        var prot = Number(i.protProtege);
        if (isNaN(prot)) prot = -20;
        var barreira = Number(i.protBarreira);
        if (isNaN(barreira)) barreira = 135;
        var tetoB = Number(i.protTetoBarreira);
        if (isNaN(tetoB)) tetoB = Math.round(teto * 0.45 * 100) / 100;
        var op = protOp(i);
        var h = '<div class="howbox">';
        h +=
          '<div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:14px">';
        h +=
          '<div><div class="estlabel" style="margin-bottom:6px">Protege até (queda, use -100 p/ total)</div>' +
          '<div style="position:relative;width:130px"><input class="pctinput" type="number" step="1" value="' +
          prot +
          '" data-act="protProtege" style="color:#FF8B52"><span class="pctsym">%</span></div></div>';
        h +=
          '<div><div class="estlabel" style="margin-bottom:6px">Teto de alta (ganho máximo)</div>' +
          '<div style="position:relative;width:120px"><input class="pctinput" type="number" step="0.5" value="' +
          teto +
          '" data-act="protTeto" style="color:#2BD9A6"><span class="pctsym">%</span></div></div>';
        h +=
          '<div><div class="estlabel" style="margin-bottom:6px">Teto se tocar barreira</div>' +
          '<div style="position:relative;width:120px"><input class="pctinput" type="number" step="0.5" value="' +
          tetoB +
          '" data-act="protTetoBarreira" style="color:#FFB020"><span class="pctsym">%</span></div></div>';
        h +=
          '<div><div class="estlabel" style="margin-bottom:6px">Barreira (alta de desarme do teto)</div>' +
          '<div style="position:relative;width:120px"><input class="pctinput" type="number" step="1" value="' +
          barreira +
          '" data-act="protBarreira" style="color:#7FD8F5"><span class="pctsym">%</span></div></div>';
        h += "</div>";
        h +=
          '<div style="font-size:11.5px;color:#A9B0D6;font-weight:700;margin-bottom:8px">O que acontece com R$ 100 investidos em cada cenário de ' +
          esc(i.nome) +
          ":</div>";
        h +=
          '<div class="prot-chart" data-id="' +
          i.id +
          '">' +
          payoffBarsSVG(op, false) +
          "</div>";
        h += legendHTML(false);
        h +=
          '<div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:12px">' +
          '<span class="chip-orange">' +
          op.tipo +
          "</span>" +
          '<span class="chip">Protege até ' +
          (prot <= -100 ? "qualquer queda" : fmtPct(prot) + "%") +
          "</span>" +
          '<span class="chip">Teto ' +
          fmtPct(teto) +
          "%</span>" +
          '<span class="chip">Teto c/ barreira ' +
          fmtPct(tetoB) +
          "%</span>" +
          '<span class="chip">Barreira ' +
          fmtPct(barreira) +
          "%</span></div>";
        h +=
          '<div style="font-size:11px;color:#6F77A8;margin-top:8px;line-height:1.45">Na queda, a estrutura segura a perda (' +
          (prot <= -100
            ? "capital protegido, 0% de perda"
            : "protege até " + fmtPct(prot) + "% de queda") +
          "); na alta, acompanha o ativo 1:1 até o teto de " +
          fmtPct(teto) +
          "%. Se " +
          esc(i.nome) +
          " tocar a barreira de " +
          fmtPct(barreira) +
          "% de alta, o teto cai para " +
          fmtPct(tetoB) +
          "% (knock-out). Ajuste os parâmetros conforme a operação estruturada montada na mesa XP.</div>";
        h += "</div>";
        return h;
      }
      function redrawProtChart(id) {
        var i = state.items.filter(function (x) {
          return x.id === id;
        })[0];
        var cont = document.querySelector('.prot-chart[data-id="' + id + '"]');
        if (i && cont) cont.innerHTML = payoffBarsSVG(protOp(i), false);
      }

      /* ===== Ícones inline ===== */
      var ICON_TRASH =
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
      var ICON_SHIELD =
        '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
      var ICON_GEM =
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px"><path d="M6 3h12l4 6-10 13L2 9z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>';
      var ICON_LAYERS =
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>';
      var ICON_PIE =
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>';
      var ICON_GLOBE =
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
      var ICON_DOWNLOAD =
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
      var ICON_COPY =
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
      var ICON_CHECK =
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px"><polyline points="20 6 9 17 4 12"/></svg>';
      var ICON_ROTATE =
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:6px"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>';
      var ICON_PLUS =
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
      var ICON_SAVE =
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:6px"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>';
      var ICON_SEARCH_RV =
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
      var ICON_CARD =
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 9h20"/><path d="M6 14h6"/><path d="M16 14h2"/></svg>';

      /* ===== Render principal ===== */
      function render() {
        var d = calc();
        var app = document.getElementById("rv-app");
        var h = "";

        /* HEADER */
        h +=
          '<div class="header" style="border-bottom:none;padding-bottom:0;margin-bottom:6px"><div>' +
          '<div class="sub" style="font-size:13px">Selecione um perfil ou monte do zero · operações estruturadas e Quanto</div>' +
          '</div><div class="hbtns">' +
          '<button class="btn-ghost" id="rvBtnCard" style="border-color:rgba(242,101,34,.5);color:#FF8B52">' +
          ICON_CARD +
          " Visualizar operação</button>" +
          '<button class="btn-solid" id="rvBtnProj" style="background:linear-gradient(135deg,#2BD9A6,#12A87B);border:none;color:#06251C;font-weight:800;box-shadow:0 4px 14px rgba(43,217,166,.32)">\u{1F4C8} Projeção da carteira</button>' +
          '<button class="btn-solid" id="rvBtnPng">' +
          ICON_DOWNLOAD +
          " Gerar PNG</button>" +
          "</div></div>";

        /* TEMPLATES */
        var _hasOv = !!rvGetTplOv(state.template);
        var _isZero = state.template === "Montar do zero";
        h += '<div class="tabs">';
        Object.keys(TEMPLATES).forEach(function (t) {
          var mod = t !== "Montar do zero" && !!rvGetTplOv(t);
          h +=
            '<button class="tab' +
            (state.template === t ? " active" : "") +
            '" data-tpl="' +
            esc(t) +
            '">' +
            esc(t) +
            (mod
              ? ' <span style="font-size:10px;font-weight:800;color:#2BD9A6;letter-spacing:.3px">• EDITADO</span>'
              : "") +
            "</button>";
        });
        if (!_isZero) {
          h +=
            '<button class="tab" id="rvBtnSaveDefault" style="margin-left:auto;border-color:rgba(43,217,166,.5);color:#2BD9A6">' +
            ICON_SAVE +
            "Salvar carteira como padrão</button>";
        } else {
          h +=
            '<button class="tab" id="rvBtnRestore" style="margin-left:auto">' +
            ICON_ROTATE +
            "Restaurar perfil</button>";
        }
        h += "</div>";

        /* Feature 1: barra de cotações automáticas (brapi.dev) */
        h +=
          '<div class="rv-cot-tools" style="display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-top:10px">' +
          '<button class="addbtn" id="rvBtnFetchAll" style="background:rgba(43,217,166,.1);border-color:rgba(43,217,166,.5);color:#2BD9A6;font-weight:700">\uD83D\uDD04 Atualizar cotações de todos os ativos</button>' +
          '<span data-rvcotts style="font-size:12px;color:#8A93D8">' +
          esc(rvLastQuoteTs || "") +
          "</span>" +
          "</div>";
        /* CLIENTE + PATRIMONIO */
        h +=
          '<div class="topinputs">' +
          '<div style="flex:1 1 320px"><label class="lbl">Nome do cliente</label><input id="inpCliente" class="inp" placeholder="Ex.: João Andrade" value="' +
          esc(state.cliente) +
          '"></div>' +
          '<div style="flex:1 1 220px"><label class="lbl">Patrimônio a alocar</label><div style="position:relative">' +
          '<span style="position:absolute;left:14px;top:12px;color:#6F77A8;font-weight:800;font-size:16px">R$</span>' +
          '<input id="inpPatrimonio" class="inp" inputmode="numeric" style="padding-left:44px" value="' +
          fmtBRL(state.patrimonio) +
          '"></div></div>' +
          "</div>";

        h += '<div class="cols"><div class="col-editor">';

        /* EDITOR */
        function rfSubC(it) {
          var b = ((it.nome || "") + " " + (it.detalhe || "")).toLowerCase();
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
        CLASSES.forEach(function (c) {
          var list = d.grouped[c];
          if (!list || list.length === 0) return;
          h +=
            '<div style="margin-bottom:18px"><div class="classhead"><span class="dot" style="background:' +
            CLASS_COLORS[c] +
            '"></span>' +
            '<span style="font-weight:700;font-size:15px">' +
            (window.__hubClassLabel ? window.__hubClassLabel(c) : c) +
            "</span>" +
            '<span style="color:#A9B0D6;font-weight:700;font-size:13px">' +
            fmtPct(d.byClass[c]) +
            "%</span></div>";
          if (c === "Renda Fixa") {
            var subs = {
              "Pós-fixado": [],
              Inflação: [],
              "Pré-fixado": [],
              Outros: [],
            };
            list.forEach(function (i) {
              subs[rfSubC(i)].push(i);
            });
            ["Pós-fixado", "Inflação", "Pré-fixado", "Outros"].forEach(
              function (s) {
                if (!subs[s].length) return;
                var sp = subs[s].reduce(function (a, i) {
                  return a + (Number(i.pct) || 0);
                }, 0);
                h +=
                  '<div style="font-size:11.5px;font-weight:700;color:#9AA2D0;text-transform:uppercase;letter-spacing:.5px;margin:10px 0 8px 4px;padding-left:8px;border-left:2px solid ' +
                  CLASS_COLORS["Renda Fixa"] +
                  '">' +
                  s +
                  " · " +
                  fmtPct(sp) +
                  "%</div>";
                subs[s].forEach(function (i) {
                  h += itemRowHTML(i);
                });
              },
            );
          } else {
            list.forEach(function (i) {
              h += itemRowHTML(i);
            });
          }
          h += "</div>";
        });

        /* ADD + CATÁLOGOS */
        h +=
          '<div class="addbtns">' +
          '<button class="addbtn" id="rvBtnAddAcao" style="border-color:rgba(255,139,82,.5);color:#FF8B52">' +
          ICON_PLUS +
          " Adicionar ação (ticker + preço-alvo)</button>" +
          '<button class="addbtn" id="rvBtnAdd">' +
          ICON_PLUS +
          " Adicionar ativo genérico</button>" +
          '<button class="addbtn" id="btnRubi" style="background:rgba(224,69,123,.12);border-color:rgba(224,69,123,.5);color:#F178A8">' +
          ICON_GEM +
          " Operação Cupom · pré-fixado " +
          (state.showRubi ? "▴" : "▾") +
          "</button>" +
          '<button class="addbtn" id="btnProtCriar" style="background:rgba(255,139,82,.12);border-color:rgba(255,139,82,.5);color:#FF8B52">' +
          ICON_SHIELD +
          " Criar operação de proteção</button>" +
          '<button class="addbtn" id="rvBtnOps" style="background:rgba(54,197,240,.1);border-color:rgba(54,197,240,.5);color:#7FD8F5">' +
          ICON_LAYERS +
          " Catálogo de proteção XP " +
          (state.showOps ? "▴" : "▾") +
          "</button>" +
          '<button class="addbtn" id="rvBtnQuanto" style="background:rgba(255,176,32,.1);border-color:rgba(255,176,32,.5);color:#FFB020">' +
          ICON_GLOBE +
          " Derivativos Quanto · Internacional " +
          (state.showQuanto ? "▴" : "▾") +
          "</button>" +
          "</div>";

        if (state.showRubi) {
          h +=
            '<div class="card" style="margin-top:12px"><div style="font-weight:700;font-size:15px;margin-bottom:4px">Catálogo de operações Cupom</div>' +
            '<div style="font-size:12.5px;color:#A9B0D6;margin-bottom:14px">Toque em "Add" para incluir uma operação de cupom pré-fixado pronta (entra com 0% — defina a alocação depois). Você pode editar taxa, barreira e equivalente em CDI de cada uma.</div>' +
            '<div class="opgrid">';
          RUBI_CATALOG.forEach(function (r) {
            var _sf =
              r.ativo +
              " Cupom " +
              r.setor +
              " barreira de desarme pré-fixado " +
              (r.cdi != null ? "CDI" : "");
            h +=
              '<div class="opcard" data-rvfind="' +
              esc(_sf) +
              '"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px"><div>' +
              '<div style="font-weight:800;font-size:15px">' +
              r.ativo +
              " · Cupom " +
              fmtPct(r.taxa) +
              "%</div>" +
              '<div style="font-size:11.5px;color:#A9B0D6;margin-top:2px">Cupom pré-fixado · barreira de desarme ' +
              fmtPct(r.barreira) +
              "%" +
              (r.cdi != null ? " · ≈ " + fmtPct(r.cdi) + "% CDI" : "") +
              "</div>" +
              '<span class="tag setor" style="margin-top:6px;display:inline-block;background:' +
              setorCor(r.setor) +
              "22;border-color:" +
              setorCor(r.setor) +
              "66;color:" +
              setorCor(r.setor) +
              '">' +
              r.setor +
              "</span>" +
              '</div><button class="minibtn" data-addrubi="' +
              r.id +
              '" style="white-space:nowrap;background:rgba(224,69,123,.14);border-color:rgba(224,69,123,.5);color:#F178A8">+ Add</button></div></div>';
          });
          h +=
            '</div><div class="rv-catempty" data-rvempty style="display:none">Nenhum ativo encontrado.</div></div>';
        }

        if (state.showOps) {
          h +=
            '<div class="card" style="margin-top:12px"><div style="font-weight:700;font-size:15px;margin-bottom:4px">Catálogo de estruturadas XP</div>' +
            '<div style="font-size:12.5px;color:#A9B0D6;margin-bottom:14px">Toque em "Add" para incluir na carteira (entra com 0% — defina a alocação depois). Cada operação leva junto o gráfico de payoff acessível pela seta "Como funciona".</div>' +
            '<div class="opgrid">';
          OPERACOES.forEach(function (op) {
            var _sf = op.nome + " " + op.ativo + " " + op.tipo + " " + op.setor;
            h +=
              '<div class="opcard" data-rvfind="' +
              esc(_sf) +
              '"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px"><div>' +
              '<div style="font-weight:800;font-size:15px">' +
              op.nome +
              "</div>" +
              '<div style="font-size:11.5px;color:#A9B0D6;margin-top:2px">' +
              op.tipo +
              " · teto " +
              fmtPct(op.teto) +
              "% · barreira " +
              fmtPct(op.barreira) +
              "%</div>" +
              '<span class="tag setor" style="margin-top:6px;display:inline-block;background:' +
              setorCor(op.setor) +
              "22;border-color:" +
              setorCor(op.setor) +
              "66;color:" +
              setorCor(op.setor) +
              '">' +
              op.setor +
              "</span>" +
              '</div><button class="minibtn" data-addop="' +
              op.id +
              '" style="white-space:nowrap">+ Add</button></div>' +
              '<div style="margin-top:8px">' +
              payoffBarsSVG(op, true) +
              "</div></div>";
          });
          h +=
            '</div><div class="rv-catempty" data-rvempty style="display:none">Nenhum ativo encontrado.</div></div>';
        }

        if (state.showQuanto) {
          h +=
            '<div class="card" style="margin-top:12px"><div style="font-weight:700;font-size:15px;margin-bottom:4px">Cardápio Quanto · Internacional</div>' +
            '<div style="font-size:12.5px;color:#A9B0D6;margin-bottom:6px">S&amp;P 500 e Nasdaq em moeda local (sem risco cambial). Toque em "Add" para incluir na carteira (entra com 0% — defina a alocação depois). A seta "Como funciona" mostra o payoff de cada operação.</div>' +
            '<div style="font-size:11.5px;color:#FFB020;background:rgba(255,176,32,.1);border:1px solid rgba(255,176,32,.3);border-radius:8px;padding:8px 11px;margin-bottom:16px">Payoff 2 (taxa fixa) está modelado como piso garantido + alta 1:1 ilimitada. Confirme as condições exatas de proteção de capital na lâmina antes de apresentar.</div>';
          [1, 2].forEach(function (pf) {
            h +=
              '<div data-rvqsec style="margin-bottom:18px"><div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">' +
              '<span style="background:' +
              ORANGE +
              ';color:#fff;border-radius:6px;padding:3px 10px;font-weight:800;font-size:12px">PAYOFF ' +
              pf +
              "</span>" +
              '<span style="font-weight:700;font-size:13.5px;color:#cfd4ef">' +
              (pf === 1
                ? "Capital Protegido + Alta Ilimitada"
                : "Taxa Fixa ou Alta Ilimitada") +
              '</span></div><div class="opgrid">';
            QUANTO_OPS.filter(function (op) {
              return op.payoff === pf;
            }).forEach(function (op) {
              var _sf =
                op.ativo +
                " " +
                op.fixing +
                " " +
                (op.setor || "Internacional") +
                " Quanto " +
                (pf === 1 ? "Multiplicador capital protegido" : "Taxa fixa");
              h +=
                '<div class="opcard" data-rvfind="' +
                esc(_sf) +
                '"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px"><div>' +
                '<div style="font-weight:800;font-size:15px">' +
                op.ativo +
                "</div>" +
                '<div style="font-size:11.5px;color:#A9B0D6;margin-top:2px">Prazo ' +
                op.fixing +
                "</div>" +
                '<div style="margin-top:6px;display:inline-block;background:rgba(255,176,32,.14);border:1px solid rgba(255,176,32,.45);color:#FFB020;border-radius:7px;padding:3px 9px;font-weight:800;font-size:12px">' +
                (pf === 1
                  ? "Multiplicador " + fmtMult(op.mult) + "x"
                  : "Taxa fixa " + fmtTaxa(op.taxa) + "%") +
                "</div>" +
                '</div><button class="minibtn" data-addq="' +
                op.id +
                '" style="white-space:nowrap">+ Add</button></div>' +
                '<div style="margin-top:8px">' +
                payoffBarsSVG(op, true) +
                "</div></div>";
            });
            h += "</div></div>";
          });
          h +=
            '<div class="rv-catempty" data-rvempty style="display:none">Nenhum ativo encontrado.</div>';
          h += "</div>";
        }

        h += "</div>"; // fim editor

        /* RESUMO */
        h += '<div class="col-resumo"><div class="sticky">';

        /* TOTAL */
        h +=
          '<div class="card" style="border-color:' +
          (d.totalOk ? "rgba(43,217,166,.5)" : "rgba(242,101,34,.5)") +
          '">' +
          '<div style="display:flex;justify-content:space-between;align-items:baseline">' +
          '<span style="color:#A9B0D6;font-weight:700;font-size:13px;letter-spacing:1px">TOTAL ALOCADO</span>' +
          '<span data-rvtotalval style="font-weight:800;font-size:30px;color:' +
          (d.totalOk ? "#2BD9A6" : ORANGE) +
          '">' +
          fmtPct(d.total) +
          "%</span></div>" +
          '<div style="height:8px;background:rgba(255,255,255,.08);border-radius:6px;margin-top:12px;overflow:hidden">' +
          '<div data-rvtotalbar style="width:' +
          Math.min(d.total, 100) +
          "%;height:100%;background:" +
          (d.totalOk ? "#2BD9A6" : ORANGE) +
          '"></div></div>';
        if (!d.totalOk) {
          h +=
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">' +
            '<span style="font-size:13px;color:#A9B0D6">' +
            (d.restante > 0
              ? "Faltam " + fmtPct(d.restante) + "%"
              : "Excedeu " + fmtPct(-d.restante) + "%") +
            "</span>" +
            (d.restante > 0
              ? '<button class="minibtn" id="btnDistrib">Distribuir igualmente</button>'
              : "") +
            "</div>";
        }
        h += "</div>";

        /* RETORNO ESPERADO (Tarefa 2) */
        var _reColor =
          d.retEsp == null ? "#A9B0D6" : d.retEsp >= 0 ? "#2BD9A6" : "#FF5566";
        var _reTxt =
          d.retEsp == null
            ? "—"
            : (d.retEsp > 0 ? "+" : "") + fmtPct(d.retEsp) + "%";
        h +=
          '<div class="card" style="margin-top:16px;border-color:rgba(255,139,82,.4)">' +
          '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">' +
          '<span style="color:' +
          ORANGE +
          '">' +
          ICON_LAYERS +
          "</span>" +
          '<span style="color:#A9B0D6;font-weight:700;font-size:13px;letter-spacing:1px">RETORNO ESPERADO</span></div>' +
          '<div style="display:flex;justify-content:space-between;align-items:baseline">' +
          '<span style="color:#A9B0D6;font-weight:700;font-size:13px">Upside ponderado (preço-alvo)</span>' +
          '<span data-rvretval style="font-weight:800;font-size:30px;color:' +
          _reColor +
          '">' +
          _reTxt +
          "</span></div>" +
          '<div data-rvretcov style="font-size:12px;color:#6F77A8;margin-top:8px">' +
          (d.retEspCobertura.n > 0
            ? d.retEspCobertura.n +
              " de " +
              d.retEspCobertura.m +
              " ativos precificados"
            : "Defina as cotações atuais para calcular o retorno esperado") +
          "</div>" +
          "</div>";

        /* COMPOSIÇÃO EM AÇÕES */
        h +=
          '<div class="card" style="margin-top:16px"><div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">' +
          '<span style="color:' +
          ORANGE +
          '">' +
          ICON_LAYERS +
          "</span>" +
          '<span style="color:#A9B0D6;font-weight:700;font-size:13px;letter-spacing:1px">COMPOSIÇÃO EM AÇÕES</span>' +
          '<span style="margin-left:auto;color:#6F77A8;font-size:12px;font-weight:700">' +
          fmtPct(d.pctAcoes) +
          "% da carteira</span></div>" +
          '<div style="display:flex;height:12px;border-radius:6px;overflow:hidden;background:rgba(255,255,255,.06)">';
        ["protecao", "none", "cupom"].forEach(function (k) {
          if (d.estruturaBreak[k] > 0)
            h +=
              '<div title="' +
              STRUCT_LABEL[k] +
              '" style="width:' +
              (d.estruturaBreak[k] / (d.pctAcoes || 1)) * 100 +
              "%;background:" +
              STRUCT_COLORS[k] +
              '"></div>';
        });
        h +=
          '</div><div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:12px">';
        ["protecao", "none", "cupom"].forEach(function (k) {
          h +=
            '<div style="display:flex;align-items:center;gap:7px"><span style="width:10px;height:10px;border-radius:3px;background:' +
            STRUCT_COLORS[k] +
            '"></span><span style="font-size:12.5px;color:#cfd4ef">' +
            STRUCT_LABEL[k] +
            '</span><span style="font-size:12.5px;font-weight:700;color:#fff">' +
            fmtPct(d.estruturaBreak[k]) +
            "%</span></div>";
        });
        h += "</div></div>";

        /* DONUT SETORIAL */
        h +=
          '<div class="card" style="margin-top:16px"><div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">' +
          '<span style="color:' +
          ORANGE +
          '">' +
          ICON_PIE +
          "</span>" +
          '<span style="color:#A9B0D6;font-weight:700;font-size:13px;letter-spacing:1px">DISTRIBUIÇÃO SETORIAL</span></div>' +
          '<div style="font-weight:700;font-size:14px;margin-bottom:10px;color:#cfd4ef">Carteira ' +
          esc(state.template) +
          (state.cliente ? " · " + esc(state.cliente) : "") +
          "</div>" +
          '<div style="display:flex;justify-content:center;margin-bottom:10px"><svg viewBox="0 0 200 200" width="190" height="190">';
        d.donut.forEach(function (s) {
          h +=
            '<path d="' +
            arc(100, 100, 78, s.start, s.v) +
            '" fill="none" stroke="' +
            setorCor(s.s) +
            '" stroke-width="22"/>';
        });
        h +=
          '<text x="100" y="92" text-anchor="middle" font-size="13" fill="#A9B0D6" font-weight="600">Alocado</text>' +
          '<text x="100" y="116" text-anchor="middle" font-size="26" fill="#fff" font-weight="800">' +
          fmtPct(d.total) +
          "%</text></svg></div>";
        if (d.donut.length === 0)
          h +=
            '<div style="font-size:13px;color:#6F77A8;text-align:center">Defina as alocações para ver a distribuição.</div>';
        d.donut.forEach(function (s) {
          h +=
            '<div style="display:flex;align-items:center;gap:9px;padding:5px 0;border-top:1px solid rgba(120,130,210,.12)">' +
            '<span style="width:11px;height:11px;border-radius:3px;background:' +
            setorCor(s.s) +
            '"></span>' +
            '<span style="flex:1;font-size:13px;color:#cfd4ef">' +
            s.s +
            "</span>" +
            '<span style="font-weight:700;font-size:14px">' +
            fmtPct(s.v) +
            "%</span>" +
            '<span style="font-size:12px;color:#6F77A8;width:92px;text-align:right">R$ ' +
            fmtBRL((state.patrimonio * s.v) / 100) +
            "</span></div>";
        });
        h += "</div>";

        /* GLOSSÁRIO */
        if (d.glossTerms.length > 0) {
          h +=
            '<div class="card" style="margin-top:16px"><div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">' +
            '<span style="color:' +
            ORANGE +
            '">' +
            ICON_SHIELD +
            "</span>" +
            '<span style="color:#A9B0D6;font-weight:700;font-size:13px;letter-spacing:1px">ENTENDA AS ESTRUTURAS</span></div>';
          d.glossTerms.forEach(function (k) {
            h +=
              '<div style="margin-bottom:12px"><div style="font-weight:800;font-size:14px;color:#fff">' +
              GLOSSARY[k].label +
              '</div><div style="font-size:12.5px;color:#A9B0D6;line-height:1.45;margin-top:3px">' +
              GLOSSARY[k].desc +
              "</div></div>";
          });
          h += "</div>";
        }

        h +=
          '<div style="font-size:11px;color:#6F77A8;margin-top:14px;line-height:1.5">Material de apoio comercial · carteira concentrada em renda variável · valores e liquidez ilustrativos · ações com estrutura usam opções para proteção ou cupom · não constitui recomendação ou oferta. Sujeito à suitability e às condições de cada produto.</div>';

        h += "</div></div>"; // fim resumo + cols
        h += "</div>"; // (close not needed but harmless)

        app.innerHTML = h;
        bind(d);
      }

      /* ===== Busca nas gavetas/catálogos (RV) ===== */
      function rvNorm(t) {
        return (t == null ? "" : String(t))
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .trim();
      }
      function rvApplyCatFilter() {
        var app = document.getElementById("rv-app");
        if (!app) return;
        var nq = rvNorm(state.rvCatSearch);
        // filtra os cards de cada catálogo aberto
        app.querySelectorAll(".opcard[data-rvfind]").forEach(function (card) {
          var hay = rvNorm(card.getAttribute("data-rvfind"));
          var hit = !nq || hay.indexOf(nq) >= 0;
          card.style.display = hit ? "" : "none";
        });
        // esconde seções PAYOFF do Quanto que ficarem sem cards visíveis
        app.querySelectorAll("[data-rvqsec]").forEach(function (sec) {
          var vis = sec.querySelectorAll(".opcard[data-rvfind]");
          var anyVis = Array.prototype.some.call(vis, function (c) {
            return c.style.display !== "none";
          });
          sec.style.display = anyVis ? "" : "none";
        });
        // mensagem "nenhum ativo" por catálogo
        app.querySelectorAll(".card").forEach(function (cardBox) {
          var grids = cardBox.querySelectorAll(".opcard[data-rvfind]");
          if (!grids.length) return;
          var anyVis = Array.prototype.some.call(grids, function (c) {
            return c.style.display !== "none";
          });
          var emp = cardBox.querySelector("[data-rvempty]");
          if (emp) emp.style.display = nq && !anyVis ? "" : "none";
        });
      }

      /* ===== Eventos ===== */
      function bind(d) {
        var _rvApp = document.getElementById("rv-app") || document;
        // header
        var _rvBtnCopy = document.getElementById("rvBtnCopy");
        if (_rvBtnCopy) _rvBtnCopy.onclick = copyResumo;
        document.getElementById("rvBtnPng").onclick = gerarPNG;
        var _rvBtnCard = document.getElementById("rvBtnCard");
        if (_rvBtnCard) _rvBtnCard.onclick = abrirCardModal;
        // templates
        _rvApp.querySelectorAll("[data-tpl]").forEach(function (b) {
          b.onclick = function () {
            loadTemplate(b.getAttribute("data-tpl"));
          };
        });
        var _br = document.getElementById("rvBtnRestore");
        if (_br)
          _br.onclick = function () {
            loadTemplate(state.template);
          };
        var _bs = document.getElementById("rvBtnSaveDefault");
        if (_bs) _bs.onclick = rvSaveAsDefault;
        var _bf = document.getElementById("rvBtnFactory");
        if (_bf) _bf.onclick = rvRestoreFactory;
        // cliente
        document.getElementById("inpCliente").oninput = function (e) {
          state.cliente = e.target.value;
          updateValHints();
          updateDonutTitle();
        };
        var pat = document.getElementById("inpPatrimonio");
        pat.oninput = function (e) {
          var digits = e.target.value.replace(/\D/g, "");
          state.patrimonio = digits ? parseInt(digits, 10) : 0;
          e.target.value = fmtBRL(state.patrimonio);
          updateValHints();
        };
        // add buttons
        document.getElementById("rvBtnAdd").onclick = function () {
          state.items.push(
            mk(
              "Renda Variável",
              "Nova ação",
              0,
              "",
              "B3",
              null,
              null,
              "Outros",
            ),
          );
          render();
        };
        var _ba = document.getElementById("rvBtnAddAcao");
        if (_ba)
          _ba.onclick = function () {
            var it = mkAcao("", "Nova ação", "Outros", 0, null, "");
            it.precoAlvo = null;
            state.items.push(it);
            state.abertos[it.id] = true;
            render();
          };
        document.getElementById("btnRubi").onclick = function () {
          state.showRubi = !state.showRubi;
          render();
        };
        var _bfa = document.getElementById("rvBtnFetchAll");
        if (_bfa)
          _bfa.onclick = function () {
            rvFetchAllQuotes(_bfa);
          };
        var _btk = document.getElementById("rvBrapiToken");
        if (_btk) {
          _btk.onchange = function () {
            rvSetBrapiToken(_btk.value);
          };
          _btk.oninput = function () {
            rvSetBrapiToken(_btk.value);
          };
        }
        var _bca = document.getElementById("rvClienteAtual");
        if (_bca) {
          _bca.onchange = function () {
            rvSetClienteAtual(_bca.value);
          };
          _bca.oninput = function () {
            rvSetClienteAtual(_bca.value);
          };
        }
        document.getElementById("btnProtCriar").onclick = function () {
          var it = mkProtecao("Nova ação protegida", "Outros", -20, 34.99, 135);
          state.items.push(it);
          state.abertos[it.id] = true;
          render();
        };
        document.getElementById("rvBtnOps").onclick = function () {
          state.showOps = !state.showOps;
          render();
        };
        document.getElementById("rvBtnQuanto").onclick = function () {
          state.showQuanto = !state.showQuanto;
          render();
        };
        var bd = document.getElementById("btnDistrib");
        if (bd) bd.onclick = distribuirRestante;

        // catálogo add
        _rvApp.querySelectorAll("[data-addop]").forEach(function (b) {
          b.onclick = function () {
            addOperacao(b.getAttribute("data-addop"));
          };
        });
        _rvApp.querySelectorAll("[data-addq]").forEach(function (b) {
          b.onclick = function () {
            addQuantoOp(b.getAttribute("data-addq"));
          };
        });
        _rvApp.querySelectorAll("[data-addrubi]").forEach(function (b) {
          b.onclick = function () {
            addRubiCatalogo(b.getAttribute("data-addrubi"));
          };
        });

        // item rows
        _rvApp.querySelectorAll(".row[data-id]").forEach(function (rowEl) {
          var id = rowEl.getAttribute("data-id");
          rowEl.querySelectorAll("[data-act]").forEach(function (el) {
            var act = el.getAttribute("data-act");
            if (act === "pct") {
              el.oninput = function () {
                update(id, "pct", _parseNum(el.value));
                softVal(id);
              };
            } else if (act === "nome") {
              el.oninput = function () {
                update(id, "nome", el.value);
              };
              el.onchange = function () {
                render();
              };
            } else if (act === "detalhe") {
              el.oninput = function () {
                update(id, "detalhe", el.value);
              };
            } else if (act === "classe") {
              el.onchange = function () {
                update(id, "classe", el.value);
                render();
              };
            } else if (act === "setor") {
              el.onchange = function () {
                update(id, "setor", el.value);
                render();
              };
            } else if (act === "remove") {
              el.onclick = function () {
                remove(id);
              };
            } else if (act === "estrutura") {
              el.onclick = function () {
                var kind = el.getAttribute("data-kind");
                var it = state.items.filter(function (x) {
                  return x.id === id;
                })[0];
                if (kind === "cupom") {
                  if (it) {
                    if (it.cupomTaxa == null || isNaN(Number(it.cupomTaxa)))
                      it.cupomTaxa = 12;
                    if (
                      it.cupomBarreira == null ||
                      isNaN(Number(it.cupomBarreira))
                    )
                      it.cupomBarreira = -20;
                    if (it.cupomCDI == null) it.cupomCDI = "";
                  }
                  state.abertos[id] = true;
                } else if (kind === "protecao") {
                  if (it && !it.op) {
                    if (it.protTeto == null || isNaN(Number(it.protTeto)))
                      it.protTeto = 34.99;
                    if (it.protProtege == null || isNaN(Number(it.protProtege)))
                      it.protProtege = -20;
                    if (
                      it.protBarreira == null ||
                      isNaN(Number(it.protBarreira))
                    )
                      it.protBarreira = 135;
                    if (
                      it.protTetoBarreira == null ||
                      isNaN(Number(it.protTetoBarreira))
                    )
                      it.protTetoBarreira =
                        Math.round(Number(it.protTeto) * 0.45 * 100) / 100;
                  }
                  state.abertos[id] = true;
                }
                update(id, "estrutura", kind);
                render();
              };
            } else if (act === "cupomTaxa") {
              el.oninput = function () {
                update(
                  id,
                  "cupomTaxa",
                  el.value === "" ? "" : Number(el.value),
                );
                redrawCupomChart(id);
              };
              el.onchange = function () {
                render();
              };
            } else if (act === "cupomBarreira") {
              el.oninput = function () {
                update(
                  id,
                  "cupomBarreira",
                  el.value === "" ? "" : Number(el.value),
                );
                redrawCupomChart(id);
              };
              el.onchange = function () {
                render();
              };
            } else if (act === "cupomCDI") {
              el.oninput = function () {
                update(id, "cupomCDI", el.value === "" ? "" : Number(el.value));
              };
              el.onchange = function () {
                render();
              };
            } else if (act === "protProtege") {
              el.oninput = function () {
                update(
                  id,
                  "protProtege",
                  el.value === "" ? "" : Number(el.value),
                );
                redrawProtChart(id);
              };
              el.onchange = function () {
                render();
              };
            } else if (act === "protTeto") {
              el.oninput = function () {
                update(id, "protTeto", el.value === "" ? "" : Number(el.value));
                redrawProtChart(id);
              };
              el.onchange = function () {
                render();
              };
            } else if (act === "protTetoBarreira") {
              el.oninput = function () {
                update(
                  id,
                  "protTetoBarreira",
                  el.value === "" ? "" : Number(el.value),
                );
                redrawProtChart(id);
              };
              el.onchange = function () {
                render();
              };
            } else if (act === "protBarreira") {
              el.oninput = function () {
                update(
                  id,
                  "protBarreira",
                  el.value === "" ? "" : Number(el.value),
                );
                redrawProtChart(id);
              };
              el.onchange = function () {
                render();
              };
            } else if (act === "escolha") {
              el.onclick = function () {
                setEscolha(id, parseInt(el.getAttribute("data-idx"), 10));
                render();
              };
            } else if (act === "precoAtual") {
              el.oninput = function () {
                var it = state.items.filter(function (x) {
                  return x.id === id;
                })[0];
                if (!it) return;
                var raw = el.value.trim();
                var v = raw === "" ? null : _parseNum(raw);
                if (v != null && !(v > 0)) v = null;
                it.precoAtual = v;
                if (it.ticker) rvSetPreco(it.ticker, v);
                softRetUpdate(id);
              };
              el.onchange = function () {
                render();
              };
            } else if (act === "ticker") {
              el.oninput = function () {
                update(id, "ticker", (el.value || "").toUpperCase());
              };
              el.onchange = function () {
                render();
              };
            } else if (act === "precoAlvo") {
              el.oninput = function () {
                var it = state.items.filter(function (x) {
                  return x.id === id;
                })[0];
                if (!it) return;
                var raw = el.value.trim();
                var v = raw === "" ? null : _parseNum(raw);
                if (v != null && !(v > 0)) v = null;
                it.precoAlvo = v;
                softRetUpdate(id);
              };
              el.onchange = function () {
                render();
              };
            } else if (act === "editstruct") {
              el.onclick = function () {
                openStructModal(id);
              };
            } else if (act === "toggle") {
              el.onclick = function () {
                state.abertos[id] = !state.abertos[id];
                render();
              };
            }
          });
        });
      }

      // aceita virgula decimal (espelha _parseNum do Simulador)
      function _parseNum(v) {
        var s = String(v == null ? "" : v)
          .trim()
          .replace(",", ".");
        var n = parseFloat(s);
        return isNaN(n) ? 0 : n;
      }
      // atualizações leves sem re-render completo (mantém foco no input)
      function softVal(id) {
        var d = calc();
        var rowEl = document.querySelector('.row[data-id="' + id + '"]');
        if (rowEl) {
          var vh = rowEl.querySelector(".valhint");
          var i = state.items.filter(function (x) {
            return x.id === id;
          })[0];
          if (vh && i)
            vh.textContent =
              "≈ R$ " + fmtBRL((state.patrimonio * (Number(i.pct) || 0)) / 100);
        }
        refreshResumoOnly(d);
      }
      function refreshResumoOnly(d) {
        // atualizacao "leve" do resumo (TOTAL) SEM reconstruir o editor/input (preserva foco).
        try {
          var val = document.querySelector("[data-rvtotalval]");
          if (val) {
            val.textContent = fmtPct(d.total) + "%";
            val.style.color = d.totalOk ? "#2BD9A6" : ORANGE;
          }
          var bar = document.querySelector("[data-rvtotalbar]");
          if (bar) {
            bar.style.width = Math.min(d.total, 100) + "%";
            bar.style.background = d.totalOk ? "#2BD9A6" : ORANGE;
          }
        } catch (_) {}
      }

      function updateValHints() {
        state.items.forEach(function (i) {
          var rowEl = document.querySelector('.row[data-id="' + i.id + '"]');
          if (rowEl) {
            var vh = rowEl.querySelector(".valhint");
            if (vh)
              vh.textContent =
                "≈ R$ " +
                fmtBRL((state.patrimonio * (Number(i.pct) || 0)) / 100);
          }
        });
      }
      function updateDonutTitle() {
        /* atualizado no próximo render */
      }

      /* atualização leve do retorno esperado (mantém foco no input de cotação) */
      function softRetUpdate(id) {
        var it = state.items.filter(function (x) {
          return x.id === id;
        })[0];
        var rowEl = document.querySelector('.row[data-id="' + id + '"]');
        if (it && rowEl) {
          var ret = holdingRet(it);
          var rc = ret == null ? "#8A93D8" : ret >= 0 ? "#2BD9A6" : "#FF5566";
          var rt = ret == null ? "—" : (ret > 0 ? "+" : "") + fmtPct(ret) + "%";
          var tg = rowEl.querySelector("[data-rvrettag]");
          if (tg) {
            tg.textContent = "Retorno esperado " + rt;
            tg.style.background = rc + "22";
            tg.style.borderColor = rc + "66";
            tg.style.color = rc;
          }
        }
        var d = calc();
        var rv = document.querySelector("[data-rvretval]");
        if (rv) {
          rv.textContent =
            d.retEsp == null
              ? "—"
              : (d.retEsp > 0 ? "+" : "") + fmtPct(d.retEsp) + "%";
          rv.style.color =
            d.retEsp == null
              ? "#A9B0D6"
              : d.retEsp >= 0
                ? "#2BD9A6"
                : "#FF5566";
        }
        var rcv = document.querySelector("[data-rvretcov]");
        if (rcv) {
          rcv.textContent =
            d.retEspCobertura.n > 0
              ? d.retEspCobertura.n +
                " de " +
                d.retEspCobertura.m +
                " ativos precificados"
              : "Defina as cotações atuais para calcular o retorno esperado";
        }
        refreshResumoOnly(d);
      }

      /* aplica o override/padrão de estrutura a TODOS os itens com o mesmo ticker */
      function applyStructTo(ticker) {
        state.items.forEach(function (x) {
          if (x.ticker === ticker && x.op) {
            x.op = defaultProt(ticker, x.nome, x.setor);
          }
        });
      }

      /* Modal de edição de estrutura (Tarefa 3) — persiste em hubRvStructOverride */
      function openStructModal(id) {
        var it = state.items.filter(function (x) {
          return x.id === id;
        })[0];
        if (!it || !it.ticker) return;
        var op = it.op || defaultProt(it.ticker, it.nome, it.setor);
        var oldm = document.getElementById("rvStructModal");
        if (oldm) oldm.remove();
        var hasOv = !!rvGetStructOv(it.ticker);
        var isTotal = Number(op.protegeAte) <= -100;
        var ov = document.createElement("div");
        ov.id = "rvStructModal";
        ov.setAttribute(
          "style",
          "position:fixed;inset:0;z-index:99999;background:rgba(4,6,20,.72);display:flex;align-items:center;justify-content:center;padding:20px",
        );
        function fld(label, act, val, color, hint) {
          return (
            '<div style="margin-bottom:13px"><div class="estlabel" style="margin-bottom:6px">' +
            label +
            "</div>" +
            '<input id="sm_' +
            act +
            '" type="text" inputmode="decimal" value="' +
            val +
            '" style="width:100%;box-sizing:border-box;background:rgba(0,0,0,.35);border:1px solid rgba(120,130,210,.25);border-radius:10px;color:' +
            (color || "#fff") +
            ';font-weight:700;font-size:15px;padding:10px 12px;outline:none">' +
            (hint
              ? '<div style="font-size:10.5px;color:#6F77A8;margin-top:4px">' +
                hint +
                "</div>"
              : "") +
            "</div>"
          );
        }
        ov.innerHTML =
          '<div style="width:min(460px,100%);max-height:92vh;overflow:auto;background:linear-gradient(160deg,#0C1240,#070B2E);border:1px solid rgba(255,139,82,.35);border-radius:18px;padding:24px 24px 20px;box-shadow:0 24px 60px rgba(0,0,0,.55)">' +
          '<div style="display:flex;align-items:center;gap:8px;margin-bottom:2px"><span style="color:#FF8B52">' +
          ICON_SHIELD +
          '</span><span style="font-weight:800;font-size:18px;color:#fff">Editar estrutura de proteção</span></div>' +
          '<div style="font-size:12.5px;color:#A9B0D6;margin-bottom:18px">' +
          esc(it.nome) +
          " · " +
          esc(it.ticker) +
          " — parâmetros da operação estruturada (Fence / Collar).</div>" +
          '<div style="margin-bottom:13px"><div class="estlabel" style="margin-bottom:6px">Tipo de proteção</div>' +
          '<select id="sm_tipo" style="width:100%;box-sizing:border-box;background:rgba(0,0,0,.35);border:1px solid rgba(120,130,210,.25);border-radius:10px;color:#fff;font-weight:700;font-size:14px;padding:10px 12px;outline:none">' +
          '<option value="Proteção parcial"' +
          (!isTotal ? " selected" : "") +
          ">Proteção parcial (Fence)</option>" +
          '<option value="Proteção total"' +
          (isTotal ? " selected" : "") +
          ">Proteção total (Collar · capital protegido)</option></select></div>" +
          fld(
            "Protege até (queda; use -100 p/ proteção total)",
            "protegeAte",
            op.protegeAte,
            "#FF8B52",
            "Ex.: -20 protege os primeiros 20% de queda.",
          ) +
          fld("Teto de alta (ganho máximo, %)", "teto", op.teto, "#2BD9A6") +
          fld(
            "Teto se tocar a barreira (%)",
            "tetoBarreira",
            op.tetoBarreira,
            "#FFB020",
          ) +
          fld(
            "Barreira (alta de desarme do teto, %)",
            "barreira",
            op.barreira,
            "#7FD8F5",
          ) +
          '<div style="display:flex;gap:10px;align-items:center;margin-top:8px">' +
          (hasOv
            ? '<button id="smRestore" style="background:transparent;border:1px solid rgba(120,130,210,.35);color:#A9B0D6;border-radius:10px;padding:9px 14px;font-weight:700;font-size:13px;cursor:pointer">Restaurar padrão</button>'
            : "") +
          '<button id="smCancel" style="margin-left:auto;background:transparent;border:1px solid rgba(120,130,210,.35);color:#A9B0D6;border-radius:10px;padding:9px 16px;font-weight:700;font-size:13px;cursor:pointer">Cancelar</button>' +
          '<button id="smSave" style="background:' +
          ORANGE +
          ';border:none;color:#fff;border-radius:10px;padding:9px 18px;font-weight:800;font-size:13px;cursor:pointer">Salvar</button>' +
          "</div></div>";
        document.body.appendChild(ov);
        function close() {
          if (ov.parentNode) ov.parentNode.removeChild(ov);
        }
        ov.addEventListener("click", function (e) {
          if (e.target === ov) close();
        });
        ov.querySelector("#smCancel").onclick = close;
        var rb = ov.querySelector("#smRestore");
        if (rb)
          rb.onclick = function () {
            rvClearStructOv(it.ticker);
            applyStructTo(it.ticker);
            close();
            render();
          };
        ov.querySelector("#smSave").onclick = function () {
          var tipo = ov.querySelector("#sm_tipo").value;
          var obj = {
            tipo: tipo,
            protegeAte: _parseNum(ov.querySelector("#sm_protegeAte").value),
            teto: _parseNum(ov.querySelector("#sm_teto").value),
            tetoBarreira: _parseNum(ov.querySelector("#sm_tetoBarreira").value),
            barreira: _parseNum(ov.querySelector("#sm_barreira").value),
          };
          if (tipo === "Proteção total" && obj.protegeAte > -100)
            obj.protegeAte = -100;
          rvSetStructOv(it.ticker, obj);
          applyStructTo(it.ticker);
          close();
          render();
        };
      }

      /* re-render total ao mudar pct (no change/blur) */
      document.addEventListener(
        "change",
        function (e) {
          if (
            e.target &&
            e.target.matches &&
            e.target.matches('.row[data-id] [data-act="pct"]')
          )
            render();
        },
        true,
      );

      function update(id, field, val) {
        var i = state.items.filter(function (x) {
          return x.id === id;
        })[0];
        if (i) {
          i[field] = val;
          if (['nome','ticker','detalhe'].indexOf(field) >= 0) {
            document.querySelectorAll('#rv-app .row[data-id]').forEach(function(row) {
              if(row.getAttribute('data-id') === String(id)) window.__xpUpdateLink?.(row,i);
            });
          }
        }
      }
      function setEscolha(id, idx) {
        var i = state.items.filter(function (x) {
          return x.id === id;
        })[0];
        if (i && i.opcoes) {
          i.escolha = idx;
          i.nome = i.opcoes[idx].nome;
          i.detalhe = i.opcoes[idx].detalhe;
          i.liquidez = i.opcoes[idx].liquidez || "";
        }
      }
      function remove(id) {
        state.items = state.items.filter(function (x) {
          return x.id !== id;
        });
        render();
      }
      function loadTemplate(t) {
        state.template = t;
        state.items = resolveTemplateItems(t);
        state.abertos = {};
        render();
      }
      /* salva a composição atual como novo padrão do template ativo (Tarefa A) */
      function rvSaveAsDefault() {
        if (state.template === "Montar do zero") {
          flashBtn("rvBtnSaveDefault", "Indisponível");
          return;
        }
        try {
          rvSetTplOv(state.template, rvSerializeItems(state.items));
        } catch (_) {}
        render();
        flashBtn("rvBtnSaveDefault", "Salvo como padrão!");
      }
      /* remove o override e volta à carteira de fábrica */
      function rvRestoreFactory() {
        if (!rvGetTplOv(state.template)) {
          flashBtn("rvBtnFactory", "Já é de fábrica");
          return;
        }
        if (
          !confirm(
            'Restaurar "' +
              state.template +
              '" para o padrão de fábrica? As personalizações salvas deste modelo serão descartadas.',
          )
        )
          return;
        rvClearTplOv(state.template);
        state.items = resolveTemplateItems(state.template);
        state.abertos = {};
        render();
        flashBtn("rvBtnFactory", "Padrão restaurado");
      }
      function distribuirRestante() {
        if (state.items.length === 0) return;
        // Distribui 100% igualmente entre os ativos, com soma EXATA de 100,0%.
        // Arredonda cada peso a 1 casa; o ULTIMO ativo absorve o resto (sem estourar).
        var n = state.items.length;
        var base = Math.round((100 / n) * 10) / 10;
        var acc = 0;
        state.items.forEach(function (i, idx) {
          var v = idx === n - 1 ? Math.round((100 - acc) * 10) / 10 : base;
          acc = Math.round((acc + v) * 10) / 10;
          i.pct = v;
        });
        render();
      }
      function addOperacao(opId) {
        var op = OPERACOES.filter(function (o) {
          return o.id === opId;
        })[0];
        var novo = mk(
          "Renda Variável",
          op.ativo,
          0,
          opDetalhe(op),
          "No vencimento",
          "protecao",
          null,
          op.setor,
        );
        novo.op = op;
        state.items.push(novo);
        state.abertos[novo.id] = true;
        render();
      }
      function addQuantoOp(opId) {
        var op = QUANTO_OPS.filter(function (o) {
          return o.id === opId;
        })[0];
        var novo = mk(
          "Internacional",
          op.nome,
          0,
          opDetalheQuanto(op),
          "Vencimento em " + op.fixing,
          "protecao",
          null,
          "Internacional",
        );
        novo.op = op;
        state.items.push(novo);
        state.abertos[novo.id] = true;
        render();
      }
      window.__rvAddFromDrawer = function (
        classe,
        nome,
        detalhe,
        liq,
        protFlag,
        op,
      ) {
        var kind = null;
        if (op) {
          if (op.cupom) kind = "cupom";
          else if (op.quanto || op.protegeAte != null) kind = "protecao";
        }
        if (protFlag && !kind) kind = "protecao";
        var it = mk(
          classe || "Renda Variável",
          nome || "Operação",
          0,
          detalhe || "",
          liq || "No vencimento",
          kind,
          null,
          (op && op.setor) || "Outros",
        );
        state.items.push(it);
        if (state.abertos) state.abertos[it.id] = true;
        render();
        return true;
      };

      /* ===== Copiar resumo ===== */
      function copyResumo() {
        var d = calc();
        var txt =
          "Carteira de Renda Variável · " +
          state.template +
          (state.cliente ? " — " + state.cliente : "") +
          "\n";
        txt += "Patrimônio: R$ " + fmtBRL(state.patrimonio) + "\n";
        txt +=
          "Composição em ações: " +
          fmtPct(d.estruturaBreak.protecao) +
          "% protegida · " +
          fmtPct(d.estruturaBreak.none) +
          "% avulsa · " +
          fmtPct(d.estruturaBreak.cupom) +
          "% Rubi\n";
        if (d.donut.length)
          txt +=
            "Distribuição setorial: " +
            d.donut
              .map(function (x) {
                return x.s + " " + fmtPct(x.v) + "%";
              })
              .join(" · ") +
            "\n";
        txt += "\n";
        CLASSES.forEach(function (c) {
          var list = d.grouped[c];
          if (!list || list.length === 0) return;
          txt +=
            (window.__hubClassLabel
              ? window.__hubClassLabel(c)
              : c
            ).toUpperCase() +
            " (" +
            fmtPct(d.byClass[c]) +
            "%)\n";
          list.forEach(function (i) {
            var extra = [];
            if (i.setor && i.setor !== "Outros") extra.push(i.setor);
            if (isFII(i)) extra.push("CETIPADO");
            var st = structureTag(i);
            if (st) {
              if (
                st.kind === "cupom" &&
                i.cupomTaxa != null &&
                !isNaN(Number(i.cupomTaxa))
              ) {
                var rub = "Rubi · cupom " + fmtPct(Number(i.cupomTaxa)) + "%";
                var bb = Number(i.cupomBarreira);
                if (!isNaN(bb)) rub += " · desarme " + fmtPct(bb) + "%";
                if (
                  i.cupomCDI != null &&
                  i.cupomCDI !== "" &&
                  !isNaN(Number(i.cupomCDI))
                )
                  rub += " · ≈" + fmtPct(Number(i.cupomCDI)) + "% CDI";
                extra.push(rub);
              } else extra.push(st.label);
            }
            if (i.liquidez) extra.push("Liq: " + i.liquidez);
            if (isIsento(i.nome)) {
              extra.push("Resgate trabalhado");
              extra.push("Isento IR");
            }
            txt +=
              "  • " +
              fmtPct(i.pct) +
              "% " +
              i.nome +
              (i.detalhe ? " — " + i.detalhe : "") +
              (extra.length ? " [" + extra.join(" · ") + "]" : "") +
              "\n";
          });
          txt += "\n";
        });
        txt += "Total alocado: " + fmtPct(d.total) + "%";
        if (d.glossTerms.length) {
          txt += "\n\nEntenda as estruturas:\n";
          d.glossTerms.forEach(function (k) {
            txt += "  • " + GLOSSARY[k].label + ": " + GLOSSARY[k].desc + "\n";
          });
        }
        if (navigator.clipboard) {
          navigator.clipboard.writeText(txt).then(function () {
            flashBtn("rvBtnCopy", "Copiado!");
          });
        }
      }
      function flashBtn(id, msg) {
        var b = document.getElementById(id);
        if (!b) return;
        var old = b.innerHTML;
        b.innerHTML = ICON_CHECK + " " + msg;
        setTimeout(function () {
          b.innerHTML = old;
        }, 1800);
      }

      /* ===== PNG ===== */
      function wrapText(ctx, text, x, y, maxW, lineH, color, size, FF) {
        ctx.font = "400 " + size + "px " + FF;
        ctx.fillStyle = color;
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
        var words = text.split(" ");
        var line = "";
        var yy = y;
        var lines = 0;
        for (var k = 0; k < words.length; k++) {
          var w = words[k];
          var test = line ? line + " " + w : w;
          if (ctx.measureText(test).width > maxW && line) {
            ctx.fillText(line, x, yy);
            yy += lineH;
            lines++;
            line = w;
          } else line = test;
        }
        if (line) {
          ctx.fillText(line, x, yy);
          lines++;
        }
        return lines;
      }

      function buildCarteiraPNG(p) {
        var template = p.template,
          cliente = p.cliente,
          patrimonio = p.patrimonio,
          byClass = p.byClass,
          total = p.total,
          grouped = p.grouped,
          glossTerms = p.glossTerms,
          estruturaBreak = p.estruturaBreak || {
            protecao: 0,
            none: 0,
            cupom: 0,
          },
          pctAcoes = p.pctAcoes || 0,
          bySetor = p.bySetor || {},
          retEsp = p.retEsp,
          retEspCobertura = p.retEspCobertura || { n: 0, m: 0 };
        var FF = "Arial, Helvetica, sans-serif";
        var MONO =
          "'DejaVu Sans Mono','Menlo','Consolas','Liberation Mono','Courier New',monospace";
        var nome = (cliente || "").trim();
        var W = 1080,
          MX = 60,
          CW = W - 2 * MX;
        var ORG = ORANGE;

        /* holdings achatados, maior peso primeiro (visual de "mesa") */
        var holds = [];
        CLASSES.forEach(function (c) {
          (grouped[c] || []).forEach(function (it) {
            holds.push(it);
          });
        });
        holds.sort(function (a, b) {
          return (Number(b.pct) || 0) - (Number(a.pct) || 0);
        });

        var sortedSetores = Object.keys(bySetor)
          .filter(function (s) {
            return bySetor[s] > 0;
          })
          .sort(function (a, b) {
            return bySetor[b] - bySetor[a];
          });
        var secTot = sortedSetores.reduce(function (a, s) {
          return a + (bySetor[s] || 0);
        }, 0);

        var reHasPrice =
          retEspCobertura &&
          retEspCobertura.n > 0 &&
          retEsp != null &&
          isFinite(retEsp);
        var reColor = reHasPrice
          ? retEsp >= 0
            ? "#2BD9A6"
            : "#FF5566"
          : "#8A93D8";
        var reTxt = reHasPrice
          ? (retEsp > 0 ? "+" : "") + fmtPct(retEsp) + "%"
          : "defina as cotações";
        var covTxt = reHasPrice
          ? "com base em " +
            retEspCobertura.n +
            " de " +
            retEspCobertura.m +
            " ativos precificados"
          : retEspCobertura && retEspCobertura.m
            ? "0 de " +
              retEspCobertura.m +
              " ativos precificados — informe as cotações"
            : "carteira ainda sem cotações";

        var mctx = document.createElement("canvas").getContext("2d");
        function wrapCount(text, maxW, size) {
          mctx.font = "400 " + size + "px " + FF;
          var words = String(text).split(" "),
            line = "",
            n = 0,
            k;
          for (k = 0; k < words.length; k++) {
            var t = line ? line + " " + words[k] : words[k];
            if (mctx.measureText(t).width > maxW && line) {
              n++;
              line = words[k];
            } else line = t;
          }
          if (line) n++;
          return n || 1;
        }
        mctx.font = "600 13px " + FF;
        var legRows = 1,
          _lx = MX;
        sortedSetores.forEach(function (s) {
          var label = s + " " + fmtPct(bySetor[s]) + "%";
          var chipW = 18 + mctx.measureText(label).width + 22;
          if (_lx + chipW > W - MX) {
            legRows++;
            _lx = MX;
          }
          _lx += chipW;
        });

        /* plano vertical p/ dimensionar a altura */
        var heroTop = 170,
          heroH = 182;
        var secLabelY = heroTop + heroH + 42;
        var barY = secLabelY + 16,
          barH = 28;
        var legY0 = barY + barH + 30;
        var legYend = legY0 + (legRows - 1) * 24;
        var tblHeadY = legYend + 42;
        var rowH = 46;
        var tblBottom = tblHeadY + 14 + (holds.length || 1) * rowH;
        var glossTop = tblBottom + 22,
          glossH = 0;
        if (glossTerms && glossTerms.length) {
          glossTerms.forEach(function (k) {
            var ln = wrapCount(GLOSSARY[k].desc, CW - 44, 13);
            glossH += 20 + ln * 18 + 16;
          });
          glossH += 40;
        }
        var glossBottom = glossTop + glossH;
        var footTop = glossBottom + (glossH ? 18 : 0) + 18;
        var H = Math.max(720, footTop + 84);

        var scale = 2;
        var cv = document.createElement("canvas");
        cv.width = W * scale;
        cv.height = H * scale;
        var ctx = cv.getContext("2d");
        ctx.scale(scale, scale);

        function T(t, x, y, size, color, weight, align, ff) {
          ctx.font = (weight || "400") + " " + size + "px " + (ff || FF);
          ctx.fillStyle = color;
          ctx.textAlign = align || "left";
          ctx.textBaseline = "alphabetic";
          ctx.fillText(t, x, y);
        }
        function rr(x, y, w, h, r) {
          r = Math.min(r, w / 2, h / 2);
          if (r < 0) r = 0;
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.arcTo(x + w, y, x + w, y + h, r);
          ctx.arcTo(x + w, y + h, x, y + h, r);
          ctx.arcTo(x, y + h, x, y, r);
          ctx.arcTo(x, y, x + w, y, r);
          ctx.closePath();
        }
        function clip(text, maxW, size, weight, ff) {
          ctx.font = (weight || "400") + " " + size + "px " + (ff || FF);
          var s = String(text == null ? "" : text);
          if (ctx.measureText(s).width <= maxW) return s;
          while (s.length > 1 && ctx.measureText(s + "…").width > maxW)
            s = s.slice(0, -1);
          return s + "…";
        }

        /* fundo grafite */
        var bg = ctx.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, "#13161D");
        bg.addColorStop(0.45, "#0C0E14");
        bg.addColorStop(1, "#070809");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = "rgba(255,255,255,0.025)";
        ctx.lineWidth = 1;
        for (var gx = MX; gx <= W - MX; gx += 45) {
          ctx.beginPath();
          ctx.moveTo(gx, 0);
          ctx.lineTo(gx, heroTop + heroH);
          ctx.stroke();
        }
        for (var gyy = 40; gyy < heroTop + heroH; gyy += 45) {
          ctx.beginPath();
          ctx.moveTo(MX, gyy);
          ctx.lineTo(W - MX, gyy);
          ctx.stroke();
        }
        var glow = ctx.createRadialGradient(W * 0.5, 0, 0, W * 0.5, 0, W * 0.7);
        glow.addColorStop(0, "rgba(242,101,34,0.10)");
        glow.addColorStop(1, "rgba(242,101,34,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, W, heroTop + heroH);
        ctx.fillStyle = ORG;
        ctx.fillRect(0, 0, W, 3);

        /* motivo de candlesticks (header, à direita) */
        (function () {
          var cx0 = W * 0.42,
            cx1 = W - MX,
            n = 24,
            step = (cx1 - cx0) / n,
            midY = 54,
            span = 34;
          for (var k = 0; k < n; k++) {
            var s1 = Math.sin(k * 12.9898) * 43758.5453;
            s1 = s1 - Math.floor(s1);
            var s2 = Math.sin(k * 4.1414 + 1.7) * 24634.633;
            s2 = s2 - Math.floor(s2);
            var up = s1 > 0.48;
            var cxx = cx0 + step * k + step * 0.5;
            var oy = midY - span / 2 + s1 * span,
              cyy = midY - span / 2 + s2 * span;
            var hi = Math.min(oy, cyy) - 3 - s2 * 9,
              lo = Math.max(oy, cyy) + 3 + s1 * 9;
            var col = up ? "rgba(43,217,166,0.5)" : "rgba(255,85,102,0.5)";
            ctx.strokeStyle = col;
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.moveTo(cxx, hi);
            ctx.lineTo(cxx, lo);
            ctx.stroke();
            var bw = Math.max(3, step * 0.46),
              bh = Math.max(3, Math.abs(oy - cyy));
            ctx.fillStyle = col;
            rr(cxx - bw / 2, Math.min(oy, cyy), bw, bh, 1);
            ctx.fill();
          }
        })();

        /* marca + eyebrow */
        ctx.font = "800 44px " + FF;
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#fff";
        window.__ricoLogoAuto(ctx, MX, 64);
        ctx.fillStyle = ORG;
        ctx.fillText(".", MX + ctx.measureText("rico").width, 64);
        ctx.fillStyle = ORG;
        rr(MX, 84, 10, 10, 2);
        ctx.fill();
        T(
          "MESA DE RENDA VARIÁVEL",
          MX + 18,
          93,
          13.5,
          ORG,
          "800",
          "left",
          MONO,
        );
        var _hoje = "";
        try {
          _hoje = new Date().toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        } catch (_) {}
        T(
          (_hoje || "").toUpperCase(),
          W - MX,
          100,
          11.5,
          "#6F77A8",
          "700",
          "right",
          MONO,
        );

        /* HERO */
        var hx = MX,
          hy = heroTop,
          hw = CW,
          hh = heroH;
        ctx.fillStyle = "rgba(255,255,255,0.02)";
        rr(hx, hy, hw, hh, 18);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,120,40,0.28)";
        ctx.lineWidth = 1.5;
        rr(hx, hy, hw, hh, 18);
        ctx.stroke();
        ctx.fillStyle = ORG;
        rr(hx, hy + 22, 5, hh - 44, 3);
        ctx.fill();
        T(
          "CARTEIRA MODELO",
          hx + 28,
          hy + 44,
          13,
          "#8A93D8",
          "800",
          "left",
          MONO,
        );
        T(
          clip(template || "Carteira", hw - 360, 44, "800", FF),
          hx + 26,
          hy + 92,
          44,
          "#fff",
          "800",
          "left",
        );
        var sub =
          (nome ? "Para " + nome + "   ·   " : "") +
          "Patrimônio R$ " +
          fmtBRL(patrimonio);
        T(
          clip(sub, hw - 360, 15, "600", FF),
          hx + 28,
          hy + 124,
          15,
          "#A9B0D6",
          "600",
          "left",
        );
        T(
          "Composição em ações " +
            fmtPct(pctAcoes) +
            "%   ·   protegido " +
            fmtPct(estruturaBreak.protecao || 0) +
            "%   ·   " +
            holds.length +
            " ativos",
          hx + 28,
          hy + 150,
          12.5,
          "#6F77A8",
          "700",
          "left",
          MONO,
        );

        var tW = 290,
          tX = hx + hw - tW - 24,
          tY = hy + 24,
          tH = hh - 48;
        var tBg = reHasPrice
          ? retEsp >= 0
            ? "rgba(43,217,166,0.09)"
            : "rgba(255,85,102,0.09)"
          : "rgba(138,147,216,0.06)";
        var tBd = reHasPrice
          ? retEsp >= 0
            ? "rgba(43,217,166,0.45)"
            : "rgba(255,85,102,0.45)"
          : "rgba(138,147,216,0.28)";
        ctx.fillStyle = tBg;
        rr(tX, tY, tW, tH, 14);
        ctx.fill();
        ctx.strokeStyle = tBd;
        ctx.lineWidth = 1.5;
        rr(tX, tY, tW, tH, 14);
        ctx.stroke();
        T(
          "RETORNO ESPERADO",
          tX + 22,
          tY + 32,
          12.5,
          "#A9B0D6",
          "800",
          "left",
          MONO,
        );
        T(
          clip(reTxt, tW - 40, reHasPrice ? 46 : 26, "800", MONO),
          tX + 22,
          tY + (reHasPrice ? 86 : 78),
          reHasPrice ? 46 : 26,
          reColor,
          "800",
          "left",
          MONO,
        );
        T(
          "upside ponderado por preço-alvo",
          tX + 22,
          tY + 108,
          11.5,
          "#8A93D8",
          "600",
          "left",
        );
        wrapText(
          ctx,
          covTxt,
          tX + 22,
          tY + 130,
          tW - 40,
          15,
          "#6F77A8",
          11,
          FF,
        );

        /* DISTRIBUIÇÃO SETORIAL — barra horizontal empilhada */
        T(
          "DISTRIBUIÇÃO SETORIAL",
          MX,
          secLabelY,
          13,
          "#8A93D8",
          "800",
          "left",
          MONO,
        );
        ctx.fillStyle = "rgba(255,255,255,0.05)";
        rr(MX, barY, CW, barH, 8);
        ctx.fill();
        if (secTot > 0) {
          ctx.save();
          rr(MX, barY, CW, barH, 8);
          ctx.clip();
          var axA = MX;
          sortedSetores.forEach(function (s) {
            var w = (bySetor[s] / secTot) * CW;
            ctx.fillStyle = setorCor(s);
            ctx.fillRect(axA, barY, w, barH);
            axA += w;
          });
          ctx.strokeStyle = "rgba(7,8,9,0.55)";
          ctx.lineWidth = 1;
          var axB = MX;
          sortedSetores.forEach(function (s) {
            var w = (bySetor[s] / secTot) * CW;
            axB += w;
            if (axB < MX + CW - 1) {
              ctx.beginPath();
              ctx.moveTo(axB, barY);
              ctx.lineTo(axB, barY + barH);
              ctx.stroke();
            }
          });
          ctx.restore();
        } else {
          T(
            "Defina as alocações para ver a distribuição",
            MX + 14,
            barY + barH / 2 + 5,
            12.5,
            "#6F77A8",
            "600",
            "left",
          );
        }
        var lgy = legY0,
          lgx = MX;
        ctx.font = "600 13px " + FF;
        sortedSetores.forEach(function (s) {
          var label = s + " " + fmtPct(bySetor[s]) + "%";
          var chipW = 18 + mctx.measureText(label).width + 22;
          if (lgx + chipW > W - MX) {
            lgx = MX;
            lgy += 24;
          }
          ctx.fillStyle = setorCor(s);
          rr(lgx, lgy - 10, 11, 11, 3);
          ctx.fill();
          T(label, lgx + 18, lgy, 13, "#cfd4ef", "600", "left");
          lgx += chipW;
        });

        /* TABELA de holdings */
        var cPeso = 690,
          cPA = 858,
          cRet = W - MX;
        T("ATIVO", MX + 22, tblHeadY, 11.5, "#6F77A8", "800", "left", MONO);
        T("SETOR", 470, tblHeadY, 11.5, "#6F77A8", "800", "left", MONO);
        T("PESO", cPeso, tblHeadY, 11.5, "#6F77A8", "800", "right", MONO);
        T("PREÇO-ALVO", cPA, tblHeadY, 11.5, "#6F77A8", "800", "right", MONO);
        T("RET. ESP.", cRet, tblHeadY, 11.5, "#6F77A8", "800", "right", MONO);
        ctx.strokeStyle = "rgba(255,120,40,0.35)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(MX, tblHeadY + 12);
        ctx.lineTo(W - MX, tblHeadY + 12);
        ctx.stroke();
        var ry = tblHeadY + 14;
        holds.forEach(function (i, idx) {
          if (idx % 2 === 1) {
            ctx.fillStyle = "rgba(255,255,255,0.018)";
            ctx.fillRect(MX, ry, CW, rowH);
          }
          var setor = i.setor || "Outros";
          var cyc = ry + 22;
          ctx.fillStyle = setorCor(setor);
          rr(MX + 2, cyc - 11, 4, 22, 2);
          ctx.fill();
          var tk =
            i.ticker !== undefined && i.ticker ? i.ticker : i.nome || "—";
          var tkS = clip(tk, 240, 18, "800", MONO);
          ctx.font = "800 18px " + MONO;
          ctx.textAlign = "left";
          ctx.textBaseline = "alphabetic";
          ctx.fillStyle = "#fff";
          ctx.fillText(tkS, MX + 22, cyc);
          var tkW = ctx.measureText(tkS).width;
          var st = structureTag(i);
          if (st) {
            var plbl =
              st.kind === "cupom"
                ? "CUPOM"
                : st.kind === "protecao"
                  ? "PROT"
                  : "AVULSA";
            var pcol = STRUCT_COLORS[st.kind] || "#8A93D8";
            ctx.font = "800 10px " + MONO;
            var pw = ctx.measureText(plbl).width + 16;
            var pxx = MX + 22 + tkW + 12,
              pyy = cyc - 13;
            ctx.fillStyle = pcol + "22";
            rr(pxx, pyy, pw, 17, 5);
            ctx.fill();
            ctx.strokeStyle = pcol + "88";
            ctx.lineWidth = 1;
            rr(pxx, pyy, pw, 17, 5);
            ctx.stroke();
            T(plbl, pxx + 8, pyy + 12.5, 10, pcol, "800", "left", MONO);
          }
          if (i.nome && i.nome !== tk)
            T(
              clip(i.nome, 380, 11.5, "500", FF),
              MX + 22,
              cyc + 17,
              11.5,
              "#8A93D8",
              "500",
              "left",
            );
          T(
            clip(setor, 180, 13, "700", FF),
            470,
            cyc,
            13,
            setorCor(setor),
            "700",
            "left",
          );
          T(fmtPct(i.pct) + "%", cPeso, cyc, 17, ORG, "800", "right", MONO);
          var paTxt =
            i.precoAlvo != null &&
            !isNaN(Number(i.precoAlvo)) &&
            Number(i.precoAlvo) > 0
              ? "R$ " + fmtPreco(i.precoAlvo)
              : "—";
          T(paTxt, cPA, cyc, 15, "#cfd4ef", "600", "right", MONO);
          var r = holdingRet(i);
          var rc = r == null ? "#6F77A8" : r >= 0 ? "#2BD9A6" : "#FF5566";
          var rtxt = r == null ? "—" : (r > 0 ? "+" : "") + fmtPct(r) + "%";
          T(rtxt, cRet, cyc, 16, rc, "800", "right", MONO);
          ctx.strokeStyle = "rgba(120,130,210,0.1)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(MX, ry + rowH);
          ctx.lineTo(W - MX, ry + rowH);
          ctx.stroke();
          ry += rowH;
        });
        if (holds.length === 0) {
          T(
            "Nenhum ativo na carteira — adicione ações ao modelo.",
            MX + 22,
            ry + 28,
            13.5,
            "#6F77A8",
            "600",
            "left",
          );
        }

        /* GLOSSÁRIO compacto */
        if (glossTerms && glossTerms.length) {
          var gyt = glossTop;
          ctx.fillStyle = "rgba(242,101,34,0.07)";
          rr(MX, gyt, CW, glossH, 14);
          ctx.fill();
          ctx.strokeStyle = "rgba(255,120,40,0.22)";
          ctx.lineWidth = 1;
          rr(MX, gyt, CW, glossH, 14);
          ctx.stroke();
          var yy = gyt + 30;
          T("ENTENDA AS ESTRUTURAS", MX + 22, yy, 13, ORG, "800", "left", MONO);
          yy += 26;
          glossTerms.forEach(function (k) {
            T(GLOSSARY[k].label, MX + 22, yy, 15, "#fff", "800", "left");
            yy += 20;
            var ln = wrapText(
              ctx,
              GLOSSARY[k].desc,
              MX + 22,
              yy,
              CW - 44,
              18,
              "#A9B0D6",
              13,
              FF,
            );
            yy += ln * 18 + 16;
          });
        }

        /* rodapé */
        var yF = footTop;
        ctx.strokeStyle = "rgba(120,130,210,0.22)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(MX, yF);
        ctx.lineTo(W - MX, yF);
        ctx.stroke();
        T(
          "Total alocado " +
            fmtPct(total) +
            "%   ·   Mesa de renda variável · ações com estrutura de proteção · preços-alvo e cotações ilustrativos · não constitui recomendação.",
          MX,
          yF + 26,
          12,
          "#6F77A8",
          "500",
          "left",
        );
        T(
          "Renda variável envolve risco de perda. Sujeito à suitability e às condições de cada produto.",
          MX,
          yF + 46,
          12,
          "#6F77A8",
          "500",
          "left",
        );
        ctx.font = "800 15px " + FF;
        ctx.textAlign = "left";
        var rw = ctx.measureText("rico").width;
        var rx = W - MX - rw - 8;
        ctx.fillStyle = "#fff";
        window.__ricoLogoAuto(ctx, rx, yF + 47);
        ctx.fillStyle = ORG;
        ctx.fillText(".", rx + rw, yF + 47);

        return cv.toDataURL("image/png");
      }

      /* ============================================================
   CARD DO CLIENTE — arte de marketing (1 a 3 operações)
   Reaproveita OPERACOES / QUANTO_OPS / RUBI_CATALOG e a lógica
   de cenários (keyScenarios / cupomOp / payoff) já existentes.
   ============================================================ */
      function rvCardFmtPct(n) {
        var v = Math.round(n * 100) / 100;
        var s = Math.abs(v) < 1e-9 ? 0 : v;
        return s
          .toFixed(2)
          .replace(/\.?0+$/, "")
          .replace(".", ",");
      }
      function rvCardSigned(n) {
        if (Math.abs(n) < 1e-9) return "0%";
        return (n > 0 ? "+" : "−") + rvCardFmtPct(Math.abs(n)) + "%";
      }
      function rvCardSlug(t) {
        return (
          (t == null ? "" : String(t))
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "")
            .replace(/[^a-zA-Z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "") || "op"
        );
      }
      function rvCardAnos(fixing) {
        if (!fixing) return 3;
        var m = String(fixing).match(/(\d+)/);
        return m ? parseInt(m[1], 10) : 3;
      }
      function rvCardVencimento(anos) {
        try {
          var d = new Date();
          d.setFullYear(d.getFullYear() + (anos || 3));
          var mm = ("0" + (d.getMonth() + 1)).slice(-2);
          return mm + "/" + d.getFullYear();
        } catch (_) {
          return "";
        }
      }

      /* Catálogo unificado de operações para o seletor do card.
   Cada item: { key, ativo, mercado, kind, label, op }  (op é a estrutura nativa) */
      function rvCardCatalog() {
        var out = [];
        try {
          OPERACOES.forEach(function (op) {
            out.push({
              key: op.id,
              ativo: op.ativo,
              mercado: "Brasil · B3",
              kind: "protecao",
              label: op.nome,
              op: op,
            });
          });
        } catch (_) {}
        try {
          QUANTO_OPS.forEach(function (op) {
            out.push({
              key: op.id,
              ativo: op.ativo,
              mercado: "Internacional · Quanto",
              kind: op.payoff === 1 ? "quanto" : "quantoTaxa",
              label: op.nome,
              op: op,
            });
          });
        } catch (_) {}
        try {
          RUBI_CATALOG.forEach(function (r) {
            var it = {
              nome: r.ativo,
              cupomTaxa: r.taxa,
              cupomBarreira: r.barreira,
              cupomCDI: r.cdi,
              setor: r.setor,
            };
            out.push({
              key: r.id,
              ativo: r.ativo,
              mercado: "Brasil · Cupom",
              kind: "cupom",
              label: r.ativo + " · Cupom " + rvCardFmtPct(r.taxa) + "%",
              op: cupomOp(it),
            });
          });
        } catch (_) {}
        return out;
      }

      /* Deriva todos os campos do card a partir da operação + tipo. */
      function rvCardData(entry) {
        var op = entry.op,
          kind = entry.kind,
          ativo = entry.ativo || op.ativo || "o ativo";
        var anos, prazoTxt, venc;
        // ----- defaults -----
        var d = {
          ativo: ativo,
          mercado: entry.mercado || "Brasil",
          kind: kind,
          titulo: "",
          destaqueNum: "",
          destaqueLeg: "",
          metric: [],
          chartFloor: null,
          chartLabel: ativo + " (ilustrativo)",
          tabTitulo: "O que você recebe em cada cenário",
          tabCols: ["CENÁRIO", ativo, "VOCÊ RECEBE"],
          secoes: [],
          cta: "",
          tipoLabel: "",
          grafTitulo: "O piso é seu — o índice se move por cima",
        };

        if (kind === "protecao") {
          // fence / collar (proteção parcial ou total)
          anos = 3;
          prazoTxt = "3 anos";
          venc = rvCardVencimento(anos);
          var protTotal = op.protegeAte != null && op.protegeAte <= -100;
          var teto = op.teto,
            tetoB = op.tetoBarreira,
            barr = op.barreira;
          d.tipoLabel = protTotal
            ? "COLLAR · CAPITAL PROTEGIDO"
            : "FENCE · PROTEÇÃO PARCIAL";
          d.destaqueNum = rvCardFmtPct(teto) + "%";
          d.destaqueLeg = "TETO DE GANHO · PARTICIPA 1:1";
          if (protTotal) {
            d.titulo =
              "Seu capital 100% protegido — e ainda surfe a alta do " +
              ativo +
              " até <b>" +
              rvCardFmtPct(teto) +
              "%</b>";
            d.metric = [
              {
                lbl: "CAPITAL",
                val: "100% protegido",
                col: "#2BD9A6",
                sub: "piso travado no vencimento",
              },
              {
                lbl: "TETO DE GANHO",
                val: "+" + rvCardFmtPct(teto) + "%",
                col: ORANGE,
                sub: "participa 1:1 até o teto",
              },
              {
                lbl: "PRAZO",
                val: prazoTxt,
                col: "#fff",
                sub: "vencimento em " + venc,
              },
              {
                lbl: "CUSTO PARA VOCÊ",
                val: "Zero taxas",
                col: "#2BD9A6",
                sub: "sem taxa de entrada",
              },
            ];
            d.chartFloor = { pct: 0, label: "PISO 0%" };
            d.cta =
              "Você não perde capital em queda e, se o " +
              ativo +
              " subir, participa <b>1:1</b> da alta até <b>+" +
              rvCardFmtPct(teto) +
              "%</b>.";
          } else {
            var pAte = Math.abs(op.protegeAte);
            d.titulo =
              "Até <b>" +
              rvCardFmtPct(pAte) +
              "%</b> de queda sem perda — e a alta do " +
              ativo +
              " até <b>" +
              rvCardFmtPct(teto) +
              "%</b> é sua";
            d.metric = [
              {
                lbl: "PROTEÇÃO",
                val: "até −" + rvCardFmtPct(pAte) + "%",
                col: "#2BD9A6",
                sub: "queda absorvida no vencimento",
              },
              {
                lbl: "TETO DE GANHO",
                val: "+" + rvCardFmtPct(teto) + "%",
                col: ORANGE,
                sub: "participa 1:1 até o teto",
              },
              {
                lbl: "PRAZO",
                val: prazoTxt,
                col: "#fff",
                sub: "vencimento em " + venc,
              },
              {
                lbl: "CUSTO PARA VOCÊ",
                val: "Zero taxas",
                col: "#2BD9A6",
                sub: "sem taxa de entrada",
              },
            ];
            d.chartFloor = {
              pct: 0,
              label: "PROTEÇÃO −" + rvCardFmtPct(pAte) + "%",
            };
            d.cta =
              "Você não perde até <b>−" +
              rvCardFmtPct(pAte) +
              "%</b> de queda e participa <b>1:1</b> da alta até <b>+" +
              rvCardFmtPct(teto) +
              "%</b>.";
          }
          d.chartLabel = ativo + " (ilustrativo)";
          // tabela de cenários — usa o payoff real (op.cen)
          var prot = keyScenarios(op);
          var protRows = prot.map(function (p) {
            return { ativoVar: p[0], recebe: p[1] };
          });
          // separa zona de proteção (você recebe <= ativo na queda) e zona de ganho
          var zonaProt = [],
            zonaGanho = [];
          protRows.forEach(function (r) {
            if (r.ativoVar <= 0) zonaProt.push(r);
            else zonaGanho.push(r);
          });
          if (!zonaGanho.length) {
            // garante ao menos a melhor linha de alta
            var best = protRows[protRows.length - 1];
            if (best) {
              zonaGanho.push(best);
              zonaProt = zonaProt.filter(function (x) {
                return x !== best;
              });
            }
          }
          d.secoes = [
            {
              titulo: protTotal
                ? "ZONA DE PROTEÇÃO · PISO TRAVADO"
                : "ZONA DE PROTEÇÃO · QUEDA ABSORVIDA",
              cor: "#2BD9A6",
              rows: zonaProt,
            },
            {
              titulo: "ZONA DE GANHO · ACOMPANHA A ALTA",
              cor: ORANGE,
              rows: zonaGanho,
            },
          ];
        } else if (kind === "quanto") {
          // Quanto payoff 1: capital protegido, multiplicador na alta
          anos = rvCardAnos(op.fixing);
          prazoTxt = op.fixing || anos + " anos";
          venc = rvCardVencimento(anos);
          var mult = op.mult || 1;
          d.mercado = "Internacional · Quanto";
          d.tipoLabel = "QUANTO · CAPITAL PROTEGIDO · SEM RISCO CAMBIAL";
          d.destaqueNum = mult.toFixed(2).replace(".", ",") + "x";
          d.destaqueLeg = "MULTIPLICADOR NA ALTA";
          d.grafTitulo =
            "Capital protegido — a alta do " + ativo + " multiplicada";
          d.titulo =
            "Capital 100% protegido em dólar-sem-risco — e cada alta do " +
            ativo +
            " vale <b>" +
            mult.toFixed(2).replace(".", ",") +
            "x</b>";
          d.metric = [
            {
              lbl: "CAPITAL",
              val: "100% protegido",
              col: "#2BD9A6",
              sub: "devolvido se o índice cair",
            },
            {
              lbl: "MULTIPLICADOR",
              val: mult.toFixed(2).replace(".", ",") + "x",
              col: ORANGE,
              sub: "sobre a alta, sem teto",
            },
            {
              lbl: "PRAZO",
              val: prazoTxt,
              col: "#fff",
              sub: "vencimento em " + venc,
            },
            {
              lbl: "CÂMBIO",
              val: "Sem risco",
              col: "#2BD9A6",
              sub: "resultado em moeda local",
            },
          ];
          d.chartFloor = { pct: 0, label: "PISO 0% (capital protegido)" };
          d.chartLabel =
            ativo +
            " × " +
            mult.toFixed(2).replace(".", ",") +
            " (ilustrativo)";
          var qrows = keyScenarios(op).map(function (p) {
            return { ativoVar: p[0], recebe: p[1] };
          });
          var qProt = qrows.filter(function (r) {
            return r.ativoVar <= 0;
          });
          var qGanho = qrows.filter(function (r) {
            return r.ativoVar > 0;
          });
          d.secoes = [
            {
              titulo: "ZONA DE PROTEÇÃO · CAPITAL DEVOLVIDO",
              cor: "#2BD9A6",
              rows: qProt,
            },
            {
              titulo:
                "ZONA DE GANHO · ALTA × " +
                mult.toFixed(2).replace(".", ",") +
                " SEM TETO",
              cor: ORANGE,
              rows: qGanho,
            },
          ];
          d.cta =
            "Se o " +
            ativo +
            " cair, você recebe <b>100% do capital</b> de volta. Se subir, ganha a alta multiplicada por <b>" +
            mult.toFixed(2).replace(".", ",") +
            "x</b>, sem teto.";
        } else if (kind === "quantoTaxa") {
          // Quanto payoff 2: taxa fixa OU alta 1:1
          anos = rvCardAnos(op.fixing);
          prazoTxt = op.fixing || anos + " anos";
          venc = rvCardVencimento(anos);
          var taxa = op.taxa || 0;
          d.mercado = "Internacional · Quanto";
          d.tipoLabel = "QUANTO · RETORNO MÍNIMO · SEM RISCO CAMBIAL";
          d.destaqueNum = rvCardFmtPct(taxa) + "%";
          d.destaqueLeg = "RETORNO MÍNIMO NO PERÍODO";
          d.grafTitulo = "O piso é seu — o " + ativo + " se move por cima";
          d.titulo =
            "Um retorno mínimo de <b>" +
            rvCardFmtPct(taxa) +
            "%</b> travado no vencimento — e ainda surfe a alta do " +
            ativo;
          d.metric = [
            {
              lbl: "RETORNO MÍNIMO",
              val: "+" + rvCardFmtPct(taxa) + "%",
              col: ORANGE,
              sub: "travado no vencimento",
            },
            {
              lbl: "CAPITAL",
              val: "Protegido",
              col: "#2BD9A6",
              sub: "piso garantido no período",
            },
            {
              lbl: "PRAZO",
              val: prazoTxt,
              col: "#fff",
              sub: "vencimento em " + venc,
            },
            {
              lbl: "CÂMBIO",
              val: "Sem risco",
              col: "#2BD9A6",
              sub: "resultado em moeda local",
            },
          ];
          d.chartFloor = {
            pct: taxa,
            label: "PISO +" + rvCardFmtPct(taxa) + "%",
          };
          d.chartLabel = ativo + " (ilustrativo)";
          var trows = keyScenarios(op).map(function (p) {
            return { ativoVar: p[0], recebe: p[1] };
          });
          var tProt = trows.filter(function (r) {
            return r.recebe <= taxa + 0.001;
          });
          var tGanho = trows.filter(function (r) {
            return r.recebe > taxa + 0.001;
          });
          d.secoes = [
            {
              titulo: "ZONA DE PISO · RETORNO MÍNIMO TRAVADO",
              cor: "#2BD9A6",
              rows: tProt,
            },
            {
              titulo: "ZONA DE GANHO · ACOMPANHA 1:1 A ALTA",
              cor: ORANGE,
              rows: tGanho,
            },
          ];
          d.cta =
            "Você ganha no mínimo <b>" +
            rvCardFmtPct(taxa) +
            "%</b> em qualquer cenário e, se o " +
            ativo +
            " subir além disso, seu retorno acompanha o índice <b>1 para 1</b>, sem teto.";
        } else if (kind === "cupom") {
          // Rubi cupom pré-fixado com barreira de desarme
          anos = 2;
          prazoTxt = "~2 anos";
          venc = rvCardVencimento(anos);
          var ct = op.taxa,
            cb = op.barreira;
          d.tipoLabel = "RUBI · CUPOM PRÉ-FIXADO";
          d.destaqueNum = rvCardFmtPct(ct) + "%";
          d.destaqueLeg =
            op.cdi != null
              ? "≈ " + rvCardFmtPct(op.cdi) + "% DO CDI"
              : "CUPOM PRÉ-FIXADO";
          d.grafTitulo =
            "Cupom travado — enquanto o " + ativo + " não desarmar";
          d.titulo =
            "Um cupom pré-fixado de <b>" +
            rvCardFmtPct(ct) +
            "%</b> — pago no vencimento se o " +
            ativo +
            " não cair além de <b>" +
            rvCardFmtPct(cb) +
            "%</b>";
          d.metric = [
            {
              lbl: "CUPOM",
              val: "+" + rvCardFmtPct(ct) + "%",
              col: ORANGE,
              sub: "pré-fixado no vencimento",
            },
            {
              lbl: "BARREIRA",
              val: rvCardFmtPct(cb) + "%",
              col: "#2BD9A6",
              sub: "desarme se o ativo cair mais",
            },
            {
              lbl: "PRAZO",
              val: prazoTxt,
              col: "#fff",
              sub: "vencimento em " + venc,
            },
            {
              lbl: op.cdi != null ? "EQUIVALE A" : "CUSTO PARA VOCÊ",
              val:
                op.cdi != null ? rvCardFmtPct(op.cdi) + "% CDI" : "Zero taxas",
              col: op.cdi != null ? "#36C5F0" : "#2BD9A6",
              sub:
                op.cdi != null ? "em renda pré-fixada" : "sem taxa de entrada",
            },
          ];
          d.chartFloor = { pct: ct, label: "CUPOM +" + rvCardFmtPct(ct) + "%" };
          d.chartLabel = ativo + " (ilustrativo)";
          d.tabTitulo = "O que você recebe em cada cenário";
          var crows = keyScenarios(op).map(function (p) {
            return { ativoVar: p[0], recebe: p[1] };
          });
          var cCupom = crows.filter(function (r) {
            return Math.abs(r.recebe - ct) < 0.01;
          });
          var cDesarme = crows.filter(function (r) {
            return Math.abs(r.recebe - ct) >= 0.01;
          });
          d.secoes = [
            {
              titulo: "CUPOM PAGO · ENQUANTO NÃO DESARMA",
              cor: "#2BD9A6",
              rows: cCupom,
            },
            {
              titulo: "DESARME · ABAIXO DA BARREIRA " + rvCardFmtPct(cb) + "%",
              cor: "#FF5566",
              rows: cDesarme,
            },
          ];
          d.cta =
            "Se o " +
            ativo +
            " não cair além de <b>" +
            rvCardFmtPct(cb) +
            "%</b>, você recebe um cupom de <b>" +
            rvCardFmtPct(ct) +
            "%</b> no vencimento, independente da alta.";
        } else {
          // fallback genérico
          anos = 3;
          prazoTxt = "3 anos";
          venc = rvCardVencimento(anos);
          d.tipoLabel = "OPERAÇÃO ESTRUTURADA";
          d.titulo =
            "Uma operação estruturada de " +
            ativo +
            " desenhada para o seu momento";
          d.destaqueNum = ativo;
          d.destaqueLeg = "OPERAÇÃO ESTRUTURADA";
          d.metric = [
            {
              lbl: "PRAZO",
              val: prazoTxt,
              col: "#fff",
              sub: "vencimento em " + venc,
            },
            {
              lbl: "CUSTO PARA VOCÊ",
              val: "Zero taxas",
              col: "#2BD9A6",
              sub: "sem taxa de entrada",
            },
          ];
          var grows = (op && op.cen ? keyScenarios(op) : []).map(function (p) {
            return { ativoVar: p[0], recebe: p[1] };
          });
          d.secoes = [
            { titulo: "CENÁRIOS DA OPERAÇÃO", cor: ORANGE, rows: grows },
          ];
          d.cta =
            "Fale com seu assessor para entender como esta operação se encaixa na sua carteira.";
        }
        d.prazoAnos = anos;
        d.venc = venc;
        d.op = op;
        d.kindResolved = kind;
        return d;
      }

      /* SVG ilustrativo da linha do ativo subindo com volatilidade + piso tracejado. */
      function rvCardChartSVG(floorPct) {
        var W = 520,
          H = 210,
          pad = 14;
        // série ilustrativa subindo com ruído
        var pts = [8, 3, 12, 6, 18, 11, 22, 16, 30, 24, 38, 33, 46];
        var min = Math.min.apply(null, pts),
          max = Math.max.apply(null, pts);
        var n = pts.length;
        function px(i) {
          return pad + (i / (n - 1)) * (W - 2 * pad);
        }
        function py(v) {
          return H - 26 - ((v - min) / (max - min || 1)) * (H - 2 * pad - 26);
        }
        var path = "";
        pts.forEach(function (v, i) {
          path +=
            (i ? "L" : "M") + px(i).toFixed(1) + " " + py(v).toFixed(1) + " ";
        });
        // área
        var area =
          path +
          "L" +
          px(n - 1).toFixed(1) +
          " " +
          (H - 26) +
          " L" +
          px(0).toFixed(1) +
          " " +
          (H - 26) +
          " Z";
        // piso: posiciona ~38% da altura
        var floorY = H - 26 - (H - 2 * pad - 26) * 0.34;
        var svg =
          '<svg viewBox="0 0 ' +
          W +
          " " +
          H +
          '" width="100%" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">';
        svg +=
          '<defs><linearGradient id="rvcg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF6B2C" stop-opacity="0.30"/><stop offset="1" stop-color="#FF6B2C" stop-opacity="0"/></linearGradient></defs>';
        svg += '<path d="' + area + '" fill="url(#rvcg)"/>';
        svg +=
          '<path d="' +
          path +
          '" fill="none" stroke="#FF8B52" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>';
        svg +=
          '<line x1="' +
          pad +
          '" y1="' +
          floorY.toFixed(1) +
          '" x2="' +
          (W - pad) +
          '" y2="' +
          floorY.toFixed(1) +
          '" stroke="#2BD9A6" stroke-width="2" stroke-dasharray="7 6"/>';
        svg +=
          '<text x="' +
          (W - pad) +
          '" y="' +
          (floorY - 7).toFixed(1) +
          '" text-anchor="end" fill="#2BD9A6" font-size="13" font-weight="700" font-family="Arial">' +
          esc(floorPct) +
          "</text>";
        svg += "</svg>";
        return svg;
      }

      /* Disclaimer reaproveitado do app. */
      var RV_CARD_DISCLAIMER =
        "Material de apoio comercial. Valores ilustrativos. Não constitui recomendação ou oferta. Sujeito à suitability e às condições de cada produto. Renda variável envolve risco de perda.";

      /* Monta o DIV HTML do card (1200x675). */
      /* Cor por valor: verde=ganho, dourado=estável/0, vermelho=perda */
      function rvCardValCor(v) {
        return v > 0.001 ? "#2BD9A6" : v < -0.001 ? "#FF5566" : "#F5B63E";
      }

      /* Tabela "R$ 100 em cada cenário": consolida d.secoes numa única lista
   ordenada (alta -> baixa), com 2 colunas: variação do ativo | variação da estratégia. */
      function rvCardScenTableHTML(d) {
        var uniq = [];
        // Usa EXATAMENTE os mesmos cenarios de "Como funciona a operacao" (payoffBarsSVG(op,false)):
        // todas as linhas de op.cen, ordenadas do maior para o menor, sem reducao.
        if (d && d.op && d.op.cen && d.op.cen.length) {
          var full = d.op.cen.slice().sort(function (a, b) {
            return b[0] - a[0];
          });
          var seenF = {};
          full.forEach(function (p) {
            var k = Math.round(p[0] * 100) / 100;
            if (seenF[k] == null) {
              seenF[k] = 1;
              uniq.push({ ativoVar: p[0], recebe: p[1] });
            }
          });
        } else {
          // fallback: consolida d.secoes (comportamento antigo)
          var rows = [];
          (d.secoes || []).forEach(function (sec) {
            (sec.rows || []).forEach(function (r) {
              rows.push(r);
            });
          });
          var seen = {};
          rows.forEach(function (r) {
            var k = Math.round(r.ativoVar * 100) / 100;
            if (seen[k] == null) {
              seen[k] = 1;
              uniq.push(r);
            }
          });
          uniq.sort(function (a, b) {
            return b.ativoVar - a.ativoVar;
          });
        }
        var ativoUp = esc((d.ativo || "").toUpperCase());
        var h = '<div class="rvc-sc">';
        h +=
          '<div class="rvc-sc-title">O que acontece com R$ 100 investidos em cada cenário</div>';
        h +=
          '<div class="rvc-sc-head"><span>VARIAÇÃO % DO ' +
          ativoUp +
          "</span><span>VARIAÇÃO % DA ESTRATÉGIA</span></div>";
        h += '<div class="rvc-sc-grid">';
        uniq.forEach(function (r) {
          var ac = rvCardValCor(r.ativoVar),
            ec = rvCardValCor(r.recebe);
          h +=
            '<div class="rvc-sc-col">' +
            '<span class="rvc-sc-dot" style="background:' +
            ac +
            '"></span>' +
            '<span class="rvc-sc-val" style="color:' +
            ac +
            '">' +
            esc(rvCardSigned(r.ativoVar)) +
            "</span></div>" +
            '<div class="rvc-sc-col rvc-sc-right">' +
            '<span class="rvc-sc-dot" style="background:' +
            ec +
            '"></span>' +
            '<span class="rvc-sc-val" style="color:' +
            ec +
            '">' +
            esc(rvCardSigned(r.recebe)) +
            "</span></div>";
        });
        h += "</div>";
        h +=
          '<div class="rvc-sc-leg">' +
          '<span><span class="rvc-sc-ldot" style="background:#2BD9A6"></span>Estrutura · ganho</span>' +
          '<span><span class="rvc-sc-ldot" style="background:#F5B63E"></span>Estável</span>' +
          '<span><span class="rvc-sc-ldot" style="background:#FF5566"></span>Perda</span>' +
          "</div>";
        h += "</div>";
        return h;
      }

      /* Descricao da operacao para o card (mesma da secao "Como funciona a operacao").
   Prefere descricao editada pelo usuario (op.descricao); senao usa a padrao por tipo. */
      function rvCardOpDescricao(d) {
        try {
          var op = d && d.op;
          if (!op) return "";
          if (op.descricao && String(op.descricao).trim())
            return String(op.descricao).trim();
          var kind = d.kindResolved || d.kind;
          if (kind === "quanto" || kind === "quantoTaxa") {
            if (typeof opDetalheQuanto === "function")
              return opDetalheQuanto(op);
          } else if (kind === "cupom") {
            // mesma logica de cupomDetalhe (que vive noutro escopo)
            var tx = op.taxa != null ? fmtPct(op.taxa) : "";
            var bb = op.barreira != null ? fmtPct(op.barreira) : "";
            var txt =
              "SmartCupom · cupom pré-fixado de " +
              tx +
              "% · barreira de desarme " +
              bb +
              "%";
            if (op.cdi != null) txt += " · ≈ " + fmtPct(op.cdi) + "% do CDI";
            return txt;
          } else {
            if (typeof opDetalhe === "function") return opDetalhe(op);
          }
        } catch (_) {}
        return "";
      }

      /* Painel "Como funciona" exibido a DIREITA da tabela de cenarios no card. */
      function rvCardDescPanelHTML(d) {
        var txt = "";
        try {
          txt = rvCardOpDescricao(d);
        } catch (_) {
          txt = "";
        }
        if (!txt) txt = d && d.cta ? String(d.cta).replace(/<[^>]+>/g, "") : "";
        if (!txt) return '<div class="rvc-main-col rvc-main-desc"></div>';
        return (
          '<div class="rvc-main-col rvc-main-desc">' +
          '<div class="rvc-desc-kicker">SOBRE A OPERAÇÃO</div>' +
          '<div class="rvc-desc-title">Como funciona</div>' +
          '<div class="rvc-desc-body">' +
          esc(txt) +
          "</div>" +
          "</div>"
        );
      }

      function buildCardHTML(d) {
        var headLine =
          "OPERAÇÃO ESTRUTURADA · " +
          esc((d.ativo || "").toUpperCase()) +
          " · " +
          esc(d.tipoLabel) +
          " · " +
          esc((d.mercado || "").toUpperCase());
        var metricH = "";
        d.metric.forEach(function (m) {
          metricH +=
            '<div class="rvc-metric"><div class="rvc-metric-lbl">' +
            esc(m.lbl) +
            "</div>" +
            '<div class="rvc-metric-val" style="color:' +
            m.col +
            '">' +
            esc(m.val) +
            "</div>" +
            '<div class="rvc-metric-sub">' +
            esc(m.sub) +
            "</div></div>";
        });
        // título = só o nome do ativo
        var tituloAtivo = esc(d.ativo || "");

        var html =
          "" +
          '<div class="rvc-root">' +
          '<div class="rvc-glow"></div>' +
          '<div class="rvc-bar"></div>' +
          '<div class="rvc-head">' +
          '<div class="rvc-head-l">' +
          '<div class="rvc-logo">rico<span>.</span></div>' +
          '<div class="rvc-headline">' +
          headLine +
          "</div>" +
          "</div>" +
          '<div class="rvc-pill">OPORTUNIDADE</div>' +
          "</div>" +
          '<div class="rvc-titlerow">' +
          '<div class="rvc-title rvc-title-ativo">' +
          tituloAtivo +
          "</div>" +
          '<div class="rvc-destaque">' +
          '<div class="rvc-destaque-num">' +
          esc(d.destaqueNum) +
          "</div>" +
          '<div class="rvc-destaque-leg">' +
          esc(d.destaqueLeg) +
          "</div>" +
          "</div>" +
          "</div>" +
          '<div class="rvc-metrics">' +
          metricH +
          "</div>" +
          '<div class="rvc-main">' +
          '<div class="rvc-main-col rvc-main-tab">' +
          rvCardScenTableHTML(d) +
          "</div>" +
          rvCardDescPanelHTML(d) +
          "</div>" +
          '<div class="rvc-cta">' +
          '<div class="rvc-cta-txt">' +
          d.cta +
          "</div>" +
          "</div>" +
          '<div class="rvc-disc">' +
          esc(RV_CARD_DISCLAIMER) +
          "</div>" +
          "</div>";
        return html;
      }
      function rvCardCenLabel(v) {
        if (Math.abs(v) < 1e-9) return "Lateral";
        if (v <= -30) return "Queda severa";
        if (v <= -12) return "Queda moderada";
        if (v < 0) return "Queda leve";
        if (v <= 20) return "Alta moderada";
        if (v <= 40) return "Alta forte";
        return "Alta expressiva";
      }

      /* CSS do card + modal (injeta uma vez). */
      function injectCardCSS() {
        if (document.getElementById("rvCardCSS")) return;
        var st = document.createElement("style");
        st.id = "rvCardCSS";
        st.textContent =
          "" +
          "#rvCardStage{position:fixed;left:-99999px;top:0;z-index:-1;}" +
          ".rvc-root{width:1200px;min-height:675px;box-sizing:border-box;position:relative;overflow:hidden;" +
          "font-family:Arial,Helvetica,sans-serif;color:#fff;padding:34px 40px 22px;" +
          "background:linear-gradient(155deg,#0A0F38 0%,#070B2E 58%,#05081F 100%);}" +
          ".rvc-glow{position:absolute;top:-160px;right:-120px;width:560px;height:560px;border-radius:50%;" +
          "background:radial-gradient(circle,rgba(242,101,34,.22),rgba(242,101,34,0) 65%);pointer-events:none;}" +
          ".rvc-bar{position:absolute;left:0;top:0;width:100%;height:7px;background:linear-gradient(90deg,#F26522,#FF6B2C);}" +
          ".rvc-head{display:flex;justify-content:space-between;align-items:center;position:relative;}" +
          ".rvc-head-l{display:flex;align-items:center;gap:18px;}" +
          ".rvc-logo{font-size:34px;font-weight:800;letter-spacing:-1.5px;line-height:1;}" +
          ".rvc-logo span{color:#F26522;}" +
          ".rvc-headline{font-size:12px;letter-spacing:1.4px;color:#9AA2D0;font-weight:700;text-transform:uppercase;max-width:640px;line-height:1.3;}" +
          ".rvc-pill{background:linear-gradient(90deg,#F26522,#FF6B2C);color:#fff;font-weight:800;font-size:13px;letter-spacing:1.5px;" +
          "padding:9px 20px;border-radius:999px;box-shadow:0 6px 18px rgba(242,101,34,.35);}" +
          ".rvc-titlerow{display:flex;justify-content:space-between;align-items:flex-start;gap:26px;margin-top:20px;}" +
          ".rvc-title{font-size:33px;line-height:1.18;font-weight:800;max-width:740px;letter-spacing:-.5px;}" +
          ".rvc-title b{color:#FF7A33;}" +
          ".rvc-destaque{text-align:right;flex-shrink:0;min-width:200px;}" +
          ".rvc-destaque-num{font-size:58px;font-weight:800;color:#FF7A33;line-height:.95;letter-spacing:-2px;}" +
          ".rvc-destaque-leg{font-size:11px;font-weight:700;letter-spacing:1px;color:#A9B0D6;margin-top:8px;}" +
          ".rvc-metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:22px;}" +
          ".rvc-metric{background:rgba(28,36,112,.5);border:1px solid rgba(120,130,210,.22);border-radius:14px;padding:13px 15px;}" +
          ".rvc-metric-lbl{font-size:10.5px;font-weight:700;letter-spacing:.8px;color:#8A93D8;text-transform:uppercase;}" +
          ".rvc-metric-val{font-size:21px;font-weight:800;margin-top:5px;line-height:1;}" +
          ".rvc-metric-sub{font-size:11px;color:#A9B0D6;margin-top:6px;line-height:1.25;}" +
          ".rvc-title-ativo{font-size:54px;font-weight:800;color:#fff;letter-spacing:-1.5px;line-height:1;}" +
          ".rvc-main{margin-top:18px;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:18px;align-items:stretch;}" +
          ".rvc-main-col{min-width:0;}" +
          ".rvc-main-desc{background:rgba(12,17,66,.55);border:1px solid rgba(120,130,210,.2);border-radius:16px;padding:18px 22px;display:flex;flex-direction:column;}" +
          ".rvc-desc-kicker{font-size:10px;font-weight:800;letter-spacing:1.2px;color:#8A93D8;text-transform:uppercase;margin-bottom:8px;}" +
          ".rvc-desc-title{font-size:18px;font-weight:800;color:#fff;margin-bottom:12px;display:flex;align-items:center;gap:9px;}" +
          '.rvc-desc-title::before{content:"";width:5px;height:20px;border-radius:3px;background:linear-gradient(180deg,#F26522,#FF6B2C);display:inline-block;}' +
          ".rvc-desc-body{font-size:15.5px;line-height:1.62;color:#D7DBF4;font-weight:500;}" +
          /* tabela "R$ 100 em cada cenário" */
          ".rvc-sc{background:rgba(12,17,66,.55);border:1px solid rgba(120,130,210,.2);border-radius:16px;padding:16px 18px 14px;height:100%;box-sizing:border-box;}" +
          ".rvc-sc-title{font-size:15px;font-weight:800;color:#fff;margin-bottom:12px;}" +
          ".rvc-sc-head{display:grid;grid-template-columns:1fr 1fr;gap:0;font-size:10px;font-weight:800;letter-spacing:.5px;color:#8A93D8;padding:0 8px 8px;border-bottom:1px solid rgba(120,130,210,.18);}" +
          ".rvc-sc-head span:nth-child(2){text-align:left;}" +
          ".rvc-sc-grid{display:grid;grid-template-columns:1fr 1fr;gap:0;margin-top:4px;}" +
          ".rvc-sc-col{display:flex;align-items:center;gap:9px;padding:6px 8px;border-bottom:1px solid rgba(120,130,210,.08);}" +
          ".rvc-sc-right{justify-content:flex-start;border-left:1px solid rgba(120,130,210,.12);}" +
          ".rvc-sc-dot{width:11px;height:11px;border-radius:50%;flex-shrink:0;}" +
          ".rvc-sc-val{font-size:16px;font-weight:800;font-family:Arial,sans-serif;}" +
          ".rvc-sc-leg{display:flex;gap:20px;margin-top:12px;font-size:11.5px;color:#A9B0D6;font-weight:700;}" +
          ".rvc-sc-ldot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:7px;vertical-align:-1px;}" +
          ".rvc-graf,.rvc-cen{background:rgba(12,17,66,.55);border:1px solid rgba(120,130,210,.2);border-radius:16px;padding:14px 16px;}" +
          ".rvc-cardtitle{font-size:14px;font-weight:800;color:#fff;margin-bottom:10px;}" +
          ".rvc-chart{height:150px;}" +
          ".rvc-leg{display:flex;gap:18px;margin-top:8px;font-size:11px;color:#A9B0D6;font-weight:600;}" +
          ".rvc-legdot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:6px;vertical-align:0px;}" +
          ".rvc-tab{font-size:12px;}" +
          ".rvc-tab-head{display:grid;grid-template-columns:1.25fr .7fr .9fr;gap:6px;font-size:9.5px;font-weight:700;letter-spacing:.6px;color:#6F77A8;padding:0 2px 7px;border-bottom:1px solid rgba(120,130,210,.18);}" +
          ".rvc-tab-head span:nth-child(2){text-align:center;}.rvc-tab-head span:nth-child(3){text-align:right;}" +
          ".rvc-tab-sec{font-size:9.5px;font-weight:800;letter-spacing:.5px;margin:8px 0 3px;display:flex;align-items:center;}" +
          ".rvc-secdot{width:8px;height:8px;border-radius:50%;margin-right:7px;}" +
          ".rvc-tab-row{display:grid;grid-template-columns:1.25fr .7fr .9fr;gap:6px;padding:4px 2px;align-items:center;border-bottom:1px solid rgba(120,130,210,.08);}" +
          ".rvc-cell{font-weight:700;color:#cfd4ef;}" +
          ".rvc-cell-cen{display:flex;align-items:center;font-size:12px;}" +
          ".rvc-rdot{width:7px;height:7px;border-radius:50%;margin-right:7px;flex-shrink:0;}" +
          ".rvc-cell-mid{text-align:center;color:#A9B0D6;font-size:12px;}" +
          ".rvc-cell-rec{text-align:right;font-size:13px;font-weight:800;}" +
          ".rvc-cta{display:flex;justify-content:space-between;align-items:center;gap:20px;margin-top:16px;" +
          "background:linear-gradient(90deg,rgba(242,101,34,.16),rgba(255,107,44,.08));border:1px solid rgba(242,101,34,.4);border-radius:14px;padding:14px 20px;}" +
          ".rvc-cta-txt{font-size:14.5px;font-weight:600;color:#E7EAFb;line-height:1.4;max-width:840px;}" +
          ".rvc-cta-txt b{color:#FF7A33;font-weight:800;}" +
          ".rvc-cta-btn{background:linear-gradient(90deg,#F26522,#FF6B2C);color:#fff;font-weight:800;font-size:14px;" +
          "padding:13px 26px;border-radius:11px;white-space:nowrap;box-shadow:0 6px 16px rgba(242,101,34,.4);}" +
          ".rvc-disc{font-size:9.5px;color:#5F67A0;margin-top:10px;line-height:1.4;}" +
          /* modal */
          "#rvCardModal{position:fixed;inset:0;z-index:99999;background:rgba(5,8,24,.78);display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px) saturate(1.25);}" +
          "#rvCardModal .rvm-box{width:100%;max-width:560px;max-height:86vh;overflow:auto;background:linear-gradient(160deg,#0E1450,#0A0F38);border:1px solid rgba(120,130,210,.3);border-radius:18px;padding:24px;font-family:Manrope,Arial,sans-serif;color:#fff;box-shadow:0 24px 60px rgba(0,0,0,.6);}" +
          "#rvCardModal .rvm-title{font-size:19px;font-weight:800;}" +
          "#rvCardModal .rvm-sub{font-size:13px;color:#A9B0D6;margin-top:5px;margin-bottom:16px;}" +
          "#rvCardModal .rvm-count{font-size:12px;font-weight:700;color:#FF8B52;margin-bottom:10px;}" +
          "#rvCardModal .rvm-list{display:flex;flex-direction:column;gap:8px;margin-bottom:18px;}" +
          "#rvCardModal .rvm-item{display:flex;align-items:center;gap:12px;background:rgba(0,0,0,.22);border:1px solid rgba(120,130,210,.18);border-radius:11px;padding:11px 14px;cursor:pointer;transition:.12s;}" +
          "#rvCardModal .rvm-item:hover{border-color:rgba(242,101,34,.45);}" +
          "#rvCardModal .rvm-item.sel{border-color:#F26522;background:rgba(242,101,34,.1);}" +
          "#rvCardModal .rvm-item.disabled{opacity:.4;cursor:not-allowed;}" +
          "#rvCardModal .rvm-chk{width:20px;height:20px;border-radius:6px;border:2px solid rgba(120,130,210,.5);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:#fff;}" +
          "#rvCardModal .rvm-item.sel .rvm-chk{background:#F26522;border-color:#F26522;}" +
          "#rvCardModal .rvm-info{flex:1;min-width:0;}" +
          "#rvCardModal .rvm-nome{font-size:14px;font-weight:700;}" +
          "#rvCardModal .rvm-meta{font-size:11.5px;color:#8A93D8;margin-top:2px;}" +
          "#rvCardModal .rvm-grp{font-size:10.5px;font-weight:800;letter-spacing:.8px;color:#6F77A8;text-transform:uppercase;margin:14px 0 4px;}" +
          "#rvCardModal .rvm-actions{display:flex;gap:10px;justify-content:flex-end;align-items:center;}" +
          "#rvCardModal .rvm-warn{font-size:12px;color:#FFB020;font-weight:600;margin-right:auto;opacity:0;transition:.2s;}" +
          "#rvCardModal .rvm-warn.show{opacity:1;}" +
          "#rvCardModal .rvm-btn{font-family:inherit;border:none;border-radius:10px;padding:11px 20px;font-size:14px;font-weight:700;cursor:pointer;}" +
          "#rvCardModal .rvm-ghost{background:transparent;border:1px solid rgba(120,130,210,.35);color:#cfd4ef;}" +
          "#rvCardModal .rvm-solid{background:#F26522;color:#fff;}" +
          "#rvCardModal .rvm-solid:disabled{opacity:.45;cursor:not-allowed;}";
        document.head.appendChild(st);
      }

      /* Garante o html2canvas carregado (lazy, defensivo). */
      function ensureHtml2Canvas(cb) {
        if (window.html2canvas) {
          cb(window.html2canvas);
          return;
        }
        if (window.__h2cLoading) {
          window.__h2cLoading.push(cb);
          return;
        }
        window.__h2cLoading = [cb];
        var s = document.createElement("script");
        s.src = "./vendor/html2canvas-1.4.1.min.js";
        s.onload = function () {
          var q = window.__h2cLoading || [];
          window.__h2cLoading = null;
          q.forEach(function (f) {
            try {
              f(window.html2canvas);
            } catch (_) {}
          });
        };
        s.onerror = function () {
          var q = window.__h2cLoading || [];
          window.__h2cLoading = null;
          q.forEach(function (f) {
            try {
              f(null);
            } catch (_) {}
          });
        };
        document.head.appendChild(s);
      }

      /* Fallback: abre janela com o card e dispara impressão. */
      function cardPrintFallback(htmlList) {
        try {
          var w = window.open("", "_blank");
          if (!w) {
            alert("Habilite pop-ups para gerar o card por impressão.");
            return;
          }
          var css = document.getElementById("rvCardCSS");
          var cssTxt = css ? css.textContent : "";
          var body = htmlList
            .map(function (h) {
              return '<div style="margin:0 auto 24px;">' + h + "</div>";
            })
            .join("");
          w.document.write(
            '<!doctype html><html><head><meta charset="utf-8"><title>Card do cliente</title><style>body{margin:0;background:#05081F;}' +
              cssTxt +
              "</style></head><body>" +
              body +
              "<scr" +
              "ipt>setTimeout(function(){window.print();},400);</scr" +
              "ipt></body></html>",
          );
          w.document.close();
        } catch (e) {
          alert(
            "Não foi possível gerar o card: " +
              (e && e.message ? e.message : e),
          );
        }
      }

      /* Gera e oferece download em PNG para cada operação selecionada. */
      function gerarCardsSelecionados(entries) {
        injectCardCSS();
        var stage = document.getElementById("rvCardStage");
        if (!stage) {
          stage = document.createElement("div");
          stage.id = "rvCardStage";
          document.body.appendChild(stage);
        }
        var htmlList = [],
          dataList = [];
        entries.forEach(function (e) {
          try {
            var d = rvCardData(e);
            dataList.push({ e: e, d: d });
            htmlList.push(buildCardHTML(d));
          } catch (err) {
            console.error("card data", err);
          }
        });
        if (!htmlList.length) {
          alert("Nenhuma operação válida selecionada.");
          return;
        }

        ensureHtml2Canvas(function (h2c) {
          if (!h2c) {
            cardPrintFallback(htmlList);
            return;
          }
          // empilha TODOS os cards selecionados num único container e gera UMA imagem.
          // Cada card pode ter altura DIFERENTE (mais cenarios = mais alto), entao medimos
          // a altura REAL renderizada de cada card em vez de assumir 675px fixos.
          var n = htmlList.length;
          var stack = document.createElement("div");
          stack.style.cssText = "width:1200px;background:#05081F;";
          stack.innerHTML = htmlList.join("");
          stage.innerHTML = "";
          stage.appendChild(stack);
          var nomeArq;
          try {
            var atvs = dataList
              .map(function (x) {
                return rvCardSlug(x.e.ativo);
              })
              .filter(Boolean);
            nomeArq =
              "Card_" +
              (atvs.slice(0, 3).join("_") || "cliente") +
              (n > 1 ? "_" + n + "ops" : "") +
              ".png";
          } catch (_) {
            nomeArq = "Card_cliente.png";
          }
          setTimeout(function () {
            // mede a altura real do stack (soma das alturas de cada card, que variam)
            var totalH = 675 * n;
            try {
              var rh = Math.ceil(stack.getBoundingClientRect().height);
              var sh = Math.ceil(stack.scrollHeight);
              totalH = Math.max(rh, sh, 675);
            } catch (_) {
              totalH = 675 * n;
            }
            h2c(stack, {
              backgroundColor: null,
              scale: 2,
              useCORS: true,
              logging: false,
              windowWidth: 1200,
              height: totalH,
              width: 1200,
            })
              .then(function (canvas) {
                var url = canvas.toDataURL("image/png");
                try {
                  window.mostrarPngModal(url, nomeArq, {
                    accent: "#F26522",
                    hint:
                      "Card do cliente — " +
                      (n > 1
                        ? n + " operações empilhadas numa imagem só. "
                        : "") +
                      "Baixe ou copie para enviar pelo WhatsApp.",
                  });
                } catch (_) {
                  var a = document.createElement("a");
                  a.href = url;
                  a.download = nomeArq;
                  a.click();
                }
                stage.innerHTML = "";
              })
              .catch(function (err) {
                console.error("h2c render", err);
                cardPrintFallback(htmlList);
                stage.innerHTML = "";
              });
          }, 80);
        });
      }

      /* Modal de seleção (1 a 3 operações). */
      function abrirCardModal() {
        injectCardCSS();
        var antigo = document.getElementById("rvCardModal");
        if (antigo) antigo.remove();
        var cat = rvCardCatalog();
        var sel = {}; // key -> entry
        var groups = [
          {
            id: "protecao",
            titulo: "Proteção (Fence / Collar) · B3",
            items: cat.filter(function (c) {
              return c.kind === "protecao";
            }),
          },
          {
            id: "cupom",
            titulo: "Rubi · Cupom pré-fixado",
            items: cat.filter(function (c) {
              return c.kind === "cupom";
            }),
          },
          {
            id: "quanto",
            titulo: "Quanto Internacional",
            items: cat.filter(function (c) {
              return c.kind === "quanto" || c.kind === "quantoTaxa";
            }),
          },
        ];
        var ov = document.createElement("div");
        ov.id = "rvCardModal";
        var listH = "";
        groups.forEach(function (g) {
          if (!g.items.length) return;
          listH +=
            '<div class="rvm-grp">' +
            esc(g.titulo) +
            '</div><div class="rvm-list">';
          g.items.forEach(function (c) {
            var meta = esc(c.ativo) + " · " + esc(c.mercado);
            listH +=
              '<div class="rvm-item" data-key="' +
              esc(c.key) +
              '"><div class="rvm-chk"></div>' +
              '<div class="rvm-info"><div class="rvm-nome">' +
              esc(c.label) +
              '</div><div class="rvm-meta">' +
              meta +
              "</div></div></div>";
          });
          listH += "</div>";
        });
        ov.innerHTML =
          "" +
          '<div class="rvm-box">' +
          '<div class="rvm-title">Card do cliente</div>' +
          '<div class="rvm-sub">Selecione de 1 a 3 operações. Cada uma vira uma arte (PNG) pronta para enviar ao cliente.</div>' +
          '<div class="rvm-count" id="rvmCount">0 de 3 selecionadas</div>' +
          listH +
          '<div class="rvm-actions">' +
          '<span class="rvm-warn" id="rvmWarn">Máximo 3 operações.</span>' +
          '<button class="rvm-btn rvm-ghost" data-act="cancel">Cancelar</button>' +
          '<button class="rvm-btn rvm-solid" data-act="gen" disabled>Gerar</button>' +
          "</div>" +
          "</div>";
        document.body.appendChild(ov);

        var catByKey = {};
        cat.forEach(function (c) {
          catByKey[c.key] = c;
        });
        var genBtn = ov.querySelector('[data-act="gen"]');
        var countEl = ov.querySelector("#rvmCount");
        var warnEl = ov.querySelector("#rvmWarn");
        function refresh() {
          var keys = Object.keys(sel);
          var n = keys.length;
          countEl.textContent = n + " de 3 selecionadas";
          genBtn.disabled = n === 0;
          ov.querySelectorAll(".rvm-item").forEach(function (it) {
            var k = it.getAttribute("data-key");
            var on = !!sel[k];
            it.classList.toggle("sel", on);
            it.querySelector(".rvm-chk").textContent = on ? "✓" : "";
            it.classList.toggle("disabled", !on && n >= 3);
          });
        }
        ov.querySelectorAll(".rvm-item").forEach(function (it) {
          it.onclick = function () {
            var k = it.getAttribute("data-key");
            if (sel[k]) {
              delete sel[k];
              warnEl.classList.remove("show");
            } else {
              if (Object.keys(sel).length >= 3) {
                warnEl.classList.add("show");
                setTimeout(function () {
                  warnEl.classList.remove("show");
                }, 2200);
                return;
              }
              sel[k] = catByKey[k];
            }
            refresh();
          };
        });
        function fechar() {
          if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
        }
        ov.addEventListener("click", function (e) {
          if (e.target === ov) fechar();
        });
        ov.querySelector('[data-act="cancel"]').onclick = fechar;
        genBtn.onclick = function () {
          var entries = Object.keys(sel).map(function (k) {
            return sel[k];
          });
          if (!entries.length) return;
          fechar();
          try {
            gerarCardsSelecionados(entries);
          } catch (e) {
            console.error(e);
            alert(
              "Não foi possível gerar os cards: " +
                (e && e.message ? e.message : e),
            );
          }
        };
        refresh();
      }

      function gerarPNG() {
        try {
          var d = calc();
          var url = buildCarteiraPNG({
            template: state.template,
            cliente: state.cliente,
            patrimonio: state.patrimonio,
            byClass: d.byClass,
            total: d.total,
            grouped: d.grouped,
            glossTerms: d.glossTerms,
            estruturaBreak: d.estruturaBreak,
            pctAcoes: d.pctAcoes,
            bySetor: d.bySetor,
            retEsp: d.retEsp,
            retEspCobertura: d.retEspCobertura,
          });
          var fname =
            "Carteira_RV_" +
            state.template +
            (state.cliente
              ? "_" + state.cliente.replace(/[^a-zA-Z0-9]+/g, "_")
              : "") +
            ".png";
          window.mostrarPngModal(url, fname, { accent: "#F26522" });
        } catch (e) {
          console.error(e);
          alert(
            "Não foi possível gerar a imagem: " +
              (e && e.message ? e.message : e),
          );
        }
      }

      /* init chamado pelo toggle (lazy) */

      /* ===== Feature: proposta RV como PDF (client-facing) ===== */
      var LS_RV_CLI_ATUAL = "hubRvClienteAtual";
      function rvGetClienteAtual() {
        try {
          return (window.hubStorage.getItem(LS_RV_CLI_ATUAL) || "").trim();
        } catch (_) {
          return "";
        }
      }
      function rvSetClienteAtual(t) {
        try {
          t = String(t == null ? "" : t).trim();
          if (t) window.hubStorage.setItem(LS_RV_CLI_ATUAL, t);
          else window.hubStorage.removeItem(LS_RV_CLI_ATUAL);
        } catch (_) {}
      }

      window.__rvProporProposal = function () {
        try {
          var d = calc();
          var pat = Number(state.patrimonio) || 0;
          function money(n) {
            return "R$ " + fmtBRL(Number(n) || 0);
          }
          var items = (state.items || []).filter(function (i) {
            return i && i.classe === "Renda Variável" && i.ticker;
          });
          items = items.slice().sort(function (a, b) {
            return (Number(b.pct) || 0) - (Number(a.pct) || 0);
          });

          var propTickers = items
            .map(function (i) {
              return String(i.ticker || "").toUpperCase();
            })
            .filter(Boolean);
          var atualTickers = String(rvGetClienteAtual() || "")
            .toUpperCase()
            .split(/[,;\s]+/)
            .map(function (s) {
              return s.trim();
            })
            .filter(Boolean);
          var entrando = [],
            saindo = [];
          if (atualTickers.length) {
            entrando = propTickers.filter(function (t) {
              return atualTickers.indexOf(t) < 0;
            });
            saindo = atualTickers.filter(function (t) {
              return propTickers.indexOf(t) < 0;
            });
          }

          var reTxt, reColor, reCov;
          if (d.retEsp == null) {
            reTxt = "Defina as cotações";
            reColor = "#7a8194";
            reCov =
              "Sem cotações atuais — informe os preços dos ativos para calcular o retorno esperado.";
          } else {
            reTxt = (d.retEsp > 0 ? "+" : "") + fmtPct(d.retEsp) + "%";
            reColor = d.retEsp >= 0 ? "#0a7a45" : "#c0392b";
            reCov =
              "Com base em " +
              d.retEspCobertura.n +
              " de " +
              d.retEspCobertura.m +
              " ativos precificados.";
          }

          var rowsHtml = items
            .map(function (i) {
              var w = Number(i.pct) || 0;
              var val = (pat * w) / 100;
              var hr = holdingRet(i);
              var hrTxt, hrCol;
              if (hr == null) {
                hrTxt = "—";
                hrCol = "#9aa2c0";
              } else {
                hrTxt = (hr > 0 ? "+" : "") + fmtPct(hr) + "%";
                hrCol = hr >= 0 ? "#0a7a45" : "#c0392b";
              }
              var st = structureTag(i);
              var prot = st
                ? '<span class="rvtag">' + esc(st.label) + "</span>"
                : '<span class="rvtag off">—</span>';
              var pa =
                Number(i.precoAlvo) > 0 ? "R$ " + fmtPreco(i.precoAlvo) : "—";
              return (
                "<tr>" +
                '<td class="tk">' +
                esc(i.ticker || "—") +
                "</td>" +
                "<td>" +
                esc(i.nome || "—") +
                "</td>" +
                "<td>" +
                esc(i.setor || "Outros") +
                "</td>" +
                '<td class="num">' +
                fmtPct(w) +
                "%</td>" +
                '<td class="num">' +
                money(val) +
                "</td>" +
                '<td class="num">' +
                pa +
                "</td>" +
                '<td class="num" style="color:' +
                hrCol +
                '">' +
                hrTxt +
                "</td>" +
                "<td>" +
                esc(i.rating || "—") +
                "</td>" +
                "<td>" +
                prot +
                "</td>" +
                "</tr>"
              );
            })
            .join("");
          if (!rowsHtml)
            rowsHtml =
              '<tr><td colspan="9" style="text-align:center;color:#9aa2c0;padding:16px">Nenhuma ação na carteira.</td></tr>';

          var setores = Object.keys(d.bySetor || {})
            .filter(function (s) {
              return d.bySetor[s] > 0;
            })
            .sort(function (a, b) {
              return d.bySetor[b] - d.bySetor[a];
            });
          var maxSec = setores.length ? d.bySetor[setores[0]] : 0;
          var secHtml = setores
            .map(function (s) {
              var p = d.bySetor[s];
              var w = maxSec > 0 ? (p / maxSec) * 100 : 0;
              return (
                '<div class="secrow"><div class="secname">' +
                esc(s) +
                '</div><div class="secbar"><div class="secfill" style="width:' +
                w +
                '%"></div></div><div class="secval">' +
                fmtPct(p) +
                "% · " +
                money((pat * p) / 100) +
                "</div></div>"
              );
            })
            .join("");
          if (!secHtml)
            secHtml =
              '<div style="color:#9aa2c0;font-size:12px">Nenhum setor definido.</div>';

          var flowHtml = "";
          if (atualTickers.length) {
            function chips(arr, color) {
              return arr.length
                ? arr
                    .map(function (t) {
                      return (
                        '<span class="chip" style="border-color:' +
                        color +
                        ";color:" +
                        color +
                        '">' +
                        esc(t) +
                        "</span>"
                      );
                    })
                    .join("")
                : '<span class="none">Nenhuma</span>';
            }
            flowHtml =
              '<div class="sect-t">Movimentação sugerida</div>' +
              '<div class="flowgrid">' +
              '<div class="flowcol"><div class="flowh in">Entrando (' +
              entrando.length +
              ')</div><div class="chips">' +
              chips(entrando, "#0a7a45") +
              "</div></div>" +
              '<div class="flowcol"><div class="flowh out">Saindo (' +
              saindo.length +
              ')</div><div class="chips">' +
              chips(saindo, "#c0392b") +
              "</div></div>" +
              "</div>";
          }

          var hoje = "";
          try {
            hoje = new Date().toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            });
          } catch (_) {}
          var cliente = state.cliente ? esc(state.cliente) : "—";
          var carteira = esc(state.template || "Carteira RV");

          var css =
            "<style>" +
            '.rvpp{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;color:#1c2230;background:#fff;width:794px;box-sizing:border-box;padding:0 0 30px}' +
            ".rvpp *{box-sizing:border-box}" +
            ".rvpp .band{background:linear-gradient(120deg,#1a1d27,#2a1c14);color:#fff;padding:26px 34px 22px;display:flex;justify-content:space-between;align-items:flex-end}" +
            ".rvpp .brand{font-size:30px;font-weight:800;letter-spacing:-.5px}.rvpp .brand b{color:#F26522}" +
            ".rvpp .eyebrow{font-size:11px;font-weight:800;letter-spacing:1.5px;color:#FF8B52;margin-top:6px}" +
            ".rvpp .band h1{font-size:19px;font-weight:800;margin:6px 0 0}" +
            ".rvpp .band .meta{text-align:right;font-size:12px;color:#c8ccd8;line-height:1.7}" +
            ".rvpp .band .meta b{color:#fff}" +
            ".rvpp .body{padding:22px 34px 0}" +
            ".rvpp .hero{display:flex;gap:16px;margin:2px 0 20px}" +
            ".rvpp .herocard{flex:1;border:1px solid #e6e9f0;border-radius:12px;padding:14px 16px;background:#fbfcfe}" +
            ".rvpp .herocard .k{font-size:11px;font-weight:700;color:#7a8194;text-transform:uppercase;letter-spacing:.5px}" +
            ".rvpp .herocard .v{font-size:22px;font-weight:800;margin-top:4px}" +
            ".rvpp .herocard.re{border-color:#F26522;background:linear-gradient(120deg,#fff7f3,#fff)}" +
            ".rvpp .herocard .cov{font-size:10.5px;color:#7a8194;margin-top:5px;font-weight:500}" +
            ".rvpp .sect-t{font-size:13px;font-weight:800;color:#F26522;text-transform:uppercase;letter-spacing:.6px;border-bottom:2px solid #f0e0d8;padding-bottom:6px;margin:20px 0 12px}" +
            ".rvpp table{width:100%;border-collapse:collapse;font-size:11px}" +
            ".rvpp th{background:#f5f6fa;text-align:left;padding:7px 8px;font-size:9.5px;text-transform:uppercase;letter-spacing:.4px;color:#5b6485;font-weight:800;border-bottom:1px solid #e6e9f0}" +
            ".rvpp td{padding:7px 8px;border-bottom:1px solid #eef0f6;vertical-align:middle}" +
            ".rvpp td.tk{font-weight:800;color:#1c2230}" +
            '.rvpp td.num{text-align:right;font-variant-numeric:tabular-nums;font-family:"SFMono-Regular",Consolas,"Liberation Mono",Menlo,monospace}' +
            ".rvpp th.num{text-align:right}" +
            ".rvpp .rvtag{display:inline-block;font-size:9.5px;font-weight:800;padding:2px 8px;border-radius:20px;background:rgba(242,101,34,.1);color:#c0450a}" +
            ".rvpp .rvtag.off{background:transparent;color:#c0c5d2;font-weight:600}" +
            ".rvpp .secrow{display:flex;align-items:center;gap:12px;margin-bottom:8px}" +
            ".rvpp .secname{width:150px;font-size:11.5px;font-weight:700;color:#2a3040;flex:none}" +
            ".rvpp .secbar{flex:1;height:12px;background:#f0f2f7;border-radius:6px;overflow:hidden}" +
            ".rvpp .secfill{height:100%;background:linear-gradient(90deg,#FF8A3D,#F26522);border-radius:6px}" +
            ".rvpp .secval{width:180px;text-align:right;font-size:11px;color:#5b6485;font-variant-numeric:tabular-nums;flex:none}" +
            ".rvpp .flowgrid{display:flex;gap:16px}" +
            ".rvpp .flowcol{flex:1;border:1px solid #e6e9f0;border-radius:12px;padding:12px 14px}" +
            ".rvpp .flowh{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;margin-bottom:9px}" +
            ".rvpp .flowh.in{color:#0a7a45}.rvpp .flowh.out{color:#c0392b}" +
            ".rvpp .chips{display:flex;flex-wrap:wrap;gap:6px}" +
            ".rvpp .chip{display:inline-block;font-size:10.5px;font-weight:800;padding:3px 10px;border:1.5px solid #ccc;border-radius:20px}" +
            ".rvpp .none{font-size:11px;color:#9aa2c0}" +
            ".rvpp .disc{margin:26px 34px 0;padding:12px 14px;background:#f7f8fb;border-radius:10px;font-size:9.5px;color:#7a8194;line-height:1.6}" +
            "</style>";

          var inner =
            '<div class="rvpp">' +
            css +
            '<div class="band">' +
            '<div><div class="brand">ri<b>c</b>o</div><div class="eyebrow">MESA DE RENDA VARIÁVEL</div><h1>Proposta · Renda Variável</h1></div>' +
            '<div class="meta"><div>Carteira: <b>' +
            carteira +
            "</b></div><div>Cliente: <b>" +
            cliente +
            "</b></div><div>Patrimônio: <b>" +
            money(pat) +
            "</b></div><div>" +
            esc(hoje) +
            "</div></div>" +
            "</div>" +
            '<div class="body">' +
            '<div class="hero">' +
            '<div class="herocard re"><div class="k">Retorno esperado</div><div class="v" style="color:' +
            reColor +
            '">' +
            reTxt +
            '</div><div class="cov">' +
            esc(reCov) +
            "</div></div>" +
            '<div class="herocard"><div class="k">Ações na carteira</div><div class="v">' +
            items.length +
            '</div><div class="cov">Alocação em renda variável: ' +
            fmtPct(d.pctAcoes || 0) +
            "%</div></div>" +
            '<div class="herocard"><div class="k">Patrimônio alocado</div><div class="v">' +
            money(pat) +
            '</div><div class="cov">Valores por ativo = patrimônio × peso.</div></div>' +
            "</div>" +
            '<div class="sect-t">Ações propostas</div>' +
            '<table><thead><tr><th>Ticker</th><th>Empresa</th><th>Setor</th><th class="num">Peso</th><th class="num">Valor</th><th class="num">Preço-alvo</th><th class="num">Ret. esp.</th><th>Rating</th><th>Proteção</th></tr></thead><tbody>' +
            rowsHtml +
            "</tbody></table>" +
            '<div class="sect-t">Distribuição setorial</div>' +
            secHtml +
            flowHtml +
            "</div>" +
            '<div class="disc">Material de apoio comercial. Não constitui recomendação de investimento nem oferta de compra ou venda de ativos. Preços-alvo e retornos esperados são estimativas sujeitas a alteração e não garantem resultados futuros. Operação sujeita à análise de perfil (suitability) e às condições de cada produto. Elaborado no Hub do Assessor.</div>' +
            "</div>";

          function rvSan(s) {
            return (
              String(s || "cliente")
                .replace(/[^a-zA-Z0-9]+/g, "_")
                .replace(/^_+|_+$/g, "") || "cliente"
            );
          }
          var filename = "Proposta_RV_" + rvSan(state.cliente) + ".pdf";
          var fullHtml =
            '<!doctype html><html><head><meta charset="utf-8"><title>Proposta RV</title></head><body style="margin:0;background:#fff">' +
            inner +
            "<scr" +
            "ipt>setTimeout(function(){window.print();},350);</scr" +
            "ipt></body></html>";
          function fallback() {
            try {
              var w = window.open("", "_blank");
              if (w) {
                w.document.open();
                w.document.write(fullHtml);
                w.document.close();
              } else if (typeof showToast === "function") {
                showToast("Permita pop-ups para gerar a proposta em PDF");
              }
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
                cont.innerHTML = inner;
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
        } catch (e) {
          try {
            if (typeof showToast === "function")
              showToast("Não foi possível gerar a proposta RV.");
          } catch (_) {}
          try {
            console.error(e);
          } catch (__) {}
        }
      };
      window.__rvRender = render;
      // primeira renderização
      if (typeof window.__rvRender === "function") {
        window.__rvRender();
      }
    })();
  };
})();
