// IMPORTANT: `./setup` runs extendZodWithOpenApi and MUST be imported before the
// validators below, so their schemas are built with `.openapi()` available.
import './setup';

import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { registerSchema, loginSchema } from '../validators/auth.validator';
import { updateUserSchema } from '../validators/user.validator';
import { createArticleSchema, updateArticleSchema } from '../validators/article.validator';
import { subscribeSchema } from '../validators/subscription.validator';

export const registry = new OpenAPIRegistry();

// ---------------------------------------------------------------------------
// Security scheme: JWT bearer token (see auth.middleware / passport-jwt)
// ---------------------------------------------------------------------------
export const bearerAuth = registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'Paste the `token` returned by /auth/login or /auth/register.',
});

// ---------------------------------------------------------------------------
// Request body schemas — reuse the existing Zod validators.
// The validators wrap everything in `{ body, query, params }` for the
// validate middleware, so we lift `.shape.body` to describe the JSON body.
// ---------------------------------------------------------------------------
export const RegisterBody = registry.register(
  'RegisterInput',
  registerSchema.shape.body.openapi('RegisterInput', {
    example: {
      name: 'Jane Doe',
      username: 'janedoe',
      email: 'jane@example.com',
      password: 'secret123',
    },
  })
);

export const LoginBody = registry.register(
  'LoginInput',
  loginSchema.shape.body.openapi('LoginInput', {
    example: { email: 'jane@example.com', password: 'secret123' },
  })
);

export const UpdateUserBody = registry.register(
  'UpdateUserInput',
  updateUserSchema.shape.body.openapi('UpdateUserInput', {
    example: { name: 'Jane D.', bio: 'Writer & developer', avatar: 'https://example.com/me.png' },
  })
);

export const CreateArticleBody = registry.register(
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
  })
);

export const UpdateArticleBody = registry.register(
  'UpdateArticleInput',
  updateArticleSchema.shape.body.openapi('UpdateArticleInput', {
    example: { title: 'Updated title', is_draft: false },
  })
);

export const SubscribeBody = registry.register(
  'SubscribeInput',
  subscribeSchema.shape.body.openapi('SubscribeInput', {
    example: { email: 'reader@example.com', topics: ['node'], newsletter: true },
  })
);

// ---------------------------------------------------------------------------
// Response schemas — modelled on the Prisma schema (safe fields only).
// ---------------------------------------------------------------------------
export const UserSchema = registry.register(
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
    .openapi('User')
);

export const ArticleSchema = registry.register(
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
    .openapi('Article')
);

export const NotificationSchema = registry.register(
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
    .openapi('Notification')
);

export const AuthResponse = registry.register(
  'AuthResponse',
  z.object({ user: UserSchema, token: z.string() }).openapi('AuthResponse')
);

export const MessageResponse = registry.register(
  'MessageResponse',
  z.object({ message: z.string() }).openapi('MessageResponse')
);

export const ErrorResponse = registry.register(
  'ErrorResponse',
  z
    .object({
      message: z.string(),
      errors: z.array(z.any()).optional(),
    })
    .openapi('ErrorResponse')
);
