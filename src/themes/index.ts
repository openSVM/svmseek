export interface ThemeColors {
  // Background colors
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    glass: string;
    overlay: string;
  };
  
  // Text colors
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    accent: string;
    inverse: string;
  };
  
  // Interactive elements
  interactive: {
    primary: string;
    secondary: string;
    hover: string;
    active: string;
    disabled: string;
  };
  
  // Status colors
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  
  // Border and outline colors
  border: {
    primary: string;
    secondary: string;
    focus: string;
    glass: string;
  };
  
  // Shadow and depth
  shadow: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    glass: string;
  };
}

export interface ThemeEffects {
  // Glassmorphism effects
  glass: {
    backdrop: string;
    border: string;
    shadow: string;
    opacity: number;
  };
  
  // Border radius
  radius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  
  // Animations
  animation: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      default: string;
      bounce: string;
      smooth: string;
    };
  };
}

export interface Theme {
  name: string;
  displayName: string;
  colors: ThemeColors;
  effects: ThemeEffects;
  typography: {
    fontFamily: {
      primary: string;
      mono: string;
      display: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
    };
    fontWeight: {
      light: number;
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
}

// Base glass effects (consistent across all themes)
const baseGlassEffects: ThemeEffects = {
  glass: {
    backdrop: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.125)',
    shadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    opacity: 0.9,
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },
  animation: {
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '350ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    },
  },
};

const baseTypography = {
  fontFamily: {
    primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
    display: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.5rem',
    xxl: '2rem',
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

// E-Ink Grayscale Theme (Default)
export const einkTheme: Theme = {
  name: 'eink',
  displayName: 'E-Ink Grayscale',
  colors: {
    background: {
      primary: '#F8F9FA',
      secondary: '#E9ECEF',
      tertiary: '#DEE2E6',
      glass: 'rgba(248, 249, 250, 0.9)',
      overlay: 'rgba(0, 0, 0, 0.05)',
    },
    text: {
      primary: '#212529',
      secondary: '#495057',
      tertiary: '#6C757D',
      accent: '#343A40',
      inverse: '#F8F9FA',
    },
    interactive: {
      primary: '#495057',
      secondary: '#6C757D',
      hover: '#343A40',
      active: '#212529',
      disabled: '#ADB5BD',
    },
    status: {
      success: '#28A745',
      warning: '#FFC107',
      error: '#DC3545',
      info: '#17A2B8',
    },
    border: {
      primary: '#DEE2E6',
      secondary: '#E9ECEF',
      focus: '#495057',
      glass: 'rgba(0, 0, 0, 0.1)',
    },
    shadow: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px rgba(0, 0, 0, 0.07)',
      lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
      glass: '0 8px 32px rgba(0, 0, 0, 0.12)',
    },
  },
  effects: baseGlassEffects,
  typography: {
    ...baseTypography,
    fontFamily: {
      ...baseTypography.fontFamily,
      display: 'Georgia, "Times New Roman", serif',
    },
  },
};

// ASCII Terminal Theme
export const asciiTheme: Theme = {
  name: 'ascii',
  displayName: 'ASCII Terminal',
  colors: {
    background: {
      primary: '#000000',
      secondary: '#111111',
      tertiary: '#222222',
      glass: 'rgba(0, 0, 0, 0.9)',
      overlay: 'rgba(0, 255, 0, 0.05)',
    },
    text: {
      primary: '#00FF00',
      secondary: '#00CC00',
      tertiary: '#009900',
      accent: '#FFFF00',
      inverse: '#000000',
    },
    interactive: {
      primary: '#00FF00',
      secondary: '#00CC00',
      hover: '#00FF41',
      active: '#FFFF00',
      disabled: '#006600',
    },
    status: {
      success: '#00FF00',
      warning: '#FFFF00',
      error: '#FF0000',
      info: '#00FFFF',
    },
    border: {
      primary: '#00CC00',
      secondary: '#009900',
      focus: '#00FF00',
      glass: 'rgba(0, 255, 0, 0.2)',
    },
    shadow: {
      sm: '0 0 4px rgba(0, 255, 0, 0.3)',
      md: '0 0 8px rgba(0, 255, 0, 0.4)',
      lg: '0 0 16px rgba(0, 255, 0, 0.5)',
      xl: '0 0 24px rgba(0, 255, 0, 0.6)',
      glass: '0 0 20px rgba(0, 255, 0, 0.3)',
    },
  },
  effects: baseGlassEffects,
  typography: {
    ...baseTypography,
    fontFamily: {
      primary: 'Courier, "Courier New", monospace',
      mono: 'Courier, "Courier New", monospace',
      display: 'Courier, "Courier New", monospace',
    },
  },
};

// Borland Blue Theme
export const borlandTheme: Theme = {
  name: 'borland',
  displayName: 'Borland Blue',
  colors: {
    background: {
      primary: '#000080',
      secondary: '#0000A0',
      tertiary: '#0066CC',
      glass: 'rgba(0, 0, 128, 0.9)',
      overlay: 'rgba(255, 255, 255, 0.05)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#CCCCFF',
      tertiary: '#9999FF',
      accent: '#FFFF00',
      inverse: '#000080',
    },
    interactive: {
      primary: '#FFFFFF',
      secondary: '#CCCCFF',
      hover: '#FFFF00',
      active: '#FF00FF',
      disabled: '#666699',
    },
    status: {
      success: '#00FF00',
      warning: '#FFFF00',
      error: '#FF0000',
      info: '#00FFFF',
    },
    border: {
      primary: '#FFFFFF',
      secondary: '#CCCCFF',
      focus: '#FFFF00',
      glass: 'rgba(255, 255, 255, 0.2)',
    },
    shadow: {
      sm: '2px 2px 0px #000000',
      md: '4px 4px 0px #000000',
      lg: '6px 6px 0px #000000',
      xl: '8px 8px 0px #000000',
      glass: '4px 4px 12px rgba(0, 0, 0, 0.8)',
    },
  },
  effects: {
    ...baseGlassEffects,
    radius: {
      sm: '0px',
      md: '0px',
      lg: '0px',
      xl: '0px',
      full: '0px',
    },
  },
  typography: {
    ...baseTypography,
    fontFamily: {
      primary: '"MS Sans Serif", sans-serif',
      mono: '"Courier New", monospace',
      display: '"MS Sans Serif", sans-serif',
    },
  },
};

// Paper White Theme
export const paperTheme: Theme = {
  name: 'paper',
  displayName: 'Paper White',
  colors: {
    background: {
      primary: '#FEFEFE',
      secondary: '#F5F5F5',
      tertiary: '#EEEEEE',
      glass: 'rgba(254, 254, 254, 0.95)',
      overlay: 'rgba(0, 0, 0, 0.02)',
    },
    text: {
      primary: '#2E2E2E',
      secondary: '#555555',
      tertiary: '#777777',
      accent: '#1A1A1A',
      inverse: '#FEFEFE',
    },
    interactive: {
      primary: '#2E2E2E',
      secondary: '#555555',
      hover: '#1A1A1A',
      active: '#000000',
      disabled: '#CCCCCC',
    },
    status: {
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3',
    },
    border: {
      primary: '#E0E0E0',
      secondary: '#F0F0F0',
      focus: '#2E2E2E',
      glass: 'rgba(0, 0, 0, 0.08)',
    },
    shadow: {
      sm: '0 2px 4px rgba(0, 0, 0, 0.08)',
      md: '0 4px 8px rgba(0, 0, 0, 0.12)',
      lg: '0 8px 16px rgba(0, 0, 0, 0.15)',
      xl: '0 16px 32px rgba(0, 0, 0, 0.18)',
      glass: '0 4px 20px rgba(0, 0, 0, 0.08)',
    },
  },
  effects: {
    ...baseGlassEffects,
    glass: {
      ...baseGlassEffects.glass,
      backdrop: 'blur(12px) saturate(120%)',
    },
  },
  typography: {
    ...baseTypography,
    fontFamily: {
      primary: 'Georgia, "Times New Roman", serif',
      mono: 'Consolas, "Liberation Mono", monospace',
      display: 'Georgia, "Times New Roman", serif',
    },
  },
};

// Solarized Dark Theme
export const solarizedTheme: Theme = {
  name: 'solarized',
  displayName: 'Solarized Dark',
  colors: {
    background: {
      primary: '#002B36',
      secondary: '#073642',
      tertiary: '#586E75',
      glass: 'rgba(0, 43, 54, 0.9)',
      overlay: 'rgba(181, 137, 0, 0.05)',
    },
    text: {
      primary: '#839496',
      secondary: '#93A1A1',
      tertiary: '#657B83',
      accent: '#B58900',
      inverse: '#002B36',
    },
    interactive: {
      primary: '#268BD2',
      secondary: '#2AA198',
      hover: '#B58900',
      active: '#CB4B16',
      disabled: '#586E75',
    },
    status: {
      success: '#859900',
      warning: '#B58900',
      error: '#DC322F',
      info: '#268BD2',
    },
    border: {
      primary: '#586E75',
      secondary: '#073642',
      focus: '#268BD2',
      glass: 'rgba(88, 110, 117, 0.3)',
    },
    shadow: {
      sm: '0 2px 4px rgba(0, 0, 0, 0.3)',
      md: '0 4px 8px rgba(0, 0, 0, 0.4)',
      lg: '0 8px 16px rgba(0, 0, 0, 0.5)',
      xl: '0 16px 32px rgba(0, 0, 0, 0.6)',
      glass: '0 8px 24px rgba(0, 0, 0, 0.4)',
    },
  },
  effects: baseGlassEffects,
  typography: baseTypography,
};

// Cyberpunk Pink Theme
export const cyberpunkTheme: Theme = {
  name: 'cyberpunk',
  displayName: 'Cyberpunk Pink',
  colors: {
    background: {
      primary: '#0D0D0D',
      secondary: '#1A0A1A',
      tertiary: '#2D1B2D',
      glass: 'rgba(13, 13, 13, 0.9)',
      overlay: 'rgba(255, 20, 147, 0.1)',
    },
    text: {
      primary: '#FF1493',
      secondary: '#FF69B4',
      tertiary: '#DA70D6',
      accent: '#00FFFF',
      inverse: '#0D0D0D',
    },
    interactive: {
      primary: '#FF1493',
      secondary: '#FF69B4',
      hover: '#00FFFF',
      active: '#FFFF00',
      disabled: '#663366',
    },
    status: {
      success: '#00FF41',
      warning: '#FFFF00',
      error: '#FF073A',
      info: '#00FFFF',
    },
    border: {
      primary: '#FF1493',
      secondary: '#FF69B4',
      focus: '#00FFFF',
      glass: 'rgba(255, 20, 147, 0.3)',
    },
    shadow: {
      sm: '0 0 8px rgba(255, 20, 147, 0.5)',
      md: '0 0 16px rgba(255, 20, 147, 0.6)',
      lg: '0 0 24px rgba(255, 20, 147, 0.7)',
      xl: '0 0 32px rgba(255, 20, 147, 0.8)',
      glass: '0 0 20px rgba(255, 20, 147, 0.4)',
    },
  },
  effects: baseGlassEffects,
  typography: {
    ...baseTypography,
    fontFamily: {
      primary: '"Orbitron", "Roboto", sans-serif',
      mono: '"Fira Code", "Courier New", monospace',
      display: '"Orbitron", "Roboto", sans-serif',
    },
  },
};

// NY Times Newspaper Theme
export const newspaperTheme: Theme = {
  name: 'newspaper',
  displayName: 'NY Times',
  colors: {
    background: {
      primary: '#FFFFFF',
      secondary: '#F7F7F7',
      tertiary: '#EEEEEE',
      glass: 'rgba(255, 255, 255, 0.95)',
      overlay: 'rgba(0, 0, 0, 0.03)',
    },
    text: {
      primary: '#000000',
      secondary: '#333333',
      tertiary: '#666666',
      accent: '#326891',
      inverse: '#FFFFFF',
    },
    interactive: {
      primary: '#326891',
      secondary: '#666666',
      hover: '#1A5490',
      active: '#0E4B99',
      disabled: '#CCCCCC',
    },
    status: {
      success: '#2E7D32',
      warning: '#F57C00',
      error: '#C62828',
      info: '#1976D2',
    },
    border: {
      primary: '#CCCCCC',
      secondary: '#E0E0E0',
      focus: '#326891',
      glass: 'rgba(0, 0, 0, 0.1)',
    },
    shadow: {
      sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
      md: '0 2px 6px rgba(0, 0, 0, 0.15)',
      lg: '0 4px 12px rgba(0, 0, 0, 0.2)',
      xl: '0 8px 24px rgba(0, 0, 0, 0.25)',
      glass: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
  },
  effects: {
    ...baseGlassEffects,
    radius: {
      sm: '2px',
      md: '4px',
      lg: '6px',
      xl: '8px',
      full: '9999px',
    },
  },
  typography: {
    ...baseTypography,
    fontFamily: {
      primary: '"Times New Roman", Times, serif',
      mono: '"Courier New", monospace',
      display: '"Times New Roman", Times, serif',
    },
  },
};

// Windows 95 Theme
export const win95Theme: Theme = {
  name: 'win95',
  displayName: 'Windows 95',
  colors: {
    background: {
      primary: '#C0C0C0',
      secondary: '#808080',
      tertiary: '#FFFFFF',
      glass: 'rgba(192, 192, 192, 0.9)',
      overlay: 'rgba(0, 0, 0, 0.1)',
    },
    text: {
      primary: '#000000',
      secondary: '#000080',
      tertiary: '#800080',
      accent: '#0000FF',
      inverse: '#FFFFFF',
    },
    interactive: {
      primary: '#0000FF',
      secondary: '#000080',
      hover: '#800080',
      active: '#FF0000',
      disabled: '#808080',
    },
    status: {
      success: '#008000',
      warning: '#FFFF00',
      error: '#FF0000',
      info: '#0000FF',
    },
    border: {
      primary: '#808080',
      secondary: '#C0C0C0',
      focus: '#0000FF',
      glass: 'rgba(128, 128, 128, 0.5)',
    },
    shadow: {
      sm: '1px 1px 0px #808080',
      md: '2px 2px 0px #808080',
      lg: '3px 3px 0px #808080',
      xl: '4px 4px 0px #808080',
      glass: '2px 2px 4px rgba(0, 0, 0, 0.3)',
    },
  },
  effects: {
    ...baseGlassEffects,
    radius: {
      sm: '0px',
      md: '0px',
      lg: '2px',
      xl: '2px',
      full: '2px',
    },
  },
  typography: {
    ...baseTypography,
    fontFamily: {
      primary: '"MS Sans Serif", sans-serif',
      mono: '"Courier New", monospace',
      display: '"MS Sans Serif", sans-serif',
    },
  },
};

// Windows XP Theme
export const winxpTheme: Theme = {
  name: 'winxp',
  displayName: 'Windows XP',
  colors: {
    background: {
      primary: '#ECE9D8',
      secondary: '#D4D0C8',
      tertiary: '#F0F0F0',
      glass: 'rgba(236, 233, 216, 0.9)',
      overlay: 'rgba(0, 100, 200, 0.05)',
    },
    text: {
      primary: '#000000',
      secondary: '#0054E3',
      tertiary: '#666666',
      accent: '#FF6000',
      inverse: '#FFFFFF',
    },
    interactive: {
      primary: '#0054E3',
      secondary: '#316AC5',
      hover: '#FF6000',
      active: '#D60000',
      disabled: '#ACA899',
    },
    status: {
      success: '#008000',
      warning: '#FFD700',
      error: '#D60000',
      info: '#0054E3',
    },
    border: {
      primary: '#ACA899',
      secondary: '#D4D0C8',
      focus: '#0054E3',
      glass: 'rgba(172, 168, 153, 0.4)',
    },
    shadow: {
      sm: '1px 1px 2px rgba(0, 0, 0, 0.2)',
      md: '2px 2px 4px rgba(0, 0, 0, 0.3)',
      lg: '4px 4px 8px rgba(0, 0, 0, 0.4)',
      xl: '6px 6px 12px rgba(0, 0, 0, 0.5)',
      glass: '2px 2px 6px rgba(0, 0, 0, 0.2)',
    },
  },
  effects: {
    ...baseGlassEffects,
    radius: {
      sm: '3px',
      md: '5px',
      lg: '8px',
      xl: '12px',
      full: '20px',
    },
  },
  typography: {
    ...baseTypography,
    fontFamily: {
      primary: '"Tahoma", sans-serif',
      mono: '"Courier New", monospace',
      display: '"Tahoma", sans-serif',
    },
  },
};

// macOS Aqua Theme
export const macosTheme: Theme = {
  name: 'macos',
  displayName: 'macOS Aqua',
  colors: {
    background: {
      primary: '#F5F5F7',
      secondary: '#E8E8ED',
      tertiary: '#D2D2D7',
      glass: 'rgba(245, 245, 247, 0.8)',
      overlay: 'rgba(0, 122, 255, 0.05)',
    },
    text: {
      primary: '#1D1D1F',
      secondary: '#424245',
      tertiary: '#86868B',
      accent: '#007AFF',
      inverse: '#FFFFFF',
    },
    interactive: {
      primary: '#007AFF',
      secondary: '#5856D6',
      hover: '#0051D5',
      active: '#004CCC',
      disabled: '#C7C7CC',
    },
    status: {
      success: '#34C759',
      warning: '#FF9500',
      error: '#FF3B30',
      info: '#007AFF',
    },
    border: {
      primary: '#D2D2D7',
      secondary: '#E8E8ED',
      focus: '#007AFF',
      glass: 'rgba(210, 210, 215, 0.6)',
    },
    shadow: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.04)',
      md: '0 4px 16px rgba(0, 0, 0, 0.12)',
      lg: '0 8px 24px rgba(0, 0, 0, 0.16)',
      xl: '0 16px 48px rgba(0, 0, 0, 0.20)',
      glass: '0 8px 32px rgba(0, 0, 0, 0.08)',
    },
  },
  effects: {
    ...baseGlassEffects,
    glass: {
      ...baseGlassEffects.glass,
      backdrop: 'blur(40px) saturate(200%)',
      opacity: 0.8,
    },
  },
  typography: {
    ...baseTypography,
    fontFamily: {
      primary: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      mono: '"SF Mono", Monaco, monospace',
      display: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
    },
  },
};

// Linux TUI Theme
export const linuxTheme: Theme = {
  name: 'linux',
  displayName: 'Linux TUI',
  colors: {
    background: {
      primary: '#1E1E1E',
      secondary: '#2D2D2D',
      tertiary: '#3C3C3C',
      glass: 'rgba(30, 30, 30, 0.9)',
      overlay: 'rgba(102, 217, 239, 0.05)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#CCCCCC',
      tertiary: '#999999',
      accent: '#66D9EF',
      inverse: '#1E1E1E',
    },
    interactive: {
      primary: '#66D9EF',
      secondary: '#A6E22E',
      hover: '#F92672',
      active: '#FD971F',
      disabled: '#666666',
    },
    status: {
      success: '#A6E22E',
      warning: '#E6DB74',
      error: '#F92672',
      info: '#66D9EF',
    },
    border: {
      primary: '#555555',
      secondary: '#3C3C3C',
      focus: '#66D9EF',
      glass: 'rgba(85, 85, 85, 0.5)',
    },
    shadow: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.5)',
      md: '0 2px 4px rgba(0, 0, 0, 0.6)',
      lg: '0 4px 8px rgba(0, 0, 0, 0.7)',
      xl: '0 8px 16px rgba(0, 0, 0, 0.8)',
      glass: '0 4px 12px rgba(0, 0, 0, 0.5)',
    },
  },
  effects: baseGlassEffects,
  typography: {
    ...baseTypography,
    fontFamily: {
      primary: '"Liberation Sans", "DejaVu Sans", sans-serif',
      mono: '"Liberation Mono", "DejaVu Sans Mono", monospace',
      display: '"Liberation Sans", "DejaVu Sans", sans-serif',
    },
  },
};

// Export all themes
export const themes: Record<string, Theme> = {
  eink: einkTheme,
  ascii: asciiTheme,
  borland: borlandTheme,
  paper: paperTheme,
  solarized: solarizedTheme,
  cyberpunk: cyberpunkTheme,
  newspaper: newspaperTheme,
  win95: win95Theme,
  winxp: winxpTheme,
  macos: macosTheme,
  linux: linuxTheme,
};

export const defaultTheme = einkTheme;

export type ThemeName = keyof typeof themes;