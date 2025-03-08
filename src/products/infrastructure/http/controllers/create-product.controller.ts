import { AppError } from '@/common/domain/errors/app-error';
import { Request, Response } from 'express';
import { z } from 'zod';

export async function createProductCOntroller(req: Request, res: Response) {
  const createProductBodySchema = z.object({
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
  });

  const validatedData = createProductBodySchema.safeParse(req.body);
  if (validatedData.success === false) {
    throw new AppError(
      `${validatedData.error.errors.map(err => {
        return `${err.path} -> ${err.message}`;
      })}`,
    );
  }
}
