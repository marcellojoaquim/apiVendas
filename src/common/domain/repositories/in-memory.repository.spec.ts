import { randomUUID } from 'node:crypto';
import { InMemoryRepository } from './in-memory.repository';

type StubModelProps = {
  id: string;
  name: string;
  price: number;
  created_at: Date;
  updated_at: Date;
};

class StubInMemoryRepository extends InMemoryRepository<StubModelProps> {
  constructor() {
    super();
    this.sortableFields = ['name'];
  }

  protected async applyFilter(
    items: StubModelProps[],
    filter: string | null,
  ): Promise<StubModelProps[]> {
    if (!filter) {
      return items;
    }
    return items.filter(item => {
      item.name.toLowerCase().includes(filter.toLowerCase());
    });
  }
}

describe('InMemoryRepository unit test', () => {
  let sut: StubInMemoryRepository;
  let model: StubModelProps;
  let props: any;
  let created_at: Date;
  let updated_at: Date;

  beforeEach(() => {
    sut = new StubInMemoryRepository();
    created_at = new Date();
    updated_at = new Date();
    props = {
      name: 'test',
      price: 10,
    };
    model = {
      id: randomUUID,
      created_at,
      updated_at,
      ...props,
    };
  });

  it('Should create a new Model', () => {
    const result = sut.create(props);
    expect(result.name).toStrictEqual(model.name);
    expect(result.price).toStrictEqual(10);
  });

  it('Should insert a new model', async () => {
    const result = await sut.insert(model);
    expect(result).toStrictEqual(sut.items[0]);
  });
});
