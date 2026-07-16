import { prismaMock } from './testUtils';

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../../src/app';
import bcrypt from 'bcryptjs';
import AuthService from '../../src/services/auth.service';

describe('Auth API', () => {
  beforeEach(() => {
    // Reset prisma mocks
    prismaMock.user.findFirst = () => Promise.resolve(null);
    prismaMock.user.findUnique = () => Promise.resolve(null);
    prismaMock.user.create = () => Promise.resolve(null);
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      prismaMock.user.findFirst = () => Promise.resolve(null);
      prismaMock.user.create = async (args: any) => {
        return { id: '1', ...args.data, created_at: new Date() };
      };

      const res = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      assert.equal(res.statusCode, 201);
      assert.ok(res.body.token);
      assert.equal(res.body.user.username, 'testuser');
      assert.equal(res.body.user.password_hash, undefined);
    });

    it('should fail if user already exists', async () => {
      prismaMock.user.findFirst = () => Promise.resolve({ id: '1' });

      const res = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      assert.equal(res.statusCode, 409);
      assert.equal(res.body.message, 'User with this email or username already exists');
    });

    it('should fail with validation error for invalid email', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123',
      });

      assert.equal(res.statusCode, 400);
      assert.equal(res.body.errors[0].path[1], 'email');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const salt = await bcrypt.genSalt(1);
      const hash = await bcrypt.hash('password123', salt);

      prismaMock.user.findUnique = () => Promise.resolve({
        id: '1',
        email: 'test@example.com',
        password_hash: hash,
        username: 'testuser'
      });

      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      assert.equal(res.statusCode, 200);
      assert.ok(res.body.token);
      assert.equal(res.body.user.email, 'test@example.com');
      assert.equal(res.body.user.password_hash, undefined);
    });

    it('should fail with invalid credentials', async () => {
      prismaMock.user.findUnique = () => Promise.resolve(null);

      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      assert.equal(res.statusCode, 401);
      assert.equal(res.body.message, 'Invalid email or password');
    });

    it('should fail for a Google-only account with no password', async () => {
      prismaMock.user.findUnique = () => Promise.resolve({
        id: '1',
        email: 'google@example.com',
        password_hash: null,
        provider: 'google',
        username: 'googleuser',
      });

      const res = await request(app).post('/api/auth/login').send({
        email: 'google@example.com',
        password: 'anything123',
      });

      assert.equal(res.statusCode, 401);
      assert.equal(res.body.message, 'Invalid email or password');
    });
  });

  describe('findOrCreateGoogleUser', () => {
    it('returns the existing user matched by google_id', async () => {
      const existing = { id: '1', google_id: 'g-123', email: 'g@example.com' };
      prismaMock.user.findUnique = (args: any) =>
        Promise.resolve(args.where.google_id === 'g-123' ? existing : null);

      const user = await AuthService.findOrCreateGoogleUser({
        googleId: 'g-123',
        email: 'g@example.com',
        name: 'G User',
      });

      assert.equal(user.id, '1');
    });

    it('links Google to an existing account matched by email', async () => {
      const localUser = { id: '2', email: 'link@example.com', google_id: null };
      prismaMock.user.findUnique = (args: any) => {
        if (args.where.google_id) return Promise.resolve(null);
        if (args.where.email === 'link@example.com') return Promise.resolve(localUser);
        return Promise.resolve(null);
      };
      prismaMock.user.update = (args: any) =>
        Promise.resolve({ ...localUser, ...args.data });

      const user = await AuthService.findOrCreateGoogleUser({
        googleId: 'g-999',
        email: 'link@example.com',
        name: 'Link User',
      });

      assert.equal(user.id, '2');
      assert.equal(user.google_id, 'g-999');
    });

    it('creates a new Google user with a unique username', async () => {
      prismaMock.user.findUnique = () => Promise.resolve(null);
      prismaMock.user.create = (args: any) =>
        Promise.resolve({ id: '3', ...args.data });

      const user = await AuthService.findOrCreateGoogleUser({
        googleId: 'g-new',
        email: 'newperson@example.com',
        name: 'New Person',
      });

      assert.equal(user.provider, 'google');
      assert.equal(user.google_id, 'g-new');
      assert.equal(user.username, 'newperson');
    });
  });
});
