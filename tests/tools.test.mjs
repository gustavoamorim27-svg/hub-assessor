import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { Window } from "happy-dom";
import { tools } from "../src/core/catalog.js";

// DOM-level integration, not visual/browser QA. Chart painting is deliberately stubbed.
test("every tool supports direct entry and repeat activation", async () => {
  for (const tool of tools) {
    const window = new Window({
      url: "http://localhost:4173/",
      settings: { enableJavaScriptEvaluation: true },
    });
    window.document.body.innerHTML =
      '<div id="tool-workspace"></div><div id="studio-toast"></div>';
    Object.assign(globalThis, {
      window,
      document: window.document,
      location: window.location,
    });
    const noop = () => {};
    window.Chart = class {
      static register() {}
      static getChart() {
        return null;
      }
      constructor() {
        this.data = { datasets: [] };
        this.options = {};
      }
      update() {}
      destroy() {}
      resize() {}
    };
    window.Chart.defaults = { font: {}, plugins: { legend: { labels: {} } } };
    window.HTMLCanvasElement.prototype.getContext = () =>
      new Proxy(
        {
          canvas: window.document.createElement("canvas"),
          measureText: (t) => ({ width: String(t).length * 7 }),
          createLinearGradient: () => ({ addColorStop: noop }),
          getImageData: () => ({ data: [] }),
        },
        { get: (o, k) => o[k] ?? noop, set: (o, k, v) => ((o[k] = v), true) },
      );
    window.HTMLCanvasElement.prototype.toDataURL = () =>
      "data:image/png;base64,";
    globalThis.fetch = async (url) => {
      const file = new URL(url, "http://localhost:4173/").pathname.slice(1);
      try {
        const body = await fs.readFile(file, "utf8");
        return { ok: true, text: async () => body };
      } catch {
        return { ok: false };
      }
    };
    window.document.head.append = (...nodes) =>
      nodes.forEach((el) => {
        Promise.resolve()
          .then(async () => {
            if (el.tagName === "SCRIPT" && !el.src.includes("chart-4.4.1")) {
              const file = new URL(el.src).pathname.slice(1);
              window.eval(await fs.readFile(file, "utf8"));
            }
            el.onload?.();
          })
          .catch((error) => {
            console.error(tool.id, error);
            el.onerror?.(error);
          });
      });
    try {
      const loader = await import(
        `../src/services/tool-loader.js?direct=${tool.id}`
      );
      await loader.loadTool(tool.id);
      loader.activateTool(tool.id);
      loader.activateTool(tool.id);
      const expected = tool.id === "rv" ? "construtor" : tool.id;
      const visible = [...window.document.querySelectorAll(".g-panel")].filter(
        (p) => !p.hidden,
      );
      assert.equal(visible.length, 1, tool.id);
      assert.equal(visible[0].id, `p-${expected}`);
      assert.ok(
        visible[0].querySelector("button,input,iframe"),
        `${tool.id} has controls`,
      );
      if (tool.id === "construtor")
        assert.ok(
          window.RICO_BRIDGE.carteira?.itens?.length,
          "portfolio initialized",
        );
      if (tool.id === "rv")
        assert.equal(
          window.document.getElementById("construtorRv").style.display,
          "block",
        );
      console.log(`Direct-entry integration: ${tool.id}`);
    } finally {
      await window.happyDOM.abort();
      window.happyDOM.close();
    }
  }
});
