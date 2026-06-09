import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { CategoriesService } from './categories.service';

function buildCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: 1,
    name: 'Category',
    parent: null,
    children: [],
    skills: [],
    usersWantToLearn: [],
    ...overrides,
  } as Category;
}

function createRepositoryMock() {
  return {
    create: jest.fn<Category, [Partial<Category>]>((dto) => buildCategory(dto)),
    save: jest.fn<Promise<Category>, [Category]>((category) =>
      Promise.resolve(category),
    ),
    find: jest.fn<Promise<Category[]>, [unknown?]>(),
    findOne: jest.fn<Promise<Category | null>, [unknown]>(),
    delete: jest.fn<Promise<{ affected?: number | null }>, [number]>(),
  };
}

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repoMock: ReturnType<typeof createRepositoryMock>;

  beforeEach(async () => {
    repoMock = createRepositoryMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: getRepositoryToken(Category), useValue: repoMock },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create root category without parent', async () => {
      const result = await service.create({ name: 'Development' });

      expect(repoMock.create).toHaveBeenCalledWith({ name: 'Development' });
      expect(repoMock.save).toHaveBeenCalledTimes(1);
      expect(repoMock.save.mock.calls[0][0].parent).toBeNull();
      expect(result).toMatchObject({ name: 'Development', parent: null });
    });

    it('should create child category with parent', async () => {
      const parent = buildCategory({ id: 10, name: 'Parent' });
      repoMock.findOne.mockResolvedValue(parent);

      const result = await service.create({
        name: 'Child',
        parentId: parent.id,
      });

      expect(repoMock.findOne).toHaveBeenCalledWith({
        where: { id: parent.id },
        relations: ['parent'],
      });
      expect(repoMock.save.mock.calls[0][0].parent).toBe(parent);
      expect(result.parent).toBe(parent);
    });

    it('should throw NotFoundException when parent does not exist', async () => {
      repoMock.findOne.mockResolvedValue(null);

      await expect(
        service.create({ name: 'Child', parentId: 999 }),
      ).rejects.toThrow(NotFoundException);

      expect(repoMock.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return categories as tree', async () => {
      const root = buildCategory({ id: 1, name: 'Root' });
      const child = buildCategory({ id: 2, name: 'Child', parent: root });
      const nestedChild = buildCategory({
        id: 3,
        name: 'Nested Child',
        parent: child,
      });

      repoMock.find.mockResolvedValue([root, child, nestedChild]);

      const result = await service.findAll();

      expect(repoMock.find).toHaveBeenCalledWith({ relations: ['parent'] });
      expect(result).toEqual([
        {
          id: 1,
          name: 'Root',
          children: [
            {
              id: 2,
              name: 'Child',
              children: [
                {
                  id: 3,
                  name: 'Nested Child',
                  children: [],
                },
              ],
            },
          ],
        },
      ]);
    });
  });

  describe('findOne', () => {
    it('should return category by id', async () => {
      const category = buildCategory({ id: 5 });
      repoMock.findOne.mockResolvedValue(category);

      await expect(service.findOne(5)).resolves.toBe(category);

      expect(repoMock.findOne).toHaveBeenCalledWith({
        where: { id: 5 },
        relations: ['parent'],
      });
    });

    it('should throw NotFoundException when category does not exist', async () => {
      repoMock.findOne.mockResolvedValue(null);

      await expect(service.findOne(404)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update category name', async () => {
      const category = buildCategory({ id: 1, name: 'Old name' });
      repoMock.findOne.mockResolvedValue(category);

      const result = await service.update(1, { name: 'New name' });

      expect(repoMock.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, name: 'New name' }),
      );
      expect(result.name).toBe('New name');
    });

    it('should set parent to null', async () => {
      const parent = buildCategory({ id: 1, name: 'Parent' });
      const category = buildCategory({ id: 2, parent });

      repoMock.findOne.mockResolvedValue(category);

      const result = await service.update(2, { parentId: null });

      expect(result.parent).toBeNull();
      expect(repoMock.save.mock.calls[0][0].parent).toBeNull();
    });

    it('should change parent category', async () => {
      const category = buildCategory({ id: 1 });
      const newParent = buildCategory({ id: 2, name: 'New parent' });

      repoMock.findOne.mockImplementation(
        ({ where }: { where: { id: number } }) => {
          if (where.id === category.id) {
            return Promise.resolve(category);
          }
          if (where.id === newParent.id) {
            return Promise.resolve(newParent);
          }
          return Promise.resolve(null);
        },
      );

      const result = await service.update(category.id, {
        parentId: newParent.id,
      });

      expect(result.parent).toBe(newParent);
      expect(repoMock.save.mock.calls[0][0].parent).toBe(newParent);
    });

    it('should throw BadRequestException when category is its own parent', async () => {
      repoMock.findOne.mockResolvedValue(buildCategory({ id: 1 }));

      await expect(service.update(1, { parentId: 1 })).rejects.toThrow(
        BadRequestException,
      );

      expect(repoMock.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when new parent creates cycle', async () => {
      const root = buildCategory({ id: 1, name: 'Root' });
      const child = buildCategory({ id: 2, name: 'Child', parent: root });

      repoMock.findOne.mockImplementation(
        ({ where }: { where: { id: number } }) => {
          if (where.id === root.id) {
            return Promise.resolve(root);
          }
          if (where.id === child.id) {
            return Promise.resolve(child);
          }
          return Promise.resolve(null);
        },
      );

      await expect(
        service.update(root.id, { parentId: child.id }),
      ).rejects.toThrow(BadRequestException);

      expect(repoMock.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove category by id', async () => {
      repoMock.delete.mockResolvedValue({ affected: 1 });

      await expect(service.remove(1)).resolves.toBeUndefined();

      expect(repoMock.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when category does not exist', async () => {
      repoMock.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(404)).rejects.toThrow(NotFoundException);
    });
  });
});
