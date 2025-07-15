# SVMSeek Wallet

SVMSeek Wallet is a comprehensive Solana ecosystem application featuring a secure wallet, integrated blockchain explorer, AI chat capabilities, and multi-browser extension support.

## 🚀 Features

### 🔐 Secure Wallet
- **Multi-account support** with HD wallet derivation
- **Hardware wallet integration** (Ledger support)
- **Token management** for SPL tokens and NFTs
- **Transaction history** and activity monitoring
- **Send/receive functionality** with QR code support

### 🔍 Blockchain Explorer
- **Real-time search** across transactions, accounts, and blocks
- **Network statistics** with live TPS, validator count, and load metrics
- **Recent blocks feed** with automatic refresh
- **Transaction monitoring** with status indicators and type categorization
- **Smart query detection** for different Solana data types

### 🤖 AI Chat Interface
- **Multi-provider support**: OpenAI, Anthropic, OpenRouter, and local models
- **MCP (Model Context Protocol)** ready architecture
- **Provider switching** with real-time configuration
- **Conversation history** and context management
- **Extensible framework** for additional AI services

### 🌐 Multi-Browser Extensions
- **Chrome** (Manifest V3)
- **Firefox** (Manifest V2) 
- **Safari** (Manifest V2)
- **Edge** (Manifest V3)
- **Cross-platform build scripts** and distribution

### 📱 Progressive Web App (PWA)
- **Offline functionality** with service worker
- **Install prompts** with smart detection
- **Mobile-optimized** responsive design
- **Interactive onboarding** tutorial

### 🎨 Modern Design System
- **Glass morphism effects** with backdrop filters
- **Microanimations** and smooth transitions
- **Dark/light theme support** with persistent storage
- **Responsive layout** for all screen sizes

## 📖 Documentation

### User Guides
- **[User Guide](docs/user-guide.md)** - Complete guide for end users
- **[Explorer User Guide](docs/user-guide.md#using-the-search-feature)** - Blockchain explorer functionality

### Developer Documentation
- **[Developer Setup Guide](docs/developer-guide.md)** - Complete development environment setup
- **[API Documentation](docs/explorer-api.md)** - Technical API reference
- **[Component Documentation](docs/component-docs.md)** - Detailed component architecture

### Architecture
- **Component hierarchy** and data flow diagrams
- **State management** patterns and best practices
- **Integration points** with existing wallet infrastructure
- **Performance optimization** strategies

## 🛠️ Quick Start

### Prerequisites
- **Node.js** v18.20.0+
- **Yarn** v1.22.0+ (recommended) or npm
- **Modern browser** (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone https://github.com/openSVM/svmseek.git
cd svmseek

# Install dependencies
yarn install

# Start development server
yarn start
```

The application will open at `http://localhost:3000`

### Building for Production

```bash
# Create production build
yarn build

# Build browser extensions for all platforms
yarn build:extension-all

# Build specific browser extension
yarn build:extension-chrome
yarn build:extension-firefox
yarn build:extension-safari
yarn build:extension-edge
```

## 🧪 Testing

### Unit Tests
```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test --watch

# Run with coverage
yarn test --coverage
```

### E2E Tests
```bash
# Install Playwright browsers
yarn playwright:install

# Run all E2E tests
yarn test:e2e

# Run tests with UI
yarn test:e2e-ui

# Run tests in headed mode
yarn test:e2e-headed
```

### Test Coverage
- **Explorer functionality** - Search, navigation, real-time updates
- **Cross-browser compatibility** - Chrome, Firefox, Safari, Edge
- **Responsive design** - Mobile, tablet, desktop viewports
- **Accessibility** - Keyboard navigation, screen readers, ARIA
- **Performance** - Load times, animation smoothness, memory usage

## 🏗️ Architecture

### Component Structure
```
src/
├── components/
│   ├── Explorer/           # Blockchain explorer components
│   │   ├── ExplorerInterface.tsx
│   │   ├── SearchBar.tsx
│   │   ├── NetworkStats.tsx
│   │   ├── RecentBlocks.tsx
│   │   └── TransactionList.tsx
│   ├── ChatInterface.tsx   # AI chat integration
│   ├── GlassContainer.tsx  # Glass morphism container
│   └── ThemeToggle.tsx     # Theme switching
├── pages/
│   └── Wallet/             # Main wallet interface
├── utils/                  # Utility functions
└── context/               # React context providers
```

### Key Technologies
- **React 18** with hooks and concurrent features
- **Material-UI v6** for component library
- **TypeScript** for type safety
- **Styled Components** for CSS-in-JS
- **Solana Web3.js** for blockchain interaction
- **Playwright** for E2E testing

## 🔧 Development

### Adding New Features

1. **Fork the repository** and create a feature branch
2. **Follow the coding standards** documented in the developer guide
3. **Write comprehensive tests** for new functionality
4. **Update documentation** as needed
5. **Submit a pull request** with detailed description

### Explorer Component Development

The explorer is built with a modular architecture:

```typescript
// Example: Adding a new explorer component
import { styled } from '@mui/material/styles';
import { GlassContainer } from '../GlassContainer';

const NewComponent: React.FC<Props> = ({ data }) => {
  return (
    <GlassContainer>
      {/* Component implementation */}
    </GlassContainer>
  );
};
```

### Styling Guidelines

All components use the glass morphism design system:

```typescript
const StyledComponent = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.08)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 16,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
}));
```

## 🌟 Key Features in Detail

### Blockchain Explorer
- **Intelligent search parsing** - Automatically detects transaction signatures, account addresses, and block numbers
- **Real-time network metrics** - Live TPS, validator count, epoch information, and network load
- **Auto-refreshing feeds** - Recent blocks (30s) and transactions (45s) with manual refresh options
- **Responsive design** - Adaptive layouts for mobile, tablet, and desktop
- **Glass morphism UI** - Modern design with backdrop filters and smooth animations

### AI Chat Integration
- **Provider flexibility** - Switch between OpenAI, Anthropic, OpenRouter, and local models
- **MCP ready** - Built for Model Context Protocol integration
- **Real-time configuration** - Dynamic API key management and model selection
- **Conversation management** - History tracking and context preservation

### Multi-Browser Extensions
- **Universal compatibility** - Support for all major browsers
- **Automated builds** - Cross-platform build scripts for easy distribution
- **Manifest optimization** - Browser-specific manifest files for optimal compatibility

## 🚀 Deployment

### Production Deployment
```bash
# Build for production
yarn build

# Deploy to hosting service
yarn deploy
```

### Extension Store Distribution
```bash
# Build all extension packages
yarn build:extension-all

# Package files are created in:
# - extension/chrome/build/
# - extension/firefox/build/
# - extension/safari/build/
# - extension/edge/build/
```

## 🤝 Contributing

We welcome contributions! Please see our [Developer Guide](docs/developer-guide.md) for detailed information on:

- **Setting up your development environment**
- **Code style and conventions**
- **Testing requirements**
- **Pull request process**

### Areas for Contribution
- **Real Solana RPC integration** for live data
- **Advanced search features** with filters and sorting
- **Additional AI providers** and chat capabilities
- **Performance optimizations** and caching
- **Accessibility improvements**
- **Mobile app development** using React Native

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Website**: [svmseek.com](https://svmseek.com)
- **GitHub**: [github.com/openSVM/svmseek](https://github.com/openSVM/svmseek)
- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/openSVM/svmseek/issues)

## 🙏 Acknowledgments

- **OpenSVM** community for the explorer integration inspiration
- **Solana Foundation** for the robust blockchain infrastructure
- **Material-UI team** for the excellent component library
- **React team** for the powerful UI framework

---

Built with ❤️ by the SVMSeek team
