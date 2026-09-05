import { tools, toolById, searchTools } from "./core/catalog.js";
import { icon } from "./ui/icons.js";
import { mountHome } from "./ui/home.js";
import {
  storage,
  rememberTool,
  backup,
  validateBackup,
} from "./core/storage.js";
import { toast } from "./ui/feedback.js";
import { mountAmbient } from "./ui/ambient.js";
import { registerComparisonTool } from "./services/webmcp.js";

const app = document.getElementById("app");
const link = (t) =>
  `<a class="studio-nav-link" data-route="${t.id}" href="#/${t.id}">${icon(t.icon)}<span>${t.short}</span></a>`;
app.innerHTML = `<aside class="studio-sidebar"><a class="studio-brand" href="#/home" aria-label="Hub do Assessor, início"><span class="brand-symbol">rico.</span><span class="brand-divider"></span><span class="brand-caption">HUB DO<br>ASSESSOR</span></a><nav class="studio-navigation" aria-label="Ferramentas">${link({ id: "home", short: "Visão geral", icon: "grid" })}${[
  "Assessoria",
  "Patrimônio",
  "Materiais",
]
  .map(
    (group) =>
      `<div class="nav-group">${group}</div>${tools
        .filter((t) => t.group === group)
        .map(link)
        .join("")}`,
  )
  .join(
    "",
  )}</nav><div class="sidebar-bottom"><button id="settings-open" class="search-trigger" style="padding:0">${icon("settings")} Preferências e dados</button><div class="sidebar-version"><span>Estúdio do assessor</span><span class="version-pill">V2</span></div></div></aside><button class="mobile-scrim" aria-label="Fechar menu"></button><div class="studio-wrap"><header class="studio-topbar"><button class="studio-icon-btn mobile-toggle" aria-label="Abrir menu" aria-expanded="false">${icon("menu")}</button><div class="breadcrumb"><span>Hub do Assessor</span>${icon("chevron")}<span id="breadcrumb-current">Visão geral</span></div><div class="top-actions"><span class="storage-dot" id="storage-status">Dados neste navegador</span><button class="search-trigger" id="search-open" aria-label="Buscar ferramenta">${icon("search")}<span>Buscar ferramenta</span><kbd>⌘ K</kbd></button><div class="studio-avatar" aria-label="Espaço do assessor">AS</div></div></header><main class="studio-content" id="studio-main" tabindex="-1"><div id="studio-home"></div><div id="studio-route" hidden><div id="route-title"></div><div id="route-status" role="status"></div><div id="tool-workspace"></div></div><footer class="studio-footer"><span>Ferramentas para dar clareza às decisões.</span><a href="https://gustavoamorim27-svg.github.io/hub-assessor/" target="_blank" rel="noopener noreferrer">Acessar versão original ↗</a></footer></main></div>`;

let routeSequence = 0;
function closeNav() {
  document.body.classList.remove("nav-open");
  document
    .querySelector(".mobile-toggle")
    .setAttribute("aria-expanded", "false");
}
document.querySelector(".mobile-toggle").onclick = (e) => {
  const expanded = document.body.classList.toggle("nav-open");
  e.currentTarget.setAttribute("aria-expanded", String(expanded));
};
document.querySelector(".mobile-scrim").onclick = closeNav;
const getRoute = () => {
  const id = location.hash.replace(/^#\/?/, "").split("?")[0];
  return id === "home" || !id ? "home" : toolById[id] ? id : null;
};
export async function navigate() {
  const sequence = ++routeSequence,
    id = getRoute();
  closeNav();
  if (!id) {
    location.replace("#/home");
    return;
  }
  document.querySelectorAll("[data-route]").forEach((a) => {
    a.classList.toggle("active", a.dataset.route === id);
    if (a.dataset.route === id) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  document.getElementById("breadcrumb-current").textContent =
    id === "home" ? "Visão geral" : toolById[id].short;
  document.title = `${id === "home" ? "Visão geral" : toolById[id].title} · Hub do Assessor`;
  document.getElementById("studio-home").hidden = id !== "home";
  document.getElementById("studio-route").hidden = id === "home";
  if (id === "home") {
    mountHome(document.getElementById("studio-home"));
    window.scrollTo(0, 0);
    return;
  }
  const tool = toolById[id];
  document.getElementById("route-title").innerHTML =
    `<header class="route-heading"><div><span class="studio-kicker">${tool.eyebrow}</span><h1>${tool.title}</h1><p>${tool.description}</p></div><a class="studio-btn subtle" href="#/home">${icon("back")} Visão geral</a></header>`;
  const status = document.getElementById("route-status");
  status.innerHTML = `<div class="route-loader">Preparando ${tool.short.toLowerCase()}<div class="loading-line"></div></div>`;
  document.getElementById("tool-workspace").hidden = true;
  try {
    const { loadTool, activateTool } = await import(
      "./services/tool-loader.js"
    );
    await loadTool(id);
    if (sequence !== routeSequence) return;
    document.getElementById("tool-workspace").hidden = false;
    activateTool(id);
    status.replaceChildren();
    rememberTool(id);
    window.scrollTo(0, 0);
  } catch (error) {
    console.error("Tool load failed:", id, error);
    if (sequence !== routeSequence) return;
    status.innerHTML =
      '<div class="route-loader"><p>Não foi possível abrir esta ferramenta.</p><button class="studio-btn" id="retry-tool">Tentar novamente</button></div>';
    document.getElementById("retry-tool").onclick = () => location.reload();
  }
}
window.addEventListener("hashchange", navigate);
document.getElementById("search-open").onclick = openSearch;
document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    openSearch();
  }
  if (e.key === "Escape") closeNav();
});
function openSearch() {
  if (document.getElementById("tool-search")) return;
  const dialog = document.createElement("dialog");
  dialog.id = "tool-search";
  dialog.className = "studio-modal";
  dialog.innerHTML = `<div class="modal-heading"><h2>Qual é o próximo passo?</h2><button class="studio-icon-btn" aria-label="Fechar busca">×</button></div><input class="search-input" placeholder="Busque por carteira, LCA, sucessão…" aria-label="Buscar ferramenta"><div class="search-results"></div>`;
  document.body.append(dialog);
  let selected = 0,
    matches = tools;
  const render = () => {
    dialog.querySelector(".search-results").innerHTML = matches.length
      ? matches
          .map(
            (t, i) =>
              `<button class="search-result ${i === selected ? "selected" : ""}" data-index="${i}">${icon(t.icon)}<span><strong>${t.title}</strong><small>${t.group}</small></span></button>`,
          )
          .join("")
      : '<p class="studio-muted">Nenhuma ferramenta encontrada. Tente outro termo.</p>';
    dialog
      .querySelectorAll("[data-index]")
      .forEach((b) => (b.onclick = () => choose(Number(b.dataset.index))));
  };
  const choose = (index) => {
    if (!matches[index]) return;
    location.hash = "/" + matches[index].id;
    dialog.close();
  };
  dialog.querySelector(".search-input").oninput = (e) => {
    matches = searchTools(e.target.value);
    selected = 0;
    render();
  };
  dialog.addEventListener("keydown", (e) => {
    if (e.target.tagName !== "INPUT") return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      selected = Math.max(
        0,
        Math.min(
          matches.length - 1,
          selected + (e.key === "ArrowDown" ? 1 : -1),
        ),
      );
      render();
    }
    if (e.key === "Enter") {
      e.preventDefault();
      choose(selected);
    }
  });
  dialog.querySelector(".studio-icon-btn").onclick = () => dialog.close();
  dialog.onclose = () => dialog.remove();
  render();
  dialog.showModal();
  dialog.querySelector("input").focus();
}
document.getElementById("settings-open").onclick = () => {
  const dialog = document.createElement("dialog");
  dialog.className = "studio-modal";
  dialog.innerHTML = `<div class="modal-heading"><h2>Preferências e dados</h2><button class="studio-icon-btn" aria-label="Fechar preferências">×</button></div><div class="settings-block"><h3>Um espaço separado para seus estudos</h3><p>Os dados desta versão ficam neste navegador. Exporte um backup para guardar seus ajustes e continuar em outro computador.</p><button id="backup-save" class="studio-btn">${icon("download")} Exportar backup</button> <button id="backup-load" class="studio-btn subtle">Importar backup</button><input type="file" id="backup-file" accept=".json" hidden></div><div class="settings-block"><h3>Seus materiais</h3><p>Os botões Gerar PNG e PDF continuam disponíveis em cada ferramenta. O material é criado com as premissas do estudo aberto.</p></div><div class="settings-block"><h3>Versão original</h3><p>O endereço original continua disponível. A biblioteca compartilhada da versão original não é alterada por este espaço de testes.</p><a class="studio-btn subtle" href="https://gustavoamorim27-svg.github.io/hub-assessor/" target="_blank" rel="noopener noreferrer">Abrir versão original ${icon("external")}</a></div>`;
  document.body.append(dialog);
  dialog.showModal();
  dialog.querySelector(".studio-icon-btn").onclick = () => dialog.close();
  dialog.onclose = () => dialog.remove();
  dialog.querySelector("#backup-save").onclick = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(backup(), null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `hub-v2-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast("Backup exportado.");
  };
  dialog.querySelector("#backup-load").onclick = () =>
    dialog.querySelector("#backup-file").click();
  dialog.querySelector("#backup-file").onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      if (file.size > 10_000_000)
        throw new Error("O backup deve ter até 10 MB.");
      const entries = validateBackup(JSON.parse(await file.text()));
      if (
        !window.confirm(
          "Importar este backup substituirá os ajustes correspondentes nesta versão. Continuar?",
        )
      )
        return;
      entries.forEach(([k, v]) => storage.setItem(k, v));
      location.reload();
    } catch (err) {
      toast(err.message || "Arquivo de backup inválido.");
    }
  };
};
window.addEventListener("message", (e) => {
  if (
    e.origin !== location.origin ||
    e.source !== document.getElementById("apresentacaoFrame")?.contentWindow
  )
    return;
  if (e.data?.rico === "apresentar")
    document.documentElement.classList.toggle(
      "presentation-expanded",
      !!e.data.on,
    );
});
mountAmbient();
navigate();
registerComparisonTool(async () => {
  history.replaceState(null, "", "#/home");
  await navigate();
});
