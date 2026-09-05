const PREFIX = "hub:v2:";
export function createStorage(storage, prefix = PREFIX) {
  const memory = new Map();
  let available = true;
  return {
    get available() {
      return available;
    },
    get length() {
      return this.keys().length;
    },
    keys() {
      try {
        return Object.keys(storage)
          .filter((k) => k.startsWith(prefix))
          .map((k) => k.slice(prefix.length));
      } catch {
        available = false;
        return [...memory.keys()];
      }
    },
    key(index) {
      return this.keys()[index] ?? null;
    },
    getItem(key) {
      if (memory.has(key)) return memory.get(key);
      try {
        return storage.getItem(prefix + key);
      } catch {
        available = false;
        return null;
      }
    },
    setItem(key, value) {
      const text = String(value);
      memory.set(key, text);
      try {
        storage.setItem(prefix + key, text);
      } catch {
        available = false;
      }
    },
    removeItem(key) {
      memory.delete(key);
      try {
        storage.removeItem(prefix + key);
      } catch {
        available = false;
      }
    },
    clear() {
      this.keys().forEach((k) => this.removeItem(k));
    },
  };
}
let underlying;
try {
  underlying = globalThis.localStorage;
} catch {
  underlying = null;
}
export const storage = createStorage(underlying);
export function readJSON(key, fallback) {
  try {
    return JSON.parse(storage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
export function writeJSON(key, data) {
  storage.setItem(key, JSON.stringify(data));
}
export function rememberTool(id) {
  const recent = readJSON("recent", []).filter((t) => t.id !== id);
  writeJSON(
    "recent",
    [{ id, at: new Date().toISOString() }, ...recent].slice(0, 4),
  );
}
export function backup() {
  return {
    format: "hub-assessor",
    version: 2,
    exportedAt: new Date().toISOString(),
    entries: Object.fromEntries(
      storage.keys().map((k) => [k, storage.getItem(k)]),
    ),
  };
}
export function validateBackup(data) {
  if (
    data?.format !== "hub-assessor" ||
    data.version !== 2 ||
    !data.entries ||
    Array.isArray(data.entries)
  )
    throw new Error("Escolha um backup da versão 2 do Hub.");
  const entries = Object.entries(data.entries);
  if (
    entries.length > 200 ||
    entries.some(
      ([k, v]) =>
        k.length > 200 ||
        ["__proto__", "constructor", "prototype"].includes(k) ||
        typeof v !== "string" ||
        v.length > 5_000_000,
    )
  )
    throw new Error("O backup contém dados inválidos.");
  return entries;
}
