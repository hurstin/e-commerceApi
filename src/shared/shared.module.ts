import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/category/entities/category.entity';
import { Product } from 'src/product/entities/product.entity';
import { ProductCategoryService } from './productCategory.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category])],
  providers: [ProductCategoryService],
  exports: [ProductCategoryService],
})
export class SharedModule {}
