/*
  Warnings:

  - Added the required column `createdById` to the `Store` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "createdById" TEXT;

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Atualiza os registros existentes usando o primeiro usuário do sistema
UPDATE "Store" s
SET "createdById" = (SELECT id FROM "User" ORDER BY "createdAt" ASC LIMIT 1)
WHERE s."createdById" IS NULL;

-- Torna o campo obrigatório
ALTER TABLE "Store" ALTER COLUMN "createdById" SET NOT NULL;
