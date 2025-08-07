# Browser Extension Store Deployment

This document describes how to configure and use the automated browser extension deployment workflow.

## Overview

The `deploy-extensions.yml` workflow automatically builds and deploys SVMSeek Wallet browser extensions to various browser stores:

- **Chrome Web Store** - Automated deployment
- **Firefox Add-ons (AMO)** - Automated deployment  
- **Microsoft Edge Add-ons** - Automated deployment
- **Safari App Store** - Manual deployment with automated instructions

## Required Secrets Configuration

### Chrome Web Store

To deploy to Chrome Web Store, configure these secrets in GitHub repository settings:

```
CHROME_EXTENSION_ID       # Your Chrome extension ID from Web Store
CHROME_CLIENT_ID         # OAuth2 client ID from Google Cloud Console
CHROME_CLIENT_SECRET     # OAuth2 client secret from Google Cloud Console
CHROME_REFRESH_TOKEN     # OAuth2 refresh token for API access
```

#### Setup Steps for Chrome:

1. **Create Chrome Extension Listing**
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - Create new extension listing
   - Upload initial version manually to get Extension ID

2. **Setup Google Cloud Console Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create new project or use existing
   - Enable Chrome Web Store API
   - Create OAuth2 credentials (Application type: Web Application)

3. **Generate Refresh Token**
   ```bash
   # Install chrome-webstore-upload-cli
   npm install -g chrome-webstore-upload-cli
   
   # Follow prompts to get refresh token
   webstore setup
   ```

### Firefox Add-ons (AMO)

Configure these secrets for Firefox deployment:

```
FIREFOX_API_KEY          # API key from Firefox Add-on Developer Hub
FIREFOX_API_SECRET       # API secret from Firefox Add-on Developer Hub
```

#### Setup Steps for Firefox:

1. **Create Firefox Add-on Listing**
   - Go to [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)
   - Submit initial version manually

2. **Generate API Credentials**
   - Go to [API Key Management](https://addons.mozilla.org/developers/addon/api/key/)
   - Generate new API key and secret

### Microsoft Edge Add-ons

Configure these secrets for Edge deployment:

```
EDGE_PRODUCT_ID          # Product ID from Partner Center
EDGE_CLIENT_ID           # Azure AD application client ID
EDGE_CLIENT_SECRET       # Azure AD application client secret
EDGE_ACCESS_TOKEN_URL    # Azure AD token endpoint
```

#### Setup Steps for Edge:

1. **Create Edge Extension Listing**
   - Go to [Microsoft Partner Center](https://partner.microsoft.com/)
   - Create new Edge extension
   - Upload initial version manually to get Product ID

2. **Setup Azure AD Application**
   - Go to [Azure Portal](https://portal.azure.com)
   - Register new application in Azure AD
   - Generate client secret
   - Configure API permissions for Partner Center

### Safari App Store

Safari deployment requires manual steps due to Apple's requirements:

```
# No secrets required - manual deployment only
```

#### Safari Deployment Process:

1. **Automated Build** - Workflow creates Safari extension package
2. **Manual Conversion** - Use Xcode to convert to App Store format
3. **Manual Submission** - Submit through App Store Connect

## Environment Configuration

Each deployment target uses GitHub Environments for additional security:

- `chrome-webstore` - Chrome Web Store deployment
- `firefox-addons` - Firefox Add-ons deployment  
- `edge-addons` - Microsoft Edge Add-ons deployment
- `safari-appstore` - Safari App Store (manual steps)

### Setting up Environments:

1. Go to repository **Settings** → **Environments**
2. Create each environment listed above
3. Configure environment protection rules:
   - Required reviewers (recommended)
   - Restrict to main branch
   - Wait timer (optional)

## Workflow Triggers

The deployment workflow can be triggered in several ways:

### Automatic Triggers

- **Push to main branch** - Deploys all ready extensions
- **Git tags** (v*) - Deploys all ready extensions for releases

### Manual Trigger

- **Workflow Dispatch** - Manual trigger with options:
  - Choose which stores to deploy to
  - Enable dry-run mode for testing

## Usage

### Automatic Deployment

1. **Create Release Tag**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Push to Main Branch**
   ```bash
   git push origin main
   ```

### Manual Deployment

1. Go to **Actions** → **Deploy Browser Extensions**
2. Click **Run workflow**
3. Select deployment options:
   - Choose target stores
   - Enable dry-run for testing
4. Click **Run workflow**

### Dry Run Mode

Use dry-run mode to test the workflow without actual deployment:

1. Run workflow manually
2. Check "Dry run mode" option
3. Workflow will build extensions but skip actual deployment
4. Review logs and artifacts

## Monitoring Deployments

### GitHub Actions

- Monitor workflow runs in **Actions** tab
- Check deployment status in workflow summary
- Download extension artifacts from completed runs

### Store Review Status

After deployment, monitor review status on each store:

- **Chrome** - [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- **Firefox** - [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)
- **Edge** - [Microsoft Partner Center](https://partner.microsoft.com/)
- **Safari** - [App Store Connect](https://appstoreconnect.apple.com/)

## Troubleshooting

### Common Issues

#### Authentication Errors
- Verify all secrets are correctly configured
- Check if OAuth tokens have expired (especially Chrome refresh token)
- Ensure API keys have proper permissions

#### Build Failures
- Check extension manifest files are valid
- Verify all required files are included in extension packages
- Review build logs for specific error messages

#### Deployment Failures
- Check store-specific requirements (file size, permissions, etc.)
- Verify extension meets store policies
- Review deployment logs for API error messages

### Getting Help

1. **Check Logs** - Review GitHub Actions workflow logs
2. **Validate Secrets** - Use dry-run mode to test configuration
3. **Store Documentation** - Refer to each store's developer documentation
4. **GitHub Issues** - Report issues in repository issue tracker

## Store-Specific Notes

### Chrome Web Store
- Review time: 1-3 business days
- Automated review for minor updates
- Manual review for new permissions or significant changes

### Firefox Add-ons
- Review time: 1-5 business days  
- Automated review for most updates
- Source code review may be required

### Microsoft Edge Add-ons
- Review time: 3-7 business days
- Similar process to Chrome Web Store
- May require Microsoft account verification

### Safari App Store
- Review time: 24-48 hours for expedited review, 7 days for standard
- Requires Xcode and Apple Developer account ($99/year)
- Most complex submission process

## Security Considerations

### Secret Management
- Store secrets in GitHub repository secrets, not environment variables
- Use environment protection rules to limit secret access
- Rotate API keys and tokens regularly

### Extension Security
- Follow browser extension security best practices
- Minimize requested permissions
- Validate all external dependencies

### Access Control
- Limit who can trigger deployments using environment protection
- Use required reviewers for production deployments
- Monitor deployment logs for unauthorized access

## Updates and Maintenance

### Keeping Deployment Tools Updated
- Regularly update npm packages used for deployment
- Monitor for changes in browser store APIs
- Test deployment process after updates

### Extension Updates
- Follow semantic versioning for extension versions
- Update store listings when adding new features
- Communicate breaking changes to users

### Documentation
- Keep this documentation updated with any changes
- Document any custom modifications to the workflow
- Share knowledge with team members