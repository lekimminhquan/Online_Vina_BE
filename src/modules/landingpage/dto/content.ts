import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class metaDataDto {
  @ApiProperty({ required: false, description: 'ID của metadata', example: 1 })
  id?: number;

  @ApiProperty({
    description: 'URL hình ảnh nền',
    example: 'https://example.com/bg.jpg',
  })
  @IsNotEmpty()
  backgroundImage: string;

  @ApiProperty({ description: 'Tên trang', example: 'home' })
  @IsNotEmpty()
  page: string;

  @ApiProperty({ description: 'Tiêu đề', example: 'Trang chủ' })
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Mô tả', example: 'Mô tả trang chủ' })
  @IsNotEmpty()
  description: string;
}

export class selectCardDto {
  @ApiProperty({ required: false, description: 'ID của card', example: 1 })
  id?: number;

  @ApiProperty({ description: 'Tiêu đề card', example: 'Card 1' })
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Mô tả card', example: 'Mô tả card' })
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Icon URL',
    example: 'https://example.com/icon.svg',
  })
  @IsNotEmpty()
  icon: string;

  @ApiProperty({ description: 'Tên trang', example: 'home' })
  @IsNotEmpty()
  page: string;

  @ApiProperty({ description: 'Nội dung card', example: 'Nội dung chi tiết' })
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Hình ảnh card',
    example: 'https://example.com/image.jpg',
  })
  @IsNotEmpty()
  image: string;

  @ApiProperty({ description: 'Màu nền', example: '#FFFFFF', required: false })
  backgroundColor: string;

  @ApiProperty({ description: 'Thứ tự hiển thị', example: 1 })
  numericalOrder: number;
}

export class contentPageDto {
  @ApiProperty({ description: 'Tên trang', example: 'home' })
  @IsNotEmpty()
  page: string;

  @ApiProperty({ description: 'Metadata của trang', type: metaDataDto })
  @IsNotEmpty()
  metadata: metaDataDto;

  @ApiProperty({ description: 'Danh sách cards', type: [selectCardDto] })
  @IsNotEmpty()
  selectCards: selectCardDto[];
}
