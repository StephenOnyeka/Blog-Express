import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';

const validate = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        message: 'Validation Error',
        errors: err.issues,
      });
    }
    next(err);
  }
};

export default validate;
