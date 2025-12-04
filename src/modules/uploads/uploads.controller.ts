import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';

@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('image')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload hình ảnh' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File hình ảnh cần upload',
        },
      },
    },
  })
  @ApiQuery({
    name: 'folder',
    required: false,
    description: 'Thư mục lưu trữ (mặc định: products)',
    example: 'products',
  })
  @ApiResponse({
    status: 201,
    description: 'Upload ảnh thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Upload ảnh thành công' },
        data: {
          type: 'object',
          description: 'Thông tin file đã upload (URL, public_id, etc.)',
        },
      },
    },
  })
  async uploadImage(
    @UploadedFile() file: any,
    @Query('folder') folder?: string,
  ) {
    const result = await this.uploadsService.uploadSingleImage(
      file,
      folder ?? 'products',
    );

    return {
      message: 'Upload ảnh thành công',
      data: result,
    };
  }
}
