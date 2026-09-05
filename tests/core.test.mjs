import test from "node:test";
import assert from "node:assert/strict";
import {
  incomeTax,
  compoundCDI,
  compareFixedIncome,
  lastWeekdayOfNextMonth,
} from "../src/core/finance.js";
import { createStorage, validateBackup } from "../src/core/storage.js";
import { searchTools, tools } from "../src/core/catalog.js";
import { escapeHTML, safeExternalUrl } from "../src/core/format.js";
test("IR respects every calendar-day boundary", () => {
  [
    [180, 0.225],
    [181, 0.2],
    [360, 0.2],
    [361, 0.175],
    [720, 0.175],
    [721, 0.15],
  ].forEach(([d, t]) => assert.equal(incomeTax(d), t));
  assert.throws(() => incomeTax(-1));
});
test("100% CDI compounds to the annual reference", () => {
  assert.ok(Math.abs(compoundCDI(100000, 10, 100, 365) - 110000) < 0.000001);
  assert.equal(compoundCDI(100000, 0, 100, 730), 100000);
});
test("IR applies only to the CDB gain", () => {
  const r = compareFixedIncome({
    principal: 100000,
    cdi: 10,
    lca: 100,
    cdb: 100,
    days: 365,
  });
  assert.ok(Math.abs(r.tax - 1750) < 0.000001);
  assert.ok(Math.abs(r.difference - 1750) < 0.000001);
});
test("invalid numeric assumptions fail", () => {
  assert.throws(() => compoundCDI(-1, 10, 100, 365));
  assert.throws(() => compoundCDI(1, NaN, 100, 365));
});
test("DARF next-month helper handles year rollover and weekends (not holidays)", () => {
  const d = lastWeekdayOfNextMonth("2026-12");
  assert.equal(d.getFullYear(), 2027);
  assert.equal(d.getMonth(), 0);
  assert.equal(d.getDate(), 29);
});
test("storage fallback is isolated per instance", () => {
  const a = createStorage(null),
    b = createStorage(null);
  a.setItem("x", 3);
  assert.equal(a.getItem("x"), "3");
  assert.equal(b.getItem("x"), null);
  assert.deepEqual(a.keys(), ["x"]);
  a.clear();
  assert.equal(a.length, 0);
});
test("v2 never changes v1 keys", () => {
  const backend = {
    hubCustomLib: "original",
    getItem(k) {
      return this[k] ?? null;
    },
    setItem(k, v) {
      this[k] = v;
    },
    removeItem(k) {
      delete this[k];
    },
  };
  const s = createStorage(backend);
  s.setItem("hubCustomLib", "test");
  assert.equal(backend.hubCustomLib, "original");
  assert.equal(backend["hub:v2:hubCustomLib"], "test");
  s.clear();
  assert.equal(backend.hubCustomLib, "original");
});
test("backup validates strings and rejects prototype keys", () => {
  assert.deepEqual(
    validateBackup({ format: "hub-assessor", version: 2, entries: { a: "b" } }),
    [["a", "b"]],
  );
  assert.throws(() =>
    validateBackup({
      format: "hub-assessor",
      version: 2,
      entries: { constructor: "x" },
    }),
  );
  assert.throws(() => validateBackup({}));
});
test("search handles accents and complete catalog", () => {
  assert.equal(new Set(tools.map((t) => t.id)).size, tools.length);
  assert.ok(searchTools("sucessao").length);
  assert.ok(searchTools("LCA").some((t) => t.id === "comparador"));
  assert.equal(searchTools("zzzz").length, 0);
});
test("external links reject script URLs and text is escaped", () => {
  assert.equal(safeExternalUrl("javascript:alert(1)"), null);
  assert.match(escapeHTML("<script>"), /&lt;script&gt;/);
});
