/**
 * Parse a Brazilian-formatted numeric string into a valid number.
 * Returns null if the value is invalid, negative, or out of range.
 */
export function parseNumericInput(
  input: string,
  { max = 1_000_000, allowZero = false }: { max?: number; allowZero?: boolean } = {}
): number | null {
  const normalized = input.replace(/\./g, "").replace(",", ".");
  const num = parseFloat(normalized);
  if (!Number.isFinite(num)) return null;
  if (num < 0) return null;
  if (!allowZero && num === 0) return null;
  if (num > max) return null;
  return num;
}
