import { storage } from "../core/storage.js";
export function mountAmbient() {
  const backdrop = document.createElement("div");
  backdrop.className = "studio-atmosphere";
  backdrop.setAttribute("aria-hidden", "true");
  backdrop.innerHTML = ["orange", "blue", "pink", "amber", "teal", "cobalt"]
    .map((color) => `<i class="lava-orb lava-${color}"></i>`)
    .join("");
  document.body.prepend(backdrop);
  const symbol = document.querySelector(".brand-symbol");
  symbol.replaceChildren(
    Object.assign(document.createElement("img"), {
      src: "./src/ui/rico.svg",
      alt: "Rico",
      width: 73,
      height: 32,
    }),
  );
  const button = document.createElement("button");
  button.className = "ambient-toggle";
  const label = document.createElement("span");
  label.className = "sidebar-bottom-label";
  button.append(label);
  document.querySelector(".sidebar-bottom").append(button);
  const apply = (paused) => {
    document.documentElement.classList.toggle("motion-paused", paused);
    label.textContent = paused ? "Retomar animação" : "Pausar animação";
    button.setAttribute("aria-label", label.textContent);
    button.title = label.textContent;
    button.setAttribute("aria-pressed", String(paused));
  };
  apply(storage.getItem("motion-paused") === "true");
  button.onclick = () => {
    const paused =
      !document.documentElement.classList.contains("motion-paused");
    storage.setItem("motion-paused", paused);
    apply(paused);
  };
  document.addEventListener("visibilitychange", () =>
    document.documentElement.classList.toggle("page-hidden", document.hidden),
  );
}
