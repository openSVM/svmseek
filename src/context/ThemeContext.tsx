import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, Theme as MuiTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Theme, ThemeName, themes, defaultTheme } from '../themes';

interface ThemeContextType {
  currentTheme: Theme;
  themeName: ThemeName;
  setTheme: (themeName: ThemeName) => void;
  availableThemes: Record<string, Theme>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    // Get from localStorage or default to eink
    const saved = localStorage.getItem('theme-name');
    return (saved as ThemeName) || 'eink';
  });

  const currentTheme = themes[themeName] || defaultTheme;

  useEffect(() => {
    localStorage.setItem('theme-name', themeName);
    // Set theme attribute for CSS variables
    document.documentElement.setAttribute('data-theme', themeName);

    // Set CSS custom properties for the current theme
    const root = document.documentElement;
    const { colors, effects, typography } = currentTheme;

    // Background colors
    root.style.setProperty('--bg-primary', colors.background.primary);
    root.style.setProperty('--bg-secondary', colors.background.secondary);
    root.style.setProperty('--bg-tertiary', colors.background.tertiary);
    root.style.setProperty('--bg-glass', colors.background.glass);
    root.style.setProperty('--bg-overlay', colors.background.overlay);

    // Text colors
    root.style.setProperty('--text-primary', colors.text.primary);
    root.style.setProperty('--text-secondary', colors.text.secondary);
    root.style.setProperty('--text-tertiary', colors.text.tertiary);
    root.style.setProperty('--text-accent', colors.text.accent);
    root.style.setProperty('--text-inverse', colors.text.inverse);

    // Interactive colors
    root.style.setProperty('--interactive-primary', colors.interactive.primary);
    root.style.setProperty('--interactive-secondary', colors.interactive.secondary);
    root.style.setProperty('--interactive-hover', colors.interactive.hover);
    root.style.setProperty('--interactive-active', colors.interactive.active);
    root.style.setProperty('--interactive-disabled', colors.interactive.disabled);

    // Status colors
    root.style.setProperty('--status-success', colors.status.success);
    root.style.setProperty('--status-warning', colors.status.warning);
    root.style.setProperty('--status-error', colors.status.error);
    root.style.setProperty('--status-info', colors.status.info);

    // Border colors
    root.style.setProperty('--border-primary', colors.border.primary);
    root.style.setProperty('--border-secondary', colors.border.secondary);
    root.style.setProperty('--border-focus', colors.border.focus);
    root.style.setProperty('--border-glass', colors.border.glass);

    // Shadow colors
    root.style.setProperty('--shadow-sm', colors.shadow.sm);
    root.style.setProperty('--shadow-md', colors.shadow.md);
    root.style.setProperty('--shadow-lg', colors.shadow.lg);
    root.style.setProperty('--shadow-xl', colors.shadow.xl);
    root.style.setProperty('--shadow-glass', colors.shadow.glass);

    // Glass effects
    root.style.setProperty('--glass-backdrop', effects.glass.backdrop);
    root.style.setProperty('--glass-border', effects.glass.border);
    root.style.setProperty('--glass-shadow', effects.glass.shadow);
    root.style.setProperty('--glass-opacity', effects.glass.opacity.toString());

    // Border radius
    root.style.setProperty('--radius-sm', effects.radius.sm);
    root.style.setProperty('--radius-md', effects.radius.md);
    root.style.setProperty('--radius-lg', effects.radius.lg);
    root.style.setProperty('--radius-xl', effects.radius.xl);
    root.style.setProperty('--radius-full', effects.radius.full);

    // Typography
    root.style.setProperty('--font-primary', typography.fontFamily.primary);
    root.style.setProperty('--font-mono', typography.fontFamily.mono);
    root.style.setProperty('--font-display', typography.fontFamily.display);
  }, [currentTheme, themeName]);

  const setTheme = (newThemeName: ThemeName) => {
    setThemeName(newThemeName);
  };

  // Create Material-UI theme based on current theme
  const muiTheme = React.useMemo((): MuiTheme => {
    const { colors, effects, typography } = currentTheme;

    return createTheme({
      palette: {
        mode: 'light', // We handle our own theming
        primary: {
          main: colors.interactive.primary,
          contrastText: colors.text.inverse,
        },
        secondary: {
          main: colors.interactive.secondary,
          contrastText: colors.text.inverse,
        },
        background: {
          default: colors.background.primary,
          paper: colors.background.secondary,
        },
        text: {
          primary: colors.text.primary,
          secondary: colors.text.secondary,
        },
        error: {
          main: colors.status.error,
        },
        warning: {
          main: colors.status.warning,
        },
        info: {
          main: colors.status.info,
        },
        success: {
          main: colors.status.success,
        },
      },
      typography: {
        fontFamily: typography.fontFamily.primary,
        h1: {
          fontFamily: typography.fontFamily.display,
          fontWeight: typography.fontWeight.bold,
        },
        h2: {
          fontFamily: typography.fontFamily.display,
          fontWeight: typography.fontWeight.semibold,
        },
        h3: {
          fontFamily: typography.fontFamily.display,
          fontWeight: typography.fontWeight.semibold,
        },
        body1: {
          fontFamily: typography.fontFamily.primary,
          fontWeight: typography.fontWeight.normal,
        },
        body2: {
          fontFamily: typography.fontFamily.primary,
          fontWeight: typography.fontWeight.normal,
        },
      },
      shape: {
        borderRadius: parseInt(effects.radius.md),
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              fontFamily: typography.fontFamily.primary,
              backgroundColor: colors.background.primary,
              color: colors.text.primary,
              transition: effects.animation.duration.normal + ' ' + effects.animation.easing.default,
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              backgroundColor: colors.background.glass,
              backdropFilter: effects.glass.backdrop,
              border: effects.glass.border,
              borderRadius: effects.radius.lg,
              boxShadow: colors.shadow.glass,
              transition: `all ${effects.animation.duration.normal} ${effects.animation.easing.default}`,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: colors.shadow.xl,
              },
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: effects.radius.md,
              textTransform: 'none',
              fontWeight: typography.fontWeight.semibold,
              fontFamily: typography.fontFamily.primary,
              transition: `all ${effects.animation.duration.normal} ${effects.animation.easing.default}`,
              backdropFilter: effects.glass.backdrop,
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: colors.shadow.md,
                backgroundColor: colors.interactive.hover,
              },
              '&:active': {
                transform: 'translateY(0px)',
                backgroundColor: colors.interactive.active,
              },
            },
            contained: {
              backgroundColor: colors.interactive.primary,
              color: colors.text.inverse,
              boxShadow: colors.shadow.sm,
              '&:hover': {
                backgroundColor: colors.interactive.hover,
              },
            },
            outlined: {
              borderColor: colors.border.primary,
              color: colors.text.primary,
              '&:hover': {
                borderColor: colors.border.focus,
                backgroundColor: colors.background.overlay,
              },
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              backgroundColor: colors.background.glass,
              backdropFilter: effects.glass.backdrop,
              border: `1px solid ${colors.border.glass}`,
              borderRadius: effects.radius.xl,
              boxShadow: colors.shadow.glass,
              transition: `all ${effects.animation.duration.normal} ${effects.animation.easing.default}`,
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: colors.shadow.xl,
                borderColor: colors.border.focus,
              },
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                backgroundColor: colors.background.glass,
                backdropFilter: effects.glass.backdrop,
                borderRadius: effects.radius.md,
                '& fieldset': {
                  borderColor: colors.border.primary,
                },
                '&:hover fieldset': {
                  borderColor: colors.border.focus,
                },
                '&.Mui-focused fieldset': {
                  borderColor: colors.interactive.primary,
                },
              },
              '& .MuiInputLabel-root': {
                color: colors.text.secondary,
                '&.Mui-focused': {
                  color: colors.interactive.primary,
                },
              },
            },
          },
        },
      },
      // Preserve legacy customPalette for existing components
      customPalette: {
        text: {
          grey: colors.text.secondary,
        },
        border: {
          main: `1px solid ${colors.border.primary}`,
          new: `1px solid ${colors.border.focus}`,
        },
        grey: {
          additional: colors.text.primary,
          border: colors.border.primary,
          light: colors.text.tertiary,
          dark: colors.text.secondary,
          soft: colors.text.tertiary,
          background: colors.background.secondary,
        },
        dark: {
          main: colors.text.primary,
          background: colors.background.primary,
        },
        blue: {
          serum: colors.interactive.primary,
          new: colors.interactive.primary,
        },
        white: {
          main: colors.text.inverse,
          background: colors.background.primary,
        },
        red: {
          main: colors.status.error,
        },
        green: {
          main: colors.status.success,
          light: colors.status.success,
        },
        orange: {
          dark: colors.status.warning,
          light: colors.status.warning,
        },
      },
    } as any);
  }, [currentTheme]);

  const value = {
    currentTheme,
    themeName,
    setTheme,
    availableThemes: themes,
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// Legacy export for backwards compatibility
export const useThemeMode = useTheme;
