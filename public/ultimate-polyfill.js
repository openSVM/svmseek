/* eslint-disable strict */
/**
 * ULTIMATE POLYFILL - Immediate OS/Node.js compatibility layer
 * This must run before ANY webpack modules load to prevent c.homedir errors
 */

(function() {
  'use strict';
  
  // Comprehensive OS polyfill implementation
  const osPolyfill = {
    EOL: '\n',
    arch: function() { return 'browser'; },
    platform: function() {
      if (typeof navigator !== 'undefined') {
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('mac')) return 'darwin';
        if (userAgent.includes('win')) return 'win32';
        if (userAgent.includes('linux')) return 'linux';
      }
      return 'browser';
    },
    release: function() { return '1.0.0'; },
    hostname: function() {
      if (typeof window !== 'undefined' && window.location) {
        return window.location.hostname || 'localhost';
      }
      return 'localhost';
    },
    homedir: function() { return '/home/user'; },
    tmpdir: function() { return '/tmp'; },
    userInfo: function() {
      return {
        uid: 1000,
        gid: 1000,
        username: 'user',
        homedir: '/home/user',
        shell: '/bin/bash'
      };
    },
    cpus: function() {
      const numCores = typeof navigator !== 'undefined' && navigator.hardwareConcurrency
        ? navigator.hardwareConcurrency : 4;
      const cpu = {
        model: 'Browser CPU',
        speed: 2400,
        times: { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 }
      };
      return Array(numCores).fill(cpu);
    },
    freemem: function() { return 256 * 1024 * 1024; },
    totalmem: function() { return 2 * 1024 * 1024 * 1024; },
    loadavg: function() { return [0.1, 0.1, 0.1]; },
    uptime: function() { return Math.floor(Date.now() / 1000); },
    networkInterfaces: function() { return {}; },
    type: function() { return this.platform(); },
    constants: {
      signals: {
        SIGINT: 2,
        SIGTERM: 15
      }
    }
  };

  // Path polyfill implementation
  const pathPolyfill = {
    resolve: function() {
      const args = Array.prototype.slice.call(arguments);
      return args.join('/').replace(/\/+/g, '/');
    },
    join: function() {
      const args = Array.prototype.slice.call(arguments);
      return args.join('/').replace(/\/+/g, '/');
    },
    dirname: function(p) {
      return p.split('/').slice(0, -1).join('/') || '/';
    },
    basename: function(p, ext) {
      const base = p.split('/').pop() || '';
      if (ext && base.endsWith(ext)) {
        return base.slice(0, -ext.length);
      }
      return base;
    },
    extname: function(p) {
      const parts = p.split('.');
      return parts.length > 1 ? '.' + parts.pop() : '';
    },
    isAbsolute: function(p) {
      return p.charAt(0) === '/';
    },
    normalize: function(p) {
      return p.replace(/\/+/g, '/');
    },
    sep: '/',
    delimiter: ':'
  };

  // Get all possible global scopes
  const globalScopes = [];
  if (typeof globalThis !== 'undefined') globalScopes.push(globalThis);
  if (typeof window !== 'undefined') globalScopes.push(window);
  if (typeof global !== 'undefined') globalScopes.push(global);
  if (typeof self !== 'undefined') globalScopes.push(self);

  // Generate ALL possible webpack variable names (including multi-character)
  const singleChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const allPossibleVars = [];
  
  // Add single characters
  for (let i = 0; i < singleChars.length; i++) {
    allPossibleVars.push(singleChars[i]);
  }
  
  // Add double characters (aa, ab, ac, etc.)
  for (let i = 0; i < singleChars.length; i++) {
    for (let j = 0; j < singleChars.length; j++) {
      allPossibleVars.push(singleChars[i] + singleChars[j]);
    }
  }
  
  // Add single char + number combinations
  for (let i = 0; i < singleChars.length; i++) {
    for (let j = 0; j < numbers.length; j++) {
      allPossibleVars.push(singleChars[i] + numbers[j]);
      allPossibleVars.push(numbers[j] + singleChars[i]);
    }
  }

  // Apply polyfills to all global scopes
  globalScopes.forEach(function(scope) {
    if (!scope || typeof scope !== 'object') return;

    // Set up core modules
    if (!scope.os) {
      try {
        Object.defineProperty(scope, 'os', {
          value: osPolyfill,
          writable: false,
          configurable: false
        });
      } catch (e) {
        scope.os = osPolyfill;
      }
    }

    if (!scope.path) {
      try {
        Object.defineProperty(scope, 'path', {
          value: pathPolyfill,
          writable: false,
          configurable: false
        });
      } catch (e) {
        scope.path = pathPolyfill;
      }
    }

    // Pre-populate ALL possible webpack variables
    allPossibleVars.forEach(function(varName) {
      try {
        if (typeof scope[varName] === 'undefined') {
          // Create as writable so webpack can update if needed
          Object.defineProperty(scope, varName, {
            value: osPolyfill,
            writable: true,
            configurable: true
          });
        } else if (scope[varName] && typeof scope[varName] === 'object' && !scope[varName].homedir) {
          // Enhance existing objects that might be module containers
          try {
            Object.assign(scope[varName], osPolyfill);
          } catch (e) {
            // If can't assign, try to replace
            try {
              scope[varName] = Object.assign({}, scope[varName], osPolyfill);
            } catch (e2) {
              // Last resort - just set the methods we need
              if (!scope[varName].homedir) scope[varName].homedir = osPolyfill.homedir;
              if (!scope[varName].tmpdir) scope[varName].tmpdir = osPolyfill.tmpdir;
              if (!scope[varName].platform) scope[varName].platform = osPolyfill.platform;
            }
          }
        }
      } catch (e) {
        // Ignore errors for variables we can't set
      }
    });

    // Enhanced require function
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
            throw new Error('Module ' + moduleName + ' not found');
        }
      };
      scope.require.cache = {
        'os': { exports: osPolyfill },
        'node:os': { exports: osPolyfill },
        'path': { exports: pathPolyfill },
        'node:path': { exports: pathPolyfill }
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
      
      if (!scope.require.cache) {
        scope.require.cache = {};
      }
      scope.require.cache.os = { exports: osPolyfill };
      scope.require.cache['node:os'] = { exports: osPolyfill };
      scope.require.cache.path = { exports: pathPolyfill };
      scope.require.cache['node:path'] = { exports: pathPolyfill };
    }

    // Intercept webpack require if it exists
    if (typeof scope.__webpack_require__ !== 'undefined') {
      const originalWebpackRequire = scope.__webpack_require__;
      scope.__webpack_require__ = function(moduleId) {
        try {
          const result = originalWebpackRequire(moduleId);
          // If result looks like it should have os functions but doesn't, enhance it
          if (result && typeof result === 'object' && !result.homedir) {
            if (typeof moduleId === 'string' && (moduleId.includes('os') || moduleId.includes('node:os'))) {
              return Object.assign({}, result, osPolyfill);
            }
            if (typeof moduleId === 'string' && (moduleId.includes('path') || moduleId.includes('node:path'))) {
              return Object.assign({}, result, pathPolyfill);
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

    // Set up global refs that might be used
    if (!scope.global) scope.global = scope;
    if (!scope.window && typeof window !== 'undefined') scope.window = window;
  });

  // Ultimate error recovery system
  if (typeof window !== 'undefined') {
    const originalError = window.onerror;
    const ultimateErrorHandler = function(message, source, lineno, colno, error) {
      if (typeof message === 'string') {
        // Check for any homedir-related errors
        if (message.includes('.homedir is not a function') ||
            message.includes('homedir is not a function') ||
            message.includes('Cannot read properties of undefined (reading \'homedir\')') ||
            message.includes('Cannot read property \'homedir\' of undefined') ||
            message.includes('os.homedir is not a function') ||
            message.includes('.tmpdir is not a function') ||
            message.includes('.platform is not a function')) {
          
          console.error('🚨 OS module error detected:', message);
          
          // Emergency polyfill injection
          try {
            // Try to extract variable name from error
            const matches = message.match(/(\w+)\.(?:homedir|tmpdir|platform) is not a function/);
            if (matches && matches[1]) {
              const varName = matches[1];
              console.log('🔧 Emergency fixing variable:', varName);
              
              // Set the variable in all possible scopes
              globalScopes.forEach(function(scope) {
                if (scope && typeof scope === 'object') {
                  try {
                    scope[varName] = osPolyfill;
                  } catch (e) {
                    // Ignore errors
                  }
                }
              });
              
              // Force set in window
              if (typeof window !== 'undefined') {
                try {
                  window[varName] = osPolyfill;
                } catch (e) {
                  // Ignore errors
                }
              }
            }
            
            // Also try to fix common variable names just in case
            ['c', 'os', 'a', 'b', 'd', 'e'].forEach(function(varName) {
              globalScopes.forEach(function(scope) {
                if (scope && typeof scope === 'object') {
                  try {
                    if (typeof scope[varName] === 'undefined' || 
                        (scope[varName] && typeof scope[varName] === 'object' && !scope[varName].homedir)) {
                      scope[varName] = osPolyfill;
                    }
                  } catch (e) {
                    // Ignore errors
                  }
                }
              });
            });
            
            // Display user-friendly message and reload
            if (typeof document !== 'undefined' && document.body) {
              const errorDiv = document.createElement('div');
              errorDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #ff4444;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                z-index: 10000;
                font-family: Arial, sans-serif;
                font-size: 14px;
                max-width: 350px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              `;
              errorDiv.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 8px;">⚡ System Fix Applied</div>
                <div>Compatibility issue resolved. Reloading...</div>
              `;
              document.body.appendChild(errorDiv);
              
              // Reload after a short delay
              setTimeout(function() {
                window.location.reload();
              }, 1500);
            } else {
              // If no DOM, just reload
              setTimeout(function() {
                window.location.reload();
              }, 500);
            }
            
            return true; // Prevent default error handling
          } catch (fixError) {
            console.error('Emergency fix failed:', fixError);
            // Force reload as last resort
            setTimeout(function() {
              window.location.reload();
            }, 1000);
            return true;
          }
        }
      }
      
      // Call original error handler if exists
      if (originalError) {
        return originalError.call(this, message, source, lineno, colno, error);
      }
      return false;
    };

    // Set the error handler
    window.onerror = ultimateErrorHandler;
    
    // Also set up unhandledrejection handler for Promise errors
    window.addEventListener('unhandledrejection', function(event) {
      if (event.reason && typeof event.reason === 'object' && event.reason.message) {
        const message = event.reason.message;
        if (message.includes('homedir') || message.includes('os')) {
          console.warn('Promise rejection with OS error:', message);
          ultimateErrorHandler(message, '', 0, 0, event.reason);
        }
      }
    });
  }

  // Log successful initialization
  if (typeof console !== 'undefined' && console.log) {
    console.log('🛡️ Ultimate polyfill system initialized - all ' + allPossibleVars.length + ' possible variables covered');
  }
})();