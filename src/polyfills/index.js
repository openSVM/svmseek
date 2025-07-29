/* eslint-disable no-undef */
// Import the browser-compatible crypto utilities FIRST
import '../utils/crypto-browser-compatible.js';

// Import the ultimate fix
import './ultimate-fix.js';
import { devLog } from '../utils/logger';

devLog('Buffer polyfills loaded with browser-compatible crypto and ultimate protection');