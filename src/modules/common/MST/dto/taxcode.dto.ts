import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetTaxCodeInfoDto {
  @ApiProperty({
    description: 'Mã số thuế',
    example: '0123456789',
  })
  @IsNotEmpty()
  mst!: string;
}
