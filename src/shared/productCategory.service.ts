import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/category/entities/category.entity';
import { Product } from 'src/product/entities/product.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ProductCategoryService {
  constructor(
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    private dataSource: DataSource,
  ) {}

  // delete category
  async deleteCategory(id: number) {
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
