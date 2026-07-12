const { z } = require('zod');

const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120).optional(),
    username: z.string().min(3).max(50).optional(),
    avatar: z.string().url().optional(),
    bio: z.string().max(1000).optional(),
  }),
});

module.exports = {
  updateUserSchema,
};
