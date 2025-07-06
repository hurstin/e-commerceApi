import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { DataSource, ILike, Repository } from 'typeorm';
import { Product } from 'src/product/entities/product.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    private dataSource: DataSource,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const existingCategory = await this.categoryRepo.findOne({
      where: { name: createCategoryDto.name },
    });

    if (existingCategory)
      throw new BadRequestException('category with this name already exists');

    const category = await this.categoryRepo.create(createCategoryDto);

    //  save to db
    return this.categoryRepo.save(category);
  }

  async findByName(name: string) {
    if (!name) throw new BadRequestException('please provide name of category');

    const categories = await this.categoryRepo.find({
      where: {
        name: ILike(`%${name}%`), // ILike is TypeORM's operator
      },
      relations: {
        products: true,
      },
    });

    if (!categories || categories.length === 0)
      throw new BadRequestException(
        `No category found with the name "${name}"`,
      );

    return {
      length: categories.length,
      categories,
    };
  }

  async findOne(name: string) {
    const category = await this.categoryRepo.findOne({ where: { name } });
    if (!category) throw new BadRequestException('no category with this name');

    return category;
  }

  async findAll() {
    const category = await this.categoryRepo.find({
      relations: {
        products: true,
      },
    });

    return {
      length: category.length,
      category,
    };
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    if (!id || !updateCategoryDto)
      throw new BadRequestException(
        'id and product details are needed to update a product',
      );
    // check if category exist
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new BadRequestException('No category with this id');

    // update the category
    const updatedCategory = Object.assign(category, updateCategoryDto);

    // save to db
    this.categoryRepo.save(updatedCategory);

    return {
      message: `product with id ${id} updated successfully`,
      category: updatedCategory,
    };
  }

  async remove(id: number) {
    //    get category from db
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new BadRequestException('No category with such id');

    // check for product with category and set to null

    // Use transaction for atomic operations
    const deleted = await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        // 1. Disassociate all products from this category
        await transactionalEntityManager.update(
          Product,
          { category: { id } }, // Products with this category
          { category: null }, // Set category to null
        );
        // 2. Delete the category
        const deleteResult = await transactionalEntityManager.delete(
          Category,
          id,
        );

        if (deleteResult.affected === 0) {
          throw new NotFoundException('Category not found during deletion');
        }

        return { message: `Category ${id} deleted successfully` };
      },
    );

    return deleted;
  }
}

// async remove(id: number): Promise<{ message: string }> {
//   // 1. Disassociate products
//   await this.productRepo.update(
//     { category: { id } },
//     { category: null }
//   );

//   // 2. Delete category
//   const result = await this.categoryRepo.delete(id);

//   if (result.affected === 0) {
//     throw new NotFoundException(`Category with ID ${id} not found`);
//   }

//   return { message: `Category with ID ${id} removed` };
// }

// const category = await this.categoryRepo
//       .createQueryBuilder('category')
//       .where('category.name ILIKE :name', { name: `%${name}%` })
//       .getMany();

// const categories = await this.categoryRepo
//     .createQueryBuilder('category')
//     // Add relations here (replace with your actual relation names)
//     .leftJoinAndSelect('category.products', 'products') // Example: loads products relation
//     .leftJoinAndSelect('category.subcategories', 'subcategories') // Example: loads subcategories
//     .where('category.name ILIKE :name', { name: `%${name}%` })
//     .getMany();
