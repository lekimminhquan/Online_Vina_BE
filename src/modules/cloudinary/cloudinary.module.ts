import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service.js';
import { Global } from '@nestjs/common';

@Global()
@Module({
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
