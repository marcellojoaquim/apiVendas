import { InMemoryRepository } from '@/common/domain/repositories/in-memory.repository';
import { ProductModel } from '@/products/domain/models/products.model';
import {
  ProductId,
  ProductsRepository,
} from '@/products/domain/repositories/products.repository';
import { NotFoundError } from '@/common/domain/errors/not-found-error';
import { ConflictError } from '@/common/domain/errors/conflict-error';

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

  async conflictName(name: string): Promise<void> {
    const model = this.items.find(item => item.name === name);
    if (model) {
      throw new ConflictError(`Product name ${name} already in use`);
    }
  }

  protected async applyFilter(
    items: ProductModel[],
    filter: string | null,
  ): Promise<ProductModel[]> {
    if (!filter) {
      return items;
    }
    return items.filter(item =>
      item.name.toLowerCase().includes(filter.toLowerCase()),
    );
  }

  protected async applySort(
    items: ProductModel[],
    sort: string | null,
    sort_dir: string | null,
  ): Promise<ProductModel[]> {
    return super.applySort(items, sort ?? 'created_at', sort_dir ?? 'desc');
  }
}
