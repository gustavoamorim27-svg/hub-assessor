/** Pure functions. Percent-of-CDI uses daily compounding, 252 business days/year. */
export function incomeTax(days) {
  if (!Number.isFinite(days) || days < 0)
    throw new RangeError("Prazo inválido");
  return days <= 180 ? 0.225 : days <= 360 ? 0.2 : days <= 720 ? 0.175 : 0.15;
}
export function compoundCDI(principal, cdiAnnual, cdiPercent, days) {
  if (
    ![principal, cdiAnnual, cdiPercent, days].every(Number.isFinite) ||
    principal < 0 ||
    cdiAnnual < 0 ||
    cdiPercent < 0 ||
    days < 0
  )
    throw new RangeError("Premissas inválidas");
  const daily = Math.pow(1 + cdiAnnual / 100, 1 / 252) - 1;
  return (
    principal * Math.pow(1 + (daily * cdiPercent) / 100, (252 * days) / 365)
  );
}
export function compareFixedIncome({ principal, cdi, lca, cdb, days }) {
  const lcaGross = compoundCDI(principal, cdi, lca, days);
  const cdbGross = compoundCDI(principal, cdi, cdb, days);
  const taxRate = incomeTax(days);
  const tax = Math.max(0, cdbGross - principal) * taxRate;
  const cdbNet = cdbGross - tax;
  const lcaNet = lcaGross;
  return {
    lcaNet,
    cdbNet,
    tax,
    taxRate,
    difference: lcaNet - cdbNet,
    lcaGain: lcaNet - principal,
    cdbGain: cdbNet - principal,
  };
}
export function lastWeekdayOfNextMonth(competence) {
  const [year, month] = competence.split("-").map(Number);
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  )
    throw new RangeError("Competência inválida");
  const d = new Date(year, month + 1, 0);
  while ([0, 6].includes(d.getDay())) d.setDate(d.getDate() - 1);
  return d;
}
