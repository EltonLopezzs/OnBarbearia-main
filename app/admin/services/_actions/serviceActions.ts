// app/admin/services/_actions/serviceActions.ts
"use server";

import { db } from "@/app/_lib/prisma";
import { authOptions } from "@/app/_lib/auth";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { Prisma, UserRole } from "@prisma/client";
// Importe a função atualizada do dashboard ou defina-a aqui
import { getManagedBarbershopInfo } from "../../dashboard/page";


interface ServiceData {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

async function verifyAccessAndGetBarbershopId(
  userId: string,
  userRole: UserRole | null | undefined,
  expectedBarbershopIdFromRequest?: string // ID da barbearia que a action espera operar
): Promise<string> {
  const managedBarbershop = await getManagedBarbershopInfo(userId, userRole);

  if (!managedBarbershop) {
    throw new Error("Usuário não está associado a nenhuma barbearia gerenciável.");
  }

  // Se a action recebeu um ID de barbearia específico (ex: ao criar um serviço para uma barbearia X),
  // verifica se é a mesma que o usuário gerencia.
  if (expectedBarbershopIdFromRequest && managedBarbershop.id !== expectedBarbershopIdFromRequest) {
    console.warn(`Tentativa de acesso indevido: User ${userId} (gerencia ${managedBarbershop.id}) tentou operar na barbershop ${expectedBarbershopIdFromRequest}`);
    throw new Error("Operação não permitida para esta barbearia. Você não gerencia a barbearia especificada.");
  }

  return managedBarbershop.id; // Retorna o ID da barbearia que o usuário de fato gerencia.
}

export async function createService(barbershopIdFromForm: string, data: ServiceData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.role) {
    throw new Error("Usuário não autenticado ou sem função definida.");
  }

  // A `barbershopIdFromForm` é o ID da barbearia onde o serviço deve ser criado.
  // A função `verifyAccessAndGetBarbershopId` irá confirmar se o usuário logado
  // realmente gerencia esta `barbershopIdFromForm`.
  const managedBarbershopId = await verifyAccessAndGetBarbershopId(session.user.id, session.user.role, barbershopIdFromForm);

  // Agora podemos usar `managedBarbershopId` com segurança, pois foi validado.
  const service = await db.service.create({
    data: {
      ...data,
      price: new Prisma.Decimal(data.price),
      barbershopId: managedBarbershopId, // Usa o ID validado
    },
  });
  revalidatePath(`/admin/services`);
  revalidatePath(`/barbershops/${managedBarbershopId}`);
  return service;
}

export async function updateService(serviceId: string, barbershopIdFromForm: string, data: Partial<ServiceData>) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.role) {
    throw new Error("Usuário não autenticado ou sem função definida.");
  }

  const managedBarbershopId = await verifyAccessAndGetBarbershopId(session.user.id, session.user.role, barbershopIdFromForm);

  const existingService = await db.service.findFirst({
      where: { id: serviceId, barbershopId: managedBarbershopId } // Garante que o serviço pertence à barbearia gerenciada
  });

  if (!existingService) {
      throw new Error("Serviço não encontrado ou não pertence à sua barbearia.");
  }

  const updatedService = await db.service.update({
    where: { id: serviceId }, // serviceId já é suficiente aqui porque já validamos a posse acima
    data: {
      ...data,
      ...(data.price !== undefined && { price: new Prisma.Decimal(data.price) }),
    },
  });
  revalidatePath(`/admin/services`);
  revalidatePath(`/barbershops/${managedBarbershopId}`);
  return updatedService;
}

export async function deleteService(serviceId: string, barbershopIdFromRequest: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.role) {
    throw new Error("Usuário não autenticado ou sem função definida.");
  }

  const managedBarbershopId = await verifyAccessAndGetBarbershopId(session.user.id, session.user.role, barbershopIdFromRequest);

   const existingService = await db.service.findFirst({
    where: { id: serviceId, barbershopId: managedBarbershopId }
  });
  if (!existingService) {
      throw new Error("Serviço não encontrado ou não pertence à sua barbearia.");
  }

  const bookingsExist = await db.booking.findFirst({
    where: { serviceId: serviceId, date: { gte: new Date() } }
  });

  if (bookingsExist) {
    throw new Error("Não é possível excluir. Existem agendamentos futuros para este serviço.");
  }

  await db.service.delete({ where: { id: serviceId } });

  revalidatePath(`/admin/services`);
  revalidatePath(`/barbershops/${managedBarbershopId}`);
}