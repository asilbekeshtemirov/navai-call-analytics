const fs = require('fs');
const path = require('path');

console.log('Fixing remaining type errors...\n');

// Fix 1-2: prisma/seed.ts
const seedPath = path.join(__dirname, 'prisma', 'seed.ts');
let seedContent = fs.readFileSync(seedPath, 'utf-8');
seedContent = seedContent.replace(/id:\s*'default-org-id'/g, "id: 1");
seedContent = seedContent.replace(/{\s*id:\s*'default-org-id'\s*}/g, "{ id: 1 }");
fs.writeFileSync(seedPath, seedContent, 'utf-8');
console.log('✓ Fixed: prisma/seed.ts');

// Fix 3: src/call/call.service.ts
const callServicePath = path.join(__dirname, 'src', 'call', 'call.service.ts');
let callServiceContent = fs.readFileSync(callServicePath, 'utf-8');
callServiceContent = callServiceContent.replace(/organizationId:\s*'default-org-id'/g, "organizationId: 1");
fs.writeFileSync(callServicePath, callServiceContent, 'utf-8');
console.log('✓ Fixed: src/call/call.service.ts');

// Fix 4-5: src/organization/organization.service.ts
const orgServicePath = path.join(__dirname, 'src', 'organization', 'organization.service.ts');
let orgServiceContent = fs.readFileSync(orgServicePath, 'utf-8');
orgServiceContent = orgServiceContent.replace(/async findOne\(id:\s*string\)/g, "async findOne(id: number)");
orgServiceContent = orgServiceContent.replace(/async updateStatus\(id:\s*string/g, "async updateStatus(id: number");
fs.writeFileSync(orgServicePath, orgServiceContent, 'utf-8');
console.log('✓ Fixed: src/organization/organization.service.ts');

// Fix 6-7: src/sipuni/sipuni.service.ts
const sipuniServicePath = path.join(__dirname, 'src', 'sipuni', 'sipuni.service.ts');
let sipuniServiceContent = fs.readFileSync(sipuniServicePath, 'utf-8');

// Fix setupDynamicCronJob signature
sipuniServiceContent = sipuniServiceContent.replace(
  /private async setupDynamicCronJob\(\s*orgId:\s*string/g,
  "private async setupDynamicCronJob(\n    orgId: number"
);

// Fix syncFromMonthStart signature
sipuniServiceContent = sipuniServiceContent.replace(
  /private async syncFromMonthStart\(\s*organizationId:\s*string/g,
  "private async syncFromMonthStart(\n    organizationId: number"
);

fs.writeFileSync(sipuniServicePath, sipuniServiceContent, 'utf-8');
console.log('✓ Fixed: src/sipuni/sipuni.service.ts');

console.log('\n✅ All remaining errors fixed!');
