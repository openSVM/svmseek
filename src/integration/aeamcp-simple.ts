import { PublicKey, Connection } from '@solana/web3.js';

// Simplified types for the SVMSeek integration
export interface Agent {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  license: string;
  repository: string;
  documentation: string;
  tags: string[];
  category: string;
  contactInfo: string;
  socialLinks: string[];
  endpoint: string;
  chain: string;
  accountModel: string;
  runtimeVersion: string;
  dependencies: string[];
  capabilities: string[];
  owner: PublicKey;
  status: 'active' | 'inactive' | 'pending';
}

export interface MCPServer {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  license: string;
  repository: string;
  documentation: string;
  tags: string[];
  endpoint: string;
  supportedProtocols: string[];
  capabilities: string[];
  requirements: string[];
  configuration: string;
  owner: PublicKey;
  status: 'active' | 'inactive' | 'pending';
}

export interface SolanaAIRegistriesConfig {
  connection: Connection;
  wallet?: any;
  cluster?: 'devnet' | 'mainnet-beta' | 'testnet';
}

// Mock implementation for development
export class SolanaAIRegistriesClient {
  private connection: Connection;
  private wallet: any;
  
  constructor(connection: Connection, wallet?: any) {
    this.connection = connection;
    this.wallet = wallet;
  }
  
  async getAllAgents(): Promise<Agent[]> {
    // Mock data for demonstration
    return [
      {
        id: 'agent-1',
        name: 'DeFi Trading Agent',
        description: 'Autonomous agent for DeFi trading strategies',
        version: '1.0.0',
        author: 'DeFi Labs',
        license: 'MIT',
        repository: 'https://github.com/defi-labs/trading-agent',
        documentation: 'https://docs.defi-labs.com/trading-agent',
        tags: ['defi', 'trading', 'solana'],
        category: 'Finance',
        contactInfo: 'contact@defi-labs.com',
        socialLinks: ['https://twitter.com/defi_labs'],
        endpoint: 'https://api.defi-labs.com/agent',
        chain: 'Solana',
        accountModel: 'A2A',
        runtimeVersion: '2.0',
        dependencies: ['@solana/web3.js', 'jupiter-sdk'],
        capabilities: ['token-swapping', 'price-monitoring', 'portfolio-management'],
        owner: new PublicKey('11111111111111111111111111111112'),
        status: 'active' as const,
      },
      {
        id: 'agent-2',
        name: 'NFT Marketplace Agent',
        description: 'Agent for automated NFT trading and collection management',
        version: '0.9.0',
        author: 'NFT Collective',
        license: 'Apache-2.0',
        repository: 'https://github.com/nft-collective/marketplace-agent',
        documentation: 'https://docs.nft-collective.com',
        tags: ['nft', 'marketplace', 'automation'],
        category: 'NFT',
        contactInfo: 'team@nft-collective.com',
        socialLinks: ['https://twitter.com/nft_collective'],
        endpoint: 'https://api.nft-collective.com/agent',
        chain: 'Solana',
        accountModel: 'AEA',
        runtimeVersion: '1.8',
        dependencies: ['@metaplex-foundation/mpl-token-metadata'],
        capabilities: ['nft-trading', 'floor-monitoring', 'rarity-analysis'],
        owner: new PublicKey('11111111111111111111111111111113'),
        status: 'active' as const,
      }
    ];
  }
  
  async getAllMCPServers(): Promise<MCPServer[]> {
    // Mock data for demonstration
    return [
      {
        id: 'mcp-1',
        name: 'Solana Analytics MCP',
        description: 'MCP server providing Solana blockchain analytics and data',
        version: '2.1.0',
        author: 'Solana Analytics Team',
        license: 'MIT',
        repository: 'https://github.com/solana-analytics/mcp-server',
        documentation: 'https://docs.solana-analytics.com/mcp',
        tags: ['analytics', 'blockchain', 'data'],
        endpoint: 'https://mcp.solana-analytics.com',
        supportedProtocols: ['MCP/1.0', 'HTTP/REST'],
        capabilities: ['transaction-analysis', 'account-tracking', 'token-metrics'],
        requirements: ['api-key', 'rate-limiting'],
        configuration: '{"apiKey": "required", "rateLimit": "1000/hour"}',
        owner: new PublicKey('11111111111111111111111111111114'),
        status: 'active' as const,
      },
      {
        id: 'mcp-2',
        name: 'DeFi Protocol MCP',
        description: 'MCP server for DeFi protocol interactions and monitoring',
        version: '1.5.2',
        author: 'DeFi Protocol Labs',
        license: 'GPL-3.0',
        repository: 'https://github.com/defi-protocol/mcp-server',
        documentation: 'https://docs.defi-protocol.com/mcp',
        tags: ['defi', 'protocol', 'yield-farming'],
        endpoint: 'https://mcp.defi-protocol.com',
        supportedProtocols: ['MCP/1.0', 'WebSocket', 'GraphQL'],
        capabilities: ['yield-tracking', 'pool-monitoring', 'strategy-execution'],
        requirements: ['wallet-connection', 'governance-token'],
        configuration: '{"network": "mainnet", "slippage": "1%"}',
        owner: new PublicKey('11111111111111111111111111111115'),
        status: 'active' as const,
      }
    ];
  }
  
  async registerAgent(agent: Partial<Agent>): Promise<{ signature: string }> {
    // Mock registration
    console.log('Registering agent:', agent);
    return { signature: 'mock-signature-' + Date.now() };
  }
  
  async registerMCPServer(server: Partial<MCPServer>): Promise<{ signature: string }> {
    // Mock registration
    console.log('Registering MCP server:', server);
    return { signature: 'mock-signature-' + Date.now() };
  }
}

// Builder classes for construction
export class AgentBuilder {
  private agent: Partial<Agent> = {};
  
  setName(name: string) { this.agent.name = name; return this; }
  setDescription(description: string) { this.agent.description = description; return this; }
  setVersion(version: string) { this.agent.version = version; return this; }
  setAuthor(author: string) { this.agent.author = author; return this; }
  setLicense(license: string) { this.agent.license = license; return this; }
  setRepository(repository: string) { this.agent.repository = repository; return this; }
  setDocumentation(documentation: string) { this.agent.documentation = documentation; return this; }
  setTags(tags: string[]) { this.agent.tags = tags; return this; }
  setCategory(category: string) { this.agent.category = category; return this; }
  setContactInfo(contactInfo: string) { this.agent.contactInfo = contactInfo; return this; }
  setSocialLinks(socialLinks: string[]) { this.agent.socialLinks = socialLinks; return this; }
  setEndpoint(endpoint: string) { this.agent.endpoint = endpoint; return this; }
  setChain(chain: string) { this.agent.chain = chain; return this; }
  setAccountModel(accountModel: string) { this.agent.accountModel = accountModel; return this; }
  setRuntimeVersion(runtimeVersion: string) { this.agent.runtimeVersion = runtimeVersion; return this; }
  setDependencies(dependencies: string[]) { this.agent.dependencies = dependencies; return this; }
  setCapabilities(capabilities: string[]) { this.agent.capabilities = capabilities; return this; }
  
  build(): Partial<Agent> {
    return { ...this.agent };
  }
}

export class MCPServerBuilder {
  private server: Partial<MCPServer> = {};
  
  setName(name: string) { this.server.name = name; return this; }
  setDescription(description: string) { this.server.description = description; return this; }
  setVersion(version: string) { this.server.version = version; return this; }
  setAuthor(author: string) { this.server.author = author; return this; }
  setLicense(license: string) { this.server.license = license; return this; }
  setRepository(repository: string) { this.server.repository = repository; return this; }
  setDocumentation(documentation: string) { this.server.documentation = documentation; return this; }
  setTags(tags: string[]) { this.server.tags = tags; return this; }
  setEndpoint(endpoint: string) { this.server.endpoint = endpoint; return this; }
  setSupportedProtocols(protocols: string[]) { this.server.supportedProtocols = protocols; return this; }
  setCapabilities(capabilities: string[]) { this.server.capabilities = capabilities; return this; }
  setRequirements(requirements: string[]) { this.server.requirements = requirements; return this; }
  setConfiguration(configuration: string) { this.server.configuration = configuration; return this; }
  
  build(): Partial<MCPServer> {
    return { ...this.server };
  }
}