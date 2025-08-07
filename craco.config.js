const webpack = require('webpack');
const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Add critical polyfill as the first entry point
      if (Array.isArray(webpackConfig.entry)) {
        webpackConfig.entry.unshift('./src/polyfills/index.js');
      } else if (typeof webpackConfig.entry === 'string') {
        webpackConfig.entry = ['./src/polyfills/index.js', webpackConfig.entry];
      } else if (typeof webpackConfig.entry === 'object') {
        const entries = Object.keys(webpackConfig.entry);
        entries.forEach(key => {
          if (Array.isArray(webpackConfig.entry[key])) {
            webpackConfig.entry[key].unshift('./src/polyfills/index.js');
          } else {
            webpackConfig.entry[key] = ['./src/polyfills/index.js', webpackConfig.entry[key]];
          }
        });
      }

      // Optimize code splitting for better bundle size
      webpackConfig.optimization = {
        ...webpackConfig.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
            },
            crypto: {
              test: /[\\/]node_modules[\\/](bip32|bip39|ed25519-hd-key|tweetnacl|argon2-browser|scrypt-js|tiny-secp256k1)[\\/]/,
              name: 'crypto',
              chunks: 'all',
              priority: 20,
              reuseExistingChunk: true,
            },
            solana: {
              test: /[\\/]node_modules[\\/](@solana|@coral-xyz|@project-serum)[\\/]/,
              name: 'solana',
              chunks: 'all',
              priority: 15,
              reuseExistingChunk: true,
            },
            mui: {
              test: /[\\/]node_modules[\\/]@mui[\\/]/,
              name: 'mui',
              chunks: 'all',
              priority: 12,
              reuseExistingChunk: true,
            },
            common: {
              minChunks: 2,
              chunks: 'all',
              priority: 5,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
        usedExports: true,
        sideEffects: false,
      };
      
      // Add polyfills for node modules
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
        process: require.resolve('process/browser'),
        assert: require.resolve('assert'),
        util: require.resolve('util'),
        url: require.resolve('url'),
        os: path.resolve(__dirname, 'src/polyfills/os-browser.js'),
        path: require.resolve('path-browserify'),
        vm: require.resolve('vm-browserify'),
        fs: false,
        net: false,
        tls: false,
      };
      
      // Provide global variables for compatibility
      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        }),
        new webpack.DefinePlugin({
          global: 'globalThis',
          'global.Buffer': 'globalThis.Buffer',
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
        }),
        // Add a custom plugin to inject buffer safety checks at the very beginning
        new webpack.BannerPlugin({
          banner: `
            // Critical buffer safety initialization - MUST BE FIRST
            if (typeof globalThis !== 'undefined' && !globalThis.Buffer) {
              globalThis.Buffer = require('buffer').Buffer;
            }
            if (typeof window !== 'undefined' && !window.Buffer) {
              window.Buffer = require('buffer').Buffer;
            }
          `,
          raw: false,
          entryOnly: true,
        }),
      ];
      
      // Add module rules to handle problematic dependencies
      webpackConfig.module.rules.push({
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false
        }
      });
      
      return webpackConfig;
    },
  },
};