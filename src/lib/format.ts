/**
 * Formatting utilities for Brazilian locale
 */

/**
 * Format a number with Brazilian thousand separators
 * e.g. 1500 -> "1.500"
 */
export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format weight with unit and thousand separator
 * e.g. 1500, "kg" -> "1.500 kg"
 */
export function formatWeight(value: number, unit = "kg"): string {
  return `${formatNumber(value)} ${unit}`;
}

/**
 * Format ISO date to Brazilian format "dd/mm/aaaa às HH:mm"
 */
export function formatDateBR(iso: string, includeTime = true): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("pt-BR");
  if (!includeTime) return date;
  const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${date} às ${time}`;
}

/**
 * Format ISO date to short Brazilian format "dd/mm/aaaa"
 */
export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR");
}

/**
 * Format currency in BRL
 */
export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
