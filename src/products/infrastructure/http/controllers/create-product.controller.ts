import { AppError } from '@/common/domain/errors/app-error';
import { Request, Response } from 'express';
import { z } from 'zod';
import { ProductsTypeormRepository } from '../../typeorm/repositories/products-typeorm.repository';
import { dataSource } from '@/common/infrastructure/typeorm';
import { Product } from '../../typeorm/entities/products.entity';
import { CreateProductUseCase } from '@/products/application/usecases/create-product.usecase';

export async function createProductCOntroller(req: Request, res: Response) {
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
  const repository = new ProductsTypeormRepository();
  repository.productsRepository = dataSource.getRepository(Product);
  const createProductUseCase = new CreateProductUseCase.UseCase(repository);
  const product = await createProductUseCase.execute({ name, price, quantity });

  return res.status(201).json(product);
}
