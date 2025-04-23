import 'reflect-metadata';
import { HashProvider } from './../../../common/domain/providers/hash-provider';
import { UsersInMemoryRepository } from '@/users/infrastructure/in-memory/repositories/users-in-memory.repository';
import { CreateUserUseCase } from './create-user.usercase';
import { BcryptjsHashProvider } from '@/common/infrastructure/providers/hash-provider/bcryptjs-hash.provider';
import { UserDataBuilder } from '@/users/infrastructure/testing/helpers/users-data-builder';
import { BadRequestError } from '@/common/domain/errors/bad-request-error';
import { ConflictError } from '@/common/domain/errors/conflict-error';

describe('CreateUserUsecase Integration Tests', () => {
  let createUserUsecase: CreateUserUseCase.UseCase;
  let repository: UsersInMemoryRepository;
  let hash: HashProvider;

  beforeEach(() => {
    repository = new UsersInMemoryRepository();
    hash = new BcryptjsHashProvider();
    createUserUsecase = new CreateUserUseCase.UseCase(repository, hash);
  });

  it('Should create a user', async () => {
    const spy = jest.spyOn(repository, 'insert');
    const props = UserDataBuilder({});
    const result = await createUserUsecase.execute({
      name: props.name,
      email: props.email,
      password: props.password,
    });

    expect(result.id).toBeDefined();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('Should encrypt the users password', async () => {
    const props = UserDataBuilder({ password: '123456' });
    const result = await createUserUsecase.execute(props);

    const comparetedPassword = await hash.compareHash(
      '123456',
      result.password,
    );
    expect(comparetedPassword).toBeTruthy();
  });

  it('Should throw error when name not provided', async () => {
    const props = { name: null, email: 'email@email.com', password: '123456' };
    expect(createUserUsecase.execute(props)).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });

  it('Should throw error when email not provided', async () => {
    const props = { name: 'Teste', email: null, password: '123456' };
    await expect(createUserUsecase.execute(props)).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });

  it('Should throw error when password not provided', async () => {
    const props = { name: 'Teste', email: 'email@email.com', password: null };
    expect(createUserUsecase.execute(props)).rejects.toThrow(
      new BadRequestError('Input data not provide or invalid'),
    );
  });

  it('Should not possible to register yourself with email already in use', async () => {
    const props = {
      name: 'test',
      email: 'email@teste.com',
      password: '123456',
    };

    await createUserUsecase.execute(props);
    await expect(createUserUsecase.execute(props)).rejects.toBeInstanceOf(
      ConflictError,
    );
  });
});
