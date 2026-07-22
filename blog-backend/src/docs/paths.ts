import { z } from 'zod';
import {
  registry,
  RegisterBody,
  LoginBody,
  UpdateUserBody,
  CreateArticleBody,
  UpdateArticleBody,
  SubscribeBody,
  UserSchema,
  ArticleSchema,
  NotificationSchema,
  AuthResponse,
  MessageResponse,
  ErrorResponse,
} from './registry';

const bearer = [{ bearerAuth: [] as string[] }];

const json = <T extends z.ZodTypeAny>(schema: T) => ({
  content: { 'application/json': { schema } },
});

const idParam = z.object({
  id: z.string().uuid().openapi({ param: { name: 'id', in: 'path' }, example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d' }),
});

// ===========================================================================
// Auth
// ===========================================================================
registry.registerPath({
  method: 'post',
  path: '/auth/register',
  tags: ['Auth'],
  summary: 'Register a new user',
  request: { body: json(RegisterBody) },
  responses: {
    201: { description: 'User created', ...json(AuthResponse) },
    400: { description: 'Validation error', ...json(ErrorResponse) },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/login',
  tags: ['Auth'],
  summary: 'Log in with email & password (local strategy)',
  request: { body: json(LoginBody) },
  responses: {
    200: { description: 'Authenticated', ...json(AuthResponse) },
    401: { description: 'Invalid credentials', ...json(ErrorResponse) },
  },
});

registry.registerPath({
  method: 'get',
  path: '/auth/me',
  tags: ['Auth'],
  summary: 'Get the current authenticated user',
  security: bearer,
  responses: {
    200: { description: 'Current user', ...json(UserSchema) },
    401: { description: 'Unauthorized', ...json(ErrorResponse) },
  },
});

registry.registerPath({
  method: 'get',
  path: '/auth/google',
  tags: ['Auth'],
  summary: 'Start Google OAuth flow (redirects to Google)',
  responses: { 302: { description: 'Redirect to Google consent screen' } },
});

registry.registerPath({
  method: 'get',
  path: '/auth/google/callback',
  tags: ['Auth'],
  summary: 'Google OAuth callback (redirects back to the frontend)',
  responses: { 302: { description: 'Redirect to frontend with token' } },
});

// ===========================================================================
// Users
// ===========================================================================
registry.registerPath({
  method: 'get',
  path: '/users/{id}',
  tags: ['Users'],
  summary: 'Get a user profile',
  request: { params: idParam },
  responses: {
    200: { description: 'User profile', ...json(UserSchema) },
    404: { description: 'Not found', ...json(ErrorResponse) },
  },
});

registry.registerPath({
  method: 'put',
  path: '/users/{id}',
  tags: ['Users'],
  summary: 'Update a user profile',
  security: bearer,
  request: { params: idParam, body: json(UpdateUserBody) },
  responses: {
    200: { description: 'Updated user', ...json(UserSchema) },
    401: { description: 'Unauthorized', ...json(ErrorResponse) },
  },
});

registry.registerPath({
  method: 'post',
  path: '/users/{id}/follow',
  tags: ['Users'],
  summary: 'Follow a user',
  security: bearer,
  request: { params: idParam },
  responses: {
    200: { description: 'Followed', ...json(MessageResponse) },
    401: { description: 'Unauthorized', ...json(ErrorResponse) },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/users/{id}/follow',
  tags: ['Users'],
  summary: 'Unfollow a user',
  security: bearer,
  request: { params: idParam },
  responses: {
    200: { description: 'Unfollowed', ...json(MessageResponse) },
    401: { description: 'Unauthorized', ...json(ErrorResponse) },
  },
});

// ===========================================================================
// Articles
// ===========================================================================
registry.registerPath({
  method: 'get',
  path: '/articles',
  tags: ['Articles'],
  summary: 'List articles (cursor paginated)',
  request: {
    query: z.object({
      limit: z.coerce.number().int().optional().openapi({ example: 10 }),
      author_id: z.string().uuid().optional(),
      tags: z.string().optional().openapi({ description: 'Comma-separated tags', example: 'node,express' }),
      cursor: z.string().optional().openapi({ description: 'ID of the last item from the previous page' }),
    }),
  },
  responses: { 200: { description: 'A page of articles', ...json(z.object({ data: z.array(ArticleSchema), nextCursor: z.string().nullable() })) } },
});

registry.registerPath({
  method: 'get',
  path: '/articles/{id}',
  tags: ['Articles'],
  summary: 'Get an article by id',
  request: { params: idParam },
  responses: {
    200: { description: 'Article', ...json(ArticleSchema) },
    404: { description: 'Not found', ...json(ErrorResponse) },
  },
});

registry.registerPath({
  method: 'post',
  path: '/articles',
  tags: ['Articles'],
  summary: 'Create an article',
  security: bearer,
  request: { body: json(CreateArticleBody) },
  responses: {
    201: { description: 'Created article', ...json(ArticleSchema) },
    401: { description: 'Unauthorized', ...json(ErrorResponse) },
    429: { description: 'Rate limit exceeded', ...json(ErrorResponse) },
  },
});

registry.registerPath({
  method: 'put',
  path: '/articles/{id}',
  tags: ['Articles'],
  summary: 'Update an article',
  security: bearer,
  request: { params: idParam, body: json(UpdateArticleBody) },
  responses: {
    200: { description: 'Updated article', ...json(ArticleSchema) },
    401: { description: 'Unauthorized', ...json(ErrorResponse) },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/articles/{id}',
  tags: ['Articles'],
  summary: 'Delete an article',
  security: bearer,
  request: { params: idParam },
  responses: {
    200: { description: 'Deleted', ...json(MessageResponse) },
    401: { description: 'Unauthorized', ...json(ErrorResponse) },
  },
});

// ===========================================================================
// Notifications (all require auth)
// ===========================================================================
registry.registerPath({
  method: 'get',
  path: '/notifications',
  tags: ['Notifications'],
  summary: 'List notifications for the current user',
  security: bearer,
  responses: { 200: { description: 'Notifications', ...json(z.array(NotificationSchema)) } },
});

registry.registerPath({
  method: 'get',
  path: '/notifications/unread-count',
  tags: ['Notifications'],
  summary: 'Get the unread notification count',
  security: bearer,
  responses: { 200: { description: 'Unread count', ...json(z.object({ count: z.number().int() })) } },
});

registry.registerPath({
  method: 'patch',
  path: '/notifications/read-all',
  tags: ['Notifications'],
  summary: 'Mark all notifications as read',
  security: bearer,
  responses: { 200: { description: 'All marked read', ...json(MessageResponse) } },
});

registry.registerPath({
  method: 'patch',
  path: '/notifications/{id}/read',
  tags: ['Notifications'],
  summary: 'Mark a single notification as read',
  security: bearer,
  request: { params: idParam },
  responses: { 200: { description: 'Marked read', ...json(MessageResponse) } },
});

// ===========================================================================
// Subscriptions
// ===========================================================================
registry.registerPath({
  method: 'post',
  path: '/subscriptions',
  tags: ['Subscriptions'],
  summary: 'Subscribe an email address (sends a verification email)',
  request: { body: json(SubscribeBody) },
  responses: {
    201: { description: 'Subscription pending verification', ...json(MessageResponse) },
    400: { description: 'Validation error', ...json(ErrorResponse) },
  },
});

const tokenQuery = z.object({
  token: z.string().openapi({ param: { name: 'token', in: 'query' }, example: 'abc123token' }),
});

registry.registerPath({
  method: 'get',
  path: '/subscriptions/verify',
  tags: ['Subscriptions'],
  summary: 'Verify a subscription via emailed token',
  request: { query: tokenQuery },
  responses: { 200: { description: 'Verified', ...json(MessageResponse) } },
});

registry.registerPath({
  method: 'delete',
  path: '/subscriptions/unsubscribe',
  tags: ['Subscriptions'],
  summary: 'Unsubscribe via emailed token',
  request: { query: tokenQuery },
  responses: { 200: { description: 'Unsubscribed', ...json(MessageResponse) } },
});

// ===========================================================================
// Health
// ===========================================================================
registry.registerPath({
  method: 'get',
  path: '/health',
  tags: ['System'],
  summary: 'Health check',
  responses: { 200: { description: 'API is running', ...json(z.object({ status: z.string(), message: z.string() })) } },
});
