import { tools, toolById } from "../core/catalog.js";
import { icon } from "./icons.js";
import { readJSON, writeJSON } from "../core/storage.js";
import { money, percent, escapeHTML, safeExternalUrl } from "../core/format.js";
import { compareFixedIncome } from "../core/finance.js";
import { toast, showImage } from "./feedback.js";

export function mountHome(host) {
  const now = new Date();
  host.innerHTML = `<section class="studio-lead"><div><span class="studio-kicker">SEU ESPAÇO DE ASSESSORIA</span><h1>Uma boa conversa.<br><em>Uma carteira melhor.</em></h1><p>Planeje, compare e dê forma ao próximo movimento do cliente.</p></div><div class="studio-date">${now.toLocaleDateString("pt-BR", { weekday: "long" }).toUpperCase()}<strong>${now.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "")}</strong></div></section>
  <div class="home-top-grid"><section class="conversation-card"><div class="card-eyebrow">${icon("pie")} DA CONVERSA À PROPOSTA</div><h2>O patrimônio tem um objetivo.<br><span>Comece por ele.</span></h2><p>Defina a alocação, explore cenários e prepare um material que ajude o cliente a decidir.</p><a class="studio-btn primary" href="#/construtor">Montar uma carteira ${icon("arrow")}</a><div class="conversation-steps"><a href="#/aderencia"><b>01</b> Diagnosticar</a><a href="#/simulador"><b>02</b> Planejar</a><a href="#/apresentacao"><b>03</b> Apresentar</a></div></section>
  <section class="quick-compare" aria-labelledby="quick-title"><div class="quick-header"><h2 id="quick-title">LCA ou CDB?</h2><a href="#/comparador">Comparador completo ${icon("arrow")}</a></div><div class="quick-controls"><label class="studio-field">LCA · % do CDI<input id="quick-lca" type="number" min="0" max="300" step=".5" value="94"></label><label class="studio-field">CDB · % do CDI<input id="quick-cdb" type="number" min="0" max="300" step=".5" value="110"></label><label class="studio-field">Prazo<select id="quick-days"><option value="365">1 ano</option><option value="730">2 anos</option><option value="1095">3 anos</option><option value="1825">5 anos</option></select></label></div><div class="quick-details"><span id="quick-assumptions"></span><button type="button" id="edit-assumptions" aria-expanded="false">Ajustar</button></div><div class="quick-extra" id="quick-extra" hidden><label class="studio-field">Valor aplicado · R$<input id="quick-principal" type="number" min="100" max="100000000" step="1000" value="100000"></label><label class="studio-field">CDI hipotético · % a.a.<input id="quick-cdi" type="number" min="0" max="50" step=".25" value="10"></label></div><div class="quick-result" id="quick-result" aria-live="polite"></div><div class="compare-caption"><span>Simulação líquida para pessoa física.</span><button type="button" id="quick-export">${icon("download")} Gerar PNG</button></div></section></div>
  <section><div class="section-heading"><h2>Ferramentas para cada decisão</h2><div class="section-filters" aria-label="Filtrar ferramentas"><button class="active" data-group="Todas" aria-pressed="true">Todas</button><button data-group="Assessoria" aria-pressed="false">Assessoria</button><button data-group="Patrimônio" aria-pressed="false">Patrimônio</button><button data-group="Materiais" aria-pressed="false">Materiais</button></div></div><div class="tools-grid" id="tools-grid"></div></section>
  <div class="home-bottom-grid"><section><div class="section-heading"><h2>No radar</h2><span id="news-date">Conteúdo do Hub</span></div><div id="news-items" class="news-list"><p class="studio-muted">Carregando notícias…</p></div></section><section><div class="section-heading"><h2>Continue de onde parou</h2><span>Neste navegador</span></div><div id="recent-tools" class="recent-list"></div></section></div>`;
  const newsSection=host.querySelector('#news-items').closest('section');
  newsSection.classList.add('news-spotlight');
  newsSection.querySelector('h2').textContent='Principais notícias';
  host.querySelector('.studio-lead').after(newsSection);
  const renderCards = (group) => {
    host.querySelector("#tools-grid").innerHTML = tools
      .filter((t) => group === "Todas" || t.group === group)
      .map(
        (t) =>
          `<a class="tool-card" href="#/${t.id}" style="--accent:var(--s-${t.accent})"><div class="tool-card-top"><span class="tool-card-icon">${icon(t.icon)}</span><span class="tool-number">${String(tools.indexOf(t) + 1).padStart(2, "0")}</span></div><h3>${t.title}</h3><p>${t.description}</p><div class="tool-card-bottom"><span>${t.group}</span>${icon("arrow")}</div></a>`,
      )
      .join("");
  };
  renderCards("Todas");
  host.querySelectorAll(".quick-compare input").forEach((input) => {
    input.required = true;
    input.step = "any";
  });
  host.querySelectorAll("[data-group]").forEach((btn) =>
    btn.addEventListener("click", () => {
      host.querySelectorAll("[data-group]").forEach((b) => {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-pressed", String(b === btn));
      });
      renderCards(btn.dataset.group);
    }),
  );
  const recent = readJSON("recent", []).filter((t) => toolById[t.id]);
  host.querySelector("#recent-tools").innerHTML = recent.length
    ? recent
        .map((r) => {
          const t = toolById[r.id];
          return `<a class="recent-row" href="#/${t.id}">${icon(t.icon)}<div>${t.title}<small>${new Date(r.at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} · ${new Date(r.at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</small></div>${icon("chevron")}</a>`;
        })
        .join("")
    : `<div class="recent-empty">Suas ferramentas recentes aparecerão aqui. Comece pela carteira ou pelo diagnóstico do cliente.</div><a class="recent-row" href="#/aderencia">${icon("scan")}<div>Importar posição consolidada<small>Diagnóstico e aderência</small></div>${icon("arrow")}</a>`;
  let parameters = {
    principal: 100000,
    cdi: 10,
    lca: 94,
    cdb: 110,
    days: 365,
    ...readJSON("quick-comparison", {}),
  };
  let result;
  Object.entries(parameters).forEach(([key, value]) => {
    const input = host.querySelector(`#quick-${key}`);
    if (input) input.value = value;
  });
  const update = () => {
    const fields = ["principal", "cdi", "lca", "cdb", "days"];
    if (
      fields.some((k) => !host.querySelector(`#quick-${k}`).checkValidity())
    ) {
      host.querySelector("#quick-result").innerHTML =
        '<p class="studio-muted">Confira os valores informados para calcular.</p>';
      result = null;
      return;
    }
    parameters = Object.fromEntries(
      fields.map((k) => [k, Number(host.querySelector(`#quick-${k}`).value)]),
    );
    result = compareFixedIncome(parameters);
    writeJSON("quick-comparison", parameters);
    host.querySelector("#quick-assumptions").textContent =
      `${money(parameters.principal)} · CDI ${percent(parameters.cdi)} a.a.`;
    const best = Math.max(result.lcaGain, result.cdbGain, 1);
    const winner =
      Math.abs(result.difference) < 0.01
        ? "Resultados equivalentes"
        : `Vantagem ${result.difference > 0 ? "da LCA" : "do CDB"}`;
    host.querySelector("#quick-result").innerHTML =
      `<div class="result-top"><span>${winner}</span><strong>+ ${money(Math.abs(result.difference))}</strong></div><div class="comparison-bar-row"><span>LCA</span><div class="comparison-track"><div class="comparison-fill" style="width:${(result.lcaGain / best) * 100}%"></div></div><span>${money(result.lcaGain)}</span></div><div class="comparison-bar-row"><span>CDB</span><div class="comparison-track"><div class="comparison-fill cdb" style="width:${(result.cdbGain / best) * 100}%"></div></div><span>${money(result.cdbGain)}</span></div><small class="studio-muted" style="font-size:11px">Rendimento no prazo · IR do CDB: ${percent(result.taxRate * 100)}. Confira a liquidez de cada emissão.</small>`;
  };
  update();
  fieldsBind();
  function fieldsBind() {
    host
      .querySelectorAll(".quick-compare input,.quick-compare select")
      .forEach((el) => el.addEventListener("input", update));
  }
  host.querySelector("#edit-assumptions").onclick = (e) => {
    const el = host.querySelector("#quick-extra");
    el.hidden = !el.hidden;
    e.currentTarget.setAttribute("aria-expanded", String(!el.hidden));
  };
  host.querySelector("#quick-export").onclick = async (e) => {
    if (!result) return toast("Confira as premissas antes de exportar.");
    const btn = e.currentTarget;
    btn.disabled = true;
    try {
      const { exportComparison } = await import(
        "../services/export-comparison.js"
      );
      const png = await exportComparison(parameters, result);
      showImage(png, "Comparativo-LCA-CDB.png");
    } catch (err) {
      console.error(err);
      toast("Não foi possível gerar a imagem. Tente novamente.");
    } finally {
      btn.disabled = false;
    }
  };
  fetch("./news.json")
    .then((r) => {
      if (!r.ok) throw new Error();
      return r.json();
    })
    .then((data) => {
      if (!host.isConnected) return;
      host.querySelector("#news-date").textContent =
        `Atualização: ${data.updated?.split(" ")[0] || "não informada"}`;
      const national = data.items
          .filter((i) => i.region === "nacional")
          .slice(0, 2),
        international = data.items
          .filter((i) => i.region === "internacional")
          .slice(0, 1);
      host.querySelector("#news-items").innerHTML = [
        ...national,
        ...international,
      ]
        .filter((n) => safeExternalUrl(n.url))
        .map(
          (n) =>
            `<a class="news-item" href="${escapeHTML(safeExternalUrl(n.url))}" target="_blank" rel="noopener noreferrer"><div class="news-meta">${escapeHTML(n.source)} · ${escapeHTML(n.date)}</div><h3>${escapeHTML(n.title)}</h3><p>${escapeHTML(n.resumo||'')}</p><span class="news-read">Ler notícia ${icon("external")}</span></a>`,
        )
        .join("");
    })
    .catch(() => {
      if (host.isConnected)
        host.querySelector("#news-items").innerHTML =
          '<p class="studio-muted">Notícias indisponíveis no momento.</p>';
    });
}
