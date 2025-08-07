import React, { useState } from 'react';
import { IconButton, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { Palette, Check } from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';
import { styled } from '@mui/material/styles';
import { themes, ThemeName } from '../themes';

const AnimatedIconButton = styled(IconButton)(({ theme }) => ({
  borderRadius: '50%',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  background: 'var(--bg-glass)',
  backdropFilter: 'var(--glass-backdrop)',
  border: '1px solid var(--border-glass)',
  color: 'var(--text-primary)',
  '&:hover': {
    transform: 'scale(1.1) rotate(15deg)',
    background: 'var(--interactive-hover)',
    color: 'var(--text-inverse)',
    boxShadow: 'var(--shadow-md)',
  },
  '&:active': {
    transform: 'scale(0.95)',
  },
}));

const ThemeMenuItem = styled(MenuItem)<{ selected?: boolean }>(({ selected }) => ({
  background: selected ? 'var(--bg-glass)' : 'transparent',
  borderRadius: 'var(--radius-sm)',
  margin: '2px 4px',
  '&:hover': {
    background: 'var(--interactive-hover)',
    color: 'var(--text-inverse)',
  },
}));

const ThemeToggle: React.FC = () => {
  const { themeName, setTheme } = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeSelect = (newThemeName: ThemeName) => {
    setTheme(newThemeName);
    handleClose();
  };

  return (
    <>
      <Tooltip title="Change theme">
        <AnimatedIconButton
          onClick={handleClick}
          className="glass-morphism"
          size="medium"
        >
          <Palette />
        </AnimatedIconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            background: 'var(--bg-glass)',
            backdropFilter: 'var(--glass-backdrop)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            minWidth: 200,
          },
        }}
      >
        {Object.entries(themes).map(([themeKey, theme]) => (
          <ThemeMenuItem
            key={themeKey}
            onClick={() => handleThemeSelect(themeKey as ThemeName)}
            selected={themeName === themeKey}
          >
            <ListItemIcon>
              {themeName === themeKey && <Check fontSize="small" />}
            </ListItemIcon>
            <ListItemText primary={theme.displayName} />
          </ThemeMenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ThemeToggle;
