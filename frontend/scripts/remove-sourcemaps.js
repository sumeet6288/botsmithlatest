#!/usr/bin/env node
/**
 * Remove Source Maps Script
 * This script removes all source map files and references from the production build
 * to prevent code visibility in DevTools
 */

const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.join(__dirname, '..', 'build');

console.log('🔒 Removing source maps for production...');
console.log('Build directory:', BUILD_DIR);

function removeSourceMaps(dir) {
  let count = 0;
  
  if (!fs.existsSync(dir)) {
    console.log('❌ Build directory not found!');
    return count;
  }

  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  files.forEach(file => {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      // Recursively process subdirectories
      count += removeSourceMaps(fullPath);
    } else if (file.name.endsWith('.map')) {
      // Delete .map files
      fs.unlinkSync(fullPath);
      console.log(`✓ Deleted: ${file.name}`);
      count++;
    } else if (file.name.endsWith('.js') || file.name.endsWith('.css')) {
      // Remove sourceMappingURL comments from JS and CSS files
      let content = fs.readFileSync(fullPath, 'utf8');
      const originalLength = content.length;
      
      // Remove sourceMappingURL comments
      content = content.replace(/\/\/# sourceMappingURL=.+\.map\s*$/gm, '');
      content = content.replace(/\/\*# sourceMappingURL=.+\.map \*\/\s*$/gm, '');
      
      if (content.length !== originalLength) {
        fs.writeFileSync(fullPath, content);
        console.log(`✓ Cleaned sourcemap reference in: ${file.name}`);
        count++;
      }
    }
  });
  
  return count;
}

try {
  const removedCount = removeSourceMaps(BUILD_DIR);
  console.log('\n✅ Source map removal complete!');
  console.log(`   Removed/cleaned ${removedCount} files`);
  console.log('\n🔒 Your code is now protected from easy inspection!');
} catch (error) {
  console.error('❌ Error removing source maps:', error);
  process.exit(1);
}
