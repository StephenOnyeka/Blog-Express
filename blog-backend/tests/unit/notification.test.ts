import { prismaMock, generateTestToken } from './testUtils';

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../../src/app';

describe('Notification API', () => {
  const token = generateTestToken('user123');

  beforeEach(() => {
    prismaMock.user.findUnique = () => Promise.resolve({ id: 'user123' }); // Mock auth
    prismaMock.notification.findMany = () => Promise.resolve([]);
    prismaMock.notification.count = () => Promise.resolve(0);
    prismaMock.notification.updateMany = () => Promise.resolve({ count: 0 });
    prismaMock.notification.update = () => Promise.resolve(null);
  });

  describe('GET /api/notifications', () => {
    it('should return a list of notifications', async () => {
      prismaMock.notification.findMany = () => Promise.resolve([
        { id: 'notif1', message: 'New follow', is_read: false }
      ]);

      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${token}`);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.length, 1);
      assert.equal(res.body[0].message, 'New follow');
    });
  });

  describe('GET /api/notifications/unread-count', () => {
    it('should return the unread count', async () => {
      prismaMock.notification.count = () => Promise.resolve(5);

      const res = await request(app)
        .get('/api/notifications/unread-count')
        .set('Authorization', `Bearer ${token}`);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.count, 5);
    });
  });

  describe('PATCH /api/notifications/read-all', () => {
    it('should mark all as read', async () => {
      prismaMock.notification.updateMany = () => Promise.resolve({ count: 5 });

      const res = await request(app)
        .patch('/api/notifications/read-all')
        .set('Authorization', `Bearer ${token}`);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
    });
  });

  describe('PATCH /api/notifications/:id/read', () => {
    it('should mark a specific notification as read', async () => {
      prismaMock.notification.update = () => Promise.resolve({
        id: 'notif1',
        is_read: true
      });

      const res = await request(app)
        .patch('/api/notifications/notif1/read')
        .set('Authorization', `Bearer ${token}`);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
    });
  });
});
