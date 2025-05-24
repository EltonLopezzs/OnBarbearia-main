// app/admin/schedule/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";
import { db } from "@/app/_lib/prisma";
import ScheduleForm from "./_components/ScheduleForm";
import { getManagedBarbershopInfo } from "../dashboard/page"; // Reutilize
import { Alert, AlertDescription, AlertTitle } from "@/app/_components/ui/alert";
import { Terminal } from "lucide-react";

export default async function AdminSchedulePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.role) {
    return <p className="text-red-500">Acesso negado.</p>;
  }

  const managedBarbershop = await getManagedBarbershopInfo(session.user.id, session.user.role);

  if (!managedBarbershop) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Associação de Barbearia Pendente!</AlertTitle>
        <AlertDescription>
          Você não está associado a nenhuma barbearia para gerenciar horários. Contate o administrador.
        </AlertDescription>
      </Alert>
    );
  }

  const operatingHours = await db.operatingHours.findMany({
    where: { barbershopId: managedBarbershop.id },
    orderBy: { dayOfWeek: "asc" },
  });

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b">
        <h1 className="text-3xl font-bold text-foreground">Gerenciar Horários de Funcionamento</h1>
        <p className="text-muted-foreground">Defina os dias e horários em que &quot;{managedBarbershop.name}&quot; estará aberta.</p>
      </div>
      <ScheduleForm initialHours={operatingHours} />
    </div>
  );
}