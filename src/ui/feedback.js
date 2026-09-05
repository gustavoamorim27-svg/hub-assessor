import { escapeHTML } from "../core/format.js";
let timeout;
export function toast(message) {
  const el = document.getElementById("studio-toast");
  el.textContent = message;
  el.classList.add("visible");
  clearTimeout(timeout);
  timeout = setTimeout(() => el.classList.remove("visible"), 4200);
}
export function showImage(dataUrl, filename = "estudo.png", options = {}) {
  document.getElementById("studio-image")?.remove();
  const dialog = document.createElement("dialog");
  dialog.id = "studio-image";
  dialog.className = "studio-modal image-modal";
  dialog.innerHTML = `<div class="modal-heading"><div><span class="studio-kicker">MATERIAL PARA O CLIENTE</span><h2>Seu estudo está pronto.</h2></div><button class="studio-icon-btn" aria-label="Fechar">×</button></div><img alt="Prévia do estudo"/><p class="studio-muted">${escapeHTML(options.hint || "Confira os dados antes de compartilhar com o cliente.")}</p><div class="modal-actions"><button class="studio-btn copy-image">Copiar imagem</button><a class="studio-btn primary" download="${escapeHTML(filename)}">Baixar PNG</a></div>`;
  dialog.querySelector("img").src = dataUrl;
  dialog.querySelector("a").href = dataUrl;
  dialog.querySelector(".studio-icon-btn").onclick = () => dialog.close();
  dialog.addEventListener("close", () => dialog.remove());
  dialog.querySelector(".copy-image").onclick = async () => {
    try {
      const blob = await (await fetch(dataUrl)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      toast("Imagem copiada.");
    } catch {
      toast("Use Baixar PNG: a cópia não está disponível neste navegador.");
    }
  };
  document.body.append(dialog);
  dialog.showModal();
  return dialog;
}
