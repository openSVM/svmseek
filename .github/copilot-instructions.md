# SVMSeek Wallet Development Instructions

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Bootstrap and Build
- Install dependencies: `yarn install --frozen-lockfile` -- takes 2.5 minutes. NEVER CANCEL. Set timeout to 10+ minutes.
- Build production: `yarn build` -- takes 1.5 minutes. NEVER CANCEL. Set timeout to 10+ minutes.
- Build extensions: `./scripts/build-extensions.sh` -- takes 2 seconds.
- Format code: `yarn fix:prettier` -- takes 1 second.

### Development Workflow
- Start development server: `yarn start` -- may take 2-3 minutes to fully compile. NEVER CANCEL. Set timeout to 10+ minutes.
- Test production build: `yarn global add serve && serve -s build -p 3001`
- Run unit tests: `yarn test --watchAll=false --coverage=false` -- takes 1.2 minutes. NEVER CANCEL. Set timeout to 5+ minutes.

### Browser Extensions
- Build all extensions: `./scripts/build-extensions.sh`
- Produces ZIP files for Chrome (v3), Firefox (v2), Safari (v2), Edge (v3)
- Extensions are ~3.3MB each and ready for store submission
- Extension builds require successful `yarn build` first

### E2E Testing
- Install browsers: `yarn playwright:install` -- takes 15 seconds. May show dependency warnings (normal in CI).
- Run E2E tests: `yarn test:e2e` -- may fail with localStorage issues in headless mode (known limitation)
- Use `yarn test:e2e-headed` for better compatibility

## Validation

- ALWAYS run through at least one complete end-to-end scenario after making changes.
- ALWAYS validate the production build works: `yarn build && serve -s build`
- Test the wallet interface at `/wallet` route to ensure core functionality works
- Browser extension builds should always succeed if main build succeeds
- Always run `yarn fix:prettier` before committing to maintain code style

## Platform Support

### Web Application
- Node.js v20.18.0+ required (check with `node --version`)
- Yarn v1.22.0+ recommended
- Builds successfully in 1.5 minutes
- Serves on localhost:3000 (dev) or any port with `serve -s build`

### Browser Extensions
- Chrome: Manifest V3, 3.3MB
- Firefox: Manifest V2, 3.3MB  
- Safari: Manifest V2, 3.3MB
- Edge: Manifest V3, 3.3MB
- Build time: 2 seconds

### Mobile (Android)
- Requires Java 17+ (current system has Java 17)
- Android build FAILS due to Java 21 requirement conflict
- DO NOT attempt Android builds - requires configuration fixes
- Script: `./scripts/build-mobile.sh` (will fail)

## Common Tasks

### Repository Structure
```
svmseek/
├── src/                    # React TypeScript source
│   ├── components/         # React components
│   │   ├── Explorer/       # Blockchain explorer components
│   │   ├── ChatInterface.tsx
│   │   └── GlassContainer.tsx
│   ├── pages/              # Page components
│   ├── utils/              # Utility functions
│   └── context/            # React context providers
├── public/                 # Static assets
├── docs/                   # Documentation
├── extension/              # Browser extension files
├── scripts/                # Build and utility scripts
├── e2e/                    # E2E test files
└── build/                  # Production build output
```

### Key Technologies
- React 19 with TypeScript
- Material-UI v7 for components
- Solana Web3.js for blockchain
- Styled Components for CSS-in-JS
- Playwright for E2E testing
- Capacitor for mobile (broken)

### File Listings

#### Root Directory
```
.github/           # GitHub Actions workflows
docs/              # Comprehensive documentation
extension/         # Browser extension source
scripts/           # Build automation scripts
src/               # Application source code
package.json       # Dependencies and scripts
yarn.lock          # Dependency lock file
.nvmrc             # Node version requirement (v20.18.0)
```

#### Package.json Scripts (Key Ones)
```json
{
  "start": "craco start",
  "build": "craco build", 
  "test": "craco test",
  "test:e2e": "npx playwright test --config=playwright.simple.config.ts",
  "fix:prettier": "prettier \"src/**/*.js\" \"extension/src/*.js\" --write",
  "build:extension-enhanced": "./scripts/build-extensions.sh"
}
```

## Known Issues

### E2E Tests
- May fail with localStorage access errors in headless mode
- Use `--headed` flag for better compatibility
- Advanced performance tests fail due to security restrictions

### Mobile Builds
- Android build fails due to Java version mismatch (requires Java 21, system has Java 17)
- DO NOT attempt mobile builds until configuration is fixed

### Development Server
- May take 2-3 minutes to fully start and serve content
- Wait for "Compiled successfully" message before testing
- Default port is 3000, may conflict with other services

## Build Outputs

### Successful Build Indicators
- Web build: ~3MB total bundle size, multiple chunk files
- Extension build: 4 ZIP files created (~3.3MB each)
- Unit tests: 93 passed, 17 skipped (normal)

### File Sizes (Typical)
- Main application bundle: ~3MB total
- Extension packages: ~3.3MB each
- Individual chunks: 1KB to 1.2MB range

## Debugging

### TypeScript Warnings
- Version warning for @typescript-eslint is normal (uses TS 5.9.2 vs supported 5.2.0)
- Does not affect functionality

### Bundle Size
- Large bundle size warnings are normal for crypto applications
- Consider code splitting if adding significant features

### Browser Compatibility
- Chrome: Full support
- Firefox: Full support  
- Safari: Full support
- Edge: Full support
- Mobile browsers: Supported via PWA

## Documentation References

- Main README: `README.md`
- Developer Guide: `docs/developer-guide.md`
- Build System: `docs/BUILD_SYSTEM.md`
- Mobile Building: `docs/MOBILE_BUILD.md`