/*
  Warnings:

  - Added the required column `productVariantId` to the `order_to_products` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."order_to_products" DROP CONSTRAINT "order_to_products_productId_fkey";

-- AlterTable
ALTER TABLE "public"."order_to_products" ADD COLUMN     "productVariantId" INTEGER NOT NULL,
ALTER COLUMN "productId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."order_to_products" ADD CONSTRAINT "order_to_products_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "public"."product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_to_products" ADD CONSTRAINT "order_to_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
