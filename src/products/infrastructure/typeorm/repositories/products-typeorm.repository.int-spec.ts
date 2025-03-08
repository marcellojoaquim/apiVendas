import { testDataSource } from '@/common/infrastructure/typeorm/testing/data-source';
import { ProductsTypeormRepository } from './products-typeorm.repository';
import { Product } from '../entities/products.entity';
import { NotFoundError } from '@/common/domain/errors/not-found-error';
import { randomUUID } from 'node:crypto';
import { ProductDataBuilder } from '../../testing/helpers/products-data-builder';
import { ConflictError } from '@/common/domain/errors/conflict-error';
import { ProductModel } from '@/products/domain/models/products.model';

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

  describe('Search', () => {
    it('Should apply pagination', async () => {
      const arrange = Array(16).fill(ProductDataBuilder({}));
      arrange.map(element => delete element.id);
      const data = testDataSource.manager.create(Product, arrange);
      await testDataSource.manager.save(data);
      const result = await ormRepository.search({
        page: 1,
        per_page: 15,
        sort: null,
        sort_dir: null,
      });
      expect(result.total).toEqual(16);
      expect(result.items.length).toEqual(15);
    });

    it('Should order by created_at and DESC when search params are null', async () => {
      const created_at = new Date();
      const models: ProductModel[] = [];
      const arrange = Array(16).fill(ProductDataBuilder({}));
      arrange.forEach((element, index) => {
        delete element.id;
        models.push({
          ...element,
          created_at: new Date(created_at.getTime() + index),
          name: `Product ${index}`,
        });
      });
      const data = testDataSource.manager.create(Product, models);
      await testDataSource.manager.save(data);

      const result = await ormRepository.search({
        page: 1,
        per_page: 15,
        sort: null,
        sort_dir: null,
        filter: null,
      });

      expect(result.items.length).toEqual(15);
      expect(result.items[0].name).toEqual('Product 15');
      expect(result.items[14].name).toEqual('Product 1');
      expect(result.sort).toStrictEqual('created_at');
      expect(result.sort_dir).toStrictEqual('desc');
    });

    it('Should order by created_at and DESC when search params are null', async () => {
      const created_at = new Date();
      const models: ProductModel[] = [];
      const arrange = Array(16).fill(ProductDataBuilder({}));
      arrange.forEach((element, index) => {
        delete element.id;
        models.push({
          ...element,
          created_at: new Date(created_at.getTime() + index),
          name: `Product ${index}`,
        });
      });
      const data = testDataSource.manager.create(Product, models);
      await testDataSource.manager.save(data);

      const result = await ormRepository.search({
        page: 1,
        per_page: 15,
        sort: null,
        sort_dir: null,
        filter: null,
      });

      expect(result.items.length).toEqual(15);
      expect(result.items[0].name).toEqual('Product 15');
      expect(result.items[14].name).toEqual('Product 1');
    });

    it('Should order apply paginate and sort', async () => {
      const created_at = new Date();
      const models: ProductModel[] = [];
      'badec'.split('').forEach((element, index) => {
        models.push({
          ...ProductDataBuilder({}),
          created_at: new Date(created_at.getTime() + index),
          name: element,
        });
      });
      const data = testDataSource.manager.create(Product, models);
      await testDataSource.manager.save(data);

      let result = await ormRepository.search({
        page: 1,
        per_page: 2,
        sort: 'name',
        sort_dir: 'ASC',
        filter: null,
      });

      expect(result.items.length).toEqual(2);
      expect(result.items[0].name).toEqual('a');
      expect(result.items[1].name).toEqual('b');

      result = await ormRepository.search({
        page: 1,
        per_page: 2,
        sort: 'name',
        sort_dir: 'DESC',
        filter: null,
      });

      expect(result.items.length).toEqual(2);
      expect(result.items[0].name).toEqual('e');
      expect(result.items[1].name).toEqual('d');
    });

    it('Should order apply filter, paginate and sort', async () => {
      const created_at = new Date();
      const models: ProductModel[] = [];
      const names = ['test', 'a', 'TEST', 'c', 'd', 'TeSt'];
      names.forEach((element, index) => {
        models.push({
          ...ProductDataBuilder({}),
          created_at: new Date(created_at.getTime() + index),
          name: element,
        });
      });
      const data = testDataSource.manager.create(Product, models);
      await testDataSource.manager.save(data);

      let result = await ormRepository.search({
        page: 1,
        per_page: 2,
        sort: 'name',
        sort_dir: 'ASC',
        filter: 'TEST',
      });

      expect(result.items.length).toEqual(2);
      expect(result.items[0].name).toEqual(names[0]);
      expect(result.items[1].name).toEqual(names[5]);

      result = await ormRepository.search({
        page: 2,
        per_page: 2,
        sort: 'name',
        sort_dir: 'ASC',
        filter: 'TEST',
      });

      expect(result.items.length).toEqual(1);
      expect(result.items[0].name).toEqual(names[2]);
    });
  });
});
