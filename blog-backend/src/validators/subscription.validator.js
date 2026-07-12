const { z } = require('zod');

const subscribeSchema = z.object({
  body: z.object({
    email: z.string().email(),
    topics: z.array(z.string()).optional(),
    newsletter: z.boolean().optional(),
  }),
});

module.exports = {
  subscribeSchema,
};
