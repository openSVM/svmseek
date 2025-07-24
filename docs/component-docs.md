# SVMSeek Explorer Component Documentation

## Component Library Overview

The SVMSeek Explorer is built with a modular component architecture using React, TypeScript, and Material-UI. All components follow consistent design patterns and include comprehensive prop interfaces.

## Core Components

### ExplorerInterface

**Purpose**: Main container component that orchestrates the entire explorer experience.

**Location**: `src/components/Explorer/ExplorerInterface.tsx`

**Props**:
```typescript
interface ExplorerInterfaceProps {
  isActive?: boolean; // Controls component visibility and active state
}
```

**Dependencies**:
- SearchBar
- NetworkStats  
- RecentBlocks
- TransactionList
- GlassContainer

**State Management**:
```typescript
const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
const [isLoading, setIsLoading] = useState(false);
```

**Key Features**:
- Responsive grid layout that adapts to screen size
- Centralized search result handling
- Glass morphism design with hover animations
- Fade-in animation when component becomes active

**Usage Example**:
```typescript
<ExplorerInterface isActive={activeTab === 'explorer'} />
```

**Styling**:
- Uses MUI styled components with theme integration
- Responsive breakpoints for mobile/tablet/desktop
- CSS Grid layout with automatic sizing
- Smooth transitions with cubic-bezier easing

---

### SearchBar

**Purpose**: Advanced search component with intelligent parsing and auto-suggestions.

**Location**: `src/components/Explorer/SearchBar.tsx`

**Props**:
```typescript
interface SearchBarProps {
  onSearch: (query: string) => void;           // Callback when search is executed
  searchResults?: SearchResult[] | null;      // Results to display
  onResultClick?: (result: SearchResult) => void; // Callback when result is clicked
  isLoading?: boolean;                         // Show loading spinner
}
```

**Search Result Interface**:
```typescript
interface SearchResult {
  type: string;           // 'transaction' | 'account' | 'block' | 'search'
  id: string;            // Unique identifier
  title: string;         // Display title
  status?: string;       // Transaction status
  balance?: string;      // Account balance
  tokens?: number;       // Token count
  transactions?: number; // Transaction count for blocks
  timestamp?: Date;      // When event occurred
  slot?: number;         // Solana slot number
  description?: string;  // Additional description
}
```

**Features**:
- **Debounced input**: 300ms delay to prevent excessive API calls
- **Smart parsing**: Detects transaction signatures, addresses, and block numbers
- **Auto-complete**: Dropdown with search suggestions
- **Loading states**: Animated spinner during search
- **Clear functionality**: X button to clear input and results
- **Keyboard support**: Enter to search, Escape to clear

**Search Detection Logic**:
```typescript
// Transaction: 88-character base58 string
if (query.length === 88 || query.includes('transaction')) {
  // Handle transaction search
}

// Account: 44-character base58 string  
if (query.length === 44 || query.includes('account')) {
  // Handle account search
}

// Block: Numeric string
if (/^\d+$/.test(query) || query.includes('block')) {
  // Handle block search
}
```

**Styling Features**:
- Glass morphism input with backdrop blur
- Animated focus states with color transitions
- Hover effects with transform animations
- Results dropdown with slide-up animation
- Monospace font for technical identifiers

---

### NetworkStats

**Purpose**: Display real-time Solana network statistics with visual indicators.

**Location**: `src/components/Explorer/NetworkStats.tsx`

**Props**:
```typescript
interface NetworkStatsProps {
  stats: NetworkStatsData;
}

interface NetworkStatsData {
  blocksProcessed: number;    // Total blocks (unused in current display)
  activeValidators: number;   // Current active validators
  tps: number;               // Transactions per second
  epoch: number;             // Current epoch
  networkLoad: number;       // Load percentage (0-1)
  blockHeight: number;       // Latest block height
  avgBlockTime: number;      // Average block time in seconds
  totalTransactions: number; // Total network transactions
}
```

**Statistics Displayed**:

1. **Block Height**
   - Latest block number
   - Formatted with thousands separators
   - Updates in real-time

2. **TPS (Transactions Per Second)**
   - Current network throughput
   - Status indicators:
     - High (>3000): Green success chip
     - Normal (1000-3000): Blue primary chip  
     - Low (<1000): Orange warning chip

3. **Active Validators**
   - Number of participating validators
   - Indicates network decentralization

4. **Current Epoch**
   - Solana's consensus period
   - Typically 2-3 days duration

5. **Average Block Time**
   - Time between blocks in seconds
   - Solana targets ~400ms

6. **Total Transactions**
   - Cumulative network transactions
   - Formatted in K/M/B notation

**Network Load Indicator**:
```typescript
const networkLoadColor = networkLoad > 0.8 ? 'error' : 
                         networkLoad > 0.6 ? 'warning' : 'success';
```

**Visual Features**:
- Responsive grid layout with auto-fit columns
- Animated cards with hover effects
- Progress bar for network load
- Gradient text for values
- Icon-based visual hierarchy

---

### RecentBlocks

**Purpose**: Live feed of recently produced Solana blocks.

**Location**: `src/components/Explorer/RecentBlocks.tsx`

**State**:
```typescript
const [blocks, setBlocks] = useState<Block[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [isRefreshing, setIsRefreshing] = useState(false);
```

**Block Interface**:
```typescript
interface Block {
  number: number;      // Block number
  hash: string;        // Block hash (truncated for display)
  timestamp: Date;     // Block production time
  transactions: number;// Number of transactions in block
  size: number;        // Block size in bytes
  slot: number;        // Solana slot number
}
```

**Features**:
- **Auto-refresh**: Updates every 30 seconds
- **Manual refresh**: Clickable refresh button with spin animation
- **Loading states**: Skeleton placeholders during initial load
- **Time formatting**: "X seconds/minutes/hours ago" display
- **File size formatting**: Bytes converted to KB/MB
- **Click handlers**: Prepared for navigation to block details

**Mock Data Generation**:
```typescript
const generateMockBlocks = (): Block[] => {
  const now = new Date();
  return Array.from({ length: 10 }, (_, i) => ({
    number: 323139497 - i,
    hash: `${(323139497 - i).toString(16)}...${Math.random().toString(16).slice(2, 8)}`,
    timestamp: new Date(now.getTime() - i * 400), // 400ms per block
    transactions: Math.floor(Math.random() * 3000) + 500,
    size: Math.floor(Math.random() * 50000) + 10000,
    slot: 323139497 - i,
  }));
};
```

**Display Components**:
- Transaction count with receipt icon
- Time ago with clock icon  
- Block size with chip indicator
- Truncated hash in monospace font
- Hover effects with slide animation

---

### TransactionList

**Purpose**: Real-time feed of network transactions with detailed metadata.

**Location**: `src/components/Explorer/TransactionList.tsx`

**State**:
```typescript
const [transactions, setTransactions] = useState<Transaction[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [isRefreshing, setIsRefreshing] = useState(false);
```

**Transaction Interface**:
```typescript
interface Transaction {
  signature: string;    // 88-character transaction signature
  status: 'success' | 'failed'; // Transaction result
  type: string;        // Transaction category
  timestamp: Date;     // When transaction was processed
  fee: number;         // Transaction fee in SOL
  slot: number;        // Block slot number
  accounts: number;    // Number of accounts involved
  programId?: string;  // Main program ID (optional)
}
```

**Transaction Types**:
- **Transfer**: Basic SOL or token transfers
- **Swap**: DEX token exchanges
- **Stake**: Validator staking operations
- **Vote**: Validator consensus votes
- **Program Call**: Smart contract interactions
- **Token Create**: New token creation
- **NFT Mint**: Non-fungible token creation

**Features**:
- **Auto-refresh**: Updates every 45 seconds
- **Status indicators**: Success (green) / Failed (red) avatars
- **Fee tracking**: SOL amounts with 6 decimal precision
- **Type categorization**: Color-coded transaction types
- **Account counting**: Shows interaction complexity
- **Time formatting**: Relative time display

**Visual Elements**:
```typescript
// Status avatar with conditional styling
<StatusAvatar
  sx={{
    bgcolor: transaction.status === 'success' ? 'success.main' : 'error.main',
  }}
>
  {getStatusIcon(transaction.status)}
</StatusAvatar>

// Information chips with icons
<InfoChip
  icon={<TimeIcon />}
  label={formatTimeAgo(transaction.timestamp)}
  variant="outlined"
  size="small"
/>
```

---

## Shared Components

### GlassContainer

**Purpose**: Reusable container with glass morphism styling.

**Location**: `src/components/GlassContainer.tsx`

**Base Styling**:
```typescript
const GlassContainer = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.08)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 16,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.12)',
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
  },
}));
```

**Usage**: Extended by all explorer components for consistent glass morphism effects.

---

## Utility Functions

### Time Formatting

```typescript
const formatTimeAgo = (timestamp: Date): string => {
  const seconds = Math.floor((new Date().getTime() - timestamp.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};
```

### Number Formatting

```typescript
const formatNumber = (num: number): string => {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toLocaleString();
};
```

### File Size Formatting

```typescript
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};
```

---

## Animation System

### Transition Standards

All components use consistent timing:
```css
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

### Hover Effects

Standard hover transformation:
```css
&:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
}
```

### Loading Animations

Refresh button spin:
```css
animation: ${isRefreshing ? 'spin 1s linear infinite' : 'none'};

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

Slide-up results:
```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## Responsive Design

### Breakpoint System

```typescript
const ContentGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: theme.spacing(3),
  
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr', // Stack on mobile
  },
}));
```

### Mobile Optimizations

- Single column layouts on small screens
- Reduced padding and margins
- Touch-friendly button sizes
- Simplified information density

---

## Error Handling

### Component Error Boundaries

```typescript
const ComponentWithErrorHandling = () => {
  try {
    // Component logic
  } catch (error) {
    console.error('Component error:', error);
    return <ErrorFallback error={error} />;
  }
};
```

### Loading States

All data-fetching components include:
- Initial loading skeletons
- Refresh loading indicators  
- Error state displays
- Empty state messages

---

## Performance Considerations

### useCallback for Event Handlers

```typescript
const handleSearch = useCallback((query: string) => {
  // Search logic
}, [dependencies]);
```

### useMemo for Expensive Calculations

```typescript
const formattedData = useMemo(() => {
  return expensiveFormatting(rawData);
}, [rawData]);
```

### useEffect Dependencies

All effects properly declare dependencies:
```typescript
useEffect(() => {
  fetchData();
}, [fetchData]); // fetchData is wrapped in useCallback
```

---

## Testing Patterns

### Component Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import SearchBar from '../SearchBar';

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

test('handles search input correctly', () => {
  const onSearch = jest.fn();
  renderWithTheme(<SearchBar onSearch={onSearch} />);
  
  const input = screen.getByPlaceholderText(/search/i);
  fireEvent.change(input, { target: { value: 'test' } });
  
  expect(onSearch).toHaveBeenCalledWith('test');
});
```

### Mock Data Testing

```typescript
const mockStats = {
  activeValidators: 1000,
  tps: 2500,
  epoch: 400,
  networkLoad: 0.7,
  blockHeight: 150000000,
  avgBlockTime: 0.4,
  totalTransactions: 75000000000,
};

test('displays network stats correctly', () => {
  renderWithTheme(<NetworkStats stats={mockStats} />);
  
  expect(screen.getByText('1,000')).toBeInTheDocument();
  expect(screen.getByText('2,500')).toBeInTheDocument();
});
```

This component documentation provides comprehensive coverage of the explorer architecture, making it easy for developers to understand, maintain, and extend the codebase.