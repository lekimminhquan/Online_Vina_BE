-- AlterTable
ALTER TABLE "public"."products" ADD COLUMN     "images" TEXT[],
ADD COLUMN     "priceNew" DECIMAL(65,30),
ADD COLUMN     "priceOld" DECIMAL(65,30);
