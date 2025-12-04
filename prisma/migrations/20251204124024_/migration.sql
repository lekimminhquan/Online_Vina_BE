/*
  Warnings:

  - You are about to drop the column `priceNew` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `priceOld` on the `products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."product_variants" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."products" DROP COLUMN "priceNew",
DROP COLUMN "priceOld";
