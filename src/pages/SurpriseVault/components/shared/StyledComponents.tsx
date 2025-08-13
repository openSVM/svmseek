import { styled } from '@mui/material/styles';
import {
  Box,
  Card,
  Button,
  TextField,
  Chip,
  CircularProgress
} from '@mui/material';

// Base card with glass effect following MUI theme
export const GlassCard = styled(Card)(({ theme }) => ({
  background: theme.palette.background.paper,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: (theme.shape.borderRadius as number) * 2,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
  },
}));

// Shimmer effect container for loading states
export const ShimmerContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${theme.palette.action.hover}, transparent)`,
    animation: 'shimmer 2s infinite',
  },
  '@keyframes shimmer': {
    '0%': { left: '-100%' },
    '100%': { left: '100%' },
  },
}));

// Primary action button with vault styling
export const VaultButton = styled(Button)(({ theme }) => ({
  background: 'var(--status-warning)',
  color: 'var(--text-inverse)',
  fontWeight: 'bold',
  borderRadius: (theme.shape.borderRadius as number) * 3,
  textTransform: 'none',
  boxShadow: 'var(--shadow-xl)',
  transition: 'all var(--animation-duration-normal) var(--animation-easing-smooth)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    background: 'var(--interactive-hover)',
    transform: 'translateY(-2px)',
    boxShadow: 'var(--shadow-glass)',
  },
  '&:disabled': {
    background: 'var(--interactive-disabled)',
    color: 'var(--text-tertiary)',
    transform: 'none',
    boxShadow: 'var(--shadow-sm)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
    transition: 'left 0.5s',
  },
  '&:hover::before': {
    left: '100%',
  },
}));

// Secondary action button
export const SecondaryButton = styled(Button)(({ theme }) => ({
  background: 'var(--interactive-secondary)',
  color: 'var(--text-inverse)',
  fontWeight: 'bold',
  borderRadius: (theme.shape.borderRadius as number) * 1.5,
  textTransform: 'none',
  transition: 'all var(--animation-duration-normal) var(--animation-easing-smooth)',
  '&:hover': {
    background: 'var(--interactive-hover)',
    transform: 'translateY(-2px)',
  },
}));

// Danger button for destructive actions
export const DangerButton = styled(Button)(({ theme }) => ({
  background: 'var(--status-error)',
  color: 'var(--text-inverse)',
  fontWeight: 'bold',
  borderRadius: (theme.shape.borderRadius as number) * 1.5,
  textTransform: 'none',
  transition: 'all var(--animation-duration-normal) var(--animation-easing-smooth)',
  '&:hover': {
    background: 'var(--interactive-active)',
    transform: 'translateY(-2px)',
  },
}));

// Enhanced text field with vault styling
export const VaultTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    background: theme.palette.background.paper,
    backdropFilter: 'blur(10px)',
    borderRadius: (theme.shape.borderRadius as number) * 1.5,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      background: theme.palette.action.hover,
    },
    '&.Mui-focused': {
      background: theme.palette.action.hover,
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
  },
}));

// Progress indicator for vault actions
export const VaultProgress = styled(CircularProgress)(({ theme }) => ({
  color: 'var(--status-warning)',
  '& .MuiCircularProgress-circle': {
    strokeLinecap: 'round',
  },
}));

// Status chip variants
export const StatusChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'status',
})<{ status?: 'success' | 'warning' | 'error' | 'info' }>(
  ({ theme, status = 'info' }) => {
    const variants = {
      success: {
        background: 'var(--status-success)',
        color: 'var(--text-inverse)',
      },
      warning: {
        background: 'var(--status-warning)',
        color: 'var(--text-inverse)',
      },
      error: {
        background: 'var(--status-error)',
        color: 'var(--text-inverse)',
      },
      info: {
        background: 'var(--status-info)',
        color: 'var(--text-inverse)',
      },
    };

    return {
      ...variants[status],
      fontWeight: 'bold',
      fontSize: '0.75rem',
      height: 28,
      borderRadius: theme.shape.borderRadius,
      boxShadow: theme.shadows[2],
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: theme.shadows[4],
      },
    };
  }
);

// Header with vault branding
export const VaultHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  padding: theme.spacing(3),
  background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.1))',
  borderRadius: theme.spacing(2),
  border: '1px solid rgba(255, 215, 0, 0.2)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.1), transparent)',
    animation: 'shimmer 3s infinite',
  },
  '@keyframes shimmer': {
    '0%': { left: '-100%' },
    '100%': { left: '100%' },
  },
}));

// Section header with icon
export const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  '& h6': {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    fontWeight: theme.typography.fontWeightBold,
  },
}));

// Loading container with centered spinner
export const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '200px',
  gap: theme.spacing(2),
  color: theme.palette.text.secondary,
}));

// Error container with retry button
export const ErrorContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(3),
  textAlign: 'center',
}));

// Progress bar container with vault styling
export const ProgressContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
  '& .MuiLinearProgress-root': {
    borderRadius: theme.shape.borderRadius,
    height: 8,
    background: theme.palette.action.hover,
  },
  '& .MuiLinearProgress-bar': {
    background: 'var(--status-warning)',
    borderRadius: theme.shape.borderRadius,
  },
}));

// Animated number counter
export const AnimatedNumber = styled(Box)(({ theme }) => ({
  fontFamily: theme.typography.fontFamily,
  fontWeight: theme.typography.fontWeightBold,
  fontSize: '2rem',
  color: 'var(--text-accent)',
  transition: 'all var(--animation-duration-slow) var(--animation-easing-smooth)',
  '&.updating': {
    transform: 'scale(1.1)',
  },
}));
