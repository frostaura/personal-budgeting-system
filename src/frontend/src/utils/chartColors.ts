/**
 * Modern color palette for charts and visualizations
 * Designed for accessibility and visual appeal
 */

// Modern gradient-based color palette
export const chartColors = {
  // Primary chart colors with gradients
  primary: {
    main: '#6366f1', // Modern indigo
    light: '#818cf8',
    dark: '#4f46e5',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  },
  
  // Success/growth colors
  success: {
    main: '#10b981', // Modern emerald
    light: '#34d399',
    dark: '#059669',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  },
  
  // Warning colors
  warning: {
    main: '#f59e0b', // Modern amber
    light: '#fbbf24',
    dark: '#d97706',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  },
  
  // Error colors
  error: {
    main: '#ef4444', // Modern red
    light: '#f87171',
    dark: '#dc2626',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  },
  
  // Info colors
  info: {
    main: '#3b82f6', // Modern blue
    light: '#60a5fa',
    dark: '#2563eb',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  },
  
  // Purple variant
  purple: {
    main: '#8b5cf6', // Modern violet
    light: '#a78bfa',
    dark: '#7c3aed',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  },
  
  // Teal variant
  teal: {
    main: '#14b8a6', // Modern teal
    light: '#2dd4bf',
    dark: '#0f766e',
    gradient: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
  },
  
  // Pink variant
  pink: {
    main: '#ec4899', // Modern pink
    light: '#f472b6',
    dark: '#db2777',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
  },
};

// Pie chart color palette - vibrant and modern
export const pieChartColors = [
  chartColors.primary.main,   // Indigo for expenses
  chartColors.warning.main,   // Amber for tax
  chartColors.error.main,     // Red for interest payments
  chartColors.success.main,   // Emerald for investments
  chartColors.purple.main,    // Violet for additional categories
  chartColors.teal.main,      // Teal for other categories
  chartColors.pink.main,      // Pink for miscellaneous
  chartColors.info.main,      // Blue for backup
];

// Financial allocation specific colors
export const financialAllocationColors = {
  expenses: chartColors.primary.main,        // Modern indigo
  tax: chartColors.warning.main,             // Modern amber
  interestPayments: chartColors.error.main,  // Modern red
  investments: chartColors.success.main,     // Modern emerald
};

// Chart styling enhancements
export const chartStyleEnhancements = {
  // Line chart enhancements
  lineChart: {
    strokeWidth: 3,
    strokeDasharray: '0',
    dot: {
      fill: chartColors.primary.main,
      strokeWidth: 2,
      r: 4,
    },
    activeDot: {
      r: 6,
      fill: chartColors.primary.main,
      stroke: '#ffffff',
      strokeWidth: 2,
    },
  },
  
  // Grid styling
  grid: {
    strokeDasharray: '3 3',
    stroke: '#e5e7eb',
    strokeOpacity: 0.8,
  },
  
  // Tooltip styling
  tooltip: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    color: '#374151',
    fontFamily: 'inherit',
  },
  
  // Pie chart enhancements
  pieChart: {
    paddingAngle: 4,
    innerRadius: 45,
    outerRadius: 85,
    stroke: '#ffffff',
    strokeWidth: 2,
  },
};

// Utility function to get color for financial allocation items
export const getFinancialAllocationColor = (itemName: string): string => {
  const lowerName = itemName.toLowerCase();
  
  if (lowerName.includes('expense')) return financialAllocationColors.expenses;
  if (lowerName.includes('tax')) return financialAllocationColors.tax;
  if (lowerName.includes('interest')) return financialAllocationColors.interestPayments;
  if (lowerName.includes('investment')) return financialAllocationColors.investments;
  
  // Fallback to primary color
  return chartColors.primary.main;
};

// Generate accessible color palette for multiple data series
export const generateColorPalette = (count: number): string[] => {
  const colors = [
    chartColors.primary.main,
    chartColors.success.main,
    chartColors.warning.main,
    chartColors.error.main,
    chartColors.purple.main,
    chartColors.teal.main,
    chartColors.pink.main,
    chartColors.info.main,
  ];
  
  // If we need more colors than available, cycle through them
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    const color = colors[i % colors.length];
    if (color) {
      result.push(color);
    }
  }
  
  return result;
};