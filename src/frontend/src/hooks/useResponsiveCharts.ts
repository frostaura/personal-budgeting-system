import { useTheme, useMediaQuery } from '@mui/material';

/**
 * Hook to provide responsive chart styling for mobile optimization
 * Returns different font sizes and styling options based on screen size
 */
export const useResponsiveCharts = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Below 900px
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm')); // Below 600px

  return {
    isMobile,
    isSmallMobile,
    // Font sizes for chart text elements
    axisLabelFontSize: isMobile ? (isSmallMobile ? 10 : 11) : 12,
    axisTickFontSize: isMobile ? (isSmallMobile ? 9 : 10) : 11,
    tooltipFontSize: isMobile ? (isSmallMobile ? 11 : 12) : 13,
    legendFontSize: isMobile ? (isSmallMobile ? 10 : 11) : 12,
    
    // Chart-specific responsive styles
    getAxisLabelStyle: () => ({
      fontSize: isMobile ? (isSmallMobile ? 10 : 11) : 12,
      fontFamily: theme.typography.fontFamily,
    }),
    
    getTickStyle: () => ({
      fontSize: isMobile ? (isSmallMobile ? 9 : 10) : 11,
      fontFamily: theme.typography.fontFamily,
    }),
    
    getTooltipStyle: () => ({
      fontSize: isMobile ? (isSmallMobile ? 11 : 12) : 13,
      fontFamily: theme.typography.fontFamily,
    }),
  };
};