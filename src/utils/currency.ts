/**
 * Utility functions for parsing and formatting currency values (BRL Brazilian Real)
 */

export function parseCurrencyToNumber(value?: string | number): number {
  if (value === undefined || value === null) return 0;
  if (typeof value === 'number') return isNaN(value) ? 0 : value;

  // Clean string: remove "R$", spaces, etc.
  let str = value.toString().replace(/[^\d.,]/g, '').trim();
  if (!str) return 0;

  // Case 1: "1.800,00" or "1.500,50" -> standard pt-BR with thousands dot and decimal comma
  if (str.includes(',') && str.includes('.')) {
    str = str.replace(/\./g, '').replace(',', '.');
  }
  // Case 2: Only comma "1800,50" or "1800,"
  else if (str.includes(',')) {
    str = str.replace(',', '.');
  }
  // Case 3: Multiple dots like "1.000.000"
  else if ((str.match(/\./g) || []).length > 1) {
    str = str.replace(/\./g, '');
  }
  // Case 4: Single dot with 3 digits after like "1.800" (thousands separator)
  else if (str.includes('.') && str.split('.')[1].length === 3) {
    str = str.replace('.', '');
  }

  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

export function formatBRL(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculates sum of price estimates for a list of leads
 */
export function calculateTotalBudget(leads: Array<{ priceEstimate?: string }>): number {
  return leads.reduce((sum, lead) => {
    return sum + parseCurrencyToNumber(lead.priceEstimate);
  }, 0);
}
