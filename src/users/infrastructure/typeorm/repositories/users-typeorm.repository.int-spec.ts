import { testDataSource } from '@/common/infrastructure/typeorm/testing/data-source';
import { UsersTypeormRepository } from './users-typorm.repository';
import { User } from '../entities/users.entities';
import { randomUUID } from 'node:crypto';
import { NotFoundError } from '@/common/domain/errors/not-found-error';
import { UserDataBuilder } from '../../testing/helpers/users-data-builder';
import { ConflictError } from '@/common/domain/errors/conflict-error';
import { UserModel } from '@/users/domain/models/users.model';

describe('UsersTypeorm Repository integration tests', () => {
  let ormRepository: UsersTypeormRepository;
  let typeormEntityManeger: any;

  beforeAll(async () => {
    await testDataSource.initialize();
    typeormEntityManeger = testDataSource.createEntityManager();
  });

  beforeEach(async () => {
    await testDataSource.manager.query('DELETE from users');
    ormRepository = new UsersTypeormRepository(
      typeormEntityManeger.getRepository(User),
    );
  });

  afterAll(async () => {
    await testDataSource.destroy();
  });

  describe('FindById', () => {
    it('Should not found by id', async () => {
      const id = randomUUID();
      await expect(ormRepository.findById(id)).rejects.toThrow(
        new NotFoundError(`User not found using ${id}`),
      );
    });

    it('Should find a user', async () => {
      const data = UserDataBuilder({});
      const user = testDataSource.manager.create(User, data);
      await testDataSource.manager.save(user);

      const result = await ormRepository.findById(user.id);
      expect(result.id).toEqual(user.id);
      expect(result.name).toEqual(user.name);
    });
  });

  describe('Create', () => {
    it('Should create a new object', () => {
      const data = UserDataBuilder({ name: 'User 01' });
      const result = ormRepository.create(data);
      expect(result.name).toEqual(data.name);
    });
  });

  describe('Insert', () => {
    it('Shuld insert a new object', async () => {
      const data = UserDataBuilder({ name: 'User 01' });
      const result = await ormRepository.insert(data);
      expect(result.name).toEqual(data.name);
    });
  });

  describe('Update', () => {
    it('Should not find a user', async () => {
      const data = UserDataBuilder({});
      await expect(ormRepository.update(data)).rejects.toThrow(
        new NotFoundError(`User not found using ${data.id}`),
      );
    });

    it('Should update a user', async () => {
      const data = UserDataBuilder({});
      const user = testDataSource.manager.create(User, data);
      await testDataSource.manager.save(user);
      user.name = 'User 01';
      const result = await ormRepository.update(user);
      expect(result.id).toEqual(user.id);
      expect(result.name).toEqual('User 01');
    });
  });

  describe('Delete', () => {
    it('Should not find a user', async () => {
      const id = randomUUID();
      await expect(ormRepository.delete(id)).rejects.toThrow(
        new NotFoundError(`User not found using ${id}`),
      );
    });

    it('Should delete a user', async () => {
      const data = UserDataBuilder({});
      const user = testDataSource.manager.create(User, data);
      await testDataSource.manager.save(user);
      await ormRepository.delete(user.id);
      const result = await testDataSource.manager.findOneBy(User, {
        id: data.id,
      });
      expect(result).toBeNull();
    });
  });

  describe('FindByName', () => {
    it('Should not find a user', async () => {
      const name = 'User';
      await expect(ormRepository.findByName(name)).rejects.toThrow(
        new NotFoundError(`User not found using ${name}`),
      );
    });

    it('Sould find a product', async () => {
      const data = UserDataBuilder({});
      const user = testDataSource.manager.create(User, data);
      await testDataSource.manager.save(user);

      const result = await ormRepository.findByName(data.name);
      expect(result.id).toEqual(user.id);
      expect(result.name).toEqual(user.name);
    });
  });

  describe('FindByNEmail', () => {
    it('Should not find a user', async () => {
      const email = 'email@email.com';
      await expect(ormRepository.findByEmail(email)).rejects.toThrow(
        new NotFoundError(`User not found using ${email}`),
      );
    });

    it('Sould find a user', async () => {
      const data = UserDataBuilder({ email: 'email@email.com' });
      const user = testDataSource.manager.create(User, data);
      await testDataSource.manager.save(user);

      const result = await ormRepository.findByEmail(data.email);
      expect(result.id).toEqual(user.id);
      expect(result.email).toEqual('email@email.com');
    });
  });

  describe('ConflictEmail', () => {
    it('Should throw an error', async () => {
      const data = UserDataBuilder({ email: 'email@email.com' });
      const user = testDataSource.manager.create(User, data);
      await testDataSource.manager.save(user);

      await expect(ormRepository.conflictEmail(data.email)).rejects.toThrow(
        new ConflictError(`The email ${data.email} is already in use`),
      );
    });
  });

  describe('Search', () => {
    it('Should apply pagination', async () => {
      const arrange = Array(16).fill(UserDataBuilder({}));
      arrange.map(element => delete element.id);
      const data = testDataSource.manager.create(User, arrange);
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

    it('Should order by created_at and sort by DESC when search params are null', async () => {
      const created_at = new Date();
      const models: UserModel[] = [];
      const arrange = Array(16).fill(UserDataBuilder({}));
      arrange.forEach((element, index) => {
        delete element.id;
        models.push({
          ...element,
          created_at: new Date(created_at.getTime() + index * 1000),
          name: `User ${index}`,
        });
      });
      const data = testDataSource.manager.create(User, models);
      await testDataSource.manager.save(data);

      const result = await ormRepository.search({
        page: 1,
        per_page: 15,
        sort: null,
        sort_dir: null,
        filter: null,
      });

      expect(result.items.length).toEqual(15);
      expect(result.items[0].name).toEqual('User 15');
      expect(result.items[14].name).toEqual('User 1');
      expect(result.items[13].name).toEqual('User 2');
      expect(result.sort).toStrictEqual('created_at');
      expect(result.sort_dir).toStrictEqual('desc');
    });

    it('Should order apply paginate and sort', async () => {
      const created_at = new Date();
      const models: UserModel[] = [];
      'badec'.split('').forEach((element, index) => {
        models.push({
          ...UserDataBuilder({}),
          created_at: new Date(created_at.getTime() + index),
          name: element,
        });
      });
      const data = testDataSource.manager.create(User, models);
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
      const models: UserModel[] = [];
      const names = ['test', 'a', 'TEST', 'c', 'd', 'TeSt'];
      names.forEach((element, index) => {
        models.push({
          ...UserDataBuilder({}),
          created_at: new Date(created_at.getTime() + index),
          name: element,
        });
      });
      const data = testDataSource.manager.create(User, models);
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
