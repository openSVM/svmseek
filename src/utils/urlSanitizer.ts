/**
 * URL sanitization utility to prevent security issues with localhost/IP addresses
 * and ensure only safe, public URLs are allowed
 */

export interface URLValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedUrl?: string;
}

/**
 * Validates and sanitizes URLs to prevent security vulnerabilities
 * Blocks localhost, private IPs, and malformed URLs
 */
export function validateAndSanitizeUrl(url: string, options?: {
  allowLocalhost?: boolean;
  allowPrivateIPs?: boolean;
  maxLength?: number;
}): URLValidationResult {
  const {
    allowLocalhost = false,
    allowPrivateIPs = false,
    maxLength = 2048
  } = options || {};

  // Basic length check
  if (!url || url.length > maxLength) {
    return {
      isValid: false,
      error: `URL must be between 1 and ${maxLength} characters`
    };
  }

  // Basic format validation
  const urlPattern = /^https?:\/\/.+/;
  if (!urlPattern.test(url)) {
    return {
      isValid: false,
      error: 'URL must start with http:// or https://'
    };
  }

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // Check for localhost
    if (!allowLocalhost && isLocalhost(hostname)) {
      return {
        isValid: false,
        error: 'Localhost URLs are not allowed for security reasons'
      };
    }

    // Check for private IP addresses
    if (!allowPrivateIPs && isPrivateIP(hostname)) {
      return {
        isValid: false,
        error: 'Private IP addresses are not allowed for security reasons'
      };
    }

    // Check for suspicious patterns
    if (hasSuspiciousPatterns(url)) {
      return {
        isValid: false,
        error: 'URL contains suspicious patterns'
      };
    }

    return {
      isValid: true,
      sanitizedUrl: url.trim()
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid URL format'
    };
  }
}

/**
 * Check if hostname is localhost
 */
function isLocalhost(hostname: string): boolean {
  const localhostPatterns = [
    'localhost',
    '127.0.0.1',
    '::1',
    '0.0.0.0'
  ];
  return localhostPatterns.includes(hostname);
}

/**
 * Check if hostname is a private IP address
 */
function isPrivateIP(hostname: string): boolean {
  // IPv4 private ranges
  const ipv4Pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = hostname.match(ipv4Pattern);
  
  if (match) {
    const [, a, b, c, d] = match.map(Number);
    
    // 10.0.0.0/8
    if (a === 10) return true;
    
    // 172.16.0.0/12
    if (a === 172 && b >= 16 && b <= 31) return true;
    
    // 192.168.0.0/16
    if (a === 192 && b === 168) return true;
    
    // 169.254.0.0/16 (link-local)
    if (a === 169 && b === 254) return true;
  }

  // IPv6 private ranges (simplified check)
  if (hostname.startsWith('fe80:') || hostname.startsWith('fc00:') || hostname.startsWith('fd00:')) {
    return true;
  }

  return false;
}

/**
 * Check for suspicious patterns in URLs
 */
function hasSuspiciousPatterns(url: string): boolean {
  const suspiciousPatterns = [
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /file:/i,
    /<script/i,
    /onload=/i,
    /onerror=/i
  ];

  return suspiciousPatterns.some(pattern => pattern.test(url));
}

/**
 * Specific validation for repository URLs (GitHub, GitLab, etc.)
 */
export function validateRepositoryUrl(url: string): URLValidationResult {
  const result = validateAndSanitizeUrl(url);
  
  if (!result.isValid) {
    return result;
  }

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Allow common code hosting platforms
    const allowedHosts = [
      'github.com',
      'gitlab.com',
      'bitbucket.org',
      'codeberg.org',
      'gitea.com',
      'git.sr.ht'
    ];

    if (!allowedHosts.some(host => hostname === host || hostname.endsWith('.' + host))) {
      return {
        isValid: false,
        error: 'Only repositories from trusted platforms (GitHub, GitLab, Bitbucket, etc.) are allowed'
      };
    }

    return result;
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid repository URL format'
    };
  }
}

/**
 * Validation for MCP server endpoints
 */
export function validateMCPEndpoint(url: string): URLValidationResult {
  const result = validateAndSanitizeUrl(url);
  
  if (!result.isValid) {
    return result;
  }

  try {
    const urlObj = new URL(url);
    
    // MCP endpoints should use HTTPS in production
    if (urlObj.protocol !== 'https:' && urlObj.protocol !== 'http:') {
      return {
        isValid: false,
        error: 'MCP endpoints must use HTTP or HTTPS protocol'
      };
    }

    // Additional validation for MCP-specific patterns
    if (!urlObj.pathname || urlObj.pathname === '/') {
      return {
        isValid: false,
        error: 'MCP endpoint must include a specific path'
      };
    }

    return result;
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid MCP endpoint URL format'
    };
  }
}