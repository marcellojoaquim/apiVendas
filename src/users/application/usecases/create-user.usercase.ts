import { UserRepository } from './../../domain/repositories/users.repository';
import { inject, injectable } from 'tsyringe';
import { UserOutput } from '../dtos/user-output.dto';
import { BadRequestError } from '@/common/domain/errors/bad-request-error';
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
    ) {}

    async execute(input: Input): Promise<Output> {
      if (!input.name || !input.email || !input.password) {
        throw new BadRequestError('Inut data not provide or invalid');
      }

      await this.userRepository.conflictEmail(input.email);
      const user = this.userRepository.create(input);
      const createdUser: UserOutput = await this.userRepository.insert(user);
      return createdUser;
    }
  }
}
