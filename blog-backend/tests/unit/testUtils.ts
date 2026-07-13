// -----------------------------------------------------------------------
// testUtils.ts — Stubs Prisma and Resend *before* the app is loaded.
// All imports MUST be at the top (TS requirement). The require.cache
// injection runs at module-evaluation time, which happens when the
// test file does `import { prismaMock } from './testUtils'` — so the
// stub is already in place before `import app from '../../src/app'`.
// -----------------------------------------------------------------------

import path from 'node:path';
import jwt from 'jsonwebtoken';
import env from '../../src/config/env';

// ---------- Prisma mock object ------------------------------------------
// Each method is typed as a generic function so tests can freely replace
// them with `(args: any) => Promise.resolve(...)` without TS complaints.

export const prismaMock = {
  $connect: (): Promise<void> => Promise.resolve(),
  $disconnect: (): Promise<void> => Promise.resolve(),
  $transaction: (promises: Promise<any>[]): Promise<any[]> => Promise.all(promises),

  user: {
    findFirst: (..._args: any[]): Promise<any> => Promise.resolve(null),
    findUnique: (..._args: any[]): Promise<any> => Promise.resolve(null),
    create: (..._args: any[]): Promise<any> => Promise.resolve(null),
    update: (..._args: any[]): Promise<any> => Promise.resolve(null),
  },

  article: {
    findMany: (..._args: any[]): Promise<any[]> => Promise.resolve([]),
    findUnique: (..._args: any[]): Promise<any> => Promise.resolve(null),
    create: (..._args: any[]): Promise<any> => Promise.resolve(null),
    update: (..._args: any[]): Promise<any> => Promise.resolve(null),
    delete: (..._args: any[]): Promise<any> => Promise.resolve(null),
    count: (..._args: any[]): Promise<number> => Promise.resolve(0),
  },

  notification: {
    findMany: (..._args: any[]): Promise<any[]> => Promise.resolve([]),
    count: (..._args: any[]): Promise<number> => Promise.resolve(0),
    updateMany: (..._args: any[]): Promise<any> => Promise.resolve(null),
    update: (..._args: any[]): Promise<any> => Promise.resolve(null),
    createMany: (..._args: any[]): Promise<any> => Promise.resolve(null),
  },

  authorFollow: {
    findFirst: (..._args: any[]): Promise<any> => Promise.resolve(null),
    findUnique: (..._args: any[]): Promise<any> => Promise.resolve(null),
    create: (..._args: any[]): Promise<any> => Promise.resolve(null),
    delete: (..._args: any[]): Promise<any> => Promise.resolve(null),
    count: (..._args: any[]): Promise<number> => Promise.resolve(0),
    findMany: (..._args: any[]): Promise<any[]> => Promise.resolve([]),
  },

  subscription: {
    findUnique: (..._args: any[]): Promise<any> => Promise.resolve(null),
    create: (..._args: any[]): Promise<any> => Promise.resolve(null),
    delete: (..._args: any[]): Promise<any> => Promise.resolve(null),
    findMany: (..._args: any[]): Promise<any[]> => Promise.resolve([]),
  },

  emailSubscription: {
    findFirst: (..._args: any[]): Promise<any> => Promise.resolve(null),
    create: (..._args: any[]): Promise<any> => Promise.resolve(null),
    update: (..._args: any[]): Promise<any> => Promise.resolve(null),
    delete: (..._args: any[]): Promise<any> => Promise.resolve(null),
  },
};

// ---------- Inject Prisma stub into require cache -----------------------
const dbPath = path.resolve(__dirname, '../../src/config/database');
(require as any).cache[require.resolve(dbPath)] = {
  id: dbPath,
  filename: dbPath,
  loaded: true,
  exports: { default: prismaMock, __esModule: true },
  parent: null,
  children: [],
  paths: [],
};

// ---------- Inject Resend/mailer stub into require cache ----------------
const mailerPath = path.resolve(__dirname, '../../src/utils/mailer');
(require as any).cache[require.resolve(mailerPath)] = {
  id: mailerPath,
  filename: mailerPath,
  loaded: true,
  exports: {
    sendMail: (..._args: any[]): Promise<any> => Promise.resolve({ id: 'test-email-id' }),
    __esModule: true,
  },
  parent: null,
  children: [],
  paths: [],
};

// ---------- Helper: generate a signed JWT for tests ---------------------
export function generateTestToken(userId: string = '1'): string {
  return jwt.sign({ id: userId, sub: userId }, env.JWT_SECRET, {
    expiresIn: '1h',
  });
}
