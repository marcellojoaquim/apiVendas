import { AppError } from '@/common/domain/errors/app-error';
import { Request, Response } from 'express';
import { z } from 'zod';
import { CreateProductUseCase } from '@/products/application/usecases/create-product.usecase';
import { container } from 'tsyringe';

export async function createProductController(req: Request, res: Response) {
  const createProductBodySchema = z.object({
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
  });

  const validatedData = createProductBodySchema.safeParse(req.body);
  if (validatedData.success === false) {
    console.error('Invalid data: ', validatedData.error.format());
    throw new AppError(
      `${validatedData.error.errors.map(err => {
        return `${err.path} -> ${err.message}`;
      })}`,
    );
  }
  const { name, price, quantity } = validatedData.data;

  const createProductUseCase: CreateProductUseCase.UseCase = container.resolve(
    'CreateProductUseCase',
  );
  const product = await createProductUseCase.execute({ name, price, quantity });

  return res.status(201).json(product);
}
