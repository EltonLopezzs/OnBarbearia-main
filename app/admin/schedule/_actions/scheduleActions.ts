// app/admin/schedule/_actions/scheduleActions.ts
"use server";

import { db } from "@/app/_lib/prisma";
import { authOptions } from "@/app/_lib/auth";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";
import { getManagedBarbershopInfo } from "../../dashboard/page"; // Reutilize

interface OperatingHourData {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isClosed: boolean;
}

// Função de verificação de acesso ajustada
async function getBarbershopIdForSchedule(userId: string, userRole: UserRole | null | undefined): Promise<string> {
  const managedBarbershop = await getManagedBarbershopInfo(userId, userRole);
  if (!managedBarbershop) {
    throw new Error("Usuário não está associado a nenhuma barbearia gerenciável.");
  }
  return managedBarbershop.id;
}

export async function updateOperatingHours(hours: OperatingHourData[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.role) {
    throw new Error("Usuário não autenticado ou sem função definida.");
  }

  // Obtém o ID da barbearia que o usuário logado gerencia
  const barbershopId = await getBarbershopIdForSchedule(session.user.id, session.user.role);

  const transactionOperations = hours.map(hour => {
    const dataToUpsert = {
        startTime: hour.isClosed ? "" : hour.startTime,
        endTime: hour.isClosed ? "" : hour.endTime,
        isClosed: hour.isClosed,
        barbershopId, // Usa o ID da barbearia gerenciada
        dayOfWeek: hour.dayOfWeek,
    };

    return db.operatingHours.upsert({
      where: { barbershopId_dayOfWeek: { barbershopId, dayOfWeek: hour.dayOfWeek } },
      update: dataToUpsert,
      create: dataToUpsert,
    });
  });

  await db.$transaction(transactionOperations);

  revalidatePath(`/admin/schedule`);
  revalidatePath(`/barbershops/${barbershopId}`); // Para informações na página pública da barbearia
  // Se a página de detalhes da barbearia ([id]/page.tsx) exibe horários, revalide-a também:
  revalidatePath(`/barbershops/${barbershopId}`, 'page');
}