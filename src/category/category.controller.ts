import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ProductCategoryService } from 'src/shared/productCategory.service';

@Controller('category')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private productCategoryService: ProductCategoryService,
  ) {}

  @Post('create')
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get('search')
  findCategoryByname(@Query('name') name: string) {
    return this.categoryService.findByName(name);
  }

  @Get()
  findAllCategory() {
    return this.categoryService.findAll();
  }

  @Patch('update/:id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(+id, updateCategoryDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(+id);
  }
}
