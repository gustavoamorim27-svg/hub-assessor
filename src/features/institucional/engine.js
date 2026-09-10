(function () {
  "use strict";

  var initialized = false;
  var state = { model: "Moderada", parsed: null, fileName: "", report: null };
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
    return value === "Fundos Listados" ? "Fundos Cetipados" : value || "Outros";
  }
  function categoryKey(value) {
    return category(value);
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
        classe: category(item.classe),
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
          nome: wanted.nome,
          classe: wanted.classe,
          pct: kept,
          valor: patrimonio * kept / 100,
          motivo: currentPct > wanted.pct + 0.05 ? "Manter até o peso-alvo" : "Já faz parte do modelo",
        });
      }
      if (wanted.pct - kept >= 0.05) {
        enter.push({
          nome: wanted.nome,
          classe: wanted.classe,
          pct: wanted.pct - kept,
          valor: patrimonio * (wanted.pct - kept) / 100,
          motivo: currentPct ? "Completar o peso-alvo" : "Incluir para aderir ao modelo",
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
        nome: held.nome,
        classe: held.classe,
        pct: excess,
        valor: patrimonio * excess / 100,
        motivo: targetRow ? "Reduzir ao peso-alvo" : "Fora da cesta institucional selecionada",
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
  function listHtml(kind, rows, title) {
    return '<section class="inst-column ' + kind + '"><div class="inst-column-title"><span>' + title + '</span><b>' + rows.length + '</b></div>' +
      (rows.length
        ? rows.map(function (row) {
            return '<div class="inst-row"><div class="inst-row-top"><span class="inst-row-name">' + esc(row.nome) + '</span><span class="inst-row-pct">' + fmtPct(row.pct) + '</span></div><div class="inst-row-meta"><span>' + esc(row.motivo) + '</span><span>' + fmtBRL(row.valor) + '</span></div></div>';
          }).join("")
        : '<div class="inst-empty-list">Nenhum ativo nesta categoria.</div>') + "</section>";
  }
  function renderReport() {
    if (!state.parsed) return;
    state.report = buildReport();
    var r = state.report;
    byId("instResults").hidden = false;
    byId("instSummary").innerHTML =
      '<div class="inst-summary-card main"><small>Carteira analisada</small><strong>' + fmtBRL(r.patrimonio) + '</strong><span>' + (r.conta ? "Conta " + esc(r.conta) + " · " : "") + esc(state.fileName) + '</span></div>' +
      '<div class="inst-summary-card keep"><small>Manter</small><strong>' + fmtPct(r.keep.reduce(function(s,x){return s+x.pct;},0)) + '</strong><span>' + r.keep.length + ' ativo(s)</span></div>' +
      '<div class="inst-summary-card out"><small>Sair / reduzir</small><strong>' + fmtPct(r.exit.reduce(function(s,x){return s+x.pct;},0)) + '</strong><span>' + r.exit.length + ' movimento(s)</span></div>' +
      '<div class="inst-summary-card in"><small>Entrar / aumentar</small><strong>' + fmtPct(r.enter.reduce(function(s,x){return s+x.pct;},0)) + '</strong><span>' + r.enter.length + ' movimento(s)</span></div>';
    byId("instReportTitle").textContent = "Relatório · carteira " + r.model;
    byId("instReportMeta").textContent = (r.conta ? "Conta " + r.conta + " · " : "") + "Base estimada de " + fmtBRL(r.patrimonio) + " · " + r.generatedAt.toLocaleDateString("pt-BR");
    byId("instColumns").innerHTML =
      listHtml("keep", r.keep, "Manter") +
      listHtml("out", r.exit, "Sair ou reduzir") +
      listHtml("in", r.enter, "Entrar ou aumentar");
    byId("instResults").scrollIntoView({ behavior: "smooth", block: "start" });
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
    byId("instCopy").onclick = copyReport;
    byId("instPdf").onclick = exportPdf;
  }
})();
