import { Injectable } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

@Injectable()
export class CloudinaryService {
  /**
   * Upload file buffer to Cloudinary
   * @param dir - Cloudinary folder, e.g. "products" (không phải đường dẫn local)
   * @param file - Binary buffer of file (ví dụ: file.buffer từ Multer)
   */
  async upload(
    dir: string,
    file: Buffer,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: dir,
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          return resolve(result as UploadApiResponse);
        },
      );

      uploadStream.end(file);
    });
  }
}
