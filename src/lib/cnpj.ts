/**
 * Formata uma string de CNPJ removendo caracteres não numéricos e aplicando máscara
 * Padrão: XX.XXX.XXX/XXXX-XX (14 dígitos)
 */
export function formatCNPJ(value: string): string {
  // Remove tudo que não é número
  const numericOnly = value.replace(/\D/g, "");

  // Limita a 14 dígitos
  const limited = numericOnly.slice(0, 14);

  // Aplica a máscara XX.XXX.XXX/XXXX-XX
  if (limited.length === 0) return "";
  if (limited.length <= 2) return limited;
  if (limited.length <= 5) return `${limited.slice(0, 2)}.${limited.slice(2)}`;
  if (limited.length <= 8) return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5)}`;
  if (limited.length <= 12) return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8)}`;
  return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8, 12)}-${limited.slice(12)}`;
}

/**
 * Valida se o CNPJ tem exatamente 14 dígitos numéricos
 */
export function isValidCNPJ(value: string): boolean {
  const numericOnly = value.replace(/\D/g, "");
  return numericOnly.length === 14;
}

/**
 * Remove máscara e retorna apenas os dígitos
 */
export function extractCNPJDigits(value: string): string {
  return value.replace(/\D/g, "");
}
