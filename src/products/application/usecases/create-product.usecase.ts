import { BadRequestError } from '@/common/domain/errors/bad-request-error';
import { ProductsRepository } from '@/products/domain/repositories/products.repository';
import { inject, injectable } from 'tsyringe';
import { ProductOutput } from '../dtos/products-output.dto';

export namespace CreateProductUseCase {
  export type Input = {
    name: string;
    price: number;
    quantity: number;
  };

  export type Output = ProductOutput;
  @injectable()
  export class UseCase {
    constructor(
      @inject('ProductRepository') private productRepositry: ProductsRepository,
    ) {}

    async execute(input: Input): Promise<Output> {
      if (!input.name || input.price <= 0 || input.quantity <= 0) {
        throw new BadRequestError('Input data not provide or valid');
      }

      await this.productRepositry.conflictName(input.name);
      const product = this.productRepositry.create(input);
      const createdProduct: ProductOutput =
        await this.productRepositry.insert(product);

      return createdProduct;
    }
  }
}
