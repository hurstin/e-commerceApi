import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Public } from 'src/auth/decorator/public.decorator';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // @UseGuards(JwtAuthGuard)
  @Post('create')
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Public()
  @Get()
  findAllProducts() {
    return this.productService.findAll();
  }

  // get by name
  @Get('name')
  findByName(@Body() body: any) {
    const { title } = body;
    return this.productService.findByName(title);
  }

  @Delete('delete')
  @HttpCode(204)
  deleteproduct(@Query('id') id: string, @Query('title') title: string) {
    return this.productService.remove(+id, title);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    console.log(updateProductDto);
    return this.productService.update(+id, updateProductDto);
  }
}
