import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(dto: CreateOrderDto) {
    // Validate user exists
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    // Fetch all products and validate they exist
    const productIds = dto.products.map((p) => p.id);
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        // dùng any vì prisma client có thể chưa update field deletedAt
        ...({ deletedAt: null } as any),
      },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('Một hoặc nhiều sản phẩm không tồn tại');
    }

    // Create a map for quick lookup
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Calculate total price and prepare orderToProducts data
    let totalPrice = new Decimal(0);
    const orderToProductsData = dto.products.map((orderProduct) => {
      const product = productMap.get(orderProduct.id);
      if (!product) {
        throw new NotFoundException(
          `Sản phẩm với id ${orderProduct.id} không tồn tại`,
        );
      }

      // Use priceNew if available, otherwise use priceOld
      const price =
        (product as any).priceNew ??
        (product as any).priceOld ??
        new Decimal(0);
      const itemTotal = price.mul(orderProduct.quantity);
      totalPrice = totalPrice.add(itemTotal);

      return {
        productId: orderProduct.id,
        quantity: orderProduct.quantity,
        price: price,
      };
    });

    // Calculate tax (10% = 0.1)
    const tax = new Decimal(0.1);

    // Create order with orderToProducts in a transaction
    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await (tx as any).order.create({
        data: {
          userId: dto.userId,
          totalPrice: totalPrice,
          tax: tax,
          orderToProducts: {
            create: orderToProductsData,
          },
        },
        include: {
          user: true,
          orderToProducts: {
            include: {
              product: true,
            },
          },
        },
      });

      return newOrder;
    });

    return order;
  }

  async listOrders(params?: {
    q?: string;
    page?: number;
    page_size?: number;
    userId?: string;
  }) {
    const page = Math.max(1, params?.page ?? 1);
    const pageSize = Math.max(1, Math.min(200, params?.page_size ?? 20));
    const skip = (page - 1) * pageSize;

    const whereConditions: any[] = [
      {
        // dùng any vì prisma client có thể chưa update field deletedAt
        ...({ deletedAt: null } as any),
      },
    ];

    // Search by userId or order id
    if (params?.q) {
      const searchNumber = parseInt(params.q, 10);
      if (!isNaN(searchNumber)) {
        whereConditions.push({
          id: searchNumber,
        });
      } else {
        whereConditions.push({
          user: {
            id: {
              contains: params.q,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        });
      }
    }

    // Filter by userId
    if (params?.userId) {
      whereConditions.push({
        userId: params.userId,
      });
    }

    const where: any =
      whereConditions.length > 0 ? { AND: whereConditions } : undefined;

    const [total, orders] = await this.prisma.$transaction([
      (this.prisma as any).order.count({ where }),
      (this.prisma as any).order.findMany({
        where,
        include: {
          user: true,
          orderToProducts: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { id: 'desc' },
        skip,
        take: pageSize,
      }),
    ]);

    return {
      total,
      page,
      page_size: pageSize,
      results: orders,
    };
  }

  async getOrderDetail(id: number) {
    const order = await (this.prisma as any).order.findUnique({
      where: { id },
      include: {
        user: true,
        orderToProducts: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order || (order as any).deletedAt) {
      throw new NotFoundException('Order không tồn tại');
    }

    return order;
  }

  async deleteOrder(id: number): Promise<void> {
    const existing = await (this.prisma as any).order.findUnique({
      where: { id },
    });
    if (!existing || (existing as any).deletedAt) {
      throw new NotFoundException('Order không tồn tại');
    }

    await (this.prisma as any).order.update({
      where: { id },
      data: {
        // cast any để tránh lỗi type khi prisma client chưa có trường deletedAt
        deletedAt: new Date(),
      } as any,
    });
  }
}
