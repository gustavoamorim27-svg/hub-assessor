export const tools = [
  {
    id: "construtor",
    title: "Montar a carteira",
    short: "Carteiras",
    eyebrow: "ALOCAÇÃO / ESTRATÉGIA",
    icon: "pie",
    group: "Assessoria",
    description:
      "Do perfil à alocação. Construa a proposta com o cliente e transforme a conversa em um plano.",
    tags: "alocação ativos reserva carteira templates png proposta",
    accent: "orange",
  },
  {
    id: "rv",
    title: "Renda variável",
    short: "Renda variável",
    eyebrow: "MERCADO / OPORTUNIDADES",
    icon: "trend",
    group: "Assessoria",
    description:
      "Ações, proteção e operações estruturadas. Visualize os cenários antes de decidir.",
    tags: "ações bolsa collar fence cupom quanto proteção",
    accent: "blue",
  },
  {
    id: "simulador",
    title: "Planejamento financeiro",
    short: "Planejamento",
    eyebrow: "OBJETIVOS / LONGO PRAZO",
    icon: "target",
    group: "Assessoria",
    description:
      "Conecte patrimônio, aportes e objetivos. Mostre o efeito das decisões ao longo do tempo.",
    tags: "financial planning aposentadoria metas imoveis imóveis renda aporte",
    accent: "green",
  },
  {
    id: "comparador",
    title: "Projeções e comparações",
    short: "Comparações",
    eyebrow: "RENDA FIXA / CENÁRIOS",
    icon: "compare",
    group: "Assessoria",
    description:
      "Compare taxas, prazos e retorno líquido. Dê contexto ao número que parece melhor.",
    tags: "lca cdb liquido líquido cdi gross up imposto poupança",
    accent: "violet",
  },
  {
    id: "aderencia",
    title: "Diagnóstico da carteira",
    short: "Diagnóstico",
    eyebrow: "CARTEIRA ATUAL / ADERÊNCIA",
    icon: "scan",
    group: "Assessoria",
    description:
      "Importe a posição consolidada e compare a distribuição atual com o perfil de referência.",
    tags: "xlsx planilha importar posição consolidada aderência",
    accent: "blue",
  },
  {
    id: "ajustes",
    title: "Rebalanceamento",
    short: "Rebalanceamento",
    eyebrow: "ALOCAÇÃO / PRÓXIMO MOVIMENTO",
    icon: "sliders",
    group: "Assessoria",
    description:
      "Organize o que fica, o que sai e o que entra. Torne a próxima movimentação clara.",
    tags: "ajustes proposta realocar trocar reequilibrar",
    accent: "orange",
  },
  {
    id: "irpf",
    title: "IR e DARF",
    short: "IR e DARF",
    eyebrow: "RENDA VARIÁVEL / TRIBUTAÇÃO",
    icon: "receipt",
    group: "Patrimônio",
    description:
      "Estime o imposto de ações e FIIs a partir da posição, com compensação de prejuízos.",
    tags: "irpf imposto darf ganhos prejuízo fii xlsx",
    accent: "yellow",
  },
  {
    id: "holding",
    title: "Proteção e sucessão",
    short: "Sucessão",
    eyebrow: "FAMÍLIA / CONTINUIDADE",
    icon: "shield",
    group: "Patrimônio",
    description:
      "Explore Whole Life, formação de reserva e as condições de resgate ao longo dos anos.",
    tags: "seguro whole life sucessão reserva proteção herdeiros",
    accent: "green",
  },
  {
    id: "holdingcalc",
    title: "Holding patrimonial",
    short: "Holding",
    eyebrow: "PATRIMÔNIO / ESTRUTURA",
    icon: "building",
    group: "Patrimônio",
    description:
      "Compare custos de estruturação, transmissão e aluguel em diferentes cenários.",
    tags: "holding itcmd itbi imóveis inventário aluguel sucessão",
    accent: "violet",
  },
  {
    id: "apresentacao",
    title: "Apresentação institucional",
    short: "Apresentação",
    eyebrow: "RELACIONAMENTO / CONVERSA",
    icon: "present",
    group: "Materiais",
    description:
      "Abra a conversa com uma visão sobre diversificação, ciclos e o papel da assessoria.",
    tags: "viva infinitamente deck institucional slides",
    accent: "orange",
  },
];
export const toolById = Object.fromEntries(
  tools.map((tool) => [tool.id, tool]),
);
export const normalize = (text) =>
  String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
export function searchTools(query) {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  return tools.filter((t) =>
    words.every((word) =>
      normalize(`${t.title} ${t.description} ${t.tags}`).includes(word),
    ),
  );
}
