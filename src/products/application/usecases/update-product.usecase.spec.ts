import 'reflect-metadata';
import { UpdateProductUseCase } from './update-product.usecase';
import { ProductsInMemoryRepository } from '@/products/infrastructure/in-memory/repository/products-in-memory-repository';
import { NotFoundError } from '@/common/domain/errors/not-found-error';
import { ConflictError } from '@/common/domain/errors/conflict-error';
import { ProductDataBuilder } from '@/products/infrastructure/testing/helpers/products-data-builder';

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

  it('Should not be possible to update a product with a name already in use', async () => {
    const product1 = repository.create(
      ProductDataBuilder({ name: 'Product 1' }),
    );
    await repository.insert(product1);

    const props = {
      name: 'Product 2',
      price: 100,
      quantity: 10,
    };

    const model = repository.create(props);
    await repository.insert(model);

    const newData = {
      id: model.id,
      name: 'Product 1',
      price: 105,
      quantity: 15,
    };

    await expect(sut.execute(newData)).rejects.toBeInstanceOf(ConflictError);
  });
});
