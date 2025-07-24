# SVMSeek Wallet - Browser Extensions

SVMSeek Wallet now supports all modern browsers with optimized extensions for each platform.

## Supported Browsers

- **Chrome** (Manifest V3)
- **Firefox** (Manifest V2) 
- **Safari** (Manifest V2)
- **Edge** (Manifest V3)

## Building Extensions

### Build All Extensions
```bash
yarn build:extension-all
```

This will create distribution-ready zip files for all supported browsers:
- `extension/svmseek-wallet-chrome.zip`
- `extension/svmseek-wallet-firefox.zip`
- `extension/svmseek-wallet-safari.zip`
- `extension/svmseek-wallet-edge.zip`

### Build Individual Browsers
```bash
# Chrome
yarn build:extension-chrome

# Firefox
yarn build:extension-firefox

# Safari
yarn build:extension-safari

# Edge
yarn build:extension-edge
```

## Browser-Specific Features

### Chrome & Edge (Manifest V3)
- Service Worker background scripts
- Modern permissions model
- Enhanced security features

### Firefox & Safari (Manifest V2)
- Traditional background scripts
- Broad compatibility
- Firefox-specific ID for addon validation

## Installation

### Chrome Web Store
1. Upload `svmseek-wallet-chrome.zip` to Chrome Web Store
2. Configure store listing and permissions
3. Submit for review

### Firefox Add-ons
1. Upload `svmseek-wallet-firefox.zip` to Firefox Add-ons
2. Include Firefox-specific metadata
3. Submit for review

### Safari App Store
1. Convert extension using Xcode
2. Upload to App Store Connect
3. Follow Safari extension guidelines

### Edge Add-ons
1. Upload `svmseek-wallet-edge.zip` to Edge Add-ons
2. Configure store listing
3. Submit for review

## Development

Extensions share core functionality with the web app but include additional features:
- Browser integration APIs
- Cross-origin request handling
- Native browser notifications
- Secure storage access

## Permissions

All extensions request minimal permissions:
- `activeTab` - Access to current tab
- `storage` - Local data storage
- `tabs` - Tab management
- Host permissions for Solana and SVMSeek domains

## Security

- Non-custodial architecture
- Local key storage
- Encrypted seed phrases
- Secure communication protocols