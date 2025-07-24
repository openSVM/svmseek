# SVMSeek Explorer API Documentation

## Overview

The SVMSeek Explorer is a comprehensive blockchain explorer integration for the Solana ecosystem. It provides real-time network statistics, transaction monitoring, account exploration, and block analysis capabilities.

## Core Components

### ExplorerInterface

The main container component that orchestrates all explorer functionality.

```typescript
interface ExplorerInterfaceProps {
  isActive?: boolean; // Controls visibility of the explorer
}
```

**Features:**
- Real-time search across transactions, accounts, and blocks
- Network statistics dashboard
- Recent blocks and transactions feed
- Responsive grid layout with glass morphism design

### SearchBar

Advanced search component with intelligent query parsing and auto-suggestions.

```typescript
interface SearchBarProps {
  onSearch: (query: string) => void;
  searchResults?: SearchResult[] | null;
  onResultClick?: (result: SearchResult) => void;
  isLoading?: boolean;
}

interface SearchResult {
  type: string;           // 'transaction' | 'account' | 'block' | 'search'
  id: string;            // The identifier (signature, address, number)
  title: string;         // Human-readable title
  status?: string;       // Transaction status
  balance?: string;      // Account balance
  tokens?: number;       // Number of tokens
  transactions?: number; // Transaction count for blocks
  timestamp?: Date;      // When the item occurred
  slot?: number;         // Solana slot number
  description?: string;  // Additional description
}
```

**Search Capabilities:**
- **Transaction Signatures**: 88-character base58 strings
- **Account Addresses**: 44-character base58 strings  
- **Block Numbers**: Numeric identifiers
- **General Search**: Fallback for other queries

**Features:**
- Debounced search (300ms delay)
- Loading states with animations
- Auto-complete dropdown
- Keyboard navigation support
- Clear functionality

### NetworkStats

Real-time Solana network statistics display.

```typescript
interface NetworkStatsData {
  blocksProcessed: number;    // Total blocks processed
  activeValidators: number;   // Current active validators
  tps: number;               // Transactions per second
  epoch: number;             // Current epoch
  networkLoad: number;       // Load percentage (0-1)
  blockHeight: number;       // Latest block height
  avgBlockTime: number;      // Average block time in seconds
  totalTransactions: number; // Total network transactions
}
```

**Metrics Displayed:**
- Block Height
- Transactions Per Second (TPS) with status indicators
- Active Validators count
- Current Epoch
- Average Block Time
- Total Transactions
- Network Load with progress indicator

### RecentBlocks

Live feed of recently produced blocks.

```typescript
interface Block {
  number: number;      // Block number
  hash: string;        // Block hash (truncated for display)
  timestamp: Date;     // Block timestamp
  transactions: number;// Number of transactions in block
  size: number;        // Block size in bytes
  slot: number;        // Solana slot number
}
```

**Features:**
- Auto-refresh every 30 seconds
- Manual refresh capability
- Time ago formatting
- Transaction count per block
- Block size display
- Click to navigate (planned)

### TransactionList

Real-time transaction monitoring with detailed information.

```typescript
interface Transaction {
  signature: string;    // Transaction signature
  status: 'success' | 'failed'; // Transaction result
  type: string;        // Transaction type
  timestamp: Date;     // When transaction occurred
  fee: number;         // Transaction fee in SOL
  slot: number;        // Slot where transaction was included
  accounts: number;    // Number of accounts involved
  programId?: string;  // Main program ID (if applicable)
}
```

**Transaction Types:**
- Transfer
- Swap  
- Stake
- Vote
- Program Call
- Token Create
- NFT Mint

**Features:**
- Auto-refresh every 45 seconds
- Status indicators (success/failed)
- Fee tracking
- Account participation count
- Time ago formatting

## Styling System

### Glass Morphism Design

All components use a consistent glass morphism design language:

```css
background: rgba(255, 255, 255, 0.08);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.1);
border-radius: 16px;
```

### Animations

Smooth micro-animations enhance user experience:

```css
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

/* Hover effects */
&:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.12);
}
```

### Responsive Design

Mobile-first approach with breakpoints:
- Mobile: < 768px (single column)
- Tablet: 768px - 1024px (adapted layout)
- Desktop: > 1024px (full grid layout)

## Integration Points

### Wallet Integration

The explorer integrates seamlessly with the existing wallet:

```typescript
// In src/pages/Wallet/index.tsx
{activeTab === 'explorer' && (
  <div style={{ height: '100%', padding: '2rem 0' }} className="fade-in">
    <ExplorerInterface isActive={true} />
  </div>
)}
```

### Theme Integration

Uses existing MUI theme system with custom enhancements:

```typescript
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
```

### State Management

Currently uses local state with potential for integration with existing wallet state:

```typescript
const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
const [isLoading, setIsLoading] = useState(false);
```

## Future Enhancements

### Real API Integration

Replace mock data with actual Solana RPC calls:

```typescript
// Example: Real transaction fetching
const fetchRecentTransactions = async () => {
  const connection = new Connection(clusterApiUrl('mainnet-beta'));
  const signatures = await connection.getConfirmedSignaturesForAddress2(
    publicKey,
    { limit: 10 }
  );
  // Process signatures...
};
```

### Navigation

Implement detailed views for:
- Transaction details (`/transaction/:signature`)
- Account details (`/account/:address`)
- Block details (`/block/:number`)

### WebSocket Integration

Real-time updates via WebSocket:

```typescript
const ws = new WebSocket('wss://api.mainnet-beta.solana.com');
ws.onmessage = (event) => {
  // Handle real-time updates
};
```

### Performance Optimizations

- Virtual scrolling for large lists
- Data caching with expiration
- Pagination for search results
- Background data prefetching

## Error Handling

All components include comprehensive error handling:

```typescript
try {
  // API call
} catch (error) {
  console.error('Explorer error:', error);
  // Show user-friendly error message
}
```

## Accessibility

Components follow WCAG 2.1 guidelines:
- Keyboard navigation
- Screen reader support
- High contrast mode compatibility
- Focus management

## Testing Considerations

Key areas for testing:
- Search functionality across different input types
- Real-time data refresh mechanisms
- Responsive layout across devices
- Error states and loading states
- Theme integration and animations