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

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
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
