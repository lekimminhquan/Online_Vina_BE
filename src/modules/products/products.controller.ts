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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductListQueryDto } from './dto/product-list-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import type { Product } from '@prisma/client';
import { ListPaginatedResponse } from '../../utils/types/list-api';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo sản phẩm mới' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo sản phẩm thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Tạo sản phẩm thành công' },
        data: { type: 'object', description: 'Thông tin sản phẩm đã tạo' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Category không tồn tại',
  })
  async create(@Body() body: CreateProductDto) {
    const product = await this.productsService.createProduct(body);
    return {
      message: 'Tạo sản phẩm thành công',
      data: product,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm' })
  @ApiQuery({ name: 'q', required: false, description: 'Từ khóa tìm kiếm' })
  @ApiQuery({ name: 'page', required: false, description: 'Số trang' })
  @ApiQuery({
    name: 'page_size',
    required: false,
    description: 'Số lượng bản ghi mỗi trang',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'Lọc theo ID danh mục',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách sản phẩm thành công',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Lấy danh sách sản phẩm thành công',
        },
        data: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 100 },
            page: { type: 'number', example: 1 },
            page_size: { type: 'number', example: 20 },
            results: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
  })
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
  @ApiOperation({ summary: 'Xóa sản phẩm (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID của sản phẩm', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Xóa sản phẩm thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Xóa sản phẩm thành công' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Sản phẩm không tồn tại',
  })
  async remove(@Param('id') id: string) {
    const numericId = Number(id);
    await this.productsService.deleteProduct(numericId);
    return {
      message: 'Xóa sản phẩm thành công',
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cập nhật sản phẩm' })
  @ApiParam({ name: 'id', description: 'ID của sản phẩm', example: 1 })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật sản phẩm thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Cập nhật sản phẩm thành công' },
        data: { type: 'object', description: 'Thông tin sản phẩm đã cập nhật' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Sản phẩm hoặc Category không tồn tại',
  })
  async update(@Param('id') id: string, @Body() body: UpdateProductDto) {
    const numericId = Number(id);
    const product = await this.productsService.updateProduct(numericId, body);
    return {
      message: 'Cập nhật sản phẩm thành công',
      data: product,
    };
  }
}
