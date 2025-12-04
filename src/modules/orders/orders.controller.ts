import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderListQueryDto } from './dto/order-list-query.dto';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import type { User } from '@prisma/client';
import { CreateVoucherDto } from './dto/create-voucher.dto';

@ApiBearerAuth('access-token')
@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo đơn hàng mới' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo đơn hàng thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Tạo đơn hàng thành công' },
        data: {
          type: 'object',
          description: 'Thông tin đơn hàng đã tạo',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User hoặc Product không tồn tại',
  })
  async create(@Body() body: CreateOrderDto, @CurrentUser() user: User) {
    const order = await this.ordersService.createOrder(body, user.id as string);
    return {
      message: 'Tạo đơn hàng thành công',
      data: order,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy danh sách đơn hàng' })
  @ApiQuery({ name: 'q', required: false, description: 'Từ khóa tìm kiếm' })
  @ApiQuery({ name: 'page', required: false, description: 'Số trang' })
  @ApiQuery({
    name: 'page_size',
    required: false,
    description: 'Số lượng bản ghi mỗi trang',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Lọc theo ID người dùng',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách đơn hàng thành công',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Lấy danh sách đơn hàng thành công',
        },
        data: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 100 },
            page: { type: 'number', example: 1 },
            page_size: { type: 'number', example: 20 },
            results: {
              type: 'array',
              items: { type: 'object' },
            },
          },
        },
      },
    },
  })
  async list(@Query() query: OrderListQueryDto) {
    const data = await this.ordersService.listOrders({
      q: query.q,
      page: query.page,
      page_size: query.page_size,
      userId: query.userId,
    });

    return {
      message: 'Lấy danh sách đơn hàng thành công',
      data,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy chi tiết đơn hàng' })
  @ApiParam({ name: 'id', description: 'ID của đơn hàng', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Lấy chi tiết đơn hàng thành công',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Lấy chi tiết đơn hàng thành công',
        },
        data: {
          type: 'object',
          description: 'Thông tin chi tiết đơn hàng',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Order không tồn tại',
  })
  async detail(@Param('id') id: string) {
    const numericId = Number(id);
    const order = await this.ordersService.getOrderDetail(numericId);
    return {
      message: 'Lấy chi tiết đơn hàng thành công',
      data: order,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa đơn hàng (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID của đơn hàng', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Xóa đơn hàng thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Xóa đơn hàng thành công' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Order không tồn tại',
  })
  async remove(@Param('id') id: string) {
    const numericId = Number(id);
    await this.ordersService.deleteOrder(numericId);
    return {
      message: 'Xóa đơn hàng thành công',
    };
  }

  @Post('vouchers')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo voucher mới' })
  @ApiBody({ type: CreateVoucherDto })
  @ApiResponse({
    status: 201,
    description: 'Tạo voucher thành công',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Tạo voucher thành công' },
        data: { type: 'object', description: 'Thông tin voucher đã tạo' },
      },
    },
  })
  async createVoucher(@Body() body: CreateVoucherDto) {
    const voucher = await this.ordersService.createVoucher(body);
    return {
      message: 'Tạo voucher thành công',
      data: voucher,
    };
  }
}
