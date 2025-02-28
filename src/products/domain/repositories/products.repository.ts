import { RepositoryInterface } from '@/common/domain/repositories/repository.interface';
import { ProductModel } from '../models/products.model';

export type ProductId = {
  id: string;
};

export type CreateProductsProps = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  created_at: Date;
  updated_at: Date;
};

export interface ProductsRepository
  extends RepositoryInterface<ProductModel, CreateProductsProps> {
  findByName(name: string): Promise<ProductModel>;
  findAllByIds(productIds: ProductId[]): Promise<ProductModel[]>;
  conflictName(name: string): Promise<void>;
}
