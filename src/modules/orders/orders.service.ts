import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { CreateVoucherDto } from './dto/create-voucher.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(dto: CreateOrderDto, userId: string) {
    // Validate user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    // Fetch all product variants and validate they exist
    const variantIds = dto.products.map((p) => p.id);
    const variants = await this.prisma.productVariant.findMany({
      where: {
        id: { in: variantIds },
        deletedAt: null,
      },
    });

    if (variants.length !== variantIds.length) {
      throw new NotFoundException(
        'Một hoặc nhiều product variant không tồn tại',
      );
    }

    // Create a map for quick lookup
    const variantMap = new Map(variants.map((v) => [v.id, v]));

    // Calculate total price and prepare orderToProducts data
    let totalPrice = new Decimal(0);
    const orderToProductsData = dto.products.map((orderProduct) => {
      const variant = variantMap.get(orderProduct.id);
      if (!variant) {
        throw new NotFoundException(
          `Product variant với id ${orderProduct.id} không tồn tại`,
        );
      }

      // Giá lấy trực tiếp từ product variant
      const price = (variant as any).price ?? new Decimal(0);
      const itemTotal = price.mul(orderProduct.quantity);
      totalPrice = totalPrice.add(itemTotal);

      return {
        productVariantId: orderProduct.id,
        quantity: orderProduct.quantity,
        price: price, // đơn giá
        productId: variant.productId,
      };
    });

    // Calculate tax (10% = 0.1)
    const tax = new Decimal(0.1);

    // Apply voucher discount if provided
    let discountAmount = new Decimal(0);
    let voucher: any = null;
    if (dto.voucherCode) {
      voucher = await (this.prisma as any).voucher.findUnique({
        where: { code: dto.voucherCode },
      });

      if (!voucher) {
        throw new NotFoundException('Voucher không tồn tại');
      }

      const voucherAmount = new Decimal(voucher.amount);
      // Không cho giảm quá tổng tiền
      discountAmount = voucherAmount.greaterThan(totalPrice)
        ? totalPrice
        : voucherAmount;
      totalPrice = totalPrice.sub(discountAmount);
    }

    // Create order with orderToProducts (and voucher) in a transaction
    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await (tx as any).order.create({
        data: {
          userId: userId,
          totalPrice: totalPrice,
          tax: tax,
          voucherCode: dto.voucherCode ?? null,
          orderToProducts: {
            create: orderToProductsData,
          },
          orderVouchers:
            voucher !== null
              ? {
                  create: [
                    {
                      voucherId: voucher.id,
                    },
                  ],
                }
              : undefined,
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
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          orderToProducts: {
            include: {
              productVariant: {
                select: {
                  id: true,
                  label: true,
                  value: true,
                },
              },
              product: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  images: true,
                  unit: true,
                  category: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
          orderVouchers: {
            include: {
              voucher: true,
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        orderToProducts: {
          include: {
            productVariant: {
              select: {
                id: true,
                label: true,
                value: true,
              },
            },
            product: {
              select: {
                id: true,
                code: true,
                name: true,
                images: true,
                unit: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        orderVouchers: {
          include: {
            voucher: true,
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

  async createVoucher(dto: CreateVoucherDto) {
    const exists = await (this.prisma as any).voucher.findUnique({
      where: { code: dto.code },
    });

    if (exists) {
      throw new NotFoundException('Voucher với mã này đã tồn tại');
    }

    const voucher = await (this.prisma as any).voucher.create({
      data: {
        code: dto.code,
        amount: dto.amount,
        description: dto.description ?? null,
      },
    });

    return voucher;
  }
}
