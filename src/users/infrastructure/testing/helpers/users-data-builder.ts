import { randomUUID } from 'node:crypto';
import { UserModel } from './../../../domain/models/users.model';
import { faker } from '@faker-js/faker/.';
export function UserDataBuilder(props: Partial<UserModel>): UserModel {
  return {
    id: props.id ?? randomUUID(),
    name: props.name ?? faker.person.fullName(),
    email: props.email ?? faker.internet.email(),
    password: props.password ?? faker.internet.password(),
    avatar: props.avatar ?? faker.lorem.sentence({ min: 5, max: 10 }),
    created_at: props.created_at ?? new Date(),
    updated_at: props.updated_at ?? new Date(),
  };
}
