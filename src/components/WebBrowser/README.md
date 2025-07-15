# SVMSeek Web3 Browser

## Overview

The SVMSeek Web3 Browser is a built-in browser that allows users to interact with Solana dApps directly within the wallet interface. It provides seamless wallet connectivity and supports all major Solana ecosystem applications.

## Features

### 🌐 Full Web Browser Experience
- Address bar with URL input and search functionality
- Navigation controls (back, forward, refresh, home)
- Browser history management
- Loading indicators and error handling

### 🔗 Wallet Integration
- Automatic wallet provider injection
- Solana wallet adapter compatibility
- Phantom wallet API compatibility
- Connection status indicators
- Security warnings for cross-origin restrictions

### 🏠 Popular dApp Shortcuts
Pre-configured shortcuts for major Solana dApps:

| Category | dApp | Description |
|----------|------|-------------|
| **DEX** | Jupiter | Swap Aggregator |
| **DEX** | Raydium | Automated Market Maker |
| **DEX** | Orca | User-friendly DEX |
| **DEX** | Phoenix | Order Book DEX |
| **NFT** | Magic Eden | NFT Marketplace |
| **NFT** | Tensor | NFT Trading Platform |
| **DeFi** | Marinade | Liquid Staking |
| **DeFi** | Kamino | Yield Optimization |
| **Lending** | Solend | Lending Protocol |
| **Trading** | Mango Markets | Leveraged Trading |
| **Portfolio** | Step Finance | Portfolio Manager |

### 🔒 Security Features
- Iframe sandboxing with controlled permissions
- Cross-origin security warnings
- Wallet connection status indicators
- External link opening in new tabs

## Technical Implementation

### Architecture
```
src/components/WebBrowser/
├── index.tsx              # Main browser component
├── WalletProvider.tsx     # Enhanced wallet provider for dApps
└── README.md             # This documentation
```

### Wallet Provider Injection
The browser automatically injects multiple wallet provider interfaces:

1. **Solana Standard Wallet Adapter**
   ```javascript
   window.solana = {
     name: 'SVMSeek',
     publicKey: wallet.publicKey,
     connected: true,
     connect: () => Promise<{ publicKey }>,
     disconnect: () => Promise<void>,
     signTransaction: (tx) => Promise<Transaction>,
     signAllTransactions: (txs) => Promise<Transaction[]>,
     signMessage: (msg) => Promise<{ signature }>
   }
   ```

2. **Phantom Compatibility**
   ```javascript
   window.phantom = { solana: window.solana }
   ```

3. **SVMSeek Specific**
   ```javascript
   window.svmseek = window.solana
   ```

### Events Dispatched
- `solana#initialized`
- `phantom#initialized`

## Usage

### Accessing the Browser
1. Navigate to the wallet interface
2. Click on the "Browser" tab (5th tab in the interface)
3. Choose from popular dApps or enter a custom URL

### Using dApps
1. Click on any dApp card to navigate directly
2. The wallet will be automatically connected if available
3. Transaction signing will prompt security warnings (not implemented in iframe for security)

### Navigation
- **Address Bar**: Type URLs or search terms
- **Back/Forward**: Navigate through browsing history
- **Refresh**: Reload current page
- **Home**: Return to dApp directory
- **External Link**: Open current page in new browser tab

## Security Considerations

### Cross-Origin Restrictions
Due to browser security policies, wallet injection may be blocked on some sites. Users will see appropriate warnings when this occurs.

### Transaction Signing
For security reasons, transaction signing within iframes is restricted. Users are advised to use external wallets for transaction signing or open dApps in new browser tabs.

### Iframe Sandboxing
The browser uses iframe sandboxing with these permissions:
- `allow-scripts`: Enable JavaScript execution
- `allow-same-origin`: Allow same-origin requests
- `allow-forms`: Enable form submissions
- `allow-popups`: Allow popup windows
- `allow-popups-to-escape-sandbox`: Allow popups to escape sandbox

## Development

### Adding New dApps
To add new dApps to the shortcuts, edit the `POPULAR_DAPPS` array in `index.tsx`:

```typescript
{
  name: 'Your dApp',
  description: 'Brief description',
  url: 'https://yourdapp.com',
  icon: '🔥',
  category: 'DeFi',
}
```

### Customizing Wallet Provider
The wallet provider can be extended in `WalletProvider.tsx` to support additional wallet APIs or custom functionality.

## Browser Compatibility

### Desktop
- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge

### Mobile
- ✅ Mobile browsers (responsive design)
- ✅ PWA installation support

## Limitations

1. **Transaction Signing**: Limited due to iframe security restrictions
2. **Local Storage**: May be isolated within iframe context
3. **Camera/Microphone**: Not accessible within iframe
4. **File Downloads**: May be restricted depending on browser

## Future Enhancements

- [ ] Enhanced transaction approval flow
- [ ] Bookmarks and favorites
- [ ] Private browsing mode
- [ ] Browser extensions support
- [ ] Custom themes for different dApps
- [ ] Enhanced search with dApp discovery
- [ ] QR code scanning for quick navigation

## Support

For issues or feature requests related to the Web3 browser, please open an issue in the main repository with the `web3-browser` label.