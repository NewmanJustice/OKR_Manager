// set-prisma-provider.js
const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
const provider = process.argv[2]; // "sqlite" or "postgresql"

if (!provider || !['sqlite', 'postgresql'].includes(provider)) {
  console.error('Usage: node set-prisma-provider.js <sqlite|postgresql>');
  process.exit(1);
}

let schema = fs.readFileSync(schemaPath, 'utf8');
schema = schema.replace(
  /provider\s*=\s*"(sqlite|postgresql)"/,
  `provider = "${provider}"`
);
fs.writeFileSync(schemaPath, schema);

console.log(`Prisma provider set to "${provider}" in schema.prisma`);
