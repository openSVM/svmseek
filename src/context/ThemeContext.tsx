import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, Theme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import blue from '@mui/material/colors/blue';

// Animation keyframes for glass morphism
const glassAnimations = `
  @keyframes glass-fade-in {
    from {
      opacity: 0;
      backdrop-filter: blur(0px);
    }
    to {
      opacity: 1;
      backdrop-filter: blur(10px);
    }
  }

  @keyframes slide-up {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes scale-in {
    from {
      transform: scale(0.95);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  .glass-morphism {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    animation: glass-fade-in 0.5s ease-out;
  }

  .glass-morphism:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  .slide-up {
    animation: slide-up 0.4s ease-out;
  }

  .scale-in {
    animation: scale-in 0.3s ease-out;
  }

  .fade-in {
    animation: glass-fade-in 0.5s ease-out;
  }
`;

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    // Get from localStorage or default to dark
    const saved = localStorage.getItem('theme-mode');
    return (saved as ThemeMode) || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
  }, [mode]);

  useEffect(() => {
    // Inject glass morphism styles
    const style = document.createElement('style');
    style.textContent = glassAnimations;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const toggleTheme = () => {
    setMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  const theme = React.useMemo(() => {
    const isDark = mode === 'dark';
    
    return createTheme({
      palette: {
        mode,
        primary: blue,
        background: {
          default: isDark ? '#0a0b0d' : '#f8fafc',
          paper: isDark ? '#1a1b1e' : '#ffffff',
        },
        text: {
          primary: isDark ? '#ffffff' : '#1a1b1e',
          secondary: isDark ? '#b3b3b3' : '#64748b',
        },
      },
      components: {
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 12,
              textTransform: 'none',
              fontWeight: 600,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              },
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 16,
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
              backdropFilter: 'blur(10px)',
              background: isDark 
                ? 'rgba(26, 27, 30, 0.8)' 
                : 'rgba(255, 255, 255, 0.9)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: isDark 
                  ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
                  : '0 8px 32px rgba(0, 0, 0, 0.1)',
              },
            },
          },
        },
      },
      customPalette: {
        text: {
          grey: isDark ? '#fff' : '#2E2E2E',
        },
        border: {
          main: isDark ? '.1rem solid #2e2e2e' : '.1rem solid #e0e5ec',
          new: '.1rem solid #3A475C',
        },
        grey: {
          additional: isDark ? '#fff' : '#0E1016',
          border: isDark ? '#2E2E2E' : '#e0e5ec',
          light: '#96999C',
          dark: '#93A0B2',
          soft: isDark ? '#E2E0E5' : '#383B45',
          background: '#222429',
        },
        dark: {
          main: isDark ? '#D1DDEF' : '#16253D',
          background: '#17181A',
        },
        blue: {
          serum: '#651CE4',
          new: '#651CE4',
        },
        white: {
          main: '#fff',
          background: '#1B2028',
        },
        red: {
          main: '#F69894',
        },
        green: {
          main: '#97E873',
          light: '#53DF11',
        },
        orange: {
          dark: '#F8B567',
          light: '#F29C38',
        },
      },
    });
  }, [mode]);

  const value = {
    mode,
    toggleTheme,
    theme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};