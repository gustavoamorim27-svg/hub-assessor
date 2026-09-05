import { compareFixedIncome } from "../core/finance.js";

export function validateComparison(input) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new TypeError("Premissas inválidas");
  const limits = {
    principal: [100, 100000000],
    cdi: [0, 50],
    lca: [0, 300],
    cdb: [0, 300],
  };
  for (const [key, [min, max]] of Object.entries(limits))
    if (!Number.isFinite(input[key]) || input[key] < min || input[key] > max)
      throw new RangeError(`Valor inválido: ${key}`);
  if (![365, 730, 1095, 1825].includes(input.days))
    throw new RangeError("Prazo inválido");
  return Object.fromEntries(
    ["principal", "cdi", "lca", "cdb", "days"].map((k) => [k, input[k]]),
  );
}
export function registerComparisonTool(openHome) {
  if (!document.modelContext?.registerTool) return;
  const lifecycle = new AbortController();
  const definition = {
    name: "configure_fixed_income_comparison",
    title: "Configurar comparação LCA e CDB",
    description:
      "Abre o comparativo rápido, atualiza as premissas visíveis e salva-as somente neste navegador. Não executa investimentos nem envia dados a terceiros.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        principal: { type: "number", minimum: 100, maximum: 100000000 },
        cdi: { type: "number", minimum: 0, maximum: 50 },
        lca: { type: "number", minimum: 0, maximum: 300 },
        cdb: { type: "number", minimum: 0, maximum: 300 },
        days: { type: "integer", enum: [365, 730, 1095, 1825] },
      },
      required: ["principal", "cdi", "lca", "cdb", "days"],
    },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    async execute(input) {
      const p = validateComparison(input);
      await openHome();
      for (const [key, value] of Object.entries(p))
        document.getElementById(`quick-${key}`).value = value;
      document
        .getElementById("quick-days")
        .dispatchEvent(new Event("input", { bubbles: true }));
      return { premises: p, ...compareFixedIncome(p) };
    },
  };
  try {
    Promise.resolve(
      document.modelContext.registerTool(definition, {
        signal: lifecycle.signal,
      }),
    ).catch(console.warn);
  } catch (error) {
    console.warn("WebMCP unavailable", error);
  }
  window.addEventListener("pagehide", () => lifecycle.abort(), { once: true });
}
