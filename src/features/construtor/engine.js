// Migrated from Hub v1. Review domain assumptions separately from interface changes.

(function () {
  var _done = false;
  window._toolInit["construtor"] = function () {
    if (_done) return;
    _done = true;
    (function () {
      "use strict";
      const ORANGE = "#F26522";
      function drawRicoLogo(ctx, x, y, height, color) {
        const s = height / 270;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(s, s);
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 36;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(58, 120);
        ctx.lineTo(58, 232);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(58, 152);
        ctx.bezierCurveTo(58, 132, 74, 120, 98, 120);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(162, 120);
        ctx.lineTo(162, 232);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(338, 152);
        ctx.bezierCurveTo(328, 134, 308, 122, 286, 122);
        ctx.bezierCurveTo(254, 122, 230, 146, 230, 178);
        ctx.bezierCurveTo(230, 210, 254, 234, 286, 234);
        ctx.bezierCurveTo(308, 234, 328, 222, 338, 204);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(406, 178);
        ctx.bezierCurveTo(406, 160, 392, 146, 374, 146);
        ctx.bezierCurveTo(356, 146, 342, 160, 342, 178);
        ctx.bezierCurveTo(342, 196, 356, 210, 374, 210);
        ctx.bezierCurveTo(392, 210, 406, 196, 424, 178);
        ctx.bezierCurveTo(442, 160, 456, 146, 474, 146);
        ctx.bezierCurveTo(492, 146, 506, 160, 506, 178);
        ctx.bezierCurveTo(506, 196, 492, 210, 474, 210);
        ctx.bezierCurveTo(456, 210, 442, 196, 424, 178);
        ctx.bezierCurveTo(406, 160, 392, 146, 374, 146);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(162, 72, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      const CLASS_COLORS = {
        "Renda Fixa": "#2BD9A6",
        Previdência: "#E8709B",
        Multimercados: "#7C8CFF",
        "Renda Variável": "#F26522",
        "Fundo Aberto": "#5AC8A8",
        "Fundos Listados": "#FFB020",
        Alternativos: "#C77DFF",
        Internacional: "#36C5F0",
      };
      const CLASSES = Object.keys(CLASS_COLORS);
      const CDI_MULT = { Conservadora: 108, Moderada: 113, Sofisticada: 120 };
      const IPCA_SPREAD = {
        Conservadora: 6,
        Moderada: 7,
        Sofisticada: 8,
      }; /* retorno esperado IPCA+ (carteiras recomendadas XP) */
      const VOL_ALVO = {
        Conservadora: 1.25,
        Moderada: 4.0,
        Sofisticada: 8.0,
      }; /* volatilidade alvo */
      const CDI_DEFAULT = 14.25;

      const isIsento = (n) => /(LCI|LCA|LCD)/i.test(n || "");
      const isTesouro = (n) => /tesouro|\bNTN-?B\b|xp\s*brasil/i.test(n || "");
      const isGlobal = (it) =>
        !!it &&
        (it.classe === "Internacional" ||
          /\bglobal\b|nasdaq|s&p|msci|\bworld\b|wellington|exterior|internacional|s&p\s*500/i.test(
            it.nome || "",
          ));
      const hasFGC = (n) => /(LCI|LCA|LCD|CDB)/i.test(n || "");
      const isFII = (it) => it && it.classe === "Fundos Listados";
      function structureTag(it) {
        const blob = ((it.nome || "") + " " + (it.detalhe || "")).toLowerCase();
        if (/smart\s?cupom|smartcoupon/.test(blob))
          return { label: "Cupom Pré-Fixado", kind: "cupom" };
        if (/fence/.test(blob))
          return { label: "Proteção Parcial", kind: "protecao_parcial" };
        if (it.protecao || /collar/.test(blob))
          return { label: "Proteção", kind: "protecao" };
        return null;
      }
      /* Catálogo de tags possíveis com sua classe visual */
      const TAG_KIND = {
        CETIPADO: "cetip",
        Proteção: "protecao",
        "Cupom Pré-Fixado": "cupom",
        "Resgate trabalhado": "resgate",
        "Isento de IR": "isento",
        FGC: "fgc",
        "Tesouro Direto": "tesouro",
        Global: "global",
        Proteção: "protecao",
        "Proteção Parcial": "protecao_parcial",
      };
      const ALL_TAGS = [
        "Resgate trabalhado",
        "Isento de IR",
        "FGC",
        "Proteção",
        "Proteção Parcial",
        "Cupom Pré-Fixado",
        "CETIPADO",
        "Tesouro Direto",
        "Global",
        "Liquidez · No vencimento",
        "Liquidez · D+0",
        "Liquidez · D+1",
      ];
      function tagKind(label) {
        if (TAG_KIND[label]) return TAG_KIND[label];
        if (/^Liquidez/.test(label)) return "liq";
        return "isento";
      }
      /* Monta as tags padrão de um item a partir da sua natureza */
      function defaultTags(it) {
        const t = [];
        if (isFII(it)) t.push("CETIPADO");
        const st = structureTag(it);
        if (st) t.push(st.label);
        if (it.liquidez) t.push("Liquidez · " + it.liquidez);
        if (isIsento(it.nome)) {
          t.push("Resgate trabalhado");
          t.push("Isento de IR");
        }
        if (hasFGC(it.nome) && t.indexOf("FGC") === -1) t.push("FGC");
        if (isTesouro(it.nome) && t.indexOf("Tesouro Direto") === -1)
          t.push("Tesouro Direto");
        if (isGlobal(it) && t.indexOf("Global") === -1) t.push("Global");
        return t;
      }
      let _id = 0;
      /* Acesso protegido ao estado. IMPORTANTE: `S` é declarado com `const` mais
   abaixo e o próprio inicializador dele chama TEMPLATES -> mk() -> uid().
   Nesse instante `S` está na "zona morta temporal" e um `typeof S` LANÇA
   ReferenceError em vez de devolver "undefined" — era o que deixava a aba
   Montar a Carteira em branco. */
      function _ctorS() {
        try {
          return S;
        } catch (e) {
          return null;
        }
      }
      const uid = () => {
        var id, s;
        do {
          id = "a" + ++_id;
          s = _ctorS();
        } while (
          s &&
          Array.isArray(s.items) &&
          s.items.some(function (x) {
            return x && x.id === id;
          })
        );
        return id;
      };
      function ctorFixIds() {
        try {
          var _s = _ctorS();
          if (!_s || !Array.isArray(_s.items)) return;
          var mx = 0;
          S.items.forEach(function (x) {
            if (x && typeof x.id === "string") {
              var m = /^a(\d+)$/.exec(x.id);
              if (m) {
                var v = +m[1];
                if (v > mx) mx = v;
              }
            }
          });
          if (_id < mx) _id = mx;
          var seen = {};
          S.items.forEach(function (x) {
            if (!x) return;
            if (!x.id || seen[x.id]) {
              x.id = "a" + ++_id;
            }
            seen[x.id] = 1;
          });
        } catch (_) {}
      }

      /* ===== RETORNO POR ATIVO (Parte A) ===== */
      const RET_CATS = ["pre", "pos", "mercado", "mercadoDiv", "inflacao"];
      const RET_CAT_LABELS = {
        pre: "Pré Fixado",
        pos: "Pós Fixado",
        mercado: "A Mercado",
        mercadoDiv: "A Mercado + Dividendo",
        inflacao: "Inflação",
      };
      /* IPCA premissa para a categoria Inflação (usada no cálculo do retorno por ativo) */
      let CTOR_IPCA = 4.5;
      /* Retorno de mercado premissa (% a.a.) para categorias "A Mercado" */
      let CTOR_MERCADO = 12;
      /* Deriva uma categoria/valores de retorno padrão a partir da natureza do ativo */
      function defaultRetorno(it) {
        const nome = (it.nome || "") + " " + (it.detalhe || "");
        const txt = nome.toLowerCase();
        const r = { retCat: "mercado", retVal: 0, retIsento: false, retDiv: 0 };
        // detecta IPCA / inflação
        if (/ipca|ntn-b|inflaç/.test(txt)) {
          r.retCat = "inflacao";
          var mIp = txt.match(/ipca\s*\+\s*([\d.,]+)/);
          r.retVal = mIp ? parseFloat(mIp[1].replace(",", ".")) || 6 : 6;
          r.retIsento = /isent|lci|lca|cri|cra|debênture incentiv|fiagro/.test(
            txt,
          );
          return r;
        }
        // detecta % do CDI -> pós fixado
        var mCdi = txt.match(/([\d.,]+)\s*%?\s*(?:a\s*)?(?:do\s*)?cdi/);
        if (mCdi) {
          r.retCat = "pos";
          r.retVal = parseFloat(mCdi[1].replace(",", ".")) || 100;
          r.retIsento = /isent|lci|lca|lcd|lcd?\b|cri|cra|fiagro/.test(txt);
          return r;
        }
        // detecta % a.a. pré-fixado
        var mPre = txt.match(/([\d.,]+)\s*%\s*a\.?\s*a/);
        if (
          mPre &&
          /pré|pre-fix|pré-fix|prefix|\bltn\b|\bntn-f\b|cdb pré|cupom/.test(
            txt,
          )
        ) {
          r.retCat = "pre";
          r.retVal = parseFloat(mPre[1].replace(",", ".")) || 14;
          r.retIsento = /isent|lci|lca/.test(txt);
          return r;
        }
        // FIIs / fundos listados -> mercado + dividendo
        if (
          it.classe === "Fundos Listados" ||
          /fii|fiagro|dividend|dy /.test(txt)
        ) {
          r.retCat = "mercadoDiv";
          var mDy = txt.match(/dy\s*(?:de\s*)?([\d.,]+)\s*%/);
          r.retDiv = mDy ? parseFloat(mDy[1].replace(",", ".")) || 9 : 9;
          return r;
        }
        // Fundo Aberto (multimercado/RF aberta) -> A Mercado (retorno variável, informado pelo usuário)
        if (it.classe === "Fundo Aberto") {
          r.retCat = "mercado";
          return r;
        }
        // Renda Fixa genérica sem pista clara -> pós fixado 100% CDI
        if (it.classe === "Renda Fixa") {
          r.retCat = "pos";
          r.retVal = 100;
          return r;
        }
        return r; // demais: A Mercado
      }
      /* Aplica os defaults de retorno num item (defensivo, só preenche o que falta) */
      function ensureRetorno(it) {
        if (!it) return it;
        if (RET_CATS.indexOf(it.retCat) === -1) {
          const d = defaultRetorno(it);
          if (it.retCat == null) it.retCat = d.retCat;
          else it.retCat = "mercado";
          if (it.retVal == null) it.retVal = d.retVal;
          if (it.retIsento == null) it.retIsento = d.retIsento;
          if (it.retDiv == null) it.retDiv = d.retDiv;
        }
        if (typeof it.retVal !== "number") it.retVal = Number(it.retVal) || 0;
        if (typeof it.retDiv !== "number") it.retDiv = Number(it.retDiv) || 0;
        it.retIsento = !!it.retIsento;
        return it;
      }

      function mk(classe, nome, pct, detalhe, liquidez, opcoes, protecao) {
        const o = {
          id: uid(),
          classe,
          nome,
          pct,
          detalhe: detalhe || "",
          liquidez: liquidez || "",
        };
        if (protecao) o.protecao = true;
        if (opcoes) {
          o.opcoes = opcoes;
          o.escolha = 0;
          o.nome = opcoes[0].nome;
          o.detalhe = opcoes[0].detalhe;
          o.liquidez = opcoes[0].liquidez || "";
        }
        o.tags = defaultTags(o);
        const dr = defaultRetorno(o);
        o.retCat = dr.retCat;
        o.retVal = dr.retVal;
        o.retIsento = dr.retIsento;
        o.retDiv = dr.retDiv;
        return o;
      }

      /* Retorno bruto estimado (% a.a.) de um ativo a partir da sua config de retorno */
      function ativoRetornoAA(it) {
        ensureRetorno(it);
        const cdi = Number(S.cdi) || 0;
        switch (it.retCat) {
          case "pre":
            return Number(it.retVal) || 0;
          case "pos":
            return (cdi * (Number(it.retVal) || 0)) / 100;
          case "inflacao":
            return (Number(CTOR_IPCA) || 0) + (Number(it.retVal) || 0);
          case "mercado":
            return it.retMercado != null &&
              it.retMercado !== "" &&
              !isNaN(Number(it.retMercado))
              ? Number(it.retMercado) || 0
              : Number(CTOR_MERCADO) || 0;
          case "mercadoDiv":
            return it.retMercado != null &&
              it.retMercado !== "" &&
              !isNaN(Number(it.retMercado))
              ? Number(it.retMercado) || 0
              : Number(CTOR_MERCADO) || 0; // dividendo somado à parte no cálculo (já é parte do total esperado)
          default:
            return it.retMercado != null &&
              it.retMercado !== "" &&
              !isNaN(Number(it.retMercado))
              ? Number(it.retMercado) || 0
              : Number(CTOR_MERCADO) || 0;
        }
      }
      window.__assetMeta = function (classe, nome, detalhe, liq) {
        try {
          var o = {
            classe: classe,
            nome: nome,
            detalhe: detalhe || "",
            liquidez: liq || "",
          };
          o.tags = defaultTags(o);
          var dr = defaultRetorno(o);
          o.retCat = dr.retCat;
          o.retVal = dr.retVal;
          o.retIsento = dr.retIsento;
          o.retDiv = dr.retDiv;
          var aa = ativoRetornoAA(o),
            lbl;
          if (o.retCat === "pos") lbl = fmtPct(o.retVal) + "% do CDI";
          else if (o.retCat === "pre") lbl = fmtPct(o.retVal) + "% a.a.";
          else if (o.retCat === "inflacao")
            lbl = "IPCA + " + fmtPct(o.retVal) + "% a.a.";
          else lbl = "~" + fmtPct(aa) + "% a.a.";
          return {
            tags: o.tags || [],
            retAA: aa,
            retLabel: lbl,
            isento: !!o.retIsento,
          };
        } catch (e) {
          return { tags: [], retAA: 0, retLabel: "", isento: false };
        }
      };
      /* Retorno total esperado (a.a.) incluindo dividendo (para o motor de cálculo) */
      function ativoRetornoTotalAA(it) {
        ensureRetorno(it);
        var base = ativoRetornoAA(it);
        if (it.retCat === "mercadoDiv") base += Number(it.retDiv) || 0;
        // Gross-up dos isentos (RF pós/pré/inflação): compara em base BRUTA equivalente = líquido / (1 - IR)
        // Sem isso, LCA/LCI/LCD e crédito isento ficam subvalorizados frente a ativos tributados.
        if (
          it.retIsento &&
          (it.retCat === "pos" ||
            it.retCat === "pre" ||
            it.retCat === "inflacao")
        ) {
          var _ir = 0.15; // IR de RF longo prazo (referência)
          if (_ir > 0 && _ir < 1) base = base / (1 - _ir);
        }
        return base;
      }
      /* Texto-resumo do retorno do ativo */
      function ativoRetSummary(it) {
        ensureRetorno(it);
        var aa = ativoRetornoAA(it),
          cat = it.retCat;
        var _mInf =
          it.retMercado != null &&
          it.retMercado !== "" &&
          !isNaN(Number(it.retMercado));
        if (cat === "mercado")
          return _mInf
            ? fmtPct(aa) + "% a.a. · informado"
            : "Mercado (≈ " + fmtPct(aa) + "% a.a.)";
        if (cat === "mercadoDiv")
          return (
            (_mInf ? fmtPct(aa) + "% a.a." : "Mercado") +
            " + " +
            fmtPct(it.retDiv || 0) +
            "% DY" +
            (_mInf ? " · informado" : "")
          );
        if (cat === "inflacao")
          return (
            "IPCA + " +
            fmtPct(it.retVal || 0) +
            "% ≈ " +
            fmtPct(aa) +
            "% a.a." +
            (it.retIsento ? " · isento" : "")
          );
        if (cat === "pos")
          return (
            fmtPct(it.retVal || 0) +
            "% do CDI ≈ " +
            fmtPct(aa) +
            "% a.a." +
            (it.retIsento ? " · isento" : "")
          );
        return (
          fmtPct(it.retVal || 0) + "% a.a." + (it.retIsento ? " · isento" : "")
        );
      }

      const TEMPLATES = {
        Conservadora: () => [
          mk(
            "Renda Fixa",
            "Caixa",
            20,
            "Tesouro Selic e CDB de liquidez diária · reserva tática",
            "D+0",
          ),
          mk(
            "Renda Fixa",
            "LCD",
            51.5,
            "93% a 94% CDI · 1–5 anos",
            "No vencimento",
          ),
          mk(
            "Renda Fixa",
            "NTN-B",
            12.5,
            "IPCA + 7,8% a.a. · Tesouro Direto",
            "D+1",
          ),
          mk(
            "Renda Fixa",
            "LTN",
            6,
            "14% a.a. · Tesouro Direto",
            "No vencimento",
          ),
          mk(
            "Multimercados",
            "ACE Multicenários",
            2.5,
            "Rentabilizou ~230% do CDI nos últimos anos",
            "D+17",
          ),
          mk(
            "Fundos Listados",
            "JHSF Capital Malls",
            2.5,
            "Shoppings premium da JHSF (Cidade Jardim, Catarina Outlet) · trophy assets de alta renda · opção p/ clientes sem FIIs",
          ),
          mk(
            "Internacional",
            "Renda Fixa Global",
            2.5,
            "Crédito global em dólar · Certificate of Deposit",
            "No vencimento",
          ),
          mk(
            "Internacional",
            "XP Global Ações",
            2.5,
            "Ações globais — EUA, Europa e Reino Unido",
            "~D+5",
          ),
        ],
        Moderada: () => [
          mk(
            "Renda Fixa",
            "Caixa",
            15,
            "Tesouro Selic e CDB de liquidez diária · reserva tática",
            "D+0",
          ),
          mk(
            "Renda Fixa",
            "LCD",
            19.5,
            "93/94% CDI · 1–5 anos",
            "No vencimento",
          ),
          mk(
            "Renda Fixa",
            "NTN-B",
            22.5,
            "IPCA + 7,8% a.a. · Tesouro Direto",
            "D+1",
          ),
          mk(
            "Renda Fixa",
            "LTN",
            11,
            "14% a.a. · Tesouro Direto",
            "No vencimento",
          ),
          mk(
            "Multimercados",
            "XP Forças Armadas",
            7,
            "Exposição a empresas americanas ligadas à defesa e forças armadas, como a Palantir · 5 anos",
            "No vencimento",
            null,
            true,
          ),
          mk(
            "Multimercados",
            "ACE Multicenários",
            6,
            "Rentabilizou ~230% do CDI nos últimos anos",
            "D+17",
          ),
          Object.assign(
            mk(
              "Renda Variável",
              "BOVA11 Protegida",
              5,
              "Proteção total de capital · participa da alta até 28% (15% acima) · Collar UI de 2 anos",
              "No vencimento",
            ),
            { catalogOp: window.__BOVA_OP, _howOpen: false },
          ),
          mk(
            "Fundos Listados",
            "JHSF Capital Malls",
            4,
            "Shoppings premium · trophy assets de alta renda",
          ),
          mk(
            "Alternativos",
            "Ouro — Retorno Otimizado",
            3,
            "Exposição a ouro com estrutura otimizada · 3 a 5 anos",
            "No vencimento",
          ),
          mk(
            "Internacional",
            "Wellington Global Quality",
            4.5,
            "100% ações dos EUA, Europa e Reino Unido · +75% em 3 anos",
            "D+5",
          ),
          mk(
            "Internacional",
            "CD de 1 ano",
            2.5,
            "Certificate of Deposit · 1 ano pré-fixado em dólar",
            "No vencimento",
          ),
        ],
        Sofisticada: () => [
          mk(
            "Renda Fixa",
            "Caixa",
            10,
            "Tesouro Selic e CDB de liquidez diária · reserva tática",
            "D+0",
          ),
          mk(
            "Renda Fixa",
            "LCD",
            4,
            "Mesmo produto das demais carteiras",
            "No vencimento",
          ),
          mk(
            "Renda Fixa",
            "NTN-B",
            27.5,
            "IPCA + 7,8% a.a. · Tesouro Direto",
            "D+1",
          ),
          mk(
            "Renda Fixa",
            "LTN",
            9.5,
            "14% a.a. · Tesouro Direto",
            "No vencimento",
          ),
          mk(
            "Multimercados",
            "ACE Multicenários",
            5,
            "Rentabilizou ~230% do CDI nos últimos anos",
            "D+17",
          ),
          mk(
            "Multimercados",
            "XP Terras Raras",
            3,
            "Exposição ao tema de terras raras e minerais críticos (eletrificação, defesa e disputa geopolítica EUA–China)",
            "No vencimento",
          ),
          mk(
            "Renda Variável",
            "BOVA11",
            3,
            "ETF do Ibovespa — exposição ampla às maiores empresas da bolsa brasileira · Collar UI de 2 anos, proteção total com alta limitada",
            "No vencimento",
          ),
          mk(
            "Renda Variável",
            "BPAC11",
            3,
            "BTG Pactual, maior banco de investimentos da América Latina · SmartCupom, cupom de 8% em operação de 8 meses",
            "No vencimento",
          ),
          mk(
            "Renda Variável",
            "ITUB",
            3,
            "Itaú Unibanco, maior banco privado do país, com ROE alto e dividendos consistentes · Fence de 1 ano, proteção parcial com alta limitada",
            "No vencimento",
          ),
          mk(
            "Renda Variável",
            "Microsoft",
            3,
            "Gigante global de software e nuvem (Azure), líder em IA corporativa · Collar UI de 2 anos",
            "No vencimento",
          ),
          mk(
            "Renda Variável",
            "AXIA3",
            3,
            "Axia Energia (ex-Eletrobras), maior geradora e transmissora de energia da América Latina, em tese de eficiência pós-privatização · Collar UI de 1 ano e meio",
            "No vencimento",
          ),
          mk(
            "Fundos Listados",
            "JHSF Capital Malls",
            3.5,
            "Shoppings premium da JHSF (Cidade Jardim, Catarina Fashion Outlet) · trophy assets de alta renda, com DY de dois dígitos",
          ),
          mk(
            "Fundos Listados",
            "XP Logístico Prime",
            2,
            "Galpões logísticos de alto padrão locados a Carrefour, Amazon, Mercado Livre e Shopee · estruturado em balcão para reduzir a volatilidade da cota",
          ),
          mk(
            "Fundos Listados",
            "XPAG",
            2,
            "XP Crédito Agro (Fiagro) · CRAs e CRIs do agronegócio · renda mensal isenta de IR",
          ),
          mk(
            "Fundos Listados",
            "XP Habitat 2",
            2,
            "FII de papel · CRIs pulverizados de incorporação residencial, com forte estrutura de garantias",
          ),
          mk(
            "Alternativos",
            "XP Tecnologia",
            3,
            "QQQ protegido de 1 ano",
            "No vencimento",
          ),
          mk(
            "Alternativos",
            "Ouro Retorno Otimizado",
            4,
            "Exposição a ouro com estrutura otimizada",
            "No vencimento",
          ),
          mk(
            "Internacional",
            "Wellington Global Quality",
            7,
            "100% ações dos EUA, Europa e Reino Unido · +75% em 3 anos",
            "D+5",
          ),
          mk(
            "Internacional",
            "Renda Fixa Global",
            2.5,
            "Crédito global em dólar · Certificate of Deposit",
            "No vencimento",
          ),
        ],
      };
      try {
        window.RICO_TEMPLATES = TEMPLATES;
      } catch (e) {}

      /* =====================================================================
   VISAO POR CLASSE (generica) — mesmas proporcoes das carteiras acima,
   agregadas por classe de ativo, sem citar produtos.
   Classes: Renda Fixa (pos / inflacao / pre), Multimercados, Acoes,
   Fundos Imobiliarios, Alternativos e Internacional.
   ===================================================================== */
      const GEN_RF_CX =
        "Tesouro Selic e CDB de liquidez diária · reserva tática";
      const GEN_RF_POS = "93,5% do CDI · isento (LCA/LCD e CDB)";
      const GEN_RF_INF = "IPCA + 7,8% a.a. · títulos indexados à inflação";
      const GEN_RF_PRE = "14% a.a. · pré-fixado (Tesouro e crédito privado)";
      const GEN_MM_DET = "Estratégias macro, long&short e teses temáticas";
      const GEN_AC_DET = "Bolsa local e global · direta ou via estruturadas";
      const GEN_FI_DET = "FIIs de tijolo e papel · Fiagro · renda mensal";
      const GEN_AL_DET = "Ouro, temáticos e estruturas com proteção";
      const GEN_IN_DET = "Exposição global em dólar · ações e crédito";
      const GEN_RFG_DET = "Renda fixa global em dólar (treasuries e crédito)";
      const GEN_RVG_DET = "Ações globais em dólar (EUA, Europa e Reino Unido)";
      const GENERIC_TEMPLATES = {
        Conservadora: () => [
          mk("Renda Fixa", "Caixa", 20, GEN_RF_CX, "D+0"),
          mk("Renda Fixa", "Crédito", 51.5, GEN_RF_POS, "D+0 a vencimento"),
          mk("Renda Fixa", "Inflação", 12.5, GEN_RF_INF, "D+1"),
          mk("Renda Fixa", "Pré-fixado", 6, GEN_RF_PRE, "No vencimento"),
          mk("Multimercados", "Multimercados", 2.5, GEN_MM_DET, "D+17"),
          mk("Fundos Listados", "Fundos Imobiliários", 2.5, GEN_FI_DET, "D+2"),
          mk("Internacional", "Renda Fixa Global", 2.5, GEN_RFG_DET, "~D+5"),
          mk(
            "Internacional",
            "Renda Variável Global",
            2.5,
            GEN_RVG_DET,
            "~D+5",
          ),
        ],
        Moderada: () => [
          mk("Renda Fixa", "Caixa", 15, GEN_RF_CX, "D+0"),
          mk("Renda Fixa", "Crédito", 19.5, GEN_RF_POS, "D+0 a vencimento"),
          mk("Renda Fixa", "Inflação", 22.5, GEN_RF_INF, "D+1"),
          mk("Renda Fixa", "Pré-fixado", 11, GEN_RF_PRE, "No vencimento"),
          mk("Multimercados", "Multimercados", 13, GEN_MM_DET, "D+17"),
          mk("Renda Variável", "Ações", 5, GEN_AC_DET, "D+2"),
          mk("Fundos Listados", "Fundos Imobiliários", 4, GEN_FI_DET, "D+2"),
          mk("Alternativos", "Alternativos", 3, GEN_AL_DET, "No vencimento"),
          mk("Internacional", "Renda Fixa Global", 2.5, GEN_RFG_DET, "~D+5"),
          mk(
            "Internacional",
            "Renda Variável Global",
            4.5,
            GEN_RVG_DET,
            "~D+5",
          ),
        ],
        Sofisticada: () => [
          mk("Renda Fixa", "Caixa", 10, GEN_RF_CX, "D+0"),
          mk("Renda Fixa", "Crédito", 4, GEN_RF_POS, "D+0 a vencimento"),
          mk("Renda Fixa", "Inflação", 27.5, GEN_RF_INF, "D+1"),
          mk("Renda Fixa", "Pré-fixado", 9.5, GEN_RF_PRE, "No vencimento"),
          mk("Multimercados", "Multimercados", 8, GEN_MM_DET, "D+17"),
          mk("Renda Variável", "Ações", 15, GEN_AC_DET, "D+2"),
          mk("Fundos Listados", "Fundos Imobiliários", 9.5, GEN_FI_DET, "D+2"),
          mk("Alternativos", "Alternativos", 7, GEN_AL_DET, "No vencimento"),
          mk("Internacional", "Renda Fixa Global", 2.5, GEN_RFG_DET, "~D+5"),
          mk("Internacional", "Renda Variável Global", 7, GEN_RVG_DET, "~D+5"),
        ],
      };
      /* =====================================================================
   CARTEIRA GLOBAL (os 15% em US$) — peso unico da XP, nao varia por
   perfil: a alocacao global e a mesma para Conservadora, Moderada e
   Sofisticada; o que muda entre os perfis e quanto do total vai para
   global, nao a composicao dela. Por isso uma lista so.
   Caixa 4 + Renda Fixa 54 + Renda Variavel 42 + Alternativos 0 = 100.
   ===================================================================== */
      const GLOBAL_TEMPLATE = () => [
        mk(
          "Renda Fixa",
          "Caixa",
          4,
          "Caixa em dólar · T-bills e money market",
          "D+0",
        ),
        mk(
          "Renda Fixa",
          "Soberana Desenvolvidos",
          11,
          "Títulos soberanos de países desenvolvidos · treasuries e equivalentes",
          "~D+5",
        ),
        mk(
          "Renda Fixa",
          "Crédito High Grade",
          17,
          "Crédito corporativo grau de investimento em dólar",
          "~D+5",
        ),
        mk(
          "Renda Fixa",
          "Crédito High Yield",
          13.5,
          "Crédito corporativo de maior risco e maior carrego",
          "~D+5",
        ),
        mk(
          "Renda Fixa",
          "Dívida Emergentes",
          12.5,
          "Dívida soberana e corporativa de mercados emergentes",
          "~D+5",
        ),
        mk(
          "Renda Variável",
          "EUA",
          29,
          "Bolsa americana · S&P 500 e large caps",
          "~D+5",
        ),
        mk(
          "Renda Variável",
          "Desenvolvidos (ex-EUA)",
          11,
          "Europa, Reino Unido, Japão e demais desenvolvidos",
          "~D+5",
        ),
        mk(
          "Renda Variável",
          "Emergentes",
          2,
          "Bolsas de mercados emergentes",
          "~D+5",
        ),
      ];
      try {
        window.RICO_GLOBAL_TEMPLATE = GLOBAL_TEMPLATE;
      } catch (e) {}

      let CTOR_VIEW = "produtos";
      try {
        var _cv = window.hubStorage.getItem("hubCtorView");
        if (_cv === "classes" || _cv === "produtos") CTOR_VIEW = _cv;
      } catch (e) {}
      /* brasil = os 85% em R$ | global = os 15% em US$ */
      let CTOR_CART = "brasil";
      try {
        var _cc = window.hubStorage.getItem("hubCtorCart");
        if (_cc === "global" || _cc === "brasil") CTOR_CART = _cc;
      } catch (e) {}
      try {
        window.RICO_GENERIC_TEMPLATES = GENERIC_TEMPLATES;
      } catch (e) {}

      /* =====================================================================
   PERSISTENCIA (window.hubStorage) — Tarefas 2 e 3
   - hubConstrutorState : estado editado da carteira do Simulador (state S)
   - hubTemplatesOverride: override de fabrica dos templates
       Conservadora / Moderada / Sofisticada
   Tudo defensivo (try/catch).
   ===================================================================== */
      var LS_CTOR_STATE = "hubConstrutorState";
      var LS_TPL_OVERRIDE = "hubTemplatesOverride";

      /* fabrica original de cada template (antes de qualquer override) */
      var TEMPLATES_FACTORY = {};
      Object.keys(TEMPLATES).forEach(function (k) {
        TEMPLATES_FACTORY[k] = TEMPLATES[k];
      });

      /* serializa um item para JSON (mantem so campos de dados; descarta funcoes).
   Marca _bovaOp p/ re-anexar o catalogOp do BOVA ao restaurar. */
      /* limpa um valor recursivamente p/ garantir que seja JSON-serializavel
   (descarta funcoes, DOM nodes, ops e quebra referencias circulares).
   Isso blinda o JSON.stringify do save do modelo contra qualquer valor
   nao-serializavel que por ventura entre num item. */
      function _cleanForJSON(v, seen, depth) {
        if (v == null) return v;
        var t = typeof v;
        if (t === "function" || t === "symbol" || t === "undefined")
          return undefined;
        if (t !== "object") return v; // string/number/boolean
        if (depth > 6) return undefined; // limite de profundidade defensivo
        seen = seen || [];
        if (seen.indexOf(v) !== -1) return undefined; // referencia circular
        try {
          if (
            typeof window !== "undefined" &&
            window.Node &&
            v instanceof window.Node
          )
            return undefined;
        } catch (_) {}
        seen = seen.concat([v]);
        if (Array.isArray(v)) {
          var arr = [];
          for (var i = 0; i < v.length; i++) {
            var cv = _cleanForJSON(v[i], seen, (depth || 0) + 1);
            if (cv !== undefined) arr.push(cv);
          }
          return arr;
        }
        var out = {};
        Object.keys(v).forEach(function (k) {
          if (k === "op" || k === "catalogOp") return; // objetos derivados / operacoes (nao serializar)
          var cv = _cleanForJSON(v[k], seen, (depth || 0) + 1);
          if (cv !== undefined) out[k] = cv;
        });
        return out;
      }
      function serItem(it) {
        if (!it || typeof it !== "object") return null;
        var o = {};
        Object.keys(it).forEach(function (k) {
          if (k === "op" || k === "catalogOp") return; // objetos derivados / funcoes
          var v = it[k];
          var t = typeof v;
          if (t === "function") return;
          var cv = _cleanForJSON(v, null, 0); // limpa recursivamente (opcoes/tags/etc.)
          if (cv !== undefined) o[k] = cv;
        });
        try {
          if (it.catalogOp && it.catalogOp === window.__BOVA_OP)
            o._bovaOp = true;
        } catch (_) {}
        // garante um id
        if (!o.id) {
          try {
            o.id = uid();
          } catch (_) {
            o.id = "it" + Math.random().toString(36).slice(2);
          }
        }
        return o;
      }
      /* desserializa um item: clona e re-anexa catalogOp do BOVA se marcado */
      function deserItem(o) {
        if (!o || typeof o !== "object") return null;
        var it = {};
        Object.keys(o).forEach(function (k) {
          it[k] = o[k];
        });
        try {
          if (it._bovaOp && window.__BOVA_OP) {
            it.catalogOp = window.__BOVA_OP;
          }
        } catch (_) {}
        // garante consistencia de tags/retorno
        try {
          if (!Array.isArray(it.tags)) it.tags = defaultTags(it);
        } catch (_) {}
        try {
          ensureRetorno(it);
        } catch (_) {}
        if (!it.id) {
          try {
            it.id = uid();
          } catch (_) {
            it.id = "it" + Math.random().toString(36).slice(2);
          }
        }
        return it;
      }
      function serItems(arr) {
        return (arr || []).map(serItem).filter(Boolean);
      }
      function deserItems(arr) {
        return (arr || []).map(deserItem).filter(Boolean);
      }

      /* ---------- OVERRIDES DE TEMPLATE (Tarefa 3) ---------- */
      function loadTplOverrides() {
        try {
          return (
            JSON.parse(window.hubStorage.getItem(LS_TPL_OVERRIDE) || "{}") || {}
          );
        } catch (_) {
          return {};
        }
      }
      function saveTplOverrides(ov) {
        try {
          window.hubStorage.setItem(LS_TPL_OVERRIDE, JSON.stringify(ov || {}));
          return true;
        } catch (_) {
          return false;
        }
      }
      var __tplOverrides = loadTplOverrides();
      if (!__tplOverrides || typeof __tplOverrides !== "object")
        __tplOverrides = {};
      /* A camada compartilhada (Firestore) grava os modelos editados no
         hubStorage; este gancho recarrega e redesenha as abas sem mexer na
         carteira que esta na tela -- o proximo clique no modelo ja traz a
         versao nova. */
      window.__cloudTplReload = function () {
        try {
          __tplOverrides = loadTplOverrides();
          if (!__tplOverrides || typeof __tplOverrides !== "object") __tplOverrides = {};
          applyTplOverrideWrappers();
          if (document.getElementById("tabs")) renderTabs();
        } catch (_) {}
      };

      /* Reescreve cada TEMPLATES[name] para devolver o override salvo (se houver)
   ou a fabrica original. Como window.RICO_TEMPLATES === TEMPLATES, todos os
   consumidores (Simulador, Propor Carteira, Aderencia, etc.) leem o override. */
      function applyTplOverrideWrappers() {
        Object.keys(TEMPLATES_FACTORY).forEach(function (name) {
          TEMPLATES[name] = function () {
            var ov = __tplOverrides && __tplOverrides[name];
            if (ov && ov.length) {
              return deserItems(ov);
            }
            return TEMPLATES_FACTORY[name]();
          };
        });
        try {
          window.RICO_TEMPLATES = TEMPLATES;
        } catch (_) {}
      }
      applyTplOverrideWrappers();

      /* Grava um override (snapshot dos itens atuais) para um template e re-aplica wrappers.
   Retorna true se persistiu com sucesso. Defensivo: serializa de forma segura
   (serItems ja limpa funcoes/ops/circular) e verifica o resultado, de modo que
   o override NUNCA fica vazio por causa de um item nao-serializavel. */
      function setTplOverride(name, items) {
        if (!name || !TEMPLATES_FACTORY[name]) return false;
        var ser;
        try {
          ser = serItems(items);
        } catch (_) {
          ser = null;
        }
        if (!Array.isArray(ser) || !ser.length) return false; // nada valido p/ salvar -> nao apaga nem grava vazio
        // valida que o snapshot e realmente serializavel antes de mexer no estado
        try {
          JSON.stringify(ser);
        } catch (_) {
          return false;
        }
        if (!__tplOverrides || typeof __tplOverrides !== "object")
          __tplOverrides = {};
        __tplOverrides[name] = ser;
        var okSave = saveTplOverrides(__tplOverrides);
        applyTplOverrideWrappers();
        return !!okSave;
      }
      /* Remove o override de um template (volta a fabrica) */
      function clearTplOverride(name) {
        if (__tplOverrides && __tplOverrides[name] != null) {
          delete __tplOverrides[name];
          saveTplOverrides(__tplOverrides);
        }
        applyTplOverrideWrappers();
      }
      function hasTplOverride(name) {
        return !!(
          __tplOverrides &&
          __tplOverrides[name] &&
          __tplOverrides[name].length
        );
      }

      /* ---------- PERSISTENCIA DO ESTADO DO SIMULADOR (Tarefa 2) ---------- */
      var __ctorRestoring = false;
      function persistCtorState() {
        if (__ctorRestoring) return;
        try {
          var snap = {
            template: S.template,
            items: serItems(S.items),
            cliente: S.cliente || "",
            patrimonio: Number(S.patrimonio) || 0,
            cdi: Number(S.cdi) || 0,
            cdiMult: Number(S.cdiMult) || 0,
            clienteCDI: Number(S.clienteCDI) || 0,
            projAnos: Number(S.projAnos) || 5,
            recomendadaTemplate: S.recomendadaTemplate || "Moderada",
            usarRetornoAtivo: !!S.usarRetornoAtivo,
            saidas: Array.isArray(S.saidas) ? S.saidas.slice() : [],
            posicaoAtual:
              S.posicaoAtual && S.posicaoAtual.comp
                ? {
                    conta: S.posicaoAtual.conta || null,
                    patrimonio: S.posicaoAtual.patrimonio || 0,
                    comp: S.posicaoAtual.comp,
                    atualizadoEm: S.posicaoAtual.atualizadoEm || 0,
                  }
                : null,
            _v: 1,
          };
          window.hubStorage.setItem(LS_CTOR_STATE, JSON.stringify(snap));
        } catch (_) {}
      }
      function restoreCtorState() {
        var raw = null;
        try {
          raw = window.hubStorage.getItem(LS_CTOR_STATE);
        } catch (_) {
          raw = null;
        }
        if (!raw) return false;
        var snap = null;
        try {
          snap = JSON.parse(raw);
        } catch (_) {
          return false;
        }
        if (!snap || typeof snap !== "object") return false;
        __ctorRestoring = true;
        try {
          if (snap.template) S.template = snap.template;
          if (Array.isArray(snap.items) && snap.items.length) {
            S.items = deserItems(snap.items);
            ctorFixIds();
          }
          if (typeof snap.cliente === "string") S.cliente = snap.cliente;
          if (snap.patrimonio != null && !isNaN(Number(snap.patrimonio)))
            S.patrimonio = Number(snap.patrimonio);
          if (snap.cdi != null && !isNaN(Number(snap.cdi)))
            S.cdi = Number(snap.cdi);
          if (snap.cdiMult != null && !isNaN(Number(snap.cdiMult)))
            S.cdiMult = Number(snap.cdiMult);
          if (snap.clienteCDI != null && !isNaN(Number(snap.clienteCDI)))
            S.clienteCDI = Number(snap.clienteCDI);
          if (snap.projAnos != null && !isNaN(Number(snap.projAnos)))
            S.projAnos = Number(snap.projAnos);
          if (snap.recomendadaTemplate)
            S.recomendadaTemplate = snap.recomendadaTemplate;
          if (typeof snap.usarRetornoAtivo === "boolean")
            S.usarRetornoAtivo = snap.usarRetornoAtivo;
          if (snap.posicaoAtual && snap.posicaoAtual.comp && !S.posicaoAtual)
            S.posicaoAtual = snap.posicaoAtual;
          S.saidas = Array.isArray(snap.saidas) ? snap.saidas.slice() : [];
        } catch (_) {
          __ctorRestoring = false;
          return false;
        }
        __ctorRestoring = false;
        return true;
      }
      /* atalho usado nos pontos de edicao */
      function ctorPersist() {
        try {
          persistCtorState();
        } catch (_) {}
      }

      /* ---------- HISTORICO DE CARTEIRAS (ultimas 5) ----------
         Sem botao de salvar: a carteira e guardada no instante em que o
         construtor vai descarta-la -- troca de modelo, Montar do zero,
         Restaurar template, carregar posicao. Um template intocado nao entra
         (nao ha o que perder); a mesma carteira nao entra duas vezes. */
      var LS_CTOR_HIST = "hubConstrutorHistorico";
      var HIST_MAX = 5;
      var __histUltimaRender = "";
      function histLer() {
        try {
          var a = JSON.parse(window.hubStorage.getItem(LS_CTOR_HIST) || "[]");
          return Array.isArray(a) ? a : [];
        } catch (_) {
          return [];
        }
      }
      function histGravar(lista) {
        try {
          window.hubStorage.setItem(
            LS_CTOR_HIST,
            JSON.stringify(lista.slice(0, HIST_MAX)),
          );
        } catch (_) {}
      }
      function histSnap() {
        return {
          template: S.template,
          items: serItems(S.items),
          cliente: S.cliente || "",
          patrimonio: Number(S.patrimonio) || 0,
          cdi: Number(S.cdi) || 0,
          cdiMult: Number(S.cdiMult) || 0,
          clienteCDI: Number(S.clienteCDI) || 0,
          projAnos: Number(S.projAnos) || 5,
          recomendadaTemplate: S.recomendadaTemplate || "Moderada",
          usarRetornoAtivo: !!S.usarRetornoAtivo,
          saidas: Array.isArray(S.saidas) ? S.saidas.slice() : [],
          posicaoAtual:
            S.posicaoAtual && S.posicaoAtual.comp
              ? { conta: S.posicaoAtual.conta || null, patrimonio: S.posicaoAtual.patrimonio || 0,
                  comp: S.posicaoAtual.comp, atualizadoEm: S.posicaoAtual.atualizadoEm || 0 }
              : null,
          _v: 1,
        };
      }
      function histAssinatura(snap) {
        return JSON.stringify([
          snap.template,
          snap.cliente,
          snap.patrimonio,
          (snap.items || []).map(function (i) {
            return [i.nome, i.pct, i.classe, i.detalhe || ""];
          }),
        ]);
      }
      /* Template de fabrica identico ao que esta na tela? Entao nao vale
         guardar: clicar no proprio modelo de novo traz o mesmo resultado. */
      function histEhFabrica(snap) {
        try {
          var t = snap.template;
          if (t === "Nova" || t === "Atual") return !snap.items.length;
          var fab =
            CTOR_CART === "global"
              ? GLOBAL_TEMPLATE()
              : CTOR_VIEW === "classes" && GENERIC_TEMPLATES[t]
                ? GENERIC_TEMPLATES[t]()
                : TEMPLATES[t]
                  ? TEMPLATES[t]()
                  : null;
          if (!fab) return false;
          var chave = function (arr) {
            return (arr || [])
              .map(function (i) {
                return [i.nome, Number(i.pct) || 0, i.classe].join("\u0001");
              })
              .join("\u0002");
          };
          /* o nome do cliente fica em S.cliente e sobrevive a troca de
             modelo, entao nao conta: so os ativos dizem se houve trabalho */
          return chave(serItems(fab)) === chave(snap.items);
        } catch (_) {
          return false;
        }
      }
      function histGuardar(motivo) {
        if (__ctorRestoring) return;
        var snap;
        try {
          snap = histSnap();
        } catch (_) {
          return;
        }
        if (!snap.items || !snap.items.length) return;
        if (histEhFabrica(snap)) return;
        var ass = histAssinatura(snap);
        var lista = histLer();
        if (lista.length && lista[0].ass === ass) return;
        lista = lista.filter(function (e) {
          return e.ass !== ass;
        });
        lista.unshift({
          id: "h" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          em: new Date().toISOString(),
          motivo: motivo || "",
          ass: ass,
          snap: snap,
        });
        histGravar(lista);
        renderHistorico();
      }
      function histAplicar(snap) {
        __ctorRestoring = true;
        try {
          if (snap.template) S.template = snap.template;
          S.items = deserItems(snap.items || []);
          ctorFixIds();
          S.cliente = typeof snap.cliente === "string" ? snap.cliente : "";
          if (snap.patrimonio != null && !isNaN(Number(snap.patrimonio)))
            S.patrimonio = Number(snap.patrimonio);
          if (snap.cdi != null && !isNaN(Number(snap.cdi))) S.cdi = Number(snap.cdi);
          if (snap.cdiMult != null && !isNaN(Number(snap.cdiMult)))
            S.cdiMult = Number(snap.cdiMult);
          if (snap.clienteCDI != null && !isNaN(Number(snap.clienteCDI)))
            S.clienteCDI = Number(snap.clienteCDI);
          if (snap.projAnos != null && !isNaN(Number(snap.projAnos)))
            S.projAnos = Number(snap.projAnos);
          if (snap.recomendadaTemplate) S.recomendadaTemplate = snap.recomendadaTemplate;
          if (typeof snap.usarRetornoAtivo === "boolean")
            S.usarRetornoAtivo = snap.usarRetornoAtivo;
          S.posicaoAtual = snap.posicaoAtual && snap.posicaoAtual.comp ? snap.posicaoAtual : null;
          S.saidas = Array.isArray(snap.saidas) ? snap.saidas.slice() : [];
        } finally {
          __ctorRestoring = false;
        }
      }
      function histReabrir(id) {
        var e = histLer().filter(function (x) {
          return x.id === id;
        })[0];
        if (!e || !e.snap) return;
        histGuardar("reabrir"); /* o que esta na tela nao se perde */
        histAplicar(e.snap);
        S.editandoTemplate = null;
        render();
        try {
          var alvo = document.getElementById("construtorSub");
          if (alvo) alvo.scrollIntoView({ behavior: "smooth", block: "start" });
        } catch (_) {}
        try {
          window.showToast(
            "Carteira reaberta" +
              (e.snap.cliente ? ": " + e.snap.cliente : "") +
              ". A que estava na tela foi para o histórico.",
          );
        } catch (_) {}
      }
      function histEsquecer(id) {
        histGravar(
          histLer().filter(function (x) {
            return x.id !== id;
          }),
        );
        renderHistorico();
      }
      function histQuando(iso) {
        var d = new Date(iso);
        if (isNaN(d)) return "";
        var hoje = new Date();
        var hh =
          String(d.getHours()).padStart(2, "0") +
          ":" +
          String(d.getMinutes()).padStart(2, "0");
        var mesmoDia = function (a, b) {
          return (
            a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate()
          );
        };
        if (mesmoDia(d, hoje)) return "hoje " + hh;
        var ontem = new Date(hoje);
        ontem.setDate(hoje.getDate() - 1);
        if (mesmoDia(d, ontem)) return "ontem " + hh;
        return (
          String(d.getDate()).padStart(2, "0") +
          "/" +
          String(d.getMonth() + 1).padStart(2, "0") +
          " " +
          hh
        );
      }
      function renderHistorico() {
        var box = document.getElementById("ctorHistLista");
        if (!box) return;
        var lista = histLer();
        /* no topo da tela, caixa vazia e so ruido: aparece com a primeira carteira */
        var cardHist = document.getElementById("ctorHistorico");
        if (cardHist) cardHist.hidden = !lista.length;
        var chave = lista
          .map(function (e) {
            return e.id;
          })
          .join(",");
        if (chave === __histUltimaRender && box.childNodes.length) return;
        __histUltimaRender = chave;
        if (!lista.length) {
          box.innerHTML =
            '<div class="hist-vazio">Nenhuma carteira guardada ainda. Assim que você trocar de modelo ou restaurar um template, a carteira que estava na tela aparece aqui.</div>';
          return;
        }
        box.innerHTML = lista
          .map(function (e) {
            var sn = e.snap || {};
            var itens = sn.items || [];
            var porClasse = {};
            var total = 0;
            itens.forEach(function (i) {
              var p = Number(i.pct) || 0;
              porClasse[i.classe] = (porClasse[i.classe] || 0) + p;
              total += p;
            });
            var barra = CLASSES.filter(function (c) {
              return porClasse[c] > 0;
            })
              .map(function (c) {
                var w = total > 0 ? (porClasse[c] / total) * 100 : 0;
                return (
                  '<span title="' +
                  esc(c) +
                  " " +
                  Math.round(porClasse[c]) +
                  '%" style="width:' +
                  w.toFixed(1) +
                  "%;background:" +
                  (CLASS_COLORS[c] || "#888") +
                  '"></span>'
                );
              })
              .join("");
            var nome = sn.cliente ? esc(sn.cliente) : "Sem nome de cliente";
            var modelo =
              sn.template === "Nova"
                ? "Montada do zero"
                : sn.template === "Atual"
                  ? "Posição atual"
                  : "Base " + esc(sn.template || "");
            return (
              '<div class="hist-item" data-hist="' +
              e.id +
              '">' +
              '<div class="hist-topo">' +
              '<div class="hist-nome">' +
              nome +
              "</div>" +
              '<div class="hist-quando">' +
              histQuando(e.em) +
              "</div>" +
              "</div>" +
              '<div class="hist-meta">' +
              '<span class="hist-chip">' +
              modelo +
              "</span>" +
              "<span>" +
              itens.length +
              (itens.length === 1 ? " ativo" : " ativos") +
              "</span>" +
              (sn.patrimonio ? "<span>R$ " + fmtBRL(sn.patrimonio) + "</span>" : "") +
              "</div>" +
              '<div class="hist-barra">' +
              barra +
              "</div>" +
              '<div class="hist-acoes">' +
              '<button type="button" class="hist-abrir" data-histabrir="' +
              e.id +
              '">Reabrir</button>' +
              '<button type="button" class="hist-x" data-histx="' +
              e.id +
              '" title="Tirar do histórico">×</button>' +
              "</div>" +
              "</div>"
            );
          })
          .join("");
        box.querySelectorAll("[data-histabrir]").forEach(function (b) {
          b.onclick = function () {
            histReabrir(b.getAttribute("data-histabrir"));
          };
        });
        box.querySelectorAll("[data-histx]").forEach(function (b) {
          b.onclick = function (ev) {
            ev.stopPropagation();
            histEsquecer(b.getAttribute("data-histx"));
          };
        });
      }
      try {
        window.__ctorHistorico = {
          guardar: histGuardar,
          ler: histLer,
          reabrir: histReabrir,
        };
      } catch (_) {}

      const GLOSSARY = {
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
        smart: {
          match: ["smartcupom", "smartcoupon", "smart cupom"],
          label: "SmartCupom",
          desc: "Estrutura com opções que garante um cupom pré-fixado, desde que a ação não fique abaixo de um preço pré-determinado (barreira).",
        },
      };
      function detectGlossario(items) {
        const blob = items
          .map((i) => (i.nome + " " + (i.detalhe || "")).toLowerCase())
          .join(" ");
        return Object.keys(GLOSSARY).filter((k) =>
          GLOSSARY[k].match.some((m) => blob.includes(m)),
        );
      }

      const fmtPct = (n) => {
        const v = Math.round(n * 10) / 10;
        return (Number.isInteger(v) ? v.toFixed(0) : v.toFixed(1)).replace(
          ".",
          ",",
        );
      };
      const fmtBRL = (n) =>
        Math.round(n).toLocaleString("pt-BR", { maximumFractionDigits: 0 });
      const fmtCompact = (v) =>
        v >= 1e6
          ? "R$ " + (v / 1e6).toFixed(v >= 1e7 ? 0 : 1).replace(".", ",") + "M"
          : "R$ " + Math.round(v / 1e3) + "k";
      const esc = (s) =>
        String(s)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");

      /* ---------- estado ---------- */
      const S = {
        template: "Moderada",
        items: TEMPLATES.Moderada(),
        cliente: "",
        patrimonio: 1000000,
        cdi: CDI_DEFAULT,
        cdiMult: CDI_MULT.Moderada,
        clienteCDI: 0,
        projAnos: 5,
        posicaoAtual: null, // posição consolidada importada (categoria -> %)
        saidas: [], // ativos da posicao importada que o assessor tirou da proposta
        recomendadaTemplate: "Moderada", // template ideal de referência p/ aderência da aba Atual
        usarRetornoAtivo: true, // Parte A: calcula o retorno da carteira pelo "Retorno" de cada ativo
        editandoTemplate: null, // Tarefa 3: nome do modelo em edicao (Conservadora/Moderada/Sofisticada) ou null
      };

      /* Categorias do construtor para montar a carteira "Atual" a partir da posição importada */
      const CAT_ATUAL_NOMES = {
        "Renda Fixa": "Renda Fixa (posição atual)",
        Multimercados: "Multimercados (posição atual)",
        "Renda Variável": "Renda Variável (posição atual)",
        "Fundos Listados": "Fundos Imobiliários (posição atual)",
        Alternativos: "Alternativos (posição atual)",
        Internacional: "Internacional (posição atual)",
      };

      /* ---------- atual x novo x saiu ----------
         Depois de importar a Posicao Consolidada, cada ativo que veio da
         planilha carrega origem:"atual" (e pctAtual, o peso que tinha); o
         que o assessor acrescenta depois nasce origem:"novo"; o que ele tira
         vai para S.saidas. Na tela e no PNG isso vira "o que fica, o que
         entra, o que sai" -- mais claro para o cliente do que uma lista so. */
      function modoComparacao() {
        return (
          S.template === "Atual" &&
          !!(S.posicaoAtual && S.posicaoAtual.comp) &&
          (S.items.some(function (it) { return it.origem === "atual"; }) ||
            (S.saidas && S.saidas.length > 0))
        );
      }
      function marcarNovo(o) {
        if (o && S.template === "Atual" && S.posicaoAtual && S.posicaoAtual.comp && !o.origem)
          o.origem = "novo";
        return o;
      }
      function pesoMudou(it) {
        return (
          it.origem === "atual" &&
          it.pctAtual != null &&
          Math.abs((Number(it.pct) || 0) - Number(it.pctAtual)) >= 0.05
        );
      }
      function registrarSaida(it) {
        if (!it || it.origem !== "atual") return;
        if (!Array.isArray(S.saidas)) S.saidas = [];
        S.saidas.push({
          nome: it.nome,
          classe: it.classe,
          pct: it.pctAtual != null ? Number(it.pctAtual) : Number(it.pct) || 0,
          detalhe: it.detalhe || "",
          liquidez: it.liquidez || "",
        });
      }
      function desfazerSaida(idx) {
        if (!Array.isArray(S.saidas) || !S.saidas[idx]) return;
        var sd = S.saidas.splice(idx, 1)[0];
        var o = mk(sd.classe, sd.nome, sd.pct, sd.detalhe, sd.liquidez, null);
        o.origem = "atual";
        o.pctAtual = sd.pct;
        S.items.push(o);
      }
      function resumoMudanca() {
        var r = { mantem: 0, ajusta: 0, novos: 0, saem: (S.saidas || []).length };
        S.items.forEach(function (it) {
          if (it.origem === "novo") r.novos++;
          else if (it.origem === "atual") {
            if (pesoMudou(it)) r.ajusta++;
            else r.mantem++;
          }
        });
        return r;
      }

      /* Recebe a posição atual do cliente (vinda da aba Aderência) e cria a aba "Atual" */
      window.__setPosicaoAtual = function (pos) {
        if (!pos) {
          S.posicaoAtual = null;
          if (S.template === "Atual") {
            try {
              loadTemplate(S.recomendadaTemplate || "Moderada");
            } catch (e) {}
          }
          try {
            renderTabs();
          } catch (e) {}
          return;
        }
        if (!pos.comp) return;
        S.posicaoAtual = pos;
        if (pos.cliente && !S.cliente) S.cliente = pos.cliente;
        if (pos.conta && !S.cliente) S.cliente = "Conta " + pos.conta;
        renderTabs();
      };

      /* Sub-categoria amigável para exibir no detalhe do ativo */
      function subcatLabel(a) {
        if (a.subcat && a.subcat !== "" && a.subcat !== "Operação estruturada")
          return a.subcat;
        if (a.subcat === "Operação estruturada") return "Operação estruturada";
        // infere pela categoria interna
        if (a.categoria === "Renda Variável") return "Ação / RV";
        if (a.categoria === "Fundos Listados") return "Fundo imobiliário";
        if (a.categoria === "Internacional") return "Internacional";
        if (a.categoria === "Multimercados") return "Fundo de investimento";
        return a.categoria || "";
      }

      /* Constrói os itens da carteira a partir dos ATIVOS individuais da posição importada.
   Se não houver ativos detalhados, cai para a composição por categoria. */
      function itensDaPosicao(pos) {
        const out = [];
        if (pos && Array.isArray(pos.ativos) && pos.ativos.length) {
          // ordena por categoria (na ordem do construtor) e depois por % desc
          const ordem = {};
          CLASSES.forEach((c, idx) => (ordem[c] = idx));
          const lista = pos.ativos.slice().sort((a, b) => {
            const oa = ordem[a.categoria] == null ? 99 : ordem[a.categoria];
            const ob = ordem[b.categoria] == null ? 99 : ordem[b.categoria];
            if (oa !== ob) return oa - ob;
            return (b.pct || 0) - (a.pct || 0);
          });
          lista.forEach((a) => {
            if ((a.pct || 0) < 0.01) return;
            /* o selo ATUAL ja diz de onde veio; o detalhe fica so com o produto */
            const detalhe = a.detalhe
              ? a.detalhe
              : subcatLabel(a) + (a.taxa ? " · " + a.taxa : "");
            var itPos = mk(
              a.categoria || "Multimercados",
              a.name,
              Math.round((a.pct || 0) * 10) / 10,
              detalhe,
              a.liquidez || "",
              null,
            );
            itPos.origem = "atual";
            itPos.pctAtual = itPos.pct;
            /* saldo parado em conta nao rende: entra com 0% do CDI ate o
               assessor alocar (ou informar remuneracao de saldo) */
            if (a.saldo) {
              itPos.retCat = "pos";
              itPos.retVal = 0;
              itPos.retIsento = false;
            }
            out.push(itPos);
          });
        }
        if (out.length) return out;
        // fallback: composição por categoria
        return itensDaComposicao(pos ? pos.comp : {});
      }

      /* Constrói os itens da carteira a partir de uma composição por categoria (%) — fallback */
      function itensDaComposicao(comp) {
        const out = [];
        if (!comp) return out;
        CLASSES.forEach((cat) => {
          const pct = comp[cat] || 0;
          if (pct < 0.05) return;
          var itCat = mk(
            cat,
            CAT_ATUAL_NOMES[cat] || cat,
            Math.round(pct * 10) / 10,
            "Posição consolidada importada do Hub XP",
            "",
            null,
          );
          itCat.origem = "atual";
          itCat.pctAtual = itCat.pct;
          out.push(itCat);
        });
        return out;
      }

      /* ---------- derivados ---------- */
      function calc() {
        const total = S.items.reduce((s, i) => s + (Number(i.pct) || 0), 0);
        const restante = Math.round((100 - total) * 10) / 10;
        const totalOk = Math.abs(total - 100) < 0.05;
        const retAACDI =
          ((Number(S.cdi) || 0) * (Number(S.cdiMult) || 0)) / 100; // baseline histórico (% do CDI da carteira)
        // ===== Retorno por ativo (Parte A): média ponderada pelos % dos ativos =====
        let somaPesos = 0,
          somaRet = 0;
        S.items.forEach((it) => {
          const p = Number(it.pct) || 0;
          if (p <= 0) return;
          somaPesos += p;
          somaRet += p * ativoRetornoTotalAA(it);
        });
        const retAAItens = somaPesos > 0 ? somaRet / somaPesos : retAACDI;
        // % do CDI implícito do retorno por ativo (para exibição)
        const multItens =
          (Number(S.cdi) || 0) > 0
            ? (retAAItens / (Number(S.cdi) || 0)) * 100
            : Number(S.cdiMult) || 0;
        const usarItens = S.usarRetornoAtivo !== false && somaPesos > 0;
        const retAA = usarItens ? retAAItens : retAACDI;
        const ganho12 = (S.patrimonio * retAA) / 100;
        const byClass = {};
        CLASSES.forEach((c) => (byClass[c] = 0));
        S.items.forEach(
          (i) =>
            (byClass[i.classe] =
              (byClass[i.classe] || 0) + (Number(i.pct) || 0)),
        );
        const grouped = {};
        CLASSES.forEach((c) => (grouped[c] = []));
        S.items.forEach((i) => {
          if (!grouped[i.classe]) grouped[i.classe] = [];
          grouped[i.classe].push(i);
        });
        const glossTerms = detectGlossario(S.items);
        const temCliente = (Number(S.clienteCDI) || 0) > 0;
        const retClienteAA =
          ((Number(S.cdi) || 0) * (Number(S.clienteCDI) || 0)) / 100;
        const projData = [];
        for (let a = 0; a <= S.projAnos; a++) {
          projData.push({
            ano: a,
            carteira: Math.round(S.patrimonio * Math.pow(1 + retAA / 100, a)),
            cdi: Math.round(
              S.patrimonio * Math.pow(1 + (Number(S.cdi) || 0) / 100, a),
            ),
            cliente: Math.round(
              S.patrimonio * Math.pow(1 + retClienteAA / 100, a),
            ),
          });
        }
        const endCarteira = projData[projData.length - 1].carteira;
        const endCDI = projData[projData.length - 1].cdi;
        const ganhoCliente12 = (S.patrimonio * retClienteAA) / 100;
        const alphaCDI = (Number(S.cdiMult) || 0) - (Number(S.clienteCDI) || 0);
        const alpha12 = ganho12 - ganhoCliente12;
        const endCliente =
          S.patrimonio * Math.pow(1 + retClienteAA / 100, S.projAnos);
        const alphaProj = endCarteira - endCliente;
        return {
          total,
          restante,
          totalOk,
          retAA,
          ganho12,
          byClass,
          grouped,
          glossTerms,
          projData,
          endCarteira,
          endCDI,
          temCliente,
          retClienteAA,
          alphaCDI,
          alpha12,
          alphaProj,
          retAACDI,
          retAAItens,
          multItens,
          usarItens,
        };
      }

      /* ---------- render ---------- */
      /* Render sincrono. (Coalescing via requestAnimationFrame foi removido: quando a aba ficava em segundo plano o rAF nao disparava, a flag ficava presa e os botoes de perfil paravam de responder.) */
      function render() {
        try {
          renderNow();
        } catch (e) {
          try {
            console.error(e);
          } catch (_) {}
        }
      }
      function renderNow() {
        const D = calc();
        // Sincroniza o "% do CDI" da carteira com o retorno por ativo (mantém Alfa/ponte coerentes)
        if (D.usarItens) {
          S.cdiMult = Math.round((D.multItens || 0) * 10) / 10;
        }
        renderTabs();
        renderEditor(D);
        renderTotal(D);
        renderRetorno(D);
        renderAlfa(D);
        renderDonut(D);
        renderGloss(D);
        renderProj(D);
        renderAderencia(D);
        document.getElementById("projTitle").textContent =
          "PROJEÇÃO DE RENTABILIDADE · " + S.template.toUpperCase();
        publicarCarteira(D);
        ctorPersist(); // Tarefa 2: persiste o estado editado a cada render
        try {
          renderHistorico();
        } catch (_) {}
      }

      // Ponte com o Simulador: publica a carteira montada num objeto global
      function publicarCarteira(D) {
        try {
          window.RICO_BRIDGE = window.RICO_BRIDGE || {};
          window.RICO_BRIDGE.carteira = {
            template: S.template,
            cliente: S.cliente || "",
            patrimonio: S.patrimonio,
            cdiMult: S.cdiMult,
            retAA: D.retAA,
            itens: S.items
              .map((it) => ({
                classe: it.classe,
                nome: it.nome,
                pct: Number(it.pct) || 0,
                detalhe: it.detalhe || "",
                tags: Array.isArray(it.tags)
                  ? it.tags.slice()
                  : defaultTags(it),
              }))
              .filter((it) => it.pct > 0),
            atualizadoEm: Date.now(),
          };
          if (typeof window.RICO_onCarteiraUpdate === "function") {
            window.RICO_onCarteiraUpdate();
          }
        } catch (e) {
          /* silencioso */
        }
      }

      function renderTabs() {
        const el = document.getElementById("tabs");
        let h = "";
        Object.keys(TEMPLATES).forEach((t) => {
          h += `<button class="tab ${S.template === t ? "active" : ""}" data-tpl="${t}">${t}</button>`;
        });
        h += `<button class="tab tab-nova ${S.template === "Nova" ? "active" : ""}" data-nova="1"><svg class="icon" viewBox="0 0 24 24" style="margin-right:6px; vertical-align:-3px; width:14px; height:14px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Montar do zero</button>`;
        // ===== Tarefa 3: edicao de modelos (Conservadora/Moderada/Sofisticada) =====
        var ehBase = !!TEMPLATES_FACTORY[S.template];
        var temOv = ehBase && hasTplOverride(S.template);
        h += `<div style="margin-left:auto;display:flex;gap:8px;flex-wrap:wrap;align-items:center">`;
        // ===== visao: carteira com produtos x apenas classes de ativo =====
        var _cvB =
          "font-family:inherit;font-weight:700;font-size:12px;padding:6px 12px;border-radius:8px;border:none;cursor:pointer;transition:all .15s;";
        h +=
          '<div title="Produtos: carteira completa com os ativos. Classes: mesma proporção, só por classe de ativo." style="display:inline-flex;gap:4px;background:rgba(0,0,0,.28);border:1px solid rgba(120,130,210,.22);border-radius:10px;padding:3px;align-items:center">' +
          '<span style="font-size:10px;font-weight:800;letter-spacing:.6px;color:#8089BE;padding:0 4px 0 8px;text-transform:uppercase">Visão</span>' +
          '<button type="button" data-cview="produtos" style="' +
          _cvB +
          (CTOR_VIEW === "produtos"
            ? "background:#F26522;color:#fff;"
            : "background:transparent;color:#A9B0D6;") +
          '">Produtos</button>' +
          '<button type="button" data-cview="classes" style="' +
          _cvB +
          (CTOR_VIEW === "classes"
            ? "background:#F26522;color:#fff;"
            : "background:transparent;color:#A9B0D6;") +
          '">Classes</button>' +
          "</div>";
        // ===== carteira: os 85% em R$ x os 15% em US$ =====
        h +=
          '<div title="Brasil: os 85% da carteira em reais. Global: os 15% em dólar, com o peso único da XP (não muda por perfil)." style="display:inline-flex;gap:4px;background:rgba(0,0,0,.28);border:1px solid rgba(120,130,210,.22);border-radius:10px;padding:3px;align-items:center">' +
          '<span style="font-size:10px;font-weight:800;letter-spacing:.6px;color:#8089BE;padding:0 4px 0 8px;text-transform:uppercase">Carteira</span>' +
          '<button type="button" data-ccart="brasil" style="' +
          _cvB +
          (CTOR_CART === "brasil"
            ? "background:#F26522;color:#fff;"
            : "background:transparent;color:#A9B0D6;") +
          '">Brasil 85%</button>' +
          '<button type="button" data-ccart="global" style="' +
          _cvB +
          (CTOR_CART === "global"
            ? "background:#F26522;color:#fff;"
            : "background:transparent;color:#A9B0D6;") +
          '">Global 15%</button>' +
          "</div>";
        if (CTOR_CART === "global") {
          h +=
            '<span style="font-size:10.5px;font-weight:700;color:#94ACEC;background:rgba(148,172,236,.12);border:1px solid rgba(148,172,236,.3);border-radius:8px;padding:6px 10px">Peso único · igual nos três perfis</span>';
        }
        if (ehBase && (CTOR_VIEW === "classes" || CTOR_CART === "global")) {
          /* mantem o botao no lugar (so desabilitado) para a barra nao mudar de tamanho */
          h += `<button class="tab" disabled style="opacity:.42;cursor:not-allowed" title="A edicao de modelo so esta disponivel na visao Produtos">
          <svg class="icon" viewBox="0 0 24 24" style="margin-right:6px; vertical-align:-3px; width:14px; height:14px;"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>Editar modelo</button>`;
        } else if (ehBase && S.editandoTemplate === S.template) {
          // modo edicao ativo: salvar / cancelar
          h += `<span style="font-size:11px;font-weight:800;letter-spacing:.5px;color:#FFB020;display:inline-flex;align-items:center;gap:6px;background:rgba(255,176,32,.12);border:1px solid rgba(255,176,32,.4);border-radius:8px;padding:7px 11px">
          <svg class="icon" viewBox="0 0 24 24" style="width:13px;height:13px;stroke:#FFB020"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
          Editando modelo ${esc(S.template)}</span>`;
          h += `<button class="tab tab-nova active" data-tplsave="1">Salvar modelo</button>`;
          h += `<button class="tab" data-tplcancel="1">Cancelar</button>`;
        } else if (ehBase) {
          h += `<button class="tab" data-tpledit="1" title="Editar este modelo e salvar para usar em todo o site">
          <svg class="icon" viewBox="0 0 24 24" style="margin-right:6px; vertical-align:-3px; width:14px; height:14px;"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>Editar modelo</button>`;
        }
        h += `<button class="tab" data-restore="1">
        <svg class="icon" viewBox="0 0 24 24" style="margin-right:6px; vertical-align:-3px; width:14px; height:14px;"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>Restaurar template</button>`;
        h += `</div>`;
        el.innerHTML = h;
        el.querySelectorAll("[data-tpl]").forEach(
          (b) => (b.onclick = () => loadTemplate(b.dataset.tpl)),
        );
        el.querySelectorAll("[data-cview]").forEach(
          (b) =>
            (b.onclick = () => {
              var v = b.getAttribute("data-cview");
              if (v === CTOR_VIEW) return;
              CTOR_VIEW = v;
              try {
                window.hubStorage.setItem("hubCtorView", v);
              } catch (_) {}
              S.editandoTemplate = null;
              if (TEMPLATES[S.template]) loadTemplate(S.template);
              else render();
            }),
        );
        el.querySelectorAll("[data-ccart]").forEach(
          (b) =>
            (b.onclick = () => {
              var v = b.getAttribute("data-ccart");
              if (v === CTOR_CART) return;
              CTOR_CART = v;
              try {
                window.hubStorage.setItem("hubCtorCart", v);
              } catch (_) {}
              S.editandoTemplate = null;
              if (TEMPLATES[S.template]) loadTemplate(S.template);
              else render();
            }),
        );
        const atualBtn = el.querySelector("[data-atual]");
        if (atualBtn) atualBtn.onclick = () => loadAtual();
        const novaBtn = el.querySelector("[data-nova]");
        if (novaBtn) novaBtn.onclick = () => loadNova();
        el.querySelector("[data-restore]").onclick = () => {
          S.editandoTemplate = null;
          if (S.template === "Nova") loadNova();
          else
            loadTemplate(
              S.template === "Atual" ? S.recomendadaTemplate : S.template,
            );
        };
        // ----- Tarefa 3: handlers de edicao de modelo -----
        var bEdit = el.querySelector("[data-tpledit]");
        if (bEdit)
          bEdit.onclick = () => {
            S.editandoTemplate = S.template;
            render();
          };
        var bCancel = el.querySelector("[data-tplcancel]");
        if (bCancel)
          bCancel.onclick = () => {
            S.editandoTemplate = null;
            if (TEMPLATES_FACTORY[S.template]) loadTemplate(S.template);
            else render();
          };
        var bSave = el.querySelector("[data-tplsave]");
        if (bSave)
          bSave.onclick = () => {
            if (bSave.disabled) return; // evita duplo-clique / reentrancia
            bSave.disabled = true;
            var nome = S.template;
            var ok = false;
            try {
              ok = setTplOverride(nome, S.items);
            } catch (_) {
              ok = false;
            }
            S.editandoTemplate = null;
            try {
              if (ok) {
                alert(
                  'Modelo "' +
                    nome +
                    '" salvo. Essa versao sera usada em todo o site neste navegador.',
                );
              } else {
                alert(
                  'Nao foi possivel salvar o modelo "' +
                    nome +
                    '". Verifique os ativos e tente novamente.',
                );
              }
            } catch (_) {}
            render();
          };
        var bFactory = el.querySelector("[data-tplfactory]");
        if (bFactory)
          bFactory.onclick = () => {
            var nome = S.template;
            var ok = true;
            try {
              ok = confirm(
                'Reverter o modelo "' +
                  nome +
                  '" para a versao de fabrica? Sua versao editada sera descartada.',
              );
            } catch (_) {}
            if (!ok) return;
            try {
              clearTplOverride(nome);
            } catch (_) {}
            S.editandoTemplate = null;
            loadTemplate(nome);
          };
      }

      function loadTemplate(t) {
        histGuardar("template");
        S.template = t;
        S.recomendadaTemplate = t;
        S.saidas = [];
        S.items =
          CTOR_CART === "global"
            ? GLOBAL_TEMPLATE()
            : CTOR_VIEW === "classes" && GENERIC_TEMPLATES[t]
              ? GENERIC_TEMPLATES[t]()
              : TEMPLATES[t]();
        ctorFixIds();
        S.cdiMult = CDI_MULT[t];
        render();
      }
      function loadNova() {
        histGuardar("nova");
        S.template = "Nova";
        S.recomendadaTemplate = "Moderada";
        S.saidas = [];
        S.items = [];
        S.cdiMult = CDI_MULT.Moderada;
        render();
      }

      /* Carrega a carteira ATUAL do cliente (posição importada) na tela do construtor */
      function loadAtual() {
        if (!S.posicaoAtual || !S.posicaoAtual.comp) return;
        histGuardar("atual");
        S.template = "Atual";
        S.saidas = [];
        S.items = itensDaPosicao(S.posicaoAtual);
        if (S.posicaoAtual.patrimonio) S.patrimonio = S.posicaoAtual.patrimonio;
        if (S.posicaoAtual.conta && (!S.cliente || /^Conta /.test(S.cliente)))
          S.cliente = "Conta " + S.posicaoAtual.conta;
        // mantém o cdiMult do template recomendado como referência (a carteira atual não tem retorno projetado próprio)
        render();
      }

      /* Composição (categoria -> %) dos itens de um template */
      function compDeItens(items) {
        const cats = {};
        let total = 0;
        items.forEach((it) => {
          const c = it.classe;
          const p = Number(it.pct) || 0;
          cats[c] = (cats[c] || 0) + p;
          total += p;
        });
        const comp = {};
        CLASSES.forEach((c) => {
          comp[c] = total > 0 ? ((cats[c] || 0) / total) * 100 : 0;
        });
        return comp;
      }
      function calcAderenciaPct(atual, rec) {
        let soma = 0;
        CLASSES.forEach((c) => {
          soma += Math.abs((atual[c] || 0) - (rec[c] || 0));
        });
        return Math.max(0, 100 - soma / 2);
      }
      function aderenciaCor(s) {
        return s >= 75 ? "#3DD68C" : s >= 50 ? "#FFB020" : "#FF6B6B";
      }
      function aderenciaLabel(s) {
        return s >= 75
          ? "Alta aderência"
          : s >= 50
            ? "Aderência moderada"
            : "Baixa aderência";
      }

      function renderAderencia(D) {
        const card = document.getElementById("aderenciaCard");
        if (!card) return;
        // só mostra na aba "Atual"
        if (S.template !== "Atual" || !S.posicaoAtual) {
          card.style.display = "none";
          return;
        }
        card.style.display = "block";

        const atual = compDeItens(S.items);
        const recTpl = S.recomendadaTemplate || "Moderada";
        const rec = compDeItens(TEMPLATES[recTpl]());
        const score = calcAderenciaPct(atual, rec);
        const col = aderenciaCor(score);

        // donut
        const r = 46,
          cx = 58,
          cy = 58,
          circ = 2 * Math.PI * r,
          off = circ * (1 - Math.min(100, score) / 100);
        const donut = `<svg viewBox="0 0 116 116" style="width:116px;height:116px;transform:rotate(-90deg)">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="11"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${col}" stroke-width="11" stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${off}"/>
    </svg>`;

        // maior gap
        let maxCat = null,
          maxGap = 0;
        CLASSES.forEach((c) => {
          const g = (rec[c] || 0) - (atual[c] || 0);
          if (Math.abs(g) > Math.abs(maxGap)) {
            maxGap = g;
            maxCat = c;
          }
        });
        let gapTxt = "";
        if (maxCat && Math.abs(maxGap) >= 1) {
          const verbo = maxGap > 0 ? "aumentar" : "reduzir";
          gapTxt = `<div style="margin-top:10px;font-size:12px;color:#9AA2D0;line-height:1.5">Maior ajuste p/ chegar na <b style="color:#cfd4ef">${recTpl}</b>: <b style="color:${CLASS_COLORS[maxCat] || "#fff"}">${verbo} ${window.__hubClassLabel ? window.__hubClassLabel(maxCat) : maxCat}</b> em ${fmtPct(Math.abs(maxGap))} p.p.</div>`;
        }

        // mini comparação por categoria (atual vs ideal)
        let bars = "";
        CLASSES.forEach((c) => {
          const a = atual[c] || 0,
            rr = rec[c] || 0;
          if (a < 0.05 && rr < 0.05) return;
          const cc = CLASS_COLORS[c] || "#8A93D8";
          bars += `<div style="margin-bottom:9px">
      <div style="display:flex;justify-content:space-between;font-size:11.5px;margin-bottom:3px">
        <span style="color:#cfd4ef;font-weight:600">${c}</span>
        <span style="color:#9AA2D0">atual <b style="color:${cc}">${fmtPct(a)}%</b> · ideal <b style="color:#cfd4ef">${fmtPct(rr)}%</b></span>
      </div>
      <div style="position:relative;height:6px;background:rgba(255,255,255,.06);border-radius:4px">
        <div style="position:absolute;left:0;top:0;height:100%;width:${Math.min(100, a)}%;background:${cc};border-radius:4px;opacity:.85"></div>
        <div style="position:absolute;top:-2px;height:10px;width:2px;background:#fff;left:calc(${Math.min(100, rr)}% - 1px);border-radius:2px" title="ideal"></div>
      </div>
    </div>`;
        });

        const _profs = ["Conservadora", "Moderada", "Sofisticada"];
        const _pscore = {};
        _profs.forEach((t) => {
          _pscore[t] = calcAderenciaPct(atual, compDeItens(TEMPLATES[t]()));
        });
        let _best = _profs[0];
        _profs.forEach((t) => {
          if (_pscore[t] > _pscore[_best]) _best = t;
        });
        const _selHTML =
          '<div style="display:flex;gap:7px;flex-wrap:wrap;align-items:center;margin-bottom:14px">' +
          '<span style="font-size:11px;color:#9AA2D0;font-weight:700">Carteira ideal:</span>' +
          _profs
            .map(function (t) {
              var on = t === recTpl;
              var c = aderenciaCor(_pscore[t]);
              return (
                '<button data-rectpl="' +
                t +
                '" style="cursor:pointer;font-family:inherit;font-size:11.5px;font-weight:700;border-radius:8px;padding:5px 10px;border:1px solid ' +
                (on ? "#36C5F0" : "rgba(120,130,210,.3)") +
                ";background:" +
                (on ? "rgba(54,197,240,.14)" : "rgba(255,255,255,.04)") +
                ";color:" +
                (on ? "#fff" : "#cfd4ef") +
                '">' +
                t +
                ' <span style="color:' +
                c +
                ';font-weight:800">' +
                fmtPct(_pscore[t]) +
                "%</span>" +
                (t === _best
                  ? ' <span style="color:#3DD68C" title="Maior aderência">★</span>'
                  : "") +
                "</button>"
              );
            })
            .join("") +
          "</div>";
        card.innerHTML =
          `<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
      <svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:#36C5F0;fill:none;stroke-width:2"><path d="M22 12A10 10 0 1 1 12 2"/><path d="M22 2 12 12"/><path d="M16 2h6v6"/></svg>
      <span style="color:#A9B0D6;font-weight:700;font-size:13px;letter-spacing:1px">ADERÊNCIA À CARTEIRA IDEAL</span>
    </div>` +
          _selHTML +
          `
    <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;margin-bottom:16px">
      <div style="position:relative;width:116px;height:116px;flex-shrink:0">${donut}
        <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
          <div style="font-family:Sora;font-weight:800;font-size:26px;color:${col}">${fmtPct(score)}%</div>
          <div style="font-size:9px;color:#9AA2D0;font-weight:700;letter-spacing:.5px;text-transform:uppercase">aderência</div>
        </div>
      </div>
      <div style="flex:1;min-width:150px">
        <div style="font-family:Sora;font-weight:800;font-size:18px;color:${col};margin-bottom:4px">${aderenciaLabel(score)}</div>
        <div style="color:#cfd4ef;font-size:12.5px;line-height:1.5">vs. carteira <b style="color:#cfd4ef">${recTpl}</b> recomendada. Quanto maior, menos ajustes para chegar à alocação ideal.</div>
        ${gapTxt}
      </div>
    </div>
    <div style="border-top:1px solid rgba(120,130,210,.18);padding-top:14px">
      <div style="font-size:10.5px;letter-spacing:1px;text-transform:uppercase;color:#9AA2D0;font-weight:700;margin-bottom:10px">Atual <span style="color:#6F77A8">(barra)</span> vs. ideal <span style="color:#6F77A8">(marca branca)</span></div>
      ${bars}
    </div>`;
        card.querySelectorAll("[data-rectpl]").forEach(function (b) {
          b.onclick = function () {
            S.recomendadaTemplate = b.getAttribute("data-rectpl");
            const D3 = calc();
            renderRetorno(D3);
            renderAderencia(D3);
          };
        });
      }

      /* ===== UI da seção "Retorno" de cada ativo (Parte A) ===== */
      function retornoSectionHTML(it) {
        ensureRetorno(it);
        const cat = it.retCat;
        let selOpts = "";
        RET_CATS.forEach(function (rc) {
          selOpts +=
            '<option value="' +
            rc +
            '" ' +
            (cat === rc ? "selected" : "") +
            ">" +
            RET_CAT_LABELS[rc] +
            "</option>";
        });
        // toggle isento (reutilizado por pre/pos/inflacao)
        function isentoToggle() {
          return (
            '<button type="button" class="ret-isento' +
            (it.retIsento ? " on" : "") +
            '" data-retisento="' +
            it.id +
            '" title="Isento de Imposto de Renda">' +
            '<span class="ret-iso-dot"></span>' +
            (it.retIsento ? "Isento de IR" : "Tributado") +
            "</button>"
          );
        }
        let cond = "";
        if (cat === "pre") {
          cond =
            '<div class="ret-row">' +
            '<div class="ret-inp"><span class="ret-pre">Retorno</span><input class="ret-num num" type="number" step="0.1" value="' +
            (it.retVal || 0) +
            '" data-retval="' +
            it.id +
            '"><span class="ret-suf">% a.a.</span></div>' +
            isentoToggle() +
            "</div>";
        } else if (cat === "pos") {
          cond =
            '<div class="ret-row">' +
            '<div class="ret-inp"><input class="ret-num num" type="number" step="1" value="' +
            (it.retVal || 0) +
            '" data-retval="' +
            it.id +
            '"><span class="ret-suf">% do CDI</span></div>' +
            isentoToggle() +
            "</div>";
        } else if (cat === "mercado") {
          var _hasM = it.retMercado != null && it.retMercado !== "";
          cond =
            '<div class="ret-row"><span class="ret-chip">Mercado</span>' +
            '<div class="ret-inp ret-inp-user' +
            (_hasM ? " on" : "") +
            '" title="Retorno informado por você (ativo a mercado)"><span class="ret-pre">Retorno</span><input class="ret-num num" type="number" step="0.1" placeholder="' +
            (Number(CTOR_MERCADO) || 0) +
            '" value="' +
            (_hasM ? it.retMercado : "") +
            '" data-retmercado="' +
            it.id +
            '"><span class="ret-suf">% a.a.</span></div>' +
            '<span class="ret-hint">' +
            (_hasM
              ? "valor informado por você"
              : "em branco = premissa de mercado") +
            "</span></div>";
        } else if (cat === "mercadoDiv") {
          var _hasM2 = it.retMercado != null && it.retMercado !== "";
          cond =
            '<div class="ret-row"><span class="ret-chip">Mercado</span>' +
            '<div class="ret-inp ret-inp-user' +
            (_hasM2 ? " on" : "") +
            '" title="Retorno informado por você (ativo a mercado)"><span class="ret-pre">Retorno</span><input class="ret-num num" type="number" step="0.1" placeholder="' +
            (Number(CTOR_MERCADO) || 0) +
            '" value="' +
            (_hasM2 ? it.retMercado : "") +
            '" data-retmercado="' +
            it.id +
            '"><span class="ret-suf">% a.a.</span></div>' +
            '<div class="ret-inp"><span class="ret-pre">+ Dividendo</span><input class="ret-num num" type="number" step="0.1" value="' +
            (it.retDiv || 0) +
            '" data-retdiv="' +
            it.id +
            '"><span class="ret-suf">% DY a.a.</span></div></div>';
        } else if (cat === "inflacao") {
          cond =
            '<div class="ret-row">' +
            '<div class="ret-inp"><span class="ret-pre">IPCA +</span><input class="ret-num num" type="number" step="0.1" value="' +
            (it.retVal || 0) +
            '" data-retval="' +
            it.id +
            '"><span class="ret-suf">% a.a.</span></div>' +
            isentoToggle() +
            "</div>";
        }
        // resumo do retorno estimado
        var resumo = ativoRetSummary(it);
        return (
          '<div class="ret-box" data-retbox="' +
          it.id +
          '">' +
          '<div class="ret-head"><span class="ret-lbl">Retorno</span>' +
          '<select class="ret-sel sel" data-retcat="' +
          it.id +
          '">' +
          selOpts +
          "</select>" +
          '<span class="ret-summary" data-retsum="' +
          it.id +
          '">' +
          esc(resumo) +
          "</span></div>" +
          cond +
          "</div>"
        );
      }

      /* "≈ R$ X" e, na comparacao, quanto pesava antes */
      function vhintTexto(i) {
        var t = "≈ R$ " + fmtBRL((S.patrimonio * (Number(i.pct) || 0)) / 100);
        if (modoComparacao() && pesoMudou(i)) {
          var d = (Number(i.pct) || 0) - Number(i.pctAtual);
          t +=
            " · era " + fmtPct(i.pctAtual) + "% (" + (d > 0 ? "+" : "−") +
            fmtPct(Math.abs(d)) + " p.p.)";
        }
        return t;
      }
      function renderEditor(D) {
        const el = document.getElementById("editor");
        const cmp = modoComparacao();
        let h = "";
        if (!S.items.length) {
          h +=
            '<div style="padding:24px 18px;text-align:center;color:#9AA2D0;font-size:13.5px;line-height:1.6;border:1px dashed rgba(120,130,210,.3);border-radius:14px;margin-bottom:10px">Carteira em branco. Monte do zero adicionando ativos da <b style="color:#FF8B52">biblioteca</b>: use o <b style="color:#FF8B52">Catálogo de operações</b> abaixo (botão “+ Add”), o “Adicionar ativo” ou os atalhos de “Adicionar rápido”.</div>';
        }
        CLASSES.forEach((c) => {
          const list = D.grouped[c];
          if (!list || list.length === 0) return;
          h += `<div style="margin-bottom:18px;">
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
        <span style="width:12px; height:12px; border-radius:4px; background:${CLASS_COLORS[c]};"></span>
        <span style="font-weight:700; font-size:15px;">${window.__hubClassLabel ? window.__hubClassLabel(c) : c}</span>
        <span data-classpct="${c}" style="color:#A9B0D6; font-weight:700; font-size:13px;">${fmtPct(D.byClass[c])}%</span>
      </div>`;
          list.forEach((i) => {
            if (!Array.isArray(i.tags)) i.tags = defaultTags(i);
            let tags = "";
            i.tags.forEach((label, ti) => {
              const kind = tagKind(label);
              tags += `<span class="tag tag-${kind} tag-drag" draggable="true" data-tag-item="${i.id}" data-tag-idx="${ti}" title="Arraste para outro ativo ou solte na lixeira para remover">${esc(label)}</span>`;
            });
            let optsHtml = "";
            if (i.opcoes) {
              optsHtml = `<div style="display:flex; gap:6px; margin-top:9px; flex-wrap:wrap; align-items:center;">
          <span style="font-size:11px; color:#6F77A8; font-weight:700; text-transform:uppercase; letter-spacing:.5px;">Cliente escolhe:</span>`;
              i.opcoes.forEach((o, idx) => {
                optsHtml += `<button class="opt-btn ${i.escolha === idx ? "active" : ""}" data-opt="${i.id}" data-idx="${idx}">${esc(o.rotulo)}</button>`;
              });
              optsHtml += `</div>`;
            }
            let menuChips = "";
            ALL_TAGS.forEach((lbl) => {
              if (i.tags.indexOf(lbl) === -1) {
                menuChips += `<button class="tag tag-${tagKind(lbl)} tag-menu-chip" data-addchip="${i.id}" data-label="${esc(lbl)}">+ ${esc(lbl)}</button>`;
              }
            });
            const tagsHtml = `<div class="tag-zone" data-tagzone="${i.id}" style="display:flex; gap:6px; margin-top:9px; flex-wrap:wrap; min-height:26px; align-items:center;">${tags}<span class="tag-add" data-addtag="${i.id}" title="Adicionar tag">+</span></div><div class="tag-menu" data-tagmenu="${i.id}" style="display:none; gap:6px; flex-wrap:wrap; margin-top:8px; padding:8px; border-radius:10px; background:rgba(10,14,50,.6); border:1px solid rgba(120,130,210,.18);">${menuChips || '<span style="color:#6F77A8;font-size:12px">Todas as tags já adicionadas</span>'}</div>`;
            let selOpts = "";
            CLASSES.forEach(
              (cl) =>
                (selOpts += `<option value="${cl}" ${i.classe === cl ? "selected" : ""}>${window.__hubClassLabel ? window.__hubClassLabel(cl) : cl}</option>`),
            );
            h += `<div class="item" data-item="${i.id}">
        <div style="display:flex; gap:8px; align-items:center;">
          <span class="item-drag" draggable="true" data-itemdrag="${i.id}" title="Arraste para reordenar">⠿</span>
          <div class="pct-wrap">
            <input class="pct-input num" type="text" inputmode="decimal" value="${String(i.pct).replace(".", ",")}" data-f="pct" data-id="${i.id}">
            <span class="pct-suffix">%</span>
          </div>
          ${cmp && i.origem === "atual" ? '<span class="orig-badge orig-atual" title="Já está na carteira do cliente">Atual</span>' : ""}${cmp && i.origem === "novo" ? '<span class="orig-badge orig-novo" title="Entra na proposta">Novo</span>' : ""}
          <input class="name-input" value="${esc(i.nome)}" data-f="nome" data-id="${i.id}">
          <select class="sel" data-f="classe" data-id="${i.id}">${selOpts}</select>
          <button class="del-btn" data-del="${i.id}"><svg class="icon" viewBox="0 0 24 24" style="width:15px;height:15px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
        </div>
        ${window.__xpAssetLink ? window.__xpAssetLink(i) : ""}
        ${optsHtml}
        ${tagsHtml}
        <input class="det-input" value="${esc(i.detalhe)}" placeholder="Detalhe (estrutura, prazo, taxa…)" data-f="detalhe" data-id="${i.id}">
        ${retornoSectionHTML(i)}
        ${i.catalogOp ? `<button type="button" class="op-how-btn" data-howtoggle="${i.id}">${i._howOpen ? "▴" : "▾"} Como funciona a operação</button><div class="op-how-body" data-howbody="${i.id}" style="display:${i._howOpen ? "block" : "none"}">${i._howOpen && window.__opPayoffHTML ? window.__opPayoffHTML(i.catalogOp) : ""}</div>` : ""}
        <div class="vhint" data-vhint="${i.id}" style="font-size:12px; color:#6F77A8; margin-top:4px;">${vhintTexto(i)}</div>
      </div>`;
          });
          h += `</div>`;
        });
        /* o que saiu da carteira do cliente: fica a vista e da para voltar */
        if (cmp && Array.isArray(S.saidas) && S.saidas.length) {
          h += `<div class="saidas-box"><div class="saidas-tit">Saem da carteira <span>${S.saidas.length}</span></div>`;
          S.saidas.forEach((sd, idx) => {
            h += `<div class="saida-row"><span class="saida-dot" style="background:${CLASS_COLORS[sd.classe] || "#8A93D8"}"></span><span class="saida-nome">${esc(sd.nome)}</span><span class="saida-pct">${fmtPct(sd.pct)}%</span><button type="button" class="saida-voltar" data-voltar="${idx}" title="Devolver à proposta">↩ voltar</button></div>`;
          });
          h += `</div>`;
        }
        el.innerHTML = h;
        // listeners
        el.querySelectorAll("[data-f]").forEach((inp) => {
          const id = inp.dataset.id,
            f = inp.dataset.f;
          const ev = f === "classe" ? "change" : "input";
          inp.addEventListener(ev, () => {
            const it = S.items.find((x) => x.id === id);
            if (!it) return;
            it[f] = f === "pct" ? _parseNum(inp.value) : inp.value;
            window.__xpUpdateLink?.(inp.closest('.item'), it);
            if (f === "pct") {
              updateLight();
            } else if (f === "classe") {
              render();
            } else {
              /* nome/detalhe: só atualiza derivados leves sem reconstruir o input em foco */ updateLight();
            }
            ctorPersist(); // Tarefa 2: persiste edicao de nome/pct/detalhe/classe
          });
        });
        el.querySelectorAll("[data-opt]").forEach((b) => {
          b.onclick = () => {
            const it = S.items.find((x) => x.id === b.dataset.opt);
            if (!it) return;
            const idx = Number(b.dataset.idx);
            it.escolha = idx;
            it.nome = it.opcoes[idx].nome;
            it.detalhe = it.opcoes[idx].detalhe;
            it.liquidez = it.opcoes[idx].liquidez || "";
            render();
          };
        });
        el.querySelectorAll("[data-del]").forEach((b) => {
          b.onclick = () => {
            if (modoComparacao())
              registrarSaida(S.items.find((x) => x.id === b.dataset.del));
            S.items = S.items.filter((x) => x.id !== b.dataset.del);
            render();
          };
        });
        el.querySelectorAll("[data-voltar]").forEach((b) => {
          b.onclick = () => {
            desfazerSaida(Number(b.dataset.voltar));
            render();
          };
        });
        // ===== Retorno por ativo (Parte A) =====
        function rebuildRetBox(it) {
          const box = el.querySelector('[data-retbox="' + it.id + '"]');
          if (!box) return;
          const wrap = document.createElement("div");
          wrap.innerHTML = retornoSectionHTML(it);
          const novo = wrap.firstChild;
          box.parentNode.replaceChild(novo, box);
          bindRetBox(it.id);
          updateLight();
        }
        function bindRetBox(id) {
          const it = S.items.find((x) => x.id === id);
          if (!it) return;
          const sel = el.querySelector('[data-retcat="' + id + '"]');
          if (sel)
            sel.addEventListener("change", function () {
              it.retCat = sel.value;
              rebuildRetBox(it);
              ctorPersist();
            });
          const v = el.querySelector('[data-retval="' + id + '"]');
          if (v)
            v.addEventListener("input", function () {
              it.retVal = Number(v.value) || 0;
              const s = el.querySelector('[data-retsum="' + id + '"]');
              if (s) s.textContent = ativoRetSummary(it);
              updateLight();
              ctorPersist();
            });
          const dv = el.querySelector('[data-retdiv="' + id + '"]');
          if (dv)
            dv.addEventListener("input", function () {
              it.retDiv = Number(dv.value) || 0;
              const s = el.querySelector('[data-retsum="' + id + '"]');
              if (s) s.textContent = ativoRetSummary(it);
              updateLight();
              ctorPersist();
            });
          const mv = el.querySelector('[data-retmercado="' + id + '"]');
          if (mv)
            mv.addEventListener("input", function () {
              var raw = mv.value.trim();
              it.retMercado = raw === "" ? null : Number(raw.replace(",", "."));
              var wr = mv.closest(".ret-inp-user");
              if (wr) {
                if (raw === "") wr.classList.remove("on");
                else wr.classList.add("on");
              }
              var s = el.querySelector('[data-retsum="' + id + '"]');
              if (s) s.textContent = ativoRetSummary(it);
              var hn = mv.closest(".ret-row");
              if (hn) {
                var hint = hn.querySelector(".ret-hint");
                if (hint)
                  hint.textContent =
                    raw === ""
                      ? "em branco = premissa de mercado"
                      : "valor informado por você";
              }
              updateLight();
              ctorPersist();
            });
          const iso = el.querySelector('[data-retisento="' + id + '"]');
          if (iso)
            iso.onclick = function () {
              it.retIsento = !it.retIsento;
              rebuildRetBox(it);
              ctorPersist();
            };
        }
        S.items.forEach(function (it) {
          bindRetBox(it.id);
        });
        if (!el.__libDropBound) {
          el.__libDropBound = true;
          el.addEventListener("dragover", function (e) {
            if (window.__libDrag != null) {
              e.preventDefault();
              el.classList.add("lib-drop");
            }
          });
          el.addEventListener("dragleave", function (e) {
            if (e.target === el) el.classList.remove("lib-drop");
          });
          el.addEventListener("drop", function (e) {
            if (window.__libDrag == null) return;
            e.preventDefault();
            el.classList.remove("lib-drop");
            var a = window.__LIBDATA && window.__LIBDATA[window.__libDrag];
            window.__libDrag = null;
            if (a && window.__ctorAddAtivo) {
              var bop = a.bova ? window.__BOVA_OP : null;
              window.__ctorAddAtivo(
                a.classe,
                a.nome,
                a.detalhe,
                a.liq,
                !!bop,
                bop,
              );
            }
          });
        }
        el.querySelectorAll("[data-itemdrag]").forEach(function (h) {
          h.addEventListener("dragstart", function (e) {
            window.__itemDrag = h.getAttribute("data-itemdrag");
            try {
              e.dataTransfer.setData("text/plain", "item");
              e.dataTransfer.effectAllowed = "move";
            } catch (_) {}
          });
          h.addEventListener("dragend", function () {
            window.__itemDrag = null;
          });
        });
        el.querySelectorAll(".item").forEach(function (it) {
          it.addEventListener("dragover", function (e) {
            if (window.__itemDrag) e.preventDefault();
          });
          it.addEventListener("drop", function (e) {
            if (!window.__itemDrag) return;
            e.preventDefault();
            var fromId = window.__itemDrag,
              toId = it.getAttribute("data-item");
            window.__itemDrag = null;
            if (!toId || fromId === toId) return;
            var fi = S.items.findIndex(function (z) {
                return z.id === fromId;
              }),
              ti = S.items.findIndex(function (z) {
                return z.id === toId;
              });
            if (fi < 0 || ti < 0) return;
            var mv = S.items.splice(fi, 1)[0];
            var nti = S.items.findIndex(function (z) {
              return z.id === toId;
            });
            S.items.splice(nti, 0, mv);
            render();
          });
        });
        el.querySelectorAll("[data-addtag]").forEach((b) => {
          b.onclick = (e) => {
            e.stopPropagation();
            const m = el.querySelector(
              '[data-tagmenu="' + b.dataset.addtag + '"]',
            );
            if (m)
              m.style.display = m.style.display === "none" ? "flex" : "none";
          };
        });
        el.querySelectorAll("[data-addchip]").forEach((b) => {
          b.onclick = () => {
            addTag(b.dataset.addchip, b.dataset.label);
          };
        });
        el.querySelectorAll("[data-howtoggle]").forEach((b) => {
          b.onclick = () => {
            const it = S.items.find((x) => x.id === b.dataset.howtoggle);
            if (!it) return;
            it._howOpen = !it._howOpen;
            const body = el.querySelector(
              '[data-howbody="' + b.dataset.howtoggle + '"]',
            );
            if (!body) return;
            if (it._howOpen) {
              body.innerHTML = window.__opPayoffHTML
                ? window.__opPayoffHTML(it.catalogOp)
                : "";
              body.style.display = "block";
              b.textContent = "▴ Como funciona a operação";
            } else {
              body.style.display = "none";
              body.innerHTML = "";
              b.textContent = "▾ Como funciona a operação";
            }
          };
        });

        // ===== TAGS ARRASTÁVEIS =====
        const trash = document.getElementById("tagTrash");
        let dragInfo = null; // { fromId, idx, label }

        el.querySelectorAll(".tag-drag").forEach((tag) => {
          tag.addEventListener("dragstart", (e) => {
            const fromId = tag.dataset.tagItem;
            const idx = Number(tag.dataset.tagIdx);
            const it = S.items.find((x) => x.id === fromId);
            const label = it && it.tags ? it.tags[idx] : tag.textContent.trim();
            dragInfo = { fromId, idx, label };
            e.dataTransfer.effectAllowed = "move";
            try {
              e.dataTransfer.setData("text/plain", label);
            } catch (_) {}
            tag.classList.add("dragging");
            if (trash) trash.classList.add("show");
          });
          tag.addEventListener("dragend", () => {
            tag.classList.remove("dragging");
            if (trash) {
              trash.classList.remove("show");
              trash.classList.remove("over");
            }
            el.querySelectorAll(".tag-zone.drop-target").forEach((z) =>
              z.classList.remove("drop-target"),
            );
            dragInfo = null;
          });
        });

        el.querySelectorAll(".tag-zone").forEach((zone) => {
          zone.addEventListener("dragover", (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            zone.classList.add("drop-target");
          });
          zone.addEventListener("dragleave", () => {
            zone.classList.remove("drop-target");
          });
          zone.addEventListener("drop", (e) => {
            e.preventDefault();
            zone.classList.remove("drop-target");
            if (!dragInfo) return;
            const toId = zone.dataset.tagzone;
            moverTag(dragInfo.fromId, dragInfo.idx, toId);
          });
        });

        if (trash) {
          trash.ondragover = (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            trash.classList.add("over");
          };
          trash.ondragleave = () => {
            trash.classList.remove("over");
          };
          trash.ondrop = (e) => {
            e.preventDefault();
            trash.classList.remove("over");
            if (!dragInfo) return;
            removerTag(dragInfo.fromId, dragInfo.idx);
          };
        }
      }

      /* Move uma tag de um ativo para outro (ou reordena no mesmo). Evita duplicar. */
      function moverTag(fromId, idx, toId) {
        const from = S.items.find((x) => x.id === fromId);
        if (!from || !Array.isArray(from.tags)) return;
        const label = from.tags[idx];
        if (label == null) return;
        const to = S.items.find((x) => x.id === toId);
        if (!to) return;
        if (!Array.isArray(to.tags)) to.tags = [];
        // remove da origem
        from.tags.splice(idx, 1);
        // adiciona no destino se ainda não tiver
        if (to.tags.indexOf(label) === -1) to.tags.push(label);
        render();
      }
      /* Remove uma tag (jogou na lixeira / soltou fora) */
      function removerTag(fromId, idx) {
        const from = S.items.find((x) => x.id === fromId);
        if (!from || !Array.isArray(from.tags)) return;
        from.tags.splice(idx, 1);
        render();
      }
      function addTag(toId, label) {
        const it = S.items.find((x) => x.id === toId);
        if (!it) return;
        if (!Array.isArray(it.tags)) it.tags = [];
        if (it.tags.indexOf(label) === -1) it.tags.push(label);
        render();
      }
      window.__ctorAddAtivo = function (
        classe,
        nome,
        detalhe,
        liquidez,
        protecaoFlag,
        op,
      ) {
        try {
          var o = mk(
            classe || "Renda Variável",
            nome || "Operação",
            0,
            detalhe || "",
            liquidez || "No vencimento",
            null,
            !!protecaoFlag,
          );
          if (op) {
            o.catalogOp = op;
            o._howOpen = true;
          }
          S.items.push(marcarNovo(o));
          render();
          return true;
        } catch (e) {
          return false;
        }
      };
      window.__getSimCarteira = function () {
        try {
          return (S.items || [])
            .filter(function (i) {
              return (Number(i.pct) || 0) > 0;
            })
            .map(function (i) {
              return {
                classe: i.classe,
                nome: i.nome,
                detalhe: i.detalhe || "",
                pct: Number(i.pct) || 0,
              };
            });
        } catch (e) {
          return [];
        }
      };
      window.__getSimNome = function () {
        try {
          return S.template === "Atual"
            ? "Carteira do Simulador"
            : S.template + " (Simulador)";
        } catch (e) {
          return "Carteira do Simulador";
        }
      };

      /* atualiza apenas os cards derivados sem reconstruir o editor (mantém foco nos inputs) */
      function updateLight() {
        const D = calc();
        if (D.usarItens) {
          S.cdiMult = Math.round((D.multItens || 0) * 10) / 10;
        }
        renderTotal(D);
        renderRetorno(D);
        renderAlfa(D);
        renderDonut(D);
        renderGloss(D);
        renderProj(D);
        S.items.forEach((i) => {
          const e = document.querySelector('[data-vhint="' + i.id + '"]');
          if (e) e.textContent = vhintTexto(i);
        });
        // Atualiza os subtotais por classe (o cabecalho 'Renda Fixa X%') sem reconstruir os inputs em foco
        document.querySelectorAll("[data-classpct]").forEach((e) => {
          const c = e.getAttribute("data-classpct");
          e.textContent = fmtPct((D.byClass && D.byClass[c]) || 0) + "%";
        });
        publicarCarteira(D);
      }

      function renderTotal(D) {
        const el = document.getElementById("totalCard");
        el.style.borderColor = D.totalOk
          ? "rgba(43,217,166,.5)"
          : "rgba(242,101,34,.5)";
        let h = `<div style="display:flex; justify-content:space-between; align-items:baseline;">
      <span style="color:#A9B0D6; font-weight:700; font-size:13px; letter-spacing:1px;">TOTAL ALOCADO</span>
      <span style="font-weight:800; font-size:30px; color:${D.totalOk ? "#2BD9A6" : ORANGE};">${fmtPct(D.total)}%</span>
    </div>
    <div style="height:8px; background:rgba(255,255,255,.08); border-radius:6px; margin-top:12px; overflow:hidden;">
      <div style="width:${Math.min(D.total, 100)}%; height:100%; background:${D.totalOk ? "#2BD9A6" : ORANGE}; transition:width .2s;"></div>
    </div>`;
        if (!D.totalOk) {
          h += `<div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px;">
      <span style="font-size:13px; color:#A9B0D6;">${D.restante > 0 ? `Faltam ${fmtPct(D.restante)}%` : `Excedeu ${fmtPct(-D.restante)}%`}</span>
      ${D.restante > 0 ? `<button class="mini-btn" id="btnDist">Distribuir igualmente</button>` : ""}
    </div>`;
        }
        el.innerHTML = h;
        const bd = document.getElementById("btnDist");
        if (bd)
          bd.onclick = () => {
            if (S.items.length === 0) return;
            // Distribui 100% igualmente entre os ativos, com soma EXATA de 100,0%.
            // Arredonda cada peso a 1 casa e o ULTIMO ativo absorve o resto.
            const n = S.items.length;
            const base = Math.round((100 / n) * 10) / 10; // ex.: 33,3
            let acc = 0;
            S.items = S.items.map((i, idx) => {
              let v = idx === n - 1 ? Math.round((100 - acc) * 10) / 10 : base;
              acc = Math.round((acc + v) * 10) / 10;
              return { ...i, pct: v };
            });
            render();
          };
      }

      function _parseNum(v) {
        var s = String(v == null ? "" : v)
          .trim()
          .replace(",", ".");
        var n = parseFloat(s);
        return isNaN(n) ? 0 : n;
      }
      function _refreshRetSums() {
        try {
          S.items.forEach(function (it) {
            var s = document.querySelector('[data-retsum="' + it.id + '"]');
            if (s) s.textContent = ativoRetSummary(it);
          });
        } catch (_) {}
      }
      function renderRetorno(D) {
        const el = document.getElementById("retornoCard");
        const isAtual = S.template === "Atual";
        const tituloRet = isAtual
          ? "RETORNO DE REFERÊNCIA · " +
            (S.recomendadaTemplate || "Moderada").toUpperCase()
          : "RETORNO ESTIMADO (BRUTO)";
        const notaAtual = isAtual
          ? `<div style="font-size:11.5px; color:#9AA2D0; margin-top:8px; line-height:1.5; background:rgba(54,197,240,.08); border:1px solid rgba(54,197,240,.25); border-radius:8px; padding:8px 10px;">Esta é a <b style="color:#7FD8F5">posição atual</b> do cliente (diagnóstico). O retorno acima é a referência da carteira <b style="color:#cfd4ef">${S.recomendadaTemplate || "Moderada"}</b> recomendada, não da carteira atual.</div>`
          : "";
        const usar = D.usarItens;
        const multShown = usar ? D.multItens : Number(S.cdiMult) || 0;
        const fonteTxt = usar
          ? 'calculado pelo <b style="color:#2BD9A6">Retorno por ativo</b>'
          : "definido manualmente (% do CDI)";
        var _prof = isAtual ? S.recomendadaTemplate || "Moderada" : S.template;
        var _ipcaSp =
          typeof IPCA_SPREAD !== "undefined" && IPCA_SPREAD[_prof] != null
            ? IPCA_SPREAD[_prof]
            : Math.max(0, (Number(D.retAA) || 0) - (Number(CTOR_IPCA) || 0));
        var _vol =
          typeof VOL_ALVO !== "undefined" && VOL_ALVO[_prof] != null
            ? VOL_ALVO[_prof]
            : null;
        var _rv = S.retView || "ipca";
        var _bigTxt =
          _rv === "ipca"
            ? "IPCA + " + fmtPct(_ipcaSp) + "%"
            : fmtPct(D.retAA) + "%";
        var _subTxt =
          _rv === "ipca"
            ? "retorno esperado a.a." +
              (_vol != null ? " · vol. alvo " + fmtPct(_vol) + "%" : "")
            : "a.a. · " + fmtPct(multShown) + "% do CDI";
        var _tglTxt = _rv === "ipca" ? "ver % do CDI" : "ver IPCA+";
        const _ex = document.getElementById("inpCdi");
        if (_ex) {
          var _t = document.getElementById("retTitulo");
          if (_t) _t.textContent = tituloRet;
          var _a = document.getElementById("retAAval");
          if (_a) _a.textContent = _bigTxt;
          var _m = document.getElementById("retMultlbl");
          if (_m) _m.innerHTML = _subTxt;
          var _tg = document.getElementById("retViewTgl");
          if (_tg) _tg.textContent = _tglTxt;
          var _g = document.getElementById("retGanho");
          if (_g) _g.textContent = "≈ R$ " + fmtBRL(D.ganho12) + " em 12 meses";
          var _f = document.getElementById("retFonte");
          if (_f)
            _f.innerHTML =
              "Retorno " +
              fonteTxt +
              ". <span style='display:block;margin-top:5px;color:#7E87BE;font-size:10.5px;line-height:1.45'>Isentos já com gross-up (líquido ÷ (1-IR)). Rentabilidade estimada — não é garantia de retorno futuro.</span>";
          var _c = document.getElementById("retMultCap");
          if (_c) _c.textContent = "% do CDI " + (usar ? "(auto)" : "(manual)");
          var _n = document.getElementById("retNota");
          if (_n) _n.innerHTML = notaAtual;
          var _u = document.getElementById("inpUsarRet");
          if (_u) _u.checked = !!usar;
          var _mi = document.getElementById("inpMult");
          if (_mi) {
            _mi.disabled = !!usar;
            _mi.style.opacity = usar ? ".5" : "";
            if (document.activeElement !== _mi) _mi.value = fmtPct(multShown);
          }
          if (document.activeElement !== _ex)
            _ex.value = String(S.cdi).replace(".", ",");
          var _ip = document.getElementById("inpIpca");
          if (_ip && document.activeElement !== _ip)
            _ip.value = String(CTOR_IPCA).replace(".", ",");
          return;
        }
        el.innerHTML = `
    <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
      <svg class="icon" viewBox="0 0 24 24" style="color:#2BD9A6;"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
      <span id="retTitulo" style="color:#A9B0D6; font-weight:700; font-size:13px; letter-spacing:1px;">${tituloRet}</span>
    </div>
    <div style="display:flex; align-items:baseline; gap:10px; flex-wrap:wrap;">
      <span id="retAAval" style="font-weight:800; font-size:30px; color:#2BD9A6;">${_bigTxt}</span>
      <span id="retMultlbl" style="color:#A9B0D6; font-size:14px; font-weight:700;">${_subTxt}</span>
      <button id="retViewTgl" type="button" style="margin-left:auto; background:rgba(43,217,166,.12); border:1px solid rgba(43,217,166,.4); color:#8fe9c8; font-size:11px; font-weight:700; padding:4px 9px; border-radius:7px; cursor:pointer;">${_tglTxt}</button>
    </div>
    <div id="retGanho" style="font-size:13px; color:#cfd4ef; margin-top:6px;">≈ R$ ${fmtBRL(D.ganho12)} em 12 meses</div>
    <div id="retFonte" style="font-size:11.5px; color:#8A93D8; margin-top:6px;">Retorno ${fonteTxt}. <span style="display:block;margin-top:5px;color:#7E87BE;font-size:10.5px;line-height:1.45">Isentos já com gross-up (líquido ÷ (1-IR)). Rentabilidade estimada — não é garantia de retorno futuro.</span></div>
    <label style="display:flex; align-items:center; gap:9px; margin-top:12px; cursor:pointer;">
      <input type="checkbox" id="inpUsarRet" ${usar ? "checked" : ""} style="width:16px;height:16px;accent-color:#2BD9A6;cursor:pointer;">
      <span style="font-size:12.5px; color:#cfd4ef; font-weight:700;">Calcular pelo "Retorno" de cada ativo</span>
    </label>
    <div style="display:flex; gap:10px; margin-top:14px;">
      <div style="flex:1;">
        <label class="mini-lbl">CDI (% a.a.)</label>
        <input class="mini-input num" type="text" inputmode="decimal" value="${String(S.cdi).replace(".", ",")}" id="inpCdi">
      </div>
      <div style="flex:1;">
        <label class="mini-lbl">IPCA premissa (% a.a.)</label>
        <input class="mini-input num" type="text" inputmode="decimal" value="${String(CTOR_IPCA).replace(".", ",")}" id="inpIpca">
      </div>
      <div style="flex:1;">
        <label class="mini-lbl" id="retMultCap">% do CDI ${usar ? "(auto)" : "(manual)"}</label>
        <input class="mini-input num" type="text" inputmode="decimal" value="${fmtPct(multShown)}" id="inpMult" ${usar ? 'disabled style="opacity:.5"' : ""}>
      </div>
    </div><div id="retNota">${notaAtual}</div>`;
        document.getElementById("inpCdi").addEventListener("input", (e) => {
          S.cdi = _parseNum(e.target.value);
          updateLight();
          _refreshRetSums();
        });
        document.getElementById("inpIpca").addEventListener("input", (e) => {
          CTOR_IPCA = _parseNum(e.target.value);
          updateLight();
          _refreshRetSums();
        });
        var _tgb = document.getElementById("retViewTgl");
        if (_tgb)
          _tgb.onclick = () => {
            S.retView = S.retView === "cdi" ? "ipca" : "cdi";
            try {
              ctorPersist();
            } catch (e) {}
            updateLight();
          };
        const um = document.getElementById("inpUsarRet");
        if (um)
          um.addEventListener("change", (e) => {
            S.usarRetornoAtivo = !!e.target.checked;
            render();
          });
        const im = document.getElementById("inpMult");
        if (im)
          im.addEventListener("input", (e) => {
            if (!S.usarRetornoAtivo) {
              S.cdiMult = _parseNum(e.target.value);
              updateLight();
            }
          });
      }

      function alfaResultHTML(D) {
        if (D.temCliente) {
          return `<div style="margin-top:14px;">
      <div style="font-weight:800; font-size:25px; color:${D.alphaCDI >= 0 ? "#2BD9A6" : ORANGE}; line-height:1.25;">${(() => {
        var m =
          S.clienteCDI > 0
            ? ((S.cdiMult - S.clienteCDI) / S.clienteCDI) * 100
            : 0;
        return m >= 0
          ? "Melhora de " + fmtPct(m) + "%"
          : "Queda de " + fmtPct(Math.abs(m)) + "%";
      })()}</div>
      <div style="color:#A9B0D6; font-size:13px; font-weight:700; margin-top:2px;">em relação à carteira atual!</div>
      <div style="font-size:12.5px; color:#9AA2D0; margin-top:6px;">${fmtPct(S.clienteCDI)}% → <strong style="color:#fff;">${fmtPct(S.cdiMult)}% do CDI</strong> · ${D.alphaCDI >= 0 ? "+" : ""}${fmtPct(D.alphaCDI)} p.p.</div>
      <div style="display:flex; gap:10px; margin-top:14px;">
        <div style="flex:1; background:rgba(43,217,166,.08); border:1px solid rgba(43,217,166,.3); border-radius:10px; padding:10px 12px;">
          <div style="font-size:11px; color:#A9B0D6; font-weight:700;">Ganho extra · 12 meses</div>
          <div style="font-size:18px; font-weight:800; color:${D.alpha12 >= 0 ? "#2BD9A6" : ORANGE}; margin-top:2px;">${D.alpha12 >= 0 ? "+" : ""}R$ ${fmtBRL(D.alpha12)}</div>
        </div>
        <div style="flex:1; background:rgba(43,217,166,.08); border:1px solid rgba(43,217,166,.3); border-radius:10px; padding:10px 12px;">
          <div style="font-size:11px; color:#A9B0D6; font-weight:700;">Ganho extra · ${S.projAnos} anos</div>
          <div style="font-size:18px; font-weight:800; color:${D.alphaProj >= 0 ? "#2BD9A6" : ORANGE}; margin-top:2px;">${D.alphaProj >= 0 ? "+" : ""}R$ ${fmtBRL(D.alphaProj)}</div>
        </div>
      </div>
    </div>`;
        }
        return `<div style="font-size:12.5px; color:#6F77A8; margin-top:8px; line-height:1.45;">Informe quanto a carteira atual do cliente rende (em % do CDI) para calcular o alfa que sua proposta gera.</div>`;
      }
      function renderAlfa(D) {
        const el = document.getElementById("alfaCard");
        let inner = `
    <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
      <svg class="icon" viewBox="0 0 24 24" style="color:${ORANGE};"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
      <span style="color:#A9B0D6; font-weight:700; font-size:13px; letter-spacing:1px;">ALFA DA ASSESSORIA</span>
    </div>
    <label class="mini-lbl">Carteira ATUAL do cliente rende (% do CDI)</label>
    <div style="position:relative;">
      <input class="mini-input num" type="number" step="1" min="0" placeholder="Ex.: 95" value="${S.clienteCDI || ""}" id="inpClienteCDI" style="font-size:18px; padding-right:30px;">
      <span style="position:absolute; right:12px; top:11px; color:#6F77A8; font-weight:700; font-size:15px;">%</span>
    </div>`;
        inner += `<div id="alfaResult">${alfaResultHTML(D)}</div>`;
        el.innerHTML = inner;
        document
          .getElementById("inpClienteCDI")
          .addEventListener("input", (e) => {
            S.clienteCDI = Number(e.target.value);
            const D2 = calc();
            renderTotal(D2);
            renderRetorno(D2);
            renderDonut(D2);
            renderGloss(D2);
            renderProj(D2);
            publicarCarteira(D2);
            const ar = document.getElementById("alfaResult");
            if (ar) ar.innerHTML = alfaResultHTML(D2);
          });
      }

      function polar(cx, cy, r, pct) {
        const a = (pct / 100) * 2 * Math.PI - Math.PI / 2;
        return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
      }
      function arcPath(cx, cy, r, startPct, sweepPct) {
        const [x1, y1] = polar(cx, cy, r, startPct);
        const [x2, y2] = polar(cx, cy, r, startPct + sweepPct);
        const large = sweepPct > 50 ? 1 : 0;
        return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
      }
      function renderDonut(D) {
        const el = document.getElementById("donutCard");
        let segs = "";
        let acc = 0;
        CLASSES.forEach((c) => {
          const v = D.byClass[c];
          if (v > 0) {
            segs += `<path d="${arcPath(100, 100, 78, acc, v)}" fill="none" stroke="${CLASS_COLORS[c]}" stroke-width="22"/>`;
            acc += v;
          }
        });
        let legend = "";
        CLASSES.forEach((c) => {
          if (D.byClass[c] > 0) {
            legend += `<div class="summary-row">
      <span style="width:11px; height:11px; border-radius:3px; background:${CLASS_COLORS[c]};"></span>
      <span style="flex:1; font-size:13px; color:#cfd4ef;">${c}</span>
      <span style="font-weight:700; font-size:14px;">${fmtPct(D.byClass[c])}%</span>
      <span style="font-size:12px; color:#6F77A8; width:92px; text-align:right;">R$ ${fmtBRL((S.patrimonio * D.byClass[c]) / 100)}</span>
    </div>`;
          }
        });
        el.innerHTML = `
    <div style="font-weight:700; font-size:15px; margin-bottom:14px;">Carteira ${S.template}${S.cliente ? ` · ${esc(S.cliente)}` : ""}</div>
    <div style="display:flex; justify-content:center; margin-bottom:8px;">
      <svg viewBox="0 0 200 200" width="190" height="190">
        ${segs}
        <text x="100" y="92" text-anchor="middle" font-size="13" fill="#A9B0D6" font-weight="600">Total</text>
        <text x="100" y="116" text-anchor="middle" font-size="26" fill="#fff" font-weight="800">${fmtPct(D.total)}%</text>
      </svg>
    </div>
    ${legend}`;
      }

      function renderGloss(D) {
        const el = document.getElementById("glossCard");
        el.innerHTML = "";
        return;
        let h = `<div class="card" style="margin-top:16px;">
    <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
      <svg class="icon" viewBox="0 0 24 24" style="color:${ORANGE};"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      <span style="color:#A9B0D6; font-weight:700; font-size:13px; letter-spacing:1px;">ENTENDA AS PROTEÇÕES</span>
    </div>`;
        D.glossTerms.forEach((k) => {
          h += `<div style="margin-bottom:12px;">
      <div style="font-weight:800; font-size:14px; color:#fff;">${GLOSSARY[k].label}</div>
      <div style="font-size:12.5px; color:#A9B0D6; line-height:1.45; margin-top:3px;">${GLOSSARY[k].desc}</div>
    </div>`;
        });
        h += `</div>`;
        el.innerHTML = h;
      }

      /* ---------- gráfico de projeção (SVG) ---------- */
      function renderProj(D) {
        // tabs de anos
        const tabsEl = document.getElementById("projTabs");
        const _projPresets = [3, 5, 10, 20];
        const _isCustom = _projPresets.indexOf(S.projAnos) < 0;
        tabsEl.innerHTML =
          _projPresets
            .map(
              (a) =>
                `<button class="proj-btn ${S.projAnos === a ? "active" : ""}" data-anos="${a}">${a} anos</button>`,
            )
            .join("") +
          `<span class="proj-custom"><input id="projAnosInput" class="proj-anos-input ${_isCustom ? "active" : ""}" type="number" inputmode="numeric" min="1" max="60" step="1" value="${S.projAnos}" title="Digite os anos (1 a 60)"><span class="proj-anos-suf">anos</span></span>`;
        tabsEl.querySelectorAll("[data-anos]").forEach(
          (b) =>
            (b.onclick = () => {
              S.projAnos = Number(b.dataset.anos);
              render();
            }),
        );
        (function () {
          var inp = document.getElementById("projAnosInput");
          if (!inp) return;
          function applyProjAnos() {
            var v = Math.round(Number(inp.value) || 0);
            v = Math.max(1, Math.min(60, v));
            if (v === S.projAnos) {
              inp.value = v;
              return;
            }
            S.projAnos = v;
            render();
          }
          inp.onchange = applyProjAnos;
          inp.onkeydown = function (e) {
            if (e.key === "Enter") {
              e.preventDefault();
              inp.blur();
            }
          };
        })();

        const W = 760,
          H = 300,
          padL = 70,
          padR = 20,
          padT = 10,
          padB = 34;
        const xL = padL,
          xR = W - padR,
          yT = padT,
          yB = H - padB;
        const yMin = S.patrimonio * 0.97,
          yMax = D.endCarteira * 1.03;
        const sx = (a) =>
          xL + (S.projAnos === 0 ? 0 : a / S.projAnos) * (xR - xL);
        const sy = (v) => yB - ((v - yMin) / (yMax - yMin || 1)) * (yB - yT);

        let grid = "",
          ylabels = "";
        for (let g = 0; g <= 4; g++) {
          const gv = yMin + (g / 4) * (yMax - yMin);
          const gy = sy(gv);
          grid += `<line x1="${xL}" y1="${gy}" x2="${xR}" y2="${gy}" stroke="rgba(120,130,210,.14)" stroke-width="1"/>`;
          ylabels += `<text x="${xL - 10}" y="${gy + 4}" text-anchor="end" font-size="11" fill="#A9B0D6">${fmtCompact(gv)}</text>`;
        }
        const step =
          S.projAnos <= 5
            ? 1
            : S.projAnos <= 12
              ? 2
              : Math.ceil(S.projAnos / 8);
        let xlabels = "";
        for (let a = 0; a <= S.projAnos; a += step) {
          xlabels += `<text x="${sx(a)}" y="${yB + 20}" text-anchor="middle" font-size="11" fill="#A9B0D6">${a === 0 ? "Hoje" : a + "a"}</text>`;
        }
        if (S.projAnos % step !== 0)
          xlabels += `<text x="${sx(S.projAnos)}" y="${yB + 20}" text-anchor="middle" font-size="11" fill="#A9B0D6">${S.projAnos}a</text>`;

        const cdiPts = D.projData
          .map((d) => `${sx(d.ano)},${sy(d.cdi)}`)
          .join(" ");
        const cartPts = D.projData
          .map((d) => `${sx(d.ano)},${sy(d.carteira)}`)
          .join(" ");
        const dots = D.projData
          .map(
            (d) =>
              `<circle cx="${sx(d.ano)}" cy="${sy(d.carteira)}" r="3.5" fill="#2BD9A6"/>`,
          )
          .join("");

        // Linha da carteira atual do cliente — só quando o Alfa da assessoria está preenchido
        let clientePoly = "",
          clienteLegend = "";
        if (D.temCliente) {
          const cliPts = D.projData
            .map((d) => `${sx(d.ano)},${sy(d.cliente)}`)
            .join(" ");
          clientePoly = `<polyline points="${cliPts}" fill="none" stroke="#F26522" stroke-width="2.5" stroke-dasharray="2 5" stroke-linecap="round"/>`;
          clienteLegend = `<span style="display:flex; align-items:center; gap:8px; font-size:12px; color:#cfd4ef;"><span style="width:24px; height:0; border-top:2px dotted #F26522; display:inline-block;"></span>Carteira atual do cliente (${fmtPct(D.retClienteAA)}% a.a.)</span>`;
        }

        document.getElementById("projChart").innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" style="width:100%; height:auto;" preserveAspectRatio="xMidYMid meet">
      ${grid}${ylabels}${xlabels}
      <polyline points="${cdiPts}" fill="none" stroke="#7C8CFF" stroke-width="2" stroke-dasharray="5 4"/>
      ${clientePoly}
      <polyline points="${cartPts}" fill="none" stroke="#2BD9A6" stroke-width="3"/>
      ${dots}
    </svg>
    <div style="display:flex; gap:24px; flex-wrap:wrap; margin-top:6px; padding-left:4px;">
      <span style="display:flex; align-items:center; gap:8px; font-size:12px; color:#cfd4ef;"><span style="width:24px; height:3px; background:#2BD9A6; display:inline-block; border-radius:2px;"></span>Carteira ${S.template} (${fmtPct(D.retAA)}% a.a.)</span>
      ${clienteLegend}
      <span style="display:flex; align-items:center; gap:8px; font-size:12px; color:#cfd4ef;"><span style="width:24px; height:0; border-top:2px dashed #7C8CFF; display:inline-block;"></span>100% do CDI (${fmtPct(S.cdi)}% a.a.)</span>
    </div>`;

        document.getElementById("projBoxes").innerHTML = `
    <div style="flex:1 1 200px; background:rgba(43,217,166,.08); border:1px solid rgba(43,217,166,.3); border-radius:12px; padding:12px 16px;">
      <div style="font-size:12px; color:#A9B0D6; font-weight:700;">Carteira em ${S.projAnos} anos</div>
      <div style="font-size:22px; font-weight:800; color:#2BD9A6; margin-top:2px;">R$ ${fmtBRL(D.endCarteira)}</div>
      <div style="font-size:12px; color:#6F77A8;">+R$ ${fmtBRL(D.endCarteira - S.patrimonio)} sobre o aporte</div>
    </div>
    <div style="flex:1 1 200px; background:rgba(124,140,255,.08); border:1px solid rgba(124,140,255,.3); border-radius:12px; padding:12px 16px;">
      <div style="font-size:12px; color:#A9B0D6; font-weight:700;">100% do CDI em ${S.projAnos} anos</div>
      <div style="font-size:22px; font-weight:800; color:#7C8CFF; margin-top:2px;">R$ ${fmtBRL(D.endCDI)}</div>
      <div style="font-size:12px; color:#6F77A8;">Vantagem da carteira: +R$ ${fmtBRL(D.endCarteira - D.endCDI)}</div>
    </div>`;

        document.getElementById("projDisc").textContent =
          `Projeção composta pela rentabilidade estimada da carteira (${fmtPct(S.cdiMult)}% do CDI), bruta e sem considerar IR, inflação ou variação de mercado. Cenário meramente ilustrativo.`;
      }

      /* ---------- inputs gerais ---------- */
      function fmtPatInput() {
        document.getElementById("patrimonio").value = fmtBRL(S.patrimonio);
      }
      document.getElementById("cliente").addEventListener("input", (e) => {
        S.cliente = e.target.value;
        renderDonut(calc());
        publicarCarteira(calc());
        ctorPersist();
      });
      document.getElementById("patrimonio").addEventListener("input", (e) => {
        const digits = e.target.value.replace(/\D/g, "");
        S.patrimonio = digits ? parseInt(digits, 10) : 0;
        e.target.value = fmtBRL(S.patrimonio);
        // reposiciona cursor no fim
        const v = e.target.value;
        e.target.setSelectionRange(v.length, v.length);
        updateLight();
        ctorPersist();
      });
      document.getElementById("btnAdd").onclick = () => {
        S.items.push(marcarNovo(mk("Renda Fixa", "Novo ativo", 0, "", "")));
        render();
      };

      /* ---------- importar carteira (Posicao Consolidada xlsx) ----------
         O construtor nao carrega o SheetJS nem o leitor da posicao por padrao;
         os dois entram sob demanda, so quando o assessor escolhe um arquivo. */
      function carregarScript(path) {
        return new Promise(function (res, rej) {
          var marca = 'script[data-hub="' + path + '"]';
          if (document.querySelector(marca)) return res();
          var sc = document.createElement("script");
          sc.src = window.__hubAsset(path);
          sc.dataset.hub = path;
          sc.onload = res;
          sc.onerror = function () {
            rej(new Error("Falha ao carregar " + path));
          };
          document.head.appendChild(sc);
        });
      }
      async function importarPosicao(file) {
        if (!file) return;
        try {
          if (!window.XLSX) await carregarScript("./vendor/xlsx-0.18.5.min.js");
          if (!window.__hubPosicao) await carregarScript("./src/compat/posicao-xlsx.js");
        } catch (e) {
          try { window.showToast("Não consegui carregar o leitor de planilhas."); } catch (_) {}
          return;
        }
        var buf;
        try {
          buf = await file.arrayBuffer();
        } catch (e) {
          try { window.showToast("Não consegui ler o arquivo."); } catch (_) {}
          return;
        }
        var pos;
        try {
          var wb = XLSX.read(new Uint8Array(buf), { type: "array" });
          pos = window.__hubPosicao.parse(wb);
        } catch (e) {
          try { window.showToast("Esse arquivo não parece a Posição Consolidada do Hub XP."); } catch (_) {}
          return;
        }
        if (!pos || !pos.ativos || !pos.ativos.length) {
          try { window.showToast("Não encontrei ativos nessa planilha."); } catch (_) {}
          return;
        }
        var ativos = window.__hubPosicao.consolidar(pos.ativos);
        var comp = {};
        var tot = ativos.reduce(function (sum, a) { return sum + (a.valor || 0); }, 0);
        ativos.forEach(function (a) {
          comp[a.categoria] = (comp[a.categoria] || 0) + (tot > 0 ? (a.valor / tot) * 100 : 0);
        });

        histGuardar("importar"); /* o que estava na tela vai para o historico */
        S.saidas = [];
        S.posicaoAtual = {
          conta: pos.conta,
          patrimonio: pos.patrimonio || tot,
          comp: comp,
          ativos: ativos,
          atualizadoEm: Date.now(),
        };
        S.template = "Atual";
        S.editandoTemplate = null;
        S.items = itensDaPosicao(S.posicaoAtual);
        ctorFixIds();
        if (pos.patrimonio) S.patrimonio = Math.round(pos.patrimonio);
        else if (tot) S.patrimonio = Math.round(tot);
        if (pos.conta && (!S.cliente || /^Conta /.test(S.cliente))) S.cliente = "Conta " + pos.conta;
        try {
          var _cli = document.getElementById("cliente");
          if (_cli) _cli.value = S.cliente || "";
          fmtPatInput();
        } catch (_) {}
        render();
        var nRF = ativos.filter(function (a) { return a.emissoes && a.emissoes.length > 1; });
        try {
          window.showToast(
            "Carteira importada: " + ativos.length + " ativos" +
              (pos.conta ? " · conta " + pos.conta : "") +
              (nRF.length
                ? " · " + nRF.map(function (a) { return a.emissoes.length + " " + a.name + (a.emissoes.length > 1 ? "s" : ""); }).join(", ") + " agrupados"
                : "") + ".",
          );
        } catch (_) {}
      }
      (function ligarImportar() {
        var b = document.getElementById("btnImportar");
        var inp = document.getElementById("inpImportar");
        if (!b || !inp || b.__lig) return;
        b.__lig = 1;
        b.onclick = function () {
          inp.value = "";
          inp.click();
        };
        inp.onchange = function () {
          var f = inp.files && inp.files[0];
          if (f) importarPosicao(f);
        };
      })();
      window.__ctorImportarPosicao = importarPosicao;

      /* ---------- copiar resumo ---------- */
      document.getElementById("btnCopy").onclick = () => {
        const D = calc();
        let txt = `Carteira ${S.template}${S.cliente ? " — " + S.cliente : ""}\n`;
        txt += `Patrimônio: R$ ${fmtBRL(S.patrimonio)}\n`;
        var _cprof =
          S.template === "Atual"
            ? S.recomendadaTemplate || "Moderada"
            : S.template;
        var _csp =
            typeof IPCA_SPREAD !== "undefined" ? IPCA_SPREAD[_cprof] : null,
          _cvol = typeof VOL_ALVO !== "undefined" ? VOL_ALVO[_cprof] : null;
        if (_csp != null)
          txt += `Retorno esperado: IPCA + ${fmtPct(_csp)}% a.a.${_cvol != null ? " · volatilidade alvo " + fmtPct(_cvol) + "%" : ""}\n`;
        txt += `Retorno estimado (bruto): ${fmtPct(D.retAA)}% a.a. (${fmtPct(S.cdiMult)}% do CDI) ≈ R$ ${fmtBRL(D.ganho12)} em 12 meses\n\n`;
        CLASSES.forEach((c) => {
          const list = D.grouped[c];
          if (!list || list.length === 0) return;
          txt += `${(window.__hubClassLabel ? window.__hubClassLabel(c) : c).toUpperCase()} (${fmtPct(D.byClass[c])}%)\n`;
          list.forEach((i) => {
            const extra = [];
            if (isFII(i)) extra.push("CETIPADO");
            const st = structureTag(i);
            if (st) extra.push(st.label);
            if (i.liquidez) extra.push("Liq: " + i.liquidez);
            if (isIsento(i.nome)) {
              extra.push("Resgate trabalhado");
              extra.push("Isento IR");
            }
            txt += `  • ${fmtPct(i.pct)}% ${i.nome}${i.detalhe ? " — " + i.detalhe : ""}${extra.length ? " [" + extra.join(" · ") + "]" : ""}\n`;
          });
          txt += "\n";
        });
        txt += `Total alocado: ${fmtPct(D.total)}%`;
        txt += `\nProjeção ${S.projAnos} anos: carteira R$ ${fmtBRL(D.endCarteira)} vs. 100% CDI R$ ${fmtBRL(D.endCDI)}`;
        if (D.temCliente) {
          txt += `\n\nAlfa da assessoria:`;
          txt += `\n  • Carteira atual: ${fmtPct(S.clienteCDI)}% do CDI → proposta ${fmtPct(S.cdiMult)}% do CDI (${D.alphaCDI >= 0 ? "+" : ""}${fmtPct(D.alphaCDI)} p.p.)`;
          txt += `\n  • Ganho extra estimado: ${D.alpha12 >= 0 ? "+" : ""}R$ ${fmtBRL(D.alpha12)} em 12 meses · ${D.alphaProj >= 0 ? "+" : ""}R$ ${fmtBRL(D.alphaProj)} em ${S.projAnos} anos`;
        }
        if (D.glossTerms.length) {
          txt += "\n\nEntenda as proteções:\n";
          D.glossTerms.forEach(
            (k) => (txt += `  • ${GLOSSARY[k].label}: ${GLOSSARY[k].desc}\n`),
          );
        }
        const done = () => {
          document.getElementById("copyLabel").textContent = "Copiado!";
          setTimeout(
            () =>
              (document.getElementById("copyLabel").textContent =
                "Copiar resumo"),
            1800,
          );
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard
            .writeText(txt)
            .then(done)
            .catch(() => fallbackCopy(txt, done));
        } else fallbackCopy(txt, done);
      };
      function fallbackCopy(txt, done) {
        const ta = document.createElement("textarea");
        ta.value = txt;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand("copy");
          done();
        } catch (e) {}
        document.body.removeChild(ta);
      }

      /* ---------- PNG ---------- */
      function wrapText(ctx, text, x, y, maxW, lineH, color, size, FF) {
        ctx.font = `400 ${size}px ${FF}`;
        ctx.fillStyle = color;
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
        const words = text.split(" ");
        let line = "";
        let yy = y;
        let lines = 0;
        for (const w of words) {
          const test = line ? line + " " + w : w;
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
      function buildCarteiraPNG() {
        const D = calc();
        const { template } = S,
          cliente = S.cliente,
          patrimonio = S.patrimonio;
        const {
          byClass,
          total,
          grouped,
          retAA,
          glossTerms,
          projData,
          endCarteira,
          endCDI,
        } = D;
        const cdiMult = S.cdiMult,
          projAnos = S.projAnos,
          cdi = S.cdi;
        const FF = "Arial, Helvetica, sans-serif";
        const nome = (cliente || "").trim();
        /* comparacao atual x proposta (depois de importar a posicao) */
        const cmp = modoComparacao();
        const saidas = cmp && Array.isArray(S.saidas) ? S.saidas : [];
        const resumo = cmp ? resumoMudanca() : null;
        const COR_ATUAL = "#8A93D8",
          COR_NOVO = "#2BD9A6",
          COR_SAI = "#FF5C7A";

        /* ---- helpers ---- */
        const tagFor = (i) => {
          let tag = "";
          if (isFII(i)) tag += "CETIPADO";
          const st = structureTag(i);
          if (st) tag += (tag ? "  ·  " : "") + st.label;
          if (i.liquidez)
            tag += (tag ? "  ·  " : "") + "Liquidez " + i.liquidez;
          if (isIsento(i.nome)) tag += (tag ? "  ·  " : "") + "Isento de IR";
          return tag;
        };
        const classLabel = (c) =>
          window.__hubClassLabel ? window.__hubClassLabel(c) : c;

        /* ---- layout (LANDSCAPE) ---- */
        const W = 1600,
          MX = 64;
        const bodyTop = 150;
        const RX = 680; // inicio da coluna direita
        const LX = MX; // coluna esquerda
        const LW = RX - 40 - LX; // largura util esquerda

        /* medicao previa da coluna direita */
        const CLASS_HEAD_H = 42,
          HOLD_H1 = 34,
          HOLD_H2 = 48,
          CLASS_GAP = 16;
        let rowsH = 0;
        const activeClasses = [];
        CLASSES.forEach((c) => {
          const list = grouped[c];
          if (!list || !list.length) return;
          activeClasses.push(c);
          rowsH += CLASS_HEAD_H;
          list.forEach((i) => {
            const second = !!(i.detalhe || tagFor(i) || (cmp && pesoMudou(i)));
            rowsH += second ? HOLD_H2 : HOLD_H1;
          });
          rowsH += CLASS_GAP;
        });
        if (saidas.length) rowsH += CLASS_HEAD_H + saidas.length * HOLD_H1 + CLASS_GAP;
        const rightColH = 84 + rowsH;

        /* coluna esquerda */
        const legendClasses = CLASSES.filter((c) => byClass[c] > 0);
        const LEG_BASE_OFF = 530,
          LEG_STEP = 30;
        const SUM_H = cmp ? 112 : 0; /* cartao "o que muda" */
        const leftColH = LEG_BASE_OFF + legendClasses.length * LEG_STEP + 10 + SUM_H;

        const bodyH = Math.max(leftColH, rightColH);
        const bodyBottom = bodyTop + bodyH + 26;

        /* projecao (compacta) */
        const hasProj = !!(projData && projData.length);
        const projH = hasProj ? 440 : 0;
        const projTop = bodyBottom + (hasProj ? 14 : 0);
        const projBottom = projTop + projH;

        /* alfa (compacta) */
        const hasAlfa = !!(D && D.temCliente);
        const alfaH = hasAlfa ? 84 : 0;
        const alfaTop = projBottom + (hasAlfa ? 12 : 0);
        const alfaBottom = alfaTop + alfaH;

        /* glossario (faixa slim de chips) */
        const hasGloss = !!(glossTerms && glossTerms.length);
        let glossRows = 1;
        if (hasGloss) {
          let _rw = 0;
          const _max = W - 2 * MX - 44;
          glossTerms.forEach((k) => {
            const _lbl = (GLOSSARY[k] && GLOSSARY[k].label) || k || "";
            const _cw = Math.round(_lbl.length * 8.6) + 34;
            if (_rw > 0 && _rw + _cw > _max) {
              glossRows++;
              _rw = 0;
            }
            _rw += _cw + 10;
          });
        }
        const glossH = hasGloss ? 44 + glossRows * 34 : 0;
        const glossTop = alfaBottom + (hasGloss ? 12 : 0);
        const glossBottom = glossTop + glossH;

        const footTop = glossBottom + 18;
        const H = Math.max(820, footTop + 84);

        const scale = 2;
        const cv = document.createElement("canvas");
        cv.width = W * scale;
        cv.height = H * scale;
        const ctx = cv.getContext("2d");
        ctx.scale(scale, scale);

        const T = (t, x, y, size, color, weight, align) => {
          ctx.font = `${weight || "400"} ${size}px ${FF}`;
          ctx.fillStyle = color;
          ctx.textAlign = align || "left";
          ctx.textBaseline = "alphabetic";
          ctx.fillText(t, x, y);
        };
        const rr = (x, y, w, h, r) => {
          r = Math.min(r, w / 2, h / 2);
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.arcTo(x + w, y, x + w, y + h, r);
          ctx.arcTo(x + w, y + h, x, y + h, r);
          ctx.arcTo(x, y + h, x, y, r);
          ctx.arcTo(x, y, x + w, y, r);
          ctx.closePath();
        };
        const spaced = (t, x, y, size, color, weight, sp, align) => {
          ctx.font = `${weight || "700"} ${size}px ${FF}`;
          ctx.fillStyle = color;
          ctx.textBaseline = "alphabetic";
          ctx.textAlign = "left";
          let w = 0;
          for (const c of t) {
            w += ctx.measureText(c).width + sp;
          }
          let xx = align === "right" ? x - w + sp : x;
          for (const c of t) {
            ctx.fillText(c, xx, y);
            xx += ctx.measureText(c).width + sp;
          }
        };

        /* selo pequeno (ATUAL / NOVO / SAI) alinhado a linha de texto */
        const pill = (txt, x, yBase, fill, color) => {
          ctx.font = `800 9.5px ${FF}`;
          const w = Math.round(ctx.measureText(txt).width) + 14;
          ctx.fillStyle = fill;
          rr(x, yBase - 12, w, 16, 8);
          ctx.fill();
          T(txt, x + w / 2, yBase - 1, 9.5, color, "800", "center");
          return w;
        };

        /* ---- fundo ---- */
        const bg = ctx.createLinearGradient(0, 0, W, H);
        bg.addColorStop(0, "#0A0F38");
        bg.addColorStop(0.55, "#070B2E");
        bg.addColorStop(1, "#05081F");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
        const glow = ctx.createRadialGradient(
          W * 0.8,
          80,
          0,
          W * 0.8,
          80,
          W * 0.45,
        );
        glow.addColorStop(0, "rgba(242,101,34,.14)");
        glow.addColorStop(1, "rgba(242,101,34,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, W, H);

        /* ---- header band ---- */
        ctx.fillStyle = "rgba(255,255,255,.02)";
        ctx.fillRect(0, 0, W, bodyTop);
        ctx.fillStyle = ORANGE;
        ctx.fillRect(0, 0, W, 6);
        ctx.strokeStyle = "rgba(120,130,210,.20)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(MX, bodyTop - 1);
        ctx.lineTo(W - MX, bodyTop - 1);
        ctx.stroke();
        ctx.font = `800 44px ${FF}`;
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = ORANGE;
        window.__ricoLogoAuto(ctx, MX, 98);
        ctx.strokeStyle = "rgba(120,130,210,.30)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(MX + 126, 48);
        ctx.lineTo(MX + 126, 108);
        ctx.stroke();
        spaced(
          "PROPOSTA DE CARTEIRA",
          MX + 150,
          74,
          13,
          ORANGE,
          "700",
          3,
          "left",
        );
        let dn = nome || "Proposta de Carteira";
        ctx.font = `800 30px ${FF}`;
        while (ctx.measureText(dn).width > 640 && dn.length > 3)
          dn = dn.slice(0, -1);
        if (nome && nome !== dn) dn = dn.trim() + "…";
        T(dn, MX + 150, 112, 30, "#fff", "800", "left");
        const _hoje = new Date().toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
        spaced(
          cmp ? "CARTEIRA ATUAL → PROPOSTA" : "PERFIL " + String(template || "").toUpperCase(),
          W - MX,
          72,
          13,
          "#A9B0D6",
          "700",
          2,
          "right",
        );
        T(_hoje, W - MX, 104, 14, "#6F77A8", "500", "right");

        /* ---- coluna esquerda: donut ---- */
        const dcx = LX + LW / 2,
          dcy = bodyTop + 175,
          dr = 118,
          dw = 32;
        let acc = 0;
        ctx.strokeStyle = "rgba(120,130,210,.10)";
        ctx.lineWidth = dw;
        ctx.beginPath();
        ctx.arc(dcx, dcy, dr, 0, 2 * Math.PI);
        ctx.stroke();
        CLASSES.forEach((c) => {
          const v = byClass[c];
          if (!v) return;
          const a0 = (acc / 100) * 2 * Math.PI - Math.PI / 2;
          const a1 = ((acc + v) / 100) * 2 * Math.PI - Math.PI / 2;
          ctx.beginPath();
          ctx.arc(dcx, dcy, dr, a0, a1);
          ctx.strokeStyle = CLASS_COLORS[c];
          ctx.lineWidth = dw;
          ctx.lineCap = "butt";
          ctx.stroke();
          acc += v;
        });
        T("ALOCADO", dcx, dcy - 6, 12, "#A9B0D6", "700", "center");
        T(fmtPct(total) + "%", dcx, dcy + 30, 34, "#fff", "800", "center");

        /* cartoes patrimonio + retorno */
        const cardX = LX,
          cardW = LW,
          CARD_H = 70;
        const cA = bodyTop + 318;
        ctx.fillStyle = "rgba(255,255,255,.03)";
        rr(cardX, cA, cardW, CARD_H, 14);
        ctx.fill();
        ctx.strokeStyle = "rgba(120,130,210,.18)";
        ctx.lineWidth = 1;
        rr(cardX, cA, cardW, CARD_H, 14);
        ctx.stroke();
        spaced(
          "PATRIMÔNIO A ALOCAR",
          cardX + 18,
          cA + 27,
          11.5,
          "#A9B0D6",
          "700",
          1.5,
          "left",
        );
        T(
          "R$ " + fmtBRL(patrimonio),
          cardX + 18,
          cA + 56,
          25,
          ORANGE,
          "800",
          "left",
        );
        const cB = bodyTop + 398;
        ctx.fillStyle = "rgba(43,217,166,.06)";
        rr(cardX, cB, cardW, CARD_H, 14);
        ctx.fill();
        ctx.strokeStyle = "rgba(43,217,166,.22)";
        ctx.lineWidth = 1;
        rr(cardX, cB, cardW, CARD_H, 14);
        ctx.stroke();
        spaced(
          "RETORNO ESTIMADO (BRUTO)",
          cardX + 18,
          cB + 27,
          11.5,
          "#8FE9CB",
          "700",
          1.5,
          "left",
        );
        var _prof =
          template === "Atual" ? S.recomendadaTemplate || "Moderada" : template;
        var _ipcaSp =
          typeof IPCA_SPREAD !== "undefined" && IPCA_SPREAD[_prof] != null
            ? IPCA_SPREAD[_prof]
            : Math.max(0, (Number(retAA) || 0) - (Number(CTOR_IPCA) || 0));
        var _vol =
          typeof VOL_ALVO !== "undefined" && VOL_ALVO[_prof] != null
            ? VOL_ALVO[_prof]
            : null;
        if ((S.retView || "ipca") === "ipca") {
          var _big = "IPCA + " + fmtPct(_ipcaSp) + "%";
          ctx.font = `800 23px ${FF}`;
          const _bw = ctx.measureText(_big).width;
          T(_big, cardX + 18, cB + 56, 23, "#2BD9A6", "800", "left");
          T(
            "· retorno esperado a.a." +
              (_vol != null ? " · vol. alvo " + fmtPct(_vol) + "%" : ""),
            cardX + 18 + _bw + 12,
            cB + 54,
            13,
            "#A9B0D6",
            "600",
            "left",
          );
        } else {
          ctx.font = `800 23px ${FF}`;
          const raaW = ctx.measureText(fmtPct(retAA) + "% a.a.").width;
          T(
            fmtPct(retAA) + "% a.a.",
            cardX + 18,
            cB + 56,
            23,
            "#2BD9A6",
            "800",
            "left",
          );
          T(
            "· " + fmtPct(cdiMult) + "% do CDI",
            cardX + 18 + raaW + 12,
            cB + 54,
            13.5,
            "#A9B0D6",
            "600",
            "left",
          );
        }

        /* legenda de classes (esquerda) */
        spaced(
          "DISTRIBUIÇÃO POR CLASSE",
          LX,
          bodyTop + 500,
          11.5,
          "#6F77A8",
          "700",
          1.5,
          "left",
        );
        let ly = bodyTop + LEG_BASE_OFF;
        legendClasses.forEach((c) => {
          ctx.fillStyle = CLASS_COLORS[c];
          rr(LX, ly - 11, 12, 12, 3);
          ctx.fill();
          T(classLabel(c), LX + 24, ly, 14.5, "#cfd4ef", "600", "left");
          T(
            fmtPct(byClass[c]) + "%",
            RX - 40,
            ly,
            14.5,
            CLASS_COLORS[c],
            "800",
            "right",
          );
          ly += LEG_STEP;
        });
        if (cmp && resumo) {
          const sy = ly + 8;
          spaced("O QUE MUDA", LX, sy + 12, 11.5, "#6F77A8", "700", 1.5, "left");
          const tiles = [
            { n: resumo.mantem, l: "mantidos", c: COR_ATUAL },
            { n: resumo.ajusta, l: "ajustados", c: "#FFB020" },
            { n: resumo.novos, l: "novos", c: COR_NOVO },
            { n: resumo.saem, l: "saem", c: COR_SAI },
          ];
          const tg = 8,
            tw = Math.floor((LW - tg * 3) / 4),
            th = 58,
            ty = sy + 26;
          tiles.forEach((tl, k) => {
            const tx = LX + k * (tw + tg);
            ctx.fillStyle = "rgba(255,255,255,.03)";
            rr(tx, ty, tw, th, 12);
            ctx.fill();
            ctx.strokeStyle = "rgba(120,130,210,.18)";
            ctx.lineWidth = 1;
            rr(tx, ty, tw, th, 12);
            ctx.stroke();
            ctx.fillStyle = tl.c;
            rr(tx, ty + 14, 3, 30, 2);
            ctx.fill();
            T(String(tl.n), tx + 14, ty + 30, 22, tl.c, "800", "left");
            T(tl.l, tx + 14, ty + 48, 11, "#A9B0D6", "600", "left");
          });
        }

        /* ---- divisor vertical ---- */
        ctx.strokeStyle = "rgba(120,130,210,.16)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(RX - 40, bodyTop + 30);
        ctx.lineTo(RX - 40, bodyBottom - 20);
        ctx.stroke();

        /* ---- coluna direita: composicao ---- */
        spaced(
          "COMPOSIÇÃO DA CARTEIRA",
          RX,
          bodyTop + 44,
          14,
          "#A9B0D6",
          "700",
          2,
          "left",
        );
        T("% · VALOR", W - MX, bodyTop + 44, 12.5, "#6F77A8", "600", "right");
        let y = bodyTop + 86;
        activeClasses.forEach((c) => {
          const list = grouped[c];
          ctx.fillStyle = CLASS_COLORS[c];
          rr(RX, y - 16, 5, 22, 2);
          ctx.fill();
          T(classLabel(c), RX + 16, y, 18, "#fff", "800", "left");
          const classVal = (patrimonio * (byClass[c] || 0)) / 100;
          ctx.font = `800 17px ${FF}`;
          const pctW = ctx.measureText(fmtPct(byClass[c]) + "%").width;
          T(
            fmtPct(byClass[c]) + "%",
            W - MX,
            y,
            17,
            CLASS_COLORS[c],
            "800",
            "right",
          );
          T(
            "R$ " + fmtBRL(classVal),
            W - MX - pctW - 16,
            y,
            13,
            "#8A93D8",
            "600",
            "right",
          );
          y += CLASS_HEAD_H;
          list.forEach((i) => {
            const valor = (patrimonio * (Number(i.pct) || 0)) / 100;
            const tg = tagFor(i);
            const mudou = cmp && pesoMudou(i);
            const second = !!(i.detalhe || tg || mudou);
            T(fmtPct(i.pct) + "%", RX + 16, y, 15, "#FF6B2C", "800", "left");
            if (mudou) {
              const dlt = (Number(i.pct) || 0) - Number(i.pctAtual);
              T(
                "era " + fmtPct(i.pctAtual) + "%",
                RX + 16,
                y + 18,
                11,
                dlt > 0 ? COR_NOVO : COR_SAI,
                "700",
                "left",
              );
            }
            let nx = RX + 86;
            if (cmp && i.origem === "atual")
              nx += pill("ATUAL", nx, y, "rgba(138,147,216,.16)", COR_ATUAL) + 8;
            else if (cmp && i.origem === "novo")
              nx += pill("NOVO", nx, y, "rgba(43,217,166,.16)", COR_NOVO) + 8;
            let nm = i.nome;
            ctx.font = `700 15.5px ${FF}`;
            const maxNameW = W - MX - 150 - nx;
            while (ctx.measureText(nm).width > maxNameW && nm.length > 4)
              nm = nm.slice(0, -1);
            if (nm !== i.nome) nm = nm.trim() + "…";
            T(nm, nx, y, 15.5, "#fff", "700", "left");
            if (i.detalhe)
              T(i.detalhe, RX + 86, y + 18, 12, "#A9B0D6", "500", "left");
            T(
              "R$ " + fmtBRL(valor),
              W - MX,
              y,
              14.5,
              "#cfd4ef",
              "600",
              "right",
            );
            if (tg) T(tg, W - MX, y + 18, 11, "#8A93D8", "600", "right");
            const lineY = y + (second ? 32 : 16);
            ctx.strokeStyle = "rgba(120,130,210,.10)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(RX + 16, lineY);
            ctx.lineTo(W - MX, lineY);
            ctx.stroke();
            y += second ? HOLD_H2 : HOLD_H1;
          });
          y += CLASS_GAP;
        });
        if (saidas.length) {
          ctx.fillStyle = COR_SAI;
          rr(RX, y - 16, 5, 22, 2);
          ctx.fill();
          T("Saem da carteira", RX + 16, y, 18, "#fff", "800", "left");
          T(
            saidas.length + (saidas.length === 1 ? " ativo" : " ativos") + " · deixam a proposta",
            W - MX,
            y,
            13,
            "#FF8FA5",
            "700",
            "right",
          );
          y += CLASS_HEAD_H;
          saidas.forEach((sd) => {
            T(fmtPct(sd.pct) + "%", RX + 16, y, 15, "#FF8FA5", "800", "left");
            let nx = RX + 86;
            nx += pill("SAI", nx, y, "rgba(255,92,122,.16)", COR_SAI) + 8;
            let nm = sd.nome || "";
            ctx.font = `700 15.5px ${FF}`;
            const maxW = W - MX - 150 - nx;
            while (ctx.measureText(nm).width > maxW && nm.length > 4) nm = nm.slice(0, -1);
            if (nm !== (sd.nome || "")) nm = nm.trim() + "…";
            T(nm, nx, y, 15.5, "#B9BFE3", "700", "left");
            /* risco no nome: saiu */
            const nw = ctx.measureText(nm).width;
            ctx.strokeStyle = "rgba(255,92,122,.75)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(nx, y - 5);
            ctx.lineTo(nx + nw, y - 5);
            ctx.stroke();
            T(
              "R$ " + fmtBRL((patrimonio * (Number(sd.pct) || 0)) / 100),
              W - MX,
              y,
              14.5,
              "#8A93D8",
              "600",
              "right",
            );
            ctx.strokeStyle = "rgba(120,130,210,.10)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(RX + 16, y + 16);
            ctx.lineTo(W - MX, y + 16);
            ctx.stroke();
            y += HOLD_H1;
          });
          y += CLASS_GAP;
        }

        /* ---- projecao ----
           Um cartao com o grafico a esquerda (area preenchida, grade,
           marcadores por ano) e os numeros-chave numa coluna a direita,
           em vez da faixa de 120px de altura que corria a pagina inteira. */
        if (hasProj) {
          const PW = W - 2 * MX;
          const cardX = MX,
            cardY = projTop,
            cardH = projH - 14;
          const padX = 28;
          const kpiW = 290;
          const kpiX = cardX + PW - padX - kpiW;
          const headH = 62;

          ctx.fillStyle = "rgba(255,255,255,.035)";
          rr(cardX, cardY, PW, cardH, 18);
          ctx.fill();
          ctx.strokeStyle = "rgba(120,130,210,.22)";
          ctx.lineWidth = 1;
          rr(cardX, cardY, PW, cardH, 18);
          ctx.stroke();

          /* cabecalho: titulo + subtitulo a esquerda, legenda a direita */
          spaced(
            "PROJEÇÃO DE RENTABILIDADE · " +
              (cmp ? "PROPOSTA" : String(template || "").toUpperCase()),
            cardX + padX,
            cardY + 32,
            13,
            "#A9B0D6",
            "700",
            1.5,
            "left",
          );
          T(
            "Aporte inicial de R$ " +
              fmtBRL(patrimonio) +
              " · horizonte de " +
              projAnos +
              (projAnos === 1 ? " ano" : " anos") +
              " · rentabilidade bruta estimada",
            cardX + padX,
            cardY + 52,
            12,
            "#8089BE",
            "500",
            "left",
          );

          const series = [
            {
              lbl: `Carteira ${cmp ? "proposta" : template} (${fmtPct(retAA)}% a.a.)`,
              cor: "#2BD9A6",
              w: 3,
              dash: null,
            },
          ];
          if (D && D.temCliente)
            series.push({
              lbl: `Carteira atual do cliente (${fmtPct(D.retClienteAA)}% a.a.)`,
              cor: ORANGE,
              w: 2.5,
              dash: [2, 5],
            });
          series.push({
            lbl: `100% do CDI (${fmtPct(cdi)}% a.a.)`,
            cor: "#7C8CFF",
            w: 2,
            dash: [6, 4],
          });
          ctx.font = `600 12.5px ${FF}`;
          let legW = 0;
          series.forEach((sr, i) => {
            legW += 30 + ctx.measureText(sr.lbl).width + (i ? 26 : 0);
          });
          let lgx = cardX + PW - padX - legW;
          const lgy = cardY + 40;
          series.forEach((sr) => {
            ctx.strokeStyle = sr.cor;
            ctx.lineWidth = sr.w;
            if (sr.dash) {
              ctx.setLineDash(sr.dash);
              ctx.lineCap = "round";
            }
            ctx.beginPath();
            ctx.moveTo(lgx, lgy);
            ctx.lineTo(lgx + 22, lgy);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.lineCap = "butt";
            T(sr.lbl, lgx + 30, lgy + 4, 12.5, "#cfd4ef", "600", "left");
            ctx.font = `600 12.5px ${FF}`;
            lgx += 30 + ctx.measureText(sr.lbl).width + 26;
          });

          /* linha fina separando cabecalho do corpo */
          ctx.strokeStyle = "rgba(120,130,210,.16)";
          ctx.beginPath();
          ctx.moveTo(cardX + padX, cardY + headH);
          ctx.lineTo(cardX + PW - padX, cardY + headH);
          ctx.stroke();

          /* area do grafico */
          const xL = cardX + padX + 78,
            xR = kpiX - 40,
            yT = cardY + headH + 34,
            yB = cardY + cardH - 50;
          const yMin = patrimonio * 0.97,
            yMax = Math.max(endCarteira, endCDI, D && D.temCliente ? (projData[projData.length - 1].cliente || 0) : 0) * 1.04;
          const sx = (a) =>
            xL + (projAnos === 0 ? 0 : a / projAnos) * (xR - xL);
          const sy = (v) => yB - ((v - yMin) / (yMax - yMin || 1)) * (yB - yT);

          /* grade horizontal com rotulos */
          ctx.textAlign = "right";
          ctx.textBaseline = "middle";
          for (let g = 0; g <= 5; g++) {
            const gv = yMin + (g / 5) * (yMax - yMin);
            const gy = sy(gv);
            ctx.strokeStyle = g === 0 ? "rgba(120,130,210,.32)" : "rgba(120,130,210,.13)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(xL, gy);
            ctx.lineTo(xR, gy);
            ctx.stroke();
            ctx.font = `500 11.5px ${FF}`;
            ctx.fillStyle = "#A9B0D6";
            ctx.fillText(fmtCompact(gv), xL - 12, gy);
          }
          ctx.textBaseline = "alphabetic";

          /* marcadores verticais por ano */
          const step =
            projAnos <= 6 ? 1 : projAnos <= 12 ? 2 : Math.ceil(projAnos / 8);
          const rotAno = (a) =>
            a === 0 ? "Hoje" : projAnos <= 6 ? a + (a === 1 ? " ano" : " anos") : a + "a";
          const anos = [];
          for (let a = 0; a <= projAnos; a += step) anos.push(a);
          if (projAnos % step !== 0) anos.push(projAnos);
          anos.forEach((a) => {
            ctx.strokeStyle = "rgba(120,130,210,.10)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(sx(a), yT);
            ctx.lineTo(sx(a), yB);
            ctx.stroke();
            T(rotAno(a), sx(a), yB + 22, 11.5, "#A9B0D6", "600", "center");
          });

          /* area sob a carteira */
          const areaG = ctx.createLinearGradient(0, yT, 0, yB);
          areaG.addColorStop(0, "rgba(43,217,166,.26)");
          areaG.addColorStop(1, "rgba(43,217,166,0)");
          ctx.beginPath();
          projData.forEach((d, idx) => {
            const px = sx(d.ano),
              py = sy(d.carteira);
            idx ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
          });
          ctx.lineTo(sx(projData[projData.length - 1].ano), yB);
          ctx.lineTo(sx(projData[0].ano), yB);
          ctx.closePath();
          ctx.fillStyle = areaG;
          ctx.fill();

          /* CDI */
          ctx.strokeStyle = "#7C8CFF";
          ctx.lineWidth = 2;
          ctx.setLineDash([7, 5]);
          ctx.beginPath();
          projData.forEach((d, idx) => {
            const px = sx(d.ano),
              py = sy(d.cdi);
            idx ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
          });
          ctx.stroke();
          ctx.setLineDash([]);
          /* carteira atual do cliente, quando o assessor informou o % do CDI */
          if (D && D.temCliente) {
            ctx.strokeStyle = ORANGE;
            ctx.lineWidth = 2.5;
            ctx.setLineDash([2, 5]);
            ctx.lineCap = "round";
            ctx.beginPath();
            projData.forEach((d, idx) => {
              const px = sx(d.ano),
                py = sy(d.cliente);
              idx ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
            });
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.lineCap = "butt";
          }
          /* carteira proposta */
          ctx.strokeStyle = "#2BD9A6";
          ctx.lineWidth = 3.5;
          ctx.lineJoin = "round";
          ctx.beginPath();
          projData.forEach((d, idx) => {
            const px = sx(d.ano),
              py = sy(d.carteira);
            idx ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
          });
          ctx.stroke();
          projData.forEach((d) => {
            ctx.beginPath();
            ctx.arc(sx(d.ano), sy(d.carteira), 5, 0, 2 * Math.PI);
            ctx.fillStyle = "#0A0F38";
            ctx.fill();
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = "#2BD9A6";
            ctx.stroke();
          });
          /* valor no ultimo ponto */
          {
            const ult = projData[projData.length - 1];
            const px = sx(ult.ano),
              py = sy(ult.carteira);
            const rot = "R$ " + fmtBRL(ult.carteira);
            ctx.font = `800 13px ${FF}`;
            const tw = ctx.measureText(rot).width + 20;
            const bx = px - tw - 10,
              by = py - 34;
            ctx.fillStyle = "rgba(43,217,166,.16)";
            rr(bx, by, tw, 24, 8);
            ctx.fill();
            ctx.strokeStyle = "rgba(43,217,166,.5)";
            ctx.lineWidth = 1;
            rr(bx, by, tw, 24, 8);
            ctx.stroke();
            T(rot, bx + tw / 2, by + 16.5, 13, "#2BD9A6", "800", "center");
          }

          /* coluna de numeros-chave */
          const tiles = [
            {
              t: `Carteira em ${projAnos} ${projAnos === 1 ? "ano" : "anos"}`,
              v: "R$ " + fmtBRL(endCarteira),
              sub: "+R$ " + fmtBRL(Math.max(0, endCarteira - patrimonio)) + " sobre o aporte",
              cor: "#2BD9A6",
              bg: "rgba(43,217,166,.09)",
              bd: "rgba(43,217,166,.32)",
            },
            {
              t: `100% do CDI em ${projAnos} ${projAnos === 1 ? "ano" : "anos"}`,
              v: "R$ " + fmtBRL(endCDI),
              sub: "+R$ " + fmtBRL(Math.max(0, endCDI - patrimonio)) + " sobre o aporte",
              cor: "#7C8CFF",
              bg: "rgba(124,140,255,.09)",
              bd: "rgba(124,140,255,.32)",
            },
          ];
          if (D && D.temCliente) {
            const endCli = projData[projData.length - 1].cliente || 0;
            tiles.push({
              t: `Carteira atual em ${projAnos} ${projAnos === 1 ? "ano" : "anos"}`,
              v: "R$ " + fmtBRL(endCli),
              sub: fmtPct(D.retClienteAA) + "% a.a. informado",
              cor: ORANGE,
              bg: "rgba(242,101,34,.09)",
              bd: "rgba(242,101,34,.32)",
            });
          }
          const dif = endCarteira - endCDI;
          tiles.push({
            t: "Vantagem sobre o CDI",
            v: (dif >= 0 ? "+" : "−") + "R$ " + fmtBRL(Math.abs(dif)),
            sub:
              endCDI > 0
                ? (dif >= 0 ? "+" : "−") +
                  fmtPct(Math.abs((dif / endCDI) * 100)) +
                  "% sobre o resultado do CDI"
                : "",
            cor: dif >= 0 ? "#2BD9A6" : "#FF8A8A",
            bg: "rgba(255,255,255,.04)",
            bd: "rgba(120,130,210,.26)",
          });
          const tileGap = 12;
          const tileH = Math.min(
            92,
            Math.floor((yB + 8 - (cardY + headH + 18) - tileGap * (tiles.length - 1)) / tiles.length),
          );
          let ty = cardY + headH + 18;
          tiles.forEach((tl) => {
            ctx.fillStyle = tl.bg;
            rr(kpiX, ty, kpiW, tileH, 12);
            ctx.fill();
            ctx.strokeStyle = tl.bd;
            ctx.lineWidth = 1;
            rr(kpiX, ty, kpiW, tileH, 12);
            ctx.stroke();
            ctx.fillStyle = tl.cor;
            rr(kpiX, ty + 14, 3, tileH - 28, 2);
            ctx.fill();
            T(tl.t, kpiX + 18, ty + 24, 11.5, "#A9B0D6", "700", "left");
            T(tl.v, kpiX + 18, ty + (tileH > 70 ? 52 : 46), tileH > 70 ? 22 : 19, tl.cor, "800", "left");
            if (tl.sub && tileH > 70)
              T(tl.sub, kpiX + 18, ty + tileH - 14, 11, "#8089BE", "500", "left");
            ty += tileH + tileGap;
          });
        }

        /* ---- alfa (compacta) ---- */
        if (hasAlfa) {
          const ay = alfaTop;
          ctx.fillStyle = "rgba(43,217,166,.07)";
          rr(MX, ay, W - 2 * MX, alfaH - 8, 14);
          ctx.fill();
          ctx.strokeStyle = "rgba(43,217,166,.28)";
          ctx.lineWidth = 1;
          rr(MX, ay, W - 2 * MX, alfaH - 8, 14);
          ctx.stroke();
          spaced(
            "ALFA DA ASSESSORIA",
            MX + 22,
            ay + 24,
            12,
            "#2BD9A6",
            "700",
            1.5,
            "left",
          );
          var _melh =
            Number(S.clienteCDI) > 0
              ? ((Number(S.cdiMult) - Number(S.clienteCDI)) /
                  Number(S.clienteCDI)) *
                100
              : 0;
          T(
            (_melh >= 0
              ? "Melhora de " + fmtPct(_melh) + "%"
              : "Queda de " + fmtPct(Math.abs(_melh)) + "%") +
              " vs. carteira atual",
            MX + 22,
            ay + 52,
            19,
            _melh >= 0 ? "#2BD9A6" : ORANGE,
            "800",
            "left",
          );
          T(
            fmtPct(S.clienteCDI) +
              "% → " +
              fmtPct(S.cdiMult) +
              "% do CDI (" +
              (D.alphaCDI >= 0 ? "+" : "") +
              fmtPct(D.alphaCDI) +
              " p.p.)",
            MX + 22,
            ay + 70,
            12,
            "#A9B0D6",
            "500",
            "left",
          );
          T(
            "Ganho extra · 12 meses",
            W - MX - 22,
            ay + 26,
            12,
            "#A9B0D6",
            "600",
            "right",
          );
          T(
            (D.alpha12 >= 0 ? "+" : "") + "R$ " + fmtBRL(D.alpha12),
            W - MX - 22,
            ay + 52,
            18,
            D.alpha12 >= 0 ? "#2BD9A6" : ORANGE,
            "800",
            "right",
          );
          T(
            "· " +
              S.projAnos +
              " anos: " +
              (D.alphaProj >= 0 ? "+" : "") +
              "R$ " +
              fmtBRL(D.alphaProj),
            W - MX - 22,
            ay + 70,
            12,
            "#cfd4ef",
            "600",
            "right",
          );
        }

        /* ---- glossario (faixa slim de chips) ---- */
        if (hasGloss) {
          const gy0 = glossTop;
          ctx.fillStyle = "rgba(242,101,34,.06)";
          rr(MX, gy0, W - 2 * MX, glossH, 14);
          ctx.fill();
          ctx.strokeStyle = "rgba(242,101,34,.18)";
          ctx.lineWidth = 1;
          rr(MX, gy0, W - 2 * MX, glossH, 14);
          ctx.stroke();
          spaced(
            "ENTENDA AS PROTEÇÕES",
            MX + 22,
            gy0 + 26,
            12,
            ORANGE,
            "700",
            1.5,
            "left",
          );
          let cgx = MX + 22,
            cgy = gy0 + 42;
          glossTerms.forEach((k) => {
            const lbl = (GLOSSARY[k] && GLOSSARY[k].label) || k || "";
            const cw = Math.round(lbl.length * 8.6) + 34;
            if (cgx > MX + 22 && cgx + cw > W - MX - 22) {
              cgx = MX + 22;
              cgy += 34;
            }
            ctx.fillStyle = "rgba(242,101,34,.12)";
            rr(cgx, cgy, cw, 24, 12);
            ctx.fill();
            ctx.strokeStyle = "rgba(242,101,34,.30)";
            ctx.lineWidth = 1;
            rr(cgx, cgy, cw, 24, 12);
            ctx.stroke();
            T(lbl, cgx + cw / 2, cgy + 16, 12.5, "#FFD9C7", "700", "center");
            cgx += cw + 10;
          });
        }

        /* ---- rodape ---- */
        const yF = footTop;
        ctx.strokeStyle = "rgba(120,130,210,.20)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(MX, yF);
        ctx.lineTo(W - MX, yF);
        ctx.stroke();
        T(
          "Total alocado: " +
            fmtPct(total) +
            "%  ·  Material de apoio comercial · valores, liquidez e retorno ilustrativos (estimativa bruta, sem IR) · FIIs CETIPADOS são fundos de balcão.",
          MX,
          yF + 28,
          13,
          "#6F77A8",
          "500",
          "left",
        );
        T(
          "Projeção meramente ilustrativa, sem considerar IR/inflação. Não constitui recomendação ou oferta. Sujeito à suitability e às condições de cada produto.",
          MX,
          yF + 50,
          13,
          "#6F77A8",
          "500",
          "left",
        );
        T("rico", W - MX, yF + 50, 18, ORANGE, "800", "right");

        return cv.toDataURL("image/png");
      }

      document.getElementById("btnPng").onclick = () => {
        try {
          const url = buildCarteiraPNG();
          const fname = `Carteira_${S.template}${S.cliente ? "_" + S.cliente.replace(/[^a-zA-Z0-9]+/g, "_") : ""}.png`;
          window.mostrarPngModal(url, fname, { accent: "#F26522" });
        } catch (e) {
          console.error(e);
          alert(
            "Não foi possível gerar a imagem: " +
              (e && e.message ? e.message : e),
          );
        }
      };

      /* ---------- init ---------- */
      /* Tarefa 2: restaura o estado persistido do Simulador antes da 1a renderizacao */
      try {
        if (restoreCtorState()) {
          // template "Atual" depende de posicaoAtual (nao persistida): cai p/ recomendada
          if (
            S.template === "Atual" &&
            !(S.posicaoAtual && S.posicaoAtual.comp)
          ) {
            S.template = S.recomendadaTemplate || "Moderada";
          }
          // sincroniza campos de input com o estado restaurado
          var _cli = document.getElementById("cliente");
          if (_cli) _cli.value = S.cliente || "";
          var _cdi = document.getElementById("inpCdi");
          if (_cdi && S.cdi != null) _cdi.value = S.cdi;
        }
      } catch (_) {}
      fmtPatInput();
      render();

      /* ---------- Preenchimento automático a partir da Aderência ---------- */
      window.__fillConstrutorFromAderencia = function (data) {
        if (!data) return;
        if (data.patrimonio) {
          S.patrimonio = Math.round(data.patrimonio);
          fmtPatInput();
        }
        if (data.conta) {
          var nome = "Conta " + data.conta;
          S.cliente = nome;
          var el = document.getElementById("cliente");
          if (el) el.value = nome;
        }
        render();
      };

      /* ---------- Modo Carteira completa <-> Renda Variável (agora controlado pelas abas) ---------- */
      window.__setCtorMode = function (mode) {
        var toggle = document.getElementById("rvToggle");
        var full = document.getElementById("construtorFull");
        var rv = document.getElementById("construtorRv");
        var sub = document.getElementById("construtorSub");
        var btnCopy = document.getElementById("btnCopy");
        var btnPng = document.getElementById("btnPng");
        var btnProj = document.getElementById("btnProj");
        if (!full || !rv) return;
        if (toggle)
          toggle.querySelectorAll(".rv-toggle-opt").forEach(function (x) {
            x.classList.toggle("active", x.getAttribute("data-mode") === mode);
          });
        if (mode === "rv") {
          full.style.display = "none";
          rv.style.display = "block";
          if (sub)
            sub.textContent =
              "Construtor · Renda Variável · ações, operações estruturadas e Quanto";
          if (btnCopy) btnCopy.style.display = "none";
          if (btnPng) btnPng.style.display = "none";
          if (btnProj) btnProj.style.display = "none";
          if (typeof window.__rvInit === "function") {
            window.__rvInit();
          } else if (typeof window.__rvRender === "function") {
            window.__rvRender();
          }
        } else {
          full.style.display = "block";
          rv.style.display = "none";
          if (sub)
            sub.textContent =
              "Montar a Carteira · ajuste ao vivo durante a ligação";
          if (btnCopy) btnCopy.style.display = "";
          if (btnPng) btnPng.style.display = "";
          if (btnProj) btnProj.style.display = "";
        }
      };
      (function () {
        var toggle = document.getElementById("rvToggle");
        if (!toggle) return;
        toggle.querySelectorAll(".rv-toggle-opt").forEach(function (b) {
          b.onclick = function () {
            window.__setCtorMode(b.getAttribute("data-mode"));
          };
        });
      })();
    })();
  };
})();
