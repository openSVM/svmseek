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
  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
  color: '#000',
  fontWeight: 'bold',
  borderRadius: (theme.shape.borderRadius as number) * 3,
  textTransform: 'none',
  boxShadow: '0 8px 32px rgba(255, 215, 0, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    background: 'linear-gradient(135deg, #FFA500, #FFD700)',
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 40px rgba(255, 215, 0, 0.4)',
  },
  '&:disabled': {
    background: 'linear-gradient(135deg, #888, #666)',
    color: '#ccc',
    transform: 'none',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
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
  background: 'linear-gradient(135deg, #4ECDC4, #44B7B8)',
  color: '#fff',
  fontWeight: 'bold',
  borderRadius: (theme.shape.borderRadius as number) * 1.5,
  textTransform: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: 'linear-gradient(135deg, #44B7B8, #3BAEA3)',
    transform: 'translateY(-2px)',
  },
}));

// Danger button for destructive actions
export const DangerButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
  color: '#fff',
  fontWeight: 'bold',
  borderRadius: (theme.shape.borderRadius as number) * 1.5,
  textTransform: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: 'linear-gradient(135deg, #FF4757, #FF6B6B)',
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
  color: '#FFD700',
  '& .MuiCircularProgress-circle': {
    strokeLinecap: 'round',
  },
}));

// Status chip variants
export const StatusChip = styled(Chip)<{ status?: 'success' | 'warning' | 'error' | 'info' }>(
  ({ theme, status = 'info' }) => {
    const variants = {
      success: {
        background: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
        color: '#fff',
      },
      warning: {
        background: 'linear-gradient(135deg, #FF9800, #FFB74D)',
        color: '#fff',
      },
      error: {
        background: 'linear-gradient(135deg, #F44336, #EF5350)',
        color: '#fff',
      },
      info: {
        background: 'linear-gradient(135deg, #2196F3, #42A5F5)',
        color: '#fff',
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
    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
    borderRadius: theme.shape.borderRadius,
  },
}));

// Animated number counter
export const AnimatedNumber = styled(Box)(({ theme }) => ({
  fontFamily: theme.typography.fontFamily,
  fontWeight: theme.typography.fontWeightBold,
  fontSize: '2rem',
  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  '&.updating': {
    transform: 'scale(1.1)',
  },
}));