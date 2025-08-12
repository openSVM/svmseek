const webpack = require('webpack');
const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Add critical polyfill as the FIRST entry point - this MUST load before anything else
      if (Array.isArray(webpackConfig.entry)) {
        webpackConfig.entry.unshift('./src/polyfills/critical-init.js', './src/polyfills/index.js');
      } else if (typeof webpackConfig.entry === 'string') {
        webpackConfig.entry = ['./src/polyfills/critical-init.js', './src/polyfills/index.js', webpackConfig.entry];
      } else if (typeof webpackConfig.entry === 'object') {
        const entries = Object.keys(webpackConfig.entry);
        entries.forEach(key => {
          if (Array.isArray(webpackConfig.entry[key])) {
            webpackConfig.entry[key].unshift('./src/polyfills/critical-init.js', './src/polyfills/index.js');
          } else {
            webpackConfig.entry[key] = ['./src/polyfills/critical-init.js', './src/polyfills/index.js', webpackConfig.entry[key]];
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
            // CRITICAL: Immediate OS/Buffer polyfill injection - MUST BE FIRST
            (function() {
              'use strict';
              
              // Immediate OS polyfill
              var osPolyfill = {
                homedir: function() { return '/home/user'; },
                tmpdir: function() { return '/tmp'; },
                platform: function() { return 'browser'; },
                arch: function() { return 'browser'; },
                release: function() { return '1.0.0'; },
                hostname: function() { return 'localhost'; },
                userInfo: function() { return { uid: 1000, gid: 1000, username: 'user', homedir: '/home/user', shell: '/bin/bash' }; },
                cpus: function() { return [{ model: 'Browser CPU', speed: 2400, times: { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 } }]; },
                freemem: function() { return 256 * 1024 * 1024; },
                totalmem: function() { return 2 * 1024 * 1024 * 1024; },
                loadavg: function() { return [0.1, 0.1, 0.1]; },
                uptime: function() { return Math.floor(Date.now() / 1000); },
                networkInterfaces: function() { return {}; },
                type: function() { return 'browser'; },
                EOL: '\\n'
              };

              // Get global scope
              var globalScope = (function() {
                if (typeof globalThis !== 'undefined') return globalThis;
                if (typeof window !== 'undefined') return window;
                if (typeof global !== 'undefined') return global;
                return {};
              })();

              // Inject into ALL possible locations immediately
              if (globalScope && typeof globalScope === 'object') {
                // Set Buffer if available
                if (typeof require !== 'undefined') {
                  try {
                    var Buffer = require('buffer').Buffer;
                    globalScope.Buffer = Buffer;
                  } catch (e) {
                    // Ignore if buffer not available yet
                  }
                }

                // Set os module
                globalScope.os = osPolyfill;
                
                // CRITICAL: Set all possible webpack variable names
                var possibleVars = ['c', 'a', 'b', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
                for (var i = 0; i < possibleVars.length; i++) {
                  var varName = possibleVars[i];
                  if (typeof globalScope[varName] === 'undefined') {
                    globalScope[varName] = osPolyfill;
                  }
                }

                // Set global
                globalScope.global = globalScope;
              }
            })();
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