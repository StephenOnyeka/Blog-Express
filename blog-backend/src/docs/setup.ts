import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

// In Zod v4 this augments the schema factories (z.object, z.string, ...), so it
// MUST run before any schema we want `.openapi()` on is constructed — including
// the schemas inside ../validators. Import this module first, everywhere.
extendZodWithOpenApi(z);
