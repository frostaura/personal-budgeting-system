import React from 'react';
import { ThemeProvider, createTheme, useMediaQuery } from '@mui/material';
import { useAppSelector } from '@/store/hooks';
import { theme as baseTheme, darkTheme as baseDarkTheme } from '@/theme';

interface DynamicThemeProviderProps {
  children: React.ReactNode;
}

export const DynamicThemeProvider: React.FC<DynamicThemeProviderProps> = ({ children }) => {
  const settings = useAppSelector(state => state.settings);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  // Determine if we should use dark mode
  const isDarkMode = React.useMemo(() => {
    switch (settings.theme.mode) {
      case 'dark':
        return true;
      case 'light':
        return false;
      case 'system':
      default:
        return prefersDarkMode;
    }
  }, [settings.theme.mode, prefersDarkMode]);

  // Create dynamic theme
  const dynamicTheme = React.useMemo(() => {
    const baseThemeToUse = isDarkMode ? baseDarkTheme : baseTheme;
    
    return createTheme({
      ...baseThemeToUse,
      palette: {
        ...baseThemeToUse.palette,
        primary: {
          ...baseThemeToUse.palette.primary,
          main: settings.theme.primaryColor,
        },
        success: {
          ...baseThemeToUse.palette.success,
          main: settings.theme.successColor,
        },
        warning: {
          ...baseThemeToUse.palette.warning,
          main: settings.theme.warningColor,
        },
        error: {
          ...baseThemeToUse.palette.error,
          main: settings.theme.errorColor,
        },
      },
      components: {
        ...baseThemeToUse.components,
        MuiCssBaseline: {
          styleOverrides: {
            '@media (prefers-contrast: high)': {
              '*': {
                borderColor: settings.theme.contrastMode === 'high' 
                  ? (isDarkMode ? '#ffffff !important' : '#000000 !important') 
                  : undefined,
              },
            },
            '@media (prefers-reduced-motion: reduce)': {
              '*': {
                animationDuration: settings.accessibility.reduceMotion 
                  ? '0.01ms !important' 
                  : undefined,
                animationIterationCount: settings.accessibility.reduceMotion 
                  ? '1 !important' 
                  : undefined,
                transitionDuration: settings.accessibility.reduceMotion 
                  ? '0.01ms !important' 
                  : undefined,
              },
            },
            // Apply high contrast mode if enabled
            ...(settings.theme.contrastMode === 'high' && {
              '*': {
                borderColor: isDarkMode ? '#ffffff !important' : '#000000 !important',
                outline: isDarkMode ? '1px solid #ffffff' : '1px solid #000000',
              },
            }),
            // Apply reduced motion if enabled
            ...(settings.accessibility.reduceMotion && {
              '*, *::before, *::after': {
                animationDelay: '-1ms !important',
                animationDuration: '1ms !important',
                animationIterationCount: '1 !important',
                backgroundAttachment: 'initial !important',
                scrollBehavior: 'auto !important',
                transitionDelay: '0s !important',
                transitionDuration: '0s !important',
              },
            }),
          },
        },
      },
    });
  }, [
    isDarkMode, 
    settings.theme.primaryColor, 
    settings.theme.successColor, 
    settings.theme.warningColor, 
    settings.theme.errorColor,
    settings.theme.contrastMode,
    settings.accessibility.reduceMotion,
  ]);

  return (
    <ThemeProvider theme={dynamicTheme}>
      {children}
    </ThemeProvider>
  );
};