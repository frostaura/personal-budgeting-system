import { Cents, CurrencySettings } from '@/types/money';

// Default currency settings for South Africa
export const DEFAULT_CURRENCY_SETTINGS: CurrencySettings = {
  code: 'ZAR',
  symbol: 'R',
  locale: 'en-ZA',
  roundingStepCents: 50_000, // R500
  storagePrefix: 'pfp:',
};

/**
 * Convert cents to major currency units (e.g., cents to rands)
 */
export function centsToMajor(cents: Cents): number {
  return cents / 100;
}

/**
 * Convert major currency units to cents
 */
export function majorToCents(major: number): Cents {
  return Math.round(major * 100);
}

/**
 * Format cents as currency string with proper locale formatting
 */
export function formatCurrency(
  cents: Cents,
  settings: CurrencySettings = DEFAULT_CURRENCY_SETTINGS,
  options: {
    showSymbol?: boolean;
    showCode?: boolean;
    signDisplay?: 'auto' | 'never' | 'always' | 'exceptZero';
  } = {}
): string {
  const { showSymbol = true, showCode = false, signDisplay = 'auto' } = options;

  const major = centsToMajor(cents);

  const formatter = new Intl.NumberFormat(settings.locale, {
    style: 'currency',
    currency: settings.code,
    signDisplay,
    currencyDisplay: showCode ? 'code' : showSymbol ? 'symbol' : 'code',
  });

  return formatter.format(major);
}

/**
 * Parse currency string to cents, handling various input formats
 */
export function parseCurrencyToCents(
  input: string,
  settings: CurrencySettings = DEFAULT_CURRENCY_SETTINGS
): Cents | null {
  if (!input || typeof input !== 'string') return null;

  // Remove currency symbols and non-numeric characters except decimal point and minus
  const cleaned = input
    .replace(new RegExp(`[${settings.symbol}${settings.code}\\s,]`, 'gi'), '')
    .replace(/[^\d.-]/g, '');

  const parsed = parseFloat(cleaned);

  if (isNaN(parsed)) return null;

  return majorToCents(parsed);
}

/**
 * Round cents to the specified rounding step
 */
export function roundCents(
  cents: Cents,
  roundingStepCents: number = DEFAULT_CURRENCY_SETTINGS.roundingStepCents
): Cents {
  return Math.round(cents / roundingStepCents) * roundingStepCents;
}

/**
 * Format a percentage with proper locale formatting
 */
export function formatPercentage(
  value: number,
  locale: string = DEFAULT_CURRENCY_SETTINGS.locale,
  decimals: number = 2
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(
  oldValue: Cents,
  newValue: Cents
): number {
  if (oldValue === 0) return newValue === 0 ? 0 : Infinity;
  return (newValue - oldValue) / Math.abs(oldValue);
}

/**
 * Validate that a number represents valid cents (integer)
 */
export function isValidCents(value: unknown): value is Cents {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    Number.isFinite(value)
  );
}

/**
 * Sum an array of cents values safely
 */
export function sumCents(values: Cents[]): Cents {
  return values.reduce((sum, value) => {
    if (!isValidCents(value)) {
      console.warn('Invalid cents value encountered:', value);
      return sum;
    }
    return sum + value;
  }, 0);
}

/**
 * Compare two cents values for equality with optional tolerance
 */
export function centsEqual(a: Cents, b: Cents, tolerance: Cents = 0): boolean {
  return Math.abs(a - b) <= tolerance;
}

/**
 * Format large numbers with appropriate suffixes (K, M, B)
 */
export function formatCompactCurrency(
  cents: Cents,
  settings: CurrencySettings = DEFAULT_CURRENCY_SETTINGS
): string {
  const major = centsToMajor(Math.abs(cents));
  const sign = cents < 0 ? '-' : '';

  const formatter = new Intl.NumberFormat(settings.locale, {
    notation: 'compact',
    style: 'currency',
    currency: settings.code,
    maximumFractionDigits: 1,
  });

  const formatted = formatter.format(major);
  return `${sign}${formatted.replace('-', '')}`;
}
