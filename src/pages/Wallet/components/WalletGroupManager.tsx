import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { logError  } from '../../../utils/logger';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  LinearProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Folder as FolderIcon,
  AccountBalance as WalletIcon,
  Group as GroupIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  Sync as SyncIcon,
  GetApp as ExportIcon,
  Upload as ImportIcon,
} from '@mui/icons-material';
import { WalletGroup, EnhancedWallet } from '../../../services/WalletGroupService';
import { ExportOptions } from '../../../services/ExportService';
import { MultiAccountManager } from '../../../services/MultiAccountManager';
import { useTranslation } from 'react-i18next';

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const GroupCard = styled(Card)<{ groupColor?: string }>`
  margin-bottom: 16px;
  border-left: 4px solid ${props => props.groupColor || '#666'};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
`;

const WalletCard = styled(Card)<{ isSelected?: boolean }>`
  margin-bottom: 8px;
  border: 2px solid ${props => props.isSelected ? '#007AFF' : 'transparent'};
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: #007AFF;
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled(Card)`
  text-align: center;
  padding: 16px;
`;

const ActionBar = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  align-items: center;
  flex-wrap: wrap;
`;

interface WalletGroupManagerProps {
  multiAccountManager: MultiAccountManager;
}

const WalletGroupManager: React.FC<WalletGroupManagerProps> = ({
  multiAccountManager,
}) => {
  const { t } = useTranslation();

  const [state, setState] = useState(multiAccountManager.getState());
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false);
  const [showImportWalletDialog, setShowImportWalletDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState<WalletGroup | null>(null);
  const [selectedView, setSelectedView] = useState<'groups' | 'wallets'>('groups');

  useEffect(() => {
    const unsubscribe = multiAccountManager.subscribe(setState);
    return unsubscribe;
  }, [multiAccountManager]);

  const handleCreateGroup = async (groupData: {
    name: string;
    description: string;
    color: string;
    icon: string;
    walletIds: string[];
  }) => {
    try {
      await multiAccountManager.createWalletGroup(groupData.name, {
        description: groupData.description,
        color: groupData.color,
        icon: groupData.icon,
        walletIds: groupData.walletIds,
      });
      setShowCreateGroupDialog(false);
    } catch (error) {
      logError('Failed to create group:', error);
    }
  };

  const handleImportWallet = async (walletData: {
    publicKey: string;
    name: string;
    groupIds: string[];
  }) => {
    try {
      const { PublicKey } = await import('@solana/web3.js');
      const publicKey = new PublicKey(walletData.publicKey);

      await multiAccountManager.importWallet(
        publicKey,
        walletData.name,
        'imported',
        walletData.groupIds
      );
      setShowImportWalletDialog(false);
    } catch (error) {
      logError('Failed to import wallet:', error);
    }
  };

  const handleExport = async (options: ExportOptions) => {
    try {
      if (state.selectedWallets.length > 0) {
        await multiAccountManager.exportSelectedWallets(options);
      } else if (state.selectedGroups.length > 0) {
        await multiAccountManager.exportSelectedGroups(options);
      } else {
        await multiAccountManager.exportAll(options);
      }
      setShowExportDialog(false);
    } catch (error) {
      logError('Export failed:', error);
    }
  };

  const handleWalletSelection = (walletId: string, selected: boolean) => {
    const selectedWallets = selected
      ? [...state.selectedWallets, walletId]
      : state.selectedWallets.filter(id => id !== walletId);

    multiAccountManager.selectWallets(selectedWallets);
  };

  const handleGroupSelection = (groupId: string, selected: boolean) => {
    const selectedGroups = selected
      ? [...state.selectedGroups, groupId]
      : state.selectedGroups.filter(id => id !== groupId);

    multiAccountManager.selectGroups(selectedGroups);
  };

  const handleBatchOperation = async (operation: string) => {
    try {
      await multiAccountManager.executeBatchOperation(
        operation as any,
        {},
        {
          walletIds: state.selectedWallets,
          groupIds: state.selectedGroups,
        }
      );
    } catch (error) {
      logError('Batch operation failed:', error);
    }
  };

  const filteredWallets = multiAccountManager.getFilteredWallets();
  const filteredGroups = multiAccountManager.getFilteredGroups();
  const portfolioSummary = multiAccountManager.getPortfolioSummary();

  return (
    <Container>
      <Header>
        <Typography variant="h4">{t('multiAccount.title')}</Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateGroupDialog(true)}
            sx={{ mr: 1 }}
          >
            {t('multiAccount.createGroup')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<ImportIcon />}
            onClick={() => setShowImportWalletDialog(true)}
          >
            {t('multiAccount.importWallet')}
          </Button>
        </Box>
      </Header>

      {/* Statistics */}
      <StatsContainer>
        <StatCard>
          <Typography variant="h6">{portfolioSummary.totalWallets}</Typography>
          <Typography variant="body2">{t('multiAccount.totalWallets')}</Typography>
        </StatCard>
        <StatCard>
          <Typography variant="h6">{portfolioSummary.totalGroups}</Typography>
          <Typography variant="body2">{t('multiAccount.totalGroups')}</Typography>
        </StatCard>
        <StatCard>
          <Typography variant="h6">{portfolioSummary.totalBalance.toFixed(2)} SOL</Typography>
          <Typography variant="body2">{t('multiAccount.totalBalance')}</Typography>
        </StatCard>
        <StatCard>
          <Typography variant="h6">{portfolioSummary.totalTransactions}</Typography>
          <Typography variant="body2">{t('multiAccount.totalTransactions')}</Typography>
        </StatCard>
      </StatsContainer>

      {/* Action Bar */}
      <ActionBar>
        <Button
          variant={selectedView === 'groups' ? 'contained' : 'outlined'}
          startIcon={<GroupIcon />}
          onClick={() => setSelectedView('groups')}
        >
          {t('multiAccount.groups')}
        </Button>
        <Button
          variant={selectedView === 'wallets' ? 'contained' : 'outlined'}
          startIcon={<WalletIcon />}
          onClick={() => setSelectedView('wallets')}
        >
          {t('multiAccount.wallets')}
        </Button>

        {(state.selectedWallets.length > 0 || state.selectedGroups.length > 0) && (
          <>
            <Button
              startIcon={<ArchiveIcon />}
              onClick={() => handleBatchOperation('archive')}
            >
              {t('multiAccount.archive')}
            </Button>
            <Button
              startIcon={<UnarchiveIcon />}
              onClick={() => handleBatchOperation('unarchive')}
            >
              {t('multiAccount.unarchive')}
            </Button>
            <Button
              startIcon={<SyncIcon />}
              onClick={() => multiAccountManager.syncSelectedWallets()}
            >
              {t('multiAccount.sync')}
            </Button>
            <Button
              startIcon={<ExportIcon />}
              onClick={() => setShowExportDialog(true)}
            >
              {t('multiAccount.export')}
            </Button>
          </>
        )}
      </ActionBar>

      {/* Filters */}
      <FilterBar>
        <TextField
          label={t('multiAccount.search')}
          value={state.activeFilters.search}
          onChange={(e) => multiAccountManager.setFilters({ search: e.target.value })}
          size="small"
          sx={{ minWidth: 200 }}
        />

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>{t('multiAccount.type')}</InputLabel>
          <Select
            multiple
            value={state.activeFilters.type}
            onChange={(e) => multiAccountManager.setFilters({
              type: e.target.value as string[]
            })}
          >
            <MenuItem value="derived">{t('multiAccount.derived')}</MenuItem>
            <MenuItem value="imported">{t('multiAccount.imported')}</MenuItem>
            <MenuItem value="hardware">{t('multiAccount.hardware')}</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>{t('multiAccount.status')}</InputLabel>
          <Select
            multiple
            value={state.activeFilters.status}
            onChange={(e) => multiAccountManager.setFilters({
              status: e.target.value as string[]
            })}
          >
            <MenuItem value="active">{t('multiAccount.active')}</MenuItem>
            <MenuItem value="archived">{t('multiAccount.archived')}</MenuItem>
          </Select>
        </FormControl>
      </FilterBar>

      {/* Main Content */}
      {selectedView === 'groups' ? (
        <div>
          {filteredGroups.map((group) => (
            <GroupCard key={group.id} groupColor={group.color}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap={2}>
                    <FolderIcon  />
                    <div>
                      <Typography variant="h6">{group.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {group.description}
                      </Typography>
                      <Typography variant="caption">
                        {group.walletIds.length} {t('multiAccount.wallets')}
                      </Typography>
                    </div>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={state.selectedGroups.includes(group.id)}
                        onChange={(e) => handleGroupSelection(group.id, e.target.checked)}
                      />
                    }
                    label={t('multiAccount.select')}
                  />
                </Box>
              </CardContent>
              <CardActions>
                <IconButton onClick={() => setEditingGroup(group)}>
                  <EditIcon />
                </IconButton>
                <IconButton>
                  <DeleteIcon />
                </IconButton>
                <Button
                  size="small"
                  startIcon={<SyncIcon />}
                  onClick={() => {
                    // Sync group wallets
                  }}
                >
                  {t('multiAccount.sync')}
                </Button>
              </CardActions>
            </GroupCard>
          ))}
        </div>
      ) : (
        <div>
          {filteredWallets.map((wallet) => {
            const syncStatus = state.syncStatus.find(s => s.walletId === wallet.id);
            const isSelected = state.selectedWallets.includes(wallet.id);

            return (
              <WalletCard
                key={wallet.id}
                isSelected={isSelected}
                onClick={() => handleWalletSelection(wallet.id, !isSelected)}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={2}>
                      <WalletIcon />
                      <div>
                        <Typography variant="h6">{wallet.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {wallet.publicKey.toBase58().substring(0, 8)}...
                        </Typography>
                        <Typography variant="caption">
                          {wallet.metadata.balance.toFixed(2)} SOL • {wallet.metadata.transactionCount} txns
                        </Typography>
                      </div>
                    </Box>
                    <Box>
                      {wallet.groupIds.map(groupId => {
                        const group = state.groups.find(g => g.id === groupId);
                        return group ? (
                          <Chip
                            key={groupId}
                            label={group.name}
                            size="small"

                          />
                        ) : null;
                      })}
                    </Box>
                  </Box>

                  {syncStatus?.isSyncing && (
                    <Box mt={2}>
                      <Typography variant="caption">
                        {t('multiAccount.syncing')} {syncStatus.syncProgress.toFixed(0)}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={syncStatus.syncProgress}
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  )}
                </CardContent>
              </WalletCard>
            );
          })}
        </div>
      )}

      {/* Dialogs */}
      <CreateGroupDialog
        open={showCreateGroupDialog}
        onClose={() => setShowCreateGroupDialog(false)}
        onSubmit={handleCreateGroup}
        availableWallets={state.wallets}
      />

      <ImportWalletDialog
        open={showImportWalletDialog}
        onClose={() => setShowImportWalletDialog(false)}
        onSubmit={handleImportWallet}
        availableGroups={state.groups}
      />

      <ExportDialog
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onSubmit={handleExport}
        selectedWallets={state.selectedWallets}
        selectedGroups={state.selectedGroups}
      />

      {editingGroup && (
        <EditGroupDialog
          open={true}
          group={editingGroup}
          onClose={() => setEditingGroup(null)}
          onSubmit={(updatedGroup) => {
            // Handle group update
            setEditingGroup(null);
          }}
          availableWallets={state.wallets}
        />
      )}
    </Container>
  );
};

// Sub-components
const CreateGroupDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  availableWallets: EnhancedWallet[];
}> = ({ open, onClose, onSubmit, availableWallets }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#007AFF',
    icon: 'folder',
    walletIds: [] as string[],
  });

  const handleSubmit = () => {
    if (formData.name.trim()) {
      onSubmit(formData);
      setFormData({ name: '', description: '', color: '#007AFF', icon: 'folder', walletIds: [] });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{t('multiAccount.createGroup')}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label={t('multiAccount.groupName')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              type="color"
              label={t('multiAccount.color')}
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label={t('multiAccount.description')}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Grid>
          <Grid size={12}>
            <FormControl fullWidth>
              <InputLabel>{t('multiAccount.selectWallets')}</InputLabel>
              <Select
                multiple
                value={formData.walletIds}
                onChange={(e) => setFormData({ ...formData, walletIds: e.target.value as string[] })}
              >
                {availableWallets.map((wallet) => (
                  <MenuItem key={wallet.id} value={wallet.id}>
                    {wallet.name} ({wallet.publicKey.toBase58().substring(0, 8)}...)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button onClick={handleSubmit} variant="contained">
          {t('common.create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ImportWalletDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  availableGroups: WalletGroup[];
}> = ({ open, onClose, onSubmit, availableGroups }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    publicKey: '',
    name: '',
    groupIds: [] as string[],
  });

  const handleSubmit = () => {
    if (formData.publicKey.trim() && formData.name.trim()) {
      onSubmit(formData);
      setFormData({ publicKey: '', name: '', groupIds: [] });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{t('multiAccount.importWallet')}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={12}>
            <TextField
              fullWidth
              label={t('multiAccount.publicKey')}
              value={formData.publicKey}
              onChange={(e) => setFormData({ ...formData, publicKey: e.target.value })}
              placeholder="Enter Solana public key..."
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              label={t('multiAccount.walletName')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </Grid>
          <Grid size={12}>
            <FormControl fullWidth>
              <InputLabel>{t('multiAccount.assignToGroups')}</InputLabel>
              <Select
                multiple
                value={formData.groupIds}
                onChange={(e) => setFormData({ ...formData, groupIds: e.target.value as string[] })}
              >
                {availableGroups.map((group) => (
                  <MenuItem key={group.id} value={group.id}>
                    {group.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button onClick={handleSubmit} variant="contained">
          {t('common.import')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const EditGroupDialog: React.FC<{
  open: boolean;
  group: WalletGroup;
  onClose: () => void;
  onSubmit: (data: any) => void;
  availableWallets: EnhancedWallet[];
}> = ({ open, group, onClose, onSubmit, availableWallets }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: group.name,
    description: group.description || '',
    color: group.color,
    icon: group.icon,
    walletIds: group.walletIds,
  });

  const handleSubmit = () => {
    onSubmit({ ...group, ...formData });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{t('multiAccount.editGroup')}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label={t('multiAccount.groupName')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              type="color"
              label={t('multiAccount.color')}
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label={t('multiAccount.description')}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Grid>
          <Grid size={12}>
            <FormControl fullWidth>
              <InputLabel>{t('multiAccount.selectWallets')}</InputLabel>
              <Select
                multiple
                value={formData.walletIds}
                onChange={(e) => setFormData({ ...formData, walletIds: e.target.value as string[] })}
              >
                {availableWallets.map((wallet) => (
                  <MenuItem key={wallet.id} value={wallet.id}>
                    {wallet.name} ({wallet.publicKey.toBase58().substring(0, 8)}...)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button onClick={handleSubmit} variant="contained">
          {t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ExportDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (options: ExportOptions) => void;
  selectedWallets: string[];
  selectedGroups: string[];
}> = ({ open, onClose, onSubmit, selectedWallets, selectedGroups }) => {
  const { t } = useTranslation();
  const [options, setOptions] = useState<ExportOptions>({
    format: 'csv',
    includeTransactions: true,
    includeMetadata: true,
  });

  const handleSubmit = () => {
    onSubmit(options);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('multiAccount.exportData')}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={12}>
            <FormControl fullWidth>
              <InputLabel>{t('multiAccount.format')}</InputLabel>
              <Select
                value={options.format}
                onChange={(e) => setOptions({ ...options, format: e.target.value as any })}
              >
                <MenuItem value="csv">CSV</MenuItem>
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="xlsx">Excel</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={options.includeTransactions}
                  onChange={(e) => setOptions({ ...options, includeTransactions: e.target.checked })}
                />
              }
              label={t('multiAccount.includeTransactions')}
            />
          </Grid>
          <Grid size={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={options.includeMetadata}
                  onChange={(e) => setOptions({ ...options, includeMetadata: e.target.checked })}
                />
              }
              label={t('multiAccount.includeMetadata')}
            />
          </Grid>
          <Grid size={12}>
            <Typography variant="body2" color="text.secondary">
              {selectedWallets.length > 0 && `${selectedWallets.length} wallets selected`}
              {selectedGroups.length > 0 && `${selectedGroups.length} groups selected`}
              {selectedWallets.length === 0 && selectedGroups.length === 0 && 'All data will be exported'}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button onClick={handleSubmit} variant="contained">
          {t('common.export')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WalletGroupManager;
