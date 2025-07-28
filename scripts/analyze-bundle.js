#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Bundle analyzer script to identify large dependencies and optimization opportunities
 */

console.log('🔍 Analyzing bundle size and dependencies...\n');

// Check if build directory exists
const buildDir = path.join(__dirname, '../build');
if (!fs.existsSync(buildDir)) {
  console.error('❌ Build directory not found. Run "yarn build" first.');
  process.exit(1);
}

// Analyze static files in build directory
const staticDir = path.join(buildDir, 'static');
if (!fs.existsSync(staticDir)) {
  console.error('❌ Static directory not found in build.');
  process.exit(1);
}

function getFileSizes(dir) {
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...getFileSizes(fullPath));
    } else {
      const stats = fs.statSync(fullPath);
      files.push({
        name: path.relative(buildDir, fullPath),
        size: stats.size,
        sizeKB: Math.round(stats.size / 1024),
        sizeMB: Math.round(stats.size / (1024 * 1024) * 100) / 100
      });
    }
  }
  
  return files;
}

// Get all file sizes
const files = getFileSizes(staticDir);
const jsFiles = files.filter(f => f.name.endsWith('.js'));
const cssFiles = files.filter(f => f.name.endsWith('.css'));

// Sort by size descending
jsFiles.sort((a, b) => b.size - a.size);
cssFiles.sort((a, b) => b.size - a.size);

// Calculate totals
const totalJSSize = jsFiles.reduce((sum, f) => sum + f.size, 0);
const totalCSSSize = cssFiles.reduce((sum, f) => sum + f.size, 0);
const totalSize = totalJSSize + totalCSSSize;

console.log('📊 Bundle Analysis Results:');
console.log('═'.repeat(50));

console.log(`\n📦 Total Bundle Size: ${Math.round(totalSize / (1024 * 1024) * 100) / 100} MB`);
console.log(`   JavaScript: ${Math.round(totalJSSize / (1024 * 1024) * 100) / 100} MB`);
console.log(`   CSS: ${Math.round(totalCSSSize / 1024)} KB`);

console.log('\n🔥 Largest JavaScript Files:');
console.log('─'.repeat(50));
jsFiles.slice(0, 10).forEach((file, index) => {
  const sizeDisplay = file.sizeMB >= 1 ? `${file.sizeMB} MB` : `${file.sizeKB} KB`;
  console.log(`${index + 1}.`.padStart(3) + ` ${file.name.padEnd(35)} ${sizeDisplay}`);
});

if (cssFiles.length > 0) {
  console.log('\n🎨 CSS Files:');
  console.log('─'.repeat(50));
  cssFiles.forEach((file, index) => {
    console.log(`${index + 1}.`.padStart(3) + ` ${file.name.padEnd(35)} ${file.sizeKB} KB`);
  });
}

// Recommendations
console.log('\n💡 Optimization Recommendations:');
console.log('─'.repeat(50));

if (totalJSSize > 2 * 1024 * 1024) { // > 2MB
  console.log('⚠️  JavaScript bundle is very large (>2MB)');
  console.log('   → Consider lazy loading heavy dependencies');
  console.log('   → Split vendor libraries into separate chunks');
  console.log('   → Use dynamic imports for routes and heavy components');
}

const mainJS = jsFiles.find(f => f.name.includes('main.'));
if (mainJS && mainJS.size > 1024 * 1024) { // > 1MB
  console.log('⚠️  Main bundle is too large (>1MB)');
  console.log('   → Move crypto libraries to separate chunk');
  console.log('   → Lazy load non-critical UI components');
}

const hasLargeCrypto = jsFiles.some(f => f.sizeKB > 200);
if (hasLargeCrypto) {
  console.log('🔐 Large crypto dependencies detected');
  console.log('   → Consider using lighter alternatives where possible');
  console.log('   → Implement crypto operations in web workers');
}

console.log('\n✅ Analysis complete!');

// Exit with error code if bundle is too large
if (totalSize > 3 * 1024 * 1024) { // > 3MB total
  console.log('\n🚨 Bundle size exceeds recommended limits!');
  process.exit(1);
}