import { ProductsRepository } from '@/products/domain/repositories/products.repository';
import { inject, injectable } from 'tsyringe';
import { ProductOutput } from '../dtos/products-output.dto';

export namespace GetProductUseCase {
  export type Input = {
    id: string;
  };

  export type Output = ProductOutput;

  @injectable()
  export class UseCase {
    constructor(
      @inject('ProductRepository') private productRepositry: ProductsRepository,
    ) {}

    async execute(input: Input): Promise<Output> {
      const product: ProductOutput = await this.productRepositry.findById(
        input.id,
      );

      return product;
    }
  }
}
