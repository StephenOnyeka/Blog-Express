import { prismaMock, generateTestToken } from './testUtils';

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../../src/app';

describe('Article API', () => {
  beforeEach(() => {
    // Reset mocks
    prismaMock.article.findMany = () => Promise.resolve([]);
    prismaMock.article.findUnique = () => Promise.resolve(null);
    prismaMock.article.create = () => Promise.resolve(null);
    prismaMock.article.update = () => Promise.resolve(null);
    prismaMock.article.delete = () => Promise.resolve(null);
    prismaMock.article.count = () => Promise.resolve(0);
    prismaMock.user.findUnique = () => Promise.resolve(null);
  });

  describe('GET /api/articles', () => {
    it('should return a list of articles', async () => {
      prismaMock.article.findMany = () => Promise.resolve([
        { id: 'article1', title: 'Test Article' }
      ]);
      prismaMock.article.count = () => Promise.resolve(1);

      const res = await request(app).get('/api/articles');

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.articles.length, 1);
      assert.equal(res.body.articles[0].title, 'Test Article');
      assert.equal(res.body.total, 1);
    });
  });

  describe('GET /api/articles/:id', () => {
    it('should return a single article if found', async () => {
      prismaMock.article.findUnique = () => Promise.resolve({
        id: 'article1',
        title: 'Test Article'
      });

      const res = await request(app).get('/api/articles/article1');

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.title, 'Test Article');
    });

    it('should return 404 if article not found', async () => {
      prismaMock.article.findUnique = () => Promise.resolve(null);

      const res = await request(app).get('/api/articles/notfound');

      assert.equal(res.statusCode, 404);
      assert.equal(res.body.message, 'Article not found');
    });
  });

  describe('POST /api/articles', () => {
    it('should create a new article successfully', async () => {
      const token = generateTestToken('user123');
      prismaMock.user.findUnique = () => Promise.resolve({ id: 'user123' }); // for auth
      prismaMock.article.create = async (args: any) => ({
        id: 'new-article',
        ...args.data
      });
      // Mock follow findMany for notification side effect
      prismaMock.authorFollow.findMany = () => Promise.resolve([]);

      const res = await request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'New Title', body: 'New Content', tags: ['tech'] });

      assert.equal(res.statusCode, 201);
      assert.equal(res.body.title, 'New Title');
    });
  });

  describe('PUT /api/articles/:id', () => {
    it('should update an article successfully', async () => {
      const token = generateTestToken('user123');
      prismaMock.user.findUnique = () => Promise.resolve({ id: 'user123' }); // for auth
      prismaMock.article.findUnique = () => Promise.resolve({ id: 'article1', author_id: 'user123' }); // exists and owned by user
      prismaMock.article.update = async (args: any) => ({
        id: 'article1',
        author_id: 'user123',
        ...args.data
      });

      const res = await request(app)
        .put('/api/articles/article1')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Title' });

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.title, 'Updated Title');
    });

    it('should return 403 if updating another user\'s article', async () => {
      const token = generateTestToken('user456');
      prismaMock.user.findUnique = () => Promise.resolve({ id: 'user456' }); // auth user
      prismaMock.article.findUnique = () => Promise.resolve({ id: 'article1', author_id: 'user123' }); // owned by user123

      const res = await request(app)
        .put('/api/articles/article1')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Title' });

      assert.equal(res.statusCode, 403);
      assert.equal(res.body.message, 'Forbidden');
    });
  });

  describe('DELETE /api/articles/:id', () => {
    it('should delete an article successfully', async () => {
      const token = generateTestToken('user123');
      prismaMock.user.findUnique = () => Promise.resolve({ id: 'user123' });
      prismaMock.article.findUnique = () => Promise.resolve({ id: 'article1', author_id: 'user123' });
      prismaMock.article.delete = () => Promise.resolve({ id: 'article1' });

      const res = await request(app)
        .delete('/api/articles/article1')
        .set('Authorization', `Bearer ${token}`);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.message, 'Article deleted successfully');
    });

    it('should return 403 if deleting another user\'s article', async () => {
      const token = generateTestToken('user456');
      prismaMock.user.findUnique = () => Promise.resolve({ id: 'user456' });
      prismaMock.article.findUnique = () => Promise.resolve({ id: 'article1', author_id: 'user123' });

      const res = await request(app)
        .delete('/api/articles/article1')
        .set('Authorization', `Bearer ${token}`);

      assert.equal(res.statusCode, 403);
      assert.equal(res.body.message, 'Forbidden');
    });
  });
});
