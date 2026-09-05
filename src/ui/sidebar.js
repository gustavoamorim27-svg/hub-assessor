export function mountSidebar() {
  const sidebar = document.querySelector(".studio-sidebar");
  const desktop = window.matchMedia("(min-width: 761px)");
  const root = document.documentElement;
  let hovered = false,
    keyboard = false,
    timer,
    motionTimer;
  const navigation = sidebar.querySelector("nav");
  navigation.id = "sidebar-navigation";
  const toggle = document.createElement("button");
  toggle.className = "sidebar-reveal";
  toggle.type = "button";
  toggle.innerHTML =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m9 6 6 6-6 6"/></svg>';
  toggle.setAttribute("aria-controls", navigation.id);
  sidebar.insertBefore(toggle, navigation);
  sidebar.querySelectorAll(".studio-nav-link").forEach((a) => {
    a.setAttribute("aria-label", a.textContent.trim());
    a.title = a.textContent.trim();
  });
  sidebar
    .querySelector("#settings-open")
    .setAttribute("aria-label", "Preferências e dados");
  const settings = sidebar.querySelector("#settings-open");
  settings.childNodes.forEach((node) => {
    if (node.nodeType !== 3 || !node.textContent.trim()) return;
    const label = document.createElement("span");
    label.className = "sidebar-bottom-label";
    label.textContent = node.textContent.trim();
    node.replaceWith(label);
  });
  function apply(open) {
    clearTimeout(timer);
    clearTimeout(motionTimer);
    root.classList.add("sidebar-transitioning");
    root.classList.toggle("sidebar-expanded", open && desktop.matches);
    toggle.setAttribute("aria-expanded", String(open && desktop.matches));
    toggle.setAttribute("aria-label", open ? "Recolher menu" : "Expandir menu");
    motionTimer = setTimeout(
      () => root.classList.remove("sidebar-transitioning"),
      260,
    );
  }
  function closeLater() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!hovered && !(keyboard && sidebar.contains(document.activeElement)))
        apply(false);
    }, 180);
  }
  sidebar.addEventListener("pointerenter", (e) => {
    if (desktop.matches && e.pointerType !== "touch") {
      hovered = true;
      apply(true);
    }
  });
  sidebar.addEventListener("pointerleave", () => {
    hovered = false;
    closeLater();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Tab") keyboard = true;
    if (e.key === "Escape" && desktop.matches) {
      hovered = false;
      document.getElementById("studio-main").focus();
      apply(false);
    }
  });
  document.addEventListener("pointerdown", (e) => {
    keyboard = false;
    if (!sidebar.contains(e.target)) apply(false);
  });
  sidebar.addEventListener("focusin", () => {
    if (keyboard && desktop.matches) apply(true);
  });
  sidebar.addEventListener("focusout", closeLater);
  sidebar.addEventListener(
    "click",
    (e) => {
      if (desktop.matches && !root.classList.contains("sidebar-expanded")) {
        e.preventDefault();
        e.stopImmediatePropagation();
        apply(true);
      }
    },
    true,
  );
  toggle.addEventListener("click", () =>
    apply(!root.classList.contains("sidebar-expanded")),
  );
  desktop.addEventListener("change", () => {
    hovered = false;
    apply(false);
  });
  apply(false);
}
