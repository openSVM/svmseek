import React from 'react';
import { Box, BoxProps } from '@mui/material';
import { styled } from '@mui/material/styles';

interface GlassContainerProps extends BoxProps {
  blur?: number;
  opacity?: number;
  borderRadius?: number;
  animationType?: 'fade-in' | 'slide-up' | 'scale-in';
  show?: boolean;
}

const StyledGlassContainer = styled(Box, {
  shouldForwardProp: (prop) => !['blur', 'opacity', 'borderRadius', 'animationType'].includes(prop as string),
})<GlassContainerProps>(({ 
  theme, 
  blur = 10, 
  opacity = 0.1, 
  borderRadius = 16,
  animationType = 'fade-in' 
}) => ({
  background: theme.palette.mode === 'dark' 
    ? `rgba(255, 255, 255, ${opacity})` 
    : `rgba(255, 255, 255, ${opacity * 2})`,
  backdropFilter: `blur(${blur}px)`,
  border: `1px solid ${theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.2)' 
    : 'rgba(0, 0, 0, 0.08)'}`,
  borderRadius: `${borderRadius}px`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${animationType} 0.5s ease-out`,
  '&:hover': {
    background: theme.palette.mode === 'dark' 
      ? `rgba(255, 255, 255, ${opacity * 1.5})` 
      : `rgba(255, 255, 255, ${opacity * 3})`,
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
      : '0 8px 32px rgba(0, 0, 0, 0.1)',
  },
}));

const GlassContainer: React.FC<GlassContainerProps> = ({
  children,
  blur,
  opacity,
  borderRadius,
  animationType,
  ...props
}) => {
  return (
    <StyledGlassContainer
      blur={blur}
      opacity={opacity}
      borderRadius={borderRadius}
      animationType={animationType}
      {...props}
    >
      {children}
    </StyledGlassContainer>
  );
};

export default GlassContainer;
export { GlassContainer };