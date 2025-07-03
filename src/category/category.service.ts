import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { ILike, Repository } from 'typeorm';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
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

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}

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
