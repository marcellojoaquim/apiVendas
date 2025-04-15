import { dataSource } from '@/common/infrastructure/typeorm';
import { UsersTypeormRepository } from './../typeorm/repositories/users-typorm.repository';
import { container } from 'tsyringe';
import { User } from '../typeorm/entities/users.entities';
import { CreateUserUseCase } from '@/users/application/usecases/create-user.usercase';

container.registerSingleton('UsersRepository', UsersTypeormRepository);
container.registerSingleton('CreateUserUseCase', CreateUserUseCase.UseCase);
container.registerInstance(
  'UsersDefaultTypeormRepositoy',
  dataSource.getRepository(User),
);
