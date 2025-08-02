// Animation duration constants for easier tweaking across the application
export const ANIMATION_DURATIONS = {
  // Micro interactions
  fast: '0.15s',
  standard: '0.3s',
  
  // UI transitions
  fadeIn: '0.8s',
  slideUp: '0.6s',
  scaleIn: '0.5s',
  slideInFromSide: '0.6s',
  
  // Special effects
  pulse: '2s',
  glow: '2s',
  shimmer: '2s',
  float: '3s',
  bounce: '1s',
  
  // Loading states
  loadingDots: '1.5s',
  skeleton: '1.5s',
} as const;

// Easing constants
export const ANIMATION_EASINGS = {
  default: 'cubic-bezier(0.4, 0, 0.2, 1)',
  smooth: 'ease-in-out',
  easeOut: 'ease-out',
  easeIn: 'ease-in',
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  entrance: 'cubic-bezier(0, 0, 0.2, 1)',
  exit: 'cubic-bezier(0.4, 0, 1, 1)',
} as const;

// Animation delay constants
export const ANIMATION_DELAYS = {
  none: '0s',
  short: '0.1s',
  medium: '0.2s',
  long: '0.3s',
  extraLong: '0.5s',
} as const;

// Glass morphism constants
export const GLASS_EFFECTS = {
  light: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  dark: {
    background: 'rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  strong: {
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  subtle: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
} as const;

// Color constants for consistent theming - now using theme variables
export const THEME_COLORS = {
  primary: 'var(--interactive-primary)',
  primaryLight: 'var(--interactive-secondary)',
  secondary: 'var(--interactive-secondary)',
  success: 'var(--status-success)',
  error: 'var(--status-error)',
  warning: 'var(--status-warning)',
  info: 'var(--status-info)',
} as const;

// Loading state configurations
export const LOADING_CONFIGS = {
  button: {
    duration: ANIMATION_DURATIONS.standard,
    easing: ANIMATION_EASINGS.default,
  },
  page: {
    duration: ANIMATION_DURATIONS.fadeIn,
    easing: ANIMATION_EASINGS.entrance,
  },
  skeleton: {
    duration: ANIMATION_DURATIONS.skeleton,
    easing: ANIMATION_EASINGS.smooth,
  },
} as const;

// Responsive breakpoints for animations
export const RESPONSIVE_BREAKPOINTS = {
  mobile: '(max-width: 768px)',
  tablet: '(max-width: 1024px)',
  desktop: '(min-width: 1025px)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
} as const;

// Export constants object with a proper name
const styleConstants = {
  ANIMATION_DURATIONS,
  ANIMATION_EASINGS,
  ANIMATION_DELAYS,
  GLASS_EFFECTS,
  THEME_COLORS,
  LOADING_CONFIGS,
  RESPONSIVE_BREAKPOINTS,
};

export default styleConstants;
