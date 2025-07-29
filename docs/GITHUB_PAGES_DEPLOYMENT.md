# GitHub Pages Deployment

This repository is configured with automated GitHub Pages deployment for the SVMSeek Wallet web application.

## 🚀 Automatic Deployment

The GitHub Pages deployment is handled automatically by the GitHub Actions workflow in `.github/workflows/github-pages-deploy.yml`.

### Deployment Triggers

- **Production deployment**: Triggered on push to `main` or `master` branch
- **Preview builds**: Generated for pull requests (build only, no deployment)
- **Manual deployment**: Can be triggered manually via GitHub Actions UI

### Deployment URL

The application will be available at:
```
https://opensvm.github.io/svmseek
```

## 🔧 Setup Instructions

### 1. Enable GitHub Pages

1. Go to your repository **Settings** → **Pages**
2. Under **Source**, select **"GitHub Actions"**
3. The workflow will handle the rest automatically

### 2. Custom Domain (Optional)

If you want to use a custom domain:

1. Add your domain to repository **Settings** → **Pages** → **Custom domain**
2. Set the `CUSTOM_DOMAIN` variable in repository settings:
   - Go to **Settings** → **Variables and secrets** → **Actions**
   - Create a new variable: `CUSTOM_DOMAIN` with your domain (e.g., `wallet.yourdomain.com`)
3. Update DNS settings to point to GitHub Pages

## 📦 Build Process

The deployment workflow performs the following steps:

1. **Environment Setup**
   - Uses Node.js version from `.nvmrc`
   - Installs dependencies with retry logic
   - Configures GitHub Pages settings

2. **Build Optimization**
   - Sets proper homepage URL for GitHub Pages subdirectory
   - Generates production build with `buildMaster` for main branch
   - Applies GitHub Pages compatibility fixes

3. **GitHub Pages Compatibility**
   - Adds `.nojekyll` file to prevent Jekyll processing
   - Creates `404.html` for SPA routing fallback
   - Fixes asset paths for subdirectory deployment
   - Optimizes for GitHub Pages environment

4. **Deployment**
   - Uploads build artifacts to GitHub Pages
   - Verifies deployment accessibility
   - Runs health checks post-deployment

## 🎯 Features

The deployed application includes:

- ✅ **Multi-language support** (11 languages)
- ✅ **11 visual themes** including E-Ink Grayscale default
- ✅ **Multi-account wallet management** with groups
- ✅ **Transaction history and CSV export**
- ✅ **Hardware wallet support**
- ✅ **Mobile-responsive design**
- ✅ **Progressive Web App (PWA) capabilities**

## 📊 Build Analytics

Each deployment generates:
- Build size analysis
- Asset breakdown report
- Performance metrics
- Accessibility checks

## 🔍 Preview Builds

For pull requests, the workflow:
1. Builds the application
2. Generates build reports
3. Comments on PR with build details
4. Provides preview information

## 🛠️ Manual Deployment

To manually trigger a deployment:

1. Go to **Actions** tab in your repository
2. Select **"Deploy to GitHub Pages"** workflow
3. Click **"Run workflow"**
4. Choose the branch and click **"Run workflow"**

## 📋 Troubleshooting

### Common Issues

1. **Build Fails**
   - Check Node.js version in `.nvmrc`
   - Verify all dependencies are properly installed
   - Review build logs in Actions tab

2. **Site Not Accessible**
   - Wait 5-10 minutes after deployment
   - Check if GitHub Pages is enabled in repository settings
   - Verify the deployment completed successfully

3. **Assets Not Loading**
   - Ensure PUBLIC_URL is set correctly
   - Check if asset paths are properly configured
   - Verify `.nojekyll` file exists in build

### Debug Steps

1. Check the **Actions** tab for deployment logs
2. Verify **Settings** → **Pages** configuration
3. Test the site URL manually
4. Check browser console for errors

## 🔒 Security

The deployment workflow includes:
- Content Security Policy headers
- Asset integrity verification
- Build artifact scanning
- Dependency vulnerability checks

## 🎉 Success

Once deployed, your SVMSeek Wallet will be accessible at:
```
https://opensvm.github.io/svmseek
```

The application provides a complete Solana wallet experience with enterprise-grade security and modern user interface design.