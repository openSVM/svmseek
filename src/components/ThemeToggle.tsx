import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Brightness7, Brightness4 } from '@mui/icons-material';
import { useThemeMode } from '../context/ThemeContext';
import { styled } from '@mui/material/styles';

const AnimatedIconButton = styled(IconButton)(({ theme }) => ({
  borderRadius: '50%',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  '&:hover': {
    transform: 'scale(1.1) rotate(15deg)',
    background: 'rgba(255, 255, 255, 0.2)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  },
  '&:active': {
    transform: 'scale(0.95)',
  },
}));

const ThemeToggle: React.FC = () => {
  const { mode, toggleTheme } = useThemeMode();

  return (
    <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
      <AnimatedIconButton
        onClick={toggleTheme}
        className="glass-morphism"
        size="medium"
      >
        {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
      </AnimatedIconButton>
    </Tooltip>
  );
};

export default ThemeToggle;