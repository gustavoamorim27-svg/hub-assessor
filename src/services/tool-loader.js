import { storage } from "../core/storage.js";
import { toast, showImage } from "../ui/feedback.js";
import { lastWeekdayOfNextMonth } from "../core/finance.js";
import { assetResearchLink, updateResearchLink } from "./xp-research.js";

// This is the only compatibility boundary. New features use ES modules.
const pending = new Map();
const mounted = new Set();
const initialized = new Set();
const root = () => document.getElementById("tool-workspace");
window.hubStorage = storage;
window.__xpAssetLink = assetResearchLink;
window.__xpUpdateLink = updateResearchLink;
window._toolInit ??= {};
window.RICO_BRIDGE ??= {};
window.hubFinance = { lastWeekdayOfNextMonth };
window.showToast = toast;
window.mostrarPngModal = (url, name) =>
  showImage(url, name || "Estudo-Hub.png");
window.__hubClassLabel = (value) =>
  value === "Multimercados" ? "Multimercados" : value;
window.showPanel = (id) => {
  location.hash = "/" + id;
};
// No Firebase client is initialized: all mutations stay in the v2 namespace.

function once(key, action) {
  if (!pending.has(key))
    pending.set(
      key,
      Promise.resolve()
        .then(action)
        .catch((error) => {
          pending.delete(key);
          throw error;
        }),
    );
  return pending.get(key);
}
function script(path) {
  return once(
    path,
    () =>
      new Promise((resolve, reject) => {
        const el = document.createElement("script");
        const timer = setTimeout(() => {
          el.remove();
          reject(new Error(`Tempo esgotado: ${path}`));
        }, 20000);
        el.src = new URL(path, document.baseURI).href;
        el.onload = () => {
          clearTimeout(timer);
          resolve();
        };
        el.onerror = () => {
          clearTimeout(timer);
          el.remove();
          reject(new Error(`Falha ao carregar ${path}`));
        };
        document.head.append(el);
      }),
  );
}
function stylesheet(path) {
  return once(
    path,
    () =>
      new Promise((resolve, reject) => {
        const el = document.createElement("link");
        el.rel = "stylesheet";
        el.href = path;
        el.onload = resolve;
        el.onerror = () => {
          el.remove();
          reject(new Error(`Falha no tema ${path}`));
        };
        document.head.append(el);
      }),
  );
}
async function view(id, file = "view") {
  const key = `${id}/${file}`;
  if (mounted.has(key)) return;
  const response = await fetch(`./src/features/${id}/${file}.html`);
  if (!response.ok) throw new Error(`Ferramenta indisponível: ${id}`);
  const template = document.createElement("template");
  template.innerHTML = await response.text();
  template.content.querySelectorAll(".g-panel").forEach((panel) => {
    panel.hidden = true;
  });
  root().append(template.content);
  mounted.add(key);
}
async function featureScripts(id, names) {
  for (const name of names) await script(`./src/features/${id}/${name}.js`);
}
function init(id) {
  if (initialized.has(id)) return;
  const fn = window._toolInit[id];
  if (typeof fn !== "function") throw new Error(`Inicializador ausente: ${id}`);
  fn();
  initialized.add(id);
}
export async function common() {
  await stylesheet("./src/compat/tools.css");
  await stylesheet("./src/styles/workbench.css");
  await script("./src/compat/brand.js");
  await script("./src/compat/png-theme.js");
}
const chart = () => script("./vendor/chart-4.4.1.min.js");
const spreadsheets = () => script("./vendor/xlsx-0.18.5.min.js");
const exports = () =>
  Promise.all([
    script("./vendor/jspdf-2.5.1.min.js"),
    script("./vendor/html2canvas-1.4.1.min.js"),
  ]);

export function loadTool(id) {
  return once(`tool:${id}`, async () => {
    await common();
    if (id === "rv") {
      await loadTool("construtor");
      await featureScripts("rv", ["engine"]);
      return;
    }
    if (id === "simulador" || id === "ajustes") {
      await loadTool("construtor");
      init("construtor");
    }
    if (id === "construtor") {
      await Promise.all([
        loadTool("aderencia"),
        chart(),
        spreadsheets(),
        exports(),
      ]);
      init("aderencia");
      await view(id);
      await view(id, "proposal");
      await featureScripts(id, [
        "profile-import",
        "asset-library",
        "drawer",
        "structures",
        "mode",
        "drawer-preference",
        "engine",
        "proposal",
      ]);
      await script("./src/compat/projection.js");
      return;
    }
    await view(id);
    if (
      ["comparador", "simulador", "holding", "holdingcalc", "ajustes"].includes(
        id,
      )
    )
      await chart();
    if (["aderencia", "irpf", "ajustes"].includes(id)) await spreadsheets();
    if (id !== "apresentacao") await exports();
    const extras = {
      comparador: ["quick-comparison", "tax-equivalence", "tabs"],
      simulador: ["card-order"],
    };
    await featureScripts(id, ["engine", ...(extras[id] || [])]);
  });
}
export function activateTool(id) {
  const panelId = id === "rv" ? "construtor" : id;
  root()
    .querySelectorAll(".g-panel")
    .forEach((panel) => {
      const active = panel.id === `p-${panelId}`;
      panel.hidden = !active;
      panel.classList.toggle("on", active);
    });
  // Close any drawers left open in a previous tool.
  ["libDrawer", "libBackdrop", "opcat", "catBackdrop"].forEach((key) =>
    document.getElementById(key)?.classList.remove("open"),
  );
  init(panelId);
  if (id === "construtor" || id === "rv")
    window.__setCtorMode?.(id === "rv" ? "rv" : "full");
  if (id === "ajustes" && initialized.has(id)) window._toolInit[id]();
  root().dataset.activeTool = id;
}
