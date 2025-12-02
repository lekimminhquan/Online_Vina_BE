import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductListQueryDto } from './dto/product-list-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import type { Product } from '@prisma/client';
import { ListPaginatedResponse } from '../../utils/types/list-api';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreateProductDto) {
    const product = await this.productsService.createProduct(body);
    return {
      message: 'Tạo sản phẩm thành công',
      data: product,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async list(
    @Query() query: ProductListQueryDto,
  ): Promise<ListPaginatedResponse<Product>> {
    const data = await this.productsService.listProducts({
      q: query.q,
      page: query.page,
      page_size: query.page_size,
      categoryId: query.categoryId,
    });

    return {
      message: 'Lấy danh sách sản phẩm thành công',
      data,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    const numericId = Number(id);
    await this.productsService.deleteProduct(numericId);
    return {
      message: 'Xóa sản phẩm thành công',
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() body: UpdateProductDto) {
    const numericId = Number(id);
    const product = await this.productsService.updateProduct(numericId, body);
    return {
      message: 'Cập nhật sản phẩm thành công',
      data: product,
    };
  }
}
