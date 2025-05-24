-- AlterTable
ALTER TABLE "User" ADD COLUMN     "managedBarbershopId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_managedBarbershopId_fkey" FOREIGN KEY ("managedBarbershopId") REFERENCES "Barbershop"("id") ON DELETE SET NULL ON UPDATE CASCADE;
