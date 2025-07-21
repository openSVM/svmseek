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
5. Builds the APK
6. Signs it with a debug certificate
7. Uploads the APK as a build artifact

### Triggering the Build

The workflow runs automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` branch
- Manual trigger via GitHub Actions UI

### Downloading the APK

1. Go to the "Actions" tab in the GitHub repository
2. Click on the latest workflow run
3. Download the "svmseek-wallet-apk" artifact
4. Extract the ZIP file to get the APK

## Production Builds

For production releases, you should:

1. Create a production keystore
2. Update the Capacitor configuration with production signing details
3. Use `assembleRelease` instead of `assembleDebug`
4. Configure app store deployment if needed

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