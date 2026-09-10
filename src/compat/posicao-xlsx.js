/* Leitura da "Posicao Consolidada" exportada do Hub XP (xlsx), ativo por
   ativo, com a consolidacao de renda fixa que o assessor pediu: varios CDBs,
   LCAs, LCDs, LCIs, CRIs e CRAs viram uma linha por tipo, sem o nome do
   emissor. Portado do parser do Diagnostico para ser usado tambem em Montar a
   Carteira. Exposto em window.__hubPosicao. Precisa do XLSX (SheetJS) na
   pagina. */
(function () {
  "use strict";

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
  var SKIP_SUB = ["Proventos", "Saldo projetado"];
  var STRUCT_RE = /(collar|fence|rubi|smart|call spread|autocall|booster|capped)/i;
  var INTL_RE = /internacional|\b[A-Z]{2,5}\s+US\b|\bS&P\b|\bnasdaq\b|\bdólar|\bdolar/i;
  var FII_RE = /\bFII\b|\bFiagro\b|imobili[aá]rio/i;

  /* Tipos de renda fixa que viram uma linha so. A ordem importa: "LCD" antes
     de "LC" nao e problema porque os padroes exigem fronteira de palavra. */
  var TIPOS_RF = ["CDB", "LCA", "LCD", "LCI", "CRI", "CRA"];
  var TIPO_RE = new RegExp("^\\s*(" + TIPOS_RF.join("|") + ")\\b", "i");

  function brlToNum(s) {
    if (s == null) return null;
    if (typeof s === "number") return s;
    s = String(s).replace(/R\$/g, "").trim();
    s = s.replace(/\./g, "").replace(",", ".");
    var n = parseFloat(s);
    return isNaN(n) ? null : n;
  }
  function categoriaDoAtivo(classeXP, nome) {
    if (classeXP === "COE") {
      var n = String(nome || "");
      if (/ouro/i.test(n)) return "Alternativos";
      if (/bolsa\s*americana/i.test(n)) return "Renda Variável";
      return "Renda Fixa";
    }
    return CLASS_MAP[classeXP] || "Multimercados";
  }

  function parse(wb) {
    var ws = wb.Sheets[wb.SheetNames[0]];
    var rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: null });
    var conta = null, patrim = null;
    if (rows[0]) {
      rows[0].forEach(function (v) {
        if (v && /Conta/i.test(String(v))) {
          var m = String(v).match(/(\d+)/);
          if (m) conta = m[1];
        }
      });
    }
    if (rows[2] && rows[2][0] != null) patrim = brlToNum(rows[2][0]);
    if (patrim == null && rows[3] && rows[3][0] != null) patrim = brlToNum(rows[3][0]);

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

    /* saldo em conta: a linha "2,44%|Saldo projetado" traz o total (disponivel
       + lancamentos futuros) na coluna de valor; a tabela que vem depois e
       detalhe e continua ignorada */
    var saldo = null;
    function saldoDaLinha(r) {
      for (var c = 11; c >= 1; c--) {
        var v = moneyCell(r[c]);
        if (v != null && v > 0) return v;
      }
      return null;
    }

    var ativos = [];
    var curClass = null, curSub = null, taxaCol = null;
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      if (!r) continue;
      var c0 = r[0];
      if (c0 == null) continue;
      var s0 = String(c0);
      /* classes de topo tambem aparecem sem percentual ("Ações", "Proventos") */
      if (TOPLEVEL.indexOf(s0.trim()) !== -1) {
        curClass = s0.trim(); curSub = null; taxaCol = null; continue;
      }
      if (SKIP_SUB.indexOf(s0.trim()) !== -1) {
        if (/^Saldo/i.test(s0.trim()) && saldo == null) saldo = saldoDaLinha(r);
        curClass = "__SKIP__"; curSub = null; continue;
      }
      var mh = s0.match(/^\s*([\d.,]+)%\|(.+)/);
      if (mh) {
        var hname = mh[2].trim();
        if (TOPLEVEL.indexOf(hname) !== -1) {
          curClass = hname; curSub = null; taxaCol = null; continue;
        }
        if (SKIP_SUB.indexOf(hname) !== -1) {
          if (/^Saldo/i.test(hname) && saldo == null) saldo = saldoDaLinha(r);
          curClass = "__SKIP__"; curSub = null; continue;
        }
        if (curClass === "Produtos Estruturados" || STRUCT_RE.test(hname)) {
          var finCol = null;
          for (var c = 6; c <= 11; c++) {
            if (r[c] != null && /Financeiro/i.test(String(r[c]))) finCol = c;
          }
          var jj = i + 1, sval = 0;
          while (jj < rows.length) {
            var nr = rows[jj];
            var nc0 = nr ? nr[0] : null;
            if (isHeader(nc0) || (nc0 != null && TOPLEVEL.indexOf(String(nc0).trim()) !== -1)) break;
            if (nc0 === "Ativo") { jj++; continue; }
            if (finCol != null && nr) {
              var fv = brlToNum(nr[finCol]);
              if (fv) sval += fv;
            }
            jj++;
          }
          ativos.push({ name: hname, valor: sval, classeXP: curClass || "Produtos Estruturados",
                        subcat: "Operação estruturada" });
          i = jj - 1;
          continue;
        }
        curSub = hname;
        /* linha de cabecalho da sub-categoria: acha a coluna "Taxa" */
        taxaCol = null;
        for (var tc = 1; tc <= 11; tc++) {
          if (r[tc] != null && /^Taxa$/i.test(String(r[tc]).trim())) taxaCol = tc;
        }
        continue;
      }
      if (s0 === "Ativo") continue;
      if (curClass && curClass !== "__SKIP__") {
        var val = null;
        if (curClass === "Ações") {
          var qtd = moneyCell(r[7]);
          var price = moneyCell(r[10]);
          if (qtd && price) val = qtd * price;
        } else {
          for (var c2 = 10; c2 >= 6; c2--) {
            var mv = moneyCell(r[c2]);
            if (mv && mv > 0.5) { val = mv; break; }
          }
        }
        if (val && val > 0.5) {
          ativos.push({
            name: s0.slice(0, 80).trim(),
            valor: val,
            classeXP: curClass,
            subcat: curSub || "",
            taxa: taxaCol != null && r[taxaCol] != null ? String(r[taxaCol]).trim() : "",
          });
        }
      }
    }

    /* sem a linha da secao: cabecalho do topo ("Saldo Disponível" + "Saldo
       projetado" na 3a linha, valores na 4a) */
    if (saldo == null && rows[2] && rows[3]) {
      var soma = 0, achou = false;
      rows[2].forEach(function (h, k) {
        if (h != null && /^Saldo/i.test(String(h).trim())) {
          var v = brlToNum(rows[3][k]);
          if (v != null) { soma += v; achou = true; }
        }
      });
      if (achou) saldo = soma;
    }
    if (saldo != null && saldo > 0.5) {
      ativos.push({
        name: "Saldo projetado",
        valor: saldo,
        classeXP: "Saldo",
        subcat: "Saldo em conta",
        taxa: "",
        categoria: "Renda Fixa",
        detalhe: "Saldo em conta · disponível para alocar",
        liquidez: "D+0",
        saldo: true,
      });
    }

    var total = ativos.reduce(function (s, a) { return s + a.valor; }, 0);
    ativos.forEach(function (a) {
      if (!a.categoria) a.categoria = categoriaDoAtivo(a.classeXP, a.name);
      if (a.categoria === "Renda Variável" && INTL_RE.test(a.name)) a.categoria = "Internacional";
      /* a XP lista FII e Fiagro dentro de "Fundos de Investimento" */
      if (a.categoria === "Multimercados" && FII_RE.test(a.name)) a.categoria = "Fundos Listados";
      a.pct = total > 0 ? (a.valor / total) * 100 : 0;
    });
    return { conta: conta, patrimonio: patrim, ativos: ativos, totalAtivos: total, saldo: saldo };
  }

  /* CDB/LCA/LCD/LCI/CRI/CRA: uma linha por tipo, sem emissor. */
  function consolidar(ativos) {
    var grupos = {}, ordem = [], saida = [];
    ativos.forEach(function (a) {
      var m = a.categoria === "Renda Fixa" ? TIPO_RE.exec(a.name) : null;
      if (!m) { saida.push(a); return; }
      var tipo = m[1].toUpperCase();
      if (!grupos[tipo]) {
        grupos[tipo] = { name: tipo, valor: 0, pct: 0, classeXP: a.classeXP, categoria: "Renda Fixa",
                         subcat: "", emissoes: [], subcats: {}, taxas: [] };
        ordem.push(tipo);
      }
      var g = grupos[tipo];
      g.valor += a.valor; g.pct += a.pct;
      g.emissoes.push(a.name);
      if (a.subcat) g.subcats[a.subcat] = 1;
      if (a.taxa) g.taxas.push(a.taxa);
    });
    ordem.forEach(function (tipo) {
      var g = grupos[tipo];
      var n = g.emissoes.length;
      var subs = Object.keys(g.subcats);
      g.subcat = subs.join(", ");
      g.detalhe =
        n === 1
          ? g.emissoes[0].replace(TIPO_RE, "").replace(/^[\s\-–·:]+/, "") +
            (g.taxas[0] ? " · " + g.taxas[0] : "")
          : n + " emissões" + (subs.length ? " · " + subs.join(", ") : "") +
            (g.taxas.length ? " · " + g.taxas.slice(0, 3).join(", ") + (g.taxas.length > 3 ? "…" : "") : "");
      saida.push(g);
    });
    return saida;
  }

  window.__hubPosicao = { parse: parse, consolidar: consolidar, brlToNum: brlToNum };
})();

