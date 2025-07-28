import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { devLog, logDebug, logInfo, logWarn, logError  } from '../../../utils/logger';
import {
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Tooltip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  GetApp as ExportIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  SwapHoriz as SwapIcon,
  AccountBalance as StakeIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { TransactionRecord } from '../../../services/TransactionHistoryService';
import { MultiAccountManager } from '../../../services/MultiAccountManager';

const StyledActivityTable = styled.div<{ isActive?: boolean }>`
  width: calc(100% - 1rem);
  flex-direction: column;
  @media (max-width: 540px) {
    display: ${(props) => (props.isActive ? 'block' : 'none')};
  }
`;

const ActivityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid ${props => props.theme.palette?.divider || '#e0e0e0'};
`;

const FilterBar = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px;
  flex-wrap: wrap;
  align-items: center;
  background: ${props => props.theme.palette?.background?.paper || '#fff'};
  border-bottom: 1px solid ${props => props.theme.palette?.divider || '#e0e0e0'};
`;

const TransactionRow = styled(TableRow)<{ txType?: string }>`
  &:hover {
    background-color: ${props => props.theme.palette?.action?.hover || '#f5f5f5'};
  }
  
  & .type-indicator {
    width: 4px;
    height: 100%;
    background-color: ${props => {
      switch (props.txType) {
        case 'send': return '#f44336';
        case 'receive': return '#4caf50';
        case 'swap': return '#ff9800';
        case 'stake': return '#9c27b0';
        default: return '#666';
      }
    }};
  }
`;

const SyncStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 8px 16px;
  background: ${props => props.theme.palette?.info?.light || '#e3f2fd'};
  border-radius: 4px;
`;

interface ActivityTableProps {
  isActive?: boolean;
  multiAccountManager?: MultiAccountManager | null;
  walletId?: string;
}

const ActivityTable: React.FC<ActivityTableProps> = ({ 
  isActive = true, 
  multiAccountManager,
  walletId 
}) => {
  const muiTheme = useTheme();
  const { t } = useTranslation();
  
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    dateRange: '',
    minAmount: '',
    maxAmount: '',
  });

  useEffect(() => {
    if (multiAccountManager && walletId) {
      const loadTransactions = async () => {
        setIsLoading(true);
        try {
          const txns = multiAccountManager.getWalletTransactions(walletId);
          setTransactions(txns);
        } catch (error) {
          logError('Failed to load transactions:', error);
        } finally {
          setIsLoading(false);
        }
      };
      loadTransactions();
    }
  }, [multiAccountManager, walletId]);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...transactions];

      // Search filter
      if (filters.search) {
        const query = filters.search.toLowerCase();
        filtered = filtered.filter(tx =>
          tx.signature.toLowerCase().includes(query) ||
          tx.counterparty?.address.toLowerCase().includes(query) ||
          tx.counterparty?.name?.toLowerCase().includes(query) ||
          tx.metadata.memo?.toLowerCase().includes(query)
        );
      }

      // Type filter
      if (filters.type) {
        filtered = filtered.filter(tx => tx.type === filters.type);
      }

      // Status filter
      if (filters.status) {
        filtered = filtered.filter(tx => tx.status === filters.status);
      }

      // Amount filters
      if (filters.minAmount) {
        filtered = filtered.filter(tx => tx.amount >= parseFloat(filters.minAmount));
      }
      if (filters.maxAmount) {
        filtered = filtered.filter(tx => tx.amount <= parseFloat(filters.maxAmount));
      }

      // Date range filter
      if (filters.dateRange) {
        const now = new Date();
        let startDate: Date;
        
        switch (filters.dateRange) {
          case '24h':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case '7d':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30d':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(0);
        }
        
        filtered = filtered.filter(tx => new Date(tx.blockTime * 1000) >= startDate);
      }

      setFilteredTransactions(filtered);
    };
    
    applyFilters();
  }, [transactions, filters]);

  const handleSync = async () => {
    if (!multiAccountManager || !walletId) return;
    
    setIsLoading(true);
    setSyncProgress(0);
    
    try {
      const wallet = multiAccountManager.getState().wallets.find(w => w.id === walletId);
      if (wallet) {
        // This would need to be updated to use the sync method with progress callback
        await multiAccountManager.syncWalletHistory(walletId, wallet.publicKey);
        // Reload transactions after sync
        const txns = multiAccountManager.getWalletTransactions(walletId);
        setTransactions(txns);
      }
    } catch (error) {
      logError('Failed to sync transactions:', error);
    } finally {
      setIsLoading(false);
      setSyncProgress(0);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send': return <TrendingDownIcon color="error" />;
      case 'receive': return <TrendingUpIcon color="success" />;
      case 'swap': return <SwapIcon color="warning" />;
      case 'stake': return <StakeIcon color="secondary" />;
      default: return <SwapIcon />;
    }
  };

  const getStatusChip = (status: string) => {
    const colors = {
      confirmed: 'success',
      finalized: 'success',
      failed: 'error',
    } as const;

    return (
      <Chip
        label={status}
        color={colors[status as keyof typeof colors] || 'default'}
        size="small"
      />
    );
  };

  const formatAmount = (amount: number, type: string) => {
    const sign = type === 'receive' ? '+' : type === 'send' ? '-' : '';
    return `${sign}${amount.toFixed(4)}`;
  };

  const handleExport = async () => {
    if (!multiAccountManager) return;
    
    try {
      await multiAccountManager.exportSelectedWallets({
        format: 'csv',
        includeTransactions: true,
        includeMetadata: true,
        walletIds: walletId ? [walletId] : undefined,
      });
      setShowExportDialog(false);
    } catch (error) {
      logError('Export failed:', error);
    }
  };

  if (!multiAccountManager) {
    return (
      <StyledActivityTable isActive={isActive}>
        <Box p={3} textAlign="center">
          <Typography variant="h6" color="text.secondary">
            {t('activity.notAvailable')}
          </Typography>
        </Box>
      </StyledActivityTable>
    );
  }

  return (
    <StyledActivityTable isActive={isActive}>
      <ActivityHeader theme={muiTheme}>
        <Typography variant="h6">{t('activity.title')}</Typography>
        <Box display="flex" gap={1}>
          <Tooltip title={t('activity.refresh')}>
            <IconButton onClick={handleSync} disabled={isLoading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('activity.filter')}>
            <IconButton onClick={() => setShowFilters(!showFilters)}>
              <FilterIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('activity.export')}>
            <IconButton onClick={() => setShowExportDialog(true)}>
              <ExportIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </ActivityHeader>

      {isLoading && (
        <SyncStatus theme={muiTheme}>
          <Typography variant="body2">
            {t('activity.syncing')} {syncProgress > 0 && `${syncProgress.toFixed(0)}%`}
          </Typography>
          <LinearProgress 
            variant={syncProgress > 0 ? "determinate" : "indeterminate"}
            value={syncProgress}
            sx={{ flexGrow: 1 }}
          />
        </SyncStatus>
      )}

      {showFilters && (
        <FilterBar theme={muiTheme}>
          <TextField
            size="small"
            label={t('activity.search')}
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            InputProps={{
              startAdornment: <SearchIcon />,
            }}
            sx={{ minWidth: 200 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>{t('activity.type')}</InputLabel>
            <Select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <MenuItem value="">{t('activity.allTypes')}</MenuItem>
              <MenuItem value="send">{t('activity.send')}</MenuItem>
              <MenuItem value="receive">{t('activity.receive')}</MenuItem>
              <MenuItem value="swap">{t('activity.swap')}</MenuItem>
              <MenuItem value="stake">{t('activity.stake')}</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>{t('activity.status')}</InputLabel>
            <Select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <MenuItem value="">{t('activity.allStatuses')}</MenuItem>
              <MenuItem value="confirmed">{t('activity.confirmed')}</MenuItem>
              <MenuItem value="finalized">{t('activity.finalized')}</MenuItem>
              <MenuItem value="failed">{t('activity.failed')}</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>{t('activity.timeRange')}</InputLabel>
            <Select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
            >
              <MenuItem value="">{t('activity.allTime')}</MenuItem>
              <MenuItem value="24h">{t('activity.last24h')}</MenuItem>
              <MenuItem value="7d">{t('activity.last7d')}</MenuItem>
              <MenuItem value="30d">{t('activity.last30d')}</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            type="number"
            label={t('activity.minAmount')}
            value={filters.minAmount}
            onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
            sx={{ width: 120 }}
          />

          <TextField
            size="small"
            type="number"
            label={t('activity.maxAmount')}
            value={filters.maxAmount}
            onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
            sx={{ width: 120 }}
          />

          <Button
            variant="outlined"
            onClick={() => setFilters({
              search: '',
              type: '',
              status: '',
              dateRange: '',
              minAmount: '',
              maxAmount: '',
            })}
          >
            {t('activity.clearFilters')}
          </Button>
        </FilterBar>
      )}

      <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>{t('activity.type')}</TableCell>
              <TableCell>{t('activity.date')}</TableCell>
              <TableCell>{t('activity.amount')}</TableCell>
              <TableCell>{t('activity.status')}</TableCell>
              <TableCell>{t('activity.counterparty')}</TableCell>
              <TableCell>{t('activity.fee')}</TableCell>
              <TableCell>{t('activity.signature')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Box py={4}>
                    <Typography variant="body1" color="text.secondary">
                      {isLoading ? t('activity.loading') : t('activity.noTransactions')}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((tx) => (
                <TransactionRow key={tx.id} txType={tx.type}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <div className="type-indicator" />
                      {getTransactionIcon(tx.type)}
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {tx.type}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {format(new Date(tx.blockTime * 1000), 'MMM dd, yyyy HH:mm')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      color={tx.type === 'receive' ? 'success.main' : tx.type === 'send' ? 'error.main' : 'text.primary'}
                      fontWeight="medium"
                    >
                      {formatAmount(tx.amount, tx.type)} {tx.token?.symbol || 'SOL'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {getStatusChip(tx.status)}
                  </TableCell>
                  <TableCell>
                    {tx.counterparty ? (
                      <Box>
                        <Typography variant="body2">
                          {tx.counterparty.name || `${tx.counterparty.address.substring(0, 8)}...`}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {tx.fee.toFixed(6)} SOL
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={tx.signature}>
                      <Typography 
                        variant="body2" 
                        color="primary" 
                        sx={{ 
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          fontFamily: 'monospace'
                        }}
                        onClick={() => window.open(`https://explorer.solana.com/tx/${tx.signature}`, '_blank')}
                      >
                        {tx.signature.substring(0, 8)}...
                      </Typography>
                    </Tooltip>
                  </TableCell>
                </TransactionRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onClose={() => setShowExportDialog(false)}>
        <DialogTitle>{t('activity.exportTransactions')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {t('activity.exportDescription')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExportDialog(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleExport} variant="contained">
            {t('common.export')}
          </Button>
        </DialogActions>
      </Dialog>
    </StyledActivityTable>
  );
};

export default ActivityTable;
