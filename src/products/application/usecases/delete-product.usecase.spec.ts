import 'reflect-metadata';
import { ProductsInMemoryRepository } from '@/products/infrastructure/in-memory/repository/products-in-memory-repository';
import { NotFoundError } from '@/common/domain/errors/not-found-error';
import { DeleteProductUseCase } from './delete-product.usecase';

describe('DeleteProductUseCase unit tests', () => {
  let sut: DeleteProductUseCase.UseCase;
  let repository: ProductsInMemoryRepository;

  beforeEach(() => {
    repository = new ProductsInMemoryRepository();
    sut = new DeleteProductUseCase.UseCase(repository);
  });

  it('Should delete a product by id', async () => {
    const spyDelete = jest.spyOn(repository, 'delete');
    const props = {
      name: 'Product 1',
      price: 100,
      quantity: 10,
    };

    const model = repository.create(props);
    const product = await repository.insert(model);

    expect(repository.items.length).toBe(1);

    await sut.execute({ id: product.id });
    expect(spyDelete).toHaveBeenCalledTimes(1);
    expect(repository.items.length).toBe(0);
  });

  it('Should throws error when the product is not found', async () => {
    await expect(sut.execute({ id: 'fake-id' })).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});
