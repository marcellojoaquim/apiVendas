import { InMemoryRepository } from '@/common/domain/repositories/in-memory.repository';
import { ProductModel } from '@/products/domain/models/products.model';
import {
  SearchInput,
  SearchOutput,
} from '@/common/domain/repositories/repository.interface';
import {
  CreateProductsProps,
  ProductId,
  ProductsRepository,
} from '@/products/domain/repositories/products.repository';
import { NotFoundError } from '@/common/domain/errors/not-found-error';

export class ProductsInMemoryRepository
  extends InMemoryRepository<ProductModel>
  implements ProductsRepository
{
  sortableFields: string[] = ['name', 'created_at'];

  async findByName(name: string): Promise<ProductModel> {
    const model = this.items.find(item => item.name === name);
    if (!model) {
      throw new NotFoundError(`Product ${name} not found`);
    }
    return model;
  }

  async findAllByIds(productIds: ProductId[]): Promise<ProductModel[]> {
    const existingProduct = [];
    for (const productId of productIds) {
      const product = this.items.find(item => item.id === productId.id);
      if (product) {
        existingProduct.push(product);
      }
    }
    return existingProduct;
  }
  conflictName(name: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  create(props: CreateProductsProps): ProductModel {
    throw new Error('Method not implemented.');
  }
  insert(model: ProductModel): Promise<ProductModel> {
    throw new Error('Method not implemented.');
  }
  findById(id: string): Promise<ProductModel> {
    throw new Error('Method not implemented.');
  }
  update(model: ProductModel): Promise<ProductModel> {
    throw new Error('Method not implemented.');
  }
  delete(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  search(props: SearchInput): Promise<SearchOutput<ProductModel>> {
    throw new Error('Method not implemented.');
  }

  protected applyFilter(
    items: ProductModel[],
    filter: string | null,
  ): Promise<ProductModel[]> {
    throw new Error('Method not implemented.');
  }
}
