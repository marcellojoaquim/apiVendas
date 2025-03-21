import { RepositoryInterface } from '@/common/domain/repositories/repository.interface';
import { UserModel } from '../models/users.model';

export type CreateUserProps = {
  name: string;
  email: string;
  password: string;
};

export interface UserRepository
  extends RepositoryInterface<UserModel, CreateUserProps> {
  findByEmail(email: string): Promise<UserModel>;
  findByName(name: string): Promise<UserModel>;
  conflictEmail(email: string): Promise<void>;
}
