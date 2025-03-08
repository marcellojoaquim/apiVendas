import { ProductsRepository } from '@/products/domain/repositories/products.repository';
import { CreateProductUseCase } from './create-product.usecase';
import { ProductsInMemoryRepository } from '@/products/infrastructure/in-memory/repository/products-in-memory-repository';

describe('CreateProductUseCase unit tests', () => {
  let sut: CreateProductUseCase.UseCase;
  let repository: ProductsRepository;

  beforeEach(() => {
    repository = new ProductsInMemoryRepository();
    sut = new CreateProductUseCase.UseCase(repository);
  });

  it('Should create a product', async () => {
    const spyInsert = jest.spyOn(repository, 'insert');
    const props = {
      name: 'Product 1',
      price: 100,
      quantity: 10,
    };

    const result = await sut.execute(props);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeDefined();
    expect(spyInsert).toHaveBeenCalledTimes(1);
  });
});
