// app/admin/layout.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/app/_components/ui/button";
import Header from "@/app/_components/header";
import Footer from "@/app/_components/footer";
import { Package, CalendarDays, LayoutDashboard, Users, Settings } from "lucide-react";
import AdminSignOutButton from "./_components/AdminSignOutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // ADICIONE ESTE CONSOLE.LOG
  console.log("[LAYOUT.TSX] Role do usuário na sessão:", session?.user?.role);

  if (!session?.user || (session.user.role !== "OWNER" && session.user.role !== "BARBER")) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <Header />
      <div className="flex flex-1 pt-4 px-4 md:px-6">
        <aside className="hidden md:flex w-72 flex-col gap-4 bg-card p-6 rounded-lg shadow-sm border">
          <h2 className="text-2xl font-bold text-foreground mb-4 border-b pb-3">
            Painel Admin
          </h2>
          <nav className="flex flex-col space-y-2">
            <Button variant="ghost" className="justify-start text-md p-3 hover:bg-accent" asChild>
              <Link href="/admin/dashboard">
                <LayoutDashboard className="mr-3 h-5 w-5 text-primary" />
                Dashboard
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start text-md p-3 hover:bg-accent" asChild>
              <Link href="/admin/services">
                <Package className="mr-3 h-5 w-5 text-primary" />
                Serviços
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start text-md p-3 hover:bg-accent" asChild>
              <Link href="/admin/schedule">
                <CalendarDays className="mr-3 h-5 w-5 text-primary" />
                Horários
              </Link>
            </Button>
            {/* A CONDIÇÃO AQUI TAMBÉM FOI ALTERADA */}
            {session.user.role === "OWNER" && (
                 <>
                    <Button variant="ghost" className="justify-start text-md p-3 hover:bg-accent" asChild>
                        <Link href="/admin/barbers">
                            <Users className="mr-3 h-5 w-5 text-primary" />
                            Barbeiros
                        </Link>
                    </Button>
                    <Button variant="ghost" className="justify-start text-md p-3 hover:bg-accent" asChild>
                        <Link href="/admin/settings">
                            <Settings className="mr-3 h-5 w-5 text-primary" />
                            Configurações
                        </Link>
                    </Button>
                 </>
            )}
          </nav>
          <div className="mt-auto pt-10">
             <AdminSignOutButton />
          </div>
        </aside>
        <main className="flex-1 p-0 md:p-6 md:pl-10">
            <div className="bg-card p-6 rounded-lg shadow-sm border min-h-full">
                {children}
            </div>
        </main>
      </div>
      <div className="mt-8">
        <Footer />
      </div>
    </div>
  );
}