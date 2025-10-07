// Quick script to update remaining controllers with OrganizationId decorator

import * as fs from 'fs';

const files = [
  'src/criteria/criteria.controller.ts',
  'src/settings/settings.controller.ts',
  'src/user/user.controller.ts',
];

for (const file of files) {
  console.log(`Processing ${file}...`);

  let content = fs.readFileSync(file, 'utf-8');

  // Add import if not exists
  if (!content.includes("import { OrganizationId }")) {
    const importLine = "import { OrganizationId } from '../auth/organization-id.decorator.js';";

    // Find last import
    const lastImportIndex = content.lastIndexOf('import ');
    const nextNewlineIndex = content.indexOf('\n', lastImportIndex);

    content = content.slice(0, nextNewlineIndex + 1) + importLine + '\n' + content.slice(nextNewlineIndex + 1);
  }

  fs.writeFileSync(file, content);
  console.log(`✓ Updated ${file}`);
}

console.log('\nDone! Please manually add @OrganizationId() parameters to controller methods.');
