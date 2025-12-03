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
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderListQueryDto } from './dto/order-list-query.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreateOrderDto) {
    const order = await this.ordersService.createOrder(body);
    return {
      message: 'Tạo đơn hàng thành công',
      data: order,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
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
  async remove(@Param('id') id: string) {
    const numericId = Number(id);
    await this.ordersService.deleteOrder(numericId);
    return {
      message: 'Xóa đơn hàng thành công',
    };
  }
}
