const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf-8');

// Replace Organization id type
schema = schema.replace(
  /model Organization \{[\s\S]*?id\s+String\s+@id\s+@default\(uuid\(\)\)/,
  (match) => match.replace('String       @id @default(uuid())', 'Int          @id @default(autoincrement())')
);

// Replace all organizationId String to Int
schema = schema.replace(/organizationId\s+String/g, 'organizationId  Int');

fs.writeFileSync(schemaPath, schema, 'utf-8');
console.log('✅ Schema fixed: Organization.id changed to Int and all organizationId fields updated');
