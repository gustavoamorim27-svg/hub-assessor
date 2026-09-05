import { money, percent } from "../core/format.js";

/** Native Canvas: sharp type, exact figures, no screenshot or image-generation dependency. */
export async function exportComparison(p, r) {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = 2400;
  canvas.height = 1350;
  const c = canvas.getContext("2d");
  if (!c) throw new Error("Canvas indisponível");
  const navy = "#0b1030",
    muted = "#b7bdd4",
    orange = "#ff6a22",
    white = "#fff";
  const text = (
    value,
    x,
    y,
    size = 28,
    color = white,
    weight = 500,
    family = "Manrope",
  ) => {
    c.fillStyle = color;
    c.font = `${weight} ${size}px ${family}, sans-serif`;
    c.fillText(value, x, y);
  };
  const line = (x1, y1, x2, y2, color = "#35405d") => {
    c.strokeStyle = color;
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.stroke();
  };
  const box = (x, y, w, h, color) => {
    c.fillStyle = color;
    c.beginPath();
    c.roundRect(x, y, w, h, 18);
    c.fill();
  };
  const years = p.days / 365,
    label = `${years} ${years === 1 ? "ano" : "anos"}`;
  const tied = Math.abs(r.difference) < 0.01,
    winner = r.difference > 0 ? "LCA" : "CDB";
  c.fillStyle = navy;
  c.fillRect(0, 0, 2400, 1350);
  const logo = new Image();
  logo.src = new URL("../ui/rico.svg", import.meta.url).href;
  await logo.decode();
  c.drawImage(logo, 108, 70, 138, 60);
  text(
    "ESTUDO COMPARATIVO / RENDA FIXA",
    290,
    110,
    22,
    muted,
    500,
    "JetBrains Mono",
  );
  text("LCA ou CDB?", 108, 245, 86, white, 700, "Sora");
  c.fillStyle = orange;
  c.fillRect(105, 271, 932, 75);
  text("A taxa líquida muda a conversa.", 123, 326, 47, navy, 700, "Sora");
  text(
    `${money(p.principal)} aplicados  •  ${label}  •  CDI hipotético: ${percent(p.cdi)} a.a.`,
    108,
    400,
    29,
    muted,
  );
  line(108, 440, 2292, 440);
  const cards = [
    {
      x: 108,
      title: "LCA",
      rate: p.lca,
      gain: r.lcaGain,
      balance: r.lcaNet,
      color: orange,
      tax: "Isenta de IR para pessoa física",
    },
    {
      x: 848,
      title: "CDB",
      rate: p.cdb,
      gain: r.cdbGain,
      balance: r.cdbNet,
      color: "#7199ff",
      tax: `IR de ${percent(r.taxRate * 100)} sobre o rendimento`,
    },
  ];
  for (const card of cards) {
    box(card.x, 485, 700, 365, "#141d3d");
    text(card.title, card.x + 36, 543, 26, card.color, 700, "JetBrains Mono");
    text(
      `${percent(card.rate)} do CDI`,
      card.x + 36,
      609,
      45,
      white,
      600,
      "Sora",
    );
    text(card.tax, card.x + 36, 655, 24, muted);
    line(card.x + 36, 691, card.x + 664, 691);
    text(
      "RENDIMENTO LÍQUIDO",
      card.x + 36,
      736,
      20,
      muted,
      500,
      "JetBrains Mono",
    );
    text(money(card.gain), card.x + 36, 797, 48, card.color, 600, "Sora");
    text(`Saldo final: ${money(card.balance)}`, card.x + 36, 893, 26, muted);
  }
  text("NESTE CENÁRIO", 1610, 534, 22, muted, 500, "JetBrains Mono");
  text(
    tied ? "Empate técnico." : `${winner} na frente.`,
    1610,
    604,
    45,
    white,
    600,
    "Sora",
  );
  text(
    `+ ${money(Math.abs(r.difference))}`,
    1610,
    685,
    62,
    orange,
    700,
    "Sora",
  );
  text("de diferença líquida no prazo.", 1610, 731, 25, muted);
  const max = Math.max(r.lcaGain, r.cdbGain, 1);
  text("LCA", 1610, 795, 20, muted);
  box(1680, 777, Math.max(1, (540 * r.lcaGain) / max), 16, orange);
  text("CDB", 1610, 842, 20, muted);
  box(1680, 824, Math.max(1, (540 * r.cdbGain) / max), 16, "#7199ff");
  line(108, 941, 2292, 941);
  text(
    "A MELHOR ESCOLHA DEPENDE DO OBJETIVO.",
    108,
    990,
    24,
    orange,
    600,
    "JetBrains Mono",
  );
  const contexts = [
    [
      "Precisa de flexibilidade?",
      "Um CDB com liquidez diária pode",
      "atender à necessidade de resgate.",
    ],
    [
      "Pode esperar o vencimento?",
      "Compare o ganho líquido da LCA",
      "com o do CDB no mesmo prazo.",
    ],
    [
      "Antes de escolher",
      "Confira carência, emissor, risco",
      "e condições de cobertura do FGC.",
    ],
  ];
  contexts.forEach((a, i) => {
    const x = 108 + i * 740;
    text(a[0], x, 1045, 29, white, 700);
    text(a[1], x, 1091, 26, muted);
    text(a[2], x, 1128, 26, muted);
  });
  line(108, 1178, 2292, 1178);
  text(
    "Simulação educativa, não é oferta nem recomendação. CDI constante e capitalização diária: 252 dias úteis/ano estimados.",
    108,
    1221,
    22,
    muted,
  );
  text(
    "Sem custos, resgates intermediários ou IOF (prazos a partir de 1 ano). Rentabilidade futura não é garantida.",
    108,
    1256,
    22,
    muted,
  );
  text(
    `HUB DO ASSESSOR · ${new Date().toLocaleDateString("pt-BR")}`,
    108,
    1300,
    18,
    "#8993b5",
    500,
    "JetBrains Mono",
  );
  return canvas.toDataURL("image/png");
}
