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

  describe('Apply filter', () => {
    it('Should no filter items', async () => {
      const data = ProductDataBuilder({});
      sut.items.push(data);
      const spyFilterMethod = jest.spyOn(sut.items, 'filter' as any);
      const result = await sut['applyFilter'](sut.items, null);
      expect(spyFilterMethod).not.toHaveBeenCalled();
      expect(result).toStrictEqual(sut.items);
    });

    it('Should filter items using filter params', async () => {
      const items = [
        ProductDataBuilder({ name: 'Test' }),
        ProductDataBuilder({ name: 'TEST' }),
        ProductDataBuilder({ name: 'TeSt' }),
        ProductDataBuilder({ name: 'Fake' }),
      ];
      sut.items.push(...items);
      const spyFilterMethod = jest.spyOn(sut.items, 'filter' as any);
      let result = await sut['applyFilter'](sut.items, 'TEST');
      expect(spyFilterMethod).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual([items[0], items[1], items[2]]);

      result = await sut['applyFilter'](sut.items, 'test');
      expect(result).toStrictEqual([items[0], items[1], items[2]]);

      result = await sut['applyFilter'](sut.items, 'Fake');
      expect(result).toStrictEqual([items[3]]);

      result = await sut['applyFilter'](sut.items, 'no-filter');
      expect(result).toHaveLength(0);
    });
  });

  describe('Apply Sort', () => {
    it('Should sort items by created_at field', async () => {
      const created_at = new Date();
      const items = [
        ProductDataBuilder({ name: 'c', created_at: created_at }),
        ProductDataBuilder({
          name: 'a',
          created_at: new Date(created_at.getTime() + 100),
        }),
        ProductDataBuilder({
          name: 'b',
          created_at: new Date(created_at.getTime() + 200),
        }),
        ProductDataBuilder({
          name: 'd',
          created_at: new Date(created_at.getTime() + 300),
        }),
      ];
      sut.items.push(...items);
      const result = await sut['applySort'](sut.items, null, null);
      expect(result).toStrictEqual([items[3], items[2], items[1], items[0]]);
    });

    it('Should sort items by name field', async () => {
      const items = [
        ProductDataBuilder({ name: 'a' }),
        ProductDataBuilder({ name: 'c' }),
        ProductDataBuilder({ name: 'b' }),
        ProductDataBuilder({ name: 'd' }),
      ];
      sut.items.push(...items);
      const result = await sut['applySort'](sut.items, 'name', 'desc');
      expect(result).toStrictEqual([items[3], items[1], items[2], items[0]]);
    });
  });
});
