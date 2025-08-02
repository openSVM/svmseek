/**
 * Browser-compatible polyfill for Node.js 'os' module
 * Provides stub implementations that don't crash in browser environment
 */

// Browser-safe implementations
const EOL = '\n';

function arch() {
  return 'browser';
}

function platform() {
  if (typeof navigator !== 'undefined') {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('mac')) return 'darwin';
    if (userAgent.includes('win')) return 'win32';
    if (userAgent.includes('linux')) return 'linux';
  }
  return 'browser';
}

function release() {
  return '1.0.0';
}

function hostname() {
  if (typeof window !== 'undefined' && window.location) {
    return window.location.hostname || 'localhost';
  }
  return 'localhost';
}

function homedir() {
  // In browser, return a safe default instead of throwing
  return '/home/user';
}

function tmpdir() {
  return '/tmp';
}

function userInfo() {
  return {
    uid: 1000,
    gid: 1000,
    username: 'user',
    homedir: homedir(),
    shell: '/bin/bash'
  };
}

function cpus() {
  // Return stub CPU info
  const numCores = typeof navigator !== 'undefined' && navigator.hardwareConcurrency 
    ? navigator.hardwareConcurrency 
    : 4;
  
  return Array(numCores).fill({
    model: 'Browser CPU',
    speed: 2400,
    times: {
      user: 0,
      nice: 0,
      sys: 0,
      idle: 0,
      irq: 0
    }
  });
}

function freemem() {
  // Return estimated free memory (256MB)
  return 256 * 1024 * 1024;
}

function totalmem() {
  // Return estimated total memory (2GB)
  return 2 * 1024 * 1024 * 1024;
}

function loadavg() {
  return [0.1, 0.1, 0.1];
}

function uptime() {
  return Math.floor(Date.now() / 1000);
}

function networkInterfaces() {
  return {};
}

function type() {
  return platform();
}

// Export all the functions
module.exports = {
  EOL,
  arch,
  platform,
  release,
  hostname,
  homedir,
  tmpdir,
  userInfo,
  cpus,
  freemem,
  totalmem,
  loadavg,
  uptime,
  networkInterfaces,
  type
};

// Also provide default export for ES6 imports
module.exports.default = module.exports;