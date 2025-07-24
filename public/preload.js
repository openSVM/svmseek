const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  
  // Platform detection helpers
  isWindows: () => process.platform === 'win32',
  isMacOS: () => process.platform === 'darwin',
  isLinux: () => process.platform === 'linux',
  
  // App info
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  }
});

// Security: Remove Node.js globals in renderer process
delete window.require;
delete window.exports;
delete window.module;