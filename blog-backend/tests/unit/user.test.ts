import { prismaMock, generateTestToken } from './testUtils';

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../../src/app';

describe('User API', () => {
  beforeEach(() => {
    // Reset prisma mocks
    prismaMock.user.findUnique = () => Promise.resolve(null);
    prismaMock.user.update = () => Promise.resolve(null);
    prismaMock.authorFollow.findUnique = () => Promise.resolve(null);
    prismaMock.authorFollow.findFirst = () => Promise.resolve(null);
    prismaMock.authorFollow.create = () => Promise.resolve(null);
    prismaMock.authorFollow.delete = () => Promise.resolve(null);
  });

  describe('GET /api/users/:id', () => {
    it('should return user profile if found', async () => {
      prismaMock.user.findUnique = () => Promise.resolve({
        id: 'user123',
        name: 'John Doe',
        username: 'johndoe',
        followersCount: 5,
        followingCount: 5,
      });
      // also mock count for followers/following
      prismaMock.authorFollow.count = () => Promise.resolve(5);

      const res = await request(app).get('/api/users/user123');

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.username, 'johndoe');
      assert.equal(res.body.followersCount, 5);
      assert.equal(res.body.followingCount, 5);
    });

    it('should return 404 if user not found', async () => {
      prismaMock.user.findUnique = () => Promise.resolve(null);

      const res = await request(app).get('/api/users/notfound');

      assert.equal(res.statusCode, 404);
      assert.equal(res.body.message, 'User not found');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user profile successfully', async () => {
      const token = generateTestToken('user123');
      
      // Mock for auth middleware & then for update logic
      // In a more complex scenario, we'd check args, but returning a mock user is fine here
      prismaMock.user.findUnique = () => Promise.resolve({ id: 'user123' });
      prismaMock.user.findFirst = () => Promise.resolve(null); // for username uniqueness check
      prismaMock.user.update = (args: any) => Promise.resolve({ id: 'user123', ...args.data });

      const res = await request(app)
        .put('/api/users/user123')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'John Updated' });

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.name, 'John Updated');
    });

    it('should return 403 if trying to update another user profile', async () => {
      const token = generateTestToken('user123');
      prismaMock.user.findUnique = () => Promise.resolve({ id: 'user123' });

      const res = await request(app)
        .put('/api/users/user456')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'John Updated' });

      assert.equal(res.statusCode, 403);
      assert.equal(res.body.message, 'Forbidden');
    });
  });

  describe('POST /api/users/:id/follow', () => {
    it('should follow user successfully', async () => {
      const token = generateTestToken('user123');
      
      // Auth middleware user & target user check
      prismaMock.user.findUnique = (args: any) => Promise.resolve({ id: args.where.id }); // returns correct user id
      prismaMock.authorFollow.findUnique = () => Promise.resolve(null); // not already following
      prismaMock.authorFollow.create = () => Promise.resolve({ follower_id: 'user123', following_id: 'user456' });
      prismaMock.notification.updateMany = () => Promise.resolve(null);

      const res = await request(app)
        .post('/api/users/user456/follow')
        .set('Authorization', `Bearer ${token}`);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.message, 'Successfully followed author');
    });

    it('should not allow following yourself', async () => {
      const token = generateTestToken('user123');
      prismaMock.user.findUnique = () => Promise.resolve({ id: 'user123' });

      const res = await request(app)
        .post('/api/users/user123/follow')
        .set('Authorization', `Bearer ${token}`);

      assert.equal(res.statusCode, 400);
      assert.equal(res.body.message, 'Cannot follow yourself');
    });
  });

  describe('DELETE /api/users/:id/follow', () => {
    it('should unfollow user successfully', async () => {
      const token = generateTestToken('user123');
      
      prismaMock.user.findUnique = (args: any) => Promise.resolve({ id: args.where.id }); 
      prismaMock.authorFollow.findFirst = () => Promise.resolve({ id: 'follow1', follower_id: 'user123', following_id: 'user456' });
      prismaMock.authorFollow.delete = () => Promise.resolve({ follower_id: 'user123', following_id: 'user456' });

      const res = await request(app)
        .delete('/api/users/user456/follow')
        .set('Authorization', `Bearer ${token}`);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.message, 'Successfully unfollowed author');
    });
  });
});
