import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreateCategoryDto) {
    const category = await this.categoriesService.createCategory(body);
    return {
      message: 'Tạo danh mục thành công',
      data: category,
    };
  }
}
