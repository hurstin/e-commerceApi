import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { CategoryService } from 'src/category/category.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private productsRepo: Repository<Product>,
    private categoryService: CategoryService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    // check if product exist in db
    const existingProduct = await this.productsRepo.findOne({
      where: {
        title: createProductDto.title,
        description: createProductDto.description,
      },
    });
    if (existingProduct) {
      throw new BadRequestException(
        'Product already exists with the same title and description',
      );
    }

    // Assuming category is passed as an name in createProductDto
    const { category, ...rest } = createProductDto as any;
    let categoryEntity = null;
    if (category) {
      // You need to inject CategoryRepository to fetch the category entity
      // For now, let's assume you have a categoriesRepo injected
      categoryEntity = await (this as any).categoryService.findOne(category);
      if (!categoryEntity) {
        throw new BadRequestException('Category not found');
      }
    }

    const product = this.productsRepo.create({
      ...rest,
      category: categoryEntity,
    });

    //save to db
    return this.productsRepo.save(product);
  }

  async findAll() {
    const products = await this.productsRepo.find({
      relations: {
        category: true,
      },
    });

    return {
      length: products.length,
      products,
    };
  }

  async findByName(title: string) {
    if (!title)
      throw new BadRequestException('title is required to search for products');

    const product = await this.productsRepo
      .createQueryBuilder('product')
      .where('product.title ILIKE :title', { title: `%${title}%` }) // % wildcards for partial match
      .getMany();

    if (!product || product.length === 0) {
      throw new BadRequestException(
        `No products found with title containing "${title}"`,
      );
    }
    return {
      length: product.length,
      products: product,
    }; // % wildcards for partial match
  }
  // REMINDER: CHECK IF THE CATEGORY BEEN UPDATED TO EXISTS
  async update(id: number, updateProductDto: UpdateProductDto) {
    if (!id || !updateProductDto)
      throw new BadRequestException(
        'id and product details are needed to update a product',
      );

    const product = await this.productsRepo.findOne({ where: { id } });

    if (!product) throw new BadRequestException('product not found');

    //  update the product
    const updatedProduct = Object.assign(product, updateProductDto);

    //  save to db
    this.productsRepo.save(updatedProduct);

    return {
      message: `product with id ${id} updated successfully`,
      product: updatedProduct,
    };
  }

  async remove(id: number, title: string) {
    if (!id || !title)
      throw new BadRequestException(
        'id and product are required to delete a product',
      );

    const product = await this.productsRepo.findOne({
      where: { id, title },
    });

    if (!product)
      throw new BadRequestException(
        `product with id ${id} and title ${title} not found`,
      );

    this.productsRepo.delete({ id, title });
    return {
      message: `Product with id ${id} and title ${title} deleted successfully`,
    };
  }
}

// async findByName(searchTerm: string) {
//   console.log('Searching for products with title containing:', searchTerm);
//   // Renamed parameter for clarity
//   return this.productsRepo.find({
//     where: {
//       title: ILike(`%${searchTerm}%`), // Use ILike with title
//     },
//   });
// }
