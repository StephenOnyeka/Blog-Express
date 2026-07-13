import { z } from 'zod';

export const subscribeSchema = z.object({
  body: z.object({
    email: z.string().email(),
    topics: z.array(z.string()).optional(),
    newsletter: z.boolean().optional(),
  }),
});
