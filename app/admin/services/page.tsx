// OnBarbearia-main/app/admin/services/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";
import { db } from "@/app/_lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/_components/ui/card";
import Image from "next/image";
import DeleteServiceButton from "./_components/DeleteServiceButton";
import { AlertTriangle, Terminal } from "lucide-react"; // PlusCircle e Edit3 são usados via iconName
import { getManagedBarbershopInfo } from "../dashboard/page";
import { Alert, AlertDescription, AlertTitle } from "@/app/_components/ui/alert";
import ServiceDialogController from "./_components/ServiceDialogController";
// import { Service } from "@prisma/client"; // Não precisa importar o tipo Service do Prisma aqui se usar SerializableService

// Defina um tipo para o serviço serializável
export interface SerializableService {
  id: string;
  name: string;
  description: string;
  price: number; // Alterado para number
  imageUrl: string | null; // Ajustado para string | null
  barbershopId: string;
  // Adicione quaisquer outros campos escalares do seu modelo Service que ServiceForm possa precisar
}


export default async function AdminServicesPage() {
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
          Você não está associado a nenhuma barbearia para gerenciar serviços. Contate o administrador.
        </AlertDescription>
      </Alert>
    );
  }

  const servicesFromDb = await db.service.findMany({
    where: { barbershopId: managedBarbershop.id },
    orderBy: { name: "asc" },
  });

  // Converta os serviços para um formato serializável ANTES de passá-los para Client Components
  const services: SerializableService[] = servicesFromDb.map(s => ({
    id: s.id,
    name: s.name,
    description: s.description,
    price: Number(s.price), // CONVERSÃO CRUCIAL AQUI
    imageUrl: s.imageUrl || null, // Garanta que seja string ou null
    barbershopId: s.barbershopId,
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciar Serviços</h1>
          <p className="text-muted-foreground">Adicione, edite ou remova os serviços oferecidos em &quot;{managedBarbershop.name}&quot;.</p>
        </div>
        <ServiceDialogController
          barbershopId={managedBarbershop.id}
          triggerButtonText="Adicionar Novo Serviço"
          dialogTitle="Cadastrar Novo Serviço"
          iconName="PlusCircle" // Usando iconName
        />
      </div>

      {services.length === 0 ? (
        <Card className="text-center py-10">
          <CardHeader>
            <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
            <CardTitle className="mt-4">Nenhum Serviço Cadastrado</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Comece adicionando os serviços que sua barbearia oferece clicando no botão &quot;Adicionar Novo Serviço&quot;.
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {services.map((service) => ( // 'service' aqui é do tipo SerializableService
            <Card key={service.id} className="flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className="relative h-48 w-full bg-muted">
                <Image
                  src={service.imageUrl || "/banner.jpg"} // Assumindo que /banner.jpg é uma imagem placeholder válida na sua pasta public
                  alt={service.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <CardContent className="p-5 space-y-3 flex flex-col flex-grow">
                <CardTitle className="text-xl font-semibold">{service.name}</CardTitle>
                <p className="text-sm text-muted-foreground flex-grow min-h-[60px] line-clamp-3">{service.description}</p>
                <p className="text-2xl font-bold text-primary mt-auto">
                  {Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(service.price)} {/* Agora service.price já é number */}
                </p>
                <div className="flex gap-3 mt-4 pt-4 border-t">
                  <ServiceDialogController
                    barbershopId={managedBarbershop.id}
                    service={service} // Passando o objeto service já serializado
                    triggerButtonText="Editar"
                    dialogTitle="Editar Serviço"
                    variant="outline"
                    iconName="Edit3" // Usando iconName
                  />
                  <DeleteServiceButton
                    serviceId={service.id}
                    barbershopId={managedBarbershop.id}
                    serviceName={service.name}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}