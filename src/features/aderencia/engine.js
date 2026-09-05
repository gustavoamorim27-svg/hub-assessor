// Migrated from Hub v1. Review domain assumptions separately from interface changes.

(function () {
  var _done = false;
  window._toolInit = window._toolInit || {};
  window._toolInit["aderencia"] = function () {
    if (_done) return;
    _done = true;
    init();
  };

  // Mapeamento classe XP -> categoria interna (Construtor/Simulador)
  var CLASS_MAP = {
    Ações: "Renda Variável",
    "Produtos Estruturados": "Renda Variável",
    COE: "Renda Fixa",
    Aluguel: "Renda Variável",
    "Renda Fixa": "Renda Fixa",
    "Previdência Privada": "Previdência",
    "Tesouro Direto": "Renda Fixa",
    "Fundos de Investimento": "Multimercados",
    "Carteira Administrada": "Multimercados",
    "Fundos Imobiliários": "Fundos Listados",
    Internacional: "Internacional",
    "Conta Internacional": "Internacional",
  };
  var TOPLEVEL = Object.keys(CLASS_MAP);

  /* Categoria interna de um ativo. COE entra como Renda Fixa, salvo se o nome
     mencionar "Ouro" ou "Bolsa Americana" (esses ficam em Renda Variável). */
  var COE_OURO_RE = /ouro/i;
  var COE_BOLSA_RE = /bolsa\s*americana/i;
  function categoriaDoAtivo(classeXP, nome) {
    if (classeXP === "COE") {
      var n = String(nome || "");
      if (COE_OURO_RE.test(n)) return "Alternativos"; // COE de Ouro → Alternativos
      if (COE_BOLSA_RE.test(n)) return "Renda Variável"; // COE de Bolsa Americana → Renda Variável
      return "Renda Fixa"; // demais COEs → Renda Fixa
    }
    return CLASS_MAP[classeXP] || "Multimercados";
  }
  var CAT_ORDER = [
    "Renda Fixa",
    "Previdência",
    "Multimercados",
    "Renda Variável",
    "Fundos Listados",
    "Alternativos",
    "Internacional",
  ];
  var CAT_COLOR = {
    "Renda Fixa": "#3DD68C",
    Previdência: "#E8709B",
    Multimercados: "#7C8CFF",
    "Renda Variável": "#F26522",
    "Fundos Listados": "#FFB020",
    Alternativos: "#C77DFF",
    Internacional: "#36C5F0",
  };
  var PROFILES = {
    Conservadora: {
      "Renda Fixa": 90,
      Previdência: 0,
      Multimercados: 2.5,
      "Renda Variável": 0,
      "Fundos Listados": 2.5,
      Alternativos: 0,
      Internacional: 5,
    },
    Moderada: {
      "Renda Fixa": 68,
      Previdência: 0,
      Multimercados: 14,
      "Renda Variável": 5,
      "Fundos Listados": 4,
      Alternativos: 3,
      Internacional: 6,
    },
    Sofisticada: {
      "Renda Fixa": 51,
      Previdência: 0,
      Multimercados: 10,
      "Renda Variável": 15,
      "Fundos Listados": 9.5,
      Alternativos: 7,
      Internacional: 7.5,
    },
  };
  var adProfile = "Moderada";

  var parsed = null; // resultado do último parse

  function brlToNum(s) {
    if (s == null) return null;
    s = String(s).replace(/R\$/g, "").trim();
    // formato pt-BR: 1.234,56
    s = s.replace(/\./g, "").replace(",", ".");
    var n = parseFloat(s);
    return isNaN(n) ? null : n;
  }
  function fmtPct(n) {
    var v = Math.round(n * 10) / 10;
    return (Number.isInteger(v) ? v.toFixed(0) : v.toFixed(1)).replace(
      ".",
      ",",
    );
  }
  function fmtBRL(n) {
    return "R$ " + Math.round(n).toLocaleString("pt-BR");
  }

  function parseWorkbook(wb) {
    var sheetName = wb.SheetNames[0];
    var ws = wb.Sheets[sheetName];
    // converte para matriz de linhas
    var rows = XLSX.utils.sheet_to_json(ws, {
      header: 1,
      raw: true,
      defval: null,
    });
    var conta = null,
      patrim = null;
    // R1: procura "Conta: NNN"
    if (rows[0]) {
      rows[0].forEach(function (v) {
        if (v && /Conta/i.test(String(v))) {
          var m = String(v).match(/(\d+)/);
          if (m) conta = m[1];
        }
      });
    }
    // R4 (índice 3): patrimônio na col 0
    if (rows[3] && rows[3][0] != null) {
      patrim =
        typeof rows[3][0] === "number" ? rows[3][0] : brlToNum(rows[3][0]);
    }

    var SKIP_SUB = ["Proventos", "Saldo projetado"];
    var STRUCT_RE =
      /(collar|fence|rubi|smart|call spread|autocall|booster|capped)/i;

    // classes de topo: valor R$ por classe (compatibilidade com o resto da ferramenta)
    var classes = {}; // nome XP -> valor R$
    rows.forEach(function (r) {
      if (!r || r[0] == null) return;
      var c0 = String(r[0]);
      var m = c0.match(/^\s*([\d.,]+)%\|(.+)/);
      if (!m) return;
      var name = m[2].trim();
      if (TOPLEVEL.indexOf(name) === -1) return;
      var val = null;
      for (var c = 6; c <= 11; c++) {
        var cv = r[c];
        if (cv == null) continue;
        if (typeof cv === "number") {
          val = cv;
        } else if (/R\$/.test(String(cv)) && !/Financeiro/i.test(String(cv))) {
          val = brlToNum(cv);
        }
      }
      if (val != null && val > 0) {
        classes[name] = (classes[name] || 0) + val;
      }
    });

    // ===== Extração ATIVO POR ATIVO =====
    var ativos = []; // {name, valor, classeXP, subcat}
    var curClass = null,
      curSub = null;
    function isHeader(cell) {
      return cell != null && /^\s*[\d.,]+%\|/.test(String(cell));
    }
    function moneyCell(cv) {
      if (cv == null) return null;
      if (typeof cv === "number") return cv;
      var s = String(cv);
      if (/Financeiro/i.test(s)) return null;
      if (!/R\$|\d/.test(s)) return null;
      return brlToNum(s);
    }
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      if (!r) continue;
      var c0 = r[0];
      if (c0 == null) continue;
      var s0 = String(c0);
      var mh = s0.match(/^\s*([\d.,]+)%\|(.+)/);
      if (mh) {
        var hname = mh[2].trim();
        if (TOPLEVEL.indexOf(hname) !== -1) {
          curClass = hname;
          curSub = null;
          continue;
        }
        if (SKIP_SUB.indexOf(hname) !== -1) {
          curClass = "__SKIP__";
          curSub = null;
          continue;
        }
        // sub-header: ou é categoria (Pós-Fixada) ou é uma operação estruturada (Collar UI - X)
        if (curClass === "Produtos Estruturados" || STRUCT_RE.test(hname)) {
          // a operação é o próprio ativo: soma 'Financeiro (R$)' nas linhas seguintes
          var finCol = null;
          for (var c = 6; c <= 11; c++) {
            if (r[c] != null && /Financeiro/i.test(String(r[c]))) finCol = c;
          }
          var jj = i + 1,
            sval = 0;
          while (jj < rows.length) {
            var nr = rows[jj];
            var nc0 = nr ? nr[0] : null;
            if (isHeader(nc0)) break;
            if (nc0 === "Ativo") {
              jj++;
              continue;
            }
            if (finCol != null && nr) {
              var fv = brlToNum(nr[finCol]);
              if (fv) sval += fv;
            }
            jj++;
          }
          ativos.push({
            name: hname,
            valor: sval,
            classeXP: curClass || "Produtos Estruturados",
            subcat: "Operação estruturada",
          });
          i = jj - 1;
          continue;
        } else {
          curSub = hname;
          continue;
        }
      }
      if (s0 === "Ativo") continue; // linha de cabeçalho de colunas
      // linha de item sob curClass/curSub
      if (curClass && curClass !== "__SKIP__") {
        var val = null;
        if (curClass === "Ações") {
          var qtd = moneyCell(r[7]);
          var price = moneyCell(r[10]); // Qtd. Total (idx7), Última Cotação (idx10)
          if (qtd && price) val = qtd * price;
        } else {
          for (var c2 = 10; c2 >= 6; c2--) {
            var mv = moneyCell(r[c2]);
            if (mv && mv > 0.5) {
              val = mv;
              break;
            }
          }
        }
        if (val && val > 0.5) {
          ativos.push({
            name: s0.slice(0, 60),
            valor: val,
            classeXP: curClass,
            subcat: curSub || "",
          });
        }
      }
    }

    // total a partir dos ativos extraídos (mais fiel que somar headers)
    var totalAtivos = ativos.reduce(function (s, a) {
      return s + a.valor;
    }, 0);

    // total das classes (soma dos R$ por classe de topo)
    var totalClass = 0;
    Object.keys(classes).forEach(function (k) {
      totalClass += classes[k];
    });

    // adiciona categoria interna + % a cada ativo (COE respeita a regra de nome)
    var baseTotal = totalAtivos > 0 ? totalAtivos : totalClass;
    ativos.forEach(function (a) {
      a.categoria = categoriaDoAtivo(a.classeXP, a.name);
      a.pct = baseTotal > 0 ? (a.valor / baseTotal) * 100 : 0;
    });

    // composição por categoria: deriva dos ATIVOS individuais quando disponíveis
    // (assim o split do COE entre Renda Fixa e Renda Variável é refletido corretamente)
    var comp = {};
    if (totalAtivos > 0) {
      var catv = {};
      ativos.forEach(function (a) {
        catv[a.categoria] = (catv[a.categoria] || 0) + a.valor;
      });
      CAT_ORDER.forEach(function (cat) {
        comp[cat] = catv[cat] ? (catv[cat] / totalAtivos) * 100 : 0;
      });
    } else {
      var cats = {};
      var totalClass2 = 0;
      Object.keys(classes).forEach(function (k) {
        totalClass2 += classes[k];
      });
      Object.keys(classes).forEach(function (k) {
        var cat = CLASS_MAP[k] || "Multimercados";
        cats[cat] = (cats[cat] || 0) + classes[k];
      });
      CAT_ORDER.forEach(function (cat) {
        comp[cat] =
          totalClass2 > 0 ? ((cats[cat] || 0) / totalClass2) * 100 : 0;
      });
    }

    return {
      conta: conta,
      patrimonio: patrim,
      totalClasses: totalClass,
      classesRaw: classes,
      comp: comp,
      ativos: ativos,
      totalAtivos: totalAtivos,
    };
  }

  // aderência: 100 - (soma |dif| / 2)
  function calcAderencia(atual, rec) {
    var soma = 0;
    CAT_ORDER.forEach(function (cat) {
      soma += Math.abs((atual[cat] || 0) - (rec[cat] || 0));
    });
    return Math.max(0, 100 - soma / 2);
  }

  function recColor(score) {
    if (score >= 75) return "#3DD68C";
    if (score >= 50) return "#FFB020";
    return "#FF6B6B";
  }
  function recLabel(score) {
    if (score >= 75) return "Alta aderência";
    if (score >= 50) return "Aderência moderada";
    return "Baixa aderência";
  }

  function recomendadaComp() {
    // pega do bridge (Construtor). Se vazio, retorna null.
    var c = window.RICO_BRIDGE && window.RICO_BRIDGE.carteira;
    if (!c || !Array.isArray(c.itens) || !c.itens.length) return null;
    var cats = {};
    var total = 0;
    c.itens.forEach(function (it) {
      var cat = it.classe; // já está nas categorias internas
      cats[cat] = (cats[cat] || 0) + (Number(it.pct) || 0);
      total += Number(it.pct) || 0;
    });
    var comp = {};
    CAT_ORDER.forEach(function (cat) {
      comp[cat] = total > 0 ? ((cats[cat] || 0) / total) * 100 : 0;
    });
    return { comp: comp, template: c.template, cliente: c.cliente };
  }

  function barRows(comp, colorByCat) {
    var h = "";
    CAT_ORDER.forEach(function (cat) {
      var pct = comp[cat] || 0;
      if (pct < 0.05) return;
      var col = CAT_COLOR[cat];
      h +=
        '<div class="ad-bar-row">' +
        '<div class="ad-bar-top"><span class="ad-bar-name">' +
        (window.__hubClassLabel ? window.__hubClassLabel(cat) : cat) +
        "</span>" +
        '<span class="ad-bar-pct" style="color:' +
        col +
        '">' +
        fmtPct(pct) +
        "%</span></div>" +
        '<div class="ad-bar-track"><div class="ad-bar-fill" style="width:' +
        Math.min(100, pct) +
        "%;background:" +
        col +
        '"></div></div>' +
        "</div>";
    });
    return h;
  }

  function renderProfiles(atual) {
    var box = document.getElementById("adProfiles");
    if (!box) return;
    var names = ["Conservadora", "Moderada", "Sofisticada"];
    var scores = names.map(function (nm) {
      return calcAderencia(atual, PROFILES[nm]);
    });
    var best = 0;
    for (var i = 1; i < scores.length; i++) {
      if (scores[i] > scores[best]) best = i;
    }
    var html =
      '<span style="font-size:12.5px;color:#9AA2D0;font-weight:700">Comparar com:</span>';
    names.forEach(function (nm, i) {
      var sel = nm === adProfile;
      var col = recColor(scores[i]);
      html +=
        '<button data-prof="' +
        nm +
        '" style="cursor:pointer;font-family:inherit;border-radius:10px;padding:8px 14px;font-weight:700;font-size:13px;' +
        "border:1px solid " +
        (sel ? "#FF8B52" : "rgba(120,130,210,.25)") +
        ";" +
        "background:" +
        (sel ? "rgba(242,101,34,.16)" : "rgba(255,255,255,.04)") +
        ";color:" +
        (sel ? "#fff" : "#cfd4ef") +
        '">' +
        nm +
        ' <span style="color:' +
        col +
        ';font-weight:800">' +
        fmtPct(scores[i]) +
        "%</span>" +
        (i === best
          ? ' <span style="font-size:11px;color:#3DD68C;font-weight:800" title="Maior aderência">★</span>'
          : "") +
        "</button>";
    });
    box.innerHTML = html;
    box.querySelectorAll("[data-prof]").forEach(function (b) {
      b.onclick = function () {
        adProfile = b.getAttribute("data-prof");
        renderResult();
      };
    });
  }
  function renderResult() {
    if (!parsed) return;
    var atual = parsed.comp;
    var rec = { comp: PROFILES[adProfile], template: adProfile };

    document.getElementById("adResult").style.display = "block";
    renderProfiles(atual);

    // coluna atual
    document.getElementById("adAtual").innerHTML = barRows(atual);

    // coluna recomendada
    var recEl = document.getElementById("adRecomendada");
    if (rec) {
      recEl.innerHTML = barRows(rec.comp);
    } else {
      recEl.innerHTML =
        '<div style="color:#9AA2D0;font-size:13.5px;line-height:1.6;padding:8px 0">' +
        'Monte uma carteira no <b style="color:#FF8B52">Montar a Carteira</b> para comparar a aderência. ' +
        "A carteira recomendada aparece aqui automaticamente.</div>";
    }

    // score card
    var scoreEl = document.getElementById("adScoreCard");
    if (rec) {
      var score = calcAderencia(atual, rec.comp);
      var col = recColor(score);
      scoreEl.innerHTML =
        '<div style="display:flex;align-items:center;gap:28px;flex-wrap:wrap">' +
        '<div style="position:relative;width:128px;height:128px;flex-shrink:0">' +
        donutSVG(score, col) +
        '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">' +
        '<div style="font-family:Sora;font-weight:800;font-size:30px;color:' +
        col +
        '">' +
        fmtPct(score) +
        "%</div>" +
        '<div style="font-size:10px;color:#9AA2D0;font-weight:700;letter-spacing:.5px;text-transform:uppercase">aderência</div>' +
        "</div>" +
        "</div>" +
        '<div style="flex:1;min-width:240px">' +
        '<div style="font-family:Sora;font-weight:800;font-size:22px;color:' +
        col +
        ';margin-bottom:6px">' +
        recLabel(score) +
        "</div>" +
        '<div style="color:#cfd4ef;font-size:14px;line-height:1.6">' +
        "A carteira atual do cliente está <b>" +
        fmtPct(score) +
        "%</b> alinhada à carteira " +
        (rec.template ? "<b>" + rec.template + "</b> " : "") +
        "recomendada. " +
        "Quanto maior a aderência, menos ajustes são necessários para chegar à alocação ideal." +
        "</div>" +
        gapInsight(atual, rec.comp) +
        "</div>" +
        "</div>";
    } else {
      scoreEl.innerHTML =
        '<div style="display:flex;align-items:center;gap:14px">' +
        '<svg viewBox="0 0 24 24" style="width:26px;height:26px;stroke:#FFB020;fill:none;stroke-width:2;flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' +
        '<div style="font-size:14.5px;color:#cfd4ef;line-height:1.5">Posição do cliente carregada. Monte a carteira recomendada no <b style="color:#FF8B52">Construtor</b> para ver o score de aderência.</div>' +
        "</div>";
    }

    renderActions();
  }

  function gapInsight(atual, rec) {
    // maior gap por categoria
    var maxCat = null,
      maxGap = 0,
      dir = "";
    CAT_ORDER.forEach(function (cat) {
      var g = (rec[cat] || 0) - (atual[cat] || 0);
      if (Math.abs(g) > Math.abs(maxGap)) {
        maxGap = g;
        maxCat = cat;
      }
    });
    if (!maxCat || Math.abs(maxGap) < 1) return "";
    var verbo = maxGap > 0 ? "aumentar" : "reduzir";
    return (
      '<div style="margin-top:12px;font-size:13px;color:#9AA2D0">' +
      'Maior ajuste sugerido: <b style="color:' +
      CAT_COLOR[maxCat] +
      '">' +
      verbo +
      " " +
      (window.__hubClassLabel ? window.__hubClassLabel(maxCat) : maxCat) +
      "</b> em " +
      fmtPct(Math.abs(maxGap)) +
      " p.p.</div>"
    );
  }

  function donutSVG(score, col) {
    var r = 54,
      cx = 64,
      cy = 64,
      circ = 2 * Math.PI * r;
    var off = circ * (1 - Math.min(100, score) / 100);
    return (
      '<svg viewBox="0 0 128 128" style="width:128px;height:128px;transform:rotate(-90deg)">' +
      '<circle cx="' +
      cx +
      '" cy="' +
      cy +
      '" r="' +
      r +
      '" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="12"/>' +
      '<circle cx="' +
      cx +
      '" cy="' +
      cy +
      '" r="' +
      r +
      '" fill="none" stroke="' +
      col +
      '" stroke-width="12" stroke-linecap="round" ' +
      'stroke-dasharray="' +
      circ +
      '" stroke-dashoffset="' +
      off +
      '"/>' +
      "</svg>"
    );
  }

  function renderActions() {
    var el = document.getElementById("adActions");
    var nome = parsed.conta ? "Conta " + parsed.conta : "Cliente";
    var pat = parsed.patrimonio;
    var h = "";
    // Botão: preencher Construtor
    h +=
      '<button class="ad-act-btn" id="adFillConstrutor"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> Preencher Construtor (nome + patrimônio)</button>';
    // Botão: preencher Simulador (valor + nome + composição)
    h +=
      '<button class="ad-act-btn" id="adFillSimulador"><svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> Preencher Simulador (valor + composição)</button>';
    el.innerHTML = h;

    document.getElementById("adFillConstrutor").onclick = function () {
      ensureToolReady(
        "construtor",
        "__fillConstrutorFromAderencia",
        function (fn) {
          fn({ conta: parsed.conta, patrimonio: pat });
          markDone("adFillConstrutor", "Construtor preenchido ✓");
        },
      );
    };
    document.getElementById("adFillSimulador").onclick = function () {
      ensureToolReady(
        "simulador",
        "__fillSimuladorFromAderencia",
        function (fn) {
          fn({ conta: parsed.conta, patrimonio: pat, comp: parsed.comp });
          markDone("adFillSimulador", "Simulador preenchido ✓");
        },
      );
    };
  }

  /* Garante que o IIFE da ferramenta-alvo já rodou (init preguiçoso) antes de
     chamar a função de preenchimento. Se ainda não rodou, dispara o init e
     aguarda dois frames para o DOM/handlers ficarem prontos. */
  function ensureToolReady(toolId, fnName, cb) {
    function tryCall() {
      var fn = window[fnName];
      if (typeof fn === "function") {
        cb(fn);
        return true;
      }
      return false;
    }
    if (tryCall()) return;
    // dispara o init preguiçoso da ferramenta
    var initFn = window._toolInit && window._toolInit[toolId];
    if (typeof initFn === "function") {
      try {
        initFn();
      } catch (e) {}
    }
    // aguarda o DOM/handlers ficarem prontos
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (!tryCall()) {
          // última tentativa após pequeno atraso
          setTimeout(function () {
            tryCall();
          }, 60);
        }
      });
    });
  }

  function markDone(id, txt) {
    var b = document.getElementById(id);
    if (b) {
      b.classList.add("done");
      b.innerHTML =
        '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> ' +
        txt;
    }
  }

  function handleFile(file, onDone) {
    var status = document.getElementById("adStatus");
    if (!file) {
      return;
    }
    if (!/\.xls[xm]?$/i.test(file.name)) {
      status.className = "ad-up-status err";
      status.textContent =
        "Formato inválido — envie um arquivo .xlsx exportado do Hub XP.";
      return;
    }
    if (typeof XLSX === "undefined") {
      status.className = "ad-up-status err";
      status.textContent =
        "Biblioteca de leitura ainda carregando — tente novamente em alguns segundos.";
      return;
    }
    status.className = "ad-up-status";
    status.style.color = "#9AA2D0";
    status.textContent = "Lendo " + file.name + "...";
    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var data = new Uint8Array(e.target.result);
        var wb = XLSX.read(data, { type: "array" });
        parsed = parseWorkbook(wb);
        if (!parsed.totalClasses) {
          status.className = "ad-up-status err";
          status.textContent =
            "Não encontrei classes de ativos neste arquivo. Verifique se é a Posição Consolidada do Hub XP.";
          return;
        }
        status.className = "ad-up-status ok";
        status.textContent =
          "Posição carregada · Conta " +
          (parsed.conta || "—") +
          " · " +
          fmtBRL(parsed.patrimonio || parsed.totalClasses);
        // publica a posição atual na ponte para o Construtor criar a aba "Atual"
        try {
          window.RICO_BRIDGE = window.RICO_BRIDGE || {};
          window.RICO_BRIDGE.posicaoAtual = {
            conta: parsed.conta,
            patrimonio: parsed.patrimonio || parsed.totalClasses,
            comp: parsed.comp,
            classesRaw: parsed.classesRaw,
            ativos: parsed.ativos || [],
            atualizadoEm: Date.now(),
          };
          if (typeof window.__setPosicaoAtual === "function") {
            window.__setPosicaoAtual(window.RICO_BRIDGE.posicaoAtual);
          } else {
            // dispara o init preguiçoso do construtor para registrar o handler
            var ci = window._toolInit && window._toolInit["construtor"];
            if (typeof ci === "function") {
              try {
                ci();
              } catch (e) {}
            }
            requestAnimationFrame(function () {
              if (typeof window.__setPosicaoAtual === "function")
                window.__setPosicaoAtual(window.RICO_BRIDGE.posicaoAtual);
            });
          }
        } catch (e) {}
        renderResult();
        if (typeof onDone === "function") {
          try {
            onDone(parsed);
          } catch (e) {}
        } else {
          document
            .getElementById("adResult")
            .scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      } catch (err) {
        status.className = "ad-up-status err";
        status.textContent =
          "Erro ao ler o arquivo: " + (err && err.message ? err.message : err);
      }
    };
    reader.onerror = function () {
      status.className = "ad-up-status err";
      status.textContent = "Falha ao ler o arquivo.";
    };
    reader.readAsArrayBuffer(file);
  }

  window.RICO_importPosicaoFile = function (file, cb) {
    try {
      handleFile(file, cb);
    } catch (e) {
      console.error(e);
    }
  };
  window.RICO_removerPosicao = function () {
    parsed = null;
    try {
      if (window.RICO_BRIDGE) window.RICO_BRIDGE.posicaoAtual = null;
    } catch (e) {}
    var res = document.getElementById("adResult");
    if (res) res.style.display = "none";
    var st = document.getElementById("adStatus");
    if (st) {
      st.className = "ad-up-status";
      st.textContent = "";
    }
    var fi = document.getElementById("adFile");
    if (fi) {
      try {
        fi.value = "";
      } catch (e) {}
    }
    try {
      if (typeof window.__setPosicaoAtual === "function")
        window.__setPosicaoAtual(null);
    } catch (e) {}
    try {
      if (window._ajRender) window._ajRender();
    } catch (e) {}
  };

  function init() {
    var drop = document.getElementById("adDrop");
    var fileInput = document.getElementById("adFile");
    var pick = document.getElementById("adPick");
    if (!drop) return;
    var rem = document.getElementById("adRemove");
    if (rem)
      rem.onclick = function () {
        window.RICO_removerPosicao();
      };
    pick.onclick = function () {
      fileInput.click();
    };
    drop.onclick = function (e) {
      if (
        e.target === drop ||
        e.target.classList.contains("ad-up-title") ||
        e.target.classList.contains("ad-up-desc") ||
        e.target.classList.contains("ad-up-icon")
      )
        fileInput.click();
    };
    fileInput.onchange = function () {
      if (fileInput.files[0]) handleFile(fileInput.files[0]);
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
        handleFile(e.dataTransfer.files[0]);
    };
  }
})();
