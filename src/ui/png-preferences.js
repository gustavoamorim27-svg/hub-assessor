import { storage } from "../core/storage.js";
export function mountPngPreferences(dialog) {
  const block = document.createElement("section");
  block.className = "settings-block";
  block.innerHTML = `<h3>Aparência dos materiais PNG</h3><p>Escolha o tom dos próximos materiais. Viva usa um degradê inspirado no site; o PNG é uma imagem estática.</p><div class="png-theme-options" role="group" aria-label="Tema dos materiais PNG">${[
    ["escuro", "Escuro", "Azul profundo e laranja"],
    ["claro", "Claro", "Fundo claro e texto escuro"],
    ["viva", "Viva", "Laranja, roxo e azul"],
  ]
    .map(
      ([id, name, description]) =>
        `<button type="button" class="png-theme-option" data-png-theme="${id}" aria-pressed="false"><span class="png-theme-swatch ${id}" aria-hidden="true">Aa</span><strong>${name}</strong><small>${description}</small></button>`,
    )
    .join("")}</div><p id="png-theme-status" role="status"></p>`;
  dialog.querySelector(".modal-heading").after(block);
  function render() {
    const selected = storage.getItem("hubPngTema") || "escuro";
    block
      .querySelectorAll("[data-png-theme]")
      .forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.pngTheme === selected)),
      );
  }
  block.addEventListener("click", (e) => {
    const button = e.target.closest("[data-png-theme]");
    if (!button) return;
    storage.setItem("hubPngTema", button.dataset.pngTheme);
    window.__hubPngTema = button.dataset.pngTheme;
    window.__rotularPngTema?.();
    render();
    block.querySelector("#png-theme-status").textContent =
      "Tema salvo para os próximos PNGs.";
  });
  render();
}
