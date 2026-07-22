import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';

import { registry } from './registry';
// Importing paths registers every endpoint on the shared registry as a side effect.
import './paths';

const generator = new OpenApiGeneratorV3(registry.definitions);

const document = generator.generateDocument({
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'Blog API',
    description:
      'REST API for the Blog application. Import this file into Postman (Import → File) to generate a ready-to-use collection.',
  },
  servers: [{ url: 'http://localhost:8080/api', description: 'Local development' }],
  tags: [
    { name: 'Auth', description: 'Registration, login & OAuth' },
    { name: 'Users', description: 'Profiles & following' },
    { name: 'Articles', description: 'Article CRUD & listing' },
    { name: 'Notifications', description: 'User notifications' },
    { name: 'Subscriptions', description: 'Email subscriptions' },
    { name: 'System', description: 'Health & diagnostics' },
  ],
});

const outPath = resolve(__dirname, '../../postman/openapi.json');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(document, null, 2), 'utf-8');

const pathCount = Object.values(document.paths ?? {}).reduce(
  (n, item) => n + Object.keys(item as object).length,
  0
);
console.log(`✅ OpenAPI spec written to ${outPath}`);
console.log(`   ${pathCount} operations across ${Object.keys(document.paths ?? {}).length} paths.`);
