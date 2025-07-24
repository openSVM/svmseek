import React from 'react';
import styled from 'styled-components';
import { ANIMATION_DURATIONS, ANIMATION_EASINGS, GLASS_EFFECTS } from './constants';

/**
 * Utility to apply animation constants as CSS custom properties
 * Use this in your components to ensure consistent animation timings
 */
export const applyAnimationConstants = () => {
  const root = document.documentElement;
  
  // Apply animation durations
  Object.entries(ANIMATION_DURATIONS).forEach(([key, value]) => {
    root.style.setProperty(`--animation-duration-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
  });
  
  // Apply easing functions
  Object.entries(ANIMATION_EASINGS).forEach(([key, value]) => {
    root.style.setProperty(`--animation-easing-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
  });
  
  // Apply glass effects
  Object.entries(GLASS_EFFECTS).forEach(([effectName, effect]) => {
    Object.entries(effect).forEach(([property, value]) => {
      const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--glass-${effectName}-${cssProperty}`, value);
    });
  });
};

/**
 * Hook to initialize animation constants on component mount
 */
export const useAnimationConstants = () => {
  React.useEffect(() => {
    applyAnimationConstants();
  }, []);
};

/**
 * Get CSS custom property value for animation duration
 */
export const getAnimationDuration = (key: keyof typeof ANIMATION_DURATIONS): string => {
  return `var(--animation-duration-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}, ${ANIMATION_DURATIONS[key]})`;
};

/**
 * Get CSS custom property value for animation easing
 */
export const getAnimationEasing = (key: keyof typeof ANIMATION_EASINGS): string => {
  return `var(--animation-easing-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}, ${ANIMATION_EASINGS[key]})`;
};

/**
 * Create transition CSS with consistent timing
 */
export const createTransition = (
  property: string = 'all',
  duration: keyof typeof ANIMATION_DURATIONS = 'standard',
  easing: keyof typeof ANIMATION_EASINGS = 'default'
): string => {
  return `${property} ${getAnimationDuration(duration)} ${getAnimationEasing(easing)}`;
};

/**
 * Glass morphism style generator
 */
export const createGlassStyle = (variant: keyof typeof GLASS_EFFECTS = 'light') => {
  const effect = GLASS_EFFECTS[variant];
  return {
    background: effect.background,
    backdropFilter: effect.backdropFilter,
    border: effect.border,
    borderRadius: '12px',
  };
};

/**
 * Loading skeleton component with consistent animation
 */
export const LoadingSkeleton = styled.div<{ width?: string; height?: string }>`
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '20px'};
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.2),
    rgba(255, 255, 255, 0.1)
  );
  background-size: 200px 100%;
  animation: shimmer ${getAnimationDuration('skeleton')} linear infinite;
  border-radius: 4px;
`;

/**
 * Animated button with consistent hover effects
 */
export const AnimatedButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  ${createTransition()};
  transform: translateY(0);
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
    transition: ${createTransition('all', 'fast')};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

/**
 * Glass container with consistent styling
 */
export const GlassCard = styled.div<{ variant?: keyof typeof GLASS_EFFECTS }>`
  ${props => createGlassStyle(props.variant || 'light')};
  ${createTransition()};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
`;