/**
 * Browser polyfill for Node.js fs module
 * Provides minimal fs compatibility for browser environments
 */

// Minimal fs polyfill for browser compatibility
const fs = {
  // File system operations not available in browser
  readFile: () => {
    throw new Error('fs.readFile is not available in browser environment');
  },
  
  writeFile: () => {
    throw new Error('fs.writeFile is not available in browser environment');
  },
  
  readFileSync: () => {
    throw new Error('fs.readFileSync is not available in browser environment');
  },
  
  writeFileSync: () => {
    throw new Error('fs.writeFileSync is not available in browser environment');
  },
  
  existsSync: () => {
    return false; // Files don't exist in browser context
  },
  
  exists: (path, callback) => {
    if (typeof callback === 'function') {
      callback(false);
    }
  },
  
  stat: () => {
    throw new Error('fs.stat is not available in browser environment');
  },
  
  statSync: () => {
    throw new Error('fs.statSync is not available in browser environment');
  },
  
  mkdir: () => {
    throw new Error('fs.mkdir is not available in browser environment');
  },
  
  mkdirSync: () => {
    throw new Error('fs.mkdirSync is not available in browser environment');
  },
  
  // Constants that some libraries might expect
  constants: {
    F_OK: 0,
    R_OK: 4,
    W_OK: 2,
    X_OK: 1,
  },
  
  // Promises API
  promises: {
    readFile: () => Promise.reject(new Error('fs.promises.readFile is not available in browser environment')),
    writeFile: () => Promise.reject(new Error('fs.promises.writeFile is not available in browser environment')),
    stat: () => Promise.reject(new Error('fs.promises.stat is not available in browser environment')),
    mkdir: () => Promise.reject(new Error('fs.promises.mkdir is not available in browser environment')),
    access: () => Promise.reject(new Error('fs.promises.access is not available in browser environment')),
  }
};

export default fs;
export const {
  readFile,
  writeFile,
  readFileSync,
  writeFileSync,
  existsSync,
  exists,
  stat,
  statSync,
  mkdir,
  mkdirSync,
  constants,
  promises
} = fs;