# Changelog

All notable changes to SVMSeek Wallet will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive CSS variables system for centralized theming
- Enhanced TypeScript typing throughout the codebase
- Route-level error boundaries for better error handling
- Improved PWA installation prompt with proper state management
- TODO comments for pending functionality implementation
- Better import organization and cleanup

### Changed
- Migrated glassmorphism styles to use CSS variables globally
- Improved WalletProviderContext with stricter TypeScript typing
- Enhanced onboarding flow state management
- Updated error boundaries to be more systematic and user-friendly

### Fixed
- Eliminated 'any' type usage in critical components
- Improved route component prop passing
- Enhanced PWA prompt dismissal and state reset logic
- Fixed TypeScript compilation errors

## [2.0.0] - 2024-01-15

### Added
- **Complete rebranding from "Aldrin" to "SVMSeek"**
  - Updated all UI text, logos, and branding elements
  - Changed package name from `cryptocurrencies-ai-wallet` to `svmseek-wallet`
  - Updated URLs from `*.aldrin.com` to `svmseek.com`
  - Renamed logo assets (`Aldrin.svg` → `SVMSeek.svg`)
  - Updated PWA and extension manifests
  - Updated social links and README

- **SVM-Pay Integration** (Cross-Network Payment Support)
  - Support for Solana, Sonic SVM, Eclipse, and S00N networks
  - Send payments across supported SVM networks
  - Generate payment requests with QR codes
  - Process payment URLs from external sources
  - Real-time network switching and configuration
  - Payment validation and error handling

- **AEA Network Integration** (Autonomous Economic Agents)
  - Complete agent registry for browsing and discovering AEA agents
  - MCP server discovery and registration
  - Interactive search and filtering capabilities
  - Builder patterns for easy agent/server registration
  - Pagination support for large agent lists
  - URL validation and security features

- **Mobile App Support**
  - Android APK build pipeline with GitHub Actions
  - Capacitor integration for native mobile app generation
  - Automated build workflow with debug and production variants
  - APK signing support for production releases
  - Mobile-optimized responsive design

- **Web3 Browser Enhancement**
  - Full-featured dApp browser with navigation controls
  - Secure wallet injection for dApp interaction
  - History management and bookmark support
  - Address bar with URL validation
  - Iframe security and message passing

- **Explorer Interface**
  - Real-time Solana blockchain data integration
  - Network statistics and performance metrics
  - Recent blocks and transactions display
  - Advanced search functionality (addresses, transactions, blocks)
  - Live data feeds replacing mock data

- **Enhanced Security**
  - Scrypt and Argon2 encryption provider support
  - Future-proof encryption with version migration
  - Improved wallet seed encryption abstraction
  - Input validation utilities with security patterns
  - URL sanitization to prevent malicious inputs

- **Developer Experience**
  - Comprehensive test coverage for all new components
  - Error boundaries with detailed error reporting
  - Centralized logging service for debugging
  - Animation constants for consistent UI timing
  - Glass morphism design system with utilities

### Changed
- **Major Dependency Upgrades**
  - React 16 → React 18 with new `createRoot` API
  - Material-UI v4 → MUI v6 with updated theme API
  - Node.js requirement updated from v14 to v20.18.0
  - All dependencies updated to latest stable versions
  - Added Craco for webpack configuration overrides

- **Breaking Changes Fixed**
  - Updated React 18 root rendering API in `src/index.tsx`
  - Fixed Material-UI theme API changes (`createMuiTheme` → `createTheme`, `type` → `mode`)
  - Added webpack polyfills for crypto, buffer, stream, and other Node.js modules
  - Fixed import paths and API changes for upgraded packages:
    - `bip32` v4: Updated to use `BIP32Factory` pattern
    - `qrcode.react` v4: Changed to named exports
    - `bs58`: Updated import patterns
  - Maintained React Router v5 compatibility to avoid extensive breaking changes

- **UI/UX Improvements**
  - Glass morphism design language throughout the application
  - Smooth animations and micro-interactions
  - Responsive design for mobile and desktop
  - Dark/light theme support with system preference detection
  - Loading states and skeleton screens for better perceived performance

### Technical Improvements
- **Build System**
  - Added `craco.config.js` for webpack polyfill configuration
  - GitHub Actions workflow for automated APK builds
  - Gradle caching and build optimization
  - Environment-specific build configurations

- **Code Quality**
  - TypeScript strict mode enabled
  - ESLint and Prettier configuration
  - Component testing with React Testing Library
  - Integration testing for critical user flows
  - Error boundary testing and validation

- **Performance**
  - Code splitting and lazy loading for routes
  - Optimized bundle sizes with webpack analysis
  - Memory management improvements
  - Reduced animation overhead with `prefers-reduced-motion` support

### Security
- **Wallet Security**
  - Enhanced encryption methods (Scrypt, Argon2)
  - Secure key derivation with multiple algorithm support
  - Version migration for encryption upgrades
  - Input validation and sanitization

- **Web3 Security**
  - Secure iframe communication patterns
  - Message validation for dApp interactions
  - URL sanitization to prevent XSS attacks
  - Content Security Policy implementation

### Fixed
- Webpack polyfill issues for browser compatibility
- Material-UI deprecation warnings
- React 18 compatibility issues
- Mobile responsiveness on various screen sizes
- Memory leaks in animation components
- Build errors with latest Node.js versions

### Known Issues
- Some minor build warnings with deprecated Material-UI APIs (`makeStyles` → styled components)
- Legacy `.js` files need TypeScript migration
- Test coverage could be improved for edge cases

### Migration Guide
For users upgrading from Aldrin v1.x:
1. All data and wallets are preserved during the rebrand
2. Update bookmarks from `*.aldrin.com` to `svmseek.com`
3. Re-install PWA if using the web app for updated branding
4. Mobile users should download the new APK from releases

### Dependencies
- React: ^18.2.0
- MUI: ^6.0.0
- TypeScript: ^4.9.5
- Node.js: >=20.18.0
- @solana/web3.js: ^1.87.6
- svm-pay: ^1.0.0

## [1.0.0] - 2023-12-01

### Added
- Initial release of Aldrin Wallet
- Basic Solana wallet functionality
- Token management and transfers
- DEX integration
- Material-UI based interface

### Features
- Seed phrase generation and import
- Multi-token support
- Transaction history
- Basic security features

---

## Versioning Strategy

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** version when making incompatible API changes
- **MINOR** version when adding functionality in a backwards compatible manner  
- **PATCH** version when making backwards compatible bug fixes

## Support

For questions about specific changes or migration help:
- Open an issue on [GitHub](https://github.com/openSVM/svmseek/issues)
- Visit our documentation at [docs.svmseek.com](https://docs.svmseek.com)
- Join our community discussions