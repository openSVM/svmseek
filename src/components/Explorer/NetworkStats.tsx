import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  TrendingUp,
  Speed,
  Group,
  AccountBalance,
  Timer,
  Receipt,
} from '@mui/icons-material';
import { GlassContainer } from '../GlassContainer';

const StatsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: theme.spacing(2),
}));

const StatCard = styled(GlassContainer)(({ theme }) => ({
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

const StatHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

const StatIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, rgba(103, 126, 234, 0.2), rgba(118, 75, 162, 0.2))',
  color: theme.palette.primary.main,
}));

const StatValue = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 700,
  fontFamily: 'monospace',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginBottom: theme.spacing(0.5),
}));

const StatLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
  fontWeight: 500,
}));

const ProgressContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
}));

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 6,
  borderRadius: 3,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  
  '& .MuiLinearProgress-bar': {
    borderRadius: 3,
    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
  },
}));

interface NetworkStatsData {
  blocksProcessed: number;
  activeValidators: number;
  tps: number;
  epoch: number;
  networkLoad: number;
  blockHeight: number;
  avgBlockTime: number;
  totalTransactions: number;
}

interface NetworkStatsProps {
  stats: NetworkStatsData;
}

const formatNumber = (num: number): string => {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(2) + 'B';
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(2) + 'M';
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(2) + 'K';
  }
  return num.toLocaleString();
};

const NetworkStats: React.FC<NetworkStatsProps> = ({ stats }) => {
  const {
    activeValidators,
    tps,
    epoch,
    networkLoad,
    blockHeight,
    avgBlockTime,
    totalTransactions,
  } = stats;

  const networkLoadColor = networkLoad > 0.8 ? 'error' : networkLoad > 0.6 ? 'warning' : 'success';

  const statItems = [
    {
      icon: <AccountBalance />,
      label: 'Block Height',
      value: formatNumber(blockHeight),
      suffix: '',
    },
    {
      icon: <Speed />,
      label: 'TPS',
      value: formatNumber(tps),
      suffix: '',
      chip: tps > 3000 ? 'High' : tps > 1000 ? 'Normal' : 'Low',
      chipColor: tps > 3000 ? 'success' : tps > 1000 ? 'primary' : 'warning',
    },
    {
      icon: <Group />,
      label: 'Active Validators',
      value: activeValidators.toLocaleString(),
      suffix: '',
    },
    {
      icon: <TrendingUp />,
      label: 'Current Epoch',
      value: epoch.toString(),
      suffix: '',
    },
    {
      icon: <Timer />,
      label: 'Avg Block Time',
      value: avgBlockTime.toFixed(1),
      suffix: 's',
    },
    {
      icon: <Receipt />,
      label: 'Total Transactions',
      value: formatNumber(totalTransactions),
      suffix: '',
    },
  ];

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6" fontWeight={600}>
          Network Statistics
        </Typography>
        <Chip
          label={`Load: ${(networkLoad * 100).toFixed(1)}%`}
          color={networkLoadColor}
          variant="outlined"
          size="small"
        />
      </Box>
      
      <StatsGrid>
        {statItems.map((item, index) => (
          <StatCard key={index}>
            <StatHeader>
              <StatIcon>
                {item.icon}
              </StatIcon>
              <StatLabel>{item.label}</StatLabel>
              {item.chip && (
                <Chip
                  label={item.chip}
                  size="small"
                  color={item.chipColor as any}
                  variant="outlined"
                />
              )}
            </StatHeader>
            <StatValue>
              {item.value}
              {item.suffix && (
                <Typography
                  component="span"
                  sx={{
                    fontSize: '1rem',
                    color: 'text.secondary',
                    marginLeft: 0.5,
                  }}
                >
                  {item.suffix}
                </Typography>
              )}
            </StatValue>
          </StatCard>
        ))}
      </StatsGrid>
      
      <ProgressContainer>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="body2" color="text.secondary">
            Network Load
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {(networkLoad * 100).toFixed(1)}%
          </Typography>
        </Box>
        <StyledLinearProgress
          variant="determinate"
          value={networkLoad * 100}
        />
      </ProgressContainer>
    </Box>
  );
};

export default NetworkStats;