import { Request, Response } from 'express';
import { z } from 'zod';
import { CreateProductUseCase } from '@/products/application/usecases/create-product.usecase';
import { container } from 'tsyringe';
import { dataValidation } from '@/common/infrastructure/validation/zod';

export async function createProductController(req: Request, res: Response) {
  const createProductBodySchema = z.object({
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
  });

  const { name, price, quantity } = dataValidation(
    createProductBodySchema,
    req.body,
  );

  const createProductUseCase: CreateProductUseCase.UseCase = container.resolve(
    'CreateProductUseCase',
  );
  const product = await createProductUseCase.execute({ name, price, quantity });

  return res.status(201).json(product);
}
