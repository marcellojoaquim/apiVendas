import { ConflictError } from '@/common/domain/errors/conflict-error';
import { NotFoundError } from '@/common/domain/errors/not-found-error';
import { InMemoryRepository } from '@/common/domain/repositories/in-memory.repository';
import { UserModel } from '@/users/domain/models/users.model';
import { UserRepository } from '@/users/domain/repositories/users.repository';

export class UserInMemoryRepository
  extends InMemoryRepository<UserModel>
  implements UserRepository
{
  sortableFields: string[] = ['name', 'email', 'created_at'];

  async findByEmail(email: string): Promise<UserModel> {
    const model = this.items.find(item => item.email === email);
    if (!model) {
      throw new NotFoundError('No user found for this email');
    }
    return model;
  }

  async findByName(name: string): Promise<UserModel> {
    const model = this.items.find(item => item.name === name);
    if (!model) {
      throw new NotFoundError('No user found for this name');
    }
    return model;
  }

  async conflictEmail(email: string): Promise<void> {
    const user = this.items.find((item: any) => item.email === email);
    if (user) {
      throw new ConflictError('Email already in use');
    }
  }

  protected applyFilter(
    items: UserModel[],
    filter: string | null,
  ): Promise<UserModel[]> {
    throw new Error('Method not implemented.');
  }
}
