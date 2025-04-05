import { NotFoundError } from '@/common/domain/errors/not-found-error';
import { UserDataBuilder } from '../../testing/helpers/users-data-builder';
import { UsersInMemoryRepository } from './users-in-memory.repository';
import { ConflictError } from '@/common/domain/errors/conflict-error';

describe('UsersInMemoryRepository Unit Tests', () => {
  let sut: UsersInMemoryRepository;

  beforeEach(() => {
    sut = new UsersInMemoryRepository();
  });

  describe('findByEmail', () => {
    it('Should find a user by email', async () => {
      const user = UserDataBuilder({ email: 'teste@email.com' });
      sut.items.push(user);
      const result = await sut.findByEmail(user.email);
      expect(result.email).toStrictEqual('teste@email.com');
    });

    it('Should throw not found error', async () => {
      await expect(() => sut.findByEmail('fake@email')).rejects.toThrow(
        new NotFoundError('No user found for this email'),
      );

      await expect(() => sut.findByEmail('fake@email')).rejects.toBeInstanceOf(
        NotFoundError,
      );
    });
  });

  describe('findByName', () => {
    it('Should find a user by name', async () => {
      const user = UserDataBuilder({ name: 'user 1' });
      sut.items.push(user);
      const result = await sut.findByName(user.name);
      expect(result.name).toStrictEqual('user 1');
    });

    it('Should throw not found error', async () => {
      await expect(() => sut.findByName('fake name')).rejects.toThrow(
        new NotFoundError('No user found for this name'),
      );

      await expect(() => sut.findByName('fake name')).rejects.toBeInstanceOf(
        NotFoundError,
      );
    });
  });

  describe('conflictEmail', () => {
    it('Should throw conflict error', async () => {
      const user = UserDataBuilder({ email: 'user@email.com' });
      sut.items.push(user);
      await expect(sut.conflictEmail('user@email.com')).rejects.toBeInstanceOf(
        ConflictError,
      );
    });
  });

  describe('applyFilter', () => {
    it('Should not filter items when object filter is null', async () => {
      const user = UserDataBuilder({});
      sut.insert(user);
      const spyFilter = jest.spyOn(sut.items, 'filter' as any);

      const filteredItems = await sut['applyFilter'](sut.items, null as any);
      expect(spyFilter).not.toHaveBeenCalled();
      expect(filteredItems).toStrictEqual(sut.items);
    });

    it('Shuld filter users by name', async () => {
      const items = [
        UserDataBuilder({ name: 'Test' }),
        UserDataBuilder({ name: 'TEST' }),
        UserDataBuilder({ name: 'a' }),
      ];

      sut.items = items;
      const spyFilter = jest.spyOn(sut.items, 'filter' as any);
      const filteredItems = await sut['applyFilter'](sut.items, 'TEST');
      expect(spyFilter).toHaveBeenCalledTimes(1);
      expect(filteredItems).toStrictEqual([sut.items[0], sut.items[1]]);
      expect(filteredItems).toHaveLength(2);
    });
  });

  describe('applySort', () => {
    it('Should sort by created_at field when sort param is null', async () => {
      const created_at = new Date();
      const items = [
        UserDataBuilder({
          name: 'c',
          created_at: created_at,
        }),

        UserDataBuilder({
          name: 'a',
          created_at: new Date(created_at.getTime() + 100),
        }),

        UserDataBuilder({
          name: 'b',
          created_at: new Date(created_at.getTime() + 200),
        }),
      ];
      sut.items = items;
      const sortedItems = await sut['applySort'](sut.items, null, null);
      expect(sortedItems).toStrictEqual([
        sut.items[2],
        sut.items[1],
        sut.items[0],
      ]);
    });

    it('Should sort by name field', async () => {
      const items = [
        UserDataBuilder({ name: 'b' }),
        UserDataBuilder({ name: 'c' }),
        UserDataBuilder({ name: 'a' }),
      ];
      sut.items = items;
      let sortedItems = await sut['applySort'](sut.items, 'name', 'asc');
      expect(sortedItems).toStrictEqual([
        sut.items[2],
        sut.items[0],
        sut.items[1],
      ]);

      sortedItems = await sut['applySort'](sut.items, 'name', 'desc');
      expect(sortedItems).toStrictEqual([
        sut.items[1],
        sut.items[0],
        sut.items[2],
      ]);
    });

    it('Should sort by email field', async () => {
      const items = [
        UserDataBuilder({ email: 'b@email.com' }),
        UserDataBuilder({ email: 'c@email.com' }),
        UserDataBuilder({ email: 'a@email.com' }),
      ];
      sut.items = items;
      let sortedItems = await sut['applySort'](sut.items, 'email', 'asc');
      expect(sortedItems).toStrictEqual([
        sut.items[2],
        sut.items[0],
        sut.items[1],
      ]);

      sortedItems = await sut['applySort'](sut.items, 'email', 'desc');
      expect(sortedItems).toStrictEqual([
        sut.items[1],
        sut.items[0],
        sut.items[2],
      ]);
    });
  });
});
