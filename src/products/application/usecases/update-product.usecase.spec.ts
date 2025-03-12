import 'reflect-metadata';
import { UpdateProductUseCase } from './update-product.usecase';
import { ProductsInMemoryRepository } from '@/products/infrastructure/in-memory/repository/products-in-memory-repository';
import { NotFoundError } from '@/common/domain/errors/not-found-error';

describe('UpdateProductUseCase unit tests', () => {
  let sut: UpdateProductUseCase.UseCase;
  let repository: ProductsInMemoryRepository;

  beforeEach(() => {
    repository = new ProductsInMemoryRepository();
    sut = new UpdateProductUseCase.UseCase(repository);
  });

  it('Should throws error when product not found', async () => {
    await expect(sut.execute({ id: 'fake-id' })).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('Should be able to update a product', async () => {
    const spyUpdate = jest.spyOn(repository, 'update');
    const props = {
      name: 'Product 1',
      price: 100,
      quantity: 10,
    };

    const model = repository.create(props);
    await repository.insert(model);

    const newData = {
      id: model.id,
      name: 'New Product 1',
      price: 105,
      quantity: 15,
    };

    const result = await sut.execute(newData);

    expect(result.name).toEqual(newData.name);
    expect(result.quantity).toEqual(newData.quantity);
    expect(result.price).toEqual(newData.price);
    expect(spyUpdate).toHaveBeenCalledTimes(1);
  });
});
