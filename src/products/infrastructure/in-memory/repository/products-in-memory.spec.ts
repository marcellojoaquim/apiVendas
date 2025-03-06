import { NotFoundError } from '@/common/domain/errors/not-found-error';
import { ProductsInMemoryRepository } from './products-in-memory-repository';
import { ProductDataBuilder } from '../../testing/helpers/products-data-builder';
import { ConflictError } from '@/common/domain/errors/conflict-error';

describe('ProductsInMemoryRepository unit test', () => {
  let sut: ProductsInMemoryRepository;

  beforeEach(() => {
    sut = new ProductsInMemoryRepository();
  });

  describe('FindByName', () => {
    it('Should throw not found error', async () => {
      await expect(() => sut.findByName('fake name')).rejects.toThrow(
        new NotFoundError('Product fake name not found'),
      );
      await expect(() => sut.findByName('fake name')).rejects.toBeInstanceOf(
        NotFoundError,
      );
    });

    it('Should find a product by name', async () => {
      const data = ProductDataBuilder({ name: 'Tv Smart' });
      sut.items.push(data);
      const product = await sut.findByName('Tv Smart');
      expect(product).toStrictEqual(data);
    });
  });

  describe('conflictName', () => {
    it('Should throw error when product found', async () => {
      const data = ProductDataBuilder({ name: 'Tv Smart' });
      sut.items.push(data);
      await expect(() => sut.conflictName('Tv Smart')).rejects.toThrow(
        new ConflictError(`Product name ${data.name} already in use`),
      );
      await expect(() => sut.conflictName('Tv Smart')).rejects.toBeInstanceOf(
        ConflictError,
      );
    });

    it('Should not find a product by name', async () => {
      await sut.conflictName('Fake Name');
      expect.assertions(0);
    });
  });
});
