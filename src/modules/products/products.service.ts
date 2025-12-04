import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma, type Product } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductVariantsDto } from './dto/update-product-variants.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async createProduct(dto: CreateProductDto): Promise<Product> {
    if (!dto.variants || dto.variants.length === 0) {
      throw new BadRequestException(
        'Sản phẩm phải có ít nhất một biến thể (variant)',
      );
    }

    return this.prisma.$transaction(async (tx: any) => {
      const category = await tx.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new NotFoundException('Category không tồn tại');
      }

      const product = await tx.product.create({
        data: {
          name: dto.name,
          code: await this.generateProductCode(),
          images: dto.images,
          unit: dto.unit,
          categoryId: dto.categoryId,
        },
      });

      await tx.productVariant.createMany({
        data: dto.variants.map((variant) => ({
          productId: product.id,
          label: 'size',
          value: variant.value,
          price: variant.price,
        })),
      });

      return product;
    });
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
        include: {
          variants: {
            where: {
              deletedAt: null,
            },
          } as any,
        } as any,
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
    return this.prisma.$transaction(async (tx: any) => {
      const existing = await tx.product.findUnique({ where: { id } });
      if (!existing || (existing as any).deletedAt) {
        throw new NotFoundException('Sản phẩm không tồn tại');
      }

      if (typeof dto.categoryId !== 'undefined') {
        const category = await tx.category.findUnique({
          where: { id: dto.categoryId },
        });
        if (!category) {
          throw new NotFoundException('Category không tồn tại');
        }
      }

      const updated = await tx.product.update({
        where: { id },
        data: {
          name: dto.name ?? existing.name,
          images: dto.images ?? existing.images,
          unit: dto.unit ?? existing.unit,
          categoryId:
            typeof dto.categoryId !== 'undefined'
              ? dto.categoryId
              : existing.categoryId,
        },
      });
      return updated;
    });
  }

  async updateProductVariants(dto: UpdateProductVariantsDto): Promise<void> {
    await this.prisma.$transaction(async (tx: any) => {
      const product = await tx.product.findUnique({
        where: { id: dto.productId },
        include: {
          variants: {
            where: {
              deletedAt: null,
            },
          } as any,
        } as any,
      });

      if (!product || (product as any).deletedAt) {
        throw new NotFoundException('Sản phẩm không tồn tại');
      }

      if (!dto.variants || dto.variants.length === 0) {
        throw new BadRequestException(
          'Sản phẩm phải có ít nhất một biến thể (variant)',
        );
      }

      const existingVariants = (product as any).variants as {
        id: number;
        value: string;
      }[];
      const payloadIds = dto.variants
        .map((v) => v.id)
        .filter((id): id is number => typeof id === 'number');

      // Soft delete các variants không còn trong payload
      const idsToDelete = existingVariants
        .map((v) => v.id)
        .filter((id) => !payloadIds.includes(id));

      if (idsToDelete.length > 0) {
        await tx.productVariant.updateMany({
          where: { id: { in: idsToDelete } },
          data: {
            deletedAt: new Date(),
          },
        });
      }

      // Update các variants có id
      const variantsToUpdate = dto.variants.filter(
        (variant) => typeof variant.id === 'number',
      );
      for (const variant of variantsToUpdate) {
        await tx.productVariant.update({
          where: { id: variant.id },
          data: {
            value: variant.value,
            price: variant.price,
          },
        });
      }

      // Tạo mới các variants không có id
      const existingValues = existingVariants.map((v) => v.value);

      const variantsToCreate = dto.variants.filter(
        (variant) =>
          typeof variant.id !== 'number' &&
          !existingValues.includes(variant.value),
      );
      if (variantsToCreate.length > 0) {
        await tx.productVariant.createMany({
          data: variantsToCreate.map((variant) => ({
            productId: dto.productId,
            label: 'size',
            value: variant.value,
            price: variant.price,
          })),
        });
      }
    });
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
