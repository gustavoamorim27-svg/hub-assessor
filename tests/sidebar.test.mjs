import test from "node:test";
import assert from "node:assert/strict";
import { Window } from "happy-dom";
import { mountSidebar } from "../src/ui/sidebar.js";

test("sidebar expands by pointer, click and keyboard and collapses outside", async () => {
  const window = new Window({ width: 1280 });
  const document = window.document;
  Object.assign(globalThis, { window, document });
  document.body.innerHTML =
    '<aside class="studio-sidebar"><nav><a class="studio-nav-link" href="#/home">Visão geral</a></nav><button id="settings-open">Preferências</button></aside><main id="studio-main" tabindex="-1"></main>';
  mountSidebar();
  const sidebar = document.querySelector("aside");
  const expanded = () =>
    document.documentElement.classList.contains("sidebar-expanded");
  const settle = () => new Promise((resolve) => setTimeout(resolve, 220));
  assert.equal(expanded(), false);
  sidebar.dispatchEvent(
    new window.PointerEvent("pointerenter", { pointerType: "mouse" }),
  );
  assert.equal(expanded(), true);
  sidebar.dispatchEvent(new window.PointerEvent("pointerleave"));
  await settle();
  assert.equal(expanded(), false);
  sidebar.click();
  assert.equal(expanded(), true);
  document.body.dispatchEvent(
    new window.PointerEvent("pointerdown", { bubbles: true }),
  );
  assert.equal(expanded(), false);
  document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Tab" }));
  sidebar.querySelector("a").focus();
  assert.equal(expanded(), true);
  document.dispatchEvent(
    new window.KeyboardEvent("keydown", { key: "Escape" }),
  );
  assert.equal(expanded(), false);
  assert.equal(document.activeElement.id, "studio-main");
  window.happyDOM.close();
});
