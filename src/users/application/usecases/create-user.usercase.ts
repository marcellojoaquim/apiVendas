import { UserRepository } from './../../domain/repositories/users.repository';
import { inject, injectable } from 'tsyringe';
import { UserOutput } from '../dtos/user-output.dto';
import { BadRequestError } from '@/common/domain/errors/bad-request-error';
import { HashProvider } from '@/common/domain/providers/hash-provider';
export namespace CreateUserUseCase {
  export type Input = {
    name: string;
    email: string;
    password: string;
  };

  export type Output = UserOutput;

  @injectable()
  export class UseCase {
    constructor(
      @inject('UserRepository') private userRepository: UserRepository,
      @inject('HashProvider') private hashProvider: HashProvider,
    ) {}

    async execute(input: Input): Promise<Output> {
      if (!input.name || !input.email || !input.password) {
        throw new BadRequestError('Input data not provide or invalid');
      }

      await this.userRepository.conflictEmail(input.email);
      const hashed = await this.hashProvider.generateHash(input.password);
      const user = this.userRepository.create(input);
      user.password = hashed;
      const createdUser: UserOutput = await this.userRepository.insert(user);
      return createdUser;
    }
  }
}
