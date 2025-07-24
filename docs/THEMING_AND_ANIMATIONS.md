# Theme Management & Animation System

SVMSeek features a sophisticated theme system with glass morphism effects and smooth microanimations. This guide helps developers understand and extend the theming and animation capabilities.

## Table of Contents

1. [Theme System Overview](#theme-system-overview)
2. [Animation System](#animation-system)  
3. [Glass Morphism Components](#glass-morphism-components)
4. [Customizing Themes](#customizing-themes)
5. [Adding New Animations](#adding-new-animations)
6. [Best Practices](#best-practices)

## Theme System Overview

### Theme Context

The application uses a custom theme context that extends Material-UI's theme system:

```tsx
// Located in src/context/ThemeContext.tsx
interface ThemeContextType {
  mode: 'light' | 'dark';
  toggleTheme: () => void;
  theme: Theme;
}
```

### Theme Toggle Component

```tsx
import { ThemeToggle } from '../components/ThemeToggle';

// Usage in components
<ThemeToggle />
```

The theme preference is persisted in localStorage and automatically applies on page load.

### Theme Structure

```tsx
// Light Theme
const lightTheme = {
  mode: 'light',
  primary: '#8B5CF6',
  secondary: '#06B6D4',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  glass: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(20px)'
  }
}

// Dark Theme  
const darkTheme = {
  mode: 'dark',
  primary: '#A78BFA',
  secondary: '#67E8F9',
  background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
  glass: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)'
  }
}
```

## Animation System

### Animation CSS Module

All animations are centralized in `src/styles/animations.css`:

```css
/* Core Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

/* Utility Classes */
.fade-in {
  animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up {
  animation: slideUp 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.pulse {
  animation: pulse 2s infinite;
}

.shimmer {
  animation: shimmer 1.5s infinite;
}
```

### Responsive Animation Control

```css
/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Performance optimizations for mobile */
@media (max-width: 768px) {
  .fade-in {
    animation-duration: 0.4s;
  }
  
  .slide-up {
    animation-duration: 0.5s;
  }
}
```

### JavaScript Animation Utilities

```tsx
// src/utils/animations.ts
export const animationTimings = {
  fast: '0.3s',
  normal: '0.6s',
  slow: '0.9s'
};

export const easings = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)'
};

export const applyAnimation = (element: HTMLElement, animationClass: string) => {
  element.classList.add(animationClass);
  element.addEventListener('animationend', () => {
    element.classList.remove(animationClass);
  }, { once: true });
};
```

## Glass Morphism Components

### GlassContainer Component

The core glass morphism component used throughout the app:

```tsx
// src/components/GlassContainer.tsx
import styled from 'styled-components';

export const GlassContainer = styled.div<{ $blur?: number; $opacity?: number }>`
  background: ${props => props.theme?.mode === 'dark' 
    ? `rgba(255, 255, 255, ${props.$opacity || 0.05})` 
    : `rgba(255, 255, 255, ${props.$opacity || 0.1})`};
  backdrop-filter: blur(${props => props.$blur || 20}px);
  border-radius: 16px;
  border: 1px solid ${props => props.theme?.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(255, 255, 255, 0.2)'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(139, 92, 246, 0.2);
    border-color: rgba(139, 92, 246, 0.3);
  }
`;
```

### Usage Examples

```tsx
// Basic usage
<GlassContainer>
  <Typography>Content with glass effect</Typography>
</GlassContainer>

// Custom blur and opacity
<GlassContainer $blur={30} $opacity={0.15}>
  <Typography>Enhanced glass effect</Typography>
</GlassContainer>

// With animation
<GlassContainer className="fade-in">
  <Typography>Animated glass container</Typography>
</GlassContainer>
```

### Styled Components with Theme

```tsx
import styled from 'styled-components';

const ThemedButton = styled(Button)`
  background: ${props => props.theme?.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(255, 255, 255, 0.2)'} !important;
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.theme?.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.2)' 
    : 'rgba(0, 0, 0, 0.1)'};
  
  &:hover {
    background: ${props => props.theme?.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.15)' 
      : 'rgba(255, 255, 255, 0.3)'} !important;
    transform: translateY(-2px);
  }
`;
```

## Customizing Themes

### Adding New Color Schemes

1. **Define the color palette:**

```tsx
// src/styles/themes.ts
export const customTheme = {
  mode: 'custom',
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  glass: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(20px)'
  }
};
```

2. **Update the theme context:**

```tsx
// src/context/ThemeContext.tsx
const themes = {
  light: lightTheme,
  dark: darkTheme,
  custom: customTheme
};
```

3. **Add theme selection UI:**

```tsx
const ThemeSelector = () => {
  const { mode, setTheme } = useTheme();
  
  return (
    <Select value={mode} onChange={(e) => setTheme(e.target.value)}>
      <MenuItem value="light">Light</MenuItem>
      <MenuItem value="dark">Dark</MenuItem>
      <MenuItem value="custom">Custom</MenuItem>
    </Select>
  );
};
```

### Theme-Aware Component Creation

```tsx
import { useTheme } from '../context/ThemeContext';

const MyComponent = () => {
  const { theme, mode } = useTheme();
  
  const styles = {
    container: {
      background: theme.glass.background,
      backdropFilter: theme.glass.backdropFilter,
      border: `1px solid ${theme.glass.border}`,
      color: mode === 'dark' ? '#fff' : '#000'
    }
  };
  
  return (
    <div style={styles.container}>
      Theme-aware content
    </div>
  );
};
```

## Adding New Animations

### Creating Custom Animations

1. **Add CSS keyframes:**

```css
/* src/styles/animations.css */
@keyframes bounceIn {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.bounce-in {
  animation: bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

2. **Create animation hook:**

```tsx
// src/hooks/useAnimation.ts
import { useEffect, useRef } from 'react';

export const useAnimation = (animationClass: string, trigger: boolean) => {
  const ref = useRef<HTMLElement>(null);
  
  useEffect(() => {
    if (trigger && ref.current) {
      ref.current.classList.add(animationClass);
      
      const handleAnimationEnd = () => {
        ref.current?.classList.remove(animationClass);
      };
      
      ref.current.addEventListener('animationend', handleAnimationEnd, { once: true });
      
      return () => {
        ref.current?.removeEventListener('animationend', handleAnimationEnd);
      };
    }
  }, [trigger, animationClass]);
  
  return ref;
};
```

3. **Use in components:**

```tsx
const AnimatedComponent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const animationRef = useAnimation('bounce-in', isVisible);
  
  return (
    <div ref={animationRef} onClick={() => setIsVisible(true)}>
      Click to animate
    </div>
  );
};
```

### Performance Considerations

```css
/* Use transform and opacity for best performance */
.performant-animation {
  will-change: transform, opacity;
  transform: translateZ(0); /* Force hardware acceleration */
}

/* Avoid animating these properties */
.avoid {
  /* Don't animate: width, height, padding, margin, top, left */
}
```

## Best Practices

### Animation Guidelines

1. **Use consistent timing:** Stick to the defined timing values (0.3s, 0.6s, 0.9s)
2. **Respect user preferences:** Always include `prefers-reduced-motion` support
3. **Performance first:** Use `transform` and `opacity` for smooth animations
4. **Mobile optimization:** Reduce animation duration and complexity on mobile devices

### Theme Guidelines

1. **Accessibility:** Ensure sufficient contrast ratios in all themes
2. **Consistency:** Use the centralized theme system for all color decisions
3. **Scalability:** Design themes to work across all components
4. **Testing:** Test themes with all component combinations

### Code Organization

```
src/
├── styles/
│   ├── animations.css          # All animation keyframes
│   ├── themes.ts              # Theme definitions
│   └── globals.css            # Global styles
├── context/
│   └── ThemeContext.tsx       # Theme state management
├── components/
│   ├── GlassContainer.tsx     # Reusable glass morphism
│   └── ThemeToggle.tsx        # Theme switching UI
└── hooks/
    └── useAnimation.ts        # Animation utilities
```

### Example Integration

```tsx
import React from 'react';
import { GlassContainer } from '../components/GlassContainer';
import { useTheme } from '../context/ThemeContext';
import '../styles/animations.css';

const ExampleComponent = () => {
  const { mode } = useTheme();
  
  return (
    <GlassContainer className="fade-in">
      <Typography 
        variant="h4" 
        sx={{ 
          color: mode === 'dark' ? '#A78BFA' : '#8B5CF6',
          mb: 2 
        }}
      >
        Themed & Animated Content
      </Typography>
      <Button className="pulse">
        Animated Button
      </Button>
    </GlassContainer>
  );
};
```

## Troubleshooting

### Common Issues

1. **Animations not working:** Check if `animations.css` is imported
2. **Theme not updating:** Verify ThemeContext is properly wrapped around the app
3. **Performance issues:** Ensure hardware acceleration is enabled with `transform3d`
4. **Mobile animations laggy:** Reduce animation complexity and duration

### Debug Tools

```tsx
// Theme debug helper
const ThemeDebugger = () => {
  const { theme, mode } = useTheme();
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Current theme:', { theme, mode });
  }
  
  return null;
};
```

This comprehensive theming and animation system provides a solid foundation for creating beautiful, responsive, and accessible user interfaces in SVMSeek.