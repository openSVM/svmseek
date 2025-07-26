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
    
    // Also ensure process is available
    if (!window.process) {
      window.process = {
        env: {},
        browser: true,
        version: '',
        versions: { node: '16.0.0' }
      };
    }
    
    // Ensure global is available
    if (!window.global) {
      window.global = window;
    }
    
    console.log('Buffer polyfill loaded successfully');
  }
})();