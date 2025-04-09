import { dataSource } from '@/common/infrastructure/typeorm';
import { UsersTypeormRepository } from './../typeorm/repositories/users-typorm.repository';
import { container } from 'tsyringe';
import { User } from '../typeorm/entities/users.entities';

container.registerSingleton('UsersRepository', UsersTypeormRepository);
container.registerInstance(
  'UsersDefaultTypeormRepositoy',
  dataSource.getRepository(User),
);
