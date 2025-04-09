import {
  CreateUserProps,
  UserRepository,
} from '@/users/domain/repositories/users.repository';
import {
  SearchInput,
  SearchOutput,
} from '@/common/domain/repositories/repository.interface';
import { UserModel } from '@/users/domain/models/users.model';
import { inject, injectable } from 'tsyringe';
import { ILike, Repository } from 'typeorm';
import { User } from '../entities/users.entities';
import { NotFoundError } from '@/common/domain/errors/not-found-error';
import { ConflictError } from '@/common/domain/errors/conflict-error';

@injectable()
export class UsersTypeormRepository implements UserRepository {
  sortableFields: string[] = ['name', 'created_at'];

  constructor(
    @inject('UsersDefaultTypeormRepositoy')
    private usersRepository: Repository<User>,
  ) {}
  async findByEmail(email: string): Promise<UserModel> {
    const user = await this.usersRepository.findOneBy({ email: email });
    if (!user) {
      throw new NotFoundError(`User not found using ${email}`);
    }
    return user;
  }

  async findByName(name: string): Promise<UserModel> {
    const user = await this.usersRepository.findOneBy({ name: name });
    if (!user) {
      throw new NotFoundError(`User not found using ${name}`);
    }
    return user;
  }

  async conflictEmail(email: string): Promise<void> {
    const user = await this.usersRepository.findOneBy({ email: email });
    if (user) {
      throw new ConflictError(`The email ${email} is already in use`);
    }
  }

  create(props: CreateUserProps): UserModel {
    return this.usersRepository.create(props);
  }

  async insert(model: UserModel): Promise<UserModel> {
    return this.usersRepository.save(model);
  }

  findById(id: string): Promise<UserModel> {
    return this._get(id);
  }

  async update(model: UserModel): Promise<UserModel> {
    await this._get(model.id);
    await this.usersRepository.update({ id: model.id }, model);
    return model;
  }

  async delete(id: string): Promise<void> {
    await this._get(id);
    await this.usersRepository.delete({ id: id });
  }

  async search(props: SearchInput): Promise<SearchOutput<UserModel>> {
    const validSort = this.sortableFields.includes(props.sort) || false;
    const dirOps = ['asc', 'desc'];
    const validSortDir =
      (props.sort_dir && dirOps.includes(props.sort_dir.toLowerCase())) ||
      false;

    const orderByField = validSort ? props.sort : 'created_at';
    const orderByDir = validSortDir ? props.sort_dir : 'desc';

    const [users, total] = await this.usersRepository.findAndCount({
      ...(props.filter && {
        where: {
          name: ILike(`%${props.filter}%`),
        },
      }),
      order: {
        [orderByField]: orderByDir,
      },
      skip: (props.page - 1) * props.per_page,
      take: props.per_page,
    });

    return {
      items: users,
      total,
      per_page: props.per_page,
      current_page: props.page,
      sort: props.sort,
      sort_dir: props.sort_dir,
      filter: props.filter,
    };
  }

  protected async _get(id: string): Promise<UserModel> {
    const user = await this.usersRepository.findOneBy({ id: id });
    if (!user) {
      throw new NotFoundError(`User not found using ${id}`);
    }
    return user;
  }
}
