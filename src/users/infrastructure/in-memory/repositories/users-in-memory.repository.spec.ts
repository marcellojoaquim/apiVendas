import { NotFoundError } from '@/common/domain/errors/not-found-error';
import { UserDataBuilder } from '../../testing/helpers/users-data-builder';
import { UsersInMemoryRepository } from './users-in-memory.repository';

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
});
