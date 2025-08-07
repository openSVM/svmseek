import styled from 'styled-components';
import { Card, Button, Paper, TextField, Typography } from '@mui/material';

// Glass Card Component
export const GlassCard = styled(Card)`
  background: var(--bg-glass) !important;
  backdrop-filter: var(--glass-backdrop) !important;
  border: 1px solid var(--border-glass) !important;
  border-radius: var(--radius-xl) !important;
  box-shadow: var(--shadow-glass) !important;
  transition: all var(--animation-duration-normal) var(--animation-easing-default) !important;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-xl) !important;
    border-color: var(--border-focus) !important;
  }
`;

// Glass Button Component
export const GlassButton = styled(Button)`
  background: var(--bg-glass) !important;
  backdrop-filter: var(--glass-backdrop) !important;
  border: 1px solid var(--border-glass) !important;
  border-radius: var(--radius-md) !important;
  color: var(--text-primary) !important;
  font-family: var(--font-primary) !important;
  font-weight: 600 !important;
  text-transform: none !important;
  padding: 0.75rem 2rem !important;
  transition: all var(--animation-duration-normal) var(--animation-easing-default) !important;

  &:hover {
    background: var(--interactive-hover) !important;
    color: var(--text-inverse) !important;
    transform: translateY(-2px);
    box-shadow: var(--shadow-md) !important;
    border-color: var(--border-focus) !important;
  }

  &:active {
    transform: translateY(0px);
    background: var(--interactive-active) !important;
  }

  &.primary {
    background: var(--interactive-primary) !important;
    color: var(--text-inverse) !important;
    border-color: var(--interactive-primary) !important;

    &:hover {
      background: var(--interactive-hover) !important;
    }
  }

  &.secondary {
    background: var(--interactive-secondary) !important;
    color: var(--text-inverse) !important;
    border-color: var(--interactive-secondary) !important;
  }

  &:disabled {
    background: var(--interactive-disabled) !important;
    color: var(--text-tertiary) !important;
    border-color: var(--border-secondary) !important;
    cursor: not-allowed;
    transform: none;
  }
`;

// Glass Panel Component
export const GlassPanel = styled(Paper)`
  background: var(--bg-glass) !important;
  backdrop-filter: var(--glass-backdrop) !important;
  border: 1px solid var(--border-glass) !important;
  border-radius: var(--radius-lg) !important;
  box-shadow: var(--shadow-glass) !important;
  padding: 2rem;
  transition: all var(--animation-duration-normal) var(--animation-easing-default) !important;
`;

// Glass Input Component
export const GlassInput = styled(TextField)`
  & .MuiOutlinedInput-root {
    background: var(--bg-glass) !important;
    backdrop-filter: var(--glass-backdrop) !important;
    border-radius: var(--radius-md) !important;
    transition: all var(--animation-duration-normal) var(--animation-easing-default) !important;

    & fieldset {
      border-color: var(--border-primary) !important;
      border-width: 1px !important;
    }

    &:hover fieldset {
      border-color: var(--border-focus) !important;
    }

    &.Mui-focused fieldset {
      border-color: var(--interactive-primary) !important;
      border-width: 2px !important;
      box-shadow: 0 0 0 3px var(--interactive-primary)33 !important;
    }

    & input {
      color: var(--text-primary) !important;
      font-family: var(--font-primary) !important;

      &::placeholder {
        color: var(--text-tertiary) !important;
        opacity: 1;
      }
    }
  }

  & .MuiInputLabel-root {
    color: var(--text-secondary) !important;
    font-family: var(--font-primary) !important;

    &.Mui-focused {
      color: var(--interactive-primary) !important;
    }
  }
`;

// Glass Container
export const GlassContainer = styled.div`
  background: var(--bg-glass);
  backdrop-filter: var(--glass-backdrop);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-glass);
  padding: 2rem;
  margin: 1rem;
  transition: all var(--animation-duration-normal) var(--animation-easing-default);
`;

// Modern Typography Components
export const DisplayTitle = styled(Typography)`
  font-family: var(--font-display) !important;
  font-weight: 700 !important;
  color: var(--text-primary) !important;
  line-height: 1.2;
  letter-spacing: -0.02em;
`;

export const AccentText = styled(Typography)`
  color: var(--text-accent) !important;
  font-weight: 600 !important;
  font-family: var(--font-primary) !important;
`;

export const SecondaryText = styled(Typography)`
  color: var(--text-secondary) !important;
  font-family: var(--font-primary) !important;
`;

export const TertiaryText = styled(Typography)`
  color: var(--text-tertiary) !important;
  font-family: var(--font-primary) !important;
  font-size: 0.875rem;
`;

// Layout Components
export const FlexContainer = styled.div<{
  direction?: 'row' | 'column';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  gap?: string;
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
}>`
  display: flex;
  flex-direction: ${props => props.direction || 'row'};
  justify-content: ${props => props.justify || 'flex-start'};
  align-items: ${props => props.align || 'stretch'};
  gap: ${props => props.gap || '0'};
  flex-wrap: ${props => props.wrap || 'nowrap'};
`;

export const GridContainer = styled.div<{
  columns?: number;
  gap?: string;
  minItemWidth?: string;
}>`
  display: grid;
  grid-template-columns: ${props => props.minItemWidth
    ? `repeat(auto-fit, minmax(${props.minItemWidth}, 1fr))`
    : `repeat(${props.columns || 1}, 1fr)`};
  gap: ${props => props.gap || '1rem'};
`;

// Status Indicators
export const StatusIndicator = styled.div<{
  status: 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  font-weight: 600;
  font-family: var(--font-primary);
  transition: all var(--animation-duration-normal) var(--animation-easing-default);

  ${props => {
    const size = props.size || 'md';
    const sizes = {
      sm: { padding: '0.25rem 0.5rem', fontSize: '0.75rem' },
      md: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
      lg: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
    };

    return `
      padding: ${sizes[size].padding};
      font-size: ${sizes[size].fontSize};
    `;
  }}

  ${props => {
    const statusColors = {
      success: 'var(--status-success)',
      warning: 'var(--status-warning)',
      error: 'var(--status-error)',
      info: 'var(--status-info)',
    };

    return `
      background: ${statusColors[props.status]}22;
      color: ${statusColors[props.status]};
      border: 1px solid ${statusColors[props.status]}44;
    `;
  }}
`;

// Animated Loading Spinner
export const LoadingSpinner = styled.div<{ size?: string; color?: string }>`
  width: ${props => props.size || '24px'};
  height: ${props => props.size || '24px'};
  border: 2px solid var(--border-secondary);
  border-top: 2px solid ${props => props.color || 'var(--interactive-primary)'};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Floating Action Elements
export const FloatingElement = styled.div<{ hover?: boolean }>`
  transition: all var(--animation-duration-normal) var(--animation-easing-default);

  ${props => props.hover && `
    &:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }
  `}
`;

// Glass Navigation Bar
export const GlassNavBar = styled.nav`
  background: var(--bg-glass);
  backdrop-filter: var(--glass-backdrop);
  border-bottom: 1px solid var(--border-glass);
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all var(--animation-duration-normal) var(--animation-easing-default);
`;

// Responsive Grid Item
export const ResponsiveGridItem = styled.div<{
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}>`
  @media (max-width: 576px) {
    grid-column: span ${props => props.xs || 12};
  }

  @media (min-width: 577px) and (max-width: 768px) {
    grid-column: span ${props => props.sm || props.xs || 12};
  }

  @media (min-width: 769px) and (max-width: 992px) {
    grid-column: span ${props => props.md || props.sm || props.xs || 12};
  }

  @media (min-width: 993px) and (max-width: 1200px) {
    grid-column: span ${props => props.lg || props.md || props.sm || props.xs || 12};
  }

  @media (min-width: 1201px) {
    grid-column: span ${props => props.xl || props.lg || props.md || props.sm || props.xs || 12};
  }
`;

// Interactive Card for clickable elements
export const InteractiveCard = styled(GlassCard)<{ disabled?: boolean }>`
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.6 : 1};

  &:hover {
    transform: ${props => props.disabled ? 'none' : 'translateY(-6px)'};
    box-shadow: ${props => props.disabled ? 'var(--shadow-glass)' : 'var(--shadow-xl)'} !important;
  }

  &:active {
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
  }
`;

// Modern Progress Bar
export const ProgressBar = styled.div<{ progress: number; animated?: boolean }>`
  width: 100%;
  height: 8px;
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => Math.min(100, Math.max(0, props.progress))}%;
    background: linear-gradient(90deg, var(--interactive-primary), var(--interactive-secondary));
    border-radius: var(--radius-full);
    transition: width var(--animation-duration-slow) var(--animation-easing-default);

    ${props => props.animated && `
      animation: shimmer 2s infinite;

      @keyframes shimmer {
        0% { background-position: -200px 0; }
        100% { background-position: calc(200px + 100%) 0; }
      }
    `}
  }
`;
