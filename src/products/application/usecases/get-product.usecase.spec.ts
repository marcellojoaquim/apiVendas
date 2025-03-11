import 'reflect-metadata';
import { GetProductUseCase } from '@/products/application/usecases/get-product.usecase';
import { ProductsRepository } from '@/products/domain/repositories/products.repository';
import { ProductsInMemoryRepository } from '@/products/infrastructure/in-memory/repository/products-in-memory-repository';
import { NotFoundError } from '@/common/domain/errors/not-found-error';

describe('GetProductUseCase unit tests', () => {
  let sut: GetProductUseCase.UseCase;
  let repository: ProductsRepository;

  beforeEach(() => {
    repository = new ProductsInMemoryRepository();
    sut = new GetProductUseCase.UseCase(repository);
  });

  it('Should get a product by id', async () => {
    const spyFindById = jest.spyOn(repository, 'findById');
    const props = {
      name: 'Product 1',
      price: 100,
      quantity: 10,
    };

    const model = repository.create(props);
    await repository.insert(model);
    const result = await sut.execute({ id: model.id });

    expect(result).toMatchObject(model);
    expect(spyFindById).toHaveBeenCalledTimes(1);
  });

  it('Should throws error when the product is not found', async () => {
    await expect(sut.execute({ id: 'fake-id' })).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});
