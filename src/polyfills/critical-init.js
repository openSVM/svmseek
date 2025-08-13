/* eslint-disable no-undef, no-restricted-globals, strict */
/**
 * CRITICAL INITIALIZATION - MUST RUN FIRST
 * 
 * This script provides immediate polyfills for Node.js modules in browser environment
 * It's designed to run before any other webpack modules to prevent "c.homedir is not a function" errors
 */

// Immediate OS polyfill - synchronous, no async loading
const osPolyfill = {
  EOL: '\n',
  arch: () => 'browser',
  platform: () => {
    if (typeof navigator !== 'undefined') {
      const userAgent = navigator.userAgent.toLowerCase();
      if (userAgent.includes('mac')) return 'darwin';
      if (userAgent.includes('win')) return 'win32';
      if (userAgent.includes('linux')) return 'linux';
    }
    return 'browser';
  },
  release: () => '1.0.0',
  hostname: () => {
    if (typeof window !== 'undefined' && window.location) {
      return window.location.hostname || 'localhost';
    }
    return 'localhost';
  },
  homedir: () => '/home/user',
  tmpdir: () => '/tmp',
  userInfo: () => ({
    uid: 1000,
    gid: 1000,
    username: 'user',
    homedir: '/home/user',
    shell: '/bin/bash',
  }),
  cpus: () => {
    const numCores = typeof navigator !== 'undefined' && navigator.hardwareConcurrency
      ? navigator.hardwareConcurrency
      : 4;
    return Array(numCores).fill({
      model: 'Browser CPU',
      speed: 2400,
      times: { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 },
    });
  },
  freemem: () => 256 * 1024 * 1024,
  totalmem: () => 2 * 1024 * 1024 * 1024,
  loadavg: () => [0.1, 0.1, 0.1],
  uptime: () => Math.floor(Date.now() / 1000),
  networkInterfaces: () => ({}),
  type: () => 'browser',
};

// Path polyfill
const pathPolyfill = {
  resolve: function(...args) {
    return args.join('/').replace(/\/+/g, '/');
  },
  join: function(...args) {
    return args.join('/').replace(/\/+/g, '/');
  },
  dirname: function(p) {
    return p.split('/').slice(0, -1).join('/') || '/';
  },
  basename: function(p) {
    return p.split('/').pop() || '';
  },
  extname: function(p) {
    const parts = p.split('.');
    return parts.length > 1 ? '.' + parts.pop() : '';
  },
  isAbsolute: function(p) {
    return p.startsWith('/');
  },
  normalize: function(p) {
    return p.replace(/\/+/g, '/');
  }
};

// Immediate global injection - runs synchronously
(function() {
  'use strict';
  
  // Get all possible global scopes
  const scopes = [];
  if (typeof globalThis !== 'undefined') scopes.push(globalThis);
  if (typeof window !== 'undefined') scopes.push(window);
  if (typeof global !== 'undefined') scopes.push(global);
  if (typeof self !== 'undefined') scopes.push(self);

  scopes.forEach(scope => {
    if (!scope || typeof scope !== 'object') return;

    // Inject os module into every possible location
    if (!scope.os) {
      Object.defineProperty(scope, 'os', {
        value: osPolyfill,
        writable: false,
        configurable: false,
      });
    }

    // Inject path module
    if (!scope.path) {
      Object.defineProperty(scope, 'path', {
        value: pathPolyfill,
        writable: false,
        configurable: false,
      });
    }

    // Critical: Handle ALL possible variable names that webpack might use for os module
    // Common webpack mangled names: a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z
    const possibleVarNames = ['c', 'a', 'b', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
    
    possibleVarNames.forEach(varName => {
      // Only set if undefined or if it's an object missing homedir
      if (typeof scope[varName] === 'undefined') {
        Object.defineProperty(scope, varName, {
          value: osPolyfill,
          writable: true,
          configurable: true,
        });
      } else if (scope[varName] && typeof scope[varName] === 'object' && !scope[varName].homedir) {
        try {
          // Enhance existing object with os methods
          Object.assign(scope[varName], osPolyfill);
        } catch (e) {
          // If can't modify, try to replace
          try {
            scope[varName] = { ...scope[varName], ...osPolyfill };
          } catch (e2) {
            // Ignore if we can't modify
          }
        }
      }
    });

    // Setup require function if it doesn't exist
    if (!scope.require) {
      scope.require = function(moduleName) {
        switch (moduleName) {
          case 'os':
          case 'node:os':
            return osPolyfill;
          case 'path':
          case 'node:path':
            return pathPolyfill;
          default:
            throw new Error(`Module ${moduleName} not found`);
        }
      };
      scope.require.cache = {
        os: { exports: osPolyfill },
        'node:os': { exports: osPolyfill },
        path: { exports: pathPolyfill },
        'node:path': { exports: pathPolyfill },
      };
    } else {
      // Enhance existing require
      const originalRequire = scope.require;
      scope.require = function(moduleName) {
        switch (moduleName) {
          case 'os':
          case 'node:os':
            return osPolyfill;
          case 'path':
          case 'node:path':
            return pathPolyfill;
          default:
            try {
              return originalRequire(moduleName);
            } catch (error) {
              if (moduleName === 'os' || moduleName === 'node:os') return osPolyfill;
              if (moduleName === 'path' || moduleName === 'node:path') return pathPolyfill;
              throw error;
            }
        }
      };
      
      // Ensure require cache exists and has our modules
      if (!scope.require.cache) {
        scope.require.cache = {};
      }
      scope.require.cache.os = { exports: osPolyfill };
      scope.require.cache['node:os'] = { exports: osPolyfill };
      scope.require.cache.path = { exports: pathPolyfill };
      scope.require.cache['node:path'] = { exports: pathPolyfill };
    }

    // Handle webpack's __webpack_require__ if it exists
    if (typeof scope.__webpack_require__ !== 'undefined') {
      const originalWebpackRequire = scope.__webpack_require__;
      scope.__webpack_require__ = function(moduleId) {
        try {
          const result = originalWebpackRequire(moduleId);
          // If result is an object that looks like it should have os functions but doesn't, enhance it
          if (result && typeof result === 'object' && !result.homedir) {
            if (typeof moduleId === 'string' && (moduleId.includes('os') || moduleId.includes('node:os'))) {
              return { ...result, ...osPolyfill };
            }
            if (typeof moduleId === 'string' && (moduleId.includes('path') || moduleId.includes('node:path'))) {
              return { ...result, ...pathPolyfill };
            }
          }
          return result;
        } catch (error) {
          // If webpack require fails for os/path modules, return our polyfills
          if (typeof moduleId === 'string') {
            if (moduleId.includes('os') || moduleId.includes('node:os')) {
              return osPolyfill;
            }
            if (moduleId.includes('path') || moduleId.includes('node:path')) {
              return pathPolyfill;
            }
          }
          throw error;
        }
      };
    }
  });

  // Set up immediate error handler for any missed cases
  if (typeof window !== 'undefined') {
    const originalError = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
      if (typeof message === 'string' && message.includes('.homedir is not a function')) {
        // Emergency fix - inject polyfills into any missing variables
        const match = message.match(/(\w+)\.homedir is not a function/);
        if (match && match[1]) {
          const varName = match[1];
          if (typeof window[varName] === 'undefined') {
            window[varName] = osPolyfill;
            // Try to reload the component
            setTimeout(() => window.location.reload(), 100);
            return true;
          }
        }
      }
      
      // Call original handler
      if (originalError) {
        return originalError.call(this, message, source, lineno, colno, error);
      }
      return false;
    };
  }
})();

// Log successful initialization
if (typeof console !== 'undefined' && console.log) {
  console.log('🛡️ Critical OS/Path polyfills initialized immediately');
}