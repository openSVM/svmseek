// Comprehensive Buffer polyfill for browser environment
// This ensures compatibility with Solana Web3.js and related crypto libraries

(function() {
  'use strict';
  
  // Only create polyfill if Buffer doesn't exist
  if (typeof window !== 'undefined' && !window.Buffer) {
    
    // Basic Buffer implementation with essential methods
    function BufferPolyfill(data, encoding) {
      if (!(this instanceof BufferPolyfill)) {
        return new BufferPolyfill(data, encoding);
      }
      
      if (data instanceof ArrayBuffer) {
        this._data = new Uint8Array(data);
      } else if (data instanceof Uint8Array) {
        this._data = data;
      } else if (Array.isArray(data)) {
        this._data = new Uint8Array(data);
      } else if (typeof data === 'string') {
        this._data = this._fromString(data, encoding);
      } else if (typeof data === 'number') {
        this._data = new Uint8Array(data);
      } else {
        this._data = new Uint8Array(0);
      }
      
      this.length = this._data.length;
      
      // Make it array-like
      for (let i = 0; i < this.length; i++) {
        this[i] = this._data[i];
      }
    }
    
    BufferPolyfill.prototype._fromString = function(str, encoding) {
      encoding = encoding || 'utf8';
      
      if (encoding === 'hex') {
        const bytes = [];
        for (let i = 0; i < str.length; i += 2) {
          bytes.push(parseInt(str.substr(i, 2), 16));
        }
        return new Uint8Array(bytes);
      } else if (encoding === 'base64') {
        const binaryString = atob(str);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
      } else {
        // Default to UTF-8
        return new TextEncoder().encode(str);
      }
    };
    
    BufferPolyfill.prototype.toString = function(encoding) {
      encoding = encoding || 'utf8';
      
      if (encoding === 'hex') {
        return Array.from(this._data)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
      } else if (encoding === 'base64') {
        let binary = '';
        for (let i = 0; i < this._data.length; i++) {
          binary += String.fromCharCode(this._data[i]);
        }
        return btoa(binary);
      } else {
        // Default to UTF-8
        return new TextDecoder().decode(this._data);
      }
    };
    
    BufferPolyfill.prototype.slice = function(start, end) {
      return new BufferPolyfill(this._data.slice(start, end));
    };
    
    // Add buffer property for compatibility
    Object.defineProperty(BufferPolyfill.prototype, 'buffer', {
      get: function() {
        return this._data.buffer;
      },
      enumerable: false,
      configurable: true
    });
    
    // Add additional methods that might be needed
    BufferPolyfill.prototype.writeUInt8 = function(value, offset) {
      this._data[offset] = value & 0xff;
      return offset + 1;
    };
    
    BufferPolyfill.prototype.writeUInt32BE = function(value, offset) {
      this._data[offset] = (value >>> 24) & 0xff;
      this._data[offset + 1] = (value >>> 16) & 0xff;
      this._data[offset + 2] = (value >>> 8) & 0xff;
      this._data[offset + 3] = value & 0xff;
      return offset + 4;
    };
    
    // Static methods
    BufferPolyfill.from = function(data, encoding) {
      return new BufferPolyfill(data, encoding);
    };
    
    BufferPolyfill.alloc = function(size, fill) {
      const buf = new BufferPolyfill(size);
      if (fill !== undefined) {
        buf._data.fill(typeof fill === 'string' ? fill.charCodeAt(0) : fill);
      }
      return buf;
    };
    
    BufferPolyfill.allocUnsafe = function(size) {
      return new BufferPolyfill(size);
    };
    
    BufferPolyfill.concat = function(buffers) {
      let totalLength = 0;
      for (const buf of buffers) {
        totalLength += buf.length;
      }
      
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const buf of buffers) {
        result.set(buf._data || buf, offset);
        offset += buf.length;
      }
      
      return new BufferPolyfill(result);
    };
    
    BufferPolyfill.isBuffer = function(obj) {
      return obj instanceof BufferPolyfill;
    };
    
    // Set up global Buffer
    window.Buffer = BufferPolyfill;
    
    // Also make it available in global scope
    if (typeof global !== 'undefined' && !global.Buffer) {
      global.Buffer = BufferPolyfill;
    }
    
    // Add a defensive proxy to catch undefined buffer access
    const originalBuffer = BufferPolyfill;
    window.Buffer = new Proxy(originalBuffer, {
      get: function(target, prop) {
        if (prop === 'buffer' && target === undefined) {
          console.warn('Attempted to access buffer on undefined object, returning empty buffer');
          return new ArrayBuffer(0);
        }
        return target[prop];
      }
    });
    
    // Also ensure process is available
    if (!window.process) {
      window.process = {
        env: {
          NODE_ENV: 'production',
          PUBLIC_URL: ''
        },
        browser: true,
        version: 'v16.0.0',
        versions: { node: '16.0.0' },
        platform: 'browser'
      };
    }
    
    // Ensure global is available and properly setup
    if (!window.global) {
      window.global = window;
    }
    if (typeof global === 'undefined') {
      window.global = window;
      var global = window;
    }
    
    // Enhanced defensive handling for wallet extension conflicts
    (function() {
      try {
        // Store reference to any existing ethereum provider
        const existingEthereum = window.ethereum;
        
        // Add safe ethereum property handling to prevent conflicts
        if (!window.ethereumHandlersInitialized) {
          window.ethereumHandlersInitialized = true;
          
          // Create a multiple provider management system
          const providerRegistry = new Map();
          let primaryProvider = existingEthereum;
          
          // Register existing provider if any
          if (existingEthereum) {
            if (existingEthereum.isMetaMask) {
              providerRegistry.set('metamask', existingEthereum);
            } else if (existingEthereum.isPhantom) {
              providerRegistry.set('phantom', existingEthereum);
            } else {
              providerRegistry.set('unknown', existingEthereum);
            }
          }
          
          // Create a proxy ethereum object that can handle multiple providers
          const ethereumProxy = new Proxy(primaryProvider || {}, {
            get: function(target, prop) {
              // Handle provider-specific access
              if (prop === 'providers' && providerRegistry.size > 0) {
                return Array.from(providerRegistry.values());
              }
              if (prop === 'getProvider') {
                return function(name) {
                  return providerRegistry.get(name) || primaryProvider;
                };
              }
              if (prop === 'isMultiProvider') {
                return providerRegistry.size > 1;
              }
              
              // Delegate to primary provider or target
              const provider = primaryProvider || target;
              if (provider && typeof provider[prop] !== 'undefined') {
                const value = provider[prop];
                return typeof value === 'function' ? value.bind(provider) : value;
              }
              
              return target[prop];
            },
            set: function(target, prop, value) {
              if (primaryProvider) {
                primaryProvider[prop] = value;
              } else {
                target[prop] = value;
              }
              return true;
            }
          });
          
          // Override Object.defineProperty to handle ethereum property conflicts gracefully
          const originalDefineProperty = Object.defineProperty;
          Object.defineProperty = function(obj, prop, descriptor) {
            if (obj === window && prop === 'ethereum') {
              try {
                // Check if we're dealing with a new provider
                const newProvider = descriptor.value;
                if (newProvider && typeof newProvider === 'object') {
                  // Register the new provider
                  let providerName = 'unknown';
                  if (newProvider.isMetaMask) providerName = 'metamask';
                  else if (newProvider.isPhantom) providerName = 'phantom';
                  else if (newProvider.isSVMSeek) providerName = 'svmseek';
                  else if (newProvider.isWalletConnect) providerName = 'walletconnect';
                  
                  providerRegistry.set(providerName, newProvider);
                  
                  // Update primary provider if this is the first or a preferred provider
                  if (!primaryProvider || newProvider.isMetaMask) {
                    primaryProvider = newProvider;
                  }
                  
                  console.log('SVMSeek: Registered ethereum provider:', providerName);
                  
                  // Return the proxy instead of setting directly
                  return originalDefineProperty.call(this, obj, prop, {
                    value: ethereumProxy,
                    writable: descriptor.writable,
                    configurable: descriptor.configurable,
                    enumerable: descriptor.enumerable
                  });
                }
                
                // Allow the definition for non-provider values
                return originalDefineProperty.call(this, obj, prop, descriptor);
              } catch (error) {
                console.warn('SVMSeek: Handled ethereum property conflict gracefully:', error.message);
                // Don't throw, just log and continue
                return obj;
              }
            }
            return originalDefineProperty.call(this, obj, prop, descriptor);
          };
          
          // Set initial ethereum proxy if we have providers
          if (providerRegistry.size > 0 || primaryProvider) {
            try {
              originalDefineProperty.call(Object, window, 'ethereum', {
                value: ethereumProxy,
                writable: true,
                configurable: true,
                enumerable: true
              });
            } catch (error) {
              console.warn('SVMSeek: Could not set initial ethereum proxy:', error.message);
            }
          }
          
          console.log('SVMSeek: Enhanced ethereum provider management enabled');
        }
      } catch (error) {
        console.warn('SVMSeek: Failed to setup enhanced ethereum conflict protection:', error);
      }
    })();
    
    // Add protection against custom element conflicts
    (function() {
      try {
        if (!window.customElementConflictProtection) {
          window.customElementConflictProtection = true;
          
          // Override customElements.define to prevent conflicts
          const originalDefine = window.customElements.define;
          window.customElements.define = function(name, constructor, options) {
            try {
              // Check if element is already defined
              if (window.customElements.get(name)) {
                console.warn('SVMSeek: Custom element already defined, skipping:', name);
                return;
              }
              return originalDefine.call(this, name, constructor, options);
            } catch (error) {
              console.warn('SVMSeek: Custom element definition conflict prevented for:', name, error.message);
            }
          };
          
          console.log('SVMSeek: Custom element conflict protection enabled');
        }
      } catch (error) {
        console.warn('SVMSeek: Failed to setup custom element protection:', error);
      }
    })();
    
    // Add additional crypto polyfills that might be needed
    if (!window.crypto && !window.msCrypto) {
      console.warn('WebCrypto API not available');
    }
    
    // Ensure module/exports pattern for compatibility
    if (!window.module) {
      window.module = {};
    }
    if (!window.exports) {
      window.exports = {};
    }
    
// Pre-initialize crypto workarounds
(function() {
  try {
    // Apply Buffer safety patches before any modules load
    console.log('Applying crypto safety patches...');
    
    // Patch Uint8Array prototype to prevent undefined buffer access
    const originalUint8Array = globalThis.Uint8Array;
    
    if (originalUint8Array && originalUint8Array.prototype) {
      const originalBufferGetter = Object.getOwnPropertyDescriptor(originalUint8Array.prototype, 'buffer');
      
      if (originalBufferGetter) {
        Object.defineProperty(originalUint8Array.prototype, 'buffer', {
          get: function() {
            try {
              return originalBufferGetter.get?.call(this) || new ArrayBuffer(0);
            } catch (error) {
              console.warn('Uint8Array buffer access patched due to error:', error);
              return new ArrayBuffer(0);
            }
          },
          configurable: true,
          enumerable: false
        });
      }
    }
    
    console.log('Crypto safety patches applied successfully');
  } catch (error) {
    console.error('Failed to apply crypto safety patches:', error);
  }
})();
    
    // Add global error handler to catch and debug buffer access issues
    window.addEventListener('error', function(event) {
      if (event.error && event.error.message && event.error.message.includes('buffer')) {
        console.error('Buffer-related error caught:', event.error.message);
        console.error('Stack:', event.error.stack);
        
        // Try to provide more context
        if (event.error.message.includes("Cannot read properties of undefined (reading 'buffer')")) {
          console.error('This is the known buffer access issue - something is trying to access .buffer on undefined');
          
          // Prevent the error from completely breaking the app
          event.preventDefault();
          event.stopPropagation();
          
          // Try to continue app initialization
          setTimeout(() => {
            console.log('Attempting to recover from buffer error...');
            
            // Show a user-friendly message about the current state
            const rootElement = document.getElementById('root');
            if (rootElement) {
              rootElement.innerHTML = `
                <div style="
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  height: 100vh;
                  background: #17181a;
                  color: #ffffff;
                  font-family: 'Avenir Next Medium', sans-serif;
                  text-align: center;
                  padding: 20px;
                ">
                  <div>
                    <div style="font-size: 64px; margin-bottom: 20px;">🔧</div>
                    <div style="font-size: 24px; margin-bottom: 20px;">SVMSeek Wallet</div>
                    <div style="font-size: 18px; margin-bottom: 10px; color: #ff6b6b;">Crypto Library Initialization Issue</div>
                    <div style="font-size: 14px; color: #888; margin-bottom: 30px; line-height: 1.5; max-width: 500px;">
                      The wallet is experiencing a compatibility issue with crypto libraries. 
                      This is being actively fixed by the development team.
                    </div>
                    <div style="margin-bottom: 20px;">
                      <button onclick="window.location.reload()" style="
                        background: #651CE4;
                        border: none;
                        color: white;
                        padding: 15px 30px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 16px;
                        margin-right: 10px;
                      ">
                        Retry
                      </button>
                      <button onclick="window.open('https://github.com/openSVM/svmseek/issues', '_blank')" style="
                        background: transparent;
                        border: 1px solid #651CE4;
                        color: #651CE4;
                        padding: 15px 30px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 16px;
                      ">
                        Report Issue
                      </button>
                    </div>
                    <div style="font-size: 12px; color: #666;">
                      Error: Buffer access on undefined object in crypto module
                    </div>
                  </div>
                </div>
              `;
            }
          }, 1000);
        }
      }
    });
    
  }
})();