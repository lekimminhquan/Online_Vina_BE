import { Controller, HttpCode, HttpStatus, Body, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { TaxCodeService } from './taxcode.service';
import { GetTaxCodeInfoDto } from './dto/taxcode.dto';

@ApiTags('Tax Code')
@Controller('tax-code')
export class TaxCodeController {
  constructor(private readonly taxCodeService: TaxCodeService) {}

  @Get('info')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy thông tin mã số thuế' })
  @ApiBody({ type: GetTaxCodeInfoDto })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin mã số thuế thành công',
    schema: {
      type: 'object',
      description: 'Thông tin mã số thuế',
    },
  })
  async getTaxCodeInfo(@Body() body: GetTaxCodeInfoDto) {
    return this.taxCodeService.getTaxCodeInfo(body.mst);
  }
}
