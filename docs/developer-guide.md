# SVMSeek Developer Setup Guide

## Prerequisites

### Required Software

- **Node.js**: v18.20.0 or later
- **Yarn**: v1.22.0 or later (recommended) or npm
- **Git**: Latest version
- **Modern Browser**: Chrome, Firefox, Safari, or Edge

### Development Environment

- **OS**: macOS, Linux, or Windows
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 2GB free space for dependencies

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/openSVM/svmseek.git
cd svmseek
```

### 2. Install Dependencies

```bash
yarn install
# or
npm install
```

### 3. Start Development Server

```bash
yarn start
# or
npm start
```

The application will open at `http://localhost:3000`

### 4. Build for Production

```bash
yarn build
# or
npm run build
```

## Project Structure

```
svmseek/
├── src/
│   ├── components/
│   │   ├── Explorer/           # Explorer components
│   │   │   ├── ExplorerInterface.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── NetworkStats.tsx
│   │   │   ├── RecentBlocks.tsx
│   │   │   ├── TransactionList.tsx
│   │   │   └── index.ts
│   │   ├── ChatInterface.tsx   # AI Chat components
│   │   ├── GlassContainer.tsx  # Glass morphism container
│   │   └── ThemeToggle.tsx     # Theme switching
│   ├── pages/
│   │   └── Wallet/             # Main wallet interface
│   ├── utils/                  # Utility functions
│   ├── context/                # React context providers
│   └── types/                  # TypeScript type definitions
├── public/                     # Static assets
├── docs/                       # Documentation
├── extension/                  # Browser extension files
└── build/                      # Production build output
```

## Explorer Component Architecture

### Component Hierarchy

```
ExplorerInterface
├── SearchBar
│   ├── Search input with debouncing
│   ├── Results dropdown
│   └── Loading states
├── NetworkStats
│   ├── Statistics grid
│   ├── Progress indicators
│   └── Real-time updates
├── RecentBlocks
│   ├── Block list with auto-refresh
│   ├── Time formatting
│   └── Navigation hooks
└── TransactionList
    ├── Transaction feed
    ├── Status indicators
    └── Type categorization
```

### Data Flow

```
User Input → SearchBar → ExplorerInterface → Mock API → Results Display
                      ↓
Network Timer → Stats/Blocks/Transactions → Auto-refresh → UI Update
```

## Development Workflow

### Setting Up Your Environment

1. **Fork the repository** to your GitHub account
2. **Create a feature branch** from the main branch
3. **Make your changes** following the coding standards
4. **Test thoroughly** before submitting
5. **Create a pull request** with detailed description

### Branch Naming Convention

- `feature/explorer-enhancement` - New features
- `fix/search-bug` - Bug fixes
- `docs/api-update` - Documentation updates
- `refactor/component-cleanup` - Code refactoring

### Coding Standards

#### TypeScript

```typescript
// Use explicit interfaces
interface ComponentProps {
  isActive: boolean;
  onUpdate?: () => void;
}

// Use functional components with hooks
const Component: React.FC<ComponentProps> = ({ isActive, onUpdate }) => {
  // Implementation
};

// Export as default
export default Component;
```

#### Styling

```typescript
// Use MUI styled components
const StyledContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.08)',
  backdropFilter: 'blur(20px)',
  borderRadius: 16,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
}));
```

#### File Organization

- Components in PascalCase: `ExplorerInterface.tsx`
- Hooks in camelCase: `useExplorerData.ts`
- Utils in camelCase: `formatUtils.ts`
- Types in interfaces: `interface SearchResult {}`

## Testing

### Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test --watch

# Run tests with coverage
yarn test --coverage
```

### Test Structure

```typescript
// Component test example
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '../SearchBar';

describe('SearchBar', () => {
  it('should handle search input', () => {
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} />);
    
    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: 'test query' } });
    
    expect(onSearch).toHaveBeenCalledWith('test query');
  });
});
```

### E2E Testing Setup

```bash
# Install Playwright
yarn add -D @playwright/test

# Install browsers
npx playwright install

# Run E2E tests
yarn test:e2e
```

## Adding New Features

### Creating a New Explorer Component

1. **Create component file** in `src/components/Explorer/`
2. **Define TypeScript interfaces** for props and data
3. **Implement component** with MUI styling
4. **Add to index exports** in `src/components/Explorer/index.ts`
5. **Integrate with ExplorerInterface** if needed
6. **Write tests** for the component
7. **Update documentation**

### Example: Adding a New Statistics Card

```typescript
// src/components/Explorer/ValidatorStats.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

interface ValidatorStatsProps {
  validatorCount: number;
  averageStake: number;
}

const StatsCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.08)',
  borderRadius: 12,
  // Add styling...
}));

const ValidatorStats: React.FC<ValidatorStatsProps> = ({
  validatorCount,
  averageStake,
}) => {
  return (
    <StatsCard>
      <Typography variant="h6">Validator Statistics</Typography>
      <Typography>Count: {validatorCount}</Typography>
      <Typography>Avg Stake: {averageStake} SOL</Typography>
    </StatsCard>
  );
};

export default ValidatorStats;
```

## API Integration

### Current Mock Data

Components currently use mock data for development:

```typescript
// Mock data generation example
const generateMockTransactions = (): Transaction[] => {
  const types = ['Transfer', 'Swap', 'Stake'];
  return Array.from({ length: 10 }, (_, i) => ({
    signature: generateRandomSignature(),
    status: Math.random() > 0.05 ? 'success' : 'failed',
    type: types[Math.floor(Math.random() * types.length)],
    timestamp: new Date(Date.now() - i * 2000),
    fee: Math.random() * 0.01,
    slot: 323139497 - i,
    accounts: Math.floor(Math.random() * 8) + 2,
  }));
};
```

### Real API Integration

To integrate with real Solana RPC:

```typescript
import { Connection, clusterApiUrl } from '@solana/web3.js';

const connection = new Connection(clusterApiUrl('mainnet-beta'));

// Fetch real transaction data
const fetchRecentTransactions = async () => {
  try {
    const signatures = await connection.getRecentBlockhash();
    // Process real data...
  } catch (error) {
    console.error('API Error:', error);
    // Handle error...
  }
};
```

## Performance Optimization

### Code Splitting

```typescript
// Lazy load explorer components
const ExplorerInterface = lazy(() => import('./components/Explorer'));

// Use Suspense for loading states
<Suspense fallback={<LoadingSpinner />}>
  <ExplorerInterface />
</Suspense>
```

### Memoization

```typescript
// Memoize expensive calculations
const memoizedStats = useMemo(() => {
  return calculateNetworkStats(rawData);
}, [rawData]);

// Memoize callbacks
const handleSearch = useCallback((query: string) => {
  performSearch(query);
}, []);
```

### Virtualization

For large lists, consider using react-window:

```typescript
import { FixedSizeList as List } from 'react-window';

const TransactionList = ({ transactions }) => (
  <List
    height={400}
    itemCount={transactions.length}
    itemSize={80}
    itemData={transactions}
  >
    {TransactionRow}
  </List>
);
```

## Debugging

### Development Tools

- **React Developer Tools**: Browser extension for React debugging
- **Redux DevTools**: If using Redux for state management
- **Network Tab**: Monitor API calls and performance
- **Console Logging**: Use structured logging for debugging

### Common Issues

**Build Errors**
```bash
# Clear cache and reinstall
yarn cache clean
rm -rf node_modules yarn.lock
yarn install
```

**TypeScript Errors**
```bash
# Check types
yarn tsc --noEmit

# Fix common issues
yarn lint --fix
```

**Performance Issues**
- Check bundle size with `yarn analyze`
- Profile components with React DevTools
- Monitor memory usage in browser

## Deployment

### Production Build

```bash
# Create optimized build
yarn build

# Serve locally to test
yarn global add serve
serve -s build
```

### Environment Variables

Create `.env.local` for local development:

```bash
REACT_APP_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
REACT_APP_ENVIRONMENT=development
```

### Browser Extension

```bash
# Build extension packages
yarn build:extension-all

# Test in Chrome
# Load unpacked extension from extension/chrome/build/
```

## Contributing

### Pull Request Process

1. **Create feature branch** from main
2. **Implement changes** with tests
3. **Update documentation** if needed
4. **Run full test suite** and ensure it passes
5. **Submit pull request** with detailed description

### Code Review Guidelines

- Follow existing code patterns
- Include comprehensive tests
- Update documentation for new features
- Ensure backward compatibility
- Consider performance implications

### Release Process

1. **Version bump** in package.json
2. **Update CHANGELOG.md** with changes
3. **Create GitHub release** with release notes
4. **Deploy to production** environments
5. **Update extension stores** if applicable

## Resources

### Documentation
- [React Documentation](https://reactjs.org/docs)
- [Material-UI Documentation](https://mui.com/)
- [Solana Web3.js Documentation](https://solana-labs.github.io/solana-web3.js/)

### Tools
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [MUI Theme Creator](https://mui.com/customization/theming/)
- [Solana Explorer](https://explorer.solana.com/) for reference

### Community
- [Solana Discord](https://discord.gg/solana)
- [GitHub Discussions](https://github.com/openSVM/svmseek/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/solana)