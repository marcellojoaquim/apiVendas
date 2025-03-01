import { NotFoundError } from '@/common/domain/errors/not-found-error';
import { ProductsInMemoryRepository } from './products-in-memory-repository';
import { ProductDataBuilder } from '../../testing/helpers/products-data-builder';

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
});
