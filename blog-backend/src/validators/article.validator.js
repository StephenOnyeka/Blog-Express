const { z } = require('zod');

const createArticleSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(300),
    subtitle: z.string().max(500).optional(),
    body: z.string(),
    thumbnail: z.string().url().optional(),
    tags: z.array(z.string()).optional(),
    is_member_only: z.boolean().optional(),
    is_draft: z.boolean().optional(),
  }),
});

const updateArticleSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(300).optional(),
    subtitle: z.string().max(500).optional(),
    body: z.string().optional(),
    thumbnail: z.string().url().optional(),
    tags: z.array(z.string()).optional(),
    is_member_only: z.boolean().optional(),
    is_draft: z.boolean().optional(),
  }),
});

module.exports = {
  createArticleSchema,
  updateArticleSchema,
};
