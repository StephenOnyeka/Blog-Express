/**
 * app.test.ts — uses Node's built-in test runner (node:test) + supertest.
 *
 * Mocking strategy (CJS-compatible):
 *  - env: the real .env file is present, so env.ts won't crash.
 *  - prisma: we inject a stub into the require() cache BEFORE importing the app,
 *    so PrismaClient never tries to open a real DB connection.
 */
import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';

// ---------------------------------------------------------------------------
// Stub the Prisma client in the require cache before the app is loaded.
// ---------------------------------------------------------------------------
const dbPath = path.resolve(__dirname, '../../src/config/database');

const prismaMock = {
  $connect: () => Promise.resolve(),
  $disconnect: () => Promise.resolve(),
  user: {
    findFirst: () => Promise.resolve(null),
    findUnique: () => Promise.resolve(null),
    create: () => Promise.resolve(null),
    update: () => Promise.resolve(null),
  },
  article: {
    findMany: () => Promise.resolve([]),
    findUnique: () => Promise.resolve(null),
    create: () => Promise.resolve(null),
    update: () => Promise.resolve(null),
    delete: () => Promise.resolve(null),
    count: () => Promise.resolve(0),
  },
  notification: {
    findMany: () => Promise.resolve([]),
    count: () => Promise.resolve(0),
    updateMany: () => Promise.resolve(null),
    update: () => Promise.resolve(null),
  },
  follow: {
    findUnique: () => Promise.resolve(null),
    create: () => Promise.resolve(null),
    delete: () => Promise.resolve(null),
    count: () => Promise.resolve(0),
  },
  subscription: {
    findUnique: () => Promise.resolve(null),
    create: () => Promise.resolve(null),
    delete: () => Promise.resolve(null),
    findMany: () => Promise.resolve([]),
  },
};

// Inject before the app (and its module tree) is ever required.
require.cache[require.resolve(dbPath)] = {
  id: dbPath,
  filename: dbPath,
  loaded: true,
  exports: { default: prismaMock, __esModule: true },
  parent: null,
  children: [],
  paths: [],
} as any;

// ---------------------------------------------------------------------------
// Now it is safe to import the app — prisma is already stubbed.
// ---------------------------------------------------------------------------
import request from 'supertest';
import app from '../../src/app';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('App', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/unknown-route');
    assert.equal(res.statusCode, 404);
  });

  it('should return 200 and { status: "ok" } for health check', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.status, 'ok');
  });
});