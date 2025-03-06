import { testDataSource } from '@/common/infrastructure/typeorm/testing/data-source';
import { ProductsTypeormRepository } from './products-typeorm.repository';
import { Product } from '../entities/products.entity';
import { NotFoundError } from '@/common/domain/errors/not-found-error';
import { randomUUID } from 'node:crypto';
import { ProductDataBuilder } from '../../testing/helpers/products-data-builder';

describe('ProductsTypeormRepository integration test', () => {
  let ormRepository: ProductsTypeormRepository;
  //const SECONDS = 1000;

  beforeAll(async () => {
    await testDataSource.initialize();
  });

  beforeEach(async () => {
    await testDataSource.manager.query('DELETE FROM products');
    ormRepository = new ProductsTypeormRepository();
    ormRepository.productsRepository = testDataSource.getRepository(Product);
  });

  afterAll(async () => {
    await testDataSource.destroy();
  });

  describe('FindByID', () => {
    it('Should not find a product', async () => {
      const id = randomUUID();
      await expect(ormRepository.findById(id)).rejects.toThrow(
        new NotFoundError(`Product not found using ${id}`),
      );
    });

    it('Should find a product', async () => {
      const data = ProductDataBuilder({});
      const product = testDataSource.manager.create(Product, data);
      await testDataSource.manager.save(product);

      const result = await ormRepository.findById(product.id);
      expect(result.id).toEqual(product.id);
      expect(result.name).toEqual(product.name);
    });
  });

  describe('Create', () => {
    it('Should create a new object', () => {
      const data = ProductDataBuilder({ name: 'Product-1' });
      const result = ormRepository.create(data);
      expect(result.name).toEqual(data.name);
    });
  });

  describe('Insert', () => {
    it('Should insert a new object', async () => {
      const data = ProductDataBuilder({ name: 'Product-1' });
      const result = await ormRepository.insert(data);
      expect(result.name).toEqual(data.name);
    });
  });
});
