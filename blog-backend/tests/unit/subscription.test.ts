import { prismaMock, generateTestToken } from './testUtils';

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../../src/app';

describe('Subscription API', () => {
  beforeEach(() => {
    prismaMock.emailSubscription.findFirst = () => Promise.resolve(null);
    prismaMock.emailSubscription.create = () => Promise.resolve(null);
    prismaMock.emailSubscription.update = () => Promise.resolve(null);
    prismaMock.emailSubscription.delete = () => Promise.resolve(null);
  });

  describe('POST /api/subscriptions', () => {
    it('should subscribe successfully', async () => {
      prismaMock.emailSubscription.findFirst = () => Promise.resolve(null);
      prismaMock.emailSubscription.create = () => Promise.resolve({
        id: 'sub1',
        email: 'test@example.com'
      });

      const res = await request(app)
        .post('/api/subscriptions')
        .send({ email: 'test@example.com' });

      assert.equal(res.statusCode, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.verified, false);
    });

    it('should update subscription if already exists', async () => {
      prismaMock.emailSubscription.findFirst = () => Promise.resolve({
        id: 'sub1',
        email: 'test@example.com',
        is_verified: true
      });
      prismaMock.emailSubscription.update = () => Promise.resolve({
        id: 'sub1',
        is_verified: true
      });

      const res = await request(app)
        .post('/api/subscriptions')
        .send({ email: 'test@example.com', topics: ['tech'] });

      assert.equal(res.statusCode, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.verified, true);
    });
  });

  describe('GET /api/subscriptions/verify', () => {
    it('should verify subscription with valid token', async () => {
      prismaMock.emailSubscription.findFirst = () => Promise.resolve({ id: 'sub1' });
      prismaMock.emailSubscription.update = () => Promise.resolve({ id: 'sub1', is_verified: true });

      const res = await request(app)
        .get('/api/subscriptions/verify?token=valid-token');

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
    });

    it('should return 404 for invalid verify token', async () => {
      prismaMock.emailSubscription.findFirst = () => Promise.resolve(null);

      const res = await request(app)
        .get('/api/subscriptions/verify?token=invalid');

      assert.equal(res.statusCode, 404);
      assert.equal(res.body.message, 'Invalid token');
    });
  });

  describe('DELETE /api/subscriptions/unsubscribe', () => {
    it('should unsubscribe with valid token', async () => {
      prismaMock.emailSubscription.findFirst = () => Promise.resolve({ id: 'sub1' });
      prismaMock.emailSubscription.delete = () => Promise.resolve({ id: 'sub1' });

      const res = await request(app)
        .delete('/api/subscriptions/unsubscribe?token=valid-token');

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
    });
  });
});
