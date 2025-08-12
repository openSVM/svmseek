import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    wasm(),
    topLevelAwait(),
    // Add legacy browser support
    legacy({
      targets: ['defaults', 'not IE 11']
    }),
    // Add Node.js polyfills for browser compatibility
    nodePolyfills({
      include: ['crypto', 'stream', 'buffer', 'process', 'util', 'assert', 'url', 'os', 'path', 'vm'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  
  // Development server configuration
  server: {
    port: 3000,
    open: true,
    cors: true,
  },
  
  // Build configuration
  build: {
    outDir: 'build',
    sourcemap: true,
    rollupOptions: {
      external: ['fs'],
      output: {
        manualChunks: {
          // Vendor chunk for common dependencies
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // Crypto chunk for blockchain-related libraries
          crypto: [
            'bip32',
            'bip39', 
            'ed25519-hd-key',
            'tweetnacl',
            'scrypt-js',
            'tiny-secp256k1'
          ],
          // Solana chunk for Solana-specific dependencies
          solana: [
            '@solana/web3.js',
            '@coral-xyz/anchor',
            '@project-serum/anchor',
            '@project-serum/serum',
            '@solana/spl-token-registry',
            'bs58'
          ],
          // Material-UI chunk
          mui: [
            '@mui/material',
            '@mui/icons-material',
            '@mui/styles'
          ],
        },
      },
    },
  },
  
  // Test configuration for Vitest
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
  },
  
  // Resolve configuration
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Handle Node.js polyfills
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      buffer: 'buffer',
      process: 'process/browser',
      util: 'util',
      assert: 'assert',
      url: 'url',
      os: path.resolve(__dirname, './src/polyfills/os-browser.js'),
      path: 'path-browserify',
      vm: 'vm-browserify',
    },
  },
  
  // Define global variables
  define: {
    global: 'globalThis',
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'buffer',
      'process',
      'crypto-browserify',
      'stream-browserify',
      'util',
      'assert',
      'url',
      'path-browserify',
      'vm-browserify',
      'bs58',
    ],
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
    },
  },
  
  // Handle preview server for production builds
  preview: {
    port: 3001,
    cors: true,
  },
});