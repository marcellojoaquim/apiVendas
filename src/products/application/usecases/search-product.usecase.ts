import { ProductsRepository } from '@/products/domain/repositories/products.repository';
import { inject, injectable } from 'tsyringe';
import { SearchInputDto } from '../dtos/search-input.dto';
import {
  PaginationOutputDto,
  PaginatiOutputMapper,
} from '../dtos/pagination-output.dto';
import { ProductModel } from '@/products/domain/models/products.model';

export namespace SearchProductUseCase {
  export type Input = SearchInputDto;

  export type Output = PaginationOutputDto<ProductModel>;

  @injectable()
  export class UseCase {
    constructor(
      @inject('ProductRepository') private productRepositry: ProductsRepository,
    ) {}

    async execute(input: Input): Promise<Output> {
      const searchResult = await this.productRepositry.search(input);

      return PaginatiOutputMapper.toOutput(searchResult.items, searchResult);
    }
  }
}
