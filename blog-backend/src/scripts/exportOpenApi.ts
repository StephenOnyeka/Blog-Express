// Must run before ../docs/openapi pulls in the validators (Zod 4 patches the
// factories, so `.openapi()` has to be enabled first). See src/docs/setup.ts.
import '../docs/setup';

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildOpenApiSpec } from '../docs/openapi';

// Writes the generated OpenAPI document to openapi.json at the project root.
// Handy for client codegen, importing into Postman, or committing the contract
// for diff review.
const spec = buildOpenApiSpec();
const out = resolve(process.cwd(), 'openapi.json');
writeFileSync(out, JSON.stringify(spec, null, 2));
console.log(`Wrote ${out} (${Object.keys(spec.paths).length} paths)`);
