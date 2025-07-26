# Netlify Deployment Configuration

This document explains the Netlify deployment setup for SVMSeek Wallet.

## Overview

SVMSeek Wallet is automatically deployed to Netlify with the following configuration:

- **Production URL**: https://wallet.cryptocurrencies.ai
- **Deployment**: Automatic on push to `main` branch
- **Preview Deployments**: Automatic for pull requests

## Files and Configuration

### Core Configuration Files

- `netlify.toml` - Main Netlify configuration with build settings, redirects, and security headers
- `.env.netlify` - Environment variables specific to Netlify builds
- `netlify.json` - Build plugins and processing configuration
- `scripts/build-netlify.sh` - Optimized build script for Netlify deployment

### GitHub Actions

- `.github/workflows/netlify-deploy.yml` - Automated deployment workflow

## Build Process

### Build Commands

The build process uses different commands based on the deployment context:

- **Production** (`main` branch): Uses `buildMaster` command
- **Development** (`develop` branch): Uses standard `build` command  
- **Pull Requests**: Uses standard `build` command for previews

### Build Optimizations

The Netlify build includes several optimizations:

1. **Bundle Analysis**: Automatic bundle size analysis and reporting
2. **Security Checks**: Removes sensitive files from build output
3. **Performance Monitoring**: Lighthouse CI integration for performance audits
4. **Caching**: Optimized cache headers for static assets

## Environment Variables

Set the following environment variables in your Netlify dashboard:

### Required Secrets

- `NETLIFY_SITE_ID` - Your Netlify site ID
- `NETLIFY_AUTH_TOKEN` - Your Netlify authentication token

### Optional Configuration

- `REACT_APP_SOLANA_RPC_URL` - Custom Solana RPC endpoint
- `REACT_APP_ENABLE_AI_CHAT` - Enable/disable AI chat features
- `REACT_APP_ENABLE_EXPLORER` - Enable/disable blockchain explorer

## Security Features

The deployment includes several security enhancements:

- **Content Security Policy (CSP)**: Restrictive CSP headers for wallet security
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, etc.
- **HTTPS Enforcement**: Automatic HTTPS redirects
- **Permission Policies**: Restricted browser permissions

## Performance Features

- **Static Asset Caching**: Long-term caching for immutable assets
- **Gzip Compression**: Automatic compression for all text assets
- **Bundle Splitting**: Optimized code splitting for faster loading
- **Image Optimization**: Automatic image compression

## Monitoring and Analytics

### Build Monitoring

- Automatic bundle size tracking
- Performance audits via Lighthouse CI
- Build time monitoring
- Error reporting and alerting

### Deployment Tracking

- Build success/failure notifications
- Preview URL generation for pull requests
- Deployment status in GitHub

## Manual Deployment

To deploy manually using Netlify CLI:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Build the application
./scripts/build-netlify.sh

# Deploy to production
netlify deploy --prod --dir=build

# Deploy preview
netlify deploy --dir=build
```

## Troubleshooting

### Common Issues

1. **Build Failures**: Check the build logs in Netlify dashboard
2. **Environment Variables**: Ensure all required variables are set
3. **Bundle Size**: Monitor bundle size - large bundles may cause deployment failures
4. **Security Headers**: CSP issues may prevent certain external resources from loading

### Debug Steps

1. Check Netlify build logs for specific error messages
2. Test build locally using `./scripts/build-netlify.sh`
3. Verify environment variables in Netlify dashboard
4. Check GitHub Actions logs for deployment pipeline issues

## Domain Configuration

The wallet is configured to be served from `wallet.cryptocurrencies.ai`. To change this:

1. Update the `CNAME` file in the `public/` directory
2. Update URLs in `netlify.toml` security headers
3. Configure DNS settings to point to Netlify
4. Update environment variables if needed

## Support

For deployment issues:

1. Check [Netlify documentation](https://docs.netlify.com/)
2. Review build logs in Netlify dashboard
3. Check GitHub Actions workflow results
4. Verify all environment variables are properly set