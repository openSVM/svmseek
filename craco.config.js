const webpack = require('webpack');

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
        os: require.resolve('os'),
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