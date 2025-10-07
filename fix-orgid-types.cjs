const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript files in src directory
const files = glob.sync('src/**/*.ts', { cwd: __dirname, absolute: true });

let totalChanges = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  const original = content;

  // Replace organizationId: string with organizationId: number in type declarations
  content = content.replace(/organizationId:\s*string/g, 'organizationId: number');

  // Replace organizationId?: string with organizationId?: number
  content = content.replace(/organizationId\?:\s*string/g, 'organizationId?: number');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf-8');
    totalChanges++;
    console.log(`✓ Fixed: ${path.relative(__dirname, file)}`);
  }
});

console.log(`\n✅ Fixed ${totalChanges} files`);
