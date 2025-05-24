// app/admin/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";
import { db } from "@/app/_lib/prisma";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/app/_components/ui/card";
import Link from "next/link";
import { UserRole } from "@prisma/client";
import { Alert, AlertDescription, AlertTitle } from "@/app/_components/ui/alert"; // Importação correta
import { Terminal, CalendarDays, Users, Package } from "lucide-react";
import { Button } from "@/app/_components/ui/button"; // Importação correta

// Função para obter informações da barbearia gerenciada (Opção B)
export async function getManagedBarbershopInfo(userId: string, userRole: UserRole | null | undefined): Promise<{ id: string; name: string } | null> {
  if (!userId || !userRole) {
    console.log("getManagedBarbershopInfo: userId ou userRole ausente.");
    return null;
  }

  if (userRole === UserRole.OWNER || userRole === UserRole.BARBER) {
    const userWithManagedBarbershop = await db.user.findUnique({
      where: { id: userId },
      select: { // Este select está correto para buscar a barbearia relacionada
        managedBarbershopId: true, // Bom para debug, mostra o ID no banco
        managedBarbershop: {       // Esta é a relação que o Prisma resolverá
          select: {
            id: true,
            name: true,
          },
        },
        role: true, // Para debug
        name: true, // Nome do usuário, para debug
      },
    });
    // Este console.log é muito útil para depurar no terminal do servidor Next.js
    console.log("User com managedBarbershop buscado:", JSON.stringify(userWithManagedBarbershop, null, 2));

    if (userWithManagedBarbershop?.managedBarbershop) {
      console.log("Barbearia gerenciada encontrada:", userWithManagedBarbershop.managedBarbershop);
      return {
        id: userWithManagedBarbershop.managedBarbershop.id,
        name: userWithManagedBarbershop.managedBarbershop.name,
      };
    } else {
      // Esta mensagem ajudará a identificar se o managedBarbershopId está nulo ou inválido no banco
      console.log(`Nenhuma barbearia gerenciada encontrada para o usuário ${userId}. managedBarbershopId no DB: ${userWithManagedBarbershop?.managedBarbershopId}`);
    }
  } else {
    console.log(`Role ${userRole} não permite gerenciamento.`);
  }
  console.log("getManagedBarbershopInfo retornando null ao final.");
  return null;
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return <p className="text-red-500">Acesso negado. Usuário não autenticado.</p>;
  }

  const managedBarbershop = await getManagedBarbershopInfo(session.user.id, session.user.role);

  // Esta lógica para exibir o alerta se nenhuma barbearia for encontrada está correta
  if (!managedBarbershop) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto my-10">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Associação de Barbearia Pendente!</AlertTitle>
        <AlertDescription>
          Você está logado como {session.user.role === UserRole.OWNER ? "Proprietário(a)" : "Barbeiro(a)"}, mas sua conta de usuário não está associada a nenhuma barbearia específica no sistema para gerenciamento.
          <br /><br />
          <strong>Ação Necessária:</strong> Peça ao administrador do sistema (ou quem tem acesso direto ao banco de dados Supabase) para editar seu registro na tabela "User" e preencher o campo `managedBarbershopId` com o ID da barbearia que você deve gerenciar.
        </AlertDescription>
      </Alert>
    );
  }

  // As contagens para o dashboard também parecem corretas
  const upcomingBookingsCount = await db.booking.count({
    where: {
      barbershopId: managedBarbershop.id,
      date: { gte: new Date() }
    }
  });

  const totalServicesCount = await db.service.count({
    where: { barbershopId: managedBarbershop.id }
  });

  const totalBookingsToday = await db.booking.count({
    where: {
        barbershopId: managedBarbershop.id,
        date: {
            gte: new Date(new Date().setHours(0,0,0,0)),
            lt: new Date(new Date().setHours(23,59,59,999)),
        }
    }
  });

  // O JSX para renderizar o dashboard também está correto
  return (
    <div className="space-y-8">
      <div className="pb-4 border-b">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          Painel da <span className="text-primary">{managedBarbershop.name}</span>
        </h1>
        <p className="text-muted-foreground">Bem-vindo(a) de volta, {session.user.name?.split(" ")[0]}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">Agendamentos Hoje</CardTitle>
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">{totalBookingsToday}</div>
            <p className="text-xs text-muted-foreground">
              Total de agendamentos para hoje.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">Próximos Agendamentos</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">{upcomingBookingsCount}</div>
             <p className="text-xs text-muted-foreground mt-1">Agendamentos futuros confirmados.</p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">Serviços Ativos</CardTitle>
            <Package className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">{totalServicesCount}</div>
            <Link href="/admin/services" className="text-xs text-primary hover:underline mt-1 block">
              Gerenciar serviços
            </Link>
          </CardContent>
        </Card>
      </div>

        <Card>
            <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>Acesse rapidamente as principais áreas de gerenciamento.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
                <Link href="/admin/services" className="block">
                    <Button variant="outline" className="w-full justify-start p-6 text-left h-auto">
                        <Package className="mr-3 h-7 w-7 text-primary" />
                        <div>
                            <p className="font-semibold text-md">Gerenciar Serviços</p>
                            <p className="text-xs text-muted-foreground">Adicione, edite ou remova os serviços oferecidos.</p>
                        </div>
                    </Button>
                </Link>
                 <Link href="/admin/schedule" className="block">
                    <Button variant="outline" className="w-full justify-start p-6 text-left h-auto">
                        <CalendarDays className="mr-3 h-7 w-7 text-primary" />
                         <div>
                            <p className="font-semibold text-md">Definir Horários</p>
                            <p className="text-xs text-muted-foreground">Configure seus dias e horários de atendimento.</p>
                        </div>
                    </Button>
                </Link>
            </CardContent>
        </Card>
    </div>
  );
}