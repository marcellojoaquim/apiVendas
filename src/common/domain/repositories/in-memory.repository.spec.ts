import { randomUUID } from 'node:crypto';
import { InMemoryRepository } from './in-memory.repository';
import { NotFoundError } from '../errors/not-found-error';

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
      return item.name.toLowerCase().includes(filter.toLowerCase());
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

  describe('Create', () => {
    it('Should create a new Model', () => {
      const result = sut.create(props);
      expect(result.name).toStrictEqual(model.name);
      expect(result.price).toStrictEqual(10);
    });
  });

  describe('Insert', () => {
    it('Should insert a new model', async () => {
      const result = await sut.insert(model);
      expect(result).toStrictEqual(sut.items[0]);
    });
  });

  describe('Find By Id', () => {
    it('Should throw not found error', async () => {
      const id = randomUUID();
      await expect(sut.findById(id)).rejects.toThrow(
        new NotFoundError(`Model not found using id ${id}`),
      );
    });
    it('Should find a model by id', async () => {
      const data = await sut.insert(model);
      const result = await sut.findById(data.id);
      expect(result).toStrictEqual(data);
      expect(result.name).toStrictEqual(data.name);
      expect(result.id).toStrictEqual(data.id);
    });
  });

  describe('Update an model', () => {
    it('Should throw not found error for update', async () => {
      await expect(sut.update(model)).rejects.toThrow(
        new NotFoundError(`Model not found using id ${model.id}`),
      );
    });

    it('Should update a model', async () => {
      const data = await sut.insert(model);
      const updatedModel = {
        id: data.id,
        name: 'test 2',
        price: 101,
        created_at,
        updated_at,
      };
      const result = await sut.update(updatedModel);
      expect(result.id).toStrictEqual(data.id);
      expect(result.name).toStrictEqual('test 2');
    });
  });

  describe('Delete', () => {
    it('Should throw not found error for delete', async () => {
      const id = randomUUID();
      await expect(sut.delete(id)).rejects.toThrow(
        new NotFoundError(`Model not found using id ${id}`),
      );
    });

    it('Should delete a model by id', async () => {
      const data = await sut.insert(model);
      await sut.delete(data.id);
      expect(sut.items.length).toBe(0);
    });
  });

  describe('Apply filter', () => {
    it('Should no filter items', async () => {
      const items = [model];
      const spyFilterMethod = jest.spyOn(items, 'filter' as any);
      const result = await sut['applyFilter'](items, null);
      expect(spyFilterMethod).not.toHaveBeenCalled();
      expect(result).toStrictEqual(items);
    });

    it('Should filter items using filter params', async () => {
      const items = [
        { id: randomUUID(), name: 'TEST', price: 20, created_at, updated_at },
        { id: randomUUID(), name: 'test', price: 20, created_at, updated_at },
        { id: randomUUID(), name: 'Other', price: 30, created_at, updated_at },
      ];
      const spyFilterMethod = jest.spyOn(items, 'filter' as any);
      let result = await sut['applyFilter'](items, 'TEST');
      expect(spyFilterMethod).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual([items[0], items[1]]);

      result = await sut['applyFilter'](items, 'test');
      expect(result).toStrictEqual([items[0], items[1]]);

      result = await sut['applyFilter'](items, 'Other');
      expect(result).toStrictEqual([items[2]]);

      result = await sut['applyFilter'](items, 'no-filter');
      expect(result).toHaveLength(0);
    });
  });
});
