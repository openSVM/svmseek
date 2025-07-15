import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  Paper,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from '@mui/material';
import {
  SmartToy as AgentIcon,
  Computer as MCPIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { useWallet } from '../../utils/wallet';
import { useConnection } from '../../utils/connection';
import { GlassContainer } from '../GlassContainer';
import { 
  SolanaAIRegistriesClient, 
  Agent, 
  MCPServer,
  AgentBuilder,
  MCPServerBuilder 
} from '../../integration/aeamcp-simple';

const RegistryContainer = styled(GlassContainer)`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 600px;
`;

const StyledCard = styled(Card)`
  background: ${props => props.theme?.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(255, 255, 255, 0.8)'} !important;
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme?.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.1)'};
  margin-bottom: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(139, 92, 246, 0.15);
  }
`;

const StyledTextField = styled(TextField)`
  .MuiOutlinedInput-root {
    background: ${props => props.theme?.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(255, 255, 255, 0.8)'};
    backdrop-filter: blur(10px);
  }
`;

const StatusChip = styled(Chip)`
  &.active {
    background: rgba(76, 175, 80, 0.2) !important;
    color: #4CAF50 !important;
    border: 1px solid rgba(76, 175, 80, 0.5) !important;
  }
  
  &.inactive {
    background: rgba(244, 67, 54, 0.2) !important;
    color: #F44336 !important;
    border: 1px solid rgba(244, 67, 54, 0.5) !important;
  }
`;

interface AEANetworkInterfaceProps {
  isActive: boolean;
}

export const AEANetworkInterface: React.FC<AEANetworkInterfaceProps> = ({ isActive }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [client, setClient] = useState<SolanaAIRegistriesClient | null>(null);
  const [loading, setLoading] = useState(false);
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
  
  // Form state for adding new items
  const [newAgentForm, setNewAgentForm] = useState({
    name: '',
    description: '',
    version: '',
    author: '',
    license: '',
    repository: '',
    documentation: '',
    tags: '',
    category: '',
    contactInfo: '',
    socialLinks: '',
    endpoint: '',
    chain: '',
    accountModel: '',
    runtimeVersion: '',
    dependencies: '',
    capabilities: '',
  });
  
  const [newMCPForm, setNewMCPForm] = useState({
    name: '',
    description: '',
    version: '',
    author: '',
    license: '',
    repository: '',
    documentation: '',
    tags: '',
    endpoint: '',
    supportedProtocols: '',
    capabilities: '',
    requirements: '',
    configuration: '',
  });

  const wallet = useWallet();
  const connection = useConnection();

  const initializeClient = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const clientInstance = new SolanaAIRegistriesClient(connection, wallet);
      setClient(clientInstance);
      
      // Load existing data
      await Promise.all([
        loadAgents(clientInstance),
        loadMCPServers(clientInstance)
      ]);
      
      setSuccess('Connected to AEA Network successfully');
    } catch (err) {
      setError(`Failed to initialize AEA Network: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [connection, wallet]);

  useEffect(() => {
    if (isActive && wallet?.publicKey) {
      initializeClient();
    }
  }, [isActive, wallet?.publicKey, initializeClient]);

  const loadAgents = async (clientInstance: SolanaAIRegistriesClient) => {
    try {
      const agentsList = await clientInstance.getAllAgents();
      setAgents(agentsList);
    } catch (err) {
      console.error('Failed to load agents:', err);
    }
  };

  const loadMCPServers = async (clientInstance: SolanaAIRegistriesClient) => {
    try {
      const mcpList = await clientInstance.getAllMCPServers();
      setMCPServers(mcpList);
    } catch (err) {
      console.error('Failed to load MCP servers:', err);
    }
  };

  const handleRegisterAgent = async () => {
    if (!client || !wallet?.publicKey) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const agentBuilder = new AgentBuilder()
        .setName(newAgentForm.name)
        .setDescription(newAgentForm.description)
        .setVersion(newAgentForm.version)
        .setAuthor(newAgentForm.author)
        .setLicense(newAgentForm.license)
        .setRepository(newAgentForm.repository)
        .setDocumentation(newAgentForm.documentation)
        .setTags(newAgentForm.tags.split(',').map(t => t.trim()))
        .setCategory(newAgentForm.category)
        .setContactInfo(newAgentForm.contactInfo)
        .setSocialLinks(newAgentForm.socialLinks.split(',').map(l => l.trim()))
        .setEndpoint(newAgentForm.endpoint)
        .setChain(newAgentForm.chain)
        .setAccountModel(newAgentForm.accountModel)
        .setRuntimeVersion(newAgentForm.runtimeVersion)
        .setDependencies(newAgentForm.dependencies.split(',').map(d => d.trim()))
        .setCapabilities(newAgentForm.capabilities.split(',').map(c => c.trim()));
      
      const agent = agentBuilder.build();
      await client.registerAgent(agent);
      
      setSuccess('Agent registered successfully!');
      setDialogOpen(false);
      resetAgentForm();
      loadAgents(client);
    } catch (err) {
      setError(`Failed to register agent: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterMCPServer = async () => {
    if (!client || !wallet?.publicKey) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const mcpBuilder = new MCPServerBuilder()
        .setName(newMCPForm.name)
        .setDescription(newMCPForm.description)
        .setVersion(newMCPForm.version)
        .setAuthor(newMCPForm.author)
        .setLicense(newMCPForm.license)
        .setRepository(newMCPForm.repository)
        .setDocumentation(newMCPForm.documentation)
        .setTags(newMCPForm.tags.split(',').map(t => t.trim()))
        .setEndpoint(newMCPForm.endpoint)
        .setSupportedProtocols(newMCPForm.supportedProtocols.split(',').map(p => p.trim()))
        .setCapabilities(newMCPForm.capabilities.split(',').map(c => c.trim()))
        .setRequirements(newMCPForm.requirements.split(',').map(r => r.trim()))
        .setConfiguration(newMCPForm.configuration);
      
      const mcpServer = mcpBuilder.build();
      await client.registerMCPServer(mcpServer);
      
      setSuccess('MCP Server registered successfully!');
      setDialogOpen(false);
      resetMCPForm();
      loadMCPServers(client);
    } catch (err) {
      setError(`Failed to register MCP server: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const resetAgentForm = () => {
    setNewAgentForm({
      name: '', description: '', version: '', author: '', license: '',
      repository: '', documentation: '', tags: '', category: '', contactInfo: '',
      socialLinks: '', endpoint: '', chain: '', accountModel: '', runtimeVersion: '',
      dependencies: '', capabilities: '',
    });
  };

  const resetMCPForm = () => {
    setNewMCPForm({
      name: '', description: '', version: '', author: '', license: '',
      repository: '', documentation: '', tags: '', endpoint: '', supportedProtocols: '',
      capabilities: '', requirements: '', configuration: '',
    });
  };

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredMCPServers = mcpServers.filter(server =>
    server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    server.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    server.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!isActive) return null;

  return (
    <RegistryContainer className="fade-in">
      <Box mb={3}>
        <Typography variant="h4" component="h2" gutterBottom>
          <AgentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          AEA Network
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Autonomous Economic Agent Registry & Model Context Protocol Servers
        </Typography>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Search and Add Bar */}
      <Box mb={3}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <StyledTextField
              fullWidth
              label="Search agents and MCP servers"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setDialogType('agent');
                    setDialogOpen(true);
                  }}
                  disabled={!wallet?.publicKey}
                >
                  Add Agent
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setDialogType('mcp');
                    setDialogOpen(true);
                  }}
                  disabled={!wallet?.publicKey}
                >
                  Add MCP
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>

      {/* Tabs */}
      <Box mb={3}>
        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab label={`Agents (${filteredAgents.length})`} icon={<AgentIcon />} />
          <Tab label={`MCP Servers (${filteredMCPServers.length})`} icon={<MCPIcon />} />
        </Tabs>
      </Box>

      {/* Agents Tab */}
      {activeTab === 0 && (
        <Box>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : filteredAgents.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <AgentIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" gutterBottom>
                No agents found
              </Typography>
              <Typography color="textSecondary" mb={2}>
                {searchQuery ? 'Try adjusting your search terms' : 'Be the first to register an agent!'}
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => {
                  setDialogType('agent');
                  setDialogOpen(true);
                }}
                disabled={!wallet?.publicKey}
              >
                Register Agent
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {filteredAgents.map((agent, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <StyledCard>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {agent.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            by {agent.author} • v{agent.version}
                          </Typography>
                        </Box>
                        <StatusChip 
                          label="Active" 
                          size="small" 
                          className="active"
                        />
                      </Box>
                      
                      <Typography variant="body2" paragraph>
                        {agent.description}
                      </Typography>
                      
                      <Box mb={2}>
                        {agent.tags.slice(0, 3).map((tag, tagIndex) => (
                          <Chip 
                            key={tagIndex} 
                            label={tag} 
                            size="small" 
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                        {agent.tags.length > 3 && (
                          <Chip 
                            label={`+${agent.tags.length - 3} more`} 
                            size="small" 
                            variant="outlined"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        )}
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="textSecondary">
                          {agent.chain} • {agent.category}
                        </Typography>
                        <Box>
                          <IconButton 
                            size="small"
                            onClick={() => {
                              setSelectedItem(agent);
                              setDialogOpen(true);
                            }}
                          >
                            <ViewIcon />
                          </IconButton>
                          {agent.repository && (
                            <IconButton 
                              size="small"
                              onClick={() => window.open(agent.repository, '_blank')}
                            >
                              <LinkIcon />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </StyledCard>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* MCP Servers Tab */}
      {activeTab === 1 && (
        <Box>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : filteredMCPServers.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <MCPIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" gutterBottom>
                No MCP servers found
              </Typography>
              <Typography color="textSecondary" mb={2}>
                {searchQuery ? 'Try adjusting your search terms' : 'Be the first to register an MCP server!'}
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => {
                  setDialogType('mcp');
                  setDialogOpen(true);
                }}
                disabled={!wallet?.publicKey}
              >
                Register MCP Server
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {filteredMCPServers.map((server, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <StyledCard>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {server.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            by {server.author} • v{server.version}
                          </Typography>
                        </Box>
                        <StatusChip 
                          label="Active" 
                          size="small" 
                          className="active"
                        />
                      </Box>
                      
                      <Typography variant="body2" paragraph>
                        {server.description}
                      </Typography>
                      
                      <Box mb={2}>
                        {server.tags.slice(0, 3).map((tag, tagIndex) => (
                          <Chip 
                            key={tagIndex} 
                            label={tag} 
                            size="small" 
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                        {server.tags.length > 3 && (
                          <Chip 
                            label={`+${server.tags.length - 3} more`} 
                            size="small" 
                            variant="outlined"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        )}
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="textSecondary">
                          {server.supportedProtocols.join(', ')}
                        </Typography>
                        <Box>
                          <IconButton 
                            size="small"
                            onClick={() => {
                              setSelectedItem(server);
                              setDialogOpen(true);
                            }}
                          >
                            <ViewIcon />
                          </IconButton>
                          {server.repository && (
                            <IconButton 
                              size="small"
                              onClick={() => window.open(server.repository, '_blank')}
                            >
                              <LinkIcon />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </StyledCard>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Registration/Details Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          {selectedItem ? 
            `${dialogType === 'agent' ? 'Agent' : 'MCP Server'} Details` :
            `Register New ${dialogType === 'agent' ? 'Agent' : 'MCP Server'}`
          }
        </DialogTitle>
        <DialogContent>
          {selectedItem ? (
            // Details view
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedItem.name}
              </Typography>
              <Typography variant="body1" paragraph>
                {selectedItem.description}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Version:</Typography>
                  <Typography variant="body2">{selectedItem.version}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Author:</Typography>
                  <Typography variant="body2">{selectedItem.author}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">License:</Typography>
                  <Typography variant="body2">{selectedItem.license}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Repository:</Typography>
                  <Typography variant="body2">
                    {selectedItem.repository ? (
                      <Button 
                        size="small" 
                        href={selectedItem.repository} 
                        target="_blank"
                        startIcon={<LinkIcon />}
                      >
                        View Repository
                      </Button>
                    ) : 'Not provided'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          ) : (
            // Registration form
            <Grid container spacing={2}>
              {dialogType === 'agent' ? (
                // Agent registration form
                <>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      fullWidth
                      label="Name"
                      value={newAgentForm.name}
                      onChange={(e) => setNewAgentForm({...newAgentForm, name: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      fullWidth
                      label="Version"
                      value={newAgentForm.version}
                      onChange={(e) => setNewAgentForm({...newAgentForm, version: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <StyledTextField
                      fullWidth
                      label="Description"
                      multiline
                      rows={3}
                      value={newAgentForm.description}
                      onChange={(e) => setNewAgentForm({...newAgentForm, description: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      fullWidth
                      label="Author"
                      value={newAgentForm.author}
                      onChange={(e) => setNewAgentForm({...newAgentForm, author: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      fullWidth
                      label="License"
                      value={newAgentForm.license}
                      onChange={(e) => setNewAgentForm({...newAgentForm, license: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <StyledTextField
                      fullWidth
                      label="Repository URL"
                      value={newAgentForm.repository}
                      onChange={(e) => setNewAgentForm({...newAgentForm, repository: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <StyledTextField
                      fullWidth
                      label="Tags (comma-separated)"
                      value={newAgentForm.tags}
                      onChange={(e) => setNewAgentForm({...newAgentForm, tags: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      fullWidth
                      label="Category"
                      value={newAgentForm.category}
                      onChange={(e) => setNewAgentForm({...newAgentForm, category: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      fullWidth
                      label="Chain"
                      value={newAgentForm.chain}
                      onChange={(e) => setNewAgentForm({...newAgentForm, chain: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <StyledTextField
                      fullWidth
                      label="Endpoint URL"
                      value={newAgentForm.endpoint}
                      onChange={(e) => setNewAgentForm({...newAgentForm, endpoint: e.target.value})}
                    />
                  </Grid>
                </>
              ) : (
                // MCP Server registration form  
                <>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      fullWidth
                      label="Name"
                      value={newMCPForm.name}
                      onChange={(e) => setNewMCPForm({...newMCPForm, name: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      fullWidth
                      label="Version"
                      value={newMCPForm.version}
                      onChange={(e) => setNewMCPForm({...newMCPForm, version: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <StyledTextField
                      fullWidth
                      label="Description"
                      multiline
                      rows={3}
                      value={newMCPForm.description}
                      onChange={(e) => setNewMCPForm({...newMCPForm, description: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      fullWidth
                      label="Author"
                      value={newMCPForm.author}
                      onChange={(e) => setNewMCPForm({...newMCPForm, author: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      fullWidth
                      label="License"
                      value={newMCPForm.license}
                      onChange={(e) => setNewMCPForm({...newMCPForm, license: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <StyledTextField
                      fullWidth
                      label="Endpoint URL"
                      value={newMCPForm.endpoint}
                      onChange={(e) => setNewMCPForm({...newMCPForm, endpoint: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <StyledTextField
                      fullWidth
                      label="Supported Protocols (comma-separated)"
                      value={newMCPForm.supportedProtocols}
                      onChange={(e) => setNewMCPForm({...newMCPForm, supportedProtocols: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <StyledTextField
                      fullWidth
                      label="Tags (comma-separated)"
                      value={newMCPForm.tags}
                      onChange={(e) => setNewMCPForm({...newMCPForm, tags: e.target.value})}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            {selectedItem ? 'Close' : 'Cancel'}
          </Button>
          {!selectedItem && (
            <Button 
              variant="contained" 
              onClick={dialogType === 'agent' ? handleRegisterAgent : handleRegisterMCPServer}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : 'Register'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Connection Status */}
      <Box mt={3}>
        <Typography variant="caption" color="textSecondary">
          {wallet?.publicKey ? (
            <>Connected as {wallet.publicKey.toString().slice(0, 8)}... • {agents.length} agents • {mcpServers.length} MCP servers</>
          ) : (
            'Please connect your wallet to access AEA Network'
          )}
        </Typography>
      </Box>
    </RegistryContainer>
  );
};