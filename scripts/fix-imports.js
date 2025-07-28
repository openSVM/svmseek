#!/usr/bin/env node

/**
 * Script to fix malformed import statements caused by the logger insertion
 */

const fs = require('fs');
const path = require('path');

function fixImportStatements(content) {
  // Fix the pattern where logger import was inserted in the middle of another import
  const fixedContent = content.replace(
    /import\s*\{\s*\n\s*import\s*\{\s*([^}]+)\s*\}\s*from\s*['"']([^'"]+)['"'];?\s*\n/g,
    'import { $1 } from \'$2\';\nimport {\n'
  );
  
  return fixedContent;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixed = fixImportStatements(content);
    
    if (fixed !== content) {
      fs.writeFileSync(filePath, fixed);
      console.log(`✅ Fixed imports in: ${path.relative(process.cwd(), filePath)}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath, { withFileTypes: true });
  let totalFixed = 0;
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item.name);
    
    if (item.isDirectory()) {
      // Skip certain directories
      if (!['node_modules', '.git', 'build', 'dist', 'screenshots'].includes(item.name)) {
        totalFixed += processDirectory(fullPath);
      }
    } else {
      // Only process relevant file types
      const ext = path.extname(item.name).toLowerCase();
      if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
        if (processFile(fullPath)) {
          totalFixed++;
        }
      }
    }
  }
  
  return totalFixed;
}

// Main execution
console.log('🔧 Fixing malformed import statements...\n');

const srcPath = path.join(process.cwd(), 'src');
const fixedCount = processDirectory(srcPath);

console.log(`\n✨ Fixed ${fixedCount} files with import issues`);