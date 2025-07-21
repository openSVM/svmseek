# Mobile App Build Documentation

## Overview

SVMSeek Wallet can be built as a native Android APK using Capacitor, which wraps the React web application into a native mobile app.

## Prerequisites

- Node.js 18.20.0 or higher
- Java JDK 17
- Android SDK with API level 34
- Yarn package manager

## Local Development Setup

### 1. Install Dependencies

```bash
yarn install
```

### 2. Build Web Application

```bash
yarn build
```

### 3. Initialize Capacitor (first time only)

```bash
npx cap init "SVMSeek Wallet" "com.svmseek.wallet" --web-dir=build
```

### 4. Add Android Platform (first time only)

```bash
npx cap add android
```

### 5. Sync Changes

After any web app changes, sync them to the mobile project:

```bash
npx cap sync android
```

### 6. Build APK

```bash
cd android
./gradlew assembleDebug
```

The APK will be generated at: `android/app/build/outputs/apk/debug/app-debug.apk`

## Automated Build via GitHub Actions

The repository includes a GitHub Action workflow (`.github/workflows/build-android.yml`) that automatically:

1. Sets up the build environment (Node.js, Java, Android SDK)
2. Installs dependencies
3. Builds the web application
4. Initializes Capacitor and Android platform
5. Builds debug and production APKs (when configured)
6. Signs APKs with appropriate certificates
7. Uploads APKs as build artifacts

### Build Types

#### Debug Builds (All branches)
- **Automatic signing** with debug keystore
- **Generated for**: All pushes to main/develop and pull requests
- **Artifact name**: `svmseek-wallet-debug-vX.X.X-YYYYMMDD-HHMMSS.apk`
- **Use case**: Development, testing, internal distribution

#### Production Builds (Main branch only)
- **Production signing** with release keystore (when secrets configured)
- **Generated for**: Pushes to main branch only
- **Artifact name**: `svmseek-wallet-production-vX.X.X-YYYYMMDD-HHMMSS.apk`
- **Use case**: App store distribution, production releases

### Production Signing Setup

To enable production APK signing, configure these GitHub repository secrets:

1. **ANDROID_KEYSTORE_BASE64**: Base64-encoded keystore file
2. **ANDROID_KEYSTORE_PASSWORD**: Keystore password
3. **ANDROID_KEY_ALIAS**: Key alias name
4. **ANDROID_KEY_PASSWORD**: Key password

#### Creating Production Keystore

```bash
# Generate a new keystore (one-time setup)
keytool -genkey -v -keystore release.keystore \
  -alias svmseek-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass YOUR_STORE_PASSWORD \
  -keypass YOUR_KEY_PASSWORD \
  -dname "CN=SVMSeek, O=SVMSeek, C=US"

# Convert keystore to base64 for GitHub secrets
base64 -i release.keystore | pbcopy  # macOS
base64 -i release.keystore | xclip -selection clipboard  # Linux
```

#### Adding GitHub Secrets

1. Go to repository Settings > Secrets and Variables > Actions
2. Add new repository secrets:
   - `ANDROID_KEYSTORE_BASE64`: Paste the base64 keystore content
   - `ANDROID_KEYSTORE_PASSWORD`: Your keystore password
   - `ANDROID_KEY_ALIAS`: `svmseek-key` (or your chosen alias)
   - `ANDROID_KEY_PASSWORD`: Your key password

### Triggering the Build

The workflow runs automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` branch
- Manual trigger via GitHub Actions UI

### Downloading the APK

1. Go to the "Actions" tab in the GitHub repository
2. Click on the latest workflow run
3. Download the desired artifact:
   - `svmseek-wallet-apk`: Contains all generated APKs
   - `svmseek-wallet-production-apk`: Production APK only (main branch)
4. Extract the ZIP file to get the APK(s)

## Production Builds

Production builds are automatically generated when pushing to the main branch and production signing secrets are configured.

### Manual Production Build

For manual production builds:

1. **Set up production keystore** (see GitHub Actions setup above)
2. **Place keystore** in the android directory as `release.keystore`
3. **Build production APK**:

```bash
cd android
./gradlew assembleRelease
```

4. **Sign the APK**:

```bash
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore release.keystore \
  -storepass YOUR_STORE_PASSWORD \
  -keypass YOUR_KEY_PASSWORD \
  app/build/outputs/apk/release/app-release-unsigned.apk \
  YOUR_KEY_ALIAS
```

5. **Verify signing**:

```bash
jarsigner -verify -verbose -certs app/build/outputs/apk/release/app-release-unsigned.apk
```

The signed production APK will be ready for app store distribution.

## Mobile-Specific Features

The mobile app includes:
- Native splash screen
- Hardware back button support
- Mobile-optimized UI responsive design
- Secure storage capabilities
- Biometric authentication support (when implemented)

## Troubleshooting

### Common Issues

1. **Gradle build fails**: Ensure Java JDK 17 is installed and set as JAVA_HOME
2. **Android SDK not found**: Install Android SDK and set ANDROID_HOME environment variable
3. **Permission denied on gradlew**: Run `chmod +x android/gradlew`
4. **Capacitor sync fails**: Run `yarn build` first to ensure the web app is built

### Logs

Check build logs in:
- GitHub Actions: In the workflow run details
- Local builds: Terminal output during gradle build

## Configuration

Key configuration files:
- `capacitor.config.ts`: Main Capacitor configuration
- `android/app/build.gradle`: Android-specific build configuration
- `android/variables.gradle`: Android build variables and versions