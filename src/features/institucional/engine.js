(function () {
  "use strict";

  var initialized = false;
  var state = {
    model: "Moderada",
    parsed: null,
    fileName: "",
    report: null,
    classFilter: "Todas",
    libraryQuery: "",
  };
  var rowSequence = 0;
  var dragged = null;
  var CLASS_ORDER = [
    "Renda Fixa",
    "Previdência",
    "Multimercados",
    "Fundo Aberto",
    "Renda Variável",
    "Fundos Listados",
    "Fundos Cetipados",
    "Alternativos",
    "Internacional",
    "Outros",
  ];
  var COLORS = {
    "Renda Fixa": "#3DD68C",
    Previdência: "#E8709B",
    Multimercados: "#7C8CFF",
    "Fundo Aberto": "#5AC8A8",
    "Renda Variável": "#F26522",
    "Fundos Listados": "#FFB020",
    "Fundos Cetipados": "#FFB020",
    Alternativos: "#C77DFF",
    Internacional: "#36C5F0",
  };

  window._toolInit = window._toolInit || {};
  window._toolInit.institucional = function () {
    if (initialized) {
      renderTarget();
      return;
    }
    initialized = true;
    bind();
    renderTarget();
  };

  function byId(id) {
    return document.getElementById(id);
  }
  function uid() {
    rowSequence += 1;
    return "inst-" + rowSequence;
  }
  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function norm(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }
  function category(value) {
    return value || "Outros";
  }
  function classLabel(value) {
    return value === "Fundos Listados" ? "Fundos Imobiliários" : value;
  }
  function categoryKey(value) {
    value = category(value);
    return value === "Fundos Listados" || value === "Fundos Cetipados"
      ? "Fundos Imobiliários"
      : value;
  }
  function fmtPct(value) {
    var n = Math.round((Number(value) || 0) * 10) / 10;
    return n.toLocaleString("pt-BR", { minimumFractionDigits: n % 1 ? 1 : 0, maximumFractionDigits: 1 }) + "%";
  }
  function fmtBRL(value) {
    return (Number(value) || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    });
  }
  function canon(name) {
    var n = norm(name);
    var ticker = n.match(/\b[a-z]{4}\d{1,2}\b/);
    if (ticker) return "ticker:" + ticker[0];
    if (/\bntn b\b|tesouro ipca|ipca 20\d\d/.test(n)) return "rf:ntnb";
    if (/\bltn\b|tesouro prefix/.test(n)) return "rf:ltn";
    if (/\blcd\b/.test(n)) return "rf:lcd";
    if (/ace.*multicenario/.test(n)) return "mm:ace";
    if (/wellington.*global.*quality/.test(n)) return "int:wellington";
    if (/xp.*global.*aco|renda variavel global/.test(n)) return "int:acoes";
    if (/certificate of deposit|\bcd de|renda fixa global/.test(n)) return "int:rf";
    if (/ouro.*retorno|ouro.*otimiz/.test(n)) return "alt:ouro";
    if (/bova11/.test(n)) return "rv:bova11";
    if (/jhsf.*capital.*mall/.test(n)) return "cetip:jhsf";
    if (/caixa|tesouro selic|cdb.*liquidez/.test(n)) return "rf:caixa";
    var stop = /^(fundo|fundos|fic|fim|rl|fif|de|da|do|em|e|sa|s a|brasil|xp)$/;
    var tokens = n.split(/\s+/).filter(function (token) {
      return token.length > 2 && !stop.test(token);
    });
    return "name:" + tokens.slice(0, 5).join("-");
  }
  function modelItems() {
    var factory = window.RICO_TEMPLATES && window.RICO_TEMPLATES[state.model];
    if (typeof factory !== "function") return [];
    return factory().map(function (item) {
      return {
        nome: item.nome || "Ativo recomendado",
        classe:
          item.classe === "Fundos Listados"
            ? "Fundos Cetipados"
            : category(item.classe),
        pct: Number(item.pct) || 0,
        detalhe: item.detalhe || "",
        key: canon(item.nome),
      };
    });
  }
  function consolidate(items) {
    var map = new Map();
    items.forEach(function (item) {
      var key = categoryKey(item.classe) + "|" + (item.key || canon(item.nome));
      if (!map.has(key)) {
        map.set(key, {
          key: key,
          nome: item.nome,
          classe: category(item.classe),
          pct: 0,
          valor: 0,
          detalhe: item.detalhe || "",
        });
      }
      var row = map.get(key);
      row.pct += Number(item.pct) || 0;
      row.valor += Number(item.valor) || 0;
    });
    return Array.from(map.values());
  }
  function currentItems() {
    var parsed = state.parsed;
    if (!parsed) return [];
    var total = Number(parsed.totalAtivos || parsed.patrimonio || parsed.totalClasses) || 0;
    if (Array.isArray(parsed.ativos) && parsed.ativos.length) {
      return consolidate(
        parsed.ativos.map(function (item) {
          var pct = Number(item.pct);
          if (!isFinite(pct) && total) pct = ((Number(item.valor) || 0) / total) * 100;
          return {
            nome: item.name || item.nome || "Ativo da posição",
            classe: category(item.categoria || item.classeXP),
            pct: pct || 0,
            valor: Number(item.valor) || 0,
            detalhe: item.subcat || item.detalhe || "",
            key: canon(item.name || item.nome),
          };
        }),
      );
    }
    return Object.keys(parsed.comp || {}).map(function (classe) {
      return {
        nome: category(classe),
        classe: category(classe),
        pct: Number(parsed.comp[classe]) || 0,
        valor: total * ((Number(parsed.comp[classe]) || 0) / 100),
        key: "categoria:" + categoryKey(classe),
      };
    });
  }
  function buildReport() {
    var target = consolidate(modelItems());
    var current = currentItems();
    var patrimonio = Number(
      state.parsed &&
        (state.parsed.patrimonio || state.parsed.totalAtivos || state.parsed.totalClasses),
    ) || current.reduce(function (sum, row) { return sum + row.valor; }, 0);
    var currentByKey = new Map(current.map(function (row) { return [row.key, Object.assign({}, row)]; }));
    var targetByKey = new Map(target.map(function (row) { return [row.key, row]; }));
    var keep = [], enter = [], exit = [];

    target.forEach(function (wanted) {
      var held = currentByKey.get(wanted.key);
      var currentPct = held ? Number(held.pct) || 0 : 0;
      var kept = Math.min(currentPct, wanted.pct);
      if (kept >= 0.05) {
        keep.push({
          id: uid(),
          nome: wanted.nome,
          classe: wanted.classe,
          pct: kept,
          valor: patrimonio * kept / 100,
          motivo: currentPct > wanted.pct + 0.05 ? "Manter até o peso-alvo" : "Já faz parte do modelo",
          sourceKey: held && held.key,
        });
      }
      if (wanted.pct - kept >= 0.05) {
        enter.push({
          id: uid(),
          nome: wanted.nome,
          classe: wanted.classe,
          pct: wanted.pct - kept,
          valor: patrimonio * (wanted.pct - kept) / 100,
          motivo: currentPct ? "Completar o peso-alvo" : "Incluir para aderir ao modelo",
          sourceKey: wanted.key,
        });
      }
      if (held) held.used = kept;
    });
    current.forEach(function (held) {
      var targetRow = targetByKey.get(held.key);
      var targetPct = targetRow ? targetRow.pct : 0;
      var excess = Math.max(0, held.pct - Math.min(held.pct, targetPct));
      if (excess < 0.05) return;
      exit.push({
        id: uid(),
        nome: held.nome,
        classe: held.classe,
        pct: excess,
        valor: patrimonio * excess / 100,
        motivo: targetRow ? "Reduzir ao peso-alvo" : "Fora da cesta institucional selecionada",
        sourceKey: held.key,
      });
    });
    var keepPct = keep.reduce(function (s, r) { return s + r.pct; }, 0);
    return {
      keep: keep,
      enter: enter,
      exit: exit,
      patrimonio: patrimonio,
      aderencia: Math.max(0, Math.min(100, keepPct)),
      conta: state.parsed.conta || "",
      model: state.model,
      generatedAt: new Date(),
    };
  }
  function renderTarget() {
    var box = byId("instTargetPreview");
    if (!box) return;
    var items = modelItems();
    box.innerHTML = items.length
      ? items.map(function (item) {
          return '<div class="inst-target-line"><span title="' + esc(item.nome) + '"><i style="display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:7px;background:' + (COLORS[item.classe] || "#8a93d8") + '"></i>' + esc(item.nome) + '</span><strong>' + fmtPct(item.pct) + "</strong></div>";
        }).join("")
      : '<div class="inst-empty-list">Modelo indisponível.</div>';
  }
  function sumPct(rows) {
    return rows.reduce(function (sum, row) { return sum + (Number(row.pct) || 0); }, 0);
  }
  function allPlanRows() {
    if (!state.report) return [];
    return state.report.keep.concat(state.report.exit, state.report.enter);
  }
  function locateRow(id) {
    if (!state.report) return null;
    for (var kind of ["keep", "exit", "enter"]) {
      var index = state.report[kind].findIndex(function (row) { return row.id === id; });
      if (index >= 0) return { kind: kind, index: index, row: state.report[kind][index] };
    }
    return null;
  }
  function moveRow(id, destination) {
    var found = locateRow(id);
    if (!found || found.kind === destination || !state.report[destination]) return;
    state.report[found.kind].splice(found.index, 1);
    found.row.motivo = destination === "keep" ? "Manter conforme ajuste do assessor" : destination === "exit" ? "Retirar ou reduzir conforme ajuste do assessor" : "Incluir ou aumentar conforme ajuste do assessor";
    state.report[destination].push(found.row);
    renderPlan(false);
  }
  function classOptions(selected) {
    return CLASS_ORDER.filter(function (name) { return name !== "Outros" || selected === "Outros"; }).map(function (name) {
      return '<option value="' + esc(name) + '"' + (name === selected ? " selected" : "") + '>' + esc(classLabel(name)) + "</option>";
    }).join("");
  }
  function rowHtml(row, kind) {
    row.valor = state.report.patrimonio * (Number(row.pct) || 0) / 100;
    return '<div class="inst-row" draggable="true" data-row-id="' + esc(row.id) + '">' +
      '<div class="inst-row-top"><span class="inst-row-name">' + esc(row.nome) + '</span><span class="inst-row-pct">' + fmtPct(row.pct) + '</span></div>' +
      '<div class="inst-row-meta"><span>' + esc(row.motivo) + '</span><span>' + fmtBRL(row.valor) + '</span></div>' +
      '<div class="inst-row-controls" data-html2canvas-ignore="true">' +
      '<select class="inst-row-select" data-move="' + esc(row.id) + '" aria-label="Destino de ' + esc(row.nome) + '">' +
      '<option value="keep"' + (kind === "keep" ? " selected" : "") + '>Manter</option><option value="exit"' + (kind === "exit" ? " selected" : "") + '>Sair</option><option value="enter"' + (kind === "enter" ? " selected" : "") + '>Entrar</option></select>' +
      '<select class="inst-row-select" data-row-class="' + esc(row.id) + '" aria-label="Classe de ' + esc(row.nome) + '">' + classOptions(row.classe) + '</select>' +
      '<input class="inst-row-input" data-row-pct="' + esc(row.id) + '" inputmode="decimal" value="' + String(Math.round((Number(row.pct) || 0) * 10) / 10).replace(".", ",") + '" aria-label="Percentual de ' + esc(row.nome) + '" />' +
      '<button class="inst-row-remove" data-row-remove="' + esc(row.id) + '" type="button" aria-label="Remover ' + esc(row.nome) + '">×</button></div></div>';
  }
  function listHtml(kind, rows, title) {
    var grouped = {};
    rows.forEach(function (row) {
      var classe = category(row.classe);
      (grouped[classe] = grouped[classe] || []).push(row);
    });
    var groups = CLASS_ORDER.concat(Object.keys(grouped).filter(function (name) { return CLASS_ORDER.indexOf(name) < 0; }));
    var body = groups.filter(function (name) { return grouped[name] && grouped[name].length; }).map(function (name) {
      return '<div class="inst-class-group"><div class="inst-class-head"><span><i style="background:' + (COLORS[name] || "#8a93d8") + '"></i>' + esc(classLabel(name)) + '</span><span>' + fmtPct(sumPct(grouped[name])) + '</span></div>' + grouped[name].map(function (row) { return rowHtml(row, kind); }).join("") + "</div>";
    }).join("");
    var visualKind = kind === "exit" ? "out" : kind === "enter" ? "in" : kind;
    return '<section class="inst-column ' + visualKind + '" data-destination="' + kind + '"><div class="inst-column-title"><span>' + title + '</span><b>' + rows.length + '</b></div>' + (body || '<div class="inst-empty-list">Arraste ativos para esta coluna.</div>') + "</section>";
  }
  function totalsByClass(items) {
    var totals = {};
    items.forEach(function (item) {
      var classe = category(item.classe);
      totals[classe] = (totals[classe] || 0) + (Number(item.pct) || 0);
    });
    return totals;
  }
  function renderAllocation() {
    var current = totalsByClass(currentItems());
    var proposal = totalsByClass(state.report.keep.concat(state.report.enter));
    var target = totalsByClass(modelItems());
    var names = CLASS_ORDER.filter(function (name) { return (current[name] || proposal[name] || target[name]); });
    var proposalTotal = sumPct(state.report.keep.concat(state.report.enter));
    var html = '<div class="inst-allocation-head"><strong>Distribuição por classe</strong><span class="inst-total-alert">Proposta: ' + fmtPct(proposalTotal) + (Math.abs(proposalTotal - 100) >= 0.1 ? " · ajuste até 100%" : " · fechada") + '</span></div>' +
      '<div class="inst-allocation-row head"><span>Classe</span><span class="inst-allocation-val">Atual</span><span class="inst-allocation-val">Proposta</span><span class="inst-allocation-val">Modelo</span></div>';
    names.forEach(function (name) {
      var delta = (proposal[name] || 0) - (target[name] || 0);
      html += '<div class="inst-allocation-row"><span class="inst-allocation-name"><i class="inst-drawer-dot" style="background:' + (COLORS[name] || "#8a93d8") + '"></i>' + esc(classLabel(name)) + '</span><span class="inst-allocation-val">' + fmtPct(current[name] || 0) + '</span><span class="inst-allocation-val ' + (delta > .05 ? "neg" : delta < -.05 ? "neg" : "pos") + '">' + fmtPct(proposal[name] || 0) + '</span><span class="inst-allocation-val target">' + fmtPct(target[name] || 0) + "</span></div>";
    });
    byId("instAllocation").innerHTML = html;
  }
  function currentDrawerHtml() {
    return currentItems().map(function (item) {
      return '<div class="inst-drawer-asset"><i class="inst-drawer-dot" style="background:' + (COLORS[item.classe] || "#8a93d8") + '"></i><div class="inst-drawer-copy"><strong title="' + esc(item.nome) + '">' + esc(item.nome) + '</strong><span>' + esc(classLabel(item.classe)) + ' · ' + fmtPct(item.pct) + '</span></div><div class="inst-drawer-actions"><button class="inst-drawer-add keep" data-current-key="' + esc(item.key) + '" data-current-dest="keep">Manter</button><button class="inst-drawer-add" data-current-key="' + esc(item.key) + '" data-current-dest="exit">Sair</button></div></div>';
    }).join("");
  }
  function libraryItems() {
    var library = Array.isArray(window.__LIBDATA) ? window.__LIBDATA : [];
    var query = norm(state.libraryQuery);
    return library.filter(function (item) {
      var classe = category(item.classe);
      return (state.classFilter === "Todas" || classe === state.classFilter) && (!query || norm(item.nome + " " + item.detalhe + " " + classe).includes(query));
    }).slice(0, 80);
  }
  function renderLibraryDrawer() {
    var library = Array.isArray(window.__LIBDATA) ? window.__LIBDATA : [];
    var classes = CLASS_ORDER.filter(function (name) {
      return library.some(function (item) { return category(item.classe) === name; });
    });
    byId("instClassFilters").innerHTML = ["Todas"].concat(classes).map(function (name) {
      return '<button class="inst-class-chip' + (state.classFilter === name ? " on" : "") + '" data-lib-class="' + esc(name) + '">' + esc(classLabel(name)) + "</button>";
    }).join("");
    var items = libraryItems();
    byId("instLibraryDrawer").innerHTML = items.length ? items.map(function (item, index) {
      var classe = category(item.classe);
      return '<div class="inst-drawer-asset"><i class="inst-drawer-dot" style="background:' + (COLORS[classe] || "#8a93d8") + '"></i><div class="inst-drawer-copy"><strong title="' + esc(item.nome) + '">' + esc(item.nome) + '</strong><span>' + esc(classLabel(classe)) + '</span></div><button class="inst-drawer-add" data-lib-index="' + index + '">+ Entrar</button></div>';
    }).join("") : '<div class="inst-empty-list">Nenhum ativo encontrado.</div>';
    byId("instClassFilters").querySelectorAll("[data-lib-class]").forEach(function (button) {
      button.onclick = function () { state.classFilter = button.dataset.libClass; renderLibraryDrawer(); };
    });
    byId("instLibraryDrawer").querySelectorAll("[data-lib-index]").forEach(function (button) {
      button.onclick = function () {
        var item = libraryItems()[Number(button.dataset.libIndex)];
        if (!item) return;
        var sourceKey = categoryKey(item.classe) + "|" + canon(item.nome);
        var existing = state.report.enter.find(function (row) {
          return row.sourceKey === sourceKey && row.nome === item.nome;
        });
        if (existing) {
          existing.pct = Math.min(100, (Number(existing.pct) || 0) + 1);
          existing.motivo = "Aumentado pela gaveta de ativos";
        } else {
          state.report.enter.push({ id: uid(), nome: item.nome, classe: category(item.classe), pct: 1, valor: state.report.patrimonio / 100, motivo: "Incluído pela gaveta de ativos", sourceKey: sourceKey, manual: true });
        }
        renderPlan(false);
      };
    });
  }
  function moveCurrentAsset(key, destination) {
    var item = currentItems().find(function (row) { return row.key === key; });
    if (!item) return;
    ["keep", "exit", "enter"].forEach(function (kind) {
      state.report[kind] = state.report[kind].filter(function (row) { return row.sourceKey !== key; });
    });
    state.report[destination].push({ id: uid(), nome: item.nome, classe: item.classe, pct: item.pct, valor: state.report.patrimonio * item.pct / 100, motivo: destination === "keep" ? "Manter conforme ajuste do assessor" : "Retirar conforme ajuste do assessor", sourceKey: key });
    renderPlan(false);
  }
  function bindPlanControls() {
    byId("instColumns").querySelectorAll("[data-move]").forEach(function (select) {
      select.onchange = function () { moveRow(select.dataset.move, select.value); };
    });
    byId("instColumns").querySelectorAll("[data-row-class]").forEach(function (select) {
      select.onchange = function () { var found = locateRow(select.dataset.rowClass); if (found) { found.row.classe = select.value; renderPlan(false); } };
    });
    byId("instColumns").querySelectorAll("[data-row-pct]").forEach(function (input) {
      input.onchange = function () { var found = locateRow(input.dataset.rowPct); if (found) { var value = parseFloat(input.value.replace(",", ".")); found.row.pct = Math.max(0, Math.min(100, isFinite(value) ? value : 0)); renderPlan(false); } };
    });
    byId("instColumns").querySelectorAll("[data-row-remove]").forEach(function (button) {
      button.onclick = function () { var found = locateRow(button.dataset.rowRemove); if (found) { state.report[found.kind].splice(found.index, 1); renderPlan(false); } };
    });
    byId("instColumns").querySelectorAll("[data-row-id]").forEach(function (row) {
      row.ondragstart = function () { dragged = row.dataset.rowId; row.classList.add("dragging"); };
      row.ondragend = function () { dragged = null; row.classList.remove("dragging"); byId("instColumns").querySelectorAll(".drop").forEach(function (col) { col.classList.remove("drop"); }); };
    });
    byId("instColumns").querySelectorAll("[data-destination]").forEach(function (column) {
      column.ondragover = function (event) { if (dragged) { event.preventDefault(); column.classList.add("drop"); } };
      column.ondragleave = function () { column.classList.remove("drop"); };
      column.ondrop = function (event) { event.preventDefault(); column.classList.remove("drop"); if (dragged) moveRow(dragged, column.dataset.destination); };
    });
    byId("instCurrentDrawer").querySelectorAll("[data-current-key]").forEach(function (button) {
      button.onclick = function () { moveCurrentAsset(button.dataset.currentKey, button.dataset.currentDest); };
    });
  }
  function renderPlan(scroll) {
    var r = state.report;
    if (!r) return;
    byId("instResults").hidden = false;
    byId("instSummary").innerHTML =
      '<div class="inst-summary-card main"><small>Carteira analisada</small><strong>' + fmtBRL(r.patrimonio) + '</strong><span>' + (r.conta ? "Conta " + esc(r.conta) + " · " : "") + esc(state.fileName) + '</span></div>' +
      '<div class="inst-summary-card keep"><small>Manter</small><strong>' + fmtPct(sumPct(r.keep)) + '</strong><span>' + r.keep.length + ' ativo(s)</span></div>' +
      '<div class="inst-summary-card out"><small>Sair / reduzir</small><strong>' + fmtPct(sumPct(r.exit)) + '</strong><span>' + r.exit.length + ' movimento(s)</span></div>' +
      '<div class="inst-summary-card in"><small>Entrar / aumentar</small><strong>' + fmtPct(sumPct(r.enter)) + '</strong><span>' + r.enter.length + ' movimento(s)</span></div>';
    byId("instReportTitle").textContent = "Relatório · carteira " + r.model;
    byId("instReportMeta").textContent = (r.conta ? "Conta " + r.conta + " · " : "") + "Base estimada de " + fmtBRL(r.patrimonio) + " · " + r.generatedAt.toLocaleDateString("pt-BR");
    byId("instCurrentDrawer").innerHTML = currentDrawerHtml() || '<div class="inst-empty-list">Sem ativos importados.</div>';
    renderLibraryDrawer();
    renderAllocation();
    byId("instColumns").innerHTML = listHtml("keep", r.keep, "Manter") + listHtml("exit", r.exit, "Sair ou reduzir") + listHtml("enter", r.enter, "Entrar ou aumentar");
    bindPlanControls();
    if (scroll) byId("instResults").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function renderReport() {
    if (!state.parsed) return;
    state.report = buildReport();
    renderPlan(true);
  }
  function textReport() {
    var r = state.report;
    if (!r) return "";
    function block(title, rows) {
      return title + "\n" + (rows.length ? rows.map(function (x) {
        return "• " + x.nome + " — " + fmtPct(x.pct) + " (" + fmtBRL(x.valor) + ") — " + x.motivo;
      }).join("\n") : "• Nenhum movimento") + "\n";
    }
    return "COMPARATIVO INSTITUCIONAL — CARTEIRA " + r.model.toUpperCase() + "\n" +
      (r.conta ? "Conta: " + r.conta + "\n" : "") + "Patrimônio analisado: " + fmtBRL(r.patrimonio) + "\n\n" +
      block("MANTER", r.keep) + "\n" + block("SAIR / REDUZIR", r.exit) + "\n" + block("ENTRAR / AUMENTAR", r.enter) +
      "\nMaterial indicativo. Validar a edição institucional vigente, equivalências, liquidez, tributação e suitability.";
  }
  async function copyReport() {
    if (!state.report) return;
    try {
      await navigator.clipboard.writeText(textReport());
      if (window.showToast) window.showToast("Resumo copiado.");
    } catch (_) {
      if (window.showToast) window.showToast("Não foi possível copiar o resumo.");
    }
  }
  async function exportPdf() {
    if (!state.report || !window.html2canvas || !window.jspdf) return;
    var button = byId("instPdf");
    var original = button.textContent;
    button.disabled = true;
    button.textContent = "Gerando…";
    try {
      var canvas = await window.html2canvas(byId("instReport"), {
        backgroundColor: "#0b0f30",
        scale: Math.min(2, window.devicePixelRatio || 1.5),
        useCORS: true,
      });
      var jsPDF = window.jspdf.jsPDF;
      var pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      var pageW = pdf.internal.pageSize.getWidth(), pageH = pdf.internal.pageSize.getHeight();
      var margin = 8, imgW = pageW - margin * 2, imgH = canvas.height * imgW / canvas.width;
      var image = canvas.toDataURL("image/png", 0.96), y = margin, remaining = imgH;
      pdf.addImage(image, "PNG", margin, y, imgW, imgH);
      remaining -= pageH - margin * 2;
      while (remaining > 0) {
        pdf.addPage();
        y = margin - (imgH - remaining);
        pdf.addImage(image, "PNG", margin, y, imgW, imgH);
        remaining -= pageH - margin * 2;
      }
      pdf.save("comparativo-institucional-" + state.model.toLowerCase() + ".pdf");
    } catch (error) {
      console.error(error);
      if (window.showToast) window.showToast("Não foi possível gerar o PDF.");
    } finally {
      button.disabled = false;
      button.textContent = original;
    }
  }
  function handleFile(file) {
    var status = byId("instStatus");
    if (!file) return;
    if (!/\.xlsx?$/i.test(file.name)) {
      status.className = "inst-file-meta err";
      status.textContent = "Envie um arquivo .xlsx ou .xls.";
      return;
    }
    if (file.size > 20_000_000) {
      status.className = "inst-file-meta err";
      status.textContent = "O arquivo deve ter até 20 MB.";
      return;
    }
    status.className = "inst-file-meta";
    status.textContent = "Lendo " + file.name + "…";
    var reader = new FileReader();
    reader.onload = function (event) {
      try {
        if (!window.XLSX || !window.__hubPosicao) throw new Error("Leitor de Excel indisponível.");
        var workbook = XLSX.read(new Uint8Array(event.target.result), { type: "array" });
        var parsed = window.__hubPosicao.parse(workbook);
        if (!parsed || (!parsed.totalAtivos && !parsed.totalClasses)) throw new Error("Não encontrei ativos na planilha. Use a Posição Consolidada exportada do Hub XP.");
        state.parsed = parsed;
        state.fileName = file.name;
        status.textContent = "Posição carregada · " + (parsed.conta ? "Conta " + parsed.conta + " · " : "") + fmtBRL(parsed.patrimonio || parsed.totalAtivos || parsed.totalClasses);
        renderReport();
      } catch (error) {
        status.className = "inst-file-meta err";
        status.textContent = error.message || "Não foi possível ler o arquivo.";
      }
    };
    reader.onerror = function () {
      status.className = "inst-file-meta err";
      status.textContent = "Falha ao ler o arquivo.";
    };
    reader.readAsArrayBuffer(file);
  }
  function bind() {
    var input = byId("instFile"), drop = byId("instDrop");
    byId("instModels").querySelectorAll("[data-model]").forEach(function (button) {
      button.onclick = function () {
        state.model = button.dataset.model;
        byId("instModels").querySelectorAll("[data-model]").forEach(function (item) {
          item.classList.toggle("on", item === button);
        });
        renderTarget();
        if (state.parsed) renderReport();
      };
    });
    byId("instPick").onclick = function (event) { event.stopPropagation(); input.click(); };
    drop.onclick = function () { input.click(); };
    drop.onkeydown = function (event) {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); input.click(); }
    };
    ["dragenter", "dragover"].forEach(function (type) {
      drop.addEventListener(type, function (event) { event.preventDefault(); drop.classList.add("drag"); });
    });
    ["dragleave", "drop"].forEach(function (type) {
      drop.addEventListener(type, function (event) { event.preventDefault(); drop.classList.remove("drag"); });
    });
    drop.addEventListener("drop", function (event) { handleFile(event.dataTransfer.files[0]); });
    input.onchange = function () { handleFile(input.files[0]); };
    byId("instLibSearch").oninput = function (event) {
      state.libraryQuery = event.target.value;
      if (state.report) renderLibraryDrawer();
    };
    byId("instCopy").onclick = copyReport;
    byId("instPdf").onclick = exportPdf;
  }
  window.__institutionalPlanner = {
    load: function (parsed, fileName) {
      state.parsed = parsed;
      state.fileName = fileName || "posição-importada.xlsx";
      renderReport();
    },
    move: moveRow,
    snapshot: function () {
      if (!state.report) return null;
      return {
        keep: state.report.keep.map(function (row) { return Object.assign({}, row); }),
        exit: state.report.exit.map(function (row) { return Object.assign({}, row); }),
        enter: state.report.enter.map(function (row) { return Object.assign({}, row); }),
      };
    },
  };
})();
