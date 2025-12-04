import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { LandingpageService } from './ladingpage.service';
import { contentPageDto } from './dto/content';

@ApiTags('Landingpage')
@Controller('landingpage')
export class LandingpageController {
  constructor(private readonly landingpageService: LandingpageService) {}

  @Get(':page')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy nội dung landing page' })
  @ApiParam({ name: 'page', description: 'Tên trang', example: 'home' })
  @ApiResponse({
    status: 200,
    description: 'Lấy nội dung landing page thành công',
    schema: {
      type: 'object',
      description: 'Nội dung landing page bao gồm metadata và cards',
    },
  })
  async getLandingPageContent(@Param('page') page: string) {
    return this.landingpageService.getLandingPageContent(page);
  }

  @Post('/update/:page')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tạo hoặc cập nhật nội dung landing page' })
  @ApiParam({ name: 'page', description: 'Tên trang', example: 'home' })
  @ApiBody({ type: contentPageDto })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật nội dung landing page thành công',
    schema: {
      type: 'object',
      description: 'Kết quả cập nhật',
    },
  })
  async createAndUpdateContentLandingPage(
    @Body() body: contentPageDto,
    @Param('page') page: string,
  ) {
    return this.landingpageService.createAndUpdateContentLandingPage(
      body,
      page,
    );
  }

  // @Put('/change')
  // @HttpCode(HttpStatus.OK)
  // async changeContentLandingPageType1(@Body() body: contentPageDto) {
  //   return this.landingpageService.changeContentType1(body);
  // }
}
