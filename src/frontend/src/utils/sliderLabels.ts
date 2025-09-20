/**
 * Utility functions for creating dynamic slider labels
 */

/**
 * Generate a dynamic slider label showing years count and target date
 * @param years Number of years selected
 * @param fromDate Optional base date (defaults to current date)
 * @returns Formatted label string
 */
export const generateSliderLabel = (years: number, fromDate?: Date): string => {
  const baseDate = fromDate || new Date();
  const targetDate = new Date(baseDate);
  targetDate.setFullYear(targetDate.getFullYear() + years);
  
  const targetYear = targetDate.getFullYear();
  const yearText = years === 1 ? 'year' : 'years';
  
  return `${years} ${yearText} (until ${targetYear})`;
};

/**
 * Generate a dynamic slider label for months
 * @param months Number of months selected
 * @param fromDate Optional base date (defaults to current date)
 * @returns Formatted label string
 */
export const generateMonthsSliderLabel = (months: number, fromDate?: Date): string => {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  const baseDate = fromDate || new Date();
  const targetDate = new Date(baseDate);
  targetDate.setMonth(targetDate.getMonth() + months);
  
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.toLocaleString('default', { month: 'short' });
  
  if (years === 0) {
    const monthText = months === 1 ? 'month' : 'months';
    return `${months} ${monthText} (until ${targetMonth} ${targetYear})`;
  } else if (remainingMonths === 0) {
    const yearText = years === 1 ? 'year' : 'years';
    return `${years} ${yearText} (until ${targetYear})`;
  } else {
    const yearText = years === 1 ? 'year' : 'years';
    const monthText = remainingMonths === 1 ? 'month' : 'months';
    return `${years} ${yearText}, ${remainingMonths} ${monthText} (until ${targetMonth} ${targetYear})`;
  }
};

/**
 * Generate a percentage slider label
 * @param value Decimal value (e.g., 0.05 for 5%)
 * @param precision Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export const generatePercentageLabel = (value: number, precision: number = 1): string => {
  return `${(value * 100).toFixed(precision)}%`;
};