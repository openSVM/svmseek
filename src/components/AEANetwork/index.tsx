import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Grid,
} from '@mui/material';
import {
  SmartToy as AgentIcon,
  Computer as MCPIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { PublicKey } from '@solana/web3.js';
import { useConnection } from '../../utils/connection';
import { GlassContainer } from '../GlassContainer';
import {
  SolanaAIRegistriesClient,
  Agent,
  MCPServer,
} from '../../integration/aeamcp-simple';

// Import new subcomponents
import { SearchBar } from './components/SearchBar';
import { AgentCard } from './components/AgentCard';
import { MCPServerCard } from './components/MCPServerCard';
import { AgentRegistrationForm } from './components/AgentRegistrationForm';
import { PaginationControls, usePagination } from './components/PaginationControls';
import ErrorBoundary from '../ErrorBoundary';

const RegistryContainer = styled(GlassContainer)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 600px;
`;

const TabPanel = styled(Box)`
  padding: 2rem 0;
`;

const AddButton = styled(Button)`
  background: rgba(139, 92, 246, 0.1) !important;
  border: 1px solid rgba(139, 92, 246, 0.3) !important;
  color: #A78BFA !important;

  &:hover {
    background: rgba(139, 92, 246, 0.2) !important;
    border-color: rgba(139, 92, 246, 0.5) !important;
  }
`;

interface AEANetworkInterfaceProps {
  isActive: boolean;
}

export const AEANetworkInterface: React.FC<AEANetworkInterfaceProps> = ({ isActive }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [client, setClient] = useState<SolanaAIRegistriesClient | null>(null);
  const [loading, setLoading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Registry data
  const [agents, setAgents] = useState<Agent[]>([]);
  const [mcpServers, setMCPServers] = useState<MCPServer[]>([]);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'agent' | 'mcp'>('agent');
  const [selectedItem, setSelectedItem] = useState<Agent | MCPServer | null>(null);

  const connection = useConnection();

  // Filter items based on search query
  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.capabilities?.some(cap => cap.toLowerCase().includes(searchQuery.toLowerCase())) ||
    agent.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredMCPServers = mcpServers.filter(server =>
    server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    server.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    server.supportedProtocols?.some(protocol => protocol.toLowerCase().includes(searchQuery.toLowerCase())) ||
    server.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination hooks
  const agentPagination = usePagination(filteredAgents, 12);
  const mcpPagination = usePagination(filteredMCPServers, 12);

  // Initialize client
  useEffect(() => {
    if (isActive && !client && connection) {
      const newClient = new SolanaAIRegistriesClient(connection);
      setClient(newClient);
      loadRegistryData(newClient);
    }
  }, [isActive, connection, client]);

  const loadRegistryData = async (clientInstance: SolanaAIRegistriesClient) => {
    setLoading(true);
    setError(null);

    try {
      // Mock data for demonstration
      const mockAgents: Agent[] = [
        {
          id: '1',
          name: 'Trading Assistant',
          description: 'AI agent specialized in cryptocurrency trading analysis and market insights',
          version: '1.0.0',
          author: 'OpenSVM',
          license: 'MIT',
          repository: 'https://github.com/example/trading-agent',
          documentation: 'https://docs.example.com/trading-agent',
          tags: ['trading', 'finance', 'AI'],
          category: 'Finance',
          contactInfo: 'support@example.com',
          socialLinks: ['https://twitter.com/example'],
          endpoint: 'https://api.example.com/trading-agent',
          chain: 'solana',
          accountModel: 'standard',
          runtimeVersion: '1.0',
          dependencies: ['@solana/web3.js'],
          capabilities: ['market analysis', 'price prediction', 'risk assessment'],
          owner: new PublicKey('11111111111111111111111111111111'),
          status: 'active'
        },
        {
          id: '2',
          name: 'DeFi Monitor',
          description: 'Monitors DeFi protocols and provides alerts for yield farming opportunities',
          version: '1.0.0',
          author: 'OpenSVM',
          license: 'MIT',
          repository: 'https://github.com/example/defi-monitor',
          documentation: 'https://docs.example.com/defi-monitor',
          tags: ['defi', 'monitoring', 'alerts'],
          category: 'DeFi',
          contactInfo: 'support@example.com',
          socialLinks: [],
          endpoint: '',
          chain: 'solana',
          accountModel: 'standard',
          runtimeVersion: '1.0',
          dependencies: [],
          capabilities: ['protocol monitoring', 'yield calculation', 'alert system'],
          owner: new PublicKey('11111111111111111111111111111111'),
          status: 'active'
        }
      ];

      const mockMCPServers: MCPServer[] = [
        {
          id: '1',
          name: 'Solana Price Oracle',
          description: 'MCP server providing real-time Solana ecosystem price data',
          version: '1.0.0',
          author: 'OpenSVM',
          license: 'MIT',
          repository: 'https://github.com/example/price-oracle',
          documentation: 'https://docs.example.com/price-oracle',
          tags: ['price', 'oracle', 'solana'],
          endpoint: 'https://api.example.com/mcp/price-oracle',
          supportedProtocols: ['MCP-1.0', 'REST'],
          capabilities: ['price feeds', 'historical data'],
          requirements: ['nodejs >= 16'],
          configuration: '{}',
          owner: new PublicKey('11111111111111111111111111111111'),
          status: 'active'
        }
      ];

      setAgents(mockAgents);
      setMCPServers(mockMCPServers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load registry data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleAddClick = () => {
    setDialogType(activeTab === 0 ? 'agent' : 'mcp');
    setSelectedItem(null);
    setDialogOpen(true);
  };

  const handleViewItem = (item: Agent | MCPServer) => {
    setSelectedItem(item);
    setDialogType('id' in item && 'capabilities' in item ? 'agent' : 'mcp');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedItem(null);
    setError(null);
    setSuccess(null);
  };

  const handleAgentSubmit = async (formData: any) => {
    setFormSubmitting(true);
    setError(null);

    try {
      // Simulate registration
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newAgent: Agent = {
        id: Date.now().toString(),
        ...formData,
        status: 'active'
      };

      setAgents(prev => [...prev, newAgent]);
      setSuccess('Agent registered successfully!');
      setDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register agent');
    } finally {
      setFormSubmitting(false);
    }
  };

  const renderAgentsTab = () => (
    <TabPanel role="tabpanel" aria-labelledby="agents-tab">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
          Autonomous Agents ({filteredAgents.length})
        </Typography>
        <AddButton
          startIcon={<AddIcon />}
          onClick={handleAddClick}
          aria-label="Register new agent"
        >
          Register Agent
        </AddButton>
      </Box>

      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search agents by name, description, or capabilities..."
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3} sx={{ marginTop: 2 }}>
            {agentPagination.paginatedItems.map((agent) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={agent.id}>
                <AgentCard agent={agent} onView={handleViewItem} />
              </Grid>
            ))}
          </Grid>

          {agentPagination.totalItems > 0 && (
            <Box sx={{ marginTop: 3 }}>
              <PaginationControls
                currentPage={agentPagination.currentPage}
                totalPages={agentPagination.totalPages}
                itemsPerPage={agentPagination.itemsPerPage}
                totalItems={agentPagination.totalItems}
                onPageChange={agentPagination.handlePageChange}
                onItemsPerPageChange={agentPagination.handleItemsPerPageChange}
                pageSizeOptions={[6, 12, 24, 48]}
              />
            </Box>
          )}

          {agentPagination.totalItems === 0 && !loading && (
            <Box sx={{ textAlign: 'center', padding: 4 }}>
              <AgentIcon sx={{ fontSize: 64, color: 'rgba(255, 255, 255, 0.3)', marginBottom: 2 }} />
              <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {searchQuery ? 'No agents found matching your search' : 'No agents registered yet'}
              </Typography>
            </Box>
          )}
        </>
      )}
    </TabPanel>
  );

  const renderMCPServersTab = () => (
    <TabPanel role="tabpanel" aria-labelledby="mcp-tab">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
          MCP Servers ({filteredMCPServers.length})
        </Typography>
        <AddButton
          startIcon={<AddIcon />}
          onClick={handleAddClick}
          aria-label="Register new MCP server"
        >
          Register Server
        </AddButton>
      </Box>

      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search MCP servers by name, description, or protocols..."
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3} sx={{ marginTop: 2 }}>
            {mcpPagination.paginatedItems.map((server) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={server.id}>
                <MCPServerCard server={server} onView={handleViewItem} />
              </Grid>
            ))}
          </Grid>

          {mcpPagination.totalItems > 0 && (
            <Box sx={{ marginTop: 3 }}>
              <PaginationControls
                currentPage={mcpPagination.currentPage}
                totalPages={mcpPagination.totalPages}
                itemsPerPage={mcpPagination.itemsPerPage}
                totalItems={mcpPagination.totalItems}
                onPageChange={mcpPagination.handlePageChange}
                onItemsPerPageChange={mcpPagination.handleItemsPerPageChange}
                pageSizeOptions={[6, 12, 24, 48]}
              />
            </Box>
          )}

          {mcpPagination.totalItems === 0 && !loading && (
            <Box sx={{ textAlign: 'center', padding: 4 }}>
              <MCPIcon sx={{ fontSize: 64, color: 'rgba(255, 255, 255, 0.3)', marginBottom: 2 }} />
              <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {searchQuery ? 'No MCP servers found matching your search' : 'No MCP servers registered yet'}
              </Typography>
            </Box>
          )}
        </>
      )}
    </TabPanel>
  );

  return (
    <ErrorBoundary context="AEANetworkInterface">
      <RegistryContainer>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, marginBottom: 3, textAlign: 'center' }}>
          AEA Network Registry
        </Typography>

        {error && (
          <Alert severity="error" sx={{ marginBottom: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ marginBottom: 3 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#A78BFA',
            },
            '& .MuiTab-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-selected': {
                color: '#A78BFA',
              },
            },
          }}
          aria-label="Registry tabs"
        >
          <Tab
            label="Agents"
            id="agents-tab"
            aria-controls="agents-tabpanel"
            icon={<AgentIcon />}
            iconPosition="start"
          />
          <Tab
            label="MCP Servers"
            id="mcp-tab"
            aria-controls="mcp-tabpanel"
            icon={<MCPIcon />}
            iconPosition="start"
          />
        </Tabs>

        {activeTab === 0 && renderAgentsTab()}
        {activeTab === 1 && renderMCPServersTab()}

        {/* Registration/Details Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              background: 'rgba(30, 30, 30, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          <DialogTitle sx={{ color: 'white' }}>
            {selectedItem ?
              `${dialogType === 'agent' ? 'Agent' : 'MCP Server'} Details` :
              `Register New ${dialogType === 'agent' ? 'Agent' : 'MCP Server'}`
            }
          </DialogTitle>
          <DialogContent>
            {!selectedItem && dialogType === 'agent' && (
              <AgentRegistrationForm
                onSubmit={handleAgentSubmit}
                isLoading={formSubmitting}
                onCancel={handleCloseDialog}
              />
            )}
            {selectedItem && (
              <Box sx={{ color: 'white', padding: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {selectedItem.name}
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedItem.description}
                </Typography>
                {/* Add more details display here */}
              </Box>
            )}
          </DialogContent>
          {selectedItem && (
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          )}
        </Dialog>
      </RegistryContainer>
    </ErrorBoundary>
  );
};
