#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Comprehensive Security Audit for SVMSeek Wallet
 * Scans for common security vulnerabilities and bad practices
 */

console.log('🔒 SVMSeek Wallet Security Audit\n');
console.log('='.repeat(50));

let issues = [];
let warnings = [];
let passed = [];

// Security patterns to check
const securityChecks = {
  // Critical security issues
  critical: [
    {
      name: 'Global variable modifications',
      pattern: /(global|window)\s*\.\s*\w+\s*=/g,
      message: 'Modifying global variables can lead to security vulnerabilities'
    },
    {
      name: 'eval() usage',
      pattern: /\beval\s*\(/g,
      message: 'eval() can execute arbitrary code and is a security risk'
    },
    {
      name: 'Script URLs',
      pattern: /javascript:\s*[^"'`\s]/g,
      message: 'Script URLs are a form of eval and pose XSS risks'
    },
    {
      name: 'Unsafe innerHTML',
      pattern: /\.innerHTML\s*=\s*[^"'`\s]/g,
      message: 'Direct innerHTML assignment can lead to XSS vulnerabilities'
    },
    {
      name: 'Unsafe outerHTML',
      pattern: /\.outerHTML\s*=\s*[^"'`\s]/g,
      message: 'Direct outerHTML assignment can lead to XSS vulnerabilities'
    }
  ],

  // Warning-level issues
  warnings: [
    {
      name: 'Console.log in production',
      pattern: /console\.(log|debug|info)\s*\(/g,
      message: 'Console statements should be removed in production builds'
    },
    {
      name: 'Hardcoded secrets pattern',
      pattern: /(secret|password|key|token)\s*[=:]\s*['"]/gi,
      message: 'Potential hardcoded secrets detected'
    },
    {
      name: 'Unsafe localStorage usage',
      pattern: /localStorage\.setItem\s*\(\s*['"](seed|mnemonic|private|key)['"]/gi,
      message: 'Sensitive data should be encrypted before localStorage storage'
    },
    {
      name: 'HTTP URLs in production',
      pattern: /http:\/\/(?!localhost|127\.0\.0\.1)/g,
      message: 'HTTP URLs should be HTTPS in production'
    }
  ],

  // Best practices
  practices: [
    {
      name: 'TODO comments',
      pattern: /\/\/\s*TODO|\/\*\s*TODO|\#\s*TODO/gi,
      message: 'TODO comments indicate incomplete implementation'
    },
    {
      name: 'FIXME comments', 
      pattern: /\/\/\s*FIXME|\/\*\s*FIXME|\#\s*FIXME/gi,
      message: 'FIXME comments indicate known issues'
    }
  ]
};

function scanFile(filePath, content) {
  const relativePath = path.relative(process.cwd(), filePath);
  
  // Skip node_modules, build, and test files for some checks
  if (relativePath.includes('node_modules') || 
      relativePath.includes('build/') ||
      relativePath.includes('.test.') ||
      relativePath.includes('__tests__/')) {
    return;
  }

  // Check critical issues
  securityChecks.critical.forEach(check => {
    const matches = content.match(check.pattern);
    if (matches) {
      matches.forEach(match => {
        issues.push({
          severity: 'CRITICAL',
          file: relativePath,
          issue: check.name,
          match: match.trim(),
          message: check.message
        });
      });
    }
  });

  // Check warnings
  securityChecks.warnings.forEach(check => {
    const matches = content.match(check.pattern);
    if (matches) {
      matches.forEach(match => {
        warnings.push({
          severity: 'WARNING',
          file: relativePath,
          issue: check.name,
          match: match.trim(),
          message: check.message
        });
      });
    }
  });

  // Check practices
  securityChecks.practices.forEach(check => {
    const matches = content.match(check.pattern);
    if (matches) {
      matches.forEach(match => {
        warnings.push({
          severity: 'INFO',
          file: relativePath,
          issue: check.name,
          match: match.trim(),
          message: check.message
        });
      });
    }
  });
}

function scanDirectory(dirPath) {
  const items = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item.name);
    
    if (item.isDirectory()) {
      // Skip certain directories
      if (!['node_modules', '.git', 'build', 'dist'].includes(item.name)) {
        scanDirectory(fullPath);
      }
    } else {
      // Only scan relevant file types
      const ext = path.extname(item.name).toLowerCase();
      if (['.js', '.jsx', '.ts', '.tsx', '.json', '.html'].includes(ext)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          scanFile(fullPath, content);
        } catch (error) {
          console.warn(`⚠️  Could not read file: ${fullPath}`);
        }
      }
    }
  }
}

// Additional security configuration checks
function checkSecurityConfigs() {
  console.log('\n🔧 Security Configuration Audit:');
  console.log('-'.repeat(50));

  // Check netlify.toml for security headers
  const netlifyPath = path.join(process.cwd(), 'netlify.toml');
  if (fs.existsSync(netlifyPath)) {
    const netlifyConfig = fs.readFileSync(netlifyPath, 'utf8');
    
    if (netlifyConfig.includes('X-Frame-Options')) {
      passed.push('✅ X-Frame-Options header configured');
    } else {
      issues.push({
        severity: 'WARNING',
        file: 'netlify.toml',
        issue: 'Missing X-Frame-Options',
        message: 'Missing clickjacking protection'
      });
    }

    if (netlifyConfig.includes('Content-Security-Policy')) {
      passed.push('✅ Content Security Policy configured');
    } else {
      issues.push({
        severity: 'CRITICAL',
        file: 'netlify.toml',
        issue: 'Missing CSP',
        message: 'Content Security Policy not configured'
      });
    }

    if (netlifyConfig.includes('X-Content-Type-Options')) {
      passed.push('✅ X-Content-Type-Options header configured');
    } else {
      warnings.push({
        severity: 'WARNING',
        file: 'netlify.toml',
        issue: 'Missing X-Content-Type-Options',
        message: 'MIME type sniffing protection missing'
      });
    }
  }

  // Check package.json for security
  const packagePath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    if (packageJson.private === true) {
      passed.push('✅ Package marked as private');
    } else {
      warnings.push({
        severity: 'WARNING',
        file: 'package.json',
        issue: 'Package not private',
        message: 'Package should be marked as private'
      });
    }
  }

  // Check .env files
  const envFiles = ['.env', '.env.production', '.env.development'];
  envFiles.forEach(envFile => {
    const envPath = path.join(process.cwd(), envFile);
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      if (envContent.includes('sk_') || envContent.includes('pk_') || 
          envContent.match(/[a-fA-F0-9]{32,}/)) {
        issues.push({
          severity: 'CRITICAL',
          file: envFile,
          issue: 'Potential secrets in env file',
          message: 'Environment files should not contain secrets in repository'
        });
      } else {
        passed.push(`✅ ${envFile} appears clean`);
      }
    }
  });
}

// Run the audit
console.log('📁 Scanning source files...\n');
scanDirectory(path.join(process.cwd(), 'src'));

checkSecurityConfigs();

// Report results
console.log('\n📊 Security Audit Results:');
console.log('='.repeat(50));

if (issues.length > 0) {
  console.log(`\n🚨 CRITICAL ISSUES (${issues.length}):`);
  console.log('-'.repeat(30));
  issues.forEach(issue => {
    console.log(`❌ ${issue.issue}`);
    console.log(`   File: ${issue.file}`);
    console.log(`   Issue: ${issue.match || 'Configuration issue'}`);
    console.log(`   Risk: ${issue.message}`);
    console.log('');
  });
}

if (warnings.length > 0) {
  console.log(`\n⚠️  WARNINGS (${warnings.length}):`);
  console.log('-'.repeat(20));
  warnings.forEach(warning => {
    console.log(`⚠️  ${warning.issue}`);
    console.log(`   File: ${warning.file}`);
    console.log(`   Detail: ${warning.match || 'Configuration issue'}`);
    console.log(`   Note: ${warning.message}`);
    console.log('');
  });
}

if (passed.length > 0) {
  console.log(`\n✅ SECURITY MEASURES PASSED (${passed.length}):`);
  console.log('-'.repeat(35));
  passed.forEach(pass => {
    console.log(pass);
  });
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📋 SECURITY AUDIT SUMMARY:');
console.log(`   Critical Issues: ${issues.length}`);
console.log(`   Warnings: ${warnings.length}`);
console.log(`   Passed Checks: ${passed.length}`);

if (issues.length === 0) {
  console.log('\n🎉 No critical security issues found!');
  if (warnings.length === 0) {
    console.log('🛡️  Wallet passes comprehensive security audit!');
  } else {
    console.log('💡 Please address warnings for enhanced security.');
  }
} else {
  console.log('\n🔥 Critical security issues must be addressed before deployment!');
  process.exit(1);
}