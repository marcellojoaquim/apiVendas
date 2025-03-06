import {
  SearchInput,
  SearchOutput,
} from '@/common/domain/repositories/repository.interface';
import { ProductModel } from '@/products/domain/models/products.model';
import {
  CreateProductsProps,
  ProductId,
  ProductsRepository,
} from '@/products/domain/repositories/products.repository';
import { Repository } from 'typeorm';
import { Product } from '../entities/products.entity';
import { dataSource } from '@/common/infrastructure/typeorm';
import { NotFoundError } from '@/common/domain/errors/not-found-error';

export class ProductsTypeormRepository implements ProductsRepository {
  sortableFields: string[] = ['name', 'created_at'];
  productsRepository: Repository<Product>;

  constructor() {
    this.productsRepository = dataSource.getRepository(Product);
  }

  async findByName(name: string): Promise<ProductModel> {
    return await this.productsRepository.findOne({ where: { name: name } });
  }
  findAllByIds(productIds: ProductId[]): Promise<ProductModel[]> {
    throw new Error('Method not implemented.');
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
  async findById(id: string): Promise<ProductModel> {
    return this._get(id);
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

  protected async _get(id: string): Promise<ProductModel> {
    const product = await this.productsRepository.findOneBy({ id: id });

    if (!product) {
      throw new NotFoundError(`Product not found using ${id}`);
    }
    return product;
  }
}
