/*
  Warnings:

  - A unique constraint covering the columns `[page]` on the table `meta_data` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "meta_data_page_key" ON "public"."meta_data"("page");
