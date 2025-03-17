import 'reflect-metadata';
import { ProductsInMemoryRepository } from '@/products/infrastructure/in-memory/repository/products-in-memory-repository';
import { SearchProductUseCase } from './search-product.usecase';
import { ProductDataBuilder } from '@/products/infrastructure/testing/helpers/products-data-builder';

describe('SearchProductUseCase unit tests', () => {
  let sut: SearchProductUseCase.UseCase;
  let repository: ProductsInMemoryRepository;

  beforeEach(() => {
    repository = new ProductsInMemoryRepository();
    sut = new SearchProductUseCase.UseCase(repository);
  });

  it('Should return the products ordered by created_at field', async () => {
    const created_at = new Date();
    const items = [
      { ...ProductDataBuilder({}) },
      {
        ...ProductDataBuilder({
          created_at: new Date(created_at.getTime() + 100),
        }),
      },
      {
        ...ProductDataBuilder({
          created_at: new Date(created_at.getTime() + 200),
        }),
      },
    ];
    repository.items = items;
    const result = await sut.execute({});
    expect(result).toStrictEqual({
      items: [...items].reverse(),
      total: 3,
      current_page: 1,
      last_page: 1,
      per_page: 15,
    });
  });

  it.only('Should return output using pagination, sort and filter', async () => {
    const items = [
      { ...ProductDataBuilder({ name: 'a' }) },
      { ...ProductDataBuilder({ name: 'AA' }) },
      { ...ProductDataBuilder({ name: 'Aa' }) },
      { ...ProductDataBuilder({ name: 'b' }) },
      { ...ProductDataBuilder({ name: 'c' }) },
    ];
    repository.items = items;

    let output = await sut.execute({
      page: 1,
      per_page: 2,
      sort: 'name',
      sort_dir: 'asc',
      filter: 'a',
    });

    expect(output).toStrictEqual({
      items: [items[1], items[2]],
      total: 3,
      current_page: 1,
      per_page: 2,
      last_page: 2,
    });

    output = await sut.execute({
      page: 1,
      per_page: 2,
      sort: 'name',
      sort_dir: 'desc',
      filter: 'a',
    });

    expect(output).toStrictEqual({
      items: [items[0], items[2]],
      total: 3,
      current_page: 1,
      per_page: 2,
      last_page: 2,
    });

    output = await sut.execute({
      page: 2,
      per_page: 2,
      sort: 'name',
      sort_dir: 'desc',
      filter: 'a',
    });
    expect(output).toStrictEqual({
      items: [items[1]],
      total: 3,
      current_page: 2,
      per_page: 2,
      last_page: 2,
    });
  });
});
