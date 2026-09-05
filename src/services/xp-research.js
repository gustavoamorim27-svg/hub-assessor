import { xpResearch } from "../data/xp-links.js";
import { escapeHTML } from "../core/format.js";

export function researchFor(item) {
  const text = String(
    item.ticker ||
      [item.nome, item.ativo, item.detalhe].filter(Boolean).join(" "),
  ).toUpperCase();
  const tickers = text.match(/\b[A-Z]{4}\d{1,2}\b/g) || [];
  const ticker = tickers.find((t) => xpResearch.links[t]);
  return ticker
    ? {
        url: xpResearch.links[ticker],
        label: "Análise XP ↗",
        title: `Análise de ${ticker} na XP`,
      }
    : {
        url: xpResearch.fallback,
        label: "Raio-XP ↗",
        title: `Raio-XP · ${xpResearch.period.split("-").reverse().join("/")} · visão geral do mercado`,
      };
}
export function assetResearchLink(item) {
  const r = researchFor(item);
  return `<a class="xp-research-link" href="${escapeHTML(r.url)}" target="_blank" rel="noopener noreferrer" title="${escapeHTML(r.title)}" aria-label="${escapeHTML(r.title)}">${r.label}</a>`;
}
export function updateResearchLink(container, item) {
  const link = container?.querySelector(".xp-research-link");
  if (!link) return;
  const r = researchFor(item);
  link.href = r.url;
  link.textContent = r.label;
  link.title = r.title;
  link.setAttribute("aria-label", r.title);
}
