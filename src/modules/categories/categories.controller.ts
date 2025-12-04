import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo danh mục mới' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo danh mục thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Tạo danh mục thành công' },
        data: { type: 'object', description: 'Thông tin danh mục đã tạo' },
      },
    },
  })
  async create(@Body() body: CreateCategoryDto) {
    const category = await this.categoriesService.createCategory(body);
    return {
      message: 'Tạo danh mục thành công',
      data: category,
    };
  }
}
