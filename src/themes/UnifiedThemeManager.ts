/**
 * Unified Theme Configuration
 *
 * This file harmonizes CSS variables and styled-components theming
 * to provide a consistent design system across the application.
 * It replaces hardcoded CSS variables with theme-aware values.
 */

import { createTheme, Theme as MUITheme } from '@mui/material/styles';
import { themes, Theme as SVMTheme, defaultTheme } from './index';

/**
 * CSS Variable Generator
 * Generates CSS variables from theme objects for consistent styling
 */
export class CSSVariableGenerator {
  private theme: SVMTheme;

  constructor(theme: SVMTheme) {
    this.theme = theme;
  }

  /**
   * Generate CSS custom properties from theme
   * @returns CSS variables as a string
   */
  generateCSSVariables(): string {
    const { colors, effects, typography } = this.theme;

    return `
      /* === Generated Theme Variables: ${this.theme.displayName} === */

      /* Background Colors */
      --bg-primary: ${colors.background.primary};
      --bg-secondary: ${colors.background.secondary};
      --bg-tertiary: ${colors.background.tertiary};
      --bg-glass: ${colors.background.glass};
      --bg-overlay: ${colors.background.overlay};

      /* Text Colors */
      --text-primary: ${colors.text.primary};
      --text-secondary: ${colors.text.secondary};
      --text-tertiary: ${colors.text.tertiary};
      --text-accent: ${colors.text.accent};
      --text-inverse: ${colors.text.inverse};

      /* Interactive Colors */
      --interactive-primary: ${colors.interactive.primary};
      --interactive-secondary: ${colors.interactive.secondary};
      --interactive-hover: ${colors.interactive.hover};
      --interactive-active: ${colors.interactive.active};
      --interactive-disabled: ${colors.interactive.disabled};

      /* Status Colors */
      --status-success: ${colors.status.success};
      --status-warning: ${colors.status.warning};
      --status-error: ${colors.status.error};
      --status-info: ${colors.status.info};

      /* Border Colors */
      --border-primary: ${colors.border.primary};
      --border-secondary: ${colors.border.secondary};
      --border-focus: ${colors.border.focus};
      --border-glass: ${colors.border.glass};

      /* Shadows */
      --shadow-sm: ${colors.shadow.sm};
      --shadow-md: ${colors.shadow.md};
      --shadow-lg: ${colors.shadow.lg};
      --shadow-xl: ${colors.shadow.xl};
      --shadow-glass: ${colors.shadow.glass};

      /* Glass Effects */
      --glass-backdrop: ${effects.glass.backdrop};
      --glass-border: ${effects.glass.border};
      --glass-shadow: ${effects.glass.shadow};
      --glass-opacity: ${effects.glass.opacity};

      /* Border Radius */
      --radius-sm: ${effects.radius.sm};
      --radius-md: ${effects.radius.md};
      --radius-lg: ${effects.radius.lg};
      --radius-xl: ${effects.radius.xl};
      --radius-full: ${effects.radius.full};

      /* Animation */
      --animate-fast: ${effects.animation.duration.fast};
      --animate-normal: ${effects.animation.duration.normal};
      --animate-slow: ${effects.animation.duration.slow};
      --ease-default: ${effects.animation.easing.default};
      --ease-bounce: ${effects.animation.easing.bounce};
      --ease-smooth: ${effects.animation.easing.smooth};

      /* Typography */
      --font-primary: ${typography.fontFamily.primary};
      --font-mono: ${typography.fontFamily.mono};
      --font-display: ${typography.fontFamily.display};
      --font-size-xs: ${typography.fontSize.xs};
      --font-size-sm: ${typography.fontSize.sm};
      --font-size-md: ${typography.fontSize.md};
      --font-size-lg: ${typography.fontSize.lg};
      --font-size-xl: ${typography.fontSize.xl};
      --font-size-xxl: ${typography.fontSize.xxl};
      --font-weight-light: ${typography.fontWeight.light};
      --font-weight-normal: ${typography.fontWeight.normal};
      --font-weight-medium: ${typography.fontWeight.medium};
      --font-weight-semibold: ${typography.fontWeight.semibold};
      --font-weight-bold: ${typography.fontWeight.bold};
    `;
  }

  /**
   * Inject CSS variables into document head
   */
  injectCSSVariables(): void {
    const existingStyle = document.getElementById('svmseek-theme-variables');
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = 'svmseek-theme-variables';
    style.textContent = `
      :root {
        ${this.generateCSSVariables()}
      }
    `;

    document.head.appendChild(style);
  }
}

/**
 * MUI Theme Generator
 * Creates MUI themes that match SVMSeek theme objects
 */
export class MUIThemeGenerator {
  private svmTheme: SVMTheme;

  constructor(svmTheme: SVMTheme) {
    this.svmTheme = svmTheme;
  }

  /**
   * Generate MUI theme from SVMSeek theme
   * @returns MUI Theme object
   */
  generateMUITheme(): MUITheme {
    const { colors, effects, typography } = this.svmTheme;

    return createTheme({
      palette: {
        mode: this.detectColorMode(),
        primary: {
          main: colors.interactive.primary,
          dark: colors.interactive.active,
          light: colors.interactive.hover,
          contrastText: colors.text.inverse,
        },
        secondary: {
          main: colors.interactive.secondary,
          dark: colors.interactive.active,
          light: colors.interactive.hover,
          contrastText: colors.text.inverse,
        },
        background: {
          default: colors.background.primary,
          paper: colors.background.secondary,
        },
        text: {
          primary: colors.text.primary,
          secondary: colors.text.secondary,
          disabled: colors.interactive.disabled,
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
        divider: colors.border.primary,
      },
      typography: {
        fontFamily: typography.fontFamily.primary,
        h1: {
          fontFamily: typography.fontFamily.display,
          fontSize: typography.fontSize.xxl,
          fontWeight: typography.fontWeight.bold,
        },
        h2: {
          fontFamily: typography.fontFamily.display,
          fontSize: typography.fontSize.xl,
          fontWeight: typography.fontWeight.semibold,
        },
        h3: {
          fontFamily: typography.fontFamily.display,
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.semibold,
        },
        body1: {
          fontSize: typography.fontSize.md,
          fontWeight: typography.fontWeight.normal,
        },
        body2: {
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.normal,
        },
        caption: {
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.light,
        },
      },
      shape: {
        borderRadius: parseInt(effects.radius.md),
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: effects.radius.lg,
              textTransform: 'none',
              fontWeight: typography.fontWeight.medium,
              transition: `all ${effects.animation.duration.fast} ${effects.animation.easing.default}`,
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: effects.radius.xl,
              backgroundColor: colors.background.glass,
              backdropFilter: effects.glass.backdrop,
              border: effects.glass.border,
              boxShadow: colors.shadow.glass,
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                borderRadius: effects.radius.lg,
                transition: `all ${effects.animation.duration.fast} ${effects.animation.easing.default}`,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Detect if theme is light or dark mode
   */
  private detectColorMode(): 'light' | 'dark' {
    const { colors } = this.svmTheme;

    // Simple heuristic: check if background is darker than text
    const bgLuminance = this.getLuminance(colors.background.primary);
    const textLuminance = this.getLuminance(colors.text.primary);

    return bgLuminance < textLuminance ? 'dark' : 'light';
  }

  /**
   * Calculate relative luminance of a color
   * @param color - Color string (hex, rgb, etc.)
   * @returns Luminance value 0-1
   */
  private getLuminance(color: string): number {
    // Simplified luminance calculation
    // In a real implementation, you'd parse the color properly
    const rgb = this.hexToRgb(color);
    if (!rgb) return 0.5; // Default to middle if can't parse

    const [r, g, b] = rgb.map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Convert hex color to RGB array
   * @param hex - Hex color string
   * @returns RGB array or null if invalid
   */
  private hexToRgb(hex: string): [number, number, number] | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : null;
  }
}

/**
 * Unified Theme Manager
 * Coordinates CSS variables and MUI theme updates
 */
export class UnifiedThemeManager {
  private currentTheme: SVMTheme;
  private cssGenerator: CSSVariableGenerator;
  private muiGenerator: MUIThemeGenerator;
  private changeListeners: Array<(theme: SVMTheme, muiTheme: MUITheme) => void> = [];

  constructor(initialTheme: SVMTheme = defaultTheme) {
    this.currentTheme = initialTheme;
    this.cssGenerator = new CSSVariableGenerator(initialTheme);
    this.muiGenerator = new MUIThemeGenerator(initialTheme);
  }

  /**
   * Get current theme
   */
  getCurrentTheme(): SVMTheme {
    return this.currentTheme;
  }

  /**
   * Get current MUI theme
   */
  getCurrentMUITheme(): MUITheme {
    return this.muiGenerator.generateMUITheme();
  }

  /**
   * Switch to a new theme
   * @param themeNameOrTheme - Theme name or theme object
   */
  switchTheme(themeNameOrTheme: string | SVMTheme): void {
    const newTheme = typeof themeNameOrTheme === 'string'
      ? themes[themeNameOrTheme] || defaultTheme
      : themeNameOrTheme;

    this.currentTheme = newTheme;
    this.cssGenerator = new CSSVariableGenerator(newTheme);
    this.muiGenerator = new MUIThemeGenerator(newTheme);

    // Update CSS variables
    this.cssGenerator.injectCSSVariables();

    // Generate new MUI theme
    const muiTheme = this.muiGenerator.generateMUITheme();

    // Notify listeners
    this.changeListeners.forEach(listener => {
      listener(newTheme, muiTheme);
    });

    // Store preference
    localStorage.setItem('svmseek-theme', newTheme.name);
  }

  /**
   * Add theme change listener
   * @param listener - Callback for theme changes
   */
  addChangeListener(listener: (theme: SVMTheme, muiTheme: MUITheme) => void): void {
    this.changeListeners.push(listener);
  }

  /**
   * Remove theme change listener
   * @param listener - Callback to remove
   */
  removeChangeListener(listener: (theme: SVMTheme, muiTheme: MUITheme) => void): void {
    const index = this.changeListeners.indexOf(listener);
    if (index > -1) {
      this.changeListeners.splice(index, 1);
    }
  }

  /**
   * Initialize theme manager
   * Loads saved theme and applies it
   */
  initialize(): void {
    // Load saved theme preference
    const savedThemeName = localStorage.getItem('svmseek-theme');
    if (savedThemeName && themes[savedThemeName]) {
      this.switchTheme(savedThemeName);
    } else {
      // Apply default theme
      this.cssGenerator.injectCSSVariables();
    }

    // Listen for system theme changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', this.handleSystemThemeChange);
    }
  }

  /**
   * Handle system theme preference changes
   */
  private handleSystemThemeChange = (e: MediaQueryListEvent): void => {
    const savedTheme = localStorage.getItem('svmseek-theme');

    // Only auto-switch if no user preference is set
    if (!savedTheme) {
      const autoTheme = e.matches ? 'solarized' : 'eink';
      this.switchTheme(autoTheme);
    }
  };

  /**
   * Get available themes
   */
  getAvailableThemes(): Array<{ name: string; displayName: string }> {
    return Object.values(themes).map(theme => ({
      name: theme.name,
      displayName: theme.displayName
    }));
  }
}

/**
 * Create and export singleton theme manager
 */
export const themeManager = new UnifiedThemeManager();

/**
 * Hook for React components to use unified theming
 */
export const useUnifiedTheme = () => {
  const [currentTheme, setCurrentTheme] = React.useState(themeManager.getCurrentTheme());
  const [muiTheme, setMuiTheme] = React.useState(themeManager.getCurrentMUITheme());

  React.useEffect(() => {
    const handleThemeChange = (theme: SVMTheme, muiTheme: MUITheme) => {
      setCurrentTheme(theme);
      setMuiTheme(muiTheme);
    };

    themeManager.addChangeListener(handleThemeChange);

    return () => {
      themeManager.removeChangeListener(handleThemeChange);
    };
  }, []);

  return {
    theme: currentTheme,
    muiTheme,
    switchTheme: themeManager.switchTheme.bind(themeManager),
    availableThemes: themeManager.getAvailableThemes(),
  };
};

// React import for the hook
import React from 'react';
