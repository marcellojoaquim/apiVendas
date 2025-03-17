import { SearchProductUseCase } from '@/products/application/usecases/search-product.usecase';
import { Request, Response } from 'express';
import { z } from 'zod';
import { container } from 'tsyringe';
import { dataValidation } from '@/common/infrastructure/validation/zod';

export async function searchProductController(req: Request, res: Response) {
  const querySchema = z.object({
    page: z.coerce.number().optional(),
    per_page: z.coerce.number().optional(),
    sort: z.string().optional(),
    sort_dir: z.string().optional(),
    filter: z.string().optional(),
  });

  const { page, per_page, sort, sort_dir, filter } = dataValidation(
    querySchema,
    req.query,
  );

  const SearchProductUseCase: SearchProductUseCase.UseCase = container.resolve(
    'SearchProductUseCase',
  );
  const products = await SearchProductUseCase.execute({
    page: page ?? 1,
    per_page: per_page ?? 15,
    sort: sort ?? null,
    sort_dir: sort_dir ?? null,
    filter: filter ?? null,
  });

  return res.status(200).json(products);
}
