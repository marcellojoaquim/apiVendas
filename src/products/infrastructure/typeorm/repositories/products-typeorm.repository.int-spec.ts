import { testDataSource } from '@/common/infrastructure/typeorm/testing/data-source';
import { ProductsTypeormRepository } from './products-typeorm.repository';
import { Product } from '../entities/products.entity';
import { NotFoundError } from '@/common/domain/errors/not-found-error';
import { randomUUID } from 'node:crypto';
import { ProductDataBuilder } from '../../testing/helpers/products-data-builder';
import { ConflictError } from '@/common/domain/errors/conflict-error';

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

  describe('FindById', () => {
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

  describe('Update', () => {
    it('Should not find a product', async () => {
      const data = ProductDataBuilder({});
      await expect(ormRepository.update(data)).rejects.toThrow(
        new NotFoundError(`Product not found using ${data.id}`),
      );
    });

    it('Should update a product', async () => {
      const data = ProductDataBuilder({});
      const product = testDataSource.manager.create(Product, data);
      await testDataSource.manager.save(product);
      product.name = 'Product 1';
      const result = await ormRepository.update(product);
      expect(result.id).toEqual(product.id);
      expect(result.name).toEqual('Product 1');
    });
  });

  describe('Delete', () => {
    it('Should not find a product', async () => {
      const id = randomUUID();
      await expect(ormRepository.delete(id)).rejects.toThrow(
        new NotFoundError(`Product not found using ${id}`),
      );
    });

    it('Should delete a product', async () => {
      const data = ProductDataBuilder({});
      const product = testDataSource.manager.create(Product, data);
      await testDataSource.manager.save(product);
      await ormRepository.delete(product.id);
      const result = await testDataSource.manager.findOneBy(Product, {
        id: data.id,
      });
      expect(result).toBeNull();
    });
  });

  describe('FindByName', () => {
    it('Should not find a product', async () => {
      const name = 'Product';
      await expect(ormRepository.findByName(name)).rejects.toThrow(
        new NotFoundError(`Product not found using ${name}`),
      );
    });

    it('Should find a product', async () => {
      const data = ProductDataBuilder({});
      const product = testDataSource.manager.create(Product, data);
      await testDataSource.manager.save(product);

      const result = await ormRepository.findByName(data.name);
      expect(result.id).toEqual(product.id);
      expect(result.name).toEqual(product.name);
    });
  });

  describe('ConflictName', () => {
    it('Should throw an error', async () => {
      const data = ProductDataBuilder({ name: 'Product 1' });
      const product = testDataSource.manager.create(Product, data);
      await testDataSource.manager.save(product);

      await expect(ormRepository.conflictName(data.name)).rejects.toThrow(
        new ConflictError(`The product name: ${data.name} already in use`),
      );
    });
  });

  describe('FindAllByIds', () => {
    it('Should return a empty list of products', async () => {
      const ids = [
        { id: randomUUID() },
        { id: '60242824-5837-4052-b4b6-b2fa66cac373' },
      ];
      const result = await ormRepository.findAllByIds(ids);
      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it('Should find a list of products', async () => {
      const ids = [
        { id: randomUUID() },
        { id: '60242824-5837-4052-b4b6-b2fa66cac373' },
      ];
      const data = ProductDataBuilder({ id: ids[1].id });
      const product = testDataSource.manager.create(Product, data);
      await testDataSource.manager.save(product);

      const result = await ormRepository.findAllByIds(ids);
      expect(result).toHaveLength(1);
      expect(result[0].id).toEqual(product.id);
    });
  });
});
