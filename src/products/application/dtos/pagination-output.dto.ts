export type PaginationOutputDto<Item> = {
  items: Item[];
  per_page: number;
  total: number;
  current_page: number;
  last_page: number;
};

export class PaginatiOutputMapper {
  static toOutput<Item = any>(
    items: Item[],
    result: any,
  ): PaginationOutputDto<Item> {
    return {
      items,
      total: result.total,
      current_page: result.current_page,
      last_page: Math.ceil(result.total / result.per_page),
      per_page: result.per_page,
    };
  }
}
