/**
 * Shared styled components to avoid duplication
 * Consolidates common UI patterns across the application
 */
import { styled } from '@mui/material/styles';
import { 
  Box, 
  Card, 
  Button, 
  IconButton,
  Chip,
  LinearProgress,
  TextField,
} from '@mui/material';
import { GlassContainer } from '../components/GlassContainer';

/**
 * Common container patterns
 */
export const ContentContainer = styled(GlassContainer)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  padding: theme.spacing(3),
  overflow: 'auto',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
  },
}));

export const GridContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

export const FlexContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2),
}));

/**
 * Common card patterns
 */
export const InteractiveCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1) !important',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.2) !important',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
  },
}));

export const StatCard = styled(GlassContainer)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  
  '&:hover': {
    transform: 'translateY(-4px) scale(1.02)',
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.2)',
  },
}));

/**
 * Common button patterns
 */
export const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  textTransform: 'none',
  fontWeight: 600,
  padding: theme.spacing(1.5, 3),
  background: `linear-gradient(135deg, var(--interactive-primary) 0%, var(--interactive-secondary) 100%)`,
  color: 'var(--text-inverse)',
  border: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&:hover': {
    background: `linear-gradient(135deg, var(--interactive-hover) 0%, var(--interactive-active) 100%)`,
    transform: 'translateY(-2px)',
    boxShadow: 'var(--shadow-lg)',
  },
  
  '&:disabled': {
    background: 'var(--interactive-disabled)',
    color: 'rgba(255, 255, 255, 0.5)',
  },
}));

export const SecondaryButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  textTransform: 'none',
  fontWeight: 600,
  padding: theme.spacing(1.5, 3),
  background: 'rgba(255, 255, 255, 0.1)',
  color: theme.palette.primary.main,
  border: `1px solid ${theme.palette.primary.main}`,
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.2)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
  },
}));

export const GlassIconButton = styled(IconButton)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.2)',
    transform: 'scale(1.05)',
  },
}));

/**
 * Common chip patterns
 */
export const StatusChip = styled(Chip)(({ theme }) => ({
  fontSize: '0.75rem',
  height: 20,
  fontWeight: 600,
  '& .MuiChip-label': {
    padding: '0 6px',
  },
}));

export const CategoryChip = styled(Chip)(({ theme }) => ({
  borderRadius: 16,
  fontWeight: 600,
  fontSize: '0.875rem',
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.2)',
  },
}));

/**
 * Common progress patterns
 */
export const GlassLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 6,
  borderRadius: 3,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  
  '& .MuiLinearProgress-bar': {
    borderRadius: 3,
    background: `linear-gradient(90deg, var(--interactive-primary) 0%, var(--interactive-secondary) 100%)`,
  },
}));

/**
 * Common input patterns
 */
export const GlassTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.15)',
    },
    
    '&.Mui-focused': {
      background: 'rgba(255, 255, 255, 0.2)',
      boxShadow: '0 0 0 2px rgba(103, 126, 234, 0.3)',
    },
  },
}));

/**
 * Common layout patterns
 */
export const SectionContainer = styled(GlassContainer)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}));

export const HeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2),
}));

export const ContentGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: theme.spacing(3),
  flex: 1,
  minHeight: 0,
  
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
  },
}));

/**
 * Animation utilities
 */
export const SlideUpContainer = styled(Box)(() => ({
  animation: 'slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '@keyframes slideUp': {
    '0%': {
      opacity: 0,
      transform: 'translateY(30px)',
    },
    '100%': {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
}));

export const FadeInContainer = styled(Box)(() => ({
  animation: 'fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '@keyframes fadeIn': {
    '0%': {
      opacity: 0,
    },
    '100%': {
      opacity: 1,
    },
  },
}));

export const ScaleInContainer = styled(Box)(() => ({
  animation: 'scaleIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '@keyframes scaleIn': {
    '0%': {
      opacity: 0,
      transform: 'scale(0.8)',
    },
    '100%': {
      opacity: 1,
      transform: 'scale(1)',
    },
  },
}));

/**
 * Responsive utilities
 */
export const HideOnMobile = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}));

export const ShowOnMobile = styled(Box)(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.down('sm')]: {
    display: 'block',
  },
}));

export const ResponsiveGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: theme.spacing(2),
  
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));