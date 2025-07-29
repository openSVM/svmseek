# SVMSeek Wallet - Comprehensive E2E Tests

This directory contains comprehensive end-to-end tests for the SVMSeek Wallet that test the **real production version** without any mocking.

## 🎯 Test Coverage

### Complete User Flows
- ✅ **Onboarding Flow**: Language selection, theme selection, first-time setup
- ✅ **Wallet Creation**: Password validation, seed phrase generation, security setup
- ✅ **Wallet Restoration**: Seed phrase validation, wallet recovery, import process
- ✅ **Multi-Account Management**: Account groups, batch operations, portfolio management
- ✅ **Wallet Operations**: Send, receive, transaction history, balance checks
- ✅ **Explorer Functionality**: Network statistics, transaction search, real blockchain data

### Theme & Language Support
- ✅ **11 Themes**: E-Ink Grayscale, ASCII Terminal, Borland Blue, Paper White, Solarized Dark, Cyberpunk Pink, NY Times, Windows 95, Windows XP, macOS Aqua, Linux TUI
- ✅ **11 Languages**: English, Spanish, Russian, German, Japanese, Greek, Chinese, Thai, Korean, Sanskrit, Esperanto

### Responsive Design
- ✅ **6 Viewport Sizes**: Mobile Portrait, Mobile Landscape, Tablet Portrait, Tablet Landscape, Desktop, Large Desktop
- ✅ **Mobile-First**: Touch interactions, mobile navigation, gesture support
- ✅ **Accessibility**: ARIA labels, keyboard navigation, screen reader support

### Cross-Browser Compatibility
- ✅ **Chromium**: Full crypto operations, all features
- ✅ **Firefox**: WebCrypto API, storage operations
- ✅ **WebKit/Safari**: iOS Safari compatibility, mobile features

### Security & Reliability
- ✅ **Real Crypto Operations**: No mocking of cryptocurrency libraries
- ✅ **Network Failure Handling**: Offline scenarios, connection issues
- ✅ **Error Boundaries**: Graceful error handling, user feedback
- ✅ **Data Persistence**: LocalStorage, SessionStorage, IndexedDB

## 📁 Test Structure

```
e2e/
├── comprehensive-production.spec.ts  # Main comprehensive test suite
├── individual-pages.spec.ts         # Page-specific functionality tests  
├── cross-browser.spec.ts           # Browser compatibility tests
├── navigation.spec.ts              # Navigation and routing tests
├── explorer.spec.ts                # Explorer functionality tests
└── realnet-integration.spec.ts     # Real network integration tests
```

## 🚀 Running Tests

### Production Tests (Recommended)
```bash
# Run all comprehensive tests against production
npm run test:comprehensive

# Run specific test suites against production
npm run test:comprehensive-production
npm run test:individual-pages  
npm run test:cross-browser

# Run all production tests together
npm run test:production-all
```

### Focused Test Categories
```bash
# Test accessibility compliance
npm run test:accessibility

# Test responsive design
npm run test:responsive

# Test performance metrics
npm run test:performance
```

### Local Development Tests
```bash
# Run tests against local development server
npm run test:e2e

# Run with browser visible (debugging)
npm run test:e2e-headed

# Interactive test runner
npm run test:e2e-ui
```

### Real Network Tests
```bash
# Test with real Solana network data
npm run test:realnet

# Real network tests with browser visible
npm run test:realnet-headed
```

## 🎛️ Configuration

### Environment Variables
```bash
# Test against specific URL
export PLAYWRIGHT_BASE_URL="https://svmseek.com"

# Enable real network tests
export REALNET_TESTS="true"

# Set specific device for testing
export DEVICE_NAME="iPhone 12"
```

### Test Configuration
The tests are configured in `playwright.config.ts`:
- **Production URL**: `https://svmseek.com` (configurable via env var)
- **Timeout**: 30 seconds for production network calls
- **Retries**: 2 retries on CI, 0 locally
- **Browsers**: Chromium, Firefox, WebKit
- **Devices**: Desktop, tablet, mobile variants

## 📊 Test Reports

### HTML Reports
After running tests, view detailed HTML reports:
```bash
npx playwright show-report
```

### Screenshots
All test failures and key interactions are automatically captured:
- Saved to `/tmp/screenshots/`
- Uploaded as GitHub Actions artifacts
- Available in HTML reports

### Performance Metrics
Tests capture and validate:
- Page load times (< 15 seconds on production)
- DOM Content Loaded (< 10 seconds)
- First Paint / First Contentful Paint
- Memory usage patterns

## 🔧 GitHub Actions Integration

### Automated Testing
The comprehensive test suite runs automatically on:
- **Push to main/master**: Full test matrix
- **Pull Requests**: Comprehensive validation
- **Daily Schedule**: Production health checks
- **Manual Trigger**: On-demand testing

### Test Matrix
```yaml
Strategy:
  Browser: [chromium, firefox, webkit]  
  Shard: [1, 2, 3, 4]                  # Parallel execution
  Device: [iPhone 12, Pixel 5, iPad Pro, etc.]
```

### Artifacts
All test runs generate:
- ✅ HTML test reports
- ✅ Screenshot galleries  
- ✅ Performance metrics
- ✅ Error logs and debugging info
- ✅ Consolidated test summaries

## 🛡️ Quality Gates

### Production Readiness Criteria
All tests must pass for production deployment:

1. **Functionality**: All user flows work end-to-end
2. **Compatibility**: Works across all browsers and devices
3. **Performance**: Loads within acceptable time limits
4. **Accessibility**: Meets WCAG guidelines
5. **Internationalization**: All languages display correctly
6. **Theming**: All themes apply correctly
7. **Error Handling**: Graceful error recovery
8. **Security**: Real crypto operations function properly

### Test Coverage Requirements
- ✅ **100% of user-facing pages** tested
- ✅ **100% of critical user flows** validated
- ✅ **11/11 themes** verified
- ✅ **11/11 languages** tested
- ✅ **6/6 viewport sizes** covered
- ✅ **3/3 browsers** supported

## 🐛 Debugging Failed Tests

### Local Debugging
```bash
# Run specific test with browser visible
npx playwright test e2e/comprehensive-production.spec.ts --headed --grep "wallet creation"

# Debug mode with inspector
npx playwright test --debug

# Generate trace for analysis
npx playwright test --trace on
```

### CI/CD Debugging
1. **Download artifacts** from failed GitHub Actions run
2. **View HTML reports** in browser
3. **Examine screenshots** for visual issues
4. **Check console logs** in test output
5. **Analyze performance metrics** if available

## 📈 Performance Benchmarks

### Expected Performance (Production)
- **Initial Page Load**: < 15 seconds
- **DOM Content Loaded**: < 10 seconds  
- **First Contentful Paint**: < 5 seconds
- **Interactive Elements**: < 2 seconds response time
- **Theme Switching**: < 1 second
- **Navigation**: < 3 seconds between pages

### Memory Usage
- **Initial Load**: < 50MB JavaScript heap
- **After Navigation**: No significant memory leaks
- **Theme Switching**: Minimal memory impact
- **Long-running Sessions**: Stable memory usage

## 🔄 Continuous Improvement

### Test Maintenance
- **Weekly**: Review and update test assertions
- **Monthly**: Add new test scenarios for new features
- **Quarterly**: Performance benchmark updates
- **Per Release**: Full test suite validation

### Monitoring
- **Daily**: Automated production health checks
- **Real-time**: Error rate monitoring
- **Weekly**: Performance trend analysis
- **Monthly**: Cross-browser compatibility reports

---

## 🤝 Contributing

When adding new features to SVMSeek Wallet:

1. **Add E2E tests** for all new user-facing functionality
2. **Update existing tests** if UI/UX changes affect them
3. **Test all themes/languages** if changes affect styling/text
4. **Verify cross-browser compatibility** for new features
5. **Document test scenarios** in this README

### Test Writing Guidelines
- ✅ **No mocking**: Test real production functionality
- ✅ **User-focused**: Test from end-user perspective  
- ✅ **Comprehensive**: Cover happy path and edge cases
- ✅ **Reliable**: Avoid flaky tests with proper waits
- ✅ **Maintainable**: Use page objects and helpers
- ✅ **Documented**: Clear test descriptions and comments

---

*This comprehensive E2E test suite ensures SVMSeek Wallet delivers a high-quality, accessible, and secure experience across all supported platforms and devices.*