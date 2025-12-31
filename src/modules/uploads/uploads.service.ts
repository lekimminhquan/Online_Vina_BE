import { Injectable, BadRequestException } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';

@Injectable()
export class UploadsService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async uploadSingleImage(
    file: any,
    folder = 'products',
  ): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('File không được để trống');
    }

    // Validate mime type phải là ảnh
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File phải là hình ảnh');
    }

    // Validate dung lượng <= 10MB
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException(
        'Kích thước file phải nhỏ hơn hoặc bằng 10MB',
      );
    }

    const result = await this.cloudinaryService.upload(folder, file.buffer);

    const url = (result as any).secure_url ?? (result as any).url ?? null;

    if (!url) {
      throw new BadRequestException('Không lấy được URL ảnh từ Cloudinary');
    }

    return { url };
  }
}
