# Comprehensive All-Pages E2E Testing

This document describes the comprehensive E2E testing implementation for SVMSeek Wallet that covers every page and route in the application.

## Overview

The comprehensive E2E test suite (`e2e/comprehensive-all-pages.spec.ts`) provides complete coverage of all application pages with robust error handling, screenshot capture, and cross-browser testing.

## Pages Covered

### Main Application Routes
- **Landing/Welcome Page** (`/`) - Application entry point with onboarding
- **Create Wallet Page** (`/create_wallet`) - New wallet creation flow
- **Restore Wallet Page** (`/restore_wallet`) - Wallet restoration from seed phrase
- **Connect Popup Page** (`/connect_popup`) - DApp connection interface
- **Help Center Page** (`/help`) - User documentation and support
- **Surprise Vault Page** (`/vault`) - Surprise vault feature
- **Wallet Interface** (`/wallet`) - Main wallet dashboard

### Wallet Sub-routes
- `/wallet/send` - Send tokens interface
- `/wallet/receive` - Receive tokens interface  
- `/wallet/history` - Transaction history
- `/wallet/settings` - Wallet settings

### Error Handling
- 404 error pages
- Malformed route handling
- Security error recovery

## Test Categories

### 1. Page Load Testing
- Verifies each page loads without critical errors
- Validates basic page structure and content
- Captures screenshots for visual verification

### 2. UI Element Validation
- Checks for presence of key interactive elements
- Validates form fields and buttons
- Tests basic user interactions

### 3. Cross-Page Navigation
- Tests navigation between all main pages
- Verifies URL correctness after navigation
- Validates application state persistence

### 4. Responsive Design Testing
- Tests mobile viewport (375x667)
- Tests tablet viewport (768x1024)
- Tests desktop viewport (1920x1080)

### 5. Performance Validation
- Measures page load times
- Tests concurrent navigation
- Validates acceptable performance thresholds

### 6. Error Handling
- Tests 404 page behavior
- Validates graceful handling of malformed routes
- Ensures application stability under error conditions

## Running Tests

### Quick Commands
```bash
# Run all pages test suite
yarn test:all-pages

# Run quick validation (main page loads only)
yarn test:all-pages-quick

# Run with headed browser for debugging
npx playwright test e2e/comprehensive-all-pages.spec.ts --headed

# Run specific test categories
npx playwright test e2e/comprehensive-all-pages.spec.ts --grep "Page Load"
npx playwright test e2e/comprehensive-all-pages.spec.ts --grep "Responsive"
```

### Full Test Suite
```bash
# Run complete test suite with all browsers
npx playwright test e2e/comprehensive-all-pages.spec.ts --reporter=html

# Run against production environment
PLAYWRIGHT_BASE_URL=https://svmseek.com npx playwright test e2e/comprehensive-all-pages.spec.ts
```

## GitHub Actions Integration

### Automated Testing Workflow
The GitHub Actions workflow (`.github/workflows/all-pages-e2e-tests.yml`) provides:

- **Multi-browser testing** (Chromium, Firefox, WebKit)
- **Quick validation** for fast feedback
- **Production health checks** (when configured)
- **Screenshot collection** for visual verification
- **Test result consolidation** and reporting

### Workflow Triggers
- Push to main/master/develop branches
- Pull request creation/updates
- Manual workflow dispatch with environment selection

### Artifacts Generated
- HTML test reports
- Screenshot collections per browser
- Test result summaries
- Performance metrics

## Screenshot Collection

Screenshots are automatically captured for:
- Each main page load
- Error conditions
- Different viewport sizes
- Navigation states

Screenshots are saved to `/tmp/screenshots/` and uploaded as GitHub Actions artifacts.

## Error Handling Strategy

### LocalStorage Security Errors
The test suite includes robust handling for localStorage access errors that can occur in CI environments:

```typescript
async function clearAppState(page: Page) {
  try {
    await page.evaluate(() => {
      try {
        if (typeof Storage !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
        }
      } catch (e) {
        console.log('localStorage/sessionStorage not available:', e);
      }
    });
  } catch (error) {
    console.log('Error clearing app state:', error);
    // Continue anyway
  }
}
```

### Network and Timeout Handling
- Configurable timeouts for different environments
- Graceful degradation when pages load slowly
- Retry logic for flaky network conditions

## Performance Considerations

### Test Optimization
- Screenshot capture with error handling
- Parallel test execution where possible
- Efficient page load waiting strategies
- Resource cleanup between tests

### CI Environment
- Browser caching for faster subsequent runs
- Artifact retention policies to manage storage
- Timeout configurations for CI environments

## Maintenance

### Adding New Pages
To add tests for new pages:

1. Add new test describe block in the test file
2. Include basic page load test
3. Add specific functionality tests
4. Update this documentation

### Updating Existing Tests
When updating tests:
- Maintain backward compatibility
- Update screenshots if UI changes significantly
- Verify cross-browser compatibility
- Update timeout values if needed

## Troubleshooting

### Common Issues

1. **Page Load Timeouts**
   - Increase timeout values in test configuration
   - Check network connectivity in CI environment
   - Verify server startup in local testing

2. **Screenshot Failures**
   - Ensure `/tmp/screenshots/` directory exists
   - Check file permissions in CI environment
   - Verify browser capabilities for screenshot capture

3. **LocalStorage Errors**
   - Tests include error handling for localStorage access
   - No action needed - tests will continue gracefully

4. **Element Not Found**
   - Update selectors if UI elements change
   - Add fallback selectors for robustness
   - Consider page load timing issues

## Future Enhancements

### Planned Improvements
- Accessibility testing integration
- Visual regression testing
- API mocking for isolated testing
- Performance metrics collection
- User journey testing scenarios

### Integration Opportunities
- Integration with existing test suites
- API testing coordination
- Security testing alignment
- Performance monitoring integration