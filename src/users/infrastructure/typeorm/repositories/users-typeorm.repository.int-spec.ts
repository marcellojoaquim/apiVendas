import { testDataSource } from '@/common/infrastructure/typeorm/testing/data-source';
import { UsersTypeormRepository } from './users-typorm.repository';
import { User } from '../entities/users.entities';
import { randomUUID } from 'node:crypto';
import { NotFoundError } from '@/common/domain/errors/not-found-error';
import { UserDataBuilder } from '../../testing/helpers/users-data-builder';
import { ConflictError } from '@/common/domain/errors/conflict-error';

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
});
