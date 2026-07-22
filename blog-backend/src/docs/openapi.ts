import {
  OpenApiGeneratorV3,
  OpenAPIRegistry,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import env from '../config/env';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { updateUserSchema } from '../validators/user.validator';
import { createArticleSchema, updateArticleSchema } from '../validators/article.validator';
import { subscribeSchema } from '../validators/subscription.validator';

// NOTE: `extendZodWithOpenApi(z)` lives in ./setup and MUST run before the
// validators above are constructed. On Zod 4 the `.openapi()` helper is added to
// the schema factories (not the prototype), so — unlike AJCI's Zod 3 setup where
// the call can sit inline — it has to be applied first, at the app entry point.
// See src/app.ts and src/docs/setup.ts.

const registry = new OpenAPIRegistry();

// ---------------------------------------------------------------------------
// Security scheme: JWT bearer token (Passport JWT strategy, stateless).
// ---------------------------------------------------------------------------
const bearerAuth = registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

const secured = [{ [bearerAuth.name]: [] }];

// ---------------------------------------------------------------------------
// Request bodies — reuse the existing Zod validators (DRY). The validators wrap
// everything in `{ body, query, params }` for the validate middleware, so we
// lift `.shape.body` to describe the JSON body.
// ---------------------------------------------------------------------------
const RegisterBody = registry.register(
  'RegisterInput',
  registerSchema.shape.body.openapi('RegisterInput', {
    example: { name: 'Jane Doe', username: 'janedoe', email: 'jane@example.com', password: 'secret123' },
  }),
);

const LoginBody = registry.register(
  'LoginInput',
  loginSchema.shape.body.openapi('LoginInput', {
    example: { email: 'jane@example.com', password: 'secret123' },
  }),
);

const UpdateUserBody = registry.register(
  'UpdateUserInput',
  updateUserSchema.shape.body.openapi('UpdateUserInput', {
    example: { name: 'Jane D.', bio: 'Writer & developer', avatar: 'https://example.com/me.png' },
  }),
);

const CreateArticleBody = registry.register(
  'CreateArticleInput',
  createArticleSchema.shape.body.openapi('CreateArticleInput', {
    example: {
      title: 'Getting started with Express',
      subtitle: 'A practical guide',
      body: 'Full article content goes here...',
      tags: ['express', 'node'],
      is_member_only: false,
      is_draft: false,
    },
  }),
);

const UpdateArticleBody = registry.register(
  'UpdateArticleInput',
  updateArticleSchema.shape.body.openapi('UpdateArticleInput', {
    example: { title: 'Updated title', is_draft: false },
  }),
);

const SubscribeBody = registry.register(
  'SubscribeInput',
  subscribeSchema.shape.body.openapi('SubscribeInput', {
    example: { email: 'reader@example.com', topics: ['node'], newsletter: true },
  }),
);

// ---------------------------------------------------------------------------
// Response schemas (mirror the Prisma models — safe fields only).
// ---------------------------------------------------------------------------
const UserSchema = registry.register(
  'User',
  z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      username: z.string(),
      email: z.string().email(),
      provider: z.string(),
      avatar: z.string().nullable(),
      bio: z.string().nullable(),
      followersCount: z.number().int(),
      followingCount: z.number().int(),
      created_at: z.string().datetime(),
    })
    .openapi('User'),
);

const ArticleSchema = registry.register(
  'Article',
  z
    .object({
      id: z.string().uuid(),
      title: z.string(),
      subtitle: z.string().nullable(),
      body: z.string(),
      thumbnail: z.string().nullable(),
      tags: z.array(z.string()),
      is_member_only: z.boolean(),
      read_time: z.number().int(),
      claps: z.number().int(),
      comments_count: z.number().int(),
      is_draft: z.boolean(),
      published_at: z.string().datetime().nullable(),
      author_id: z.string().uuid(),
      created_at: z.string().datetime(),
    })
    .openapi('Article'),
);

const NotificationSchema = registry.register(
  'Notification',
  z
    .object({
      id: z.string().uuid(),
      recipient_id: z.string().uuid(),
      type: z.string(),
      message: z.string(),
      article_id: z.string().uuid().nullable(),
      is_read: z.boolean(),
      created_at: z.string().datetime(),
    })
    .openapi('Notification'),
);

const AuthResponse = registry.register(
  'AuthResponse',
  z.object({ user: UserSchema, token: z.string().openapi({ description: 'JWT bearer token' }) }).openapi('AuthResponse'),
);

const MessageResponse = registry.register(
  'MessageResponse',
  z.object({ message: z.string() }).openapi('MessageResponse'),
);

const ErrorResponse = registry.register(
  'Error',
  z
    .object({
      message: z.string().openapi({ example: 'Unauthorized' }),
      errors: z.array(z.any()).optional().openapi({ description: 'Present on 400 validation errors (zod issues)' }),
    })
    .openapi('Error'),
);

// Reusable helpers ----------------------------------------------------------
const json = <T extends z.ZodTypeAny>(schema: T) => ({
  content: { 'application/json': { schema } },
});

const unauthorized = {
  401: { description: 'Not authenticated', ...json(ErrorResponse) },
};
const badRequest = {
  400: { description: 'Invalid request body', ...json(ErrorResponse) },
};

const idParam = z.object({
  id: z.string().uuid().openapi({ param: { name: 'id', in: 'path' }, example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d' }),
});

// ===========================================================================
// Paths
// ===========================================================================

// Health --------------------------------------------------------------------
registry.registerPath({
  method: 'get',
  path: '/health',
  tags: ['System'],
  summary: 'Liveness probe',
  responses: { 200: { description: 'API is running', ...json(z.object({ status: z.string(), message: z.string() })) } },
});

// Auth ----------------------------------------------------------------------
registry.registerPath({
  method: 'post',
  path: '/api/auth/register',
  tags: ['Auth'],
  summary: 'Register a new user',
  request: { body: json(RegisterBody) },
  responses: { 201: { description: 'User created', ...json(AuthResponse) }, ...badRequest },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/login',
  tags: ['Auth'],
  summary: 'Log in with email & password (local strategy)',
  request: { body: json(LoginBody) },
  responses: { 200: { description: 'Authenticated', ...json(AuthResponse) }, ...badRequest, ...unauthorized },
});

registry.registerPath({
  method: 'get',
  path: '/api/auth/me',
  tags: ['Auth'],
  summary: 'Get the current authenticated user',
  security: secured,
  responses: { 200: { description: 'Current user', ...json(UserSchema) }, ...unauthorized },
});

registry.registerPath({
  method: 'get',
  path: '/api/auth/google',
  tags: ['Auth'],
  summary: 'Start Google OAuth flow (redirects to Google)',
  responses: { 302: { description: 'Redirect to Google consent screen' } },
});

registry.registerPath({
  method: 'get',
  path: '/api/auth/google/callback',
  tags: ['Auth'],
  summary: 'Google OAuth callback (redirects back to the frontend)',
  responses: { 302: { description: 'Redirect to frontend with token' } },
});

// Users ---------------------------------------------------------------------
registry.registerPath({
  method: 'get',
  path: '/api/users/{id}',
  tags: ['Users'],
  summary: 'Get a user profile',
  request: { params: idParam },
  responses: { 200: { description: 'User profile', ...json(UserSchema) }, 404: { description: 'Not found', ...json(ErrorResponse) } },
});

registry.registerPath({
  method: 'put',
  path: '/api/users/{id}',
  tags: ['Users'],
  summary: 'Update a user profile',
  security: secured,
  request: { params: idParam, body: json(UpdateUserBody) },
  responses: { 200: { description: 'Updated user', ...json(UserSchema) }, ...badRequest, ...unauthorized },
});

registry.registerPath({
  method: 'post',
  path: '/api/users/{id}/follow',
  tags: ['Users'],
  summary: 'Follow a user',
  security: secured,
  request: { params: idParam },
  responses: { 200: { description: 'Followed', ...json(MessageResponse) }, ...unauthorized },
});

registry.registerPath({
  method: 'delete',
  path: '/api/users/{id}/follow',
  tags: ['Users'],
  summary: 'Unfollow a user',
  security: secured,
  request: { params: idParam },
  responses: { 200: { description: 'Unfollowed', ...json(MessageResponse) }, ...unauthorized },
});

// Articles ------------------------------------------------------------------
registry.registerPath({
  method: 'get',
  path: '/api/articles',
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
  path: '/api/articles/{id}',
  tags: ['Articles'],
  summary: 'Get an article by id',
  request: { params: idParam },
  responses: { 200: { description: 'Article', ...json(ArticleSchema) }, 404: { description: 'Not found', ...json(ErrorResponse) } },
});

registry.registerPath({
  method: 'post',
  path: '/api/articles',
  tags: ['Articles'],
  summary: 'Create an article',
  security: secured,
  request: { body: json(CreateArticleBody) },
  responses: {
    201: { description: 'Created article', ...json(ArticleSchema) },
    ...badRequest,
    ...unauthorized,
    429: { description: 'Rate limit exceeded', ...json(ErrorResponse) },
  },
});

registry.registerPath({
  method: 'put',
  path: '/api/articles/{id}',
  tags: ['Articles'],
  summary: 'Update an article',
  security: secured,
  request: { params: idParam, body: json(UpdateArticleBody) },
  responses: { 200: { description: 'Updated article', ...json(ArticleSchema) }, ...badRequest, ...unauthorized },
});

registry.registerPath({
  method: 'delete',
  path: '/api/articles/{id}',
  tags: ['Articles'],
  summary: 'Delete an article',
  security: secured,
  request: { params: idParam },
  responses: { 200: { description: 'Deleted', ...json(MessageResponse) }, ...unauthorized },
});

// Notifications (all require auth) ------------------------------------------
registry.registerPath({
  method: 'get',
  path: '/api/notifications',
  tags: ['Notifications'],
  summary: 'List notifications for the current user',
  security: secured,
  responses: { 200: { description: 'Notifications', ...json(z.array(NotificationSchema)) }, ...unauthorized },
});

registry.registerPath({
  method: 'get',
  path: '/api/notifications/unread-count',
  tags: ['Notifications'],
  summary: 'Get the unread notification count',
  security: secured,
  responses: { 200: { description: 'Unread count', ...json(z.object({ count: z.number().int() })) }, ...unauthorized },
});

registry.registerPath({
  method: 'patch',
  path: '/api/notifications/read-all',
  tags: ['Notifications'],
  summary: 'Mark all notifications as read',
  security: secured,
  responses: { 200: { description: 'All marked read', ...json(MessageResponse) }, ...unauthorized },
});

registry.registerPath({
  method: 'patch',
  path: '/api/notifications/{id}/read',
  tags: ['Notifications'],
  summary: 'Mark a single notification as read',
  security: secured,
  request: { params: idParam },
  responses: { 200: { description: 'Marked read', ...json(MessageResponse) }, ...unauthorized },
});

// Subscriptions -------------------------------------------------------------
registry.registerPath({
  method: 'post',
  path: '/api/subscriptions',
  tags: ['Subscriptions'],
  summary: 'Subscribe an email address (sends a verification email)',
  request: { body: json(SubscribeBody) },
  responses: { 201: { description: 'Subscription pending verification', ...json(MessageResponse) }, ...badRequest },
});

const tokenQuery = z.object({
  token: z.string().openapi({ param: { name: 'token', in: 'query' }, example: 'abc123token' }),
});

registry.registerPath({
  method: 'get',
  path: '/api/subscriptions/verify',
  tags: ['Subscriptions'],
  summary: 'Verify a subscription via emailed token',
  request: { query: tokenQuery },
  responses: { 200: { description: 'Verified', ...json(MessageResponse) } },
});

registry.registerPath({
  method: 'delete',
  path: '/api/subscriptions/unsubscribe',
  tags: ['Subscriptions'],
  summary: 'Unsubscribe via emailed token',
  request: { query: tokenQuery },
  responses: { 200: { description: 'Unsubscribed', ...json(MessageResponse) } },
});

/** Builds the OpenAPI 3.0 document from the registry. */
export function buildOpenApiSpec() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'Blog API',
      version: '1.0.0',
      description:
        'REST API for the Blog application. Authenticate via the `Authorize` ' +
        'button using a JWT bearer token returned by /api/auth/login. Import ' +
        'openapi.json into Postman, or browse it live at /docs.',
    },
    servers: [{ url: `http://localhost:${env.PORT}`, description: 'Local development' }],
    tags: [
      { name: 'Auth', description: 'Registration, login & OAuth' },
      { name: 'Users', description: 'Profiles & following' },
      { name: 'Articles', description: 'Article CRUD & listing' },
      { name: 'Notifications', description: 'User notifications' },
      { name: 'Subscriptions', description: 'Email subscriptions' },
      { name: 'System', description: 'Health & diagnostics' },
    ],
  });
}
