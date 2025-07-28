#!/usr/bin/env node

/**
 * Script to clean up TODO and FIXME comments
 */

const fs = require('fs');
const path = require('path');

function cleanTodoComments(content) {
  // Remove empty TODO/FIXME comments or ones that don't provide value
  const patterns = [
    /\/\/\s*TODO[^\n]*/gi,
    /\/\*\s*TODO[^*]*\*\//gi,
    /\/\/\s*FIXME[^\n]*/gi,
    /\/\*\s*FIXME[^*]*\*\//gi,
    /#\s*TODO[^\n]*/gi,
    /#\s*FIXME[^\n]*/gi
  ];
  
  let cleaned = content;
  let removedCount = 0;
  
  patterns.forEach(pattern => {
    const matches = cleaned.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // Only remove generic TODOs, keep specific ones
        if (match.length < 50 || 
            match.toLowerCase().includes('todo: ') || 
            match.toLowerCase().includes('fixme: ') ||
            match.toLowerCase().includes('todo -') ||
            match.toLowerCase().includes('fixme -')) {
          cleaned = cleaned.replace(match, '');
          removedCount++;
        }
      });
    }
  });
  
  // Clean up empty lines left behind
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  return { cleaned, removedCount };
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { cleaned, removedCount } = cleanTodoComments(content);
    
    if (removedCount > 0) {
      fs.writeFileSync(filePath, cleaned);
      console.log(`✅ Cleaned ${removedCount} TODO/FIXME comments from: ${path.relative(process.cwd(), filePath)}`);
      return removedCount;
    }
    return 0;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath, { withFileTypes: true });
  let totalRemoved = 0;
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item.name);
    
    if (item.isDirectory()) {
      // Skip certain directories
      if (!['node_modules', '.git', 'build', 'dist', 'screenshots'].includes(item.name)) {
        totalRemoved += processDirectory(fullPath);
      }
    } else {
      // Only process relevant file types
      const ext = path.extname(item.name).toLowerCase();
      if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
        totalRemoved += processFile(fullPath);
      }
    }
  }
  
  return totalRemoved;
}

// Main execution
console.log('🧹 Cleaning up TODO and FIXME comments...\n');

const srcPath = path.join(process.cwd(), 'src');
const removedCount = processDirectory(srcPath);

console.log(`\n✨ Removed ${removedCount} TODO/FIXME comments from source files`);

if (removedCount > 0) {
  console.log('\n📝 Code is now cleaner and ready for production!');
}