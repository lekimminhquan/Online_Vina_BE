-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "voucherCode" TEXT;

-- CreateTable
CREATE TABLE "public"."vouchers" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."order_vouchers" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "voucherId" INTEGER NOT NULL,

    CONSTRAINT "order_vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vouchers_code_key" ON "public"."vouchers"("code");

-- CreateIndex
CREATE UNIQUE INDEX "order_vouchers_orderId_voucherId_key" ON "public"."order_vouchers"("orderId", "voucherId");

-- AddForeignKey
ALTER TABLE "public"."order_vouchers" ADD CONSTRAINT "order_vouchers_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_vouchers" ADD CONSTRAINT "order_vouchers_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "public"."vouchers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
