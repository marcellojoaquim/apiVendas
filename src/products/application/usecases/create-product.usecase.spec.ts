import { ProductsRepository } from '@/products/domain/repositories/products.repository';
import { CreateProductUseCase } from './create-product.usecase';
import { ProductsInMemoryRepository } from '@/products/infrastructure/in-memory/repository/products-in-memory-repository';
import { ConflictError } from '@/common/domain/errors/conflict-error';
import { BadRequestError } from '@/common/domain/errors/bad-request-error';

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

  it('Should not possible create a new product with a name already in use in another product', async () => {
    const props = {
      name: 'Product 1',
      price: 100,
      quantity: 10,
    };
    await sut.execute(props);
    await expect(sut.execute(props)).rejects.toBeInstanceOf(ConflictError);
    await expect(sut.execute(props)).rejects.toThrow(
      new ConflictError(`Product name ${props.name} already in use`),
    );
  });

  it('Should throws error when name not privided', async () => {
    const props = {
      name: null,
      price: 100,
      quantity: 10,
    };
    await expect(sut.execute(props)).rejects.toBeInstanceOf(BadRequestError);
    await expect(sut.execute(props)).rejects.toThrow(
      new BadRequestError('Input data not provide or valid'),
    );
  });
  it('Should throws error when price not privided', async () => {
    const props = {
      name: 'Product',
      price: null,
      quantity: 10,
    };
    await expect(sut.execute(props)).rejects.toBeInstanceOf(BadRequestError);
    await expect(sut.execute(props)).rejects.toThrow(
      new BadRequestError('Input data not provide or valid'),
    );
  });
  it('Should throws error when quantity not privided', async () => {
    const props = {
      name: 'Product',
      price: 100,
      quantity: null,
    };
    await expect(sut.execute(props)).rejects.toBeInstanceOf(BadRequestError);
    await expect(sut.execute(props)).rejects.toThrow(
      new BadRequestError('Input data not provide or valid'),
    );
  });
});
