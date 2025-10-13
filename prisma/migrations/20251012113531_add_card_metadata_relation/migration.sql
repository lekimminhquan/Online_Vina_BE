-- AddForeignKey
ALTER TABLE "public"."cards" ADD CONSTRAINT "cards_page_fkey" FOREIGN KEY ("page") REFERENCES "public"."meta_data"("page") ON DELETE RESTRICT ON UPDATE CASCADE;
