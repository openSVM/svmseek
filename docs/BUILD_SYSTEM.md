# SVMSeek Wallet Build System

This document describes the comprehensive build system for SVMSeek Wallet, which supports building for web, browser extensions, and mobile platforms.

## Quick Start

### Build Everything
```bash
# Build all platforms and create organized artifacts
./scripts/build-all-platforms.sh
```

### Build Individual Platforms
```bash
# Web application only
./scripts/build-web.sh

# Browser extensions only
./scripts/build-extensions.sh

# Mobile applications only
./scripts/build-mobile.sh
```

## Supported Platforms

### Web Application
- **Target**: Modern web browsers
- **Output**: Static files for web deployment
- **Build Command**: `./scripts/build-web.sh`
- **Artifacts**: `deploy_*/` directory and `.tar.gz` package

### Browser Extensions
- **Chrome**: Manifest V3 extension
- **Firefox**: Manifest V2 extension
- **Safari**: Manifest V2 extension  
- **Edge**: Manifest V3 extension
- **Build Command**: `./scripts/build-extensions.sh`
- **Artifacts**: `.zip` files for each browser

### Mobile Applications
- **Android**: APK and AAB files
- **iOS**: Not currently supported (requires macOS/Xcode)
- **Build Command**: `./scripts/build-mobile.sh`
- **Artifacts**: `.apk` and `.aab` files

## Build Scripts

### Primary Scripts

#### `./scripts/build-all-platforms.sh`
Comprehensive build script that:
- Builds web application
- Builds all browser extensions
- Builds Android application
- Creates organized artifact directory with timestamp
- Generates build information file
- Creates distribution package

#### `./scripts/build-web.sh`
Web-specific build that:
- Creates optimized production build
- Attempts master build variant
- Creates deployment-ready package
- Generates deployment documentation

#### `./scripts/build-extensions.sh`
Enhanced extension build that:
- Validates manifest files
- Builds for all supported browsers
- Creates distribution packages
- Provides detailed build information

#### `./scripts/build-mobile.sh`
Mobile-specific build that:
- Syncs Capacitor platforms
- Builds debug and release APKs
- Creates Android App Bundles (AAB)
- Checks for iOS platform availability

### Legacy Scripts (Still Available)
- `./build-extensions.sh` - Original extension build script
- Individual package.json scripts (see package.json)

## Package.json Scripts

```json
{
  "build": "craco build",
  "build:extension-enhanced": "./scripts/build-extensions.sh",
  "build:web-deploy": "./scripts/build-web.sh", 
  "build:mobile-all": "./scripts/build-mobile.sh",
  "build:all-platforms": "./scripts/build-all-platforms.sh"
}
```

## Artifact Organization

The build system creates organized artifacts with timestamps:

```
artifacts_YYYYMMDD_HHMMSS/
├── web/                          # Web application files
├── extensions/                   # Browser extension packages
│   ├── svmseek-wallet-chrome.zip
│   ├── svmseek-wallet-firefox.zip
│   ├── svmseek-wallet-safari.zip
│   └── svmseek-wallet-edge.zip
├── mobile/
│   └── android/                  # Android builds
│       ├── svmseek-wallet-debug.apk
│       └── svmseek-wallet-release.apk (if configured)
└── build-info.txt               # Build metadata and information
```

## Prerequisites

### General Requirements
- Node.js (version specified in `.nvmrc`)
- Yarn package manager
- Git

### Web Build
- No additional requirements

### Extension Build
- No additional requirements

### Mobile Build (Android)
- Java 17 (OpenJDK recommended)
- Android SDK (handled by Capacitor)
- Gradle (included in Android platform)

### Mobile Build (iOS) - Future Support
- macOS
- Xcode
- iOS SDK

## CI/CD Integration

The build system includes GitHub Actions workflow (`.github/workflows/build-all-platforms.yml`) that:

- Builds web application on every push
- Builds extensions for pull requests
- Builds mobile apps for releases
- Runs comprehensive tests
- Uploads artifacts with appropriate retention periods
- Attaches builds to GitHub releases

### Workflow Jobs

1. **build-web**: Builds and uploads web artifacts
2. **build-extensions**: Builds and uploads browser extensions
3. **build-android**: Builds and uploads Android applications
4. **build-all-platforms**: Complete build for releases
5. **test**: Runs unit tests and E2E tests

## Environment Variables

### Build Configuration
- `MASTER_BUILD`: Set to `TRUE` for master build variant
- `REALNET_TESTS`: Set to `true` for real network tests

### CI/CD
- `GITHUB_TOKEN`: For uploading release assets (provided by GitHub)

## Development Workflow

### Local Development
```bash
# Start development server
yarn start

# Run tests
yarn test
yarn test:e2e

# Build for testing
yarn build
```

### Testing Builds
```bash
# Test web build
./scripts/build-web.sh

# Test extensions
./scripts/build-extensions.sh

# Test everything
./scripts/build-all-platforms.sh
```

### Release Process
1. Create and push git tag
2. Create GitHub release
3. CI automatically builds and attaches artifacts
4. Manual testing of generated artifacts
5. Update store listings if needed

## Troubleshooting

### Common Issues

#### Android Build Fails
- Ensure Java 17 is installed
- Check Capacitor configuration
- Verify Android platform is properly initialized

#### Extension Build Issues
- Check manifest.json files in extension directories
- Ensure web build completed successfully
- Verify extension-specific files exist

#### Build Size Issues
- Use build-info.txt to identify large files
- Consider code splitting optimization
- Review bundle analyzer output

### Debug Information

Each build script provides detailed logging with color-coded status messages:
- **BLUE**: Information messages
- **GREEN**: Success messages  
- **YELLOW**: Warning messages
- **RED**: Error messages

## Performance Tips

### Optimizing Build Times
- Use `yarn install --frozen-lockfile` in CI
- Cache node_modules between builds
- Consider parallel builds for independent platforms

### Reducing Artifact Size
- Review large files listed in build-info.txt
- Enable proper compression for distribution
- Consider splitting large bundles

## Security Considerations

- Never commit signing keys or certificates
- Use environment variables for sensitive configuration
- Validate all build artifacts before distribution
- Ensure proper CSP headers for web deployment

## Support

For build system issues:
1. Check this documentation
2. Review build logs for specific error messages
3. Verify prerequisites are installed
4. Test with clean node_modules installation

## Future Enhancements

Planned improvements:
- iOS build support (requires macOS runner)
- Windows desktop application via Electron
- Linux desktop application via Electron
- Automated signing and publishing workflows
- Performance monitoring and optimization