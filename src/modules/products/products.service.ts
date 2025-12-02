import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma, type Product } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async createProduct(dto: CreateProductDto): Promise<Product> {
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category không tồn tại');
    }

    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        code: await this.generateProductCode(),
        priceOld: dto.priceOld,
        priceNew: dto.priceNew,
        images: dto.images,
        unit: dto.unit,
        categoryId: dto.categoryId,
        sizes: dto.sizes,
      },
    });

    return product;
  }

  async listProducts(params?: {
    q?: string;
    page?: number;
    page_size?: number;
    categoryId?: number;
  }) {
    const page = Math.max(1, params?.page ?? 1);
    const pageSize = Math.max(1, Math.min(200, params?.page_size ?? 20));
    const skip = (page - 1) * pageSize;

    const whereConditions: Prisma.ProductWhereInput[] = [
      {
        // dùng any vì prisma client có thể chưa update field deletedAt
        ...({ deletedAt: null } as any),
      },
    ];

    // Tìm kiếm theo tên hoặc mã sản phẩm
    if (params?.q) {
      whereConditions.push({
        OR: [
          {
            name: {
              contains: params.q,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            code: {
              contains: params.q,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      });
    }

    // Lọc theo categoryId
    if (typeof params?.categoryId !== 'undefined') {
      whereConditions.push({
        categoryId: params.categoryId,
      });
    }

    const where: Prisma.ProductWhereInput | undefined =
      whereConditions.length > 0 ? { AND: whereConditions } : undefined;

    const [total, products] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy: { id: 'desc' },
        skip,
        take: pageSize,
      }),
    ]);

    return {
      total,
      page,
      page_size: pageSize,
      results: products,
    };
  }

  async deleteProduct(id: number): Promise<void> {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing || (existing as any).deletedAt) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    await this.prisma.product.update({
      where: { id },
      data: {
        // cast any để tránh lỗi type khi prisma client chưa có trường deletedAt
        deletedAt: new Date(),
      } as any,
    });
  }

  async updateProduct(id: number, dto: UpdateProductDto): Promise<Product> {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing || (existing as any).deletedAt) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category không tồn tại');
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name,
        priceOld: dto.priceOld,
        priceNew: dto.priceNew,
        images: dto.images,
        unit: dto.unit,
        categoryId: dto.categoryId,
        sizes: dto.sizes,
      },
    });

    return updated;
  }

  private async generateProductCode(): Promise<string> {
    const last = await this.prisma.product.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true },
    });
    const nextId = (last?.id ?? 0) + 1;
    return `P${nextId.toString().padStart(6, '0')}`;
  }
}
