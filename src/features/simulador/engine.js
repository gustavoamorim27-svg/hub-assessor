// Migrated from Hub v1. Review domain assumptions separately from interface changes.

(function () {
  var _done = false;
  window._toolInit["simulador"] = function () {
    if (_done) return;
    _done = true;
    (function () {
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
      // ============ ESTADOS DO BRASIL ============
      const UF_NOME = {
        AC: "Acre",
        AL: "Alagoas",
        AP: "Amapá",
        AM: "Amazonas",
        BA: "Bahia",
        CE: "Ceará",
        DF: "Distrito Federal",
        ES: "Espírito Santo",
        GO: "Goiás",
        MA: "Maranhão",
        MT: "Mato Grosso",
        MS: "Mato Grosso do Sul",
        MG: "Minas Gerais",
        PA: "Pará",
        PB: "Paraíba",
        PR: "Paraná",
        PE: "Pernambuco",
        PI: "Piauí",
        RJ: "Rio de Janeiro",
        RN: "Rio Grande do Norte",
        RS: "Rio Grande do Sul",
        RO: "Rondônia",
        RR: "Roraima",
        SC: "Santa Catarina",
        SP: "São Paulo",
        SE: "Sergipe",
        TO: "Tocantins",
      };

      // ============ INSTITUIÇÕES (sugestões) ============
      const INSTITUICOES = [
        "Banco do Brasil",
        "Itaú",
        "Bradesco",
        "Santander",
        "Caixa",
        "Safra",
        "Nubank",
        "Inter",
        "C6 Bank",
        "BTG Pactual",
        "XP Investimentos",
        "PicPay",
        "Sicredi",
        "Outra",
      ];

      // ============ DADOS DO CDI ============
      const cdiMensalHist = [
        0.86, 0.81, 0.83, 0.86, 0.86, 0.81, 0.91, 0.86, 0.84, 0.92, 0.81, 0.94,
        1.05, 0.98, 0.98, 1.06, 1.05, 1.1, 1.15, 1.2, 1.18, 1.2, 1.18, 1.2,
      ];
      function projetarCdiMensal(meses) {
        const inicio = (0.0145 / 12) * 100;
        const fim = (0.1 / 12) * 100;
        const out = [];
        for (let i = 0; i < meses; i++) {
          const t = Math.min(i / 120, 1);
          const eased = t * t * (3 - 2 * t);
          out.push(inicio + (fim - inicio) * eased);
        }
        return out;
      }
      const cdiMensalProj = projetarCdiMensal(360);
      const cdiMensal = [...cdiMensalHist, ...cdiMensalProj];
      function cdiMensalAt(i) {
        if (state.cdiAnual != null && state.cdiAnual > 0 && i >= 24) {
          return (Math.pow(1 + state.cdiAnual / 100, 1 / 12) - 1) * 100;
        }
        return cdiMensal[i];
      }
      function getTotalMeses() {
        return 24 + 12 * state.prazoAnos;
      }

      // ============ IPCA E OBJETIVO (renda × 100, corrigido pela inflação) ============
      // Fator de inflação acumulada para `meses` a partir de hoje (pode ser negativo p/ histórico)
      function fatorIpca(meses) {
        return Math.pow(1 + (state.ipca || 0) / 100, meses / 12);
      }
      // Patrimônio necessário hoje p/ a renda desejada (1% a.m. => 100× a renda)
      function objetivoBase() {
        return state.rendaMensal * 100;
      }
      // Objetivo NOMINAL no índice i do array (índice 24 = hoje), corrigido por IPCA
      function objetivoNoMesIndex(i) {
        return objetivoBase() * fatorIpca(i - 24);
      }

      // ============ PADRÕES ============
      // Cores por classe de ativo — produtos da mesma classe compartilham a cor
      const CAT_COLORS = {
        "Renda Fixa": "#5B8DEF",
        Multimercados: "#9B6BFF",
        "Renda Variável": "#F26522",
        "Fundos Listados": "#F5B942",
        Alternativos: "#2BD9A6",
        Internacional: "#41C7E8",
      };
      function corCat(cat) {
        return CAT_COLORS[cat] || "#8089BE";
      }
      // Cada item pode ter `options:[{name,descr,tags}]` (escolha entre alternativas) e `tags:[]`
      function montar(itens) {
        return itens.map((it) => {
          const obj = {
            cat: it.cat,
            pct: it.pct,
            color: corCat(it.cat),
            tags: it.tags || [],
          };
          if (Array.isArray(it.options) && it.options.length) {
            obj.options = it.options.map((o) => ({
              name: o.name,
              descr: o.descr,
              tags: o.tags || [],
            }));
            obj.optIndex = it.optIndex || 0;
            obj.name = obj.options[obj.optIndex].name;
            obj.descr = obj.options[obj.optIndex].descr;
          } else {
            obj.name = it.name;
            obj.descr = it.descr;
          }
          return obj;
        });
      }

      // Opções de pré-fixado compartilhadas (escolha entre o blend, XP Brasil ou CDB)
      const OPCOES_PRE = [
        {
          name: "50% XP Brasil + 50% CDB",
          descr: "50% XP Brasil 15% (5a) + 50% CDB pré 14,7% (3–5a)",
          tags: ["FGC parcial"],
        },
        {
          name: "XP Brasil 15%",
          descr: "Estruturado XP · taxa pré de 15% travada por 5 anos",
          tags: [],
        },
        {
          name: "CDB Pré 14,7%",
          descr: "CDB pré-fixado · taxa de 14,7% · 3–5 anos",
          tags: ["FGC"],
        },
      ];

      const TEMPLATES = {
        conservadora: montar([
          {
            cat: "Renda Fixa",
            name: "LCD",
            descr: "93% a 94% do CDI · 1–5 anos · isento de IR",
            pct: 72.5,
            tags: ["FGC"],
          },
          {
            cat: "Renda Fixa",
            name: "NTN-B",
            descr: "IPCA + 7,8% a.a. · Tesouro Direto",
            pct: 12.5,
            tags: ["Tesouro Direto"],
          },
          {
            cat: "Renda Fixa",
            name: "LTN",
            descr: "14% a.a. · Tesouro Direto",
            pct: 5,
            tags: ["Tesouro Direto"],
          },
          {
            cat: "Multimercados",
            name: "ACE Multicenários",
            descr: "Rentabilizou ~230% do CDI nos últimos anos",
            pct: 2.5,
          },
          {
            cat: "Fundos Listados",
            name: "JHSF Capital Malls",
            descr: "Shoppings premium da JHSF · trophy assets de alta renda",
            pct: 2.5,
          },
          {
            cat: "Internacional",
            name: "Renda Fixa Global",
            descr: "Crédito global em dólar · Certificate of Deposit",
            pct: 2.5,
          },
          {
            cat: "Internacional",
            name: "XP Global Ações",
            descr: "Ações globais — EUA, Europa e Reino Unido",
            pct: 2.5,
          },
        ]),
        moderada: montar([
          {
            cat: "Renda Fixa",
            name: "LCD",
            descr: "93/94% do CDI · 1–5 anos · isento de IR",
            pct: 35.5,
            tags: ["FGC"],
          },
          {
            cat: "Renda Fixa",
            name: "NTN-B",
            descr: "IPCA + 7,8% a.a. · Tesouro Direto",
            pct: 22.5,
            tags: ["Tesouro Direto"],
          },
          {
            cat: "Renda Fixa",
            name: "LTN",
            descr: "14% a.a. · Tesouro Direto",
            pct: 10,
            tags: ["Tesouro Direto"],
          },
          {
            cat: "Multimercados",
            name: "XP Forças Armadas",
            descr: "Defesa dos EUA (Palantir e afins) · 5 anos",
            pct: 7,
            tags: ["proteção"],
          },
          {
            cat: "Multimercados",
            name: "ACE Multicenários",
            descr: "Rentabilizou ~230% do CDI nos últimos anos",
            pct: 7,
          },
          {
            cat: "Renda Variável",
            name: "BOVA11 Protegida",
            descr:
              "Proteção total · participa da alta até 28% (15% acima) · Collar UI de 2 anos",
            pct: 5,
            tags: ["proteção"],
          },
          {
            cat: "Fundos Listados",
            name: "JHSF Capital Malls",
            descr: "Shoppings premium · trophy assets de alta renda",
            pct: 4,
          },
          {
            cat: "Alternativos",
            name: "Ouro — Retorno Otimizado",
            descr: "Exposição a ouro com estrutura otimizada · 3 a 5 anos",
            pct: 3,
            tags: ["proteção"],
          },
          {
            cat: "Internacional",
            name: "Wellington Global Quality",
            descr: "100% ações dos EUA, Europa e Reino Unido · +75% em 3 anos",
            pct: 3.5,
          },
          {
            cat: "Internacional",
            name: "CD de 1 ano",
            descr: "Certificate of Deposit · 1 ano pré-fixado em dólar",
            pct: 2.5,
          },
        ]),
        sofisticada: montar([
          {
            cat: "Renda Fixa",
            name: "LCD",
            descr: "93/94% do CDI · isento de IR",
            pct: 16,
            tags: ["FGC"],
          },
          {
            cat: "Renda Fixa",
            name: "NTN-B",
            descr: "IPCA + 7,8% a.a. · Tesouro Direto",
            pct: 27.5,
            tags: ["Tesouro Direto"],
          },
          {
            cat: "Renda Fixa",
            name: "LTN",
            descr: "14% a.a. · Tesouro Direto",
            pct: 7.5,
            tags: ["Tesouro Direto"],
          },
          {
            cat: "Multimercados",
            name: "ACE Multicenários",
            descr: "Rentabilizou ~230% do CDI nos últimos anos",
            pct: 7,
          },
          {
            cat: "Multimercados",
            name: "XP Terras Raras",
            descr:
              "Terras raras e minerais críticos · eletrificação, defesa e disputa EUA–China",
            pct: 3,
          },
          {
            cat: "Renda Variável",
            name: "BOVA11",
            descr:
              "ETF do Ibovespa · Collar UI de 2 anos, proteção total com alta limitada",
            pct: 3,
            tags: ["proteção"],
          },
          {
            cat: "Renda Variável",
            name: "BPAC11",
            descr: "BTG Pactual · SmartCupom, cupom de 8% em 8 meses",
            pct: 3,
            tags: ["proteção"],
          },
          {
            cat: "Renda Variável",
            name: "ITUB",
            descr:
              "Itaú Unibanco · Fence de 1 ano, proteção parcial com alta limitada",
            pct: 3,
            tags: ["proteção"],
          },
          {
            cat: "Renda Variável",
            name: "Microsoft",
            descr:
              "Software e nuvem (Azure), líder em IA corporativa · Collar UI de 2 anos",
            pct: 3,
            tags: ["proteção"],
          },
          {
            cat: "Renda Variável",
            name: "AXIA3",
            descr: "Axia Energia (ex-Eletrobras) · Collar UI de 1 ano e meio",
            pct: 3,
            tags: ["proteção"],
          },
          {
            cat: "Fundos Listados",
            name: "JHSF Capital Malls",
            descr:
              "Shoppings premium da JHSF · trophy assets, DY de dois dígitos",
            pct: 3.5,
          },
          {
            cat: "Fundos Listados",
            name: "XP Logístico Prime",
            descr:
              "Galpões logísticos locados a Carrefour, Amazon, Mercado Livre e Shopee",
            pct: 2,
          },
          {
            cat: "Fundos Listados",
            name: "XPAG",
            descr:
              "XP Crédito Agro (Fiagro) · CRAs e CRIs do agro · renda mensal isenta de IR",
            pct: 2,
          },
          {
            cat: "Fundos Listados",
            name: "XP Habitat 2",
            descr:
              "FII de papel · CRIs pulverizados de incorporação residencial",
            pct: 2,
          },
          {
            cat: "Alternativos",
            name: "XP Tecnologia",
            descr: "QQQ (Nasdaq-100) protegido de 1 ano",
            pct: 3,
            tags: ["proteção"],
          },
          {
            cat: "Alternativos",
            name: "Ouro Retorno Otimizado",
            descr: "Exposição a ouro com estrutura otimizada",
            pct: 4,
            tags: ["proteção"],
          },
          {
            cat: "Internacional",
            name: "Wellington Global Quality",
            descr: "100% ações dos EUA, Europa e Reino Unido · +75% em 3 anos",
            pct: 5,
          },
          {
            cat: "Internacional",
            name: "Renda Fixa Global",
            descr: "Crédito global em dólar · Certificate of Deposit",
            pct: 2.5,
          },
        ]),
      };
      let FP_VIEW = "produtos";
      try {
        var _fv = window.hubStorage.getItem("hubFpView");
        if (_fv === "classes" || _fv === "produtos") FP_VIEW = _fv;
      } catch (e) {}
      function clonarTemplate(id) {
        // DINÂMICO: espelha 1:1 a carteira ideal do Montar a Carteira (RICO_TEMPLATES já aplica os overrides salvos pelo usuário)
        // Se a visão for "classes", usa a versão genérica (mesmas proporções, sem produtos).
        try {
          var nameMap = {
            conservadora: "Conservadora",
            moderada: "Moderada",
            sofisticada: "Sofisticada",
          };
          var pname = nameMap[id];
          var T =
            FP_VIEW === "classes" && window.RICO_GENERIC_TEMPLATES
              ? window.RICO_GENERIC_TEMPLATES
              : window.RICO_TEMPLATES;
          if (!T) {
            try {
              if (window._toolInit && window._toolInit["construtor"])
                window._toolInit["construtor"]();
            } catch (e) {}
            T =
              FP_VIEW === "classes" && window.RICO_GENERIC_TEMPLATES
                ? window.RICO_GENERIC_TEMPLATES
                : window.RICO_TEMPLATES;
          }
          if (T && pname && typeof T[pname] === "function") {
            var arr = T[pname]() || [];
            if (arr.length) {
              return arr
                .filter(function (it) {
                  return (Number(it.pct) || 0) > 0;
                })
                .map(function (it) {
                  return {
                    cat: it.classe || "Renda Fixa",
                    name: it.nome || "",
                    descr: it.detalhe || "",
                    pct: Number(it.pct) || 0,
                    color: corCat(it.classe || ""),
                    tags: (it.tags || []).slice(),
                  };
                });
            }
          }
        } catch (e) {}
        // FALLBACK estático
        const t = TEMPLATES[id] || TEMPLATES.conservadora;
        return t.map((a) => {
          const c = {
            cat: a.cat,
            name: a.name,
            descr: a.descr,
            pct: a.pct,
            color: a.color,
            tags: (a.tags || []).slice(),
          };
          if (a.options) {
            c.options = a.options.map((o) => ({
              name: o.name,
              descr: o.descr,
              tags: (o.tags || []).slice(),
            }));
            c.optIndex = a.optIndex || 0;
          }
          return c;
        });
      }
      function alocacaoPadrao() {
        return clonarTemplate("conservadora");
      }

      // Mapa nome do ativo -> tags, derivado dos templates.
      // Recupera tags (FGC/proteção) de estados salvos antes da existência das tags.
      const TAGS_POR_NOME = (function () {
        const m = {};
        Object.values(TEMPLATES).forEach((t) =>
          t.forEach((a) => {
            if (a.name && (a.tags || []).length) m[a.name] = a.tags.slice();
            if (a.options)
              a.options.forEach((o) => {
                if (o.name && (o.tags || []).length) m[o.name] = o.tags.slice();
              });
          }),
        );
        return m;
      })();
      function tagsRecuperadas(nome, salvas) {
        if (Array.isArray(salvas) && salvas.length) return salvas;
        return nome && TAGS_POR_NOME[nome] ? TAGS_POR_NOME[nome].slice() : [];
      }

      // Tonalidades: gera variações da cor da classe para distinguir sub-ativos no donut
      function _hexRgb(h) {
        h = String(h).replace("#", "");
        return [
          parseInt(h.slice(0, 2), 16),
          parseInt(h.slice(2, 4), 16),
          parseInt(h.slice(4, 6), 16),
        ];
      }
      function _rgbHex(r, g, b) {
        const c = (v) =>
          ("0" + Math.round(Math.max(0, Math.min(255, v))).toString(16)).slice(
            -2,
          );
        return "#" + c(r) + c(g) + c(b);
      }
      function _mixCor(hex, alvo, t) {
        const a = _hexRgb(hex),
          b = _hexRgb(alvo);
        return _rgbHex(
          a[0] + (b[0] - a[0]) * t,
          a[1] + (b[1] - a[1]) * t,
          a[2] + (b[2] - a[2]) * t,
        );
      }
      function atribuirTonalidades(lista) {
        const total = {},
          idx = {};
        lista.forEach((a) => {
          total[a.cat] = (total[a.cat] || 0) + 1;
        });
        lista.forEach((a) => {
          const n = total[a.cat];
          const i = idx[a.cat] || 0;
          idx[a.cat] = i + 1;
          if (n <= 1) {
            a.shade = a.color;
            return;
          }
          const f = i / (n - 1) - 0.5; // -0.5 (mais escuro) .. +0.5 (mais claro)
          a.shade =
            f >= 0
              ? _mixCor(a.color, "#FFFFFF", f * 0.8)
              : _mixCor(a.color, "#0A0F38", -f * 0.7);
        });
      }

      // Cor -> rgba (fundos translúcidos dos ícones)
      function hexA(hex, al) {
        const c = _hexRgb(hex);
        return `rgba(${c[0]},${c[1]},${c[2]},${al})`;
      }

      // Ícones SVG (linha) usados nos cartões de informação
      function iconeSvg(tipo) {
        const P = {
          escudo:
            '<path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z"/><path d="M8.5 12l2.2 2.2L15.5 9.5"/>',
          inflacao:
            '<path d="M3 17l5.5-5.5 3.5 3.5L21 6"/><path d="M15 6h6v6"/>',
          globo:
            '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.8 2.6 2.8 15.4 0 18M12 3c-2.8 2.6-2.8 15.4 0 18"/>',
          multi: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
          predio:
            '<path d="M3 21h18"/><path d="M3 9l1.6-5h14.8L21 9"/><path d="M5 9v12M19 9v12"/><path d="M9 21v-6h6v6"/>',
        };
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${P[tipo] || P.escudo}</svg>`;
      }

      // Informações por ativo — formato visual: ícone + resumo curto + pontos-chave
      const INFO_ATIVOS = {
        "Pós-fixado LCA/LCD": {
          icon: "escudo",
          resumo: "Renda fixa isenta e garantida",
          pontos: [
            "Isento de IR · coberto pelo FGC",
            "93–94% do CDI",
            "Emissores sólidos: SICOOB · BNDES · BRDE",
            "1–5 anos · resgate trabalhado",
          ],
        },
        "Inflação LCA": {
          icon: "inflacao",
          resumo: "Ganho real acima da inflação",
          pontos: [
            "IPCA + 6% ao ano",
            "Isento de IR · coberto pelo FGC",
            "Emissores de 1ª linha (Caixa, grandes bancos)",
            "Protege o poder de compra",
          ],
        },
        "Pré-fixado XP Brasil Bond Repack": {
          icon: "globo",
          resumo: "Taxa travada no risco Brasil",
          pontos: [
            "≈15% pré-fixado por 5 anos",
            "Título soberano do Brasil emitido no exterior",
            "Taxas superiores às do mercado externo",
            "Garantia do Tesouro Nacional (sem FGC)",
          ],
        },
        "ACE Multicenários": {
          icon: "multi",
          resumo: "Multimercado global quantitativo",
          pontos: [
            "Gestão ACE Capital",
            "Juros, moedas, ações e commodities",
            "Busca superar o CDI",
            "Risco controlado e diversificado",
          ],
        },
        "ACE Multicenário": {
          icon: "multi",
          resumo: "Multimercado global quantitativo",
          pontos: [
            "Gestão ACE Capital",
            "Juros, moedas, ações e commodities",
            "Busca superar o CDI",
            "Risco controlado e diversificado",
          ],
        },
        "JHSF Capital Malls": {
          icon: "predio",
          resumo: "Shoppings de alto padrão · JCCJ11",
          pontos: [
            "Cidade Jardim · Catarina Outlet · Shops Jardins",
            "Renda recorrente isenta de IR",
            "Vacância próxima de zero",
            "PL ~R$ 1,8 bi · gestão JHSF",
          ],
        },
        "XP Global": {
          icon: "globo",
          resumo: "Diversificação global ativa",
          pontos: [
            "Renda fixa + variável no exterior",
            "Macro, long&short e sistemática",
            "Diversificação cambial e geográfica",
            "Composição varia — ver lâmina",
          ],
        },
        "XP Global Strategy": {
          icon: "globo",
          resumo: "Diversificação global ativa",
          pontos: [
            "Renda fixa + variável no exterior",
            "Macro, long&short e sistemática",
            "Diversificação cambial e geográfica",
            "Composição varia — ver lâmina",
          ],
        },
      };
      function infoAtivo(a) {
        const nome =
          a.options && a.options[a.optIndex]
            ? a.options[a.optIndex].name
            : a.name;
        return INFO_ATIVOS[nome] || null;
      }
      function protecaoPadrao() {
        return [
          {
            id: "wholelife",
            name: "Whole Life",
            descr: "Seguro vitalício · a linha mais completa",
            on: false,
            destaque: true,
          },
          {
            id: "seguro",
            name: "Seguro de Vida",
            descr: "Proteção familiar / sucessão",
            on: false,
          },
          {
            id: "prev",
            name: "Previdência (PGBL/VGBL)",
            descr: "Planejamento de longo prazo",
            on: false,
          },
          {
            id: "holding",
            name: "Holding",
            descr: "Estruturação patrimonial e sucessória",
            on: false,
          },
        ];
      }

      // ============ ESTADO ============
      const state = {
        valor: 100000,
        aporteMensal: 0,
        pctCdi: 120,
        prazoAnos: 20,
        rentMode: "ipca",
        ipcaSpread: 6,
        rendaMensal: 10000,
        ipca: 4.5,
        ajustarIpca: false,
        cdiAnual: 10,
        nomeCliente: "",
        template: "conservadora",
        protecao: protecaoPadrao(),
        alocacao: alocacaoPadrao(),
        imoveis: [],
        externos: [],
        objetivos: [],
        // Ciclo de vida / aporte
        aporteMode: "direto",
        rendaAtual: 12000,
        despesaMensal: 8000,
        idadeAtual: 40,
        expectativa: 100,
      };
      // Aporte efetivo conforme o modo escolhido (direto x renda-despesa)
      function aporteEfetivo() {
        if (state.aporteMode === "rendadespesa")
          return Math.max(
            0,
            (state.rendaAtual || 0) - (state.despesaMensal || 0),
          );
        return state.aporteMensal || 0;
      }

      // ============ PERSISTÊNCIA (salva no navegador) ============
      const STORAGE_KEY = "rico-simulador-v1";
      function salvarEstado() {
        try {
          const dados = {
            valor: state.valor,
            aporteMensal: state.aporteMensal,
            pctCdi: state.pctCdi,
            aporteMode: state.aporteMode,
            rendaAtual: state.rendaAtual,
            despesaMensal: state.despesaMensal,
            idadeAtual: state.idadeAtual,
            expectativa: state.expectativa,
            rentMode: state.rentMode,
            ipcaSpread: state.ipcaSpread,
            prazoAnos: state.prazoAnos,
            rendaMensal: state.rendaMensal,
            ipca: state.ipca,
            cdiAnual: state.cdiAnual,
            ajustarIpca: state.ajustarIpca,
            nomeCliente: state.nomeCliente,
            protecao: state.protecao.map((p) => ({ id: p.id, on: p.on })),
            template: state.template,
            alocacao: state.alocacao.map((a) => {
              const o = {
                cat: a.cat,
                name: a.name,
                descr: a.descr,
                pct: a.pct,
                color: a.color,
                tags: a.tags || [],
              };
              if (a.options) {
                o.options = a.options.map((x) => ({
                  name: x.name,
                  descr: x.descr,
                  tags: x.tags || [],
                }));
                o.optIndex = a.optIndex || 0;
              }
              return o;
            }),
            imoveis: state.imoveis.map((i) => ({
              estado: i.estado,
              tipo: i.tipo,
              quantidade: i.quantidade,
              valor: i.valor,
            })),
            externos: state.externos.map((i) => ({
              instituicao: i.instituicao,
              descricao: i.descricao,
              valor: i.valor,
            })),
            objetivos: state.objetivos.map((o) => ({
              tipo: o.tipo,
              descricao: o.descricao,
              valor: o.valor,
              ano: o.ano,
            })),
          };
          window.hubStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        } catch (e) {
          /* preview/CSP ou modo privado — segue sem salvar */
        }
      }
      function carregarEstado() {
        try {
          const raw = window.hubStorage.getItem(STORAGE_KEY);
          if (!raw) return false;
          const d = JSON.parse(raw);
          if (typeof d.valor === "number") state.valor = d.valor;
          if (typeof d.aporteMensal === "number")
            state.aporteMensal = d.aporteMensal;
          if (d.aporteMode === "direto" || d.aporteMode === "rendadespesa")
            state.aporteMode = d.aporteMode;
          if (typeof d.rendaAtual === "number") state.rendaAtual = d.rendaAtual;
          if (typeof d.despesaMensal === "number")
            state.despesaMensal = d.despesaMensal;
          if (typeof d.idadeAtual === "number") state.idadeAtual = d.idadeAtual;
          if (typeof d.expectativa === "number")
            state.expectativa = d.expectativa;
          if (typeof d.pctCdi === "number") state.pctCdi = d.pctCdi;
          if (d.rentMode === "ipca" || d.rentMode === "cdi")
            state.rentMode = d.rentMode;
          if (typeof d.ipcaSpread === "number") state.ipcaSpread = d.ipcaSpread;
          if (typeof d.prazoAnos === "number") state.prazoAnos = d.prazoAnos;
          if (typeof d.rendaMensal === "number")
            state.rendaMensal = d.rendaMensal;
          else if (typeof d.objetivo === "number")
            state.rendaMensal = d.objetivo / 100; // compat: objetivo antigo -> renda
          if (typeof d.ipca === "number") state.ipca = d.ipca;
          if ("cdiAnual" in d) state.cdiAnual = d.cdiAnual;
          if (typeof d.ajustarIpca === "boolean")
            state.ajustarIpca = d.ajustarIpca;
          if (typeof d.nomeCliente === "string")
            state.nomeCliente = d.nomeCliente;
          if (Array.isArray(d.protecao)) {
            d.protecao.forEach((item) => {
              if (item && typeof item === "object") {
                const alvo = state.protecao.find((p) => p.id === item.id);
                if (alvo) alvo.on = !!item.on;
              }
            });
          }
          if (typeof d.template === "string") state.template = d.template;
          if (Array.isArray(d.alocacao) && d.alocacao.length) {
            if (typeof d.alocacao[0] === "object" && d.alocacao[0] !== null) {
              state.alocacao = d.alocacao.map((a) => {
                const o = {
                  cat: a.cat || "Outros",
                  name: a.name || "",
                  descr: a.descr || "",
                  pct: Number(a.pct) || 0,
                  color: a.color || corCat(a.cat),
                  tags: tagsRecuperadas(a.name, a.tags),
                };
                if (Array.isArray(a.options) && a.options.length) {
                  o.options = a.options.map((x) => ({
                    name: x.name || "",
                    descr: x.descr || "",
                    tags: tagsRecuperadas(x.name, x.tags),
                  }));
                  o.optIndex = Number(a.optIndex) || 0;
                }
                return o;
              });
            } else {
              d.alocacao.forEach((pct, i) => {
                if (state.alocacao[i]) state.alocacao[i].pct = Number(pct) || 0;
              });
            }
          }
          if (Array.isArray(d.imoveis)) {
            state.imoveis = d.imoveis
              .map((i) => ({
                id: novoIdImovel(),
                estado: i && i.estado ? String(i.estado) : "",
                tipo: i && i.tipo ? String(i.tipo) : "",
                quantidade: Math.max(1, Number(i && i.quantidade) || 1),
                valor: Math.max(0, Number(i && i.valor) || 0),
              }))
              .filter((i) => i.estado && i.valor > 0);
          }
          if (Array.isArray(d.externos)) {
            state.externos = d.externos
              .map((i) => ({
                id: novoIdImovel(),
                instituicao: i && i.instituicao ? String(i.instituicao) : "",
                descricao: i && i.descricao ? String(i.descricao) : "",
                valor: Math.max(0, Number(i && i.valor) || 0),
              }))
              .filter((i) => i.instituicao && i.valor > 0);
          }
          if (Array.isArray(d.objetivos)) {
            state.objetivos = d.objetivos
              .map((o) => ({
                id: novoIdImovel(),
                tipo: o && o.tipo ? String(o.tipo) : "Outro",
                descricao: o && o.descricao ? String(o.descricao) : "",
                valor: Math.max(0, Number(o && o.valor) || 0),
                ano: Math.max(1, Math.min(30, Number(o && o.ano) || 1)),
              }))
              .filter((o) => o.valor > 0);
          }
          return true;
        } catch (e) {
          return false;
        }
      }
      function limparEstado() {
        try {
          window.hubStorage.removeItem(STORAGE_KEY);
        } catch (e) {}
      }

      // ============ FORMATADORES ============
      const fmtBR = new Intl.NumberFormat("pt-BR", {
        maximumFractionDigits: 0,
      });
      const fmtBRdec = new Intl.NumberFormat("pt-BR", {
        maximumFractionDigits: 1,
        minimumFractionDigits: 1,
      });
      const f = (n) => fmtBR.format(Math.round(n));
      function fmtMoney(n) {
        return fmtBR.format(Math.round(Math.max(0, n)));
      }
      function parseNum(v) {
        if (typeof v === "number") return isFinite(v) ? v : 0;
        return Number(String(v).replace(/[^\d]/g, "")) || 0;
      }
      function valorAmigavel(v) {
        if (v >= 1e6) {
          const s = fmtBRdec.format(v / 1e6);
          return (s.endsWith(",0") ? s.slice(0, -2) : s) + " mi";
        }
        if (v >= 1000) return fmtBR.format(Math.round(v / 1000)) + " mil";
        return fmtBR.format(Math.round(v));
      }
      function novoIdImovel() {
        return (
          "im" +
          Date.now().toString(36) +
          Math.random().toString(36).slice(2, 6)
        );
      }
      function siglaInst(n) {
        const stop = ["do", "de", "da", "dos", "das", "e"];
        const words = String(n || "")
          .trim()
          .split(/\s+/)
          .filter((w) => !stop.includes(w.toLowerCase()));
        if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
        return (
          String(n || "")
            .replace(/\s/g, "")
            .slice(0, 2)
            .toUpperCase() || "?"
        );
      }
      function atualizarRendaObjetivo() {
        const el = document.getElementById("goalIncome");
        if (!el) return;
        if (state.rendaMensal <= 0) {
          el.innerHTML =
            '<span class="gi-cap">Defina a renda mensal desejada para calcular o patrimônio necessário.</span>';
          return;
        }
        const base = objetivoBase();
        const fim = objetivoNoMesIndex(getTotalMeses());
        const anosTxt =
          state.prazoAnos + (state.prazoAnos === 1 ? " ano" : " anos");
        el.innerHTML =
          "💰 Patrimônio necessário: <strong>R$ " +
          f(base) +
          "</strong>" +
          '<span class="gi-cap"> · 100× a renda (1% a.m.)</span><br>' +
          "📈 Corrigido por IPCA (" +
          fmtPct(state.ipca) +
          "% a.a.): <strong>R$ " +
          f(fim) +
          "</strong>" +
          '<span class="gi-cap"> em ' +
          anosTxt +
          " — preserva R$ " +
          f(state.rendaMensal) +
          "/mês de hoje</span>";
      }

      // ============ CÁLCULOS ============
      // Taxa MENSAL da carteira no índice i, conforme o modo de rentabilidade selecionado.
      function taxaCarteiraMensal(i) {
        if (state.rentMode === "ipca") {
          // IPCA + spread (a.a.) convertido para taxa mensal equivalente
          var anual =
            (1 + (state.ipca || 0) / 100) *
              (1 + (state.ipcaSpread || 0) / 100) -
            1;
          return Math.pow(1 + anual, 1 / 12) - 1;
        }
        // modo CDI: percentual aplicado sobre o CDI do período
        var taxaCdi = cdiMensalAt(i) / 100;
        return taxaCdi * (state.pctCdi / 100);
      }
      // Rótulo curto da rentabilidade da carteira conforme o modo
      function rentLabel() {
        if (state.rentMode === "ipca") {
          return "IPCA + " + fmtBRdec.format(state.ipcaSpread) + "% a.a.";
        }
        return state.pctCdi + "% do CDI";
      }
      function saidaObjetivosNoIndice(idx) {
        if (!Array.isArray(state.objetivos) || !state.objetivos.length)
          return 0;
        let s = 0;
        for (const o of state.objetivos) {
          if (!o) continue;
          const val = Number(o.valor) || 0,
            ano = Number(o.ano) || 0;
          if (val <= 0 || ano <= 0) continue;
          if (24 + Math.round(ano * 12) === idx) s += val;
        }
        return s;
      }
      function calcular() {
        const totalMeses = getTotalMeses();
        const aporte = aporteEfetivo();
        const cdi = [state.valor];
        const cart = [state.valor];
        const flat = [state.valor];
        let totalAportadoMes = state.valor;

        for (let i = 0; i < totalMeses; i++) {
          const taxaCdi = cdiMensalAt(i) / 100;
          const taxaCart = taxaCarteiraMensal(i);
          const apMes = i >= 24 ? aporte : 0;
          const ultCdi = cdi[cdi.length - 1];
          const ultCart = cart[cart.length - 1];
          let novoCdi = (ultCdi + apMes) * (1 + taxaCdi);
          let novoCart = (ultCart + apMes) * (1 + taxaCart);
          const saidaObj = saidaObjetivosNoIndice(i + 1);
          if (saidaObj > 0) {
            novoCdi = Math.max(0, novoCdi - saidaObj);
            novoCart = Math.max(0, novoCart - saidaObj);
          }
          cdi.push(novoCdi);
          cart.push(novoCart);
          if (i >= 24) totalAportadoMes += aporte;
          flat.push(totalAportadoMes);
        }
        return { cdi, cart, flat, totalMeses, totalAportado: totalAportadoMes };
      }

      // Séries para o gráfico: nominais ou deflacionadas pelo IPCA (poder de compra de hoje)
      function dadosExibicao() {
        const base = calcular();
        const adj = state.ajustarIpca;
        const cdiD = [],
          cartD = [],
          flatD = [],
          objArr = [];
        for (let i = 0; i <= base.totalMeses; i++) {
          const d = adj ? 1 / fatorIpca(i - 24) : 1;
          cdiD.push(base.cdi[i] * d);
          cartD.push(base.cart[i] * d);
          flatD.push(base.flat[i] * d);
          objArr.push(objetivoNoMesIndex(i) * d);
        }
        return Object.assign({}, base, { cdiD, cartD, flatD, objArr, adj });
      }

      function mesQueAtingeObjetivo(cart, totalMeses) {
        if (state.rendaMensal <= 0) return -1;
        for (let i = 24; i <= totalMeses; i++) {
          const alvo = objetivoNoMesIndex(i);
          if (cart[i] >= alvo) {
            const ant = cart[i - 1],
              at = cart[i];
            const alvoAnt = objetivoNoMesIndex(i - 1);
            // cruzamento entre a carteira (crescente) e a meta corrigida por IPCA (também crescente)
            const denom = at - ant - (alvo - alvoAnt);
            let frac = 0;
            if (Math.abs(denom) > 1e-9) frac = (alvoAnt - ant) / denom;
            frac = Math.max(0, Math.min(1, frac));
            const mesAbs = i - 1 + frac;
            return mesAbs - 24;
          }
        }
        return Infinity;
      }

      // ============ KPIs ============
      function renderKpis(cdi, cart, totalMeses, totalAportado) {
        const fim = totalMeses;
        const finalCdi = cdi[fim],
          finalCart = cart[fim];
        const delta = finalCart - finalCdi;
        const deltaPct = finalCdi > 0 ? (finalCart / finalCdi - 1) * 100 : 0;

        if (aporteEfetivo() > 0) {
          document.getElementById("kpiInv").textContent = f(totalAportado);
          document.getElementById("kpiInvLabel").textContent = "Total aportado";
          document.getElementById("kpiInvSub").textContent =
            `R$ ${f(state.valor)} inicial + R$ ${f(aporteEfetivo())}/mês`;
        } else {
          document.getElementById("kpiInv").textContent = f(state.valor);
          document.getElementById("kpiInvLabel").textContent =
            "Valor investido";
          document.getElementById("kpiInvSub").textContent = "capital inicial";
        }

        document.getElementById("kpiCdi").textContent = f(finalCdi);
        document.getElementById("kpiCart").textContent = f(finalCart);
        var kpiCartSub = document.getElementById("kpiCartSub");
        if (kpiCartSub) kpiCartSub.textContent = rentLabel();
        document.getElementById("kpiDelta").textContent = f(Math.max(0, delta));
        document.getElementById("kpiDeltaPct").textContent =
          (deltaPct >= 0 ? "+" : "") + fmtBRdec.format(deltaPct);

        const anos = state.prazoAnos;
        document.getElementById("kpiCdiLabel").textContent =
          `Montante CDI (${anos} anos)`;
        document.getElementById("kpiCartLabel").textContent =
          `Montante da carteira (${anos} anos)`;
      }

      // ============ BANNER DO OBJETIVO ============
      function renderGoalBanner(cart, totalMeses) {
        const banner = document.getElementById("goalBanner");
        const icon = document.getElementById("gbIcon");
        const title = document.getElementById("gbTitle");
        const desc = document.getElementById("gbDesc");
        const big = document.getElementById("gbBig");
        const small = document.getElementById("gbSmall");
        const nome = state.nomeCliente
          ? escapeHtml(state.nomeCliente.split(" ")[0])
          : "O cliente";
        const finalCart = cart[totalMeses];
        const objFim = objetivoNoMesIndex(totalMeses); // patrimônio-alvo nominal (corrigido por IPCA)

        big.textContent = "R$ " + valorAmigavel(state.rendaMensal);
        small.textContent = "/mês desejado";

        if (state.rendaMensal <= 0) {
          banner.className = "goal-banner far";
          icon.textContent = "🎯";
          title.textContent = "Defina a renda mensal desejada";
          desc.textContent =
            "Informe quanto o cliente quer receber por mês para calcular o patrimônio necessário (100× a renda, corrigido por IPCA).";
          big.textContent = "—";
          return;
        }

        const mesAtinge = mesQueAtingeObjetivo(cart, totalMeses);

        if (mesAtinge === Infinity) {
          const pctAtingido = (finalCart / objFim) * 100;
          banner.className = "goal-banner far";
          icon.textContent = "⚠️";
          title.textContent = "Fora do caminho no prazo atual";
          desc.innerHTML = `${nome} acumula <strong>R$ ${valorAmigavel(finalCart)}</strong> em ${state.prazoAnos} anos — <strong>${fmtBRdec.format(pctAtingido)}%</strong> do patrimônio necessário (<strong>R$ ${valorAmigavel(objFim)}</strong>, corrigido por IPCA) para uma renda de <strong>R$ ${valorAmigavel(state.rendaMensal)}/mês</strong>. Sugira aumentar o aporte, o prazo ou a rentabilidade.`;
          small.textContent = `${fmtBRdec.format(pctAtingido)}% atingido`;
        } else {
          const anos = Math.floor(mesAtinge / 12);
          const meses = Math.round(mesAtinge % 12);
          let tempoTxt;
          if (anos <= 0) tempoTxt = `${meses} ${meses === 1 ? "mês" : "meses"}`;
          else if (meses === 0)
            tempoTxt = `${anos} ${anos === 1 ? "ano" : "anos"}`;
          else
            tempoTxt = `${anos} ${anos === 1 ? "ano" : "anos"} e ${meses} ${meses === 1 ? "mês" : "meses"}`;

          banner.className = "goal-banner ok";
          icon.textContent = "🚀";
          title.textContent = `No caminho! Renda atingível em ${tempoTxt}`;
          desc.innerHTML = `Mantendo <strong>${rentLabel()}</strong>${aporteEfetivo() > 0 ? ` e aportes de <strong>R$ ${f(aporteEfetivo())}/mês</strong>` : ""}, ${nome} acumula o patrimônio necessário (<strong>R$ ${valorAmigavel(objFim)}</strong> corrigido por IPCA) para uma renda de <strong>R$ ${valorAmigavel(state.rendaMensal)}/mês</strong> em poder de compra de hoje, antes do fim do prazo.`;
          small.textContent = `em ${tempoTxt}`;

          if (mesAtinge > state.prazoAnos * 12 * 0.8) {
            banner.className = "goal-banner near";
            icon.textContent = "⏳";
            title.textContent = `No limite — atinge em ${tempoTxt}`;
            desc.innerHTML = `${nome} acumula o patrimônio para a renda de <strong>R$ ${valorAmigavel(state.rendaMensal)}/mês</strong>, mas só perto do fim do prazo. Uma folga maior viria com mais aporte ou rentabilidade.`;
          }
        }
      }

      // ============ GRÁFICO ============
      function drawChart() {
        const data = dadosExibicao();
        const {
          cdi,
          cart,
          totalMeses,
          totalAportado,
          cdiD,
          cartD,
          flatD,
          objArr,
          adj,
        } = data;
        renderKpis(cdi, cart, totalMeses, totalAportado);
        renderGoalBanner(cart, totalMeses);
        renderSucessao();

        const W = 1100,
          H = 460;
        const padL = 95,
          padR = 30,
          padT = 35,
          padB = 56;
        const cw = W - padL - padR,
          ch = H - padT - padB;

        const xMesMin = -24;
        const xMesMax = state.prazoAnos * 12;
        const X = (m) => padL + ((m - xMesMin) / (xMesMax - xMesMin)) * cw;

        let vmax = 0;
        for (let i = 0; i <= totalMeses; i++)
          vmax = Math.max(vmax, cdiD[i], cartD[i]);
        const objEndDisp = state.rendaMensal > 0 ? objArr[totalMeses] : 0;
        const objVisivel = state.rendaMensal > 0 && objEndDisp <= vmax * 2.2;
        if (objVisivel) {
          for (let i = 24; i <= totalMeses; i++)
            vmax = Math.max(vmax, objArr[i]);
        }
        vmax = vmax * 1.06;
        const niceMax = (v) => {
          if (v <= 0) return 1;
          const exp = Math.pow(10, Math.floor(Math.log10(v)));
          const m = v / exp;
          let nice;
          if (m <= 1) nice = 1;
          else if (m <= 2) nice = 2;
          else if (m <= 5) nice = 5;
          else nice = 10;
          return nice * exp;
        };
        vmax = niceMax(vmax);
        const vmin = 0;
        const Y = (v) => padT + ch - ((v - vmin) / (vmax - vmin)) * ch;

        const pts = (arr) => {
          const out = [];
          for (let i = 0; i <= totalMeses; i++) {
            const m = i + xMesMin;
            out.push(`${X(m).toFixed(1)},${Y(arr[i]).toFixed(1)}`);
          }
          return out.join(" ");
        };
        const ptsCdi = pts(cdiD);
        const ptsCart = pts(cartD);
        const ptsFlat = pts(flatD);
        const areaCart = `${X(xMesMin).toFixed(1)},${Y(vmin).toFixed(1)} ${ptsCart} ${X(xMesMax).toFixed(1)},${Y(vmin).toFixed(1)}`;

        const yLabels = [];
        for (let i = 0; i <= 4; i++) {
          const v = (vmax * (4 - i)) / 4;
          const txt =
            v >= 1e6
              ? `R$ ${(v / 1e6).toFixed(v >= 1e7 ? 0 : 1).replace(".", ",")} mi`
              : v >= 1000
                ? `R$ ${Math.round(v / 1000)} mil`
                : `R$ ${Math.round(v)}`;
          yLabels.push({ y: padT + (ch * i) / 4, txt });
        }

        function gerarTicks(prazo) {
          const t = [-24, 0];
          if (prazo <= 3)
            [12, 24, 36].forEach((m) => m <= prazo * 12 && t.push(m));
          else if (prazo <= 5)
            [12, 24, 36, 48, 60].forEach((m) => m <= prazo * 12 && t.push(m));
          else if (prazo <= 10) [24, 60, prazo * 12].forEach((m) => t.push(m));
          else if (prazo <= 20)
            [60, 120, 180, prazo * 12].forEach(
              (m) => m <= prazo * 12 && t.push(m),
            );
          else
            [60, 120, 180, 240, 300, prazo * 12].forEach(
              (m) => m <= prazo * 12 && t.push(m),
            );
          return [...new Set(t)].sort((a, b) => a - b);
        }
        const xTicks = gerarTicks(state.prazoAnos);
        const lblX = (m) => {
          if (m === 0) return "Hoje";
          if (m < 0) {
            const a = Math.abs(m / 12);
            return `-${a} ano${a > 1 ? "s" : ""}`;
          }
          const a = m / 12;
          return `+${a} ano${a > 1 ? "s" : ""}`;
        };

        // ----- linha/curva do patrimônio-alvo (corrigido por IPCA) -----
        let objetivoSvg = "";
        const mesAtinge = mesQueAtingeObjetivo(cart, totalMeses);
        if (objVisivel) {
          // só a partir de hoje (índice 24)
          const ptsObj = [];
          for (let i = 24; i <= totalMeses; i++)
            ptsObj.push(
              `${X(i + xMesMin).toFixed(1)},${Y(objArr[i]).toFixed(1)}`,
            );
          const yEnd = Y(objArr[totalMeses]);
          objetivoSvg += `
      <polyline fill="none" stroke="#F5B942" stroke-width="2" stroke-dasharray="8 5" opacity="0.9" points="${ptsObj.join(" ")}"/>
      <rect x="${W - padR - 128}" y="${(yEnd - 26).toFixed(1)}" width="120" height="22" rx="6" fill="#F5B942"/>
      <text x="${W - padR - 68}" y="${(yEnd - 11).toFixed(1)}" fill="#0A0F38" font-family="Manrope" font-size="11"
        font-weight="800" text-anchor="middle" letter-spacing=".5">🎯 R$ ${valorAmigavel(objArr[totalMeses])}</text>
    `;
          if (mesAtinge !== Infinity && mesAtinge >= 0) {
            const xc = X(mesAtinge);
            const tgtNom = objetivoBase() * fatorIpca(mesAtinge);
            const yc = Y(adj ? objetivoBase() : tgtNom);
            objetivoSvg += `
        <line x1="${xc.toFixed(1)}" y1="${yc.toFixed(1)}" x2="${xc.toFixed(1)}" y2="${(padT + ch).toFixed(1)}"
          stroke="#2BD9A6" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.7"/>
        <circle cx="${xc.toFixed(1)}" cy="${yc.toFixed(1)}" r="8" fill="#2BD9A6" stroke="#0A0F38" stroke-width="2.5"/>
        <circle cx="${xc.toFixed(1)}" cy="${yc.toFixed(1)}" r="13" fill="none" stroke="#2BD9A6" stroke-width="1.5" opacity="0.45"/>
      `;
          }
        } else if (state.rendaMensal > 0) {
          objetivoSvg += `
      <rect x="${(W / 2 - 170).toFixed(1)}" y="${(padT + 4).toFixed(1)}" width="340" height="24" rx="8"
        fill="rgba(245,185,66,.15)" stroke="rgba(245,185,66,.5)"/>
      <text x="${(W / 2).toFixed(1)}" y="${(padT + 20).toFixed(1)}" fill="#F5B942" font-family="Manrope"
        font-size="11.5" font-weight="700" text-anchor="middle">🎯 Patrimônio p/ R$ ${valorAmigavel(state.rendaMensal)}/mês — acima da escala</text>
    `;
        }

        // ----- selo de modo "valores em R$ de hoje" quando o IPCA está ligado -----
        let modoSvg = "";
        if (adj) {
          const tw = 196,
            tx = padL + 6,
            ty = padT + 28;
          modoSvg = `
      <g opacity="0.95">
        <rect x="${tx}" y="${ty}" width="${tw}" height="24" rx="12"
          fill="rgba(245,185,66,.14)" stroke="#F5B942" stroke-width="1"/>
        <text x="${tx + 13}" y="${ty + 16}" fill="#F5B942" font-family="Manrope" font-size="11.5"
          font-weight="700">📉 Valores em poder de compra de hoje</text>
      </g>`;
        }

        // ----- aviso de proteção patrimonial (sutil, topo direito) -----
        const prot = statusProtecao();
        let protecaoSvg = "";
        {
          let cor, rgb, label, wbox;
          if (prot.nivel === "none") {
            cor = "#FF6B2C";
            rgb = "255,107,44";
            label = "Sem proteção";
            wbox = 142;
          } else if (prot.nivel === "partial") {
            cor = "#F5B942";
            rgb = "245,185,66";
            label = "Proteção parcial";
            wbox = 160;
          } else {
            cor = "#2BD9A6";
            rgb = "43,217,166";
            label = "Patrimônio protegido";
            wbox = 186;
          }
          const hbox = 26,
            bx = W - padR - wbox,
            by = 6;
          protecaoSvg = `
      <g opacity="0.95">
        <rect x="${bx}" y="${by}" width="${wbox}" height="${hbox}" rx="13"
          fill="rgba(${rgb},0.12)" stroke="${cor}" stroke-width="1"/>
        <circle cx="${bx + 16}" cy="${by + 13}" r="3.5" fill="${cor}"/>
        <text x="${bx + 27}" y="${by + 17}" fill="${cor}" font-family="Manrope" font-size="11.5" font-weight="700">${label}</text>
      </g>`;
        }

        // ----- marcadores de objetivos do cliente (compra planejada) -----
        let objetivosCompraSvg = "";
        if (Array.isArray(state.objetivos) && state.objetivos.length) {
          const _icoObj = {
            Imóvel: "🏠",
            Carro: "🚗",
            Viagem: "✈️",
            Outro: "🎯",
          };
          state.objetivos.forEach(function (o, k) {
            const val = Number(o && o.valor) || 0;
            const ano = Number(o && o.ano) || 0;
            if (val <= 0 || ano <= 0 || ano > state.prazoAnos) return;
            const xc = X(ano * 12);
            const lbl =
              (_icoObj[o.tipo] || "🎯") + " -R$ " + valorAmigavel(val);
            const wlbl = 30 + lbl.length * 6.2;
            let lx = xc - wlbl / 2;
            if (lx < padL + 2) lx = padL + 2;
            if (lx + wlbl > W - padR - 2) lx = W - padR - 2 - wlbl;
            const ly = padT + 26 + (k % 2) * 26;
            objetivosCompraSvg += `
        <line x1="${xc.toFixed(1)}" y1="${padT.toFixed(1)}" x2="${xc.toFixed(1)}" y2="${(padT + ch).toFixed(1)}" stroke="#E8709B" stroke-width="1.4" stroke-dasharray="4 4" opacity="0.75"/>
        <rect x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" width="${wlbl.toFixed(1)}" height="20" rx="6" fill="#E8709B"/>
        <text x="${(lx + wlbl / 2).toFixed(1)}" y="${(ly + 14).toFixed(1)}" fill="#fff" font-family="Manrope" font-size="11" font-weight="800" text-anchor="middle">${lbl}</text>`;
          });
        }
        const svg = document.getElementById("chart");
        svg.innerHTML = `
    <defs>
      <linearGradient id="grad-cart" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#F26522" stop-opacity="0.40"/>
        <stop offset="100%" stop-color="#F26522" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="grad-past" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="rgba(255,255,255,0.03)"/>
        <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
      </linearGradient>
    </defs>

    <rect x="${X(xMesMin)}" y="${padT}" width="${X(0) - X(xMesMin)}" height="${ch}" fill="url(#grad-past)"/>

    <g stroke="rgba(120,130,210,.13)" stroke-width="1">
      ${yLabels.map((l) => `<line x1="${padL}" y1="${l.y}" x2="${W - padR}" y2="${l.y}"/>`).join("")}
    </g>

    <g fill="#8089BE" font-family="JetBrains Mono, monospace" font-size="11">
      ${yLabels.map((l) => `<text x="${padL - 10}" y="${l.y + 4}" text-anchor="end">${l.txt}</text>`).join("")}
    </g>

    <polyline fill="none" stroke="#8089BE" stroke-width="2" stroke-dasharray="5 5" opacity="0.5"
      points="${ptsFlat}"/>

    <polygon fill="url(#grad-cart)" points="${areaCart}"/>

    <polyline fill="none" stroke="#5B8DEF" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"
      points="${ptsCdi}"/>

    <polyline fill="none" stroke="#F26522" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"
      points="${ptsCart}"/>

    ${objetivoSvg}
    ${objetivosCompraSvg}

    <line x1="${X(0)}" y1="${padT}" x2="${X(0)}" y2="${padT + ch}"
      stroke="#FF6B2C" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.7"/>
    <rect x="${X(0) - 32}" y="${padT - 4}" width="64" height="22" rx="6" fill="#F26522"/>
    <text x="${X(0)}" y="${padT + 11}" fill="#fff" font-family="Manrope" font-size="11" font-weight="700"
      text-anchor="middle" letter-spacing="1.5">HOJE</text>

    <circle cx="${X(xMesMax)}" cy="${Y(cartD[totalMeses])}" r="6" fill="#F26522" stroke="#0d1142" stroke-width="2"/>
    <circle cx="${X(xMesMax)}" cy="${Y(cdiD[totalMeses])}" r="5" fill="#5B8DEF" stroke="#0d1142" stroke-width="2"/>

    <g fill="#8089BE" font-family="JetBrains Mono, monospace" font-size="11" text-anchor="middle">
      ${xTicks.map((m) => `<text x="${X(m)}" y="${H - padB + 22}" ${m === 0 ? 'fill="#FF6B2C" font-weight="700"' : ""}>${lblX(m)}</text>`).join("")}
    </g>

    <g font-family="Manrope" font-size="10" font-weight="600" letter-spacing="1.5" fill="#6F77A8" text-anchor="middle">
      <text x="${(X(xMesMin) + X(0)) / 2}" y="${H - padB + 42}">HISTÓRICO</text>
      <text x="${(X(0) + X(xMesMax)) / 2}" y="${H - padB + 42}">PROJEÇÃO</text>
    </g>

    ${modoSvg}
    ${protecaoSvg}
  `;

        if (state.imoveis.length > 0) renderImoveisSummary();
        renderExternosSummary();
        renderPatrimonioTotal();
      }

      // ============ PROTEÇÃO PATRIMONIAL ============
      function renderProtecao() {
        const cont = document.getElementById("protectList");
        if (!cont) return;
        cont.innerHTML = state.protecao
          .map(
            (p, i) => `
    <div class="check ${p.on ? "on" : ""} ${p.destaque ? "destaque" : ""}" data-i="${i}" role="button" tabindex="0">
      <span class="box"><svg fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></span>
      <span class="lbl">
        <span class="lbl-name">${p.name}${p.destaque ? ' <span class="badge">⭐ Mais adequado</span>' : ""}</span>
        <small>${p.descr}</small>
      </span>
    </div>
  `,
          )
          .join("");
        atualizarStatusProtecao();
      }

      function statusProtecao() {
        const marcados = state.protecao.filter((p) => p.on);
        const temWhole = state.protecao.some(
          (p) => p.id === "wholelife" && p.on,
        );
        if (marcados.length === 0) return { nivel: "none" };
        if (temWhole) return { nivel: "full" };
        return { nivel: "partial" };
      }

      function atualizarStatusProtecao() {
        const status = document.getElementById("protectStatus");
        if (!status) return;
        const marcados = state.protecao.filter((p) => p.on).length;
        const temWhole = state.protecao.some(
          (p) => p.id === "wholelife" && p.on,
        );
        if (marcados === 0) {
          status.className = "protect-status none";
          status.textContent =
            "⚠️ Sem proteção patrimonial — oportunidade de proteção";
        } else if (temWhole) {
          status.className = "protect-status full";
          status.textContent =
            "✓ Cliente assegurado com a proteção mais completa (Whole Life)";
        } else {
          status.className = "protect-status full";
          status.textContent =
            "✓ Cliente assegurado · o Whole Life é a opção mais adequada";
        }
      }

      // Vínculo de clique único por delegação — não reanexa eventos a cada render
      (function () {
        const lista = document.getElementById("protectList");
        if (!lista) return;
        function alternar(el) {
          const i = Number(el.dataset.i);
          if (!state.protecao[i]) return;
          state.protecao[i].on = !state.protecao[i].on;
          el.classList.toggle("on", state.protecao[i].on);
          atualizarStatusProtecao();
          salvarEstado();
          drawChart();
        }
        lista.addEventListener("click", (e) => {
          const el = e.target.closest(".check");
          if (el) alternar(el);
        });
        lista.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            const el = e.target.closest(".check");
            if (el) {
              e.preventDefault();
              alternar(el);
            }
          }
        });
      })();

      // ============ DONUT + ALOCAÇÃO ============
      function renderAlocacao() {
        const cont = document.getElementById("allocControls");
        atribuirTonalidades(state.alocacao);
        const somaCat = {};
        state.alocacao.forEach((a) => {
          somaCat[a.cat] = (somaCat[a.cat] || 0) + a.pct;
        });
        let html = "";
        let lastCat = null;
        state.alocacao.forEach((a, i) => {
          if (a.cat !== lastCat) {
            html += `<div class="alloc-cat" data-cat="${escapeHtml(a.cat)}">
        <span class="cat-dot" style="background:${a.color}"></span>
        <span class="cat-name">${escapeHtml(window.__hubClassLabel ? window.__hubClassLabel(a.cat) : a.cat)}</span>
        <span class="cat-pct">${fmtPct(somaCat[a.cat])}%</span>
      </div>`;
            lastCat = a.cat;
          }
          const sh = a.shade || a.color;
          const valorAtivo = state.valor * (a.pct / 100);
          const tagsAtivo = [
            ...new Set(
              (a.tags || []).concat(
                a.options && a.options[a.optIndex]
                  ? a.options[a.optIndex].tags || []
                  : [],
              ),
            ),
          ];
          const tagsHtml = tagsAtivo
            .map((t) => {
              const tl = ("" + t).toLowerCase();
              let cls = "prot",
                lbl = t;
              if (tl === "fgc") {
                cls = "fgc";
                lbl = "🔒 FGC";
              } else if (tl.indexOf("fgc") >= 0) {
                cls = "fgc-parcial";
                lbl = "🔒 " + t;
              } else if (
                tl.indexOf("proteç") >= 0 ||
                tl.indexOf("protec") >= 0
              ) {
                cls = "prot";
                lbl = "🛡️ " + t;
              }
              return `<span class="atag ${cls}">${escapeHtml(lbl)}</span>`;
            })
            .join("");
          const info = infoAtivo(a);
          const infoBtn = info
            ? ` <button type="button" class="info-btn" data-i="${i}" title="Mais informações sobre o ativo">▾</button>`
            : "";
          const infoPanel = info
            ? `<div class="info-panel" data-i="${i}" style="display:none">
          <div class="ip-icon" style="color:${a.color};background:${hexA(a.color, 0.14)};border:1px solid ${hexA(a.color, 0.35)}">${iconeSvg(info.icon)}</div>
          <div class="ip-body">
            <div class="ip-resumo">${escapeHtml(info.resumo)}</div>
            <div class="ip-pontos">${info.pontos.map((p) => `<span class="ip-ponto">${escapeHtml(p)}</span>`).join("")}</div>
          </div>
        </div>`
            : "";
          html += `
    <div class="alloc-row">
      <span class="swatch" style="background:${sh}"></span>
      <div class="info">
        <span class="name">${escapeHtml(a.name)}${tagsHtml}${infoBtn}</span>
        <span class="descr">${escapeHtml(a.descr)}</span>
        ${a.options ? `<div class="opt-chips">${a.options.map((o, oi) => `<button type="button" class="opt-chip ${oi === a.optIndex ? "on" : ""}" data-i="${i}" data-oi="${oi}">${escapeHtml(o.name)}</button>`).join("")}</div>` : ""}
        ${infoPanel}
      </div>
      <div class="right-col">
        <div class="pct-input"><input type="text" inputmode="decimal" data-i="${i}" class="alloc-num" value="${String(a.pct).replace(".", ",")}" /></div>
        <div class="valor-rs">R$ ${f(valorAtivo)}</div>
      </div>
      <input type="range" data-i="${i}" class="alloc-range" min="0" max="100" step="0.5" value="${a.pct}"
        style="accent-color:${sh};background:linear-gradient(to right, ${sh} 0%, ${sh} ${a.pct}%, var(--track-empty) ${a.pct}%, var(--track-empty) 100%);"/>
    </div>`;
        });
        cont.innerHTML =
          html + '<div class="alloc-status" id="allocStatus"></div>';

        // Handlers atualizam no LUGAR (sem recriar os inputs) — evita perda de foco ao digitar
        cont.querySelectorAll(".alloc-num").forEach((el) =>
          el.addEventListener("input", (e) => {
            const i = +e.target.dataset.i;
            var _pv = parseFloat(
              String(e.target.value == null ? "" : e.target.value)
                .trim()
                .replace(",", "."),
            );
            if (isNaN(_pv)) _pv = 0;
            const v = Math.max(0, Math.min(100, _pv));
            state.alocacao[i].pct = v;
            const rng = cont.querySelector('.alloc-range[data-i="' + i + '"]');
            if (rng) {
              rng.value = v;
              aplicarGradiente(
                rng,
                state.alocacao[i].shade || state.alocacao[i].color,
                v,
              );
            }
            state.template = "";
            marcarTemplateAtivo();
            salvarEstado();
            atualizarResumoAlloc();
          }),
        );
        cont.querySelectorAll(".alloc-range").forEach((el) =>
          el.addEventListener("input", (e) => {
            const i = +e.target.dataset.i;
            const v = Number(e.target.value) || 0;
            state.alocacao[i].pct = v;
            aplicarGradiente(
              e.target,
              state.alocacao[i].shade || state.alocacao[i].color,
              v,
            );
            const num = cont.querySelector('.alloc-num[data-i="' + i + '"]');
            if (num) num.value = String(v).replace(".", ",");
            state.template = "";
            marcarTemplateAtivo();
            salvarEstado();
            atualizarResumoAlloc();
          }),
        );

        // Escolha entre as alternativas de um mesmo ativo (ex.: Ouro × XP Tecnologia)
        cont.querySelectorAll(".opt-chip").forEach((el) =>
          el.addEventListener("click", (e) => {
            const i = +e.currentTarget.dataset.i;
            const oi = +e.currentTarget.dataset.oi;
            const a = state.alocacao[i];
            if (!a || !a.options || !a.options[oi]) return;
            a.optIndex = oi;
            a.name = a.options[oi].name;
            a.descr = a.options[oi].descr;
            salvarEstado();
            renderAlocacao();
            showToast("Selecionado: " + a.name);
          }),
        );

        // Expandir/recolher a informação detalhada do ativo
        cont.querySelectorAll(".info-btn").forEach((el) =>
          el.addEventListener("click", (e) => {
            const i = e.currentTarget.dataset.i;
            const panel = cont.querySelector('.info-panel[data-i="' + i + '"]');
            if (!panel) return;
            const aberto = panel.style.display !== "none";
            panel.style.display = aberto ? "none" : "block";
            e.currentTarget.classList.toggle("open", !aberto);
          }),
        );

        atualizarResumoAlloc();
      }

      function fmtPct(n) {
        return fmtBRdec.format(n || 0).replace(/,0$/, "");
      }

      function aplicarTemplate(id) {
        if (!TEMPLATES[id]) return;
        state.template = id;
        state.alocacao = clonarTemplate(id);
        marcarTemplateAtivo();
        salvarEstado();
        renderAlocacao();
        const nomes = {
          conservadora: "Conservadora",
          moderada: "Moderada",
          sofisticada: "Sofisticada",
        };
        const soma = state.alocacao.reduce((s, a) => s + a.pct, 0);
        showToast(
          "Carteira " +
            nomes[id] +
            " carregada" +
            (Math.round(soma * 10) !== 1000
              ? " · soma " + fmtPct(soma) + "%"
              : ""),
        );
      }

      function marcarTemplateAtivo() {
        document.querySelectorAll("#tplBar .tpl-btn").forEach((b) => {
          b.classList.toggle("active", b.dataset.tpl === state.template);
        });
      }

      document.querySelectorAll("#tplBar .tpl-btn").forEach((b) => {
        b.addEventListener("click", () => aplicarTemplate(b.dataset.tpl));
      });

      // ===== visão: carteira com produtos x apenas classes de ativo =====
      /* Agrupa QUALQUER carteira (template, importada do Montar a Carteira ou editada
   na mão) nas classes genéricas, mantendo as proporções. */
      const FP_GEN_DESCR = {
        "Pós-fixado": "CDI / Selic · caixa e liquidez",
        Inflação: "Títulos indexados ao IPCA · ganho real",
        "Pré-fixado": "Taxa travada na largada",
        Multimercados: "Estratégias macro, long&short e teses temáticas",
        Ações: "Bolsa local e global · direta ou via estruturadas",
        "Fundos Imobiliários": "FIIs de tijolo e papel · Fiagro · renda mensal",
        Alternativos: "Ouro, temáticos e estruturas com proteção",
        Internacional: "Exposição global em dólar · ações e crédito",
      };
      const FP_GEN_ORDER = [
        "Pós-fixado",
        "Inflação",
        "Pré-fixado",
        "Multimercados",
        "Ações",
        "Fundos Imobiliários",
        "Alternativos",
        "Internacional",
      ];
      function fpSubRF(a) {
        const b = ((a.name || "") + " " + (a.descr || "")).toLowerCase();
        if (/ipca|ntn-?b|infla/.test(b)) return "Inflação";
        if (/pr[eé]|prefix|\bltn\b|tesouro prefixado/.test(b))
          return "Pré-fixado";
        return "Pós-fixado";
      }
      function fpBucket(a) {
        const cat = a.cat || "";
        const b = ((a.name || "") + " " + (a.descr || "")).toLowerCase();
        if (cat === "Renda Fixa")
          return { cat: "Renda Fixa", name: fpSubRF(a) };
        if (cat === "Fundo Aberto" || cat === "Multimercados")
          return { cat: "Multimercados", name: "Multimercados" };
        if (cat === "Alternativos")
          return { cat: "Alternativos", name: "Alternativos" };
        if (cat === "Internacional")
          return { cat: "Internacional", name: "Internacional" };
        if (cat === "Renda Variável")
          return { cat: "Renda Variável", name: "Ações" };
        if (cat === "Fundos Listados")
          return { cat: "Fundos Listados", name: "Fundos Imobiliários" };
        return { cat: cat || "Renda Fixa", name: cat || "Outros" };
      }
      function agregarPorClasse(lista) {
        const map = {};
        (lista || []).forEach((a) => {
          const b = fpBucket(a);
          const k = b.cat + "|" + b.name;
          if (!map[k])
            map[k] = {
              cat: b.cat,
              name: b.name,
              descr: FP_GEN_DESCR[b.name] || "",
              pct: 0,
              color: corCat(b.cat),
              tags: [],
            };
          map[k].pct += Number(a.pct) || 0;
        });
        const arr = Object.keys(map).map((k) => {
          const o = map[k];
          o.pct = Math.round(o.pct * 100) / 100;
          return o;
        });
        arr.sort((x, y) => {
          let ix = FP_GEN_ORDER.indexOf(x.name),
            iy = FP_GEN_ORDER.indexOf(y.name);
          if (ix < 0) ix = 99;
          if (iy < 0) iy = 99;
          return ix - iy;
        });
        return arr.filter((o) => o.pct > 0);
      }
      function marcarFpView() {
        document.querySelectorAll("#fpViewSeg [data-fpview]").forEach((b) => {
          b.classList.toggle("on", b.dataset.fpview === FP_VIEW);
        });
      }
      document.querySelectorAll("#fpViewSeg [data-fpview]").forEach((b) => {
        b.addEventListener("click", () => {
          const v = b.dataset.fpview;
          if (v === FP_VIEW) return;
          FP_VIEW = v;
          try {
            window.hubStorage.setItem("hubFpView", v);
          } catch (e) {}
          marcarFpView();
          if (TEMPLATES[state.template]) {
            aplicarTemplate(state.template);
            return;
          }
          if (v === "classes") {
            state._allocProdutos = JSON.parse(
              JSON.stringify(state.alocacao || []),
            );
            state.alocacao = agregarPorClasse(state.alocacao);
            salvarEstado();
            renderAlocacao();
            showToast("Carteira agrupada por classe de ativo");
          } else {
            if (state._allocProdutos && state._allocProdutos.length) {
              state.alocacao = state._allocProdutos;
              state._allocProdutos = null;
              salvarEstado();
              renderAlocacao();
              showToast("Carteira com os produtos restaurada");
            } else if (
              state.template === "construtor" &&
              window.RICO_BRIDGE &&
              window.RICO_BRIDGE.carteira
            ) {
              importarDoConstrutor();
            } else {
              showToast(
                "Escolha um perfil ou importe do Montar a Carteira para ver os produtos.",
              );
            }
          }
        });
      });
      marcarFpView();
      /* Ao abrir a aba com a visão "classes" salva, reagrupa a carteira guardada. */
      (function () {
        try {
          if (FP_VIEW !== "classes") return;
          if (!Array.isArray(state.alocacao) || !state.alocacao.length) return;
          var agg = agregarPorClasse(state.alocacao);
          if (agg.length && agg.length !== state.alocacao.length) {
            if (!state._allocProdutos)
              state._allocProdutos = JSON.parse(JSON.stringify(state.alocacao));
            state.alocacao = agg;
            try {
              renderAlocacao();
            } catch (e) {}
          }
        } catch (e) {}
      })();

      // ============ PONTE: importar carteira do Construtor ============
      function atualizarBarraImport() {
        const bar = document.getElementById("importBar");
        if (!bar) return;
        const c = window.RICO_BRIDGE && window.RICO_BRIDGE.carteira;
        if (c && Array.isArray(c.itens) && c.itens.length) {
          bar.style.display = "flex";
          const sub = document.getElementById("importSub");
          if (sub) {
            const cli = c.cliente ? c.cliente + " · " : "";
            sub.textContent =
              cli +
              "Carteira " +
              c.template +
              " · " +
              c.itens.length +
              " ativos · " +
              fmtPct(c.retAA) +
              "% a.a.";
          }
        } else {
          bar.style.display = "none";
        }
      }

      function importarDoConstrutor() {
        const c = window.RICO_BRIDGE && window.RICO_BRIDGE.carteira;
        if (!c || !Array.isArray(c.itens) || !c.itens.length) {
          showToast("Nenhuma carteira encontrada no Montar a Carteira");
          return;
        }
        // Converte itens do Construtor para o formato do Simulador
        const nova = c.itens.map((it) => ({
          cat: it.classe,
          name: it.nome,
          descr: it.detalhe || "",
          pct: Number(it.pct) || 0,
          color: corCat(it.classe),
          tags: Array.isArray(it.tags) ? it.tags.slice() : [],
        }));
        state.alocacao = FP_VIEW === "classes" ? agregarPorClasse(nova) : nova;
        if (FP_VIEW === "classes") state._allocProdutos = nova;
        state.template = "construtor";
        // Sincroniza patrimônio e rentabilidade com o Construtor usando os setters existentes
        if (c.patrimonio) {
          setValor(String(c.patrimonio));
        }
        if (c.cdiMult) {
          setPct(String(Math.round(c.cdiMult)));
        }
        if (c.cliente) {
          state.nomeCliente = c.cliente;
          const nEl = document.getElementById("nomeCliente");
          if (nEl) nEl.value = c.cliente;
        }
        marcarTemplateAtivo();
        salvarEstado();
        renderAlocacao();
        drawChart();
        const soma = nova.reduce((s, a) => s + a.pct, 0);
        showToast(
          "Carteira do Montar a Carteira importada" +
            (Math.round(soma * 10) !== 1000
              ? " · soma " + fmtPct(soma) + "%"
              : ""),
        );
      }

      /* Preenchimento automático do Simulador a partir da Aderência (composição da posição atual) */
      window.__fillSimuladorFromAderencia = function (data) {
        if (!data) return;
        // valor (patrimônio)
        if (data.patrimonio) {
          setValor(String(Math.round(data.patrimonio)));
        }
        // nome do cliente
        if (data.conta) {
          state.nomeCliente = "Conta " + data.conta;
          var nEl = document.getElementById("nomeCliente");
          if (nEl) nEl.value = state.nomeCliente;
        }
        // composição: uma linha por categoria com %
        if (data.comp) {
          var DESCR = {
            "Renda Fixa": "Renda fixa, COEs e previdência",
            Multimercados: "Fundos de investimento e carteira administrada",
            "Renda Variável":
              "Ações, produtos estruturados e COE de Bolsa Americana",
            "Fundos Listados": "Fundos imobiliários (FIIs)",
            Alternativos: "Ativos alternativos e COE de Ouro",
            Internacional: "Exposição internacional",
          };
          var nova = [];
          Object.keys(data.comp).forEach(function (cat) {
            var pct = data.comp[cat];
            if (pct && pct >= 0.05) {
              nova.push({
                cat: cat,
                name:
                  (window.__hubClassLabel ? window.__hubClassLabel(cat) : cat) +
                  " (atual)",
                descr: DESCR[cat] || "",
                pct: Math.round(pct * 10) / 10,
                color: corCat(cat),
                tags: [],
              });
            }
          });
          if (nova.length) {
            state.alocacao = nova;
            state.template = "atual";
            marcarTemplateAtivo();
          }
        }
        salvarEstado();
        renderAlocacao();
        drawChart();
        showToast("Posição atual do cliente carregada no Simulador");
      };

      (function () {
        var btn = document.getElementById("btnImportar");
        if (btn) btn.addEventListener("click", importarDoConstrutor);
        // Atualiza a barra quando o Construtor publicar nova carteira
        window.RICO_onCarteiraUpdate = atualizarBarraImport;
        atualizarBarraImport();
      })();

      function aplicarGradiente(rng, color, pct) {
        rng.style.background =
          "linear-gradient(to right, " +
          color +
          " 0%, " +
          color +
          " " +
          pct +
          "%, var(--track-empty) " +
          pct +
          "%, var(--track-empty) 100%)";
      }

      function atualizarResumoAlloc() {
        const cont = document.getElementById("allocControls");
        const rows = cont.querySelectorAll(".alloc-row");
        state.alocacao.forEach((a, i) => {
          const row = rows[i];
          if (!row) return;
          const vr = row.querySelector(".valor-rs");
          if (vr) vr.textContent = "R$ " + f(state.valor * (a.pct / 100));
        });
        const somaCat = {};
        state.alocacao.forEach((a) => {
          somaCat[a.cat] = (somaCat[a.cat] || 0) + a.pct;
        });
        cont.querySelectorAll(".alloc-cat").forEach((h) => {
          const el = h.querySelector(".cat-pct");
          if (el) el.textContent = fmtPct(somaCat[h.dataset.cat]) + "%";
        });
        const total = state.alocacao.reduce((s, a) => s + a.pct, 0);
        const dif = Math.round((100 - total) * 10) / 10;
        const st = document.getElementById("allocStatus");
        if (st) {
          if (dif === 0) {
            st.className = "alloc-status ok";
            st.textContent = "✓ Carteira balanceada · 100%";
          } else if (dif > 0) {
            st.className = "alloc-status warn";
            st.textContent = "Falta " + fmtPct(dif) + "% para completar 100%";
          } else {
            st.className = "alloc-status warn";
            st.textContent =
              fmtPct(-dif) + "% acima do total · ajustar para 100%";
          }
        }
        drawDonut(total);
      }

      function drawDonut(total) {
        const svg = document.getElementById("donut");
        atribuirTonalidades(state.alocacao);
        const cx = 100,
          cy = 100,
          r = 70,
          stroke = 28,
          C = 2 * Math.PI * r;
        let off = 0;
        let segs = "";
        const ref = Math.max(total, 100);
        state.alocacao.forEach((a) => {
          const len = (a.pct / ref) * C;
          segs += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${a.shade || a.color}"
              stroke-width="${stroke}" stroke-dasharray="${len.toFixed(2)} ${(C - len).toFixed(2)}"
              stroke-dashoffset="${(-off).toFixed(2)}"/>`;
          off += len;
        });
        const base = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(120,130,210,.10)" stroke-width="${stroke}"/>`;
        svg.innerHTML = base + segs;

        document.getElementById("donutTotal").textContent = valorAmigavel(
          state.valor,
        );
        const donutSub = document.getElementById("donutSub");
        if (Math.round(total * 10) === 1000) {
          donutSub.textContent = "100% alocado";
          donutSub.style.color = "";
        } else {
          donutSub.textContent = fmtPct(total) + "% alocado";
          donutSub.style.color = "#FF6B2C";
        }
      }

      // ============ ATIVOS IMOBILIZADOS ============
      function popularSelectEstados() {
        const sel = document.getElementById("imEstado");
        if (!sel) return;
        let html = '<option value="">Selecione…</option>';
        Object.keys(UF_NOME).forEach((uf) => {
          html += `<option value="${uf}">${uf} — ${UF_NOME[uf]}</option>`;
        });
        sel.innerHTML = html;
      }

      function renderImoveis() {
        const list = document.getElementById("imoveisList");
        if (!list) return;
        if (state.imoveis.length === 0) {
          list.innerHTML =
            '<div class="im-empty">Nenhum imóvel mapeado ainda.<br>Use o formulário acima para registrar os ativos imobilizados do cliente.</div>';
        } else {
          list.innerHTML = state.imoveis
            .map((im) => {
              const tipo = im.tipo ? escapeHtml(im.tipo) : "Imóvel";
              const nomeEst = UF_NOME[im.estado] || im.estado;
              const qtdTxt =
                im.quantidade > 1 ? `${im.quantidade} unidades` : "1 unidade";
              return `
      <div class="im-row" data-id="${im.id}">
        <span class="im-uf">${escapeHtml(im.estado)}</span>
        <div class="im-info">
          <span class="im-tipo">${tipo}</span>
          <span class="im-loc">${escapeHtml(nomeEst)} · ${qtdTxt}</span>
        </div>
        <span class="im-val">R$ ${f(im.valor)}</span>
        <button class="im-del" data-id="${im.id}" type="button" title="Remover">✕</button>
      </div>`;
            })
            .join("");
        }
        renderImoveisSummary();
        renderPatrimonioTotal();
      }

      function renderImoveisSummary() {
        const cont = document.getElementById("imoveisSummary");
        if (!cont) return;
        if (state.imoveis.length === 0) {
          cont.innerHTML = "";
          return;
        }

        const totalQtd = state.imoveis.reduce((s, i) => s + i.quantidade, 0);
        const totalVal = state.imoveis.reduce((s, i) => s + i.valor, 0);
        const porEstado = {};
        state.imoveis.forEach((i) => {
          if (!porEstado[i.estado]) porEstado[i.estado] = { valor: 0, qtd: 0 };
          porEstado[i.estado].valor += i.valor;
          porEstado[i.estado].qtd += i.quantidade;
        });
        const estados = Object.entries(porEstado).sort(
          (a, b) => b[1].valor - a[1].valor,
        );
        const maxVal = Math.max(...estados.map((e) => e[1].valor), 1);

        const rows = estados
          .map(
            ([uf, d]) => `
    <div class="ie-row">
      <span class="ie-uf">${uf}<small>${escapeHtml(UF_NOME[uf] || "")}</small></span>
      <div class="ie-bar"><span style="width:${((d.valor / maxVal) * 100).toFixed(1)}%"></span></div>
      <span class="ie-val">R$ ${f(d.valor)} · ${d.qtd} ${d.qtd > 1 ? "imóveis" : "imóvel"}</span>
    </div>`,
          )
          .join("");

        cont.innerHTML = `
    <div class="im-totais">
      <div class="im-tot dest"><div class="t">Valor total imobilizado</div><div class="n">R$ ${f(totalVal)}</div></div>
      <div class="im-tot"><div class="t">Total de imóveis</div><div class="n">${totalQtd}</div></div>
      <div class="im-tot"><div class="t">Estados</div><div class="n">${estados.length}</div></div>
    </div>
    <div class="im-estados">
      <div class="ie-title">Distribuição por estado</div>
      ${rows}
    </div>`;
      }

      function renderExternos() {
        const list = document.getElementById("externosList");
        if (!list) return;
        if (state.externos.length === 0) {
          list.innerHTML =
            '<div class="im-empty">Nenhum investimento externo mapeado ainda.<br>Registre onde o cliente investe além da Rico (Banco do Brasil, Itaú, Nubank, Safra…).</div>';
        } else {
          list.innerHTML = state.externos
            .map((ex) => {
              const prod = ex.descricao
                ? escapeHtml(ex.descricao)
                : "Investimento";
              return `
      <div class="im-row" data-id="${ex.id}">
        <span class="im-uf">${escapeHtml(siglaInst(ex.instituicao))}</span>
        <div class="im-info">
          <span class="im-tipo">${escapeHtml(ex.instituicao)}</span>
          <span class="im-loc">${prod}</span>
        </div>
        <span class="im-val">R$ ${f(ex.valor)}</span>
        <button class="im-del" data-id="${ex.id}" type="button" title="Remover">✕</button>
      </div>`;
            })
            .join("");
        }
        renderExternosSummary();
        renderPatrimonioTotal();
      }

      function renderExternosSummary() {
        const cont = document.getElementById("externosSummary");
        if (!cont) return;
        if (state.externos.length === 0) {
          cont.innerHTML = "";
          return;
        }
        const totalVal = state.externos.reduce((s, i) => s + i.valor, 0);
        const porInst = {};
        state.externos.forEach((i) => {
          porInst[i.instituicao] = (porInst[i.instituicao] || 0) + i.valor;
        });
        const insts = Object.entries(porInst).sort((a, b) => b[1] - a[1]);
        const maxVal = Math.max(...insts.map((e) => e[1]), 1);
        const rows = insts
          .map(
            ([nome, val]) => `
    <div class="ie-row">
      <span class="ie-uf">${escapeHtml(siglaInst(nome))}<small>${escapeHtml(nome)}</small></span>
      <div class="ie-bar ie-bar-roxo"><span style="width:${((val / maxVal) * 100).toFixed(1)}%"></span></div>
      <span class="ie-val">R$ ${f(val)}</span>
    </div>`,
          )
          .join("");
        cont.innerHTML = `
    <div class="im-totais">
      <div class="im-tot dest"><div class="t">Total em outras instituições</div><div class="n">R$ ${f(totalVal)}</div></div>
      <div class="im-tot"><div class="t">Aplicações</div><div class="n">${state.externos.length}</div></div>
      <div class="im-tot"><div class="t">Instituições</div><div class="n">${insts.length}</div></div>
    </div>
    <div class="im-estados">
      <div class="ie-title">Distribuição por instituição</div>
      ${rows}
    </div>`;
      }

      function renderPatrimonioTotal() {
        const cont = document.getElementById("patrimonioTotalWrap");
        if (!cont) return;
        const totImo = state.imoveis.reduce((s, i) => s + i.valor, 0);
        const totExt = state.externos.reduce((s, i) => s + i.valor, 0);
        if (totImo === 0 && totExt === 0) {
          cont.innerHTML = "";
          return;
        }
        const proj = calcular();
        const finalCart = proj.cart[proj.totalMeses];
        const patProj = finalCart + totExt + totImo;
        const patHoje = state.valor + totExt + totImo;
        const pInv = patProj > 0 ? (finalCart / patProj) * 100 : 0;
        const pExt = patProj > 0 ? (totExt / patProj) * 100 : 0;
        const pImo = patProj > 0 ? (totImo / patProj) * 100 : 0;
        const legExt =
          totExt > 0
            ? `<span class="pl"><span class="sw" style="background:#9B6BFF"></span>Outras instituições <b>R$ ${f(totExt)}</b><small>${fmtBRdec.format(pExt)}%</small></span>`
            : "";
        const legImo =
          totImo > 0
            ? `<span class="pl"><span class="sw" style="background:#F26522"></span>Imobilizado <b>R$ ${f(totImo)}</b><small>${fmtBRdec.format(pImo)}%</small></span>`
            : "";
        cont.innerHTML = `
    <div class="patrimonio-total">
      <div class="pt-head">
        <div>
          <div class="pt-lbl">Patrimônio total estimado · em ${state.prazoAnos} ${state.prazoAnos === 1 ? "ano" : "anos"}</div>
          <div class="pt-big">R$ ${f(patProj)}</div>
        </div>
        <div class="pt-hoje">Patrimônio hoje<br><strong>R$ ${f(patHoje)}</strong></div>
      </div>
      <div class="pt-bar">
        <div class="seg inv" style="width:${pInv.toFixed(1)}%"></div>
        <div class="seg ext" style="width:${pExt.toFixed(1)}%"></div>
        <div class="seg imo" style="width:${pImo.toFixed(1)}%"></div>
      </div>
      <div class="pt-leg">
        <span class="pl"><span class="sw" style="background:#5B8DEF"></span>Investimentos Rico <b>R$ ${f(finalCart)}</b><small>${fmtBRdec.format(pInv)}%</small></span>
        ${legExt}
        ${legImo}
      </div>
      <div class="pt-note">Investimentos na Rico projetados a ${rentLabel()}. Aplicações em outras instituições e imóveis entram pelo valor atual informado (sem projeção de crescimento).</div>
    </div>`;
      }

      function popularInstituicoes() {
        const sel = document.getElementById("exInst");
        if (!sel) return;
        sel.innerHTML =
          '<option value="">Selecione…</option>' +
          INSTITUICOES.map((n) => `<option value="${n}">${n}</option>`).join(
            "",
          );
      }

      function adicionarExterno() {
        const inp = document.getElementById("exInst");
        const inst = inp.value.trim();
        const desc = document.getElementById("exProduto").value.trim();
        const valor = parseNum(document.getElementById("exValor").value);

        if (!inst) {
          showToast("Informe a instituição");
          inp.focus();
          return;
        }
        if (valor <= 0) {
          showToast("Informe o valor aplicado");
          document.getElementById("exValor").focus();
          return;
        }

        state.externos.push({
          id: novoIdImovel(),
          instituicao: inst,
          descricao: desc,
          valor,
        });

        inp.value = "";
        document.getElementById("exProduto").value = "";
        document.getElementById("exValor").value = "";

        salvarEstado();
        renderExternos();
        showToast("🏦 Investimento adicionado");
      }

      (function () {
        const list = document.getElementById("externosList");
        if (list) {
          list.addEventListener("click", (e) => {
            const btn = e.target.closest(".im-del");
            if (!btn) return;
            const id = btn.dataset.id;
            state.externos = state.externos.filter((i) => i.id !== id);
            salvarEstado();
            renderExternos();
            showToast("Investimento removido");
          });
        }
        const addBtn = document.getElementById("exAdd");
        if (addBtn) addBtn.addEventListener("click", adicionarExterno);
        const exValor = document.getElementById("exValor");
        if (exValor)
          exValor.addEventListener("input", (e) => {
            const n = parseNum(e.target.value);
            e.target.value = n ? fmtMoney(n) : "";
          });
      })();

      // ============ OBJETIVOS DO CLIENTE (compra planejada) ============
      function renderObjetivos() {
        const list = document.getElementById("objetivosList");
        if (!list) return;
        const ic = { Imóvel: "🏠", Carro: "🚗", Viagem: "✈️", Outro: "🎯" };
        if (!state.objetivos.length) {
          list.innerHTML =
            '<div class="im-empty">Nenhum objetivo cadastrado.<br>Adicione metas de compra do cliente (imóvel, carro, viagem) para vê-las no gráfico.</div>';
        } else {
          list.innerHTML = state.objetivos
            .map((o) => {
              const emo = ic[o.tipo] || "🎯";
              const anoTxt =
                Number(o.ano) > 1
                  ? "daqui a " + o.ano + " anos"
                  : "daqui a 1 ano";
              const sub = o.descricao
                ? escapeHtml(o.tipo) + " · " + escapeHtml(o.descricao)
                : escapeHtml(o.tipo);
              return `
      <div class="im-row" data-id="${o.id}">
        <span class="im-uf" style="font-size:19px;background:rgba(232,112,155,.14);color:#E8709B">${emo}</span>
        <div class="im-info">
          <span class="im-tipo">${sub}</span>
          <span class="im-loc">${anoTxt}</span>
        </div>
        <span class="im-val">R$ ${f(o.valor)}</span>
        <button class="im-del" data-id="${o.id}" type="button" title="Remover">✕</button>
      </div>`;
            })
            .join("");
        }
      }
      function adicionarObjetivo() {
        const tipo = document.getElementById("objTipo").value || "Outro";
        const descricao = (
          document.getElementById("objDesc").value || ""
        ).trim();
        const valor = parseNum(document.getElementById("objValor").value);
        const ano = Math.max(
          1,
          Math.min(
            30,
            parseInt(document.getElementById("objAno").value, 10) || 1,
          ),
        );
        if (valor <= 0) {
          showToast("Informe o valor do objetivo");
          document.getElementById("objValor").focus();
          return;
        }
        state.objetivos.push({
          id: novoIdImovel(),
          tipo,
          descricao,
          valor,
          ano,
        });
        document.getElementById("objDesc").value = "";
        document.getElementById("objValor").value = "";
        document.getElementById("objAno").value = "5";
        salvarEstado();
        renderObjetivos();
        drawChart();
        showToast("🎯 Objetivo adicionado");
      }
      (function () {
        const list = document.getElementById("objetivosList");
        if (list) {
          list.addEventListener("click", (e) => {
            const btn = e.target.closest(".im-del");
            if (!btn) return;
            state.objetivos = state.objetivos.filter(
              (o) => o.id !== btn.dataset.id,
            );
            salvarEstado();
            renderObjetivos();
            drawChart();
            showToast("Objetivo removido");
          });
        }
        const addBtn = document.getElementById("objAdd");
        if (addBtn) addBtn.addEventListener("click", adicionarObjetivo);
        const ov = document.getElementById("objValor");
        if (ov)
          ov.addEventListener("input", (e) => {
            const n = parseNum(e.target.value);
            e.target.value = n ? fmtMoney(n) : "";
          });
      })();

      // ============ CUSTO DE SUCESSÃO (Proteção Patrimonial · tópico 5) ============
      function renderSucessao() {
        const box = document.getElementById("sucessaoBox");
        if (!box) return;
        const totImo = state.imoveis.reduce(
          (s, i) => s + (Number(i.valor) || 0),
          0,
        );
        const totExt = state.externos.reduce(
          (s, i) => s + (Number(i.valor) || 0),
          0,
        );
        const patTotal = (Number(state.valor) || 0) + totImo + totExt;
        const custo = patTotal * 0.2;
        const liquido = patTotal - custo;
        box.innerHTML = `
    <div class="suc-head">Custo estimado de sucessão do patrimônio</div>
    <div class="suc-grid">
      <div class="suc-cell">
        <span class="suc-k">Patrimônio total</span>
        <span class="suc-v">R$ ${f(patTotal)}</span>
        <span class="suc-d">investimentos Rico + imóveis + fora da Rico</span>
      </div>
      <div class="suc-cell danger">
        <span class="suc-k">Custo de sucessão <span class="suc-badge">≈ 20%</span></span>
        <span class="suc-v">R$ ${f(custo)}</span>
        <span class="suc-d">ITCMD + inventário e honorários</span>
      </div>
      <div class="suc-cell ok">
        <span class="suc-k">Líquido aos herdeiros</span>
        <span class="suc-v">R$ ${f(liquido)}</span>
        <span class="suc-d">após os custos de transmissão</span>
      </div>
    </div>
    <div class="suc-disc"><strong>Estimativa ilustrativa</strong> de ~20% do patrimônio total. A tributação sobre a transmissão (<strong>ITCMD</strong>) <strong>varia conforme o estado</strong> do cliente — hoje entre 2% e 8% —, somada a custos de inventário e honorários, então o percentual real pode ser maior ou menor. Estruturas como seguro de vida (Whole Life), holding e previdência reduzem esse custo.</div>
  `;
      }

      function adicionarImovel() {
        const sel = document.getElementById("imEstado");
        const estado = sel.value;
        const tipo = document.getElementById("imTipo").value.trim();
        const qtd = Math.max(
          1,
          Math.min(
            999,
            parseInt(document.getElementById("imQtd").value, 10) || 1,
          ),
        );
        const valor = parseNum(document.getElementById("imValor").value);

        if (!estado) {
          showToast("Selecione o estado do imóvel");
          sel.focus();
          return;
        }
        if (valor <= 0) {
          showToast("Informe o valor do imóvel");
          document.getElementById("imValor").focus();
          return;
        }

        state.imoveis.push({
          id: novoIdImovel(),
          estado,
          tipo,
          quantidade: qtd,
          valor,
        });

        // limpa o formulário
        sel.value = "";
        document.getElementById("imTipo").value = "";
        document.getElementById("imQtd").value = "1";
        document.getElementById("imValor").value = "";

        salvarEstado();
        renderImoveis();
        showToast("🏠 Imóvel adicionado");
      }

      (function () {
        const list = document.getElementById("imoveisList");
        if (list) {
          list.addEventListener("click", (e) => {
            const btn = e.target.closest(".im-del");
            if (!btn) return;
            const id = btn.dataset.id;
            state.imoveis = state.imoveis.filter((i) => i.id !== id);
            salvarEstado();
            renderImoveis();
            showToast("Imóvel removido");
          });
        }
        const addBtn = document.getElementById("imAdd");
        if (addBtn) addBtn.addEventListener("click", adicionarImovel);
        const imValor = document.getElementById("imValor");
        if (imValor)
          imValor.addEventListener("input", (e) => {
            const n = parseNum(e.target.value);
            e.target.value = n ? fmtMoney(n) : "";
          });
      })();

      // ============ SINCRONIZAR INPUTS COM O ESTADO ============
      function sincronizarInputs() {
        document.getElementById("valor").value = fmtMoney(state.valor);
        document.getElementById("valorRange").value = Math.min(
          state.valor,
          2000000,
        );
        document.getElementById("aporte").value = fmtMoney(state.aporteMensal);
        document.getElementById("aporteRange").value = Math.min(
          state.aporteMensal,
          20000,
        );
        var _ra = document.getElementById("rendaAtual");
        if (_ra) _ra.value = fmtMoney(state.rendaAtual);
        var _dm = document.getElementById("despesaMensal");
        if (_dm) _dm.value = fmtMoney(state.despesaMensal);
        var _ia = document.getElementById("idadeAtual");
        if (_ia) _ia.value = state.idadeAtual;
        var _ev = document.getElementById("expectativa");
        if (_ev) _ev.value = state.expectativa;
        syncAporteMode();
        document.getElementById("pctCdi").value = state.pctCdi;
        document.getElementById("pctCdiRange").value = state.pctCdi;
        var spd = document.getElementById("ipcaSpread"),
          spr = document.getElementById("ipcaSpreadRange");
        if (spd) spd.value = state.ipcaSpread;
        if (spr) spr.value = state.ipcaSpread;
        syncRentMode();
        document.getElementById("prazo").value = state.prazoAnos;
        document.getElementById("prazoRange").value = state.prazoAnos;
        document.getElementById("hdrPrazo").textContent = state.prazoAnos;
        document.getElementById("renda").value = fmtMoney(state.rendaMensal);
        document.getElementById("rendaRange").value = Math.min(
          state.rendaMensal,
          100000,
        );
        document.getElementById("ipca").value = state.ipca;
        var _cdiASync = document.getElementById("cdiAnual");
        if (_cdiASync)
          _cdiASync.value = state.cdiAnual == null ? "" : state.cdiAnual;
        const tg = document.getElementById("ipcaToggle");
        if (tg) {
          tg.classList.toggle("on", state.ajustarIpca);
          tg.setAttribute("aria-checked", String(state.ajustarIpca));
        }
        document.getElementById("nomeCliente").value = state.nomeCliente;
        updatePrazoHint();
        atualizarRendaObjetivo();
      }
      function updatePrazoHint() {
        var h = document.getElementById("hintApos");
        if (h)
          h.textContent =
            (Number(state.idadeAtual) || 0) + (Number(state.prazoAnos) || 0);
        var rd = document.getElementById("rdAporte");
        if (rd)
          rd.textContent =
            "R$ " +
            fmtMoney(
              Math.max(0, (state.rendaAtual || 0) - (state.despesaMensal || 0)),
            );
      }
      function syncAporteMode() {
        var bar = document.getElementById("aporteMode");
        if (bar)
          bar.querySelectorAll(".rent-mode-opt").forEach(function (b) {
            var on = b.getAttribute("data-amode") === state.aporteMode;
            b.classList.toggle("active", on);
            b.setAttribute("aria-selected", String(on));
          });
        var dir = document.getElementById("aporteDireto"),
          rd = document.getElementById("aporteRD");
        if (dir)
          dir.style.display = state.aporteMode === "rendadespesa" ? "none" : "";
        if (rd)
          rd.style.display = state.aporteMode === "rendadespesa" ? "" : "none";
      }
      function setAporteMode(m) {
        state.aporteMode = m === "rendadespesa" ? "rendadespesa" : "direto";
        syncAporteMode();
        updatePrazoHint();
        salvarEstado();
        if (typeof drawChart === "function") drawChart();
        if (typeof renderAlocacao === "function") renderAlocacao();
      }

      // ============ INTERAÇÃO ============
      function setValor(v) {
        state.valor = Math.max(0, Math.min(10000000, parseNum(v)));
        document.getElementById("valor").value = fmtMoney(state.valor);
        document.getElementById("valorRange").value = Math.min(
          state.valor,
          2000000,
        );
        salvarEstado();
        drawChart();
        renderAlocacao();
      }
      function setPct(p) {
        state.pctCdi = Math.max(0, Math.min(500, Number(p) || 0));
        document.getElementById("pctCdi").value = state.pctCdi;
        document.getElementById("pctCdiRange").value = state.pctCdi;
        salvarEstado();
        drawChart();
      }
      // Mostra/oculta os blocos de IPCA e CDI conforme o modo ativo + atualiza os botões
      function syncRentMode() {
        var ipcaBox = document.getElementById("rentIpca");
        var cdiBox = document.getElementById("rentCdi");
        var isIpca = state.rentMode === "ipca";
        if (ipcaBox) ipcaBox.style.display = isIpca ? "" : "none";
        if (cdiBox) cdiBox.style.display = isIpca ? "none" : "";
        var opts = document.querySelectorAll("#rentMode .rent-mode-opt");
        opts.forEach(function (b) {
          var on = b.getAttribute("data-mode") === state.rentMode;
          b.classList.toggle("active", on);
          b.setAttribute("aria-selected", String(on));
        });
      }
      function setRentMode(m) {
        if (m !== "ipca" && m !== "cdi") return;
        state.rentMode = m;
        syncRentMode();
        salvarEstado();
        drawChart();
      }
      function setIpcaSpread(v) {
        state.ipcaSpread = Math.max(
          0,
          Math.min(20, Number(String(v).replace(",", ".")) || 0),
        );
        var spd = document.getElementById("ipcaSpread"),
          spr = document.getElementById("ipcaSpreadRange");
        if (spd) spd.value = state.ipcaSpread;
        if (spr) spr.value = state.ipcaSpread;
        salvarEstado();
        drawChart();
      }
      function setPrazo(t) {
        state.prazoAnos = Math.max(1, Math.min(30, Number(t) || 1));
        document.getElementById("prazo").value = state.prazoAnos;
        document.getElementById("prazoRange").value = state.prazoAnos;
        document.getElementById("hdrPrazo").textContent = state.prazoAnos;
        updatePrazoHint();
        atualizarRendaObjetivo();
        salvarEstado();
        drawChart();
      }
      function setRendaAtual(v) {
        state.rendaAtual = Math.max(0, Math.min(10000000, parseNum(v)));
        var el = document.getElementById("rendaAtual");
        if (el) el.value = fmtMoney(state.rendaAtual);
        updatePrazoHint();
        salvarEstado();
        if (state.aporteMode === "rendadespesa") {
          drawChart();
          renderAlocacao();
        }
      }
      function setDespesaMensal(v) {
        state.despesaMensal = Math.max(0, Math.min(10000000, parseNum(v)));
        var el = document.getElementById("despesaMensal");
        if (el) el.value = fmtMoney(state.despesaMensal);
        updatePrazoHint();
        salvarEstado();
        if (state.aporteMode === "rendadespesa") {
          drawChart();
          renderAlocacao();
        }
      }
      function setIdadeAtual(v) {
        state.idadeAtual = Math.max(18, Math.min(95, Number(v) || 0));
        updatePrazoHint();
        salvarEstado();
      }
      function setExpectativa(v) {
        state.expectativa = Math.max(70, Math.min(110, Number(v) || 0));
        salvarEstado();
      }
      function setAporte(a) {
        state.aporteMensal = Math.max(0, Math.min(100000, parseNum(a)));
        document.getElementById("aporte").value = fmtMoney(state.aporteMensal);
        document.getElementById("aporteRange").value = Math.min(
          state.aporteMensal,
          20000,
        );
        salvarEstado();
        drawChart();
        renderAlocacao();
      }
      function setRenda(o) {
        state.rendaMensal = Math.max(0, Math.min(10000000, parseNum(o)));
        document.getElementById("renda").value = fmtMoney(state.rendaMensal);
        document.getElementById("rendaRange").value = Math.min(
          state.rendaMensal,
          100000,
        );
        atualizarRendaObjetivo();
        salvarEstado();
        drawChart();
      }
      function setIpca(v) {
        state.ipca = Math.max(0, Math.min(30, Number(v) || 0));
        atualizarRendaObjetivo();
        salvarEstado();
        drawChart();
      }
      function setCdiAnual(v) {
        var sv = ("" + v).trim();
        state.cdiAnual =
          sv === "" ? null : Math.max(0, Math.min(30, Number(v) || 0));
        salvarEstado();
        drawChart();
      }
      function setAjustarIpca(on) {
        state.ajustarIpca = !!on;
        const btn = document.getElementById("ipcaToggle");
        if (btn) {
          btn.classList.toggle("on", state.ajustarIpca);
          btn.setAttribute("aria-checked", String(state.ajustarIpca));
        }
        salvarEstado();
        drawChart();
      }
      function setNome(n) {
        state.nomeCliente = String(n || "").trim();
        salvarEstado();
        drawChart();
      }
      function escapeHtml(s) {
        return String(s).replace(
          /[&<>"']/g,
          (c) =>
            ({
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              '"': "&quot;",
              "'": "&#39;",
            })[c],
        );
      }

      document
        .getElementById("valor")
        .addEventListener("input", (e) => setValor(e.target.value));
      document
        .getElementById("valorRange")
        .addEventListener("input", (e) => setValor(e.target.value));
      document
        .getElementById("aporte")
        .addEventListener("input", (e) => setAporte(e.target.value));
      document
        .getElementById("aporteRange")
        .addEventListener("input", (e) => setAporte(e.target.value));
      document
        .getElementById("pctCdi")
        .addEventListener("input", (e) => setPct(e.target.value));
      document
        .getElementById("pctCdiRange")
        .addEventListener("input", (e) => setPct(e.target.value));
      (function () {
        var spd = document.getElementById("ipcaSpread"),
          spr = document.getElementById("ipcaSpreadRange");
        if (spd)
          spd.addEventListener("input", (e) => setIpcaSpread(e.target.value));
        if (spr)
          spr.addEventListener("input", (e) => setIpcaSpread(e.target.value));
        var modeBar = document.getElementById("rentMode");
        if (modeBar)
          modeBar.querySelectorAll(".rent-mode-opt").forEach(function (b) {
            b.addEventListener("click", function () {
              setRentMode(b.getAttribute("data-mode"));
            });
          });
        // presets do spread IPCA (data-s) e do CDI (data-p) dentro dos respectivos blocos
        var ipcaBox = document.getElementById("rentIpca");
        if (ipcaBox)
          ipcaBox
            .querySelectorAll(".quick button[data-s]")
            .forEach(function (b) {
              b.addEventListener("click", function () {
                setIpcaSpread(b.getAttribute("data-s"));
              });
            });
      })();
      document
        .getElementById("prazo")
        .addEventListener("input", (e) => setPrazo(e.target.value));
      document
        .getElementById("prazoRange")
        .addEventListener("input", (e) => setPrazo(e.target.value));
      (function () {
        var aBar = document.getElementById("aporteMode");
        if (aBar)
          aBar.querySelectorAll(".rent-mode-opt").forEach(function (b) {
            b.addEventListener("click", function () {
              setAporteMode(b.getAttribute("data-amode"));
            });
          });
        var ra = document.getElementById("rendaAtual");
        if (ra)
          ra.addEventListener("input", (e) => setRendaAtual(e.target.value));
        var dm = document.getElementById("despesaMensal");
        if (dm)
          dm.addEventListener("input", (e) => setDespesaMensal(e.target.value));
        var ia = document.getElementById("idadeAtual");
        if (ia)
          ia.addEventListener("input", (e) => setIdadeAtual(e.target.value));
        var ev = document.getElementById("expectativa");
        if (ev)
          ev.addEventListener("input", (e) => setExpectativa(e.target.value));
      })();
      document
        .getElementById("renda")
        .addEventListener("input", (e) => setRenda(e.target.value));
      document
        .getElementById("rendaRange")
        .addEventListener("input", (e) => setRenda(e.target.value));
      document
        .getElementById("ipca")
        .addEventListener("input", (e) => setIpca(e.target.value));
      var _cdiAEl = document.getElementById("cdiAnual");
      if (_cdiAEl)
        _cdiAEl.addEventListener("input", (e) => setCdiAnual(e.target.value));
      document
        .getElementById("ipcaToggle")
        .addEventListener("click", () => setAjustarIpca(!state.ajustarIpca));
      document
        .getElementById("nomeCliente")
        .addEventListener("input", (e) => setNome(e.target.value));

      // Selecionar todo o texto ao focar nos campos de valor (facilita reescrever o número)
      ["valor", "aporte", "renda", "imValor", "exValor"].forEach((id) => {
        const el = document.getElementById(id);
        if (el)
          el.addEventListener("focus", () => {
            try {
              el.select();
            } catch (e) {}
          });
      });

      document
        .querySelectorAll("[data-v]")
        .forEach((b) =>
          b.addEventListener("click", () => setValor(b.dataset.v)),
        );
      document
        .querySelectorAll("[data-a]")
        .forEach((b) =>
          b.addEventListener("click", () => setAporte(b.dataset.a)),
        );
      document
        .querySelectorAll("[data-p]")
        .forEach((b) => b.addEventListener("click", () => setPct(b.dataset.p)));
      document
        .querySelectorAll("[data-t]")
        .forEach((b) =>
          b.addEventListener("click", () => setPrazo(b.dataset.t)),
        );
      document
        .querySelectorAll("[data-r]")
        .forEach((b) =>
          b.addEventListener("click", () => setRenda(b.dataset.r)),
        );

      // Restaurar padrões — zera valores/alocação/proteção/imóveis, mantém o nome do cliente
      document.getElementById("btnReset").addEventListener("click", () => {
        state.valor = 100000;
        state.aporteMensal = 0;
        state.pctCdi = 120;
        state.prazoAnos = 20;
        state.rendaMensal = 10000;
        state.ipca = 4.5;
        state.ajustarIpca = false;
        state.template = "conservadora";
        state.protecao = protecaoPadrao();
        state.alocacao = alocacaoPadrao();
        state.imoveis = [];
        state.externos = [];
        state.objetivos = [];
        sincronizarInputs();
        salvarEstado();
        marcarTemplateAtivo();
        renderProtecao();
        renderAlocacao();
        renderImoveis();
        renderExternos();
        renderObjetivos();
        drawChart();
        showToast("↺ Padrões restaurados");
      });

      // Novo cliente — apaga tudo (inclusive o nome) e limpa o salvamento
      document.getElementById("btnNovo").addEventListener("click", () => {
        state.valor = 100000;
        state.aporteMensal = 0;
        state.pctCdi = 120;
        state.prazoAnos = 20;
        state.rendaMensal = 10000;
        state.ipca = 4.5;
        state.ajustarIpca = false;
        state.nomeCliente = "";
        state.template = "conservadora";
        state.protecao = protecaoPadrao();
        state.alocacao = alocacaoPadrao();
        state.imoveis = [];
        state.externos = [];
        state.objetivos = [];
        limparEstado();
        sincronizarInputs();
        marcarTemplateAtivo();
        renderProtecao();
        renderAlocacao();
        renderImoveis();
        renderExternos();
        renderObjetivos();
        drawChart();
        document.getElementById("nomeCliente").focus();
        showToast("🆕 Pronto para um novo cliente!");
      });

      // EXPORTAR PNG — desenha o plano direto no canvas (nativo). Funciona no preview,
      // offline e em qualquer navegador, sem foreignObject e sem depender de rede/fontes.

      function wrapTextCanvas(ctx, text, x, y, maxW, lh) {
        const words = String(text).split(" ");
        let line = "",
          yy = y;
        for (const w of words) {
          const test = line ? line + " " + w : w;
          if (ctx.measureText(test).width > maxW && line) {
            ctx.fillText(line, x, yy);
            line = w;
            yy += lh;
          } else line = test;
        }
        if (line) ctx.fillText(line, x, yy);
        return yy;
      }

      function desenharDonutCanvas(ctx, cx, cy, r, lw) {
        atribuirTonalidades(state.alocacao);
        const total = state.alocacao.reduce((s, a) => s + a.pct, 0);
        const ref = Math.max(total, 100);
        ctx.lineWidth = lw;
        ctx.lineCap = "butt";
        ctx.strokeStyle = "rgba(120,130,210,.10)";
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        let start = -Math.PI / 2;
        state.alocacao.forEach((a) => {
          if (a.pct <= 0) return;
          const ang = (a.pct / ref) * Math.PI * 2;
          ctx.strokeStyle = a.shade || a.color;
          ctx.lineWidth = lw;
          ctx.beginPath();
          ctx.arc(cx, cy, r, start, start + ang);
          ctx.stroke();
          start += ang;
        });
      }

      function desenharGraficoCanvas(ctx, gx, gy, gw, gh, data) {
        const { cdiD, cartD, flatD, objArr, totalMeses, adj } = data;
        const padL = 78,
          padB = 26,
          padT = 6,
          padR = 14;
        const cw = gw - padL - padR,
          ch = gh - padT - padB;
        const xMesMin = -24,
          xMesMax = state.prazoAnos * 12;
        const X = (m) => gx + padL + ((m - xMesMin) / (xMesMax - xMesMin)) * cw;

        let vmax = 0;
        for (let i = 0; i <= totalMeses; i++)
          vmax = Math.max(vmax, cdiD[i], cartD[i]);
        const objEndDisp = state.rendaMensal > 0 ? objArr[totalMeses] : 0;
        const objVis = state.rendaMensal > 0 && objEndDisp <= vmax * 2.2;
        if (objVis) {
          for (let i = 24; i <= totalMeses; i++)
            vmax = Math.max(vmax, objArr[i]);
        }
        vmax *= 1.06;
        const niceMax = (v) => {
          if (v <= 0) return 1;
          const e = Math.pow(10, Math.floor(Math.log10(v)));
          const m = v / e;
          let n;
          if (m <= 1) n = 1;
          else if (m <= 2) n = 2;
          else if (m <= 5) n = 5;
          else n = 10;
          return n * e;
        };
        vmax = niceMax(vmax);
        const Y = (v) => gy + padT + ch - (v / vmax) * ch;

        ctx.font = "500 9.5px 'JetBrains Mono', monospace";
        for (let i = 0; i <= 4; i++) {
          const yy = gy + padT + (ch * i) / 4;
          ctx.strokeStyle = "rgba(120,130,210,.13)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(gx + padL, yy);
          ctx.lineTo(gx + padL + cw, yy);
          ctx.stroke();
          const v = (vmax * (4 - i)) / 4;
          const lbl =
            v >= 1e6
              ? "R$ " +
                (v / 1e6).toFixed(v >= 1e7 ? 0 : 1).replace(".", ",") +
                " mi"
              : v >= 1000
                ? "R$ " + Math.round(v / 1000) + " mil"
                : "R$ " + Math.round(v);
          ctx.fillStyle = "#8089BE";
          ctx.textAlign = "right";
          ctx.fillText(lbl, gx + padL - 8, yy + 3);
        }
        ctx.textAlign = "left";

        ctx.fillStyle = "rgba(255,255,255,0.025)";
        ctx.fillRect(X(xMesMin), gy + padT, X(0) - X(xMesMin), ch);

        const linha = (arr) => {
          ctx.beginPath();
          for (let i = 0; i <= totalMeses; i++) {
            const px = X(i + xMesMin),
              py = Y(arr[i]);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
        };

        linha(cartD);
        ctx.lineTo(X(xMesMax), Y(0));
        ctx.lineTo(X(xMesMin), Y(0));
        ctx.closePath();
        const ag = ctx.createLinearGradient(0, gy + padT, 0, gy + padT + ch);
        ag.addColorStop(0, "rgba(242,101,34,.35)");
        ag.addColorStop(1, "rgba(242,101,34,0)");
        ctx.fillStyle = ag;
        ctx.fill();

        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = "#8089BE";
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.5;
        linha(flatD);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.setLineDash([]);

        ctx.strokeStyle = "#5B8DEF";
        ctx.lineWidth = 2.5;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        linha(cdiD);
        ctx.stroke();
        ctx.strokeStyle = "#F26522";
        ctx.lineWidth = 3.5;
        linha(cartD);
        ctx.stroke();

        const mesAtinge = mesQueAtingeObjetivo(data.cart, totalMeses);
        if (objVis) {
          ctx.setLineDash([8, 5]);
          ctx.strokeStyle = "#F5B942";
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.9;
          ctx.beginPath();
          for (let i = 24; i <= totalMeses; i++) {
            const px = X(i + xMesMin),
              py = Y(objArr[i]);
            if (i === 24) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.setLineDash([]);
          if (mesAtinge !== Infinity && mesAtinge >= 0) {
            const xc = X(mesAtinge);
            const tgtNom = objetivoBase() * fatorIpca(mesAtinge);
            const yc = Y(adj ? objetivoBase() : tgtNom);
            ctx.fillStyle = "#2BD9A6";
            ctx.beginPath();
            ctx.arc(xc, yc, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#0A0F38";
            ctx.lineWidth = 2.5;
            ctx.stroke();
          }
        }

        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = "#FF6B2C";
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.moveTo(X(0), gy + padT);
        ctx.lineTo(X(0), gy + padT + ch);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.setLineDash([]);

        // marcadores de objetivos do cliente (compra planejada)
        if (Array.isArray(state.objetivos) && state.objetivos.length) {
          const _icoO = {
            Imóvel: "🏠",
            Carro: "🚗",
            Viagem: "✈️",
            Outro: "🎯",
          };
          state.objetivos.forEach(function (o, k) {
            const val = Number(o && o.valor) || 0,
              ano = Number(o && o.ano) || 0;
            if (val <= 0 || ano <= 0 || ano > state.prazoAnos) return;
            const xc = X(ano * 12);
            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = "#E8709B";
            ctx.lineWidth = 1.4;
            ctx.globalAlpha = 0.78;
            ctx.beginPath();
            ctx.moveTo(xc, gy + padT);
            ctx.lineTo(xc, gy + padT + ch);
            ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.setLineDash([]);
            const lbl = (_icoO[o.tipo] || "🎯") + " -R$ " + valorAmigavel(val);
            ctx.font = "800 10px Manrope";
            const wl = ctx.measureText(lbl).width + 14;
            let lx = xc - wl / 2;
            if (lx < gx + padL + 2) lx = gx + padL + 2;
            if (lx + wl > gx + gw - padR - 2) lx = gx + gw - padR - 2 - wl;
            const ly = gy + padT + 3 + (k % 2) * 21;
            ctx.fillStyle = "#E8709B";
            ctx.fillRect(lx, ly, wl, 17);
            ctx.fillStyle = "#fff";
            ctx.textAlign = "center";
            ctx.fillText(lbl, lx + wl / 2, ly + 12);
            ctx.textAlign = "left";
          });
        }

        ctx.fillStyle = "#F26522";
        ctx.beginPath();
        ctx.arc(X(xMesMax), Y(cartD[totalMeses]), 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#5B8DEF";
        ctx.beginPath();
        ctx.arc(X(xMesMax), Y(cdiD[totalMeses]), 4, 0, Math.PI * 2);
        ctx.fill();

        const yrs = state.prazoAnos;
        const ticks = [-24, 0];
        [60, 120, 180, 240, 300].forEach((m) => {
          if (m <= yrs * 12) ticks.push(m);
        });
        ticks.push(yrs * 12);
        const uniq = [...new Set(ticks)].sort((a, b) => a - b);
        ctx.font = "500 9px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        uniq.forEach((m) => {
          let lbl;
          if (m === 0) lbl = "Hoje";
          else if (m < 0) lbl = "-" + Math.abs(m / 12) + "a";
          else lbl = "+" + m / 12 + "a";
          ctx.fillStyle = m === 0 ? "#FF6B2C" : "#8089BE";
          ctx.fillText(lbl, X(m), gy + padT + ch + 18);
        });
        ctx.textAlign = "left";

        // selo "valores em R$ de hoje" quando o IPCA está ligado
        if (adj) {
          const tw = 168,
            tx = X(xMesMin) + 6,
            ty = gy + padT + 4,
            th = 19;
          const rrM = (x, yy, w, h, r) => {
            const k = Math.min(r, w / 2, h / 2);
            ctx.beginPath();
            ctx.moveTo(x + k, yy);
            ctx.arcTo(x + w, yy, x + w, yy + h, k);
            ctx.arcTo(x + w, yy + h, x, yy + h, k);
            ctx.arcTo(x, yy + h, x, yy, k);
            ctx.arcTo(x, yy, x + w, yy, k);
            ctx.closePath();
          };
          rrM(tx, ty, tw, th, 9);
          ctx.fillStyle = "rgba(245,185,66,.14)";
          ctx.fill();
          rrM(tx, ty, tw, th, 9);
          ctx.strokeStyle = "#F5B942";
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.font = "700 9.5px 'Manrope', sans-serif";
          ctx.fillStyle = "#F5B942";
          ctx.textAlign = "left";
          ctx.fillText("📉 Valores em R$ de hoje (IPCA)", tx + 10, ty + 13);
        }

        const _marc = state.protecao.filter((p) => p.on).length;
        const _whole = state.protecao.some((p) => p.id === "wholelife" && p.on);
        const rrP = (x, yy, w, h, r) => {
          const k = Math.min(r, w / 2, h / 2);
          ctx.beginPath();
          ctx.moveTo(x + k, yy);
          ctx.arcTo(x + w, yy, x + w, yy + h, k);
          ctx.arcTo(x + w, yy + h, x, yy + h, k);
          ctx.arcTo(x, yy + h, x, yy, k);
          ctx.arcTo(x, yy, x + w, yy, k);
          ctx.closePath();
        };
        let _cor, _lbl, _rgb, _wb;
        if (_marc === 0) {
          _cor = "#FF6B2C";
          _lbl = "Sem proteção";
          _rgb = "255,107,44";
          _wb = 110;
        } else if (!_whole) {
          _cor = "#F5B942";
          _lbl = "Proteção parcial";
          _rgb = "245,185,66";
          _wb = 122;
        } else {
          _cor = "#2BD9A6";
          _lbl = "Patrimônio protegido";
          _rgb = "43,217,166";
          _wb = 142;
        }
        const _hb = 21,
          _bx = gx + padL + cw - _wb,
          _by = gy + 2;
        rrP(_bx, _by, _wb, _hb, 10);
        ctx.fillStyle = "rgba(" + _rgb + ",0.12)";
        ctx.fill();
        rrP(_bx, _by, _wb, _hb, 10);
        ctx.strokeStyle = _cor;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(_bx + 13, _by + 10.5, 3, 0, Math.PI * 2);
        ctx.fillStyle = _cor;
        ctx.fill();
        ctx.textAlign = "left";
        ctx.font = "700 10px 'Manrope', sans-serif";
        ctx.fillStyle = _cor;
        ctx.fillText(_lbl, _bx + 22, _by + 14);
        ctx.textAlign = "left";
      }

      async function gerarPngCanvas() {
        const { cdi, cart, totalMeses } = calcular();
        const finalCart = cart[totalMeses];
        const finalCdi = cdi[totalMeses];
        const delta = Math.max(0, finalCart - finalCdi);
        const deltaPct = finalCdi > 0 ? (finalCart / finalCdi - 1) * 100 : 0;
        const mesAtinge = mesQueAtingeObjetivo(cart, totalMeses);
        const nome = state.nomeCliente || "";
        const hoje = new Date().toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });

        const SC = 2,
          W = 760,
          PAD = 44,
          IW = W - PAD * 2,
          HMAX = 2000;
        const big = document.createElement("canvas");
        big.width = W * SC;
        big.height = HMAX * SC;
        const ctx = big.getContext("2d");
        if (window.__hubPngTema === "claro") window.__aplicarPaletaClara(ctx);
        ctx.scale(SC, SC);
        ctx.textBaseline = "alphabetic";

        const setFont = (weight, size, fam, fb) =>
          (ctx.font =
            weight +
            " " +
            size +
            "px '" +
            (fam || "Manrope") +
            "', " +
            (fb || "sans-serif"));
        const rr = (x, y, w, h, r) => {
          const k = Math.min(r, w / 2, h / 2);
          ctx.beginPath();
          ctx.moveTo(x + k, y);
          ctx.arcTo(x + w, y, x + w, y + h, k);
          ctx.arcTo(x + w, y + h, x, y + h, k);
          ctx.arcTo(x, y + h, x, y, k);
          ctx.arcTo(x, y, x + w, y, k);
          ctx.closePath();
        };
        const fillRR = (x, y, w, h, r, fill) => {
          rr(x, y, w, h, r);
          ctx.fillStyle = fill;
          ctx.fill();
        };
        const strokeRR = (x, y, w, h, r, color, lw) => {
          rr(x, y, w, h, r);
          ctx.strokeStyle = color;
          ctx.lineWidth = lw || 1;
          ctx.stroke();
        };
        const ls = (v) => {
          try {
            ctx.letterSpacing = v;
          } catch (e) {}
        };

        const bg = ctx.createLinearGradient(0, 0, W * 0.3, HMAX);
        bg.addColorStop(0, "#0A0F38");
        bg.addColorStop(0.55, "#070B2E");
        bg.addColorStop(1, "#05081F");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, HMAX);

        let y = 26;
        const ob = ctx.createLinearGradient(PAD, 0, W - PAD, 0);
        ob.addColorStop(0, "#F26522");
        ob.addColorStop(1, "#FF6B2C");
        fillRR(PAD, y, IW, 5, 2.5, ob);
        y += 27;

        const logoBase = y + 28;
        setFont("800", 34, "Sora");
        ctx.fillStyle = "#F26522";
        ctx.textAlign = "left";
        window.__ricoLogoAuto(ctx, PAD, logoBase);
        ctx.textAlign = "right";
        setFont("800", 11, "Manrope");
        ls("3px");
        ctx.fillStyle = "#F26522";
        ctx.fillText("PLANO DE INVESTIMENTOS", W - PAD, y + 12);
        ls("normal");
        setFont("500", 12, "Manrope");
        ctx.fillStyle = "#6F77A8";
        ctx.fillText(hoje, W - PAD, y + 30);
        ctx.textAlign = "left";
        y += 50;

        if (nome) {
          setFont("600", 13, "Manrope");
          ctx.fillStyle = "#A9B0D6";
          ls(".5px");
          ctx.fillText("Preparado especialmente para", PAD, y + 12);
          ls("normal");
          setFont("800", 30, "Sora");
          ctx.fillStyle = "#fff";
          ctx.fillText(nome, PAD, y + 44);
          y += 66;
        } else {
          setFont("800", 26, "Sora");
          ctx.fillStyle = "#fff";
          ctx.fillText("Plano de Investimentos Personalizado", PAD, y + 30);
          y += 54;
        }

        const bigH = 118;
        const gb = ctx.createLinearGradient(PAD, y, PAD + IW, y + bigH);
        gb.addColorStop(0, "rgba(242,101,34,.14)");
        gb.addColorStop(1, "rgba(255,107,44,.05)");
        fillRR(PAD, y, IW, bigH, 18, gb);
        strokeRR(PAD, y, IW, bigH, 18, "rgba(242,101,34,.3)", 1);
        const bx = PAD + 30;
        setFont("700", 12, "Manrope");
        ctx.fillStyle = "#A9B0D6";
        ls("1.5px");
        ctx.fillText(
          "PROJEÇÃO PARA " +
            state.prazoAnos +
            (state.prazoAnos === 1 ? " ANO" : " ANOS"),
          bx,
          y + 30,
        );
        ls("normal");
        setFont("800", 42, "Sora");
        ctx.fillStyle = "#FF6B2C";
        ctx.fillText("R$ " + f(finalCart), bx, y + 78);
        setFont("700", 15, "Manrope");
        ctx.fillStyle = "#2BD9A6";
        const t1 = "+ R$ " + f(delta) + " acima do CDI";
        ctx.fillText(t1, bx, y + 104);
        const w1 = ctx.measureText(t1).width;
        ctx.fillStyle = "#A9B0D6";
        ctx.fillText(
          "   (" +
            (deltaPct >= 0 ? "+" : "") +
            fmtBRdec.format(deltaPct) +
            "% ao final)",
          bx + w1,
          y + 104,
        );
        y += bigH + 16;

        const stats = [
          ["INVESTIMENTO INICIAL", "R$ " + f(state.valor)],
          [
            "APORTE MENSAL",
            state.aporteMensal > 0 ? "R$ " + f(state.aporteMensal) : "—",
          ],
          ["RENTABILIDADE", rentLabel()],
          [
            "PRAZO",
            state.prazoAnos + (state.prazoAnos === 1 ? " ano" : " anos"),
          ],
        ];
        const gap = 12,
          sw = (IW - gap * 3) / 4,
          shh = 64;
        stats.forEach((s, i) => {
          const sx = PAD + i * (sw + gap);
          fillRR(sx, y, sw, shh, 12, "rgba(255,255,255,.04)");
          strokeRR(sx, y, sw, shh, 12, "rgba(120,130,210,.18)", 1);
          setFont("700", 9, "Manrope");
          ctx.fillStyle = "#A9B0D6";
          ls(".6px");
          ctx.fillText(s[0], sx + 14, y + 24);
          ls("normal");
          setFont("800", 16, "Sora");
          ctx.fillStyle = "#fff";
          ctx.fillText(s[1], sx + 14, y + 48);
        });
        y += shh + 16;

        if (state.rendaMensal > 0) {
          const objBase = objetivoBase();
          const objFim = objetivoNoMesIndex(totalMeses);
          let txt, col, rgb;
          if (mesAtinge !== Infinity) {
            const anos = Math.floor(mesAtinge / 12),
              meses = Math.round(mesAtinge % 12);
            const t =
              anos <= 0
                ? meses + (meses === 1 ? " mês" : " meses")
                : meses === 0
                  ? anos + (anos === 1 ? " ano" : " anos")
                  : anos +
                    (anos === 1 ? " ano" : " anos") +
                    " e " +
                    meses +
                    (meses === 1 ? " mês" : " meses");
            txt =
              "🚀 Renda de R$ " +
              valorAmigavel(state.rendaMensal) +
              "/mês alcançada em " +
              t;
            col = "#2BD9A6";
            rgb = "43,217,166";
          } else {
            const pct = (finalCart / objFim) * 100;
            txt =
              "🎯 Renda de R$ " +
              valorAmigavel(state.rendaMensal) +
              "/mês — " +
              fmtBRdec.format(pct) +
              "% do patrimônio em " +
              state.prazoAnos +
              " anos";
            col = "#F5B942";
            rgb = "245,185,66";
          }
          const oh = 44;
          fillRR(PAD, y, IW, oh, 12, "rgba(" + rgb + ",.10)");
          strokeRR(PAD, y, IW, oh, 12, col, 1);
          setFont("700", 13.5, "Manrope");
          ctx.fillStyle = col;
          ctx.fillText(txt, PAD + 18, y + 27);
          y += oh + 16;

          const rh = 34;
          fillRR(PAD, y, IW, rh, 10, "rgba(245,185,66,.08)");
          strokeRR(PAD, y, IW, rh, 10, "rgba(245,185,66,.3)", 1);
          setFont("700", 12, "Manrope");
          ctx.fillStyle = "#F5B942";
          ctx.fillText(
            "💰 Patrimônio necessário: R$ " +
              f(objBase) +
              " hoje · R$ " +
              f(objFim) +
              " corrigido por IPCA (" +
              fmtPct(state.ipca) +
              "% a.a.) em " +
              state.prazoAnos +
              (state.prazoAnos === 1 ? " ano" : " anos"),
            PAD + 18,
            y + 22,
          );
          y += rh + 16;
        }

        const dispPNG = dadosExibicao();
        const chartH = 232;
        fillRR(PAD, y, IW, chartH, 16, "rgba(28,36,112,.35)");
        strokeRR(PAD, y, IW, chartH, 16, "rgba(120,130,210,.18)", 1);
        setFont("700", 15, "Sora");
        ctx.fillStyle = "#fff";
        ctx.fillText("Evolução do patrimônio", PAD + 22, y + 30);
        if (dispPNG.adj) {
          setFont("600", 11, "Manrope");
          ctx.fillStyle = "#F5B942";
          ctx.fillText(
            "em R$ de hoje · IPCA " + fmtPct(state.ipca) + "% a.a.",
            PAD + 22,
            y + 47,
          );
        }
        desenharGraficoCanvas(
          ctx,
          PAD + 18,
          y + 42,
          IW - 36,
          chartH - 60,
          dispPNG,
        );
        y += chartH + 16;

        // Agrupa a carteira por classe de ativo para o plano do cliente
        const catMap = {};
        const catOrder = [];
        state.alocacao.forEach((a) => {
          if (a.pct <= 0) return;
          if (!(a.cat in catMap)) {
            catMap[a.cat] = { pct: 0, color: a.color };
            catOrder.push(a.cat);
          }
          catMap[a.cat].pct += a.pct;
        });
        const somaCarteira = catOrder.reduce((s, c) => s + catMap[c].pct, 0);
        const sectH = Math.max(
          162,
          56 +
            catOrder.length * 21 +
            (Math.round(somaCarteira * 10) !== 1000 ? 22 : 8),
        );
        const dW = 180;
        fillRR(PAD, y, dW, sectH, 16, "rgba(28,36,112,.35)");
        strokeRR(PAD, y, dW, sectH, 16, "rgba(120,130,210,.18)", 1);
        const dcx = PAD + dW / 2,
          dcy = y + 66,
          dr = 46,
          dlw = 20;
        desenharDonutCanvas(ctx, dcx, dcy, dr, dlw);
        ctx.textAlign = "center";
        setFont("700", 8.5, "Manrope");
        ctx.fillStyle = "#A9B0D6";
        ls(".8px");
        ctx.fillText("TOTAL", dcx, dcy - 4);
        ls("normal");
        setFont("800", 15, "Sora");
        ctx.fillStyle = "#fff";
        ctx.fillText("R$ " + valorAmigavel(state.valor), dcx, dcy + 14);
        setFont("700", 8, "Manrope");
        ctx.fillStyle = "#6F77A8";
        ls(".6px");
        ctx.fillText("DISTRIBUIÇÃO DA CARTEIRA", dcx, y + sectH - 16);
        ls("normal");
        ctx.textAlign = "left";

        const rcx = PAD + dW + 16,
          rcw = IW - dW - 16;
        fillRR(rcx, y, rcw, sectH, 16, "rgba(28,36,112,.35)");
        strokeRR(rcx, y, rcw, sectH, 16, "rgba(120,130,210,.18)", 1);
        setFont("700", 15, "Sora");
        ctx.fillStyle = "#fff";
        ctx.fillText("Composição da carteira", rcx + 20, y + 28);
        let ry = y + 52;
        catOrder.forEach((cat) => {
          const c = catMap[cat];
          fillRR(rcx + 20, ry - 9, 11, 11, 3, c.color);
          setFont("600", 13, "Manrope");
          ctx.fillStyle = "#fff";
          ctx.fillText(cat, rcx + 40, ry);
          setFont("800", 13.5, "Sora");
          ctx.fillStyle = c.color;
          ctx.textAlign = "right";
          ctx.fillText(fmtPct(c.pct) + "%", rcx + rcw - 20, ry);
          ctx.textAlign = "left";
          ry += 21;
        });
        if (Math.round(somaCarteira * 10) !== 1000) {
          setFont("600", 11, "Manrope");
          ctx.fillStyle = "#F5B942";
          ctx.fillText(
            "Total alocado: " + fmtPct(somaCarteira) + "%",
            rcx + 40,
            ry + 2,
          );
        }
        y += sectH + 16;

        // ----- ATIVOS IMOBILIZADOS (só aparece se houver imóveis) -----
        if (state.imoveis.length > 0) {
          const totalQtd = state.imoveis.reduce((s, i) => s + i.quantidade, 0);
          const totalVal = state.imoveis.reduce((s, i) => s + i.valor, 0);
          const porEstado = {};
          state.imoveis.forEach((i) => {
            if (!porEstado[i.estado])
              porEstado[i.estado] = { valor: 0, qtd: 0 };
            porEstado[i.estado].valor += i.valor;
            porEstado[i.estado].qtd += i.quantidade;
          });
          const estados = Object.entries(porEstado).sort(
            (a, b) => b[1].valor - a[1].valor,
          );
          const maxVal = Math.max(...estados.map((e) => e[1].valor), 1);
          const MAXROWS = 7;
          const shown = estados.slice(0, MAXROWS);
          const extra = estados.length - shown.length;
          const rowH = 22;
          const imH = 64 + shown.length * rowH + (extra > 0 ? 18 : 0) + 12;

          fillRR(PAD, y, IW, imH, 16, "rgba(28,36,112,.35)");
          strokeRR(PAD, y, IW, imH, 16, "rgba(120,130,210,.18)", 1);
          setFont("700", 15, "Sora");
          ctx.fillStyle = "#fff";
          ctx.fillText("Ativos imobilizados", PAD + 22, y + 28);
          setFont("600", 12, "Manrope");
          ctx.fillStyle = "#A9B0D6";
          const resumo =
            "Total R$ " +
            f(totalVal) +
            " · " +
            totalQtd +
            (totalQtd > 1 ? " imóveis" : " imóvel") +
            " em " +
            estados.length +
            (estados.length > 1 ? " estados" : " estado");
          ctx.fillText(resumo, PAD + 22, y + 47);

          let iy = y + 70;
          const barX = PAD + 230,
            valX = PAD + IW - 22;
          const barW = Math.max(60, valX - 16 - barX - 250);
          shown.forEach(([uf, d]) => {
            setFont("700", 12.5, "Sora");
            ctx.fillStyle = "#fff";
            ctx.textAlign = "left";
            ctx.fillText(uf, PAD + 22, iy + 4);
            setFont("500", 11, "Manrope");
            ctx.fillStyle = "#6F77A8";
            const nm = UF_NOME[uf] || "";
            ctx.fillText(
              nm.length > 18 ? nm.slice(0, 17) + "…" : nm,
              PAD + 52,
              iy + 4,
            );
            fillRR(barX, iy - 4, barW, 8, 4, "rgba(255,255,255,.06)");
            const w = Math.max(4, barW * (d.valor / maxVal));
            const bgrad = ctx.createLinearGradient(barX, 0, barX + w, 0);
            bgrad.addColorStop(0, "#F26522");
            bgrad.addColorStop(1, "#FF6B2C");
            fillRR(barX, iy - 4, w, 8, 4, bgrad);
            setFont("700", 12, "Manrope");
            ctx.fillStyle = "#A9B0D6";
            ctx.textAlign = "right";
            ctx.fillText(
              "R$ " +
                f(d.valor) +
                " · " +
                d.qtd +
                (d.qtd > 1 ? " imóveis" : " imóvel"),
              valX,
              iy + 4,
            );
            ctx.textAlign = "left";
            iy += rowH;
          });
          if (extra > 0) {
            setFont("600", 11, "Manrope");
            ctx.fillStyle = "#6F77A8";
            ctx.fillText(
              "+ " + extra + (extra > 1 ? " outros estados" : " outro estado"),
              PAD + 22,
              iy + 4,
            );
          }
          y += imH + 16;
        }

        // ----- INVESTIMENTOS EM OUTRAS INSTITUIÇÕES (só aparece se houver) -----
        if (state.externos.length > 0) {
          const totalVal = state.externos.reduce((s, i) => s + i.valor, 0);
          const porInst = {};
          state.externos.forEach((i) => {
            porInst[i.instituicao] = (porInst[i.instituicao] || 0) + i.valor;
          });
          const insts = Object.entries(porInst).sort((a, b) => b[1] - a[1]);
          const maxVal = Math.max(...insts.map((e) => e[1]), 1);
          const MAXROWS = 7;
          const shown = insts.slice(0, MAXROWS);
          const extra = insts.length - shown.length;
          const rowH = 22;
          const exH = 64 + shown.length * rowH + (extra > 0 ? 18 : 0) + 12;

          fillRR(PAD, y, IW, exH, 16, "rgba(28,36,112,.35)");
          strokeRR(PAD, y, IW, exH, 16, "rgba(120,130,210,.18)", 1);
          setFont("700", 15, "Sora");
          ctx.fillStyle = "#fff";
          ctx.fillText(
            "Investimentos em outras instituições",
            PAD + 22,
            y + 28,
          );
          setFont("600", 12, "Manrope");
          ctx.fillStyle = "#A9B0D6";
          const resumo =
            "Total R$ " +
            f(totalVal) +
            " · " +
            state.externos.length +
            (state.externos.length > 1 ? " aplicações" : " aplicação") +
            " em " +
            insts.length +
            (insts.length > 1 ? " instituições" : " instituição");
          ctx.fillText(resumo, PAD + 22, y + 47);

          let iy = y + 70;
          const valX = PAD + IW - 22,
            barX = PAD + 210;
          const barW = Math.max(60, valX - 16 - barX - 130);
          shown.forEach(([nome, val]) => {
            setFont("700", 12.5, "Sora");
            ctx.fillStyle = "#fff";
            ctx.textAlign = "left";
            ctx.fillText(
              nome.length > 24 ? nome.slice(0, 23) + "…" : nome,
              PAD + 22,
              iy + 4,
            );
            fillRR(barX, iy - 4, barW, 8, 4, "rgba(255,255,255,.06)");
            const w = Math.max(4, barW * (val / maxVal));
            const bgrad = ctx.createLinearGradient(barX, 0, barX + w, 0);
            bgrad.addColorStop(0, "#9B6BFF");
            bgrad.addColorStop(1, "#B68BFF");
            fillRR(barX, iy - 4, w, 8, 4, bgrad);
            setFont("700", 12, "Manrope");
            ctx.fillStyle = "#A9B0D6";
            ctx.textAlign = "right";
            ctx.fillText("R$ " + f(val), valX, iy + 4);
            ctx.textAlign = "left";
            iy += rowH;
          });
          if (extra > 0) {
            setFont("600", 11, "Manrope");
            ctx.fillStyle = "#6F77A8";
            ctx.fillText(
              "+ " +
                extra +
                (extra > 1 ? " outras instituições" : " outra instituição"),
              PAD + 22,
              iy + 4,
            );
          }
          y += exH + 16;
        }

        // ----- PATRIMÔNIO TOTAL (Rico projetado + outras instituições + imobilizado) -----
        if (state.imoveis.length > 0 || state.externos.length > 0) {
          const totImo = state.imoveis.reduce((s, i) => s + i.valor, 0);
          const totExt = state.externos.reduce((s, i) => s + i.valor, 0);
          const patProj = finalCart + totExt + totImo;
          const patHoje = state.valor + totExt + totImo;
          const pInv = patProj > 0 ? (finalCart / patProj) * 100 : 0;
          const pExt = patProj > 0 ? (totExt / patProj) * 100 : 0;
          const pth = 112;
          fillRR(PAD, y, IW, pth, 16, "rgba(242,101,34,.10)");
          strokeRR(PAD, y, IW, pth, 16, "rgba(242,101,34,.3)", 1);
          setFont("700", 11, "Manrope");
          ctx.fillStyle = "#A9B0D6";
          ls("1.5px");
          ctx.fillText(
            "PATRIMÔNIO TOTAL ESTIMADO · EM " +
              state.prazoAnos +
              (state.prazoAnos === 1 ? " ANO" : " ANOS"),
            PAD + 22,
            y + 26,
          );
          ls("normal");
          setFont("800", 30, "Sora");
          ctx.fillStyle = "#FF6B2C";
          ctx.fillText("R$ " + f(patProj), PAD + 22, y + 58);
          setFont("600", 11.5, "Manrope");
          ctx.textAlign = "right";
          ctx.fillStyle = "#5B8DEF";
          ctx.fillText(
            "Investimentos Rico  R$ " + f(finalCart),
            PAD + IW - 22,
            y + 26,
          );
          let ry2 = y + 44;
          if (totExt > 0) {
            ctx.fillStyle = "#9B6BFF";
            ctx.fillText(
              "Outras instituições  R$ " + f(totExt),
              PAD + IW - 22,
              ry2,
            );
            ry2 += 17;
          }
          if (totImo > 0) {
            ctx.fillStyle = "#FF6B2C";
            ctx.fillText("Imobilizado  R$ " + f(totImo), PAD + IW - 22, ry2);
            ry2 += 17;
          }
          ctx.fillStyle = "#A9B0D6";
          ctx.fillText("Hoje  R$ " + f(patHoje), PAD + IW - 22, ry2);
          ctx.textAlign = "left";
          const barX = PAD + 22,
            barY = y + 86,
            barW = IW - 44,
            barH = 12;
          const wInv = (barW * pInv) / 100,
            wExt = (barW * pExt) / 100;
          ctx.save();
          rr(barX, barY, barW, barH, 6);
          ctx.clip();
          ctx.fillStyle = "#5B8DEF";
          ctx.fillRect(barX, barY, wInv, barH);
          ctx.fillStyle = "#9B6BFF";
          ctx.fillRect(barX + wInv, barY, wExt, barH);
          ctx.fillStyle = "#F26522";
          ctx.fillRect(barX + wInv + wExt, barY, barW - wInv - wExt, barH);
          ctx.restore();
          y += pth + 16;
        }

        const marcados = state.protecao.filter((p) => p.on);
        const temWhole = state.protecao.some(
          (p) => p.id === "wholelife" && p.on,
        );
        let ptxt, pcol, prgb;
        if (marcados.length === 0) {
          ptxt =
            "⚠️ Patrimônio ainda sem proteção — vale conversarmos sobre isso";
          pcol = "#FF6B2C";
          prgb = "255,107,44";
        } else if (temWhole) {
          ptxt =
            "🛡️ Patrimônio protegido com Whole Life — a cobertura mais completa";
          pcol = "#2BD9A6";
          prgb = "43,217,166";
        } else {
          ptxt =
            "🛡️ Patrimônio protegido · " +
            marcados.map((p) => p.name).join(", ");
          pcol = "#2BD9A6";
          prgb = "43,217,166";
        }
        const ph = 42;
        fillRR(PAD, y, IW, ph, 12, "rgba(" + prgb + ",.10)");
        strokeRR(PAD, y, IW, ph, 12, pcol, 1);
        setFont("700", 13.5, "Manrope");
        ctx.fillStyle = pcol;
        ctx.fillText(ptxt, PAD + 18, y + 26);
        y += ph + 20;

        // custo estimado de sucessão (tópico 5)
        {
          const _totImoS = state.imoveis.reduce(
            (s, i) => s + (Number(i.valor) || 0),
            0,
          );
          const _totExtS = state.externos.reduce(
            (s, i) => s + (Number(i.valor) || 0),
            0,
          );
          const _patTotS = (Number(state.valor) || 0) + _totImoS + _totExtS;
          const _custoS = _patTotS * 0.2;
          const sh = 48;
          fillRR(PAD, y, IW, sh, 12, "rgba(255,107,44,.08)");
          strokeRR(PAD, y, IW, sh, 12, "rgba(255,107,44,.4)", 1);
          setFont("700", 13, "Manrope");
          ctx.fillStyle = "#FF8B52";
          ctx.fillText(
            "Custo estimado de sucessão (≈ 20%): R$ " + f(_custoS),
            PAD + 18,
            y + 21,
          );
          setFont("500", 10.5, "Manrope");
          ctx.fillStyle = "#A9B0D6";
          ctx.fillText(
            "Sobre patrimônio total de R$ " +
              f(_patTotS) +
              " · ITCMD varia por estado (2%–8%) + inventário e honorários.",
            PAD + 18,
            y + 38,
          );
          y += sh + 16;
        }

        setFont("500", 10.5, "Manrope");
        ctx.fillStyle = "#6F77A8";
        const disc =
          "Simulação ilustrativa baseada no CDI histórico recente e na média de longo prazo. Valores brutos, sem considerar impostos ou taxas. Não constitui oferta ou garantia de rentabilidade — rentabilidade passada não garante resultados futuros.";
        y = wrapTextCanvas(ctx, disc, PAD, y + 6, IW, 15) + 14;
        setFont("800", 16, "Sora");
        ctx.fillStyle = "#F26522";
        ctx.textAlign = "right";
        window.__ricoLogoAuto(ctx, W - PAD, y);
        ctx.textAlign = "left";
        y += 16;

        const finalH = Math.min(HMAX, Math.ceil(y + 8));
        const out = document.createElement("canvas");
        out.width = W * SC;
        out.height = finalH * SC;
        const octx = out.getContext("2d");
        octx.drawImage(
          big,
          0,
          0,
          W * SC,
          finalH * SC,
          0,
          0,
          W * SC,
          finalH * SC,
        );
        return out.toDataURL("image/png");
      }

      // ============================================================================
      // PNG EXPANDIDO (paisagem) — mesmo motor de desenho do plano padrao, porem em
      // 1600px de largura, com 3 colunas e blocos extras: marcos da projecao,
      // objetivos futuros, patrimonio consolidado, composicao detalhada,
      // aposentadoria e premissas.
      // ============================================================================
      async function gerarPngCanvasWide() {
        const base = calcular();
        const { cdi, cart, flat, totalMeses } = base;
        const finalCart = cart[totalMeses];
        const finalCdi = cdi[totalMeses];
        const delta = Math.max(0, finalCart - finalCdi);
        const deltaPct = finalCdi > 0 ? (finalCart / finalCdi - 1) * 100 : 0;
        const mesAtinge = mesQueAtingeObjetivo(cart, totalMeses);
        const nome = state.nomeCliente || "";
        const hoje = new Date().toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });

        const SC = 2,
          W = 1920,
          PAD = 52,
          IW = W - PAD * 2,
          HMAX = 2600;
        const GAP = 20,
          NCOL = 4,
          COLW = Math.floor((IW - GAP * (NCOL - 1)) / NCOL);
        const big = document.createElement("canvas");
        big.width = W * SC;
        big.height = HMAX * SC;
        const ctx = big.getContext("2d");
        if (window.__hubPngTema === "claro") window.__aplicarPaletaClara(ctx);
        ctx.scale(SC, SC);
        ctx.textBaseline = "alphabetic";

        const setFont = (weight, size, fam, fb) =>
          (ctx.font =
            weight +
            " " +
            size +
            "px '" +
            (fam || "Manrope") +
            "', " +
            (fb || "sans-serif"));
        const rr = (x, y, w, h, r) => {
          const k = Math.min(r, w / 2, h / 2);
          ctx.beginPath();
          ctx.moveTo(x + k, y);
          ctx.arcTo(x + w, y, x + w, y + h, k);
          ctx.arcTo(x + w, y + h, x, y + h, k);
          ctx.arcTo(x, y + h, x, y, k);
          ctx.arcTo(x, y, x + w, y, k);
          ctx.closePath();
        };
        const fillRR = (x, y, w, h, r, fill) => {
          rr(x, y, w, h, r);
          ctx.fillStyle = fill;
          ctx.fill();
        };
        const strokeRR = (x, y, w, h, r, color, lw) => {
          rr(x, y, w, h, r);
          ctx.strokeStyle = color;
          ctx.lineWidth = lw || 1;
          ctx.stroke();
        };
        const ls = (v) => {
          try {
            ctx.letterSpacing = v;
          } catch (e) {}
        };
        const cut = (t, n) => {
          t = String(t == null ? "" : t);
          return t.length > n ? t.slice(0, n - 1) + "…" : t;
        };
        const card = (x, yy, w, h, titulo, sub) => {
          fillRR(x, yy, w, h, 16, "rgba(28,36,112,.35)");
          strokeRR(x, yy, w, h, 16, "rgba(120,130,210,.18)", 1);
          ctx.textAlign = "left";
          if (titulo) {
            setFont("700", 17.5, "Sora");
            ctx.fillStyle = "#fff";
            ctx.fillText(cut(titulo, 26), x + 20, yy + 33);
          }
          if (sub) {
            setFont("600", 12, "Manrope");
            ctx.fillStyle = "#8089BE";
            ctx.fillText(cut(sub, 40), x + 20, yy + 53);
          }
        };
        const linha = (x, w, yy, rotulo, valor, corValor, tam) => {
          setFont("600", tam || 13.5, "Manrope");
          ctx.fillStyle = "#A9B0D6";
          ctx.textAlign = "left";
          ctx.fillText(rotulo, x, yy);
          setFont("700", tam || 13.5, "Manrope");
          ctx.fillStyle = corValor || "#fff";
          ctx.textAlign = "right";
          ctx.fillText(valor, x + w, yy);
          ctx.textAlign = "left";
        };

        const bg = ctx.createLinearGradient(0, 0, W * 0.35, HMAX);
        bg.addColorStop(0, "#0A0F38");
        bg.addColorStop(0.55, "#070B2E");
        bg.addColorStop(1, "#05081F");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, HMAX);

        let y = 28;
        const ob = ctx.createLinearGradient(PAD, 0, W - PAD, 0);
        ob.addColorStop(0, "#F26522");
        ob.addColorStop(1, "#FF6B2C");
        fillRR(PAD, y, IW, 5, 2.5, ob);
        y += 30;

        setFont("800", 38, "Sora");
        ctx.fillStyle = "#F26522";
        ctx.textAlign = "left";
        window.__ricoLogoAuto(ctx, PAD, y + 32);
        if (nome) {
          setFont("600", 12.5, "Manrope");
          ctx.fillStyle = "#A9B0D6";
          ls(".5px");
          ctx.fillText("Preparado especialmente para", PAD + 130, y + 14);
          ls("normal");
          setFont("800", 26, "Sora");
          ctx.fillStyle = "#fff";
          ctx.fillText(cut(nome, 40), PAD + 130, y + 40);
        } else {
          setFont("800", 24, "Sora");
          ctx.fillStyle = "#fff";
          ctx.fillText(
            "Plano de Investimentos Personalizado",
            PAD + 130,
            y + 34,
          );
        }
        ctx.textAlign = "right";
        setFont("800", 12, "Manrope");
        ls("3px");
        ctx.fillStyle = "#F26522";
        ctx.fillText(
          "PLANO DE INVESTIMENTOS · VISÃO EXPANDIDA",
          W - PAD,
          y + 14,
        );
        ls("normal");
        setFont("500", 12.5, "Manrope");
        ctx.fillStyle = "#6F77A8";
        ctx.fillText(hoje, W - PAD, y + 36);
        ctx.textAlign = "left";
        y += 62;

        // ---------- hero ----------
        const heroH = 140,
          heroLW = Math.round(IW * 0.36);
        const gb = ctx.createLinearGradient(PAD, y, PAD + heroLW, y + heroH);
        gb.addColorStop(0, "rgba(242,101,34,.16)");
        gb.addColorStop(1, "rgba(255,107,44,.05)");
        fillRR(PAD, y, heroLW, heroH, 18, gb);
        strokeRR(PAD, y, heroLW, heroH, 18, "rgba(242,101,34,.3)", 1);
        setFont("700", 13, "Manrope");
        ctx.fillStyle = "#A9B0D6";
        ls("1.5px");
        ctx.fillText(
          "PROJEÇÃO PARA " +
            state.prazoAnos +
            (state.prazoAnos === 1 ? " ANO" : " ANOS"),
          PAD + 28,
          y + 32,
        );
        ls("normal");
        setFont("800", 50, "Sora");
        ctx.fillStyle = "#FF6B2C";
        ctx.fillText("R$ " + f(finalCart), PAD + 28, y + 90);
        setFont("700", 16, "Manrope");
        ctx.fillStyle = "#2BD9A6";
        const t1 = "+ R$ " + f(delta) + " acima do CDI";
        ctx.fillText(t1, PAD + 28, y + 116);
        const w1 = ctx.measureText(t1).width;
        ctx.fillStyle = "#A9B0D6";
        ctx.fillText(
          "   (" +
            (deltaPct >= 0 ? "+" : "") +
            fmtBRdec.format(deltaPct) +
            "% ao final)",
          PAD + 28 + w1,
          y + 116,
        );

        const stats = [
          ["INVESTIMENTO INICIAL", "R$ " + f(state.valor)],
          [
            "APORTE MENSAL",
            aporteEfetivo() > 0 ? "R$ " + f(aporteEfetivo()) : "—",
          ],
          ["RENTABILIDADE", rentLabel()],
          [
            "PRAZO",
            state.prazoAnos + (state.prazoAnos === 1 ? " ano" : " anos"),
          ],
        ];
        const stX = PAD + heroLW + GAP,
          stTotW = IW - heroLW - GAP;
        const stW = (stTotW - GAP * 3) / 4;
        stats.forEach((s, i) => {
          const sx = stX + i * (stW + GAP);
          fillRR(sx, y, stW, heroH, 12, "rgba(255,255,255,.04)");
          strokeRR(sx, y, stW, heroH, 12, "rgba(120,130,210,.18)", 1);
          setFont("700", 11, "Manrope");
          ctx.fillStyle = "#A9B0D6";
          ls(".6px");
          ctx.fillText(s[0], sx + 18, y + 36);
          ls("normal");
          setFont("800", 26, "Sora");
          ctx.fillStyle = "#fff";
          ctx.fillText(cut(s[1], 17), sx + 18, y + 78);
        });
        y += heroH + GAP;

        // ---------- meta de renda ----------
        if (state.rendaMensal > 0) {
          const objBase = objetivoBase();
          const objFim = objetivoNoMesIndex(totalMeses);
          let txt, col, rgb;
          if (mesAtinge !== Infinity && mesAtinge > 0) {
            const anos = Math.floor(mesAtinge / 12),
              meses = Math.round(mesAtinge % 12);
            const t =
              anos <= 0
                ? meses + (meses === 1 ? " mês" : " meses")
                : meses === 0
                  ? anos + (anos === 1 ? " ano" : " anos")
                  : anos +
                    (anos === 1 ? " ano" : " anos") +
                    " e " +
                    meses +
                    (meses === 1 ? " mês" : " meses");
            txt =
              "🚀 Renda de R$ " +
              valorAmigavel(state.rendaMensal) +
              "/mês alcançada em " +
              t;
            col = "#2BD9A6";
            rgb = "43,217,166";
          } else {
            const pct = objFim > 0 ? (finalCart / objFim) * 100 : 0;
            txt =
              "🎯 Renda de R$ " +
              valorAmigavel(state.rendaMensal) +
              "/mês — " +
              fmtBRdec.format(pct) +
              "% do patrimônio em " +
              state.prazoAnos +
              " anos";
            col = "#F5B942";
            rgb = "245,185,66";
          }
          const mh = 52,
            mw = (IW - GAP) / 2;
          fillRR(PAD, y, mw, mh, 12, "rgba(" + rgb + ",.10)");
          strokeRR(PAD, y, mw, mh, 12, col, 1);
          setFont("700", 15, "Manrope");
          ctx.fillStyle = col;
          ctx.fillText(txt, PAD + 20, y + 32);
          fillRR(PAD + mw + GAP, y, mw, mh, 12, "rgba(245,185,66,.08)");
          strokeRR(PAD + mw + GAP, y, mw, mh, 12, "rgba(245,185,66,.3)", 1);
          setFont("700", 14, "Manrope");
          ctx.fillStyle = "#F5B942";
          ctx.fillText(
            "💰 Patrimônio necessário: R$ " +
              f(objBase) +
              " hoje · R$ " +
              f(objFim) +
              " corrigido por IPCA em " +
              state.prazoAnos +
              (state.prazoAnos === 1 ? " ano" : " anos"),
            PAD + mw + GAP + 18,
            y + 28,
          );
          y += mh + GAP;
        }

        // ---------- grafico ----------
        const dispPNG = dadosExibicao();
        const chartH = 400;
        const chartW = Math.round(IW * 0.63);
        const marcosX = PAD + chartW + GAP,
          marcosW = IW - chartW - GAP;
        card(
          PAD,
          y,
          chartW,
          chartH,
          "Evolução do patrimônio",
          dispPNG.adj
            ? "em R$ de hoje · IPCA " + fmtPct(state.ipca) + "% a.a."
            : "histórico dos últimos 24 meses + projeção",
        );
        ctx.textAlign = "right";
        setFont("600", 13, "Manrope");
        ctx.fillStyle = "#FF6B2C";
        ctx.fillText("■ Sua carteira", PAD + chartW - 300, y + 36);
        ctx.fillStyle = "#5B8DEF";
        ctx.fillText("■ CDI 100%", PAD + chartW - 186, y + 36);
        ctx.fillStyle = "#F5B942";
        ctx.fillText("■ Patrimônio-alvo", PAD + chartW - 70, y + 36);
        ctx.textAlign = "left";
        desenharGraficoCanvas(
          ctx,
          PAD + 20,
          y + 66,
          chartW - 40,
          chartH - 92,
          dispPNG,
        );

        // ================= cards em colunas (distribuidos pela altura) =================
        const cards = [];

        const catMap = {};
        const catOrder = [];
        state.alocacao.forEach((a) => {
          if (a.pct <= 0) return;
          if (!(a.cat in catMap)) {
            catMap[a.cat] = { pct: 0, color: a.color };
            catOrder.push(a.cat);
          }
          catMap[a.cat].pct += a.pct;
        });
        const somaCarteira = catOrder.reduce((s, c) => s + catMap[c].pct, 0);
        cards.push({
          h: Math.max(250, 232 + catOrder.length * 26),
          draw: (x, yy, w, h) => {
            card(x, yy, w, h, "Composição da carteira", "por classe de ativo");
            const dcx = x + w / 2,
              dcy = yy + 140,
              dr = 58,
              dlw = 24;
            desenharDonutCanvas(ctx, dcx, dcy, dr, dlw);
            ctx.textAlign = "center";
            setFont("700", 10, "Manrope");
            ctx.fillStyle = "#A9B0D6";
            ls(".8px");
            ctx.fillText("TOTAL", dcx, dcy - 6);
            ls("normal");
            setFont("800", 19, "Sora");
            ctx.fillStyle = "#fff";
            ctx.fillText("R$ " + valorAmigavel(state.valor), dcx, dcy + 17);
            ctx.textAlign = "left";
            let ry = yy + 240;
            catOrder.forEach((cat) => {
              const c = catMap[cat];
              fillRR(x + 20, ry - 10, 12, 12, 3, c.color);
              setFont("600", 14.5, "Manrope");
              ctx.fillStyle = "#fff";
              ctx.fillText(cut(cat, 20), x + 40, ry);
              setFont("800", 15, "Sora");
              ctx.fillStyle = c.color;
              ctx.textAlign = "right";
              ctx.fillText(fmtPct(c.pct) + "%", x + w - 20, ry);
              ctx.textAlign = "left";
              ry += 26;
            });
            if (Math.round(somaCarteira * 10) !== 1000) {
              setFont("600", 12, "Manrope");
              ctx.fillStyle = "#F5B942";
              ctx.fillText(
                "Total alocado: " + fmtPct(somaCarteira) + "%",
                x + 40,
                ry + 2,
              );
            }
          },
        });

        const itens = state.alocacao.filter((a) => a.pct > 0);
        if (itens.length) {
          const MAX = 14;
          const shown = itens.slice(0, MAX),
            extra = itens.length - shown.length;
          cards.push({
            h: 74 + shown.length * 34 + (extra > 0 ? 24 : 0) + 14,
            draw: (x, yy, w) => {
              card(
                x,
                yy,
                w,
                74 + shown.length * 34 + (extra > 0 ? 24 : 0) + 14,
                "Ativos da carteira",
                itens.length + (itens.length > 1 ? " posições" : " posição"),
              );
              let iy = yy + 88;
              shown.forEach((a) => {
                fillRR(x + 20, iy - 11, 4, 25, 2, a.shade || a.color);
                setFont("700", 14, "Manrope");
                ctx.fillStyle = "#fff";
                ctx.textAlign = "left";
                ctx.fillText(cut(a.name, 19), x + 34, iy);
                setFont("500", 11.5, "Manrope");
                ctx.fillStyle = "#6F77A8";
                ctx.fillText(cut(a.descr, 30), x + 34, iy + 15);
                setFont("800", 14.5, "Sora");
                ctx.fillStyle = a.shade || a.color;
                ctx.textAlign = "right";
                ctx.fillText(fmtPct(a.pct) + "%", x + w - 20, iy);
                setFont("600", 11.5, "Manrope");
                ctx.fillStyle = "#8089BE";
                ctx.fillText(
                  "R$ " + f((state.valor * a.pct) / 100),
                  x + w - 20,
                  iy + 15,
                );
                ctx.textAlign = "left";
                iy += 34;
              });
              if (extra > 0) {
                setFont("600", 12, "Manrope");
                ctx.fillStyle = "#6F77A8";
                ctx.fillText(
                  "+ " +
                    extra +
                    (extra > 1 ? " outros ativos" : " outro ativo"),
                  x + 34,
                  iy + 2,
                );
              }
            },
          });
        }

        {
          let anos = [1, 2, 3, 5, 10, 15, 20, 25, 30].filter(
            (a) => a <= state.prazoAnos,
          );
          if (anos.indexOf(state.prazoAnos) === -1) anos.push(state.prazoAnos);
          if (anos.length > 7) {
            const keep = [anos[0]];
            const step = (anos.length - 1) / 5;
            for (let k = 1; k < 5; k++) keep.push(anos[Math.round(k * step)]);
            keep.push(anos[anos.length - 1]);
            anos = keep.filter((v, i, arr) => arr.indexOf(v) === i);
          }
          (function () {
            const x = marcosX,
              yy = y,
              w = marcosW;
            {
              card(
                x,
                yy,
                w,
                chartH,
                "Marcos da projeção",
                "patrimônio · aportado · rendimento acumulado",
              );
              const c1 = x + 20,
                c4 = x + w - 20;
              const c2 = x + w * 0.5,
                c3 = x + w * 0.76;
              setFont("700", 10.5, "Manrope");
              ctx.fillStyle = "#6F77A8";
              ls(".5px");
              ctx.textAlign = "left";
              ctx.fillText("ANO", c1, yy + 78);
              ctx.textAlign = "right";
              ctx.fillText("PATRIMÔNIO", c2, yy + 78);
              ctx.fillText("APORTADO", c3, yy + 78);
              ctx.fillText("RENDIM.", c4, yy + 78);
              ls("normal");
              ctx.textAlign = "left";
              ctx.strokeStyle = "rgba(120,130,210,.18)";
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(c1, yy + 88);
              ctx.lineTo(c4, yy + 88);
              ctx.stroke();
              const rowStep = Math.min(
                42,
                Math.max(28, Math.floor((chartH - 150) / anos.length)),
              );
              let ty = yy + 130;
              anos.forEach((a) => {
                const idx = Math.min(totalMeses, 24 + a * 12);
                const pat = cart[idx],
                  apo = flat[idx],
                  rend = Math.max(0, pat - apo);
                setFont("700", 13.5, "Sora");
                ctx.fillStyle = "#fff";
                ctx.textAlign = "left";
                ctx.fillText(a + (a === 1 ? " ano" : " anos"), c1, ty);
                ctx.textAlign = "right";
                setFont("700", 13.5, "Manrope");
                ctx.fillStyle = "#FF8B52";
                ctx.fillText("R$ " + f(pat), c2, ty);
                setFont("600", 13, "Manrope");
                ctx.fillStyle = "#A9B0D6";
                ctx.fillText("R$ " + f(apo), c3, ty);
                ctx.fillStyle = "#2BD9A6";
                ctx.fillText("R$ " + f(rend), c4, ty);
                ctx.textAlign = "left";
                ty += rowStep;
              });
            }
          })();
        }
        y += chartH + GAP;

        {
          let lc = null;
          try {
            lc = lifeCycle();
          } catch (e) {
            lc = null;
          }
          if (lc) {
            cards.push({
              h: 280,
              draw: (x, yy, w) => {
                card(
                  x,
                  yy,
                  w,
                  280,
                  "Aposentadoria",
                  "R$ de hoje · retorno real " +
                    fmtBRdec.format(lc.r * 100) +
                    "% a.a.",
                );
                const lx = x + 20,
                  lw = w - 40;
                let ly = yy + 88;
                linha(lx, lw, ly, "Idade atual", lc.i0 + " anos");
                ly += 27;
                linha(
                  lx,
                  lw,
                  ly,
                  "Aposentadoria",
                  lc.iA +
                    " anos (em " +
                    lc.T +
                    (lc.T === 1 ? " ano" : " anos") +
                    ")",
                );
                ly += 27;
                linha(
                  lx,
                  lw,
                  ly,
                  "Patrimônio na data",
                  "R$ " + f(lc.pAtualApos),
                  "#FF8B52",
                );
                ly += 27;
                linha(
                  lx,
                  lw,
                  ly,
                  "Renda desejada",
                  state.rendaMensal > 0
                    ? "R$ " + f(state.rendaMensal) + "/mês"
                    : "—",
                );
                ly += 27;
                linha(
                  lx,
                  lw,
                  ly,
                  "Aporte p/ consumir",
                  "R$ " + f(lc.aporteConsumoMensal) + "/mês",
                );
                ly += 27;
                linha(
                  lx,
                  lw,
                  ly,
                  "Aporte p/ preservar",
                  "R$ " + f(lc.aportePreservMensal) + "/mês",
                );
                ly += 30;
                const sc2 = lc.statusColor || [43, 180, 120];
                const scHex =
                  "rgb(" + sc2[0] + "," + sc2[1] + "," + sc2[2] + ")";
                fillRR(
                  lx,
                  ly - 14,
                  lw,
                  34,
                  9,
                  "rgba(" + sc2[0] + "," + sc2[1] + "," + sc2[2] + ",.12)",
                );
                strokeRR(lx, ly - 14, lw, 34, 9, scHex, 1);
                setFont("700", 12.5, "Manrope");
                ctx.fillStyle = scHex;
                ctx.textAlign = "left";
                ctx.fillText(cut(lc.status, 34), lx + 13, ly + 8);
              },
            });
          }
        }

        const objs = (
          Array.isArray(state.objetivos) ? state.objetivos : []
        ).filter((o) => o && (Number(o.valor) || 0) > 0);
        if (objs.length) {
          const MAX = 8;
          const shown = objs
            .slice()
            .sort((a, b) => (Number(a.ano) || 0) - (Number(b.ano) || 0))
            .slice(0, MAX);
          const extra = objs.length - shown.length;
          const totalObj = objs.reduce((s, o) => s + (Number(o.valor) || 0), 0);
          cards.push({
            h: 74 + shown.length * 34 + (extra > 0 ? 24 : 0) + 16,
            draw: (x, yy, w) => {
              card(
                x,
                yy,
                w,
                74 + shown.length * 34 + (extra > 0 ? 24 : 0) + 16,
                "Objetivos futuros",
                "R$ " + f(totalObj) + " em compras planejadas",
              );
              let oy = yy + 88;
              shown.forEach((o) => {
                const ic =
                  o.tipo === "Carro"
                    ? "🚗"
                    : o.tipo === "Viagem"
                      ? "✈️"
                      : o.tipo === "Imóvel"
                        ? "🏠"
                        : "🎯";
                setFont("700", 14, "Manrope");
                ctx.fillStyle = "#fff";
                ctx.textAlign = "left";
                ctx.fillText(
                  ic + "  " + cut(o.descricao || o.tipo, 17),
                  x + 20,
                  oy,
                );
                setFont("500", 11.5, "Manrope");
                ctx.fillStyle = "#6F77A8";
                ctx.fillText(
                  "em " +
                    (Number(o.ano) || 0) +
                    ((Number(o.ano) || 0) === 1 ? " ano" : " anos"),
                  x + 20,
                  oy + 15,
                );
                setFont("800", 14.5, "Sora");
                ctx.fillStyle = "#F5B942";
                ctx.textAlign = "right";
                ctx.fillText("R$ " + f(Number(o.valor) || 0), x + w - 20, oy);
                ctx.textAlign = "left";
                oy += 34;
              });
              if (extra > 0) {
                setFont("600", 12, "Manrope");
                ctx.fillStyle = "#6F77A8";
                ctx.fillText(
                  "+ " +
                    extra +
                    (extra > 1 ? " outros objetivos" : " outro objetivo"),
                  x + 20,
                  oy + 2,
                );
              }
            },
          });
        }

        {
          const totImo = state.imoveis.reduce(
            (s, i) => s + (Number(i.valor) || 0),
            0,
          );
          const totExt = state.externos.reduce(
            (s, i) => s + (Number(i.valor) || 0),
            0,
          );
          const patProj = finalCart + totExt + totImo;
          const patHoje = state.valor + totExt + totImo;
          cards.push({
            h: 250,
            draw: (x, yy, w) => {
              card(
                x,
                yy,
                w,
                250,
                "Patrimônio consolidado",
                "Rico + outras instituições + imobilizado",
              );
              setFont("700", 11.5, "Manrope");
              ctx.fillStyle = "#A9B0D6";
              ls("1.2px");
              ctx.fillText(
                "PROJETADO EM " +
                  state.prazoAnos +
                  (state.prazoAnos === 1 ? " ANO" : " ANOS"),
                x + 20,
                yy + 84,
              );
              ls("normal");
              setFont("800", 31, "Sora");
              ctx.fillStyle = "#FF6B2C";
              ctx.fillText("R$ " + f(patProj), x + 20, yy + 120);
              const bx2 = x + 20,
                bw2 = w - 40,
                bh2 = 12,
                by2 = yy + 136;
              const pInv = patProj > 0 ? finalCart / patProj : 1;
              const pExt = patProj > 0 ? totExt / patProj : 0;
              ctx.save();
              rr(bx2, by2, bw2, bh2, 6);
              ctx.clip();
              ctx.fillStyle = "#5B8DEF";
              ctx.fillRect(bx2, by2, bw2 * pInv, bh2);
              ctx.fillStyle = "#9B6BFF";
              ctx.fillRect(bx2 + bw2 * pInv, by2, bw2 * pExt, bh2);
              ctx.fillStyle = "#F26522";
              ctx.fillRect(
                bx2 + bw2 * (pInv + pExt),
                by2,
                bw2 * (1 - pInv - pExt),
                bh2,
              );
              ctx.restore();
              let py = yy + 178;
              linha(
                bx2,
                bw2,
                py,
                "● Investimentos Rico",
                "R$ " + f(finalCart),
                "#5B8DEF",
              );
              py += 23;
              linha(
                bx2,
                bw2,
                py,
                "● Outras instituições",
                "R$ " + f(totExt),
                "#9B6BFF",
              );
              py += 23;
              linha(
                bx2,
                bw2,
                py,
                "● Imobilizado",
                "R$ " + f(totImo),
                "#FF6B2C",
              );
              py += 23;
              linha(
                bx2,
                bw2,
                py,
                "Patrimônio hoje",
                "R$ " + f(patHoje),
                "#A9B0D6",
              );
            },
          });
        }

        {
          const modo =
            state.aporteMode === "rendadespesa"
              ? "renda − despesa"
              : "valor direto";
          cards.push({
            h: 244,
            draw: (x, yy, w) => {
              card(x, yy, w, 244, "Premissas do estudo", "");
              const lx = x + 20,
                lw = w - 40;
              let ly = yy + 72;
              linha(
                lx,
                lw,
                ly,
                "CDI considerado",
                state.cdiAnual != null && state.cdiAnual > 0
                  ? fmtBRdec.format(state.cdiAnual) + "% a.a."
                  : "curva histórica",
              );
              ly += 27;
              linha(
                lx,
                lw,
                ly,
                "IPCA considerado",
                fmtPct(state.ipca) + "% a.a.",
              );
              ly += 27;
              linha(lx, lw, ly, "Rentabilidade", rentLabel(), "#FF8B52");
              ly += 27;
              linha(
                lx,
                lw,
                ly,
                "Aporte mensal",
                aporteEfetivo() > 0 ? "R$ " + f(aporteEfetivo()) : "—",
              );
              ly += 27;
              linha(lx, lw, ly, "Forma do aporte", modo);
              ly += 27;
              linha(
                lx,
                lw,
                ly,
                "Horizonte",
                state.prazoAnos + (state.prazoAnos === 1 ? " ano" : " anos"),
              );
              ly += 24;
              setFont("500", 11.5, "Manrope");
              ctx.fillStyle = "#6F77A8";
              ctx.textAlign = "left";
              wrapTextCanvas(
                ctx,
                "Valores brutos, sem dedução de IR ou taxas.",
                lx,
                ly + 12,
                lw,
                15,
              );
            },
          });
        }

        const colTop = y;
        const colY = new Array(NCOL).fill(colTop);
        cards.forEach((c) => {
          let k = 0;
          for (let i = 1; i < NCOL; i++) if (colY[i] < colY[k]) k = i;
          const x = PAD + k * (COLW + GAP);
          c.draw(x, colY[k], COLW, c.h);
          colY[k] += c.h + GAP;
        });
        y = Math.max.apply(null, colY);

        // ---------- protecao + sucessao ----------
        {
          const marcados = state.protecao.filter((p) => p.on);
          const temWhole = state.protecao.some(
            (p) => p.id === "wholelife" && p.on,
          );
          let ptxt, pcol, prgb;
          if (marcados.length === 0) {
            ptxt =
              "⚠️ Patrimônio ainda sem proteção — vale conversarmos sobre isso";
            pcol = "#FF6B2C";
            prgb = "255,107,44";
          } else if (temWhole) {
            ptxt =
              "🛡️ Patrimônio protegido com Whole Life — a cobertura mais completa";
            pcol = "#2BD9A6";
            prgb = "43,217,166";
          } else {
            ptxt =
              "🛡️ Patrimônio protegido · " +
              marcados.map((p) => p.name).join(", ");
            pcol = "#2BD9A6";
            prgb = "43,217,166";
          }
          const hh = 64,
            hw = (IW - GAP) / 2;
          fillRR(PAD, y, hw, hh, 12, "rgba(" + prgb + ",.10)");
          strokeRR(PAD, y, hw, hh, 12, pcol, 1);
          setFont("700", 15.5, "Manrope");
          ctx.fillStyle = pcol;
          ctx.textAlign = "left";
          ctx.fillText(cut(ptxt, 72), PAD + 22, y + 39);

          const _totImoS = state.imoveis.reduce(
            (s, i) => s + (Number(i.valor) || 0),
            0,
          );
          const _totExtS = state.externos.reduce(
            (s, i) => s + (Number(i.valor) || 0),
            0,
          );
          const _patTotS = (Number(state.valor) || 0) + _totImoS + _totExtS;
          const _custoS = _patTotS * 0.2;
          const sx2 = PAD + hw + GAP;
          fillRR(sx2, y, hw, hh, 12, "rgba(255,107,44,.08)");
          strokeRR(sx2, y, hw, hh, 12, "rgba(255,107,44,.4)", 1);
          setFont("700", 15, "Manrope");
          ctx.fillStyle = "#FF8B52";
          ctx.fillText(
            "Custo estimado de sucessão (≈ 20%): R$ " + f(_custoS),
            sx2 + 22,
            y + 28,
          );
          setFont("500", 12, "Manrope");
          ctx.fillStyle = "#A9B0D6";
          ctx.fillText(
            "Sobre patrimônio total de R$ " +
              f(_patTotS) +
              " · ITCMD varia por estado (2%–8%) + inventário e honorários.",
            sx2 + 22,
            y + 49,
          );
          y += hh + 18;
        }

        setFont("500", 12, "Manrope");
        ctx.fillStyle = "#6F77A8";
        ctx.textAlign = "left";
        const disc =
          "Simulação ilustrativa baseada no CDI histórico recente e na média de longo prazo. Valores brutos, sem considerar impostos ou taxas. Não constitui oferta ou garantia de rentabilidade — rentabilidade passada não garante resultados futuros.";
        y = wrapTextCanvas(ctx, disc, PAD, y + 8, IW - 160, 17) + 16;
        setFont("800", 17, "Sora");
        ctx.fillStyle = "#F26522";
        ctx.textAlign = "right";
        window.__ricoLogoAuto(ctx, W - PAD, y);
        ctx.textAlign = "left";
        y += 16;

        const finalH = Math.min(HMAX, Math.ceil(y + 10));
        const out = document.createElement("canvas");
        out.width = W * SC;
        out.height = finalH * SC;
        const octx = out.getContext("2d");
        octx.drawImage(
          big,
          0,
          0,
          W * SC,
          finalH * SC,
          0,
          0,
          W * SC,
          finalH * SC,
        );
        return out.toDataURL("image/png");
      }

      function showToast(msg) {
        const t = document.getElementById("toast");
        t.textContent = msg;
        t.classList.add("show");
        setTimeout(() => t.classList.remove("show"), 2500);
      }
      document
        .getElementById("btnExport")
        .addEventListener("click", async () => {
          const btn = document.getElementById("btnExport");
          const original = btn.innerHTML;
          btn.innerHTML =
            '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Gerando plano...';
          btn.disabled = true;

          const isIOS =
            /iPad|iPhone|iPod/.test(navigator.userAgent) ||
            (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

          try {
            if (document.fonts && document.fonts.ready) {
              try {
                await document.fonts.ready;
              } catch (e) {}
            }
            await new Promise((r) => setTimeout(r, 30));

            const dataUrl = await gerarPngCanvas();

            const ts = new Date().toISOString().slice(0, 10);
            const slug = state.nomeCliente
              ? "-" +
                state.nomeCliente
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-|-$/g, "")
              : "";
            const filename = `plano-rico${slug}-${ts}.png`;

            window.mostrarPngModal(dataUrl, filename, { accent: "#F26522" });
            showToast("✓ Plano do cliente gerado!");
          } catch (err) {
            console.error(err);
            showToast(
              "Erro: " + (err && err.message ? err.message : "tente novamente"),
            );
          } finally {
            btn.innerHTML = original;
            btn.disabled = false;
          }
        });

      document
        .getElementById("btnExportWide")
        .addEventListener("click", async () => {
          const btn = document.getElementById("btnExportWide");
          const original = btn.innerHTML;
          btn.innerHTML =
            '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Gerando plano...';
          btn.disabled = true;
          try {
            if (document.fonts && document.fonts.ready) {
              try {
                await document.fonts.ready;
              } catch (e) {}
            }
            await new Promise((r) => setTimeout(r, 30));
            const dataUrl = await gerarPngCanvasWide();
            const ts = new Date().toISOString().slice(0, 10);
            const slug = state.nomeCliente
              ? "-" +
                state.nomeCliente
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-|-$/g, "")
              : "";
            const filename = `plano-rico-expandido${slug}-${ts}.png`;
            window.mostrarPngModal(dataUrl, filename, {
              accent: "#F26522",
              wide: true,
              hint: "Plano expandido — baixe ou copie a imagem para enviar ao cliente.",
            });
            showToast("✓ Plano expandido gerado!");
          } catch (err) {
            console.error(err);
            showToast(
              "Erro: " + (err && err.message ? err.message : "tente novamente"),
            );
          } finally {
            btn.innerHTML = original;
            btn.disabled = false;
          }
        });

      (function () {
        var b = document.getElementById("btnPngTema");
        if (!b) return;
        function rot() {
          b.textContent =
            window.__hubPngTema === "claro"
              ? "\u{1F31E} PNG: paleta clara"
              : "\u{1F319} PNG: paleta escura";
        }
        b.addEventListener("click", function () {
          window.__hubPngTema =
            window.__hubPngTema === "claro" ? "escuro" : "claro";
          try {
            window.hubStorage.setItem("hubPngTema", window.__hubPngTema);
          } catch (e) {}
          rot();
          if (window.__rotularPngTema) window.__rotularPngTema();
          showToast(
            "Pr\u00f3ximos PNGs sair\u00e3o na paleta " +
              (window.__hubPngTema === "claro" ? "clara" : "escura"),
          );
        });
        rot();
      })();

      // ============ MOTOR DE CICLO DE VIDA (3 cenários) ============
      function realRateAnual() {
        if (state.rentMode === "ipca")
          return (Number(state.ipcaSpread) || 0) / 100;
        var cdiBase =
          (state.cdiAnual != null ? Number(state.cdiAnual) : 10) / 100;
        var nominal = (cdiBase * (Number(state.pctCdi) || 0)) / 100;
        var ipca = (Number(state.ipca) || 0) / 100;
        return (1 + nominal) / (1 + ipca) - 1;
      }
      function lifeCycle() {
        var r = realRateAnual();
        if (!isFinite(r)) r = 0;
        var i0 = Math.round(Number(state.idadeAtual) || 40);
        var prazo = Math.round(Number(state.prazoAnos) || 20);
        var iA = i0 + prazo; // idade de aposentadoria
        var iF = Math.max(iA + 1, 100); // expectativa fixa: 100 anos
        var T = iA - i0,
          N = iF - iA;
        var V0 = Number(state.valor) || 0;
        var aporteAnualAtual = aporteEfetivo() * 12;
        var resgateAnual = (Number(state.rendaMensal) || 0) * 12;
        function fv(t) {
          return Math.pow(1 + r, t);
        }
        function annFV(t) {
          return Math.abs(r) < 1e-9 ? t : (Math.pow(1 + r, t) - 1) / r;
        }
        function pvAnn(n) {
          return Math.abs(r) < 1e-9
            ? resgateAnual * n
            : (resgateAnual * (1 - Math.pow(1 + r, -n))) / r;
        }
        var targetConsumo = pvAnn(N);
        var targetPreserv =
          Math.abs(r) < 1e-9 ? targetConsumo : resgateAnual / r;
        var sFac = annFV(T);
        function aporteNeeded(target) {
          return sFac > 0 ? (target - V0 * fv(T)) / sFac : 0;
        }
        var aporteConsumoAnual = Math.max(0, aporteNeeded(targetConsumo));
        var aportePreservAnual = Math.max(0, aporteNeeded(targetPreserv));
        function build(aporteAnual, floor0) {
          var arr = [];
          var P = V0;
          for (var age = i0; age <= iF; age++) {
            arr.push({ age: age, val: P });
            if (age < iA) {
              P = P * (1 + r) + aporteAnual;
            } else {
              P = P * (1 + r) - resgateAnual;
            }
            if (floor0 && P < 0) P = 0;
          }
          return arr;
        }
        var cAtual = build(aporteAnualAtual, true);
        var cConsumo = build(aporteConsumoAnual, true);
        var cPreserv = build(aportePreservAnual, false);
        function atAge(arr, age) {
          for (var i = 0; i < arr.length; i++) {
            if (arr[i].age === age) return arr[i].val;
          }
          return arr.length ? arr[arr.length - 1].val : 0;
        }
        var pAtualApos = atAge(cAtual, iA);
        var status, statusColor, statusKey, diagMsg;
        if (pAtualApos >= targetPreserv - 1) {
          statusKey = "preservacao";
          status = "Planejamento Adequado — Preservação";
          statusColor = [43, 180, 120];
          diagMsg =
            "O planejamento atual é suficiente para preservar o patrimônio: a renda de aposentadoria seria custeada apenas pelos juros, mantendo o principal ao longo de toda a expectativa de vida.";
        } else if (pAtualApos >= targetConsumo - 1) {
          statusKey = "consumo";
          status = "Planejamento Adequado — Consumo";
          statusColor = [43, 180, 120];
          diagMsg =
            "O planejamento atual está adequado para atingir o objetivo de aposentadoria, com consumo do patrimônio. Aos " +
            iA +
            " anos, o patrimônio investido atingiria " +
            brlCents(pAtualApos) +
            ", suficiente para uma renda mensal de " +
            brlCents(state.rendaMensal || 0) +
            " até os " +
            iF +
            " anos, considerando um retorno real de " +
            (r * 100).toFixed(1).replace(".", ",") +
            "% a.a.";
        } else {
          statusKey = "insuficiente";
          status = "Planejamento a Ajustar";
          statusColor = [230, 140, 40];
          diagMsg =
            "Nas premissas atuais, o patrimônio aos " +
            iA +
            " anos (" +
            brlCents(pAtualApos) +
            ") ainda não é suficiente para sustentar a renda desejada até os " +
            iF +
            " anos. Vale aumentar o aporte mensal, rever o prazo até a aposentadoria ou ajustar a renda-alvo.";
        }
        return {
          r: r,
          i0: i0,
          iA: iA,
          iF: iF,
          T: T,
          N: N,
          V0: V0,
          aporteMensalAtual: aporteEfetivo(),
          aporteAnualAtual: aporteAnualAtual,
          resgateMensal: state.rendaMensal || 0,
          resgateAnual: resgateAnual,
          targetConsumo: targetConsumo,
          targetPreserv: targetPreserv,
          aporteConsumoAnual: aporteConsumoAnual,
          aporteConsumoMensal: aporteConsumoAnual / 12,
          aportePreservAnual: aportePreservAnual,
          aportePreservMensal: aportePreservAnual / 12,
          pAtualApos: pAtualApos,
          cAtual: cAtual,
          cConsumo: cConsumo,
          cPreserv: cPreserv,
          status: status,
          statusColor: statusColor,
          statusKey: statusKey,
          diagMsg: diagMsg,
        };
      }
      function brlCents(n) {
        n = Number(n) || 0;
        return (
          "R$ " +
          n.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
      }

      document
        .getElementById("btnExportPdf")
        .addEventListener("click", async function () {
          var ns = window.jspdf;
          if (!ns || !ns.jsPDF) {
            showToast("PDF ainda carregando — tente novamente em instantes");
            return;
          }
          var doc = new ns.jsPDF({ unit: "pt", format: "a4" });
          var W = doc.internal.pageSize.getWidth(),
            H = doc.internal.pageSize.getHeight();
          // ===== Paleta (relatório claro estilo XP/Rico) =====
          var M = 44,
            cw = W - 2 * M,
            y = M;
          var OR = [255, 78, 0],
            BLACK = [26, 28, 34],
            DARK = [55, 58, 66],
            TITLE = [74, 78, 90],
            MUT = [120, 127, 150],
            HEADBG = [92, 96, 106],
            SEP = [226, 229, 236],
            GREEN = [40, 170, 115],
            GRAY = [140, 144, 156];
          var nomeCli = state.nomeCliente || "Cliente";
          var perfilMap = {
            conservadora: "Conservadora",
            moderada: "Moderada",
            sofisticada: "Sofisticada",
          };
          var perfil = perfilMap[state.template] || "Conservadora";
          var refLabel = (function () {
            var mm = [
              "JAN",
              "FEV",
              "MAR",
              "ABR",
              "MAI",
              "JUN",
              "JUL",
              "AGO",
              "SET",
              "OUT",
              "NOV",
              "DEZ",
            ];
            var dt = new Date();
            return mm[dt.getMonth()] + "/" + dt.getFullYear();
          })();
          var hoje = new Date().toLocaleDateString("pt-BR");
          var lc = lifeCycle();
          var isRD = state.aporteMode === "rendadespesa";
          function moneyK(n) {
            n = Number(n) || 0;
            var s = n < 0 ? "-" : "";
            n = Math.abs(n);
            if (n >= 1e6)
              return s + "R$ " + (n / 1e6).toFixed(2).replace(".", ",") + "Mi";
            if (n >= 1e3) return s + "R$ " + Math.round(n / 1e3) + "mil";
            return s + "R$ " + Math.round(n);
          }
          function white() {
            doc.setFillColor(255, 255, 255);
            doc.rect(0, 0, W, H, "F");
          }
          var pageNum = 0;
          function header() {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.6);
            doc.setTextColor(BLACK[0], BLACK[1], BLACK[2]);
            doc.text("RELATÓRIO", M, 32);
            doc.setFontSize(8.6);
            doc.text("PLANEJAMENTO FINANCEIRO", M, 43);
            var ww = doc.getTextWidth("PLANEJAMENTO FINANCEIRO");
            doc.setFont("helvetica", "normal");
            doc.setTextColor(OR[0], OR[1], OR[2]);
            doc.text(" - " + refLabel, M + ww, 43);
            doc.setDrawColor(OR[0], OR[1], OR[2]);
            doc.setLineWidth(2);
            doc.line(M, 49, M + 118, 49);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(17);
            doc.setTextColor(OR[0], OR[1], OR[2]);
            doc.text("rico", W - M, 46, { align: "right" });
          }
          function footer() {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(MUT[0], MUT[1], MUT[2]);
            doc.text("Página " + pageNum, W - M, H - 26, { align: "right" });
          }
          function newPage() {
            doc.addPage();
            white();
            pageNum++;
            header();
            footer();
            y = 72;
          }
          function ensure(h) {
            if (y + h > H - 44) {
              newPage();
            }
          }
          function title(t) {
            ensure(40);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(22);
            doc.setTextColor(TITLE[0], TITLE[1], TITLE[2]);
            doc.text(t, M, y);
            y += 22;
          }
          function intro(t) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(MUT[0], MUT[1], MUT[2]);
            var ls = doc.splitTextToSize(t, cw);
            for (var i = 0; i < ls.length; i++) {
              ensure(14);
              doc.text(ls[i], M, y);
              y += 14;
            }
            y += 6;
          }
          function para(t, o) {
            o = o || {};
            doc.setFont("helvetica", o.bold ? "bold" : "normal");
            doc.setFontSize(o.size || 10);
            var c = o.color || DARK;
            doc.setTextColor(c[0], c[1], c[2]);
            var ls = doc.splitTextToSize(t, o.w || cw);
            for (var i = 0; i < ls.length; i++) {
              ensure(o.lh || 13.5);
              doc.text(ls[i], o.x || M, y);
              y += o.lh || 13.5;
            }
            y += o.gap != null ? o.gap : 5;
          }
          function tlabel(t) {
            ensure(20);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10.5);
            doc.setTextColor(BLACK[0], BLACK[1], BLACK[2]);
            doc.text(t, M, y);
            y += 6;
            doc.setDrawColor(SEP[0], SEP[1], SEP[2]);
            doc.setLineWidth(0.8);
            doc.line(M, y, M + cw, y);
            y += 10;
          }
          function table(cols, rows, opt) {
            opt = opt || {};
            var tw = 0;
            cols.forEach(function (c) {
              tw += c.w;
            });
            cols.forEach(function (c) {
              c.cw = (c.w / tw) * cw;
            });
            var rowH = opt.rowH || 21,
              headH = opt.headH || 26;
            function head() {
              ensure(headH + rowH);
              doc.setFillColor(HEADBG[0], HEADBG[1], HEADBG[2]);
              doc.rect(M, y, cw, headH, "F");
              doc.setFont("helvetica", "bold");
              doc.setFontSize(7);
              doc.setTextColor(255, 255, 255);
              var cx = M;
              cols.forEach(function (c) {
                var ls = doc.splitTextToSize(
                  String(c.label).toUpperCase(),
                  c.cw - 10,
                );
                var ty = y + headH / 2 - (ls.length - 1) * 3.4 + 2.5;
                doc.text(
                  ls,
                  c.align === "right" ? cx + c.cw - 6 : cx + 6,
                  ty,
                  c.align === "right" ? { align: "right" } : undefined,
                );
                cx += c.cw;
              });
              y += headH;
            }
            head();
            rows.forEach(function (r) {
              if (y + rowH > H - 44) {
                newPage();
                if (opt.label) {
                  tlabel(opt.label);
                }
                head();
              }
              doc.setFont("helvetica", r._b ? "bold" : "normal");
              doc.setFontSize(8.6);
              var cx = M;
              cols.forEach(function (c, ci) {
                var v = String(r[ci] == null ? "" : r[ci]);
                var col = (r._c && r._c[ci]) || DARK;
                doc.setTextColor(col[0], col[1], col[2]);
                doc.text(
                  v,
                  c.align === "right" ? cx + c.cw - 6 : cx + 6,
                  y + rowH / 2 + 3,
                  c.align === "right" ? { align: "right" } : undefined,
                );
                cx += c.cw;
              });
              doc.setDrawColor(SEP[0], SEP[1], SEP[2]);
              doc.setLineWidth(0.5);
              doc.line(M, y + rowH, M + cw, y + rowH);
              y += rowH;
            });
            y += 10;
          }
          function cards(items, opt) {
            opt = opt || {};
            var n = items.length,
              gap = 12,
              h = opt.h || 92;
            ensure(h + 6);
            var cwc = (cw - gap * (n - 1)) / n,
              cx = M;
            items.forEach(function (it) {
              doc.setDrawColor(SEP[0], SEP[1], SEP[2]);
              doc.setLineWidth(1);
              doc.roundedRect(cx, y, cwc, h, 8, 8, "S");
              var ty = y + 18;
              doc.setFont("helvetica", "bold");
              doc.setFontSize(10.5);
              doc.setTextColor(
                (it.color || DARK)[0],
                (it.color || DARK)[1],
                (it.color || DARK)[2],
              );
              doc.text(it.title, cx + 12, ty);
              ty += 15;
              (it.rows || []).forEach(function (rw) {
                doc.setFont("helvetica", "normal");
                doc.setFontSize(7.6);
                doc.setTextColor(MUT[0], MUT[1], MUT[2]);
                var kl = doc.splitTextToSize(rw.k, cwc - 22);
                doc.text(kl, cx + 12, ty);
                ty += kl.length * 8.5;
                doc.setFont("helvetica", "bold");
                doc.setFontSize(rw.big ? 12.5 : 10.5);
                var vc = rw.color || DARK;
                doc.setTextColor(vc[0], vc[1], vc[2]);
                doc.text(rw.v, cx + 12, ty);
                ty += 15;
              });
              cx += cwc + gap;
            });
            y += h + 10;
          }

          // ===================== CAPA =====================
          white();
          pageNum = 1;
          (function cover() {
            doc.setLineWidth(0.5);
            for (var k = 0; k < 24; k++) {
              var amp = 70 + k * 3.2,
                xoff = 14 + k * 6.0,
                phase = k * 0.16;
              var g = Math.min(70 + k * 6, 200),
                b = Math.min(30 + k * 6, 170);
              doc.setDrawColor(255, g, b);
              var pX = null,
                pY = null;
              for (var t = 0; t <= 1.0001; t += 0.018) {
                var py = 30 + t * (H - 70);
                var px =
                  xoff +
                  amp * Math.sin(t * 2.7 * Math.PI + phase) * (1 - t * 0.15);
                if (pX != null) doc.line(pX, pY, px, py);
                pX = px;
                pY = py;
              }
            }
            var tx = W * 0.42;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(17);
            doc.setTextColor(OR[0], OR[1], OR[2]);
            doc.text("rico", W - M, 52, { align: "right" });
            doc.setFontSize(13);
            doc.setLetterSpacing && doc.setLetterSpacing(2);
            doc.text("R E L A T Ó R I O", tx, 355);
            doc.setLetterSpacing && doc.setLetterSpacing(0);
            doc.setFontSize(33);
            doc.setTextColor(BLACK[0], BLACK[1], BLACK[2]);
            doc.text("Planejamento", tx, 398);
            doc.text("Financeiro", tx, 435);
            var my = 496;
            function meta(k, v) {
              doc.setFont("helvetica", "bold");
              doc.setFontSize(9);
              doc.setTextColor(BLACK[0], BLACK[1], BLACK[2]);
              doc.text(k, tx, my);
              my += 14;
              doc.setFont("helvetica", "normal");
              doc.setFontSize(9.5);
              doc.text(v, tx, my);
              my += 26;
            }
            meta("Cliente", "Cliente " + nomeCli);
            meta("Assessor:", "Gustavo Amorim");
            meta("Data de Referência:", hoje);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(MUT[0], MUT[1], MUT[2]);
            doc.text("Gerado em " + hoje, W - M, H - 26, { align: "right" });
          })();

          // ===================== INTRODUÇÃO =====================
          newPage();
          title("Olá, " + nomeCli);
          doc.setFont("helvetica", "italic");
          doc.setFontSize(11);
          doc.setTextColor(DARK[0], DARK[1], DARK[2]);
          var quote = doc.splitTextToSize(
            '"Este é o relatório do seu Planejamento Financeiro, completo e personalizado, baseado na sua realidade e nos seus objetivos de vida."',
            cw,
          );
          doc.text(quote, M, y);
          y += quote.length * 15 + 10;
          intro(
            "Com o Planejamento Financeiro você visualiza com clareza seu patrimônio, rendas e despesas, entende sua capacidade de poupar e define suas metas futuras — ganhando segurança e estratégia para decisões que trazem tranquilidade hoje e constroem o futuro que deseja.",
          );
          y += 4;
          doc.setFont("helvetica", "bold");
          doc.setFontSize(13);
          doc.setTextColor(TITLE[0], TITLE[1], TITLE[2]);
          doc.text("Benefícios de ter um Planejamento Financeiro", M, y);
          y += 20;
          (function () {
            var bens = [
              [
                "Controle de rendas e despesas",
                "para garantir conforto no presente e poupança para o futuro.",
              ],
              [
                "Estratégias para a liberdade financeira",
                "com uma renda estável durante a aposentadoria.",
              ],
              ["Seguros e sucessão", "para proteger seus bens e sua família."],
              [
                "Otimização fiscal",
                "para reduzir tributos e investir mais nas suas metas.",
              ],
            ];
            var colW = (cw - 20) / 2;
            for (var i = 0; i < bens.length; i++) {
              var cxb = M + (i % 2) * (colW + 20);
              var ry = y + Math.floor(i / 2) * 60;
              doc.setFillColor(255, 237, 230);
              doc.circle(cxb + 7, ry - 3, 7, "F");
              doc.setFont("helvetica", "bold");
              doc.setFontSize(10);
              doc.setTextColor(BLACK[0], BLACK[1], BLACK[2]);
              doc.text(
                doc.splitTextToSize(bens[i][0], colW - 24),
                cxb + 22,
                ry,
              );
              doc.setFont("helvetica", "normal");
              doc.setFontSize(8.6);
              doc.setTextColor(MUT[0], MUT[1], MUT[2]);
              doc.text(
                doc.splitTextToSize(bens[i][1], colW - 24),
                cxb + 22,
                ry + 13,
              );
            }
            y += Math.ceil(bens.length / 2) * 60 + 10;
          })();

          // ===================== PREMISSAS =====================
          newPage();
          title("Premissas");
          intro(
            "As premissas são as informações-chave usadas como base para construir o planejamento. A partir delas projetamos o crescimento do patrimônio, as possibilidades de realização dos objetivos e os ajustes necessários ao longo do tempo.",
          );
          tlabel("Informações pessoais mapeadas");
          table(
            [
              { label: "Informação", w: 50 },
              { label: "Valor", w: 50, align: "right" },
            ],
            [
              ["Nome", nomeCli],
              ["Idade atual", lc.i0 + " anos"],
              ["Idade de aposentadoria", lc.iA + " anos"],
              ["Expectativa de vida", lc.iF + " anos"],
            ],
            {},
          );
          tlabel("Informações financeiras mapeadas");
          var premRows = [
            ["Política de Investimentos", perfil],
            [
              "Rentabilidade real estimada",
              (lc.r * 100).toFixed(1).replace(".", ",") +
                "% a.a. (" +
                rentLabel() +
                ")",
            ],
          ];
          if (isRD) {
            premRows.push([
              "Renda média mensal / anual",
              brlCents(state.rendaAtual) +
                " / " +
                brlCents(state.rendaAtual * 12),
            ]);
            premRows.push([
              "Despesa média mensal / anual",
              brlCents(state.despesaMensal) +
                " / " +
                brlCents(state.despesaMensal * 12),
            ]);
          }
          premRows.push([
            "Capacidade de aporte mensal",
            brlCents(lc.aporteMensalAtual),
          ]);
          premRows.push([
            "Renda desejada na aposentadoria",
            brlCents(lc.resgateMensal) + "/mês",
          ]);
          premRows.push(["Investimento inicial", brlCents(state.valor)]);
          table(
            [
              { label: "Informação", w: 50 },
              { label: "Valor", w: 50, align: "right" },
            ],
            premRows,
            {},
          );

          // ===================== OBJETIVOS =====================
          newPage();
          title("Objetivos");
          intro(
            "Os objetivos refletem o que é mais importante para o cliente e serão acompanhados ao longo do tempo para garantir que o plano esteja no caminho certo.",
          );
          tlabel("Tabela 1: Objetivos");
          table(
            [
              { label: "Descrição", w: 26 },
              { label: "Categoria", w: 22 },
              { label: "Idade atingimento", w: 18 },
              { label: "Frequência", w: 16 },
              { label: "Ocorrências", w: 14 },
              { label: "Valor", w: 24, align: "right" },
            ],
            [
              [
                "Aposentadoria",
                "Aposentadoria",
                String(lc.iA),
                "Mensal",
                String(lc.N * 12),
                brlCents(lc.resgateMensal) + "/mês",
              ],
            ],
            {},
          );

          // ===================== RENDAS E DESPESAS =====================
          newPage();
          title("Rendas e Despesas");
          intro(
            "Aqui estão organizadas as fontes de renda e as despesas. Ter clareza sobre o fluxo de entradas e saídas permite decisões mais seguras e alinhadas com os objetivos.",
          );
          if (isRD) {
            cards(
              [
                {
                  title: "RENDAS",
                  color: OR,
                  rows: [
                    {
                      k: "Renda média mensal",
                      v: brlCents(state.rendaAtual),
                      big: true,
                    },
                    {
                      k: "Renda média anual",
                      v: brlCents(state.rendaAtual * 12),
                      big: true,
                    },
                  ],
                },
                {
                  title: "DESPESAS",
                  color: DARK,
                  rows: [
                    {
                      k: "Despesa média mensal",
                      v: brlCents(state.despesaMensal),
                      big: true,
                    },
                    {
                      k: "Despesa média anual",
                      v: brlCents(state.despesaMensal * 12),
                      big: true,
                    },
                  ],
                },
              ],
              { h: 104 },
            );
            intro(
              "Os valores acima são considerados constantes (em poder de compra de hoje) durante a fase de acúmulo, até a aposentadoria.",
            );
          } else {
            cards(
              [
                {
                  title: "APORTE MENSAL",
                  color: OR,
                  rows: [
                    {
                      k: "Capacidade de aporte mensal",
                      v: brlCents(lc.aporteMensalAtual),
                      big: true,
                    },
                    {
                      k: "Capacidade de aporte anual",
                      v: brlCents(lc.aporteAnualAtual),
                      big: true,
                    },
                  ],
                },
                {
                  title: "RENDA-ALVO",
                  color: DARK,
                  rows: [
                    {
                      k: "Renda desejada (aposentadoria)",
                      v: brlCents(lc.resgateMensal),
                      big: true,
                    },
                    {
                      k: "Necessidade anual na aposentadoria",
                      v: brlCents(lc.resgateAnual),
                      big: true,
                    },
                  ],
                },
              ],
              { h: 104 },
            );
            intro(
              'No modo "Valor direto", o aporte mensal informado é usado como capacidade de poupança até a aposentadoria.',
            );
          }

          // ===================== FLUXO FINANCEIRO =====================
          newPage();
          title("Fluxo Financeiro");
          intro(
            "A capacidade de aporte é o que sobra no balanço entre entradas e saídas a cada ano — essencial para formar patrimônio e atingir as metas.",
          );
          cards(
            [
              {
                title: "CAPACIDADE DE APORTE",
                color: GREEN,
                rows: [
                  {
                    k: "Aporte médio mensal",
                    v: brlCents(lc.aporteMensalAtual),
                    big: true,
                  },
                  {
                    k: "Aporte médio anual",
                    v: brlCents(lc.aporteAnualAtual),
                    big: true,
                  },
                ],
              },
            ],
            { h: 96 },
          );
          tlabel("Tabela: Fluxo Financeiro");
          (function () {
            var rows = [];
            var entAcc = isRD ? state.rendaAtual * 12 : lc.aporteAnualAtual;
            var saiAcc = isRD ? state.despesaMensal * 12 : 0;
            for (var age = lc.i0; age < lc.iF; age++) {
              var acc = age < lc.iA;
              var ent = acc ? entAcc : 0,
                sai = acc ? saiAcc : lc.resgateAnual,
                cap = ent - sai;
              var rr = [
                String(age),
                brlCents(ent),
                brlCents(sai),
                brlCents(cap),
              ];
              rr._c = [DARK, DARK, DARK, cap >= 0 ? GREEN : [210, 70, 70]];
              rows.push(rr);
            }
            table(
              [
                { label: "Idade", w: 20 },
                { label: "Entradas", w: 28, align: "right" },
                { label: "Saídas", w: 26, align: "right" },
                { label: "Capacidade de aporte", w: 30, align: "right" },
              ],
              rows,
              { rowH: 17, label: "Tabela: Fluxo Financeiro" },
            );
          })();

          // ===================== PATRIMÔNIO =====================
          newPage();
          title("Patrimônio");
          intro(
            "Retrato da composição dos ativos por categoria, em valores absolutos e em proporção, incluindo investimentos e bens imobilizados.",
          );
          (function () {
            var byCat = {};
            (state.alocacao || []).forEach(function (a) {
              byCat[a.cat] = (byCat[a.cat] || 0) + (Number(a.pct) || 0);
            });
            var inv = state.valor || 0;
            var rows = [];
            var cats = Object.keys(byCat);
            var somaPct =
              cats.reduce(function (s, k) {
                return s + byCat[k];
              }, 0) || 100;
            cats.forEach(function (k) {
              var pct = (byCat[k] / somaPct) * 100;
              rows.push([
                k,
                brlCents((pct / 100) * inv),
                pct.toFixed(1).replace(".", ",") + "%",
              ]);
            });
            var imoTot = (state.imoveis || []).reduce(function (s, i) {
              return s + (Number(i.valor) || 0) * (Number(i.quantidade) || 1);
            }, 0);
            var patr = inv + imoTot;
            tlabel("Investimentos por classe de ativo");
            table(
              [
                { label: "Categoria", w: 50 },
                { label: "Valor (R$)", w: 30, align: "right" },
                { label: "%", w: 20, align: "right" },
              ],
              rows.length ? rows : [["—", "—", "—"]],
              {},
            );
            var resumo = [
              [
                "Investimento Nacional",
                brlCents(inv),
                (patr ? (inv / patr) * 100 : 0).toFixed(1).replace(".", ",") +
                  "%",
              ],
            ];
            if (imoTot > 0)
              resumo.push([
                "Imóveis e bens",
                brlCents(imoTot),
                (patr ? (imoTot / patr) * 100 : 0)
                  .toFixed(1)
                  .replace(".", ",") + "%",
              ]);
            var totRow = ["Patrimônio total", brlCents(patr), "100%"];
            totRow._b = true;
            resumo.push(totRow);
            tlabel("Patrimônio total por origem");
            table(
              [
                { label: "Origem", w: 50 },
                { label: "Valor (R$)", w: 30, align: "right" },
                { label: "%", w: 20, align: "right" },
              ],
              resumo,
              {},
            );
            if ((state.imoveis || []).length) {
              tlabel("Tabela: Imóveis e bens mapeados");
              var ir = state.imoveis.map(function (i) {
                return [
                  (i.tipo || "Imóvel") + (i.estado ? " · " + i.estado : ""),
                  String(i.quantidade || 1),
                  brlCents(
                    (Number(i.valor) || 0) * (Number(i.quantidade) || 1),
                  ),
                ];
              });
              table(
                [
                  { label: "Identificação", w: 50 },
                  { label: "Qtd", w: 14, align: "right" },
                  { label: "Valor atual (R$)", w: 36, align: "right" },
                ],
                ir,
                {},
              );
            }
          })();

          // ===================== DIAGNÓSTICO =====================
          newPage();
          title("Diagnóstico do planejamento");
          doc.setFillColor(
            lc.statusColor[0],
            lc.statusColor[1],
            lc.statusColor[2],
          );
          doc.circle(M + 5, y - 3, 4, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.setTextColor(BLACK[0], BLACK[1], BLACK[2]);
          doc.text(lc.status, M + 16, y);
          y += 8;
          doc.setDrawColor(SEP[0], SEP[1], SEP[2]);
          doc.setLineWidth(0.8);
          doc.line(M, y, M + cw, y);
          y += 12;
          para(lc.diagMsg, {});
          cards(
            [
              {
                title: "Planejamento atual",
                color: GREEN,
                rows: [
                  {
                    k: "Patrimônio projetado aos " + lc.iA + " anos",
                    v: brlCents(lc.pAtualApos),
                    big: true,
                  },
                  {
                    k: "Capacidade de aporte mensal/anual",
                    v:
                      brlCents(lc.aporteMensalAtual) +
                      " / " +
                      brlCents(lc.aporteAnualAtual),
                  },
                ],
              },
              {
                title: "Consumo do patrimônio",
                color: GRAY,
                rows: [
                  {
                    k: "Patrimônio mínimo aos " + lc.iA + " anos",
                    v: brlCents(lc.targetConsumo),
                    big: true,
                  },
                  {
                    k: "Aporte médio mensal/anual",
                    v:
                      brlCents(lc.aporteConsumoMensal) +
                      " / " +
                      brlCents(lc.aporteConsumoAnual),
                  },
                ],
              },
              {
                title: "Preservação do patrimônio",
                color: BLACK,
                rows: [
                  {
                    k: "Patrimônio necessário aos " + lc.iA + " anos",
                    v: brlCents(lc.targetPreserv),
                    big: true,
                  },
                  {
                    k: "Aporte médio mensal/anual",
                    v:
                      brlCents(lc.aportePreservMensal) +
                      " / " +
                      brlCents(lc.aportePreservAnual),
                  },
                ],
              },
            ],
            { h: 118 },
          );
          // gráfico de projeção (3 cenários)
          (function () {
            var ch = 210;
            ensure(ch + 44);
            var cx0 = M + 44,
              cy0 = y + ch - 22,
              plotW = cw - 54,
              plotH = ch - 40;
            var maxV = 1;
            [lc.cAtual, lc.cConsumo, lc.cPreserv].forEach(function (a) {
              a.forEach(function (p) {
                if (p.val > maxV) maxV = p.val;
              });
            });
            maxV *= 1.05;
            var a0 = lc.i0,
              a1 = lc.iF;
            function X(a) {
              return cx0 + ((a - a0) / (a1 - a0)) * plotW;
            }
            function Y(v) {
              return cy0 - (v / maxV) * plotH;
            }
            doc.setFontSize(7);
            for (var g = 0; g <= 4; g++) {
              var vv = (maxV * g) / 4,
                yy = Y(vv);
              doc.setDrawColor(SEP[0], SEP[1], SEP[2]);
              doc.setLineWidth(0.5);
              doc.line(cx0, yy, cx0 + plotW, yy);
              doc.setTextColor(MUT[0], MUT[1], MUT[2]);
              doc.text(moneyK(vv), cx0 - 6, yy + 3, { align: "right" });
            }
            for (var a = a0; a <= a1; a += 10) {
              doc.setTextColor(MUT[0], MUT[1], MUT[2]);
              doc.text(String(a), X(a), cy0 + 12, { align: "center" });
            }
            function plot(arr, col, wd) {
              doc.setDrawColor(col[0], col[1], col[2]);
              doc.setLineWidth(wd);
              for (var i = 1; i < arr.length; i++) {
                doc.line(
                  X(arr[i - 1].age),
                  Y(arr[i - 1].val),
                  X(arr[i].age),
                  Y(arr[i].val),
                );
              }
            }
            plot(lc.cPreserv, BLACK, 1.1);
            plot(lc.cConsumo, GRAY, 1.1);
            plot(lc.cAtual, GREEN, 1.8);
            var pa = 0;
            lc.cAtual.forEach(function (p) {
              if (p.age === lc.iA) pa = p.val;
            });
            doc.setFillColor(20, 20, 20);
            doc.circle(X(lc.iA), Y(pa), 3, "F");
            y = cy0 + 24;
            var lx = M;
            function leg(c, t) {
              doc.setFillColor(c[0], c[1], c[2]);
              doc.rect(lx, y - 6, 10, 4, "F");
              doc.setFont("helvetica", "normal");
              doc.setFontSize(8);
              doc.setTextColor(DARK[0], DARK[1], DARK[2]);
              doc.text(t, lx + 14, y - 2);
              lx += 14 + doc.getTextWidth(t) + 18;
            }
            leg(GREEN, "Projeção atual");
            leg(GRAY, "Consumo do patrimônio");
            leg(BLACK, "Preservação do patrimônio");
            y += 16;
          })();

          // ===================== PROJEÇÃO (TABELA) =====================
          newPage();
          title("Projeção do Planejamento");
          intro(
            "Evolução do patrimônio a valor presente (poder de compra de hoje) nos três cenários, ano a ano.",
          );
          tlabel("Tabela: Projeção Financeira");
          (function () {
            var rows = [];
            for (var i = 0; i < lc.cAtual.length; i++) {
              var age = lc.cAtual[i].age;
              rows.push([
                String(age),
                brlCents(lc.cAtual[i].val),
                brlCents(lc.cConsumo[i].val),
                brlCents(lc.cPreserv[i].val),
              ]);
            }
            table(
              [
                { label: "Idade", w: 16 },
                { label: "Projeção atual", w: 28, align: "right" },
                { label: "Consumo do patrimônio", w: 28, align: "right" },
                { label: "Preservação do patrimônio", w: 28, align: "right" },
              ],
              rows,
              { rowH: 16, label: "Tabela: Projeção Financeira" },
            );
          })();

          // ===================== SUCESSÃO E PROTEÇÃO PATRIMONIAL =====================
          newPage();
          title("Proteção e Sucessão Patrimonial");
          intro(
            "Acumular patrimônio sem proteger deixa o plano vulnerável a imprevistos (morte, invalidez, processos, sucessão). As estruturas abaixo garantem que o objetivo do cliente e da família se mantenha mesmo diante do inesperado e que a transferência de bens seja eficiente.",
          );
          function subsec(t) {
            ensure(22);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.setTextColor(OR[0], OR[1], OR[2]);
            doc.text(t, M, y);
            y += 15;
          }
          subsec("Whole Life — Seguro de Vida Vitalício");
          para(
            "A linha mais completa de proteção. O Whole Life garante cobertura por toda a vida (não expira), constrói valor em dinheiro ao longo do tempo e cria liquidez imediata e isenta para os beneficiários no momento da sucessão. É ideal para cobrir o imposto de transmissão (ITCMD) e custos de inventário sem que a família precise vender bens às pressas, além de funcionar como reserva de valor de longo prazo em moeda forte.",
            {},
          );
          subsec("Holding Patrimonial");
          para(
            "A holding familiar organiza os bens (imóveis, participações e investimentos) em uma estrutura societária, simplificando e barateando a sucessão: a transferência ocorre via doação de cotas com reserva de usufruto, evitando inventário, reduzindo custos e prevenindo conflitos entre herdeiros. Também traz eficiência tributária na gestão de aluguéis e na venda de ativos, além de proteção patrimonial contra riscos da atividade profissional.",
            {},
          );
          subsec("Previdência Privada (PGBL / VGBL)");
          para(
            "A previdência é um dos veículos mais eficientes para o planejamento sucessório: os recursos não entram em inventário e são pagos diretamente aos beneficiários indicados, com rapidez. O PGBL permite deduzir até 12% da renda bruta tributável (para quem declara no completo), enquanto o VGBL é indicado para quem usa o modelo simplificado ou já atingiu o limite. Em ambos, a tabela regressiva pode levar a alíquota de IR a 10% no longo prazo.",
            {},
          );
          var temProt = (state.protecao || []).filter(function (p) {
            return p.on;
          });
          y += 2;
          if (temProt.length) {
            para(
              "Hoje o cliente já possui: " +
                temProt
                  .map(function (p) {
                    return p.name;
                  })
                  .join(", ") +
                ".",
              { color: GREEN, bold: true },
            );
          } else {
            para(
              "Atenção: o cliente ainda NÃO possui estruturas de proteção e sucessão — uma oportunidade clara de proteger a família e fortalecer a relação com o assessor.",
              { color: [210, 90, 30], bold: true },
            );
          }

          // ===================== TERMOS E ENCERRAMENTO =====================
          newPage();
          title("Termos e Conceitos");
          function termo(t, d) {
            ensure(34);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9.5);
            doc.setTextColor(BLACK[0], BLACK[1], BLACK[2]);
            doc.text(t, M, y);
            y += 12;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.6);
            doc.setTextColor(MUT[0], MUT[1], MUT[2]);
            var ls = doc.splitTextToSize(d, cw);
            for (var i = 0; i < ls.length; i++) {
              ensure(12);
              doc.text(ls[i], M, y);
              y += 12;
            }
            y += 8;
          }
          termo(
            "Projeção a valor presente",
            "Os valores são projetados pela rentabilidade real (retorno descontado da inflação/IPCA), indicando o poder de compra de hoje.",
          );
          termo(
            "Planejamento atual",
            "Projeção da carteira com as premissas capturadas, incluindo os aportes e os resgates dos objetivos.",
          );
          termo(
            "Consumo total do patrimônio",
            "Cenário em que o patrimônio principal também é consumido para atingir o objetivo, exigindo o aporte mínimo durante o acúmulo.",
          );
          termo(
            "Preservação do patrimônio",
            "Cenário em que o resgate na aposentadoria considera apenas os juros, mantendo o principal até a expectativa de vida.",
          );
          termo(
            "Capacidade de aporte",
            "Saldo entre rendas e despesas — é com ela que o cliente forma patrimônio e atinge as metas.",
          );
          y += 6;
          doc.setDrawColor(SEP[0], SEP[1], SEP[2]);
          doc.setLineWidth(0.8);
          doc.line(M, y, M + cw, y);
          y += 12;
          para(
            "Material de apoio comercial elaborado no app do assessor. Valores e projeções ilustrativos a valor presente (estimativa bruta, sem IR/IOF), baseados em premissas editáveis. Rentabilidade passada não garante resultados futuros. Não constitui recomendação ou oferta. Rico — Grupo XP.",
            { size: 7.6, color: MUT, lh: 10.5 },
          );

          var slug = state.nomeCliente
            ? "-" +
              state.nomeCliente
                .toLowerCase()
                .normalize("NFD")
                .replace(/[̀-ͯ]/g, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "")
            : "";
          doc.save("planejamento-financeiro-rico" + slug + ".pdf");
          showToast("✓ Plano detalhado (PDF) gerado!");
        });

      // ============ INICIALIZAÇÃO ============
      popularSelectEstados();
      popularInstituicoes();
      const restaurado = carregarEstado();
      sincronizarInputs();
      marcarTemplateAtivo();
      renderProtecao();
      renderAlocacao();
      renderImoveis();
      renderExternos();
      renderObjetivos();
      drawChart();

      /* ===== Carteira (opcional): recolher/expandir + persistencia (hubFpCarteiraMin) ===== */
      (function () {
        var LS_FP_CART_MIN = "hubFpCarteiraMin";
        var wrap = document.getElementById("carteiraCollapse");
        var btn = document.getElementById("carteiraToggle");
        var head = document.getElementById("carteiraHead");
        if (!wrap || !btn) return;
        function apply(min) {
          wrap.classList.toggle("collapsed", !!min);
          btn.setAttribute("aria-expanded", min ? "false" : "true");
          var lbl = btn.querySelector(".ct-label");
          if (lbl) lbl.textContent = min ? "Expandir carteira" : "Recolher";
        }
        var min = false;
        try {
          min = window.hubStorage.getItem(LS_FP_CART_MIN) === "1";
        } catch (_) {}
        apply(min);
        function toggle() {
          min = !min;
          try {
            window.hubStorage.setItem(LS_FP_CART_MIN, min ? "1" : "0");
          } catch (_) {}
          apply(min);
          if (!min) {
            try {
              if (typeof renderAlocacao === "function") renderAlocacao();
            } catch (_) {}
          }
        }
        btn.addEventListener("click", function (e) {
          e.stopPropagation();
          toggle();
        });
        if (head)
          head.addEventListener("click", function (e) {
            if (e.target.closest("#carteiraToggle")) return;
            toggle();
          });
      })();

      if (restaurado) {
        const txt = document.getElementById("autosaveText");
        if (txt)
          txt.textContent =
            "Última simulação restaurada · salva automaticamente";
      }
    })();
  };
})();
