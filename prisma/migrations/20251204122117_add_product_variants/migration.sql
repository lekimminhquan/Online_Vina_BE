/*
  Warnings:

  - You are about to drop the column `sizes` on the `products` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."UserType" ADD VALUE 'coffeeSeller';
ALTER TYPE "public"."UserType" ADD VALUE 'coffeeAdmin';

-- AlterTable
ALTER TABLE "public"."products" DROP COLUMN "sizes";

-- CreateTable
CREATE TABLE "public"."product_variants" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "label" TEXT NOT NULL DEFAULT 'size',
    "value" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."product_variants" ADD CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
