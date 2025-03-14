import { ProductsRepository } from '@/products/domain/repositories/products.repository';
import { inject, injectable } from 'tsyringe';
import { ProductOutput } from '../dtos/products-output.dto';

export namespace UpdateProductUseCase {
  export type Input = {
    id: string;
    name?: string;
    price?: number;
    quantity?: number;
  };

  export type Output = ProductOutput;

  @injectable()
  export class UseCase {
    constructor(
      @inject('ProductRepository') private productRepositry: ProductsRepository,
    ) {}

    async execute(input: Input): Promise<Output> {
      const product = await this.productRepositry.findById(input.id);

      if (input.name) {
        if (product.name !== input.name) {
          await this.productRepositry.conflictName(input.name);
        }
        product.name = input.name;
      }

      if (input.quantity) product.quantity = input.quantity;

      if (input.price) product.price = input.price;

      const updaterProduct: ProductOutput =
        await this.productRepositry.update(product);

      return updaterProduct;
    }
  }
}
