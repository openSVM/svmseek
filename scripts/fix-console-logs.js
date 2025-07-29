#!/usr/bin/env node

/**
 * Script to replace console.log statements with production-safe logging
 */

const fs = require('fs');
const path = require('path');

// Import list from our logger
const loggerImports = {
  'console.log(': 'devLog(',
  'console.debug(': 'logDebug(',
  'console.info(': 'logInfo(',
  'console.warn(': 'logWarn(',
  'console.error(': 'logError(',
};

function updateConsoleStatements(filePath, content) {
  let updated = content;
  let hasChanges = false;
  
  // Check if file already imports logger
  const hasLoggerImport = content.includes("from '../utils/logger'") || content.includes("from './logger'") || content.includes("from '../../utils/logger'");
  
  Object.entries(loggerImports).forEach(([consoleCall, loggerCall]) => {
    if (content.includes(consoleCall)) {
      updated = updated.replace(new RegExp(consoleCall.replace('(', '\\('), 'g'), loggerCall);
      hasChanges = true;
    }
  });
  
  if (hasChanges && !hasLoggerImport) {
    // Add logger import at the top
    const importStatement = getLoggerImportStatement(filePath);
    
    // Find the best place to insert the import
    const lines = updated.split('\n');
    let insertIndex = 0;
    
    // Find last import statement
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ') || lines[i].startsWith('const ') && lines[i].includes('require(')) {
        insertIndex = i + 1;
      } else if (lines[i].trim() === '' || lines[i].startsWith('//') || lines[i].startsWith('/*')) {
        continue;
      } else {
        break;
      }
    }
    
    lines.splice(insertIndex, 0, importStatement);
    updated = lines.join('\n');
  }
  
  return { updated, hasChanges };
}

function getLoggerImportStatement(filePath) {
  // Calculate relative path to logger
  const relativePath = path.relative(path.dirname(filePath), path.join(process.cwd(), 'src/utils'));
  const importPath = relativePath ? `${relativePath}/logger` : './logger';
  
  return `import { devLog, logDebug, logInfo, logWarn, logError } from '${importPath}';`;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { updated, hasChanges } = updateConsoleStatements(filePath, content);
    
    if (hasChanges) {
      fs.writeFileSync(filePath, updated);
      console.log(`✅ Updated: ${path.relative(process.cwd(), filePath)}`);
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
  let totalUpdated = 0;
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item.name);
    
    if (item.isDirectory()) {
      // Skip certain directories
      if (!['node_modules', '.git', 'build', 'dist', 'screenshots'].includes(item.name)) {
        totalUpdated += processDirectory(fullPath);
      }
    } else {
      // Only process relevant file types
      const ext = path.extname(item.name).toLowerCase();
      if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
        if (processFile(fullPath)) {
          totalUpdated++;
        }
      }
    }
  }
  
  return totalUpdated;
}

// Main execution
console.log('🔧 Replacing console statements with production-safe logging...\n');

const srcPath = path.join(process.cwd(), 'src');
const updatedCount = processDirectory(srcPath);

console.log(`\n✨ Processed ${updatedCount} files with console statement updates`);

if (updatedCount > 0) {
  console.log('\n📝 Remember to:');
  console.log('1. Review the changes to make sure imports are correct');
  console.log('2. Test that the application still works correctly');
  console.log('3. Run linting to fix any import issues');
}